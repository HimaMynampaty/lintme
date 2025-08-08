<script>
  import { createEventDispatcher, onMount, tick } from 'svelte';
  import { pipeline } from '../stores/pipeline.js';

  export let data = {};
  export let storeIndex = 0;

  const dispatch = createEventDispatcher();
  const update = () => {
    data.scopes = [data.scope];
    dispatch('input');
  };

  $: isFirstStep = storeIndex === 0 || storeIndex === 1;

  onMount(async () => {
    data.operator = 'detectDuplicateSentences';
    data.scope ??= 'document';
    data.scopes = [data.scope];
    await tick();
    dispatch('input');
  });
</script>

<div class="space-y-4">
  {#if !isFirstStep}
    <div>
      <label for="dup-scope" class="text-sm font-medium text-gray-700">
        Scope
      </label>
      <select
        id="dup-scope"
        class="w-full border rounded px-3 py-2 text-sm"
        bind:value={data.scope}
        on:change={update}
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
