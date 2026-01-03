/**
 * PublishReviewModal - Modal for reviewing dirty zones before publishing
 * 
 * Shows modified sections (dirty zones) and allows user to choose:
 * - "Keep Local": Create an override in the page instance (only affects this page)
 * - "Save to Archetype": Update the archetype (affects all pages using this archetype)
 */

import React, { useState, useMemo } from 'react'
import { X, Save, Layers, AlertTriangle } from 'lucide-react'
import type { WidgetSection } from '../../types/widgets'
import { createDebugLogger } from '../../utils/logger'
import { countPageInstancesByArchetype } from '../../stores/archetypeStore'

const DEBUG = false // Set to true to see modal debug logs
const debugLog = createDebugLogger(DEBUG)

interface PublishReviewModalProps {
  isOpen: boolean
  onClose: () => void
  dirtyZones: Set<string>
  zoneSections: Map<string, WidgetSection> // Map of zoneSlug -> section
  onPublish: (choices: Map<string, 'local' | 'archetype'>, stayInEditor: boolean) => void
  archetypeName?: string
  archetypeId?: string // Used to count affected pages
  journalName?: string
}

export function PublishReviewModal({
  isOpen,
  onClose,
  dirtyZones,
  zoneSections,
  onPublish,
  archetypeName,
  archetypeId,
  journalName
}: PublishReviewModalProps) {
  // Log every render
  debugLog('log', '📋 [PublishReviewModal] Component rendered:', {
    isOpen,
    dirtyZonesSize: dirtyZones.size,
    zoneSectionsCount: zoneSections.size
  })
  
  const [choices, setChoices] = useState<Map<string, 'local' | 'archetype'>>(new Map())
  
  // Count how many pages use this archetype (for warning message)
  const affectedPagesCount = useMemo(() => {
    if (!archetypeId) return 0
    return countPageInstancesByArchetype(archetypeId)
  }, [archetypeId])
  
  // Debug: Log modal props
  React.useEffect(() => {
    debugLog('log', '📋 [PublishReviewModal] Props changed:', {
      isOpen,
      dirtyZonesSize: dirtyZones.size,
      dirtyZones: Array.from(dirtyZones),
      zoneSectionsCount: zoneSections.size,
      archetypeName,
      journalName
    })
  }, [isOpen, dirtyZones, zoneSections.size, archetypeName, journalName])
  
  // Initialize all dirty zones to 'local' by default
  React.useEffect(() => {
    if (isOpen) {
      debugLog('log', '📋 [PublishReviewModal] Initializing choices for dirty zones')
      const initialChoices = new Map<string, 'local' | 'archetype'>()
      dirtyZones.forEach(zoneSlug => {
        initialChoices.set(zoneSlug, 'local')
      })
      setChoices(initialChoices)
      debugLog('log', '📋 [PublishReviewModal] Choices initialized:', Array.from(initialChoices.entries()))
    }
  }, [isOpen, dirtyZones])
  
  if (!isOpen) {
    debugLog('log', '📋 [PublishReviewModal] Not rendering (isOpen=false)')
    return null
  }
  
  debugLog('log', '📋 [PublishReviewModal] Rendering modal')
  
  const handleChoiceChange = (zoneSlug: string, choice: 'local' | 'archetype') => {
    setChoices(prev => {
      const next = new Map(prev)
      next.set(zoneSlug, choice)
      return next
    })
  }
  
  const handlePublish = () => {
    debugLog('log', '📋 [PublishReviewModal] handlePublish called:', {
      choices: Array.from(choices.entries())
    })
    onPublish(choices, false) // Always navigate to live site
    onClose()
  }
  
  const handleBulkSelect = (choice: 'local' | 'archetype') => {
    const newChoices = new Map<string, 'local' | 'archetype'>()
    dirtyZones.forEach(zoneSlug => {
      newChoices.set(zoneSlug, choice)
    })
    setChoices(newChoices)
  }
  
  const localCount = Array.from(choices.values()).filter(c => c === 'local').length
  const archetypeCount = Array.from(choices.values()).filter(c => c === 'archetype').length
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Review Changes Before Publishing</h2>
            <p className="text-sm text-gray-500 mt-1">
              {dirtyZones.size} modified section{dirtyZones.size !== 1 ? 's' : ''} found
              {archetypeName && ` in ${archetypeName}`}
              {journalName && ` (${journalName})`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Bulk Actions */}
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Apply to all:</span>
            <button
              onClick={() => handleBulkSelect('local')}
              className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Keep Local (All)
            </button>
            <button
              onClick={() => handleBulkSelect('archetype')}
              className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Save to Archetype (All)
            </button>
          </div>
        </div>
        
        {/* Zone List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {Array.from(dirtyZones).map(zoneSlug => {
              const section = zoneSections.get(zoneSlug)
              const choice = choices.get(zoneSlug) || 'local'
              
              return (
                <div
                  key={zoneSlug}
                  className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {section?.name || zoneSlug}
                      </h3>
                      {section?.zoneSlug && (
                        <p className="text-xs text-gray-500 mt-1">Zone: {section.zoneSlug}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 ml-4">
                      {/* Keep Local Option */}
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={`choice-${zoneSlug}`}
                          value="local"
                          checked={choice === 'local'}
                          onChange={() => handleChoiceChange(zoneSlug, 'local')}
                          className="w-4 h-4 text-green-600 focus:ring-green-500"
                        />
                        <div className="flex items-center gap-1.5">
                          <Layers className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-gray-700">Keep Local</span>
                        </div>
                      </label>
                      
                      {/* Save to Archetype Option */}
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={`choice-${zoneSlug}`}
                          value="archetype"
                          checked={choice === 'archetype'}
                          onChange={() => handleChoiceChange(zoneSlug, 'archetype')}
                          className="w-4 h-4 text-green-600 focus:ring-green-500"
                        />
                        <div className="flex items-center gap-1.5">
                          <Save className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-gray-700">Save to Archetype</span>
                        </div>
                      </label>
                    </div>
                  </div>
                  
                  {/* Choice Description */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    {choice === 'local' ? (
                      <p className="text-xs text-gray-500">
                        This change will only affect <strong>this page</strong>. Other pages using this archetype will not be affected.
                      </p>
                    ) : (
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-700">
                          This change will update the <strong>archetype template</strong>.
                          {affectedPagesCount > 0 ? (
                            <> <strong>{affectedPagesCount}</strong> other page{affectedPagesCount !== 1 ? 's' : ''} using this archetype will also inherit this change.</>
                          ) : (
                            <> All pages using this archetype will inherit this change.</>
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="text-sm">
            <div className="text-gray-600">
              <span className="font-medium">{localCount}</span> will be kept local,{' '}
              <span className="font-medium">{archetypeCount}</span> will be saved to archetype
            </div>
            {archetypeCount > 0 && affectedPagesCount > 0 && (
              <div className="flex items-center gap-1 text-amber-600 mt-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span className="text-xs">
                  {affectedPagesCount} other page{affectedPagesCount !== 1 ? 's' : ''} will be affected
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePublish}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Publish & View Live
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

