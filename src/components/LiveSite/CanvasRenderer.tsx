/**
 * CanvasRenderer - Renders canvas items using V1's actual renderers
 * 
 * This component bridges V1's canvas data with the V2 Live Site,
 * reusing the existing WidgetRenderer and SectionRenderer for proper styling.
 * 
 * Supports template variables in the format {context.property}, e.g., {journal.name}
 */

import { SectionRenderer } from '../Sections/SectionRenderer'
import { WidgetRenderer } from '../Widgets/WidgetRenderer'
import { CanvasThemeProvider } from '../Canvas/CanvasThemeProvider'
import { DynamicBrandingCSS } from '../BrandingSystem/DynamicBrandingCSS'
import { usePageStore } from '../../stores'
import type { CanvasItem, WidgetSection, Widget } from '../../types/widgets'

// Check if item is a section
function isSection(item: CanvasItem): item is WidgetSection {
  return 'areas' in item && Array.isArray((item as WidgetSection).areas)
}

// Template context for variable replacement
interface TemplateContext {
  journal?: {
    id?: string
    name?: string
    description?: string
    brandColor?: string
    brandColorLight?: string
  }
  issue?: {
    id?: string
    name?: string
    description?: string
  }
  article?: {
    title?: string
    authors?: string
    doi?: string
    abstract?: string
    keywords?: string
    contentType?: string
  }
  [key: string]: any
}

/**
 * Replace template variables in a string
 * e.g., "{journal.name}" becomes the actual journal name
 */
function replaceTemplateVariables(text: string, context: TemplateContext): string {
  if (!text || typeof text !== 'string') return text
  
  return text.replace(/\{([^}]+)\}/g, (match, path) => {
    const parts = path.split('.')
    let value: any = context
    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part]
      } else {
        return match // Keep original if path not found
      }
    }
    return value !== undefined ? String(value) : match
  })
}

/**
 * Deep clone and replace template variables in canvas items
 */
function processItemsWithContext(items: CanvasItem[], context: TemplateContext): CanvasItem[] {
  if (!context || Object.keys(context).length === 0) {
    return items
  }
  
  const processValue = (value: any): any => {
    if (typeof value === 'string') {
      return replaceTemplateVariables(value, context)
    }
    if (Array.isArray(value)) {
      return value.map(processValue)
    }
    if (value && typeof value === 'object') {
      const result: any = {}
      for (const key of Object.keys(value)) {
        result[key] = processValue(value[key])
      }
      return result
    }
    return value
  }
  
  return items.map(item => processValue(item))
}

interface CanvasRendererProps {
  items: CanvasItem[]
  websiteId?: string
  templateContext?: TemplateContext
}

// Main Canvas Renderer - Uses V1's actual renderers for proper theming
export function CanvasRenderer({ items, websiteId = 'catalyst-demo', templateContext }: CanvasRendererProps) {
  if (!items || items.length === 0) {
    return null
  }
  
  // Process items with template context
  const processedItems = templateContext 
    ? processItemsWithContext(items, templateContext) 
    : items
  
  return (
    <>
      <DynamicBrandingCSS websiteId={websiteId} usePageStore={usePageStore} />
      <CanvasThemeProvider usePageStore={usePageStore} websiteId={websiteId}>
        <div className="canvas-renderer-live">
          {processedItems.map((item, idx) => {
            if (isSection(item)) {
              return (
                <SectionRenderer
                  key={item.id || idx}
                  section={item}
                  onWidgetClick={() => {}} // No-op in live mode
                  dragAttributes={{}}
                  dragListeners={{}}
                  activeSectionToolbar={null}
                  setActiveSectionToolbar={() => {}}
                  activeWidgetToolbar={null}
                  setActiveWidgetToolbar={() => {}}
                  activeDropZone={null}
                  showToast={() => {}}
                  usePageStore={usePageStore}
                  isLiveMode={true} // Key: renders in live/preview mode
                  websiteId={websiteId}
                />
              )
            } else {
              // Standalone widget (rare, usually widgets are in sections)
              return (
                <div key={item.id || idx} className="px-6 py-4 max-w-6xl mx-auto">
                  <WidgetRenderer 
                    widget={item as Widget} 
                    isLiveMode={true}
                  />
                </div>
              )
            }
          })}
        </div>
      </CanvasThemeProvider>
    </>
  )
}

export default CanvasRenderer
