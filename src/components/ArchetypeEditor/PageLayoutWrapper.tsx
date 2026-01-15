/**
 * PageLayoutWrapper - Wraps sections in page layout structure
 * Handles full_width, left_rail, and right_rail layouts
 * Separates sections into main content and sidebar zones
 * 
 * IMPORTANT: Zone-Based Rendering (By Design)
 * -------------------------------------------
 * Sections on archetype-based pages (Journal Home, Issue TOC, Article) are 
 * grouped and rendered by their zoneSlug, NOT by their position in the 
 * canvasItems array. This means:
 * 
 * 1. hero_primary zones ALWAYS render before body_main zones
 * 2. body_main zones ALWAYS render before sidebar zones
 * 3. Drag-and-drop or up/down arrows change the array order but NOT the 
 *    visual order (because zones have fixed semantic positions)
 * 
 * This is intentional - archetype pages define a semantic structure where
 * zones have fixed positions. To reorder zones visually, modify the zone
 * definitions in the archetype, not the section order.
 * 
 * For non-archetype pages (custom pages, stubs), sections render in array
 * order since they don't have zoneSlug assignments.
 */

import React from 'react'
import type { WidgetSection } from '../../types/widgets'
import type { PageConfig } from '../../types/archetypes'
import { SectionRenderer } from '../Sections/SectionRenderer'
import { SortableItem } from '../Canvas/SortableItem'
import { createDebugLogger } from '../../utils/logger'

// Control logging for this file
const DEBUG = false
const debugLog = createDebugLogger(DEBUG)

interface PageLayoutWrapperProps {
  sections: WidgetSection[]
  pageConfig?: PageConfig
  showMockData?: boolean
  // Pass through all SectionRenderer props
  onWidgetClick?: (id: string, e: React.MouseEvent) => void
  dragAttributes?: any
  dragListeners?: any
  activeSectionToolbar?: string | null
  setActiveSectionToolbar?: (value: string | null) => void
  activeWidgetToolbar?: string | null
  setActiveWidgetToolbar?: (value: string | null) => void
  activeDropZone?: string | null
  showToast?: (message: string, type: 'success' | 'error') => void
  usePageStore?: any
  journalContext?: string
  websiteId?: string
  isLiveMode?: boolean
  // Editor mode props
  handleAddSection?: (itemId: string, position: 'above' | 'below') => void
  handleSectionClick?: (id: string) => void
  selectedWidget?: string | null
  InteractiveWidgetRenderer?: any
  // Page Instance props (for inheritance system)
  pageInstanceMode?: boolean
  pageInstance?: import('../../types/archetypes').PageInstance
  onPageInstanceChange?: () => void
  // Replace Zone feature
  canReplaceZone?: boolean
  onReplaceZone?: (zoneSlug: string) => void
  onReplaceSectionLayout?: (sectionId: string) => void
}

/**
 * Zone slugs that belong to the sidebar
 */
const SIDEBAR_ZONES = ['sidebar_primary', 'sidebar_ads']

/**
 * Zone slugs that should be full width (outside the grid)
 */
const FULL_WIDTH_ZONES = ['hero_primary', 'header_local', 'header_global', 'footer_legal', 'alert_banner']

/**
 * Zone slugs that contain their own layout (like body_main with one-third-right)
 */
const SELF_CONTAINED_ZONES = ['body_main']

export function PageLayoutWrapper({
  sections,
  pageConfig,
  showMockData = true,
  onWidgetClick,
  dragAttributes,
  dragListeners,
  activeSectionToolbar,
  setActiveSectionToolbar,
  activeWidgetToolbar,
  setActiveWidgetToolbar,
  activeDropZone,
  showToast,
  usePageStore,
  journalContext,
  websiteId,
  isLiveMode = false,
  handleAddSection,
  handleSectionClick,
  selectedWidget,
  InteractiveWidgetRenderer,
  pageInstanceMode = false,
  pageInstance,
  onPageInstanceChange,
  canReplaceZone = false,
  onReplaceZone,
  onReplaceSectionLayout
}: PageLayoutWrapperProps) {
  const layout = pageConfig?.layout || 'full_width'
  
  
  // Separate sections by zone type
  const fullWidthSections: WidgetSection[] = []
  const mainContentSections: WidgetSection[] = []
  const sidebarSections: WidgetSection[] = []
  
  sections.forEach(section => {
    const zoneSlug = section.zoneSlug
    
    if (!zoneSlug || FULL_WIDTH_ZONES.includes(zoneSlug)) {
      // Full width sections (hero, header, footer, alerts)
      fullWidthSections.push(section)
    } else if (SELF_CONTAINED_ZONES.includes(zoneSlug)) {
      // Sections that have their own layout (like body_main with one-third-right)
      // These should be rendered directly without additional wrapping
      mainContentSections.push(section)
    } else if (SIDEBAR_ZONES.includes(zoneSlug)) {
      // Sidebar sections
      sidebarSections.push(section)
    } else {
      // Main content sections (body_feed, body_featured, etc.)
      mainContentSections.push(section)
    }
  })
  
  
  // Render a single section (with SortableItem wrapper in editor mode)
  const renderSection = (section: WidgetSection) => {
    debugLog('log', '🔍 [PageLayoutWrapper.renderSection] Called:', {
      sectionId: section.id,
      sectionName: section.name,
      isLiveMode,
      journalContext
    })
    
    if (isLiveMode) {
      // Live mode: render directly
      return (
        <SectionRenderer
          key={section.id}
          section={section}
          onWidgetClick={onWidgetClick}
          dragAttributes={dragAttributes}
          dragListeners={dragListeners}
          activeSectionToolbar={activeSectionToolbar}
          setActiveSectionToolbar={setActiveSectionToolbar}
          activeWidgetToolbar={activeWidgetToolbar}
          setActiveWidgetToolbar={setActiveWidgetToolbar}
          activeDropZone={activeDropZone}
          showToast={showToast}
          usePageStore={usePageStore}
          journalContext={journalContext}
          websiteId={websiteId}
          isLiveMode={isLiveMode}
          showMockData={showMockData}
          pageInstanceMode={pageInstanceMode}
          pageInstance={pageInstance}
          onPageInstanceChange={onPageInstanceChange}
        />
      )
    } else {
      // Editor mode: wrap in SortableItem for drag-and-drop
      return (
        <div key={section.id} className="relative group">
          {/* Add Section Button Above */}
          {section.id !== 'header-section' && handleAddSection && (
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleAddSection(section.id, 'above')
                }}
                className="px-3 py-1 bg-white border border-gray-300 text-gray-600 text-sm rounded-md hover:bg-gray-50 transition-colors"
                type="button"
              >
                Add Section
              </button>
            </div>
          )}
          
          <SortableItem 
            item={section} 
            isSelected={selectedWidget === section.id}
            onSectionClick={handleSectionClick || (() => {})}
            onWidgetClick={onWidgetClick || (() => {})}
            activeSectionToolbar={activeSectionToolbar}
            setActiveSectionToolbar={setActiveSectionToolbar || (() => {})}
            activeWidgetToolbar={activeWidgetToolbar}
            setActiveWidgetToolbar={setActiveWidgetToolbar || (() => {})}
            activeDropZone={activeDropZone}
            showToast={showToast || (() => {})}
            usePageStore={usePageStore}
            InteractiveWidgetRenderer={InteractiveWidgetRenderer}
            journalContext={journalContext}
            showMockData={showMockData}
            pageInstanceMode={pageInstanceMode}
            pageInstance={pageInstance}
            onPageInstanceChange={onPageInstanceChange}
            canReplaceZone={canReplaceZone}
            onReplaceZone={onReplaceZone}
            onReplaceSectionLayout={onReplaceSectionLayout}
          />
          
          {/* Add Section Button Below */}
          {handleAddSection && (
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleAddSection(section.id, 'below')
                }}
                className="px-3 py-1 bg-white border border-gray-300 text-gray-600 text-sm rounded-md hover:bg-gray-50 transition-colors"
                type="button"
              >
                Add Section
              </button>
            </div>
          )}
        </div>
      )
    }
  }
  
  // Render full width sections
  const renderFullWidthSections = () => (
    <>
      {fullWidthSections.map(section => renderSection(section))}
    </>
  )
  
  // Render main content sections
  const renderMainContent = () => (
    <>
      {mainContentSections.map(section => renderSection(section))}
    </>
  )
  
  // Render sidebar sections
  const renderSidebar = () => (
    <>
      {sidebarSections.map(section => renderSection(section))}
    </>
  )
  
  // Check if we have self-contained sections (like body_main with one-third-right layout)
  // If so, render them directly without additional wrapping - they already have their layout
  const hasSelfContainedSections = mainContentSections.some(s => 
    SELF_CONTAINED_ZONES.includes(s.zoneSlug || '')
  )
  
  // If sections have their own layout (like body_main with one-third-right), render directly
  // The layout is already built into the section structure in the archetype JSON
  if (hasSelfContainedSections) {
    return (
      <>
        {renderFullWidthSections()}
        {renderMainContent()}
        {renderSidebar()}
      </>
    )
  }
  
  // Full width layout - all sections stacked (no wrapper section needed)
  if (layout === 'full_width') {
    return (
      <>
        {renderFullWidthSections()}
        {renderMainContent()}
        {renderSidebar()}
      </>
    )
  }
  
  // For rail layouts without self-contained sections, we shouldn't get here
  // because the archetype should have the layout built into the section
  // But keep this as fallback
  return (
    <>
      {renderFullWidthSections()}
      {renderMainContent()}
      {renderSidebar()}
    </>
  )
}

