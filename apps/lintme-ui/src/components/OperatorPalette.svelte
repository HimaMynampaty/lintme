<script>
  import { createEventDispatcher } from 'svelte';
  import { operatorDescriptions } from '../lib/operatorMetadata.js';
  const dispatch = createEventDispatcher();

  let search = '';

  const availableOperators = [
    { name: 'compare', label: 'compare' },
    { name: 'count', label: 'count' },
    { name: 'extract', label: 'extract' },
    { name: 'fixUsingLLM', label: 'fixUsingLLM' },
    { name: 'isPresent', label: 'isPresent' },
    { name: 'length', label: 'length' },
    { name: 'regexMatch', label: 'regexMatch' },
    { name: 'sage', label: 'sage' },
    { name: 'search', label: 'search' },       
    { name: 'threshold', label: 'threshold' },
    { name: 'detectHateSpeech', label: 'detectHateSpeech' },
    { name: 'fetchFromGithub', label: 'fetchFromGithub' },
  ];

  function choose(op) {
    dispatch('select', op);
  }

  $: filtered = availableOperators
    .filter(op => op.label.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.label.localeCompare(b.label));
</script>

<div class="w-64 p-3 space-y-2 bg-white border border-gray-300 rounded-md shadow-lg">
  <label for="searchOperators" class="sr-only">Search Operators</label>
  <input
    id="searchOperators"
    bind:value={search}
    placeholder="Search operators…"
    class="w-full px-3 py-2 rounded border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
  />

  {#if !search}
    <p class="text-xs text-gray-500">Scroll to view all operators</p>
  {/if}

  <div class="max-h-40 overflow-y-auto space-y-2">
    {#each filtered as op}
      <button
        class="op-btn"
        on:click={() => choose(op.name)}
        title={operatorDescriptions[op.name] ?? ''}
      >
        ➕ {op.label}
      </button>
    {/each}

  </div>

  <button
    class="w-full mt-2 text-xs text-center text-gray-500 hover:text-gray-700"
    on:click={() => dispatch('close')}
  >
    Close
  </button>
</div>

<style>
#searchOperators {
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
}
#searchOperators:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.35);
}

.op-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  transition: background 0.15s;
}
.op-btn:hover {
  background: #f3f4f6;
}
</style>
