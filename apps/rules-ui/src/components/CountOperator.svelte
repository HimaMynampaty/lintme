<script>
  import { createEventDispatcher } from 'svelte';
  import { pipeline } from '../stores/pipeline.js';

  export let data;        
  export let storeIndex; 

  const dispatch = createEventDispatcher();
  const changed  = () => dispatch('input');    

  const availableTargets = ['emoji', 'newline', 'image', 'date', 'word'];
  const allScopes        = ['line', 'paragraph', 'document', 'endoffile'];

  let hasFilter      = false;
  let filterTarget   = '';
  let filterScopes   = [];
  let targetMismatch = false;
  let scopesMismatch = false;

  $: {
    hasFilter      = false;
    filterTarget   = '';
    filterScopes   = [];

    for (let i = storeIndex - 1; i >= 0; i--) {
      const step = $pipeline[i];
      if (step && step.operator === 'filter') {
        hasFilter    = true;
        filterTarget = step.target  || '';
        filterScopes = step.scopes || [];
        break;
      }
    }

    data.scopes ||= [];

    if (!data.target && filterTarget) {
      data.target = filterTarget;
      changed();
    }
    targetMismatch =
      Boolean(data.target && filterTarget && data.target !== filterTarget);

    if (filterScopes.length && !arraysEqual(data.scopes, filterScopes)) {
      data.scopes = [...filterScopes];
      changed();
    }
    scopesMismatch =
      filterScopes.length && !arraysEqual(data.scopes, filterScopes);
  }

  function arraysEqual(a, b) {
    return (
      a.length === b.length &&
      [...a].sort().join() === [...b].sort().join()
    );
  }
</script>

<div class="space-y-4">
  <div>
    <label for="countTarget" class="block text-sm font-medium text-gray-700 mb-1">
      Target
    </label>

    <select
      id="countTarget"
      bind:value={data.target}
      class="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      on:change={changed}
    >
      {#each availableTargets as t}
        <option value={t}>{t}</option>
      {/each}
    </select>

    {#if targetMismatch}
      <p class="text-xs text-yellow-600 mt-1">
        ⚠ Target doesn’t match previous <code>filter</code> step
        (<code>{filterTarget}</code>)
      </p>
    {/if}
  </div>

  {#if !hasFilter}
    <p class="text-sm text-red-500">
      ⚠ Add a <code>filter</code> step before this to define target &amp; scope.
    </p>
  {/if}

  <fieldset>
    <legend class="block text-sm font-medium text-gray-700 mb-2">Scopes</legend>

    <div class="space-y-1">
      {#each allScopes as s}
        <div class="flex items-center gap-2">
          <input
            id={`scope-${s}`}
            type="checkbox"
            value={s}
            bind:group={data.scopes}
            disabled
            class="h-4 w-4 text-indigo-600 border-gray-300 rounded"
          />
          <label for={`scope-${s}`} class="text-sm text-gray-700">{s}</label>
        </div>
      {/each}
    </div>

    {#if scopesMismatch}
      <p class="text-xs text-yellow-600 mt-1">
        ⚠ Scopes differ from previous <code>filter</code> step
        (<code>{filterScopes.join(', ')}</code>)
      </p>
    {/if}
  </fieldset>
</div>
