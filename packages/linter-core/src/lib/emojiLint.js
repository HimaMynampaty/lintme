/**
 * Regex to match both Unicode emojis and emoji shortcodes
 */
const emojiRegex = /:[a-zA-Z0-9_+-]+:|[\p{Emoji_Presentation}\p{Extended_Pictographic}\u{FE0F}\u{1F1E6}-\u{1F1FF}]/gu;

/**
 * Count emojis using regex matching
 * @param {string} text - Input text (line/paragraph/document)
 * @returns {number} Emoji count
 */
export function countEmojis(text) {
  const matches = text.match(emojiRegex);
  return matches ? matches.length : 0;
}

/**
 * Check for emoji violations based on rules.
 * @param {string} markdown - Input markdown text
 * @param {object} emojiRules - Emoji rules from rules.yaml
 * @returns {Array} List of violations
 */
export function checkEmojiViolations(markdown, emojiRules) {
  // Set a default level if not provided
  const defaultLevel = emojiRules.level || "warning";

  const lines = markdown.split('\n');
  const paragraphs = markdown.split(/\n\s*\n/); // Paragraphs detected using blank lines
  let totalEmojis = 0;
  const violations = [];
  const lineViolations = new Set(); // Track lines with violations

  // Track line numbers
  let currentLine = 1;

  // Line-Level Check
  lines.forEach((line, index) => {
    const emojiCount = countEmojis(line);
    totalEmojis += emojiCount;

    if (emojiCount > emojiRules.max_per_line) {
      violations.push({
        type: 'line',
        line: index + 1,
        emojiCount,
        level: defaultLevel,
        message: `Exceeded emoji limit (${emojiCount}/${emojiRules.max_per_line})`
      });
      lineViolations.add(index + 1);
    }

    currentLine++;
  });

  // Paragraph-Level Check
  let paragraphStartLine = 1;
  paragraphs.forEach((paragraph) => {
    const paragraphLines = paragraph.split('\n');
    const emojiCount = countEmojis(paragraph);
    const paragraphEndLine = paragraphStartLine + paragraphLines.length - 1;

    if (emojiCount > emojiRules.max_per_paragraph) {
      violations.push({
        type: 'paragraph',
        startLine: paragraphStartLine,
        endLine: paragraphEndLine,
        emojiCount,
        level: defaultLevel,
        message: `Exceeded emoji limit (${emojiCount}/${emojiRules.max_per_paragraph})`
      });
    }

    // Update paragraph start for the next block (assume one blank line between paragraphs)
    paragraphStartLine = paragraphEndLine + 2;
  });

  // Document-Level Check
  if (totalEmojis > emojiRules.max_per_document) {
    violations.push({
      type: 'document',
      emojiCount: totalEmojis,
      level: defaultLevel,
      message: `Exceeded emoji limit in document (${totalEmojis}/${emojiRules.max_per_document})`
    });
  }

  return violations;
}
