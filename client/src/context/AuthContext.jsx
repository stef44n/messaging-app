import { createContext, useContext, useEffect, useState } from "react";
import { getProfile, logout as logoutService } from "../services/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token") || null);

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
        };
        fetchUser();
    }, [token]);

    // Called from Login.jsx
    const login = (token, user) => {
        setToken(token);
        localStorage.setItem("token", token);
        if (user) {
            setUser(user); // instantly update Navbar
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        logoutService(); // clears localStorage
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
