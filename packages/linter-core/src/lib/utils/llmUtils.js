import { getGroqChatCompletion } from "../llmHelperGroq.js";

/**
 * LLM validation: Injects rule definitions & parses fixed Markdown if `fix: true`
 */
export async function runLLMValidation({ markdown, ruleConfig, ruleName = "custom" }) {
  const {
    llm_validation: {
      prompt: userPrompt = "",
      model = "llama-3.3-70b-versatile",
      fix = false,
    } = {},
  } = ruleConfig;

  const ruleDefinition = { ...ruleConfig };


  const fixNotice = fix
    ? `\nSince "auto_fix" or "fix" is set to true, You will append the corrected Markdown below this line:\n---FIXED MARKDOWN BELOW---\nDo not wrap it in backticks or explain anything beyond that point.`
    : "";

  const fullPrompt = `
You are a Markdown linter for the rule: "${ruleName}".

Please analyze the Markdown **only using the following rule definition, make sure to iterate any checks for all the items provided** and provide helpful feedback based strictly on it.

Rule Definition:
${JSON.stringify(ruleDefinition, null, 2)}

${fixNotice}

Markdown to review:
-----
${markdown}
-----

Instructions:
${userPrompt}
`.trim();

  try {
    const rawResponse = await getGroqChatCompletion(model, fullPrompt);
    //console.log(`[LLM-${ruleName}] Raw response:\n`, rawResponse);

    let fixedText = markdown;

    if (fix) {
      const marker = "---FIXED MARKDOWN BELOW---";
      const markerIndex = rawResponse.indexOf(marker);
      if (markerIndex !== -1) {
        fixedText = rawResponse.slice(markerIndex + marker.length).trim();
      } else {
        console.warn(`[LLM-${ruleName}] Fix enabled, but no fixed Markdown found.`);
      }
    }

    return {
      rawResponse,
      fixedText,
    };
  } catch (err) {
    console.error(`[LLM-${ruleName}] Error: ${err.message}`);
    return {
      rawResponse: `LLM Error: ${err.message}`,
      fixedText: markdown,
    };
  }
}
