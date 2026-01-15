/**
 * DIYEditor - Property editor for DIY widgets (HTML Block & Code Block)
 * 
 * Extracted from PropertiesPanel.tsx for better modularity.
 */

import React from 'react'
import { Info } from 'lucide-react'
import type { HTMLWidget, CodeWidget, Widget } from '../../../types'

interface DIYEditorProps {
  widget: Widget
  updateWidget: (updates: Partial<Widget>) => void
}

// HTML Block Examples
const INTERACTIVE_HTML_EXAMPLE = `<div style="padding: 20px; font-family: system-ui;">
  <h2 style="color: #2563eb; margin-bottom: 20px;">Interactive Widget Example</h2>
  
  <div style="display: flex; gap: 20px;">
    <!-- Left Side - Clickable Tags -->
    <div style="flex: 1;">
      <h3 style="margin-bottom: 15px;">Click on categories:</h3>
      <div style="display: flex; flex-wrap: gap: 8px;">
        <button onclick="showContent('profile')" style="background: #3b82f6; color: white; padding: 8px 16px; border: none; border-radius: 20px; cursor: pointer;">Profile (84)</button>
        <button onclick="showContent('general')" style="background: #6b7280; color: white; padding: 8px 16px; border: none; border-radius: 20px; cursor: pointer;">General (32)</button>
        <button onclick="showContent('search')" style="background: #059669; color: white; padding: 8px 16px; border: none; border-radius: 20px; cursor: pointer;">Search (6)</button>
        <button onclick="showContent('reports')" style="background: #dc2626; color: white; padding: 8px 16px; border: none; border-radius: 20px; cursor: pointer;">Reports (6)</button>
      </div>
    </div>
    
    <!-- Right Side - Dynamic Content -->
    <div style="flex: 1; border-left: 2px solid #e5e7eb; padding-left: 20px;">
      <div id="content-area">
        <p style="color: #6b7280; font-style: italic;">Click on a category to see its content</p>
      </div>
    </div>
  </div>
  
  <script>
    function showContent(category) {
      const contentArea = document.getElementById('content-area');
      const content = {
        profile: '<h4 style="color: #3b82f6;">Profile Widgets (84)</h4><p>User Profile, Settings, Avatar...</p>',
        general: '<h4 style="color: #6b7280;">General Widgets (32)</h4><p>Text Blocks, Image Gallery, Buttons...</p>',
        search: '<h4 style="color: #059669;">Search Widgets (6)</h4><p>Advanced Search, Results, Filters...</p>',
        reports: '<h4 style="color: #dc2626;">Report Widgets (6)</h4><p>Analytics, Visualization, Export...</p>'
      };
      contentArea.innerHTML = content[category];
    }
  </script>
</div>`

const BASIC_HTML_EXAMPLE = `<div style="padding: 20px; text-align: center; font-family: system-ui;">
  <h2 style="color: #059669;">Welcome to HTML Widgets!</h2>
  <p>This is a simple HTML widget. You can add any HTML content here.</p>
  <button onclick="alert('Hello from HTML Widget!')" style="background: #3b82f6; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">
    Click Me!
  </button>
</div>`

/**
 * HTMLBlockEditor - Editor for HTML Block widgets
 */
export function HTMLBlockEditor({ widget, updateWidget }: DIYEditorProps) {
  const htmlWidget = widget as HTMLWidget
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        updateWidget({ htmlContent: content })
      }
      reader.readAsText(file)
    }
  }
  
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">HTML Content</label>
        <textarea
          value={htmlWidget.htmlContent}
          onChange={(e) => updateWidget({ htmlContent: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm resize-none"
          rows={8}
          placeholder="Enter your HTML code here..."
        />
      </div>
      
      <div className="space-y-2">
        <button
          onClick={() => updateWidget({ htmlContent: INTERACTIVE_HTML_EXAMPLE })}
          className="w-full px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
        >
          📱 Load Interactive Example
        </button>
        
        <button
          onClick={() => updateWidget({ htmlContent: BASIC_HTML_EXAMPLE })}
          className="w-full px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
        >
          🚀 Load Basic Example
        </button>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Upload HTML File</label>
        <input
          type="file"
          accept=".html,.htm"
          onChange={handleFileUpload}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      
      {htmlWidget.htmlContent && (
        <div className="border-t pt-4 mt-4">
          <div className="flex items-center gap-2 mb-3">
            <h4 className="font-medium text-gray-700">Widget Promotion</h4>
            <div className="relative group">
              <Info className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 max-w-64 leading-relaxed">
                Would you like to share your creation with the community?
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <button className="w-full px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors">
              Nominate for Product Roadmap
            </button>
            <button className="w-full px-3 py-2 bg-orange-600 text-white text-sm font-medium rounded-md hover:bg-orange-700 transition-colors">
              Commission Custom Widget
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * CodeBlockEditor - Editor for Code Block widgets
 */
export function CodeBlockEditor({ widget, updateWidget }: DIYEditorProps) {
  const codeWidget = widget as CodeWidget
  
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Widget Title</label>
        <input
          type="text"
          value={codeWidget.title || ''}
          onChange={(e) => updateWidget({ title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Code example title..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Programming Language</label>
        <select
          value={codeWidget.language}
          onChange={(e) => updateWidget({ language: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="python">Python</option>
          <option value="css">CSS</option>
          <option value="html">HTML</option>
          <option value="json">JSON</option>
          <option value="markdown">Markdown</option>
          <option value="xml">XML</option>
          <option value="sql">SQL</option>
          <option value="shell">Shell/Bash</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Code Content</label>
        <textarea
          value={codeWidget.codeContent}
          onChange={(e) => updateWidget({ codeContent: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={10}
          placeholder="Enter your code here..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={codeWidget.showLineNumbers ?? true}
              onChange={(e) => updateWidget({ showLineNumbers: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Show Line Numbers</span>
          </label>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
          <select
            value={codeWidget.theme || 'light'}
            onChange={(e) => updateWidget({ theme: e.target.value as 'light' | 'dark' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="light">Light Theme</option>
            <option value="dark">Dark Theme</option>
          </select>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <strong>Code Block Tips:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Use syntax highlighting to make code more readable</li>
              <li>Line numbers help users reference specific lines</li>
              <li>Choose dark theme for better contrast with code</li>
              <li>Include comments in your code for better understanding</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * DIYEditor - Combined editor that routes to the correct sub-editor
 */
export function DIYEditor({ widget, updateWidget }: DIYEditorProps) {
  if (widget.type === 'html') {
    return <HTMLBlockEditor widget={widget} updateWidget={updateWidget} />
  }
  
  if (widget.type === 'code') {
    return <CodeBlockEditor widget={widget} updateWidget={updateWidget} />
  }
  
  return null
}

export default DIYEditor

