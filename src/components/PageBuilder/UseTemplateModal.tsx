/**
 * UseTemplateModal - Modal for choosing how to use a saved template
 * 
 * When applying a template to a page, the user can choose:
 * 1. "Start as Copy" - One-time snapshot, page is independent (no sync)
 * 2. "Sync with Master" - Page inherits from template, stays synced
 * 
 * This implements the "decide at use time" pattern for inheritance.
 */

import React, { useState } from 'react'
import { X, Copy, Link2, AlertTriangle, CheckCircle2, Layers } from 'lucide-react'
import type { CanvasItem, WidgetSection } from '../../types/widgets'

export interface TemplateInfo {
  id: string
  name: string
  description?: string
  canvasItems: CanvasItem[]
  // For display label (contextual language)
  displayLabel?: {
    singular: string
    plural: string
  }
}

interface UseTemplateModalProps {
  isOpen: boolean
  onClose: () => void
  template: TemplateInfo | null
  onUseCopy: (template: TemplateInfo) => void
  onUseSync: (template: TemplateInfo) => void
  currentPageName?: string // For context in messaging
}

export function UseTemplateModal({
  isOpen,
  onClose,
  template,
  onUseCopy,
  onUseSync,
  currentPageName
}: UseTemplateModalProps) {
  const [selectedOption, setSelectedOption] = useState<'copy' | 'sync'>('copy')
  
  if (!isOpen || !template) return null
  
  const handleConfirm = () => {
    if (selectedOption === 'copy') {
      onUseCopy(template)
    } else {
      onUseSync(template)
    }
    onClose()
  }
  
  // Count sections and widgets for display
  const sectionCount = template.canvasItems.filter(item => item.type === 'section').length
  const widgetCount = template.canvasItems.reduce((count, item) => {
    if (item.type === 'section') {
      const section = item as WidgetSection
      return count + (section.areas?.reduce((areaCount, area) => 
        areaCount + (area.widgets?.length || 0), 0) || 0)
    }
    return count
  }, 0)
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Use Template</h2>
              <p className="text-indigo-100 text-sm mt-1">
                Choose how to apply "{template.name}"
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Template Info */}
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Layers className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{template.name}</h3>
              <p className="text-sm text-gray-500">
                {sectionCount} section{sectionCount !== 1 ? 's' : ''} • {widgetCount} widget{widgetCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          {template.description && (
            <p className="mt-3 text-sm text-gray-600">{template.description}</p>
          )}
        </div>
        
        {/* Options */}
        <div className="p-6 space-y-4">
          {/* Copy Option */}
          <label
            className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
              selectedOption === 'copy'
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="flex items-start gap-4">
              <input
                type="radio"
                name="use-template-option"
                value="copy"
                checked={selectedOption === 'copy'}
                onChange={() => setSelectedOption('copy')}
                className="w-5 h-5 mt-0.5 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Copy className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-gray-900">Start as Copy</span>
                </div>
                <p className="mt-1.5 text-sm text-gray-600">
                  Your page will be <strong>independent</strong>. Changes to the original 
                  template won't affect your page.
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>One-time snapshot • Full control • No sync</span>
                </div>
              </div>
            </div>
          </label>
          
          {/* Sync Option */}
          <label
            className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
              selectedOption === 'sync'
                ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="flex items-start gap-4">
              <input
                type="radio"
                name="use-template-option"
                value="sync"
                checked={selectedOption === 'sync'}
                onChange={() => setSelectedOption('sync')}
                className="w-5 h-5 mt-0.5 text-indigo-600 focus:ring-indigo-500"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-indigo-600" />
                  <span className="font-semibold text-gray-900">Sync with Master</span>
                </div>
                <p className="mt-1.5 text-sm text-gray-600">
                  Your page will <strong>stay in sync</strong> with "{template.name}". 
                  Updates to the master will appear on your page.
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                  <Link2 className="w-4 h-4 text-indigo-500" />
                  <span>Linked • Auto-updates • Can modify zones locally</span>
                </div>
                
                {/* Sync explanation */}
                <div className="mt-3 p-3 bg-indigo-100/50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-indigo-700">
                      You can still customize individual zones. Customized zones won't be 
                      affected by master updates. You can also unlink later if needed.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </label>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">
          <p className="text-xs text-gray-500">
            {currentPageName && (
              <>Applying to: <strong>{currentPageName}</strong></>
            )}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className={`px-5 py-2 text-sm font-medium text-white rounded-lg transition-colors flex items-center gap-2 ${
                selectedOption === 'copy'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {selectedOption === 'copy' ? (
                <>
                  <Copy className="w-4 h-4" />
                  Use as Copy
                </>
              ) : (
                <>
                  <Link2 className="w-4 h-4" />
                  Sync with Master
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UseTemplateModal
