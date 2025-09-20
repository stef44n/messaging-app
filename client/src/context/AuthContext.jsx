import { createContext, useContext, useState, useEffect } from "react";
import {
    getProfile,
    login as apiLogin,
    logout as apiLogout,
} from "../services/auth";

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

    // --- Check profile on mount / token change ---
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

    // --- Login ---
    const login = async (credentials) => {
        const data = await apiLogin(credentials);

        setAccessToken(data.accessToken);
        setRefreshToken(data.refreshToken);

        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);

        const profile = await getProfile();
        setUser(profile.user);
    };

    // --- Logout ---
    const logout = () => {
        apiLogout();
        setAccessToken(null);
        setRefreshToken(null);
        setUser(null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
    };

    return (
        <AuthContext.Provider
            value={{
                accessToken,
                refreshToken,
                setAccessToken, // 👈 used by axios interceptor after refresh
                user,
                login,
                logout,
                loading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
