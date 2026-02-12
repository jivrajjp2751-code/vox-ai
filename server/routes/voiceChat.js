import express from 'express';

const router = express.Router();

// POST /api/voice-chat — proxy to AI for voice conversation
router.post('/', async (req, res) => {
    try {
        const { userMessage, systemPrompt, temperature, conversationHistory } = req.body;

        if (!userMessage) {
            return res.status(400).json({ error: 'userMessage is required' });
        }

        const messages = [
            { role: 'system', content: systemPrompt || 'You are a helpful voice assistant. Keep responses concise and conversational.' },
            ...(conversationHistory || []),
            { role: 'user', content: userMessage },
        ];

        // Use OpenAI-compatible API — you can swap this with your own key / endpoint
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            // Fallback: simple echo response for testing
            return res.json({
                reply: `I heard you say: "${userMessage}". (Configure OPENAI_API_KEY in .env for real AI responses)`,
            });
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages,
                temperature: temperature ?? 0.7,
                max_tokens: 300,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`AI API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content ?? "I'm sorry, I couldn't generate a response.";

        res.json({ reply });
    } catch (err) {
        console.error('Voice chat error:', err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
