import type { DialogueGraph, DialogueNode, DialogueLink } from '../models/dialogueTypes';
import type { Node, Edge } from '@xyflow/svelte';

export function toFlowNodes(dialogue: DialogueGraph): Node[] {
  return dialogue.nodes.map((n, i) => ({
    id: n.id,
    type: 'dialogueNode',
    position: { x: i * 250, y: 100 },
    data: { label: `${n.speaker ?? '???'}: ${n.text}` },
  }));
}

export function toFlowEdges(dialogue: DialogueGraph): Edge[] {
  return dialogue.links.map((l) => ({
    id: l.id,
    source: l.prev_node,
    target: l.next_node,
    label: l.text ?? l.type,
    animated: l.type === 'Conditional',
    style: 'stroke-width: 2;',
  }));
}
