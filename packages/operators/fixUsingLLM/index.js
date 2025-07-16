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
  You are a Markdown linter. Your job is to fix ONLY the issues that violate the specific rule defined below.

  ## Rule Definition (YAML):
  ${ruleYaml}

  ## Operator-Specific Prompt:
  ${prompt}

  ## Diagnostics from Previous Steps:
  ${diagnosticText || '(none)'}

  ## Markdown Document:
  \`\`\`markdown
  ${ctx.markdown}
  \`\`\`

  ## Very Important Instructions:

  - ONLY fix issues that are directly and clearly covered by the rule above.
  - DO NOT make any changes based on grammar, tone, inclusivity, or clarity unless the rule *explicitly* calls for it.
  - DO NOT invent improvements or infer intent not stated in the rule.
  - If the Markdown content does NOT violate the rule, return the **original input exactly as is** — unchanged.
  - You MUST behave like a deterministic function: same input → same output.
  - If there is even slight ambiguity in whether something violates the rule, you MUST NOT change it.
  - DO NOT change headings, formatting, phrasing, or terms unless they clearly break the rule.
  - If the original Markdown ends with a blank line, your output must preserve that exact trailing newline.

  ## Output Format:

  - ONLY include the corrected (or unmodified) Markdown **below** the marker.
  - NEVER include explanations, comments, anything after markdown or wrap it in a code block.

  ---FIXED MARKDOWN BELOW---
  `


  console.log('[fixUsingLLM] Prompt sent to LLM:\n', fullPrompt);

  const llmResult = await callGroqModel(model, fullPrompt);

  console.log('[fixUsingLLM] Raw LLM response:\n', llmResult);

  const marker = "---FIXED MARKDOWN BELOW---";
  let fixedText = ctx.markdown;
  const markerIndex = llmResult.indexOf(marker);

  if (markerIndex !== -1) {
    fixedText = llmResult.slice(markerIndex + marker.length);
  } else {
    ctx.diagnostics.push({
      line: 1,
      severity: 'warning',
      message: 'fixUsingLLM: Marker not found — falling back to raw LLM output.'
    });
    ctx.rawLLMFallback = llmResult;
    fixedText = llmResult.replace(/```(markdown)?/g, '');
  }
  fixedText = stripCodeFence(fixedText);
  ctx.fixedMarkdown = fixedText;
  ctx.llmResponse = llmResult;

  if (fixedText.trim() !== ctx.markdown.trim()) {
    ctx.diagnostics.push({
      line: 1,
      severity: 'error',
      message: 'Lint failed — issues detected and corrected by the LLM.'
    });
  } else {
    ctx.diagnostics.push({
      line: 1,
      severity: 'info',
      message: 'Lint successful! No issues found.'
    });
  }

  return { prompt, model };
}

function stripCodeFence(text = '') {
  text = text.replace(/^\s*```(?:\w+)?\s*\n?/i, '');
  text = text.replace(/\n?```\s*$/i, '');
  return text;
}

async function callGroqModel(model, prompt) {
  try {
    const response = await fetch("http://localhost:5000/api/groq-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, prompt })
    });
    console.log("Calling backend from render")
    const data = await response.json();
    return data.result || "No valid response.";
  } catch (error) {
    console.error("fixUsingLLM: Error calling Groq API", error);
    return "Error generating suggestions.";
  }
}
