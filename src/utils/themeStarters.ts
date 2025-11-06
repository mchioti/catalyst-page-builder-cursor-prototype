/**
 * Theme Starter Templates
 * 
 * Factory functions that return arrays of prefab sections for theme-specific
 * starter homepages. Used during website creation to populate initial content
 * instead of starting with a blank canvas.
 */

import { nanoid } from 'nanoid'
import type { CanvasItem } from '../types/widgets'
import {
  createWileyFigmaLogoGridPrefab,
  createHeroPrefab,
  createFeaturesPrefab,
  createWileyDSV2HeroPrefab,
  createWileyDSV2CardGridPrefab
} from '../components/PageBuilder/prefabSections'

/**
 * Creates IBM Carbon DS starter homepage
 * Uses Wiley template structure with Carbon-specific styling
 * Showcases Carbon's signature features: sharp corners, IBM Blue, 5 button styles
 */
export const createCarbonDSStarterTemplate = (): CanvasItem[] => {
  // 1. HERO SECTION - IBM Blue background, sharp corners
  const heroSection = createWileyDSV2HeroPrefab() as any
  heroSection.background = {
    type: 'color',
    color: '#0f62fe',  // IBM Blue
    opacity: 1
  }
  heroSection.contentMode = 'dark'
  
  // 2. BUTTON SHOWCASE - All 5 Carbon button styles
  const buttonShowcase: any = {
    id: nanoid(),
    name: 'Carbon Button Showcase',
    type: 'content-block',
    layout: 'one-column',
    areas: [
      { id: nanoid(), name: 'Content', widgets: [] }
    ]
  }
  buttonShowcase.styling = {
    paddingTop: '64px',
    paddingBottom: '64px',
    paddingLeft: '80px',
    paddingRight: '80px',
    gap: 'large',
    variant: 'full-width',
    textColor: 'default',
    maxWidth: '2xl'
  }
  buttonShowcase.background = {
    type: 'color',
    color: '#f4f4f4',  // Carbon Layer 01
    opacity: 1
  }
  buttonShowcase.contentMode = 'light'
  
  buttonShowcase.areas[0].widgets = [
    {
      id: nanoid(),
      type: 'heading',
      sectionId: buttonShowcase.id,
      skin: 'minimal',
      text: 'IBM Carbon Button System',
      level: 2,
      align: 'center',
      style: 'default',
      color: 'default',
      size: 'xl',
      icon: { enabled: false, position: 'left', emoji: '' }
    },
    {
      id: nanoid(),
      type: 'text',
      sectionId: buttonShowcase.id,
      skin: 'minimal',
      text: 'Five semantic button styles for enterprise applications',
      align: 'center',
      inlineStyles: 'margin-bottom: 48px; color: #525252;'
    },
    {
      id: nanoid(),
      type: 'button',
      sectionId: buttonShowcase.id,
      skin: 'minimal',
      text: 'PRIMARY',
      style: 'solid',
      color: 'color1',
      size: 'large',
      href: '#',
      target: '_self',
      align: 'center',
      icon: { enabled: false, position: 'left', emoji: '' }
    },
    {
      id: nanoid(),
      type: 'button',
      sectionId: buttonShowcase.id,
      skin: 'minimal',
      text: 'SECONDARY',
      style: 'solid',
      color: 'color2',
      size: 'large',
      href: '#',
      target: '_self',
      align: 'center',
      icon: { enabled: false, position: 'left', emoji: '' }
    },
    {
      id: nanoid(),
      type: 'button',
      sectionId: buttonShowcase.id,
      skin: 'minimal',
      text: 'TERTIARY',
      style: 'solid',
      color: 'color3',
      size: 'large',
      href: '#',
      target: '_self',
      align: 'center',
      icon: { enabled: false, position: 'left', emoji: '' }
    },
    {
      id: nanoid(),
      type: 'button',
      sectionId: buttonShowcase.id,
      skin: 'minimal',
      text: 'DANGER',
      style: 'solid',
      color: 'color4',
      size: 'large',
      href: '#',
      target: '_self',
      align: 'center',
      icon: { enabled: false, position: 'left', emoji: '' }
    },
    {
      id: nanoid(),
      type: 'button',
      sectionId: buttonShowcase.id,
      skin: 'minimal',
      text: 'GHOST',
      style: 'solid',
      color: 'color5',
      size: 'large',
      href: '#',
      target: '_self',
      align: 'center',
      icon: { enabled: false, position: 'left', emoji: '' }
    }
  ]
  
  // 3. CARD GRID - Layer system showcase
  const cardGridSection = createWileyDSV2CardGridPrefab() as any
  cardGridSection.background = {
    type: 'color',
    color: '#ffffff',  // White layer
    opacity: 1
  }
  cardGridSection.contentMode = 'light'
  
  // 4. ABOUT SECTION - Grey layer
  const aboutSection: any = {
    id: nanoid(),
    name: 'About IBM Carbon',
    type: 'content-block',
    layout: 'one-column',
    areas: [
      { id: nanoid(), name: 'Content', widgets: [] }
    ]
  }
  aboutSection.styling = {
    paddingTop: '80px',
    paddingBottom: '80px',
    paddingLeft: '80px',
    paddingRight: '80px',
    gap: 'large',
    variant: 'full-width',
    textColor: 'default',
    maxWidth: '2xl'
  }
  aboutSection.background = {
    type: 'color',
    color: '#f4f4f4',  // Carbon Layer 01
    opacity: 1
  }
  aboutSection.contentMode = 'light'
  
  aboutSection.areas[0].widgets = [
    {
      id: nanoid(),
      type: 'text',
      sectionId: aboutSection.id,
      skin: 'minimal',
      text: 'ENTERPRISE DESIGN',
      align: 'center',
      inlineStyles: 'font-size: 12px; font-weight: 600; letter-spacing: 2px; color: #525252; margin-bottom: 16px;'
    },
    {
      id: nanoid(),
      type: 'heading',
      sectionId: aboutSection.id,
      skin: 'minimal',
      text: 'Built for Scale',
      level: 2,
      align: 'center',
      style: 'default',
      color: 'default',
      size: 'xl',
      icon: { enabled: false, position: 'left', emoji: '' }
    },
    {
      id: nanoid(),
      type: 'text',
      sectionId: aboutSection.id,
      skin: 'minimal',
      text: 'IBM Carbon Design System powers enterprise applications with structured, accessible, and scalable components. Sharp corners, consistent spacing, and semantic color systems ensure clarity at any scale.',
      align: 'center',
      inlineStyles: 'font-size: 18px; line-height: 1.7; color: #161616; max-width: 900px; margin: 0 auto 32px auto;'
    },
    {
      id: nanoid(),
      type: 'button',
      sectionId: aboutSection.id,
      skin: 'minimal',
      text: 'LEARN MORE',
      style: 'solid',
      color: 'color1',
      size: 'large',
      href: '#',
      target: '_self',
      align: 'center',
      icon: { enabled: false, position: 'left', emoji: '' }
    }
  ]
  
  return [
    heroSection,
    buttonShowcase,
    cardGridSection,
    aboutSection
  ]
}

/**
 * Creates DS V2 starter homepage - PREFAB SECTIONS approach
 * Uses Figma-accurate prefab sections with proper styling
 * All sections now use prefabs to ensure consistency with Figma designs
 * 
 * Figma references:
 * - Hero: https://www.figma.com/design/abbxQgAseYSVNmX3b5EcDv?node-id=2016-17
 * - Cards: https://www.figma.com/design/abbxQgAseYSVNmX3b5EcDv?node-id=8195-54472
 */
export const createWileyDSV2StarterTemplate = (): CanvasItem[] => {
  // 1. HERO SECTION - Prefab with 800px height + Heritage 900 background
  const heroSection = createWileyDSV2HeroPrefab()
  
  // 2. CARD GRID - Prefab with title drop zone + Heritage 900 background
  const cardGridSection = createWileyDSV2CardGridPrefab()
  
  // 3. ABOUT WILEY - Basic one-column layout (no prefab needed)
  const aboutSection: any = {
    id: nanoid(),
    name: 'About Wiley + Partners',
    type: 'content-block',
    layout: 'one-column',
    areas: [
      { id: nanoid(), name: 'Content', widgets: [] }
    ]
  }
  aboutSection.styling = {
    paddingTop: '80px',
    paddingBottom: '80px',
    paddingLeft: '80px',
    paddingRight: '80px',
    gap: 'large',
    variant: 'full-width',
    textColor: 'default',
    maxWidth: '2xl'
  }
  aboutSection.background = {
    type: 'color',
    color: '#F8F8F5',
    opacity: 1
  }
  aboutSection.contentMode = 'light'
  
  aboutSection.areas[0].widgets = [
    {
      id: nanoid(),
      type: 'text',
      sectionId: aboutSection.id,
      skin: 'minimal',
      text: 'ABOUT WILEY',
      align: 'center',
      inlineStyles: 'font-size: 12px; font-weight: 600; letter-spacing: 2px; color: #5A5A5A; margin-bottom: 16px;'
    },
    {
      id: nanoid(),
      type: 'heading',
      sectionId: aboutSection.id,
      skin: 'minimal',
      text: 'Transforming knowledge into impact',
      level: 2,
      align: 'center',
      style: 'default',
      color: 'default',
      size: 'xl',
      icon: { enabled: false, position: 'left', emoji: '' }
    },
    {
      id: nanoid(),
      type: 'text',
      sectionId: aboutSection.id,
      skin: 'minimal',
      text: 'We transform knowledge into actionable intelligence – accelerating scientific breakthroughs, supporting learning, and driving innovation that redefines fields and improves lives. Through access to trusted research, data, and AI-powered platforms, we\'re your partner in a world driven by curiosity and continuous discovery.',
      align: 'center',
      inlineStyles: 'font-size: 18px; line-height: 1.7; color: #313131; max-width: 900px; margin: 0 auto 32px auto;'
    },
    {
      id: nanoid(),
      type: 'button',
      sectionId: aboutSection.id,
      skin: 'minimal',
      text: 'LEARN MORE →',
      variant: 'primary',
      size: 'large',
      href: '#',
      target: '_self',
      layout: {
        background: '#1a4d4d',
        textColor: '#ffffff',
        borderRadius: '6px',
        padding: '16px 32px'
      },
      icon: { enabled: false, position: 'left', emoji: '' }
    },
    {
      id: nanoid(),
      type: 'text',
      sectionId: aboutSection.id,
      skin: 'minimal',
      text: '<div style="margin-top: 64px; padding-top: 48px; border-top: 1px solid #D6D6D6;"><div style="display: flex; justify-content: center; align-items: center; gap: 48px; flex-wrap: wrap; opacity: 0.6;"><img src="/theme-assets/wiley-figma-ds-v2/logo-ebay.svg" alt="eBay" style="height: 32px; filter: grayscale(100%);"><img src="/theme-assets/wiley-figma-ds-v2/logo-cnn.svg" alt="CNN" style="height: 32px; filter: grayscale(100%);"><img src="/theme-assets/wiley-figma-ds-v2/logo-google.svg" alt="Google" style="height: 32px; filter: grayscale(100%);"><img src="/theme-assets/wiley-figma-ds-v2/logo-cisco.svg" alt="Cisco" style="height: 32px; filter: grayscale(100%);"><img src="/theme-assets/wiley-figma-ds-v2/logo-airbnb.svg" alt="Airbnb" style="height: 32px; filter: grayscale(100%);"><img src="/theme-assets/wiley-figma-ds-v2/logo-uber.svg" alt="UBER" style="height: 32px; filter: grayscale(100%);"></div></div>',
      align: 'center'
    }
  ]
  
  // 4. SHOP TODAY - Uses prefab because of unique bordered grid styling
  const shopTodaySection = createWileyFigmaLogoGridPrefab()
  
  return [
    heroSection,
    cardGridSection,
    aboutSection,
    shopTodaySection
  ]
}

/**
 * Creates a generic academic starter homepage
 * Suitable for most academic/journal websites
 */
export const createDefaultStarterTemplate = (): CanvasItem[] => {
  return [
    createHeroPrefab(),
    createFeaturesPrefab()
  ]
}

/**
 * Main factory function - Returns starter template based on theme ID
 * 
 * @param themeId - The ID of the selected theme
 * @returns Array of CanvasItems (prefab sections) for the homepage
 * 
 * Usage:
 * ```typescript
 * const starterSections = getStarterTemplateForTheme('wiley-figma-ds-v2')
 * // Returns: [hero, card grid, about wiley, shop today]
 * ```
 */
export const getStarterTemplateForTheme = (themeId: string): CanvasItem[] => {
  switch (themeId) {
    case 'wiley-figma-ds-v2':
      // DS V2: Figma-accurate prefab sections (Hero 800px, Card Grid, About, Shop Today)
      return createWileyDSV2StarterTemplate()
    
    case 'wiley-ds-mcp':
      // MCP: Same sections as DS V2 but with complete token system (88 core + 159 semantic colors)
      return createWileyDSV2StarterTemplate()
    
    case 'ibm-carbon-ds':
      // IBM Carbon: Enterprise design with Carbon-specific styling
      return createCarbonDSStarterTemplate()
    
    case 'academic-classic':
    case 'academic-review':
    case 'digital-open-publishers':
    case 'lumina-press':
      return createDefaultStarterTemplate()
    
    default:
      // Fallback to default for unknown themes
      return createDefaultStarterTemplate()
  }
}

/**
 * Get a preview of available starter templates for documentation/UI
 */
export const AVAILABLE_STARTERS = {
  'wiley-figma-ds-v2': {
    name: 'Wiley Figma DS V2',
    description: 'Figma-accurate sections with energy burst hero and Heritage 900 card backgrounds.',
    sections: ['Hero (prefab - 500px with bg image)', 'Card Grid (prefab - title drop zone)', 'About Wiley (basic one-column)', 'Shop Today (prefab - bordered grid)'],
    philosophy: 'Use prefabs for sections with unique styling (background images, title drop zones, borders). Build with basic layouts for simple content.',
    features: ['Multi-brand colors (Wiley/WT/Dummies)', 'Figma L1 template VAR 2', 'Background image hero', 'Journal theme presets']
  },
  'default': {
    name: 'Default Academic',
    description: 'Clean academic homepage with hero and featured research',
    sections: ['Hero', 'Featured Research']
  }
} as const
