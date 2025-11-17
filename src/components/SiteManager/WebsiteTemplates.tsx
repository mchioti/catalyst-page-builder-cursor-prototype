/**
 * Website Templates View
 * Shows templates relevant to this website with divergence tracking
 */

import { useState } from 'react'
import { Search } from 'lucide-react'
import { TemplateRow } from './TemplateRow'

type TemplateCategory = 'website' | 'publication' | 'supporting' | 'global' | 'section'
type ContentType = 'journals' | 'books' | 'proceedings' | 'blogs' | 'news' | 'general'

type Template = {
  id: string
  name: string
  description: string
  category: TemplateCategory
  contentType?: ContentType
  inheritsFrom: string
  modifications: number
  createdAt: Date
  updatedAt: Date
  createdBy: string
  usageCount: number
  tags: string[]
  status: 'active' | 'draft' | 'archived'
}

interface WebsiteTemplatesProps {
  websiteId: string
  websiteName: string
  enabledContentTypes: ContentType[] // What content types this website publishes
  hasSubjectOrganization: boolean // Whether this website has subject-based organization enabled
  allTemplates: Template[] // All available templates from the theme
  usePageStore?: any // Zustand store for divergence tracking
  consoleMode?: 'single' | 'multi' // Console mode for showing/hiding promote button
  selectionMode?: boolean // Enable checkbox selection for templates
  selectedTemplates?: Set<string> // Currently selected template IDs
  onToggleTemplateSelection?: (templateId: string) => void // Toggle selection callback
}

export function WebsiteTemplates({
  websiteId,
  websiteName,
  enabledContentTypes,
  hasSubjectOrganization,
  allTemplates,
  usePageStore,
  consoleMode = 'multi', // Default to multi for backwards compatibility
  selectionMode = false,
  selectedTemplates = new Set(),
  onToggleTemplateSelection
}: WebsiteTemplatesProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())

  // Filter templates to only show those relevant to this website's content types and settings
  // NOTE: ONLY show Publication Page Templates - exclude Starter Pages (website/supporting) and Sections (global/section)
  const relevantTemplates = allTemplates.filter(template => {
    // ONLY show Publication Page Templates - exclude everything else
    if (template.category !== 'publication') {
      return false
    }
    
    // Filter out Subject Browse template if subject organization is not enabled
    if (template.id === 'subject-browse-taxonomy' && !hasSubjectOrganization) {
      return false
    }
    
    // Always include 'general' templates (like global sections)
    if (!template.contentType || template.contentType === 'general') {
      return true
    }
    // Include templates matching enabled content types
    return enabledContentTypes.includes(template.contentType)
  })

  // Filter by search term only (no category filtering needed - we show all template types together)
  const filteredTemplates = relevantTemplates.filter(template => {
    if (!searchTerm) return true
    
    const searchLower = searchTerm.toLowerCase()
    return (
      template.name.toLowerCase().includes(searchLower) ||
      template.description.toLowerCase().includes(searchLower) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchLower))
    )
  })

  // Helper function to determine indentation level based on inheritance (ID-based)
  const getIndentationLevel = (template: Template): number => {
    // Root template (no parent)
    if (!template.inheritsFrom) {
      return 0
    }
    
    // Find parent by ID
    const parentTemplate = allTemplates.find(t => t.id === template.inheritsFrom)
    
    if (!parentTemplate) {
      // Legacy fallback for label-based inheritance (if any remain)
      const parentByName = allTemplates.find(t => t.name === template.inheritsFrom)
      if (parentByName) {
        return getIndentationLevel(parentByName) + 1
      }
      return 0 // Safety fallback
    }
    
    // Recursive: parent's level + 1
    return getIndentationLevel(parentTemplate) + 1
  }

  // Check if template is a group header (intermediate category template)
  const isGroupHeader = (template: Template): boolean => {
    const groupIds = ['journal-pages', 'book-pages', 'conference-pages', 'blog-pages', 'news-pages']
    return groupIds.includes(template.id)
  }

  // Get children of a template
  const getChildren = (parentId: string): Template[] => {
    return allTemplates.filter(t => t.inheritsFrom === parentId)
  }

  // Toggle group expansion
  const toggleGroup = (templateId: string) => {
    setCollapsedGroups(prev => {
      const newSet = new Set(prev)
      if (newSet.has(templateId)) {
        newSet.delete(templateId)
      } else {
        newSet.add(templateId)
      }
      return newSet
    })
  }

  // Check if template should be visible (based on parent collapse state)
  const isTemplateVisible = (template: Template): boolean => {
    if (!template.inheritsFrom) return true
    
    // Check if parent is collapsed
    const parent = allTemplates.find(t => t.id === template.inheritsFrom)
    if (parent && isGroupHeader(parent) && collapsedGroups.has(parent.id)) {
      return false
    }
    
    // Recursively check all ancestors
    if (parent) {
      return isTemplateVisible(parent)
    }
    
    return true
  }

  // Render templates in tree order (parent followed immediately by children)
  const renderTemplatesInOrder = (templates: Template[]): Template[] => {
    const result: Template[] = []
    const processed = new Set<string>()
    
    const processTemplate = (template: Template) => {
      if (processed.has(template.id)) return
      processed.add(template.id)
      
      result.push(template)
      
      // If this is a group header and not collapsed, add its children immediately after
      if (isGroupHeader(template) && !collapsedGroups.has(template.id)) {
        const children = templates.filter(t => t.inheritsFrom === template.id)
        children.forEach(child => processTemplate(child))
      }
    }
    
    // Only process top-level templates and group headers
    // Children of group headers will be processed recursively when their parent is processed
    templates.forEach(template => {
      // Skip if already processed
      if (processed.has(template.id)) return
      
      const parent = allTemplates.find(t => t.id === template.inheritsFrom)
      
      // Only process if:
      // 1. No parent (root template)
      // 2. Parent is not a group header (regular hierarchical template)
      // 3. This template IS a group header itself
      const isChildOfGroupHeader = parent && isGroupHeader(parent)
      
      if (!isChildOfGroupHeader) {
        processTemplate(template)
      }
      // Skip children of group headers - they'll be processed when parent expands
    })
    
    return result
  }

  const handleEditTemplate = (template: Template) => {
    console.log('Edit template for website:', websiteId, template.id)
    // TODO: Navigate to page builder with website context
  }

  const handlePreviewTemplate = (template: Template) => {
    console.log('Preview template:', template.id)
  }

  const handleDuplicateTemplate = (template: Template) => {
    console.log('Duplicate template:', template.id)
  }

  const handleDeleteTemplate = (template: Template) => {
    console.log('Delete template:', template.id)
  }

  const handlePromoteToTheme = (templateId: string) => {
    const template = allTemplates.find(t => t.id === templateId)
    if (!template) return

    // TODO: Get actual modification count from store
    const affectedWebsitesCount = 2 // Placeholder

    const confirmed = window.confirm(
      `Promote "${template.name}" to Publisher Theme?\n\n` +
      `This will share your modifications with all ${affectedWebsitesCount} websites in your publisher network.\n\n` +
      `Other websites will inherit these changes unless they've been modified or exempted.`
    )

    if (confirmed) {
      console.log('Promoting template to Publisher Theme:', templateId, 'from website:', websiteId)
      // TODO: Implement promotion logic:
      // 1. Copy routeCanvasItems[route] → publisherThemeCanvas[templateId]
      // 2. Update all non-modified/non-exempted websites
      // 3. Show success notification
      alert(`✅ Template "${template.name}" promoted to Publisher Theme!\n\nAll websites will now inherit these modifications.`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6">
        <h2 className="text-2xl font-bold text-gray-900">{websiteName} - Templates</h2>
        <p className="text-gray-600 mt-1">
          Manage templates and track modifications for this website
        </p>
        
        {/* Enabled Content Types */}
        <div className="mt-4 flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Publishing:</span>
          {enabledContentTypes.map(type => (
            <span 
              key={type}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize"
            >
              {type}
            </span>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Templates Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        {filteredTemplates.length === 0 ? (
          <div className="p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search terms.' : 'No templates available for this website.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Template Name
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Modifications
                  </th>
                  <th className="text-right py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {renderTemplatesInOrder(filteredTemplates).map((template) => (
                  <TemplateRow 
                    key={template.id} 
                    template={template}
                    showDivergence={!selectionMode}
                    usePageStore={usePageStore}
                    getIndentationLevel={getIndentationLevel}
                    isGroupHeader={isGroupHeader(template)}
                    isCollapsed={collapsedGroups.has(template.id)}
                    childrenCount={getChildren(template.id).length}
                    onToggleGroup={() => toggleGroup(template.id)}
                    isSelected={selectedTemplates.has(template.id)}
                    onToggleSelect={selectionMode ? onToggleTemplateSelection : undefined}
                    consoleMode={consoleMode}
                    websiteId={websiteId}
                    onPromoteToPublisherTheme={handlePromoteToTheme}
                    handleEditTemplate={handleEditTemplate}
                    handlePreviewTemplate={handlePreviewTemplate}
                    handleDuplicateTemplate={handleDuplicateTemplate}
                    handleDeleteTemplate={handleDeleteTemplate}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

