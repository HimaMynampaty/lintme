import yaml from 'js-yaml';

export async function run(ctx, cfg = {}) {
  const {
    model = 'llama-3.3-70b-versatile'
  } = cfg;

  const ruleDefinition = {
    name: ctx.name || ctx.rule || 'Unnamed Rule',
    description: ctx.description || '',
    pipeline: ctx.pipeline || [],
  };

  const ruleYaml = yaml.dump({
    rule: ruleDefinition.name,
    description: ruleDefinition.description,
    pipeline: ruleDefinition.pipeline,
  });

  const operatorOutputs = (ctx.pipelineResults || []).map(step => ({
    name: step.name,
    output: step.data
  }));

  const diagnosticText = (ctx.diagnostics || [])
    .map(d => `${d.severity.toUpperCase()} [${d.line}]: ${d.message}`)
    .join('\n');

  const fullPrompt = `
You are a Markdown rule checker. Your job is to determine if the given Markdown violates the provided rule.

## Rule Definition (YAML):
${ruleYaml}

## Intermediate Outputs:
${operatorOutputs.length > 0
    ? operatorOutputs.map(step => `- ${step.name}: ${JSON.stringify(step.output, null, 2)}`).join('\n')
    : '(none)'}

## Previous Diagnostics:
${diagnosticText || '(none)'}

## Markdown Document:
\`\`\`markdown
${ctx.markdown}
\`\`\`

---

## Instructions:

1. First, determine if the Markdown violates the rule.
2. If it **does not**, reply exactly as follows:

**PASS**

3. If it **does**, reply exactly in this format:

**FAIL**
Line(s): [list affected line numbers]
Issue: [brief summary of the issue]
Suggestion: [suggest a fix using natural language]

Respond only in the above format — no code blocks, no additional comments.
`.trim();

  //console.log('[evaluateUsingLLM] Prompt sent to LLM:\n', fullPrompt);

  const llmResult = await callGroqModel(model, fullPrompt);
  //console.log('[evaluateUsingLLM] Raw LLM response:\n', llmResult);

  ctx.llmResponse = llmResult;
  const result = llmResult.trim();

  if (result.startsWith('**PASS**')) {
    ctx.diagnostics.push({
      line: 1,
      severity: 'info',
      message: 'LLM evaluation passed. No issues found.'
    });
  } else if (result.startsWith('**FAIL**')) {
    const lineMatch = result.match(/Line\(s\):\s*(.*)/i);
    const issueMatch = result.match(/Issue:\s*(.*)/i);
    const suggestionMatch = result.match(/Suggestion:\s*(.*)/i);

    const line = lineMatch ? parseInt(lineMatch[1].split(/,|\s+/)[0]) || 1 : 1;

    ctx.diagnostics.push({
      line,
      severity: 'error',
      message: issueMatch?.[1] || 'Issue found by LLM.'
    });

    ctx.diagnostics.push({
      line,
      severity: 'info',
      message: suggestionMatch?.[1] || 'No suggestion provided.'
    });
  } else {
    ctx.diagnostics.push({
      line: 1,
      severity: 'warning',
      message: `LLM returned an unrecognized format: "${result}"`
    });
  }

  return {
    model,
    result
  };
}

async function callGroqModel(model, prompt) {
  try {
    const response = await fetch("https://lintme-backend.onrender.com/api/groq-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, prompt })
    });

    const data = await response.json();
    return data.result || "No valid response.";
  } catch (error) {
    console.error("evaluateUsingLLM: Error calling Groq API", error);
    return "Error during evaluation.";
  }
}
