import axios from "axios";

// const API_BASE_URL =
//     import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Automatically add JWT token if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
