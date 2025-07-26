<script>
  import { createEventDispatcher, onDestroy, tick } from 'svelte';
  import { operatorDescriptions } from '../lib/operatorMetadata.js';

  import ExtractOperator     from './ExtractOperator.svelte';
  import CountOperator       from './CountOperator.svelte';
  import ThresholdOperator   from './ThresholdOperator.svelte';
  import FixUsingLLMOperator from './FixUsingLLMOperator.svelte';
  import IsPresentOperator   from './IsPresentOperator.svelte';
  import RegexMatchOperator  from './RegexMatchOperator.svelte';
  import SageOperator        from './SageOperator.svelte';
  import CompareOperator     from './CompareOperator.svelte';
  import LengthOperator      from './LengthOperator.svelte';
  import SearchOperator      from './SearchOperator.svelte';
  import DetectHateSpeechOperator from './DetectHateSpeechOperator.svelte';
  import FetchFromGithubOperator from './FetchFromGithubOperator.svelte';
  import ReadmeLocationCheckOperator from './ReadmeLocationCheckOperator.svelte';
  import MarkdownRenderOperator from './MarkdownRenderOperator.svelte';
  import CalculateContrastOperator from './CalculateContrastOperator.svelte';
  import CustomCodeOperator from './CustomCodeOperator.svelte';

  export let step;
  export let index;
  export let storeIndex = null;

  const dispatch = createEventDispatcher();
  const changed = () => dispatch('update', step);
  const remove = () => dispatch('remove');

  let showPopup = false;
  let popupRef;

  async function togglePopup() {
    showPopup = !showPopup;
    await tick();
    if (showPopup) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
  }

  function handleClickOutside(event) {
    if (!step?.id) return;

    const clickedInsidePopup = popupRef?.contains(event.target);
    const clickedButton = event.target.closest(`[data-step="step-${step.id}"]`);

    if (!clickedInsidePopup && !clickedButton) {
      showPopup = false;
      document.removeEventListener('mousedown', handleClickOutside);
    }
  }

  onDestroy(() => {
    document.removeEventListener('mousedown', handleClickOutside);
  });
</script>

{#if step}
  <div class="relative inline-block group">
    {#if step.operator === 'count'}
      <CountOperator bind:data={step} {storeIndex} />
    {/if}

    <button
      type="button"
      class="w-full text-left border border-gray-300 bg-white px-4 py-2 rounded-md shadow-sm text-sm text-gray-800 flex items-center gap-2 hover:shadow-md hover:bg-white transition"
      on:click={togglePopup}
      data-step={step?.id ? `step-${step.id}` : ''}
      aria-haspopup="dialog"
      aria-expanded={showPopup}
      title={operatorDescriptions[step.operator] ?? ''}
    >
      <span>Step {index}: {step.operator}</span>
      <span class="sr-only">Edit {step.operator}</span>
    </button>

    <button
      class="absolute -top-2 -right-2 bg-white text-gray-400 hover:text-red-800 border border-gray-200 rounded-full w-6 h-6 text-xs flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100  hover:bg-white transition-opacity"
      on:click|stopPropagation={remove}
      aria-label="Remove step"
      title="Delete step"
    >
      ✖
    </button>

    {#if showPopup}
      <div
        class="absolute top-12 left-0 z-20 w-72 p-4 bg-white border border-gray-200 rounded-lg shadow-xl"
        bind:this={popupRef}
      >
        <div class="flex justify-between items-center mb-2">
          <h4 class="text-sm font-semibold text-gray-700">
            {step.operator} configurations
          </h4>
          <button
            class="text-gray-400 hover:text-red-500 text-sm"
            on:click|stopPropagation={remove}
            title="Delete step"
            aria-label="Delete step"
          >
            ✖
          </button>
        </div>

        {#key step.id}
          {#if step.operator === 'extract'}
            <ExtractOperator bind:data={step} on:input={changed} />
          {:else if step.operator === 'count'}
            <CountOperator bind:data={step} {storeIndex} on:input={changed}>
              <span slot="default" />
            </CountOperator>
          {:else if step.operator === 'threshold'}
            <ThresholdOperator bind:data={step} {storeIndex} on:input={changed} />
          {:else if step.operator === 'fixUsingLLM'}
            <FixUsingLLMOperator bind:data={step} on:input={changed} />
          {:else if step.operator === 'isPresent'}
            <IsPresentOperator bind:data={step} {storeIndex} on:input={changed} />
          {:else if step.operator === 'regexMatch'}
            <RegexMatchOperator bind:data={step} {storeIndex} on:input={changed} />
          {:else if step.operator === 'sage'}
            <SageOperator bind:data={step} />
          {:else if step.operator === 'compare'}
            <CompareOperator bind:data={step} {storeIndex} on:input={changed} />
          {:else if step.operator === 'length'}  
            <LengthOperator bind:data={step} {storeIndex} on:input={changed} />
          {:else if step.operator === 'search'}
            <SearchOperator bind:data={step} {storeIndex} on:input={changed} />
          {:else if step.operator === 'detectHateSpeech'}
            <DetectHateSpeechOperator bind:data={step} {storeIndex} on:input={changed} />
          {:else if step.operator === 'fetchFromGithub'}
            <FetchFromGithubOperator bind:data={step} on:input={changed} />
          {:else if step.operator === 'readmeLocationCheck'}
            <ReadmeLocationCheckOperator bind:data={step} {storeIndex} on:input={changed} />
          {:else if step.operator === 'markdownRender'}
            <MarkdownRenderOperator bind:data={step} on:input={changed} />  
          {:else if step.operator === 'calculateContrast'}
            <CalculateContrastOperator bind:data={step} {storeIndex} on:input={changed} />
          {:else if step.operator === 'customCode'}
            <CustomCodeOperator bind:data={step} on:input={changed} />
          {/if}
        {/key}
      </div>
    {/if}
  </div>
{/if}
