/**
 * Archetype Store - Manages archetypes (Master templates) and page instances
 * 
 * Archetypes are stored nested under designs: designs[designId].archetypes[]
 * Page instances are stored separately: pageInstances[websiteId:pageId]
 */

import type { Archetype, PageInstance, OverrideHistoryEntry } from '../types/archetypes'
import type { WidgetSection } from '../types/widgets'
import { createDebugLogger } from '../utils/logger'

// Control logging for this file
const DEBUG = false
const debugLog = createDebugLogger(DEBUG)

const STORAGE_KEYS = {
  DESIGNS: 'catalyst-designs', // Stores designs with nested archetypes
  PAGE_INSTANCES: 'catalyst-page-instances'
}

// =============================================================================
// Archetype Storage (nested under designs)
// =============================================================================

/**
 * Load all designs with their archetypes from localStorage
 */
export function loadDesignsWithArchetypes(): Record<string, { archetypes: Archetype[] }> {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.DESIGNS)
    if (!stored) return {}
    return JSON.parse(stored, (key, value) => {
      // Revive Date objects
      if (key === 'createdAt' || key === 'updatedAt') {
        return new Date(value)
      }
      return value
    })
  } catch (error) {
    debugLog('error', 'Failed to load designs with archetypes:', error)
    return {}
  }
}

/**
 * Save designs with archetypes to localStorage
 */
export function saveDesignsWithArchetypes(designs: Record<string, { archetypes: Archetype[] }>) {
  try {
    localStorage.setItem(STORAGE_KEYS.DESIGNS, JSON.stringify(designs))
  } catch (error) {
    debugLog('error', 'Failed to save designs with archetypes:', error)
  }
}

/**
 * Get archetypes for a specific design
 */
export function getArchetypesForDesign(designId: string): Archetype[] {
  const designs = loadDesignsWithArchetypes()
  return designs[designId]?.archetypes || []
}

/**
 * Get a specific archetype by ID
 */
export function getArchetypeById(archetypeId: string, designId: string): Archetype | null {
  const archetypes = getArchetypesForDesign(designId)
  return archetypes.find(a => a.id === archetypeId) || null
}

/**
 * Save an archetype (adds or updates)
 */
export function saveArchetype(archetype: Archetype) {
  const designs = loadDesignsWithArchetypes()
  
  if (!designs[archetype.designId]) {
    designs[archetype.designId] = { archetypes: [] }
  }
  
  const existingIndex = designs[archetype.designId].archetypes.findIndex(a => a.id === archetype.id)
  
  if (existingIndex >= 0) {
    // Update existing
    designs[archetype.designId].archetypes[existingIndex] = archetype
  } else {
    // Add new
    designs[archetype.designId].archetypes.push(archetype)
  }
  
  saveDesignsWithArchetypes(designs)
}

/**
 * Delete an archetype
 */
export function deleteArchetype(archetypeId: string, designId: string) {
  const designs = loadDesignsWithArchetypes()
  
  if (designs[designId]) {
    designs[designId].archetypes = designs[designId].archetypes.filter(a => a.id !== archetypeId)
    saveDesignsWithArchetypes(designs)
  }
}

// =============================================================================
// Page Instance Storage
// =============================================================================

/**
 * Load all page instances from localStorage
 */
export function loadPageInstances(): Record<string, PageInstance> {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PAGE_INSTANCES)
    if (!stored) return {}
    return JSON.parse(stored, (key, value) => {
      if (key === 'createdAt' || key === 'updatedAt') {
        return new Date(value)
      }
      return value
    })
  } catch (error) {
    debugLog('error', 'Failed to load page instances:', error)
    return {}
  }
}

/**
 * Save page instances to localStorage
 */
export function savePageInstances(instances: Record<string, PageInstance>) {
  try {
    localStorage.setItem(STORAGE_KEYS.PAGE_INSTANCES, JSON.stringify(instances))
  } catch (error) {
    debugLog('error', 'Failed to save page instances:', error)
  }
}

/**
 * Get page instance key (websiteId:pageId)
 */
function getInstanceKey(websiteId: string, pageId: string): string {
  return `${websiteId}:${pageId}`
}

/**
 * Get a page instance
 */
export function getPageInstance(websiteId: string, pageId: string): PageInstance | null {
  const instances = loadPageInstances()
  const key = getInstanceKey(websiteId, pageId)
  return instances[key] || null
}

/**
 * Save a page instance
 */
export function savePageInstance(instance: PageInstance) {
  const instances = loadPageInstances()
  const key = getInstanceKey(instance.websiteId, instance.pageId)
  instances[key] = instance
  savePageInstances(instances)
}

/**
 * Delete a page instance
 */
export function deletePageInstance(websiteId: string, pageId: string) {
  const instances = loadPageInstances()
  const key = getInstanceKey(websiteId, pageId)
  delete instances[key]
  savePageInstances(instances)
}

/**
 * Get all page instances that use a specific archetype
 */
export function getPageInstancesByArchetype(archetypeId: string): PageInstance[] {
  const instances = loadPageInstances()
  return Object.values(instances).filter(instance => instance.templateId === archetypeId)
}

/**
 * Count how many page instances (journals) are using a specific archetype
 */
export function countPageInstancesByArchetype(archetypeId: string): number {
  return getPageInstancesByArchetype(archetypeId).length
}

/**
 * Get page instance details that need their cached canvas invalidated
 * Returns array of { websiteId, pageId } for pages using the archetype
 * The caller should use pageStore.clearPageCanvas() or similar to actually clear them
 */
export function getPagesUsingArchetype(archetypeId: string): Array<{ websiteId: string; pageId: string }> {
  const instances = getPageInstancesByArchetype(archetypeId)
  return instances.map(instance => ({
    websiteId: instance.websiteId,
    pageId: instance.pageId
  }))
}

/**
 * Override a zone in a Page Instance
 * Creates or updates the override for the specified zone
 * Maintains history for undo functionality
 */
export function overrideZone(
  instance: PageInstance, 
  zoneSlug: string, 
  section: WidgetSection,
  description?: string // Optional description for history
): PageInstance {
  debugLog('log', '💾 [overrideZone] Saving override:', {
    instanceId: `${instance.websiteId}:${instance.pageId}`,
    zoneSlug,
    sectionName: section.name,
    widgetCount: section.areas?.reduce((sum, a) => sum + (a.widgets?.length || 0), 0) || 0,
    existingOverrides: Object.keys(instance.overrides)
  })
  
  const now = new Date()
  const existingOverride = instance.overrides[zoneSlug]
  const existingHistory = instance.overrideHistory?.[zoneSlug]
  
  // Build updated history
  let newHistory = existingHistory?.history || []
  if (existingOverride) {
    // Push current override to history before replacing it
    newHistory = [
      ...newHistory,
      {
        timestamp: existingHistory?.committedAt || instance.updatedAt,
        section: existingOverride,
        description: undefined // Previous version
      }
    ]
  }
  
  const updated: PageInstance = {
    ...instance,
    overrides: {
      ...instance.overrides,
      [zoneSlug]: section
    },
    overrideHistory: {
      ...instance.overrideHistory,
      [zoneSlug]: {
        committedAt: now,
        history: newHistory
      }
    },
    updatedAt: now
  }
  savePageInstance(updated)
  
  debugLog('log', '✅ [overrideZone] Override saved to localStorage:', {
    instanceId: `${updated.websiteId}:${updated.pageId}`,
    updatedOverrides: Object.keys(updated.overrides)
  })
  
  return updated
}

/**
 * Remove an override from a Page Instance (revert to archetype)
 * Also clears the history for that zone
 */
export function inheritZone(instance: PageInstance, zoneSlug: string): PageInstance {
  // Remove from overrides
  const newOverrides = Object.fromEntries(
    Object.entries(instance.overrides).filter(([key]) => key !== zoneSlug)
  )
  
  // Remove from history
  const newHistory = instance.overrideHistory 
    ? Object.fromEntries(
        Object.entries(instance.overrideHistory).filter(([key]) => key !== zoneSlug)
      )
    : undefined
  
  const updated: PageInstance = {
    ...instance,
    overrides: newOverrides,
    overrideHistory: Object.keys(newHistory || {}).length > 0 ? newHistory : undefined,
    updatedAt: new Date()
  }
  savePageInstance(updated)
  return updated
}

/**
 * Undo the last change to a zone (restore previous local version)
 * Returns null if there's no history to undo
 */
export function undoZoneOverride(instance: PageInstance, zoneSlug: string): PageInstance | null {
  const history = instance.overrideHistory?.[zoneSlug]?.history
  
  if (!history || history.length === 0) {
    debugLog('log', `[undoZoneOverride] No history to undo for zone ${zoneSlug}`)
    return null
  }
  
  // Pop the last item from history and make it the current override
  const previousVersions = [...history]
  const lastVersion = previousVersions.pop()!
  
  const updated: PageInstance = {
    ...instance,
    overrides: {
      ...instance.overrides,
      [zoneSlug]: lastVersion.section
    },
    overrideHistory: {
      ...instance.overrideHistory,
      [zoneSlug]: {
        committedAt: lastVersion.timestamp,
        history: previousVersions
      }
    },
    updatedAt: new Date()
  }
  savePageInstance(updated)
  return updated
}

/**
 * Reset all overrides (revert entire page to archetype)
 */
export function resetPageToArchetype(instance: PageInstance): PageInstance {
  const updated: PageInstance = {
    ...instance,
    overrides: {},
    overrideHistory: undefined,
    updatedAt: new Date()
  }
  savePageInstance(updated)
  return updated
}

/**
 * Get the history for a specific zone's override
 */
export function getZoneOverrideHistory(instance: PageInstance, zoneSlug: string) {
  return instance.overrideHistory?.[zoneSlug] || null
}

/**
 * Check if a zone has history that can be undone
 */
export function canUndoZoneOverride(instance: PageInstance, zoneSlug: string): boolean {
  const history = instance.overrideHistory?.[zoneSlug]?.history
  return !!(history && history.length > 0)
}

/**
 * Create a new Page Instance from an archetype
 * Initializes with empty overrides - all zones inherit from archetype
 */
export function createPageInstanceFromArchetype(
  websiteId: string,
  pageId: string,
  archetypeId: string,
  designId?: string // Optional, used for validation but not stored
): PageInstance {
  const instance: PageInstance = {
    id: `${websiteId}-${pageId}-${Date.now()}`, // Unique ID
    type: 'page',
    websiteId,
    pageId,
    templateId: archetypeId, // Reference to archetype
    overrides: {}, // Start with no overrides - all zones inherit
    createdAt: new Date(),
    updatedAt: new Date()
  }
  
  // Save the instance
  savePageInstance(instance)
  
  return instance
}

/**
 * Get or create a Page Instance for a journal home page
 * If instance doesn't exist and archetype exists, creates one automatically
 * Returns null if no archetype exists
 */
export function getOrCreatePageInstance(
  websiteId: string,
  pageId: string,
  archetypeId: string,
  designId: string
): PageInstance | null {
  // Check if instance already exists
  const existing = getPageInstance(websiteId, pageId)
  if (existing) {
    return existing
  }
  
  // Check if archetype exists
  const archetype = getArchetypeById(archetypeId, designId)
  if (!archetype) {
    // No archetype exists - return null (fallback to old template system)
    return null
  }
  
  // Create new instance from archetype
  return createPageInstanceFromArchetype(websiteId, pageId, archetypeId, designId)
}

// =============================================================================
// Zone Resolution (merge archetype + instance overrides)
// =============================================================================

/**
 * Migrate widget contentSource for archetypes
 * Note: contentSource should already be 'dynamic-query' - journal context comes from page context at runtime
 */
function migrateWidgetContentSource(widget: any): any {
  const migrated = { ...widget }
  
  // Legacy migration: Convert old journal-latest to dynamic-query (should not be needed anymore)
  if (migrated.type === 'publication-list' && migrated.contentSource === 'journal-latest') {
    migrated.contentSource = 'dynamic-query'
  }
  
  // For publication-details widgets in archetypes:
  // - Keep 'context' as 'context' (correct archetype config)
  // - Convert old 'ai-generated' back to 'context' (migration from old version)
  // The archetype stores the config (context), but in editor/preview we'll generate mock data
  // based on showMockData toggle, not based on the contentSource
  if (migrated.type === 'publication-details' && migrated.contentSource === 'ai-generated') {
    // Old migration converted context to ai-generated - convert it back
    migrated.contentSource = 'context'
    // Clear aiSource since we're using context now
    delete migrated.aiSource
  }
  
  return migrated
}

/**
 * Migrate section widgets for archetype compatibility
 */
function migrateSection(section: WidgetSection): WidgetSection {
  const migrated = { ...section }
  
  if (migrated.areas) {
    migrated.areas = migrated.areas.map(area => ({
      ...area,
      widgets: area.widgets.map(widget => migrateWidgetContentSource(widget))
    }))
  }
  
  return migrated
}

/**
 * Resolve canvas items from archetype and instance overrides
 * Returns the final canvas with archetype zones merged with instance overrides
 * Also migrates old contentSource values to ensure mock data generation
 */
export function resolveCanvasFromArchetype(
  archetype: Archetype,
  instance?: PageInstance
): WidgetSection[] {
  debugLog('log', '🔄 [resolveCanvasFromArchetype] Starting resolution:', {
    archetypeId: archetype.id,
    archetypeSections: archetype.canvasItems.map(s => ({ name: s.name, zoneSlug: s.zoneSlug })),
    instanceId: instance ? `${instance.websiteId}:${instance.pageId}` : 'none',
    instanceOverrides: instance ? Object.keys(instance.overrides) : []
  })
  
  const resolved: WidgetSection[] = []
  const overrideZoneSlugs = instance ? new Set(Object.keys(instance.overrides)) : new Set()
  
  for (const section of archetype.canvasItems) {
    if (!section.zoneSlug) {
      // Section without zone slug - include as-is (legacy support)
      debugLog('log', '  ↳ Section without zoneSlug (legacy):', section.name)
      resolved.push(migrateSection(section))
      continue
    }
    
    // Check if this zone is overridden
    if (overrideZoneSlugs.has(section.zoneSlug)) {
      // Use override from instance (also migrate it)
      const overrideSection = instance!.overrides[section.zoneSlug]
      debugLog('log', '  ↳ Using OVERRIDE for zone:', {
        zoneSlug: section.zoneSlug,
        archetypeSectionName: section.name,
        overrideSectionName: overrideSection.name,
        overrideWidgetCount: overrideSection.areas?.reduce((sum, a) => sum + (a.widgets?.length || 0), 0) || 0
      })
      resolved.push(migrateSection(overrideSection))
    } else {
      // Use archetype section (migrate it)
      debugLog('log', '  ↳ Using ARCHETYPE for zone:', {
        zoneSlug: section.zoneSlug,
        sectionName: section.name
      })
      resolved.push(migrateSection(section))
    }
  }
  
  debugLog('log', '✅ [resolveCanvasFromArchetype] Resolution complete:', {
    resolvedCount: resolved.length,
    resolvedSections: resolved.map(s => s.name)
  })
  
  return resolved
}

