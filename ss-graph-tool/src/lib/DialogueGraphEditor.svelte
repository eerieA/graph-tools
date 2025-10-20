<script lang="ts">
  import {
    SvelteFlow,
    SvelteFlowProvider,
    Background,
    Controls,
    MiniMap,
    type Node,
    type Edge,
  } from '@xyflow/svelte';
  import '@xyflow/svelte/dist/style.css';

  import DialogueNode from './nodes/DialogueNode.svelte';
  import SelectionSubscriber from './SelectionSubscriber.svelte';
  import NodeInspector from './NodeInspector.svelte';
  import EdgeInspector from './EdgeInspector.svelte';
  import { nodePositions, loadPositions } from './storage/graphLayoutStore';
  import { adaptDialogueGraphToFlow } from './utils/graphAdapter';
  import { sampleGraph } from './data/sampleGraph';
  import { onMount } from 'svelte';

  const nodeTypes = { dialogueNode: DialogueNode };

  // Will be assigned once we load the layout
  let nodes: Node[] = [];
  let edges: Edge[] = [];

  // For detecting selected node or edge
  let selectedNode: Node | null = null;
  let selectedEdge: Edge | null = null;
  let prevPositions: Record<string, { x: number; y: number }> = {};

  // For cycle prevention
  let prevEdges: Edge[] = [];

  // ---------- simple toast ----------
  let warning: string | null = null;
  let warnTimeout: any = null;
  function showWarning(msg: string) {
    warning = msg;
    clearTimeout(warnTimeout);
    warnTimeout = setTimeout(() => (warning = null), 2500);
    console.warn(msg);
  }

  // ---------- helpers ----------
  function buildAdjacency(edgesArr: Edge[]) {
    const adj: Record<string, string[]> = {};
    for (const e of edgesArr) {
      if (!adj[e.source]) adj[e.source] = [];
      if (!adj[e.target]) adj[e.target] = adj[e.target] ?? [];
      adj[e.source].push(e.target);
    }
    return adj;
  }

  // DFS path check: is there a path from `from` to `to`?
  function hasPath(adj: Record<string, string[]>, from: string, to: string) {
    if (from === to) return true;
    const visited = new Set<string>();
    const stack = [from];
    while (stack.length) {
      const cur = stack.pop()!;
      if (cur === to) return true;
      if (visited.has(cur)) continue;
      visited.add(cur);
      const neighbors = adj[cur] || [];
      for (const nb of neighbors) stack.push(nb);
    }
    return false;
  }

  // ---------- edge cycle prevention ----------
  $: if (edges) {
    // detect newly added edges
    const added = edges.filter((e) => !prevEdges.some((pe) => pe.id === e.id));

    for (const newEdge of added) {
      // if attemped edge is from the same node then that is a self-loop
      if (newEdge.source === newEdge.target) {
        edges = edges.filter((e) => e.id !== newEdge.id);
        showWarning('Cannot create self-loop in dialogue graphs.');
        continue;
      }

      // build adjacency from previous edges (before this edge)
      const adjBefore = buildAdjacency(prevEdges);

      // if already a path from target to source then attempted edge would form cycle
      if (hasPath(adjBefore, newEdge.target, newEdge.source)) {
        edges = edges.filter((e) => e.id !== newEdge.id);
        showWarning('Cannot create edge: it would form a cycle in the dialogue graph.');
        continue;
      }
    }

    // Update prevEdges to match the (possibly modified) current edges for next check
    prevEdges = edges.map((e) => ({ ...e }));
  }

  // generate a reasonably unique id for new edges
  function genEdgeId() {
    return `edge_${Date.now().toString(36)}_${Math.floor(Math.random() * 1000)}`;
  }

  // onMount: await for layout to load bcz it is async, then adapt graph and initialize nodes and edges
  // If we don't use onMount to await for the positions, the saved json file will not be read in time
  onMount(async () => {
    await loadPositions();

    const adapted = await adaptDialogueGraphToFlow(sampleGraph);
    nodes = adapted.nodes;
    edges = adapted.edges;

    // Seed prevPositions for saving
    prevPositions = Object.fromEntries(
      nodes.map((n) => [n.id, { x: n.position.x, y: n.position.y }])
    );

    // Seed prevEdges for cycle prevention
    prevEdges = edges.map((e) => ({ ...e }));
  });

  // ---------- event handlers ----------

  // Called when SvelteFlow emits a "connect" event (user links two handles)
  // e.detail should contain { source, target, sourceHandle, targetHandle }
  function handleConnect(evt: CustomEvent) {
    const { source, target, label } = evt.detail;
    if (!source || !target) return;

    // add edge (SvelteFlow may not add automatically)
    const exists = edges.some((e) => e.source === source && e.target === target);
    if (!exists) {
      edges = [...edges, { id: genEdgeId(), source, target, label: label ?? '', type: 'default' }];
    }
  }

  // Called from SelectionSubscriber via prop
  function handleNodeSelect(node: Node | null) {
    selectedNode = node;
  }

  function handleEdgeSelect(edge: Edge | null) {
    selectedEdge = edge;
  }

  // ---------- reactively detects node changes ----------

  $: if (nodes && nodes.length) {
    const changed = nodes.some((n) => {
      const prev = prevPositions[n.id];
      return !prev || prev.x !== n.position.x || prev.y !== n.position.y;
    });

    if (changed) {
      // Update storage
      const newPositions: Record<string, { x: number; y: number }> = {};
      for (const n of nodes) {
        newPositions[n.id] = { x: n.position.x, y: n.position.y };
      }

      nodePositions.set(newPositions);
      prevPositions = newPositions;
      // console.log('Updated node positions in store:', newPositions);
    }
  }
</script>

<SvelteFlowProvider>
  <div style="display:flex; height:100vh;">
    <div style="width:100%; height:100%;">
      <SvelteFlow bind:nodes bind:edges {nodeTypes} fitView on:connect={handleConnect}>
        <Background />
        <MiniMap />
        <Controls />
      </SvelteFlow>
    </div>

    <aside style="width:280px; background:#1d1d1d; color:#ddd; padding:12px;">
      <!-- Listen to selection changes -->
      <SelectionSubscriber onSelectNode={handleNodeSelect} onSelectEdge={handleEdgeSelect} />
      <!-- Side panel -->
      {#if selectedNode}
        <NodeInspector {selectedNode} />
      {:else if selectedEdge}
        <EdgeInspector {selectedEdge} />
      {:else}
        <p class="empty">Click a node or edge to view details.</p>
      {/if}
    </aside>
  </div>
</SvelteFlowProvider>

{#if warning}
  <div class="toast">{warning}</div>
{/if}

<style>
  .toast {
    position: fixed;
    right: 20px;
    bottom: 20px;
    background: #b24a4a;
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
    font-family: system-ui;
  }

  :global(.svelte-flow__edge-label) {
    font-size: 10px;
    font-family: system-ui;
    color: #ccc;
  }

  .empty {
    color: #777;
    font-style: italic;
  }
</style>
