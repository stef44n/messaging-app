import { useEffect, useRef } from "react";
import api from "../services/api";

export const useAuthInterceptor = ({
    accessToken,
    refreshToken,
    setAccessToken,
    logout,
}) => {
    const refreshTimeout = useRef(null);

    // Attach interceptors
    useEffect(() => {
        console.log("🔌 Setting up interceptors with token:", accessToken);

        const reqInterceptor = api.interceptors.request.use(
            (config) => {
                console.log(
                    "📤 Request:",
                    config.url,
                    "Auth:",
                    config.headers.Authorization
                );
                if (accessToken) {
                    config.headers.Authorization = `Bearer ${accessToken}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        const resInterceptor = api.interceptors.response.use(
            (response) => {
                console.log(
                    "📥 Response:",
                    response.config.url,
                    response.status
                );
                return response;
            },
            async (error) => {
                console.warn(
                    "❗ Response error caught",
                    error?.response?.status
                );
                const originalRequest = error.config;

                if (error.response?.status === 401 && !originalRequest._retry) {
                    console.warn(
                        "⚠️ Interceptor caught 401, attempting refresh..."
                    );
                    originalRequest._retry = true;

                    try {
                        const { data } = await api.post(
                            `${api.defaults.baseURL}/auth/refresh`,
                            { refreshToken }
                        );

                        console.log(
                            "✅ Refresh success, new accessToken:",
                            data.accessToken
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
                    const { data } = await api.post(
                        `${api.defaults.baseURL}/auth/refresh`,
                        { refreshToken }
                    );
                    setAccessToken(data.accessToken);
                    localStorage.setItem("accessToken", data.accessToken);
                } catch (err) {
                    console.error("❌ Auto-refresh failed");
                    logout();
                }
            }, 14 * 60 * 1000); // 14 min
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
