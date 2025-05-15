<script>
  import { createEventDispatcher, onMount, tick } from 'svelte';
  import { pipeline } from '../stores/pipeline.js';

  export let data = {};        
  export let storeIndex = 0;  

  const dispatch = createEventDispatcher();
  const changed = () => dispatch('input');

  const fields = ['alt', 'emoji', 'newline'];
  const scopes = ['document', 'paragraph', 'line', 'endoffile'];

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

  onMount(async () => {
    data.operator ??= 'isPresent';
    data.target   ??= 'alt';
    data.scope    ??= 'document';
    data.level    ??= 'warning';
    await tick();
    dispatch('input');
  });
</script>

<div class="space-y-4">
  <div>
    <label for="present-field" class="text-sm font-medium text-gray-700">Field</label>
    <select
      id="present-field"
      class="w-full border px-3 py-2 rounded text-sm"
      bind:value={data.target}
      on:change={changed}
    >
      {#each fields as f}
        <option value={f}>{f}</option>
      {/each}
    </select>
  </div>

  <div>
    <label for="present-scope" class="text-sm font-medium text-gray-700">Scope</label>
    <select
      id="present-scope"
      class="w-full border px-3 py-2 rounded text-sm"
      bind:value={data.scope}
      on:change={changed}
    >
      {#each scopes as s}
        <option value={s}>{s}</option>
      {/each}
    </select>
  </div>

  {#if !hasFilter}
    <p class="text-sm text-red-500">
      ⚠ Add a <code>filter</code> step before this <code>isPresent</code> step to provide input data.
    </p>
  {/if}
</div>
