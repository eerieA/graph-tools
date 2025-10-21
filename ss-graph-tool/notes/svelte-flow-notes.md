<!-- TOC -->

- [On defining custom nodes and edges](#on-defining-custom-nodes-and-edges)
    - [dialogueTypes.ts are Domain Models](#dialoguetypests-are-domain-models)
    - [DialogueNode.svelte (and similar) are view/UI components](#dialoguenodesvelte-and-similar-are-viewui-components)
    - [adaptDialogueGraphToFlow.ts is data mapper](#adaptdialoguegraphtoflowts-is-data-mapper)
- [Why useOnSelectionChange in a helper component for the side panel](#why-useonselectionchange-in-a-helper-component-for-the-side-panel)
- [Dialogue Graph UI Layout Persistence (Svelte Flow + Svelte Store)](#dialogue-graph-ui-layout-persistence-svelte-flow--svelte-store)

<!-- /TOC -->

# On defining custom nodes and edges

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

- Takes a DialogueGraph from our game logic layer.
- Produces arrays of Node and Edge objects that the editor can render.

# Why useOnSelectionChange in a helper component for the side panel

The goal was to detect when a node is being selected, and display some details carried on that node in a side panel. For that we decided to use `useOnSelectionChange`.

But, if we call `useOnSelectionChange` in the same component who also creates \<SvelteFlow\>, errors will occur. This is  useStore (and therefore useOnSelectionChange) needs the Svelte Flow context to exist before we call it. You attempted to call the hook from the same component that creates \<SvelteFlow\>, but the hook ran too early (module init), before the provider/context was available - so Svelte Flow complained.

✅ 1. useOnSelectionChange in a Helper Component

Works because:
- It’s a hook designed to listen to Flow’s internal event system, not DOM events.
- It must be called inside the context of a \<SvelteFlow /\> instance (i.e., within its provider).
- By placing it in a child component that’s rendered inside \<SvelteFlow\>, it gains access to that context.
- When a node is clicked, Svelte Flow updates its internal selection store, and this hook receives that update.

Result:
✔️ Reacts reliably to node selection (including clicks and deselections).

❌ 2. useOnSelectionChange in the Same Component as \<SvelteFlow\>

Does not work because:
- When called at the same level as \<SvelteFlow\>, the hook executes before a Flow context exists.
- The error “To call useStore outside of \<SvelteFlow /\> we need to wrap our component in a \<SvelteFlowProvider /\> confirms that it’s outside the provider scope.
- In this situation, the hook has no access to the internal store, so it throws or silently fails.

Result:
⚠️ Crashes or fails to respond - no Flow context yet exists.

❌ 3. on:nodeclick={handleNodeClick}

Does not work because:
- \<SvelteFlow\> does not emit a nodeclick event as a Svelte custom event.
- Svelte’s on:event syntax only works if the component explicitly calls dispatch('eventName').
- Since @xyflow/svelte doesn’t define or dispatch nodeclick, Svelte never receives anything to handle.

Also note that although the general Svelte event `onClick` does react to a node click, it does not emit info about a Svelte Flow node. So we still need something that is Svelte Flow native.

Result:
🚫 No event ever fires - nothing printed to console.

# Dialogue Graph UI Layout Persistence (Svelte Flow + Svelte Store)

When a user drags and repositions nodes in the graph editor, the updated coordinates are automatically stored in localStorage.

On the next app launch, the layout is restored from that data, ensuring consistent node positions across sessions.

**Data Flow Summary**

| Step | Trigger                     | Action                                       | Effect                                        | file |
| ---- | --------------------------- | -------------------------------------------- | --------------------------------------------- | ----------- |
| 1️⃣  | User drags and drops a node | `SvelteFlow` updates the bound `nodes` array | `$:` reactive block detects changed positions | DialogueGraphEditor.ts
| 2️⃣  | `$:` block executes         | Calls `nodePositions.set(newPositions)`      | Updates the Svelte store                      | DialogueGraphEditor.ts |
| 3️⃣  | Store subscription fires    | Writes new layout to `localStorage`          | Persists node coordinates                     | graphLayoutStore.ts |
| 4️⃣  | App reloads                 | Store initializes from `localStorage`        | Graph layout is restored                      | graphAdapter.ts |

**End-to-End Behavior**

1. The user moves a node.
1. SvelteFlow updates the nodes array (reactive variable).
1. $: block detects coordinate change → updates nodePositions store.
1. Store subscription writes to localStorage.
1. On next load, saved positions are restored automatically.