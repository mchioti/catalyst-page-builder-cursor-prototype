/**
 * Template Row Component
 * Displays a template row with optional expanding customization details
 */

import { useState, Fragment } from 'react'
import { ChevronRight, ChevronDown, ArrowUp } from 'lucide-react'
import { TemplateDivergenceTracker } from './TemplateDivergenceTracker'

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
  version?: string // e.g., "v2.1.3"
  updateAvailable?: boolean // New version available from platform
}

interface TemplateRowProps {
  template: Template
  showDivergence?: boolean // If false, show Content Type instead (theme view)
  usePageStore: any
  getIndentationLevel: (template: Template) => number
  isGroupHeader?: boolean // Is this template a collapsible group header?
  isCollapsed?: boolean // Is this group collapsed?
  childrenCount?: number // Number of children (for group headers)
  onToggleGroup?: () => void // Toggle expand/collapse
  isSelected?: boolean // Is this template selected for bulk update?
  onToggleSelect?: (templateId: string) => void // Toggle selection
  consoleMode?: 'single' | 'multi' // For showing/hiding promote to publisher theme button
  websiteId?: string // Current website ID for promotion context
  onPromoteToPublisherTheme?: (templateId: string) => void // Handler for promoting to publisher theme
  handleEditTemplate: (template: Template) => void
  handlePreviewTemplate: (template: Template) => void
  handleDuplicateTemplate: (template: Template) => void
  handleDeleteTemplate: (template: Template) => void
}

export function TemplateRow({
  template,
  showDivergence = true, // Default to true for backwards compatibility
  usePageStore,
  getIndentationLevel,
  isGroupHeader = false,
  isCollapsed = false,
  childrenCount = 0,
  onToggleGroup,
  isSelected = false,
  onToggleSelect,
  consoleMode,
  websiteId,
  onPromoteToPublisherTheme,
  handleEditTemplate,
  handlePreviewTemplate,
  handleDuplicateTemplate,
  handleDeleteTemplate
}: TemplateRowProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Get customizations for expansion row
  const getCustomizationsForTemplate = usePageStore?.((state: any) => state.getCustomizationsForTemplate)
  const customizations = getCustomizationsForTemplate?.(template.id) || []
  
  // Get global template canvas for promote button visibility
  const globalTemplateCanvas = usePageStore?.((state: any) => state.globalTemplateCanvas) || []

  // Determine if this template can be edited at theme level
  const isLockedAtThemeLevel = !showDivergence && (template.category === 'publication' || template.category === 'website')
  const canDuplicate = !showDivergence && template.category === 'supporting'

  return (
    <Fragment>
      {/* Main Row */}
      <tr className={`${isGroupHeader ? 'bg-gray-50' : 'hover:bg-gray-50'}`}>
        {/* Checkbox Column (Theme view only) */}
        {!showDivergence && (
          <td className="py-4 px-6 w-12">
            {!isGroupHeader && onToggleSelect && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggleSelect(template.id)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            )}
          </td>
        )}
        
        <td className="py-4 px-6">
          <div className="flex items-center">
            <div style={{ marginLeft: `${getIndentationLevel(template) * 20}px` }}>
              <div className="flex items-center">
                {getIndentationLevel(template) > 0 && !isGroupHeader && (
                  <div className="flex items-center mr-3">
                    <div className="w-4 h-px bg-gray-300"></div>
                    <div className="w-2 h-px bg-gray-300 transform rotate-90 -ml-1"></div>
                  </div>
                )}
                <div className="flex items-center">
                  {/* Chevron for group headers */}
                  {isGroupHeader && onToggleGroup && (
                    <button
                      onClick={onToggleGroup}
                      className="mr-2 p-0.5 hover:bg-gray-200 rounded transition-colors"
                      title={isCollapsed ? "Expand group" : "Collapse group"}
                    >
                      {isCollapsed ? (
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-600" />
                      )}
                    </button>
                  )}
                  {/* Category color indicator */}
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    template.category === 'website' ? 'bg-blue-500' :
                    template.category === 'publication' ? 'bg-purple-500' :
                    template.category === 'supporting' ? 'bg-green-500' :
                    'bg-indigo-500'
                  }`}></div>
                  <div>
                    <div className={`text-sm flex items-center gap-2 ${
                      isGroupHeader ? 'font-bold text-gray-900' : 'font-semibold text-gray-900'
                    }`}>
                      {template.name}
                      {isGroupHeader && childrenCount > 0 && (
                        <span className="text-xs font-normal text-gray-500">
                          ({childrenCount})
                        </span>
                      )}
                      {/* Version Label */}
                      {template.version && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                          {template.version}
                        </span>
                      )}
                      {/* Update Available Badge */}
                      {template.updateAvailable && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                          Update Available
                        </span>
                      )}
                      {template.status !== 'active' && (
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                          template.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {template.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </td>
        
        {/* Customizations Column (only in Website view) */}
        {showDivergence && (
          <td className="py-4 px-6 text-sm text-gray-500">
            {usePageStore ? (
              <TemplateDivergenceTracker
                templateId={template.id}
                templateName={template.name}
                templateCategory={template.category}
                usePageStore={usePageStore}
                isExpanded={isExpanded}
                onToggleExpand={() => setIsExpanded(!isExpanded)}
                consoleMode={consoleMode}
                websiteId={websiteId}
                onPromoteToPublisherTheme={onPromoteToPublisherTheme}
              />
            ) : (
              <span className="text-xs text-gray-400">—</span>
            )}
          </td>
        )}
        
        <td className="py-4 px-6 text-sm text-right">
          {!isGroupHeader ? (
            <div className="flex flex-col gap-1 items-end">
              {/* Theme View (showDivergence = false) - Restricted actions */}
              {!showDivergence ? (
                <>
                  {/* Locked templates: Preview only */}
                  {isLockedAtThemeLevel ? (
                    <button 
                      onClick={() => handlePreviewTemplate(template)}
                      className="text-blue-600 hover:text-blue-800 text-xs transition-colors"
                    >
                      Preview
                    </button>
                  ) : (
                    /* Supporting Pages: Can duplicate */
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handlePreviewTemplate(template)}
                        className="text-blue-600 hover:text-blue-800 text-xs transition-colors"
                      >
                        Preview
                      </button>
                      {canDuplicate && (
                        <button 
                          onClick={() => handleDuplicateTemplate(template)}
                          className="text-purple-600 hover:text-purple-800 text-xs transition-colors"
                        >
                          Duplicate
                        </button>
                      )}
                    </div>
                  )}
                </>
              ) : (
                /* Website View (showDivergence = true) - Minimal view for template divergence management */
                <>
                  {/* TODO: Uncomment these when template editing is implemented
                  <button 
                    onClick={() => handleEditTemplate(template)}
                    className="text-blue-600 hover:text-blue-800 text-left transition-colors"
                  >
                    Edit Page Template
                  </button>
                  <div className="flex gap-2 mt-1">
                    <button 
                      onClick={() => handlePreviewTemplate(template)}
                      className="text-green-600 hover:text-green-800 text-xs transition-colors"
                    >
                      Preview
                    </button>
                    <button 
                      onClick={() => handleDuplicateTemplate(template)}
                      className="text-purple-600 hover:text-purple-800 text-xs transition-colors"
                    >
                      Duplicate
                    </button>
                    {template.usageCount === 0 && (
                      <button 
                        onClick={() => handleDeleteTemplate(template)}
                        className="text-red-600 hover:text-red-800 text-xs transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  */}
                  
                  {/* Promote to Publisher Theme button - template level */}
                  {consoleMode === 'multi' && 
                   template.category === 'publication' && 
                   template.id === 'table-of-contents' && // Only TOC template can be promoted (has globalTemplateCanvas)
                   globalTemplateCanvas && 
                   globalTemplateCanvas.length > 0 &&
                   onPromoteToPublisherTheme && (
                    <button
                      onClick={() => onPromoteToPublisherTheme(template.id)}
                      className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded transition-colors border border-purple-200"
                      title="Promote to Publisher Theme"
                    >
                      <ArrowUp className="w-3 h-3" />
                      Promote to Publisher Theme
                    </button>
                  )}
                </>
              )}
            </div>
          ) : (
            <span className="text-gray-400 italic text-xs">Content Type template</span>
          )}
        </td>
      </tr>
      
      {/* Expansion Row - Full Width (only in Website view with divergence) */}
      {showDivergence && isExpanded && customizations.length > 0 && (
        <tr>
          <td colSpan={3} className="px-6 py-4 bg-amber-50 border-t border-amber-200">
            <TemplateDivergenceTracker
              templateId={template.id}
              templateName={template.name}
              templateCategory={template.category}
              usePageStore={usePageStore}
              isExpanded={isExpanded}
              onToggleExpand={() => setIsExpanded(!isExpanded)}
              expandedOnly={true}
              consoleMode={consoleMode}
              websiteId={websiteId}
              onPromoteToPublisherTheme={onPromoteToPublisherTheme}
            />
          </td>
        </tr>
      )}
    </Fragment>
  )
}

