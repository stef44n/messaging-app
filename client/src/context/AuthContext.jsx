import { createContext, useContext, useEffect, useState } from "react";
import { getProfile, logout as logoutService } from "../services/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token") || null);
    const [loading, setLoading] = useState(true);

    // On initial load, fetch profile if token exists
    useEffect(() => {
        const fetchUser = async () => {
            if (token) {
                try {
                    const data = await getProfile();
                    setUser(data.user);
                } catch (err) {
                    console.error("Failed to fetch profile", err);
                    setUser(null);
                    setToken(null);
                    localStorage.removeItem("token");
                }
            }
            setLoading(false); // done checking
        };
        fetchUser();
    }, [token]);

    // Called after successful login
    const login = (token, user) => {
        setToken(token);
        localStorage.setItem("token", token);
        if (user) setUser(user);
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        logoutService();
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
