/**
 * PageBuilderEditor - Wrapper for V1 Page Builder with URL-based context
 * 
 * Route: /edit/:websiteId/:pageId
 * Query params: scope, journal, issueType
 */

import { useEffect, useRef } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { PageBuilder } from '../PageBuilder'
import { DynamicBrandingCSS } from '../BrandingSystem/DynamicBrandingCSS'
import { CanvasThemeProvider } from '../Canvas/CanvasThemeProvider'
import { NotificationContainer, IssuesSidebar } from '../Notifications'
import { PrototypeControls } from '../PrototypeControls'
import { usePageStore } from '../../stores'
import { TemplateCanvas } from '../Templates/TemplateCanvas'
import { InteractiveWidgetRenderer } from '../PageBuilder/InteractiveWidgetRenderer'
import { buildWidget } from '../../utils/widgetBuilder'
import { isSection } from '../../types'
import { createCatalystHomepage } from '../PageBuilder/catalystHomepage'
import { createHomepageTemplate } from '../PageBuilder/homepageTemplate'

export function PageBuilderEditor() {
  const navigate = useNavigate()
  const { websiteId, '*': pageRoute } = useParams<{ websiteId: string; '*': string }>()
  const [searchParams] = useSearchParams()
  
  const scope = searchParams.get('scope') || 'individual'
  const journalId = searchParams.get('journal')
  const issueType = searchParams.get('issueType')
  
  const { 
    setCurrentWebsiteId, 
    setCurrentView, 
    setEditingContext,
    websites,
    currentPersona,
    setCurrentPersona,
    consoleMode,
    setConsoleMode,
    replaceCanvasItems,
    setIsEditingLoadedWebsite,
    getPageCanvas,
    setPageCanvas,
    canvasItems
  } = usePageStore()
  
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
  }, [websiteId, setCurrentWebsiteId, setCurrentView, setEditingContext])
  
  // Load page content on mount
  useEffect(() => {
    const pageKey = `${websiteId}:${pageName}`
    
    // Skip if already loaded this exact page
    if (loadedPageRef.current === pageKey) {
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
    
    // No saved data - load default content based on page type
    const isHomePage = !pageName || pageName === '' || pageName === 'home' || pageName.startsWith('home')
    
    if (isHomePage && websiteId === 'catalyst-demo') {
      // Load Catalyst-specific homepage as default
      const defaultContent = createCatalystHomepage()
      replaceCanvasItems(defaultContent)
      setPageCanvas(websiteId!, pageName, defaultContent) // Save as initial state
      setIsEditingLoadedWebsite(true)
      loadedPageRef.current = pageKey
    } else if (isHomePage) {
      // Load base homepage template for other websites
      const defaultContent = createHomepageTemplate()
      replaceCanvasItems(defaultContent)
      setPageCanvas(websiteId!, pageName, defaultContent) // Save as initial state
      setIsEditingLoadedWebsite(true)
      loadedPageRef.current = pageKey
    }
  }, [websiteId, pageName, replaceCanvasItems, setIsEditingLoadedWebsite, getPageCanvas, setPageCanvas])
  
  // Auto-save canvas changes to pageCanvasData
  useEffect(() => {
    if (websiteId && pageName && canvasItems.length > 0 && loadedPageRef.current === `${websiteId}:${pageName}`) {
      // Save canvas changes
      setPageCanvas(websiteId, pageName, canvasItems)
    }
  }, [canvasItems, websiteId, pageName, setPageCanvas])
  
  const website = websites.find(w => w.id === websiteId)
  
  // Build breadcrumb/context info
  const getEditingLabel = () => {
    if (scope === 'global') return 'Editing Template (Global)'
    if (scope === 'journal' && journalId) return `Editing ${journalId.toUpperCase()} Template`
    if (scope === 'issue-type' && issueType) return `Editing All ${issueType} Issues`
    return `Editing: ${pageName}`
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      <DynamicBrandingCSS websiteId={websiteId || 'catalyst-demo'} usePageStore={usePageStore} />
      <CanvasThemeProvider usePageStore={usePageStore}>
        {/* Editor Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/live/${websiteId}/${pageRoute || ''}`)}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            >
              ← Back to Live Site
            </button>
            <div className="h-6 w-px bg-gray-300" />
            <div>
              <h1 className="text-sm font-semibold text-gray-900">{website?.name || websiteId}</h1>
              <p className="text-xs text-gray-500">{getEditingLabel()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {scope !== 'individual' && (
              <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded">
                {scope === 'global' ? '🌐 Template Mode' : scope === 'journal' ? '📚 Journal Mode' : '📄 Issue Type Mode'}
              </span>
            )}
            <button
              onClick={() => navigate('/v1')}
              className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded transition-colors"
            >
              Design Console
            </button>
          </div>
        </header>
        
        {/* Page Builder */}
        <PageBuilder 
          usePageStore={usePageStore}
          buildWidget={buildWidget}
          TemplateCanvas={TemplateCanvas}
          InteractiveWidgetRenderer={InteractiveWidgetRenderer}
          isSection={isSection}
        />
        
        {/* Prototype Controls */}
        <PrototypeControls
          currentPersona={currentPersona}
          onPersonaChange={setCurrentPersona}
          consoleMode={consoleMode}
          onConsoleModeChange={setConsoleMode}
        />
      </CanvasThemeProvider>
      <NotificationContainer />
      <IssuesSidebar />
    </div>
  )
}

export default PageBuilderEditor

