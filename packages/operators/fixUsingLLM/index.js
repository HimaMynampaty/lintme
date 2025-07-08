import yaml from 'js-yaml'; 

export async function run(ctx, cfg = {}) {
  const {
    prompt = '',
    model = 'llama-3.3-70b-versatile'
  } = cfg;

  if (!prompt.trim()) {
    ctx.diagnostics.push({
      line: 1,
      severity: 'error',
      message: 'fixUsingLLM: Prompt is required'
    });
    return ctx;
  }

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

  const diagnosticText  = (ctx.diagnostics || [])
    .map(d => `${d.severity.toUpperCase()} [${d.line}]: ${d.message}`)
    .join('\n');

  const fullPrompt = `
You are a Markdown linter and fixer.

## Rule Definition (YAML):
${ruleYaml}

## Intermediate Operator Outputs:
${JSON.stringify(operatorOutputs, null, 2)}

## Current Diagnostics
${diagnosticText || '(none)'}


## Markdown to Review:
\`\`\`markdown
${ctx.markdown}
\`\`\`

## Instructions:
Use the rule definition and diagnostics above to identify and fix issues in the Markdown.

Apply the rule's intent exactly as described in the YAML.

You MUST base your fixes only on the rule and its configuration — do NOT invent new rules. If there are no issues related to the rule passes, you must return the same markdown content as fix. 

Additionally:
${prompt}

## Required Output:
You MUST append only the fixed Markdown version **below** this line and nothing else:


---FIXED MARKDOWN BELOW---

Only the corrected Markdown should be present below that line.
Do NOT include explanations, notes, or wrap the output in code blocks.
`.trim();

  console.log('[fixUsingLLM] Prompt sent to LLM:\n', fullPrompt);

  const llmResult = await callGroqModel(model, fullPrompt);

  console.log('[fixUsingLLM] Raw LLM response:\n', llmResult);

  const marker = "---FIXED MARKDOWN BELOW---";
  let fixedText = ctx.markdown;
  const markerIndex = llmResult.indexOf(marker);

  if (markerIndex !== -1) {
    fixedText = llmResult.slice(markerIndex + marker.length).trim();
  } else {
    ctx.diagnostics.push({
      line: 1,
      severity: 'warning',
      message: 'fixUsingLLM: Marker not found — falling back to raw LLM output.'
    });
      ctx.rawLLMFallback = llmResult;
      fixedText = llmResult
        .replace(/```(markdown)?/g, '')
        .trim();
  }

  ctx.fixedMarkdown = fixedText;
  ctx.llmResponse = llmResult;

  return { prompt, model };
}

async function callGroqModel(model, prompt) {
  try {
    const response = await fetch("http://localhost:5000/api/groq-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, prompt })
    });

    const data = await response.json();
    return data.result || "No valid response.";
  } catch (error) {
    console.error("fixUsingLLM: Error calling Groq API", error);
    return "Error generating suggestions.";
  }
}
