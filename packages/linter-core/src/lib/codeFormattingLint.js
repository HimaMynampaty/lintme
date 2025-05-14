/**
 * Extract all code blocks from the Markdown AST
 * @param {object} ast - Parsed Markdown AST
 * @returns {Array} List of code blocks with lang and line info
 */
export function getCodeBlocks(ast) {
    const codeBlocks = [];

    function traverse(node) {
        if (node.type === "code") {
            codeBlocks.push({
                lang: node.lang || "",
                value: node.value || "",
                line: node?.position?.start?.line ?? null
            });
        }
        if (node.children) node.children.forEach(traverse);
    }

    traverse(ast);
    return codeBlocks;
}

/**
 * Fixes malformed fences, reports indentation issues,
 * validates language and code block format (fenced vs indented).
 * @param {string} markdown - Raw Markdown content
 * @param {object} rules - codeFormatting rules from YAML
 * @param {object} ast - Markdown AST from fromMarkdown()
 * @returns {{ updatedMarkdown: string, issues: Array, invalidLangs: Array }}
 */
export function checkCodeFormatting(markdown, rules, ast) {
    let fixedLines = markdown.split("\n");
    const issues = [];
    const invalidLangs = [];

    const formattingRules = rules.formatting || {};
    const languageRules = rules.language || {};
    const allowedLangs = languageRules.allowed || [];
    const validFormats = formattingRules.valid_formats || ["fenced"];

    const allowFenced = validFormats.includes("fenced");
    const allowIndented = validFormats.includes("indented");

    // === 1. Line-by-line scan and fix
    if (formattingRules.required) {
        const newFixedLines = [];
        let insideFencedBlock = false;
    
        for (let i = 0; i < fixedLines.length; i++) {
            let line = fixedLines[i];
            const trimmed = line.trim();
    
            // === Fix or detect malformed fence lines
            const malformedFenceMatch = trimmed.match(/^`{1,2}(\s*\w+)?$|^`{4,}\s*([^\s]+)?/);
            if (malformedFenceMatch) {
                const lang = malformedFenceMatch[1]?.trim() || "";
                const fixedFence = lang ? `\`\`\` ${lang}` : "```";
    
                issues.push({
                    line: i + 1,
                    message: `Malformed fence detected.${formattingRules.auto_fix ? ` Auto-fixed to ${fixedFence}` : ""}`,
                });
    
                newFixedLines.push(formattingRules.auto_fix ? fixedFence : line);
                insideFencedBlock = !insideFencedBlock;
                continue;
            }
    
            // === Fenced block start/end
            if (/^```/.test(trimmed)) {
                insideFencedBlock = !insideFencedBlock;
    
                if (!allowFenced) {
                    issues.push({
                        line: i + 1,
                        message: "Fenced code block used, but 'fenced' format is not allowed.",
                    });
                }
    
                newFixedLines.push(line);
                continue;
            }
    
            // === Indented block usage outside fenced
            if (/^( {4}|\t)/.test(line)) {
                if (!insideFencedBlock && !allowIndented) {
                    issues.push({
                        line: i + 1,
                        message: "Indented code block used, but 'indented' format is not allowed.",
                    });
                }
    
                // Report indentation style issues
                if (insideFencedBlock) {
                    const match = line.match(/^( +)/);
                    const spaceCount = match?.[1]?.length || 0;
    
                    if (spaceCount > 0 && spaceCount % 4 !== 0) {
                        issues.push({
                            line: i + 1,
                            message: `Incorrect indentation (${spaceCount} spaces).`,
                        });
                    }
    
                    if (/^ {0,3}\t|^\t {1,3}/.test(line)) {
                        issues.push({
                            line: i + 1,
                            message: "Mixed tabs and spaces detected in code block.",
                        });
                    }
                }
            }
    
            newFixedLines.push(line);
        }
    
        // Only update lines if auto_fix is true
        if (formattingRules.auto_fix) {
            fixedLines = newFixedLines;
        }
    }
    
    // === 2. Language validation using AST
    if (languageRules.required && ast) {
        const codeBlocks = getCodeBlocks(ast);

        codeBlocks.forEach(block => {
            const lang = block.lang.trim();
            const line = block.line || null;

            if (!lang) {
                issues.push({
                    line,
                    message: "Code block missing language tag (from AST).",
                });
            } else if (!allowedLangs.includes(lang)) {
                invalidLangs.push({
                    line,
                    lang,
                    message: `Code block language '${lang}' is not allowed.`,
                });
            }
        });
    }

    return {
        updatedMarkdown: fixedLines.join("\n"),
        issues,
        invalidLangs,
    };
}
