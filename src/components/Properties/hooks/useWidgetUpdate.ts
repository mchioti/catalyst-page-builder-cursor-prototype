/**
 * useWidgetUpdate - Hook for updating widgets in the canvas
 * 
 * Provides common update functions for widget and section properties.
 * Extracted from PropertiesPanel.tsx for reuse across property editors.
 */

import { useCallback } from 'react'
import type { Widget, WidgetSection, CanvasItem } from '../../../types'
import { isSection } from '../../../types'

interface UseWidgetUpdateProps {
  canvasItems: CanvasItem[]
  selectedWidget: string | null
  replaceCanvasItems: (items: CanvasItem[]) => void
}

interface UseWidgetUpdateReturn {
  updateWidget: (updates: Partial<Widget>) => void
  updateSection: (updates: Partial<WidgetSection>) => void
  findSelectedItem: () => CanvasItem | Widget | undefined
  findParentSection: (widgetId: string) => WidgetSection | undefined
}

export function useWidgetUpdate({
  canvasItems,
  selectedWidget,
  replaceCanvasItems
}: UseWidgetUpdateProps): UseWidgetUpdateReturn {
  
  const updateWidget = useCallback((updates: Partial<Widget>) => {
    const updatedCanvasItems = canvasItems.map((item: CanvasItem) => {
      if (isSection(item)) {
        return {
          ...item,
          areas: item.areas.map(area => ({
            ...area,
            widgets: area.widgets.map(w => {
              // Direct match
              if (w.id === selectedWidget) {
                return { ...w, ...updates }
              }
              // Search in tabs widgets
              if (w.type === 'tabs') {
                const tabsWidget = w as any
                return {
                  ...tabsWidget,
                  tabs: tabsWidget.tabs.map((tab: any) => ({
                    ...tab,
                    widgets: tab.widgets.map((tw: any) =>
                      tw.id === selectedWidget ? { ...tw, ...updates } : tw
                    )
                  }))
                }
              }
              return w
            })
          }))
        }
      } else {
        // Check if it's a standalone tabs widget
        if (item.type === 'tabs') {
          const tabsWidget = item as any
          return {
            ...tabsWidget,
            tabs: tabsWidget.tabs.map((tab: any) => ({
              ...tab,
              widgets: tab.widgets.map((tw: any) =>
                tw.id === selectedWidget ? { ...tw, ...updates } : tw
              )
            }))
          }
        }
        return item.id === selectedWidget ? { ...item, ...updates } : item
      }
    })
    replaceCanvasItems(updatedCanvasItems)
  }, [canvasItems, selectedWidget, replaceCanvasItems])

  const updateSection = useCallback((updates: Partial<WidgetSection>) => {
    const updatedCanvasItems = canvasItems.map((item: CanvasItem) => {
      if (isSection(item) && item.id === selectedWidget) {
        return { ...item, ...updates }
      }
      return item
    })
    replaceCanvasItems(updatedCanvasItems)
  }, [canvasItems, selectedWidget, replaceCanvasItems])

  const findSelectedItem = useCallback((): CanvasItem | Widget | undefined => {
    // Check canvas items first
    let selectedItem: CanvasItem | Widget | undefined = canvasItems.find(
      (item: CanvasItem) => item.id === selectedWidget
    )

    // If not found at canvas level, search within section areas
    if (!selectedItem) {
      for (const canvasItem of canvasItems) {
        if (isSection(canvasItem)) {
          for (const area of canvasItem.areas) {
            const foundWidget = area.widgets.find(w => w.id === selectedWidget)
            if (foundWidget) {
              selectedItem = foundWidget
              break
            }
            // Also search within tabs widgets
            for (const areaWidget of area.widgets) {
              if (areaWidget.type === 'tabs') {
                const tabsWidget = areaWidget as any
                for (const tab of tabsWidget.tabs) {
                  const foundInTab = tab.widgets.find((w: any) => w.id === selectedWidget)
                  if (foundInTab) {
                    selectedItem = foundInTab
                    break
                  }
                }
                if (selectedItem) break
              }
            }
            if (selectedItem) break
          }
          if (selectedItem) break
        }
      }
    }
    
    // Search in standalone tabs widgets
    if (!selectedItem) {
      for (const canvasItem of canvasItems) {
        if (canvasItem.type === 'tabs') {
          const tabsWidget = canvasItem as any
          for (const tab of tabsWidget.tabs) {
            const foundInTab = tab.widgets.find((w: any) => w.id === selectedWidget)
            if (foundInTab) {
              selectedItem = foundInTab
              break
            }
          }
          if (selectedItem) break
        }
      }
    }

    return selectedItem
  }, [canvasItems, selectedWidget])

  const findParentSection = useCallback((widgetId: string): WidgetSection | undefined => {
    for (const canvasItem of canvasItems) {
      if (isSection(canvasItem)) {
        for (const area of canvasItem.areas) {
          if (area.widgets.some(w => w.id === widgetId)) {
            return canvasItem as WidgetSection
          }
        }
      }
    }
    return undefined
  }, [canvasItems])

  return {
    updateWidget,
    updateSection,
    findSelectedItem,
    findParentSection
  }
}

