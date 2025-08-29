import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup } from "../services/auth";

export default function Signup() {
    const [form, setForm] = useState({ username: "", email: "", password: "" });
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await signup(form);
            navigate("/login");
        } catch (err) {
            setError(err.response?.data?.error || "Signup failed");
        }
    };

    return (
        <div className="max-w-md mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Signup</h1>
            {error && <p className="text-red-500">{error}</p>}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input
                    type="text"
                    placeholder="Username"
                    value={form.username}
                    onChange={(e) =>
                        setForm({ ...form, username: e.target.value })
                    }
                    className="border p-2 rounded"
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                    }
                    className="border p-2 rounded"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                    }
                    className="border p-2 rounded"
                />
                <button className="bg-green-500 text-white p-2 rounded">
                    Signup
                </button>
            </form>
        </div>
    );
}
