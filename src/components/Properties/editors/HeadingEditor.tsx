/**
 * HeadingEditor - Property editor for Heading widgets
 * 
 * Handles heading text, semantic level (H1-H6), alignment, style,
 * size override, and icon selection.
 * 
 * Extracted from PropertiesPanel.tsx for better modularity.
 */

import React from 'react'
import { Info } from 'lucide-react'
import type { HeadingWidget, Widget } from '../../../types'
import { IconSelector } from '../IconSelector'

interface HeadingEditorProps {
  widget: Widget
  updateWidget: (updates: Partial<Widget>) => void
}

/**
 * HeadingEditor - Full property editor for Heading widgets
 */
export function HeadingEditor({ widget, updateWidget }: HeadingEditorProps) {
  const headingWidget = widget as HeadingWidget
  
  // Get auto size label based on heading level
  const getAutoSizeLabel = (level: number): string => {
    switch (level) {
      case 1: return 'Extra Large'
      case 2: return 'Large'
      case 3: return 'Medium'
      default: return 'Small'
    }
  }
  
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Heading Text</label>
        <input
          type="text"
          value={headingWidget.text}
          onChange={(e) => updateWidget({ text: e.target.value })}
          placeholder="Enter your heading text"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Semantic Level</label>
          <select
            value={headingWidget.level}
            onChange={(e) => updateWidget({ level: parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5 | 6 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value={1}>H1 (Main Title)</option>
            <option value={2}>H2 (Section)</option>
            <option value={3}>H3 (Subsection)</option>
            <option value={4}>H4 (Subheading)</option>
            <option value={5}>H5 (Minor Head)</option>
            <option value={6}>H6 (Small Head)</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Alignment</label>
          <select
            value={headingWidget.align || 'left'}
            onChange={(e) => updateWidget({ align: e.target.value as 'left' | 'center' | 'right' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Heading Style</label>
        <select
          value={headingWidget.style || 'default'}
          onChange={(e) => updateWidget({ style: e.target.value as HeadingWidget['style'] })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="default">Default</option>
          <option value="bordered-left">Bordered Left</option>
          <option value="underlined">Underlined</option>
          <option value="highlighted">Highlighted Background</option>
          <option value="decorated">Decorated</option>
          <option value="gradient">Gradient Text</option>
          <option value="hero">Hero - Bold white text with margin</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
        <select
          value={headingWidget.size || 'auto'}
          onChange={(e) => updateWidget({ size: e.target.value as HeadingWidget['size'] })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="auto">
            Auto ({getAutoSizeLabel(headingWidget.level)})
          </option>
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
          <option value="xl">Extra Large</option>
        </select>
      </div>
      
      <div className="border-t pt-4">
        <IconSelector
          icon={headingWidget.icon}
          onChange={(icon) => updateWidget({ icon })}
        />
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Heading Best Practices</p>
            <ul className="text-xs space-y-1">
              <li>• Use semantic levels (H1→H2→H3) for proper structure</li>
              <li>• Auto sizing creates visual hierarchy: H1=XL, H2=Large, etc.</li>
              <li>• Keep headings concise and descriptive</li>
              <li>• Use styles (Hero, Decorated) for visual emphasis</li>
              <li>• Override size only when needed for design consistency</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeadingEditor

