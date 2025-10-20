<!-- This file holds the ui model for a dialogue node, which is different than the one in dialogueTypes.ts -->
<script lang="ts">
  import { Handle, Position, type NodeProps } from '@xyflow/svelte'

  // Props expected from Svelte Flow
  export let id: string
  export let data: {
    name: string
    speaker?: string
    text: string
    conditions_in?: string[]
    events_out?: string[]
    choices?: string[]
    next_node?: string
    tags?: string[]
    isEntry?: boolean
  }
  export let selected: boolean = false
</script>

<div class="dialogue-node {selected ? 'selected' : ''} {data.isEntry ? 'entry' : ''}">
  <!-- Incoming connection point -->
  <Handle type="target" position={Position.Top} />

  <!-- name, speaker and dialogue preview -->
  <div class="name">{data.name ?? '???'}</div>
  <div class="speaker">{data.speaker ?? '???'}</div>
  <div class="text">{data.text}</div>

  <!-- Summary / tags section -->
  <div class="summary">
    {#if data.tags?.length}
      <div class="tags">
        {#each data.tags.slice(0, 2) as tag}
          <span class="tag">{tag}</span>
        {/each}
        {#if data.tags.length > 2}
          <span class="tag more">+{data.tags.length - 2}</span>
        {/if}
      </div>
    {/if}

    <div class="meta">
      {#if data.conditions_in?.length}
        <span class="meta-item" title="Conditions required">⚙️ {data.conditions_in.length}</span>
      {/if}
      {#if data.events_out?.length}
        <span class="meta-item" title="Events on activation">🎬 {data.events_out.length}</span>
      {/if}
      <!-- {#if data.choices?.length}
        <span class="meta-item" title="Player choices">🌿 {data.choices.length}</span>
      {/if} -->
    </div>
  </div>

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
    width: 160px;           /* fixed width for consistency */
    word-wrap: break-word;  /* wrap text to next line */
    overflow: hidden;
    white-space: normal;
    text-overflow: ellipsis;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
    text-align: left;
    transition: border 0.1s, background 0.1s;
  }

  .dialogue-node.selected {
    border-color: #66ccff;
    background: #2a2a2a;
  }

  .dialogue-node.entry {
    background-color: #468fb1;
    border-color: #649dcc;
    box-shadow: 0 0 6px #66faff60;
  }

  .name {
    font-weight: 600;
    font-style: italic;
    margin-bottom: 4px;
  }

  .speaker {
    font-weight: 600;
    color: #ffd580;
  }

  .text {
    font-size: 12px;
    color: #ddd;
    line-height: 1.3em;
    max-height: 2.8em;  /* pair with word-wrap option to cut off texts; ~1.4 em per line so e.g. 2.8em limits it to 2 lines. */
    overflow: hidden;
  }

  .summary {
    margin-top: 6px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 2px;
  }

  .tag {
    background: #333;
    color: #ccc;
    border-radius: 4px;
    padding: 1px 4px;
    font-size: 10px;
  }

  .tag.more {
    background: #555;
    color: #aaa;
  }

  .meta {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    font-size: 10px;
    color: #aaa;
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 2px;
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
