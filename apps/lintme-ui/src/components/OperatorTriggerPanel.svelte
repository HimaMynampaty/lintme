<script>
  import { onDestroy, tick, onMount } from "svelte";
  import { pipeline, INTERNAL_AST_STEP } from "../stores/pipeline.js";
  import { generateYAML, parseYAML, withIds } from "../utils/yaml.js";

  import OperatorPalette from "./OperatorPalette.svelte";
  import PipelineEditor from "../editor/PipelineEditor.svelte";

  export let rulesEditor;

  let showPalette = false;
  let paletteRef;

  let syncingFromPipeline = false;
  let syncingFromEditor = false;
  let disposer = null;

  async function togglePalette() {
    showPalette = !showPalette;
    await tick();

    if (showPalette) {
      document.addEventListener("click", handleClickOutside);
    } else {
      document.removeEventListener("click", handleClickOutside);
    }
  }

  function handleClickOutside(event) {
    if (
      paletteRef &&
      !paletteRef.contains(event.target) &&
      !event.target.closest('[data-trigger="palette"]')
    ) {
      showPalette = false;
      document.removeEventListener("click", handleClickOutside);
    }
  }

  function addOperator(opName) {
    const id = crypto.randomUUID();

    pipeline.update((steps) => {
      switch (opName) {
        case "isPresent":
          return [...steps, { id, operator: "isPresent" }];
        case "compare":
          return [
            ...steps,
            { id, operator: "compare", baseline: "", against: "" },
          ];
        case "regexMatch":
          return [...steps, { id, operator: "regexMatch", pattern: "" }];
        case "sage":
          return [...steps, { id, operator: "sage" }];
        case "fetchFromGithub":
          return [
            ...steps,
            {
              id,
              operator: "fetchFromGithub",
              repo: "",
              branch: "main",
              fileName: "README.md",
              fetchType: "content",
              metaPath: "",
              useCustomMetaPath: false,
            },
          ];
        case "detectHateSpeech":
          return [
            ...steps,
            {
              id,
              operator: "detectHateSpeech",
              scope: "document",
              scopes: ["document"],
            },
          ];
        case "calculateContrast":
          return [
            ...steps,
            {
              id,
              operator: "calculateContrast",
            },
          ];
        case 'detectDuplicateSentences':
          return [
            ...steps,
            {
              id,
              operator: 'detectDuplicateSentences',
              scope: 'document',
              scopes: ['document'],
            },
          ];  
        case "markdownRender":
          return [
            ...steps,
            {
              id,
              operator: "markdownRender",
              renderer: "marked",
              output: "html",
            },
          ];
        case "customCode":
          return [
            ...steps,
            {
              id,
              operator: "customCode",
              code: `export function run(ctx) {\n  // Write your custom logic here\n  return ctx;\n}`,
            },
          ];
        default:
          return [...steps, { id, operator: opName }];
      }
    });

    showPalette = false;
    document.removeEventListener("click", handleClickOutside);
  }

  const unsub = pipeline.subscribe((steps) => {
    if (!rulesEditor || syncingFromEditor) return;

    syncingFromPipeline = true;
    const yaml = generateYAML("my-rule", "", steps);
    rulesEditor.setValue(yaml);
    syncingFromPipeline = false;
  });

  function handleKeyboardShortcut(e) {
    const isInputFocused =
      ["INPUT", "TEXTAREA"].includes(document.activeElement.tagName) ||
      document.activeElement.isContentEditable;

    if (isInputFocused) return;

    const shortcutPressed =
      (e.ctrlKey && e.key.toLowerCase() === "k") || e.key === "/";

    if (shortcutPressed) {
      e.preventDefault();
      togglePalette();
    }
  }

  onMount(() => {
    window.addEventListener("keydown", handleKeyboardShortcut);
  });

  $: if (
    rulesEditor &&
    typeof rulesEditor.onDidChangeModelContent === "function"
  ) {
    disposer?.dispose?.();

    const handleYamlChange = () => {
      if (syncingFromPipeline) return;

      try {
        const nextSteps = withIds(parseYAML(rulesEditor.getValue()));
        syncingFromEditor = true;
        pipeline.set([INTERNAL_AST_STEP, ...nextSteps]);
      } catch (err) {
        console.warn("Failed to parse YAML → pipeline", err);
      } finally {
        syncingFromEditor = false;
      }
    };

    disposer = rulesEditor.onDidChangeModelContent(handleYamlChange);
  }

  onDestroy(() => {
    document.removeEventListener("click", handleClickOutside);
    window.removeEventListener("keydown", handleKeyboardShortcut);
    unsub?.();
    disposer?.dispose?.();
  });
</script>

<div
  class="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col gap-3"
>
  <div class="flex gap-2">
    <div class="relative">
      <button
        data-trigger="palette"
        class="h-9 px-4 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-full"
        on:click={togglePalette}
      >
        ➕ Add Operator
      </button>

      {#if showPalette}
        <div
          class="absolute top-12 left-0 z-20 w-64 animate-fade-in"
          bind:this={paletteRef}
        >
          <div
            class="absolute -top-2 left-4 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-white"
          ></div>

          <OperatorPalette
            on:select={(e) => addOperator(e.detail)}
            on:close={() => (showPalette = false)}
          />
        </div>
      {/if}
    </div>

    <button
      class="h-9 px-4 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-full"
      on:click={() => console.log("Generate with LLM")}
    >
      🧠 Generate Rule (LLM)
    </button>
  </div>

  <div class="flex flex-col gap-3">
    <PipelineEditor />
  </div>
</div>
