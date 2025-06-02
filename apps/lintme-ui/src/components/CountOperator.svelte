<script>
  import { createEventDispatcher } from 'svelte';
  import { pipeline } from '../stores/pipeline.js';

  export let data;
  export let storeIndex;

  const dispatch = createEventDispatcher();
  let hasPriorStepOutput = false;

  $: {
    let prevTarget = data.target;
    let prevScopes = JSON.stringify(data.scopes);

    let found = false;
    for (let i = storeIndex - 1; i >= 0 && !found; i--) {
      const step = $pipeline[i];
      if (step?.operator) {
        found = true;

        if (step.target && step.target !== prevTarget) {
          data.target = step.target;
        }
        if (step.scopes && JSON.stringify(step.scopes) !== prevScopes) {
          data.scopes = [...step.scopes];
        }
        dispatch('input');
      }
    }

    hasPriorStepOutput = found;
  }
</script>

{#if !hasPriorStepOutput}
  <p class="text-sm text-red-500">
    ⚠ Add a step before this one so it has data to work with.
  </p>
{/if}
