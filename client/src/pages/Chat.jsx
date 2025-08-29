import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getConversation, sendMessage } from "../services/messages";

export default function Chat() {
    const { userId } = useParams();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");

    // Load conversation
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const data = await getConversation(userId);
                setMessages(data.messages);
            } catch (err) {
                console.error(err);
            }
        };
        fetchMessages();
    }, [userId]);

    // Send new message
    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        try {
            await sendMessage(userId, input);
            setMessages([
                ...messages,
                { body: input, senderId: "me", createdAt: new Date() },
            ]);
            setInput("");
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 flex flex-col h-screen">
            <h1 className="text-2xl font-bold mb-4">Chat</h1>

            <div className="flex-1 overflow-y-auto border p-3 rounded bg-gray-50 space-y-2">
                {messages.length === 0 && <p>No messages yet.</p>}
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`p-2 rounded max-w-xs ${
                            msg.senderId === "me"
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
