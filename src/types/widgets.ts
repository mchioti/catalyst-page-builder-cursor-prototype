// Widget types for the page builder system

export type Skin = 'minimal' | 'modern' | 'classic' | 'accent'

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
}

export type Widget = TextWidget | ImageWidget | NavbarWidget | HTMLWidget | HeadingWidget | PublicationListWidget

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
