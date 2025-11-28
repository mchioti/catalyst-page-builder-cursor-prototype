/**
 * CanvasRenderer - Renders canvas items from the V1 Page Builder store
 * 
 * This component bridges V1's canvas data with the V2 Live Site,
 * allowing pages to be rendered from stored canvas items.
 */

import { Link } from 'react-router-dom'
import type { CanvasItem, WidgetSection, Widget } from '../../types/widgets'

// Check if item is a section
function isSection(item: CanvasItem): item is WidgetSection {
  return 'areas' in item && Array.isArray((item as WidgetSection).areas)
}

// Widget Renderer
function WidgetDisplay({ widget }: { widget: Widget }) {
  switch (widget.type) {
    case 'text':
      return (
        <div 
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: widget.text || '' }}
        />
      )
    
    case 'heading':
      // Handle both numeric (1, 2, 3) and string ('h1', 'h2', 'h3') level formats
      const levelNum = typeof widget.level === 'number' ? widget.level : 
                       typeof widget.level === 'string' && widget.level.startsWith('h') ? parseInt(widget.level.slice(1)) :
                       2
      const HeadingTag = `h${levelNum}` as keyof JSX.IntrinsicElements
      return (
        <HeadingTag 
          className={`font-bold ${
            levelNum === 1 ? 'text-4xl' : 
            levelNum === 2 ? 'text-3xl' : 
            levelNum === 3 ? 'text-2xl' : 
            levelNum === 4 ? 'text-xl' : 'text-lg'
          }`}
          style={{ textAlign: widget.align || 'left' }}
        >
          {widget.text}
        </HeadingTag>
      )
    
    case 'image':
      return (
        <img 
          src={widget.src || 'https://via.placeholder.com/400x300'} 
          alt={widget.alt || ''} 
          className="max-w-full h-auto rounded"
        />
      )
    
    case 'button':
      const buttonClasses = widget.variant === 'primary' 
        ? 'px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700'
        : widget.variant === 'secondary'
        ? 'px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50'
        : 'px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300'
      
      if (widget.href) {
        return (
          <Link to={widget.href} className={buttonClasses}>
            {widget.text || 'Button'}
          </Link>
        )
      }
      return (
        <button className={buttonClasses}>
          {widget.text || 'Button'}
        </button>
      )
    
    case 'divider':
      return <hr className="my-4 border-gray-300" />
    
    case 'spacer':
      const height = widget.height === 'small' ? 'h-4' : widget.height === 'large' ? 'h-16' : 'h-8'
      return <div className={height} />
    
    case 'menu':
      return (
        <nav className="flex gap-4">
          {widget.items?.map((item: any, idx: number) => (
            <Link 
              key={idx} 
              to={item.url || '#'} 
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )
    
    case 'html':
      return (
        <div 
          className="html-content"
          dangerouslySetInnerHTML={{ __html: widget.html || '' }}
        />
      )
    
    default:
      return (
        <div className="p-4 bg-gray-100 rounded text-gray-500 text-sm">
          Widget: {widget.type}
        </div>
      )
  }
}

// Section Renderer
function SectionDisplay({ section }: { section: WidgetSection }) {
  // Get background styles
  const bgStyle: React.CSSProperties = {}
  if (section.background) {
    if (section.background.type === 'color') {
      bgStyle.backgroundColor = section.background.color || '#ffffff'
    } else if (section.background.type === 'gradient') {
      bgStyle.background = `linear-gradient(to right, ${section.background.from || '#ffffff'}, ${section.background.to || '#f0f0f0'})`
    } else if (section.background.type === 'image') {
      bgStyle.backgroundImage = `url(${section.background.imageUrl})`
      bgStyle.backgroundSize = 'cover'
      bgStyle.backgroundPosition = 'center'
    }
  }
  
  // Get padding
  const paddingMap: Record<string, string> = {
    none: '0',
    small: '1rem',
    medium: '2rem',
    large: '4rem'
  }
  const py = paddingMap[section.styling?.paddingTop || 'medium'] || '2rem'
  const px = paddingMap[section.styling?.paddingLeft || 'medium'] || '2rem'
  
  // Get text color
  const textColor = section.styling?.textColor === 'light' ? 'text-white' : 'text-gray-900'
  
  // Layout columns
  const getGridCols = () => {
    switch (section.layout) {
      case 'two-columns': return 'grid-cols-1 md:grid-cols-2'
      case 'three-columns': return 'grid-cols-1 md:grid-cols-3'
      case 'sidebar-left': return 'grid-cols-1 md:grid-cols-[250px_1fr]'
      case 'sidebar-right': return 'grid-cols-1 md:grid-cols-[1fr_250px]'
      default: return 'grid-cols-1'
    }
  }
  
  return (
    <section 
      className={textColor}
      style={{ ...bgStyle, paddingTop: py, paddingBottom: py, paddingLeft: px, paddingRight: px }}
    >
      <div className={`max-w-6xl mx-auto grid ${getGridCols()} gap-6`}>
        {section.areas?.map((area, areaIdx) => (
          <div key={area.id || areaIdx} className="space-y-4">
            {area.widgets?.map((widget, widgetIdx) => (
              <WidgetDisplay key={widget.id || widgetIdx} widget={widget} />
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}

// Main Canvas Renderer
export function CanvasRenderer({ items }: { items: CanvasItem[] }) {
  if (!items || items.length === 0) {
    return null
  }
  
  return (
    <div className="canvas-renderer">
      {items.map((item, idx) => {
        if (isSection(item)) {
          return <SectionDisplay key={item.id || idx} section={item} />
        } else {
          // Standalone widget (rare, usually widgets are in sections)
          return (
            <div key={item.id || idx} className="px-6 py-4">
              <WidgetDisplay widget={item as Widget} />
            </div>
          )
        }
      })}
    </div>
  )
}

export default CanvasRenderer

