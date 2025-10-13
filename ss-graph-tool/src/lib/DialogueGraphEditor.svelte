<script lang="ts">
  import { Background, Controls, MiniMap, SvelteFlow, type Node, type Edge } from '@xyflow/svelte';
  import '@xyflow/svelte/dist/style.css';

  let nodes: Node[] = [
    {
      id: 'sbn364',
      type: 'default',
      position: { x: 0, y: 0 },
      data: { label: 'Inner Doubt: “You can’t do this.”' },
    },
    {
      id: 'sbn465973',
      type: 'default',
      position: { x: 250, y: 0 },
      data: { label: 'Inner Doubt: “Remember last time? You froze.”' },
    },
  ];

  let edges: Edge[] = [
    {
      id: 'sbnl48770',
      source: 'sbn364',
      target: 'sbn465973',
      label: 'Linear link',
      animated: false,
    },
  ];
</script>

<div class="graph-container">
  <SvelteFlow {nodes} {edges} fitView>
    <Background />
    <MiniMap />
    <Controls />
  </SvelteFlow>
</div>

<style>
  /* Fullscreen layout */
  .graph-container {
    width: 100vw;
    height: 100vh;
  }

  /* Style the default node using built-in style name */
  :global(.svelte-flow__node-default) {
    background: #1e1e1e;
    color: #eee;
    border: 1px solid #444;
    border-radius: 8px;
    padding: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    font-family: system-ui;
  }

  /* Style the edge labels using built-in style name */
  :global(.svelte-flow__edge-label) {
    font-size: 10px;
    font-family: system-ui;
  }
</style>
