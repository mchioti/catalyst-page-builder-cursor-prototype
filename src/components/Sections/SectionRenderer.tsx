import React, { useState, useEffect } from 'react'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { GripVertical, Copy, Edit, Trash2, BookOpen } from 'lucide-react'
import { 
  Widget, 
  WidgetSection, 
  ContentBlockLayout, 
  LayoutArea, 
  isSection 
} from '../../types/widgets'
import WidgetRenderer from '../Widgets/WidgetRenderer'

// Component for draggable widgets within sections
export function DraggableWidgetInSection({ 
  widget, 
  sectionId, 
  areaId, 
  activeSectionToolbar, 
  setActiveSectionToolbar, 
  activeWidgetToolbar, 
  setActiveWidgetToolbar, 
  onWidgetClick,
  usePageStore
}: {
  widget: Widget
  sectionId: string
  areaId: string
  activeSectionToolbar?: string | null
  setActiveSectionToolbar?: (value: string | null) => void
  activeWidgetToolbar: string | null
  setActiveWidgetToolbar: (value: string | null) => void
  onWidgetClick: (id: string, e: React.MouseEvent) => void
  usePageStore: any
}) {
  // Each widget gets its own draggable hook - no hooks rule violation
  const widgetDrag = useDraggable({
    id: `widget-${widget.id}`,
    data: {
      type: 'section-widget',
      widget: widget,
      fromSectionId: sectionId,
      fromAreaId: areaId
    }
  })
  
  return (
    <div 
      ref={widgetDrag.setNodeRef}
      style={widgetDrag.transform ? {
        transform: `translate3d(${widgetDrag.transform.x}px, ${widgetDrag.transform.y}px, 0)`,
      } : undefined}
      className={`cursor-pointer hover:ring-2 hover:ring-blue-300 rounded transition-all group relative ${
        widgetDrag.isDragging ? 'opacity-50' : ''
      }`}
    >
      {/* Overlay to capture clicks on interactive widgets */}
      <div 
        className="absolute inset-0 z-10 bg-transparent hover:bg-blue-50/10 transition-colors"
        style={{ pointerEvents: 'auto' }}
        onClick={(e) => {
          e.stopPropagation()
          console.log('🎯 Overlay click detected:', { 
            widgetId: widget.id, 
            widgetType: widget.type 
          })
          // Only close section toolbar if it's not for the current widget's section
          if (activeSectionToolbar !== widget.sectionId) {
            setActiveSectionToolbar?.(null)
          }
          setActiveWidgetToolbar(activeWidgetToolbar === widget.id ? null : widget.id)
          onWidgetClick(widget.id, e)
        }}
      />
      {/* Widget Action Toolbar - appears on click (outside non-interactive area) */}
      {activeWidgetToolbar === widget.id && (
        <div className="absolute -top-2 -right-2 transition-opacity z-20" style={{ pointerEvents: 'auto' }}>
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg shadow-lg px-2 py-1">
            <div 
              {...widgetDrag.attributes}
              {...widgetDrag.listeners}
              className="p-1 text-gray-500 hover:text-gray-700 cursor-grab active:cursor-grabbing rounded hover:bg-gray-100 transition-colors"
              title="Drag to move widget between sections"
            >
              <GripVertical className="w-3 h-3" />
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                // Duplicate widget logic
                const { replaceCanvasItems, canvasItems } = usePageStore.getState()
                const duplicatedWidget = { ...widget, id: crypto.randomUUID() }
                
                const updatedCanvasItems = canvasItems.map(canvasItem => {
                  if (isSection(canvasItem)) {
                    return {
                      ...canvasItem,
                      areas: canvasItem.areas.map(area => 
                        area.widgets.some(w => w.id === widget.id)
                          ? { ...area, widgets: [...area.widgets, duplicatedWidget] }
                          : area
                      )
                    }
                  }
                  return canvasItem
                })
                replaceCanvasItems(updatedCanvasItems)
              }}
              className="p-1 text-gray-500 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors"
              title="Duplicate widget"
            >
              <Copy className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onWidgetClick(widget.id, e)
              }}
              className="p-1 text-gray-500 hover:text-purple-600 rounded hover:bg-purple-50 transition-colors"
              title="Properties"
            >
              <Edit className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                const { deleteWidget } = usePageStore.getState()
                deleteWidget(widget.id)
              }}
              className="p-1 text-gray-500 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
              title="Delete widget"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
      
      {/* Modification Indicator - Only show in template editing mode */}
      {(widget as any).isModified && usePageStore.getState().editingContext === 'template' && (
        <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 z-30">
          <span className="text-[10px] font-medium">🔧 Modified</span>
        </div>
      )}
      
      {/* Make widget content non-interactive in edit mode */}
      <div style={{ pointerEvents: 'none', position: 'relative', zIndex: 1 }}>
        <WidgetRenderer 
          widget={widget} 
        />
      </div>
    </div>
  )
}

// Main SectionRenderer component
export function SectionRenderer({ 
  section, 
  onWidgetClick,
  dragAttributes,
  dragListeners,
  activeSectionToolbar,
  setActiveSectionToolbar,
  activeWidgetToolbar,
  setActiveWidgetToolbar,
  activeDropZone,
  showToast,
  instanceId,
  usePageStore
}: { 
  section: WidgetSection
  onWidgetClick: (id: string, e: React.MouseEvent) => void
  dragAttributes?: any
  dragListeners?: any
  activeSectionToolbar: string | null
  setActiveSectionToolbar: (value: string | null) => void
  activeWidgetToolbar: string | null
  setActiveWidgetToolbar: (value: string | null) => void
  activeDropZone: string | null
  showToast: (message: string, type: 'success' | 'error') => void
  instanceId: string
  usePageStore: any // Zustand store hook
}) {
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [sectionName, setSectionName] = useState('')
  const [sectionDescription, setSectionDescription] = useState('')
  
  const getLayoutClasses = (layout: ContentBlockLayout) => {
    switch (layout) {
      case 'one-column':
        return 'grid-cols-1'
      case 'two-columns':
        return 'grid-cols-2'
      case 'three-columns':
        return 'grid-cols-3'
      case 'one-third-left':
        return 'grid-cols-3 [&>:first-child]:col-span-1 [&>:last-child]:col-span-2'
      case 'one-third-right':
        return 'grid-cols-3 [&>:first-child]:col-span-2 [&>:last-child]:col-span-1'
      case 'vertical':
        return 'grid-cols-1'
      default:
        return 'grid-cols-1'
    }
  }

  // Generate background styles based on section background configuration
  const getSectionBackgroundStyles = (section: WidgetSection) => {
    const background = section.background
    if (!background || background.type === 'none') {
      return {}
    }

    const styles: React.CSSProperties = {}
    const opacity = background.opacity !== undefined ? background.opacity : 1

    switch (background.type) {
      case 'color':
        if (background.color) {
          styles.backgroundColor = background.color
          styles.opacity = opacity
        }
        break
        
      case 'image':
        if (background.image?.url) {
          styles.backgroundImage = `url(${background.image.url})`
          styles.backgroundPosition = background.image.position || 'center'
          styles.backgroundRepeat = background.image.repeat || 'no-repeat'
          styles.backgroundSize = background.image.size || 'cover'
          styles.opacity = opacity
        }
        break
        
      case 'gradient':
        if (background.gradient?.stops && background.gradient.stops.length >= 2) {
          const { type, direction, stops } = background.gradient
          const gradientStops = stops.map(stop => `${stop.color} ${stop.position}`).join(', ')
          
          if (type === 'linear') {
            styles.backgroundImage = `linear-gradient(${direction || 'to right'}, ${gradientStops})`
          } else if (type === 'radial') {
            styles.backgroundImage = `radial-gradient(circle, ${gradientStops})`
          }
          styles.opacity = opacity
        }
        break
    }

    return styles
  }

  // Get section container classes with background awareness
  const getSectionContainerClasses = (section: WidgetSection) => {
    const hasBackground = section.background && section.background.type !== 'none'
    const baseClasses = 'group transition-all relative cursor-grab active:cursor-grabbing'
    
    if (isSpecialSection) {
      return `${baseClasses} p-2 hover:bg-gray-50 border-2 border-transparent hover:border-blue-200 ${hasBackground ? 'min-h-20' : ''}`
    } else {
      // If section has custom background, use more neutral styling
      if (hasBackground) {
        return `${baseClasses} border-2 border-gray-300 p-2 rounded hover:border-blue-400 min-h-20`
      } else {
        return `${baseClasses} border-2 border-purple-200 bg-purple-50 p-2 rounded hover:border-blue-400 hover:bg-purple-100`
      }
    }
  }

  const isSpecialSection = ['header-section', 'hero-section', 'footer-section', 'features-section'].includes(section.id)

  const handleSaveSection = () => {
    if (sectionName.trim()) {
      const { addCustomSection } = usePageStore.getState()
      
      // Count widgets in the section for better metadata
      const widgetCount = section.areas.reduce((count, area) => count + area.widgets.length, 0)
      
      const customSection = {
        id: crypto.randomUUID(),
        name: sectionName.trim(),
        description: sectionDescription.trim() || 'Custom saved section',
        widgets: section.areas.flatMap(area => area.widgets), // Store flattened widget list for easier counting
        createdAt: new Date(),
        section: {
          ...section,
          id: crypto.randomUUID() // Generate new ID for the saved section
        }
      }
      addCustomSection(customSection)
      setShowSaveModal(false)
      setSectionName('')
      setSectionDescription('')
      
      // Show success notification
      showToast(`"${sectionName.trim()}" saved successfully with ${widgetCount} widget${widgetCount !== 1 ? 's' : ''}!`, 'success')
    }
  }

  const handleDuplicateSection = () => {
    const { replaceCanvasItems, canvasItems } = usePageStore.getState()
    const sectionIndex = canvasItems.findIndex(item => item.id === section.id)
    
    if (sectionIndex !== -1) {
      const duplicatedSection = JSON.parse(JSON.stringify(section))
      duplicatedSection.id = crypto.randomUUID()
      // Update all widget IDs in the duplicated section
      duplicatedSection.areas = duplicatedSection.areas.map((area: any) => ({
        ...area,
        id: crypto.randomUUID(),
        widgets: area.widgets.map((widget: any) => ({
          ...widget,
          id: crypto.randomUUID(),
          sectionId: duplicatedSection.id
        }))
      }))
      
      const newCanvasItems = [...canvasItems]
      newCanvasItems.splice(sectionIndex + 1, 0, duplicatedSection)
      replaceCanvasItems(newCanvasItems)
      
      // Show success notification
      const widgetCount = section.areas.reduce((count, area) => count + area.widgets.length, 0)
      showToast(`Section duplicated successfully with ${widgetCount} widget${widgetCount !== 1 ? 's' : ''}!`, 'success')
    }
  }

  return (
    <>
      <div 
        className={getSectionContainerClasses(section)}
        style={getSectionBackgroundStyles(section)}
        onClick={(e) => {
          e.stopPropagation()
          const newValue = activeSectionToolbar === section.id ? null : section.id
          // Close any widget toolbar and toggle section toolbar
          setActiveWidgetToolbar(null)
          setActiveSectionToolbar(newValue)
          // Select the section for properties panel (use selectWidget directly)
          const { selectWidget } = usePageStore.getState()
          selectWidget(section.id)
        }}
        {...dragAttributes}
        {...dragListeners}
      >
        {/* Section Action Toolbar - appears on click */}
        {activeSectionToolbar === section.id && (
          <div className="absolute -top-2 -right-2 transition-opacity z-20">
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg shadow-lg px-2 py-1">
              <div 
                {...dragAttributes}
                {...dragListeners}
                className="p-1 text-gray-500 hover:text-gray-700 cursor-grab active:cursor-grabbing rounded hover:bg-gray-100 transition-colors"
                title="Drag to reorder section"
              >
                <GripVertical className="w-3 h-3" />
              </div>
              <button
                onClick={handleDuplicateSection}
                className="p-1 text-gray-500 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors"
                title="Duplicate section"
              >
                <Copy className="w-3 h-3" />
              </button>
              <button
                onClick={() => setShowSaveModal(true)}
                className="p-1 text-gray-500 hover:text-green-600 rounded hover:bg-green-50 transition-colors"
                title="Save as custom section"
              >
                <BookOpen className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  // Could add section properties/settings here in the future
                }}
                className="p-1 text-gray-500 hover:text-purple-600 rounded hover:bg-purple-50 transition-colors"
                title="Section properties"
              >
                <Edit className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  const { replaceCanvasItems, canvasItems } = usePageStore.getState()
                  const newCanvasItems = canvasItems.filter(item => item.id !== section.id)
                  replaceCanvasItems(newCanvasItems)
                }}
                className="p-1 text-gray-500 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                title="Delete section"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
        
        {/* Removed repetitive section info - cleaner UI */}
      
      <div className={`grid gap-2 ${getLayoutClasses(section.layout)}`}>
        {section.areas.map((area) => {
          // Make area droppable for library widgets
          const { isOver, setNodeRef: setDropRef } = useDroppable({
            id: `drop-${area.id}`,
            data: {
              type: 'section-area',
              sectionId: section.id,
              areaId: area.id
            }
          })
          
          // Debug logging for drop zone
          React.useEffect(() => {
            if (isOver) {
              console.log('🎯 Drop zone active:', area.id, 'in section:', section.id)
            }
          }, [isOver, area.id, section.id])
          
          return (
          <div 
            ref={setDropRef}
            key={area.id} 
            className={`relative ${
              isSpecialSection 
                ? '' 
                : area.widgets.length === 0 
                  ? `min-h-20 border-2 border-dashed rounded p-4 bg-white transition-all ${
                      activeDropZone === `drop-${area.id}` 
                        ? 'border-green-400 bg-green-50 ring-2 ring-green-200' 
                        : isOver 
                        ? 'border-blue-400 bg-blue-50' 
                        : 'border-purple-300 opacity-60'
                    }` 
                  : activeDropZone === `drop-${area.id}` 
                    ? 'bg-green-50 rounded p-2 ring-2 ring-green-200 border-2 border-green-300' 
                    : activeDropZone === `drop-${area.id}` 
                      ? 'bg-green-50 rounded p-2 ring-2 ring-green-200 border-2 border-green-300' 
                      : 'bg-white rounded p-2'
            }`}
          >
            {!isSpecialSection && area.widgets.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <span className={`text-xs transition-colors ${
                  activeDropZone === `drop-${area.id}` 
                    ? 'text-green-700 font-bold' 
                    : isOver 
                    ? 'text-blue-600 font-medium' 
                    : 'text-purple-400'
                }`}>
                  {activeDropZone === `drop-${area.id}` 
                    ? 'ACTIVE DROP ZONE' 
                    : isOver 
                    ? 'Drop widget here' 
                    : 'Drop widgets here'}
                </span>
              </div>
            )}
            
            {/* Active Drop Zone Indicator for Populated Areas */}
            {area.widgets.length > 0 && activeDropZone === `drop-${area.id}` && (
              <div className="absolute top-1 right-1 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold z-10 shadow-lg">
                ACTIVE DROP ZONE
              </div>
            )}
            
            {area.widgets.map((widget) => (
              <DraggableWidgetInSection
                key={widget.id}
                widget={widget}
                sectionId={section.id}
                areaId={area.id}
                activeSectionToolbar={activeSectionToolbar}
                setActiveSectionToolbar={setActiveSectionToolbar}
                activeWidgetToolbar={activeWidgetToolbar}
                setActiveWidgetToolbar={setActiveWidgetToolbar}
                onWidgetClick={onWidgetClick}
                usePageStore={usePageStore}
              />
            ))}
          </div>
        )})}
      </div>
      </div>
      
      {/* Save Section Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
            <h3 className="text-lg font-semibold mb-4">Save Custom Section</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section Name *
                </label>
                <input
                  type="text"
                  value={sectionName}
                  onChange={(e) => setSectionName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter section name"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={sectionDescription}
                  onChange={(e) => setSectionDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md h-20 resize-none"
                  placeholder="Enter section description"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowSaveModal(false)
                  setSectionName('')
                  setSectionDescription('')
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSection}
                disabled={!sectionName.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Section
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
