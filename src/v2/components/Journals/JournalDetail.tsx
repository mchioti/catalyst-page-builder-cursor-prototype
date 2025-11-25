/**
 * Journal Detail Page
 * Manage a single journal's pages, sections, and metadata
 */

import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useWebsiteStore } from '../../stores/websiteStore'
import { useSharedSectionsStore } from '../../stores/sharedSectionsStore'
import { ArrowLeft, Edit, Globe, BookOpen, Palette, FileText, AlertCircle, Copy, ExternalLink } from 'lucide-react'
import type { SharedSection } from '../../types/core'

type TabType = 'pages' | 'sections' | 'metadata'

export function JournalDetail() {
  const { websiteId, journalId } = useParams<{ websiteId: string; journalId: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabType>('sections')
  
  const websites = useWebsiteStore(state => state.websites)
  const getJournalById = useWebsiteStore(state => state.getJournalById)
  const getPagesForJournal = useWebsiteStore(state => state.getPagesForJournal)
  const sharedSections = useSharedSectionsStore(state => state.sections)
  
  const website = websites.find(w => w.id === websiteId)
  const journal = websiteId && journalId ? getJournalById(websiteId, journalId) : undefined
  const journalPages = websiteId && journalId ? getPagesForJournal(websiteId, journalId) : []
  
  if (!website || !journal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <div className="text-lg font-semibold">Journal not found</div>
          <div className="text-sm text-gray-500">Website: {websiteId}, Journal: {journalId}</div>
        </div>
      </div>
    )
  }
  
  // Get sections used by this journal
  const getSectionsUsedByJournal = () => {
    const sectionIds = new Set<string>()
    journalPages.forEach(page => {
      page.composition.forEach(item => {
        sectionIds.add(item.sharedSectionId)
      })
    })
    return Array.from(sectionIds).map(id => sharedSections.find(s => s.id === id)).filter(Boolean) as SharedSection[]
  }
  
  const sectionsUsed = getSectionsUsedByJournal()
  const bannerSections = sectionsUsed.filter(s => s.category === 'hero')
  const headerSections = sectionsUsed.filter(s => s.category === 'header')
  const footerSections = sectionsUsed.filter(s => s.category === 'footer')
  
  // Check if section is journal-specific
  const isJournalSpecific = (section: SharedSection) => {
    return section.websiteId === websiteId && section.id.includes(journalId)
  }
  
  // Handle forking a global section for this journal
  const handleModifyForJournal = (section: SharedSection) => {
    if (!websiteId || !journalId) return
    
    const addSection = useSharedSectionsStore.getState().addSection
    const updatePageComposition = useWebsiteStore.getState().updatePageComposition
    
    // Create forked section ID
    const forkedSectionId = `${section.id}-${journalId}`
    
    // Clone the section
    const forkedSection: SharedSection = {
      ...section,
      id: forkedSectionId,
      name: `${section.name} (${journal!.name})`,
      description: `${journal!.name}-specific customization`,
      isGlobal: false,
      websiteId,
      // Note: We don't have journalId in SharedSection type, but we can use the ID pattern
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    // Add forked section to store
    addSection(forkedSection)
    
    // Update all journal pages to use the forked section
    journalPages.forEach(page => {
      const updatedComposition = page.composition.map(item =>
        item.sharedSectionId === section.id
          ? { ...item, sharedSectionId: forkedSectionId, inheritFromTheme: false, divergenceCount: 0 }
          : item
      )
      updatePageComposition(websiteId, page.id, updatedComposition)
    })
    
    // Navigate to section editor
    navigate(`/v2/design/section/${forkedSectionId}/full`)
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to={`/v2/websites/${websiteId}`}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              
              <div>
                <div className="flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-gray-700" />
                  <h1 className="text-2xl font-bold text-gray-900">{journal.name}</h1>
                  {journal.acronym && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded">
                      {journal.acronym}
                    </span>
                  )}
                  {journal.status === 'discontinued' && (
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-sm font-medium rounded">
                      Discontinued
                    </span>
                  )}
                  {journal.isOpenAccess && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-sm font-medium rounded">
                      🔓 Open Access
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500 mt-1">{website.name}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Link
                to={`/v2/live?site=${websiteId}&page=${journalPages[0]?.id}`}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Globe className="w-4 h-4" />
                View Live
              </Link>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-1 mt-4 border-b">
            <button
              onClick={() => setActiveTab('sections')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'sections'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Sections
              </div>
            </button>
            <button
              onClick={() => setActiveTab('pages')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'pages'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Pages ({journalPages.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('metadata')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'metadata'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Metadata
              </div>
            </button>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'sections' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Journal Sections</h2>
              <p className="text-sm text-gray-600 mb-6">
                Manage structural customizations for this journal. Changes here will affect all <strong>{journal.name}</strong> pages.
              </p>
            </div>
            
            {/* Banner Sections */}
            {bannerSections.length > 0 && (
              <div className="bg-white rounded-lg border p-6">
                <h3 className="font-semibold mb-4 text-gray-900">Journal Banner</h3>
                <div className="space-y-4">
                  {bannerSections.map(section => {
                    const isCustom = isJournalSpecific(section)
                    const variationCount = Object.keys(section.variations).length
                    
                    return (
                      <div key={section.id} className="border rounded-lg p-4 hover:border-blue-300 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-medium text-gray-900">{section.name}</h4>
                              {isCustom ? (
                                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                                  Journal-Specific
                                </span>
                              ) : (
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                                  Global
                                </span>
                              )}
                              <span className="text-xs text-gray-500">{variationCount} variations</span>
                            </div>
                            <p className="text-sm text-gray-600">{section.description}</p>
                            
                            {!isCustom && (
                              <div className="mt-3 text-xs text-gray-500 bg-blue-50 border border-blue-200 rounded p-2">
                                💡 Content (title, description, colors) comes from Journal data via template variables
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            {isCustom ? (
                              <button
                                onClick={() => navigate(`/v2/design/section/${section.id}/full`)}
                                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                              >
                                <Edit className="w-4 h-4" />
                                Edit
                              </button>
                            ) : (
                              <button
                                onClick={() => handleModifyForJournal(section)}
                                className="flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                              >
                                <Copy className="w-4 h-4" />
                                Modify for This Journal
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            
            {/* Platform Header */}
            {headerSections.length > 0 && (
              <div className="bg-white rounded-lg border p-6">
                <h3 className="font-semibold mb-4 text-gray-900">Platform Headers</h3>
                <div className="space-y-4">
                  {headerSections.map(section => (
                    <div key={section.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{section.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                        </div>
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                          Shared
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Footers */}
            {footerSections.length > 0 && (
              <div className="bg-white rounded-lg border p-6">
                <h3 className="font-semibold mb-4 text-gray-900">Footers</h3>
                <div className="space-y-4">
                  {footerSections.map(section => (
                    <div key={section.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{section.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                        </div>
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                          Shared
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'pages' && (
          <div className="bg-white rounded-lg border">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">Journal Pages</h2>
              <p className="text-sm text-gray-600 mt-1">
                All pages belonging to {journal.name}
              </p>
            </div>
            <div className="divide-y">
              {journalPages.map(page => (
                <div key={page.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium text-gray-900">{page.name}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          page.status === 'published'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {page.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">/{page.slug}</div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/v2/live?site=${websiteId}&page=${page.id}`}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                        title="View Live"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <Link
                        to={`/v2/editor?site=${websiteId}&page=${page.id}`}
                        className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded transition-colors text-sm"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'metadata' && (
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-6">Journal Metadata</h2>
            
            <div className="space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Journal Name</label>
                    <div className="mt-1 text-gray-900">{journal.name}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Acronym</label>
                    <div className="mt-1 text-gray-900">{journal.acronym || '—'}</div>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <div className="mt-1 text-gray-900">{journal.description || '—'}</div>
                  </div>
                </div>
              </div>
              
              {/* Publishing Info */}
              <div className="pt-6 border-t">
                <h3 className="font-medium text-gray-900 mb-3">Publishing Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  {journal.issn?.print && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">ISSN (Print)</label>
                      <div className="mt-1 text-gray-900">{journal.issn.print}</div>
                    </div>
                  )}
                  {journal.issn?.online && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">ISSN (Online)</label>
                      <div className="mt-1 text-gray-900">{journal.issn.online}</div>
                    </div>
                  )}
                  {journal.impactFactor && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Impact Factor</label>
                      <div className="mt-1 text-gray-900">{journal.impactFactor}</div>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-700">Open Access</label>
                    <div className="mt-1 text-gray-900">{journal.isOpenAccess ? 'Yes' : 'No'}</div>
                  </div>
                </div>
              </div>
              
              {/* Branding */}
              <div className="pt-6 border-t">
                <h3 className="font-medium text-gray-900 mb-3">Branding</h3>
                <div className="grid grid-cols-2 gap-4">
                  {journal.branding?.primaryColor && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Primary Color</label>
                      <div className="mt-1 flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded border"
                          style={{ backgroundColor: journal.branding.primaryColor }}
                        />
                        <span className="text-gray-900">{journal.branding.primaryColor}</span>
                      </div>
                    </div>
                  )}
                  {journal.branding?.secondaryColor && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Secondary Color</label>
                      <div className="mt-1 flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded border"
                          style={{ backgroundColor: journal.branding.secondaryColor }}
                        />
                        <span className="text-gray-900">{journal.branding.secondaryColor}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="pt-6 border-t bg-blue-50 -mx-6 -mb-6 p-6 rounded-b-lg">
                <div className="text-sm text-blue-800">
                  💡 <strong>Note:</strong> Metadata changes are managed by the CMS. These values are displayed via template variables in sections.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

