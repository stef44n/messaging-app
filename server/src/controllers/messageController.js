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

        // ✅ return the message object directly
        res.status(201).json(message);
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

        // ✅ Mark all messages sent *to current user* as read
        await prisma.message.updateMany({
            where: {
                senderId: userId,
                recipientId: req.user.userId,
                readAt: null,
            },
            data: { readAt: new Date() },
        });

        // Fetch updated conversation
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

        // Map deleted messages -> placeholder
        const safeMessages = messages.map((msg) =>
            msg.deletedAt ? { ...msg, body: "This message was deleted." } : msg
        );

        res.json({ messages: safeMessages });
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
                    unreadCount: 0,
                };
            }

            // ✅ Count unread messages addressed to current user
            if (msg.recipientId === req.user.userId && !msg.readAt) {
                conversations[otherUser.id].unreadCount += 1;
            }
        });

        // ✅ return array directly
        res.json(Object.values(conversations));
    } catch (error) {
        console.error("❌ getInbox error:", error);
        res.status(500).json({ error: "Failed to fetch inbox" });
    }
};

// --- Delete message ---
export const deleteMessage = async (req, res) => {
    try {
        const messageId = parseInt(req.params.messageId, 10);
        const message = await prisma.message.findUnique({
            where: { id: messageId },
        });

        if (!message) {
            return res.status(404).json({ error: "Message not found" });
        }
        if (message.senderId !== req.user.userId) {
            return res
                .status(403)
                .json({ error: "You can only delete your own messages" });
        }

        const updated = await prisma.message.update({
            where: { id: messageId },
            data: {
                body: "[deleted]", // optionally overwrite body
                deletedAt: new Date(),
            },
        });

        res.json({ success: true, message: updated });
    } catch (error) {
        console.error("❌ deleteMessage error:", error);
        res.status(500).json({ error: "Failed to delete message" });
    }
};
