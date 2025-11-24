/**
 * Section Editor
 * Edit a specific shared section variation and see propagation impact
 */

import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useSharedSectionsStore } from '../../stores/sharedSectionsStore'
import { useWebsiteStore } from '../../stores/websiteStore'
import { ArrowLeft, Save, Globe, AlertTriangle, CheckCircle } from 'lucide-react'

export function SectionEditor() {
  const { sectionId, variationKey } = useParams<{ sectionId: string; variationKey: string }>()
  const navigate = useNavigate()
  
  const section = useSharedSectionsStore(state => state.getSectionById(sectionId || ''))
  const updateVariation = useSharedSectionsStore(state => state.updateVariation)
  const websites = useWebsiteStore(state => state.websites)
  
  const [editedWidgets, setEditedWidgets] = useState(
    section?.variations[variationKey || '']?.widgets || []
  )
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  
  if (!section || !variationKey) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Section not found</h2>
          <Link to="/v2/design" className="text-blue-600 hover:underline">
            Back to Design Console
          </Link>
        </div>
      </div>
    )
  }
  
  const variation = section.variations[variationKey]
  
  // Find all pages using this section
  const affectedPages: Array<{ websiteId: string; websiteName: string; pageId: string; pageName: string; hasOverrides: boolean }> = []
  
  websites.forEach(website => {
    website.pages.forEach(page => {
      const compositionItem = page.composition.find(item =>
        item.sharedSectionId === section.id && item.variationKey === variationKey
      )
      if (compositionItem) {
        affectedPages.push({
          websiteId: website.id,
          websiteName: website.name,
          pageId: page.id,
          pageName: page.name,
          hasOverrides: compositionItem.divergenceCount > 0
        })
      }
    })
  })
  
  const handleSave = () => {
    setSaveStatus('saving')
    
    // Update the variation with edited widgets
    updateVariation(section.id, variationKey, {
      widgets: editedWidgets,
      updatedAt: new Date()
    })
    
    setSaveStatus('saved')
    
    setTimeout(() => {
      setSaveStatus('idle')
      navigate('/v2/design')
    }, 1500)
  }
  
  const handleWidgetTextChange = (widgetIndex: number, field: string, value: string) => {
    const newWidgets = [...editedWidgets]
    newWidgets[widgetIndex] = { ...newWidgets[widgetIndex], [field]: value }
    setEditedWidgets(newWidgets)
  }
  
  const hasChanges = JSON.stringify(editedWidgets) !== JSON.stringify(variation.widgets)
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/v2/design"
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {section.name} → {variation.name}
              </h1>
              <p className="text-sm text-gray-500">
                Editing shared section variation
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {saveStatus === 'saved' && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Saved & Propagated</span>
              </div>
            )}
            <button
              onClick={handleSave}
              disabled={!hasChanges || saveStatus === 'saving'}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saveStatus === 'saving' ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto p-8">
        <div className="grid grid-cols-3 gap-6">
          {/* Main Editor */}
          <div className="col-span-2 space-y-6">
            {/* Impact Warning */}
            {affectedPages.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-amber-900 mb-1">
                      Impact: {affectedPages.length} page{affectedPages.length !== 1 ? 's' : ''} will be updated
                    </h3>
                    <p className="text-sm text-amber-800">
                      Changes to this shared section will automatically propagate to all pages using it
                      {affectedPages.some(p => p.hasOverrides) && (
                        <> (pages with overrides will keep their modifications)</>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Widget List */}
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Widgets ({editedWidgets.length})
                </h2>
              </div>
              
              <div className="p-6 space-y-4">
                {editedWidgets.map((widget, index) => (
                  <div
                    key={widget.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded flex items-center justify-center font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 capitalize">{widget.type}</div>
                        <div className="text-xs text-gray-500">{widget.skin}</div>
                      </div>
                    </div>
                    
                    {/* Editable Fields */}
                    {widget.type === 'heading' && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Text</label>
                        <input
                          type="text"
                          value={widget.text || ''}
                          onChange={(e) => handleWidgetTextChange(index, 'text', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}
                    
                    {widget.type === 'text' && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Text</label>
                        <textarea
                          value={widget.text || ''}
                          onChange={(e) => handleWidgetTextChange(index, 'text', e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}
                    
                    {widget.type === 'menu' && (
                      <div className="bg-gray-50 rounded p-3">
                        <div className="text-sm text-gray-700">
                          {widget.items?.length || 0} menu items
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Menu editing coming in future update
                        </div>
                      </div>
                    )}
                    
                    {widget.type === 'image' && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Image URL</label>
                        <input
                          type="text"
                          value={widget.src || ''}
                          onChange={(e) => handleWidgetTextChange(index, 'src', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Sidebar - Affected Pages */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg sticky top-24">
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Affected Pages</h3>
                </div>
              </div>
              
              {affectedPages.length === 0 ? (
                <div className="p-4 text-sm text-gray-500 text-center">
                  No pages are currently using this section
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {affectedPages.map((page, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded p-3"
                    >
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        {page.pageName}
                      </div>
                      <div className="text-xs text-gray-500 mb-2">
                        {page.websiteName}
                      </div>
                      {page.hasOverrides && (
                        <div className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded">
                          Has overrides
                        </div>
                      )}
                      <Link
                        to={`/v2/live?site=${page.websiteId}&page=${page.pageId}`}
                        className="text-xs text-blue-600 hover:underline mt-2 inline-block"
                      >
                        View live →
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

