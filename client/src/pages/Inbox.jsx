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
                        className="border p-3 rounded shadow-sm hover:bg-gray-50"
                    >
                        <Link to={`/chat/${conv.user.id}`} className="block">
                            <p className="font-semibold">
                                {conv.user.username}
                            </p>
                            <p className="text-sm text-gray-600 truncate">
                                {conv.lastMessage}
                            </p>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
