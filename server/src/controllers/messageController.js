import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// --- Send a message ---
export const sendMessage = async (req, res) => {
    try {
        const recipientId = parseInt(req.params.recipientId, 10);
        const body = (req.body.body || "").trim();

        if (!recipientId || isNaN(recipientId)) {
            return res.status(400).json({ error: "Invalid recipient ID" });
        }
        if (!body) {
            return res
                .status(400)
                .json({ error: "Message body cannot be empty" });
        }

        const recipient = await prisma.user.findUnique({
            where: { id: recipientId },
        });
        if (!recipient) {
            return res.status(404).json({ error: "Recipient not found" });
        }

        const message = await prisma.message.create({
            data: {
                body,
                senderId: req.user.userId,
                recipientId,
            },
            include: {
                sender: { select: { id: true, username: true } },
                recipient: { select: { id: true, username: true } },
            },
        });

        // ✅ Just return the message object
        res.status(201).json({
            id: message.id,
            body: message.body,
            createdAt: message.createdAt,
            sender: message.sender,
            recipient: message.recipient,
        });
    } catch (error) {
        console.error("❌ sendMessage error:", error);
        res.status(500).json({ error: "Failed to send message" });
    }
};

// --- Get conversation with a user ---
export const getConversation = async (req, res) => {
    try {
        const userId = parseInt(req.params.userId, 10);
        if (!userId || isNaN(userId)) {
            return res.status(400).json({ error: "Invalid user ID" });
        }

        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: req.user.userId, recipientId: userId },
                    { senderId: userId, recipientId: req.user.userId },
                ],
            },
            orderBy: { createdAt: "asc" },
            include: {
                sender: { select: { id: true, username: true } },
                recipient: { select: { id: true, username: true } },
            },
        });

        // ✅ return array directly
        res.json(messages);
    } catch (error) {
        console.error("❌ getConversation error:", error);
        res.status(500).json({ error: "Failed to fetch conversation" });
    }
};

// --- Get inbox (list of conversations) ---
export const getInbox = async (req, res) => {
    try {
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: req.user.userId },
                    { recipientId: req.user.userId },
                ],
            },
            orderBy: { createdAt: "desc" },
            include: {
                sender: { select: { id: true, username: true } },
                recipient: { select: { id: true, username: true } },
            },
        });

        const conversations = {};
        messages.forEach((msg) => {
            const otherUser =
                msg.senderId === req.user.userId ? msg.recipient : msg.sender;

            if (!conversations[otherUser.id]) {
                conversations[otherUser.id] = {
                    user: otherUser,
                    lastMessage: msg.body,
                    lastMessageAt: msg.createdAt,
                };
            }
        });

        // ✅ return array directly
        res.json(Object.values(conversations));
    } catch (error) {
        console.error("❌ getInbox error:", error);
        res.status(500).json({ error: "Failed to fetch inbox" });
    }
};
