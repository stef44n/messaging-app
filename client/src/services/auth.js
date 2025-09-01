import api from "./api";

// Signup
export const signup = async (data) => {
    const res = await api.post("/auth/signup", data);
    return res.data;
};

// Login
export const login = async (data) => {
    const res = await api.post("/auth/login", data);
    if (res.data.token) {
        localStorage.setItem("token", res.data.token);
    }
    return res.data;
};

// Logout
export const logout = () => {
    localStorage.removeItem("token");
};

// Get profile (protected)
export const getProfile = async () => {
    const res = await api.get("/profile");
    // const res = await api.get("/auth/profile");
    return res.data;
};

export const updateProfile = async (profileData) => {
    const res = await api.put("/profile", profileData);
    return res.data;
};
