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
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
            expiresIn: "1h",
        });

        res.json({
            message: "Login successful",
            token,
            user: { id: user.id, username: user.username, email: user.email },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Login failed" });
    }
};
