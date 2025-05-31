<script>
  import { onDestroy } from 'svelte';
  import { pipeline }   from '../stores/pipeline.js';
  import { generateYAML } from '../utils/yaml.js';

  import OperatorPalette from './OperatorPalette.svelte';
  import PipelineEditor  from '../editor/PipelineEditor.svelte';

  // Monaco editor instance comes in from <App.svelte>
  export let rulesEditor;

  /* local ui state -------------------------------------------------------- */
  let showPalette = false;
  function togglePalette() { showPalette = !showPalette; }

  /* add an operator to the pipeline -------------------------------------- */
  function addOperator(opName) {
    const id = crypto.randomUUID();             // modern browsers support this

    pipeline.update(steps => {
      switch (opName) {
        case 'isPresent':
          return [...steps, { id, operator: 'isPresent', target: 'alt' }];

        case 'compare':
          return [...steps, { id, operator: 'compare', baseline: '', against: '' }];

        case 'regexMatch':
          return [...steps, { id, operator: 'regexMatch', pattern: '' }];

        case 'sage':
          return [...steps, { id, operator: 'sage' }];

        default:
          return [...steps, { id, operator: opName }];
      }
    });

    showPalette = false;
  }

  /* keep YAML text in sync with the visual pipeline ---------------------- */
  const unsub = pipeline.subscribe(steps => {
    if (rulesEditor) {
      const yaml = generateYAML('my-rule', '', steps);
      rulesEditor.setValue(yaml);
    }
  });
  onDestroy(unsub);
</script>

<div class="operator-panel">
  <button class="add-operator-btn" on:click={togglePalette}>➕</button>

  {#if showPalette}
    <div class="palette-popup">
      <OperatorPalette
        on:select={(e) => addOperator(e.detail)}
        on:close={() => (showPalette = false)}
      />
    </div>
  {/if}

<div class="steps">
  <PipelineEditor />
</div>
</div>

<style>
/* ──────────── panel container ──────────── */
.operator-panel{
  background:#f9fafb;
  border:1px solid #e5e7eb;
  border-radius:12px;
  padding:1rem;
  display:flex;
  flex-direction:column;
  gap:.75rem;
}

/* ──────────── “add” button ──────────── */
.add-operator-btn{
  width:34px;height:34px;
  display:flex;align-items:center;justify-content:center;
  font-size:20px;font-weight:600;
  color:white;background:#6366f1;
  border:none;border-radius:9999px;cursor:pointer;
  transition:background .15s;
}
.add-operator-btn:hover{background:#4f46e5;}

/* ──────────── palette pop‑up ──────────── */
.palette-popup{
  position:relative;
  background:white;
  border:1px solid #e5e7eb;
  border-radius:10px;
  padding:12px;
  box-shadow:0 8px 24px rgba(0,0,0,.08);
}

/* ──────────── list of step cards ──────────── */
.steps{
  display:flex;
  flex-direction:column;
  gap:.75rem;
}
</style>

