import { X } from 'lucide-react'
import type { ContentBlockLayout } from '../../types/widgets'

interface LayoutPickerProps {
  onSelectLayout: (layout: ContentBlockLayout) => void
  onClose: () => void
}

export function LayoutPicker({ onSelectLayout, onClose }: LayoutPickerProps) {
  const layouts = [
    { id: 'flexible' as ContentBlockLayout, name: 'Flexible', description: 'Responsive layout' },
    { id: 'one-column' as ContentBlockLayout, name: 'One Column', description: 'Full width column' },
    { id: 'two-columns' as ContentBlockLayout, name: 'Two Columns', description: 'Equal columns' },
    { id: 'three-columns' as ContentBlockLayout, name: 'Three Columns', description: 'Equal columns' },
    { id: 'one-third-left' as ContentBlockLayout, name: 'One-Third Left', description: '1/3 + 2/3 columns' },
    { id: 'one-third-right' as ContentBlockLayout, name: 'One-Third Right', description: '2/3 + 1/3 columns' },
    { id: 'vertical' as ContentBlockLayout, name: 'Vertical Section', description: 'Stacked rows' }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Choose Layout</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-2">
          {layouts.map((layout) => (
            <button
              key={layout.id}
              onClick={() => onSelectLayout(layout.id)}
              className="w-full text-left p-3 rounded-md border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div className="font-medium text-gray-900">{layout.name}</div>
              <div className="text-sm text-gray-500">{layout.description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
