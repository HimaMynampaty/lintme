import { getGroqChatCompletion } from "./llmHelperGroq.js";


/**
 * Extract Inline Commands from AST
 * @param {object} ast - Parsed Markdown AST
 * @param {object} rules - Linting rules
 * @returns {Array} List of inline commands
 */
export function getInlineCommands(ast, rules) {
    let commands = [];

    function traverse(node) {
        if (node.type === "inlineCode") {
            commands.push({
                command: node.value,
                position: node.position?.start?.line || null
            });
        }
        if (node.children) node.children.forEach(traverse);
    }

    traverse(ast);
    return commands;
}


/**
 * Validate Inline Commands - Run in sandbox via backend and optionally validate via LLM
 * @param {Array} commands - List of extracted commands
 * @param {object} executionRules - Rules for execution validation
 * @returns {Promise<any[]>} List of failed commands
 */
export async function validateCommands(commands, executionRules) {
    if (!executionRules?.required) return [];

    try {
        const res = await fetch("http://localhost:5000/api/validate-commands", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                commands,
                timeout: executionRules.timeout || 5000,
                safe_mode: executionRules.safe_mode || false
            }),
        });

        if (!res.ok) {
            throw new Error(`Server Error: ${res.status}`);
        }

        const result = await res.json();

        // Filter only failed commands
        const failedCommands = result
            .filter(cmd => !cmd.success) // Keep only failed commands
            .map(cmd => ({
                command: cmd.command,
                line: cmd.line || "Unknown",
                error: cmd.message || "Unknown error",
            }));

        return failedCommands;
    } catch (error) {
        console.error("Error validating commands:", error);
        return [{ error: "Failed to connect to validation server." }];
    }
}

/**
 * Check for invalid spacing in inline commands.
 * @param {Array} commands - List of extracted inline commands.
 * @param {object} formattingRules - Formatting config from YAML.
 * @returns {Array} List of formatting issues.
 */
export function checkCommandFormatting(commands, formattingRules) {
    if (!formattingRules?.check_spaces) return [];

    const issues = [];

    const leadingTrailingSpacesRegex = /^\s+|\s+$/;
    const emptyOrWhitespaceOnlyRegex = /^\s*$/;

    for (const { command, position } of commands) {
        if (emptyOrWhitespaceOnlyRegex.test(command)) {
            issues.push({
                type: "empty",
                command,
                line: position || "Unknown",
                message: "Command is empty or contains only whitespace."
            });
        } else if (leadingTrailingSpacesRegex.test(command)) {
            issues.push({
                type: "whitespace",
                command,
                line: position || "Unknown",
                message: "Command has leading or trailing spaces."
            });
        }
    }

    return issues;
}
