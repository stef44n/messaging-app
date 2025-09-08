import api from "./api";

// 📬 Get inbox (list of conversations)
export const getInbox = async () => {
    const res = await api.get("/messages/inbox");
    return res.data; // ✅ now directly the array
};

// 💬 Get conversation with a user
export const getConversation = async (userId) => {
    const res = await api.get(`/messages/${userId}`);
    return res.data; // ✅ now directly the array
};

// Send a message
export const sendMessage = async (recipientId, body) => {
    const res = await api.post(`/messages/${recipientId}`, { body });
    return res.data; // ✅ now it's the message object
};

export const deleteMessage = async (messageId) => {
    const res = await api.delete(`/messages/${messageId}`);
    return res.data;
};
