import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Info, Plus, Trash2, GripVertical, X } from 'lucide-react'
import { nanoid } from 'nanoid'
import { createDebugLogger } from '../../utils/logger'
import { useBrandingStore } from '../../stores/brandingStore'
import { PageStatus } from './PageStatus'
import type { PageInstance, Archetype } from '../../types/archetypes'

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
  // Global sections (header/footer) to search for widgets
  globalSections?: CanvasItem[]
  // For global section widget updates
  headerSections?: CanvasItem[]
  footerSections?: CanvasItem[]
  currentWebsiteId?: string
  currentPageId?: string
  // Edit mode for header/footer ('global' edits site-wide, 'page-edit' creates page-specific copy)
  headerEditMode?: 'global' | 'hide' | 'page-edit'
  footerEditMode?: 'global' | 'hide' | 'page-edit'
  // Archetype-specific props
  pageConfig?: import('../../types/archetypes').PageConfig // For archetype mode
  onPageConfigChange?: (pageConfig: import('../../types/archetypes').PageConfig) => void // Callback to save pageConfig in archetype mode
  // Page Status props (for showing page-archetype relationship)
  pageInstance?: PageInstance | null
  archetype?: Archetype | null
  archetypeName?: string
  dirtyZones?: Set<string>
  onPageInstanceChange?: () => void
  designId?: string // Design ID for archetype link
  onResetToArchetype?: () => void // Preview reset to archetype (loads archetype content into editor)
  onRevertZoneToArchetype?: (zoneSlug: string) => void // Preview zone revert (loads zone from archetype)
}

export function PropertiesPanel({ 
  creatingSchemaType, 
  selectedSchemaObject, 
  onSaveSchema, 
  onCancelSchema, 
  usePageStore,
  SchemaFormEditor,
  onExpandedChange,
  isExpanded,
  globalSections = [],
  headerSections = [],
  footerSections = [],
  currentWebsiteId = '',
  currentPageId = '',
  headerEditMode = 'global',
  footerEditMode = 'global',
  pageConfig,
  onPageConfigChange,
  pageInstance,
  archetype,
  archetypeName,
  dirtyZones = new Set(),
  onPageInstanceChange,
  designId,
  onResetToArchetype,
  onRevertZoneToArchetype
}: PropertiesPanelProps) {
  const { canvasItems, selectedWidget, replaceCanvasItems, publicationCardVariants, schemaObjects, updateSiteLayoutWidget, setPageCanvas, getPageCanvas, editingContext } = usePageStore()
  const isArchetypeMode = editingContext === 'archetype'
  const pageCanvasData = usePageStore((state: any) => state.pageCanvasData || {})
  const navigate = useNavigate()
  
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
  
  // Show Page Status + Page Settings when nothing is selected
  if (!selectedWidget) {
    // When editing an archetype, only show Page Settings (no PageStatus - archetypes don't inherit)
    if (isArchetypeMode) {
      return (
        <PageSettingsView 
          usePageStore={usePageStore} 
          currentWebsiteId={currentWebsiteId} 
          currentPageId={currentPageId}
          isArchetypeMode={isArchetypeMode}
          pageConfig={pageConfig}
          onPageConfigChange={onPageConfigChange}
        />
      )
    }
    
    // When editing a page (instance), show Page Status + Page Settings
    return (
      <div className="flex flex-col h-full">
        {/* Page Status Section */}
        <PageStatus
          websiteId={currentWebsiteId}
          pageName={currentPageId}
          pageInstance={pageInstance || null}
          archetype={archetype || null}
          archetypeName={archetypeName}
          dirtyZones={dirtyZones}
          onPageInstanceChange={onPageInstanceChange}
          designId={designId}
          onResetToArchetype={onResetToArchetype}
          onRevertZoneToArchetype={onRevertZoneToArchetype}
        />
        
        {/* Divider */}
        <div className="border-t border-gray-200 mx-4" />
        
        {/* Page Settings Section */}
        <PageSettingsView 
          usePageStore={usePageStore} 
          currentWebsiteId={currentWebsiteId} 
          currentPageId={currentPageId}
          isArchetypeMode={isArchetypeMode}
          pageConfig={pageConfig}
          onPageConfigChange={onPageConfigChange}
        />
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
  
  // Search in global sections (header/footer) OR page-specific sections if in page-edit mode
  const pageHeaderKey = `${currentWebsiteId}:header-${currentPageId}`
  const pageFooterKey = `${currentWebsiteId}:footer-${currentPageId}`
  const pageHeaderSections = headerEditMode === 'page-edit' ? pageCanvasData[pageHeaderKey] : null
  const pageFooterSections = footerEditMode === 'page-edit' ? pageCanvasData[pageFooterKey] : null
  
  // Determine which sections to search - prefer page-specific when in page-edit mode
  const sectionsToSearch = [
    ...(pageHeaderSections || headerSections),
    ...(pageFooterSections || footerSections)
  ]
  
  if (!selectedItem && sectionsToSearch.length > 0) {
    // First, check if the SECTION ITSELF is selected (not a widget inside it)
    const foundSection = sectionsToSearch.find(s => s.id === selectedWidget)
    if (foundSection) {
      selectedItem = foundSection
      debugLog('log', '✅ Found SECTION in header/footer:', foundSection.id)
    } else {
      // Search for widgets inside sections
      for (const section of sectionsToSearch) {
        if (isSection(section)) {
          for (const area of section.areas) {
            const foundWidget = area.widgets.find(w => w.id === selectedWidget)
            if (foundWidget) {
              selectedItem = foundWidget
              debugLog('log', '✅ Found widget in header/footer section:', foundWidget.type, foundWidget.id)
              break
            }
          }
          if (selectedItem) break
        }
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
  
  // If widget is selected but not found, show Page Status as fallback
  if (!selectedItem) {
    debugLog('log', '⚠️ Properties Panel - Widget selected but not found, showing Page Status:', { 
      selectedWidget,
      websiteId: currentWebsiteId,
      pageId: currentPageId
    })
    return (
      <PageStatus
        websiteId={currentWebsiteId}
        pageName={currentPageId}
        pageInstance={pageInstance || null}
        archetype={archetype || null}
        archetypeName={archetypeName}
        dirtyZones={dirtyZones}
        onPageInstanceChange={onPageInstanceChange}
        designId={designId}
        onResetToArchetype={onResetToArchetype}
        onRevertZoneToArchetype={onRevertZoneToArchetype}
      />
    )
  }

  // Helper to check if widget is in a section array
  const isWidgetInSections = (sections: CanvasItem[], widgetId: string): boolean => {
    return sections.some(section => {
      if (isSection(section)) {
        return section.areas.some(area => 
          area.widgets.some(w => w.id === widgetId)
        )
      }
      return false
    })
  }
  
  const updateWidget = (updates: Partial<Widget>) => {
    // Check if widget is from header or footer (global sections)
    const isInHeader = isWidgetInSections(headerSections, selectedWidget || '')
    const isInFooter = isWidgetInSections(footerSections, selectedWidget || '')
    
    // If widget is from global header/footer
    if ((isInHeader || isInFooter) && currentWebsiteId) {
      const sectionType = isInHeader ? 'header' : 'footer'
      const editMode = isInHeader ? headerEditMode : footerEditMode
      
      if (editMode === 'page-edit' && currentPageId) {
        // PAGE-SPECIFIC EDIT: Update page-specific copy
        debugLog('log', `📝 [PAGE-EDIT] Updating ${sectionType} widget:`, selectedWidget, 'with:', updates)
        debugLog('log', `📝 [PAGE-EDIT] Website: ${currentWebsiteId}, Page: ${currentPageId}`)
        
        // Get or create page-specific sections
        const pageKey = `${sectionType}-${currentPageId}`
        let pageSections = getPageCanvas ? getPageCanvas(currentWebsiteId, pageKey) : null
        
        debugLog('log', `📝 [PAGE-EDIT] Existing page sections for key "${pageKey}":`, pageSections ? 'found' : 'none')
        
        // If no page-specific copy exists, create one from global
        if (!pageSections) {
          pageSections = JSON.parse(JSON.stringify(isInHeader ? headerSections : footerSections))
          debugLog('log', `📋 [PAGE-EDIT] Created page-specific copy from global ${sectionType}`)
        }
        
        // Update the widget in the page-specific copy
        const updatedSections = pageSections.map((section: any) => ({
          ...section,
          areas: section.areas?.map((area: any) => ({
            ...area,
            widgets: area.widgets?.map((widget: any) => 
              widget.id === selectedWidget ? { ...widget, ...updates } : widget
            )
          }))
        }))
        
        // Save to page canvas
        if (setPageCanvas) {
          debugLog('log', `💾 [PAGE-EDIT] Saving to pageCanvasData with key: ${currentWebsiteId}:${pageKey}`)
          setPageCanvas(currentWebsiteId, pageKey, updatedSections)
        } else {
          debugLog('error', '❌ [PAGE-EDIT] setPageCanvas not available!')
        }
        return
      } else if (updateSiteLayoutWidget) {
        // GLOBAL EDIT: Update site-wide header/footer
        debugLog('log', `📝 Updating global ${sectionType} widget:`, selectedWidget, updates)
        updateSiteLayoutWidget(currentWebsiteId, sectionType, selectedWidget || '', updates)
        return
      }
    }
    
    // Otherwise, update in canvasItems as usual
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
    // Helper to clear legacy padding properties when new padding is set
    // This avoids CSS specificity conflicts (individual padding properties override shorthand)
    const processUpdatesWithPadding = (section: any, updates: any) => {
      const processed = { ...section, ...updates }
      
      // When updating background, completely replace it (don't merge old properties)
      if ('background' in updates && updates.background !== undefined) {
        processed.background = updates.background
      }
      
      // When setting new `padding` property, clear legacy `styling.padding*`
      if ('padding' in updates && section.styling) {
        processed.styling = {
          ...section.styling,
          paddingTop: undefined,
          paddingBottom: undefined,
          paddingLeft: undefined,
          paddingRight: undefined
        }
      }
      
      return processed
    }
    
    // Check if section is from global header/footer
    const isInHeader = headerSections.some(s => s.id === selectedWidget)
    const isInFooter = footerSections.some(s => s.id === selectedWidget)
    
    if ((isInHeader || isInFooter) && currentWebsiteId) {
      const sectionType = isInHeader ? 'header' : 'footer'
      const editMode = isInHeader ? headerEditMode : footerEditMode
      
      if (editMode === 'page-edit' && currentPageId) {
        // Update page-specific copy
        debugLog('log', `📝 [PAGE-EDIT] Updating ${sectionType} section:`, selectedWidget, updates)
        
        const pageKey = `${sectionType}-${currentPageId}`
        let pageSections = getPageCanvas ? getPageCanvas(currentWebsiteId, pageKey) : null
        
        if (!pageSections) {
          pageSections = JSON.parse(JSON.stringify(isInHeader ? headerSections : footerSections))
        }
        
        const updatedSections = pageSections.map((section: any) => 
          section.id === selectedWidget ? processUpdatesWithPadding(section, updates) : section
        )
        
        if (setPageCanvas) {
          setPageCanvas(currentWebsiteId, pageKey, updatedSections)
        }
        return
      } else {
        // Update global site layout
        debugLog('log', `📝 [GLOBAL] Updating ${sectionType} section:`, selectedWidget, updates)
        const updateSiteLayoutSection = (usePageStore.getState() as any).updateSiteLayoutSection
        if (updateSiteLayoutSection) {
          updateSiteLayoutSection(currentWebsiteId, sectionType, selectedWidget, updates)
        }
        return
      }
    }
    
    // Regular canvas section update
    const updatedCanvasItems = canvasItems.map((item: CanvasItem) => {
      if (isSection(item) && item.id === selectedWidget) {
        return processUpdatesWithPadding(item, updates)
      }
      return item
    })
    replaceCanvasItems(updatedCanvasItems)
  }
  
  if (isSection(selectedItem)) {
    const section = selectedItem as WidgetSection
    // Detect if using context branding (color is a template variable like {journal.branding.primaryColor})
    const bgType = section.background?.type as string | undefined
    const isContextBranding = bgType === 'branding' || 
      (section.background?.color?.startsWith('{') && section.background?.color?.endsWith('}')) ||
      (section.background?.gradient?.stops?.some(s => s.color?.startsWith('{') && s.color?.endsWith('}')))
    const backgroundType = isContextBranding ? 'branding' : (bgType || 'none')
    
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
          {/* Zone Slug - for archetype/page instance inheritance */}
          {section.zoneSlug && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Zone Slug</span>
              <p className="mt-1 text-xs text-gray-700 font-mono bg-white px-2 py-1 rounded border border-gray-200">{section.zoneSlug}</p>
            </div>
          )}
          {/* Inheritance Status - only show when editing a page instance */}
          {pageInstance && section.zoneSlug && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Inheritance</span>
                {pageInstance.overrides[section.zoneSlug] ? (
                  <span className="text-xs px-2 py-1 rounded-full font-medium bg-blue-100 text-blue-700">
                    Local Override
                  </span>
                ) : (
                  <span className="text-xs px-2 py-1 rounded-full font-medium bg-gray-100 text-gray-600">
                    Inherited
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Section Role - for marking sections as page header/footer */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Section Role
            <span className="ml-2 text-xs font-normal text-gray-500">(for page-level header/footer)</span>
          </label>
          <select
            value={section.role || 'content'}
            onChange={(e) => updateSection({ role: e.target.value as 'header' | 'footer' | 'content' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="content">Content (normal flow)</option>
            <option value="header">Page Header (renders at top)</option>
            <option value="footer">Page Footer (renders at bottom)</option>
          </select>
          {section.role && section.role !== 'content' && (
            <p className="mt-1 text-xs text-amber-600">
              ⚠️ This section will render as the page {section.role}, outside normal content flow.
            </p>
          )}
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
                  <option value="5">5 Columns</option>
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
                  const newType = e.target.value as 'color' | 'image' | 'gradient' | 'branding' | 'none'
                  
                  // Clear old background and set new one based on type
                  if (newType === 'none') {
                    updateSection({ background: undefined })
                  } else if (newType === 'color') {
                    // If current color is a context variable, reset to white, otherwise keep it
                    const currentColor = section.background?.color
                    const isContextVar = currentColor?.startsWith('{') && currentColor?.endsWith('}')
                    updateSection({
                      background: {
                        type: 'color',
                        color: isContextVar ? '#ffffff' : (currentColor || '#ffffff')
                      }
                    })
                  } else if (newType === 'branding') {
                    // Check if currently using gradient with context variables
                    const hasContextGradient = section.background?.gradient?.stops?.some(
                      (s: any) => s.color?.startsWith('{') && s.color?.endsWith('}')
                    )
                    if (hasContextGradient && section.background?.gradient) {
                      // Keep the gradient but ensure it's properly formatted
                      updateSection({
                        background: {
                          type: 'gradient',
                          gradient: section.background.gradient
                        }
                      })
                    } else {
                      // Default to solid branding color
                      updateSection({
                        background: {
                          type: 'color',
                          color: '{journal.branding.primaryColor}'
                        }
                      })
                    }
                  } else if (newType === 'image') {
                    updateSection({
                      background: {
                        type: 'image',
                        image: { 
                          url: '', 
                          position: 'center', 
                          repeat: 'no-repeat', 
                          size: 'cover' 
                        }
                      }
                    })
                  } else if (newType === 'gradient') {
                    // If current gradient has context variables, keep them, otherwise reset
                    const currentStops = section.background?.gradient?.stops
                    const hasContextStops = currentStops?.some(
                      (s: any) => s.color?.startsWith('{') && s.color?.endsWith('}')
                    )
                    updateSection({
                      background: {
                        type: 'gradient',
                        gradient: {
                          type: 'linear',
                          direction: section.background?.gradient?.direction || 'to right',
                          stops: (hasContextStops && currentStops) ? currentStops : [
                            { color: '#ffffff', position: '0%' },
                            { color: '#f3f4f6', position: '100%' }
                          ]
                        }
                      }
                    })
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="none">None</option>
                <option value="branding">Context Branding</option>
                <option value="color">Solid Color</option>
                <option value="image">Background Image</option>
                <option value="gradient">Gradient</option>
              </select>
            </div>
            
            {/* Context Branding - Journal/Website aware colors */}
            {backgroundType === 'branding' && (() => {
              const { currentWebsiteId, websites } = usePageStore.getState()
              const currentWebsite = websites.find((w: any) => w.id === currentWebsiteId)
              
              // Get journal colors from branding store (Design Console)
              const brandingState = useBrandingStore.getState()
              const websiteBranding = brandingState.getWebsiteBranding(currentWebsiteId)
              
              // Determine if using gradient or solid
              const isBrandingGradient = section.background?.gradient?.stops?.some(
                (s: any) => s.color?.startsWith('{') && s.color?.endsWith('}')
              )
              const brandingStyle = isBrandingGradient ? 'gradient' : 'solid'
              
              // Get current color variable
              const currentColorVar = section.background?.color || '{journal.branding.primaryColor}'
              
              // Context color options with resolved preview colors from branding store
              const getResolvedColor = (variable: string): string => {
                if (variable === '{journal.branding.primaryColor}') {
                  return websiteBranding?.journals?.[0]?.colors?.primary || 
                         currentWebsite?.branding?.primaryColor || '#6366f1'
                }
                if (variable === '{journal.branding.secondaryColor}') {
                  return websiteBranding?.journals?.[0]?.colors?.secondary || 
                         currentWebsite?.branding?.secondaryColor || '#818cf8'
                }
                if (variable === '{website.branding.primaryColor}') {
                  return websiteBranding?.website?.colors?.primary || 
                         currentWebsite?.branding?.primaryColor || '#3b82f6'
                }
                if (variable === '{website.branding.accentColor}') {
                  return websiteBranding?.website?.colors?.accent || 
                         currentWebsite?.branding?.accentColor || '#f59e0b'
                }
                return '#6366f1'
              }
              
              const contextColors = [
                { 
                  label: 'Journal Primary', 
                  variable: '{journal.branding.primaryColor}',
                  preview: getResolvedColor('{journal.branding.primaryColor}'),
                  description: 'Uses the journal\'s brand color (editable in Design Console)'
                },
                { 
                  label: 'Journal Secondary', 
                  variable: '{journal.branding.secondaryColor}',
                  preview: getResolvedColor('{journal.branding.secondaryColor}'),
                  description: 'Uses the journal\'s secondary color'
                },
                { 
                  label: 'Site Primary', 
                  variable: '{website.branding.primaryColor}',
                  preview: getResolvedColor('{website.branding.primaryColor}'),
                  description: 'Uses the website\'s primary color'
                },
                { 
                  label: 'Site Accent', 
                  variable: '{website.branding.accentColor}',
                  preview: getResolvedColor('{website.branding.accentColor}'),
                  description: 'Uses the website\'s accent color'
                }
              ]
              
              return (
                <div className="space-y-4">
                  {/* Info banner */}
                  <div className="p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
                    <p className="text-xs font-medium text-indigo-700 mb-1 flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      Context-Aware Branding
                    </p>
                    <p className="text-xs text-indigo-600/80">
                      Colors adapt to the current journal. Edit colors in <span className="font-medium">Design Console → Branding</span>.
                    </p>
                  </div>
                  
                  {/* Style toggle: Solid vs Gradient */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Branding Style</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          // Switch to solid - clear gradient, set color
                          const colorToUse = currentColorVar.startsWith('{') ? currentColorVar : '{journal.branding.primaryColor}'
                          updateSection({
                            background: {
                              type: 'color',
                              color: colorToUse
                              // Explicitly don't include gradient
                            }
                          })
                        }}
                        className={`flex-1 px-3 py-2 text-sm rounded-md border transition-all ${
                          brandingStyle === 'solid' 
                            ? 'bg-indigo-100 border-indigo-400 text-indigo-800' 
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Solid
                      </button>
                      <button
                        onClick={() => {
                          // Switch to gradient - clear color, set gradient
                          // Preserve existing gradient stops if they're context variables, otherwise use defaults
                          const existingStops = section.background?.gradient?.stops
                          const hasContextStops = existingStops?.some(
                            (s: any) => s.color?.startsWith('{') && s.color?.endsWith('}')
                          )
                          updateSection({
                            background: {
                              type: 'gradient',
                              gradient: {
                                type: 'linear',
                                direction: section.background?.gradient?.direction || 'to bottom',
                                stops: (hasContextStops && existingStops) ? existingStops : [
                                  { color: '{journal.branding.primaryColor}', position: '0%' },
                                  { color: '{journal.branding.secondaryColor}', position: '100%' }
                                ]
                              }
                              // Explicitly don't include color
                            }
                          })
                        }}
                        className={`flex-1 px-3 py-2 text-sm rounded-md border transition-all ${
                          brandingStyle === 'gradient' 
                            ? 'bg-indigo-100 border-indigo-400 text-indigo-800' 
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Gradient
                      </button>
                    </div>
                  </div>
                  
                  {/* Solid color selection */}
                  {brandingStyle === 'solid' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Color Source</label>
                      <div className="grid grid-cols-2 gap-2">
                        {contextColors.map((ctx) => (
                          <button
                            key={ctx.variable}
                            onClick={() => updateSection({
                              background: {
                                type: 'color',
                                color: ctx.variable
                              }
                            })}
                            title={ctx.description}
                            className={`
                              flex items-center gap-2 px-3 py-2 text-xs rounded-lg border transition-all
                              ${currentColorVar === ctx.variable 
                                ? 'bg-indigo-100 border-indigo-400 text-indigo-800 ring-2 ring-indigo-200' 
                                : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-300 hover:bg-indigo-50'
                              }
                            `}
                          >
                            <span 
                              className="w-5 h-5 rounded-full border border-gray-300 flex-shrink-0 shadow-sm"
                              style={{ backgroundColor: ctx.preview }}
                            />
                            <span className="truncate font-medium">{ctx.label}</span>
                          </button>
                        ))}
                      </div>
                      <p className="mt-2 text-xs text-gray-500 bg-gray-50 px-2 py-1.5 rounded font-mono">
                        {currentColorVar} → <span style={{ color: getResolvedColor(currentColorVar) }} className="font-bold">{getResolvedColor(currentColorVar)}</span>
                      </p>
                    </div>
                  )}
                  
                  {/* Gradient configuration */}
                  {brandingStyle === 'gradient' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Direction</label>
                        <select
                          value={section.background?.gradient?.direction || 'to bottom'}
                          onChange={(e) => updateSection({
                            background: {
                              type: 'gradient',
                              gradient: {
                                ...section.background?.gradient,
                                type: 'linear',
                                direction: e.target.value,
                                stops: section.background?.gradient?.stops || [
                                  { color: '{journal.branding.primaryColor}', position: '0%' },
                                  { color: '{journal.branding.secondaryColor}', position: '100%' }
                                ]
                              }
                            }
                          })}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                        >
                          <option value="to bottom">↓ Top to Bottom</option>
                          <option value="to top">↑ Bottom to Top</option>
                          <option value="to right">→ Left to Right</option>
                          <option value="to left">← Right to Left</option>
                          <option value="to bottom right">↘ Diagonal</option>
                          <option value="to top right">↗ Diagonal Up</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Gradient Stops</label>
                        <div className="space-y-2">
                          {(section.background?.gradient?.stops || [
                            { color: '{journal.branding.primaryColor}', position: '0%' },
                            { color: '{journal.branding.secondaryColor}', position: '100%' }
                          ]).map((stop: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                              <span 
                                className="w-6 h-6 rounded border border-gray-300 flex-shrink-0"
                                style={{ backgroundColor: getResolvedColor(stop.color) }}
                              />
                              <select
                                value={stop.color}
                                onChange={(e) => {
                                  const stops = [...(section.background?.gradient?.stops || [])]
                                  stops[idx] = { ...stops[idx], color: e.target.value }
                                  updateSection({
                                    background: {
                                      type: 'gradient',
                                      gradient: {
                                        ...section.background?.gradient,
                                        type: 'linear',
                                        direction: section.background?.gradient?.direction || 'to bottom',
                                        stops
                                      }
                                    }
                                  })
                                }}
                                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded bg-white"
                              >
                                {contextColors.map((ctx) => (
                                  <option key={ctx.variable} value={ctx.variable}>{ctx.label}</option>
                                ))}
                              </select>
                              <input
                                type="text"
                                value={stop.position}
                                onChange={(e) => {
                                  const stops = [...(section.background?.gradient?.stops || [])]
                                  stops[idx] = { ...stops[idx], position: e.target.value }
                                  updateSection({
                                    background: {
                                      type: 'gradient',
                                      gradient: {
                                        ...section.background?.gradient,
                                        type: 'linear',
                                        direction: section.background?.gradient?.direction || 'to bottom',
                                        stops
                                      }
                                    }
                                  })
                                }}
                                className="w-16 px-2 py-1 text-xs border border-gray-300 rounded text-center"
                                placeholder="0%"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Preview */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Preview</label>
                        <div 
                          className="h-12 rounded-lg border border-gray-300"
                          style={{
                            background: `linear-gradient(${section.background?.gradient?.direction || 'to bottom'}, ${
                              (section.background?.gradient?.stops || []).map(
                                (s: any) => `${getResolvedColor(s.color)} ${s.position}`
                              ).join(', ')
                            })`
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )
            })()}
            
            {backgroundType === 'color' && (() => {
              const { currentWebsiteId, websites, themes } = usePageStore.getState()
              const currentWebsite = websites.find((w: any) => w.id === currentWebsiteId)
              const currentTheme = currentWebsite 
                ? themes.find((t: any) => t.id === currentWebsite.themeId)
                : null
              
              const isCarbonTheme = currentTheme?.id === 'ibm-carbon-ds'
              
              // Check if current color is a context variable
              const currentColor = section.background?.color || '#ffffff'
              const isContextColor = currentColor.startsWith('{') && currentColor.endsWith('}')
              
              return (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
                  
                  {/* Note: Context-aware colors are now in "Context Branding" option */}
                  {isContextColor && (
                    <div className="mb-3 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700">
                      ⚠️ This section is using a context variable. Switch to "Context Branding" to edit it.
                    </div>
                  )}
                  
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
                  
                  {/* Custom Color Picker */}
                  <p className="text-xs text-gray-500 mb-2">Or choose a custom color:</p>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={isContextColor ? '#6366f1' : currentColor}
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
                      value={currentColor}
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
            
            {backgroundType === 'gradient' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gradient Type</label>
                    <select
                      value={section.background?.gradient?.type || 'linear'}
                      onChange={(e) => updateSection({
                        background: {
                          ...section.background,
                          type: 'gradient',
                          gradient: {
                            ...section.background?.gradient,
                            type: e.target.value as 'linear' | 'radial',
                            direction: section.background?.gradient?.direction || 'to right',
                            stops: section.background?.gradient?.stops || [
                              { color: '#ffffff', position: '0%' },
                              { color: '#f3f4f6', position: '100%' }
                            ]
                          }
                        }
                      })}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                    >
                      <option value="linear">Linear</option>
                      <option value="radial">Radial</option>
                    </select>
                  </div>
                  
                  {section.background?.gradient?.type !== 'radial' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Direction</label>
                      <select
                        value={section.background?.gradient?.direction || 'to right'}
                        onChange={(e) => updateSection({
                          background: {
                            ...section.background,
                            type: 'gradient',
                            gradient: {
                              ...section.background?.gradient,
                              type: section.background?.gradient?.type || 'linear',
                              direction: e.target.value,
                              stops: section.background?.gradient?.stops || [
                                { color: '#ffffff', position: '0%' },
                                { color: '#f3f4f6', position: '100%' }
                              ]
                            }
                          }
                        })}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                      >
                        <option value="to right">→ Left to Right</option>
                        <option value="to left">← Right to Left</option>
                        <option value="to bottom">↓ Top to Bottom</option>
                        <option value="to top">↑ Bottom to Top</option>
                        <option value="to bottom right">↘ Diagonal Down</option>
                        <option value="to top right">↗ Diagonal Up</option>
                        <option value="to bottom left">↙ Diagonal Down Left</option>
                        <option value="to top left">↖ Diagonal Up Left</option>
                      </select>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color Stops</label>
                  {(() => {
                    const defaultStops = [
                      { color: '#ffffff', position: '0%' },
                      { color: '#f3f4f6', position: '100%' }
                    ]
                    const currentStops = section.background?.gradient?.stops || defaultStops
                    
                    // Context color options for gradients
                    const gradientContextColors = [
                      { label: 'Journal Primary', variable: '{journal.branding.primaryColor}' },
                      { label: 'Journal Secondary', variable: '{journal.branding.secondaryColor}' },
                      { label: 'Site Primary', variable: '{website.branding.primaryColor}' },
                      { label: 'Site Accent', variable: '{website.branding.accentColor}' }
                    ]
                    
                    return (
                      <>
                        <div className="space-y-3">
                          {currentStops.map((stop, index) => {
                            const isContextColor = stop.color.startsWith('{') && stop.color.endsWith('}')
                            return (
                            <div key={index} className="p-2 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-medium text-gray-500 w-16">Stop {index + 1}</span>
                                <input
                                  type="text"
                                  value={stop.position}
                                  onChange={(e) => {
                                    const stops = [...currentStops]
                                    stops[index] = { ...stops[index], position: e.target.value }
                                    updateSection({
                                      background: {
                                        ...section.background,
                                        type: 'gradient',
                                        gradient: {
                                          ...section.background?.gradient,
                                          type: section.background?.gradient?.type || 'linear',
                                          direction: section.background?.gradient?.direction || 'to right',
                                          stops
                                        }
                                      }
                                    })
                                  }}
                                  className="w-16 px-2 py-1 border border-gray-300 rounded text-xs"
                                  placeholder="0%"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={isContextColor ? '#6366f1' : stop.color}
                                  onChange={(e) => {
                                    const stops = [...currentStops]
                                    stops[index] = { ...stops[index], color: e.target.value }
                                    updateSection({
                                      background: {
                                        ...section.background,
                                        type: 'gradient',
                                        gradient: {
                                          ...section.background?.gradient,
                                          type: section.background?.gradient?.type || 'linear',
                                          direction: section.background?.gradient?.direction || 'to right',
                                          stops
                                        }
                                      }
                                    })
                                  }}
                                  className="w-8 h-8 border border-gray-300 rounded cursor-pointer flex-shrink-0"
                                />
                                <select
                                  value={isContextColor ? stop.color : 'custom'}
                                  onChange={(e) => {
                                    if (e.target.value === 'custom') return
                                    const stops = [...currentStops]
                                    stops[index] = { ...stops[index], color: e.target.value }
                                    updateSection({
                                      background: {
                                        ...section.background,
                                        type: 'gradient',
                                        gradient: {
                                          ...section.background?.gradient,
                                          type: section.background?.gradient?.type || 'linear',
                                          direction: section.background?.gradient?.direction || 'to right',
                                          stops
                                        }
                                      }
                                    })
                                  }}
                                  className={`flex-1 px-2 py-1.5 border rounded text-xs ${
                                    isContextColor 
                                      ? 'border-indigo-300 bg-indigo-50 text-indigo-700' 
                                      : 'border-gray-300 bg-white'
                                  }`}
                                >
                                  <option value="custom">{isContextColor ? '— Select —' : stop.color}</option>
                                  <optgroup label="Context Colors">
                                    {gradientContextColors.map(ctx => (
                                      <option key={ctx.variable} value={ctx.variable}>
                                        {ctx.label}
                                      </option>
                                    ))}
                                  </optgroup>
                                </select>
                              </div>
                              {isContextColor && (
                                <p className="mt-1 text-xs text-indigo-600">
                                  ✓ {gradientContextColors.find(c => c.variable === stop.color)?.label || 'Context'}
                                </p>
                              )}
                              {currentStops.length > 2 && (
                                <button
                                  onClick={() => {
                                    const stops = currentStops.filter((_, i) => i !== index)
                                    updateSection({
                                      background: {
                                        ...section.background,
                                        type: 'gradient',
                                        gradient: {
                                          ...section.background?.gradient,
                                          type: section.background?.gradient?.type || 'linear',
                                          direction: section.background?.gradient?.direction || 'to right',
                                          stops
                                        }
                                      }
                                    })
                                  }}
                                  className="mt-1 px-2 py-1 text-xs text-red-500 hover:bg-red-50 rounded w-full text-center"
                                  title="Remove color stop"
                                >
                                  Remove Stop
                                </button>
                              )}
                            </div>
                            )
                          })}
                        </div>
                        <button
                          onClick={() => {
                            const stops = [...currentStops]
                            // Insert a new stop in the middle
                            stops.push({ color: '#e5e7eb', position: '50%' })
                            // Sort by position
                            stops.sort((a, b) => parseInt(a.position) - parseInt(b.position))
                            updateSection({
                              background: {
                                ...section.background,
                                type: 'gradient',
                                gradient: {
                                  ...section.background?.gradient,
                                  type: section.background?.gradient?.type || 'linear',
                                  direction: section.background?.gradient?.direction || 'to right',
                                  stops
                                }
                              }
                            })
                          }}
                          className="mt-2 px-3 py-1.5 text-xs border border-dashed border-gray-300 rounded-md text-gray-600 hover:border-gray-400 hover:bg-gray-50 w-full"
                        >
                          + Add Color Stop
                        </button>
                      </>
                    )
                  })()}
                </div>
                
                {/* Gradient Preview */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preview</label>
                  <div 
                    className="h-12 rounded-md border border-gray-200"
                    style={{
                      background: (() => {
                        const gradient = section.background?.gradient
                        if (!gradient?.stops || gradient.stops.length < 2) return '#f3f4f6'
                        const stopsStr = gradient.stops.map(s => `${s.color} ${s.position}`).join(', ')
                        if (gradient.type === 'radial') {
                          return `radial-gradient(circle, ${stopsStr})`
                        }
                        return `linear-gradient(${gradient.direction || 'to right'}, ${stopsStr})`
                      })()
                    }}
                  />
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
            
            // Get spacing tokens from theme - check both direct spacing.semantic and foundation.spacing.semantic
            const semanticSpacing = currentTheme?.spacing?.semantic || currentTheme?.foundation?.spacing?.semantic
            const hasSpacingTokens = !!semanticSpacing
            
            // Build uniform padding presets from theme tokens
            const uniformPresets = semanticSpacing ? Object.entries(semanticSpacing).map(([key, value]) => ({
              label: key.toUpperCase(),
              value: value as string
            })).sort((a, b) => {
              // Sort by pixel value
              const aVal = parseInt(a.value) || 0
              const bVal = parseInt(b.value) || 0
              return aVal - bVal
            }) : []
            
            // Build pattern presets dynamically from theme tokens
            // Use semantic tokens for pattern values where possible
            const getTokenValue = (tokenName: string): string => {
              return (semanticSpacing as Record<string, string>)?.[tokenName] || '16px'
            }
            
            const patternPresets = semanticSpacing ? [
              { label: 'Card', value: `${getTokenValue('md')} ${getTokenValue('lg')}`, desc: 'vertical | horizontal' },
              { label: 'Banner', value: `${getTokenValue('xl')} ${getTokenValue('lg')}`, desc: 'tall sides' },
              { label: 'Hero', value: `${getTokenValue('2xl') || getTokenValue('xl')} ${getTokenValue('lg')}`, desc: 'extra tall' },
              { label: 'Compact', value: `${getTokenValue('sm')} ${getTokenValue('md')}`, desc: 'tight fit' },
              { label: 'Asymmetric', value: `${getTokenValue('lg')} ${getTokenValue('xl')} ${getTokenValue('md')} ${getTokenValue('xl')}`, desc: 'less bottom' },
              { label: 'Header', value: `${getTokenValue('sm')} ${getTokenValue('lg')}`, desc: 'nav style' }
            ] : []
            
            return (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-900 border-b pb-2">Spacing & Layout</h4>
                
                {/* Section Padding */}
                {(() => {
                  // Compute effective padding from new property OR legacy styling
                  const legacyPaddingMap: { [key: string]: string } = {
                    'small': '16px', 'medium': '24px', 'large': '32px'
                  }
                  const legacyPaddingTop = section.styling?.paddingTop 
                    ? (legacyPaddingMap[section.styling.paddingTop] || section.styling.paddingTop)
                    : undefined
                  const legacyPaddingBottom = section.styling?.paddingBottom
                    ? (legacyPaddingMap[section.styling.paddingBottom] || section.styling.paddingBottom)
                    : undefined
                  
                  // If legacy values are equal, show as unified padding
                  const displayValue = section.padding || (legacyPaddingTop === legacyPaddingBottom ? legacyPaddingTop : '') || ''
                  
                  return (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Section Padding</label>
                      {hasSpacingTokens && (
                        <div className="mb-3 space-y-3">
                          <div>
                            <p className="text-xs text-gray-500 mb-2">
                              Uniform padding <span className="text-gray-400">(from {currentTheme?.name || 'theme'} design tokens)</span>:
                            </p>
                            <div className="grid grid-cols-4 gap-2">
                              {uniformPresets.map((preset) => (
                                <button
                                  key={preset.value}
                                  onClick={() => updateSection({
                                    padding: preset.value
                                  })}
                                  title={preset.value}
                                  className={`px-2 py-1 text-xs border rounded transition-colors ${
                                    (section.padding === preset.value || (!section.padding && displayValue === preset.value))
                                      ? 'bg-blue-100 border-blue-500 text-blue-700 font-medium' 
                                      : 'border-gray-300 hover:bg-blue-50'
                                  }`}
                                >
                                  {preset.label}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-2">Common patterns:</p>
                            <div className="grid grid-cols-3 gap-2">
                              {patternPresets.map((preset) => (
                                <button
                                  key={preset.value}
                                  onClick={() => updateSection({
                                    padding: preset.value
                                  })}
                                  title={`${preset.desc} (${preset.value})`}
                                  className={`px-2 py-1 text-xs border rounded transition-colors ${
                                    section.padding === preset.value
                                      ? 'bg-blue-100 border-blue-500 text-blue-700 font-medium' 
                                      : 'border-gray-300 hover:bg-blue-50'
                                  }`}
                                >
                                  {preset.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      <input
                        type="text"
                        value={displayValue}
                        onChange={(e) => updateSection({ padding: e.target.value || undefined })}
                        placeholder="e.g., 24px or 16px 32px or 16px 32px 8px 32px"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                      {!section.padding && legacyPaddingTop && (
                        <p className="text-xs text-amber-600 mt-1">
                          ⚠️ Using legacy padding ({legacyPaddingTop}). Set a value to migrate.
                        </p>
                      )}
                      <div className="text-xs text-gray-500 mt-2 space-y-1 bg-gray-50 p-2 rounded">
                        <p className="font-medium text-gray-600">CSS Shorthand (clockwise from top):</p>
                        <ul className="space-y-0.5 text-gray-500">
                          <li><code className="bg-gray-100 px-1 rounded">24px</code> — all sides</li>
                          <li><code className="bg-gray-100 px-1 rounded">16px 32px</code> — vertical | horizontal</li>
                          <li><code className="bg-gray-100 px-1 rounded">16px 32px 8px 32px</code> — top | right | bottom | left</li>
                        </ul>
                      </div>
                    </div>
                  )
                })()}
                
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
          
          {/* Overlay Settings */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900 border-b pb-2 flex items-center gap-2">
              Overlay Settings
              {section.overlay?.enabled && (
                <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">Active</span>
              )}
            </h4>
            
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Enable Overlay</label>
              <button
                onClick={() => updateSection({
                  overlay: section.overlay?.enabled
                    ? { ...section.overlay, enabled: false }
                    : { enabled: true, position: 'top', behavior: 'sticky', dismissible: true, showOnLoad: true, animation: 'slide' }
                })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  section.overlay?.enabled ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    section.overlay?.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Overlay sections float over other content (sticky banners, fixed notifications, modals)
            </p>
            
            {section.overlay?.enabled && (
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['top', 'center', 'bottom'] as const).map((pos) => (
                      <button
                        key={pos}
                        onClick={() => updateSection({
                          overlay: { ...section.overlay!, position: pos }
                        })}
                        className={`px-3 py-2 text-sm rounded-md border transition-colors capitalize ${
                          section.overlay?.position === pos
                            ? 'bg-purple-50 border-purple-500 text-purple-700 font-medium'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pos}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Behavior</label>
                  <select
                    value={section.overlay?.behavior || 'sticky'}
                    onChange={(e) => updateSection({
                      overlay: { ...section.overlay!, behavior: e.target.value as 'sticky' | 'fixed' | 'modal' }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="sticky">Sticky (scrolls then sticks)</option>
                    <option value="fixed">Fixed (always visible)</option>
                    <option value="modal">Modal (centered popup)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Animation</label>
                  <select
                    value={section.overlay?.animation || 'none'}
                    onChange={(e) => updateSection({
                      overlay: { ...section.overlay!, animation: e.target.value as 'none' | 'slide' | 'fade' }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="none">None</option>
                    <option value="slide">Slide</option>
                    <option value="fade">Fade</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Dismissible</label>
                  <button
                    onClick={() => updateSection({
                      overlay: { ...section.overlay!, dismissible: !section.overlay?.dismissible }
                    })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      section.overlay?.dismissible ? 'bg-purple-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        section.overlay?.dismissible ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                {section.overlay?.behavior === 'modal' && (
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Show Backdrop</label>
                    <button
                      onClick={() => updateSection({
                        overlay: { ...section.overlay!, backdrop: !section.overlay?.backdrop }
                      })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        section.overlay?.backdrop ? 'bg-purple-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          section.overlay?.backdrop ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                )}
              </div>
            )}
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
              <div className="mt-2 pt-2 border-t border-gray-200">
                <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Widget ID</span>
                <p className="mt-1 text-xs text-gray-700 font-mono bg-white px-2 py-1 rounded border border-gray-200 break-all">{widget.id}</p>
              </div>
              {/* Inheritance Status for Menu Widget */}
              {pageInstance && parentSection?.zoneSlug && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Inheritance</span>
                    {pageInstance.overrides[parentSection.zoneSlug] ? (
                      <span className="text-xs px-2 py-1 rounded-full font-medium bg-blue-100 text-blue-700">
                        Local (via zone)
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded-full font-medium bg-gray-100 text-gray-600">
                        Inherited
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Zone: <code className="font-mono bg-white px-1 rounded">{parentSection.zoneSlug}</code>
                  </p>
                </div>
              )}
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
        {/* Inheritance Status - derived from parent section's zone status */}
        {(() => {
          // Find parent section and its zone status
          const parentSection = canvasItems.find((item: CanvasItem): item is WidgetSection => 
            isSection(item) && item.areas.some(area => area.widgets.some(w => w.id === widget.id))
          )
          // Also search in global sections
          const parentGlobalSection = !parentSection 
            ? globalSections.find((item: CanvasItem): item is WidgetSection => 
                isSection(item) && item.areas.some(area => area.widgets.some((w: any) => w.id === widget.id))
              )
            : null
          const effectiveParent = parentSection || parentGlobalSection
          
          if (pageInstance && effectiveParent?.zoneSlug) {
            const isLocal = !!pageInstance.overrides[effectiveParent.zoneSlug]
            return (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Inheritance</span>
                  {isLocal ? (
                    <span className="text-xs px-2 py-1 rounded-full font-medium bg-blue-100 text-blue-700">
                      Local (via zone)
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-1 rounded-full font-medium bg-gray-100 text-gray-600">
                      Inherited
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Zone: <code className="font-mono bg-white px-1 rounded">{effectiveParent.zoneSlug}</code>
                </p>
              </div>
            )
          }
          return null
        })()}
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
          // Editors with expandable drawers need special props for panel expansion
          if (widget.type === 'menu' || widget.type === 'breadcrumbs') {
            return (
              <WidgetEditor 
                widget={widget} 
                updateWidget={updateWidget}
                isExpanded={isEditingMenuItems}
                onExpandedChange={setIsEditingMenuItems}
                pageInstance={pageInstance}
                parentZoneSlug={parentSection?.zoneSlug}
              />
            )
          }
          return <WidgetEditor widget={widget} updateWidget={updateWidget} />
        }
        return null
      })()}
      
      
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
                  // Clear publications when switching to AI-generated (force user to write prompt)
                  ...(newContentSource === 'ai-generated' ? { publications: [] } : {}),
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
              value={(() => {
                const widgetVariantId = (widget as PublicationListWidget).cardVariantId
                if (widgetVariantId) return widgetVariantId
                // If no variant ID, try to match the widget's cardConfig to a variant
                const widgetConfig = (widget as PublicationListWidget).cardConfig
                const matchingVariant = publicationCardVariants.find((v: any) => {
                  // Compare key properties to see if config matches variant
                  const variantConfig = v.config
                  return (
                    variantConfig.showTitle === widgetConfig?.showTitle &&
                    variantConfig.showAbstract === widgetConfig?.showAbstract &&
                    variantConfig.showAffiliations === widgetConfig?.showAffiliations &&
                    variantConfig.showKeywords === widgetConfig?.showKeywords &&
                    variantConfig.showUsageMetrics === widgetConfig?.showUsageMetrics &&
                    variantConfig.showThumbnail === widgetConfig?.showThumbnail &&
                    variantConfig.thumbnailPosition === widgetConfig?.thumbnailPosition
                  )
                })
                return matchingVariant?.id || 'default'
              })()}
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
                // Set up the view state first
                setSiteManagerView(`${currentWebsiteId}-publication-cards` as any)
                
                // Check if we're in a routed context (URL-based editing) or V1 internal
                if (window.location.pathname.startsWith('/edit/')) {
                  navigate('/v1')
                } else {
                  setCurrentView('design-console')
                }
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content Source
              {isArchetypeMode && (
                <span className="ml-2 text-xs text-gray-500">(Archetype configuration - read-only)</span>
              )}
            </label>
            <select
              value={(widget as PublicationDetailsWidget).contentSource}
              onChange={(e) => {
                if (isArchetypeMode) return // Disabled in archetype mode
                const newContentSource = e.target.value as 'doi' | 'ai-generated' | 'schema-objects' | 'context'
                updateWidget({ 
                  contentSource: newContentSource,
                  // Clear publication when switching to AI-generated (force user to write prompt)
                  ...(newContentSource === 'ai-generated' ? { publication: undefined } : {}),
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
              disabled={isArchetypeMode}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md ${isArchetypeMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            >
              <option value="context">Page Context</option>
              <option value="doi">DOI</option>
              <option value="ai-generated">AI Generated</option>
              <option value="schema-objects">Schema Objects</option>
            </select>
            {isArchetypeMode && (
              <p className="mt-1 text-xs text-gray-500">
                Content source is defined in the archetype. Use the "Show Mock Data" toggle to preview content.
              </p>
            )}
          </div>
          
          {/* Context Source - Shows journal metadata from current page context */}
          {(widget as PublicationDetailsWidget).contentSource === 'context' && (
            <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-indigo-900">Journal Metadata</h4>
                  <p className="text-sm text-indigo-700 mt-1">
                    This widget will display metadata from the <strong>current journal context</strong>:
                  </p>
                  <ul className="mt-2 text-xs text-indigo-600 space-y-1">
                    <li>• Journal name &amp; description</li>
                    <li>• ISSN (print &amp; online)</li>
                    <li>• Impact factor &amp; metrics</li>
                    <li>• Open access status</li>
                    <li>• Publisher information</li>
                  </ul>
                  <p className="text-xs text-indigo-500 mt-3 italic">
                    💡 Place this widget on a journal page for automatic data binding
                  </p>
                </div>
              </div>
            </div>
          )}
          
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
              value={(() => {
                const widgetVariantId = (widget as PublicationDetailsWidget).cardVariantId
                if (widgetVariantId) return widgetVariantId
                // If no variant ID, try to match the widget's cardConfig to a variant
                const widgetConfig = (widget as PublicationDetailsWidget).cardConfig
                const matchingVariant = publicationCardVariants.find((v: any) => {
                  // Compare key properties to see if config matches variant
                  const variantConfig = v.config
                  return (
                    variantConfig.showTitle === widgetConfig?.showTitle &&
                    variantConfig.showAbstract === widgetConfig?.showAbstract &&
                    variantConfig.showAffiliations === widgetConfig?.showAffiliations &&
                    variantConfig.showKeywords === widgetConfig?.showKeywords &&
                    variantConfig.showUsageMetrics === widgetConfig?.showUsageMetrics &&
                    variantConfig.showThumbnail === widgetConfig?.showThumbnail &&
                    variantConfig.thumbnailPosition === widgetConfig?.thumbnailPosition
                  )
                })
                return matchingVariant?.id || 'default'
              })()}
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
                // Set up the view state first
                setSiteManagerView(`${currentWebsiteId}-publication-cards` as any)
                
                // Check if we're in a routed context (URL-based editing) or V1 internal
                if (window.location.pathname.startsWith('/edit/')) {
                  navigate('/v1')
                } else {
                  setCurrentView('design-console')
                }
              }}
              className="w-full px-3 py-2 border border-blue-300 text-blue-700 rounded-md text-sm hover:bg-blue-50 transition-colors"
            >
              → Configure Publication Cards
            </button>
          </div>
        </div>
      )}
        </div>
      )}
    </div>
  )
}

// Page Settings View Component
function PageSettingsView({ 
  usePageStore, 
  currentWebsiteId, 
  currentPageId,
  isArchetypeMode = false,
  pageConfig,
  onPageConfigChange
}: { 
  usePageStore: any
  currentWebsiteId?: string
  currentPageId?: string
  isArchetypeMode?: boolean
  pageConfig?: import('../../types/archetypes').PageConfig
  onPageConfigChange?: (pageConfig: import('../../types/archetypes').PageConfig) => void
}) {
  const { websites, getPageLayout, setPageLayout } = usePageStore()
  const currentWebsite = websites?.find((w: any) => w.id === currentWebsiteId)
  
  const [pageName, setPageName] = useState('')
  const [urlSlug, setUrlSlug] = useState('')
  // For normal pages: 'full' | 'left' | 'right'
  // For archetypes: 'full_width' | 'left_rail' | 'right_rail' (stored in pageConfig)
  const [pageLayout, setPageLayoutState] = useState<'full' | 'left' | 'right' | 'full_width' | 'left_rail' | 'right_rail'>('full')
  const [seoTitle, setSeoTitle] = useState('')
  const [seoDescription, setSeoDescription] = useState('')
  const [seoImage, setSeoImage] = useState('')

  // Load initial values
  useEffect(() => {
    const getPageTitle = () => {
      const pathname = window.location.pathname
      if (pathname.includes('/edit/')) {
        const parts = pathname.split('/edit/')[1]?.split('/') || []
        const pageRoute = parts.slice(1).join('/') || 'home'
        
        if (pageRoute.startsWith('journal/')) {
          const journalId = pageRoute.split('/')[1]?.toUpperCase()
          return `${journalId} Journal Home`
        }
        if (pageRoute.startsWith('archetype/')) {
          const archetypeId = pageRoute.split('/')[1]
          return `${archetypeId} Archetype`
        }
        return pageRoute.charAt(0).toUpperCase() + pageRoute.slice(1)
      }
      return 'Homepage'
    }

    const siteName = currentWebsite?.name || ''
    const pageTitle = getPageTitle()
    setPageName(siteName ? `${siteName} - ${pageTitle}` : pageTitle)
    setUrlSlug(currentPageId || 'home')
    
    // Load page layout - different logic for archetype vs normal pages
    if (isArchetypeMode && pageConfig) {
      // Archetype mode: use pageConfig
      setPageLayoutState(pageConfig.layout || 'full_width')
    } else {
      // Normal page mode: use store
      const savedLayout = getPageLayout?.(currentWebsiteId || 'catalyst-demo', currentPageId || 'home')
      if (savedLayout) {
        setPageLayoutState(savedLayout)
      }
    }
  }, [currentWebsiteId, currentPageId, currentWebsite, getPageLayout, isArchetypeMode, pageConfig])

  const handleLayoutSelect = (layout: 'full' | 'left' | 'right' | 'full_width' | 'left_rail' | 'right_rail') => {
    setPageLayoutState(layout)
    
    if (isArchetypeMode && onPageConfigChange) {
      // Archetype mode: save to pageConfig
      const newPageConfig: import('../../types/archetypes').PageConfig = {
        ...pageConfig,
        layout: layout as 'full_width' | 'left_rail' | 'right_rail'
      }
      onPageConfigChange(newPageConfig)
    } else if (setPageLayout) {
      // Normal page mode: save to store
      const normalLayout = layout === 'full_width' ? 'full' : layout === 'left_rail' ? 'left' : layout === 'right_rail' ? 'right' : layout
      setPageLayout(currentWebsiteId || 'catalyst-demo', currentPageId || 'home', normalLayout as 'full' | 'left' | 'right')
    }
  }
  
  // Convert between old and new layout values for display
  const getDisplayLayout = (): 'full' | 'left' | 'right' => {
    if (pageLayout === 'full_width') return 'full'
    if (pageLayout === 'left_rail') return 'left'
    if (pageLayout === 'right_rail') return 'right'
    return pageLayout as 'full' | 'left' | 'right'
  }
  
  const displayLayout = getDisplayLayout()

  return (
    <div className="p-4 space-y-4">
      <h3 className="font-semibold text-gray-900">Page Properties</h3>

      {/* PAGE IDENTITY */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-900 border-b pb-2">Page Identity</h4>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Label</label>
          <input
            type="text"
            value={pageName}
            onChange={(e) => setPageName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            placeholder="e.g. Journal Home"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
          <div className="flex">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">/</span>
            <input
              type="text"
              value={urlSlug}
              onChange={(e) => setUrlSlug(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md text-sm"
              placeholder="page-slug"
            />
          </div>
        </div>
      </div>

      {/* PAGE LAYOUT */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-900 border-b pb-2">Page Layout</h4>
        <div className="grid grid-cols-3 gap-3">
          {/* Full Width */}
          <div
            onClick={() => handleLayoutSelect(isArchetypeMode ? 'full_width' : 'full')}
            className={`cursor-pointer relative border-2 rounded-lg p-3 hover:border-blue-400 transition-all ${
              displayLayout === 'full'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="aspect-video bg-white border border-gray-200 rounded mb-2 flex flex-col gap-1 p-1">
              <div className="h-1.5 bg-gray-200 rounded w-full"></div>
              <div className="flex-1 bg-blue-100 rounded w-full flex items-center justify-center text-[8px] text-blue-600 font-medium">
                Main
              </div>
              <div className="h-1.5 bg-gray-200 rounded w-full"></div>
            </div>
            <div className="font-medium text-xs text-gray-900 text-center">Full Width</div>
            {displayLayout === 'full' && (
              <div className="absolute top-1 right-1 text-blue-600">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>

          {/* Left Rail */}
          <div
            onClick={() => handleLayoutSelect(isArchetypeMode ? 'left_rail' : 'left')}
            className={`cursor-pointer relative border-2 rounded-lg p-3 hover:border-blue-400 transition-all ${
              displayLayout === 'left'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="aspect-video bg-white border border-gray-200 rounded mb-2 flex flex-col gap-1 p-1">
              <div className="h-1.5 bg-gray-200 rounded w-full"></div>
              <div className="flex-1 flex gap-1">
                <div className="w-1/4 bg-gray-200 rounded border border-dashed border-gray-300"></div>
                <div className="w-3/4 bg-gray-100 rounded"></div>
              </div>
              <div className="h-1.5 bg-gray-200 rounded w-full"></div>
            </div>
            <div className="font-medium text-xs text-gray-900 text-center">Left Rail</div>
            {displayLayout === 'left' && (
              <div className="absolute top-1 right-1 text-blue-600">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>

          {/* Right Rail */}
          <div
            onClick={() => handleLayoutSelect(isArchetypeMode ? 'right_rail' : 'right')}
            className={`cursor-pointer relative border-2 rounded-lg p-3 hover:border-blue-400 transition-all ${
              displayLayout === 'right'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="aspect-video bg-white border border-gray-200 rounded mb-2 flex flex-col gap-1 p-1">
              <div className="h-1.5 bg-gray-200 rounded w-full"></div>
              <div className="flex-1 flex gap-1">
                <div className="w-3/4 bg-gray-100 rounded"></div>
                <div className="w-1/4 bg-gray-200 rounded border border-dashed border-gray-300"></div>
              </div>
              <div className="h-1.5 bg-gray-200 rounded w-full"></div>
            </div>
            <div className="font-medium text-xs text-gray-900 text-center">Right Rail</div>
            {displayLayout === 'right' && (
              <div className="absolute top-1 right-1 text-blue-600">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SEO & METADATA */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-900 border-b pb-2">SEO & Metadata</h4>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Title Tag</label>
          <input
            type="text"
            value={seoTitle}
            onChange={(e) => setSeoTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            placeholder="Enter page title for SEO..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
          <textarea
            rows={3}
            value={seoDescription}
            onChange={(e) => setSeoDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            placeholder="Enter meta description..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Open Graph Image</label>
          <input
            type="text"
            value={seoImage}
            onChange={(e) => setSeoImage(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            placeholder="Enter image URL..."
          />
        </div>
      </div>
    </div>
  )
}
