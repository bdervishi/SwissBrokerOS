
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';
import { integrationsRouter } from './integrations';
import { callsRouter } from './calls';
import { demoRouter } from './demo';
import cron from 'node-cron';
import { runAllAutomation } from './automation';

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

// Call agent – post-call pipeline (transcript -> summary + follow-up actions)
app.use('/api/calls', callsRouter);

// Demo access (email allow-list -> magic-link into the shared demo tenant)
app.use('/api/demo', demoRouter);

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

// Deadline automation: manual trigger (protected by a shared secret) + daily cron.
const AUTOMATION_SECRET = process.env.AUTOMATION_SECRET;
app.post('/api/automation/run', async (req, res) => {
    if (AUTOMATION_SECRET && req.headers['x-automation-key'] !== AUTOMATION_SECRET) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        const result = await runAllAutomation();
        res.json(result);
    } catch (e: any) {
        console.error('Automation error:', e?.message);
        res.status(500).json({ error: e?.message || 'Automation failed' });
    }
});

// Run every day at 06:00 (server time) if Supabase is configured.
if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    cron.schedule('0 6 * * *', () => {
        runAllAutomation()
            .then((r) => console.log('🗓️  Deadline automation:', r))
            .catch((e) => console.error('Deadline automation failed:', e?.message));
    });
}

// Health Check
app.get('/health', (req, res) => {
    res.status(200).send('SwissBroker OS Backend: Online 🟢');
});

app.listen(PORT, () => {
    console.log(`🇨🇭 SwissBroker Backend running on port ${PORT}`);
});
