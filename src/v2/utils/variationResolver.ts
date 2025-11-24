/**
 * Variation Inheritance Resolver
 * Resolves child variations that inherit from parent variations
 */

import type { SectionVariation, WidgetOverride } from '../types/core'
import type { Widget } from '../../types/widgets'

export type ResolvedWidget = Widget & {
  _inherited?: boolean  // Was this widget inherited from parent?
  _hidden?: boolean  // Is this widget hidden in child variation?
  _overridden?: boolean  // Does this widget have overrides?
  _added?: boolean  // Was this widget added by child variation?
}

/**
 * Resolve a variation's widgets, applying inheritance from parent if applicable
 */
export function resolveVariationWidgets(
  variation: SectionVariation,
  parentVariation?: SectionVariation
): ResolvedWidget[] {
  // If no inheritance, return widgets as-is
  if (!variation.inheritsFrom || !parentVariation) {
    return variation.widgets.map(w => ({ ...w, _added: false }))
  }

  // Start with parent's widgets (mark as inherited)
  let resolvedWidgets: ResolvedWidget[] = parentVariation.widgets.map(w => ({
    ...w,
    _inherited: true,
    _hidden: false,
    _overridden: false,
    _added: false
  }))

  // Apply hidden widgets
  if (variation.hiddenWidgetIds && variation.hiddenWidgetIds.length > 0) {
    resolvedWidgets = resolvedWidgets.filter(w => {
      const isHidden = variation.hiddenWidgetIds!.includes(w.id)
      if (isHidden) {
        w._hidden = true
      }
      return !isHidden
    })
  }

  // Apply widget overrides
  if (variation.widgetOverrides && variation.widgetOverrides.length > 0) {
    resolvedWidgets = resolvedWidgets.map(widget => {
      const override = variation.widgetOverrides!.find(o => o.widgetId === widget.id)
      if (override) {
        return {
          ...widget,
          ...override.properties,
          _overridden: true
        }
      }
      return widget
    })
  }

  // Add child's own widgets (mark as added)
  const addedWidgets: ResolvedWidget[] = variation.widgets.map(w => ({
    ...w,
    _added: true,
    _inherited: false
  }))
  resolvedWidgets = [...resolvedWidgets, ...addedWidgets]

  // Apply custom ordering if specified
  if (variation.widgetOrder && variation.widgetOrder.length > 0) {
    const orderedWidgets: ResolvedWidget[] = []
    const widgetMap = new Map(resolvedWidgets.map(w => [w.id, w]))
    
    variation.widgetOrder.forEach(widgetId => {
      const widget = widgetMap.get(widgetId)
      if (widget) {
        orderedWidgets.push(widget)
        widgetMap.delete(widgetId)
      }
    })
    
    // Add any widgets not in the order list at the end
    widgetMap.forEach(widget => orderedWidgets.push(widget))
    
    resolvedWidgets = orderedWidgets
  }

  return resolvedWidgets
}

/**
 * Get the parent variation for a child variation
 */
export function getParentVariation(
  childVariation: SectionVariation,
  allVariations: Record<string, SectionVariation>
): SectionVariation | undefined {
  if (!childVariation.inheritsFrom) return undefined
  return allVariations[childVariation.inheritsFrom]
}

/**
 * Check if a variation is a base (parent) variation
 */
export function isBaseVariation(variation: SectionVariation): boolean {
  return !variation.inheritsFrom
}

/**
 * Get all child variations that inherit from a specific parent
 */
export function getChildVariations(
  parentKey: string,
  allVariations: Record<string, SectionVariation>
): SectionVariation[] {
  return Object.values(allVariations).filter(v => v.inheritsFrom === parentKey)
}

/**
 * Count inherited, overridden, hidden, and added widgets
 */
export function getVariationStats(
  variation: SectionVariation,
  parentVariation?: SectionVariation
) {
  if (!variation.inheritsFrom || !parentVariation) {
    return {
      total: variation.widgets.length,
      inherited: 0,
      overridden: 0,
      hidden: 0,
      added: variation.widgets.length
    }
  }

  const resolvedWidgets = resolveVariationWidgets(variation, parentVariation)
  
  return {
    total: resolvedWidgets.length,
    inherited: resolvedWidgets.filter(w => w._inherited && !w._overridden).length,
    overridden: resolvedWidgets.filter(w => w._overridden).length,
    hidden: variation.hiddenWidgetIds?.length || 0,
    added: resolvedWidgets.filter(w => w._added).length
  }
}

