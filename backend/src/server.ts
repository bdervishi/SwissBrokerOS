
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';
import { integrationsRouter } from './integrations';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.GOOGLE_API_KEY;

// 1. Security Middleware
app.use(helmet()); // Sets various HTTP headers for security
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Restrict to your frontend
    methods: ['GET', 'POST', 'DELETE']
}));
app.use(express.json());

// 2. Rate Limiting (Protection against DDOS and Cost Spikes)
const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per window
	standardHeaders: 'draft-7',
	legacyHeaders: false,
    message: "Zu viele Anfragen. Bitte versuchen Sie es später erneut."
});

// Apply rate limiter to API routes
app.use('/api', apiLimiter);

// Per-tenant OAuth drive integrations (Google Drive, Microsoft OneDrive)
app.use('/api/integrations', integrationsRouter);

// 3. AI Proxy Route
app.post('/api/generate', async (req, res) => {
    try {
        if (!API_KEY) {
            console.error("Server Config Error: GOOGLE_API_KEY missing");
            return res.status(500).json({ error: "Server Configuration Error" });
        }

        const { model, contents, config } = req.body;

        // Basic Validation
        if (!model || !contents) {
            return res.status(400).json({ error: "Missing model or contents" });
        }

        // Initialize Google AI (Server-Side only!)
        const ai = new GoogleGenAI({ apiKey: API_KEY });

        // Forward request to Google
        const response = await ai.models.generateContent({
            model: model,
            contents: contents,
            config: config
        });

        // Send back the text/result
        res.json({ 
            text: response.text,
            candidates: response.candidates 
        });

    } catch (error: any) {
        console.error("AI Proxy Error:", error);
        
        // Handle Google Errors gracefully
        const status = error.status || 500;
        const message = error.message || "Internal Server Error";
        
        res.status(status).json({ error: message });
    }
});

// Health Check
app.get('/health', (req, res) => {
    res.status(200).send('SwissBroker OS Backend: Online 🟢');
});

app.listen(PORT, () => {
    console.log(`🇨🇭 SwissBroker Backend running on port ${PORT}`);
});
