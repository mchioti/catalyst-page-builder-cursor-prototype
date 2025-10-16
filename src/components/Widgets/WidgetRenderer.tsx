import React from 'react'
import type { Widget, ButtonWidget, TextWidget, ImageWidget, NavbarWidget, HTMLWidget, HeadingWidget, PublicationListWidget, PublicationDetailsWidget } from '../../types'
import { PublicationCard } from '../Publications/PublicationCard'
import { generateAIContent, generateAISingleContent } from '../../utils/aiContentGeneration'

// Import usePageStore for updating widget state
declare global {
  interface Window {
    usePageStore: any
  }
}
const usePageStore = window.usePageStore

// Widget skin wrapper component
const SkinWrap: React.FC<{ skin: string; children: React.ReactNode }> = ({ skin, children }) => {
  const skinClasses = {
    minimal: 'bg-white',
    modern: 'bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4',
    classic: 'bg-gray-50 border border-gray-200 rounded p-4',
    accent: 'bg-accent-50 border border-accent-200 rounded p-4',
    hero: 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-12 px-6',
    journal: 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-12 px-6',
    primary: 'bg-blue-700 text-white py-3 px-6',
    dark: 'bg-black text-white py-2 px-6',
    muted: 'text-gray-600 text-sm',
    center: 'text-center',
    footer: 'bg-gray-900 text-white py-8 px-6',
    compact: 'space-y-4',
    raw: '' // No styling for raw HTML
  }
  
  return (
    <div className={skinClasses[skin as keyof typeof skinClasses] || skinClasses.minimal}>
      {children}
    </div>
  )
}

// Button Widget Component
const ButtonWidgetRenderer: React.FC<{ widget: ButtonWidget }> = ({ widget }) => {
  const variantClasses = {
    solid: 'bg-red-600 text-white hover:bg-red-700',
    outline: 'border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white',
    ghost: 'text-red-600 hover:bg-red-50'
  }
  
  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg'
  }
  
  const classes = `
    font-medium rounded transition-colors duration-200 cursor-pointer
    ${variantClasses[widget.variant] || variantClasses.solid}
    ${sizeClasses[widget.size] || sizeClasses.medium}
  `.trim()
  
  if (widget.url) {
    return (
      <a href={widget.url} className={classes}>
        {widget.text}
      </a>
    )
  }
  
  return (
    <button className={classes} onClick={() => widget.onClick && eval(widget.onClick)}>
      {widget.text}
    </button>
  )
}

// Text Widget Component  
const TextWidgetRenderer: React.FC<{ widget: TextWidget }> = ({ widget }) => {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center', 
    right: 'text-right'
  }
  
  return (
    <p className={`${alignClasses[widget.align || 'left']}`}>
      {widget.text}
    </p>
  )
}

// Image Widget Component
const ImageWidgetRenderer: React.FC<{ widget: ImageWidget }> = ({ widget }) => {
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
  
  const alignment = widget.alignment || 'center'
  const width = widget.width || 'full'
  const objectFit = widget.objectFit || 'cover'
  const ratio = widget.ratio || 'auto'
  
  // Show placeholder if no image source
  if (!widget.src || widget.src.trim() === '') {
    return (
      <div className={`${alignmentClasses[alignment]} ${widthClasses[width]} mx-auto`}>
        <div className={`bg-gray-200 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500 ${ratio !== 'auto' ? aspectRatios[ratio] : 'min-h-[200px]'}`}>
          <div className="text-center p-6">
            <div className="text-4xl mb-2">🖼️</div>
            <div className="text-sm font-medium">No Image Selected</div>
            <div className="text-xs mt-1">Add an image URL in properties</div>
          </div>
        </div>
        {widget.caption && (
          <p className="text-sm text-gray-600 mt-2 italic">{widget.caption}</p>
        )}
      </div>
    )
  }
  
  const imageElement = (
    <img 
      key={widget.src} // Force re-mount when src changes
      src={widget.src} 
      alt={widget.alt}
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
        // Show error placeholder
        const placeholder = target.nextElementSibling as HTMLElement
        if (placeholder) {
          placeholder.style.display = 'flex'
        }
      }}
    />
  )
  
  // Error placeholder (hidden by default)
  const errorPlaceholder = (
    <div 
      className={`bg-red-50 border-2 border-dashed border-red-200 rounded-lg flex items-center justify-center text-red-500 ${ratio !== 'auto' ? aspectRatios[ratio] : 'min-h-[200px]'} ${widthClasses[width]}`}
      style={{ display: 'none' }}
    >
      <div className="text-center p-6">
        <div className="text-4xl mb-2">❌</div>
        <div className="text-sm font-medium">Failed to Load Image</div>
        <div className="text-xs mt-1">Check image URL</div>
      </div>
    </div>
  )
  
  const content = (
    <div className={alignmentClasses[alignment]}>
      <div className="inline-block">
        {imageElement}
        {errorPlaceholder}
        {widget.caption && (
          <p className="text-sm text-gray-600 mt-2 italic">{widget.caption}</p>
        )}
      </div>
    </div>
  )
  
  // Wrap with link if provided
  if (widget.link && widget.link.trim() !== '') {
    return (
      <a 
        href={widget.link}
        target="_blank" 
        rel="noopener noreferrer"
        className="block hover:opacity-90 transition-opacity"
      >
        {content}
      </a>
    )
  }
  
  return content
}

// Navbar Widget Component
const NavbarWidgetRenderer: React.FC<{ widget: NavbarWidget }> = ({ widget }) => {
  return (
    <nav className="flex items-center justify-center gap-6">
      {widget.links.map((link, index) => (
        <a 
          key={`${link.label}-${index}`}
          href={link.href}
          className="text-current hover:opacity-75 transition-opacity"
        >
          {link.label}
        </a>
      ))}
    </nav>
  )
}

// HTML Widget Component
const HTMLWidgetRenderer: React.FC<{ widget: HTMLWidget }> = ({ widget }) => {
  if (!widget.htmlContent || widget.htmlContent.trim() === '') {
    // Show placeholder when no content
    return (
      <div className="min-h-[200px] bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <div className="text-2xl">📝</div>
        </div>
        <div className="text-lg font-medium text-gray-900 mb-2">
          {widget.title || 'HTML Widget'}
        </div>
        <div className="text-sm text-gray-600 max-w-md">
          Click to edit this widget and add your custom HTML content.
        </div>
      </div>
    )
  }
  
  // Render HTML content in an iframe for safety
  return (
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
        // Auto-resize iframe to content
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
  )
}

// Heading Widget Component
const HeadingWidgetRenderer: React.FC<{ widget: HeadingWidget }> = ({ widget }) => {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }
  
  const colorClasses = {
    default: 'text-gray-900',
    primary: 'text-blue-600',
    secondary: 'text-green-600', 
    accent: 'text-orange-600',
    muted: 'text-gray-500'
  }
  
  const sizeClasses = {
    small: 'text-lg',
    medium: 'text-xl', 
    large: 'text-2xl',
    xl: 'text-4xl',
    auto: ''
  }
  
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
  
  const spacingClasses = {
    tight: 'mb-2',
    normal: 'mb-4',
    loose: 'mb-6'
  }
  
  const getStyleClasses = () => {
    const style = widget.style || 'default'
    
    switch (style) {
      case 'bordered-left':
        return 'border-l-4 border-current pl-4'
      case 'underlined':
        return 'border-b-2 border-current pb-2 inline-block'
      case 'highlighted':
        return 'bg-gradient-to-r from-yellow-100 to-yellow-50 px-3 py-2 rounded'
      case 'decorated':
        return 'relative'
      case 'gradient':
        return 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'
      default:
        return ''
    }
  }
  
  const HeadingTag = `h${widget.level}` as keyof React.JSX.IntrinsicElements
  
  const getFontStyleClasses = () => {
    const styles = []
    if (widget.fontStyle?.bold) styles.push('font-bold')
    if (widget.fontStyle?.italic) styles.push('italic')
    if (widget.fontStyle?.underline) styles.push('underline')
    if (widget.fontStyle?.strikethrough) styles.push('line-through')
    return styles.join(' ')
  }
  
  const headingClasses = [
    getStyleClasses(),
    getFontStyleClasses(),
    alignClasses[widget.align || 'left'],
    widget.size === 'auto' 
      ? sizeClasses[getSemanticDefaultSize(widget.level)]
      : sizeClasses[widget.size || 'auto'],
    colorClasses[widget.color || 'default'],
    spacingClasses[widget.spacing || 'normal']
  ].filter(Boolean).join(' ')
  
  return (
    <HeadingTag className={headingClasses}>
      {widget.icon?.enabled && widget.icon?.position === 'left' && (
        <span className="mr-2">{widget.icon?.emoji || '🎯'}</span>
      )}
      {widget.text}
      {widget.icon?.enabled && widget.icon?.position === 'right' && (
        <span className="ml-2">{widget.icon?.emoji || '✨'}</span>
      )}
      {widget.style === 'decorated' && (
        <div className="absolute -bottom-2 left-0 w-12 h-0.5 bg-current opacity-60"></div>
      )}
    </HeadingTag>
  )
}

// Publication Details Widget Component (journal metadata)
const PublicationDetailsWidgetRenderer: React.FC<{ widget: PublicationDetailsWidget; schemaObjects: any[] }> = ({ widget, schemaObjects }) => {
  // Helper to safely get identifier from publication data
  const getIdentifierValue = (pub: any, type: string) => {
    if (Array.isArray(pub.identifier)) {
      const found = pub.identifier.find((id: any) => 
        id.name?.includes(type.toLowerCase()) || id.propertyID === type
      )
      return found?.value || found?.identifier || null
    }
    return null
  }

  // Get publication based on content source
  let publication: any = null
  
  try {
    if (widget.contentSource === 'schema-objects' && widget.schemaSource?.selectedId) {
      // Get single schema object by ID
      const schemaObj = schemaObjects.find(obj => obj.id === widget.schemaSource?.selectedId)
      if (schemaObj) {
        try {
          publication = JSON.parse(schemaObj.jsonLD)
        } catch (e) {
          console.error('Failed to parse JSON-LD for publication details:', schemaObj.id, e)
          publication = null
        }
      }
    } else if (widget.contentSource === 'ai-generated' && widget.aiSource?.prompt) {
      // Generate AI content for single publication
      try {
        if (widget.aiSource.generatedContent && widget.aiSource.lastGenerated) {
          // Use cached content if it exists and is recent
          const hoursSinceGeneration = (Date.now() - widget.aiSource.lastGenerated.getTime()) / (1000 * 60 * 60)
          if (hoursSinceGeneration < 1) {
            publication = widget.aiSource.generatedContent
          } else {
            // Re-generate if cache is stale and update widget state
            const newContent = generateAISingleContent(widget.aiSource.prompt)
            publication = newContent
            
            // Update the widget in the store with new cached content
            const { updateWidget: storeUpdateWidget } = usePageStore.getState()
            storeUpdateWidget(widget.id, {
              aiSource: {
                ...widget.aiSource,
                generatedContent: newContent,
                lastGenerated: new Date()
              }
            })
          }
        } else {
          // Generate new content and cache it
          const newContent = generateAISingleContent(widget.aiSource.prompt)
          publication = newContent
          
          // Update the widget in the store with new cached content
          const { updateWidget: storeUpdateWidget } = usePageStore.getState()
          storeUpdateWidget(widget.id, {
            aiSource: {
              ...widget.aiSource,
              generatedContent: newContent,
              lastGenerated: new Date()
            }
          })
        }
      } catch (error) {
        console.error('Error generating AI content for publication details:', error)
        publication = widget.publication // Fallback to default
      }
    } else {
      // Use default publication
      publication = widget.publication
    }
  } catch (error) {
    console.error('Error loading publication details:', error)
    publication = widget.publication
  }

  // For journal layout, show issue/volume info with ISSN and editor
  if (widget.layout === 'hero' && publication) {
    const pub = publication
    const journal = pub.isPartOf?.isPartOf
    const volume = pub.isPartOf
    
    const printISSN = getIdentifierValue(pub, 'print')
    const onlineISSN = getIdentifierValue(pub, 'online')
    
    return (
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">
          Volume {String(volume?.volumeNumber || '')} • Issue {String(pub.issueNumber || '')}
        </h1>
        <p className="text-lg mb-2">
          {printISSN && `ISSN (print): ${String(printISSN)}`}
          {printISSN && onlineISSN && ' • '}
          {onlineISSN && `ISSN (online): ${String(onlineISSN)}`}
        </p>
        <p className="text-sm mb-6">
          Editor: {String(journal?.editor?.name || 'Unknown Editor')}
        </p>
      </div>
    )
  }
  
  // Default publication details rendering
  return (
    <div>
      <h3 className="font-semibold">
        {String(publication?.headline || publication?.name || 'Publication')}
      </h3>
      {publication?.author && (
        <p className="text-sm text-gray-600">
          {Array.isArray(publication.author) 
            ? publication.author.map((a: any) => {
                if (typeof a === 'string') return a
                if (typeof a === 'object' && a !== null) {
                  return a.name || `${a.givenName || ''} ${a.familyName || ''}`.trim() || 'Unknown Author'
                }
                return String(a)
              }).join(', ')
            : typeof publication.author === 'string' 
              ? publication.author
              : typeof publication.author === 'object' && publication.author !== null
                ? publication.author.name || `${publication.author.givenName || ''} ${publication.author.familyName || ''}`.trim() || 'Unknown Author'
                : String(publication.author)
          }
        </p>
      )}
    </div>
  )
}

// Publication List Widget with full implementation
const PublicationListWidgetRenderer: React.FC<{ widget: PublicationListWidget; schemaObjects: any[] }> = ({ widget, schemaObjects }) => {
  // Get publications based on content source
  let publications: any[] = []
  
  if (widget.contentSource === 'schema-objects' && widget.schemaSource) {
    const { selectionType, selectedIds, selectedType } = widget.schemaSource
    
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
  } else if (widget.contentSource === 'ai-generated' && widget.aiSource?.prompt) {
    // Generate AI content based on prompt
    try {
      if (widget.aiSource.generatedContent && widget.aiSource.lastGenerated) {
        // Use cached content if it exists and is recent (less than 1 hour old)
        const hoursSinceGeneration = (Date.now() - widget.aiSource.lastGenerated.getTime()) / (1000 * 60 * 60)
        if (hoursSinceGeneration < 1) {
          publications = widget.aiSource.generatedContent
        } else {
          // Re-generate if cache is stale and update widget state
          const newContent = generateAIContent(widget.aiSource.prompt)
          publications = newContent
          
          // Update the widget in the store with new cached content
          const { updateWidget: storeUpdateWidget } = usePageStore.getState()
          storeUpdateWidget(widget.id, {
            aiSource: {
              ...widget.aiSource,
              generatedContent: newContent,
              lastGenerated: new Date()
            }
          })
        }
      } else {
        // Generate new content and cache it
        const newContent = generateAIContent(widget.aiSource.prompt)
        publications = newContent
        
        // Update the widget in the store with new cached content
        const { updateWidget: storeUpdateWidget } = usePageStore.getState()
        storeUpdateWidget(widget.id, {
          aiSource: {
            ...widget.aiSource,
            generatedContent: newContent,
            lastGenerated: new Date()
          }
        })
      }
    } catch (error) {
      console.error('Error generating AI content:', error)
      publications = widget.publications // Fallback to default
    }
  } else {
    // Use default publications for other content sources
    publications = widget.publications || []
  }
  
  const displayedPublications = widget.maxItems 
    ? publications.slice(0, widget.maxItems)
    : publications

  return (
    <div className="space-y-6">
      {/* Publication list */}
      <div className={`${
        widget.layout === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 gap-6' 
          : 'space-y-6'
      }`}>
        {displayedPublications.map((article: any, index: number) => (
          <PublicationCard
            key={`${widget.id}-${index}`}
            article={article}
            config={widget.cardConfig}
          />
        ))}
      </div>

      {/* Show more indicator if there are more articles */}
      {widget.maxItems && publications.length > widget.maxItems && (
        <div className="text-center pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Showing {widget.maxItems} of {publications.length} publications
          </p>
        </div>
      )}
      
      {/* Show message if no publications from schema objects */}
      {widget.contentSource === 'schema-objects' && publications.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No schema objects found for the current selection.</p>
          <p className="text-sm mt-1">Create some schema objects or adjust your selection.</p>
        </div>
      )}
      
      {/* Show message if no publications from other sources */}
      {widget.contentSource !== 'schema-objects' && publications.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No publications found.</p>
          <p className="text-sm mt-1">Check your configuration or add some content.</p>
        </div>
      )}
    </div>
  )
}

// Main Widget Renderer Component
export const WidgetRenderer: React.FC<{ widget: Widget; schemaObjects?: any[] }> = ({ widget, schemaObjects = [] }) => {
  const renderWidget = () => {
    switch (widget.type) {
      case 'button':
        return <ButtonWidgetRenderer widget={widget as ButtonWidget} />
      case 'text':
        return <TextWidgetRenderer widget={widget as TextWidget} />
      case 'image':
        return <ImageWidgetRenderer widget={widget as ImageWidget} />
      case 'navbar':
        return <NavbarWidgetRenderer widget={widget as NavbarWidget} />
      case 'html':
        return <HTMLWidgetRenderer widget={widget as HTMLWidget} />
      case 'heading':
        return <HeadingWidgetRenderer widget={widget as HeadingWidget} />
      case 'publication-details':
        return <PublicationDetailsWidgetRenderer widget={widget as PublicationDetailsWidget} schemaObjects={schemaObjects} />
      case 'publication-list':
        return <PublicationListWidgetRenderer widget={widget as PublicationListWidget} schemaObjects={schemaObjects} />
      default:
        return <div className="text-gray-500">Unsupported widget type: {(widget as any).type}</div>
    }
  }
  
  return (
    <SkinWrap skin={widget.skin}>
      {renderWidget()}
    </SkinWrap>
  )
}

export default WidgetRenderer
