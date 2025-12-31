/**
 * PageBuilderEditor - Wrapper for V1 Page Builder with URL-based context
 * 
 * Route: /edit/:websiteId/:pageId
 * Query params: scope, journal, issueType
 */

import { useEffect, useRef, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { PageBuilder } from '../PageBuilder'
import { DynamicBrandingCSS } from '../BrandingSystem/DynamicBrandingCSS'
import { NotificationContainer, IssuesSidebar } from '../Notifications'
import { EscapeHatch } from '../PrototypeControls/EscapeHatch'
import { usePageStore } from '../../stores'
import { usePrototypeStore } from '../../stores/prototypeStore'
import { TemplateCanvas } from '../Templates/TemplateCanvas'
import { InteractiveWidgetRenderer } from '../PageBuilder/InteractiveWidgetRenderer'
import { buildWidget } from '../../utils/widgetBuilder'
import { isSection } from '../../types'
import type { CanvasItem } from '../../types/widgets'
import { createDebugLogger } from '../../utils/logger'

// Control logging for this file - Set to true to debug dirty zones
const DEBUG = true
const debugLog = createDebugLogger(DEBUG)
import { 
  getPageStub,
  type PageType,
  type JournalStubData,
  type JournalContext
} from '../PageBuilder/pageStubs'
import { mockWebsites } from '../../v2/data/mockWebsites'
import { 
  getCurrentIssue, 
  getIssue,
  getArticlesForIssue,
  getArticleByDOI
} from '../../v2/data/mockIssues'
import { 
  getPageInstance,
  getOrCreatePageInstance,
  getArchetypeById,
  resolveCanvasFromArchetype
} from '../../stores/archetypeStore'
import { 
  initializeJournalHomeArchetype
} from '../../utils/archetypeFactory'
import { getDirtyZones, restoreZoneSlugs } from '../../utils/zoneComparison'
import type { WidgetSection } from '../../types/widgets'

/**
 * Migrate legacy journal-latest contentSource to dynamic-query
 * This ensures old drafts/published states are compatible with the new architecture
 */
function migrateCanvasItems(canvasItems: CanvasItem[]): CanvasItem[] {
  return canvasItems.map(item => {
    if ('areas' in item && 'layout' in item) {
      // It's a section
      const section = item as WidgetSection
      const migratedAreas = section.areas?.map(area => ({
        ...area,
        widgets: area.widgets?.map(widget => {
          // Migrate publication-list widgets with journal-latest
          if (widget.type === 'publication-list' && (widget as any).contentSource === 'journal-latest') {
            debugLog('log', `🔄 [PageBuilderEditor] Migrating journal-latest to dynamic-query for widget in section "${section.name}"`)
            return {
              ...widget,
              contentSource: 'dynamic-query' as const
            }
          }
          return widget
        })
      }))
      return {
        ...section,
        areas: migratedAreas
      }
    }
    return item
  })
}

export function PageBuilderEditor() {
  const { websiteId, '*': pageRoute } = useParams<{ websiteId: string; '*': string }>()
  
  // Note: When template editing is implemented, we may add scope params:
  // const [searchParams] = useSearchParams()
  // const scope = searchParams.get('scope') || 'individual'
  
  const { 
    setCurrentWebsiteId, 
    setCurrentView, 
    setEditingContext,
    setMockLiveSiteRoute,
    websites,
    replaceCanvasItems,
    setIsEditingLoadedWebsite,
    getPageCanvas,
    setPageCanvas,
    getPageDraft,
    setPageDraft,
    canvasItems,
    getCanvasItemsForRoute,
    setCanvasItemsForRoute
  } = usePageStore()
  
  // Get drawer state for content pushing
  const { drawerOpen } = usePrototypeStore()
  
  // Track if we've loaded content to prevent infinite loops
  const loadedPageRef = useRef<string | null>(null)
  // Track previous canvasItems to detect actual changes (not just initial load)
  const previousCanvasItemsRef = useRef<CanvasItem[] | null>(null)
  const pageName = pageRoute?.replace(/^\//, '') || 'home'
  
  // Get current website to determine design ID (must be before useMemo hooks)
  const v1Website = websites.find(w => w.id === websiteId)
  const v2Website = mockWebsites.find(w => w.id === websiteId)
  const currentWebsite = v1Website ? {
    ...v2Website,
    ...v1Website,
    journals: (v1Website as any).journals?.length > 0 
      ? (v1Website as any).journals 
      : v2Website?.journals
  } : v2Website
  const journals = currentWebsite?.journals as JournalStubData[] | undefined
  
  // Determine page type from route (helper function)
  const getPageType = (route: string): PageType => {
    if (!route || route === '' || route === 'home') return 'home'
    if (route === 'journals') return 'journals'
    if (route === 'about') return 'about'
    if (route === 'search') return 'search'
    if (route.startsWith('journal/') && route.includes('/loi')) return 'issue-archive'
    if (route.startsWith('journal/') && route.includes('/toc/')) return 'issue-toc'
    if (route.startsWith('journal/') && route.includes('/article/')) return 'article'
    if (route.startsWith('journal/')) return 'journal-home'
    return 'home' // Default
  }
  
  // Extract journal ID from page name for journal pages (helper function)
  const extractJournalId = (route: string): string | null => {
    if (!route.startsWith('journal/')) return null
    const parts = route.split('/')
    return parts[1] || null
  }
  
  // State to force refresh of pageInstance when overrides change
  const [pageInstanceRefreshKey, setPageInstanceRefreshKey] = useState(0)
  
  // Track dirty zones (sections that have drifted from archetype)
  const [dirtyZones, setDirtyZones] = useState<Set<string>>(new Set())
  
  // Detect Page Instance for journal-home pages
  const pageInstance = useMemo(() => {
    const pageType = getPageType(pageName)
    if (pageType === 'journal-home' && websiteId) {
      const designId = currentWebsite?.themeId || (currentWebsite as any)?.designId || currentWebsite?.name
      const normalizedDesignId = designId?.toLowerCase() || ''
      const isClassicTheme = normalizedDesignId.includes('classic') || normalizedDesignId === 'foundation-theme-v1'
      
      if (isClassicTheme) {
        // Use getOrCreatePageInstance to create instance if it doesn't exist
        // For classic themes, use 'modern-journal-home' archetype (same as LiveSite)
        const archetypeId = 'modern-journal-home'
        const finalDesignId = designId || 'classic-ux3-theme'
        
        // Initialize archetype if it doesn't exist (same as ArchetypePreview does)
        const existingArchetype = getArchetypeById(archetypeId, finalDesignId)
        if (!existingArchetype) {
          initializeJournalHomeArchetype(finalDesignId)
        }
        
        return getOrCreatePageInstance(websiteId, pageName, archetypeId, finalDesignId)
      }
    }
    return null
  }, [websiteId, pageName, currentWebsite, pageInstanceRefreshKey])
  
  // Get archetype info if using Page Instance
  const archetypeInfo = useMemo(() => {
    if (!pageInstance) return null
    const designId = currentWebsite?.themeId || (currentWebsite as any)?.designId || currentWebsite?.name
    const normalizedDesignId = designId?.toLowerCase() || ''
    const archetypeDesignId = normalizedDesignId.includes('classic') || normalizedDesignId === 'foundation-theme-v1' 
      ? 'classic-ux3-theme' 
      : designId
    const archetype = getArchetypeById(pageInstance.templateId, archetypeDesignId)
    if (archetype) {
      const overrideCount = Object.keys(pageInstance.overrides).length
      const totalZones = archetype.canvasItems.filter(s => s.zoneSlug).length
      return {
        archetype,
        overrideCount,
        totalZones,
        journalName: journals?.find((j: any) => j.id === extractJournalId(pageName) || '')?.name || 'Journal'
      }
    }
    return null
  }, [pageInstance, currentWebsite, journals, pageName])
  
  // Track dirty zones when canvas changes (only in page instance mode)
  useEffect(() => {
    if (pageInstance && archetypeInfo?.archetype) {
      let currentSections = canvasItems.filter((item): item is WidgetSection => 
        'areas' in item && 'layout' in item
      )
      
      // Restore zoneSlug if missing (sections loaded from draft/published may have lost it)
      const sectionsWithoutZoneSlug = currentSections.filter(s => !s.zoneSlug)
      if (sectionsWithoutZoneSlug.length > 0) {
        debugLog('log', '🔧 [PageBuilderEditor] Restoring zoneSlug for sections:', {
          sectionsWithoutZoneSlug: sectionsWithoutZoneSlug.map(s => s.name),
          totalSections: currentSections.length
        })
        currentSections = restoreZoneSlugs(currentSections, archetypeInfo.archetype.canvasItems)
        
        // Update canvasItems with restored zoneSlugs (only if we actually restored some)
        const needsUpdate = currentSections.some((s, i) => {
          const original = canvasItems.filter((item): item is WidgetSection => 'areas' in item && 'layout' in item)[i]
          return original && !original.zoneSlug && s.zoneSlug
        })
        
        if (needsUpdate) {
          debugLog('log', '💾 [PageBuilderEditor] Updating canvasItems with restored zoneSlugs')
          // Update the sections in canvasItems
          const updatedCanvasItems = canvasItems.map(item => {
            if (!('areas' in item && 'layout' in item)) return item
            const restored = currentSections.find(s => s.id === item.id)
            return restored || item
          })
          replaceCanvasItems(updatedCanvasItems)
        }
      }
      
      debugLog('log', '🔍 [PageBuilderEditor] Calculating dirty zones:', {
        currentSectionsCount: currentSections.length,
        archetypeSectionsCount: archetypeInfo.archetype.canvasItems.length,
        currentZoneSlugs: currentSections.map(s => s.zoneSlug).filter(Boolean),
        archetypeZoneSlugs: archetypeInfo.archetype.canvasItems.map((s: any) => s.zoneSlug).filter(Boolean)
      })
      
      const dirty = getDirtyZones(currentSections, archetypeInfo.archetype.canvasItems)
      
      // Also include zones that have explicit overrides in pageInstance
      const overrideZones = new Set(Object.keys(pageInstance.overrides))
      const allDirtyZones = new Set([...dirty, ...overrideZones])
      
      debugLog('log', '🔍 [PageBuilderEditor] Dirty zones calculated:', {
        dirtyFromComparison: Array.from(dirty),
        explicitOverrides: Array.from(overrideZones),
        allDirtyZones: Array.from(allDirtyZones),
        previousDirtyZones: Array.from(dirtyZones)
      })
      
      // Only update if dirty zones actually changed (prevent infinite loop)
      setDirtyZones(prev => {
        // Quick size check first
        if (prev.size !== allDirtyZones.size) {
          debugLog('log', '✅ [PageBuilderEditor] Dirty zones changed (size):', {
            prevSize: prev.size,
            newSize: allDirtyZones.size,
            newZones: Array.from(allDirtyZones)
          })
          return allDirtyZones
        }
        
        // If sizes match, compare contents
        const prevArray = Array.from(prev).sort()
        const newArray = Array.from(allDirtyZones).sort()
        
        // Check if arrays are different
        const isDifferent = prevArray.length !== newArray.length || 
          prevArray.some((zone, i) => zone !== newArray[i])
        
        if (isDifferent) {
          debugLog('log', '✅ [PageBuilderEditor] Dirty zones changed (content):', {
            prev: prevArray,
            new: newArray
          })
        } else {
          debugLog('log', '⏸️ [PageBuilderEditor] Dirty zones unchanged:', {
            zones: prevArray
          })
        }
        
        return isDifferent ? allDirtyZones : prev
      })
    } else {
      debugLog('log', '⏸️ [PageBuilderEditor] Not in page instance mode, clearing dirty zones')
      setDirtyZones(prev => {
        if (prev.size === 0) return prev // Already empty, no change
        return new Set()
      })
    }
  }, [canvasItems, pageInstance, archetypeInfo?.archetype, replaceCanvasItems])
  
  // Get journals from website for journals browse page
  const journalCount = journals?.length || 0
  
  // Set up editing context based on URL
  useEffect(() => {
    if (websiteId) {
      setCurrentWebsiteId(websiteId)
    }
    setCurrentView('page-builder')
    setEditingContext('page')
    
    // Set the mock live site route so PageBuilder knows the current page context
    // This enables journal context detection for widgets
    const route = pageRoute ? `/${pageRoute}` : '/'
    setMockLiveSiteRoute(route)
  }, [websiteId, pageRoute, setCurrentWebsiteId, setCurrentView, setEditingContext, setMockLiveSiteRoute])
  
  // Extract volume/issue from page name for issue TOC pages
  const extractIssueInfo = (route: string): { vol: string; issue: string } | null => {
    const tocMatch = route.match(/\/toc\/(\d+)\/(\d+)/)
    if (tocMatch) return { vol: tocMatch[1], issue: tocMatch[2] }
    if (route.includes('/toc/current')) return { vol: 'current', issue: '' }
    return null
  }
  
  // Build journal context for journal pages
  const buildJournalContext = (pageType: PageType, journalIdFromRoute: string | null): JournalContext | undefined => {
    if (!journalIdFromRoute) return undefined
    
    const journal = journals?.find((j: any) => j.id === journalIdFromRoute)
    if (!journal) return undefined
    
    const context: JournalContext = {
      journal: {
        id: journal.id,
        name: journal.name,
        description: journal.description,
        brandColor: (journal.branding as any)?.primaryColor || '#6366f1',
        brandColorLight: (journal.branding as any)?.secondaryColor || '#818cf8'
      }
    }
    
    // Add issue and articles based on page type
    if (pageType === 'journal-home') {
      const currentIssue = getCurrentIssue(journalIdFromRoute)
      if (currentIssue) {
        context.issue = {
          id: currentIssue.id,
          volume: currentIssue.volume,
          issue: currentIssue.issue,
          year: currentIssue.year
        }
        context.articles = getArticlesForIssue(currentIssue.id).slice(0, 5).map(a => ({
          doi: a.doi,
          title: a.title,
          authors: a.authors,
          isOpenAccess: a.isOpenAccess
        }))
      }
    } else if (pageType === 'issue-toc') {
      const issueInfo = extractIssueInfo(pageName)
      let issue
      if (issueInfo?.vol === 'current') {
        issue = getCurrentIssue(journalIdFromRoute)
      } else if (issueInfo) {
        issue = getIssue(journalIdFromRoute, parseInt(issueInfo.vol), parseInt(issueInfo.issue))
      }
      if (issue) {
        context.issue = {
          id: issue.id,
          volume: issue.volume,
          issue: issue.issue,
          year: issue.year
        }
        context.articles = getArticlesForIssue(issue.id).map(a => ({
          doi: a.doi,
          title: a.title,
          authors: a.authors,
          isOpenAccess: a.isOpenAccess
        }))
      }
    } else if (pageType === 'article') {
      // Extract DOI from route
      const doiMatch = pageName.match(/\/article\/(.+)$/)
      if (doiMatch) {
        const doi = decodeURIComponent(doiMatch[1])
        const article = getArticleByDOI(doi)
        if (article) {
          context.articles = [{
            doi: article.doi,
            title: article.title,
            authors: article.authors,
            isOpenAccess: article.isOpenAccess
          }]
        }
      }
    }
    
    return context
  }
  
  // Load page content on mount
  useEffect(() => {
    // For journals page, include journal count in key to regenerate when journals change
    const isJournalsPage = pageName === 'journals'
    const pageType = getPageType(pageName)
    const isJournalPage = ['journal-home', 'issue-archive', 'issue-toc', 'article'].includes(pageType)
    const journalIdFromRoute = extractJournalId(pageName)
    
    const pageKey = isJournalsPage 
      ? `${websiteId}:${pageName}:${journalCount}` 
      : `${websiteId}:${pageName}`
    
    // Skip if already loaded this exact page (with same journal count for journals page)
    if (loadedPageRef.current === pageKey) {
      return
    }
    
    // Reset previous canvas items when switching pages
    previousCanvasItemsRef.current = null
    
    // PRIORITY 1: Check for draft first (highest priority - user's unsaved work)
    const draft = getPageDraft(websiteId!, pageName)
    if (draft && draft.length > 0) {
      debugLog('log', '📝 [PageBuilderEditor] Loading from draft:', { websiteId, pageName, itemCount: draft.length })
      const migratedDraft = migrateCanvasItems(draft)
      replaceCanvasItems(migratedDraft)
      setIsEditingLoadedWebsite(true)
      loadedPageRef.current = pageKey
      // Set previous canvas items to prevent auto-save on initial load
      previousCanvasItemsRef.current = migratedDraft
      return
    }
    
    // For journals page, always regenerate to ensure correct journals are shown
    if (isJournalsPage && journalCount > 0) {
      const designId = currentWebsite?.themeId || (currentWebsite as any)?.designId || currentWebsite?.name
      const defaultContent = getPageStub(pageType, websiteId!, designId, journals)
      
      replaceCanvasItems(defaultContent)
      setPageCanvas(websiteId!, pageName, defaultContent)
      setIsEditingLoadedWebsite(true)
      loadedPageRef.current = pageKey
      // Set previous canvas items to prevent auto-save on initial load
      previousCanvasItemsRef.current = defaultContent
      return
    }
    
    // For journal pages, check if we have saved route data or published canvas
    if (isJournalPage && journalIdFromRoute) {
      // Build the route path (e.g., /journal/jas)
      const route = `/${pageName}`
      const savedRouteData = getCanvasItemsForRoute(route)
      const savedPageCanvasData = getPageCanvas(websiteId!, pageName)
      
      // Prefer pageCanvasData (what we save to), then routeCanvasItems
      const savedData = savedPageCanvasData || savedRouteData
      
      if (savedData && savedData.length > 0) {
        // Load saved data (user's published edits)
        replaceCanvasItems(savedData)
        setIsEditingLoadedWebsite(true)
        loadedPageRef.current = pageKey
        // Set previous canvas items to prevent auto-save on initial load
        previousCanvasItemsRef.current = savedData
        return
      }
      
      // Check for Page Instance (archetype system)
      const designId = currentWebsite?.themeId || (currentWebsite as any)?.designId || currentWebsite?.name
      const normalizedDesignId = designId?.toLowerCase() || ''
      const isClassicTheme = normalizedDesignId.includes('classic') || normalizedDesignId === 'foundation-theme-v1'
      const archetypeDesignId = isClassicTheme ? 'classic-ux3-theme' : designId
      
      if (isClassicTheme && pageType === 'journal-home') {
        // Try to load from Page Instance (archetype system)
        const pageInstance = getPageInstance(websiteId!, pageName)
        if (pageInstance) {
          const archetype = getArchetypeById(pageInstance.templateId, archetypeDesignId)
          if (archetype) {
            // Resolve canvas from archetype + instance
            const resolvedCanvas = resolveCanvasFromArchetype(archetype, pageInstance)
            replaceCanvasItems(resolvedCanvas)
            setIsEditingLoadedWebsite(true)
            loadedPageRef.current = pageKey
            // Set previous canvas items to prevent auto-save on initial load
            previousCanvasItemsRef.current = resolvedCanvas
            return
          }
        }
      }
      
      // No instance or archetype - generate from template (fallback)
      const journalContext = buildJournalContext(pageType, journalIdFromRoute)
      const defaultContent = getPageStub(pageType, websiteId!, designId, journals, journalContext)
      
      replaceCanvasItems(defaultContent)
      setIsEditingLoadedWebsite(true)
      loadedPageRef.current = pageKey
      // Set previous canvas items to prevent auto-save on initial load
      previousCanvasItemsRef.current = defaultContent
      return
    }
    
    // Check if we have saved published canvas data for this page
    const savedCanvas = getPageCanvas(websiteId!, pageName)
    
    if (savedCanvas && savedCanvas.length > 0) {
      // Load saved canvas data (published state)
      const migratedSavedCanvas = migrateCanvasItems(savedCanvas)
      replaceCanvasItems(migratedSavedCanvas)
      setIsEditingLoadedWebsite(true)
      loadedPageRef.current = pageKey
      // Set previous canvas items to prevent auto-save on initial load
      previousCanvasItemsRef.current = migratedSavedCanvas
      return
    }
    
    // No saved data - load default content based on page type and website
    // Pass the website's themeId/designId to determine which design stub to use
    const designId = currentWebsite?.themeId || (currentWebsite as any)?.designId || currentWebsite?.name
    
    const defaultContent = getPageStub(pageType, websiteId!, designId, journals)
    
    replaceCanvasItems(defaultContent)
    setPageCanvas(websiteId!, pageName, defaultContent) // Save as initial state
    setIsEditingLoadedWebsite(true)
    loadedPageRef.current = pageKey
    // Set previous canvas items to prevent auto-save on initial load
    previousCanvasItemsRef.current = defaultContent
  }, [websiteId, pageName, journalCount, replaceCanvasItems, setIsEditingLoadedWebsite, getPageCanvas, getPageDraft, setPageCanvas, currentWebsite, journals])
  
  // Auto-save canvas changes to DRAFT storage (for preview)
  // Each page has its own draft slot, separate from published state
  // Drafts are saved to sessionStorage via setPageDraft in the store
  // Only save when canvasItems actually change (not on initial load)
  useEffect(() => {
    // Use startsWith to handle pageKeys with suffixes (e.g., journals page: "websiteId:journals:journals-5")
    const baseKey = `${websiteId}:${pageName}`
    
    // Skip if page hasn't been loaded yet
    if (!loadedPageRef.current?.startsWith(baseKey)) {
      return
    }
    
    // Skip if canvasItems is empty
    if (!websiteId || !pageName || canvasItems.length === 0) {
      return
    }
    
    // Check if canvasItems actually changed (compare with previous)
    const previousItems = previousCanvasItemsRef.current
    const hasChanged = !previousItems || 
      previousItems.length !== canvasItems.length ||
      JSON.stringify(previousItems) !== JSON.stringify(canvasItems)
    
    // Only save if there's an actual change
    if (hasChanged) {
      debugLog('log', '📝 [PageBuilderEditor] Canvas items changed - saving draft:', {
        websiteId,
        pageName,
        sectionsCount: canvasItems.filter((item): item is WidgetSection => 'areas' in item && 'layout' in item).length,
        totalItems: canvasItems.length,
        hasPageInstance: !!pageInstance,
        isPageInstanceMode: !!pageInstance,
        previousItemsCount: previousItems?.length || 0
      })
      
      // Save canvas changes to DRAFT (previewable, not published)
      // setPageDraft saves to sessionStorage automatically
      setPageDraft(websiteId, pageName, canvasItems)
      
      // Also save to routeCanvasItems for journal pages (for consistency with loading logic)
      const pageType = getPageType(pageName)
      const isJournalPage = ['journal-home', 'issue-archive', 'issue-toc', 'article'].includes(pageType)
      if (isJournalPage) {
        const route = `/${pageName}`
        setCanvasItemsForRoute(route, canvasItems)
      }
      
      // Update previous reference
      previousCanvasItemsRef.current = canvasItems
    }
  }, [canvasItems, websiteId, pageName, setPageDraft, setCanvasItemsForRoute, pageInstance])
  
  const website = websites.find(w => w.id === websiteId)
  
  return (
    <div 
      className="min-h-screen bg-gray-100 transition-all duration-300 ease-in-out"
      style={{ marginRight: drawerOpen ? '288px' : '0' }}
    >
      {/* DynamicBrandingCSS injects journal/subject branding - NOT the global theme */}
      <DynamicBrandingCSS websiteId={websiteId || 'catalyst-demo'} usePageStore={usePageStore} />
      
      {/* Page Builder - has its own internal CanvasThemeProvider for the canvas only */}
      <PageBuilder 
        usePageStore={usePageStore}
        buildWidget={buildWidget}
        TemplateCanvas={TemplateCanvas}
        InteractiveWidgetRenderer={InteractiveWidgetRenderer}
        isSection={isSection}
        pageInstanceMode={!!pageInstance}
        archetypeName={archetypeInfo?.archetype.name}
        overrideCount={archetypeInfo?.overrideCount || 0}
        totalZones={archetypeInfo?.totalZones || 0}
        journalName={archetypeInfo?.journalName}
        pageConfig={archetypeInfo?.archetype.pageConfig}
        pageInstance={pageInstance || undefined}
        onPageInstanceChange={() => setPageInstanceRefreshKey((prev: number) => prev + 1)}
        dirtyZones={dirtyZones}
        websiteId={websiteId}
        pageName={pageName}
      />
      
      {/* Escape Hatch - Prototype Controls (always available) */}
      <EscapeHatch 
        context="editor"
        websiteId={websiteId}
        websiteName={website?.name}
        pageId={pageRoute || 'home'}
      />
      
      <NotificationContainer />
      <IssuesSidebar />
    </div>
  )
}

export default PageBuilderEditor

