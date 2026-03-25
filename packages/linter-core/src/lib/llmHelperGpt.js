/**
 * Request AI-generated responses from your backend Gpt proxy.
 * @param {string} model - The LLM model to use.
 * @param {string} prompt - The prompt for the AI.
 * @returns {Promise<string>} The AI's response.
 */
export async function getGptChatCompletion(model, prompt) {
    if (!prompt || prompt.trim().length === 0) {
        console.warn("Empty prompt provided for LLM.");
        return "Error: Empty prompt.";
    }

    try {
        const response = await fetch("https://lintme-backend.onrender.com/api/gpt-chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ model, prompt })
        });

        const data = await response.json();
        return data.result || "No valid response.";
    } catch (error) {
        console.error("Error communicating with backend:", error);
        return "Error generating suggestions.";
    }
}
