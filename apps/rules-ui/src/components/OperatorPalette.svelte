<script>
  import { pipeline } from '../stores/pipeline.js';
  import { v4 as uuid } from 'uuid'; // UUID for uniqueness

  let search = '';

  const availableOperators = [
    { name: 'filter',             label: 'filter' },           // ✅ NEW
    { name: 'count',              label: 'count' },
    { name: 'threshold',          label: 'threshold' },
    { name: 'fixUsingLintMeCode', label: 'fixUsingLintMeCode' },
    { name: 'fixUsingLLM',        label: 'fixUsingLLM' }
  ];

  function addOperator(opName) {
    pipeline.update(p => [...p, { operator: opName }]);
  }

  $: filtered = availableOperators.filter(op =>
    op.label.toLowerCase().includes(search.toLowerCase())
  );
</script>

<div class="space-y-2">
  <input
    bind:value={search}
    placeholder="Search operators…"
    class="w-full px-3 py-2 rounded border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
  />

  {#each filtered as op}
    <button
      on:click={() => addOperator(op.name)}
      class="w-full text-left px-3 py-2 bg-white rounded shadow hover:bg-slate-100 text-sm font-medium text-gray-700 transition"
    >
      ➕ {op.label}
    </button>
  {/each}
</div>
