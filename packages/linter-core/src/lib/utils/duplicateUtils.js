import { fromMarkdown } from "mdast-util-from-markdown";

/**
 * Detect repeated identical sentences in paragraphs, headings, links, and code
 * @param {string} markdown
 * @returns {Array<{ sentence: string, type: string, lines: number[] }>}
 */
export function detectDuplicateSentences(markdown) {
    const ast = fromMarkdown(markdown);
    const seen = {
        paragraph: new Map(),
        heading: new Map(),
        link: new Map(),
        code: new Map()
    };

    const results = [];

    function extractText(node) {
        if (!node) return "";
        if (node.type === "text" || node.type === "inlineCode" || node.type === "code") return node.value || "";
        if (Array.isArray(node.children)) return node.children.map(extractText).join(" ");
        return "";
    }

    function normalizeSentences(text) {
        return text
            .split(/(?<=[.!?])\s+|\n+/) // split on punctuation OR newlines
            .map(s => s.trim().toLowerCase().replace(/\s+/g, " "))
            .filter(Boolean);
    }

    function track(type, sentences, line) {
        const map = seen[type];
        for (const sentence of sentences) {
            const entry = map.get(sentence);
            if (entry) {
                entry.lines.push(line);
            } else {
                map.set(sentence, { sentence, lines: [line], type });
            }
        }
    }

    function traverse(node) {
        if (!node) return;
        const line = node.position?.start?.line || 0;

        if (node.type === "paragraph") {
            track("paragraph", normalizeSentences(extractText(node)), line);
        }

        if (node.type === "heading") {
            track("heading", normalizeSentences(extractText(node)), line);
        }

        if (node.type === "link") {
            track("link", normalizeSentences(extractText(node)), line);
        }

        if (node.type === "inlineCode" || node.type === "code") {
            track("code", normalizeSentences(extractText(node)), line);
        }

        if (Array.isArray(node.children)) {
            node.children.forEach(traverse);
        }
    }

    traverse(ast);

    for (const type of Object.keys(seen)) {
        for (const [sentence, info] of seen[type]) {
            if (info.lines.length > 1) {
                results.push({
                    sentence,
                    type,
                    lines: info.lines
                });
            }
        }
    }

    return results;
}

/**
 * Detect consecutive word repetitions like "very very"
 * @param {string} text - Raw Markdown text
 * @returns {Array<{ word: string, line: number }>}
 */
export function detectConsecutiveDuplicates(text) {
    const results = [];
    const lines = text.split(/\r?\n/);

    lines.forEach((line, index) => {
        const regex = /\b(\w+)\b\s+\b\1\b/gi;
        let match;
        while ((match = regex.exec(line)) !== null) {
            results.push({
                word: match[1],
                line: index + 1
            });
        }
    });

    return results;
}
