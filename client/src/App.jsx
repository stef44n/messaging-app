import "./App.css";
import { Link } from "react-router-dom";
import { logout } from "./services/auth";
import { useAuth } from "./context/AuthContext";

export default function App() {
    const { user } = useAuth();

    const handleLogout = () => {
        logout();
        window.location.href = "/login";
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white px-6">
            {/* Header */}
            <header className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-blue-600 mb-2">
                    Messaging App
                </h1>
                <p className="text-gray-600 text-lg">
                    Stay connected with friends & colleagues
                </p>
            </header>

            {/* User info if logged in */}
            {user && (
                <div className="flex flex-col items-center mb-8 bg-white rounded-2xl shadow p-6 w-full max-w-md text-center">
                    <img
                        src={
                            user.avatarUrl ||
                            "https://api.dicebear.com/9.x/thumbs/svg?seed=Jameson"
                        }
                        alt="avatar"
                        className="w-20 h-20 rounded-full object-cover mb-4"
                    />
                    <p className="font-semibold text-gray-800 text-lg">
                        {user.username}
                    </p>
                    <p className="text-gray-500 text-sm">Welcome back 👋</p>
                </div>
            )}

            {/* Main Navigation */}
            <nav className="grid grid-cols-2 sm:grid-cols-2 gap-6 w-full max-w-md">
                {!user ? (
                    <>
                        <Link
                            to="/login"
                            className="flex flex-col items-center justify-center bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition"
                        >
                            <span className="text-xl mb-2">🔑</span>
                            <span className="font-semibold text-gray-700">
                                Login
                            </span>
                        </Link>

                        <Link
                            to="/signup"
                            className="flex flex-col items-center justify-center bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition"
                        >
                            <span className="text-xl mb-2">📝</span>
                            <span className="font-semibold text-gray-700">
                                Sign Up
                            </span>
                        </Link>
                    </>
                ) : (
                    <>
                        <Link
                            to="/profile"
                            className="flex flex-col items-center justify-center bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition"
                        >
                            <span className="text-xl mb-2">👤</span>
                            <span className="font-semibold text-gray-700">
                                Profile
                            </span>
                        </Link>

                        <Link
                            to="/inbox"
                            className="flex flex-col items-center justify-center bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition"
                        >
                            <span className="text-xl mb-2">📥</span>
                            <span className="font-semibold text-gray-700">
                                Inbox
                            </span>
                        </Link>

                        <Link
                            to="/new-chat"
                            className="flex flex-col items-center justify-center bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition"
                        >
                            <span className="text-xl mb-2">💬</span>
                            <span className="font-semibold text-gray-700">
                                New Chat
                            </span>
                        </Link>

                        <button
                            onClick={handleLogout}
                            className="flex flex-col items-center justify-center bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition"
                        >
                            <span className="text-xl mb-2">🚪</span>
                            <span className="font-semibold text-gray-700">
                                Logout
                            </span>
                        </button>
                    </>
                )}
            </nav>

            {/* Footer */}
            <footer className="mt-12 text-sm text-gray-400">
                © {new Date().getFullYear()} Messaging App. All rights reserved.
            </footer>
        </div>
    );
}
