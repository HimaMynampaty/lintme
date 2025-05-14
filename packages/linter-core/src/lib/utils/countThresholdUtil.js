/**
 * Fetch word list from the backend
 * @param {string} absolutePath - Absolute file path to the word list
 * @returns {Promise<string[]>}
 */
export async function fetchWordListFromServer(absolutePath) {
    if (!absolutePath) return [];

    try {
        const response = await fetch(`http://localhost:5000/api/wordlist?path=${encodeURIComponent(absolutePath)}`);
        const data = await response.json();

        if (!response.ok) {
            console.warn("Error fetching word list from server:", data.error || response.statusText);
            return [];
        }

        return Array.isArray(data.words) ? data.words : [];
    } catch (err) {
        console.warn("Failed to fetch word list from server:", err.message);
        return [];
    }
}


/**
 * Count word repetition across the full markdown (raw text)
 * @param {string} text - Full Markdown content
 * @param {Array<string>} words - Target words
 * @param {number} threshold - Max allowed count
 * @param {string} level - Warning or error
 * @returns {Array<{word: string, count: number, level: string}>}
 */
export function checkPageLevelRepetition(text, words, threshold, level = "warning") {
    const result = [];
    const wordCounts = countTargetPhrases(text, words);

    for (const word of words) {
        const count = wordCounts[word] || 0;
        if (count > threshold) {
            result.push({ word, count, level });
        }
    }

    return result;
}


/**
 * Count all target word/phrase frequencies (case-insensitive)
 * @param {string} text - Any text input
 * @param {string[]} targets - Array of target words or phrases
 * @returns {Object} word/phrase -> count map
 */
export function countTargetPhrases(text, targets) {
    const counts = {};
    const lowerText = text.toLowerCase();

    for (const target of targets) {
        const pattern = new RegExp(`${target.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}`, "gi");
        const matches = lowerText.match(pattern);
        counts[target] = matches ? matches.length : 0;
    }

    return counts;
}

export function extractTextFromNode(node) {
    if (!node) return "";
    if (node.type === "text") return node.value;
    if (node.type === "inlineCode" || node.type === "code") return node.value || "";
    if (Array.isArray(node.children)) {
      return node.children.map(extractTextFromNode).join(" ");
    }
    return "";
  }

/**
 * Collects all text content from nodes of a certain type
 * @param {object} ast - Markdown AST
 * @param {string} nodeType - Node type to collect (e.g., "paragraph", "heading")
 * @returns {{ texts: string[], nodeInfos: Array<{ line: number, text: string }> }}
 */
export function collectTextsByNodeType(ast, nodeType) {
    const texts = [];
    const nodeInfos = [];
  
    function traverse(node) {
      if (!node) return;
  
      if (node.type === nodeType) {
        const text = extractTextFromNode(node);
        const line = node.position?.start?.line || 0;
        texts.push(text);
        nodeInfos.push({ text, line });
      }
  
      if (Array.isArray(node.children)) {
        node.children.forEach(traverse);
      }
    }
  
    traverse(ast);
    return { texts, nodeInfos };
  }


/**
 * Aggregate text from all nodes of a given type, then count usage
 */
export function checkASTTypeSummed(ast, words, targetType, threshold, level = "warning") {
const { texts, nodeInfos } = collectTextsByNodeType(ast, targetType);
const combinedText = texts.join(" ");
const firstLine = nodeInfos[0]?.line || 0;

const wordCounts = countTargetPhrases(combinedText, words);
const results = [];

for (const word of words) {
    const count = wordCounts[word] || 0;
    if (count > threshold) {
    results.push({
        word,
        count,
        level,
        line: firstLine
    });
    }
}

return results;
}
  
/**
 * Check if any node of a given type exceeds a character limit.
 */
export function checkASTNodeLength(ast, nodeType, maxLength, level = "warning") {
  const { nodeInfos } = collectTextsByNodeType(ast, nodeType);
  const results = [];

  for (const { text, line } of nodeInfos) {
    if (text.length > maxLength) {
      results.push({
        nodeType,
        length: text.length,
        threshold: maxLength,
        level,
        line
      });
    }
  }

  return results;
}

