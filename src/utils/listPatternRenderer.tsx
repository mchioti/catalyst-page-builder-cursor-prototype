import type { ListItemSpanningConfig, WidgetGridSpan, WidgetFlexProperties } from '../types/widgets'
import { SPANNING_PATTERNS } from '../types/widgets'

/**
 * Apply spanning pattern to list items based on parent layout
 * Returns items with grid/flex properties applied
 */
export const applyListPattern = <T extends Record<string, any>>(
  items: T[],
  config: ListItemSpanningConfig | undefined,
  parentLayout: 'grid' | 'flexible'
): Array<T & { gridSpan?: WidgetGridSpan; flexProperties?: WidgetFlexProperties }> => {
  
  // If pattern not enabled, return items unchanged
  if (!config || !config.enabled) {
    return items
  }
  
  // Get the pattern array
  const pattern = config.preset === 'custom'
    ? (config.customPattern || [1])
    : SPANNING_PATTERNS[config.preset]
  
  // Apply pattern to each item
  // Apply BOTH grid and flex properties so the pattern works in either layout
  return items.map((item, index) => {
    const span = pattern[index % pattern.length]
    
    return {
      ...item,
      // Grid layout: apply column/row span
      gridSpan: { 
        column: `span ${span}`, 
        row: 'span 1' 
      },
      // Flex layout: convert span to grow value
      // span > 1 means it should grow, span === 1 means natural size
      flexProperties: { 
        grow: span > 1 
      }
    }
  })
}

/**
 * Get the pattern array for a given configuration
 * Useful for previews and debugging
 */
export const getPattern = (config: ListItemSpanningConfig | undefined): number[] => {
  if (!config) {
    return [1]
  }
  
  return config.preset === 'custom'
    ? (config.customPattern || [1])
    : SPANNING_PATTERNS[config.preset]
}

