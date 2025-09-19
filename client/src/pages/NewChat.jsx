import { useState } from "react";
import { searchUsers } from "../services/users";
import { Link } from "react-router-dom";
import { useFeedbackHandler } from "../hooks/useFeedbackHandler";

export default function NewChat() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const { handleError } = useFeedbackHandler();

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;
        try {
            const data = await searchUsers(query);
            setResults(data.users);
        } catch (err) {
            handleError(err, "Search failed. Please try again.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4 py-10">
            <div className="w-full max-w-lg bg-white shadow-lg rounded-2xl p-6 sm:p-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-center text-blue-600 mb-6">
                    Start New Chat
                </h1>

                {/* Search form */}
                <form
                    onSubmit={handleSearch}
                    className="flex flex-col sm:flex-row gap-3 mb-6"
                >
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by username"
                        className="flex-1 border rounded-lg p-3 focus:ring-2 focus:ring-blue-400"
                    />
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg shadow transition"
                    >
                        Search
                    </button>
                </form>

                {/* Results */}
                <div className="space-y-3">
                    {results.length === 0 && query && (
                        <p className="text-center text-gray-500">
                            No users found.
                        </p>
                    )}
                    {results.map((user) => (
                        <div
                            key={user.id}
                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border rounded-xl hover:bg-gray-50 transition"
                        >
                            {/* User Info */}
                            <div className="flex items-center gap-4">
                                <img
                                    src={
                                        user.avatarUrl ||
                                        "https://api.dicebear.com/9.x/thumbs/svg?seed=Random"
                                    }
                                    alt={user.username}
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                                <div className="overflow-hidden">
                                    <p className="font-semibold text-gray-800 truncate">
                                        {user.username}
                                    </p>
                                    <p className="text-sm text-gray-500 truncate">
                                        {user.email}
                                    </p>
                                </div>
                            </div>

                            {/* Button */}
                            <Link
                                to={`/chat/${user.id}`}
                                className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded-lg shadow transition text-center"
                            >
                                Start Chat
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
