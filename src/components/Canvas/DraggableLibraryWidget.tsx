import React, { useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { Code } from 'lucide-react'
import { nanoid } from 'nanoid'
import type { LibraryItem as SpecItem } from '../../library'
import type { WidgetSection } from '../../types/widgets'
import { NewBadge } from '../shared/NewBadge'

// We need to import usePageStore and buildWidget - for now we'll declare them as passed props
interface DraggableLibraryWidgetProps {
  item: SpecItem
  isDIY?: boolean
  usePageStore: any // TODO: Type this properly when extracting store
  buildWidget: (item: SpecItem) => any // TODO: Type this properly
}

export function DraggableLibraryWidget({ item, isDIY = false, usePageStore, buildWidget }: DraggableLibraryWidgetProps) {
  const { replaceCanvasItems, canvasItems } = usePageStore()
  const [dragStarted, setDragStarted] = useState(false)
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `library-${item.id}`,
    data: {
      type: 'library-widget',
      item: item
    }
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined

  const handleClick = (e: React.MouseEvent) => {
    // Prevent click if drag was started
    if (dragStarted) {
      e.preventDefault()
      setDragStarted(false)
      return
    }
    
    console.log('🎯 Widget clicked - auto-creating section with widget!', {
      widgetLabel: item.label,
      widgetType: item.type
    })
    
    // Create new widget
    const newWidget = buildWidget(item)
    
    // Create new one-column section with the widget
    const newSectionId = nanoid()
    const newAreaId = nanoid()
    newWidget.sectionId = newSectionId
    
    const newSection: WidgetSection = {
      id: newSectionId,
      type: 'content-block',
      name: `Section with ${item.label || newWidget.type}`,
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
    
    // Add section to end of canvas
    const newCanvasItems = [...canvasItems, newSection]
    
    console.log('✅ Created new section with widget via click:', {
      sectionId: newSectionId,
      widgetType: newWidget.type,
      widgetId: newWidget.id,
      totalSections: newCanvasItems.length
    })
    
    replaceCanvasItems(newCanvasItems)
  }

  const handlePointerDown = () => {
    setDragStarted(false)
  }


  return (
    <button
      ref={setNodeRef}
      style={style}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      data-testid={`library-widget-${item.type}`}
      {...attributes}
      {...listeners}
      className={`block w-full text-left rounded transition-colors cursor-grab active:cursor-grabbing ${
        isDIY 
          ? 'p-3 border border-orange-200 bg-orange-50 hover:bg-orange-100' 
          : 'p-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700'
      } ${isDragging ? 'opacity-50' : ''}`}
      title="Drag to drop into a section"
    >
      {isDIY ? (
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Code className="w-4 h-4 text-orange-600" />
            <span className="font-medium text-gray-900">{item.label}</span>
          </div>
          <p className="text-sm text-gray-600">{item.description}</p>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span>{item.label}</span>
          <NewBadge itemId={`widget:${item.type}`} variant="compact" />
          {item.status === 'planned' && (
            <span className="text-xs text-orange-600">(Planned)</span>
          )}
        </div>
      )}
    </button>
  )
}
