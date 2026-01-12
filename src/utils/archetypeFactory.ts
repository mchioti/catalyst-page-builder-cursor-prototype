/**
 * Archetype Factory - Creates archetypes from templates
 */

import type { Archetype, PageConfig } from '../types/archetypes'
import type { WidgetSection } from '../types/widgets'
import { createJournalHomeTemplate } from '../components/PageBuilder/pageStubs'
import { getArchetypeById, saveArchetype } from '../stores/archetypeStore'
import { createDebugLogger } from './logger'

// Control logging for this file
const DEBUG = false
const debugLog = createDebugLogger(DEBUG)

/**
 * Create Journal Home archetype from the existing template
 * Maps sections to zone slugs based on the zone specification
 */
export function createJournalHomeArchetype(designId: string = 'classic-ux3-theme'): Archetype {
  // Get the template sections (without context data)
  const templateSections = createJournalHomeTemplate('catalyst-demo')
  
    // Map sections to zones and add zoneSlug
    const archetypeSections: WidgetSection[] = []
    
    for (let i = 0; i < templateSections.length; i++) {
      const section = templateSections[i]
      let zoneSlug: string | undefined
      let locked = false
      
      // Map based on section name and content
      if (section.name === 'Journal Banner' || i === 0) {
        zoneSlug = 'hero_primary' // Z_Hero
        locked = false // Tier 3 (Local)
      } else if (section.name === 'Journal Navigation' || section.name.includes('Navigation')) {
        zoneSlug = 'header_local' // Z_Context_Nav
        locked = false // Tier 2 (Archetype) - but editable
      } else if (section.name === 'Main Content') {
        // Keep the Main Content section as-is with one-third-right layout
        // This section contains both areas:
        // - Left (2/3): Latest Articles heading + publication-list
        // - Right (1/3): Cover Image + Journal Metrics placeholders
        // The layout is already set to 'one-third-right' in the template
        zoneSlug = 'body_main' // Combined zone for main content area
        locked = false // Tier 2 (Archetype)
        
        // Clean up publication data from widgets (keep only config)
        const cleanedSection = cleanSectionForArchetype(section)
        
        // Ensure both areas are preserved
        if (!cleanedSection.areas || cleanedSection.areas.length !== 2) {
          debugLog('warn', '⚠️ Main Content section should have 2 areas (Left 2/3 and Right 1/3)')
        }
        
        archetypeSections.push({
          ...cleanedSection,
          zoneSlug,
          locked
        })
        
        continue // Skip the default push below
      }
      
      // Clean up publication data from widgets (keep only config)
      const cleanedSection = cleanSectionForArchetype(section)
      
      archetypeSections.push({
        ...cleanedSection,
        zoneSlug,
        locked
      })
    }
  
  // Default page config with right rail layout
  const defaultPageConfig: PageConfig = {
    layout: 'right_rail',
    width: 'max_xl',
    contentMode: 'light',
    showBreadcrumbs: true
  }


  return {
    id: 'modern-journal-home',
    type: 'archetype',
    name: 'Modern Journal Home',
    description: 'Journal homepage template with banner, navigation, and latest articles feed',
    designId, // designId is used both for storage organization and as themeId for rendering
    displayLabel: {
      singular: 'Journal',
      plural: 'Journals'
    },
    pageConfig: defaultPageConfig,
    canvasItems: archetypeSections,
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

/**
 * Clean section for archetype storage
 * Removes data arrays (publications) but keeps configuration
 * Also ensures sectionId is set correctly on widgets
 */
function cleanSectionForArchetype(section: WidgetSection): WidgetSection {
  const cleaned = { ...section }
  
  // Recursively clean widgets in all areas and set sectionId
  if (cleaned.areas) {
    cleaned.areas = cleaned.areas.map(area => ({
      ...area,
      widgets: area.widgets.map(widget => ({
        ...cleanWidgetForArchetype(widget),
        sectionId: cleaned.id // Set sectionId to match the section's ID
      }))
    }))
  }
  
  return cleaned
}

/**
 * Clean widget for archetype storage
 * Removes publications array but keeps contentSource, cardConfig, etc.
 * Also converts journal-latest to dynamic-query for archetypes (so they generate mock data)
 */
function cleanWidgetForArchetype(widget: any): any {
  const cleaned = { ...widget }
  
  // Remove publications array from publication-list widgets
  if (widget.type === 'publication-list' && 'publications' in widget) {
    delete cleaned.publications
    // Note: contentSource should already be 'dynamic-query' - journal context comes from page context at runtime
  }
  
  // Remove publication object from publication-details widgets (keep empty object for structure)
  if (widget.type === 'publication-details' && widget.publication) {
    // Keep empty object to maintain structure, but clear any actual data
    cleaned.publication = {}
  }
  
  return cleaned
}

/**
 * Migrate old split structure (body_feed + sidebar_primary) back to combined structure (body_main)
 * This converts archetypes that were created with the old splitting logic
 */
function migrateSplitStructureToCombined(archetype: Archetype): Archetype {
  const bodyFeedSection = archetype.canvasItems.find(s => s.zoneSlug === 'body_feed')
  const sidebarSection = archetype.canvasItems.find(s => s.zoneSlug === 'sidebar_primary')
  
  // If we have both split sections, combine them back into one section
  if (bodyFeedSection && sidebarSection) {
    debugLog('log', '🔄 Migrating archetype: Combining split sections (body_feed + sidebar_primary) into body_main')
    debugLog('log', '  - body_feed widgets:', bodyFeedSection.areas?.[0]?.widgets?.length || 0)
    debugLog('log', '  - sidebar_primary widgets:', sidebarSection.areas?.[0]?.widgets?.length || 0)
    
    // Get widgets from both sections
    const leftAreaWidgets = bodyFeedSection.areas?.[0]?.widgets || []
    const rightAreaWidgets = sidebarSection.areas?.[0]?.widgets || []
    
    // Create combined section with one-third-right layout
    const combinedSection: WidgetSection = {
      id: bodyFeedSection.id, // Use the body_feed section ID
      name: 'Main Content',
      type: 'content-block',
      layout: 'one-third-right',
      zoneSlug: 'body_main',
      locked: false,
      areas: [
        {
          id: bodyFeedSection.areas?.[0]?.id || '',
          name: 'Left (2/3)',
          widgets: leftAreaWidgets.map(w => ({
            ...w,
            sectionId: bodyFeedSection.id
          }))
        },
        {
          id: sidebarSection.areas?.[0]?.id || '',
          name: 'Right (1/3)',
          widgets: rightAreaWidgets.map(w => ({
            ...w,
            sectionId: bodyFeedSection.id
          }))
        }
      ]
    }
    
    debugLog('log', '  - Combined section areas:', combinedSection.areas.length)
    debugLog('log', '  - Left area widgets:', combinedSection.areas[0].widgets.length)
    debugLog('log', '  - Right area widgets:', combinedSection.areas[1].widgets.length)
    
    // Replace the split sections with the combined section
    const newCanvasItems = archetype.canvasItems.filter(
      s => s.zoneSlug !== 'body_feed' && s.zoneSlug !== 'sidebar_primary'
    )
    
    // Find the index where body_feed was (to maintain order)
    const bodyFeedIndex = archetype.canvasItems.findIndex(s => s.zoneSlug === 'body_feed')
    if (bodyFeedIndex >= 0) {
      newCanvasItems.splice(bodyFeedIndex, 0, combinedSection)
    } else {
      newCanvasItems.push(combinedSection)
    }
    
    return {
      ...archetype,
      canvasItems: newCanvasItems,
      updatedAt: new Date()
    }
  }
  
  return archetype
}

/**
 * Initialize archetype if it doesn't exist
 * Also migrates existing archetypes to include pageConfig if missing
 * And migrates old split structure to combined structure
 * And removes deprecated 'theme' field (now using designId only)
 */
export function initializeJournalHomeArchetype(designId: string = 'classic-ux3-theme') {
  console.log(`🏭 [initializeJournalHomeArchetype] designId=${designId}`)
  const existing = getArchetypeById('modern-journal-home', designId)
  console.log(`   - Existing archetype found: ${!!existing}`)
  if (existing) {
    console.log(`   - Existing canvasItems: ${existing.canvasItems?.length}`)
    console.log(`   - First section widgets:`, existing.canvasItems?.[0]?.areas?.[0]?.widgets?.map((w: any) => w.type))
  }
  if (!existing) {
    console.log(`   - Creating NEW archetype from factory`)
    const archetype = createJournalHomeArchetype(designId)
    saveArchetype(archetype)
    return archetype
  }
  
  let needsSave = false
  let migrated = existing
  
  // Migrate: Remove deprecated 'theme' field (now using designId only)
  if ('theme' in migrated) {
    debugLog('log', `🔄 Migrating archetype: Removing deprecated 'theme' field (using designId: ${migrated.designId} instead)`)
    const { theme, ...rest } = migrated as any
    migrated = rest as Archetype
    needsSave = true
  }
  
  // Migrate old split structure to combined structure
  const hasSplitStructure = existing.canvasItems.some(s => 
    s.zoneSlug === 'body_feed' || s.zoneSlug === 'sidebar_primary'
  )
  if (hasSplitStructure) {
    migrated = migrateSplitStructureToCombined(existing)
    needsSave = true
  }
  
  // Migrate existing archetype to include pageConfig if missing
  if (!migrated.pageConfig) {
    debugLog('log', '🔄 Migrating archetype to include pageConfig')
    const defaultPageConfig: PageConfig = {
      layout: 'right_rail',
      width: 'max_xl',
      contentMode: 'light',
      showBreadcrumbs: true
    }
    migrated.pageConfig = defaultPageConfig
    needsSave = true
  }
  
  if (needsSave) {
    migrated.updatedAt = new Date()
    saveArchetype(migrated)
  }
  
  return migrated
}

