# Notes on defining custom nodes and edges

Rough summary:

| Layer                 | Responsibility                   | Knows about                       |
| --------------------- | -------------------------------- | --------------------------------- |
| `dialogueTypes.ts`    | Domain data (game logic)         | Dialogue semantics, game systems  |
| `DialogueNode.svelte` | Visual node UI                   | SvelteFlow rendering              |
| `graphAdapter.ts`     | Data translation between the two | Both structures                   |
| `GraphEditor.svelte`  | Editor orchestration             | UI logic, reactivity, interaction |

## dialogueTypes.ts are Domain Models

Source of truth. This is what the gameplay logic, serialization, save/load, or dialogue runtime will use. The things these files should look very similar to the conceptual data structures we designed.

For example
```
export interface DialogueNode {
  id: string;
  speaker: string;
  text: string;
  choices?: string[];
  events_out?: string[];
  // etc.
}
```

## DialogueNode.svelte (and similar) are view/UI components

These are visual representations of those domain objects: how a DialogueNode looks in our editor.

Example responsibilities:

- Display the speaker and text nicely.
- Provide Handles for graph connections.
- Possibly have inline editing later (contenteditable, modals, etc.).
- Style things by type (e.g., Choice links vs Linear links).

We could think of them as render templates for the domain data models.

## adaptDialogueGraphToFlow.ts is data mapper

These utilities convert between domain models and Svelte Flow view models.

Svelte Flow doesn’t understand what a “DialogueNode” or “DialogueLink” means.
It only knows Node and Edge objects with { id, data, position } and { id, source, target }.

So this function handles that translation:

- Takes a DialogueGraph from your game logic layer.
- Produces arrays of Node and Edge objects that the editor can render.