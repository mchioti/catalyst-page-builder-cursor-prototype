import React from 'react'
import type { WidgetSection, EditingContext, MockLiveSiteRoute } from '../../types'
import { TemplateManager, getTemplateTypeFromRoute, getJournalCodeFromRoute, getTemplateInfo } from './TemplateManager'

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
      {/* Template Context Bar */}
      {templateInfo && (
        <div className="bg-orange-600 text-white px-6 py-3 border-b">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-orange-300 rounded-full animate-pulse"></div>
                <div>
                  <h3 className="font-semibold text-sm">Template Mode</h3>
                  <p className="text-orange-100 text-xs">
                    Editing: {templateInfo.templateName} for {templateInfo.journalName}
                  </p>
                </div>
              </div>
              <div className="text-xs text-orange-200">
                Changes affect all pages of this type
              </div>
            </div>
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

      {/* Template Instructions */}
      {templateInfo && (
        <div className="bg-orange-50 border-b border-orange-200 px-6 py-3">
          <div className="max-w-6xl mx-auto">
            <p className="text-sm text-orange-800">
              <strong>Template Editing:</strong> {templateInfo.description}. 
              Use AI-generated mock content for preview. Changes will apply to all issues/pages of this type.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default TemplateCanvas
