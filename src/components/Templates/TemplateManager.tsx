import React from 'react'
import type { WidgetSection, EditingContext } from '../../types'
import { createTOCTemplate, generateMockTOCContent } from './TOCTemplate'

// Template Manager - handles loading different templates based on context
export interface TemplateManagerProps {
  editingContext: EditingContext
  templateType?: string
  journalCode?: string
  onTemplateLoad: (sections: WidgetSection[]) => void
}

export const TemplateManager: React.FC<TemplateManagerProps> = ({
  editingContext,
  templateType,
  journalCode = 'advma',
  onTemplateLoad
}) => {
  
  React.useEffect(() => {
    if (editingContext === 'template') {
      loadTemplate(templateType, journalCode)
    }
  }, [editingContext, templateType, journalCode])

  const loadTemplate = (type: string | undefined, journal: string) => {
    let templateSections: WidgetSection[] = []
    
    switch (type) {
      case 'toc':
      case 'issue':
        templateSections = createTOCTemplate(journal)
        break
      case 'journal-home':
        templateSections = createJournalHomeTemplate(journal)
        break
      case 'article':
        templateSections = createArticleTemplate(journal)
        break
      default:
        console.log('Unknown template type:', type)
        return
    }
    
    onTemplateLoad(templateSections)
  }

  // Placeholder for other template types
  const createJournalHomeTemplate = (journalCode: string): WidgetSection[] => {
    // TODO: Implement journal home template
    return []
  }
  
  const createArticleTemplate = (journalCode: string): WidgetSection[] => {
    // TODO: Implement article template  
    return []
  }

  // This component doesn't render anything - it's just for template management
  return null
}

// Helper function to determine template type from URL
export const getTemplateTypeFromRoute = (route: string): string | undefined => {
  if (route.includes('/toc/')) return 'toc'
  if (route.includes('/journal/')) return 'journal-home'
  if (route.includes('/article/')) return 'article'
  return undefined
}

// Helper function to extract journal code from URL
export const getJournalCodeFromRoute = (route: string): string => {
  const matches = route.match(/\/(advma|embo)\//)
  return matches ? matches[1] : 'advma'
}

// Template context information for the editor
export const getTemplateInfo = (templateType: string, journalCode: string) => {
  const journalNames = {
    'advma': 'Advanced Materials',
    'embo': 'The EMBO Journal'
  }
  
  const templateNames = {
    'toc': 'Table of Contents Template',
    'journal-home': 'Journal Homepage Template', 
    'article': 'Article Page Template'
  }
  
  return {
    templateName: templateNames[templateType as keyof typeof templateNames] || 'Template',
    journalName: journalNames[journalCode as keyof typeof journalNames] || 'Journal',
    description: `Template used for all ${templateNames[templateType as keyof typeof templateNames]?.toLowerCase()} pages in ${journalNames[journalCode as keyof typeof journalNames]}`
  }
}

export default TemplateManager
