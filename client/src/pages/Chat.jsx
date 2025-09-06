import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getConversation, sendMessage } from "../services/messages";
import { useAuth } from "../context/AuthContext";

export default function Chat() {
    const { userId } = useParams(); // recipient’s id
    const { user } = useAuth(); // current logged-in user
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");

    // Fetch conversation
    const fetchMessages = async () => {
        try {
            const data = await getConversation(userId);
            setMessages(data || []); // now always an array
            console.log(data);
        } catch (err) {
            console.error("Failed to fetch conversation:", err);
            setMessages([]);
        }
    };

    // Load messages on mount + poll every 5s
    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [userId]);

    // Send new message
    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        try {
            const newMsg = await sendMessage(userId, input);

            setMessages((prev) => [...prev, newMsg]); // ✅ use returned message

            setInput("");
        } catch (err) {
            console.error("Failed to send message:", err);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 flex flex-col h-screen">
            <h1 className="text-2xl font-bold mb-4">Chat with User {userId}</h1>

            <div className="flex-1 overflow-y-auto border p-3 rounded bg-gray-50 space-y-2">
                {(!messages || messages.length === 0) && (
                    <p>No messages yet.</p>
                )}
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`p-2 rounded max-w-xs ${
                            msg.senderId === user?.id
                                ? "bg-blue-500 text-white self-end ml-auto"
                                : "bg-gray-200 text-black"
                        }`}
                    >
                        {msg.body}
                    </div>
                ))}
            </div>

            <form onSubmit={handleSend} className="flex mt-3">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 border rounded-l p-2"
                    placeholder="Type a message..."
                />
                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 rounded-r"
                >
                    Send
                </button>
            </form>
        </div>
    );
}
