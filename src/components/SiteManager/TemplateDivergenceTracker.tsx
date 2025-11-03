/**
 * Template Divergence Tracker
 * 
 * Shows which journals/pages have modified a template
 * Provides actions: View Diff, Reset, Promote, Exempt
 */

import { Eye, RotateCcw, ArrowUp, Lock, Unlock, ChevronDown, ChevronUp } from 'lucide-react'

export interface TemplateDivergenceTrackerProps {
  templateId: string
  templateName: string
  templateCategory?: string // Template category for filtering promote button
  usePageStore: any // Zustand store hook
  isExpanded?: boolean
  onToggleExpand?: () => void
  expandedOnly?: boolean // If true, only render expanded content (for expansion row)
  consoleMode?: 'single' | 'multi' // For showing/hiding promote to publisher theme button
  websiteId?: string // Current website ID for promotion context
  onPromoteToPublisherTheme?: (templateId: string) => void // Handler for promoting to publisher theme
}

export function TemplateDivergenceTracker({ 
  templateId, 
  templateName,
  templateCategory,
  usePageStore,
  isExpanded = false,
  onToggleExpand,
  expandedOnly = false,
  consoleMode = 'multi',
  websiteId,
  onPromoteToPublisherTheme
}: TemplateDivergenceTrackerProps) {
  
  // Get customizations from store
  const templateCustomizations = usePageStore((state: any) => state.templateCustomizations || [])
  const getCustomizationsForTemplate = usePageStore((state: any) => state.getCustomizationsForTemplate)
  const globalTemplateCanvas = usePageStore((state: any) => state.globalTemplateCanvas)
  
  // Get customizations for this specific template
  const customizations = getCustomizationsForTemplate?.(templateId) || []
  
  // "Promote to Publisher Theme" should ONLY show if there's a base template (globalTemplateCanvas)
  // NOT for individual journal customizations - those need to be promoted to base first!
  // This enforces the step-by-step governance: Issue → Journal → Base → Publisher Theme
  const hasBaseTemplate = globalTemplateCanvas && globalTemplateCanvas.length > 0
  const thisWebsiteHasCustomization = hasBaseTemplate
  
  // Debug logging
  console.log('🎯 TemplateDivergenceTracker render:', {
    templateId,
    templateName,
    allCustomizations: templateCustomizations.length,
    thisTemplateCustomizations: customizations.length,
    customizations,
    thisWebsiteHasCustomization,
    websiteId,
    consoleMode
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
          Journals with modifications for {templateName}:
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
  
  // If no modifications, show nothing (keep it clean)
  if (customizations.length === 0) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400">—</span>
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
          {customizedCount} modified
          {isExpanded ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />}
        </button>
      )}
      
      {exemptedCount > 0 && (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
          {exemptedCount} exempted
        </span>
      )}
      
      {/* Promote to Publisher Theme button - only for Publication Pages in multi-website console when this website has customizations */}
      {consoleMode === 'multi' && 
       templateCategory === 'publication' && 
       thisWebsiteHasCustomization && 
       onPromoteToPublisherTheme && (
        <button
          onClick={() => onPromoteToPublisherTheme(templateId)}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors"
          title="Promote this journal's modifications to Publisher Theme"
          data-testid="promote-to-publisher-theme"
        >
          <ArrowUp className="h-3 w-3" />
          Promote to Theme
        </button>
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
  const promoteToJournalTemplate = usePageStore((state: any) => state.promoteToJournalTemplate)
  const exemptFromUpdates = usePageStore((state: any) => state.exemptFromUpdates)
  const removeExemption = usePageStore((state: any) => state.removeExemption)
  const addNotification = usePageStore((state: any) => state.addNotification)
  
  // Determine if this is an individual issue or journal template
  const isIndividualIssue = !customization.route.startsWith('journal/')
  const isJournalTemplate = customization.route.startsWith('journal/')
  
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
    if (confirm(`Reset ${customization.journalName} to base template?\n\nAll ${customization.modificationCount} modifications will be lost.`)) {
      resetToBase?.(customization.route)
      addNotification?.({
        type: 'success',
        title: 'Reset Complete',
        message: `${customization.journalName} reset to base template`
      })
    }
  }
  
  const handlePromote = () => {
    if (isIndividualIssue) {
      // Promote individual issue to journal template (Level 1 → Level 2)
      if (confirm(`Promote this issue's modifications to ALL ${customization.journalName} issues?\n\nAll issues in this journal will inherit these changes.`)) {
        promoteToJournalTemplate?.(customization.route, customization.journalCode, templateId)
        addNotification?.({
          type: 'success',
          title: 'Promoted to Journal Template',
          message: `All ${customization.journalName} issues will now inherit these changes`
        })
      }
    } else if (isJournalTemplate) {
      // Promote journal template to base template (Level 2 → Level 3)
      if (confirm(`Promote ${customization.journalName}'s template to ALL journals?\n\nAll journals (ADVMA, EMBO, etc.) will inherit these changes (except exempted ones).`)) {
        promoteToBase?.(customization.route, templateId)
        addNotification?.({
          type: 'success',
          title: 'Promoted to Base Template',
          message: `All journals will now inherit ${customization.journalName}'s modifications`
        })
      }
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
      if (confirm(`Exempt ${customization.journalName} from base template updates?\n\nThis journal will keep its modifications even when the base template is updated.`)) {
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
          className={`p-1.5 rounded transition-colors ${
            isIndividualIssue 
              ? 'text-yellow-600 hover:bg-yellow-50' 
              : 'text-green-600 hover:bg-green-50'
          }`}
          title={
            isIndividualIssue 
              ? 'Promote to journal template (all issues in this journal)' 
              : 'Promote to base template (all journals)'
          }
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

