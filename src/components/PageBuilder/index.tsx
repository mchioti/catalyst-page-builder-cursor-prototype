/**
 * ============================================================================
 * DRAG & DROP ARCHITECTURE DOCUMENTATION
 * ============================================================================
 * 
 * CRITICAL: This file implements the core drag-and-drop functionality using
 * @dnd-kit/core. Changes to DOM structure, CSS layout, or hook usage can
 * break DnD. Always run smoke tests after modifications.
 * 
 * ROOT CAUSE OF PAST REGRESSIONS:
 * --------------------------------
 * 1. DOM Structure Changes: Adding grid gaps, nested divs, or spacing tokens
 *    can confuse dnd-kit's collision detection. Always test DnD after theme/
 *    layout changes.
 * 
 * 2. SortableContext Misuse: Using SortableContext with useDraggable (instead
 *    of useSortable) prevents cross-area and cross-section moves. We DON'T
 *    use SortableContext in SectionRenderer for this reason.
 * 
 * 3. Missing Drop Targets: Widgets must be both draggable AND droppable to
 *    enable precise positioning. See DraggableWidgetInSection in 
 *    SectionRenderer.tsx.
 * 
 * HOW IT WORKS:
 * -------------
 * 1. **Library Widgets** (DraggableLibraryWidget.tsx):
 *    - Type: 'library-widget'
 *    - Click: Auto-creates one-column section with widget inside
 *    - Drag: Uses customCollisionDetection to find target section/area
 * 
 * 2. **Canvas Widgets** (SectionRenderer.tsx > DraggableWidgetInSection):
 *    - Type: 'section-widget'
 *    - Uses useDraggable for drag capability
 *    - Uses useDroppable to become a drop target (enables precise positioning)
 *    - Can move within same area, across areas, or across sections
 * 
 * 3. **Section Areas** (SectionRenderer.tsx):
 *    - Type: 'section-area'
 *    - Droppable zones for widgets
 *    - Multiple areas in multi-column layouts
 * 
 * 4. **Collision Detection** (customCollisionDetection below):
 *    - Priority order:
 *      a. tab-panel (for tabs widget) & collapse-panel (for collapse/accordion widget)
 *      b. widget-target (for precise positioning)
 *      c. section-area (for area drops)
 *      d. closestCenter (fallback)
 *    - This order is CRITICAL - changing it breaks precise positioning
 * 
 * 5. **handleDragEnd** (main logic):
 *    - Detects drop type (library→canvas, widget→widget, widget→area)
 *    - Auto-creates sections for library widgets
 *    - Finds precise insertion point for widget→widget drops
 *    - Moves widgets between areas/sections for widget→area drops
 * 
 * TEST COVERAGE:
 * --------------
 * - Smoke tests: tests/smoke.test.js (3 critical tests)
 * - Comprehensive: tests/drag-and-drop.test.js (13 scenarios)
 * - Always run: npm run test:smoke before committing
 * 
 * DATA ATTRIBUTES FOR TESTING:
 * ----------------------------
 * - Library widgets: data-testid="library-widget-{type}"
 * - Section areas: data-testid="section-area-{id}", data-droppable-area="{id}"
 * - Canvas widgets: data-testid="canvas-widget-{id}", data-widget-type="{type}"
 * - Sections: data-section-id="{id}"
 * 
 * KNOWN ISSUES TO AVOID:
 * ----------------------
 * - Don't wrap area.widgets.map() in SortableContext - breaks cross-area moves
 * - Don't add extra DOM nesting in SectionRenderer - confuses collision detection
 * - Don't modify customCollisionDetection priority without testing all scenarios
 * - Always make widgets both draggable AND droppable for precise positioning
 * 
 * ============================================================================
 */

import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { nanoid } from 'nanoid'
import { PREFAB_SECTIONS } from './prefabSections'
import { createDebugLogger } from '../../utils/logger'

// Control logging for this file
const DEBUG = false // Set to true to see PageBuilder canvas state
const debugLog = createDebugLogger(DEBUG)
import {
  DndContext,
  DragOverlay,
  useSensors,
  useSensor,
  PointerSensor,
  rectIntersection,
  closestCenter,
  pointerWithin
} from '@dnd-kit/core'
import {
  restrictToWindowEdges
} from '@dnd-kit/modifiers'
import type {
  DragStartEvent,
  DragOverEvent,
  DragEndEvent
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { 
  BookOpen, 
  Plus, 
  Lightbulb, 
  FileText, 
  CheckCircle, 
  Settings, 
  Check, 
  X 
} from 'lucide-react'

// Component imports
import { WidgetLibrary } from '../Library/WidgetLibrary'
import { DraggableLibraryWidget } from '../Canvas/DraggableLibraryWidget'
import { PropertiesPanel } from '../Properties/PropertiesPanel'
import { SchemaFormEditor } from '../Schema/SchemaFormEditor'
import { LayoutPicker } from '../Canvas/LayoutPicker'
import { CanvasThemeProvider } from '../Canvas/CanvasThemeProvider'
import { LayoutRenderer } from '../Canvas/LayoutRenderer'

// Type imports
import type { 
  SchemaOrgType, 
  SchemaObject 
} from '../../types/schema'
import { SCHEMA_DEFINITIONS } from '../../types/schema'
import type { 
  Widget, 
  WidgetSection, 
  ContentBlockLayout, 
  CanvasItem 
} from '../../types/widgets'
import { isSection } from '../../types/widgets'
import type { EditingContext, MockLiveSiteRoute } from '../../types'
import { GlobalSectionBar } from './GlobalSectionBar'

// Component props interface
interface PageBuilderProps {
  usePageStore: any // TODO: Type this properly when extracting store
  buildWidget: (item: any) => Widget
  // SchemaFormEditor: React.ComponentType<{
  //   schemaType: SchemaOrgType
  //   initialData?: Partial<SchemaObject>
  //   onSave: (data: Omit<SchemaObject, 'id' | 'createdAt' | 'updatedAt'>) => void
  //   onCancel: () => void
  // }>
  TemplateCanvas: React.ComponentType<{
    editingContext: EditingContext
    mockLiveSiteRoute: MockLiveSiteRoute
    onSectionsLoad: (sections: WidgetSection[]) => void
  }>
  InteractiveWidgetRenderer: React.ComponentType<{ widget: Widget }>
  isSection: (item: any) => boolean
}

type LeftSidebarTab = 'library' | 'sections' | 'diy-zone' | 'schema-content'

export function PageBuilder({
  usePageStore,
  buildWidget,
  // SchemaFormEditor,
  TemplateCanvas,
  InteractiveWidgetRenderer,
  isSection
}: PageBuilderProps) {
  // const instanceId = useMemo(() => Math.random().toString(36).substring(7), [])
  const { canvasItems, setCurrentView, selectWidget, selectedWidget, setInsertPosition, createContentBlockWithLayout, selectedSchemaObject, addSchemaObject, updateSchemaObject, selectSchemaObject, addNotification, replaceCanvasItems, editingContext, mockLiveSiteRoute, templateEditingContext, setCanvasItemsForRoute, setGlobalTemplateCanvas, setJournalTemplateCanvas, schemaObjects, trackModification, currentWebsiteId, websites, themes, isEditingLoadedWebsite, setIsEditingLoadedWebsite, addCustomStarterPage } = usePageStore()
  
  // Navigation for preview
  const navigate = useNavigate()
  
  // Track active drag item for DragOverlay
  const [activeDragItem, setActiveDragItem] = useState<{ widget?: Widget; type?: string; item?: any } | null>(null)
  
  // Debug: Log canvas state on render
  debugLog('log', '🎨 PageBuilder render - Canvas items:', canvasItems.length)
  if (canvasItems.length > 0) {
    debugLog('log', '🎨 First canvas item:', canvasItems[0]?.type, canvasItems[0]?.name || canvasItems[0]?.id)
  } else {
    debugLog('log', '🎨 Canvas is EMPTY')
  }
  
  // Detect editing context
  const isIndividualIssueEdit = editingContext === 'page' && mockLiveSiteRoute.includes('/toc/')
  const isTemplateEdit = editingContext === 'template' && templateEditingContext !== null
  const isGlobalTemplateEdit = isTemplateEdit && templateEditingContext?.scope === 'global'
  const isJournalTemplateEdit = isTemplateEdit && templateEditingContext?.scope === 'journal'
  
  const getJournalCode = (route: string): string | null => {
    const match = route.match(/\/(toc|journal)\/([^\/]+)/)
    return match ? match[2] : null // Return null for non-journal pages (like homepage)
  }
  const journalCode = getJournalCode(mockLiveSiteRoute)
  const journalName = journalCode === 'advma' ? 'Advanced Materials' : journalCode === 'embo' ? 'EMBO Journal' : 'Journal'
  
  // Get current theme name
  const currentWebsite = websites.find((w: any) => w.id === currentWebsiteId)
  const currentTheme = themes.find((t: any) => t.id === currentWebsite?.themeId)
  const themeName = currentTheme?.name || 'No Theme'
  
  // Get site layout for global header/footer
  const siteLayout = (currentWebsite as any)?.siteLayout
  const headerSections = siteLayout?.header || []
  const footerSections = siteLayout?.footer || []
  // Header/footer are always enabled - visibility is controlled per-page via dropdown
  
  // Get page-level layout overrides from store
  const { getPageLayoutOverrides, setPageLayoutOverride } = usePageStore()
  
  // Get current page ID from URL (for /edit/:websiteId/:pageId routes)
  // Fall back to mockLiveSiteRoute for legacy routes, then 'home' as default
  const location = useLocation()
  const getPageIdFromUrl = () => {
    // Check if we're on /edit/:websiteId/:pageId route
    const editMatch = location.pathname.match(/\/edit\/[^\/]+\/(.+)/)
    if (editMatch) {
      return editMatch[1] // e.g., "journals", "about", "home"
    }
    // Fall back to mockLiveSiteRoute for legacy routes
    return mockLiveSiteRoute?.replace(/^\//, '') || 'home'
  }
  const currentPageId = getPageIdFromUrl()
  const pageOverrides = getPageLayoutOverrides(currentWebsiteId, currentPageId)
  const headerOverrideMode = pageOverrides.headerOverride || 'global'
  const footerOverrideMode = pageOverrides.footerOverride || 'global'
  
  // Handlers to update overrides (persisted to store)
  const setHeaderOverrideMode = (mode: 'global' | 'hide' | 'page-edit') => {
    setPageLayoutOverride(currentWebsiteId, currentPageId, 'header', mode)
  }
  const setFooterOverrideMode = (mode: 'global' | 'hide' | 'page-edit') => {
    setPageLayoutOverride(currentWebsiteId, currentPageId, 'footer', mode)
  }


  const [leftSidebarTab, setLeftSidebarTab] = useState<LeftSidebarTab>('library')
  const [isPropertiesPanelExpanded, setIsPropertiesPanelExpanded] = useState(false)
  const [showLayoutPicker, setShowLayoutPicker] = useState(false)
  const [activeSectionToolbar, setActiveSectionToolbar] = useState<string | null>(null)
  const [activeWidgetToolbar, setActiveWidgetToolbar] = useState<string | null>(null)
  const [activeDropZone, setActiveDropZone] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  
  // Schema editing state
  const [creatingSchemaType, setCreatingSchemaType] = useState<SchemaOrgType | null>(null)
  
  // Homepage template auto-loading
  // Load a starter canvas with one section when Page Builder opens with empty canvas
  // BUT skip if content was already loaded externally (isEditingLoadedWebsite)
  useEffect(() => {
    // Give time for external content to load first
    const timer = setTimeout(() => {
      const currentState = usePageStore.getState()
      if (editingContext === 'page' && currentState.canvasItems.length === 0 && !currentState.isEditingLoadedWebsite) {
        debugLog('log', '📄 Empty canvas detected - loading starter section')
        
        // Create a simple one-column section as a starting point
        const starterSection = {
          id: nanoid(),
          name: 'Section',
          type: 'content-block' as const,
          layout: 'one-column' as const,
          areas: [
            {
              id: nanoid(),
              name: 'Content',
              widgets: []
            }
          ],
          styling: {
            paddingTop: 'medium' as const,
            paddingBottom: 'medium' as const,
            paddingLeft: 'medium' as const,
            paddingRight: 'medium' as const,
            gap: 'medium' as const,
            variant: 'full-width' as const,
            textColor: 'default' as const
          },
          background: {
            type: 'color' as const,
            color: '#ffffff',
            opacity: 1
          }
        }
        
        replaceCanvasItems([starterSection])
        setIsEditingLoadedWebsite(false) // Mark as blank canvas (not a loaded website)
        showToast('Starter section loaded - drag widgets from the library to begin', 'success')
      }
    }, 100) // Small delay to let external content load first
    
    return () => clearTimeout(timer)
  }, []) // Only run once on mount
  
  // Route-specific canvas saving for individual issue edits
  useEffect(() => {
    // Save canvas changes to route-specific storage when editing individual issues
    if (isIndividualIssueEdit && canvasItems.length > 0) {
      debugLog('log','💾 Saving individual issue changes to route:', mockLiveSiteRoute)
      debugLog('log','📦 Canvas items being saved:', canvasItems.length, 'items')
      setCanvasItemsForRoute(mockLiveSiteRoute, canvasItems)
      
      // Track modification for divergence management
      if (journalCode && trackModification) {
        debugLog('log','📊 Tracking template modification for:', journalName, '(', journalCode, ')')
        debugLog('log','📊 Route:', mockLiveSiteRoute, 'Template ID: table-of-contents')
        trackModification(mockLiveSiteRoute, journalCode, journalName, 'table-of-contents')
      } else {
        debugLog('warn','⚠️ Tracking skipped:', { journalCode, hasTrackFn: !!trackModification })
      }
    } else {
      debugLog('log','⏭️ Save skipped:', { isIndividualIssueEdit, canvasItemsLength: canvasItems.length })
    }
  }, [canvasItems, isIndividualIssueEdit, mockLiveSiteRoute, setCanvasItemsForRoute, journalCode, journalName, trackModification])
  
  // Global template canvas saving
  useEffect(() => {
    // Save canvas changes to global template storage when editing global templates
    if (isGlobalTemplateEdit && canvasItems.length > 0) {
      debugLog('log','🌍 Saving global template changes:', canvasItems.length, 'items')
      setGlobalTemplateCanvas(canvasItems)
    }
  }, [canvasItems, isGlobalTemplateEdit, setGlobalTemplateCanvas])
  
  // Journal template canvas saving
  useEffect(() => {
    // Save canvas changes to journal template storage when editing journal templates
    if (isJournalTemplateEdit && templateEditingContext?.journalCode && canvasItems.length > 0) {
      debugLog('log','📚 Saving journal template changes for', templateEditingContext.journalCode + ':', canvasItems.length, 'items')
      setJournalTemplateCanvas(templateEditingContext.journalCode, canvasItems)
      
      // Track journal template modification for divergence management
      if (trackModification) {
        const route = `journal/${templateEditingContext.journalCode}`
        debugLog('log','📊 Tracking journal template modification for:', journalName, '(', templateEditingContext.journalCode, ')')
        debugLog('log','📊 Route:', route, 'Template ID: table-of-contents')
        trackModification(route, templateEditingContext.journalCode, journalName, 'table-of-contents')
      }
    }
  }, [canvasItems, isJournalTemplateEdit, templateEditingContext?.journalCode, setJournalTemplateCanvas, journalName, trackModification])
  
  const handleCreateSchema = (type: SchemaOrgType) => {
    setCreatingSchemaType(type)
    selectWidget(null) // Clear widget selection
    selectSchemaObject(null) // Clear schema selection to trigger new form
  }
  
  const handleSaveSchema = (data: Omit<SchemaObject, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (selectedSchemaObject) {
      // Updating existing schema
      updateSchemaObject(selectedSchemaObject.id, data)
      addNotification({
        type: 'success',
        title: 'Schema Updated',
        message: `${data.name} has been updated successfully`
      })
    } else {
      // Creating new schema
      addSchemaObject(data)
      addNotification({
        type: 'success',
        title: 'Schema Created',
        message: `${data.name} has been created successfully`
      })
    }
    setCreatingSchemaType(null)
    selectSchemaObject(null)
  }
  
  const handleCancelSchema = () => {
    setCreatingSchemaType(null)
    selectSchemaObject(null)
  }
  
  // Template sections handler
  const handleTemplateSectionsLoad = (sections: WidgetSection[]) => {
    debugLog('log','🏗️ Loading template sections:', sections)
    replaceCanvasItems(sections)
    // Removed notification toast - banner shows template status instead
  }
  
  const handleSetActiveSectionToolbar = (value: string | null) => {
    setActiveSectionToolbar(value)
  }
  
  // Show toast notification - DISABLED for cleaner prototype experience
  const showToast = (_message: string, _type: 'success' | 'error') => {
    // Toast notifications disabled - uncomment below to re-enable
    // setToast({ message: _message, type: _type })
    // setTimeout(() => setToast(null), 3000)
  }
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  )
  
  // Custom collision detection that prioritizes tab-panel/collapse-panel first, then section-area drop zones
  const customCollisionDetection = (args: any) => {
    const activeType = args.active?.data?.current?.type
    
    // DEBUG: Log all available droppable containers
    if (activeType === 'library-widget') {
      debugLog('log', '📍 ALL DROPPABLE CONTAINERS:', args.droppableContainers.map((c: any) => ({
        id: c.id,
        type: c.data?.current?.type,
        sectionId: c.data?.current?.sectionId,
        areaId: c.data?.current?.areaId
      })))
    }
    
    // FIRST: Try to find tab-panel or collapse-panel collisions (most specific, highest priority)
    const containerPanelCollisions = rectIntersection({
      ...args,
      droppableContainers: args.droppableContainers.filter((container: any) => 
        container.data?.current?.type === 'tab-panel' || 
        container.data?.current?.type === 'collapse-panel'
      )
    })
    
    if (containerPanelCollisions.length > 0) {
      debugLog('log','🎯 Tab/Collapse panel collision detected!', containerPanelCollisions)
      return containerPanelCollisions
    }
    
    // SECOND: For section-widgets AND library-widgets, PRIORITIZE widget-target collisions (for precise positioning)
    if (activeType === 'section-widget' || activeType === 'library-widget') {
      const widgetTargetCollisions = rectIntersection({
        ...args,
        droppableContainers: args.droppableContainers.filter((container: any) => 
          container.data?.current?.type === 'widget-target'
        )
      })
      
        if (widgetTargetCollisions.length > 0) {
          // Dropping ON a specific widget - insert before it
          return widgetTargetCollisions
        }
    }
    
    // THIRD: For library widgets and section-widgets, try section-area collisions using POINTER position
    // This way the CURSOR position matters, not the widget's bounding box
    if (activeType === 'library-widget' || activeType === 'section-widget') {
      const sectionAreaCollisions = pointerWithin({
        ...args,
        droppableContainers: args.droppableContainers.filter((container: any) => 
          container.data?.current?.type === 'section-area'
        )
      })
      
      if (sectionAreaCollisions.length > 0) {
        // Collision detected for widget drop based on cursor position
        debugLog('log', '✅ Section-area collision detected:', sectionAreaCollisions.map((c: any) => ({
          id: c.id,
          sectionId: c.data?.current?.sectionId,
          areaId: c.data?.current?.areaId
        })))
        return sectionAreaCollisions
      }
    }
    
    // FOURTH: Try to find section-area collisions for other items using pointer position
    const sectionAreaCollisions = pointerWithin({
      ...args,
      droppableContainers: args.droppableContainers.filter((container: any) => 
        container.data?.current?.type === 'section-area'
      )
    })
    
    if (sectionAreaCollisions.length > 0) {
      return sectionAreaCollisions
    }
    
    // Fall back to closest center (for section reordering, etc.)
    return closestCenter(args)
  }
  
  const handleDragStart = (event: DragStartEvent) => {
    const draggedItem = event.active.data?.current?.item
    const isSidebar = draggedItem && isSection(draggedItem) && draggedItem.type === 'sidebar'
    
    // Set active drag item for DragOverlay
    setActiveDragItem({
      widget: draggedItem,
      type: event.active.data?.current?.type,
      item: draggedItem
    })
    
    debugLog('log','🚀 Drag Start:', {
      activeId: event.active.id,
      activeType: event.active.data?.current?.type,
      activeData: event.active.data?.current,
      activeItem: draggedItem,
      isSidebar: isSidebar,
      sidebarName: isSidebar ? draggedItem.name : 'not a sidebar'
    })
    
    if (isSidebar) {
      debugLog('log','🎯 SIDEBAR DRAG DETECTED! Setting up special highlighting...')
    }
    
    // Log all available drop zones for debugging
    const dropZones = document.querySelectorAll('[data-droppable="true"]')
    debugLog('log','📍 Available drop zones:', Array.from(dropZones).map(zone => ({
      id: zone.getAttribute('data-droppable-id') || zone.id,
      classes: zone.className,
      rect: zone.getBoundingClientRect()
    })))
  }
  
  const handleDragOver = (event: DragOverEvent) => {
    if (event.over) {
      const activeItem = event.active.data?.current?.item
      const isDraggingSidebar = activeItem && isSection(activeItem) && activeItem.type === 'sidebar'
      
      // Special logging for tab panels and collapse panels
      if (event.over.data?.current?.type === 'tab-panel') {
        debugLog('log','🎯 DRAGGING OVER TAB PANEL!', {
          tabId: event.over.data.current.tabId,
          widgetId: event.over.data.current.widgetId,
          activeType: event.active.data?.current?.type
        })
      }
      
      if (event.over.data?.current?.type === 'collapse-panel') {
        debugLog('log','🎯 DRAGGING OVER COLLAPSE PANEL!', {
          panelId: event.over.data.current.panelId,
          widgetId: event.over.data.current.widgetId,
          activeType: event.active.data?.current?.type
        })
      }
      
      // DEBUG: Log what we're detecting
      debugLog('log','🔍 Drag Over Debug:', {
        activeId: event.active.id,
        activeType: event.active.data?.current?.type,
        activeItem: activeItem,
        isDraggingSidebar: isDraggingSidebar,
        sidebarType: activeItem?.type,
        overType: event.over.data?.current?.type
      })
      
      if (isDraggingSidebar) {
        // For sidebar dragging, convert section-area drops to section-level drops
        if (event.over.data?.current?.type === 'section-area') {
          const sectionId = event.over.data?.current?.sectionId
          if (activeDropZone !== sectionId) {
            setActiveDropZone(sectionId)
            debugLog('log','🎯 Sidebar drop zone detected (converted to section-level):', {
              activeId: event.active.id,
              dropZone: sectionId,
              originalAreaId: event.over.id
            })
          }
        } else if (event.over.data?.current?.type === 'section') {
          const dropZoneId = event.over.id as string
          if (activeDropZone !== dropZoneId) {
            setActiveDropZone(dropZoneId)
            debugLog('log','🎯 Sidebar drop zone detected (section-level):', {
              activeId: event.active.id,
              dropZone: dropZoneId,
              sectionId: event.over.id
            })
          }
        } else {
          // Clear highlight when not over a section or section-area
          if (activeDropZone) {
            setActiveDropZone(null)
          }
        }
      } else {
        // Normal behavior for other items - highlight section-area drop zones
        if (event.over.data?.current?.type === 'section-area') {
          const dropZoneId = event.over.id as string
          if (activeDropZone !== dropZoneId) {
            setActiveDropZone(dropZoneId)
            debugLog('log','🎯 Drop zone detected:', {
              activeId: event.active.id,
              activeType: event.active.data?.current?.type,
              dropZone: dropZoneId,
              sectionId: event.over.data?.current?.sectionId,
              areaId: event.over.data?.current?.areaId
            })
          }
        } else {
          // Clear highlight when not over a section-area
          if (activeDropZone) {
            setActiveDropZone(null)
          }
        }
      }
    } else {
      // Clear highlight when not over anything
      if (activeDropZone) {
        setActiveDropZone(null)
      }
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    // Clear active drag item and drop zone highlighting
    setActiveDragItem(null)
    setActiveDropZone(null)
    
    debugLog('log','🎯 Drag End Event:', {
      activeId: active.id,
      activeType: active.data?.current?.type,
      overId: over?.id,
      overType: over?.data?.current?.type,
      overData: over?.data?.current,
      hasOver: !!over,
      isLibraryWidget: active.data?.current?.type === 'library-widget',
      isSortableItem: !active.data?.current?.type || active.data?.current?.type === 'sortable',
      isTabPanel: over?.data?.current?.type === 'tab-panel',
      isCollapsePanel: over?.data?.current?.type === 'collapse-panel'
    })

    if (!over) {
      debugLog('log','❌ No drop target found')
      return
    }
    
    // Log tab panel detection
    if (over?.data?.current?.type === 'tab-panel') {
      debugLog('log','✨ TAB PANEL DETECTED!', {
        tabId: over.data.current.tabId,
        widgetId: over.data.current.widgetId,
        activeType: active.data?.current?.type
      })
    }

    // Handle library widget drop - AUTO-CREATE SECTION with the widget
    if (active.data?.current?.type === 'library-widget') {
      debugLog('log','📦 Library widget detected!', {
        libraryItem: active.data.current.item,
        overType: over.data?.current?.type,
        overId: over.id
      })
      
      const libraryItem = active.data.current.item
      const { replaceCanvasItems, canvasItems } = usePageStore.getState()
      
      // Case 0: Dropped into tab panel (HIGHEST PRIORITY)
      if (over.data?.current?.type === 'tab-panel') {
        debugLog('log','✅ Library widget dropped into tab panel!', {
          libraryItem,
          tabId: over.data.current.tabId,
          widgetId: over.data.current.widgetId
        })
        
        const tabId = over.data.current.tabId
        const tabsWidgetId = over.data.current.widgetId
        
        // Create new widget from library item
        const newWidget = buildWidget(libraryItem)
        
        debugLog('log','🔧 Created widget:', newWidget.type, newWidget.id, 'for tab:', tabId)
        
        // Find the tabs widget and the specific tab, update it with the new widget
        const updatedCanvasItems = canvasItems.map((canvasItem: CanvasItem) => {
          // Check if this is the tabs widget (standalone)
          if (canvasItem.type === 'tabs' && canvasItem.id === tabsWidgetId) {
            const tabsWidget = canvasItem as any // TabsWidget
            const tabIndex = tabsWidget.tabs.findIndex((t: any) => t.id === tabId)
            
            if (tabIndex !== -1) {
              const updatedTabs = [...tabsWidget.tabs]
              updatedTabs[tabIndex] = {
                ...updatedTabs[tabIndex],
                widgets: [...(updatedTabs[tabIndex].widgets || []), newWidget]
              }
              
              debugLog('log','🎯 Setting activeTabIndex to:', tabIndex, 'for dropped widget (standalone)')
              debugLog('log','📦 Tabs before update:', tabsWidget.tabs)
              debugLog('log','📦 Tabs after update:', updatedTabs)
              
              return {
                ...tabsWidget,
                tabs: updatedTabs,
                activeTabIndex: tabIndex
              }
            }
          }
          
          // Check if the tabs widget is inside a section
          if (isSection(canvasItem)) {
            const section = canvasItem as WidgetSection
            let foundAndUpdated = false
            
            const updatedAreas = section.areas.map((area: any) => {
              const updatedWidgets = area.widgets.map((widget: any) => {
                if (widget.type === 'tabs' && widget.id === tabsWidgetId) {
                  foundAndUpdated = true
                  const tabIndex = widget.tabs.findIndex((t: any) => t.id === tabId)
                  
                  if (tabIndex !== -1) {
                    const updatedTabs = [...widget.tabs]
                    updatedTabs[tabIndex] = {
                      ...updatedTabs[tabIndex],
                      widgets: [...(updatedTabs[tabIndex].widgets || []), newWidget]
                    }
                    
                    debugLog('log','🎯 Setting activeTabIndex to:', tabIndex, 'for dropped widget (in section)')
                    debugLog('log','📦 Tabs before update:', widget.tabs)
                    debugLog('log','📦 Tabs after update:', updatedTabs)
                    
                    return {
                      ...widget,
                      tabs: updatedTabs,
                      activeTabIndex: tabIndex
                    }
                  }
                }
                return widget
              })
              
              return { ...area, widgets: updatedWidgets }
            })
            
            if (foundAndUpdated) {
              return { ...section, areas: updatedAreas }
            }
          }
          
          return canvasItem
        })
        
        replaceCanvasItems(updatedCanvasItems)
        debugLog('log','✅ Widget added to tab panel!')
        return
      }
      
      // Case 0a: Dropped ON a specific widget (widget-target) - insert BEFORE that widget
      if (over.data?.current?.type === 'widget-target') {
        const targetWidgetId = over.data.current.widgetId
        const sectionId = over.data.current.sectionId
        const areaId = over.data.current.areaId
        
        // Create new widget from library item
        const newWidget = buildWidget(libraryItem)
        newWidget.sectionId = sectionId
        
        // First, check if this section is in siteLayout (global header/footer)
        const targetWebsite = websites.find((w: any) => w.id === currentWebsiteId)
        const targetSiteLayout = targetWebsite?.siteLayout
        const headerSection = targetSiteLayout?.header?.find((s: any) => s.id === sectionId)
        const footerSection = targetSiteLayout?.footer?.find((s: any) => s.id === sectionId)
        
        if (headerSection || footerSection) {
          // This is a global section - use siteLayout store action with insert position
          const sectionType = headerSection ? 'header' : 'footer'
          debugLog('log', '🌐 Widget-target drop in global siteLayout (' + sectionType + ')')
          const { insertWidgetInSiteLayout } = usePageStore.getState()
          insertWidgetInSiteLayout(currentWebsiteId, sectionType, sectionId, areaId, newWidget, targetWidgetId)
          debugLog('log', '✅ Widget inserted before target in global ' + sectionType + '!')
          return
        }
        
        const updatedCanvasItems = canvasItems.map((canvasItem: CanvasItem) => {
          if (isSection(canvasItem) && canvasItem.id === sectionId) {
            return {
              ...canvasItem,
              areas: (canvasItem as WidgetSection).areas.map((area: any) => {
                if (area.id === areaId) {
                  const widgets = [...area.widgets]
                  const targetIndex = widgets.findIndex((w: any) => w.id === targetWidgetId)
                  
                  if (targetIndex !== -1) {
                    // Insert BEFORE the target widget
                    widgets.splice(targetIndex, 0, newWidget)
                  } else {
                    // Fallback: add at end if target not found
                    widgets.push(newWidget)
                  }
                  
                  return { ...area, widgets }
                }
                return area
              })
            }
          }
          return canvasItem
        })
        
        replaceCanvasItems(updatedCanvasItems)
        return
      }
      
      // Case 0b: Dropped into collapse panel (HIGHEST PRIORITY, similar to tab panel)
      if (over.data?.current?.type === 'collapse-panel') {
        debugLog('log','✅ Library widget dropped into collapse panel!', {
          libraryItem,
          panelId: over.data.current.panelId,
          widgetId: over.data.current.widgetId
        })
        
        const panelId = over.data.current.panelId
        const collapseWidgetId = over.data.current.widgetId
        
        // Create new widget from library item
        const newWidget = buildWidget(libraryItem)
        
        debugLog('log','🔧 Created widget:', newWidget.type, newWidget.id, 'for collapse panel:', panelId)
        
        // Find the collapse widget and the specific panel, update it with the new widget
        const updatedCanvasItems = canvasItems.map((canvasItem: CanvasItem) => {
          // Check if this is the collapse widget (standalone)
          if (canvasItem.type === 'collapse' && canvasItem.id === collapseWidgetId) {
            const collapseWidget = canvasItem as any // CollapseWidget
            const panelIndex = collapseWidget.panels.findIndex((p: any) => p.id === panelId)
            
            if (panelIndex !== -1) {
              const updatedPanels = [...collapseWidget.panels]
              updatedPanels[panelIndex] = {
                ...updatedPanels[panelIndex],
                widgets: [...(updatedPanels[panelIndex].widgets || []), newWidget]
              }
              
              debugLog('log','📦 Panels after update:', updatedPanels)
              
              return {
                ...collapseWidget,
                panels: updatedPanels
              }
            }
          }
          
          // Check if the collapse widget is inside a section
          if (isSection(canvasItem)) {
            const section = canvasItem as WidgetSection
            let foundAndUpdated = false
            
            const updatedAreas = section.areas.map((area: any) => {
              const updatedWidgets = area.widgets.map((widget: any) => {
                if (widget.type === 'collapse' && widget.id === collapseWidgetId) {
                  foundAndUpdated = true
                  const panelIndex = widget.panels.findIndex((p: any) => p.id === panelId)
                  
                  if (panelIndex !== -1) {
                    const updatedPanels = [...widget.panels]
                    updatedPanels[panelIndex] = {
                      ...updatedPanels[panelIndex],
                      widgets: [...(updatedPanels[panelIndex].widgets || []), newWidget]
                    }
                    
                    debugLog('log','📦 Panels after update (in section):', updatedPanels)
                    
                    return {
                      ...widget,
                      panels: updatedPanels
                    }
                  }
                }
                return widget
              })
              
              return { ...area, widgets: updatedWidgets }
            })
            
            if (foundAndUpdated) {
              return { ...section, areas: updatedAreas }
            }
          }
          
          return canvasItem
        })
        
        replaceCanvasItems(updatedCanvasItems)
        debugLog('log','✅ Widget added to collapse panel!')
        return
      }
      
      // Case 1: Dropped into existing section area (old behavior for backwards compatibility)
      if (over.data?.current?.type === 'section-area') {
        debugLog('log','✅ Library widget dropped into existing section area!')
        debugLog('log','📦 Target section:', over.data.current.sectionId)
        debugLog('log','📦 Target area:', over.data.current.areaId)
        const sectionId = over.data.current.sectionId
        const areaId = over.data.current.areaId
        
        // Create new widget from library item
        const newWidget = buildWidget(libraryItem)
        newWidget.sectionId = sectionId
        
        // First, check if this section is in siteLayout (global header/footer)
        const targetWebsite = websites.find((w: any) => w.id === currentWebsiteId)
        const targetSiteLayout = targetWebsite?.siteLayout
        const headerSection = targetSiteLayout?.header?.find((s: any) => s.id === sectionId)
        const footerSection = targetSiteLayout?.footer?.find((s: any) => s.id === sectionId)
        
        if (headerSection || footerSection) {
          // This is a global section - use siteLayout store action
          const sectionType = headerSection ? 'header' : 'footer'
          debugLog('log', '🌐 Section is in global siteLayout (' + sectionType + ')')
          const { addWidgetToSiteLayout } = usePageStore.getState()
          addWidgetToSiteLayout(currentWebsiteId, sectionType, sectionId, areaId, newWidget)
          debugLog('log', '✅ Widget added to global ' + sectionType + '!')
          return
        }
        
        // DEBUG: Log current canvas sections
        debugLog('log', '📋 Current canvas sections:', canvasItems.map((item: CanvasItem) => ({
          id: item.id,
          type: item.type,
          name: isSection(item) ? (item as WidgetSection).name : 'N/A',
          areas: isSection(item) ? (item as WidgetSection).areas.map(a => ({ id: a.id, name: a.name, widgetCount: a.widgets.length })) : []
        })))
        debugLog('log', '🎯 Looking for section:', sectionId, 'area:', areaId)
        
        let sectionFound = false
        let areaFound = false
        
        const updatedCanvasItems = canvasItems.map((canvasItem: CanvasItem) => {
          if (isSection(canvasItem) && canvasItem.id === sectionId) {
            sectionFound = true
            debugLog('log', '✅ Section FOUND:', canvasItem.id, '-', (canvasItem as WidgetSection).name)
            const updatedSection = {
              ...canvasItem,
              areas: (canvasItem as WidgetSection).areas.map((area: any) => {
                if (area.id === areaId) {
                  areaFound = true
                  debugLog('log', '✅ Area FOUND:', area.id, '-', area.name)
                  debugLog('log', '📝 BEFORE: Area has', area.widgets.length, 'widgets')
                  const updatedArea = { ...area, widgets: [...area.widgets, newWidget] }
                  debugLog('log', '📝 AFTER: Area has', updatedArea.widgets.length, 'widgets')
                  debugLog('log', '📝 Widget added at position:', area.widgets.length, '(end of array)')
                  return updatedArea
                }
                return area
              })
            }
            return updatedSection
          }
          return canvasItem
        })
        
        if (!sectionFound) {
          debugLog('error', '❌ ERROR: Section NOT FOUND with ID:', sectionId)
        }
        if (sectionFound && !areaFound) {
          debugLog('error', '❌ ERROR: Area NOT FOUND with ID:', areaId)
        }
        
        replaceCanvasItems(updatedCanvasItems)
        return
      }
      
      // Case 2: Dropped on canvas or section - AUTO-CREATE one-column section
      debugLog('log','🎯 Auto-creating one-column section for library widget!')
      
      // Create new widget
      const newWidget = buildWidget(libraryItem)
      
      // Create new one-column section with the widget
      const newSectionId = nanoid()
      const newAreaId = nanoid()
      newWidget.sectionId = newSectionId
      
      const newSection: WidgetSection = {
        id: newSectionId,
        type: 'content-block',
        name: `Section with ${libraryItem.label || newWidget.type}`,
        layout: 'one-column',
        areas: [
          {
            id: newAreaId,
            name: 'Content',
            widgets: [newWidget]
          }
        ],
        styling: {
          paddingTop: 'medium',
          paddingBottom: 'medium',
          paddingLeft: 'medium',
          paddingRight: 'medium',
          gap: 'medium'
        }
      }
      
      // Find insertion position based on where it was dropped
      let insertIndex = canvasItems.length // Default: add to end
      
      if (over?.id) {
        // If dropped over a section, insert after it
        const overSectionIndex = canvasItems.findIndex((item: CanvasItem) => item.id === over.id)
        if (overSectionIndex !== -1) {
          insertIndex = overSectionIndex + 1
          debugLog('log','📍 Inserting section after existing section at index:', insertIndex)
        }
      }
      
      const newCanvasItems = [...canvasItems]
      newCanvasItems.splice(insertIndex, 0, newSection)
      
      debugLog('log','✅ Created new section with widget:', {
        sectionId: newSectionId,
        widgetType: newWidget.type,
        widgetId: newWidget.id,
        insertIndex
      })
      
      replaceCanvasItems(newCanvasItems)
      return
    }
    
    // Handle standalone widget drop into section area (the missing scenario!)
    if ((active.data?.current?.type === 'canvas-widget' || 
         active.data?.current?.type === 'standalone-widget' || 
         !active.data?.current?.type || 
         active.data?.current?.type === 'sortable') && 
        over.data?.current?.type === 'section-area') {
      debugLog('log','✅ Standalone widget dropped into section area!')
      
      // Get widget from drag data if available, otherwise find by ID
      let widget: Widget
      if (active.data?.current?.type === 'canvas-widget') {
        widget = active.data.current.item as Widget
      } else if (active.data?.current?.type === 'standalone-widget') {
        widget = active.data.current.widget
      } else {
        const widgetId = active.id as string
        const { canvasItems } = usePageStore.getState()
        const foundWidget = canvasItems.find((item: CanvasItem) => item.id === widgetId && !isSection(item))
        if (!foundWidget) {
          debugLog('log','❌ Standalone widget not found')
          return
        }
        widget = foundWidget as Widget
      }
      
      const sectionId = over.data.current.sectionId
      const areaId = over.data.current.areaId
      const { replaceCanvasItems, canvasItems } = usePageStore.getState()
      
      // Remove widget from canvas and add to section area
      const newCanvasItems = canvasItems.filter((item: CanvasItem) => item.id !== widget.id)
      const updatedCanvasItems = newCanvasItems.map((canvasItem: CanvasItem) => {
        if (isSection(canvasItem) && canvasItem.id === sectionId) {
          const updatedWidget = { ...widget, sectionId: sectionId }
          return {
            ...canvasItem,
            areas: (canvasItem as WidgetSection).areas.map((area: any) => 
              area.id === areaId 
                ? { ...area, widgets: [...area.widgets, updatedWidget] }
                : area
            )
          }
        }
        return canvasItem
      })
      replaceCanvasItems(updatedCanvasItems)
      return
    }
    
    // Handle section widget movement - PRIORITY: section-widget drags should never go to canvas reordering
    if (active.data?.current?.type === 'section-widget') {
      debugLog('log','🚀 Section widget detected, checking drop location...', { 
        overId: over?.id, 
        overType: over?.data?.current?.type,
        overData: over?.data?.current 
      })
      
      // Case 0: Dropped ON a specific widget (widget-target) - insert BEFORE that widget
      if (over.data?.current?.type === 'widget-target') {
        const draggedWidget = active.data.current.widget
        const fromSectionId = active.data.current.fromSectionId
        const fromAreaId = active.data.current.fromAreaId
        const targetWidgetId = over.data.current.widgetId
        const targetSectionId = over.data.current.sectionId
        const targetAreaId = over.data.current.areaId
        
        // Check if moving within same area
        const isSameArea = fromSectionId === targetSectionId && fromAreaId === targetAreaId
        
        const { replaceCanvasItems, canvasItems } = usePageStore.getState()
        
        const updatedCanvasItems = canvasItems.map((canvasItem: CanvasItem) => {
          if (isSection(canvasItem)) {
            return {
              ...canvasItem,
              areas: (canvasItem as WidgetSection).areas.map((area: any) => {
                // Handle same-area reordering
                if (isSameArea && area.id === fromAreaId && canvasItem.id === fromSectionId) {
                  const widgets = [...area.widgets]
                  const fromIndex = widgets.findIndex((w: any) => w.id === draggedWidget.id)
                  const toIndex = widgets.findIndex((w: any) => w.id === targetWidgetId)
                  
                  if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
                    // Remove from current position
                    const [movedWidget] = widgets.splice(fromIndex, 1)
                    // Insert at new position (adjust if moving forward)
                    const adjustedToIndex = fromIndex < toIndex ? toIndex - 1 : toIndex
                    widgets.splice(adjustedToIndex, 0, movedWidget)
                  }
                  
                  return { ...area, widgets }
                }
                
                // Handle cross-area moves: Remove from source area
                if (!isSameArea && area.id === fromAreaId && canvasItem.id === fromSectionId) {
                  const widgets = area.widgets.filter((w: Widget) => w.id !== draggedWidget.id)
                  return { ...area, widgets }
                }
                
                // Handle cross-area moves: Insert into target area BEFORE target widget
                if (!isSameArea && area.id === targetAreaId && canvasItem.id === targetSectionId) {
                  const widgets = [...area.widgets]
                  const targetIndex = widgets.findIndex((w: any) => w.id === targetWidgetId)
                  
                  if (targetIndex !== -1) {
                    // Make sure sectionId is updated
                    const widgetToInsert = { ...draggedWidget, sectionId: targetSectionId }
                    // Insert BEFORE the target widget
                    widgets.splice(targetIndex, 0, widgetToInsert)
                  } else {
                    // Fallback: add at end if target not found
                    widgets.push({ ...draggedWidget, sectionId: targetSectionId })
                  }
                  
                  return { ...area, widgets }
                }
                
                return area
              })
            }
          }
          return canvasItem
        })
        
        replaceCanvasItems(updatedCanvasItems)
        return
      }
      
      // Case 0a: Dropped into tab panel
      if (over?.data?.current?.type === 'tab-panel') {
        debugLog('log','✅ Moving existing widget into tab panel!')
        const draggedWidget = active.data.current.widget
        const fromAreaId = active.data.current.fromAreaId
        const tabId = over.data.current.tabId
        const tabsWidgetId = over.data.current.widgetId
        
        const { replaceCanvasItems, canvasItems } = usePageStore.getState()
        
        // Remove from source area and add to tab panel
        const updatedCanvasItems = canvasItems.map((canvasItem: CanvasItem) => {
          // Update sections to remove widget from source area
          if (isSection(canvasItem)) {
            return {
              ...canvasItem,
              areas: (canvasItem as WidgetSection).areas.map((area: any) => {
                if (area.id === fromAreaId) {
                  return { ...area, widgets: area.widgets.filter((w: Widget) => w.id !== draggedWidget.id) }
                }
                
                // Also check if this area contains the tabs widget that needs updating
                const updatedWidgets = area.widgets.map((widget: any) => {
                  if (widget.type === 'tabs' && widget.id === tabsWidgetId) {
                    const tabIndex = widget.tabs.findIndex((t: any) => t.id === tabId)
                    if (tabIndex !== -1) {
                      const updatedTabs = [...widget.tabs]
                      updatedTabs[tabIndex] = {
                        ...updatedTabs[tabIndex],
                        widgets: [...(updatedTabs[tabIndex].widgets || []), draggedWidget]
                      }
                      return { ...widget, tabs: updatedTabs, activeTabIndex: tabIndex }
                    }
                  }
                  return widget
                })
                
                return { ...area, widgets: updatedWidgets }
              })
            }
          }
          
          // Also check standalone tabs widgets
          if (canvasItem.type === 'tabs' && canvasItem.id === tabsWidgetId) {
            const tabsWidget = canvasItem as any
            const tabIndex = tabsWidget.tabs.findIndex((t: any) => t.id === tabId)
            if (tabIndex !== -1) {
              const updatedTabs = [...tabsWidget.tabs]
              updatedTabs[tabIndex] = {
                ...updatedTabs[tabIndex],
                widgets: [...(updatedTabs[tabIndex].widgets || []), draggedWidget]
              }
              return { ...tabsWidget, tabs: updatedTabs, activeTabIndex: tabIndex }
            }
          }
          
          return canvasItem
        })
        
        replaceCanvasItems(updatedCanvasItems)
        debugLog('log','✅ Widget moved into tab panel!')
        return
      }
      
      // Case 0b: Dropped into collapse panel
      if (over?.data?.current?.type === 'collapse-panel') {
        debugLog('log','✅ Moving existing widget into collapse panel!')
        const draggedWidget = active.data.current.widget
        const fromAreaId = active.data.current.fromAreaId
        const panelId = over.data.current.panelId
        const collapseWidgetId = over.data.current.widgetId
        
        const { replaceCanvasItems, canvasItems } = usePageStore.getState()
        
        // Remove from source area and add to collapse panel
        const updatedCanvasItems = canvasItems.map((canvasItem: CanvasItem) => {
          // Update sections to remove widget from source area
          if (isSection(canvasItem)) {
            return {
              ...canvasItem,
              areas: (canvasItem as WidgetSection).areas.map((area: any) => {
                if (area.id === fromAreaId) {
                  return { ...area, widgets: area.widgets.filter((w: Widget) => w.id !== draggedWidget.id) }
                }
                
                // Also check if this area contains the collapse widget that needs updating
                const updatedWidgets = area.widgets.map((widget: any) => {
                  if (widget.type === 'collapse' && widget.id === collapseWidgetId) {
                    const panelIndex = widget.panels.findIndex((p: any) => p.id === panelId)
                    if (panelIndex !== -1) {
                      const updatedPanels = [...widget.panels]
                      updatedPanels[panelIndex] = {
                        ...updatedPanels[panelIndex],
                        widgets: [...(updatedPanels[panelIndex].widgets || []), draggedWidget]
                      }
                      return { ...widget, panels: updatedPanels }
                    }
                  }
                  return widget
                })
                
                return { ...area, widgets: updatedWidgets }
              })
            }
          }
          
          // Also check standalone collapse widgets
          if (canvasItem.type === 'collapse' && canvasItem.id === collapseWidgetId) {
            const collapseWidget = canvasItem as any
            const panelIndex = collapseWidget.panels.findIndex((p: any) => p.id === panelId)
            if (panelIndex !== -1) {
              const updatedPanels = [...collapseWidget.panels]
              updatedPanels[panelIndex] = {
                ...updatedPanels[panelIndex],
                widgets: [...(updatedPanels[panelIndex].widgets || []), draggedWidget]
              }
              return { ...collapseWidget, panels: updatedPanels }
            }
          }
          
          return canvasItem
        })
        
        replaceCanvasItems(updatedCanvasItems)
        debugLog('log','✅ Widget moved into collapse panel!')
        return
      }
      
      // Case 1: Dropped on specific section area OR on a widget
      if (over?.data?.current?.type === 'section-area' || over?.data?.current?.type === 'widget-target') {
        const draggedWidget = active.data.current.widget
        const fromAreaId = active.data.current.fromAreaId
        const toAreaId = over.data.current.areaId
        
        debugLog('log', '🎯 Section widget dropped on area:', {
          widgetType: draggedWidget.type,
          widgetId: draggedWidget.id,
          fromAreaId,
          toAreaId,
          dropType: over.data.current.type,
          targetSectionId: over.data.current.sectionId
        })
        
        // Handle reordering within the same area - detect drop position
        if (fromAreaId === toAreaId) {
          const { replaceCanvasItems, canvasItems } = usePageStore.getState()
          
          // Find the target section and area to get current widget positions
          const targetSection = canvasItems.find((item: CanvasItem) => isSection(item) && 
            (item as WidgetSection).areas.some(a => a.id === fromAreaId)
          ) as WidgetSection
          
          const targetArea = targetSection?.areas.find(a => a.id === fromAreaId)
          
          if (targetArea) {
            const widgets = [...targetArea.widgets]
            const oldIndex = widgets.findIndex((w: Widget) => w.id === draggedWidget.id)
            
            debugLog('log','📊 Widget positions BEFORE reorder:', {
              widgets: widgets.map((w, idx) => ({ index: idx, id: w.id, type: w.type })),
              draggingIndex: oldIndex,
              draggingWidget: draggedWidget.type,
              overId: over.id,
              overType: over.data?.current?.type
            })
            
            // Remove widget from current position
            const [movedWidget] = widgets.splice(oldIndex, 1)
            
            // Determine new position based on what we're dropping on
            let newIndex = widgets.length // Default: end
            
            // Check if we're dropping ON another widget (not just in the area)
            if (over.data?.current?.type === 'widget-target') {
              const targetWidgetId = over.data.current.widgetId
              // Find the index of the target widget (after removing the dragged widget)
              newIndex = widgets.findIndex((w: Widget) => w.id === targetWidgetId)
              if (newIndex !== -1) {
                debugLog('log','🎯 Dropping ON widget:', targetWidgetId, 'inserting at index:', newIndex)
              } else {
                newIndex = widgets.length
              }
            }
            
            // Insert at new position
            widgets.splice(newIndex, 0, movedWidget)
            
            debugLog('log','📊 Widget positions AFTER reorder:', {
              widgets: widgets.map((w, idx) => ({ index: idx, id: w.id, type: w.type })),
              oldIndex,
              newIndex: newIndex === widgets.length - 1 ? newIndex : newIndex, // Adjust for display
              moved: `${draggedWidget.type} moved from ${oldIndex} to ${newIndex}`
            })
            
            // Apply the changes
            const updatedCanvasItems = canvasItems.map((canvasItem: CanvasItem) => {
              if (isSection(canvasItem)) {
                return {
                  ...canvasItem,
                  areas: (canvasItem as WidgetSection).areas.map((area: any) => {
                    if (area.id === fromAreaId) {
                      return { ...area, widgets }
                    }
                    return area
                  })
                }
              }
              return canvasItem
            })
            replaceCanvasItems(updatedCanvasItems)
          }
          return
        }
        
        // Cross-section or cross-area move
        debugLog('log','✅ Moving widget to different section area!', {
          draggedWidget: draggedWidget.id,
          widgetType: draggedWidget.type,
          fromAreaId,
          toAreaId,
          targetSectionId: over.data.current.sectionId
        })
        
        const { replaceCanvasItems, canvasItems } = usePageStore.getState()
        
        // Verify the target section exists
        const targetSection = canvasItems.find((item: CanvasItem) => 
          isSection(item) && item.id === over.data.current?.sectionId
        )
        
        if (!targetSection) {
          debugLog('error','❌ Target section not found!', {
            expectedSectionId: over.data.current?.sectionId,
            availableSections: canvasItems.filter(isSection).map((s: any) => s.id)
          })
          return
        }
        
        debugLog('log','✅ Target section verified:', targetSection.id)
        
        const updatedCanvasItems = canvasItems.map((canvasItem: CanvasItem) => {
          if (isSection(canvasItem)) {
            return {
              ...canvasItem,
              areas: (canvasItem as WidgetSection).areas.map((area: any) => {
                // Remove from source area
                if (area.id === fromAreaId) {
                  debugLog('log','🗑️ Removing from source area:', fromAreaId, 'in section:', canvasItem.id)
                  return { ...area, widgets: area.widgets.filter((w: Widget) => w.id !== draggedWidget.id) }
                }
                // Add to target area with updated sectionId
                if (area.id === toAreaId) {
                  const updatedWidget = { ...draggedWidget, sectionId: over.data.current?.sectionId || '' }
                  debugLog('log','➕ Adding to target area:', toAreaId, 'in section:', over.data.current?.sectionId)
                  return { ...area, widgets: [...area.widgets, updatedWidget] }
                }
                return area
              })
            }
          }
          return canvasItem
        }).filter((item: CanvasItem | undefined): item is CanvasItem => item !== undefined)
        replaceCanvasItems(updatedCanvasItems)
        debugLog('log','✅ Widget moved between areas!')
        return
      }
      // Case 2: Dropped on section itself (find first available area)
      if (over?.data?.current?.type === 'section' || 
          (over?.id && typeof over.id === 'string' && canvasItems.some((item: CanvasItem) => item.id === over.id && isSection(item)))) {
        const targetSectionId = over.id as string
        debugLog('log','✅ Moving widget to section (first available area)!', { targetSectionId })
        const draggedWidget = active.data.current.widget
        const fromSectionId = active.data.current.fromSectionId
        const fromAreaId = active.data.current.fromAreaId
        
        debugLog('log','🎯 Cross-section move details:', {
          widgetId: draggedWidget.id,
          widgetType: draggedWidget.type,
          fromSectionId,
          fromAreaId,
          targetSectionId,
          isSameSection: fromSectionId === targetSectionId
        })
        
        // If dropping in the same section, don't do anything
        if (fromSectionId === targetSectionId) {
          debugLog('log','⚠️ Same section, no action needed')
          return
        }
        
        const { replaceCanvasItems, canvasItems } = usePageStore.getState()
        
        // Find the target section and its first area
        const targetSection = canvasItems.find((item: CanvasItem) => item.id === targetSectionId && isSection(item)) as WidgetSection
        if (!targetSection || !targetSection.areas.length) {
          debugLog('log','❌ Target section not found or has no areas', { 
            targetSectionId, 
            foundSection: !!targetSection,
            hasAreas: targetSection?.areas?.length 
          })
          return
        }
        
        const firstAreaId = targetSection.areas[0].id
        debugLog('log','🎯 Target section found, first area:', firstAreaId)
        
        const updatedCanvasItems = canvasItems.map((canvasItem: CanvasItem) => {
          if (isSection(canvasItem)) {
            return {
              ...canvasItem,
              areas: (canvasItem as WidgetSection).areas.map((area: any) => {
                // Remove from source area
                if (area.id === fromAreaId) {
                  debugLog('log','🗑️ Removing widget from area:', area.id)
                  return { ...area, widgets: area.widgets.filter((w: Widget) => w.id !== draggedWidget.id) }
                }
                // Add to target area (first area of target section)
                if (area.id === firstAreaId) {
                  const updatedWidget = { ...draggedWidget, sectionId: targetSectionId }
                  debugLog('log','➕ Adding widget to area:', area.id)
                  return { ...area, widgets: [...area.widgets, updatedWidget] }
                }
                return area
              })
            }
          }
          return canvasItem
        })
        replaceCanvasItems(updatedCanvasItems)
        debugLog('log','✅ Widget moved to section first area!')
        return
      }
      
      // Case 3: Section widget dropped somewhere invalid - just return without doing anything
      debugLog('log','⚠️ Section widget dropped in invalid location, ignoring', {
        overId: over?.id,
        overType: over?.data?.current?.type
      })
      return
    }

    // Handle sidebar reordering FIRST - before regular canvas reordering
    const draggedItem = active.data?.current?.item
    const isDraggingSidebar = draggedItem && isSection(draggedItem) && draggedItem.type === 'sidebar'
    
    if (isDraggingSidebar && (over.data?.current?.type === 'section' || over.data?.current?.type === 'section-area')) {
      const targetSectionId = over.data?.current?.type === 'section' 
        ? over.id 
        : over.data?.current?.sectionId
        
      debugLog('log','✅ Sidebar dropped for reordering!', {
        sidebarId: draggedItem.id,
        targetSectionId: targetSectionId,
        dropType: over.data?.current?.type
      })
      
      const { replaceCanvasItems, canvasItems } = usePageStore.getState()
      const targetIndex = canvasItems.findIndex((item: CanvasItem) => item.id === targetSectionId)
      const sidebarIndex = canvasItems.findIndex((item: CanvasItem) => item.id === draggedItem.id)
      
      if (targetIndex !== -1 && sidebarIndex !== -1) {
        // Move sidebar to just before the target section
        const newCanvasItems = [...canvasItems]
        const [movedSidebar] = newCanvasItems.splice(sidebarIndex, 1)
        newCanvasItems.splice(targetIndex, 0, movedSidebar)
        
        // Calculate what sections this sidebar will now span
        const sidebarSpan = movedSidebar.sidebar?.span || 2
        const spannedSectionIds = []
        
        // Find the next 'span' number of sections after the sidebar
        for (let i = targetIndex + 1; i < Math.min(newCanvasItems.length, targetIndex + 1 + sidebarSpan); i++) {
          const item = newCanvasItems[i]
          if (isSection(item) && item.type !== 'sidebar') {
            spannedSectionIds.push(item.id)
          }
        }
        
        debugLog('log','🔄 Sidebar repositioned successfully', {
          sidebarId: movedSidebar.id,
          newPosition: targetIndex,
          spannedSections: spannedSectionIds,
          spanCount: sidebarSpan
        })
        
        replaceCanvasItems(newCanvasItems)
        
        // Force a re-render to recalculate heights
        setTimeout(() => {
          debugLog('log','📐 Recalculating sidebar heights after repositioning')
        }, 100)
        
        return
      }
    }

    // Handle existing canvas item reordering (sections and standalone widgets) - EXCLUDE section-widgets and sidebars!
    if ((!active.data?.current?.type || 
        active.data?.current?.type === 'canvas-section' ||
        active.data?.current?.type === 'canvas-widget' ||
        active.data?.current?.type === 'standalone-widget' ||
        (active.data?.current?.type !== 'library-widget' && 
         active.data?.current?.type !== 'section-widget')) && !isDraggingSidebar) {
      debugLog('log','🔄 Attempting canvas item reordering for canvas items')
      
      // For standalone-widget type, use the original sortable ID for comparison
      const activeItemId = active.data?.current?.type === 'standalone-widget' 
        ? active.data.current.originalSortableId 
        : active.id
      
      // If dropping over a section area, get the section ID instead of the drop zone ID
      let targetId = over.id
      if (over.data?.current?.type === 'section-area' && over.data?.current?.sectionId) {
        targetId = over.data.current.sectionId
        debugLog('log','🎯 Section dragged over section area, using section ID:', targetId)
      }
      
      if (activeItemId !== targetId) {
        const { moveItem } = usePageStore.getState()
        const oldIndex = canvasItems.findIndex((item: CanvasItem) => item.id === activeItemId)
        const newIndex = canvasItems.findIndex((item: CanvasItem) => item.id === targetId)
        
        debugLog('log','📋 Canvas reorder:', { oldIndex, newIndex, activeItemId, targetId, originalOverId: over.id })
        
        if (oldIndex !== -1 && newIndex !== -1) {
          debugLog('log','✅ Canvas item reordered!')
          moveItem(oldIndex, newIndex)
        } else {
          debugLog('log','❌ Canvas item reorder failed - items not found')
        }
      }
    }
    
    
    // Debug: Catch unhandled drag cases
    debugLog('log','⚠️ Unhandled drag case:', {
      activeId: active.id,
      activeType: active.data?.current?.type,
      overId: over?.id,
      overType: over?.data?.current?.type,
      overData: over?.data?.current
    })
  }

  const handleAddSection = (relativeTo: string, position: 'above' | 'below') => {
    setInsertPosition({ relativeTo, position })
    setShowLayoutPicker(true)
  }

  const handleSelectLayout = (layout: ContentBlockLayout) => {
    createContentBlockWithLayout(layout)
    setShowLayoutPicker(false)
  }

  const handleSectionClick = (sectionId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Close any widget toolbar and toggle section toolbar
    setActiveWidgetToolbar(null)
    handleSetActiveSectionToolbar(activeSectionToolbar === sectionId ? null : sectionId)
    selectWidget(sectionId)
  }

  const handleWidgetClick = (widgetId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    debugLog('log','🖱️ Widget clicked for properties:', { widgetId })
    
    // Find the widget to check its sectionId - use same logic as Properties Panel
    let widget: Widget | undefined = canvasItems.find((item: CanvasItem) => item.id === widgetId && !isSection(item)) as Widget
    
    // If not found at canvas level, search within section areas
    if (!widget) {
      // Search in canvas sections
      for (const canvasItem of canvasItems) {
        if (isSection(canvasItem)) {
          for (const area of canvasItem.areas) {
            const foundWidget = area.widgets.find((w: Widget) => w.id === widgetId)
            if (foundWidget) {
              widget = foundWidget
              break
            }
          }
          if (widget) break
        }
      }
    }
    
    // Also search in header/footer sections (global sections)
    if (!widget) {
      const globalSections = [...headerSections, ...footerSections]
      for (const section of globalSections) {
        if (section.areas) {
          for (const area of section.areas) {
            const foundWidget = area.widgets?.find((w: Widget) => w.id === widgetId)
            if (foundWidget) {
              widget = foundWidget
              break
            }
          }
          if (widget) break
        }
      }
    }
    
    if (widget) {
      debugLog('log','📋 Widget found for properties:', { 
        id: widget.id, 
        type: widget.type,
        sectionId: widget.sectionId || 'standalone'
      })
    } else {
      debugLog('log','❌ Widget not found for properties:', { widgetId })
    }
    
    // Only close section toolbar if widget is not part of the currently active section
    if (!widget?.sectionId || activeSectionToolbar !== widget.sectionId) {
      handleSetActiveSectionToolbar(null)
    }
    
    setActiveWidgetToolbar(activeWidgetToolbar === widgetId ? null : widgetId)
    selectWidget(widgetId)
  }
  
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={customCollisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToWindowEdges]}
    >
      <div 
        className="h-screen bg-slate-50 flex overflow-hidden"
        style={{ 
          scrollBehavior: 'auto',
          scrollPaddingTop: 0,
          scrollMarginTop: 0
        }}
        onClick={(e) => {
          // Only close toolbars if clicking directly on this div, not on children
          if (e.target === e.currentTarget) {
            handleSetActiveSectionToolbar(null)
            setActiveWidgetToolbar(null)
          }
        }}
      >
        <div className="w-80 bg-slate-100 shadow-sm border-r border-slate-200 flex sticky top-0 h-screen">
          <div className="w-16 border-r border-slate-200 bg-slate-50">
            <div className="flex flex-col">
              {[
                { id: 'library', label: 'Library', icon: BookOpen },
                { id: 'sections', label: 'Sections', icon: Plus },
                { id: 'diy-zone', label: 'DIY Zone', icon: Lightbulb },
                { id: 'schema-content', label: 'Schema', icon: FileText }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setLeftSidebarTab(tab.id as LeftSidebarTab)}
                  className={`flex flex-col items-center gap-1 px-2 py-4 text-xs font-medium border-l-2 transition-colors ${
                    leftSidebarTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-slate-100'
                  }`}
                  title={tab.label}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="leading-none">{tab.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex-1 flex flex-col overflow-y-auto p-4">
            {leftSidebarTab === 'library' && <WidgetLibrary usePageStore={usePageStore} buildWidget={buildWidget} />}
            {leftSidebarTab === 'sections' && <SectionsContent showToast={showToast} usePageStore={usePageStore} />}
            {leftSidebarTab === 'diy-zone' && <DIYZoneContent showToast={showToast} usePageStore={usePageStore} buildWidget={buildWidget} />}
            {leftSidebarTab === 'schema-content' && <SchemaContentTab onCreateSchema={handleCreateSchema} usePageStore={usePageStore} selectSchemaObject={selectSchemaObject} />}
          </div>
        </div>

        <div 
          className="flex-1 flex flex-col h-screen overflow-y-auto"
          style={{
            scrollBehavior: 'auto',
            scrollPaddingTop: 0
          }}
        >
            <div className="border-b bg-white px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="relative flex items-center">
                <img 
                  src="/catalyst-PB.png" 
                  alt="Catalyst Page Builder" 
                  className="h-16 w-16 object-contain"
                />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Page Builder</h1>
                  <p className="text-sm text-gray-500 mt-1">Theme: <span className="font-medium text-gray-700">{themeName}</span></p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Template Publishing Button */}
                {isTemplateEdit && templateEditingContext && (
                  <button
                    onClick={() => {
                      const affectedCount = templateEditingContext.scope === 'journal' 
                        ? '2-15 issues' 
                        : templateEditingContext.scope === 'issue-type'
                          ? '25+ issues across journals'
                          : '100+ issues (all journals)'
                      
                      addNotification({
                        type: 'success',
                        title: 'Template Changes Published!',
                        message: `Template propagated to ${affectedCount}. Individual customizations preserved where possible.`
                      })
                      
                      // Clear template editing context
                      const { setTemplateEditingContext } = usePageStore.getState()
                      setTemplateEditingContext(null)
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Publish Template Changes
                  </button>
                )}
                
                <button
                    onClick={(e) => {
                      e.stopPropagation()
                      // Check if we're in a routed context (URL-based editing) or V1 internal
                      if (window.location.pathname.startsWith('/edit/')) {
                        // Extract websiteId from URL: /edit/:websiteId/:pageId
                        const pathParts = window.location.pathname.split('/')
                        const websiteId = pathParts[2] || 'catalyst-demo'
                        const pageId = pathParts[3] || ''
                        // Use client-side navigation to preserve state
                        // Homepage is at /live/:websiteId (not /live/:websiteId/home)
                        const livePath = pageId === 'home' || pageId === '' 
                          ? `/live/${websiteId}` 
                          : `/live/${websiteId}/${pageId}`
                        navigate(livePath)
                      } else {
                        const { setCurrentView } = usePageStore.getState()
                        setCurrentView('mock-live-site')
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Preview Changes
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      // Always set the view state first, then navigate if needed
                      setCurrentView('design-console')
                      // Check if we're in a routed context (URL-based editing) or V1 internal
                      if (window.location.pathname.startsWith('/edit/')) {
                        navigate('/v1')
                      }
                    }}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                    Design Console
                </button>
              </div>
            </div>
            
            {/* Context-Aware Editing Indicators */}
            {isIndividualIssueEdit && (
              <div className="mt-3 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2 text-amber-800">
                  <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
                  <span className="text-sm font-medium">
                    Editing Individual Issue
                  </span>
                  <span className="text-xs text-amber-600">
                    • Inherited from {journalName} Template • Changes apply only to this issue
                  </span>
                </div>
              </div>
            )}
            
            {isTemplateEdit && templateEditingContext && (
              <div className="mt-3 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3 text-blue-800">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <span className="text-sm font-medium">
                      {templateEditingContext.scope === 'journal' && `Editing ${journalName} Template`}
                      {templateEditingContext.scope === 'issue-type' && `Editing ${templateEditingContext.issueType === 'current' ? 'Current Issues' : 'Issue Type'} Template`}
                      {templateEditingContext.scope === 'global' && 'Editing Global Template'}
                    </span>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-blue-600">
                        Changes will propagate to: {
                          templateEditingContext.scope === 'journal' 
                            ? `All ${journalName} issues`
                            : templateEditingContext.scope === 'issue-type'
                              ? `All ${templateEditingContext.issueType} issues (all journals)`
                              : 'All issues (all journals)'
                        }
                      </span>
                      <button 
                        className="text-xs text-blue-700 hover:text-blue-900 underline"
                        onClick={() => {
                          addNotification({
                            type: 'info',
                            title: 'Propagation Preview',
                            message: `Template changes affect: ${templateEditingContext.affectedIssues.join(', ')}`
                          })
                        }}
                      >
                        Preview affected issues →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 p-6 bg-slate-50 overflow-y-auto overflow-x-hidden" onClick={() => selectWidget(null)}>
            {/* Removed redundant template banner - handled by TemplateCanvas */}

            {/* Template Canvas - Handles loading template sections */}
            <TemplateCanvas
              editingContext={editingContext}
              mockLiveSiteRoute={mockLiveSiteRoute}
              onSectionsLoad={handleTemplateSectionsLoad}
            />
            
            {/* Regular Page Editing Context - Show minimal info (only when canvas has content) */}
            {usePageStore((state: any) => state.editingContext) === 'page' && canvasItems.length > 0 && (
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Editing: <strong>{!isEditingLoadedWebsite ? 'Blank Canvas' : (() => {
                    const currentWebsiteId = usePageStore.getState().currentWebsiteId
                    const websites = usePageStore.getState().websites
                    const currentWebsite = websites.find((w: any) => w.id === currentWebsiteId)
                    return currentWebsite ? `${currentWebsite.name} Homepage` : 'Homepage'
                  })()}</strong>
                </div>
                <button
                  onClick={() => {
                    const currentWebsiteId = usePageStore.getState().currentWebsiteId
                    const currentWebsite = usePageStore.getState().websites.find((w: any) => w.id === currentWebsiteId)
                    
                    if (canvasItems.length === 0) {
                      showToast('Cannot save empty page as stub', 'error')
                      return
                    }

                    const starterName = prompt('Enter a name for this stub:')
                    if (!starterName?.trim()) return

                    const starterDescription = prompt('Enter a description (optional):') || 'Custom stub'

                    // Deep clone and regenerate IDs for canvas items to avoid conflicts
                    const clonedCanvasItems = canvasItems.map((item: CanvasItem) => {
                      if (isSection(item)) {
                        const newSectionId = nanoid()
                        return {
                          ...item,
                          id: newSectionId,
                          areas: (item as WidgetSection).areas.map((area: any) => ({
                            ...area,
                            id: nanoid(),
                            widgets: area.widgets.map((widget: any) => ({
                              ...widget,
                              id: nanoid(),
                              sectionId: newSectionId
                            }))
                          }))
                        }
                      } else {
                        return {
                          ...item,
                          id: nanoid()
                        }
                      }
                    })

                    // Create the custom starter page
                    const newStarterPage = {
                      id: nanoid(),
                      name: starterName.trim(),
                      description: starterDescription,
                      source: 'user' as const,
                      websiteId: currentWebsiteId,
                      websiteName: currentWebsite?.name || 'Unknown',
                      createdAt: new Date(),
                      canvasItems: clonedCanvasItems
                    }

                    addCustomStarterPage(newStarterPage)
                    showToast(`Stub "${starterName.trim()}" saved!`, 'success')
                  }}
                  className="ml-3 text-xs text-green-600 hover:text-green-800 underline"
                >
                  Save as Stub
                </button>
              </div>
            )}
            
            <CanvasThemeProvider usePageStore={usePageStore} scopeCSS={true}>
              <div className="theme-preview bg-white border border-slate-200 rounded-lg min-h-96 relative shadow-sm overflow-hidden">
              
              {/* Global Header Bar */}
              <GlobalSectionBar
                type="header"
                sections={headerSections}
                websiteId={currentWebsiteId}
                pageId={currentPageId}
                usePageStore={usePageStore}
                onWidgetClick={handleWidgetClick}
                selectedWidget={selectedWidget}
                activeWidgetToolbar={activeWidgetToolbar}
                setActiveWidgetToolbar={setActiveWidgetToolbar}
                overrideMode={headerOverrideMode}
                onOverrideModeChange={setHeaderOverrideMode}
              />
              
              {canvasItems.length === 0 ? (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center text-gray-500">
                    <p className="text-lg mb-2">Loading starter section...</p>
                    <p className="text-sm">Drag widgets from the library to get started</p>
                  </div>
                </div>
              ) : (
                <SortableContext items={canvasItems} strategy={verticalListSortingStrategy}>
                  <div className="relative">
                    <LayoutRenderer
                      canvasItems={canvasItems}
                      schemaObjects={schemaObjects || []}
                      isLiveMode={false}
                      journalContext={journalCode || undefined}
                      onWidgetClick={handleWidgetClick}
                      dragAttributes={{}}
                      dragListeners={{}}
                      activeSectionToolbar={activeSectionToolbar}
                      setActiveSectionToolbar={handleSetActiveSectionToolbar}
                      activeWidgetToolbar={activeWidgetToolbar}
                      setActiveWidgetToolbar={setActiveWidgetToolbar}
                      activeDropZone={activeDropZone}
                      showToast={showToast}
                      usePageStore={usePageStore}
                      // Editor-specific props
                      handleAddSection={handleAddSection}
                      handleSectionClick={(id: string) => handleSectionClick(id, {} as React.MouseEvent)}
                      selectedWidget={selectedWidget}
                      InteractiveWidgetRenderer={InteractiveWidgetRenderer}
                    />
                  </div>
                </SortableContext>
              )}
              
              {/* Global Footer Bar */}
              <GlobalSectionBar
                type="footer"
                sections={footerSections}
                websiteId={currentWebsiteId}
                pageId={currentPageId}
                usePageStore={usePageStore}
                onWidgetClick={handleWidgetClick}
                selectedWidget={selectedWidget}
                activeWidgetToolbar={activeWidgetToolbar}
                setActiveWidgetToolbar={setActiveWidgetToolbar}
                overrideMode={footerOverrideMode}
                onOverrideModeChange={setFooterOverrideMode}
              />
              
            </div>
            </CanvasThemeProvider>
          </div>
        </div>

      {/* Right Sidebar - Properties Panel - Sticky */}
      <div className={`${isPropertiesPanelExpanded ? 'w-[1000px]' : 'w-80'} transition-all duration-300 bg-slate-100 shadow-sm border-l border-slate-200 flex flex-col sticky top-0 h-screen`}>
        <div className="border-b border-slate-200 p-4 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">Properties</h2>
          {isPropertiesPanelExpanded && (
            <button
              onClick={() => setIsPropertiesPanelExpanded(false)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
              title="Collapse panel"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              Collapse
            </button>
          )}
        </div>
        <div 
          className="flex-1 overflow-y-auto" 
          style={{ 
            scrollBehavior: 'auto'
          }}
        >
          <PropertiesPanel 
            creatingSchemaType={creatingSchemaType}
            selectedSchemaObject={selectedSchemaObject}
            onSaveSchema={handleSaveSchema}
            onCancelSchema={handleCancelSchema}
            usePageStore={usePageStore}
            SchemaFormEditor={SchemaFormEditor}
            onExpandedChange={setIsPropertiesPanelExpanded}
            isExpanded={isPropertiesPanelExpanded}
            globalSections={[...headerSections, ...footerSections]}
            headerSections={headerSections}
            footerSections={footerSections}
            currentWebsiteId={currentWebsiteId}
            currentPageId={currentPageId}
            headerEditMode={headerOverrideMode}
            footerEditMode={footerOverrideMode}
          />
        </div>
      </div>

      {/* Layout Picker Modal */}
      {showLayoutPicker && (
        <LayoutPicker
          onSelectLayout={handleSelectLayout}
          onClose={() => setShowLayoutPicker(false)}
        />
      )}
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg transition-all transform ${
          toast.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center gap-2">
            {toast.type === 'success' ? (
              <Check className="w-4 h-4" />
            ) : (
              <X className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        </div>
      )}
      </div>
      
      {/* DragOverlay - renders the dragging item in a portal */}
      <DragOverlay dropAnimation={null}>
        {activeDragItem ? (
          <div className="bg-white border-2 border-blue-500 rounded-lg shadow-2xl p-4 opacity-90 cursor-grabbing">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-xs">
                  {activeDragItem.widget?.type?.[0]?.toUpperCase() || '?'}
                </span>
              </div>
              <div className="text-sm font-medium text-gray-900">
                {activeDragItem.item?.label || activeDragItem.widget?.type || 'Widget'}
              </div>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

// DIYZoneContent Component - Advanced widgets and saved sections
function DIYZoneContent({ showToast, usePageStore, buildWidget }: {
  showToast: (message: string, type: 'success' | 'error') => void
  usePageStore: any
  buildWidget: (item: any) => Widget
}) {
  const { customSections = [], customStarterPages = [], canvasItems, replaceCanvasItems, removeCustomStarterPage, selectWidget, currentWebsiteId, websites } = usePageStore()
  
  // Get current website's theme/design ID for matching stubs
  const currentWebsite = websites?.find((w: any) => w.id === currentWebsiteId)
  const currentThemeId = currentWebsite?.themeId || currentWebsite?.designId || ''
  
  // Filter stubs: match by websiteId OR by design/theme
  const relevantStubs = customStarterPages.filter((page: any) => {
    // Exact website match
    if (page.websiteId === currentWebsiteId) return true
    // Design/theme match (e.g., 'wiley-ds' matches any wiley-themed website)
    if (page.websiteId && currentThemeId) {
      const pageDesign = page.websiteId.toLowerCase()
      const currentDesign = currentThemeId.toLowerCase()
      if (pageDesign.includes('wiley') && currentDesign.includes('wiley')) return true
      if (pageDesign.includes('febs') && currentDesign.includes('febs')) return true
      if (pageDesign.includes('carbon') && currentDesign.includes('carbon')) return true
      if (pageDesign.includes('classic') && currentDesign.includes('classic')) return true
    }
    return false
  })

  // DIY Widgets - Advanced/Technical widgets for power users
  const diyWidgets = [
    { id: 'html-block', label: 'HTML Block', type: 'html-block' as const, description: 'Custom HTML content', skin: 'minimal' as const, status: 'supported' as const },
    { id: 'code-block', label: 'Code Block', type: 'code-block' as const, description: 'Syntax-highlighted code', skin: 'minimal' as const, status: 'supported' as const }
  ]

  return (
    <div className="space-y-6">
      {/* DIY Widgets */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Lightbulb className="w-4 h-4" />
          Advanced Widgets
        </h3>
        <div className="space-y-1">
          {diyWidgets.map((item) => (
            <DraggableLibraryWidget key={item.id} item={item} usePageStore={usePageStore} buildWidget={buildWidget} isDIY={true} />
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          💡 Drag these advanced widgets into your sections for custom functionality
        </p>
      </div>

      {/* Advanced Features - Coming Soon */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Advanced Features
        </h3>
        <div className="space-y-2">
          <div className="p-3 border border-gray-200 rounded-md bg-gray-50 opacity-60">
            <div className="flex items-center gap-2">
              <div className="text-lg">🎨</div>
              <div>
                <div className="font-medium text-sm text-gray-700">Global CSS</div>
                <div className="text-xs text-gray-500">Site-wide styling (Coming Soon)</div>
              </div>
            </div>
          </div>
          
          <div className="p-3 border border-gray-200 rounded-md bg-gray-50 opacity-60">
            <div className="flex items-center gap-2">
              <div className="text-lg">📁</div>
              <div>
                <div className="font-medium text-sm text-gray-700">File Manager</div>
                <div className="text-xs text-gray-500">Upload and manage assets (Coming Soon)</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Saved Sections */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Saved Sections
        </h3>

        {customSections.length > 0 ? (
          <div className="space-y-2">
            {customSections.map((section: any) => {
              // Count widgets in the saved section
              const itemCount = section.canvasItems?.length || section.items?.length || 0
              const totalWidgets = (section.canvasItems || section.items || []).reduce((count: number, item: any) => {
                if (isSection(item)) {
                  return count + item.areas.reduce((areaCount: number, area: any) => areaCount + area.widgets.length, 0)
                } else {
                  return count + 1
                }
              }, 0)
              
              return (
                <div key={section.id} className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{section.name}</div>
                      <div className="text-xs text-gray-500 mt-1">{section.description}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {itemCount} section{itemCount !== 1 ? 's' : ''} • {totalWidgets} widget{totalWidgets !== 1 ? 's' : ''} • 
                        Saved {new Date(section.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const itemsToLoad = section.canvasItems || section.items || []
                        debugLog('log','🔍 Loading saved section:', {
                          sectionName: section.name,
                          itemsToLoad,
                          currentCanvasItems: canvasItems,
                          totalItemsAfterLoad: canvasItems.length + itemsToLoad.length
                        })
                        // Clear any selected widgets/sections to prevent "not found" errors
                        selectWidget(null)
                        // Load the saved sections
                        replaceCanvasItems([...canvasItems, ...itemsToLoad])
                        showToast(`"${section.name}" loaded to canvas!`, 'success')
                      }}
                      className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex-shrink-0 ml-2"
                    >
                      Load
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📦</div>
            <div className="text-sm">No saved sections yet</div>
            <div className="text-xs mt-1">Create some sections and save them for reuse</div>
          </div>
        )}
      </div>

      {/* Saved Stubs */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Saved Stubs
        </h3>

        {relevantStubs.length > 0 ? (
          <div className="space-y-2">
            {relevantStubs.map((page: any) => {
                const itemCount = page.canvasItems?.length || 0
                
                return (
                  <div key={page.id} className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{page.name}</div>
                        <div className="text-xs text-gray-500 mt-1">{page.description}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {itemCount} section{itemCount !== 1 ? 's' : ''} • 
                          Saved {new Date(page.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-2">
                        <button
                          onClick={() => {
                            const confirmed = window.confirm(
                              `⚠️ Replace current page?\n\nYour current page will be replaced by "${page.name}".\n\nThis action cannot be undone. Continue?`
                            )
                            
                            if (confirmed) {
                              const itemsToLoad = page.canvasItems || []
                              selectWidget(null)
                              replaceCanvasItems(itemsToLoad)
                              showToast(`"${page.name}" loaded!`, 'success')
                            }
                          }}
                          className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex-shrink-0"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete "${page.name}"?`)) {
                              removeCustomStarterPage(page.id)
                              showToast(`"${page.name}" deleted`, 'success')
                            }
                          }}
                          className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex-shrink-0"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📄</div>
            <div className="text-sm">No saved stubs yet</div>
            <div className="text-xs mt-1">Save your pages as reusable stubs</div>
          </div>
        )}
      </div>
    </div>
  )
}

// SchemaContentTab Component - Schema.org content management 
function SchemaContentTab({ onCreateSchema, usePageStore, selectSchemaObject }: { 
  onCreateSchema: (schemaType: SchemaOrgType) => void
  usePageStore?: any
  selectSchemaObject?: (obj: SchemaObject) => void 
}) {
  const { schemaObjects = [] } = usePageStore?.() || {}
  const [searchTerm, setSearchTerm] = useState('')
  const [showNewMenu, setShowNewMenu] = useState(false)
  const [currentLevel, setCurrentLevel] = useState<string[]>([]) // Track hierarchy level
  
  // Filter objects based on search
  const filteredObjects = schemaObjects.filter((obj: SchemaObject) => 
    obj.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    obj.type.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  // Hierarchical schema.org structure
  const schemaHierarchy: Record<string, any> = {
    // Top level types
    'CreativeWork': {
      label: 'Creative Work',
      description: 'The most generic kind of creative work, including books, movies, photographs, software programs, etc.',
      children: {
        'Article': {
          label: 'Article', 
          description: 'An article, such as a news article or piece of investigative report',
          children: {
            'ScholarlyArticle': { label: 'Scholarly Article', description: 'A scholarly article' },
            'NewsArticle': { label: 'News Article', description: 'A news article' },
            'BlogPosting': { label: 'Blog Posting', description: 'A blog post' }
          }
        },
        'Book': { label: 'Book', description: 'A book' },
        'MediaObject': {
          label: 'Media Object',
          description: 'A media object, such as an image, video, or audio file',
          children: {
            'ImageObject': { label: 'Image Object', description: 'An image file' },
            'VideoObject': { label: 'Video Object', description: 'A video file' },
            'AudioObject': { label: 'Audio Object', description: 'An audio file' }
          }
        }
      }
    },
    'Person': { 
      label: 'Person', 
      description: 'A person (alive, dead, undead, or fictional)' 
    },
    'Organization': {
      label: 'Organization',
      description: 'An organization such as a school, NGO, corporation, club, etc.',
      children: {
        'Corporation': { label: 'Corporation', description: 'A business corporation' },
        'EducationalOrganization': { label: 'Educational Organization', description: 'A school, university, etc.' },
        'ResearchOrganization': { label: 'Research Organization', description: 'A research organization' }
      }
    },
    'Event': {
      label: 'Event',
      description: 'An event happening at a certain time and location',
      children: {
        'BusinessEvent': { label: 'Business Event', description: 'A business event' },
        'EducationEvent': { label: 'Education Event', description: 'An education event' },
        'ConferenceEvent': { label: 'Conference Event', description: 'A conference event' }
      }
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Schema Content</h3>
            <p className="text-sm text-gray-600">Create and manage structured data objects</p>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowNewMenu(!showNewMenu)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New
            </button>
            
          </div>
        </div>
        
        {/* Search */}
        <input
          type="text"
          placeholder="Search schema objects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {showNewMenu ? (
          /* Schema Type Selection */
          <div className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-gray-900">Select Schema Type</h4>
              <button
                onClick={() => {
                  setShowNewMenu(false)
                  setCurrentLevel([])
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
            
            {/* Breadcrumb Navigation */}
            {currentLevel.length > 0 && (
              <div className="flex items-center mb-3 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded">
                <button 
                  onClick={() => setCurrentLevel([])}
                  className="hover:text-blue-600"
                >
                  Schema Types
                </button>
                {currentLevel.map((level, index) => (
                  <span key={index}>
                    <span className="mx-2">›</span>
                    <button 
                      onClick={() => setCurrentLevel(currentLevel.slice(0, index + 1))}
                      className="hover:text-blue-600"
                    >
                      {schemaHierarchy[level]?.label || level}
                    </button>
                  </span>
                ))}
              </div>
            )}
            
            {/* Schema Type Options */}
            <div className="space-y-1">
              {(() => {
                // Navigate to current level in hierarchy
                let currentItems = schemaHierarchy
                for (const levelKey of currentLevel) {
                  currentItems = currentItems[levelKey]?.children || {}
                }
                
                // If we're at top level, show main types
                if (currentLevel.length === 0) {
                  return Object.entries(schemaHierarchy).map(([key, value]) => (
                    <button
                      key={key}
                      onClick={() => {
                        if (value.children) {
                          setCurrentLevel([key])
                        } else {
                          onCreateSchema(key as SchemaOrgType)
                          setShowNewMenu(false)
                          setCurrentLevel([])
                        }
                      }}
                      className="w-full p-3 text-left border border-gray-200 rounded-md hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{value.label}</div>
                          <div className="text-xs text-gray-500 mt-1">{value.description}</div>
                        </div>
                        {value.children && (
                          <div className="text-gray-400 ml-2">›</div>
                        )}
                      </div>
                    </button>
                  ))
                }
                
                // Show items at current level
                return Object.entries(currentItems).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => {
                      if (value.children) {
                        setCurrentLevel([...currentLevel, key])
                      } else {
                        onCreateSchema(key as SchemaOrgType)
                        setShowNewMenu(false)
                        setCurrentLevel([])
                      }
                    }}
                    className="w-full p-3 text-left border border-gray-200 rounded-md hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{value.label}</div>
                        <div className="text-xs text-gray-500 mt-1">{value.description}</div>
                      </div>
                      {value.children ? (
                        <div className="text-gray-400 ml-2">›</div>
                      ) : (
                        <div className="text-xs text-green-600 ml-2 font-medium">Create</div>
                      )}
                    </div>
                  </button>
                ))
              })()}
            </div>
          </div>
        ) : (
          /* Your Schema Objects */
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              Your Schema Objects ({filteredObjects.length})
            </h4>
            
            {filteredObjects.length === 0 ? (
              <div className="text-center py-12">
                {schemaObjects.length === 0 ? (
                  <div>
                    <div className="text-4xl mb-3">📋</div>
                    <p className="text-gray-500 mb-2">No schema objects yet</p>
                    <p className="text-xs text-gray-400">Click "New" to create your first schema object</p>
                  </div>
                ) : (
                  <div>
                    <div className="text-4xl mb-3">🔍</div>
                    <p className="text-gray-500 mb-2">No objects match "{searchTerm}"</p>
                    <p className="text-xs text-gray-400">Try a different search term</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredObjects.map((obj: SchemaObject) => (
                  <div
                    key={obj.id}
                    onClick={() => selectSchemaObject?.(obj)}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900">{obj.name}</div>
                        <div className="text-xs text-gray-500 mt-1">{SCHEMA_DEFINITIONS[obj.type]?.label || obj.type}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          Created {new Date(obj.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          {obj.type}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  )
}

// SectionsContent Component - Manages different categories of sections
function SectionsContent({ showToast, usePageStore }: { 
  showToast: (message: string, type: 'success' | 'error') => void
  usePageStore: any
}) {
  const { replaceCanvasItems, canvasItems, websites, currentWebsiteId, themes } = usePageStore()
  
  // Get current website's theme to show theme-specific prefabs
  const currentWebsite = websites.find((w: any) => w.id === currentWebsiteId)
  const currentTheme = currentWebsite 
    ? themes.find((t: any) => t.id === currentWebsite.themeId)
    : null
  const isWileyTheme = currentTheme?.id === 'wiley-figma-ds-v2'

  // Prefab sections are now handled by the modular prefabSections.ts

  const addPrefabSection = (type: string) => {
    let section: CanvasItem
    
    // Global Sections
    if (type === 'standardHeader') {
      section = PREFAB_SECTIONS.standardHeader()
    } else if (type === 'standardFooter') {
      section = PREFAB_SECTIONS.standardFooter()
    } else if (type === 'copyrightBar') {
      section = PREFAB_SECTIONS.copyrightBar()
    } else if (type === 'globalHeader') {
      section = PREFAB_SECTIONS.globalHeader()
    } else if (type === 'mainNavigation') {
      section = PREFAB_SECTIONS.mainNavigation()
    }
    // Utility Sections
    else if (type === 'notificationBanner') {
      section = PREFAB_SECTIONS.notificationBanner()
    } else if (type === 'cookieConsent') {
      section = PREFAB_SECTIONS.cookieConsent()
    }
    // Content Sections
    else if (type === 'hero') {
      section = PREFAB_SECTIONS.hero()
    } else if (type === 'features') {
      section = PREFAB_SECTIONS.featuredResearch()
    } else if (type === 'journalBanner') {
      section = PREFAB_SECTIONS.journalBanner()
    }
    // Wiley Theme Sections
    else if (type === 'wileyFigmaCardGrid') {
      section = PREFAB_SECTIONS.wileyFigmaCardGrid()
    } else if (type === 'wileyFigmaFeaturedContent') {
      section = PREFAB_SECTIONS.wileyFigmaFeaturedContent()
    } else if (type === 'wileyFigmaLogoGrid') {
      section = PREFAB_SECTIONS.wileyFigmaLogoGrid()
    } else if (type === 'wileyThreeColumn') {
      section = PREFAB_SECTIONS.wileyThreeColumn()
    } else if (type === 'wileyContentImage') {
      section = PREFAB_SECTIONS.wileyContentImage()
    } else if (type === 'wileyDSV2Hero') {
      section = PREFAB_SECTIONS.wileyDSV2Hero()
    } else if (type === 'wileyDSV2CardGrid') {
      section = PREFAB_SECTIONS.wileyDSV2CardGrid()
    } else {
      return // Invalid type
    }

    // Smart insertion: headers go to top, footers go to bottom, others append
    const isHeader = type === 'standardHeader' || type === 'globalHeader'
    const isFooter = type === 'standardFooter' || type === 'copyrightBar'
    
    if (isHeader) {
      // Insert header at the very top
      replaceCanvasItems([section, ...canvasItems])
      showToast(`${(section as WidgetSection).name} added at top of page!`, 'success')
    } else if (isFooter) {
      // Insert footer at the very bottom
      replaceCanvasItems([...canvasItems, section])
      showToast(`${(section as WidgetSection).name} added at bottom of page!`, 'success')
    } else {
      // Default: append to end (before footer if one exists)
      replaceCanvasItems([...canvasItems, section])
      showToast(`${(section as WidgetSection).name} added with template content!`, 'success')
    }
  }

  return (
    <div className="space-y-6">
      {/* Theme Indicator */}
      {currentTheme && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-xs font-semibold text-blue-900 mb-1">Current Theme</div>
          <div className="text-sm text-blue-700">{currentTheme.name}</div>
        </div>
      )}
      
      {/* Template-Ready Sections */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">
          {isWileyTheme ? 'Wiley Theme Sections' : 'Template-Ready Sections'}
        </h3>
        <div className="grid grid-cols-1 gap-2">
          
          {/* Wiley DS V2 Sections - Prefabs with unique styling */}
          {currentTheme?.id === 'wiley-figma-ds-v2' && (
            <>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 mt-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-green-600" />
                DS V2 Sections
              </h4>
              <div className="space-y-3">
                <button
                  onClick={() => addPrefabSection('wileyDSV2Hero')}
                  className="w-full p-3 text-left border-2 border-green-200 bg-green-50 rounded-md hover:bg-green-100 transition-colors flex flex-col gap-3"
                >
                  <div>
                    <div className="font-medium text-sm text-gray-900">Hero Section</div>
                    <div className="text-xs text-gray-700">500px hero with energy burst background image (L1 template VAR 2)</div>
                  </div>
                </button>
                
                <button
                  onClick={() => addPrefabSection('wileyDSV2CardGrid')}
                  className="w-full p-3 text-left border-2 border-green-200 bg-green-50 rounded-md hover:bg-green-100 transition-colors flex flex-col gap-3"
                >
                  <div>
                    <div className="font-medium text-sm text-gray-900">Card Grid</div>
                    <div className="text-xs text-gray-700">3-column grid with title drop zone + Heritage 900 background</div>
                  </div>
                </button>
                
                <button
                  onClick={() => addPrefabSection('wileyFigmaLogoGrid')}
                  className="w-full p-3 text-left border-2 border-green-200 bg-green-50 rounded-md hover:bg-green-100 transition-colors flex flex-col gap-3"
                >
                  <div>
                    <div className="font-medium text-sm text-gray-900">Shop Today</div>
                    <div className="text-xs text-gray-700">Bordered 3-column grid with light cream background</div>
                  </div>
                </button>
                
                <div className="text-xs text-gray-500 italic mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                  💡 <strong>Why these are prefabs:</strong><br/>
                  • Hero: 500px tall with background image (L1 template VAR 2)<br/>
                  • Card Grid: Has title drop zone (not in basic layouts)<br/>
                  • Shop Today: Unique bordered grid styling
                </div>
              </div>
            </>
          )}
          
          {/* Default Sections (for non-Wiley themes) */}
          {!isWileyTheme && (
            <>
              {/* Global Sections - Site-wide components */}
              <h4 className="text-sm font-semibold text-gray-700 mb-3 mt-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-purple-600" />
                Global Sections
              </h4>
              <div className="space-y-3">
                <button
                  onClick={() => addPrefabSection('standardHeader')}
                  className="w-full p-3 text-left border-2 border-purple-200 bg-purple-50 rounded-md hover:bg-purple-100 transition-colors flex flex-col gap-3"
                >
                  <div className="relative w-full h-12 bg-gray-800 rounded overflow-hidden flex items-center justify-between px-4">
                    <span className="text-white text-xs font-medium">🏛️ Publisher</span>
                    <span className="text-white text-xs">Home • Journals • About</span>
                  </div>
                  <div>
                    <div className="font-medium text-sm text-gray-900">Standard Header</div>
                    <div className="text-xs text-gray-700">Logo + navigation menu on dark background</div>
                  </div>
                </button>
                
                <button
                  onClick={() => addPrefabSection('standardFooter')}
                  className="w-full p-3 text-left border-2 border-purple-200 bg-purple-50 rounded-md hover:bg-purple-100 transition-colors flex flex-col gap-3"
                >
                  <div className="relative w-full h-16 bg-gray-800 rounded overflow-hidden p-2">
                    <div className="flex justify-between text-white text-[8px]">
                      <div>About<br/>• About Us<br/>• Terms</div>
                      <div>Journals<br/>• Browse<br/>• Submit</div>
                      <div>Connect<br/>• Contact<br/>• Twitter</div>
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-sm text-gray-900">Standard Footer</div>
                    <div className="text-xs text-gray-700">3-column footer with link groups</div>
                  </div>
                </button>
                
                <button
                  onClick={() => addPrefabSection('copyrightBar')}
                  className="w-full p-3 text-left border-2 border-purple-200 bg-purple-50 rounded-md hover:bg-purple-100 transition-colors flex flex-col gap-3"
                >
                  <div className="relative w-full h-8 bg-gray-900 rounded overflow-hidden flex items-center justify-center">
                    <span className="text-gray-400 text-[8px]">© 2024 Publisher • Powered by Catalyst</span>
                  </div>
                  <div>
                    <div className="font-medium text-sm text-gray-900">Copyright Bar</div>
                    <div className="text-xs text-gray-700">Simple copyright notice bar</div>
                  </div>
                </button>
              </div>
              
              {/* Overlay Sections - Banners & overlays */}
              <h4 className="text-sm font-semibold text-gray-700 mb-3 mt-6 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                Overlay Sections
              </h4>
              <div className="space-y-3">
                <button
                  onClick={() => addPrefabSection('notificationBanner')}
                  className="w-full p-3 text-left border-2 border-amber-200 bg-amber-50 rounded-md hover:bg-amber-100 transition-colors flex flex-col gap-3"
                >
                  <div className="relative w-full h-8 bg-amber-100 rounded overflow-hidden flex items-center justify-center">
                    <span className="text-amber-800 text-[8px]">📢 Important announcement message here →</span>
                  </div>
                  <div>
                    <div className="font-medium text-sm text-gray-900">Notification Banner</div>
                    <div className="text-xs text-gray-700">Amber announcement bar</div>
                  </div>
                </button>
                
                <button
                  onClick={() => addPrefabSection('cookieConsent')}
                  className="w-full p-3 text-left border-2 border-amber-200 bg-amber-50 rounded-md hover:bg-amber-100 transition-colors flex flex-col gap-3"
                >
                  <div className="relative w-full h-8 bg-gray-800 rounded overflow-hidden flex items-center justify-center">
                    <span className="text-white text-[8px]">🍪 We use cookies. Learn more →</span>
                  </div>
                  <div>
                    <div className="font-medium text-sm text-gray-900">Cookie Consent</div>
                    <div className="text-xs text-gray-700">GDPR cookie consent bar</div>
                  </div>
                </button>
              </div>
              
              {/* Content Sections */}
              <h4 className="text-sm font-semibold text-gray-700 mb-3 mt-6 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-blue-600" />
                Content Sections
              </h4>
              <div className="space-y-3">
                <button
                  onClick={() => addPrefabSection('hero')}
                  className="w-full p-3 text-left border-2 border-blue-200 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors flex flex-col gap-3"
                >
                  <div className="relative w-full h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded overflow-hidden">
                    <img src="/layout-previews/hero.png" alt="Hero preview" className="w-full h-full object-cover" onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }} />
                  </div>
                  <div>
                    <div className="font-medium text-sm text-gray-900">Hero Section</div>
                    <div className="text-xs text-gray-700">Full hero with heading, text, and action buttons</div>
                  </div>
                </button>
                
                <button
                  onClick={() => addPrefabSection('features')}
                  className="w-full p-3 text-left border-2 border-blue-200 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors flex flex-col gap-3"
                >
                  <div className="relative w-full h-20 bg-gray-100 rounded overflow-hidden">
                    <img src="/layout-previews/featuredResearch.png" alt="Featured Research preview" className="w-full h-full object-cover" onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }} />
                  </div>
                  <div>
                    <div className="font-medium text-sm text-gray-900">Featured Research</div>
                    <div className="text-xs text-gray-700">Header with 3 research highlight cards</div>
                  </div>
                </button>
                
                <button
                  onClick={() => addPrefabSection('journalBanner')}
                  className="w-full p-3 text-left border-2 border-blue-200 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors flex flex-col gap-3"
                >
                  <div className="relative w-full h-20 bg-gradient-to-r from-gray-800 to-gray-900 rounded overflow-hidden">
                    <img src="/layout-previews/journalBanner.png" alt="Journal Banner preview" className="w-full h-full object-cover" onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }} />
                  </div>
                  <div>
                    <div className="font-medium text-sm text-gray-900">Journal Banner</div>
                    <div className="text-xs text-gray-700">Dark gradient banner with publication details</div>
                  </div>
                </button>
              </div>
              
              {/* Special Sections */}
              <h4 className="text-sm font-semibold text-gray-700 mb-3 mt-6 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Special Sections
              </h4>
              <div className="space-y-3">
                <button
                  onClick={() => addPrefabSection('sidebar')}
                  className="w-full p-3 text-left border-2 border-gray-200 bg-white rounded-md hover:bg-gray-50 transition-colors flex flex-col gap-3"
                >
                  <div>
                    <div className="font-medium text-sm text-gray-900">Sidebar</div>
                    <div className="text-xs text-gray-700">Vertical sidebar that can span multiple sections</div>
                  </div>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default PageBuilder
