/**
 * Page Store - Zustand store for V1 Page Builder
 * 
 * Extracted from AppV1.tsx for better modularity.
 * This is the first step in refactoring V1's architecture.
 */

import { create } from 'zustand'
import { nanoid } from 'nanoid'
import { arrayMove } from '@dnd-kit/sortable'

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

// Constants
import { DEFAULT_PUBLICATION_CARD_CONFIG } from '../constants'

// Debug logger
import { createDebugLogger } from '../utils/logger'
const DEBUG = false
const debugLog = createDebugLogger(DEBUG)

// =============================================================================
// LocalStorage Persistence
// =============================================================================

const STORAGE_KEYS = {
  CUSTOM_STARTER_PAGES: 'catalyst-custom-starter-pages',
  CUSTOM_SECTIONS: 'catalyst-custom-sections'
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
    console.error(`Failed to load ${key} from localStorage:`, error)
    return defaultValue
  }
}

const saveToLocalStorage = <T,>(key: string, data: T[]) => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error(`Failed to save ${key} to localStorage:`, error)
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
  routeCanvasItems: {},
  globalTemplateCanvas: [],
  journalTemplateCanvas: {},
  
  // Per-website, per-page canvas storage (for Live Site integration)
  // Key format: "websiteId:pageId" -> CanvasItem[]
  pageCanvasData: {} as Record<string, CanvasItem[]>,
  customSections: initializeCustomSections(),
  customStarterPages: initializeCustomStarterPages(),
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
  clearPageCanvas: (websiteId: string, pageId: string) => set((state) => {
    const newPageCanvasData = { ...state.pageCanvasData }
    delete newPageCanvasData[`${websiteId}:${pageId}`]
    return { pageCanvasData: newPageCanvasData }
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
      console.warn(`No customized canvas found for route ${route}`)
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
      console.warn(`No customized canvas found for route ${route}`)
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
      console.warn(`No base template found to promote to publisher theme`)
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

