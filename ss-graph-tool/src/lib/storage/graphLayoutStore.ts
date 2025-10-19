// src/lib/storage/graphLayoutStore.ts
import { writable, type Writable } from 'svelte/store'

export type NodePositions = Record<string, { x: number; y: number }>

// --- Helper: debounce function ---
function debounce<T extends (...args: any[]) => void>(fn: T, delay = 300): T {
  let timeout: ReturnType<typeof setTimeout>
  return ((...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => fn(...args), delay)
  }) as T
}

let initial: NodePositions = {}

// Only read from localStorage if we're in the browser
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('nodePositions')
  if (stored) {
    try {
      initial = JSON.parse(stored)
    } catch (err) {
      console.warn('Failed to parse stored node positions:', err)
    }
  }
}

export const nodePositions: Writable<NodePositions> = writable(initial)

// Only write to localStorage if we're in the browser
// Debounced save with a reasonable time interval
if (typeof window !== 'undefined') {
  const saveToLocalStorage = debounce((val: NodePositions) => {
    try {
      localStorage.setItem('nodePositions', JSON.stringify(val))
      console.log('💾 Saved node positions (debounced)');
    } catch (err) {
      console.warn('Failed to save node positions:', err)
    }
  }, 300)

  nodePositions.subscribe(saveToLocalStorage)
}
