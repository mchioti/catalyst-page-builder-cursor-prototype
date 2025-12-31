/**
 * Canvas Store - Manages the page builder canvas
 * 
 * Controls canvas items, selection, and widget operations.
 * This is the core editing state for the page builder.
 */

import { create } from 'zustand'
import { nanoid } from 'nanoid'
import { arrayMove } from '@dnd-kit/sortable'
import type { 
  CanvasItem, 
  Widget, 
  WidgetSection,
  ContentBlockLayout,
  CustomSection,
  CustomStarterPage
} from '../types/widgets'
import { mockStarterPages } from '../data/mockStarterPages'
import { mockSections } from '../data/mockSections'
import { createDebugLogger } from '../utils/logger'

// Control logging for this file
const DEBUG = false
const debugLog = createDebugLogger(DEBUG)

// =============================================================================
// LocalStorage Helpers
// =============================================================================

const STORAGE_KEYS = {
  CUSTOM_STARTER_PAGES: 'catalyst-custom-starter-pages',
  CUSTOM_SECTIONS: 'catalyst-custom-sections'
}

const dateReviver = (_key: string, value: any) => {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
    return new Date(value)
  }
  return value
}

const loadFromLocalStorage = <T,>(key: string, defaultValue: T[]): T[] => {
  try {
    const stored = localStorage.getItem(key)
    if (!stored) return defaultValue
    return JSON.parse(stored, dateReviver)
  } catch (error) {
    debugLog('error', `Failed to load ${key} from localStorage:`, error)
    return defaultValue
  }
}

const saveToLocalStorage = <T,>(key: string, data: T[]) => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    debugLog('error', `Failed to save ${key} to localStorage:`, error)
  }
}

const initializeCustomStarterPages = () => {
  const userCreatedPages = loadFromLocalStorage(STORAGE_KEYS.CUSTOM_STARTER_PAGES, [])
  return [...mockStarterPages, ...userCreatedPages]
}

const initializeCustomSections = () => {
  const userCreatedSections = loadFromLocalStorage(STORAGE_KEYS.CUSTOM_SECTIONS, [])
  return [...mockSections, ...userCreatedSections]
}

// =============================================================================
// Type Guard
// =============================================================================

function isSectionGuard(item: CanvasItem): item is WidgetSection {
  return 'areas' in item && Array.isArray((item as WidgetSection).areas)
}

// =============================================================================
// Types
// =============================================================================

export interface CanvasState {
  // Canvas State
  canvasItems: CanvasItem[]
  routeCanvasItems: Record<string, CanvasItem[]>
  globalTemplateCanvas: CanvasItem[]
  journalTemplateCanvas: Record<string, CanvasItem[]>
  
  // Selection
  selectedWidget: string | null
  insertPosition: { relativeTo: string; position: 'above' | 'below' } | null
  
  // Custom Content
  customSections: CustomSection[]
  customStarterPages: CustomStarterPage[]
  
  // Flags
  isEditingLoadedWebsite: boolean
  
  // Canvas Actions
  addWidget: (widget: Widget) => void
  addSection: (section: WidgetSection) => void
  moveItem: (fromIndex: number, toIndex: number) => void
  replaceCanvasItems: (items: CanvasItem[]) => void
  selectWidget: (id: string | null) => void
  deleteWidget: (widgetId: string) => void
  setInsertPosition: (position: { relativeTo: string; position: 'above' | 'below' } | null) => void
  setIsEditingLoadedWebsite: (value: boolean) => void
  
  // Route Canvas Management
  getCanvasItemsForRoute: (route: string) => CanvasItem[]
  setCanvasItemsForRoute: (route: string, items: CanvasItem[]) => void
  clearCanvasItemsForRoute: (route: string) => void
  
  // Template Canvas Management
  setGlobalTemplateCanvas: (items: CanvasItem[]) => void
  clearGlobalTemplateCanvas: () => void
  setJournalTemplateCanvas: (journalCode: string, items: CanvasItem[]) => void
  getJournalTemplateCanvas: (journalCode: string) => CanvasItem[]
  clearJournalTemplateCanvas: (journalCode: string) => void
  
  // Custom Sections Management
  addCustomSection: (section: CustomSection) => void
  removeCustomSection: (id: string) => void
  
  // Custom Starter Pages Management
  addCustomStarterPage: (starterPage: CustomStarterPage) => void
  removeCustomStarterPage: (id: string) => void
  
  // Layout Creation
  createContentBlockWithLayout: (layout: ContentBlockLayout) => void
}

// =============================================================================
// Store
// =============================================================================

export const useCanvasStore = create<CanvasState>((set, get) => ({
  // Canvas State
  canvasItems: [],
  routeCanvasItems: {},
  globalTemplateCanvas: [],
  journalTemplateCanvas: {},
  
  // Selection
  selectedWidget: null,
  insertPosition: null,
  
  // Custom Content
  customSections: initializeCustomSections(),
  customStarterPages: initializeCustomStarterPages(),
  
  // Flags
  isEditingLoadedWebsite: false,
  
  // Canvas Actions
  addWidget: (widget) => set((s) => ({ canvasItems: [...s.canvasItems, widget] })),
  addSection: (section) => set((s) => ({ canvasItems: [...s.canvasItems, section] })),
  moveItem: (fromIndex, toIndex) => set((s) => ({ canvasItems: arrayMove(s.canvasItems, fromIndex, toIndex) })),
  replaceCanvasItems: (items) => set({ canvasItems: items }),
  selectWidget: (id) => set({ selectedWidget: id }),
  setInsertPosition: (position) => set({ insertPosition: position }),
  setIsEditingLoadedWebsite: (value) => set({ isEditingLoadedWebsite: value }),
  
  deleteWidget: (widgetId) => set((state) => {
    const standaloneIndex = state.canvasItems.findIndex(item => !isSectionGuard(item) && item.id === widgetId)
    if (standaloneIndex !== -1) {
      return {
        canvasItems: state.canvasItems.filter((_, index) => index !== standaloneIndex),
        selectedWidget: state.selectedWidget === widgetId ? null : state.selectedWidget
      }
    }
    
    const updatedCanvasItems = state.canvasItems.map(item => {
      if (isSectionGuard(item)) {
        return {
          ...item,
          areas: item.areas.map(area => ({
            ...area,
            widgets: area.widgets.filter(widget => widget.id !== widgetId)
          }))
        }
      }
      return item
    })
    
    return {
      canvasItems: updatedCanvasItems,
      selectedWidget: state.selectedWidget === widgetId ? null : state.selectedWidget
    }
  }),
  
  // Route Canvas Management
  getCanvasItemsForRoute: (route) => {
    const state = get()
    return state.routeCanvasItems[route] || []
  },
  setCanvasItemsForRoute: (route, items) => set((state) => ({
    routeCanvasItems: { ...state.routeCanvasItems, [route]: items }
  })),
  clearCanvasItemsForRoute: (route) => set((state) => {
    const newRouteCanvasItems = { ...state.routeCanvasItems }
    delete newRouteCanvasItems[route]
    return { routeCanvasItems: newRouteCanvasItems }
  }),
  
  // Template Canvas Management
  setGlobalTemplateCanvas: (items) => set({ globalTemplateCanvas: items }),
  clearGlobalTemplateCanvas: () => set({ globalTemplateCanvas: [] }),
  setJournalTemplateCanvas: (journalCode, items) => set((state) => ({
    journalTemplateCanvas: { ...state.journalTemplateCanvas, [journalCode]: items }
  })),
  getJournalTemplateCanvas: (journalCode) => {
    const state = get()
    return state.journalTemplateCanvas[journalCode] || []
  },
  clearJournalTemplateCanvas: (journalCode) => set((state) => {
    const newJournalTemplateCanvas = { ...state.journalTemplateCanvas }
    delete newJournalTemplateCanvas[journalCode]
    return { journalTemplateCanvas: newJournalTemplateCanvas }
  }),
  
  // Custom Sections Management
  addCustomSection: (section) => set((s) => {
    const newSections = [...s.customSections, section]
    const userCreatedSections = newSections.filter(sec => sec.source === 'user')
    saveToLocalStorage(STORAGE_KEYS.CUSTOM_SECTIONS, userCreatedSections)
    return { customSections: newSections }
  }),
  removeCustomSection: (id) => set((s) => {
    const filteredSections = s.customSections.filter(section => section.id !== id)
    const userCreatedSections = filteredSections.filter(sec => sec.source === 'user')
    saveToLocalStorage(STORAGE_KEYS.CUSTOM_SECTIONS, userCreatedSections)
    return { customSections: filteredSections }
  }),
  
  // Custom Starter Pages Management
  addCustomStarterPage: (starterPage) => set((s) => {
    const newPages = [...s.customStarterPages, starterPage]
    const userCreatedPages = newPages.filter(page => page.source === 'user')
    saveToLocalStorage(STORAGE_KEYS.CUSTOM_STARTER_PAGES, userCreatedPages)
    return { customStarterPages: newPages }
  }),
  removeCustomStarterPage: (id) => set((s) => {
    const filteredPages = s.customStarterPages.filter(page => page.id !== id)
    const userCreatedPages = filteredPages.filter(page => page.source === 'user')
    saveToLocalStorage(STORAGE_KEYS.CUSTOM_STARTER_PAGES, userCreatedPages)
    return { customStarterPages: filteredPages }
  }),
  
  // Layout Creation
  createContentBlockWithLayout: (layout) => {
    const { canvasItems, insertPosition } = get()
    
    const newSection: WidgetSection = {
      id: nanoid(),
      name: 'Section',
      type: 'content-block',
      layout,
      areas: []
    }
    
    switch (layout) {
      case 'flexible':
        newSection.areas = [{ id: nanoid(), name: 'Flex Items', widgets: [] }]
        newSection.flexConfig = {
          direction: 'row',
          wrap: true,
          justifyContent: 'flex-start',
          gap: '1rem'
        }
        break
      case 'grid':
        newSection.areas = [{ id: nanoid(), name: 'Grid Items', widgets: [] }]
        newSection.gridConfig = {
          columns: 3,
          gap: '1rem',
          alignItems: 'stretch',
          justifyItems: 'stretch'
        }
        break
      case 'one-column':
        newSection.areas = [{ id: nanoid(), name: 'Content', widgets: [] }]
        break
      case 'two-columns':
        newSection.areas = [
          { id: nanoid(), name: 'Left Column', widgets: [] },
          { id: nanoid(), name: 'Right Column', widgets: [] }
        ]
        break
      case 'three-columns':
        newSection.areas = [
          { id: nanoid(), name: 'Left Column', widgets: [] },
          { id: nanoid(), name: 'Center Column', widgets: [] },
          { id: nanoid(), name: 'Right Column', widgets: [] }
        ]
        break
      case 'one-third-left':
        newSection.areas = [
          { id: nanoid(), name: 'Left (1/3)', widgets: [] },
          { id: nanoid(), name: 'Right (2/3)', widgets: [] }
        ]
        break
      case 'one-third-right':
        newSection.areas = [
          { id: nanoid(), name: 'Left (2/3)', widgets: [] },
          { id: nanoid(), name: 'Right (1/3)', widgets: [] }
        ]
        break
      default:
        newSection.areas = [{ id: nanoid(), name: 'Content', widgets: [] }]
    }
    
    let newCanvasItems = [...canvasItems]
    
    if (insertPosition) {
      const relativeIndex = canvasItems.findIndex(item => item.id === insertPosition.relativeTo)
      if (relativeIndex !== -1) {
        const insertIndex = insertPosition.position === 'above' ? relativeIndex : relativeIndex + 1
        newCanvasItems.splice(insertIndex, 0, newSection)
      } else {
        newCanvasItems.push(newSection)
      }
    } else {
      newCanvasItems.push(newSection)
    }
    
    set({ 
      canvasItems: newCanvasItems,
      insertPosition: null,
      selectedWidget: newSection.id
    })
  }
}))

