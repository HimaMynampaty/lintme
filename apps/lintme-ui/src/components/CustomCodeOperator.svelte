<script>
  import { onMount, onDestroy } from 'svelte';
  import * as monaco from 'monaco-editor';
  import { createEventDispatcher, tick } from 'svelte';
  import * as acorn from 'acorn';

  export let data;
  const dispatch = createEventDispatcher();

  let editorContainer;
  let editor;
  let validationMessage = '';

  function validateCode(code) {
    try {
      const ast = acorn.parse(code, { ecmaVersion: 2022, sourceType: 'module' });
      const found = ast.body.some(node =>
        node.type === 'ExportNamedDeclaration' &&
        node.declaration &&
        node.declaration.type === 'FunctionDeclaration' &&
        node.declaration.id.name === 'run' &&
        node.declaration.params.length >= 1
      );
      validationMessage = found
        ? ''
        : '❌ Missing required export: `export function run(ctx) { ... }`';
    } catch (e) {
      validationMessage = '❌ Syntax error: ' + e.message;
    }
  }

  function notifyChange() {
    if (editor) {
      const code = editor.getValue();
      data.code = code;
      validateCode(code);
      dispatch('input');
    }
  }

  onMount(async () => {
    await tick();
    editor = monaco.editor.create(editorContainer, {
      value: data.code,
      language: 'javascript',
      theme: 'vs-light',
      fontSize: 13,
      automaticLayout: true,
      minimap: { enabled: false },
      wordWrap: 'on',
      scrollBeyondLastLine: false,
    });
    
    editor.onDidChangeModelContent(notifyChange);
    validateCode(data.code); 
  });

  onDestroy(() => {
    if (editor) {
      editor.dispose();
    }
  });
</script>

<div class="space-y-2">
    <label for="code-editor" class="block text-sm font-medium text-gray-700">
    Custom JavaScript Code
    </label>
    <div
    id="code-editor"
    bind:this={editorContainer}
    class="border rounded overflow-hidden"
    style="height: 300px;"
    ></div>


  {#if validationMessage}
    <p class="text-sm text-red-600">{validationMessage}</p>
  {/if}

  <p class="text-xs text-gray-500">
    Define a <code>run(ctx)</code> function. Use <code>ctx.markdown</code>, <code>ctx.diagnostics</code>, and return either <code>ctx</code> or an object.
  </p>
</div>
