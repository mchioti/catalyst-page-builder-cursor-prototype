/**
 * V2 Editor - Section-based page builder
 */

import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useWebsiteStore } from '../../stores/websiteStore'
import { useEditorStore } from '../../stores/editorStore'
import { Save, AlertCircle, CheckCircle } from 'lucide-react'
import { SectionLibrary } from './SectionLibrary'
import { EditorCanvas } from './EditorCanvas'
import { PropertiesPanel } from './PropertiesPanel'

export function Editor() {
  const [searchParams, setSearchParams] = useSearchParams()
  const websiteId = searchParams.get('site') || 'catalyst-demo'
  const pageId = searchParams.get('page') || null
  
  const websites = useWebsiteStore(state => state.websites)
  const getPageById = useWebsiteStore(state => state.getPageById)
  const updatePage = useWebsiteStore(state => state.updatePage)
  
  const composition = useEditorStore(state => state.composition)
  const setComposition = useEditorStore(state => state.setComposition)
  const setEditingContext = useEditorStore(state => state.setEditingContext)
  const hasUnsavedChanges = useEditorStore(state => state.hasUnsavedChanges)
  const markAsSaved = useEditorStore(state => state.markAsSaved)
  
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  
  const website = websites.find(w => w.id === websiteId)
  const currentPage = pageId ? getPageById(websiteId, pageId) : website?.pages[0]
  
  // Load page composition into editor when page changes
  useEffect(() => {
    if (currentPage) {
      setEditingContext(websiteId, currentPage.id)
      setComposition(currentPage.composition)
    }
  }, [currentPage?.id, websiteId])
  
  const handleSave = () => {
    if (!currentPage) return
    
    setSaveStatus('saving')
    
    // Update the page with new composition
    updatePage(websiteId, currentPage.id, {
      composition,
      updatedAt: new Date()
    })
    
    markAsSaved()
    setSaveStatus('saved')
    
    setTimeout(() => setSaveStatus('idle'), 2000)
  }
  
  const handlePageChange = (newPageId: string) => {
    setSearchParams({ site: websiteId, page: newPageId })
  }
  
  if (!website) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <div className="text-lg font-semibold text-gray-900">Website not found</div>
          <div className="text-sm text-gray-500">Site ID: {websiteId}</div>
        </div>
      </div>
    )
  }
  
  if (!currentPage) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <div className="text-lg font-semibold text-gray-900">No pages found</div>
          <div className="text-sm text-gray-500">This website has no pages to edit</div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="h-screen flex flex-col">
      {/* Top Toolbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <div className="text-sm text-gray-500">Editing</div>
              <div className="font-semibold text-gray-900">{website.name}</div>
            </div>
            
            <div className="h-8 w-px bg-gray-300" />
            
            <div>
              <label className="text-xs text-gray-500 block mb-1">Page</label>
              <select
                value={currentPage.id}
                onChange={(e) => handlePageChange(e.target.value)}
                className="text-sm border border-gray-300 rounded px-3 py-1 pr-8"
              >
                {website.pages.map(page => (
                  <option key={page.id} value={page.id}>
                    {page.name} {page.status === 'draft' ? '(Draft)' : ''}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="text-xs text-gray-500">
              {composition.length} section{composition.length !== 1 ? 's' : ''}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Link
              to={`/v2/live?site=${websiteId}&page=${currentPage.id}`}
              className="text-sm text-blue-600 hover:underline"
            >
              View Live →
            </Link>
            
            {hasUnsavedChanges && (
              <div className="text-sm text-amber-600 flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full" />
                Unsaved changes
              </div>
            )}
            
            {saveStatus === 'saved' && (
              <div className="text-sm text-green-600 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Saved
              </div>
            )}
            
            <button
              onClick={handleSave}
              disabled={!hasUnsavedChanges || saveStatus === 'saving'}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saveStatus === 'saving' ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Editor Layout */}
      <div className="flex-1 flex overflow-hidden">
        <SectionLibrary />
        <EditorCanvas />
        <PropertiesPanel />
      </div>
    </div>
  )
}

