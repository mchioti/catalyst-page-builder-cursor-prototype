import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { DraggableLibraryWidget } from '../Canvas/DraggableLibraryWidget'
import { LIBRARY_CONFIG } from '../../library'

interface WidgetLibraryProps {
  usePageStore: any // TODO: Type this properly when extracting store
  buildWidget: (item: any) => any // TODO: Type this properly
}

export function WidgetLibrary({ usePageStore, buildWidget }: WidgetLibraryProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['core']) // Expand Core category by default to show HTML Block widget
  )

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900">Widget Library</h3>
      <div className="space-y-3">
        {LIBRARY_CONFIG.map((category: any) => {
          const isExpanded = expandedCategories.has(category.id)
          
          return (
            <div key={category.id} className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full p-3 bg-gray-50 border-b flex items-center justify-between hover:bg-gray-100 transition-colors"
              >
                <h4 className="font-medium text-gray-900">{category.name}</h4>
                <ChevronDown 
                  className={`w-4 h-4 text-gray-500 transition-transform ${
                    isExpanded ? 'transform rotate-180' : ''
                  }`} 
                />
              </button>
              
              {isExpanded && (
                <div className="p-3 space-y-2">
                  {category.groups?.map((group: any) => (
                    <div key={group.id}>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">{group.name}</h5>
                      <div className="space-y-1">
                        {group.items?.map((item: any) => (
                          <DraggableLibraryWidget key={item.id} item={item} usePageStore={usePageStore} buildWidget={buildWidget} />
                        ))}
                      </div>
                    </div>
                  )) || (
                    // Handle categories with direct items (no groups)
                    category.items?.map((item: any) => (
                      <DraggableLibraryWidget key={item.id} item={item} usePageStore={usePageStore} buildWidget={buildWidget} />
                    ))
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
