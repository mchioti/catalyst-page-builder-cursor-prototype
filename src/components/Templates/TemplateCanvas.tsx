import React from 'react'
import type { WidgetSection, EditingContext, MockLiveSiteRoute } from '../../types'
import { TemplateManager, getTemplateTypeFromRoute, getJournalCodeFromRoute, getTemplateInfo } from './TemplateManager'

// Access to usePageStore for navigation
declare global {
  interface Window {
    usePageStore: any
  }
}

export interface TemplateCanvasProps {
  editingContext: EditingContext
  mockLiveSiteRoute: MockLiveSiteRoute
  onSectionsLoad: (sections: WidgetSection[]) => void
}

export const TemplateCanvas: React.FC<TemplateCanvasProps> = ({
  editingContext,
  mockLiveSiteRoute,
  onSectionsLoad
}) => {
  const [isTemplateMode, setIsTemplateMode] = React.useState(false)
  const [templateInfo, setTemplateInfo] = React.useState<{
    templateName: string
    journalName: string
    description: string
  } | null>(null)

  // Determine if we're in template editing mode
  React.useEffect(() => {
    const inTemplateMode = editingContext === 'template'
    setIsTemplateMode(inTemplateMode)
    
    if (inTemplateMode) {
      const templateType = getTemplateTypeFromRoute(mockLiveSiteRoute)
      const journalCode = getJournalCodeFromRoute(mockLiveSiteRoute)
      
      if (templateType) {
        const info = getTemplateInfo(templateType, journalCode)
        setTemplateInfo(info)
      }
    } else {
      setTemplateInfo(null)
    }
  }, [editingContext, mockLiveSiteRoute])

  const handleTemplateLoad = (sections: WidgetSection[]) => {
    console.log('🎯 Template loaded:', sections.length, 'sections')
    onSectionsLoad(sections)
  }

  if (!isTemplateMode) {
    return null
  }

  const templateType = getTemplateTypeFromRoute(mockLiveSiteRoute)
  const journalCode = getJournalCodeFromRoute(mockLiveSiteRoute)

  return (
    <div className="template-canvas-container">
      {/* Single Clean Template Banner */}
      {templateInfo && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg mb-4 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <div>
                <span className="text-sm font-medium text-amber-800">
                  Template Mode • AI Generated Content
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                const { setCurrentView, setSiteManagerView, setEditingContext } = window.usePageStore.getState()
                setCurrentView('design-console')
                setSiteManagerView('modernist-theme-templates')
                setEditingContext('page')
              }}
              className="text-xs text-amber-600 hover:text-amber-800 underline font-medium"
            >
              Back to Templates
            </button>
          </div>
        </div>
      )}

      {/* Template Manager */}
      <TemplateManager
        editingContext={editingContext}
        templateType={templateType}
        journalCode={journalCode}
        onTemplateLoad={handleTemplateLoad}
      />
    </div>
  )
}

export default TemplateCanvas
