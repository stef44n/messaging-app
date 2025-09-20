import api from "./api";

// --- Signup ---
export const signup = async (data) => {
    const res = await api.post("/auth/signup", data);
    return res.data; // { message, user }
};

// --- Login ---
export const login = async (data) => {
    const res = await api.post("/auth/login", data);

    const { accessToken, refreshToken, user } = res.data;

    if (!accessToken || !refreshToken) {
        throw new Error("No token returned from server");
    }

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);

    return { accessToken, refreshToken, user };
};

// --- Logout ---
export const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
};

// --- Get profile (protected) ---
export const getProfile = async () => {
    const res = await api.get("/profile");
    return res.data; // { user }
};

// --- Update profile ---
export const updateProfile = async (profileData) => {
    const res = await api.put("/profile", profileData);
    return res.data; // { message, user }
};

// --- Refresh Access Token ---
export const refreshAccessToken = async () => {
    const storedRefreshToken = localStorage.getItem("refreshToken");

    if (!storedRefreshToken) {
        throw new Error("No refresh token found");
    }

    const res = await api.post("/auth/refresh", {
        refreshToken: storedRefreshToken,
    });

    const { accessToken } = res.data;

    if (accessToken) {
        localStorage.setItem("accessToken", accessToken);
    }

    return accessToken;
};
