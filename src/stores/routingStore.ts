/**
 * Routing Store - Manages view state and navigation
 * 
 * Controls which view is shown (design console, page builder, live site)
 * and editing context (template, page, website).
 */

import { create } from 'zustand'
import type { 
  AppView, 
  DesignConsoleView, 
  EditingContext, 
  TemplateEditingContext,
  MockLiveSiteRoute,
  Persona,
  ConsoleMode
} from '../types/app'

// =============================================================================
// Types
// =============================================================================

export interface RoutingState {
  // View State
  currentView: AppView
  siteManagerView: DesignConsoleView
  editingContext: EditingContext
  templateEditingContext: TemplateEditingContext | null
  currentWebsiteId: string
  mockLiveSiteRoute: MockLiveSiteRoute
  
  // Theme Preview
  previewBrandMode: 'wiley' | 'wt' | 'dummies'
  previewThemeId: string
  
  // Prototype Controls (Persona & Mode)
  currentPersona: Persona
  consoleMode: ConsoleMode
  
  // Actions
  setCurrentView: (view: AppView) => void
  setSiteManagerView: (view: DesignConsoleView) => void
  setEditingContext: (context: EditingContext) => void
  setTemplateEditingContext: (context: TemplateEditingContext | null) => void
  setCurrentWebsiteId: (websiteId: string) => void
  setMockLiveSiteRoute: (route: MockLiveSiteRoute) => void
  setPreviewBrandMode: (mode: 'wiley' | 'wt' | 'dummies') => void
  setPreviewThemeId: (themeId: string) => void
  setCurrentPersona: (persona: Persona) => void
  setConsoleMode: (mode: ConsoleMode) => void
}

// =============================================================================
// Store
// =============================================================================

export const useRoutingStore = create<RoutingState>((set) => ({
  // View State
  currentView: 'design-console',
  siteManagerView: 'websites',
  editingContext: 'page',
  templateEditingContext: null,
  currentWebsiteId: 'catalyst-demo',
  mockLiveSiteRoute: '/',
  
  // Theme Preview
  previewBrandMode: 'wiley',
  previewThemeId: 'classic-ux3-theme',
  
  // Prototype Controls
  currentPersona: 'publisher',
  consoleMode: 'multi',
  
  // Actions
  setCurrentView: (view) => set({ currentView: view }),
  setSiteManagerView: (view) => set({ siteManagerView: view }),
  setEditingContext: (context) => set({ editingContext: context }),
  setTemplateEditingContext: (context) => set({ templateEditingContext: context }),
  setCurrentWebsiteId: (websiteId) => set({ currentWebsiteId: websiteId }),
  setMockLiveSiteRoute: (route) => set({ mockLiveSiteRoute: route }),
  setPreviewBrandMode: (mode) => set({ previewBrandMode: mode }),
  setPreviewThemeId: (themeId) => set({ previewThemeId: themeId }),
  setCurrentPersona: (persona) => set({ currentPersona: persona }),
  setConsoleMode: (mode) => set({ consoleMode: mode })
}))

