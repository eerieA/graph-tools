import type { DialogueGraph } from '../models/dialogueTypes';
import type { Node, Edge } from '@xyflow/svelte';

export function adaptDialogueGraphToFlow(graph: DialogueGraph): {
  nodes: Node[];
  edges: Edge[];
} {
  const nodes: Node[] = graph.nodes.map((n) => ({
    id: n.id,
    // must match the custom node name registered in SvelteFlow, e.g. in ./src/lib/DialogueGraphEditor.svelte
    type: 'dialogueNode',
    position: { x: Math.random() * 400, y: Math.random() * 300 },
    data: {
      speaker: n.speaker,
      text: n.text,
    },
  }));

  const edges: Edge[] = graph.links.map((l) => ({
    id: l.id,
    source: l.prev_node,   // Svelte Flow expects these names
    target: l.next_node,
    type: 'default',       // could later be customized (conditional, choice, etc.)
    label: l.text ?? '',
  }));

  return { nodes, edges };
}
