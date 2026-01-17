/**
 * GlobalSectionBar - Collapsible header/footer bar for the editor canvas
 * 
 * Design goals:
 * - Subtle and minimal when collapsed
 * - Expands to show actual section content
 * - Header/Footer configuration lives in the Properties Panel (avoid duplicated actions)
 * - Sections are editable when expanded (click widgets to edit)
 * - NO delete/move - headers are managed via Website Settings
 */

import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, ChevronUp, Globe, EyeOff } from 'lucide-react'
import { SectionRenderer } from '../Sections/SectionRenderer'
import type { CanvasItem, WidgetSection } from '../../types'
import { getGlobalRegionSelectionId } from '../../utils/globalRegionSelection'
import { getSiteLayoutDraftKey } from '../../utils/pageShellDraftKeys'

type OverrideMode = 'global' | 'hide' | 'page-edit'

interface GlobalSectionBarProps {
  type: 'header' | 'footer'
  sections: CanvasItem[]
  websiteId: string
  pageId: string
  usePageStore: any
  onWidgetClick?: (widgetId: string, e: React.MouseEvent) => void
  selectedWidget?: string | null
  activeSectionToolbar?: string | null
  setActiveSectionToolbar?: (id: string | null) => void
  activeWidgetToolbar?: string | null
  setActiveWidgetToolbar?: (id: string | null) => void
  overrideMode?: OverrideMode
  onOverrideModeChange?: (mode: OverrideMode) => void
  onReplacePageShell?: (region: 'header' | 'footer') => void
}

export function GlobalSectionBar({
  type,
  sections,
  websiteId,
  pageId,
  usePageStore,
  onWidgetClick,
  selectedWidget,
  activeSectionToolbar,
  setActiveSectionToolbar,
  activeWidgetToolbar,
  setActiveWidgetToolbar,
  overrideMode = 'global',
  onOverrideModeChange,
  onReplacePageShell
}: GlobalSectionBarProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const selectWidget = usePageStore((state: any) => state.selectWidget)
  
  // Get store actions for global section updates
  const setPageDraft = usePageStore((state: any) => state.setPageDraft)
  const getPageDraft = usePageStore((state: any) => state.getPageDraft)
  const websites = usePageStore((state: any) => state.websites || [])
  const getSiteLayoutDraftSettings = usePageStore((state: any) => state.getSiteLayoutDraftSettings)
  
  const isHeader = type === 'header'
  const label = isHeader ? 'Header' : 'Footer'
  const isPageEdit = overrideMode === 'page-edit'
  
  // Get current website and check if header/footer is globally enabled
  const website = websites.find((w: any) => w.id === websiteId)
  const siteLayout = website?.siteLayout || {}
  const draftSiteLayoutSettings = getSiteLayoutDraftSettings ? getSiteLayoutDraftSettings(websiteId) : null
  const isGloballyEnabled = isHeader 
    ? (draftSiteLayoutSettings?.headerEnabled ?? siteLayout.headerEnabled) !== false
    : (draftSiteLayoutSettings?.footerEnabled ?? siteLayout.footerEnabled) !== false
  
  // Page-specific sections exist when overrideMode === 'page-edit'.
  const pageKey = `${type}-${pageId}`
  const storeKey = `${websiteId}:${pageKey}`
  const pageCanvasData = usePageStore((state: any) => state.pageCanvasData || {})
  const pageSections = pageCanvasData[storeKey]
  const hasPageOverride = !!pageSections && pageSections.length > 0
  const draftSections = isPageEdit && getPageDraft ? getPageDraft(websiteId, pageKey) : null
  const hasDraftOverride = Array.isArray(draftSections) && draftSections.length > 0
  const hasAnyPageCustomization = hasPageOverride || hasDraftOverride || isPageEdit
  
  // Count other pages with overrides
  const otherPagesWithOverrides = Object.keys(pageCanvasData).filter(key => {
    const [ws, rest] = key.split(':')
    return ws === websiteId && rest?.startsWith(`${type}-`) && rest !== pageKey
  }).length
  
  // Display sections: page-specific only when explicitly in page-edit mode; otherwise show global.
  const displaySections =
    isPageEdit && (hasDraftOverride || hasPageOverride)
      ? (hasDraftOverride ? draftSections : pageSections)
      : sections
  const hasContent = displaySections && displaySections.length > 0
  
  // Check if any widget in this section is selected
  const hasSelectedWidget = selectedWidget && displaySections?.some((section: CanvasItem) => {
    const sec = section as any
    return sec.areas?.some((area: any) => 
      area.widgets?.some((w: any) => w.id === selectedWidget)
    )
  })
  
  return (
    <div className={`
      ${isHeader ? 'border-b' : 'border-t'}
      ${isExpanded ? 'border-gray-300' : 'border-transparent'}
      transition-all duration-200
    `}>
      {/* Collapsed Bar - Click to expand (using div to avoid nested buttons) */}
      <div
        onClick={(e) => {
          // Prevent the editor canvas click handler from clearing selection.
          // We want the Header/Footer region selection to persist so the properties panel
          // can show Header/Footer properties.
          e.preventDefault()
          e.stopPropagation()
          // Selecting the "Header" / "Footer" (as a region) enables a dedicated properties panel.
          // This is separate from selecting widgets inside the header/footer.
          setActiveSectionToolbar?.(null)
          selectWidget?.(getGlobalRegionSelectionId(type))
          setIsExpanded(!isExpanded)
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            selectWidget?.(getGlobalRegionSelectionId(type))
            setIsExpanded(!isExpanded)
          }
        }}
        className={`
          w-full flex items-center justify-between gap-3 py-1.5 px-4 cursor-pointer
          ${isExpanded 
            ? 'bg-gray-100 border-gray-300'
            : 'bg-gray-50 hover:bg-gray-100'
          }
          ${isHeader ? 'border-b' : 'border-t'}
          border-dashed border-gray-200
          transition-all duration-200
          group
        `}
      >
        {/* Left: Icon + Label */}
        <div className="flex items-center gap-2">
          {!isGloballyEnabled || overrideMode === 'hide' ? (
            <EyeOff className="w-3 h-3 text-red-500" />
          ) : (
            <Globe className={`w-3 h-3 ${isExpanded ? 'text-gray-700' : 'text-gray-400'}`} />
          )}
          <span className={`text-xs font-medium ${isExpanded ? 'text-gray-900' : 'text-gray-600'}`}>
            {label}
          </span>
          {/* Status badge */}
          <span className={`text-xs px-1.5 py-0.5 rounded ${
            !isGloballyEnabled
              ? 'bg-red-100 text-red-700'
              : overrideMode === 'hide'
                ? 'bg-amber-100 text-amber-700'
                : hasPageOverride
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600'
          }`}>
            {!isGloballyEnabled
              ? 'Disabled'
              : overrideMode === 'hide'
                ? 'Hidden on this page'
                : hasPageOverride
                  ? 'Override'
                  : 'Global'}
          </span>
        </div>
        
        {/* Right: Chevron */}
        <div className="flex items-center gap-3">
          {!hasContent && (
            <span className="text-xs text-gray-400 italic">Not configured</span>
          )}
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </div>
      
      {/* Expanded Content */}
      {isExpanded && (
        <div
          className="relative"
          onClick={(e) => {
            // Clicking anywhere in the expanded header/footer chrome should keep the
            // Header/Footer properties in focus (avoid falling back to Page properties).
            e.preventDefault()
            e.stopPropagation()
            selectWidget?.(getGlobalRegionSelectionId(type))
          }}
        >
          {/* Accent line */}
          <div className={`
            absolute ${isHeader ? 'top-0' : 'bottom-0'} left-0 right-0 h-0.5 bg-blue-400
          `} />
          
          {hasContent ? (
            <div className="relative">
              {/* Edit mode indicator */}
              <div
                className="flex items-center justify-between px-4 py-1.5 text-xs bg-gray-50 border-b border-gray-200 text-gray-600"
                onClick={(e) => {
                  // Same behavior as the header/footer bar: keep region selected.
                  e.preventDefault()
                  e.stopPropagation()
                  selectWidget?.(getGlobalRegionSelectionId(type))
                }}
              >
                <span>
                  Edits saved as draft • Choose scope at Save & Publish
                </span>
                <span className="text-gray-400">
                  Click widgets to edit
                </span>
              </div>
              
              {/* Render sections - highlight if widget selected */}
              <div className={`${hasSelectedWidget ? 'ring-2 ring-inset ring-blue-300' : ''}`}>
                {displaySections?.map((section: CanvasItem, idx: number) => (
                  <SectionRenderer
                    key={section.id || idx}
                    section={section as WidgetSection}
                    onWidgetClick={onWidgetClick || (() => {})}
                    dragAttributes={{}}
                    dragListeners={{}}
                    activeSectionToolbar={activeSectionToolbar}
                    setActiveSectionToolbar={setActiveSectionToolbar}
                    activeWidgetToolbar={activeWidgetToolbar || null}
                    setActiveWidgetToolbar={setActiveWidgetToolbar || (() => {})}
                    activeDropZone={null}
                    showToast={() => {}}
                    usePageStore={usePageStore}
                    isLiveMode={false}
                    websiteId={websiteId}
                    isGlobalSection={type}
                    // === Callback injection for global sections ===
                    onDeleteWidget={(widgetId) => {
                      if (isPageEdit && setPageDraft) {
                        // Page-edit mode: delete from DRAFT page-specific copy (commit via Save & Publish)
                        const baseSections =
                          (hasDraftOverride ? draftSections : pageSections) ||
                          JSON.parse(JSON.stringify(sections))
                        const updatedSections = (baseSections || []).map((section: any) => ({
                          ...section,
                          areas: section.areas?.map((area: any) => ({
                            ...area,
                            widgets: area.widgets?.filter((w: any) => w.id !== widgetId)
                          }))
                        }))
                        setPageDraft(websiteId, pageKey, updatedSections)
                      } else if (setPageDraft) {
                        // Global mode (DRAFT): delete from the website-level page shell draft.
                        // This ensures Preview shows it and Save & Publish decides scope/commit.
                        const draftKey = getSiteLayoutDraftKey(type)
                        const baseSections =
                          (getPageDraft ? getPageDraft(websiteId, draftKey) : null) ||
                          JSON.parse(JSON.stringify(sections))
                        const updatedSections = (baseSections || []).map((section: any) => ({
                          ...section,
                          areas: section.areas?.map((area: any) => ({
                            ...area,
                            widgets: area.widgets?.filter((w: any) => w.id !== widgetId)
                          }))
                        }))
                        setPageDraft(websiteId, draftKey, updatedSections)
                      }
                    }}
                    // === Permission flags for global sections ===
                    canDeleteSection={false}    // Can't delete header/footer section
                    canReorderSection={false}   // Header always first, footer always last
                    canDuplicateSection={false} // Doesn't make sense for global sections
                    // Use the existing section toolbar handler, but wire Replace to page-shell replacement.
                    canReplaceZone={true}
                    onReplaceSectionLayout={() => onReplacePageShell?.(type)}
                    onToggleSectionVisibility={() => {
                      if (!onOverrideModeChange) return
                      if (overrideMode === 'hide') {
                        onOverrideModeChange(hasAnyPageCustomization ? 'page-edit' : 'global')
                      } else {
                        onOverrideModeChange('hide')
                      }
                    }}
                    isSectionHidden={overrideMode === 'hide'}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="py-8 px-4 text-center bg-gray-50">
              <p className="text-sm text-gray-500 mb-2">
                No {label.toLowerCase()} configured for this website
              </p>
              <a 
                href="/v1"
                className="text-xs text-blue-500 hover:text-blue-600 hover:underline"
              >
                Configure in Website Settings →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
