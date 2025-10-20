import { PREFAB_SECTIONS } from './prefabSections'
import type { CanvasItem } from '../../types/widgets'

/**
 * Homepage Template Auto-Loading Module
 * 
 * Handles automatic loading of template sections when editing the homepage.
 * This creates a complete homepage template that matches the Mock Live Site.
 */

/**
 * Creates a complete homepage template using prefab sections
 * This matches the structure of the Mock Live Site
 */
export const createHomepageTemplate = (): CanvasItem[] => {
  return [
    // 1. Global Header (University header + main navigation)
    PREFAB_SECTIONS.globalHeader(),
    
    // 2. Main Navigation (separate for modularity)  
    PREFAB_SECTIONS.mainNavigation(),
    
    // 3. Hero Section (blue gradient with call-to-action)
    PREFAB_SECTIONS.hero(),
    
    // 4. Featured Research (gray background with research cards)
    PREFAB_SECTIONS.featuredResearch()
  ]
}

/**
 * Checks if the current canvas is empty or has only default content
 */
export const isCanvasEmpty = (canvasItems: CanvasItem[]): boolean => {
  return canvasItems.length === 0 || 
    (canvasItems.length === 1 && canvasItems[0].type === 'content-block' && 
     'areas' in canvasItems[0] && canvasItems[0].areas.every(area => area.widgets.length === 0))
}

/**
 * Checks if the current canvas has the initial default content
 * (Header, Hero, Features, Footer sections from initialCanvas.ts)
 */
export const hasInitialCanvasContent = (canvasItems: CanvasItem[]): boolean => {
  return canvasItems.length === 4 && 
         canvasItems.some(item => item.id === 'header-section') &&
         canvasItems.some(item => item.id === 'hero-section') &&
         canvasItems.some(item => item.id === 'features-section') &&
         canvasItems.some(item => item.id === 'footer-section')
}

/**
 * Determines if we should auto-load the homepage template
 * Based on editing context and current canvas state
 */
export const shouldAutoLoadHomepage = (
  editingContext: string, 
  mockLiveSiteRoute: string,
  canvasItems: CanvasItem[]
): boolean => {
  return editingContext === 'page' && 
         mockLiveSiteRoute === '/' && 
         (isCanvasEmpty(canvasItems) || hasInitialCanvasContent(canvasItems))
}
