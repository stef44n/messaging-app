import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import {
    getConversation,
    sendMessage,
    deleteMessage,
} from "../services/messages";
import { useAuth } from "../context/AuthContext";

export default function Chat() {
    const { userId } = useParams();
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [recipient, setRecipient] = useState(null);
    const messagesEndRef = useRef(null);
    const lastMessageIdRef = useRef(null); // 👈 track last message

    // Fetch conversation
    const fetchMessages = async () => {
        try {
            const data = await getConversation(userId);
            const newMessages = data.messages || [];

            // If there's a new message since last fetch → scroll
            if (
                newMessages.length > 0 &&
                newMessages[newMessages.length - 1].id !==
                    lastMessageIdRef.current
            ) {
                lastMessageIdRef.current =
                    newMessages[newMessages.length - 1].id;
                setMessages(newMessages);
                // Auto-scroll only when new message arrives
                setTimeout(() => {
                    messagesEndRef.current?.scrollIntoView({
                        behavior: "smooth",
                    });
                }, 50);
            } else {
                setMessages(newMessages);
            }

            if (newMessages.length > 0) {
                const otherUser =
                    newMessages[0].sender.id === user.id
                        ? newMessages[0].recipient
                        : newMessages[0].sender;
                setRecipient(otherUser);
            }
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
            setMessages((prev) => [...prev, newMsg]);

            lastMessageIdRef.current = newMsg.id; // track last message
            setInput("");

            // Scroll on send
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 50);
        } catch (err) {
            console.error("Failed to send message:", err);
        }
    };

    const handleDelete = async (messageId) => {
        try {
            const res = await deleteMessage(messageId);
            setMessages((prev) =>
                prev.map((m) =>
                    m.id === messageId ? { ...m, ...res.message } : m
                )
            );
        } catch (err) {
            console.error("Failed to delete message:", err);
        }
    };

    function formatMessage(text) {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.split(urlRegex).map((part, i) => {
            if (urlRegex.test(part)) {
                return (
                    <a
                        key={i}
                        href={part}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-300 underline break-words"
                    >
                        {part}
                    </a>
                );
            }
            return part;
        });
    }

    return (
        <div className="max-w-md mx-auto p-6 flex flex-col h-screen">
            <h1 className="text-2xl font-bold mb-4">
                {recipient ? `Chat with ${recipient.username}` : "Chat"}
            </h1>

            <div className="flex-1 overflow-y-auto border p-3 rounded bg-gray-50 space-y-3">
                {(!messages || messages.length === 0) && (
                    <p>No messages yet.</p>
                )}
                {messages.map((msg) => {
                    const isMe = msg.senderId === user.id;
                    const isRead = !!msg.readAt;
                    const isDeleted = !!msg.deletedAt;

                    return (
                        <div
                            key={msg.id || msg.createdAt}
                            className={`relative p-2 rounded max-w-xs group ${
                                isMe
                                    ? "bg-blue-500 text-white self-end ml-auto"
                                    : "bg-gray-200 text-black"
                            }`}
                        >
                            <p
                                className={`${
                                    isDeleted ? "italic opacity-70" : ""
                                } break-words whitespace-pre-wrap`}
                            >
                                {isDeleted
                                    ? "This message was deleted"
                                    : formatMessage(msg.body)}
                            </p>

                            <div
                                className={`flex items-center gap-1 mt-1 text-xs opacity-70 ${
                                    isMe ? "justify-end" : "justify-start"
                                }`}
                            >
                                <span>
                                    {new Date(msg.createdAt).toLocaleTimeString(
                                        [],
                                        { hour: "2-digit", minute: "2-digit" }
                                    )}
                                </span>
                                {isMe && !isDeleted && (
                                    <span>{isRead ? "✅✅" : "✅"}</span>
                                )}
                            </div>

                            {isMe && !isDeleted && (
                                <button
                                    onClick={() => handleDelete(msg.id)}
                                    className="absolute top-1 right-1 text-xs text-red-300 opacity-0 group-hover:opacity-100 transition"
                                    title="Delete message"
                                >
                                    ❌
                                </button>
                            )}
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
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
