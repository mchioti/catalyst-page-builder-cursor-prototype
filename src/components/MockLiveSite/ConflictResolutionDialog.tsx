import React from 'react'
import { AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react'

export interface ConflictResolutionDialogProps {
  isOpen: boolean
  affectedJournals: Array<{
    journalCode: string
    journalName: string
    route: string
  }>
  scope: 'global' | 'issue-type'
  onResolve: (action: 'override' | 'skip' | 'cancel') => void
}

export function ConflictResolutionDialog({ 
  isOpen, 
  affectedJournals, 
  scope,
  onResolve 
}: ConflictResolutionDialogProps) {
  
  if (!isOpen) return null

  const scopeLabel = scope === 'global' ? 'Global Template' : 'Issue Type Template'
  const impactMessage = scope === 'global' 
    ? 'all journals and all issues'
    : 'all journals for this issue type'
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center gap-3 p-6 border-b border-gray-200">
          <AlertTriangle className="w-6 h-6 text-amber-500" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Template Conflict Resolution
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {scopeLabel} changes will affect {impactMessage}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Impact Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900 mb-2">
                  What's happening?
                </h3>
                <p className="text-sm text-blue-800">
                  You're editing a {scopeLabel.toLowerCase()} that normally applies to {impactMessage}. 
                  However, some journals have individual customizations that would be overridden.
                </p>
              </div>
            </div>
          </div>

          {/* Affected Journals */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">
              Journals with existing customizations:
            </h3>
            <div className="space-y-2">
              {affectedJournals.map((journal) => (
                <div key={journal.journalCode} className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <div>
                    <span className="font-medium text-amber-900">{journal.journalName}</span>
                    <p className="text-xs text-amber-700 mt-1">
                      Has individual customizations that would be lost
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Options */}
          <div>
            <h3 className="font-medium text-gray-900 mb-4">
              How would you like to proceed?
            </h3>
            
            <div className="space-y-4">
              {/* Option 1: Apply Everywhere */}
              <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <button
                      onClick={() => onResolve('override')}
                      className="text-left w-full"
                    >
                      <h4 className="font-medium text-gray-900 mb-1">
                        Apply Everywhere (Override Customizations)
                      </h4>
                      <p className="text-sm text-gray-600">
                        Clear all individual customizations and apply template changes to all journals. 
                        <strong className="text-red-600"> This will permanently delete existing customizations.</strong>
                      </p>
                    </button>
                  </div>
                </div>
              </div>

              {/* Option 2: Skip Changed Journals */}
              <div className="border border-green-200 bg-green-50 rounded-lg p-4 hover:bg-green-100 transition-colors">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <button
                      onClick={() => onResolve('skip')}
                      className="text-left w-full"
                    >
                      <h4 className="font-medium text-green-900 mb-1">
                        Skip Changed Journals (Recommended)
                      </h4>
                      <p className="text-sm text-green-700">
                        Apply template changes to all other journals, but preserve existing customizations for {affectedJournals.map(j => j.journalName).join(', ')}. 
                        <strong> You can override them individually later if needed.</strong>
                      </p>
                    </button>
                  </div>
                </div>
              </div>

              {/* Option 3: Cancel */}
              <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div className="flex-1">
                    <button
                      onClick={() => onResolve('cancel')}
                      className="text-left w-full"
                    >
                      <h4 className="font-medium text-gray-900 mb-1">
                        Cancel Template Changes
                      </h4>
                      <p className="text-sm text-gray-600">
                        Don't make any template changes. Return to individual journal editing.
                      </p>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="w-4 h-4 text-gray-600 mt-0.5" />
              <div className="text-xs text-gray-600">
                <p className="mb-2">
                  <strong>Template Hierarchy:</strong> Global Template → Journal Template → Individual Issue
                </p>
                <p>
                  Changes at higher levels propagate down unless overridden at lower levels. 
                  Individual customizations take precedence over templates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
