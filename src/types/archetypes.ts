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
 * Archetype (Master Template)
 * Defines the structure, layout, and default content for pages that can be inherited
 */
export interface Archetype {
  id: string
  type: 'archetype'
  name: string // Display name (e.g., "Modern Journal Home")
  description?: string
  designId: string // Design/Theme ID this archetype belongs to (e.g., "classic-ux3-theme") - also used as themeId for rendering
  pageConfig?: PageConfig // Page layout and configuration settings
  canvasItems: WidgetSection[] // Sections with zoneSlug properties
  createdAt: Date
  updatedAt: Date
}

/**
 * Page Instance (overrides archetype)
 * Stores only overridden zones, inherits everything else from archetype
 */
export interface PageInstance {
  id: string
  type: 'page'
  websiteId: string
  pageId: string // Route/page identifier (e.g., "journal/jas")
  templateId: string // Reference to archetype ID
  overrides: {
    [zoneSlug: string]: WidgetSection // Only overridden zones are stored here
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

