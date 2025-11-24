/**
 * Composition Resolver
 * Resolves page composition (section references) into actual renderable widgets
 */

import type { Page, SectionCompositionItem, SharedSection } from '../types/core'
import type { Widget } from '../../types/widgets'
import { resolveVariationWidgets, getParentVariation } from './variationResolver'

export type ResolvedSection = {
  id: string // Instance ID from composition
  sharedSectionId: string
  variationKey: string
  sectionName: string
  variationName: string
  layout: string
  widgets: Widget[]
  background?: {
    type: 'color' | 'gradient' | 'image'
    color?: string
    gradient?: string
    imageUrl?: string
  }
  contentMode?: 'light' | 'dark'
  flexConfig?: any
  gridConfig?: any
  inheritFromTheme: boolean
  divergenceCount: number
}

/**
 * Resolve a page composition to actual sections with widgets
 */
export function resolvePageComposition(
  composition: SectionCompositionItem[],
  sharedSections: SharedSection[]
): ResolvedSection[] {
  return composition.map(item => {
    const sharedSection = sharedSections.find(s => s.id === item.sharedSectionId)
    
    if (!sharedSection) {
      console.warn(`Section not found: ${item.sharedSectionId}`)
      return null
    }
    
    const variation = sharedSection.variations[item.variationKey]
    
    if (!variation) {
      console.warn(`Variation not found: ${item.variationKey} in ${item.sharedSectionId}`)
      return null
    }
    
    // Resolve variation inheritance first (e.g., Minimal Header inheriting from Full Header)
    const parentVariation = getParentVariation(variation, sharedSection.variations)
    let resolvedWidgets = resolveVariationWidgets(variation, parentVariation)
    
    console.log(`🔍 Resolved ${sharedSection.name}/${item.variationKey}: ${resolvedWidgets.length} widgets`)
    
    // Apply page-level overrides if present
    if (item.overrides?.widgets) {
      console.log(`  ↳ Applying ${item.overrides.widgets.length} page-level overrides`)
      resolvedWidgets = applyWidgetOverrides(resolvedWidgets, item.overrides.widgets)
    }
    
    return {
      id: item.id,
      sharedSectionId: item.sharedSectionId,
      variationKey: item.variationKey,
      sectionName: sharedSection.name,
      variationName: variation.name,
      layout: variation.layout,
      widgets: resolvedWidgets,
      background: variation.background,
      contentMode: variation.contentMode,
      flexConfig: variation.flexConfig,
      gridConfig: variation.gridConfig,
      inheritFromTheme: item.inheritFromTheme,
      divergenceCount: item.divergenceCount
    }
  }).filter(Boolean) as ResolvedSection[]
}

/**
 * Apply widget overrides from composition item
 */
function applyWidgetOverrides(
  baseWidgets: Widget[],
  overrides: Partial<Widget>[]
): Widget[] {
  const result = [...baseWidgets]
  
  overrides.forEach(override => {
    if (override.id) {
      const index = result.findIndex(w => w.id === override.id)
      if (index !== -1) {
        // Merge override into existing widget
        result[index] = { ...result[index], ...override }
      } else {
        // Add new widget if ID doesn't exist (rare)
        result.push(override as Widget)
      }
    }
  })
  
  return result
}

/**
 * Get resolved composition for a specific page
 */
export function resolvePageById(
  page: Page,
  sharedSections: SharedSection[]
): ResolvedSection[] {
  return resolvePageComposition(page.composition, sharedSections)
}

