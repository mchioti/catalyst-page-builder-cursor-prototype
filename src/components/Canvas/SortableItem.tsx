import React from 'react'
import { nanoid } from 'nanoid'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Copy, Edit, Trash2 } from 'lucide-react'
import { SectionRenderer } from '../Sections/SectionRenderer'
import { StandaloneWidgetDragHandle } from './StandaloneWidgetDragHandle'
import type { WidgetSection, CanvasItem } from '../../types/widgets'

// Helper function to check if item is a section
function isSection(item: CanvasItem): item is WidgetSection {
  return 'layout' in item
}

interface SortableItemProps {
  item: CanvasItem
  isSelected: boolean
  onSectionClick: (id: string, e: React.MouseEvent) => void
  onWidgetClick: (id: string, e: React.MouseEvent) => void
  activeSectionToolbar: string | null
  setActiveSectionToolbar: (value: string | null) => void
  activeWidgetToolbar: string | null
  setActiveWidgetToolbar: (value: string | null) => void
  activeDropZone: string | null
  showToast: (message: string, type: 'success' | 'error') => void
  usePageStore: any // TODO: Type this properly when extracting store
  InteractiveWidgetRenderer: any // TODO: Type this properly
  journalContext?: string // Journal code for branding (advma, embo, etc.)
}

export function SortableItem({ 
  item, 
  isSelected, 
  onSectionClick, 
  onWidgetClick,
  activeSectionToolbar,
  setActiveSectionToolbar,
  activeWidgetToolbar,
  setActiveWidgetToolbar,
  activeDropZone,
  showToast,
  usePageStore,
  InteractiveWidgetRenderer,
  journalContext
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ 
    id: item.id,
    data: {
      type: isSection(item) ? 'canvas-section' : 'canvas-widget',
      item: item
    }
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const getSectionName = (item: WidgetSection) => {
    const specialSections: Record<string, string> = {
      'header-section': 'Header',
      'hero-section': 'Hero', 
      'footer-section': 'Footer',
      'features-section': 'Features'
    }
    return specialSections[item.id] || 'Section'
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`group relative border-2 transition-all ${
        isSelected 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-transparent hover:border-gray-200'
      }`}
    >
      
      {isSection(item) ? (
        <div 
          onClick={(e) => onSectionClick(item.id, e)}
          className="cursor-pointer"
        >
          {/* Section Selection Indicator */}
          {isSelected && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
          )}
          {isSelected && (
            <div className="absolute -left-16 top-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium z-10">
              {getSectionName(item)}
            </div>
          )}
          
          <SectionRenderer 
            section={item} 
            onWidgetClick={onWidgetClick}
            dragAttributes={attributes}
            dragListeners={listeners}
            activeSectionToolbar={activeSectionToolbar}
            setActiveSectionToolbar={setActiveSectionToolbar}
            activeWidgetToolbar={activeWidgetToolbar}
            setActiveWidgetToolbar={setActiveWidgetToolbar}
            activeDropZone={activeDropZone}
            showToast={showToast}
            usePageStore={usePageStore}
            journalContext={journalContext}
          />
        </div>
      ) : (
        <div className="cursor-pointer hover:ring-2 hover:ring-blue-300 rounded transition-all relative">
          {/* Overlay to capture clicks on interactive widgets */}
          <div 
            className="absolute inset-0 z-10 bg-transparent hover:bg-blue-50/10 transition-colors"
            style={{ pointerEvents: 'auto' }}
            onClick={(e) => {
              e.stopPropagation()
              console.log('🎯 Standalone overlay click detected:', { 
                widgetId: item.id, 
                widgetType: item.type 
              })
              // Close any section toolbar and toggle widget toolbar
              setActiveSectionToolbar?.(null)
              setActiveWidgetToolbar(activeWidgetToolbar === item.id ? null : item.id)
              onWidgetClick(item.id, e)
            }}
          />
          {/* Standalone Widget Action Toolbar - appears on click */}
          {activeWidgetToolbar === item.id && (
            <div className="absolute -top-2 -right-2 transition-opacity z-20" style={{ pointerEvents: 'auto' }}>
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg shadow-lg px-2 py-1">
              <StandaloneWidgetDragHandle 
                sortableAttributes={attributes}
                sortableListeners={listeners}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  // Duplicate standalone widget
                  const { replaceCanvasItems, canvasItems } = usePageStore.getState()
                  const itemIndex = canvasItems.findIndex((canvasItem: CanvasItem) => canvasItem.id === item.id)
                  if (itemIndex !== -1) {
                    const duplicatedWidget = { ...item, id: nanoid() }
                    const newCanvasItems = [...canvasItems]
                    newCanvasItems.splice(itemIndex + 1, 0, duplicatedWidget)
                    replaceCanvasItems(newCanvasItems)
                  }
                }}
                className="p-1 text-gray-500 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors"
                title="Duplicate widget"
              >
                <Copy className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onWidgetClick(item.id, e)
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
                  deleteWidget(item.id)
                }}
                className="p-1 text-gray-500 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                title="Delete widget"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
          )}
          
          {/* Make widget content non-interactive in edit mode */}
          <div style={{ pointerEvents: 'none', position: 'relative', zIndex: 1 }}>
            <InteractiveWidgetRenderer 
              widget={item}
              dragAttributes={attributes}
              dragListeners={listeners}
              onWidgetClick={onWidgetClick}
              activeSectionToolbar={activeSectionToolbar}
              setActiveSectionToolbar={setActiveSectionToolbar}
              activeWidgetToolbar={activeWidgetToolbar}
              setActiveWidgetToolbar={setActiveWidgetToolbar}
            />
          </div>
        </div>
      )}
    </div>
  )
}
