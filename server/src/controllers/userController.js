import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const searchUsers = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.trim() === "") {
            return res.json({ users: [] });
        }

        const users = await prisma.user.findMany({
            where: {
                username: { contains: q, mode: "insensitive" },
            },
            select: { id: true, username: true, email: true },
            take: 10, // limit results
        });

        res.json({ users });
    } catch (error) {
        console.error("❌ searchUsers error:", error);
        res.status(500).json({ error: "Failed to search users" });
    }
};
