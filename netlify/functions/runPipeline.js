import { runPipeline, parseRules } from '../../packages/pipeline-runner/index.js';

export async function handler(event) {
  try {
    const { yamlText, markdown } = JSON.parse(event.body);
    const ctx = await runPipeline(yamlText, markdown);

    // Add operator awareness (optional)
    let lastOperator = null;
    const parsed = parseRules(yamlText);
    if (!parsed.error) {
      const steps = parsed?.pipeline ?? [];
      lastOperator = steps[steps.length - 1]?.operator;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ ...ctx, lastOperator }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}
