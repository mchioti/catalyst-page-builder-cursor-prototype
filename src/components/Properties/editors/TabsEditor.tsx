/**
 * TabsEditor - Property editor for Tabs widgets
 * 
 * Handles tab style, alignment, and tab management (add, edit, delete).
 * Each tab can have its own icon, URL, and contains nested widgets.
 * 
 * Extracted from PropertiesPanel.tsx for better modularity.
 */

import React from 'react'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import { nanoid } from 'nanoid'
import type { Widget, TabsWidget, TabItem, TabVariant } from '../../../types'
import { usePageStore } from '../../../stores'

interface TabsEditorProps {
  widget: Widget
  updateWidget: (updates: Partial<Widget>) => void
}

// Tab variant labels
const TAB_VARIANT_LABELS: Record<TabVariant, string> = {
  'underline': 'Underline',
  'pill': 'Pill',
  'enclosed': 'Enclosed',
  'vertical': 'Vertical',
  'lifted': 'Lifted',
  'soft': 'Soft'
}

// Theme-specific tab variants
const THEME_TAB_VARIANTS: Record<string, TabVariant[]> = {
  'classic-ux3-theme': ['underline', 'pill', 'enclosed'],
  'wiley-figma-ds-v2': ['underline', 'pill'],
  'ibm-carbon-ds': ['underline', 'enclosed'],
  'ant-design': ['underline', 'pill', 'enclosed', 'lifted']
}

function getSupportedTabVariants(themeId: string): TabVariant[] {
  return THEME_TAB_VARIANTS[themeId] || ['underline', 'pill', 'enclosed']
}

function getTabVariantLabel(variant: TabVariant): string {
  return TAB_VARIANT_LABELS[variant] || variant
}

/**
 * TabsEditor - Full property editor for Tabs widgets
 */
export function TabsEditor({ widget, updateWidget }: TabsEditorProps) {
  const tabsWidget = widget as TabsWidget
  
  // Get current theme for variant support
  const { currentWebsiteId, websites } = usePageStore.getState()
  const currentWebsite = websites.find((w: any) => w.id === currentWebsiteId)
  const currentThemeId = currentWebsite?.themeId || 'classic-ux3-theme'
  const supportedVariants = getSupportedTabVariants(currentThemeId)
  
  const handleAddTab = () => {
    const newTab: TabItem = {
      id: nanoid(),
      label: `Tab ${tabsWidget.tabs.length + 1}`,
      widgets: []
    }
    updateWidget({ tabs: [...tabsWidget.tabs, newTab] })
  }
  
  const handleUpdateTab = (index: number, updates: Partial<TabItem>) => {
    const newTabs = [...tabsWidget.tabs]
    newTabs[index] = { ...newTabs[index], ...updates }
    updateWidget({ tabs: newTabs })
  }
  
  const handleDeleteTab = (index: number) => {
    // Don't allow deleting the last tab
    if (tabsWidget.tabs.length > 1) {
      const newTabs = tabsWidget.tabs.filter((_, i) => i !== index)
      updateWidget({
        tabs: newTabs,
        activeTabIndex: Math.min(tabsWidget.activeTabIndex, newTabs.length - 1)
      })
    }
  }
  
  return (
    <div className="space-y-4">
      {/* Tab Style */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tab Style</label>
        <select
          value={tabsWidget.tabStyle}
          onChange={(e) => updateWidget({ tabStyle: e.target.value as TabVariant })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          {supportedVariants.map((variant) => (
            <option key={variant} value={variant}>
              {getTabVariantLabel(variant)}
            </option>
          ))}
        </select>
        {supportedVariants.length < 3 && (
          <p className="text-xs text-gray-500 mt-1">
            Available variants for this theme
          </p>
        )}
      </div>
      
      {/* Alignment */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Alignment</label>
        <select
          value={tabsWidget.align || 'left'}
          onChange={(e) => updateWidget({ align: e.target.value as 'left' | 'center' | 'right' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>
      
      {/* Tab Management */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">Tabs</label>
          <button
            onClick={handleAddTab}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Tab
          </button>
        </div>
        
        <div className="space-y-2">
          {tabsWidget.tabs.map((tab, index) => (
            <div key={tab.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <GripVertical className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={tab.label}
                  onChange={(e) => handleUpdateTab(index, { label: e.target.value })}
                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm"
                  placeholder="Tab label"
                />
                <button
                  onClick={() => handleDeleteTab(index)}
                  disabled={tabsWidget.tabs.length === 1}
                  className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title={
                    tabsWidget.tabs.length === 1
                      ? "Cannot delete the last tab"
                      : "Delete tab"
                  }
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-2 text-xs">
                <div>
                  <label className="block text-gray-600 mb-1">Icon (emoji)</label>
                  <input
                    type="text"
                    value={tab.icon || ''}
                    onChange={(e) => handleUpdateTab(index, { icon: e.target.value })}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                    placeholder="e.g., 📊"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">URL (optional)</label>
                  <input
                    type="text"
                    value={tab.url || ''}
                    onChange={(e) => handleUpdateTab(index, { url: e.target.value })}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                    placeholder="/path"
                  />
                </div>
                <div className="text-gray-500 text-xs pt-1">
                  {tab.widgets.length} widget{tab.widgets.length !== 1 ? 's' : ''} in this tab
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-3 bg-blue-50 border border-blue-200 rounded-md p-3">
          <p className="text-xs text-blue-800 font-medium mb-1">💡 How to use</p>
          <p className="text-xs text-blue-700">
            Configure tabs here, then drag widgets from the library into each tab's drop zone on the canvas.
          </p>
        </div>
      </div>
    </div>
  )
}

export default TabsEditor

