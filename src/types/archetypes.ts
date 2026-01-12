// Archetype system types for Master/Instance architecture

import type { WidgetSection } from './widgets'

/**
 * Page configuration for archetypes
 */
export interface PageConfig {
  layout: 'full_width' | 'left_rail' | 'right_rail' // Page layout structure
  width?: 'max_xl' | 'max_2xl' | 'max_3xl' | 'full' // Content width constraint
  contentMode?: 'light' | 'dark' // Content mode
  showBreadcrumbs?: boolean // Show breadcrumbs navigation
}

/**
 * Display labels for contextual language
 * Used to show user-friendly terms instead of "archetype" in the UI
 */
export interface ArchetypeDisplayLabel {
  singular: string // e.g., "Journal", "Issue", "Article"
  plural: string   // e.g., "Journals", "Issues", "Articles"
}

/**
 * Archetype (Master Template)
 * Defines the structure, layout, and default content for pages that can be inherited
 */
export interface Archetype {
  id: string
  type: 'archetype'
  name: string // Display name (e.g., "Modern Journal Home")
  description?: string
  designId: string // Design/Theme ID this archetype belongs to (e.g., "classic-ux3-theme") - also used as themeId for rendering
  displayLabel: ArchetypeDisplayLabel // User-friendly labels (e.g., { singular: "Journal", plural: "Journals" })
  pageConfig?: PageConfig // Page layout and configuration settings
  canvasItems: WidgetSection[] // Sections with zoneSlug properties
  createdAt: Date
  updatedAt: Date
}

/**
 * History entry for a zone override (for undo functionality)
 */
export interface OverrideHistoryEntry {
  timestamp: Date
  section: WidgetSection
  description?: string // e.g., "Added divider widget", "Changed layout"
}

/**
 * Metadata for a zone override including history
 */
export interface ZoneOverrideInfo {
  committedAt: Date
  history: OverrideHistoryEntry[] // Previous versions (for undo), not including current
}

/**
 * Website Archetype Override
 * Stores website-level overrides for a design archetype
 * Resolution chain: Design Archetype → Website Override → Page Instance
 */
export interface WebsiteArchetypeOverride {
  id: string
  type: 'website-archetype-override'
  websiteId: string
  archetypeId: string // Reference to design archetype ID
  designId: string // Design/Theme this archetype belongs to
  overrides: {
    [zoneSlug: string]: WidgetSection // Only overridden zones are stored here
  }
  overrideHistory?: {
    [zoneSlug: string]: ZoneOverrideInfo // History for each override (for undo)
  }
  createdAt: Date
  updatedAt: Date
}

/**
 * Page Instance (overrides archetype)
 * Stores only overridden zones, inherits everything else from archetype
 * Resolution chain: Design Archetype → Website Override → Page Instance
 */
export interface PageInstance {
  id: string
  type: 'page'
  websiteId: string
  pageId: string // Route/page identifier (e.g., "journal/jas")
  templateId: string // Reference to archetype ID
  overrides: {
    [zoneSlug: string]: WidgetSection // Only overridden zones are stored here (current state)
  }
  overrideHistory?: {
    [zoneSlug: string]: ZoneOverrideInfo // History for each override (for undo)
  }
  createdAt: Date
  updatedAt: Date
}

/**
 * Zone metadata for UI display
 */
export interface ZoneMetadata {
  slug: string
  name: string
  purpose: string
  tier: 1 | 2 | 3 // 1=Global, 2=Archetype, 3=Local
  locked: boolean
}

