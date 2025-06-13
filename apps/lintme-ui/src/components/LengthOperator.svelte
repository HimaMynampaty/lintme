<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { pipeline } from '../stores/pipeline.js';

  export let data;
  export let storeIndex;

  const dispatch = createEventDispatcher();
  let hasExtract = false;

  primeWithExtract(get(pipeline));   

  onMount(() => primeWithExtract(get(pipeline))); 
  $: hasExtract = primeWithExtract($pipeline);    

  function primeWithExtract(steps) {
    for (let i = storeIndex - 1; i >= 0; i--) {
      const prev = steps[i];
      if (prev?.operator === 'extract') {
        hasExtract = true;

        if (!data.target)   data.target = prev.target ?? '';
        if (!data.scopes || data.scopes.length === 0)
          data.scopes = [...(prev.scopes ?? [])];

        dispatch('input');

        return true;
      }
    }
    return false;
  }
</script>

{#if !hasExtract}
  <p class="text-sm text-red-500">⚠ Add any step like <code>extract</code> before this one.</p>
{/if}
