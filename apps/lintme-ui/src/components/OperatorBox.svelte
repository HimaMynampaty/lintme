<script>
  import { createEventDispatcher } from 'svelte';
  import FilterOperator     from './FilterOperator.svelte';
  import CountOperator      from './CountOperator.svelte';
  import ThresholdOperator  from './ThresholdOperator.svelte';
  import FixManualOperator  from './FixManualOperator.svelte';
  import FixLLMOperator     from './FixLLMOperator.svelte';
  import IsPresentOperator  from './IsPresentOperator.svelte';
  import RegexMatchOperator from './RegexMatchOperator.svelte';
  import SageOperator from './SageOperator.svelte';
  import CompareOperator from './CompareOperator.svelte';

  export let step;
  export let index;
  export let storeIndex = null;

  const dispatch = createEventDispatcher();
  const changed  = () => dispatch('update', step);
  const remove   = () => dispatch('remove');
</script>

<div class="step-card">
<div class="relative bg-white border rounded p-3 shadow-sm space-y-3 group">
  <button
    title="Remove step"
    class="absolute top-2 right-2 text-gray-400 hover:text-red-600
           transition opacity-0 group-hover:opacity-100"
    on:click={remove}
    aria-label="Remove step"
  >
    ✖
  </button>

  <h3 class="text-sm font-bold text-indigo-700">
    Step {index}: {step.operator}
  </h3>

  {#if step.operator === 'filter'}
    <FilterOperator        bind:data={step} on:input={changed} />
  {:else if step.operator === 'count'}
    <CountOperator         bind:data={step} {storeIndex} on:input={changed} />
  {:else if step.operator === 'threshold'}
    <ThresholdOperator     bind:data={step} {storeIndex} on:input={changed} />
  {:else if step.operator === 'fixUsingLintMeCode'}
    <FixManualOperator     bind:data={step} on:input={changed} />
  {:else if step.operator === 'fixUsingLLM'}
    <FixLLMOperator        bind:data={step} on:input={changed} />
  {:else if step.operator === 'isPresent'}
    <IsPresentOperator bind:data={step} {storeIndex} on:input={changed} />
  {:else if step.operator === 'regexMatch'}
    <RegexMatchOperator bind:data={step} {storeIndex} on:input={changed} />
  {:else if step.operator === 'sage'}
    <SageOperator bind:data={step}/>
  {:else if step.operator === 'compare'}
    <CompareOperator bind:data={step} {storeIndex} on:input={changed}/>  
  {/if}
</div>
</div>  

<style>
.step-card{
  background:white;
  border:1px solid #e5e7eb;
  border-radius:8px;
  padding:1rem;
  box-shadow:0 1px 2px rgba(0,0,0,.04);
}

.step-card h3{
  margin:0 0 .5rem;
  font-size:1rem;
  font-weight:600;
  color:#1e293b;               /* slate‑800 */
}

.delete-btn{
  position:absolute;top:.6rem;right:.6rem;
  border:none;background:none;font-size:18px;
  color:#9ca3af;cursor:pointer;
}
.delete-btn:hover{color:#ef4444;}
</style>