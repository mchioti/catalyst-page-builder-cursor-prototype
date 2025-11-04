import React, { useState, useMemo } from 'react'
import { X, FileText, Eye, Plus, Minus, Edit3, ArrowRightLeft } from 'lucide-react'
import { detectTemplateChanges, type TemplateChange } from '../../utils/templateDiff'
import type { CanvasItem } from '../../types'
import { isSection } from '../../types/widgets'

interface TemplateDiffModalProps {
  isOpen: boolean
  onClose: () => void
  templateName: string
  journalName: string
  baseTemplate: CanvasItem[]
  modifiedTemplate: CanvasItem[]
}

export function TemplateDiffModal({
  isOpen,
  onClose,
  templateName,
  journalName,
  baseTemplate,
  modifiedTemplate
}: TemplateDiffModalProps) {
  const [activeTab, setActiveTab] = useState<'changes' | 'visual'>('changes')

  // Calculate detailed changes using diff engine
  const changesList = useMemo(() => {
    return detectTemplateChanges(baseTemplate, modifiedTemplate)
  }, [baseTemplate, modifiedTemplate])

  // Calculate counts from the changes array
  const changeCounts = useMemo(() => {
    const counts = {
      sectionsAdded: 0,
      widgetsAdded: 0,
      sectionsRemoved: 0,
      widgetsRemoved: 0,
      sectionsModified: 0,
      widgetsModified: 0,
      widgetsMoved: 0
    }

    changesList.forEach(change => {
      if (change.type === 'added') {
        if (change.element === 'section') counts.sectionsAdded++
        else counts.widgetsAdded++
      } else if (change.type === 'removed') {
        if (change.element === 'section') counts.sectionsRemoved++
        else counts.widgetsRemoved++
      } else if (change.type === 'modified') {
        if (change.element === 'section') counts.sectionsModified++
        else counts.widgetsModified++
      } else if (change.type === 'moved') {
        counts.widgetsMoved++
      }
    })

    return counts
  }, [changesList])

  if (!isOpen) return null

  const totalChanges = 
    changeCounts.sectionsAdded + 
    changeCounts.widgetsAdded + 
    changeCounts.sectionsRemoved + 
    changeCounts.widgetsRemoved + 
    changeCounts.sectionsModified + 
    changeCounts.widgetsModified +
    changeCounts.widgetsMoved

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{templateName}</h2>
            <p className="text-sm text-gray-600 mt-1">
              Comparing: <span className="font-medium">{journalName}</span> vs Base Template
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 border-b border-gray-200">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('changes')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'changes'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Changes ({totalChanges})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('visual')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'visual'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Visual Preview
              </div>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'changes' ? (
            <TextualDiffView changesList={changesList} changeCounts={changeCounts} />
          ) : (
            <VisualPreviewTab />
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// Textual Diff View Component
function TextualDiffView({ 
  changesList, 
  changeCounts 
}: { 
  changesList: TemplateChange[]
  changeCounts: {
    sectionsAdded: number
    widgetsAdded: number
    sectionsRemoved: number
    widgetsRemoved: number
    sectionsModified: number
    widgetsModified: number
    widgetsMoved: number
  }
}) {
  const totalChanges = 
    changeCounts.sectionsAdded + 
    changeCounts.widgetsAdded + 
    changeCounts.sectionsRemoved + 
    changeCounts.widgetsRemoved + 
    changeCounts.sectionsModified + 
    changeCounts.widgetsModified +
    changeCounts.widgetsMoved

  if (totalChanges === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-2">
          <FileText className="h-12 w-12 mx-auto" />
        </div>
        <p className="text-gray-600">No changes detected</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Section */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span>📊</span> SUMMARY
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            {(changeCounts.sectionsAdded > 0 || changeCounts.widgetsAdded > 0) && (
              <div className="flex items-center gap-2 text-sm">
                <Plus className="h-4 w-4 text-green-600" />
                <span className="text-gray-700">
                  <span className="font-semibold text-green-700">{changeCounts.sectionsAdded + changeCounts.widgetsAdded}</span> items added
                </span>
              </div>
            )}
            {(changeCounts.sectionsModified > 0 || changeCounts.widgetsModified > 0) && (
              <div className="flex items-center gap-2 text-sm">
                <Edit3 className="h-4 w-4 text-blue-600" />
                <span className="text-gray-700">
                  <span className="font-semibold text-blue-700">{changeCounts.sectionsModified + changeCounts.widgetsModified}</span> items modified
                </span>
              </div>
            )}
            {changeCounts.widgetsMoved > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <ArrowRightLeft className="h-4 w-4 text-purple-600" />
                <span className="text-gray-700">
                  <span className="font-semibold text-purple-700">{changeCounts.widgetsMoved}</span> widgets moved
                </span>
              </div>
            )}
          </div>
          <div className="space-y-2">
            {(changeCounts.sectionsRemoved > 0 || changeCounts.widgetsRemoved > 0) && (
              <div className="flex items-center gap-2 text-sm">
                <Minus className="h-4 w-4 text-red-600" />
                <span className="text-gray-700">
                  <span className="font-semibold text-red-700">{changeCounts.sectionsRemoved + changeCounts.widgetsRemoved}</span> items removed
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-700">
                <span className="font-semibold text-gray-900">📍 {changesList.length}</span> total changes
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Changes Section */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span>📝</span> DETAILED CHANGES
        </h3>
        <div className="space-y-3">
          {changesList.length > 0 ? (
            changesList.map((change, index) => (
              <ChangeDetailItem key={index} change={change} />
            ))
          ) : (
            <div className="text-sm text-gray-500 italic">
              No changes detected
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Change Detail Item Component
function ChangeDetailItem({ change }: { change: TemplateChange }) {
  const getChangeIcon = () => {
    if (change.type === 'added') return <Plus className="h-4 w-4 text-green-600" />
    if (change.type === 'removed') return <Minus className="h-4 w-4 text-red-600" />
    if (change.type === 'moved') return <ArrowRightLeft className="h-4 w-4 text-purple-600" />
    return <Edit3 className="h-4 w-4 text-blue-600" />
  }

  const getChangeBadge = () => {
    if (change.type === 'added') return 'bg-green-50 text-green-700 border-green-200'
    if (change.type === 'removed') return 'bg-red-50 text-red-700 border-red-200'
    if (change.type === 'moved') return 'bg-purple-50 text-purple-700 border-purple-200'
    return 'bg-blue-50 text-blue-700 border-blue-200'
  }

  const getChangeLabel = () => {
    if (change.type === 'added') return 'ADDED'
    if (change.type === 'removed') return 'REMOVED'
    if (change.type === 'moved') return 'MOVED'
    return 'MODIFIED'
  }

  return (
    <div className={`rounded-lg border p-4 ${getChangeBadge()}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{getChangeIcon()}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium text-sm">
              {change.element === 'section' ? '🔷' : '🔸'} {change.elementName}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${getChangeBadge()}`}>
              {getChangeLabel()}
            </span>
          </div>
          
          {change.type === 'moved' && change.fromLocation && change.toLocation && (
            <div className="space-y-1.5 ml-1 border-l-2 border-current border-opacity-20 pl-3">
              <div className="text-sm">
                <span className="font-medium">Location</span>
                <div className="text-xs mt-0.5 font-mono">
                  <span className="opacity-70">{change.fromLocation}</span>
                  <span className="mx-1">→</span>
                  <span className="font-semibold">{change.toLocation}</span>
                </div>
              </div>
            </div>
          )}
          
          {change.property && change.type !== 'moved' && (
            <div className="space-y-1.5 ml-1 border-l-2 border-current border-opacity-20 pl-3">
              <div className="text-sm">
                <span className="font-medium">{change.property}</span>
                {change.oldValue !== undefined && change.newValue !== undefined ? (
                  <div className="text-xs mt-0.5 font-mono">
                    <span className="opacity-70">{formatValue(change.oldValue)}</span>
                    <span className="mx-1">→</span>
                    <span className="font-semibold">{formatValue(change.newValue)}</span>
                  </div>
                ) : (
                  <span className="text-xs ml-1">changed</span>
                )}
              </div>
            </div>
          )}

          {change.description && change.type !== 'moved' && (
            <p className="text-xs mt-2 opacity-75">{change.description}</p>
          )}
        </div>
      </div>
    </div>
  )
}

// Visual Preview Tab (Placeholder)
function VisualPreviewTab() {
  return (
    <div className="text-center py-12">
      <div className="text-gray-400 mb-4">
        <Eye className="h-16 w-16 mx-auto" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Visual Preview</h3>
      <p className="text-gray-600 mb-4">
        Side-by-side visual comparison coming soon
      </p>
      <div className="max-w-md mx-auto text-left bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900 mb-2 font-medium">🎨 Future Enhancement:</p>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Live rendering of both versions</li>
          <li>Highlighted changed sections</li>
          <li>Scroll-synchronized comparison</li>
          <li>Zoom and focus controls</li>
        </ul>
      </div>
    </div>
  )
}

// Helper function to format property values
function formatValue(value: any): string {
  if (value === null || value === undefined) return 'none'
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

