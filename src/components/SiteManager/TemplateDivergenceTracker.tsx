/**
 * Page Divergence Tracker
 * 
 * Shows which journals/pages have modified a template
 * Provides actions: View Diff, Reset, Promote, Exempt
 */

import { useMemo, useState } from 'react'
import { Eye, RotateCcw, ArrowUp, Lock, Unlock, ChevronDown, ChevronUp } from 'lucide-react'
import { detectTemplateChanges } from '../../utils/templateDiff'
import { createTOCTemplate } from '../Templates/TOCTemplate'
import { TemplateDiffModal } from './TemplateDiffModal'
import { createDebugLogger } from '../../utils/logger'

// Control logging for this file
const DEBUG = false
const debugLog = createDebugLogger(DEBUG)

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
  
  // Get modifications from store
  const templateModifications = usePageStore((state: any) => state.templateModifications || [])
  const getModificationsForTemplate = usePageStore((state: any) => state.getModificationsForTemplate)
  const globalTemplateCanvas = usePageStore((state: any) => state.globalTemplateCanvas)
  
  // Get modifications for this specific template
  const modifications = getModificationsForTemplate?.(templateId) || []
  
  // "Promote to Publisher Theme" should ONLY show if there's a base template (globalTemplateCanvas)
  // NOT for individual journal modifications - those need to be promoted to base first!
  // This enforces the step-by-step governance: Issue → Journal → Base → Publisher Theme
  const hasBaseTemplate = globalTemplateCanvas && globalTemplateCanvas.length > 0
  const thisWebsiteHasModification = hasBaseTemplate
  
  // Debug logging
  debugLog('log', '🎯 TemplateDivergenceTracker render:', {
    templateId,
    templateName,
    allModifications: templateModifications.length,
    thisTemplateModifications: modifications.length,
    modifications,
    thisWebsiteHasModification,
    websiteId,
    consoleMode
  })
  
  // Calculate stats
  const customizedCount = modifications.filter((c: any) => !c.isExempt).length
  const exemptedCount = modifications.filter((c: any) => c.isExempt).length
  const usingBaseCount = 0 // TODO: Calculate from actual journal count - customized count
  
  // If expandedOnly mode, only show the expanded list
  if (expandedOnly) {
    return (
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-900 mb-3">
          Modified journals for {templateName}:
        </div>
        {modifications.map((modification: any) => (
          <CustomizationItem
            key={modification.route}
            modification={modification}
            templateId={templateId}
            templateName={templateName}
            usePageStore={usePageStore}
          />
        ))}
      </div>
    )
  }
  
  // If no modifications, show nothing (keep it clean)
  if (modifications.length === 0) {
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
          {usingBaseCount} synced
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
      
      {/* Push to Design button - only for Publication Pages in multi-website console when this website has modifications */}
      {consoleMode === 'multi' && 
       templateCategory === 'publication' && 
       thisWebsiteHasModification && 
       onPromoteToPublisherTheme && (
        <button
          onClick={() => onPromoteToPublisherTheme(templateId)}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors"
          title="Push this journal's modifications to Design"
          data-testid="promote-to-publisher-theme"
        >
          <ArrowUp className="h-3 w-3" />
          Push to Design
        </button>
      )}
    </div>
  )
}

interface CustomizationItemProps {
  modification: any
  templateId: string
  templateName: string
  usePageStore: any
}

function CustomizationItem({ 
  modification, 
  templateId,
  templateName,
  usePageStore 
}: CustomizationItemProps) {
  const [isDiffModalOpen, setIsDiffModalOpen] = useState(false)
  
  const resetToBase = usePageStore((state: any) => state.resetToBase)
  const promoteToBase = usePageStore((state: any) => state.promoteToBase)
  const promoteToJournalTemplate = usePageStore((state: any) => state.promoteToJournalTemplate)
  const exemptFromUpdates = usePageStore((state: any) => state.exemptFromUpdates)
  const removeExemption = usePageStore((state: any) => state.removeExemption)
  const addNotification = usePageStore((state: any) => state.addNotification)
  const getCanvasItemsForRoute = usePageStore((state: any) => state.getCanvasItemsForRoute)
  const getJournalTemplateCanvas = usePageStore((state: any) => state.getJournalTemplateCanvas)
  const getModificationsForTemplate = usePageStore((state: any) => state.getModificationsForTemplate)
  const globalTemplateCanvas = usePageStore((state: any) => state.globalTemplateCanvas)
  
  // Determine if this is an individual issue or journal template
  const isIndividualIssue = !modification.route.startsWith('journal/')
  const isJournalTemplate = modification.route.startsWith('journal/')
  
  // Calculate detailed modification breakdown using diff engine
  const modificationBreakdown = useMemo(() => {
    // Get the customized canvas based on route type
    let customizedCanvas
    if (isJournalTemplate) {
      // Journal template: get from journalTemplateCanvas
      customizedCanvas = getJournalTemplateCanvas?.(modification.journalCode) || []
    } else {
      // Individual issue: get from routeCanvasItems
      customizedCanvas = getCanvasItemsForRoute?.(modification.route) || []
    }
    
    // Get base template for comparison
    const baseTemplate = createTOCTemplate(modification.journalCode)
    
    // Calculate diff
    const changes = detectTemplateChanges(baseTemplate, customizedCanvas)
    
    // Categorize changes
    const breakdown = {
      sectionsAdded: changes.filter(c => c.type === 'added' && c.element === 'section').length,
      widgetsAdded: changes.filter(c => c.type === 'added' && c.element === 'widget').length,
      sectionsRemoved: changes.filter(c => c.type === 'removed' && c.element === 'section').length,
      widgetsRemoved: changes.filter(c => c.type === 'removed' && c.element === 'widget').length,
      sectionsModified: changes.filter(c => c.type === 'modified' && c.element === 'section').length,
      widgetsModified: changes.filter(c => c.type === 'modified' && c.element === 'widget').length,
      total: changes.length
    }
    
    return breakdown
  }, [modification.route, modification.journalCode, isJournalTemplate, getCanvasItemsForRoute, getJournalTemplateCanvas])
  
  // Get templates for diff modal
  const getTemplatesForDiff = () => {
    // Get the modified canvas based on route type
    let modifiedCanvas
    if (isJournalTemplate) {
      modifiedCanvas = getJournalTemplateCanvas?.(modification.journalCode) || []
    } else {
      modifiedCanvas = getCanvasItemsForRoute?.(modification.route) || []
    }
    
    // Get base template (use global template canvas if available, otherwise use theme default)
    const baseCanvas = globalTemplateCanvas && globalTemplateCanvas.length > 0 
      ? globalTemplateCanvas 
      : createTOCTemplate(modification.journalCode)
    
    return { baseCanvas, modifiedCanvas }
  }

  const handleViewDiff = () => {
    debugLog('log', 'View diff for:', modification.route)
    setIsDiffModalOpen(true)
  }
  
  const handleReset = () => {
    if (confirm(`Sync ${modification.journalName} with Master?\n\nAll ${modificationBreakdown.total} modifications will be removed.`)) {
      resetToBase?.(modification.route)
      addNotification?.({
        type: 'success',
        title: 'Synced with Master',
        message: `${modification.journalName} synced with Master template`
      })
    }
  }
  
  const handlePromote = () => {
    if (isIndividualIssue) {
      // Promote individual issue to journal template (Level 1 → Level 2)
      if (confirm(`Push this issue's modifications to ALL ${modification.journalName} issues?\n\nAll issues in this journal will inherit these changes.`)) {
        promoteToJournalTemplate?.(modification.route, modification.journalCode, templateId)
        addNotification?.({
          type: 'success',
          title: 'Pushed to Journal',
          message: `All ${modification.journalName} issues will now inherit these changes`
        })
      }
    } else if (isJournalTemplate) {
      // Promote journal template to base template (Level 2 → Level 3)
      
      // Get all modifications for this template to check for conflicts
      const allModifications = getModificationsForTemplate?.(templateId) || []
      
      // Find other journals that have modifications and won't be affected
      const otherModifiedJournals = allModifications
        .filter((m: any) => m.route !== modification.route && m.route.startsWith('journal/'))
        .map((m: any) => m.journalName)
      
      // Build accurate dialog message with explicit template name
      let message = `Push ${modification.journalName}'s ${templateName} to Master (all journals)?\n\n`
      message += `This will update the Master ${templateName} used across all journals.\n\n`
      
      if (otherModifiedJournals.length > 0) {
        message += `⚠️ ${otherModifiedJournals.join(', ')} will NOT be affected because they have their own ${templateName} modifications.\n\n`
        message += `Only synced journals will inherit this ${templateName}.`
      } else {
        message += `All journals will inherit this ${templateName} (except those broken from Master).`
      }
      
      if (confirm(message)) {
        promoteToBase?.(modification.route, templateId)
        addNotification?.({
          type: 'success',
          title: `Pushed to Master ${templateName}`,
          message: otherModifiedJournals.length > 0 
            ? `Master ${templateName} updated. ${otherModifiedJournals.join(', ')} kept their own modifications.`
            : `All journals will now use ${modification.journalName}'s ${templateName}`
        })
      }
    }
  }
  
  const handleToggleExempt = () => {
    if (modification.isExempt) {
      if (confirm(`Re-enable sync for ${modification.journalName}?\n\nThis journal will inherit future Master updates.`)) {
        removeExemption?.(modification.route)
        addNotification?.({
          type: 'info',
          title: 'Sync Enabled',
          message: `${modification.journalName} will now sync with Master updates`
        })
      }
    } else {
      if (confirm(`Break from Master for ${modification.journalName}?\n\nThis journal will keep its modifications even when the Master is updated.`)) {
        exemptFromUpdates?.(modification.route)
        addNotification?.({
          type: 'info',
          title: 'Broken from Master',
          message: `${modification.journalName} will not sync with future Master updates`
        })
      }
    }
  }
  
  return (
    <div 
      className="flex items-center justify-between bg-white rounded p-2 border border-gray-200"
      data-testid={`modification-${modification.journalCode}`}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900">
            {modification.journalName || modification.journalCode}
          </span>
          {modification.isExempt && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
              Exempted
            </span>
          )}
        </div>
        <div className="text-xs text-gray-500 mt-1 space-y-0.5">
          {modificationBreakdown.sectionsAdded > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-green-600">+{modificationBreakdown.sectionsAdded}</span>
              <span>section{modificationBreakdown.sectionsAdded !== 1 ? 's' : ''} added</span>
            </div>
          )}
          {modificationBreakdown.widgetsAdded > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-green-600">+{modificationBreakdown.widgetsAdded}</span>
              <span>widget{modificationBreakdown.widgetsAdded !== 1 ? 's' : ''} added</span>
            </div>
          )}
          {modificationBreakdown.sectionsRemoved > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-red-600">−{modificationBreakdown.sectionsRemoved}</span>
              <span>section{modificationBreakdown.sectionsRemoved !== 1 ? 's' : ''} removed</span>
            </div>
          )}
          {modificationBreakdown.widgetsRemoved > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-red-600">−{modificationBreakdown.widgetsRemoved}</span>
              <span>widget{modificationBreakdown.widgetsRemoved !== 1 ? 's' : ''} removed</span>
            </div>
          )}
          {modificationBreakdown.sectionsModified > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-blue-600">~{modificationBreakdown.sectionsModified}</span>
              <span>section{modificationBreakdown.sectionsModified !== 1 ? 's' : ''} modified</span>
            </div>
          )}
          {modificationBreakdown.widgetsModified > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-blue-600">~{modificationBreakdown.widgetsModified}</span>
              <span>widget{modificationBreakdown.widgetsModified !== 1 ? 's' : ''} modified</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-1">
        <button
          onClick={handleViewDiff}
          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
          title="View diff"
          data-testid={`view-diff-${modification.journalCode}`}
        >
          <Eye className="h-4 w-4" />
        </button>
        
        <button
          onClick={handleReset}
          className="p-1.5 text-orange-600 hover:bg-orange-50 rounded transition-colors"
          title="Sync with Master"
          data-testid={`reset-${modification.journalCode}`}
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
              ? 'Push to journal (all issues in this journal)' 
              : 'Push to Master (all journals)'
          }
          data-testid={`promote-${modification.journalCode}`}
        >
          <ArrowUp className="h-4 w-4" />
        </button>
        
        <button
          onClick={handleToggleExempt}
          className={`p-1.5 rounded transition-colors ${
            modification.isExempt 
              ? 'text-purple-600 hover:bg-purple-50' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
          title={modification.isExempt ? "Enable sync with Master" : "Break from Master"}
          data-testid={`exempt-${modification.journalCode}`}
        >
          {modification.isExempt ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
        </button>
      </div>
      
      {/* Diff Modal */}
      <TemplateDiffModal
        isOpen={isDiffModalOpen}
        onClose={() => setIsDiffModalOpen(false)}
        templateName={templateName}
        journalName={modification.journalName || modification.journalCode}
        baseTemplate={getTemplatesForDiff().baseCanvas}
        modifiedTemplate={getTemplatesForDiff().modifiedCanvas}
      />
    </div>
  )
}

