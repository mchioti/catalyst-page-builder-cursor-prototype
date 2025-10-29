import React from 'react'
import type { CanvasItem, WidgetSection } from '../../types/widgets'
import { isSection } from '../../types/widgets'
import { SectionRenderer } from '../Sections/SectionRenderer'
import { WidgetRenderer } from '../Widgets/WidgetRenderer'
import { SortableItem } from './SortableItem'
import { useBrandingStore } from '../../stores/brandingStore'

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
  websiteId?: string // Website ID for breakpoints/branding
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
  onWidgetClick = (id: string, e: React.MouseEvent) => {},
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
    // State for measured sidebar height
    const [measuredHeight, setMeasuredHeight] = React.useState<React.CSSProperties>({})
    
    // Measure actual DOM height for sidebar groups
    React.useEffect(() => {
      if (group.type !== 'sidebar-group' || !group.sidebar) return
      
      const measureHeight = () => {
        const span = group.sidebar?.sidebar?.span || 2
        const actualSpannedSections = Math.min(group.items.length, span)
        
        let totalActualHeight = 0
        
        // Measure the actual rendered height of each spanned section
        for (let i = 0; i < actualSpannedSections && i < group.items.length; i++) {
          const item = group.items[i]
          if (isSection(item)) {
            // Find the DOM element for this section
            const sectionElement = document.querySelector(`[data-section-id="${item.id}"]`)
            if (sectionElement) {
              const rect = sectionElement.getBoundingClientRect()
              totalActualHeight += rect.height
              console.log(`📏 Section ${item.id}: actual height = ${rect.height}px`)
            } else {
              // Fallback: use minimal estimate if DOM element not found
              totalActualHeight += 300
              console.log(`⚠️ Section ${item.id}: DOM element not found, using 300px fallback`)
            }
          } else {
            // For individual widgets, use small fallback
            totalActualHeight += 100
          }
        }
        
        // Only set height if we actually measured something
        if (totalActualHeight > 0) {
          console.log('📐 Measuring sidebar height (ACTUAL DOM):', {
            itemsLength: group.items.length,
            span: span,
            actualSpanned: actualSpannedSections,
            totalActualHeight: totalActualHeight,
            appliedStyle: `minHeight: ${totalActualHeight}px`
          })
          
          setMeasuredHeight({ 
            minHeight: `${totalActualHeight}px`, 
            height: '100%'
          })
        } else {
          console.log('📐 No measurable height found - using natural height')
          setMeasuredHeight({}) // Natural height - no forced dimensions
        }
      }
      
      // Measure after a short delay to ensure DOM is fully rendered
      const timer = setTimeout(measureHeight, 100)
      return () => clearTimeout(timer)
    }, [group.items, group.sidebar?.sidebar?.span, group.type]) // Recalculate when items or span changes
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
              websiteId={websiteId}
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
        // Let sidebars have natural height when not in a layout group
        const isSingleSidebar = isSection(item) && item.type === 'sidebar'
        const singleSidebarStyle = {} // No forced height - let sidebar be natural
        
        return (
          <div 
            key={item.id} 
            className="relative group" 
            style={singleSidebarStyle}
          >
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
            
            {/* Add Section Button Below - Show on all sections */}
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
    }
    
    // Render sidebar group with layout
    const { sidebar, sidebarPosition = 'right', items } = group
    const sidebarWidth = sidebar?.sidebar?.width || '25%'
    const isSticky = sidebar?.sidebar?.sticky || false
    const mobileBehavior = sidebar?.sidebar?.mobileBehavior || 'below'
    const sidebarGap = sidebar?.sidebar?.gap || 'medium'
    
    // Get first section's behavior to control entire group layout
    const firstSection = items.find(item => isSection(item)) as WidgetSection | undefined
    const groupBehavior = firstSection?.behavior || 'auto'
    
    // Get wrapper config for entire sidebar group based on first section's behavior
    const { getWebsiteBranding } = useBrandingStore()
    const getGroupWrapperConfig = () => {
      // Only apply constraints in live mode
      if (!isLiveMode) return { classes: '', styles: {} }
      
      if (groupBehavior === 'full-width') {
        // Full width: no constraints, no padding - spans edge-to-edge
        return { 
          classes: 'w-full',
          styles: {}
        }
      }
      
      // Auto behavior: constrain entire sidebar group within breakpoint
      const websiteBranding = getWebsiteBranding(websiteId || 'wiley-main')
      const desktopBreakpoint = websiteBranding?.breakpoints?.desktop || '1280px'
      
      console.log('🎯 LayoutRenderer - Sidebar group behavior from first section:', {
        groupBehavior,
        firstSectionId: firstSection?.id,
        desktopBreakpoint,
        websiteId: websiteId || 'wiley-main'
      })
      
      // Use inline styles for max-width to support any custom breakpoint value
      return {
        classes: 'mx-auto px-4 sm:px-6 lg:px-8',
        styles: {
          maxWidth: desktopBreakpoint,
          width: '100%'
        }
      }
    }
    
    // Convert gap setting to Tailwind classes
    const getGapClass = () => {
      switch (sidebarGap) {
        case 'none': return ''
        case 'small': return 'gap-2 md:gap-2'
        case 'medium': return 'gap-4 md:gap-4'
        case 'large': return 'gap-8 md:gap-8'
        default: return 'gap-4 md:gap-4'
      }
    }
    
    // Simple flexbox approach - let height be controlled by content
    const getContainerClasses = () => {
      let classes = 'flex flex-col'
      
      // Add gap classes
      const gapClass = getGapClass()
      if (gapClass) {
        classes += ` ${gapClass}`
      }
      
      // Desktop: horizontal layout
      classes += ' md:flex-row'
      
      if (mobileBehavior === 'hidden') {
        classes += ' md:flex' // Only show on desktop
      }
      
      return classes
    }
    
    const getSidebarClasses = () => {
      let classes = ''
      
      // Width handling with standard Tailwind classes
      switch (sidebarWidth) {
        case '25%':
          classes += ' w-full md:w-1/4'
          break
        case '33%':
          classes += ' w-full md:w-1/3'
          break
        case '300px':
          classes += ' w-full md:w-[300px]'
          break
        case '350px':
          classes += ' w-full md:w-[350px]'
          break
        default:
          classes += ' w-full md:w-1/4' // fallback
      }
      
      // Mobile behavior
      switch (mobileBehavior) {
        case 'hidden':
          classes += ' md:block hidden'
          break
        case 'below':
          // Grid handles order automatically
          break
        default:
          break
      }
      
      // Sticky positioning (desktop only)
      if (isSticky) {
        classes += ' md:sticky md:top-4'
      }
      
      return classes
    }
    
    const getMainContentClasses = () => {
      let classes = 'flex-1'
      
      return classes
    }
    
    // Use measured height from useEffect
    const getSidebarHeight = () => {
      // If no measured height available yet, let it be natural
      if (Object.keys(measuredHeight).length === 0) {
        console.log('📐 Using natural sidebar height (not measured yet)')
        return {}
      }
      
      console.log('📐 Using measured sidebar height:', measuredHeight)
      return measuredHeight
    }
    
    const groupWrapperConfig = getGroupWrapperConfig()
    
    return (
      <div key={`sidebar-group-${index}`} className="relative">
        {/* Behavior-based wrapper (controlled by first section's behavior) */}
        <div 
          className={groupWrapperConfig.classes}
          style={groupWrapperConfig.styles}
        >
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
                      websiteId={websiteId}
                      isInSidebarGroup={true}
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
                      isInSidebarGroup={true}
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
                websiteId={websiteId}
                sidebarHeight={getSidebarHeight()}
              />
            ) : (
              <SortableItem 
                item={sidebar!} 
                isSelected={selectedWidget === sidebar!.id}
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
                sidebarHeight={getSidebarHeight()}
              />
            )}
          </div>
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
