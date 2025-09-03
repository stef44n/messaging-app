import api from "./api";

// Signup
export const signup = async (data) => {
    const res = await api.post("/auth/signup", data);
    return res.data; // expect { token, user }
};

// Login
export const login = async (data) => {
    const res = await api.post("/auth/login", data);

    const { token, user } = res.data;

    if (token) {
        localStorage.setItem("token", token); // persist token
    }

    return { token, user };
};

// Logout
export const logout = () => {
    localStorage.removeItem("token");
};

// Get profile (protected)
export const getProfile = async () => {
    const res = await api.get("/profile");
    return res.data; // expect { user }
};

// Update profile
export const updateProfile = async (profileData) => {
    const res = await api.put("/profile", profileData);
    return res.data; // expect { message, user }
};
