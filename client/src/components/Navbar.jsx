import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token"); // or however you're storing auth
        navigate("/login");
    };

    return (
        <nav className="bg-blue-600 text-white px-6 py-3 shadow-md">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
                {/* Logo / Brand */}
                <Link to="/" className="text-xl font-bold">
                    MessagingApp
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex space-x-6">
                    <Link to="/" className="hover:underline">
                        Home
                    </Link>
                    <Link to="/profile" className="hover:underline">
                        Profile
                    </Link>
                    <Link to="/inbox" className="hover:underline">
                        Messages
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
                    >
                        Logout
                    </button>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden focus:outline-none"
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        {menuOpen ? (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        ) : (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        )}
                    </svg>
                </button>
            </div>

            {/* Mobile Dropdown */}
            {menuOpen && (
                <div className="md:hidden flex flex-col space-y-2 mt-3 px-2">
                    <Link
                        to="/"
                        className="block py-2 px-3 rounded hover:bg-blue-500"
                    >
                        Home
                    </Link>
                    <Link
                        to="/profile"
                        className="block py-2 px-3 rounded hover:bg-blue-500"
                    >
                        Profile
                    </Link>
                    <Link
                        to="/inbox"
                        className="block py-2 px-3 rounded hover:bg-blue-500"
                    >
                        Messages
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 px-3 py-2 rounded hover:bg-red-600 text-left"
                    >
                        Logout
                    </button>
                </div>
            )}
        </nav>
    );
}
