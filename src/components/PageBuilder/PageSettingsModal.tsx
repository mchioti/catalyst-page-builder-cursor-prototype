import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { nanoid } from 'nanoid'
import type { CanvasItem } from '../../types'
import { isSection } from '../../types'

type PageLayout = 'full' | 'left' | 'right'
type TabName = 'general' | 'layout' | 'actions'

interface PageSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  usePageStore: any
  canvasItems: CanvasItem[]
  currentWebsiteId: string
  currentPageId: string
  showToast: (message: string, type: 'success' | 'error' | 'info') => void
  onSave?: (settings: {
    pageName?: string
    urlSlug?: string
    pageDescription?: string
    pageLayout?: PageLayout
  }) => void
}

export function PageSettingsModal({
  isOpen,
  onClose,
  usePageStore,
  canvasItems,
  currentWebsiteId,
  currentPageId,
  showToast,
  onSave
}: PageSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<TabName>('general')
  const [pageName, setPageName] = useState('')
  const [urlSlug, setUrlSlug] = useState('')
  const [pageDescription, setPageDescription] = useState('')
  const [pageLayout, setPageLayout] = useState<PageLayout>('full')
  const [stubName, setStubName] = useState('')
  const [stubDescription, setStubDescription] = useState('')

  const { addCustomStarterPage, websites, getPageLayout, setPageLayout: setPageLayoutInStore } = usePageStore()
  const currentWebsite = websites?.find((w: any) => w.id === currentWebsiteId)

  // Load initial values
  useEffect(() => {
    if (isOpen) {
      // Get page name from current context
      const getPageTitle = () => {
        const pathname = window.location.pathname
        if (pathname.includes('/edit/')) {
          const parts = pathname.split('/edit/')[1]?.split('/') || []
          const pageRoute = parts.slice(1).join('/') || 'home'
          
          if (pageRoute.startsWith('journal/')) {
            const journalId = pageRoute.split('/')[1]?.toUpperCase()
            return `${journalId} Journal Home`
          }
          return pageRoute.charAt(0).toUpperCase() + pageRoute.slice(1)
        }
        return 'Homepage'
      }

      const siteName = currentWebsite?.name || ''
      const pageTitle = getPageTitle()
      setPageName(siteName ? `${siteName} - ${pageTitle}` : pageTitle)
      setUrlSlug(currentPageId || 'home')
      
      // Load page layout from store
      const savedLayout = getPageLayout?.(currentWebsiteId, currentPageId)
      if (savedLayout) {
        setPageLayout(savedLayout as PageLayout)
      }
    }
  }, [isOpen, currentWebsiteId, currentPageId, currentWebsite, getPageLayout])

  // Handle layout selection
  const handleLayoutSelect = (layout: PageLayout) => {
    setPageLayout(layout)
  }

  // Handle save as stub
  const handleSaveAsStub = () => {
    if (canvasItems.length === 0) {
      showToast('Cannot save empty page as stub', 'error')
      return
    }

    if (!stubName.trim()) {
      showToast('Please enter a name for this stub', 'error')
      return
    }

    // Deep clone and regenerate IDs for canvas items to avoid conflicts
    const clonedCanvasItems = canvasItems.map((item: CanvasItem) => {
      if (isSection(item)) {
        const newSectionId = nanoid()
        return {
          ...item,
          id: newSectionId,
          areas: (item as any).areas.map((area: any) => ({
            ...area,
            id: nanoid(),
            widgets: area.widgets.map((widget: any) => ({
              ...widget,
              id: nanoid(),
              sectionId: newSectionId
            }))
          }))
        }
      } else {
        return {
          ...item,
          id: nanoid()
        }
      }
    })

    // Create the custom starter page
    const newStarterPage = {
      id: nanoid(),
      name: stubName.trim(),
      description: stubDescription || 'Custom stub',
      source: 'user' as const,
      websiteId: currentWebsiteId,
      websiteName: currentWebsite?.name || 'Unknown',
      createdAt: new Date(),
      canvasItems: clonedCanvasItems
    }

    addCustomStarterPage(newStarterPage)
    showToast(`Stub "${stubName.trim()}" saved!`, 'success')
    
    // Reset form
    setStubName('')
    setStubDescription('')
  }

  // Handle save configuration
  const handleSave = () => {
    // Save page layout to store
    if (setPageLayoutInStore) {
      setPageLayoutInStore(currentWebsiteId, currentPageId, pageLayout)
    }

    // Call onSave callback if provided
    if (onSave) {
      onSave({
        pageName,
        urlSlug,
        pageDescription,
        pageLayout
      })
    }

    showToast('Page configuration saved', 'success')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm transition-opacity"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Page Configuration</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex h-[500px]">
          {/* Sidebar Tabs */}
          <div className="w-48 bg-gray-50 border-r py-4 flex flex-col gap-1">
            <button
              onClick={() => setActiveTab('general')}
              className={`px-6 py-3 text-sm font-medium text-left border-r-2 transition-colors ${
                activeTab === 'general'
                  ? 'text-blue-600 bg-blue-50 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 border-transparent'
              }`}
            >
              General Info
            </button>
            <button
              onClick={() => setActiveTab('layout')}
              className={`px-6 py-3 text-sm font-medium text-left border-r-2 transition-colors ${
                activeTab === 'layout'
                  ? 'text-blue-600 bg-blue-50 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 border-transparent'
              }`}
            >
              Page Layout
            </button>
            <button
              onClick={() => setActiveTab('actions')}
              className={`px-6 py-3 text-sm font-medium text-left border-r-2 transition-colors ${
                activeTab === 'actions'
                  ? 'text-blue-600 bg-blue-50 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 border-transparent'
              }`}
            >
              Actions
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-8" style={{ scrollbarWidth: 'thin' }}>
            {/* General Tab */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Page Name</label>
                  <input
                    type="text"
                    value={pageName}
                    onChange={(e) => setPageName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                    placeholder="e.g. Journal Home"
                  />
                  <p className="mt-1 text-xs text-gray-500">Internal name used in the Design Console.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug</label>
                  <div className="flex rounded-md shadow-sm">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">/</span>
                    <input
                      type="text"
                      value={urlSlug}
                      onChange={(e) => setUrlSlug(e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-r-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="page-slug"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Page Description (SEO)</label>
                  <textarea
                    rows={3}
                    value={pageDescription}
                    onChange={(e) => setPageDescription(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Enter meta description..."
                  />
                </div>
              </div>
            )}

            {/* Page Layout Tab */}
            {activeTab === 'layout' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Global Structure</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Full Width */}
                    <div
                      onClick={() => handleLayoutSelect('full')}
                      className={`layout-card cursor-pointer relative border-2 rounded-lg p-4 hover:border-blue-400 transition-all ${
                        pageLayout === 'full'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="aspect-video bg-white border border-gray-200 rounded mb-3 flex flex-col gap-1 p-1">
                        <div className="h-2 bg-gray-200 rounded w-full"></div>
                        <div className="flex-1 bg-blue-100 rounded w-full flex items-center justify-center text-[10px] text-blue-600 font-medium">
                          Main Content
                        </div>
                        <div className="h-2 bg-gray-200 rounded w-full"></div>
                      </div>
                      <div className="font-medium text-sm text-gray-900">Full Width</div>
                      <div className="text-xs text-gray-500">Standard stacked sections.</div>
                      {pageLayout === 'full' && (
                        <div className="absolute top-2 right-2 text-blue-600">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Right Sidebar */}
                    <div
                      onClick={() => handleLayoutSelect('right')}
                      className={`layout-card cursor-pointer relative border-2 rounded-lg p-4 hover:border-blue-400 transition-all ${
                        pageLayout === 'right'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="aspect-video bg-white border border-gray-200 rounded mb-3 flex flex-col gap-1 p-1">
                        <div className="h-2 bg-gray-200 rounded w-full"></div>
                        <div className="flex-1 flex gap-1">
                          <div className="w-3/4 bg-gray-100 rounded"></div>
                          <div className="w-1/4 bg-gray-200 rounded border border-dashed border-gray-300"></div>
                        </div>
                        <div className="h-2 bg-gray-200 rounded w-full"></div>
                      </div>
                      <div className="font-medium text-sm text-gray-900">Right Sidebar</div>
                      <div className="text-xs text-gray-500">Global sidebar for all sections.</div>
                      {pageLayout === 'right' && (
                        <div className="absolute top-2 right-2 text-blue-600">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Left Sidebar */}
                    <div
                      onClick={() => handleLayoutSelect('left')}
                      className={`layout-card cursor-pointer relative border-2 rounded-lg p-4 hover:border-blue-400 transition-all ${
                        pageLayout === 'left'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="aspect-video bg-white border border-gray-200 rounded mb-3 flex flex-col gap-1 p-1">
                        <div className="h-2 bg-gray-200 rounded w-full"></div>
                        <div className="flex-1 flex gap-1">
                          <div className="w-1/4 bg-gray-200 rounded border border-dashed border-gray-300"></div>
                          <div className="w-3/4 bg-gray-100 rounded"></div>
                        </div>
                        <div className="h-2 bg-gray-200 rounded w-full"></div>
                      </div>
                      <div className="font-medium text-sm text-gray-900">Left Sidebar</div>
                      <div className="text-xs text-gray-500">Navigation rail on the left.</div>
                      {pageLayout === 'left' && (
                        <div className="absolute top-2 right-2 text-blue-600">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions Tab */}
            {activeTab === 'actions' && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <h4 className="text-sm font-bold text-blue-900 mb-1">Create Stub Template</h4>
                  <p className="text-sm text-blue-700 mb-4">
                    Save the current structure (Zones, Layout, and Default Content) as a reusable starter template for other pages.
                  </p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stub Name</label>
                      <input
                        type="text"
                        value={stubName}
                        onChange={(e) => setStubName(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Enter stub name..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                      <input
                        type="text"
                        value={stubDescription}
                        onChange={(e) => setStubDescription(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Enter description..."
                      />
                    </div>
                    <button
                      onClick={handleSaveAsStub}
                      className="bg-white border border-blue-300 text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
                      </svg>
                      Save Page as Stub
                    </button>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="text-sm font-bold text-red-900 mb-1">Danger Zone</h4>
                  <div className="mt-4">
                    <button className="bg-white border border-red-300 text-red-700 hover:bg-red-50 px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-colors">
                      Delete Page
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-6 py-4 flex justify-end gap-3 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 shadow-sm"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  )
}

