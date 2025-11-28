/**
 * CanvasRenderer - Renders canvas items using V1's actual renderers
 * 
 * This component bridges V1's canvas data with the V2 Live Site,
 * reusing the existing WidgetRenderer and SectionRenderer for proper styling.
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

interface CanvasRendererProps {
  items: CanvasItem[]
  websiteId?: string
}

// Main Canvas Renderer - Uses V1's actual renderers for proper theming
export function CanvasRenderer({ items, websiteId = 'catalyst-demo' }: CanvasRendererProps) {
  if (!items || items.length === 0) {
    return null
  }
  
  return (
    <>
      <DynamicBrandingCSS websiteId={websiteId} usePageStore={usePageStore} />
      <CanvasThemeProvider usePageStore={usePageStore}>
        <div className="canvas-renderer-live">
          {items.map((item, idx) => {
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
