/**
 * EditorialCardEditor - Property editor for Editorial Card widgets
 * 
 * A comprehensive card widget with image, preheader, headline,
 * description, and call-to-action. Supports multiple layouts.
 * 
 * Extracted from PropertiesPanel.tsx for better modularity.
 */

import React from 'react'
import type { Widget } from '../../../types'

interface EditorialCardEditorProps {
  widget: Widget
  updateWidget: (updates: Partial<Widget>) => void
}

/**
 * EditorialCardEditor - Full property editor for Editorial Card widgets
 */
export function EditorialCardEditor({ widget, updateWidget }: EditorialCardEditorProps) {
  const cardWidget = widget as any // EditorialCardWidget type
  
  const updateContent = (field: string, updates: any) => {
    updateWidget({
      content: {
        ...cardWidget.content,
        [field]: { ...cardWidget.content?.[field], ...updates }
      }
    })
  }
  
  const updateConfig = (updates: any) => {
    updateWidget({
      config: { ...cardWidget.config, ...updates }
    })
  }
  
  const updateImage = (updates: any) => {
    updateWidget({
      image: { ...cardWidget.image, ...updates }
    })
  }
  
  const handleRandomImage = () => {
    const randomUrl = `https://picsum.photos/800/600?random=${Date.now()}`
    updateImage({ src: randomUrl })
  }
  
  return (
    <div className="space-y-4">
      {/* Layout Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Layout</label>
        <select
          value={cardWidget.layout || 'image-overlay'}
          onChange={(e) => updateWidget({ layout: e.target.value as any })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="image-overlay">Image Overlay</option>
          <option value="split">Split</option>
          <option value="color-block">Color Block</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Overlay: Text over image • Split: Image/content separate • Color Block: Image + colored area
        </p>
      </div>
      
      {/* Image Section */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Image</h4>
        <div className="flex gap-2">
          <input
            type="url"
            value={cardWidget.image?.src || ''}
            onChange={(e) => updateImage({ src: e.target.value })}
            placeholder="https://example.com/image.jpg"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
          <button
            onClick={handleRandomImage}
            className="px-3 py-2 bg-purple-50 border border-purple-300 text-purple-700 rounded-md text-sm font-medium hover:bg-purple-100 transition-colors whitespace-nowrap"
          >
            🎲 Random
          </button>
        </div>
        
        <label className="block text-sm font-medium text-gray-700 mb-2 mt-3">Alt Text</label>
        <input
          type="text"
          value={cardWidget.image?.alt || ''}
          onChange={(e) => updateImage({ alt: e.target.value })}
          placeholder="Image description"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
        
        {(cardWidget.layout === 'split' || cardWidget.layout === 'color-block') && (
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">Image Position</label>
            <select
              value={cardWidget.config?.imagePosition || 'top'}
              onChange={(e) => updateConfig({ imagePosition: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="top">Top</option>
              <option value="bottom">Bottom</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
            </select>
          </div>
        )}
      </div>
      
      {/* Content Section */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Content</h4>
        
        {/* Preheader */}
        <div className="mb-4">
          <label className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={cardWidget.content?.preheader?.enabled || false}
              onChange={(e) => updateContent('preheader', { enabled: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 mr-2"
            />
            <span className="text-sm font-medium text-gray-700">Preheader</span>
          </label>
          {cardWidget.content?.preheader?.enabled && (
            <input
              type="text"
              value={cardWidget.content?.preheader?.text || ''}
              onChange={(e) => updateContent('preheader', { text: e.target.value })}
              placeholder="ADD SECTION OR CATEGORY NAME"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          )}
        </div>
        
        {/* Headline */}
        <div className="mb-4">
          <label className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={cardWidget.content?.headline?.enabled !== false}
              onChange={(e) => updateContent('headline', { enabled: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 mr-2"
            />
            <span className="text-sm font-medium text-gray-700">Headline</span>
          </label>
          {cardWidget.content?.headline?.enabled !== false && (
            <input
              type="text"
              value={cardWidget.content?.headline?.text || ''}
              onChange={(e) => updateContent('headline', { text: e.target.value })}
              placeholder="Add a headline"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          )}
        </div>
        
        {/* Description */}
        <div className="mb-4">
          <label className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={cardWidget.content?.description?.enabled !== false}
              onChange={(e) => updateContent('description', { enabled: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 mr-2"
            />
            <span className="text-sm font-medium text-gray-700">Description</span>
          </label>
          {cardWidget.content?.description?.enabled !== false && (
            <textarea
              value={cardWidget.content?.description?.text || ''}
              onChange={(e) => updateContent('description', { text: e.target.value })}
              placeholder="Describe what your story is about"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          )}
        </div>
        
        {/* Call to Action */}
        <div>
          <label className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={cardWidget.content?.callToAction?.enabled !== false}
              onChange={(e) => updateContent('callToAction', { enabled: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 mr-2"
            />
            <span className="text-sm font-medium text-gray-700">Call to Action</span>
          </label>
          {cardWidget.content?.callToAction?.enabled !== false && (
            <div className="space-y-2">
              <input
                type="text"
                value={cardWidget.content?.callToAction?.text || ''}
                onChange={(e) => updateContent('callToAction', { text: e.target.value })}
                placeholder="Learn more"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <input
                type="url"
                value={cardWidget.content?.callToAction?.url || ''}
                onChange={(e) => updateContent('callToAction', { url: e.target.value })}
                placeholder="https://example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <select
                value={cardWidget.content?.callToAction?.type || 'button'}
                onChange={(e) => updateContent('callToAction', { type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="button">Button</option>
                <option value="link">Link</option>
              </select>
            </div>
          )}
        </div>
      </div>
      
      {/* Configuration Section */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Configuration</h4>
        
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">Content Alignment</label>
          <select
            value={cardWidget.config?.contentAlignment || 'left'}
            onChange={(e) => updateConfig({ contentAlignment: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
        
        {cardWidget.layout === 'image-overlay' && (
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Overlay Opacity: {cardWidget.config?.overlayOpacity || 60}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={cardWidget.config?.overlayOpacity || 60}
              onChange={(e) => updateConfig({ overlayOpacity: parseInt(e.target.value) })}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">Darkness of the image overlay</p>
          </div>
        )}
        
        {cardWidget.layout === 'color-block' && (
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={cardWidget.config?.useAccentColor !== false}
                onChange={(e) => updateConfig({ useAccentColor: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 mr-2"
              />
              <span className="text-sm text-gray-700">Use Accent Color (from theme)</span>
            </label>
            <p className="text-xs text-gray-500 mt-1">When disabled, uses light gray background</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default EditorialCardEditor

