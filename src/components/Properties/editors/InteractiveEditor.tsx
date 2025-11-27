/**
 * InteractiveEditor - Property editors for Interactive widgets
 * 
 * Contains: Collapse (Tabs is more complex, kept separate)
 * 
 * Extracted from PropertiesPanel.tsx for better modularity.
 */

import React from 'react'
import type { Widget } from '../../../types'

interface InteractiveEditorProps {
  widget: Widget
  updateWidget: (updates: Partial<Widget>) => void
}

interface CollapsePanel {
  id: string
  title: string
  isOpen: boolean
  widgets: any[]
}

/**
 * CollapseEditor - Property editor for Collapse/Accordion widgets
 */
export function CollapseEditor({ widget, updateWidget }: InteractiveEditorProps) {
  const collapseWidget = widget as any // CollapseWidget type
  
  const handlePanelTitleChange = (index: number, newTitle: string) => {
    const newPanels = [...(collapseWidget.panels || [])]
    newPanels[index] = { ...newPanels[index], title: newTitle }
    updateWidget({ panels: newPanels })
  }
  
  const handleDeletePanel = (index: number) => {
    const newPanels = (collapseWidget.panels || []).filter((_: any, i: number) => i !== index)
    updateWidget({ panels: newPanels })
  }
  
  const handleAddPanel = () => {
    const newPanel: CollapsePanel = {
      id: `panel-${Date.now()}`,
      title: `Panel ${(collapseWidget.panels?.length || 0) + 1}`,
      isOpen: false,
      widgets: []
    }
    updateWidget({ panels: [...(collapseWidget.panels || []), newPanel] })
  }
  
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Accordion Behavior</label>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={collapseWidget.allowMultiple || false}
            onChange={(e) => updateWidget({ allowMultiple: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 mr-2"
          />
          <span className="text-sm text-gray-700">Allow multiple panels open</span>
        </label>
        <p className="text-xs text-gray-500 mt-1">
          When off, only one panel can be open at a time (accordion mode)
        </p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Style</label>
        <select
          value={collapseWidget.style || 'default'}
          onChange={(e) => updateWidget({ style: e.target.value as 'default' | 'bordered' | 'minimal' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="default">Default</option>
          <option value="bordered">Bordered</option>
          <option value="minimal">Minimal</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Icon Position</label>
        <select
          value={collapseWidget.iconPosition || 'right'}
          onChange={(e) => updateWidget({ iconPosition: e.target.value as 'left' | 'right' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="left">Left</option>
          <option value="right">Right</option>
        </select>
      </div>
      
      <div className="border-t pt-4">
        <label className="block text-sm font-medium text-gray-700 mb-3">Panels</label>
        <div className="space-y-2 mb-3">
          {(collapseWidget.panels || []).map((panel: CollapsePanel, index: number) => (
            <div key={panel.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
              <input
                type="text"
                value={panel.title}
                onChange={(e) => handlePanelTitleChange(index, e.target.value)}
                className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                placeholder="Panel title"
              />
              <button
                onClick={() => handleDeletePanel(index)}
                className="p-1 text-red-600 hover:bg-red-50 rounded"
                title="Delete panel"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={handleAddPanel}
          className="w-full px-3 py-2 border border-blue-300 text-blue-700 rounded-md text-sm hover:bg-blue-50 transition-colors"
        >
          + Add Panel
        </button>
      </div>
    </div>
  )
}

export default CollapseEditor

