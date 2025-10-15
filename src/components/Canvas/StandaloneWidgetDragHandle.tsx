import { GripVertical } from 'lucide-react'

interface StandaloneWidgetDragHandleProps {
  sortableAttributes: any
  sortableListeners: any
}

export function StandaloneWidgetDragHandle({ 
  sortableAttributes, 
  sortableListeners 
}: StandaloneWidgetDragHandleProps) {
  // Use the sortable attributes and listeners from parent SortableItem
  return (
    <div 
      className="p-1 text-gray-500 hover:text-gray-700 cursor-grab active:cursor-grabbing rounded hover:bg-gray-100 transition-colors"
      title="Drag to reorder or move to section"
      {...sortableAttributes}
      {...sortableListeners}
    >
      <GripVertical className="w-3 h-3" />
    </div>
  )
}
