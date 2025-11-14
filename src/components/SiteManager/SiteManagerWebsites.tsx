import { useState } from 'react'
import { X } from 'lucide-react'
import type { Website, Theme, Modification } from '../../types'
import { usePageStore } from '../../App'

export function SiteManagerWebsites() {
  const { websites, themes, removeModification, updateWebsite } = usePageStore()
  const [showModificationAnalysis, setShowModificationAnalysis] = useState<string | null>(null)
  
  const getThemeForWebsite = (websiteId: string) => {
    const website = websites.find(w => w.id === websiteId)
    if (!website) return null
    return themes.find(t => t.id === website.themeId)
  }
  
  const getDeviationColor = (score: number) => {
    if (score <= 20) return 'text-green-600 bg-green-50 border-green-200'
    if (score <= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }
  
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
  
  const getModificationImpact = (modification: Modification, theme: Theme | null) => {
    if (!theme) return 'unknown'
    
    // Check against theme's templates to find relevant modifications
    for (const template of theme.templates) {
      if (template.lockedElements.some(locked => modification.path.startsWith(locked))) {
        return 'high' // Locked element modification = high risk
      } else if (template.allowedModifications.some(allowed => modification.path.startsWith(allowed))) {
        return 'low' // Allowed modification = low risk
      }
    }
    return 'medium' // Other modification = medium risk
  }

  const getPublishingAction = (website: Website) => {
    switch(website.status) {
      case 'staging': 
        return { 
          label: 'Publish Live', 
          action: 'publish', 
          color: 'bg-green-600 hover:bg-green-700 text-white',
          description: 'Make changes visible to all users'
        }
      case 'active':
        return {
          label: 'Edit & Update',
          action: 'edit',
          color: 'bg-blue-600 hover:bg-blue-700 text-white',
          description: 'Modify settings and republish'
        }
      case 'maintenance':
        return {
          label: 'Restore Service',
          action: 'restore',
          color: 'bg-amber-600 hover:bg-amber-700 text-white',
          description: 'Bring site back online'
        }
      default:
        return {
          label: 'Manage',
          action: 'manage',
          color: 'bg-gray-600 hover:bg-gray-700 text-white',
          description: 'Configure website settings'
        }
    }
  }

  const handlePublishingAction = (website: Website, action: string) => {
    const actionMessage = `${action.charAt(0).toUpperCase() + action.slice(1)} action triggered for ${website.name}`
    alert(actionMessage)
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Websites</h2>
        <p className="text-gray-600 mt-1">Manage websites and track template customizations</p>
      </div>
      
      {/* Websites Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">All Websites</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Website</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Theme</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Deviation Score</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Modifications</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Last Sync</th>
                <th className="text-right py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {websites.map((website) => {
                const theme = getThemeForWebsite(website.id)
                const publishingAction = getPublishingAction(website)
                
                return (
                  <tr key={website.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-semibold text-gray-900">{website.name}</div>
                        <div className="text-sm text-gray-600">{website.domain}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-900">{theme?.name || 'Unknown'}</div>
                      <div className="text-xs text-gray-500">v{theme?.version || '---'}</div>
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(website.status)}
                    </td>
                    <td className="py-4 px-6">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium border ${getDeviationColor(website.deviationScore)}`}>
                        <span>{website.deviationScore}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => setShowModificationAnalysis(website.id)}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {website.modifications.length} modifications
                      </button>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-900">
                        {website.lastThemeSync ? new Date(website.lastThemeSync).toLocaleDateString() : 'Never'}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handlePublishingAction(website, publishingAction.action)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${publishingAction.color}`}
                        title={publishingAction.description}
                      >
                        {publishingAction.label}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modification Analysis Dialog */}
      {showModificationAnalysis && (() => {
        const website = websites.find(w => w.id === showModificationAnalysis)
        if (!website) return null
        
        const theme = getThemeForWebsite(website.id)
        
        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{website.name} - Modifications</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {website.modifications.length} total modifications • Deviation Score: {website.deviationScore}%
                  </p>
                </div>
                <button
                  onClick={() => setShowModificationAnalysis(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                  {website.modifications.map((modification, index) => {
                    const impact = getModificationImpact(modification, theme)
                    const impactColors = {
                      high: 'border-red-300 bg-red-50',
                      medium: 'border-yellow-300 bg-yellow-50',
                      low: 'border-green-300 bg-green-50',
                      unknown: 'border-gray-300 bg-gray-50'
                    }
                    
                    return (
                      <div key={index} className={`border-2 rounded-lg p-4 ${impactColors[impact as keyof typeof impactColors]}`}>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="font-semibold text-gray-900">{modification.path}</div>
                            <div className="text-sm text-gray-600 mt-1">
                              Modified by {modification.modifiedBy} • {new Date(modification.timestamp).toLocaleDateString()}
                            </div>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded ${
                            impact === 'high' ? 'bg-red-200 text-red-900' :
                            impact === 'medium' ? 'bg-yellow-200 text-yellow-900' :
                            impact === 'low' ? 'bg-green-200 text-green-900' :
                            'bg-gray-200 text-gray-900'
                          }`}>
                            {impact.toUpperCase()} IMPACT
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mt-3">
                          <div>
                            <div className="text-xs font-medium text-gray-500 uppercase mb-1">Original</div>
                            <div className="text-sm text-gray-700 bg-white p-2 rounded border border-gray-200 font-mono">
                              {modification.originalValue}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs font-medium text-gray-500 uppercase mb-1">Modified</div>
                            <div className="text-sm text-gray-900 bg-white p-2 rounded border border-gray-300 font-mono font-semibold">
                              {modification.modifiedValue}
                            </div>
                          </div>
                        </div>
                        
                        {modification.reason && (
                          <div className="mt-3 text-sm text-gray-700 italic">
                            Reason: {modification.reason}
                          </div>
                        )}
                        
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => {
                              if (window.confirm('Revert this modification? This will restore the theme default.')) {
                                removeModification(website.id, modification.path)
                                alert('Modification reverted')
                              }
                            }}
                            className="px-3 py-1 text-xs bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                          >
                            Revert to Theme Default
                          </button>
                          <button
                            onClick={() => alert('Promote to Publisher Theme (Not yet implemented)')}
                            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Promote to Publisher Theme
                          </button>
                        </div>
                      </div>
                    )
                  })}
                  
                  {website.modifications.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <p className="text-lg">No modifications found</p>
                      <p className="text-sm mt-2">This website is using the theme defaults</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Last synced with theme: {website.lastThemeSync ? new Date(website.lastThemeSync).toLocaleDateString() : 'Never'}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowModificationAnalysis(null)}
                      className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => alert('Sync with theme (Not yet implemented)')}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Sync with Theme
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

