/**
 * PublishReviewModal - Modal for reviewing changes before publishing
 * 
 * Two modes:
 * 1. 'archetype' mode (for pages using archetypes):
 *    - Shows local/archetype choice for each zone
 *    - User decides where changes go
 * 
 * 2. 'simple' mode (for non-archetype pages):
 *    - Just shows what changed
 *    - No choices needed - direct publish
 */

import React, { useState, useMemo } from 'react'
import { X, Save, Layers, AlertTriangle, Check, Trash2, ChevronDown, ChevronRight, Undo2 } from 'lucide-react'
import type { WidgetSection } from '../../types/widgets'
import type { ArchetypeDisplayLabel } from '../../types/archetypes'
import { createDebugLogger } from '../../utils/logger'
import { countPageInstancesByArchetype } from '../../stores/archetypeStore'
import { getSectionChanges, getSectionPositionChanges, type ChangeDescription, type PositionChange } from '../../utils/zoneComparison'

const DEBUG = false // Set to true to see modal debug logs
const debugLog = createDebugLogger(DEBUG)

interface PublishReviewModalProps {
  isOpen: boolean
  onClose: () => void
  dirtyZones: Set<string>
  zoneSections?: Map<string, WidgetSection> // Map of zoneSlug -> section (current state)
  canvasItems?: WidgetSection[] // Alternative: array of sections (for archetype-master mode)
  baselineSections?: Map<string, WidgetSection> // Map of zoneSlug -> section (committed state for change diff)
  archetypeSections?: Map<string, WidgetSection> // Map of zoneSlug -> section (pure archetype, for reset detection)
  onPublish: (choices: Map<string, 'local' | 'archetype' | 'discard'>, stayInEditor: boolean) => void
  archetypeName?: string
  archetypeId?: string // Used to count affected pages
  journalName?: string
  mode?: 'archetype' | 'simple' | 'archetype-master' // 'archetype' shows choices, 'simple' lists changes, 'archetype-master' publishes to all
  onSimplePublish?: () => void // Called in 'simple' mode instead of onPublish
  pageName?: string // For simple mode header
  onDiscard?: () => void // Called when user wants to discard all changes
  affectedPagesCount?: number // Number of pages that will be affected (for archetype-master mode)
  displayLabel?: ArchetypeDisplayLabel // For contextual language (e.g., "Journals", "Issues")
  // Page shell (header/footer/etc) changes live outside the page canvas and must be passed explicitly.
  // We use a generic name so later we can include navigation/sidebars without renaming.
  pageShellChanges?: {
    header?: boolean | { source?: 'global' | 'page' | 'unknown'; kinds?: Array<'sections' | 'visibility' | 'enabled'> }
    footer?: boolean | { source?: 'global' | 'page' | 'unknown'; kinds?: Array<'sections' | 'visibility' | 'enabled'> }
  }
  // Optional callback to apply page shell publish decisions (e.g., commit global header draft vs keep for this page).
  onPublishPageShell?: (choices: Partial<Record<'header' | 'footer', 'global' | 'page' | 'discard'>>) => void
  // Optional callback to apply page-shell visibility decisions (hide/show on this page).
  onPublishPageShellVisibility?: (choices: Partial<Record<'header' | 'footer', 'accept' | 'discard'>>) => void
}

export function PublishReviewModal({
  isOpen,
  onClose,
  dirtyZones,
  zoneSections,
  canvasItems,
  baselineSections,
  archetypeSections,
  onPublish,
  archetypeName,
  archetypeId,
  journalName,
  mode = 'archetype',
  onSimplePublish,
  pageName,
  onDiscard,
  affectedPagesCount = 0,
  displayLabel = { singular: 'Journal', plural: 'Journals' }, // Default to Journal for backwards compatibility
  pageShellChanges,
  onPublishPageShell,
  onPublishPageShellVisibility
}: PublishReviewModalProps) {
  // Helper for contextual language
  const labels = {
    singular: displayLabel.singular,
    plural: displayLabel.plural,
    singularLower: displayLabel.singular.toLowerCase(),
    pluralLower: displayLabel.plural.toLowerCase(),
    // Common phrases
    pushToAll: `Push to All ${displayLabel.plural}`,
    keepForThis: `Keep for This ${displayLabel.singular}`,
    syncWithMaster: 'Sync with Master',
    modified: 'Modified'
  }
  // Build zoneSections from canvasItems if not provided (for archetype-master mode)
  const effectiveZoneSections = useMemo(() => {
    if (zoneSections) return zoneSections
    if (canvasItems) {
      const map = new Map<string, WidgetSection>()
      canvasItems.forEach(section => {
        const key = section.zoneSlug || section.id
        map.set(key, section)
      })
      return map
    }
    return new Map<string, WidgetSection>()
  }, [zoneSections, canvasItems])
  // Log every render
  debugLog('log', '📋 [PublishReviewModal] Component rendered:', {
    isOpen,
    dirtyZonesSize: dirtyZones.size,
    zoneSectionsCount: effectiveZoneSections.size
  })
  
  const [choices, setChoices] = useState<Map<string, 'local' | 'archetype' | 'discard'>>(new Map())
  const [expandedZones, setExpandedZones] = useState<Set<string>>(new Set())
  const [pageShellChoices, setPageShellChoices] = useState<Partial<Record<'header' | 'footer', 'global' | 'page' | 'discard'>>>({})
  const [pageShellVisibilityChoices, setPageShellVisibilityChoices] = useState<Partial<Record<'header' | 'footer', 'accept' | 'discard'>>>({})
  
  // Helper to normalize section for comparison (remove runtime data)
  const normalizeSection = (section: WidgetSection): string => {
    const { id, ...rest } = section as any
    const normalized = {
      ...rest,
      areas: section.areas?.map(area => ({
        ...area,
        widgets: area.widgets?.map(widget => {
          const { id: wId, journalId, publications, publication, ...widgetRest } = widget as any
          return widgetRest
        })
      }))
    }
    return JSON.stringify(normalized)
  }
  
  // Categorize zones into "resets" (current matches archetype) and "new changes" (current differs from archetype)
  const { resetZones, changeZones } = useMemo(() => {
    const resets: string[] = []
    const changes: string[] = []
    
    if (mode !== 'archetype' || !archetypeSections) {
      // Not in archetype mode or no archetype sections provided - all are "changes"
      return { resetZones: [], changeZones: Array.from(dirtyZones) }
    }
    
    dirtyZones.forEach(zoneSlug => {
      const currentSection = effectiveZoneSections.get(zoneSlug)
      const archetypeSection = archetypeSections.get(zoneSlug)
      
      if (currentSection && archetypeSection) {
        const currentNorm = normalizeSection(currentSection)
        const archetypeNorm = normalizeSection(archetypeSection)
        
        if (currentNorm === archetypeNorm) {
          // Current matches archetype - this is a "reset"
          resets.push(zoneSlug)
        } else {
          // Current differs from archetype - this is a "new change"
          changes.push(zoneSlug)
        }
      } else {
        // No archetype section found - treat as a "change"
        changes.push(zoneSlug)
      }
    })
    
    return { resetZones: resets, changeZones: changes }
  }, [dirtyZones, effectiveZoneSections, archetypeSections, mode])
  
  // Toggle zone expansion to show/hide detailed changes
  const toggleZoneExpansion = (zoneSlug: string) => {
    setExpandedZones(prev => {
      const next = new Set(prev)
      if (next.has(zoneSlug)) {
        next.delete(zoneSlug)
      } else {
        next.add(zoneSlug)
      }
      return next
    })
  }
  
  // Compute detailed changes for each dirty zone
  const zoneChanges = useMemo(() => {
    const changes = new Map<string, ChangeDescription[]>()
    dirtyZones.forEach(zoneSlug => {
      const currentSection = effectiveZoneSections.get(zoneSlug)
      const baselineSection = baselineSections?.get(zoneSlug)
      
      if (currentSection && baselineSection) {
        changes.set(zoneSlug, getSectionChanges(currentSection, baselineSection))
      } else if (currentSection && !baselineSection) {
        // New section (not in baseline)
        changes.set(zoneSlug, [{
          type: 'widget-added',
          description: 'New section added'
        }])
      }
    })
    return changes
  }, [dirtyZones, zoneSections, baselineSections])
  
  // Compute position changes per section (for reorder display)
  const sectionPositionChanges = useMemo(() => {
    if (!baselineSections || baselineSections.size === 0) return new Map<string, PositionChange>()
    
    // Convert maps to arrays preserving insertion order
    const currentSections = Array.from(effectiveZoneSections.values())
    const baselineSectionsArray = Array.from(baselineSections.values())
    
    return getSectionPositionChanges(currentSections, baselineSectionsArray)
  }, [zoneSections, baselineSections])
  
  // Combine dirty zones with position-changed sections for complete list
  const allChangedSections = useMemo(() => {
    const allSections = new Set<string>(dirtyZones)
    // Add sections that have position changes but might not have content changes
    sectionPositionChanges.forEach((_, sectionId) => {
      allSections.add(sectionId)
    })
    return allSections
  }, [dirtyZones, sectionPositionChanges])

  const pageShellHeaderPresent = !!pageShellChanges?.header
  const pageShellFooterPresent = !!pageShellChanges?.footer
  const pageShellCount = (pageShellHeaderPresent ? 1 : 0) + (pageShellFooterPresent ? 1 : 0)
  const totalChangeCount = allChangedSections.size + pageShellCount
  const hasPublishableChanges = totalChangeCount > 0
  
  const getPageShellSource = (region: 'header' | 'footer'): 'global' | 'page' | 'unknown' => {
    const value = (pageShellChanges as any)?.[region]
    if (!value) return 'unknown'
    if (typeof value === 'boolean') return 'unknown'
    return value.source || 'unknown'
  }

  const getPageShellKinds = (region: 'header' | 'footer'): Array<'sections' | 'visibility' | 'enabled'> => {
    const value = (pageShellChanges as any)?.[region]
    if (!value) return []
    if (typeof value === 'boolean') return ['sections']
    return (value.kinds && Array.isArray(value.kinds) ? value.kinds : ['sections'])
  }
  
  // Note: affectedPagesCount is now passed as a prop (or computed from archetypeId if not provided)
  // The prop takes precedence; if not provided, calculate from archetypeId for backwards compatibility
  const effectiveAffectedPagesCount = useMemo(() => {
    if (affectedPagesCount > 0) return affectedPagesCount
    if (!archetypeId) return 0
    return countPageInstancesByArchetype(archetypeId)
  }, [affectedPagesCount, archetypeId])
  
  // Debug: Log modal props
  React.useEffect(() => {
    debugLog('log', '📋 [PublishReviewModal] Props changed:', {
      isOpen,
      dirtyZonesSize: dirtyZones.size,
      dirtyZones: Array.from(dirtyZones),
      zoneSectionsCount: effectiveZoneSections.size,
      archetypeName,
      journalName
    })
  }, [isOpen, dirtyZones, effectiveZoneSections.size, archetypeName, journalName])
  
  // Initialize all dirty zones to 'local' by default
  React.useEffect(() => {
    if (isOpen) {
      debugLog('log', '📋 [PublishReviewModal] Initializing choices for dirty zones')
      const initialChoices = new Map<string, 'local' | 'archetype' | 'discard'>()
      dirtyZones.forEach(zoneSlug => {
        initialChoices.set(zoneSlug, 'local')
      })
      setChoices(initialChoices)
      debugLog('log', '📋 [PublishReviewModal] Choices initialized:', Array.from(initialChoices.entries()))

      // Initialize page shell choices (Flow A):
      // - If the draft came from a page-only edit, default to "This Page".
      // - If it came from a global edit, default to "All Pages".
      const initialShell: Partial<Record<'header' | 'footer', 'global' | 'page' | 'discard'>> = {}
      const initialVisibility: Partial<Record<'header' | 'footer', 'accept' | 'discard'>> = {}
      if (pageShellHeaderPresent) {
        const kinds = getPageShellKinds('header')
        if (kinds.length === 1 && kinds[0] === 'visibility') initialShell.header = 'page'
        else if (kinds.length === 1 && kinds[0] === 'enabled') initialShell.header = 'global'
        else initialShell.header = getPageShellSource('header') === 'page' ? 'page' : 'global'
        if (kinds.includes('visibility')) initialVisibility.header = 'accept'
      }
      if (pageShellFooterPresent) {
        const kinds = getPageShellKinds('footer')
        if (kinds.length === 1 && kinds[0] === 'visibility') initialShell.footer = 'page'
        else if (kinds.length === 1 && kinds[0] === 'enabled') initialShell.footer = 'global'
        else initialShell.footer = getPageShellSource('footer') === 'page' ? 'page' : 'global'
        if (kinds.includes('visibility')) initialVisibility.footer = 'accept'
      }
      setPageShellChoices(initialShell)
      setPageShellVisibilityChoices(initialVisibility)
    }
  }, [isOpen, dirtyZones, pageShellHeaderPresent, pageShellFooterPresent])
  
  if (!isOpen) {
    debugLog('log', '📋 [PublishReviewModal] Not rendering (isOpen=false)')
    return null
  }
  
  debugLog('log', '📋 [PublishReviewModal] Rendering modal')
  
  const handleChoiceChange = (zoneSlug: string, choice: 'local' | 'archetype' | 'discard') => {
    setChoices(prev => {
      const next = new Map(prev)
      next.set(zoneSlug, choice)
      return next
    })
  }
  
  const handlePublish = () => {
    debugLog('log', '📋 [PublishReviewModal] handlePublish called:', {
      mode,
      choices: Array.from(choices.entries())
    })

    // Apply page shell publish decisions first (so downstream publish can navigate safely).
    if (onPublishPageShell) {
      onPublishPageShell(pageShellChoices)
    }
    if (onPublishPageShellVisibility) {
      onPublishPageShellVisibility(pageShellVisibilityChoices)
    }
    
    if (mode === 'simple' && onSimplePublish) {
      onSimplePublish()
    } else if (mode === 'archetype-master' && onSimplePublish) {
      // Archetype master uses onSimplePublish (which is handleConfirmPublish from ArchetypeEditor)
      onSimplePublish()
    } else {
      onPublish(choices, false) // Always navigate to live site
    }
    onClose()
  }
  
  const handleDiscard = () => {
    debugLog('log', '📋 [PublishReviewModal] handleDiscard called')
    if (onDiscard) {
      onDiscard()
    }
    onClose()
  }
  
  const handleBulkSelect = (choice: 'local' | 'archetype' | 'discard') => {
    const newChoices = new Map<string, 'local' | 'archetype' | 'discard'>()
    dirtyZones.forEach(zoneSlug => {
      newChoices.set(zoneSlug, choice)
    })
    setChoices(newChoices)
  }
  
  const localCount = Array.from(choices.values()).filter(c => c === 'local').length
  const archetypeCount = Array.from(choices.values()).filter(c => c === 'archetype').length
  const discardCount = Array.from(choices.values()).filter(c => c === 'discard').length
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Review Changes Before Publishing</h2>
            <p className="text-sm text-gray-500 mt-1">
              {totalChangeCount} pending change{totalChangeCount !== 1 ? 's' : ''} found
              {mode === 'archetype' && archetypeName && ` in ${archetypeName}`}
              {mode === 'archetype' && journalName && ` (${journalName})`}
              {mode === 'simple' && pageName && ` on ${pageName}`}
              {mode === 'archetype-master' && archetypeName && ` in ${archetypeName} archetype`}
            </p>
            {mode === 'archetype-master' && effectiveAffectedPagesCount > 0 && (
              <p className="text-sm text-amber-600 mt-1 font-medium">
                ⚠️ This will update {effectiveAffectedPagesCount} {effectiveAffectedPagesCount === 1 ? labels.singularLower : labels.pluralLower} using{archetypeName ? ` "${archetypeName}"` : ' this Master'}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Bulk Actions removed - users should decide per zone individually */}
        
        {/* Zone List */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* No changes message */}
          {totalChangeCount === 0 && (
            <div className="text-center py-12">
              <Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Changes</h3>
              <p className="text-gray-500">
                This page is up to date with the published version.
              </p>
            </div>
          )}
          
          {/* PAGE SHELL CHANGES (Header/Footer/etc) */}
          {pageShellCount > 0 && (
            <div className="mb-6 border border-slate-200 rounded-lg p-4 bg-slate-50">
              <div className="flex items-center gap-2 mb-2">
                <Layers className="w-4 h-4 text-slate-600" />
                <h4 className="text-sm font-semibold text-slate-800">
                  Page Shell (This Page)
                </h4>
              </div>
              <div className="text-xs text-slate-600 mb-3">
                Decide whether shell changes should apply to <span className="font-medium">all pages</span> or <span className="font-medium">this page only</span>. Use <span className="font-medium">Discard Changes</span> to revert.
              </div>
              <div className="space-y-2">
                {pageShellHeaderPresent && !(
                  getPageShellKinds('header').length === 1 &&
                  getPageShellKinds('header')[0] === 'visibility'
                ) && (
                  <div className="bg-white border border-slate-200 rounded-md px-3 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-blue-600" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">Header changes</div>
                          <div className="text-xs text-gray-500">
                            Source: {getPageShellSource('header') === 'global' ? 'Global edit (website)' : getPageShellSource('header') === 'page' ? 'This page edit' : 'Draft'}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            Changes: {getPageShellKinds('header').map(k => k === 'sections' ? 'Content' : k === 'visibility' ? 'Visibility' : 'Enabled').join(', ')}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                        Pending
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <label className="flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-50">
                        <input
                          type="radio"
                          name="page-shell-header"
                          value="global"
                          checked={(pageShellChoices.header || 'global') === 'global'}
                          onChange={() => setPageShellChoices(prev => ({ ...prev, header: 'global' }))}
                          className="w-3.5 h-3.5 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-xs font-medium text-gray-800">Apply to All Pages</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-50">
                        <input
                          type="radio"
                          name="page-shell-header"
                          value="page"
                          checked={pageShellChoices.header === 'page'}
                          onChange={() => setPageShellChoices(prev => ({ ...prev, header: 'page' }))}
                          className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-xs font-medium text-gray-800">Keep for This Page Only</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-md border border-red-200 hover:bg-red-50">
                        <input
                          type="radio"
                          name="page-shell-header"
                          value="discard"
                          checked={pageShellChoices.header === 'discard'}
                          onChange={() => setPageShellChoices(prev => ({ ...prev, header: 'discard' }))}
                          className="w-3.5 h-3.5 text-red-600 focus:ring-red-500"
                        />
                        <span className="text-xs font-medium text-red-700">Discard</span>
                      </label>
                    </div>
                    {pageShellChoices.header === 'global' && (
                      <div className="mt-2 text-xs text-amber-600">
                        ⚠️ Publishing will update the header across <strong>all pages</strong>.
                      </div>
                    )}
                  </div>
                )}

                {pageShellHeaderPresent && getPageShellKinds('header').includes('visibility') && (
                  <div className="bg-white border border-slate-200 rounded-md px-3 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-blue-600" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">Header visibility (this page)</div>
                          <div className="text-xs text-gray-500">Hidden on this page</div>
                        </div>
                      </div>
                      <span className="text-xs text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                        Pending
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <label className="flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-50">
                        <input
                          type="radio"
                          name="page-shell-header-visibility"
                          value="accept"
                          checked={(pageShellVisibilityChoices.header || 'accept') === 'accept'}
                          onChange={() => setPageShellVisibilityChoices(prev => ({ ...prev, header: 'accept' }))}
                          className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-xs font-medium text-gray-800">Accept</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-md border border-red-200 hover:bg-red-50">
                        <input
                          type="radio"
                          name="page-shell-header-visibility"
                          value="discard"
                          checked={pageShellVisibilityChoices.header === 'discard'}
                          onChange={() => setPageShellVisibilityChoices(prev => ({ ...prev, header: 'discard' }))}
                          className="w-3.5 h-3.5 text-red-600 focus:ring-red-500"
                        />
                        <span className="text-xs font-medium text-red-700">Discard</span>
                      </label>
                    </div>
                  </div>
                )}

                {pageShellFooterPresent && !(
                  getPageShellKinds('footer').length === 1 &&
                  getPageShellKinds('footer')[0] === 'visibility'
                ) && (
                  <div className="bg-white border border-slate-200 rounded-md px-3 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-blue-600" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">Footer changes</div>
                          <div className="text-xs text-gray-500">
                            Source: {getPageShellSource('footer') === 'global' ? 'Global edit (website)' : getPageShellSource('footer') === 'page' ? 'This page edit' : 'Draft'}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            Changes: {getPageShellKinds('footer').map(k => k === 'sections' ? 'Content' : k === 'visibility' ? 'Visibility' : 'Enabled').join(', ')}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                        Pending
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <label className="flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-50">
                        <input
                          type="radio"
                          name="page-shell-footer"
                          value="global"
                          checked={(pageShellChoices.footer || 'global') === 'global'}
                          onChange={() => setPageShellChoices(prev => ({ ...prev, footer: 'global' }))}
                          className="w-3.5 h-3.5 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-xs font-medium text-gray-800">Apply to All Pages</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-50">
                        <input
                          type="radio"
                          name="page-shell-footer"
                          value="page"
                          checked={pageShellChoices.footer === 'page'}
                          onChange={() => setPageShellChoices(prev => ({ ...prev, footer: 'page' }))}
                          className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-xs font-medium text-gray-800">Keep for This Page Only</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-md border border-red-200 hover:bg-red-50">
                        <input
                          type="radio"
                          name="page-shell-footer"
                          value="discard"
                          checked={pageShellChoices.footer === 'discard'}
                          onChange={() => setPageShellChoices(prev => ({ ...prev, footer: 'discard' }))}
                          className="w-3.5 h-3.5 text-red-600 focus:ring-red-500"
                        />
                        <span className="text-xs font-medium text-red-700">Discard</span>
                      </label>
                    </div>
                    {pageShellChoices.footer === 'global' && (
                      <div className="mt-2 text-xs text-amber-600">
                        ⚠️ Publishing will update the footer across <strong>all pages</strong>.
                      </div>
                    )}
                  </div>
                )}

                {pageShellFooterPresent && getPageShellKinds('footer').includes('visibility') && (
                  <div className="bg-white border border-slate-200 rounded-md px-3 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-blue-600" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">Footer visibility (this page)</div>
                          <div className="text-xs text-gray-500">Hidden on this page</div>
                        </div>
                      </div>
                      <span className="text-xs text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                        Pending
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <label className="flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-50">
                        <input
                          type="radio"
                          name="page-shell-footer-visibility"
                          value="accept"
                          checked={(pageShellVisibilityChoices.footer || 'accept') === 'accept'}
                          onChange={() => setPageShellVisibilityChoices(prev => ({ ...prev, footer: 'accept' }))}
                          className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-xs font-medium text-gray-800">Accept</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-md border border-red-200 hover:bg-red-50">
                        <input
                          type="radio"
                          name="page-shell-footer-visibility"
                          value="discard"
                          checked={pageShellVisibilityChoices.footer === 'discard'}
                          onChange={() => setPageShellVisibilityChoices(prev => ({ ...prev, footer: 'discard' }))}
                          className="w-3.5 h-3.5 text-red-600 focus:ring-red-500"
                        />
                        <span className="text-xs font-medium text-red-700">Discard</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* GROUPED ZONE LIST - Separates resets from new changes */}
          <div className="space-y-6">
            
            {/* RESET ZONES GROUP - Current matches archetype (removing local override) */}
            {mode === 'archetype' && resetZones.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                    <Undo2 className="w-3.5 h-3.5 text-indigo-600" />
                  </div>
                  <h4 className="text-sm font-semibold text-indigo-700 uppercase tracking-wide">
                    Syncing with Master{archetypeName ? ` "${archetypeName}"` : ''} ({resetZones.length})
                  </h4>
                </div>
                <div className="space-y-3">
                  {resetZones.map(zoneSlug => {
                    const section = effectiveZoneSections.get(zoneSlug)
                    const changes = zoneChanges.get(zoneSlug) || []
                    const isExpanded = expandedZones.has(zoneSlug)
                    const choice = choices.get(zoneSlug) || 'local'
                    
                    return (
                      <div
                        key={zoneSlug}
                        className="border border-indigo-200 rounded-lg p-4 bg-indigo-50/30"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              {/* Expand/collapse for details */}
                              <button
                                onClick={() => toggleZoneExpansion(zoneSlug)}
                                className="text-indigo-400 hover:text-indigo-600 transition-colors"
                              >
                                {isExpanded ? (
                                  <ChevronDown className="w-4 h-4" />
                                ) : (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                              </button>
                              <Check className="w-4 h-4 text-indigo-600" />
                              <h3 className="font-medium text-gray-900">
                                {section?.name || zoneSlug}
                              </h3>
                              <span className="text-xs text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded">
                                Will sync with Master
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 ml-6">
                              Zone: {section?.zoneSlug || zoneSlug}
                            </p>
                            
                            {/* Detailed changes (when expanded) - shows what was removed/changed */}
                            {isExpanded && (
                              <div className="mt-3 ml-6 p-3 bg-white rounded border border-indigo-100">
                                <p className="text-xs text-gray-600 mb-2 font-medium">Changes being reverted:</p>
                                {changes.length > 0 ? (
                                  <div className="space-y-1">
                                    {changes.map((change, idx) => (
                                      <div key={idx} className="text-xs text-gray-500">
                                        • {change.description}
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-xs text-gray-400">Local override will be removed</p>
                                )}
                              </div>
                            )}
                          </div>
                          
                          {/* Simple choice: Confirm Sync or Keep Modified */}
                          <div className="flex items-center gap-2 ml-4">
                            <label className="flex items-center gap-1.5 cursor-pointer px-3 py-1.5 rounded-md border border-indigo-200 bg-white hover:bg-indigo-50 transition-colors">
                              <input
                                type="radio"
                                name={`choice-${zoneSlug}`}
                                value="local"
                                checked={choice === 'local'}
                                onChange={() => handleChoiceChange(zoneSlug, 'local')}
                                className="w-3.5 h-3.5 text-indigo-600 focus:ring-indigo-500"
                              />
                              <span className="text-xs font-medium text-indigo-700">Confirm Sync</span>
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer px-3 py-1.5 rounded-md border border-red-200 bg-white hover:bg-red-50 transition-colors">
                              <input
                                type="radio"
                                name={`choice-${zoneSlug}`}
                                value="discard"
                                checked={choice === 'discard'}
                                onChange={() => handleChoiceChange(zoneSlug, 'discard')}
                                className="w-3.5 h-3.5 text-red-600 focus:ring-red-500"
                              />
                              <span className="text-xs font-medium text-red-600">Keep Modified</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            
            {/* NEW CHANGES GROUP - Current differs from archetype */}
            {changeZones.length > 0 && (
              <div>
                {mode === 'archetype' && resetZones.length > 0 && (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
                      <Layers className="w-3.5 h-3.5 text-amber-600" />
                    </div>
                    <h4 className="text-sm font-semibold text-amber-700 uppercase tracking-wide">
                      New Changes ({changeZones.length})
                    </h4>
                  </div>
                )}
                <div className="space-y-3">
                  {changeZones.map(zoneSlug => {
                    const section = effectiveZoneSections.get(zoneSlug)
                    const choice = choices.get(zoneSlug) || 'local'
                    const changes = zoneChanges.get(zoneSlug) || []
                    const isExpanded = expandedZones.has(zoneSlug)
                    const positionChange = sectionPositionChanges.get(zoneSlug)
                    
                    return (
                      <div
                        key={zoneSlug}
                        className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              {/* Expand/collapse button when there are detailed changes */}
                              {changes.length > 0 && (
                                <button
                                  onClick={() => toggleZoneExpansion(zoneSlug)}
                                  className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                  {isExpanded ? (
                                    <ChevronDown className="w-4 h-4" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4" />
                                  )}
                                </button>
                              )}
                              {mode === 'simple' && changes.length === 0 && !positionChange && (
                                <Check className="w-4 h-4 text-green-600" />
                              )}
                              <h3 className="font-medium text-gray-900">
                                {section?.name || zoneSlug}
                              </h3>
                              {/* Position change badge */}
                              {positionChange && (
                                <span className={`text-xs px-2 py-0.5 rounded font-medium flex items-center gap-1 bg-amber-100 text-amber-700`}>
                                  {positionChange.direction === 'up' ? '↑' : '↓'}
                                  #{positionChange.oldPosition} → #{positionChange.newPosition}
                                </span>
                              )}
                              {changes.length > 0 && (
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                  {changes.length} change{changes.length !== 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                            {mode === 'archetype' && section?.zoneSlug && (
                              <p className="text-xs text-gray-500 mt-1">Zone: {section.zoneSlug}</p>
                            )}
                            
                            {/* Brief summary of changes (always visible) */}
                            {changes.length > 0 && !isExpanded && (
                              <p className="text-xs text-gray-500 mt-1">
                                {changes.slice(0, 2).map(c => c.description).join(', ')}
                                {changes.length > 2 && ` +${changes.length - 2} more`}
                              </p>
                            )}
                            
                            {/* Detailed changes (when expanded) */}
                            {changes.length > 0 && isExpanded && (
                              <div className="mt-3 space-y-1">
                                {changes.map((change, idx) => (
                                  <div 
                                    key={idx} 
                                    className={`text-xs px-2 py-1 rounded flex items-center gap-2 ${
                                      change.type === 'widget-added' ? 'bg-green-50 text-green-700' :
                                      change.type === 'widget-removed' ? 'bg-red-50 text-red-700' :
                                      change.type === 'widget-modified' ? 'bg-blue-50 text-blue-700' :
                                      change.type === 'widget-reordered' ? 'bg-purple-50 text-purple-700' :
                                      change.type === 'section-reordered' ? 'bg-purple-50 text-purple-700' :
                                      'bg-gray-50 text-gray-700'
                                    }`}
                                  >
                                    <span className="font-medium">
                                      {change.type === 'widget-added' ? '+' :
                                       change.type === 'widget-removed' ? '−' :
                                       change.type === 'widget-modified' ? '~' :
                                       change.type === 'widget-reordered' ? '↕' :
                                       change.type === 'section-reordered' ? '↕' : '•'}
                                    </span>
                                    {change.description}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          {/* Choices - Only in page-instance archetype mode (not archetype-master) */}
                          {mode === 'archetype' && (
                            <div className="flex items-center gap-3 ml-4">
                              {/* Keep for This Journal/Issue/etc Option */}
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`choice-${zoneSlug}`}
                                  value="local"
                                  checked={choice === 'local'}
                                  onChange={() => handleChoiceChange(zoneSlug, 'local')}
                                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                />
                                <div className="flex items-center gap-1.5">
                                  <Layers className="w-4 h-4 text-blue-600" />
                                  <span className="text-sm font-medium text-gray-700">{labels.keepForThis}</span>
                                </div>
                              </label>
                              
                              {/* Push to All Journals/Issues/etc Option */}
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
                                  <span className="text-sm font-medium text-gray-700">{labels.pushToAll}</span>
                                </div>
                              </label>
                              
                              {/* Discard Option */}
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`choice-${zoneSlug}`}
                                  value="discard"
                                  checked={choice === 'discard'}
                                  onChange={() => handleChoiceChange(zoneSlug, 'discard')}
                                  className="w-4 h-4 text-red-600 focus:ring-red-500"
                                />
                                <div className="flex items-center gap-1.5">
                                  <Undo2 className="w-4 h-4 text-red-500" />
                                  <span className="text-sm font-medium text-gray-700">Discard</span>
                                </div>
                              </label>
                            </div>
                          )}
                        </div>
                        
                        {/* Choice Description - Only in page-instance archetype mode */}
                        {mode === 'archetype' && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            {choice === 'local' ? (
                              <p className="text-xs text-gray-500">
                                This change will only affect <strong>this {labels.singularLower}</strong>. Other {labels.pluralLower} will not be affected.
                              </p>
                            ) : choice === 'archetype' ? (
                              <div className="flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-amber-700">
                                  This change will update the Master{archetypeName ? ` "${archetypeName}"` : ''}.
                                  {effectiveAffectedPagesCount > 0 ? (
                                    <> <strong>{effectiveAffectedPagesCount}</strong> other {labels.pluralLower} will also receive this change.</>
                                  ) : (
                                    <> All {labels.pluralLower} will receive this change.</>
                                  )}
                                </p>
                              </div>
                            ) : (
                              <div className="flex items-start gap-2">
                                <Undo2 className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-red-600">
                                  This change will be <strong>discarded</strong>. The zone will revert to its previous state.
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="text-sm">
            {!hasPublishableChanges ? (
              <div className="text-gray-500">
                No changes to publish
              </div>
            ) : mode === 'archetype-master' ? (
              <div className="text-gray-600">
                <span className="font-medium">{allChangedSections.size}</span> section{allChangedSections.size !== 1 ? 's' : ''} will be published to{archetypeName ? ` "${archetypeName}"` : ' Master'}
                {effectiveAffectedPagesCount > 0 && (
                  <span className="text-amber-600 ml-1">
                    (affects {effectiveAffectedPagesCount} {effectiveAffectedPagesCount === 1 ? labels.singularLower : labels.pluralLower})
                  </span>
                )}
              </div>
            ) : mode === 'archetype' ? (
              <>
                <div className="text-gray-600 space-y-1">
                  {/* Show sync summary if any */}
                  {resetZones.length > 0 && (
                    <div>
                      <span className="font-medium text-indigo-600">{resetZones.filter(z => choices.get(z) === 'local').length}</span>
                      <span className="text-gray-500"> sync{resetZones.filter(z => choices.get(z) === 'local').length !== 1 ? 's' : ''} confirmed</span>
                      {resetZones.filter(z => choices.get(z) === 'discard').length > 0 && (
                        <span className="text-gray-500">, <span className="font-medium text-red-500">{resetZones.filter(z => choices.get(z) === 'discard').length}</span> kept modified</span>
                      )}
                    </div>
                  )}
                  {/* Show new changes summary if any */}
                  {changeZones.length > 0 && (
                    <div>
                      <span className="font-medium text-blue-600">{changeZones.filter(z => choices.get(z) === 'local').length}</span>
                      <span className="text-gray-500"> for this {labels.singularLower}</span>
                      {changeZones.filter(z => choices.get(z) === 'archetype').length > 0 && (
                        <span className="text-gray-500">, <span className="font-medium text-green-600">{changeZones.filter(z => choices.get(z) === 'archetype').length}</span> to all {labels.pluralLower}</span>
                      )}
                      {changeZones.filter(z => choices.get(z) === 'discard').length > 0 && (
                        <span className="text-gray-500">, <span className="font-medium text-red-500">{changeZones.filter(z => choices.get(z) === 'discard').length}</span> discarded</span>
                      )}
                    </div>
                  )}
                </div>
                {archetypeCount > 0 && effectiveAffectedPagesCount > 0 && (
                  <div className="flex items-center gap-1 text-amber-600 mt-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span className="text-xs">
                      {effectiveAffectedPagesCount} other {labels.pluralLower} will be affected
                    </span>
                  </div>
                )}
              </>
            ) : (
              <div className="text-gray-600">
                <span className="font-medium">{totalChangeCount}</span> change{totalChangeCount !== 1 ? 's' : ''} will be published
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {onDiscard && hasPublishableChanges && (
              <button
                onClick={handleDiscard}
                className="px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-md hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Discard Changes
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePublish}
              disabled={!hasPublishableChanges}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
                !hasPublishableChanges
                  ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                  : 'text-white bg-green-600 hover:bg-green-700'
              }`}
            >
              <Save className="w-4 h-4" />
              {mode === 'archetype-master' 
                ? `Publish to ${effectiveAffectedPagesCount > 0 ? `${effectiveAffectedPagesCount} ${labels.plural}` : `All ${labels.plural}`}`
                : 'Publish & View Live'
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

