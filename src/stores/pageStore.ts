/**
 * Page Store - Zustand store for V1 Page Builder
 * 
 * Extracted from AppV1.tsx for better modularity.
 * This is the first step in refactoring V1's architecture.
 */

import { create } from 'zustand'
import { nanoid } from 'nanoid'
import { arrayMove } from '@dnd-kit/sortable'
import { createDebugLogger } from '../utils/logger'

// Types
import type { 
  PageState, 
  Notification, 
  PageIssue, 
  TemplateModification 
} from '../types/app'
import type { 
  CanvasItem, 
  WidgetSection, 
  isSection 
} from '../types/widgets'
import type { SchemaOrgType, SchemaObject } from '../types/schema'

// Mock data
import { mockWebsites } from '../data/mockWebsites'
import { mockThemes } from '../data/mockThemes'
import { mockStarterPages } from '../data/mockStarterPages'
import { mockSections } from '../data/mockSections'

// Control logging for this file
const DEBUG = false
const debugLog = createDebugLogger(DEBUG)

// Constants
import { DEFAULT_PUBLICATION_CARD_CONFIG } from '../constants'

// =============================================================================
// LocalStorage Persistence
// =============================================================================

const STORAGE_KEYS = {
  CUSTOM_STARTER_PAGES: 'catalyst-custom-starter-pages',
  CUSTOM_SECTIONS: 'catalyst-custom-sections',
  WEBSITE_PAGES: 'catalyst-website-pages',
  PAGE_SHELL_HISTORY: 'catalyst-page-shell-history',
  SITE_LAYOUT_DRAFT_SETTINGS: 'catalyst-site-layout-draft-settings'
}

// Reviver function to convert date strings back to Date objects
const dateReviver = (key: string, value: any) => {
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

// Initialize with mock data + user-created data from localStorage
const initializeCustomStarterPages = () => {
  const userCreatedPages = loadFromLocalStorage(STORAGE_KEYS.CUSTOM_STARTER_PAGES, [])
  return [...mockStarterPages, ...userCreatedPages]
}

const initializeCustomSections = () => {
  const userCreatedSections = loadFromLocalStorage(STORAGE_KEYS.CUSTOM_SECTIONS, [])
  return [...mockSections, ...userCreatedSections]
}

// Initialize website pages from localStorage
const initializeWebsitePages = (): import('../types/widgets').WebsitePage[] => {
  return loadFromLocalStorage(STORAGE_KEYS.WEBSITE_PAGES, [])
}

// Initialize page shell history from localStorage
const initializePageShellHistory = (): import('../types/app').PageShellHistoryEntry[] => {
  return loadFromLocalStorage(STORAGE_KEYS.PAGE_SHELL_HISTORY, [])
}

// Draft site layout settings (header/footer enabled) persisted in sessionStorage (per browser session).
const loadSiteLayoutDraftSettingsFromSession = (): Record<string, import('../types/app').SiteLayoutDraftSettings> => {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEYS.SITE_LAYOUT_DRAFT_SETTINGS)
    if (!stored) return {}
    return JSON.parse(stored)
  } catch (error) {
    debugLog('error', 'Failed to load site layout draft settings from sessionStorage:', error)
    return {}
  }
}

const saveSiteLayoutDraftSettingsToSession = (data: Record<string, import('../types/app').SiteLayoutDraftSettings>) => {
  try {
    sessionStorage.setItem(STORAGE_KEYS.SITE_LAYOUT_DRAFT_SETTINGS, JSON.stringify(data))
  } catch (error) {
    debugLog('error', 'Failed to save site layout draft settings to sessionStorage:', error)
  }
}

// =============================================================================
// isSection Type Guard (needed by store)
// =============================================================================

function isSectionGuard(item: CanvasItem): item is WidgetSection {
  return 'areas' in item && Array.isArray((item as WidgetSection).areas)
}

// =============================================================================
// Store Definition
// =============================================================================

export const usePageStore = create<PageState>((set, get) => ({
  // Routing  
  currentView: 'design-console',
  siteManagerView: 'websites', 
  editingContext: 'page',
  templateEditingContext: null,
  currentWebsiteId: 'catalyst-demo',
  mockLiveSiteRoute: '/',
  previewBrandMode: 'wiley' as 'wiley' | 'wt' | 'dummies',
  previewThemeId: 'classic-ux3-theme',
  
  // Prototype Controls
  currentPersona: 'publisher' as 'publisher' | 'pb-admin' | 'developer',
  consoleMode: 'multi' as 'multi' | 'single',
  setCurrentPersona: (persona) => set({ currentPersona: persona }),
  setConsoleMode: (mode) => set({ consoleMode: mode }),
  
  setCurrentView: (view) => set({ currentView: view }),
  setSiteManagerView: (view) => set({ siteManagerView: view }),
  setEditingContext: (context) => set({ editingContext: context }),
  setTemplateEditingContext: (context) => set({ templateEditingContext: context }),
  setCurrentWebsiteId: (websiteId) => set({ currentWebsiteId: websiteId }),
  setMockLiveSiteRoute: (route) => set({ mockLiveSiteRoute: route }),
  setPreviewBrandMode: (mode) => set({ previewBrandMode: mode }),
  setPreviewThemeId: (themeId) => set({ previewThemeId: themeId }),
  
  // Notifications & Issues
  notifications: [],
  pageIssues: [],
  addNotification: (notification) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: new Date()
    }
    set((state) => ({ 
      notifications: [...state.notifications, newNotification] 
    }))
    
    if (notification.autoClose !== false) {
      const delay = notification.closeAfter || (notification.type === 'error' ? 5000 : 3000)
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id)
        }))
      }, delay)
    }
  },
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),
  clearNotifications: () => set({ notifications: [] }),
  addPageIssue: (issue) => {
    const id = `issue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newIssue: PageIssue = { ...issue, id }
    set((state) => ({ 
      pageIssues: [...state.pageIssues.filter(i => i.element !== issue.element || i.type !== issue.type), newIssue] 
    }))
  },
  removePageIssue: (id) => set((state) => ({
    pageIssues: state.pageIssues.filter(i => i.id !== id)
  })),
  clearPageIssues: () => set({ pageIssues: [] }),
  
  // Schema.org Content Management
  schemaObjects: [
    {
      id: 'blog-post-1',
      type: 'BlogPosting' as SchemaOrgType,
      name: 'Getting Started with Page Builders',
      data: {
        name: 'Getting Started with Page Builders',
        headline: 'Getting Started with Page Builders: A Complete Guide',
        author: {
          '@type': 'Person',
          name: 'Sarah Johnson',
          jobTitle: 'UX Designer'
        },
        datePublished: '2024-01-15T10:00:00Z',
        description: 'Learn how to create stunning websites with modern page builder tools and best practices.',
        articleBody: 'Page builders have revolutionized web design by making it accessible to everyone...',
        keywords: ['page builder', 'web design', 'no-code', 'website creation'],
        wordCount: 1200,
        url: 'https://example.com/blog/getting-started-page-builders'
      },
      jsonLD: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": "Getting Started with Page Builders: A Complete Guide"
      }, null, 2),
      tags: ['tutorial', 'beginner', 'web-design'],
      createdAt: new Date('2024-01-15T10:00:00Z'),
      updatedAt: new Date('2024-01-15T10:00:00Z')
    },
    {
      id: 'author-1',
      type: 'Person' as SchemaOrgType,
      name: 'Dr. Maria Rodriguez',
      data: {
        name: 'Dr. Maria Rodriguez',
        givenName: 'Maria',
        familyName: 'Rodriguez',
        jobTitle: 'Senior Research Scientist',
        worksFor: 'Tech Innovation Lab'
      },
      jsonLD: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Person",
        "name": "Dr. Maria Rodriguez"
      }, null, 2),
      tags: ['researcher', 'ai', 'academia'],
      createdAt: new Date('2024-01-10T14:30:00Z'),
      updatedAt: new Date('2024-01-10T14:30:00Z')
    }
  ],
  selectedSchemaObject: null,
  addSchemaObject: (object) => {
    const id = `schema-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const now = new Date()
    const newObject: SchemaObject = {
      ...object,
      id,
      createdAt: now,
      updatedAt: now
    }
    set((state) => ({ 
      schemaObjects: [...state.schemaObjects, newObject] 
    }))
  },
  updateSchemaObject: (id, updates) => set((state) => ({
    schemaObjects: state.schemaObjects.map(obj => 
      obj.id === id ? { ...obj, ...updates, updatedAt: new Date() } : obj
    )
  })),
  removeSchemaObject: (id) => set((state) => ({
    schemaObjects: state.schemaObjects.filter(obj => obj.id !== id),
    selectedSchemaObject: state.selectedSchemaObject?.id === id ? null : state.selectedSchemaObject
  })),
  selectSchemaObject: (id) => set((state) => ({
    selectedSchemaObject: id ? state.schemaObjects.find(obj => obj.id === id) || null : null
  })),
  getSchemaObjectsByType: (type) => {
    const state = get()
    return state.schemaObjects.filter(obj => obj.type === type)
  },
  searchSchemaObjects: (query) => {
    const state = get()
    const lowerQuery = query.toLowerCase()
    return state.schemaObjects.filter(obj => 
      obj.name.toLowerCase().includes(lowerQuery) ||
      obj.type.toLowerCase().includes(lowerQuery) ||
      (obj.tags && obj.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
    )
  },
  
  // Page Builder
  canvasItems: [],
  canvasOwnerId: null as string | null, // Tracks which page the canvasItems belong to (e.g., "catalyst-demo:home")
  routeCanvasItems: {},
  globalTemplateCanvas: [],
  journalTemplateCanvas: {},
  
  // Per-website, per-page canvas storage (for Live Site integration)
  // Key format: "websiteId:pageId" -> CanvasItem[]
  pageCanvasData: {} as Record<string, CanvasItem[]>, // PUBLISHED
  
  // Per-website, per-page draft storage (for preview and editing)
  // Key format: "websiteId:pageId" -> CanvasItem[]
  pageDraftData: {} as Record<string, CanvasItem[]>, // DRAFT (previewable, not published)

  // Page shell publish history (header/footer snapshots)
  pageShellHistory: initializePageShellHistory(),

  // Draft-only settings for site-wide header/footer enablement; committed on Publish.
  siteLayoutDraftSettings: loadSiteLayoutDraftSettingsFromSession(),
  
  // Per-page header/footer overrides
  // Key format: "websiteId:pageId" -> { headerOverride, footerOverride }
  pageLayoutOverrides: {} as Record<string, { 
    headerOverride?: 'global' | 'hide' | 'page-edit'
    footerOverride?: 'global' | 'hide' | 'page-edit' 
  }>, // PUBLISHED
  pageLayoutOverridesDraft: {} as Record<string, {
    headerOverride?: 'global' | 'hide' | 'page-edit'
    footerOverride?: 'global' | 'hide' | 'page-edit'
  }>, // DRAFT (previewable, committed on Publish)
  
  // Per-page layout settings (full, left, right)
  // Key format: "websiteId:pageId" -> 'full' | 'left' | 'right'
  pageLayouts: {} as Record<string, 'full' | 'left' | 'right'>,
  customSections: initializeCustomSections(),
  customStarterPages: initializeCustomStarterPages(),
  websitePages: initializeWebsitePages(),
  templates: [],
  websites: mockWebsites,
  themes: mockThemes,
  
  // Template Divergence Tracking
  templateModifications: [],
  exemptedRoutes: new Set<string>(),
  
  publicationCardVariants: [
    {
      id: 'compact-variant',
      name: 'Compact',
      description: 'Clean compact view with essential information',
      config: {
        ...DEFAULT_PUBLICATION_CARD_CONFIG,
        showTitle: true,
        showAbstract: false,
        showAffiliations: false,
        showKeywords: false,
        showUsageMetrics: false,
        showThumbnail: false,
        thumbnailPosition: 'left'
      },
      createdAt: new Date()
    },
    {
      id: 'detailed-variant',
      name: 'Detailed',
      description: 'Comprehensive view with all metadata',
      config: {
        ...DEFAULT_PUBLICATION_CARD_CONFIG,
        showTitle: true,
        showAbstract: true,
        showAffiliations: true,
        showKeywords: true,
        showUsageMetrics: true,
        showThumbnail: true,
        thumbnailPosition: 'top'
      },
      createdAt: new Date()
    }
  ],
  selectedWidget: null,
  insertPosition: null,
  addWidget: (widget) => set((s) => ({ canvasItems: [...s.canvasItems, widget] })),
  addSection: (section) => set((s) => ({ canvasItems: [...s.canvasItems, section] })),
  moveItem: (fromIndex, toIndex) => set((s) => ({ canvasItems: arrayMove(s.canvasItems, fromIndex, toIndex) })),
  replaceCanvasItems: (items) => set({ canvasItems: items }),
  setCanvasOwnerId: (ownerId: string | null) => set({ canvasOwnerId: ownerId }),
  isEditingLoadedWebsite: false,
  setIsEditingLoadedWebsite: (value) => set({ isEditingLoadedWebsite: value }),
  selectWidget: (id) => set({ selectedWidget: id }),
  
  // Route-specific canvas management
  getCanvasItemsForRoute: (route) => {
    const state = get()
    return state.routeCanvasItems[route] || []
  },
  setCanvasItemsForRoute: (route, items) => set((state) => ({
    routeCanvasItems: {
      ...state.routeCanvasItems,
      [route]: items
    }
  })),
  clearCanvasItemsForRoute: (route) => set((state) => {
    const newRouteCanvasItems = { ...state.routeCanvasItems }
    delete newRouteCanvasItems[route]
    return { routeCanvasItems: newRouteCanvasItems }
  }),
  
  // Per-website, per-page canvas management (for Live Site integration)
  getPageCanvas: (websiteId: string, pageId: string) => {
    const state = get()
    const key = `${websiteId}:${pageId}`
    return state.pageCanvasData[key] || null
  },
  setPageCanvas: (websiteId: string, pageId: string, items: CanvasItem[]) => set((state) => ({
    pageCanvasData: {
      ...state.pageCanvasData,
      [`${websiteId}:${pageId}`]: items
    }
  })),
  
  // Delete a page-specific canvas (discard override)
  deletePageCanvas: (websiteId: string, pageId: string) => set((state) => {
    const key = `${websiteId}:${pageId}`
    const { [key]: _, ...rest } = state.pageCanvasData
    return { pageCanvasData: rest }
  }),
  
  // Draft management (for preview and editing)
  getPageDraft: (websiteId: string, pageId: string) => {
    const state = get()
    const key = `${websiteId}:${pageId}`
    // Check sessionStorage first (for session persistence), then in-memory store
    const sessionStorageKey = `draft:${key}`
    try {
      const stored = sessionStorage.getItem(sessionStorageKey)
      if (stored) {
        const parsed = JSON.parse(stored)
        return parsed
      }
    } catch (error) {
      debugLog('error', 'Failed to load draft from sessionStorage:', error)
    }
    return state.pageDraftData[key] || null
  },
  setPageDraft: (websiteId: string, pageId: string, items: CanvasItem[]) => {
    const key = `${websiteId}:${pageId}`
    const sessionStorageKey = `draft:${key}`
    
    // Save to sessionStorage for session persistence
    try {
      sessionStorage.setItem(sessionStorageKey, JSON.stringify(items))
    } catch (error) {
      debugLog('error', 'Failed to save draft to sessionStorage:', error)
    }
    
    // Also save to in-memory store
    return set((state) => ({
      pageDraftData: {
        ...state.pageDraftData,
        [key]: items
      }
    }))
  },
  // Clear draft for a specific page (used when propagating archetype changes)
  clearPageDraft: (websiteId: string, pageId: string) => {
    const key = `${websiteId}:${pageId}`
    const sessionStorageKey = `draft:${key}`
    
    // Clear from sessionStorage
    try {
      sessionStorage.removeItem(sessionStorageKey)
    } catch (error) {
      debugLog('error', 'Failed to clear draft from sessionStorage:', error)
    }
    
    // Clear from in-memory store
    return set((state) => {
      const newDraftData = { ...state.pageDraftData }
      delete newDraftData[key]
      return { pageDraftData: newDraftData }
    })
  },
  // Get page canvas for preview (checks draft first, then published)
  getPageCanvasForPreview: (websiteId: string, pageId: string) => {
    const state = get()
    const key = `${websiteId}:${pageId}`
    const sessionStorageKey = `draft:${key}`
    
    // Check sessionStorage draft first (for session persistence)
    // Only return if it has content (length > 0)
    try {
      const stored = sessionStorage.getItem(sessionStorageKey)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Only return draft if it has actual content
        if (Array.isArray(parsed) && parsed.length > 0) {
          debugLog('log', '📖 [getPageCanvasForPreview] Using draft from sessionStorage:', sessionStorageKey, { itemCount: parsed.length })
          return parsed
        }
      }
    } catch (error) {
      debugLog('error', 'Failed to load draft from sessionStorage:', error)
    }
    
    // Then check in-memory draft (only if it has content)
    if (state.pageDraftData[key] && Array.isArray(state.pageDraftData[key]) && state.pageDraftData[key].length > 0) {
      debugLog('log', '📖 [getPageCanvasForPreview] Using draft from memory:', key, { itemCount: state.pageDraftData[key].length })
      return state.pageDraftData[key]
    }
    
    // Finally fallback to published
    if (state.pageCanvasData[key]) {
      debugLog('log', '📖 [getPageCanvasForPreview] Using published canvas:', key, { itemCount: state.pageCanvasData[key].length })
      return state.pageCanvasData[key]
    }
    
    return null
  },

  // Page shell publish history (header/footer snapshots)
  addPageShellHistoryEntry: (entry) => set((state) => {
    const committedAt = entry.committedAt ? new Date(entry.committedAt) : new Date()
    const nextEntry = {
      ...entry,
      id: nanoid(),
      committedAt
    }
    // Keep most recent first, cap to avoid unbounded growth
    const next = [nextEntry, ...(state.pageShellHistory || [])].slice(0, 200)
    saveToLocalStorage(STORAGE_KEYS.PAGE_SHELL_HISTORY, next)
    return { pageShellHistory: next }
  }),
  getPageShellHistory: (websiteId, region, opts) => {
    const state = get()
    const scope = opts?.scope
    const pageId = opts?.pageId
    const limit = opts?.limit ?? 25
    return (state.pageShellHistory || [])
      .filter((e: any) => {
        if (e.websiteId !== websiteId) return false
        if (e.region !== region) return false
        if (scope && e.scope !== scope) return false
        if (scope === 'page' && pageId && e.pageId !== pageId) return false
        return true
      })
      .slice(0, limit)
  },

  // Draft-only settings for site-wide header/footer enablement
  getSiteLayoutDraftSettings: (websiteId: string) => {
    const state = get()
    return state.siteLayoutDraftSettings?.[websiteId] || null
  },
  setSiteLayoutDraftSettings: (websiteId: string, updates) => set((state) => {
    const existing = state.siteLayoutDraftSettings?.[websiteId] || {}
    const nextForSite = { ...existing, ...updates }
    const next = {
      ...(state.siteLayoutDraftSettings || {}),
      [websiteId]: nextForSite
    }
    saveSiteLayoutDraftSettingsToSession(next)
    return { siteLayoutDraftSettings: next }
  }),
  clearSiteLayoutDraftSettings: (websiteId: string) => set((state) => {
    const next = { ...(state.siteLayoutDraftSettings || {}) }
    delete next[websiteId]
    saveSiteLayoutDraftSettingsToSession(next)
    return { siteLayoutDraftSettings: next }
  }),
  
  // Add a widget to a website's global header/footer
  // Insert a widget BEFORE a target widget in siteLayout (for precise positioning)
  insertWidgetInSiteLayout: (websiteId: string, sectionType: 'header' | 'footer', sectionId: string, areaId: string, widget: any, beforeWidgetId: string) => set((state) => {
    const website = state.websites.find(w => w.id === websiteId)
    if (!website) return state
    
    const siteLayout = (website as any).siteLayout
    if (!siteLayout) return state
    
    const sections = sectionType === 'header' ? siteLayout.header : siteLayout.footer
    if (!sections) return state
    
    const updatedSections = sections.map((section: any) => {
      if (section.id === sectionId) {
        return {
          ...section,
          areas: section.areas?.map((area: any) => {
            if (area.id === areaId) {
              const widgets = [...(area.widgets || [])]
              const targetIndex = widgets.findIndex((w: any) => w.id === beforeWidgetId)
              if (targetIndex !== -1) {
                widgets.splice(targetIndex, 0, widget)
              } else {
                widgets.push(widget) // Fallback: append
              }
              return { ...area, widgets }
            }
            return area
          })
        }
      }
      return section
    })
    
    return {
      websites: state.websites.map(w => 
        w.id === websiteId
          ? { 
              ...w, 
              siteLayout: {
                ...siteLayout,
                [sectionType]: updatedSections
              },
              updatedAt: new Date() 
            } 
          : w
      )
    }
  }),
  
  addWidgetToSiteLayout: (websiteId: string, sectionType: 'header' | 'footer', sectionId: string, areaId: string, widget: any) => set((state) => {
    const website = state.websites.find(w => w.id === websiteId)
    if (!website) return state
    
    const siteLayout = (website as any).siteLayout
    if (!siteLayout) return state
    
    const sections = sectionType === 'header' ? siteLayout.header : siteLayout.footer
    if (!sections) return state
    
    const updatedSections = sections.map((section: any) => {
      if (section.id === sectionId) {
        return {
          ...section,
          areas: section.areas?.map((area: any) => {
            if (area.id === areaId) {
              return {
                ...area,
                widgets: [...(area.widgets || []), widget]
              }
            }
            return area
          })
        }
      }
      return section
    })
    
    return {
      websites: state.websites.map(w => 
        w.id === websiteId 
          ? { 
              ...w, 
              siteLayout: {
                ...siteLayout,
                [sectionType]: updatedSections
              },
              updatedAt: new Date() 
            } 
          : w
      )
    }
  }),
  
  // Update a section in a website's global header/footer (for section properties)
  updateSiteLayoutSection: (websiteId: string, sectionType: 'header' | 'footer', sectionId: string, updates: any) => set((state) => {
    const website = state.websites.find(w => w.id === websiteId)
    if (!website) return state
    
    const siteLayout = (website as any).siteLayout
    if (!siteLayout) return state
    
    const sections = sectionType === 'header' ? siteLayout.header : siteLayout.footer
    if (!sections) return state
    
    const updatedSections = sections.map((section: any) => 
      section.id === sectionId ? { ...section, ...updates } : section
    )
    
    return {
      websites: state.websites.map(w => 
        w.id === websiteId 
          ? { 
              ...w, 
              siteLayout: {
                ...siteLayout,
                [sectionType]: updatedSections
              },
              updatedAt: new Date() 
            } 
          : w
      )
    }
  }),
  clearPageCanvas: (websiteId: string, pageId: string) => set((state) => {
    const newPageCanvasData = { ...state.pageCanvasData }
    delete newPageCanvasData[`${websiteId}:${pageId}`]
    return { pageCanvasData: newPageCanvasData }
  }),
  
  // Page-level layout overrides (header/footer visibility per page)
  getPageLayoutOverrides: (websiteId: string, pageId: string) => {
    const state = get()
    const key = `${websiteId}:${pageId}`
    const published = state.pageLayoutOverrides[key] || {}
    const draft = state.pageLayoutOverridesDraft[key] || {}
    const merged = { ...published, ...draft }
    return (merged.headerOverride || merged.footerOverride)
      ? merged
      : { headerOverride: 'global', footerOverride: 'global' }
  },
  // Set DRAFT override (previewable; committed on Publish)
  setPageLayoutOverride: (websiteId: string, pageId: string, type: 'header' | 'footer', mode: 'global' | 'hide' | 'page-edit') => set((state) => {
    const key = `${websiteId}:${pageId}`
    const existingDraft = state.pageLayoutOverridesDraft[key] || {}
    return {
      pageLayoutOverridesDraft: {
        ...state.pageLayoutOverridesDraft,
        [key]: {
          ...existingDraft,
          [type === 'header' ? 'headerOverride' : 'footerOverride']: mode
        }
      },
    }
  }),
  // Commit override into PUBLISHED state and clear any draft value for that field.
  commitPageLayoutOverride: (websiteId: string, pageId: string, type: 'header' | 'footer', mode: 'global' | 'hide' | 'page-edit') => set((state) => {
    const key = `${websiteId}:${pageId}`
    const existingPublished = state.pageLayoutOverrides[key] || {}
    const nextPublished = {
      ...existingPublished,
      [type === 'header' ? 'headerOverride' : 'footerOverride']: mode
    }
    const nextDraft = { ...(state.pageLayoutOverridesDraft || {}) }
    const existingDraft = nextDraft[key] || {}
    const { [type === 'header' ? 'headerOverride' : 'footerOverride']: _removed, ...restDraftForKey } = existingDraft as any
    if (Object.keys(restDraftForKey).length === 0) {
      delete nextDraft[key]
    } else {
      nextDraft[key] = restDraftForKey as any
    }
    return {
      pageLayoutOverrides: {
        ...state.pageLayoutOverrides,
        [key]: nextPublished
      },
      pageLayoutOverridesDraft: nextDraft
    }
  }),
  // Discard draft override for a specific region (revert to published).
  discardPageLayoutOverrideDraft: (websiteId: string, pageId: string, type: 'header' | 'footer') => set((state) => {
    const key = `${websiteId}:${pageId}`
    const nextDraft = { ...(state.pageLayoutOverridesDraft || {}) }
    const existingDraft = nextDraft[key] || {}
    const field = type === 'header' ? 'headerOverride' : 'footerOverride'
    const { [field]: _removed, ...rest } = existingDraft as any
    if (Object.keys(rest).length === 0) {
      delete nextDraft[key]
    } else {
      nextDraft[key] = rest as any
    }
    return { pageLayoutOverridesDraft: nextDraft }
  }),
  
  // Page layout getter/setter (full, left, right)
  getPageLayout: (websiteId: string, pageId: string) => {
    const state = get()
    const key = `${websiteId}:${pageId}`
    return state.pageLayouts[key] || 'full'
  },
  
  setPageLayout: (websiteId: string, pageId: string, layout: 'full' | 'left' | 'right') => set((state) => {
    const key = `${websiteId}:${pageId}`
    return {
      pageLayouts: {
        ...state.pageLayouts,
        [key]: layout
      }
    }
  }),
  
  // Delete a widget from a website's global header/footer (siteLayout)
  deleteWidgetFromSiteLayout: (websiteId: string, sectionType: 'header' | 'footer', widgetId: string) => set((state) => {
    const website = state.websites.find(w => w.id === websiteId)
    if (!website) return state
    
    const siteLayout = (website as any).siteLayout
    if (!siteLayout) return state
    
    const sections = sectionType === 'header' ? siteLayout.header : siteLayout.footer
    if (!sections || sections.length === 0) return state
    
    // Deep delete: find and remove the widget from sections
    const updatedSections = sections.map((section: any) => ({
      ...section,
      areas: section.areas?.map((area: any) => ({
        ...area,
        widgets: area.widgets?.filter((widget: any) => widget.id !== widgetId)
      }))
    }))
    
    return {
      websites: state.websites.map(w => 
        w.id === websiteId 
          ? { 
              ...w, 
              siteLayout: {
                ...siteLayout,
                [sectionType]: updatedSections
              },
              updatedAt: new Date() 
            } 
          : w
      )
    }
  }),
  
  // Update a widget within a website's global header/footer (siteLayout)
  updateSiteLayoutWidget: (websiteId: string, sectionType: 'header' | 'footer', widgetId: string, updates: any) => set((state) => {
    const website = state.websites.find(w => w.id === websiteId)
    if (!website) return state
    
    const siteLayout = (website as any).siteLayout
    if (!siteLayout) return state
    
    const sections = sectionType === 'header' ? siteLayout.header : siteLayout.footer
    if (!sections || sections.length === 0) return state
    
    // Deep update: find and update the widget within the sections
    const updatedSections = sections.map((section: any) => ({
      ...section,
      areas: section.areas?.map((area: any) => ({
        ...area,
        widgets: area.widgets?.map((widget: any) => 
          widget.id === widgetId ? { ...widget, ...updates } : widget
        )
      }))
    }))
    
    return {
      websites: state.websites.map(w => 
        w.id === websiteId 
          ? { 
              ...w, 
              siteLayout: {
                ...siteLayout,
                [sectionType]: updatedSections
              },
              updatedAt: new Date() 
            } 
          : w
      )
    }
  }),
  
  // Global template management
  setGlobalTemplateCanvas: (items) => set({ globalTemplateCanvas: items }),
  clearGlobalTemplateCanvas: () => set({ globalTemplateCanvas: [] }),
  
  // Journal template management
  setJournalTemplateCanvas: (journalCode, items) => set((state) => ({
    journalTemplateCanvas: {
      ...state.journalTemplateCanvas,
      [journalCode]: items
    }
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
  
  // Website Pages Management (user-created pages on a website)
  addWebsitePage: (page: import('../types/widgets').WebsitePage) => set((s) => {
    const newPages = [...s.websitePages, page]
    saveToLocalStorage(STORAGE_KEYS.WEBSITE_PAGES, newPages)
    return { websitePages: newPages }
  }),
  
  updateWebsitePage: (id: string, updates: Partial<import('../types/widgets').WebsitePage>) => set((s) => {
    const newPages = s.websitePages.map(page => 
      page.id === id ? { ...page, ...updates, updatedAt: new Date() } : page
    )
    saveToLocalStorage(STORAGE_KEYS.WEBSITE_PAGES, newPages)
    return { websitePages: newPages }
  }),
  
  removeWebsitePage: (id: string) => set((s) => {
    const filteredPages = s.websitePages.filter(page => page.id !== id)
    saveToLocalStorage(STORAGE_KEYS.WEBSITE_PAGES, filteredPages)
    return { websitePages: filteredPages }
  }),
  
  getWebsitePagesForWebsite: (websiteId: string) => {
    const state = get()
    return state.websitePages.filter(page => page.websiteId === websiteId)
  },
  
  addPublicationCardVariant: (variant) => set((s) => ({ 
    publicationCardVariants: [...s.publicationCardVariants, variant] 
  })),
  removePublicationCardVariant: (id) => set((s) => ({ 
    publicationCardVariants: s.publicationCardVariants.filter(variant => variant.id !== id) 
  })),
  setInsertPosition: (position) => set({ insertPosition: position }),
  
  // Template Management
  addTemplate: (template) => set((state) => ({
    templates: [...state.templates, template]
  })),
  updateTemplate: (id, template) => set((state) => ({
    templates: state.templates.map(t => t.id === id ? { ...t, ...template, updatedAt: new Date() } : t)
  })),
  removeTemplate: (id) => set((state) => ({
    templates: state.templates.filter(t => t.id !== id)
  })),
  duplicateTemplate: (id) => set((state) => {
    const template = state.templates.find(t => t.id === id)
    if (!template) return state
    const duplicate = {
      ...template,
      id: nanoid(),
      name: `${template.name} (Copy)`,
      version: '1.0.0',
      createdAt: new Date(),
      updatedAt: new Date()
    }
    return { templates: [...state.templates, duplicate] }
  }),
  
  // Website Management
  addWebsite: (website) => set((state) => ({
    websites: [...state.websites, website]
  })),
  updateWebsite: (id, website) => set((state) => ({
    websites: state.websites.map(w => w.id === id ? { ...w, ...website, updatedAt: new Date() } : w)
  })),
  removeWebsite: (id) => set((state) => ({
    websites: state.websites.filter(w => w.id !== id)
  })),
  
  // Modification Management
  addModification: (websiteId, modification) => set((state) => ({
    websites: state.websites.map(w => 
      w.id === websiteId 
        ? { ...w, modifications: [...w.modifications, modification], updatedAt: new Date() }
        : w
    )
  })),
  removeModification: (websiteId, modificationPath) => set((state) => ({
    websites: state.websites.map(w => 
      w.id === websiteId 
        ? { ...w, modifications: w.modifications.filter(o => o.path !== modificationPath), updatedAt: new Date() }
        : w
    )
  })),
  
  calculateDeviationScore: (websiteId) => {
    const state = get()
    const website = state.websites.find(w => w.id === websiteId)
    if (!website) return 0
    
    const template = state.templates.find(t => t.id === website.themeId)
    if (!template) return 0
    
    let score = 0
    website.modifications.forEach(modification => {
      if (template.lockedElements.some(locked => modification.path.startsWith(locked))) {
        score += 20
      } else if (template.allowedModifications.some(allowed => modification.path.startsWith(allowed))) {
        score += 5
      } else {
        score += 10
      }
    })
    
    return Math.min(score, 100)
  },
  
  // Theme Management
  addTheme: (theme) => set((state) => ({
    themes: [...state.themes, theme]
  })),
  updateTheme: (id, theme) => set((state) => ({
    themes: state.themes.map(t => t.id === id ? { ...t, ...theme } : t)
  })),
  removeTheme: (id) => set((state) => ({
    themes: state.themes.filter(t => t.id !== id)
  })),
  
  // Template Divergence Management
  trackModification: (route, journalCode, journalName, templateId) => {
    debugLog('log', '🔵 trackModification CALLED:', { route, journalCode, journalName, templateId })
    const state = get()
    const existingModification = state.templateModifications.find(c => c.route === route)
    
    if (existingModification) {
      set((s) => ({
        templateModifications: s.templateModifications.map(c => 
          c.route === route 
            ? { ...c, modificationCount: c.modificationCount + 1, lastModified: new Date() }
            : c
        )
      }))
    } else {
      const newModification: TemplateModification = {
        route,
        journalCode,
        journalName,
        templateId,
        modificationCount: 1,
        lastModified: new Date(),
        isExempt: false
      }
      set((s) => ({
        templateModifications: [...s.templateModifications, newModification]
      }))
    }
  },
  
  getModificationsForTemplate: (templateId) => {
    const state = get()
    return state.templateModifications.filter(c => c.templateId === templateId)
  },
  
  getModificationForRoute: (route) => {
    const state = get()
    return state.templateModifications.find(c => c.route === route) || null
  },
  
  exemptFromUpdates: (route) => {
    const state = get()
    const newExemptedRoutes = new Set(state.exemptedRoutes)
    newExemptedRoutes.add(route)
    
    set((s) => ({
      exemptedRoutes: newExemptedRoutes,
      templateModifications: s.templateModifications.map(c =>
        c.route === route ? { ...c, isExempt: true } : c
      )
    }))
  },
  
  removeExemption: (route) => {
    const state = get()
    const newExemptedRoutes = new Set(state.exemptedRoutes)
    newExemptedRoutes.delete(route)
    
    set((s) => ({
      exemptedRoutes: newExemptedRoutes,
      templateModifications: s.templateModifications.map(c =>
        c.route === route ? { ...c, isExempt: false } : c
      )
    }))
  },
  
  resetToBase: (route) => {
    const state = get()
    const { routeCanvasItems, journalTemplateCanvas } = state
    
    let journalCode: string | null = null
    
    if (route.startsWith('journal/')) {
      journalCode = route.replace('journal/', '')
    } else {
      const journalCodeMatch = route.match(/\/toc\/([^\/]+)/)
      journalCode = journalCodeMatch ? journalCodeMatch[1] : null
    }
    
    const newRouteCanvasItems = { ...routeCanvasItems }
    delete newRouteCanvasItems[route]
    
    const newJournalTemplateCanvas = { ...journalTemplateCanvas }
    if (journalCode) {
      delete newJournalTemplateCanvas[journalCode]
    }
    
    set((s) => ({
      routeCanvasItems: newRouteCanvasItems,
      journalTemplateCanvas: newJournalTemplateCanvas,
      templateModifications: s.templateModifications.filter(c => 
        c.route !== route && c.route !== `journal/${journalCode}`
      )
    }))
  },
  
  promoteToBase: (route, _templateId) => {
    const state = get()
    const { routeCanvasItems, journalTemplateCanvas } = state
    
    const isJournalTemplate = route.startsWith('journal/')
    let customizedCanvas: CanvasItem[]
    
    if (isJournalTemplate) {
      const journalCode = route.replace('journal/', '')
      customizedCanvas = journalTemplateCanvas[journalCode] || []
    } else {
      customizedCanvas = routeCanvasItems[route] || []
    }
    
    if (!customizedCanvas || customizedCanvas.length === 0) {
      debugLog('warn', `No customized canvas found for route ${route}`)
      return
    }
    
    set({ globalTemplateCanvas: customizedCanvas })
    
    if (isJournalTemplate) {
      const journalCode = route.replace('journal/', '')
      const newJournalTemplateCanvas = { ...journalTemplateCanvas }
      delete newJournalTemplateCanvas[journalCode]
      set({ journalTemplateCanvas: newJournalTemplateCanvas })
    } else {
      const newRouteCanvasItems = { ...routeCanvasItems }
      delete newRouteCanvasItems[route]
      set({ routeCanvasItems: newRouteCanvasItems })
    }
    
    set((s) => ({
      templateModifications: s.templateModifications.filter(c => c.route !== route)
    }))
  },
  
  promoteToJournalTemplate: (route, journalCode, _templateId) => {
    const state = get()
    const { routeCanvasItems } = state
    const customizedCanvas = routeCanvasItems[route]
    
    if (!customizedCanvas) {
      debugLog('warn', `No customized canvas found for route ${route}`)
      return
    }
    
    set((s) => ({
      journalTemplateCanvas: {
        ...s.journalTemplateCanvas,
        [journalCode]: customizedCanvas
      }
    }))
    
    const newRouteCanvasItems = { ...routeCanvasItems }
    delete newRouteCanvasItems[route]
    
    set((s) => ({
      routeCanvasItems: newRouteCanvasItems,
      templateModifications: s.templateModifications.map(c =>
        c.route === route 
          ? { ...c, route: `journal/${journalCode}`, modificationCount: c.modificationCount }
          : c
      )
    }))
  },
  
  promoteToPublisherTheme: (_templateId, _journalCode) => {
    const state = get()
    const { globalTemplateCanvas } = state
    
    if (!globalTemplateCanvas || globalTemplateCanvas.length === 0) {
      debugLog('warn', `No base template found to promote to publisher theme`)
      return
    }
    
    debugLog('log', `✅ Base template promoted to Publisher Theme`)
  },
  
  updateModificationCount: (route, count) => {
    set((s) => ({
      templateModifications: s.templateModifications.map(c =>
        c.route === route ? { ...c, modificationCount: count, lastModified: new Date() } : c
      )
    }))
  },
  
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

// Export store type for external use
export type { PageState }

