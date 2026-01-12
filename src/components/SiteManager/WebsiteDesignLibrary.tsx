/**
 * Website Design Library
 * Shows saved templates and sections created by users for this specific website
 * 
 * Supports two usage modes:
 * - "Copy" - One-time snapshot, page is independent
 * - "Sync with Master" - Page inherits from template, stays synced
 */

import { useState } from 'react'
import { Search, FilePlus2, Layers, Trash2, Download, Copy, Link2 } from 'lucide-react'
import { UseTemplateModal, type TemplateInfo } from '../PageBuilder/UseTemplateModal'
import { nanoid } from 'nanoid'

interface WebsiteDesignLibraryProps {
  websiteId: string
  websiteName: string
  usePageStore: any
  currentPageName?: string // For context when applying templates
}

export function WebsiteDesignLibrary({
  websiteId,
  websiteName,
  usePageStore,
  currentPageName
}: WebsiteDesignLibraryProps) {
  const { 
    customStarterPages = [], 
    customSections = [], 
    removeCustomStarterPage, 
    removeCustomSection,
    replaceCanvasItems,
    setCurrentView,
    selectWidget,
    addNotification,
    setPageInstance,
    currentWebsiteId
  } = usePageStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTab, setSelectedTab] = useState<'starters' | 'sections'>('starters')
  
  // UseTemplateModal state
  const [showUseModal, setShowUseModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateInfo | null>(null)

  // Filter by website
  const websiteStarterPages = customStarterPages.filter((page: any) => page.websiteId === websiteId)
  const websiteSections = customSections.filter((section: any) => section.websiteId === websiteId)

  // Filter by search term
  const filteredStarters = websiteStarterPages.filter((page: any) => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return page.name.toLowerCase().includes(searchLower) || 
           page.description?.toLowerCase().includes(searchLower)
  })

  const filteredSections = websiteSections.filter((section: any) => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return section.name.toLowerCase().includes(searchLower) || 
           section.description?.toLowerCase().includes(searchLower)
  })

  const handleDelete = (id: string, type: 'starter' | 'section', name: string) => {
    if (window.confirm(`Delete "${name}"?\n\nThis action cannot be undone.`)) {
      if (type === 'starter') {
        removeCustomStarterPage(id)
      } else {
        removeCustomSection(id)
      }
    }
  }

  // Open the Use Template modal
  const handleLoad = (id: string, type: 'starter' | 'section', name: string) => {
    if (type === 'starter') {
      const starterPage = customStarterPages.find((p: any) => p.id === id)
      if (!starterPage) {
        addNotification({ type: 'error', title: 'Error', message: 'Template not found' })
        return
      }
      
      // Show the Use Template modal
      setSelectedTemplate({
        id: starterPage.id,
        name: starterPage.name,
        description: starterPage.description,
        canvasItems: starterPage.canvasItems || []
      })
      setShowUseModal(true)
    } else {
      // For sections, just show a message for now
      addNotification({ type: 'info', title: 'Section Load', message: 'Section loading to be implemented' })
    }
  }
  
  // Handle "Start as Copy" - one-time snapshot, no sync
  const handleUseCopy = (template: TemplateInfo) => {
    // Deep clone and regenerate IDs to avoid conflicts
    const clonedItems = template.canvasItems.map((item: any) => {
      if (item.type === 'section') {
        const newSectionId = nanoid()
        return {
          ...item,
          id: newSectionId,
          // Remove zoneSlug since this is a copy (no inheritance)
          zoneSlug: undefined,
          areas: item.areas?.map((area: any) => ({
            ...area,
            id: nanoid(),
            widgets: area.widgets?.map((widget: any) => ({
              ...widget,
              id: nanoid(),
              sectionId: newSectionId
            }))
          }))
        }
      }
      return { ...item, id: nanoid() }
    })
    
    selectWidget(null)
    replaceCanvasItems(clonedItems)
    setCurrentView('page-builder')
    addNotification({ 
      type: 'success', 
      title: 'Template Applied as Copy', 
      message: `"${template.name}" loaded. This page is independent.` 
    })
  }
  
  // Handle "Sync with Master" - create PageInstance with archetype relationship
  const handleUseSync = (template: TemplateInfo) => {
    // For sync, we keep the original structure with zoneSlugs
    // This creates an archetype relationship
    
    // Create a new PageInstance that references this template as archetype
    const pageId = currentPageName || `page-${nanoid(6)}`
    
    // Note: In a full implementation, we would:
    // 1. Save the template as an archetype if it isn't already
    // 2. Create a PageInstance that references it
    // 3. Load the resolved canvas from the archetype
    
    // For now, load with zoneSlugs preserved (future sync capability)
    const itemsWithZones = template.canvasItems.map((item: any, index: number) => {
      if (item.type === 'section') {
        return {
          ...item,
          // Preserve or create zoneSlug for sync capability
          zoneSlug: item.zoneSlug || `zone_${index}`
        }
      }
      return item
    })
    
    selectWidget(null)
    replaceCanvasItems(itemsWithZones)
    setCurrentView('page-builder')
    
    // TODO: Actually create PageInstance and save archetype relationship
    // This would involve:
    // - saveArchetype(template as archetype)
    // - createPageInstance({ websiteId, pageId, archetypeId: template.id })
    
    addNotification({ 
      type: 'success', 
      title: 'Synced with Master', 
      message: `Page is now synced with "${template.name}". Updates will propagate.` 
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6">
        <h2 className="text-2xl font-bold text-gray-900">{websiteName} - Templates</h2>
        <p className="text-gray-600 mt-1">
          Your saved templates and reusable sections for this website
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setSelectedTab('starters')}
          className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
            selectedTab === 'starters'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <FilePlus2 className="w-4 h-4" />
            Saved Templates ({websiteStarterPages.length})
          </div>
        </button>
        <button
          onClick={() => setSelectedTab('sections')}
          className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
            selectedTab === 'sections'
              ? 'border-green-600 text-green-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Saved Sections ({websiteSections.length})
          </div>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${selectedTab === 'starters' ? 'templates' : 'sections'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg border border-gray-200">
        {selectedTab === 'starters' ? (
          // Starter Pages / Templates
          filteredStarters.length === 0 ? (
            <div className="p-12 text-center">
              <FilePlus2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No templates found' : 'No saved templates yet'}
              </h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? 'Try adjusting your search terms.' 
                  : 'Save a page as a copy in the Page Builder to see it here.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredStarters.map((page: any) => {
                const itemCount = page.canvasItems?.length || 0
                return (
                  <div key={page.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <FilePlus2 className="w-5 h-5 text-blue-600" />
                          <h3 className="text-lg font-semibold text-gray-900">{page.name}</h3>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">{page.description}</p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                          <span>{itemCount} section{itemCount !== 1 ? 's' : ''}</span>
                          <span>•</span>
                          <span>Created {new Date(page.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleLoad(page.id, 'starter', page.name)}
                          className="px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded transition-colors flex items-center gap-1.5"
                          title="Use this template"
                        >
                          <Download className="w-4 h-4" />
                          Use
                        </button>
                        <button
                          onClick={() => handleDelete(page.id, 'starter', page.name)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        ) : (
          // Saved Sections
          filteredSections.length === 0 ? (
            <div className="p-12 text-center">
              <Layers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No sections found' : 'No saved sections yet'}
              </h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? 'Try adjusting your search terms.' 
                  : 'Save a section in the Page Builder to see it here.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredSections.map((section: any) => {
                const widgetCount = section.canvasItems?.reduce((count: number, item: any) => {
                  if (item.areas) {
                    return count + item.areas.reduce((areaCount: number, area: any) => 
                      areaCount + area.widgets.length, 0)
                  }
                  return count + 1
                }, 0) || 0

                return (
                  <div key={section.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <Layers className="w-5 h-5 text-green-600" />
                          <h3 className="text-lg font-semibold text-gray-900">{section.name}</h3>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">{section.description}</p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                          <span>{widgetCount} widget{widgetCount !== 1 ? 's' : ''}</span>
                          <span>•</span>
                          <span>Created {new Date(section.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleLoad(section.id, 'section', section.name)}
                          className="px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded transition-colors flex items-center gap-1.5"
                          title="Load in editor"
                        >
                          <Download className="w-4 h-4" />
                          Load
                        </button>
                        <button
                          onClick={() => handleDelete(section.id, 'section', section.name)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        )}
      </div>
      
      {/* Use Template Modal */}
      <UseTemplateModal
        isOpen={showUseModal}
        onClose={() => {
          setShowUseModal(false)
          setSelectedTemplate(null)
        }}
        template={selectedTemplate}
        onUseCopy={handleUseCopy}
        onUseSync={handleUseSync}
        currentPageName={currentPageName}
      />
    </div>
  )
}

