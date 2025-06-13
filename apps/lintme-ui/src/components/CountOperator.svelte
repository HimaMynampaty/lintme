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

    if (prev.target && !data.target) {
      data.target = prev.target;
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

      if (prev.operator === 'extract' || prev.target) {
        hasStep = true;

        if (prev.target &&
            Array.isArray(prev.scopes) &&
            prev.scopes.length > 0) {
          isValidSource = true;
          maybeHydrate(prev);
        }
        break;
      }
    }
  }
</script>

{#if $$slots.default}
  <slot />
{:else if !hasStep}
  <p class="text-sm text-red-500 my-1 max-w-xs break-words">
    ⚠ This step requires a previous (like extract) step but none exists.
  </p>
{:else if !isValidSource}
  <p class="text-sm text-red-500 my-1 max-w-xs break-words">
    ⚠ The upstream <code>exract</code> step is missing a <code>target</code>
    or non-empty <code>scopes</code>.
  </p>
{/if}
