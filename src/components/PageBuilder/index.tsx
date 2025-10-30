import { useState, useEffect } from 'react'
import { nanoid } from 'nanoid'
import { PREFAB_SECTIONS } from './prefabSections'
import { createHomepageTemplate, shouldAutoLoadHomepage } from './homepageTemplate'
import {
  DndContext,
  useSensors,
  useSensor,
  PointerSensor,
  rectIntersection,
  closestCenter
} from '@dnd-kit/core'
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
  const { canvasItems, setCurrentView, selectWidget, selectedWidget, setInsertPosition, createContentBlockWithLayout, selectedSchemaObject, addSchemaObject, updateSchemaObject, selectSchemaObject, addNotification, replaceCanvasItems, editingContext, mockLiveSiteRoute, templateEditingContext, setCanvasItemsForRoute, setGlobalTemplateCanvas, setJournalTemplateCanvas, schemaObjects } = usePageStore()
  
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
  useEffect(() => {
    console.log('🔍 Auto-loading check:', {
      editingContext,
      mockLiveSiteRoute,
      canvasItemsLength: canvasItems.length,
      shouldLoad: shouldAutoLoadHomepage(editingContext, mockLiveSiteRoute, canvasItems)
    })
    
    if (shouldAutoLoadHomepage(editingContext, mockLiveSiteRoute, canvasItems)) {
      console.log('🏠 Auto-loading homepage template...')
      const homepageTemplate = createHomepageTemplate()
      replaceCanvasItems(homepageTemplate)
      showToast('Homepage template loaded! Edit sections to match your vision.', 'success')
    }
  }, [editingContext, mockLiveSiteRoute, canvasItems]) // Watch for changes to editing context, route, and canvas content
  
  // Route-specific canvas saving for individual issue edits
  useEffect(() => {
    // Save canvas changes to route-specific storage when editing individual issues
    if (isIndividualIssueEdit && canvasItems.length > 0) {
      console.log('💾 Saving individual issue changes to route:', mockLiveSiteRoute)
      setCanvasItemsForRoute(mockLiveSiteRoute, canvasItems)
    }
  }, [canvasItems, isIndividualIssueEdit, mockLiveSiteRoute, setCanvasItemsForRoute])
  
  // Global template canvas saving
  useEffect(() => {
    // Save canvas changes to global template storage when editing global templates
    if (isGlobalTemplateEdit && canvasItems.length > 0) {
      console.log('🌍 Saving global template changes:', canvasItems.length, 'items')
      setGlobalTemplateCanvas(canvasItems)
    }
  }, [canvasItems, isGlobalTemplateEdit, setGlobalTemplateCanvas])
  
  // Journal template canvas saving
  useEffect(() => {
    // Save canvas changes to journal template storage when editing journal templates
    if (isJournalTemplateEdit && templateEditingContext?.journalCode && canvasItems.length > 0) {
      console.log('📚 Saving journal template changes for', templateEditingContext.journalCode + ':', canvasItems.length, 'items')
      setJournalTemplateCanvas(templateEditingContext.journalCode, canvasItems)
    }
  }, [canvasItems, isJournalTemplateEdit, templateEditingContext?.journalCode, setJournalTemplateCanvas])
  
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
    console.log('🏗️ Loading template sections:', sections)
    replaceCanvasItems(sections)
    // Removed notification toast - banner shows template status instead
  }
  
  const handleSetActiveSectionToolbar = (value: string | null) => {
    setActiveSectionToolbar(value)
  }
  
  // Show toast notification
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000) // Auto-hide after 3 seconds
  }
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  )
  
  // Custom collision detection that prioritizes section-area drop zones
  const customCollisionDetection = (args: any) => {
    // First try to find section-area collisions
    const sectionAreaCollisions = rectIntersection({
      ...args,
      droppableContainers: args.droppableContainers.filter((container: any) => 
        container.data?.current?.type === 'section-area'
      )
    })
    
    if (sectionAreaCollisions.length > 0) {
      return sectionAreaCollisions
    }
    
    // Fall back to default collision detection
    return closestCenter(args)
  }
  
  const handleDragStart = (event: DragStartEvent) => {
    const draggedItem = event.active.data?.current?.item
    const isSidebar = draggedItem && isSection(draggedItem) && draggedItem.type === 'sidebar'
    
    console.log('🚀 Drag Start:', {
      activeId: event.active.id,
      activeType: event.active.data?.current?.type,
      activeData: event.active.data?.current,
      activeItem: draggedItem,
      isSidebar: isSidebar,
      sidebarName: isSidebar ? draggedItem.name : 'not a sidebar'
    })
    
    if (isSidebar) {
      console.log('🎯 SIDEBAR DRAG DETECTED! Setting up special highlighting...')
    }
    
    // Log all available drop zones for debugging
    const dropZones = document.querySelectorAll('[data-droppable="true"]')
    console.log('📍 Available drop zones:', Array.from(dropZones).map(zone => ({
      id: zone.getAttribute('data-droppable-id') || zone.id,
      classes: zone.className,
      rect: zone.getBoundingClientRect()
    })))
  }
  
  const handleDragOver = (event: DragOverEvent) => {
    if (event.over) {
      const activeItem = event.active.data?.current?.item
      const isDraggingSidebar = activeItem && isSection(activeItem) && activeItem.type === 'sidebar'
      
      // DEBUG: Log what we're detecting
      console.log('🔍 Drag Over Debug:', {
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
            console.log('🎯 Sidebar drop zone detected (converted to section-level):', {
              activeId: event.active.id,
              dropZone: sectionId,
              originalAreaId: event.over.id
            })
          }
        } else if (event.over.data?.current?.type === 'section') {
          const dropZoneId = event.over.id as string
          if (activeDropZone !== dropZoneId) {
            setActiveDropZone(dropZoneId)
            console.log('🎯 Sidebar drop zone detected (section-level):', {
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
            console.log('🎯 Drop zone detected:', {
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
    
    // Clear drop zone highlighting
    setActiveDropZone(null)
    
    console.log('🎯 Drag End Event:', {
      activeId: active.id,
      activeType: active.data?.current?.type,
      overId: over?.id,
      overType: over?.data?.current?.type,
      hasOver: !!over,
      isLibraryWidget: active.data?.current?.type === 'library-widget',
      isSortableItem: !active.data?.current?.type || active.data?.current?.type === 'sortable'
    })

    if (!over) {
      console.log('❌ No drop target found')
      return
    }

    // Handle library widget drop into section area
    if (active.data?.current?.type === 'library-widget' && over.data?.current?.type === 'section-area') {
      console.log('✅ Library widget dropped into section area!', {
        libraryItem: active.data.current.item,
        sectionId: over.data.current.sectionId,
        areaId: over.data.current.areaId,
        overId: over.id
      })
      const libraryItem = active.data.current.item
      const sectionId = over.data.current.sectionId
      const areaId = over.data.current.areaId
      
      // Create new widget from library item
      const newWidget = buildWidget(libraryItem)
      newWidget.sectionId = sectionId
      
      console.log('🔧 Created HTML widget:', newWidget.type, newWidget.id, 'for section:', sectionId, 'area:', areaId)
      
      // Add widget to the specific section area
      const { replaceCanvasItems, canvasItems } = usePageStore.getState()
      // Type narrow to section item, which should have .areas
      const targetSection = canvasItems.find((item: CanvasItem) => isSection(item) && item.id === sectionId)
      const targetArea = (targetSection && 'areas' in targetSection)
        ? targetSection.areas.find((area: any) => area.id === areaId)
        : undefined

      console.log('🎯 Target area before:', targetArea?.widgets?.length || 0, 'widgets')

      const updatedCanvasItems = canvasItems.map((canvasItem: CanvasItem) => {
        if (isSection(canvasItem) && canvasItem.id === sectionId) {
          return {
            ...canvasItem,
            areas: (canvasItem as WidgetSection).areas.map((area: any) => 
              area.id === areaId 
                ? { ...area, widgets: [...area.widgets, newWidget] }
                : area
            )
          }
        }
        return canvasItem
      })

      // Type guard: ensure found section actually has areas before accessing
      const updatedSection = updatedCanvasItems.find(
        (item: CanvasItem) => item.id === sectionId && 'areas' in item && Array.isArray((item as any).areas)
      ) as { areas: { id: string; widgets: any[] }[] } | undefined;
      
      const updatedArea = updatedSection?.areas.find(
        (area: { id: string }) => area.id === areaId
      );
      console.log(
        '✅ Target area after:',
        updatedArea?.widgets?.length ?? 0,
        'widgets'
      );

      replaceCanvasItems(updatedCanvasItems);
      return;
    }
    
    // NOTE: Library widgets should ONLY be dropped into sections, never directly onto canvas
    
    // Handle standalone widget drop into section area (the missing scenario!)
    if ((active.data?.current?.type === 'canvas-widget' || 
         active.data?.current?.type === 'standalone-widget' || 
         !active.data?.current?.type || 
         active.data?.current?.type === 'sortable') && 
        over.data?.current?.type === 'section-area') {
      console.log('✅ Standalone widget dropped into section area!')
      
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
          console.log('❌ Standalone widget not found')
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
      console.log('🚀 Section widget detected, checking drop location...', { 
        overId: over?.id, 
        overType: over?.data?.current?.type,
        overData: over?.data?.current 
      })
      
      // Case 1: Dropped on specific section area (preferred)
      if (over?.data?.current?.type === 'section-area') {
        console.log('✅ Moving widget to specific section area!')
        const draggedWidget = active.data.current.widget
        const fromAreaId = active.data.current.fromAreaId
        const toAreaId = over.data.current.areaId
        
        // Don't do anything if dropping in the same area
        if (fromAreaId === toAreaId) {
          console.log('⚠️ Same area, no action needed')
          return
        }
        
        const { replaceCanvasItems, canvasItems } = usePageStore.getState()
        const updatedCanvasItems = canvasItems.map((canvasItem: CanvasItem) => {
          if (isSection(canvasItem)) {
            return {
              ...canvasItem,
              areas: (canvasItem as WidgetSection).areas.map((area: any) => {
                // Remove from source area
                if (area.id === fromAreaId) {
                  return { ...area, widgets: area.widgets.filter((w: Widget) => w.id !== draggedWidget.id) }
                }
                // Add to target area with updated sectionId
                if (area.id === toAreaId) {
                  const updatedWidget = { ...draggedWidget, sectionId: over.data.current!.sectionId }
                  return { ...area, widgets: [...area.widgets, updatedWidget] }
                }
                return area
              })
            }
          }
          return canvasItem
        }).filter((item: CanvasItem | undefined): item is CanvasItem => item !== undefined)
        replaceCanvasItems(updatedCanvasItems)
        console.log('✅ Widget moved between sections!')
        return
      }
      // Case 2: Dropped on section itself (find first available area)
      if (over?.id && typeof over.id === 'string' && over.id.endsWith('-section')) {
        console.log('✅ Moving widget to section (first available area)!', { targetSectionId: over.id })
        const draggedWidget = active.data.current.widget
        const fromSectionId = active.data.current.fromSectionId
        const fromAreaId = active.data.current.fromAreaId
        const targetSectionId = over.id
        
        console.log('🎯 Cross-section move details:', {
          widgetId: draggedWidget.id,
          fromSectionId,
          fromAreaId,
          targetSectionId,
          isSameSection: fromSectionId === targetSectionId
        })
        
        // If dropping in the same section, don't do anything
        if (fromSectionId === targetSectionId) {
          console.log('⚠️ Same section, no action needed')
          return
        }
        
        const { replaceCanvasItems, canvasItems } = usePageStore.getState()
        
        // Find the target section and its first area
        const targetSection = canvasItems.find((item: CanvasItem) => item.id === targetSectionId && isSection(item)) as WidgetSection
        if (!targetSection || !targetSection.areas.length) {
          console.log('❌ Target section not found or has no areas')
          return
        }
        
        const firstAreaId = targetSection.areas[0].id
        console.log('🎯 Target section found, first area:', firstAreaId)
        
        const updatedCanvasItems = canvasItems.map((canvasItem: CanvasItem) => {
          if (isSection(canvasItem)) {
            return {
              ...canvasItem,
              areas: (canvasItem as WidgetSection).areas.map((area: any) => {
                // Remove from source area
                if (area.id === fromAreaId) {
                  return { ...area, widgets: area.widgets.filter((w: Widget) => w.id !== draggedWidget.id) }
                }
                // Add to target area (first area of target section)
                if (area.id === firstAreaId) {
                  const updatedWidget = { ...draggedWidget, sectionId: targetSectionId }
                  return { ...area, widgets: [...area.widgets, updatedWidget] }
                }
                return area
              })
            }
          }
          return canvasItem
        })
        replaceCanvasItems(updatedCanvasItems)
        console.log('✅ Widget moved to section first area!')
        return
      }
      
      // Case 3: Section widget dropped somewhere invalid - just return without doing anything
      console.log('⚠️ Section widget dropped in invalid location, ignoring')
      return
    }

    // Handle sidebar reordering FIRST - before regular canvas reordering
    const draggedItem = active.data?.current?.item
    const isDraggingSidebar = draggedItem && isSection(draggedItem) && draggedItem.type === 'sidebar'
    
    if (isDraggingSidebar && (over.data?.current?.type === 'section' || over.data?.current?.type === 'section-area')) {
      const targetSectionId = over.data?.current?.type === 'section' 
        ? over.id 
        : over.data?.current?.sectionId
        
      console.log('✅ Sidebar dropped for reordering!', {
        sidebarId: draggedItem.id,
        targetSectionId: targetSectionId,
        dropType: over.data?.current?.type
      })
      
      const { replaceCanvasItems, canvasItems } = usePageStore.getState()
      const targetIndex = canvasItems.findIndex(item => item.id === targetSectionId)
      const sidebarIndex = canvasItems.findIndex(item => item.id === draggedItem.id)
      
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
        
        console.log('🔄 Sidebar repositioned successfully', {
          sidebarId: movedSidebar.id,
          newPosition: targetIndex,
          spannedSections: spannedSectionIds,
          spanCount: sidebarSpan
        })
        
        replaceCanvasItems(newCanvasItems)
        
        // Force a re-render to recalculate heights
        setTimeout(() => {
          console.log('📐 Recalculating sidebar heights after repositioning')
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
      console.log('🔄 Attempting canvas item reordering for canvas items')
      
      // For standalone-widget type, use the original sortable ID for comparison
      const activeItemId = active.data?.current?.type === 'standalone-widget' 
        ? active.data.current.originalSortableId 
        : active.id
      
      // If dropping over a section area, get the section ID instead of the drop zone ID
      let targetId = over.id
      if (over.data?.current?.type === 'section-area' && over.data?.current?.sectionId) {
        targetId = over.data.current.sectionId
        console.log('🎯 Section dragged over section area, using section ID:', targetId)
      }
      
      if (activeItemId !== targetId) {
        const { moveItem } = usePageStore.getState()
        const oldIndex = canvasItems.findIndex((item: CanvasItem) => item.id === activeItemId)
        const newIndex = canvasItems.findIndex((item: CanvasItem) => item.id === targetId)
        
        console.log('📋 Canvas reorder:', { oldIndex, newIndex, activeItemId, targetId, originalOverId: over.id })
        
        if (oldIndex !== -1 && newIndex !== -1) {
          console.log('✅ Canvas item reordered!')
          moveItem(oldIndex, newIndex)
        } else {
          console.log('❌ Canvas item reorder failed - items not found')
        }
      }
    }
    
    
    // Debug: Catch unhandled drag cases
    console.log('⚠️ Unhandled drag case:', {
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
    
    console.log('🖱️ Widget clicked for properties:', { widgetId })
    
    // Find the widget to check its sectionId - use same logic as Properties Panel
    let widget: Widget | undefined = canvasItems.find((item: CanvasItem) => item.id === widgetId && !isSection(item)) as Widget
    
    // If not found at canvas level, search within section areas
    if (!widget) {
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
    
    if (widget) {
      console.log('📋 Widget found for properties:', { 
        id: widget.id, 
        type: widget.type,
        sectionId: widget.sectionId || 'standalone'
      })
    } else {
      console.log('❌ Widget not found for properties:', { widgetId })
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
              <h1 className="text-2xl font-bold text-gray-900">Page Builder</h1>
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
                    onClick={() => {
                      const { setCurrentView } = usePageStore.getState()
                      setCurrentView('mock-live-site')
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Preview Changes
                  </button>
                  <button
                    onClick={() => setCurrentView('design-console')}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                    Design System Console
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

          <div className="flex-1 p-6 bg-slate-50" onClick={() => selectWidget(null)}>
            {/* Removed redundant template banner - handled by TemplateCanvas */}

            {/* Template Canvas - Handles loading template sections */}
            <TemplateCanvas
              editingContext={editingContext}
              mockLiveSiteRoute={mockLiveSiteRoute}
              onSectionsLoad={handleTemplateSectionsLoad}
            />
            
            {/* Regular Page Editing Context - Show minimal info */}
            {usePageStore((state: any) => state.editingContext) === 'page' && (
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Editing: <strong>Wiley Online Library Homepage</strong>
                </div>
                <button
                  onClick={() => {
                    const { setEditingContext } = usePageStore.getState()
                    setEditingContext('template')
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  Switch to Template Mode
                </button>
              </div>
            )}
            
            <CanvasThemeProvider usePageStore={usePageStore}>
              <div className="bg-white border border-slate-200 rounded-lg min-h-96 relative shadow-sm">
              {canvasItems.length === 0 ? (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center text-gray-500">
                    <p className="text-lg mb-2">Start building your page</p>
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
            scrollBehavior: 'auto',
            contain: 'layout style',
            isolation: 'isolate'
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
    </DndContext>
  )
}

// DIYZoneContent Component - Advanced widgets and saved sections
function DIYZoneContent({ showToast, usePageStore, buildWidget }: {
  showToast: (message: string, type: 'success' | 'error') => void
  usePageStore: any
  buildWidget: (item: any) => Widget
}) {
  const { customSections = [], canvasItems, replaceCanvasItems, addCustomSection, selectWidget } = usePageStore()

  // DIY Widgets - Advanced/Technical widgets for power users
  const diyWidgets = [
    { id: 'html-block', label: 'HTML Block', type: 'html-block' as const, description: 'Custom HTML content', skin: 'minimal' as const, status: 'supported' as const },
    { id: 'code-block', label: 'Code Block', type: 'code-block' as const, description: 'Syntax-highlighted code', skin: 'minimal' as const, status: 'supported' as const }
  ]

  // Save current canvas as a custom section
  const saveCurrentAsSection = () => {
    try {
      // Clear any selection first to avoid interference
      selectWidget(null)
      
      if (canvasItems.length === 0) {
        showToast('Cannot save empty canvas as section', 'error')
        return
      }

      const sectionName = prompt('Enter a name for this custom section:')
      if (!sectionName?.trim()) return

      const sectionDescription = prompt('Enter a description (optional):') || 'Custom saved section'

      // Count total widgets
      const totalWidgets = canvasItems.reduce((count: number, item: CanvasItem) => {
        if (isSection(item)) {
          return count + item.areas.reduce((areaCount: number, area: any) => areaCount + area.widgets.length, 0)
        } else {
          return count + 1 // standalone widget
        }
      }, 0)

      // Deep clone and regenerate IDs for canvas items to avoid conflicts
      const clonedCanvasItems = canvasItems.map((item: CanvasItem) => {
        if (isSection(item)) {
          // For sections, also regenerate widget IDs
          const newSectionId = nanoid()
          return {
            ...item,
            id: newSectionId,
            areas: item.areas.map(area => ({
              ...area,
              id: nanoid(),
              widgets: area.widgets.map(widget => ({
                ...widget,
                id: nanoid(),
                sectionId: newSectionId // Set to the new section ID
              }))
            }))
          }
        } else {
          // For standalone widgets
          return {
            ...item,
            id: nanoid()
          }
        }
      })

      // Create the custom section with proper structure
      const newSavedSection = {
        id: nanoid(),
        name: sectionName.trim(),
        description: sectionDescription,
        widgets: [], // Legacy field, keeping empty for compatibility
        createdAt: new Date(),
        canvasItems: clonedCanvasItems
      }

      addCustomSection(newSavedSection)
      showToast(`Section "${sectionName.trim()}" saved with ${totalWidgets} widget${totalWidgets !== 1 ? 's' : ''}!`, 'success')
    
    } catch (error) {
      console.error('❌ ERROR in saveCurrentAsSection:', error)
      showToast('Error saving section: ' + (error instanceof Error ? error.message : String(error)), 'error')
    }
  }

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
        
        <button
          onClick={saveCurrentAsSection}
          className="w-full p-3 text-left border-2 border-dashed border-gray-300 rounded-md hover:border-blue-300 hover:bg-blue-50 transition-colors mb-3"
        >
          <div className="font-medium text-sm text-gray-600">+ Save Current Canvas</div>
          <div className="text-xs text-gray-500">Save current sections as reusable template</div>
        </button>

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
                        console.log('🔍 Loading saved section:', {
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
  const { replaceCanvasItems, canvasItems } = usePageStore()

  // Create a new section with the specified layout and default areas
  const createSection = (layout: ContentBlockLayout, name: string) => {
    const newSection: CanvasItem = {
      id: nanoid(),
      name: name,
      type: 'content-block',
      layout: layout,
      areas: createAreasForLayout(layout)
    }
    return newSection
  }

  // Create areas based on layout type
  const createAreasForLayout = (layout: ContentBlockLayout) => {
    switch (layout) {
      case 'one-column':
        return [{ id: nanoid(), name: 'Content', widgets: [] }]
      
      case 'two-columns':
        return [
          { id: nanoid(), name: 'Left Column', widgets: [] },
          { id: nanoid(), name: 'Right Column', widgets: [] }
        ]
      
      case 'three-columns':
        return [
          { id: nanoid(), name: 'Left Column', widgets: [] },
          { id: nanoid(), name: 'Center Column', widgets: [] },
          { id: nanoid(), name: 'Right Column', widgets: [] }
        ]
      
      case 'hero-with-buttons':
        return [
          { id: nanoid(), name: 'Hero Content', widgets: [] },
          { id: nanoid(), name: 'Button Row', widgets: [] }
        ]
      
      case 'header-plus-grid':
        return [
          { id: nanoid(), name: 'Header', widgets: [] },
          { id: nanoid(), name: 'Left Card', widgets: [] },
          { id: nanoid(), name: 'Center Card', widgets: [] },
          { id: nanoid(), name: 'Right Card', widgets: [] }
        ]
      
      default:
        return [{ id: nanoid(), name: 'Content', widgets: [] }]
    }
  }

  // Add a section to the canvas
  const addSectionToCanvas = (layout: ContentBlockLayout, name: string) => {
    const newSection = createSection(layout, name)
    replaceCanvasItems([...canvasItems, newSection])
    showToast(`${name} section added successfully!`, 'success')
  }

  // Prefab sections are now handled by the modular prefabSections.ts

  const addPrefabSection = (type: 'hero' | 'features' | 'globalHeader' | 'journalBanner' | 'sidebar') => {
    let section: CanvasItem
    
    // Check if adding a sidebar and one already exists
    if (type === 'sidebar') {
      const existingSidebar = canvasItems.find((item: CanvasItem) => 
        isSection(item) && item.type === 'sidebar'
      )
      if (existingSidebar) {
        showToast('Only one sidebar is allowed per page', 'error')
        return
      }
      section = PREFAB_SECTIONS.sidebar()
    } else if (type === 'hero') {
      section = PREFAB_SECTIONS.hero()
    } else if (type === 'features') {
      section = PREFAB_SECTIONS.featuredResearch()
    } else if (type === 'globalHeader') {
      section = PREFAB_SECTIONS.globalHeader()
    } else if (type === 'journalBanner') {
      section = PREFAB_SECTIONS.journalBanner()
    } else {
      return // Invalid type
    }

    replaceCanvasItems([...canvasItems, section])
    showToast(`${(section as WidgetSection).name} added with template content!`, 'success')
  }

  return (
    <div className="space-y-6">

      
      {/* Template-Ready Sections */}
      <div>

        <h3 className="font-semibold text-gray-900 mb-3">
          Template-Ready Sections
        </h3>
        <div className="grid grid-cols-1 gap-2">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 mt-3 flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Global Sections
          </h4>
          <div className="space-y-3">
            <button
              onClick={() => addPrefabSection('globalHeader')}
              className="w-full p-3 text-left border-2 border-gray-200 bg-white rounded-md hover:bg-gray-50 transition-colors flex flex-col gap-3 cursor-grab active:cursor-grabbing"
            >
              <img 
                src="/layout-previews/globalHeader.png" 
                alt="Global Header Preview"
                className="w-full h-20 object-cover rounded border border-gray-200"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div>
                <div className="font-medium text-sm text-gray-900">Global Header</div>
                <div className="text-xs text-gray-700">University header + main navigation (reusable across pages)</div>
              </div>
            </button>
          </div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3 mt-3 flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Special Sections
          </h4>
          <div className="space-y-3">
            <button
              onClick={() => addPrefabSection('sidebar')}
              className="w-full p-3 text-left border-2 border-gray-200 bg-white rounded-md hover:bg-gray-50 transition-colors flex flex-col gap-3 cursor-grab active:cursor-grabbing"
            >
              <img 
                src="/layout-previews/sidebar.png" 
                alt="Sidebar Preview"
                className="w-full h-20 object-cover rounded border border-gray-200"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
          <div>
            <div className="font-medium text-sm text-gray-900">sidebar</div>
            <div className="text-xs text-gray-700">Vertical sidebar that can span multiple sections</div>
          </div>
            </button>
          </div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3 mt-3 flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Full Width Sections
          </h4>
          <div className="space-y-3">
            <button
              onClick={() => addPrefabSection('hero')}
              className="w-full p-3 text-left border-2 border-gray-200 bg-white rounded-md hover:bg-gray-50 transition-colors flex flex-col gap-3 cursor-grab active:cursor-grabbing"
            >
              <img 
                src="/layout-previews/hero.png" 
                alt="Hero Section Preview"
                className="w-full h-20 object-cover rounded border border-gray-200"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div>
                <div className="font-medium text-sm text-gray-900">Hero Section</div>
                <div className="text-xs text-gray-700">Full hero with heading, text, and action buttons</div>
              </div>
            </button>
            
            <button
              onClick={() => addPrefabSection('features')}
              className="w-full p-3 text-left border-2 border-gray-200 bg-white rounded-md hover:bg-gray-50 transition-colors flex flex-col gap-3 cursor-grab active:cursor-grabbing"
            >
              <img 
                src="/layout-previews/featuredResearch.png" 
                alt="Featured Research Preview"
                className="w-full h-20 object-cover rounded border border-gray-200"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div>
                <div className="font-medium text-sm text-gray-900">Featured Research</div>
                <div className="text-xs text-gray-700">Header with 3 research highlight cards</div>
              </div>
            </button>
            
            <button
              onClick={() => addPrefabSection('journalBanner')}
              className="w-full p-3 text-left border-2 border-gray-200 bg-white rounded-md hover:bg-gray-50 transition-colors flex flex-col gap-3 cursor-grab active:cursor-grabbing"
            >
              <img 
                src="/layout-previews/journalBanner.png" 
                alt="Journal Banner Preview"
                className="w-full h-20 object-cover rounded border border-gray-200"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div>
                <div className="font-medium text-sm text-gray-900">Journal Banner</div>
                <div className="text-xs text-gray-700">Dark gradient banner with publication details & CTA buttons</div>
              </div>
            </button>
        </div>
        </div>
      </div>
    </div>
  )
}

export default PageBuilder
