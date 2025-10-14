import type { DialogueGraph } from './dialogueTypes';

export const sampleGraph: DialogueGraph = {
  id: 'dlg_test_1',
  entry_node: 'd1',
  nodes: [
    {
      id: 'd1',
      speaker: 'NPC_merchant',
      text: 'Hello traveler. Looking for something rare?',
    },
    {
      id: 'd2',
      speaker: 'Player',
      text: 'Show me what you have.',
    },
    {
      id: 'd3',
      speaker: 'Player',
      text: 'Not today. Just passing by.',
    },
  ],
  links: [
    {
      id: 'link_1',
      type: 'Choice',
      text: 'Show me your goods.',
      prev_node: 'd1',
      next_node: 'd2',
    },
    {
      id: 'link_2',
      type: 'Choice',
      text: 'Maybe later.',
      prev_node: 'd1',
      next_node: 'd3',
    },
  ],
};
