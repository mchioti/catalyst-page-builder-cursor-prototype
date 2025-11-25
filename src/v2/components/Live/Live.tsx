/**
 * V2 Live - Mock live site viewer
 */

import { useSearchParams, Link } from 'react-router-dom'
import { useWebsiteStore } from '../../stores/websiteStore'
import { useSharedSectionsStore } from '../../stores/sharedSectionsStore'
import { resolvePageById } from '../../utils/compositionResolver'
import { SectionRenderer } from './SectionRenderer'
import { Edit, Globe, AlertCircle } from 'lucide-react'

export function Live() {
  const [searchParams] = useSearchParams()
  const websiteId = searchParams.get('site') || 'catalyst-demo'
  const pageId = searchParams.get('page')
  
  const websites = useWebsiteStore(state => state.websites)
  const getPageById = useWebsiteStore(state => state.getPageById)
  const sharedSections = useSharedSectionsStore(state => state.sections)
  
  const website = websites.find(w => w.id === websiteId)
  const currentPage = pageId && website
    ? getPageById(websiteId, pageId)
    : website?.pages.find(p => p.status === 'published') || website?.pages[0]
  
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
          <div className="text-sm text-gray-500">This website has no pages</div>
        </div>
      </div>
    )
  }
  
  // Get journal context if this is a journal page
  const journal = currentPage.journalId 
    ? website.journals?.find(j => j.id === currentPage.journalId)
    : undefined
  
  // Resolve the page composition to actual sections with context
  const resolvedSections = resolvePageById(currentPage, sharedSections, {
    journal,
    website
  })
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Live Site Status Bar */}
      <div className="bg-green-50 border-b border-green-200 px-6 py-3 sticky top-0 z-50">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              </div>
              <div>
                <div className="font-semibold text-green-900 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  {website.name}
                </div>
                <div className="text-xs text-green-700">
                  {currentPage.status === 'published' ? 'Published' : 'Draft Preview'}
                </div>
              </div>
            </div>
            
            <div className="h-6 w-px bg-green-300" />
            
            {/* Page Navigation - Journal-aware */}
            <div className="flex items-center gap-2">
              {currentPage.journalId ? (
                // Journal platform: Show current journal + page
                <>
                  <span className="text-xs text-green-700">
                    {website.journals?.find(j => j.id === currentPage.journalId)?.name || 'Journal'}
                  </span>
                  <span className="text-green-500">→</span>
                  <span className="px-3 py-1 rounded text-sm bg-green-600 text-white font-medium">
                    {currentPage.name}
                  </span>
                </>
              ) : (
                // Regular website: Show all pages
                website.pages.slice(0, 5).map(page => (
                  <Link
                    key={page.id}
                    to={`/v2/live?site=${websiteId}&page=${page.id}`}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      page.id === currentPage.id
                        ? 'bg-green-600 text-white font-medium'
                        : 'text-green-700 hover:bg-green-100'
                    }`}
                  >
                    {page.name}
                    {page.status === 'draft' && (
                      <span className="ml-1 text-xs opacity-70">(Draft)</span>
                    )}
                  </Link>
                ))
              )}
            </div>
          </div>
          
          <Link
            to={`/v2/editor?site=${websiteId}&page=${currentPage.id}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit Page
          </Link>
        </div>
      </div>
      
      {/* Rendered Page Content */}
      <div className="flex-1 bg-white">
        {resolvedSections.length === 0 ? (
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center text-gray-500">
              <p className="text-lg mb-2">Empty Page</p>
              <p className="text-sm">This page has no sections yet.</p>
              <Link
                to={`/v2/editor?site=${websiteId}&page=${currentPage.id}`}
                className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Sections
              </Link>
            </div>
          </div>
        ) : (
          <div>
            {resolvedSections.map((section) => (
              <SectionRenderer key={section.id} section={section} />
            ))}
          </div>
        )}
      </div>
      
      {/* Debug Info (removable later) */}
      <div className="bg-gray-100 border-t border-gray-200 px-6 py-3">
        <div className="max-w-7xl mx-auto text-xs text-gray-500 flex items-center justify-between">
          <div>
            Page: <strong>{currentPage.name}</strong> ({resolvedSections.length} sections)
          </div>
          <div className="flex items-center gap-4">
            <div>
              Status: <strong className={currentPage.status === 'published' ? 'text-green-600' : 'text-amber-600'}>
                {currentPage.status}
              </strong>
            </div>
            <div>
              Updated: {currentPage.updatedAt.toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

