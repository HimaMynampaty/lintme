<script>
  import { createEventDispatcher, onMount, tick } from 'svelte';
  import { pipeline } from '../stores/pipeline.js';

  export let data = {};
  export let storeIndex = 0;

  const dispatch = createEventDispatcher();
  const changed  = () => dispatch('input');

  const fields   = ['alt', 'emoji', 'newline'];

  /* does a filter exist above us? — still keep that warning */
  let hasFilter = false;
  $: {
    hasFilter = false;
    for (let i = storeIndex - 1; i >= 0; i--) {
      if ($pipeline[i]?.operator === 'filter') {
        hasFilter = true;
        break;
      }
    }
  }

  /* set defaults once */
  onMount(async () => {
    data.operator ??= 'isPresent';
    data.target   ??= 'alt';
    data.level    ??= 'warning';
    await tick();
    dispatch('input');
  });
</script>

<div class="space-y-4">
  <div>
    <label class="text-sm font-medium text-gray-700" for="present-field">Field</label>
    <select id="present-field"
            class="w-full border rounded px-3 py-2 text-sm"
            bind:value={data.target}
            on:change={changed}>
      {#each fields as f}
        <option value={f}>{f}</option>
      {/each}
    </select>
  </div>

  {#if !hasFilter}
    <p class="text-sm text-red-500">
      ⚠ Add a <code>filter</code> step before this <code>isPresent</code> step.
    </p>
  {/if}
</div>
