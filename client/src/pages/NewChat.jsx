import { useState } from "react";
import { searchUsers } from "../services/users";
import { Link } from "react-router-dom";

export default function NewChat() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;
        try {
            const data = await searchUsers(query);
            setResults(data.users);
        } catch (err) {
            console.error("Search failed:", err);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Start New Chat</h1>

            <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by username"
                    className="flex-1 border rounded p-2"
                />
                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 rounded"
                >
                    Search
                </button>
            </form>

            <ul className="space-y-2">
                {results.length === 0 && query && <p>No users found.</p>}
                {results.map((user) => (
                    <li
                        key={user.id}
                        className="border p-2 rounded hover:bg-gray-100"
                    >
                        <Link to={`/chat/${user.id}`} className="block">
                            <p className="font-semibold">{user.username}</p>
                            <p className="text-sm text-gray-500">
                                {user.email}
                            </p>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
