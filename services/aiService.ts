
// This service now talks to YOUR backend, not Google directly.
// This keeps the API Key secure on the server.

const BACKEND_URL = (import.meta as any).env?.VITE_BACKEND_URL || 'http://localhost:3000/api/generate';

export const generateContentWithRetry = async (
    model: string, 
    contents: any, 
    config: any = {}
): Promise<{ text: string }> => { // Simplified return type based on our proxy
    
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
            text: data.text
        };

    } catch (error) {
        console.error("Secure AI Request Failed:", error);
        throw error;
    }
};
