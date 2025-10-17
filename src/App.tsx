import { useMemo, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import React from 'react'
import { nanoid } from 'nanoid'
import { arrayMove } from '@dnd-kit/sortable'
import { ChevronDown, Building2, Settings, X, Plus, Home, Palette, FileText, Globe, Cog, ArrowLeft, List, AlertTriangle, CheckCircle, Trash2, Info } from 'lucide-react'
import { ThemeEditor } from './components/SiteManager/ThemeEditor'
import { PublicationCards } from './components/SiteManager/PublicationCards'
import { SiteManagerTemplates } from './components/SiteManager/SiteManagerTemplates'
import { MockLiveSite } from './components/MockLiveSite'
import { TemplateCanvas } from './components/Templates/TemplateCanvas'
import { PublicationCard } from './components/Publications/PublicationCard'
import { generateAIContent, generateAISingleContent } from './utils/aiContentGeneration'
import { DraggableLibraryWidget } from './components/Canvas/DraggableLibraryWidget'
import { WebsiteCreationWizard } from './components/Wizards/WebsiteCreation'
import { PageBuilder } from './components/PageBuilder'
import { create } from 'zustand'
import { type LibraryItem as SpecItem } from './library'

// Import specific types and constants from organized directories
import { 
// Widget types
  type Widget, type WidgetSection, type CanvasItem, isSection, 
  type Skin, type WidgetBase, type TextWidget, type ImageWidget, type NavbarWidget, type HTMLWidget, type HeadingWidget, type ButtonWidget, type PublicationListWidget, type PublicationDetailsWidget,
  // Template types  
  type TemplateCategory, type TemplateStatus, type Modification, type Website, type Theme,
  // App types
  type DesignConsoleView, type PageState, type Notification, type PageIssue, type NotificationType,
  // Schema.org types
  type SchemaObject, type SchemaOrgType, SCHEMA_DEFINITIONS
} from './types'
import { 
  MOCK_SCHOLARLY_ARTICLES, 
  DEFAULT_PUBLICATION_CARD_CONFIG, 
  PREFAB_SECTIONS, 
  INITIAL_CANVAS_ITEMS 
} from './constants'


// NOTE: AI Content Generation functions moved to src/utils/aiContentGeneration.ts


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









// NOTE: PublicationCard component moved to src/components/Publications/PublicationCard.tsx

// Interactive Widget Renderer with drag & drop for Page Builder Editor
function InteractiveWidgetRenderer({ 
  widget}: {
  widget: Widget
  dragAttributes?: any
  dragListeners?: any
  onWidgetClick?: (id: string, e: React.MouseEvent) => void
  activeSectionToolbar?: string | null
  setActiveSectionToolbar?: (value: string | null) => void
  activeWidgetToolbar?: string | null
  setActiveWidgetToolbar?: (value: string | null) => void
}) {
  const { schemaObjects } = usePageStore()
  const canvasItems = usePageStore((s) => s.canvasItems)
  const replaceCanvasItems = usePageStore((s) => s.replaceCanvasItems)
  
  // NOTE: renderWithToolbar function removed - functionality moved to SortableItem component
  
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
      const h = widget as HeadingWidget
      
      // Style mappings (keeping concise for App.tsx)
      const alignClasses = { left: 'text-left', center: 'text-center', right: 'text-right' }
      const colorClasses = { 
        default: 'text-gray-900', primary: 'text-blue-600', 
        secondary: 'text-green-600', accent: 'text-orange-600', muted: 'text-gray-500' 
      }
      const sizeClasses = { small: 'text-lg', medium: 'text-xl', large: 'text-2xl', xl: 'text-4xl', auto: '' }
      const spacingClasses = { tight: 'mb-2', normal: 'mb-4', loose: 'mb-6' }
      
      // Semantic size defaults based on heading level
      const getSemanticDefaultSize = (level: number): 'small' | 'medium' | 'large' | 'xl' => {
        switch (level) {
          case 1: return 'xl'      // H1 → Extra Large
          case 2: return 'large'   // H2 → Large  
          case 3: return 'medium'  // H3 → Medium
          case 4: return 'small'   // H4 → Small
          case 5: return 'small'   // H5 → Small
          case 6: return 'small'   // H6 → Small
          default: return 'medium'
        }
      }
      
      const getStyleClasses = () => {
        const style = h.style || 'default'
        switch (style) {
          case 'bordered-left': return 'border-l-4 border-current pl-4'
          case 'underlined': return 'border-b-2 border-current pb-2 inline-block'
          case 'highlighted': return 'bg-gradient-to-r from-yellow-100 to-yellow-50 px-3 py-2 rounded'
          case 'decorated': return 'relative'
          case 'gradient': return 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'
          default: return ''
        }
      }
      
      const HeadingComponent = ({ children, ...props }: any) => {
        switch (h.level) {
          case 1: return <h1 {...props}>{children}</h1>
          case 2: return <h2 {...props}>{children}</h2>
          case 3: return <h3 {...props}>{children}</h3>
          case 4: return <h4 {...props}>{children}</h4>
          case 5: return <h5 {...props}>{children}</h5>
          case 6: return <h6 {...props}>{children}</h6>
          default: return <h2 {...props}>{children}</h2>
        }
      }
      
      const getFontStyleClasses = () => {
        const styles = []
        if (h.fontStyle?.bold) styles.push('font-bold')
        if (h.fontStyle?.italic) styles.push('italic')
        if (h.fontStyle?.underline) styles.push('underline')
        if (h.fontStyle?.strikethrough) styles.push('line-through')
        return styles.join(' ')
      }
      
      const headingClasses = [
        getStyleClasses(),
        getFontStyleClasses(),
        alignClasses[h.align || 'left'],
        h.size === 'auto' 
          ? sizeClasses[getSemanticDefaultSize(h.level)]
          : sizeClasses[h.size || 'auto'],
        colorClasses[h.color || 'default'],
        spacingClasses[h.spacing || 'normal']
      ].filter(Boolean).join(' ')
      
      return (
        <SkinWrap skin={widget.skin}>
          <div className="px-6 py-4">
            <HeadingComponent
              className={headingClasses}
              contentEditable={true}
              suppressContentEditableWarning={true}
              onBlur={(e: React.FocusEvent<HTMLHeadingElement>) => {
                const newText = e.currentTarget.textContent || ''
                if (newText !== h.text) {
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
              {h.icon?.enabled && h.icon?.position === 'left' && (
                <span className="mr-2">{h.icon?.emoji || '🎯'}</span>
              )}
              {h.text}
              {h.icon?.enabled && h.icon?.position === 'right' && (
                <span className="ml-2">{h.icon?.emoji || '✨'}</span>
              )}
            </HeadingComponent>
            {h.style === 'decorated' && (
              <div className="w-12 h-0.5 bg-current opacity-60 mt-2"></div>
            )}
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
    case 'image': {
      const imageWidget = widget as ImageWidget
      const aspectRatios = {
        '1:1': 'aspect-square',
        '4:3': 'aspect-4/3', 
        '3:4': 'aspect-3/4',
        '16:9': 'aspect-video',
        'auto': ''
      }
      
      const alignmentClasses = {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right'
      }
      
      const widthClasses = {
        auto: 'w-auto',
        small: 'w-1/4',
        medium: 'w-1/2', 
        large: 'w-3/4',
        full: 'w-full'
      }
      
      const alignment = imageWidget.alignment || 'center'
      const width = imageWidget.width || 'full'
      const objectFit = imageWidget.objectFit || 'cover'
      const ratio = imageWidget.ratio || 'auto'
      
      return (
        <SkinWrap skin={widget.skin}>
          <div className="p-4">
            {!imageWidget.src || imageWidget.src.trim() === '' ? (
              <div className={`${alignmentClasses[alignment]} ${widthClasses[width]} mx-auto`}>
                <div className={`bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg flex items-center justify-center text-blue-600 ${ratio !== 'auto' ? aspectRatios[ratio] : 'min-h-[200px]'}`}>
                  <div className="text-center p-6">
                    <div className="text-4xl mb-2">🖼️</div>
                    <div className="text-sm font-medium">Click to Add Image</div>
                    <div className="text-xs mt-1">Set image URL in properties panel →</div>
                  </div>
                </div>
                {imageWidget.caption && (
                  <p className="text-sm text-gray-600 mt-2 italic">{imageWidget.caption}</p>
                )}
              </div>
            ) : (
              <div className={alignmentClasses[alignment]}>
                <div className="inline-block">
                  <div className="relative group">
                    {imageWidget.link && (
                      <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-xs z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        🔗 Linked
                      </div>
                    )}
                    <img 
                      key={imageWidget.src} // Force re-mount when src changes
                      src={imageWidget.src} 
                      alt={imageWidget.alt}
                      className={`rounded ${widthClasses[width]} ${ratio !== 'auto' ? aspectRatios[ratio] : ''}`}
              style={{ 
                        objectFit: objectFit,
                        maxWidth: '100%',
                        height: ratio === 'auto' ? 'auto' : undefined
                      }}
                      onLoad={(e) => {
                        // Reset error state on successful load
                        const target = e.target as HTMLImageElement
                        target.style.display = 'block'
                        const placeholder = target.nextElementSibling as HTMLElement
                        if (placeholder) {
                          placeholder.style.display = 'none'
                        }
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        const placeholder = target.nextElementSibling as HTMLElement
                        if (placeholder) {
                          placeholder.style.display = 'flex'
                        }
                      }}
                    />
                    <div 
                      className={`bg-red-50 border-2 border-dashed border-red-200 rounded-lg flex items-center justify-center text-red-500 ${ratio !== 'auto' ? aspectRatios[ratio] : 'min-h-[200px]'} ${widthClasses[width]}`}
                      style={{ display: 'none' }}
                    >
                      <div className="text-center p-6">
                        <div className="text-4xl mb-2">❌</div>
                        <div className="text-sm font-medium">Failed to Load Image</div>
                        <div className="text-xs mt-1">Check image URL in properties →</div>
                      </div>
                    </div>
                  </div>
                  {imageWidget.caption && (
                    <p className="text-sm text-gray-600 mt-2 italic">{imageWidget.caption}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </SkinWrap>
      )
    }
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
      
      // Get publications based on content source
      let publications: any[] = []
      if (publicationWidget.contentSource === 'schema-objects' && publicationWidget.schemaSource) {
        const { selectionType, selectedIds, selectedType } = publicationWidget.schemaSource
        
        try {
          if (selectionType === 'by-type' && selectedType) {
            // Get all objects of the selected type
            const filteredObjects = schemaObjects.filter(obj => obj.type === selectedType)
            
            publications = filteredObjects
              .map(obj => {
                try {
                  return JSON.parse(obj.jsonLD)
                } catch (e) {
                  console.error('Failed to parse JSON-LD for object:', obj.id, e)
                  return null
                }
              })
              .filter(pub => pub !== null)
              
          } else if (selectionType === 'by-id' && selectedIds && selectedIds.length > 0) {
            // Get specific objects by ID
            publications = selectedIds
              .map(id => schemaObjects.find(obj => obj.id === id))
              .filter(obj => obj !== undefined)
              .map(obj => {
                try {
                  return JSON.parse(obj!.jsonLD)
                } catch (e) {
                  console.error('Failed to parse JSON-LD for object:', obj!.id, e)
                  return null
                }
              })
              .filter(pub => pub !== null)
          }
        } catch (error) {
          console.error('Error loading schema objects:', error)
          publications = []
        }
      } else if (publicationWidget.contentSource === 'ai-generated' && publicationWidget.aiSource?.prompt) {
        // Generate AI content based on prompt
        try {
          if (publicationWidget.aiSource.generatedContent && publicationWidget.aiSource.lastGenerated) {
            // Use cached content if it exists and is recent (less than 1 hour old)
            const hoursSinceGeneration = (Date.now() - publicationWidget.aiSource.lastGenerated.getTime()) / (1000 * 60 * 60)
            if (hoursSinceGeneration < 1) {
              publications = publicationWidget.aiSource.generatedContent
            } else {
              // Re-generate if cache is stale
              publications = generateAIContent(publicationWidget.aiSource.prompt)
            }
          } else {
            // Generate new content
            publications = generateAIContent(publicationWidget.aiSource.prompt)
          }
        } catch (error) {
          console.error('Error generating AI content:', error)
          publications = publicationWidget.publications // Fallback to default
        }
      } else {
        // Use default publications for other content sources
        publications = publicationWidget.publications
      }
      
      const displayedPublications = publicationWidget.maxItems 
        ? publications.slice(0, publicationWidget.maxItems)
        : publications

      return (
        <SkinWrap skin={widget.skin}>
          <div className="space-y-6">
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

            {publicationWidget.maxItems && publications.length > publicationWidget.maxItems && (
              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Showing {publicationWidget.maxItems} of {publications.length} publications
                </p>
              </div>
            )}
            
            {publicationWidget.contentSource === 'schema-objects' && publications.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No schema objects found for the current selection.</p>
                <p className="text-sm mt-1">Create some schema objects or adjust your selection.</p>
              </div>
            )}
          </div>
        </SkinWrap>
      )
      
    case 'publication-details':
      const publicationDetailsWidget = widget as PublicationDetailsWidget
      let publication: any = null
      
      // Get publication based on content source
      try {
        if (publicationDetailsWidget.contentSource === 'schema-objects' && publicationDetailsWidget.schemaSource?.selectedId) {
          // Get single schema object by ID
          const schemaObject = schemaObjects.find(obj => obj.id === publicationDetailsWidget.schemaSource?.selectedId)
          if (schemaObject) {
            publication = JSON.parse(schemaObject.jsonLD)
          }
        } else if (publicationDetailsWidget.contentSource === 'doi' && publicationDetailsWidget.doiSource?.doi) {
          // For DOI source, use mock data (in real app would fetch from DOI API)
          publication = MOCK_SCHOLARLY_ARTICLES.find(article => 
            article.identifier?.value?.includes(publicationDetailsWidget.doiSource?.doi || '')
          ) || MOCK_SCHOLARLY_ARTICLES[0]
        } else if (publicationDetailsWidget.contentSource === 'ai-generated' && publicationDetailsWidget.aiSource?.prompt) {
          // Generate AI content based on prompt
          if (publicationDetailsWidget.aiSource.generatedContent && publicationDetailsWidget.aiSource.lastGenerated) {
            // Use cached content if it exists and is recent (less than 1 hour old)
            const hoursSinceGeneration = (Date.now() - publicationDetailsWidget.aiSource.lastGenerated.getTime()) / (1000 * 60 * 60)
            if (hoursSinceGeneration < 1) {
              publication = publicationDetailsWidget.aiSource.generatedContent
            } else {
              // Re-generate if cache is stale
              publication = generateAISingleContent(publicationDetailsWidget.aiSource.prompt)
            }
          } else {
            // Generate new content
            publication = generateAISingleContent(publicationDetailsWidget.aiSource.prompt)
          }
        } else if (publicationDetailsWidget.contentSource === 'context') {
          // For context source, use first mock article (in real app would get from page context)
          publication = MOCK_SCHOLARLY_ARTICLES[0]
        } else {
          // Use widget's stored publication or fallback
          publication = publicationDetailsWidget.publication || MOCK_SCHOLARLY_ARTICLES[0]
        }
      } catch (error) {
        console.error('Error loading publication details:', error)
        publication = MOCK_SCHOLARLY_ARTICLES[0] // Fallback
      }

      return (
        <SkinWrap skin={widget.skin}>
          <div className={`${
            publicationDetailsWidget.layout === 'hero' 
              ? 'bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-lg' 
              : publicationDetailsWidget.layout === 'sidebar'
              ? 'flex gap-6' 
              : ''
          }`}>
            {publication ? (
              <PublicationCard
                article={publication}
                config={publicationDetailsWidget.cardConfig}
              />
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No publication data available</p>
                <p className="text-sm mt-1">Please configure the data source or select a publication</p>
              </div>
            )}
          </div>
        </SkinWrap>
      )
      
    case 'button':
      const buttonWidget = widget as ButtonWidget
      const variantClasses = {
        primary: 'bg-red-600 text-white hover:bg-red-700',
        secondary: 'bg-gray-600 text-white hover:bg-gray-700',
        outline: 'border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white',
        link: 'text-red-600 hover:text-red-700 underline hover:no-underline bg-transparent'
      }
      
      const sizeClasses = {
        small: 'px-3 py-1.5 text-sm',
        medium: 'px-4 py-2 text-base',
        large: 'px-6 py-3 text-lg'
      }
      
      const buttonClasses = `
        font-medium rounded transition-colors duration-200 cursor-pointer inline-block
        ${variantClasses[buttonWidget.variant] || variantClasses.primary}
        ${sizeClasses[buttonWidget.size] || sizeClasses.medium}
      `.trim()
      
      return (
        <SkinWrap skin={widget.skin}>
          <div className="flex items-center justify-center p-2">
            {buttonWidget.href ? (
              <a href={buttonWidget.href} className={buttonClasses}>
                {buttonWidget.text}
              </a>
            ) : (
              <button className={buttonClasses}>
                {buttonWidget.text}
              </button>
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
    id: nanoid(),
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
        align: 'left',
        style: 'default',
        color: 'default',
        size: 'auto',
        fontStyle: {
          bold: true,
          italic: false,
          underline: false,
          strikethrough: false
        },
        icon: {
          enabled: false,
          position: 'left',
          emoji: '🎯'
        },
        spacing: 'normal'
      } as HeadingWidget;
    
    case 'image':
      return {
        ...baseWidget,
        type: 'image',
        src: '', // Start with empty src to show placeholder
        alt: 'Image description',
        ratio: '16:9',
        caption: '',
        link: '',
        alignment: 'center',
        width: 'full',
        objectFit: 'cover'
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
    
    case 'button':
      return {
        ...baseWidget,
        type: 'button',
        text: 'Button Text',
        variant: 'primary',
        size: 'medium',
        href: '#'
      } as ButtonWidget;
    
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
        maxItems: 6,
        aiSource: {
          prompt: '',
          lastGenerated: undefined,
          generatedContent: undefined
        }
      } as PublicationListWidget;
    
    case 'publication-details':
      return {
        ...baseWidget,
        type: 'publication-details',
        contentSource: 'context',
        publication: MOCK_SCHOLARLY_ARTICLES[0], // Use first article as default
        cardConfig: DEFAULT_PUBLICATION_CARD_CONFIG,
        cardVariantId: 'compact-variant',
        layout: 'default',
        aiSource: {
          prompt: '',
          lastGenerated: undefined,
          generatedContent: undefined
        }
      } as PublicationDetailsWidget;
    
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
  mockLiveSiteRoute: '/', // Default to homepage
  setCurrentView: (view) => set({ currentView: view }),
  setSiteManagerView: (view) => set({ siteManagerView: view }),
  setEditingContext: (context) => set({ editingContext: context }),
  setCurrentWebsiteId: (websiteId) => set({ currentWebsiteId: websiteId }),
  setMockLiveSiteRoute: (route) => set({ mockLiveSiteRoute: route }),
  
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
  
  // Schema.org Content Management
  schemaObjects: [
    {
      id: 'blog-post-1',
      type: 'BlogPosting' as SchemaOrgType,
      name: 'Getting Started with Page Builders',
      data: {
        name: 'Getting Started with Page Builders',
        headline: 'Getting Started with Page Builders: A Complete Guide',
        author: {
          '@type': 'Person',
          name: 'Sarah Johnson',
          jobTitle: 'UX Designer'
        },
        datePublished: '2024-01-15T10:00:00Z',
        description: 'Learn how to create stunning websites with modern page builder tools and best practices.',
        articleBody: 'Page builders have revolutionized web design by making it accessible to everyone...',
        keywords: ['page builder', 'web design', 'no-code', 'website creation'],
        wordCount: 1200,
        url: 'https://example.com/blog/getting-started-page-builders'
      },
      jsonLD: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": "Getting Started with Page Builders: A Complete Guide",
        "alternativeHeadline": "A beginner-friendly guide to modern web design tools",
        "author": [{
          "@type": "Person",
          "name": "Sarah Johnson",
          "affiliation": {
            "@type": "Organization",
            "name": "UX Design Studio"
          }
        }],
        "datePublished": "2024-01-15",
        "abstract": "Learn how to create stunning websites with modern page builder tools and best practices. This comprehensive guide covers everything from basic concepts to advanced techniques.",
        "keywords": ["page builder", "web design", "no-code", "website creation"],
        "about": [
          {"@type": "Thing", "name": "Web Development"},
          {"@type": "Thing", "name": "User Experience"}
        ],
        "url": "https://example.com/blog/getting-started-page-builders",
        "isPartOf": {
          "@type": "Blog",
          "name": "Web Design Insights"
        },
        "accessMode": "FULL_ACCESS",
        "contentType": "Blog Post"
      }, null, 2),
      tags: ['tutorial', 'beginner', 'web-design'],
      createdAt: new Date('2024-01-15T10:00:00Z'),
      updatedAt: new Date('2024-01-15T10:00:00Z')
    },
    {
      id: 'author-1',
      type: 'Person' as SchemaOrgType,
      name: 'Dr. Maria Rodriguez',
      data: {
        name: 'Dr. Maria Rodriguez',
        givenName: 'Maria',
        familyName: 'Rodriguez',
        jobTitle: 'Senior Research Scientist',
        worksFor: 'Tech Innovation Lab',
        email: 'maria.rodriguez@techinnovationlab.org',
        telephone: '+1-555-0123',
        url: 'https://mariaresearch.com',
        description: 'Leading researcher in AI and machine learning with over 15 years of experience.',
        image: 'https://via.placeholder.com/300x300/4F46E5/FFFFFF?text=MR',
        sameAs: 'https://linkedin.com/in/mariaresearch\nhttps://twitter.com/mariarodriguez_ai\nhttps://orcid.org/0000-0000-0000-0001'
      },
      jsonLD: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Person",
        "name": "Dr. Maria Rodriguez",
        "givenName": "Maria",
        "familyName": "Rodriguez",
        "jobTitle": "Senior Research Scientist",
        "worksFor": {
          "@type": "Organization",
          "name": "Tech Innovation Lab"
        },
        "email": "maria.rodriguez@techinnovationlab.org",
        "telephone": "+1-555-0123",
        "url": "https://mariaresearch.com",
        "description": "Leading researcher in AI and machine learning with over 15 years of experience.",
        "image": "https://via.placeholder.com/300x300/4F46E5/FFFFFF?text=MR",
        "sameAs": [
          "https://linkedin.com/in/mariaresearch",
          "https://twitter.com/mariarodriguez_ai",
          "https://orcid.org/0000-0000-0000-0001"
        ]
      }, null, 2),
      tags: ['researcher', 'ai', 'academia'],
      createdAt: new Date('2024-01-10T14:30:00Z'),
      updatedAt: new Date('2024-01-10T14:30:00Z')
    }
  ],
  selectedSchemaObject: null,
  addSchemaObject: (object) => {
    const id = `schema-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const now = new Date()
    const newObject: SchemaObject = {
      ...object,
      id,
      createdAt: now,
      updatedAt: now
    }
    set((state) => ({ 
      schemaObjects: [...state.schemaObjects, newObject] 
    }))
  },
  updateSchemaObject: (id, updates) => set((state) => ({
    schemaObjects: state.schemaObjects.map(obj => 
      obj.id === id ? { ...obj, ...updates, updatedAt: new Date() } : obj
    )
  })),
  removeSchemaObject: (id) => set((state) => ({
    schemaObjects: state.schemaObjects.filter(obj => obj.id !== id),
    selectedSchemaObject: state.selectedSchemaObject?.id === id ? null : state.selectedSchemaObject
  })),
  selectSchemaObject: (id) => set((state) => ({
    selectedSchemaObject: id ? state.schemaObjects.find(obj => obj.id === id) || null : null
  })),
  getSchemaObjectsByType: (type) => {
    const state = get()
    return state.schemaObjects.filter(obj => obj.type === type)
  },
  searchSchemaObjects: (query) => {
    const state = get()
    const lowerQuery = query.toLowerCase()
    return state.schemaObjects.filter(obj => 
      obj.name.toLowerCase().includes(lowerQuery) ||
      obj.type.toLowerCase().includes(lowerQuery) ||
      (obj.tags && obj.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
    )
  },
  
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
      
      // Modern theme: Maximum flexibility for digital-first design
      customizationRules: {
        colors: {
          canModifyPrimary: true,
          canModifySecondary: true,
          canModifyAccent: true,
          canModifyBackground: true,
          canModifyText: false, // Text color locked to maintain readability
          canModifyMuted: true
        },
        typography: {
          canModifyHeadingFont: true,
          canModifyBodyFont: true,
          canModifyBaseSize: true,
          canModifyScale: true
        },
        spacing: {
          canModifyBase: true,
          canModifyScale: true
        },
        components: {
          canModifyButtonRadius: true, // Modern allows border radius changes
          canModifyButtonWeight: true,
          canModifyCardRadius: true,
          canModifyCardShadow: true,
          canModifyFormRadius: true
        }
      },
      
      globalSections: {
        header: PREFAB_SECTIONS['header-section'] as any,
        footer: PREFAB_SECTIONS['footer-section'] as any
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
      
      // Classic theme: Restrictive customization to maintain scholarly tradition
      customizationRules: {
        colors: {
          canModifyPrimary: false, // Primary color locked to maintain scholarly identity
          canModifySecondary: true,
          canModifyAccent: true, // Allow accent color changes for some flexibility
          canModifyBackground: false, // Background locked to maintain readability
          canModifyText: false, // Text color locked for accessibility
          canModifyMuted: false // Muted text locked for consistency
        },
        typography: {
          canModifyHeadingFont: false, // Serif fonts are locked for tradition
          canModifyBodyFont: false, // Body font locked to maintain scholarly appearance
          canModifyBaseSize: true, // Allow size adjustments for accessibility
          canModifyScale: false // Scale locked to maintain hierarchy
        },
        spacing: {
          canModifyBase: false, // Base spacing locked for consistency
          canModifyScale: false // Scale locked for traditional layout
        },
        components: {
          canModifyButtonRadius: false, // No rounded buttons - maintains formal look
          canModifyButtonWeight: false, // Font weight locked for consistency
          canModifyCardRadius: false, // Card styling locked for uniformity
          canModifyCardShadow: false, // Shadow locked to prevent over-styling
          canModifyFormRadius: false // Form styling locked for professionalism
        }
      },
      
      globalSections: {
        header: PREFAB_SECTIONS['header-section'] as any,
        footer: PREFAB_SECTIONS['footer-section'] as any
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
      
      // Curator theme: Balanced customization for artistic flexibility
      customizationRules: {
        colors: {
          canModifyPrimary: true, // Allow primary color changes for artistic expression
          canModifySecondary: true,
          canModifyAccent: true,
          canModifyBackground: true, // Background customization for visual impact
          canModifyText: false, // Text color locked for readability over images
          canModifyMuted: true
        },
        typography: {
          canModifyHeadingFont: true, // Allow font changes for artistic expression
          canModifyBodyFont: false, // Body font locked to maintain readability
          canModifyBaseSize: true,
          canModifyScale: true // Allow scale changes for visual hierarchy
        },
        spacing: {
          canModifyBase: true, // Allow spacing changes for artistic layouts
          canModifyScale: true
        },
        components: {
          canModifyButtonRadius: false, // Sharp edges maintained for modern aesthetic
          canModifyButtonWeight: true, // Allow weight changes for emphasis
          canModifyCardRadius: false, // Sharp cards maintained for gallery feel
          canModifyCardShadow: true, // Allow shadow customization for depth
          canModifyFormRadius: false // Sharp forms for consistency
        }
      },
      
      globalSections: {
        header: PREFAB_SECTIONS['header-section'] as any,
        footer: PREFAB_SECTIONS['footer-section'] as any
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
      id: nanoid(),
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
    
    const template = state.templates.find(t => t.id === website.themeId)
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
      id: nanoid(),
      name: 'Section',
      type: 'content-block',
      layout,
      areas: []
    }
    
    // Configure areas based on layout
    switch (layout) {
      case 'one-column':
        newSection.areas = [
          { id: nanoid(), name: 'Content', widgets: [] }
        ]
        break
      case 'two-columns':
        newSection.areas = [
          { id: nanoid(), name: 'Left Column', widgets: [] },
          { id: nanoid(), name: 'Right Column', widgets: [] }
        ]
        break
      case 'three-columns':
        newSection.areas = [
          { id: nanoid(), name: 'Left Column', widgets: [] },
          { id: nanoid(), name: 'Center Column', widgets: [] },
          { id: nanoid(), name: 'Right Column', widgets: [] }
        ]
        break
      case 'one-third-left':
        newSection.areas = [
          { id: nanoid(), name: 'Left (1/3)', widgets: [] },
          { id: nanoid(), name: 'Right (2/3)', widgets: [] }
        ]
        break
      case 'one-third-right':
        newSection.areas = [
          { id: nanoid(), name: 'Left (2/3)', widgets: [] },
          { id: nanoid(), name: 'Right (1/3)', widgets: [] }
        ]
        break
      case 'vertical':
        newSection.areas = [
          { id: nanoid(), name: 'Top', widgets: [] },
          { id: nanoid(), name: 'Bottom', widgets: [] }
        ]
        break
      default:
        newSection.areas = [
          { id: nanoid(), name: 'Content', widgets: [] }
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

// Design System Console Websites component  
function SiteManagerWebsites() {
  const { websites, themes, removeModification, updateWebsite } = usePageStore()
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
      
      // Modification Analysis Modal
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
                  const impact = getModificationImpact(modification, theme ?? null)
                  if (!acc[impact]) acc[impact] = []
                  acc[impact].push(modification)
                  return acc
                }, {} as Record<string, Modification[]>)
                
                return (
                  <div className="space-y-6">
                    // Summary
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
                    
                    // Modification Details
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
      
      // Website Creation Wizard
      {showCreateWebsite && <WebsiteCreationWizard onClose={() => setShowCreateWebsite(false)} usePageStore={usePageStore} themePreviewImages={themePreviewImages} />}
    </div>
  )
}

// Theme preview images for Create Website dialog - Designed by Gemini! 🎨✨
const themePreviewImages = {
  'modernist-theme': '/theme-previews/digital-open-publishers.png', // Teal geometric - "TECHNOLOGY • ACCESS • IDEAS"
  'classicist-theme': '/theme-previews/academic-review.png',         // Navy & gold academic - "TRADITION • KNOWLEDGE • DISCOVERY"  
  'curator-theme': '/theme-previews/lumina-press.png'               // Artistic overlays - "ART • VISION • CREATION"
}

// NOTE: WebsiteCreationWizard component moved to src/components/Wizards/WebsiteCreation.tsx


// Theme Provider component that applies theme variables to canvas only
// NOTE: CanvasThemeProvider component moved to src/components/Canvas/CanvasThemeProvider.tsx

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
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentView('mock-live-site')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
            >
              <Globe className="w-4 h-4" />
              View Live Site
            </button>
          </div>
                  </div>
                </div>

      <div className="flex h-[calc(100vh-73px)]">
        <div className="w-64 bg-slate-100 shadow-sm border-r border-slate-200">
          <nav className="p-4">
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

            <div className="mt-6 mb-3">
              <div className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Themes
            </div>
            </div>
            <div className="space-y-1">
              {usedThemes.map((theme) => (
                <div key={theme.id}>
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
                  
            <div className="mt-6 mb-3">
              <div className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Websites
                            </div>
                          </div>
            <div className="space-y-1">
              {websites.map((website) => (
                <div key={website.id}>
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

          // Website-Specific Views
          // Wiley Online Library
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

          // Wiley Research Hub
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

          // Journal of Advanced Science
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


          {siteManagerView === 'websites' && <SiteManagerWebsites />}
          
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

// Website Settings Component
function WebsiteSettings({ websiteId }: { websiteId: string }) {
  const { websites, updateWebsite, themes } = usePageStore()
  const website = websites.find(w => w.id === websiteId)
  const currentTheme = website ? themes.find(t => t.id === website.themeId) : null
  
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

      {/* Combined Theme & Branding */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Theme & Branding</h3>
            <p className="text-gray-600 text-sm mt-2">
              Customize your website's visual appearance including logo, colors, typography, and advanced styling options.
            </p>
    </div>
        </div>
        
        {currentTheme ? (
          <div className="space-y-6">
            {/* Logo Section - Always Available */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span>Branding</span>
                <div className="h-px flex-1 bg-gray-200"></div>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              </div>
            </div>
            
            {/* Theme Customization Section */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span>Theme Customization</span>
                <div className="h-px flex-1 bg-gray-200"></div>
              </h4>
              <ThemeEditor 
                usePageStore={usePageStore} 
                themeId={website.themeId} 
                websiteId={website.id} 
              />
            </div>
          </div>
        ) : (
          <p className="text-gray-500 italic">Theme not found. Cannot load customization options.</p>
        )}
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

// NOTE: SortableItem component moved to src/components/Canvas/SortableItem.tsx

// NOTE: StandaloneWidgetDragHandle component moved to src/components/Canvas/StandaloneWidgetDragHandle.tsx

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
  const { currentView, mockLiveSiteRoute, setMockLiveSiteRoute, setCurrentView, setEditingContext } = usePageStore()
  
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
  
  if (currentView === 'mock-live-site') {
    return (
      <>
        <MockLiveSite 
          mockLiveSiteRoute={mockLiveSiteRoute}
          setMockLiveSiteRoute={setMockLiveSiteRoute}
          setCurrentView={setCurrentView}
          setEditingContext={setEditingContext}
        />
        <NotificationContainer />
      </>
    )
  }
  
  return (
    <>
      <PageBuilder 
        usePageStore={usePageStore}
        buildWidget={buildWidget}
        TemplateCanvas={TemplateCanvas}
        InteractiveWidgetRenderer={InteractiveWidgetRenderer}
        isSection={isSection}
      />
      <NotificationContainer />
      <IssuesSidebar />
    </>
  )
}
