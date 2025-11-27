/**
 * Interactive Widget Renderer
 * 
 * Renders widgets in the Page Builder editor with interactive editing features.
 * Supports inline editing, contentEditable, and special rendering for different widget types.
 * 
 * Extracted from AppV1.tsx for better modularity.
 */

import React from 'react'
import { usePageStore } from '../../stores'
import { SkinWrap } from '../Widgets/SkinWrap'
import { WidgetRenderer } from '../Widgets/WidgetRenderer'
import { PublicationCard } from '../Publications/PublicationCard'
import { generateAIContent, generateAISingleContent } from '../../utils/aiContentGeneration'
import { MOCK_SCHOLARLY_ARTICLES } from '../../constants'
import type { 
  Widget, 
  CanvasItem,
  WidgetBase,
  TextWidget, 
  ImageWidget, 
  HeadingWidget, 
  CodeWidget,
  PublicationListWidget, 
  PublicationDetailsWidget 
} from '../../types/widgets'
import { isSection } from '../../types/widgets'

// =============================================================================
// Props Interface
// =============================================================================

interface InteractiveWidgetRendererProps {
  widget: Widget
  dragAttributes?: any
  dragListeners?: any
  onWidgetClick?: (id: string, e: React.MouseEvent) => void
  activeSectionToolbar?: string | null
  setActiveSectionToolbar?: (value: string | null) => void
  activeWidgetToolbar?: string | null
  setActiveWidgetToolbar?: (value: string | null) => void
}

// =============================================================================
// Component
// =============================================================================

export function InteractiveWidgetRenderer({ 
  widget
}: InteractiveWidgetRendererProps) {
  const { schemaObjects } = usePageStore()
  const canvasItems = usePageStore((s) => s.canvasItems)
  const replaceCanvasItems = usePageStore((s) => s.replaceCanvasItems)
  
  switch (widget.type) {
    case 'navbar': {
      const isHeaderNavbar = widget.id === 'header-nav'
      
      if (isHeaderNavbar) {
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
      
      const alignClasses = { left: 'text-left', center: 'text-center', right: 'text-right' }
      const colorClasses = { 
        default: 'text-gray-900', primary: 'text-blue-600', 
        secondary: 'text-green-600', accent: 'text-orange-600', muted: 'text-gray-500' 
      }
      const sizeClasses = { small: 'text-lg', medium: 'text-xl', large: 'text-3xl', xl: 'text-5xl', auto: '' }
      
      const getSemanticDefaultSize = (level: number): 'small' | 'medium' | 'large' | 'xl' => {
        switch (level) {
          case 1: return 'xl'
          case 2: return 'large'
          case 3: return 'medium'
          case 4: return 'small'
          case 5: return 'small'
          case 6: return 'small'
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
      const parseInlineStyles = (stylesString?: string): React.CSSProperties => {
        if (!stylesString) return {};
        
        const styleObject: React.CSSProperties = {};
        const declarations = stylesString.split(';').filter(d => d.trim());
        
        declarations.forEach(declaration => {
          const [property, value] = declaration.split(':').map(s => s.trim());
          if (property && value) {
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
        ...inlineStyles
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
                      key={imageWidget.src}
                      src={imageWidget.src} 
                      alt={imageWidget.alt}
                      className={`rounded ${widthClasses[width]} ${ratio !== 'auto' ? aspectRatios[ratio] : ''}`}
                      style={{ 
                        objectFit: objectFit,
                        maxWidth: '100%',
                        height: ratio === 'auto' ? 'auto' : undefined
                      }}
                      onLoad={(e) => {
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
                    function resizeIframe() {
                      const height = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight, 300);
                      window.parent.postMessage({ type: 'resize', height: height }, '*');
                    }
                    window.addEventListener('load', resizeIframe);
                    window.addEventListener('resize', resizeIframe);
                    const observer = new MutationObserver(() => setTimeout(resizeIframe, 50));
                    observer.observe(document.body, { childList: true, subtree: true, attributes: true, characterData: true });
                    setTimeout(resizeIframe, 100);
                    setTimeout(resizeIframe, 500);
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
                const handleMessage = (event: MessageEvent) => {
                  if (event.data && event.data.type === 'resize' && event.source === iframe.contentWindow) {
                    iframe.style.height = event.data.height + 'px';
                  }
                };
                window.addEventListener('message', handleMessage);
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
      
    case 'code': {
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
    }
      
    case 'publication-list': {
      const publicationWidget = widget as PublicationListWidget
      
      let publications: any[] = []
      if (publicationWidget.contentSource === 'schema-objects' && publicationWidget.schemaSource) {
        const { selectionType, selectedIds, selectedType } = publicationWidget.schemaSource
        
        try {
          if (selectionType === 'by-type' && selectedType) {
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
        try {
          if (publicationWidget.aiSource.generatedContent && publicationWidget.aiSource.lastGenerated) {
            const hoursSinceGeneration = (Date.now() - publicationWidget.aiSource.lastGenerated.getTime()) / (1000 * 60 * 60)
            if (hoursSinceGeneration < 1) {
              publications = publicationWidget.aiSource.generatedContent
            } else {
              publications = generateAIContent(publicationWidget.aiSource.prompt)
            }
          } else {
            publications = generateAIContent(publicationWidget.aiSource.prompt)
          }
        } catch (error) {
          console.error('Error generating AI content:', error)
          publications = publicationWidget.publications
        }
      } else {
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
    }
      
    case 'publication-details': {
      const publicationDetailsWidget = widget as PublicationDetailsWidget
      let publication: any = null
      
      try {
        if (publicationDetailsWidget.contentSource === 'schema-objects' && publicationDetailsWidget.schemaSource?.selectedId) {
          const schemaObject = schemaObjects.find(obj => obj.id === publicationDetailsWidget.schemaSource?.selectedId)
          if (schemaObject) {
            publication = JSON.parse(schemaObject.jsonLD)
          }
        } else if (publicationDetailsWidget.contentSource === 'doi' && publicationDetailsWidget.doiSource?.doi) {
          publication = MOCK_SCHOLARLY_ARTICLES.find(article => 
            article.identifier?.value?.includes(publicationDetailsWidget.doiSource?.doi || '')
          ) || MOCK_SCHOLARLY_ARTICLES[0]
        } else if (publicationDetailsWidget.contentSource === 'ai-generated' && publicationDetailsWidget.aiSource?.prompt) {
          if (publicationDetailsWidget.aiSource.generatedContent && publicationDetailsWidget.aiSource.lastGenerated) {
            const hoursSinceGeneration = (Date.now() - publicationDetailsWidget.aiSource.lastGenerated.getTime()) / (1000 * 60 * 60)
            if (hoursSinceGeneration < 1) {
              publication = publicationDetailsWidget.aiSource.generatedContent
            } else {
              publication = generateAISingleContent(publicationDetailsWidget.aiSource.prompt)
            }
          } else {
            publication = generateAISingleContent(publicationDetailsWidget.aiSource.prompt)
          }
        } else if (publicationDetailsWidget.contentSource === 'context') {
          publication = MOCK_SCHOLARLY_ARTICLES[0]
        } else {
          publication = publicationDetailsWidget.publication || MOCK_SCHOLARLY_ARTICLES[0]
        }
      } catch (error) {
        console.error('Error loading publication details:', error)
        publication = MOCK_SCHOLARLY_ARTICLES[0]
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
    }
      
    case 'button':
      return <WidgetRenderer widget={widget} isLiveMode={false} />
    
    case 'menu':
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

