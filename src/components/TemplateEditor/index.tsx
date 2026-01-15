/**
 * TemplateEditor - Editor for user-saved page templates
 * 
 * Similar to ArchetypeEditor but for CustomStarterPages.
 * Changes to templates propagate to pages that sync with them.
 */

import { useEffect, useRef, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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
import type { CustomStarterPage } from '../../types/widgets'
import { createDebugLogger } from '../../utils/logger'

const DEBUG = true
const debugLog = createDebugLogger(DEBUG)

export function TemplateEditor() {
  const { templateId } = useParams<{ templateId: string }>()
  const navigate = useNavigate()
  
  const { 
    customStarterPages,
    addCustomStarterPage,
    removeCustomStarterPage,
    replaceCanvasItems,
    canvasItems,
    setEditingContext,
    setMockLiveSiteRoute,
    setCurrentWebsiteId,
    setCanvasOwnerId,
    addNotification,
    setPageCanvas
  } = usePageStore()
  
  const { drawerOpen } = usePrototypeStore()
  
  // Track if we've loaded the template
  const loadedRef = useRef(false)
  const [hasChanges, setHasChanges] = useState(false)
  const initialCanvasRef = useRef<CanvasItem[] | null>(null)
  
  // Find the template
  const template = useMemo(() => {
    return customStarterPages.find((p: CustomStarterPage) => p.id === templateId)
  }, [customStarterPages, templateId])
  
  // Get draft accessor
  const getPageCanvasForPreview = usePageStore(state => state.getPageCanvasForPreview)
  
  // Load template on mount
  useEffect(() => {
    if (!template || loadedRef.current) return
    
    // Set editing context
    setEditingContext('template')
    setMockLiveSiteRoute('/') // Reset to prevent journal context bleed
    setCanvasOwnerId(`template:${templateId}`)
    
    // Check for draft first (from preview round-trip)
    const draftKey = `template:${templateId}:draft`
    const draftContent = getPageCanvasForPreview('template', draftKey)
    
    let canvasToLoad: CanvasItem[]
    
    if (draftContent && draftContent.length > 0) {
      debugLog('log', '📄 [TemplateEditor] Loading from DRAFT:', {
        id: template.id,
        name: template.name,
        draftKey,
        itemCount: draftContent.length
      })
      canvasToLoad = draftContent
    } else {
      debugLog('log', '📄 [TemplateEditor] Loading from SAVED template:', {
        id: template.id,
        name: template.name,
        itemCount: template.canvasItems?.length
      })
      canvasToLoad = template.canvasItems || []
    }
    
    replaceCanvasItems(canvasToLoad)
    // Always track against saved template for change detection
    initialCanvasRef.current = JSON.parse(JSON.stringify(template.canvasItems || []))
    
    loadedRef.current = true
  }, [template, templateId, replaceCanvasItems, setEditingContext, setMockLiveSiteRoute, setCanvasOwnerId, getPageCanvasForPreview])
  
  // Track changes
  useEffect(() => {
    if (!initialCanvasRef.current || !loadedRef.current) return
    
    const hasChanges = JSON.stringify(canvasItems) !== JSON.stringify(initialCanvasRef.current)
    setHasChanges(hasChanges)
  }, [canvasItems])
  
  // Get clear page canvas accessor
  const clearPageCanvas = usePageStore(state => state.clearPageCanvas)
  
  // Handle save
  const handleSaveTemplate = () => {
    if (!template) return
    
    // Update the template with new canvas items
    const updatedTemplate: CustomStarterPage = {
      ...template,
      canvasItems: JSON.parse(JSON.stringify(canvasItems)),
      // Keep createdAt, update conceptually (no updatedAt field in type)
    }
    
    // Remove old and add updated (since there's no updateCustomStarterPage)
    removeCustomStarterPage(template.id)
    addCustomStarterPage(updatedTemplate)
    
    // Clear draft after saving
    const draftKey = `template:${templateId}:draft`
    clearPageCanvas('template', draftKey)
    
    // Update initial ref for change tracking
    initialCanvasRef.current = JSON.parse(JSON.stringify(canvasItems))
    setHasChanges(false)
    
    addNotification?.({
      type: 'success',
      title: 'Template Saved',
      message: `"${template.name}" has been updated. Pages synced with this template will see the changes.`
    })
    
    debugLog('log', '💾 [TemplateEditor] Template saved:', {
      id: template.id,
      name: template.name,
      itemCount: canvasItems.length
    })
  }
  
  // Handle preview - save draft first so preview shows current changes
  const handlePreview = () => {
    // Save current canvas as draft for preview to pick up
    const draftKey = `template:${templateId}:draft`
    setPageCanvas('template', draftKey, canvasItems)
    
    debugLog('log', '👁️ [TemplateEditor] Saving draft before preview:', {
      draftKey,
      itemCount: canvasItems.length
    })
    
    navigate(`/preview/template/${templateId}`)
  }
  
  if (!template) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Template Not Found</h1>
          <p className="text-gray-600 mb-4">
            The template "{templateId}" does not exist.
          </p>
          <button
            onClick={() => navigate('/v1')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Design Console
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div 
      className="min-h-screen bg-gray-100 transition-all duration-300 ease-in-out"
      style={{ marginRight: drawerOpen ? '288px' : '0' }}
    >
      {/* Template context bar */}
      <div className="bg-indigo-600 text-white px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/v1')}
            className="text-indigo-200 hover:text-white text-sm"
          >
            ← Back to Design Console
          </button>
          <span className="text-indigo-300">|</span>
          <span className="font-medium">Editing Template: {template.name}</span>
          {hasChanges && (
            <span className="bg-indigo-500 text-xs px-2 py-0.5 rounded">Unsaved changes</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePreview}
            className="px-3 py-1.5 text-sm bg-indigo-500 hover:bg-indigo-400 rounded transition-colors"
          >
            Preview
          </button>
          <button
            onClick={handleSaveTemplate}
            disabled={!hasChanges}
            className="px-3 py-1.5 text-sm bg-white text-indigo-600 hover:bg-indigo-50 rounded transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Template
          </button>
        </div>
      </div>
      
      {/* Page Builder */}
      <PageBuilder 
        usePageStore={usePageStore}
        buildWidget={buildWidget}
        TemplateCanvas={TemplateCanvas}
        InteractiveWidgetRenderer={InteractiveWidgetRenderer}
        isSection={isSection}
        pageInstanceMode={false}
        isTemplateMode={true}
        templateName={template.name}
      />
      
      <EscapeHatch 
        context="editor"
        websiteId={template.websiteId}
        websiteName={template.websiteName}
        pageId={`template:${templateId}`}
      />
      
      <NotificationContainer />
      <IssuesSidebar />
    </div>
  )
}

export default TemplateEditor
