<script>
  import { dndzone } from 'svelte-dnd-action';
  import { pipeline } from '../stores/pipeline.js';
  import OperatorBox from '../components/OperatorBox.svelte';

  /** keep drag‑and‑drop in sync with the store */
  function handleReorder(e) {
    // e.detail.items is *only* the user‑visible steps (index ≥ 1)
    pipeline.set([{ operator: 'generateAST' }, ...e.detail.items]);
  }

  /** propagate edits coming from an OperatorBox */
  function handleUpdate(storeIndex, newStep) {
    pipeline.update(arr => {
      const next = [...arr];
      next[storeIndex] = { ...newStep };
      return next;
    });
  }

  function removeStep(storeIndex) {
    pipeline.update(arr => arr.filter((_, i) => i !== storeIndex));
  }
</script>

<!-- drag‑and‑drop zone shows everything *after* generateAST -->
<div
  use:dndzone={{
    items: $pipeline.slice(1),
    flipDurationMs: 150
  }}
  on:consider={handleReorder}
  on:finalize={handleReorder}
  class="space-y-4"
>
  {#each $pipeline.slice(1) as step, i (step.id)}
    <OperatorBox
      {step}
      index={i + 1}        
      storeIndex={i + 1}     
      on:update={(e) => handleUpdate(i + 1, e.detail)}
      on:remove={() => removeStep(i + 1)}
    />
  {/each}
</div>
