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
  getPagesUsingArchetype
} from '../../stores/archetypeStore'
import { 
  initializeJournalHomeArchetype
} from '../../utils/archetypeFactory'
import type { Archetype } from '../../types/archetypes'
import { createDebugLogger } from '../../utils/logger'

// Control logging for this file
const DEBUG = false
const debugLog = createDebugLogger(DEBUG)

export function ArchetypeEditor() {
  const { archetypeId } = useParams<{ archetypeId: string }>()
  const [searchParams] = useSearchParams()
  const designId = searchParams.get('designId') || 'classic-ux3-theme'
  
  const { 
    setCurrentView, 
    setEditingContext,
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
  const [showMockData, setShowMockData] = useState(true) // Mock data toggle
  const [instanceCount, setInstanceCount] = useState(0) // Count of journals using this archetype
  const loadedRef = useRef(false)
  
  // Get drawer state for Escape Hatch margin adjustment
  const { drawerOpen } = usePrototypeStore()
  
  // Set up editing context
  useEffect(() => {
    setCurrentView('page-builder')
    setEditingContext('archetype')
  }, [setCurrentView, setEditingContext])
  
  // Load archetype
  useEffect(() => {
    if (!archetypeId) return
    
    // Initialize if missing (for journal-home)
    if (archetypeId === 'modern-journal-home') {
      const initialized = initializeJournalHomeArchetype(designId)
      setArchetype(initialized)
      return
    }
    
    // Load existing archetype
    const loaded = getArchetypeById(archetypeId, designId)
    if (loaded) {
      setArchetype(loaded)
    } else {
      debugLog('error', `Archetype not found: ${archetypeId}`)
    }
  }, [archetypeId, designId])
  
  // Count page instances using this archetype
  useEffect(() => {
    if (!archetypeId) return
    const count = countPageInstancesByArchetype(archetypeId)
    setInstanceCount(count)
  }, [archetypeId])
  
  // Load canvas items when archetype is loaded
  useEffect(() => {
    if (!archetype || loadedRef.current) return
    
    // Check if we have saved canvas (user edits)
    const savedCanvas = getPageCanvas('archetype', archetypeId!)
    if (savedCanvas && savedCanvas.length > 0) {
      replaceCanvasItems(savedCanvas)
      setIsEditingLoadedWebsite(true)
      loadedRef.current = true
      return
    }
    
    // Load from archetype
    const resolvedCanvas = resolveCanvasFromArchetype(archetype)
    replaceCanvasItems(resolvedCanvas)
    setIsEditingLoadedWebsite(true)
    loadedRef.current = true
  }, [archetype, archetypeId, replaceCanvasItems, setIsEditingLoadedWebsite, getPageCanvas])
  
  // Auto-save archetype when canvas changes
  // Use a ref to track the last saved canvas to avoid infinite loops
  const lastSavedCanvasRef = useRef<string>('')
  const isSavingRef = useRef(false)
  const archetypeRef = useRef(archetype)
  
  // Keep archetype ref in sync
  useEffect(() => {
    archetypeRef.current = archetype
  }, [archetype])
  
  useEffect(() => {
    if (!archetypeRef.current || !loadedRef.current || canvasItems.length === 0) return
    if (isSavingRef.current) return // Prevent concurrent saves
    
    // Create a stable key from canvas items to detect actual changes
    const canvasKey = JSON.stringify(canvasItems.map(item => ({
      id: item.id,
      areas: (item as any).areas?.map((a: any) => ({
        id: a.id,
        widgets: a.widgets?.map((w: any) => ({ id: w.id, type: w.type }))
      }))
    })))
    
    // Only save if canvas actually changed
    if (canvasKey === lastSavedCanvasRef.current) return
    
    // Mark as saving to prevent concurrent updates
    isSavingRef.current = true
    
    // Clean canvas items (remove publications data, keep config)
    const cleanedCanvas = cleanCanvasForArchetype(canvasItems)
    const currentArchetype = archetypeRef.current
    
    if (!currentArchetype) {
      isSavingRef.current = false
      return
    }
    
    const updatedArchetype: Archetype = {
      ...currentArchetype,
      canvasItems: cleanedCanvas,
      updatedAt: new Date()
    }
    
    // Save to archetype store (synchronous, but doesn't trigger React state)
    saveArchetype(updatedArchetype)
    
    // Update archetype state (this will trigger a re-render, but that's okay)
    setArchetype(updatedArchetype)
    
    // Save to page canvas (Zustand store update - happens after React state update)
    setPageCanvas('archetype', archetypeId!, cleanedCanvas)
    
    // Clear cached canvas for all pages using this archetype
    // This ensures they re-resolve from the updated archetype on next load
    // Need to clear BOTH pageCanvasData, routeCanvasItems, AND drafts
    const pagesUsingArchetype = getPagesUsingArchetype(currentArchetype.id)
    pagesUsingArchetype.forEach(({ websiteId, pageId }) => {
      clearPageCanvas(websiteId, pageId)
      // Also clear routeCanvasItems (LiveSite uses both storage locations)
      const route = `/${pageId}`
      clearCanvasItemsForRoute(route)
      // CRITICAL: Also clear drafts - otherwise the draft will take priority over archetype
      clearPageDraft(websiteId, pageId)
    })
    
    // Update ref to track this save
    lastSavedCanvasRef.current = canvasKey
    isSavingRef.current = false
  }, [canvasItems, archetypeId, setPageCanvas, clearPageCanvas, clearCanvasItemsForRoute, clearPageDraft]) // Don't include archetype to prevent loops
  
  
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
  
  if (!archetype) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-600">Loading archetype...</p>
        </div>
      </div>
    )
  }
  
  // Handle save archetype
  const handleSaveArchetype = () => {
    if (!archetype) return
    
    // Clean canvas items (remove publications data, keep config)
    const cleanedCanvas = cleanCanvasForArchetype(canvasItems)
    
    const updatedArchetype: Archetype = {
      ...archetype,
      canvasItems: cleanedCanvas,
      updatedAt: new Date()
    }
    
    // Save archetype
    saveArchetype(updatedArchetype)
    setArchetype(updatedArchetype)
    
    // Clear cached canvas for all pages using this archetype
    // This ensures they re-resolve from the updated archetype on next load
    // Need to clear BOTH pageCanvasData and routeCanvasItems
    const pagesUsingArchetype = getPagesUsingArchetype(archetype.id)
    const clearedCount = pagesUsingArchetype.length
    
    pagesUsingArchetype.forEach(({ websiteId, pageId }) => {
      debugLog('log', `🗑️ [ArchetypeEditor] Clearing cached canvas for: ${websiteId}:${pageId}`)
      clearPageCanvas(websiteId, pageId)
      // Also clear routeCanvasItems (LiveSite uses both storage locations)
      const route = `/${pageId}`
      clearCanvasItemsForRoute(route)
      // CRITICAL: Also clear drafts - otherwise the draft will take priority over archetype
      clearPageDraft(websiteId, pageId)
      debugLog('log', `🗑️ [ArchetypeEditor] Cleared all caches (canvas, route, draft) for: ${route}`)
    })
    
    // Show success message with actual journal count cleared
    const journalText = clearedCount === 1 ? 'journal' : 'journals'
    addNotification({
      type: 'success',
      title: 'Archetype Saved',
      message: clearedCount > 0 
        ? `Changes will affect ${clearedCount} ${journalText} using this template.`
        : 'Archetype saved successfully.',
      closeAfter: 5000
    })
    
    // Update instance count state to match actual
    setInstanceCount(clearedCount)
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
            onSaveArchetype={handleSaveArchetype}
            onPageSettingsClick={handlePageSettingsClick}
            onShowMockDataChange={setShowMockData}
            onPageConfigChange={handlePageConfigChange}
          />
      
      <EscapeHatch 
        context="editor"
        websiteId="archetype"
        websiteName={archetype.name}
        pageId={archetypeId || ''}
      />
    </div>
  )
}

