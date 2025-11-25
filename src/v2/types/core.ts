/**
 * V2 Core Type Definitions
 * Section-Centric Architecture
 * 
 * Philosophy: Everything is a Shared Section.
 * Pages are just compositions of shared sections with optional overrides.
 */

import type { Widget } from '../../types/widgets'

// ============================================================================
// SHARED SECTIONS (Core Primitive)
// ============================================================================

export type SectionCategory = 
  | 'header' 
  | 'footer' 
  | 'hero' 
  | 'content' 
  | 'cta' 
  | 'navigation'
  | 'announcement'

export type SectionVariation = {
  id: string
  name: string
  description?: string
  
  // Section content
  widgets: Widget[]  // For base variations: full widget list. For child variations: only added widgets
  layout: 'one-column' | 'two-columns' | 'three-columns' | 'flexible' | 'grid'
  
  // Styling
  background?: {
    type: 'color' | 'gradient' | 'image'
    color?: string
    gradient?: string
    imageUrl?: string
  }
  contentMode?: 'light' | 'dark'
  
  // Layout-specific configs
  flexConfig?: {
    direction: 'row' | 'column'
    wrap: boolean
    justifyContent: string
    gap: string
  }
  gridConfig?: {
    columns: number
    gap: string
  }
  
  // Variation-to-Variation Inheritance (NEW)
  inheritsFrom?: string  // Parent variation key (e.g., 'base', 'full')
  hiddenWidgetIds?: string[]  // IDs of parent widgets to hide in this variation
  widgetOverrides?: WidgetOverride[]  // Property overrides for inherited widgets
  widgetOrder?: string[]  // Custom ordering for inherited + added widgets
  
  // Metadata
  createdAt: Date
  updatedAt: Date
}

export type WidgetOverride = {
  widgetId: string  // ID of the widget to override
  properties: Partial<Widget>  // Only the properties to override
}

export type SharedSection = {
  id: string
  name: string
  category: SectionCategory
  description?: string
  
  // Variations of this section
  variations: {
    [key: string]: SectionVariation  // key: 'base', 'compact', 'minimal', etc.
  }
  
  // Inheritance settings
  isGlobal: boolean  // true = applies to all sites in theme
  allowOverrides: boolean
  lockLevel: 'unlocked' | 'locked' | 'admin-only'
  
  // Usage tracking
  usedBy: {
    websiteId: string
    pageIds: string[]
    hasOverrides: boolean
  }[]
  
  // Metadata
  themeId?: string  // If theme-level section
  websiteId?: string  // If website-specific section
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// PAGES (Compositions of Shared Sections)
// ============================================================================

export type SectionCompositionItem = {
  id: string  // Unique instance ID
  sharedSectionId: string  // Reference to SharedSection
  variationKey: string  // Which variation to use
  
  // Page-specific overrides (optional)
  overrides?: {
    widgets?: Partial<Widget>[]  // Override specific widgets
    background?: any
    layout?: any
  }
  
  // Inheritance tracking
  inheritFromTheme: boolean
  lastSyncedAt?: Date
  divergenceCount: number
}

export type Page = {
  id: string
  name: string
  slug: string
  websiteId: string
  journalId?: string  // Optional: if this page belongs to a journal
  
  // Page is just a composition of sections
  composition: SectionCompositionItem[]
  
  // Metadata
  status: 'draft' | 'published'
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
}

// ============================================================================
// JOURNALS (Within Websites)
// ============================================================================

export type Journal = {
  id: string
  name: string
  acronym?: string
  description?: string
  
  // Journal metadata
  issn?: {
    print?: string
    online?: string
  }
  impactFactor?: number
  isOpenAccess?: boolean
  isDiscontinued?: boolean
  discontinuedDate?: Date
  
  // Branding (overrides website branding)
  branding?: {
    primaryColor?: string
    secondaryColor?: string
    logoUrl?: string
  }
  
  // Status
  status: 'active' | 'discontinued' | 'coming-soon'
  
  // Metadata
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// WEBSITES
// ============================================================================

export type Website = {
  id: string
  name: string
  domain: string
  themeId: string
  
  // Website-specific shared sections (override theme sections)
  sharedSections: SharedSection[]
  
  // Journals (for publishing platforms)
  journals?: Journal[]
  
  // Pages (can belong to website or to a journal)
  pages: Page[]
  
  // Branding overrides
  branding: {
    primaryColor?: string
    secondaryColor?: string
    logoUrl?: string
    fontFamily?: string
  }
  
  // Publishing
  status: 'active' | 'staging' | 'maintenance'
  
  // Metadata
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// THEMES
// ============================================================================

export type Theme = {
  id: string
  name: string
  version: string
  
  // Theme provides a library of shared sections
  sharedSections: SharedSection[]
  
  // Optional: Curated page templates (convenience)
  pageTemplates?: {
    id: string
    name: string
    description: string
    composition: {
      sharedSectionId: string
      variationKey: string
    }[]
  }[]
  
  // Design system tokens
  designTokens: {
    colors: Record<string, string>
    typography: Record<string, any>
    spacing: Record<string, string>
  }
  
  // Metadata
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// CHANGE TRACKING & INHERITANCE
// ============================================================================

export type ChangeRecord = {
  id: string
  type: 'section-update' | 'section-override' | 'section-delete'
  sharedSectionId: string
  websiteId?: string
  pageId?: string
  
  changeDetails: {
    field: string
    oldValue: any
    newValue: any
  }
  
  propagation: {
    affectedWebsites: string[]
    affectedPages: string[]
    autoApplied: boolean
  }
  
  timestamp: Date
  userId?: string
}

export type InheritanceMap = {
  sharedSectionId: string
  themeVersion: string
  
  websites: {
    websiteId: string
    status: 'synced' | 'modified' | 'overridden'
    lastSyncedAt: Date
    divergenceCount: number
    
    pages: {
      pageId: string
      status: 'synced' | 'modified' | 'overridden'
      overrides: any[]
    }[]
  }[]
}

