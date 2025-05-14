// tocLint.js

import { toString } from 'mdast-util-to-string';


function normalize(text) {
  return text.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Detects if a Table of Contents (TOC) exists in the Markdown AST.
 */
export function hasTableOfContents(ast) {
  for (let i = 0; i < ast.children.length - 1; i++) {
    const node = ast.children[i];
    const next = ast.children[i + 1];

    if (
      node.type === 'heading' &&
      normalize(toString(node)).includes("tableofcontents") &&
      next.type === 'list'
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Generates a nested Markdown Table of Contents (TOC) from an AST.
 * @param {object} ast - Markdown AST
 * @param {string} heading - Heading for the TOC section
 * @returns {string} TOC markdown
 */
export function generateTOC(ast, heading = "## Table of Contents") {
  const tocLines = [heading];
  const indentUnit = "  ";

  ast.children.forEach(node => {
    if (node.type === 'heading' && node.depth >= 1 && node.depth <= 4) {
      const text = toString(node).trim();
      const slug = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();

      // Calculate indentation based on heading depth
      const indent = indentUnit.repeat(Math.max(0, node.depth - 2));
      tocLines.push(`${indent}- [${text}](#${slug})`);
    }
  });

  return tocLines.join('\n');
}

/**
 * Inserts the TOC into the Markdown string after the first heading.
 */
export function insertTOCIntoMarkdown(markdown, tocMarkdown) {
  const lines = markdown.split('\n');
  let insertIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(/^#{1,6} /)) {
      insertIndex = i;
      break;
    }
  }

  lines.splice(insertIndex, 0, "", tocMarkdown, "");
  return lines.join('\n');
}
