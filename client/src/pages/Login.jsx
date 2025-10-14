import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login as loginService } from "../services/auth";
import { useAuth } from "../context/AuthContext";

export default function Login() {
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { setSession } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;
        setLoading(true);
        setError("");

        try {
            const data = await loginService(form);

            // ✅ Check both possible token field names
            const accessToken = data.accessToken || data.token;
            const refreshToken = data.refreshToken;
            const user = data.user;

            if (accessToken) {
                // ✅ Pass all relevant data into context
                setSession(accessToken, refreshToken, user);

                // ✅ Navigate smoothly (no full reload)
                navigate("/inbox", { replace: true });
            } else {
                console.error("No token returned:", data);
                setError("No token returned from server");
            }
        } catch (err) {
            console.error("Login error:", err);
            setError(err.response?.data?.error || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Login</h1>
            {error && <p className="text-red-500 mb-3">{error}</p>}

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                    }
                    className="border p-2 rounded"
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                    }
                    className="border p-2 rounded"
                    required
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
                >
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>
        </div>
    );
}
