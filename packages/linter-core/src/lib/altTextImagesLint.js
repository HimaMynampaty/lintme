import axios from "axios";
import { getLLMSuggestions } from "./llmHelper.js";
import { getGroqChatCompletion } from "./llmHelperGroq.js";

/**
 * Extract Images from AST
 * @param {object} ast - Parsed Markdown AST
 * @returns {Array} List of image nodes with details
 */
export function getImages(ast) {
    const images = [];

    function traverse(node) {
        if (node.type === "image") {
            images.push({
                url: node.url,
                alt: node.alt || "",
                title: node.title || "",
                line: node?.position?.start?.line ?? null // Correct extraction of line number
            });
        }
        if (node.children) node.children.forEach(traverse);
    }

    traverse(ast);
    return images;
}

/**
 * Check for Missing Alt Text
 * @param {Array} images - List of image nodes
 * @param {object} altTextRules - Rules for alt text validation
 * @returns {Array} List of images missing alt text
 */
export function missingAltText(images, altTextRules) {
    if (!altTextRules.required) return [];
  
    // Set default level if not provided
    const defaultLevel = altTextRules.level || "warning";
  
    return images
      .filter(image => !isValidAltText(image.alt))
      .map(image => ({
        url: image.url,
        line: image.line ?? null, // Ensure correct line number is used
        level: defaultLevel
      }));
}
  
/**
 * Validate alt text - Ensure it's not empty or just spaces
 * @param {string} altText - Alt text content
 * @returns {boolean} True if valid, False if empty/whitespace-only
 */
export function isValidAltText(altText) {
    return typeof altText === 'string' && altText.trim().length > 0;
}
  
/**
 * Generate AI-based alt text suggestions using Groq API.
 * @param {Array} missingAltList - List of images missing alt text.
 * @param {object} suggestionsConfig - User-defined LLM settings.
 * @returns {Promise<string>} AI-generated alt text suggestions.
 */
export async function generateAltTextSuggestionsGroq(missingAltList, suggestionsConfig) {
    if (!missingAltList || missingAltList.length === 0) {
        console.warn("No images found for alt text suggestions.");
        return "No images found for suggestions.";
    }

    const model = suggestionsConfig.model || "llama-3.3-70b-versatile"; 
    const promptTemplate = suggestionsConfig.prompt || "Generate descriptive alt text for these images.";
    const imageDescriptions = missingAltList.map((img, index) => `Image ${index + 1}: ${img.url}`).join("\n");
    const formattedPrompt = `${promptTemplate}\n${imageDescriptions}`;

    console.log("Formatted Prompt:", formattedPrompt);

    try {
        const result = await getGroqChatCompletion(model, formattedPrompt);
        return result;
    } catch (error) {
        console.error("Error generating suggestions:", error);
        return `Error generating suggestions: ${error.message}`;
    }
}
