import { getGroqChatCompletion } from "./llmHelperGroq.js";

/**
 * Sanitize LLM response to ensure it's parsable JSON
 */
function cleanJSONResponse(raw) {
    return raw
        .replace(/^\uFEFF/, "")                  // Remove BOM
        .replace(/```json/i, "")                 // Remove opening code block
        .replace(/```/, "")                      // Remove closing code block
        .replace(/\r/g, "")                      // Remove carriage returns
        .replace(/\\(?!["\\/bfnrtu])/g, "\\\\")  // Escape bad backslashes
        .replace(/\t/g, "  ")                    // Replace tabs with spaces
        .trim();
}

/**
 * Try parsing cleaned JSON with graceful fallback
 */
function tryParseJSON(text, type) {
    try {
        return JSON.parse(text);
    } catch (err) {
        console.error(`[${type.toUpperCase()}] LLM parse error: ${err.message}`);
        console.warn(`[${type.toUpperCase()}] Failed JSON string:\n`, text.slice(0, 300) + "...");
        return null;
    }
}

/**
 * Recalculate correct line numbers for AI suggestions based on the actual Markdown content
 * @param {Array} suggestions - LLM suggestions with original content
 * @param {string} markdown - Full markdown input
 * @returns {Array} suggestions with corrected line numbers
 */
function recalculateLineNumbers(suggestions, markdown) {
    const lines = markdown.split("\n");

    return suggestions.map(suggestion => {
        const normalizedOriginal = suggestion.original.trim();

        const matchedLineIndex = lines.findIndex(line =>
            line.includes(normalizedOriginal)
        );

        return {
            ...suggestion,
            line: matchedLineIndex >= 0 ? matchedLineIndex + 1 : suggestion.line // fallback to LLM value
        };
    });
}

/**
 * Lint grammar or spelling using LLM
 * @param {string} markdown - The markdown content to lint
 * @param {object} rules - Rule config from YAML
 * @param {string} type - "grammar" or "spelling"
 * @returns {Promise<{ suggestions: Array, fixedText: string }>}
 */
export async function checkGrammarOrSpelling(markdown, rules, type = "grammar") {
    if (!rules?.required || !rules.llm_validation) {
        return { suggestions: [], fixedText: markdown };
    }

    const {
        prompt: userPrompt = "",
        model = "llama-3.3-70b-versatile",
        fix = false,
    } = rules.llm_validation;

    const basePrompt = `You are a markdown-aware ${type} checker.

Return ONLY a JSON object like this (no code blocks or extra explanation):
{
  "suggestions": [
    {
      "line": <line number>,
      "original": "<text>",
      "suggestion": "<corrected text>",
      "message": "<brief description>"
    }
  ],
  "fixedText": "<entire corrected markdown>"
}

Important:
- Escape all newlines inside strings as \\n
- Do NOT use multiline string values
- Do NOT wrap the output in \`\`\`
- Do NOT return commentary or additional explanations`;

    const fullPrompt = `${basePrompt}

Additional Instructions: ${userPrompt}

Markdown:
-----
${markdown}
-----`;

    let raw = "";
    try {
        raw = await getGroqChatCompletion(model, fullPrompt);
        const cleaned = cleanJSONResponse(raw);

        if (!cleaned.startsWith("{")) {
            console.warn(`[${type.toUpperCase()}] CLEANED RESPONSE:\n`, cleaned);
            throw new Error("Invalid JSON structure");
        }

        const parsed = tryParseJSON(cleaned, type);
        if (!parsed) throw new Error("Failed to parse cleaned response");

        const suggestions = parsed.suggestions || [];
        const correctedSuggestions = recalculateLineNumbers(suggestions, markdown);

        return {
            suggestions: correctedSuggestions,
            fixedText: fix ? (parsed.fixedText || markdown) : markdown,
        };
    } catch (err) {
        console.error(`[${type.toUpperCase()}] LLM error:`, err.message);
        return { suggestions: [], fixedText: markdown };
    }
}
