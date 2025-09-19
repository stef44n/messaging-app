import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import {
    getConversation,
    sendMessage,
    deleteMessage,
} from "../services/messages";
import { useAuth } from "../context/AuthContext";
import { useFeedbackHandler } from "../hooks/useFeedbackHandler";
import Loader from "../components/Loader"; // 👈 import your loader

export default function Chat() {
    const { userId } = useParams();
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [recipient, setRecipient] = useState(null);
    const [loading, setLoading] = useState(true); // 👈 add loading
    const messagesEndRef = useRef(null);
    const lastMessageIdRef = useRef(null);
    const handleError = useFeedbackHandler();

    // Fetch conversation
    const fetchMessages = async () => {
        try {
            setLoading(true); // start loading
            const data = await getConversation(userId);
            const newMessages = data.messages || [];

            if (
                newMessages.length > 0 &&
                newMessages[newMessages.length - 1].id !==
                    lastMessageIdRef.current
            ) {
                lastMessageIdRef.current =
                    newMessages[newMessages.length - 1].id;
                setMessages(newMessages);
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
            handleError(err, "Failed to fetch conversation");
            setMessages([]);
        } finally {
            setLoading(false); // stop loading
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

            lastMessageIdRef.current = newMsg.id;
            setInput("");

            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 50);
        } catch (err) {
            handleError(err, "Failed to send message");
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
            handleError(err, "Failed to delete message");
        }
    };

    function formatMessage(text) {
        const urlRegex =
            /((https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*))/gi;

        const parts = [];
        let lastIndex = 0;

        text.replace(urlRegex, (match, _1, _2, _3, _4, offset) => {
            if (lastIndex < offset) {
                parts.push(text.slice(lastIndex, offset));
            }

            let href = match;
            if (!/^https?:\/\//i.test(href)) {
                href = "https://" + href;
            }

            parts.push(
                <a
                    key={offset}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-300 underline break-words"
                >
                    {match}
                </a>
            );

            lastIndex = offset + match.length;
        });

        if (lastIndex < text.length) {
            parts.push(text.slice(lastIndex));
        }

        return parts;
    }

    if (loading) {
        return <Loader />; // 👈 full-screen spinner
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

                    let longPressTimeout;

                    const handleTouchStart = () => {
                        if (isMe && !isDeleted) {
                            longPressTimeout = setTimeout(() => {
                                if (window.confirm("Delete this message?")) {
                                    handleDelete(msg.id);
                                }
                            }, 600);
                        }
                    };

                    const handleTouchEnd = () => {
                        clearTimeout(longPressTimeout);
                    };

                    return (
                        <div
                            key={msg.id || msg.createdAt}
                            className={`relative p-2 rounded max-w-xs group ${
                                isMe
                                    ? "bg-blue-500 text-white self-end ml-auto"
                                    : "bg-gray-200 text-black"
                            }`}
                            onTouchStart={handleTouchStart}
                            onTouchEnd={handleTouchEnd}
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
                                        {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        }
                                    )}
                                </span>
                                {isMe && !isDeleted && (
                                    <span>{isRead ? "✅✅" : "✅"}</span>
                                )}
                            </div>

                            {isMe && !isDeleted && (
                                <button
                                    onClick={() => handleDelete(msg.id)}
                                    className="hidden sm:block absolute top-1 right-1 text-xs text-red-300 opacity-0 group-hover:opacity-100 transition"
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
