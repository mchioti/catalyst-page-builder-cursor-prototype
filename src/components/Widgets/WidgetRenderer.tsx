import React, { useState, useMemo } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import type { Widget, ButtonWidget, TextWidget, ImageWidget, NavbarWidget, HTMLWidget, CodeWidget, HeadingWidget, PublicationListWidget, PublicationDetailsWidget, MenuWidget, MenuItem, TabsWidget, CollapseWidget, CollapsePanel, EditorialCardWidget, BreadcrumbsWidget, BreadcrumbItem } from '../../types'
import { Home, ChevronRight } from 'lucide-react'
import { PublicationCard } from '../Publications/PublicationCard'
import { generateAIContent, generateAISingleContent, generateJournalMetadata } from '../../utils/aiContentGeneration'
import { getCitationByDOI, citationToSchemaOrg } from '../../utils/citationData'
import { getCurrentIssue, getArticlesForIssue } from '../../v2/data/mockIssues'
import { getJournalPublications, getJournalMetadata } from '../../data/journalMockPublications'
import { useDroppable } from '@dnd-kit/core'
import { nanoid } from 'nanoid'
import { Edit, Trash2, Copy } from 'lucide-react'
import { EditorialCardRenderer } from './EditorialCardRenderer'
import { applyListPattern } from '../../utils/listPatternRenderer'
import { createDebugLogger } from '../../utils/logger'

// Extracted components
import { SkinWrap } from './SkinWrap'
import { WidgetLayoutWrapper } from './WidgetLayoutWrapper'

// Import usePageStore for updating widget state and accessing store data
import { usePageStore } from '../../stores/pageStore'
import { useBrandingStore } from '../../stores/brandingStore'
// Import resolveContextColor helper from SectionRenderer
import { resolveContextColor } from '../Sections/SectionRenderer'

// Control logging for this file
const DEBUG = false
const debugLog = createDebugLogger(DEBUG)

// Button Widget Component
const ButtonWidgetRenderer: React.FC<{ widget: ButtonWidget; sectionContentMode?: 'light' | 'dark' }> = ({ widget, sectionContentMode }) => {
  // 🔄 MIGRATION: Convert old 'variant' field to new 'style' + 'color' structure
  const migrateVariant = (widget: ButtonWidget): { style: 'solid' | 'outline' | 'link'; color: 'color1' | 'color2' | 'color3' | 'color4' | 'color5' } => {
    // Migrate from old 'variant' field first to get defaults
    const variant = widget.variant || 'primary'
    const migrations: Record<string, { style: 'solid' | 'outline' | 'link'; color: 'color1' | 'color2' | 'color3' | 'color4' | 'color5' }> = {
      'primary': { style: 'solid', color: 'color1' },
      'secondary': { style: 'solid', color: 'color2' },
      'tertiary': { style: 'solid', color: 'color3' },
      'outline': { style: 'outline', color: 'color1' },
      'link': { style: 'link', color: 'color1' }
    }
    const defaults = migrations[variant] || { style: 'solid', color: 'color1' }
    
    // Override with new fields if they exist (allows partial updates)
    return {
      style: widget.style || defaults.style,
      color: widget.color || defaults.color
    }
  }

  const { style, color } = migrateVariant(widget)
  
  // ✅ NO MORE TAILWIND! Buttons now use semantic CSS classes.
  
  // 🎨 NEW: Build semantic CSS classes (NO TAILWIND)
  // Classes are defined in themeCSS.ts and injected by CanvasThemeProvider
  const contextClass = sectionContentMode === 'dark' ? 'on-dark-bg' : 'on-light-bg'
  const buttonClasses = [
    'btn',                                    // Base button class
    `btn-${style}-${color}`,                  // Style + color (e.g., btn-solid-color1)
    `btn-${widget.size}`,                     // Size (e.g., btn-medium)
    contextClass                              // Context-aware (e.g., on-light-bg, on-dark-bg)
  ].join(' ')
  
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
  
  // 🎨 NEW: Semantic alignment wrapper class
  const wrapperClass = `btn-wrapper-${widget.align || 'left'}`

  const buttonElement = widget.href ? (
    <a 
      href={widget.href} 
      className={buttonClasses}
      target={widget.target || '_self'}
    >
      {renderContent()}
    </a>
  ) : (
    <button 
      type="button"
      className={buttonClasses}
      onClick={() => debugLog('log', 'Button clicked:', widget.text)}
    >
      {renderContent()}
    </button>
  );
  
  return (
    <div className={wrapperClass}>
      {buttonElement}
    </div>
  )
}

// Text Widget Component  
const TextWidgetRenderer: React.FC<{ widget: TextWidget; sectionContentMode?: 'light' | 'dark' }> = ({ widget, sectionContentMode }) => {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center', 
    right: 'text-right'
  }
  
  // Get text color based on content mode
  const getTextColorClasses = () => {
    if (sectionContentMode === 'dark') {
      return 'text-white';
    } else if (sectionContentMode === 'light') {
      return 'text-gray-900';
    }
    // Default: inherit
    return '';
  };
  
  const textColorClasses = getTextColorClasses();
  
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
  
  const inlineStyles = parseInlineStyles(widget.inlineStyles);
  
  // Check if text contains HTML tags
  const containsHTML = (text: string) => {
    return /<[^>]+>/.test(text);
  };
  
  // Enhanced text rendering with line break support and better typography
  const renderTextWithBreaks = (text: string) => {
    return text.split('\n').map((line, index, array) => (
      <React.Fragment key={index}>
        {line}
        {index < array.length - 1 && <br />}
      </React.Fragment>
    ))
  }
  
  // Get typography class from theme (e.g., typo-body-md, typo-body-lg)
  const typographyClass = widget.typographyStyle ? `typo-${widget.typographyStyle}` : '';
  
  // Render HTML content if it contains HTML tags, otherwise render as plain text
  if (containsHTML(widget.text)) {
    return (
      <div 
        className={`${alignClasses[widget.align || 'left']} ${textColorClasses} ${typographyClass}`.trim()}
        style={inlineStyles}
        dangerouslySetInnerHTML={{ __html: widget.text }}
      />
    );
  }
  
  return (
    <div 
      className={`${alignClasses[widget.align || 'left']} ${textColorClasses} ${typographyClass}`.trim()}
      style={inlineStyles}
    >
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
const MenuWidgetRenderer: React.FC<{ widget: MenuWidget; journalContext?: string; sectionContentMode?: 'light' | 'dark' }> = ({ widget, journalContext, sectionContentMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if URL is an internal route (should use Link/navigate instead of <a>)
  const isInternalRoute = (url: string): boolean => {
    if (!url) return false;
    // Internal routes start with /live/ or /edit/ (our app routes)
    // External URLs start with http://, https://, mailto:, tel:, etc.
    return url.startsWith('/live/') || url.startsWith('/edit/') || (url.startsWith('/') && !url.startsWith('//'));
  };
  
  // Convert internal route URL to React Router path
  // For nested routes under /live/:websiteId/*, we need relative paths for navigate()
  const getRouterPath = (url: string): string => {
    if (!url) return '#';
    
    // For /live/ routes: Calculate relative path from current location
    if (url.startsWith('/live/')) {
      const targetParts = url.split('/').filter(p => p);
      // targetParts = ['live', 'websiteId', 'journal', 'jas', 'toc', 'current']
      
      // Get current location parts
      const currentParts = location.pathname.split('/').filter(p => p);
      // currentParts = ['live', 'catalyst-demo', 'journal', 'jas']
      
      // If we're in a /live/ route, calculate relative path
      if (currentParts.length >= 2 && currentParts[0] === 'live' && targetParts[0] === 'live') {
        // Both are /live/ routes, check if same websiteId
        if (currentParts[1] === targetParts[1]) {
          // Same websiteId - calculate relative path
          const currentPath = currentParts.slice(2).join('/'); // 'journal/jas'
          const targetPath = targetParts.slice(2).join('/'); // 'journal/jas/toc/current'
          
          if (targetPath.startsWith(currentPath + '/')) {
            // Target is a child of current - use relative path (no leading slash)
            return targetPath.slice(currentPath.length + 1); // 'toc/current'
          } else if (targetPath === currentPath) {
            // Same path - stay here
            return '.';
          } else {
            // Different path - need to go up and then down
            // Calculate how many levels up we need to go
            const currentDepth = currentPath.split('/').length;
            const commonPrefix = currentPath.split('/').filter((part, i) => 
              targetPath.split('/')[i] === part
            ).join('/');
            const upLevels = currentPath.split('/').length - commonPrefix.split('/').length;
            const downPath = targetPath.split('/').slice(commonPrefix.split('/').length).join('/');
            return '../'.repeat(upLevels) + downPath;
          }
        }
      }
      
      // Not in /live/ route or different websiteId - use absolute path within nested router
      // This will work if we're navigating from outside the nested router
      if (targetParts.length > 2) {
        return '/' + targetParts.slice(2).join('/');
      }
      return '/';
    }
    
    // For /edit/ routes: Keep as is (they're handled by editor router at root level)
    if (url.startsWith('/edit/')) {
      return url;
    }
    
    // For other internal routes starting with /, use as is
    if (url.startsWith('/')) {
      return url;
    }
    
    // Relative paths: return as-is
    return url;
  };
  
  // Get text color classes based on content mode
  // ALL menus respect contentMode for readability
  // Branding system can add accent colors on top (hover, borders, etc.)
  const getTextColorClasses = () => {
    if (sectionContentMode === 'dark') {
      return 'text-white';
    } else if (sectionContentMode === 'light') {
      return 'text-gray-900';
    }
    // No content mode: use default
    return 'text-current';
  };
  
  const textColorClasses = getTextColorClasses();
  
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
  
  // Render menu item (Link for internal routes, <a> for external)
  const renderMenuItem = (item: any, className: string) => {
    const isInternal = isInternalRoute(item.url);
    const routerPath = isInternal ? getRouterPath(item.url) : item.url;
    
    if (isInternal) {
      // Use navigate for client-side navigation (preserves Zustand store)
      // For nested routes, use relative paths when possible
      return (
        <button
          key={item.id}
          type="button"
          className={className}
          onClick={() => {
            navigate(routerPath);
          }}
        >
          {item.label}
          {item.isContextGenerated && <span className="ml-1 text-xs opacity-50" title="Context-generated">*</span>}
        </button>
      );
    } else {
      // Use <a> for external URLs (full page navigation)
      return (
        <a 
          key={item.id}
          href={item.url}
          target={item.target || '_blank'}
          rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
          className={className}
        >
          {item.label}
          {item.isContextGenerated && <span className="ml-1 text-xs opacity-50" title="Context-generated">*</span>}
        </a>
      );
    }
  };
  
  // Render based on style
  switch (widget.style) {
    case 'horizontal':
      return (
        <nav className={`flex items-center gap-6 flex-wrap ${getAlignmentClasses()}`}>
          {visibleItems.map((item) => 
            renderMenuItem(item, `${textColorClasses} hover:opacity-75 transition-opacity whitespace-nowrap`)
          )}
        </nav>
      );
      
    case 'vertical':
      return (
        <nav className={`flex flex-col gap-2 ${getVerticalAlignmentClasses()}`}>
          {visibleItems.map((item) => 
            renderMenuItem(item, `block px-4 py-2 ${textColorClasses} hover:bg-black/5 transition-colors rounded`)
          )}
        </nav>
      );
      
    case 'dropdown':
      return (
        <div className={`relative group flex ${getAlignmentClasses()}`}>
          <button className={`px-4 py-2 ${textColorClasses} bg-current/10 hover:bg-current/20 rounded transition-colors`}>
            ☰ Menu
          </button>
          <div className="absolute left-0 top-full mt-2 bg-white border border-gray-200 rounded shadow-lg hidden group-hover:block min-w-[200px] z-50">
            {visibleItems.map((item) => 
              renderMenuItem(item, "block px-4 py-2 text-gray-900 hover:bg-gray-100 transition-colors")
            )}
          </div>
        </div>
      );
      
    case 'footer-links':
      return (
        <nav className={`flex items-center gap-4 flex-wrap text-sm ${getAlignmentClasses()}`}>
          {visibleItems.map((item) => 
            renderMenuItem(item, `${textColorClasses} hover:underline`)
          )}
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
          debugLog('log', 'HTML Widget Click:', e.target);
        }, true);
        
        // Enable proper event bubbling
        document.addEventListener('DOMContentLoaded', function() {
          // Make sure all interactive elements are properly initialized
          const interactiveElements = document.querySelectorAll('button, a, [onclick], [data-clickable], .clickable');
          interactiveElements.forEach(el => {
            el.style.cursor = 'pointer';
            if (!el.onclick && !el.getAttribute('onclick') && !el.href) {
              el.addEventListener('click', function(e) {
                debugLog('log', 'Interactive element clicked:', this);
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
        return 'px-3 py-2 rounded inline-block' // Inline-block to fit text width, color via inline style
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
  
  // Calculate luminance to determine if a color is dark or light
  const getColorLuminance = (color: string): number => {
    // Extract RGB values from CSS variable or hex color
    const rgb = getComputedRGBFromVar(color)
    if (!rgb) return 0.5 // Default to medium if can't calculate
    
    // Calculate relative luminance (WCAG formula)
    const [r, g, b] = rgb.map(val => {
      const normalized = val / 255
      return normalized <= 0.03928
        ? normalized / 12.92
        : Math.pow((normalized + 0.055) / 1.055, 2.4)
    })
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }
  
  // Get RGB values from CSS variable or hex color
  const getComputedRGBFromVar = (varName: string): [number, number, number] | null => {
    if (typeof window === 'undefined') return null
    
    // Create temporary element to compute the color
    const temp = document.createElement('div')
    temp.style.color = varName.includes('var(') ? varName : `var(${varName}, #0066cc)`
    document.body.appendChild(temp)
    
    const computed = window.getComputedStyle(temp).color
    document.body.removeChild(temp)
    
    // Parse rgb(r, g, b) or rgba(r, g, b, a)
    const match = computed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
    if (match) {
      return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])]
    }
    
    return null
  }
  
  // Get inline styles for specific heading styles that need dynamic theme colors
  const getInlineStyles = (): React.CSSProperties => {
    const style = widget.style || 'default'
    
    if (style === 'highlighted') {
      // Get the primary color and determine if it's dark
      const primaryColor = 'var(--foundation-action-primary, #0066cc)'
      const luminance = getColorLuminance(primaryColor)
      const isDark = luminance < 0.5
      
      // Use solid primary theme color with appropriate text color
      return {
        backgroundColor: primaryColor,
        color: isDark ? '#ffffff' : '#000000'
      }
    }
    
    return {}
  }
  
  const HeadingTag = `h${widget.level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  
  // Check if typography CSS is available by testing if the class has actual font-size styles
  // This is more reliable than checking theme ID
  const hasTypographyStyles = (): boolean => {
    if (typeof document === 'undefined') return false
    
    // Create a temporary element to test if typography classes are styled
    const testEl = document.createElement('div')
    testEl.className = 'typo-heading-h1'
    testEl.style.cssText = 'position:absolute;visibility:hidden;'
    document.body.appendChild(testEl)
    
    const computed = window.getComputedStyle(testEl)
    const hasStyles = computed.fontSize !== '' && computed.fontSize !== '16px' // 16px is browser default
    
    document.body.removeChild(testEl)
    return hasStyles
  }
  
  const useTypography = hasTypographyStyles()
  
  // Get typography class or Tailwind class based on theme
  const getSizeClass = () => {
    if (useTypography) {
      // Typography themes (Wiley DS V2, Carbon)
      // Default to 'auto' when size is not specified (undefined)
      if (widget.size === 'auto' || !widget.size) {
        // Auto (default): Match typography to semantic level (H1 → typo-heading-h1, H2 → typo-heading-h2, etc.)
        return `typo-heading-h${widget.level}`
      } else {
        // Manual override: Map size to typography style
        const sizeToTypographyMap: Record<string, string> = {
          'xl': 'typo-heading-h1',      // Extra Large → H1 style (80px/48px)
          'large': 'typo-heading-h2',   // Large → H2 style (48px/32px)
          'medium': 'typo-heading-h4',  // Medium → H4 style (24px/20px)
          'small': 'typo-heading-h6'    // Small → H6 style (18px/16px)
        }
        return sizeToTypographyMap[widget.size] || 'typo-heading-h4'
      }
    } else {
      // Legacy themes: Use Tailwind size classes
      // Default to 'auto' when size is not specified (undefined)
      const effectiveSize = (widget.size === 'auto' || !widget.size) ? getSemanticDefaultSize(widget.level) : widget.size
      return sizeClasses[effectiveSize] || sizeClasses.medium
    }
  }
  
  const headingClasses = [
    getStyleClasses(),
    alignClasses[widget.align || 'left'],
    getSizeClass()
  ].filter(Boolean).join(' ')
  
  return (
    <HeadingTag 
      className={headingClasses}
      style={getInlineStyles()}
    >
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

// Publication Details Widget Component - uses PublicationCard for all rendering
const PublicationDetailsWidgetRenderer: React.FC<{ 
  widget: PublicationDetailsWidget; 
  schemaObjects: any[]; 
  sectionContentMode?: 'light' | 'dark';
  journalContext?: string;
  showMockData?: boolean;
}> = ({ widget, schemaObjects, sectionContentMode, journalContext, showMockData = true }) => {
  // Resolve variant ID to get latest config (ensures variant changes are reflected)
  const publicationCardVariants = usePageStore.getState().publicationCardVariants
  const resolvedConfig = widget.cardVariantId 
    ? (publicationCardVariants.find((v: any) => v.id === widget.cardVariantId)?.config || widget.cardConfig)
    : widget.cardConfig
  
  // Get journal data from context for 'context' content source
  // Priority: Branding Store (Design Console) → Page Store (V2 mock data)
  const getJournalFromContext = (): any => {
    if (!journalContext) return null
    
    // Get current website and find the journal from page store
    const state = usePageStore.getState() as any
    const { currentWebsiteId, websites } = state
    const currentWebsite = websites?.find((w: any) => w.id === currentWebsiteId)
    const journal = (currentWebsite as any)?.journals?.find((j: any) => j.id === journalContext)
    
    if (!journal) return null
    
    // Get branding from Design Console (branding store) - takes precedence
    const brandingState = useBrandingStore.getState()
    const websiteBranding = brandingState.getWebsiteBranding(currentWebsiteId)
    const journalBranding = websiteBranding?.journals?.find(
      (j: any) => j.id === journalContext || j.slug === journalContext
    )
    
    // Merge branding: Design Console colors override V2 mock data
    const mergedBranding = journalBranding?.colors 
      ? {
          primaryColor: journalBranding.colors.primary,
          secondaryColor: journalBranding.colors.secondary,
          accentColor: journalBranding.colors.accent
        }
      : journal.branding
    
    // Convert journal to schema.org Periodical format
    return {
      "@context": "https://schema.org",
      "@type": "Periodical",
      "name": journal.name,
      "description": journal.description,
      "issn": journal.issn,
      "impactFactor": journal.impactFactor,
      "isAccessibleForFree": journal.isOpenAccess,
      "publisher": {
        "@type": "Organization",
        "name": currentWebsite?.name || "Publisher"
      },
      "image": journal.coverImageUrl,
      "thumbnailUrl": journal.coverImageUrl,
      // Custom fields for journal metrics
      "numberOfIssues": journal.issueCount,
      "numberOfArticles": journal.articleCount,
      // Branding info (merged from Design Console and V2 data)
      "_branding": mergedBranding
    }
  }
  
  // DOI lookup function - uses real citation data from our library
  const fetchPublicationByDOI = (doi: string): any => {
    // Try to find the DOI in our citation database
    const citation = getCitationByDOI(doi)
    
    if (citation) {
      // Convert citation to schema.org format
      return citationToSchemaOrg(citation)
    }
    
    // Fallback: return a mock publication if DOI not in our database
    // In production, this would make an API call to CrossRef or similar
    const imageSeed = doi.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10)
    const thumbnailUrl = `https://picsum.photos/160/200?random=${imageSeed}`
    const thumbnailUrlWide = `https://picsum.photos/880/200?random=${imageSeed}`
    
    return {
      "@context": "https://schema.org",
      "@type": "ScholarlyArticle",
      "headline": `Publication for DOI: ${doi}`,
      "name": `Publication for DOI: ${doi}`,
      "doi": doi,
      "datePublished": new Date().toISOString().split('T')[0],
      "author": [
        {
          "@type": "Person",
          "name": "Unknown Author"
        }
      ],
      "abstract": `Publication data for DOI ${doi}. This DOI is not in our local database. In production, this would fetch real data from CrossRef API.`,
      "publisher": {
        "@type": "Organization",
        "name": "Unknown Publisher"
      },
      "image": thumbnailUrl,
      "thumbnailUrl": thumbnailUrl,
      "thumbnailUrlWide": thumbnailUrlWide
    }
  }

  // OPTION A: Control generation AND display based on showMockData
  // In archetype mode, all contentSources should generate mock data or show placeholder
  // regardless of the actual contentSource value
  
  // Handle showMockData toggle - show placeholder when false (don't generate)
  if (!showMockData) {
    // For any dynamic content source, show placeholder
    if (widget.contentSource === 'dynamic-query' || 
        widget.contentSource === 'ai-generated' || 
        widget.contentSource === 'context') {
      return (
        <div className="border border-dashed border-blue-300 bg-blue-50 rounded-lg p-6 text-center text-blue-700">
          <p className="font-medium">Dynamic Content</p>
          <p className="text-sm mt-2">
            {widget.contentSource === 'dynamic-query' 
              ? 'This widget will fetch the latest articles at runtime.'
              : 'This widget will fetch the journal metadata in context at runtime.'}
          </p>
        </div>
      )
    }
  }
  
  // Get publication based on content source
  let publication: any = null
  let isAIGenerated = false
  
  try {
    if (widget.contentSource === 'context') {
      
      // If we have journal context, use journal-specific mock metadata (not AI-generated)
      if (journalContext) {
        try {
          const journalMeta = getJournalMetadata(journalContext)
          if (journalMeta) {
            publication = journalMeta
          } else {
            // Fallback to context function
            publication = getJournalFromContext()
          }
        } catch (error) {
          debugLog('error', 'Error fetching journal metadata:', error)
          publication = getJournalFromContext()
        }
      } else if (showMockData) {
        // No journal context but showMockData=true: Generate AI metadata for archetype preview/editor
        isAIGenerated = true
        const memoizedJournal = useMemo(() => {
          return generateJournalMetadata('Generate journal metadata for a scientific journal')
        }, [widget.id]) // Only regenerate if widget ID changes
        publication = memoizedJournal
      } else {
        // Try to get journal data from current context (for actual page instances without journalContext prop)
        publication = getJournalFromContext()
        if (!publication) {
          return (
            <div className="border border-dashed border-amber-300 bg-amber-50 rounded-lg p-6 text-center text-amber-700">
              <p className="font-medium">Journal Context Required</p>
              <p className="text-sm mt-2">This widget shows journal metadata. Place it on a journal page or select a specific content source.</p>
              {!journalContext && <p className="text-xs mt-1 text-amber-500">Current context: No journal selected</p>}
            </div>
          )
        }
      }
    } else if (widget.contentSource === 'doi' && widget.doiSource?.doi) {
      // Fetch publication by DOI (mock implementation)
      publication = fetchPublicationByDOI(widget.doiSource.doi)
    } else if (widget.contentSource === 'schema-objects' && widget.schemaSource?.selectedId) {
      // Get single schema object by ID
      const schemaObj = schemaObjects.find(obj => obj.id === widget.schemaSource?.selectedId)
      if (schemaObj) {
        try {
          publication = JSON.parse(schemaObj.jsonLD)
        } catch (e) {
          debugLog('error', 'Failed to parse JSON-LD for publication details:', schemaObj.id, e)
          publication = null
        }
      }
    } else if (widget.contentSource === 'ai-generated' && widget.aiSource?.prompt) {
      // OPTION A: Only generate if showMockData is true
      if (!showMockData) {
        // Should have been caught by early return, but double-check
        return (
          <div className="border border-dashed border-blue-300 bg-blue-50 rounded-lg p-6 text-center text-blue-700">
            <p className="font-medium">Dynamic Content</p>
            <p className="text-sm mt-2">This widget will fetch the journal metadata in context at runtime.</p>
          </div>
        )
      }
      
      // Generate AI content for single publication (could be article or journal)
      isAIGenerated = true
      try {
        // Memoize AI generation to prevent regeneration on every render
        // Check if prompt suggests journal (not article) - generate journal metadata
        const prompt = widget.aiSource.prompt.toLowerCase()
        const isJournalPrompt = prompt.includes('journal') || prompt.includes('periodical')
        
        const memoizedPublication = useMemo(() => {
          return isJournalPrompt 
            ? generateJournalMetadata(widget.aiSource.prompt)
            : generateAISingleContent(widget.aiSource.prompt)
        }, [widget.id, widget.aiSource.prompt, isJournalPrompt])
        
        publication = memoizedPublication
        
        // Ensure AI-generated content always has thumbnails
        if (publication && !publication.thumbnailUrl && !publication.image) {
          const imageSeed = publication.doi 
            ? publication.doi.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10)
            : (publication.headline || publication.name || 'ai-generated').substring(0, 10).replace(/[^a-zA-Z0-9]/g, '') || 'default'
          publication.image = `https://picsum.photos/160/200?random=${imageSeed}`
          publication.thumbnailUrl = publication.image
          publication.thumbnailUrlWide = `https://picsum.photos/880/200?random=${imageSeed}`
        }
      } catch (error) {
        debugLog('error', 'Error generating AI content for publication details:', error)
        publication = widget.publication // Fallback to default
      }
    } else {
      // Use default publication
      publication = widget.publication
    }
  } catch (error) {
    debugLog('error', 'Error loading publication details:', error)
    publication = widget.publication
  }

  // If no publication data, show placeholder
  if (!publication) {
    return (
      <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-500">
        <p>No publication data available</p>
        <p className="text-sm mt-2">Configure content source in properties panel</p>
      </div>
    )
  }

  // Use PublicationCard for ALL rendering (Articles, Journals, Issues, Books, etc.)
  // The card config handles display elements based on publication @type
  return (
    <div className="relative">
      {isAIGenerated && showMockData && (
        <div className="absolute top-2 right-2 z-10">
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-md border border-purple-300">
            <span>🤖</span>
            <span>AI Generated</span>
          </span>
        </div>
      )}
      <PublicationCard 
        article={publication}
        config={resolvedConfig}
        align={widget.align}
        contentMode={sectionContentMode}
      />
    </div>
  )
}

// Publication List Widget with full implementation
const PublicationListWidgetRenderer: React.FC<{ widget: PublicationListWidget; schemaObjects: any[]; sectionContentMode?: 'light' | 'dark'; journalContext?: string; showMockData?: boolean }> = ({ widget, schemaObjects, sectionContentMode, journalContext, showMockData = true }) => {
  
  // Resolve variant ID to get latest config (ensures variant changes are reflected)
  const publicationCardVariants = usePageStore.getState().publicationCardVariants
  const resolvedConfig = widget.cardVariantId 
    ? (publicationCardVariants.find((v: any) => v.id === widget.cardVariantId)?.config || widget.cardConfig)
    : widget.cardConfig
  
  // OPTION A: Control generation AND display based on showMockData
  // Handle showMockData toggle - show placeholder when false (don't generate)
  // BUT: If we have journalContext, we should show journal articles even if showMockData is false
  // IMPORTANT: In Page Instance mode, 'dynamic-query' should be treated as "Page Context" 
  // (use journal in context), not as "generate random AI content"
  
  // Only show placeholder if showMockData is false AND we don't have journal context
  // If we have journal context, we should show journal articles even if showMockData is false
  // Also: 'dynamic-query' with journalContext should be treated as page context (not placeholder)
  if (!showMockData && !journalContext) {
    // For any dynamic content source, show placeholder (only if no journal context)
    if (widget.contentSource === 'dynamic-query' || 
        widget.contentSource === 'ai-generated' || 
        widget.contentSource === 'context') {
      return (
        <div className="border border-dashed border-blue-300 bg-blue-50 rounded-lg p-6 text-center text-blue-700">
          <p className="font-medium">Dynamic Content</p>
          <p className="text-sm mt-2">This widget will fetch the latest articles at runtime.</p>
        </div>
      )
    }
  }
  
  // Get publications based on content source
  let publications: any[] = []
  // Initialize isAIGenerated based on whether we have journal context
  // If we have journalContext, we'll use journal-specific data (not AI)
  let isAIGenerated = !journalContext
  
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
              debugLog('error', 'Failed to parse JSON-LD for object:', obj.id, e)
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
              debugLog('error', 'Failed to parse JSON-LD for object:', obj!.id, e)
              return null
            }
          })
          .filter(pub => pub !== null)
      }
    } catch (error) {
      debugLog('error', 'Error loading schema objects:', error)
      publications = []
    }
  } else if (widget.contentSource === 'doi-list' && widget.doiSource?.dois && widget.doiSource.dois.length > 0) {
    // Fetch publications by DOI from citation database
    try {
      publications = widget.doiSource.dois
        .map(doi => {
          const citation = getCitationByDOI(doi)
          if (citation) {
            return citationToSchemaOrg(citation)
          }
          return null
        })
        .filter(pub => pub !== null)
    } catch (error) {
      debugLog('error', 'Error loading DOI publications:', error)
      publications = []
    }
  } else if (widget.contentSource === 'ai-generated' && widget.aiSource?.prompt) {
    // OPTION A: Only generate if showMockData is true
    if (!showMockData) {
      // Should have been caught by early return, but double-check
      return (
        <div className="border border-dashed border-blue-300 bg-blue-50 rounded-lg p-6 text-center text-blue-700">
          <p className="font-medium">Dynamic Content</p>
          <p className="text-sm mt-2">This widget will fetch the latest articles at runtime.</p>
        </div>
      )
    }
    
      // Generate AI content based on prompt (memoized to prevent regeneration on every render)
      isAIGenerated = true
      try {
        // Use memoization to cache generated content based on widget ID and prompt
        // This prevents regeneration on every click/interaction
        const memoizedContent = useMemo(() => {
          return generateAIContent(widget.aiSource.prompt)
        }, [widget.id, widget.aiSource.prompt])
        publications = memoizedContent
      } catch (error) {
        debugLog('error', 'Error generating AI content:', error)
        publications = widget.publications || [] // Fallback to default
      }
  } else if (widget.contentSource === 'dynamic-query') {
    // CRITICAL: In Page Instance mode, 'dynamic-query' should be treated as "Page Context"
    // The archetype stores 'dynamic-query' as config, but at runtime it should use the journal in context
    // This is NOT "generate random AI articles" - it's "fetch articles for the current journal"
    if (journalContext) {
      // Page Instance mode: Use journal-specific mock data (treat dynamic-query as page context)
      // IMPORTANT: Do NOT set isAIGenerated = true here - this is real journal data, not AI
      // Use useMemo to cache journal-specific publications based on journalContext
      const journalPubs = useMemo(() => {
        try {
          const result = getJournalPublications(journalContext, widget.maxItems || 5)
          return result
        } catch (error) {
          debugLog('error', '❌ [PublicationListWidgetRenderer] Error fetching journal publications:', error)
          return []
        }
      }, [journalContext, widget.maxItems]) // Re-compute when journalContext changes
      
      if (journalPubs.length > 0) {
        publications = journalPubs
        isAIGenerated = false // Explicitly set to false - this is journal-specific data, not AI
      } else {
        publications = []
      }
    } else if (showMockData) {
      // Archetype preview mode (no journal context): Generate AI content for preview
      // This is only for archetype editor/preview where there's no specific journal context
      isAIGenerated = true
      try {
        const itemCount = widget.maxItems || 5
        const defaultPrompt = `Generate ${itemCount} articles on chemical engineering and materials science`
        const memoizedContent = useMemo(() => {
          return generateAIContent(defaultPrompt)
        }, [widget.id, widget.maxItems]) // Only regenerate if widget ID or maxItems changes
        publications = memoizedContent
      } catch (error) {
        debugLog('error', 'Error generating dynamic query content:', error)
        publications = widget.publications || []
      }
    } else {
      // No journal context and showMockData is false - show placeholder
      return (
        <div className="border border-dashed border-blue-300 bg-blue-50 rounded-lg p-6 text-center text-blue-700">
          <p className="font-medium">Dynamic Content</p>
          <p className="text-sm mt-2">This widget will fetch the latest articles at runtime.</p>
        </div>
      )
    }
  } else {
    // Use default publications for other content sources
    publications = widget.publications || []
  }
  
  let displayedPublications = widget.maxItems 
    ? publications.slice(0, widget.maxItems)
    : publications
  
  // Check if pattern mode is enabled
  const patternModeEnabled = widget.spanningConfig?.enabled && widget.spanningConfig?.preset
  
  // Apply list pattern if spanning config is enabled
  // Pattern applies BOTH grid and flex properties, so it works in either parent layout
  if (patternModeEnabled) {
    displayedPublications = applyListPattern(
      displayedPublications,
      widget.spanningConfig!,
      'grid' // Parameter kept for API compatibility, but now applies both grid and flex
    )
  }

  // Pattern Mode: Render publications in a transparent container
  // They will flow directly into parent Grid/Flex layout
  if (patternModeEnabled) {
    return (
      <>
        {displayedPublications.map((article: any, index: number) => {
          // Extract grid/flex properties from patterned article
          const gridSpan = article.gridSpan
          const flexProps = article.flexProperties
          
          return (
            <div
              key={`${widget.id}-${index}`}
              style={{
                // Grid properties
                gridColumn: gridSpan?.column,
                gridRow: gridSpan?.row,
                // Flex properties with intelligent width constraints
                flexGrow: flexProps?.grow ? 1 : 0,
                flexShrink: 1, // Allow shrinking
                flexBasis: flexProps?.grow ? '400px' : '300px', // Featured cards start larger
                minWidth: '280px', // Prevent cards from getting too narrow
                // Only constrain max-width for non-growing cards (uniform items)
                // Featured/hero cards (grow=true) can expand beyond 600px
                ...(flexProps?.grow ? {} : { maxWidth: '400px' })
              }}
            >
              <PublicationCard
                article={article}
                config={resolvedConfig}
                align={widget.align}
                contentMode={sectionContentMode}
              />
            </div>
          )
        })}
        
      </>
    )
  }

  // Standard Mode: Render with widget's own layout
  const shouldShowBadge = isAIGenerated && showMockData && !journalContext
  
  return (
    <div className="space-y-6 relative">
      {/* Only show AI badge if content is actually AI-generated (not journal-specific data) */}
      {shouldShowBadge && (
        <div className="absolute top-0 right-0 z-10">
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-md border border-purple-300">
            <span>🤖</span>
            <span>AI Generated</span>
          </span>
        </div>
      )}
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
            config={resolvedConfig}
            align={widget.align}
            contentMode={sectionContentMode}
          />
        ))}
      </div>

      
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

// Clickable Widget in Tab Panel Component
const ClickableWidgetInTabPanel: React.FC<{
  widget: Widget
  tabsWidgetId: string
  tabId: string
  schemaObjects: any[]
  journalContext?: string
  sectionContentMode?: 'light' | 'dark'
}> = ({ widget, tabsWidgetId, tabId, schemaObjects, journalContext, sectionContentMode }) => {
  const [activeWidgetToolbar, setActiveWidgetToolbar] = useState<string | null>(null)

  const handleWidgetClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setActiveWidgetToolbar(activeWidgetToolbar === widget.id ? null : widget.id)
    
    // Update selected widget in store - access from window directly
    const store = window.usePageStore || usePageStore
    if (store) {
      try {
        const state = store.getState()
        if (state.selectWidget) {
          state.selectWidget(widget.id)
        } else {
          debugLog('error', '❌ selectWidget function not found in store')
        }
      } catch (error) {
        debugLog('error', '❌ Error selecting widget:', error)
      }
    } else {
      debugLog('error', '❌ Store is undefined (neither window.usePageStore nor module usePageStore available)')
    }
  }

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation()
    
    const store = window.usePageStore || usePageStore
    if (!store) return
    
    const { canvasItems, replaceCanvasItems } = store.getState()
    const duplicatedWidget = { ...widget, id: nanoid() }
    
    // Find and update the tabs widget containing this widget
    const updatedCanvasItems = canvasItems.map((item: any) => {
      // Check standalone tabs widget
      if (item.id === tabsWidgetId && item.type === 'tabs') {
        return {
          ...item,
          tabs: item.tabs.map((tab: any) => 
            tab.id === tabId 
              ? { ...tab, widgets: [...tab.widgets, duplicatedWidget] }
              : tab
          )
        }
      }
      // Check tabs widget in sections
      if (item.areas) {
        return {
          ...item,
          areas: item.areas.map((area: any) => ({
            ...area,
            widgets: area.widgets.map((w: any) => {
              if (w.id === tabsWidgetId && w.type === 'tabs') {
                return {
                  ...w,
                  tabs: w.tabs.map((tab: any) => 
                    tab.id === tabId 
                      ? { ...tab, widgets: [...tab.widgets, duplicatedWidget] }
                      : tab
                  )
                }
              }
              return w
            })
          }))
        }
      }
      return item
    })
    
    replaceCanvasItems(updatedCanvasItems)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const store = window.usePageStore || usePageStore
    if (!store) return
    
    const { canvasItems, replaceCanvasItems } = store.getState()
    
    // Find and update the tabs widget containing this widget
    const updatedCanvasItems = canvasItems.map((item: any) => {
      // Check standalone tabs widget
      if (item.id === tabsWidgetId && item.type === 'tabs') {
        return {
          ...item,
          tabs: item.tabs.map((tab: any) => 
            tab.id === tabId 
              ? { ...tab, widgets: tab.widgets.filter((w: any) => w.id !== widget.id) }
              : tab
          )
        }
      }
      // Check tabs widget in sections
      if (item.areas) {
        return {
          ...item,
          areas: item.areas.map((area: any) => ({
            ...area,
            widgets: area.widgets.map((w: any) => {
              if (w.id === tabsWidgetId && w.type === 'tabs') {
                return {
                  ...w,
                  tabs: w.tabs.map((tab: any) => 
                    tab.id === tabId 
                      ? { ...tab, widgets: tab.widgets.filter((tw: any) => tw.id !== widget.id) }
                      : tab
                  )
                }
              }
              return w
            })
          }))
        }
      }
      return item
    })
    
    replaceCanvasItems(updatedCanvasItems)
  }

  return (
    <div className="cursor-pointer hover:ring-2 hover:ring-purple-300 rounded transition-all group relative">
      {/* Overlay to capture clicks */}
      <div 
        className="absolute inset-0 z-10 bg-transparent hover:bg-purple-50/10 transition-colors"
        style={{ pointerEvents: 'auto' }}
        onClick={handleWidgetClick}
      />
      
      {/* Widget Action Toolbar */}
      {activeWidgetToolbar === widget.id && (
        <div className="absolute -top-2 -right-2 transition-opacity z-20" style={{ pointerEvents: 'auto' }}>
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg shadow-lg px-2 py-1">
            <button
              onClick={handleDuplicate}
              className="p-1 text-gray-500 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors"
              title="Duplicate widget"
            >
              <Copy className="w-3 h-3" />
            </button>
            <button
              onClick={handleWidgetClick}
              className="p-1 text-gray-500 hover:text-purple-600 rounded hover:bg-purple-50 transition-colors"
              title="Properties"
              type="button"
            >
              <Edit className="w-3 h-3" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1 text-gray-500 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
              title="Delete widget"
              type="button"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
      
      {/* Widget Content - non-interactive */}
      <div style={{ pointerEvents: 'none', position: 'relative', zIndex: 1 }}>
        <WidgetRenderer 
          widget={widget}
          schemaObjects={schemaObjects}
          journalContext={journalContext}
          sectionContentMode={sectionContentMode}
        />
      </div>
    </div>
  )
}

// Droppable Tab Panel Component
const DroppableTabPanel: React.FC<{
  tabId: string
  widgets: Widget[]
  widgetId: string
  schemaObjects: any[]
  journalContext?: string
  sectionContentMode?: 'light' | 'dark'
  isActive?: boolean
  isLiveMode?: boolean
}> = ({ tabId, widgets, widgetId, schemaObjects, journalContext, sectionContentMode, isActive = false, isLiveMode = false }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `tab-panel-${tabId}`,
    data: {
      type: 'tab-panel',
      tabId: tabId,
      widgetId: widgetId,
      accepts: ['widget']
    }
  })
  
  
  return (
    <div
      ref={setNodeRef}
      className={`relative min-h-[200px] ${!isLiveMode ? 'border-2' : ''} rounded-md p-4 transition-all ${
        !isLiveMode && isOver 
          ? 'border-blue-400 bg-blue-50 border-solid' 
          : !isLiveMode && widgets.length === 0
          ? isActive 
            ? 'border-blue-300 bg-blue-50/30 border-dashed'
            : 'border-gray-300 bg-gray-50 border-dashed'
          : !isLiveMode && isActive
          ? 'border-blue-300 bg-blue-50/20 border-solid'
          : !isLiveMode
          ? 'border-gray-200 bg-transparent border-dashed'
          : '' // No border/background in live mode
      }`}
      style={{ 
        minHeight: isLiveMode && widgets.length === 0 ? '0px' : '200px',
        width: '100%',
        position: 'relative',
        zIndex: 5
      }}
      data-droppable-type="tab-panel"
      data-tab-id={tabId}
    >
      {/* Active tab indicator - only show in editor mode */}
      {!isLiveMode && isActive && (
        <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-medium z-10 shadow-sm">
          Active Tab
        </div>
      )}
      
      {widgets.length === 0 ? (
        !isLiveMode && (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm italic">
            {isOver ? 'Drop widget here' : isActive ? 'Drop widgets here (Active Tab)' : 'Drag widgets here from the library'}
          </div>
        )
      ) : (
        <>
          {/* Drop zone indicator when dragging over - only in editor mode */}
          {!isLiveMode && isOver && (
            <div className="absolute inset-0 border-2 border-blue-400 bg-blue-50/50 rounded-md z-10 flex items-center justify-center pointer-events-none">
              <span className="text-blue-600 font-medium text-sm">Drop widget here</span>
            </div>
          )}
          <div className="space-y-3">
            {widgets.map(widget => (
              isLiveMode ? (
                <WidgetRenderer 
                  key={widget.id}
                  widget={widget}
                  schemaObjects={schemaObjects}
                  journalContext={journalContext}
                  sectionContentMode={sectionContentMode}
                  isLiveMode={isLiveMode}
                />
              ) : (
                <ClickableWidgetInTabPanel
                  key={widget.id}
                  widget={widget}
                  tabsWidgetId={widgetId}
                  tabId={tabId}
                  schemaObjects={schemaObjects}
                  journalContext={journalContext}
                  sectionContentMode={sectionContentMode}
                />
              )
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// Tabs Widget Renderer
const TabsWidgetRenderer: React.FC<{
  widget: TabsWidget
  schemaObjects?: any[]
  journalContext?: string
  sectionContentMode?: 'light' | 'dark'
  isLiveMode?: boolean
}> = ({ widget, schemaObjects = [], journalContext, sectionContentMode, isLiveMode = false }) => {
  const [activeIndex, setActiveIndex] = useState(widget.activeTabIndex || 0)
  
  // Sync activeIndex with widget's activeTabIndex when widget updates from external source
  React.useEffect(() => {
    const widgetIndex = widget.activeTabIndex !== undefined ? widget.activeTabIndex : 0
    setActiveIndex(widgetIndex)
  }, [widget.activeTabIndex, widget.id]) // Watch both activeTabIndex and widget ID
  
  // Update widget's activeTabIndex when local state changes
  const handleTabChange = (index: number) => {
    setActiveIndex(index)
    
    // We need to update the widget in the store so the activeTabIndex persists
    const store = window.usePageStore || usePageStore
    if (store) {
      const { canvasItems, replaceCanvasItems } = store.getState()
      const updatedItems = canvasItems.map((item: any) => {
        // Update standalone tabs widget
        if (item.id === widget.id && item.type === 'tabs') {
          return { ...item, activeTabIndex: index }
        }
        // Update tabs widget inside sections
        if (item.areas) {
          return {
            ...item,
            areas: item.areas.map((area: any) => ({
              ...area,
              widgets: area.widgets.map((w: any) => {
                if (w.id === widget.id && w.type === 'tabs') {
                  return { ...w, activeTabIndex: index }
                }
                return w
              })
            }))
          }
        }
        return item
      })
      replaceCanvasItems(updatedItems)
    } else {
      debugLog('error', '❌ Store not available in handleTabChange - tab switching will not persist')
    }
  }
  
  // Get tab style classes - NO TAILWIND, pure semantic classes
  const getTabNavClasses = () => {
    const baseClasses = 'tabs-nav'
    const styleClasses = widget.tabStyle === 'pills' ? 'tabs-pills' : widget.tabStyle === 'buttons' ? 'tabs-buttons' : 'tabs-underline'
    const alignmentClasses = widget.align === 'center' ? 'tabs-center' : widget.align === 'right' ? 'tabs-right' : 'tabs-left'
    return `${baseClasses} ${styleClasses} ${alignmentClasses}`
  }
  
  return (
    <div className="tabs-widget w-full" onClick={(e) => {
      // Allow clicking on the tabs widget background to select it for properties
      // But don't interfere with tab button clicks or drop zone interactions
      const target = e.target as HTMLElement
      if (target.closest('.tab-button') || target.closest('.droppable-tab-panel')) {
        return
      }
    }}>
      {/* Tab Navigation */}
      <div className={getTabNavClasses()} style={{ pointerEvents: 'auto', position: 'relative', zIndex: 30 }}>
        {widget.tabs.map((tab, index) => (
          <button
            key={tab.id}
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              handleTabChange(index)
            }}
            className={`tab-button ${activeIndex === index ? 'active' : ''}`}
            style={{ pointerEvents: 'auto', position: 'relative', zIndex: 31 }}
            type="button"
          >
            {tab.icon && <span className="mr-2">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Active Tab Panel */}
      <div className="tab-panel mt-4">
        {(() => {
          const currentTab = widget.tabs[activeIndex]
          return currentTab ? (
            <DroppableTabPanel
              tabId={currentTab.id}
              widgets={currentTab.widgets}
              widgetId={widget.id}
              schemaObjects={schemaObjects}
              journalContext={journalContext}
              sectionContentMode={sectionContentMode}
              isActive={true}
              isLiveMode={isLiveMode}
            />
          ) : null
        })()}
      </div>
    </div>
  )
}

// Droppable Collapse Panel Component
const DroppableCollapsePanel: React.FC<{
  panelId: string
  widgets: Widget[]
  widgetId: string
  schemaObjects: any[]
  journalContext?: string
  sectionContentMode?: 'light' | 'dark'
  isOpen: boolean
  isLiveMode?: boolean
}> = ({ panelId, widgets, widgetId, schemaObjects, journalContext, sectionContentMode, isOpen, isLiveMode = false }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `collapse-panel-${panelId}`,
    data: {
      type: 'collapse-panel',
      panelId: panelId,
      widgetId: widgetId,
      accepts: ['widget']
    }
  })
  
  if (!isOpen && !isLiveMode) {
    // Show collapsed panel as a thin line with hint in editor mode
    return (
      <div className="text-xs text-gray-400 italic py-1">
        (Panel collapsed - click header to expand)
      </div>
    )
  }
  
  if (!isOpen && isLiveMode) {
    // Hide collapsed panel completely in live mode
    return null
  }
  
  return (
    <div
      ref={setNodeRef}
      className={`relative ${!isLiveMode ? 'min-h-[150px] border-2 rounded-md p-4' : 'py-4'} transition-all ${
        !isLiveMode && isOver 
          ? 'border-blue-400 bg-blue-50 border-solid' 
          : !isLiveMode && widgets.length === 0
          ? 'border-blue-300 bg-blue-50/30 border-dashed'
          : !isLiveMode
          ? 'border-gray-200 bg-transparent border-solid'
          : '' // No border/background in live mode
      }`}
      style={{ 
        minHeight: isLiveMode && widgets.length === 0 ? '0px' : '150px',
        width: '100%',
        position: 'relative'
      }}
      data-droppable-type="collapse-panel"
      data-panel-id={panelId}
    >
      {widgets.length === 0 ? (
        !isLiveMode && (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm italic">
            {isOver ? 'Drop widget here' : 'Drag widgets here from the library'}
          </div>
        )
      ) : (
        <>
          {/* Drop zone indicator when dragging over - only in editor mode */}
          {!isLiveMode && isOver && (
            <div className="absolute inset-0 border-2 border-blue-400 bg-blue-50/50 rounded-md z-10 flex items-center justify-center pointer-events-none">
              <span className="text-blue-600 font-medium text-sm">Drop widget here</span>
            </div>
          )}
          <div className="space-y-3">
            {widgets.map(widget => (
              isLiveMode ? (
                <WidgetRenderer 
                  key={widget.id}
                  widget={widget}
                  schemaObjects={schemaObjects}
                  journalContext={journalContext}
                  sectionContentMode={sectionContentMode}
                  isLiveMode={isLiveMode}
                />
              ) : (
                <ClickableWidgetInTabPanel
                  key={widget.id}
                  widget={widget}
                  tabsWidgetId={widgetId}
                  tabId={panelId}
                  schemaObjects={schemaObjects}
                  journalContext={journalContext}
                  sectionContentMode={sectionContentMode}
                />
              )
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// Collapse/Accordion Widget Renderer
const CollapseWidgetRenderer: React.FC<{
  widget: CollapseWidget
  schemaObjects?: any[]
  journalContext?: string
  sectionContentMode?: 'light' | 'dark'
  isLiveMode?: boolean
}> = ({ widget, schemaObjects = [], journalContext, sectionContentMode, isLiveMode = false }) => {
  // Track which panels are open/closed locally, but sync with widget state
  const [openPanels, setOpenPanels] = useState<Set<string>>(
    new Set(widget.panels.filter(p => p.isOpen).map(p => p.id))
  )
  
  // Sync local state with widget state when widget updates
  React.useEffect(() => {
    setOpenPanels(new Set(widget.panels.filter(p => p.isOpen).map(p => p.id)))
  }, [widget.panels])
  
  // Calculate luminance to determine if primary color is dark or light
  const getColorLuminance = (color: string): number => {
    const rgb = getComputedRGBFromVar(color)
    if (!rgb) return 0.5
    
    const [r, g, b] = rgb.map(val => {
      const normalized = val / 255
      return normalized <= 0.03928
        ? normalized / 12.92
        : Math.pow((normalized + 0.055) / 1.055, 2.4)
    })
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }
  
  const getComputedRGBFromVar = (varName: string): [number, number, number] | null => {
    if (typeof window === 'undefined') return null
    
    const temp = document.createElement('div')
    temp.style.color = varName.includes('var(') ? varName : `var(${varName}, #0066cc)`
    document.body.appendChild(temp)
    
    const computed = window.getComputedStyle(temp).color
    document.body.removeChild(temp)
    
    const match = computed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
    if (match) {
      return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])]
    }
    
    return null
  }
  
  // Check if current theme is Classic
  const isClassicTheme = () => {
    const store = window.usePageStore || usePageStore
    if (!store) return false
    
    const state = store.getState()
    const currentWebsite = state.websites?.find((w: any) => w.id === state.currentWebsiteId)
    const currentTheme = state.themes?.find((t: any) => t.id === currentWebsite?.themeId)
    
    return currentTheme?.id === 'classic-ux3-theme'
  }
  
  // Get styles for default collapse style (primary color background for Classic only)
  const getDefaultStyleColors = () => {
    if (!isClassicTheme()) {
      // Non-Classic themes: use original gray styling
      return {}
    }
    
    // Classic theme: use primary color with adaptive text
    const primaryColor = 'var(--foundation-action-primary, #0066cc)'
    const luminance = getColorLuminance(primaryColor)
    const isDark = luminance < 0.5
    
    return {
      backgroundColor: primaryColor,
      color: isDark ? '#ffffff' : '#000000'
    }
  }
  
  // Get CSS classes for default style (gray for non-Classic, styled for Classic)
  const getDefaultStyleClasses = () => {
    if (!isClassicTheme()) {
      return 'bg-gray-100 hover:bg-gray-200'
    }
    return '' // Classic uses inline styles
  }
  
  const togglePanel = (panelId: string) => {
    const newOpenPanels = new Set(openPanels)
    
    if (widget.allowMultiple) {
      // Allow multiple panels open (accordion mode off)
      if (newOpenPanels.has(panelId)) {
        newOpenPanels.delete(panelId)
      } else {
        newOpenPanels.add(panelId)
      }
    } else {
      // Only one panel open at a time (accordion mode on)
      if (newOpenPanels.has(panelId)) {
        newOpenPanels.delete(panelId)
      } else {
        newOpenPanels.clear()
        newOpenPanels.add(panelId)
      }
    }
    
    setOpenPanels(newOpenPanels)
    
    // Update widget state in store
    const store = window.usePageStore || usePageStore
    if (store) {
      const { canvasItems, replaceCanvasItems } = store.getState()
      const updatedItems = canvasItems.map((item: any) => {
        // Update standalone collapse widget
        if (item.id === widget.id && item.type === 'collapse') {
          return { 
            ...item, 
            panels: item.panels.map((p: CollapsePanel) => ({
              ...p,
              isOpen: newOpenPanels.has(p.id)
            }))
          }
        }
        // Update collapse widget inside sections
        if (item.areas) {
          return {
            ...item,
            areas: item.areas.map((area: any) => ({
              ...area,
              widgets: area.widgets.map((w: any) => {
                if (w.id === widget.id && w.type === 'collapse') {
                  return { 
                    ...w, 
                    panels: w.panels.map((p: CollapsePanel) => ({
                      ...p,
                      isOpen: newOpenPanels.has(p.id)
                    }))
                  }
                }
                return w
              })
            }))
          }
        }
        return item
      })
      replaceCanvasItems(updatedItems)
    }
  }
  
  const getCollapseStyleClasses = () => {
    switch (widget.style) {
      case 'bordered':
        return 'collapse-bordered'
      case 'minimal':
        return 'collapse-minimal'
      default:
        return 'collapse-default'
    }
  }
  
  return (
    <div 
      className={`collapse-widget w-full space-y-2 ${getCollapseStyleClasses()}`}
      data-collapse-widget="true"
    >
      {widget.panels.map((panel, panelIndex) => {
        const isOpen = openPanels.has(panel.id)
        
        return (
          <div 
            key={panel.id} 
            className={`collapse-panel ${widget.style === 'bordered' ? 'border border-gray-200 rounded-md' : ''}`}
          >
            {/* Panel Header */}
            <div className={`collapse-header-wrapper flex items-center ${widget.style === 'bordered' ? '' : widget.style === 'minimal' ? 'border-b border-gray-200' : ''}`}>
              <button
                onClick={(e) => {
                  e.stopPropagation() // Prevent interference with widget selection
                  togglePanel(panel.id)
                }}
                className={`flex-1 text-left px-4 py-3 font-medium transition-colors flex items-center justify-between ${
                  widget.style === 'bordered' 
                    ? 'hover:bg-gray-50' 
                    : widget.style === 'minimal'
                    ? 'hover:bg-gray-50'
                    : `rounded-l-md ${getDefaultStyleClasses()}`
                }`}
                style={
                  widget.style === 'default' 
                    ? { ...getDefaultStyleColors(), pointerEvents: 'auto', position: 'relative', zIndex: 20 }
                    : { pointerEvents: 'auto', position: 'relative', zIndex: 20 }
                }
                type="button"
              >
                <div className="flex items-center gap-2">
                  {widget.iconPosition === 'left' && (
                    <span className={`transform transition-transform ${isOpen ? 'rotate-90' : ''}`}>
                      {panel.icon || '▶'}
                    </span>
                  )}
                  <span>{panel.title}</span>
                </div>
                {widget.iconPosition === 'right' && (
                  <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                    {panel.icon || '▼'}
                  </span>
                )}
              </button>
              
              {/* Edit Widget Button - only show on first panel in edit mode */}
              {!isLiveMode && panelIndex === 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation() // Don't toggle the panel
                    // Trigger widget selection via data attribute
                    const event = new CustomEvent('selectCollapseWidget', { 
                      detail: { widgetId: widget.id },
                      bubbles: true 
                    })
                    e.currentTarget.dispatchEvent(event)
                  }}
                  className={`px-3 py-4 transition-colors ${
                    widget.style === 'bordered' 
                      ? 'text-gray-500 hover:text-blue-600 hover:bg-blue-50' 
                      : widget.style === 'minimal'
                      ? 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                      : isClassicTheme() 
                        ? 'rounded-r-md hover:opacity-80'
                        : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-r-md bg-gray-100'
                  }`}
                  style={
                    widget.style === 'default' 
                      ? { ...getDefaultStyleColors(), pointerEvents: 'auto', position: 'relative', zIndex: 20 }
                      : { pointerEvents: 'auto', position: 'relative', zIndex: 20 }
                  }
                  type="button"
                  title="Edit widget properties"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {/* Panel Content */}
            {isOpen && (
              <div className={`collapse-content ${widget.style === 'bordered' ? 'p-4' : 'px-4'}`}>
                <DroppableCollapsePanel
                  panelId={panel.id}
                  widgets={panel.widgets}
                  widgetId={widget.id}
                  schemaObjects={schemaObjects}
                  journalContext={journalContext}
                  sectionContentMode={sectionContentMode}
                  isOpen={isOpen}
                  isLiveMode={isLiveMode}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// Breadcrumbs Widget Component
const BreadcrumbsWidgetRenderer: React.FC<{ 
  widget: BreadcrumbsWidget
  sectionContentMode?: 'light' | 'dark'
}> = ({ widget, sectionContentMode }) => {
  const items = widget.items || []
  const maxItems = widget.maxItems || 0 // 0 = no limit
  
  // Truncate items if maxItems is set
  const displayItems = maxItems > 0 && items.length > maxItems 
    ? [...items.slice(0, 1), { label: '...', href: undefined }, ...items.slice(-(maxItems - 2))]
    : items
  
  // Separator characters
  const separators: Record<string, string> = {
    'arrow': '→',
    'slash': '/',
    'chevron': '›',
    'dot': '•',
    'custom': widget.customSeparator || '/'
  }
  const separator = separators[widget.separator] || '/'
  
  // Alignment classes
  const alignClasses: Record<string, string> = {
    'left': 'justify-start',
    'center': 'justify-center',
    'right': 'justify-end'
  }
  
  // Style-specific classes
  const getItemClasses = (isLast: boolean, isFirst: boolean) => {
    const baseClasses = sectionContentMode === 'dark' 
      ? 'text-gray-300 hover:text-white' 
      : 'text-gray-600 hover:text-gray-900'
    
    const lastClasses = sectionContentMode === 'dark'
      ? 'text-white font-medium'
      : 'text-gray-900 font-medium'
    
    switch (widget.style) {
      case 'pills':
        return isLast 
          ? `${lastClasses} bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-sm`
          : `${baseClasses} px-3 py-1 rounded-full text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`
      case 'underline':
        return isLast
          ? `${lastClasses} border-b-2 border-current pb-0.5`
          : `${baseClasses} hover:border-b-2 hover:border-current pb-0.5 transition-all`
      default: // 'default'
        return isLast ? lastClasses : baseClasses
    }
  }
  
  const separatorClass = sectionContentMode === 'dark' 
    ? 'text-gray-500' 
    : 'text-gray-400'
  
  return (
    <nav aria-label="Breadcrumb" className="w-full">
      <ol className={`flex flex-wrap items-center gap-2 text-sm ${alignClasses[widget.align || 'left']}`}>
        {displayItems.map((item, index) => {
          const isFirst = index === 0
          const isLast = index === displayItems.length - 1
          const showHomeIcon = widget.showHomeIcon && isFirst
          
          return (
            <li key={index} className="flex items-center gap-2">
              {/* Separator (not for first item) */}
              {index > 0 && (
                widget.separator === 'chevron' ? (
                  <ChevronRight className={`w-4 h-4 ${separatorClass}`} aria-hidden="true" />
                ) : (
                  <span className={separatorClass} aria-hidden="true">{separator}</span>
                )
              )}
              
              {/* Breadcrumb item */}
              {item.href && !isLast ? (
                <a 
                  href={item.href} 
                  className={`${getItemClasses(isLast, isFirst)} flex items-center gap-1.5 transition-colors`}
                >
                  {showHomeIcon && <Home className="w-4 h-4" />}
                  {item.icon?.enabled && item.icon?.emoji && (
                    <span>{item.icon.emoji}</span>
                  )}
                  <span>{item.label}</span>
                </a>
              ) : (
                <span 
                  className={`${getItemClasses(isLast, isFirst)} flex items-center gap-1.5`}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {showHomeIcon && <Home className="w-4 h-4" />}
                  {item.icon?.enabled && item.icon?.emoji && (
                    <span>{item.icon.emoji}</span>
                  )}
                  <span>{item.label}</span>
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}


// Main Widget Renderer Component
export const WidgetRenderer: React.FC<{ widget: Widget; schemaObjects?: any[]; journalContext?: string; sectionContentMode?: 'light' | 'dark'; isLiveMode?: boolean; showMockData?: boolean }> = ({ widget, schemaObjects = [], journalContext, sectionContentMode, isLiveMode = false, showMockData = true }) => {
  const renderWidget = () => {
    switch (widget.type) {
      case 'button':
        return <ButtonWidgetRenderer widget={widget as ButtonWidget} sectionContentMode={sectionContentMode} />
      case 'text':
        return <TextWidgetRenderer widget={widget as TextWidget} sectionContentMode={sectionContentMode} />
      case 'image':
        return <ImageWidgetRenderer widget={widget as ImageWidget} />
      case 'navbar':
        return <NavbarWidgetRenderer widget={widget as NavbarWidget} />
      case 'menu':
        return <MenuWidgetRenderer widget={widget as MenuWidget} journalContext={journalContext} sectionContentMode={sectionContentMode} />
      case 'tabs':
        return <TabsWidgetRenderer widget={widget as TabsWidget} schemaObjects={schemaObjects} journalContext={journalContext} sectionContentMode={sectionContentMode} isLiveMode={isLiveMode} />
      case 'html':
        return <HTMLWidgetRenderer widget={widget as HTMLWidget} />
      case 'code':
        return <CodeWidgetRenderer widget={widget as CodeWidget} />
      case 'heading':
        return <HeadingWidgetRenderer widget={widget as HeadingWidget} />
      case 'publication-details':
        return <PublicationDetailsWidgetRenderer widget={widget as PublicationDetailsWidget} schemaObjects={schemaObjects} sectionContentMode={sectionContentMode} journalContext={journalContext} showMockData={showMockData} />
      case 'publication-list':
        return <PublicationListWidgetRenderer widget={widget as PublicationListWidget} schemaObjects={schemaObjects} sectionContentMode={sectionContentMode} journalContext={journalContext} showMockData={showMockData} />
      
      case 'collapse':
        return <CollapseWidgetRenderer widget={widget as CollapseWidget} schemaObjects={schemaObjects} journalContext={journalContext} sectionContentMode={sectionContentMode} isLiveMode={isLiveMode} />
      
      case 'editorial-card':
        return <EditorialCardRenderer widget={widget as EditorialCardWidget} isEditMode={!isLiveMode} />
      
      case 'divider': {
        const divider = widget as any // DividerWidget
        const borderColor = divider.color || '#e5e7eb'
        
        return (
          <div 
            style={{ 
              marginTop: divider.marginTop || '1rem',
              marginBottom: divider.marginBottom || '1rem'
            }}
          >
            <hr 
              style={{
                borderStyle: divider.style || 'solid',
                borderWidth: divider.thickness || '1px',
                borderColor: borderColor,
                margin: 0
              }}
            />
          </div>
        )
      }
      
      case 'spacer': {
        const spacer = widget as any // SpacerWidget
        return (
          <div 
            style={{ 
              height: spacer.height || '2rem',
              width: '100%'
            }}
            className={isLiveMode ? '' : 'border-2 border-dashed border-blue-200 bg-blue-50/30 flex items-center justify-center'}
            aria-hidden={isLiveMode ? "true" : undefined}
          >
            {!isLiveMode && (
              <span className="text-xs text-blue-400 font-medium">
                Spacer ({spacer.height || '2rem'})
              </span>
            )}
          </div>
        )
      }
      
      case 'breadcrumbs':
        return <BreadcrumbsWidgetRenderer widget={widget as BreadcrumbsWidget} sectionContentMode={sectionContentMode} />
      
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
