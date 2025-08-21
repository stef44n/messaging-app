import api from "./api";

// Get inbox (list of conversations)
export const getInbox = async () => {
    const res = await api.get("/messages/inbox");
    return res.data;
};

// Get conversation with a user
export const getConversation = async (userId) => {
    const res = await api.get(`/messages/${userId}`);
    return res.data;
};

// Send a message
export const sendMessage = async (recipientId, body) => {
    const res = await api.post(`/messages/${recipientId}`, { body });
    return res.data;
};
