/**
 * Content Store - Manages websites, themes, templates, and schema objects
 * 
 * This is the "data" layer - content that's edited via the page builder.
 */

import { create } from 'zustand'
import { nanoid } from 'nanoid'
import type { BaseTemplate, Website, Theme, Modification } from '../types/templates'
import type { SchemaObject, SchemaOrgType } from '../types/schema'
import type { PublicationCardVariant, CanvasItem } from '../types/widgets'
import type { TemplateModification } from '../types/app'
import { mockWebsites } from '../data/mockWebsites'
import { mockThemes } from '../data/mockThemes'
import { DEFAULT_PUBLICATION_CARD_CONFIG } from '../constants'
import { createDebugLogger } from '../utils/logger'

const DEBUG = false
const debugLog = createDebugLogger(DEBUG)

// =============================================================================
// Types
// =============================================================================

export interface ContentState {
  // Data
  websites: Website[]
  themes: Theme[]
  templates: BaseTemplate[]
  schemaObjects: SchemaObject[]
  selectedSchemaObject: SchemaObject | null
  publicationCardVariants: PublicationCardVariant[]
  
  // Template Divergence Tracking
  templateModifications: TemplateModification[]
  exemptedRoutes: Set<string>
  
  // Website Actions
  addWebsite: (website: Website) => void
  updateWebsite: (id: string, website: Partial<Website>) => void
  removeWebsite: (id: string) => void
  
  // Theme Actions
  addTheme: (theme: Theme) => void
  updateTheme: (id: string, theme: Partial<Theme>) => void
  removeTheme: (id: string) => void
  
  // Template Actions
  addTemplate: (template: BaseTemplate) => void
  updateTemplate: (id: string, template: Partial<BaseTemplate>) => void
  removeTemplate: (id: string) => void
  duplicateTemplate: (id: string) => void
  
  // Schema Object Actions
  addSchemaObject: (object: Omit<SchemaObject, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateSchemaObject: (id: string, updates: Partial<SchemaObject>) => void
  removeSchemaObject: (id: string) => void
  selectSchemaObject: (id: string | null) => void
  getSchemaObjectsByType: (type: SchemaOrgType) => SchemaObject[]
  searchSchemaObjects: (query: string) => SchemaObject[]
  
  // Modification Management
  addModification: (websiteId: string, modification: Modification) => void
  removeModification: (websiteId: string, modificationPath: string) => void
  calculateDeviationScore: (websiteId: string) => number
  
  // Publication Card Variants
  addPublicationCardVariant: (variant: PublicationCardVariant) => void
  removePublicationCardVariant: (id: string) => void
  
  // Template Divergence Management
  trackModification: (route: string, journalCode: string, journalName: string, templateId: string) => void
  getModificationsForTemplate: (templateId: string) => TemplateModification[]
  getModificationForRoute: (route: string) => TemplateModification | null
  exemptFromUpdates: (route: string) => void
  removeExemption: (route: string) => void
  updateModificationCount: (route: string, count: number) => void
  
  // Template Promotion (these need canvas access, kept for interface compatibility)
  resetToBase: (route: string, canvasState: { routeCanvasItems: Record<string, CanvasItem[]>, journalTemplateCanvas: Record<string, CanvasItem[]> }) => { routeCanvasItems: Record<string, CanvasItem[]>, journalTemplateCanvas: Record<string, CanvasItem[]> }
}

// =============================================================================
// Initial Data
// =============================================================================

const initialSchemaObjects: SchemaObject[] = [
  {
    id: 'blog-post-1',
    type: 'BlogPosting' as SchemaOrgType,
    name: 'Getting Started with Page Builders',
    data: {
      name: 'Getting Started with Page Builders',
      headline: 'Getting Started with Page Builders: A Complete Guide',
      author: { '@type': 'Person', name: 'Sarah Johnson', jobTitle: 'UX Designer' },
      datePublished: '2024-01-15T10:00:00Z',
      description: 'Learn how to create stunning websites with modern page builder tools.',
      keywords: ['page builder', 'web design', 'no-code'],
      wordCount: 1200,
      url: 'https://example.com/blog/getting-started-page-builders'
    },
    jsonLD: '{}',
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
    jsonLD: '{}',
    tags: ['researcher', 'ai', 'academia'],
    createdAt: new Date('2024-01-10T14:30:00Z'),
    updatedAt: new Date('2024-01-10T14:30:00Z')
  }
]

const initialPublicationCardVariants: PublicationCardVariant[] = [
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
]

// =============================================================================
// Store
// =============================================================================

export const useContentStore = create<ContentState>((set, get) => ({
  // Data
  websites: mockWebsites,
  themes: mockThemes,
  templates: [],
  schemaObjects: initialSchemaObjects,
  selectedSchemaObject: null,
  publicationCardVariants: initialPublicationCardVariants,
  
  // Template Divergence Tracking
  templateModifications: [],
  exemptedRoutes: new Set<string>(),
  
  // Website Actions
  addWebsite: (website) => set((state) => ({
    websites: [...state.websites, website]
  })),
  updateWebsite: (id, website) => set((state) => ({
    websites: state.websites.map(w => w.id === id ? { ...w, ...website, updatedAt: new Date() } : w)
  })),
  removeWebsite: (id) => set((state) => ({
    websites: state.websites.filter(w => w.id !== id)
  })),
  
  // Theme Actions
  addTheme: (theme) => set((state) => ({
    themes: [...state.themes, theme]
  })),
  updateTheme: (id, theme) => set((state) => ({
    themes: state.themes.map(t => t.id === id ? { ...t, ...theme } : t)
  })),
  removeTheme: (id) => set((state) => ({
    themes: state.themes.filter(t => t.id !== id)
  })),
  
  // Template Actions
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
  
  // Schema Object Actions
  addSchemaObject: (object) => {
    const id = `schema-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const now = new Date()
    const newObject: SchemaObject = { ...object, id, createdAt: now, updatedAt: now }
    set((state) => ({ schemaObjects: [...state.schemaObjects, newObject] }))
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
    return get().schemaObjects.filter(obj => obj.type === type)
  },
  searchSchemaObjects: (query) => {
    const lowerQuery = query.toLowerCase()
    return get().schemaObjects.filter(obj => 
      obj.name.toLowerCase().includes(lowerQuery) ||
      obj.type.toLowerCase().includes(lowerQuery) ||
      (obj.tags && obj.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
    )
  },
  
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
  
  // Publication Card Variants
  addPublicationCardVariant: (variant) => set((s) => ({ 
    publicationCardVariants: [...s.publicationCardVariants, variant] 
  })),
  removePublicationCardVariant: (id) => set((s) => ({ 
    publicationCardVariants: s.publicationCardVariants.filter(v => v.id !== id) 
  })),
  
  // Template Divergence Management
  trackModification: (route, journalCode, journalName, templateId) => {
    debugLog('log', '🔵 trackModification:', { route, journalCode, journalName, templateId })
    const state = get()
    const existing = state.templateModifications.find(c => c.route === route)
    
    if (existing) {
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
    return get().templateModifications.filter(c => c.templateId === templateId)
  },
  
  getModificationForRoute: (route) => {
    return get().templateModifications.find(c => c.route === route) || null
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
  
  updateModificationCount: (route, count) => {
    set((s) => ({
      templateModifications: s.templateModifications.map(c =>
        c.route === route ? { ...c, modificationCount: count, lastModified: new Date() } : c
      )
    }))
  },
  
  // Template Reset (returns new canvas state, doesn't modify it directly)
  resetToBase: (route, canvasState) => {
    let journalCode: string | null = null
    
    if (route.startsWith('journal/')) {
      journalCode = route.replace('journal/', '')
    } else {
      const match = route.match(/\/toc\/([^\/]+)/)
      journalCode = match ? match[1] : null
    }
    
    const newRouteCanvasItems = { ...canvasState.routeCanvasItems }
    delete newRouteCanvasItems[route]
    
    const newJournalTemplateCanvas = { ...canvasState.journalTemplateCanvas }
    if (journalCode) {
      delete newJournalTemplateCanvas[journalCode]
    }
    
    // Update template modifications in this store
    set((s) => ({
      templateModifications: s.templateModifications.filter(c => 
        c.route !== route && c.route !== `journal/${journalCode}`
      )
    }))
    
    return { routeCanvasItems: newRouteCanvasItems, journalTemplateCanvas: newJournalTemplateCanvas }
  }
}))

