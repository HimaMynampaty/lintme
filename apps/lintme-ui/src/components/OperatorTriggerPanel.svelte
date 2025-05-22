<script>
  import OperatorPalette from './OperatorPalette.svelte';

  let showPalette = false;

  function togglePalette() {
    showPalette = !showPalette;
  }

  function closePalette() {
    showPalette = false;
  }
</script>

<div class="operator-panel">
  <button on:click={togglePalette} class="add-operator-btn">➕</button>

  {#if showPalette}
    <div class="palette-popup">
      <div class="popup-header">
        <span class="title">Search Operators</span>
        <button class="close-btn" on:click={closePalette}>×</button>
      </div>
      <OperatorPalette />
    </div>
  {/if}

</div>

<style>
  .operator-panel {
    margin-bottom: 12px;
    padding: 16px;
    background-color: #fafafa;
    border: 1px solid #ddd;
    border-radius: 10px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  }

  .add-operator-btn {
    width: 32px;
    height: 32px;
    font-size: 18px;
    font-weight: bold;
    padding: 0;
    border-radius: 50%;
    border: 1px solid #ccc;
    background-color: white;
    color: #333;
    cursor: pointer;
  }

  .add-operator-btn:hover {
    background-color: #f0f0f0;
  }

  .palette-popup {
    position: relative;
    border-radius: 8px;
    padding: 12px;
    margin-top: 10px;
    background-color: white;
    border: 1px solid #ccc;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  }

  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .popup-header .title {
    font-weight: bold;
    font-size: 14px;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    padding: 0;
    line-height: 1;
  }

  .close-btn:hover {
    color: #c53030;
  }
</style>
