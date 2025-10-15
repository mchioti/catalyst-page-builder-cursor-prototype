import React from 'react'
import type { Widget, ButtonWidget, TextWidget, ImageWidget, NavbarWidget, HTMLWidget, HeadingWidget, PublicationListWidget, PublicationDetailsWidget } from '../../types'
import { PublicationCard } from '../Publications/PublicationCard'

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
    '16:9': 'aspect-video'
  }
  
  return (
    <img 
      src={widget.src} 
      alt={widget.alt}
      className={`w-full object-cover rounded ${widget.ratio ? aspectRatios[widget.ratio as keyof typeof aspectRatios] : ''}`}
    />
  )
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
  return <div dangerouslySetInnerHTML={{ __html: widget.htmlContent }} />
}

// Heading Widget Component
const HeadingWidgetRenderer: React.FC<{ widget: HeadingWidget }> = ({ widget }) => {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }
  
  const HeadingTag = `h${widget.level}` as keyof JSX.IntrinsicElements
  
  return (
    <HeadingTag className={`font-bold ${alignClasses[widget.align || 'left']}`}>
      {widget.text}
    </HeadingTag>
  )
}

// Publication Details Widget Component (journal metadata)
const PublicationDetailsWidgetRenderer: React.FC<{ widget: PublicationDetailsWidget }> = ({ widget }) => {
  // For journal layout, show issue/volume info with ISSN and editor
  if (widget.layout === 'hero' && widget.publication) {
    const pub = widget.publication
    const journal = pub.isPartOf?.isPartOf
    const volume = pub.isPartOf
    
    return (
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">
          Volume {volume?.volumeNumber} • Issue {pub.issueNumber}
        </h1>
        <p className="text-lg mb-2">
          {pub.identifier?.find((id: any) => id.name.includes('print'))?.value && 
            `ISSN (print): ${pub.identifier.find((id: any) => id.name.includes('print')).value}`}
          {pub.identifier?.find((id: any) => id.name.includes('print'))?.value && 
           pub.identifier?.find((id: any) => id.name.includes('online'))?.value && ' • '}
          {pub.identifier?.find((id: any) => id.name.includes('online'))?.value && 
            `ISSN (online): ${pub.identifier.find((id: any) => id.name.includes('online')).value}`}
        </p>
        <p className="text-sm mb-6">
          Editor: {journal?.editor?.name || 'Unknown Editor'}
        </p>
      </div>
    )
  }
  
  // Default publication details rendering
  return (
    <div>
      <h3 className="font-semibold">{widget.publication?.headline || widget.publication?.name || 'Publication'}</h3>
      {widget.publication?.author && (
        <p className="text-sm text-gray-600">
          {Array.isArray(widget.publication.author) 
            ? widget.publication.author.map((a: any) => a.name).join(', ')
            : widget.publication.author.name
          }
        </p>
      )}
    </div>
  )
}

// Publication List Widget with full implementation
const PublicationListWidgetRenderer: React.FC<{ widget: PublicationListWidget }> = ({ widget }) => {
  // Get publications based on content source
  let publications: any[] = []
  
  // For now, use default publications as fallback
  // TODO: Need to pass schemaObjects and generateAIContent as props
  publications = widget.publications || []
  
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
      
      {/* Show message if no publications */}
      {publications.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No publications found.</p>
          <p className="text-sm mt-1">Check your configuration or add some content.</p>
        </div>
      )}
    </div>
  )
}

// Main Widget Renderer Component
export const WidgetRenderer: React.FC<{ widget: Widget }> = ({ widget }) => {
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
        return <PublicationDetailsWidgetRenderer widget={widget as PublicationDetailsWidget} />
      case 'publication-list':
        return <PublicationListWidgetRenderer widget={widget as PublicationListWidget} />
      default:
        return <div className="text-gray-500">Unsupported widget type: {widget.type}</div>
    }
  }
  
  return (
    <SkinWrap skin={widget.skin}>
      {renderWidget()}
    </SkinWrap>
  )
}

export default WidgetRenderer
