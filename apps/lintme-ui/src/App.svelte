<script>
  import { onMount } from 'svelte';
  import * as monaco from 'monaco-editor';
  import { saveRule, allRules, loadRule, deleteRule } from './lib/rules-db';
  import OperatorTriggerPanel from './components/OperatorTriggerPanel.svelte';
  const params = new URLSearchParams(window.location.search);
  let rulesYaml = decodeURIComponent(params.get("rule") || "");

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
      fixedOverflowWidgets: true
    });
    rulesEditor.onDidChangeModelContent(() => {
      rulesYaml = rulesEditor.getValue();
    });

    markdownEditor = monaco.editor.create(markdownEditorContainer, {
      value: markdownText,
      language: 'markdown',
      automaticLayout: true,
      minimap: { enabled: false },
      fixedOverflowWidgets: true
    });
    markdownEditor.onDidChangeModelContent(() => {
      markdownText = markdownEditor.getValue();
    });
    diffEditor = monaco.editor.createDiffEditor(diffEditorContainer, {
      readOnly: true,
      automaticLayout: true,
      minimap: { enabled: false },
      fixedOverflowWidgets: true
    });

    outputEditor = monaco.editor.create(outputEditorContainer, {
    value: lintResults || 'No lint results to display yet.',
    language: 'plaintext',
    readOnly: true,
    automaticLayout: true,
    minimap: { enabled: false },
    fontSize: rulesEditor?.getOption(monaco.editor.EditorOption.fontSize) || 14,
    wordWrap: 'on',
    scrollBeyondLastLine: false
  });


    fetchFiles("rules");
    fetchFiles("readme");
    ruleList = await allRules();
  });

  function updateDiffModels() {
    const originalModel = monaco.editor.createModel(originalText, "markdown");
    const modifiedModel = monaco.editor.createModel(fixedMarkdown, "markdown");
    diffEditor.setModel({ original: originalModel, modified: modifiedModel });
  }

  async function saveCurrentRule() {
    const name = prompt('Rule name?', 'my-rule');
    if (!name) return;
    await saveRule(name, rulesEditor.getValue());
    ruleList = await allRules();   
  }
  async function loadRuleFromDB(id) {
    const rec = await loadRule(id);
    if (rec) {
      rulesYaml = rec.yaml;
      if (rulesEditor) rulesEditor.setValue(rec.yaml);
    }
  }

  
  function togglePalette() {
    showPalette = !showPalette;
  }

  async function handleCombinedRuleSelection(event) {
    const selectedValue = event.target.value;
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



  async function runLinter() {
    if (!rulesYaml || !markdownText) {
      alert("Please enter both rules.yaml and README content!");
      return;
    }

    originalText = markdownEditor.getValue();

    const response = await fetch('/.netlify/functions/runPipeline', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        yamlText: rulesEditor.getValue(),
        markdown: originalText,
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



    const judgmentOperators = new Set(['threshold', 'isPresent', 'compare', 'fixUsingLLM']);

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

      lintResults = isJudging
        ? 'Lint successful! No issues found.'
        : 'This rule does not produce actual lint results. It may be missing a judgment step like "threshold".';

      if (!isJudging) {
        if (ctx.pipelineResults && ctx.pipelineResults.length) {

          ctx.pipelineResults.forEach(({ name, data }, idx) => {
            const payload = data.data ?? data;             
            const scopes  = data.scopes ?? Object.keys(payload);
            lintResults += `\nOutput from ${name.toUpperCase()} operator (step ${idx + 1}):\n`;
            lintResults  += formatOperatorOutput(name, payload, scopes);
          });
        }

      }
    }


    const model = markdownEditor.getModel();
    monaco.editor.setModelMarkers(
      model,
      'my-linter',
      diagnostics.map(d => ({
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
    if (showDiff) {
      updateDiffModels();
    }
  }

  function applyFixesToEditor() {
    markdownEditor.setValue(fixedMarkdown);
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
  overflow: hidden;
}

.bottom-pane {
  flex: 0 0 260px; /* default height, same as height: 260px but resizable */
  min-height: 120px;
  max-height: 85vh;
  background: #1e1e1e;
  border-top: 1px solid #333;
  display: flex;
  flex-direction: column;
  position: relative;
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
          await deleteRule(selectedCombinedRule);
          ruleList = await allRules();
          selectedCombinedRule = '';
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
      <div class="file-upload">
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
        <div class="bg-gray-50 p-4 rounded border relative">
          <OperatorTriggerPanel {rulesEditor} />
        </div>
        <div class="editor-container" bind:this={rulesEditorContainer}></div>
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

  <!-- resizable drag bar -->
  <div class="resizer" on:mousedown={startResize}></div>

  <!-- output view -->
<div class="bottom-pane" bind:this={outputEditorContainer}></div>
</div>



  {#if highlightedMarkdown}
    <div class="lint-preview" bind:this={markdownPreviewDiv}>
      {@html highlightedMarkdown}
    </div>
  {/if}

</main>