import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { searchUsers } from "../controllers/userController.js";

const router = express.Router();

router.get("/search", authenticate, searchUsers);

export default router;
