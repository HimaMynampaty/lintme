<script>
  import { createEventDispatcher } from 'svelte';
  import { pipeline } from '../stores/pipeline.js';

  export let data;        // config object for this step
  export let storeIndex;  // index of this step inside $pipeline

  const dispatch  = createEventDispatcher();
  let   hasFilter = false;

  /* ── reactive block: find previous filter and inherit values ─────────── */
  $: {
    hasFilter = false;

    for (let i = storeIndex - 1; i >= 0; i--) {
      const step = $pipeline[i];
      if (step?.operator === 'filter') {
        hasFilter    = true;
        data.target  = step.target  ?? '';
        data.scopes  = [...(step.scopes ?? [])];
        dispatch('input');          // let parent know we mutated data
        break;
      }
    }
  }
</script>

{#if !hasFilter}
  <p class="text-sm text-red-500">
    ⚠ Add a <code>filter</code> step before this one.
  </p>
{/if}
