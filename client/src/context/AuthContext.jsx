import { createContext, useContext, useState, useEffect } from "react";
import {
    getProfile,
    login as apiLogin,
    logout as apiLogout,
} from "../services/auth";
import { useAuthInterceptor } from "../hooks/useAuthInterceptor";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [accessToken, setAccessToken] = useState(
        localStorage.getItem("accessToken")
    );
    const [refreshToken, setRefreshToken] = useState(
        localStorage.getItem("refreshToken")
    );
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // --- Fetch profile on mount / token change ---
    useEffect(() => {
        const initAuth = async () => {
            if (accessToken) {
                try {
                    const data = await getProfile();
                    setUser(data.user);
                } catch (err) {
                    console.error("Failed to fetch profile:", err);
                    setUser(null);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        };
        initAuth();
    }, [accessToken]);

    // --- Login via credentials (API call) ---
    const handleLogin = async (credentials) => {
        const data = await apiLogin(credentials);
        setSession(data.accessToken, data.refreshToken, data.user);
    };

    // --- Directly set session (used after Login.jsx) ---
    const setSession = (access, refresh, userData) => {
        setAccessToken(access);
        setRefreshToken(refresh);
        setUser(userData);
        localStorage.setItem("accessToken", access);
        localStorage.setItem("refreshToken", refresh);
        localStorage.setItem("user", JSON.stringify(userData));
    };

    // --- Logout ---
    const logout = () => {
        apiLogout();
        setAccessToken(null);
        setRefreshToken(null);
        setUser(null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
    };

    // --- Attach interceptor ---
    useAuthInterceptor({
        accessToken,
        refreshToken,
        setAccessToken,
        logout,
    });

    return (
        <AuthContext.Provider
            value={{
                accessToken,
                refreshToken,
                user,
                loading,
                setSession,
                handleLogin,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
