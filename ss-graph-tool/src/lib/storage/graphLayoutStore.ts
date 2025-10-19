// src/lib/storage/graphLayoutStore.ts
import { writable, type Writable } from 'svelte/store'

export type NodePositions = Record<string, { x: number; y: number }>

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
if (typeof window !== 'undefined') {
  nodePositions.subscribe(val => {
    localStorage.setItem('nodePositions', JSON.stringify(val))
  })
}
