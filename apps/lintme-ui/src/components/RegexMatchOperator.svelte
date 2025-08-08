<script lang="ts">
  import { createEventDispatcher, onDestroy } from 'svelte';
  import { pipeline } from '../stores/pipeline.js';

  export let data: any = {};
  export let storeIndex = 0;        

  const dispatch = createEventDispatcher();

  $: data.patterns ??= [];
  $: data.mode ??= 'match';          
  $: data.scope ??= 'document';       
  $: data.scopes = [data.scope];      

  const isFirstStep = storeIndex <= 1;

  const changed = () => dispatch('input');

  const presets = [
    { label: 'dd-mm-yyyy',   value: '^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-[0-9]{4}$' },
    { label: 'mm-dd-yyyy',   value: '^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])-[0-9]{4}$' },
    { label: 'https schema in urls', value: 'https:\\/\\/[^\\s)]+' },
    { label: 'markdown urls', value: '\\[[^\\]]+\\]\\([^\\)]+\\)' },
    { label: 'dd/mm/yyyy',   value: '^(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[0-2])/[0-9]{4}$' }
  ];

  const securityPatterns = [
    'AKIA[0-9A-Z]{16}',
    'sk_live_[0-9a-zA-Z]{24,64}',
    '(gh[pors]_[0-9a-zA-Z]{20,})|(github_pat_[0-9a-zA-Z_]{20,})',
    '-----BEGIN (RSA|DSA|EC|OPENSSH) PRIVATE KEY-----',
    'eyJ[A-Za-z0-9-_]+\\.[A-Za-z0-9-_]+\\.[A-Za-z0-9-_]+'
  ];

  let showPresetDropdown = false;
  let customInput = '';

  function togglePreset(val: string) {
    data.patterns = data.patterns.includes(val)
      ? data.patterns.filter((v: string) => v !== val)
      : [...data.patterns, val];
    changed();
  }

  function toggleSecurityElements() {
    const hasAll = securityPatterns.every(p => data.patterns.includes(p));
    data.patterns = hasAll
      ? data.patterns.filter(p => !securityPatterns.includes(p))
      : Array.from(new Set([...data.patterns, ...securityPatterns]));
    changed();
  }

  function updateCustom() {
    const custom = customInput.split('\n').map(s => s.trim()).filter(Boolean);
    const selectedPresets  = presets.map(p => p.value).filter(v => data.patterns.includes(v));
    const selectedSecurity = securityPatterns.filter(p => data.patterns.includes(p));
    data.patterns = [...selectedPresets, ...selectedSecurity, ...custom];
    changed();
  }

  function handleOutside(e: MouseEvent) {
    if (!(e.target as HTMLElement).closest('.preset-box')) showPresetDropdown = false;
  }
  window.addEventListener('click', handleOutside);
  onDestroy(() => window.removeEventListener('click', handleOutside));
</script>

<div class="space-y-4">
  <div>
    <label for="matchMode" class="text-sm font-medium block mb-1">Match mode</label>
    <select
      id="matchMode"
      class="w-full border rounded px-3 py-1 text-sm"
      bind:value={data.mode}
      on:change={changed}
    >
      <option value="match">Flag lines that DO match</option>
      <option value="unmatch">Flag lines that do NOT match</option>
    </select>
  </div>

  {#if !isFirstStep}
    <div>
      <label for="scope-select" class="text-sm font-medium block mb-1">Scope</label>
      <select
        id="scope-select"
        class="w-full border rounded px-3 py-1 text-sm"
        bind:value={data.scope}
        on:change={changed}
      >
        <option value="previousstepoutput">Previous step output</option>
        <option value="document">Entire document</option>
      </select>
    </div>
  {:else}
    <p class="text-xs text-gray-500">
      Scope is fixed to <code>document</code> for the first step.
    </p>
  {/if}

  <div class="relative preset-box">
    <label for="preset-toggle" class="text-sm font-medium block mb-1">Predefined patterns</label>

    <button
      id="preset-toggle"
      type="button"
      class="w-full border rounded px-3 py-1 text-sm bg-white text-left"
      on:click={() => (showPresetDropdown = !showPresetDropdown)}
    >
      {#if data.patterns.length}
        {data.patterns.length} selected
      {:else}
        <span class="text-gray-400">Select patterns…</span>
      {/if}
    </button>

    {#if showPresetDropdown}
      <div
        class="absolute z-10 mt-1 w-full bg-white border rounded shadow text-sm max-h-64 overflow-auto"
      >
        <div class="px-3 py-1 hover:bg-gray-100 flex items-center gap-2">
          <input
            type="checkbox"
            id="security-elements"
            checked={securityPatterns.every(p => data.patterns.includes(p))}
            on:change={toggleSecurityElements}
          />
          <label for="security-elements">Security elements</label>
        </div>

        {#each presets as p}
          <div class="px-3 py-1 hover:bg-gray-100 flex items-center gap-2">
            <input
              type="checkbox"
              id={p.label}
              checked={data.patterns.includes(p.value)}
              on:change={() => togglePreset(p.value)}
            />
            <label for={p.label}>{p.label}</label>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- custom regex textarea -->
  <div>
    <label for="custom" class="text-sm font-medium block mb-1">Custom regex (one per line)</label>
    <textarea
      id="custom"
      class="w-full border rounded p-2 text-sm h-24"
      bind:value={customInput}
      on:blur={updateCustom}
      placeholder="^hello$"
    ></textarea>
  </div>
</div>
