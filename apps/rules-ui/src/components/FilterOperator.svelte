<script>
  import { createEventDispatcher, onDestroy } from 'svelte';
  export let data;
  const dispatch = createEventDispatcher();
  $: data.scopes ||= [];

  const targets = ['emoji', 'newline', 'image', 'internallink', 'externallink'];
  const scopes = ['line', 'paragraph', 'document', 'endoffile'];

  let showDropdown = false;

  const toggleScope = (scope) => {
    const idx = data.scopes.indexOf(scope);
    if (idx === -1) {
      data.scopes = [...data.scopes, scope];
    } else {
      data.scopes = data.scopes.filter(s => s !== scope);
    }
    dispatch('input');
  };

  const handleClickOutside = (e) => {
    if (!e.target.closest('.dropdown-container')) showDropdown = false;
  };

  window.addEventListener('click', handleClickOutside);
  onDestroy(() => {
    window.removeEventListener('click', handleClickOutside);
  });
</script>

<div class="space-y-4">
  <!-- Target Selector -->
  <div>
    <label for="target" class="text-sm font-medium">Target</label>
    <select id="target" bind:value={data.target} on:change={() => dispatch('input')}
            class="w-full border px-3 py-1 rounded text-sm">
      {#each targets as t}
        <option value={t}>{t}</option>
      {/each}
    </select>
  </div>

  <!-- Scopes Dropdown -->
  <div class="relative dropdown-container">
    <label for="scope-toggle" class="text-sm font-medium block mb-1">Scopes</label>

    <button
      class="w-full border rounded px-3 py-1 text-sm cursor-pointer bg-white text-left"
      aria-haspopup="listbox"
      aria-expanded={showDropdown}
      aria-labelledby="scope-label"
      on:click={() => showDropdown = !showDropdown}
      type="button"
    >
      {#if data.scopes.length > 0}
        {data.scopes.join(', ')}
      {:else}
        <span class="text-gray-400">Select scopes...</span>
      {/if}
    </button>

    {#if showDropdown}
      <div class="absolute z-10 mt-1 w-full bg-white border rounded shadow text-sm">
        {#each scopes as s}
          <div class="px-3 py-1 hover:bg-gray-100 flex items-center gap-2">
            <input
              id={`scope-${s}`}
              type="checkbox"
              checked={data.scopes.includes(s)}
              on:change={() => toggleScope(s)}
            />
            <label for={`scope-${s}`} class="text-sm">{s}</label>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
