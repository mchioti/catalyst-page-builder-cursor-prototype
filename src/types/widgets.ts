// Widget types for the page builder system

export type Skin = 'minimal' | 'modern' | 'classic' | 'accent' | 'hero' | 'journal' | 'primary' | 'dark' | 'muted' | 'center' | 'footer' | 'compact' | 'raw'

export type WidgetBase = {
  id: string
  type: string
  skin: Skin
  sectionId?: string
}

export type TextWidget = WidgetBase & { type: 'text'; text: string; align?: 'left'|'center'|'right' }
export type ImageWidget = WidgetBase & { type: 'image'; src: string; alt: string; ratio?: string }
export type NavbarWidget = WidgetBase & { type: 'navbar'; links: Array<{ label: string; href: string }> }
export type HTMLWidget = WidgetBase & { type: 'html'; htmlContent: string; title?: string }
export type HeadingWidget = WidgetBase & { type: 'heading'; text: string; level: 1 | 2 | 3 | 4 | 5 | 6; align?: 'left'|'center'|'right' }
export type ButtonWidget = WidgetBase & { 
  type: 'button'; 
  text: string; 
  variant: 'solid' | 'outline' | 'ghost';
  size: 'small' | 'medium' | 'large';
  url?: string;
  onClick?: string;
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

export type Widget = TextWidget | ImageWidget | NavbarWidget | HTMLWidget | HeadingWidget | ButtonWidget | PublicationListWidget | PublicationDetailsWidget

// Layout types for widget sections
export type ContentBlockLayout = 'flexible' | 'one-column' | 'two-columns' | 'three-columns' | 'one-third-left' | 'one-third-right' | 'vertical'

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
  widgets: Widget[]  // Keep this simple for now - CustomSections still use flat widget lists
  createdAt: Date
}

export type PublicationCardVariant = {
  id: string
  name: string
  description?: string
  config: PublicationCardConfig
  createdAt: Date
}
