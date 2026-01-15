/**
 * TemplatePreview - Preview for user-saved page templates
 * 
 * Shows the template content with mock data and an "Edit Template" button.
 */

import { useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CanvasRenderer } from '../LiveSite/CanvasRenderer'
import { DynamicBrandingCSS } from '../BrandingSystem/DynamicBrandingCSS'
import { EscapeHatch } from '../PrototypeControls/EscapeHatch'
import { usePageStore } from '../../stores'
import { mockWebsites } from '../../data/mockWebsites'
import type { CustomStarterPage } from '../../types/widgets'
import { Edit3, Layout } from 'lucide-react'
import { createDebugLogger } from '../../utils/logger'

const DEBUG = true
const debugLog = createDebugLogger(DEBUG)

export function TemplatePreview() {
  const { templateId } = useParams<{ templateId: string }>()
  const navigate = useNavigate()
  
  const { customStarterPages, setMockLiveSiteRoute, getPageCanvasForPreview } = usePageStore()
  
  // Find the template
  const template = useMemo(() => {
    return customStarterPages.find((p: CustomStarterPage) => p.id === templateId)
  }, [customStarterPages, templateId])
  
  // Get website for branding and layout
  const website = useMemo(() => {
    if (!template?.websiteId) return null
    return mockWebsites.find(w => w.id === template.websiteId)
  }, [template])
  
  // Get site layout (header/footer) from website
  const siteLayout = useMemo(() => {
    const layout = (website as any)?.siteLayout
    return {
      header: layout?.header || [],
      footer: layout?.footer || [],
      headerEnabled: layout?.headerEnabled !== false,
      footerEnabled: layout?.footerEnabled !== false
    }
  }, [website])
  
  // Check for draft content first (from Preview button in editor)
  const previewContent = useMemo(() => {
    const draftKey = `template:${templateId}:draft`
    const draftContent = getPageCanvasForPreview('template', draftKey)
    
    if (draftContent && draftContent.length > 0) {
      debugLog('log', '👁️ [TemplatePreview] Using DRAFT content:', {
        templateId,
        draftKey,
        itemCount: draftContent.length
      })
      return draftContent
    }
    
    // Fall back to saved template content
    debugLog('log', '📄 [TemplatePreview] Using SAVED template content:', {
      templateId,
      itemCount: template?.canvasItems?.length
    })
    return template?.canvasItems || []
  }, [templateId, template, getPageCanvasForPreview])
  
  // Reset mock route on mount to prevent context bleed
  useEffect(() => {
    setMockLiveSiteRoute('/')
  }, [setMockLiveSiteRoute])
  
  useEffect(() => {
    debugLog('log', '📄 [TemplatePreview] Loading:', {
      templateId,
      templateName: template?.name,
      itemCount: previewContent.length
    })
  }, [templateId, template, previewContent])
  
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
    <div className="min-h-screen bg-white flex flex-col">
      {/* Inject branding CSS using the template's original website context */}
      {template.websiteId && (
        <DynamicBrandingCSS 
          websiteId={template.websiteId} 
          usePageStore={usePageStore}
        />
      )}
      
      {/* Preview Banner */}
      <div className="bg-indigo-600 text-white px-4 py-3 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Layout className="w-5 h-5" />
            <div>
              <span className="font-semibold">Template Preview: </span>
              <span>{template.name}</span>
            </div>
            <span className="bg-indigo-500 text-xs px-2 py-0.5 rounded">
              {previewContent.length} sections
            </span>
            {website && (
              <span className="text-indigo-200 text-xs">
                (using {website.name} branding)
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/v1')}
              className="px-3 py-1.5 text-sm bg-indigo-500 hover:bg-indigo-400 rounded transition-colors"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
      
      {/* Site Header */}
      {siteLayout.headerEnabled && siteLayout.header.length > 0 && (
        <CanvasRenderer 
          items={siteLayout.header}
          websiteId={template.websiteId}
          themeId={(website as any)?.themeId}
          brandMode={(website as any)?.brandMode}
        />
      )}
      
      {/* Template Content (the main page) */}
      <main className="flex-1">
        <CanvasRenderer 
          items={previewContent}
          websiteId={template.websiteId}
          themeId={(website as any)?.themeId}
          brandMode={(website as any)?.brandMode}
          showMockData={true}
        />
      </main>
      
      {/* Site Footer */}
      {siteLayout.footerEnabled && siteLayout.footer.length > 0 && (
        <CanvasRenderer 
          items={siteLayout.footer}
          websiteId={template.websiteId}
          themeId={(website as any)?.themeId}
          brandMode={(website as any)?.brandMode}
        />
      )}
      
      {/* Floating Edit Button */}
      <button
        onClick={() => navigate(`/edit/template/${templateId}`)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-700 transition-colors"
      >
        <Edit3 className="w-4 h-4" />
        <span className="font-medium">Edit Template</span>
      </button>
      
      {/* Escape Hatch - Prototype Controls */}
      <EscapeHatch 
        context="template-preview"
        websiteId={template.websiteId}
        websiteName={template.websiteName || website?.name}
        pageId={`template:${templateId}`}
      />
    </div>
  )
}

export default TemplatePreview
