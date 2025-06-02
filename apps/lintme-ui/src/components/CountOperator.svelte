<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import { pipeline } from '../stores/pipeline.js';

  export let data;       
  export let storeIndex;  

  const dispatch = createEventDispatcher();

  function hydrate () {
    for (let i = storeIndex - 1; i >= 0; i--) {
      const prev = $pipeline[i];
      if (prev?.target && prev?.scopes?.length) {
        data.target  ??= prev.target;
        data.scopes  ??= [...prev.scopes];
        dispatch('input');                    
        return true;
      }
    }
    return false;
  }

  onMount(hydrate);
  $: hasUpstream = hydrate();
</script>

{#if $$slots.default}
  <slot />                                   
{:else if !hasUpstream}
  <p class="text-sm text-red-500 my-1">⚠ Needs a step before it.</p>
{/if}
