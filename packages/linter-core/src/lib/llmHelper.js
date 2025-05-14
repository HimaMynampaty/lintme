import axios from "axios";

/**
 * Get AI-generated suggestions from LLaMA 3 with Ollama.
 * @param {string} model - The LLM model to use (e.g., "llama3", "mistral").
 * @param {string} prompt - The fully formatted prompt.
 * @returns {Promise<string>} The raw response from LLM.
 */
export async function getLLMSuggestions(model, prompt) {
    const OLLAMA_URL = "http://localhost:11434/api/generate"; // Ollama's API

    if (!prompt || prompt.trim().length === 0) {
        console.warn("Empty prompt provided for LLM.");
        return "Error: Empty prompt.";
    }

    try {
        const response = await axios.post(OLLAMA_URL, {
            model: model,
            prompt: prompt,
            stream: false
        });

        const responseText = response.data.response.trim();

        // Ensure LLaMA 3 returns a meaningful response
        if (!responseText) {
            console.warn(`LLM (${model}) returned an empty response.`);
            return `No valid suggestions provided by ${model}.`;
        }

        return responseText;
    } catch (error) {
        console.error(`Error fetching AI suggestions from ${model}:`, error);
        return `Error generating suggestions with ${model}.`;
    }
}
