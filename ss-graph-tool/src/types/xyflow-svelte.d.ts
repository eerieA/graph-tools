// This file fixes the TypeScript error:
//   "Argument of type '"connect"' is not assignable to parameter of type 'never'"
// caused by @xyflow/svelte missing a `connect` event type for <SvelteFlow>.
//
// Svelte's type checker validates `on:event` directives against the `Events` type
// of components that extend `SvelteComponentTyped<Props, Events, Slots>`.
// Here we re-declare SvelteFlow with an explicit `connect` event to inform the checker.
import type { SvelteComponentTyped } from 'svelte';

declare module '@xyflow/svelte' {
  // Re-declare SvelteFlow as a subclass of SvelteComponentTyped
  export class SvelteFlow extends SvelteComponentTyped<
    Record<string, any>, // props
    {
      connect: CustomEvent<{ source: string; target: string; label?: string }>;
    },
    Record<string, any> // slots
  > {}
}
