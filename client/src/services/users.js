import api from "./api";

export const searchUsers = async (query) => {
    const res = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
    return res.data;
};
