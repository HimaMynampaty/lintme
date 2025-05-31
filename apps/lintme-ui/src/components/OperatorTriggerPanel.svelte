<script>
  import { onDestroy, tick, onMount } from 'svelte';
  import { pipeline } from '../stores/pipeline.js';
  import { generateYAML } from '../utils/yaml.js';

  import OperatorPalette from './OperatorPalette.svelte';
  import PipelineEditor from '../editor/PipelineEditor.svelte';

  export let rulesEditor;

  let showPalette = false;
  let paletteRef;

  async function togglePalette() {
    showPalette = !showPalette;

    await tick();

    if (showPalette) {
      document.addEventListener('click', handleClickOutside);
    } else {
      document.removeEventListener('click', handleClickOutside);
    }
  }

  function handleClickOutside(event) {
    if (
      paletteRef &&
      !paletteRef.contains(event.target) &&
      !event.target.closest('[data-trigger="palette"]')
    ) {
      showPalette = false;
      document.removeEventListener('click', handleClickOutside);
    }
  }

  function addOperator(opName) {
    const id = crypto.randomUUID();

    pipeline.update(steps => {
      switch (opName) {
        case 'isPresent':
          return [...steps, { id, operator: 'isPresent', target: 'alt' }];
        case 'compare':
          return [...steps, { id, operator: 'compare', baseline: '', against: '' }];
        case 'regexMatch':
          return [...steps, { id, operator: 'regexMatch', pattern: '' }];
        case 'sage':
          return [...steps, { id, operator: 'sage' }];
        default:
          return [...steps, { id, operator: opName }];
      }
    });

    showPalette = false;
    document.removeEventListener('click', handleClickOutside);
  }

  const unsub = pipeline.subscribe(steps => {
    if (rulesEditor) {
      const yaml = generateYAML('my-rule', '', steps);
      rulesEditor.setValue(yaml);
    }
  });

  function handleKeyboardShortcut(e) {
    const isInputFocused =
      ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName) ||
      document.activeElement.isContentEditable;

    if (isInputFocused) return;

    const shortcutPressed =
      (e.ctrlKey && e.key.toLowerCase() === 'k') || e.key === '/';

    if (shortcutPressed) {
      e.preventDefault();
      togglePalette();
    }
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeyboardShortcut);
  });

  onDestroy(() => {
    document.removeEventListener('click', handleClickOutside);
    window.removeEventListener('keydown', handleKeyboardShortcut);
    unsub();
  });
</script>

<div class="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col gap-3">
  <div class="flex gap-2">
    <div class="relative">
      <button
        data-trigger="palette"
        class="h-9 px-4 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-full"
        on:click={togglePalette}
      >
        ➕ Add Operator
      </button>

      {#if showPalette}
        <div
          class="absolute top-12 left-0 z-20 w-64 animate-fade-in"
          bind:this={paletteRef}
        >
          <!-- Arrow -->
          <div class="absolute -top-2 left-4 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-white"></div>

          <OperatorPalette
            on:select={(e) => addOperator(e.detail)}
            on:close={() => (showPalette = false)}
          />
        </div>
      {/if}
    </div>

    <button
      class="h-9 px-4 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-full"
      on:click={() => console.log('Generate with LLM')}
    >
      🧠 Generate Rule (LLM)
    </button>
  </div>

  <div class="flex flex-col gap-3">
    <PipelineEditor />
  </div>
</div>
