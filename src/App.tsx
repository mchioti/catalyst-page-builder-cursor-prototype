import { useMemo, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import React from 'react'
import { nanoid } from 'nanoid'
import { arrayMove } from '@dnd-kit/sortable'
import { X, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { MockLiveSite } from './components/MockLiveSite'
import { TemplateCanvas } from './components/Templates/TemplateCanvas'
import { mockWebsites } from './data/mockWebsites'
import { mockThemes } from './data/mockThemes'
import { mockStarterPages } from './data/mockStarterPages'
import { mockSections } from './data/mockSections'
import { PublicationCard } from './components/Publications/PublicationCard'
import { CanvasThemeProvider } from './components/Canvas/CanvasThemeProvider'
import { generateAIContent, generateAISingleContent } from './utils/aiContentGeneration'
import { PageBuilder } from './components/PageBuilder'
import { DynamicBrandingCSS } from './components/BrandingSystem/DynamicBrandingCSS'
import { DesignConsole } from './components/DesignConsole'
import { WidgetRenderer } from './components/Widgets/WidgetRenderer'
import { PrototypeControls } from './components/PrototypeControls'
import { create } from 'zustand'
import { type LibraryItem as SpecItem } from './library'

// Import specific types and constants from organized directories
import { 
// Widget types
  type Widget, type WidgetSection, type CanvasItem, isSection, 
  type Skin, type WidgetBase, type TextWidget, type ImageWidget, type NavbarWidget, type MenuWidget, type HTMLWidget, type CodeWidget, type HeadingWidget, type ButtonWidget, type PublicationListWidget, type PublicationDetailsWidget,
  // App types
  type PageState, type Notification, type PageIssue, type NotificationType, type TemplateModification,
  // Schema.org types
  type SchemaObject, type SchemaOrgType
} from './types'
import { 
  MOCK_SCHOLARLY_ARTICLES, 
  DEFAULT_PUBLICATION_CARD_CONFIG
} from './constants'
import { createDebugLogger } from './utils/logger'

// Control logging for this file
const DEBUG = false
const debugLog = createDebugLogger(DEBUG)

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
      const sizeClasses = { small: 'text-lg', medium: 'text-xl', large: 'text-3xl', xl: 'text-5xl', auto: '' }
      
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
          case 'hero': return 'font-bold mb-6 text-white'
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
      
      
      const headingClasses = [
        getStyleClasses(),
        alignClasses[h.align || 'left'],
        h.size === 'auto' 
          ? sizeClasses[getSemanticDefaultSize(h.level)]
          : sizeClasses[h.size || 'auto'],
        colorClasses[h.color || 'default']
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
      const textWidget = widget as TextWidget
      const align = textWidget.align ?? 'left'
      const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left'
      const isWileyLogo = textWidget.id === 'wiley-logo'
      const isHeroText = textWidget.id === 'hero-text'
      const isFooterText = textWidget.id === 'footer-text'
      const isFeatureText = textWidget.sectionId === 'features-section'
      
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
      
      // General text widget rendering
      // Parse inline styles string into React style object
      const parseInlineStyles = (stylesString?: string): React.CSSProperties => {
        if (!stylesString) return {};
        
        const styleObject: React.CSSProperties = {};
        const declarations = stylesString.split(';').filter(d => d.trim());
        
        declarations.forEach(declaration => {
          const [property, value] = declaration.split(':').map(s => s.trim());
          if (property && value) {
            // Convert kebab-case to camelCase for React
            const camelProperty = property.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
            (styleObject as any)[camelProperty] = value;
          }
        });
        
        return styleObject;
      };
      
      const inlineStyles = parseInlineStyles(textWidget.inlineStyles);
      const baseStyles = {
        color: 'var(--theme-color-text, #374151)',
        fontFamily: 'var(--theme-body-font, Inter, sans-serif)',
        fontSize: 'var(--theme-base-size, 16px)',
        ...inlineStyles // Apply user's inline styles on top
      };
      
      return (
        <SkinWrap skin={widget.skin}>
          <div className={`px-6 py-4 ${alignClass}`}>
            <p style={baseStyles}>
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
                <!DOCTYPE html>
                <html lang="en">
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <style>
                    body { 
                      margin: 0; 
                      padding: 16px; 
                      font-family: system-ui, -apple-system, sans-serif; 
                      line-height: 1.5;
                      background-color: transparent;
                    }
                    * { box-sizing: border-box; }
                    
                    /* Ensure clicks and interactions work properly in editor */
                    button, a, [onclick], [data-clickable], .clickable {
                      cursor: pointer !important;
                      user-select: none;
                      transition: all 0.2s ease;
                    }
                    
                    button:hover, a:hover, [onclick]:hover, [data-clickable]:hover, .clickable:hover {
                      opacity: 0.8;
                      transform: translateY(-1px);
                    }
                    
                    .html-widget-container {
                      min-height: 200px;
                    }
                  </style>
                </head>
                <body>
                  <div class="html-widget-container">
                    ${widget.htmlContent}
                  </div>
                  
                  <script>
                    // Auto-resize iframe to content
                    function resizeIframe() {
                      const height = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight, 300);
                      window.parent.postMessage({
                        type: 'resize',
                        height: height
                      }, '*');
                    }
                    
                    // Resize on load and content changes
                    window.addEventListener('load', resizeIframe);
                    window.addEventListener('resize', resizeIframe);
                    
                    // Set up mutation observer to detect content changes
                    const observer = new MutationObserver(() => {
                      setTimeout(resizeIframe, 50);
                    });
                    observer.observe(document.body, {
                      childList: true,
                      subtree: true,
                      attributes: true,
                      characterData: true
                    });
                    
                    // Initial resize
                    setTimeout(resizeIframe, 100);
                    setTimeout(resizeIframe, 500);
                    
                    // Enhanced click handling for editor mode
                    document.addEventListener('click', function(e) {
                      debugLog('log', 'HTML Widget Editor Click:', e.target);
                    }, true);
                    
                    // Initialize interactive elements
                    document.addEventListener('DOMContentLoaded', function() {
                      const interactiveElements = document.querySelectorAll('button, a, [onclick], [data-clickable], .clickable');
                      interactiveElements.forEach(el => {
                        el.style.cursor = 'pointer';
                      });
                    });
                  </script>
                </body>
                </html>
              `}
              className="w-full border-0 block"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-pointer-lock allow-modals allow-downloads"
              title="HTML Widget Content"
              style={{ 
                height: 'auto', 
                minHeight: '200px', 
                width: '100%',
                display: 'block',
                margin: 0,
                padding: 0,
                backgroundColor: 'transparent'
              }}
              onLoad={(e) => {
                const iframe = e.target as HTMLIFrameElement;
                
                // Listen for resize messages from iframe content
                const handleMessage = (event: MessageEvent) => {
                  if (event.data && event.data.type === 'resize' && event.source === iframe.contentWindow) {
                    iframe.style.height = event.data.height + 'px';
                  }
                };
                
                window.addEventListener('message', handleMessage);
                
                // Fallback resize for compatibility
                try {
                  setTimeout(() => {
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                    if (iframeDoc && iframeDoc.body) {
                      const height = Math.max(iframeDoc.body.scrollHeight, iframeDoc.documentElement.scrollHeight, 300);
                      iframe.style.height = height + 'px';
                    }
                  }, 300);
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
      
    case 'code':
      const codeWidget = widget as CodeWidget
      return (
        <SkinWrap skin={widget.skin}>
          <div className="px-6 py-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">Code Block</span>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{codeWidget.language}</span>
                  {codeWidget.showLineNumbers && <span>• Line Numbers</span>}
                  <span>• {codeWidget.theme === 'dark' ? 'Dark' : 'Light'} Theme</span>
                </div>
              </div>
              
              {codeWidget.codeContent ? (
                <div className={`rounded-lg border p-4 font-mono text-sm overflow-x-auto ${
                  codeWidget.theme === 'dark' 
                    ? 'bg-gray-900 text-gray-100 border-gray-700' 
                    : 'bg-gray-50 text-gray-900 border-gray-200'
                }`}>
                  {codeWidget.showLineNumbers ? (
                    <div className="flex">
                      <div className="flex flex-col text-right pr-4 text-gray-500 select-none border-r border-current/20 mr-4">
                        {codeWidget.codeContent.split('\n').map((_, index) => (
                          <span key={index} className="leading-relaxed">{index + 1}</span>
                        ))}
                      </div>
                      <div className="flex-1">
                        <pre className="whitespace-pre-wrap leading-relaxed">{codeWidget.codeContent}</pre>
                      </div>
                    </div>
                  ) : (
                    <pre className="whitespace-pre-wrap leading-relaxed">{codeWidget.codeContent}</pre>
                  )}
                </div>
              ) : (
                <div className="w-full min-h-[200px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                  <div className="text-center text-gray-600 px-4">
                    <div className="text-4xl mb-2">💻</div>
                    <div className="text-sm font-medium">Empty Code Block</div>
                    <div className="text-xs mt-1">Add code content in properties panel →</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </SkinWrap>
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
      // ✅ Delegate to WidgetRenderer for consistent rendering (NO TAILWIND)
      return <WidgetRenderer widget={widget} isLiveMode={false} />
    
    case 'menu':
      // Menu widget - delegate to WidgetRenderer for consistent rendering
      return (
        <WidgetRenderer 
          widget={widget} 
          schemaObjects={schemaObjects}
        />
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
        icon: {
          enabled: false,
          position: 'left',
          emoji: '🎯'
        }
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
    
    case 'code-block':
      return {
        ...baseWidget,
        type: 'code',
        title: 'Code Block',
        language: 'javascript',
        codeContent: '// Your code here\nconsole.log("Hello, world!");',
        showLineNumbers: true,
        theme: 'light'
      } as CodeWidget;
    
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
    
    case 'menu':
      // Start with sample menu items so widget is visible
      return {
        ...baseWidget,
        type: 'menu',
        menuType: 'global',
        style: 'horizontal',
        items: [
          {
            id: nanoid(),
            label: 'Home',
            url: '#',
            target: '_self',
            displayCondition: 'always',
            order: 0
          },
          {
            id: nanoid(),
            label: 'About',
            url: '#',
            target: '_self',
            displayCondition: 'always',
            order: 1
          },
          {
            id: nanoid(),
            label: 'Contact',
            url: '#',
            target: '_self',
            displayCondition: 'always',
            order: 2
          }
        ]
      } as MenuWidget;
    
    case 'tabs':
      // Start with 2 empty tabs so widget is visible
      return {
        ...baseWidget,
        type: 'tabs',
        tabs: [
          {
            id: nanoid(),
            label: 'Tab 1',
            widgets: []
          },
          {
            id: nanoid(),
            label: 'Tab 2',
            widgets: []
          }
        ],
        activeTabIndex: 0,
        tabStyle: 'underline',
        align: 'left'
      } as any; // TabsWidget
    
    case 'divider':
      // Horizontal rule for visual separation
      return {
        ...baseWidget,
        type: 'divider',
        style: 'solid',
        thickness: '1px',
        color: '#e5e7eb', // gray-200
        marginTop: '1rem',
        marginBottom: '1rem'
      } as any; // DividerWidget
    
    case 'spacer':
      // Vertical spacing
      return {
        ...baseWidget,
        type: 'spacer',
        height: '2rem' // Default 32px spacing
      } as any; // SpacerWidget
    
    case 'editorial-card':
      // SharePoint-inspired editorial/marketing card
      return {
        ...baseWidget,
        type: 'editorial-card',
        layout: 'image-overlay',
        content: {
          preheader: {
            enabled: true,
            text: 'ADD SECTION OR CATEGORY NAME'
          },
          headline: {
            enabled: true,
            text: 'Add a headline'
          },
          description: {
            enabled: true,
            text: 'Describe what your story is about'
          },
          callToAction: {
            enabled: true,
            text: 'Learn more',
            url: '#',
            type: 'button'
          }
        },
        image: {
          src: '',
          alt: 'Editorial card image'
        },
        config: {
          contentAlignment: 'left',
          imagePosition: 'top',
          overlayOpacity: 60,
          useAccentColor: true
        }
      } as any; // EditorialCardWidget
    
    case 'collapse':
      // Start with 2 empty panels so widget is visible
      return {
        ...baseWidget,
        type: 'collapse',
        panels: [
          {
            id: nanoid(),
            title: 'Panel 1',
            isOpen: true,  // First panel open by default
            widgets: []
          },
          {
            id: nanoid(),
            title: 'Panel 2',
            isOpen: false,
            widgets: []
          }
        ],
        allowMultiple: false, // Accordion behavior by default
        iconPosition: 'right',
        style: 'default'
      } as any; // CollapseWidget
    
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

// LocalStorage keys
const STORAGE_KEYS = {
  CUSTOM_STARTER_PAGES: 'catalyst-custom-starter-pages',
  CUSTOM_SECTIONS: 'catalyst-custom-sections'
}

// Load user-created starters and sections from localStorage
// Reviver function to convert date strings back to Date objects
const dateReviver = (key: string, value: any) => {
  // Check if the value looks like an ISO date string
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
    return new Date(value)
  }
  return value
}

const loadFromLocalStorage = <T,>(key: string, defaultValue: T[]): T[] => {
  try {
    const stored = localStorage.getItem(key)
    if (!stored) return defaultValue
    return JSON.parse(stored, dateReviver) // Use reviver to convert date strings
  } catch (error) {
    console.error(`Failed to load ${key} from localStorage:`, error)
    return defaultValue
  }
}

// Save to localStorage
const saveToLocalStorage = <T,>(key: string, data: T[]) => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error(`Failed to save ${key} to localStorage:`, error)
  }
}

// Initialize with mock data + user-created data from localStorage
const initializeCustomStarterPages = () => {
  const userCreatedPages = loadFromLocalStorage(STORAGE_KEYS.CUSTOM_STARTER_PAGES, [])
  // Merge: mock demo pages + user-created pages
  return [...mockStarterPages, ...userCreatedPages]
}

const initializeCustomSections = () => {
  const userCreatedSections = loadFromLocalStorage(STORAGE_KEYS.CUSTOM_SECTIONS, [])
  // Merge: mock demo sections + user-created sections
  return [...mockSections, ...userCreatedSections]
}

export const usePageStore = create<PageState>((set, get) => ({
  // Routing  
  currentView: 'design-console',
  siteManagerView: 'websites', 
  editingContext: 'page', // 'template' | 'page' | 'website'
  templateEditingContext: null, // Track template editing context for propagation
  currentWebsiteId: 'catalyst-demo-site', // Track which website is currently being edited
  mockLiveSiteRoute: '/', // Default to homepage
  previewBrandMode: 'wiley' as 'wiley' | 'wt' | 'dummies', // For theme preview in Design Console
  previewThemeId: 'classic-ux3-theme', // For theme preview in Design Console
  
  // Prototype Controls
  currentPersona: 'publisher' as 'publisher' | 'pb-admin' | 'developer', // Current user persona for prototyping
  consoleMode: 'multi' as 'multi' | 'single', // Multi-website publisher or single website
  setCurrentPersona: (persona: 'publisher' | 'pb-admin' | 'developer') => set({ currentPersona: persona }),
  setConsoleMode: (mode: 'multi' | 'single') => set({ consoleMode: mode }),
  
  setCurrentView: (view) => set({ currentView: view }),
  setSiteManagerView: (view) => set({ siteManagerView: view }),
  setEditingContext: (context) => set({ editingContext: context }),
  setTemplateEditingContext: (context) => set({ templateEditingContext: context }),
  setCurrentWebsiteId: (websiteId) => set({ currentWebsiteId: websiteId }),
  setMockLiveSiteRoute: (route) => set({ mockLiveSiteRoute: route }),
  setPreviewBrandMode: (mode: 'wiley' | 'wt' | 'dummies') => set({ previewBrandMode: mode }),
  setPreviewThemeId: (themeId: string) => set({ previewThemeId: themeId }),
  
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
  canvasItems: [], // Start empty - content loaded via Design Console navigation
  routeCanvasItems: {}, // Route-specific canvas storage
  globalTemplateCanvas: [], // Global template changes
  journalTemplateCanvas: {}, // Journal-specific template storage
  customSections: initializeCustomSections(), // Mock demo sections + user-created sections from localStorage
  customStarterPages: initializeCustomStarterPages(), // Mock demo pages + user-created pages from localStorage
  // Template System Data
  // Templates are now organized within themes instead of standalone
  templates: [],
  
  websites: mockWebsites,
  
  themes: mockThemes,
  
  // Template Divergence Tracking
  templateModifications: [],
  exemptedRoutes: new Set<string>(),
  
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
  isEditingLoadedWebsite: false, // Track if editing a website loaded from Design Console vs blank draft
  setIsEditingLoadedWebsite: (value: boolean) => set({ isEditingLoadedWebsite: value }),
  selectWidget: (id) => {
    // Simple approach: just update state without scroll intervention
    // The preventDefault() in click handlers should be enough
    set({ selectedWidget: id })
  },
  
  // Route-specific canvas management
  getCanvasItemsForRoute: (route) => {
    const state = get()
    return state.routeCanvasItems[route] || []
  },
  setCanvasItemsForRoute: (route, items) => set((state) => ({
    routeCanvasItems: {
      ...state.routeCanvasItems,
      [route]: items
    }
  })),
  clearCanvasItemsForRoute: (route) => set((state) => {
    const newRouteCanvasItems = { ...state.routeCanvasItems }
    delete newRouteCanvasItems[route]
    return { routeCanvasItems: newRouteCanvasItems }
  }),
  
  // Global template management
  setGlobalTemplateCanvas: (items) => set({ globalTemplateCanvas: items }),
  clearGlobalTemplateCanvas: () => set({ globalTemplateCanvas: [] }),
  
  // Journal template management
  setJournalTemplateCanvas: (journalCode, items) => set((state) => ({
    journalTemplateCanvas: {
      ...state.journalTemplateCanvas,
      [journalCode]: items
    }
  })),
  getJournalTemplateCanvas: (journalCode) => {
    const state = get()
    return state.journalTemplateCanvas[journalCode] || []
  },
  clearJournalTemplateCanvas: (journalCode) => set((state) => {
    const newJournalTemplateCanvas = { ...state.journalTemplateCanvas }
    delete newJournalTemplateCanvas[journalCode]
    return { journalTemplateCanvas: newJournalTemplateCanvas }
  }),
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
  addCustomSection: (section) => set((s) => {
    const newSections = [...s.customSections, section]
    // Save only user-created sections (exclude mock demo sections)
    const userCreatedSections = newSections.filter(sec => sec.source === 'user')
    saveToLocalStorage(STORAGE_KEYS.CUSTOM_SECTIONS, userCreatedSections)
    return { customSections: newSections }
  }),
  removeCustomSection: (id) => set((s) => {
    const filteredSections = s.customSections.filter(section => section.id !== id)
    // Save only user-created sections (exclude mock demo sections)
    const userCreatedSections = filteredSections.filter(sec => sec.source === 'user')
    saveToLocalStorage(STORAGE_KEYS.CUSTOM_SECTIONS, userCreatedSections)
    return { customSections: filteredSections }
  }),
  
  // Custom Starter Pages management
  addCustomStarterPage: (starterPage) => set((s) => {
    const newPages = [...s.customStarterPages, starterPage]
    // Save only user-created pages (exclude mock demo pages)
    const userCreatedPages = newPages.filter(page => page.source === 'user')
    saveToLocalStorage(STORAGE_KEYS.CUSTOM_STARTER_PAGES, userCreatedPages)
    return { customStarterPages: newPages }
  }),
  removeCustomStarterPage: (id) => set((s) => {
    const filteredPages = s.customStarterPages.filter(page => page.id !== id)
    // Save only user-created pages (exclude mock demo pages)
    const userCreatedPages = filteredPages.filter(page => page.source === 'user')
    saveToLocalStorage(STORAGE_KEYS.CUSTOM_STARTER_PAGES, userCreatedPages)
    return { customStarterPages: filteredPages }
  }),
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
  
  // Template Divergence Management
  trackModification: (route, journalCode, journalName, templateId) => {
    debugLog('log', '🔵 trackModification CALLED:', { route, journalCode, journalName, templateId })
    const state = get()
    const existingModification = state.templateModifications.find(c => c.route === route)
    debugLog('log', '🔍 Existing modification:', existingModification)
    debugLog('log', '📊 Current modifications:', state.templateModifications)
    
    if (existingModification) {
      // Update existing
      debugLog('log', '♻️ Updating existing modification, count:', existingModification.modificationCount + 1)
      set((s) => ({
        templateModifications: s.templateModifications.map(c => 
          c.route === route 
            ? { ...c, modificationCount: c.modificationCount + 1, lastModified: new Date() }
            : c
        )
      }))
    } else {
      // Add new
      debugLog('log', '✨ Creating NEW modification')
      const newModification: TemplateModification = {
        route,
        journalCode,
        journalName,
        templateId,
        modificationCount: 1,
        lastModified: new Date(),
        isExempt: false
      }
      set((s) => ({
        templateModifications: [...s.templateModifications, newModification]
      }))
    }
    
    // Verify update
    const updatedState = get()
    debugLog('log', '✅ Updated modifications:', updatedState.templateModifications)
  },
  
  getModificationsForTemplate: (templateId) => {
    const state = get()
    return state.templateModifications.filter(c => c.templateId === templateId)
  },
  
  getModificationForRoute: (route) => {
    const state = get()
    return state.templateModifications.find(c => c.route === route) || null
  },
  
  exemptFromUpdates: (route) => {
    const state = get()
    const newExemptedRoutes = new Set(state.exemptedRoutes)
    newExemptedRoutes.add(route)
    
    set((s) => ({
      exemptedRoutes: newExemptedRoutes,
      templateModifications: s.templateModifications.map(c =>
        c.route === route ? { ...c, isExempt: true } : c
      )
    }))
  },
  
  removeExemption: (route) => {
    const state = get()
    const newExemptedRoutes = new Set(state.exemptedRoutes)
    newExemptedRoutes.delete(route)
    
    set((s) => ({
      exemptedRoutes: newExemptedRoutes,
      templateModifications: s.templateModifications.map(c =>
        c.route === route ? { ...c, isExempt: false } : c
      )
    }))
  },
  
  resetToBase: (route) => {
    const state = get()
    const { routeCanvasItems, journalTemplateCanvas } = state
    
    // Extract journal code from route - handle BOTH patterns:
    // 1. Individual issue: 'toc/embo/current' → 'embo'
    // 2. Journal template: 'journal/embo' → 'embo'
    let journalCode: string | null = null
    
    if (route.startsWith('journal/')) {
      // Journal template route: 'journal/embo' → 'embo'
      journalCode = route.replace('journal/', '')
    } else {
      // Individual issue route: 'toc/embo/current' → 'embo'
      const journalCodeMatch = route.match(/\/toc\/([^\/]+)/)
      journalCode = journalCodeMatch ? journalCodeMatch[1] : null
    }
    
    debugLog('log', `🔄 Resetting ${route} to base template`, { journalCode, routeType: route.startsWith('journal/') ? 'journal template' : 'individual issue' })
    
    // Remove route-specific canvas (individual issue)
    const newRouteCanvasItems = { ...routeCanvasItems }
    delete newRouteCanvasItems[route]
    
    // ALSO remove journal template if we have a journal code
    // This ensures the base template can be inherited properly
    const newJournalTemplateCanvas = { ...journalTemplateCanvas }
    if (journalCode) {
      delete newJournalTemplateCanvas[journalCode]
      debugLog('log', `  ↳ Also clearing journal template for: ${journalCode}`)
    }
    
    // Remove modification tracking for BOTH individual issue AND journal template
    set((s) => ({
      routeCanvasItems: newRouteCanvasItems,
      journalTemplateCanvas: newJournalTemplateCanvas,
      templateModifications: s.templateModifications.filter(c => 
        c.route !== route && c.route !== `journal/${journalCode}`
      )
    }))
    
    debugLog('log', `✅ Reset complete - ${route} will now inherit from base template`)
  },
  
  promoteToBase: (route, templateId) => {
    const state = get()
    const { routeCanvasItems, journalTemplateCanvas, templateModifications } = state
    
    // Check if this is a journal template (route starts with 'journal/')
    const isJournalTemplate = route.startsWith('journal/')
    let customizedCanvas: CanvasItem[]
    
    if (isJournalTemplate) {
      // Promoting from journal template level
      const journalCode = route.replace('journal/', '')
      customizedCanvas = journalTemplateCanvas[journalCode] || []
      debugLog('log', `⬆️ Promoting journal template to base: ${journalCode}`)
    } else {
      // Promoting from individual route level (legacy behavior)
      customizedCanvas = routeCanvasItems[route] || []
      debugLog('log', `⬆️ Promoting individual route to base: ${route}`)
    }
    
    if (!customizedCanvas || customizedCanvas.length === 0) {
      console.warn(`No customized canvas found for route ${route}`)
      return
    }
    
    // Get all modifications for this template that are NOT exempted
    const affectedModifications = templateModifications.filter(
      c => c.templateId === templateId && c.route !== route && !c.isExempt
    )
    
    // Set as global template
    set({ globalTemplateCanvas: customizedCanvas })
    
    // Clear the promoted source (either route or journal template)
    if (isJournalTemplate) {
      const journalCode = route.replace('journal/', '')
      const newJournalTemplateCanvas = { ...journalTemplateCanvas }
      delete newJournalTemplateCanvas[journalCode]
      set({ journalTemplateCanvas: newJournalTemplateCanvas })
    } else {
      const newRouteCanvasItems = { ...routeCanvasItems }
      delete newRouteCanvasItems[route]
      set({ routeCanvasItems: newRouteCanvasItems })
    }
    
    // Remove customizations that now match the new base
    set((s) => ({
      templateModifications: s.templateModifications.filter(c => c.route !== route)
    }))
    
    debugLog('log', `✅ Promoted ${route} to base template`)
    debugLog('log', `📊 ${affectedModifications.length} journals will inherit this change`)
  },
  
  promoteToJournalTemplate: (route, journalCode, _templateId) => {
    const state = get()
    const { routeCanvasItems } = state
    const customizedCanvas = routeCanvasItems[route]
    
    if (!customizedCanvas) {
      console.warn(`No customized canvas found for route ${route}`)
      return
    }
    
    debugLog('log', `⬆️ Promoting individual issue to journal template: ${journalCode}`)
    
    // Set as journal template (affects all issues for this journal)
    set((s) => ({
      journalTemplateCanvas: {
        ...s.journalTemplateCanvas,
        [journalCode]: customizedCanvas
      }
    }))
    
    // Clear the promoted route's customization (it now matches journal template)
    const newRouteCanvasItems = { ...routeCanvasItems }
    delete newRouteCanvasItems[route]
    
    // Update customization tracking - change from individual to journal level
    set((s) => ({
      routeCanvasItems: newRouteCanvasItems,
      templateModifications: s.templateModifications.map(c =>
        c.route === route 
          ? { ...c, route: `journal/${journalCode}`, modificationCount: c.modificationCount }
          : c
      )
    }))
    
    debugLog('log', `✅ Promoted to journal template: ${journalCode}`)
    debugLog('log', `📊 All ${journalCode} issues will inherit this change`)
  },
  
  promoteToPublisherTheme: (templateId, _journalCode) => {
    const state = get()
    const { globalTemplateCanvas } = state
    
    if (!globalTemplateCanvas || globalTemplateCanvas.length === 0) {
      console.warn(`No base template found to promote to publisher theme`)
      return
    }
    
    debugLog('log', `⬆️ Promoting base template to publisher theme: ${templateId}`)
    
    // TODO: Implement publisher theme storage
    // For now, just show success message
    debugLog('log', `✅ Base template promoted to Publisher Theme`)
    debugLog('log', `📊 All websites in publisher network will inherit this change`)
    
    // This would store in a publisherThemeCanvas at a higher level
    // publisherThemeCanvas[templateId] = globalTemplateCanvas
  },
  
  updateModificationCount: (route, count) => {
    set((s) => ({
      templateModifications: s.templateModifications.map(c =>
        c.route === route ? { ...c, modificationCount: count, lastModified: new Date() } : c
      )
    }))
  },
  
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
      case 'flexible':
        // Flexible layout: single content area with flex configuration
        newSection.areas = [
          { id: nanoid(), name: 'Flex Items', widgets: [] }
        ]
        // Initialize with default flex config (simplified Puck-style)
        newSection.flexConfig = {
          direction: 'row',
          wrap: true,
          justifyContent: 'flex-start',
          gap: '1rem'
        }
        break
      case 'grid':
        // Grid layout: single content area with grid configuration
        newSection.areas = [
          { id: nanoid(), name: 'Grid Items', widgets: [] }
        ]
        // Initialize with default grid config
        newSection.gridConfig = {
          columns: 3,
          gap: '1rem',
          alignItems: 'stretch',
          justifyItems: 'stretch'
        }
        break
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


export default function App() {
  const { 
    currentView, 
    mockLiveSiteRoute, 
    setMockLiveSiteRoute, 
    setCurrentView, 
    setEditingContext, 
    currentWebsiteId,
    currentPersona,
    setCurrentPersona,
    consoleMode,
    setConsoleMode
  } = usePageStore()
  
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
        <DynamicBrandingCSS websiteId={currentWebsiteId} usePageStore={usePageStore} />
        <CanvasThemeProvider 
          usePageStore={usePageStore} 
          scopeCSS={true}
        >
          <DesignConsole />
        </CanvasThemeProvider>
        <NotificationContainer />
        <PrototypeControls
          currentPersona={currentPersona}
          onPersonaChange={setCurrentPersona}
          consoleMode={consoleMode}
          onConsoleModeChange={setConsoleMode}
        />
      </>
    )
  }
  
  if (currentView === 'mock-live-site') {
    return (
      <>
        <DynamicBrandingCSS websiteId={currentWebsiteId} usePageStore={usePageStore} />
        <CanvasThemeProvider usePageStore={usePageStore}>
          <MockLiveSite 
            mockLiveSiteRoute={mockLiveSiteRoute}
            setMockLiveSiteRoute={setMockLiveSiteRoute}
            setCurrentView={setCurrentView}
            setEditingContext={setEditingContext}
            usePageStore={usePageStore}
          />
        </CanvasThemeProvider>
        <NotificationContainer />
        <PrototypeControls
          currentPersona={currentPersona}
          onPersonaChange={setCurrentPersona}
          consoleMode={consoleMode}
          onConsoleModeChange={setConsoleMode}
        />
      </>
    )
  }
  
  return (
    <>
      <DynamicBrandingCSS websiteId={currentWebsiteId} usePageStore={usePageStore} />
      <PageBuilder 
        usePageStore={usePageStore}
        buildWidget={buildWidget}
        TemplateCanvas={TemplateCanvas}
        InteractiveWidgetRenderer={InteractiveWidgetRenderer}
        isSection={isSection}
      />
      <NotificationContainer />
      <IssuesSidebar />
      <PrototypeControls
        currentPersona={currentPersona}
        onPersonaChange={setCurrentPersona}
        consoleMode={consoleMode}
        onConsoleModeChange={setConsoleMode}
      />
    </>
  )
}
