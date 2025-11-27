/**
 * ImageEditor - Property editor for Image widgets
 * 
 * Handles image source URL, alt text, caption, link, aspect ratio,
 * alignment, width, and object fit settings.
 * 
 * Extracted from PropertiesPanel.tsx for better modularity.
 */

import React from 'react'
import { Info } from 'lucide-react'
import type { ImageWidget, Widget } from '../../../types'

interface ImageEditorProps {
  widget: Widget
  updateWidget: (updates: Partial<Widget>) => void
}

/**
 * ImageEditor - Full property editor for Image widgets
 */
export function ImageEditor({ widget, updateWidget }: ImageEditorProps) {
  const imageWidget = widget as ImageWidget
  
  const handleRandomImage = () => {
    // Generate random Picsum URL with timestamp to ensure uniqueness
    const randomUrl = `https://picsum.photos/800/600?random=${Date.now()}`
    updateWidget({ src: randomUrl })
  }
  
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Image Source URL</label>
        <div className="flex gap-2">
          <input
            type="url"
            value={imageWidget.src}
            onChange={(e) => updateWidget({ src: e.target.value })}
            placeholder="https://example.com/image.jpg"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
          <button
            onClick={handleRandomImage}
            className="px-3 py-2 bg-purple-50 border border-purple-300 text-purple-700 rounded-md text-sm font-medium hover:bg-purple-100 transition-colors whitespace-nowrap"
            title="Load random image from Picsum"
          >
            🎲 Random
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">Or click Random to load a placeholder image from Picsum</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Alt Text</label>
        <input
          type="text"
          value={imageWidget.alt}
          onChange={(e) => updateWidget({ alt: e.target.value })}
          placeholder="Descriptive text for accessibility"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Caption (Optional)</label>
        <input
          type="text"
          value={imageWidget.caption || ''}
          onChange={(e) => updateWidget({ caption: e.target.value })}
          placeholder="Image caption or description"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Link URL (Optional)</label>
        <input
          type="url"
          value={imageWidget.link || ''}
          onChange={(e) => updateWidget({ link: e.target.value })}
          placeholder="https://example.com (make image clickable)"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Aspect Ratio</label>
          <select
            value={imageWidget.ratio || 'auto'}
            onChange={(e) => updateWidget({ ratio: e.target.value as ImageWidget['ratio'] })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="auto">Auto</option>
            <option value="1:1">Square (1:1)</option>
            <option value="4:3">Landscape (4:3)</option>
            <option value="3:4">Portrait (3:4)</option>
            <option value="16:9">Widescreen (16:9)</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Alignment</label>
          <select
            value={imageWidget.alignment || 'center'}
            onChange={(e) => updateWidget({ alignment: e.target.value as ImageWidget['alignment'] })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Width</label>
          <select
            value={imageWidget.width || 'full'}
            onChange={(e) => updateWidget({ width: e.target.value as ImageWidget['width'] })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="auto">Auto</option>
            <option value="small">Small (25%)</option>
            <option value="medium">Medium (50%)</option>
            <option value="large">Large (75%)</option>
            <option value="full">Full Width</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Object Fit</label>
          <select
            value={imageWidget.objectFit || 'cover'}
            onChange={(e) => updateWidget({ objectFit: e.target.value as ImageWidget['objectFit'] })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="cover">Cover</option>
            <option value="contain">Contain</option>
            <option value="fill">Fill</option>
            <option value="scale-down">Scale Down</option>
            <option value="none">None</option>
          </select>
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Image Best Practices</p>
            <ul className="text-xs space-y-1">
              <li>• Use descriptive alt text for accessibility</li>
              <li>• Optimize images for web (WebP, JPEG, PNG)</li>
              <li>• Consider loading performance for large images</li>
              <li>• Use appropriate aspect ratios for your design</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImageEditor

