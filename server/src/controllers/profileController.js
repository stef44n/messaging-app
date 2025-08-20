import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getProfile = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: {
                id: true,
                username: true,
                email: true,
                avatarUrl: true,
                bio: true,
                createdAt: true,
            },
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch profile" });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { username, bio, avatarUrl } = req.body;

        const user = await prisma.user.update({
            where: { id: req.user.userId },
            data: { username, bio, avatarUrl },
            select: {
                id: true,
                username: true,
                email: true,
                avatarUrl: true,
                bio: true,
                updatedAt: true,
            },
        });

        res.json({ message: "Profile updated successfully", user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update profile" });
    }
};
