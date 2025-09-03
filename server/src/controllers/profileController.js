// src/controllers/profileController.js
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
                updatedAt: true,
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

        // 🔹 Validation rules
        if (username !== undefined) {
            if (typeof username !== "string" || username.trim().length < 3) {
                return res.status(400).json({
                    error: "Username must be at least 3 characters long",
                });
            }
        }

        if (bio !== undefined) {
            if (typeof bio !== "string" || bio.length > 300) {
                return res.status(400).json({
                    error: "Bio must be a string up to 300 characters",
                });
            }
        }

        if (avatarUrl !== undefined) {
            const urlRegex = /^https?:\/\/.+/i;
            if (typeof avatarUrl !== "string" || !urlRegex.test(avatarUrl)) {
                return res.status(400).json({
                    error: "Avatar URL must be a valid URL starting with http(s)",
                });
            }
        }

        // 🔹 Build an update object only with provided fields
        const updateData = {};
        if (username !== undefined) updateData.username = username.trim();
        if (bio !== undefined) updateData.bio = bio.trim();
        if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl.trim();

        const user = await prisma.user.update({
            where: { id: req.user.userId },
            data: updateData,
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

        // Handle unique constraint error (username already taken)
        if (error.code === "P2002") {
            return res
                .status(400)
                .json({ error: "That username is already taken" });
        }

        res.status(500).json({ error: "Failed to update profile" });
    }
};
