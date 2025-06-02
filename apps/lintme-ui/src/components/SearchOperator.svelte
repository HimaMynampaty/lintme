<script>
  import { createEventDispatcher, onMount, tick } from 'svelte';
  import { pipeline } from '../stores/pipeline.js';

  export let data = {};
  export let storeIndex = 0;     

  const dispatch = createEventDispatcher();
  const changed  = () => {
    data.scopes = [data.scope];
    dispatch('input');
  };

  $: isFirstStep = storeIndex === 1 || storeIndex === 0;

  onMount(async () => {
    data.operator ??= 'search';
    data.query    ??= '';
    data.scope    ??= 'document';
    data.scopes   = [data.scope];   
    data.target   ??= 'query';     
    await tick();
    dispatch('input');
  });
</script>

<div class="space-y-4">
  <div>
    <label for="search-query" class="text-sm font-medium text-gray-700">
      String to search for
    </label>
    <input
      id="search-query"
      type="text"
      class="w-full border rounded px-3 py-2 text-sm"
      bind:value={data.query}
      placeholder="e.g. TODO, production, localhost"
      on:input={changed}
    />
  </div>

  {#if !isFirstStep}
    <div>
      <label for="scope-select" class="text-sm font-medium text-gray-700">
        Scope
      </label>
      <select
        id="scope-select"
        class="w-full border rounded px-3 py-2 text-sm"
        bind:value={data.scope}
        on:change={changed}
      >
        <option value="previousstepoutput">Previous step output</option>
        <option value="document">Entire document</option>
      </select>
    </div>
  {:else}
    <p class="text-xs text-gray-500">
      Scope is fixed to <code>document</code> because this is the first step.
    </p>
  {/if}
</div>
