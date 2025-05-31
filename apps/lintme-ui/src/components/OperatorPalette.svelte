<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  let search = '';

  const availableOperators = [
    { name: 'filter',              label: 'filter' },
    { name: 'count',               label: 'count' },
    { name: 'threshold',           label: 'threshold' },
    { name: 'fixUsingLintMeCode',  label: 'fixUsingLintMeCode' },
    { name: 'fixUsingLLM',         label: 'fixUsingLLM' },
    { name: 'isPresent',           label: 'isPresent' },
    { name: 'regexMatch',          label: 'regexMatch' },
    { name: 'sage',                label: 'sage' },
    { name: 'compare',             label: 'compare' }
  ];

  function choose(op) {
    dispatch('select', op);          // <— parent handles the addition
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
    class="w-full px-3 py-2 rounded border border-gray-300 text-sm
           focus:outline-none focus:ring-2 focus:ring-indigo-500"
  />

  {#each filtered as op}
    <button class="op-btn" on:click={() => choose(op.name)}>
      ➕ {op.label}
    </button>
  {/each}

  <button
    class="w-full mt-2 text-xs text-center text-gray-500 hover:text-gray-700"
    on:click={() => dispatch('close')}
  >
    Close
  </button>
</div>

<style>
/* search box */
#searchOperators{
  width:100%;
  padding:.5rem .75rem;
  font-size:.875rem;
  border:1px solid #d1d5db;
  border-radius:6px;
}
#searchOperators:focus{
  outline:none;
  border-color:#6366f1;
  box-shadow:0 0 0 2px rgba(99,102,241,.35);
}

/* operator buttons */
.op-btn{
  width:100%;
  display:flex;align-items:center;
  gap:.5rem;
  padding:.5rem .75rem;
  background:white;
  border:1px solid #e5e7eb;
  border-radius:6px;
  font-size:.875rem;font-weight:500;
  color:#374151;              /* slate‑700 */
  transition:background .15s;
}
.op-btn:hover{background:#f3f4f6;}  /* slate‑100 */
</style>
