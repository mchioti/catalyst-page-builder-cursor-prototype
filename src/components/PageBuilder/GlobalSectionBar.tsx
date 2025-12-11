/**
 * GlobalSectionBar - Collapsible header/footer bar for the editor canvas
 * 
 * Design goals:
 * - Subtle and minimal when collapsed
 * - Expands to show actual section content
 * - 3-dot dropdown for: Global, Edit for Page, Hide on Page, Discard Override
 * - Sections are editable when expanded (click widgets to edit)
 * - NO delete/move - headers are managed via Website Settings
 */

import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, ChevronUp, Globe, EyeOff, FileText, MoreVertical } from 'lucide-react'
import { SectionRenderer } from '../Sections/SectionRenderer'
import type { CanvasItem, WidgetSection } from '../../types'

type OverrideMode = 'global' | 'hide' | 'page-edit'

interface GlobalSectionBarProps {
  type: 'header' | 'footer'
  sections: CanvasItem[]
  isEnabled: boolean
  websiteId: string
  pageId: string
  usePageStore: any
  onToggleVisibility?: () => void
  onWidgetClick?: (widgetId: string, e: React.MouseEvent) => void
  selectedWidget?: string | null
  activeWidgetToolbar?: string | null
  setActiveWidgetToolbar?: (id: string | null) => void
  overrideMode?: OverrideMode
  onOverrideModeChange?: (mode: OverrideMode) => void
}

export function GlobalSectionBar({
  type,
  sections,
  isEnabled,
  websiteId,
  pageId,
  usePageStore,
  onToggleVisibility,
  onWidgetClick,
  selectedWidget,
  activeWidgetToolbar,
  setActiveWidgetToolbar,
  overrideMode = 'global',
  onOverrideModeChange
}: GlobalSectionBarProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [activeSectionToolbar, setActiveSectionToolbar] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  // Get store actions for global section updates
  const deleteWidgetFromSiteLayout = usePageStore((state: any) => state.deleteWidgetFromSiteLayout)
  const setPageCanvas = usePageStore((state: any) => state.setPageCanvas)
  
  const isHeader = type === 'header'
  const label = isHeader ? 'Header' : 'Footer'
  const isPageEdit = overrideMode === 'page-edit'
  
  // Get page-specific sections if in page-edit mode
  const pageKey = `${type}-${pageId}`
  const storeKey = `${websiteId}:${pageKey}`
  const pageCanvasData = usePageStore((state: any) => state.pageCanvasData || {})
  const deletePageCanvas = usePageStore((state: any) => state.deletePageCanvas)
  const pageSections = pageCanvasData[storeKey]
  const hasPageOverride = !!pageSections && pageSections.length > 0
  
  // Count other pages with overrides
  const otherPagesWithOverrides = Object.keys(pageCanvasData).filter(key => {
    const [ws, rest] = key.split(':')
    return ws === websiteId && rest?.startsWith(`${type}-`) && rest !== pageKey
  }).length
  
  // Display sections: page-specific if in page-edit mode and exists, else global
  const displaySections = (isPageEdit && pageSections) ? pageSections : sections
  const hasContent = displaySections && displaySections.length > 0
  
  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  // Check if any widget in this section is selected
  const hasSelectedWidget = selectedWidget && displaySections?.some((section: CanvasItem) => {
    const sec = section as any
    return sec.areas?.some((area: any) => 
      area.widgets?.some((w: any) => w.id === selectedWidget)
    )
  })
  
  // Dropdown options based on current mode
  const getDropdownOptions = () => {
    switch (overrideMode) {
      case 'global':
        if (hasPageOverride) {
          return [
            { value: 'page-edit', label: 'View Page Override', desc: 'Edit existing page-specific version', icon: <FileText className="w-4 h-4 text-blue-500" /> },
            { value: 'discard', label: 'Discard Page Override', desc: 'Delete page version, use global', icon: <Globe className="w-4 h-4 text-red-500" /> },
            { value: 'hide', label: 'Hide on Page', desc: 'Hide for this page only', icon: <EyeOff className="w-4 h-4 text-gray-500" /> }
          ]
        }
        return [
          { value: 'hide', label: 'Hide on Page', desc: 'Hide for this page only', icon: <EyeOff className="w-4 h-4 text-gray-500" /> },
          { value: 'page-edit', label: 'Edit for This Page', desc: 'Create page-specific version', icon: <FileText className="w-4 h-4 text-gray-500" /> }
        ]
      case 'hide':
        return [
          { value: 'global', label: `Show ${label}`, desc: 'Use site-wide default', icon: <Globe className="w-4 h-4 text-gray-500" /> },
          { value: 'page-edit', label: 'Edit for This Page', desc: 'Page-specific modifications', icon: <FileText className="w-4 h-4 text-gray-500" /> }
        ]
      case 'page-edit':
        return [
          { value: 'global', label: `Use Global ${label}`, desc: 'Switch to global (keep page copy)', icon: <Globe className="w-4 h-4 text-gray-500" /> },
          { value: 'discard', label: 'Discard Changes', desc: 'Delete page copy, use global', icon: <Globe className="w-4 h-4 text-red-500" /> },
          { value: 'hide', label: 'Hide on Page', desc: 'Hide for this page only', icon: <EyeOff className="w-4 h-4 text-gray-500" /> }
        ]
      default:
        return []
    }
  }
  
  const dropdownOptions = getDropdownOptions()
  
  // Handle dropdown option click
  const handleOptionClick = (value: string) => {
    if (value === 'discard') {
      if (deletePageCanvas && confirm(`Discard custom ${label.toLowerCase()} for this page? This cannot be undone.`)) {
        deletePageCanvas(websiteId, pageKey)
        onOverrideModeChange?.('global')
      }
    } else if (value === 'page-edit' && !pageSections && sections && setPageCanvas) {
      // Switching to page-edit with no existing override - copy global first
      const copiedSections = JSON.parse(JSON.stringify(sections)) // Deep clone
      setPageCanvas(websiteId, pageKey, copiedSections)
      onOverrideModeChange?.('page-edit')
    } else {
      onOverrideModeChange?.(value as OverrideMode)
    }
    setShowDropdown(false)
  }
  
  // Don't show if disabled at site level
  if (!isEnabled) {
    return (
      <div className={`
        flex items-center justify-center gap-2 py-1.5 px-4
        ${isHeader ? 'border-b' : 'border-t'} border-dashed border-gray-200
        bg-gray-50/50 text-gray-400 text-xs
      `}>
        <EyeOff className="w-3 h-3" />
        <span>Global {label} disabled</span>
        {onToggleVisibility && (
          <button onClick={onToggleVisibility} className="ml-2 text-blue-500 hover:text-blue-600 hover:underline">
            Enable
          </button>
        )}
      </div>
    )
  }
  
  // Show hidden state
  if (overrideMode === 'hide') {
    return (
      <div className={`
        flex items-center justify-between py-1.5 px-4
        ${isHeader ? 'border-b' : 'border-t'} border-dashed border-red-200
        bg-red-50/50 text-red-500 text-xs
      `}>
        <div className="flex items-center gap-2">
          <EyeOff className="w-3 h-3" />
          <span>{label} hidden on this page</span>
        </div>
        <button 
          onClick={() => onOverrideModeChange?.('global')}
          className="text-blue-500 hover:text-blue-600 hover:underline"
        >
          Show {label}
        </button>
      </div>
    )
  }
  
  return (
    <div className={`
      ${isHeader ? 'border-b' : 'border-t'}
      ${isExpanded ? 'border-gray-300' : 'border-transparent'}
      transition-all duration-200
    `}>
      {/* Collapsed Bar - Click to expand (using div to avoid nested buttons) */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setIsExpanded(!isExpanded)}
        className={`
          w-full flex items-center justify-between gap-3 py-1.5 px-4 cursor-pointer
          ${isExpanded 
            ? isPageEdit
              ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
              : 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200'
            : 'bg-gradient-to-r from-gray-50/80 to-slate-50/80 hover:from-amber-50/50 hover:to-orange-50/50'
          }
          ${isHeader ? 'border-b' : 'border-t'}
          border-dashed
          transition-all duration-200
          group
        `}
      >
        {/* Left: Icon + Label */}
        <div className="flex items-center gap-2">
          {isPageEdit ? (
            <FileText className={`w-3 h-3 ${isExpanded ? 'text-blue-600' : 'text-blue-400'}`} />
          ) : (
            <Globe className={`w-3 h-3 ${isExpanded ? 'text-amber-600' : 'text-gray-400 group-hover:text-amber-500'}`} />
          )}
          <span className={`text-xs font-medium ${
            isPageEdit 
              ? (isExpanded ? 'text-blue-700' : 'text-blue-600')
              : (isExpanded ? 'text-amber-700' : 'text-gray-500 group-hover:text-amber-600')
          }`}>
            {label}
          </span>
          <span className={`text-xs ${isPageEdit ? 'text-blue-500' : (isExpanded ? 'text-amber-500' : 'text-gray-400')}`}>
            {isPageEdit ? '(This Page)' : '(Global)'}
          </span>
          
          {/* Badge: Page override exists but showing global */}
          {!isPageEdit && hasPageOverride && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded text-xs">
              <FileText className="w-3 h-3" />
              Page override exists
            </span>
          )}
          
          {/* Badge: Other pages have overrides */}
          {!isPageEdit && isExpanded && otherPagesWithOverrides > 0 && (
            <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-xs">
              ⚠️ {otherPagesWithOverrides} page{otherPagesWithOverrides > 1 ? 's' : ''} have overrides
            </span>
          )}
        </div>
        
        {/* Right: Dropdown + Chevron */}
        <div className="flex items-center gap-3">
          {/* 3-dot dropdown */}
          {onOverrideModeChange && (
            <div ref={dropdownRef} className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowDropdown(!showDropdown)
                }}
                className={`
                  flex items-center gap-1 px-2 py-0.5 rounded text-xs
                  ${isPageEdit ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}
                  hover:opacity-80 transition-opacity
                `}
              >
                {isPageEdit ? 'This Page' : 'Global'}
                <MoreVertical className="w-3 h-3" />
              </button>
              
              {showDropdown && (
                <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                  {dropdownOptions.map((option: any) => (
                    <button
                      key={option.value}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleOptionClick(option.value)
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 ${
                        option.value === 'discard' ? 'hover:bg-red-50' : ''
                      }`}
                    >
                      {option.icon}
                      <div className="flex-1">
                        <div className={`text-sm font-medium ${option.value === 'discard' ? 'text-red-600' : 'text-gray-800'}`}>
                          {option.label}
                        </div>
                        <div className="text-xs text-gray-500">{option.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {!hasContent && (
            <span className="text-xs text-gray-400 italic">Not configured</span>
          )}
          {isExpanded ? (
            <ChevronUp className={`w-4 h-4 ${isPageEdit ? 'text-blue-500' : 'text-amber-500'}`} />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-amber-500" />
          )}
        </div>
      </div>
      
      {/* Expanded Content */}
      {isExpanded && (
        <div className="relative">
          {/* Accent line */}
          <div className={`
            absolute ${isHeader ? 'top-0' : 'bottom-0'} left-0 right-0 h-0.5
            ${isPageEdit 
              ? 'bg-gradient-to-r from-blue-300 via-indigo-300 to-blue-300'
              : 'bg-gradient-to-r from-amber-300 via-orange-300 to-amber-300'
            }
          `} />
          
          {hasContent ? (
            <div className="relative">
              {/* Edit mode indicator */}
              <div className={`flex items-center justify-between px-4 py-1.5 text-xs ${
                isPageEdit 
                  ? 'bg-blue-50 border-b border-blue-100 text-blue-700' 
                  : 'bg-amber-50 border-b border-amber-100 text-amber-700'
              }`}>
                <span>
                  {isPageEdit 
                    ? '✏️ Editing for this page only — changes are page-specific' 
                    : '⚠️ Editing globally — changes affect ALL pages'
                  }
                </span>
                <span className="text-gray-500 text-xs">
                  Click widgets to edit properties
                </span>
              </div>
              
              {/* Render sections - highlight if widget selected */}
              <div className={`${hasSelectedWidget ? 'ring-2 ring-inset ' + (isPageEdit ? 'ring-blue-300' : 'ring-amber-300') : ''}`}>
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
                      if (isPageEdit && pageSections && setPageCanvas) {
                        // Page-edit mode: delete from page-specific copy
                        const updatedSections = pageSections.map((section: any) => ({
                          ...section,
                          areas: section.areas?.map((area: any) => ({
                            ...area,
                            widgets: area.widgets?.filter((w: any) => w.id !== widgetId)
                          }))
                        }))
                        setPageCanvas(websiteId, pageKey, updatedSections)
                      } else if (deleteWidgetFromSiteLayout) {
                        // Global mode: delete from siteLayout
                        deleteWidgetFromSiteLayout(websiteId, type, widgetId)
                      }
                    }}
                    // === Permission flags for global sections ===
                    canDeleteSection={false}    // Can't delete header/footer section
                    canReorderSection={false}   // Header always first, footer always last
                    canDuplicateSection={false} // Doesn't make sense for global sections
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
