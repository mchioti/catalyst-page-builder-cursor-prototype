import React, { useState, useEffect, useRef } from 'react'
import { Info, Plus, Trash2, GripVertical, X } from 'lucide-react'
import { nanoid } from 'nanoid'
import { createDebugLogger } from '../../utils/logger'

// 🐛 DEBUG FLAG - Set to true to enable detailed properties panel logs
const DEBUG_PROPERTIES_PANEL = false
const debugLog = createDebugLogger(DEBUG_PROPERTIES_PANEL)

import { 
  type Widget, 
  type WidgetSection, 
  type CanvasItem, 
  type SchemaObject, 
  type SchemaOrgType,
  type HTMLWidget,
  type CodeWidget,
  type ImageWidget,
  type HeadingWidget,
  type ButtonWidget,
  type MenuWidget,
  type MenuItem,
  type TabsWidget,
  type TabItem,
  type PublicationListWidget,
  type PublicationDetailsWidget,
  isSection
} from '../../types'
import { generateAIContent, generateAISingleContent } from '../../utils/aiContentGeneration'
import { getAllDOIs, getDOIsByDomain, getCitationByDOI, type CitationDomain } from '../../utils/citationData'
import { IconSelector } from '../IconSelector'
import { getSupportedTabVariants, getTabVariantLabel, type TabVariant } from '../../config/themeTabVariants'
import { ListPatternControls } from './ListPatternControls'
import { PROPERTY_EDITORS } from './editors'

// Import the DEFAULT_PUBLICATION_CARD_CONFIG constant
const DEFAULT_PUBLICATION_CARD_CONFIG = {
  showCover: true,
  showAuthors: true,
  showAbstract: true,
  showDate: true,
  showJournal: true,
  showDOI: true,
  showTags: false,
  coverRatio: '3:4',
  textLength: 'medium'
}

interface PropertiesPanelProps {
  creatingSchemaType: SchemaOrgType | null
  selectedSchemaObject: SchemaObject | null
  onSaveSchema: (data: Omit<SchemaObject, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancelSchema: () => void
  usePageStore: any  // TODO: Type this properly when extracting store
  SchemaFormEditor?: React.ComponentType<{
    schemaType: SchemaOrgType
    initialData?: Partial<SchemaObject>
    onSave: (data: Omit<SchemaObject, 'id' | 'createdAt' | 'updatedAt'>) => void
    onCancel: () => void
  }>
  onExpandedChange?: (expanded: boolean) => void
  isExpanded?: boolean
}

export function PropertiesPanel({ 
  creatingSchemaType, 
  selectedSchemaObject, 
  onSaveSchema, 
  onCancelSchema, 
  usePageStore,
  SchemaFormEditor,
  onExpandedChange,
  isExpanded
}: PropertiesPanelProps) {
  const { canvasItems, selectedWidget, replaceCanvasItems, publicationCardVariants, schemaObjects } = usePageStore()
  
  // State for menu items inline editor (expanded panel)
  const [isEditingMenuItems, setIsEditingMenuItems] = useState(false)
  const prevExpandedRef = useRef(isExpanded)
  
  // Notify parent when expansion state changes
  useEffect(() => {
    onExpandedChange?.(isEditingMenuItems)
  }, [isEditingMenuItems, onExpandedChange])
  
  // Reset editing state when widget selection changes
  useEffect(() => {
    setIsEditingMenuItems(false)
  }, [selectedWidget])
  
  // Reset editing state when panel is collapsed from outside (but not on initial mount)
  useEffect(() => {
    // Only reset if isExpanded changed from true to false (user clicked collapse)
    if (prevExpandedRef.current === true && isExpanded === false) {
      setIsEditingMenuItems(false)
    }
    prevExpandedRef.current = isExpanded
  }, [isExpanded])
  
  // Show schema form if creating or editing schema
  if ((creatingSchemaType || selectedSchemaObject) && SchemaFormEditor) {
    const schemaType = creatingSchemaType || selectedSchemaObject?.type
    if (schemaType) {
      return (
        <SchemaFormEditor
          schemaType={schemaType}
          initialData={selectedSchemaObject || undefined}
          onSave={onSaveSchema}
          onCancel={onCancelSchema}
        />
      )
    }
  }
  
  if (!selectedWidget) {
    return (
      <div className="p-4">
        <div className="text-center py-12">
          <p className="text-gray-500">Select a widget or section to edit its properties</p>
        </div>
      </div>
    )
  }

  // Find selected widget/section - check both canvas items and widgets within sections
  let selectedItem: CanvasItem | Widget | undefined = canvasItems.find(
    (item: CanvasItem) => item.id === selectedWidget
  );

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
          // Also search within tabs widgets in this area
          for (const areaWidget of area.widgets) {
            if (areaWidget.type === 'tabs') {
              const tabsWidget = areaWidget as any // TabsWidget
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
  
  // If still not found, search in standalone tabs widgets
  if (!selectedItem) {
    for (const canvasItem of canvasItems) {
      if (canvasItem.type === 'tabs') {
        const tabsWidget = canvasItem as any // TabsWidget
        for (const tab of tabsWidget.tabs) {
          const foundInTab = tab.widgets.find((w: any) => w.id === selectedWidget)
          if (foundInTab) {
            selectedItem = foundInTab
            debugLog('log', '✅ Found widget in standalone tabs widget:', foundInTab.type, foundInTab.id)
            break
          }
        }
        if (selectedItem) break
      }
    }
  }
  
  // Log if we found the item
  if (selectedItem && !isSection(selectedItem)) {
    debugLog('log', '✅ Properties Panel - Widget found:', { 
      id: selectedItem.id, 
      type: (selectedItem as any).type 
    })
  }
  
  if (!selectedItem) {
    debugLog('log', '🔍 Properties Panel - Selected item not found:', { 
      selectedWidget, 
      canvasItemIds: canvasItems.map((item: CanvasItem) => item.id),
      sectionWidgetIds: canvasItems.flatMap((item: CanvasItem) => 
        isSection(item) ? item.areas.flatMap(area => area.widgets.map(w => w.id)) : []
      ),
      tabsWidgetIds: canvasItems.flatMap((item: CanvasItem) => {
        if (item.type === 'tabs') {
          const tabsWidget = item as any
          return tabsWidget.tabs.flatMap((tab: any) => tab.widgets.map((w: any) => w.id))
        }
        if (isSection(item)) {
          return item.areas.flatMap(area => 
            area.widgets.flatMap(w => {
              if (w.type === 'tabs') {
                const tabsWidget = w as any
                return tabsWidget.tabs.flatMap((tab: any) => tab.widgets.map((tw: any) => tw.id))
              }
              return []
            })
          )
        }
        return []
      })
    })
    return (
      <div className="p-4">
        <div className="text-center py-12">
          <p className="text-gray-500">Selected item not found</p>
        </div>
      </div>
    )
  }

  const updateWidget = (updates: Partial<Widget>) => {
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
                const tabsWidget = w as any // TabsWidget
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
          const tabsWidget = item as any // TabsWidget
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
  }

  const updateSection = (updates: Partial<WidgetSection>) => {
    const updatedCanvasItems = canvasItems.map((item: CanvasItem) => {
      if (isSection(item) && item.id === selectedWidget) {
        return { ...item, ...updates }
      }
      return item
    })
    replaceCanvasItems(updatedCanvasItems)
  }
  
  if (isSection(selectedItem)) {
    const section = selectedItem as WidgetSection
    const backgroundType = section.background?.type || 'none'
    
    // Helper function to get friendly section type name based on layout
    const getSectionTypeName = (layout: string): string => {
      const layoutNames: Record<string, string> = {
        'grid': 'Grid Section',
        'flexible': 'Flex Section',
        'one-column': 'One Column Section',
        'two-columns': 'Two Columns Section',
        'three-columns': 'Three Columns Section',
        'one-third-left': 'Sidebar Left Section',
        'one-third-right': 'Sidebar Right Section',
        'hero-with-buttons': 'Hero with Buttons Section',
        'header-plus-grid': 'Header + Grid Section'
      }
      return layoutNames[layout] || 'Section'
    }
    
    return (
      <div className="p-4 space-y-4">
        <h3 className="font-semibold text-gray-900">Section Properties</h3>
        
        {/* Section Type Indicator */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Section Type</span>
            <span className="text-xs px-2 py-1 rounded-full font-medium bg-green-100 text-green-700">
              {getSectionTypeName(section.layout)}
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-200">
            <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Section ID</span>
            <p className="mt-1 text-xs text-gray-700 font-mono bg-white px-2 py-1 rounded border border-gray-200 break-all">{section.id}</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {/* Flex Settings (only show when layout === 'flexible') */}
          {section.layout === 'flexible' && (
            <div className="space-y-3 border-t pt-3">
              <h4 className="text-sm font-medium text-gray-900">Flex Settings</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Direction</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => updateSection({
                      flexConfig: {
                        ...section.flexConfig!,
                        direction: 'row'
                      }
                    })}
                    className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                      section.flexConfig?.direction === 'row'
                        ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Row
                  </button>
                  <button
                    onClick={() => updateSection({
                      flexConfig: {
                        ...section.flexConfig!,
                        direction: 'column'
                      }
                    })}
                    className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                      section.flexConfig?.direction === 'column'
                        ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Column
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Justify Content</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => updateSection({
                      flexConfig: {
                        ...section.flexConfig!,
                        justifyContent: 'flex-start'
                      }
                    })}
                    className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                      section.flexConfig?.justifyContent === 'flex-start'
                        ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Start
                  </button>
                  <button
                    onClick={() => updateSection({
                      flexConfig: {
                        ...section.flexConfig!,
                        justifyContent: 'center'
                      }
                    })}
                    className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                      section.flexConfig?.justifyContent === 'center'
                        ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Center
                  </button>
                  <button
                    onClick={() => updateSection({
                      flexConfig: {
                        ...section.flexConfig!,
                        justifyContent: 'flex-end'
                      }
                    })}
                    className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                      section.flexConfig?.justifyContent === 'flex-end'
                        ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    End
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gap</label>
                <input
                  type="text"
                  value={section.flexConfig?.gap || '1rem'}
                  onChange={(e) => updateSection({
                    flexConfig: {
                      ...section.flexConfig!,
                      gap: e.target.value
                    }
                  })}
                  placeholder="24"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">Space between items (e.g., 24, 1rem, 20px)</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Wrap</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => updateSection({
                      flexConfig: {
                        ...section.flexConfig!,
                        wrap: true
                      }
                    })}
                    className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                      section.flexConfig?.wrap === true
                        ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    true
                  </button>
                  <button
                    onClick={() => updateSection({
                      flexConfig: {
                        ...section.flexConfig!,
                        wrap: false
                      }
                    })}
                    className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                      section.flexConfig?.wrap === false
                        ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    false
                  </button>
                </div>
              </div>
              
              {/* Flex Layout Guide */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mt-3">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-purple-800">
                    <p className="font-medium mb-1">When to Use Flex Layout</p>
                    <ul className="text-xs space-y-1">
                      <li>• <strong>Natural flow:</strong> Items arrange based on their content size</li>
                      <li>• <strong>Mixed widths:</strong> Perfect for toolbars, navigation, tag lists</li>
                      <li>• <strong>Flex Grow:</strong> Enable on widgets to fill remaining space</li>
                      <li>• <strong>Auto wrapping:</strong> Items wrap to next line when container is full</li>
                      <li>• <strong>Direction:</strong> Row (horizontal) or Column (vertical) flow</li>
                    </ul>
                    <p className="text-xs mt-2 italic">💡 Use Grid when you need equal-sized items in a structured layout</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Grid Settings (only show when layout === 'grid') */}
          {section.layout === 'grid' && (
            <div className="space-y-3 border-t pt-3">
              <h4 className="text-sm font-medium text-gray-900">Grid Settings</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Columns</label>
                <select
                  value={typeof section.gridConfig?.columns === 'number' ? section.gridConfig.columns : section.gridConfig?.columns || 3}
                  onChange={(e) => {
                    const value = e.target.value
                    updateSection({
                      gridConfig: {
                        ...section.gridConfig,
                        columns: value === 'auto-fit' || value === 'auto-fill' ? value : parseInt(value),
                        gap: section.gridConfig?.gap || '1rem',
                        alignItems: section.gridConfig?.alignItems || 'stretch',
                        justifyItems: section.gridConfig?.justifyItems || 'stretch'
                      }
                    })
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="1">1 Column</option>
                  <option value="2">2 Columns</option>
                  <option value="3">3 Columns</option>
                  <option value="4">4 Columns</option>
                  <option value="6">6 Columns</option>
                  <option value="12">12 Columns</option>
                  <option value="auto-fit">Auto-fit (Responsive)</option>
                  <option value="auto-fill">Auto-fill (Responsive)</option>
                </select>
              </div>
              
              {(section.gridConfig?.columns === 'auto-fit' || section.gridConfig?.columns === 'auto-fill') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Column Width</label>
                  <input
                    type="text"
                    value={section.gridConfig?.minColumnWidth || '200px'}
                    onChange={(e) => updateSection({
                      gridConfig: {
                        ...section.gridConfig!,
                        minColumnWidth: e.target.value
                      }
                    })}
                    placeholder="200px"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum width for each column (e.g., 200px, 250px)</p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gap</label>
                <input
                  type="text"
                  value={section.gridConfig?.gap || '1rem'}
                  onChange={(e) => updateSection({
                    gridConfig: {
                      ...section.gridConfig!,
                      gap: e.target.value
                    }
                  })}
                  placeholder="1rem"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">Space between items (e.g., 1rem, 20px, 1.5rem)</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Align Items</label>
                  <select
                    value={section.gridConfig?.alignItems || 'stretch'}
                    onChange={(e) => updateSection({
                      gridConfig: {
                        ...section.gridConfig!,
                        alignItems: e.target.value as 'start' | 'center' | 'end' | 'stretch'
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="stretch">Stretch</option>
                    <option value="start">Start</option>
                    <option value="center">Center</option>
                    <option value="end">End</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Justify Items</label>
                  <select
                    value={section.gridConfig?.justifyItems || 'stretch'}
                    onChange={(e) => updateSection({
                      gridConfig: {
                        ...section.gridConfig!,
                        justifyItems: e.target.value as 'start' | 'center' | 'end' | 'stretch'
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="stretch">Stretch</option>
                    <option value="start">Start</option>
                    <option value="center">Center</option>
                    <option value="end">End</option>
                  </select>
                </div>
              </div>
              
              {/* Grid Layout Guide */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">When to Use Grid Layout</p>
                    <ul className="text-xs space-y-1">
                      <li>• <strong>Structured layout:</strong> Rigid column/row structure for consistency</li>
                      <li>• <strong>Equal sizing:</strong> All items fit into uniform cells (great for galleries)</li>
                      <li>• <strong>Spanning:</strong> Widgets can span multiple columns/rows for emphasis</li>
                      <li>• <strong>Auto-responsive:</strong> Use auto-fit/auto-fill for dynamic columns</li>
                      <li>• <strong>Drop anywhere:</strong> Widgets auto-flow into columns left-to-right</li>
                    </ul>
                    <p className="text-xs mt-2 italic">💡 Use Flex when you want natural, flowing content with mixed widths</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900 border-b pb-2">Background</h4>
            
          <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Background Type</label>
              <select
                value={backgroundType}
                onChange={(e) => {
                  const newType = e.target.value as 'color' | 'image' | 'gradient' | 'none'
                  updateSection({
                    background: newType === 'none' ? undefined : {
                      type: newType,
                      ...(newType === 'color' && { color: '#ffffff' }),
                      ...(newType === 'image' && { 
                        image: { 
                          url: '', 
                          position: 'center', 
                          repeat: 'no-repeat', 
                          size: 'cover' 
                        } 
                      }),
                      ...(newType === 'gradient' && { 
                        gradient: { 
                          type: 'linear', 
                          direction: 'to right',
                          stops: [
                            { color: '#ffffff', position: '0%' },
                            { color: '#f3f4f6', position: '100%' }
                          ]
                        } 
                      })
                    }
                  })
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="none">None</option>
                <option value="color">Solid Color</option>
                <option value="image">Background Image</option>
                <option value="gradient">Gradient</option>
              </select>
            </div>
            
            {backgroundType === 'color' && (() => {
              const { currentWebsiteId, websites, themes } = usePageStore.getState()
              const currentWebsite = websites.find((w: any) => w.id === currentWebsiteId)
              const currentTheme = currentWebsite 
                ? themes.find((t: any) => t.id === currentWebsite.themeId)
                : null
              
              const isCarbonTheme = currentTheme?.id === 'ibm-carbon-ds'
              
              return (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
                  {isCarbonTheme && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-2">Carbon Layers:</p>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { label: 'BG', color: '#ffffff' },
                          { label: 'Layer 01', color: '#f4f4f4' },
                          { label: 'Layer 02', color: '#ffffff' },
                          { label: 'Layer 03', color: '#f4f4f4' }
                        ].map((layer) => (
                          <button
                            key={layer.label}
                            onClick={() => updateSection({
                              background: {
                                ...section.background,
                                type: 'color',
                                color: layer.color
                              }
                            })}
                            className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                            style={{ backgroundColor: layer.color }}
                          >
                            {layer.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={section.background?.color || '#ffffff'}
                      onChange={(e) => updateSection({
                        background: {
                          ...section.background,
                          type: 'color',
                          color: e.target.value
                        }
                      })}
                      className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={section.background?.color || '#ffffff'}
                      onChange={(e) => updateSection({
                        background: {
                          ...section.background,
                          type: 'color',
                          color: e.target.value
                        }
                      })}
                      placeholder="#ffffff"
                      className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm font-mono"
                    />
                  </div>
                </div>
              )
            })()}
            
            {backgroundType === 'image' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                  <input
                    type="url"
                    value={section.background?.image?.url || ''}
                    onChange={(e) => updateSection({
                      background: {
                        ...section.background,
                        type: 'image',
                        image: {
                          ...section.background?.image,
                          url: e.target.value,
                          position: section.background?.image?.position || 'center',
                          repeat: section.background?.image?.repeat || 'no-repeat',
                          size: section.background?.image?.size || 'cover'
                        }
                      }
                    })}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                    <select
                      value={section.background?.image?.position || 'center'}
                      onChange={(e) => updateSection({
                        background: {
                          ...section.background,
                          type: 'image',
                          image: {
                            ...section.background?.image,
                            url: section.background?.image?.url || '',
                            position: e.target.value as any,
                            repeat: section.background?.image?.repeat || 'no-repeat',
                            size: section.background?.image?.size || 'cover'
                          }
                        }
                      })}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                    >
                      <option value="center">Center</option>
                      <option value="top">Top</option>
                      <option value="bottom">Bottom</option>
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                      <option value="cover">Cover</option>
                      <option value="contain">Contain</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                    <select
                      value={section.background?.image?.size || 'cover'}
                      onChange={(e) => updateSection({
                        background: {
                          ...section.background,
                          type: 'image',
                          image: {
                            ...section.background?.image,
                            url: section.background?.image?.url || '',
                            position: section.background?.image?.position || 'center',
                            repeat: section.background?.image?.repeat || 'no-repeat',
                            size: e.target.value
                          }
                        }
                      })}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                    >
                      <option value="cover">Cover</option>
                      <option value="contain">Contain</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Repeat</label>
                  <select
                    value={section.background?.image?.repeat || 'no-repeat'}
                    onChange={(e) => updateSection({
                      background: {
                        ...section.background,
                        type: 'image',
                        image: {
                          ...section.background?.image,
                          url: section.background?.image?.url || '',
                          position: section.background?.image?.position || 'center',
                          repeat: e.target.value as any,
                          size: section.background?.image?.size || 'cover'
                        }
                      }
                    })}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                  >
                    <option value="no-repeat">No Repeat</option>
                    <option value="repeat">Repeat</option>
                    <option value="repeat-x">Repeat X</option>
                    <option value="repeat-y">Repeat Y</option>
                  </select>
                </div>
              </div>
            )}
            
            {backgroundType !== 'none' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Background Opacity: {Math.round((section.background?.opacity || 1) * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={section.background?.opacity || 1}
                  onChange={(e) => updateSection({
                    background: {
                      ...section.background,
                      type: backgroundType as any,
                      opacity: parseFloat(e.target.value)
                    }
                  })}
                  className="w-full"
                />
              </div>
            )}
          </div>
          
          {/* Spacing & Layout Configuration */}
          {(() => {
            const { currentWebsiteId, websites, themes } = usePageStore.getState()
            const currentWebsite = websites.find((w: any) => w.id === currentWebsiteId)
            const currentTheme = currentWebsite 
              ? themes.find((t: any) => t.id === currentWebsite.themeId)
              : null
            
            const hasSpacingTokens = currentTheme?.id === 'wiley-figma-ds-v2' && currentTheme?.spacing?.semantic
            
            return (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-900 border-b pb-2">Spacing & Layout</h4>
                
                {/* Section Padding */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Section Padding</label>
                  {hasSpacingTokens && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-2">Quick presets (Wiley DS):</p>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { label: 'None', value: 'none' },
                          { label: 'SM', value: 'sm' },
                          { label: 'MD', value: 'md' },
                          { label: 'LG', value: 'lg' },
                          { label: 'XL', value: 'xl' },
                          { label: '2XL', value: '2xl' },
                          { label: '3XL', value: '3xl' }
                        ].map((preset) => (
                          <button
                            key={preset.value}
                            onClick={() => updateSection({
                              padding: `semantic.${preset.value}`
                            })}
                            className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-blue-50 transition-colors"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <input
                    type="text"
                    value={section.padding || ''}
                    onChange={(e) => updateSection({ padding: e.target.value || undefined })}
                    placeholder={hasSpacingTokens ? "semantic.lg or 24px" : "e.g., 24px or 1.5rem"}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {hasSpacingTokens 
                      ? "Use presets above or custom values (e.g., semantic.lg, base.6, 24px)"
                      : "Use CSS units (e.g., 24px, 1.5rem)"}
                  </p>
                </div>
                
                {/* Min Height */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Height</label>
                  <input
                    type="text"
                    value={section.minHeight || ''}
                    onChange={(e) => updateSection({ minHeight: e.target.value || undefined })}
                    placeholder="e.g., 500px or 60vh"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Useful for hero sections or full-height banners
                  </p>
                </div>
              </div>
            )
          })()}
          
          {/* Section Behavior Configuration */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900 border-b pb-2">Content Behavior</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content Width Behavior</label>
              <select
                value={section.behavior || 'auto'}
                onChange={(e) => updateSection({
                  behavior: e.target.value as 'auto' | 'full-width'
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="auto">Auto (Constrained)</option>
                <option value="full-width">Full Width</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Auto: Content is constrained within breakpoint width. Full Width: Content spans entire screen.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content Mode</label>
              <select
                value={section.contentMode || ''}
                onChange={(e) => updateSection({
                  contentMode: e.target.value === '' ? undefined : e.target.value as 'light' | 'dark'
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">Auto (Based on background)</option>
                <option value="light">Light (Dark text)</option>
                <option value="dark">Dark (White text)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Controls text color for Publication widgets and Menu widgets. Use "Dark" for dark backgrounds. Branding can add accent colors on top.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  // Widget properties
  const widget = selectedItem as Widget
  
  // Find parent section for list-based widgets (needed for pattern controls)
  let parentSection: WidgetSection | undefined
  for (const canvasItem of canvasItems) {
    if (isSection(canvasItem)) {
      for (const area of canvasItem.areas) {
        if (area.widgets.some(w => w.id === widget.id)) {
          parentSection = canvasItem as WidgetSection
          break
        }
      }
      if (parentSection) break
    }
  }
  
  return (
    <div className="h-full">
      {isEditingMenuItems && widget.type === 'menu' ? (
        // Two-Column Layout: Basic Properties + Menu Items Editor
        <div className="flex h-full">
          {/* Left Column: Basic Properties */}
          <div className="w-[420px] p-4 space-y-4 border-r border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">Menu Properties</h3>
              <button
                onClick={() => setIsEditingMenuItems(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Close editor"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Widget Type</span>
                <span className="text-xs px-2 py-1 rounded-full font-medium bg-purple-100 text-purple-700">Menu</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Menu Type</label>
              <select
                value={(widget as MenuWidget).menuType}
                onChange={(e) => {
                  const newMenuType = e.target.value as 'global' | 'context-aware' | 'custom';
                  updateWidget({ 
                    menuType: newMenuType,
                    ...(newMenuType === 'context-aware' && (widget as MenuWidget).items.length === 0 ? {
                      contextSource: 'journal',
                      items: [
                        { id: nanoid(), label: '{{journal.name}} Home', url: '/journals/{{journal.code}}', target: '_self' as const, displayCondition: 'always' as const, isContextGenerated: true, order: 0 },
                        { id: nanoid(), label: 'Current Issue', url: '/journals/{{journal.code}}/current', target: '_self' as const, displayCondition: 'if-issue-exists' as const, isContextGenerated: true, order: 1 },
                        { id: nanoid(), label: 'All Issues', url: '/journals/{{journal.code}}/issues', target: '_self' as const, displayCondition: 'always' as const, isContextGenerated: true, order: 2 },
                        { id: nanoid(), label: 'Archive', url: '/journals/{{journal.code}}/issues', target: '_self' as const, displayCondition: 'if-has-archive' as const, isContextGenerated: true, order: 3 }
                      ]
                    } : {})
                  })
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="global">Global</option>
                <option value="context-aware">Context-Aware</option>
                <option value="custom">Custom</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {(widget as MenuWidget).menuType === 'global' && 'Static menu items'}
                {(widget as MenuWidget).menuType === 'context-aware' && 'Adapts to page context'}
                {(widget as MenuWidget).menuType === 'custom' && 'Blank slate'}
              </p>
            </div>
            
            {(widget as MenuWidget).menuType === 'context-aware' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Context Source</label>
                <select
                  value={(widget as MenuWidget).contextSource || 'journal'}
                  onChange={(e) => updateWidget({ contextSource: e.target.value as 'journal' | 'book' | 'conference' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="journal">Journal</option>
                  <option value="book">Book</option>
                  <option value="conference">Conference</option>
                </select>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Menu Style</label>
              <select
                value={(widget as MenuWidget).style}
                onChange={(e) => updateWidget({ style: e.target.value as 'horizontal' | 'vertical' | 'dropdown' | 'footer-links' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="horizontal">Horizontal</option>
                <option value="vertical">Vertical</option>
                <option value="dropdown">Dropdown</option>
                <option value="footer-links">Footer Links</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Alignment</label>
              <select
                value={(widget as MenuWidget).align || 'left'}
                onChange={(e) => updateWidget({ align: e.target.value as 'left' | 'center' | 'right' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-xs text-blue-800 font-medium mb-1">💡 Template Variables</p>
              <p className="text-xs text-blue-700">
                Use <code className="bg-blue-100 px-1 rounded">{'{{journal.name}}'}</code>, <code className="bg-blue-100 px-1 rounded">{'{{journal.code}}'}</code> in labels/URLs
              </p>
            </div>
          </div>
          
          {/* Right Column: Menu Items Editor */}
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">Menu Items ({(widget as MenuWidget).items.length})</h3>
              <button
                onClick={() => {
                  const newItem: MenuItem = {
                    id: nanoid(),
                    label: 'New Item',
                    url: '#',
                    target: '_self',
                    displayCondition: 'always',
                    order: (widget as MenuWidget).items.length,
                    isContextGenerated: false
                  }
                  updateWidget({ items: [...(widget as MenuWidget).items, newItem] })
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Item
              </button>
            </div>
          
          <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
            {(widget as MenuWidget).items.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                No menu items yet. Click "Add Menu Item" below to get started.
              </div>
            ) : (
              (widget as MenuWidget).items.map((item, index) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-3 bg-white">
                  <div className="flex items-start gap-2">
                    <div className="mt-2">
                      <GripVertical className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Label</label>
                        <input
                          type="text"
                          value={item.label}
                          onChange={(e) => {
                            const newItems = [...(widget as MenuWidget).items]
                            newItems[index] = { ...item, label: e.target.value }
                            updateWidget({ items: newItems })
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          placeholder="Menu item label"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">URL</label>
                        <input
                          type="text"
                          value={item.url}
                          onChange={(e) => {
                            const newItems = [...(widget as MenuWidget).items]
                            newItems[index] = { ...item, url: e.target.value }
                            updateWidget({ items: newItems })
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          placeholder="/path or https://..."
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Target</label>
                          <select
                            value={item.target}
                            onChange={(e) => {
                              const newItems = [...(widget as MenuWidget).items]
                              newItems[index] = { ...item, target: e.target.value as any }
                              updateWidget({ items: newItems })
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          >
                            <option value="_self">Same window</option>
                            <option value="_blank">New window</option>
                            <option value="_parent">Parent</option>
                            <option value="_top">Top</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Show When</label>
                          <select
                            value={item.displayCondition || 'always'}
                            onChange={(e) => {
                              const newItems = [...(widget as MenuWidget).items]
                              newItems[index] = { ...item, displayCondition: e.target.value as any }
                              updateWidget({ items: newItems })
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          >
                            <option value="always">Always</option>
                            <option value="if-issue-exists">If issue exists</option>
                            <option value="if-has-archive">If archive</option>
                            <option value="if-journal-context">If journal</option>
                          </select>
                        </div>
                      </div>
                      
                      {item.isContextGenerated && (
                        <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          ℹ️ Context-generated
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => {
                        const newItems = (widget as MenuWidget).items.filter((_, i) => i !== index)
                        updateWidget({ items: newItems })
                      }}
                      className="mt-2 p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          </div>
        </div>
      ) : (
        // Normal Properties View
        <div className="p-4 space-y-4">
          <h3 className="font-semibold text-gray-900">Widget Properties</h3>
      
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Widget Type</span>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            (widget as any).type === 'publication-details' ? 'bg-blue-100 text-blue-700' :
            (widget as any).type === 'publication-list' ? 'bg-green-100 text-green-700' :
            (widget as any).type === 'button' ? 'bg-orange-100 text-orange-700' :
            (widget as any).type === 'text' ? 'bg-purple-100 text-purple-700' :
            (widget as any).type === 'image' ? 'bg-pink-100 text-pink-700' :
            (widget as any).type === 'navbar' ? 'bg-indigo-100 text-indigo-700' :
            (widget as any).type === 'heading' ? 'bg-yellow-100 text-yellow-700' :
            (widget as any).type === 'html' ? 'bg-red-100 text-red-700' :
            (widget as any).type === 'code' ? 'bg-teal-100 text-teal-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {(widget as any).type === 'publication-details' ? 'Publication Details' :
             (widget as any).type === 'publication-list' ? 'Publication List' :
             (widget as any).type === 'button' ? 'Button Link' :
             (widget as any).type === 'text' ? 'Text' :
             (widget as any).type === 'image' ? 'Image' :
             (widget as any).type === 'navbar' ? 'Navigation' :
             (widget as any).type === 'heading' ? 'Heading' :
             (widget as any).type === 'html' ? 'HTML Block' :
             (widget as any).type === 'code' ? 'Code Block' :
             (widget as any).type.charAt(0).toUpperCase() + (widget as any).type.slice(1)
            } Widget
          </span>
        </div>
        <div className="mt-2 pt-2 border-t border-gray-200">
          <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Widget ID</span>
          <p className="mt-1 text-xs text-gray-700 font-mono bg-white px-2 py-1 rounded border border-gray-200 break-all">{widget.id}</p>
        </div>
      </div>
      
      {/* Flex Properties (only show if parent section has flexible layout) */}
      {/* Note: List-based widgets (Publication List, etc.) use the pattern system instead */}
      {(() => {
        // Skip for list-based widgets - they use pattern system
        const isListWidget = widget.type === 'publication-list' // Add more list widget types here later
        if (isListWidget) {
          return null
        }
        
        // Find parent section
        const parentSection = canvasItems.find((item: CanvasItem): item is WidgetSection => 
          isSection(item) && item.areas.some(area => area.widgets.some(w => w.id === widget.id))
        )
        
        if (parentSection?.layout === 'flexible') {
          return (
            <div className="space-y-3 border border-purple-200 rounded-lg p-3 bg-purple-50/30">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-purple-900">Flex Properties</h4>
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">Flex Layout</span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Flex Grow</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => updateWidget({
                      flexProperties: {
                        grow: true
                      }
                    })}
                    className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                      widget.flexProperties?.grow === true
                        ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    true
                  </button>
                  <button
                    onClick={() => updateWidget({
                      flexProperties: {
                        grow: false
                      }
                    })}
                    className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                      widget.flexProperties?.grow === false || !widget.flexProperties?.grow
                        ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    false
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Whether this widget grows to fill available space</p>
              </div>
              
              {/* Flex Grow Guide */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mt-3">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-purple-800">
                    <p className="font-medium mb-1">Understanding Flex Grow</p>
                    <ul className="text-xs space-y-1">
                      <li>• <strong>false (default):</strong> Widget takes its natural content size</li>
                      <li>• <strong>true:</strong> Widget expands to fill remaining horizontal space</li>
                      <li>• Use for text/buttons that should stretch to fill gaps</li>
                      <li>• Images with grow enabled maintain aspect ratio (max natural size)</li>
                      <li>• Multiple widgets with grow share space equally</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )
        }
        
        return null
      })()}
      
      {/* Grid Placement (only show if parent section has grid layout) */}
      {/* Note: List-based widgets (Publication List, etc.) use the pattern system instead */}
      {(() => {
        // Skip for list-based widgets - they use pattern system
        const isListWidget = widget.type === 'publication-list' // Add more list widget types here later
        if (isListWidget) {
          return null
        }
        
        // Find parent section
        const parentSection = canvasItems.find((item: CanvasItem): item is WidgetSection => 
          isSection(item) && item.areas.some(area => area.widgets.some(w => w.id === widget.id))
        )
        
        if (parentSection?.layout === 'grid') {
          return (
            <div className="space-y-3 border border-blue-200 rounded-lg p-3 bg-blue-50/30">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-blue-900">Grid Placement</h4>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">Grid Layout</span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Column Span</label>
                <select
                  value={widget.gridSpan?.column || 'span 1'}
                  onChange={(e) => updateWidget({
                    gridSpan: {
                      ...widget.gridSpan,
                      column: e.target.value
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
                >
                  <option value="span 1">Span 1 column</option>
                  <option value="span 2">Span 2 columns</option>
                  <option value="span 3">Span 3 columns</option>
                  <option value="span 4">Span 4 columns</option>
                  <option value="span 6">Span 6 columns</option>
                  <option value="1 / -1">Full width (all columns)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">How many columns this widget spans</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Row Span</label>
                <select
                  value={widget.gridSpan?.row || 'span 1'}
                  onChange={(e) => updateWidget({
                    gridSpan: {
                      ...widget.gridSpan,
                      row: e.target.value
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
                >
                  <option value="span 1">Span 1 row</option>
                  <option value="span 2">Span 2 rows</option>
                  <option value="span 3">Span 3 rows</option>
                  <option value="span 4">Span 4 rows</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">How many rows this widget spans</p>
              </div>
              
              <div className="flex gap-2 pt-2 border-t border-blue-200">
                <button
                  onClick={() => updateWidget({
                    gridSpan: { column: 'span 1', row: 'span 1' }
                  })}
                  className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded bg-white hover:bg-gray-50 transition-colors"
                >
                  Reset
                </button>
                <button
                  onClick={() => updateWidget({
                    gridSpan: { column: '1 / -1', row: 'span 1' }
                  })}
                  className="flex-1 px-2 py-1 text-xs border border-blue-300 rounded bg-blue-50 hover:bg-blue-100 transition-colors text-blue-700 font-medium"
                >
                  Full Width
                </button>
              </div>
              
              {/* Grid Spanning Guide */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Understanding Grid Spanning</p>
                    <ul className="text-xs space-y-1">
                      <li>• <strong>Column span:</strong> How many columns wide this widget is</li>
                      <li>• <strong>Row span:</strong> How many rows tall this widget is</li>
                      <li>• <strong>Full width:</strong> Quick button to span all columns (great for headers)</li>
                      <li>• Widgets auto-flow into grid cells left-to-right, top-to-bottom</li>
                      <li>• Spanning creates visual hierarchy and emphasis</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )
        }
        return null
      })()}
      
      {/* === REGISTRY-BASED WIDGET EDITORS === */}
      {/* Use extracted editors for widgets in the registry */}
      {(() => {
        const WidgetEditor = PROPERTY_EDITORS[widget.type]
        if (WidgetEditor) {
          return <WidgetEditor widget={widget} updateWidget={updateWidget} />
        }
        return null
      })()}
      
      {/* === LEGACY WIDGET EDITORS (not yet in registry) === */}
      {/* These will be removed as widgets are migrated to the registry */}
      
      {/* Text widget - NOW IN REGISTRY, keeping as fallback */}
      {!PROPERTY_EDITORS['text'] && widget.type === 'text' && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Text</label>
            <textarea
              value={widget.text}
              onChange={(e) => updateWidget({ text: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alignment</label>
            <select
              value={widget.align || 'left'}
              onChange={(e) => updateWidget({ align: e.target.value as 'left' | 'center' | 'right' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
          
          {(() => {
            const { currentWebsiteId, websites, themes } = usePageStore.getState()
            const currentWebsite = websites.find((w: any) => w.id === currentWebsiteId)
            const currentTheme = currentWebsite 
              ? themes.find((t: any) => t.id === currentWebsite.themeId)
              : null
            
            // Wiley DS V2: Show body text styles + code/mono
            if (currentTheme?.id === 'wiley-figma-ds-v2') {
              return (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Typography Style</label>
                  <select
                    value={widget.typographyStyle || ''}
                    onChange={(e) => updateWidget({ typographyStyle: (e.target.value || undefined) as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Default</option>
                    <option value="body-xl">Body XL</option>
                    <option value="body-lg">Body Large</option>
                    <option value="body-md">Body Medium</option>
                    <option value="body-sm">Body Small</option>
                    <option value="body-xs">Body XSmall</option>
                    <option value="code-mono">Code/Mono (IBM Plex)</option>
                  </select>
                </div>
              )
            }
            
            // IBM Carbon: Show Carbon body styles
            if (currentTheme?.id === 'ibm-carbon-ds') {
              return (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Typography Style
                    <span className="text-xs text-gray-500 ml-1">(Carbon)</span>
                  </label>
                  <select
                    value={widget.typographyStyle || ''}
                    onChange={(e) => updateWidget({ typographyStyle: (e.target.value || undefined) as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Default</option>
                    <option value="body-01">Body 01 (14px/regular)</option>
                    <option value="body-02">Body 02 (16px/regular)</option>
                    <option value="body-compact-01">Body Compact 01 (14px/tight)</option>
                    <option value="body-compact-02">Body Compact 02 (16px/tight)</option>
                    <option value="label-01">Label 01 (12px)</option>
                    <option value="label-02">Label 02 (14px)</option>
                    <option value="helper-text-01">Helper Text 01 (12px italic)</option>
                    <option value="helper-text-02">Helper Text 02 (14px italic)</option>
                  </select>
                </div>
              )
            }
            return null
          })()}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Inline Styles
              <span className="text-xs text-gray-500 ml-1">(CSS properties)</span>
            </label>
            <textarea
              value={widget.inlineStyles || ''}
              onChange={(e) => updateWidget({ inlineStyles: e.target.value })}
              placeholder="font-family: courier;&#10;font-weight: 800;&#10;color: #333;"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono resize-none"
              rows={4}
            />
            <p className="text-xs text-gray-500 mt-1">
              Add CSS properties separated by semicolons
            </p>
          </div>
        </div>
      )}
      
      {!PROPERTY_EDITORS['heading'] && widget.type === 'heading' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Heading Text</label>
            <input
              type="text"
              value={(widget as HeadingWidget).text}
              onChange={(e) => updateWidget({ text: e.target.value })}
              placeholder="Enter your heading text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Semantic Level</label>
              <select
                value={(widget as HeadingWidget).level}
                onChange={(e) => updateWidget({ level: parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5 | 6 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value={1}>H1 (Main Title)</option>
                <option value={2}>H2 (Section)</option>
                <option value={3}>H3 (Subsection)</option>
                <option value={4}>H4 (Subheading)</option>
                <option value={5}>H5 (Minor Head)</option>
                <option value={6}>H6 (Small Head)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Alignment</label>
              <select
                value={(widget as HeadingWidget).align || 'left'}
                onChange={(e) => updateWidget({ align: e.target.value as 'left' | 'center' | 'right' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Heading Style</label>
            <select
              value={(widget as HeadingWidget).style || 'default'}
              onChange={(e) => updateWidget({ style: e.target.value as HeadingWidget['style'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="default">Default</option>
              <option value="bordered-left">Bordered Left</option>
              <option value="underlined">Underlined</option>
              <option value="highlighted">Highlighted Background</option>
              <option value="decorated">Decorated</option>
              <option value="gradient">Gradient Text</option>
              <option value="hero">Hero - Bold white text with margin</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
            <select
              value={(widget as HeadingWidget).size || 'auto'}
              onChange={(e) => updateWidget({ size: e.target.value as HeadingWidget['size'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="auto">
                Auto ({
                  (widget as HeadingWidget).level === 1 ? 'Extra Large' :
                  (widget as HeadingWidget).level === 2 ? 'Large' :
                  (widget as HeadingWidget).level === 3 ? 'Medium' :
                  'Small'
                })
              </option>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
              <option value="xl">Extra Large</option>
            </select>
          </div>
          
          <div className="border-t pt-4">
            <IconSelector
              icon={(widget as HeadingWidget).icon}
              onChange={(icon) => updateWidget({ icon })}
            />
          </div>
          
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Heading Best Practices</p>
              <ul className="text-xs space-y-1">
                <li>• Use semantic levels (H1→H2→H3) for proper structure</li>
                <li>• Auto sizing creates visual hierarchy: H1=XL, H2=Large, etc.</li>
                <li>• Keep headings concise and descriptive</li>
                <li>• Use styles (Hero, Decorated) for visual emphasis</li>
                <li>• Override size only when needed for design consistency</li>
              </ul>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {!PROPERTY_EDITORS['image'] && widget.type === 'image' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Image Source URL</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={(widget as ImageWidget).src}
                onChange={(e) => updateWidget({ src: e.target.value })}
                placeholder="https://example.com/image.jpg"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <button
                onClick={() => {
                  // Generate random Picsum URL with timestamp to ensure uniqueness
                  const randomUrl = `https://picsum.photos/800/600?random=${Date.now()}`
                  updateWidget({ src: randomUrl })
                }}
                className="px-3 py-2 bg-purple-50 border border-purple-300 text-purple-700 rounded-md text-sm font-medium hover:bg-purple-100 transition-colors whitespace-nowrap"
                title="Load random image from Picsum"
              >
                🎲 Random
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Or click Random to load a placeholder image from Picsum</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Alt Text</label>
            <input
              type="text"
              value={(widget as ImageWidget).alt}
              onChange={(e) => updateWidget({ alt: e.target.value })}
              placeholder="Descriptive text for accessibility"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Caption (Optional)</label>
            <input
              type="text"
              value={(widget as ImageWidget).caption || ''}
              onChange={(e) => updateWidget({ caption: e.target.value })}
              placeholder="Image caption or description"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Link URL (Optional)</label>
            <input
              type="url"
              value={(widget as ImageWidget).link || ''}
              onChange={(e) => updateWidget({ link: e.target.value })}
              placeholder="https://example.com (make image clickable)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Aspect Ratio</label>
              <select
                value={(widget as ImageWidget).ratio || 'auto'}
                onChange={(e) => updateWidget({ ratio: e.target.value as ImageWidget['ratio'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="auto">Auto</option>
                <option value="1:1">Square (1:1)</option>
                <option value="4:3">Landscape (4:3)</option>
                <option value="3:4">Portrait (3:4)</option>
                <option value="16:9">Widescreen (16:9)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Alignment</label>
              <select
                value={(widget as ImageWidget).alignment || 'center'}
                onChange={(e) => updateWidget({ alignment: e.target.value as ImageWidget['alignment'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Width</label>
              <select
                value={(widget as ImageWidget).width || 'full'}
                onChange={(e) => updateWidget({ width: e.target.value as ImageWidget['width'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="auto">Auto</option>
                <option value="small">Small (25%)</option>
                <option value="medium">Medium (50%)</option>
                <option value="large">Large (75%)</option>
                <option value="full">Full Width</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Object Fit</label>
              <select
                value={(widget as ImageWidget).objectFit || 'cover'}
                onChange={(e) => updateWidget({ objectFit: e.target.value as ImageWidget['objectFit'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="cover">Cover</option>
                <option value="contain">Contain</option>
                <option value="fill">Fill</option>
                <option value="scale-down">Scale Down</option>
                <option value="none">None</option>
              </select>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Image Best Practices</p>
                <ul className="text-xs space-y-1">
                  <li>• Use descriptive alt text for accessibility</li>
                  <li>• Optimize images for web (WebP, JPEG, PNG)</li>
                  <li>• Consider loading performance for large images</li>
                  <li>• Use appropriate aspect ratios for your design</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {!PROPERTY_EDITORS['html'] && widget.type === 'html' && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">HTML Content</label>
            <textarea
              value={(widget as HTMLWidget).htmlContent}
              onChange={(e) => updateWidget({ htmlContent: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm resize-none"
              rows={8}
              placeholder="Enter your HTML code here..."
            />
          </div>
          
          <div className="space-y-2">
            <button
              onClick={() => {
                const interactiveExample = `<div style="padding: 20px; font-family: system-ui;">
  <h2 style="color: #2563eb; margin-bottom: 20px;">Interactive Widget Example</h2>
  
  <div style="display: flex; gap: 20px;">
    <!-- Left Side - Clickable Tags -->
    <div style="flex: 1;">
      <h3 style="margin-bottom: 15px;">Click on categories:</h3>
      <div style="display: flex; flex-wrap: gap: 8px;">
        <button class="clickable" onclick="showContent('profile')" style="background: #3b82f6; color: white; padding: 8px 16px; border: none; border-radius: 20px; cursor: pointer;">Profile (84)</button>
        <button class="clickable" onclick="showContent('general')" style="background: #6b7280; color: white; padding: 8px 16px; border: none; border-radius: 20px; cursor: pointer;">General (32)</button>
        <button class="clickable" onclick="showContent('search')" style="background: #059669; color: white; padding: 8px 16px; border: none; border-radius: 20px; cursor: pointer;">Search (6)</button>
        <button class="clickable" onclick="showContent('reports')" style="background: #dc2626; color: white; padding: 8px 16px; border: none; border-radius: 20px; cursor: pointer;">Reports (6)</button>
      </div>
    </div>
    
    <!-- Right Side - Dynamic Content -->
    <div style="flex: 1; border-left: 2px solid #e5e7eb; padding-left: 20px;">
      <div id="content-area">
        <p style="color: #6b7280; font-style: italic;">Click on a category to see its content</p>
      </div>
    </div>
  </div>
  
  <script>
    function showContent(category) {
      const contentArea = document.getElementById('content-area');
      
      const content = {
        profile: \`<h4 style="color: #3b82f6; margin-bottom: 10px;">Profile Widgets (84)</h4>
                  <ul style="list-style: none; padding: 0;">
                    <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">User Profile Display</li>
                    <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">Profile Settings</li>
                    <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">Avatar Management</li>
                    <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">Account Preferences</li>
                    <li style="padding: 8px 0; color: #6b7280;">...and 80 more</li>
                  </ul>\`,
        general: \`<h4 style="color: #6b7280; margin-bottom: 10px;">General Widgets (32)</h4>
                   <ul style="list-style: none; padding: 0;">
                     <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">Text Blocks</li>
                     <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">Image Gallery</li>
                     <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">Button Groups</li>
                     <li style="padding: 8px 0; color: #6b7280;">...and 29 more</li>
                   </ul>\`,
        search: \`<h4 style="color: #059669; margin-bottom: 10px;">Search Widgets (6)</h4>
                  <ul style="list-style: none; padding: 0;">
                    <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">Advanced Search Form</li>
                    <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">Search Results Display</li>
                    <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">Filter Controls</li>
                    <li style="padding: 8px 0; color: #6b7280;">...and 3 more</li>
                  </ul>\`,
        reports: \`<h4 style="color: #dc2626; margin-bottom: 10px;">Report Widgets (6)</h4>
                   <ul style="list-style: none; padding: 0;">
                     <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">Analytics Dashboard</li>
                     <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">Data Visualization</li>
                     <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">Export Tools</li>
                     <li style="padding: 8px 0; color: #6b7280;">...and 3 more</li>
                   </ul>\`
      };
      
      contentArea.innerHTML = content[category];
      
      // Highlight active button
      document.querySelectorAll('button').forEach(btn => {
        btn.style.opacity = '0.7';
      });
      event.target.style.opacity = '1';
    }
  </script>
</div>`;
                updateWidget({ htmlContent: interactiveExample });
              }}
              className="w-full px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              📱 Load Interactive Example
            </button>
            
            <button
              onClick={() => {
                const basicExample = `<div style="padding: 20px; text-align: center; font-family: system-ui;">
  <h2 style="color: #059669;">Welcome to HTML Widgets!</h2>
  <p>This is a simple HTML widget. You can add any HTML content here.</p>
  <button onclick="alert('Hello from HTML Widget!')" style="background: #3b82f6; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">
    Click Me!
  </button>
</div>`;
                updateWidget({ htmlContent: basicExample });
              }}
              className="w-full px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
            >
              🚀 Load Basic Example
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload HTML File</label>
            <input
              type="file"
              accept=".html,.htm"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  const reader = new FileReader()
                  reader.onload = (e) => {
                    const content = e.target?.result as string
                    updateWidget({ htmlContent: content })
                  }
                  reader.readAsText(file)
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          {(widget as HTMLWidget).htmlContent && (
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center gap-2 mb-3">
                <h4 className="font-medium text-gray-700">Widget Promotion</h4>
                <div className="relative group">
                  <Info className="w-4 h-4 text-gray-400 cursor-help" />
                  <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 max-w-64 leading-relaxed">
                    Whould you like to share your creation with the community?
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <button className="w-full px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors">
                 Nominate for Roadmap
                </button>
                <button className="w-full px-3 py-2 bg-orange-600 text-white text-sm font-medium rounded-md hover:bg-orange-700 transition-colors">
                  Commission Custom Widget
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {!PROPERTY_EDITORS['code'] && widget.type === 'code' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Widget Title</label>
            <input
              type="text"
              value={(widget as CodeWidget).title}
              onChange={(e) => updateWidget({ title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter code block title..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Programming Language</label>
            <select
              value={(widget as CodeWidget).language}
              onChange={(e) => updateWidget({ language: e.target.value as CodeWidget['language'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="css">CSS</option>
              <option value="html">HTML</option>
              <option value="json">JSON</option>
              <option value="markdown">Markdown</option>
              <option value="xml">XML</option>
              <option value="sql">SQL</option>
              <option value="shell">Shell/Bash</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Code Content</label>
            <textarea
              value={(widget as CodeWidget).codeContent}
              onChange={(e) => updateWidget({ codeContent: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={10}
              placeholder="Enter your code here..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={(widget as CodeWidget).showLineNumbers ?? true}
                  onChange={(e) => updateWidget({ showLineNumbers: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Show Line Numbers</span>
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
              <select
                value={(widget as CodeWidget).theme || 'light'}
                onChange={(e) => updateWidget({ theme: e.target.value as 'light' | 'dark' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="light">Light Theme</option>
                <option value="dark">Dark Theme</option>
              </select>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <strong>Code Block Tips:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Use syntax highlighting to make code more readable</li>
                  <li>Line numbers help users reference specific lines</li>
                  <li>Choose dark theme for better contrast with code</li>
                  <li>Include comments in your code for better understanding</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {!PROPERTY_EDITORS['button'] && widget.type === 'button' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
            <input
              type="text"
              value={(widget as ButtonWidget).text}
              onChange={(e) => updateWidget({ text: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter button text..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Link URL</label>
            <input
              type="url"
              value={(widget as ButtonWidget).href}
              onChange={(e) => updateWidget({ href: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://example.com"
            />
          </div>
          
          {/* 🎨 NEW BUTTON ARCHITECTURE: Separate Style and Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Button Style</label>
            <select
              value={(widget as ButtonWidget).style || 'solid'}
              onChange={(e) => updateWidget({ style: e.target.value as 'solid' | 'outline' | 'link' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="solid">Solid - Filled background</option>
              <option value="outline">Outline - Border only</option>
              <option value="link">Link - Text only</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              💡 Visual treatment applies to all button colors
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Button Color</label>
            <select
              value={(widget as ButtonWidget).color || 'color1'}
              onChange={(e) => updateWidget({ color: e.target.value as 'color1' | 'color2' | 'color3' | 'color4' | 'color5' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {(() => {
                // Get current theme to show theme-specific color labels
                const { currentWebsiteId, websites, themes } = usePageStore.getState()
                const currentWebsite = websites.find((w: any) => w.id === currentWebsiteId)
                const currentTheme = currentWebsite 
                  ? themes.find((t: any) => t.id === currentWebsite.themeId)
                  : null
                
                // DS V2 uses semantic color names (works across Wiley/WT/Dummies brands)
                if (currentTheme?.id === 'wiley-figma-ds-v2') {
                  return (
                    <>
                      <option value="color1">Primary</option>
                      <option value="color2">Secondary</option>
                      <option value="color3">Tertiary</option>
                      <option value="color4">Neutral Dark</option>
                      <option value="color5">Neutral Light</option>
                    </>
                  )
                }
                
                // IBM Carbon uses 5 buttons with clear semantic names
                if (currentTheme?.id === 'ibm-carbon-ds') {
                  return (
                    <>
                      <option value="color1">Primary (IBM Blue solid)</option>
                      <option value="color2">Secondary (Dark Grey solid)</option>
                      <option value="color3">Tertiary (Transparent, no border)</option>
                      <option value="color4">Danger (Red solid)</option>
                      <option value="color5">Ghost (Transparent with border)</option>
                    </>
                  )
                }
                
                // Ant Design button types (colors now dynamic from ThemeEditor)
                if (currentTheme?.id === 'ant-design') {
                  return (
                    <>
                      <option value="color1">Primary</option>
                      <option value="color2">Secondary</option>
                      <option value="color3">Accent</option>
                    </>
                  )
                }
                
                // Modern and other themes use Primary, Secondary, Accent (3 colors)
                // Color names removed - colors are now dynamic based on ThemeEditor settings
                return (
                  <>
                    <option value="color1">Primary</option>
                    <option value="color2">Secondary</option>
                    <option value="color3">Accent</option>
                  </>
                )
              })()}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              💡 Colors automatically adapt to light/dark backgrounds for perfect contrast
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Button Size</label>
            <select
              value={(widget as ButtonWidget).size}
              onChange={(e) => updateWidget({ size: e.target.value as 'small' | 'medium' | 'large' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="small">Small - Compact sizing</option>
              <option value="medium">Medium - Standard sizing</option>
              <option value="large">Large - Hero/prominent buttons</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Link Target</label>
            <select
              value={(widget as ButtonWidget).target || '_self'}
              onChange={(e) => updateWidget({ target: e.target.value as '_blank' | '_self' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="_self">Same window/tab</option>
              <option value="_blank">New window/tab</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Alignment</label>
            <select
              value={(widget as ButtonWidget).align || 'left'}
              onChange={(e) => updateWidget({ align: e.target.value as 'left' | 'center' | 'right' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>

          <IconSelector
            icon={(widget as ButtonWidget).icon}
            onChange={(icon) => updateWidget({ icon })}
          />
        </div>
      )}
      
      {!PROPERTY_EDITORS['menu'] && widget.type === 'menu' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Menu Type</label>
            <select
              value={(widget as MenuWidget).menuType}
              onChange={(e) => {
                const newMenuType = e.target.value as 'global' | 'context-aware' | 'custom';
                updateWidget({ 
                  menuType: newMenuType,
                  // Auto-populate items if switching to context-aware
                  ...(newMenuType === 'context-aware' && (widget as MenuWidget).items.length === 0 ? {
                    contextSource: 'journal',
                    items: [
                      {
                        id: nanoid(),
                        label: '{{journal.name}} Home',
                        url: '/journals/{{journal.code}}',
                        target: '_self' as const,
                        displayCondition: 'always' as const,
                        isContextGenerated: true,
                        order: 0
                      },
                      {
                        id: nanoid(),
                        label: 'Just Accepted',
                        url: '/journals/{{journal.code}}/early',
                        target: '_self' as const,
                        displayCondition: 'if-issue-exists' as const,
                        isContextGenerated: true,
                        order: 1
                      },
                      {
                        id: nanoid(),
                        label: 'Latest Issue',
                        url: '/journals/{{journal.code}}/current',
                        target: '_self' as const,
                        displayCondition: 'if-issue-exists' as const,
                        isContextGenerated: true,
                        order: 2
                      },
                      {
                        id: nanoid(),
                        label: 'Archive',
                        url: '/journals/{{journal.code}}/issues',
                        target: '_self' as const,
                        displayCondition: 'if-has-archive' as const,
                        isContextGenerated: true,
                        order: 3
                      }
                    ]
                  } : {})
                })
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="global">Global (Static, for headers)</option>
              <option value="context-aware">Context-Aware (Adapts to page context)</option>
              <option value="custom">Custom (Blank slate)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {(widget as MenuWidget).menuType === 'global' && 'Static menu items, same across all pages'}
              {(widget as MenuWidget).menuType === 'context-aware' && 'Auto-populates with context-specific items'}
              {(widget as MenuWidget).menuType === 'custom' && 'Start with an empty menu'}
            </p>
          </div>
          
          {(widget as MenuWidget).menuType === 'context-aware' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Context Source</label>
              <select
                value={(widget as MenuWidget).contextSource || 'journal'}
                onChange={(e) => updateWidget({ contextSource: e.target.value as 'journal' | 'book' | 'conference' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="journal">Journal</option>
                <option value="book">Book</option>
                <option value="conference">Conference</option>
              </select>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Menu Style</label>
            <select
              value={(widget as MenuWidget).style}
              onChange={(e) => updateWidget({ style: e.target.value as 'horizontal' | 'vertical' | 'dropdown' | 'footer-links' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="horizontal">Horizontal</option>
              <option value="vertical">Vertical</option>
              <option value="dropdown">Dropdown</option>
              <option value="footer-links">Footer Links</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Alignment</label>
            <select
              value={(widget as MenuWidget).align || 'left'}
              onChange={(e) => updateWidget({ align: e.target.value as 'left' | 'center' | 'right' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
          
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Menu Items</label>
              <span className="text-xs text-gray-500">{(widget as MenuWidget).items.length} items</span>
            </div>
            
            <button
              onClick={() => setIsEditingMenuItems(true)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              🎯 Edit Menu Items...
            </button>
            
            {(widget as MenuWidget).items.length > 0 && (
              <div className="mt-3 space-y-1">
                <p className="text-xs font-medium text-gray-600 mb-1">Current Items:</p>
                {(widget as MenuWidget).items.slice(0, 5).map(item => (
                  <div key={item.id} className="text-xs text-gray-600 pl-2 border-l-2 border-gray-200">
                    • {item.label}
                    {item.isContextGenerated && <span className="ml-1 text-blue-500" title="Context-generated">(auto)</span>}
                  </div>
                ))}
                {(widget as MenuWidget).items.length > 5 && (
                  <div className="text-xs text-gray-500 pl-2">
                    ...and {(widget as MenuWidget).items.length - 5} more
                  </div>
                )}
              </div>
            )}
            
            <div className="mt-3 bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-xs text-blue-800 font-medium mb-1">💡 Template Variables</p>
              <p className="text-xs text-blue-700">
                Use <code className="bg-blue-100 px-1 rounded">{'{{journal.name}}'}</code>, <code className="bg-blue-100 px-1 rounded">{'{{journal.code}}'}</code> in labels and URLs
              </p>
            </div>
          </div>
        </div>
      )}
      
      {!PROPERTY_EDITORS['tabs'] && widget.type === 'tabs' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tab Style</label>
            <select
              value={(widget as TabsWidget).tabStyle}
              onChange={(e) => updateWidget({ tabStyle: e.target.value as TabVariant })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              {(() => {
                // Get current theme ID from store
                const currentWebsite = usePageStore.getState().websites.find(
                  (w: any) => w.id === usePageStore.getState().currentWebsiteId
                )
                const currentThemeId = currentWebsite?.themeId || 'classic-ux3-theme'
                
                // Get supported variants for this theme
                const supportedVariants = getSupportedTabVariants(currentThemeId)
                
                // Render only supported variants
                return supportedVariants.map((variant) => (
                  <option key={variant} value={variant}>
                    {getTabVariantLabel(variant)}
                  </option>
                ))
              })()}
            </select>
            {(() => {
              const currentWebsite = usePageStore.getState().websites.find(
                (w: any) => w.id === usePageStore.getState().currentWebsiteId
              )
              const currentThemeId = currentWebsite?.themeId || 'classic-ux3-theme'
              const supportedVariants = getSupportedTabVariants(currentThemeId)
              
              // Show helper text if some variants are not available
              if (supportedVariants.length < 3) {
                return (
                  <p className="text-xs text-gray-500 mt-1">
                    Available variants for this theme
                  </p>
                )
              }
              return null
            })()}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Alignment</label>
            <select
              value={(widget as TabsWidget).align || 'left'}
              onChange={(e) => updateWidget({ align: e.target.value as 'left' | 'center' | 'right' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
          
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">Tabs</label>
              <button
                onClick={() => {
                  const newTab: TabItem = {
                    id: nanoid(),
                    label: `Tab ${(widget as TabsWidget).tabs.length + 1}`,
                    widgets: []
                  }
                  updateWidget({ tabs: [...(widget as TabsWidget).tabs, newTab] })
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Tab
              </button>
            </div>
            
            <div className="space-y-2">
              {(widget as TabsWidget).tabs.map((tab, index) => (
                <div key={tab.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <GripVertical className="w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={tab.label}
                      onChange={(e) => {
                        const newTabs = [...(widget as TabsWidget).tabs]
                        newTabs[index] = { ...tab, label: e.target.value }
                        updateWidget({ tabs: newTabs })
                      }}
                      className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm"
                      placeholder="Tab label"
                    />
                    <button
                      onClick={() => {
                        // Don't allow deleting the last tab
                        if ((widget as TabsWidget).tabs.length > 1) {
                          const newTabs = (widget as TabsWidget).tabs.filter((_, i) => i !== index)
                          updateWidget({ 
                            tabs: newTabs,
                            activeTabIndex: Math.min((widget as TabsWidget).activeTabIndex, newTabs.length - 1)
                          })
                        }
                      }}
                      disabled={(widget as TabsWidget).tabs.length === 1}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title={
                        (widget as TabsWidget).tabs.length === 1 
                          ? "Cannot delete the last tab" 
                          : "Delete tab"
                      }
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="block text-gray-600 mb-1">Icon (emoji)</label>
                      <input
                        type="text"
                        value={tab.icon || ''}
                        onChange={(e) => {
                          const newTabs = [...(widget as TabsWidget).tabs]
                          newTabs[index] = { ...tab, icon: e.target.value }
                          updateWidget({ tabs: newTabs })
                        }}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                        placeholder="e.g., 📊"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 mb-1">URL (optional)</label>
                      <input
                        type="text"
                        value={tab.url || ''}
                        onChange={(e) => {
                          const newTabs = [...(widget as TabsWidget).tabs]
                          newTabs[index] = { ...tab, url: e.target.value }
                          updateWidget({ tabs: newTabs })
                        }}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                        placeholder="/path"
                      />
                    </div>
                    <div className="text-gray-500 text-xs pt-1">
                      {tab.widgets.length} widget{tab.widgets.length !== 1 ? 's' : ''} in this tab
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-3 bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-xs text-blue-800 font-medium mb-1">💡 How to use</p>
              <p className="text-xs text-blue-700">
                Configure tabs here, then drag widgets from the library into each tab's drop zone on the canvas.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {widget.type === 'publication-list' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Content Source</label>
            <select
              value={(widget as PublicationListWidget).contentSource}
              onChange={(e) => {
                const newContentSource = e.target.value as 'dynamic-query' | 'doi-list' | 'ai-generated' | 'schema-objects'
                updateWidget({ 
                  contentSource: newContentSource,
                  // Reset source-specific config when changing content source
                  ...(newContentSource !== 'schema-objects' ? { schemaSource: undefined } : {
                    schemaSource: {
                      selectionType: 'by-type',
                      selectedType: '',
                      selectedIds: []
                    }
                  }),
                  ...(newContentSource !== 'ai-generated' ? { aiSource: undefined } : {
                    aiSource: {
                      prompt: '',
                      lastGenerated: undefined,
                      generatedContent: undefined
                    }
                  })
                })
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="dynamic-query">Dynamic Query</option>
              <option value="doi-list">DOI List</option>
              <option value="ai-generated">AI Generated</option>
              <option value="schema-objects">Schema Objects</option>
            </select>
          </div>
          
          {/* DOI List Selection (conditional) */}
          {(widget as PublicationListWidget).contentSource === 'doi-list' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Domain Filter (Optional)</label>
                <select
                  value={(widget as PublicationListWidget).doiSource?.domainFilter || ''}
                  onChange={(e) => updateWidget({ 
                    doiSource: { 
                      dois: (widget as PublicationListWidget).doiSource?.dois || [],
                      domainFilter: e.target.value as CitationDomain | ''
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">All Domains (34 DOIs)</option>
                  <option value="ai-software">🤖 AI & Software Engineering (14 DOIs)</option>
                  <option value="chemistry">🧪 Chemistry & Materials (20 DOIs)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Filter available DOIs by research domain</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select DOIs</label>
                <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-md p-2 bg-gray-50">
                  {((widget as PublicationListWidget).doiSource?.domainFilter 
                    ? getDOIsByDomain((widget as PublicationListWidget).doiSource?.domainFilter as CitationDomain)
                    : getAllDOIs()
                  ).map(doi => {
                    const citation = getCitationByDOI(doi)
                    const isSelected = (widget as PublicationListWidget).doiSource?.dois?.includes(doi) || false
                    return (
                      <label key={doi} className={`flex items-start space-x-2 p-2 rounded cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-100 border border-transparent'}`}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            const currentDois = (widget as PublicationListWidget).doiSource?.dois || []
                            const newDois = e.target.checked
                              ? [...currentDois, doi]
                              : currentDois.filter(d => d !== doi)
                            updateWidget({ 
                              doiSource: {
                                dois: newDois,
                                domainFilter: (widget as PublicationListWidget).doiSource?.domainFilter
                              }
                            })
                          }}
                          className="mt-1 rounded border-gray-300"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-mono text-blue-600 mb-0.5">{doi}</div>
                          <div className="text-sm font-medium text-gray-900 leading-tight">{citation?.title}</div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {citation?.authors.slice(0, 2).join(', ')}
                            {citation && citation.authors.length > 2 && ` et al.`} ({citation?.year})
                          </div>
                        </div>
                      </label>
                    )
                  })}
                </div>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-500">
                    <strong>{(widget as PublicationListWidget).doiSource?.dois?.length || 0}</strong> of {
                      (widget as PublicationListWidget).doiSource?.domainFilter 
                        ? getDOIsByDomain((widget as PublicationListWidget).doiSource?.domainFilter as CitationDomain).length
                        : getAllDOIs().length
                    } DOIs selected
                  </p>
                  {(widget as PublicationListWidget).doiSource?.dois?.length ? (
                    <button
                      onClick={() => updateWidget({ 
                        doiSource: {
                          dois: [],
                          domainFilter: (widget as PublicationListWidget).doiSource?.domainFilter
                        }
                      })}
                      className="text-xs text-red-600 hover:text-red-700 font-medium"
                    >
                      Clear All
                    </button>
                  ) : null}
                </div>
              </div>
            </>
          )}
          
          {(widget as PublicationListWidget).contentSource === 'schema-objects' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Selection Method</label>
                <select
                  value={(widget as PublicationListWidget).schemaSource?.selectionType || 'by-type'}
                  onChange={(e) => {
                    const selectionType = e.target.value as 'by-id' | 'by-type'
                    updateWidget({ 
                      schemaSource: {
                        selectionType,
                        selectedIds: [],
                        selectedType: ''
                      }
                    })
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="by-type">By Type (All objects of a type)</option>
                  <option value="by-id">By ID (Specific objects)</option>
                </select>
              </div>

              {(widget as PublicationListWidget).schemaSource?.selectionType === 'by-type' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Schema Type</label>
                  <select
                    value={(widget as PublicationListWidget).schemaSource?.selectedType || ''}
                    onChange={(e) => {
                      const currentSchemaSource = (widget as PublicationListWidget).schemaSource
                      updateWidget({ 
                        schemaSource: {
                          selectionType: currentSchemaSource?.selectionType || 'by-type',
                          selectedType: e.target.value,
                          selectedIds: currentSchemaSource?.selectedIds || []
                        }
                      })
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">-- Select type --</option>
                    <option value="Article">Articles</option>
                    <option value="BlogPosting">Blog Posts</option>
                    <option value="NewsArticle">News Articles</option>
                    <option value="Event">Events</option>
                    <option value="Organization">Organizations</option>
                    <option value="Person">People</option>
                    <option value="Book">Books</option>
                    <option value="Movie">Movies</option>
                    <option value="Review">Reviews</option>
                    <option value="Course">Courses</option>
                    <option value="Recipe">Recipes</option>
                    <option value="HowTo">How-To Guides</option>
                  </select>
                  
                  {(widget as PublicationListWidget).schemaSource?.selectedType && (
                    <p className="text-xs text-gray-500 mt-1">
                      Will show all {schemaObjects.filter((obj: any) => 
                        obj.type === (widget as PublicationListWidget).schemaSource?.selectedType
                      ).length} objects of type "{(widget as PublicationListWidget).schemaSource?.selectedType}"
                    </p>
                  )}
                </div>
              )}

              {(widget as PublicationListWidget).schemaSource?.selectionType === 'by-id' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Objects</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-2">
                    {schemaObjects.length === 0 ? (
                      <p className="text-sm text-gray-500 p-2">No schema objects created yet</p>
                    ) : (
                      schemaObjects.map((obj: any) => (
                        <label key={obj.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                          <input
                            type="checkbox"
                            checked={(widget as PublicationListWidget).schemaSource?.selectedIds?.includes(obj.id) || false}
                            onChange={(e) => {
                              const currentIds = (widget as PublicationListWidget).schemaSource?.selectedIds || []
                              const newIds = e.target.checked
                                ? [...currentIds, obj.id]
                                : currentIds.filter(id => id !== obj.id)
                              const currentSchemaSource = (widget as PublicationListWidget).schemaSource
                              updateWidget({ 
                                schemaSource: {
                                  selectionType: currentSchemaSource?.selectionType || 'by-id',
                                  selectedType: currentSchemaSource?.selectedType || '',
                                  selectedIds: newIds
                                }
                              })
                            }}
                            className="rounded border-gray-300"
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium">{obj.name}</div>
                            <div className="text-xs text-gray-500">{obj.type}</div>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {(widget as PublicationListWidget).schemaSource?.selectedIds?.length || 0} objects selected
                  </p>
                </div>
              )}
            </>
          )}
          
          {(widget as PublicationListWidget).contentSource === 'ai-generated' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Domain Filter (Optional)</label>
                <select
                  value={(widget as PublicationListWidget).aiSource?.domain || ''}
                  onChange={(e) => updateWidget({ 
                    aiSource: { 
                      prompt: (widget as PublicationListWidget).aiSource?.prompt || '',
                      ...(widget as PublicationListWidget).aiSource,
                      domain: e.target.value as CitationDomain | ''
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">All Domains</option>
                  <option value="ai-software">🤖 AI & Software Engineering</option>
                  <option value="chemistry">🧪 Chemistry & Materials</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Filter example DOIs shown below by research domain</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Example DOIs from {
                  (widget as PublicationListWidget).aiSource?.domain === 'ai-software' ? 'AI/Software' :
                  (widget as PublicationListWidget).aiSource?.domain === 'chemistry' ? 'Chemistry' :
                  'All Domains'
                }</label>
                <div className="bg-gray-50 border border-gray-200 rounded-md p-2 max-h-24 overflow-y-auto">
                  {((widget as PublicationListWidget).aiSource?.domain 
                    ? getDOIsByDomain((widget as PublicationListWidget).aiSource?.domain as CitationDomain)
                    : getAllDOIs()
                  ).slice(0, 5).map(doi => {
                    const citation = getCitationByDOI(doi)
                    return (
                      <div key={doi} className="text-xs text-gray-600 mb-1">
                        <strong>{doi}</strong> - {citation?.title.substring(0, 60)}...
                      </div>
                    )
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Showing 5 of {
                    (widget as PublicationListWidget).aiSource?.domain 
                      ? getDOIsByDomain((widget as PublicationListWidget).aiSource?.domain as CitationDomain).length
                      : getAllDOIs().length
                  } available DOIs
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">AI Prompt</label>
                <textarea
                  value={(widget as PublicationListWidget).aiSource?.prompt || ''}
                  onChange={(e) => updateWidget({ 
                    aiSource: { 
                      ...(widget as PublicationListWidget).aiSource,
                      prompt: e.target.value
                    }
                  })}
                  placeholder="e.g., generate 6 articles on Organic chemistry with variable length titles written by 1, 2 up to 6 authors"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
                  rows={3}
                />
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => {
                      const prompt = (widget as PublicationListWidget).aiSource?.prompt
                      if (prompt) {
                        try {
                          const generatedContent = generateAIContent(prompt)
                          updateWidget({
                            aiSource: {
                              ...(widget as PublicationListWidget).aiSource,
                              prompt,
                              lastGenerated: new Date(),
                              generatedContent
                            }
                          })
                        } catch (error) {
                          debugLog('error', 'Error generating content:', error)
                        }
                      }
                    }}
                    disabled={!(widget as PublicationListWidget).aiSource?.prompt?.trim()}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    🤖 Generate
                  </button>
                  {(widget as PublicationListWidget).aiSource?.lastGenerated && (
                    <span className="text-xs text-gray-500 self-center">
                      Last generated: {(widget as PublicationListWidget).aiSource?.lastGenerated?.toLocaleTimeString()}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Tip: Use "generate X articles", "variable length titles", and "written by 1, 2 up to X authors" for progressive authorship
                </p>
              </div>
            </>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Layout</label>
            <select
              value={(widget as PublicationListWidget).layout}
              onChange={(e) => updateWidget({ 
                layout: e.target.value as 'list' | 'grid' | 'featured' 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="list">List</option>
              <option value="grid">Grid</option>
              <option value="featured">Featured</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Alignment</label>
            <select
              value={(widget as PublicationListWidget).align || 'left'}
              onChange={(e) => updateWidget({ align: e.target.value as 'left' | 'center' | 'right' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Items: {(widget as PublicationListWidget).maxItems || 6}
            </label>
            <input
              type="range"
              min="2"
              max="8"
              value={(widget as PublicationListWidget).maxItems || 6}
              onChange={(e) => updateWidget({ maxItems: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Publication Card Variant</label>
            <select
              value={(widget as PublicationListWidget).cardVariantId || 'default'}
              onChange={(e) => {
                const variantId = e.target.value === 'default' ? undefined : e.target.value
                const selectedVariant = publicationCardVariants.find((v: any) => v.id === variantId)
                const cardConfig = selectedVariant ? selectedVariant.config : DEFAULT_PUBLICATION_CARD_CONFIG
                updateWidget({ 
                  cardVariantId: variantId,
                  cardConfig: cardConfig
                })
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
            >
              <option value="default">Default</option>
              {publicationCardVariants.map((variant: any) => (
                <option key={variant.id} value={variant.id}>{variant.name}</option>
              ))}
            </select>
            <button 
              onClick={() => {
                const { setCurrentView, setSiteManagerView, currentWebsiteId } = usePageStore.getState()
                setCurrentView('design-console')
                // Navigate to the specific website's publication cards based on current editing context
                setSiteManagerView(`${currentWebsiteId}-publication-cards` as any)
              }}
              className="w-full px-3 py-2 border border-blue-300 text-blue-700 rounded-md text-sm hover:bg-blue-50 transition-colors"
            >
              → Configure Publication Cards
            </button>
          </div>
          
          {/* List Pattern Controls - Grid/Flex spanning patterns */}
          <ListPatternControls
            spanningConfig={(widget as PublicationListWidget).spanningConfig}
            updateWidget={(updates) => updateWidget(updates)}
            parentSection={parentSection}
          />
        </div>
      )}
      
      {widget.type === 'publication-details' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Content Source</label>
            <select
              value={(widget as PublicationDetailsWidget).contentSource}
              onChange={(e) => {
                const newContentSource = e.target.value as 'doi' | 'ai-generated' | 'schema-objects' | 'context'
                updateWidget({ 
                  contentSource: newContentSource,
                  // Reset source-specific config when changing content source
                  ...(newContentSource !== 'schema-objects' ? { schemaSource: undefined } : {
                    schemaSource: { selectedId: '' }
                  }),
                  ...(newContentSource !== 'doi' ? { doiSource: undefined } : {
                    doiSource: { doi: '' }
                  }),
                  ...(newContentSource !== 'ai-generated' ? { aiSource: undefined } : {
                    aiSource: {
                      prompt: '',
                      lastGenerated: undefined,
                      generatedContent: undefined
                    }
                  })
                })
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="context">Page Context</option>
              <option value="doi">DOI</option>
              <option value="ai-generated">AI Generated</option>
              <option value="schema-objects">Schema Objects</option>
            </select>
          </div>
          
          {(widget as PublicationDetailsWidget).contentSource === 'doi' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select DOI</label>
              <select
                value={(widget as PublicationDetailsWidget).doiSource?.doi || ''}
                onChange={(e) => updateWidget({ 
                  doiSource: { doi: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">-- Select a DOI --</option>
                <optgroup label="🤖 AI & Software Engineering">
                  {getDOIsByDomain('ai-software').map(doi => {
                    const citation = getCitationByDOI(doi)
                    return (
                      <option key={doi} value={doi}>
                        {doi} - {citation?.title.substring(0, 50)}...
                      </option>
                    )
                  })}
                </optgroup>
                <optgroup label="🧪 Chemistry & Materials">
                  {getDOIsByDomain('chemistry').map(doi => {
                    const citation = getCitationByDOI(doi)
                    return (
                      <option key={doi} value={doi}>
                        {doi} - {citation?.title.substring(0, 50)}...
                      </option>
                    )
                  })}
                </optgroup>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {(widget as PublicationDetailsWidget).doiSource?.doi 
                  ? `Selected: ${getCitationByDOI((widget as PublicationDetailsWidget).doiSource!.doi)?.title || 'Unknown'}`
                  : 'Choose from 34 real publications (14 AI/Software, 20 Chemistry)'}
              </p>
            </div>
          )}
          
          {/* Schema Objects Selection (conditional) */}
          {(widget as PublicationDetailsWidget).contentSource === 'schema-objects' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Publication</label>
              <select
                value={(widget as PublicationDetailsWidget).schemaSource?.selectedId || ''}
                onChange={(e) => updateWidget({ 
                  schemaSource: { selectedId: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">-- Select publication --</option>
                {schemaObjects.map((obj: any) => (
                  <option key={obj.id} value={obj.id}>
                    {obj.name} ({obj.type})
                  </option>
                ))}
              </select>
              
              {(widget as PublicationDetailsWidget).schemaSource?.selectedId && (
                <p className="text-xs text-gray-500 mt-1">
                  Selected: {schemaObjects.find((obj: any) => 
                    obj.id === (widget as PublicationDetailsWidget).schemaSource?.selectedId
                  )?.name}
                </p>
              )}
              
              {schemaObjects.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">No schema objects available. Create some in the Schema Content tab.</p>
              )}
            </div>
          )}
          
          {/* AI Generation Prompt (conditional) */}
          {(widget as PublicationDetailsWidget).contentSource === 'ai-generated' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Domain Filter (Optional)</label>
                <select
                  value={(widget as PublicationDetailsWidget).aiSource?.domain || ''}
                  onChange={(e) => updateWidget({ 
                    aiSource: { 
                      prompt: (widget as PublicationDetailsWidget).aiSource?.prompt || '',
                      ...(widget as PublicationDetailsWidget).aiSource,
                      domain: e.target.value as CitationDomain | ''
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">All Domains</option>
                  <option value="ai-software">🤖 AI & Software Engineering</option>
                  <option value="chemistry">🧪 Chemistry & Materials</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Filter example DOIs shown below by research domain</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Example DOIs from {
                  (widget as PublicationDetailsWidget).aiSource?.domain === 'ai-software' ? 'AI/Software' :
                  (widget as PublicationDetailsWidget).aiSource?.domain === 'chemistry' ? 'Chemistry' :
                  'All Domains'
                }</label>
                <div className="bg-gray-50 border border-gray-200 rounded-md p-2 max-h-24 overflow-y-auto">
                  {((widget as PublicationDetailsWidget).aiSource?.domain 
                    ? getDOIsByDomain((widget as PublicationDetailsWidget).aiSource?.domain as CitationDomain)
                    : getAllDOIs()
                  ).slice(0, 5).map(doi => {
                    const citation = getCitationByDOI(doi)
                    return (
                      <div key={doi} className="text-xs text-gray-600 mb-1">
                        <strong>{doi}</strong> - {citation?.title.substring(0, 60)}...
                      </div>
                    )
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Showing 5 of {
                    (widget as PublicationDetailsWidget).aiSource?.domain 
                      ? getDOIsByDomain((widget as PublicationDetailsWidget).aiSource?.domain as CitationDomain).length
                      : getAllDOIs().length
                  } available DOIs
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">AI Prompt</label>
                <textarea
                  value={(widget as PublicationDetailsWidget).aiSource?.prompt || ''}
                  onChange={(e) => updateWidget({ 
                    aiSource: { 
                      ...(widget as PublicationDetailsWidget).aiSource,
                      prompt: e.target.value
                    }
                  })}
                  placeholder="e.g., generate an article on quantum computing with a long title by 3 Stanford researchers"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
                  rows={3}
                />
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => {
                      const prompt = (widget as PublicationDetailsWidget).aiSource?.prompt
                      if (prompt) {
                        try {
                          const generatedContent = generateAISingleContent(prompt)
                          updateWidget({
                            aiSource: {
                              ...(widget as PublicationDetailsWidget).aiSource,
                              prompt,
                              lastGenerated: new Date(),
                              generatedContent
                            }
                          })
                        } catch (error) {
                          debugLog('error', 'Error generating content:', error)
                        }
                      }
                    }}
                    disabled={!(widget as PublicationDetailsWidget).aiSource?.prompt?.trim()}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    🤖 Generate
                  </button>
                  {(widget as PublicationDetailsWidget).aiSource?.lastGenerated && (
                    <span className="text-xs text-gray-500 self-center">
                      Last generated: {
                        (widget as PublicationDetailsWidget).aiSource?.lastGenerated instanceof Date
                          ? (widget as PublicationDetailsWidget).aiSource?.lastGenerated?.toLocaleTimeString()
                          : new Date((widget as PublicationDetailsWidget).aiSource?.lastGenerated!).toLocaleTimeString()
                      }
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Tip: Specify subject, title length ("long title"), and exact author count ("by 3 researchers") for better results
                </p>
              </div>
            </>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Layout</label>
            <select
              value={(widget as PublicationDetailsWidget).layout}
              onChange={(e) => updateWidget({ 
                layout: e.target.value as 'default' | 'compact' | 'hero' | 'sidebar'
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="default">Default</option>
              <option value="compact">Compact</option>
              <option value="hero">Hero</option>
              <option value="sidebar">Sidebar</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Alignment</label>
            <select
              value={(widget as PublicationDetailsWidget).align || 'left'}
              onChange={(e) => updateWidget({ align: e.target.value as 'left' | 'center' | 'right' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Publication Card Variant</label>
            <select
              value={(widget as PublicationDetailsWidget).cardVariantId || 'default'}
              onChange={(e) => {
                const variantId = e.target.value === 'default' ? undefined : e.target.value
                const selectedVariant = publicationCardVariants.find((v: any) => v.id === variantId)
                const cardConfig = selectedVariant ? selectedVariant.config : DEFAULT_PUBLICATION_CARD_CONFIG
                updateWidget({ 
                  cardVariantId: variantId,
                  cardConfig: cardConfig
                })
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
            >
              <option value="default">Default</option>
              {publicationCardVariants.map((variant: any) => (
                <option key={variant.id} value={variant.id}>{variant.name}</option>
              ))}
            </select>
            <button 
              onClick={() => {
                const { setCurrentView, setSiteManagerView, currentWebsiteId } = usePageStore.getState()
                setCurrentView('design-console')
                setSiteManagerView(`${currentWebsiteId}-publication-cards` as any)
              }}
              className="w-full px-3 py-2 border border-blue-300 text-blue-700 rounded-md text-sm hover:bg-blue-50 transition-colors"
            >
              → Configure Publication Cards
            </button>
          </div>
        </div>
      )}
      
      {!PROPERTY_EDITORS['divider'] && widget.type === 'divider' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Style</label>
            <select
              value={(widget as any).style || 'solid'}
              onChange={(e) => updateWidget({ style: e.target.value as 'solid' | 'dashed' | 'dotted' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="solid">Solid</option>
              <option value="dashed">Dashed</option>
              <option value="dotted">Dotted</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Thickness</label>
            <select
              value={(widget as any).thickness || '1px'}
              onChange={(e) => updateWidget({ thickness: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="1px">1px (Thin)</option>
              <option value="2px">2px (Medium)</option>
              <option value="3px">3px (Thick)</option>
              <option value="4px">4px (Extra Thick)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <input
              type="color"
              value={(widget as any).color || '#e5e7eb'}
              onChange={(e) => updateWidget({ color: e.target.value })}
              className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
            />
            <input
              type="text"
              value={(widget as any).color || '#e5e7eb'}
              onChange={(e) => updateWidget({ color: e.target.value })}
              placeholder="#e5e7eb"
              className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2 text-sm font-mono"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Margin Top</label>
            <input
              type="text"
              value={(widget as any).marginTop || '1rem'}
              onChange={(e) => updateWidget({ marginTop: e.target.value })}
              placeholder="1rem"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">e.g., 1rem, 16px, 2em</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Margin Bottom</label>
            <input
              type="text"
              value={(widget as any).marginBottom || '1rem'}
              onChange={(e) => updateWidget({ marginBottom: e.target.value })}
              placeholder="1rem"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">e.g., 1rem, 16px, 2em</p>
          </div>
        </div>
      )}
      
      {!PROPERTY_EDITORS['spacer'] && widget.type === 'spacer' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Height</label>
            <select
              value={(widget as any).height || '2rem'}
              onChange={(e) => updateWidget({ height: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
            >
              <option value="0.5rem">0.5rem (8px) - Extra Small</option>
              <option value="1rem">1rem (16px) - Small</option>
              <option value="2rem">2rem (32px) - Medium</option>
              <option value="3rem">3rem (48px) - Large</option>
              <option value="4rem">4rem (64px) - Extra Large</option>
              <option value="6rem">6rem (96px) - Huge</option>
            </select>
            
            <label className="block text-sm font-medium text-gray-700 mb-2 mt-4">Custom Height</label>
            <input
              type="text"
              value={(widget as any).height || '2rem'}
              onChange={(e) => updateWidget({ height: e.target.value })}
              placeholder="2rem"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">e.g., 2rem, 50px, 5vh, 10%</p>
          </div>
        </div>
      )}
      
      {!PROPERTY_EDITORS['collapse'] && widget.type === 'collapse' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Accordion Behavior</label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={(widget as any).allowMultiple || false}
                onChange={(e) => updateWidget({ allowMultiple: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 mr-2"
              />
              <span className="text-sm text-gray-700">Allow multiple panels open</span>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              When off, only one panel can be open at a time (accordion mode)
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Style</label>
            <select
              value={(widget as any).style || 'default'}
              onChange={(e) => updateWidget({ style: e.target.value as 'default' | 'bordered' | 'minimal' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="default">Default</option>
              <option value="bordered">Bordered</option>
              <option value="minimal">Minimal</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Icon Position</label>
            <select
              value={(widget as any).iconPosition || 'right'}
              onChange={(e) => updateWidget({ iconPosition: e.target.value as 'left' | 'right' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="left">Left</option>
              <option value="right">Right</option>
            </select>
          </div>
          
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">Panels</label>
            <div className="space-y-2 mb-3">
              {((widget as any).panels || []).map((panel: any, index: number) => (
                <div key={panel.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <input
                    type="text"
                    value={panel.title}
                    onChange={(e) => {
                      const newPanels = [...(widget as any).panels]
                      newPanels[index] = { ...newPanels[index], title: e.target.value }
                      updateWidget({ panels: newPanels })
                    }}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="Panel title"
                  />
                  <button
                    onClick={() => {
                      const newPanels = (widget as any).panels.filter((_: any, i: number) => i !== index)
                      updateWidget({ panels: newPanels })
                    }}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                    title="Delete panel"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                const newPanel = {
                  id: `panel-${Date.now()}`,
                  title: `Panel ${((widget as any).panels?.length || 0) + 1}`,
                  isOpen: false,
                  widgets: []
                }
                updateWidget({ panels: [...((widget as any).panels || []), newPanel] })
              }}
              className="w-full px-3 py-2 border border-blue-300 text-blue-700 rounded-md text-sm hover:bg-blue-50 transition-colors"
            >
              + Add Panel
            </button>
          </div>
        </div>
      )}
      
      {!PROPERTY_EDITORS['editorial-card'] && widget.type === 'editorial-card' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Layout</label>
            <select
              value={(widget as any).layout || 'image-overlay'}
              onChange={(e) => updateWidget({ layout: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="image-overlay">Image Overlay</option>
              <option value="split">Split</option>
              <option value="color-block">Color Block</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Overlay: Text over image • Split: Image/content separate • Color Block: Image + colored area
            </p>
          </div>
          
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Image</h4>
            <div className="flex gap-2">
              <input
                type="url"
                value={(widget as any).image?.src || ''}
                onChange={(e) => updateWidget({ 
                  image: { ...(widget as any).image, src: e.target.value } 
                })}
                placeholder="https://example.com/image.jpg"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <button
                onClick={() => {
                  const randomUrl = `https://picsum.photos/800/600?random=${Date.now()}`
                  updateWidget({ image: { ...(widget as any).image, src: randomUrl } })
                }}
                className="px-3 py-2 bg-purple-50 border border-purple-300 text-purple-700 rounded-md text-sm font-medium hover:bg-purple-100 transition-colors whitespace-nowrap"
              >
                🎲 Random
              </button>
            </div>
            
            <label className="block text-sm font-medium text-gray-700 mb-2 mt-3">Alt Text</label>
            <input
              type="text"
              value={(widget as any).image?.alt || ''}
              onChange={(e) => updateWidget({ 
                image: { ...(widget as any).image, alt: e.target.value } 
              })}
              placeholder="Image description"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            
            {((widget as any).layout === 'split' || (widget as any).layout === 'color-block') && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Image Position</label>
                <select
                  value={(widget as any).config?.imagePosition || 'top'}
                  onChange={(e) => updateWidget({ 
                    config: { ...(widget as any).config, imagePosition: e.target.value } 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="top">Top</option>
                  <option value="bottom">Bottom</option>
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                </select>
              </div>
            )}
          </div>
          
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Content</h4>
            
            {/* Preheader */}
            <div className="mb-4">
              <label className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={(widget as any).content?.preheader?.enabled || false}
                  onChange={(e) => updateWidget({ 
                    content: { 
                      ...(widget as any).content,
                      preheader: { ...(widget as any).content?.preheader, enabled: e.target.checked }
                    } 
                  })}
                  className="rounded border-gray-300 text-blue-600 mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Preheader</span>
              </label>
              {(widget as any).content?.preheader?.enabled && (
                <input
                  type="text"
                  value={(widget as any).content?.preheader?.text || ''}
                  onChange={(e) => updateWidget({ 
                    content: { 
                      ...(widget as any).content,
                      preheader: { ...(widget as any).content?.preheader, text: e.target.value }
                    } 
                  })}
                  placeholder="ADD SECTION OR CATEGORY NAME"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              )}
            </div>
            
            {/* Headline */}
            <div className="mb-4">
              <label className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={(widget as any).content?.headline?.enabled !== false}
                  onChange={(e) => updateWidget({ 
                    content: { 
                      ...(widget as any).content,
                      headline: { ...(widget as any).content?.headline, enabled: e.target.checked }
                    } 
                  })}
                  className="rounded border-gray-300 text-blue-600 mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Headline</span>
              </label>
              {(widget as any).content?.headline?.enabled !== false && (
                <input
                  type="text"
                  value={(widget as any).content?.headline?.text || ''}
                  onChange={(e) => updateWidget({ 
                    content: { 
                      ...(widget as any).content,
                      headline: { ...(widget as any).content?.headline, text: e.target.value }
                    } 
                  })}
                  placeholder="Add a headline"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              )}
            </div>
            
            {/* Description */}
            <div className="mb-4">
              <label className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={(widget as any).content?.description?.enabled !== false}
                  onChange={(e) => updateWidget({ 
                    content: { 
                      ...(widget as any).content,
                      description: { ...(widget as any).content?.description, enabled: e.target.checked }
                    } 
                  })}
                  className="rounded border-gray-300 text-blue-600 mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Description</span>
              </label>
              {(widget as any).content?.description?.enabled !== false && (
                <textarea
                  value={(widget as any).content?.description?.text || ''}
                  onChange={(e) => updateWidget({ 
                    content: { 
                      ...(widget as any).content,
                      description: { ...(widget as any).content?.description, text: e.target.value }
                    } 
                  })}
                  placeholder="Describe what your story is about"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              )}
            </div>
            
            {/* Call to Action */}
            <div>
              <label className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={(widget as any).content?.callToAction?.enabled !== false}
                  onChange={(e) => updateWidget({ 
                    content: { 
                      ...(widget as any).content,
                      callToAction: { ...(widget as any).content?.callToAction, enabled: e.target.checked }
                    } 
                  })}
                  className="rounded border-gray-300 text-blue-600 mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Call to Action</span>
              </label>
              {(widget as any).content?.callToAction?.enabled !== false && (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={(widget as any).content?.callToAction?.text || ''}
                    onChange={(e) => updateWidget({ 
                      content: { 
                        ...(widget as any).content,
                        callToAction: { ...(widget as any).content?.callToAction, text: e.target.value }
                      } 
                    })}
                    placeholder="Learn more"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <input
                    type="url"
                    value={(widget as any).content?.callToAction?.url || ''}
                    onChange={(e) => updateWidget({ 
                      content: { 
                        ...(widget as any).content,
                        callToAction: { ...(widget as any).content?.callToAction, url: e.target.value }
                      } 
                    })}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <select
                    value={(widget as any).content?.callToAction?.type || 'button'}
                    onChange={(e) => updateWidget({ 
                      content: { 
                        ...(widget as any).content,
                        callToAction: { ...(widget as any).content?.callToAction, type: e.target.value }
                      } 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="button">Button</option>
                    <option value="link">Link</option>
                  </select>
                </div>
              )}
            </div>
          </div>
          
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Configuration</h4>
            
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">Content Alignment</label>
              <select
                value={(widget as any).config?.contentAlignment || 'left'}
                onChange={(e) => updateWidget({ 
                  config: { ...(widget as any).config, contentAlignment: e.target.value } 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
            
            {(widget as any).layout === 'image-overlay' && (
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Overlay Opacity: {(widget as any).config?.overlayOpacity || 60}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={(widget as any).config?.overlayOpacity || 60}
                  onChange={(e) => updateWidget({ 
                    config: { ...(widget as any).config, overlayOpacity: parseInt(e.target.value) } 
                  })}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">Darkness of the image overlay</p>
              </div>
            )}
            
            {(widget as any).layout === 'color-block' && (
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={(widget as any).config?.useAccentColor !== false}
                    onChange={(e) => updateWidget({ 
                      config: { ...(widget as any).config, useAccentColor: e.target.checked } 
                    })}
                    className="rounded border-gray-300 text-blue-600 mr-2"
                  />
                  <span className="text-sm text-gray-700">Use Accent Color (from theme)</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">When disabled, uses light gray background</p>
              </div>
            )}
          </div>
        </div>
      )}
        </div>
      )}
    </div>
  )
}
