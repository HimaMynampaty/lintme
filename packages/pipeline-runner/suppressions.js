export function parseSuppressions(markdown = "") {
  const byRule = Object.create(null);  
  const allLines = new Set();
  const RX = /<ignore-line-for:([^/>]+)\s*\/>/ig;

  const lines = String(markdown).split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const matches = [...line.matchAll(RX)];
    if (!matches.length) continue;

    const lineWithoutTags = line.replace(RX, "").trim();
    const appliesToNext = lineWithoutTags.length === 0; 
    const thisLine = i + 1;           
    const nextLine = i + 2;          

    if (appliesToNext && nextLine > lines.length) {
      for (const m of matches) {
        const name = (m[1] || "").trim().toLowerCase();
        if (!name) continue;
        if (name === "all") allLines.add(thisLine);
        else (byRule[name] ||= []).push(thisLine);
      }
      continue;
    }

    for (const m of matches) {
      const name = (m[1] || "").trim().toLowerCase();
      if (!name) continue;

      if (appliesToNext) {
        if (name === "all") {
          allLines.add(thisLine);
          allLines.add(nextLine);
        } else {
          (byRule[name] ||= []).push(thisLine, nextLine);
        }
      } else {
        if (name === "all") allLines.add(thisLine);
        else (byRule[name] ||= []).push(thisLine);
      }
    }
  }

  for (const key of Object.keys(byRule)) {
    const set = new Set(byRule[key]);
    byRule[key] = [...set].sort((a, b) => a - b);
  }

  return { byRule, all: [...allLines].sort((a, b) => a - b) };
}


export function applySuppressionsToDiagnostics(diagnostics = [], suppressions, ruleName) {
  if (!suppressions) return diagnostics;
  const key = String(ruleName || "").toLowerCase();
  const all = new Set(suppressions.all || []);
  const perRule = new Set(suppressions.byRule?.[key] || []);
  return (diagnostics || []).filter(d => {
    const ln = Number(d?.line) || 1;
    return !(all.has(ln) || perRule.has(ln));
  });
}

export function isLineSuppressed(ctx, lineNumber) {
  const sup = ctx?.suppressions;
  if (!sup) return false;
  const key = String(ctx?.rule || "").toLowerCase();
  const all = new Set(sup.all || []);
  const perRule = new Set(sup.byRule?.[key] || []);
  const ln = Number(lineNumber) || 1;
  return all.has(ln) || perRule.has(ln);
}
