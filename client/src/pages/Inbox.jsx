import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getInbox } from "../services/messages";

export default function Inbox() {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInbox = async () => {
            try {
                const data = await getInbox();
                setConversations(data); // ✅ already an array
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchInbox();
    }, []);

    return (
        <div className="max-w-md mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Inbox</h1>

            {loading && <p>Loading...</p>}

            {!loading && conversations.length === 0 && (
                <p>No conversations yet.</p>
            )}

            <ul className="space-y-3">
                {conversations.map((conv) => (
                    <li
                        key={conv.user.id}
                        className="flex items-center border p-3 rounded shadow-sm hover:bg-gray-100"
                    >
                        <Link
                            to={`/chat/${conv.user.id}`}
                            className="flex items-center gap-3 w-full"
                        >
                            <img
                                src={
                                    conv.user.avatarUrl ||
                                    "https://i0.wp.com/sbcf.fr/wp-content/uploads/2018/03/sbcf-default-avatar.png?ssl=1"
                                }
                                alt={conv.user.username}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                            <div className="flex-1">
                                <p className="font-semibold">
                                    {conv.user.username}
                                </p>
                                <p className="text-sm text-gray-600 truncate">
                                    {conv.lastMessage}
                                </p>
                            </div>
                            <span
                                className={`ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full ${
                                    conv.unreadCount === 0 ? "invisible" : ""
                                }`}
                            >
                                {conv.unreadCount}
                            </span>

                            <span className="text-xs text-gray-400">
                                {new Date(
                                    conv.lastMessageAt
                                ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
