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
  
  // Set content mode to dark (white text for black background)
  typedSection.contentMode = 'dark'

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

  // Navigation menu (right side) - Global menu
  const navigationWidget = {
    id: nanoid(),
    type: 'menu' as const,
    sectionId: navSection.id,
    skin: 'minimal' as const,
    menuType: 'global' as const,
    style: 'horizontal' as const,
    align: 'right' as const,
    items: [
      { id: nanoid(), label: 'Journals', url: '#', target: '_self' as const, displayCondition: 'always' as const, order: 0 },
      { id: nanoid(), label: 'Books', url: '#', target: '_self' as const, displayCondition: 'always' as const, order: 1 },
      { id: nanoid(), label: 'Proceedings', url: '#', target: '_self' as const, displayCondition: 'always' as const, order: 2 },
      { id: nanoid(), label: 'Blogs', url: '#', target: '_self' as const, displayCondition: 'always' as const, order: 3 }
    ]
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
 * Creates a Journal Banner section with publication details and CTA buttons
 * Matches the Journal TOC banner with dark gradient background
 */
export const createJournalBannerPrefab = (): CanvasItem => {
  // Use vertical layout to match TOC template structure
  const bannerSection: WidgetSection = {
    id: nanoid(),
    name: 'Journal Banner',
    type: 'hero',
    layout: 'vertical',
    areas: [
      {
        id: nanoid(),
        name: 'Journal Metadata',
        widgets: []
      },
      {
        id: nanoid(), 
        name: 'Journal CTA Buttons',
        widgets: []
      }
    ]
  }
  
  // Add black gradient background to match TOC template
  bannerSection.background = {
    type: 'gradient',
    gradient: {
      type: 'linear',
      direction: 'to right',
      stops: [
        { color: '#111827', position: '0%' },   // gray-900
        { color: '#1f2937', position: '50%' },  // gray-800
        { color: '#111827', position: '100%' }  // gray-900
      ]
    },
    opacity: 1
  }
  
  // Add Journal Banner section padding
  bannerSection.styling = {
    paddingTop: 'large',
    paddingBottom: 'large',
    paddingLeft: 'medium',
    paddingRight: 'medium',
    gap: 'medium'
  }
  
  // Set content mode to dark (white text for dark background)
  bannerSection.contentMode = 'dark'

  // Publication Details widget (top area)
  const publicationDetailsWidget = {
    id: nanoid(),
    type: 'publication-details' as const,
    skin: 'journal' as const,
    contentSource: 'ai-generated' as const,
    layout: 'hero' as const,
    // Mock publication data for template preview
    publication: {
      "@context": "https://schema.org",
      "@type": "PublicationIssue",
      "issueNumber": "12",
      "volumeNumber": "67",
      "datePublished": "2024-12-01",
      "name": "Volume 67 • Issue 12",
      "isPartOf": {
        "@type": "Periodical",
        "name": "Advanced Materials",
        "issn": "0935-9648",
        "editor": { "name": "Editorial Board" }
      }
    },
    cardConfig: {
      // Content Identification
      showContentTypeLabel: false,
      showTitle: true,
      showSubtitle: false,
      showThumbnail: false,
      thumbnailPosition: 'top' as const,
      
      // Publication Context
      showPublicationTitle: true,
      showVolumeIssue: true,
      showBookSeriesTitle: false,
      showChapterPages: false,
      showNumberOfIssues: false,
      showPublicationDate: true,
      showDOI: false,
      showISSN: false,
      showISBN: false,
      
      // Author Information
      showAuthors: true,
      authorStyle: 'initials' as const,
      showAffiliations: false,
      
      // Content Summary
      showAbstract: false,
      abstractLength: 'short' as const,
      showKeywords: false,
      
      // Access & Usage
      showAccessStatus: false,
      showViewDownloadOptions: false,
      showUsageMetrics: false,
      
      // Display Configuration
      titleStyle: 'large' as const
    }
  }

      // Individual CTA Button widgets (bottom area)
      // Using primary variant which automatically picks up journal branding when in journal context
      const subscribeButton = {
        id: nanoid(),
        type: 'button' as const,
        skin: 'minimal' as const,
        text: 'SUBSCRIBE/RENEW',
        variant: 'primary' as const,
        size: 'medium' as const,
        href: '#'
      }

      const librarianButton = {
        id: nanoid(),
        type: 'button' as const,
        skin: 'minimal' as const,
        text: 'RECOMMEND TO A LIBRARIAN',
        variant: 'primary' as const,
        size: 'medium' as const,
        href: '#'
      }

      const submitButton = {
        id: nanoid(),
        type: 'button' as const,
        skin: 'minimal' as const,
        text: 'SUBMIT AN ARTICLE',
        variant: 'primary' as const,
        size: 'medium' as const,
        href: '#'
      }

  // Assign widgets to areas
  bannerSection.areas[0].widgets = [publicationDetailsWidget] // Top: Publication Details
  bannerSection.areas[1].widgets = [subscribeButton, librarianButton, submitButton] // Bottom: CTA Buttons

  return bannerSection
}

export const createSidebarPrefab = (): CanvasItem => {
  const sidebarSection: WidgetSection = {
    id: nanoid(),
    name: 'sidebar',
    type: 'sidebar',
    layout: 'one-column',
    areas: [
      {
        id: nanoid(),
        name: 'Sidebar Content',
        widgets: []
      }
    ],
    
        // Default sidebar configuration
        sidebar: {
          position: 'right',
          span: 2, // Span 2 sections by default
          width: '25%', // 25% of page width
          sticky: false, // Scroll with content by default
          mobileBehavior: 'below', // Show below sections on mobile
          gap: 'medium' // Medium gap between sidebar and sections
        },
    
    // Default styling
    styling: {
      paddingTop: 'medium',
      paddingBottom: 'medium',
      paddingLeft: 'medium',
      paddingRight: 'medium',
      gap: 'medium'
    },
    
    // Light background by default
    background: {
      type: 'color',
      color: '#f8fafc',
      opacity: 1
    }
  }

  return sidebarSection
}

/**
 * Creates a Wiley-themed Hero Section with black background
 * Matches the dark sections with large hero text from Wiley screenshots
 */
export const createWileyHeroPrefab = (): CanvasItem => {
  const heroSection = createBaseSection('hero-with-buttons', 'Wiley Hero Section')
  const typedSection = heroSection as WidgetSection
  
  // Set section type
  typedSection.type = 'hero'
  
  // Black background to match Wiley dark sections
  typedSection.background = {
    type: 'color',
    color: '#000000',
    opacity: 1
  }
  
  // Wiley hero styling
  typedSection.styling = {
    paddingTop: 'large',
    paddingBottom: 'large',
    paddingLeft: 'medium',
    paddingRight: 'medium',
    gap: 'large',
    variant: 'full-width',
    textColor: 'white'
  }
  
  typedSection.contentMode = 'dark'
  
  // Hero heading
  const headingWidget = {
    id: nanoid(),
    type: 'heading' as const,
    sectionId: heroSection.id,
    skin: 'minimal' as const,
    text: 'Together with brilliant people across the knowledge ecosystem, we transform knowledge into breakthroughs that matter.',
    level: 1 as const,
    align: 'center' as const,
    style: 'hero' as const,
    color: 'primary' as const,
    size: 'xl' as const,
    icon: { enabled: false, position: 'left' as const, emoji: '' }
  }
  
  // CTA Button
  const ctaButton = {
    id: nanoid(),
    type: 'button' as const,
    sectionId: heroSection.id,
    skin: 'minimal' as const,
    text: 'EXPLORE NOW',
    href: '#',
    variant: 'primary' as const,
    size: 'large' as const,
    icon: {
      enabled: true,
      position: 'right' as const,
      emoji: '→'
    }
  }
  
  typedSection.areas[0].widgets = [headingWidget]
  typedSection.areas[1].widgets = [ctaButton]
  
  return typedSection
}

/**
 * Creates a Wiley Three-Column Feature Section
 * Matches the white/light sections with three cards from screenshots
 */
export const createWileyThreeColumnPrefab = (): CanvasItem => {
  const featuresSection = createBaseSection('header-plus-grid', 'Wiley Three Column Section')
  const typedSection = featuresSection as WidgetSection
  
  // Light gray background
  typedSection.background = {
    type: 'color',
    color: '#ffffff',
    opacity: 1
  }
  
  typedSection.styling = {
    paddingTop: 'large',
    paddingBottom: 'large',
    paddingLeft: 'medium',
    paddingRight: 'medium',
    gap: 'large',
    variant: 'full-width',
    textColor: 'default'
  }
  
  // Section header
  const headerWidget = {
    id: nanoid(),
    type: 'text' as const,
    sectionId: featuresSection.id,
    skin: 'minimal' as const,
    text: 'SECTION TITLE\n\n<h2>Section heading goes here</h2>',
    align: 'left' as const
  }
  
  // Three card widgets with borders
  const leftCard = {
    id: nanoid(),
    type: 'text' as const,
    sectionId: featuresSection.id,
    skin: 'minimal' as const,
    text: '<h3>Card Title</h3>\n\nCard description text goes here. Add your content and customize as needed.',
    align: 'left' as const,
    layout: {
      variant: 'card' as const,
      padding: 'large' as const,
      shadow: 'none' as const,
      rounded: 'medium' as const,
      border: 'light' as const
    }
  }
  
  const centerCard = {
    id: nanoid(),
    type: 'text' as const,
    sectionId: featuresSection.id,
    skin: 'minimal' as const,
    text: '<h3>Card Title</h3>\n\nCard description text goes here. Add your content and customize as needed.',
    align: 'left' as const,
    layout: {
      variant: 'card' as const,
      padding: 'large' as const,
      shadow: 'none' as const,
      rounded: 'medium' as const,
      border: 'light' as const
    }
  }
  
  const rightCard = {
    id: nanoid(),
    type: 'text' as const,
    sectionId: featuresSection.id,
    skin: 'minimal' as const,
    text: '<h3>Card Title</h3>\n\nCard description text goes here. Add your content and customize as needed.',
    align: 'left' as const,
    layout: {
      variant: 'card' as const,
      padding: 'large' as const,
      shadow: 'none' as const,
      rounded: 'medium' as const,
      border: 'light' as const
    }
  }
  
  typedSection.areas[0].widgets = [headerWidget]
  typedSection.areas[1].widgets = [leftCard]
  typedSection.areas[2].widgets = [centerCard]
  typedSection.areas[3].widgets = [rightCard]
  
  return typedSection
}

/**
 * Creates a Wiley Content with Side Image Section
 * Two-column layout with image on one side, content on the other
 */
export const createWileyContentImagePrefab = (): CanvasItem => {
  const contentSection = createBaseSection('two-columns', 'Wiley Content + Image Section')
  const typedSection = contentSection as WidgetSection
  
  // White background
  typedSection.background = {
    type: 'color',
    color: '#ffffff',
    opacity: 1
  }
  
  typedSection.styling = {
    paddingTop: 'large',
    paddingBottom: 'large',
    paddingLeft: 'medium',
    paddingRight: 'medium',
    gap: 'large',
    variant: 'full-width',
    textColor: 'default'
  }
  
  // Image placeholder
  const imageWidget = {
    id: nanoid(),
    type: 'image' as const,
    sectionId: contentSection.id,
    skin: 'minimal' as const,
    src: 'https://placehold.co/600x400/1a5757/ffffff?text=Your+Image',
    alt: 'Section image',
    ratio: '16:9' as const,
    alignment: 'center' as const,
    width: 'full' as const,
    objectFit: 'cover' as const
  }
  
  // Content area
  const contentWidget = {
    id: nanoid(),
    type: 'text' as const,
    sectionId: contentSection.id,
    skin: 'minimal' as const,
    text: '<p class="wiley-section-header">SECTION LABEL</p>\n\n<h2>Content heading goes here</h2>\n\n<p>Add your description text here. Customize the content to match your needs.</p>',
    align: 'left' as const
  }
  
  const ctaButton = {
    id: nanoid(),
    type: 'button' as const,
    sectionId: contentSection.id,
    skin: 'minimal' as const,
    text: 'EXPLORE NOW',
    href: '#',
    variant: 'primary' as const,
    size: 'medium' as const,
    icon: {
      enabled: true,
      position: 'right' as const,
      emoji: '→'
    }
  }
  
  typedSection.areas[0].widgets = [imageWidget]
  typedSection.areas[1].widgets = [contentWidget, ctaButton]
  
  return typedSection
}

/**
 * FIGMA-ACCURATE WILEY SECTIONS
 * Extracted from Wiley Website Design Guide Figma
 * These match the official Figma designs precisely
 */

/**
 * Creates a Figma-accurate Wiley Hero Section
 * Based on "Hero Banner - Basic" component from Figma
 * - Full-width hero with centered content
 * - Official Wiley colors (#00D875, #F8F8F5)
 * - Inter typography with proper weights
 */
export const createWileyFigmaHeroPrefab = (): CanvasItem => {
  const heroSection = createBaseSection('two-columns', 'Wiley Figma Hero')
  const typedSection = heroSection as WidgetSection
  
  typedSection.type = 'hero'
  
  // Dark teal gradient background from Figma (with organic texture overlay)
  typedSection.background = {
    type: 'color',
    color: '#1a4d4d',
    opacity: 1
  }
  
  typedSection.styling = {
    paddingTop: '80px',      // Figma Hero Banner: 80px all around
    paddingBottom: '80px',   // Figma Hero Banner: 80px
    paddingLeft: '80px',     // Figma Hero Banner: 80px
    paddingRight: '80px',    // Figma Hero Banner: 80px
    minHeight: '600px',      // Figma Hero Banner: 600-800px tall (using 600px for now)
    gap: 'large',
    variant: 'full-width',
    textColor: 'white'
  }
  
  typedSection.contentMode = 'dark'
  
  // LEFT COLUMN: Hero heading - ACTUAL Figma text
  const headingWidget = {
    id: nanoid(),
    type: 'heading' as const,
    sectionId: heroSection.id,
    skin: 'minimal' as const,
    text: 'Where ideas ignite and impact endures',
    level: 1 as const,
    align: 'left' as const,
    style: 'hero' as const,
    color: 'default' as const,
    size: 'xl' as const,
    icon: { enabled: false, position: 'left' as const, emoji: '' }
  }
  
  // LEFT COLUMN: Subheading - ACTUAL Figma text
  const subtextWidget = {
    id: nanoid(),
    type: 'text' as const,
    sectionId: heroSection.id,
    skin: 'minimal' as const,
    text: 'Wiley brings together research, learning, and technology to spark breakthroughs and power progress across industries and society.',
    align: 'left' as const
  }
  
  // RIGHT COLUMN: WILEY logo placeholder
  const logoWidget = {
    id: nanoid(),
    type: 'text' as const,
    sectionId: heroSection.id,
    skin: 'minimal' as const,
    text: 'WILEY',
    align: 'center' as const
  }
  
  typedSection.areas[0].widgets = [headingWidget, subtextWidget]
  typedSection.areas[1].widgets = [logoWidget]
  
  return typedSection
}

/**
 * Creates a Figma-accurate Content Card Grid
 * Based on "Cards" section from Figma Homepage
 * - 3-column responsive grid
 * - Dark teal background (continues from hero)
 * - Each card: Heading + Text + Button links
 */
export const createWileyFigmaCardGridPrefab = (): CanvasItem => {
  const cardSection = createBaseSection('three-columns', 'Wiley Figma Card Grid')
  const typedSection = cardSection as WidgetSection
  
  // Dark teal background (same as hero)
  typedSection.background = {
    type: 'color',
    color: '#1a4d4d',
    opacity: 1
  }
  
  typedSection.styling = {
    paddingTop: '80px',      // Figma 5xl spacing (Medium section)
    paddingBottom: '80px',   // Figma 5xl spacing
    paddingLeft: '40px',     // Figma 2xl spacing
    paddingRight: '40px',    // Figma 2xl spacing
    gap: 'large',
    variant: 'full-width',
    textColor: 'white'
  }
  
  typedSection.contentMode = 'dark'
  
  // Card 1: AI in Research
  const card1Heading = {
    id: nanoid(),
    type: 'heading' as const,
    sectionId: cardSection.id,
    skin: 'minimal' as const,
    text: 'AI in Research',
    level: 3 as const,
    align: 'left' as const,
    style: 'default' as const,
    color: 'default' as const,
    size: 'medium' as const,
    icon: { enabled: false, position: 'left' as const, emoji: '' }
  }
  
  const card1Text = {
    id: nanoid(),
    type: 'text' as const,
    sectionId: cardSection.id,
    skin: 'minimal' as const,
    text: 'How is AI transforming the landscape of academic research? We\'re here to help you navigate this evolution and harness its potential to advance your work.',
    align: 'left' as const
  }
  
  const card1Link1 = {
    id: nanoid(),
    type: 'button' as const,
    sectionId: cardSection.id,
    skin: 'minimal' as const,
    text: 'ExplainAtions 2025: The Evolution of AI in Research',
    href: '#',
    variant: 'link' as const,
    size: 'medium' as const,
    icon: { enabled: true, position: 'right' as const, emoji: '→' }
  }
  
  const card1Link2 = {
    id: nanoid(),
    type: 'button' as const,
    sectionId: cardSection.id,
    skin: 'minimal' as const,
    text: 'New AI Guidelines For Researchers',
    href: '#',
    variant: 'link' as const,
    size: 'medium' as const,
    icon: { enabled: true, position: 'right' as const, emoji: '→' }
  }
  
  const card1Link3 = {
    id: nanoid(),
    type: 'button' as const,
    sectionId: cardSection.id,
    skin: 'minimal' as const,
    text: 'Latest Episode: Chats On AI Use By Researchers',
    href: '#',
    variant: 'link' as const,
    size: 'medium' as const,
    icon: { enabled: true, position: 'right' as const, emoji: '→' }
  }
  
  // Card 2: The Wiley Difference
  const card2Heading = {
    id: nanoid(),
    type: 'heading' as const,
    sectionId: cardSection.id,
    skin: 'minimal' as const,
    text: 'The Wiley Difference',
    level: 3 as const,
    align: 'left' as const,
    style: 'default' as const,
    color: 'default' as const,
    size: 'medium' as const,
    icon: { enabled: false, position: 'left' as const, emoji: '' }
  }
  
  const card2Text = {
    id: nanoid(),
    type: 'text' as const,
    sectionId: cardSection.id,
    skin: 'minimal' as const,
    text: 'We connect researchers with global audiences, ensuring their discoveries drive progress. Through peer review and broad dissemination, we turn insights into real-world impact.',
    align: 'left' as const
  }
  
  const card2Link1 = {
    id: nanoid(),
    type: 'button' as const,
    sectionId: cardSection.id,
    skin: 'minimal' as const,
    text: 'Making Research Accessible',
    href: '#',
    variant: 'link' as const,
    size: 'medium' as const,
    icon: { enabled: true, position: 'right' as const, emoji: '→' }
  }
  
  const card2Link2 = {
    id: nanoid(),
    type: 'button' as const,
    sectionId: cardSection.id,
    skin: 'minimal' as const,
    text: 'Pioneering Cancer Research Excellence',
    href: '#',
    variant: 'link' as const,
    size: 'medium' as const,
    icon: { enabled: true, position: 'right' as const, emoji: '→' }
  }
  
  // Card 3: Insights Shaping Scholarly Publishing
  const card3Heading = {
    id: nanoid(),
    type: 'heading' as const,
    sectionId: cardSection.id,
    skin: 'minimal' as const,
    text: 'Insights Shaping Scholarly Publishing',
    level: 3 as const,
    align: 'left' as const,
    style: 'default' as const,
    color: 'default' as const,
    size: 'medium' as const,
    icon: { enabled: false, position: 'left' as const, emoji: '' }
  }
  
  const card3Text = {
    id: nanoid(),
    type: 'text' as const,
    sectionId: cardSection.id,
    skin: 'minimal' as const,
    text: 'Explore expert discussions on AI, Open Access, and the future of scholarly communication. Watch or listen to the latest episodes now.',
    align: 'left' as const
  }
  
  const card3Link1 = {
    id: nanoid(),
    type: 'button' as const,
    sectionId: cardSection.id,
    skin: 'minimal' as const,
    text: 'Watch Episodes Now',
    href: '#',
    variant: 'link' as const,
    size: 'medium' as const,
    icon: { enabled: true, position: 'right' as const, emoji: '→' }
  }
  
  const card3Link2 = {
    id: nanoid(),
    type: 'button' as const,
    sectionId: cardSection.id,
    skin: 'minimal' as const,
    text: 'Tune Into The Podcast',
    href: '#',
    variant: 'link' as const,
    size: 'medium' as const,
    icon: { enabled: true, position: 'right' as const, emoji: '→' }
  }
  
  typedSection.areas[0].widgets = [card1Heading, card1Text, card1Link1, card1Link2, card1Link3]
  typedSection.areas[1].widgets = [card2Heading, card2Text, card2Link1, card2Link2]
  typedSection.areas[2].widgets = [card3Heading, card3Text, card3Link1, card3Link2]
  
  return typedSection
}

/**
 * ========================================
 * WILEY FIGMA DS V2 PREFAB SECTIONS
 * ========================================
 * These sections have unique styling that justifies being prefabs:
 * - Hero: 500px with background image (L1 template VAR 2)
 * - Card Grid: Has title drop zone (not in basic layouts) + Heritage 900 background
 * - Shop Today: Bordered grid with unique styling
 * 
 * Figma references:
 * - Hero: Hub - L1 template VAR 2 (Desktop)
 * - Cards: https://www.figma.com/design/abbxQgAseYSVNmX3b5EcDv?node-id=8195-54472
 */

/**
 * Creates DS V2 Hero Section
 * Two-column layout with background image
 * Figma specs: Hub - L1 template VAR 2 (Desktop), Content Color=Light, Background=Image
 */
export const createWileyDSV2HeroPrefab = (): CanvasItem => {
  const heroSection = createBaseSection('two-columns', 'Hero Section')
  const typedSection = heroSection as WidgetSection
  
  // Styling: Shorter hero with background image (L1 template VAR 2)
  typedSection.styling = {
    paddingTop: '80px',
    paddingBottom: '80px',
    paddingLeft: '80px',
    paddingRight: '80px',
    minHeight: '500px',  // Figma spec: L1 template VAR 2 (shorter hero)
    gap: 'large',
    variant: 'full-width',
    textColor: 'white'
  }
  
  typedSection.background = {
    type: 'image',
    image: {
      url: 'https://www.wiley.com/content/dam/wiley-com/en/images/Photography/brand-and-hero/homepage/homepage-only-energy-burst-visual.jpg',
      position: 'center',
      repeat: 'no-repeat',
      size: 'cover'
    },
    opacity: 1
  }
  
  typedSection.contentMode = 'dark'
  
  // Left column: Hero content
  const heroHeading = {
    id: nanoid(),
    type: 'heading' as const,
    sectionId: heroSection.id,
    skin: 'minimal' as const,
    text: 'Where ideas ignite and impact endures',
    level: 1 as const,
    align: 'left' as const,
    style: 'hero' as const,
    color: 'default' as const,
    size: 'xl' as const,
    icon: { enabled: false, position: 'left' as const, emoji: '' }
  }
  
  const heroText = {
    id: nanoid(),
    type: 'text' as const,
    sectionId: heroSection.id,
    skin: 'minimal' as const,
    text: 'Wiley brings together research, learning, and technology to spark breakthroughs and power progress across industries and society.',
    align: 'left' as const
  }
  
  // Right column: Logo placeholder
  const logoPlaceholder = {
    id: nanoid(),
    type: 'text' as const,
    sectionId: heroSection.id,
    skin: 'minimal' as const,
    text: 'WILEY',
    align: 'center' as const
  }
  
  typedSection.areas[0].widgets = [heroHeading, heroText]
  typedSection.areas[1].widgets = [logoPlaceholder]
  
  return typedSection
}

/**
 * Creates DS V2 Card Grid Section
 * Header-plus-grid layout with title drop zone (unique to this prefab)
 * Figma specs: Background=#003b44 (Heritage 900), 3-column grid layout
 */
export const createWileyDSV2CardGridPrefab = (): CanvasItem => {
  const cardGridSection = createBaseSection('header-plus-grid', 'Card Grid')
  const typedSection = cardGridSection as WidgetSection
  
  // Styling: Dark Heritage 900 background with generous padding
  typedSection.styling = {
    paddingTop: '80px',
    paddingBottom: '80px',
    paddingLeft: '40px',
    paddingRight: '40px',
    gap: 'large',
    variant: 'full-width',
    textColor: 'white'
  }
  
  typedSection.background = {
    type: 'color',
    color: '#003b44',  // Figma spec: Heritage 900 (dark teal)
    opacity: 1
  }
  
  typedSection.contentMode = 'dark'
  
  // Card 1: AI in Research
  const card1Heading = {
    id: nanoid(),
    type: 'heading' as const,
    sectionId: cardGridSection.id,
    skin: 'minimal' as const,
    text: 'AI in Research',
    level: 2 as const,
    align: 'left' as const,
    style: 'default' as const,
    color: 'default' as const,
    size: 'xl' as const,
    icon: { enabled: false, position: 'left' as const, emoji: '' }
  }
  
  const card1Text = {
    id: nanoid(),
    type: 'text' as const,
    sectionId: cardGridSection.id,
    skin: 'minimal' as const,
    text: 'Explore how artificial intelligence is transforming research methodologies and accelerating discovery.',
    align: 'left' as const
  }
  
  const card1Button = {
    id: nanoid(),
    type: 'button' as const,
    sectionId: cardGridSection.id,
    skin: 'minimal' as const,
    text: 'Learn More',
    href: '#',
    style: 'solid' as const,  // NEW: Filled background
    color: 'color1' as const, // Brand 1 (Primary Green/Teal)
    size: 'medium' as const,
    align: 'left' as const,
    icon: { enabled: false, position: 'right' as const, emoji: '' }
  }
  
  // Card 2: Open Access
  const card2Heading = {
    id: nanoid(),
    type: 'heading' as const,
    sectionId: cardGridSection.id,
    skin: 'minimal' as const,
    text: 'Open Access',
    level: 2 as const,
    align: 'left' as const,
    style: 'default' as const,
    color: 'default' as const,
    size: 'xl' as const,
    icon: { enabled: false, position: 'left' as const, emoji: '' }
  }
  
  const card2Text = {
    id: nanoid(),
    type: 'text' as const,
    sectionId: cardGridSection.id,
    skin: 'minimal' as const,
    text: 'Making research freely available to accelerate knowledge sharing and global collaboration.',
    align: 'left' as const
  }
  
  const card2Button = {
    id: nanoid(),
    type: 'button' as const,
    sectionId: cardGridSection.id,
    skin: 'minimal' as const,
    text: 'Explore OA',
    href: '#',
    style: 'solid' as const,  // NEW: Filled background
    color: 'color1' as const, // Brand 1 (Primary Green/Teal)
    size: 'medium' as const,
    align: 'left' as const,
    icon: { enabled: false, position: 'right' as const, emoji: '' }
  }
  
  // Card 3: Future of Learning
  const card3Heading = {
    id: nanoid(),
    type: 'heading' as const,
    sectionId: cardGridSection.id,
    skin: 'minimal' as const,
    text: 'Future of Learning',
    level: 2 as const,
    align: 'left' as const,
    style: 'default' as const,
    color: 'default' as const,
    size: 'xl' as const,
    icon: { enabled: false, position: 'left' as const, emoji: '' }
  }
  
  const card3Text = {
    id: nanoid(),
    type: 'text' as const,
    sectionId: cardGridSection.id,
    skin: 'minimal' as const,
    text: 'Discover innovative approaches to education that prepare learners for tomorrow\'s challenges.',
    align: 'left' as const
  }
  
  const card3Button = {
    id: nanoid(),
    type: 'button' as const,
    sectionId: cardGridSection.id,
    skin: 'minimal' as const,
    text: 'Read More',
    href: '#',
    style: 'solid' as const,  // NEW: Filled background
    color: 'color1' as const, // Brand 1 (Primary Green/Teal)
    size: 'medium' as const,
    align: 'left' as const,
    icon: { enabled: false, position: 'right' as const, emoji: '' }
  }
  
  // Assign widgets to areas
  // Area 0: Header (title drop zone - EMPTY by default, user can add title)
  typedSection.areas[0].widgets = []
  
  // Areas 1-3: Cards
  typedSection.areas[1].widgets = [card1Heading, card1Text, card1Button]
  typedSection.areas[2].widgets = [card2Heading, card2Text, card2Button]
  typedSection.areas[3].widgets = [card3Heading, card3Text, card3Button]
  
  return typedSection
}

/**
 * Creates a Figma-accurate "Shop Today" Section
 * Based on "Shop today" section from Figma Homepage
 * - Section header + description (with more spacing)
 * - 3 bordered cards: Books, Textbooks, Courseware
 * - Each card has heading + description + outlined CTA button
 */
export const createWileyFigmaLogoGridPrefab = (): CanvasItem => {
  const shopSection = createBaseSection('header-plus-grid', 'Shop Today')
  const typedSection = shopSection as WidgetSection
  
  // Light cream/beige background (matching Figma)
  typedSection.background = {
    type: 'color',
    color: '#F8F8F5',
    opacity: 1
  }
  
  typedSection.styling = {
    paddingTop: '80px',      // More generous top padding
    paddingBottom: '80px',   // More generous bottom padding
    paddingLeft: '80px',     // Match other sections
    paddingRight: '80px',    // Match other sections
    gap: 'large',            // Large gap between header and cards
    variant: 'full-width',   // Full width for consistency
    textColor: 'default'
  }
  
  typedSection.contentMode = 'light'
  
  // Section header
  const headerWidget = {
    id: nanoid(),
    type: 'heading' as const,
    sectionId: shopSection.id,
    skin: 'minimal' as const,
    text: 'Shop today',
    level: 2 as const,
    align: 'left' as const,
    style: 'default' as const,
    color: 'default' as const,
    size: 'xl' as const,
    icon: { enabled: false, position: 'left' as const, emoji: '' }
  }
  
  // Section description with inline styles for spacing
  const descriptionWidget = {
    id: nanoid(),
    type: 'text' as const,
    sectionId: shopSection.id,
    skin: 'minimal' as const,
    text: 'A one-stop shop for textbooks, learning tools, and everyday books that power your success.',
    align: 'left' as const,
    inlineStyles: 'margin-bottom: 32px; color: #5A5A5A;'  // More space before cards, subtle gray
  }
  
  // Card 1: Books
  const card1Heading = {
    id: nanoid(),
    type: 'heading' as const,
    sectionId: shopSection.id,
    skin: 'minimal' as const,
    text: 'Books',
    level: 3 as const,
    align: 'left' as const,
    style: 'default' as const,
    color: 'default' as const,
    size: 'xl' as const,
    icon: { enabled: false, position: 'left' as const, emoji: '' }
  }
  
  const card1Text = {
    id: nanoid(),
    type: 'text' as const,
    sectionId: shopSection.id,
    skin: 'minimal' as const,
    text: 'Learn, lead, grow, and succeed as a professional with our career and professional development titles, written by the most trusted and reputable authors in their fields.',
    align: 'left' as const,
    inlineStyles: 'margin-top: 16px; margin-bottom: 24px; line-height: 1.6; color: #5A5A5A;'  // Better spacing and readability
  }
  
  const card1Button = {
    id: nanoid(),
    type: 'button' as const,
    sectionId: shopSection.id,
    skin: 'minimal' as const,
    text: 'SHOP NOW →',
    href: '#',
    style: 'outline' as const,  // NEW: Outline (border only)
    color: 'color1' as const,   // Brand 1 (teal border on light bg)
    size: 'medium' as const,
    align: 'left' as const,
    icon: { enabled: false, position: 'right' as const, emoji: '' }
  }
  
  // Card 2: Textbooks (UPDATED TO MATCH FIGMA)
  const card2Heading = {
    id: nanoid(),
    type: 'heading' as const,
    sectionId: shopSection.id,
    skin: 'minimal' as const,
    text: 'Textbooks',
    level: 3 as const,
    align: 'left' as const,
    style: 'default' as const,
    color: 'default' as const,
    size: 'xl' as const,
    icon: { enabled: false, position: 'left' as const, emoji: '' }
  }
  
  const card2Text = {
    id: nanoid(),
    type: 'text' as const,
    sectionId: shopSection.id,
    skin: 'minimal' as const,
    text: 'Open possibilities for your career with certifications in finance and business, accounting, and data science and analytics.',  // UPDATED FROM FIGMA
    align: 'left' as const,
    inlineStyles: 'margin-top: 16px; margin-bottom: 24px; line-height: 1.6; color: #5A5A5A;'
  }
  
  const card2Button = {
    id: nanoid(),
    type: 'button' as const,
    sectionId: shopSection.id,
    skin: 'minimal' as const,
    text: 'SHOP NOW →',
    href: '#',
    style: 'outline' as const,  // NEW: Outline (border only)
    color: 'color1' as const,   // Brand 1 (teal border on light bg)
    size: 'medium' as const,
    align: 'left' as const,
    icon: { enabled: false, position: 'right' as const, emoji: '' }
  }
  
  // Card 3: Courseware
  const card3Heading = {
    id: nanoid(),
    type: 'heading' as const,
    sectionId: shopSection.id,
    skin: 'minimal' as const,
    text: 'Courseware',
    level: 3 as const,
    align: 'left' as const,
    style: 'default' as const,
    color: 'default' as const,
    size: 'xl' as const,
    icon: { enabled: false, position: 'left' as const, emoji: '' }
  }
  
  const card3Text = {
    id: nanoid(),
    type: 'text' as const,
    sectionId: shopSection.id,
    skin: 'minimal' as const,
    text: 'Take self-paced courses to advance your career and your salary.',
    align: 'left' as const,
    inlineStyles: 'margin-top: 16px; margin-bottom: 24px; line-height: 1.6; color: #5A5A5A;'
  }
  
  const card3Button = {
    id: nanoid(),
    type: 'button' as const,
    sectionId: shopSection.id,
    skin: 'minimal' as const,
    text: 'SHOP NOW →',
    href: '#',
    style: 'outline' as const,  // NEW: Outline (border only)
    color: 'color1' as const,   // Brand 1 (teal border on light bg)
    size: 'medium' as const,
    align: 'left' as const,
    icon: { enabled: false, position: 'right' as const, emoji: '' }
  }
  
  typedSection.areas[0].widgets = [headerWidget, descriptionWidget]
  typedSection.areas[1].widgets = [card1Heading, card1Text, card1Button]
  typedSection.areas[2].widgets = [card2Heading, card2Text, card2Button]
  typedSection.areas[3].widgets = [card3Heading, card3Text, card3Button]
  
  return typedSection
}

/**
 * Creates a Figma-accurate "About Wiley" Section with Partner Logos
 * Based on "About Wiley" section from Figma Homepage
 * - Centered content with heading, description, CTA
 * - Logo row: eBay, CNN, Google, Cisco, Airbnb, UBER
 * - Off-white background
 */
export const createWileyFigmaFeaturedContentPrefab = (): CanvasItem => {
  const featuredSection = createBaseSection('one-column', 'About Wiley + Partners')
  const typedSection = featuredSection as WidgetSection
  
  // Off-white/cream background
  typedSection.background = {
    type: 'color',
    color: '#F8F8F5',
    opacity: 1
  }
  
  typedSection.styling = {
    paddingTop: '64px',      // Figma 4xl spacing (Medium-Small section)
    paddingBottom: '64px',   // Figma 4xl spacing
    paddingLeft: '40px',     // Figma 2xl spacing
    paddingRight: '40px',    // Figma 2xl spacing
    gap: 'large',
    variant: 'contained',
    textColor: 'default'
  }
  
  // Small label
  const labelWidget = {
    id: nanoid(),
    type: 'text' as const,
    sectionId: featuredSection.id,
    skin: 'minimal' as const,
    text: 'ABOUT WILEY',
    align: 'center' as const
  }
  
  // Main heading
  const headingWidget = {
    id: nanoid(),
    type: 'heading' as const,
    sectionId: featuredSection.id,
    skin: 'minimal' as const,
    text: 'Transforming knowledge into impact',
    level: 2 as const,
    align: 'center' as const,
    style: 'default' as const,
    color: 'default' as const,
    size: 'xl' as const,
    icon: { enabled: false, position: 'left' as const, emoji: '' }
  }
  
  // Body paragraph
  const bodyWidget = {
    id: nanoid(),
    type: 'text' as const,
    sectionId: featuredSection.id,
    skin: 'minimal' as const,
    text: 'We transform knowledge into actionable intelligence – accelerating scientific breakthroughs, supporting learning, and driving innovation that redefines fields and improves lives. Through access to trusted research, data, and AI-powered platforms, we\'re your partner in a world driven by curiosity and continuous discovery.',
    align: 'center' as const
  }
  
  // CTA Button
  const ctaButton = {
    id: nanoid(),
    type: 'button' as const,
    sectionId: featuredSection.id,
    skin: 'minimal' as const,
    text: 'LEARN MORE',
    href: '#',
    variant: 'primary' as const,
    size: 'large' as const,
    icon: {
      enabled: true,
      position: 'right' as const,
      emoji: '→'
    }
  }
  
  // Partner logos (as simple text)
  const logosWidget = {
    id: nanoid(),
    type: 'text' as const,
    sectionId: featuredSection.id,
    skin: 'minimal' as const,
    text: 'eBay • CNN • Google • Cisco • Airbnb • UBER',
    align: 'center' as const
  }
  
  typedSection.areas[0].widgets = [labelWidget, headingWidget, bodyWidget, ctaButton, logosWidget]
  
  return typedSection
}

/**
 * Available prefab sections for easy access
 */
export const PREFAB_SECTIONS = {
  globalHeader: createGlobalHeaderPrefab,
  mainNavigation: createMainNavigationPrefab,
  hero: createHeroPrefab,
  featuredResearch: createFeaturesPrefab,
  journalBanner: createJournalBannerPrefab,
  sidebar: createSidebarPrefab,
  wileyHero: createWileyHeroPrefab,
  wileyThreeColumn: createWileyThreeColumnPrefab,
  wileyContentImage: createWileyContentImagePrefab,
  wileyFigmaHero: createWileyFigmaHeroPrefab,
  wileyFigmaCardGrid: createWileyFigmaCardGridPrefab,
  wileyFigmaLogoGrid: createWileyFigmaLogoGridPrefab,
  wileyFigmaFeaturedContent: createWileyFigmaFeaturedContentPrefab,
  // Wiley Figma DS V2 prefabs
  wileyDSV2Hero: createWileyDSV2HeroPrefab,
  wileyDSV2CardGrid: createWileyDSV2CardGridPrefab
} as const

export type PrefabSectionType = keyof typeof PREFAB_SECTIONS
