import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getInbox } from "../services/messages";
import { useFeedbackHandler } from "../hooks/useFeedbackHandler";

export default function Inbox() {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const handleError = useFeedbackHandler();

    useEffect(() => {
        const fetchInbox = async () => {
            try {
                const data = await getInbox();
                setConversations(data);
            } catch (err) {
                handleError(err);
            } finally {
                setLoading(false);
            }
        };
        fetchInbox();
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4 py-10">
            <div className="w-full max-w-lg bg-white shadow-lg rounded-2xl p-6 sm:p-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-center text-blue-600 mb-6">
                    Inbox
                </h1>

                {loading && (
                    <p className="text-center text-gray-500">Loading...</p>
                )}

                {!loading && conversations.length === 0 && (
                    <p className="text-center text-gray-500">
                        No conversations yet.
                    </p>
                )}

                <ul className="space-y-4">
                    {conversations.map((conv) => (
                        <li key={conv.user.id}>
                            <Link
                                to={`/chat/${conv.user.id}`}
                                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border rounded-xl shadow-sm hover:bg-gray-50 transition"
                            >
                                {/* Left side: avatar + text */}
                                <div className="flex items-center gap-4">
                                    <img
                                        src={
                                            conv.user.avatarUrl ||
                                            "https://i0.wp.com/sbcf.fr/wp-content/uploads/2018/03/sbcf-default-avatar.png?ssl=1"
                                        }
                                        alt={conv.user.username}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                    <div className="overflow-hidden">
                                        <p className="font-semibold text-gray-800 truncate">
                                            {conv.user.username}
                                        </p>
                                        <p className="text-sm text-gray-600 truncate">
                                            {conv.lastMessage ||
                                                "No messages yet"}
                                        </p>
                                    </div>
                                </div>

                                {/* Right side: time + unread */}
                                <div className="flex items-center justify-end sm:flex-col sm:items-end gap-2 min-w-[80px]">
                                    <span
                                        className={`bg-red-500 text-white text-xs px-2 py-1 rounded-full ${
                                            conv.unreadCount === 0
                                                ? "invisible"
                                                : ""
                                        }`}
                                    >
                                        {conv.unreadCount}
                                    </span>
                                    <span className="text-xs text-gray-400 whitespace-nowrap">
                                        {conv.lastMessageAt
                                            ? new Date(
                                                  conv.lastMessageAt
                                              ).toLocaleTimeString([], {
                                                  hour: "2-digit",
                                                  minute: "2-digit",
                                              })
                                            : ""}
                                    </span>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
