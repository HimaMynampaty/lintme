import { retext } from 'retext';
import retextEquality from 'retext-equality';
import retextProfanities from 'retext-profanities';

/**
 * Detect hate speech, bias, profanity, and user-defined terms
 */
export async function detectHateSpeech(markdown, ruleConfig = {}) {
  const results = [];
  const seen = new Set(); // To avoid duplicate entries
  const level = ruleConfig.level || 'warning';

  // Retext detection
  if (ruleConfig.use_retext) {
    const file = await retext()
      .use(retextEquality)
      .use(retextProfanities)
      .process(markdown);

    file.messages.forEach(message => {
      const line = Math.max(2, message['position']?.start?.line || 1);
      const word = (message.actual || message.source || 'unknown').toLowerCase();
      const suggestion = message.expected?.[0] || message.note || null;
      const key = `${line}-${word}`;

      if (!seen.has(key)) {
        results.push({
          line,
          word,
          suggestion,
          message: message.message,
          severity: level
        });
        seen.add(key);
      }
    });
  }

  // Custom hate word detection
  const lines = markdown.split("\n");
  const customWords = (ruleConfig.hate_words || []).map(w => w.toLowerCase());
  const customSuggestions = {};
  for (const [offensive, replacement] of Object.entries(ruleConfig.suggestions || {})) {
    customSuggestions[offensive.toLowerCase()] = replacement;
  }

  lines.forEach((text, i) => {
    const lineNumber = i + 1;
    const normalizedText = text.toLowerCase();

    customWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, "gi");
      if (regex.test(normalizedText)) {
        const key = `${lineNumber}-${word}`;
        if (!seen.has(key)) {
          results.push({
            line: Math.max(2, lineNumber),
            word,
            suggestion: customSuggestions[word] || null,
            message: `Detected potentially harmful term "${word}". Suggested: "${customSuggestions[word] || 'none'}"`,
            severity: level
          });
          seen.add(key);
        }
      }
    });
  });

  return results;
}

export async function autoFixHateSpeech(markdown, ruleConfig = {}) {
    let updated = markdown;
  
    // 1. Apply user-defined suggestions (case-insensitive)
    const suggestions = ruleConfig.suggestions || {};
    for (const [offensive, replacement] of Object.entries(suggestions)) {
      const regex = new RegExp(`\\b${offensive}\\b`, "gi");
      updated = updated.replace(regex, replacement);
    }
  
    // 2. Retext auto-fix
    if (ruleConfig.use_retext) {
      const file = await retext()
        .use(retextEquality)
        .use(retextProfanities)
        .process(updated);
  
      file.messages.forEach(msg => {
        if (msg.actual && msg.expected?.[0]) {
          const word = msg.actual.toLowerCase();
          const replacement = msg.expected[0];
          const regex = new RegExp(`\\b${word}\\b`, "gi");
          updated = updated.replace(regex, replacement);
        }
      });
    }
  
    return updated;
  }
  