<script>
  import { createEventDispatcher } from 'svelte';
  import { pipeline } from '../stores/pipeline.js';

  export let data;        
  export let storeIndex;    

  const dispatch = createEventDispatcher();
  const types = ['lessthan', 'greaterthan', 'greaterthanequalto', 'lessthanequalto', 'equal','equalto'];
  let countScopes = [];
  let availableTargets = ['emoji', 'newline'];  

  let countTarget = '';
  let targetMismatch = false;

  $: {
    const steps = $pipeline;
    let foundScopes = [];

    for (let i = storeIndex - 1; i >= 0; i--) {
      const prev = steps[i];
      if (prev.operator === 'count') {
        foundScopes = prev.scopes ?? [];

        if (!data.target && prev.target) {
          data.target = prev.target;
          dispatch('input');
        }

        countTarget = prev.target || '';
        break;
      }
    }

    countScopes = foundScopes;
  }

  $: {
    targetMismatch = data.target && countTarget && data.target !== countTarget;
  }

  $: {
    data.conditions ||= {};
    let changed = false;

    for (const s of countScopes) {
      if (!data.conditions[s]) {
        data.conditions[s] = { type: 'lessthan', value: '' };
        changed = true;
      }
    }

    for (const key of Object.keys(data.conditions)) {
      if (!countScopes.includes(key)) {
        delete data.conditions[key];
        changed = true;
      }
    }

    if (changed) dispatch('input');
  }

  const onFieldChange = () => dispatch('input');
</script>

<div class="space-y-4">
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-1"
           for="target">Target</label>
    <select id="target"
            bind:value={data.target}
            class="w-full border border-gray-300 rounded px-2 py-1 text-sm
                   focus:outline-none focus:ring-2 focus:ring-indigo-500"
            on:change={onFieldChange}>
      {#each availableTargets as t}
        <option value={t}>{t}</option>
      {/each}
    </select>
    {#if targetMismatch}
      <p class="text-xs text-yellow-600 mt-1">
        ⚠ Target doesn't match previous <code>count</code> step (<code>{countTarget}</code>)
      </p>
    {/if}
  </div>

  {#if countScopes.length === 0}
    <p class="text-sm text-red-500">
      ⚠ Add a <code>count</code> step with scopes before this threshold.
    </p>
  {/if}

  {#each countScopes as s}
    <div class="border-t pt-4">
      <h4 class="text-sm font-semibold text-indigo-700 mb-2 capitalize">
        {s === 'endoffile' ? 'End of File' : s} Threshold
      </h4>

      <div class="flex gap-4">
        <div class="w-1/2">
          <label class="block text-sm font-medium text-gray-700 mb-1"
                 for={`type-${s}`}>Type</label>
          <select id={`type-${s}`}
                  bind:value={data.conditions[s].type}
                  class="w-full border border-gray-300 rounded px-2 py-1 text-sm
                         focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  on:change={onFieldChange}>
            {#each types as t}
              <option value={t}>{t}</option>
            {/each}
          </select>
        </div>

        <div class="w-1/2">
          <label class="block text-sm font-medium text-gray-700 mb-1"
                 for={`val-${s}`}>Value</label>
          <input id={`val-${s}`}
                 type="number" min="0"
                 bind:value={data.conditions[s].value}
                 class="w-full border border-gray-300 rounded px-3 py-1 text-sm
                        focus:outline-none focus:ring-2 focus:ring-indigo-500"
                 on:input={onFieldChange}/>
        </div>
      </div>
    </div>
  {/each}
</div>
