export type LinkType = 'Linear' | 'Choice' | 'Conditional';

export interface CommonNode {
  id: string;
  text: string;
  speaker?: string;
  events_out?: string[];
  next_node?: string;     // for linear flows
  choices?: string[];     // for branching
}

export interface DialogueNode extends CommonNode {
  conditions_in?: string[];
  tags?: string[];
}

export interface DialogueLink {
  id: string;
  type: LinkType;
  text?: string;          // only used for Choice
  conditions_in?: string[];
  events_out?: string[];
  prev_node: string;      // source node id
  next_node: string;      // target node id
}

export interface DialogueGraph {
  id: string;
  nodes: DialogueNode[];
  links: DialogueLink[];
  conditions_in?: string[];
  entry_node?: string;
  tags?: string[];
}
