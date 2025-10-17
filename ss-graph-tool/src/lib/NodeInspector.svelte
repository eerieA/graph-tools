<!-- src/lib/NodeInspector.svelte -->
<script lang="ts">
  import type { Node } from '@xyflow/svelte';

  export let selectedNode: Node | null = null;
</script>

<aside class="inspector">
  {#if selectedNode}
    <h3>Selected Node</h3>

    <div class="field">
      <div class="field-label">ID</div>
      <span>{selectedNode.id}</span>
    </div>

    {#each Object.entries(selectedNode.data ?? {}) as [key, value]}
      <div class="field">
        <div class="field-label">{key}</div>
        <span>{typeof value === 'object' ? JSON.stringify(value, null, 2) : value}</span>
      </div>
    {/each}
  {:else}
    <p class="empty">Click a node to view details.</p>
  {/if}
</aside>

<style>
  .inspector {
    width: 280px;
    background: #1d1d1d;
    color: #ddd;
    padding: 12px;
    font-family: system-ui;
    overflow-y: auto;
  }

  h3 {
    color: #66ccff;
    margin-bottom: 8px;
  }

  .field {
    margin-bottom: 0.6em;
  }

  .field-label {
    display: block;
    font-size: 14px;
    color: #999;
    margin-bottom: 2px;
  }

  span {
    display: block;
    font-size: 16px;
    color: #ddd;
    word-break: break-word;
  }

  .empty {
    color: #777;
    font-style: italic;
  }
</style>
