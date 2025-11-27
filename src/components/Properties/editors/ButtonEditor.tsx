/**
 * ButtonEditor - Property editor for Button Link widgets
 * 
 * Extracted from PropertiesPanel.tsx for better modularity.
 */

import React from 'react'
import type { ButtonWidget, Widget } from '../../../types'
import { usePageStore } from '../../../stores'
import { IconSelector } from '../IconSelector'

interface ButtonEditorProps {
  widget: Widget
  updateWidget: (updates: Partial<Widget>) => void
}

/**
 * ButtonEditor - Full property editor for Button widgets
 */
export function ButtonEditor({ widget, updateWidget }: ButtonEditorProps) {
  const buttonWidget = widget as ButtonWidget
  
  // Get theme info for dynamic color labels
  const getColorOptions = () => {
    const { currentWebsiteId, websites, themes } = usePageStore.getState()
    const currentWebsite = websites.find((w: any) => w.id === currentWebsiteId)
    const currentTheme = currentWebsite 
      ? themes.find((t: any) => t.id === currentWebsite.themeId)
      : null
    
    // DS V2 uses semantic color names (works across Wiley/WT/Dummies brands)
    if (currentTheme?.id === 'wiley-figma-ds-v2') {
      return [
        { value: 'color1', label: 'Primary' },
        { value: 'color2', label: 'Secondary' },
        { value: 'color3', label: 'Tertiary' },
        { value: 'color4', label: 'Neutral Dark' },
        { value: 'color5', label: 'Neutral Light' },
      ]
    }
    
    // IBM Carbon uses 5 buttons with clear semantic names
    if (currentTheme?.id === 'ibm-carbon-ds') {
      return [
        { value: 'color1', label: 'Primary (IBM Blue solid)' },
        { value: 'color2', label: 'Secondary (Dark Grey solid)' },
        { value: 'color3', label: 'Tertiary (Transparent, no border)' },
        { value: 'color4', label: 'Danger (Red solid)' },
        { value: 'color5', label: 'Ghost (Transparent with border)' },
      ]
    }
    
    // Ant Design button types
    if (currentTheme?.id === 'ant-design') {
      return [
        { value: 'color1', label: 'Primary' },
        { value: 'color2', label: 'Secondary' },
        { value: 'color3', label: 'Accent' },
      ]
    }
    
    // Default: Primary, Secondary, Accent (3 colors)
    return [
      { value: 'color1', label: 'Primary' },
      { value: 'color2', label: 'Secondary' },
      { value: 'color3', label: 'Accent' },
    ]
  }
  
  const colorOptions = getColorOptions()
  
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
        <input
          type="text"
          value={buttonWidget.text}
          onChange={(e) => updateWidget({ text: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter button text..."
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Link URL</label>
        <input
          type="url"
          value={buttonWidget.href}
          onChange={(e) => updateWidget({ href: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="https://example.com"
        />
      </div>
      
      {/* 🎨 Button Style */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Button Style</label>
        <select
          value={buttonWidget.style || 'solid'}
          onChange={(e) => updateWidget({ style: e.target.value as 'solid' | 'outline' | 'link' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="solid">Solid - Filled background</option>
          <option value="outline">Outline - Border only</option>
          <option value="link">Link - Text only</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">
          💡 Visual treatment applies to all button colors
        </p>
      </div>
      
      {/* 🎨 Button Color */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Button Color</label>
        <select
          value={buttonWidget.color || 'color1'}
          onChange={(e) => updateWidget({ color: e.target.value as 'color1' | 'color2' | 'color3' | 'color4' | 'color5' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {colorOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          💡 Colors automatically adapt to light/dark backgrounds for perfect contrast
        </p>
      </div>
      
      {/* Size */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Button Size</label>
        <select
          value={buttonWidget.size}
          onChange={(e) => updateWidget({ size: e.target.value as 'small' | 'medium' | 'large' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="small">Small - Compact sizing</option>
          <option value="medium">Medium - Standard sizing</option>
          <option value="large">Large - Hero/prominent buttons</option>
        </select>
      </div>
      
      {/* Link Target */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Link Target</label>
        <select
          value={buttonWidget.target || '_self'}
          onChange={(e) => updateWidget({ target: e.target.value as '_blank' | '_self' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="_self">Same window/tab</option>
          <option value="_blank">New window/tab</option>
        </select>
      </div>
      
      {/* Alignment */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Alignment</label>
        <select
          value={buttonWidget.align || 'left'}
          onChange={(e) => updateWidget({ align: e.target.value as 'left' | 'center' | 'right' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>

      {/* Icon Selector */}
      <IconSelector
        icon={buttonWidget.icon}
        onChange={(icon) => updateWidget({ icon })}
      />
    </div>
  )
}

export default ButtonEditor

