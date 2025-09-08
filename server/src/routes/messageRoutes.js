import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
    sendMessage,
    getConversation,
    getInbox,
    deleteMessage,
} from "../controllers/messageController.js";

const router = express.Router();

router.get("/inbox", authenticate, getInbox); // list of conversation partners
router.get("/:userId", authenticate, getConversation); // messages with one user
router.post("/:recipientId", authenticate, sendMessage); // send new message
router.delete("/:messageId", authenticate, deleteMessage);

export default router;
