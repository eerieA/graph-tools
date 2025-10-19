import { writable, type Writable } from 'svelte/store'
import { invoke } from '@tauri-apps/api/core'

export type NodePositions = Record<string, { x: number; y: number }>

// --- Helper: debounce function ---
function debounce<T extends (...args: any[]) => void>(fn: T, delay = 300): T {
  let timeout: ReturnType<typeof setTimeout>
  return ((...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => fn(...args), delay)
  }) as T
}

// Writable store
export const nodePositions: Writable<NodePositions> = writable({})

// internal loaded flag & promise so callers can await initial load
let _loaded = false
let _loadPromise: Promise<void> | null = null

export function isLoaded () {
  return _loaded
}

/**
 * Asynchronously load positions from disk (Tauri backend).
 * Safe to call multiple times; returns same promise while loading.
 */
export function loadPositions (): Promise<void> {
  if (_loaded) return Promise.resolve()
  if (_loadPromise) return _loadPromise

  _loadPromise = (async () => {
    // Only run in browser / Tauri environment
    if (typeof window === 'undefined') {
      // SSR or build: nothing to do
      _loaded = true
      return
    }

    try {
      const json = await invoke<string>('load_layout_from_disk')
      if (json && json.length > 0) {
        try {
          const parsed: NodePositions = JSON.parse(json)
          nodePositions.set(parsed)
          console.log('✅ Loaded node positions from disk')
        } catch (parseErr) {
          console.warn('Failed to parse node positions JSON:', parseErr)
          nodePositions.set({})
        }
      } else {
        // no file yet, set empty
        nodePositions.set({})
        console.log('No saved node positions on disk (first run)')
      }
    } catch (err) {
      // invocation failed (no file or other error). initialize empty.
      console.warn('load_layout_from_disk invoke failed:', err)
      nodePositions.set({})
    } finally {
      _loaded = true
    }
  })()

  return _loadPromise
}

// --- Save to disk (debounced) ---
const saveToDisk = debounce(async (val: NodePositions) => {
  if (typeof window === 'undefined') return // guard
  try {
    await invoke('save_layout_to_disk', {
      jsonData: JSON.stringify(val, null, 2)
    })
    console.log('💾 Saved node positions to disk');
  } catch (err) {
    console.error('Failed to save node positions to disk:', err)
  }
}, 300)

// Subscribe to store changes to trigger save (only in browser)
if (typeof window !== 'undefined') {
  nodePositions.subscribe(val => {
    // if not loaded yet, still safe, bcz save will persist whatever value is set.
    saveToDisk(val)
  })
}
