/**
 * Properties Panel
 * Show details and allow modification of selected section
 */

import { useEditorStore } from '../../stores/editorStore'
import { useSharedSectionsStore } from '../../stores/sharedSectionsStore'
import { Settings, Info } from 'lucide-react'

export function PropertiesPanel() {
  const composition = useEditorStore(state => state.composition)
  const selectedSectionId = useEditorStore(state => state.selectedSectionId)
  const getSectionById = useSharedSectionsStore(state => state.getSectionById)
  
  const selectedItem = composition.find(item => item.id === selectedSectionId)
  const sharedSection = selectedItem ? getSectionById(selectedItem.sharedSectionId) : null
  const variation = selectedItem && sharedSection ? sharedSection.variations[selectedItem.variationKey] : null
  
  if (!selectedItem || !sharedSection || !variation) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-gray-400" />
          <h2 className="font-semibold text-gray-900">Properties</h2>
        </div>
        <div className="text-sm text-gray-500 flex items-start gap-2">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            Select a section from the canvas to view and edit its properties.
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
      <div className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" />
          <h2 className="font-semibold text-gray-900">Properties</h2>
        </div>
      </div>
      
      <div className="p-4 space-y-6">
        {/* Section Info */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Section Info</h3>
          <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
            <div>
              <div className="text-xs text-gray-500">Shared Section</div>
              <div className="font-medium text-gray-900">{sharedSection.name}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Variation</div>
              <div className="font-medium text-gray-900">{variation.name}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Category</div>
              <div className="font-medium text-gray-900 capitalize">{sharedSection.category}</div>
            </div>
          </div>
        </div>
        
        {/* Inheritance Status */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Inheritance</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="inherit"
                checked={selectedItem.inheritFromTheme}
                disabled
                className="rounded"
              />
              <label htmlFor="inherit" className="text-sm text-gray-700">
                Inherit from theme
              </label>
            </div>
            {selectedItem.divergenceCount > 0 ? (
              <div className="bg-amber-50 border border-amber-200 rounded p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-sm font-semibold text-amber-900">
                    {selectedItem.divergenceCount} modification{selectedItem.divergenceCount !== 1 ? 's' : ''}
                  </div>
                </div>
                <p className="text-xs text-amber-700 mb-2">
                  This section has page-specific modifications. Unmodified fields still inherit updates.
                </p>
                {selectedItem.overrides?.widgets && selectedItem.overrides.widgets.length > 0 && (
                  <div className="space-y-1 mt-2">
                    <div className="text-xs font-medium text-amber-800">Modified widgets:</div>
                    {selectedItem.overrides.widgets.map((override, idx) => (
                      <div key={idx} className="text-xs text-amber-700 bg-amber-100 px-2 py-1 rounded">
                        Widget {idx + 1}: {override.type || 'Unknown'}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded p-2 text-xs text-green-800">
                ✓ Fully inheriting from base section
              </div>
            )}
          </div>
        </div>
        
        {/* Layout Info */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Layout</h3>
          <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
            <div>
              <div className="text-xs text-gray-500">Type</div>
              <div className="font-medium text-gray-900">{variation.layout}</div>
            </div>
            {variation.flexConfig && (
              <div>
                <div className="text-xs text-gray-500">Flex Config</div>
                <div className="font-mono text-xs text-gray-700">
                  {variation.flexConfig.direction}, gap: {variation.flexConfig.gap}
                </div>
              </div>
            )}
            {variation.gridConfig && (
              <div>
                <div className="text-xs text-gray-500">Grid Config</div>
                <div className="font-mono text-xs text-gray-700">
                  {variation.gridConfig.columns} columns, gap: {variation.gridConfig.gap}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Background */}
        {variation.background && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Background</h3>
            <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
              <div>
                <div className="text-xs text-gray-500">Type</div>
                <div className="font-medium text-gray-900 capitalize">{variation.background.type}</div>
              </div>
              {variation.background.color && (
                <div>
                  <div className="text-xs text-gray-500">Color</div>
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-6 h-6 rounded border border-gray-300"
                      style={{ backgroundColor: variation.background.color }}
                    />
                    <span className="font-mono text-xs text-gray-700">
                      {variation.background.color}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Widgets */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Widgets ({variation.widgets.length})
          </h3>
          <div className="space-y-1">
            {variation.widgets.map((widget, index) => (
              <div
                key={widget.id}
                className="bg-gray-50 rounded p-2 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">{index + 1}.</span>
                  <span className="font-medium text-gray-900 capitalize">{widget.type}</span>
                  <span className="text-gray-500">{widget.skin}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Future: Override Controls */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-sm font-medium text-blue-900 mb-1">🚧 Coming Soon</div>
          <div className="text-xs text-blue-700">
            Override controls to modify this section instance will be added in Phase 3.
          </div>
        </div>
      </div>
    </div>
  )
}

