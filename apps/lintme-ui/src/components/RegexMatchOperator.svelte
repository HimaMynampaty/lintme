<script>
  import { createEventDispatcher, onDestroy } from 'svelte';

  export let data;
  const dispatch = createEventDispatcher();

  $: data.patterns ||= [];
  $: data.mode ||= 'unmatch'; 

  const presets = [
    { label: 'dd-mm-yyyy', value: '^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-[0-9]{4}$' },
    { label: 'mm-dd-yyyy', value: '^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])-[0-9]{4}$' },
    { label: 'https schema in urls', value: 'https:\/\/[^\\s)]+' },
    { label: 'markdown urls', value: '\\[[^\\]]+\\]\\([^\\)]+\\)' },
    { label: 'dd/mm/yyyy', value: '^(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[0-2])/[0-9]{4}$' }
  ];

  let showPresetDropdown = false;
  let customInput = '';

  function togglePreset(val) {
    if (data.patterns.includes(val)) {
      data.patterns = data.patterns.filter(v => v !== val);
    } else {
      data.patterns = [...data.patterns, val];
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
      .filter(v => data.patterns.includes(v));

    data.patterns = [...selectedPresets, ...custom];
    dispatch('input');
  }

  function handleOutside(e) {
    if (!e.target.closest('.preset-box')) {
      showPresetDropdown = false;
    }
  }

  window.addEventListener('click', handleOutside);
  onDestroy(() => window.removeEventListener('click', handleOutside));
</script>

<div class="space-y-4">
  <div>
    <label class="text-sm font-medium block mb-1" for="matchMode">Match Mode</label>
    <select
      id="matchMode"
      class="w-full border rounded px-3 py-1 text-sm"
      bind:value={data.mode}
      on:change={() => dispatch('input')}
    >
      <option value="unmatch">Flag lines that do NOT match</option>
      <option value="match">Flag lines that DO match</option>
    </select>
  </div>

  <div class="relative preset-box">
    <label class="text-sm font-medium block mb-1" for="preset-toggle">Predefined Patterns</label>

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
      <div class="absolute z-10 mt-1 w-full bg-white border rounded shadow text-sm">
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

  <div>
    <label class="text-sm font-medium" for="custom">Custom regex (one per line)</label>
    <textarea
      id="custom"
      class="w-full border rounded p-2 text-sm h-24"
      bind:value={customInput}
      on:blur={updateCustom}
      placeholder="^hello$"
    />
  </div>
</div>
