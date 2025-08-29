import { useEffect, useState } from "react";
import { getProfile } from "../services/auth";

export default function Profile() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            const data = await getProfile();
            setUser(data.user);
        };
        fetchProfile();
    }, []);

    if (!user) return <p>Loading...</p>;

    return (
        <div className="max-w-md mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Profile</h1>
            <p>
                <strong>Username:</strong> {user.username}
            </p>
            <p>
                <strong>Email:</strong> {user.email}
            </p>
            <p>
                <strong>Bio:</strong> {user.bio || "No bio yet"}
            </p>
        </div>
    );
}
