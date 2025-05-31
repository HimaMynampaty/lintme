<script>
  import { createEventDispatcher } from 'svelte';
  import { pipeline } from '../stores/pipeline.js';

  export let data;       
  export let storeIndex;

  const dispatch = createEventDispatcher();
  $: steps = $pipeline.slice(1, storeIndex).map((s, i) => ({
    label: `${i + 1} · ${s.operator}`,
    value: i + 1
  }));

  const update = () => dispatch('input');
</script>

<div class="space-y-2">
  <label for="baseline-select" class="text-sm font-medium block">Baseline step</label>
  <select id="baseline-select" bind:value={data.baseline} on:change={update}
          class="w-full border px-2 py-1 rounded text-sm">
    <option value="">– pick –</option>
    {#each steps as s}<option value={s.value}>{s.label}</option>{/each}
  </select>

  <label for="against-select" class="text-sm font-medium block mt-2">Compare against</label>
  <select  id="against-select" bind:value={data.against} on:change={update}
          class="w-full border px-2 py-1 rounded text-sm">
    <option value="">– pick –</option>
    {#each steps as s}<option value={s.value}>{s.label}</option>{/each}
  </select>

  {#if !(data.baseline && data.against)}
    <p class="text-xs text-gray-500">Select two earlier steps to compare.</p>
  {/if}
</div>
