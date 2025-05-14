/**
 * Resolve words from a standardized rule config:
 * - `words`: array of inline terms
 * - `word_list`: path to external file with terms
 *
 * @param {object} config - Rule config object
 * @returns {Promise<string[]>} - Merged, deduplicated word list
 */
export async function resolveWordsFromRuleConfig(config) {
    const inlineWords = Array.isArray(config.words) ? config.words : [];
    const filePath = config.word_file;

    let fileWords = [];

    if (filePath) {
        try {
            const response = await fetch(`http://localhost:5000/api/wordlist?path=${encodeURIComponent(filePath)}`);
            const data = await response.json();

            if (!response.ok) {
                console.warn("Error fetching word list from server:", data.error || response.statusText);
            } else if (Array.isArray(data.words)) {
                fileWords = data.words;
            }
        } catch (err) {
            console.warn("Failed to fetch word list from server:", err.message);
        }
    }

    return [...new Set([...inlineWords, ...fileWords])];
}
