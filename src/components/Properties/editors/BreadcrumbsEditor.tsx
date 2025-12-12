/**
 * BreadcrumbsEditor - Property editor for Breadcrumbs navigation widgets
 * 
 * Features:
 * - Two-column expanded drawer (matching MenuEditor pattern)
 * - Separator style selection
 * - Visual style (default, pills, underline)
 * - Alignment options
 * - Home icon toggle
 * - Max items truncation
 * - Breadcrumb items management (label + href)
 * 
 * Follows the same UI/UX pattern as MenuEditor for consistency.
 */

import React, { useState } from 'react'
import { Plus, Trash2, GripVertical, Home, ChevronRight, X, ChevronUp, ChevronDown } from 'lucide-react'
import type { Widget, BreadcrumbsWidget, BreadcrumbItem } from '../../../types'

interface BreadcrumbsEditorProps {
  widget: Widget
  updateWidget: (updates: Partial<Widget>) => void
  isExpanded?: boolean
  onExpandedChange?: (expanded: boolean) => void
}

/**
 * BreadcrumbItemForm - Form for editing a single breadcrumb item
 */
interface BreadcrumbItemFormProps {
  item: BreadcrumbItem
  index: number
  isLast: boolean
  onChange: (index: number, updates: Partial<BreadcrumbItem>) => void
  onDelete: (index: number) => void
  onMoveUp: (index: number) => void
  onMoveDown: (index: number) => void
  isFirst: boolean
  totalItems: number
}

function BreadcrumbItemForm({ 
  item, 
  index, 
  isLast, 
  onChange, 
  onDelete, 
  onMoveUp, 
  onMoveDown, 
  isFirst, 
  totalItems 
}: BreadcrumbItemFormProps) {
  return (
    <div className={`border rounded-lg p-3 bg-white ${isLast ? 'border-blue-300 bg-blue-50/50' : 'border-gray-200'}`}>
      <div className="flex items-start gap-2">
        <div className="flex flex-col gap-0.5 mt-1">
          <button
            onClick={() => onMoveUp(index)}
            disabled={isFirst}
            className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Move up"
          >
            <ChevronUp className="w-3 h-3" />
          </button>
          <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
          <button
            onClick={() => onMoveDown(index)}
            disabled={index === totalItems - 1}
            className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Move down"
          >
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>
        
        <div className="flex-1 space-y-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Label {isLast && <span className="text-blue-600">(Current page)</span>}
            </label>
            <input
              type="text"
              value={item.label}
              onChange={(e) => onChange(index, { label: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="Page name"
            />
          </div>
          
          {!isLast && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">URL</label>
              <input
                type="text"
                value={item.href || ''}
                onChange={(e) => onChange(index, { href: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="/path or https://..."
              />
            </div>
          )}
          
          {isLast && (
            <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
              ℹ️ Last item is the current page (no link)
            </div>
          )}
        </div>
        
        <button
          onClick={() => onDelete(index)}
          disabled={totalItems <= 1}
          className="mt-2 p-1 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Delete item"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// Sub-components for cleaner code
function SeparatorSelect({ value, customValue, onChange, onCustomChange }: { 
  value: string
  customValue?: string
  onChange: (value: BreadcrumbsWidget['separator']) => void
  onCustomChange: (value: string) => void
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Separator</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as BreadcrumbsWidget['separator'])}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
      >
        <option value="arrow">Arrow (→)</option>
        <option value="slash">Slash (/)</option>
        <option value="chevron">Chevron (›)</option>
        <option value="dot">Dot (•)</option>
        <option value="custom">Custom</option>
      </select>
      
      {value === 'custom' && (
        <input
          type="text"
          value={customValue || ''}
          onChange={(e) => onCustomChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          placeholder="Enter separator (e.g., |)"
          maxLength={5}
        />
      )}
      
      <div className="text-xs text-gray-500">
        Preview: Home {value === 'arrow' ? '→' : value === 'slash' ? '/' : value === 'chevron' ? '›' : value === 'dot' ? '•' : customValue || '|'} Section {value === 'arrow' ? '→' : value === 'slash' ? '/' : value === 'chevron' ? '›' : value === 'dot' ? '•' : customValue || '|'} Page
      </div>
    </div>
  )
}

function StyleSelect({ value, onChange }: { value: string; onChange: (value: BreadcrumbsWidget['style']) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Visual Style</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as BreadcrumbsWidget['style'])}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
      >
        <option value="default">Default (text links)</option>
        <option value="pills">Pills (rounded badges)</option>
        <option value="underline">Underline on hover</option>
      </select>
      <p className="text-xs text-gray-500 mt-1">
        {value === 'default' && 'Simple text with hover color change'}
        {value === 'pills' && 'Each item in a rounded pill shape'}
        {value === 'underline' && 'Underline appears on hover'}
      </p>
    </div>
  )
}

function AlignmentSelect({ value, onChange }: { value: string; onChange: (value: 'left' | 'center' | 'right') => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Alignment</label>
      <div className="flex gap-1">
        {(['left', 'center', 'right'] as const).map((align) => (
          <button
            key={align}
            onClick={() => onChange(align)}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded border transition-colors ${
              value === align
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {align.charAt(0).toUpperCase() + align.slice(1)}
          </button>
        ))}
      </div>
    </div>
  )
}

function OptionsSection({ showHomeIcon, maxItems, onHomeIconChange, onMaxItemsChange }: {
  showHomeIcon: boolean
  maxItems: number
  onHomeIconChange: (value: boolean) => void
  onMaxItemsChange: (value: number) => void
}) {
  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={showHomeIcon}
          onChange={(e) => onHomeIconChange(e.target.checked)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-sm text-gray-700 flex items-center gap-1">
          <Home className="w-4 h-4" /> Show home icon on first item
        </span>
      </label>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Max Items (truncation)</label>
        <input
          type="number"
          min={0}
          max={10}
          value={maxItems}
          onChange={(e) => onMaxItemsChange(parseInt(e.target.value) || 0)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          placeholder="0 = no limit"
        />
        <p className="text-xs text-gray-500 mt-1">
          Set to 0 for no limit. Values &gt; 0 will truncate with "..." in the middle.
        </p>
      </div>
    </div>
  )
}

function BreadcrumbsTips() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
      <p className="text-xs text-blue-800 font-medium mb-1">💡 Tips</p>
      <ul className="text-xs text-blue-700 space-y-0.5">
        <li>• Last item represents the current page (no link)</li>
        <li>• Use "/" for root, "/section/page" for paths</li>
        <li>• Max items truncates long trails with "..."</li>
      </ul>
    </div>
  )
}

/**
 * BreadcrumbsEditor - Full property editor for Breadcrumbs widgets
 */
export function BreadcrumbsEditor({ widget, updateWidget, isExpanded = false, onExpandedChange }: BreadcrumbsEditorProps) {
  const [localExpanded, setLocalExpanded] = useState(false)
  const expanded = onExpandedChange ? isExpanded : localExpanded
  const setExpanded = onExpandedChange || setLocalExpanded
  
  const breadcrumbsWidget = widget as BreadcrumbsWidget
  const items = breadcrumbsWidget.items || []
  
  const handleItemChange = (index: number, updates: Partial<BreadcrumbItem>) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], ...updates }
    updateWidget({ items: newItems } as Partial<BreadcrumbsWidget>)
  }
  
  const handleAddItem = () => {
    const newItems = [...items]
    const newItem: BreadcrumbItem = {
      label: 'New Page',
      href: '/new-page'
    }
    
    if (newItems.length === 0) {
      // Start with Home and Current Page
      newItems.push({ label: 'Home', href: '/' })
      newItems.push({ label: 'Current Page' })
    } else {
      // Insert before last item (current page)
      newItems.splice(newItems.length - 1, 0, newItem)
    }
    
    updateWidget({ items: newItems } as Partial<BreadcrumbsWidget>)
  }
  
  const handleDeleteItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index)
    updateWidget({ items: newItems } as Partial<BreadcrumbsWidget>)
  }
  
  const handleMoveUp = (index: number) => {
    if (index === 0) return
    const newItems = [...items]
    ;[newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]]
    updateWidget({ items: newItems } as Partial<BreadcrumbsWidget>)
  }
  
  const handleMoveDown = (index: number) => {
    if (index === items.length - 1) return
    const newItems = [...items]
    ;[newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]]
    updateWidget({ items: newItems } as Partial<BreadcrumbsWidget>)
  }
  
  // Two-column expanded view (matching MenuEditor pattern)
  if (expanded) {
    return (
      <div className="flex h-full">
        {/* Left Column: Basic Properties */}
        <div className="w-[420px] p-4 space-y-4 border-r border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">Breadcrumbs Properties</h3>
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
              <span className="text-xs px-2 py-1 rounded-full font-medium bg-green-100 text-green-700">Breadcrumbs</span>
            </div>
          </div>
          
          <SeparatorSelect
            value={breadcrumbsWidget.separator || 'chevron'}
            customValue={breadcrumbsWidget.customSeparator}
            onChange={(value) => updateWidget({ separator: value } as Partial<BreadcrumbsWidget>)}
            onCustomChange={(value) => updateWidget({ customSeparator: value } as Partial<BreadcrumbsWidget>)}
          />
          
          <StyleSelect
            value={breadcrumbsWidget.style || 'default'}
            onChange={(value) => updateWidget({ style: value } as Partial<BreadcrumbsWidget>)}
          />
          
          <AlignmentSelect
            value={breadcrumbsWidget.align || 'left'}
            onChange={(value) => updateWidget({ align: value } as Partial<BreadcrumbsWidget>)}
          />
          
          <OptionsSection
            showHomeIcon={breadcrumbsWidget.showHomeIcon || false}
            maxItems={breadcrumbsWidget.maxItems || 0}
            onHomeIconChange={(value) => updateWidget({ showHomeIcon: value } as Partial<BreadcrumbsWidget>)}
            onMaxItemsChange={(value) => updateWidget({ maxItems: value } as Partial<BreadcrumbsWidget>)}
          />
          
          <BreadcrumbsTips />
        </div>
        
        {/* Right Column: Breadcrumb Items Editor */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">Breadcrumb Items ({items.length})</h3>
            <button
              onClick={handleAddItem}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Item
            </button>
          </div>
          
          <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
            {items.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                No breadcrumb items yet. Click "Add Item" to get started.
              </div>
            ) : (
              items.map((item, index) => (
                <BreadcrumbItemForm
                  key={index}
                  item={item}
                  index={index}
                  isLast={index === items.length - 1}
                  isFirst={index === 0}
                  totalItems={items.length}
                  onChange={handleItemChange}
                  onDelete={handleDeleteItem}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                />
              ))
            )}
          </div>
        </div>
      </div>
    )
  }
  
  // Compact view (matching MenuEditor pattern)
  return (
    <div className="space-y-4">
      <SeparatorSelect
        value={breadcrumbsWidget.separator || 'chevron'}
        customValue={breadcrumbsWidget.customSeparator}
        onChange={(value) => updateWidget({ separator: value } as Partial<BreadcrumbsWidget>)}
        onCustomChange={(value) => updateWidget({ customSeparator: value } as Partial<BreadcrumbsWidget>)}
      />
      
      <StyleSelect
        value={breadcrumbsWidget.style || 'default'}
        onChange={(value) => updateWidget({ style: value } as Partial<BreadcrumbsWidget>)}
      />
      
      <AlignmentSelect
        value={breadcrumbsWidget.align || 'left'}
        onChange={(value) => updateWidget({ align: value } as Partial<BreadcrumbsWidget>)}
      />
      
      <OptionsSection
        showHomeIcon={breadcrumbsWidget.showHomeIcon || false}
        maxItems={breadcrumbsWidget.maxItems || 0}
        onHomeIconChange={(value) => updateWidget({ showHomeIcon: value } as Partial<BreadcrumbsWidget>)}
        onMaxItemsChange={(value) => updateWidget({ maxItems: value } as Partial<BreadcrumbsWidget>)}
      />
      
      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">Breadcrumb Items</label>
          <span className="text-xs text-gray-500">{items.length} items</span>
        </div>
        
        <button
          onClick={() => setExpanded(true)}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          🗂️ Edit Breadcrumb Items...
        </button>
        
        {items.length > 0 && (
          <div className="mt-3 space-y-1">
            <p className="text-xs font-medium text-gray-600 mb-1">Current Trail:</p>
            <div className="text-xs text-gray-600 pl-2 border-l-2 border-gray-200">
              {items.map((item, i) => (
                <span key={i}>
                  {i > 0 && <span className="mx-1 text-gray-400">›</span>}
                  <span className={i === items.length - 1 ? 'font-medium text-gray-900' : ''}>{item.label}</span>
                </span>
              ))}
            </div>
          </div>
        )}
        
        <BreadcrumbsTips />
      </div>
    </div>
  )
}

export default BreadcrumbsEditor
