/**
 * CoreElementsEditor - Property editors for Core Page Elements
 * 
 * Contains: Divider, Spacer
 * (Text, Heading, Image handled separately due to complexity)
 * 
 * Extracted from PropertiesPanel.tsx for better modularity.
 */

import React from 'react'
import type { Widget } from '../../../types'

interface CoreElementEditorProps {
  widget: Widget
  updateWidget: (updates: Partial<Widget>) => void
}

/**
 * DividerEditor - Property editor for Divider widgets
 */
export function DividerEditor({ widget, updateWidget }: CoreElementEditorProps) {
  const dividerWidget = widget as any // DividerWidget type
  
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Style</label>
        <select
          value={dividerWidget.style || 'solid'}
          onChange={(e) => updateWidget({ style: e.target.value as 'solid' | 'dashed' | 'dotted' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="solid">Solid</option>
          <option value="dashed">Dashed</option>
          <option value="dotted">Dotted</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Thickness</label>
        <select
          value={dividerWidget.thickness || '1px'}
          onChange={(e) => updateWidget({ thickness: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="1px">1px (Thin)</option>
          <option value="2px">2px (Medium)</option>
          <option value="3px">3px (Thick)</option>
          <option value="4px">4px (Extra Thick)</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
        <input
          type="color"
          value={dividerWidget.color || '#e5e7eb'}
          onChange={(e) => updateWidget({ color: e.target.value })}
          className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
        />
        <input
          type="text"
          value={dividerWidget.color || '#e5e7eb'}
          onChange={(e) => updateWidget({ color: e.target.value })}
          placeholder="#e5e7eb"
          className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2 text-sm font-mono"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Margin Top</label>
        <input
          type="text"
          value={dividerWidget.marginTop || '1rem'}
          onChange={(e) => updateWidget({ marginTop: e.target.value })}
          placeholder="1rem"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
        <p className="text-xs text-gray-500 mt-1">e.g., 1rem, 16px, 2em</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Margin Bottom</label>
        <input
          type="text"
          value={dividerWidget.marginBottom || '1rem'}
          onChange={(e) => updateWidget({ marginBottom: e.target.value })}
          placeholder="1rem"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
        <p className="text-xs text-gray-500 mt-1">e.g., 1rem, 16px, 2em</p>
      </div>
    </div>
  )
}

/**
 * SpacerEditor - Property editor for Spacer widgets
 */
export function SpacerEditor({ widget, updateWidget }: CoreElementEditorProps) {
  const spacerWidget = widget as any // SpacerWidget type
  
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Height</label>
        <select
          value={spacerWidget.height || '2rem'}
          onChange={(e) => updateWidget({ height: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
        >
          <option value="0.5rem">0.5rem (8px) - Extra Small</option>
          <option value="1rem">1rem (16px) - Small</option>
          <option value="2rem">2rem (32px) - Medium</option>
          <option value="3rem">3rem (48px) - Large</option>
          <option value="4rem">4rem (64px) - Extra Large</option>
          <option value="6rem">6rem (96px) - Huge</option>
        </select>
        
        <label className="block text-sm font-medium text-gray-700 mb-2 mt-4">Custom Height</label>
        <input
          type="text"
          value={spacerWidget.height || '2rem'}
          onChange={(e) => updateWidget({ height: e.target.value })}
          placeholder="2rem"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
        <p className="text-xs text-gray-500 mt-1">e.g., 2rem, 50px, 5vh, 10%</p>
      </div>
    </div>
  )
}

export default { DividerEditor, SpacerEditor }

