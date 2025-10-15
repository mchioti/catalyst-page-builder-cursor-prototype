import React, { useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { Code } from 'lucide-react'
import type { LibraryItem as SpecItem } from '../../library'

// We need to import usePageStore and buildWidget - for now we'll declare them as passed props
interface DraggableLibraryWidgetProps {
  item: SpecItem
  isDIY?: boolean
  usePageStore: any // TODO: Type this properly when extracting store
  buildWidget: (item: SpecItem) => any // TODO: Type this properly
}

export function DraggableLibraryWidget({ item, isDIY = false, usePageStore, buildWidget }: DraggableLibraryWidgetProps) {
  const { addWidget } = usePageStore()
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
    
    // Show message encouraging drag to section instead of direct add
    console.log('💡 Widget clicked - please drag into a section instead of clicking')
    // TODO: Show a toast notification or visual feedback
    // For now, we'll still add to canvas for backwards compatibility
    const newWidget = buildWidget(item)
    addWidget(newWidget)
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
        <div>
      {item.label}
      {item.status === 'planned' && (
        <span className="ml-2 text-xs text-orange-600">(Planned)</span>
          )}
        </div>
      )}
    </button>
  )
}
