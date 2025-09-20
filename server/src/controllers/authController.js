import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET;

// --- Signup ---
export const signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: "Email already in use" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                username,
                email,
                passwordHash: hashedPassword,
            },
        });

        res.status(201).json({
            message: "User created successfully",
            user: { id: user.id, username: user.username, email: user.email },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Signup failed" });
    }
};

// --- Login ---
export const login = async (req, res) => {
    try {
        const { email, password } = req.body || {};
        if (!email || !password) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user)
            return res.status(400).json({ error: "Invalid email or password" });

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch)
            return res.status(400).json({ error: "Invalid email or password" });

        // Access token (short lived)
        const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, {
            expiresIn: "15m",
        });

        // Refresh token (long lived)
        const refreshToken = jwt.sign({ userId: user.id }, JWT_SECRET, {
            expiresIn: "7d",
        });

        // Optional: persist refreshToken in DB for revocation control
        // await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });

        res.json({
            accessToken,
            refreshToken,
            user: { id: user.id, username: user.username, email: user.email },
        });
    } catch (err) {
        console.error("❌ Login error:", err);
        res.status(500).json({ error: "Server error during login" });
    }
};

// --- Refresh ---
export const refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(401).json({ error: "No refresh token" });
        }

        jwt.verify(refreshToken, JWT_SECRET, (err, decoded) => {
            if (err) {
                return res
                    .status(403)
                    .json({ error: "Invalid or expired refresh token" });
            }

            const newAccessToken = jwt.sign(
                { userId: decoded.userId },
                JWT_SECRET,
                { expiresIn: "15m" }
            );

            res.json({ accessToken: newAccessToken });
        });
    } catch (err) {
        console.error("❌ Refresh error:", err);
        res.status(500).json({ error: "Failed to refresh token" });
    }
};
