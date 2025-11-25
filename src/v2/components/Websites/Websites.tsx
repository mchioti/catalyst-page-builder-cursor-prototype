/**
 * V2 Websites - Main entry point (replaces Dashboard)
 * Similar to V1's Site Manager Websites view
 */

import { Link } from 'react-router-dom'
import { useWebsiteStore } from '../../stores/websiteStore'
import { useSharedSectionsStore } from '../../stores/sharedSectionsStore'
import { Globe, Plus, ExternalLink, Edit, Calendar } from 'lucide-react'

export function Websites() {
  const websites = useWebsiteStore(state => state.websites)
  const sharedSections = useSharedSectionsStore(state => state.sections)
  
  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      staging: 'bg-blue-100 text-blue-800',
      maintenance: 'bg-red-100 text-red-800'
    }
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }
  
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Websites</h1>
            <p className="text-gray-600 mt-2">
              Manage your publishing websites and pages
            </p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Website
          </button>
        </div>
        
        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Total Websites</div>
            <div className="text-3xl font-bold text-gray-900">{websites.length}</div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Total Pages</div>
            <div className="text-3xl font-bold text-gray-900">
              {websites.reduce((acc, w) => acc + w.pages.length, 0)}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Shared Sections</div>
            <div className="text-3xl font-bold text-gray-900">{sharedSections.length}</div>
          </div>
        </div>
        
        {/* Website Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {websites.map(website => {
            const hasJournals = website.journals && website.journals.length > 0
            
            return (
              <div
                key={website.id}
                className="bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-lg transition-all"
              >
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Globe className="w-5 h-5 text-blue-600" />
                        <h3 className="text-xl font-bold text-gray-900">{website.name}</h3>
                        {getStatusBadge(website.status)}
                        {hasJournals && (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                            {website.journals!.length} Journal{website.journals!.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    <a 
                      href={`https://${website.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                    >
                      {website.domain}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
                
                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div>
                    <strong className="text-gray-900">{website.pages.length}</strong> pages
                  </div>
                  <div>•</div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Updated {website.updatedAt.toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="p-4 bg-gray-50">
                <div className="grid grid-cols-3 gap-4 text-center">
                  {hasJournals ? (
                    <>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">{website.journals!.length}</div>
                        <div className="text-xs text-gray-600">Journals</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">{website.pages.length}</div>
                        <div className="text-xs text-gray-600">Pages</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {website.pages.filter(p => p.status === 'published').length}
                        </div>
                        <div className="text-xs text-gray-600">Published</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">{website.pages.length}</div>
                        <div className="text-xs text-gray-600">Pages</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {website.pages.filter(p => p.status === 'published').length}
                        </div>
                        <div className="text-xs text-gray-600">Published</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {website.pages.filter(p => p.status === 'draft').length}
                        </div>
                        <div className="text-xs text-gray-600">Drafts</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {/* Actions */}
              <div className="p-4 border-t border-gray-200 flex items-center gap-2">
                <Link
                  to={`/v2/websites/${website.id}`}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-center"
                >
                  Manage Website
                </Link>
                <Link
                  to={`/v2/live?site=${website.id}`}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
                >
                  View Live
                </Link>
              </div>
            </div>
            )
          })}
        </div>
        
        {websites.length === 0 && (
          <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
            <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No websites yet</h3>
            <p className="text-gray-600 mb-4">Create your first publishing website to get started</p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Website
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

