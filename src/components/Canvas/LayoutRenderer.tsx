import React from 'react'
import type { CanvasItem, WidgetSection } from '../../types/widgets'
import { isSection } from '../../types/widgets'
import { SectionRenderer } from '../Sections/SectionRenderer'
import { WidgetRenderer } from '../Widgets/WidgetRenderer'
import { SortableItem } from './SortableItem'

// Helper function to group canvas items with sidebars for layout rendering
export const calculateLayoutGroups = (items: CanvasItem[]) => {
  const groups: Array<{
    type: 'single' | 'sidebar-group'
    items: CanvasItem[]
    sidebar?: WidgetSection
    sidebarPosition?: 'left' | 'right'
  }> = []

  let i = 0
  while (i < items.length) {
    const item = items[i]
    
    // Check if current item is a sidebar
    if (isSection(item) && item.type === 'sidebar') {
      const sidebar = item as WidgetSection
      const span = sidebar.sidebar?.span || 2
      const position = sidebar.sidebar?.position || 'right'
      
      // Collect the next 'span' number of sections (but not other sidebars)
      const spannedSections: CanvasItem[] = []
      let j = i + 1
      let sectionsFound = 0
      
      while (j < items.length && sectionsFound < span) {
        const nextItem = items[j]
        // Only span regular sections, not other sidebars or headers/footers
        if (isSection(nextItem) && nextItem.type !== 'sidebar' && 
            nextItem.type !== 'header' && nextItem.type !== 'footer') {
          spannedSections.push(nextItem)
          sectionsFound++
        } else if (isSection(nextItem) && nextItem.type === 'sidebar') {
          // Stop if we hit another sidebar
          break
        } else if (!isSection(nextItem)) {
          // Include non-section items (standalone widgets)
          spannedSections.push(nextItem)
        }
        j++
      }
      
      groups.push({
        type: 'sidebar-group',
        items: spannedSections,
        sidebar,
        sidebarPosition: position
      })
      
      // Skip the items we've already processed
      i = j
    } else {
      // Single item (not part of a sidebar group)
      groups.push({
        type: 'single',
        items: [item]
      })
      i++
    }
  }
  
  return groups
}

interface LayoutRendererProps {
  canvasItems: CanvasItem[]
  schemaObjects?: any[]
  isLiveMode?: boolean
  journalContext?: string
  onWidgetClick?: (id: string) => void
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
  
  // Component to render a layout group (either single item or sidebar group)
  const LayoutGroup = ({ group, index }: { 
    group: { type: 'single' | 'sidebar-group', items: CanvasItem[], sidebar?: WidgetSection, sidebarPosition?: 'left' | 'right' }, 
    index: number 
  }) => {
    if (group.type === 'single') {
      // Render single item normally
      const item = group.items[0]
      
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
            />
          )
        } else {
          // Standalone widget
          return (
            <div key={item.id} className="w-full">
              <WidgetRenderer widget={item} schemaObjects={schemaObjects} />
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
                  onClick={() => handleAddSection(item.id, 'above')}
                  className="px-3 py-1 bg-white border border-gray-300 text-gray-600 text-sm rounded-md hover:bg-gray-50 transition-colors"
                >
                  Add Section
                </button>
              </div>
            )}
            
            <SortableItem 
              item={item} 
              isSelected={selectedWidget === item.id}
              onSectionClick={handleSectionClick}
              onWidgetClick={(id, e) => onWidgetClick(id)}
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
            
            {/* Add Section Button Below - Show on last item */}
            {handleAddSection && item.id === canvasItems[canvasItems.length - 1]?.id && (
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button
                  onClick={() => handleAddSection(item.id, 'below')}
                  className="px-3 py-1 bg-white border border-gray-300 text-gray-600 text-sm rounded-md hover:bg-gray-50 transition-colors"
                >
                  Add Section
                </button>
              </div>
            )}
          </div>
        )
      }
    }
    
    // Render sidebar group with layout
    const { sidebar, sidebarPosition = 'right', items } = group
    const sidebarWidth = sidebar?.sidebar?.width || '25%'
    const isSticky = sidebar?.sidebar?.sticky || false
    const mobileBehavior = sidebar?.sidebar?.mobileBehavior || 'below'
    
    // Simplified flexbox approach for better reliability
    const getContainerClasses = () => {
      let classes = 'flex flex-col gap-8'
      
      // Desktop: horizontal layout with full height stretching
      classes += ' md:flex-row md:items-stretch'
      
      if (mobileBehavior === 'hidden') {
        classes += ' md:flex' // Only show on desktop
      }
      
      return classes
    }
    
    const getSidebarClasses = () => {
      let classes = 'flex-shrink-0'
      
      // Width handling with standard Tailwind classes
      switch (sidebarWidth) {
        case '25%':
          classes += ' md:w-1/4'
          break
        case '33%':
          classes += ' md:w-1/3'
          break
        case '300px':
          classes += ' md:w-[300px]'
          break
        case '350px':
          classes += ' md:w-[350px]'
          break
        default:
          classes += ' md:w-1/4' // fallback
      }
      
      // Order handling
      if (sidebarPosition === 'left') {
        classes += ' md:order-1'
      } else {
        classes += ' md:order-2'
      }
      
      // Mobile behavior
      switch (mobileBehavior) {
        case 'hidden':
          classes += ' hidden md:block'
          break
        case 'below':
          classes += ' order-2'
          break
        default:
          classes += ' order-2'
      }
      
      // Sticky positioning (desktop only)
      if (isSticky) {
        classes += ' md:sticky md:top-4'
      }
      
      return classes
    }
    
    const getMainContentClasses = () => {
      let classes = 'flex-1'
      
      // Order handling
      if (sidebarPosition === 'left') {
        classes += ' md:order-2'
      } else {
        classes += ' md:order-1'
      }
      
      // Mobile behavior
      classes += ' order-1'
      
      return classes
    }
    
    return (
      <div key={`sidebar-group-${index}`} className="relative">
        {/* Sidebar Layout Container */}
        <div className={getContainerClasses()}>
          {/* Main Content Area */}
          <div className={getMainContentClasses()}>
            {items.map((item: CanvasItem) => {
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
                    />
                  )
                } else {
                  // Standalone widget
                  return (
                    <div key={item.id} className="w-full">
                      <WidgetRenderer widget={item} schemaObjects={schemaObjects} />
                    </div>
                  )
                }
              } else {
                // Editor mode: use SortableItem
                return (
                  <div key={item.id} className="relative group">
                    <SortableItem 
                      item={item} 
                      isSelected={selectedWidget === item.id}
                      onSectionClick={handleSectionClick}
                      onWidgetClick={(id, e) => onWidgetClick(id)}
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
                  </div>
                )
              }
            })}
          </div>
          
          {/* Sidebar */}
          <div className={getSidebarClasses()}>
            {isLiveMode ? (
              <SectionRenderer
                section={sidebar!}
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
              />
            ) : (
              <SortableItem 
                item={sidebar!} 
                isSelected={selectedWidget === sidebar!.id}
                onSectionClick={handleSectionClick}
                onWidgetClick={(id, e) => onWidgetClick(id)}
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
            )}
          </div>
        </div>
      </div>
    )
  }

  const layoutGroups = calculateLayoutGroups(canvasItems)
  
  return (
    <div className={isLiveMode ? "" : ""}>
      {layoutGroups.map((group, index) => (
        <LayoutGroup key={index} group={group} index={index} />
      ))}
    </div>
  )
}
