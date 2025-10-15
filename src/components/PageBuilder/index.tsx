import { useState, useMemo } from 'react'
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
import { PropertiesPanel } from '../Properties/PropertiesPanel'
import { LayoutPicker } from '../Canvas/LayoutPicker'
import { SortableItem } from '../Canvas/SortableItem'
import { CanvasThemeProvider } from '../Canvas/CanvasThemeProvider'

// Type imports
import type { 
  SchemaOrgType, 
  SchemaObject 
} from '../../types/schema'
import type { 
  Widget, 
  WidgetSection, 
  ContentBlockLayout, 
  CanvasItem 
} from '../../types/widgets'
import type { EditingContext, MockLiveSiteRoute } from '../../types'

// Component props interface
interface PageBuilderProps {
  usePageStore: any // TODO: Type this properly when extracting store
  buildWidget: (item: any) => Widget
  SectionsContent: React.ComponentType<{ showToast: (message: string, type: 'success' | 'error') => void }>
  DIYZoneContent: React.ComponentType<{ showToast: (message: string, type: 'success' | 'error') => void }>
  SchemaContentTab: React.ComponentType<{ onCreateSchema: (type: SchemaOrgType) => void }>
  SchemaFormEditor: React.ComponentType<{
    schemaType: SchemaOrgType
    initialData?: Partial<SchemaObject>
    onSave: (data: Omit<SchemaObject, 'id' | 'createdAt' | 'updatedAt'>) => void
    onCancel: () => void
  }>
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
  SectionsContent,
  DIYZoneContent,
  SchemaContentTab,
  SchemaFormEditor,
  TemplateCanvas,
  InteractiveWidgetRenderer,
  isSection
}: PageBuilderProps) {
  const instanceId = useMemo(() => Math.random().toString(36).substring(7), [])
  const { canvasItems, setCurrentView, selectWidget, selectedWidget, setInsertPosition, createContentBlockWithLayout, selectedSchemaObject, addSchemaObject, updateSchemaObject, selectSchemaObject, addNotification, replaceCanvasItems, editingContext, mockLiveSiteRoute } = usePageStore()
  const [leftSidebarTab, setLeftSidebarTab] = useState<LeftSidebarTab>('library')
  const [showLayoutPicker, setShowLayoutPicker] = useState(false)
  const [activeSectionToolbar, setActiveSectionToolbar] = useState<string | null>(null)
  const [activeWidgetToolbar, setActiveWidgetToolbar] = useState<string | null>(null)
  const [activeDropZone, setActiveDropZone] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  
  // Schema editing state
  const [creatingSchemaType, setCreatingSchemaType] = useState<SchemaOrgType | null>(null)
  
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
    console.log('🚀 Drag Start:', {
      activeId: event.active.id,
      activeType: event.active.data?.current?.type,
      activeData: event.active.data?.current
    })
    
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
      // Highlight section-area drop zones
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
      const targetSection = canvasItems.find(item => item.type === 'content-block' && item.id === sectionId)
      const targetArea = (targetSection && 'areas' in targetSection)
        ? targetSection.areas.find((area: any) => area.id === areaId)
        : undefined

      console.log('🎯 Target area before:', targetArea?.widgets?.length || 0, 'widgets')

      const updatedCanvasItems = canvasItems.map(canvasItem => {
        if (canvasItem.type === 'content-block' && canvasItem.id === sectionId) {
          return {
            ...canvasItem,
            areas: canvasItem.areas.map(area => 
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
        item => item.id === sectionId && 'areas' in item && Array.isArray((item as any).areas)
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
        const foundWidget = canvasItems.find(item => item.id === widgetId && !isSection(item))
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
      const newCanvasItems = canvasItems.filter(item => item.id !== widget.id)
      const updatedCanvasItems = newCanvasItems.map(canvasItem => {
        if (canvasItem.type === 'content-block' && canvasItem.id === sectionId) {
          const updatedWidget = { ...widget, sectionId: sectionId }
          return {
            ...canvasItem,
            areas: canvasItem.areas.map(area => 
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
        const updatedCanvasItems = canvasItems.map(canvasItem => {
          if (canvasItem.type === 'content-block') {
            return {
              ...canvasItem,
              areas: canvasItem.areas.map(area => {
                // Remove from source area
                if (area.id === fromAreaId) {
                  return { ...area, widgets: area.widgets.filter(w => w.id !== draggedWidget.id) }
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
        }).filter((item): item is CanvasItem => item !== undefined)
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
        const targetSection = canvasItems.find(item => item.id === targetSectionId && item.type === 'content-block') as WidgetSection
        if (!targetSection || !targetSection.areas.length) {
          console.log('❌ Target section not found or has no areas')
          return
        }
        
        const firstAreaId = targetSection.areas[0].id
        console.log('🎯 Target section found, first area:', firstAreaId)
        
        const updatedCanvasItems = canvasItems.map(canvasItem => {
          if (canvasItem.type === 'content-block') {
            return {
              ...canvasItem,
              areas: canvasItem.areas.map(area => {
                // Remove from source area
                if (area.id === fromAreaId) {
                  return { ...area, widgets: area.widgets.filter(w => w.id !== draggedWidget.id) }
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

    // Handle existing canvas item reordering (sections and standalone widgets) - EXCLUDE section-widgets!
    if (!active.data?.current?.type || 
        active.data?.current?.type === 'canvas-section' ||
        active.data?.current?.type === 'canvas-widget' ||
        active.data?.current?.type === 'standalone-widget' ||
        (active.data?.current?.type !== 'library-widget' && 
         active.data?.current?.type !== 'section-widget')) {
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
        const oldIndex = canvasItems.findIndex((item) => item.id === activeItemId)
        const newIndex = canvasItems.findIndex((item) => item.id === targetId)
        
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
    e.stopPropagation()
    // Close any widget toolbar and toggle section toolbar
    setActiveWidgetToolbar(null)
    handleSetActiveSectionToolbar(activeSectionToolbar === sectionId ? null : sectionId)
    selectWidget(sectionId)
  }

  const handleWidgetClick = (widgetId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    console.log('🖱️ Widget clicked for properties:', { widgetId })
    
    // Find the widget to check its sectionId - use same logic as Properties Panel
    let widget: Widget | undefined = canvasItems.find(item => item.id === widgetId && !isSection(item)) as Widget
    
    // If not found at canvas level, search within section areas
    if (!widget) {
      for (const canvasItem of canvasItems) {
        if (isSection(canvasItem)) {
          for (const area of canvasItem.areas) {
            const foundWidget = area.widgets.find(w => w.id === widgetId)
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
            {leftSidebarTab === 'sections' && <SectionsContent showToast={showToast} />}
            {leftSidebarTab === 'diy-zone' && <DIYZoneContent showToast={showToast} />}
            {leftSidebarTab === 'schema-content' && <SchemaContentTab onCreateSchema={handleCreateSchema} />}
          </div>
        </div>

        <div className="flex-1 flex flex-col h-screen overflow-y-auto">
          <div className="border-b bg-white px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Page Builder</h1>
              <div className="flex items-center gap-3">
              <button
                  onClick={() => {
                    const { addNotification, setCurrentView } = usePageStore.getState()
                    addNotification({
                      type: 'success',
                      title: 'Changes Published',
                      message: 'Your changes have been published to the live site'
                    })
                    setCurrentView('mock-live-site')
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Publish Changes
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
            {usePageStore(state => state.editingContext) === 'page' && (
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
                    {canvasItems.map((item, index) => (
                      <div key={item.id} className="relative group">
                        {/* Add Section Button Above */}
                        {item.id !== 'header-section' && (
                          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <button
                              onClick={() => handleAddSection(item.id, 'above')}
                              className="px-3 py-1 bg-white border border-gray-300 text-gray-600 text-sm rounded-md hover:bg-gray-50 transition-colors"
                            >
                              Add Section
                            </button>
                          </div>
                        )}
                        
                        <SortableItem 
                          item={item} 
                          isSelected={selectedWidget === item.id}
                          onSectionClick={handleSectionClick}
                          onWidgetClick={handleWidgetClick}
                          activeSectionToolbar={activeSectionToolbar}
                          setActiveSectionToolbar={handleSetActiveSectionToolbar}
                          activeWidgetToolbar={activeWidgetToolbar}
                          setActiveWidgetToolbar={setActiveWidgetToolbar}
                          activeDropZone={activeDropZone}
                          showToast={showToast}
                          instanceId={instanceId}
                          usePageStore={usePageStore}
                          InteractiveWidgetRenderer={InteractiveWidgetRenderer}
                        />
                        
                        {/* Add Section Button Below */}
                        {index === canvasItems.length - 1 && (
                          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <button
                              onClick={() => handleAddSection(item.id, 'below')}
                              className="px-3 py-1 bg-white border border-gray-300 text-gray-600 text-sm rounded-md hover:bg-gray-50 transition-colors"
                            >
                              Add Section
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </SortableContext>
              )}
            </div>
            </CanvasThemeProvider>
          </div>
        </div>

      {/* Right Sidebar - Properties Panel - Sticky */}
      <div className="w-80 bg-slate-100 shadow-sm border-l border-slate-200 flex flex-col sticky top-0 h-screen">
        <div className="border-b border-slate-200 p-4">
          <h2 className="font-semibold text-slate-800">Properties</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          <PropertiesPanel 
            creatingSchemaType={creatingSchemaType}
            selectedSchemaObject={selectedSchemaObject}
            onSaveSchema={handleSaveSchema}
            onCancelSchema={handleCancelSchema}
            usePageStore={usePageStore}
            SchemaFormEditor={SchemaFormEditor}
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

export default PageBuilder
