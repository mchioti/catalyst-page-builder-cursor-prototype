import React, { useState } from 'react'
import { nanoid } from 'nanoid'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { GripVertical, Copy, Edit, Trash2, BookOpen } from 'lucide-react'
import { 
  type Widget,
  type WidgetSection, 
  type ContentBlockLayout,
  isSection 
} from '../../types/widgets'

// Force module refresh after fixing duplicate schema keys
import WidgetRenderer from '../Widgets/WidgetRenderer'
import { useBrandingStore } from '../../stores/brandingStore'

interface SectionRendererProps {
  section: WidgetSection
  onWidgetClick: (id: string, e: React.MouseEvent) => void
  dragAttributes?: any
  dragListeners?: any
  activeSectionToolbar: string | null
  setActiveSectionToolbar: (value: string | null) => void
  activeWidgetToolbar: string | null
  setActiveWidgetToolbar: (value: string | null) => void
  activeDropZone: string | null
  showToast: (message: string, type: 'success' | 'error') => void
  usePageStore: any // Zustand store hook
  isLiveMode?: boolean // Flag to disable editor overlays for live site
  journalContext?: string // Journal code for branding (advma, embo, etc.)
  websiteId?: string // Website ID for breakpoints
  sidebarHeight?: React.CSSProperties // Height styles for sidebar
  isInSidebarGroup?: boolean // If true, section is part of sidebar group and wrapper behavior is handled by group
}

// Component for draggable widgets within sections
export function DraggableWidgetInSection({ 
  widget, 
  sectionId, 
  areaId,
  activeSectionToolbar,
  setActiveSectionToolbar,
  activeWidgetToolbar,
  setActiveWidgetToolbar,
  onWidgetClick,
  usePageStore,
  isLiveMode = false,
  journalContext,
  sectionContentMode
}: {
  widget: Widget
  sectionId: string
  areaId: string
  activeSectionToolbar?: string | null
  setActiveSectionToolbar?: (value: string | null) => void
  activeWidgetToolbar: string | null
  setActiveWidgetToolbar: (value: string | null) => void
  onWidgetClick: (id: string, e: React.MouseEvent) => void
  usePageStore: any
  isLiveMode?: boolean
  journalContext?: string
  sectionContentMode?: 'light' | 'dark'
}) {
  // Each widget gets its own draggable hook - no hooks rule violation
  const widgetDrag = useDraggable({
    id: `widget-${widget.id}`,
    data: {
      type: 'section-widget',
      widget: widget,
      fromSectionId: sectionId,
      fromAreaId: areaId
    }
  })
  
  return (
    <div 
      ref={widgetDrag.setNodeRef}
      style={widgetDrag.transform ? {
        transform: `translate3d(${widgetDrag.transform.x}px, ${widgetDrag.transform.y}px, 0)`,
      } : undefined}
      className={`${!isLiveMode ? 'cursor-pointer hover:ring-2 hover:ring-blue-300 rounded transition-all' : ''} group relative ${
        widgetDrag.isDragging ? 'opacity-50' : ''
      }`}
      onClick={(e) => {
        // Handle clicks for tabs widget (since it has no overlay)
        if (!isLiveMode && widget.type === 'tabs') {
          const target = e.target as HTMLElement
          // Don't interfere with tab buttons, drop zones, or widgets inside panels
          if (target.closest('.tab-button') || target.closest('.droppable-tab-panel')) {
            return
          }
          // If click is on outer container or tab navigation area
          if (target.closest('.tabs-widget')) {
            e.preventDefault()
            e.stopPropagation()
            console.log('🎯 Tabs widget container clicked for properties')
            if (activeSectionToolbar !== widget.sectionId) {
              setActiveSectionToolbar?.(null)
            }
            setActiveWidgetToolbar(activeWidgetToolbar === widget.id ? null : widget.id)
            onWidgetClick(widget.id, e)
          }
        }
      }}
    >
      {/* Overlay to capture clicks on interactive widgets - only in editor mode */}
      {!isLiveMode && widget.type !== 'tabs' && (
        <div 
          className="absolute inset-0 z-10 bg-transparent hover:bg-blue-50/10 transition-colors"
          style={{ pointerEvents: 'auto' }}
          tabIndex={-1}
          onFocus={(e) => {
            // CRITICAL: Prevent scrollIntoView that causes auto-scroll to top
            e.preventDefault()
            e.stopPropagation()
            e.currentTarget.blur() // Remove focus to prevent scrollIntoView
          }}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            console.log('🎯 Overlay click detected:', { 
              widgetId: widget.id, 
              widgetType: widget.type 
            })
            // Only close section toolbar if it's not for the current widget's section
            if (activeSectionToolbar !== widget.sectionId) {
              setActiveSectionToolbar?.(null)
            }
            setActiveWidgetToolbar(activeWidgetToolbar === widget.id ? null : widget.id)
            onWidgetClick(widget.id, e)
          }}
        />
      )}
      
      
      {/* Widget Action Toolbar - appears on click (outside non-interactive area) - only in editor mode */}
      {!isLiveMode && activeWidgetToolbar === widget.id && (
        <div className="absolute -top-2 -right-2 transition-opacity z-20" style={{ pointerEvents: 'auto' }}>
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg shadow-lg px-2 py-1">
            <div 
              {...widgetDrag.attributes}
              {...widgetDrag.listeners}
              className="p-1 text-gray-500 hover:text-gray-700 cursor-grab active:cursor-grabbing rounded hover:bg-gray-100 transition-colors"
              title="Drag to move widget between sections"
            >
              <GripVertical className="w-3 h-3" />
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                // Duplicate widget logic
                const { replaceCanvasItems, canvasItems } = usePageStore.getState()
                const duplicatedWidget = { ...widget, id: nanoid() }
                
                const updatedCanvasItems = canvasItems.map((canvasItem: any) => {
                  if (isSection(canvasItem)) {
                    return {
                      ...canvasItem,
                      areas: canvasItem.areas.map(area => 
                        area.widgets.some(w => w.id === widget.id)
                          ? { ...area, widgets: [...area.widgets, duplicatedWidget] }
                          : area
                      )
                    }
                  }
                  return canvasItem
                })
                replaceCanvasItems(updatedCanvasItems)
              }}
              className="p-1 text-gray-500 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors"
              title="Duplicate widget"
            >
              <Copy className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onWidgetClick(widget.id, e)
              }}
              className="p-1 text-gray-500 hover:text-purple-600 rounded hover:bg-purple-50 transition-colors"
              title="Properties"
              type="button"
            >
              <Edit className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                const { deleteWidget } = usePageStore.getState()
                deleteWidget(widget.id)
              }}
              className="p-1 text-gray-500 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
              title="Delete widget"
              type="button"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
      
      {/* Modification Indicator - Only show in template editing mode */}
      {(widget as any).isModified && usePageStore.getState().editingContext === 'template' && (
        <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 z-30">
          <span className="text-[10px] font-medium">🔧 Modified</span>
        </div>
      )}
      
      {/* Make widget content non-interactive in edit mode */}
      {/* Exception: tabs widget needs pointer events for drop zones and tab navigation */}
      <div style={{ 
        pointerEvents: widget.type === 'tabs' ? 'auto' : 'none', 
        position: 'relative', 
        zIndex: 1 
      }}>
        <WidgetRenderer 
          widget={widget}
          schemaObjects={usePageStore.getState().schemaObjects || []}
          journalContext={journalContext}
          sectionContentMode={sectionContentMode}
          isLiveMode={isLiveMode}
        />
      </div>
    </div>
  )
}

// Main SectionRenderer component
export function SectionRenderer({ 
  section, 
  onWidgetClick,
  dragAttributes,
  dragListeners,
  activeSectionToolbar,
  setActiveSectionToolbar,
  activeWidgetToolbar,
  setActiveWidgetToolbar,
  activeDropZone,
  showToast,
  usePageStore,
  isLiveMode = false,
  journalContext,
  websiteId = 'wiley-main', // Default website ID
  sidebarHeight,
  isInSidebarGroup = false
}: SectionRendererProps) {
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [sectionName, setSectionName] = useState('')
  const [sectionDescription, setSectionDescription] = useState('')
  
  // Access branding store for breakpoints
  const { getWebsiteBranding } = useBrandingStore()
  
  // Calculate content wrapper config once
  const contentWrapperConfig = React.useMemo(() => {
    // Skip wrapper if section is in a sidebar group (group handles the wrapper)
    if (isInSidebarGroup) return { classes: '', styles: {} }
    
    // Only apply constraints in live mode
    if (!isLiveMode) return { classes: '', styles: {} }
    
    const behavior = section.behavior || 'auto'
    
    if (behavior === 'full-width') {
      // Full width: no constraints, no padding - spans edge-to-edge
      return { 
        classes: 'w-full',
        styles: {}
      }
    }
    
    // Auto behavior: constrain within breakpoint
    // Use website-specific breakpoint from passed websiteId
    const websiteBranding = getWebsiteBranding(websiteId)
    const desktopBreakpoint = websiteBranding?.breakpoints?.desktop || '1280px'
    
    console.log('🎯 SectionRenderer - Applying breakpoint:', {
      sectionId: section.id,
      behavior,
      websiteId,
      desktopBreakpoint,
      websiteBranding: websiteBranding ? 'found' : 'not found'
    })
    
    // Use inline styles for max-width to support any custom breakpoint value
    return {
      classes: 'mx-auto px-4 sm:px-6 lg:px-8',
      styles: {
        maxWidth: desktopBreakpoint,
        width: '100%'
      }
    }
  }, [isLiveMode, isInSidebarGroup, section.behavior, getWebsiteBranding, websiteId])
  
  const getLayoutClasses = (layout: ContentBlockLayout) => {
    switch (layout) {
      case 'one-column':
        return 'grid-cols-1'
      case 'two-columns':
        return 'grid-cols-2'
      case 'three-columns':
        return 'grid-cols-3'
      case 'one-third-left':
        return 'grid-cols-3 [&>:first-child]:col-span-1 [&>:last-child]:col-span-2'
      case 'one-third-right':
        return 'grid-cols-3 [&>:first-child]:col-span-2 [&>:last-child]:col-span-1'
      case 'vertical':
        return 'grid-cols-1'
      case 'hero-with-buttons':
        return 'grid-cols-1 gap-4'
      case 'header-plus-grid':
        return 'grid-cols-3 gap-4 [&>:first-child]:col-span-3'
      default:
        return 'grid-cols-1'
    }
  }

  // Convert section styling properties to CSS classes
  const getSectionStylingClasses = (section: WidgetSection) => {
    // Provide sensible defaults if no styling is specified
    const styling = section.styling || {
      paddingTop: 'medium',
      paddingBottom: 'medium',
      paddingLeft: 'medium',
      paddingRight: 'medium',
      gap: 'medium'
    }
    
    const padding = getSectionPaddingClasses(styling)
    const gap = getGapClasses(styling.gap)
    
    return `${padding} ${gap}`.trim()
  }

  const getSectionPaddingClasses = (styling: any) => {
    const paddingMap: { [key: string]: string } = {
      'none': '',
      'small': '4',
      'medium': '6', 
      'large': '8'
    }
    
    const pt = styling.paddingTop && paddingMap[styling.paddingTop] ? `pt-${paddingMap[styling.paddingTop]}` : ''
    const pb = styling.paddingBottom && paddingMap[styling.paddingBottom] ? `pb-${paddingMap[styling.paddingBottom]}` : ''
    const pl = styling.paddingLeft && paddingMap[styling.paddingLeft] ? `pl-${paddingMap[styling.paddingLeft]}` : ''
    const pr = styling.paddingRight && paddingMap[styling.paddingRight] ? `pr-${paddingMap[styling.paddingRight]}` : ''
    
    const result = `${pt} ${pb} ${pl} ${pr}`.trim()
    
    return result
  }

  const getGapClasses = (gap?: string) => {
    switch (gap) {
      case 'none': return 'gap-0'
      case 'small': return 'gap-2'
      case 'medium': return 'gap-4'
      case 'large': return 'gap-6'
      default: return 'gap-4' // default gap
    }
  }

  // Generate background styles based on section background configuration
  const getSectionBackgroundStyles = (section: WidgetSection) => {
    const background = section.background
    if (!background || background.type === 'none') {
      return {}
    }

    const styles: React.CSSProperties = {}
    const opacity = background.opacity !== undefined ? background.opacity : 1

    switch (background.type) {
      case 'color':
        if (background.color) {
          styles.backgroundColor = background.color
          styles.opacity = opacity
        }
        break
        
      case 'image':
        if (background.image?.url) {
          styles.backgroundImage = `url(${background.image.url})`
          styles.backgroundPosition = background.image.position || 'center'
          styles.backgroundRepeat = background.image.repeat || 'no-repeat'
          styles.backgroundSize = background.image.size || 'cover'
          styles.opacity = opacity
        }
        break
        
      case 'gradient':
        if (background.gradient?.stops && background.gradient.stops.length >= 2) {
          const { type, direction, stops } = background.gradient
          const gradientStops = stops.map(stop => `${stop.color} ${stop.position}`).join(', ')
          
          if (type === 'linear') {
            styles.backgroundImage = `linear-gradient(${direction || 'to right'}, ${gradientStops})`
          } else if (type === 'radial') {
            styles.backgroundImage = `radial-gradient(circle, ${gradientStops})`
          }
          styles.opacity = opacity
        }
        break
    }

    return styles
  }

  // Get section container classes with background awareness and text color
  const getSectionContainerClasses = (section: WidgetSection) => {
    const hasBackground = section.background && section.background.type !== 'none'
    
    // Base classes for all modes
    const baseClasses = 'group relative'
    
    // Journal context classes for branding (applies CSS custom properties)
    const journalClasses = journalContext ? `journal-${journalContext}` : ''
    
    // Editor-specific classes
    const editorClasses = !isLiveMode ? 'transition-all cursor-grab active:cursor-grabbing' : ''
    
    // Add section type styling (like hero sections with black background)
    // Only apply default black gradient if section has no custom background
    const hasCustomBackground = section.background && section.background.type !== 'none'
    const sectionTypeClasses = section.type === 'hero' && !hasCustomBackground
      ? 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white' 
      : section.type === 'hero' && hasCustomBackground
      ? 'text-white' // Keep white text for hero sections with custom backgrounds
      : ''
    
    // Add text color for blue gradient backgrounds
    const hasBlueBackground = section.background?.type === 'gradient' && 
      section.background.gradient?.stops?.some(stop => 
        stop.color.includes('#1e40af') || stop.color.includes('#3b82f6')
      )
    
    const textColorClass = hasBlueBackground ? 'text-white' : ''
    
    if (isLiveMode) {
      // Live mode: clean styling, no editor visual elements
      return `${baseClasses} ${journalClasses} ${sectionTypeClasses} ${textColorClass}`.trim()
    }
    
    // Honor section type styling in editor mode too, but adjust editor borders for hero sections
    const isHeroSection = section.type === 'hero'
    
    // Editor mode styling
    if (isSpecialSection) {
      return `${baseClasses} ${journalClasses} ${editorClasses} ${sectionTypeClasses} p-2 ${isHeroSection ? 'hover:bg-gray-800/50 border-2 border-transparent hover:border-gray-400' : 'hover:bg-gray-50 border-2 border-transparent hover:border-blue-200'} ${hasBackground ? 'min-h-20' : ''} ${textColorClass}`.trim()
    } else {
      // If section has custom background or is hero type, use more neutral styling
      if (hasBackground || isHeroSection) {
        return `${baseClasses} ${journalClasses} ${editorClasses} ${sectionTypeClasses} border-2 ${isHeroSection ? 'border-gray-600' : 'border-gray-300'} p-2 rounded ${isHeroSection ? 'hover:border-gray-400' : 'hover:border-blue-400'} min-h-20 ${textColorClass}`.trim()
      } else {
        return `${baseClasses} ${journalClasses} ${editorClasses} border-2 border-purple-200 bg-purple-50 p-2 rounded hover:border-blue-400 hover:bg-purple-100`.trim()
      }
    }
  }

  const isSpecialSection = ['header-section', 'hero-section', 'footer-section', 'features-section'].includes(section.id)

  const handleSaveSection = () => {
    if (sectionName.trim()) {
      const { addCustomSection } = usePageStore.getState()
      
      // Count widgets in the section for better metadata
      const widgetCount = section.areas.reduce((count, area) => count + area.widgets.length, 0)
      
      // Create section with new ID and regenerated widget IDs
      const newSectionId = nanoid()
      const sectionWithNewId = {
        ...section,
        id: newSectionId,
        areas: section.areas.map(area => ({
          ...area,
          id: nanoid(),
          widgets: area.widgets.map(widget => ({
            ...widget,
            id: nanoid(),
            sectionId: newSectionId
          }))
        }))
      }
      
      const customSection = {
        id: nanoid(),
        name: sectionName.trim(),
        description: sectionDescription.trim() || 'Custom saved section',
        widgets: section.areas.flatMap(area => area.widgets), // Legacy field for compatibility
        createdAt: new Date(),
        section: sectionWithNewId, // Legacy field for compatibility
        canvasItems: [sectionWithNewId] // NEW FORMAT - array of canvas items!
      }
      addCustomSection(customSection)
      setShowSaveModal(false)
      setSectionName('')
      setSectionDescription('')
      
      // Show success notification
      showToast(`"${sectionName.trim()}" saved successfully with ${widgetCount} widget${widgetCount !== 1 ? 's' : ''}!`, 'success')
    }
  }

  const handleDuplicateSection = () => {
    const { replaceCanvasItems, canvasItems } = usePageStore.getState()
    const sectionIndex = canvasItems.findIndex((item: any) => item.id === section.id)
    
    if (sectionIndex !== -1) {
      const duplicatedSection = JSON.parse(JSON.stringify(section))
      duplicatedSection.id = nanoid()
      // Update all widget IDs in the duplicated section
      duplicatedSection.areas = duplicatedSection.areas.map((area: any) => ({
        ...area,
        id: nanoid(),
        widgets: area.widgets.map((widget: any) => ({
          ...widget,
          id: nanoid(),
          sectionId: duplicatedSection.id
        }))
      }))
      
      const newCanvasItems = [...canvasItems]
      newCanvasItems.splice(sectionIndex + 1, 0, duplicatedSection)
      replaceCanvasItems(newCanvasItems)
      
      // Show success notification
      const widgetCount = section.areas.reduce((count, area) => count + area.widgets.length, 0)
      showToast(`Section duplicated successfully with ${widgetCount} widget${widgetCount !== 1 ? 's' : ''}!`, 'success')
    }
  }

  // Make section droppable for sidebar repositioning
  const { isOver: isSectionOver, setNodeRef: setSectionDropRef } = useDroppable({
    id: section.id,
    data: {
      type: 'section',
      sectionId: section.id
    }
  })

  return (
    <>
      <div 
        ref={setSectionDropRef}
        data-section-id={section.id}
        className={`${getSectionContainerClasses(section)} ${getSectionStylingClasses(section)} ${
          activeDropZone === section.id && !isLiveMode
            ? 'ring-4 ring-purple-300 ring-opacity-50 border-purple-400 bg-purple-50' 
            : ''
        }`}
        style={{
          ...getSectionBackgroundStyles(section),
          // Fallback inline styles in case Tailwind classes don't exist
          ...(section.styling?.paddingTop === 'large' && { paddingTop: '32px' }),
          ...(section.styling?.paddingBottom === 'large' && { paddingBottom: '32px' }),
          ...(section.styling?.paddingTop === 'medium' && { paddingTop: '24px' }),
          ...(section.styling?.paddingBottom === 'medium' && { paddingBottom: '24px' }),
          ...(section.styling?.paddingTop === 'small' && { paddingTop: '16px' }),
          ...(section.styling?.paddingBottom === 'small' && { paddingBottom: '16px' }),
          ...(section.styling?.paddingLeft && { paddingLeft: section.styling.paddingLeft === 'large' ? '32px' : section.styling.paddingLeft === 'medium' ? '24px' : '16px' }),
          ...(section.styling?.paddingRight && { paddingRight: section.styling.paddingRight === 'large' ? '32px' : section.styling.paddingRight === 'medium' ? '24px' : '16px' })
        }}
        tabIndex={-1}
        onFocus={(e) => {
          // CRITICAL: Prevent scrollIntoView that causes auto-scroll to top
          e.preventDefault()
          e.stopPropagation()
          e.currentTarget.blur() // Remove focus to prevent scrollIntoView
        }}
        onClick={!isLiveMode ? (e) => {
          e.preventDefault()
          e.stopPropagation()
          const newValue = activeSectionToolbar === section.id ? null : section.id
          // Close any widget toolbar and toggle section toolbar
          setActiveWidgetToolbar(null)
          setActiveSectionToolbar(newValue)
          // Select the section for properties panel (use selectWidget directly)
          const { selectWidget } = usePageStore.getState()
          selectWidget(section.id)
        } : undefined}
        {...dragAttributes}
        {...dragListeners}
      >
        {/* Section Action Toolbar - appears on click - only in editor mode */}
        {!isLiveMode && activeSectionToolbar === section.id && (
          <div className="absolute -top-2 -right-2 transition-opacity z-20">
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg shadow-lg px-2 py-1">
              <div 
                {...dragAttributes}
                {...dragListeners}
                className="p-1 text-gray-500 hover:text-gray-700 cursor-grab active:cursor-grabbing rounded hover:bg-gray-100 transition-colors"
                title="Drag to reorder section"
              >
                <GripVertical className="w-3 h-3" />
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleDuplicateSection()
                }}
                className="p-1 text-gray-500 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors"
                title="Duplicate section"
                type="button"
              >
                <Copy className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setShowSaveModal(true)
                }}
                className="p-1 text-gray-500 hover:text-green-600 rounded hover:bg-green-50 transition-colors"
                title="Save as custom section"
                type="button"
              >
                <BookOpen className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  // Could add section properties/settings here in the future
                }}
                className="p-1 text-gray-500 hover:text-purple-600 rounded hover:bg-purple-50 transition-colors"
                title="Section properties"
              >
                <Edit className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  const { replaceCanvasItems, canvasItems } = usePageStore.getState()
                  const newCanvasItems = canvasItems.filter((item: any) => item.id !== section.id)
                  replaceCanvasItems(newCanvasItems)
                }}
                className="p-1 text-gray-500 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                title="Delete section"
                type="button"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
        
        {/* Removed repetitive section info - cleaner UI */}
      
      {/* Content wrapper with behavior-based constraints */}
      <div 
        className={contentWrapperConfig.classes}
        style={contentWrapperConfig.styles}
      >
        <div 
          className={`grid gap-2 ${getLayoutClasses(section.layout)}`}
          style={sidebarHeight || {}}
        >
        {section.areas.map((area) => {
          // Make area droppable for library widgets
          const { isOver, setNodeRef: setDropRef } = useDroppable({
            id: `drop-${area.id}`,
            data: {
              type: 'section-area',
              sectionId: section.id,
              areaId: area.id
            }
          })
          
          // Debug logging for drop zone
          React.useEffect(() => {
            if (isOver) {
              console.log('🎯 Drop zone active:', area.id, 'in section:', section.id)
            }
          }, [isOver, area.id, section.id])
          
          return (
          <div 
            ref={setDropRef}
            key={area.id} 
            className={`relative ${
              isLiveMode
                ? '' // Live mode: no editor styling
                : isSpecialSection 
                  ? '' 
                  : area.widgets.length === 0 
                    ? `min-h-20 border-2 border-dashed rounded p-4 transition-all ${
                        (section.background?.type === 'gradient' || section.background?.type === 'color' || section.background?.type === 'image' || section.type === 'hero') 
                          ? '' // Transparent for sections with background or hero sections
                          : 'bg-white' // White background for normal sections
                      } ${
                        activeDropZone === `drop-${area.id}` 
                          ? 'border-blue-400 bg-blue-50 ring-2 ring-blue-200' 
                          : isOver 
                          ? 'border-blue-400 bg-blue-50' 
                          : 'border-purple-300 opacity-60'
                      }` 
                    : activeDropZone === `drop-${area.id}` 
                      ? 'bg-blue-50 rounded p-2 ring-2 ring-blue-200 border-2 border-blue-300' 
                      : activeDropZone === `drop-${area.id}` 
                        ? 'bg-blue-50 rounded p-2 ring-2 ring-blue-200 border-2 border-blue-300' 
                        : (section.background?.type === 'gradient' || section.background?.type === 'color' || section.background?.type === 'image' || section.type === 'hero') 
                          ? 'rounded p-2' // Transparent background to show section gradient/color/image or hero styling
                          : 'bg-white rounded p-2'
            }`}
          >
            {!isLiveMode && !isSpecialSection && area.widgets.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <span className={`text-xs transition-colors ${
                  activeDropZone === `drop-${area.id}` 
                    ? 'text-green-700 font-bold' 
                    : isOver 
                    ? 'text-blue-600 font-medium' 
                    : 'text-purple-400'
                }`}>
                  {activeDropZone === `drop-${area.id}` 
                    ? 'ACTIVE DROP ZONE' 
                    : isOver 
                    ? 'Drop widget here' 
                    : 'Drop widgets here'}
                </span>
              </div>
            )}
            
            {/* Active Drop Zone Indicator for Populated Areas */}
            {area.widgets.length > 0 && activeDropZone === `drop-${area.id}` && (
              <div className="absolute top-1 right-1 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-bold z-10 shadow-lg">
                ACTIVE DROP ZONE
              </div>
            )}
            
            <div className={`${
              // Special layout for button areas - display buttons side by side
              area.name === 'Button Row' || area.name === 'Button Area' || (area.widgets.length > 1 && area.widgets.every(w => w.type === 'button'))
                ? 'flex flex-wrap gap-3 justify-center'
                : 'space-y-2'
            }`}>
              {area.widgets.map((widget) => (
                <DraggableWidgetInSection
                  key={widget.id}
                  widget={widget}
                  sectionId={section.id}
                  areaId={area.id}
                  activeSectionToolbar={activeSectionToolbar}
                  setActiveSectionToolbar={setActiveSectionToolbar}
                  activeWidgetToolbar={activeWidgetToolbar}
                  setActiveWidgetToolbar={setActiveWidgetToolbar}
                  onWidgetClick={onWidgetClick}
                  usePageStore={usePageStore}
                  isLiveMode={isLiveMode}
                  journalContext={journalContext}
                  sectionContentMode={section.contentMode}
                />
              ))}
            </div>
          </div>
        )})}
        </div>
      </div>
      </div>
      
      {/* Save Section Modal - only in editor mode */}
      {!isLiveMode && showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
            <h3 className="text-lg font-semibold mb-4">Save Custom Section</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section Name *
                </label>
                <input
                  type="text"
                  value={sectionName}
                  onChange={(e) => setSectionName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter section name"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={sectionDescription}
                  onChange={(e) => setSectionDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md h-20 resize-none"
                  placeholder="Enter section description"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowSaveModal(false)
                  setSectionName('')
                  setSectionDescription('')
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSection}
                disabled={!sectionName.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Section
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
