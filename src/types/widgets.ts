// Widget types for the page builder system

export type Skin = 'minimal' | 'modern' | 'classic' | 'accent' | 'hero' | 'journal' | 'primary' | 'dark' | 'muted' | 'center' | 'footer' | 'compact' | 'raw'

export type WidgetBase = {
  id: string
  type: string
  skin: Skin
  sectionId?: string
  layout?: {
    variant?: 'default' | 'card' | 'bordered' | 'elevated'
    padding?: 'none' | 'small' | 'medium' | 'large'
    margin?: 'none' | 'small' | 'medium' | 'large'
    background?: 'transparent' | 'white' | 'gray-50' | 'gray-100'
    shadow?: 'none' | 'small' | 'medium' | 'large'
    rounded?: 'none' | 'small' | 'medium' | 'large'
    border?: 'none' | 'light' | 'medium' | 'heavy'
  }
}

export type TextWidget = WidgetBase & { type: 'text'; text: string; align?: 'left'|'center'|'right' }
export type ImageWidget = WidgetBase & { 
  type: 'image'; 
  src: string; 
  alt: string; 
  ratio?: '1:1' | '4:3' | '3:4' | '16:9' | 'auto';
  caption?: string;
  link?: string;
  alignment?: 'left' | 'center' | 'right';
  width?: 'auto' | 'full' | 'small' | 'medium' | 'large';
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none';
}
export type NavbarWidget = WidgetBase & { type: 'navbar'; links: Array<{ label: string; href: string }> }
export type HTMLWidget = WidgetBase & { type: 'html'; htmlContent: string; title?: string }
export type CodeWidget = WidgetBase & {
  type: 'code'
  title: string
  language: 'javascript' | 'typescript' | 'python' | 'css' | 'html' | 'json' | 'markdown' | 'xml' | 'sql' | 'shell'
  codeContent: string
  showLineNumbers?: boolean
  theme?: 'light' | 'dark'
}
export type HeadingWidget = WidgetBase & { 
  type: 'heading'; 
  text: string; 
  level: 1 | 2 | 3 | 4 | 5 | 6; 
  align?: 'left' | 'center' | 'right';
  style?: 'default' | 'bordered-left' | 'underlined' | 'highlighted' | 'decorated' | 'gradient' | 'hero';
  color?: 'default' | 'primary' | 'secondary' | 'accent' | 'muted';
  size?: 'small' | 'medium' | 'large' | 'xl' | 'auto';
  icon?: WidgetIcon;
}

// Publication Card configuration types
export type PublicationCardConfig = {
  // Content Identification
  showContentTypeLabel: boolean
  showTitle: boolean
  showSubtitle: boolean
  showThumbnail: boolean
  thumbnailPosition: 'top' | 'left' | 'right' | 'bottom' | 'underlay'
  
  // Publication Context
  showPublicationTitle: boolean
  showVolumeIssue: boolean
  showBookSeriesTitle: boolean
  showChapterPages: boolean
  showNumberOfIssues: boolean
  showPublicationDate: boolean
  showDOI: boolean
  showISSN: boolean
  showISBN: boolean
  
  // Author Information
  showAuthors: boolean
  authorStyle: 'initials' | 'full'
  showAffiliations: boolean
  
  // Content Summary
  showAbstract: boolean
  abstractLength: 'short' | 'medium' | 'long'
  showKeywords: boolean
  
  // Access & Usage
  showAccessStatus: boolean
  showViewDownloadOptions: boolean
  showUsageMetrics: boolean
  
  // Display Configuration
  titleStyle: 'small' | 'medium' | 'large'
}

export type PublicationListWidget = WidgetBase & {
  type: 'publication-list'
  contentSource: 'dynamic-query' | 'doi-list' | 'ai-generated' | 'schema-objects'
  publications: any[] // JSON-LD ScholarlyArticle array
  cardConfig: PublicationCardConfig
  cardVariantId?: string // Reference to saved variant
  layout: 'list' | 'grid' | 'featured'
  maxItems?: number
  align?: 'left' | 'center' | 'right'
  // Schema objects source configuration
  schemaSource?: {
    selectionType: 'by-id' | 'by-type'
    selectedIds?: string[] // Specific schema object IDs
    selectedType?: string // Schema.org type to filter by
  }
  // AI generation configuration
  aiSource?: {
    prompt: string // Natural language prompt for AI generation
    lastGenerated?: Date // Timestamp of last generation
    generatedContent?: any[] // Cached generated publications
  }
}

export type PublicationDetailsWidget = WidgetBase & {
  type: 'publication-details'
  contentSource: 'doi' | 'ai-generated' | 'schema-objects' | 'context'
  publication: any // JSON-LD Publication object
  cardConfig: PublicationCardConfig
  cardVariantId?: string // Reference to saved variant
  layout: 'default' | 'compact' | 'hero' | 'sidebar'
  align?: 'left' | 'center' | 'right'
  // Source-specific configuration
  doiSource?: {
    doi: string // Specific DOI to fetch
  }
  schemaSource?: {
    selectedId: string // Single schema object ID
  }
  // AI generation configuration
  aiSource?: {
    prompt: string // Natural language prompt for AI generation
    lastGenerated?: Date // Timestamp of last generation
    generatedContent?: any // Cached generated publication
  }
}

// Reusable icon configuration for widgets
export type WidgetIcon = {
  enabled?: boolean;
  position?: 'left' | 'right';
  emoji?: string;
}

export type ButtonWidget = WidgetBase & {
  type: 'button'
  text: string
  href: string
  variant: 'primary' | 'secondary' | 'outline' | 'link'
  size: 'small' | 'medium' | 'large'
  target?: '_blank' | '_self'
  icon?: WidgetIcon
  align?: 'left' | 'center' | 'right'
}

// Menu widget types
export type MenuItem = {
  id: string
  label: string // Can include template variables like {{journal.name}}
  url: string
  target: '_self' | '_blank' | '_parent' | '_top'
  displayCondition?: 'always' | 'if-issue-exists' | 'if-has-archive' | 'if-journal-context'
  isContextGenerated?: boolean // True if auto-populated by context
  order: number
  children?: MenuItem[] // For hierarchical nesting (future)
}

export type MenuWidget = WidgetBase & {
  type: 'menu'
  menuType: 'global' | 'context-aware' | 'custom'
  contextSource?: 'journal' | 'book' | 'conference' // When menuType is 'context-aware'
  style: 'horizontal' | 'vertical' | 'dropdown' | 'footer-links'
  items: MenuItem[]
  align?: 'left' | 'center' | 'right'
}

export type Widget = TextWidget | ImageWidget | NavbarWidget | HTMLWidget | CodeWidget | HeadingWidget | ButtonWidget | PublicationListWidget | PublicationDetailsWidget | MenuWidget

// Layout types for widget sections
export type ContentBlockLayout = 'flexible' | 'one-column' | 'two-columns' | 'three-columns' | 'one-third-left' | 'one-third-right' | 'vertical' | 'hero-with-buttons' | 'header-plus-grid'

export type LayoutArea = {
  id: string
  name: string
  widgets: Widget[]
}

export type WidgetSection = {
  id: string
  name: string
  type: string
  layout: ContentBlockLayout
  areas: LayoutArea[]
  
  // Background configuration
  background?: {
    type: 'color' | 'image' | 'gradient' | 'none'
    color?: string // Hex color for solid background
    image?: {
      url: string
      position: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'cover' | 'contain'
      repeat: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y'
      size: 'cover' | 'contain' | 'auto' | string
    }
    gradient?: {
      type: 'linear' | 'radial'
      direction?: string // e.g., 'to right', '45deg'
      stops: Array<{ color: string; position: string }> // e.g., [{ color: '#ff0000', position: '0%' }]
    }
    opacity?: number // 0-1 for background opacity
  }
  
  // Section styling configuration
  styling?: {
    paddingTop?: 'none' | 'small' | 'medium' | 'large'
    paddingBottom?: 'none' | 'small' | 'medium' | 'large'
    paddingLeft?: 'none' | 'small' | 'medium' | 'large'
    paddingRight?: 'none' | 'small' | 'medium' | 'large'
    gap?: 'none' | 'small' | 'medium' | 'large'
    variant?: 'default' | 'full-width' | 'contained' | 'wide'
    textColor?: 'default' | 'white' | 'dark' | 'muted'
    border?: {
      enabled: boolean
      color?: 'default' | 'primary' | 'accent' | 'success' | 'warning' | 'error'
      width?: 'thin' | 'medium' | 'thick'
      style?: 'solid' | 'dashed' | 'dotted'
      position?: 'top' | 'bottom' | 'left' | 'right' | 'all'
    }
    shadow?: 'none' | 'small' | 'medium' | 'large'
    maxWidth?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | '7xl'
    centerContent?: boolean
  }
  
  // Section behavior configuration
  behavior?: 'auto' | 'full-width' // Controls content width behavior
  
  // Content mode (text color adaptation)
  contentMode?: 'light' | 'dark' // Light = dark text (light bg), Dark = white text (dark bg)
  
      // Sidebar-specific properties (only when type === 'sidebar')
      sidebar?: {
        position: 'left' | 'right'
        span: number // How many subsequent sections to span
        width: string // '300px' | '25%' | '33%'
        sticky: boolean // Stick to viewport or scroll with content
        mobileBehavior: 'below' | 'hidden' | 'drawer' // Mobile display behavior
        gap: 'none' | 'small' | 'medium' | 'large' // Gap between sidebar and sections
      }
}

// Canvas item can be either an individual widget or a section
export type CanvasItem = Widget | WidgetSection

// Type guard to check if item is a section
export function isSection(item: CanvasItem): item is WidgetSection {
  return 'areas' in item && Array.isArray((item as WidgetSection).areas)
}

export type CustomSection = {
  id: string
  name: string
  description?: string
  widgets: Widget[]  // Keep this for metadata/counting (legacy)
  section?: WidgetSection  // Full section structure for reconstruction (legacy)
  canvasItems?: CanvasItem[]  // Full canvas items for reconstruction (new approach)
  createdAt: Date
}

export type PublicationCardVariant = {
  id: string
  name: string
  description?: string
  config: PublicationCardConfig
  createdAt: Date
}
