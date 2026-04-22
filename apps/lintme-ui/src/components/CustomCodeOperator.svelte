<script>
  import { onMount, onDestroy } from "svelte";
  import * as monaco from "monaco-editor";
  import { createEventDispatcher, tick } from "svelte";
  import * as acorn from "acorn";

  export let data;
  const dispatch = createEventDispatcher();

  let editorContainer;
  let editor;
  let validationMessage = "";
  let isFullscreen = false;

  function validateCode(code) {
    try {
      const ast = acorn.parse(code, {
        ecmaVersion: 2022,
        sourceType: "module",
      });
      
      const found = ast.body.some(
        (node) =>
          node.type === "ExportNamedDeclaration" &&
          node.declaration &&
          node.declaration.type === "FunctionDeclaration" &&
          node.declaration.id.name === "run" &&
          node.declaration.params.length >= 1,
      );
      validationMessage = found
        ? ""
        : "Missing required export: `export function run(ctx) { ... }`";
    } catch (e) {
      validationMessage = "Syntax error: " + e.message;
    }
  }

  function notifyChange() {
    if (editor) {
      const code = editor.getValue();
      data.code = code;
      validateCode(code);
      dispatch("input");
    }
  }

  function toggleFullscreen() {
    isFullscreen = !isFullscreen;
    setTimeout(() => editor?.layout(), 0); 
  }

  function exitFullscreen() {
    isFullscreen = false;
    editor?.layout();
  }

  function handleKeydown(event) {
    if (event.key === "Escape" && isFullscreen) {
      exitFullscreen();
    }
  }

  onMount(async () => {
    await tick();
    editor = monaco.editor.create(editorContainer, {
      value: data.code,
      language: "javascript",
      theme: "vs-light",
      fontSize: 13,
      automaticLayout: true,
      minimap: { enabled: false },
      wordWrap: "on",
      scrollBeyondLastLine: false,
    });

    editor.onDidChangeModelContent(notifyChange);
    validateCode(data.code);
    window.addEventListener("keydown", handleKeydown);
  });

  onDestroy(() => {
    editor?.dispose();
    window.removeEventListener("keydown", handleKeydown);
  });
</script>

<div class="space-y-2">
  <div class="flex items-center justify-between">
    <label for="code-editor" class="text-sm font-medium text-gray-700">
      Custom JavaScript Code
    </label>

    {#if !isFullscreen}
      <button
        on:click={toggleFullscreen}
        class="text-sm bg-gray-100 text-gray-800 border border-gray-300 rounded px-3 py-1 hover:bg-gray-200"
      >
        Fullscreen
      </button>
    {/if}
  </div>

  <div
    id="code-editor"
    bind:this={editorContainer}
    class={`relative border rounded overflow-hidden ${isFullscreen ? "fullscreen-editor" : ""}`}
    style="height: {isFullscreen ? '100%' : '300px'};"
  >
    {#if isFullscreen}
      <button
        on:click={exitFullscreen}
        class="absolute top-2 right-2 z-10 bg-gray-100 text-gray-800 border border-gray-300 px-3 py-1 text-sm rounded shadow hover:bg-gray-200"
      >
        Exit Fullscreen
      </button>
    {/if}
  </div>

  {#if validationMessage}
    <p class="text-sm text-red-600">{validationMessage}</p>
  {/if}

  <div class="flex items-start justify-between mt-2 flex-wrap gap-2">
    <p class="text-xs text-gray-500">
      Define a <code>run(ctx)</code> function. Use <code>ctx.markdown</code>,
      <code>ctx.diagnostics</code>, and return either <code>ctx</code> or an
      object.
      <br />
      See the
      <a
        href="https://github.com/lintme/lintme/blob/main/packages/operators/customCode/README.md"
        target="_blank"
        class="text-blue-600 hover:underline"
      >
        custom code documentation
      </a>.
    </p>
  </div>
</div>

<style>
  .fullscreen-editor {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 50;
    background: white;
    border: none;
  }
</style>
