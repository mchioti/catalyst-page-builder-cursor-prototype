import React, { useState } from 'react'
import { nanoid } from 'nanoid'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { GripVertical, Copy, Edit, Trash2, BookOpen, ArrowUp, ArrowDown } from 'lucide-react'
import { 
  type Widget,
  type WidgetSection, 
  type ContentBlockLayout,
  isSection 
} from '../../types/widgets'

// Force module refresh after fixing duplicate schema keys
import WidgetRenderer from '../Widgets/WidgetRenderer'
import { useBrandingStore } from '../../stores/brandingStore'
import { createDebugLogger } from '../../utils/logger'
import { applyListPattern } from '../../utils/listPatternRenderer'
import { PublicationCard } from '../Publications/PublicationCard'
import { getCitationByDOI, citationToSchemaOrg } from '../../utils/citationData'
import { generateAIContent } from '../../utils/aiContentGeneration'

// Control logging for this file
const DEBUG = false
const debugLog = createDebugLogger(DEBUG)

// Helper function to resolve spacing token references (e.g., 'semantic.lg' → '24px')
function resolveSpacingToken(tokenRef: string | undefined, usePageStore: any): string | undefined {
  if (!tokenRef) return undefined
  
  // If it's already a direct value (e.g., '24px', '1.5rem'), return as-is
  if (tokenRef.match(/^\d+(\.\d+)?(px|rem|em|vh|vw|%)$/)) return tokenRef
  
  // Parse token reference (e.g., 'semantic.lg' → ['semantic', 'lg'])
  const parts = tokenRef.split('.')
  if (parts.length !== 2) return tokenRef
  
  const [category, size] = parts
  
  // Get current theme from store
  const { currentWebsiteId, websites, themes } = usePageStore.getState()
  const currentWebsite = websites?.find((w: any) => w.id === currentWebsiteId)
  const currentTheme = currentWebsite 
    ? themes.find((t: any) => t.id === currentWebsite.themeId)
    : null
  
  if (!currentTheme?.spacing) return tokenRef
  
  // Resolve from theme.spacing
  if (category === 'radius' && currentTheme.spacing.radius) {
    return currentTheme.spacing.radius[size]
  }
  if (category === 'semantic' && currentTheme.spacing.semantic) {
    return currentTheme.spacing.semantic[size]
  }
  if (category === 'base' && currentTheme.spacing.base) {
    return currentTheme.spacing.base[size]
  }
  
  return tokenRef
}

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
  // Use draggable to allow movement between areas and sections
  const widgetDrag = useDraggable({
    id: `widget-${widget.id}`,
    data: {
      type: 'section-widget',
      widget: widget,
      fromSectionId: sectionId,
      fromAreaId: areaId
    }
  })
  
  // Also make widget droppable so we can detect drops ON specific widgets
  const widgetDrop = useDroppable({
    id: `widget-drop-${widget.id}`,
    data: {
      type: 'widget-target',
      widgetId: widget.id,
      widgetType: widget.type,
      sectionId: sectionId,
      areaId: areaId
    }
  })
  
  // Get selected widget from store to show persistent selection
  const selectedWidget = usePageStore?.getState?.()?.selectedWidget || null
  const isSelected = selectedWidget === widget.id
  
  // Combine refs for both draggable and droppable
  const setNodeRef = (node: HTMLElement | null) => {
    widgetDrag.setNodeRef(node)
    widgetDrop.setNodeRef(node)
    
    // Listen for custom collapse widget selection event
    if (node && widget.type === 'collapse') {
      const handleCollapseSelect = (e: Event) => {
        const customEvent = e as CustomEvent
        if (customEvent.detail?.widgetId === widget.id) {
          e.preventDefault()
          e.stopPropagation()
          debugLog('log', '🎯 Collapse widget edit button clicked')
          if (activeSectionToolbar !== widget.sectionId) {
            setActiveSectionToolbar?.(null)
          }
          setActiveWidgetToolbar(activeWidgetToolbar === widget.id ? null : widget.id)
          onWidgetClick(widget.id, e as any)
        }
      }
      
      node.addEventListener('selectCollapseWidget', handleCollapseSelect)
      return () => {
        node.removeEventListener('selectCollapseWidget', handleCollapseSelect)
      }
    }
  }
  
  return (
    <div 
      ref={setNodeRef}
      data-testid={`canvas-widget-${widget.id}`}
      data-widget-type={widget.type}
      style={{
        // When dragging, hide the original widget (DragOverlay shows the dragging version)
        visibility: widgetDrag.isDragging ? 'hidden' : 'visible',
        // Apply grid span if widget has gridSpan configuration
        ...(widget.gridSpan?.column && { gridColumn: widget.gridSpan.column }),
        ...(widget.gridSpan?.row && { gridRow: widget.gridSpan.row }),
        // Apply flex properties if widget has flexProperties configuration
        ...(widget.flexProperties?.grow && { 
          flexGrow: 1,
          flexBasis: 0
        })
      }}
      className={`${!isLiveMode && !widgetDrag.isDragging ? 'cursor-pointer hover:ring-2 hover:ring-blue-300 rounded transition-all' : ''} ${
        !isLiveMode && isSelected && !widgetDrag.isDragging ? 'ring-2 ring-blue-500' : ''
      } ${
        !isLiveMode && widgetDrop.isOver ? 'ring-2 ring-green-500' : ''
      } ${
        // For images with flex-grow, constrain child image width
        widget.flexProperties?.grow && widget.type === 'image' ? '[&_img]:!w-auto [&_img]:!max-w-full' : ''
      } group relative z-10`}
    >
      {/* Drop indicator - shows where the new widget will be inserted */}
      {!isLiveMode && widgetDrop.isOver && (
        <div className="absolute -top-2 left-0 right-0 h-1 bg-green-500 rounded-full shadow-lg z-50">
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap font-medium">
            ↑ Insert before this {widget.type}
          </div>
        </div>
      )}
      
      <div
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
              debugLog('log', '🎯 Tabs widget container clicked for properties')
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
      {!isLiveMode && widget.type !== 'tabs' && widget.type !== 'collapse' && (
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
            debugLog('log', '🎯 Overlay click detected:', { 
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
              title="Drag to reorder or move widget"
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
      
      {/* Make widget content non-interactive ONLY in edit mode */}
      {/* Exception: tabs widget needs pointer events for drop zones and tab navigation */}
      {/* In live mode (preview/published), allow ALL interactions (hover, click, etc.) */}
      <div style={{ 
        pointerEvents: isLiveMode ? 'auto' : (widget.type === 'tabs' ? 'auto' : 'none'),
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
  websiteId = 'catalyst-demo', // Default website ID
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
    // NEW: Check theme grid tokens first (for Wiley DS V2), then fall back to website branding
    const { currentWebsiteId, websites, themes } = usePageStore.getState()
    const currentWebsite = websites?.find((w: any) => w.id === currentWebsiteId)
    const currentTheme = currentWebsite 
      ? themes.find((t: any) => t.id === currentWebsite.themeId)
      : null
    
    const websiteBranding = getWebsiteBranding(websiteId)
    
    // Priority: Theme grid container > Website branding > Default
    const desktopBreakpoint = currentTheme?.spacing?.grid?.container?.xl 
      || websiteBranding?.breakpoints?.desktop 
      || '1280px'
    
    debugLog('log', '🎯 SectionRenderer - Applying breakpoint:', {
      sectionId: section.id,
      behavior,
      websiteId,
      desktopBreakpoint,
      fromThemeGrid: !!currentTheme?.spacing?.grid?.container?.xl,
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
      case 'grid':
        // Grid layout uses inline styles from gridConfig, just return base grid class
        return ''
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
  
  // NEW: Resolve grid gutter from theme (for Wiley DS V2)
  const getGridGutter = () => {
    const { currentWebsiteId, websites, themes } = usePageStore.getState()
    const currentWebsite = websites?.find((w: any) => w.id === currentWebsiteId)
    const currentTheme = currentWebsite 
      ? themes.find((t: any) => t.id === currentWebsite.themeId)
      : null
    
    // If theme has grid tokens, use desktop gutter
    if (currentTheme?.spacing?.grid?.gutter?.desktop) {
      return currentTheme.spacing.grid.gutter.desktop
    }
    
    return null // Fall back to Tailwind classes
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

  // Get overlay positioning styles - ONLY applies in live mode, not editor
  const getOverlayStyles = (section: WidgetSection): React.CSSProperties => {
    // Don't apply overlay positioning in editor - it breaks editing
    if (!isLiveMode || !section.overlay?.enabled) return {}
    
    const { position, behavior } = section.overlay
    const styles: React.CSSProperties = {}
    
    // Z-index for overlay layering
    styles.zIndex = 1000
    
    // Position based on behavior type
    if (behavior === 'fixed' || behavior === 'sticky') {
      styles.position = behavior
      styles.left = 0
      styles.right = 0
      
      if (position === 'top') {
        styles.top = 0
      } else if (position === 'bottom') {
        styles.bottom = 0
      }
    } else if (behavior === 'modal') {
      styles.position = 'fixed'
      styles.left = '50%'
      styles.top = '50%'
      styles.transform = 'translate(-50%, -50%)'
      styles.maxWidth = '90vw'
      styles.maxHeight = '90vh'
    }
    
    return styles
  }
  
  // Get overlay-specific classes - ONLY applies in live mode
  const getOverlayClasses = (section: WidgetSection): string => {
    // Don't apply overlay classes in editor
    if (!isLiveMode || !section.overlay?.enabled) return ''
    
    const { behavior, animation } = section.overlay
    const classes: string[] = []
    
    // Shadow for depth
    if (behavior === 'fixed' || behavior === 'sticky') {
      classes.push('shadow-lg')
    } else if (behavior === 'modal') {
      classes.push('shadow-2xl', 'rounded-lg')
    }
    
    // Animation classes
    if (animation === 'slide') {
      classes.push('animate-slide-in')
    } else if (animation === 'fade') {
      classes.push('animate-fade-in')
    }
    
    return classes.join(' ')
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
      const { addCustomSection, currentWebsiteId, websites } = usePageStore.getState()
      const currentWebsite = websites.find((w: any) => w.id === currentWebsiteId)
      
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
        source: 'user' as const,
        websiteId: currentWebsiteId,
        websiteName: currentWebsite?.name || 'Unknown',
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
  const { setNodeRef: setSectionDropRef } = useDroppable({
    id: section.id,
    data: {
      type: 'section',
      sectionId: section.id
    }
  })

  // Render backdrop for modal overlays - ONLY in live mode
  const renderBackdrop = () => {
    // Don't render backdrop in editor mode
    if (!isLiveMode || !section.overlay?.enabled || section.overlay.behavior !== 'modal' || !section.overlay.backdrop) {
      return null
    }
    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-[999]"
        onClick={() => {
          // Could trigger dismiss here if dismissible
        }}
      />
    )
  }

  return (
    <>
      {/* Modal backdrop */}
      {renderBackdrop()}
      
      <div 
        ref={setSectionDropRef}
        data-section-id={section.id}
        data-overlay={section.overlay?.enabled ? 'true' : undefined}
        data-overlay-position={section.overlay?.position}
        data-overlay-behavior={section.overlay?.behavior}
        className={`${getSectionContainerClasses(section)} ${getSectionStylingClasses(section)} ${getOverlayClasses(section)} ${
          activeDropZone === section.id && !isLiveMode
            ? 'ring-4 ring-purple-300 ring-opacity-50 border-purple-400 bg-purple-50' 
            : ''
        }`}
        style={{
          ...getSectionBackgroundStyles(section),
          ...getOverlayStyles(section),
          // NEW: Top-level padding with spacing token support (e.g., 'semantic.lg', 'base.6', '24px')
          ...(section.padding && { 
            padding: resolveSpacingToken(section.padding, usePageStore) || section.padding
          }),
          // NEW: Top-level minHeight with spacing token support
          ...(section.minHeight && { 
            minHeight: resolveSpacingToken(section.minHeight, usePageStore) || section.minHeight
          }),
          // LEGACY: Support both semantic values ('small', 'medium', 'large') and pixel values ('80px', '96px')
          ...(section.styling?.paddingTop && { 
            paddingTop: section.styling.paddingTop === 'large' ? '32px' 
              : section.styling.paddingTop === 'medium' ? '24px'
              : section.styling.paddingTop === 'small' ? '16px'
              : section.styling.paddingTop // Use as-is if it's a pixel value like '80px'
          }),
          ...(section.styling?.paddingBottom && { 
            paddingBottom: section.styling.paddingBottom === 'large' ? '32px'
              : section.styling.paddingBottom === 'medium' ? '24px'
              : section.styling.paddingBottom === 'small' ? '16px'
              : section.styling.paddingBottom
          }),
          ...(section.styling?.paddingLeft && { 
            paddingLeft: section.styling.paddingLeft === 'large' ? '32px'
              : section.styling.paddingLeft === 'medium' ? '24px'
              : section.styling.paddingLeft === 'small' ? '16px'
              : section.styling.paddingLeft
          }),
          ...(section.styling?.paddingRight && { 
            paddingRight: section.styling.paddingRight === 'large' ? '32px'
              : section.styling.paddingRight === 'medium' ? '24px'
              : section.styling.paddingRight === 'small' ? '16px'
              : section.styling.paddingRight
          }),
          // LEGACY: Figma Hero Banner: min-height support
          ...(section.styling?.minHeight && { minHeight: section.styling.minHeight })
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
                  const { replaceCanvasItems, canvasItems } = usePageStore.getState()
                  const currentIndex = canvasItems.findIndex((item: any) => item.id === section.id)
                  if (currentIndex > 0) {
                    const newCanvasItems = [...canvasItems]
                    const temp = newCanvasItems[currentIndex]
                    newCanvasItems[currentIndex] = newCanvasItems[currentIndex - 1]
                    newCanvasItems[currentIndex - 1] = temp
                    replaceCanvasItems(newCanvasItems)
                  }
                }}
                className="p-1 text-gray-500 hover:text-indigo-600 rounded hover:bg-indigo-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Move section up"
                type="button"
                disabled={(() => {
                  const { canvasItems } = usePageStore.getState()
                  const currentIndex = canvasItems.findIndex((item: any) => item.id === section.id)
                  return currentIndex === 0
                })()}
              >
                <ArrowUp className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  const { replaceCanvasItems, canvasItems } = usePageStore.getState()
                  const currentIndex = canvasItems.findIndex((item: any) => item.id === section.id)
                  if (currentIndex < canvasItems.length - 1) {
                    const newCanvasItems = [...canvasItems]
                    const temp = newCanvasItems[currentIndex]
                    newCanvasItems[currentIndex] = newCanvasItems[currentIndex + 1]
                    newCanvasItems[currentIndex + 1] = temp
                    replaceCanvasItems(newCanvasItems)
                  }
                }}
                className="p-1 text-gray-500 hover:text-indigo-600 rounded hover:bg-indigo-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Move section down"
                type="button"
                disabled={(() => {
                  const { canvasItems } = usePageStore.getState()
                  const currentIndex = canvasItems.findIndex((item: any) => item.id === section.id)
                  return currentIndex === canvasItems.length - 1
                })()}
              >
                <ArrowDown className="w-3 h-3" />
              </button>
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
        {/* For grid layouts, render simplified structure with widgets as direct children */}
        {section.layout === 'grid' ? (
          <>
            {section.areas.map((area, areaIndex) => {
              // Make the grid container itself droppable
              const { isOver, setNodeRef: setDropRef } = useDroppable({
                id: `drop-${area.id}`,
                data: {
                  type: 'section-area',
                  sectionId: section.id,
                  areaId: area.id
                }
              })
              
              return (
                <div
                  key={area.id}
                  ref={setDropRef}
                  className="relative col-span-full"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 
                      typeof section.gridConfig?.columns === 'number'
                        ? `repeat(${section.gridConfig.columns}, 1fr)`
                        : section.gridConfig?.columns === 'auto-fit'
                        ? `repeat(auto-fit, minmax(${section.gridConfig.minColumnWidth || '200px'}, 1fr))`
                        : section.gridConfig?.columns === 'auto-fill'
                        ? `repeat(auto-fill, minmax(${section.gridConfig.minColumnWidth || '200px'}, 1fr))`
                        : `repeat(3, 1fr)`,
                    gap: section.gridConfig?.gap || '1rem',
                    ...(section.gridConfig?.rowGap && { rowGap: section.gridConfig.rowGap }),
                    ...(section.gridConfig?.columnGap && { columnGap: section.gridConfig.columnGap }),
                    ...(section.gridConfig?.autoFlow && { gridAutoFlow: section.gridConfig.autoFlow }),
                    ...(section.gridConfig?.alignItems && { alignItems: section.gridConfig.alignItems }),
                    ...(section.gridConfig?.justifyItems && { justifyItems: section.gridConfig.justifyItems }),
                    ...sidebarHeight
                  }}
                >
                  {/* Grid Column Guides */}
                  {!isLiveMode && section.gridConfig && typeof section.gridConfig.columns === 'number' && section.gridConfig.columns > 1 && (
                    <div className="absolute inset-0 pointer-events-none z-0" style={{ display: 'grid', gridTemplateColumns: `repeat(${section.gridConfig.columns}, 1fr)`, gap: section.gridConfig.gap || '1rem' }}>
                      {Array.from({ length: section.gridConfig.columns }).map((_, colIndex) => (
                        <div key={colIndex} className="border-2 border-dashed border-purple-300 opacity-40 rounded-sm min-h-20" />
                      ))}
                    </div>
                  )}
                  
                  {/* Empty state */}
                  {area.widgets.length === 0 && !isLiveMode && (
                    <div 
                      className="min-h-32 flex items-center justify-center border-2 border-dashed rounded transition-all z-10"
                      style={{ 
                        gridColumn: '1 / -1',
                        backgroundColor: isOver ? 'rgb(239 246 255)' : 'transparent',
                        borderColor: isOver ? 'rgb(96 165 250)' : 'rgb(196 181 253)'
                      }}
                    >
                      <span className={`text-sm transition-colors ${isOver ? 'text-blue-600 font-medium' : 'text-purple-400'}`}>
                        {isOver ? 'Drop widget here' : `Drop widgets here (${section.gridConfig?.columns || 3}-column grid)`}
                      </span>
                    </div>
                  )}
                  
                  {/* Widgets as direct grid items */}
                  {/* Pattern-mode widgets are expanded into multiple grid items */}
                  {area.widgets.flatMap((widget) => {
                    // Check if this widget is in pattern mode
                    const isPatternMode = widget.type === 'publication-list' && 
                      (widget as any).spanningConfig?.enabled
                    
                    if (!isPatternMode) {
                      // Normal widget rendering
                      return (
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
                      )
                    }
                    
                    // Pattern mode: Expand publications into separate grid items
                    const pubWidget = widget as any
                    let publications: any[] = []
                    
                    // Get publications based on content source (matching WidgetRenderer logic)
                    if (pubWidget.contentSource === 'schema-objects' && pubWidget.schemaSource) {
                      const { selectionType, selectedIds, selectedType } = pubWidget.schemaSource
                      const schemaObjects = usePageStore.getState().schemaObjects || []
                      
                      try {
                        if (selectionType === 'by-type' && selectedType) {
                          const filteredObjects = schemaObjects.filter((obj: any) => obj.type === selectedType)
                          publications = filteredObjects
                            .map((obj: any) => {
                              try {
                                return JSON.parse(obj.jsonLD)
                              } catch (e) {
                                return null
                              }
                            })
                            .filter((pub: any) => pub !== null)
                        } else if (selectionType === 'by-id' && selectedIds && selectedIds.length > 0) {
                          publications = selectedIds
                            .map((id: string) => schemaObjects.find((obj: any) => obj.id === id))
                            .filter((obj: any) => obj !== undefined)
                            .map((obj: any) => {
                              try {
                                return JSON.parse(obj.jsonLD)
                              } catch (e) {
                                return null
                              }
                            })
                            .filter((pub: any) => pub !== null)
                        }
                      } catch (error) {
                        console.error('Error loading schema objects in pattern mode:', error)
                        publications = []
                      }
                    } else if (pubWidget.contentSource === 'doi-list' && pubWidget.doiSource?.dois && pubWidget.doiSource.dois.length > 0) {
                      try {
                        publications = pubWidget.doiSource.dois
                          .map((doi: string) => {
                            const citation = getCitationByDOI(doi)
                            if (citation) {
                              return citationToSchemaOrg(citation)
                            }
                            return null
                          })
                          .filter((pub: any) => pub !== null)
                      } catch (error) {
                        console.error('Error loading DOI publications in pattern mode:', error)
                        publications = []
                      }
                    } else if (pubWidget.contentSource === 'ai-generated' && pubWidget.aiSource?.prompt) {
                      try {
                        if (pubWidget.aiSource.generatedContent && pubWidget.aiSource.lastGenerated) {
                          const lastGenTime = pubWidget.aiSource.lastGenerated instanceof Date 
                            ? pubWidget.aiSource.lastGenerated.getTime()
                            : new Date(pubWidget.aiSource.lastGenerated).getTime()
                          const hoursSinceGeneration = (Date.now() - lastGenTime) / (1000 * 60 * 60)
                          if (hoursSinceGeneration < 1) {
                            publications = pubWidget.aiSource.generatedContent
                          } else {
                            publications = generateAIContent(pubWidget.aiSource.prompt)
                          }
                        } else {
                          publications = generateAIContent(pubWidget.aiSource.prompt)
                        }
                      } catch (error) {
                        console.error('Error generating AI content in pattern mode:', error)
                        publications = pubWidget.publications || []
                      }
                    } else {
                      // Default: use publications array from widget
                      publications = pubWidget.publications || []
                    }
                    
                    // Apply max items
                    if (pubWidget.maxItems) {
                      publications = publications.slice(0, pubWidget.maxItems)
                    }
                    
                    // Apply pattern
                    const publicationsWithPattern = applyListPattern(
                      publications,
                      pubWidget.spanningConfig,
                      'grid'
                    )
                    
                    // Render pattern control + publications
                    return [
                      // Pattern widget control (spans full width, allows widget selection)
                      !isLiveMode && (
                        <div
                          key={`${widget.id}-control`}
                          className={`col-span-full border-2 border-dashed rounded-lg p-2.5 mb-2 cursor-pointer transition-all ${
                            activeWidgetToolbar === widget.id 
                              ? 'border-purple-500 bg-purple-50/80' 
                              : 'border-purple-300 bg-purple-50/50 hover:border-purple-400 hover:bg-purple-100/70'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation()
                            if (activeSectionToolbar !== widget.sectionId) {
                              setActiveSectionToolbar?.(null)
                            }
                            setActiveWidgetToolbar(activeWidgetToolbar === widget.id ? null : widget.id)
                            onWidgetClick(widget.id, e)
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-purple-700">
                                📊 Publication List (Pattern Mode)
                              </span>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-200 text-purple-800 font-medium">
                                {publicationsWithPattern.length} items
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
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
                                        areas: canvasItem.areas.map(a => 
                                          a.widgets.some(w => w.id === widget.id)
                                            ? { ...a, widgets: [...a.widgets, duplicatedWidget] }
                                            : a
                                        )
                                      }
                                    }
                                    return canvasItem
                                  })
                                  replaceCanvasItems(updatedCanvasItems)
                                }}
                                className="p-1.5 text-purple-600 hover:text-purple-800 rounded hover:bg-purple-200 transition-colors"
                                title="Duplicate widget"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onWidgetClick(widget.id, e)
                                }}
                                className="p-1.5 text-purple-600 hover:text-purple-800 rounded hover:bg-purple-200 transition-colors"
                                title="Edit Properties"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  const { deleteWidget } = usePageStore.getState()
                                  deleteWidget(widget.id)
                                }}
                                className="p-1.5 text-purple-600 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                                title="Delete widget"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ),
                      // Render each publication as a separate grid item
                      ...publicationsWithPattern.map((article: any, index: number) => (
                        <div
                          key={`${widget.id}-pub-${index}`}
                          style={{
                            gridColumn: article.gridSpan?.column,
                            gridRow: article.gridSpan?.row,
                            // Add min-width for better sizing in grid (grid columns control max size)
                            minWidth: '280px'
                          }}
                        >
                          <PublicationCard
                            article={article}
                            config={pubWidget.cardConfig}
                            align={pubWidget.align}
                            contentMode={section.contentMode}
                          />
                        </div>
                      ))
                    ]
                  })}
                </div>
              )
            })}
          </>
        ) : section.layout === 'flexible' ? (
          /* For flexible layouts, render simplified structure with widgets as direct children (like Grid) */
          <>
            {section.areas.map((area, areaIndex) => {
              // Make the flex container itself droppable
              const { isOver, setNodeRef: setDropRef } = useDroppable({
                id: `drop-${area.id}`,
                data: {
                  type: 'section-area',
                  sectionId: section.id,
                  areaId: area.id
                }
              })
              
              return (
                <div
                  key={area.id}
                  ref={setDropRef}
                  className="relative flex"
                  style={{
                    flexDirection: section.flexConfig?.direction || 'row',
                    flexWrap: section.flexConfig?.wrap ? 'wrap' : 'nowrap',
                    justifyContent: section.flexConfig?.justifyContent || 'flex-start',
                    alignItems: 'stretch', // ✨ Equal height cards in each row
                    gap: section.flexConfig?.gap || '1rem',
                    ...sidebarHeight
                  }}
                >
                  {/* Empty state */}
                  {area.widgets.length === 0 && !isLiveMode && (
                    <div 
                      className="min-h-32 flex items-center justify-center border-2 border-dashed rounded transition-all flex-1"
                      style={{ 
                        backgroundColor: isOver ? 'rgb(239 246 255)' : 'transparent',
                        borderColor: isOver ? 'rgb(96 165 250)' : 'rgb(196 181 253)'
                      }}
                    >
                      <span className={`text-sm transition-colors ${isOver ? 'text-blue-600 font-medium' : 'text-purple-400'}`}>
                        {isOver ? 'Drop widget here' : `Drop widgets here (Flex ${section.flexConfig?.direction || 'row'})`}
                      </span>
                    </div>
                  )}
                  
                  {/* Widgets as direct flex items */}
                  {/* Pattern-mode widgets are expanded into multiple flex items */}
                  {area.widgets.flatMap((widget) => {
                    // Check if this widget is in pattern mode
                    const isPatternMode = widget.type === 'publication-list' && 
                      (widget as any).spanningConfig?.enabled
                    
                    if (!isPatternMode) {
                      // Normal widget rendering
                      return (
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
                      )
                    }
                    
                    // Pattern mode: Expand publications into separate flex items
                    const pubWidget = widget as any
                    let publications: any[] = []
                    
                    // Get publications based on content source (matching WidgetRenderer logic)
                    if (pubWidget.contentSource === 'schema-objects' && pubWidget.schemaSource) {
                      const { selectionType, selectedIds, selectedType } = pubWidget.schemaSource
                      const schemaObjects = usePageStore.getState().schemaObjects || []
                      
                      try {
                        if (selectionType === 'by-type' && selectedType) {
                          const filteredObjects = schemaObjects.filter((obj: any) => obj.type === selectedType)
                          publications = filteredObjects
                            .map((obj: any) => {
                              try {
                                return JSON.parse(obj.jsonLD)
                              } catch (e) {
                                return null
                              }
                            })
                            .filter((pub: any) => pub !== null)
                        } else if (selectionType === 'by-id' && selectedIds && selectedIds.length > 0) {
                          publications = selectedIds
                            .map((id: string) => schemaObjects.find((obj: any) => obj.id === id))
                            .filter((obj: any) => obj !== undefined)
                            .map((obj: any) => {
                              try {
                                return JSON.parse(obj.jsonLD)
                              } catch (e) {
                                return null
                              }
                            })
                            .filter((pub: any) => pub !== null)
                        }
                      } catch (error) {
                        console.error('Error loading schema objects in flex pattern mode:', error)
                        publications = []
                      }
                    } else if (pubWidget.contentSource === 'doi-list' && pubWidget.doiSource?.dois && pubWidget.doiSource.dois.length > 0) {
                      try {
                        publications = pubWidget.doiSource.dois
                          .map((doi: string) => {
                            const citation = getCitationByDOI(doi)
                            if (citation) {
                              return citationToSchemaOrg(citation)
                            }
                            return null
                          })
                          .filter((pub: any) => pub !== null)
                      } catch (error) {
                        console.error('Error loading DOI publications in flex pattern mode:', error)
                        publications = []
                      }
                    } else if (pubWidget.contentSource === 'ai-generated' && pubWidget.aiSource?.prompt) {
                      try {
                        if (pubWidget.aiSource.generatedContent && pubWidget.aiSource.lastGenerated) {
                          const lastGenTime = pubWidget.aiSource.lastGenerated instanceof Date 
                            ? pubWidget.aiSource.lastGenerated.getTime()
                            : new Date(pubWidget.aiSource.lastGenerated).getTime()
                          const hoursSinceGeneration = (Date.now() - lastGenTime) / (1000 * 60 * 60)
                          if (hoursSinceGeneration < 1) {
                            publications = pubWidget.aiSource.generatedContent
                          } else {
                            publications = generateAIContent(pubWidget.aiSource.prompt)
                          }
                        } else {
                          publications = generateAIContent(pubWidget.aiSource.prompt)
                        }
                      } catch (error) {
                        console.error('Error generating AI content in flex pattern mode:', error)
                        publications = pubWidget.publications || []
                      }
                    } else {
                      // Default: use publications array from widget
                      publications = pubWidget.publications || []
                    }
                    
                    // Apply max items
                    if (pubWidget.maxItems) {
                      publications = publications.slice(0, pubWidget.maxItems)
                    }
                    
                    // Apply pattern
                    const publicationsWithPattern = applyListPattern(
                      publications,
                      pubWidget.spanningConfig,
                      'flexible'
                    )
                    
                    // Render pattern control + publications
                    return [
                      // Pattern widget control (allows widget selection)
                      !isLiveMode && (
                        <div
                          key={`${widget.id}-control`}
                          className={`w-full border-2 border-dashed rounded-lg p-2.5 mb-2 cursor-pointer transition-all ${
                            activeWidgetToolbar === widget.id 
                              ? 'border-purple-500 bg-purple-50/80' 
                              : 'border-purple-300 bg-purple-50/50 hover:border-purple-400 hover:bg-purple-100/70'
                          }`}
                          style={{ flexBasis: '100%' }}
                          onClick={(e) => {
                            e.stopPropagation()
                            if (activeSectionToolbar !== widget.sectionId) {
                              setActiveSectionToolbar?.(null)
                            }
                            setActiveWidgetToolbar(activeWidgetToolbar === widget.id ? null : widget.id)
                            onWidgetClick(widget.id, e)
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-purple-700">
                                📊 Publication List (Pattern Mode)
                              </span>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-200 text-purple-800 font-medium">
                                {publicationsWithPattern.length} items
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
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
                                        areas: canvasItem.areas.map(a => 
                                          a.widgets.some(w => w.id === widget.id)
                                            ? { ...a, widgets: [...a.widgets, duplicatedWidget] }
                                            : a
                                        )
                                      }
                                    }
                                    return canvasItem
                                  })
                                  replaceCanvasItems(updatedCanvasItems)
                                }}
                                className="p-1.5 text-purple-600 hover:text-purple-800 rounded hover:bg-purple-200 transition-colors"
                                title="Duplicate widget"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onWidgetClick(widget.id, e)
                                }}
                                className="p-1.5 text-purple-600 hover:text-purple-800 rounded hover:bg-purple-200 transition-colors"
                                title="Edit Properties"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  const { deleteWidget } = usePageStore.getState()
                                  deleteWidget(widget.id)
                                }}
                                className="p-1.5 text-purple-600 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                                title="Delete widget"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ),
                      // Render each publication as a separate flex item
                      ...publicationsWithPattern.map((article: any, index: number) => (
                        <div
                          key={`${widget.id}-pub-${index}`}
                          style={{
                            flexGrow: article.flexProperties?.grow ? 1 : 0,
                            flexShrink: 1, // Allow shrinking
                            flexBasis: article.flexProperties?.grow ? '400px' : '300px', // Featured cards start larger
                            minWidth: '280px', // Prevent cards from getting too narrow
                            // Only constrain max-width for non-growing cards (uniform items)
                            // Featured/hero cards (grow=true) can expand beyond 600px
                            ...(article.flexProperties?.grow ? {} : { maxWidth: '400px' })
                          }}
                        >
                          <PublicationCard
                            article={article}
                            config={pubWidget.cardConfig}
                            align={pubWidget.align}
                            contentMode={section.contentMode}
                          />
                        </div>
                      ))
                    ]
                  })}
                </div>
              )
            })}
          </>
        ) : (
          /* For legacy layouts (one-column, two-columns, etc.), use standard structure */
          <div 
            className={`grid ${getLayoutClasses(section.layout)}`}
            style={{
              ...sidebarHeight,
              gap: getGridGutter() || '1rem'
            }}
          >
            {section.areas.map((area, areaIndex) => {
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
                  debugLog('log', '🎯 Drop zone active:', area.id, 'in section:', section.id)
                }
              }, [isOver, area.id, section.id])
              
              // Check if this is a card area in header-plus-grid layout (areas 1, 2, 3)
              const isCardArea = section.layout === 'header-plus-grid' && areaIndex > 0
              
              // Detect theme for card border-radius
              const cardBorderRadius = React.useMemo(() => {
                const root = document.documentElement
                const style = getComputedStyle(root)
                const radius = style.getPropertyValue('--theme-card-radius').trim()
                return radius || '0.5rem' // Default to 8px (rounded-lg)
              }, [])
              
              // Determine border color based on section background (lighter for dark backgrounds)
              const isDarkBackground = section.contentMode === 'dark' || 
                (section.background?.type === 'color' && section.background?.color === '#000000')
              const cardBorderClass = isDarkBackground 
                ? `border border-gray-600 p-8`  // Lighter border for dark backgrounds
                : `border border-gray-300 p-8`  // Standard border for light backgrounds
              
              // Apply border-radius as inline style for cards
              const cardStyle: React.CSSProperties = isCardArea ? {
                borderRadius: cardBorderRadius
              } : {}
              
              return (
                <div 
                  ref={setDropRef}
                  key={area.id}
                  data-testid={`section-area-${area.id}`}
                  data-droppable-area={area.id}
                  style={cardStyle}
                  className={`relative ${
                    isLiveMode
                      ? isCardArea 
                        ? cardBorderClass // Card styling in live mode - context-aware border
                        : '' // No styling for non-card areas in live mode
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
                            ? 'bg-blue-50 rounded p-4 ring-2 ring-blue-200 border-2 border-blue-300' 
                            : activeDropZone === `drop-${area.id}` 
                              ? 'bg-blue-50 rounded p-4 ring-2 ring-blue-200 border-2 border-blue-300' 
                              : isCardArea 
                                ? cardBorderClass // Card styling in editor mode - context-aware border
                                : (section.background?.type === 'gradient' || section.background?.type === 'color' || section.background?.type === 'image' || section.type === 'hero') 
                                ? 'rounded p-4' // Transparent background to show section gradient/color/image or hero styling - MORE padding in edit mode
                                : 'bg-white rounded p-4' // MORE padding in edit mode for easier drops
                  }`}
                >
                  {!isLiveMode && !isSpecialSection && area.widgets.length === 0 && (
                    <div className="flex items-center justify-center h-full relative z-10">
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
                        : isLiveMode 
                          ? 'space-y-2'  // Tight spacing in live mode
                          : 'space-y-4'  // More generous spacing in edit mode for easier drops
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
              )
            })}
          </div>
        )}
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
