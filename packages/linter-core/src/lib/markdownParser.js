import { fromMarkdown } from "mdast-util-from-markdown";

/**
 * @typedef {import('mdast').Root} Root
 */

/**
 * Convert Markdown to AST (Abstract Syntax Tree)
 * @param {string} markdown - Markdown content
 * @returns {object} AST representation of the Markdown
 */
export function generateAST(markdown) {
    return fromMarkdown(markdown);
}
