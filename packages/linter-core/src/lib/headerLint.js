  import { toString } from "mdast-util-to-string";
  import { generateAST } from "./markdownParser.js";   // path must be valid

  /* ────────────────────────── MAIN ────────────────────────── */

  export function runHeaderChecks(ast, rules, originalMarkdown) {
    const diagnostics = [];
    let fixedMarkdown = originalMarkdown;
    let lines         = fixedMarkdown.split("\n");
    let headings      = extractHeadings(ast);

    /* ----- helper: refresh state after an auto‑fix ----- */
    const updateAfterFix = (newLines) => {
      lines        = newLines;
      fixedMarkdown = lines.join("\n");
      headings      = extractHeadings(generateAST(fixedMarkdown));
    };

    /* ----- helper: run a single rule ----- */
    const applyCheck = (checkFn, ...args) => {
      const result = checkFn(...args);
      if (result?.issues?.length) diagnostics.push(...result.issues);
      if (rules.auto_fix && result?.updatedLines) updateAfterFix(result.updatedLines);
    };

    /* ----- run rules in order (state may mutate between calls) ----- */
    applyCheck(checkHeadingIncrement,      headings, lines, rules);
    applyCheck(checkFirstHeadingTopLevel,  headings, lines, rules);
    applyCheck(checkHeadingStyleConsistency, lines, rules);
    applyCheck(checkOnlyOneH1, headings, lines, rules); // not rules.headers
    applyCheck(
      checkFormatting,
      headings,
      lines,
      rules.formatting,   // ← pass just the formatting settings
      rules.auto_fix      // ← pass the auto‑fix flag
    );
    applyCheck(
      checkSpacing,
      headings,
      lines,
      rules.spacing,   // ← only the spacing subsection
      rules.auto_fix   // ← auto‑fix flag
    );
    applyCheck(checkEmphasisAsHeading,   lines, rules);        // MD036
    applyCheck(checkFirstLineIsH1,       lines, rules);        // MD041

    
    /* ----- final safety clamp for every issue ----- */
    const maxLine = fixedMarkdown.split("\n").length;
    diagnostics.forEach((d) => {
      if (!Number.isInteger(d.line) || d.line < 1) d.line = 1;
      if (d.line > maxLine) d.line = maxLine;
    });

    return { diagnostics, fixedMarkdown };
  }

  /* ───────────────────── helpers / utilities ───────────────────── */

  function extractHeadings(ast) {
    return ast.children
      .filter((n) => n.type === "heading")
      .map((n) => ({
        line: n.position.start.line,
        depth: n.depth,
        text: toString(n).trim(),
        rawNode: n,
      }));
  }

  /* ──────────────────────── RULES ───────────────────────── */

  /* ---------- MD001 heading‑increment ---------- */
  export function checkHeadingIncrement(headings, lines, rules) {
    if (!rules.heading_increment) return { issues: [] };

    const issues = [];
    const updatedLines = [...lines];
    let expected = 1;

    headings.forEach((h) => {
      if (h.depth > expected + 1) {
        const corrected = expected + 1;
        const origLine  = lines[h.line - 1];
        updatedLines[h.line - 1] = origLine.replace(/^#{1,6}/, "#".repeat(corrected));

        issues.push({
          line: h.line,
          severity: "warning",
          message: `Heading level jumped from H${expected} to H${h.depth}`,
          suggestion: `Use H${corrected} instead.`,
        });

        if (rules.auto_fix) h.depth = corrected;
      } 
      expected = h.depth;
    });

    return { issues, updatedLines: rules.auto_fix ? updatedLines : null };
  }

  /* ---------- MD002 first heading must be top‑level ---------- */
  export function checkFirstHeadingTopLevel(headings, lines, rules) {
    if (!rules.first_heading_top_level) return { issues: [] };

    const issues = [];
    const updatedLines = [...lines];
    const firstHeading = headings[0];
    const isH1         = firstHeading?.depth === 1;
    const topIsH1      = lines[0].startsWith("# ");

    if (!isH1 || !topIsH1) {
      issues.push({
        line: 1,
        severity: "warning",
        message: "Document should start with a top‑level H1 heading.",
        suggestion: 'Insert "# Project Title" at the top.',
      });

      if (rules.auto_fix) updatedLines.unshift("# Project Title", "");
    }

    return { issues, updatedLines: rules.auto_fix ? updatedLines : null };
  }
  /**
   * Enforce *only* ATX or ATX‑closed heading style.
   *
   * Config:
   *   rules.heading_style.style = "atx"          (default)
   *                               └─ forces "# Heading"
   *
   *   rules.heading_style.style = "atx_closed"   (forces "# Heading #")
   *
   * Auto‑fix converts:
   *   • Setext  → ATX / ATX‑closed
   *   • ATX     → ATX‑closed   (when "atx_closed" chosen)
   *   • ATX‑closed → ATX       (when "atx" chosen)
   */
  export function checkHeadingStyleConsistency(allLines, rules) {
      // Exit early if rule is not explicitly required
      if (!rules.heading_style?.required) return { issues: [] };
    
      const allowed = rules.heading_style?.style === "atx_closed"
        ? "atx_closed"
        : "atx"; // default to "atx" if not specified
    
      const lines = [...allLines]; // make a mutable copy
      const issues = [];
    
      // === Helper functions ===
      const isUnderline = (l) => /^[=-]{3,}$/.test(l?.trim());
      const atxLevel = (l) => {
        const m = l.match(/^#{1,6}/);
        return m ? m[0].length : 0;
      };
    
      // Classify line style
      const classify = (i) => {
        const cur = lines[i]?.trim();
        const next = lines[i + 1]?.trim();
        if (!cur) return null;
    
        if (/^#{1,6}\s.*\s#{1,6}$/.test(cur)) return "atx_closed";
        if (/^#{1,6}\s/.test(cur)) return "atx";
        if (next && !cur.startsWith("#") && /^[A-Za-z0-9]/.test(cur) && isUnderline(next))
          return "setext";
        return null;
      };
    
      const stripHashes = (l) => l.replace(/\s+#{1,6}\s*$/, "");
      const toAtxClosed = (raw) => {
        const lvl = atxLevel(raw);
        const text = stripHashes(raw).replace(/^#{1,6}\s*/, "").trim();
        const h = "#".repeat(lvl);
        return `${h} ${text} ${h}`;
      };
      const toAtx = (raw) => stripHashes(raw);
    
      // === Main Loop ===
      let i = 0;
      while (i < lines.length) {
        const style = classify(i);
        if (!style) {
          i++;
          continue;
        }
    
        const mismatch = style !== allowed;
        let step = style === "setext" ? 2 : 1;
    
        // Auto-fix if mismatch and auto_fix is true
        if (mismatch && rules.auto_fix) {
          if (style === "setext") {
            const heading = lines[i].trim();
            const underline = lines[i + 1]?.trim() || "";
            const lvl = underline.startsWith("=") ? 1 : 2;
            const prefix = "#".repeat(lvl);
            lines[i] = allowed === "atx_closed"
              ? `${prefix} ${heading} ${prefix}`
              : `${prefix} ${heading}`;
            lines.splice(i + 1, 1); // remove underline
            step = 1;
          }
    
          if (style === "atx" && allowed === "atx_closed") {
            lines[i] = toAtxClosed(lines[i]);
          } else if (style === "atx_closed" && allowed === "atx") {
            lines[i] = toAtx(lines[i]);
          }
        }
    
        // Report issue
        if (mismatch) {
          issues.push({
            line: Math.min(lines.length, i + 1),
            severity: "warning",
            message: `Inconsistent heading style: found “${style}”, expected “${allowed}”.`,
            suggestion: style === "atx_closed"
              ? `Convert to “${allowed}” (Note: auto-fix for "atx_closed" is not applied).`
              : `Convert to “${allowed}” style.`,
          });
        }
    
        i += step;
      }
    
      return {
        issues,
        updatedLines: rules.auto_fix ? lines : null,
      };
    }
    
    
  /* ---------- MD025 only-one-H1 ---------- */
  function checkOnlyOneH1(headings, lines, rules) {
      if (!rules?.only_one_h1) return { issues: [] };
      const issues = [];
      const updatedLines = [...lines];
    
      const h1s = headings.filter((h) => h.depth === 1);
    
      for (let i = 1; i < h1s.length; i++) {
        const h = h1s[i];
    
        issues.push({
          line: h.line,
          severity: "warning",
          message: "Only one H1 heading is allowed.",
          suggestion: "Convert this to H2 or lower.",
        });
    
        if (rules.auto_fix) {
          const original = lines[h.line - 1];
          const fixed = original.replace(/^#(?!#)/, "##"); // Replace only the first #
          updatedLines[h.line - 1] = fixed;
          h.depth = 2; // update internal depth if needed
        }
      }
    
      return {
        issues,
        updatedLines: rules.auto_fix ? updatedLines : null,
      };
    }

    /* ---------- MD018 / MD019 / MD020 / MD021 / MD026 / MD027 ---------- */
    export function checkFormatting(headings, lines, formattingRules, autoFix = false) {
      if (!formattingRules) return { issues: [] };
    
      const updatedLines = [...lines];
      const issues = [];
    
      headings.forEach((h) => {
        const raw = h.rawNode;
        const original = lines[h.line - 1];
    
      // === MD018: No space after #
      if (formattingRules.space_after_hash) {
          lines.forEach((line, index) => {
            if (/^#{1,6}[^\s#]/.test(line)) {
              issues.push({
                line: index + 1,
                severity: "warning",
                message: "No space after #.",
                suggestion: "Add one space after #.",
              });
      
              if (autoFix) {
                updatedLines[index] = line.replace(/^(#{1,6})([^\s#])/, "$1 $2");
              }
            }
          });
        }
    
    
        // === MD021: Multiple spaces after #
        if (formattingRules.multiple_spaces_after_hash && /^#{1,6}\s{2,}/.test(original)) {
          issues.push({
            line: h.line,
            severity: "warning",
            message: "Multiple spaces after #.",
            suggestion: "Use exactly one space.",
          });
    
          if (autoFix) {
            updatedLines[h.line - 1] = original.replace(/^(#{1,6})\s+/, "$1 ");
          }
        }
    
        // === MD019/MD020: Trailing # characters
        if (formattingRules.no_trailing_hashes && /\s#+\s*$/.test(original)) {
          issues.push({
            line: h.line,
            severity: "warning",
            message: "Heading ends with # characters.",
            suggestion: "Remove trailing #.",
          });
    
          if (autoFix) {
            updatedLines[h.line - 1] = original.replace(/\s+#{1,6}\s*$/, "").trim();
          }
        }
    
        // === MD027: Multiple spaces inside heading text
        if (formattingRules.multiple_spaces_in_heading && /\s{2,}/.test(h.text)) {
          issues.push({
            line: h.line,
            severity: "warning",
            message: "Multiple spaces within heading.",
            suggestion: "Use a single space between words.",
          });
    
          if (autoFix) {
            const cleanedText = h.text.replace(/\s{2,}/g, " ");
            updatedLines[h.line - 1] = original.replace(h.text, cleanedText);
          }
        }
    
        // === MD026: Trailing punctuation in heading
        if (
          formattingRules.heading_punctuation &&
          Array.isArray(formattingRules.heading_punctuation.allow) &&
          formattingRules.heading_punctuation.allow.length === 0 &&
          /[!?:.]$/.test(h.text)
        ) {
          issues.push({
            line: h.line,
            severity: "warning",
            message: "Avoid punctuation at the end of headings.",
            suggestion: "Remove trailing punctuation.",
          });
    
          if (autoFix) {
            const cleaned = h.text.replace(/[!?:.]$/, "");
            updatedLines[h.line - 1] = original.replace(h.text, cleaned);
          }
        }
      });
    
      return {
        issues,
        updatedLines: autoFix ? updatedLines : null,
      };
    }
  /* ---------- MD022 / MD023 / MD028: Spacing rules ---------- */
  /* ---------- MD022 / MD023 / MD028 : spacing rules ---------- */
  function checkSpacing(headings, lines, spacingRules, autoFix = false) {
      if (!spacingRules) return { issues: [] };
    
      const cfg          = spacingRules;
      const updatedLines = [...lines];               // mutable working copy
      const issues       = [];
    
      /* ── iterate bottom‑to‑top so splice() never invalidates later indices ── */
      const work = [...headings].sort((a, b) => b.line - a.line);
    
      work.forEach((h) => {
        const i          = h.line - 1;              // zero‑based index
        const prevLine   = updatedLines[i - 1] ?? "";
        const nextLine   = updatedLines[i + 1] ?? "";
        const headingTxt = updatedLines[i];
    
        /* === MD022: heading must be surrounded by a blank line === */
        if (cfg.heading_surround_blank_lines) {
          const needBefore = i > 0            && prevLine.trim() !== "";
          const needAfter  = i + 1 < updatedLines.length && nextLine.trim() !== "";
    
          if (needBefore || needAfter) {
            issues.push({
              line: h.line,
              severity: "warning",
              message: "Heading should be surrounded by blank lines.",
              suggestion: "Add blank line before and/or after heading.",
            });
    
            if (autoFix) {
              if (needAfter)  updatedLines.splice(i + 1, 0, "");
              if (needBefore) updatedLines.splice(i,     0, "");
            }
          }
        }
    
        /* === MD023: heading must start at column 1 (no indentation) === */
        if (cfg.heading_start_of_line && /^\s+#/.test(headingTxt)) {
          issues.push({
            line: h.line,
            severity: "warning",
            message: "Heading must start at the beginning of the line.",
            suggestion: "Remove leading spaces.",
          });
    
          if (autoFix) {
            updatedLines[i] = headingTxt.trimStart();
          }
        }
      });
    
      return {
        issues,
        updatedLines: autoFix ? updatedLines : null,
      };
    }
    
  /* ---------- MD036 emphasis‑as‑heading ---------- */
  function checkEmphasisAsHeading(lines, rules) {
      if (!rules.emphasis_as_heading) return { issues: [] };
    
      const updatedLines = [...lines];
      const issues = [];
    
      lines.forEach((ln, idx) => {
        const m = ln.trim().match(/^(?:\*\*([^*]+)\*\*|__([^_]+)__)\s*$/);
        if (m) {
          const text = m[1] || m[2];        // capture group
          issues.push({
            line: idx + 1,
            severity: "warning",
            message: `Emphasis used instead of heading: “${text}”.`,
            suggestion: 'Replace with "# ' + text + '"',
          });
    
          if (rules.auto_fix) updatedLines[idx] = "# " + text;
        }
      });
    
      return { issues, updatedLines: rules.auto_fix ? updatedLines : null };
    }
    
    /* ---------- MD041 first line must be top‑level H1 ---------- */
    function checkFirstLineIsH1(lines, rules) {
      if (!rules.first_line_is_top_level_heading) return { issues: [] };
    
      const updatedLines = [...lines];
      const issues = [];
    
      // find first non‑blank line
      const idx = lines.findIndex((l) => l.trim().length > 0);
      if (idx === -1) return { issues };       // empty file
    
      const line = lines[idx];
      const cleanedLine = line.replace(/\r$/, ""); // remove trailing carriage return
      const atx = cleanedLine.match(/^\s*(#{1,6})\s+(.*)$/);

      if (!atx || atx[1] !== "#") {
          // Not a heading, or not H1
        const fixedText = atx ? atx[2] : line.trim();
        issues.push({
          line: idx + 1,
          severity: "warning",
          message: "First content line must be a top‑level H1 heading.",
          suggestion: 'Prefix the line with "# " to make it an H1.',
        });
    
        if (rules.auto_fix) {
          updatedLines[idx] = "# " + fixedText;
        }
      }
    
      return { issues, updatedLines: rules.auto_fix ? updatedLines : null };
    }
    