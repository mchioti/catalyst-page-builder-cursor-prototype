import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Personas for simulating different user types
export type Persona = 'end-user' | 'designer' | 'admin'

// Console mode for multi-website vs single-website view
export type ConsoleMode = 'multi' | 'single'

interface PrototypeState {
  // Current simulated persona
  persona: Persona
  setPersona: (persona: Persona) => void
  
  // Console mode
  consoleMode: ConsoleMode
  setConsoleMode: (mode: ConsoleMode) => void
  
  // Escape hatch visibility (for when user explicitly hides it)
  escapeHatchVisible: boolean
  setEscapeHatchVisible: (visible: boolean) => void
  
  // Escape hatch drawer open state (for content pushing)
  drawerOpen: boolean
  setDrawerOpen: (open: boolean) => void
  
  // Helper to check if current persona can perform actions
  canEdit: () => boolean
  canAccessDesignConsole: () => boolean
}

export const usePrototypeStore = create<PrototypeState>()(
  persist(
    (set, get) => ({
      // Default to admin persona (full access for prototype testing)
      persona: 'admin',
      setPersona: (persona) => set({ persona }),
      
      // Default to multi-website mode
      consoleMode: 'multi',
      setConsoleMode: (consoleMode) => set({ consoleMode }),
      
      // Escape hatch visible by default
      escapeHatchVisible: true,
      setEscapeHatchVisible: (escapeHatchVisible) => set({ escapeHatchVisible }),
      
      // Drawer open state (default closed)
      drawerOpen: false,
      setDrawerOpen: (drawerOpen) => set({ drawerOpen }),
      
      // Permission helpers based on persona
      canEdit: () => {
        const { persona } = get()
        return persona === 'designer' || persona === 'admin'
      },
      
      canAccessDesignConsole: () => {
        const { persona } = get()
        return persona === 'admin'
      }
    }),
    {
      name: 'prototype-store',
      version: 1
    }
  )
)

