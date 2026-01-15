import { X, Info } from 'lucide-react'
import type { ContentBlockLayout } from '../../types/widgets'

interface LayoutPickerProps {
  onSelectLayout: (layout: ContentBlockLayout) => void
  onClose: () => void
  title?: string // Custom title for the modal (e.g., "Replace Zone Layout")
  subtitle?: string // Custom subtitle (e.g., "Replacing header_local zone")
}

interface LayoutOption {
  id: ContentBlockLayout
  name: string
  description: string
  badge?: string
  badgeColor?: string
}

interface LayoutCategory {
  title: string
  subtitle: string
  layouts: LayoutOption[]
  color: string
}

export function LayoutPicker({ onSelectLayout, onClose, title, subtitle }: LayoutPickerProps) {
  const categories: LayoutCategory[] = [
    {
      title: 'Modern Layouts',
      subtitle: 'For galleries, repeating patterns, and flowing content (flat hierarchy)',
      color: 'purple',
      layouts: [
        { 
          id: 'grid' as ContentBlockLayout, 
          name: 'Grid', 
          description: 'CSS Grid for galleries and equal-sized items. Widgets auto-flow into columns.',
          badge: 'Recommended',
          badgeColor: 'blue'
        },
        { 
          id: 'flexible' as ContentBlockLayout, 
          name: 'Flex', 
          description: 'Flexbox for toolbars, navigation, tags. Natural sizing with wrapping.',
          badge: 'Recommended',
          badgeColor: 'blue'
        }
      ]
    },
    {
      title: 'Column Layouts',
      subtitle: 'For sidebars and grouped content (each column holds multiple widgets)',
      color: 'gray',
      layouts: [
        { 
          id: 'one-column' as ContentBlockLayout, 
          name: 'One Column', 
          description: 'Single column. Stack multiple widgets vertically.'
        },
        { 
          id: 'two-columns' as ContentBlockLayout, 
          name: 'Two Columns', 
          description: 'Two equal columns (50/50). Group different widgets in each.'
        },
        { 
          id: 'three-columns' as ContentBlockLayout, 
          name: 'Three Columns', 
          description: 'Three equal columns (33/33/33). Perfect for feature sections.'
        },
        { 
          id: 'one-third-left' as ContentBlockLayout, 
          name: 'Sidebar Left', 
          description: 'Sidebar on left (1/3) + Main content (2/3).'
        },
        { 
          id: 'one-third-right' as ContentBlockLayout, 
          name: 'Sidebar Right', 
          description: 'Main content (2/3) + Sidebar on right (1/3).'
        }
      ]
    }
  ]

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={(e) => e.stopPropagation()}
    >
      <div 
        className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title || 'Choose Layout Type'}</h3>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Help Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Quick Guide</p>
              <p className="text-xs mt-1">
                <strong>Grid/Flex:</strong> All widgets are siblings (like photo gallery). 
                <strong className="ml-2">Columns:</strong> Each column can have multiple different widgets (like sidebar + content).
              </p>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category.title}>
              <div className="mb-3">
                <h4 className="text-sm font-semibold text-gray-900">{category.title}</h4>
                <p className="text-xs text-gray-600">{category.subtitle}</p>
              </div>
              
              <div className="space-y-2">
                {category.layouts.map((layout) => (
                  <button
                    key={layout.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectLayout(layout.id)
                    }}
                    className="w-full text-left p-3 rounded-md border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-medium text-gray-900 group-hover:text-blue-700">
                        {layout.name}
                      </div>
                      {layout.badge && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          layout.badgeColor === 'blue' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {layout.badge}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-600">{layout.description}</div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
