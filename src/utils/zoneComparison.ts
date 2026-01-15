/**
 * Zone Comparison Utilities
 * Compares current section state with archetype to detect changes (dirty zones)
 */

import type { WidgetSection } from '../types/widgets'
import { createDebugLogger } from './logger'

// Control logging for this file - Set to true to debug zone comparisons
const DEBUG = false
const debugLog = createDebugLogger(DEBUG)

/**
 * Deep comparison of two sections to detect if they differ
 * Returns true if sections are different (dirty), false if identical
 */
export function compareSectionWithArchetype(
  currentSection: WidgetSection,
  archetypeSection: WidgetSection
): boolean {
  const normalizeOverlay = (overlay: WidgetSection['overlay']) => {
    if (!overlay || overlay.enabled !== true) return undefined
    return overlay
  }
  const zoneSlug = currentSection.zoneSlug || 'unknown'
  
  debugLog('log', `🔍 [compareSection] Starting comparison for zone ${zoneSlug}:`, {
    currentId: currentSection.id,
    archetypeId: archetypeSection.id,
    currentName: currentSection.name,
    archetypeName: archetypeSection.name
  })
  
  // Note: We do NOT skip comparison just because IDs match.
  // When canvas is loaded from archetype, sections share the same ID,
  // but content can still be modified (e.g., adding widgets).

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

          // Compare widget properties - do a thorough comparison
          // Exclude runtime properties like id and journalId (context-dependent)
          const normalizeWidget = (widget: any) => {
            const { id, journalId, ...rest } = widget
            return rest
          }
          
          const currentWidgetStr = JSON.stringify(normalizeWidget(currentWidget))
          const archetypeWidgetStr = JSON.stringify(normalizeWidget(archetypeWidget))

          if (currentWidgetStr !== archetypeWidgetStr) {
            debugLog('log', `🔴 [compareSection] Zone ${zoneSlug}: Widget ${j} in area ${i} differs`, {
              area: i,
              widgetIndex: j,
              widgetType: currentWidget.type,
              // Log a hint about what changed
              currentLength: currentWidgetStr.length,
              archetypeLength: archetypeWidgetStr.length
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

  // Compare overlay (treat disabled overlay as undefined)
  const currentOverlay = JSON.stringify(normalizeOverlay(currentSection.overlay))
  const archetypeOverlay = JSON.stringify(normalizeOverlay(archetypeSection.overlay))
  if (currentOverlay !== archetypeOverlay) {
    debugLog('log', `🔴 [compareSection] Zone ${zoneSlug}: Overlay differs`)
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

  // Track sections without zoneSlugs (newly added sections like prefabs/saved sections)
  let newSectionsCount = 0

  // Compare each current section with its archetype counterpart
  currentCanvas.forEach((currentSection, index) => {
    if (!currentSection.zoneSlug) {
      // NEW: Sections without zoneSlug are NEW sections (prefab/saved sections added by user)
      // Mark them as dirty using a synthetic zoneSlug based on section id
      newSectionsCount++
      const syntheticZoneSlug = `new_section_${currentSection.id || index}`
      debugLog('log', `🆕 [getDirtyZones] NEW section without zoneSlug detected:`, {
        name: currentSection.name,
        id: currentSection.id,
        syntheticZoneSlug
      })
      dirtyZones.add(syntheticZoneSlug)
      return
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
    totalDirty: dirtyZones.size,
    newSectionsDetected: newSectionsCount
  })

  return dirtyZones
}

/**
 * Change description for displaying what changed in a section
 */
export interface ChangeDescription {
  type: 'widget-added' | 'widget-removed' | 'widget-modified' | 'widget-reordered' | 'section-property' | 'section-styling' | 'section-reordered'
  widgetType?: string
  widgetName?: string
  property?: string
  oldValue?: any
  newValue?: any
  description: string
}

/**
 * Get detailed description of what changed between current and archetype section
 * @param currentSection Current section state
 * @param archetypeSection Archetype section state
 * @returns Array of change descriptions
 */
export function getSectionChanges(
  currentSection: WidgetSection,
  archetypeSection: WidgetSection
): ChangeDescription[] {
  const normalizeOverlay = (overlay: WidgetSection['overlay']) => {
    if (!overlay || overlay.enabled !== true) return undefined
    return overlay
  }
  const changes: ChangeDescription[] = []
  const zoneSlug = currentSection.zoneSlug || 'unknown'

  // Compare section-level properties
  if (currentSection.name !== archetypeSection.name) {
    changes.push({
      type: 'section-property',
      property: 'name',
      oldValue: archetypeSection.name,
      newValue: currentSection.name,
      description: `Section name changed from "${archetypeSection.name}" to "${currentSection.name}"`
    })
  }

  if (currentSection.layout !== archetypeSection.layout) {
    changes.push({
      type: 'section-property',
      property: 'layout',
      oldValue: archetypeSection.layout,
      newValue: currentSection.layout,
      description: `Layout changed from "${archetypeSection.layout}" to "${currentSection.layout}"`
    })
  }

  // Compare core section properties that affect rendering/behavior
  if (currentSection.role !== archetypeSection.role) {
    changes.push({
      type: 'section-property',
      property: 'role',
      oldValue: archetypeSection.role,
      newValue: currentSection.role,
      description: 'Section role changed'
    })
  }
  if (currentSection.behavior !== archetypeSection.behavior) {
    changes.push({
      type: 'section-property',
      property: 'behavior',
      oldValue: archetypeSection.behavior,
      newValue: currentSection.behavior,
      description: 'Section behavior changed'
    })
  }
  if (currentSection.contentMode !== archetypeSection.contentMode) {
    changes.push({
      type: 'section-property',
      property: 'contentMode',
      oldValue: archetypeSection.contentMode,
      newValue: currentSection.contentMode,
      description: 'Section content mode changed'
    })
  }
  if (currentSection.padding !== archetypeSection.padding) {
    changes.push({
      type: 'section-property',
      property: 'padding',
      oldValue: archetypeSection.padding,
      newValue: currentSection.padding,
      description: 'Section padding changed'
    })
  }
  if (currentSection.minHeight !== archetypeSection.minHeight) {
    changes.push({
      type: 'section-property',
      property: 'minHeight',
      oldValue: archetypeSection.minHeight,
      newValue: currentSection.minHeight,
      description: 'Section min height changed'
    })
  }
  if (JSON.stringify(normalizeOverlay(currentSection.overlay)) !== JSON.stringify(normalizeOverlay(archetypeSection.overlay))) {
    changes.push({
      type: 'section-property',
      property: 'overlay',
      description: 'Section overlay changed'
    })
  }

  // Compare styling
  const currentStyling = currentSection.styling || {}
  const archetypeStyling = archetypeSection.styling || {}
  if (JSON.stringify(currentStyling) !== JSON.stringify(archetypeStyling)) {
    // Find which styling properties changed
    const allKeys = new Set([...Object.keys(currentStyling), ...Object.keys(archetypeStyling)])
    allKeys.forEach(key => {
      if (JSON.stringify((currentStyling as any)[key]) !== JSON.stringify((archetypeStyling as any)[key])) {
        changes.push({
          type: 'section-styling',
          property: key,
          oldValue: (archetypeStyling as any)[key],
          newValue: (currentStyling as any)[key],
          description: `Section ${key} changed`
        })
      }
    })
  }

  // Compare background
  const currentBg = currentSection.background || {}
  const archetypeBg = archetypeSection.background || {}
  if (JSON.stringify(currentBg) !== JSON.stringify(archetypeBg)) {
    changes.push({
      type: 'section-styling',
      property: 'background',
      description: 'Section background changed'
    })
  }

  // Compare widgets in areas
  const currentAreas = currentSection.areas || []
  const archetypeAreas = archetypeSection.areas || []

  // Build a map of widgets by type for comparison
  const getWidgetsFromAreas = (areas: any[]) => {
    const widgets: any[] = []
    areas.forEach(area => {
      (area.widgets || []).forEach((w: any) => widgets.push(w))
    })
    return widgets
  }

  const currentWidgets = getWidgetsFromAreas(currentAreas)
  const archetypeWidgets = getWidgetsFromAreas(archetypeAreas)

  // Check for added/removed widgets by comparing counts per type
  const currentWidgetsByType = new Map<string, any[]>()
  const archetypeWidgetsByType = new Map<string, any[]>()

  currentWidgets.forEach(w => {
    const type = w.type || 'unknown'
    if (!currentWidgetsByType.has(type)) currentWidgetsByType.set(type, [])
    currentWidgetsByType.get(type)!.push(w)
  })

  archetypeWidgets.forEach(w => {
    const type = w.type || 'unknown'
    if (!archetypeWidgetsByType.has(type)) archetypeWidgetsByType.set(type, [])
    archetypeWidgetsByType.get(type)!.push(w)
  })

  // Detect added widgets
  currentWidgetsByType.forEach((widgets, type) => {
    const archetypeCount = archetypeWidgetsByType.get(type)?.length || 0
    if (widgets.length > archetypeCount) {
      const addedCount = widgets.length - archetypeCount
      changes.push({
        type: 'widget-added',
        widgetType: type,
        description: `${addedCount} ${type} widget${addedCount > 1 ? 's' : ''} added`
      })
    }
  })

  // Detect removed widgets
  archetypeWidgetsByType.forEach((widgets, type) => {
    const currentCount = currentWidgetsByType.get(type)?.length || 0
    if (widgets.length > currentCount) {
      const removedCount = widgets.length - currentCount
      changes.push({
        type: 'widget-removed',
        widgetType: type,
        description: `${removedCount} ${type} widget${removedCount > 1 ? 's' : ''} removed`
      })
    }
  })

  // Detect widget order changes
  // Compare the overall order of widgets (by type sequence)
  if (currentWidgets.length === archetypeWidgets.length && currentWidgets.length > 1) {
    const currentTypeSequence = currentWidgets.map(w => w.type).join(',')
    const archetypeTypeSequence = archetypeWidgets.map(w => w.type).join(',')
    
    if (currentTypeSequence !== archetypeTypeSequence) {
      // Types are in different order - widgets were reordered
      changes.push({
        type: 'widget-reordered',
        description: 'Widgets reordered'
      })
    } else {
      // Same type sequence - check if widgets of same type were reordered among themselves
      // Create a signature for each widget (excluding id and journalId)
      const getWidgetSignature = (w: any) => {
        const { id, journalId, ...rest } = w
        return JSON.stringify(rest)
      }
      
      const currentSignatures = currentWidgets.map(getWidgetSignature)
      const archetypeSignatures = archetypeWidgets.map(getWidgetSignature)
      
      // Check if all signatures exist in both but in different positions
      const currentSet = new Set(currentSignatures)
      const archetypeSet = new Set(archetypeSignatures)
      
      // If same widgets (by content) but different order
      if (currentSet.size === archetypeSet.size && 
          [...currentSet].every(sig => archetypeSet.has(sig)) &&
          currentSignatures.join('|||') !== archetypeSignatures.join('|||')) {
        changes.push({
          type: 'widget-reordered',
          description: 'Widgets reordered'
        })
      }
    }
  }

  // Detect modified widgets (same count but different content)
  const normalizeWidget = (widget: any) => {
    const { id, journalId, ...rest } = widget
    return rest
  }

  currentWidgetsByType.forEach((currentWidgetsOfType, type) => {
    const archetypeWidgetsOfType = archetypeWidgetsByType.get(type) || []
    
    // Only compare if counts match (otherwise it's add/remove, not modify)
    if (currentWidgetsOfType.length === archetypeWidgetsOfType.length) {
      currentWidgetsOfType.forEach((currentWidget, index) => {
        const archetypeWidget = archetypeWidgetsOfType[index]
        if (archetypeWidget) {
          const currentStr = JSON.stringify(normalizeWidget(currentWidget))
          const archetypeStr = JSON.stringify(normalizeWidget(archetypeWidget))
          
          if (currentStr !== archetypeStr) {
            // Try to identify what changed
            const currentNorm = normalizeWidget(currentWidget)
            const archetypeNorm = normalizeWidget(archetypeWidget)
            const changedProps: string[] = []
            
            Object.keys(currentNorm).forEach(key => {
              if (JSON.stringify(currentNorm[key]) !== JSON.stringify(archetypeNorm[key])) {
                changedProps.push(key)
              }
            })
            
            changes.push({
              type: 'widget-modified',
              widgetType: type,
              widgetName: currentWidget.name || type,
              property: changedProps.join(', '),
              description: changedProps.length > 0 
                ? `${type} widget: ${changedProps.join(', ')} modified`
                : `${type} widget properties modified`
            })
          }
        }
      })
    }
  })

  return changes
}

/**
 * Position change info for a section
 */
export interface PositionChange {
  sectionId: string
  sectionName: string
  oldPosition: number
  newPosition: number
  direction: 'up' | 'down' | 'none'
}

/**
 * Get position changes for each section between current and baseline canvas
 * @param currentCanvas Current canvas items
 * @param baselineCanvas Baseline canvas items (archetype or published)
 * @returns Map of sectionId -> PositionChange
 */
export function getSectionPositionChanges(
  currentCanvas: WidgetSection[],
  baselineCanvas: WidgetSection[]
): Map<string, PositionChange> {
  const positionChanges = new Map<string, PositionChange>()
  
  // Get zone slugs or section ids in order
  const currentOrder = currentCanvas
    .filter(s => s.zoneSlug || s.id)
    .map(s => ({ id: s.zoneSlug || s.id, name: s.name }))
  
  const baselineOrder = baselineCanvas
    .filter(s => s.zoneSlug || s.id)
    .map(s => ({ id: s.zoneSlug || s.id, name: s.name }))
  
  // Create a map of baseline positions
  const baselinePositions = new Map<string, number>()
  baselineOrder.forEach((item, idx) => {
    baselinePositions.set(item.id, idx + 1) // 1-based position
  })
  
  // Check each current section's position
  currentOrder.forEach((item, newIdx) => {
    const newPosition = newIdx + 1 // 1-based
    const oldPosition = baselinePositions.get(item.id)
    
    if (oldPosition !== undefined && oldPosition !== newPosition) {
      positionChanges.set(item.id, {
        sectionId: item.id,
        sectionName: item.name,
        oldPosition,
        newPosition,
        direction: newPosition < oldPosition ? 'up' : 'down'
      })
    }
  })
  
  return positionChanges
}

/**
 * @deprecated Use getSectionPositionChanges instead for per-section position info
 * Detect section order changes between current and baseline canvas
 */
export function getSectionOrderChanges(
  currentCanvas: WidgetSection[],
  baselineCanvas: WidgetSection[]
): ChangeDescription[] {
  const changes: ChangeDescription[] = []
  const positionChanges = getSectionPositionChanges(currentCanvas, baselineCanvas)
  
  if (positionChanges.size > 0) {
    const movedSections = Array.from(positionChanges.values()).map(p => p.sectionName)
    changes.push({
      type: 'section-reordered',
      description: movedSections.length > 0 
        ? `Sections reordered: ${movedSections.slice(0, 3).join(', ')}${movedSections.length > 3 ? ` +${movedSections.length - 3} more` : ''}`
        : 'Sections reordered'
    })
  }
  
  return changes
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


