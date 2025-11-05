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
  createWileyHeroPrefab,
  createWileyThreeColumnPrefab,
  createWileyContentImagePrefab,
  createWileyFigmaHeroPrefab,
  createWileyFigmaCardGridPrefab,
  createWileyFigmaFeaturedContentPrefab,
  createWileyFigmaLogoGridPrefab,
  createHeroPrefab,
  createFeaturesPrefab
} from '../components/PageBuilder/prefabSections'

/**
 * Creates DS V2 starter homepage - BASIC SECTIONS approach
 * Uses basic section layouts (two-columns, header-plus-grid, one-column)
 * + widgets to compose sections, instead of special prefabs
 * Only "Shop Today" uses a prefab because it has unique grid styling
 * Philosophy: Build with basic layouts, only use prefabs for special styling
 */
export const createWileyDSV2StarterTemplate = (): CanvasItem[] => {
  // Helper to create basic section structure
  const createBasicSection = (layout: string, name: string) => {
    const section: any = {
      id: nanoid(),
      name: name,
      type: 'content-block',
      layout: layout,
      areas: []
    }
    
    // Create areas based on layout
    if (layout === 'two-columns') {
      section.areas = [
        { id: nanoid(), name: 'Left Column', widgets: [] },
        { id: nanoid(), name: 'Right Column', widgets: [] }
      ]
    } else if (layout === 'header-plus-grid') {
      section.areas = [
        { id: nanoid(), name: 'Header', widgets: [] },
        { id: nanoid(), name: 'Left Card', widgets: [] },
        { id: nanoid(), name: 'Center Card', widgets: [] },
        { id: nanoid(), name: 'Right Card', widgets: [] }
      ]
    } else if (layout === 'one-column') {
      section.areas = [
        { id: nanoid(), name: 'Content', widgets: [] }
      ]
    }
    
    return section
  }
  
  // 1. HERO SECTION - Built with basic two-columns layout
  const heroSection = createBasicSection('two-columns', 'Hero Section')
  heroSection.styling = {
    paddingTop: '80px',
    paddingBottom: '80px',
    paddingLeft: '80px',
    paddingRight: '80px',
    minHeight: '600px',
    gap: 'large',
    variant: 'full-width',
    textColor: 'white'
  }
  heroSection.background = {
    type: 'color',
    color: '#1a4d4d',
    opacity: 1
  }
  heroSection.contentMode = 'dark'
  
  // Hero widgets (left column)
  heroSection.areas[0].widgets = [
    {
      id: nanoid(),
      type: 'heading',
      sectionId: heroSection.id,
      skin: 'minimal',
      text: 'Where ideas ignite and impact endures',
      level: 1,
      align: 'left',
      style: 'hero',
      color: 'default',
      size: 'xl',
      icon: { enabled: false, position: 'left', emoji: '' }
    },
    {
      id: nanoid(),
      type: 'text',
      sectionId: heroSection.id,
      skin: 'minimal',
      text: 'Wiley brings together research, learning, and technology to spark breakthroughs and power progress across industries and society.',
      align: 'left'
    }
  ]
  
  // Hero logo placeholder (right column)
  heroSection.areas[1].widgets = [
    {
      id: nanoid(),
      type: 'text',
      sectionId: heroSection.id,
      skin: 'minimal',
      text: 'WILEY',
      align: 'center'
    }
  ]
  
  // 2. CARD GRID - Built with basic header-plus-grid layout
  const cardGridSection = createBasicSection('header-plus-grid', 'Card Grid')
  cardGridSection.styling = {
    paddingTop: '80px',
    paddingBottom: '80px',
    paddingLeft: '40px',
    paddingRight: '40px',
    gap: 'large',
    variant: 'full-width',
    textColor: 'white'
  }
  cardGridSection.background = {
    type: 'color',
    color: '#1a4d4d',
    opacity: 1
  }
  cardGridSection.contentMode = 'dark'
  
  // Card 1: AI in Research
  cardGridSection.areas[1].widgets = [
    {
      id: nanoid(),
      type: 'heading',
      sectionId: cardGridSection.id,
      skin: 'minimal',
      text: 'AI in Research',
      level: 2,
      align: 'left',
      style: 'default',
      color: 'default',
      size: 'xl',
      icon: { enabled: false, position: 'left', emoji: '' }
    },
    {
      id: nanoid(),
      type: 'text',
      sectionId: cardGridSection.id,
      skin: 'minimal',
      text: 'Explore how AI is transforming research methodologies.',
      align: 'left'
    },
    {
      id: nanoid(),
      type: 'button',
      sectionId: cardGridSection.id,
      skin: 'minimal',
      text: 'LEARN MORE',
      variant: 'primary',
      size: 'medium',
      href: '#',
      target: '_self',
      icon: { enabled: false, position: 'left', emoji: '' }
    }
  ]
  
  // Card 2: The Wiley Difference
  cardGridSection.areas[2].widgets = [
    {
      id: nanoid(),
      type: 'heading',
      sectionId: cardGridSection.id,
      skin: 'minimal',
      text: 'The Wiley Difference',
      level: 2,
      align: 'left',
      style: 'default',
      color: 'default',
      size: 'xl',
      icon: { enabled: false, position: 'left', emoji: '' }
    },
    {
      id: nanoid(),
      type: 'text',
      sectionId: cardGridSection.id,
      skin: 'minimal',
      text: 'Discover what sets us apart in scholarly publishing.',
      align: 'left'
    },
    {
      id: nanoid(),
      type: 'button',
      sectionId: cardGridSection.id,
      skin: 'minimal',
      text: 'EXPLORE',
      variant: 'primary',
      size: 'medium',
      href: '#',
      target: '_self',
      icon: { enabled: false, position: 'left', emoji: '' }
    }
  ]
  
  // Card 3: Insights
  cardGridSection.areas[3].widgets = [
    {
      id: nanoid(),
      type: 'heading',
      sectionId: cardGridSection.id,
      skin: 'minimal',
      text: 'Insights Shaping Scholarly Publishing',
      level: 2,
      align: 'left',
      style: 'default',
      color: 'default',
      size: 'xl',
      icon: { enabled: false, position: 'left', emoji: '' }
    },
    {
      id: nanoid(),
      type: 'text',
      sectionId: cardGridSection.id,
      skin: 'minimal',
      text: 'Stay informed with the latest industry trends.',
      align: 'left'
    },
    {
      id: nanoid(),
      type: 'button',
      sectionId: cardGridSection.id,
      skin: 'minimal',
      text: 'READ MORE',
      variant: 'primary',
      size: 'medium',
      href: '#',
      target: '_self',
      icon: { enabled: false, position: 'left', emoji: '' }
    }
  ]
  
  // 3. ABOUT WILEY - Built with basic one-column layout
  const aboutSection = createBasicSection('one-column', 'About Wiley + Partners')
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
      // DS V2: Minimal approach - only unique layouts
      return createWileyDSV2StarterTemplate()
    
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
    description: 'Smart approach - starter sections built with basic layouts + widgets. Only Shop Today uses prefab.',
    sections: ['Hero (basic two-columns)', 'Card Grid (basic header-plus-grid)', 'About Wiley (basic one-column)', 'Shop Today (prefab - bordered grid)'],
    philosophy: 'Compose sections using basic layouts. Only use prefabs for special styling that cannot be replicated.',
    features: ['Multi-brand colors (Wiley/WT/Dummies)', 'Essential component specs', 'Journal theme presets']
  },
  'default': {
    name: 'Default Academic',
    description: 'Clean academic homepage with hero and featured research',
    sections: ['Hero', 'Featured Research']
  }
} as const
