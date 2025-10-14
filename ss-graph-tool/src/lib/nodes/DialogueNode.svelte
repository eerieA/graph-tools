<script lang="ts">
  import { Handle, Position, type NodeProps } from '@xyflow/svelte';

  export let id: string;
  export let data: { speaker?: string; text: string };
  export let selected: boolean = false;
</script>

<div class="dialogue-node {selected ? 'selected' : ''}">
  <!-- Incoming connection point -->
  <Handle type="target" position={Position.Top} />

  <div class="speaker">{data.speaker ?? '???'}</div>
  <div class="text">{data.text}</div>

  <!-- Outgoing connection point -->
  <Handle type="source" position={Position.Bottom} />
</div>

<style>
  .dialogue-node {
    background: #1f1f1f;
    border: 1px solid #444;
    border-radius: 8px;
    padding: 8px 10px;
    color: #eee;
    font-family: system-ui, sans-serif;
    font-size: 12px;
    width: 140px;             /* fixed width for consistency */
    word-wrap: break-word;    /* wrap text to next line */
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: normal;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
    transition: border 0.1s, background 0.1s;
    text-align: left;
  }

  .dialogue-node.selected {
    border-color: #66ccff;
    background: #2a2a2a;
  }

  .speaker {
    font-weight: 600;
    color: #ffd580;
    margin-bottom: 4px;
  }

  .text {
    font-size: 12px;
    color: #ddd;
    line-height: 1.3em;
    max-height: 2.8em;  /* pair with word-wrap option to cut off texts; ~1.4 em per line so e.g. 2.8em limits it to 2 lines. */
    overflow: hidden;
  }

  :global(.svelte-flow__handle) {
    background: #999;
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  :global(.svelte-flow__handle:hover) {
    background: #66ccff;
  }
</style>
