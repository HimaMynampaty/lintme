<script>
  import { createEventDispatcher, onDestroy } from 'svelte';
  import { pipeline } from '../stores/pipeline.js';

  export let data;
  export let storeIndex;

  const dispatch = createEventDispatcher();
  $: data.paths ||= [];

  const presets = [
    { label: 'Root README (README.md)', value: 'README.md' },
    { label: 'Docs folder (docs/README.md)', value: 'docs/README.md' },
    { label: 'Packages folder (packages/*/README.md)', value: 'packages/.*/README.md' },
    { label: 'Src folder (src/README.md)', value: 'src/README.md' },
    { label: 'Monorepo app (apps/*/README.md)', value: 'apps/.*/README.md' },
    { label: 'Nested any depth', value: '.*/README.md' }
  ];

  let showPresetDropdown = false;
  let customInput = '';
  let hasUpstreamPaths = false;

  function togglePreset(val) {
    if (data.paths.includes(val)) {
      data.paths = data.paths.filter(v => v !== val);
    } else {
      data.paths = [...data.paths, val];
    }
    dispatch('input');
  }

  function updateCustom() {
    const custom = customInput
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const selectedPresets = presets
      .map(p => p.value)
      .filter(v => data.paths.includes(v));

    data.paths = [...selectedPresets, ...custom];
    dispatch('input');
  }

  function handleOutside(e) {
    if (!e.target.closest('.preset-box')) {
      showPresetDropdown = false;
    }
  }

  window.addEventListener('click', handleOutside);
  onDestroy(() => window.removeEventListener('click', handleOutside));

  function maybeHydrate(prev) {
    if (prev?.fetchResult?.readmes?.length && !data.paths.length) {
      data.paths = prev.fetchResult.readmes.map(r => r.path);
      dispatch('input');
    }
  }

  $: {
    hasUpstreamPaths = false;
    const steps = $pipeline;

    for (let i = storeIndex - 1; i >= 0; i--) {
      const prev = steps[i];
      if (!prev) continue;

    if (
      prev.operator === 'fetchFromGithub' &&
      prev.fetchType === 'path'
    ) {
        hasUpstreamPaths = true;
        maybeHydrate(prev);
        break;
      }
    }
  }
</script>

<div class="space-y-4">
  {#if hasUpstreamPaths}
    <p class="text-sm text-gray-600 my-1">
       Using README paths from previous step (<code>fetchFromGithub</code>).
    </p>
  {:else}
    <p class="text-sm text-red-500 my-1">
      ⚠ This operator needs to follow <code>fetchFromGithub</code> with <code>fetchType: "path"</code>.
    </p>
  {/if}

  <div class="relative preset-box">
    <label class="text-sm font-medium block mb-1" for="preset-toggle">Common README Paths</label>

    <button
      id="preset-toggle"
      type="button"
      class="w-full border rounded px-3 py-1 text-sm bg-white text-left"
      on:click={() => (showPresetDropdown = !showPresetDropdown)}
    >
      {#if data.paths.length}
        {data.paths.length} selected
      {:else}
        <span class="text-gray-400">Select README paths…</span>
      {/if}
    </button>

    {#if showPresetDropdown}
      <div class="absolute z-10 mt-1 w-full bg-white border rounded shadow text-sm">
        {#each presets as p}
          <div class="px-3 py-1 hover:bg-gray-100 flex items-center gap-2">
            <input
              type="checkbox"
              id={p.label}
              checked={data.paths.includes(p.value)}
              on:change={() => togglePreset(p.value)}
            />
            <label for={p.label}>{p.label}</label>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <div>
    <label class="text-sm font-medium" for="custom">Custom README paths (one per line)</label>
    <textarea
      id="custom"
      class="w-full border rounded p-2 text-sm h-24"
      bind:value={customInput}
      on:blur={updateCustom}
      placeholder="custom/folder/README.md"
    />
  </div>
</div>
