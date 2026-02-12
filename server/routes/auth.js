import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'voxai-secret-key-change-in-production';

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
    try {
        const { email, password, displayName } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ error: 'User already exists with this email' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const publicKey = 'pk_' + crypto.randomBytes(16).toString('hex');
        const secretKey = 'sk_' + crypto.randomBytes(16).toString('hex');
        const user = await User.create({
            email,
            password: hashedPassword,
            displayName: displayName || '',
            publicKey,
            secretKey
        });

        const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            user: {
                id: user._id,
                email: user.email,
                displayName: user.displayName,
                publicKey: user.publicKey,
                secretKey: user.secretKey
            },
            token,
        });
    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ error: err.message || 'Signup failed' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

        // Generate keys if missing (migration for existing users)
        if (!user.publicKey || !user.secretKey) {
            user.publicKey = user.publicKey || 'pk_' + crypto.randomBytes(16).toString('hex');
            user.secretKey = user.secretKey || 'sk_' + crypto.randomBytes(16).toString('hex');
            await user.save();
        }

        res.json({
            user: {
                id: user._id,
                email: user.email,
                displayName: user.displayName,
                publicKey: user.publicKey,
                secretKey: user.secretKey
            },
            token,
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: err.message || 'Login failed' });
    }
});

// GET /api/auth/me — verify token & return user
router.get('/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        // Generate keys if missing
        if (!user.publicKey || !user.secretKey) {
            user.publicKey = user.publicKey || 'pk_' + crypto.randomBytes(16).toString('hex');
            user.secretKey = user.secretKey || 'sk_' + crypto.randomBytes(16).toString('hex');
            await user.save();
        }

        res.json({
            user: {
                id: user._id,
                email: user.email,
                displayName: user.displayName,
                publicKey: user.publicKey,
                secretKey: user.secretKey
            }
        });
    } catch (err) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
});

export default router;
