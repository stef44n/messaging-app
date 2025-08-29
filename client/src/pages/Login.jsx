import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/auth";

export default function Login() {
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(form);
            navigate("/inbox");
        } catch (err) {
            setError(err.response?.data?.error || "Login failed");
        }
    };

    return (
        <div className="max-w-md mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Login</h1>
            {error && <p className="text-red-500">{error}</p>}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
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
                <button className="bg-blue-500 text-white p-2 rounded">
                    Login
                </button>
            </form>
        </div>
    );
}
