<script>
  import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
  import YamlWorker from "monaco-yaml/yaml.worker?worker&inline";
  if (typeof self !== "undefined") {
    self.require = undefined;
    self.define = undefined;
  }

  if (typeof window !== "undefined") {
    window.MonacoEnvironment = {
      getWorker(_id, label) {
        if (label === "yaml") return new YamlWorker();
        return new EditorWorker();
      },
    };
  }
  import { onMount, tick } from "svelte";
  import * as monaco from "monaco-editor";
  import OperatorTriggerPanel from "./components/OperatorTriggerPanel.svelte";
  const params = new URLSearchParams(window.location.search);
  let rulesYaml = decodeURIComponent(params.get("rule") || "");
  import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    getDoc,
    doc,
    query,
    where,
    setDoc,
  } from "firebase/firestore";
  import { db } from "./lib/firebase.js";
  import SvelteSelect from "svelte-select";
  import "./styles/lintme.css";
  import { validatePipeline } from "./lib/validatePipeline.js";
  import { configureMonacoYaml } from "monaco-yaml";
  import { buildMonacoYamlSchema } from "./lib/buildMonacoYamlSchema.js";
  import { rulePresets } from "./lib/rulePresets.js";

  const sharedFontSize = 14;
  let markdownText = "";
  let originalText = "";

  let lintResults = "";
  let fixedMarkdown = "";
  let diagnostics = [];
  let highlightedMarkdown = "";
  let topPane;
  let showDiff = false;

  let rulesFiles = [];
  let readmeFiles = [];

  let rulesEditorContainer;
  let markdownEditorContainer;
  let markdownPreviewDiv;

  let rulesEditor;
  let markdownEditor;

  let diffEditorContainer;
  let diffEditor;
  let ruleList = [];
  let combinedRuleOptions = [];
  let outputEditorContainer;
  let outputEditor;

  let mode = "runner";
  let selectedRuleIds = [];
  let expandedCategories = new Set();
  let ruleStatus = {};
  let categorySelection = {};
  let selectedReadmeId = "";
  let lintState = "idle";
  let multiLintState = "idle";
  let selectedRule = null;
  let selectedRuleId = "";
  let selectedReadme = null;
  let ruleWarning = "";
  let ruleValidationErrors = [];
  let selectedPreset = "";
  const baseURL = import.meta.env.VITE_BACKEND_URL;

  function setRuleStatus(id, status) {
    ruleStatus[id] = status;
    ruleStatus = { ...ruleStatus };
  }

  $: if (ruleList.length) {
    recomputeCategorySelection();
  }
  $: if (selectedPreset && ruleList.length) {
    applyPreset(selectedPreset);
  }

  $: {
    const validRuleIds = new Set(selectedRuleIds);
    let changed = false;

    for (const ruleId in ruleStatus) {
      if (!validRuleIds.has(ruleId)) {
        delete ruleStatus[ruleId];
        changed = true;
      }
    }

    if (changed) {
      ruleStatus = { ...ruleStatus };
    }
  }

  async function setOutput(text) {
    lintResults = text || "No lint results to display yet.";
    await tick();
    if (outputEditor) {
      const model = outputEditor.getModel?.();
      if (model?.setValue) model.setValue(lintResults);
      else outputEditor.setValue(lintResults);
      outputEditor.layout?.();
    }
  }

  function getParticipantId() {
    let id = localStorage.getItem("participantId");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("participantId", id);
    }
    return id;
  }

  function extractJson(text = "") {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1 || end < start) {
      throw new Error("LLM did not return JSON.");
    }
    return text.slice(start, end + 1);
  }

  function stripCodeFence(text = "") {
    return text
      .replace(/^\s*```(?:\w+)?\s*\n?/i, "")
      .replace(/\n?```\s*$/i, "");
  }

  function buildFixPrompt({ markdown, rulesYaml, diagnostics }) {
    const issues = (diagnostics || []).slice(0, 30).map((d) => ({
      line: d.line,
      column: d.column || 1,
      severity: d.severity,
      message: d.message,
    }));

    return `
      You are a strict Markdown fixer.

      TASK:
      - Correct ONLY the issues explicitly listed in diagnostics.
      - Do NOT modify any other text or formatting.

      RULES:
      1) Apply the minimum edit necessary to resolve each diagnostic.
      2) Do not touch content without a diagnostic unless it is strictly required to resolve a diagnostic.
      3) Do not reflow, rewrap, reorder, or restyle anything unless a diagnostic requires it.
      4) Be deterministic and idempotent (same input ⇒ same output).
      5) Output ONLY the corrected Markdown. No code fences, no JSON, no explanations.

      rules.yaml (context)
      ---
      ${rulesYaml}
      ---

      diagnostics
      ${JSON.stringify(issues, null, 2)}

      FULL README
      <<<MD
      ${markdown}
      MD
      `.trim();
  }

  function textFromMaybeJson(s) {
    try {
      const j = JSON.parse(s);
      if (typeof j?.text === "string") return j.text;
      if (typeof j?.result === "string") return j.result;
      return s;
    } catch {
      return s;
    }
  }

  async function requestAIFix({ prompt, model = "llama-3.3-70b-versatile" }) {
    const res = await fetch(
      "https://lintme-backend.onrender.com/api/groq-chat",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, prompt }),
      },
    );
    const body = await res.text();
    if (!res.ok) {
      throw new Error(`LLM endpoint failed: ${body || res.status}`);
    }
    return stripCodeFence(textFromMaybeJson(body)).trimEnd();
  }

  function recomputeCategorySelection() {
    const selectedSet = new Set(selectedRuleIds);
    for (const cat of categoriesMeta.map((c) => c.name)) {
      const idsInCat = ruleList
        .filter((r) => r.category === cat)
        .map((r) => r.id);
      categorySelection[cat] =
        idsInCat.length > 0 && idsInCat.every((id) => selectedSet.has(id));
    }
    categorySelection = { ...categorySelection };
  }

  function handlePresetChange(e) {
    const key = e.target.value;
    selectedPreset = key;

    if (!key) {
      clearSelections();
      return;
    }

    applyPreset(key);
  }

  function applyPreset(presetKey) {
    const preset = rulePresets[presetKey];
    if (!preset) return;

    expandedCategories = new Set();

    selectedRuleIds = [];
    ruleStatus = {};

    for (const c of categoriesMeta.map((x) => x.name)) {
      categorySelection[c] = false;
    }
    categorySelection = { ...categorySelection };

    const want = new Set(preset.rulesByName.map((n) => n.toLowerCase().trim()));
    const matchedIds = ruleList
      .filter((r) => want.has((r.name || "").toLowerCase().trim()))
      .map((r) => String(r.id));

    selectedRuleIds = matchedIds;

    recomputeCategorySelection();
  }

  const participantId = getParticipantId();

  async function logRuleRun(
    ruleYamls,
    readmeContent,
    diagnostics = [],
    source = "single",
    fixedMarkdown = "",
  ) {
    try {
      await addDoc(collection(db, "ruleRuns"), {
        timestamp: new Date(),
        participantId,
        ruleYamls,
        readmeContent,
        diagnostics,
        fixedMarkdown: fixedMarkdown || "",
        source,
      });
    } catch (err) {
      console.error("Error logging rule run:", err);
    }
  }

  const categoriesMeta = [
    {
      name: "structure",
      label: "Structure",
      description:
        "Ensures proper document layout, sectioning, and organization.",
    },
    {
      name: "style",
      label: "Style",
      description:
        "Checks grammar, spelling, tone, and consistent writing style.",
    },
    {
      name: "content",
      label: "Content",
      description: "Ensures content completeness, best practices, and clarity.",
    },
    {
      name: "sensitive",
      label: "Sensitive",
      description: "Detects hate speech, harmful or inappropriate language.",
    },
      {
      name: "recipe",
      label: "Recipe",
      description: "Checks for issues in recipe markdowns.",
    },
  ];

  categoriesMeta.forEach((c) => (categorySelection[c.name] = false));

  function toggleCategoryExpand(name) {
    if (expandedCategories.has(name)) {
      expandedCategories.delete(name);
    } else {
      expandedCategories.add(name);
    }
    expandedCategories = new Set(expandedCategories);
  }
  function toggleCategoryCheckbox(category, checked) {
    categorySelection[category] = checked;

    const affectedIds = ruleList
      .filter((r) => r.category === category)
      .map((r) => String(r.id));

    if (checked) {
      const set = new Set(selectedRuleIds.map(String));
      affectedIds.forEach((id) => set.add(id));
      selectedRuleIds = Array.from(set);
    } else {
      const remove = new Set(affectedIds);
      selectedRuleIds = selectedRuleIds.filter((id) => !remove.has(String(id)));
    }
  }

  function lineOfStep(yaml, stepIndex) {
    const lines = yaml.split("\n");
    let insidePipeline = false;
    let currentStep = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (/^\s*pipeline\s*:/.test(line)) {
        insidePipeline = true;
        continue;
      }

      if (insidePipeline && /^\s*-\s*operator\s*:/.test(line)) {
        if (currentStep === stepIndex) {
          return i + 1;
        }
        currentStep++;
      }
    }

    return 1;
  }

  function updateRuleMarkers(model, errors, yamlText) {
    const markers = errors.map((e) => {
      const line = lineOfStep(yamlText, e.step);
      return {
        severity: monaco.MarkerSeverity.Error,
        startLineNumber: line,
        endLineNumber: line,
        startColumn: 1,
        endColumn: model.getLineContent(line).length + 1,
        message: e.message,
      };
    });

    monaco.editor.setModelMarkers(model, "schema-validator", markers);
  }

  $: combinedRuleOptions = [
    ...ruleList.map((r) => ({
      label: r.name,
      value: r.id,
      type: "saved",
    })),
    ...rulesFiles.map((file) => ({
      label: file,
      value: file,
      type: "yaml",
    })),
  ];

  $: if (outputEditor && lintResults !== outputEditor.getValue()) {
    outputEditor.setValue(lintResults || "No lint results to display yet.");
  }

  onMount(async () => {
    const rulesModelUri = monaco.Uri.parse("file:///rules.yaml");
    const initialRulesText =
      rulesYaml || 'rule: my-rule\ndescription: ""\npipeline: []\n';
    const rulesModel = monaco.editor.createModel(
      initialRulesText,
      "yaml",
      rulesModelUri,
    );

    rulesEditor = monaco.editor.create(rulesEditorContainer, {
      model: rulesModel,
      automaticLayout: true,
      minimap: { enabled: false },
      fixedOverflowWidgets: true,
      fontSize: sharedFontSize,
      wordWrap: "on",
    });

    const yamlSchema = buildMonacoYamlSchema();

    configureMonacoYaml(monaco, {
      enableSchemaRequest: false,
      validate: true,
      completion: true,
      hover: true,
      format: true,
      schemas: [
        {
          uri: "schema://lintme/rules",
          fileMatch: [rulesModelUri.toString()],
          schema: yamlSchema,
        },
      ],
    });

    ruleValidationErrors = validatePipeline(rulesEditor.getValue());
    updateRuleMarkers(
      rulesEditor.getModel(),
      ruleValidationErrors,
      rulesEditor.getValue(),
    );

    rulesEditor.onDidChangeModelContent(() => {
      rulesYaml = rulesEditor.getValue();
      ruleValidationErrors = validatePipeline(rulesYaml);
      updateRuleMarkers(
        rulesEditor.getModel(),
        ruleValidationErrors,
        rulesYaml,
      );
    });

    markdownEditor = monaco.editor.create(markdownEditorContainer, {
      value: markdownText,
      language: "markdown",
      automaticLayout: true,
      minimap: { enabled: false },
      fixedOverflowWidgets: true,
      fontSize: sharedFontSize,
      wordWrap: "on",
    });

    markdownEditor.onDidChangeModelContent(() => {
      markdownText = markdownEditor.getValue();
    });

    let aiFixCommandId;

    aiFixCommandId = markdownEditor.addCommand(
      0,
      async (_ctx) => {
        try {
          const model = markdownEditor.getModel();
          const fullText = model.getValue();

          const prompt = buildFixPrompt({
            markdown: fullText,
            rulesYaml: rulesEditor?.getValue() || rulesYaml || "",
            diagnostics,
          });

          await setOutput("LLM is preparing a fix…");
          const aiText = await requestAIFix({ prompt });

          originalText = fullText;
          fixedMarkdown = aiText;

          await setOutput(
            "LLM fix prepared. Use Show Diff to review, then Apply Fixes.",
          );
          if (!showDiff) showDiff = true;
          updateDiffModels();
        } catch (e) {
          console.error(e);
          alert(`LLM fix failed: ${e.message}`);
        }
      },
      null,
    );

    const QUICK_FIX_KIND =
      monaco.languages.CodeActionKind?.QuickFix ?? "quickfix";

    monaco.languages.registerCodeActionProvider("markdown", {
      providedCodeActionKinds: [QUICK_FIX_KIND],
      provideCodeActions(/* model, range */) {
        const total = (diagnostics || []).length;
        if (!total) return { actions: [], dispose: () => {} };

        return {
          actions: [
            {
              title: total
                ? `LLM: Fix document (${total} issue${total === 1 ? "" : "s"})`
                : "LLM: Fix document",
              kind: "quickfix.lintme.ai",
              command: { id: aiFixCommandId, title: "AI Fix" },
            },
          ],
          dispose: () => {},
        };
      },
    });

    diffEditor = monaco.editor.createDiffEditor(diffEditorContainer, {
      readOnly: true,
      automaticLayout: true,
      minimap: { enabled: false },
      fixedOverflowWidgets: true,
      fontSize: sharedFontSize,
      renderSideBySide: false,
      wordWrap: "on",
    });

    outputEditor = monaco.editor.create(outputEditorContainer, {
      value: lintResults || "No lint results to display yet.",
      language: "markdown",
      readOnly: true,
      automaticLayout: true,
      minimap: { enabled: false },
      fontSize: sharedFontSize,
      wordWrap: "on",
      scrollBeyondLastLine: false,
    });

    readmeFiles = await loadReadmesFromFirestore();
    ruleList = await loadRulesFromFirestore();
  });

  async function saveCurrentRule() {
    const yamlContent = rulesEditor.getValue();
    const ruleMatch = yamlContent.match(/rule:\s*(\S+)/);
    const defaultName = ruleMatch ? ruleMatch[1] : "my-rule";

    const name = prompt("Rule name?", defaultName);
    if (!name) return;

    const category = prompt(
      "Category? (e.g. structure, style, content, sensitive, recipe)",
      "structure",
    );
    if (!category) return;

    const q = query(collection(db, "rules"), where("name", "==", name));
    const snap = await getDocs(q);

    try {
      if (!snap.empty) {
        const ref = snap.docs[0].ref;
        await setDoc(ref, {
          name,
          yaml: yamlContent,
          category,
          updatedAt: new Date(),
        });
        alert(`Rule "${name}" was replaced.`);
      } else {
        await addDoc(collection(db, "rules"), {
          name,
          yaml: yamlContent,
          category,
          createdAt: new Date(),
        });
        alert(`Rule "${name}" saved!`);
      }

      ruleList = await loadRulesFromFirestore();
    } catch (err) {
      console.error("Error saving rule:", err);
      alert("Failed to save rule.");
    }
  }

  async function saveReadmeToDB() {
    const name = prompt("Enter a name for this README:");
    if (!name) return;

    const content = markdownEditor?.getValue() || "";
    const q = query(collection(db, "readmes"), where("name", "==", name));
    const snap = await getDocs(q);

    try {
      if (!snap.empty) {
        const ref = snap.docs[0].ref;
        await setDoc(ref, { name, content, updatedAt: new Date() });
        alert(`README "${name}" was replaced.`);
      } else {
        await addDoc(collection(db, "readmes"), {
          name,
          content,
          createdAt: new Date(),
        });
        alert(`README "${name}" saved!`);
      }

      readmeFiles = await loadReadmesFromFirestore();
    } catch (err) {
      console.error("Error saving README:", err);
      alert("Failed to save README.");
    }
  }

  async function loadReadmesFromFirestore() {
    try {
      const snapshot = await getDocs(collection(db, "readmes"));
      readmeFiles = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
      }));
      readmeFiles.sort((a, b) => a.name.localeCompare(b.name));
    } catch (err) {
      console.error("Error loading readmes:", err);
    }
    return readmeFiles;
  }

  async function toggleDescription(rule) {
    if (!rule.description || rule.description === "(No description provided)") {
      const snap = await getDoc(doc(db, "rules", rule.id));
      if (snap.exists()) {
        const data = snap.data();
        rule.description =
          data.description || getDescriptionFromYaml(data.yaml);
      }
    }

    rule.showDescription = !rule.showDescription;

    ruleList = [...ruleList];
  }

  async function loadRulesFromFirestore() {
    const querySnapshot = await getDocs(collection(db, "rules"));
    const rules = querySnapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        description: data.description || getDescriptionFromYaml(data.yaml),
        showDescription: false,
      };
    });
    rules.sort((a, b) => a.name.localeCompare(b.name));
    ruleList = rules;
    return rules;
  }

  onMount(() => {
    loadRulesFromFirestore();
  });

  let diffOriginalModel;
  let diffModifiedModel;

  function updateDiffModels() {
    const originalUri = monaco.Uri.parse("inmemory://lintme/diff/original.md");
    const modifiedUri = monaco.Uri.parse("inmemory://lintme/diff/modified.md");

    diffOriginalModel =
      monaco.editor.getModel(originalUri) ||
      monaco.editor.createModel(originalText || "", "markdown", originalUri);
    diffModifiedModel =
      monaco.editor.getModel(modifiedUri) ||
      monaco.editor.createModel(fixedMarkdown || "", "markdown", modifiedUri);

    diffOriginalModel.setValue(originalText || "");
    diffModifiedModel.setValue(fixedMarkdown || "");

    diffEditor.setModel({
      original: diffOriginalModel,
      modified: diffModifiedModel,
    });
  }

  async function loadRuleFromDB(id) {
    const docSnap = await getDoc(doc(db, "rules", id));
    if (docSnap.exists()) {
      const rec = { id: docSnap.id, ...docSnap.data() };
      rulesYaml = rec.yaml;

      await tick();

      if (rulesEditor) {
        rulesEditor.setValue(rulesYaml);
      }
    } else {
      console.warn("Rule not found in Firestore", id);
    }
  }

  function getDescriptionFromYaml(yamlText = "") {
    const m = yamlText.match(/^\s*description\s*:\s*["']?([^"'\n]+)["']?/m);
    return m ? m[1].trim() : "(No description provided)";
  }

  function clearSelections() {
    expandedCategories = new Set();

    selectedRuleIds = [];
    ruleStatus = {};

    const blank = {};
    for (const c of categoriesMeta.map((x) => x.name)) blank[c] = false;
    categorySelection = blank;
  }

  async function handleCombinedRuleSelection(opt) {
    if (!opt) return;
    if (opt.type === "saved") await loadRuleFromDB(opt.value);
    else if (opt.type === "yaml")
      await loadFileContent("rules", { target: { value: opt.value } });
  }

  function formatOperatorOutput(key, data, scopes = Object.keys(data)) {
    let result = ``;

    for (const scope of scopes) {
      const value = data[scope];

      if (!value || (Array.isArray(value) && value.length === 0)) {
        result += `  ${scope}: (no matches)\n`;
        continue;
      }

      if (Array.isArray(value)) {
        result += `  ${scope}:\n`;
        for (const item of value) {
          if (typeof item === "string") {
            const label = item === "\n" ? "newline character" : item;
            result += `    - ${label}\n`;
          } else if (item.line && item.matches) {
            const entries = item.matches.map((m) => {
              if (typeof m === "string") return m;
              if (typeof m === "object") {
                return m.content ?? m.value ?? m.type ?? JSON.stringify(m);
              }
              return String(m);
            });
            result += `    - Line ${item.line}: ${entries.join(", ")}\n`;
          } else if (item.line && item.count !== undefined) {
            result += `    - Line ${item.line}: ${item.count} match(es)\n`;
          } else if (item.content) {
            result += `    - Line ${item.line}: ${item.content}\n`;
          } else if (item.type && item.line) {
            result += `    - Line ${item.line}: ${item.type}\n`;
          } else {
            result += `    - ${JSON.stringify(item)}\n`;
          }
        }
      } else if (
        typeof value === "object" &&
        value.missing !== undefined &&
        value.extra !== undefined
      ) {
        result += `  ${scope}:\n`;
        result += `    missing (${value.missing.length}):\n`;
        value.missing.forEach((item) => (result += `      • ${item}\n`));
        result += `    extra   (${value.extra.length}):\n`;
        value.extra.forEach((item) => (result += `      • ${item}\n`));
      } else if (typeof value === "object") {
        const entries = Object.entries(value);
        if (entries.length === 0) {
          result += `  ${scope}: (no matches)\n`;
          continue;
        }

        result += `  ${scope}:\n`;
        for (const [line, matches] of entries) {
          if (Array.isArray(matches)) {
            const labels = matches.map((m) =>
              typeof m === "string"
                ? m === "\n"
                  ? "newline character"
                  : m
                : (m.content ?? m.value ?? m.type ?? "[node]"),
            );

            result += `    - Line ${line}: ${labels.join(", ")}\n`;
          } else {
            result += `    - Line ${line}: ${matches}\n`;
          }
        }
      } else if (typeof value === "number") {
        result += `  ${scope}: ${value}\n`;
      }
    }

    return result;
  }

  function applyDiagnosticsToEditor(diags = []) {
    const model = markdownEditor?.getModel?.();
    if (!model) return;

    const lineCount = model.getLineCount();
    const markers = (diags || []).map((d) => {
      const rawLine = Number(d?.line);
      const safeLine = Number.isFinite(rawLine)
        ? Math.min(Math.max(1, rawLine), lineCount)
        : 1;

      const rawCol = Number(d?.column);
      const safeStartCol = Number.isFinite(rawCol) && rawCol > 0 ? rawCol : 1;
      const lineLen = model.getLineContent(safeLine).length;
      const safeEndCol = Math.max(safeStartCol, lineLen + 1);

      const sev =
        d?.severity === "error"
          ? monaco.MarkerSeverity.Error
          : d?.severity === "warning"
            ? monaco.MarkerSeverity.Warning
            : monaco.MarkerSeverity.Info;

      return {
        startLineNumber: safeLine,
        endLineNumber: safeLine,
        startColumn: safeStartCol,
        endColumn: safeEndCol,
        message: d?.message || "Issue",
        severity: sev,
      };
    });

    monaco.editor.setModelMarkers(model, "my-linter", markers);
  }

  async function runLinter() {
    try {
      ruleWarning = "";
      lintResults = "";
      diagnostics = [];
      fixedMarkdown = "";
      await tick();
      const ruleContent = rulesEditor?.getValue();
      const markdownContent = markdownEditor?.getValue();

      if (!ruleContent || !markdownContent) {
        alert("Please enter both rules.yaml and README content!");
        return;
      }
      lintState = "running";
      originalText = markdownContent;

      const response = await fetch(`${baseURL}/api/run-pipeline`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          yamlText: ruleContent,
          markdown: markdownContent,
        }),
      });

      const ctx = await response.json();
      console.log(ctx.ast);
      if (ctx.error) {
        alert(`Pipeline error: ${ctx.error}`);
        return;
      }
      diagnostics = ctx.diagnostics || [];
      fixedMarkdown = ctx.fixedMarkdown || originalText;

      const judgmentOperators = new Set([
        "threshold",
        "isPresent",
        "compare",
        "fixUsingLLM",
        "detectHateSpeech",
        "readmeLocationCheck",
        "detectDuplicateSentences",
        "codeBlockFormatting",
      ]);

      if (diagnostics.length > 0) {
        const errorCount = diagnostics.filter(
          (d) => d.severity === "error",
        ).length;
        const warningCount = diagnostics.filter(
          (d) => d.severity === "warning",
        ).length;
        const infoCount = diagnostics.filter(
          (d) => d.severity === "info",
        ).length;

        if (errorCount > 0 || warningCount > 0) {
          lintResults =
            `Lint failed with ${errorCount} error(s) and ${warningCount} warning(s).\n\n` +
            diagnostics
              .map(
                (d) => `${d.severity.toUpperCase()} [${d.line}]: ${d.message}`,
              )
              .join("\n");
        } else {
          lintResults =
            `Lint successful! No issues found.\n\n` +
            diagnostics
              .map(
                (d) => `${d.severity.toUpperCase()} [${d.line}]: ${d.message}`,
              )
              .join("\n");
        }
      } else {
        const isJudging = judgmentOperators.has(ctx.lastOperator);
        const fixedByLLM =
          ctx.fixedMarkdown && ctx.fixedMarkdown !== originalText;
        if (isJudging && fixedByLLM) {
          lintResults = `Fixes were suggested.\n\nClick on the Toggle "Show difference view" to preview or "Apply Fixes" to apply the suggested changes to your README.`;
        } else if (isJudging) {
          lintResults = `Lint successful! No issues found.`;
        } else {
          ruleWarning = `This rule does not produce actual lint results. It may be missing a judgment step like "threshold", "isPresent", "compare".`;
          setTimeout(() => {
            ruleWarning = "";
          }, 5000);
        }

        if (!isJudging && ctx.pipelineResults && ctx.pipelineResults.length) {
          ctx.pipelineResults.forEach(({ name, data }, idx) => {
            const payload = data.data ?? data;
            const scopes = data.scopes ?? Object.keys(payload);
            lintResults += `\nOutput from ${name.toUpperCase()} operator (step ${idx + 1}):\n`;
            lintResults += formatOperatorOutput(name, payload, scopes);
          });
        }
      }

      const model = markdownEditor.getModel();
      applyDiagnosticsToEditor(diagnostics);

      const errorCount = diagnostics.filter(
        (d) => d.severity === "error",
      ).length;
      const warningCount = diagnostics.filter(
        (d) => d.severity === "warning",
      ).length;
      const lintFailed = errorCount > 0 || warningCount > 0;
      lintState =
        errorCount > 0 ? "error" : warningCount > 0 ? "warning" : "success";
      applyDiagnosticsToEditor(diagnostics);
      if (
        lintFailed &&
        ctx.fixedMarkdown &&
        ctx.fixedMarkdown !== originalText
      ) {
        lintResults +=
          '\n\n Click "Show Diff View" to review the suggested fixes, "Apply Fixes to Editor" to accept the fix.';
      }
      await setOutput(lintResults);

      if (showDiff) {
        updateDiffModels();
      }
      await logRuleRun(
        [ruleContent],
        markdownContent,
        diagnostics,
        "single",
        fixedMarkdown,
      );
    } catch (err) {
      console.error("Linting failed", err);
      lintState = "error";
    } finally {
      setTimeout(() => (lintState = "idle"), 5000);
    }
  }

  function toggleDiffView() {
    showDiff = !showDiff;

    if (showDiff && fixedMarkdown && fixedMarkdown !== originalText) {
      updateDiffModels();
    }
  }

  function setDefaultHeight(node, visible) {
    const apply = (v) => {
      if (v) {
        node.style.flexBasis = "260px";
        outputEditor?.layout();
      }
    };

    apply(visible);
    return { update: apply };
  }

  function applyFixesToEditor() {
    markdownEditor.setValue(fixedMarkdown);
  }

  async function runMultipleRules() {
    const markdownContent = markdownEditor?.getValue();
    if (selectedRuleIds.length === 0) {
      alert("Please select at least one rule");
      return;
    }
    if (!markdownContent) {
      alert("Please load or write README content!");
      return;
    }

    multiLintState = "running";
    try {
      await tick();

      let collectedYamls = [];
      let combinedResults = "";
      let combinedDiagnostics = [];
      let workingMarkdown = markdownContent;
      originalText = markdownContent;

      for (const ruleId of selectedRuleIds) {
        setRuleStatus(ruleId, "running");
        const docSnap = await getDoc(doc(db, "rules", ruleId));
        if (!docSnap.exists()) {
          setRuleStatus(ruleId, "fail");
          continue;
        }

        const rec = { id: docSnap.id, ...docSnap.data() };
        collectedYamls.push(rec.yaml);

        const response = await fetch(`${baseURL}/api/run-pipeline`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            yamlText: rec.yaml,
            markdown: workingMarkdown,
          }),
        });

        const ctx = await response.json();

        if (ctx.error) {
          combinedResults += `Rule ${rec.name}: Error - ${ctx.error}\n\n`;
          setRuleStatus(ruleId, "fail");
          continue;
        }

        const hasErrors = (ctx.diagnostics || []).some(
          (d) => d.severity === "error",
        );
        const hasWarnings = (ctx.diagnostics || []).some(
          (d) => d.severity === "warning",
        );

        if (ctx.diagnostics?.length) {
          combinedResults +=
            `Rule ${rec.name}:\n` +
            ctx.diagnostics
              .map(
                (d) => `${d.severity.toUpperCase()} [${d.line}]: ${d.message}`,
              )
              .join("\n") +
            "\n\n";
          combinedDiagnostics.push(...ctx.diagnostics);
        }

        if (ctx.fixedMarkdown && ctx.fixedMarkdown !== workingMarkdown) {
          workingMarkdown = ctx.fixedMarkdown;
          combinedResults += `Rule ${rec.name}: Suggested fixes available.\n\n`;
        }

        setRuleStatus(ruleId, hasErrors || hasWarnings ? "fail" : "pass");
      }

      fixedMarkdown = workingMarkdown;
      applyDiagnosticsToEditor(combinedDiagnostics);
      if (showDiff && fixedMarkdown !== originalText) updateDiffModels();

      if (!combinedResults.trim()) {
        combinedResults = "All selected rules passed. No issues found.";
      }

      const hasErr = combinedDiagnostics.some((d) => d.severity === "error");
      const hasWarn = combinedDiagnostics.some((d) => d.severity === "warning");
      multiLintState = hasErr ? "error" : hasWarn ? "warning" : "success";

      await logRuleRun(
        collectedYamls,
        markdownContent,
        combinedDiagnostics,
        "multiple",
        fixedMarkdown,
      );
      await setOutput(combinedResults);
    } catch (e) {
      console.error("runMultipleRules failed", e);
      multiLintState = "error";
    } finally {
      setTimeout(() => (multiLintState = "idle"), 2000);
    }
  }

  async function loadFileContent(type, event) {
    const fileName = event.target.value;
    if (!fileName) return;

    try {
      const response = await fetch(
        `${baseURL}/api/file-content?type=${type}&fileName=${fileName}`,
      );
      const data = await response.json();

      if (type === "rules") {
        rulesYaml = data.content;
        if (rulesEditor) rulesEditor.setValue(rulesYaml);
      } else {
        markdownText = data.content;
        if (markdownEditor) markdownEditor.setValue(markdownText);
      }
    } catch (error) {
      console.error("Error loading file content:", error);
    }
  }

  async function loadReadmeFromDB(id) {
    if (!id) return;
    const docSnap = await getDoc(doc(db, "readmes", id));
    if (docSnap.exists()) {
      markdownText = docSnap.data().content;
      markdownEditor?.setValue(markdownText);
    }
  }

  function getCategoryStatus(category, _status = ruleStatus) {
    const selectedInCategory = ruleList
      .filter((r) => r.category === category && selectedRuleIds.includes(r.id))
      .map((r) => r.id)
      .filter((id) => id in ruleStatus);

    if (!selectedInCategory.length) return null;
    if (selectedInCategory.some((id) => ruleStatus[id] === "running"))
      return "running";
    if (selectedInCategory.some((id) => ruleStatus[id] === "fail"))
      return "fail";
    if (selectedInCategory.every((id) => ruleStatus[id] === "pass"))
      return "pass";

    return null;
  }
</script>

<main>
  <div class="header-container">
    <div class="left-header">
      <h2>LintMe - Markdown Linter</h2>
      {#if mode === "runner"}
        <button
          on:click={runLinter}
          disabled={lintState === "running"}
          class:running={lintState === "running"}
          class:success={lintState === "success"}
          class:error={lintState === "error" || lintState === "warning"}
        >
          {#if lintState === "running"}
            Running…<span class="loader-spinner" />
          {:else if lintState === "success"}
            Lint Successful
          {:else if lintState === "warning" || lintState === "error"}
            Lint Failed
          {:else}
            Run Linter
          {/if}
        </button>
      {/if}
    </div>

    {#if fixedMarkdown && fixedMarkdown !== originalText}
      <div class="right-header flex items-center gap-3">
        <label
          class="diff-switch"
          title={showDiff ? "Hide difference view" : "Show difference view"}
        >
          <input
            type="checkbox"
            checked={showDiff}
            on:change={toggleDiffView}
          />
          <span class="slider"></span>
        </label>

        <button on:click={applyFixesToEditor}> Apply Fixes </button>
      </div>
    {/if}
  </div>

  <div class="resizable-pane">
    <div class="top-pane" bind:this={topPane}>
      <div class="container">
        <div class="file-upload flex" style="flex-direction: row;">
          <div class="mode-toggle-bar">
            <button
              class:active={mode === "runner"}
              on:click={() => (mode = "runner")}
            >
              Rule&nbsp;Editor
            </button>
            <button
              class:active={mode === "loader"}
              on:click={() => (mode = "loader")}
            >
              Rules&nbsp;Runner
            </button>
          </div>
          <div style="flex:1; display:flex; flex-direction:column;">
            {#if mode === "runner"}
              <div class="rule-select-row">
                <div class="compact-select">
                  <SvelteSelect
                    items={combinedRuleOptions}
                    bind:value={selectedRule}
                    placeholder="Select Rule"
                    clearable
                    on:select={({ detail }) => {
                      selectedRule = detail;
                      selectedRuleId = detail.value;
                      handleCombinedRuleSelection(detail);
                    }}
                    on:clear={() => {
                      selectedRule = null;
                      selectedRuleId = "";
                      rulesYaml = "";
                      rulesEditor?.setValue("");
                    }}
                  />
                </div>
                <button on:click={saveCurrentRule}>Save Rule</button>
                {#if selectedRule?.type === "saved"}
                  <button
                    class="delete-btn"
                    on:click={async () => {
                      if (confirm("Delete this rule?")) {
                        await deleteDoc(doc(db, "rules", selectedRuleId));
                        ruleList = await loadRulesFromFirestore();
                        selectedRule = null;
                        selectedRuleId = "";
                        rulesEditor?.setValue("");
                      }
                    }}
                  >
                    Delete Rule
                  </button>
                {/if}
              </div>
            {/if}

            {#if mode === "runner"}
              <div class="bg-gray-50 p-4 rounded border relative">
                <OperatorTriggerPanel
                  bind:rulesEditor
                  on:llmGenerated={({ detail }) => {
                    const { yaml, errors } = detail;
                    if (rulesEditor && yaml) {
                      updateRuleMarkers(
                        rulesEditor.getModel(),
                        errors || [],
                        yaml,
                      );
                    }
                  }}
                />
              </div>

              {#if ruleWarning}
                <div
                  class="text-base text-yellow-700 bg-yellow-100 p-2 rounded border border-yellow-300 mt-2"
                  style="font-size: 14px;"
                >
                  ⚠️ {ruleWarning}
                </div>
              {/if}
            {/if}

            <div
              class="editor-container {mode !== 'runner' ? 'hidden' : ''}"
              bind:this={rulesEditorContainer}
            />
            <div
              class="bg-gray-50 p-4 rounded border flex flex-col gap-2 overflow-y-auto"
              style="max-height: 100%; flex: 1;"
              class:hidden={mode !== "loader"}
            >
              <div class="flex items-center justify-between">
                <h3 class="font-semibold text-sm">Available Rules</h3>

                <div class="flex items-center gap-2">
                  <label class="text-xs text-gray-600" for="preset-select"
                    >Preset:</label
                  >
                  <select
                    id="preset-select"
                    bind:value={selectedPreset}
                    on:change={handlePresetChange}
                    class="text-sm border rounded px-2 py-1 bg-white"
                    style="min-width: 260px;"
                  >
                    <option value="">Select a preset</option>
                    {#each Object.entries(rulePresets) as [key, p]}
                      <option value={key}>{p.label}</option>
                    {/each}
                  </select>
                </div>
              </div>

              {#each categoriesMeta as cat}
                <div class="mb-2 p-2 border rounded bg-white">
                  <div class="flex items-center justify-between">
                    <label
                      class="flex items-center gap-2 text-sm font-semibold"
                    >
                      <input
                        type="checkbox"
                        bind:checked={categorySelection[cat.name]}
                        on:change={(e) =>
                          toggleCategoryCheckbox(cat.name, e.target.checked)}
                      />
                      {cat.label} Rules

                      {#if getCategoryStatus(cat.name, ruleStatus) === "running"}
                        <span class="loader-spinner"></span>
                      {:else if getCategoryStatus(cat.name, ruleStatus) === "pass"}
                        ✅
                      {:else if getCategoryStatus(cat.name, ruleStatus) === "fail"}
                        ❌
                      {/if}
                    </label>

                    <button
                      on:click={() => toggleCategoryExpand(cat.name)}
                      aria-expanded={expandedCategories.has(cat.name)}
                    >
                      {expandedCategories.has(cat.name)
                        ? "Hide Rules"
                        : "Show Rules"}
                    </button>
                  </div>
                  <span class="text-xs text-gray-600 italic block mt-1"
                    >{cat.description}</span
                  >
                  {#if expandedCategories.has(cat.name)}
                    <div class="ml-4 mt-2 flex flex-col gap-1">
                      {#each ruleList.filter((r) => r.category === cat.name) as rule (rule.id)}
                        <div class="rule-item">
                          <div class="rule-row">
                            <input
                              type="checkbox"
                              checked={selectedRuleIds.includes(rule.id)}
                              on:click|stopPropagation
                              on:change={(e) => {
                                const id = rule.id;
                                if (e.currentTarget.checked) {
                                  if (!selectedRuleIds.includes(id)) {
                                    selectedRuleIds = [...selectedRuleIds, id];
                                  }
                                } else {
                                  selectedRuleIds = selectedRuleIds.filter(
                                    (x) => x !== id,
                                  );
                                }
                              }}
                            />
                            <span
                              class="rule-name"
                              role="button"
                              tabindex="0"
                              title="View description"
                              on:click={() => toggleDescription(rule)}
                              on:keydown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  toggleDescription(rule);
                                }
                              }}
                            >
                              {rule.name}
                            </span>

                            <div class="rule-actions">
                              {#if ruleStatus[rule.id] === "running"}
                                <span class="loader-spinner"></span>
                              {:else if ruleStatus[rule.id] === "pass"}
                                ✅
                              {:else if ruleStatus[rule.id] === "fail"}
                                ❌
                              {/if}

                              <button
                                class="edit-btn"
                                title="Edit rule"
                                on:click={async (e) => {
                                  e.stopPropagation();
                                  selectedRule = {
                                    label: rule.name,
                                    value: rule.id,
                                    type: "saved",
                                  };
                                  selectedRuleId = rule.id;
                                  mode = "runner";
                                  await loadRuleFromDB(rule.id);
                                  await tick();
                                  if (rulesEditorContainer) {
                                    rulesEditorContainer.classList.add(
                                      "flash-border",
                                    );
                                    setTimeout(() => {
                                      rulesEditorContainer.classList.remove(
                                        "flash-border",
                                      );
                                    }, 1000);
                                  }
                                }}
                              >
                                ✏️
                              </button>
                            </div>
                          </div>

                          {#if rule.showDescription}
                            <div class="rule-description">
                              {rule.description || "(No description provided)"}
                            </div>
                          {/if}
                        </div>
                      {/each}
                    </div>
                  {/if}
                </div>
              {/each}

              <button
                on:click={runMultipleRules}
                disabled={multiLintState === "running"}
                class:running={multiLintState === "running"}
                class:success={multiLintState === "success"}
                class:error={multiLintState === "error" ||
                  multiLintState === "warning"}
              >
                {#if multiLintState === "running"}
                  Running<span class="loader-spinner" />
                {:else if multiLintState === "success"}
                  Lint Successful
                {:else if multiLintState === "error" || multiLintState === "warning"}
                  Lint Failed
                {:else}
                  Run Selected Rules
                {/if}
              </button>
            </div>
          </div>
        </div>

        <div class="file-upload" style="display: {showDiff ? 'none' : 'flex'}">
          <div class="rule-select-row">
            <div class="compact-select">
              <SvelteSelect
                items={readmeFiles.map((f) => ({ label: f.name, value: f.id }))}
                bind:value={selectedReadme}
                placeholder="Select README"
                clearable
                on:select={({ detail }) => {
                  selectedReadme = detail;
                  selectedReadmeId = detail.value;
                  loadReadmeFromDB(detail.value);
                }}
                on:clear={() => {
                  selectedReadme = null;
                  selectedReadmeId = "";
                  markdownText = "";
                  markdownEditor?.setValue("");
                }}
              />
            </div>
            <button on:click={saveReadmeToDB}>Save README</button>
            {#if selectedReadmeId}
              <button
                class="delete-btn"
                on:click={async () => {
                  if (confirm("Delete this README?")) {
                    await deleteDoc(doc(db, "readmes", selectedReadmeId));
                    readmeFiles = await loadReadmesFromFirestore();
                    selectedReadme = null;
                    selectedReadmeId = "";
                    markdownText = "";
                    markdownEditor?.setValue("");
                  }
                }}
              >
                Delete README
              </button>
            {/if}
          </div>
          <div
            class="editor-container"
            bind:this={markdownEditorContainer}
          ></div>
          <div
            class="bottom-pane"
            use:setDefaultHeight={true}
            bind:this={outputEditorContainer}
          />
        </div>

        <div
          class="diff-editor-container"
          class:show={showDiff}
          bind:this={diffEditorContainer}
        ></div>
      </div>
    </div>
  </div>

  {#if highlightedMarkdown}
    <div class="lint-preview" bind:this={markdownPreviewDiv}>
      {@html highlightedMarkdown}
    </div>
  {/if}
</main>
