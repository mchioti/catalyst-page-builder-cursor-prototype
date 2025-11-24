/**
 * Editor Canvas
 * Display page composition with add/remove/reorder controls
 */

import { useState } from 'react'
import { useEditorStore } from '../../stores/editorStore'
import { useSharedSectionsStore } from '../../stores/sharedSectionsStore'
import { ArrowUp, ArrowDown, Trash2, AlertCircle } from 'lucide-react'
import { SectionModificationModal } from './SectionModificationModal'
import type { SectionCompositionItem } from '../../types/core'

export function EditorCanvas() {
  const composition = useEditorStore(state => state.composition)
  const removeSection = useEditorStore(state => state.removeSection)
  const reorderSections = useEditorStore(state => state.reorderSections)
  const selectedSectionId = useEditorStore(state => state.selectedSectionId)
  const setSelectedSection = useEditorStore(state => state.setSelectedSection)
  
  const getSectionById = useSharedSectionsStore(state => state.getSectionById)
  
  const [modifyingSection, setModifyingSection] = useState<SectionCompositionItem | null>(null)
  
  const handleMoveUp = (index: number) => {
    if (index > 0) {
      reorderSections(index, index - 1)
    }
  }
  
  const handleMoveDown = (index: number) => {
    if (index < composition.length - 1) {
      reorderSections(index, index + 1)
    }
  }
  
  if (composition.length === 0) {
    return (
      <div className="flex-1 bg-gray-100 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Empty Canvas
          </h3>
          <p className="text-gray-600 mb-4">
            Start building your page by adding sections from the library on the left.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-left">
            <div className="font-medium text-blue-900 mb-2">💡 Quick Start:</div>
            <ol className="text-blue-800 space-y-1 list-decimal list-inside">
              <li>Click a section in the left sidebar</li>
              <li>Add variations to compose your page</li>
              <li>Reorder sections with arrow buttons</li>
              <li>Save when you're done</li>
            </ol>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <>
      <div className="flex-1 bg-gray-100 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-8 space-y-4">
        {composition.map((item, index) => {
          const sharedSection = getSectionById(item.sharedSectionId)
          const variation = sharedSection?.variations[item.variationKey]
          const isSelected = selectedSectionId === item.id
          
          if (!sharedSection || !variation) {
            return (
              <div key={item.id} className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-red-700 font-medium">
                  ⚠️ Section not found: {item.sharedSectionId}
                </div>
              </div>
            )
          }
          
          return (
            <div
              key={item.id}
              onClick={() => setSelectedSection(item.id)}
              className={`bg-white rounded-lg border-2 transition-all ${
                isSelected
                  ? 'border-blue-500 shadow-lg'
                  : 'border-gray-200 hover:border-gray-300 shadow-sm'
              }`}
            >
              {/* Section Header with Controls */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-gray-50">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {sharedSection.name} → {variation.name}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="px-2 py-0.5 bg-gray-200 rounded">
                      {sharedSection.category}
                    </span>
                    {item.inheritFromTheme && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                        Inherited
                      </span>
                    )}
                    {item.divergenceCount > 0 && (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded">
                        {item.divergenceCount} override{item.divergenceCount !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Controls */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleMoveUp(index)
                    }}
                    disabled={index === 0}
                    className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleMoveDown(index)
                    }}
                    disabled={index === composition.length - 1}
                    className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setModifyingSection(item)
                    }}
                    className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Modify this section for this page"
                  >
                    Modify
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeSection(item.id)
                    }}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Remove section"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Section Preview */}
              <div className="p-6">
                <div className="bg-gray-50 border border-gray-200 rounded p-4">
                  <div className="text-sm text-gray-600 mb-2">
                    Layout: <span className="font-medium">{variation.layout}</span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    Widgets: <span className="font-medium">{variation.widgets.length}</span>
                  </div>
                  {variation.background && (
                    <div className="text-sm text-gray-600">
                      Background: <span className="font-medium">{variation.background.type}</span>
                      {variation.background.color && (
                        <span 
                          className="inline-block w-4 h-4 rounded ml-2 border border-gray-300"
                          style={{ backgroundColor: variation.background.color }}
                        />
                      )}
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  💡 Click to select, use properties panel to modify
                </div>
              </div>
            </div>
          )
        })}
        </div>
      </div>
      
      {/* Modification Modal */}
      {modifyingSection && (
        <SectionModificationModal
          compositionItem={modifyingSection}
          onClose={() => setModifyingSection(null)}
        />
      )}
    </>
  )
}

