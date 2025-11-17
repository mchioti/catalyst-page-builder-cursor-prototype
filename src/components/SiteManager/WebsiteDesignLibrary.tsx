/**
 * Website Design Library
 * Shows saved starter pages and sections created by users for this specific website
 */

import { useState } from 'react'
import { Search, FileText, Layout, Trash2, Eye } from 'lucide-react'

interface WebsiteDesignLibraryProps {
  websiteId: string
  websiteName: string
  usePageStore: any
}

export function WebsiteDesignLibrary({
  websiteId,
  websiteName,
  usePageStore
}: WebsiteDesignLibraryProps) {
  const { customStarterPages = [], customSections = [], removeCustomStarterPage, removeCustomSection } = usePageStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTab, setSelectedTab] = useState<'starters' | 'sections'>('starters')

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

  const handlePreview = (id: string, type: 'starter' | 'section') => {
    console.log('Preview:', type, id)
    // TODO: Implement preview functionality
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6">
        <h2 className="text-2xl font-bold text-gray-900">{websiteName} - Design Library</h2>
        <p className="text-gray-600 mt-1">
          Your saved starter pages and reusable sections for this website
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
            <FileText className="w-4 h-4" />
            Saved Starter Pages ({websiteStarterPages.length})
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
            <Layout className="w-4 h-4" />
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
            placeholder={`Search ${selectedTab === 'starters' ? 'starter pages' : 'sections'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg border border-gray-200">
        {selectedTab === 'starters' ? (
          // Starter Pages
          filteredStarters.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No starter pages found' : 'No saved starter pages yet'}
              </h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? 'Try adjusting your search terms.' 
                  : 'Save a page as a starter in the Page Builder to see it here.'}
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
                          <FileText className="w-5 h-5 text-blue-600" />
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
                          onClick={() => handlePreview(page.id, 'starter')}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
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
              <Layout className="w-16 h-16 text-gray-300 mx-auto mb-4" />
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
                          <Layout className="w-5 h-5 text-green-600" />
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
                          onClick={() => handlePreview(section.id, 'section')}
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
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
    </div>
  )
}

