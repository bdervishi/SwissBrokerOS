
// This service now talks to YOUR backend, not Google directly.
// This keeps the API Key secure on the server.

const BACKEND_URL = (import.meta as any).env?.VITE_BACKEND_URL || 'http://localhost:3000/api/generate';

export interface AIGenerateResult {
  text: string;
  candidates?: any[];
}

export const generateContentWithRetry = async (
    model: string,
    contents: any,
    config: any = {}
): Promise<AIGenerateResult> => { // Mirrors the backend proxy response
    
    const headers = {
        'Content-Type': 'application/json',
        // In future: Add Auth Token here
        // 'Authorization': `Bearer ${userToken}` 
    };

    const body = JSON.stringify({
        model,
        contents,
        config
    });

    try {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers,
            body
        });

        if (!response.ok) {
            // Handle HTTP errors (429, 500, etc)
            if (response.status === 429) {
                throw new Error("Rate Limit Exceeded. Please wait.");
            }
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Server Error: ${response.status}`);
        }

        const data = await response.json();

        // Map backend response to what the app expects
        return {
            text: data.text,
            candidates: data.candidates,
        };

    } catch (error) {
        console.error("Secure AI Request Failed:", error);
        throw error;
    }
};

/**
 * Drop-in replacement for `new GoogleGenAI({ apiKey })`. Exposes the same
 * `.models.generateContent({ model, contents, config })` shape the pages use,
 * but routes the request through the secure backend proxy so the API key never
 * reaches the browser. Call sites only need to swap the constructor.
 */
export const getAIClient = () => ({
  models: {
    generateContent: async (
      { model, contents, config }: { model: string; contents: any; config?: any },
    ): Promise<AIGenerateResult> => generateContentWithRetry(model, contents, config ?? {}),
  },
});
