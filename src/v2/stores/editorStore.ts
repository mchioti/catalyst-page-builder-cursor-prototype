/**
 * V2 Editor Store
 * Manages editor state (current page being edited, selection, etc.)
 */

import { create } from 'zustand'
import type { SectionCompositionItem } from '../types/core'

interface EditorState {
  // Current editing context
  websiteId: string | null
  pageId: string | null
  
  // Canvas state
  composition: SectionCompositionItem[]
  
  // Selection
  selectedSectionId: string | null
  selectedWidgetId: string | null
  
  // Actions
  setEditingContext: (websiteId: string, pageId: string) => void
  clearEditingContext: () => void
  
  setComposition: (composition: SectionCompositionItem[]) => void
  addSection: (section: SectionCompositionItem, position?: number) => void
  updateSection: (id: string, updates: Partial<SectionCompositionItem>) => void
  removeSection: (id: string) => void
  reorderSections: (fromIndex: number, toIndex: number) => void
  
  setSelectedSection: (id: string | null) => void
  setSelectedWidget: (id: string | null) => void
  
  // Save/discard
  hasUnsavedChanges: boolean
  markAsSaved: () => void
  markAsUnsaved: () => void
}

export const useEditorStore = create<EditorState>((set, get) => ({
  websiteId: null,
  pageId: null,
  composition: [],
  selectedSectionId: null,
  selectedWidgetId: null,
  hasUnsavedChanges: false,
  
  setEditingContext: (websiteId, pageId) => set({
    websiteId,
    pageId,
    selectedSectionId: null,
    selectedWidgetId: null
  }),
  
  clearEditingContext: () => set({
    websiteId: null,
    pageId: null,
    composition: [],
    selectedSectionId: null,
    selectedWidgetId: null,
    hasUnsavedChanges: false
  }),
  
  setComposition: (composition) => set({ composition }),
  
  addSection: (section, position) => set((state) => {
    const newComposition = [...state.composition]
    if (position !== undefined) {
      newComposition.splice(position, 0, section)
    } else {
      newComposition.push(section)
    }
    return {
      composition: newComposition,
      hasUnsavedChanges: true
    }
  }),
  
  updateSection: (id, updates) => set((state) => ({
    composition: state.composition.map(section =>
      section.id === id ? { ...section, ...updates } : section
    ),
    hasUnsavedChanges: true
  })),
  
  removeSection: (id) => set((state) => ({
    composition: state.composition.filter(section => section.id !== id),
    selectedSectionId: state.selectedSectionId === id ? null : state.selectedSectionId,
    hasUnsavedChanges: true
  })),
  
  reorderSections: (fromIndex, toIndex) => set((state) => {
    const newComposition = [...state.composition]
    const [movedSection] = newComposition.splice(fromIndex, 1)
    newComposition.splice(toIndex, 0, movedSection)
    return {
      composition: newComposition,
      hasUnsavedChanges: true
    }
  }),
  
  setSelectedSection: (id) => set({
    selectedSectionId: id,
    selectedWidgetId: null  // Clear widget selection when selecting section
  }),
  
  setSelectedWidget: (id) => set({ selectedWidgetId: id }),
  
  markAsSaved: () => set({ hasUnsavedChanges: false }),
  
  markAsUnsaved: () => set({ hasUnsavedChanges: true })
}))

