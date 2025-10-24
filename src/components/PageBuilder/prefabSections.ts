import { nanoid } from 'nanoid'
import type { CanvasItem, ContentBlockLayout, WidgetSection } from '../../types/widgets'

/**
 * Prefab Sections Module
 * 
 * Contains all template-ready section creators for the page builder.
 * Each function creates a complete section with placeholder content
 * that matches the Mock Live Site design.
 */

// Helper function to create a base section
const createBaseSection = (layout: ContentBlockLayout, name: string): CanvasItem => {
  const newSection: CanvasItem = {
    id: nanoid(),
    name: name,
    type: 'content-block',
    layout: layout,
    areas: createAreasForLayout(layout)
  }
  return newSection
}

// Helper function to create areas based on layout type
const createAreasForLayout = (layout: ContentBlockLayout) => {
  switch (layout) {
    case 'one-column':
      return [{ id: nanoid(), name: 'Content', widgets: [] }]
    
    case 'two-columns':
      return [
        { id: nanoid(), name: 'Left Column', widgets: [] },
        { id: nanoid(), name: 'Right Column', widgets: [] }
      ]
    
    case 'three-columns':
      return [
        { id: nanoid(), name: 'Left Column', widgets: [] },
        { id: nanoid(), name: 'Center Column', widgets: [] },
        { id: nanoid(), name: 'Right Column', widgets: [] }
      ]
    
    case 'hero-with-buttons':
      return [
        { id: nanoid(), name: 'Hero Content', widgets: [] },
        { id: nanoid(), name: 'Button Row', widgets: [] }
      ]
    
    case 'header-plus-grid':
      return [
        { id: nanoid(), name: 'Header', widgets: [] },
        { id: nanoid(), name: 'Left Card', widgets: [] },
        { id: nanoid(), name: 'Center Card', widgets: [] },
        { id: nanoid(), name: 'Right Card', widgets: [] }
      ]
    
    default:
      return [{ id: nanoid(), name: 'Content', widgets: [] }]
  }
}

/**
 * Creates a Global Header section with university header and main navigation
 * Matches the Mock Live Site header structure
 */
export const createGlobalHeaderPrefab = (): CanvasItem => {
  const headerSection = createBaseSection('two-columns', 'Global Header')
  
  // Set up styling to match Mock Live Site
  const typedSection = headerSection as WidgetSection
  
  // University header with proper padding
  typedSection.styling = {
    paddingTop: 'medium',
    paddingBottom: 'medium', 
    paddingLeft: 'medium',
    paddingRight: 'medium',
    gap: 'none',
    variant: 'full-width',
    textColor: 'white'
  }

  // Add black background
  typedSection.background = {
    type: 'color',
    color: '#000000',
    opacity: 1
  }

  // University header content (left side)
  const universityHeaderWidget = {
    id: nanoid(),
    type: 'text' as const,
    sectionId: headerSection.id,
    skin: 'minimal' as const,
    text: 'brought to you by Atypon',
    align: 'left' as const
  }

  // Search and user area (right side) 
  const searchAreaWidget = {
    id: nanoid(),
    type: 'text' as const,
    sectionId: headerSection.id,
    skin: 'minimal' as const,
    text: 'Search • Advanced Search • 🛒 • Maria Chioti',
    align: 'right' as const
  }

  // Assign widgets to areas
  typedSection.areas[0].widgets = [universityHeaderWidget] // Left: University header
  typedSection.areas[1].widgets = [searchAreaWidget] // Right: Search/user area

  return typedSection
}

/**
 * Creates a Main Navigation section 
 * Separate from university header for better modularity
 */
export const createMainNavigationPrefab = (): CanvasItem => {
  const navSection = createBaseSection('two-columns', 'Main Navigation')
  const typedSection = navSection as WidgetSection

  // Main navigation with proper padding
  typedSection.styling = {
    paddingTop: 'medium',
    paddingBottom: 'medium',
    paddingLeft: 'medium', 
    paddingRight: 'medium',
    gap: 'none',
    variant: 'full-width',
    textColor: 'default',
    border: {
      enabled: true,
      position: 'bottom',
      width: 'thin',
      color: 'default'
    }
  }

  // Add white background
  typedSection.background = {
    type: 'color',
    color: '#ffffff',
    opacity: 1
  }

  // Wiley logo/title (left side)
  const logoWidget = {
    id: nanoid(),
    type: 'heading' as const,
    sectionId: navSection.id,
    skin: 'minimal' as const,
    text: 'Wiley Online Library',
    level: 2 as const,
    align: 'left' as const,
    style: 'default' as const,
    color: 'primary' as const,
    size: 'large' as const,
    icon: { enabled: false, position: 'left' as const, emoji: '📚' }
  }

  // Navigation links (right side)
  const navigationWidget = {
    id: nanoid(),
    type: 'text' as const,
    sectionId: navSection.id,
    skin: 'minimal' as const,
    text: 'Journals • Books • Proceedings • Blogs',
    align: 'right' as const
  }

  // Assign widgets to areas
  typedSection.areas[0].widgets = [logoWidget] // Left: Logo
  typedSection.areas[1].widgets = [navigationWidget] // Right: Navigation

  return typedSection
}

/**
 * Creates a Hero section with blue gradient background and call-to-action buttons
 * Matches the Mock Live Site hero section
 */
export const createHeroPrefab = (): CanvasItem => {
  const heroSection = createBaseSection('hero-with-buttons', 'Hero Section')
  const typedSection = heroSection as WidgetSection
  
  // Set section type for consistent hero styling
  typedSection.type = 'hero'
  
  // Add blue gradient background to match Mock Live Site
  typedSection.background = {
    type: 'gradient',
    gradient: {
      type: 'linear',
      direction: 'to bottom',
      stops: [
        { color: '#1e40af', position: '0%' },
        { color: '#3b82f6', position: '100%' }
      ]
    },
    opacity: 1
  }
  
  // Add placeholder heading widget to hero content area
  const headingWidget = {
    id: nanoid(),
    type: 'heading' as const,
    sectionId: heroSection.id,
    skin: 'minimal' as const,
    text: 'Wiley Online Library',
    level: 1 as const,
    align: 'center' as const,
    style: 'hero' as const,
    color: 'primary' as const,
    size: 'xl' as const,
    icon: { enabled: false, position: 'left' as const, emoji: '🚀' }
  }

  // Add placeholder text widget
  const textWidget = {
    id: nanoid(),
    type: 'text' as const,
    sectionId: heroSection.id,
    skin: 'minimal' as const,
    text: 'Discover breakthrough research in computing, technology, and digital innovation. Access thousands of peer-reviewed articles from leading journals and conferences.',
    align: 'center' as const
  }

  // Add placeholder button widgets to button row
  const primaryButton = {
    id: nanoid(),
    type: 'button' as const,
    sectionId: heroSection.id,
    skin: 'minimal' as const,
    text: 'Explore Journals',
    href: '#',
    variant: 'primary' as const,
    size: 'large' as const
  }

  const secondaryButton = {
    id: nanoid(),
    type: 'button' as const,
    sectionId: heroSection.id,
    skin: 'minimal' as const,
    text: 'Browse Collections',
    href: '#',
    variant: 'secondary' as const,
    size: 'large' as const
  }

  // Proper Hero section padding
  typedSection.styling = {
    paddingTop: 'large',
    paddingBottom: 'large',
    paddingLeft: 'medium',
    paddingRight: 'medium',
    gap: 'medium',
    variant: 'full-width',
    textColor: 'white'
  }

  // Assign widgets to appropriate areas
  typedSection.areas[0].widgets = [headingWidget, textWidget] // Hero Content
  typedSection.areas[1].widgets = [primaryButton, secondaryButton] // Button Row

  return typedSection
}

/**
 * Creates a Featured Research section with gray background and research cards
 * Matches the Mock Live Site featured research section
 */
export const createFeaturesPrefab = (): CanvasItem => {
  const featuresSection = createBaseSection('header-plus-grid', 'Featured Research Section')
  const typedSection = featuresSection as WidgetSection
  
  // Add Mock Live Site styling to match the featured research cards  
  typedSection.background = {
    type: 'color',
    color: '#f8fafc',
    opacity: 1
  }
  
  // Add main heading
  const mainHeading = {
    id: nanoid(),
    type: 'heading' as const,
    sectionId: featuresSection.id,
    skin: 'minimal' as const,
    text: 'Featured Research',
    level: 2 as const,
    align: 'center' as const,
    style: 'default' as const,
    color: 'default' as const,
    size: 'large' as const,
    icon: { enabled: false, position: 'left' as const, emoji: '📚' }
  }

  // Create 3 text widgets for research areas with card layout
  const leftText = {
    id: nanoid(),
    type: 'text' as const,
    sectionId: featuresSection.id,
    skin: 'minimal' as const,
    text: 'Latest in AI & Machine Learning\n\nCutting-edge research in artificial intelligence, neural networks, and computational learning theory.\n\nExplore Articles →',
    align: 'left' as const,
    layout: {
      variant: 'card' as const,
      padding: 'large' as const,
      shadow: 'medium' as const,
      rounded: 'medium' as const
    }
  }

  const centerText = {
    id: nanoid(),
    type: 'text' as const, 
    sectionId: featuresSection.id,
    skin: 'minimal' as const,
    text: 'Computer Systems & Architecture\n\nBreakthrough discoveries in distributed systems, cloud computing, and hardware optimization.\n\nRead More →',
    align: 'left' as const,
    layout: {
      variant: 'card' as const,
      padding: 'large' as const,
      shadow: 'medium' as const,
      rounded: 'medium' as const
    }
  }

  const rightText = {
    id: nanoid(),
    type: 'text' as const,
    sectionId: featuresSection.id,
    skin: 'minimal' as const,
    text: 'Software Engineering Advances\n\nRevolutionary approaches to software development, testing, and quality assurance methodologies.\n\nView Research →',
    align: 'left' as const,
    layout: {
      variant: 'card' as const,
      padding: 'large' as const,
      shadow: 'medium' as const,
      rounded: 'medium' as const
    }
  }

  // Proper Featured Research section padding
  typedSection.styling = {
    paddingTop: 'large',
    paddingBottom: 'large',
    paddingLeft: 'medium',
    paddingRight: 'medium',
    gap: 'medium',
    variant: 'full-width',
    textColor: 'default'
  }

  // Assign widgets to areas
  typedSection.areas[0].widgets = [mainHeading] // Header area
  typedSection.areas[1].widgets = [leftText] // Left card
  typedSection.areas[2].widgets = [centerText] // Center card  
  typedSection.areas[3].widgets = [rightText] // Right card

  return typedSection
}

/**
 * Available prefab sections for easy access
 */
export const PREFAB_SECTIONS = {
  globalHeader: createGlobalHeaderPrefab,
  mainNavigation: createMainNavigationPrefab,
  hero: createHeroPrefab,
  featuredResearch: createFeaturesPrefab
} as const

export type PrefabSectionType = keyof typeof PREFAB_SECTIONS
