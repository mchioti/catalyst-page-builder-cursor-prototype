/**
 * Website Detail View
 * Shows pages, settings, and actions for a specific website
 */

import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useWebsiteStore } from '../../stores/websiteStore'
import { useSharedSectionsStore } from '../../stores/sharedSectionsStore'
import { ArrowLeft, Globe, Plus, Edit, Trash2, Settings, Eye, Layers } from 'lucide-react'

export function WebsiteDetail() {
  const { websiteId } = useParams<{ websiteId: string }>()
  const navigate = useNavigate()
  const websites = useWebsiteStore(state => state.websites)
  const updateWebsite = useWebsiteStore(state => state.updateWebsite)
  const updatePageComposition = useWebsiteStore(state => state.updatePageComposition)
  const sharedSections = useSharedSectionsStore(state => state.sections)
  const addSection = useSharedSectionsStore(state => state.addSection)
  const [activeTab, setActiveTab] = useState<'pages' | 'sections' | 'journals'>('pages')
  
  const website = websites.find(w => w.id === websiteId)
  
  // Find headers and footers used by this website
  const usedSections = new Map<string, { section: any; variations: Set<string>; pages: string[] }>()
  
  if (website) {
    website.pages.forEach(page => {
      page.composition.forEach(item => {
        const section = sharedSections.find(s => s.id === item.sharedSectionId)
        if (section && (section.category === 'header' || section.category === 'footer')) {
          const key = section.id
          if (!usedSections.has(key)) {
            usedSections.set(key, {
              section,
              variations: new Set([item.variationKey]),
              pages: [page.name]
            })
          } else {
            const existing = usedSections.get(key)!
            existing.variations.add(item.variationKey)
            if (!existing.pages.includes(page.name)) {
              existing.pages.push(page.name)
            }
          }
        }
      })
    })
  }
  
  const headers = Array.from(usedSections.values()).filter(s => s.section.category === 'header')
  const footers = Array.from(usedSections.values()).filter(s => s.section.category === 'footer')
  
  // Handle "Modify for This Site" - Fork a global section to website-specific
  const handleModifyForSite = (section: any) => {
    if (!website) return
    
    // Create a new section ID
    const newSectionId = `${section.id}-${website.id}`
    
    // Clone the section with new ID and website association
    const forkedSection = {
      ...section,
      id: newSectionId,
      name: `${section.name} (${website.name})`,
      websiteId: website.id,
      isGlobal: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    // Add to shared sections store
    addSection(forkedSection)
    
    // Update all pages in this website that use the old section
    website.pages.forEach(page => {
      const hasSection = page.composition.some(item => item.sharedSectionId === section.id)
      if (hasSection) {
        const newComposition = page.composition.map(item =>
          item.sharedSectionId === section.id
            ? { ...item, sharedSectionId: newSectionId }
            : item
        )
        updatePageComposition(website.id, page.id, newComposition)
      }
    })
    
    // Navigate to the section editor for the new forked section
    navigate(`/v2/design/section/${newSectionId}/${Object.keys(section.variations)[0]}`)
  }
  
  if (!website) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto text-center">
          <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Website not found</h2>
          <Link to="/v2/websites" className="text-blue-600 hover:underline">
            Back to Websites
          </Link>
        </div>
      </div>
    )
  }
  
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Link 
          to="/v2/websites"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Websites
        </Link>
        
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Globe className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">{website.name}</h1>
            </div>
            <a 
              href={`https://${website.domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {website.domain}
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to={`/v2/live?site=${website.id}`}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              View Live
            </Link>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </div>
        </div>
        
        {/* Branding Card */}
        {(website.branding.primaryColor || website.branding.secondaryColor) && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Brand Colors</h3>
            <div className="flex items-center gap-4">
              {website.branding.primaryColor && (
                <div className="flex items-center gap-2">
                  <div 
                    className="w-12 h-12 rounded border border-gray-300"
                    style={{ backgroundColor: website.branding.primaryColor }}
                  />
                  <div className="text-sm text-gray-600">
                    <div className="font-medium">Primary</div>
                    <div className="font-mono">{website.branding.primaryColor}</div>
                  </div>
                </div>
              )}
              {website.branding.secondaryColor && (
                <div className="flex items-center gap-2">
                  <div 
                    className="w-12 h-12 rounded border border-gray-300"
                    style={{ backgroundColor: website.branding.secondaryColor }}
                  />
                  <div className="text-sm text-gray-600">
                    <div className="font-medium">Secondary</div>
                    <div className="font-mono">{website.branding.secondaryColor}</div>
                  </div>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Note: Logos are managed within Header &amp; Footer sections. Use "Modify for This Site" to create website-specific versions.
            </p>
          </div>
        )}
        
        {/* Tabs */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="border-b border-gray-200 flex items-center justify-between px-6 pt-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveTab('pages')}
                className={`pb-4 px-2 font-medium border-b-2 transition-colors ${
                  activeTab === 'pages'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Pages ({website.pages.length})
              </button>
              <button
                onClick={() => setActiveTab('sections')}
                className={`pb-4 px-2 font-medium border-b-2 transition-colors ${
                  activeTab === 'sections'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Header & Footer ({headers.length + footers.length})
              </button>
              {website.journals && website.journals.length > 0 && (
                <button
                  onClick={() => setActiveTab('journals')}
                  className={`pb-4 px-2 font-medium border-b-2 transition-colors ${
                    activeTab === 'journals'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Journals ({website.journals.length})
                </button>
              )}
            </div>
            {activeTab === 'pages' && (
              <button className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Page
              </button>
            )}
          </div>
          
          {/* Pages Tab - Hierarchical Sitemap */}
          {activeTab === 'pages' && (
            <div className="p-6 space-y-6">
              {/* Platform Pages (no journal) */}
              {(() => {
                const platformPages = website.pages.filter(p => !p.journalId)
                if (platformPages.length === 0) return null
                
                return (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Layers className="w-5 h-5 text-gray-600" />
                      <h4 className="text-lg font-semibold text-gray-900">Platform Pages</h4>
                      <span className="text-sm text-gray-500">({platformPages.length})</span>
                    </div>
                    <div className="space-y-2 ml-7">
                      {platformPages.map(page => (
                        <div 
                          key={page.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="font-medium text-gray-900">{page.name}</h5>
                              <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                                page.status === 'published' 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {page.status}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              /{page.slug} • {page.composition.length} sections
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/v2/live?site=${website.id}&page=${page.id}`}
                              className="px-2 py-1 text-xs bg-white text-gray-700 rounded border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              View
                            </Link>
                            <Link
                              to={`/v2/editor?site=${website.id}&page=${page.id}`}
                              className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
                            >
                              <Edit className="w-3 h-3" />
                              Edit
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()}
              
              {/* Journal Pages (grouped by journal) */}
              {website.journals && website.journals.map(journal => {
                const journalPages = website.pages.filter(p => p.journalId === journal.id)
                if (journalPages.length === 0) return null
                
                return (
                  <div key={journal.id}>
                    <div 
                      className="flex items-center gap-2 mb-4 pb-2 border-b-2"
                      style={{ borderColor: journal.branding?.primaryColor || '#6b7280' }}
                    >
                      <Globe className="w-5 h-5" style={{ color: journal.branding?.primaryColor || '#6b7280' }} />
                      <h4 className="text-lg font-semibold text-gray-900">{journal.name}</h4>
                      {journal.acronym && (
                        <span className="text-xs text-gray-500 font-mono">({journal.acronym})</span>
                      )}
                      <span className="text-sm text-gray-500">({journalPages.length} pages)</span>
                      {journal.isOpenAccess && (
                        <span className="text-xs">🔓</span>
                      )}
                      {journal.isDiscontinued && (
                        <span className="text-xs">⚠️</span>
                      )}
                    </div>
                    <div className="space-y-2 ml-7">
                      {journalPages.map(page => (
                        <div 
                          key={page.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="font-medium text-gray-900">{page.name}</h5>
                              <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                                page.status === 'published' 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {page.status}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              /{page.slug} • {page.composition.length} sections
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/v2/live?site=${website.id}&page=${page.id}`}
                              className="px-2 py-1 text-xs bg-white text-gray-700 rounded border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              View
                            </Link>
                            <Link
                              to={`/v2/editor?site=${website.id}&page=${page.id}`}
                              className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
                            >
                              <Edit className="w-3 h-3" />
                              Edit
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
              
              {website.pages.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Layers className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No pages created yet.</p>
                </div>
              )}
            </div>
          )}
          
          {/* Sections Tab (Headers & Footers) */}
          {activeTab === 'sections' && (
            <div className="p-6 space-y-6">
              {/* Headers */}
              {headers.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Layers className="w-5 h-5 text-gray-600" />
                    <h4 className="text-lg font-semibold text-gray-900">Headers</h4>
                  </div>
                  <div className="space-y-3">
                    {headers.map(({ section, variations, pages }) => {
                      const isWebsiteSpecific = section.websiteId === website.id
                      const isGlobal = !section.websiteId && section.isGlobal
                      
                      return (
                        <div 
                          key={section.id}
                          className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h5 className="font-medium text-gray-900">{section.name}</h5>
                                {isWebsiteSpecific && (
                                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">
                                    Modified for {website.name}
                                  </span>
                                )}
                                {isGlobal && (
                                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                                    Global
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{section.description}</p>
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                <span>{variations.size} variation{variations.size !== 1 ? 's' : ''} used</span>
                                <span>•</span>
                                <span>On {pages.length} page{pages.length !== 1 ? 's' : ''}: {pages.join(', ')}</span>
                              </div>
                              <div className="mt-2 flex flex-wrap gap-1">
                                {Array.from(variations).map(varKey => (
                                  <span key={varKey} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded">
                                    {section.variations[varKey]?.name || varKey}
                                  </span>
                              ))}
                            </div>
                          </div>
                            <div className="flex items-center gap-2 ml-4">
                              {isWebsiteSpecific ? (
                                <Link
                                  to={`/v2/design/section/${section.id}/${Array.from(variations)[0]}`}
                                  className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-1"
                                >
                                  <Edit className="w-4 h-4" />
                                  Edit
                                </Link>
                              ) : (
                                <button
                                  onClick={() => handleModifyForSite(section)}
                                  className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"
                                >
                                  Modify for This Site
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
              
              {/* Footers */}
              {footers.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Layers className="w-5 h-5 text-gray-600" />
                    <h4 className="text-lg font-semibold text-gray-900">Footers</h4>
                  </div>
                  <div className="space-y-3">
                    {footers.map(({ section, variations, pages }) => {
                      const isWebsiteSpecific = section.websiteId === website.id
                      const isGlobal = !section.websiteId && section.isGlobal
                      
                      return (
                        <div 
                          key={section.id}
                          className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h5 className="font-medium text-gray-900">{section.name}</h5>
                                {isWebsiteSpecific && (
                                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">
                                    Modified for {website.name}
                                  </span>
                                )}
                                {isGlobal && (
                                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                                    Global
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{section.description}</p>
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                <span>{variations.size} variation{variations.size !== 1 ? 's' : ''} used</span>
                                <span>•</span>
                                <span>On {pages.length} page{pages.length !== 1 ? 's' : ''}: {pages.join(', ')}</span>
                              </div>
                              <div className="mt-2 flex flex-wrap gap-1">
                                {Array.from(variations).map(varKey => (
                                  <span key={varKey} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded">
                                    {section.variations[varKey]?.name || varKey}
                                  </span>
                              ))}
                            </div>
                          </div>
                            <div className="flex items-center gap-2 ml-4">
                              {isWebsiteSpecific ? (
                                <Link
                                  to={`/v2/design/section/${section.id}/${Array.from(variations)[0]}`}
                                  className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-1"
                                >
                                  <Edit className="w-4 h-4" />
                                  Edit
                                </Link>
                              ) : (
                                <button
                                  onClick={() => handleModifyForSite(section)}
                                  className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"
                                >
                                  Modify for This Site
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
              
              {headers.length === 0 && footers.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Layers className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No headers or footers used on this website's pages yet.</p>
                </div>
              )}
            </div>
          )}
          
          {/* Journals Tab */}
          {activeTab === 'journals' && website.journals && (
            <div className="p-6 space-y-4">
              {website.journals.map(journal => {
                const journalPages = website.pages.filter(p => p.journalId === journal.id)
                
                return (
                  <div 
                    key={journal.id}
                    className="border border-gray-200 rounded-lg p-5 hover:border-blue-300 transition-colors"
                    style={{ borderLeft: `4px solid ${journal.branding?.primaryColor || '#0073e6'}` }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Link
                            to={`/v2/websites/${website.id}/journals/${journal.id}`}
                            className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors"
                          >
                            {journal.name}
                          </Link>
                          {journal.acronym && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded font-mono">
                              {journal.acronym}
                            </span>
                          )}
                          {journal.isOpenAccess && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                              🔓 Open Access
                            </span>
                          )}
                          {journal.isDiscontinued && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">
                              ⚠️ Discontinued
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{journal.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                          {journal.issn && (
                            <div>
                              <div className="text-gray-500">ISSN</div>
                              <div className="font-mono text-gray-900">
                                {journal.issn.print || journal.issn.online}
                              </div>
                            </div>
                          )}
                          {journal.impactFactor && (
                            <div>
                              <div className="text-gray-500">Impact Factor</div>
                              <div className="font-semibold text-gray-900">{journal.impactFactor}</div>
                            </div>
                          )}
                          <div>
                            <div className="text-gray-500">Pages</div>
                            <div className="font-semibold text-gray-900">{journalPages.length}</div>
                          </div>
                          {journal.branding?.primaryColor && (
                            <div>
                              <div className="text-gray-500">Brand Color</div>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-4 h-4 rounded border border-gray-300"
                                  style={{ backgroundColor: journal.branding.primaryColor }}
                                />
                                <span className="font-mono text-xs text-gray-900">
                                  {journal.branding.primaryColor}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {journalPages.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="text-xs text-gray-500 mb-2">Pages:</div>
                            <div className="flex flex-wrap gap-2">
                              {journalPages.map(page => (
                                <Link
                                  key={page.id}
                                  to={`/v2/live?site=${website.id}&page=${page.id}`}
                                  className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded hover:bg-blue-100 transition-colors"
                                >
                                  {page.name}
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="ml-4">
                        <Link
                          to={`/v2/websites/${website.id}/journals/${journal.id}`}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          <Settings className="w-4 h-4" />
                          Manage
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

