import "./App.css";

import { Link } from "react-router-dom";
import { logout } from "./services/auth";

export default function App() {
    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Messaging App</h1>
            <nav className="flex gap-4">
                <Link to="/login">Login</Link>
                <Link to="/signup">Signup</Link>
                <Link to="/profile">Profile</Link>
                <Link to="/inbox">Inbox</Link>
                <Link to="/new-chat">New chat</Link>

                <button
                    onClick={() => {
                        logout();
                        window.location.href = "/login";
                    }}
                >
                    Logout
                </button>
            </nav>
        </div>
    );
}
