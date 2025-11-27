/**
 * TextEditor - Property editor for Text widgets
 * 
 * Handles text content, alignment, typography styles (theme-aware),
 * and inline CSS styles.
 * 
 * Extracted from PropertiesPanel.tsx for better modularity.
 */

import React from 'react'
import type { TextWidget, Widget } from '../../../types'
import { usePageStore } from '../../../stores'

interface TextEditorProps {
  widget: Widget
  updateWidget: (updates: Partial<Widget>) => void
}

/**
 * TextEditor - Full property editor for Text widgets
 */
export function TextEditor({ widget, updateWidget }: TextEditorProps) {
  const textWidget = widget as TextWidget
  
  // Get theme info for dynamic typography options
  const getTypographyOptions = () => {
    const { currentWebsiteId, websites, themes } = usePageStore.getState()
    const currentWebsite = websites.find((w: any) => w.id === currentWebsiteId)
    const currentTheme = currentWebsite 
      ? themes.find((t: any) => t.id === currentWebsite.themeId)
      : null
    
    // Wiley DS V2: Body text styles + code/mono
    if (currentTheme?.id === 'wiley-figma-ds-v2') {
      return [
        { value: '', label: 'Default' },
        { value: 'body-xl', label: 'Body XL' },
        { value: 'body-lg', label: 'Body Large' },
        { value: 'body-md', label: 'Body Medium' },
        { value: 'body-sm', label: 'Body Small' },
        { value: 'body-xs', label: 'Body XSmall' },
        { value: 'code-mono', label: 'Code/Mono (IBM Plex)' },
      ]
    }
    
    // IBM Carbon: Carbon body styles
    if (currentTheme?.id === 'ibm-carbon-ds') {
      return [
        { value: '', label: 'Default' },
        { value: 'body-01', label: 'Body 01 (14px/regular)' },
        { value: 'body-02', label: 'Body 02 (16px/regular)' },
        { value: 'body-compact-01', label: 'Body Compact 01 (14px/tight)' },
        { value: 'body-compact-02', label: 'Body Compact 02 (16px/tight)' },
        { value: 'label-01', label: 'Label 01 (12px)' },
        { value: 'label-02', label: 'Label 02 (14px)' },
        { value: 'helper-text-01', label: 'Helper Text 01 (12px italic)' },
        { value: 'helper-text-02', label: 'Helper Text 02 (14px italic)' },
      ]
    }
    
    return null // No typography options for other themes
  }
  
  const typographyOptions = getTypographyOptions()
  const { currentWebsiteId, websites, themes } = usePageStore.getState()
  const currentWebsite = websites.find((w: any) => w.id === currentWebsiteId)
  const currentTheme = currentWebsite 
    ? themes.find((t: any) => t.id === currentWebsite.themeId)
    : null
  
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Text</label>
        <textarea
          value={textWidget.text}
          onChange={(e) => updateWidget({ text: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
          rows={3}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Alignment</label>
        <select
          value={textWidget.align || 'left'}
          onChange={(e) => updateWidget({ align: e.target.value as 'left' | 'center' | 'right' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>
      
      {/* Theme-specific typography styles */}
      {typographyOptions && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Typography Style
            {currentTheme?.id === 'ibm-carbon-ds' && (
              <span className="text-xs text-gray-500 ml-1">(Carbon)</span>
            )}
          </label>
          <select
            value={textWidget.typographyStyle || ''}
            onChange={(e) => updateWidget({ typographyStyle: (e.target.value || undefined) as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            {typographyOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Inline Styles
          <span className="text-xs text-gray-500 ml-1">(CSS properties)</span>
        </label>
        <textarea
          value={textWidget.inlineStyles || ''}
          onChange={(e) => updateWidget({ inlineStyles: e.target.value })}
          placeholder="font-family: courier;&#10;font-weight: 800;&#10;color: #333;"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono resize-none"
          rows={4}
        />
        <p className="text-xs text-gray-500 mt-1">
          Add CSS properties separated by semicolons
        </p>
      </div>
    </div>
  )
}

export default TextEditor

