<script>
  import { onMount } from 'svelte';
  import * as monaco from 'monaco-editor';
  import { runPipeline } from '@himamynampaty/pipeline-runner';

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

  async function runLinter() {
    if (!rulesYaml || !markdownText) {
      alert("Please enter both rules.yaml and README content!");
      return;
    }

    originalText = markdownEditor.getValue();
    const ctx = await runPipeline(rulesYaml, originalText);
    console.log("AST result:", ctx);

    diagnostics   = ctx.diagnostics || [];
    fixedMarkdown = ctx.fixedMarkdown || originalText;

    lintResults = diagnostics.length
      ? diagnostics
          .map(d => `${d.severity.toUpperCase()} [${d.line}]: ${d.message}`)
          .join('\n')
      : 'No issues found.';

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
