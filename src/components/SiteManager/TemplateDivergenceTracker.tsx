/**
 * Template Divergence Tracker
 * 
 * Shows which journals/pages have customized a template
 * Provides actions: View Diff, Reset, Promote, Exempt
 */

import { Eye, RotateCcw, ArrowUp, Lock, Unlock, ChevronDown, ChevronUp } from 'lucide-react'

export interface TemplateDivergenceTrackerProps {
  templateId: string
  templateName: string
  usePageStore: any // Zustand store hook
  isExpanded?: boolean
  onToggleExpand?: () => void
  expandedOnly?: boolean // If true, only render expanded content (for expansion row)
}

export function TemplateDivergenceTracker({ 
  templateId, 
  templateName,
  usePageStore,
  isExpanded = false,
  onToggleExpand,
  expandedOnly = false
}: TemplateDivergenceTrackerProps) {
  
  // Get customizations from store
  const templateCustomizations = usePageStore((state: any) => state.templateCustomizations || [])
  const getCustomizationsForTemplate = usePageStore((state: any) => state.getCustomizationsForTemplate)
  
  // Get customizations for this specific template
  const customizations = getCustomizationsForTemplate?.(templateId) || []
  
  // Debug logging
  console.log('🎯 TemplateDivergenceTracker render:', {
    templateId,
    templateName,
    allCustomizations: templateCustomizations.length,
    thisTemplateCustomizations: customizations.length,
    customizations
  })
  
  // Calculate stats
  const customizedCount = customizations.filter((c: any) => !c.isExempt).length
  const exemptedCount = customizations.filter((c: any) => c.isExempt).length
  const usingBaseCount = 0 // TODO: Calculate from actual journal count - customized count
  
  // If expandedOnly mode, only show the expanded list
  if (expandedOnly) {
    return (
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-900 mb-3">
          Journals with customizations for {templateName}:
        </div>
        {customizations.map((customization: any) => (
          <CustomizationItem
            key={customization.route}
            customization={customization}
            templateId={templateId}
            templateName={templateName}
            usePageStore={usePageStore}
          />
        ))}
      </div>
    )
  }
  
  // If no customizations, show simple badge
  if (customizations.length === 0) {
    return (
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
          ✓ All using base
        </span>
      </div>
    )
  }
  
  // Badge-only mode (for main row)
  return (
    <div className="flex items-center gap-2 flex-wrap" data-testid="divergence-tracker">
      {usingBaseCount > 0 && (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
          {usingBaseCount} using base
        </span>
      )}
      
      {customizedCount > 0 && (
        <button
          onClick={onToggleExpand}
          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors"
          data-testid={`customized-badge-${customizedCount}`}
        >
          {customizedCount} customized
          {isExpanded ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />}
        </button>
      )}
      
      {exemptedCount > 0 && (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
          {exemptedCount} exempted
        </span>
      )}
    </div>
  )
}

interface CustomizationItemProps {
  customization: any
  templateId: string
  templateName: string
  usePageStore: any
}

function CustomizationItem({ 
  customization, 
  templateId,
  templateName,
  usePageStore 
}: CustomizationItemProps) {
  const resetToBase = usePageStore((state: any) => state.resetToBase)
  const promoteToBase = usePageStore((state: any) => state.promoteToBase)
  const exemptFromUpdates = usePageStore((state: any) => state.exemptFromUpdates)
  const removeExemption = usePageStore((state: any) => state.removeExemption)
  const addNotification = usePageStore((state: any) => state.addNotification)
  
  const handleViewDiff = () => {
    console.log('View diff for:', customization.route)
    // TODO: Open diff modal
    addNotification?.({
      type: 'info',
      title: 'View Diff',
      message: `Opening visual diff for ${customization.journalName}...`
    })
  }
  
  const handleReset = () => {
    if (confirm(`Reset ${customization.journalName} to base template?\n\nAll ${customization.modificationCount} customizations will be lost.`)) {
      resetToBase?.(customization.route)
      addNotification?.({
        type: 'success',
        title: 'Reset Complete',
        message: `${customization.journalName} reset to base template`
      })
    }
  }
  
  const handlePromote = () => {
    if (confirm(`Promote ${customization.journalName}'s customizations to base template?\n\nAll other journals will inherit these changes (except exempted ones).`)) {
      promoteToBase?.(customization.route, templateId)
      addNotification?.({
        type: 'success',
        title: 'Promoted to Base',
        message: `${customization.journalName}'s customizations are now the base template`
      })
    }
  }
  
  const handleToggleExempt = () => {
    if (customization.isExempt) {
      if (confirm(`Remove exemption for ${customization.journalName}?\n\nThis journal will inherit future base template updates.`)) {
        removeExemption?.(customization.route)
        addNotification?.({
          type: 'info',
          title: 'Exemption Removed',
          message: `${customization.journalName} will now inherit template updates`
        })
      }
    } else {
      if (confirm(`Exempt ${customization.journalName} from base template updates?\n\nThis journal will keep its customizations even when the base template is updated.`)) {
        exemptFromUpdates?.(customization.route)
        addNotification?.({
          type: 'info',
          title: 'Journal Exempted',
          message: `${customization.journalName} will not inherit future template updates`
        })
      }
    }
  }
  
  return (
    <div 
      className="flex items-center justify-between bg-white rounded p-2 border border-gray-200"
      data-testid={`customization-${customization.journalCode}`}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900">
            {customization.journalName || customization.journalCode}
          </span>
          {customization.isExempt && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
              Exempted
            </span>
          )}
        </div>
        <div className="text-xs text-gray-600 mt-0.5">
          {customization.modificationCount} modification{customization.modificationCount !== 1 ? 's' : ''}
        </div>
      </div>
      
      <div className="flex items-center gap-1">
        <button
          onClick={handleViewDiff}
          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
          title="View diff"
          data-testid={`view-diff-${customization.journalCode}`}
        >
          <Eye className="h-4 w-4" />
        </button>
        
        <button
          onClick={handleReset}
          className="p-1.5 text-orange-600 hover:bg-orange-50 rounded transition-colors"
          title="Reset to base template"
          data-testid={`reset-${customization.journalCode}`}
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        
        <button
          onClick={handlePromote}
          className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
          title="Promote to base template"
          data-testid={`promote-${customization.journalCode}`}
        >
          <ArrowUp className="h-4 w-4" />
        </button>
        
        <button
          onClick={handleToggleExempt}
          className={`p-1.5 rounded transition-colors ${
            customization.isExempt 
              ? 'text-purple-600 hover:bg-purple-50' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
          title={customization.isExempt ? "Remove exemption" : "Exempt from updates"}
          data-testid={`exempt-${customization.journalCode}`}
        >
          {customization.isExempt ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}

