import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

import authRoutes from './routes/auth.js';
import assistantRoutes from './routes/assistants.js';
import voiceChatRoutes from './routes/voiceChat.js';

const app = express();
const PORT = process.env.PORT || process.env.SERVER_PORT || 5000;
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
import otpRoutes from './routes/otp.js';

app.use('/api/auth', authRoutes);
app.use('/api/assistants', assistantRoutes);
app.use('/api/voice-chat', voiceChatRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/public', publicApiRoutes);

// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});

// Serve Frontend in Production
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === 'production') {
    // Serve static files from the React app
    app.use(express.static(path.join(__dirname, '../dist')));

    // The "catchall" handler: for any request that doesn't
    // match one above, send back React's index.html file.
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../dist/index.html'));
    });
}


// Connect to MongoDB asynchronously
mongoose
    .connect(MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch((err) => console.error('❌ MongoDB connection error:', err.message));

// Start server immediately (required for Railway health checks)
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
