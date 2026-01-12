/**
 * PageStatus Component
 * Shows the current page's relationship with its archetype and allows management of overrides
 * Displayed in Properties Panel when no widget is selected
 */

import React from 'react'
import { 
  FileText, 
  GitBranch, 
  RotateCcw, 
  History, 
  AlertCircle,
  CheckCircle,
  Clock,
  Trash2,
  Undo2,
  ExternalLink
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { PageInstance, Archetype } from '../../types/archetypes'
import { 
  inheritZone, 
  undoZoneOverride, 
  resetPageToArchetype,
  canUndoZoneOverride,
  getZoneOverrideHistory
} from '../../stores/archetypeStore'

interface PageStatusProps {
  websiteId: string
  pageName: string
  pageInstance: PageInstance | null
  archetype: Archetype | null
  archetypeName?: string
  dirtyZones: Set<string> // Pending/uncommitted changes
  onPageInstanceChange?: () => void // Callback to refresh page instance
  designId?: string // Design ID for archetype link
  onResetToArchetype?: () => void // Preview reset to archetype (doesn't commit yet)
  onRevertZoneToArchetype?: (zoneSlug: string) => void // Preview zone revert (doesn't commit yet)
}

export function PageStatus({
  websiteId,
  pageName,
  pageInstance,
  archetype,
  archetypeName,
  dirtyZones,
  onPageInstanceChange,
  designId,
  onResetToArchetype,
  onRevertZoneToArchetype
}: PageStatusProps) {
  const navigate = useNavigate()
  
  // Get display name for the page
  const getPageDisplayName = () => {
    if (pageName.startsWith('journal/')) {
      const journalId = pageName.split('/')[1]
      return `${journalId.toUpperCase()} Home`
    }
    return pageName === 'home' ? 'Homepage' : pageName
  }
  
  // Handle revert zone to archetype (preview mode - updates editor but doesn't commit)
  const handleRevertZone = (zoneSlug: string) => {
    if (!pageInstance) return
    
    if (onRevertZoneToArchetype) {
      // New behavior: Preview the revert (updates canvas, marks as pending)
      if (window.confirm(`Preview "${zoneSlug}" as archetype version? You can confirm or discard via Save & Publish.`)) {
        onRevertZoneToArchetype(zoneSlug)
      }
    } else {
      // Fallback: Old behavior (direct commit)
      if (window.confirm(`Revert "${zoneSlug}" to archetype? This will remove your local changes.`)) {
        inheritZone(pageInstance, zoneSlug)
        onPageInstanceChange?.()
      }
    }
  }
  
  // Handle undo zone to previous local version
  const handleUndoZone = (zoneSlug: string) => {
    if (!pageInstance) return
    
    const result = undoZoneOverride(pageInstance, zoneSlug)
    if (result) {
      onPageInstanceChange?.()
    }
  }
  
  // Handle reset entire page to archetype (preview mode - updates editor but doesn't commit)
  const handleResetPage = () => {
    if (!pageInstance) return
    
    const overrideCount = Object.keys(pageInstance.overrides).length
    
    if (onResetToArchetype) {
      // New behavior: Preview the reset (updates canvas, marks as pending)
      if (window.confirm(`Preview page as pure archetype? All ${overrideCount} local override(s) will be shown as pending removal. Confirm via Save & Publish.`)) {
        onResetToArchetype()
      }
    } else {
      // Fallback: Old behavior (direct commit)
      if (window.confirm(`Reset entire page to archetype? This will remove all ${overrideCount} local override(s).`)) {
        resetPageToArchetype(pageInstance)
        onPageInstanceChange?.()
      }
    }
  }
  
  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  // Get committed overrides (zones with overrides but not in dirtyZones means they're committed)
  const committedOverrides = pageInstance 
    ? Object.keys(pageInstance.overrides).filter(z => !dirtyZones.has(z))
    : []
  
  // Get pending changes (in dirtyZones)
  const pendingChanges = Array.from(dirtyZones)
  
  // If no archetype, show simple status
  if (!pageInstance || !archetype) {
    return (
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-gray-400" />
          <h3 className="font-medium text-gray-900">Page Status</h3>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <p className="text-sm font-medium text-gray-700">{getPageDisplayName()}</p>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-700">
              This page does not inherit from an archetype.
            </p>
          </div>
        </div>
        
        {pendingChanges.length > 0 && (
          <div className="mt-4">
            <h4 className="text-xs font-medium text-amber-700 uppercase tracking-wide mb-2 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Pending Changes ({pendingChanges.length})
            </h4>
            <div className="space-y-2">
              {pendingChanges.map(zoneSlug => (
                <div key={zoneSlug} className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                  <p className="text-sm font-medium text-amber-800">{zoneSlug}</p>
                  <p className="text-xs text-amber-600 mt-1">Modified (not saved)</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }
  
  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-gray-400" />
        <h3 className="font-medium text-gray-900">Page Status</h3>
      </div>
      
      {/* Page Info */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <p className="text-sm font-medium text-gray-700">{getPageDisplayName()}</p>
      </div>
      
      {/* Archetype Info */}
      <div className="mb-4">
        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
          <GitBranch className="w-3 h-3" />
          Inherits From
        </h4>
        <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-indigo-700">
              {archetypeName || archetype.name}
            </p>
            <button
              onClick={() => {
                const archetypeDesignId = designId || archetype.designId || 'classic-ux3-theme'
                navigate(`/edit/archetype/${archetype.id}?designId=${archetypeDesignId}`)
              }}
              className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              Edit
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Committed Overrides */}
      {committedOverrides.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-medium text-green-700 uppercase tracking-wide mb-2 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Local Overrides ({committedOverrides.length})
          </h4>
          <div className="space-y-2">
            {committedOverrides.map(zoneSlug => {
              const historyInfo = getZoneOverrideHistory(pageInstance, zoneSlug)
              const canUndo = canUndoZoneOverride(pageInstance, zoneSlug)
              
              return (
                <div key={zoneSlug} className="bg-green-50 rounded-lg p-3 border border-green-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-800">{zoneSlug}</p>
                      {historyInfo && (
                        <p className="text-xs text-green-600 mt-1">
                          Committed {formatDate(historyInfo.committedAt)}
                        </p>
                      )}
                      {canUndo && historyInfo?.history && (
                        <p className="text-xs text-green-500 mt-0.5 flex items-center gap-1">
                          <History className="w-3 h-3" />
                          {historyInfo.history.length} previous version(s)
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {canUndo && (
                        <button
                          onClick={() => handleUndoZone(zoneSlug)}
                          className="p-1.5 text-green-600 hover:bg-green-100 rounded transition-colors"
                          title="Undo to previous local version"
                        >
                          <Undo2 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleRevertZone(zoneSlug)}
                        className="p-1.5 text-green-600 hover:bg-green-100 rounded transition-colors"
                        title="Revert to archetype"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
      
      {/* Pending Changes */}
      {pendingChanges.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-medium text-amber-700 uppercase tracking-wide mb-2 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Pending Changes ({pendingChanges.length})
          </h4>
          <div className="space-y-2">
            {pendingChanges.map(zoneSlug => (
              <div key={zoneSlug} className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-amber-800">{zoneSlug}</p>
                    <p className="text-xs text-amber-600 mt-1">Modified (not saved)</p>
                  </div>
                  {/* Note: Discard pending changes would need to reload from last saved state */}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* No Changes State */}
      {committedOverrides.length === 0 && pendingChanges.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <CheckCircle className="w-6 h-6 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">
            No local changes. Page matches archetype.
          </p>
        </div>
      )}
      
      {/* Reset All Button */}
      {committedOverrides.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <button
            onClick={handleResetPage}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Reset All to Archetype
          </button>
          <p className="text-xs text-gray-500 text-center mt-2">
            Removes all {committedOverrides.length} local override(s)
          </p>
        </div>
      )}
    </div>
  )
}

export default PageStatus
