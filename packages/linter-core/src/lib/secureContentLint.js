import { getGroqChatCompletion } from "./llmHelperGroq.js";

/**
 * Check README for sensitive data using regex and optional LLM
 * @param {string} content - Raw Markdown content
 * @param {object} config - rules.securityCheck.sensitive_data
 * @returns {Promise<{ output: string, diagnostics: Array<{ line: number, severity: string, message: string, suggestion?: string }> }>}
 */
export async function checkSensitiveData(content, config) {
    let output = "";
    const diagnostics = [];

    if (!config?.required) {
        return {
            output: "Security check skipped (not required).\n",
            diagnostics
        };
    }

    const patterns = config.regex_patterns || [];
    const matchedSecrets = [];

    // 1. Regex Pattern Scan
    patterns.forEach((pattern) => {
        try {
            const regex = new RegExp(pattern, "g");
            const matches = [...content.matchAll(regex)];
            if (matches.length > 0) {
                matches.forEach(match => {
                    matchedSecrets.push({
                        match: match[0],
                        index: match.index
                    });
                });
            }
        } catch (e) {
            console.warn(`Invalid regex: ${pattern}`);
        }
    });

    if (matchedSecrets.length > 0) {
        output += `\nSensitive Patterns Detected:\n`;
        const lines = content.split("\n");

        matchedSecrets.forEach((secret, i) => {
            const lineNumber = lines.findIndex(line => line.includes(secret.match)) + 1;
            const msg = `Potential sensitive value found: "${secret.match}"`;
            const suggestion = "Redact or remove sensitive information before sharing publicly.";

            diagnostics.push({
                line: lineNumber || 1,
                severity: config.level || "error",
                message: msg,
                suggestion
            });

            output += `  ${i + 1}. Line ${lineNumber}: ${msg}\n`;
        });

        output += ` Please remove or redact these secrets before publishing.\n`;
    } else {
        output += `\nNo sensitive data matched known patterns.\n`;
    }

    // 2. LLM-based review
    if (config.llm_validation?.required) {
        const model = config.llm_validation.model || "llama-3.3-70b-versatile";
        const prompt = config.llm_validation.prompt || "Check for any sensitive information or credentials.";

        let fullPrompt = `${prompt}\n\nContent:\n---\n${content}\n---`;

        if (patterns.length > 0) {
            fullPrompt = `${prompt}\nThese patterns are already being scanned:\n- ${patterns.join("\n- ")}\n\nContent:\n---\n${content}\n---`;
        }

        const llmResponse = await getGroqChatCompletion(model, fullPrompt);
        output += `\nLLM Security Review:\n${llmResponse}\n`;
    }

    return { output, diagnostics };
}
