<script>
  import { onMount } from 'svelte';
  import * as monaco from 'monaco-editor';
  const params = new URLSearchParams(window.location.search);
  let rulesYaml = decodeURIComponent(params.get("rule") || "");

  let markdownText = "";
  let originalText = "";

  let lintResults = "";
  let fixedMarkdown = "";
  let diagnostics      = [];  
  let highlightedMarkdown = ""; 

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

  onMount(() => {
    rulesEditor = monaco.editor.create(rulesEditorContainer, {
      value: rulesYaml,
      language: 'yaml',
      automaticLayout: true,
      minimap: { enabled: false }
    });
    rulesEditor.onDidChangeModelContent(() => {
      rulesYaml = rulesEditor.getValue();
    });

    markdownEditor = monaco.editor.create(markdownEditorContainer, {
      value: markdownText,
      language: 'markdown',
      automaticLayout: true,
      minimap: { enabled: false }
    });
    markdownEditor.onDidChangeModelContent(() => {
      markdownText = markdownEditor.getValue();
    });
    diffEditor = monaco.editor.createDiffEditor(diffEditorContainer, {
      readOnly: true,
      automaticLayout: true,
      minimap: { enabled: false }
    });

    fetchFiles("rules");
    fetchFiles("readme");
  });

  function updateDiffModels() {
    const originalModel = monaco.editor.createModel(originalText, "markdown");
    const modifiedModel = monaco.editor.createModel(fixedMarkdown, "markdown");
    diffEditor.setModel({ original: originalModel, modified: modifiedModel });
  }


  function formatOperatorOutput(key, data, scopes = Object.keys(data)) {
    let result = `\n${key.toUpperCase()}:\n`;

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
          result += `    - Line ${item.line}: ${item.matches.join(', ')}\n`;
        } else if (item.line && item.count !== undefined) {
          result += `    - Line ${item.line}: ${item.count} match(es)\n`;
        } else if (item.type && item.line) {
          result += `    - Line ${item.line}: ${item.type}\n`;
        } else {
          result += `    - ${JSON.stringify(item)}\n`;
        }
      }

      } else if (typeof value === 'object') {
        const entries = Object.entries(value);
        if (entries.length === 0) {
          result += `  ${scope}: (no matches)\n`;
          continue;
        }

        result += `  ${scope}:\n`;
        for (const [line, matches] of entries) {
          result += `    - Line ${line}: ${Array.isArray(matches) ? matches.join(', ') : matches}\n`;
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

    if (ctx.error) {
      alert(`Pipeline error: ${ctx.error}`);
      return;
    }
    diagnostics   = ctx.diagnostics || [];
    fixedMarkdown = ctx.fixedMarkdown || originalText;

    const judgmentOperators = new Set(['threshold', 'isPresent']);

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


      const isJudging = ['threshold', 'isPresent'].includes(ctx.lastOperator);

      lintResults = isJudging
        ? 'Lint successful! No issues found.'
        : 'This rule does not produce actual lint results. It may be missing a judgment step like "threshold".';

      if (!isJudging) {
        const extraOutputs = Object.entries(ctx)
          .filter(([key, val]) =>
            typeof val === 'object' &&
            val !== null &&
            val.data &&
            Object.keys(val.data).length > 0
          );

        if (extraOutputs.length) {
          lintResults += '\n\nInternal analysis:\n';
          for (const [key, obj] of extraOutputs) {
            const scopes = obj.scopes ?? Object.keys(obj.data); 
            lintResults += formatOperatorOutput(key, obj.data, scopes);
          }

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
  main {
    display: flex;
    flex-direction: column;
    height: 100vh;
    font-family: Arial, sans-serif;
  }

  .header-container {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 10px 20px;
    background: white;
    border-bottom: 1px solid #ccc;
    position: fixed;
    width: 100vw;
    z-index: 10;
  }

  h2 {
    font-size: 1.5rem;
    color: #005a9e;
    margin: 0;
  }

  button {
    padding: 10px 16px;
    font-size: 14px;
    background: #005a9e;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
  }
  button:hover {
    background: #004b8a;
  }

  .container {
    display: flex;
    gap: 10px;
    flex: 1;
    padding: 70px 10px 10px 10px;
  }

  .editor-container {
    flex: 1;
    overflow: auto;
  }

  .file-upload {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  select {
    margin-bottom: 10px;
    padding: 10px;
    font-size: 16px;
    border-radius: 8px;
    border: 1px solid #ccc;
    background-color: #f0f4f8;
  }

  .output {
    width: 100%;
    min-height: 200px;
    background: #f0f4f8;
    padding: 10px;
    white-space: pre-wrap;
    overflow: auto;
    border-top: 2px solid #ccc;
  }

  .diff-editor-container {
    flex: 1;
    display: none;
    overflow: auto;
  }
  .diff-editor-container.show {
    display: block;
  }
</style>

<main>
  <div class="header-container">
    <h2>LintMe - Markdown Linter</h2>
    <button on:click={runLinter}>Run Linter</button>
    <button on:click={toggleDiffView}>
      {showDiff ? "Hide Diff View" : "Show Diff View"}
    </button>
    <button on:click={applyFixesToEditor}>
      Apply Fixes to Editor
    </button>
  </div>

  <div class="container">
    <div class="file-upload">
      <select on:change={(e) => loadFileContent('rules', e)}>
        <option value="">Select rules.yaml</option>
        {#each rulesFiles as file}
          <option value={file}>{file}</option>
        {/each}
      </select>
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

    <div
      class="diff-editor-container"
      class:show={showDiff}
      bind:this={diffEditorContainer}
    ></div>
  </div> 
  <div class="output">
    {#if lintResults}
      <pre>{lintResults}</pre>
    {:else}
      <p>No lint results to display yet.</p>
    {/if}
  </div>

  {#if highlightedMarkdown}
    <div class="lint-preview" bind:this={markdownPreviewDiv}>
      {@html highlightedMarkdown}
    </div>
  {/if}
</main>