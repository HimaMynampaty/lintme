<script>
  import { createEventDispatcher } from 'svelte';
  import { pipeline } from '../stores/pipeline.js';

  export let data;
  export let storeIndex;

  const dispatch = createEventDispatcher();
  const types = [
    'lessthan', 'greaterthan', 'greaterthanequalto',
    'lessthanequalto', 'equal', 'equalto'
  ];

  let countScopes = [];
  let countTarget = '';

  $: {
    const steps = $pipeline;

    countScopes = [];
    countTarget = '';

    for (let i = storeIndex - 1; i >= 0; i--) {
      const prev = steps[i];

      if (prev?.scopes?.length && prev.target) {
        countScopes = [...prev.scopes];
        countTarget = prev.target;
        break;
      }
    }

    if (countTarget && !data.target) {
      data.target = countTarget;
      dispatch('input');
    }

    data.conditions ||= {};
    for (const s of countScopes) {
      data.conditions[s] ??= { type: 'lessthan', value: '' };
    }
  }

  const onFieldChange = () => dispatch('input');
</script>

<div class="space-y-4">
  {#if countScopes.length === 0}
    <p class="text-sm text-red-500">
      ⚠ Add a <code>count</code> or <code>length</code> step with scope before this threshold.
    </p>
  {/if}

  {#each countScopes as s}
    <div class="border-t pt-4">
      <h4 class="text-sm font-semibold text-indigo-700 mb-2 capitalize">
        {s === 'endoffile' ? 'End of File' : s} Threshold
      </h4>

      <div class="flex gap-4">
        <div class="w-1/2">
          <label for="type-{s}" class="block text-sm font-medium mb-1">Type</label>
          <select
            id="type-{s}"
            bind:value={data.conditions[s].type}
            class="w-full border rounded px-2 py-1 text-sm"
            on:change={onFieldChange}
          >
            {#each types as t}
              <option value={t}>{t}</option>
            {/each}
          </select>
        </div>

        <div class="w-1/2">
          <label for="value-{s}" class="block text-sm font-medium mb-1">Value</label>
          <input
            id="value-{s}"
            type="number"
            min="0"
            bind:value={data.conditions[s].value}
            class="w-full border rounded px-3 py-1 text-sm"
            on:input={onFieldChange}
          />
        </div>
      </div>
    </div>
  {/each}
</div>
