<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { pipeline } from '../stores/pipeline.js';

  export let data;        // { target?: string, scopes?: string[] }
  export let storeIndex;  // index of this step in $pipeline

  /* ---------- local helpers ---------- */
  const dispatch = createEventDispatcher();
  const changed  = () => dispatch('input');

  const availableTargets = ['emoji', 'newline', 'link', 'date', 'word'];
  const allScopes        = ['line', 'paragraph', 'document', 'endoffile'];

  /* ---------- reactive state ---------- */
  let hasFilter        = false;
  let filterTarget     = '';
  let filterScopes: string[] = [];
  let targetMismatch   = false;
  let scopesMismatch   = false;

  /* -------------------------------------------------
   *  reactive block – re‑runs on $pipeline or data*
   * ------------------------------------------------*/
  $: {
    /* 1. locate the closest previous filter step */
    hasFilter     = false;
    filterTarget  = '';
    filterScopes  = [];

    for (let i = storeIndex - 1; i >= 0; i--) {
      const step = $pipeline[i];
      if (step?.operator === 'filter') {
        hasFilter     = true;
        filterTarget  = step.target  ?? '';
        filterScopes  = step.scopes  ?? [];
        break;
      }
    }

    /* 2. ensure data scaffolding */
    data.scopes ??= [];

    /* 3. auto‑fill / sync target */
    if (!data.target && filterTarget) {
      data.target = filterTarget;
      changed();
    }
    targetMismatch = !!(data.target && filterTarget && data.target !== filterTarget);

    /* 4. auto‑sync scopes (hard overwrite if diverged) */
    if (filterScopes.length && !arraysEqual(data.scopes, filterScopes)) {
      data.scopes = [...filterScopes];
      changed();
    }
    scopesMismatch =
      filterScopes.length && !arraysEqual(data.scopes, filterScopes);
  }

  function arraysEqual(a: string[], b: string[]) {
    return a.length === b.length &&
           a.slice().sort().join() === b.slice().sort().join();
  }
</script>

<div class="space-y-4">
  <!-- Target selector -->
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
        ⚠ Target doesn't match previous <code>filter</code> step (<code>{filterTarget}</code>)
      </p>
    {/if}
  </div>

  <!-- Validation: no filter step -->
  {#if !hasFilter}
    <p class="text-sm text-red-500">
      ⚠ Add a <code>filter</code> step before this to define the target and scope.
    </p>
  {/if}

  <!-- Scopes checkboxes (read‑only mirror of filter) -->
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
        ⚠ Scopes differ from previous <code>filter</code> step (<code>{filterScopes.join(', ')}</code>)
      </p>
    {/if}
  </fieldset>
</div>
