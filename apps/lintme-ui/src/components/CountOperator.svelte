<script>
  import { createEventDispatcher } from 'svelte';
  import { pipeline } from '../stores/pipeline.js';

  export let data;
  export let storeIndex;

  const dispatch = createEventDispatcher();

  let hasStep = false;
  let isValidSource = false;

  function maybeHydrate(prev) {
    let changed = false;

    const implicitTarget =
      prev.target ?? (prev.operator === 'search' ? 'query' : undefined);

    if (implicitTarget && !data.target) {
      data.target = implicitTarget;        
      changed = true;
    }

    if (Array.isArray(prev.scopes) && prev.scopes.length &&
        (!data.scopes || !data.scopes.length)) {
      data.scopes = [...prev.scopes];
      changed = true;
    }

    if (changed) dispatch('input');
  }

  $: {
    hasStep = false;
    isValidSource = false;

    const steps = $pipeline;

    for (let i = storeIndex - 1; i >= 0; i--) {
      const prev = steps[i];
      if (!prev) continue;

      const hasImplicitTarget =
        prev.target || (prev.operator === 'search');

      if (hasImplicitTarget) {
        hasStep = true;
        isValidSource = true;
        maybeHydrate(prev);
        break;
      }
    }
  }
</script>

{#if $$slots.default}
  <slot />
{:else if !hasStep}
  <p class="text-sm text-red-500 my-1 max-w-xs break-words">
    ⚠ This step requires a previous step with a <code>target</code>,
    like <code>extract</code> or <code>search</code>.
  </p>
{:else if !isValidSource}
  <p class="text-sm text-red-500 my-1 max-w-xs break-words">
    ⚠ The upstream step lacks the data needed to count.
  </p>
{/if}
