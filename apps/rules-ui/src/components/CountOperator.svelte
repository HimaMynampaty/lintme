<script>
  import { createEventDispatcher } from 'svelte';
  import { pipeline } from '../stores/pipeline.js';

  export let data;        
  export let storeIndex;  

  const dispatch  = createEventDispatcher();
  let   hasExtract = false;

$: {
  let prevTarget = data.target;
  let prevScopes = JSON.stringify(data.scopes);

  let found = false;
  for (let i = storeIndex - 1; i >= 0 && !found; i--) {
    const step = $pipeline[i];
    if (step?.operator === 'extract') {
      found = true;

      const newTarget = step.target ?? '';
      const newScopes = step.scopes ? [...step.scopes] : [];

      if (newTarget !== prevTarget ||
          JSON.stringify(newScopes) !== prevScopes) {

        data.target = newTarget;
        data.scopes = newScopes;
        dispatch('input');
      }
    }
  }
  hasExtract = found;
}

</script>

{#if !hasExtract}
  <p class="text-sm text-red-500">
    ⚠ Add a <code>extract</code> step before this one.
  </p>
{/if}
