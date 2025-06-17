<script>
  import { createEventDispatcher, onMount, tick } from 'svelte';

  export let data = {};
  export let storeIndex = 0;

  const dispatch = createEventDispatcher();
  const changed = () => dispatch('input');

  $: isFirstStep = storeIndex === 1 || storeIndex === 0;

  onMount(async () => {
    data.operator ??= 'detectHateSpeech';

    if (!('scope' in data)) {
      data.scope = !isFirstStep ? 'previousstepoutput' : 'document';
    }

    data.scopes = [data.scope];
    await tick();
    dispatch('input');
  });

  function updateScope() {
    data.scopes = [data.scope];
    changed();
  }
</script>

<div class="space-y-4 text-sm text-gray-700">
  <p>
    This operator detects potentially offensive, biased, or hateful language using built-in analysis.
  </p>

  {#if !isFirstStep}
    <div>
      <label for="scope-select" class="text-sm font-medium text-gray-700">
        Scope
      </label>
      <select
        id="scope-select"
        class="w-full border rounded px-3 py-2 text-sm"
        bind:value={data.scope}
        on:change={updateScope}
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
