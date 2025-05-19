<script>
  import { createEventDispatcher } from 'svelte';
  import FilterOperator     from './FilterOperator.svelte';
  import CountOperator      from './CountOperator.svelte';
  import ThresholdOperator  from './ThresholdOperator.svelte';
  import FixManualOperator  from './FixManualOperator.svelte';
  import FixLLMOperator     from './FixLLMOperator.svelte';
  import IsPresentOperator  from './IsPresentOperator.svelte';
  import RegexMatchOperator from './RegexMatchOperator.svelte';

  export let step;
  export let index;
  export let storeIndex = null;

  const dispatch = createEventDispatcher();
  const changed  = () => dispatch('update', step);
  const remove   = () => dispatch('remove');
</script>

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

  {/if}
</div>
