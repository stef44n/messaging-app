import { createContext, useContext, useState, useEffect } from "react";
import {
    getProfile,
    login as apiLogin,
    logout as apiLogout,
} from "../services/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [user, setUser] = useState(null);

    useEffect(() => {
        if (token) {
            getProfile()
                .then((data) => setUser(data.user))
                .catch(() => setUser(null));
        } else {
            setUser(null);
        }
    }, [token]);

    const login = async (credentials) => {
        const data = await apiLogin(credentials);
        setToken(data.token);
        localStorage.setItem("token", data.token);
        const profile = await getProfile();
        setUser(profile.user);
    };

    const logout = () => {
        apiLogout();
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ token, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
