import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

import authRoutes from './routes/auth.js';
import assistantRoutes from './routes/assistants.js';
import voiceChatRoutes from './routes/voiceChat.js';

const app = express();
const PORT = process.env.SERVER_PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/voxai';

// Middleware
app.use(cors({
    origin: '*', // Allow all origins (dev mode)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
import publicApiRoutes from './routes/public_api.js';

app.use('/api/auth', authRoutes);
app.use('/api/assistants', assistantRoutes);
app.use('/api/voice-chat', voiceChatRoutes);
app.use('/api/public', publicApiRoutes);

// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});

// Connect to MongoDB and start server
mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB');
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err.message);
        // Start server anyway so frontend doesn't break completely (just API will fail)
        app.listen(PORT, () => {
            console.log(`⚠️ Server running (without DB) on http://localhost:${PORT}`);
        });
    });
