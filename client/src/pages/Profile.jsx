import { useEffect, useState } from "react";
import { getProfile, updateProfile } from "../services/auth";

export default function Profile() {
    const [user, setUser] = useState(null);
    const [form, setForm] = useState({ username: "", bio: "", avatarUrl: "" });
    const [editing, setEditing] = useState(false);
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            const data = await getProfile();
            setUser(data.user);
            setForm({
                username: data.user.username || "",
                bio: data.user.bio || "",
                avatarUrl: data.user.avatarUrl || "",
            });
        };
        fetchProfile();
    }, []);

    const validate = () => {
        const newErrors = {};
        if (form.username.trim().length < 3) {
            newErrors.username = "Username must be at least 3 characters";
        }
        if (form.bio.length > 300) {
            newErrors.bio = "Bio cannot exceed 300 characters";
        }
        if (form.avatarUrl && !/^https?:\/\/.+/i.test(form.avatarUrl)) {
            newErrors.avatarUrl = "Avatar URL must start with http(s)";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        setSuccess("");
        if (!validate()) return;

        try {
            const data = await updateProfile(form);
            setUser(data.user);
            setEditing(false);
            setErrors({});
            setSuccess("Profile updated successfully ✅");
        } catch (err) {
            console.error(err);
            setErrors({ api: err.response?.data?.error || "Update failed" });
        }
    };

    if (!user) return <p>Loading...</p>;

    return (
        <div className="max-w-md mx-auto p-6 bg-white shadow rounded-lg">
            <h1 className="text-2xl font-bold mb-4">Profile</h1>

            {errors.api && <p className="text-red-600">{errors.api}</p>}
            {success && <p className="text-green-600">{success}</p>}

            {!editing ? (
                <>
                    {user.avatarUrl && (
                        <img
                            src={user.avatarUrl}
                            alt="avatar"
                            className="w-24 h-24 rounded-full mb-4"
                        />
                    )}
                    <p>
                        <strong>Username:</strong> {user.username}
                    </p>
                    <p>
                        <strong>Email:</strong> {user.email}
                    </p>
                    <p>
                        <strong>Bio:</strong> {user.bio || "No bio yet"}
                    </p>
                    <button
                        onClick={() => setEditing(true)}
                        className="mt-4 bg-blue-500 text-white px-4 py-1 rounded"
                    >
                        Edit
                    </button>
                </>
            ) : (
                <>
                    <div className="mb-3">
                        <label className="block font-semibold mb-1">
                            Username
                        </label>
                        <input
                            type="text"
                            value={form.username}
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    username: e.target.value,
                                }))
                            }
                            className="w-full border p-2 rounded"
                        />
                        {errors.username && (
                            <p className="text-red-600 text-sm">
                                {errors.username}
                            </p>
                        )}
                    </div>

                    <div className="mb-3">
                        <label className="block font-semibold mb-1">Bio</label>
                        <textarea
                            value={form.bio}
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    bio: e.target.value,
                                }))
                            }
                            className="w-full border p-2 rounded"
                            rows="3"
                        />
                        {errors.bio && (
                            <p className="text-red-600 text-sm">{errors.bio}</p>
                        )}
                    </div>

                    <div className="mb-3">
                        <label className="block font-semibold mb-1">
                            Avatar URL
                        </label>
                        <input
                            type="text"
                            value={form.avatarUrl}
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    avatarUrl: e.target.value,
                                }))
                            }
                            className="w-full border p-2 rounded"
                        />
                        {errors.avatarUrl && (
                            <p className="text-red-600 text-sm">
                                {errors.avatarUrl}
                            </p>
                        )}
                        {form.avatarUrl &&
                            /^https?:\/\/.+/i.test(form.avatarUrl) && (
                                <img
                                    src={form.avatarUrl}
                                    alt="avatar preview"
                                    className="w-20 h-20 rounded-full mt-2 border"
                                />
                            )}
                    </div>

                    <div className="flex gap-2 mt-2">
                        <button
                            onClick={handleSave}
                            className="bg-green-500 text-white px-4 py-1 rounded"
                        >
                            Save
                        </button>
                        <button
                            onClick={() => setEditing(false)}
                            className="bg-gray-400 text-white px-4 py-1 rounded"
                        >
                            Cancel
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
