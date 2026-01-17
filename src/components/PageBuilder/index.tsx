/**
 * ============================================================================
 * DRAG & DROP ARCHITECTURE DOCUMENTATION
 * ============================================================================
 * 
 * CRITICAL: This file implements the core drag-and-drop functionality using
 * @dnd-kit/core. Changes to DOM structure, CSS layout, or hook usage can
 * break DnD. Always run smoke tests after modifications.
 * 
 * ROOT CAUSE OF PAST REGRESSIONS:
 * --------------------------------
 * 1. DOM Structure Changes: Adding grid gaps, nested divs, or spacing tokens
 *    can confuse dnd-kit's collision detection. Always test DnD after theme/
 *    layout changes.
 * 
 * 2. SortableContext Misuse: Using SortableContext with useDraggable (instead
 *    of useSortable) prevents cross-area and cross-section moves. We DON'T
 *    use SortableContext in SectionRenderer for this reason.
 * 
 * 3. Missing Drop Targets: Widgets must be both draggable AND droppable to
 *    enable precise positioning. See DraggableWidgetInSection in 
 *    SectionRenderer.tsx.
 * 
 * HOW IT WORKS:
 * -------------
 * 1. **Library Widgets** (DraggableLibraryWidget.tsx):
 *    - Type: 'library-widget'
 *    - Click: Auto-creates one-column section with widget inside
 *    - Drag: Uses customCollisionDetection to find target section/area
 * 
 * 2. **Canvas Widgets** (SectionRenderer.tsx > DraggableWidgetInSection):
 *    - Type: 'section-widget'
 *    - Uses useDraggable for drag capability
 *    - Uses useDroppable to become a drop target (enables precise positioning)
 *    - Can move within same area, across areas, or across sections
 * 
 * 3. **Section Areas** (SectionRenderer.tsx):
 *    - Type: 'section-area'
 *    - Droppable zones for widgets
 *    - Multiple areas in multi-column layouts
 * 
 * 4. **Collision Detection** (customCollisionDetection below):
 *    - Priority order:
 *      a. tab-panel (for tabs widget) & collapse-panel (for collapse/accordion widget)
 *      b. widget-target (for precise positioning)
 *      c. section-area (for area drops)
 *      d. closestCenter (fallback)
 *    - This order is CRITICAL - changing it breaks precise positioning
 * 
 * 5. **handleDragEnd** (main logic):
 *    - Detects drop type (library→canvas, widget→widget, widget→area)
 *    - Auto-creates sections for library widgets
 *    - Finds precise insertion point for widget→widget drops
 *    - Moves widgets between areas/sections for widget→area drops
 * 
 * TEST COVERAGE:
 * --------------
 * - Smoke tests: tests/smoke.test.js (3 critical tests)
 * - Comprehensive: tests/drag-and-drop.test.js (13 scenarios)
 * - Always run: npm run test:smoke before committing
 * 
 * DATA ATTRIBUTES FOR TESTING:
 * ----------------------------
 * - Library widgets: data-testid="library-widget-{type}"
 * - Section areas: data-testid="section-area-{id}", data-droppable-area="{id}"
 * - Canvas widgets: data-testid="canvas-widget-{id}", data-widget-type="{type}"
 * - Sections: data-section-id="{id}"
 * 
 * KNOWN ISSUES TO AVOID:
 * ----------------------
 * - Don't wrap area.widgets.map() in SortableContext - breaks cross-area moves
 * - Don't add extra DOM nesting in SectionRenderer - confuses collision detection
 * - Don't modify customCollisionDetection priority without testing all scenarios
 * - Always make widgets both draggable AND droppable for precise positioning
 * 
 * ============================================================================
 */

import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { nanoid } from 'nanoid'
import { PREFAB_SECTIONS } from './prefabSections'
import { createDebugLogger } from '../../utils/logger'

// Control logging for this file
const DEBUG = false
const debugLog = createDebugLogger(DEBUG)
import {
  DndContext,
  DragOverlay,
  useSensors,
  useSensor,
  PointerSensor,
  rectIntersection,
  closestCenter,
  pointerWithin
} from '@dnd-kit/core'
import {
  restrictToWindowEdges
} from '@dnd-kit/modifiers'
import type {
  DragStartEvent,
  DragOverEvent,
  DragEndEvent
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { 
  BookOpen, 
  Plus, 
  Lightbulb, 
  FileText, 
  CheckCircle, 
  Settings, 
  Check, 
  X,
  Save,
  ChevronRight
} from 'lucide-react'

// Component imports
import { WidgetLibrary } from '../Library/WidgetLibrary'
import { DraggableLibraryWidget } from '../Canvas/DraggableLibraryWidget'
import { PropertiesPanel } from '../Properties/PropertiesPanel'
import { SchemaFormEditor } from '../Schema/SchemaFormEditor'
import { LayoutPicker } from '../Canvas/LayoutPicker'
import { CanvasThemeProvider } from '../Canvas/CanvasThemeProvider'
import { LayoutRenderer } from '../Canvas/LayoutRenderer'
import { ReplaceZoneModal, type PreserveOptions } from './ReplaceZoneModal'
import { NotificationBell } from '../Notifications/NotificationBell'
import { NewBadge } from '../shared/NewBadge'
import { PublishReviewModal } from './PublishReviewModal'

// Type imports
import type { 
  SchemaOrgType, 
  SchemaObject 
} from '../../types/schema'
import { SCHEMA_DEFINITIONS } from '../../types/schema'
import type { 
  Widget, 
  WidgetSection, 
  ContentBlockLayout, 
  CanvasItem 
} from '../../types/widgets'
import { isSection } from '../../types/widgets'
import type { EditingContext, MockLiveSiteRoute } from '../../types'
import { GlobalSectionBar } from './GlobalSectionBar'
import { getSiteLayoutDraftKey } from '../../utils/pageShellDraftKeys'
import { overrideZone, inheritZone, getArchetypeById, saveArchetype, loadDesignsWithArchetypes, getPagesUsingArchetype, resolveCanvasFromArchetype, getWebsiteArchetypeOverride, saveWebsiteArchetypeOverride } from '../../stores/archetypeStore'
import type { WebsiteArchetypeOverride } from '../../types/archetypes'

// Component props interface
interface PageBuilderProps {
  usePageStore: any // TODO: Type this properly when extracting store
  buildWidget: (item: any) => Widget
  // SchemaFormEditor: React.ComponentType<{
  //   schemaType: SchemaOrgType
  //   initialData?: Partial<SchemaObject>
  //   onSave: (data: Omit<SchemaObject, 'id' | 'createdAt' | 'updatedAt'>) => void
  //   onCancel: () => void
  // }>
  TemplateCanvas: React.ComponentType<{
    editingContext: EditingContext
    mockLiveSiteRoute: MockLiveSiteRoute
    onSectionsLoad: (sections: WidgetSection[]) => void
  }>
  InteractiveWidgetRenderer: React.ComponentType<{ widget: Widget }>
  isSection: (item: any) => boolean
  archetypeMode?: boolean // If true, editing an archetype (master template)
  showMockData?: boolean // If true, show mock data in publication widgets
  pageConfig?: import('../../types/archetypes').PageConfig // Page layout configuration for archetypes
  // Archetype-specific props
  archetypeName?: string // Archetype name for header display (used for both archetype and instance modes)
  archetypeInstanceCount?: number // Count of journals using this archetype
  archetypeId?: string // Archetype ID for preview navigation
  designId?: string // Design ID for preview navigation
  archetypeWebsiteId?: string // If editing website-level archetype, the website ID (null = design-level)
  archetypeModifiedSections?: Set<string> // Sections modified in archetype (for badge)
  onSaveArchetype?: () => void // Handler for Save Archetype button
  onPageSettingsClick?: () => void // Handler for Page Settings button
  onShowMockDataChange?: (show: boolean) => void // Handler for Show Mock Data toggle
  onPageConfigChange?: (pageConfig: import('../../types/archetypes').PageConfig) => void // Handler for Page Config changes in archetype mode
  // Page Instance props (for inheritance system)
  pageInstanceMode?: boolean // If true, editing a Page Instance (inherits from archetype)
  overrideCount?: number // Number of overridden zones
  totalZones?: number // Total number of zones
  journalName?: string // Journal name (when editing instance)
  pageInstance?: import('../../types/archetypes').PageInstance // Page Instance data for override detection
  archetype?: import('../../types/archetypes').Archetype // The archetype this page inherits from
  onPageInstanceChange?: () => void // Callback to trigger pageInstance refresh
  dirtyZones?: Set<string> // Zones that have drifted from archetype (draft state)
  websiteId?: string // Website ID for saving published state
  pageName?: string // Page name/ID for saving published state
  // Template editing mode
  isTemplateMode?: boolean // If true, editing a user-saved template (CustomStarterPage)
  templateName?: string // Template name for display
}

type LeftSidebarTab = 'library' | 'sections' | 'diy-zone' | 'schema-content'

export function PageBuilder({
  usePageStore,
  buildWidget,
  // SchemaFormEditor,
  TemplateCanvas,
  InteractiveWidgetRenderer,
  isSection,
  archetypeMode = false,
  showMockData = true,
  pageConfig,
  archetypeName: archetypeNameProp,
  archetypeInstanceCount = 0,
  archetypeId,
  designId,
  archetypeWebsiteId,
  archetypeModifiedSections = new Set(),
  onSaveArchetype,
  onPageSettingsClick,
  onShowMockDataChange,
  onPageConfigChange,
  pageInstanceMode = false,
  overrideCount = 0,
  totalZones = 0,
  journalName: journalNameProp,
  pageInstance,
  archetype,
  onPageInstanceChange,
  dirtyZones = new Set(),
  websiteId: websiteIdProp,
  pageName: pageNameProp,
  isTemplateMode = false,
  templateName
}: PageBuilderProps) {
  // Use archetypeName prop (renamed from prop to avoid confusion)
  const displayArchetypeName = archetypeNameProp
  // const instanceId = useMemo(() => Math.random().toString(36).substring(7), [])
  const { canvasItems, setCurrentView, selectWidget, selectedWidget, setInsertPosition, createContentBlockWithLayout, selectedSchemaObject, addSchemaObject, updateSchemaObject, selectSchemaObject, addNotification, replaceCanvasItems, editingContext, mockLiveSiteRoute, templateEditingContext, setCanvasItemsForRoute, clearCanvasItemsForRoute, setGlobalTemplateCanvas, setJournalTemplateCanvas, schemaObjects, trackModification, currentWebsiteId, websites, themes, isEditingLoadedWebsite, setIsEditingLoadedWebsite, addCustomStarterPage, setPageCanvas, setPageDraft, clearPageCanvas, clearPageDraft } = usePageStore()
  
  // Get websiteId and pageName (from props or store)
  const websiteId = websiteIdProp || currentWebsiteId || 'catalyst-demo'
  const pageName = pageNameProp || (mockLiveSiteRoute ? mockLiveSiteRoute.replace(/^\//, '') : 'home')
  
  // Track modified sections for non-archetype pages
  // NOTE: For pages using archetype system (pageInstanceMode=true), we use dirtyZones instead
  const [modifiedSections, setModifiedSections] = React.useState<Set<string>>(new Set())
  const baselineCanvasRef = React.useRef<CanvasItem[]>([])
  const trackedPageKeyRef = React.useRef<string>('')
  
  // Get canvasOwnerId from store - tells us which page the canvas content belongs to
  const canvasOwnerId = usePageStore((state: any) => state.canvasOwnerId)
  
  // Track canvas changes for the badge (only for non-archetype pages)
  // NOTE: For pages using archetype system (pageInstanceMode=true), we use dirtyZones instead
  // CRITICAL: Baseline must be the PUBLISHED state, not the draft-loaded canvasItems
  // This ensures changes are tracked correctly even after navigating away and back (preview)
  const getPageCanvas = usePageStore((state: any) => state.getPageCanvas)
  
  React.useEffect(() => {
    // Skip tracking for archetype pages (they use dirtyZones instead)
    if (pageInstanceMode) {
      setModifiedSections(new Set())
      return
    }
    
    const currentPageKey = `${websiteId}:${pageName}`
    
    // Skip if canvas content belongs to a different page (stale content during navigation)
    if (canvasOwnerId !== currentPageKey) {
      return
    }
    
    // Reset tracking when page changes - use PUBLISHED state as baseline (not canvasItems which might be draft)
    if (trackedPageKeyRef.current !== currentPageKey) {
      trackedPageKeyRef.current = currentPageKey
      // CRITICAL: Get the PUBLISHED state as baseline, not the draft-loaded canvasItems
      // This ensures we track changes against what's actually published
      const publishedCanvas = getPageCanvas(websiteId, pageName)
      if (publishedCanvas && publishedCanvas.length > 0) {
        baselineCanvasRef.current = JSON.parse(JSON.stringify(publishedCanvas))
      } else {
        // No published state yet - this is a new page, use current canvas as baseline
        baselineCanvasRef.current = JSON.parse(JSON.stringify(canvasItems))
      }
      // Don't return early - compare immediately to detect existing draft changes
    }
    
    const normalizeSectionForCompare = (section: WidgetSection) => {
      const normalized = JSON.parse(JSON.stringify(section))
      // Treat disabled/empty overlay as equivalent to undefined
      if (!normalized.overlay || normalized.overlay.enabled !== true) {
        delete normalized.overlay
      }
      return normalized
    }

    // Compare current canvas to baseline and find modified sections
    if (baselineCanvasRef.current.length > 0) {
      const modified = new Set<string>()
      
      // Check each section in current canvas
      canvasItems.forEach((item, index) => {
        if (!isSection(item)) return
        
        const baselineItem = baselineCanvasRef.current[index]
        if (!baselineItem || !isSection(baselineItem)) {
          // New section or type changed
          modified.add(item.id)
          return
        }
        
        // Compare section content (normalized JSON comparison)
        const currentNormalized = normalizeSectionForCompare(item as WidgetSection)
        const baselineNormalized = normalizeSectionForCompare(baselineItem as WidgetSection)
        if (JSON.stringify(currentNormalized) !== JSON.stringify(baselineNormalized)) {
          modified.add(item.id)
        }
      })
      
      // Check if sections were removed
      if (canvasItems.length !== baselineCanvasRef.current.length) {
        // Mark as having changes even if we can't identify specific removed sections
        if (canvasItems.length < baselineCanvasRef.current.length && modified.size === 0) {
          modified.add('_removed_')
        }
      }
      
      setModifiedSections(modified)
    } else if (canvasItems.length > 0 && baselineCanvasRef.current.length === 0) {
      // Canvas has content but no baseline - this means there's a draft with no published version
      // Mark all sections as modified
      const modified = new Set<string>()
      canvasItems.forEach(item => {
        if (isSection(item)) {
          modified.add(item.id)
        }
      })
      setModifiedSections(modified)
    }
  }, [canvasItems, pageInstanceMode, websiteId, pageName, canvasOwnerId, isSection, getPageCanvas])
  
  // Build map of modified sections for the modal (non-archetype pages)
  const modifiedSectionsMap = React.useMemo(() => {
    const map = new Map<string, WidgetSection>()
    canvasItems.forEach(item => {
      if (isSection(item) && modifiedSections.has(item.id)) {
        map.set(item.id, item)
      }
    })
    return map
  }, [canvasItems, modifiedSections, isSection])
  
  // Navigation for preview
  const navigate = useNavigate()
  
  // Build zoneSections map from canvasItems for the modal
  // Also include NEW sections (without zoneSlug) using synthetic key
  const zoneSections = React.useMemo(() => {
    const map = new Map<string, WidgetSection>()
    canvasItems.forEach((item, index) => {
      if (isSection(item)) {
        if (item.zoneSlug) {
          map.set(item.zoneSlug, item)
        } else {
          // NEW section without zoneSlug - use synthetic key matching getDirtyZones
          const syntheticKey = `new_section_${item.id || index}`
          map.set(syntheticKey, item)
        }
      }
    })
    return map
  }, [canvasItems])
  
  // Build baselineSections map for comparison (archetype sections or published sections)
  // IMPORTANT: For page instance mode, use resolved canvas (Design + Website override)
  // so that "Reset to Archetype" correctly identifies zones as resets, not new changes
  const baselineSections = React.useMemo(() => {
    const map = new Map<string, WidgetSection>()
    
    if (pageInstanceMode && archetype) {
      // For archetype mode: use RESOLVED archetype (with website override) as baseline
      // This ensures "Sync with Master" compares against Website Master, not Design Master
      const websiteOverrideForBaseline = websiteId ? getWebsiteArchetypeOverride(websiteId, archetype.id) : null
      const resolvedArchetype = resolveCanvasFromArchetype(archetype, websiteOverrideForBaseline)
      resolvedArchetype.forEach((item: any) => {
        if (isSection(item) && item.zoneSlug) {
          map.set(item.zoneSlug, item)
        }
      })
    } else {
      // For simple mode: use baseline from baselineCanvasRef
      baselineCanvasRef.current.forEach((item: any) => {
        if (isSection(item)) {
          // Use section id as key for non-archetype pages (no zoneSlug)
          map.set(item.id, item)
        }
      })
    }
    
    return map
  }, [pageInstanceMode, archetype, websiteId, isSection])
  
  // Build baselineSections map for simple mode (by section id, not zoneSlug)
  const baselineSectionsForSimpleMode = React.useMemo(() => {
    const map = new Map<string, WidgetSection>()
    baselineCanvasRef.current.forEach((item: any) => {
      if (isSection(item)) {
        map.set(item.id, item)
      }
    })
    return map
  }, [isSection, modifiedSections]) // Re-compute when modifiedSections changes (means baseline may have changed)
  
  // Helper function to navigate to live site
  const navigateToLiveSite = () => {
    const route = mockLiveSiteRoute?.replace(/^\//, '') || ''
    // Homepage is at /live/:websiteId (not /live/:websiteId/home)
    const livePath = route === 'home' || route === '' 
      ? `/live/${websiteId}` 
      : `/live/${websiteId}/${route}`
    navigate(livePath)
  }
  
  // Handle Save & Publish - always shows modal so user can review/discard changes
  const handleSaveAndPublish = () => {
    debugLog('log', '🚀 [PageBuilder] Save & Publish clicked:', {
      pageInstanceMode,
      dirtyZonesSize: dirtyZones.size,
      dirtyZones: Array.from(dirtyZones),
      modifiedSectionsSize: modifiedSections.size,
      showPublishModalBefore: showPublishModal
    })
    
    // Always show the modal - user can review changes, publish, or discard
    // DO NOT save before showing modal - let user decide in the modal
    setShowPublishModal(true)
  }
  
  // Handle direct publish (no dirty zones or not in pageInstanceMode)
  const handlePublishDirectly = () => {
    debugLog('log', '📋 [PageBuilder] handlePublishDirectly called')
    
    // Save current canvas to published state (in-memory)
    setPageCanvas(websiteId, pageName, canvasItems)
    debugLog('log', '💾 [PageBuilder] Saved canvas to published state')
    
    // Also update websitePages if this is a user-created page (persisted to localStorage)
    const websitePages = usePageStore.getState().websitePages || []
    const websitePage = websitePages.find(
      (p: any) => p.websiteId === websiteId && p.slug === pageName
    )
    if (websitePage) {
      const updateWebsitePage = usePageStore.getState().updateWebsitePage
      updateWebsitePage(websitePage.id, { 
        canvasItems: canvasItems,
        isPublished: true,
        updatedAt: new Date()
      })
      debugLog('log', '💾 [PageBuilder] Updated websitePage in localStorage')
    }
    
    // Clear draft
    setPageDraft(websiteId, pageName, [])
    debugLog('log', '🗑️ [PageBuilder] Cleared draft')

    // Commit header/footer drafts as part of page publish
    commitHeaderFooterDrafts()
    
    // Reset tracking - current state is now the new baseline
    baselineCanvasRef.current = JSON.parse(JSON.stringify(canvasItems))
    setModifiedSections(new Set())
    
    // Trigger page instance refresh if in pageInstanceMode
    if (pageInstanceMode && onPageInstanceChange) {
      onPageInstanceChange()
    }
    
    // Navigate to live site
    navigateToLiveSite()
  }
  
  // Handle simple publish (for non-archetype pages from modal)
  const handleSimplePublish = () => {
    debugLog('log', '📋 [PageBuilder] handleSimplePublish called')
    
    // Save current canvas to published state (in-memory)
    setPageCanvas(websiteId, pageName, canvasItems)
    debugLog('log', '💾 [PageBuilder] Saved canvas to published state')
    
    // Also update websitePages if this is a user-created page (persisted to localStorage)
    const websitePages = usePageStore.getState().websitePages || []
    const websitePage = websitePages.find(
      (p: any) => p.websiteId === websiteId && p.slug === pageName
    )
    if (websitePage) {
      const updateWebsitePage = usePageStore.getState().updateWebsitePage
      updateWebsitePage(websitePage.id, { 
        canvasItems: canvasItems,
        isPublished: true,
        updatedAt: new Date()
      })
      debugLog('log', '💾 [PageBuilder] Updated websitePage in localStorage')
    }
    
    // Clear draft
    setPageDraft(websiteId, pageName, [])
    debugLog('log', '🗑️ [PageBuilder] Cleared draft')

    // Commit header/footer drafts as part of page publish
    commitHeaderFooterDrafts()
    
    // Reset tracking - current state is now the new baseline
    baselineCanvasRef.current = JSON.parse(JSON.stringify(canvasItems))
    setModifiedSections(new Set())
    
    // Navigate to live site
    navigateToLiveSite()
  }
  
  // Handle discard - revert to last published state
  const handleDiscard = () => {
    debugLog('log', '🗑️ [PageBuilder] handleDiscard called')
    
    // Clear draft from sessionStorage and memory
    clearPageDraft(websiteId, pageName)
    debugLog('log', '🗑️ [PageBuilder] Cleared draft from store')

    // Also discard any pending header/footer drafts for this page
    clearHeaderFooterDrafts()
    
    // Get the last published canvas (or archetype-resolved canvas for archetype pages)
    const getPageCanvas = usePageStore.getState().getPageCanvas
    const publishedCanvas = getPageCanvas(websiteId, pageName)
    
    let canvasToLoad: typeof canvasItems | null = null
    
    if (publishedCanvas && publishedCanvas.length > 0) {
      canvasToLoad = publishedCanvas
      debugLog('log', '↩️ [PageBuilder] Will revert to published state', { itemCount: publishedCanvas.length })
    } else if (pageInstanceMode && pageInstance && archetype) {
      // For archetype pages with no published state, resolve from archetype
      // Include website override for 3-layer resolution
      const websiteOverrideForRevert = getWebsiteArchetypeOverride(websiteId, archetype.id)
      canvasToLoad = resolveCanvasFromArchetype(archetype, websiteOverrideForRevert, pageInstance)
      debugLog('log', '↩️ [PageBuilder] Will revert to archetype-resolved state', { itemCount: canvasToLoad?.length })
    }
    
    if (canvasToLoad && canvasToLoad.length > 0) {
      // Replace canvas with the loaded state
      replaceCanvasItems(canvasToLoad)
      
      // CRITICAL: Set baseline to the canvas we're loading, not the current canvasItems
      // (canvasItems still has the old state at this point due to async state update)
      baselineCanvasRef.current = JSON.parse(JSON.stringify(canvasToLoad))
      setModifiedSections(new Set())
      
      // Trigger notification
      addNotification({
        type: 'info',
        title: 'Changes Discarded',
        message: 'Your changes have been reverted to the last published version.'
      })
    } else {
      // No published state to revert to
      addNotification({
        type: 'error',
        title: 'Cannot Discard',
        message: 'No published version found to revert to.'
      })
    }
  }
  
  // Handle reset entire page to archetype (preview mode - shows archetype content in editor)
  const handleResetToArchetype = () => {
    if (!pageInstanceMode || !archetype) {
      debugLog('error', 'Cannot reset to archetype: not in pageInstance mode or no archetype')
      return
    }
    
    // Load archetype content with website override (resets to Website Master, not Design Master)
    // This preserves publisher's website-level customizations
    const websiteOverrideForReset = getWebsiteArchetypeOverride(websiteId, archetype.id)
    const archetypeCanvas = resolveCanvasFromArchetype(archetype, websiteOverrideForReset) // No pageInstance = reset to website master
    
    if (archetypeCanvas && archetypeCanvas.length > 0) {
      replaceCanvasItems(archetypeCanvas)
      debugLog('log', '🔄 [PageBuilder] Reset to archetype (preview): loaded archetype canvas', { itemCount: archetypeCanvas.length })
      
      // Don't update baseline - we want the diff to show all zones as "pending reset"
      // The baseline should stay as the original (archetype + overrides) so the diff shows changes
      
      addNotification({
        type: 'info',
        title: 'Preview: Syncing with Master',
        message: 'Editor shows Master content. Use Save & Publish to confirm or Discard to revert.'
      })
    }
  }
  
  // Handle revert a single zone to archetype (preview mode)
  const handleRevertZoneToArchetype = (zoneSlug: string) => {
    if (!pageInstanceMode || !archetype) {
      debugLog('error', 'Cannot revert zone: not in pageInstance mode or no archetype')
      return
    }
    
    // Get archetype content with website override (Website Master)
    const websiteOverrideForZoneReset = getWebsiteArchetypeOverride(websiteId, archetype.id)
    const archetypeCanvas = resolveCanvasFromArchetype(archetype, websiteOverrideForZoneReset)
    const archetypeSection = archetypeCanvas.find((s: any) => s.zoneSlug === zoneSlug)
    
    if (!archetypeSection) {
      debugLog('error', 'Cannot revert zone: zone not found in archetype', { zoneSlug })
      addNotification({
        type: 'error',
        title: 'Zone Not Found',
        message: `Zone "${zoneSlug}" not found in archetype.`
      })
      return
    }
    
    // Replace just that section in the current canvas
    const updatedCanvas = canvasItems.map((section: any) => {
      if (section.zoneSlug === zoneSlug) {
        return archetypeSection
      }
      return section
    })
    
    replaceCanvasItems(updatedCanvas)
    debugLog('log', '🔄 [PageBuilder] Reverted zone to archetype (preview):', { zoneSlug })
    
    addNotification({
      type: 'info',
      title: `Preview: Zone "${zoneSlug}" Reverted`,
      message: 'Zone shows archetype content. Use Save & Publish to confirm or Discard to revert.'
    })
  }
  
  // Helper to normalize a section for comparison (remove runtime data, keep config)
  const normalizeForComparison = (section: WidgetSection): any => {
    const { id, ...sectionRest } = section
    return {
      ...sectionRest,
      areas: section.areas?.map(area => ({
        ...area,
        widgets: area.widgets?.map(widget => {
          // Remove runtime properties like id, journalId, publications (data)
          const { id: wId, journalId, publications, publication, ...widgetRest } = widget as any
          return widgetRest
        })
      }))
    }
  }
  
  // Handle publish with choices from modal
  const handlePublishWithChoices = (choices: Map<string, 'local' | 'archetype' | 'discard'>, stayInEditor: boolean = false) => {
    debugLog('log', '📋 [PageBuilder] handlePublishWithChoices called:', {
      choices: Array.from(choices.entries()),
      stayInEditor,
      pageInstanceTemplateId: pageInstance?.templateId,
      designIdProp: designId
    })
    
    if (!pageInstance) {
      debugLog('error', 'Cannot publish: no pageInstance available')
      return
    }
    
    // Calculate designId the same way PageBuilderEditor does
    const currentWebsite = websites.find((w: any) => w.id === currentWebsiteId)
    const calculatedDesignId = currentWebsite?.themeId || (currentWebsite as any)?.designId || currentWebsite?.name || designId || ''
    const normalizedDesignId = calculatedDesignId.toLowerCase()
    const archetypeDesignId = normalizedDesignId.includes('classic') || normalizedDesignId === 'foundation-theme-v1' 
      ? 'classic-ux3-theme' 
      : calculatedDesignId || 'classic-ux3-theme'
    
    debugLog('log', '📋 [PageBuilder] Looking up archetype:', {
      templateId: pageInstance.templateId,
      calculatedDesignId,
      archetypeDesignId
    })
    
    const archetype = getArchetypeById(pageInstance.templateId, archetypeDesignId)
    if (!archetype) {
      debugLog('error', 'Cannot publish: archetype not found', {
        templateId: pageInstance.templateId,
        designId: archetypeDesignId,
        availableDesigns: Object.keys(loadDesignsWithArchetypes())
      })
      return
    }
    
    let updatedInstance = pageInstance
    let updatedArchetype = archetype
    
    // Process each choice
    choices.forEach((choice, zoneSlug) => {
      const section = zoneSections.get(zoneSlug)
      if (!section) {
        debugLog('warn', `⚠️ [PageBuilder] No section found for zone ${zoneSlug}`)
        return
      }
      
      if (choice === 'discard') {
        // Discard: Don't save the current changes - just skip this zone
        // The zone will keep its committed state (either existing override or inherit from archetype)
        debugLog('log', `🗑️ [PageBuilder] Discarding changes for zone ${zoneSlug} - keeping committed state`)
        // No action needed - the committed state is preserved
      } else if (choice === 'local') {
        // Keep Local: Create override in page instance (overrideZone automatically saves it)
        // BUT: If section matches archetype, we should CLEAR the override instead (no point storing redundant data)
        const archetypeSection = updatedArchetype.canvasItems.find(
          s => isSection(s) && s.zoneSlug === zoneSlug
        )
        
        // Check if current section matches archetype (comparing without runtime data)
        const sectionMatchesArchetype = archetypeSection && 
          JSON.stringify(normalizeForComparison(section)) === JSON.stringify(normalizeForComparison(archetypeSection as WidgetSection))
        
        if (sectionMatchesArchetype) {
          // Section matches archetype - clear override instead of saving redundant data
          debugLog('log', `🔄 [PageBuilder] Zone ${zoneSlug} matches archetype - clearing override (resetting to inherit)`)
          if (updatedInstance.overrides[zoneSlug]) {
            updatedInstance = inheritZone(updatedInstance, zoneSlug)
          }
        } else {
          // Section differs from archetype - save as local override
          // For NEW sections (synthetic zoneSlug), assign the zoneSlug to the section
          let sectionToSave = section
          if (zoneSlug.startsWith('new_section_') && !section.zoneSlug) {
            sectionToSave = { ...section, zoneSlug }
            debugLog('log', `💾 [PageBuilder] Assigning zoneSlug ${zoneSlug} to NEW section before saving`)
          }
          debugLog('log', `💾 [PageBuilder] Saving zone ${zoneSlug} as local override`)
          updatedInstance = overrideZone(updatedInstance, zoneSlug, sectionToSave)
        }
      } else {
        // Save to Archetype: Update archetype canvas AND remove override from page instance
        debugLog('log', `📐 [PageBuilder] Promoting zone ${zoneSlug} to archetype`)
        const archetypeSectionIndex = updatedArchetype.canvasItems.findIndex(
          s => isSection(s) && s.zoneSlug === zoneSlug
        )
        if (archetypeSectionIndex !== -1) {
          updatedArchetype.canvasItems[archetypeSectionIndex] = section
          debugLog('log', `✅ [PageBuilder] Updated archetype section at index ${archetypeSectionIndex}`)
          
          // Remove override from page instance so it inherits from archetype
          // (inheritZone automatically saves the updated instance)
          if (updatedInstance.overrides[zoneSlug]) {
            debugLog('log', `🔄 [PageBuilder] Removing override for zone ${zoneSlug} from page instance`)
            updatedInstance = inheritZone(updatedInstance, zoneSlug)
          }
        } else {
          debugLog('warn', `⚠️ [PageBuilder] Zone ${zoneSlug} not found in archetype canvas`)
        }
      }
    })
    
    // Save updated archetype if any changes were made
    const hasArchetypeChanges = Array.from(choices.values()).some(c => c === 'archetype')
    if (hasArchetypeChanges) {
      // IMPORTANT: In page instance mode, "Push to All Journals" should save to WEBSITE archetype override
      // NOT the Design archetype. This ensures changes only affect this website's journals.
      if (pageInstanceMode && websiteId) {
        console.log('💾 [PageBuilder] Saving to WEBSITE archetype override (Push to All Journals)')
        
        // Get existing website override or create new one
        const existingOverride = getWebsiteArchetypeOverride(websiteId, updatedArchetype.id)
        const overrides: Record<string, WidgetSection> = existingOverride?.overrides || {}
        
        // Update overrides for zones that were pushed to archetype
        choices.forEach((choice, zoneSlug) => {
          if (choice === 'archetype') {
            let section: WidgetSection | undefined
            
            // Check if this is a NEW section (synthetic zoneSlug like 'new_section_xyz123')
            if (zoneSlug.startsWith('new_section_')) {
              // Extract section ID from synthetic zoneSlug
              const sectionId = zoneSlug.replace('new_section_', '')
              section = canvasItems.find(
                (item): item is WidgetSection => isSection(item) && item.id === sectionId
              )
              if (section) {
                // Assign the synthetic zoneSlug to the section so it can be tracked
                section = { ...section, zoneSlug }
                console.log(`   - NEW section ${sectionId} assigned zoneSlug: ${zoneSlug}`)
              }
            } else {
              // Normal zone lookup by zoneSlug
              section = canvasItems.find(
                (item): item is WidgetSection => isSection(item) && item.zoneSlug === zoneSlug
              )
            }
            
            if (section) {
              overrides[zoneSlug] = section
              console.log(`   - Saving zone ${zoneSlug} to website override`)
            } else {
              console.warn(`   ⚠️ Section not found for zone: ${zoneSlug}`)
            }
          }
        })
        
        const websiteOverride: WebsiteArchetypeOverride = {
          id: `${websiteId}:${updatedArchetype.id}`,
          type: 'website-archetype-override',
          websiteId,
          archetypeId: updatedArchetype.id,
          designId: updatedArchetype.designId,
          overrides,
          createdAt: existingOverride?.createdAt || new Date(),
          updatedAt: new Date()
        }
        
        saveWebsiteArchetypeOverride(websiteOverride)
        console.log('   ✅ Website archetype override saved:', Object.keys(overrides))
        
        // Invalidate cached canvas ONLY for pages in THIS WEBSITE
        const pagesUsingArchetype = getPagesUsingArchetype(updatedArchetype.id)
        const websitePages = pagesUsingArchetype.filter(p => p.websiteId === websiteId)
        const currentPageKey = `${websiteId}:${pageName}`
        
        websitePages.forEach(({ websiteId: pageWebsiteId, pageId }) => {
          const pageKey = `${pageWebsiteId}:${pageId}`
          if (pageKey !== currentPageKey) {
            console.log(`   🗑️ Clearing cached canvas for: ${pageKey}`)
            clearPageCanvas(pageWebsiteId, pageId)
            clearCanvasItemsForRoute(`/${pageId}`)
            clearPageDraft(pageWebsiteId, pageId)
          }
        })
        
        console.log('   ✅ Website-level push complete:', {
          websiteId,
          pagesAffected: websitePages.length - 1
        })
      } else {
        // Design-level save (original behavior - only used in archetype mode without websiteId)
        debugLog('log', '💾 [PageBuilder] Saving to DESIGN archetype')
        updatedArchetype.updatedAt = new Date()
        saveArchetype(updatedArchetype)
        
        // Invalidate cached canvas for ALL pages using this archetype
        const pagesUsingArchetype = getPagesUsingArchetype(updatedArchetype.id)
        const currentPageKey = `${currentWebsiteId}:${pageName}`
        
        pagesUsingArchetype.forEach(({ websiteId: pageWebsiteId, pageId }) => {
          const pageKey = `${pageWebsiteId}:${pageId}`
          if (pageKey !== currentPageKey) {
            debugLog('log', `🗑️ [PageBuilder] Clearing cached canvas for: ${pageKey}`)
            clearPageCanvas(pageWebsiteId, pageId)
            clearCanvasItemsForRoute(`/${pageId}`)
            clearPageDraft(pageWebsiteId, pageId)
          }
        })
        
        debugLog('log', '✅ [PageBuilder] Design archetype promoted and caches invalidated:', {
          archetypeId: updatedArchetype.id,
          pagesAffected: pagesUsingArchetype.length - 1
        })
      }
    }
    
    // Note: overrideZone already saves the page instance, so we don't need to save it again here
    
    // CRITICAL: Clear draft AND pageCanvasData for current page after publishing
    // This ensures next edit loads from archetype+override (the source of truth), not stale caches
    clearPageDraft(websiteId, pageName)
    clearPageCanvas(websiteId, pageName)
    debugLog('log', '🗑️ [PageBuilder] Cleared draft and canvas cache for current page after publishing:', { websiteId, pageName })

    // Commit header/footer drafts as part of page publish (page chrome is part of the preview/publish lifecycle)
    commitHeaderFooterDrafts()
    
    // Trigger refresh to reload page instance
    if (onPageInstanceChange) {
      debugLog('log', '🔄 [PageBuilder] Triggering page instance refresh')
      onPageInstanceChange()
    }
    
    // Always navigate to live site (stayInEditor is no longer used)
    debugLog('log', '🚀 [PageBuilder] Navigating to live site')
    navigateToLiveSite()
  }
  
  // Page Settings - when button is clicked, show page settings
  const handlePageSettingsClick = () => {
    // Always set showPageSettings to true when Page Settings is clicked
    setShowPageSettings(true)
    selectWidget(null) // Deselect any widget to show page settings
    // Call the provided handler if it exists (for archetype mode)
    if (onPageSettingsClick) {
      onPageSettingsClick()
    }
  }
  
  // Hide Page Settings when a widget is selected
  useEffect(() => {
    if (selectedWidget) {
      setShowPageSettings(false)
    }
  }, [selectedWidget])
  
  // Track active drag item for DragOverlay
  const [activeDragItem, setActiveDragItem] = useState<{ widget?: Widget; type?: string; item?: any } | null>(null)
  
  // Publish Review Modal state
  const [showPublishModal, setShowPublishModal] = useState(false)
  
  // Debug: Track modal state changes
  useEffect(() => {
    debugLog('log', '📋 [PageBuilder] showPublishModal changed:', {
      showPublishModal,
      pageInstanceMode,
      dirtyZonesSize: dirtyZones.size,
      modalShouldBeVisible: showPublishModal && pageInstanceMode
    })
  }, [showPublishModal, pageInstanceMode, dirtyZones.size])
  
  // Debug: Log canvas state on render
  debugLog('log', '🎨 PageBuilder render - Canvas items:', canvasItems.length)
  if (canvasItems.length > 0) {
    debugLog('log', '🎨 First canvas item:', canvasItems[0]?.type, canvasItems[0]?.name || canvasItems[0]?.id)
  } else {
    debugLog('log', '🎨 Canvas is EMPTY')
  }
  
  // Detect editing context
  const isIndividualIssueEdit = editingContext === 'page' && mockLiveSiteRoute.includes('/toc/')
  const isTemplateEdit = editingContext === 'template' && templateEditingContext !== null
  const isGlobalTemplateEdit = isTemplateEdit && templateEditingContext?.scope === 'global'
  const isJournalTemplateEdit = isTemplateEdit && templateEditingContext?.scope === 'journal'
  
  // User-saved template mode (CustomStarterPage editing) - hides standard Save/Preview buttons
  const isUserTemplateMode = isTemplateMode === true
  
  // Get current website and theme (needed for journal context and theme name)
  const currentWebsite = websites.find((w: any) => w.id === currentWebsiteId)
  const currentTheme = themes.find((t: any) => t.id === currentWebsite?.themeId)
  const themeName = currentTheme?.name || 'No Theme'
  
  // Extract journal code from route - handles multiple formats:
  // - /journal/jas (journal home)
  // - /journal/jas/loi (issue archive)
  // - /journal/jas/toc/1/2 (issue TOC)
  // - /toc/advma (legacy format)
  const getJournalCode = (route: string): string | null => {
    if (!route) return null
    // Try new format first: /journal/{journalId}/...
    const journalMatch = route.match(/\/journal\/([^\/]+)/)
    if (journalMatch) return journalMatch[1]
    // Try legacy format: /toc/{journalId}/...
    const tocMatch = route.match(/\/toc\/([^\/]+)/)
    if (tocMatch) return tocMatch[1]
    return null
  }
  const journalCode = getJournalCode(mockLiveSiteRoute)
  
  // Get journal name from website data
  const getJournalName = (code: string | null): string => {
    if (!code) return 'Journal'
    const journal = (currentWebsite as any)?.journals?.find((j: any) => j.id === code)
    return journal?.name || code.toUpperCase()
  }
  const journalName = getJournalName(journalCode)
  
  // Subscribe to draft changes so draft-aware header/footer rendering and indicators update reactively.
  const pageDraftData = usePageStore((state: any) => state.pageDraftData || {})
  const siteLayoutDraftSettings = usePageStore((state: any) => state.siteLayoutDraftSettings || {})
  const pageLayoutOverridesDraft = usePageStore((state: any) => state.pageLayoutOverridesDraft || {})
  const pageLayoutOverridesPublished = usePageStore((state: any) => state.pageLayoutOverrides || {})

  // Get site layout for global header/footer (draft-aware)
  const siteLayout = (currentWebsite as any)?.siteLayout
  const headerSectionsDraft = pageDraftData[`${currentWebsiteId}:${getSiteLayoutDraftKey('header')}`]
  const footerSectionsDraft = pageDraftData[`${currentWebsiteId}:${getSiteLayoutDraftKey('footer')}`]
  const headerSections = (Array.isArray(headerSectionsDraft) && headerSectionsDraft.length > 0) ? headerSectionsDraft : (siteLayout?.header || [])
  const footerSections = (Array.isArray(footerSectionsDraft) && footerSectionsDraft.length > 0) ? footerSectionsDraft : (siteLayout?.footer || [])
  // Header/footer are always enabled - visibility is controlled per-page via dropdown
  
  // Get page-level layout overrides from store
  const { getPageLayoutOverrides, setPageLayoutOverride } = usePageStore()
  
  // Get current page ID from URL (for /edit/:websiteId/:pageId routes)
  // Fall back to mockLiveSiteRoute for legacy routes, then 'home' as default
  const location = useLocation()
  const getPageIdFromUrl = () => {
    // Check if we're on /edit/:websiteId/:pageId route
    const editMatch = location.pathname.match(/\/edit\/[^\/]+\/(.+)/)
    if (editMatch) {
      return editMatch[1] // e.g., "journals", "about", "home"
    }
    // Fall back to mockLiveSiteRoute for legacy routes
    return mockLiveSiteRoute?.replace(/^\//, '') || 'home'
  }
  const currentPageId = getPageIdFromUrl()
  const pageOverrides = getPageLayoutOverrides(currentWebsiteId, currentPageId)
  const headerOverrideMode = pageOverrides.headerOverride || 'global'
  const footerOverrideMode = pageOverrides.footerOverride || 'global'
  
  // Handlers to update overrides (persisted to store)
  const setHeaderOverrideMode = (mode: 'global' | 'hide' | 'page-edit') => {
    setPageLayoutOverride(currentWebsiteId, currentPageId, 'header', mode)
  }
  const setFooterOverrideMode = (mode: 'global' | 'hide' | 'page-edit') => {
    setPageLayoutOverride(currentWebsiteId, currentPageId, 'footer', mode)
  }

  // Header/Footer drafts are stored as drafts under keys:
  // - header-${pageId}
  // - footer-${pageId}
  const commitHeaderFooterDrafts = () => {
    const { getPageDraft, setPageCanvas, clearPageDraft, getPageCanvas, commitPageLayoutOverride } = usePageStore.getState() as any
    if (!currentWebsiteId || !currentPageId) return

    ;(['header', 'footer'] as const).forEach((type) => {
      const mode = type === 'header' ? headerOverrideMode : footerOverrideMode
      if (mode !== 'page-edit') return

      const key = `${type}-${currentPageId}`
      const draft = getPageDraft ? getPageDraft(currentWebsiteId, key) : null
      if (Array.isArray(draft) && setPageCanvas) {
        // Commit draft -> published override
        setPageCanvas(currentWebsiteId, key, draft)
        if (clearPageDraft) clearPageDraft(currentWebsiteId, key)
      }

      // If there's no published override and no draft, revert mode back to global
      const published = getPageCanvas ? getPageCanvas(currentWebsiteId, key) : null
      const stillHasDraft = getPageDraft ? getPageDraft(currentWebsiteId, key) : null
      if ((!published || published.length === 0) && (!stillHasDraft || stillHasDraft.length === 0)) {
        commitPageLayoutOverride?.(currentWebsiteId, currentPageId, type, 'global')
      }
    })
  }

  const clearHeaderFooterDrafts = () => {
    const { 
      clearPageDraft, 
      getPageCanvas, 
      commitPageLayoutOverride, 
      discardPageLayoutOverrideDraft,
      clearSiteLayoutDraftSettings
    } = usePageStore.getState() as any
    if (!currentWebsiteId || !currentPageId) return
    ;(['header', 'footer'] as const).forEach((type) => {
      const mode = type === 'header' ? headerOverrideMode : footerOverrideMode
      if (mode !== 'page-edit') return
      const key = `${type}-${currentPageId}`
      clearPageDraft?.(currentWebsiteId, key)
      const published = getPageCanvas ? getPageCanvas(currentWebsiteId, key) : null
      if (!published || published.length === 0) {
        commitPageLayoutOverride?.(currentWebsiteId, currentPageId, type, 'global')
      }
    })

    // Clear website-level shell drafts (global header/footer edits)
    clearPageDraft?.(currentWebsiteId, getSiteLayoutDraftKey('header'))
    clearPageDraft?.(currentWebsiteId, getSiteLayoutDraftKey('footer'))

    // Discard draft-only visibility overrides (hide/global) for this page
    discardPageLayoutOverrideDraft?.(currentWebsiteId, currentPageId, 'header')
    discardPageLayoutOverrideDraft?.(currentWebsiteId, currentPageId, 'footer')

    // Clear draft-only global enable/disable settings for this website
    clearSiteLayoutDraftSettings?.(currentWebsiteId)
  }


  const [leftSidebarTab, setLeftSidebarTab] = useState<LeftSidebarTab>('library')
  const [isPropertiesPanelExpanded, setIsPropertiesPanelExpanded] = useState(false)
  const [showPageSettings, setShowPageSettings] = useState(false) // Track if Page Settings is explicitly opened
  const [showLayoutPicker, setShowLayoutPicker] = useState(false)
  const [activeSectionToolbar, setActiveSectionToolbar] = useState<string | null>(null)
  const [activeWidgetToolbar, setActiveWidgetToolbar] = useState<string | null>(null)
  const [activeDropZone, setActiveDropZone] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  
  const pageShellChanges = React.useMemo(() => {
    if (archetypeMode) return undefined // no per-page header/footer overrides in archetype editing mode
    if (!currentWebsiteId || !currentPageId) return undefined

    const overridesKey = `${currentWebsiteId}:${currentPageId}`
    const publishedOverrides = pageLayoutOverridesPublished[overridesKey] || {}
    const draftOverrides = pageLayoutOverridesDraft[overridesKey] || {}
    const publishedHeaderMode = publishedOverrides.headerOverride || 'global'
    const publishedFooterMode = publishedOverrides.footerOverride || 'global'

    const headerKey = `${currentWebsiteId}:header-${currentPageId}`
    const footerKey = `${currentWebsiteId}:footer-${currentPageId}`
    const headerDraft = headerOverrideMode === 'page-edit' ? pageDraftData[headerKey] : null
    const footerDraft = footerOverrideMode === 'page-edit' ? pageDraftData[footerKey] : null
    const globalHeaderDraft = pageDraftData[`${currentWebsiteId}:${getSiteLayoutDraftKey('header')}`]
    const globalFooterDraft = pageDraftData[`${currentWebsiteId}:${getSiteLayoutDraftKey('footer')}`]

    const headerHasGlobal = Array.isArray(globalHeaderDraft) && globalHeaderDraft.length > 0
    const headerHasPage = Array.isArray(headerDraft) && headerDraft.length > 0
    const footerHasGlobal = Array.isArray(globalFooterDraft) && globalFooterDraft.length > 0
    const footerHasPage = Array.isArray(footerDraft) && footerDraft.length > 0

    const computeRegionChange = (region: 'header' | 'footer') => {
      const kinds: Array<'sections' | 'visibility' | 'enabled'> = []
      let source: 'global' | 'page' | 'unknown' = 'unknown'

      const hasGlobalSections = region === 'header' ? headerHasGlobal : footerHasGlobal
      const hasPageSections = region === 'header' ? headerHasPage : footerHasPage
      if (hasGlobalSections || hasPageSections) {
        kinds.push('sections')
        source = hasGlobalSections ? 'global' : 'page'
        if (hasGlobalSections && hasPageSections) source = 'unknown'
      }

      const draftMode = region === 'header' ? draftOverrides.headerOverride : draftOverrides.footerOverride
      const publishedMode = region === 'header' ? publishedHeaderMode : publishedFooterMode
      if (draftMode !== undefined && draftMode !== publishedMode) {
        kinds.push('visibility')
        if (source === 'unknown') source = 'page'
        if (source === 'global') source = 'unknown'
      }

      const draftEnabled = region === 'header'
        ? (siteLayoutDraftSettings[currentWebsiteId]?.headerEnabled)
        : (siteLayoutDraftSettings[currentWebsiteId]?.footerEnabled)
      const publishedEnabled = region === 'header'
        ? (siteLayout?.headerEnabled !== false)
        : (siteLayout?.footerEnabled !== false)
      if (draftEnabled !== undefined && draftEnabled !== publishedEnabled) {
        kinds.push('enabled')
        if (source === 'unknown') source = 'global'
        if (source === 'page') source = 'unknown'
      }

      if (kinds.length === 0) return undefined
      return { source, kinds }
    }

    const header = computeRegionChange('header')
    const footer = computeRegionChange('footer')

    if (!header && !footer) return undefined
    return { header, footer }
  }, [
    archetypeMode,
    currentWebsiteId,
    currentPageId,
    headerOverrideMode,
    footerOverrideMode,
    pageDraftData,
    siteLayoutDraftSettings,
    pageLayoutOverridesDraft,
    pageLayoutOverridesPublished,
    siteLayout
  ])

  const applyPageShellPublishChoices = (shellChoices: Partial<Record<'header' | 'footer', 'global' | 'page' | 'discard'>>) => {
    const {
      getPageDraft,
      clearPageDraft,
      setPageCanvas,
      setPageLayoutOverride,
      commitPageLayoutOverride,
      discardPageLayoutOverrideDraft,
      getSiteLayoutDraftSettings,
      setSiteLayoutDraftSettings,
      websites,
      updateWebsite,
      deletePageCanvas,
      addPageShellHistoryEntry
    } = usePageStore.getState() as any

    if (!currentWebsiteId || !currentPageId) return

    const website = (websites || []).find((w: any) => w.id === currentWebsiteId)
    const siteLayout = website?.siteLayout || {}
    const draftSiteLayoutSettings = getSiteLayoutDraftSettings ? getSiteLayoutDraftSettings(currentWebsiteId) : null
    const overridesKey = `${currentWebsiteId}:${currentPageId}`
    const overridesDraftForPage = (usePageStore.getState() as any).pageLayoutOverridesDraft?.[overridesKey] || {}

    const commitToSiteLayout = (region: 'header' | 'footer', sections: any[]) => {
      if (!website || !updateWebsite) return
      const updatedSiteLayout = { ...siteLayout, [region]: sections }
      updateWebsite(currentWebsiteId, {
        ...website,
        siteLayout: updatedSiteLayout,
        updatedAt: new Date()
      })
    }

    const commitEnabledFlag = (region: 'header' | 'footer', enabled: boolean) => {
      if (!website || !updateWebsite) return
      const updatedSiteLayout = { ...siteLayout }
      if (region === 'header') updatedSiteLayout.headerEnabled = enabled
      if (region === 'footer') updatedSiteLayout.footerEnabled = enabled
      updateWebsite(currentWebsiteId, {
        ...website,
        siteLayout: updatedSiteLayout,
        updatedAt: new Date()
      })
    }

    ;(['header', 'footer'] as const).forEach((region) => {
      const choice = shellChoices[region]
      if (!choice) return

      const globalKey = getSiteLayoutDraftKey(region)
      const pageKey = `${region}-${currentPageId}`

      const globalDraft = getPageDraft ? getPageDraft(currentWebsiteId, globalKey) : null
      const pageDraft = getPageDraft ? getPageDraft(currentWebsiteId, pageKey) : null
      const draftToUse =
        (Array.isArray(globalDraft) && globalDraft.length > 0) ? globalDraft :
        (Array.isArray(pageDraft) && pageDraft.length > 0) ? pageDraft :
        null

      if (choice === 'discard') {
        clearPageDraft?.(currentWebsiteId, globalKey)
        clearPageDraft?.(currentWebsiteId, pageKey)
        // Discard any draft-only visibility override
        discardPageLayoutOverrideDraft?.(currentWebsiteId, currentPageId, region)
        // Discard any draft-only enabled setting (by setting to undefined so preview falls back to published)
        if (setSiteLayoutDraftSettings) {
          setSiteLayoutDraftSettings(currentWebsiteId, region === 'header' ? { headerEnabled: undefined } : { footerEnabled: undefined })
        }
        // If there is no published override, revert the mode back to global
        const published = (usePageStore.getState() as any).getPageCanvas?.(currentWebsiteId, pageKey)
        if (!published || published.length === 0) {
          commitPageLayoutOverride?.(currentWebsiteId, currentPageId, region, 'global')
          deletePageCanvas?.(currentWebsiteId, pageKey)
        }
        return
      }

      if (choice === 'global') {
        if (draftToUse && Array.isArray(draftToUse) && draftToUse.length > 0) {
          commitToSiteLayout(region, draftToUse)
          // Record history snapshot
          addPageShellHistoryEntry?.({
            websiteId: currentWebsiteId,
            region,
            scope: 'global',
            sections: draftToUse
          })
        }
        // Commit global enabled/disabled if present
        const draftEnabled = region === 'header' ? draftSiteLayoutSettings?.headerEnabled : draftSiteLayoutSettings?.footerEnabled
        if (draftEnabled !== undefined) {
          commitEnabledFlag(region, draftEnabled)
        }
        // Ensure the page uses global (commit published)
        commitPageLayoutOverride?.(currentWebsiteId, currentPageId, region, 'global')
        // Clear drafts (sections + settings + visibility)
        clearPageDraft?.(currentWebsiteId, globalKey)
        clearPageDraft?.(currentWebsiteId, pageKey)
        discardPageLayoutOverrideDraft?.(currentWebsiteId, currentPageId, region)
        if (setSiteLayoutDraftSettings) {
          setSiteLayoutDraftSettings(currentWebsiteId, region === 'header' ? { headerEnabled: undefined } : { footerEnabled: undefined })
        }
        return
      }

      if (choice === 'page') {
        // If we have section drafts, commit as a page-specific override.
        if (draftToUse && Array.isArray(draftToUse) && draftToUse.length > 0) {
          setPageCanvas?.(currentWebsiteId, pageKey, draftToUse)
          // Record history snapshot
          addPageShellHistoryEntry?.({
            websiteId: currentWebsiteId,
            region,
            scope: 'page',
            pageId: currentPageId,
            sections: draftToUse
          })
        }
        // Commit the page-level visibility mode if drafted; otherwise default to page-edit if we committed sections.
        const draftedMode = region === 'header' ? overridesDraftForPage.headerOverride : overridesDraftForPage.footerOverride
        const nextMode = draftedMode ?? (draftToUse ? 'page-edit' : undefined)
        if (nextMode) {
          commitPageLayoutOverride?.(currentWebsiteId, currentPageId, region, nextMode)
        } else if (draftToUse) {
          commitPageLayoutOverride?.(currentWebsiteId, currentPageId, region, 'page-edit')
        }
        // Discard any global enabled/disabled changes (not page-scoped)
        if (setSiteLayoutDraftSettings) {
          setSiteLayoutDraftSettings(currentWebsiteId, region === 'header' ? { headerEnabled: undefined } : { footerEnabled: undefined })
        }
        // Clear drafts
        clearPageDraft?.(currentWebsiteId, globalKey)
        clearPageDraft?.(currentWebsiteId, pageKey)
      }
    })
  }

  const applyPageShellVisibilityChoices = (choices: Partial<Record<'header' | 'footer', 'accept' | 'discard'>>) => {
    const {
      commitPageLayoutOverride,
      discardPageLayoutOverrideDraft
    } = usePageStore.getState() as any

    if (!currentWebsiteId || !currentPageId) return

    ;(['header', 'footer'] as const).forEach((region) => {
      const decision = choices[region]
      if (!decision) return
      if (decision === 'discard') {
        discardPageLayoutOverrideDraft?.(currentWebsiteId, currentPageId, region)
        return
      }
      const overridesKey = `${currentWebsiteId}:${currentPageId}`
      const draftOverrides = (usePageStore.getState() as any).pageLayoutOverridesDraft?.[overridesKey] || {}
      const draftMode = region === 'header' ? draftOverrides.headerOverride : draftOverrides.footerOverride
      if (draftMode !== undefined) {
        commitPageLayoutOverride?.(currentWebsiteId, currentPageId, region, draftMode)
      }
    })
  }
  
  // Replace Zone state
  const [replaceZoneSlug, setReplaceZoneSlug] = useState<string | null>(null)
  const [replaceSectionId, setReplaceSectionId] = useState<string | null>(null)
  const [showReplaceZoneModal, setShowReplaceZoneModal] = useState(false)
  const [replaceZonePreserveOptions, setReplaceZonePreserveOptions] = useState<PreserveOptions | null>(null)
  const [highlightSectionType, setHighlightSectionType] = useState(false)
  // Replace Section layout (non-zone sections)
  const [replaceCanvasSectionId, setReplaceCanvasSectionId] = useState<string | null>(null)
  // Replace Header/Footer (page shell) state
  const [replacePageShellRegion, setReplacePageShellRegion] = useState<'header' | 'footer' | null>(null)
  
  // Schema editing state
  const [creatingSchemaType, setCreatingSchemaType] = useState<SchemaOrgType | null>(null)
  
  // Homepage template auto-loading
  // Load a starter canvas with one section when Page Builder opens with empty canvas
  // BUT skip if content was already loaded externally (isEditingLoadedWebsite)
  useEffect(() => {
    // Give time for external content to load first
    const timer = setTimeout(() => {
      const currentState = usePageStore.getState()
      if (editingContext === 'page' && currentState.canvasItems.length === 0 && !currentState.isEditingLoadedWebsite) {
        debugLog('log', '📄 Empty canvas detected - loading starter section')
        
        // Create a simple one-column section as a starting point
        const starterSection = {
          id: nanoid(),
          name: 'Section',
          type: 'content-block' as const,
          layout: 'one-column' as const,
          areas: [
            {
              id: nanoid(),
              name: 'Content',
              widgets: []
            }
          ],
          styling: {
            paddingTop: 'medium' as const,
            paddingBottom: 'medium' as const,
            paddingLeft: 'medium' as const,
            paddingRight: 'medium' as const,
            gap: 'medium' as const,
            variant: 'full-width' as const,
            textColor: 'default' as const
          },
          background: {
            type: 'color' as const,
            color: '#ffffff',
            opacity: 1
          }
        }
        
        replaceCanvasItems([starterSection])
        setIsEditingLoadedWebsite(false) // Mark as blank canvas (not a loaded website)
        showToast('Starter section loaded - drag widgets from the library to begin', 'success')
      }
    }, 100) // Small delay to let external content load first
    
    return () => clearTimeout(timer)
  }, []) // Only run once on mount
  
  // Detect if editing a journal home page (route like /journal/jas)
  const isJournalHomeEdit = editingContext === 'page' && mockLiveSiteRoute?.startsWith('/journal/') && !mockLiveSiteRoute.includes('/toc/') && !mockLiveSiteRoute.includes('/loi')
  
  // AUTO-SAVE DISABLED: User must explicitly save via Save & Publish button
  // Route-specific canvas saving for individual issue edits
  // useEffect(() => {
  //   // Save canvas changes to route-specific storage when editing individual issues
  //   if (isIndividualIssueEdit && canvasItems.length > 0) {
  //     debugLog('log','💾 Saving individual issue changes to route:', mockLiveSiteRoute)
  //     debugLog('log','📦 Canvas items being saved:', canvasItems.length, 'items')
  //     setCanvasItemsForRoute(mockLiveSiteRoute, canvasItems)
  //     
  //     // Track modification for divergence management
  //     if (journalCode && trackModification) {
  //       debugLog('log','📊 Tracking template modification for:', journalName, '(', journalCode, ')')
  //       debugLog('log','📊 Route:', mockLiveSiteRoute, 'Template ID: table-of-contents')
  //       trackModification(mockLiveSiteRoute, journalCode, journalName, 'table-of-contents')
  //     } else {
  //       debugLog('warn','⚠️ Tracking skipped:', { journalCode, hasTrackFn: !!trackModification })
  //     }
  //   } else {
  //     debugLog('log','⏭️ Save skipped:', { isIndividualIssueEdit, canvasItemsLength: canvasItems.length })
  //   }
  // }, [canvasItems, isIndividualIssueEdit, mockLiveSiteRoute, setCanvasItemsForRoute, journalCode, journalName, trackModification])
  
  // AUTO-SAVE DISABLED: User must explicitly save via Save & Publish button
  // Route-specific canvas saving for journal home pages
  // useEffect(() => {
  //   // Save canvas changes to route-specific storage when editing journal home pages
  //   if (isJournalHomeEdit && canvasItems.length > 0 && mockLiveSiteRoute) {
  //     debugLog('log','💾 Saving journal home changes to route:', mockLiveSiteRoute)
  //     debugLog('log','📦 Canvas items being saved:', canvasItems.length, 'items')
  //     setCanvasItemsForRoute(mockLiveSiteRoute, canvasItems)
  //   }
  // }, [canvasItems, isJournalHomeEdit, mockLiveSiteRoute, setCanvasItemsForRoute])
  
  // AUTO-SAVE DISABLED: User must explicitly save via Save & Publish button
  // Global template canvas saving
  // useEffect(() => {
  //   // Save canvas changes to global template storage when editing global templates
  //   if (isGlobalTemplateEdit && canvasItems.length > 0) {
  //     debugLog('log','🌍 Saving global template changes:', canvasItems.length, 'items')
  //     setGlobalTemplateCanvas(canvasItems)
  //   }
  // }, [canvasItems, isGlobalTemplateEdit, setGlobalTemplateCanvas])
  
  // AUTO-SAVE DISABLED: User must explicitly save via Save & Publish button
  // Journal template canvas saving
  // useEffect(() => {
  //   // Save canvas changes to journal template storage when editing journal templates
  //   if (isJournalTemplateEdit && templateEditingContext?.journalCode && canvasItems.length > 0) {
  //     debugLog('log','📚 Saving journal template changes for', templateEditingContext.journalCode + ':', canvasItems.length, 'items')
  //     setJournalTemplateCanvas(templateEditingContext.journalCode, canvasItems)
  //     
  //     // Track journal template modification for divergence management
  //     if (trackModification) {
  //       const route = `journal/${templateEditingContext.journalCode}`
  //       debugLog('log','📊 Tracking journal template modification for:', journalName, '(', templateEditingContext.journalCode, ')')
  //       debugLog('log','📊 Route:', route, 'Template ID: table-of-contents')
  //       trackModification(route, templateEditingContext.journalCode, journalName, 'table-of-contents')
  //     }
  //   }
  // }, [canvasItems, isJournalTemplateEdit, templateEditingContext?.journalCode, setJournalTemplateCanvas, journalName, trackModification])
  
  const handleCreateSchema = (type: SchemaOrgType) => {
    setCreatingSchemaType(type)
    selectWidget(null) // Clear widget selection
    selectSchemaObject(null) // Clear schema selection to trigger new form
  }
  
  const handleSaveSchema = (data: Omit<SchemaObject, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (selectedSchemaObject) {
      // Updating existing schema
      updateSchemaObject(selectedSchemaObject.id, data)
      addNotification({
        type: 'success',
        title: 'Schema Updated',
        message: `${data.name} has been updated successfully`
      })
    } else {
      // Creating new schema
      addSchemaObject(data)
      addNotification({
        type: 'success',
        title: 'Schema Created',
        message: `${data.name} has been created successfully`
      })
    }
    setCreatingSchemaType(null)
    selectSchemaObject(null)
  }
  
  const handleCancelSchema = () => {
    setCreatingSchemaType(null)
    selectSchemaObject(null)
  }
  
  // Template sections handler
  const handleTemplateSectionsLoad = (sections: WidgetSection[]) => {
    debugLog('log','🏗️ Loading template sections:', sections)
    replaceCanvasItems(sections)
    // Removed notification toast - banner shows template status instead
  }
  
  const handleSetActiveSectionToolbar = (value: string | null) => {
    setActiveSectionToolbar(value)
  }
  
  // Show toast notification - DISABLED for cleaner prototype experience
  const showToast = (_message: string, _type: 'success' | 'error') => {
    // Toast notifications disabled - uncomment below to re-enable
    // setToast({ message: _message, type: _type })
    // setTimeout(() => setToast(null), 3000)
  }
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  )
  
  // Custom collision detection that prioritizes tab-panel/collapse-panel first, then section-area drop zones
  const customCollisionDetection = (args: any) => {
    const activeType = args.active?.data?.current?.type
    
    // DEBUG: Log all available droppable containers (disabled - too noisy)
    // if (activeType === 'library-widget') {
    //   debugLog('log', '📍 ALL DROPPABLE CONTAINERS:', args.droppableContainers.map((c: any) => ({
    //     id: c.id,
    //     type: c.data?.current?.type,
    //     sectionId: c.data?.current?.sectionId,
    //     areaId: c.data?.current?.areaId
    //   })))
    // }
    
    // FIRST: Try to find tab-panel or collapse-panel collisions (most specific, highest priority)
    const containerPanelCollisions = rectIntersection({
      ...args,
      droppableContainers: args.droppableContainers.filter((container: any) => 
        container.data?.current?.type === 'tab-panel' || 
        container.data?.current?.type === 'collapse-panel'
      )
    })
    
    if (containerPanelCollisions.length > 0) {
      debugLog('log','🎯 Tab/Collapse panel collision detected!', containerPanelCollisions)
      return containerPanelCollisions
    }
    
    // SECOND: For section-widgets AND library-widgets, PRIORITIZE widget-target collisions (for precise positioning)
    if (activeType === 'section-widget' || activeType === 'library-widget') {
      const widgetTargetCollisions = rectIntersection({
        ...args,
        droppableContainers: args.droppableContainers.filter((container: any) => 
          container.data?.current?.type === 'widget-target'
        )
      })
      
        if (widgetTargetCollisions.length > 0) {
          // Dropping ON a specific widget - insert before it
          return widgetTargetCollisions
        }
    }
    
    // THIRD: For library widgets and section-widgets, try section-area collisions using POINTER position
    // This way the CURSOR position matters, not the widget's bounding box
    if (activeType === 'library-widget' || activeType === 'section-widget') {
      const sectionAreaCollisions = pointerWithin({
        ...args,
        droppableContainers: args.droppableContainers.filter((container: any) => 
          container.data?.current?.type === 'section-area'
        )
      })
      
      if (sectionAreaCollisions.length > 0) {
        // Collision detected for widget drop based on cursor position
        debugLog('log', '✅ Section-area collision detected:', sectionAreaCollisions.map((c: any) => ({
          id: c.id,
          sectionId: c.data?.current?.sectionId,
          areaId: c.data?.current?.areaId
        })))
        return sectionAreaCollisions
      }
    }
    
    // FOURTH: Try to find section-area collisions for other items using pointer position
    const sectionAreaCollisions = pointerWithin({
      ...args,
      droppableContainers: args.droppableContainers.filter((container: any) => 
        container.data?.current?.type === 'section-area'
      )
    })
    
    if (sectionAreaCollisions.length > 0) {
      return sectionAreaCollisions
    }
    
    // Fall back to closest center (for section reordering, etc.)
    return closestCenter(args)
  }
  
  const handleDragStart = (event: DragStartEvent) => {
    const draggedItem = event.active.data?.current?.item
    const isSidebar = draggedItem && isSection(draggedItem) && draggedItem.type === 'sidebar'
    
    // Set active drag item for DragOverlay
    setActiveDragItem({
      widget: draggedItem,
      type: event.active.data?.current?.type,
      item: draggedItem
    })
    
    debugLog('log','🚀 Drag Start:', {
      activeId: event.active.id,
      activeType: event.active.data?.current?.type,
      activeData: event.active.data?.current,
      activeItem: draggedItem,
      isSidebar: isSidebar,
      sidebarName: isSidebar ? draggedItem.name : 'not a sidebar'
    })
    
    if (isSidebar) {
      debugLog('log','🎯 SIDEBAR DRAG DETECTED! Setting up special highlighting...')
    }
    
    // Log all available drop zones for debugging
    const dropZones = document.querySelectorAll('[data-droppable="true"]')
    debugLog('log','📍 Available drop zones:', Array.from(dropZones).map(zone => ({
      id: zone.getAttribute('data-droppable-id') || zone.id,
      classes: zone.className,
      rect: zone.getBoundingClientRect()
    })))
  }
  
  const handleDragOver = (event: DragOverEvent) => {
    if (event.over) {
      const activeItem = event.active.data?.current?.item
      const isDraggingSidebar = activeItem && isSection(activeItem) && activeItem.type === 'sidebar'
      
      // Special logging for tab panels and collapse panels
      if (event.over.data?.current?.type === 'tab-panel') {
        debugLog('log','🎯 DRAGGING OVER TAB PANEL!', {
          tabId: event.over.data.current.tabId,
          widgetId: event.over.data.current.widgetId,
          activeType: event.active.data?.current?.type
        })
      }
      
      if (event.over.data?.current?.type === 'collapse-panel') {
        debugLog('log','🎯 DRAGGING OVER COLLAPSE PANEL!', {
          panelId: event.over.data.current.panelId,
          widgetId: event.over.data.current.widgetId,
          activeType: event.active.data?.current?.type
        })
      }
      
      // DEBUG: Log what we're detecting
      debugLog('log','🔍 Drag Over Debug:', {
        activeId: event.active.id,
        activeType: event.active.data?.current?.type,
        activeItem: activeItem,
        isDraggingSidebar: isDraggingSidebar,
        sidebarType: activeItem?.type,
        overType: event.over.data?.current?.type
      })
      
      if (isDraggingSidebar) {
        // For sidebar dragging, convert section-area drops to section-level drops
        if (event.over.data?.current?.type === 'section-area') {
          const sectionId = event.over.data?.current?.sectionId
          if (activeDropZone !== sectionId) {
            setActiveDropZone(sectionId)
            debugLog('log','🎯 Sidebar drop zone detected (converted to section-level):', {
              activeId: event.active.id,
              dropZone: sectionId,
              originalAreaId: event.over.id
            })
          }
        } else if (event.over.data?.current?.type === 'section') {
          const dropZoneId = event.over.id as string
          if (activeDropZone !== dropZoneId) {
            setActiveDropZone(dropZoneId)
            debugLog('log','🎯 Sidebar drop zone detected (section-level):', {
              activeId: event.active.id,
              dropZone: dropZoneId,
              sectionId: event.over.id
            })
          }
        } else {
          // Clear highlight when not over a section or section-area
          if (activeDropZone) {
            setActiveDropZone(null)
          }
        }
      } else {
        // Normal behavior for other items - highlight section-area drop zones
        if (event.over.data?.current?.type === 'section-area') {
          const dropZoneId = event.over.id as string
          if (activeDropZone !== dropZoneId) {
            setActiveDropZone(dropZoneId)
            debugLog('log','🎯 Drop zone detected:', {
              activeId: event.active.id,
              activeType: event.active.data?.current?.type,
              dropZone: dropZoneId,
              sectionId: event.over.data?.current?.sectionId,
              areaId: event.over.data?.current?.areaId
            })
          }
        } else {
          // Clear highlight when not over a section-area
          if (activeDropZone) {
            setActiveDropZone(null)
          }
        }
      }
    } else {
      // Clear highlight when not over anything
      if (activeDropZone) {
        setActiveDropZone(null)
      }
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    // Clear active drag item and drop zone highlighting
    setActiveDragItem(null)
    setActiveDropZone(null)
    
    debugLog('log','🎯 Drag End Event:', {
      activeId: active.id,
      activeType: active.data?.current?.type,
      overId: over?.id,
      overType: over?.data?.current?.type,
      overData: over?.data?.current,
      hasOver: !!over,
      isLibraryWidget: active.data?.current?.type === 'library-widget',
      isSortableItem: !active.data?.current?.type || active.data?.current?.type === 'sortable',
      isTabPanel: over?.data?.current?.type === 'tab-panel',
      isCollapsePanel: over?.data?.current?.type === 'collapse-panel'
    })

    if (!over) {
      debugLog('log','❌ No drop target found')
      return
    }
    
    // Log tab panel detection
    if (over?.data?.current?.type === 'tab-panel') {
      debugLog('log','✨ TAB PANEL DETECTED!', {
        tabId: over.data.current.tabId,
        widgetId: over.data.current.widgetId,
        activeType: active.data?.current?.type
      })
    }

    // Handle library widget drop - AUTO-CREATE SECTION with the widget
    if (active.data?.current?.type === 'library-widget') {
      debugLog('log','📦 Library widget detected!', {
        libraryItem: active.data.current.item,
        overType: over.data?.current?.type,
        overId: over.id
      })
      
      const libraryItem = active.data.current.item
      const { replaceCanvasItems, canvasItems } = usePageStore.getState()
      
      // Case 0: Dropped into tab panel (HIGHEST PRIORITY)
      if (over.data?.current?.type === 'tab-panel') {
        debugLog('log','✅ Library widget dropped into tab panel!', {
          libraryItem,
          tabId: over.data.current.tabId,
          widgetId: over.data.current.widgetId
        })
        
        const tabId = over.data.current.tabId
        const tabsWidgetId = over.data.current.widgetId
        
        // Create new widget from library item
        const newWidget = buildWidget(libraryItem)
        
        debugLog('log','🔧 Created widget:', newWidget.type, newWidget.id, 'for tab:', tabId)
        
        // Find the tabs widget and the specific tab, update it with the new widget
        const updatedCanvasItems = canvasItems.map((canvasItem: CanvasItem) => {
          // Check if this is the tabs widget (standalone)
          if (canvasItem.type === 'tabs' && canvasItem.id === tabsWidgetId) {
            const tabsWidget = canvasItem as any // TabsWidget
            const tabIndex = tabsWidget.tabs.findIndex((t: any) => t.id === tabId)
            
            if (tabIndex !== -1) {
              const updatedTabs = [...tabsWidget.tabs]
              updatedTabs[tabIndex] = {
                ...updatedTabs[tabIndex],
                widgets: [...(updatedTabs[tabIndex].widgets || []), newWidget]
              }
              
              debugLog('log','🎯 Setting activeTabIndex to:', tabIndex, 'for dropped widget (standalone)')
              debugLog('log','📦 Tabs before update:', tabsWidget.tabs)
              debugLog('log','📦 Tabs after update:', updatedTabs)
              
              return {
                ...tabsWidget,
                tabs: updatedTabs,
                activeTabIndex: tabIndex
              }
            }
          }
          
          // Check if the tabs widget is inside a section
          if (isSection(canvasItem)) {
            const section = canvasItem as WidgetSection
            let foundAndUpdated = false
            
            const updatedAreas = section.areas.map((area: any) => {
              const updatedWidgets = area.widgets.map((widget: any) => {
                if (widget.type === 'tabs' && widget.id === tabsWidgetId) {
                  foundAndUpdated = true
                  const tabIndex = widget.tabs.findIndex((t: any) => t.id === tabId)
                  
                  if (tabIndex !== -1) {
                    const updatedTabs = [...widget.tabs]
                    updatedTabs[tabIndex] = {
                      ...updatedTabs[tabIndex],
                      widgets: [...(updatedTabs[tabIndex].widgets || []), newWidget]
                    }
                    
                    debugLog('log','🎯 Setting activeTabIndex to:', tabIndex, 'for dropped widget (in section)')
                    debugLog('log','📦 Tabs before update:', widget.tabs)
                    debugLog('log','📦 Tabs after update:', updatedTabs)
                    
                    return {
                      ...widget,
                      tabs: updatedTabs,
                      activeTabIndex: tabIndex
                    }
                  }
                }
                return widget
              })
              
              return { ...area, widgets: updatedWidgets }
            })
            
            if (foundAndUpdated) {
              return { ...section, areas: updatedAreas }
            }
          }
          
          return canvasItem
        })
        
        replaceCanvasItems(updatedCanvasItems)
        debugLog('log','✅ Widget added to tab panel!')
        return
      }
      
      // Case 0a: Dropped ON a specific widget (widget-target) - insert BEFORE that widget
      if (over.data?.current?.type === 'widget-target') {
        const targetWidgetId = over.data.current.widgetId
        const sectionId = over.data.current.sectionId
        const areaId = over.data.current.areaId
        
        // Create new widget from library item
        const newWidget = buildWidget(libraryItem)
        newWidget.sectionId = sectionId
        
        // First, check if this section is in siteLayout (global header/footer) - include DRAFT state too.
        const targetWebsite = websites.find((w: any) => w.id === currentWebsiteId)
        const targetSiteLayout = targetWebsite?.siteLayout
        const { getPageDraft, setPageDraft } = usePageStore.getState() as any
        const headerSiteDraft = getPageDraft ? getPageDraft(currentWebsiteId, getSiteLayoutDraftKey('header')) : null
        const footerSiteDraft = getPageDraft ? getPageDraft(currentWebsiteId, getSiteLayoutDraftKey('footer')) : null
        const headerInDraft = Array.isArray(headerSiteDraft) && headerSiteDraft.some((s: any) => s.id === sectionId)
        const footerInDraft = Array.isArray(footerSiteDraft) && footerSiteDraft.some((s: any) => s.id === sectionId)
        const headerInPublished = targetSiteLayout?.header?.some((s: any) => s.id === sectionId)
        const footerInPublished = targetSiteLayout?.footer?.some((s: any) => s.id === sectionId)
        const isHeaderGlobal = headerInDraft || !!headerInPublished
        const isFooterGlobal = footerInDraft || !!footerInPublished
        
        if (isHeaderGlobal || isFooterGlobal) {
          // This is a global section - write to WEBSITE-LEVEL DRAFT (do not commit immediately)
          const sectionType = isHeaderGlobal ? 'header' : 'footer'
          debugLog('log', '🌐 Widget-target drop in global siteLayout (' + sectionType + ')')
          const draftKey = getSiteLayoutDraftKey(sectionType)
          const baseSections =
            (getPageDraft ? getPageDraft(currentWebsiteId, draftKey) : null) ||
            JSON.parse(JSON.stringify(targetSiteLayout?.[sectionType] || []))

          const updatedSections = (baseSections || []).map((section: any) => {
            if (section.id !== sectionId) return section
            return {
              ...section,
              areas: section.areas?.map((area: any) => {
                if (area.id !== areaId) return area
                const widgets = [...(area.widgets || [])]
                const targetIndex = widgets.findIndex((w: any) => w.id === targetWidgetId)
                if (targetIndex !== -1) widgets.splice(targetIndex, 0, newWidget)
                else widgets.push(newWidget)
                return { ...area, widgets }
              })
            }
          })
          setPageDraft?.(currentWebsiteId, draftKey, updatedSections)
          debugLog('log', '✅ Widget inserted before target in global ' + sectionType + '!')
          return
        }
        
        const updatedCanvasItems = canvasItems.map((canvasItem: CanvasItem) => {
          if (isSection(canvasItem) && canvasItem.id === sectionId) {
            return {
              ...canvasItem,
              areas: (canvasItem as WidgetSection).areas.map((area: any) => {
                if (area.id === areaId) {
                  const widgets = [...area.widgets]
                  const targetIndex = widgets.findIndex((w: any) => w.id === targetWidgetId)
                  
                  if (targetIndex !== -1) {
                    // Insert BEFORE the target widget
                    widgets.splice(targetIndex, 0, newWidget)
                  } else {
                    // Fallback: add at end if target not found
                    widgets.push(newWidget)
                  }
                  
                  return { ...area, widgets }
                }
                return area
              })
            }
          }
          return canvasItem
        })
        
        replaceCanvasItems(updatedCanvasItems)
        return
      }
      
      // Case 0b: Dropped into collapse panel (HIGHEST PRIORITY, similar to tab panel)
      if (over.data?.current?.type === 'collapse-panel') {
        debugLog('log','✅ Library widget dropped into collapse panel!', {
          libraryItem,
          panelId: over.data.current.panelId,
          widgetId: over.data.current.widgetId
        })
        
        const panelId = over.data.current.panelId
        const collapseWidgetId = over.data.current.widgetId
        
        // Create new widget from library item
        const newWidget = buildWidget(libraryItem)
        
        debugLog('log','🔧 Created widget:', newWidget.type, newWidget.id, 'for collapse panel:', panelId)
        
        // Find the collapse widget and the specific panel, update it with the new widget
        const updatedCanvasItems = canvasItems.map((canvasItem: CanvasItem) => {
          // Check if this is the collapse widget (standalone)
          if (canvasItem.type === 'collapse' && canvasItem.id === collapseWidgetId) {
            const collapseWidget = canvasItem as any // CollapseWidget
            const panelIndex = collapseWidget.panels.findIndex((p: any) => p.id === panelId)
            
            if (panelIndex !== -1) {
              const updatedPanels = [...collapseWidget.panels]
              updatedPanels[panelIndex] = {
                ...updatedPanels[panelIndex],
                widgets: [...(updatedPanels[panelIndex].widgets || []), newWidget]
              }
              
              debugLog('log','📦 Panels after update:', updatedPanels)
              
              return {
                ...collapseWidget,
                panels: updatedPanels
              }
            }
          }
          
          // Check if the collapse widget is inside a section
          if (isSection(canvasItem)) {
            const section = canvasItem as WidgetSection
            let foundAndUpdated = false
            
            const updatedAreas = section.areas.map((area: any) => {
              const updatedWidgets = area.widgets.map((widget: any) => {
                if (widget.type === 'collapse' && widget.id === collapseWidgetId) {
                  foundAndUpdated = true
                  const panelIndex = widget.panels.findIndex((p: any) => p.id === panelId)
                  
                  if (panelIndex !== -1) {
                    const updatedPanels = [...widget.panels]
                    updatedPanels[panelIndex] = {
                      ...updatedPanels[panelIndex],
                      widgets: [...(updatedPanels[panelIndex].widgets || []), newWidget]
                    }
                    
                    debugLog('log','📦 Panels after update (in section):', updatedPanels)
                    
                    return {
                      ...widget,
                      panels: updatedPanels
                    }
                  }
                }
                return widget
              })
              
              return { ...area, widgets: updatedWidgets }
            })
            
            if (foundAndUpdated) {
              return { ...section, areas: updatedAreas }
            }
          }
          
          return canvasItem
        })
        
        replaceCanvasItems(updatedCanvasItems)
        debugLog('log','✅ Widget added to collapse panel!')
        return
      }
      
      // Case 1: Dropped into existing section area (old behavior for backwards compatibility)
      if (over.data?.current?.type === 'section-area') {
        debugLog('log','✅ Library widget dropped into existing section area!')
        debugLog('log','📦 Target section:', over.data.current.sectionId)
        debugLog('log','📦 Target area:', over.data.current.areaId)
        const sectionId = over.data.current.sectionId
        const areaId = over.data.current.areaId
        
        // Create new widget from library item
        const newWidget = buildWidget(libraryItem)
        newWidget.sectionId = sectionId
        
        // First, check if this section is in siteLayout (global header/footer) - include DRAFT state too.
        const targetWebsite = websites.find((w: any) => w.id === currentWebsiteId)
        const targetSiteLayout = targetWebsite?.siteLayout
        const { getPageDraft, setPageDraft } = usePageStore.getState() as any
        const headerSiteDraft = getPageDraft ? getPageDraft(currentWebsiteId, getSiteLayoutDraftKey('header')) : null
        const footerSiteDraft = getPageDraft ? getPageDraft(currentWebsiteId, getSiteLayoutDraftKey('footer')) : null
        const headerInDraft = Array.isArray(headerSiteDraft) && headerSiteDraft.some((s: any) => s.id === sectionId)
        const footerInDraft = Array.isArray(footerSiteDraft) && footerSiteDraft.some((s: any) => s.id === sectionId)
        const headerInPublished = targetSiteLayout?.header?.some((s: any) => s.id === sectionId)
        const footerInPublished = targetSiteLayout?.footer?.some((s: any) => s.id === sectionId)
        const isHeaderGlobal = headerInDraft || !!headerInPublished
        const isFooterGlobal = footerInDraft || !!footerInPublished
        
        if (isHeaderGlobal || isFooterGlobal) {
          // This is a global section - write to WEBSITE-LEVEL DRAFT (do not commit immediately)
          const sectionType = isHeaderGlobal ? 'header' : 'footer'
          debugLog('log', '🌐 Section is in global siteLayout (' + sectionType + ')')
          const draftKey = getSiteLayoutDraftKey(sectionType)
          const baseSections =
            (getPageDraft ? getPageDraft(currentWebsiteId, draftKey) : null) ||
            JSON.parse(JSON.stringify(targetSiteLayout?.[sectionType] || []))

          const updatedSections = (baseSections || []).map((section: any) => {
            if (section.id !== sectionId) return section
            return {
              ...section,
              areas: section.areas?.map((area: any) => {
                if (area.id !== areaId) return area
                return { ...area, widgets: [...(area.widgets || []), newWidget] }
              })
            }
          })
          setPageDraft?.(currentWebsiteId, draftKey, updatedSections)
          debugLog('log', '✅ Widget added to global ' + sectionType + '!')
          return
        }
        
        // DEBUG: Log current canvas sections
        debugLog('log', '📋 Current canvas sections:', canvasItems.map((item: CanvasItem) => ({
          id: item.id,
          type: item.type,
          name: isSection(item) ? (item as WidgetSection).name : 'N/A',
          areas: isSection(item) ? (item as WidgetSection).areas.map(a => ({ id: a.id, name: a.name, widgetCount: a.widgets.length })) : []
        })))
        debugLog('log', '🎯 Looking for section:', sectionId, 'area:', areaId)
        
        let sectionFound = false
        let areaFound = false
        
        const updatedCanvasItems = canvasItems.map((canvasItem: CanvasItem) => {
          if (isSection(canvasItem) && canvasItem.id === sectionId) {
            sectionFound = true
            debugLog('log', '✅ Section FOUND:', canvasItem.id, '-', (canvasItem as WidgetSection).name)
            const updatedSection = {
              ...canvasItem,
              areas: (canvasItem as WidgetSection).areas.map((area: any) => {
                if (area.id === areaId) {
                  areaFound = true
                  debugLog('log', '✅ Area FOUND:', area.id, '-', area.name)
                  debugLog('log', '📝 BEFORE: Area has', area.widgets.length, 'widgets')
                  const updatedArea = { ...area, widgets: [...area.widgets, newWidget] }
                  debugLog('log', '📝 AFTER: Area has', updatedArea.widgets.length, 'widgets')
                  debugLog('log', '📝 Widget added at position:', area.widgets.length, '(end of array)')
                  return updatedArea
                }
                return area
              })
            }
            return updatedSection
          }
          return canvasItem
        })
        
        if (!sectionFound) {
          debugLog('error', '❌ ERROR: Section NOT FOUND with ID:', sectionId)
        }
        if (sectionFound && !areaFound) {
          debugLog('error', '❌ ERROR: Area NOT FOUND with ID:', areaId)
        }
        
        replaceCanvasItems(updatedCanvasItems)
        return
      }
      
      // Case 2: Dropped on canvas or section - AUTO-CREATE one-column section
      debugLog('log','🎯 Auto-creating one-column section for library widget!')
      
      // Create new widget
      const newWidget = buildWidget(libraryItem)
      
      // Create new one-column section with the widget
      const newSectionId = nanoid()
      const newAreaId = nanoid()
      newWidget.sectionId = newSectionId
      
      const newSection: WidgetSection = {
        id: newSectionId,
        type: 'content-block',
        name: `Section with ${libraryItem.label || newWidget.type}`,
        layout: 'one-column',
        areas: [
          {
            id: newAreaId,
            name: 'Content',
            widgets: [newWidget]
          }
        ],
        styling: {
          paddingTop: 'medium',
          paddingBottom: 'medium',
          paddingLeft: 'medium',
          paddingRight: 'medium',
          gap: 'medium'
        }
      }
      
      // Find insertion position based on where it was dropped
      let insertIndex = canvasItems.length // Default: add to end
      
      if (over?.id) {
        // If dropped over a section, insert after it
        const overSectionIndex = canvasItems.findIndex((item: CanvasItem) => item.id === over.id)
        if (overSectionIndex !== -1) {
          insertIndex = overSectionIndex + 1
          debugLog('log','📍 Inserting section after existing section at index:', insertIndex)
        }
      }
      
      const newCanvasItems = [...canvasItems]
      newCanvasItems.splice(insertIndex, 0, newSection)
      
      debugLog('log','✅ Created new section with widget:', {
        sectionId: newSectionId,
        widgetType: newWidget.type,
        widgetId: newWidget.id,
        insertIndex
      })
      
      replaceCanvasItems(newCanvasItems)
      return
    }
    
    // Handle standalone widget drop into section area (the missing scenario!)
    if ((active.data?.current?.type === 'canvas-widget' || 
         active.data?.current?.type === 'standalone-widget' || 
         !active.data?.current?.type || 
         active.data?.current?.type === 'sortable') && 
        over.data?.current?.type === 'section-area') {
      debugLog('log','✅ Standalone widget dropped into section area!')
      
      // Get widget from drag data if available, otherwise find by ID
      let widget: Widget
      if (active.data?.current?.type === 'canvas-widget') {
        widget = active.data.current.item as Widget
      } else if (active.data?.current?.type === 'standalone-widget') {
        widget = active.data.current.widget
      } else {
        const widgetId = active.id as string
        const { canvasItems } = usePageStore.getState()
        const foundWidget = canvasItems.find((item: CanvasItem) => item.id === widgetId && !isSection(item))
        if (!foundWidget) {
          debugLog('log','❌ Standalone widget not found')
          return
        }
        widget = foundWidget as Widget
      }
      
      const sectionId = over.data.current.sectionId
      const areaId = over.data.current.areaId
      const { replaceCanvasItems, canvasItems } = usePageStore.getState()
      
      // Remove widget from canvas and add to section area
      const newCanvasItems = canvasItems.filter((item: CanvasItem) => item.id !== widget.id)
      const updatedCanvasItems = newCanvasItems.map((canvasItem: CanvasItem) => {
        if (isSection(canvasItem) && canvasItem.id === sectionId) {
          const updatedWidget = { ...widget, sectionId: sectionId }
          return {
            ...canvasItem,
            areas: (canvasItem as WidgetSection).areas.map((area: any) => 
              area.id === areaId 
                ? { ...area, widgets: [...area.widgets, updatedWidget] }
                : area
            )
          }
        }
        return canvasItem
      })
      replaceCanvasItems(updatedCanvasItems)
      return
    }
    
    // Handle section widget movement - PRIORITY: section-widget drags should never go to canvas reordering
    if (active.data?.current?.type === 'section-widget') {
      debugLog('log','🚀 Section widget detected, checking drop location...', { 
        overId: over?.id, 
        overType: over?.data?.current?.type,
        overData: over?.data?.current 
      })

      const getGlobalRegionForSection = (sectionId: string): 'header' | 'footer' | null => {
        const targetWebsite = websites.find((w: any) => w.id === currentWebsiteId)
        const targetSiteLayout = targetWebsite?.siteLayout
        const { getPageDraft } = usePageStore.getState() as any
        const headerDraft = getPageDraft ? getPageDraft(currentWebsiteId, getSiteLayoutDraftKey('header')) : null
        const footerDraft = getPageDraft ? getPageDraft(currentWebsiteId, getSiteLayoutDraftKey('footer')) : null
        const inHeaderDraft = Array.isArray(headerDraft) && headerDraft.some((s: any) => s.id === sectionId)
        const inFooterDraft = Array.isArray(footerDraft) && footerDraft.some((s: any) => s.id === sectionId)
        const inHeaderPublished = targetSiteLayout?.header?.some((s: any) => s.id === sectionId)
        const inFooterPublished = targetSiteLayout?.footer?.some((s: any) => s.id === sectionId)
        if (inHeaderDraft || inHeaderPublished) return 'header'
        if (inFooterDraft || inFooterPublished) return 'footer'
        return null
      }
      
      // Case 0: Dropped ON a specific widget (widget-target) - insert BEFORE that widget
      if (over.data?.current?.type === 'widget-target') {
        const draggedWidget = active.data.current.widget
        const fromSectionId = active.data.current.fromSectionId
        const fromAreaId = active.data.current.fromAreaId
        const targetWidgetId = over.data.current.widgetId
        const targetSectionId = over.data.current.sectionId
        const targetAreaId = over.data.current.areaId
        
        // Check if moving within same area
        const isSameArea = fromSectionId === targetSectionId && fromAreaId === targetAreaId
        
        const globalRegion = getGlobalRegionForSection(targetSectionId) || getGlobalRegionForSection(fromSectionId)
        if (globalRegion) {
          const targetWebsite = websites.find((w: any) => w.id === currentWebsiteId)
          const targetSiteLayout = targetWebsite?.siteLayout
          const { getPageDraft, setPageDraft } = usePageStore.getState() as any
          const draftKey = getSiteLayoutDraftKey(globalRegion)
          const baseSections =
            (getPageDraft ? getPageDraft(currentWebsiteId, draftKey) : null) ||
            JSON.parse(JSON.stringify(targetSiteLayout?.[globalRegion] || []))

          const updatedSections = (baseSections || []).map((section: any) => {
            if (section.id !== fromSectionId && section.id !== targetSectionId) return section
            return {
              ...section,
              areas: section.areas?.map((area: any) => {
                // Same-area reordering
                if (isSameArea && area.id === fromAreaId && section.id === fromSectionId) {
                  const widgets = [...(area.widgets || [])]
                  const fromIndex = widgets.findIndex((w: any) => w.id === draggedWidget.id)
                  const toIndex = widgets.findIndex((w: any) => w.id === targetWidgetId)
                  if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
                    const [movedWidget] = widgets.splice(fromIndex, 1)
                    const adjustedToIndex = fromIndex < toIndex ? toIndex - 1 : toIndex
                    widgets.splice(adjustedToIndex, 0, movedWidget)
                  }
                  return { ...area, widgets }
                }

                // Cross-area: remove from source area
                if (!isSameArea && area.id === fromAreaId && section.id === fromSectionId) {
                  const widgets = (area.widgets || []).filter((w: Widget) => w.id !== draggedWidget.id)
                  return { ...area, widgets }
                }

                // Cross-area: insert into target area BEFORE target widget
                if (!isSameArea && area.id === targetAreaId && section.id === targetSectionId) {
                  const widgets = [...(area.widgets || [])]
                  const targetIndex = widgets.findIndex((w: any) => w.id === targetWidgetId)
                  const widgetToInsert = { ...draggedWidget, sectionId: targetSectionId }
                  if (targetIndex !== -1) {
                    widgets.splice(targetIndex, 0, widgetToInsert)
                  } else {
                    widgets.push(widgetToInsert)
                  }
                  return { ...area, widgets }
                }

                return area
              })
            }
          })

          setPageDraft?.(currentWebsiteId, draftKey, updatedSections)
          return
        }

        const { replaceCanvasItems, canvasItems } = usePageStore.getState()
        
        const updatedCanvasItems = canvasItems.map((canvasItem: CanvasItem) => {
          if (isSection(canvasItem)) {
            return {
              ...canvasItem,
              areas: (canvasItem as WidgetSection).areas.map((area: any) => {
                // Handle same-area reordering
                if (isSameArea && area.id === fromAreaId && canvasItem.id === fromSectionId) {
                  const widgets = [...area.widgets]
                  const fromIndex = widgets.findIndex((w: any) => w.id === draggedWidget.id)
                  const toIndex = widgets.findIndex((w: any) => w.id === targetWidgetId)
                  
                  if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
                    // Remove from current position
                    const [movedWidget] = widgets.splice(fromIndex, 1)
                    // Insert at new position (adjust if moving forward)
                    const adjustedToIndex = fromIndex < toIndex ? toIndex - 1 : toIndex
                    widgets.splice(adjustedToIndex, 0, movedWidget)
                  }
                  
                  return { ...area, widgets }
                }
                
                // Handle cross-area moves: Remove from source area
                if (!isSameArea && area.id === fromAreaId && canvasItem.id === fromSectionId) {
                  const widgets = area.widgets.filter((w: Widget) => w.id !== draggedWidget.id)
                  return { ...area, widgets }
                }
                
                // Handle cross-area moves: Insert into target area BEFORE target widget
                if (!isSameArea && area.id === targetAreaId && canvasItem.id === targetSectionId) {
                  const widgets = [...area.widgets]
                  const targetIndex = widgets.findIndex((w: any) => w.id === targetWidgetId)
                  
                  if (targetIndex !== -1) {
                    // Make sure sectionId is updated
                    const widgetToInsert = { ...draggedWidget, sectionId: targetSectionId }
                    // Insert BEFORE the target widget
                    widgets.splice(targetIndex, 0, widgetToInsert)
                  } else {
                    // Fallback: add at end if target not found
                    widgets.push({ ...draggedWidget, sectionId: targetSectionId })
                  }
                  
                  return { ...area, widgets }
                }
                
                return area
              })
            }
          }
          return canvasItem
        })
        
        replaceCanvasItems(updatedCanvasItems)
        return
      }
      
      // Case 0a: Dropped into tab panel
      if (over?.data?.current?.type === 'tab-panel') {
        debugLog('log','✅ Moving existing widget into tab panel!')
        const draggedWidget = active.data.current.widget
        const fromAreaId = active.data.current.fromAreaId
        const tabId = over.data.current.tabId
        const tabsWidgetId = over.data.current.widgetId
        
        const { replaceCanvasItems, canvasItems } = usePageStore.getState()
        
        // Remove from source area and add to tab panel
        const updatedCanvasItems = canvasItems.map((canvasItem: CanvasItem) => {
          // Update sections to remove widget from source area
          if (isSection(canvasItem)) {
            return {
              ...canvasItem,
              areas: (canvasItem as WidgetSection).areas.map((area: any) => {
                if (area.id === fromAreaId) {
                  return { ...area, widgets: area.widgets.filter((w: Widget) => w.id !== draggedWidget.id) }
                }
                
                // Also check if this area contains the tabs widget that needs updating
                const updatedWidgets = area.widgets.map((widget: any) => {
                  if (widget.type === 'tabs' && widget.id === tabsWidgetId) {
                    const tabIndex = widget.tabs.findIndex((t: any) => t.id === tabId)
                    if (tabIndex !== -1) {
                      const updatedTabs = [...widget.tabs]
                      updatedTabs[tabIndex] = {
                        ...updatedTabs[tabIndex],
                        widgets: [...(updatedTabs[tabIndex].widgets || []), draggedWidget]
                      }
                      return { ...widget, tabs: updatedTabs, activeTabIndex: tabIndex }
                    }
                  }
                  return widget
                })
                
                return { ...area, widgets: updatedWidgets }
              })
            }
          }
          
          // Also check standalone tabs widgets
          if (canvasItem.type === 'tabs' && canvasItem.id === tabsWidgetId) {
            const tabsWidget = canvasItem as any
            const tabIndex = tabsWidget.tabs.findIndex((t: any) => t.id === tabId)
            if (tabIndex !== -1) {
              const updatedTabs = [...tabsWidget.tabs]
              updatedTabs[tabIndex] = {
                ...updatedTabs[tabIndex],
                widgets: [...(updatedTabs[tabIndex].widgets || []), draggedWidget]
              }
              return { ...tabsWidget, tabs: updatedTabs, activeTabIndex: tabIndex }
            }
          }
          
          return canvasItem
        })
        
        replaceCanvasItems(updatedCanvasItems)
        debugLog('log','✅ Widget moved into tab panel!')
        return
      }
      
      // Case 0b: Dropped into collapse panel
      if (over?.data?.current?.type === 'collapse-panel') {
        debugLog('log','✅ Moving existing widget into collapse panel!')
        const draggedWidget = active.data.current.widget
        const fromAreaId = active.data.current.fromAreaId
        const panelId = over.data.current.panelId
        const collapseWidgetId = over.data.current.widgetId
        
        const { replaceCanvasItems, canvasItems } = usePageStore.getState()
        
        // Remove from source area and add to collapse panel
        const updatedCanvasItems = canvasItems.map((canvasItem: CanvasItem) => {
          // Update sections to remove widget from source area
          if (isSection(canvasItem)) {
            return {
              ...canvasItem,
              areas: (canvasItem as WidgetSection).areas.map((area: any) => {
                if (area.id === fromAreaId) {
                  return { ...area, widgets: area.widgets.filter((w: Widget) => w.id !== draggedWidget.id) }
                }
                
                // Also check if this area contains the collapse widget that needs updating
                const updatedWidgets = area.widgets.map((widget: any) => {
                  if (widget.type === 'collapse' && widget.id === collapseWidgetId) {
                    const panelIndex = widget.panels.findIndex((p: any) => p.id === panelId)
                    if (panelIndex !== -1) {
                      const updatedPanels = [...widget.panels]
                      updatedPanels[panelIndex] = {
                        ...updatedPanels[panelIndex],
                        widgets: [...(updatedPanels[panelIndex].widgets || []), draggedWidget]
                      }
                      return { ...widget, panels: updatedPanels }
                    }
                  }
                  return widget
                })
                
                return { ...area, widgets: updatedWidgets }
              })
            }
          }
          
          // Also check standalone collapse widgets
          if (canvasItem.type === 'collapse' && canvasItem.id === collapseWidgetId) {
            const collapseWidget = canvasItem as any
            const panelIndex = collapseWidget.panels.findIndex((p: any) => p.id === panelId)
            if (panelIndex !== -1) {
              const updatedPanels = [...collapseWidget.panels]
              updatedPanels[panelIndex] = {
                ...updatedPanels[panelIndex],
                widgets: [...(updatedPanels[panelIndex].widgets || []), draggedWidget]
              }
              return { ...collapseWidget, panels: updatedPanels }
            }
          }
          
          return canvasItem
        })
        
        replaceCanvasItems(updatedCanvasItems)
        debugLog('log','✅ Widget moved into collapse panel!')
        return
      }
      
      // Case 1: Dropped on specific section area OR on a widget
      if (over?.data?.current?.type === 'section-area' || over?.data?.current?.type === 'widget-target') {
        const draggedWidget = active.data.current.widget
        const fromAreaId = active.data.current.fromAreaId
        const toAreaId = over.data.current.areaId
        const targetSectionId = over.data.current.sectionId
        
        debugLog('log', '🎯 Section widget dropped on area:', {
          widgetType: draggedWidget.type,
          widgetId: draggedWidget.id,
          fromAreaId,
          toAreaId,
          dropType: over.data.current.type,
          targetSectionId: over.data.current.sectionId
        })
        
        const globalRegion = getGlobalRegionForSection(targetSectionId) || getGlobalRegionForSection(active.data.current.fromSectionId)

        // Handle reordering within the same area - detect drop position
        if (fromAreaId === toAreaId) {
          if (globalRegion) {
            const targetWebsite = websites.find((w: any) => w.id === currentWebsiteId)
            const targetSiteLayout = targetWebsite?.siteLayout
            const { getPageDraft, setPageDraft } = usePageStore.getState() as any
            const draftKey = getSiteLayoutDraftKey(globalRegion)
            const baseSections =
              (getPageDraft ? getPageDraft(currentWebsiteId, draftKey) : null) ||
              JSON.parse(JSON.stringify(targetSiteLayout?.[globalRegion] || []))

            const updatedSections = (baseSections || []).map((section: any) => {
              if (section.id !== targetSectionId) return section
              return {
                ...section,
                areas: section.areas?.map((area: any) => {
                  if (area.id !== fromAreaId) return area
                  const widgets = [...(area.widgets || [])]
                  const oldIndex = widgets.findIndex((w: Widget) => w.id === draggedWidget.id)
                  if (oldIndex === -1) return area
                  const [movedWidget] = widgets.splice(oldIndex, 1)
                  let newIndex = widgets.length
                  if (over.data?.current?.type === 'widget-target') {
                    const targetWidgetId = over.data.current.widgetId
                    const targetIndex = widgets.findIndex((w: Widget) => w.id === targetWidgetId)
                    if (targetIndex !== -1) newIndex = targetIndex
                  }
                  widgets.splice(newIndex, 0, movedWidget)
                  return { ...area, widgets }
                })
              }
            })

            setPageDraft?.(currentWebsiteId, draftKey, updatedSections)
            return
          }

          const { replaceCanvasItems, canvasItems } = usePageStore.getState()
          
          // Find the target section and area to get current widget positions
          const targetSection = canvasItems.find((item: CanvasItem) => isSection(item) && 
            (item as WidgetSection).areas.some(a => a.id === fromAreaId)
          ) as WidgetSection
          
          const targetArea = targetSection?.areas.find(a => a.id === fromAreaId)
          
          if (targetArea) {
            const widgets = [...targetArea.widgets]
            const oldIndex = widgets.findIndex((w: Widget) => w.id === draggedWidget.id)
            
            debugLog('log','📊 Widget positions BEFORE reorder:', {
              widgets: widgets.map((w, idx) => ({ index: idx, id: w.id, type: w.type })),
              draggingIndex: oldIndex,
              draggingWidget: draggedWidget.type,
              overId: over.id,
              overType: over.data?.current?.type
            })
            
            // Remove widget from current position
            const [movedWidget] = widgets.splice(oldIndex, 1)
            
            // Determine new position based on what we're dropping on
            let newIndex = widgets.length // Default: end
            
            // Check if we're dropping ON another widget (not just in the area)
            if (over.data?.current?.type === 'widget-target') {
              const targetWidgetId = over.data.current.widgetId
              // Find the index of the target widget (after removing the dragged widget)
              newIndex = widgets.findIndex((w: Widget) => w.id === targetWidgetId)
              if (newIndex !== -1) {
                debugLog('log','🎯 Dropping ON widget:', targetWidgetId, 'inserting at index:', newIndex)
              } else {
                newIndex = widgets.length
              }
            }
            
            // Insert at new position
            widgets.splice(newIndex, 0, movedWidget)
            
            debugLog('log','📊 Widget positions AFTER reorder:', {
              widgets: widgets.map((w, idx) => ({ index: idx, id: w.id, type: w.type })),
              oldIndex,
              newIndex: newIndex === widgets.length - 1 ? newIndex : newIndex, // Adjust for display
              moved: `${draggedWidget.type} moved from ${oldIndex} to ${newIndex}`
            })
            
            // Apply the changes
            const updatedCanvasItems = canvasItems.map((canvasItem: CanvasItem) => {
              if (isSection(canvasItem)) {
                return {
                  ...canvasItem,
                  areas: (canvasItem as WidgetSection).areas.map((area: any) => {
                    if (area.id === fromAreaId) {
                      return { ...area, widgets }
                    }
                    return area
                  })
                }
              }
              return canvasItem
            })
            replaceCanvasItems(updatedCanvasItems)
          }
          return
        }
        
        // Cross-section or cross-area move
        debugLog('log','✅ Moving widget to different section area!', {
          draggedWidget: draggedWidget.id,
          widgetType: draggedWidget.type,
          fromAreaId,
          toAreaId,
          targetSectionId
        })

        if (globalRegion) {
          const targetWebsite = websites.find((w: any) => w.id === currentWebsiteId)
          const targetSiteLayout = targetWebsite?.siteLayout
          const { getPageDraft, setPageDraft } = usePageStore.getState() as any
          const draftKey = getSiteLayoutDraftKey(globalRegion)
          const baseSections =
            (getPageDraft ? getPageDraft(currentWebsiteId, draftKey) : null) ||
            JSON.parse(JSON.stringify(targetSiteLayout?.[globalRegion] || []))

          const updatedSections = (baseSections || []).map((section: any) => {
            if (section.id !== active.data.current.fromSectionId && section.id !== targetSectionId) return section
            return {
              ...section,
              areas: section.areas?.map((area: any) => {
                if (area.id === fromAreaId && section.id === active.data.current.fromSectionId) {
                  return { ...area, widgets: (area.widgets || []).filter((w: Widget) => w.id !== draggedWidget.id) }
                }
                if (area.id === toAreaId && section.id === targetSectionId) {
                  const updatedWidget = { ...draggedWidget, sectionId: targetSectionId || '' }
                  return { ...area, widgets: [...(area.widgets || []), updatedWidget] }
                }
                return area
              })
            }
          })
          setPageDraft?.(currentWebsiteId, draftKey, updatedSections)
          return
        }

        const { replaceCanvasItems, canvasItems } = usePageStore.getState()
        
        // Verify the target section exists
        const targetSection = canvasItems.find((item: CanvasItem) => 
          isSection(item) && item.id === targetSectionId
        )
        
        if (!targetSection) {
          debugLog('error','❌ Target section not found!', {
            expectedSectionId: targetSectionId,
            availableSections: canvasItems.filter(isSection).map((s: any) => s.id)
          })
          return
        }
        
        debugLog('log','✅ Target section verified:', targetSection.id)
        
        const updatedCanvasItems = canvasItems.map((canvasItem: CanvasItem) => {
          if (isSection(canvasItem)) {
            return {
              ...canvasItem,
              areas: (canvasItem as WidgetSection).areas.map((area: any) => {
                // Remove from source area
                if (area.id === fromAreaId) {
                  debugLog('log','🗑️ Removing from source area:', fromAreaId, 'in section:', canvasItem.id)
                  return { ...area, widgets: area.widgets.filter((w: Widget) => w.id !== draggedWidget.id) }
                }
                // Add to target area with updated sectionId
                if (area.id === toAreaId) {
                  const updatedWidget = { ...draggedWidget, sectionId: targetSectionId || '' }
                  debugLog('log','➕ Adding to target area:', toAreaId, 'in section:', targetSectionId)
                  return { ...area, widgets: [...area.widgets, updatedWidget] }
                }
                return area
              })
            }
          }
          return canvasItem
        }).filter((item: CanvasItem | undefined): item is CanvasItem => item !== undefined)
        replaceCanvasItems(updatedCanvasItems)
        debugLog('log','✅ Widget moved between areas!')
        return
      }
      // Case 2: Dropped on section itself (find first available area)
      if (over?.data?.current?.type === 'section' || 
          (over?.id && typeof over.id === 'string' && canvasItems.some((item: CanvasItem) => item.id === over.id && isSection(item)))) {
        const targetSectionId = over.id as string
        debugLog('log','✅ Moving widget to section (first available area)!', { targetSectionId })
        const draggedWidget = active.data.current.widget
        const fromSectionId = active.data.current.fromSectionId
        const fromAreaId = active.data.current.fromAreaId
        
        debugLog('log','🎯 Cross-section move details:', {
          widgetId: draggedWidget.id,
          widgetType: draggedWidget.type,
          fromSectionId,
          fromAreaId,
          targetSectionId,
          isSameSection: fromSectionId === targetSectionId
        })
        
        // If dropping in the same section, don't do anything
        if (fromSectionId === targetSectionId) {
          debugLog('log','⚠️ Same section, no action needed')
          return
        }
        
        const globalRegion = getGlobalRegionForSection(targetSectionId) || getGlobalRegionForSection(fromSectionId)
        if (globalRegion) {
          const targetWebsite = websites.find((w: any) => w.id === currentWebsiteId)
          const targetSiteLayout = targetWebsite?.siteLayout
          const { getPageDraft, setPageDraft } = usePageStore.getState() as any
          const draftKey = getSiteLayoutDraftKey(globalRegion)
          const baseSections =
            (getPageDraft ? getPageDraft(currentWebsiteId, draftKey) : null) ||
            JSON.parse(JSON.stringify(targetSiteLayout?.[globalRegion] || []))

          const targetSection = (baseSections || []).find((s: any) => s.id === targetSectionId)
          if (!targetSection || !targetSection.areas?.length) return
          const firstAreaId = targetSection.areas[0].id

          const updatedSections = (baseSections || []).map((section: any) => {
            if (section.id !== fromSectionId && section.id !== targetSectionId) return section
            return {
              ...section,
              areas: section.areas?.map((area: any) => {
                if (area.id === fromAreaId && section.id === fromSectionId) {
                  return { ...area, widgets: (area.widgets || []).filter((w: Widget) => w.id !== draggedWidget.id) }
                }
                if (area.id === firstAreaId && section.id === targetSectionId) {
                  const updatedWidget = { ...draggedWidget, sectionId: targetSectionId }
                  return { ...area, widgets: [...(area.widgets || []), updatedWidget] }
                }
                return area
              })
            }
          })
          setPageDraft?.(currentWebsiteId, draftKey, updatedSections)
          return
        }

        const { replaceCanvasItems, canvasItems } = usePageStore.getState()
        
        // Find the target section and its first area
        const targetSection = canvasItems.find((item: CanvasItem) => item.id === targetSectionId && isSection(item)) as WidgetSection
        if (!targetSection || !targetSection.areas.length) {
          debugLog('log','❌ Target section not found or has no areas', { 
            targetSectionId, 
            foundSection: !!targetSection,
            hasAreas: targetSection?.areas?.length 
          })
          return
        }
        
        const firstAreaId = targetSection.areas[0].id
        debugLog('log','🎯 Target section found, first area:', firstAreaId)
        
        const updatedCanvasItems = canvasItems.map((canvasItem: CanvasItem) => {
          if (isSection(canvasItem)) {
            return {
              ...canvasItem,
              areas: (canvasItem as WidgetSection).areas.map((area: any) => {
                // Remove from source area
                if (area.id === fromAreaId) {
                  debugLog('log','🗑️ Removing widget from area:', area.id)
                  return { ...area, widgets: area.widgets.filter((w: Widget) => w.id !== draggedWidget.id) }
                }
                // Add to target area (first area of target section)
                if (area.id === firstAreaId) {
                  const updatedWidget = { ...draggedWidget, sectionId: targetSectionId }
                  debugLog('log','➕ Adding widget to area:', area.id)
                  return { ...area, widgets: [...area.widgets, updatedWidget] }
                }
                return area
              })
            }
          }
          return canvasItem
        })
        replaceCanvasItems(updatedCanvasItems)
        debugLog('log','✅ Widget moved to section first area!')
        return
      }
      
      // Case 3: Section widget dropped somewhere invalid - just return without doing anything
      debugLog('log','⚠️ Section widget dropped in invalid location, ignoring', {
        overId: over?.id,
        overType: over?.data?.current?.type
      })
      return
    }

    // Handle sidebar reordering FIRST - before regular canvas reordering
    const draggedItem = active.data?.current?.item
    const isDraggingSidebar = draggedItem && isSection(draggedItem) && draggedItem.type === 'sidebar'
    
    if (isDraggingSidebar && (over.data?.current?.type === 'section' || over.data?.current?.type === 'section-area')) {
      const targetSectionId = over.data?.current?.type === 'section' 
        ? over.id 
        : over.data?.current?.sectionId
        
      debugLog('log','✅ Sidebar dropped for reordering!', {
        sidebarId: draggedItem.id,
        targetSectionId: targetSectionId,
        dropType: over.data?.current?.type
      })
      
      const { replaceCanvasItems, canvasItems } = usePageStore.getState()
      const targetIndex = canvasItems.findIndex((item: CanvasItem) => item.id === targetSectionId)
      const sidebarIndex = canvasItems.findIndex((item: CanvasItem) => item.id === draggedItem.id)
      
      if (targetIndex !== -1 && sidebarIndex !== -1) {
        // Move sidebar to just before the target section
        const newCanvasItems = [...canvasItems]
        const [movedSidebar] = newCanvasItems.splice(sidebarIndex, 1)
        newCanvasItems.splice(targetIndex, 0, movedSidebar)
        
        // Calculate what sections this sidebar will now span
        const sidebarSpan = movedSidebar.sidebar?.span || 2
        const spannedSectionIds = []
        
        // Find the next 'span' number of sections after the sidebar
        for (let i = targetIndex + 1; i < Math.min(newCanvasItems.length, targetIndex + 1 + sidebarSpan); i++) {
          const item = newCanvasItems[i]
          if (isSection(item) && item.type !== 'sidebar') {
            spannedSectionIds.push(item.id)
          }
        }
        
        debugLog('log','🔄 Sidebar repositioned successfully', {
          sidebarId: movedSidebar.id,
          newPosition: targetIndex,
          spannedSections: spannedSectionIds,
          spanCount: sidebarSpan
        })
        
        replaceCanvasItems(newCanvasItems)
        
        // Force a re-render to recalculate heights
        setTimeout(() => {
          debugLog('log','📐 Recalculating sidebar heights after repositioning')
        }, 100)
        
        return
      }
    }

    // Handle existing canvas item reordering (sections and standalone widgets) - EXCLUDE section-widgets and sidebars!
    if ((!active.data?.current?.type || 
        active.data?.current?.type === 'canvas-section' ||
        active.data?.current?.type === 'canvas-widget' ||
        active.data?.current?.type === 'standalone-widget' ||
        (active.data?.current?.type !== 'library-widget' && 
         active.data?.current?.type !== 'section-widget')) && !isDraggingSidebar) {
      debugLog('log','🔄 Attempting canvas item reordering for canvas items')
      
      // For standalone-widget type, use the original sortable ID for comparison
      const activeItemId = active.data?.current?.type === 'standalone-widget' 
        ? active.data.current.originalSortableId 
        : active.id
      
      // If dropping over a section area, get the section ID instead of the drop zone ID
      let targetId = over.id
      if (over.data?.current?.type === 'section-area' && over.data?.current?.sectionId) {
        targetId = over.data.current.sectionId
        debugLog('log','🎯 Section dragged over section area, using section ID:', targetId)
      }
      
      if (activeItemId !== targetId) {
        const { moveItem } = usePageStore.getState()
        const oldIndex = canvasItems.findIndex((item: CanvasItem) => item.id === activeItemId)
        const newIndex = canvasItems.findIndex((item: CanvasItem) => item.id === targetId)
        
        debugLog('log','📋 Canvas reorder:', { oldIndex, newIndex, activeItemId, targetId, originalOverId: over.id })
        
        if (oldIndex !== -1 && newIndex !== -1) {
          debugLog('log','✅ Canvas item reordered!')
          moveItem(oldIndex, newIndex)
        } else {
          debugLog('log','❌ Canvas item reorder failed - items not found')
        }
      }
    }
    
    
    // Debug: Catch unhandled drag cases
    debugLog('log','⚠️ Unhandled drag case:', {
      activeId: active.id,
      activeType: active.data?.current?.type,
      overId: over?.id,
      overType: over?.data?.current?.type,
      overData: over?.data?.current
    })
  }

  const handleAddSection = (relativeTo: string, position: 'above' | 'below') => {
    setInsertPosition({ relativeTo, position })
    setShowLayoutPicker(true)
  }

  // Replace Zone: Opens confirmation modal, then layout picker to replace a section while keeping its zoneSlug
  const handleReplaceZone = (zoneSlug: string) => {
    // Find the section with this zoneSlug
    const section = canvasItems.find((item: CanvasItem) => 
      isSection(item) && (item as WidgetSection).zoneSlug === zoneSlug
    ) as WidgetSection | undefined
    
    if (!section) {
      showToast?.(`Zone "${zoneSlug}" not found`, 'error')
      return
    }
    
    debugLog('log', '🔄 [PageBuilder] handleReplaceZone called:', { zoneSlug, sectionId: section.id })
    setReplaceZoneSlug(zoneSlug)
    setReplaceSectionId(section.id)
    // Show confirmation modal first (before layout picker)
    setShowReplaceZoneModal(true)
  }

  // Replace Section Layout: Same workflow as Replace Zone, but works for normal sections without zoneSlug.
  const handleReplaceSectionLayout = (sectionId: string) => {
    const section = canvasItems.find((item: CanvasItem) => isSection(item) && item.id === sectionId) as WidgetSection | undefined
    if (!section) {
      showToast?.('Section not found', 'error')
      return
    }
    debugLog('log', '🔄 [PageBuilder] handleReplaceSectionLayout called:', { sectionId })
    setReplaceCanvasSectionId(sectionId)
    setShowReplaceZoneModal(true)
  }

  // Replace Header/Footer: Same workflow (confirmation modal → layout picker), but targets the page shell region.
  const handleReplacePageShell = (region: 'header' | 'footer') => {
    if (!currentWebsiteId) return
    debugLog('log', '🔄 [PageBuilder] handleReplacePageShell called:', { region })
    setReplacePageShellRegion(region)
    // If there is existing content, show the confirmation modal (preserve options).
    const existing = region === 'header' ? headerSections : footerSections
    const hasExisting = Array.isArray(existing) && existing.length > 0
    if (hasExisting) {
      setShowReplaceZoneModal(true)
    } else {
      // No existing content: go straight to layout picker (defaults will apply).
      setReplaceZonePreserveOptions({ preserveBackground: true, preservePadding: true, preserveContentMode: true })
      setShowLayoutPicker(true)
    }
  }

  // Handler for when user confirms in ReplaceZoneModal
  const handleReplaceZoneConfirm = (preserveOptions: PreserveOptions) => {
    setReplaceZonePreserveOptions(preserveOptions)
    setShowReplaceZoneModal(false)
    // Now show the layout picker
    setShowLayoutPicker(true)
  }

  // Handler for when user cancels ReplaceZoneModal
  const handleReplaceZoneCancel = () => {
    setShowReplaceZoneModal(false)
    setReplaceZoneSlug(null)
    setReplaceSectionId(null)
    setReplacePageShellRegion(null)
    setReplaceCanvasSectionId(null)
    setReplaceZonePreserveOptions(null)
  }

  const handleSelectLayout = (layout: ContentBlockLayout) => {
    const buildReplacementSection = (
      oldSection: WidgetSection | null,
      nextLayout: ContentBlockLayout,
      nextAreas: { id: string; name: string; widgets: Widget[] }[],
      preserveOptions: PreserveOptions | null,
      overrides?: Partial<WidgetSection>
    ): WidgetSection => {
      const preserve = preserveOptions || { preserveBackground: true, preservePadding: true, preserveContentMode: true }
      const base: Partial<WidgetSection> = {}

      if (oldSection) {
        // Always carry core behavior/role metadata
        base.type = oldSection.type
        base.role = oldSection.role
        base.behavior = oldSection.behavior
        base.overlay = oldSection.overlay
        base.locked = oldSection.locked
        base.zoneSlug = oldSection.zoneSlug
        base.name = oldSection.name

        // Preserve visual config based on user choice
        if (preserve.preserveBackground && oldSection.background) {
          base.background = oldSection.background
        }
        if (preserve.preservePadding) {
          base.padding = oldSection.padding
          base.minHeight = oldSection.minHeight
          base.styling = oldSection.styling
        }
        if (preserve.preserveContentMode) {
          base.contentMode = oldSection.contentMode
        }
      }

      return {
        id: nanoid(),
        name: base.name || 'Section',
        type: base.type || 'section',
        layout: nextLayout,
        areas: nextAreas,
        ...(base.background && { background: base.background }),
        ...(base.styling && { styling: base.styling }),
        ...(base.padding && { padding: base.padding }),
        ...(base.minHeight && { minHeight: base.minHeight }),
        ...(base.contentMode && { contentMode: base.contentMode }),
        ...(base.behavior && { behavior: base.behavior }),
        ...(base.role && { role: base.role }),
        ...(base.overlay && { overlay: base.overlay }),
        ...(base.locked !== undefined && { locked: base.locked }),
        ...(base.zoneSlug && { zoneSlug: base.zoneSlug }),
        ...(overrides || {})
      }
    }

    if (replaceZoneSlug && replaceSectionId) {
      // Replace Zone mode: Create new section with same zoneSlug
      const oldSection = canvasItems.find((item: CanvasItem) => item.id === replaceSectionId) as WidgetSection | undefined
      if (!oldSection) {
        setShowLayoutPicker(false)
        setReplaceZoneSlug(null)
        setReplaceSectionId(null)
        return
      }
      
      // Collect ALL widgets from the old section (from all areas)
      const allExistingWidgets: Widget[] = []
      oldSection.areas?.forEach(area => {
        if (area.widgets && area.widgets.length > 0) {
          allExistingWidgets.push(...area.widgets)
        }
      })
      
      debugLog('log', '🔄 [PageBuilder] Collecting widgets from old section:', {
        oldLayout: oldSection.layout,
        widgetCount: allExistingWidgets.length,
        widgetTypes: allExistingWidgets.map(w => w.type)
      })
      
      // Create the layout structure based on selected layout
      // Put all existing widgets in the FIRST area of the new layout
      let areas: { id: string; name: string; widgets: Widget[] }[] = []
      let flexConfig: WidgetSection['flexConfig'] = undefined
      let gridConfig: WidgetSection['gridConfig'] = undefined
      
      switch (layout) {
        case 'flexible':
          areas = [{ id: 'main', name: 'Main', widgets: allExistingWidgets }]
          flexConfig = { direction: 'row', wrap: false, justifyContent: 'flex-start', gap: '1rem' }
          break
        case 'grid':
          areas = [{ id: 'main', name: 'Grid Items', widgets: allExistingWidgets }]
          gridConfig = { columns: 3, gap: '1rem' }
          break
        case 'one-column':
          areas = [{ id: 'main', name: 'Main', widgets: allExistingWidgets }]
          break
        case 'two-columns':
          areas = [
            { id: 'left', name: 'Left', widgets: allExistingWidgets },
            { id: 'right', name: 'Right', widgets: [] }
          ]
          break
        case 'three-columns':
          areas = [
            { id: 'left', name: 'Left', widgets: allExistingWidgets },
            { id: 'center', name: 'Center', widgets: [] },
            { id: 'right', name: 'Right', widgets: [] }
          ]
          break
        case 'one-third-left':
          areas = [
            { id: 'sidebar', name: 'Sidebar (1/3)', widgets: [] },
            { id: 'main', name: 'Main (2/3)', widgets: allExistingWidgets }
          ]
          break
        case 'one-third-right':
          areas = [
            { id: 'main', name: 'Main (2/3)', widgets: allExistingWidgets },
            { id: 'sidebar', name: 'Sidebar (1/3)', widgets: [] }
          ]
          break
        default:
          areas = [{ id: 'main', name: 'Main', widgets: allExistingWidgets }]
      }
      
      // Create new section with same zoneSlug but new layout
      const newSection: WidgetSection = buildReplacementSection(
        oldSection,
        layout,
        areas,
        replaceZonePreserveOptions,
        {
          name: oldSection.name || `${replaceZoneSlug} Section`,
          zoneSlug: replaceZoneSlug,
          ...(flexConfig && { flexConfig }),
          ...(gridConfig && { gridConfig })
        }
      )
      
      // Replace old section with new one
      const newCanvasItems = canvasItems.map((item: CanvasItem) => 
        item.id === replaceSectionId ? newSection : item
      )
      
      // Update canvas
      replaceCanvasItems(newCanvasItems)
      
      // CRITICAL: Select the NEW SECTION (not a widget) to show section properties
      // This keeps the user focused on the section they just replaced
      queueMicrotask(() => {
        // Select the new section by its ID - this shows section properties panel
        selectWidget(newSection.id)
        debugLog('log', '🎯 [PageBuilder] Selected new section after replace:', newSection.id)
        
        // Highlight the section type indicator to show the layout changed
        setHighlightSectionType(true)
        setTimeout(() => {
          setHighlightSectionType(false)
        }, 2500) // Highlight for 2.5 seconds
      })
      
      debugLog('log', '✅ [PageBuilder] Zone replaced:', { 
        zoneSlug: replaceZoneSlug, 
        oldLayout: oldSection.layout, 
        newLayout: layout,
        widgetsPreserved: allExistingWidgets.length
      })
      const widgetMsg = allExistingWidgets.length > 0 
        ? ` (${allExistingWidgets.length} widget${allExistingWidgets.length !== 1 ? 's' : ''} preserved)` 
        : ''
      showToast?.(`Zone "${replaceZoneSlug}" layout changed to ${layout}${widgetMsg}`, 'success')
      
      // Reset replace zone state
      setReplaceZoneSlug(null)
      setReplaceSectionId(null)
      setReplaceZonePreserveOptions(null)
    } else if (replaceCanvasSectionId) {
      const oldSection = canvasItems.find((item: CanvasItem) => item.id === replaceCanvasSectionId) as WidgetSection | undefined
      if (!oldSection) {
        setShowLayoutPicker(false)
        setReplaceCanvasSectionId(null)
        return
      }

      const allExistingWidgets: Widget[] = []
      oldSection.areas?.forEach(area => {
        if (area.widgets && area.widgets.length > 0) {
          allExistingWidgets.push(...area.widgets)
        }
      })

      let areas: { id: string; name: string; widgets: Widget[] }[] = []
      let flexConfig: WidgetSection['flexConfig'] = undefined
      let gridConfig: WidgetSection['gridConfig'] = undefined
      switch (layout) {
        case 'flexible':
          areas = [{ id: 'main', name: 'Main', widgets: allExistingWidgets }]
          flexConfig = { direction: 'row', wrap: false, justifyContent: 'flex-start', gap: '1rem' }
          break
        case 'grid':
          areas = [{ id: 'main', name: 'Grid Items', widgets: allExistingWidgets }]
          gridConfig = { columns: 3, gap: '1rem' }
          break
        case 'two-columns':
          areas = [
            { id: 'left', name: 'Left', widgets: allExistingWidgets },
            { id: 'right', name: 'Right', widgets: [] }
          ]
          break
        case 'three-columns':
          areas = [
            { id: 'left', name: 'Left', widgets: allExistingWidgets },
            { id: 'center', name: 'Center', widgets: [] },
            { id: 'right', name: 'Right', widgets: [] }
          ]
          break
        case 'one-third-left':
          areas = [
            { id: 'sidebar', name: 'Sidebar (1/3)', widgets: [] },
            { id: 'main', name: 'Main (2/3)', widgets: allExistingWidgets }
          ]
          break
        case 'one-third-right':
          areas = [
            { id: 'main', name: 'Main (2/3)', widgets: allExistingWidgets },
            { id: 'sidebar', name: 'Sidebar (1/3)', widgets: [] }
          ]
          break
        default:
          areas = [{ id: 'main', name: 'Main', widgets: allExistingWidgets }]
      }

      const newSection: WidgetSection = buildReplacementSection(
        oldSection,
        layout,
        areas,
        replaceZonePreserveOptions,
        {
          name: oldSection.name || 'Section',
          ...(flexConfig && { flexConfig }),
          ...(gridConfig && { gridConfig })
        }
      )

      const newCanvasItems = canvasItems.map((item: CanvasItem) =>
        item.id === replaceCanvasSectionId ? newSection : item
      )

      replaceCanvasItems(newCanvasItems)
      queueMicrotask(() => {
        selectWidget(newSection.id)
        setHighlightSectionType(true)
        setTimeout(() => setHighlightSectionType(false), 2500)
      })

      setReplaceCanvasSectionId(null)
      setReplaceZonePreserveOptions(null)
    } else if (replacePageShellRegion) {
      // Replace Header/Footer (page shell): replace the region draft with a NEW single section layout.
      const region = replacePageShellRegion
      const existingSections = region === 'header' ? headerSections : footerSections
      const oldPrimary = (existingSections && existingSections.length > 0 ? (existingSections[0] as WidgetSection) : null)

      // Collect ALL widgets from ALL existing sections in this region.
      const allExistingWidgets: Widget[] = []
      ;(existingSections || []).forEach((s: any) => {
        const sec = s as any
        sec.areas?.forEach((area: any) => {
          if (area.widgets && area.widgets.length > 0) {
            allExistingWidgets.push(...area.widgets)
          }
        })
      })

      // Build areas for the chosen layout; put all existing widgets in the first area.
      let areas: { id: string; name: string; widgets: Widget[] }[] = []
      let flexConfig: WidgetSection['flexConfig'] = undefined
      let gridConfig: WidgetSection['gridConfig'] = undefined
      switch (layout) {
        case 'flexible':
          areas = [{ id: 'main', name: 'Main', widgets: allExistingWidgets }]
          flexConfig = { direction: 'row', wrap: false, justifyContent: 'flex-start', gap: '1rem' }
          break
        case 'grid':
          areas = [{ id: 'main', name: 'Grid Items', widgets: allExistingWidgets }]
          gridConfig = { columns: 3, gap: '1rem' }
          break
        case 'two-columns':
          areas = [
            { id: 'left', name: 'Left', widgets: allExistingWidgets },
            { id: 'right', name: 'Right', widgets: [] }
          ]
          break
        case 'three-columns':
          areas = [
            { id: 'left', name: 'Left', widgets: allExistingWidgets },
            { id: 'center', name: 'Center', widgets: [] },
            { id: 'right', name: 'Right', widgets: [] }
          ]
          break
        case 'one-third-left':
          areas = [
            { id: 'sidebar', name: 'Sidebar (1/3)', widgets: [] },
            { id: 'main', name: 'Main (2/3)', widgets: allExistingWidgets }
          ]
          break
        case 'one-third-right':
          areas = [
            { id: 'main', name: 'Main (2/3)', widgets: allExistingWidgets },
            { id: 'sidebar', name: 'Sidebar (1/3)', widgets: [] }
          ]
          break
        default:
          areas = [{ id: 'main', name: 'Main', widgets: allExistingWidgets }]
      }

      const newSection: WidgetSection = buildReplacementSection(
        oldPrimary,
        layout,
        areas,
        replaceZonePreserveOptions,
        {
          name: region === 'header' ? 'Header' : 'Footer',
          role: region === 'header' ? 'header' : 'footer',
          ...(flexConfig && { flexConfig }),
          ...(gridConfig && { gridConfig })
        }
      )

      // Save as a GLOBAL shell draft; scope will be decided at Publish.
      setPageDraft?.(currentWebsiteId, getSiteLayoutDraftKey(region), [newSection])

      // Keep region selected (Header/Footer properties remain visible)
      queueMicrotask(() => {
        selectWidget?.(getGlobalRegionSelectionId(region))
      })

      setReplacePageShellRegion(null)
      setReplaceZonePreserveOptions(null)
    } else {
      // Normal Add Section mode
      createContentBlockWithLayout(layout)
    }
    setShowLayoutPicker(false)
  }

  const handleSectionClick = (sectionId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Close any widget toolbar and toggle section toolbar
    setActiveWidgetToolbar(null)
    handleSetActiveSectionToolbar(activeSectionToolbar === sectionId ? null : sectionId)
    selectWidget(sectionId)
  }

  const handleWidgetClick = (widgetId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    debugLog('log','🖱️ Widget clicked for properties:', { widgetId })
    
    // Find the widget to check its sectionId - use same logic as Properties Panel
    let widget: Widget | undefined = canvasItems.find((item: CanvasItem) => item.id === widgetId && !isSection(item)) as Widget
    
    // If not found at canvas level, search within section areas
    if (!widget) {
      // Search in canvas sections
      for (const canvasItem of canvasItems) {
        if (isSection(canvasItem)) {
          for (const area of canvasItem.areas) {
            const foundWidget = area.widgets.find((w: Widget) => w.id === widgetId)
            if (foundWidget) {
              widget = foundWidget
              break
            }
          }
          if (widget) break
        }
      }
    }
    
    // Also search in header/footer sections (global sections)
    if (!widget) {
      const globalSections = [...headerSections, ...footerSections]
      for (const section of globalSections) {
        if (section.areas) {
          for (const area of section.areas) {
            const foundWidget = area.widgets?.find((w: Widget) => w.id === widgetId)
            if (foundWidget) {
              widget = foundWidget
              break
            }
          }
          if (widget) break
        }
      }
    }
    
    if (widget) {
      debugLog('log','📋 Widget found for properties:', { 
        id: widget.id, 
        type: widget.type,
        sectionId: widget.sectionId || 'standalone'
      })
    } else {
      debugLog('log','❌ Widget not found for properties:', { widgetId })
    }
    
    // Only close section toolbar if widget is not part of the currently active section
    if (!widget?.sectionId || activeSectionToolbar !== widget.sectionId) {
      handleSetActiveSectionToolbar(null)
    }
    
    setActiveWidgetToolbar(activeWidgetToolbar === widgetId ? null : widgetId)
    selectWidget(widgetId)
  }
  
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={customCollisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToWindowEdges]}
    >
      <div 
        className="h-screen bg-slate-50 flex overflow-hidden"
        style={{ 
          scrollBehavior: 'auto',
          scrollPaddingTop: 0,
          scrollMarginTop: 0
        }}
        onClick={(e) => {
          // Only close toolbars if clicking directly on this div, not on children
          if (e.target === e.currentTarget) {
            handleSetActiveSectionToolbar(null)
            setActiveWidgetToolbar(null)
          }
        }}
      >
        <div className="w-80 bg-slate-100 shadow-sm border-r border-slate-200 flex sticky top-0 h-screen">
          <div className="w-16 border-r border-slate-200 bg-slate-50">
            <div className="flex flex-col">
              {[
                { id: 'library', label: 'Library', icon: BookOpen },
                { id: 'sections', label: 'Sections', icon: Plus },
                { id: 'diy-zone', label: 'DIY Zone', icon: Lightbulb },
                { id: 'schema-content', label: 'Schema', icon: FileText }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setLeftSidebarTab(tab.id as LeftSidebarTab)}
                  className={`flex flex-col items-center gap-1 px-2 py-4 text-xs font-medium border-l-2 transition-colors ${
                    leftSidebarTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-slate-100'
                  }`}
                  title={tab.label}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="leading-none">{tab.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex-1 flex flex-col overflow-y-auto p-4">
            {leftSidebarTab === 'library' && <WidgetLibrary usePageStore={usePageStore} buildWidget={buildWidget} />}
            {leftSidebarTab === 'sections' && <SectionsContent showToast={showToast} usePageStore={usePageStore} />}
            {leftSidebarTab === 'diy-zone' && <DIYZoneContent showToast={showToast} usePageStore={usePageStore} buildWidget={buildWidget} />}
            {leftSidebarTab === 'schema-content' && <SchemaContentTab onCreateSchema={handleCreateSchema} usePageStore={usePageStore} selectSchemaObject={selectSchemaObject} />}
          </div>
        </div>

        <div 
          className="flex-1 flex flex-col h-screen overflow-y-auto"
          style={{
            scrollBehavior: 'auto',
            scrollPaddingTop: 0
          }}
        >
            <div className="border-b bg-white px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="relative flex items-center">
                <img 
                  src="/catalyst-PB.png" 
                  alt="Catalyst Page Builder" 
                  className="h-16 w-16 object-contain"
                />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Page Builder</h1>
                  <p className="text-sm text-gray-500 mt-1">Theme: <span className="font-medium text-gray-700">{themeName}</span></p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Template Publishing Button */}
                {isTemplateEdit && templateEditingContext && (
                  <button
                    onClick={() => {
                      const affectedCount = templateEditingContext.scope === 'journal' 
                        ? '2-15 issues' 
                        : templateEditingContext.scope === 'issue-type'
                          ? '25+ issues across journals'
                          : '100+ issues (all journals)'
                      
                      addNotification({
                        type: 'success',
                        title: 'Template Changes Published!',
                        message: `Template propagated to ${affectedCount}. Individual customizations preserved where possible.`
                      })
                      
                      // Clear template editing context
                      const { setTemplateEditingContext } = usePageStore.getState()
                      setTemplateEditingContext(null)
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Publish Template Changes
                  </button>
                )}
                
                {/* Save & Publish Button - Show for all modes except template edit and user template mode */}
                {!isTemplateEdit && !isUserTemplateMode && (
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      // In archetype mode, use the onSaveArchetype callback
                      if (archetypeMode && onSaveArchetype) {
                        onSaveArchetype()
                      } else {
                        handleSaveAndPublish()
                      }
                    }}
                    className="relative z-10 flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 active:bg-green-800 transition-colors cursor-pointer"
                    type="button"
                    style={{ pointerEvents: 'auto' }}
                  >
                    <Save className="w-4 h-4" />
                    Save & Publish
                    {/* Badge showing pending changes count */}
                    {/* For archetype mode: show archetypeModifiedSections */}
                    {/* For page instance mode: show dirty zones count */}
                    {/* For non-archetype pages: show modified sections count */}
                    {(() => {
                      // Determine badge count based on mode
                      let badgeCount = 0
                      let badgeTitle = ''
                      
                      if (archetypeMode) {
                        badgeCount = archetypeModifiedSections.size
                        badgeTitle = `${badgeCount} modified section${badgeCount === 1 ? '' : 's'}`
                      } else if (pageInstanceMode) {
                        badgeCount = dirtyZones.size
                        badgeTitle = `${badgeCount} pending change${badgeCount === 1 ? '' : 's'}`
                      } else {
                        badgeCount = modifiedSections.size
                        badgeTitle = `${badgeCount} modified section${badgeCount === 1 ? '' : 's'}`
                      }

                      // Header/Footer page overrides use the same draft lifecycle as the page body.
                      // If there are pending drafts for header-${pageId} / footer-${pageId}, include them
                      // in the badge so users know Save & Publish is required to commit.
                      if (!archetypeMode && currentWebsiteId && currentPageId) {
                        const state = usePageStore.getState() as any
                        const getPageDraft = state.getPageDraft
                        const headerDraft =
                          getPageDraft && headerOverrideMode === 'page-edit'
                            ? getPageDraft(currentWebsiteId, `header-${currentPageId}`)
                            : null
                        const footerDraft =
                          getPageDraft && footerOverrideMode === 'page-edit'
                            ? getPageDraft(currentWebsiteId, `footer-${currentPageId}`)
                            : null
                        const headerGlobalDraft = getPageDraft ? getPageDraft(currentWebsiteId, getSiteLayoutDraftKey('header')) : null
                        const footerGlobalDraft = getPageDraft ? getPageDraft(currentWebsiteId, getSiteLayoutDraftKey('footer')) : null

                        const headerPending =
                          (Array.isArray(headerDraft) && headerDraft.length > 0) ||
                          (Array.isArray(headerGlobalDraft) && headerGlobalDraft.length > 0)
                        const footerPending =
                          (Array.isArray(footerDraft) && footerDraft.length > 0) ||
                          (Array.isArray(footerGlobalDraft) && footerGlobalDraft.length > 0)
                        
                        // Also count draft-only visibility (hide/show) and enabled/disabled changes,
                        // which live outside the section-array drafts.
                        const overridesKey = `${currentWebsiteId}:${currentPageId}`
                        const publishedOverrides = (state.pageLayoutOverrides || {})[overridesKey] || {}
                        const draftOverrides = (state.pageLayoutOverridesDraft || {})[overridesKey] || {}
                        const headerVisibilityPending = (draftOverrides.headerOverride !== undefined) && (draftOverrides.headerOverride !== (publishedOverrides.headerOverride || 'global'))
                        const footerVisibilityPending = (draftOverrides.footerOverride !== undefined) && (draftOverrides.footerOverride !== (publishedOverrides.footerOverride || 'global'))
                        
                        const website = (state.websites || []).find((w: any) => w.id === currentWebsiteId)
                        const siteLayout = website?.siteLayout || {}
                        const draftSiteLayoutSettings = state.getSiteLayoutDraftSettings ? state.getSiteLayoutDraftSettings(currentWebsiteId) : null
                        const headerEnabledPublished = siteLayout?.headerEnabled !== false
                        const footerEnabledPublished = siteLayout?.footerEnabled !== false
                        const headerEnabledPending = (draftSiteLayoutSettings?.headerEnabled !== undefined) && ((draftSiteLayoutSettings.headerEnabled !== false) !== headerEnabledPublished)
                        const footerEnabledPending = (draftSiteLayoutSettings?.footerEnabled !== undefined) && ((draftSiteLayoutSettings.footerEnabled !== false) !== footerEnabledPublished)

                        const chromePendingCount =
                          (headerPending || headerVisibilityPending || headerEnabledPending ? 1 : 0) +
                          (footerPending || footerVisibilityPending || footerEnabledPending ? 1 : 0)

                        if (chromePendingCount > 0) {
                          badgeCount += chromePendingCount
                          const parts: string[] = []
                          if (headerPending || headerVisibilityPending || headerEnabledPending) parts.push('header')
                          if (footerPending || footerVisibilityPending || footerEnabledPending) parts.push('footer')
                          badgeTitle = `${badgeCount} pending change${badgeCount === 1 ? '' : 's'} (includes ${parts.join(' & ')} draft${parts.length === 1 ? '' : 's'})`
                        }
                      }
                      
                      if (badgeCount > 0) {
                        return (
                          <span 
                            className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-green-600"
                            title={badgeTitle}
                          >
                            {badgeCount}
                          </span>
                        )
                      }
                      return null
                    })()}
                  </button>
                )}
                
                {/* Preview Changes and Design Console - Hide in user template mode (handled by TemplateEditor header) */}
                {!isUserTemplateMode && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        // If in archetype mode, navigate to archetype preview
                        if (archetypeMode && archetypeId) {
                          // CRITICAL: Save current canvas as draft before preview
                          // Use website-specific key if editing website master
                          const draftKey = archetypeWebsiteId 
                            ? `${archetypeWebsiteId}:${archetypeId}` 
                            : archetypeId
                          console.log('📝 [PageBuilder] Saving draft before preview:', draftKey)
                          console.log('   - canvasItems count:', canvasItems.length)
                          console.log('   - First section widgets:', canvasItems[0]?.areas?.[0]?.widgets?.map((w: any) => w.type))
                          setPageCanvas('archetype', draftKey, canvasItems)
                          
                          // Build preview URL with designId and optional websiteId
                          const params = new URLSearchParams()
                          if (designId) params.set('designId', designId)
                          if (archetypeWebsiteId) params.set('websiteId', archetypeWebsiteId)
                          const queryString = params.toString()
                          const previewPath = queryString 
                            ? `/preview/archetype/${archetypeId}?${queryString}`
                            : `/preview/archetype/${archetypeId}`
                          navigate(previewPath)
                          return
                        }
                        // Otherwise, use normal preview logic for page instance mode
                        // Always navigate to the proper live URL based on what we're editing
                        // Use store state for the website ID and current route
                        const websiteId = currentWebsiteId || 'catalyst-demo'
                        // Get the route from mockLiveSiteRoute (e.g., '/journal/jas', '/home', '/')
                        const route = mockLiveSiteRoute?.replace(/^\//, '') || ''
                        const pageKey = route || 'home'
                        
                        // CRITICAL: Save current canvas as draft before preview
                        // This ensures changes persist when returning from preview to edit
                        console.log('📝 [PageBuilder] Saving draft before preview (page mode):', { websiteId, pageKey })
                        setPageDraft(websiteId, pageKey, canvasItems)
                        
                        // Homepage is at /live/:websiteId (not /live/:websiteId/home)
                        const livePath = route === 'home' || route === '' 
                          ? `/live/${websiteId}` 
                          : `/live/${websiteId}/${route}`
                        navigate(livePath)
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Preview Changes
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        // Always set the view state first, then navigate if needed
                        setCurrentView('design-console')
                        // Check if we're in a routed context (URL-based editing) or V1 internal
                        if (window.location.pathname.startsWith('/edit/')) {
                          navigate('/v1')
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Design Console
                    </button>
                  </>
                )}
                
                {/* Notification Bell */}
                <NotificationBell />
              </div>
            </div>
            
            {/* Context-Aware Editing Indicators */}
            {isIndividualIssueEdit && (
              <div className="mt-3 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2 text-amber-800">
                  <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
                  <span className="text-sm font-medium">
                    Editing Individual Issue
                  </span>
                  <span className="text-xs text-amber-600">
                    • Inherited from {journalName} Template • Changes apply only to this issue
                  </span>
                </div>
              </div>
            )}
            
            {isTemplateEdit && templateEditingContext && (
              <div className="mt-3 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3 text-blue-800">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <span className="text-sm font-medium">
                      {templateEditingContext.scope === 'journal' && `Editing ${journalName} Template`}
                      {templateEditingContext.scope === 'issue-type' && `Editing ${templateEditingContext.issueType === 'current' ? 'Current Issues' : 'Issue Type'} Template`}
                      {templateEditingContext.scope === 'global' && 'Editing Global Template'}
                    </span>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-blue-600">
                        Changes will propagate to: {
                          templateEditingContext.scope === 'journal' 
                            ? `All ${journalName} issues`
                            : templateEditingContext.scope === 'issue-type'
                              ? `All ${templateEditingContext.issueType} issues (all journals)`
                              : 'All issues (all journals)'
                        }
                      </span>
                      <button 
                        className="text-xs text-blue-700 hover:text-blue-900 underline"
                        onClick={() => {
                          addNotification({
                            type: 'info',
                            title: 'Propagation Preview',
                            message: `Template changes affect: ${templateEditingContext.affectedIssues.join(', ')}`
                          })
                        }}
                      >
                        Preview affected issues →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 p-6 bg-slate-50 overflow-y-auto overflow-x-hidden" onClick={() => selectWidget(null)}>
            {/* Removed redundant template banner - handled by TemplateCanvas */}

            {/* Template Canvas - Handles loading template sections */}
            <TemplateCanvas
              editingContext={editingContext}
              mockLiveSiteRoute={mockLiveSiteRoute}
              onSectionsLoad={handleTemplateSectionsLoad}
            />
            
            {/* Page Instance Editing Context - Removed: Info now shown in Page Status panel */}
            
            {/* Archetype Editing Context - Yellow bar to indicate master template editing */}
            {archetypeMode && displayArchetypeName && (
              <div className="mb-2 flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-md px-4 py-2">
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-700">
                    {archetypeWebsiteId ? '📄' : '🏛️'} Editing: <strong>{displayArchetypeName}</strong>
                    <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded bg-yellow-200 text-yellow-800">
                      {archetypeWebsiteId ? 'Website Master' : 'Design Master'}
                    </span>
                  </div>
                  {archetypeInstanceCount > 0 && (
                    <span className="text-sm text-gray-500">
                      {archetypeWebsiteId 
                        ? `${archetypeInstanceCount} journal${archetypeInstanceCount === 1 ? '' : 's'} in this website`
                        : `${archetypeInstanceCount} journal${archetypeInstanceCount === 1 ? '' : 's'} across all websites`}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {onShowMockDataChange && (
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showMockData}
                        onChange={(e) => {
                          e.stopPropagation()
                          onShowMockDataChange(e.target.checked)
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      Show Mock Data
                    </label>
                  )}
                  {onPageSettingsClick && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handlePageSettingsClick()
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white rounded-md hover:bg-gray-100 transition-colors border border-gray-200"
                      title="Page Settings"
                    >
                      <Settings className="w-4 h-4" />
                      Page Settings
                    </button>
                  )}
                </div>
              </div>
            )}
            
            {/* Regular Page Editing Context - Show minimal info (only when canvas has content) */}
            {usePageStore((state: any) => state.editingContext) === 'page' && canvasItems.length > 0 && (
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Editing: <strong>{!isEditingLoadedWebsite ? 'Blank Canvas' : (() => {
                    const currentWebsiteId = usePageStore.getState().currentWebsiteId
                    const websites = usePageStore.getState().websites
                    const currentWebsite = websites.find((w: any) => w.id === currentWebsiteId)
                    
                    // Derive page name from URL path
                    const getPageTitle = () => {
                      const pathname = window.location.pathname
                      // Extract path after /edit/:websiteId/
                      const pathParts = pathname.split('/')
                      const pageRoute = pathParts.slice(3).join('/')
                      
                      if (!pageRoute || pageRoute === '' || pageRoute === 'home') {
                        return 'Homepage'
                      }
                      if (pageRoute === 'journals') return 'Journals Browse'
                      if (pageRoute === 'about') return 'About Page'
                      if (pageRoute === 'search') return 'Search Page'
                      if (pageRoute.startsWith('journal/') && pageRoute.includes('/loi')) {
                        const journalId = pageRoute.split('/')[1]?.toUpperCase()
                        return `${journalId} Issue Archive`
                      }
                      if (pageRoute.startsWith('journal/') && pageRoute.includes('/toc/')) {
                        const journalId = pageRoute.split('/')[1]?.toUpperCase()
                        return `${journalId} Issue TOC`
                      }
                      if (pageRoute.startsWith('journal/') && pageRoute.includes('/article/')) {
                        const journalId = pageRoute.split('/')[1]?.toUpperCase()
                        return `${journalId} Article`
                      }
                      // Check for custom journal-scoped pages (e.g., journal/jas/promo)
                      if (pageRoute.startsWith('journal/')) {
                        const parts = pageRoute.split('/')
                        const journalId = parts[1]?.toUpperCase()
                        // If there's more after journalId and it's not a known route, it's a custom page
                        if (parts.length > 2 && parts[2] && !['loi', 'toc', 'article'].includes(parts[2])) {
                          // Try to find the page name from websitePages
                          const websitePages = usePageStore.getState().websitePages || []
                          const customPage = websitePages.find((p: any) => 
                            p.websiteId === currentWebsiteId && p.slug === pageRoute
                          )
                          if (customPage) {
                            return customPage.name
                          }
                          // Fallback: format the custom slug
                          const customSlug = parts.slice(2).join('/')
                          return `${journalId} - ${customSlug.charAt(0).toUpperCase() + customSlug.slice(1)}`
                        }
                        return `${journalId} Journal Home`
                      }
                      // Check for custom pages at website root
                      const websitePages = usePageStore.getState().websitePages || []
                      const customPage = websitePages.find((p: any) => 
                        p.websiteId === currentWebsiteId && p.slug === pageRoute
                      )
                      if (customPage) {
                        return customPage.name
                      }
                      // Fallback: capitalize the route
                      return pageRoute.charAt(0).toUpperCase() + pageRoute.slice(1)
                    }
                    
                    const siteName = currentWebsite?.name || ''
                    const pageTitle = getPageTitle()
                    return siteName ? `${siteName} - ${pageTitle}` : pageTitle
                  })()}</strong>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      const currentWebsiteId = usePageStore.getState().currentWebsiteId
                      const currentWebsite = usePageStore.getState().websites.find((w: any) => w.id === currentWebsiteId)
                      
                      if (canvasItems.length === 0) {
                        showToast('Cannot save empty page as stub', 'error')
                        return
                      }

                      const starterName = prompt('Enter a name for this copy:')
                      if (!starterName?.trim()) return

                      const starterDescription = prompt('Enter a description (optional):') || 'Custom copy'

                      // Deep clone and regenerate IDs for canvas items to avoid conflicts
                      const clonedCanvasItems = canvasItems.map((item: CanvasItem) => {
                        if (isSection(item)) {
                          const newSectionId = nanoid()
                          return {
                            ...item,
                            id: newSectionId,
                            areas: (item as WidgetSection).areas.map((area: any) => ({
                              ...area,
                              id: nanoid(),
                              widgets: area.widgets.map((widget: any) => ({
                                ...widget,
                                id: nanoid(),
                                sectionId: newSectionId
                              }))
                            }))
                          }
                        } else {
                          return {
                            ...item,
                            id: nanoid()
                          }
                        }
                      })

                      // Create the custom starter page
                      const newStarterPage = {
                        id: nanoid(),
                        name: starterName.trim(),
                        description: starterDescription,
                        source: 'user' as const,
                        websiteId: currentWebsiteId,
                        websiteName: currentWebsite?.name || 'Unknown',
                        createdAt: new Date(),
                        canvasItems: clonedCanvasItems
                      }

                      addCustomStarterPage(newStarterPage)
                      showToast(`Copy "${starterName.trim()}" saved!`, 'success')
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-md hover:bg-green-100 transition-colors border border-green-200"
                    title="Save as Copy (no inheritance)"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
                    </svg>
                    Save as Copy
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePageSettingsClick()
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors border border-gray-200"
                    title="Page Settings"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    Page Settings
                  </button>
                </div>
              </div>
            )}
            
            <CanvasThemeProvider usePageStore={usePageStore} scopeCSS={true}>
              <div className="theme-preview bg-white border border-slate-200 rounded-lg min-h-96 relative shadow-sm overflow-hidden">
              
              {/* Global Header Bar */}
              <GlobalSectionBar
                type="header"
                sections={headerSections}
                websiteId={currentWebsiteId}
                pageId={currentPageId}
                usePageStore={usePageStore}
                onWidgetClick={handleWidgetClick}
                selectedWidget={selectedWidget}
                activeSectionToolbar={activeSectionToolbar}
                setActiveSectionToolbar={setActiveSectionToolbar}
                activeWidgetToolbar={activeWidgetToolbar}
                setActiveWidgetToolbar={setActiveWidgetToolbar}
                overrideMode={headerOverrideMode}
                onOverrideModeChange={setHeaderOverrideMode}
                onReplacePageShell={handleReplacePageShell}
              />
              
              {canvasItems.length === 0 ? (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center text-gray-500">
                    <p className="text-lg mb-2">Loading starter section...</p>
                    <p className="text-sm">Drag widgets from the library to get started</p>
                  </div>
                </div>
              ) : (
                <SortableContext items={canvasItems} strategy={verticalListSortingStrategy}>
                  <div className="relative">
                    <LayoutRenderer
                          canvasItems={canvasItems}
                          schemaObjects={schemaObjects || []}
                          isLiveMode={false}
                          journalContext={(() => {
                            debugLog('log', '🔍 [PageBuilder] Passing journalContext to LayoutRenderer:', {
                              journalCode,
                              mockLiveSiteRoute,
                              pageInstanceMode
                            })
                            return journalCode || undefined
                          })()}
                          onWidgetClick={handleWidgetClick}
                          dragAttributes={{}}
                          dragListeners={{}}
                          activeSectionToolbar={activeSectionToolbar}
                          setActiveSectionToolbar={handleSetActiveSectionToolbar}
                          activeWidgetToolbar={activeWidgetToolbar}
                          setActiveWidgetToolbar={setActiveWidgetToolbar}
                          activeDropZone={activeDropZone}
                          showToast={showToast}
                          usePageStore={usePageStore}
                          showMockData={showMockData} // Keep showMockData as-is - journal context will override AI generation
                          pageConfig={pageConfig}
                          // Editor-specific props
                          handleAddSection={handleAddSection}
                          handleSectionClick={(id: string) => handleSectionClick(id, {} as React.MouseEvent)}
                          selectedWidget={selectedWidget}
                          InteractiveWidgetRenderer={InteractiveWidgetRenderer}
                          // Page Instance props
                          pageInstanceMode={pageInstanceMode}
                          pageInstance={pageInstance}
                          onPageInstanceChange={onPageInstanceChange}
                          // Replace Zone feature
                          canReplaceZone={true}
                          onReplaceZone={handleReplaceZone}
                          onReplaceSectionLayout={handleReplaceSectionLayout}
                        />
                  </div>
                </SortableContext>
              )}
              
              {/* Global Footer Bar */}
              <GlobalSectionBar
                type="footer"
                sections={footerSections}
                websiteId={currentWebsiteId}
                pageId={currentPageId}
                usePageStore={usePageStore}
                onWidgetClick={handleWidgetClick}
                selectedWidget={selectedWidget}
                activeSectionToolbar={activeSectionToolbar}
                setActiveSectionToolbar={setActiveSectionToolbar}
                activeWidgetToolbar={activeWidgetToolbar}
                setActiveWidgetToolbar={setActiveWidgetToolbar}
                overrideMode={footerOverrideMode}
                onOverrideModeChange={setFooterOverrideMode}
                onReplacePageShell={handleReplacePageShell}
              />
              
            </div>
            </CanvasThemeProvider>
          </div>
        </div>

      {/* Right Sidebar - Properties Panel - Always visible, expands for complex widgets */}
      <div className={`${isPropertiesPanelExpanded ? 'w-[1000px]' : 'w-80'} transition-all duration-300 bg-slate-100 shadow-sm border-l border-slate-200 flex flex-col sticky top-0 h-screen`}>
        <div className="border-b border-slate-200 p-4 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">
            {!selectedWidget && !showPageSettings ? 'Page Status' : 'Properties'}
          </h2>
          {/* Collapse button when expanded */}
          {isPropertiesPanelExpanded && (
            <button
              onClick={() => setIsPropertiesPanelExpanded(false)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
              title="Collapse panel"
            >
              <ChevronRight className="w-4 h-4" />
              Collapse
            </button>
          )}
        </div>
          <div 
            className="flex-1 overflow-y-auto" 
            style={{ 
              scrollBehavior: 'auto'
            }}
          >
            <PropertiesPanel 
              creatingSchemaType={creatingSchemaType}
              selectedSchemaObject={selectedSchemaObject}
              onSaveSchema={handleSaveSchema}
              onCancelSchema={handleCancelSchema}
              usePageStore={usePageStore}
              SchemaFormEditor={SchemaFormEditor}
              onExpandedChange={setIsPropertiesPanelExpanded}
              isExpanded={isPropertiesPanelExpanded}
              globalSections={[...headerSections, ...footerSections]}
              headerSections={headerSections}
              footerSections={footerSections}
              currentWebsiteId={currentWebsiteId}
              currentPageId={currentPageId}
              headerEditMode={headerOverrideMode}
              footerEditMode={footerOverrideMode}
              pageConfig={archetypeMode ? pageConfig : undefined}
              onPageConfigChange={archetypeMode ? onPageConfigChange : undefined}
              pageInstance={pageInstance}
              archetype={archetype}
              archetypeName={displayArchetypeName}
              dirtyZones={dirtyZones}
              onPageInstanceChange={onPageInstanceChange}
              designId={designId}
              onResetToArchetype={handleResetToArchetype}
              onRevertZoneToArchetype={handleRevertZoneToArchetype}
              highlightSectionType={highlightSectionType}
              onReplacePageShell={handleReplacePageShell}
              onReplaceZone={handleReplaceZone}
              onReplaceSectionLayout={handleReplaceSectionLayout}
            />
          </div>
        </div>

      {/* Replace Zone / Header / Footer Confirmation Modal */}
      {showReplaceZoneModal && (
        (() => {
          // Zone replace
          if (replaceZoneSlug && replaceSectionId) {
            return (
              <ReplaceZoneModal
                zoneSlug={replaceZoneSlug}
                section={canvasItems.find((item: CanvasItem) => item.id === replaceSectionId) as WidgetSection}
                onConfirm={handleReplaceZoneConfirm}
                onCancel={handleReplaceZoneCancel}
              />
            )
          }
          // Section layout replace
          if (replaceCanvasSectionId) {
            const sectionForModal = canvasItems.find((item: CanvasItem) => item.id === replaceCanvasSectionId) as WidgetSection | undefined
            if (!sectionForModal) return null
            return (
              <ReplaceZoneModal
                zoneSlug={sectionForModal.name || 'Section'}
                section={sectionForModal}
                onConfirm={handleReplaceZoneConfirm}
                onCancel={handleReplaceZoneCancel}
              />
            )
          }
          // Page shell replace (header/footer)
          if (replacePageShellRegion) {
            const existing = (replacePageShellRegion === 'header' ? headerSections : footerSections) as any[]
            const sectionForModal = (existing && existing.length > 0 ? (existing[0] as WidgetSection) : null)
            if (!sectionForModal) return null
            return (
              <ReplaceZoneModal
                zoneSlug={replacePageShellRegion === 'header' ? 'Header' : 'Footer'}
                section={sectionForModal}
                onConfirm={handleReplaceZoneConfirm}
                onCancel={handleReplaceZoneCancel}
              />
            )
          }
          return null
        })()
      )}

      {/* Layout Picker Modal */}
      {showLayoutPicker && (
        <LayoutPicker
          onSelectLayout={handleSelectLayout}
          onClose={() => {
            setShowLayoutPicker(false)
            // Reset replace zone state when closing without selection
            setReplaceZoneSlug(null)
            setReplaceSectionId(null)
            setReplaceCanvasSectionId(null)
            setReplacePageShellRegion(null)
            setReplaceZonePreserveOptions(null)
          }}
          title={(replaceZoneSlug || replaceCanvasSectionId || replacePageShellRegion) ? 'Choose New Layout' : undefined}
          subtitle={
            replaceZoneSlug
              ? `Replacing layout for "${replaceZoneSlug}" zone`
              : replacePageShellRegion
                ? `Replacing layout for ${replacePageShellRegion === 'header' ? 'Header' : 'Footer'}`
                : replaceCanvasSectionId
                  ? 'Replacing section layout'
                  : undefined
          }
        />
      )}
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg transition-all transform ${
          toast.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center gap-2">
            {toast.type === 'success' ? (
              <Check className="w-4 h-4" />
            ) : (
              <X className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        </div>
      )}
      </div>
      
      {/* DragOverlay - renders the dragging item in a portal */}
      <DragOverlay dropAnimation={null}>
        {activeDragItem ? (
          <div className="bg-white border-2 border-blue-500 rounded-lg shadow-2xl p-4 opacity-90 cursor-grabbing">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-xs">
                  {activeDragItem.widget?.type?.[0]?.toUpperCase() || '?'}
                </span>
              </div>
              <div className="text-sm font-medium text-gray-900">
                {activeDragItem.item?.label || activeDragItem.widget?.type || 'Widget'}
              </div>
            </div>
          </div>
        ) : null}
      </DragOverlay>
      
      {/* Publish Review Modal - Archetype mode (with local/archetype choices) */}
      {showPublishModal && pageInstanceMode && (
        <PublishReviewModal
          isOpen={true}
          onClose={() => {
            debugLog('log', '📋 [PageBuilder] Modal onClose called')
            setShowPublishModal(false)
          }}
          dirtyZones={dirtyZones}
          zoneSections={zoneSections}
          baselineSections={baselineSections}
          archetypeSections={baselineSections}
          onPublish={handlePublishWithChoices}
          archetypeName={displayArchetypeName}
          archetypeId={pageInstance?.templateId}
          journalName={journalNameProp}
          mode="archetype"
          onDiscard={handleDiscard}
          pageShellChanges={pageShellChanges}
          onPublishPageShell={applyPageShellPublishChoices}
          onPublishPageShellVisibility={applyPageShellVisibilityChoices}
        />
      )}
      
      {/* Publish Review Modal - Simple mode (for non-archetype pages) */}
      {showPublishModal && !pageInstanceMode && (
        <PublishReviewModal
          isOpen={true}
          onClose={() => {
            debugLog('log', '📋 [PageBuilder] Modal onClose called (simple mode)')
            setShowPublishModal(false)
          }}
          dirtyZones={modifiedSections}
          zoneSections={modifiedSectionsMap}
          baselineSections={baselineSectionsForSimpleMode}
          onPublish={() => {}} // Not used in simple mode
          mode="simple"
          onSimplePublish={handleSimplePublish}
          pageName={pageName === 'home' ? 'Homepage' : pageName}
          onDiscard={handleDiscard}
          pageShellChanges={pageShellChanges}
          onPublishPageShell={applyPageShellPublishChoices}
          onPublishPageShellVisibility={applyPageShellVisibilityChoices}
        />
      )}
    </DndContext>
  )
}

// DIYZoneContent Component - Advanced widgets and saved sections
function DIYZoneContent({ showToast, usePageStore, buildWidget }: {
  showToast: (message: string, type: 'success' | 'error') => void
  usePageStore: any
  buildWidget: (item: any) => Widget
}) {
  const { customSections = [], customStarterPages = [], canvasItems, replaceCanvasItems, removeCustomStarterPage, selectWidget, currentWebsiteId, websites } = usePageStore()
  
  // Get current website's theme/design ID for matching stubs
  const currentWebsite = websites?.find((w: any) => w.id === currentWebsiteId)
  const currentThemeId = currentWebsite?.themeId || currentWebsite?.designId || ''
  
  // Filter stubs: match by websiteId OR by design/theme
  const relevantStubs = customStarterPages.filter((page: any) => {
    // Exact website match
    if (page.websiteId === currentWebsiteId) return true
    // Design/theme match (e.g., 'wiley-ds' matches any wiley-themed website)
    if (page.websiteId && currentThemeId) {
      const pageDesign = page.websiteId.toLowerCase()
      const currentDesign = currentThemeId.toLowerCase()
      if (pageDesign.includes('wiley') && currentDesign.includes('wiley')) return true
      if (pageDesign.includes('febs') && currentDesign.includes('febs')) return true
      if (pageDesign.includes('carbon') && currentDesign.includes('carbon')) return true
      if (pageDesign.includes('classic') && currentDesign.includes('classic')) return true
    }
    return false
  })

  // DIY Widgets - Advanced/Technical widgets for power users
  const diyWidgets = [
    { id: 'html-block', label: 'HTML Block', type: 'html-block' as const, description: 'Custom HTML content', skin: 'minimal' as const, status: 'supported' as const },
    { id: 'code-block', label: 'Code Block', type: 'code-block' as const, description: 'Syntax-highlighted code', skin: 'minimal' as const, status: 'supported' as const }
  ]

  return (
    <div className="space-y-6">
      {/* DIY Widgets */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Lightbulb className="w-4 h-4" />
          Advanced Widgets
        </h3>
        <div className="space-y-1">
          {diyWidgets.map((item) => (
            <DraggableLibraryWidget key={item.id} item={item} usePageStore={usePageStore} buildWidget={buildWidget} isDIY={true} />
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          💡 Drag these advanced widgets into your sections for custom functionality
        </p>
      </div>

      {/* Advanced Features - Coming Soon */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Advanced Features
        </h3>
        <div className="space-y-2">
          <div className="p-3 border border-gray-200 rounded-md bg-gray-50 opacity-60">
            <div className="flex items-center gap-2">
              <div className="text-lg">🎨</div>
              <div>
                <div className="font-medium text-sm text-gray-700">Global CSS</div>
                <div className="text-xs text-gray-500">Site-wide styling (Coming Soon)</div>
              </div>
            </div>
          </div>
          
          <div className="p-3 border border-gray-200 rounded-md bg-gray-50 opacity-60">
            <div className="flex items-center gap-2">
              <div className="text-lg">📁</div>
              <div>
                <div className="font-medium text-sm text-gray-700">File Manager</div>
                <div className="text-xs text-gray-500">Upload and manage assets (Coming Soon)</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Saved Sections */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Saved Sections
        </h3>

        {customSections.length > 0 ? (
          <div className="space-y-2">
            {customSections.map((section: any) => {
              // Count widgets in the saved section
              const itemCount = section.canvasItems?.length || section.items?.length || 0
              const totalWidgets = (section.canvasItems || section.items || []).reduce((count: number, item: any) => {
                if (isSection(item)) {
                  return count + item.areas.reduce((areaCount: number, area: any) => areaCount + area.widgets.length, 0)
                } else {
                  return count + 1
                }
              }, 0)
              
              return (
                <div key={section.id} className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{section.name}</div>
                      <div className="text-xs text-gray-500 mt-1">{section.description}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {itemCount} section{itemCount !== 1 ? 's' : ''} • {totalWidgets} widget{totalWidgets !== 1 ? 's' : ''} • 
                        Saved {new Date(section.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const itemsToLoad = section.canvasItems || section.items || []
                        debugLog('log','🔍 Loading saved section:', {
                          sectionName: section.name,
                          itemsToLoad,
                          currentCanvasItems: canvasItems,
                          totalItemsAfterLoad: canvasItems.length + itemsToLoad.length
                        })
                        // Clear any selected widgets/sections to prevent "not found" errors
                        selectWidget(null)
                        // Load the saved sections
                        replaceCanvasItems([...canvasItems, ...itemsToLoad])
                        showToast(`"${section.name}" loaded to canvas!`, 'success')
                      }}
                      className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex-shrink-0 ml-2"
                    >
                      Load
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📦</div>
            <div className="text-sm">No saved sections yet</div>
            <div className="text-xs mt-1">Create some sections and save them for reuse</div>
          </div>
        )}
      </div>

      {/* Saved Stubs */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Saved Stubs
        </h3>

        {relevantStubs.length > 0 ? (
          <div className="space-y-2">
            {relevantStubs.map((page: any) => {
                const itemCount = page.canvasItems?.length || 0
                
                return (
                  <div key={page.id} className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{page.name}</span>
                          <NewBadge itemId={`starter:${page.id}`} variant="pill" />
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{page.description}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {itemCount} section{itemCount !== 1 ? 's' : ''} • 
                          Saved {new Date(page.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-2">
                        <button
                          onClick={() => {
                            const confirmed = window.confirm(
                              `⚠️ Replace current page?\n\nYour current page will be replaced by "${page.name}".\n\nThis action cannot be undone. Continue?`
                            )
                            
                            if (confirmed) {
                              const itemsToLoad = page.canvasItems || []
                              selectWidget(null)
                              replaceCanvasItems(itemsToLoad)
                              showToast(`"${page.name}" loaded!`, 'success')
                            }
                          }}
                          className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex-shrink-0"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete "${page.name}"?`)) {
                              removeCustomStarterPage(page.id)
                              showToast(`"${page.name}" deleted`, 'success')
                            }
                          }}
                          className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex-shrink-0"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📄</div>
            <div className="text-sm">No saved stubs yet</div>
            <div className="text-xs mt-1">Save your pages as reusable stubs</div>
          </div>
        )}
      </div>
    </div>
  )
}

// SchemaContentTab Component - Schema.org content management 
function SchemaContentTab({ onCreateSchema, usePageStore, selectSchemaObject }: { 
  onCreateSchema: (schemaType: SchemaOrgType) => void
  usePageStore?: any
  selectSchemaObject?: (obj: SchemaObject) => void 
}) {
  const { schemaObjects = [] } = usePageStore?.() || {}
  const [searchTerm, setSearchTerm] = useState('')
  const [showNewMenu, setShowNewMenu] = useState(false)
  const [currentLevel, setCurrentLevel] = useState<string[]>([]) // Track hierarchy level
  
  // Filter objects based on search
  const filteredObjects = schemaObjects.filter((obj: SchemaObject) => 
    obj.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    obj.type.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  // Hierarchical schema.org structure
  const schemaHierarchy: Record<string, any> = {
    // Top level types
    'CreativeWork': {
      label: 'Creative Work',
      description: 'The most generic kind of creative work, including books, movies, photographs, software programs, etc.',
      children: {
        'Article': {
          label: 'Article', 
          description: 'An article, such as a news article or piece of investigative report',
          children: {
            'ScholarlyArticle': { label: 'Scholarly Article', description: 'A scholarly article' },
            'NewsArticle': { label: 'News Article', description: 'A news article' },
            'BlogPosting': { label: 'Blog Posting', description: 'A blog post' }
          }
        },
        'Book': { label: 'Book', description: 'A book' },
        'MediaObject': {
          label: 'Media Object',
          description: 'A media object, such as an image, video, or audio file',
          children: {
            'ImageObject': { label: 'Image Object', description: 'An image file' },
            'VideoObject': { label: 'Video Object', description: 'A video file' },
            'AudioObject': { label: 'Audio Object', description: 'An audio file' }
          }
        }
      }
    },
    'Person': { 
      label: 'Person', 
      description: 'A person (alive, dead, undead, or fictional)' 
    },
    'Organization': {
      label: 'Organization',
      description: 'An organization such as a school, NGO, corporation, club, etc.',
      children: {
        'Corporation': { label: 'Corporation', description: 'A business corporation' },
        'EducationalOrganization': { label: 'Educational Organization', description: 'A school, university, etc.' },
        'ResearchOrganization': { label: 'Research Organization', description: 'A research organization' }
      }
    },
    'Event': {
      label: 'Event',
      description: 'An event happening at a certain time and location',
      children: {
        'BusinessEvent': { label: 'Business Event', description: 'A business event' },
        'EducationEvent': { label: 'Education Event', description: 'An education event' },
        'ConferenceEvent': { label: 'Conference Event', description: 'A conference event' }
      }
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Schema Content</h3>
            <p className="text-sm text-gray-600">Create and manage structured data objects</p>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowNewMenu(!showNewMenu)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New
            </button>
            
          </div>
        </div>
        
        {/* Search */}
        <input
          type="text"
          placeholder="Search schema objects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {showNewMenu ? (
          /* Schema Type Selection */
          <div className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-gray-900">Select Schema Type</h4>
              <button
                onClick={() => {
                  setShowNewMenu(false)
                  setCurrentLevel([])
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
            
            {/* Breadcrumb Navigation */}
            {currentLevel.length > 0 && (
              <div className="flex items-center mb-3 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded">
                <button 
                  onClick={() => setCurrentLevel([])}
                  className="hover:text-blue-600"
                >
                  Schema Types
                </button>
                {currentLevel.map((level, index) => (
                  <span key={index}>
                    <span className="mx-2">›</span>
                    <button 
                      onClick={() => setCurrentLevel(currentLevel.slice(0, index + 1))}
                      className="hover:text-blue-600"
                    >
                      {schemaHierarchy[level]?.label || level}
                    </button>
                  </span>
                ))}
              </div>
            )}
            
            {/* Schema Type Options */}
            <div className="space-y-1">
              {(() => {
                // Navigate to current level in hierarchy
                let currentItems = schemaHierarchy
                for (const levelKey of currentLevel) {
                  currentItems = currentItems[levelKey]?.children || {}
                }
                
                // If we're at top level, show main types
                if (currentLevel.length === 0) {
                  return Object.entries(schemaHierarchy).map(([key, value]) => (
                    <button
                      key={key}
                      onClick={() => {
                        if (value.children) {
                          setCurrentLevel([key])
                        } else {
                          onCreateSchema(key as SchemaOrgType)
                          setShowNewMenu(false)
                          setCurrentLevel([])
                        }
                      }}
                      className="w-full p-3 text-left border border-gray-200 rounded-md hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{value.label}</div>
                          <div className="text-xs text-gray-500 mt-1">{value.description}</div>
                        </div>
                        {value.children && (
                          <div className="text-gray-400 ml-2">›</div>
                        )}
                      </div>
                    </button>
                  ))
                }
                
                // Show items at current level
                return Object.entries(currentItems).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => {
                      if (value.children) {
                        setCurrentLevel([...currentLevel, key])
                      } else {
                        onCreateSchema(key as SchemaOrgType)
                        setShowNewMenu(false)
                        setCurrentLevel([])
                      }
                    }}
                    className="w-full p-3 text-left border border-gray-200 rounded-md hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{value.label}</div>
                        <div className="text-xs text-gray-500 mt-1">{value.description}</div>
                      </div>
                      {value.children ? (
                        <div className="text-gray-400 ml-2">›</div>
                      ) : (
                        <div className="text-xs text-green-600 ml-2 font-medium">Create</div>
                      )}
                    </div>
                  </button>
                ))
              })()}
            </div>
          </div>
        ) : (
          /* Your Schema Objects */
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              Your Schema Objects ({filteredObjects.length})
            </h4>
            
            {filteredObjects.length === 0 ? (
              <div className="text-center py-12">
                {schemaObjects.length === 0 ? (
                  <div>
                    <div className="text-4xl mb-3">📋</div>
                    <p className="text-gray-500 mb-2">No schema objects yet</p>
                    <p className="text-xs text-gray-400">Click "New" to create your first schema object</p>
                  </div>
                ) : (
                  <div>
                    <div className="text-4xl mb-3">🔍</div>
                    <p className="text-gray-500 mb-2">No objects match "{searchTerm}"</p>
                    <p className="text-xs text-gray-400">Try a different search term</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredObjects.map((obj: SchemaObject) => (
                  <div
                    key={obj.id}
                    onClick={() => selectSchemaObject?.(obj)}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900">{obj.name}</div>
                        <div className="text-xs text-gray-500 mt-1">{SCHEMA_DEFINITIONS[obj.type]?.label || obj.type}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          Created {new Date(obj.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          {obj.type}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  )
}

// SectionsContent Component - Manages different categories of sections
function SectionsContent({ showToast, usePageStore }: { 
  showToast: (message: string, type: 'success' | 'error') => void
  usePageStore: any
}) {
  const { replaceCanvasItems, canvasItems, websites, currentWebsiteId, themes } = usePageStore()
  
  // Get current website's theme to show theme-specific prefabs
  const currentWebsite = websites.find((w: any) => w.id === currentWebsiteId)
  const currentTheme = currentWebsite 
    ? themes.find((t: any) => t.id === currentWebsite.themeId)
    : null
  const isWileyTheme = currentTheme?.id === 'wiley-figma-ds-v2'

  // Prefab sections are now handled by the modular prefabSections.ts

  const addPrefabSection = (type: string) => {
    let section: CanvasItem
    
    // Global Sections
    if (type === 'standardHeader') {
      section = PREFAB_SECTIONS.standardHeader()
    } else if (type === 'standardFooter') {
      section = PREFAB_SECTIONS.standardFooter()
    } else if (type === 'copyrightBar') {
      section = PREFAB_SECTIONS.copyrightBar()
    } else if (type === 'globalHeader') {
      section = PREFAB_SECTIONS.globalHeader()
    } else if (type === 'mainNavigation') {
      section = PREFAB_SECTIONS.mainNavigation()
    }
    // Utility Sections
    else if (type === 'notificationBanner') {
      section = PREFAB_SECTIONS.notificationBanner()
    } else if (type === 'cookieConsent') {
      section = PREFAB_SECTIONS.cookieConsent()
    }
    // Content Sections
    else if (type === 'hero') {
      section = PREFAB_SECTIONS.hero()
    } else if (type === 'features') {
      section = PREFAB_SECTIONS.featuredResearch()
    } else if (type === 'journalBanner') {
      section = PREFAB_SECTIONS.journalBanner()
    }
    // Wiley Theme Sections
    else if (type === 'wileyFigmaCardGrid') {
      section = PREFAB_SECTIONS.wileyFigmaCardGrid()
    } else if (type === 'wileyFigmaFeaturedContent') {
      section = PREFAB_SECTIONS.wileyFigmaFeaturedContent()
    } else if (type === 'wileyFigmaLogoGrid') {
      section = PREFAB_SECTIONS.wileyFigmaLogoGrid()
    } else if (type === 'wileyThreeColumn') {
      section = PREFAB_SECTIONS.wileyThreeColumn()
    } else if (type === 'wileyContentImage') {
      section = PREFAB_SECTIONS.wileyContentImage()
    } else if (type === 'wileyDSV2Hero') {
      section = PREFAB_SECTIONS.wileyDSV2Hero()
    } else if (type === 'wileyDSV2CardGrid') {
      section = PREFAB_SECTIONS.wileyDSV2CardGrid()
    } else {
      return // Invalid type
    }

    // Smart insertion: headers go to top, footers go to bottom, others append
    const isHeader = type === 'standardHeader' || type === 'globalHeader'
    const isFooter = type === 'standardFooter' || type === 'copyrightBar'
    
    if (isHeader) {
      // Insert header at the very top
      replaceCanvasItems([section, ...canvasItems])
      showToast(`${(section as WidgetSection).name} added at top of page!`, 'success')
    } else if (isFooter) {
      // Insert footer at the very bottom
      replaceCanvasItems([...canvasItems, section])
      showToast(`${(section as WidgetSection).name} added at bottom of page!`, 'success')
    } else {
      // Default: append to end (before footer if one exists)
      replaceCanvasItems([...canvasItems, section])
      showToast(`${(section as WidgetSection).name} added with template content!`, 'success')
    }
  }

  return (
    <div className="space-y-6">
      {/* Theme Indicator */}
      {currentTheme && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-xs font-semibold text-blue-900 mb-1">Current Theme</div>
          <div className="text-sm text-blue-700">{currentTheme.name}</div>
        </div>
      )}
      
      {/* Template-Ready Sections */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">
          {isWileyTheme ? 'Wiley Theme Sections' : 'Template-Ready Sections'}
        </h3>
        <div className="grid grid-cols-1 gap-2">
          
          {/* Wiley DS V2 Sections - Prefabs with unique styling */}
          {currentTheme?.id === 'wiley-figma-ds-v2' && (
            <>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 mt-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-green-600" />
                DS V2 Sections
              </h4>
              <div className="space-y-3">
                <button
                  onClick={() => addPrefabSection('wileyDSV2Hero')}
                  className="w-full p-3 text-left border-2 border-green-200 bg-green-50 rounded-md hover:bg-green-100 transition-colors flex flex-col gap-3"
                >
                  <div>
                    <div className="font-medium text-sm text-gray-900">Hero Section</div>
                    <div className="text-xs text-gray-700">500px hero with energy burst background image (L1 template VAR 2)</div>
                  </div>
                </button>
                
                <button
                  onClick={() => addPrefabSection('wileyDSV2CardGrid')}
                  className="w-full p-3 text-left border-2 border-green-200 bg-green-50 rounded-md hover:bg-green-100 transition-colors flex flex-col gap-3"
                >
                  <div>
                    <div className="font-medium text-sm text-gray-900">Card Grid</div>
                    <div className="text-xs text-gray-700">3-column grid with title drop zone + Heritage 900 background</div>
                  </div>
                </button>
                
                <button
                  onClick={() => addPrefabSection('wileyFigmaLogoGrid')}
                  className="w-full p-3 text-left border-2 border-green-200 bg-green-50 rounded-md hover:bg-green-100 transition-colors flex flex-col gap-3"
                >
                  <div>
                    <div className="font-medium text-sm text-gray-900">Shop Today</div>
                    <div className="text-xs text-gray-700">Bordered 3-column grid with light cream background</div>
                  </div>
                </button>
                
                <div className="text-xs text-gray-500 italic mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                  💡 <strong>Why these are prefabs:</strong><br/>
                  • Hero: 500px tall with background image (L1 template VAR 2)<br/>
                  • Card Grid: Has title drop zone (not in basic layouts)<br/>
                  • Shop Today: Unique bordered grid styling
                </div>
              </div>
            </>
          )}
          
          {/* Default Sections (for non-Wiley themes) */}
          {!isWileyTheme && (
            <>
              {/* Global Sections - Site-wide components */}
              <h4 className="text-sm font-semibold text-gray-700 mb-3 mt-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-purple-600" />
                Global Sections
              </h4>
              <div className="space-y-3">
                <button
                  onClick={() => addPrefabSection('standardHeader')}
                  className="w-full p-3 text-left border-2 border-purple-200 bg-purple-50 rounded-md hover:bg-purple-100 transition-colors flex flex-col gap-3"
                >
                  <div className="relative w-full h-12 bg-gray-800 rounded overflow-hidden flex items-center justify-between px-4">
                    <span className="text-white text-xs font-medium">🏛️ Publisher</span>
                    <span className="text-white text-xs">Home • Journals • About</span>
                  </div>
                  <div>
                    <div className="font-medium text-sm text-gray-900">Standard Header</div>
                    <div className="text-xs text-gray-700">Logo + navigation menu on dark background</div>
                  </div>
                </button>
                
                <button
                  onClick={() => addPrefabSection('standardFooter')}
                  className="w-full p-3 text-left border-2 border-purple-200 bg-purple-50 rounded-md hover:bg-purple-100 transition-colors flex flex-col gap-3"
                >
                  <div className="relative w-full h-16 bg-gray-800 rounded overflow-hidden p-2">
                    <div className="flex justify-between text-white text-[8px]">
                      <div>About<br/>• About Us<br/>• Terms</div>
                      <div>Journals<br/>• Browse<br/>• Submit</div>
                      <div>Connect<br/>• Contact<br/>• Twitter</div>
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-sm text-gray-900">Standard Footer</div>
                    <div className="text-xs text-gray-700">3-column footer with link groups</div>
                  </div>
                </button>
                
                <button
                  onClick={() => addPrefabSection('copyrightBar')}
                  className="w-full p-3 text-left border-2 border-purple-200 bg-purple-50 rounded-md hover:bg-purple-100 transition-colors flex flex-col gap-3"
                >
                  <div className="relative w-full h-8 bg-gray-900 rounded overflow-hidden flex items-center justify-center">
                    <span className="text-gray-400 text-[8px]">© 2024 Publisher • Powered by Catalyst</span>
                  </div>
                  <div>
                    <div className="font-medium text-sm text-gray-900">Copyright Bar</div>
                    <div className="text-xs text-gray-700">Simple copyright notice bar</div>
                  </div>
                </button>
              </div>
              
              {/* Overlay Sections - Banners & overlays */}
              <h4 className="text-sm font-semibold text-gray-700 mb-3 mt-6 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                Overlay Sections
              </h4>
              <div className="space-y-3">
                <button
                  onClick={() => addPrefabSection('notificationBanner')}
                  className="w-full p-3 text-left border-2 border-amber-200 bg-amber-50 rounded-md hover:bg-amber-100 transition-colors flex flex-col gap-3"
                >
                  <div className="relative w-full h-8 bg-amber-100 rounded overflow-hidden flex items-center justify-center">
                    <span className="text-amber-800 text-[8px]">📢 Important announcement message here →</span>
                  </div>
                  <div>
                    <div className="font-medium text-sm text-gray-900">Notification Banner</div>
                    <div className="text-xs text-gray-700">Amber announcement bar</div>
                  </div>
                </button>
                
                <button
                  onClick={() => addPrefabSection('cookieConsent')}
                  className="w-full p-3 text-left border-2 border-amber-200 bg-amber-50 rounded-md hover:bg-amber-100 transition-colors flex flex-col gap-3"
                >
                  <div className="relative w-full h-8 bg-gray-800 rounded overflow-hidden flex items-center justify-center">
                    <span className="text-white text-[8px]">🍪 We use cookies. Learn more →</span>
                  </div>
                  <div>
                    <div className="font-medium text-sm text-gray-900">Cookie Consent</div>
                    <div className="text-xs text-gray-700">GDPR cookie consent bar</div>
                  </div>
                </button>
              </div>
              
              {/* Content Sections */}
              <h4 className="text-sm font-semibold text-gray-700 mb-3 mt-6 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-blue-600" />
                Content Sections
              </h4>
              <div className="space-y-3">
                <button
                  onClick={() => addPrefabSection('hero')}
                  className="w-full p-3 text-left border-2 border-blue-200 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors flex flex-col gap-3"
                >
                  <div className="relative w-full h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded overflow-hidden">
                    <img src="/layout-previews/hero.png" alt="Hero preview" className="w-full h-full object-cover" onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }} />
                  </div>
                  <div>
                    <div className="font-medium text-sm text-gray-900">Hero Section</div>
                    <div className="text-xs text-gray-700">Full hero with heading, text, and action buttons</div>
                  </div>
                </button>
                
                <button
                  onClick={() => addPrefabSection('features')}
                  className="w-full p-3 text-left border-2 border-blue-200 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors flex flex-col gap-3"
                >
                  <div className="relative w-full h-20 bg-gray-100 rounded overflow-hidden">
                    <img src="/layout-previews/featuredResearch.png" alt="Featured Research preview" className="w-full h-full object-cover" onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }} />
                  </div>
                  <div>
                    <div className="font-medium text-sm text-gray-900">Featured Research</div>
                    <div className="text-xs text-gray-700">Header with 3 research highlight cards</div>
                  </div>
                </button>
                
                <button
                  onClick={() => addPrefabSection('journalBanner')}
                  className="w-full p-3 text-left border-2 border-blue-200 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors flex flex-col gap-3"
                >
                  <div className="relative w-full h-20 bg-gradient-to-r from-gray-800 to-gray-900 rounded overflow-hidden">
                    <img src="/layout-previews/journalBanner.png" alt="Journal Banner preview" className="w-full h-full object-cover" onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }} />
                  </div>
                  <div>
                    <div className="font-medium text-sm text-gray-900">Journal Banner</div>
                    <div className="text-xs text-gray-700">Dark gradient banner with publication details</div>
                  </div>
                </button>
              </div>
              
              {/* Special Sections */}
              <h4 className="text-sm font-semibold text-gray-700 mb-3 mt-6 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Special Sections
              </h4>
              <div className="space-y-3">
                <button
                  onClick={() => addPrefabSection('sidebar')}
                  className="w-full p-3 text-left border-2 border-gray-200 bg-white rounded-md hover:bg-gray-50 transition-colors flex flex-col gap-3"
                >
                  <div>
                    <div className="font-medium text-sm text-gray-900">Sidebar</div>
                    <div className="text-xs text-gray-700">Vertical sidebar that can span multiple sections</div>
                  </div>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default PageBuilder
