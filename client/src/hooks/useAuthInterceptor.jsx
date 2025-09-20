import { useEffect, useRef } from "react";
import axios from "axios";
import api from "../services/api";

// const api = axios.create({
//     baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
// });

export const useAuthInterceptor = ({
    accessToken,
    refreshToken,
    setAccessToken,
    logout,
}) => {
    const refreshTimeout = useRef(null);

    // Attach interceptors
    useEffect(() => {
        const reqInterceptor = api.interceptors.request.use(
            (config) => {
                if (accessToken) {
                    config.headers.Authorization = `Bearer ${accessToken}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        const resInterceptor = api.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;
                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;
                    try {
                        const { data } = await axios.post(
                            `${api.defaults.baseURL}/auth/refresh`,
                            { refreshToken }
                        );
                        setAccessToken(data.accessToken);
                        localStorage.setItem("accessToken", data.accessToken);
                        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
                        return api(originalRequest);
                    } catch (err) {
                        console.error("❌ Refresh failed, logging out");
                        logout();
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => {
            api.interceptors.request.eject(reqInterceptor);
            api.interceptors.response.eject(resInterceptor);
        };
    }, [accessToken, refreshToken, setAccessToken, logout]);

    // Proactive auto-refresh on activity
    useEffect(() => {
        if (!refreshToken) return;

        const scheduleRefresh = () => {
            clearTimeout(refreshTimeout.current);
            // Refresh 5 minutes before expiry (assuming 1h lifetime)
            refreshTimeout.current = setTimeout(async () => {
                try {
                    const { data } = await axios.post(
                        `${api.defaults.baseURL}/auth/refresh`,
                        { refreshToken }
                    );
                    setAccessToken(data.accessToken);
                    localStorage.setItem("accessToken", data.accessToken);
                } catch (err) {
                    console.error("❌ Auto-refresh failed");
                    logout();
                }
            }, 55 * 60 * 1000); // 55 min
        };

        // Schedule refresh initially
        scheduleRefresh();

        // Reset timer on activity
        const resetOnActivity = () => scheduleRefresh();
        window.addEventListener("mousemove", resetOnActivity);
        window.addEventListener("keydown", resetOnActivity);
        window.addEventListener("click", resetOnActivity);

        return () => {
            clearTimeout(refreshTimeout.current);
            window.removeEventListener("mousemove", resetOnActivity);
            window.removeEventListener("keydown", resetOnActivity);
            window.removeEventListener("click", resetOnActivity);
        };
    }, [refreshToken, setAccessToken, logout]);

    return api;
};
