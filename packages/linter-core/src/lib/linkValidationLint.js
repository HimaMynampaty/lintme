    /**
     * Check for malformed links using RegEx (not caught by AST)
     */
    export function checkLinkFormatting(markdown, formattingRules) {
        if (!formattingRules?.required) return [];

        const issues = [];
        const lines = markdown.split("\n");

        const missingCloseParen = /\[[^\]]*\]\([^\)]*$/;
        const missingCloseBracket = /\[[^\]]*$/;
        const missingOpenBracket = /^[^\[]+\][^\(]*\([^\)]*\)/;
        const missingOpenParen = /\[[^\]]*\][^\(]*[^)]$/;
        const emptyLinkPattern = /\[\s*\]\(\s*\)/g;

        lines.forEach((line, index) => {
            const lineNumber = index + 1;

            if (emptyLinkPattern.test(line)) {
                issues.push({
                    type: "formatting",
                    line: lineNumber,
                    content: line.trim(),
                    message: "Empty link: both text and URL are missing."
                });
            }

            if (missingCloseParen.test(line)) {
                issues.push({
                    type: "formatting",
                    line: lineNumber,
                    content: line.trim(),
                    message: "Malformed link: missing closing parenthesis ')'."
                });
            }

            if (missingCloseBracket.test(line)) {
                issues.push({
                    type: "formatting",
                    line: lineNumber,
                    content: line.trim(),
                    message: "Malformed link: missing closing bracket ']'."
                });
            }

            if (missingOpenBracket.test(line)) {
                issues.push({
                    type: "formatting",
                    line: lineNumber,
                    content: line.trim(),
                    message: "Malformed link: missing opening bracket '['."
                });
            }

            if (missingOpenParen.test(line)) {
                issues.push({
                    type: "formatting",
                    line: lineNumber,
                    content: line.trim(),
                    message: "Malformed link: missing opening parenthesis '('."
                });
            }
        });

        return issues;
    }


    /**
     * Fixes malformed links and logs what was fixed.
     * @returns {{ updatedMarkdown: string, fixes: Array<{ line: number, original: string, fixed: string }> }}
     */
    export function fixMalformedLinks(issues, markdown) {
        const lines = markdown.split("\n");
        const fixes = [];

        issues.forEach(issue => {
            const lineIndex = issue.line - 1;
            const originalLine = lines[lineIndex];

            if (!originalLine.includes(issue.content)) return;

            let fixedLine = issue.content;

            const hasOpenBracket = fixedLine.includes("[");
            const hasCloseBracket = fixedLine.includes("]");
            const hasOpenParen = fixedLine.includes("(");
            const hasCloseParen = fixedLine.includes(")");

            const safeToFix = hasOpenBracket && hasOpenParen;
            if (!safeToFix) return;

            // Add missing ]
            if (hasOpenBracket && !hasCloseBracket && hasOpenParen) {
                const openParenIndex = fixedLine.indexOf("(");
                if (openParenIndex !== -1) {
                    fixedLine = fixedLine.slice(0, openParenIndex) + "]" + fixedLine.slice(openParenIndex);
                }
            }

            // Add missing )
            if (hasOpenParen && !hasCloseParen) {
                fixedLine += ")";
            }

            // Replace in line
            lines[lineIndex] = originalLine.replace(issue.content, fixedLine);

            fixes.push({
                line: issue.line,
                original: issue.content,
                fixed: fixedLine,
            });
        });

        return {
            updatedMarkdown: lines.join("\n"),
            fixes,
        };
    }




    /**
     * Extract all valid links from AST
     */
    export function getLinksFromAST(ast) {
        const links = [];

        function traverse(node) {
            if (node.type === "link") {
                links.push({
                    url: node.url,
                    text: node.children?.[0]?.value || "",
                    title: node.title || "",
                    line: node.position?.start?.line || null,
                    internal: node.url.startsWith("#")
                });
            }
            if (node.children) node.children.forEach(traverse);
        }

        traverse(ast);
        return links;
    }

    /**
     * Check link schemes using AST + list of allowed schemes
     * @param {Array} links - Parsed link nodes from AST
     * @param {string[]} allowedSchemes
     * @returns {string} output - Human-readable list of invalid links
     */
    export function checkLinkSchemesUsingAST(links, allowedSchemes) {
        if (!allowedSchemes || allowedSchemes.length === 0) return "";

        const externalLinks = links.filter(link => !link.internal);

        const invalidLinks = externalLinks.filter(link => {
            const scheme = link.url.split(":")[0];
            return !allowedSchemes.includes(scheme);
        });

        if (invalidLinks.length > 0) {
            let output = `\n Invalid Link Schemes Detected:\n`;
            invalidLinks.forEach((link, i) => {
                output += `  ${i + 1}. Line ${link.line}: Uses '${link.url.split(":")[0]}' → ${link.url}\n`;
            });
            return output;
        }

        return "\n All links use valid schemes.\n";
    }


    /**
     * Validate internal links based on headings in the AST
     */
    export function validateInternalLinks(links, rules, ast) {
        if (!rules?.required) return [];

        const internalLinks = links.filter(link => link.internal);
        const headings = new Set();

        function collectHeadings(node) {
            if (node.type === "heading") {
                const text = node.children?.map(c => c.value || "").join("") || "";
                const slug = "#" + text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                headings.add(slug);
            }
            if (node.children) node.children.forEach(collectHeadings);
        }

        collectHeadings(ast);

        const issues = [];

        internalLinks.forEach(link => {
            if (!headings.has(link.url)) {
                issues.push({
                    type: "broken-internal",
                    url: link.url,
                    line: link.line,
                    message: "Internal link does not match any heading"
                });
            }
        });

        return issues;
    }

    /**
     * Validate external links using HTTP status
     */
    export async function validateLinkAvailability(links, availabilityRules) {
        if (!availabilityRules?.required) return [];

        const externalLinks = links.filter(link => !link.internal);
        const issues = [];
        console.log("external links checking")
        for (const link of externalLinks) {
            try {
                const res = await fetch("http://localhost:5000/api/check-link", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ url: link.url }),
                });

                const data = await res.json();

                if (!availabilityRules.check_external.allowed_status_codes.includes(data.status)) {
                    issues.push({
                        type: "broken-external",
                        url: link.url,
                        line: link.line,
                        message: `Unexpected response code: ${data.status}`
                    });
                }
            } catch (err) {
                issues.push({
                    type: "broken-external",
                    url: link.url,
                    line: link.line,
                    message: "Request failed or timed out"
                });
            }
        }

        return issues;
    }