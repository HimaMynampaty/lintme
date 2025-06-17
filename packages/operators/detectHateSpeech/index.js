import { retext } from 'retext';
import retextEquality from 'retext-equality';
import retextProfanities from 'retext-profanities';

export async function run(ctx, cfg = {}) {
  const markdown = ctx.markdown ?? '';
  if (!markdown.trim()) {
    ctx.diagnostics.push({
      line: 1,
      severity: 'error',
      message: 'No markdown input found for hate-speech detection'
    });
    return ctx;
  }

  const scope =
    cfg.scope === 'previousstepoutput' && ctx.extracted
      ? 'previousstepoutput'
      : 'document';

  const file = await retext()
    .use(retextEquality)
    .use(retextProfanities)
    .process(markdown);

  const lines = markdown.split('\n');
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
