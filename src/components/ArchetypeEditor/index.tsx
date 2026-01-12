/**
 * ArchetypeEditor - Editor for archetypes (Master templates)
 * 
 * Route: /edit/archetype/:archetypeId?designId=xxx
 */

import { useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { PageBuilder } from '../PageBuilder'
import { DynamicBrandingCSS } from '../BrandingSystem/DynamicBrandingCSS'
import { NotificationContainer } from '../Notifications'
import { EscapeHatch } from '../PrototypeControls/EscapeHatch'
import { usePageStore } from '../../stores'
import { usePrototypeStore } from '../../stores/prototypeStore'
import { TemplateCanvas } from '../Templates/TemplateCanvas'
import { InteractiveWidgetRenderer } from '../PageBuilder/InteractiveWidgetRenderer'
import { buildWidget } from '../../utils/widgetBuilder'
import { isSection } from '../../types'
import { 
  getArchetypeById, 
  saveArchetype,
  resolveCanvasFromArchetype,
  countPageInstancesByArchetype,
  getPagesUsingArchetype,
  getWebsiteArchetypeOverride,
  saveWebsiteArchetypeOverride
} from '../../stores/archetypeStore'
import type { WebsiteArchetypeOverride } from '../../types/archetypes'
import { 
  initializeJournalHomeArchetype
} from '../../utils/archetypeFactory'
import type { Archetype } from '../../types/archetypes'
import type { WidgetSection } from '../../types'
import { createDebugLogger } from '../../utils/logger'
import { PublishReviewModal } from '../PageBuilder/PublishReviewModal'
import { compareSectionWithArchetype } from '../../utils/zoneComparison'

// Control logging for this file
const DEBUG = false
const debugLog = createDebugLogger(DEBUG)

export function ArchetypeEditor() {
  const { archetypeId } = useParams<{ archetypeId: string }>()
  const [searchParams] = useSearchParams()
  const designId = searchParams.get('designId') || 'classic-ux3-theme'
  const websiteId = searchParams.get('websiteId') // Optional - if present, save to website-level override
  
  const { 
    setCurrentView, 
    setEditingContext,
    setMockLiveSiteRoute,
    replaceCanvasItems,
    setIsEditingLoadedWebsite,
    canvasItems,
    setPageCanvas,
    getPageCanvas,
    clearPageCanvas,
    clearCanvasItemsForRoute,
    clearPageDraft,
    addNotification
  } = usePageStore()
  
  // const { drawerOpen } = usePrototypeStore() // Reserved for future use
  
  const [archetype, setArchetype] = useState<Archetype | null>(null)
  const [websiteOverride, setWebsiteOverride] = useState<WebsiteArchetypeOverride | null>(null)
  const [showMockData, setShowMockData] = useState(true) // Mock data toggle
  const [instanceCount, setInstanceCount] = useState(0) // Count of journals using this archetype
  const [showPublishModal, setShowPublishModal] = useState(false) // Show review modal
  const loadedRef = useRef(false)
  const baselineCanvasRef = useRef<any[]>([]) // Track original archetype for change detection
  
  // Get drawer state for Escape Hatch margin adjustment
  const { drawerOpen } = usePrototypeStore()
  
  // Set up editing context
  useEffect(() => {
    setCurrentView('page-builder')
    setEditingContext('archetype')
    // CRITICAL: Reset mockLiveSiteRoute to prevent journal context from bleeding in
    // Without this, journalCode would be extracted from the previous journal's route
    // and widgets would load that journal's data instead of generating AI mock content
    setMockLiveSiteRoute('/')
    debugLog('log', '🎨 [ArchetypeEditor] Reset mockLiveSiteRoute for archetype mode')
  }, [setCurrentView, setEditingContext, setMockLiveSiteRoute])
  
  // Load archetype and website override
  useEffect(() => {
    if (!archetypeId) return
    
    // Initialize if missing (for journal-home)
    if (archetypeId === 'modern-journal-home') {
      const initialized = initializeJournalHomeArchetype(designId)
      setArchetype(initialized)
    } else {
      // Load existing archetype
      const loaded = getArchetypeById(archetypeId, designId)
      if (loaded) {
        setArchetype(loaded)
      } else {
        debugLog('error', `Archetype not found: ${archetypeId}`)
      }
    }
    
    // Load website override if websiteId is present
    if (websiteId) {
      const override = getWebsiteArchetypeOverride(websiteId, archetypeId)
      setWebsiteOverride(override)
      debugLog('log', `📦 [ArchetypeEditor] Loaded website override for ${websiteId}:${archetypeId}:`, override ? Object.keys(override.overrides) : 'none')
    } else {
      setWebsiteOverride(null)
    }
  }, [archetypeId, designId, websiteId])
  
  // Count page instances using this archetype
  useEffect(() => {
    if (!archetypeId) return
    
    if (websiteId) {
      // Count only pages in this website
      const allPages = getPagesUsingArchetype(archetypeId)
      const websitePages = allPages.filter(p => p.websiteId === websiteId)
      setInstanceCount(websitePages.length)
    } else {
      // Count all pages across all websites
      const count = countPageInstancesByArchetype(archetypeId)
      setInstanceCount(count)
    }
  }, [archetypeId, websiteId])
  
  // Load canvas items when archetype is loaded
  useEffect(() => {
    debugLog('log', `🔍 [ArchetypeEditor] LOAD EFFECT: archetype=${archetype?.name || 'null'}, loadedRef=${loadedRef.current}, archetypeId=${archetypeId}, websiteId=${websiteId || 'none'}`)
    debugLog('log', `🔍 [ArchetypeEditor] LOAD EFFECT: Current canvasItems has ${canvasItems.length} sections, first section id=${canvasItems[0]?.id || 'none'}`)
    
    if (!archetype || loadedRef.current) {
      debugLog('log', `🔍 [ArchetypeEditor] LOAD EFFECT: Skipping - archetype=${!!archetype}, loadedRef=${loadedRef.current}`)
      return
    }
    
    // Check if we have saved canvas (user edits)
    // Use website-specific key if websiteId is present
    const canvasKey = websiteId ? `${websiteId}:${archetypeId}` : archetypeId!
    const savedCanvas = getPageCanvas('archetype', canvasKey)
    debugLog('log', `🔍 [ArchetypeEditor] LOAD EFFECT: savedCanvas has ${savedCanvas?.length || 0} sections (key: ${canvasKey})`)
    
    // Always set baseline from the resolved archetype with website override (the committed state)
    const archetypeCanvas = resolveCanvasFromArchetype(archetype, websiteOverride)
    baselineCanvasRef.current = JSON.parse(JSON.stringify(archetypeCanvas))
    
    if (savedCanvas && savedCanvas.length > 0) {
      debugLog('log', `📂 [ArchetypeEditor] Loading from SAVED canvas, first section id=${savedCanvas[0]?.id}`)
      replaceCanvasItems(savedCanvas)
      setIsEditingLoadedWebsite(true)
      loadedRef.current = true
      return
    }
    
    // Load from archetype with website override
    debugLog('log', `📂 [ArchetypeEditor] Loading from ARCHETYPE with website override:`)
    debugLog('log', `   - Archetype name: ${archetype.name}`)
    debugLog('log', `   - Website override zones: ${websiteOverride ? Object.keys(websiteOverride.overrides).join(', ') : 'none'}`)
    debugLog('log', `   - Resolved canvas count: ${archetypeCanvas.length}`)
    debugLog('log', `   - First resolved section: id=${archetypeCanvas[0]?.id}, zoneSlug=${(archetypeCanvas[0] as any)?.zoneSlug}`)
    replaceCanvasItems(archetypeCanvas)
    setIsEditingLoadedWebsite(true)
    loadedRef.current = true
  }, [archetype, archetypeId, websiteId, websiteOverride, replaceCanvasItems, setIsEditingLoadedWebsite, getPageCanvas, canvasItems])
  
  // AUTO-SAVE DISABLED - It was causing data corruption!
  // The auto-save would run with stale canvasItems (from previous page edit) 
  // before the archetype content was loaded, corrupting the archetype store.
  // Changes are now only saved on explicit user action (click "Save Archetype" button)
  //
  // If you need to re-enable auto-save in the future, you MUST:
  // 1. Check canvasOwnerId to ensure canvasItems belong to this archetype
  // 2. Wait until AFTER the archetype content has been loaded into canvasItems
  // 3. Never save during the initial mount phase
  
  
  // Clean canvas items for archetype storage (remove data, keep config)
  function cleanCanvasForArchetype(items: any[]): any[] {
    return items.map(section => {
      const cleaned = { ...section }
      
      if (cleaned.areas) {
        cleaned.areas = cleaned.areas.map((area: any) => ({
          ...area,
          widgets: area.widgets.map((widget: any) => {
            const cleanedWidget = { ...widget }
            
            // Remove publications array from publication-list
            if (widget.type === 'publication-list' && 'publications' in widget) {
              delete cleanedWidget.publications
            }
            
            // Clear publication object from publication-details
            if (widget.type === 'publication-details' && widget.publication) {
              cleanedWidget.publication = {}
            }
            
            return cleanedWidget
          })
        }))
      }
      
      return cleaned
    })
  }
  
  // Compute modified sections by comparing current canvas to baseline
  const computeModifiedSections = (): Set<string> => {
    const modified = new Set<string>()
    const baseline = baselineCanvasRef.current
    
    if (!baseline || baseline.length === 0) return modified
    
    // Check each current section against baseline
    canvasItems.forEach((section: any) => {
      const zoneSlug = section.zoneSlug || section.id
      const baselineSection = baseline.find((b: any) => 
        b.zoneSlug === section.zoneSlug || b.id === section.id
      )
      
      if (!baselineSection) {
        // New section added
        modified.add(zoneSlug)
      } else {
        // Check if section has changes
        const hasChanges = compareSectionWithArchetype(section, baselineSection)
        if (hasChanges) {
          modified.add(zoneSlug)
        }
      }
    })
    
    // Check for removed sections
    baseline.forEach((baselineSection: any) => {
      const zoneSlug = baselineSection.zoneSlug || baselineSection.id
      const stillExists = canvasItems.some((s: any) => 
        s.zoneSlug === baselineSection.zoneSlug || s.id === baselineSection.id
      )
      if (!stillExists) {
        modified.add(zoneSlug)
      }
    })
    
    return modified
  }
  
  // Get current modified sections
  const modifiedSections = computeModifiedSections()
  
  // Create baseline sections map for PublishReviewModal
  const baselineSectionsMap = new Map<string, WidgetSection>()
  baselineCanvasRef.current.forEach((section: any) => {
    const key = section.zoneSlug || section.id
    baselineSectionsMap.set(key, section)
  })
  
  if (!archetype) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-600">Loading archetype...</p>
        </div>
      </div>
    )
  }
  
  // Handle showing the publish modal
  const handleShowPublishModal = () => {
    setShowPublishModal(true)
  }
  
  // Handle confirming the publish action
  const handleConfirmPublish = () => {
    if (!archetype) return
    
    console.log('💾 [ArchetypeEditor] CONFIRM PUBLISH:')
    console.log('   - archetypeId:', archetypeId)
    console.log('   - websiteId:', websiteId || 'none (Design level)')
    console.log('   - canvasItems count:', canvasItems.length)
    console.log('   - First section widgets:', canvasItems[0]?.areas?.[0]?.widgets?.map((w: any) => w.type).join(', '))
    
    // Clean canvas items (remove publications data, keep config)
    const cleanedCanvas = cleanCanvasForArchetype(canvasItems)
    console.log('   - Cleaned canvas count:', cleanedCanvas.length)
    
    if (websiteId) {
      // WEBSITE-LEVEL SAVE: Save as website override
      console.log('   📄 WEBSITE-LEVEL SAVE for:', websiteId)
      
      // Extract zone overrides by comparing current canvas to design archetype
      const overrides: Record<string, WidgetSection> = {}
      
      cleanedCanvas.forEach((section: WidgetSection) => {
        if (!section.zoneSlug) return
        
        // Find corresponding section in design archetype
        const designSection = archetype.canvasItems.find(s => s.zoneSlug === section.zoneSlug)
        
        // If section differs from design archetype, store as override
        // For simplicity, we store all sections that have zoneSlug (can be optimized later)
        if (section.zoneSlug) {
          overrides[section.zoneSlug] = section
          console.log('   - Storing override for zone:', section.zoneSlug)
        }
      })
      
      const newOverride: WebsiteArchetypeOverride = {
        id: `${websiteId}:${archetype.id}`,
        type: 'website-archetype-override',
        websiteId,
        archetypeId: archetype.id,
        designId: archetype.designId,
        overrides,
        createdAt: websiteOverride?.createdAt || new Date(),
        updatedAt: new Date()
      }
      
      console.log('   - Saving WebsiteArchetypeOverride:', newOverride.id)
      console.log('   - Override zones:', Object.keys(overrides))
      saveWebsiteArchetypeOverride(newOverride)
      setWebsiteOverride(newOverride)
      
      // Update baseline to match saved state
      baselineCanvasRef.current = JSON.parse(JSON.stringify(cleanedCanvas))
      
      // Clear cached canvas for pages using this archetype IN THIS WEBSITE ONLY
      const allPages = getPagesUsingArchetype(archetype.id)
      console.log('   - All pages using archetype:', allPages.map(p => `${p.websiteId}:${p.pageId}`))
      const websitePages = allPages.filter(p => p.websiteId === websiteId)
      console.log('   - Pages in this website:', websitePages.map(p => `${p.websiteId}:${p.pageId}`))
      
      websitePages.forEach(({ websiteId: wId, pageId }) => {
        console.log(`   🗑️ Clearing cached canvas for: ${wId}:${pageId}`)
        clearPageCanvas(wId, pageId)
        const route = `/${pageId}`
        clearCanvasItemsForRoute(route)
        clearPageDraft(wId, pageId)
      })
      
      setShowPublishModal(false)
      setInstanceCount(websitePages.length)
      
      addNotification({
        type: 'success',
        title: 'Website Master Updated',
        message: `Changes saved to website. ${websitePages.length} journal(s) in this website will be updated.`,
        closeAfter: 3000
      })
    } else {
      // DESIGN-LEVEL SAVE: Save to design archetype (affects all websites)
      console.log('   🏛️ DESIGN-LEVEL SAVE')
      
      const updatedArchetype: Archetype = {
        ...archetype,
        canvasItems: cleanedCanvas,
        updatedAt: new Date()
      }
      
      console.log('   - Saving to design archetype:', updatedArchetype.id)
      console.log('   - Canvas items:', cleanedCanvas.length)
      saveArchetype(updatedArchetype)
      setArchetype(updatedArchetype)
      
      // Update baseline to match saved state
      baselineCanvasRef.current = JSON.parse(JSON.stringify(cleanedCanvas))
      
      // Clear cached canvas for ALL pages using this archetype
      const pagesUsingArchetype = getPagesUsingArchetype(archetype.id)
      const clearedCount = pagesUsingArchetype.length
      console.log('   - Pages using archetype:', pagesUsingArchetype.map(p => `${p.websiteId}:${p.pageId}`))
      
      pagesUsingArchetype.forEach(({ websiteId: wId, pageId }) => {
        console.log(`   🗑️ Clearing cached canvas for: ${wId}:${pageId}`)
        clearPageCanvas(wId, pageId)
        const route = `/${pageId}`
        clearCanvasItemsForRoute(route)
        clearPageDraft(wId, pageId)
      })
      
      setShowPublishModal(false)
      setInstanceCount(clearedCount)
      
      addNotification({
        type: 'success',
        title: 'Design Master Updated',
        message: `Changes saved to design. ${clearedCount} journal(s) across all websites will be updated.`,
        closeAfter: 3000
      })
    }
  }
  
  // Handle discarding changes
  const handleDiscard = () => {
    if (!archetype) return
    
    // Reload from baseline (original archetype)
    const originalCanvas = JSON.parse(JSON.stringify(baselineCanvasRef.current))
    replaceCanvasItems(originalCanvas)
    
    // Close modal
    setShowPublishModal(false)
  }
  
  // Handle page settings click - deselect widget to show page settings in Properties Panel
  const handlePageSettingsClick = () => {
    usePageStore.getState().selectWidget(null)
  }
  
  // Handle page config changes from Page Settings
  const handlePageConfigChange = (newPageConfig: import('../../types/archetypes').PageConfig) => {
    if (!archetype) return
    
    const updatedArchetype: Archetype = {
      ...archetype,
      pageConfig: newPageConfig,
      updatedAt: new Date()
    }
    
    saveArchetype(updatedArchetype)
    setArchetype(updatedArchetype)
    
    addNotification({
      type: 'success',
      title: 'Page Settings Updated',
      message: 'Page layout settings have been saved to the archetype.',
      closeAfter: 3000
    })
  }
  
  return (
    <div 
      className="h-screen flex flex-col transition-all duration-300 ease-in-out"
      style={{ marginRight: drawerOpen ? '288px' : '0' }}
    >
      <DynamicBrandingCSS websiteId="archetype" usePageStore={usePageStore} />
      <NotificationContainer />
      
      <PageBuilder
        usePageStore={usePageStore}
        buildWidget={buildWidget}
        TemplateCanvas={TemplateCanvas}
        InteractiveWidgetRenderer={InteractiveWidgetRenderer}
        isSection={isSection}
        archetypeMode={true}
        showMockData={showMockData}
        pageConfig={archetype?.pageConfig}
        archetypeName={archetype.name}
        archetypeInstanceCount={instanceCount}
        archetypeId={archetypeId}
        designId={designId}
        archetypeWebsiteId={websiteId || undefined}
        archetypeModifiedSections={modifiedSections}
        onSaveArchetype={handleShowPublishModal}
        onPageSettingsClick={handlePageSettingsClick}
        onShowMockDataChange={setShowMockData}
        onPageConfigChange={handlePageConfigChange}
      />
      
      {/* Archetype Publish Review Modal */}
      {showPublishModal && (
        <PublishReviewModal
          isOpen={showPublishModal}
          onClose={() => setShowPublishModal(false)}
          onPublish={() => {}} // Not used in archetype-master mode
          onSimplePublish={handleConfirmPublish}
          onDiscard={handleDiscard}
          mode="archetype-master"
          dirtyZones={modifiedSections}
          canvasItems={canvasItems as WidgetSection[]}
          baselineSections={baselineSectionsMap}
          archetypeName={archetype.name}
          affectedPagesCount={instanceCount}
        />
      )}
      
      <EscapeHatch 
        context="editor"
        websiteId="archetype"
        websiteName={archetype.name}
        pageId={archetypeId || ''}
      />
    </div>
  )
}

