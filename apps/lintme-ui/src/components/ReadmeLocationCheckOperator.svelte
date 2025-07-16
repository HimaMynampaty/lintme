<script>
  import { createEventDispatcher } from 'svelte';
  import { pipeline } from '../stores/pipeline.js';

  export let data;
  export let storeIndex;

  const dispatch = createEventDispatcher();

  let hasUpstreamPaths = false;

  // Try to hydrate paths from previous steps
  function maybeHydrate(prev) {
    if (prev?.fetchResult?.readmes?.length && !data.paths) {
      data.paths = prev.fetchResult.readmes.map(r => r.path);
      dispatch('input');
    }
  }

  $: {
    hasUpstreamPaths = false;
    const steps = $pipeline;

    for (let i = storeIndex - 1; i >= 0; i--) {
      const prev = steps[i];
      if (!prev) continue;

      if (prev.operator === 'fetchFromGithub' &&
          Array.isArray(prev.fetchResult?.readmes) &&
          prev.fetchResult.readmes.length > 0) {
        hasUpstreamPaths = true;
        maybeHydrate(prev);
        break;
      }
    }
  }
</script>

{#if hasUpstreamPaths}
  <p class="text-sm text-gray-600 my-1">
    ✅ Using README paths from previous step (<code>fetchFromGithub</code>).
  </p>
{:else}
  <p class="text-sm text-red-500 my-1">
    ⚠ This operator needs to follow <code>fetchFromGithub</code> with <code>fetchType: "path"</code>.
  </p>
{/if}
