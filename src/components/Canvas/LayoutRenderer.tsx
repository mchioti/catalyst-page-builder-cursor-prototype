import React from 'react'
import type { CanvasItem } from '../../types/widgets'
import { isSection } from '../../types/widgets'
import { SectionRenderer } from '../Sections/SectionRenderer'
import { WidgetRenderer } from '../Widgets/WidgetRenderer'
import { SortableItem } from './SortableItem'

interface LayoutRendererProps {
  canvasItems: CanvasItem[]
  schemaObjects?: any[]
  isLiveMode?: boolean
  journalContext?: string
  websiteId?: string
  onWidgetClick?: (id: string, e: React.MouseEvent) => void
  // Editor-specific props (ignored in live mode)
  dragAttributes?: any
  dragListeners?: any
  activeSectionToolbar?: string | null
  setActiveSectionToolbar?: (id: string | null) => void
  activeWidgetToolbar?: string | null
  setActiveWidgetToolbar?: (id: string | null) => void
  activeDropZone?: string | null
  showToast?: (message: string, type: 'success' | 'error') => void
  usePageStore?: any
  // Editor-specific functions
  handleAddSection?: (itemId: string, position: 'above' | 'below') => void
  handleSectionClick?: (id: string) => void
  selectedWidget?: string | null
  InteractiveWidgetRenderer?: any
}

export const LayoutRenderer: React.FC<LayoutRendererProps> = ({
  canvasItems,
  schemaObjects = [],
  isLiveMode = false,
  journalContext,
  websiteId,
  onWidgetClick = () => {},
  dragAttributes = {},
  dragListeners = {},
  activeSectionToolbar = null,
  setActiveSectionToolbar = () => {},
  activeWidgetToolbar = null,
  setActiveWidgetToolbar = () => {},
  activeDropZone = null,
  showToast = () => {},
  usePageStore,
  // Editor-specific functions
  handleAddSection,
  handleSectionClick = () => {},
  selectedWidget = null,
  InteractiveWidgetRenderer
}) => {
  
  return (
    <div>
      {canvasItems.map((item) => {
        if (isLiveMode) {
          // Live mode: render directly
          if (isSection(item)) {
            return (
              <SectionRenderer
                key={item.id}
                section={item}
                onWidgetClick={onWidgetClick}
                dragAttributes={dragAttributes}
                dragListeners={dragListeners}
                activeSectionToolbar={activeSectionToolbar}
                setActiveSectionToolbar={setActiveSectionToolbar}
                activeWidgetToolbar={activeWidgetToolbar}
                setActiveWidgetToolbar={setActiveWidgetToolbar}
                activeDropZone={activeDropZone}
                showToast={showToast}
                usePageStore={usePageStore}
                isLiveMode={isLiveMode}
                journalContext={journalContext}
                websiteId={websiteId}
              />
            )
          } else {
            // Standalone widget
            return (
              <div key={item.id} className="w-full">
                <WidgetRenderer widget={item} schemaObjects={schemaObjects} journalContext={journalContext} isLiveMode={isLiveMode} />
              </div>
            )
          }
        } else {
          // Editor mode: use SortableItem with Add Section buttons
          return (
            <div key={item.id} className="relative group">
              {/* Add Section Button Above */}
              {item.id !== 'header-section' && handleAddSection && (
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleAddSection(item.id, 'above')
                    }}
                    className="px-3 py-1 bg-white border border-gray-300 text-gray-600 text-sm rounded-md hover:bg-gray-50 transition-colors"
                    type="button"
                  >
                    Add Section
                  </button>
                </div>
              )}
              
              <SortableItem 
                item={item} 
                isSelected={selectedWidget === item.id}
                onSectionClick={handleSectionClick}
                onWidgetClick={onWidgetClick}
                activeSectionToolbar={activeSectionToolbar}
                setActiveSectionToolbar={setActiveSectionToolbar}
                activeWidgetToolbar={activeWidgetToolbar}
                setActiveWidgetToolbar={setActiveWidgetToolbar}
                activeDropZone={activeDropZone}
                showToast={showToast}
                usePageStore={usePageStore}
                InteractiveWidgetRenderer={InteractiveWidgetRenderer}
                journalContext={journalContext}
              />
              
              {/* Add Section Button Below */}
              {handleAddSection && (
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleAddSection(item.id, 'below')
                    }}
                    className="px-3 py-1 bg-white border border-gray-300 text-gray-600 text-sm rounded-md hover:bg-gray-50 transition-colors"
                    type="button"
                  >
                    Add Section
                  </button>
                </div>
              )}
            </div>
          )
        }
      })}
    </div>
  )
}
