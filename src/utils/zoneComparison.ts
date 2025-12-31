/**
 * Zone Comparison Utilities
 * Compares current section state with archetype to detect changes (dirty zones)
 */

import type { WidgetSection } from '../types/widgets'
import { createDebugLogger } from './logger'

// Control logging for this file - Set to true to debug zone comparisons
const DEBUG = true
const debugLog = createDebugLogger(DEBUG)

/**
 * Deep comparison of two sections to detect if they differ
 * Returns true if sections are different (dirty), false if identical
 */
export function compareSectionWithArchetype(
  currentSection: WidgetSection,
  archetypeSection: WidgetSection
): boolean {
  const zoneSlug = currentSection.zoneSlug || 'unknown'
  
  debugLog('log', `🔍 [compareSection] Starting comparison for zone ${zoneSlug}:`, {
    currentId: currentSection.id,
    archetypeId: archetypeSection.id,
    currentName: currentSection.name,
    archetypeName: archetypeSection.name
  })
  
  // Quick check: if IDs match, they're the same reference (shouldn't happen, but safe check)
  if (currentSection.id === archetypeSection.id) {
    debugLog('log', `✅ [compareSection] Zone ${zoneSlug}: IDs match, sections identical`)
    return false
  }

  // Compare basic properties
  if (currentSection.name !== archetypeSection.name) {
    debugLog('log', `🔴 [compareSection] Zone ${zoneSlug}: Name differs`, {
      current: currentSection.name,
      archetype: archetypeSection.name
    })
    return true
  }
  if (currentSection.type !== archetypeSection.type) {
    debugLog('log', `🔴 [compareSection] Zone ${zoneSlug}: Type differs`, {
      current: currentSection.type,
      archetype: archetypeSection.type
    })
    return true
  }
  if (currentSection.layout !== archetypeSection.layout) {
    debugLog('log', `🔴 [compareSection] Zone ${zoneSlug}: Layout differs`, {
      current: currentSection.layout,
      archetype: archetypeSection.layout
    })
    return true
  }

  // Compare areas count
  if (currentSection.areas?.length !== archetypeSection.areas?.length) {
    debugLog('log', `🔴 [compareSection] Zone ${zoneSlug}: Areas count differs`, {
      current: currentSection.areas?.length,
      archetype: archetypeSection.areas?.length
    })
    return true
  }

  debugLog('log', `🔍 [compareSection] Zone ${zoneSlug}: Comparing ${currentSection.areas?.length || 0} areas`)

  // Compare each area
  if (currentSection.areas && archetypeSection.areas) {
    for (let i = 0; i < currentSection.areas.length; i++) {
      const currentArea = currentSection.areas[i]
      const archetypeArea = archetypeSection.areas[i]

      if (!currentArea || !archetypeArea) {
        debugLog('log', `🔴 [compareSection] Zone ${zoneSlug}: Area ${i} missing`)
        return true
      }

      // Compare area name
      if (currentArea.name !== archetypeArea.name) {
        debugLog('log', `🔴 [compareSection] Zone ${zoneSlug}: Area ${i} name differs`, {
          current: currentArea.name,
          archetype: archetypeArea.name
        })
        return true
      }

      // Compare widgets count
      if (currentArea.widgets?.length !== archetypeArea.widgets?.length) {
        debugLog('log', `🔴 [compareSection] Zone ${zoneSlug}: Area ${i} widget count differs`, {
          current: currentArea.widgets?.length,
          archetype: archetypeArea.widgets?.length
        })
        return true
      }
      
      debugLog('log', `🔍 [compareSection] Zone ${zoneSlug}: Area ${i} has ${currentArea.widgets?.length || 0} widgets`)

      // Compare widgets (by type and order, not by ID since IDs may differ)
      if (currentArea.widgets && archetypeArea.widgets) {
        for (let j = 0; j < currentArea.widgets.length; j++) {
          const currentWidget = currentArea.widgets[j]
          const archetypeWidget = archetypeArea.widgets[j]

          if (!currentWidget || !archetypeWidget) {
            debugLog('log', `🔴 [compareSection] Zone ${zoneSlug}: Widget ${j} in area ${i} missing`)
            return true
          }

          // Compare widget type
          if (currentWidget.type !== archetypeWidget.type) {
            debugLog('log', `🔴 [compareSection] Zone ${zoneSlug}: Widget ${j} in area ${i} type differs`, {
              current: currentWidget.type,
              archetype: archetypeWidget.type
            })
            return true
          }

          // Compare widget properties (simplified - just check if structure differs)
          // For more thorough comparison, we'd need to deep compare all properties
          // Note: We don't compare journalId/journal-in-context here - that's a runtime parameter
          // from page context, not part of the widget's stored configuration
          const currentWidgetStr = JSON.stringify({
            type: currentWidget.type,
            ...(currentWidget as any).text && { text: (currentWidget as any).text },
            ...(currentWidget as any).contentSource && { contentSource: (currentWidget as any).contentSource },
            ...(currentWidget as any).maxItems && { maxItems: (currentWidget as any).maxItems },
          })
          const archetypeWidgetStr = JSON.stringify({
            type: archetypeWidget.type,
            ...(archetypeWidget as any).text && { text: (archetypeWidget as any).text },
            ...(archetypeWidget as any).contentSource && { contentSource: (archetypeWidget as any).contentSource },
            ...(archetypeWidget as any).maxItems && { maxItems: (archetypeWidget as any).maxItems },
          })

          if (currentWidgetStr !== archetypeWidgetStr) {
            debugLog('log', `🔴 [compareSection] Zone ${zoneSlug}: Widget ${j} in area ${i} differs`, {
              area: i,
              widgetIndex: j,
              current: currentWidgetStr,
              archetype: archetypeWidgetStr
            })
            return true
          } else {
            debugLog('log', `✅ [compareSection] Zone ${zoneSlug}: Widget ${j} in area ${i} matches`)
          }
        }
      }
    }
  }

  // Compare styling
  const currentStyling = JSON.stringify(currentSection.styling || {})
  const archetypeStyling = JSON.stringify(archetypeSection.styling || {})
  if (currentStyling !== archetypeStyling) {
    debugLog('log', `🔴 [compareSection] Zone ${zoneSlug}: Styling differs`)
    return true
  }

  // Compare background
  const currentBackground = JSON.stringify(currentSection.background || {})
  const archetypeBackground = JSON.stringify(archetypeSection.background || {})
  if (currentBackground !== archetypeBackground) {
    debugLog('log', `🔴 [compareSection] Zone ${zoneSlug}: Background differs`)
    return true
  }

  // Sections are identical
  debugLog('log', `✅ [compareSection] Zone ${zoneSlug}: Sections are identical`)
  return false
}

/**
 * Get list of zone slugs that have drifted from archetype (dirty zones)
 * @param currentCanvas Current canvas items (from editor)
 * @param archetypeCanvas Archetype canvas items
 * @returns Set of zone slugs that are dirty
 */
export function getDirtyZones(
  currentCanvas: WidgetSection[],
  archetypeCanvas: WidgetSection[]
): Set<string> {
  const dirtyZones = new Set<string>()

  debugLog('log', '🔍 [getDirtyZones] Starting comparison:', {
    currentSections: currentCanvas.length,
    archetypeSections: archetypeCanvas.length
  })

  // Create a map of archetype sections by zoneSlug for quick lookup
  const archetypeByZone = new Map<string, WidgetSection>()
  archetypeCanvas.forEach(section => {
    if (section.zoneSlug) {
      archetypeByZone.set(section.zoneSlug, section)
    }
  })

  debugLog('log', '🔍 [getDirtyZones] Archetype zones mapped:', {
    zoneSlugs: Array.from(archetypeByZone.keys())
  })

  // Compare each current section with its archetype counterpart
  currentCanvas.forEach(currentSection => {
    if (!currentSection.zoneSlug) {
      debugLog('log', '⏭️ [getDirtyZones] Skipping section without zoneSlug:', currentSection.name)
      return // Skip sections without zoneSlug
    }

    const archetypeSection = archetypeByZone.get(currentSection.zoneSlug)
    if (!archetypeSection) {
      // Section exists in current but not in archetype - consider it dirty
      debugLog('log', `🔴 [getDirtyZones] Zone ${currentSection.zoneSlug}: Not found in archetype - marking dirty`)
      dirtyZones.add(currentSection.zoneSlug)
      return
    }

    // Compare sections
    debugLog('log', `🔍 [getDirtyZones] Comparing zone ${currentSection.zoneSlug}:`, {
      currentSectionName: currentSection.name,
      archetypeSectionName: archetypeSection.name
    })
    
    if (compareSectionWithArchetype(currentSection, archetypeSection)) {
      debugLog('log', `🔴 [getDirtyZones] Zone ${currentSection.zoneSlug}: Marked as dirty`)
      dirtyZones.add(currentSection.zoneSlug)
    } else {
      debugLog('log', `✅ [getDirtyZones] Zone ${currentSection.zoneSlug}: Clean (matches archetype)`)
    }
  })

  debugLog('log', '✅ [getDirtyZones] Comparison complete:', {
    dirtyZones: Array.from(dirtyZones),
    totalDirty: dirtyZones.size
  })

  return dirtyZones
}

/**
 * Restore zoneSlug to sections by matching them with archetype sections
 * This is needed when loading sections from draft/published canvas that may have lost zoneSlug
 * @param currentCanvas Current canvas items (may be missing zoneSlug)
 * @param archetypeCanvas Archetype canvas items (has zoneSlug)
 * @returns Canvas items with zoneSlug restored
 */
export function restoreZoneSlugs(
  currentCanvas: WidgetSection[],
  archetypeCanvas: WidgetSection[]
): WidgetSection[] {
  // Create a map of archetype sections by name and position for matching
  const archetypeByIndex = new Map<number, WidgetSection>()
  const archetypeByName = new Map<string, WidgetSection>()
  
  archetypeCanvas.forEach((section, index) => {
    archetypeByIndex.set(index, section)
    if (section.name) {
      archetypeByName.set(section.name, section)
    }
  })

  // Restore zoneSlug for each current section
  return currentCanvas.map((currentSection, index) => {
    // If already has zoneSlug, keep it
    if (currentSection.zoneSlug) {
      return currentSection
    }

    // Try to match by index first
    const archetypeByIndexMatch = archetypeByIndex.get(index)
    if (archetypeByIndexMatch?.zoneSlug) {
      debugLog('log', `✅ [restoreZoneSlugs] Restored zoneSlug for "${currentSection.name}" by index: ${archetypeByIndexMatch.zoneSlug}`)
      return {
        ...currentSection,
        zoneSlug: archetypeByIndexMatch.zoneSlug
      }
    }

    // Try to match by name
    const archetypeByNameMatch = archetypeByName.get(currentSection.name)
    if (archetypeByNameMatch?.zoneSlug) {
      debugLog('log', `✅ [restoreZoneSlugs] Restored zoneSlug for "${currentSection.name}" by name: ${archetypeByNameMatch.zoneSlug}`)
      return {
        ...currentSection,
        zoneSlug: archetypeByNameMatch.zoneSlug
      }
    }

    // No match found - log warning
    debugLog('warn', `⚠️ [restoreZoneSlugs] Could not restore zoneSlug for section "${currentSection.name}" at index ${index}`)
    return currentSection
  })
}


