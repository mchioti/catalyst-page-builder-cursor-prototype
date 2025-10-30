import React from 'react'
import type { Widget, ButtonWidget, TextWidget, ImageWidget, NavbarWidget, HTMLWidget, CodeWidget, HeadingWidget, PublicationListWidget, PublicationDetailsWidget, MenuWidget, MenuItem } from '../../types'
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
    minimal: '', // Changed from 'bg-white' to transparent for gradient visibility
    modern: 'bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4',
    classic: 'bg-gray-50 border border-gray-200 rounded p-4',
    accent: 'bg-accent-50 border border-accent-200 rounded p-4',
    hero: 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-12 px-6',
    journal: 'py-12 px-6', // Transparent background, inherits from section, keeps padding and text styling
    dark: 'bg-black text-white py-2 px-6',
    muted: 'text-gray-600 text-sm',
    center: 'text-center',
    footer: 'bg-gray-900 text-white py-8 px-6',
    compact: 'space-y-4',
    raw: '', // No styling for raw HTML
    transparent: '' // Explicit transparent option
  }
  
  return (
    <div className={skinClasses[skin as keyof typeof skinClasses] || ''}>
      {children}
    </div>
  )
}

// Widget Layout Wrapper Component - Applies layout styling to widgets
const WidgetLayoutWrapper: React.FC<{ widget: Widget; children: React.ReactNode }> = ({ widget, children }) => {
  if (!widget.layout || widget.layout.variant === 'default') {
    return <>{children}</>
  }

  const getLayoutClasses = () => {
    const layout = widget.layout!
    const classes = []

    // Variant classes
    switch (layout.variant) {
      case 'card':
        classes.push('bg-white rounded-lg shadow-md border border-gray-200')
        break
      case 'bordered':
        classes.push('border-2 border-gray-300 rounded-md')
        break
      case 'elevated':
        classes.push('bg-white shadow-lg rounded-xl border border-gray-100')
        break
    }

    // Padding classes
    switch (layout.padding) {
      case 'none':
        classes.push('p-0')
        break
      case 'small':
        classes.push('p-3')
        break
      case 'medium':
        classes.push('p-4')
        break
      case 'large':
        classes.push('p-6')
        break
      default:
        if (layout.variant === 'card' || layout.variant === 'elevated') {
          classes.push('p-4') // Default padding for cards
        }
    }

    // Margin classes
    switch (layout.margin) {
      case 'none':
        classes.push('m-0')
        break
      case 'small':
        classes.push('m-2')
        break
      case 'medium':
        classes.push('m-4')
        break
      case 'large':
        classes.push('m-6')
        break
    }

    // Background classes (override card defaults if specified)
    if (layout.background && layout.background !== 'transparent') {
      classes.push(`bg-${layout.background}`)
    }

    // Shadow classes (override card defaults if specified)
    if (layout.shadow && layout.shadow !== 'none') {
      const shadowMap = {
        small: 'shadow-sm',
        medium: 'shadow-md', 
        large: 'shadow-lg'
      }
      classes.push(shadowMap[layout.shadow])
    }

    // Rounded classes (override card defaults if specified)
    if (layout.rounded && layout.rounded !== 'none') {
      const roundedMap = {
        small: 'rounded',
        medium: 'rounded-md',
        large: 'rounded-lg'
      }
      classes.push(roundedMap[layout.rounded])
    }

    // Border classes
    if (layout.border && layout.border !== 'none') {
      const borderMap = {
        light: 'border border-gray-200',
        medium: 'border-2 border-gray-300',
        heavy: 'border-4 border-gray-400'
      }
      classes.push(borderMap[layout.border])
    }

    return classes.join(' ')
  }

  return (
    <div className={getLayoutClasses()}>
      {children}
    </div>
  )
}

// Button Widget Component
const ButtonWidgetRenderer: React.FC<{ widget: ButtonWidget }> = ({ widget }) => {
  // Check if we're in a journal context by looking for journal CSS classes on parent elements
  const isInJournalContext = React.useMemo(() => {
    // Look up the DOM tree for journal-* classes
    let element = document.querySelector('.journal-advma, .journal-embo, .journal-nature, .journal-science');
    return !!element;
  }, []);

  const getVariantClasses = (variant: string, isJournalContext: boolean) => {
    // For standard variants, use journal colors when in journal context, default colors otherwise
    if (isJournalContext) {
      switch (variant) {
        case 'primary':
          return 'journal-primary-button'; // Use journal primary color
        case 'secondary':
          return 'journal-secondary-button'; // Use journal secondary color
        case 'outline':
          return 'journal-outline-button'; // Use journal primary for border
        case 'link':
          return 'journal-link bg-transparent'; // Use journal primary for text
        default:
          return 'journal-primary-button';
      }
    }
    
    // Default (non-journal) styling
    return {
      primary: 'bg-white text-blue-600 hover:bg-blue-50 focus:ring-2 focus:ring-blue-500 shadow-sm border border-blue-200',
      secondary: 'border border-white text-white hover:bg-white hover:text-blue-600 focus:ring-2 focus:ring-blue-500',
      outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white focus:ring-2 focus:ring-blue-500',
      link: 'text-blue-600 hover:text-blue-800 font-medium bg-transparent'
    }[variant] || 'bg-white text-blue-600 hover:bg-blue-50 focus:ring-2 focus:ring-blue-500 shadow-sm border border-blue-200';
  };
  
  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg'
  }
  
  const baseClasses = widget.variant === 'link' 
    ? 'font-medium transition-colors duration-200 cursor-pointer inline-block'
    : 'font-medium rounded transition-colors duration-200 cursor-pointer inline-block'
  
  // Build classes array
  const classesArray = [
    baseClasses,
    getVariantClasses(widget.variant, isInJournalContext),
    sizeClasses[widget.size as keyof typeof sizeClasses] || sizeClasses.medium
  ]
  
  // Note: customClasses removed - button variants now automatically use journal branding when in journal context
  
  const classes = classesArray.filter(Boolean).join(' ').trim()
  
  const renderContent = () => (
    <>
      {widget.icon?.enabled && widget.icon?.position === 'left' && (
        <span className="mr-2">{widget.icon?.emoji || '🎯'}</span>
      )}
      {widget.text}
      {widget.icon?.enabled && widget.icon?.position === 'right' && (
        <span className="ml-2">{widget.icon?.emoji || '✨'}</span>
      )}
    </>
  );
  
  // Get alignment classes
  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }[widget.align || 'left'];

  const buttonElement = widget.href ? (
    <a 
      href={widget.href} 
      className={classes}
      target={widget.target || '_self'}
    >
      {renderContent()}
    </a>
  ) : (
    <span className={classes}>
      {renderContent()}
    </span>
  );
  
  return (
    <div className={alignmentClasses}>
      {buttonElement}
    </div>
  )
}

// Text Widget Component  
const TextWidgetRenderer: React.FC<{ widget: TextWidget }> = ({ widget }) => {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center', 
    right: 'text-right'
  }
  
  // Enhanced text rendering with line break support and better typography
  const renderTextWithBreaks = (text: string) => {
    return text.split('\n').map((line, index, array) => (
      <React.Fragment key={index}>
        {line}
        {index < array.length - 1 && <br />}
      </React.Fragment>
    ))
  }
  
  return (
    <div className={`${alignClasses[widget.align || 'left']}`}>
      {renderTextWithBreaks(widget.text)}
    </div>
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

// Menu Widget Component - Context-aware navigation menu
const MenuWidgetRenderer: React.FC<{ widget: MenuWidget; journalContext?: string }> = ({ widget, journalContext }) => {
  
  // Replace template variables in text
  const replaceTemplateVars = (text: string, context?: any): string => {
    if (!text) return '';
    
    let result = text;
    
    // Journal context variables
    if (context?.journal) {
      result = result.replace(/\{\{journal\.name\}\}/g, context.journal.name || 'Journal');
      result = result.replace(/\{\{journal\.code\}\}/g, context.journal.code || '');
    }
    
    // Generic context variables
    if (context?.pbContext) {
      result = result.replace(/\{\{pbContext\.csubtype\}\}/g, context.pbContext.csubtype || '');
    }
    
    return result;
  };
  
  // Check if menu item should be displayed based on condition
  const shouldDisplayItem = (item: MenuItem, context?: any): boolean => {
    if (!item.displayCondition || item.displayCondition === 'always') {
      return true;
    }
    
    switch (item.displayCondition) {
      case 'if-issue-exists':
        return context?.hasIssues === true;
      case 'if-has-archive':
        return context?.hasArchive === true;
      case 'if-journal-context':
        return !!context?.journal;
      default:
        return true;
    }
  };
  
  // Get context data (placeholder - in real app this would come from page context)
  const getContext = () => {
    // For now, use journalContext if available
    if (journalContext) {
      return {
        journal: {
          name: journalContext === 'advma' ? 'Advanced Materials' : journalContext === 'embo' ? 'EMBO Journal' : 'Journal',
          code: journalContext
        },
        hasIssues: true,
        hasArchive: true
      };
    }
    return null;
  };
  
  const context = getContext();
  
  // Filter and process items
  const visibleItems = widget.items
    .filter(item => shouldDisplayItem(item, context))
    .sort((a, b) => a.order - b.order)
    .map(item => ({
      ...item,
      label: replaceTemplateVars(item.label, context),
      url: replaceTemplateVars(item.url, context)
    }));
  
  // Get alignment classes
  const getAlignmentClasses = () => {
    const align = widget.align || 'left';
    switch (align) {
      case 'center': return 'justify-center';
      case 'right': return 'justify-end';
      default: return 'justify-start';
    }
  };
  
  const getVerticalAlignmentClasses = () => {
    const align = widget.align || 'left';
    switch (align) {
      case 'center': return 'items-center';
      case 'right': return 'items-end';
      default: return 'items-start';
    }
  };
  
  // Show placeholder if no items
  if (visibleItems.length === 0) {
    return (
      <div className="px-4 py-2 bg-gray-50 border-2 border-dashed border-gray-300 rounded text-sm text-gray-500 text-center">
        Empty menu - click to configure menu items
      </div>
    );
  }
  
  // Render based on style
  switch (widget.style) {
    case 'horizontal':
      return (
        <nav className={`flex items-center gap-6 flex-wrap ${getAlignmentClasses()}`}>
          {visibleItems.map((item) => (
            <a 
              key={item.id}
              href={item.url}
              target={item.target}
              className="text-current hover:opacity-75 transition-opacity whitespace-nowrap"
            >
              {item.label}
              {item.isContextGenerated && <span className="ml-1 text-xs opacity-50" title="Context-generated">*</span>}
            </a>
          ))}
        </nav>
      );
      
    case 'vertical':
      return (
        <nav className={`flex flex-col gap-2 ${getVerticalAlignmentClasses()}`}>
          {visibleItems.map((item) => (
            <a 
              key={item.id}
              href={item.url}
              target={item.target}
              className="block px-4 py-2 text-current hover:bg-black/5 transition-colors rounded"
            >
              {item.label}
              {item.isContextGenerated && <span className="ml-1 text-xs opacity-50" title="Context-generated">*</span>}
            </a>
          ))}
        </nav>
      );
      
    case 'dropdown':
      return (
        <div className={`relative group flex ${getAlignmentClasses()}`}>
          <button className="px-4 py-2 bg-current/10 hover:bg-current/20 rounded transition-colors">
            ☰ Menu
          </button>
          <div className="absolute left-0 top-full mt-2 bg-white border border-gray-200 rounded shadow-lg hidden group-hover:block min-w-[200px] z-50">
            {visibleItems.map((item) => (
              <a 
                key={item.id}
                href={item.url}
                target={item.target}
                className="block px-4 py-2 text-gray-900 hover:bg-gray-100 transition-colors"
              >
                {item.label}
                {item.isContextGenerated && <span className="ml-1 text-xs opacity-50" title="Context-generated">*</span>}
              </a>
            ))}
          </div>
        </div>
      );
      
    case 'footer-links':
      return (
        <nav className={`flex items-center gap-4 flex-wrap text-sm ${getAlignmentClasses()}`}>
          {visibleItems.map((item) => (
            <a 
              key={item.id}
              href={item.url}
              target={item.target}
              className="text-current hover:underline"
            >
              {item.label}
            </a>
          ))}
        </nav>
      );
      
    default:
      return (
        <div className="text-gray-500">Unsupported menu style: {widget.style}</div>
      );
  }
};

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
  
  // Enhanced HTML content with better interactivity support
  const enhancedHtmlContent = `
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
        
        /* Ensure clicks and interactions work properly */
        button, a, [onclick], [data-clickable], .clickable {
          cursor: pointer !important;
          user-select: none;
          transition: all 0.2s ease;
        }
        
        button:hover, a:hover, [onclick]:hover, [data-clickable]:hover, .clickable:hover {
          opacity: 0.8;
          transform: translateY(-1px);
        }
        
        /* Auto-resize communication script */
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
        
        // Initial resize after a short delay
        setTimeout(resizeIframe, 100);
        setTimeout(resizeIframe, 500); // Second attempt for complex content
        
        // Enhanced click handling for better interactivity
        document.addEventListener('click', function(e) {
          // Ensure clicks work properly and don't get blocked
          console.log('HTML Widget Click:', e.target);
        }, true);
        
        // Enable proper event bubbling
        document.addEventListener('DOMContentLoaded', function() {
          // Make sure all interactive elements are properly initialized
          const interactiveElements = document.querySelectorAll('button, a, [onclick], [data-clickable], .clickable');
          interactiveElements.forEach(el => {
            el.style.cursor = 'pointer';
            if (!el.onclick && !el.getAttribute('onclick') && !el.href) {
              el.addEventListener('click', function(e) {
                console.log('Interactive element clicked:', this);
              });
            }
          });
        });
      </script>
    </body>
    </html>
  `;

  // Render HTML content in an iframe for safety with enhanced interactivity
  return (
    <iframe
      srcDoc={enhancedHtmlContent}
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
        
        // Initial resize attempt for compatibility
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
  )
}

// Code Widget Component
const CodeWidgetRenderer: React.FC<{ widget: CodeWidget }> = ({ widget }) => {
  if (!widget.codeContent || widget.codeContent.trim() === '') {
    // Show placeholder when no content
    return (
      <div className="min-h-[200px] bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl">💻</span>
        </div>
        <h3 className="text-sm font-medium text-gray-900 mb-2">Code Block</h3>
        <p className="text-xs text-gray-500">No code content provided</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {widget.title && (
        <h3 className="text-sm font-medium text-gray-900">{widget.title}</h3>
      )}
      
      <div className={`rounded-lg border p-4 font-mono text-sm overflow-x-auto ${
        widget.theme === 'dark' 
          ? 'bg-gray-900 text-gray-100 border-gray-700' 
          : 'bg-gray-50 text-gray-900 border-gray-200'
      }`}>
        {widget.showLineNumbers ? (
          <div className="flex">
            <div className="flex flex-col text-right pr-4 text-gray-500 select-none border-r border-current/20 mr-4">
              {widget.codeContent.split('\n').map((_, index) => (
                <span key={index} className="leading-relaxed">{index + 1}</span>
              ))}
            </div>
            <div className="flex-1">
              <pre className="whitespace-pre-wrap leading-relaxed">{widget.codeContent}</pre>
            </div>
          </div>
        ) : (
          <pre className="whitespace-pre-wrap leading-relaxed">{widget.codeContent}</pre>
        )}
      </div>
      
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span className={`px-2 py-1 rounded-full ${
          widget.theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-200 text-gray-700'
        }`}>
          {widget.language}
        </span>
        {widget.showLineNumbers && <span>Line Numbers</span>}
        <span>{widget.theme === 'dark' ? 'Dark' : 'Light'} Theme</span>
      </div>
    </div>
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
    large: 'text-3xl',
    xl: 'text-5xl',
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
      case 'hero':
        return 'font-bold mb-6 text-white'
      default:
        return ''
    }
  }
  
  const HeadingTag = `h${widget.level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  
  
  const headingClasses = [
    getStyleClasses(),
    alignClasses[widget.align || 'left'],
    widget.size === 'auto' 
      ? sizeClasses[getSemanticDefaultSize(widget.level)]
      : sizeClasses[widget.size || 'auto'],
    colorClasses[widget.color || 'default']
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

  // Get alignment class
  const alignmentClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }[widget.align || 'left']
  
  // For journal layout, show issue/volume info with ISSN and editor
  if (widget.layout === 'hero' && publication) {
    const pub = publication
    const journal = pub.isPartOf?.isPartOf
    const volume = pub.isPartOf
    
    const printISSN = getIdentifierValue(pub, 'print')
    const onlineISSN = getIdentifierValue(pub, 'online')
    
    // Default to white text for hero/journal layouts, allow override
    const textColor = widget.textColor || '#ffffff'
    
    return (
      <div className={`max-w-6xl mx-auto ${alignmentClass}`} style={{ color: textColor }}>
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
    <div className={alignmentClass}>
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
            align={widget.align}
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
export const WidgetRenderer: React.FC<{ widget: Widget; schemaObjects?: any[]; journalContext?: string }> = ({ widget, schemaObjects = [], journalContext }) => {
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
      case 'menu':
        return <MenuWidgetRenderer widget={widget as MenuWidget} journalContext={journalContext} />
      case 'html':
        return <HTMLWidgetRenderer widget={widget as HTMLWidget} />
      case 'code':
        return <CodeWidgetRenderer widget={widget as CodeWidget} />
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
      <WidgetLayoutWrapper widget={widget}>
        {renderWidget()}
      </WidgetLayoutWrapper>
    </SkinWrap>
  )
}

export default WidgetRenderer
