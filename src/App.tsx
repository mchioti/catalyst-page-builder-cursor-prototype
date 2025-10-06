import { useMemo, useState, useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import React from 'react'
import { DndContext, closestCenter, closestCorners, rectIntersection, PointerSensor, useSensor, useSensors, useDroppable, useDraggable } from '@dnd-kit/core'
import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, ChevronDown, Code, Lightbulb, Building2, Info, BookOpen, Settings, X, Plus, Check, Home, Palette, FileText, Globe, Users, Cog, ArrowLeft, Copy, Trash2, Edit, List, AlertTriangle, CheckCircle, XIcon } from 'lucide-react'
import { ThemeEditor } from './components/SiteManager/ThemeEditor'
import { PublicationCards } from './components/SiteManager/PublicationCards'
import { SiteManagerTemplates } from './components/SiteManager/SiteManagerTemplates'
import { create } from 'zustand'
import { LIBRARY_CONFIG, type LibraryItem as SpecItem, type LibraryCategory as SpecCategory } from './library'

// Import specific types and constants from organized directories
import { 
  // Widget types
  type Widget, type WidgetSection, type LayoutArea, type CanvasItem, isSection, 
  type CustomSection, type PublicationCardVariant, type PublicationCardConfig, type ContentBlockLayout,
  type Skin, type WidgetBase, type TextWidget, type ImageWidget, type NavbarWidget, type HTMLWidget, type HeadingWidget, type PublicationListWidget,
  // Template types  
  type TemplateCategory, type TemplateStatus, type Modification, type BaseTemplate, type Website, type Theme,
  // App types
  type AppView, type DesignConsoleView, type EditingContext, type PageState, type Notification, type PageIssue, type NotificationType
} from './types'
import { 
  MOCK_SCHOLARLY_ARTICLES, 
  DEFAULT_PUBLICATION_CARD_CONFIG, 
  PREFAB_SECTIONS, 
  INITIAL_CANVAS_ITEMS 
} from './constants'

// Widget extension types for template modification tracking
type ModifiableWidget = {
  isModified?: boolean
  modificationReason?: string
}

// Notification System Components
function NotificationToast({ notification, onClose }: { notification: Notification; onClose: (id: string) => void }) {
  const getNotificationStyles = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          icon: <CheckCircle className="w-5 h-5 text-green-600" />,
          text: 'text-green-800',
          title: 'text-green-900'
        }
      case 'warning':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-200', 
          icon: <AlertTriangle className="w-5 h-5 text-orange-600" />,
          text: 'text-orange-800',
          title: 'text-orange-900'
        }
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
          text: 'text-red-800', 
          title: 'text-red-900'
        }
      default: // info
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: <Info className="w-5 h-5 text-blue-600" />,
          text: 'text-blue-800',
          title: 'text-blue-900'
        }
    }
  }
  
  const styles = getNotificationStyles(notification.type)
  
  return (
    <div className={`p-4 rounded-lg border ${styles.bg} ${styles.border} shadow-sm`}>
      <div className="flex items-start gap-3">
        {styles.icon}
        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-medium ${styles.title}`}>{notification.title}</h4>
          <p className={`text-sm mt-1 ${styles.text}`}>{notification.message}</p>
        </div>
        <button
          onClick={() => onClose(notification.id)}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

function NotificationContainer() {
  const { notifications, removeNotification } = usePageStore()
  
  if (notifications.length === 0) return null
  
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onClose={removeNotification}
        />
      ))}
    </div>
  )
}

function IssuesSidebar() {
  const { pageIssues, removePageIssue, selectWidget } = usePageStore()
  const [isOpen, setIsOpen] = useState(false)
  
  if (pageIssues.length === 0) return null
  
  const issuesByType = pageIssues.reduce((acc, issue) => {
    if (!acc[issue.type]) acc[issue.type] = []
    acc[issue.type].push(issue)
    return acc
  }, {} as Record<string, PageIssue[]>)
  
  const errorCount = pageIssues.filter(i => i.severity === 'error').length
  const warningCount = pageIssues.filter(i => i.severity === 'warning').length
  
  return (
    <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-40">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-3 rounded-l-lg shadow-lg ${
          errorCount > 0 ? 'bg-red-500 text-white' : 
          warningCount > 0 ? 'bg-orange-500 text-white' : 'bg-gray-500 text-white'
        }`}
      >
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm font-medium">
            {errorCount > 0 && `${errorCount} errors`}
            {errorCount > 0 && warningCount > 0 && ', '}
            {warningCount > 0 && `${warningCount} warnings`}
          </span>
        </div>
      </button>
      
      {isOpen && (
        <div className="absolute right-12 top-0 w-80 bg-white rounded-lg shadow-xl border max-h-96 overflow-y-auto">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="font-medium text-gray-900">Page Issues</h3>
          </div>
          <div className="p-4 space-y-3">
            {Object.entries(issuesByType).map(([type, issues]) => (
              <div key={type}>
                <h4 className="text-sm font-medium text-gray-700 capitalize mb-2">{type}</h4>
                {issues.map((issue) => (
                  <div
                    key={issue.id}
                    className={`p-3 rounded border cursor-pointer hover:bg-gray-50 ${
                      issue.severity === 'error' ? 'border-red-200 bg-red-50' :
                      issue.severity === 'warning' ? 'border-orange-200 bg-orange-50' :
                      'border-blue-200 bg-blue-50'
                    }`}
                    onClick={() => {
                      if (issue.element) {
                        selectWidget(issue.element)
                      }
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{issue.title}</p>
                        <p className="text-xs text-gray-600 mt-1">{issue.description}</p>
                        {issue.suggestions && issue.suggestions.length > 0 && (
                          <ul className="text-xs text-gray-500 mt-2 list-disc list-inside">
                            {issue.suggestions.map((suggestion, idx) => (
                              <li key={idx}>{suggestion}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          removePageIssue(issue.id)
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}









// Publication Card component
function PublicationCard({ article, config }: { article: any, config: PublicationCardConfig }) {
  const getAccessStatusBadge = (accessMode: string) => {
    switch (accessMode) {
      case 'FULL_ACCESS':
        return <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium">FULL ACCESS</span>
      case 'OPEN_ACCESS':
        return <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">OPEN ACCESS</span>
      case 'SUBSCRIPTION_REQUIRED':
        return <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded font-medium">SUBSCRIPTION</span>
      default:
        return null
    }
  }

  const formatAuthors = (authors: any[]) => {
    if (!authors || authors.length === 0) return ''
    if (authors.length === 1) return authors[0].name
    if (authors.length === 2) return `${authors[0].name} and ${authors[1].name}`
    return `${authors[0].name}, et al.`
  }

  const formatPublicationInfo = (article: any) => {
    const parts = []
    if (article.isPartOf?.isPartOf?.isPartOf?.name) {
      parts.push(article.isPartOf.isPartOf.isPartOf.name)
    }
    if (config.showVolumeIssue && article.isPartOf?.isPartOf?.volumeNumber) {
      parts.push(`Vol. ${article.isPartOf.isPartOf.volumeNumber}`)
    }
    if (config.showVolumeIssue && article.isPartOf?.issueNumber) {
      parts.push(`Issue ${article.isPartOf.issueNumber}`)
    }
    if (config.showChapterPages && article.pageStart && article.pageEnd) {
      parts.push(`pp. ${article.pageStart}-${article.pageEnd}`)
    }
    return parts.join(', ')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: '2-digit' 
    })
  }

  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white hover:shadow-md transition-shadow">
      {/* Header with type label and access status */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {config.showContentTypeLabel && article.contentType && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
              {article.contentType}
            </span>
          )}
          {config.showAccessStatus && (
            getAccessStatusBadge(article.accessMode)
          )}
        </div>
      </div>

      {/* Article/Chapter Title */}
      {config.showTitle && (
        <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-tight">
          {article.headline}
        </h3>
      )}
      
      {/* Subtitle */}
      {config.showSubtitle && article.alternativeHeadline && (
        <p className="text-blue-600 text-sm font-medium mb-3">
          {article.alternativeHeadline}
        </p>
      )}

      {/* Authors */}
      {config.showAuthors && article.author && (
        <p className="text-gray-700 text-sm mb-2">
          {formatAuthors(article.author)}
        </p>
      )}

      {/* Publication Information (Journal/Book Title) */}
      {config.showPublicationTitle && (
        <p className="text-gray-600 text-sm mb-3">
          {formatPublicationInfo(article)}
        </p>
      )}

      {/* Publication Date */}
      {config.showPublicationDate && article.datePublished && (
        <p className="text-gray-500 text-sm mb-4">
          Published: {formatDate(article.datePublished)}
        </p>
      )}

      {/* Abstract */}
      {config.showAbstract && article.abstract && (
        <p className="text-gray-700 text-sm mb-4 leading-relaxed">
          {article.abstract.length > 150 ? `${article.abstract.substring(0, 150)}...` : article.abstract}
        </p>
      )}

      {/* Action buttons and DOI */}
      <div className="flex flex-col gap-3">
        {config.showViewDownloadOptions && (
          <div className="flex gap-2">
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Abstract
            </button>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Full Text
            </button>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              PDF
            </button>
          </div>
        )}
        
        {config.showDOI && article.identifier?.value && (
          <a 
            href={article.identifier.value} 
            className="text-blue-500 text-xs hover:text-blue-700 break-all"
            target="_blank" 
            rel="noopener noreferrer"
          >
            {article.identifier.value}
          </a>
        )}
      </div>
    </div>
  )
}

function WidgetRenderer({ 
  widget, 
  dragAttributes, 
  dragListeners, 
  onWidgetClick,
  activeSectionToolbar,
  setActiveSectionToolbar,
  activeWidgetToolbar,
  setActiveWidgetToolbar
}: {
  widget: Widget
  dragAttributes?: any
  dragListeners?: any
  onWidgetClick?: (id: string, e: React.MouseEvent) => void
  activeSectionToolbar?: string | null
  setActiveSectionToolbar?: (value: string | null) => void
  activeWidgetToolbar?: string | null
  setActiveWidgetToolbar?: (value: string | null) => void
}) {
  const canvasItems = usePageStore((s) => s.canvasItems)
  const replaceCanvasItems = usePageStore((s) => s.replaceCanvasItems)
  
  // For standalone widgets, wrap with action toolbar
  const renderWithToolbar = (content: JSX.Element) => {
    if (!dragAttributes || !dragListeners || !onWidgetClick || !setActiveSectionToolbar || !setActiveWidgetToolbar) {
      return content // No toolbar for widgets within sections
    }
    
    return (
      <div 
        onClick={(e) => {
          e.stopPropagation()
          // Close any section toolbar and toggle widget toolbar
          setActiveSectionToolbar?.(null)
          setActiveWidgetToolbar(activeWidgetToolbar === widget.id ? null : widget.id)
          onWidgetClick(widget.id, e)
        }}
        className="cursor-pointer hover:ring-2 hover:ring-blue-300 rounded transition-all relative"
      >
        {/* Standalone Widget Action Toolbar - appears on click */}
        {activeWidgetToolbar === widget.id && (
          <div className="absolute -top-2 -right-2 transition-opacity z-20">
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg shadow-lg px-2 py-1">
              <div 
                {...dragAttributes}
                {...dragListeners}
                className="p-1 text-gray-500 hover:text-gray-700 cursor-grab active:cursor-grabbing rounded hover:bg-gray-100 transition-colors"
                title="Drag to reorder"
              >
                <GripVertical className="w-3 h-3" />
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  // Duplicate standalone widget
                  const { replaceCanvasItems, canvasItems } = usePageStore.getState()
                  const itemIndex = canvasItems.findIndex(canvasItem => canvasItem.id === widget.id)
                  if (itemIndex !== -1) {
                    const duplicatedWidget = { ...widget, id: crypto.randomUUID() }
                    const newCanvasItems = [...canvasItems]
                    newCanvasItems.splice(itemIndex + 1, 0, duplicatedWidget)
                    replaceCanvasItems(newCanvasItems)
                  }
                }}
                className="p-1 text-gray-500 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors"
                title="Duplicate widget"
              >
                <Copy className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onWidgetClick(widget.id, e)
                }}
                className="p-1 text-gray-500 hover:text-purple-600 rounded hover:bg-purple-50 transition-colors"
                title="Properties"
              >
                <Edit className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  const { deleteWidget } = usePageStore.getState()
                  deleteWidget(widget.id)
                }}
                className="p-1 text-gray-500 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                title="Delete widget"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
        {content}
      </div>
    )
  }
  
  switch (widget.type) {
    case 'navbar': {
      const isHeaderNavbar = widget.id === 'header-nav'
      
      if (isHeaderNavbar) {
        // Special styling for header navigation - align right within the header area
      return (
        <SkinWrap skin={widget.skin}>
            <div className="flex items-center justify-end px-6 py-3">
            <nav className="flex gap-6 text-sm">
                {widget.links.map((l, index) => (
                  <a key={`${l.label}-${index}`} className="text-gray-700 hover:text-blue-800 font-medium" href={l.href}>{l.label}</a>
              ))}
            </nav>
          </div>
        </SkinWrap>
      )
      }
      
      return (
        <SkinWrap skin={widget.skin}>
          <div className="flex items-center justify-center px-6 py-3">
            <nav className="flex gap-6 text-sm">
              {widget.links.map((l, index) => (
                <a key={`${l.label}-${index}`} className="text-gray-700 hover:text-blue-800 font-medium" href={l.href}>{l.label}</a>
              ))}
            </nav>
          </div>
        </SkinWrap>
      )
    }
    case 'heading': {
      const headingWidget = widget as HeadingWidget
      const align = headingWidget.align ?? 'left'
      const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left'
      
      const HeadingComponent = ({ children, ...props }: any) => {
        switch (headingWidget.level) {
          case 1: return <h1 {...props}>{children}</h1>
          case 2: return <h2 {...props}>{children}</h2>
          case 3: return <h3 {...props}>{children}</h3>
          case 4: return <h4 {...props}>{children}</h4>
          case 5: return <h5 {...props}>{children}</h5>
          case 6: return <h6 {...props}>{children}</h6>
          default: return <h2 {...props}>{children}</h2>
        }
      }
      
      return (
        <SkinWrap skin={widget.skin}>
          <div className={`px-6 py-4 ${alignClass}`}>
            <HeadingComponent
              className={`font-bold text-gray-900 ${
                headingWidget.level === 1 ? 'text-3xl' :
                headingWidget.level === 2 ? 'text-2xl' :
                headingWidget.level === 3 ? 'text-xl' :
                headingWidget.level === 4 ? 'text-lg' :
                headingWidget.level === 5 ? 'text-base' :
                'text-sm'
              }`}
              contentEditable={true}
              suppressContentEditableWarning={true}
              onBlur={(e: React.FocusEvent<HTMLHeadingElement>) => {
                const newText = e.currentTarget.textContent || ''
                if (newText !== headingWidget.text) {
                  const updatedCanvasItems = canvasItems.map(item => {
                    if (isSection(item)) {
                      return {
                        ...item,
                        areas: item.areas.map(area => ({
                          ...area,
                          widgets: area.widgets.map(w => 
                            w.id === widget.id ? { ...w, text: newText } : w
                          )
                        }))
                      }
                    } else {
                      return item.id === widget.id ? { ...item, text: newText } : item
                    }
                  })
                  replaceCanvasItems(updatedCanvasItems as CanvasItem[])
                }
              }}
            >
              {headingWidget.text}
            </HeadingComponent>
          </div>
        </SkinWrap>
      )
    }
    
    case 'text': {
      const align = widget.align ?? 'left'
      const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left'
      const isWileyLogo = widget.id === 'wiley-logo'
      const isHeroText = widget.id === 'hero-text'
      const isFooterText = widget.id === 'footer-text'
      const isFeatureText = widget.sectionId === 'features-section'
      
      if (isWileyLogo) {
        // Special styling for Wiley logo - styled text widget with theme colors
        return (
          <SkinWrap skin={widget.skin}>
            <div className="flex items-center px-6 py-4">
              <h1 style={{
                fontSize: `calc(var(--theme-base-size, 16px) * 1.25)`,
                fontFamily: 'var(--theme-heading-font, Inter, sans-serif)',
                color: 'var(--theme-color-primary, #1e40af)',
                fontWeight: 'bold'
              }}>
                {widget.text || 'Wiley'}
              </h1>
            </div>
          </SkinWrap>
        )
      }
      
      if (isHeroText) {
        // Special styling for hero text - large title with theme-aware colors
        const lines = widget.text.split('\n').filter(line => line.trim())
        const title = lines[0] || 'Wiley Online Library'
        const subtitle = lines.slice(1).join(' ') || 'The world\'s research at your fingertips'
        
        return (
          <SkinWrap skin={widget.skin}>
            <div className="relative">
              <div 
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(to right, var(--theme-color-primary, #1e40af), var(--theme-color-accent, #0ea5e9))`
                }}
              ></div>
              <div className="relative px-6 py-12 text-center">
                <h1 style={{
                  fontSize: `calc(var(--theme-base-size, 16px) * ${Math.pow(1.2, 3)})`,
                  fontFamily: 'var(--theme-heading-font, Inter, sans-serif)',
                  color: 'white',
                  fontWeight: 'bold',
                  marginBottom: '1rem'
                }}>
                  {title}
                </h1>
                <p style={{
                  fontSize: `calc(var(--theme-base-size, 16px) * 1.25)`,
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontFamily: 'var(--theme-body-font, Inter, sans-serif)'
                }}>
                  {subtitle}
                </p>
              </div>
            </div>
          </SkinWrap>
        )
      }
      
      if (isFooterText) {
        // Special styling for footer text - white background like original footer
        return (
          <SkinWrap skin={widget.skin}>
            <div className="bg-white px-6 py-6 border-t border-gray-200">
              <div className={`text-gray-600 ${alignClass}`}>
                {widget.text}
              </div>
            </div>
          </SkinWrap>
        )
      }
      
      if (isFeatureText) {
        // Special styling for feature cards - title and description with theme colors
        const lines = widget.text.split('\n').filter(line => line.trim())
        const title = lines[0] || ''
        const description = lines.slice(1).join(' ') || ''
        
        return (
          <SkinWrap skin={widget.skin}>
            <div 
              className="p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center"
              style={{ backgroundColor: 'var(--theme-color-background, white)' }}
            >
              <h3 style={{
                fontSize: `calc(var(--theme-base-size, 16px) * 1.125)`,
                fontFamily: 'var(--theme-heading-font, Inter, sans-serif)',
                color: 'var(--theme-color-primary, #1e40af)',
                fontWeight: '600',
                marginBottom: '0.75rem'
              }}>
                {title}
              </h3>
              {description && (
                <p style={{
                  color: 'var(--theme-color-muted, #6B7280)',
                  fontSize: `calc(var(--theme-base-size, 16px) * 0.875)`,
                  fontFamily: 'var(--theme-body-font, Inter, sans-serif)',
                  lineHeight: '1.6'
                }}>
                  {description}
                </p>
              )}
            </div>
          </SkinWrap>
        )
      }
      
      return (
        <SkinWrap skin={widget.skin}>
          <div className={`px-6 py-4 ${alignClass}`}>
            <p style={{ 
              color: 'var(--theme-color-text, #374151)',
              fontFamily: 'var(--theme-body-font, Inter, sans-serif)',
              fontSize: 'var(--theme-base-size, 16px)'
            }}>
              {widget.text}
            </p>
          </div>
        </SkinWrap>
      )
    }
    case 'image':
      return (
        <SkinWrap skin={widget.skin}>
          <div className="p-4">
            <img 
              src={widget.src} 
              alt={widget.alt}
              className="w-full rounded"
              style={{ 
                aspectRatio: widget.ratio || 'auto',
                objectFit: 'cover',
                height: widget.ratio === '16:9' ? '300px' : 'auto'
              }}
            />
          </div>
        </SkinWrap>
      )
    case 'html':
      return (
        <>
          {widget.htmlContent ? (
            <iframe
              srcDoc={`
                <style>
                  body { margin: 0; padding: 0; font-family: system-ui, sans-serif; }
                  * { box-sizing: border-box; }
                </style>
                ${widget.htmlContent}
              `}
              className="w-full border-0 block"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-pointer-lock allow-modals"
              title="HTML Widget Content"
              style={{ 
                height: 'auto', 
                minHeight: '200px', 
                width: '100%',
                display: 'block',
                margin: 0,
                padding: 0
              }}
              onLoad={(e) => {
                // Simplified auto-resize to avoid state conflicts
                const iframe = e.target as HTMLIFrameElement;
                try {
                  setTimeout(() => {
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                    if (iframeDoc && iframeDoc.body) {
                      const height = Math.max(iframeDoc.body.scrollHeight, 300);
                      iframe.style.height = height + 'px';
                    }
                  }, 200);
                } catch (err) {
                  iframe.style.height = '400px';
                }
              }}
            />
          ) : (
            // When no content, show placeholder with banner in SkinWrap
        <SkinWrap skin={widget.skin}>
              <div className="px-6 py-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">HTML Widget</span>
                </div>
                <div className="w-full min-h-[200px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                  <div className="text-center text-gray-600 px-4">
                    <div className="text-sm">
                      Select this widget and use the properties panel to upload your HTML file.
                    </div>
                  </div>
                </div>
          </div>
        </SkinWrap>
          )}
        </>
      )
      
    case 'publication-list':
      const publicationWidget = widget as PublicationListWidget
      const displayedPublications = publicationWidget.maxItems 
        ? publicationWidget.publications.slice(0, publicationWidget.maxItems)
        : publicationWidget.publications

      return (
        <SkinWrap skin={widget.skin}>
          <div className="space-y-6">
            {/* Publication list */}
            <div className={`${
              publicationWidget.layout === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 gap-6' 
                : 'space-y-6'
            }`}>
              {displayedPublications.map((article: any, index: number) => (
                <PublicationCard
                  key={`${widget.id}-${index}`}
                  article={article}
                  config={publicationWidget.cardConfig}
                />
              ))}
            </div>

            {/* Show more indicator if there are more articles */}
            {publicationWidget.maxItems && publicationWidget.publications.length > publicationWidget.maxItems && (
              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Showing {publicationWidget.maxItems} of {publicationWidget.publications.length} publications
                </p>
              </div>
            )}
          </div>
        </SkinWrap>
      )
      
    default:
      return (
        <SkinWrap skin={(widget as WidgetBase).skin}>
          <div className="p-4 text-gray-500 text-center">
            {(widget as WidgetBase).type} widget (not implemented)
          </div>
        </SkinWrap>
      )
  }
}

// Helper function to build widgets from library items
function buildWidget(item: SpecItem): Widget {
  const baseWidget = {
    id: crypto.randomUUID(),
    skin: (item.skin as Skin) || 'minimal'
  };

  switch (item.type) {
    case 'text':
      return {
        ...baseWidget,
        type: 'text',
        text: 'Sample text content',
        align: 'left'
      } as TextWidget;
    
    case 'heading':
      return {
        ...baseWidget,
        type: 'heading',
        text: 'Your Heading Text',
        level: 2,
        align: 'left'
      } as HeadingWidget;
    
    case 'image':
      return {
        ...baseWidget,
        type: 'image',
        src: 'https://via.placeholder.com/400x200',
        alt: 'Sample image',
        ratio: '16:9'
      } as ImageWidget;
    
    case 'navbar':
      return {
        ...baseWidget,
        type: 'navbar',
        links: [
          { label: 'Home', href: '#' },
          { label: 'About', href: '#' },
          { label: 'Contact', href: '#' }
        ]
      } as NavbarWidget;
    
    case 'html-block':
      return {
        ...baseWidget,
        type: 'html',
        title: 'HTML Widget',
        htmlContent: ''
      } as HTMLWidget;
    
    case 'publication-list':
      return {
        ...baseWidget,
        type: 'publication-list',
        contentSource: 'dynamic-query',
        publications: MOCK_SCHOLARLY_ARTICLES,
        cardConfig: DEFAULT_PUBLICATION_CARD_CONFIG,
        cardVariantId: 'compact-variant',
        layout: 'list',
        maxItems: 6
      } as PublicationListWidget;
    
    
    default:
      // Fallback to text widget
      return {
        ...baseWidget,
        type: 'text',
        text: `${item.label} widget (not implemented)`,
        align: 'left'
      } as TextWidget;
  }
}

const usePageStore = create<PageState>((set, get) => ({
  // Routing  
  currentView: 'page-builder',
  siteManagerView: 'overview',
  editingContext: 'page', // 'template' | 'page' | 'website'
  currentWebsiteId: 'wiley-main', // Track which website is currently being edited
  setCurrentView: (view) => set({ currentView: view }),
  setSiteManagerView: (view) => set({ siteManagerView: view }),
  setEditingContext: (context) => set({ editingContext: context }),
  setCurrentWebsiteId: (websiteId) => set({ currentWebsiteId: websiteId }),
  
  // Notifications & Issues
  notifications: [],
  pageIssues: [],
  addNotification: (notification) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: new Date()
    }
    set((state) => ({ 
      notifications: [...state.notifications, newNotification] 
    }))
    
    // Auto-close notification if specified
    if (notification.autoClose !== false) {
      const delay = notification.closeAfter || (notification.type === 'error' ? 5000 : 3000)
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id)
        }))
      }, delay)
    }
  },
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),
  clearNotifications: () => set({ notifications: [] }),
  addPageIssue: (issue) => {
    const id = `issue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newIssue: PageIssue = { ...issue, id }
    set((state) => ({ 
      pageIssues: [...state.pageIssues.filter(i => i.element !== issue.element || i.type !== issue.type), newIssue] 
    }))
  },
  removePageIssue: (id) => set((state) => ({
    pageIssues: state.pageIssues.filter(i => i.id !== id)
  })),
  clearPageIssues: () => set({ pageIssues: [] }),
  
  // Page Builder
  canvasItems: INITIAL_CANVAS_ITEMS,
  customSections: [],
  // Template System Data
  // Templates are now organized within themes instead of standalone
  templates: [],
  
  websites: [
    {
      id: 'wiley-main',
      name: 'Wiley Online Library',
      domain: 'https://onlinelibrary.wiley.com/',
      themeId: 'modernist-theme',
      status: 'active' as const,
      createdAt: new Date('2024-06-01'),
      updatedAt: new Date('2024-09-15'),
      modifications: [
        {
          path: 'branding.logo.src',
          originalValue: '/default-logo.svg',
          modifiedValue: '/wiley-logo.svg',
          modifiedAt: 'website',
          modifiedBy: 'admin',
          timestamp: new Date('2024-06-01'),
          reason: 'Brand consistency'
        },
        {
          path: 'colors.primary',
          originalValue: '#1e40af',
          modifiedValue: '#0066cc',
          modifiedAt: 'website',
          modifiedBy: 'admin',
          timestamp: new Date('2024-06-15'),
          reason: 'Match brand guidelines'
        }
      ],
      customSections: [],
      branding: {
        primaryColor: '#0066cc',
        secondaryColor: '#f8f9fa',
        logoUrl: '/wiley-logo.svg',
        fontFamily: 'Inter'
      },
      purpose: {
        contentTypes: ['journals', 'books'],
        hasSubjectOrganization: true,
        publishingTypes: ['academic', 'research']
      },
      deviationScore: 15,
      lastThemeSync: new Date('2024-08-01')
    },
    {
      id: 'research-hub',
      name: 'Wiley Research Hub',
      domain: 'research.wiley.com',
      themeId: 'classicist-theme',
      status: 'active' as const,
      createdAt: new Date('2024-07-10'),
      updatedAt: new Date('2024-09-20'),
      modifications: [
        {
          path: 'layout.sidebar',
          originalValue: 'left',
          modifiedValue: 'right',
          modifiedAt: 'website',
          modifiedBy: 'editor',
          timestamp: new Date('2024-07-20'),
          reason: 'Better UX for research content'
        }
      ],
      customSections: [],
      branding: {
        primaryColor: '#7c3aed',
        logoUrl: '/research-logo.svg'
      },
      purpose: {
        contentTypes: ['journals'],
        hasSubjectOrganization: false,
        publishingTypes: ['research']
      },
      deviationScore: 8,
      lastThemeSync: new Date('2024-09-01')
    },
    {
      id: 'journal-of-science',
      name: 'Journal of Advanced Science',
      domain: 'advancedscience.wiley.com',
      themeId: 'modernist-theme',
      status: 'active' as const,
      createdAt: new Date('2024-08-15'),
      updatedAt: new Date('2024-09-25'),
      modifications: [
        {
          path: 'colors.accent',
          originalValue: '#10b981',
          modifiedValue: '#dc2626',
          modifiedAt: 'website',
          modifiedBy: 'editorial-team',
          timestamp: new Date('2024-08-20'),
          reason: 'Match journal brand colors'
        },
        {
          path: 'layout.hero.showFeaturedArticle',
          originalValue: 'false',
          modifiedValue: 'true',
          modifiedAt: 'website',
          modifiedBy: 'editorial-team',
          timestamp: new Date('2024-08-25'),
          reason: 'Highlight latest research'
        }
      ],
      customSections: [],
      branding: {
        primaryColor: '#dc2626',
        secondaryColor: '#f3f4f6',
        logoUrl: '/jas-logo.svg',
        fontFamily: 'Source Serif Pro'
      },
      purpose: {
        contentTypes: ['journals', 'conferences'],
        hasSubjectOrganization: true,
        publishingTypes: ['scientific', 'peer-reviewed']
      },
      deviationScore: 22,
      lastThemeSync: new Date('2024-09-10')
    }
  ] as Website[],
  
  themes: [
    {
      id: 'modernist-theme',
      name: 'Modern',
      description: 'Clean, minimalist, digital-first design with sans-serif fonts, generous white space, and vibrant accents. Perfect for modern open-access journals and tech-focused publishers.',
      version: '3.0.0',
      publishingType: 'journals' as const,
      author: 'Catalyst Design Team',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-12-22'),
      
      // Complete template package for academic publishing
      templates: [
        {
          id: 'journal-home',
          name: 'Journal Home',
          description: 'Homepage template for individual journals with issue listings and journal information',
          category: 'publication' as TemplateCategory,
          status: 'active' as TemplateStatus,
          version: '1.8.0',
          author: 'Wiley Publishing Team',
          createdAt: new Date('2024-02-10'),
          updatedAt: new Date('2024-09-01'),
          tags: ['journal', 'homepage', 'issues', 'metadata'],
          sections: [],
          layout: {
            header: true,
            footer: true,
            sidebar: 'right',
            maxWidth: '1200px',
            spacing: 'comfortable'
          },
          allowedModifications: ['branding.logo', 'colors.primary'],
          lockedElements: ['structure.main', 'navigation.primary'],
          defaultModificationScope: 'Publication (this or all journals)',
          broadenModificationOptions: ['Website (this or all websites that inherit the same theme)'],
          narrowModificationOptions: ['Publication (this or all journals)', 'Topic (all topics or specific)']
        },
        {
          id: 'article-page',
          name: 'Article Page',
          description: 'Individual article display template with full content, metadata, and related articles',
          category: 'publication' as TemplateCategory,
          status: 'active' as TemplateStatus,
          version: '1.9.0',
          author: 'Wiley Publishing Team',
          createdAt: new Date('2024-03-15'),
          updatedAt: new Date('2024-09-18'),
          tags: ['article', 'content', 'metadata', 'related'],
          sections: [],
          layout: {
            header: true,
            footer: true,
            sidebar: 'right',
            maxWidth: '1000px',
            spacing: 'comfortable'
          },
          allowedModifications: ['typography.bodyFont'],
          lockedElements: ['compliance.*', 'structure.*'],
          defaultModificationScope: 'Publication (this or all journals)',
          broadenModificationOptions: ['Website (this or all websites that inherit the same theme)'],
          narrowModificationOptions: ['Publication (this or all journals)', 'Group type (Current, Ahead of Print, Just Accepted)', 'Topic (all topics or specific)']
        },
        {
          id: 'search-results',
          name: 'Search Results',
          description: 'Template for displaying search results with filters and pagination',
          category: 'website' as TemplateCategory,
          status: 'active' as TemplateStatus,
          version: '1.3.0',
          author: 'Wiley Design Team',
          createdAt: new Date('2024-02-15'),
          updatedAt: new Date('2024-08-20'),
          tags: ['search', 'results', 'filters', 'pagination'],
          sections: [],
          layout: {
            header: true,
            footer: true,
            sidebar: 'left',
            maxWidth: '1400px',
            spacing: 'comfortable'
          },
          allowedModifications: [],
          lockedElements: [],
          defaultModificationScope: 'Website (this)',
          broadenModificationOptions: ['Website (this or all websites that inherit the same theme)'],
          narrowModificationOptions: []
        }
      ],
      
      colors: {
        primary: '#2563eb',    // Modern vibrant blue
        secondary: '#64748b',  // Clean slate gray
        accent: '#06b6d4',     // Bright cyan accent
        background: '#ffffff', // Pure white for maximum contrast
        text: '#0f172a',       // Deep slate for readability
        muted: '#94a3b8'       // Light slate for secondary text
      },
      typography: {
        headingFont: 'Inter, sans-serif',           // Modern geometric sans-serif
        bodyFont: 'Inter, sans-serif',             // Consistent modern typography
        baseSize: '17px',                          // Slightly larger for digital reading
        scale: 1.333                               // Perfect fourth for clean hierarchy
      },
      spacing: {
        base: '1rem',
        scale: 1.5
      },
      components: {
        button: {
          borderRadius: '4px',
          fontWeight: '500',
          transition: 'all 0.2s'
        },
        card: {
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        },
        form: {
          borderRadius: '4px',
          border: '1px solid #d1d5db',
          focusColor: '#0066cc'
        }
      },
      globalSections: {
        header: PREFAB_SECTIONS['header-section'],
        footer: PREFAB_SECTIONS['footer-section']
      },
      publicationCardVariants: []
    },
    
    {
      id: 'classicist-theme',
      name: 'Classic',
      description: 'Traditional, scholarly theme inspired by classic academic journals. Features serif fonts, formal color palette, and dense, text-forward layout. Perfect for established university presses and historical societies.',
      version: '2.1.0',
      publishingType: 'academic' as const,
      author: 'Catalyst Design Team',
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-09-10'),
      
      // Corporate template package
      templates: [
        {
          id: 'global-home',
          name: 'Global Home',
          description: 'Main homepage template with hero section, featured content, and navigation',
          category: 'website' as TemplateCategory,
          status: 'active' as TemplateStatus,
          version: '1.5.0',
          author: 'Wiley Design Team',
          createdAt: new Date('2024-02-01'),
          updatedAt: new Date('2024-09-10'),
          tags: ['homepage', 'global', 'hero', 'featured'],
          sections: [],
          layout: {
            header: true,
            footer: true,
            sidebar: 'none',
            maxWidth: '1200px',
            spacing: 'comfortable'
          },
          allowedModifications: ['branding.*', 'sections.hero.*'],
          lockedElements: ['navigation.structure'],
          defaultModificationScope: 'Website (this)',
          broadenModificationOptions: ['Website (this or all websites that inherit the same theme)'],
          narrowModificationOptions: []
        },
        {
          id: 'about-us',
          name: 'About Us',
          description: 'About page template with company information, team, and mission statement',
          category: 'supporting' as TemplateCategory,
          status: 'active' as TemplateStatus,
          version: '1.1.0',
          author: 'Wiley Design Team',
          createdAt: new Date('2024-03-05'),
          updatedAt: new Date('2024-06-20'),
          tags: ['about', 'company', 'team', 'mission'],
          sections: [],
          layout: {
            header: true,
            footer: true,
            sidebar: 'none',
            maxWidth: '1000px',
            spacing: 'spacious'
          },
          allowedModifications: ['content.*'],
          lockedElements: [],
          defaultModificationScope: 'Website (this)',
          broadenModificationOptions: ['Website (this or all websites that inherit the same theme)'],
          narrowModificationOptions: []
        },
        {
          id: 'contact-us',
          name: 'Contact Us',
          description: 'Contact page template with contact forms, office locations, and contact information',
          category: 'supporting' as TemplateCategory,
          status: 'active' as TemplateStatus,
          version: '1.3.0',
          author: 'Wiley Design Team',
          createdAt: new Date('2024-02-20'),
          updatedAt: new Date('2024-07-10'),
          tags: ['contact', 'forms', 'locations', 'information'],
          sections: [],
          layout: {
            header: true,
            footer: true,
            sidebar: 'none',
            maxWidth: '800px',
            spacing: 'comfortable'
          },
          allowedModifications: ['contact.*'],
          lockedElements: [],
          defaultModificationScope: 'Website (this)',
          broadenModificationOptions: ['Website (this or all websites that inherit the same theme)'],
          narrowModificationOptions: []
        }
      ],
      
      colors: {
        primary: '#7c2d12',    // Deep brown for scholarly gravitas
        secondary: '#f7f3f0',  // Warm off-white parchment
        accent: '#b45309',     // Burnt orange for highlights
        background: '#fefcfb', // Subtle warm white
        text: '#1c1917',       // Rich dark brown for text
        muted: '#78716c'       // Warm gray for secondary text
      },
      typography: {
        headingFont: 'Crimson Text, serif',       // Classic scholarly serif
        bodyFont: 'Crimson Text, serif',         // Consistent serif typography
        baseSize: '16px',                        // Traditional reading size
        scale: 1.25                              // Classic ratio for hierarchy
      },
      spacing: {
        base: '1rem',
        scale: 1.25
      },
      components: {
        button: {
          borderRadius: '6px',
          fontWeight: '600'
        },
        card: {
          borderRadius: '12px',
          border: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        },
        form: {
          borderRadius: '6px',
          border: '2px solid #e2e8f0'
        }
      },
      globalSections: {
        header: PREFAB_SECTIONS['header-section'],
        footer: PREFAB_SECTIONS['footer-section']
      },
      publicationCardVariants: []
    },
    
    {
      id: 'curator-theme',
      name: 'Curator',
      description: 'Visually rich, image-forward theme perfect for publishers of art books, magazines, and image-heavy journals. Prioritizes large hero images, masonry grids, and elegant typography that complements visuals.',
      version: '1.0.0',
      publishingType: 'visual' as const,
      author: 'Catalyst Design Team',
      createdAt: new Date('2024-12-22'),
      updatedAt: new Date('2024-12-22'),
      
      // Visual-focused template package
      templates: [
        {
          id: 'gallery-home',
          name: 'Gallery Home',
          description: 'Visual homepage with large hero images and masonry content grid',
          category: 'website' as TemplateCategory,
          status: 'active' as TemplateStatus,
          version: '1.0.0',
          author: 'Catalyst Design Team',
          createdAt: new Date('2024-12-22'),
          updatedAt: new Date('2024-12-22'),
          tags: ['gallery', 'visual', 'hero', 'masonry'],
          sections: [],
          layout: {
            header: true,
            footer: true,
            sidebar: 'none',
            maxWidth: '1600px',
            spacing: 'generous'
          },
          allowedModifications: ['hero.*', 'gallery.*', 'colors.*'],
          lockedElements: ['structure.masonry'],
          defaultModificationScope: 'Publication (this)',
          broadenModificationOptions: ['Website (this or all websites that inherit the same theme)'],
          narrowModificationOptions: []
        }
      ],
      
      colors: {
        primary: '#18181b',    // Rich charcoal for sophistication
        secondary: '#f8fafc',  // Pure light gray for contrast
        accent: '#ef4444',     // Bold red for visual punctuation
        background: '#ffffff', // Pure white to showcase imagery
        text: '#27272a',       // Dark zinc for readability
        muted: '#71717a'       // Medium zinc for captions and metadata
      },
      typography: {
        headingFont: 'Playfair Display, serif',   // Elegant display serif
        bodyFont: 'Source Sans Pro, sans-serif',  // Clean sans-serif for body
        baseSize: '18px',                         // Larger for visual emphasis
        scale: 1.414                              // √2 ratio for visual harmony
      },
      spacing: {
        base: '1.25rem',
        scale: 1.618                              // Golden ratio for visual appeal
      },
      components: {
        button: {
          borderRadius: '2px',
          fontWeight: '400',
          transition: 'all 0.3s ease'
        },
        card: {
          borderRadius: '0px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          border: 'none'
        },
        form: {
          borderRadius: '0px',
          border: '1px solid #d4d4d8',
          focusColor: '#ef4444'
        }
      },
      globalSections: {
        header: PREFAB_SECTIONS['header-section'],
        footer: PREFAB_SECTIONS['footer-section']
      },
      publicationCardVariants: []
    }
  ] as Theme[],
  
  publicationCardVariants: [
    {
      id: 'compact-variant',
      name: 'Compact',
      description: 'Clean compact view with essential information',
      config: {
        ...DEFAULT_PUBLICATION_CARD_CONFIG,
        showTitle: true,
        showAbstract: false,
        showAffiliations: false,
        showKeywords: false,
        showUsageMetrics: false,
        thumbnailPosition: 'left'
      },
      createdAt: new Date()
    },
    {
      id: 'detailed-variant',
      name: 'Detailed',
      description: 'Comprehensive view with all metadata',
      config: {
        ...DEFAULT_PUBLICATION_CARD_CONFIG,
        showTitle: true,
        showAbstract: true,
        showAffiliations: true,
        showKeywords: true,
        showUsageMetrics: true,
        thumbnailPosition: 'top'
      },
      createdAt: new Date()
    }
  ],
  selectedWidget: null,
  insertPosition: null,
  addWidget: (widget) => set((s) => ({ canvasItems: [...s.canvasItems, widget] })),
  addSection: (section) => set((s) => ({ canvasItems: [...s.canvasItems, section] })),
  moveItem: (fromIndex, toIndex) => set((s) => ({ canvasItems: arrayMove(s.canvasItems, fromIndex, toIndex) })),
  replaceCanvasItems: (items) => set({ canvasItems: items }),
  selectWidget: (id) => set({ selectedWidget: id }),
  deleteWidget: (widgetId) => set((state) => {
    // First try to find and remove standalone widget
    const standaloneIndex = state.canvasItems.findIndex(item => !isSection(item) && item.id === widgetId)
    if (standaloneIndex !== -1) {
      return {
        canvasItems: state.canvasItems.filter((_, index) => index !== standaloneIndex),
        selectedWidget: state.selectedWidget === widgetId ? null : state.selectedWidget
      }
    }
    
    // If not standalone, look in sections
    const updatedCanvasItems = state.canvasItems.map(item => {
      if (isSection(item)) {
        return {
          ...item,
          areas: item.areas.map(area => ({
            ...area,
            widgets: area.widgets.filter(widget => widget.id !== widgetId)
          }))
        }
      }
      return item
    })
    
    return {
      canvasItems: updatedCanvasItems,
      selectedWidget: state.selectedWidget === widgetId ? null : state.selectedWidget
    }
  }),
  addCustomSection: (section) => set((s) => ({ customSections: [...s.customSections, section] })),
  removeCustomSection: (id) => set((s) => ({ customSections: s.customSections.filter(section => section.id !== id) })),
  addPublicationCardVariant: (variant) => set((s) => ({ publicationCardVariants: [...s.publicationCardVariants, variant] })),
  removePublicationCardVariant: (id) => set((s) => ({ publicationCardVariants: s.publicationCardVariants.filter(variant => variant.id !== id) })),
  setInsertPosition: (position) => set({ insertPosition: position }),
  
  // Template Management
  addTemplate: (template) => set((state) => ({
    templates: [...state.templates, template]
  })),
  updateTemplate: (id, template) => set((state) => ({
    templates: state.templates.map(t => t.id === id ? { ...t, ...template, updatedAt: new Date() } : t)
  })),
  removeTemplate: (id) => set((state) => ({
    templates: state.templates.filter(t => t.id !== id)
  })),
  duplicateTemplate: (id) => set((state) => {
    const template = state.templates.find(t => t.id === id)
    if (!template) return state
    const duplicate = {
      ...template,
      id: crypto.randomUUID(),
      name: `${template.name} (Copy)`,
      version: '1.0.0',
      createdAt: new Date(),
      updatedAt: new Date()
    }
    return { templates: [...state.templates, duplicate] }
  }),
  
  // Website Management
  addWebsite: (website) => set((state) => ({
    websites: [...state.websites, website]
  })),
  updateWebsite: (id, website) => set((state) => ({
    websites: state.websites.map(w => w.id === id ? { ...w, ...website, updatedAt: new Date() } : w)
  })),
  removeWebsite: (id) => set((state) => ({
    websites: state.websites.filter(w => w.id !== id)
  })),
  
  // Modification Management
  addModification: (websiteId, modification) => set((state) => ({
    websites: state.websites.map(w => 
      w.id === websiteId 
        ? { ...w, modifications: [...w.modifications, modification], updatedAt: new Date() }
        : w
    )
  })),
  removeModification: (websiteId, modificationPath) => set((state) => ({
    websites: state.websites.map(w => 
      w.id === websiteId 
        ? { ...w, modifications: w.modifications.filter(o => o.path !== modificationPath), updatedAt: new Date() }
        : w
    )
  })),
  
  // Deviation Analysis
  calculateDeviationScore: (websiteId) => {
    const state = get()
    const website = state.websites.find(w => w.id === websiteId)
    if (!website) return 0
    
    const template = state.templates.find(t => t.id === website.templateId)
    if (!template) return 0
    
    // Simple scoring: each modification adds points based on impact
    let score = 0
    website.modifications.forEach(modification => {
      if (template.lockedElements.some(locked => modification.path.startsWith(locked))) {
        score += 20 // High impact for locked elements
      } else if (template.allowedModifications.some(allowed => modification.path.startsWith(allowed))) {
        score += 5 // Low impact for allowed modifications  
      } else {
        score += 10 // Medium impact for other modifications
      }
    })
    
    return Math.min(score, 100) // Cap at 100
  },
  
  // Theme Management
  addTheme: (theme) => set((state) => ({
    themes: [...state.themes, theme]
  })),
  updateTheme: (id, theme) => set((state) => ({
    themes: state.themes.map(t => t.id === id ? { ...t, ...theme } : t)
  })),
  removeTheme: (id) => set((state) => ({
    themes: state.themes.filter(t => t.id !== id)
  })),
  createContentBlockWithLayout: (layout) => {
    const { canvasItems, insertPosition } = get()
    
    // Create new section with layout
    const newSection: WidgetSection = {
      id: crypto.randomUUID(),
      name: 'Section',
      type: 'content-block',
      layout,
      areas: []
    }
    
    // Configure areas based on layout
    switch (layout) {
      case 'one-column':
        newSection.areas = [
          { id: crypto.randomUUID(), name: 'Content', widgets: [] }
        ]
        break
      case 'two-columns':
        newSection.areas = [
          { id: crypto.randomUUID(), name: 'Left Column', widgets: [] },
          { id: crypto.randomUUID(), name: 'Right Column', widgets: [] }
        ]
        break
      case 'three-columns':
        newSection.areas = [
          { id: crypto.randomUUID(), name: 'Left Column', widgets: [] },
          { id: crypto.randomUUID(), name: 'Center Column', widgets: [] },
          { id: crypto.randomUUID(), name: 'Right Column', widgets: [] }
        ]
        break
      case 'one-third-left':
        newSection.areas = [
          { id: crypto.randomUUID(), name: 'Left (1/3)', widgets: [] },
          { id: crypto.randomUUID(), name: 'Right (2/3)', widgets: [] }
        ]
        break
      case 'one-third-right':
        newSection.areas = [
          { id: crypto.randomUUID(), name: 'Left (2/3)', widgets: [] },
          { id: crypto.randomUUID(), name: 'Right (1/3)', widgets: [] }
        ]
        break
      case 'vertical':
        newSection.areas = [
          { id: crypto.randomUUID(), name: 'Top', widgets: [] },
          { id: crypto.randomUUID(), name: 'Bottom', widgets: [] }
        ]
        break
      default:
        newSection.areas = [
          { id: crypto.randomUUID(), name: 'Content', widgets: [] }
        ]
    }
    
    // Insert at appropriate position
    let newCanvasItems = [...canvasItems]
    
    if (insertPosition) {
      const relativeIndex = canvasItems.findIndex(item => item.id === insertPosition.relativeTo)
      if (relativeIndex !== -1) {
        const insertIndex = insertPosition.position === 'above' ? relativeIndex : relativeIndex + 1
        newCanvasItems.splice(insertIndex, 0, newSection)
      } else {
        newCanvasItems.push(newSection)
      }
    } else {
      newCanvasItems.push(newSection)
    }
    
    // Apply changes
    set({ 
      canvasItems: newCanvasItems,
      insertPosition: null,
      selectedWidget: newSection.id
    })
  }
}))

function SkinWrap({ skin, children }: { skin: Skin; children: ReactNode }) {
  const className = useMemo(() => {
    switch (skin) {
      case 'modern':
        return 'rounded-xl border border-gray-200 bg-white shadow-sm'
      case 'classic':
        return 'rounded-md border border-gray-300 bg-white shadow'
      case 'minimal':
        return 'bg-transparent'
      case 'accent':
        return 'rounded-lg border border-blue-200 bg-blue-50 shadow-sm'
      default:
        return 'bg-transparent'
    }
  }, [skin])
  
  return <div className={className}>{children}</div>
}


// Template Creation Wizard Component
function TemplateCreationWizard({ onClose }: { onClose: () => void }) {
  const { addTemplate, canvasItems } = usePageStore()
  const [step, setStep] = useState(1)
  const [templateData, setTemplateData] = useState({
    name: '',
    description: '',
    category: 'website' as TemplateCategory,
    tags: [] as string[],
    allowedModifications: [] as string[],
    lockedElements: [] as string[],
    fromCurrentPage: false,
    includeContent: true
  })
  
  const totalSteps = 4
  
  const handleCreate = () => {
    const newTemplate: BaseTemplate = {
      id: crypto.randomUUID(),
      name: templateData.name,
      description: templateData.description,
      category: templateData.category,
      status: 'draft',
      version: '1.0.0',
      author: 'Current User',
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: templateData.tags,
      sections: templateData.fromCurrentPage ? canvasItems.filter(item => 'layout' in item) : [],
      globalStyles: {
        primaryColor: '#1e40af',
        fontFamily: 'Inter, sans-serif',
        borderRadius: '8px'
      },
      layout: {
        header: true,
        footer: true,
        sidebar: 'none',
        maxWidth: '1200px',
        spacing: 'comfortable'
      },
      allowedModifications: templateData.allowedModifications,
      lockedElements: templateData.lockedElements,
      defaultModificationScope: 'Website (this)',
      broadenModificationOptions: [],
      narrowModificationOptions: []
    }
    
    addTemplate(newTemplate)
    onClose()
  }
  
  const nextStep = () => setStep(Math.min(step + 1, totalSteps))
  const prevStep = () => setStep(Math.max(step - 1, 1))
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Create New Template</h3>
              <p className="text-gray-600 mt-1">Step {step} of {totalSteps}</p>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div key={i} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    i + 1 <= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {i + 1}
                  </div>
                  {i < totalSteps - 1 && (
                    <div className={`h-1 w-16 mx-2 ${
                      i + 1 < step ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex mt-2">
              <div className="text-xs text-gray-600 w-8 text-center">Basic</div>
              <div className="text-xs text-gray-600 w-24 text-center">Source</div>
              <div className="text-xs text-gray-600 w-24 text-center">Rules</div>
              <div className="text-xs text-gray-600 w-24 text-center">Review</div>
            </div>
          </div>
          
          {/* Step Content */}
          <div className="min-h-[400px]">
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Template Name *</label>
                      <input
                        type="text"
                        value={templateData.name}
                        onChange={(e) => setTemplateData({...templateData, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="e.g., Academic Journal Template"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                      <select
                        value={templateData.category}
                        onChange={(e) => setTemplateData({...templateData, category: e.target.value as TemplateCategory})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="theme">Theme</option>
                        <option value="website">Website Pages</option>
                        <option value="publication">Publication Pages</option>
                        <option value="supporting">Supporting Pages</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={templateData.description}
                      onChange={(e) => setTemplateData({...templateData, description: e.target.value})}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Describe the purpose and features of this template..."
                    />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma separated)</label>
                    <input
                      type="text"
                      onChange={(e) => setTemplateData({...templateData, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="e.g., journal, academic, research, publications"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Template Source</h4>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        id="blank"
                        name="source"
                        checked={!templateData.fromCurrentPage}
                        onChange={() => setTemplateData({...templateData, fromCurrentPage: false})}
                        className="w-4 h-4 text-blue-600"
                      />
                      <label htmlFor="blank" className="flex-1">
                        <div className="font-medium text-gray-900">Start from Blank Template</div>
                        <div className="text-sm text-gray-500">Create a new template with standard sections (header, hero, footer)</div>
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        id="current"
                        name="source"
                        checked={templateData.fromCurrentPage}
                        onChange={() => setTemplateData({...templateData, fromCurrentPage: true})}
                        className="w-4 h-4 text-blue-600"
                      />
                      <label htmlFor="current" className="flex-1">
                        <div className="font-medium text-gray-900">Use Current Page as Base</div>
                        <div className="text-sm text-gray-500">Convert the current page design into a reusable template</div>
                        <div className="text-xs text-blue-600 mt-1">{canvasItems.length} sections will be included</div>
                      </label>
                    </div>
                    
                    {templateData.fromCurrentPage && (
                      <div className="ml-7 space-y-3">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id="includeContent"
                            checked={templateData.includeContent}
                            onChange={(e) => setTemplateData({...templateData, includeContent: e.target.checked})}
                            className="w-4 h-4 text-blue-600"
                          />
                          <label htmlFor="includeContent" className="text-sm text-gray-700">
                            Include actual content (recommended: uncheck to create placeholder content)
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Customization Rules</h4>
                  <p className="text-gray-600 mb-6">Define what can be customized when websites use this template</p>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <span className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          Allowed Customizations
                        </span>
                      </label>
                      <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
                        {[
                          'branding.logo',
                          'branding.colors',
                          'typography.headingFont',
                          'typography.bodyFont',
                          'sections.hero.title',
                          'sections.hero.subtitle',
                          'sections.footer.content'
                        ].map((path) => (
                          <label key={path} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={templateData.allowedModifications.includes(path)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setTemplateData({
                                    ...templateData, 
                                    allowedModifications: [...templateData.allowedModifications, path]
                                  })
                                } else {
                                  setTemplateData({
                                    ...templateData, 
                                    allowedModifications: templateData.allowedModifications.filter(p => p !== path)
                                  })
                                }
                              }}
                              className="w-4 h-4 text-green-600"
                            />
                            <span className="text-sm font-mono text-gray-700">{path}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <span className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          Locked Elements
                        </span>
                      </label>
                      <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
                        {[
                          'layout.structure',
                          'navigation.main',
                          'compliance.elements',
                          'structure.main',
                          'navigation.primary',
                          'footer.copyright',
                          'header.navigation'
                        ].map((path) => (
                          <label key={path} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={templateData.lockedElements.includes(path)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setTemplateData({
                                    ...templateData, 
                                    lockedElements: [...templateData.lockedElements, path]
                                  })
                                } else {
                                  setTemplateData({
                                    ...templateData, 
                                    lockedElements: templateData.lockedElements.filter(p => p !== path)
                                  })
                                }
                              }}
                              className="w-4 h-4 text-red-600"
                            />
                            <span className="text-sm font-mono text-gray-700">{path}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h5 className="font-medium text-yellow-800">Customization Rules</h5>
                        <p className="text-sm text-yellow-700 mt-1">
                          <strong>Allowed:</strong> Low-risk customizations (5 points each)<br />
                          <strong>Locked:</strong> High-risk if overridden (20 points each)<br />
                          <strong>Other:</strong> Medium-risk customizations (10 points each)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Review & Create</h4>
                  
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Template Name</label>
                        <p className="font-medium text-gray-900">{templateData.name || 'Untitled Template'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Category</label>
                        <p className="font-medium text-gray-900 capitalize">{templateData.category}</p>
                      </div>
                      <div className="col-span-2">
                        <label className="text-sm font-medium text-gray-500">Description</label>
                        <p className="text-gray-900">{templateData.description || 'No description provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Source</label>
                        <p className="text-gray-900">
                          {templateData.fromCurrentPage ? `Current Page (${canvasItems.length} sections)` : 'Blank Template'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Tags</label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {templateData.tags.map((tag) => (
                            <span key={tag} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                              {tag}
                            </span>
                          ))}
                          {templateData.tags.length === 0 && <span className="text-gray-500 text-sm">No tags</span>}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Allowed Customizations</label>
                        <p className="text-gray-900">{templateData.allowedModifications.length} elements</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Locked Elements</label>
                        <p className="text-gray-900">{templateData.lockedElements.length} elements</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <div className="flex gap-2">
              {step > 1 && (
                <button
                  onClick={prevStep}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Previous
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              {step < totalSteps ? (
                <button
                  onClick={nextStep}
                  disabled={step === 1 && !templateData.name}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleCreate}
                  disabled={!templateData.name}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Template
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Design System Console Websites component  
function SiteManagerWebsites() {
  const { websites, themes, addModification, removeModification, updateWebsite, addWebsite } = usePageStore()
  const [showModificationAnalysis, setShowModificationAnalysis] = useState<string | null>(null)
  const [showCreateWebsite, setShowCreateWebsite] = useState(false)
  
  const getThemeForWebsite = (websiteId: string) => {
    const website = websites.find(w => w.id === websiteId)
    if (!website) return null
    return themes.find(t => t.id === website.themeId)
  }
  
  const getDeviationColor = (score: number) => {
    if (score <= 20) return 'text-green-600 bg-green-50 border-green-200'
    if (score <= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }
  
  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      staging: 'bg-blue-100 text-blue-800', 
      maintenance: 'bg-red-100 text-red-800'
    }
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }
  
  const getModificationImpact = (modification: Modification, theme: Theme | null) => {
    if (!theme) return 'unknown'
    
    // Check against theme's templates to find relevant modifications
    for (const template of theme.templates) {
      if (template.lockedElements.some(locked => modification.path.startsWith(locked))) {
        return 'high' // Locked element modification = high risk
      } else if (template.allowedModifications.some(allowed => modification.path.startsWith(allowed))) {
        return 'low' // Allowed modification = low risk
      }
    }
    return 'medium' // Other modification = medium risk
  }

  const getPublishingAction = (website: Website) => {
    switch(website.status) {
      case 'staging': 
        return { 
          label: 'Publish Live', 
          action: 'publish', 
          color: 'bg-green-600 hover:bg-green-700 text-white',
          icon: '🚀'
        }
      case 'active': 
        return { 
          label: 'Move to Staging', 
          action: 'stage', 
          color: 'bg-blue-600 hover:bg-blue-700 text-white',
          icon: '🧪'
        }
      case 'maintenance': 
        return { 
          label: 'Restore Service', 
          action: 'restore', 
          color: 'bg-green-600 hover:bg-green-700 text-white',
          icon: '🔧'
        }
      default:
        return { 
          label: 'Deploy', 
          action: 'deploy', 
          color: 'bg-blue-600 hover:bg-blue-700 text-white',
          icon: '📦'
        }
    }
  }

  const handlePublishingAction = (websiteId: string, action: string) => {
    const website = websites.find(w => w.id === websiteId)
    if (!website) return

    let newStatus: string
    let actionMessage: string

    switch(action) {
      case 'publish':
        newStatus = 'active'
        actionMessage = `${website.name} has been published live! 🚀`
        break
      case 'stage':
        newStatus = 'staging'
        actionMessage = `${website.name} moved to staging for testing 🧪`
        break
      case 'restore':
        newStatus = 'active'
        actionMessage = `${website.name} service restored ✅`
        break
      case 'deploy':
        newStatus = 'staging'
        actionMessage = `${website.name} deployed to staging 📦`
        break
      default:
        return
    }

    // Update the website status
    updateWebsite(websiteId, { status: newStatus as 'active' | 'staging' | 'maintenance', updatedAt: new Date() })
    
    // Show success message (you could implement a toast notification here)
    alert(actionMessage)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Websites</h2>
          <p className="text-gray-600 mt-1">Manage websites and track template customizations</p>
        </div>
        <button 
          onClick={() => setShowCreateWebsite(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Website
        </button>
      </div>
      
      {/* Websites Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">All Websites</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Website</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Theme</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purpose</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deviation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modifications</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Updated</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Publishing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {websites.map((website) => {
                const theme = getThemeForWebsite(website.id)
                return (
                  <tr key={website.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{website.name}</div>
                        <div className="text-sm text-gray-500">{website.domain}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{theme?.name || 'Unknown'}</div>
                        <div className="text-sm text-gray-500">v{theme?.version} • {theme?.publishingType}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        {website.purpose ? (
                          <>
                            <div className="font-medium text-gray-900">
                              {website.purpose.contentTypes.length > 0 
                                ? website.purpose.contentTypes.map(type => 
                                    type.charAt(0).toUpperCase() + type.slice(1)
                                  ).join(', ')
                                : 'Not specified'
                              }
                            </div>
                            <div className="text-sm text-gray-500">
                              {website.purpose.hasSubjectOrganization ? '• Subject taxonomy enabled' : '• Simple organization'}
                            </div>
                          </>
                        ) : (
                          <div className="text-sm text-gray-400 italic">Legacy setup</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(website.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center px-2 py-1 text-sm rounded-full border ${getDeviationColor(website.deviationScore)}`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${getDeviationColor(website.deviationScore).replace('text-', 'bg-').replace('border-', '').replace('bg-gray-50', '')}`} />
                        {website.deviationScore}%
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-900">{website.modifications.length}</span>
                        {website.modifications.length > 0 && (
                          <button 
                            onClick={() => setShowModificationAnalysis(website.id)}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            View Details
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {website.updatedAt.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {(() => {
                          const publishingAction = getPublishingAction(website)
                          return (
                            <button 
                              onClick={() => handlePublishingAction(website.id, publishingAction.action)}
                              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${publishingAction.color}`}
                            >
                              <span className="mr-1">{publishingAction.icon}</span>
                              {publishingAction.label}
                            </button>
                          )
                        })()}
                        <button 
                          onClick={() => {
                            const { setSiteManagerView } = usePageStore.getState()
                            setSiteManagerView(`${website.id}-settings` as DesignConsoleView)
                          }}
                          className="text-gray-400 hover:text-gray-600"
                          title="Website Settings"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Modification Analysis Modal */}
      {showModificationAnalysis && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Modification Analysis
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {websites.find(w => w.id === showModificationAnalysis)?.name} - Template Customizations
                  </p>
                </div>
                <button 
                  onClick={() => setShowModificationAnalysis(null)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {(() => {
                const website = websites.find(w => w.id === showModificationAnalysis)
                const theme = website ? getThemeForWebsite(website.id) : null
                
                if (!website) return <div>Website not found</div>
                
                const modificationsByImpact = website.modifications.reduce((acc, modification) => {
                  const impact = getModificationImpact(modification, theme)
                  if (!acc[impact]) acc[impact] = []
                  acc[impact].push(modification)
                  return acc
                }, {} as Record<string, Modification[]>)
                
                return (
                  <div className="space-y-6">
                    {/* Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full" />
                          <span className="font-medium text-gray-900">High Risk</span>
                        </div>
                        <p className="text-2xl font-bold text-red-600 mt-1">{modificationsByImpact.high?.length || 0}</p>
                        <p className="text-sm text-gray-600">Locked elements modified</p>
                      </div>
                      
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                          <span className="font-medium text-gray-900">Medium Risk</span>
                        </div>
                        <p className="text-2xl font-bold text-yellow-600 mt-1">{modificationsByImpact.medium?.length || 0}</p>
                        <p className="text-sm text-gray-600">Uncontrolled changes</p>
                      </div>
                      
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full" />
                          <span className="font-medium text-gray-900">Low Risk</span>
                        </div>
                        <p className="text-2xl font-bold text-green-600 mt-1">{modificationsByImpact.low?.length || 0}</p>
                        <p className="text-sm text-gray-600">Allowed customizations</p>
                      </div>
                    </div>
                    
                    {/* Modification Details */}
                    <div className="space-y-4">
                      {['high', 'medium', 'low'].map((impact) => {
                        const modifications = modificationsByImpact[impact] || []
                        if (modifications.length === 0) return null
                        
                        const colors = {
                          high: 'border-red-200 bg-red-50',
                          medium: 'border-yellow-200 bg-yellow-50', 
                          low: 'border-green-200 bg-green-50'
                        }
                        
                        return (
                          <div key={impact} className={`border rounded-lg p-4 ${colors[impact as keyof typeof colors]}`}>
                            <h4 className="font-semibold text-gray-900 mb-3 capitalize">{impact} Risk Modifications</h4>
                            <div className="space-y-2">
                              {modifications.map((modification) => (
                                <div key={modification.path} className="bg-white rounded p-3 border">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <p className="font-medium text-gray-900">{modification.path}</p>
                                      <div className="text-sm text-gray-600 mt-1">
                                        <span className="font-medium">Original:</span> {JSON.stringify(modification.originalValue)}
                                      </div>
                                      <div className="text-sm text-gray-600">
                                        <span className="font-medium">Modified:</span> {JSON.stringify(modification.modifiedValue)}
                                      </div>
                                      {modification.reason && (
                                        <div className="text-sm text-gray-500 mt-1">
                                          <span className="font-medium">Reason:</span> {modification.reason}
                                        </div>
                                      )}
                                    </div>
                                    <div className="text-right ml-4">
                                      <p className="text-xs text-gray-500">{modification.modifiedBy}</p>
                                      <p className="text-xs text-gray-500">{modification.timestamp.toLocaleDateString()}</p>
                                      <button 
                                        onClick={() => removeModification(website.id, modification.path)}
                                        className="text-xs text-red-600 hover:text-red-800 mt-1"
                                      >
                                        Remove Modification
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>
        </div>
      )}
      
      {/* Website Creation Wizard */}
      {showCreateWebsite && <WebsiteCreationWizard onClose={() => setShowCreateWebsite(false)} />}
    </div>
  )
}

// Theme preview images for Create Website dialog - Designed by Gemini! 🎨✨
const themePreviewImages = {
  'modernist-theme': '/theme-previews/digital-open-publishers.png', // Teal geometric - "TECHNOLOGY • ACCESS • IDEAS"
  'classicist-theme': '/theme-previews/academic-review.png',         // Navy & gold academic - "TRADITION • KNOWLEDGE • DISCOVERY"  
  'curator-theme': '/theme-previews/lumina-press.png'               // Artistic overlays - "ART • VISION • CREATION"
}

// Website Creation Wizard Component
function WebsiteCreationWizard({ onClose }: { onClose: () => void }) {
  const { themes, addWebsite } = usePageStore()
  const [step, setStep] = useState(1)
  const [websiteData, setWebsiteData] = useState({
    name: '',
    themeId: '',
    purpose: {
      contentTypes: [] as string[],
      hasSubjectOrganization: false,
      publishingTypes: [] as string[]
    },
    branding: {
      primaryColor: '',
      secondaryColor: '',
      logoUrl: '',
      fontFamily: ''
    },
    customizations: [] as Array<{path: string, value: string, reason: string}>
  })
  
  const totalSteps = 3
  const selectedTheme = themes.find(t => t.id === websiteData.themeId)
  
  const handleCreate = () => {
    const themeBranding = selectedTheme ? {
      primaryColor: selectedTheme.colors.primary,
      secondaryColor: selectedTheme.colors.secondary,
      logoUrl: '',
      fontFamily: selectedTheme.typography.headingFont
    } : websiteData.branding

    const newWebsite: Website = {
      id: crypto.randomUUID(),
      name: websiteData.name,
      domain: `${websiteData.name.toLowerCase().replace(/\s+/g, '-')}.wiley.com`, // Auto-generate from name
      themeId: websiteData.themeId,
      status: 'staging',
      createdAt: new Date(),
      updatedAt: new Date(),
      modifications: websiteData.customizations.map(c => ({
        path: c.path,
        originalValue: getDefaultValueForPath(c.path),
        modifiedValue: c.value,
        modifiedAt: 'website' as const,
        modifiedBy: 'Current User',
        timestamp: new Date(),
        reason: c.reason
      })),
      customSections: [],
      branding: {
        ...themeBranding,
        ...Object.fromEntries(
          Object.entries(websiteData.branding).filter(([_, value]) => value !== '')
        )
      },
      // Store the purpose configuration for future use
      purpose: websiteData.purpose,
      deviationScore: calculateInitialDeviation(websiteData.customizations, selectedTheme),
      lastThemeSync: new Date()
    }
    
    addWebsite(newWebsite)
    onClose()
  }
  
  const getDefaultValueForPath = (path: string) => {
    // Simple mapping of paths to default values
    const defaults: Record<string, any> = {
      'branding.logo': '/default-logo.svg',
      'branding.primaryColor': '#1e40af',
      'typography.headingFont': 'Inter, sans-serif',
      'sections.hero.title': 'Welcome to Our Site'
    }
    return defaults[path] || 'default-value'
  }
  
  const calculateInitialDeviation = (customizations: any[], theme: Theme | undefined) => {
    if (!theme) return 0
    let score = 0
    // For themes, we calculate deviation based on how many customizations diverge from theme standards
    score = customizations.length * 10 // Simple scoring for now
    return Math.min(score, 100)
  }
  
  const nextStep = () => setStep(Math.min(step + 1, totalSteps))
  const prevStep = () => setStep(Math.max(step - 1, 1))
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Create New Website</h3>
              <p className="text-gray-600 mt-1">Step {step} of {totalSteps}</p>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div key={i} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    i + 1 <= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {i + 1}
                  </div>
                  {i < totalSteps - 1 && (
                    <div className={`h-1 w-16 mx-2 ${
                      i + 1 < step ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex mt-2">
              <div className="text-xs text-gray-600 w-8 text-center">Theme</div>
              <div className="text-xs text-gray-600 w-24 text-center">Purpose</div>
              <div className="text-xs text-gray-600 w-24 text-center">Details</div>
            </div>
          </div>
          
          {/* Step Content */}
          <div className="min-h-[400px]">
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Choose Publishing Theme</h4>
                  <p className="text-gray-600 mb-6">Select a complete theme package for your publishing platform</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-96 overflow-y-auto">
                    {themes.map((theme) => (
                      <div 
                        key={theme.id}
                        onClick={() => setWebsiteData({...websiteData, themeId: theme.id})}
                        className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                          websiteData.themeId === theme.id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="h-32 rounded mb-4 overflow-hidden border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 relative">
                          <img 
                            src={themePreviewImages[theme.id as keyof typeof themePreviewImages]} 
                            alt={`${theme.name} theme preview (designed by Gemini)`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback to showing theme info if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                          <div className="absolute inset-0 hidden items-center justify-center flex-col text-gray-500">
                            <Palette className="w-8 h-8 mb-2" />
                            <span className="text-xs font-medium">{theme.name} Theme</span>
                          </div>
                        </div>
                        <h5 className="font-medium text-gray-900 text-lg">{theme.name}</h5>
                        <p className="text-sm text-gray-600 mt-1 mb-3">{theme.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`px-2 py-1 text-xs rounded-full bg-green-100 text-green-800`}>
                              {theme.publishingType}
                            </div>
                            <span className="text-xs text-gray-500">v{theme.version}</span>
                          </div>
                          <span className="text-xs text-gray-500">{theme.templates.length} templates</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {selectedTheme && (
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Palette className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                          <h6 className="font-medium text-blue-900">{selectedTheme.name}</h6>
                          <p className="text-sm text-blue-700 mt-1">{selectedTheme.description}</p>
                          <div className="mt-3">
                            <div className="text-xs font-medium text-blue-800 mb-2">Included Templates:</div>
                            <div className="flex flex-wrap gap-1">
                              {selectedTheme.templates.map((template) => (
                                <span key={template.id} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                                  {template.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Define the Website's Purpose</h4>
                  <p className="text-gray-600 mb-6">
                    Help us configure your website by telling us about the content you'll be publishing and how you want to organize it.
                  </p>
                  
                  {/* Content Type Selection */}
                  <div className="mb-8">
                    <label className="block text-base font-medium text-gray-900 mb-4">
                      What type of content will you be publishing?
                    </label>
                    <p className="text-sm text-gray-600 mb-4">Select all that apply. This will enable the appropriate templates and features.</p>
                    
                    <div className="space-y-3">
                      {[
                        { id: 'journals', label: 'Journals', description: 'Academic journals, research articles, and peer-reviewed content' },
                        { id: 'books', label: 'Books', description: 'eBooks, textbooks, monographs, and book series' },
                        { id: 'conferences', label: 'Conference Proceedings', description: 'Conference papers, abstracts, and presentation materials' }
                      ].map((contentType) => (
                        <label key={contentType.id} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={websiteData.purpose.contentTypes.includes(contentType.id)}
                            onChange={(e) => {
                              const newContentTypes = e.target.checked
                                ? [...websiteData.purpose.contentTypes, contentType.id]
                                : websiteData.purpose.contentTypes.filter(type => type !== contentType.id)
                              setWebsiteData({
                                ...websiteData, 
                                purpose: {...websiteData.purpose, contentTypes: newContentTypes}
                              })
                            }}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{contentType.label}</div>
                            <div className="text-sm text-gray-600">{contentType.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  {/* Subject Organization */}
                  <div className="mb-8">
                    <label className="block text-base font-medium text-gray-900 mb-4">
                      Will your site organize content by subject area?
                    </label>
                    <p className="text-sm text-gray-600 mb-4">
                      This enables taxonomy features like subject browsing, categorization, and filtering.
                    </p>
                    
                    <div className="space-y-3">
                      <label className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name="subjectOrganization"
                          checked={websiteData.purpose.hasSubjectOrganization === true}
                          onChange={() => setWebsiteData({
                            ...websiteData, 
                            purpose: {...websiteData.purpose, hasSubjectOrganization: true}
                          })}
                          className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500 mt-0.5"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">Yes (Enable Taxonomy Features)</div>
                          <div className="text-sm text-gray-600">Enable subject browsing, categories, and content filtering by topic</div>
                        </div>
                      </label>
                      
                      <label className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name="subjectOrganization"
                          checked={websiteData.purpose.hasSubjectOrganization === false}
                          onChange={() => setWebsiteData({
                            ...websiteData, 
                            purpose: {...websiteData.purpose, hasSubjectOrganization: false}
                          })}
                          className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500 mt-0.5"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">No</div>
                          <div className="text-sm text-gray-600">Keep content organization simple without subject-based categorization</div>
                        </div>
                      </label>
                    </div>
                  </div>
                  
                  {/* Selected Theme Preview */}
                  {selectedTheme && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <Palette className="w-5 h-5 text-blue-600" />
                        <h5 className="font-medium text-blue-900">Selected Theme: {selectedTheme.name}</h5>
                      </div>
                      <p className="text-sm text-blue-700 mb-3">{selectedTheme.description}</p>
                      
                      {websiteData.purpose.contentTypes.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-blue-200">
                          <div className="text-sm text-blue-800 font-medium mb-2">
                            Recommended features for your content types:
                          </div>
                          <div className="text-sm text-blue-700 space-y-1">
                            {websiteData.purpose.contentTypes.includes('journals') && (
                              <div>• Article templates, peer-review workflows, citation management</div>
                            )}
                            {websiteData.purpose.contentTypes.includes('books') && (
                              <div>• Chapter navigation, table of contents, book series organization</div>
                            )}
                            {websiteData.purpose.contentTypes.includes('conferences') && (
                              <div>• Proceedings organization, presentation materials, abstract browsing</div>
                            )}
                            {websiteData.purpose.hasSubjectOrganization && (
                              <div>• Subject taxonomy, advanced filtering, topic-based navigation</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Website Details & Launch</h4>
                  <p className="text-gray-600 mb-6">
                    Complete your website setup with naming and optional branding customizations.
                  </p>
                  
                  {/* Website Name */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Website Name *</label>
                    <input
                      type="text"
                      value={websiteData.name}
                      onChange={(e) => setWebsiteData({...websiteData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="e.g., Journal of Advanced Materials"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Domain: {websiteData.name ? `${websiteData.name.toLowerCase().replace(/\s+/g, '-')}.wiley.com` : 'your-site-name.wiley.com'}
                    </p>
                  </div>
                  
                  {/* Theme Defaults Preview */}
                  {selectedTheme && (
                    <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <h5 className="font-medium text-gray-900 mb-3">Theme Defaults ({selectedTheme.name})</h5>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">Primary Color:</span>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-4 h-4 rounded border" style={{backgroundColor: selectedTheme.colors.primary}}></div>
                            <span className="text-gray-700">{selectedTheme.colors.primary}</span>
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Typography:</span>
                          <span className="text-gray-700 ml-2">{selectedTheme.typography.headingFont}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Optional Branding Customizations */}
                  <div className="mb-6">
                    <h5 className="font-medium text-gray-900 mb-3">Custom Branding (Optional)</h5>
                    <p className="text-sm text-gray-600 mb-4">
                      Customize your brand colors and logo. Leave blank to use theme defaults.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Custom Primary Color</label>
                        <input
                          type="color"
                          value={websiteData.branding.primaryColor}
                          onChange={(e) => setWebsiteData({
                            ...websiteData,
                            branding: {...websiteData.branding, primaryColor: e.target.value}
                          })}
                          className="w-full h-10 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Custom Logo URL</label>
                        <input
                          type="url"
                          value={websiteData.branding.logoUrl}
                          onChange={(e) => setWebsiteData({
                            ...websiteData,
                            branding: {...websiteData.branding, logoUrl: e.target.value}
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="https://example.com/logo.svg"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Website Summary */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h5 className="font-medium text-blue-900 mb-4">Website Summary</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-blue-800">Name:</span> 
                        <span className="text-blue-700 ml-2">{websiteData.name || 'Untitled Website'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-blue-800">Theme:</span> 
                        <span className="text-blue-700 ml-2">{selectedTheme?.name || 'None selected'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-blue-800">Content Types:</span> 
                        <span className="text-blue-700 ml-2">
                          {websiteData.purpose.contentTypes.length > 0 
                            ? websiteData.purpose.contentTypes.map(type => type.charAt(0).toUpperCase() + type.slice(1)).join(', ')
                            : 'None selected'
                          }
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-blue-800">Subject Organization:</span> 
                        <span className="text-blue-700 ml-2">
                          {websiteData.purpose.hasSubjectOrganization ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-blue-800">Templates:</span> 
                        <span className="text-blue-700 ml-2">{selectedTheme?.templates.length || 0} included</span>
                      </div>
                      <div>
                        <span className="font-medium text-blue-800">Status:</span> 
                        <span className="text-blue-700 ml-2">Ready to launch</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <div className="flex gap-2">
              {step > 1 && (
                <button
                  onClick={prevStep}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Previous
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              {step < totalSteps ? (
                <button
                  onClick={nextStep}
                  disabled={(step === 1 && !websiteData.themeId) || (step === 2 && websiteData.purpose.contentTypes.length === 0)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleCreate}
                  disabled={!websiteData.name || !websiteData.themeId}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Website
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


// Theme Provider component that applies theme variables to canvas only
function CanvasThemeProvider({ children }: { children: React.ReactNode }) {
  const { themes } = usePageStore()
  const currentTheme = themes.find(t => t.id === 'modernist-theme') // Default theme for now
  
  if (!currentTheme) {
    return <>{children}</>
  }
  
  return (
    <div 
      className="theme-canvas"
      style={{
        '--theme-color-primary': currentTheme.colors.primary,
        '--theme-color-secondary': currentTheme.colors.secondary,
        '--theme-color-accent': currentTheme.colors.accent,
        '--theme-color-text': currentTheme.colors.text,
        '--theme-color-background': currentTheme.colors.background,
        '--theme-color-muted': currentTheme.colors.muted,
        '--theme-heading-font': currentTheme.typography.headingFont,
        '--theme-body-font': currentTheme.typography.bodyFont,
        '--theme-base-size': currentTheme.typography.baseSize,
        '--theme-scale': currentTheme.typography.scale
      } as React.CSSProperties}
    >
      {children}
    </div>
  )
}

function DesignConsole() {
  const { setCurrentView, setSiteManagerView, siteManagerView, themes, websites } = usePageStore()
  const [expandedThemes, setExpandedThemes] = useState<Set<string>>(new Set(['modernist-theme'])) // Default expand modernist theme
  const [expandedWebsites, setExpandedWebsites] = useState<Set<string>>(new Set(['wiley-main'])) // Default expand wiley-main

  // Get only themes that are currently used by websites (for this publisher)
  const usedThemes = themes.filter(theme => 
    websites.some(website => website.themeId === theme.id)
  )

  const toggleTheme = (themeId: string) => {
    const newExpanded = new Set(expandedThemes)
    if (newExpanded.has(themeId)) {
      newExpanded.delete(themeId)
    } else {
      newExpanded.add(themeId)
    }
    setExpandedThemes(newExpanded)
  }

  const isThemeExpanded = (themeId: string) => expandedThemes.has(themeId)

  const toggleWebsite = (websiteId: string) => {
    const newExpanded = new Set(expandedWebsites)
    if (newExpanded.has(websiteId)) {
      newExpanded.delete(websiteId)
    } else {
      newExpanded.add(websiteId)
    }
    setExpandedWebsites(newExpanded)
  }

  const isWebsiteExpanded = (websiteId: string) => expandedWebsites.has(websiteId)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentView('page-builder')}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Page Builder
            </button>
            <h1 className="text-xl font-semibold text-slate-800">Design System Console</h1>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar */}
        <div className="w-64 bg-slate-100 shadow-sm border-r border-slate-200">
          <nav className="p-4">
            {/* Overview */}
            <button
              onClick={() => setSiteManagerView('overview')}
              className={`flex items-center gap-3 w-full px-3 py-2 text-left text-sm rounded-md transition-colors ${
                siteManagerView === 'overview'
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Home className="w-5 h-5" />
              Overview
            </button>

            {/* Themes Section */}
            <div className="mt-6 mb-3">
              <div className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Themes
              </div>
            </div>
            <div className="space-y-1">
              {usedThemes.map((theme) => (
                <div key={theme.id}>
                  {/* Theme Header - Clickable to expand/collapse */}
                  <button
                    onClick={() => toggleTheme(theme.id)}
                    className="flex items-center justify-between w-full px-3 py-2 text-left text-sm rounded-md transition-colors text-gray-700 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      <Palette className="w-4 h-4" />
                      <span className="font-medium">{theme.name}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${
                      isThemeExpanded(theme.id) ? 'transform rotate-180' : ''
                    }`} />
                  </button>

                  {/* Theme Sub-menu - Only show when expanded */}
                  {isThemeExpanded(theme.id) && (
                    <div className="ml-6 mt-1 space-y-1">
                      <button
                        onClick={() => setSiteManagerView(`${theme.id}-theme-settings` as DesignConsoleView)}
                        className={`flex items-center gap-3 w-full px-3 py-2 text-left text-sm rounded-md transition-colors ${
                          siteManagerView === `${theme.id}-theme-settings`
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Settings className="w-4 h-4" />
                        Theme Settings
                      </button>
                      
                      <button
                        onClick={() => setSiteManagerView(`${theme.id}-publication-cards` as DesignConsoleView)}
                        className={`flex items-center gap-3 w-full px-3 py-2 text-left text-sm rounded-md transition-colors ${
                          siteManagerView === `${theme.id}-publication-cards`
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Palette className="w-4 h-4" />
                        Publication Cards
                      </button>
                      
                      <button
                        onClick={() => setSiteManagerView(`${theme.id}-templates` as DesignConsoleView)}
                        className={`flex items-center gap-3 w-full px-3 py-2 text-left text-sm rounded-md transition-colors ${
                          siteManagerView === `${theme.id}-templates`
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <FileText className="w-4 h-4" />
                        Theme Templates
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Websites Section */}
            <div className="mt-6 mb-3">
              <div className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Websites
              </div>
            </div>
            <div className="space-y-1">
              {websites.map((website) => (
                <div key={website.id}>
                  {/* Website Header - Clickable to expand/collapse */}
                  <button
                    onClick={() => toggleWebsite(website.id)}
                    className="flex items-center justify-between w-full px-3 py-2 text-left text-sm rounded-md transition-colors text-gray-700 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      <span className="font-medium">{website.name}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${
                      isWebsiteExpanded(website.id) ? 'transform rotate-180' : ''
                    }`} />
                  </button>

                  {/* Website Sub-menu - Only show when expanded */}
                  {isWebsiteExpanded(website.id) && (
                    <div className="ml-6 mt-1 space-y-1">
                      <button
                        onClick={() => setSiteManagerView(`${website.id}-settings` as DesignConsoleView)}
                        className={`flex items-center gap-3 w-full px-3 py-2 text-left text-sm rounded-md transition-colors ${
                          siteManagerView === `${website.id}-settings`
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Settings className="w-4 h-4" />
                        Website Settings
                      </button>

                      <button
                        onClick={() => setSiteManagerView(`${website.id}-publication-cards` as DesignConsoleView)}
                        className={`flex items-center gap-3 w-full px-3 py-2 text-left text-sm rounded-md transition-colors ${
                          siteManagerView === `${website.id}-publication-cards`
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Palette className="w-4 h-4" />
                        Publication Cards
                      </button>

                      <button
                        onClick={() => setSiteManagerView(`${website.id}-custom-templates` as DesignConsoleView)}
                        className={`flex items-center gap-3 w-full px-3 py-2 text-left text-sm rounded-md transition-colors ${
                          siteManagerView === `${website.id}-custom-templates`
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <FileText className="w-4 h-4" />
                        Custom Templates
                      </button>
                    </div>
                  )}
                </div>
              ))}
              
              {/* All Websites Overview Link */}
              <button
                onClick={() => setSiteManagerView('websites')}
                className={`flex items-center gap-3 w-full px-3 py-2 text-left text-sm rounded-md transition-colors mt-2 ${
                  siteManagerView === 'websites'
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <List className="w-4 h-4" />
                All Websites
              </button>
            </div>

            {/* System Section */}
            <div className="mt-6 mb-3">
              <div className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                System
              </div>
            </div>
            <div className="space-y-1">
              <button
                onClick={() => setSiteManagerView('settings')}
                className={`flex items-center gap-3 w-full px-3 py-2 text-left text-sm rounded-md transition-colors ${
                  siteManagerView === 'settings'
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Cog className="w-5 h-5" />
                Settings
              </button>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 bg-slate-50">
          {siteManagerView === 'overview' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Design System Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {usedThemes.map((theme) => (
                  <div key={theme.id} className="bg-white p-6 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{theme.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{theme.description}</p>
                    <div className="space-y-2">
                      <button 
                        onClick={() => setSiteManagerView(`${theme.id}-theme-settings` as DesignConsoleView)}
                        className="block text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Theme Settings →
                      </button>
                      <button 
                        onClick={() => setSiteManagerView(`${theme.id}-publication-cards` as DesignConsoleView)}
                        className="block text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Publication Cards →
                      </button>
                      <button 
                        onClick={() => setSiteManagerView(`${theme.id}-templates` as DesignConsoleView)}
                        className="block text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Theme Templates →
                      </button>
                    </div>
                  </div>
                ))}
                {websites.slice(0, 3).map((website) => (
                  <div key={website.id} className="bg-white p-6 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{website.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {website.purpose?.contentTypes.join(', ') || 'Legacy setup'}
                      {website.purpose?.hasSubjectOrganization ? ' • Taxonomy enabled' : ' • Simple organization'}
                    </p>
                    <div className="space-y-2">
                      <button
                        onClick={() => setSiteManagerView(`${website.id}-settings` as DesignConsoleView)}
                        className="block text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Website Settings →
                      </button>
                      <button
                        onClick={() => setSiteManagerView(`${website.id}-publication-cards` as DesignConsoleView)}
                        className="block text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Publication Cards →
                      </button>
                      <button
                        onClick={() => setSiteManagerView(`${website.id}-custom-templates` as DesignConsoleView)}
                        className="block text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Custom Templates →
                      </button>
                    </div>
                  </div>
                ))}
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">All Websites</h3>
                  <p className="text-gray-600 text-sm mb-4">Manage all {websites.length} websites and track modifications</p>
                  <button
                    onClick={() => setSiteManagerView('websites')}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View All Websites →
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Modernist Theme Views */}
          {siteManagerView === 'modernist-theme-theme-settings' && (
            <div>
              <div className="mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-slate-800">Modern Theme - Settings</h2>
                <p className="text-slate-600 mt-1">Configure clean, minimalist design with sans-serif fonts, generous white space, and vibrant accents</p>
              </div>
              <ThemeEditor usePageStore={usePageStore} themeId="modernist-theme" />
            </div>
          )}
          {siteManagerView === 'modernist-theme-publication-cards' && (
            <div>
              <div className="mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-slate-800">Modern Theme - Publication Cards</h2>
                <p className="text-slate-600 mt-1">Predefined publication card designs with clean, minimalist styling and vibrant accents</p>
                <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-blue-700 text-sm font-medium">📖 Reference Cards</p>
                  <p className="text-blue-600 text-sm mt-1">These are the out-of-the-box publication cards that come with the Modern theme. Websites using this theme can customize these cards in their individual Publication Cards settings.</p>
                </div>
              </div>
              <ThemePublicationCards themeId="modernist-theme" />
            </div>
          )}
          {siteManagerView === 'modernist-theme-templates' && (
            <SiteManagerTemplates themeId="modernist-theme" />
          )}
          
          {/* Classicist Theme Views */}
          {siteManagerView === 'classicist-theme-theme-settings' && (
            <div>
              <div className="mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-slate-800">Classic Theme - Settings</h2>
                <p className="text-slate-600 mt-1">Configure traditional, scholarly design with serif fonts and formal color palette</p>
              </div>
              <ThemeEditor usePageStore={usePageStore} themeId="classicist-theme" />
            </div>
          )}
          {siteManagerView === 'classicist-theme-publication-cards' && (
            <div>
              <div className="mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-slate-800">Classic Theme - Publication Cards</h2>
                <p className="text-slate-600 mt-1">Predefined publication card designs with traditional, scholarly styling and formal typography</p>
                <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-blue-700 text-sm font-medium">📖 Reference Cards</p>
                  <p className="text-blue-600 text-sm mt-1">These are the out-of-the-box publication cards that come with the Classic theme. Websites using this theme can customize these cards in their individual Publication Cards settings.</p>
                </div>
              </div>
              <ThemePublicationCards themeId="classicist-theme" />
            </div>
          )}
          {siteManagerView === 'classicist-theme-templates' && (
            <SiteManagerTemplates themeId="classicist-theme" />
          )}
          
          {/* Curator Theme Views */}
          {siteManagerView === 'curator-theme-theme-settings' && (
            <div>
              <div className="mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-slate-800">Curator Theme - Settings</h2>
                <p className="text-slate-600 mt-1">Configure visually rich, image-forward design with elegant typography and masonry layouts</p>
              </div>
              <ThemeEditor usePageStore={usePageStore} themeId="curator-theme" />
            </div>
          )}
          {siteManagerView === 'curator-theme-publication-cards' && (
            <div>
              <div className="mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-slate-800">Curator Theme - Publication Cards</h2>
                <p className="text-slate-600 mt-1">Predefined publication card designs with visually rich, image-forward styling and elegant typography</p>
                <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-blue-700 text-sm font-medium">📖 Reference Cards</p>
                  <p className="text-blue-600 text-sm mt-1">These are the out-of-the-box publication cards that come with the Curator theme. Websites using this theme can customize these cards in their individual Publication Cards settings.</p>
                </div>
              </div>
              <ThemePublicationCards themeId="curator-theme" />
            </div>
          )}
          {siteManagerView === 'curator-theme-templates' && (
            <SiteManagerTemplates themeId="curator-theme" />
          )}

          {/* Website-Specific Views */}
          {/* Wiley Online Library */}
          {siteManagerView === 'wiley-main-settings' && (
            <div>
              <div className="mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-slate-800">Wiley Online Library - Website Settings</h2>
                <p className="text-slate-600 mt-1">Configure domain, branding, purpose, and website-specific settings</p>
              </div>
              <WebsiteSettings websiteId="wiley-main" />
            </div>
          )}
          {siteManagerView === 'wiley-main-publication-cards' && (
            <div>
              <div className="mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-slate-800">Wiley Online Library - Publication Cards</h2>
                <p className="text-slate-600 mt-1">Design publication cards optimized for journals and books with taxonomy features</p>
              </div>
              <PublicationCards usePageStore={usePageStore} />
            </div>
          )}
          {siteManagerView === 'wiley-main-custom-templates' && (
            <div>
              <div className="mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-slate-800">Wiley Online Library - Custom Templates</h2>
                <p className="text-slate-600 mt-1">Website-specific templates beyond the foundational theme templates</p>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom Templates - Coming Soon</h3>
                <p className="text-gray-600">Create and manage custom page templates specific to this website.</p>
              </div>
            </div>
          )}

          {/* Wiley Research Hub */}
          {siteManagerView === 'research-hub-settings' && (
            <div>
              <div className="mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-slate-800">Wiley Research Hub - Website Settings</h2>
                <p className="text-slate-600 mt-1">Configure domain, branding, purpose, and website-specific settings</p>
              </div>
              <WebsiteSettings websiteId="research-hub" />
            </div>
          )}
          {siteManagerView === 'research-hub-publication-cards' && (
            <div>
              <div className="mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-slate-800">Wiley Research Hub - Publication Cards</h2>
                <p className="text-slate-600 mt-1">Design publication cards optimized for research journals with simple organization</p>
              </div>
              <PublicationCards usePageStore={usePageStore} />
            </div>
          )}
          {siteManagerView === 'research-hub-custom-templates' && (
            <div>
              <div className="mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-slate-800">Wiley Research Hub - Custom Templates</h2>
                <p className="text-slate-600 mt-1">Website-specific templates beyond the foundational theme templates</p>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom Templates - Coming Soon</h3>
                <p className="text-gray-600">Create and manage custom page templates specific to this website.</p>
              </div>
            </div>
          )}

          {/* Journal of Advanced Science */}
          {siteManagerView === 'journal-of-science-settings' && (
            <div>
              <div className="mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-slate-800">Journal of Advanced Science - Website Settings</h2>
                <p className="text-slate-600 mt-1">Configure domain, branding, purpose, and website-specific settings</p>
              </div>
              <WebsiteSettings websiteId="journal-of-science" />
            </div>
          )}
          {siteManagerView === 'journal-of-science-publication-cards' && (
            <div>
              <div className="mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-slate-800">Journal of Advanced Science - Publication Cards</h2>
                <p className="text-slate-600 mt-1">Design publication cards optimized for scientific journals and conferences with taxonomy features</p>
              </div>
              <PublicationCards usePageStore={usePageStore} />
            </div>
          )}
          {siteManagerView === 'journal-of-science-custom-templates' && (
            <div>
              <div className="mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-slate-800">Journal of Advanced Science - Custom Templates</h2>
                <p className="text-slate-600 mt-1">Website-specific templates beyond the foundational theme templates</p>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom Templates - Coming Soon</h3>
                <p className="text-gray-600">Create and manage custom page templates specific to this website.</p>
              </div>
            </div>
          )}


          {/* Implementation Views */}
          {siteManagerView === 'websites' && <SiteManagerWebsites />}
          
          {/* System Views */}
          {siteManagerView === 'settings' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">System Settings</h2>
              <p className="text-gray-600">Global system configuration - Coming soon</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Left sidebar tabs
type LeftSidebarTab = 'library' | 'sections' | 'diy-zone'

// Layout picker component
function LayoutPicker({ onSelectLayout, onClose }: { onSelectLayout: (layout: ContentBlockLayout) => void; onClose: () => void }) {
  const layouts = [
    { id: 'flexible' as ContentBlockLayout, name: 'Flexible', description: 'Responsive layout' },
    { id: 'one-column' as ContentBlockLayout, name: 'One Column', description: 'Full width column' },
    { id: 'two-columns' as ContentBlockLayout, name: 'Two Columns', description: 'Equal columns' },
    { id: 'three-columns' as ContentBlockLayout, name: 'Three Columns', description: 'Equal columns' },
    { id: 'one-third-left' as ContentBlockLayout, name: 'One-Third Left', description: '1/3 + 2/3 columns' },
    { id: 'one-third-right' as ContentBlockLayout, name: 'One-Third Right', description: '2/3 + 1/3 columns' },
    { id: 'vertical' as ContentBlockLayout, name: 'Vertical Section', description: 'Stacked rows' }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Choose Layout</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-2">
          {layouts.map((layout) => (
            <button
              key={layout.id}
              onClick={() => onSelectLayout(layout.id)}
              className="w-full text-left p-3 rounded-md border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div className="font-medium text-gray-900">{layout.name}</div>
              <div className="text-sm text-gray-500">{layout.description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// Draggable Library Widget Component
function DraggableLibraryWidget({ item, isDIY = false }: { item: SpecItem; isDIY?: boolean }) {
  const { addWidget } = usePageStore()
  const [dragStarted, setDragStarted] = useState(false)
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `library-${item.id}`,
    data: {
      type: 'library-widget',
      item: item
    }
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined

  const handleClick = (e: React.MouseEvent) => {
    // Prevent click if drag was started
    if (dragStarted) {
      e.preventDefault()
      setDragStarted(false)
      return
    }
    
    const newWidget = buildWidget(item)
    addWidget(newWidget)
  }

  const handlePointerDown = () => {
    setDragStarted(false)
  }

  const handleDragStart = () => {
    setDragStarted(true)
    console.log('📦 Library widget drag started:', item.label)
  }

  return (
    <button
      ref={setNodeRef}
      style={style}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      {...attributes}
      {...listeners}
      className={`block w-full text-left rounded transition-colors cursor-grab active:cursor-grabbing ${
        isDIY 
          ? 'p-3 border border-orange-200 bg-orange-50 hover:bg-orange-100' 
          : 'p-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700'
      } ${isDragging ? 'opacity-50' : ''}`}
      title="Click to add to canvas, or drag to drop into a section"
    >
      {isDIY ? (
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Code className="w-4 h-4 text-orange-600" />
            <span className="font-medium text-gray-900">{item.label}</span>
          </div>
          <p className="text-sm text-gray-600">{item.description}</p>
        </div>
      ) : (
        <div>
          {item.label}
          {item.status === 'planned' && (
            <span className="ml-2 text-xs text-orange-600">(Planned)</span>
          )}
        </div>
      )}
    </button>
  )
}

// Library component to show widgets and sections with collapsible categories
function WidgetLibrary() {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['core']) // Expand Core category by default to show HTML Block widget
  )

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900">Widget Library</h3>
      <div className="space-y-3">
        {LIBRARY_CONFIG.map((category: any) => {
          const isExpanded = expandedCategories.has(category.id)
          
          return (
            <div key={category.id} className="border border-gray-200 rounded-lg">
              {/* Category Header - Clickable to toggle */}
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full p-3 bg-gray-50 border-b flex items-center justify-between hover:bg-gray-100 transition-colors"
              >
                <h4 className="font-medium text-gray-900">{category.name}</h4>
                <ChevronDown 
                  className={`w-4 h-4 text-gray-500 transition-transform ${
                    isExpanded ? 'transform rotate-180' : ''
                  }`} 
                />
              </button>
              
              {/* Category Content - Collapsible */}
              {isExpanded && (
                <div className="p-3 space-y-2">
                  {category.groups?.map((group: any) => (
                    <div key={group.id}>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">{group.name}</h5>
                      <div className="space-y-1">
                        {group.items?.map((item: any) => (
                          <DraggableLibraryWidget key={item.id} item={item} />
                        ))}
                      </div>
                    </div>
                  )) || (
                    // Handle categories with direct items (no groups)
                    category.items?.map((item: any) => (
                      <DraggableLibraryWidget key={item.id} item={item} />
                    ))
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// NOTE: PREFAB_SECTIONS is now defined at the top of the file to avoid hoisting issues

// Sections Content component
function SectionsContent({ showToast }: { showToast: (message: string, type: 'success' | 'error') => void }) {
  const { addSection, customSections, removeCustomSection } = usePageStore()
  
  const handleAddPrefabSection = (sectionKey: keyof typeof PREFAB_SECTIONS) => {
    const prefab = PREFAB_SECTIONS[sectionKey]
    const newSection: WidgetSection = {
      id: crypto.randomUUID(),
      ...prefab.template,
      // Ensure all nested items have unique IDs
      areas: prefab.template.areas.map(area => ({
        ...area,
        id: crypto.randomUUID(),
        widgets: area.widgets.map(widget => ({
          ...widget,
          id: crypto.randomUUID()
        }))
      }))
    }
    addSection(newSection)
  }

  // Group sections by category
  const sectionsByCategory = Object.entries(PREFAB_SECTIONS).reduce((acc, [key, section]) => {
    const category = section.category
    if (!acc[category]) acc[category] = []
    acc[category].push([key, section])
    return acc
  }, {} as Record<string, Array<[string, any]>>)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-900 mb-4">Sections</h3>
        <p className="text-sm text-gray-600 mb-4">Pre-fabricated layout patterns to accelerate page design</p>
        
        {/* Pre-fabricated Sections by Category */}
        {Object.entries(sectionsByCategory).map(([categoryName, sections]) => (
          <div key={categoryName} className="space-y-3 mb-6">
            <h4 className="font-medium text-gray-700">{categoryName}</h4>
            <div className="space-y-2">
                  {sections.map(([key, section]) => (
                    <button
                      key={key}
                      onClick={() => handleAddPrefabSection(key as keyof typeof PREFAB_SECTIONS)}
                      className="block w-full text-left p-3 border border-blue-200 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Plus className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-gray-900">{section.name}</span>
                      </div>
                      <p className="text-sm text-gray-600">{section.description}</p>
                    </button>
                  ))}
            </div>
          </div>
        ))}
        
        {/* Custom Sections (User-saved sections) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-700">Custom Sections</h4>
            <span className="text-xs text-gray-500">{customSections.length} saved</span>
          </div>
          
          {customSections.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-sm text-gray-500">No custom sections yet</p>
              <p className="text-xs text-gray-400 mt-1">Create sections on your page and save them for reuse</p>
            </div>
          ) : (
            <div className="space-y-2">
              {customSections.map((section) => (
                <div key={section.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white">
                  <div>
                    <div className="font-medium text-gray-900">{section.name}</div>
                    {section.description && (
                      <div className="text-sm text-gray-500">{section.description}</div>
                    )}
                    <div className="text-xs text-gray-400">
                      {section.widgets.length} widget{section.widgets.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        const { addSection } = usePageStore.getState()
                        // Create a copy of the section with new ID
                        const newSectionId = crypto.randomUUID()
                        const sectionCopy = {
                          ...section.section,
                          id: newSectionId,
                          areas: section.section.areas.map(area => ({
                            ...area,
                            id: crypto.randomUUID(),
                            widgets: area.widgets.map(widget => ({
                              ...widget,
                              id: crypto.randomUUID(),
                              sectionId: newSectionId // Fixed: Use new section ID
                            }))
                          }))
                        }
                        addSection(sectionCopy)
                        
                        // Show success notification
                        const widgetCount = sectionCopy.areas.reduce((count, area) => count + area.widgets.length, 0)
                        showToast(`"${section.name}" added to canvas with ${widgetCount} widget${widgetCount !== 1 ? 's' : ''}!`, 'success')
                      }}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      Use
                    </button>
                    <button 
                      onClick={() => removeCustomSection(section.id)}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// DIY Zone component
function DIYZoneContent({ showToast }: { showToast: (message: string, type: 'success' | 'error') => void }) {
  const { addWidget, customSections, addCustomSection, removeCustomSection } = usePageStore()
  
  const handleAddDIYWidget = (type: string) => {
    let widget: Widget
    
    switch (type) {
      case 'html-block':
        widget = {
          id: crypto.randomUUID(),
          type: 'html',
          skin: 'minimal',
          htmlContent: '',
          title: 'HTML Widget'
        } as HTMLWidget
        break
      case 'code-block':
        widget = {
          id: crypto.randomUUID(),
          type: 'text',
          skin: 'modern',
          text: '// Your code here\nconsole.log("Hello World");',
          align: 'left'
        } as TextWidget
        break
      default:
        return
    }
    
    addWidget(widget)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-900 mb-4">DIY Zone</h3>
        <p className="text-sm text-gray-600 mb-4">Advanced tools for creating custom content</p>
        
        {/* DIY Widgets */}
        <div className="space-y-3 mb-6">
          <h4 className="font-medium text-gray-700">DIY Widgets</h4>
          <div className="space-y-2">
            <DraggableLibraryWidget 
              item={{ 
                id: 'html-block', 
                label: 'HTML Block', 
                type: 'html-block', 
                description: 'Custom HTML, CSS and JavaScript',
                status: 'supported'
              }}
              isDIY={true}
            />
            <button
              onClick={() => handleAddDIYWidget('code-block')}
              className="block w-full text-left p-3 border border-orange-200 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="w-4 h-4 text-orange-600" />
                <span className="font-medium text-gray-900">Code Block</span>
              </div>
              <p className="text-sm text-gray-600">Syntax-highlighted code snippets</p>
            </button>
            
            <div className="p-3 border border-gray-200 bg-gray-50 rounded-lg opacity-60">
              <div className="flex items-center gap-2 mb-1">
                <Settings className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-gray-500">Global CSS</span>
              </div>
              <p className="text-sm text-gray-500">Site-wide styling (Coming Soon)</p>
            </div>
            
            <div className="p-3 border border-gray-200 bg-gray-50 rounded-lg opacity-60">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-gray-500">File Manager</span>
              </div>
              <p className="text-sm text-gray-500">Upload and manage assets (Coming Soon)</p>
            </div>
          </div>
        </div>
        
        {/* Custom Sections */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-700">Custom Sections</h4>
            <span className="text-xs text-gray-500">{customSections.length} saved</span>
          </div>
          
          {customSections.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-sm text-gray-500">No custom sections yet</p>
              <p className="text-xs text-gray-400 mt-1">Select a section and choose "Save as My Section"</p>
            </div>
          ) : (
            <div className="space-y-2">
              {customSections.map((section) => (
                <div key={section.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white">
                  <div>
                    <div className="font-medium text-gray-900">{section.name}</div>
                    {section.description && (
                      <div className="text-sm text-gray-500">{section.description}</div>
                    )}
                    <div className="text-xs text-gray-400">
                      {section.widgets.length} widget{section.widgets.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        const { addSection } = usePageStore.getState()
                        // Create a copy of the section with new ID
                        const newSectionId = crypto.randomUUID()
                        const sectionCopy = {
                          ...section.section,
                          id: newSectionId,
                          areas: section.section.areas.map(area => ({
                            ...area,
                            id: crypto.randomUUID(),
                            widgets: area.widgets.map(widget => ({
                              ...widget,
                              id: crypto.randomUUID(),
                              sectionId: newSectionId // Fixed: Use new section ID
                            }))
                          }))
                        }
                        addSection(sectionCopy)
                        
                        // Show success notification
                        const widgetCount = sectionCopy.areas.reduce((count, area) => count + area.widgets.length, 0)
                        showToast(`"${section.name}" added to canvas with ${widgetCount} widget${widgetCount !== 1 ? 's' : ''}!`, 'success')
                      }}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      Use
                    </button>
                    <button 
                      onClick={() => removeCustomSection(section.id)}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Publication Cards configuration component
function PublicationCardsContent() {
  const { publicationCardVariants, addPublicationCardVariant, removePublicationCardVariant } = usePageStore()
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-900 mb-4">Publication Cards</h3>
        <p className="text-sm text-gray-600 mb-4">Configure how publication metadata is displayed</p>
        
        {/* Saved Variants */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-700">Saved Variants</h4>
            <span className="text-xs text-gray-500">{publicationCardVariants.length} variants</span>
          </div>
          
          <div className="space-y-2">
            {publicationCardVariants.map((variant) => (
              <div key={variant.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white">
                <div>
                  <div className="font-medium text-gray-900">{variant.name}</div>
                  {variant.description && (
                    <div className="text-sm text-gray-500">{variant.description}</div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                    Configure
                  </button>
                  <button 
                    onClick={() => removePublicationCardVariant(variant.id)}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Live Preview */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700">Live Preview</h4>
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
            <PublicationCard 
              article={MOCK_SCHOLARLY_ARTICLES[0]}
              config={DEFAULT_PUBLICATION_CARD_CONFIG}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// Properties Panel component
function PropertiesPanel() {
  const { canvasItems, selectedWidget, replaceCanvasItems, publicationCardVariants } = usePageStore()
  
  if (!selectedWidget) {
    return (
      <div className="p-4">
        <div className="text-center py-12">
          <p className="text-gray-500">Select a widget or section to edit its properties</p>
        </div>
      </div>
    )
  }
  
  // Find selected widget/section - check both canvas items and widgets within sections
  let selectedItem: CanvasItem | Widget | undefined = canvasItems.find(item => item.id === selectedWidget)
  
  // If not found at canvas level, search within section areas
  if (!selectedItem) {
    for (const canvasItem of canvasItems) {
      if (isSection(canvasItem)) {
        for (const area of canvasItem.areas) {
          const foundWidget = area.widgets.find(w => w.id === selectedWidget)
          if (foundWidget) {
            selectedItem = foundWidget
            break
          }
        }
        if (selectedItem) break
      }
    }
  }
  
  if (!selectedItem) {
    console.log('🔍 Properties Panel - Selected item not found:', { 
      selectedWidget, 
      canvasItemIds: canvasItems.map(item => item.id),
      sectionWidgetIds: canvasItems.flatMap(item => 
        isSection(item) ? item.areas.flatMap(area => area.widgets.map(w => w.id)) : []
      )
    })
    return (
      <div className="p-4">
        <div className="text-center py-12">
          <p className="text-gray-500">Selected item not found</p>
        </div>
      </div>
    )
  }
  
  console.log('🎯 Properties Panel - Found selected item:', { 
    id: selectedItem.id, 
    type: selectedItem.type,
    isSection: isSection(selectedItem)
  })
  
  const updateWidget = (updates: Partial<Widget>) => {
    const updatedCanvasItems = canvasItems.map(item => {
      if (isSection(item)) {
        return {
          ...item,
          areas: item.areas.map(area => ({
            ...area,
            widgets: area.widgets.map(w => 
              w.id === selectedWidget ? { ...w, ...updates } : w
            )
          }))
        }
      } else {
        return item.id === selectedWidget ? { ...item, ...updates } : item
      }
    })
    replaceCanvasItems(updatedCanvasItems)
  }
  
  if (isSection(selectedItem)) {
    return (
      <div className="p-4 space-y-4">
        <h3 className="font-semibold text-gray-900">Section Properties</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={selectedItem.name}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Layout</label>
            <input
              type="text"
              value={selectedItem.layout}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
            />
          </div>
        </div>
      </div>
    )
  }
  
  // Widget properties
  const widget = selectedItem as Widget
  
  return (
    <div className="p-4 space-y-4">
      <h3 className="font-semibold text-gray-900">Widget Properties</h3>
      
      {widget.type === 'text' && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Text</label>
            <textarea
              value={widget.text}
              onChange={(e) => updateWidget({ text: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alignment</label>
            <select
              value={widget.align || 'left'}
              onChange={(e) => updateWidget({ align: e.target.value as 'left' | 'center' | 'right' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
        </div>
      )}
      
      {widget.type === 'heading' && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Text</label>
            <input
              type="text"
              value={(widget as HeadingWidget).text}
              onChange={(e) => updateWidget({ text: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
            <select
              value={(widget as HeadingWidget).level}
              onChange={(e) => updateWidget({ level: parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5 | 6 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value={1}>H1</option>
              <option value={2}>H2</option>
              <option value={3}>H3</option>
              <option value={4}>H4</option>
              <option value={5}>H5</option>
              <option value={6}>H6</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alignment</label>
            <select
              value={(widget as HeadingWidget).align || 'left'}
              onChange={(e) => updateWidget({ align: e.target.value as 'left' | 'center' | 'right' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
        </div>
      )}
      
      {widget.type === 'html' && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">HTML Content</label>
            <textarea
              value={(widget as HTMLWidget).htmlContent}
              onChange={(e) => updateWidget({ htmlContent: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm resize-none"
              rows={6}
              placeholder="Enter your HTML code here..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload HTML File</label>
            <input
              type="file"
              accept=".html,.htm"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  const reader = new FileReader()
                  reader.onload = (e) => {
                    const content = e.target?.result as string
                    updateWidget({ htmlContent: content })
                  }
                  reader.readAsText(file)
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          {/* Widget Promotion for HTML widgets */}
          {(widget as HTMLWidget).htmlContent && (
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center gap-2 mb-3">
                <h4 className="font-medium text-gray-700">Widget Promotion</h4>
                <div className="relative group">
                  <Info className="w-4 h-4 text-gray-400 cursor-help" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    Share your creation with the community or suggest it for the platform library
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <button className="w-full px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors">
                  Suggest for Library
                </button>
                <button className="w-full px-3 py-2 bg-orange-600 text-white text-sm font-medium rounded-md hover:bg-orange-700 transition-colors">
                  Promote to Wiley
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {widget.type === 'publication-list' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Content Source</label>
            <select
              value={(widget as PublicationListWidget).contentSource}
              onChange={(e) => updateWidget({ 
                contentSource: e.target.value as 'dynamic-query' | 'doi-list' | 'ai-generated' 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="dynamic-query">Dynamic Query</option>
              <option value="doi-list">DOI List</option>
              <option value="ai-generated">AI Generated</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Layout</label>
            <select
              value={(widget as PublicationListWidget).layout}
              onChange={(e) => updateWidget({ 
                layout: e.target.value as 'list' | 'grid' | 'featured' 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="list">List</option>
              <option value="grid">Grid</option>
              <option value="featured">Featured</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Items: {(widget as PublicationListWidget).maxItems || 6}
            </label>
            <input
              type="range"
              min="1"
              max="20"
              value={(widget as PublicationListWidget).maxItems || 6}
              onChange={(e) => updateWidget({ maxItems: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Publication Card Variant</label>
            <select
              value={(widget as PublicationListWidget).cardVariantId || 'default'}
              onChange={(e) => {
                const variantId = e.target.value === 'default' ? undefined : e.target.value
                const selectedVariant = publicationCardVariants.find(v => v.id === variantId)
                const cardConfig = selectedVariant ? selectedVariant.config : DEFAULT_PUBLICATION_CARD_CONFIG
                updateWidget({ 
                  cardVariantId: variantId,
                  cardConfig: cardConfig
                })
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
            >
              <option value="default">Default</option>
              {publicationCardVariants.map(variant => (
                <option key={variant.id} value={variant.id}>{variant.name}</option>
              ))}
            </select>
            <button 
              onClick={() => {
                const { setCurrentView, setSiteManagerView, currentWebsiteId } = usePageStore.getState()
                setCurrentView('design-console')
                // Navigate to the specific website's publication cards based on current editing context
                setSiteManagerView(`${currentWebsiteId}-publication-cards` as DesignConsoleView)
              }}
              className="w-full px-3 py-2 border border-blue-300 text-blue-700 rounded-md text-sm hover:bg-blue-50 transition-colors"
            >
              → Configure Publication Cards
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function PageBuilder() {
  const instanceId = useMemo(() => Math.random().toString(36).substring(7), [])
  const { canvasItems, setCurrentView, selectWidget, selectedWidget, setInsertPosition, createContentBlockWithLayout } = usePageStore()
  const [leftSidebarTab, setLeftSidebarTab] = useState<LeftSidebarTab>('library')
  const [showLayoutPicker, setShowLayoutPicker] = useState(false)
  const [activeSectionToolbar, setActiveSectionToolbar] = useState<string | null>(null)
  const [activeWidgetToolbar, setActiveWidgetToolbar] = useState<string | null>(null)
  const [activeDropZone, setActiveDropZone] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  
  
  const handleSetActiveSectionToolbar = (value: string | null) => {
    setActiveSectionToolbar(value)
  }
  
  // Show toast notification
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000) // Auto-hide after 3 seconds
  }
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  )
  
  // Custom collision detection that prioritizes section-area drop zones
  const customCollisionDetection = (args: any) => {
    // First try to find section-area collisions
    const sectionAreaCollisions = rectIntersection({
      ...args,
      droppableContainers: args.droppableContainers.filter((container: any) => 
        container.data?.current?.type === 'section-area'
      )
    })
    
    if (sectionAreaCollisions.length > 0) {
      return sectionAreaCollisions
    }
    
    // Fall back to default collision detection
    return closestCenter(args)
  }
  
  const handleDragStart = (event: DragStartEvent) => {
    console.log('🚀 Drag Start:', {
      activeId: event.active.id,
      activeType: event.active.data?.current?.type,
      activeData: event.active.data?.current
    })
    
    // Log all available drop zones for debugging
    const dropZones = document.querySelectorAll('[data-droppable="true"]')
    console.log('📍 Available drop zones:', Array.from(dropZones).map(zone => ({
      id: zone.getAttribute('data-droppable-id') || zone.id,
      classes: zone.className,
      rect: zone.getBoundingClientRect()
    })))
  }
  
  const handleDragOver = (event: DragOverEvent) => {
    if (event.over) {
      // Highlight section-area drop zones
      if (event.over.data?.current?.type === 'section-area') {
        const dropZoneId = event.over.id as string
        if (activeDropZone !== dropZoneId) {
          setActiveDropZone(dropZoneId)
          console.log('🎯 Drop zone detected:', {
            activeId: event.active.id,
            activeType: event.active.data?.current?.type,
            dropZone: dropZoneId,
            sectionId: event.over.data?.current?.sectionId,
            areaId: event.over.data?.current?.areaId
          })
        }
      } else {
        // Clear highlight when not over a section-area
        if (activeDropZone) {
          setActiveDropZone(null)
        }
      }
    } else {
      // Clear highlight when not over anything
      if (activeDropZone) {
        setActiveDropZone(null)
      }
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    // Clear drop zone highlighting
    setActiveDropZone(null)
    
    console.log('🎯 Drag End Event:', {
      activeId: active.id,
      activeType: active.data?.current?.type,
      overId: over?.id,
      overType: over?.data?.current?.type,
      hasOver: !!over,
      isLibraryWidget: active.data?.current?.type === 'library-widget',
      isSortableItem: !active.data?.current?.type || active.data?.current?.type === 'sortable'
    })

    if (!over) {
      console.log('❌ No drop target found')
      return
    }

    // Handle library widget drop into section area
    if (active.data?.current?.type === 'library-widget' && over.data?.current?.type === 'section-area') {
      console.log('✅ Library widget dropped into section area!')
      const libraryItem = active.data.current.item
      const sectionId = over.data.current.sectionId
      const areaId = over.data.current.areaId
      
      // Create new widget from library item
      const newWidget = buildWidget(libraryItem)
      newWidget.sectionId = sectionId
      
      // Add widget to the specific section area
      const { replaceCanvasItems, canvasItems } = usePageStore.getState()
      const updatedCanvasItems = canvasItems.map(canvasItem => {
        if (canvasItem.type === 'content-block' && canvasItem.id === sectionId) {
          return {
            ...canvasItem,
            areas: canvasItem.areas.map(area => 
              area.id === areaId 
                ? { ...area, widgets: [...area.widgets, newWidget] }
                : area
            )
          }
        }
        return canvasItem
      })
      replaceCanvasItems(updatedCanvasItems)
      return
    }
    
    // Handle library widget drop onto main canvas (as standalone widget)
    if (active.data?.current?.type === 'library-widget' && over?.id && !over.data?.current?.type) {
      console.log('✅ Library widget dropped onto main canvas!')
      const libraryItem = active.data.current.item
      const targetId = over.id
      
      // Create new widget from library item (no sectionId - standalone widget)
      const newWidget = buildWidget(libraryItem)
      
      // Add widget to canvas at specific position
      const { replaceCanvasItems, canvasItems } = usePageStore.getState()
      const targetIndex = canvasItems.findIndex(item => item.id === targetId)
      
      if (targetIndex !== -1) {
        // Insert after target item
        const newCanvasItems = [...canvasItems]
        newCanvasItems.splice(targetIndex + 1, 0, newWidget)
        replaceCanvasItems(newCanvasItems)
      } else {
        // Add to end if target not found
        replaceCanvasItems([...canvasItems, newWidget])
      }
      return
    }
    
    // Handle standalone widget drop into section area (the missing scenario!)
    if ((active.data?.current?.type === 'standalone-widget' || 
         !active.data?.current?.type || 
         active.data?.current?.type === 'sortable') && 
        over.data?.current?.type === 'section-area') {
      console.log('✅ Standalone widget dropped into section area!')
      
      // Get widget from drag data if available, otherwise find by ID
      let widget: Widget
      if (active.data?.current?.type === 'standalone-widget') {
        widget = active.data.current.widget
      } else {
        const widgetId = active.id as string
        const { canvasItems } = usePageStore.getState()
        const foundWidget = canvasItems.find(item => item.id === widgetId && !isSection(item))
        if (!foundWidget) {
          console.log('❌ Standalone widget not found')
          return
        }
        widget = foundWidget as Widget
      }
      
      const sectionId = over.data.current.sectionId
      const areaId = over.data.current.areaId
      const { replaceCanvasItems, canvasItems } = usePageStore.getState()
      
      // Remove widget from canvas and add to section area
      const newCanvasItems = canvasItems.filter(item => item.id !== widget.id)
      const updatedCanvasItems = newCanvasItems.map(canvasItem => {
        if (canvasItem.type === 'content-block' && canvasItem.id === sectionId) {
          const updatedWidget = { ...widget, sectionId: sectionId }
          return {
            ...canvasItem,
            areas: canvasItem.areas.map(area => 
              area.id === areaId 
                ? { ...area, widgets: [...area.widgets, updatedWidget] }
                : area
            )
          }
        }
        return canvasItem
      })
      replaceCanvasItems(updatedCanvasItems)
      return
    }
    
    // Handle section widget movement - PRIORITY: section-widget drags should never go to canvas reordering
    if (active.data?.current?.type === 'section-widget') {
      console.log('🚀 Section widget detected, checking drop location...', { 
        overId: over?.id, 
        overType: over?.data?.current?.type,
        overData: over?.data?.current 
      })
      
      // Case 1: Dropped on specific section area (preferred)
      if (over?.data?.current?.type === 'section-area') {
        console.log('✅ Moving widget to specific section area!')
        const draggedWidget = active.data.current.widget
        const fromSectionId = active.data.current.fromSectionId
        const fromAreaId = active.data.current.fromAreaId
        const toSectionId = over.data.current.sectionId
        const toAreaId = over.data.current.areaId
        
        // Don't do anything if dropping in the same area
        if (fromAreaId === toAreaId) {
          console.log('⚠️ Same area, no action needed')
          return
        }
        
        const { replaceCanvasItems, canvasItems } = usePageStore.getState()
        const updatedCanvasItems = canvasItems.map(canvasItem => {
          if (canvasItem.type === 'content-block') {
            return {
              ...canvasItem,
              areas: canvasItem.areas.map(area => {
                // Remove from source area
                if (area.id === fromAreaId) {
                  return { ...area, widgets: area.widgets.filter(w => w.id !== draggedWidget.id) }
                }
                // Add to target area with updated sectionId
                if (area.id === toAreaId) {
                  const updatedWidget = { ...draggedWidget, sectionId: toSectionId }
                  return { ...area, widgets: [...area.widgets, updatedWidget] }
                }
                return area
              })
            }
          }
          return canvasItem
        })
        replaceCanvasItems(updatedCanvasItems)
        console.log('✅ Widget moved between sections!')
        return
      }
      
      // Case 2: Dropped on section itself (find first available area)
      if (over?.id && typeof over.id === 'string' && over.id.endsWith('-section')) {
        console.log('✅ Moving widget to section (first available area)!', { targetSectionId: over.id })
        const draggedWidget = active.data.current.widget
        const fromSectionId = active.data.current.fromSectionId
        const fromAreaId = active.data.current.fromAreaId
        const targetSectionId = over.id
        
        console.log('🎯 Cross-section move details:', {
          widgetId: draggedWidget.id,
          fromSectionId,
          fromAreaId,
          targetSectionId,
          isSameSection: fromSectionId === targetSectionId
        })
        
        // If dropping in the same section, don't do anything
        if (fromSectionId === targetSectionId) {
          console.log('⚠️ Same section, no action needed')
          return
        }
        
        const { replaceCanvasItems, canvasItems } = usePageStore.getState()
        
        // Find the target section and its first area
        const targetSection = canvasItems.find(item => item.id === targetSectionId && item.type === 'content-block') as WidgetSection
        if (!targetSection || !targetSection.areas.length) {
          console.log('❌ Target section not found or has no areas')
          return
        }
        
        const firstAreaId = targetSection.areas[0].id
        console.log('🎯 Target section found, first area:', firstAreaId)
        
        const updatedCanvasItems = canvasItems.map(canvasItem => {
          if (canvasItem.type === 'content-block') {
            return {
              ...canvasItem,
              areas: canvasItem.areas.map(area => {
                // Remove from source area
                if (area.id === fromAreaId) {
                  return { ...area, widgets: area.widgets.filter(w => w.id !== draggedWidget.id) }
                }
                // Add to target area (first area of target section)
                if (area.id === firstAreaId) {
                  const updatedWidget = { ...draggedWidget, sectionId: targetSectionId }
                  return { ...area, widgets: [...area.widgets, updatedWidget] }
                }
                return area
              })
            }
          }
          return canvasItem
        })
        replaceCanvasItems(updatedCanvasItems)
        console.log('✅ Widget moved to section first area!')
        return
      }
      
      // Case 3: Section widget dropped somewhere invalid - just return without doing anything
      console.log('⚠️ Section widget dropped in invalid location, ignoring')
      return
    }

    // Handle existing canvas item reordering (sections and standalone widgets) - EXCLUDE section-widgets!
    if (!active.data?.current?.type || 
        active.data?.current?.type === 'canvas-section' ||
        active.data?.current?.type === 'canvas-widget' ||
        active.data?.current?.type === 'standalone-widget' ||
        (active.data?.current?.type !== 'library-widget' && 
         active.data?.current?.type !== 'section-widget')) {
      console.log('🔄 Attempting canvas item reordering for canvas items')
      
      // For standalone-widget type, use the original sortable ID for comparison
      const activeItemId = active.data?.current?.type === 'standalone-widget' 
        ? active.data.current.originalSortableId 
        : active.id
      
      // If dropping over a section area, get the section ID instead of the drop zone ID
      let targetId = over.id
      if (over.data?.current?.type === 'section-area' && over.data?.current?.sectionId) {
        targetId = over.data.current.sectionId
        console.log('🎯 Section dragged over section area, using section ID:', targetId)
      }
      
      if (activeItemId !== targetId) {
        const { moveItem } = usePageStore.getState()
        const oldIndex = canvasItems.findIndex((item) => item.id === activeItemId)
        const newIndex = canvasItems.findIndex((item) => item.id === targetId)
        
        console.log('📋 Canvas reorder:', { oldIndex, newIndex, activeItemId, targetId, originalOverId: over.id })
        
        if (oldIndex !== -1 && newIndex !== -1) {
          console.log('✅ Canvas item reordered!')
          moveItem(oldIndex, newIndex)
        } else {
          console.log('❌ Canvas item reorder failed - items not found')
        }
      }
    }
  }

  const handleAddSection = (relativeTo: string, position: 'above' | 'below') => {
    setInsertPosition({ relativeTo, position })
    setShowLayoutPicker(true)
  }

  const handleSelectLayout = (layout: ContentBlockLayout) => {
    createContentBlockWithLayout(layout)
    setShowLayoutPicker(false)
  }

  const handleSectionClick = (sectionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    // Close any widget toolbar and toggle section toolbar
    setActiveWidgetToolbar(null)
    handleSetActiveSectionToolbar(activeSectionToolbar === sectionId ? null : sectionId)
    selectWidget(sectionId)
  }

  const handleWidgetClick = (widgetId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    console.log('🖱️ Widget clicked for properties:', { widgetId })
    
    // Find the widget to check its sectionId - use same logic as Properties Panel
    let widget: Widget | undefined = canvasItems.find(item => item.id === widgetId && !isSection(item)) as Widget
    
    // If not found at canvas level, search within section areas
    if (!widget) {
      for (const canvasItem of canvasItems) {
        if (isSection(canvasItem)) {
          for (const area of canvasItem.areas) {
            const foundWidget = area.widgets.find(w => w.id === widgetId)
            if (foundWidget) {
              widget = foundWidget
              break
            }
          }
          if (widget) break
        }
      }
    }
    
    if (widget) {
      console.log('📋 Widget found for properties:', { 
        id: widget.id, 
        type: widget.type,
        sectionId: widget.sectionId || 'standalone'
      })
    } else {
      console.log('❌ Widget not found for properties:', { widgetId })
    }
    
    // Only close section toolbar if widget is not part of the currently active section
    if (!widget?.sectionId || activeSectionToolbar !== widget.sectionId) {
      handleSetActiveSectionToolbar(null)
    }
    
    setActiveWidgetToolbar(activeWidgetToolbar === widgetId ? null : widgetId)
    selectWidget(widgetId)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={customCollisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div 
        className="h-screen bg-slate-50 flex overflow-hidden"
        onClick={(e) => {
          // Only close toolbars if clicking directly on this div, not on children
          if (e.target === e.currentTarget) {
            handleSetActiveSectionToolbar(null)
            setActiveWidgetToolbar(null)
          }
        }}
      >
        {/* Left Sidebar - Sticky */}
        <div className="w-80 bg-slate-100 shadow-sm border-r border-slate-200 flex flex-col sticky top-0 h-screen">
          {/* Tabs */}
          <div className="border-b border-slate-200">
            <div className="flex">
              {[
                { id: 'library', label: 'Library', icon: BookOpen },
                { id: 'sections', label: 'Sections', icon: Plus },
                { id: 'diy-zone', label: 'DIY Zone', icon: Lightbulb }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setLeftSidebarTab(tab.id as LeftSidebarTab)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    leftSidebarTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {leftSidebarTab === 'library' && <WidgetLibrary />}
            {leftSidebarTab === 'sections' && <SectionsContent showToast={showToast} />}
            {leftSidebarTab === 'diy-zone' && <DIYZoneContent showToast={showToast} />}
          </div>
        </div>

        {/* Main Canvas Area - Scrollable */}
        <div className="flex-1 flex flex-col h-screen overflow-y-auto">
          <div className="border-b bg-white px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Page Builder</h1>
              <button
                onClick={() => setCurrentView('design-console')}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                <Settings className="w-4 h-4" />
                Design System Console
              </button>
            </div>
          </div>

          <div className="flex-1 p-6 bg-slate-50" onClick={() => selectWidget(null)}>
            {/* Template Context Bar - Only show in template editing mode */}
            {usePageStore(state => state.editingContext) === 'template' && (
              <div className="mb-3 flex items-center justify-between py-2 px-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-amber-600">✨ Template Mode</span>
                  <span className="text-amber-500">•</span>
                  <span className="text-amber-600">Modification indicators visible</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const { setCurrentView, setSiteManagerView, setEditingContext } = usePageStore.getState()
                      setCurrentView('design-console')
                      setSiteManagerView('modernist-theme-templates')
                      setEditingContext('page')
                    }}
                    className="text-xs text-amber-600 hover:text-amber-800 underline"
                  >
                    Back to Templates
                  </button>
                  <span className="text-amber-400">|</span>
                  <button
                    onClick={() => {
                      const { setEditingContext } = usePageStore.getState()
                      setEditingContext('page')
                    }}
                    className="text-xs text-amber-600 hover:text-amber-800 underline"
                  >
                    Switch to Page Mode
                  </button>
                </div>
              </div>
            )}
            
            {/* Regular Page Editing Context - Show minimal info */}
            {usePageStore(state => state.editingContext) === 'page' && (
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Editing: <strong>Wiley Online Library Homepage</strong>
                </div>
                <button
                  onClick={() => {
                    const { setEditingContext } = usePageStore.getState()
                    setEditingContext('template')
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  Switch to Template Mode
                </button>
              </div>
            )}
            
            <CanvasThemeProvider>
              <div className="bg-white border border-slate-200 rounded-lg min-h-96 relative shadow-sm">
              {canvasItems.length === 0 ? (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center text-gray-500">
                    <p className="text-lg mb-2">Start building your page</p>
                    <p className="text-sm">Drag widgets from the library to get started</p>
                  </div>
                </div>
              ) : (
                <SortableContext items={canvasItems} strategy={verticalListSortingStrategy}>
                  <div className="relative">
                    {canvasItems.map((item, index) => (
                      <div key={item.id} className="relative group">
                        {/* Add Section Button Above */}
                        {item.id !== 'header-section' && (
                          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <button
                              onClick={() => handleAddSection(item.id, 'above')}
                              className="px-3 py-1 bg-white border border-gray-300 text-gray-600 text-sm rounded-md hover:bg-gray-50 transition-colors"
                            >
                              Add Section
                            </button>
                          </div>
                        )}
                        
                        <SortableItem 
                          item={item} 
                          isSelected={selectedWidget === item.id}
                          onSectionClick={handleSectionClick}
                          onWidgetClick={handleWidgetClick}
                          activeSectionToolbar={activeSectionToolbar}
                          setActiveSectionToolbar={handleSetActiveSectionToolbar}
                          activeWidgetToolbar={activeWidgetToolbar}
                          setActiveWidgetToolbar={setActiveWidgetToolbar}
                          activeDropZone={activeDropZone}
                          showToast={showToast}
                          instanceId={instanceId}
                        />
                        
                        {/* Add Section Button Below */}
                        {index === canvasItems.length - 1 && (
                          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <button
                              onClick={() => handleAddSection(item.id, 'below')}
                              className="px-3 py-1 bg-white border border-gray-300 text-gray-600 text-sm rounded-md hover:bg-gray-50 transition-colors"
                            >
                              Add Section
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </SortableContext>
              )}
              </div>
            </CanvasThemeProvider>
          </div>
        </div>

      {/* Right Sidebar - Properties Panel - Sticky */}
      <div className="w-80 bg-slate-100 shadow-sm border-l border-slate-200 flex flex-col sticky top-0 h-screen">
        <div className="border-b border-slate-200 p-4">
          <h2 className="font-semibold text-slate-800">Properties</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          <PropertiesPanel />
        </div>
      </div>

      {/* Layout Picker Modal */}
      {showLayoutPicker && (
        <LayoutPicker
          onSelectLayout={handleSelectLayout}
          onClose={() => setShowLayoutPicker(false)}
        />
      )}
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg transition-all transform ${
          toast.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center gap-2">
            {toast.type === 'success' ? (
              <Check className="w-4 h-4" />
            ) : (
              <X className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        </div>
      )}
      </div>
    </DndContext>
  )
}

// Website Settings Component
function WebsiteSettings({ websiteId }: { websiteId: string }) {
  const { websites, updateWebsite } = usePageStore()
  const website = websites.find(w => w.id === websiteId)
  
  if (!website) {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Website Not Found</h3>
        <p className="text-gray-600">Could not find website with ID: {websiteId}</p>
      </div>
    )
  }

  const handlePurposeUpdate = (field: string, value: any) => {
    const updatedWebsite = {
      ...website,
      purpose: {
        contentTypes: [],
        hasSubjectOrganization: false,
        publishingTypes: [],
        ...website.purpose,
        [field]: value
      },
      updatedAt: new Date()
    }
    updateWebsite(website.id, updatedWebsite)
  }

  const handleContentTypeToggle = (contentType: string) => {
    const currentTypes = website.purpose?.contentTypes || []
    const newTypes = currentTypes.includes(contentType)
      ? currentTypes.filter(type => type !== contentType)
      : [...currentTypes, contentType]
    
    handlePurposeUpdate('contentTypes', newTypes)
  }

  const handlePublishingTypeToggle = (publishingType: string) => {
    const currentTypes = website.purpose?.publishingTypes || []
    const newTypes = currentTypes.includes(publishingType)
      ? currentTypes.filter(type => type !== publishingType)
      : [...currentTypes, publishingType]
    
    handlePurposeUpdate('publishingTypes', newTypes)
  }

  const handleBrandingUpdate = (field: string, value: string) => {
    const updatedWebsite = {
      ...website,
      branding: {
        ...website.branding,
        [field]: value
      },
      updatedAt: new Date()
    }
    updateWebsite(website.id, updatedWebsite)
  }

  const handleBasicUpdate = (field: string, value: any) => {
    const updatedWebsite = {
      ...website,
      [field]: value,
      updatedAt: new Date()
    }
    updateWebsite(website.id, updatedWebsite)
  }

  const contentTypes = [
    { id: 'journals', label: 'Journals', description: 'Academic journals and research publications' },
    { id: 'books', label: 'Books', description: 'eBooks, textbooks, monographs, and reference works' },
    { id: 'conferences', label: 'Conference Proceedings', description: 'Conference papers, abstracts, and presentations' },
    { id: 'magazines', label: 'Magazines', description: 'Popular magazines and trade publications' },
    { id: 'newsletters', label: 'Newsletters', description: 'Periodic newsletters and bulletins' },
    { id: 'reports', label: 'Reports', description: 'Technical reports and white papers' }
  ]

  const websiteTypes = [
    { id: 'single-journal', label: 'Single Journal Website', description: 'Dedicated site for one specific journal' },
    { id: 'journal-hub', label: 'Hub of Journals', description: 'Portal hosting multiple related journals' },
    { id: 'digital-library', label: 'Digital Library', description: 'Comprehensive library of journals, books, and resources' },
    { id: 'publisher-portal', label: 'Publisher Portal', description: 'Main website for a publishing organization' },
    { id: 'conference-site', label: 'Conference Website', description: 'Dedicated site for conference proceedings and events' }
  ]

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Website Name</label>
            <input
              type="text"
              value={website.name}
              onChange={(e) => handleBasicUpdate('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Domain</label>
            <input
              type="url"
              value={website.domain}
              onChange={(e) => handleBasicUpdate('domain', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            value={website.status}
            onChange={(e) => handleBasicUpdate('status', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="active">Active</option>
            <option value="staging">Staging</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      {/* Website Purpose Configuration */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Website Purpose & Content Types</h3>
        <p className="text-gray-600 mb-6">Define what type of content this website publishes and how it should be organized.</p>
        
        {/* Website Type Selection */}
        <div className="mb-8">
          <h4 className="text-base font-medium text-gray-900 mb-4">Website Type</h4>
          <p className="text-sm text-gray-600 mb-4">Choose the primary purpose and structure of this website:</p>
          <div className="space-y-3">
            {websiteTypes.map((type) => (
              <label key={type.id} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name={`website-type-${website.id}`}
                  checked={website.purpose?.publishingTypes?.includes(type.id) || false}
                  onChange={() => {
                    // For radio buttons, set only this type
                    handlePurposeUpdate('publishingTypes', [type.id])
                  }}
                  className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500 mt-0.5"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{type.label}</div>
                  <div className="text-sm text-gray-600">{type.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Content Types */}
        <div className="mb-8">
          <h4 className="text-base font-medium text-gray-900 mb-4">Content Types Published</h4>
          <p className="text-sm text-gray-600 mb-4">Select all types of content that will be published on this website:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {contentTypes.map((contentType) => (
              <label key={contentType.id} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={website.purpose?.contentTypes?.includes(contentType.id) || false}
                  onChange={() => handleContentTypeToggle(contentType.id)}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{contentType.label}</div>
                  <div className="text-xs text-gray-600">{contentType.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Subject Organization */}
        <div className="mb-6">
          <h4 className="text-base font-medium text-gray-900 mb-4">Content Organization</h4>
          <div className="space-y-3">
            <label className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name={`subject-org-${website.id}`}
                checked={website.purpose?.hasSubjectOrganization === true}
                onChange={() => handlePurposeUpdate('hasSubjectOrganization', true)}
                className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500 mt-0.5"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">Enable Subject-Based Organization</div>
                <div className="text-sm text-gray-600">Content organized by subject areas, categories, and taxonomy with advanced filtering</div>
              </div>
            </label>
            <label className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name={`subject-org-${website.id}`}
                checked={website.purpose?.hasSubjectOrganization === false}
                onChange={() => handlePurposeUpdate('hasSubjectOrganization', false)}
                className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500 mt-0.5"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">Simple Organization</div>
                <div className="text-sm text-gray-600">Basic content organization without subject-based categorization</div>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Branding Customizations */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Branding & Visual Identity</h3>
        <p className="text-gray-600 mb-6">Customize colors, fonts, and visual elements to match your brand identity.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Primary Brand Color</label>
            <div className="flex gap-3">
              <input
                type="color"
                value={website.branding.primaryColor || '#3B82F6'}
                onChange={(e) => handleBrandingUpdate('primaryColor', e.target.value)}
                className="w-12 h-10 border border-gray-300 rounded-md"
              />
              <input
                type="text"
                value={website.branding.primaryColor || ''}
                onChange={(e) => handleBrandingUpdate('primaryColor', e.target.value)}
                placeholder="e.g., #3B82F6"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
            <div className="flex gap-3">
              <input
                type="color"
                value={website.branding.secondaryColor || '#64748B'}
                onChange={(e) => handleBrandingUpdate('secondaryColor', e.target.value)}
                className="w-12 h-10 border border-gray-300 rounded-md"
              />
              <input
                type="text"
                value={website.branding.secondaryColor || ''}
                onChange={(e) => handleBrandingUpdate('secondaryColor', e.target.value)}
                placeholder="e.g., #64748B"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Logo URL</label>
            <input
              type="url"
              value={website.branding.logoUrl || ''}
              onChange={(e) => handleBrandingUpdate('logoUrl', e.target.value)}
              placeholder="https://example.com/logo.svg"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Custom Font Family</label>
            <input
              type="text"
              value={website.branding.fontFamily || ''}
              onChange={(e) => handleBrandingUpdate('fontFamily', e.target.value)}
              placeholder="e.g., 'Inter', 'Roboto', 'Arial'"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Current Configuration Summary */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Current Configuration Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-blue-800">Website Type:</span>
            <span className="text-blue-700 ml-2">
              {website.purpose?.publishingTypes?.length 
                ? websiteTypes.find(t => website.purpose?.publishingTypes?.includes(t.id))?.label || 'Not specified'
                : 'Not specified'
              }
            </span>
          </div>
          <div>
            <span className="font-medium text-blue-800">Content Types:</span>
            <span className="text-blue-700 ml-2">
              {website.purpose?.contentTypes?.length 
                ? website.purpose.contentTypes.map(type => 
                    contentTypes.find(ct => ct.id === type)?.label || type
                  ).join(', ')
                : 'Not specified'
              }
            </span>
          </div>
          <div>
            <span className="font-medium text-blue-800">Subject Organization:</span>
            <span className="text-blue-700 ml-2">
              {website.purpose?.hasSubjectOrganization ? 'Enabled' : 'Simple'}
            </span>
          </div>
          <div>
            <span className="font-medium text-blue-800">Status:</span>
            <span className="text-blue-700 ml-2 capitalize">{website.status}</span>
          </div>
          <div>
            <span className="font-medium text-blue-800">Theme Deviation:</span>
            <span className="text-blue-700 ml-2">{website.deviationScore}%</span>
          </div>
          <div>
            <span className="font-medium text-blue-800">Last Updated:</span>
            <span className="text-blue-700 ml-2">{website.updatedAt.toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function SortableItem({ 
  item, 
  isSelected, 
  onSectionClick, 
  onWidgetClick,
  activeSectionToolbar,
  setActiveSectionToolbar,
  activeWidgetToolbar,
  setActiveWidgetToolbar,
  activeDropZone,
  showToast,
  instanceId
}: { 
  item: CanvasItem
  isSelected: boolean
  onSectionClick: (id: string, e: React.MouseEvent) => void
  onWidgetClick: (id: string, e: React.MouseEvent) => void
  activeSectionToolbar: string | null
  setActiveSectionToolbar: (value: string | null) => void
  activeWidgetToolbar: string | null
  setActiveWidgetToolbar: (value: string | null) => void
  activeDropZone: string | null
  showToast: (message: string, type: 'success' | 'error') => void
  instanceId: string
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ 
    id: item.id,
    data: {
      type: isSection(item) ? 'canvas-section' : 'canvas-widget',
      item: item
    }
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const getSectionName = (item: WidgetSection) => {
    const specialSections: Record<string, string> = {
      'header-section': 'Header',
      'hero-section': 'Hero', 
      'footer-section': 'Footer',
      'features-section': 'Features'
    }
    return specialSections[item.id] || 'Section'
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`group relative border-2 transition-all ${
        isSelected 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-transparent hover:border-gray-200'
      }`}
    >
      
      {isSection(item) ? (
        <div 
          onClick={(e) => onSectionClick(item.id, e)}
          className="cursor-pointer"
        >
          {/* Section Selection Indicator */}
          {isSelected && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
          )}
          {isSelected && (
            <div className="absolute -left-16 top-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium z-10">
              {getSectionName(item)}
            </div>
          )}
          
          <SectionRenderer 
            section={item} 
            onWidgetClick={onWidgetClick}
            dragAttributes={attributes}
            dragListeners={listeners}
            activeSectionToolbar={activeSectionToolbar}
            setActiveSectionToolbar={setActiveSectionToolbar}
            activeWidgetToolbar={activeWidgetToolbar}
            setActiveWidgetToolbar={setActiveWidgetToolbar}
            activeDropZone={activeDropZone}
            showToast={showToast}
            instanceId={instanceId}
          />
        </div>
      ) : (
        <div className="cursor-pointer hover:ring-2 hover:ring-blue-300 rounded transition-all relative">
          {/* Overlay to capture clicks on interactive widgets */}
          <div 
            className="absolute inset-0 z-10 bg-transparent hover:bg-blue-50/10 transition-colors"
            style={{ pointerEvents: 'auto' }}
            onClick={(e) => {
              e.stopPropagation()
              console.log('🎯 Standalone overlay click detected:', { 
                widgetId: item.id, 
                widgetType: item.type 
              })
              // Close any section toolbar and toggle widget toolbar
              setActiveSectionToolbar?.(null)
              setActiveWidgetToolbar(activeWidgetToolbar === item.id ? null : item.id)
              onWidgetClick(item.id, e)
            }}
          />
          {/* Standalone Widget Action Toolbar - appears on click */}
          {activeWidgetToolbar === item.id && (
            <div className="absolute -top-2 -right-2 transition-opacity z-20" style={{ pointerEvents: 'auto' }}>
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg shadow-lg px-2 py-1">
              <StandaloneWidgetDragHandle 
                widget={item}
                sortableAttributes={attributes}
                sortableListeners={listeners}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  // Duplicate standalone widget
                  const { replaceCanvasItems, canvasItems } = usePageStore.getState()
                  const itemIndex = canvasItems.findIndex(canvasItem => canvasItem.id === item.id)
                  if (itemIndex !== -1) {
                    const duplicatedWidget = { ...item, id: crypto.randomUUID() }
                    const newCanvasItems = [...canvasItems]
                    newCanvasItems.splice(itemIndex + 1, 0, duplicatedWidget)
                    replaceCanvasItems(newCanvasItems)
                  }
                }}
                className="p-1 text-gray-500 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors"
                title="Duplicate widget"
              >
                <Copy className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onWidgetClick(item.id, e)
                }}
                className="p-1 text-gray-500 hover:text-purple-600 rounded hover:bg-purple-50 transition-colors"
                title="Properties"
              >
                <Edit className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  const { deleteWidget } = usePageStore.getState()
                  deleteWidget(item.id)
                }}
                className="p-1 text-gray-500 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                title="Delete widget"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
          )}
          
          {/* Make widget content non-interactive in edit mode */}
          <div style={{ pointerEvents: 'none', position: 'relative', zIndex: 1 }}>
            <WidgetRenderer 
              widget={item}
              dragAttributes={attributes}
              dragListeners={listeners}
              onWidgetClick={onWidgetClick}
              activeSectionToolbar={activeSectionToolbar}
              setActiveSectionToolbar={setActiveSectionToolbar}
              activeWidgetToolbar={activeWidgetToolbar}
              setActiveWidgetToolbar={setActiveWidgetToolbar}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// Standalone Widget Drag Handle - uses useDraggable for section drops AND canvas reordering
function StandaloneWidgetDragHandle({ 
  widget, 
  sortableAttributes, 
  sortableListeners 
}: {
  widget: Widget
  sortableAttributes: any
  sortableListeners: any
}) {
  // Use draggable instead of sortable to enable section drops
  const drag = useDraggable({
    id: `standalone-widget-${widget.id}`,
    data: {
      type: 'standalone-widget',
      widget: widget,
      originalSortableId: widget.id // Keep reference for canvas reordering
    }
  })
  
  return (
    <div 
      ref={drag.setNodeRef}
      style={drag.transform ? {
        transform: `translate3d(${drag.transform.x}px, ${drag.transform.y}px, 0)`,
      } : undefined}
      className={`p-1 text-gray-500 hover:text-gray-700 cursor-grab active:cursor-grabbing rounded hover:bg-gray-100 transition-colors ${
        drag.isDragging ? 'opacity-50' : ''
      }`}
      title="Drag to reorder or move to section"
      {...drag.attributes}
      {...drag.listeners}
    >
      <GripVertical className="w-3 h-3" />
    </div>
  )
}

// Draggable Widget Within Section Component (fixes hooks rule violation)
function DraggableWidgetInSection({ 
  widget, 
  sectionId, 
  areaId, 
  activeSectionToolbar, 
  setActiveSectionToolbar, 
  activeWidgetToolbar, 
  setActiveWidgetToolbar, 
  onWidgetClick 
}: {
  widget: Widget
  sectionId: string
  areaId: string
  activeSectionToolbar?: string | null
  setActiveSectionToolbar?: (value: string | null) => void
  activeWidgetToolbar: string | null
  setActiveWidgetToolbar: (value: string | null) => void
  onWidgetClick: (id: string, e: React.MouseEvent) => void
}) {
  // Each widget gets its own draggable hook - no hooks rule violation
  const widgetDrag = useDraggable({
    id: `widget-${widget.id}`,
    data: {
      type: 'section-widget',
      widget: widget,
      fromSectionId: sectionId,
      fromAreaId: areaId
    }
  })
  
  return (
    <div 
      ref={widgetDrag.setNodeRef}
      style={widgetDrag.transform ? {
        transform: `translate3d(${widgetDrag.transform.x}px, ${widgetDrag.transform.y}px, 0)`,
      } : undefined}
      className={`cursor-pointer hover:ring-2 hover:ring-blue-300 rounded transition-all group relative ${
        widgetDrag.isDragging ? 'opacity-50' : ''
      }`}
    >
      {/* Overlay to capture clicks on interactive widgets */}
      <div 
        className="absolute inset-0 z-10 bg-transparent hover:bg-blue-50/10 transition-colors"
        style={{ pointerEvents: 'auto' }}
        onClick={(e) => {
          e.stopPropagation()
          console.log('🎯 Overlay click detected:', { 
            widgetId: widget.id, 
            widgetType: widget.type 
          })
          // Only close section toolbar if it's not for the current widget's section
          if (activeSectionToolbar !== widget.sectionId) {
            setActiveSectionToolbar?.(null)
          }
          setActiveWidgetToolbar(activeWidgetToolbar === widget.id ? null : widget.id)
          onWidgetClick(widget.id, e)
        }}
      />
      {/* Widget Action Toolbar - appears on click (outside non-interactive area) */}
      {activeWidgetToolbar === widget.id && (
        <div className="absolute -top-2 -right-2 transition-opacity z-20" style={{ pointerEvents: 'auto' }}>
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg shadow-lg px-2 py-1">
            <div 
              {...widgetDrag.attributes}
              {...widgetDrag.listeners}
              className="p-1 text-gray-500 hover:text-gray-700 cursor-grab active:cursor-grabbing rounded hover:bg-gray-100 transition-colors"
              title="Drag to move widget between sections"
            >
              <GripVertical className="w-3 h-3" />
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                // Duplicate widget logic
                const { replaceCanvasItems, canvasItems } = usePageStore.getState()
                const duplicatedWidget = { ...widget, id: crypto.randomUUID() }
                
                const updatedCanvasItems = canvasItems.map(canvasItem => {
                  if (isSection(canvasItem)) {
                    return {
                      ...canvasItem,
                      areas: canvasItem.areas.map(area => 
                        area.widgets.some(w => w.id === widget.id)
                          ? { ...area, widgets: [...area.widgets, duplicatedWidget] }
                          : area
                      )
                    }
                  }
                  return canvasItem
                })
                replaceCanvasItems(updatedCanvasItems)
              }}
              className="p-1 text-gray-500 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors"
              title="Duplicate widget"
            >
              <Copy className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onWidgetClick(widget.id, e)
              }}
              className="p-1 text-gray-500 hover:text-purple-600 rounded hover:bg-purple-50 transition-colors"
              title="Properties"
            >
              <Edit className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                const { deleteWidget } = usePageStore.getState()
                deleteWidget(widget.id)
              }}
              className="p-1 text-gray-500 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
              title="Delete widget"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
      
      {/* Modification Indicator - Only show in template editing mode */}
      {(widget as any).isModified && usePageStore.getState().editingContext === 'template' && (
        <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 z-30">
          <span className="text-[10px] font-medium">🔧 Modified</span>
        </div>
      )}
      
      {/* Make widget content non-interactive in edit mode */}
      <div style={{ pointerEvents: 'none', position: 'relative', zIndex: 1 }}>
        <WidgetRenderer 
          widget={widget} 
          onWidgetClick={onWidgetClick}
          activeSectionToolbar={activeSectionToolbar}
          setActiveSectionToolbar={setActiveSectionToolbar}
          activeWidgetToolbar={activeWidgetToolbar}
          setActiveWidgetToolbar={setActiveWidgetToolbar}
        />
      </div>
    </div>
  )
}

function SectionRenderer({ 
  section, 
  onWidgetClick,
  dragAttributes,
  dragListeners,
  activeSectionToolbar,
  setActiveSectionToolbar,
  activeWidgetToolbar,
  setActiveWidgetToolbar,
  activeDropZone,
  showToast,
  instanceId
}: { 
  section: WidgetSection
  onWidgetClick: (id: string, e: React.MouseEvent) => void
  dragAttributes?: any
  dragListeners?: any
  activeSectionToolbar: string | null
  setActiveSectionToolbar: (value: string | null) => void
  activeWidgetToolbar: string | null
  setActiveWidgetToolbar: (value: string | null) => void
  activeDropZone: string | null
  showToast: (message: string, type: 'success' | 'error') => void
  instanceId: string
}) {
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [sectionName, setSectionName] = useState('')
  const [sectionDescription, setSectionDescription] = useState('')
  
  const getLayoutClasses = (layout: ContentBlockLayout) => {
    switch (layout) {
      case 'one-column':
        return 'grid-cols-1'
      case 'two-columns':
        return 'grid-cols-2'
      case 'three-columns':
        return 'grid-cols-3'
      case 'one-third-left':
        return 'grid-cols-3 [&>:first-child]:col-span-1 [&>:last-child]:col-span-2'
      case 'one-third-right':
        return 'grid-cols-3 [&>:first-child]:col-span-2 [&>:last-child]:col-span-1'
      case 'vertical':
        return 'grid-cols-1'
      default:
        return 'grid-cols-1'
    }
  }

  const isSpecialSection = ['header-section', 'hero-section', 'footer-section', 'features-section'].includes(section.id)

  const handleSaveSection = () => {
    if (sectionName.trim()) {
      const { addCustomSection } = usePageStore.getState()
      
      // Count widgets in the section for better metadata
      const widgetCount = section.areas.reduce((count, area) => count + area.widgets.length, 0)
      
      const customSection = {
        id: crypto.randomUUID(),
        name: sectionName.trim(),
        description: sectionDescription.trim() || 'Custom saved section',
        widgets: section.areas.flatMap(area => area.widgets), // Store flattened widget list for easier counting
        section: {
          ...section,
          id: crypto.randomUUID() // Generate new ID for the saved section
        }
      }
      addCustomSection(customSection)
      setShowSaveModal(false)
      setSectionName('')
      setSectionDescription('')
      
      // Show success notification
      showToast(`"${sectionName.trim()}" saved successfully with ${widgetCount} widget${widgetCount !== 1 ? 's' : ''}!`, 'success')
    }
  }

  const handleDuplicateSection = () => {
    const { replaceCanvasItems, canvasItems } = usePageStore.getState()
    const sectionIndex = canvasItems.findIndex(item => item.id === section.id)
    
    if (sectionIndex !== -1) {
      const duplicatedSection = JSON.parse(JSON.stringify(section))
      duplicatedSection.id = crypto.randomUUID()
      // Update all widget IDs in the duplicated section
      duplicatedSection.areas = duplicatedSection.areas.map((area: any) => ({
        ...area,
        id: crypto.randomUUID(),
        widgets: area.widgets.map((widget: any) => ({
          ...widget,
          id: crypto.randomUUID(),
          sectionId: duplicatedSection.id
        }))
      }))
      
      const newCanvasItems = [...canvasItems]
      newCanvasItems.splice(sectionIndex + 1, 0, duplicatedSection)
      replaceCanvasItems(newCanvasItems)
      
      // Show success notification
      const widgetCount = section.areas.reduce((count, area) => count + area.widgets.length, 0)
      showToast(`Section duplicated successfully with ${widgetCount} widget${widgetCount !== 1 ? 's' : ''}!`, 'success')
    }
  }

  return (
    <>
      <div 
        className={`group ${isSpecialSection ? 'p-2 hover:bg-gray-50 border-2 border-transparent hover:border-blue-200' : 'border-2 border-purple-200 bg-purple-50 p-2 rounded hover:border-blue-400 hover:bg-purple-100'} transition-all relative cursor-grab active:cursor-grabbing`}
        onClick={(e) => {
          e.stopPropagation()
          const newValue = activeSectionToolbar === section.id ? null : section.id
          // Close any widget toolbar and toggle section toolbar
          setActiveWidgetToolbar(null)
          setActiveSectionToolbar(newValue)
          // Select the section for properties panel (use selectWidget directly)
          const { selectWidget } = usePageStore.getState()
          selectWidget(section.id)
        }}
        {...dragAttributes}
        {...dragListeners}
      >
        {/* Section Action Toolbar - appears on click */}
        {activeSectionToolbar === section.id && (
          <div className="absolute -top-2 -right-2 transition-opacity z-20">
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg shadow-lg px-2 py-1">
              <div 
                {...dragAttributes}
                {...dragListeners}
                className="p-1 text-gray-500 hover:text-gray-700 cursor-grab active:cursor-grabbing rounded hover:bg-gray-100 transition-colors"
                title="Drag to reorder section"
              >
                <GripVertical className="w-3 h-3" />
              </div>
              <button
                onClick={handleDuplicateSection}
                className="p-1 text-gray-500 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors"
                title="Duplicate section"
              >
                <Copy className="w-3 h-3" />
              </button>
              <button
                onClick={() => setShowSaveModal(true)}
                className="p-1 text-gray-500 hover:text-green-600 rounded hover:bg-green-50 transition-colors"
                title="Save as custom section"
              >
                <BookOpen className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  // Could add section properties/settings here in the future
                }}
                className="p-1 text-gray-500 hover:text-purple-600 rounded hover:bg-purple-50 transition-colors"
                title="Section properties"
              >
                <Edit className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  const { replaceCanvasItems, canvasItems } = usePageStore.getState()
                  const newCanvasItems = canvasItems.filter(item => item.id !== section.id)
                  replaceCanvasItems(newCanvasItems)
                }}
                className="p-1 text-gray-500 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                title="Delete section"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
        
        {!isSpecialSection && (
          <div className="flex items-center gap-2 mb-2 px-2">
            <span className="text-xs font-medium text-purple-700">Content Block</span>
            <span className="text-xs text-purple-600">{section.layout}</span>
            <span className="text-xs text-gray-500">(Click section to show toolbar)</span>
          </div>
        )}
      
      <div className={`grid gap-2 ${getLayoutClasses(section.layout)}`}>
        {section.areas.map((area) => {
          // Make area droppable for library widgets
          const { isOver, setNodeRef: setDropRef } = useDroppable({
            id: `drop-${area.id}`,
            data: {
              type: 'section-area',
              sectionId: section.id,
              areaId: area.id
            }
          })
          
          // Debug logging for drop zone
          React.useEffect(() => {
            if (isOver) {
              console.log('🎯 Drop zone active:', area.id, 'in section:', section.id)
            }
          }, [isOver, area.id, section.id])
          
          return (
          <div 
            ref={setDropRef}
            key={area.id} 
            className={`relative ${
              isSpecialSection 
                ? '' 
                : area.widgets.length === 0 
                  ? `min-h-20 border-2 border-dashed rounded p-4 bg-white transition-all ${
                      activeDropZone === `drop-${area.id}` 
                        ? 'border-green-400 bg-green-50 ring-2 ring-green-200' 
                        : isOver 
                        ? 'border-blue-400 bg-blue-50' 
                        : 'border-purple-300 opacity-60'
                    }` 
                  : activeDropZone === `drop-${area.id}` 
                    ? 'bg-green-50 rounded p-2 ring-2 ring-green-200 border-2 border-green-300' 
                    : activeDropZone === `drop-${area.id}` 
                      ? 'bg-green-50 rounded p-2 ring-2 ring-green-200 border-2 border-green-300' 
                      : 'bg-white rounded p-2'
            }`}
          >
            {!isSpecialSection && area.widgets.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <span className={`text-xs transition-colors ${
                  activeDropZone === `drop-${area.id}` 
                    ? 'text-green-700 font-bold' 
                    : isOver 
                    ? 'text-blue-600 font-medium' 
                    : 'text-purple-400'
                }`}>
                  {activeDropZone === `drop-${area.id}` 
                    ? 'ACTIVE DROP ZONE' 
                    : isOver 
                    ? 'Drop widget here' 
                    : 'Drop widgets here'}
                </span>
              </div>
            )}
            
            {/* Active Drop Zone Indicator for Populated Areas */}
            {area.widgets.length > 0 && activeDropZone === `drop-${area.id}` && (
              <div className="absolute top-1 right-1 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold z-10 shadow-lg">
                ACTIVE DROP ZONE
              </div>
            )}
            
            {area.widgets.map((widget) => (
              <DraggableWidgetInSection
                key={widget.id}
                widget={widget}
                sectionId={section.id}
                areaId={area.id}
                activeSectionToolbar={activeSectionToolbar}
                setActiveSectionToolbar={setActiveSectionToolbar}
                activeWidgetToolbar={activeWidgetToolbar}
                setActiveWidgetToolbar={setActiveWidgetToolbar}
                onWidgetClick={onWidgetClick}
              />
            ))}
          </div>
        )})}
      </div>
      </div>
      
      {/* Save Section Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
            <h3 className="text-lg font-semibold mb-4">Save Custom Section</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section Name *
                </label>
                <input
                  type="text"
                  value={sectionName}
                  onChange={(e) => setSectionName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter section name"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={sectionDescription}
                  onChange={(e) => setSectionDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md h-20 resize-none"
                  placeholder="Enter section description"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowSaveModal(false)
                  setSectionName('')
                  setSectionDescription('')
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSection}
                disabled={!sectionName.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Section
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Theme Publication Cards component - shows predefined OOB cards for each theme
function ThemePublicationCards({ themeId }: { themeId: string }) {
  // Mock cover images for realistic display
  const mockCovers = {
    // Journal Issue Covers
    issues: {
      digitalGovernment: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='260' viewBox='0 0 200 260'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' style='stop-color:%23667eea'/%3E%3Cstop offset='100%25' style='stop-color:%23764ba2'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='200' height='260' fill='url(%23bg)'/%3E%3Ctext x='100' y='40' text-anchor='middle' fill='white' font-family='Arial,sans-serif' font-size='16' font-weight='bold'%3EDigital Government%3C/text%3E%3Ctext x='100' y='60' text-anchor='middle' fill='white' font-family='Arial,sans-serif' font-size='12'%3EResearch and Practice%3C/text%3E%3Ctext x='100' y='90' text-anchor='middle' fill='white' font-family='Arial,sans-serif' font-size='14' font-weight='bold'%3EVol. 5 No. 3%3C/text%3E%3Ctext x='100' y='110' text-anchor='middle' fill='white' font-family='Arial,sans-serif' font-size='12'%3ESep 2024%3C/text%3E%3Ccircle cx='100' cy='150' r='30' fill='white' opacity='0.2'/%3E%3Cpath d='M85 140 L100 155 L115 140 M100 155 L100 170' stroke='white' stroke-width='3' fill='none'/%3E%3Ctext x='100' y='200' text-anchor='middle' fill='white' font-family='Arial,sans-serif' font-size='10'%3EISSN: 2639-0175%3C/text%3E%3C/svg%3E",
      computingEducation: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='260' viewBox='0 0 200 260'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' style='stop-color:%23ffeaa7'/%3E%3Cstop offset='100%25' style='stop-color:%23fab1a0'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='200' height='260' fill='url(%23bg)'/%3E%3Ctext x='100' y='40' text-anchor='middle' fill='%23333' font-family='Arial,sans-serif' font-size='16' font-weight='bold'%3EComputing Education%3C/text%3E%3Ctext x='100' y='60' text-anchor='middle' fill='%23333' font-family='Arial,sans-serif' font-size='12'%3ETheory and Practice%3C/text%3E%3Ctext x='100' y='90' text-anchor='middle' fill='%23333' font-family='Arial,sans-serif' font-size='14' font-weight='bold'%3EVol. 15 No. 2%3C/text%3E%3Ctext x='100' y='110' text-anchor='middle' fill='%23333' font-family='Arial,sans-serif' font-size='12'%3EMar 2024%3C/text%3E%3Crect x='70' y='130' width='60' height='40' rx='5' fill='%23333' opacity='0.1'/%3E%3Ctext x='100' y='155' text-anchor='middle' fill='%23333' font-family='monospace' font-size='16'%3E&lt;/&gt;%3C/text%3E%3Ctext x='100' y='200' text-anchor='middle' fill='%23333' font-family='Arial,sans-serif' font-size='10'%3EISSN: 1946-6226%3C/text%3E%3C/svg%3E",
      scientificReports: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='260' viewBox='0 0 200 260'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' style='stop-color:%2300b894'/%3E%3Cstop offset='100%25' style='stop-color:%2300a085'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='200' height='260' fill='url(%23bg)'/%3E%3Ctext x='100' y='40' text-anchor='middle' fill='white' font-family='Arial,sans-serif' font-size='18' font-weight='bold'%3EScientific Reports%3C/text%3E%3Ctext x='100' y='80' text-anchor='middle' fill='white' font-family='Arial,sans-serif' font-size='14' font-weight='bold'%3EVol. 14%3C/text%3E%3Ctext x='100' y='100' text-anchor='middle' fill='white' font-family='Arial,sans-serif' font-size='12'%3EIssue 1234%3C/text%3E%3Ctext x='100' y='120' text-anchor='middle' fill='white' font-family='Arial,sans-serif' font-size='12'%3E15 Nov 2024%3C/text%3E%3Ccircle cx='100' cy='160' r='25' fill='white' opacity='0.2'/%3E%3Cpath d='M90 160 Q100 150 110 160 Q100 170 90 160' fill='white'/%3E%3Ctext x='100' y='210' text-anchor='middle' fill='white' font-family='Arial,sans-serif' font-size='10'%3ENature Portfolio%3C/text%3E%3Ctext x='100' y='225' text-anchor='middle' fill='white' font-family='Arial,sans-serif' font-size='10'%3EISSN: 2045-2322%3C/text%3E%3C/svg%3E"
    },
    // Book Covers  
    books: {
      operationsResearch: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='260' viewBox='0 0 200 260'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0' y1='0' x2='0' y2='1'%3E%3Cstop offset='0%25' style='stop-color:%23141e30'/%3E%3Cstop offset='100%25' style='stop-color:%23243b55'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='200' height='260' fill='url(%23bg)'/%3E%3Ctext x='100' y='50' text-anchor='middle' fill='%23ffd700' font-family='Georgia,serif' font-size='18' font-weight='bold'%3EPushing the%3C/text%3E%3Ctext x='100' y='70' text-anchor='middle' fill='%23ffd700' font-family='Georgia,serif' font-size='18' font-weight='bold'%3EBoundaries%3C/text%3E%3Ctext x='100' y='100' text-anchor='middle' fill='white' font-family='Georgia,serif' font-size='14'%3EFrontiers in Impactful%3C/text%3E%3Ctext x='100' y='120' text-anchor='middle' fill='white' font-family='Georgia,serif' font-size='14'%3EOR/OM Research%3C/text%3E%3Crect x='30' y='140' width='140' height='2' fill='%23ffd700'/%3E%3Ctext x='100' y='170' text-anchor='middle' fill='white' font-family='Georgia,serif' font-size='12'%3EDruehl • Elmaghraby%3C/text%3E%3Ctext x='100' y='185' text-anchor='middle' fill='white' font-family='Georgia,serif' font-size='12'%3EShier • Greenberg%3C/text%3E%3Ctext x='100' y='220' text-anchor='middle' fill='%23ccc' font-family='Arial,sans-serif' font-size='11'%3EINFORMS%3C/text%3E%3Ctext x='100' y='240' text-anchor='middle' fill='%23ccc' font-family='Arial,sans-serif' font-size='9'%3EISBN: 978-0-9906153-4-7%3C/text%3E%3C/svg%3E",
      dataScience: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='260' viewBox='0 0 200 260'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' style='stop-color:%23667eea'/%3E%3Cstop offset='100%25' style='stop-color:%23764ba2'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='200' height='260' fill='url(%23bg)'/%3E%3Ctext x='100' y='40' text-anchor='middle' fill='white' font-family='Arial,sans-serif' font-size='20' font-weight='bold'%3EData Science%3C/text%3E%3Ctext x='100' y='65' text-anchor='middle' fill='white' font-family='Arial,sans-serif' font-size='16'%3Efor Social Good%3C/text%3E%3Ccircle cx='60' cy='120' r='20' fill='white' opacity='0.3'/%3E%3Ccircle cx='140' cy='140' r='15' fill='white' opacity='0.4'/%3E%3Ccircle cx='100' cy='160' r='25' fill='white' opacity='0.2'/%3E%3Cline x1='60' y1='120' x2='100' y2='160' stroke='white' stroke-width='2' opacity='0.5'/%3E%3Cline x1='140' y1='140' x2='100' y2='160' stroke='white' stroke-width='2' opacity='0.5'/%3E%3Ctext x='100' y='200' text-anchor='middle' fill='white' font-family='Arial,sans-serif' font-size='12'%3ESmith, Johnson, Davis%3C/text%3E%3Ctext x='100' y='220' text-anchor='middle' fill='%23ddd' font-family='Arial,sans-serif' font-size='11'%3EMIT Press%3C/text%3E%3Ctext x='100' y='240' text-anchor='middle' fill='%23ddd' font-family='Arial,sans-serif' font-size='9'%3EISBN: 978-0-262-04567-8%3C/text%3E%3C/svg%3E",
      aiEthics: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='260' viewBox='0 0 200 260'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' style='stop-color:%23ff7675'/%3E%3Cstop offset='100%25' style='stop-color:%23fd79a8'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='200' height='260' fill='url(%23bg)'/%3E%3Ctext x='100' y='40' text-anchor='middle' fill='white' font-family='Arial,sans-serif' font-size='18' font-weight='bold'%3EArtificial Intelligence%3C/text%3E%3Ctext x='100' y='65' text-anchor='middle' fill='white' font-family='Arial,sans-serif' font-size='16'%3E%26 Ethics%3C/text%3E%3Ctext x='100' y='85' text-anchor='middle' fill='white' font-family='Arial,sans-serif' font-size='14'%3EA Modern Approach%3C/text%3E%3Crect x='70' y='110' width='60' height='60' rx='30' fill='white' opacity='0.2'/%3E%3Ccircle cx='85' cy='135' r='3' fill='white'/%3E%3Ccircle cx='115' cy='135' r='3' fill='white'/%3E%3Cpath d='M80 155 Q100 165 120 155' stroke='white' stroke-width='2' fill='none'/%3E%3Ctext x='100' y='200' text-anchor='middle' fill='white' font-family='Arial,sans-serif' font-size='12'%3ERussell %26 Norvig%3C/text%3E%3Ctext x='100' y='220' text-anchor='middle' fill='%23ddd' font-family='Arial,sans-serif' font-size='11'%3EPearson%3C/text%3E%3Ctext x='100' y='240' text-anchor='middle' fill='%23ddd' font-family='Arial,sans-serif' font-size='9'%3EISBN: 978-0-13-461099-3%3C/text%3E%3C/svg%3E"
    },
    // Article thumbnails (for compact cards)
    articles: {
      vpnSecurity: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='80' viewBox='0 0 120 80'%3E%3Crect width='120' height='80' fill='%23f8f9fa'/%3E%3Crect x='20' y='20' width='80' height='40' rx='5' fill='%23e9ecef' stroke='%23adb5bd'/%3E%3Ccircle cx='35' cy='35' r='4' fill='%23dc3545'/%3E%3Ccircle cx='60' cy='45' r='6' fill='%23007bff'/%3E%3Ccircle cx='85' cy='35' r='4' fill='%23ffc107'/%3E%3Cline x1='35' y1='35' x2='60' y2='45' stroke='%236c757d' stroke-width='1'/%3E%3Cline x1='60' y1='45' x2='85' y2='35' stroke='%236c757d' stroke-width='1'/%3E%3C/svg%3E",
      languageModels: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='80' viewBox='0 0 120 80'%3E%3Crect width='120' height='80' fill='%23f8f9fa'/%3E%3Crect x='10' y='15' width='100' height='50' rx='3' fill='%23fff'/%3E%3Ctext x='60' y='35' text-anchor='middle' font-family='monospace' font-size='12' fill='%23495057'%3ELLM%3C/text%3E%3Ctext x='60' y='50' text-anchor='middle' font-family='monospace' font-size='8' fill='%236c757d'%3ELanguage Model%3C/text%3E%3Crect x='20' y='20' width='15' height='6' fill='%2328a745'/%3E%3Crect x='40' y='20' width='10' height='6' fill='%23007bff'/%3E%3Crect x='55' y='20' width='20' height='6' fill='%23ffc107'/%3E%3Crect x='80' y='20' width='15' height='6' fill='%23dc3545'/%3E%3C/svg%3E",
      performanceAnalysis: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='80' viewBox='0 0 120 80'%3E%3Crect width='120' height='80' fill='%23f8f9fa'/%3E%3Cpolyline points='20,60 30,50 40,55 50,40 60,35 70,45 80,30 90,25 100,20' stroke='%23007bff' stroke-width='2' fill='none'/%3E%3Ccircle cx='30' cy='50' r='2' fill='%23007bff'/%3E%3Ccircle cx='50' cy='40' r='2' fill='%23007bff'/%3E%3Ccircle cx='70' cy='45' r='2' fill='%23007bff'/%3E%3Ccircle cx='90' cy='25' r='2' fill='%23007bff'/%3E%3Cline x1='15' y1='70' x2='105' y2='70' stroke='%23adb5bd'/%3E%3Cline x1='15' y1='70' x2='15' y2='10' stroke='%23adb5bd'/%3E%3C/svg%3E"
    }
  }

  // Predefined publication cards for each theme - designed for real-world contexts
  const themePublicationCards = {
    'modernist-theme': {
      name: 'Modern Theme',
      description: 'Clean, minimalist publication cards optimized for search results, grids, table of contents, and page headers',
      usageContexts: ['Search Results Grid', 'Issue Table of Contents', 'Recent Publications', 'Journal Page Headers'],
      cards: [
        {
          id: 'modern-article-compact',
          name: 'Article Card (Compact)',
          type: 'Article',
          description: 'For search results and publication grids',
          context: 'Search Results, Grids',
          features: ['Access status badges', 'Publication status', 'Clean typography', 'DOI links'],
          style: {
            layout: 'compact',
            backgroundColor: '#ffffff',
            borderColor: '#e5e7eb',
            titleColor: '#1f2937',
            titleFont: 'Inter, sans-serif',
            titleWeight: '600',
            titleSize: '16px',
            metaColor: '#6b7280',
            metaFont: 'Inter, sans-serif',
            metaSize: '14px',
            accentColor: '#3b82f6',
            statusColors: {
              fullAccess: '#10b981',
              freeAccess: '#f59e0b',
              subscription: '#6b7280'
            },
            spacing: '16px',
            borderRadius: '8px'
          }
        },
        {
          id: 'modern-article-detailed',
          name: 'Article Card (Detailed)',
          type: 'Article',
          description: 'For individual article pages and detailed views',
          context: 'Article Pages, Detailed Views',
          features: ['Action buttons', 'Abstract preview', 'Full metadata', 'Download options'],
          style: {
            layout: 'detailed',
            backgroundColor: '#ffffff',
            borderColor: '#e5e7eb',
            titleColor: '#1f2937',
            titleFont: 'Inter, sans-serif',
            titleWeight: '700',
            titleSize: '20px',
            metaColor: '#6b7280',
            metaFont: 'Inter, sans-serif',
            metaSize: '14px',
            accentColor: '#3b82f6',
            buttonStyle: 'modern',
            spacing: '20px',
            borderRadius: '12px'
          }
        },
        {
          id: 'modern-issue-banner',
          name: 'Issue Card (Banner)',
          type: 'Issue',
          description: 'For journal issue pages and featured content',
          context: 'Issue Pages, Journal Headers',
          features: ['Cover image', 'Volume/Issue info', 'ISSN display', 'Featured styling'],
          style: {
            layout: 'banner',
            backgroundColor: '#ffffff',
            borderColor: '#e5e7eb',
            titleColor: '#1f2937',
            titleFont: 'Inter, sans-serif',
            titleWeight: '700',
            titleSize: '24px',
            metaColor: '#6b7280',
            accentColor: '#3b82f6',
            imageStyle: 'prominent',
            spacing: '24px',
            borderRadius: '12px'
          }
        },
        {
          id: 'modern-book-featured',
          name: 'Book Card (Featured)',
          type: 'Book',
          description: 'For book pages and featured book displays',
          context: 'Book Pages, Featured Content',
          features: ['Cover image', 'Author photos', 'ISBN display', 'Chapter access'],
          style: {
            layout: 'featured',
            backgroundColor: '#ffffff',
            borderColor: '#e5e7eb',
            titleColor: '#1f2937',
            titleFont: 'Inter, sans-serif',
            titleWeight: '700',
            titleSize: '22px',
            metaColor: '#6b7280',
            accentColor: '#3b82f6',
            imageStyle: 'cover-prominent',
            authorDisplay: 'photos',
            spacing: '20px',
            borderRadius: '12px'
          }
        }
      ]
    },
    'classicist-theme': {
      name: 'Classic Theme',
      description: 'Traditional, scholarly publication cards with serif typography, formal styling, and academic conventions',
      usageContexts: ['Academic Search', 'Scholarly Listings', 'Institutional Displays', 'Reference Pages'],
      cards: [
        {
          id: 'classic-article-compact',
          name: 'Article Card (Compact)',
          type: 'Article',
          description: 'Traditional academic style for search and listings',
          context: 'Academic Search, Reference Lists',
          features: ['Formal typography', 'Citation format', 'Academic status', 'Publication venues'],
          style: {
            layout: 'compact',
            backgroundColor: '#fefefe',
            borderColor: '#d1d5db',
            titleColor: '#374151',
            titleFont: 'Georgia, serif',
            titleWeight: '600',
            titleSize: '16px',
            metaColor: '#6b7280',
            metaFont: 'Georgia, serif',
            metaSize: '14px',
            accentColor: '#7c3aed',
            statusColors: {
              fullAccess: '#059669',
              freeAccess: '#d97706',
              subscription: '#6b7280'
            },
            spacing: '14px',
            borderRadius: '6px'
          }
        },
        {
          id: 'classic-article-detailed',
          name: 'Article Card (Detailed)',
          type: 'Article',
          description: 'Formal academic presentation with complete metadata',
          context: 'Academic Journals, Scholarly Archives',
          features: ['Complete citations', 'Abstract access', 'Reference formatting', 'Academic buttons'],
          style: {
            layout: 'detailed',
            backgroundColor: '#fefefe',
            borderColor: '#d1d5db',
            titleColor: '#374151',
            titleFont: 'Georgia, serif',
            titleWeight: '700',
            titleSize: '18px',
            metaColor: '#6b7280',
            metaFont: 'Georgia, serif',
            metaSize: '14px',
            accentColor: '#7c3aed',
            buttonStyle: 'traditional',
            spacing: '18px',
            borderRadius: '8px'
          }
        },
        {
          id: 'classic-issue-banner',
          name: 'Issue Card (Banner)',
          type: 'Issue',
          description: 'Formal journal issue presentation',
          context: 'Academic Journals, Issue Archives',
          features: ['Traditional layout', 'Academic formatting', 'ISSN prominence', 'Scholarly branding'],
          style: {
            layout: 'banner',
            backgroundColor: '#fefefe',
            borderColor: '#d1d5db',
            titleColor: '#374151',
            titleFont: 'Georgia, serif',
            titleWeight: '700',
            titleSize: '22px',
            metaColor: '#6b7280',
            accentColor: '#7c3aed',
            imageStyle: 'traditional',
            spacing: '20px',
            borderRadius: '8px'
          }
        },
        {
          id: 'classic-book-featured',
          name: 'Book Card (Featured)',
          type: 'Book',
          description: 'Scholarly book presentation with academic conventions',
          context: 'Academic Books, University Press',
          features: ['Scholarly typography', 'Academic metadata', 'ISBN prominence', 'Citation ready'],
          style: {
            layout: 'featured',
            backgroundColor: '#fefefe',
            borderColor: '#d1d5db',
            titleColor: '#374151',
            titleFont: 'Georgia, serif',
            titleWeight: '700',
            titleSize: '20px',
            metaColor: '#6b7280',
            accentColor: '#7c3aed',
            imageStyle: 'cover-traditional',
            authorDisplay: 'formal',
            spacing: '18px',
            borderRadius: '8px'
          }
        }
      ]
    },
    'curator-theme': {
      name: 'Curator Theme',
      description: 'Visually rich, editorial-style publication cards with image-forward design and sophisticated layouts',
      usageContexts: ['Visual Discovery', 'Editorial Features', 'Magazine Layouts', 'Image-Rich Collections'],
      cards: [
        {
          id: 'curator-article-compact',
          name: 'Article Card (Compact)',
          type: 'Article',
          description: 'Visual-first design for discovery and browsing',
          context: 'Visual Search, Editorial Grids',
          features: ['Image thumbnails', 'Editorial typography', 'Visual hierarchy', 'Aesthetic focus'],
          style: {
            layout: 'compact',
            backgroundColor: '#ffffff',
            borderColor: '#f3f4f6',
            titleColor: '#1f2937',
            titleFont: 'Playfair Display, serif',
            titleWeight: '600',
            titleSize: '16px',
            metaColor: '#6b7280',
            metaFont: 'Source Sans Pro, sans-serif',
            metaSize: '13px',
            accentColor: '#ef4444',
            statusColors: {
              fullAccess: '#10b981',
              freeAccess: '#f59e0b',
              subscription: '#6b7280'
            },
            spacing: '18px',
            borderRadius: '12px',
            imageStyle: 'thumbnail'
          }
        },
        {
          id: 'curator-article-detailed',
          name: 'Article Card (Detailed)',
          type: 'Article',
          description: 'Editorial-style detailed presentation',
          context: 'Editorial Features, Visual Articles',
          features: ['Hero images', 'Magazine layout', 'Editorial buttons', 'Rich presentation'],
          style: {
            layout: 'detailed',
            backgroundColor: '#ffffff',
            borderColor: '#f3f4f6',
            titleColor: '#1f2937',
            titleFont: 'Playfair Display, serif',
            titleWeight: '700',
            titleSize: '22px',
            metaColor: '#6b7280',
            metaFont: 'Source Sans Pro, sans-serif',
            metaSize: '14px',
            accentColor: '#ef4444',
            buttonStyle: 'editorial',
            spacing: '24px',
            borderRadius: '16px',
            imageStyle: 'hero'
          }
        },
        {
          id: 'curator-issue-banner',
          name: 'Issue Card (Banner)',
          type: 'Issue',
          description: 'Magazine-style issue presentation',
          context: 'Editorial Issues, Visual Collections',
          features: ['Cover prominence', 'Magazine layout', 'Visual impact', 'Editorial branding'],
          style: {
            layout: 'banner',
            backgroundColor: '#ffffff',
            borderColor: '#f3f4f6',
            titleColor: '#1f2937',
            titleFont: 'Playfair Display, serif',
            titleWeight: '700',
            titleSize: '26px',
            metaColor: '#6b7280',
            accentColor: '#ef4444',
            imageStyle: 'magazine-cover',
            spacing: '28px',
            borderRadius: '16px'
          }
        },
        {
          id: 'curator-book-featured',
          name: 'Book Card (Featured)',
          type: 'Book',
          description: 'Visual book presentation with editorial flair',
          context: 'Book Features, Visual Collections',
          features: ['Cover art focus', 'Editorial typography', 'Visual metadata', 'Aesthetic presentation'],
          style: {
            layout: 'featured',
            backgroundColor: '#ffffff',
            borderColor: '#f3f4f6',
            titleColor: '#1f2937',
            titleFont: 'Playfair Display, serif',
            titleWeight: '700',
            titleSize: '24px',
            metaColor: '#6b7280',
            accentColor: '#ef4444',
            imageStyle: 'cover-editorial',
            authorDisplay: 'visual',
            spacing: '24px',
            borderRadius: '16px'
          }
        }
      ]
    }
  }

  const themeData = themePublicationCards[themeId as keyof typeof themePublicationCards]
  
  if (!themeData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No publication cards defined for this theme.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Usage Context Overview */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-blue-800 font-medium mb-2">🎯 Real-World Usage Contexts</h3>
        <p className="text-blue-700 text-sm mb-3">{themeData.description}</p>
        <div className="flex flex-wrap gap-2">
          {themeData.usageContexts.map((context, index) => (
            <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
              {context}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cards List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Publication Card Variants</h3>
          
          <div className="space-y-4">
            {themeData.cards.map((card) => (
              <div
                key={card.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">{card.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{card.description}</p>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                        {card.type}
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                        {card.style.layout}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      <strong>Usage:</strong> {card.context}
                    </div>
                  </div>
                </div>
                
                {/* Features */}
                <div className="mb-3">
                  <div className="text-xs font-medium text-gray-700 mb-1">Key Features:</div>
                  <div className="flex flex-wrap gap-1">
                    {card.features.map((feature, index) => (
                      <span key={index} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-green-100 text-green-800">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Style Properties */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Typography:</span>
                    <div style={{ fontFamily: card.style.titleFont, color: card.style.titleColor }} className="font-medium">
                      {card.style.titleFont.split(',')[0]}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Accent:</span>
                    <div className="flex items-center gap-1">
                      <div 
                        className="w-3 h-3 rounded-full border border-gray-300"
                        style={{ backgroundColor: card.style.accentColor }}
                      ></div>
                      <span style={{ color: card.style.accentColor }}>{card.style.accentColor}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preview Area */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Live Card Previews</h3>
          <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
            <div className="space-y-6">
              {themeData.cards.map((card) => (
                <div key={card.id} className="space-y-2">
                  <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                    {card.name}
                  </div>
                  <div
                    className="shadow-sm border transition-all hover:shadow-md"
                    style={{
                      backgroundColor: card.style.backgroundColor,
                      borderColor: card.style.borderColor,
                      borderRadius: card.style.borderRadius,
                      padding: card.style.spacing
                    }}
                  >
                    {/* Article Content */}
                    {card.type === 'Article' && (
                      <>
                        <div className="flex gap-3">
                          {/* Article thumbnail for compact layouts */}
                          {card.style.layout === 'compact' && (
                            <div className="flex-shrink-0">
                              <img 
                                src={card.id.includes('modern') ? mockCovers.articles.vpnSecurity : 
                                     card.id.includes('classic') ? mockCovers.articles.performanceAnalysis :
                                     mockCovers.articles.languageModels} 
                                alt="Article thumbnail" 
                                className="w-16 h-10 object-cover rounded border"
                              />
                            </div>
                          )}
                          
                          <div className="flex-1">
                            {/* Access Status */}
                            <div className="flex items-center gap-2 mb-2">
                              <span 
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white"
                                style={{ backgroundColor: card.style.statusColors?.fullAccess || card.style.accentColor }}
                              >
                                🔓 FULL ACCESS
                              </span>
                            </div>
                            
                            <h4 
                              className="mb-2"
                              style={{ 
                                color: card.style.titleColor,
                                fontSize: card.style.titleSize,
                                fontFamily: card.style.titleFont,
                                fontWeight: card.style.titleWeight
                              }}
                            >
                              OpenVPN is Open to VPN Fingerprinting
                            </h4>
                            
                            <div 
                              className="text-sm mb-2"
                              style={{ 
                                color: card.style.metaColor,
                                fontFamily: card.style.metaFont,
                                fontSize: card.style.metaSize
                              }}
                            >
                              Diwen Xue, Reethika Ramesh, Arham Jain, Michaelis Kallitsis
                            </div>
                            
                            <div 
                              className="text-sm mb-2"
                              style={{ color: card.style.metaColor }}
                            >
                              Ahead of Print
                            </div>
                          </div>
                        </div>
                        
                        {/* Action buttons for detailed layouts */}
                        {card.style.layout === 'detailed' && (
                          <div className="flex items-center gap-2 mt-3">
                            <button 
                              className="px-3 py-1 text-xs rounded border"
                              style={{ 
                                borderColor: card.style.accentColor,
                                color: card.style.accentColor
                              }}
                            >
                              Abstract
                            </button>
                            <button 
                              className="px-3 py-1 text-xs rounded text-white"
                              style={{ backgroundColor: card.style.accentColor }}
                            >
                              Full Text
                            </button>
                            <button 
                              className="px-3 py-1 text-xs rounded border border-gray-300 text-gray-600"
                            >
                              PDF
                            </button>
                          </div>
                        )}
                      </>
                    )}

                    {/* Book Content */}
                    {card.type === 'Book' && (
                      <>
                        <div className="flex gap-4">
                          {/* Book Cover */}
                          <div className="flex-shrink-0">
                            <img 
                              src={card.id.includes('modern') ? mockCovers.books.dataScience :
                                   card.id.includes('classic') ? mockCovers.books.operationsResearch :
                                   mockCovers.books.aiEthics} 
                              alt="Book cover" 
                              className={`object-cover rounded border ${
                                card.style.layout === 'featured' ? 'w-20 h-26' : 'w-12 h-16'
                              }`}
                            />
                          </div>
                          
                          <div className="flex-1">
                            <h4 
                              className="mb-2"
                              style={{ 
                                color: card.style.titleColor,
                                fontSize: card.style.titleSize,
                                fontFamily: card.style.titleFont,
                                fontWeight: card.style.titleWeight
                              }}
                            >
                              {card.id.includes('modern') ? 'Data Science for Social Good' :
                               card.id.includes('classic') ? 'Pushing the Boundaries: Frontiers in Impactful OR/OM Research' :
                               'Artificial Intelligence & Ethics: A Modern Approach'}
                            </h4>
                            
                            <div 
                              className="text-sm mb-2"
                              style={{ 
                                color: card.style.metaColor,
                                fontFamily: card.style.metaFont,
                                fontSize: card.style.metaSize
                              }}
                            >
                              {card.id.includes('modern') ? 'Smith, Johnson, Davis' :
                               card.id.includes('classic') ? 'Druehl, Elmaghraby, Shier, Greenberg' :
                               'Russell & Norvig'}
                            </div>
                            
                            <div 
                              className="text-sm mb-2"
                              style={{ color: card.style.metaColor }}
                            >
                              {card.id.includes('modern') ? '2024 • ISBN: 978-0-262-04567-8' :
                               card.id.includes('classic') ? '1 Nov 2020 • ISBN: 978-0-9906153-4-7' :
                               '2024 • ISBN: 978-0-13-461099-3'}
                            </div>
                            
                            {/* Publisher */}
                            <div 
                              className="text-sm font-medium"
                              style={{ color: card.style.accentColor }}
                            >
                              {card.id.includes('modern') ? 'MIT Press' :
                               card.id.includes('classic') ? 'INFORMS' :
                               'Pearson'}
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Issue Content */}
                    {card.type === 'Issue' && (
                      <>
                        <div className="flex gap-4">
                          {/* Issue Cover */}
                          <div className="flex-shrink-0">
                            <img 
                              src={card.id.includes('modern') ? mockCovers.issues.digitalGovernment :
                                   card.id.includes('classic') ? mockCovers.issues.scientificReports :
                                   mockCovers.issues.computingEducation} 
                              alt="Issue cover" 
                              className={`object-cover rounded border ${
                                card.style.layout === 'banner' ? 'w-24 h-32' : 'w-16 h-20'
                              }`}
                            />
                          </div>
                          
                          <div className="flex-1">
                            <h4 
                              className="mb-2"
                              style={{ 
                                color: card.style.titleColor,
                                fontSize: card.style.titleSize,
                                fontFamily: card.style.titleFont,
                                fontWeight: card.style.titleWeight
                              }}
                            >
                              {card.id.includes('modern') ? 'Digital Government: Research and Practice' :
                               card.id.includes('classic') ? 'Scientific Reports' :
                               'Computing Education: Theory and Practice'}
                            </h4>
                            <div 
                              className="text-sm mb-2"
                              style={{ color: card.style.metaColor }}
                            >
                              {card.id.includes('modern') ? 'Volume 5, Number 3 • 30 Sep 2024' :
                               card.id.includes('classic') ? 'Vol. 14, Issue 1234 • 15 Nov 2024' :
                               'Volume 15, Number 2 • Mar 2024'}
                            </div>
                            <div 
                              className="text-sm mb-2"
                              style={{ color: card.style.metaColor }}
                            >
                              {card.id.includes('modern') ? 'ISSN (online): 2639-0175' :
                               card.id.includes('classic') ? 'ISSN: 2045-2322' :
                               'ISSN: 1946-6226'}
                            </div>
                            <a 
                              href="#" 
                              className="text-sm inline-block"
                              style={{ color: card.style.accentColor }}
                            >
                              {card.id.includes('modern') ? 'http://doi.org/10.1145/DGOV' :
                               card.id.includes('classic') ? 'http://doi.org/10.1038/s41598-024-xyz' :
                               'http://doi.org/10.1145/CompEd.2024'}
                            </a>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-amber-50 rounded-lg border border-amber-200">
        <div className="flex items-start gap-3">
          <div className="text-amber-600 mt-0.5">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="text-amber-800 font-medium mb-1">Design System Foundation</h4>
            <p className="text-amber-700 text-sm">
              These publication cards are optimized for <strong>{themeData.name}</strong> and designed for real-world publishing contexts: search results, issue listings, journal headers, and featured content displays. 
              Websites using this theme inherit these cards as their foundation and can customize them for specific needs.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const { currentView } = usePageStore()
  
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
        <DesignConsole />
        <NotificationContainer />
      </>
    )
  }
  
  return (
    <>
      <PageBuilder />
      <NotificationContainer />
      <IssuesSidebar />
    </>
  )
}