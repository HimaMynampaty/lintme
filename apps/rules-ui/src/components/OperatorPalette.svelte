<script>
  import { pipeline } from '../stores/pipeline.js';

  let search = '';

  const availableOperators = [
    { name: 'filter',              label: 'filter' },
    { name: 'count',               label: 'count' },
    { name: 'threshold',           label: 'threshold' },
    { name: 'fixUsingLintMeCode',  label: 'fixUsingLintMeCode' },
    { name: 'fixUsingLLM',         label: 'fixUsingLLM' },
    { name: 'isPresent',           label: 'isPresent' } 
  ];
  function addOperator(opName) {
    const newId = crypto.randomUUID(); // generates a unique ID

    pipeline.update(p => {
       if (opName === 'isPresent') {
         return [...p, {
           id: newId,
           operator: 'isPresent',
           target: 'alt'   // user can still change field; no scope stored
         }];
      }

      return [...p, {
        id: newId,
        operator: opName
      }];
    });
  }


  $: filtered = availableOperators.filter(op =>
    op.label.toLowerCase().includes(search.toLowerCase())
  );
</script>

<div class="space-y-2">
  <label for="searchOperators" class="sr-only">Search Operators</label>
  <input
    id="searchOperators"
    bind:value={search}
    placeholder="Search operators…"
    class="w-full px-3 py-2 rounded border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
  />

  {#each filtered as op}
    <button
      on:click={() => addOperator(op.name)}
      class="w-full text-left px-3 py-2 bg-white rounded shadow hover:bg-slate-100 text-sm font-medium text-gray-700 transition"
      aria-label={`Add ${op.label} operator`}
    >
      ➕ {op.label}
    </button>
  {/each}
</div>
