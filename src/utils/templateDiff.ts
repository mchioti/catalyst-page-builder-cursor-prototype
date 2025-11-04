/**
 * Template Divergence Detection
 * 
 * Compares base template canvas items with customized versions
 * and returns detailed list of changes.
 */

import type { CanvasItem, WidgetSection, Widget } from '../types/widgets'
import { isSection } from '../types/widgets'

export type ChangeType = 'added' | 'removed' | 'modified' | 'moved'

export type TemplateChange = {
  type: ChangeType
  element: 'section' | 'widget'
  elementId: string
  elementName: string
  property?: string
  description: string
  oldValue?: any
  newValue?: any
  fromLocation?: string  // For moves: where it came from
  toLocation?: string    // For moves: where it went to
}

/**
 * Build a map of widget IDs to their locations (section name or 'standalone')
 */
function buildWidgetLocationMap(canvas: CanvasItem[]): Map<string, string> {
  const map = new Map<string, string>()
  
  canvas.forEach(item => {
    if (isSection(item)) {
      // Check widgets in section areas
      if (item.areas && Array.isArray(item.areas)) {
        item.areas.forEach(area => {
          if (area.widgets && Array.isArray(area.widgets)) {
            area.widgets.forEach(widget => {
              map.set(widget.id, item.name || 'Unnamed Section')
            })
          }
        })
      }
    } else {
      // Standalone widget
      map.set(item.id, 'standalone')
    }
  })
  
  return map
}

/**
 * Detects changes between base template and customized version
 */
export function detectTemplateChanges(
  baseCanvas: CanvasItem[],
  customizedCanvas: CanvasItem[]
): TemplateChange[] {
  const changes: TemplateChange[] = []
  
  // Build widget location maps for move detection
  const baseWidgetLocations = buildWidgetLocationMap(baseCanvas)
  const customWidgetLocations = buildWidgetLocationMap(customizedCanvas)
  
  // Track which customized items we've checked
  const checkedCustomizedIds = new Set<string>()
  const movedWidgetIds = new Set<string>()
  
  // Detect moved widgets first
  baseWidgetLocations.forEach((baseLocation, widgetId) => {
    const customLocation = customWidgetLocations.get(widgetId)
    if (customLocation && customLocation !== baseLocation) {
      // Widget moved between sections
      const widget = findWidgetInCanvas(customizedCanvas, widgetId)
      if (widget) {
        movedWidgetIds.add(widgetId)
        changes.push({
          type: 'moved',
          element: 'widget',
          elementId: widgetId,
          elementName: widget.name || getWidgetTypeName(widget),
          description: `Widget "${widget.name || getWidgetTypeName(widget)}" moved from "${baseLocation}" to "${customLocation}"`,
          fromLocation: baseLocation,
          toLocation: customLocation
        })
      }
    }
  })
  
  // Find removed and modified sections/widgets
  baseCanvas.forEach(baseItem => {
    const customItem = customizedCanvas.find(c => c.id === baseItem.id)
    
    if (!customItem) {
      // Check if this section's widgets were moved (not truly removed)
      if (isSection(baseItem) && baseItem.areas && Array.isArray(baseItem.areas)) {
        const allWidgets = baseItem.areas.flatMap(area => area.widgets || [])
        const allWidgetsMoved = allWidgets.every(widget => movedWidgetIds.has(widget.id))
        
        if (allWidgetsMoved && allWidgets.length > 0) {
          // Don't mark section as removed if all its widgets were moved
          changes.push({
            type: 'removed',
            element: 'section',
            elementId: baseItem.id,
            elementName: baseItem.name || 'Unnamed',
            description: `Section "${baseItem.name}" was removed (widgets moved to other sections)`
          })
        } else {
          // Section truly removed
          changes.push({
            type: 'removed',
            element: isSection(baseItem) ? 'section' : 'widget',
            elementId: baseItem.id,
            elementName: baseItem.name || 'Unnamed',
            description: `${isSection(baseItem) ? 'Section' : 'Widget'} "${baseItem.name}" was removed`
          })
        }
      } else if (!movedWidgetIds.has(baseItem.id)) {
        // Only mark as removed if it wasn't moved
        changes.push({
          type: 'removed',
          element: isSection(baseItem) ? 'section' : 'widget',
          elementId: baseItem.id,
          elementName: baseItem.name || 'Unnamed',
          description: `${isSection(baseItem) ? 'Section' : 'Widget'} "${baseItem.name}" was removed`
        })
      }
    } else {
      // Item exists, check for modifications
      checkedCustomizedIds.add(customItem.id)
      
      if (isSection(baseItem) && isSection(customItem)) {
        // Compare section properties
        const sectionChanges = compareSections(baseItem, customItem, movedWidgetIds)
        changes.push(...sectionChanges)
      } else if (!isSection(baseItem) && !isSection(customItem)) {
        // Compare widget properties
        const widgetChanges = compareWidgets(baseItem, customItem)
        changes.push(...widgetChanges)
      }
    }
  })
  
  // Find added sections/widgets
  customizedCanvas.forEach(customItem => {
    if (!checkedCustomizedIds.has(customItem.id)) {
      // Item was added
      changes.push({
        type: 'added',
        element: isSection(customItem) ? 'section' : 'widget',
        elementId: customItem.id,
        elementName: customItem.name || 'Unnamed',
        description: `${isSection(customItem) ? 'Section' : 'Widget'} "${customItem.name}" was added`
      })
    }
  })
  
  return changes
}

/**
 * Compare two sections and return list of changes
 */
function compareSections(
  baseSection: WidgetSection,
  customSection: WidgetSection,
  movedWidgetIds: Set<string>
): TemplateChange[] {
  const changes: TemplateChange[] = []
  
  // Compare background
  if (JSON.stringify(baseSection.background) !== JSON.stringify(customSection.background)) {
    changes.push({
      type: 'modified',
      element: 'section',
      elementId: baseSection.id,
      elementName: baseSection.name || 'Unnamed Section',
      property: 'background',
      description: `Section "${baseSection.name}" background changed`,
      oldValue: baseSection.background,
      newValue: customSection.background
    })
  }
  
  // Compare padding
  if (baseSection.padding !== customSection.padding) {
    changes.push({
      type: 'modified',
      element: 'section',
      elementId: baseSection.id,
      elementName: baseSection.name || 'Unnamed Section',
      property: 'padding',
      description: `Section "${baseSection.name}" padding changed`,
      oldValue: baseSection.padding,
      newValue: customSection.padding
    })
  }
  
  // Compare content mode
  if (baseSection.contentMode !== customSection.contentMode) {
    changes.push({
      type: 'modified',
      element: 'section',
      elementId: baseSection.id,
      elementName: baseSection.name || 'Unnamed Section',
      property: 'contentMode',
      description: `Section "${baseSection.name}" content mode changed from ${baseSection.contentMode || 'auto'} to ${customSection.contentMode || 'auto'}`,
      oldValue: baseSection.contentMode,
      newValue: customSection.contentMode
    })
  }
  
  // Compare layout
  if (baseSection.layout !== customSection.layout) {
    changes.push({
      type: 'modified',
      element: 'section',
      elementId: baseSection.id,
      elementName: baseSection.name || 'Unnamed Section',
      property: 'layout',
      description: `Section "${baseSection.name}" layout changed`,
      oldValue: baseSection.layout,
      newValue: customSection.layout
    })
  }
  
  // Compare widgets in each area - track specific additions/removals (excluding moves)
  if (baseSection.areas && Array.isArray(baseSection.areas) &&
      customSection.areas && Array.isArray(customSection.areas)) {
    
    // Get all widget IDs from both sections
    const baseWidgetIds = new Set<string>()
    const customWidgetIds = new Set<string>()
    
    baseSection.areas.forEach(area => {
      area.widgets?.forEach(widget => baseWidgetIds.add(widget.id))
    })
    
    customSection.areas.forEach(area => {
      area.widgets?.forEach(widget => customWidgetIds.add(widget.id))
    })
    
    // Find widgets removed from this section (excluding moved widgets)
    baseWidgetIds.forEach(widgetId => {
      if (!customWidgetIds.has(widgetId) && !movedWidgetIds.has(widgetId)) {
        // Widget was removed from this section (not moved)
        const widget = findWidgetInSection(baseSection, widgetId)
        if (widget) {
          changes.push({
            type: 'removed',
            element: 'widget',
            elementId: widgetId,
            elementName: getWidgetTypeName(widget),
            description: `Widget "${getWidgetTypeName(widget)}" was removed from section "${baseSection.name}"`
          })
        }
      }
    })
    
    // Find widgets added to this section (excluding moved widgets)
    customWidgetIds.forEach(widgetId => {
      if (!baseWidgetIds.has(widgetId) && !movedWidgetIds.has(widgetId)) {
        // Widget was added to this section (not moved here)
        const widget = findWidgetInSection(customSection, widgetId)
        if (widget) {
          changes.push({
            type: 'added',
            element: 'widget',
            elementId: widgetId,
            elementName: getWidgetTypeName(widget),
            description: `Widget "${getWidgetTypeName(widget)}" was added to section "${customSection.name}"`
          })
        }
      }
    })
  }
  
  return changes
}

/**
 * Find a widget within a specific section
 */
function findWidgetInSection(section: WidgetSection, widgetId: string): Widget | null {
  if (!section.areas || !Array.isArray(section.areas)) return null
  
  for (const area of section.areas) {
    if (area.widgets && Array.isArray(area.widgets)) {
      const found = area.widgets.find(w => w.id === widgetId)
      if (found) return found
    }
  }
  return null
}

/**
 * Compare two widgets and return list of changes
 */
function compareWidgets(
  baseWidget: Widget,
  customWidget: Widget
): TemplateChange[] {
  const changes: TemplateChange[] = []
  
  // Type changed (unlikely but possible)
  if (baseWidget.type !== customWidget.type) {
    changes.push({
      type: 'modified',
      element: 'widget',
      elementId: baseWidget.id,
      elementName: baseWidget.name || 'Unnamed Widget',
      property: 'type',
      description: `Widget "${baseWidget.name}" type changed from ${baseWidget.type} to ${customWidget.type}`,
      oldValue: baseWidget.type,
      newValue: customWidget.type
    })
  }
  
  // Compare widget-specific properties based on type
  switch (baseWidget.type) {
    case 'text':
      if ('content' in baseWidget && 'content' in customWidget) {
        if (baseWidget.content !== customWidget.content) {
          changes.push({
            type: 'modified',
            element: 'widget',
            elementId: baseWidget.id,
            elementName: baseWidget.name || 'Text Widget',
            property: 'content',
            description: `Widget "${baseWidget.name}" text content changed`
          })
        }
      }
      break
      
    case 'heading':
      if ('text' in baseWidget && 'text' in customWidget) {
        if (baseWidget.text !== customWidget.text || baseWidget.level !== customWidget.level) {
          changes.push({
            type: 'modified',
            element: 'widget',
            elementId: baseWidget.id,
            elementName: baseWidget.name || 'Heading Widget',
            property: 'text',
            description: `Widget "${baseWidget.name}" heading changed`
          })
        }
      }
      break
      
    case 'image':
      if ('src' in baseWidget && 'src' in customWidget) {
        if (baseWidget.src !== customWidget.src) {
          changes.push({
            type: 'modified',
            element: 'widget',
            elementId: baseWidget.id,
            elementName: baseWidget.name || 'Image Widget',
            property: 'src',
            description: `Widget "${baseWidget.name}" image source changed`
          })
        }
      }
      break
      
    case 'button':
      if ('text' in baseWidget && 'text' in customWidget) {
        if (baseWidget.text !== customWidget.text || baseWidget.variant !== customWidget.variant) {
          changes.push({
            type: 'modified',
            element: 'widget',
            elementId: baseWidget.id,
            elementName: baseWidget.name || 'Button Widget',
            property: 'text',
            description: `Widget "${baseWidget.name}" button properties changed`
          })
        }
      }
      break
      
    case 'publication-details':
      if ('textColor' in baseWidget && 'textColor' in customWidget) {
        if (baseWidget.textColor !== customWidget.textColor) {
          changes.push({
            type: 'modified',
            element: 'widget',
            elementId: baseWidget.id,
            elementName: baseWidget.name || 'Publication Details',
            property: 'textColor',
            description: `Widget "${baseWidget.name}" text color changed`,
            oldValue: baseWidget.textColor,
            newValue: customWidget.textColor
          })
        }
      }
      break
  }
  
  return changes
}

/**
 * Calculate modification count from changes
 */
export function calculateModificationCount(changes: TemplateChange[]): number {
  return changes.length
}

/**
 * Group changes by element (section/widget)
 */
export function groupChangesByElement(
  changes: TemplateChange[]
): Record<string, TemplateChange[]> {
  const grouped: Record<string, TemplateChange[]> = {}
  
  changes.forEach(change => {
    const key = change.elementId
    if (!grouped[key]) {
      grouped[key] = []
    }
    grouped[key].push(change)
  })
  
  return grouped
}

/**
 * Format change for human-readable display
 */
export function formatChange(change: TemplateChange): string {
  switch (change.type) {
    case 'added':
      return `✅ ${change.description}`
    case 'removed':
      return `❌ ${change.description}`
    case 'modified':
      return `📝 ${change.description}`
    case 'moved':
      return `↔️ ${change.description}`
    default:
      return change.description
  }
}

/**
 * Find a widget in the canvas by ID (searches inside sections too)
 */
function findWidgetInCanvas(canvas: CanvasItem[], widgetId: string): Widget | null {
  for (const item of canvas) {
    if (!isSection(item) && item.id === widgetId) {
      return item as Widget
    }
    if (isSection(item) && item.areas && Array.isArray(item.areas)) {
      for (const area of item.areas) {
        if (area.widgets && Array.isArray(area.widgets)) {
          const found = area.widgets.find(w => w.id === widgetId)
          if (found) return found
        }
      }
    }
  }
  return null
}

/**
 * Get a readable name for a widget type
 */
function getWidgetTypeName(widget: Widget): string {
  switch (widget.type) {
    case 'text': return 'Text Widget'
    case 'heading': return 'Heading Widget'
    case 'image': return 'Image Widget'
    case 'button': return 'Button Widget'
    case 'menu': return 'Menu Widget'
    case 'publication-list': return 'Publication List Widget'
    case 'publication-details': return 'Publication Details Widget'
    case 'html': return 'HTML Widget'
    case 'code': return 'Code Widget'
    default: return 'Widget'
  }
}

