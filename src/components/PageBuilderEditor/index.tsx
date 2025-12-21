/**
 * PageBuilderEditor - Wrapper for V1 Page Builder with URL-based context
 * 
 * Route: /edit/:websiteId/:pageId
 * Query params: scope, journal, issueType
 */

import { useEffect, useRef } from 'react'
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
    canvasItems
  } = usePageStore()
  
  // Get drawer state for content pushing
  const { drawerOpen } = usePrototypeStore()
  
  // Track if we've loaded content to prevent infinite loops
  const loadedPageRef = useRef<string | null>(null)
  const pageName = pageRoute?.replace(/^\//, '') || 'home'
  
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
  
  // Determine page type from route
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
  
  // Get current website to determine design ID
  // First check V1 store, then fall back to V2 mockWebsites for journals
  const v1Website = websites.find(w => w.id === websiteId)
  const v2Website = mockWebsites.find(w => w.id === websiteId)
  
  // Merge: use V1 website but get journals from V2 if V1 doesn't have them
  const currentWebsite = v1Website ? {
    ...v2Website,
    ...v1Website,
    journals: (v1Website as any).journals?.length > 0 
      ? (v1Website as any).journals 
      : v2Website?.journals
  } : v2Website
  
  // Get journals from website for journals browse page
  const journals = currentWebsite?.journals as JournalStubData[] | undefined
  const journalCount = journals?.length || 0
  
  // Extract journal ID from page name for journal pages
  const extractJournalId = (route: string): string | null => {
    if (!route.startsWith('journal/')) return null
    const parts = route.split('/')
    return parts[1] || null
  }
  
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
    
    // For journals page, always regenerate to ensure correct journals are shown
    if (isJournalsPage && journalCount > 0) {
      const designId = currentWebsite?.themeId || (currentWebsite as any)?.designId || currentWebsite?.name
      const defaultContent = getPageStub(pageType, websiteId!, designId, journals)
      
      replaceCanvasItems(defaultContent)
      setPageCanvas(websiteId!, pageName, defaultContent)
      setIsEditingLoadedWebsite(true)
      loadedPageRef.current = pageKey
      return
    }
    
    // For journal pages, always regenerate with fresh data (don't use cached templates)
    if (isJournalPage && journalIdFromRoute) {
      const designId = currentWebsite?.themeId || (currentWebsite as any)?.designId || currentWebsite?.name
      const journalContext = buildJournalContext(pageType, journalIdFromRoute)
      const defaultContent = getPageStub(pageType, websiteId!, designId, journals, journalContext)
      
      replaceCanvasItems(defaultContent)
      setPageCanvas(websiteId!, pageName, defaultContent)
      setIsEditingLoadedWebsite(true)
      loadedPageRef.current = pageKey
      return
    }
    
    // First, check if we have saved canvas data for this page
    const savedCanvas = getPageCanvas(websiteId!, pageName)
    
    if (savedCanvas && savedCanvas.length > 0) {
      // Load saved canvas data
      replaceCanvasItems(savedCanvas)
      setIsEditingLoadedWebsite(true)
      loadedPageRef.current = pageKey
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
  }, [websiteId, pageName, journalCount, replaceCanvasItems, setIsEditingLoadedWebsite, getPageCanvas, setPageCanvas, currentWebsite, journals])
  
  // Auto-save canvas changes to pageCanvasData
  useEffect(() => {
    // Use startsWith to handle pageKeys with suffixes (e.g., journals page: "websiteId:journals:journals-5")
    const baseKey = `${websiteId}:${pageName}`
    if (websiteId && pageName && canvasItems.length > 0 && loadedPageRef.current?.startsWith(baseKey)) {
      // Save canvas changes
      setPageCanvas(websiteId, pageName, canvasItems)
    }
  }, [canvasItems, websiteId, pageName, setPageCanvas])
  
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

