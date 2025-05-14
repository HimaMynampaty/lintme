<script>
  import { pipeline } from '../stores/pipeline.js';
  import OperatorBox  from '../components/OperatorBox.svelte';

  export let updateStep;

  function removeStep(i) {
    pipeline.update(arr => arr.filter((_, idx) => idx !== i));
  }
</script>

<div class="bg-white p-4 rounded shadow space-y-4">
  <h2 class="text-lg font-semibold mb-2">Pipeline</h2>

  <div class="bg-slate-100 p-2 rounded text-sm">
    <strong>Step 1:</strong> parseAST (auto‑included)
  </div>

  {#each $pipeline.slice(1) as step, i}
    <OperatorBox
      {step}
      storeIndex={i + 1}        
      index={i + 2}              
      on:update={e => updateStep(i + 1, e.detail)}
      on:remove={() => removeStep(i + 1)}  
    />
  {/each}
</div>
