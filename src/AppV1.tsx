import { useMemo, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import React from 'react'
import { nanoid } from 'nanoid'
import { MockLiveSite } from './components/MockLiveSite'
import { TemplateCanvas } from './components/Templates/TemplateCanvas'
import { PublicationCard } from './components/Publications/PublicationCard'
import { CanvasThemeProvider } from './components/Canvas/CanvasThemeProvider'
import { generateAIContent, generateAISingleContent } from './utils/aiContentGeneration'
import { PageBuilder } from './components/PageBuilder'
import { DynamicBrandingCSS } from './components/BrandingSystem/DynamicBrandingCSS'
import { DesignConsole } from './components/DesignConsole'
import { WidgetRenderer } from './components/Widgets/WidgetRenderer'
import { EscapeHatch } from './components/PrototypeControls/EscapeHatch'
import { usePrototypeStore } from './stores/prototypeStore'
import { NotificationContainer, IssuesSidebar } from './components/Notifications'
import { SkinWrap } from './components/Widgets/SkinWrap'
import { buildWidget } from './utils/widgetBuilder'
import { InteractiveWidgetRenderer } from './components/PageBuilder/InteractiveWidgetRenderer'
import { type LibraryItem as SpecItem } from './library'

// Store - now extracted to its own file
// Re-exported for backward compatibility with existing imports
export { usePageStore } from './stores'
import { usePageStore } from './stores'

// Import specific types and constants from organized directories
import { 
// Widget types
  type Widget, type WidgetSection, type CanvasItem, isSection, 
  type Skin, type WidgetBase, type TextWidget, type ImageWidget, type NavbarWidget, type MenuWidget, type HTMLWidget, type CodeWidget, type HeadingWidget, type ButtonWidget, type PublicationListWidget, type PublicationDetailsWidget,
  // App types
  type Notification, type NotificationType,
  // Schema.org types
  type SchemaObject
} from './types'
import { 
  MOCK_SCHOLARLY_ARTICLES
} from './constants'
import { createDebugLogger } from './utils/logger'

// Control logging for this file
const DEBUG = false
const debugLog = createDebugLogger(DEBUG)

// NOTE: AI Content Generation functions moved to src/utils/aiContentGeneration.ts
// NOTE: Notification components moved to src/components/Notifications/









// NOTE: PublicationCard component moved to src/components/Publications/PublicationCard.tsx
// NOTE: InteractiveWidgetRenderer moved to src/components/PageBuilder/InteractiveWidgetRenderer.tsx
// NOTE: buildWidget moved to src/utils/widgetBuilder.ts
// NOTE: SkinWrap moved to src/components/Widgets/SkinWrap.tsx

// Page Creation Wizard Component


export default function App() {
  const { 
    currentView, 
    mockLiveSiteRoute, 
    setMockLiveSiteRoute, 
    setCurrentView, 
    setEditingContext, 
    currentWebsiteId
  } = usePageStore()
  
  const { drawerOpen } = usePrototypeStore()
  
  // Expose usePageStore to window for component access (for prototype only)
  useEffect(() => {
    (window as any).usePageStore = usePageStore
  }, [])
  
  // Global click handler to close toolbars
  useEffect(() => {
    const handleGlobalClick = () => {
      // This will be handled by individual components
    }
    
    document.addEventListener('click', handleGlobalClick)
    return () => document.removeEventListener('click', handleGlobalClick)
  }, [])
  
  if (currentView === 'design-console') {
    return (
      <>
        {/* NOTE: CanvasThemeProvider removed from here - it should only wrap specific preview areas
            inside DesignConsole, not the entire console UI. Theme CSS is injected separately. */}
        <DynamicBrandingCSS websiteId={currentWebsiteId} usePageStore={usePageStore} />
        <DesignConsole />
        <NotificationContainer />
        {/* EscapeHatch is already included inside DesignConsole component */}
      </>
    )
  }
  
  if (currentView === 'mock-live-site') {
    return (
      <div 
        className="min-h-screen transition-all duration-300 ease-in-out"
        style={{ marginRight: drawerOpen ? '288px' : '0' }}
      >
        <DynamicBrandingCSS websiteId={currentWebsiteId} usePageStore={usePageStore} />
        <CanvasThemeProvider usePageStore={usePageStore}>
          <MockLiveSite 
            mockLiveSiteRoute={mockLiveSiteRoute}
            setMockLiveSiteRoute={setMockLiveSiteRoute}
            setCurrentView={setCurrentView}
            setEditingContext={setEditingContext}
            usePageStore={usePageStore}
            showNavigation={false}  // Navigation via Escape Hatch
          />
        </CanvasThemeProvider>
        <NotificationContainer />
        <EscapeHatch 
          context="live-site"
          websiteId={currentWebsiteId}
        />
      </div>
    )
  }
  
  return (
    <div 
      className="min-h-screen transition-all duration-300 ease-in-out"
      style={{ marginRight: drawerOpen ? '288px' : '0' }}
    >
      <DynamicBrandingCSS websiteId={currentWebsiteId} usePageStore={usePageStore} />
      <PageBuilder 
        usePageStore={usePageStore}
        buildWidget={buildWidget}
        TemplateCanvas={TemplateCanvas}
        InteractiveWidgetRenderer={InteractiveWidgetRenderer}
        isSection={isSection}
      />
      <NotificationContainer />
      <IssuesSidebar />
      <EscapeHatch 
        context="editor"
        websiteId={currentWebsiteId}
      />
    </div>
  )
}
