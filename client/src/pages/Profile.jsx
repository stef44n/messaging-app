import { useEffect, useState } from "react";
import { getProfile, updateProfile } from "../services/auth";
import { useFeedbackHandler } from "../hooks/useFeedbackHandler";

export default function Profile() {
    const [user, setUser] = useState(null);
    const [form, setForm] = useState({ username: "", bio: "", avatarUrl: "" });
    const [editing, setEditing] = useState(false);
    const [errors, setErrors] = useState({});
    const { handleError, handleSuccess } = useFeedbackHandler();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getProfile();
                setUser(data.user);
                setForm({
                    username: data.user.username || "",
                    bio: data.user.bio || "",
                    avatarUrl: data.user.avatarUrl || "",
                });
            } catch (err) {
                handleError(err, "Failed to load profile");
            }
        };
        fetchProfile();
    }, [handleError]);

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
        if (!validate()) return;

        try {
            const data = await updateProfile(form);
            setUser(data.user);
            setEditing(false);
            setErrors({});
            handleSuccess("Profile updated successfully ✅");
        } catch (err) {
            handleError(err, "Profile update failed");
        }
    };

    if (!user) return <p className="text-center mt-10">Loading...</p>;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4 py-10">
            <div className="w-full max-w-lg bg-white shadow-lg rounded-2xl p-6 sm:p-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-center text-blue-600 mb-6">
                    Profile
                </h1>

                {!editing ? (
                    <div className="text-center">
                        <img
                            src={
                                user.avatarUrl ||
                                "https://api.dicebear.com/9.x/thumbs/svg?seed=Jameson"
                            }
                            alt="avatar"
                            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full mx-auto mb-4 border"
                        />
                        <p className="text-lg font-semibold text-gray-800">
                            {user.username}
                        </p>
                        <p className="text-gray-500 text-sm mb-2">
                            {user.email}
                        </p>
                        <p className="text-gray-700 italic">
                            {user.bio || "No bio yet"}
                        </p>
                        <button
                            onClick={() => setEditing(true)}
                            className="mt-5 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg shadow transition"
                        >
                            Edit Profile
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Username */}
                        <div>
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
                                className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-400"
                            />
                            {errors.username && (
                                <p className="text-red-600 text-sm mt-1">
                                    {errors.username}
                                </p>
                            )}
                        </div>

                        {/* Bio */}
                        <div>
                            <label className="block font-semibold mb-1">
                                Bio
                            </label>
                            <textarea
                                value={form.bio}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        bio: e.target.value,
                                    }))
                                }
                                className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-400"
                                rows="3"
                            />
                            {errors.bio && (
                                <p className="text-red-600 text-sm mt-1">
                                    {errors.bio}
                                </p>
                            )}
                        </div>

                        {/* Avatar */}
                        <div>
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
                                className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-400"
                            />
                            {errors.avatarUrl && (
                                <p className="text-red-600 text-sm mt-1">
                                    {errors.avatarUrl}
                                </p>
                            )}
                            {form.avatarUrl &&
                                /^https?:\/\/.+/i.test(form.avatarUrl) && (
                                    <img
                                        src={form.avatarUrl}
                                        alt="avatar preview"
                                        className="w-20 h-20 rounded-full mt-3 border mx-auto"
                                    />
                                )}
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3 justify-center mt-5">
                            <button
                                onClick={handleSave}
                                className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg shadow transition"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => setEditing(false)}
                                className="bg-gray-400 hover:bg-gray-500 text-white px-5 py-2 rounded-lg shadow transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
