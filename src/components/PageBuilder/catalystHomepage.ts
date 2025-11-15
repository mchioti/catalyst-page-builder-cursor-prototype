import { PREFAB_SECTIONS } from './prefabSections'
import type { CanvasItem, WidgetSection, HeadingWidget, TextWidget, ButtonWidget } from '../../types/widgets'

/**
 * Catalyst Demo Site Homepage
 * 
 * This is the MODIFIED homepage for the Catalyst Demo Site.
 * It differs from the base Classic theme template by using
 * prototype-specific content to demonstrate PB4 capabilities.
 */

/**
 * Creates the Catalyst-specific homepage with modified content
 * This represents a website that has diverged from the base template
 */
export const createCatalystHomepage = (): CanvasItem[] => {
  // Get the base template sections
  const globalHeader = PREFAB_SECTIONS.globalHeader()
  const mainNav = PREFAB_SECTIONS.mainNavigation()
  const hero = PREFAB_SECTIONS.hero()
  const features = PREFAB_SECTIONS.featuredResearch()
  
  // MODIFICATION 1: Main Navigation - Change title (left side, first widget)
  const modifiedMainNav = {
    ...mainNav,
    areas: (mainNav as WidgetSection).areas.map((area: any, areaIndex: number) => {
      if (areaIndex === 0 && area.widgets && area.widgets.length > 0) {
        // First area, first widget should be the heading "Your Website Name"
        return {
          ...area,
          widgets: area.widgets.map((widget: any, widgetIndex: number) => {
            if (widgetIndex === 0 && widget.type === 'heading') {
              return {
                ...widget,
                text: 'Catalyst demo site' // Changed from "Your Website Name"
              } as HeadingWidget
            }
            return widget
          })
        }
      }
      return area
    })
  } as WidgetSection
  
  // MODIFICATION 2: Hero Section - Change heading, description, and button labels
  const modifiedHero = {
    ...hero,
    areas: (hero as WidgetSection).areas.map((area: any) => {
      // The hero has one area with multiple widgets
      if (area.widgets && area.widgets.length > 0) {
        return {
          ...area,
          widgets: area.widgets.map((widget: any, index: number) => {
            // First widget is the heading
            if (index === 0 && widget.type === 'heading') {
              return {
                ...widget,
                text: 'Hero Section - Heading' // Changed from "Welcome to Your Website"
              } as HeadingWidget
            }
            // Second widget is the description text
            if (index === 1 && widget.type === 'text') {
              return {
                ...widget,
                text: 'Catalyst is the name of the PB4 POV ie. this prototype. This is a Hero prefab section that comes as part of the default imaginary Classic-themed Homepage template design.'
              } as TextWidget
            }
            // Third widget is the primary button
            if (index === 2 && widget.type === 'button') {
              return {
                ...widget,
                text: 'Primary Solid Button' // Changed from "Get Started"
              } as ButtonWidget
            }
            // Fourth widget is the secondary button
            if (index === 3 && widget.type === 'button') {
              return {
                ...widget,
                text: 'Secondary Solid Button' // Changed from "Learn More"
              } as ButtonWidget
            }
            return widget
          })
        }
      }
      return area
    })
  } as WidgetSection
  
  // MODIFICATION 3: Features Section - Change heading
  const modifiedFeatures = {
    ...features,
    areas: (features as WidgetSection).areas.map((area: any, areaIndex: number) => {
      // First area should have the heading "Featured Content"
      if (areaIndex === 0 && area.widgets && area.widgets.length > 0) {
        return {
          ...area,
          widgets: area.widgets.map((widget: any, widgetIndex: number) => {
            if (widgetIndex === 0 && widget.type === 'heading') {
              return {
                ...widget,
                text: 'Featured Section' // Changed from "Featured Content"
              } as HeadingWidget
            }
            return widget
          })
        }
      }
      return area
    })
  } as WidgetSection
  
  return [
    globalHeader,
    modifiedMainNav,
    modifiedHero,
    modifiedFeatures
  ]
}
