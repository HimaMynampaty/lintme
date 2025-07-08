<script>
  import { onMount } from 'svelte';
  import * as monaco from 'monaco-editor';
  import OperatorTriggerPanel from './components/OperatorTriggerPanel.svelte';
  const params = new URLSearchParams(window.location.search);
  let rulesYaml = decodeURIComponent(params.get("rule") || "");
  import { collection, addDoc, getDocs, deleteDoc, getDoc, doc } from "firebase/firestore";
  import { db } from "./lib/firebase.js";
  import { pipeline } from './stores/pipeline.js';


  const sharedFontSize = 14;
  let markdownText = "";
  let originalText = "";

  let lintResults = "";
  let fixedMarkdown = "";
  let diagnostics      = [];  
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
  let showPalette = false;
  let startY;
  let startHeight;
  let outputEditorContainer;
  let outputEditor;
  let showOutput = false;

  let mode = 'runner'; 
  let selectedRuleIds = []; 
  let expandedCategories = new Set();
let categorySelection = {};  // { structure: false, ... }

const categoriesMeta = [
  {
    name: "structure",
    label: "Structure",
    description: "Ensures proper document layout, sectioning, and organization."
  },
  {
    name: "style",
    label: "Style",
    description: "Checks grammar, spelling, tone, and consistent writing style."
  },
  {
    name: "content",
    label: "Content",
    description: "Ensures content completeness, best practices, and clarity."
  },
  {
    name: "sensitive",
    label: "Sensitive",
    description: "Detects hate speech, harmful or inappropriate language."
  }
];

categoriesMeta.forEach(c => categorySelection[c.name] = false);

function toggleCategoryExpand(name) {
  if (expandedCategories.has(name)) {
    expandedCategories.delete(name);
  } else {
    expandedCategories.add(name);
  }
  expandedCategories = new Set(expandedCategories); // reassign for Svelte reactivity
}


function toggleCategoryCheckbox(category, checked) {
  categorySelection[category] = checked;
  ruleList
    .filter(r => r.category === category)
    .forEach(r => {
      if (checked && !selectedRuleIds.includes(r.id)) {
        selectedRuleIds.push(r.id);
      } else if (!checked) {
        selectedRuleIds = selectedRuleIds.filter(id => id !== r.id);
      }
    });
}

  function startResize(e) {
    startY      = e.clientY;
    startHeight = outputEditorContainer.getBoundingClientRect().height;
    window.addEventListener('mousemove', resizeOutput);
    window.addEventListener('mouseup',  stopResize);
  }

function resizeOutput(e) {
  const dy        = e.clientY - startY;
  const newHeight = Math.max(120, startHeight - dy);      // drag up ⇒ bigger
  outputEditorContainer.style.flexBasis = `${newHeight}px`;
  outputEditor?.layout();                                 // relayout Monaco
}

function stopResize() {
  window.removeEventListener('mousemove', resizeOutput);
  window.removeEventListener('mouseup',  stopResize);
}


  $: combinedRuleOptions = [
    ...ruleList.map(r => ({
      label: r.name,
      value: r.id,
      type: 'saved'
    })),
    ...rulesFiles.map(file => ({
      label: file,
      value: file,
      type: 'yaml'
    }))
  ];

  $: if (outputEditor && lintResults !== outputEditor.getValue()) {
    outputEditor.setValue(lintResults || 'No lint results to display yet.');
  }


  let selectedCombinedRule = '';

  onMount(async () => {
    rulesEditor = monaco.editor.create(rulesEditorContainer, {
      value: rulesYaml,
      language: 'yaml',
      automaticLayout: true,
      minimap: { enabled: false },
      fixedOverflowWidgets: true,
      fontSize: sharedFontSize
    });

    markdownEditor = monaco.editor.create(markdownEditorContainer, {
      value: markdownText,
      language: 'markdown',
      automaticLayout: true,
      minimap: { enabled: false },
      fixedOverflowWidgets: true,
      fontSize: sharedFontSize
    });
    markdownEditor.onDidChangeModelContent(() => {
      markdownText = markdownEditor.getValue();
    });
    diffEditor = monaco.editor.createDiffEditor(diffEditorContainer, {
      readOnly: true,
      automaticLayout: true,
      minimap: { enabled: false },
      fixedOverflowWidgets: true,
      fontSize: sharedFontSize
    });

    outputEditor = monaco.editor.create(outputEditorContainer, {
      value: lintResults || 'No lint results to display yet.',
      language: 'plaintext',
      readOnly: true,
      automaticLayout: true,
      minimap: { enabled: false },
      fontSize: sharedFontSize,
      wordWrap: 'on',
      scrollBeyondLastLine: false
    });


    fetchFiles("rules");
    fetchFiles("readme");
    ruleList = await loadRulesFromFirestore();
  });

  async function saveCurrentRule() {
    const name = prompt('Rule name?', 'my-rule');
    if (!name) return;

    const category = prompt('Category? (e.g. structure, style, content, sensitive)', 'structure');
    if (!category) return;

    const yamlContent = rulesEditor.getValue();
    try {
      await addDoc(collection(db, "rules"), {
        name: name,
        yaml: yamlContent,
        category: category,
        createdAt: new Date()
      });
      alert(`Rule "${name}" saved to Firestore!`);
      await loadRulesFromFirestore(); 
    } catch (err) {
      console.error("Error saving rule:", err);
      alert("Failed to save rule.");
    }
  }

  async function loadRulesFromFirestore() {
    const querySnapshot = await getDocs(collection(db, "rules"));
    const rules = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    ruleList = rules;
    return rules;
  }


  onMount(() => {
    loadRulesFromFirestore();
  });

  function updateDiffModels() {
    const current = diffEditor.getModel();

    if (current?.original) current.original.dispose();
    if (current?.modified) current.modified.dispose();

    const originalModel = monaco.editor.createModel(originalText, "markdown");
    const modifiedModel = monaco.editor.createModel(fixedMarkdown, "markdown");

    diffEditor.setModel({ original: originalModel, modified: modifiedModel });
  }



  async function loadRuleFromDB(id) {
    const docSnap = await getDoc(doc(db, "rules", id));
    if (docSnap.exists()) {
      const rec = { id: docSnap.id, ...docSnap.data() };
      rulesYaml = rec.yaml;
      if (rulesEditor) rulesEditor.setValue(rec.yaml);
    } else {
      console.warn("Rule not found in Firestore", id);
    }
  }


  async function handleCombinedRuleSelection(event) {
    const selectedValue = event.target.value;

    if (!selectedValue) {
      rulesYaml = "";
      if (rulesEditor) rulesEditor.setValue("");
      $pipeline = [];
      return;
    }

    const selectedOption = combinedRuleOptions.find(opt => opt.value === selectedValue);
    if (!selectedOption) return;

    if (selectedOption.type === 'saved') {
      await loadRuleFromDB(selectedOption.value);
    } else if (selectedOption.type === 'yaml') {
      await loadFileContent('rules', { target: { value: selectedOption.value } });
    }
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
        if (typeof item === 'string') {
          const label = item === '\n' ? 'newline character' : item;
          result += `    - ${label}\n`;
        } else if (item.line && item.matches) {
          const entries = item.matches.map(m => {
            if (typeof m === 'string') return m;
            if (typeof m === 'object') {
              return m.content ?? m.value ?? m.type ?? JSON.stringify(m);
            }
            return String(m);
          });
          result += `    - Line ${item.line}: ${entries.join(', ')}\n`;
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
        typeof value === 'object' &&
        value.missing !== undefined &&
        value.extra   !== undefined
      ) {
        result += `  ${scope}:\n`;
        result += `    missing (${value.missing.length}):\n`;
        value.missing.forEach(item =>
          result += `      • ${item}\n`
        );
        result += `    extra   (${value.extra.length}):\n`;
        value.extra.forEach(item =>
          result += `      • ${item}\n`
        );
        
      }      
      else if (typeof value === 'object') {
        const entries = Object.entries(value);
        if (entries.length === 0) {
          result += `  ${scope}: (no matches)\n`;
          continue;
        }

        result += `  ${scope}:\n`;
        for (const [line, matches] of entries) {
          if (Array.isArray(matches)) {
            const labels = matches.map(m =>
              typeof m === 'string'
                ? (m === '\n' ? 'newline character' : m)          // regex hits
                : m.content ?? m.value ?? m.type ?? '[node]');   // mdast nodes

            result += `    - Line ${line}: ${labels.join(', ')}\n`;
          } else {
            result += `    - Line ${line}: ${matches}\n`;
          }          
        }
      } else if (typeof value === 'number') {
        result += `  ${scope}: ${value}\n`;
      }
    }

    return result;
  }

  function applyDiagnosticsToEditor(diags) {
    const model = markdownEditor.getModel();
    monaco.editor.setModelMarkers(
      model,
      'my-linter',
      diags.map(d => ({
        startLineNumber: d.line,
        endLineNumber:   d.line,
        startColumn:     1,
        endColumn:       model.getLineContent(d.line).length + 1,
        message:         d.message,
        severity:
          d.severity === 'error'
            ? monaco.MarkerSeverity.Error
            : d.severity === 'warning'
            ? monaco.MarkerSeverity.Warning
            : monaco.MarkerSeverity.Info
      }))
    );
  }

  async function runLinter() {
    showOutput = true; 
    const ruleContent = rulesEditor?.getValue();
    const markdownContent = markdownEditor?.getValue();

    if (!ruleContent || !markdownContent) {
      alert("Please enter both rules.yaml and README content!");
      return;
    }

    originalText = markdownContent;

    const response = await fetch('/.netlify/functions/runPipeline', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
    diagnostics   = ctx.diagnostics || [];
    fixedMarkdown = ctx.fixedMarkdown || originalText;



    const judgmentOperators = new Set(['threshold', 'isPresent', 'compare', 'fixUsingLLM', 'detectHateSpeech']);

    if (diagnostics.length > 0) {
      const errorCount = diagnostics.filter(d => d.severity === 'error').length;
      const warningCount = diagnostics.filter(d => d.severity === 'warning').length;
      const infoCount = diagnostics.filter(d => d.severity === 'info').length;

      if (errorCount > 0 || warningCount > 0) {
        lintResults = `Lint failed with ${errorCount} error(s) and ${warningCount} warning(s).\n\n` +
          diagnostics.map(d => `${d.severity.toUpperCase()} [${d.line}]: ${d.message}`).join('\n');
      } else {
        lintResults = `Lint successful! No issues found.\n\n` +
          diagnostics.map(d => `${d.severity.toUpperCase()} [${d.line}]: ${d.message}`).join('\n');
      }
    } else {


      const isJudging = judgmentOperators.has(ctx.lastOperator);
      const fixedByLLM = ctx.fixedMarkdown && ctx.fixedMarkdown !== originalText;
      if (isJudging && fixedByLLM) {
        lintResults = `Fixes were suggested.\n\nClick "Show Diff View" to preview or "Apply Fixes to Editor".`;
      } else if (isJudging) {
        lintResults = `Lint successful! No issues found.`;
      } else {
        lintResults = `This rule does not produce actual lint results. It may be missing a judgment step like "threshold".`;
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

    const errorCount = diagnostics.filter(d => d.severity === 'error').length;
    const warningCount = diagnostics.filter(d => d.severity === 'warning').length;
    const lintFailed = errorCount > 0 || warningCount > 0;

    if (lintFailed && ctx.fixedMarkdown && ctx.fixedMarkdown !== originalText) {
      lintResults += '\n\n Click "Show Diff View" to review the suggested fixes, "Apply Fixes to Editor" to accept the fix.';
    }

    if (showDiff) {
      updateDiffModels();
    }
  }

  function toggleDiffView() {
    showDiff = !showDiff;

    if (showDiff && fixedMarkdown && fixedMarkdown !== originalText) {
      updateDiffModels();
    }
  }


  function setDefaultHeight(node, visible) {
    const apply = v => {
      if (v) {                     
        node.style.flexBasis = '260px';  
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
    if (selectedRuleIds.length === 0) {
      alert("Please select at least one rule");
      return;
    }

    const markdownContent = markdownEditor?.getValue();
    if (!markdownContent) {
      alert("Please load or write README content!");
      return;
    }

    let combinedResults = "";
    let combinedDiagnostics = [];
    let workingMarkdown = markdownContent;

    originalText = markdownContent;

    for (const ruleId of selectedRuleIds) {
      const docSnap = await getDoc(doc(db, "rules", ruleId));
      if (!docSnap.exists()) continue;

      const rec = { id: docSnap.id, ...docSnap.data() };

      const response = await fetch('/.netlify/functions/runPipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          yamlText: rec.yaml,
          markdown: workingMarkdown, 
        }),
      });

      const ctx = await response.json();

      if (ctx.error) {
        combinedResults += `Rule ${rec.name}: Error - ${ctx.error}\n\n`;
      } else if (ctx.diagnostics && ctx.diagnostics.length) {
        combinedResults += `Rule ${rec.name}:\n` + ctx.diagnostics.map(d =>
          `${d.severity.toUpperCase()} [${d.line}]: ${d.message}`
        ).join('\n') + '\n\n';
        combinedDiagnostics.push(...ctx.diagnostics);
      }

      if (ctx.fixedMarkdown && ctx.fixedMarkdown !== workingMarkdown) {
        workingMarkdown = ctx.fixedMarkdown;
        combinedResults += `Rule ${rec.name}: Suggested fixes available (click Show Diff View).\n\n`;
      } else if (!(ctx.diagnostics && ctx.diagnostics.length > 0)) {
        // no diagnostics, no fixes
        combinedResults += `Rule ${rec.name}: Passed.\n\n`;
      }


    }

    fixedMarkdown = workingMarkdown;

    applyDiagnosticsToEditor(combinedDiagnostics);

    if (showDiff && fixedMarkdown && fixedMarkdown !== originalText) {
      updateDiffModels();
    }

    lintResults = combinedResults;
    showOutput = true;
  }


  async function fetchFiles(type) {
    try {
      const response = await fetch(`http://localhost:5000/api/files?type=${type}`);
      const data = await response.json();
      if (type === "rules") {
        rulesFiles = data.files;
      } else {
        readmeFiles = data.files;
      }
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  }

  async function loadFileContent(type, event) {
    const fileName = event.target.value;
    if (!fileName) return;

    try {
      const response = await fetch(`http://localhost:5000/api/file-content?type=${type}&fileName=${fileName}`);
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
</script>

<style>

:root {
  --header-h: 56px;
}

main {
  display: flex;
  flex-direction: column;
  height: 100vh;        
  font-family: Arial, sans-serif;
  overflow: hidden;     
}

.header-container {
  height: var(--header-h);
  flex-shrink: 0;         
  width: 100%;
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 0 20px;
  background: #fff;
  border-bottom: 1px solid #ccc;
}

h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #005a9e;
}

button {
  padding: 10px 16px;
  font-size: 14px;
  background: #005a9e;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background .15s;
}
button:hover { background: #004b8a; }

.container {
  flex: 1 1 auto;
  display: flex;
  gap: 10px;
  padding: 10px 0; 
  box-sizing: border-box;
  overflow: hidden;
  width: 100%;      
  max-width: 100vw; 
}

.file-upload,
.diff-editor-container {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  width: 100%;     
  max-width: 100%; 
  position: relative;
}

.editor-container,
.diff-editor-container {
  flex: 1 1 0;
  min-width: 0;
  overflow: visible;
  width: 100%;
}


select {
  margin-bottom: 10px;
  padding: 10px;
  font-size: 16px;
  border-radius: 8px;
  border: 1px solid #ccc;
  background: #f0f4f8;
}

.hidden { display: none !important; }

.diff-editor-container { display: none; }
.diff-editor-container.show { display: flex; }

.resizer {
  height: 6px;
  background: #ccc;
  cursor: row-resize;
  width: 100%;
}
.resizer:hover {
  background: #999;
}

.resizable-pane {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  min-height: 0;
  overflow: hidden;
}

.top-pane {
  flex-grow: 1;
  min-height: 100px;
  display: flex;
  flex-direction: column;
  overflow: visible;
}

.bottom-pane {
  min-height: 0;
  max-height: 85vh;
  background: #1e1e1e;
  border-top: 1px solid #333;
  display: flex;
  flex-direction: column;
  position: relative;
}

.mode-toggle-bar {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  gap: 10px;
  background: #f0f4f8;
  border-right: 1px solid #ccc;
  padding: 10px 0;
  width: 40px; /* like a vertical toolbar */
  flex-shrink: 0;
}

.mode-toggle-bar button {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  width: 100%;
  background: #005a9e;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 0;
  font-size: 14px;
  cursor: pointer;
  transition: background .15s;
}

.mode-toggle-bar button:hover {
  background: #004b8a;
}

.mode-toggle-bar button.active {
  background: #004b8a;
  font-weight: bold;
}




</style>

<main>
  <div class="header-container">
    <h2>LintMe - Markdown Linter</h2>
    <button on:click={runLinter}>Run Linter</button>
    <button on:click={saveCurrentRule}>Save rule</button>
    {#if combinedRuleOptions.find(o => o.value === selectedCombinedRule && o.type === 'saved')}
      <button class="delete-btn" on:click={async () => {
        if (confirm("Delete this rule?")) {
          try {
            await deleteDoc(doc(db, "rules", selectedCombinedRule));
          } catch (e) {
            console.warn("Firestore delete skipped or failed", e);
          }
          ruleList = await loadRulesFromFirestore();
          selectedCombinedRule = '';
          rulesEditor?.setValue('');
        }
      }}>
        Delete Rule
      </button>
    {/if}

    <button on:click={toggleDiffView}>
      {showDiff ? "Hide Diff View" : "Show Diff View"}
    </button>
    <button on:click={applyFixesToEditor}>
      Apply Fixes to Editor
    </button>
  </div>

<div class="resizable-pane">
  <div class="top-pane" bind:this={topPane}>
    <div class="container">
      <div class="file-upload flex" style="flex-direction: row;">

        <div class="mode-toggle-bar">
          <button
            class:active={mode === 'runner'}
            on:click={() => mode = 'runner'}
          >
            Runner
          </button>
          <button
            class:active={mode === 'loader'}
            on:click={() => mode = 'loader'}
          >
            Loader
          </button>
        </div>
        <div style="flex:1; display:flex; flex-direction:column;">
        <select on:change={handleCombinedRuleSelection} bind:value={selectedCombinedRule}>
          <option value="">Select Rule</option>
          <optgroup label="Saved Rules">
            {#each ruleList as r}
              <option value={r.id}>{r.name}</option>
            {/each}
          </optgroup>
          <optgroup label="YAML Files">
            {#each rulesFiles as file}
              <option value={file}>{file}</option>
            {/each}
          </optgroup>
        </select>
        {#if mode === 'runner'}
          <div class="bg-gray-50 p-4 rounded border relative">
            <OperatorTriggerPanel bind:rulesEditor />
          </div>
        {/if}

  <div
    class="editor-container {mode !== 'runner' ? 'hidden' : ''}"
    bind:this={rulesEditorContainer}
  />
<div
  class="bg-gray-50 p-4 rounded border flex flex-col gap-2 overflow-y-auto {mode !== 'loader' ? 'hidden' : ''}"
  style="max-height: 400px;"
>
  <h3 class="font-semibold text-sm">Available Rules</h3>

  {#each categoriesMeta as cat}
    <div class="mb-2 p-2 border rounded bg-white">
      <div class="flex items-center justify-between">
        <label class="flex items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            bind:checked={categorySelection[cat.name]}
            on:change={(e) => toggleCategoryCheckbox(cat.name, e.target.checked)}
          />
          {cat.label} Rules
        </label>
        <button
          class="text-xs text-blue-600 hover:text-blue-800"
          on:click={() => toggleCategoryExpand(cat.name)}
          aria-expanded={expandedCategories.has(cat.name)}
        >
          {expandedCategories.has(cat.name) ? "Hide Rules" : "Show Rules"}
        </button>
      </div>
      <span class="text-xs text-gray-600 italic block mt-1">{cat.description}</span>
        {#if expandedCategories.has(cat.name)}
          <div class="ml-4 mt-2 flex flex-col gap-1">
            {#each ruleList.filter(r => r.category === cat.name) as rule (rule.id)}
              <label class="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  bind:group={selectedRuleIds}
                  value={rule.id}
                />
                {rule.name}
              </label>
            {:else}
              <span class="text-xs text-gray-400 italic">No rules in this category</span>
            {/each}
          </div>
        {/if}
    </div>
  {/each}

  <button
    class="mt-4 p-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
    on:click={runMultipleRules}
  >
    Run Selected Rules
  </button>
</div>


      </div>
      </div>

      <div class="file-upload" style="display: {showDiff ? 'none' : 'flex'}">
        <select on:change={(e) => loadFileContent('readme', e)}>
          <option value="">Select README</option>
          {#each readmeFiles as file}
            <option value={file}>{file}</option>
          {/each}
        </select>
        <div class="editor-container" bind:this={markdownEditorContainer}></div>
      </div>

      <div class="diff-editor-container" class:show={showDiff} bind:this={diffEditorContainer}></div>
    </div>
  </div>

  <div class="resizer" on:mousedown={startResize}></div>

  <div
    class="bottom-pane"
    use:setDefaultHeight={showOutput}
    class:hidden={!showOutput}
    bind:this={outputEditorContainer}
  />

</div>



  {#if highlightedMarkdown}
    <div class="lint-preview" bind:this={markdownPreviewDiv}>
      {@html highlightedMarkdown}
    </div>
  {/if}

</main>