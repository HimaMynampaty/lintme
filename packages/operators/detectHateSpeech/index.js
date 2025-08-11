const { retext } = await import("retext");
const retextEquality = (await import("retext-equality")).default;
const retextProfanities = (await import("retext-profanities")).default;

export async function run(ctx, cfg = {}) {
  const markdown = ctx.markdown ?? '';
  const usingPrev = cfg.scope === 'previousstepoutput' && ctx.extracted;

  if (!usingPrev && !markdown.trim()) {
    ctx.diagnostics.push({
      line: 1,
      severity: 'error',
      message: 'No markdown input found for hate-speech detection'
    });
    return ctx;
  }

  const scope = usingPrev ? 'previousstepoutput' : 'document';

  const textToAnalyze = usingPrev ? collectTextFromExtracted(ctx.extracted) : markdown;

  const file = await retext()
    .use(retextEquality)
    .use(retextProfanities)
    .process(textToAnalyze);

  const lines = textToAnalyze.split('\n');
  const results = [];
  const seen = new Set();
  const level = 'warning';

  function findLineForWord(word) {
    const normalized = word.toLowerCase();
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes(normalized)) {
        return i + 1;
      }
    }
    return 1;
  }

  for (const msg of file.messages) {
    const word = (msg.actual || msg.source || 'unknown').toLowerCase();
    const suggestion = msg.expected?.[0] || msg.note || null;

    const line =
      msg?.position?.start?.line ||
      findLineForWord(word);

    const key = `${line}-${word}`;
    if (seen.has(key)) continue;
    seen.add(key);

    ctx.diagnostics.push({
      line,
      severity: level,
      message: msg.message
    });

    results.push({
      line,
      word,
      message: msg.message,
      suggestion
    });
  }

  const data = { [scope]: results };

  ctx.extracted = {
    target: 'hate_speech',
    scopes: [scope],
    data
  };
  return {
    target: 'hate_speech',
    scopes: [scope],
    data
  };
}

function collectTextFromExtracted(extracted) {
  const root = extracted?.data ?? extracted ?? {};
  const pieces = [];

  const walk = (node) => {
    if (node == null) return;
    if (typeof node === 'string') {
      pieces.push(node);
    } else if (Array.isArray(node)) {
      node.forEach(walk);
    } else if (typeof node === 'object') {
      for (const v of Object.values(node)) {
        if (typeof v === 'string') {
          pieces.push(v);
        } else if (Array.isArray(v)) {
          v.forEach(walk);
        } else if (v && typeof v === 'object') {
          const texty =
            v.content ?? v.text ?? v.title ?? v.value ?? v.href ?? v.url ?? v.slug ?? null;
          if (typeof texty === 'string') pieces.push(texty);
          else walk(v);
        }
      }
    }
  };

  walk(root);
  return pieces.join('\n');
}
