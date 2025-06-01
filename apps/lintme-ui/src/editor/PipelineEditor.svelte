<script>
  import { dndzone } from 'svelte-dnd-action';
  import { pipeline } from '../stores/pipeline.js';
  import OperatorBox from '../components/OperatorBox.svelte';

  function handleReorder(e) {
    pipeline.set([{ operator: 'generateAST' }, ...e.detail.items]);
  }

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

<div
  use:dndzone={{ items: $pipeline.slice(1), flipDurationMs: 150 }}
  on:consider={handleReorder}
  on:finalize={handleReorder}
  class="flex flex-wrap gap-3"
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
