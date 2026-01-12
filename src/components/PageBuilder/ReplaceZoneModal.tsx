import React, { useState } from 'react'
import { X, AlertTriangle, Check, Layers, Palette, Move } from 'lucide-react'
import type { WidgetSection, Widget } from '../../types/widgets'

interface ReplaceZoneModalProps {
  zoneSlug: string
  section: WidgetSection
  onConfirm: (preserveOptions: PreserveOptions) => void
  onCancel: () => void
}

export interface PreserveOptions {
  preserveBackground: boolean
  preservePadding: boolean
  preserveContentMode: boolean
}

export function ReplaceZoneModal({ 
  zoneSlug, 
  section, 
  onConfirm, 
  onCancel 
}: ReplaceZoneModalProps) {
  // Default to preserving all styles
  const [preserveBackground, setPreserveBackground] = useState(true)
  const [preservePadding, setPreservePadding] = useState(true)
  const [preserveContentMode, setPreserveContentMode] = useState(true)

  // Collect all widgets from the section
  const allWidgets: Widget[] = []
  section.areas?.forEach(area => {
    if (area.widgets && area.widgets.length > 0) {
      allWidgets.push(...area.widgets)
    }
  })

  // Check what styling exists on the section
  const hasBackground = section.background && section.background.type !== 'none'
  const hasPadding = section.padding && section.padding !== '0' && section.padding !== ''
  const hasContentMode = section.contentMode && section.contentMode !== 'light'

  const handleConfirm = () => {
    onConfirm({
      preserveBackground,
      preservePadding,
      preserveContentMode
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Layers className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Replace Zone Layout</h3>
              <p className="text-sm text-gray-500">Zone: <code className="bg-gray-100 px-1 rounded">{zoneSlug}</code></p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Widgets that will be moved */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Move className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  {allWidgets.length > 0 
                    ? `${allWidgets.length} widget${allWidgets.length !== 1 ? 's' : ''} will be moved`
                    : 'No widgets to move'
                  }
                </p>
                {allWidgets.length > 0 && (
                  <ul className="mt-1 text-xs text-blue-700 space-y-0.5">
                    {allWidgets.slice(0, 5).map((widget, idx) => (
                      <li key={idx} className="flex items-center gap-1">
                        <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                        {widget.type}
                        {(widget as any).text && `: "${(widget as any).text.slice(0, 20)}${(widget as any).text.length > 20 ? '...' : ''}"`}
                      </li>
                    ))}
                    {allWidgets.length > 5 && (
                      <li className="text-blue-600 italic">...and {allWidgets.length - 5} more</li>
                    )}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Style preservation options */}
          {(hasBackground || hasPadding || hasContentMode) && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Palette className="w-4 h-4" />
                <span>Preserve existing styles?</span>
              </div>
              
              <div className="space-y-2 pl-6">
                {/* Background */}
                {hasBackground && (
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={preserveBackground}
                      onChange={(e) => setPreserveBackground(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <span className="text-sm text-gray-700 group-hover:text-gray-900">Background</span>
                      <span className="text-xs text-gray-500 ml-2">
                        ({section.background?.type === 'color' && 'color'}
                        {section.background?.type === 'gradient' && 'gradient'}
                        {section.background?.type === 'image' && 'image'})
                      </span>
                    </div>
                  </label>
                )}

                {/* Padding */}
                {hasPadding && (
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={preservePadding}
                      onChange={(e) => setPreservePadding(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <span className="text-sm text-gray-700 group-hover:text-gray-900">Padding</span>
                      <span className="text-xs text-gray-500 ml-2">({section.padding})</span>
                    </div>
                  </label>
                )}

                {/* Content Mode */}
                {hasContentMode && (
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={preserveContentMode}
                      onChange={(e) => setPreserveContentMode(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <span className="text-sm text-gray-700 group-hover:text-gray-900">Content Mode</span>
                      <span className="text-xs text-gray-500 ml-2">({section.contentMode})</span>
                    </div>
                  </label>
                )}
              </div>
            </div>
          )}

          {/* Warning if no styles to preserve */}
          {!hasBackground && !hasPadding && !hasContentMode && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-sm text-gray-600">
                <Check className="w-4 h-4 inline mr-1 text-green-500" />
                No custom styles to preserve. Ready to select new layout.
              </p>
            </div>
          )}

          {/* Info about widget placement */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-800">
                All widgets will be placed in the first area of the new layout. 
                You can rearrange them afterward. Delete unwanted widgets before or after replacing.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            Choose New Layout
          </button>
        </div>
      </div>
    </div>
  )
}
