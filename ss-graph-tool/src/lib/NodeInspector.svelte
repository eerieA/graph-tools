<script lang="ts">
  import type { Node } from '@xyflow/svelte';
  import nodeIcon from './assets/node.png';
  export let selectedNode: Node | null = null;
</script>

<aside class="inspector">
  {#if selectedNode}
    <h3>
      <img src={nodeIcon} alt="Node Icon" class="icon" />
      Node Details
    </h3>
    <hr />

    <div class="field">
      <div class="field-label">ID</div>
      <span>{selectedNode.id}</span>
    </div>

    {#each Object.entries(selectedNode.data ?? {}) as [key, value]}
      <div class="field">
        <div class="field-label">{key}</div>
        {#if typeof value === 'object'}
          <pre class="field-value">{JSON.stringify(value, null, 2)}</pre>
        {:else}
          <span class="field-value">{value}</span>
        {/if}
      </div>
    {/each}
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
  .icon {
    width: 18px;
    height: 18px;
    object-fit: contain;
    filter: brightness(0) saturate(100%) invert(68%) sepia(63%) saturate(748%) hue-rotate(164deg)
      brightness(97%) contrast(97%);
  }

  .field {
    margin-bottom: 0.8em;
  }

  .field-label {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: #999;
    margin-bottom: 2px;
  }

  .field-value {
    display: block;
    font-size: 16px;
    color: #ddd;
    white-space: pre-wrap; /* preserves newlines and wraps long lines */
    word-break: break-word;
    padding-left: 8px; /* slight indentation for readability */
  }

  .field-value pre {
    margin: 0;
    font-family: monospace; /* make nested JSON easier to read */
    white-space: pre-wrap; /* wrap long lines */
  }

  span {
    display: block;
    font-size: 16px;
    color: #ddd;
    word-break: break-word;
  }
</style>
