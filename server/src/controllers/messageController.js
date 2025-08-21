import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Send a message
export const sendMessage = async (req, res) => {
    try {
        const { recipientId } = req.params;
        const { body } = req.body;

        if (!body) {
            return res
                .status(400)
                .json({ error: "Message body cannot be empty" });
        }

        // Ensure recipient exists
        const recipient = await prisma.user.findUnique({
            where: { id: parseInt(recipientId) },
        });
        if (!recipient) {
            return res.status(404).json({ error: "Recipient not found" });
        }

        const message = await prisma.message.create({
            data: {
                body,
                senderId: req.user.userId,
                recipientId: parseInt(recipientId),
            },
        });

        res.status(201).json({ message: "Message sent", data: message });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to send message" });
    }
};

// Get all messages between current user and another user
export const getConversation = async (req, res) => {
    try {
        const { userId } = req.params;

        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    {
                        senderId: req.user.userId,
                        recipientId: parseInt(userId),
                    },
                    {
                        senderId: parseInt(userId),
                        recipientId: req.user.userId,
                    },
                ],
            },
            orderBy: { createdAt: "asc" },
        });

        res.json({ messages });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch conversation" });
    }
};

// Get a list of unique users the current user has messaged
export const getInbox = async (req, res) => {
    try {
        // Get distinct conversations (either sent or received)
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

        // Build a unique set of conversation partners
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

        res.json({ conversations: Object.values(conversations) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch inbox" });
    }
};
