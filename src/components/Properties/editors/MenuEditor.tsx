/**
 * MenuEditor - Property editor for Menu/Navigation widgets
 * 
 * Features:
 * - Menu type (global, context-aware, custom)
 * - Menu style (horizontal, vertical, dropdown, footer-links)
 * - Two-column expanded editor for menu items
 * - Reusable MenuItemForm component
 * 
 * Extracted from PropertiesPanel.tsx for better modularity.
 */

import React, { useState } from 'react'
import { Plus, Trash2, GripVertical, X } from 'lucide-react'
import { nanoid } from 'nanoid'
import type { Widget, MenuWidget, MenuItem } from '../../../types'

interface MenuEditorProps {
  widget: Widget
  updateWidget: (updates: Partial<Widget>) => void
  isExpanded?: boolean
  onExpandedChange?: (expanded: boolean) => void
}

// Default context-aware menu items for journals
const JOURNAL_CONTEXT_ITEMS: Omit<MenuItem, 'id'>[] = [
  { label: '{{journal.name}} Home', url: '/journals/{{journal.code}}', target: '_self', displayCondition: 'always', isContextGenerated: true, order: 0 },
  { label: 'Just Accepted', url: '/journals/{{journal.code}}/early', target: '_self', displayCondition: 'if-issue-exists', isContextGenerated: true, order: 1 },
  { label: 'Latest Issue', url: '/journals/{{journal.code}}/current', target: '_self', displayCondition: 'if-issue-exists', isContextGenerated: true, order: 2 },
  { label: 'Archive', url: '/journals/{{journal.code}}/issues', target: '_self', displayCondition: 'if-has-archive', isContextGenerated: true, order: 3 },
]

/**
 * MenuItemForm - Reusable form for editing a single menu item
 * Can be used in other contexts (e.g., footer links, breadcrumbs)
 */
export interface MenuItemFormProps {
  item: MenuItem
  index: number
  onChange: (index: number, updates: Partial<MenuItem>) => void
  onDelete: (index: number) => void
  showConditions?: boolean
}

export function MenuItemForm({ item, index, onChange, onDelete, showConditions = true }: MenuItemFormProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-3 bg-white">
      <div className="flex items-start gap-2">
        <div className="mt-2">
          <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Label</label>
            <input
              type="text"
              value={item.label}
              onChange={(e) => onChange(index, { label: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="Menu item label"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">URL</label>
            <input
              type="text"
              value={item.url}
              onChange={(e) => onChange(index, { url: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="/path or https://..."
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Target</label>
              <select
                value={item.target}
                onChange={(e) => onChange(index, { target: e.target.value as MenuItem['target'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="_self">Same window</option>
                <option value="_blank">New window</option>
                <option value="_parent">Parent</option>
                <option value="_top">Top</option>
              </select>
            </div>
            
            {showConditions && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Show When</label>
                <select
                  value={item.displayCondition || 'always'}
                  onChange={(e) => onChange(index, { displayCondition: e.target.value as MenuItem['displayCondition'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="always">Always</option>
                  <option value="if-issue-exists">If issue exists</option>
                  <option value="if-has-archive">If archive</option>
                  <option value="if-journal-context">If journal</option>
                </select>
              </div>
            )}
          </div>
          
          {item.isContextGenerated && (
            <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
              ℹ️ Context-generated item
            </div>
          )}
        </div>
        
        <button
          onClick={() => onDelete(index)}
          className="mt-2 p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
          title="Delete item"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

/**
 * MenuEditor - Full property editor for Menu widgets
 */
export function MenuEditor({ widget, updateWidget, isExpanded = false, onExpandedChange }: MenuEditorProps) {
  const [localExpanded, setLocalExpanded] = useState(false)
  const expanded = onExpandedChange ? isExpanded : localExpanded
  const setExpanded = onExpandedChange || setLocalExpanded
  
  const menuWidget = widget as MenuWidget
  
  const handleMenuTypeChange = (newType: 'global' | 'context-aware' | 'custom') => {
    const updates: Partial<MenuWidget> = { menuType: newType }
    
    // Auto-populate items if switching to context-aware and empty
    if (newType === 'context-aware' && menuWidget.items.length === 0) {
      updates.contextSource = 'journal'
      updates.items = JOURNAL_CONTEXT_ITEMS.map(item => ({ ...item, id: nanoid() }))
    }
    
    updateWidget(updates)
  }
  
  const handleItemChange = (index: number, updates: Partial<MenuItem>) => {
    const newItems = [...menuWidget.items]
    newItems[index] = { ...newItems[index], ...updates }
    updateWidget({ items: newItems })
  }
  
  const handleItemDelete = (index: number) => {
    const newItems = menuWidget.items.filter((_, i) => i !== index)
    updateWidget({ items: newItems })
  }
  
  const handleAddItem = () => {
    const newItem: MenuItem = {
      id: nanoid(),
      label: 'New Item',
      url: '#',
      target: '_self',
      displayCondition: 'always',
      order: menuWidget.items.length,
      isContextGenerated: false
    }
    updateWidget({ items: [...menuWidget.items, newItem] })
  }
  
  // Two-column expanded view
  if (expanded) {
    return (
      <div className="flex h-full">
        {/* Left Column: Basic Properties */}
        <div className="w-[420px] p-4 space-y-4 border-r border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">Menu Properties</h3>
            <button
              onClick={() => setExpanded(false)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Close editor"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Widget Type</span>
              <span className="text-xs px-2 py-1 rounded-full font-medium bg-purple-100 text-purple-700">Menu</span>
            </div>
          </div>
          
          <MenuTypeSelect menuWidget={menuWidget} onChange={handleMenuTypeChange} />
          
          {menuWidget.menuType === 'context-aware' && (
            <ContextSourceSelect
              value={menuWidget.contextSource || 'journal'}
              onChange={(value) => updateWidget({ contextSource: value })}
            />
          )}
          
          <MenuStyleSelect
            value={menuWidget.style}
            onChange={(value) => updateWidget({ style: value })}
          />
          
          <AlignmentSelect
            value={menuWidget.align || 'left'}
            onChange={(value) => updateWidget({ align: value })}
          />
          
          <TemplateVariablesHelp />
        </div>
        
        {/* Right Column: Menu Items Editor */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">Menu Items ({menuWidget.items.length})</h3>
            <button
              onClick={handleAddItem}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Item
            </button>
          </div>
          
          <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
            {menuWidget.items.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                No menu items yet. Click "Add Item" to get started.
              </div>
            ) : (
              menuWidget.items.map((item, index) => (
                <MenuItemForm
                  key={item.id}
                  item={item}
                  index={index}
                  onChange={handleItemChange}
                  onDelete={handleItemDelete}
                  showConditions={menuWidget.menuType === 'context-aware'}
                />
              ))
            )}
          </div>
        </div>
      </div>
    )
  }
  
  // Compact view
  return (
    <div className="space-y-4">
      <MenuTypeSelect menuWidget={menuWidget} onChange={handleMenuTypeChange} />
      
      {menuWidget.menuType === 'context-aware' && (
        <ContextSourceSelect
          value={menuWidget.contextSource || 'journal'}
          onChange={(value) => updateWidget({ contextSource: value })}
        />
      )}
      
      <MenuStyleSelect
        value={menuWidget.style}
        onChange={(value) => updateWidget({ style: value })}
      />
      
      <AlignmentSelect
        value={menuWidget.align || 'left'}
        onChange={(value) => updateWidget({ align: value })}
      />
      
      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">Menu Items</label>
          <span className="text-xs text-gray-500">{menuWidget.items.length} items</span>
        </div>
        
        <button
          onClick={() => setExpanded(true)}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          🎯 Edit Menu Items...
        </button>
        
        {menuWidget.items.length > 0 && (
          <div className="mt-3 space-y-1">
            <p className="text-xs font-medium text-gray-600 mb-1">Current Items:</p>
            {menuWidget.items.slice(0, 5).map(item => (
              <div key={item.id} className="text-xs text-gray-600 pl-2 border-l-2 border-gray-200">
                • {item.label}
                {item.isContextGenerated && <span className="ml-1 text-blue-500" title="Context-generated">(auto)</span>}
              </div>
            ))}
            {menuWidget.items.length > 5 && (
              <div className="text-xs text-gray-500 pl-2">
                ...and {menuWidget.items.length - 5} more
              </div>
            )}
          </div>
        )}
        
        <TemplateVariablesHelp />
      </div>
    </div>
  )
}

// Sub-components for cleaner code
function MenuTypeSelect({ menuWidget, onChange }: { menuWidget: MenuWidget; onChange: (type: 'global' | 'context-aware' | 'custom') => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Menu Type</label>
      <select
        value={menuWidget.menuType}
        onChange={(e) => onChange(e.target.value as 'global' | 'context-aware' | 'custom')}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
      >
        <option value="global">Global (Static, for headers)</option>
        <option value="context-aware">Context-Aware (Adapts to page)</option>
        <option value="custom">Custom (Blank slate)</option>
      </select>
      <p className="text-xs text-gray-500 mt-1">
        {menuWidget.menuType === 'global' && 'Static menu items, same across all pages'}
        {menuWidget.menuType === 'context-aware' && 'Auto-populates with context-specific items'}
        {menuWidget.menuType === 'custom' && 'Start with an empty menu'}
      </p>
    </div>
  )
}

function ContextSourceSelect({ value, onChange }: { value: string; onChange: (value: 'journal' | 'book' | 'conference') => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Context Source</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as 'journal' | 'book' | 'conference')}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
      >
        <option value="journal">Journal</option>
        <option value="book">Book</option>
        <option value="conference">Conference</option>
      </select>
    </div>
  )
}

function MenuStyleSelect({ value, onChange }: { value: string; onChange: (value: 'horizontal' | 'vertical' | 'dropdown' | 'footer-links') => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Menu Style</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as 'horizontal' | 'vertical' | 'dropdown' | 'footer-links')}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
      >
        <option value="horizontal">Horizontal</option>
        <option value="vertical">Vertical</option>
        <option value="dropdown">Dropdown</option>
        <option value="footer-links">Footer Links</option>
      </select>
    </div>
  )
}

function AlignmentSelect({ value, onChange }: { value: string; onChange: (value: 'left' | 'center' | 'right') => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Alignment</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as 'left' | 'center' | 'right')}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
      >
        <option value="left">Left</option>
        <option value="center">Center</option>
        <option value="right">Right</option>
      </select>
    </div>
  )
}

function TemplateVariablesHelp() {
  return (
    <div className="mt-3 bg-blue-50 border border-blue-200 rounded-md p-3">
      <p className="text-xs text-blue-800 font-medium mb-1">💡 Template Variables</p>
      <p className="text-xs text-blue-700">
        Use <code className="bg-blue-100 px-1 rounded">{'{{journal.name}}'}</code>, <code className="bg-blue-100 px-1 rounded">{'{{journal.code}}'}</code> in labels and URLs
      </p>
    </div>
  )
}

export default MenuEditor

