import express from 'express';
import jwt from 'jsonwebtoken';
import VoiceAssistant from '../models/VoiceAssistant.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'voxai-secret-key-change-in-production';

// Auth middleware
function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

// GET /api/assistants — list all assistants for user
router.get('/', authenticate, async (req, res) => {
    try {
        const assistants = await VoiceAssistant.find({ userId: req.userId }).sort({ updatedAt: -1 });
        res.json(assistants);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/assistants — create assistant
router.post('/', authenticate, async (req, res) => {
    try {
        // Create new assistant with defaults merged with body
        const assistant = await VoiceAssistant.create({
            userId: req.userId,
            ...req.body,
            // Default fallback if name not provided
            name: req.body.name || 'New Assistant',
        });
        res.status(201).json(assistant);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/assistants/:id — update assistant
router.put('/:id', authenticate, async (req, res) => {
    try {
        const assistant = await VoiceAssistant.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            { ...req.body, updatedAt: Date.now() },
            { new: true }
        );
        if (!assistant) return res.status(404).json({ error: 'Assistant not found' });
        res.json(assistant);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/assistants/:id — delete assistant
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const assistant = await VoiceAssistant.findOneAndDelete({ _id: req.params.id, userId: req.userId });
        if (!assistant) return res.status(404).json({ error: 'Assistant not found' });
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
