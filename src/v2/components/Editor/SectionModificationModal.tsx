/**
 * Section Modification Modal
 * Allows modifying a specific section instance (creating overrides)
 */

import { useState } from 'react'
import { X, AlertTriangle, RotateCcw } from 'lucide-react'
import type { SectionCompositionItem } from '../../types/core'
import type { Widget } from '../../../types/widgets'
import { useSharedSectionsStore } from '../../stores/sharedSectionsStore'
import { useEditorStore } from '../../stores/editorStore'

interface SectionModificationModalProps {
  compositionItem: SectionCompositionItem
  onClose: () => void
}

export function SectionModificationModal({ compositionItem, onClose }: SectionModificationModalProps) {
  const getSectionById = useSharedSectionsStore(state => state.getSectionById)
  const updateSection = useEditorStore(state => state.updateSection)
  
  const sharedSection = getSectionById(compositionItem.sharedSectionId)
  const baseVariation = sharedSection?.variations[compositionItem.variationKey]
  
  // Start with overrides if they exist, otherwise use base widgets
  const baseWidgets = baseVariation?.widgets || []
  const currentOverrides = compositionItem.overrides?.widgets || []
  
  // Merge base widgets with any existing overrides
  const initialWidgets = baseWidgets.map(baseWidget => {
    const override = currentOverrides.find(o => o.id === baseWidget.id)
    return override ? { ...baseWidget, ...override } : baseWidget
  })
  
  const [modifiedWidgets, setModifiedWidgets] = useState<Partial<Widget>[]>(initialWidgets)
  
  if (!sharedSection || !baseVariation) {
    return null
  }
  
  const handleWidgetChange = (widgetIndex: number, field: string, value: any) => {
    const newWidgets = [...modifiedWidgets]
    newWidgets[widgetIndex] = { ...newWidgets[widgetIndex], [field]: value }
    setModifiedWidgets(newWidgets)
  }
  
  const handleResetWidget = (widgetIndex: number) => {
    const newWidgets = [...modifiedWidgets]
    newWidgets[widgetIndex] = { ...baseWidgets[widgetIndex] }
    setModifiedWidgets(newWidgets)
  }
  
  const handleSave = () => {
    // Calculate which widgets have been modified
    const overrides: Partial<Widget>[] = []
    modifiedWidgets.forEach((modWidget, index) => {
      const baseWidget = baseWidgets[index]
      const hasChanges = JSON.stringify(modWidget) !== JSON.stringify(baseWidget)
      
      if (hasChanges) {
        overrides.push({ id: baseWidget.id, ...modWidget })
      }
    })
    
    // Update the composition item with overrides
    updateSection(compositionItem.id, {
      overrides: {
        ...compositionItem.overrides,
        widgets: overrides
      },
      inheritFromTheme: overrides.length === 0, // Still inheriting if no overrides
      divergenceCount: overrides.length
    })
    
    onClose()
  }
  
  const hasAnyChanges = modifiedWidgets.some((modWidget, index) => 
    JSON.stringify(modWidget) !== JSON.stringify(baseWidgets[index])
  )
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Modify Section
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {sharedSection.name} → {baseVariation.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Warning */}
        <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <strong>Creating page-specific modifications</strong>
              <p className="mt-1 text-blue-700">
                Changes here apply only to this page. The base section will continue to inherit 
                updates for non-modified fields.
              </p>
            </div>
          </div>
        </div>
        
        {/* Widget List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {modifiedWidgets.map((widget, index) => {
            const baseWidget = baseWidgets[index]
            const hasChanges = JSON.stringify(widget) !== JSON.stringify(baseWidget)
            
            return (
              <div
                key={widget.id || index}
                className={`border-2 rounded-lg p-4 transition-colors ${
                  hasChanges ? 'border-amber-300 bg-amber-50' : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded flex items-center justify-center font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 capitalize">{widget.type}</div>
                      <div className="text-xs text-gray-500">{widget.skin}</div>
                    </div>
                    {hasChanges && (
                      <span className="px-2 py-0.5 bg-amber-600 text-white text-xs rounded-full font-medium">
                        Modified
                      </span>
                    )}
                  </div>
                  {hasChanges && (
                    <button
                      onClick={() => handleResetWidget(index)}
                      className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset to Base
                    </button>
                  )}
                </div>
                
                {/* Editable Fields */}
                {widget.type === 'heading' && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Text</label>
                    <input
                      type="text"
                      value={widget.text || ''}
                      onChange={(e) => handleWidgetChange(index, 'text', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={baseWidget.text as string}
                    />
                  </div>
                )}
                
                {widget.type === 'text' && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Text</label>
                    <textarea
                      value={widget.text || ''}
                      onChange={(e) => handleWidgetChange(index, 'text', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={baseWidget.text as string}
                    />
                  </div>
                )}
                
                {widget.type === 'image' && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Image URL</label>
                    <input
                      type="text"
                      value={widget.src || ''}
                      onChange={(e) => handleWidgetChange(index, 'src', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={baseWidget.src as string}
                    />
                    {hasChanges && (
                      <div className="text-xs text-amber-700 bg-amber-100 px-2 py-1 rounded">
                        Base: {baseWidget.src as string}
                      </div>
                    )}
                  </div>
                )}
                
                {widget.type === 'menu' && (
                  <div className="bg-gray-50 rounded p-3">
                    <div className="text-sm text-gray-700">
                      Menu with {widget.items?.length || 0} items
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Menu editing will be available in a future update
                    </div>
                  </div>
                )}
                
                {widget.type === 'spacer' && (
                  <div className="text-sm text-gray-600">
                    Spacer widget (height: {widget.height})
                  </div>
                )}
              </div>
            )
          })}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {modifiedWidgets.filter((w, i) => JSON.stringify(w) !== JSON.stringify(baseWidgets[i])).length} widget
            {modifiedWidgets.filter((w, i) => JSON.stringify(w) !== JSON.stringify(baseWidgets[i])).length !== 1 ? 's' : ''} modified
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!hasAnyChanges}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Modifications
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

