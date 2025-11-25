/**
 * V2 Section Renderer
 * Renders a resolved section using V1's widget renderers
 * Resolves template variables in widget content before rendering
 */

import type { ResolvedSection } from '../../utils/compositionResolver'
import WidgetRenderer from '../../../components/Widgets/WidgetRenderer'
import { resolveTemplateVariables } from '../../utils/templateVariables'
import type { Widget } from '../../../types/widgets'

interface SectionRendererProps {
  section: ResolvedSection
}

export function SectionRenderer({ section }: SectionRendererProps) {
  /**
   * Resolve template variables in a widget's content
   */
  const resolveWidgetTemplateVariables = (widget: Widget): Widget => {
    if (!section.templateContext) return widget
    
    const resolved = { ...widget }
    
    // Resolve text fields based on widget type
    if ('text' in resolved && typeof resolved.text === 'string') {
      resolved.text = resolveTemplateVariables(resolved.text, section.templateContext)
    }
    
    if ('label' in resolved && typeof resolved.label === 'string') {
      resolved.label = resolveTemplateVariables(resolved.label, section.templateContext)
    }
    
    if ('alt' in resolved && typeof resolved.alt === 'string') {
      resolved.alt = resolveTemplateVariables(resolved.alt, section.templateContext)
    }
    
    if ('caption' in resolved && typeof resolved.caption === 'string') {
      resolved.caption = resolveTemplateVariables(resolved.caption, section.templateContext)
    }
    
    if ('placeholder' in resolved && typeof resolved.placeholder === 'string') {
      resolved.placeholder = resolveTemplateVariables(resolved.placeholder, section.templateContext)
    }
    
    // For menu widgets, resolve item labels
    if (widget.type === 'menu' && 'items' in resolved && Array.isArray(resolved.items)) {
      resolved.items = resolved.items.map((item: any) => ({
        ...item,
        label: resolveTemplateVariables(item.label, section.templateContext!)
      }))
    }
    
    return resolved
  }
  
  // Resolve template variables in all widgets
  const resolvedWidgets = section.widgets.map(resolveWidgetTemplateVariables)
  
  // Determine container classes based on layout
  const getLayoutClasses = () => {
    const base = 'w-full'
    
    switch (section.layout) {
      case 'one-column':
        return `${base} max-w-4xl mx-auto`
      case 'two-columns':
        return `${base} grid grid-cols-1 md:grid-cols-2 gap-8`
      case 'three-columns':
        return `${base} grid grid-cols-1 md:grid-cols-3 gap-6`
      case 'flexible':
        return `${base} flex ${section.flexConfig?.wrap ? 'flex-wrap' : ''} gap-[${section.flexConfig?.gap || '1rem'}]`
      case 'grid':
        return `${base} grid grid-cols-${section.gridConfig?.columns || 3} gap-[${section.gridConfig?.gap || '1rem'}]`
      default:
        return base
    }
  }
  
  // Get background styles
  const getBackgroundStyle = (): React.CSSProperties => {
    if (!section.background) return {}
    
    switch (section.background.type) {
      case 'color':
        return { backgroundColor: section.background.color }
      case 'gradient':
        return { background: section.background.gradient }
      case 'image':
        return {
          backgroundImage: `url(${section.background.imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }
      default:
        return {}
    }
  }
  
  // Apply flex-specific styles
  const getFlexStyle = (): React.CSSProperties => {
    if (section.layout !== 'flexible' || !section.flexConfig) return {}
    
    return {
      flexDirection: section.flexConfig.direction,
      justifyContent: section.flexConfig.justifyContent,
      gap: section.flexConfig.gap
    }
  }
  
  return (
    <section
      className={`py-12 px-6 ${section.contentMode === 'dark' ? 'text-white' : 'text-gray-900'}`}
      style={getBackgroundStyle()}
    >
      <div
        className={getLayoutClasses()}
        style={section.layout === 'flexible' ? getFlexStyle() : undefined}
      >
        {resolvedWidgets.map((widget, index) => (
          <div key={widget.id || index} className="w-full">
            <WidgetRenderer
              widget={widget}
              isLiveMode={true}
              journalContext="catalyst-demo"
            />
          </div>
        ))}
      </div>
    </section>
  )
}

