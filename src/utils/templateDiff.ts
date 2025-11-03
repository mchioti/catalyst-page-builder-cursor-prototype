/**
 * Template Divergence Detection
 * 
 * Compares base template canvas items with customized versions
 * and returns detailed list of changes.
 */

import type { CanvasItem, WidgetSection, Widget } from '../types/widgets'
import { isSection } from '../types/widgets'

export type ChangeType = 'added' | 'removed' | 'modified'

export type TemplateChange = {
  type: ChangeType
  element: 'section' | 'widget'
  elementId: string
  elementName: string
  property?: string
  description: string
  oldValue?: any
  newValue?: any
}

/**
 * Detects changes between base template and customized version
 */
export function detectTemplateChanges(
  baseCanvas: CanvasItem[],
  customizedCanvas: CanvasItem[]
): TemplateChange[] {
  const changes: TemplateChange[] = []
  
  // Track which customized items we've checked
  const checkedCustomizedIds = new Set<string>()
  
  // Find removed and modified sections/widgets
  baseCanvas.forEach(baseItem => {
    const customItem = customizedCanvas.find(c => c.id === baseItem.id)
    
    if (!customItem) {
      // Item was removed
      changes.push({
        type: 'removed',
        element: isSection(baseItem) ? 'section' : 'widget',
        elementId: baseItem.id,
        elementName: baseItem.name || 'Unnamed',
        description: `${isSection(baseItem) ? 'Section' : 'Widget'} "${baseItem.name}" was removed`
      })
    } else {
      // Item exists, check for modifications
      checkedCustomizedIds.add(customItem.id)
      
      if (isSection(baseItem) && isSection(customItem)) {
        // Compare section properties
        const sectionChanges = compareSections(baseItem, customItem)
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
  customSection: WidgetSection
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
  
  // Compare widgets count in first area
  if (baseSection.areas && baseSection.areas.length > 0 && 
      customSection.areas && customSection.areas.length > 0) {
    const baseWidgetCount = baseSection.areas[0].widgets?.length || 0
    const customWidgetCount = customSection.areas[0].widgets?.length || 0
    
    if (baseWidgetCount !== customWidgetCount) {
      const diff = customWidgetCount - baseWidgetCount
      changes.push({
        type: 'modified',
        element: 'section',
        elementId: baseSection.id,
        elementName: baseSection.name || 'Unnamed Section',
        property: 'widgets',
        description: `Section "${baseSection.name}" ${diff > 0 ? 'added' : 'removed'} ${Math.abs(diff)} widget${Math.abs(diff) > 1 ? 's' : ''}`,
        oldValue: baseWidgetCount,
        newValue: customWidgetCount
      })
    }
  }
  
  return changes
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
    default:
      return change.description
  }
}

