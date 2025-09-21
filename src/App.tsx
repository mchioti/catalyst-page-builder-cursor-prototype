import { useMemo, useState, useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import React from 'react'
import { DndContext, closestCenter, closestCorners, rectIntersection, PointerSensor, useSensor, useSensors, useDroppable, useDraggable } from '@dnd-kit/core'
import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, ChevronDown, Code, Lightbulb, Building2, Info, BookOpen, Settings, X, Plus, Check, Home, Palette, FileText, Globe, Users, Cog, ArrowLeft, Copy, Trash2, Edit } from 'lucide-react'
import { ThemeEditor } from './components/SiteManager/ThemeEditor'
import { PublicationCards } from './components/SiteManager/PublicationCards'
import { SiteManagerTemplates } from './components/SiteManager/SiteManagerTemplates'
import { create } from 'zustand'
import { LIBRARY_CONFIG, type LibraryItem as SpecItem, type LibraryCategory as SpecCategory } from './library'

// Pre-fabricated sections templates based on AXP 2.0 specifications
const PREFAB_SECTIONS = {
  // Global Sections (site-wide persistent elements)
  'global-header': {
    id: 'global-header',
    name: 'Global Header',
    category: 'global',
    layout: 'single-column',
    areas: [{
      id: 'header-content',
      maxWidgets: 3,
      widgets: []
    }]
  },
  
  // Content Sections (page-specific layout patterns)
  'header-section': {
    id: 'header-section', 
    name: 'Header',
    category: 'content',
    layout: 'single-column',
    areas: [{
      id: 'header-area',
      maxWidgets: 5,
      widgets: [{
        id: 'nav-widget-1',
        type: 'navbar',
        content: 'Main Navigation'
      }]
    }]
  },

  'hero-section': {
    id: 'hero-section',
    name: 'Hero',
    category: 'content', 
    layout: 'single-column',
    areas: [{
      id: 'hero-area',
      maxWidgets: 3,
      widgets: [
        {
          id: 'hero-heading-1',
          type: 'heading',
          content: 'Welcome to Our Platform',
          level: 1
        },
        {
          id: 'hero-image-1',
          type: 'image',
          src: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=600&fit=crop',
          alt: 'Modern office space',
          ratio: '16:9',
          objectFit: 'cover'
        }
      ]
    }]
  },

  'features-section': {
    id: 'features-section',
    name: 'Features',
    category: 'content',
    layout: 'three-column',
    areas: [
      {
        id: 'feature-1',
        maxWidgets: 2,
        widgets: [
          {
            id: 'feature-text-1',
            type: 'text',
            content: '<h3>Advanced Analytics</h3><p>Comprehensive insights into your publishing metrics and reader engagement patterns.</p>'
          }
        ]
      },
      {
        id: 'feature-2', 
        maxWidgets: 2,
        widgets: [
          {
            id: 'feature-text-2',
            type: 'text',
            content: '<h3>Global Distribution</h3><p>Reach readers worldwide through our extensive network of publishing partners and platforms.</p>'
          }
        ]
      },
      {
        id: 'feature-3',
        maxWidgets: 2, 
        widgets: [
          {
            id: 'feature-text-3',
            type: 'text',
            content: '<h3>Expert Support</h3><p>24/7 technical support from our team of publishing and technology specialists.</p>'
          }
        ]
      }
    ]
  },

  'footer-section': {
    id: 'footer-section',
    name: 'Footer', 
    category: 'content',
    layout: 'four-column',
    areas: [
      {
        id: 'footer-col-1',
        maxWidgets: 3,
        widgets: [
          {
            id: 'footer-text-1',
            type: 'text',
            content: '<h4>Company</h4><p>Leading the future of academic and professional publishing worldwide.</p>'
          }
        ]
      },
      {
        id: 'footer-col-2',
        maxWidgets: 5,
        widgets: [
          {
            id: 'footer-text-2', 
            type: 'text',
            content: '<h4>Quick Links</h4><ul><li><a href="/about">About Us</a></li><li><a href="/contact">Contact</a></li><li><a href="/careers">Careers</a></li></ul>'
          }
        ]
      },
      {
        id: 'footer-col-3',
        maxWidgets: 5,
        widgets: [
          {
            id: 'footer-text-3',
            type: 'text', 
            content: '<h4>Resources</h4><ul><li><a href="/help">Help Center</a></li><li><a href="/api">API Docs</a></li><li><a href="/blog">Blog</a></li></ul>'
          }
        ]
      },
      {
        id: 'footer-col-4',
        maxWidgets: 3,
        widgets: [
          {
            id: 'footer-text-4',
            type: 'text',
            content: '<h4>Follow Us</h4><p>Stay connected through our social media channels and newsletter.</p>'
          }
        ]
      }
    ]
  }
} as const

// Main app routing types
type AppView = 'page-builder' | 'site-manager'
type SiteManagerView = 'overview' | 'themes' | 'theme-editor' | 'templates' | 'websites' | 'users' | 'settings'

// Template System Types
type TemplateCategory = 'website' | 'publication' | 'supporting' | 'theme'

type TemplateStatus = 'active' | 'draft' | 'archived' | 'deprecated'

type Override = {
  path: string // e.g., "header.logo.src", "footer.styles.backgroundColor"
  originalValue: any
  overriddenValue: any
  overriddenAt: 'website' | 'page'
  overriddenBy: string // user ID or system
  timestamp: Date
  reason?: string
}

type BaseTemplate = {
  id: string
  name: string
  description: string
  category: TemplateCategory
  status: TemplateStatus
  version: string
  author: string
  createdAt: Date
  updatedAt: Date
  tags: string[]
  thumbnail?: string
  
  // Template structure
  sections: WidgetSection[]
  layout: {
    header: boolean
    footer: boolean
    sidebar: 'none' | 'left' | 'right' | 'both'
    maxWidth?: string
    spacing?: string
  }
  
  // Override settings (from spec)
  allowedOverrides: string[] // paths that can be customized
  lockedElements: string[] // paths that cannot be modified
  // Override scope options from the spec
  defaultOverrideScope: string // Default scope when making changes
  broadenOverrideOptions: string[] // Available broader scope options
  narrowOverrideOptions: string[] // Available narrower scope options
}

type Website = {
  id: string
  name: string
  domain: string
  themeId: string // References Theme.id (websites inherit from themes, not individual templates)
  status: 'active' | 'staging' | 'maintenance'
  createdAt: Date
  updatedAt: Date
  
  // Customizations from base theme
  overrides: Override[]
  customSections: WidgetSection[]
  
  // Website-specific settings (override theme defaults)
  branding: {
    primaryColor?: string
    secondaryColor?: string
    logoUrl?: string
    fontFamily?: string
  }
  
  // Analytics
  deviationScore: number // 0-100, how much it differs from theme
  lastThemeSync?: Date
}

type Theme = {
  id: string
  name: string
  description: string
  version: string
  publishingType: 'journals' | 'books' | 'journals-books' | 'blog' | 'corporate' | 'mixed'
  author: string
  createdAt: Date
  updatedAt: Date
  
  // Complete template package for this publishing type
  templates: BaseTemplate[] // All templates included in this theme
  
  // Global styling that applies across all templates
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
    muted: string
  }
  
  typography: {
    headingFont: string
    bodyFont: string
    baseSize: string
    scale: number
  }
  
  spacing: {
    base: string
    scale: number
  }
  
  components: {
    button: Record<string, any>
    card: Record<string, any>
    form: Record<string, any>
  }
  
  // Global sections
  globalSections: {
    header: WidgetSection
    footer: WidgetSection
  }
  
  // Publication card variants for this theme
  publicationCardVariants: PublicationCardVariant[]
}

// Widget types
type Skin = 'minimal' | 'modern' | 'classic' | 'accent'

type WidgetBase = {
  id: string
  type: string
  skin: Skin
  sectionId?: string
}

type TextWidget = WidgetBase & { type: 'text'; text: string; align?: 'left'|'center'|'right' }
type ImageWidget = WidgetBase & { type: 'image'; src: string; alt: string; ratio?: string }
type NavbarWidget = WidgetBase & { type: 'navbar'; links: Array<{ label: string; href: string }> }
type HTMLWidget = WidgetBase & { type: 'html'; htmlContent: string; title?: string }
type HeadingWidget = WidgetBase & { type: 'heading'; text: string; level: 1 | 2 | 3 | 4 | 5 | 6; align?: 'left'|'center'|'right' }

// Publication Card configuration types
type PublicationCardConfig = {
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

type PublicationListWidget = WidgetBase & { 
  type: 'publication-list'
  contentSource: 'dynamic-query' | 'doi-list' | 'ai-generated'
  publications: any[] // JSON-LD ScholarlyArticle array
  cardConfig: PublicationCardConfig
  cardVariantId?: string // Reference to saved variant
  layout: 'list' | 'grid' | 'featured'
  maxItems?: number
}

type Widget = TextWidget | ImageWidget | NavbarWidget | HTMLWidget | HeadingWidget | PublicationListWidget

// Mock ScholarlyArticle JSON-LD data for testing
const MOCK_SCHOLARLY_ARTICLES = [
  {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    "headline": "Is It Possible to Truly Understand Performance in LLMs?",
    "alternativeHeadline": "A Deep Dive into Evaluation Metrics",
    "author": [
      {
        "@type": "Person",
        "name": "Samuel Greengard",
        "affiliation": {
          "@type": "Organization",
          "name": "MIT Computer Science"
        }
      },
      {
        "@type": "Person", 
        "name": "Elena Rodriguez",
        "affiliation": {
          "@type": "Organization",
          "name": "Stanford AI Lab"
        }
      }
    ],
    "datePublished": "2024-12-02",
    "isPartOf": {
      "@type": "PublicationIssue",
      "issueNumber": "3",
      "isPartOf": {
        "@type": "PublicationVolume",
        "volumeNumber": "5",
        "isPartOf": {
          "@type": "Periodical",
          "name": "Journal of Modern Computing"
        }
      }
    },
    "pageStart": "14",
    "pageEnd": "16",
    "abstract": "This paper investigates the complexities of evaluating large language models, proposing a new framework for comprehensive performance assessment...",
    "identifier": {
      "@type": "PropertyValue",
      "name": "DOI",
      "value": "https://doi.org/10.1145/3695868"
    },
    "accessMode": "FULL_ACCESS",
    "contentType": "Research Article"
  },
  {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle", 
    "headline": "Sustainable Computing: Green Algorithms for the Future",
    "alternativeHeadline": "Environmental Impact of Modern Software Development",
    "author": [
      {
        "@type": "Person",
        "name": "Maria Chen",
        "affiliation": {
          "@type": "Organization",
          "name": "Carnegie Mellon University"
        }
      }
    ],
    "datePublished": "2024-11-28",
    "isPartOf": {
      "@type": "PublicationIssue",
      "issueNumber": "2", 
      "isPartOf": {
        "@type": "PublicationVolume",
        "volumeNumber": "12",
        "isPartOf": {
          "@type": "Periodical",
          "name": "Environmental Computing Quarterly"
        }
      }
    },
    "pageStart": "45",
    "pageEnd": "67",
    "abstract": "As computational demands grow exponentially, the environmental impact of software systems becomes increasingly critical. This research presents novel approaches to green algorithm design...",
    "identifier": {
      "@type": "PropertyValue", 
      "name": "DOI",
      "value": "https://doi.org/10.1145/3695869"
    },
    "accessMode": "OPEN_ACCESS",
    "contentType": "Research Article"
  },
  {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    "headline": "Quantum Machine Learning: Bridging Two Worlds",
    "alternativeHeadline": "Classical and Quantum Approaches to Pattern Recognition",
    "author": [
      {
        "@type": "Person",
        "name": "Dr. Raj Patel",
        "affiliation": {
          "@type": "Organization", 
          "name": "Oxford Quantum Computing Centre"
        }
      },
      {
        "@type": "Person",
        "name": "Sarah Kim",
        "affiliation": {
          "@type": "Organization",
          "name": "IBM Quantum Network"
        }
      }
    ],
    "datePublished": "2024-11-15",
    "isPartOf": {
      "@type": "PublicationIssue",
      "issueNumber": "4",
      "isPartOf": {
        "@type": "PublicationVolume", 
        "volumeNumber": "8",
        "isPartOf": {
          "@type": "Periodical",
          "name": "Quantum Computing Review"
        }
      }
    },
    "pageStart": "112",
    "pageEnd": "134",
    "abstract": "Quantum machine learning represents a convergence of quantum computing and artificial intelligence. This comprehensive review examines current methodologies and future prospects...",
    "identifier": {
      "@type": "PropertyValue",
      "name": "DOI", 
      "value": "https://doi.org/10.1145/3695870"
    },
    "accessMode": "SUBSCRIPTION_REQUIRED",
    "contentType": "Review Article"
  }
]

// Default Publication Card configuration
const DEFAULT_PUBLICATION_CARD_CONFIG: PublicationCardConfig = {
  // Content Identification
  showContentTypeLabel: true,
  showTitle: true,
  showSubtitle: true,
  showThumbnail: true,
  thumbnailPosition: 'top',
  
  // Publication Context
  showPublicationTitle: true,
  showVolumeIssue: true,
  showBookSeriesTitle: false,
  showChapterPages: true,
  showPublicationDate: true,
  showDOI: true,
  showISSN: false,
  showISBN: false,
  
  // Author Information
  showAuthors: true,
  authorStyle: 'full',
  showAffiliations: true,
  
  // Content Summary
  showAbstract: true,
  abstractLength: 'medium',
  showKeywords: true,
  
  // Access & Usage
  showAccessStatus: true,
  showViewDownloadOptions: true,
  showUsageMetrics: true,
  
  // Display Configuration
  titleStyle: 'large'
}

// Canvas item can be either an individual widget or a section
type CanvasItem = Widget | WidgetSection

// Type guard to check if item is a section
function isSection(item: CanvasItem): item is WidgetSection {
  return 'areas' in item && Array.isArray((item as WidgetSection).areas)
}

type CustomSection = {
  id: string
  name: string
  description?: string
  widgets: Widget[]  // Keep this simple for now - CustomSections still use flat widget lists
  createdAt: Date
}

type PublicationCardVariant = {
  id: string
  name: string
  description?: string
  config: PublicationCardConfig
  createdAt: Date
}

type EditingContext = 'template' | 'page' | 'website'

type PageState = {
  // Routing
  currentView: AppView
  siteManagerView: SiteManagerView
  editingContext: EditingContext
  setCurrentView: (view: AppView) => void
  setSiteManagerView: (view: SiteManagerView) => void
  setEditingContext: (context: EditingContext) => void
  
  // Page Builder
  canvasItems: CanvasItem[] // Can contain both individual widgets and sections
  customSections: CustomSection[]
  publicationCardVariants: PublicationCardVariant[]
  selectedWidget: string | null
  insertPosition: { relativeTo: string; position: 'above' | 'below' } | null
  
  // Template System
  templates: BaseTemplate[]
  websites: Website[]
  themes: Theme[]
  
  // Page Builder Actions
  addWidget: (widget: Widget) => void
  addSection: (section: WidgetSection) => void
  moveItem: (fromIndex: number, toIndex: number) => void
  replaceCanvasItems: (items: CanvasItem[]) => void
  selectWidget: (id: string | null) => void
  deleteWidget: (widgetId: string) => void
  addCustomSection: (section: CustomSection) => void
  removeCustomSection: (id: string) => void
  addPublicationCardVariant: (variant: PublicationCardVariant) => void
  removePublicationCardVariant: (id: string) => void
  setInsertPosition: (position: { relativeTo: string; position: 'above' | 'below' } | null) => void
  createContentBlockWithLayout: (layout: ContentBlockLayout) => void
  
  // Template Management
  addTemplate: (template: BaseTemplate) => void
  updateTemplate: (id: string, template: Partial<BaseTemplate>) => void
  removeTemplate: (id: string) => void
  duplicateTemplate: (id: string) => void
  
  // Website Management  
  addWebsite: (website: Website) => void
  updateWebsite: (id: string, website: Partial<Website>) => void
  removeWebsite: (id: string) => void
  
  // Override Management
  addOverride: (websiteId: string, override: Override) => void
  removeOverride: (websiteId: string, overridePath: string) => void
  calculateDeviationScore: (websiteId: string) => number
  
  // Theme Management
  addTheme: (theme: Theme) => void
  updateTheme: (id: string, theme: Partial<Theme>) => void
  removeTheme: (id: string) => void
}

// Layout area for drop zones
type LayoutArea = {
  id: string
  name: string
  widgets: Widget[]
}

// Section system for grouping widgets with layout
type WidgetSection = {
  id: string
  name: string
  type: string
  layout: ContentBlockLayout
  areas: LayoutArea[]
}

type ContentBlockLayout = 'flexible' | 'one-column' | 'two-columns' | 'three-columns' | 'one-third-left' | 'one-third-right' | 'vertical'

// Initial canvas setup with Wiley Online Library sections
const INITIAL_CANVAS_ITEMS: CanvasItem[] = [
  // Header Section
  {
    id: 'header-section',
    name: 'Header',
    type: 'content-block',
    layout: 'one-third-left',
    areas: [
      {
        id: 'header-logo-area',
        name: 'Logo',
        widgets: [
          {
            id: 'wiley-logo',
            type: 'text',
            skin: 'minimal',
            text: 'Wiley',
            align: 'left',
            sectionId: 'header-section',
            isOverridden: true,
            overrideReason: 'Custom Wiley branding'
          }
        ]
      },
      {
        id: 'header-nav-area', 
        name: 'Navigation',
        widgets: [
          {
            id: 'header-nav',
            type: 'navbar',
            skin: 'minimal',
            links: [
              { label: 'Browse', href: '#' },
              { label: 'Search', href: '#' },
              { label: 'Help', href: '#' }
            ],
            sectionId: 'header-section'
          }
        ]
      }
    ]
  },
  // Hero Section
  {
    id: 'hero-section',
    name: 'Hero',
    type: 'content-block',
    layout: 'vertical',
    areas: [
      {
        id: 'hero-image-area',
        name: 'Hero Image',
        widgets: [
          {
            id: 'hero-image',
            type: 'image',
            skin: 'minimal',
            src: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2426&q=80',
            alt: 'Library books',
            ratio: '16:9',
            sectionId: 'hero-section'
          }
        ]
      },
      {
        id: 'hero-text-area',
        name: 'Hero Text',
        widgets: [
          {
            id: 'hero-text',
            type: 'text',
            skin: 'minimal',
            text: 'Wiley Online Library\nAdvancing knowledge and research worldwide',
            align: 'center',
            sectionId: 'hero-section',
            isOverridden: true,
            overrideReason: 'Custom Wiley messaging and tagline'
          }
        ]
      }
    ]
  },
  // Features Section
  {
    id: 'features-section',
    name: 'Features',
    type: 'content-block',
    layout: 'three-columns',
    areas: [
      {
        id: 'journals-area',
        name: 'Journals',
        widgets: [
          {
            id: 'journals-text',
            type: 'text',
            skin: 'minimal',
            text: 'Journals\nBrowse thousands of journals across disciplines',
            align: 'center',
            sectionId: 'features-section'
          }
        ]
      },
      {
        id: 'books-area',
        name: 'Books', 
        widgets: [
          {
            id: 'books-text',
            type: 'text',
            skin: 'minimal',
            text: 'Books\nAccess books and reference works',
            align: 'center',
            sectionId: 'features-section'
          }
        ]
      },
      {
        id: 'topics-area',
        name: 'Topics',
        widgets: [
          {
            id: 'topics-text',
            type: 'text',
            skin: 'minimal',
            text: 'Topics\nExplore research by topic',
            align: 'center',
            sectionId: 'features-section'
          }
        ]
      }
    ]
  },
  // Footer Section
  {
    id: 'footer-section',
    name: 'Footer',
    type: 'content-block',
    layout: 'one-column',
    areas: [
      {
        id: 'footer-text-area',
        name: 'Footer Text',
        widgets: [
          {
            id: 'footer-text',
            type: 'text',
            skin: 'minimal',
            text: '© 2025 Wiley',
            align: 'left',
            sectionId: 'footer-section'
          }
        ]
      }
    ]
  }
]

// Publication Card component
function PublicationCard({ article, config }: { article: any, config: PublicationCardConfig }) {
  const getAccessStatusBadge = (accessMode: string) => {
    switch (accessMode) {
      case 'FULL_ACCESS':
        return <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium">FULL ACCESS</span>
      case 'OPEN_ACCESS':
        return <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">OPEN ACCESS</span>
      case 'SUBSCRIPTION_REQUIRED':
        return <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded font-medium">SUBSCRIPTION</span>
      default:
        return null
    }
  }

  const formatAuthors = (authors: any[]) => {
    if (!authors || authors.length === 0) return ''
    if (authors.length === 1) return authors[0].name
    if (authors.length === 2) return `${authors[0].name} and ${authors[1].name}`
    return `${authors[0].name}, et al.`
  }

  const formatPublicationInfo = (article: any) => {
    const parts = []
    if (article.isPartOf?.isPartOf?.isPartOf?.name) {
      parts.push(article.isPartOf.isPartOf.isPartOf.name)
    }
    if (config.showVolumeIssue && article.isPartOf?.isPartOf?.volumeNumber) {
      parts.push(`Vol. ${article.isPartOf.isPartOf.volumeNumber}`)
    }
    if (config.showVolumeIssue && article.isPartOf?.issueNumber) {
      parts.push(`Issue ${article.isPartOf.issueNumber}`)
    }
    if (config.showChapterPages && article.pageStart && article.pageEnd) {
      parts.push(`pp. ${article.pageStart}-${article.pageEnd}`)
    }
    return parts.join(', ')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: '2-digit' 
    })
  }

  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white hover:shadow-md transition-shadow">
      {/* Header with type label and access status */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {config.showContentTypeLabel && article.contentType && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
              {article.contentType}
            </span>
          )}
          {config.showAccessStatus && (
            getAccessStatusBadge(article.accessMode)
          )}
        </div>
      </div>

      {/* Article/Chapter Title */}
      {config.showTitle && (
        <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-tight">
          {article.headline}
        </h3>
      )}
      
      {/* Subtitle */}
      {config.showSubtitle && article.alternativeHeadline && (
        <p className="text-blue-600 text-sm font-medium mb-3">
          {article.alternativeHeadline}
        </p>
      )}

      {/* Authors */}
      {config.showAuthors && article.author && (
        <p className="text-gray-700 text-sm mb-2">
          {formatAuthors(article.author)}
        </p>
      )}

      {/* Publication Information (Journal/Book Title) */}
      {config.showPublicationTitle && (
        <p className="text-gray-600 text-sm mb-3">
          {formatPublicationInfo(article)}
        </p>
      )}

      {/* Publication Date */}
      {config.showPublicationDate && article.datePublished && (
        <p className="text-gray-500 text-sm mb-4">
          Published: {formatDate(article.datePublished)}
        </p>
      )}

      {/* Abstract */}
      {config.showAbstract && article.abstract && (
        <p className="text-gray-700 text-sm mb-4 leading-relaxed">
          {article.abstract.length > 150 ? `${article.abstract.substring(0, 150)}...` : article.abstract}
        </p>
      )}

      {/* Action buttons and DOI */}
      <div className="flex flex-col gap-3">
        {config.showViewDownloadOptions && (
          <div className="flex gap-2">
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Abstract
            </button>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Full Text
            </button>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              PDF
            </button>
          </div>
        )}
        
        {config.showDOI && article.identifier?.value && (
          <a 
            href={article.identifier.value} 
            className="text-blue-500 text-xs hover:text-blue-700 break-all"
            target="_blank" 
            rel="noopener noreferrer"
          >
            {article.identifier.value}
          </a>
        )}
      </div>
    </div>
  )
}

function WidgetRenderer({ 
  widget, 
  dragAttributes, 
  dragListeners, 
  onWidgetClick,
  activeSectionToolbar,
  setActiveSectionToolbar,
  activeWidgetToolbar,
  setActiveWidgetToolbar
}: {
  widget: Widget
  dragAttributes?: any
  dragListeners?: any
  onWidgetClick?: (id: string, e: React.MouseEvent) => void
  activeSectionToolbar?: string | null
  setActiveSectionToolbar?: (value: string | null) => void
  activeWidgetToolbar?: string | null
  setActiveWidgetToolbar?: (value: string | null) => void
}) {
  const canvasItems = usePageStore((s) => s.canvasItems)
  const replaceCanvasItems = usePageStore((s) => s.replaceCanvasItems)
  
  // For standalone widgets, wrap with action toolbar
  const renderWithToolbar = (content: JSX.Element) => {
    if (!dragAttributes || !dragListeners || !onWidgetClick || !setActiveSectionToolbar || !setActiveWidgetToolbar) {
      return content // No toolbar for widgets within sections
    }
    
    return (
      <div 
        onClick={(e) => {
          e.stopPropagation()
          // Close any section toolbar and toggle widget toolbar
          setActiveSectionToolbar?.(null)
          setActiveWidgetToolbar(activeWidgetToolbar === widget.id ? null : widget.id)
          onWidgetClick(widget.id, e)
        }}
        className="cursor-pointer hover:ring-2 hover:ring-blue-300 rounded transition-all relative"
      >
        {/* Standalone Widget Action Toolbar - appears on click */}
        {activeWidgetToolbar === widget.id && (
          <div className="absolute -top-2 -right-2 transition-opacity z-20">
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg shadow-lg px-2 py-1">
              <div 
                {...dragAttributes}
                {...dragListeners}
                className="p-1 text-gray-500 hover:text-gray-700 cursor-grab active:cursor-grabbing rounded hover:bg-gray-100 transition-colors"
                title="Drag to reorder"
              >
                <GripVertical className="w-3 h-3" />
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  // Duplicate standalone widget
                  const { replaceCanvasItems, canvasItems } = usePageStore.getState()
                  const itemIndex = canvasItems.findIndex(canvasItem => canvasItem.id === widget.id)
                  if (itemIndex !== -1) {
                    const duplicatedWidget = { ...widget, id: crypto.randomUUID() }
                    const newCanvasItems = [...canvasItems]
                    newCanvasItems.splice(itemIndex + 1, 0, duplicatedWidget)
                    replaceCanvasItems(newCanvasItems)
                  }
                }}
                className="p-1 text-gray-500 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors"
                title="Duplicate widget"
              >
                <Copy className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onWidgetClick(widget.id, e)
                }}
                className="p-1 text-gray-500 hover:text-purple-600 rounded hover:bg-purple-50 transition-colors"
                title="Properties"
              >
                <Edit className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  const { deleteWidget } = usePageStore.getState()
                  deleteWidget(widget.id)
                }}
                className="p-1 text-gray-500 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                title="Delete widget"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
        {content}
      </div>
    )
  }
  
  switch (widget.type) {
    case 'navbar': {
      const isHeaderNavbar = widget.id === 'header-nav'
      
      if (isHeaderNavbar) {
        // Special styling for header navigation - align right within the header area
      return (
        <SkinWrap skin={widget.skin}>
            <div className="flex items-center justify-end px-6 py-3">
            <nav className="flex gap-6 text-sm">
                {widget.links.map((l, index) => (
                  <a key={`${l.label}-${index}`} className="text-gray-700 hover:text-blue-800 font-medium" href={l.href}>{l.label}</a>
              ))}
            </nav>
          </div>
        </SkinWrap>
      )
      }
      
      return (
        <SkinWrap skin={widget.skin}>
          <div className="flex items-center justify-center px-6 py-3">
            <nav className="flex gap-6 text-sm">
              {widget.links.map((l, index) => (
                <a key={`${l.label}-${index}`} className="text-gray-700 hover:text-blue-800 font-medium" href={l.href}>{l.label}</a>
              ))}
            </nav>
          </div>
        </SkinWrap>
      )
    }
    case 'heading': {
      const headingWidget = widget as HeadingWidget
      const align = headingWidget.align ?? 'left'
      const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left'
      
      const HeadingComponent = ({ children, ...props }: any) => {
        switch (headingWidget.level) {
          case 1: return <h1 {...props}>{children}</h1>
          case 2: return <h2 {...props}>{children}</h2>
          case 3: return <h3 {...props}>{children}</h3>
          case 4: return <h4 {...props}>{children}</h4>
          case 5: return <h5 {...props}>{children}</h5>
          case 6: return <h6 {...props}>{children}</h6>
          default: return <h2 {...props}>{children}</h2>
        }
      }
      
      return (
        <SkinWrap skin={widget.skin}>
          <div className={`px-6 py-4 ${alignClass}`}>
            <HeadingComponent
              className={`font-bold text-gray-900 ${
                headingWidget.level === 1 ? 'text-3xl' :
                headingWidget.level === 2 ? 'text-2xl' :
                headingWidget.level === 3 ? 'text-xl' :
                headingWidget.level === 4 ? 'text-lg' :
                headingWidget.level === 5 ? 'text-base' :
                'text-sm'
              }`}
              contentEditable={true}
              suppressContentEditableWarning={true}
              onBlur={(e: React.FocusEvent<HTMLHeadingElement>) => {
                const newText = e.currentTarget.textContent || ''
                if (newText !== headingWidget.text) {
                  const updatedCanvasItems = canvasItems.map(item => {
                    if (isSection(item)) {
                      return {
                        ...item,
                        areas: item.areas.map(area => ({
                          ...area,
                          widgets: area.widgets.map(w => 
                            w.id === widget.id ? { ...w, text: newText } : w
                          )
                        }))
                      }
                    } else {
                      return item.id === widget.id ? { ...item, text: newText } : item
                    }
                  })
                  replaceCanvasItems(updatedCanvasItems as CanvasItem[])
                }
              }}
            >
              {headingWidget.text}
            </HeadingComponent>
          </div>
        </SkinWrap>
      )
    }
    
    case 'text': {
      const align = widget.align ?? 'left'
      const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left'
      const isWileyLogo = widget.id === 'wiley-logo'
      const isHeroText = widget.id === 'hero-text'
      const isFooterText = widget.id === 'footer-text'
      const isFeatureText = widget.sectionId === 'features-section'
      
      if (isWileyLogo) {
        // Special styling for Wiley logo - styled text widget with theme colors
        return (
          <SkinWrap skin={widget.skin}>
            <div className="flex items-center px-6 py-4">
              <h1 style={{
                fontSize: `calc(var(--theme-base-size, 16px) * 1.25)`,
                fontFamily: 'var(--theme-heading-font, Inter, sans-serif)',
                color: 'var(--theme-color-primary, #1e40af)',
                fontWeight: 'bold'
              }}>
                {widget.text || 'Wiley'}
              </h1>
            </div>
          </SkinWrap>
        )
      }
      
      if (isHeroText) {
        // Special styling for hero text - large title with theme-aware colors
        const lines = widget.text.split('\n').filter(line => line.trim())
        const title = lines[0] || 'Wiley Online Library'
        const subtitle = lines.slice(1).join(' ') || 'The world\'s research at your fingertips'
        
        return (
          <SkinWrap skin={widget.skin}>
            <div className="relative">
              <div 
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(to right, var(--theme-color-primary, #1e40af), var(--theme-color-accent, #0ea5e9))`
                }}
              ></div>
              <div className="relative px-6 py-12 text-center">
                <h1 style={{
                  fontSize: `calc(var(--theme-base-size, 16px) * ${Math.pow(1.2, 3)})`,
                  fontFamily: 'var(--theme-heading-font, Inter, sans-serif)',
                  color: 'white',
                  fontWeight: 'bold',
                  marginBottom: '1rem'
                }}>
                  {title}
                </h1>
                <p style={{
                  fontSize: `calc(var(--theme-base-size, 16px) * 1.25)`,
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontFamily: 'var(--theme-body-font, Inter, sans-serif)'
                }}>
                  {subtitle}
                </p>
              </div>
            </div>
          </SkinWrap>
        )
      }
      
      if (isFooterText) {
        // Special styling for footer text - white background like original footer
        return (
          <SkinWrap skin={widget.skin}>
            <div className="bg-white px-6 py-6 border-t border-gray-200">
              <div className={`text-gray-600 ${alignClass}`}>
                {widget.text}
              </div>
            </div>
          </SkinWrap>
        )
      }
      
      if (isFeatureText) {
        // Special styling for feature cards - title and description with theme colors
        const lines = widget.text.split('\n').filter(line => line.trim())
        const title = lines[0] || ''
        const description = lines.slice(1).join(' ') || ''
        
        return (
          <SkinWrap skin={widget.skin}>
            <div 
              className="p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center"
              style={{ backgroundColor: 'var(--theme-color-background, white)' }}
            >
              <h3 style={{
                fontSize: `calc(var(--theme-base-size, 16px) * 1.125)`,
                fontFamily: 'var(--theme-heading-font, Inter, sans-serif)',
                color: 'var(--theme-color-primary, #1e40af)',
                fontWeight: '600',
                marginBottom: '0.75rem'
              }}>
                {title}
              </h3>
              {description && (
                <p style={{
                  color: 'var(--theme-color-muted, #6B7280)',
                  fontSize: `calc(var(--theme-base-size, 16px) * 0.875)`,
                  fontFamily: 'var(--theme-body-font, Inter, sans-serif)',
                  lineHeight: '1.6'
                }}>
                  {description}
                </p>
              )}
            </div>
          </SkinWrap>
        )
      }
      
      return (
        <SkinWrap skin={widget.skin}>
          <div className={`px-6 py-4 ${alignClass}`}>
            <p style={{ 
              color: 'var(--theme-color-text, #374151)',
              fontFamily: 'var(--theme-body-font, Inter, sans-serif)',
              fontSize: 'var(--theme-base-size, 16px)'
            }}>
              {widget.text}
            </p>
          </div>
        </SkinWrap>
      )
    }
    case 'image':
      return (
        <SkinWrap skin={widget.skin}>
          <div className="p-4">
            <img 
              src={widget.src} 
              alt={widget.alt}
              className="w-full rounded"
              style={{ 
                aspectRatio: widget.ratio || 'auto',
                objectFit: 'cover',
                height: widget.ratio === '16:9' ? '300px' : 'auto'
              }}
            />
          </div>
        </SkinWrap>
      )
    case 'html':
      return (
        <>
          {widget.htmlContent ? (
            <iframe
              srcDoc={`
                <style>
                  body { margin: 0; padding: 0; font-family: system-ui, sans-serif; }
                  * { box-sizing: border-box; }
                </style>
                ${widget.htmlContent}
              `}
              className="w-full border-0 block"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-pointer-lock allow-modals"
              title="HTML Widget Content"
              style={{ 
                height: 'auto', 
                minHeight: '200px', 
                width: '100%',
                display: 'block',
                margin: 0,
                padding: 0
              }}
              onLoad={(e) => {
                // Simplified auto-resize to avoid state conflicts
                const iframe = e.target as HTMLIFrameElement;
                try {
                  setTimeout(() => {
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                    if (iframeDoc && iframeDoc.body) {
                      const height = Math.max(iframeDoc.body.scrollHeight, 300);
                      iframe.style.height = height + 'px';
                    }
                  }, 200);
                } catch (err) {
                  iframe.style.height = '400px';
                }
              }}
            />
          ) : (
            // When no content, show placeholder with banner in SkinWrap
        <SkinWrap skin={widget.skin}>
              <div className="px-6 py-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">HTML Widget</span>
                </div>
                <div className="w-full min-h-[200px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                  <div className="text-center text-gray-600 px-4">
                    <div className="text-sm">
                      Select this widget and use the properties panel to upload your HTML file.
                    </div>
                  </div>
                </div>
          </div>
        </SkinWrap>
          )}
        </>
      )
      
    case 'publication-list':
      const publicationWidget = widget as PublicationListWidget
      const displayedPublications = publicationWidget.maxItems 
        ? publicationWidget.publications.slice(0, publicationWidget.maxItems)
        : publicationWidget.publications

      return (
        <SkinWrap skin={widget.skin}>
          <div className="space-y-6">
            {/* Publication list */}
            <div className={`${
              publicationWidget.layout === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 gap-6' 
                : 'space-y-6'
            }`}>
              {displayedPublications.map((article: any, index: number) => (
                <PublicationCard
                  key={`${widget.id}-${index}`}
                  article={article}
                  config={publicationWidget.cardConfig}
                />
              ))}
            </div>

            {/* Show more indicator if there are more articles */}
            {publicationWidget.maxItems && publicationWidget.publications.length > publicationWidget.maxItems && (
              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Showing {publicationWidget.maxItems} of {publicationWidget.publications.length} publications
                </p>
              </div>
            )}
          </div>
        </SkinWrap>
      )
      
    default:
      return (
        <SkinWrap skin={(widget as WidgetBase).skin}>
          <div className="p-4 text-gray-500 text-center">
            {(widget as WidgetBase).type} widget (not implemented)
          </div>
        </SkinWrap>
      )
  }
}

// Helper function to build widgets from library items
function buildWidget(item: SpecItem): Widget {
  const baseWidget = {
    id: crypto.randomUUID(),
    skin: (item.skin as Skin) || 'minimal'
  };

  switch (item.type) {
    case 'text':
      return {
        ...baseWidget,
        type: 'text',
        text: 'Sample text content',
        align: 'left'
      } as TextWidget;
    
    case 'heading':
      return {
        ...baseWidget,
        type: 'heading',
        text: 'Your Heading Text',
        level: 2,
        align: 'left'
      } as HeadingWidget;
    
    case 'image':
      return {
        ...baseWidget,
        type: 'image',
        src: 'https://via.placeholder.com/400x200',
        alt: 'Sample image',
        ratio: '16:9'
      } as ImageWidget;
    
    case 'navbar':
      return {
        ...baseWidget,
        type: 'navbar',
        links: [
          { label: 'Home', href: '#' },
          { label: 'About', href: '#' },
          { label: 'Contact', href: '#' }
        ]
      } as NavbarWidget;
    
    case 'html-block':
      return {
        ...baseWidget,
        type: 'html',
        title: 'HTML Widget',
        htmlContent: ''
      } as HTMLWidget;
    
    case 'publication-list':
      return {
        ...baseWidget,
        type: 'publication-list',
        contentSource: 'dynamic-query',
        publications: MOCK_SCHOLARLY_ARTICLES,
        cardConfig: DEFAULT_PUBLICATION_CARD_CONFIG,
        cardVariantId: 'compact-variant',
        layout: 'list',
        maxItems: 6
      } as PublicationListWidget;
    
    
    default:
      // Fallback to text widget
      return {
        ...baseWidget,
        type: 'text',
        text: `${item.label} widget (not implemented)`,
        align: 'left'
      } as TextWidget;
  }
}

const usePageStore = create<PageState>((set, get) => ({
  // Routing  
  currentView: 'page-builder',
  siteManagerView: 'overview',
  editingContext: 'page', // 'template' | 'page' | 'website'
  setCurrentView: (view) => set({ currentView: view }),
  setSiteManagerView: (view) => set({ siteManagerView: view }),
  setEditingContext: (context) => set({ editingContext: context }),
  
  // Page Builder
  canvasItems: INITIAL_CANVAS_ITEMS,
  customSections: [],
  // Template System Data
  // Templates are now organized within themes instead of standalone
  templates: [],
  
  websites: [
    {
      id: 'wiley-main',
      name: 'Wiley Online Library',
      domain: 'https://onlinelibrary.wiley.com/',
      themeId: 'academic-publishing-theme',
      status: 'active' as const,
      createdAt: new Date('2024-06-01'),
      updatedAt: new Date('2024-09-15'),
      overrides: [
        {
          path: 'branding.logo.src',
          originalValue: '/default-logo.svg',
          overriddenValue: '/wiley-logo.svg',
          overriddenAt: 'website',
          overriddenBy: 'admin',
          timestamp: new Date('2024-06-01'),
          reason: 'Brand consistency'
        },
        {
          path: 'colors.primary',
          originalValue: '#1e40af',
          overriddenValue: '#0066cc',
          overriddenAt: 'website',
          overriddenBy: 'admin',
          timestamp: new Date('2024-06-15'),
          reason: 'Match brand guidelines'
        }
      ],
      customSections: [],
      branding: {
        primaryColor: '#0066cc',
        secondaryColor: '#f8f9fa',
        logoUrl: '/wiley-logo.svg',
        fontFamily: 'Inter'
      },
      deviationScore: 15,
      lastThemeSync: new Date('2024-08-01')
    },
    {
      id: 'research-hub',
      name: 'Wiley Research Hub',
      domain: 'research.wiley.com',
      themeId: 'corporate-theme',
      status: 'active' as const,
      createdAt: new Date('2024-07-10'),
      updatedAt: new Date('2024-09-20'),
      overrides: [
        {
          path: 'layout.sidebar',
          originalValue: 'left',
          overriddenValue: 'right',
          overriddenAt: 'website',
          overriddenBy: 'editor',
          timestamp: new Date('2024-07-20'),
          reason: 'Better UX for research content'
        }
      ],
      customSections: [],
      branding: {
        primaryColor: '#7c3aed',
        logoUrl: '/research-logo.svg'
      },
      deviationScore: 8,
      lastThemeSync: new Date('2024-09-01')
    },
    {
      id: 'journal-of-science',
      name: 'Journal of Advanced Science',
      domain: 'advancedscience.wiley.com',
      themeId: 'academic-publishing-theme',
      status: 'active' as const,
      createdAt: new Date('2024-08-15'),
      updatedAt: new Date('2024-09-25'),
      overrides: [
        {
          path: 'colors.accent',
          originalValue: '#10b981',
          overriddenValue: '#dc2626',
          overriddenAt: 'website',
          overriddenBy: 'editorial-team',
          timestamp: new Date('2024-08-20'),
          reason: 'Match journal brand colors'
        },
        {
          path: 'layout.hero.showFeaturedArticle',
          originalValue: 'false',
          overriddenValue: 'true',
          overriddenAt: 'website',
          overriddenBy: 'editorial-team',
          timestamp: new Date('2024-08-25'),
          reason: 'Highlight latest research'
        }
      ],
      customSections: [],
      branding: {
        primaryColor: '#dc2626',
        secondaryColor: '#f3f4f6',
        logoUrl: '/jas-logo.svg',
        fontFamily: 'Source Serif Pro'
      },
      deviationScore: 22,
      lastThemeSync: new Date('2024-09-10')
    }
  ] as Website[],
  
  themes: [
    {
      id: 'academic-publishing-theme',
      name: 'Academic Publishing Theme',
      description: 'Complete theme for academic journals with templates for articles, journals, and research content',
      version: '2.0.0',
      publishingType: 'journals' as const,
      author: 'Wiley Design Team',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-09-15'),
      
      // Complete template package for academic publishing
      templates: [
        {
          id: 'journal-home',
          name: 'Journal Home',
          description: 'Homepage template for individual journals with issue listings and journal information',
          category: 'publication' as TemplateCategory,
          status: 'active' as TemplateStatus,
          version: '1.8.0',
          author: 'Wiley Publishing Team',
          createdAt: new Date('2024-02-10'),
          updatedAt: new Date('2024-09-01'),
          tags: ['journal', 'homepage', 'issues', 'metadata'],
          sections: [],
          layout: {
            header: true,
            footer: true,
            sidebar: 'right',
            maxWidth: '1200px',
            spacing: 'comfortable'
          },
          allowedOverrides: ['branding.logo', 'colors.primary'],
          lockedElements: ['structure.main', 'navigation.primary'],
          defaultOverrideScope: 'Publication (this or all journals)',
          broadenOverrideOptions: ['Website (this or all websites that inherit the same theme)'],
          narrowOverrideOptions: ['Publication (this or all journals)', 'Topic (all topics or specific)']
        },
        {
          id: 'article-page',
          name: 'Article Page',
          description: 'Individual article display template with full content, metadata, and related articles',
          category: 'publication' as TemplateCategory,
          status: 'active' as TemplateStatus,
          version: '1.9.0',
          author: 'Wiley Publishing Team',
          createdAt: new Date('2024-03-15'),
          updatedAt: new Date('2024-09-18'),
          tags: ['article', 'content', 'metadata', 'related'],
          sections: [],
          layout: {
            header: true,
            footer: true,
            sidebar: 'right',
            maxWidth: '1000px',
            spacing: 'comfortable'
          },
          allowedOverrides: ['typography.bodyFont'],
          lockedElements: ['compliance.*', 'structure.*'],
          defaultOverrideScope: 'Publication (this or all journals)',
          broadenOverrideOptions: ['Website (this or all websites that inherit the same theme)'],
          narrowOverrideOptions: ['Publication (this or all journals)', 'Group type (Current, Ahead of Print, Just Accepted)', 'Topic (all topics or specific)']
        },
        {
          id: 'search-results',
          name: 'Search Results',
          description: 'Template for displaying search results with filters and pagination',
          category: 'website' as TemplateCategory,
          status: 'active' as TemplateStatus,
          version: '1.3.0',
          author: 'Wiley Design Team',
          createdAt: new Date('2024-02-15'),
          updatedAt: new Date('2024-08-20'),
          tags: ['search', 'results', 'filters', 'pagination'],
          sections: [],
          layout: {
            header: true,
            footer: true,
            sidebar: 'left',
            maxWidth: '1400px',
            spacing: 'comfortable'
          },
          allowedOverrides: [],
          lockedElements: [],
          defaultOverrideScope: 'Website (this)',
          broadenOverrideOptions: ['Website (this or all websites that inherit the same theme)'],
          narrowOverrideOptions: []
        }
      ],
      
      colors: {
        primary: '#0066cc',
        secondary: '#6366f1',
        accent: '#10b981',
        background: '#ffffff',
        text: '#1f2937',
        muted: '#6b7280'
      },
      typography: {
        headingFont: 'Merriweather, serif',
        bodyFont: 'Source Sans Pro, sans-serif',
        baseSize: '16px',
        scale: 1.25
      },
      spacing: {
        base: '1rem',
        scale: 1.5
      },
      components: {
        button: {
          borderRadius: '4px',
          fontWeight: '500',
          transition: 'all 0.2s'
        },
        card: {
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        },
        form: {
          borderRadius: '4px',
          border: '1px solid #d1d5db',
          focusColor: '#0066cc'
        }
      },
      globalSections: {
        header: PREFAB_SECTIONS['header-section'],
        footer: PREFAB_SECTIONS['footer-section']
      },
      publicationCardVariants: []
    },
    
    {
      id: 'corporate-theme',
      name: 'Corporate Publishing Theme',
      description: 'Professional theme for corporate websites with clean layouts and business focus',
      version: '1.5.0',
      publishingType: 'corporate' as const,
      author: 'Wiley Design Team',
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-09-10'),
      
      // Corporate template package
      templates: [
        {
          id: 'global-home',
          name: 'Global Home',
          description: 'Main homepage template with hero section, featured content, and navigation',
          category: 'website' as TemplateCategory,
          status: 'active' as TemplateStatus,
          version: '1.5.0',
          author: 'Wiley Design Team',
          createdAt: new Date('2024-02-01'),
          updatedAt: new Date('2024-09-10'),
          tags: ['homepage', 'global', 'hero', 'featured'],
          sections: [],
          layout: {
            header: true,
            footer: true,
            sidebar: 'none',
            maxWidth: '1200px',
            spacing: 'comfortable'
          },
          allowedOverrides: ['branding.*', 'sections.hero.*'],
          lockedElements: ['navigation.structure'],
          defaultOverrideScope: 'Website (this)',
          broadenOverrideOptions: ['Website (this or all websites that inherit the same theme)'],
          narrowOverrideOptions: []
        },
        {
          id: 'about-us',
          name: 'About Us',
          description: 'About page template with company information, team, and mission statement',
          category: 'supporting' as TemplateCategory,
          status: 'active' as TemplateStatus,
          version: '1.1.0',
          author: 'Wiley Design Team',
          createdAt: new Date('2024-03-05'),
          updatedAt: new Date('2024-06-20'),
          tags: ['about', 'company', 'team', 'mission'],
          sections: [],
          layout: {
            header: true,
            footer: true,
            sidebar: 'none',
            maxWidth: '1000px',
            spacing: 'spacious'
          },
          allowedOverrides: ['content.*'],
          lockedElements: [],
          defaultOverrideScope: 'Website (this)',
          broadenOverrideOptions: ['Website (this or all websites that inherit the same theme)'],
          narrowOverrideOptions: []
        },
        {
          id: 'contact-us',
          name: 'Contact Us',
          description: 'Contact page template with contact forms, office locations, and contact information',
          category: 'supporting' as TemplateCategory,
          status: 'active' as TemplateStatus,
          version: '1.3.0',
          author: 'Wiley Design Team',
          createdAt: new Date('2024-02-20'),
          updatedAt: new Date('2024-07-10'),
          tags: ['contact', 'forms', 'locations', 'information'],
          sections: [],
          layout: {
            header: true,
            footer: true,
            sidebar: 'none',
            maxWidth: '800px',
            spacing: 'comfortable'
          },
          allowedOverrides: ['contact.*'],
          lockedElements: [],
          defaultOverrideScope: 'Website (this)',
          broadenOverrideOptions: ['Website (this or all websites that inherit the same theme)'],
          narrowOverrideOptions: []
        }
      ],
      
      colors: {
        primary: '#1e40af',
        secondary: '#f1f5f9',
        accent: '#0ea5e9',
        background: '#ffffff',
        text: '#1e293b',
        muted: '#64748b'
      },
      typography: {
        headingFont: 'Inter, sans-serif',
        bodyFont: 'Inter, sans-serif',
        baseSize: '16px',
        scale: 1.2
      },
      spacing: {
        base: '1rem',
        scale: 1.25
      },
      components: {
        button: {
          borderRadius: '6px',
          fontWeight: '600'
        },
        card: {
          borderRadius: '12px',
          border: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        },
        form: {
          borderRadius: '6px',
          border: '2px solid #e2e8f0'
        }
      },
      globalSections: {
        header: PREFAB_SECTIONS['header-section'],
        footer: PREFAB_SECTIONS['footer-section']
      },
      publicationCardVariants: []
    }
  ] as Theme[],
  
  publicationCardVariants: [
    {
      id: 'compact-variant',
      name: 'Compact',
      description: 'Clean compact view with essential information',
      config: {
        ...DEFAULT_PUBLICATION_CARD_CONFIG,
        showTitle: true,
        showAbstract: false,
        showAffiliations: false,
        showKeywords: false,
        showUsageMetrics: false,
        thumbnailPosition: 'left'
      },
      createdAt: new Date()
    },
    {
      id: 'detailed-variant',
      name: 'Detailed',
      description: 'Comprehensive view with all metadata',
      config: {
        ...DEFAULT_PUBLICATION_CARD_CONFIG,
        showTitle: true,
        showAbstract: true,
        showAffiliations: true,
        showKeywords: true,
        showUsageMetrics: true,
        thumbnailPosition: 'top'
      },
      createdAt: new Date()
    }
  ],
  selectedWidget: null,
  insertPosition: null,
  addWidget: (widget) => set((s) => ({ canvasItems: [...s.canvasItems, widget] })),
  addSection: (section) => set((s) => ({ canvasItems: [...s.canvasItems, section] })),
  moveItem: (fromIndex, toIndex) => set((s) => ({ canvasItems: arrayMove(s.canvasItems, fromIndex, toIndex) })),
  replaceCanvasItems: (items) => set({ canvasItems: items }),
  selectWidget: (id) => set({ selectedWidget: id }),
  deleteWidget: (widgetId) => set((state) => {
    // First try to find and remove standalone widget
    const standaloneIndex = state.canvasItems.findIndex(item => !isSection(item) && item.id === widgetId)
    if (standaloneIndex !== -1) {
      return {
        canvasItems: state.canvasItems.filter((_, index) => index !== standaloneIndex),
        selectedWidget: state.selectedWidget === widgetId ? null : state.selectedWidget
      }
    }
    
    // If not standalone, look in sections
    const updatedCanvasItems = state.canvasItems.map(item => {
      if (isSection(item)) {
        return {
          ...item,
          areas: item.areas.map(area => ({
            ...area,
            widgets: area.widgets.filter(widget => widget.id !== widgetId)
          }))
        }
      }
      return item
    })
    
    return {
      canvasItems: updatedCanvasItems,
      selectedWidget: state.selectedWidget === widgetId ? null : state.selectedWidget
    }
  }),
  addCustomSection: (section) => set((s) => ({ customSections: [...s.customSections, section] })),
  removeCustomSection: (id) => set((s) => ({ customSections: s.customSections.filter(section => section.id !== id) })),
  addPublicationCardVariant: (variant) => set((s) => ({ publicationCardVariants: [...s.publicationCardVariants, variant] })),
  removePublicationCardVariant: (id) => set((s) => ({ publicationCardVariants: s.publicationCardVariants.filter(variant => variant.id !== id) })),
  setInsertPosition: (position) => set({ insertPosition: position }),
  
  // Template Management
  addTemplate: (template) => set((state) => ({
    templates: [...state.templates, template]
  })),
  updateTemplate: (id, template) => set((state) => ({
    templates: state.templates.map(t => t.id === id ? { ...t, ...template, updatedAt: new Date() } : t)
  })),
  removeTemplate: (id) => set((state) => ({
    templates: state.templates.filter(t => t.id !== id)
  })),
  duplicateTemplate: (id) => set((state) => {
    const template = state.templates.find(t => t.id === id)
    if (!template) return state
    const duplicate = {
      ...template,
      id: crypto.randomUUID(),
      name: `${template.name} (Copy)`,
      version: '1.0.0',
      createdAt: new Date(),
      updatedAt: new Date()
    }
    return { templates: [...state.templates, duplicate] }
  }),
  
  // Website Management
  addWebsite: (website) => set((state) => ({
    websites: [...state.websites, website]
  })),
  updateWebsite: (id, website) => set((state) => ({
    websites: state.websites.map(w => w.id === id ? { ...w, ...website, updatedAt: new Date() } : w)
  })),
  removeWebsite: (id) => set((state) => ({
    websites: state.websites.filter(w => w.id !== id)
  })),
  
  // Override Management
  addOverride: (websiteId, override) => set((state) => ({
    websites: state.websites.map(w => 
      w.id === websiteId 
        ? { ...w, overrides: [...w.overrides, override], updatedAt: new Date() }
        : w
    )
  })),
  removeOverride: (websiteId, overridePath) => set((state) => ({
    websites: state.websites.map(w => 
      w.id === websiteId 
        ? { ...w, overrides: w.overrides.filter(o => o.path !== overridePath), updatedAt: new Date() }
        : w
    )
  })),
  
  // Deviation Analysis
  calculateDeviationScore: (websiteId) => {
    const state = get()
    const website = state.websites.find(w => w.id === websiteId)
    if (!website) return 0
    
    const template = state.templates.find(t => t.id === website.templateId)
    if (!template) return 0
    
    // Simple scoring: each override adds points based on impact
    let score = 0
    website.overrides.forEach(override => {
      if (template.lockedElements.some(locked => override.path.startsWith(locked))) {
        score += 20 // High impact for locked elements
      } else if (template.allowedOverrides.some(allowed => override.path.startsWith(allowed))) {
        score += 5 // Low impact for allowed overrides  
      } else {
        score += 10 // Medium impact for other overrides
      }
    })
    
    return Math.min(score, 100) // Cap at 100
  },
  
  // Theme Management
  addTheme: (theme) => set((state) => ({
    themes: [...state.themes, theme]
  })),
  updateTheme: (id, theme) => set((state) => ({
    themes: state.themes.map(t => t.id === id ? { ...t, ...theme } : t)
  })),
  removeTheme: (id) => set((state) => ({
    themes: state.themes.filter(t => t.id !== id)
  })),
  createContentBlockWithLayout: (layout) => {
    const { canvasItems, insertPosition } = get()
    
    // Create new section with layout
    const newSection: WidgetSection = {
      id: crypto.randomUUID(),
      name: 'Section',
      type: 'content-block',
      layout,
      areas: []
    }
    
    // Configure areas based on layout
    switch (layout) {
      case 'one-column':
        newSection.areas = [
          { id: crypto.randomUUID(), name: 'Content', widgets: [] }
        ]
        break
      case 'two-columns':
        newSection.areas = [
          { id: crypto.randomUUID(), name: 'Left Column', widgets: [] },
          { id: crypto.randomUUID(), name: 'Right Column', widgets: [] }
        ]
        break
      case 'three-columns':
        newSection.areas = [
          { id: crypto.randomUUID(), name: 'Left Column', widgets: [] },
          { id: crypto.randomUUID(), name: 'Center Column', widgets: [] },
          { id: crypto.randomUUID(), name: 'Right Column', widgets: [] }
        ]
        break
      case 'one-third-left':
        newSection.areas = [
          { id: crypto.randomUUID(), name: 'Left (1/3)', widgets: [] },
          { id: crypto.randomUUID(), name: 'Right (2/3)', widgets: [] }
        ]
        break
      case 'one-third-right':
        newSection.areas = [
          { id: crypto.randomUUID(), name: 'Left (2/3)', widgets: [] },
          { id: crypto.randomUUID(), name: 'Right (1/3)', widgets: [] }
        ]
        break
      case 'vertical':
        newSection.areas = [
          { id: crypto.randomUUID(), name: 'Top', widgets: [] },
          { id: crypto.randomUUID(), name: 'Bottom', widgets: [] }
        ]
        break
      default:
        newSection.areas = [
          { id: crypto.randomUUID(), name: 'Content', widgets: [] }
        ]
    }
    
    // Insert at appropriate position
    let newCanvasItems = [...canvasItems]
    
    if (insertPosition) {
      const relativeIndex = canvasItems.findIndex(item => item.id === insertPosition.relativeTo)
      if (relativeIndex !== -1) {
        const insertIndex = insertPosition.position === 'above' ? relativeIndex : relativeIndex + 1
        newCanvasItems.splice(insertIndex, 0, newSection)
      } else {
        newCanvasItems.push(newSection)
      }
    } else {
      newCanvasItems.push(newSection)
    }
    
    // Apply changes
    set({ 
      canvasItems: newCanvasItems,
      insertPosition: null,
      selectedWidget: newSection.id
    })
  }
}))

function SkinWrap({ skin, children }: { skin: Skin; children: ReactNode }) {
  const className = useMemo(() => {
    switch (skin) {
      case 'modern':
        return 'rounded-xl border border-gray-200 bg-white shadow-sm'
      case 'classic':
        return 'rounded-md border border-gray-300 bg-white shadow'
      case 'minimal':
        return 'bg-transparent'
      case 'accent':
        return 'rounded-lg border border-blue-200 bg-blue-50 shadow-sm'
      default:
        return 'bg-transparent'
    }
  }, [skin])
  
  return <div className={className}>{children}</div>
}


// Template Creation Wizard Component
function TemplateCreationWizard({ onClose }: { onClose: () => void }) {
  const { addTemplate, canvasItems } = usePageStore()
  const [step, setStep] = useState(1)
  const [templateData, setTemplateData] = useState({
    name: '',
    description: '',
    category: 'website' as TemplateCategory,
    tags: [] as string[],
    allowedOverrides: [] as string[],
    lockedElements: [] as string[],
    fromCurrentPage: false,
    includeContent: true
  })
  
  const totalSteps = 4
  
  const handleCreate = () => {
    const newTemplate: BaseTemplate = {
      id: crypto.randomUUID(),
      name: templateData.name,
      description: templateData.description,
      category: templateData.category,
      status: 'draft',
      version: '1.0.0',
      author: 'Current User',
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: templateData.tags,
      sections: templateData.fromCurrentPage ? canvasItems.filter(item => 'layout' in item) : [],
      globalStyles: {
        primaryColor: '#1e40af',
        fontFamily: 'Inter, sans-serif',
        borderRadius: '8px'
      },
      layout: {
        header: true,
        footer: true,
        sidebar: 'none',
        maxWidth: '1200px',
        spacing: 'comfortable'
      },
      allowedOverrides: templateData.allowedOverrides,
      lockedElements: templateData.lockedElements,
      defaultOverrideScope: 'Website (this)',
      broadenOverrideOptions: [],
      narrowOverrideOptions: []
    }
    
    addTemplate(newTemplate)
    onClose()
  }
  
  const nextStep = () => setStep(Math.min(step + 1, totalSteps))
  const prevStep = () => setStep(Math.max(step - 1, 1))
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Create New Template</h3>
              <p className="text-gray-600 mt-1">Step {step} of {totalSteps}</p>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div key={i} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    i + 1 <= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {i + 1}
                  </div>
                  {i < totalSteps - 1 && (
                    <div className={`h-1 w-16 mx-2 ${
                      i + 1 < step ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex mt-2">
              <div className="text-xs text-gray-600 w-8 text-center">Basic</div>
              <div className="text-xs text-gray-600 w-24 text-center">Source</div>
              <div className="text-xs text-gray-600 w-24 text-center">Rules</div>
              <div className="text-xs text-gray-600 w-24 text-center">Review</div>
            </div>
          </div>
          
          {/* Step Content */}
          <div className="min-h-[400px]">
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Template Name *</label>
                      <input
                        type="text"
                        value={templateData.name}
                        onChange={(e) => setTemplateData({...templateData, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="e.g., Academic Journal Template"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                      <select
                        value={templateData.category}
                        onChange={(e) => setTemplateData({...templateData, category: e.target.value as TemplateCategory})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="theme">Theme</option>
                        <option value="website">Website Pages</option>
                        <option value="publication">Publication Pages</option>
                        <option value="supporting">Supporting Pages</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={templateData.description}
                      onChange={(e) => setTemplateData({...templateData, description: e.target.value})}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Describe the purpose and features of this template..."
                    />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma separated)</label>
                    <input
                      type="text"
                      onChange={(e) => setTemplateData({...templateData, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="e.g., journal, academic, research, publications"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Template Source</h4>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        id="blank"
                        name="source"
                        checked={!templateData.fromCurrentPage}
                        onChange={() => setTemplateData({...templateData, fromCurrentPage: false})}
                        className="w-4 h-4 text-blue-600"
                      />
                      <label htmlFor="blank" className="flex-1">
                        <div className="font-medium text-gray-900">Start from Blank Template</div>
                        <div className="text-sm text-gray-500">Create a new template with standard sections (header, hero, footer)</div>
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        id="current"
                        name="source"
                        checked={templateData.fromCurrentPage}
                        onChange={() => setTemplateData({...templateData, fromCurrentPage: true})}
                        className="w-4 h-4 text-blue-600"
                      />
                      <label htmlFor="current" className="flex-1">
                        <div className="font-medium text-gray-900">Use Current Page as Base</div>
                        <div className="text-sm text-gray-500">Convert the current page design into a reusable template</div>
                        <div className="text-xs text-blue-600 mt-1">{canvasItems.length} sections will be included</div>
                      </label>
                    </div>
                    
                    {templateData.fromCurrentPage && (
                      <div className="ml-7 space-y-3">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id="includeContent"
                            checked={templateData.includeContent}
                            onChange={(e) => setTemplateData({...templateData, includeContent: e.target.checked})}
                            className="w-4 h-4 text-blue-600"
                          />
                          <label htmlFor="includeContent" className="text-sm text-gray-700">
                            Include actual content (recommended: uncheck to create placeholder content)
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Customization Rules</h4>
                  <p className="text-gray-600 mb-6">Define what can be customized when websites use this template</p>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <span className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          Allowed Customizations
                        </span>
                      </label>
                      <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
                        {[
                          'branding.logo',
                          'branding.colors',
                          'typography.headingFont',
                          'typography.bodyFont',
                          'sections.hero.title',
                          'sections.hero.subtitle',
                          'sections.footer.content'
                        ].map((path) => (
                          <label key={path} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={templateData.allowedOverrides.includes(path)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setTemplateData({
                                    ...templateData, 
                                    allowedOverrides: [...templateData.allowedOverrides, path]
                                  })
                                } else {
                                  setTemplateData({
                                    ...templateData, 
                                    allowedOverrides: templateData.allowedOverrides.filter(p => p !== path)
                                  })
                                }
                              }}
                              className="w-4 h-4 text-green-600"
                            />
                            <span className="text-sm font-mono text-gray-700">{path}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <span className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          Locked Elements
                        </span>
                      </label>
                      <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
                        {[
                          'layout.structure',
                          'navigation.main',
                          'compliance.elements',
                          'structure.main',
                          'navigation.primary',
                          'footer.copyright',
                          'header.navigation'
                        ].map((path) => (
                          <label key={path} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={templateData.lockedElements.includes(path)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setTemplateData({
                                    ...templateData, 
                                    lockedElements: [...templateData.lockedElements, path]
                                  })
                                } else {
                                  setTemplateData({
                                    ...templateData, 
                                    lockedElements: templateData.lockedElements.filter(p => p !== path)
                                  })
                                }
                              }}
                              className="w-4 h-4 text-red-600"
                            />
                            <span className="text-sm font-mono text-gray-700">{path}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h5 className="font-medium text-yellow-800">Customization Rules</h5>
                        <p className="text-sm text-yellow-700 mt-1">
                          <strong>Allowed:</strong> Low-risk customizations (5 points each)<br />
                          <strong>Locked:</strong> High-risk if overridden (20 points each)<br />
                          <strong>Other:</strong> Medium-risk customizations (10 points each)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Review & Create</h4>
                  
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Template Name</label>
                        <p className="font-medium text-gray-900">{templateData.name || 'Untitled Template'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Category</label>
                        <p className="font-medium text-gray-900 capitalize">{templateData.category}</p>
                      </div>
                      <div className="col-span-2">
                        <label className="text-sm font-medium text-gray-500">Description</label>
                        <p className="text-gray-900">{templateData.description || 'No description provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Source</label>
                        <p className="text-gray-900">
                          {templateData.fromCurrentPage ? `Current Page (${canvasItems.length} sections)` : 'Blank Template'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Tags</label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {templateData.tags.map((tag) => (
                            <span key={tag} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                              {tag}
                            </span>
                          ))}
                          {templateData.tags.length === 0 && <span className="text-gray-500 text-sm">No tags</span>}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Allowed Customizations</label>
                        <p className="text-gray-900">{templateData.allowedOverrides.length} elements</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Locked Elements</label>
                        <p className="text-gray-900">{templateData.lockedElements.length} elements</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <div className="flex gap-2">
              {step > 1 && (
                <button
                  onClick={prevStep}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Previous
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              {step < totalSteps ? (
                <button
                  onClick={nextStep}
                  disabled={step === 1 && !templateData.name}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleCreate}
                  disabled={!templateData.name}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Template
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Site Manager Websites component  
function SiteManagerWebsites() {
  const { websites, themes, addOverride, removeOverride, updateWebsite, addWebsite } = usePageStore()
  const [selectedWebsite, setSelectedWebsite] = useState<string | null>(null)
  const [showOverrideAnalysis, setShowOverrideAnalysis] = useState<string | null>(null)
  const [showCreateWebsite, setShowCreateWebsite] = useState(false)
  
  const getThemeForWebsite = (websiteId: string) => {
    const website = websites.find(w => w.id === websiteId)
    if (!website) return null
    return themes.find(t => t.id === website.themeId)
  }
  
  const getDeviationColor = (score: number) => {
    if (score <= 20) return 'text-green-600 bg-green-50 border-green-200'
    if (score <= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }
  
  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      staging: 'bg-blue-100 text-blue-800', 
      maintenance: 'bg-red-100 text-red-800'
    }
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }
  
  const getOverrideImpact = (override: Override, theme: Theme | null) => {
    if (!theme) return 'unknown'
    
    // Check against theme's templates to find relevant overrides
    for (const template of theme.templates) {
      if (template.lockedElements.some(locked => override.path.startsWith(locked))) {
        return 'high' // Locked element override = high risk
      } else if (template.allowedOverrides.some(allowed => override.path.startsWith(allowed))) {
        return 'low' // Allowed override = low risk
      }
    }
    return 'medium' // Other override = medium risk
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Websites</h2>
          <p className="text-gray-600 mt-1">Manage websites and track template customizations</p>
        </div>
        <button 
          onClick={() => setShowCreateWebsite(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Website
        </button>
      </div>
      
      {/* Websites Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">All Websites</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Website</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Theme</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deviation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Overrides</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Updated</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {websites.map((website) => {
                const theme = getThemeForWebsite(website.id)
                return (
                  <tr key={website.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{website.name}</div>
                        <div className="text-sm text-gray-500">{website.domain}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{theme?.name || 'Unknown'}</div>
                        <div className="text-sm text-gray-500">v{theme?.version} • {theme?.publishingType}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(website.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center px-2 py-1 text-sm rounded-full border ${getDeviationColor(website.deviationScore)}`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${getDeviationColor(website.deviationScore).replace('text-', 'bg-').replace('border-', '').replace('bg-gray-50', '')}`} />
                        {website.deviationScore}%
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-900">{website.overrides.length}</span>
                        {website.overrides.length > 0 && (
                          <button 
                            onClick={() => setShowOverrideAnalysis(website.id)}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            View Details
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {website.updatedAt.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setSelectedWebsite(website.id)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Edit
                        </button>
                        <button className="text-gray-400 hover:text-gray-600">
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Override Analysis Modal */}
      {showOverrideAnalysis && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Override Analysis
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {websites.find(w => w.id === showOverrideAnalysis)?.name} - Template Customizations
                  </p>
                </div>
                <button 
                  onClick={() => setShowOverrideAnalysis(null)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {(() => {
                const website = websites.find(w => w.id === showOverrideAnalysis)
                const theme = website ? getThemeForWebsite(website.id) : null
                
                if (!website) return <div>Website not found</div>
                
                const overridesByImpact = website.overrides.reduce((acc, override) => {
                  const impact = getOverrideImpact(override, theme)
                  if (!acc[impact]) acc[impact] = []
                  acc[impact].push(override)
                  return acc
                }, {} as Record<string, Override[]>)
                
                return (
                  <div className="space-y-6">
                    {/* Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full" />
                          <span className="font-medium text-gray-900">High Risk</span>
                        </div>
                        <p className="text-2xl font-bold text-red-600 mt-1">{overridesByImpact.high?.length || 0}</p>
                        <p className="text-sm text-gray-600">Locked elements modified</p>
                      </div>
                      
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                          <span className="font-medium text-gray-900">Medium Risk</span>
                        </div>
                        <p className="text-2xl font-bold text-yellow-600 mt-1">{overridesByImpact.medium?.length || 0}</p>
                        <p className="text-sm text-gray-600">Uncontrolled changes</p>
                      </div>
                      
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full" />
                          <span className="font-medium text-gray-900">Low Risk</span>
                        </div>
                        <p className="text-2xl font-bold text-green-600 mt-1">{overridesByImpact.low?.length || 0}</p>
                        <p className="text-sm text-gray-600">Allowed customizations</p>
                      </div>
                    </div>
                    
                    {/* Override Details */}
                    <div className="space-y-4">
                      {['high', 'medium', 'low'].map((impact) => {
                        const overrides = overridesByImpact[impact] || []
                        if (overrides.length === 0) return null
                        
                        const colors = {
                          high: 'border-red-200 bg-red-50',
                          medium: 'border-yellow-200 bg-yellow-50', 
                          low: 'border-green-200 bg-green-50'
                        }
                        
                        return (
                          <div key={impact} className={`border rounded-lg p-4 ${colors[impact as keyof typeof colors]}`}>
                            <h4 className="font-semibold text-gray-900 mb-3 capitalize">{impact} Risk Overrides</h4>
                            <div className="space-y-2">
                              {overrides.map((override) => (
                                <div key={override.path} className="bg-white rounded p-3 border">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <p className="font-medium text-gray-900">{override.path}</p>
                                      <div className="text-sm text-gray-600 mt-1">
                                        <span className="font-medium">Original:</span> {JSON.stringify(override.originalValue)}
                                      </div>
                                      <div className="text-sm text-gray-600">
                                        <span className="font-medium">Override:</span> {JSON.stringify(override.overriddenValue)}
                                      </div>
                                      {override.reason && (
                                        <div className="text-sm text-gray-500 mt-1">
                                          <span className="font-medium">Reason:</span> {override.reason}
                                        </div>
                                      )}
                                    </div>
                                    <div className="text-right ml-4">
                                      <p className="text-xs text-gray-500">{override.overriddenBy}</p>
                                      <p className="text-xs text-gray-500">{override.timestamp.toLocaleDateString()}</p>
                                      <button 
                                        onClick={() => removeOverride(website.id, override.path)}
                                        className="text-xs text-red-600 hover:text-red-800 mt-1"
                                      >
                                        Remove Override
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>
        </div>
      )}
      
      {/* Website Creation Wizard */}
      {showCreateWebsite && <WebsiteCreationWizard onClose={() => setShowCreateWebsite(false)} />}
    </div>
  )
}

// Website Creation Wizard Component
function WebsiteCreationWizard({ onClose }: { onClose: () => void }) {
  const { themes, addWebsite } = usePageStore()
  const [step, setStep] = useState(1)
  const [websiteData, setWebsiteData] = useState({
    name: '',
    themeId: '',
    branding: {
      primaryColor: '',
      secondaryColor: '',
      logoUrl: '',
      fontFamily: ''
    },
    customizations: [] as Array<{path: string, value: string, reason: string}>
  })
  
  const totalSteps = 3
  const selectedTheme = themes.find(t => t.id === websiteData.themeId)
  
  const handleCreate = () => {
    const themeBranding = selectedTheme ? {
      primaryColor: selectedTheme.colors.primary,
      secondaryColor: selectedTheme.colors.secondary,
      logoUrl: '',
      fontFamily: selectedTheme.typography.headingFont
    } : websiteData.branding

    const newWebsite: Website = {
      id: crypto.randomUUID(),
      name: websiteData.name,
      domain: `${websiteData.name.toLowerCase().replace(/\s+/g, '-')}.wiley.com`, // Auto-generate from name
      themeId: websiteData.themeId,
      status: 'staging',
      createdAt: new Date(),
      updatedAt: new Date(),
      overrides: websiteData.customizations.map(c => ({
        path: c.path,
        originalValue: getDefaultValueForPath(c.path),
        overriddenValue: c.value,
        overriddenAt: 'website' as const,
        overriddenBy: 'Current User',
        timestamp: new Date(),
        reason: c.reason
      })),
      customSections: [],
      branding: {
        ...themeBranding,
        ...Object.fromEntries(
          Object.entries(websiteData.branding).filter(([_, value]) => value !== '')
        )
      },
      deviationScore: calculateInitialDeviation(websiteData.customizations, selectedTheme),
      lastThemeSync: new Date()
    }
    
    addWebsite(newWebsite)
    onClose()
  }
  
  const getDefaultValueForPath = (path: string) => {
    // Simple mapping of paths to default values
    const defaults: Record<string, any> = {
      'branding.logo': '/default-logo.svg',
      'branding.primaryColor': '#1e40af',
      'typography.headingFont': 'Inter, sans-serif',
      'sections.hero.title': 'Welcome to Our Site'
    }
    return defaults[path] || 'default-value'
  }
  
  const calculateInitialDeviation = (customizations: any[], theme: Theme | undefined) => {
    if (!theme) return 0
    let score = 0
    // For themes, we calculate deviation based on how many customizations diverge from theme standards
    score = customizations.length * 10 // Simple scoring for now
    return Math.min(score, 100)
  }
  
  const nextStep = () => setStep(Math.min(step + 1, totalSteps))
  const prevStep = () => setStep(Math.max(step - 1, 1))
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Create New Website</h3>
              <p className="text-gray-600 mt-1">Step {step} of {totalSteps}</p>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div key={i} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    i + 1 <= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {i + 1}
                  </div>
                  {i < totalSteps - 1 && (
                    <div className={`h-1 w-16 mx-2 ${
                      i + 1 < step ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex mt-2">
              <div className="text-xs text-gray-600 w-8 text-center">Template</div>
              <div className="text-xs text-gray-600 w-24 text-center">Details</div>
              <div className="text-xs text-gray-600 w-24 text-center">Branding</div>
            </div>
          </div>
          
          {/* Step Content */}
          <div className="min-h-[400px]">
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Choose Publishing Theme</h4>
                  <p className="text-gray-600 mb-6">Select a complete theme package for your publishing platform</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-96 overflow-y-auto">
                    {themes.map((theme) => (
                      <div 
                        key={theme.id}
                        onClick={() => setWebsiteData({...websiteData, themeId: theme.id})}
                        className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                          websiteData.themeId === theme.id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded mb-4 flex items-center justify-center">
                          <Palette className="w-10 h-10 text-gray-400" />
                        </div>
                        <h5 className="font-medium text-gray-900 text-lg">{theme.name}</h5>
                        <p className="text-sm text-gray-600 mt-1 mb-3">{theme.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`px-2 py-1 text-xs rounded-full bg-green-100 text-green-800`}>
                              {theme.publishingType}
                            </div>
                            <span className="text-xs text-gray-500">v{theme.version}</span>
                          </div>
                          <span className="text-xs text-gray-500">{theme.templates.length} templates</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {selectedTheme && (
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Palette className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                          <h6 className="font-medium text-blue-900">{selectedTheme.name}</h6>
                          <p className="text-sm text-blue-700 mt-1">{selectedTheme.description}</p>
                          <div className="mt-3">
                            <div className="text-xs font-medium text-blue-800 mb-2">Included Templates:</div>
                            <div className="flex flex-wrap gap-1">
                              {selectedTheme.templates.map((template) => (
                                <span key={template.id} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                                  {template.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Website Branding</h4>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Website Name *</label>
                    <input
                      type="text"
                      value={websiteData.name}
                      onChange={(e) => setWebsiteData({...websiteData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="e.g., Wiley Research Portal"
                    />
                    <p className="text-sm text-gray-500 mt-1">Domain will be auto-generated: {websiteData.name ? `${websiteData.name.toLowerCase().replace(/\s+/g, '-')}.wiley.com` : 'your-site-name.wiley.com'}</p>
                  </div>
                  
                  {selectedTheme && (
                    <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <h5 className="font-medium text-gray-900 mb-3">Theme Defaults ({selectedTheme.name})</h5>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">Primary Color:</span>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-4 h-4 rounded border" style={{backgroundColor: selectedTheme.colors.primary}}></div>
                            <span className="text-gray-700">{selectedTheme.colors.primary}</span>
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Secondary Color:</span>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-4 h-4 rounded border" style={{backgroundColor: selectedTheme.colors.secondary}}></div>
                            <span className="text-gray-700">{selectedTheme.colors.secondary}</span>
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Heading Font:</span>
                          <span className="text-gray-700 ml-2">{selectedTheme.typography.headingFont}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Body Font:</span>
                          <span className="text-gray-700 ml-2">{selectedTheme.typography.bodyFont}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h5 className="font-medium text-gray-900 mb-3">Custom Overrides (Optional)</h5>
                    <p className="text-sm text-gray-600 mb-4">Override theme defaults with your own branding. Leave blank to use theme defaults.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Custom Primary Color</label>
                        <input
                          type="color"
                          value={websiteData.branding.primaryColor}
                          onChange={(e) => setWebsiteData({...websiteData, branding: {...websiteData.branding, primaryColor: e.target.value}})}
                          className="w-full h-10 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Custom Secondary Color</label>
                        <input
                          type="color"
                          value={websiteData.branding.secondaryColor}
                          onChange={(e) => setWebsiteData({...websiteData, branding: {...websiteData.branding, secondaryColor: e.target.value}})}
                          className="w-full h-10 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Custom Logo URL</label>
                        <input
                          type="url"
                          value={websiteData.branding.logoUrl}
                          onChange={(e) => setWebsiteData({...websiteData, branding: {...websiteData.branding, logoUrl: e.target.value}})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="https://example.com/logo.svg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Custom Font Family</label>
                        <input
                          type="text"
                          value={websiteData.branding.fontFamily}
                          onChange={(e) => setWebsiteData({...websiteData, branding: {...websiteData.branding, fontFamily: e.target.value}})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="e.g., 'Roboto', sans-serif"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {selectedTheme && (
                    <div className="mt-6">
                      <h5 className="font-medium text-gray-900 mb-4">Theme Customizations</h5>
                      <p className="text-sm text-gray-600 mb-4">
                        Configure initial customizations for this theme
                      </p>
                      
                      <div className="space-y-4">
                        {['branding.logo', 'colors.primary', 'typography.headingFont', 'sections.hero.title'].map((path) => (
                          <div key={path} className="flex items-center gap-4">
                            <div className="flex-1">
                              <label className="block text-sm font-medium text-gray-700">
                                {path.replace(/\./g, ' → ')}
                              </label>
                              <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                placeholder={`Custom value for ${path}`}
                                onChange={(e) => {
                                  const existing = websiteData.customizations.find(c => c.path === path)
                                  if (existing) {
                                    existing.value = e.target.value
                                  } else if (e.target.value) {
                                    setWebsiteData({
                                      ...websiteData,
                                      customizations: [...websiteData.customizations, {
                                        path,
                                        value: e.target.value,
                                        reason: 'Initial customization'
                                      }]
                                    })
                                  }
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Branding & Launch</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Primary Brand Color</label>
                      <input
                        type="color"
                        value={websiteData.branding.primaryColor}
                        onChange={(e) => setWebsiteData({
                          ...websiteData,
                          branding: {...websiteData.branding, primaryColor: e.target.value}
                        })}
                        className="w-full h-10 px-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
                      <input
                        type="color"
                        value={websiteData.branding.secondaryColor}
                        onChange={(e) => setWebsiteData({
                          ...websiteData,
                          branding: {...websiteData.branding, secondaryColor: e.target.value}
                        })}
                        className="w-full h-10 px-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Logo URL</label>
                      <input
                        type="text"
                        value={websiteData.branding.logoUrl}
                        onChange={(e) => setWebsiteData({
                          ...websiteData,
                          branding: {...websiteData.branding, logoUrl: e.target.value}
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="/path/to/logo.svg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Font Family</label>
                      <select
                        value={websiteData.branding.fontFamily}
                        onChange={(e) => setWebsiteData({
                          ...websiteData,
                          branding: {...websiteData.branding, fontFamily: e.target.value}
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="Inter">Inter</option>
                        <option value="Roboto">Roboto</option>
                        <option value="Source Sans Pro">Source Sans Pro</option>
                        <option value="Merriweather">Merriweather</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h5 className="font-medium text-gray-900 mb-4">Website Summary</h5>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Name:</span> {websiteData.name || 'Untitled Website'}
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Domain:</span> {websiteData.name ? `${websiteData.name.toLowerCase().replace(/\s+/g, '-')}.wiley.com` : 'Auto-generated from name'}
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Theme:</span> {selectedTheme?.name || 'None selected'}
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Templates Included:</span> {selectedTheme?.templates.length || 0} templates
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Customizations:</span> {websiteData.customizations.length} configured
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Initial Status:</span> Staging
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Deviation Score:</span> {calculateInitialDeviation(websiteData.customizations, selectedTheme)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <div className="flex gap-2">
              {step > 1 && (
                <button
                  onClick={prevStep}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Previous
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              {step < totalSteps ? (
                <button
                  onClick={nextStep}
                  disabled={(step === 1 && !websiteData.themeId) || (step === 2 && !websiteData.name)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleCreate}
                  disabled={!websiteData.name || !websiteData.themeId}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Website
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


// Theme Provider component that applies theme variables to canvas only
function CanvasThemeProvider({ children }: { children: React.ReactNode }) {
  const { themes } = usePageStore()
  const currentTheme = themes.find(t => t.id === 'academic-publishing-theme') // Default theme for now
  
  if (!currentTheme) {
    return <>{children}</>
  }
  
  return (
    <div 
      className="theme-canvas"
      style={{
        '--theme-color-primary': currentTheme.colors.primary,
        '--theme-color-secondary': currentTheme.colors.secondary,
        '--theme-color-accent': currentTheme.colors.accent,
        '--theme-color-text': currentTheme.colors.text,
        '--theme-color-background': currentTheme.colors.background,
        '--theme-color-muted': currentTheme.colors.muted,
        '--theme-heading-font': currentTheme.typography.headingFont,
        '--theme-body-font': currentTheme.typography.bodyFont,
        '--theme-base-size': currentTheme.typography.baseSize,
        '--theme-scale': currentTheme.typography.scale
      } as React.CSSProperties}
    >
      {children}
    </div>
  )
}

function SiteManager() {
  const { setCurrentView, setSiteManagerView, siteManagerView } = usePageStore()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentView('page-builder')}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Page Builder
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Site Manager</h1>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm border-r">
          <nav className="p-4 space-y-2">
            {[
              { id: 'overview', label: 'Overview', icon: Home },
              { id: 'themes', label: 'Publication Cards', icon: Palette },
              { id: 'theme-editor', label: 'Theme Settings', icon: Settings },
              { id: 'templates', label: 'Templates', icon: FileText },
              { id: 'websites', label: 'Websites', icon: Globe },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'settings', label: 'Settings', icon: Cog }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setSiteManagerView(item.id as SiteManagerView)}
                className={`flex items-center gap-3 w-full px-3 py-2 text-left text-sm rounded-md transition-colors ${
                  siteManagerView === item.id
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {siteManagerView === 'overview' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Publication Cards</h3>
                  <p className="text-gray-600 text-sm mb-4">Configure how publication metadata is displayed across your site</p>
                  <button 
                    onClick={() => setSiteManagerView('themes')}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Manage Card Variants →
                  </button>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Themes</h3>
                  <p className="text-gray-600 text-sm mb-4">Control global styling and branding</p>
                  <button 
                    onClick={() => setSiteManagerView('theme-editor')}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Edit Theme Settings →
                  </button>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Templates</h3>
                  <p className="text-gray-600 text-sm mb-4">Pre-designed page structures</p>
                  <p className="text-gray-500 text-xs">Coming soon</p>
                </div>
              </div>
            </div>
          )}
          {siteManagerView === 'themes' && (
            <PublicationCards usePageStore={usePageStore} />
          )}
          {siteManagerView === 'theme-editor' && (
            <ThemeEditor usePageStore={usePageStore} />
          )}
          {siteManagerView === 'templates' && <SiteManagerTemplates />}
          {siteManagerView === 'websites' && <SiteManagerWebsites />}
          {siteManagerView === 'users' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Users</h2>
              <p className="text-gray-600">User management - Coming soon</p>
            </div>
          )}
          {siteManagerView === 'settings' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>
              <p className="text-gray-600">Settings - Coming soon</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Left sidebar tabs
type LeftSidebarTab = 'library' | 'sections' | 'diy-zone' | 'publication-cards'

// Layout picker component
function LayoutPicker({ onSelectLayout, onClose }: { onSelectLayout: (layout: ContentBlockLayout) => void; onClose: () => void }) {
  const layouts = [
    { id: 'flexible' as ContentBlockLayout, name: 'Flexible', description: 'Responsive layout' },
    { id: 'one-column' as ContentBlockLayout, name: 'One Column', description: 'Full width column' },
    { id: 'two-columns' as ContentBlockLayout, name: 'Two Columns', description: 'Equal columns' },
    { id: 'three-columns' as ContentBlockLayout, name: 'Three Columns', description: 'Equal columns' },
    { id: 'one-third-left' as ContentBlockLayout, name: 'One-Third Left', description: '1/3 + 2/3 columns' },
    { id: 'one-third-right' as ContentBlockLayout, name: 'One-Third Right', description: '2/3 + 1/3 columns' },
    { id: 'vertical' as ContentBlockLayout, name: 'Vertical Section', description: 'Stacked rows' }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Choose Layout</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-2">
          {layouts.map((layout) => (
            <button
              key={layout.id}
              onClick={() => onSelectLayout(layout.id)}
              className="w-full text-left p-3 rounded-md border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div className="font-medium text-gray-900">{layout.name}</div>
              <div className="text-sm text-gray-500">{layout.description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// Draggable Library Widget Component
function DraggableLibraryWidget({ item }: { item: SpecItem }) {
  const { addWidget } = usePageStore()
  const [dragStarted, setDragStarted] = useState(false)
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `library-${item.id}`,
    data: {
      type: 'library-widget',
      item: item
    }
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined

  const handleClick = (e: React.MouseEvent) => {
    // Prevent click if drag was started
    if (dragStarted) {
      e.preventDefault()
      setDragStarted(false)
      return
    }
    
    const newWidget = buildWidget(item)
    addWidget(newWidget)
  }

  const handlePointerDown = () => {
    setDragStarted(false)
  }

  const handleDragStart = () => {
    setDragStarted(true)
    console.log('📦 Library widget drag started:', item.label)
  }

  return (
    <button
      ref={setNodeRef}
      style={style}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      {...attributes}
      {...listeners}
      className={`block w-full text-left p-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700 rounded transition-colors cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-50' : ''
      }`}
      title="Click to add to canvas, or drag to drop into a section"
    >
      {item.label}
      {item.status === 'planned' && (
        <span className="ml-2 text-xs text-orange-600">(Planned)</span>
      )}
    </button>
  )
}

// Library component to show widgets and sections with collapsible categories
function WidgetLibrary() {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set([]) // Start with all widget categories collapsed for cleaner interface
  )

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900">Widget Library</h3>
      <div className="space-y-3">
        {LIBRARY_CONFIG.map((category: any) => {
          const isExpanded = expandedCategories.has(category.id)
          
          return (
            <div key={category.id} className="border border-gray-200 rounded-lg">
              {/* Category Header - Clickable to toggle */}
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full p-3 bg-gray-50 border-b flex items-center justify-between hover:bg-gray-100 transition-colors"
              >
                <h4 className="font-medium text-gray-900">{category.name}</h4>
                <ChevronDown 
                  className={`w-4 h-4 text-gray-500 transition-transform ${
                    isExpanded ? 'transform rotate-180' : ''
                  }`} 
                />
              </button>
              
              {/* Category Content - Collapsible */}
              {isExpanded && (
                <div className="p-3 space-y-2">
                  {category.groups?.map((group: any) => (
                    <div key={group.id}>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">{group.name}</h5>
                      <div className="space-y-1">
                        {group.items?.map((item: any) => (
                          <DraggableLibraryWidget key={item.id} item={item} />
                        ))}
                      </div>
                    </div>
                  )) || (
                    // Handle categories with direct items (no groups)
                    category.items?.map((item: any) => (
                      <DraggableLibraryWidget key={item.id} item={item} />
                    ))
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// NOTE: PREFAB_SECTIONS is now defined at the top of the file to avoid hoisting issues

// Sections Content component
function SectionsContent({ showToast }: { showToast: (message: string, type: 'success' | 'error') => void }) {
  const { addSection, customSections, removeCustomSection } = usePageStore()
  
  const handleAddPrefabSection = (sectionKey: keyof typeof PREFAB_SECTIONS) => {
    const prefab = PREFAB_SECTIONS[sectionKey]
    const newSection: WidgetSection = {
      id: crypto.randomUUID(),
      ...prefab.template,
      // Ensure all nested items have unique IDs
      areas: prefab.template.areas.map(area => ({
        ...area,
        id: crypto.randomUUID(),
        widgets: area.widgets.map(widget => ({
          ...widget,
          id: crypto.randomUUID()
        }))
      }))
    }
    addSection(newSection)
  }

  // Group sections by category
  const sectionsByCategory = Object.entries(PREFAB_SECTIONS).reduce((acc, [key, section]) => {
    const category = section.category
    if (!acc[category]) acc[category] = []
    acc[category].push([key, section])
    return acc
  }, {} as Record<string, Array<[string, any]>>)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-900 mb-4">Sections</h3>
        <p className="text-sm text-gray-600 mb-4">Pre-fabricated layout patterns to accelerate page design</p>
        
        {/* Pre-fabricated Sections by Category */}
        {Object.entries(sectionsByCategory).map(([categoryName, sections]) => (
          <div key={categoryName} className="space-y-3 mb-6">
            <h4 className="font-medium text-gray-700">{categoryName}</h4>
            <div className="space-y-2">
                  {sections.map(([key, section]) => (
                    <button
                      key={key}
                      onClick={() => handleAddPrefabSection(key as keyof typeof PREFAB_SECTIONS)}
                      className="block w-full text-left p-3 border border-blue-200 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Plus className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-gray-900">{section.name}</span>
                      </div>
                      <p className="text-sm text-gray-600">{section.description}</p>
                    </button>
                  ))}
            </div>
          </div>
        ))}
        
        {/* Custom Sections (User-saved sections) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-700">Custom Sections</h4>
            <span className="text-xs text-gray-500">{customSections.length} saved</span>
          </div>
          
          {customSections.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-sm text-gray-500">No custom sections yet</p>
              <p className="text-xs text-gray-400 mt-1">Create sections on your page and save them for reuse</p>
            </div>
          ) : (
            <div className="space-y-2">
              {customSections.map((section) => (
                <div key={section.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white">
                  <div>
                    <div className="font-medium text-gray-900">{section.name}</div>
                    {section.description && (
                      <div className="text-sm text-gray-500">{section.description}</div>
                    )}
                    <div className="text-xs text-gray-400">
                      {section.widgets.length} widget{section.widgets.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        const { addSection } = usePageStore.getState()
                        // Create a copy of the section with new ID
                        const newSectionId = crypto.randomUUID()
                        const sectionCopy = {
                          ...section.section,
                          id: newSectionId,
                          areas: section.section.areas.map(area => ({
                            ...area,
                            id: crypto.randomUUID(),
                            widgets: area.widgets.map(widget => ({
                              ...widget,
                              id: crypto.randomUUID(),
                              sectionId: newSectionId // Fixed: Use new section ID
                            }))
                          }))
                        }
                        addSection(sectionCopy)
                        
                        // Show success notification
                        const widgetCount = sectionCopy.areas.reduce((count, area) => count + area.widgets.length, 0)
                        showToast(`"${section.name}" added to canvas with ${widgetCount} widget${widgetCount !== 1 ? 's' : ''}!`, 'success')
                      }}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      Use
                    </button>
                    <button 
                      onClick={() => removeCustomSection(section.id)}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// DIY Zone component
function DIYZoneContent({ showToast }: { showToast: (message: string, type: 'success' | 'error') => void }) {
  const { addWidget, customSections, addCustomSection, removeCustomSection } = usePageStore()
  
  const handleAddDIYWidget = (type: string) => {
    let widget: Widget
    
    switch (type) {
      case 'html-block':
        widget = {
          id: crypto.randomUUID(),
          type: 'html',
          skin: 'minimal',
          htmlContent: '',
          title: 'HTML Widget'
        } as HTMLWidget
        break
      case 'code-block':
        widget = {
          id: crypto.randomUUID(),
          type: 'text',
          skin: 'modern',
          text: '// Your code here\nconsole.log("Hello World");',
          align: 'left'
        } as TextWidget
        break
      default:
        return
    }
    
    addWidget(widget)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-900 mb-4">DIY Zone</h3>
        <p className="text-sm text-gray-600 mb-4">Advanced tools for creating custom content</p>
        
        {/* DIY Widgets */}
        <div className="space-y-3 mb-6">
          <h4 className="font-medium text-gray-700">DIY Widgets</h4>
          <div className="space-y-2">
            <button
              onClick={() => handleAddDIYWidget('html-block')}
              className="block w-full text-left p-3 border border-orange-200 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                <Code className="w-4 h-4 text-orange-600" />
                <span className="font-medium text-gray-900">HTML Block</span>
              </div>
              <p className="text-sm text-gray-600">Custom HTML, CSS and JavaScript</p>
            </button>
            
            <button
              onClick={() => handleAddDIYWidget('code-block')}
              className="block w-full text-left p-3 border border-orange-200 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="w-4 h-4 text-orange-600" />
                <span className="font-medium text-gray-900">Code Block</span>
              </div>
              <p className="text-sm text-gray-600">Syntax-highlighted code snippets</p>
            </button>
            
            <div className="p-3 border border-gray-200 bg-gray-50 rounded-lg opacity-60">
              <div className="flex items-center gap-2 mb-1">
                <Settings className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-gray-500">Global CSS</span>
              </div>
              <p className="text-sm text-gray-500">Site-wide styling (Coming Soon)</p>
            </div>
            
            <div className="p-3 border border-gray-200 bg-gray-50 rounded-lg opacity-60">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-gray-500">File Manager</span>
              </div>
              <p className="text-sm text-gray-500">Upload and manage assets (Coming Soon)</p>
            </div>
          </div>
        </div>
        
        {/* Custom Sections */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-700">Custom Sections</h4>
            <span className="text-xs text-gray-500">{customSections.length} saved</span>
          </div>
          
          {customSections.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-sm text-gray-500">No custom sections yet</p>
              <p className="text-xs text-gray-400 mt-1">Select a section and choose "Save as My Section"</p>
            </div>
          ) : (
            <div className="space-y-2">
              {customSections.map((section) => (
                <div key={section.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white">
                  <div>
                    <div className="font-medium text-gray-900">{section.name}</div>
                    {section.description && (
                      <div className="text-sm text-gray-500">{section.description}</div>
                    )}
                    <div className="text-xs text-gray-400">
                      {section.widgets.length} widget{section.widgets.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        const { addSection } = usePageStore.getState()
                        // Create a copy of the section with new ID
                        const newSectionId = crypto.randomUUID()
                        const sectionCopy = {
                          ...section.section,
                          id: newSectionId,
                          areas: section.section.areas.map(area => ({
                            ...area,
                            id: crypto.randomUUID(),
                            widgets: area.widgets.map(widget => ({
                              ...widget,
                              id: crypto.randomUUID(),
                              sectionId: newSectionId // Fixed: Use new section ID
                            }))
                          }))
                        }
                        addSection(sectionCopy)
                        
                        // Show success notification
                        const widgetCount = sectionCopy.areas.reduce((count, area) => count + area.widgets.length, 0)
                        showToast(`"${section.name}" added to canvas with ${widgetCount} widget${widgetCount !== 1 ? 's' : ''}!`, 'success')
                      }}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      Use
                    </button>
                    <button 
                      onClick={() => removeCustomSection(section.id)}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Publication Cards configuration component
function PublicationCardsContent() {
  const { publicationCardVariants, addPublicationCardVariant, removePublicationCardVariant } = usePageStore()
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-900 mb-4">Publication Cards</h3>
        <p className="text-sm text-gray-600 mb-4">Configure how publication metadata is displayed</p>
        
        {/* Saved Variants */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-700">Saved Variants</h4>
            <span className="text-xs text-gray-500">{publicationCardVariants.length} variants</span>
          </div>
          
          <div className="space-y-2">
            {publicationCardVariants.map((variant) => (
              <div key={variant.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white">
                <div>
                  <div className="font-medium text-gray-900">{variant.name}</div>
                  {variant.description && (
                    <div className="text-sm text-gray-500">{variant.description}</div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                    Configure
                  </button>
                  <button 
                    onClick={() => removePublicationCardVariant(variant.id)}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Live Preview */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700">Live Preview</h4>
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
            <PublicationCard 
              article={MOCK_SCHOLARLY_ARTICLES[0]}
              config={DEFAULT_PUBLICATION_CARD_CONFIG}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// Properties Panel component
function PropertiesPanel() {
  const { canvasItems, selectedWidget, replaceCanvasItems, publicationCardVariants } = usePageStore()
  
  if (!selectedWidget) {
    return (
      <div className="p-4">
        <div className="text-center py-12">
          <p className="text-gray-500">Select a widget or section to edit its properties</p>
        </div>
      </div>
    )
  }
  
  // Find selected widget/section - check both canvas items and widgets within sections
  let selectedItem: CanvasItem | Widget | undefined = canvasItems.find(item => item.id === selectedWidget)
  
  // If not found at canvas level, search within section areas
  if (!selectedItem) {
    for (const canvasItem of canvasItems) {
      if (isSection(canvasItem)) {
        for (const area of canvasItem.areas) {
          const foundWidget = area.widgets.find(w => w.id === selectedWidget)
          if (foundWidget) {
            selectedItem = foundWidget
            break
          }
        }
        if (selectedItem) break
      }
    }
  }
  
  if (!selectedItem) {
    console.log('🔍 Properties Panel - Selected item not found:', { 
      selectedWidget, 
      canvasItemIds: canvasItems.map(item => item.id),
      sectionWidgetIds: canvasItems.flatMap(item => 
        isSection(item) ? item.areas.flatMap(area => area.widgets.map(w => w.id)) : []
      )
    })
    return (
      <div className="p-4">
        <div className="text-center py-12">
          <p className="text-gray-500">Selected item not found</p>
        </div>
      </div>
    )
  }
  
  console.log('🎯 Properties Panel - Found selected item:', { 
    id: selectedItem.id, 
    type: selectedItem.type,
    isSection: isSection(selectedItem)
  })
  
  const updateWidget = (updates: Partial<Widget>) => {
    const updatedCanvasItems = canvasItems.map(item => {
      if (isSection(item)) {
        return {
          ...item,
          areas: item.areas.map(area => ({
            ...area,
            widgets: area.widgets.map(w => 
              w.id === selectedWidget ? { ...w, ...updates } : w
            )
          }))
        }
      } else {
        return item.id === selectedWidget ? { ...item, ...updates } : item
      }
    })
    replaceCanvasItems(updatedCanvasItems)
  }
  
  if (isSection(selectedItem)) {
    return (
      <div className="p-4 space-y-4">
        <h3 className="font-semibold text-gray-900">Section Properties</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={selectedItem.name}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Layout</label>
            <input
              type="text"
              value={selectedItem.layout}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
            />
          </div>
        </div>
      </div>
    )
  }
  
  // Widget properties
  const widget = selectedItem as Widget
  
  return (
    <div className="p-4 space-y-4">
      <h3 className="font-semibold text-gray-900">Widget Properties</h3>
      
      {widget.type === 'text' && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Text</label>
            <textarea
              value={widget.text}
              onChange={(e) => updateWidget({ text: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alignment</label>
            <select
              value={widget.align || 'left'}
              onChange={(e) => updateWidget({ align: e.target.value as 'left' | 'center' | 'right' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
        </div>
      )}
      
      {widget.type === 'heading' && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Text</label>
            <input
              type="text"
              value={(widget as HeadingWidget).text}
              onChange={(e) => updateWidget({ text: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
            <select
              value={(widget as HeadingWidget).level}
              onChange={(e) => updateWidget({ level: parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5 | 6 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value={1}>H1</option>
              <option value={2}>H2</option>
              <option value={3}>H3</option>
              <option value={4}>H4</option>
              <option value={5}>H5</option>
              <option value={6}>H6</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alignment</label>
            <select
              value={(widget as HeadingWidget).align || 'left'}
              onChange={(e) => updateWidget({ align: e.target.value as 'left' | 'center' | 'right' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
        </div>
      )}
      
      {widget.type === 'html' && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">HTML Content</label>
            <textarea
              value={(widget as HTMLWidget).htmlContent}
              onChange={(e) => updateWidget({ htmlContent: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm resize-none"
              rows={6}
              placeholder="Enter your HTML code here..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload HTML File</label>
            <input
              type="file"
              accept=".html,.htm"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  const reader = new FileReader()
                  reader.onload = (e) => {
                    const content = e.target?.result as string
                    updateWidget({ htmlContent: content })
                  }
                  reader.readAsText(file)
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          {/* Widget Promotion for HTML widgets */}
          {(widget as HTMLWidget).htmlContent && (
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center gap-2 mb-3">
                <h4 className="font-medium text-gray-700">Widget Promotion</h4>
                <div className="relative group">
                  <Info className="w-4 h-4 text-gray-400 cursor-help" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    Share your creation with the community or suggest it for the platform library
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <button className="w-full px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors">
                  Suggest for Library
                </button>
                <button className="w-full px-3 py-2 bg-orange-600 text-white text-sm font-medium rounded-md hover:bg-orange-700 transition-colors">
                  Promote to Wiley
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {widget.type === 'publication-list' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Content Source</label>
            <select
              value={(widget as PublicationListWidget).contentSource}
              onChange={(e) => updateWidget({ 
                contentSource: e.target.value as 'dynamic-query' | 'doi-list' | 'ai-generated' 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="dynamic-query">Dynamic Query</option>
              <option value="doi-list">DOI List</option>
              <option value="ai-generated">AI Generated</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Layout</label>
            <select
              value={(widget as PublicationListWidget).layout}
              onChange={(e) => updateWidget({ 
                layout: e.target.value as 'list' | 'grid' | 'featured' 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="list">List</option>
              <option value="grid">Grid</option>
              <option value="featured">Featured</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Items: {(widget as PublicationListWidget).maxItems || 6}
            </label>
            <input
              type="range"
              min="1"
              max="20"
              value={(widget as PublicationListWidget).maxItems || 6}
              onChange={(e) => updateWidget({ maxItems: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Publication Card Variant</label>
            <select
              value={(widget as PublicationListWidget).cardVariantId || 'default'}
              onChange={(e) => {
                const variantId = e.target.value === 'default' ? undefined : e.target.value
                const selectedVariant = publicationCardVariants.find(v => v.id === variantId)
                const cardConfig = selectedVariant ? selectedVariant.config : DEFAULT_PUBLICATION_CARD_CONFIG
                updateWidget({ 
                  cardVariantId: variantId,
                  cardConfig: cardConfig
                })
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
            >
              <option value="default">Default</option>
              {publicationCardVariants.map(variant => (
                <option key={variant.id} value={variant.id}>{variant.name}</option>
              ))}
            </select>
            <button 
              onClick={() => {
                const { setCurrentView, setSiteManagerView } = usePageStore.getState()
                setCurrentView('site-manager')
                setSiteManagerView('themes')
              }}
              className="w-full px-3 py-2 border border-blue-300 text-blue-700 rounded-md text-sm hover:bg-blue-50 transition-colors"
            >
              → Configure Publication Cards
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function PageBuilder() {
  const instanceId = useMemo(() => Math.random().toString(36).substring(7), [])
  const { canvasItems, setCurrentView, selectWidget, selectedWidget, setInsertPosition, createContentBlockWithLayout } = usePageStore()
  const [leftSidebarTab, setLeftSidebarTab] = useState<LeftSidebarTab>('library')
  const [showLayoutPicker, setShowLayoutPicker] = useState(false)
  const [activeSectionToolbar, setActiveSectionToolbar] = useState<string | null>(null)
  const [activeWidgetToolbar, setActiveWidgetToolbar] = useState<string | null>(null)
  const [activeDropZone, setActiveDropZone] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  
  
  const handleSetActiveSectionToolbar = (value: string | null) => {
    setActiveSectionToolbar(value)
  }
  
  // Show toast notification
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000) // Auto-hide after 3 seconds
  }
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  )
  
  // Custom collision detection that prioritizes section-area drop zones
  const customCollisionDetection = (args: any) => {
    // First try to find section-area collisions
    const sectionAreaCollisions = rectIntersection({
      ...args,
      droppableContainers: args.droppableContainers.filter((container: any) => 
        container.data?.current?.type === 'section-area'
      )
    })
    
    if (sectionAreaCollisions.length > 0) {
      return sectionAreaCollisions
    }
    
    // Fall back to default collision detection
    return closestCenter(args)
  }
  
  const handleDragStart = (event: DragStartEvent) => {
    console.log('🚀 Drag Start:', {
      activeId: event.active.id,
      activeType: event.active.data?.current?.type,
      activeData: event.active.data?.current
    })
    
    // Log all available drop zones for debugging
    const dropZones = document.querySelectorAll('[data-droppable="true"]')
    console.log('📍 Available drop zones:', Array.from(dropZones).map(zone => ({
      id: zone.getAttribute('data-droppable-id') || zone.id,
      classes: zone.className,
      rect: zone.getBoundingClientRect()
    })))
  }
  
  const handleDragOver = (event: DragOverEvent) => {
    if (event.over) {
      // Highlight section-area drop zones
      if (event.over.data?.current?.type === 'section-area') {
        const dropZoneId = event.over.id as string
        if (activeDropZone !== dropZoneId) {
          setActiveDropZone(dropZoneId)
          console.log('🎯 Drop zone detected:', {
            activeId: event.active.id,
            activeType: event.active.data?.current?.type,
            dropZone: dropZoneId,
            sectionId: event.over.data?.current?.sectionId,
            areaId: event.over.data?.current?.areaId
          })
        }
      } else {
        // Clear highlight when not over a section-area
        if (activeDropZone) {
          setActiveDropZone(null)
        }
      }
    } else {
      // Clear highlight when not over anything
      if (activeDropZone) {
        setActiveDropZone(null)
      }
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    // Clear drop zone highlighting
    setActiveDropZone(null)
    
    console.log('🎯 Drag End Event:', {
      activeId: active.id,
      activeType: active.data?.current?.type,
      overId: over?.id,
      overType: over?.data?.current?.type,
      hasOver: !!over,
      isLibraryWidget: active.data?.current?.type === 'library-widget',
      isSortableItem: !active.data?.current?.type || active.data?.current?.type === 'sortable'
    })

    if (!over) {
      console.log('❌ No drop target found')
      return
    }

    // Handle library widget drop into section area
    if (active.data?.current?.type === 'library-widget' && over.data?.current?.type === 'section-area') {
      console.log('✅ Library widget dropped into section area!')
      const libraryItem = active.data.current.item
      const sectionId = over.data.current.sectionId
      const areaId = over.data.current.areaId
      
      // Create new widget from library item
      const newWidget = buildWidget(libraryItem)
      newWidget.sectionId = sectionId
      
      // Add widget to the specific section area
      const { replaceCanvasItems, canvasItems } = usePageStore.getState()
      const updatedCanvasItems = canvasItems.map(canvasItem => {
        if (canvasItem.type === 'content-block' && canvasItem.id === sectionId) {
          return {
            ...canvasItem,
            areas: canvasItem.areas.map(area => 
              area.id === areaId 
                ? { ...area, widgets: [...area.widgets, newWidget] }
                : area
            )
          }
        }
        return canvasItem
      })
      replaceCanvasItems(updatedCanvasItems)
      return
    }
    
    // Handle library widget drop onto main canvas (as standalone widget)
    if (active.data?.current?.type === 'library-widget' && over?.id && !over.data?.current?.type) {
      console.log('✅ Library widget dropped onto main canvas!')
      const libraryItem = active.data.current.item
      const targetId = over.id
      
      // Create new widget from library item (no sectionId - standalone widget)
      const newWidget = buildWidget(libraryItem)
      
      // Add widget to canvas at specific position
      const { replaceCanvasItems, canvasItems } = usePageStore.getState()
      const targetIndex = canvasItems.findIndex(item => item.id === targetId)
      
      if (targetIndex !== -1) {
        // Insert after target item
        const newCanvasItems = [...canvasItems]
        newCanvasItems.splice(targetIndex + 1, 0, newWidget)
        replaceCanvasItems(newCanvasItems)
      } else {
        // Add to end if target not found
        replaceCanvasItems([...canvasItems, newWidget])
      }
      return
    }
    
    // Handle standalone widget drop into section area (the missing scenario!)
    if ((active.data?.current?.type === 'standalone-widget' || 
         !active.data?.current?.type || 
         active.data?.current?.type === 'sortable') && 
        over.data?.current?.type === 'section-area') {
      console.log('✅ Standalone widget dropped into section area!')
      
      // Get widget from drag data if available, otherwise find by ID
      let widget: Widget
      if (active.data?.current?.type === 'standalone-widget') {
        widget = active.data.current.widget
      } else {
        const widgetId = active.id as string
        const { canvasItems } = usePageStore.getState()
        const foundWidget = canvasItems.find(item => item.id === widgetId && !isSection(item))
        if (!foundWidget) {
          console.log('❌ Standalone widget not found')
          return
        }
        widget = foundWidget as Widget
      }
      
      const sectionId = over.data.current.sectionId
      const areaId = over.data.current.areaId
      const { replaceCanvasItems, canvasItems } = usePageStore.getState()
      
      // Remove widget from canvas and add to section area
      const newCanvasItems = canvasItems.filter(item => item.id !== widget.id)
      const updatedCanvasItems = newCanvasItems.map(canvasItem => {
        if (canvasItem.type === 'content-block' && canvasItem.id === sectionId) {
          const updatedWidget = { ...widget, sectionId: sectionId }
          return {
            ...canvasItem,
            areas: canvasItem.areas.map(area => 
              area.id === areaId 
                ? { ...area, widgets: [...area.widgets, updatedWidget] }
                : area
            )
          }
        }
        return canvasItem
      })
      replaceCanvasItems(updatedCanvasItems)
      return
    }
    
    // Handle section widget movement - PRIORITY: section-widget drags should never go to canvas reordering
    if (active.data?.current?.type === 'section-widget') {
      console.log('🚀 Section widget detected, checking drop location...', { 
        overId: over?.id, 
        overType: over?.data?.current?.type,
        overData: over?.data?.current 
      })
      
      // Case 1: Dropped on specific section area (preferred)
      if (over?.data?.current?.type === 'section-area') {
        console.log('✅ Moving widget to specific section area!')
        const draggedWidget = active.data.current.widget
        const fromSectionId = active.data.current.fromSectionId
        const fromAreaId = active.data.current.fromAreaId
        const toSectionId = over.data.current.sectionId
        const toAreaId = over.data.current.areaId
        
        // Don't do anything if dropping in the same area
        if (fromAreaId === toAreaId) {
          console.log('⚠️ Same area, no action needed')
          return
        }
        
        const { replaceCanvasItems, canvasItems } = usePageStore.getState()
        const updatedCanvasItems = canvasItems.map(canvasItem => {
          if (canvasItem.type === 'content-block') {
            return {
              ...canvasItem,
              areas: canvasItem.areas.map(area => {
                // Remove from source area
                if (area.id === fromAreaId) {
                  return { ...area, widgets: area.widgets.filter(w => w.id !== draggedWidget.id) }
                }
                // Add to target area with updated sectionId
                if (area.id === toAreaId) {
                  const updatedWidget = { ...draggedWidget, sectionId: toSectionId }
                  return { ...area, widgets: [...area.widgets, updatedWidget] }
                }
                return area
              })
            }
          }
          return canvasItem
        })
        replaceCanvasItems(updatedCanvasItems)
        console.log('✅ Widget moved between sections!')
        return
      }
      
      // Case 2: Dropped on section itself (find first available area)
      if (over?.id && typeof over.id === 'string' && over.id.endsWith('-section')) {
        console.log('✅ Moving widget to section (first available area)!', { targetSectionId: over.id })
        const draggedWidget = active.data.current.widget
        const fromSectionId = active.data.current.fromSectionId
        const fromAreaId = active.data.current.fromAreaId
        const targetSectionId = over.id
        
        console.log('🎯 Cross-section move details:', {
          widgetId: draggedWidget.id,
          fromSectionId,
          fromAreaId,
          targetSectionId,
          isSameSection: fromSectionId === targetSectionId
        })
        
        // If dropping in the same section, don't do anything
        if (fromSectionId === targetSectionId) {
          console.log('⚠️ Same section, no action needed')
          return
        }
        
        const { replaceCanvasItems, canvasItems } = usePageStore.getState()
        
        // Find the target section and its first area
        const targetSection = canvasItems.find(item => item.id === targetSectionId && item.type === 'content-block') as WidgetSection
        if (!targetSection || !targetSection.areas.length) {
          console.log('❌ Target section not found or has no areas')
          return
        }
        
        const firstAreaId = targetSection.areas[0].id
        console.log('🎯 Target section found, first area:', firstAreaId)
        
        const updatedCanvasItems = canvasItems.map(canvasItem => {
          if (canvasItem.type === 'content-block') {
            return {
              ...canvasItem,
              areas: canvasItem.areas.map(area => {
                // Remove from source area
                if (area.id === fromAreaId) {
                  return { ...area, widgets: area.widgets.filter(w => w.id !== draggedWidget.id) }
                }
                // Add to target area (first area of target section)
                if (area.id === firstAreaId) {
                  const updatedWidget = { ...draggedWidget, sectionId: targetSectionId }
                  return { ...area, widgets: [...area.widgets, updatedWidget] }
                }
                return area
              })
            }
          }
          return canvasItem
        })
        replaceCanvasItems(updatedCanvasItems)
        console.log('✅ Widget moved to section first area!')
        return
      }
      
      // Case 3: Section widget dropped somewhere invalid - just return without doing anything
      console.log('⚠️ Section widget dropped in invalid location, ignoring')
      return
    }

    // Handle existing canvas item reordering (sections and standalone widgets) - EXCLUDE section-widgets!
    if (!active.data?.current?.type || 
        (active.data?.current?.type !== 'library-widget' && 
         active.data?.current?.type !== 'section-widget') ||
        active.data?.current?.type === 'standalone-widget') {
      console.log('🔄 Attempting canvas item reordering for canvas items')
      
      // For standalone-widget type, use the original sortable ID for comparison
      const activeItemId = active.data?.current?.type === 'standalone-widget' 
        ? active.data.current.originalSortableId 
        : active.id
      
      if (activeItemId !== over?.id) {
        const { moveItem } = usePageStore.getState()
        const oldIndex = canvasItems.findIndex((item) => item.id === activeItemId)
        const newIndex = canvasItems.findIndex((item) => item.id === over.id)
        
        console.log('📋 Canvas reorder:', { oldIndex, newIndex, activeItemId, overId: over.id })
        
        if (oldIndex !== -1 && newIndex !== -1) {
          console.log('✅ Canvas item reordered!')
          moveItem(oldIndex, newIndex)
        } else {
          console.log('❌ Canvas item reorder failed - items not found')
        }
      }
    }
  }

  const handleAddSection = (relativeTo: string, position: 'above' | 'below') => {
    setInsertPosition({ relativeTo, position })
    setShowLayoutPicker(true)
  }

  const handleSelectLayout = (layout: ContentBlockLayout) => {
    createContentBlockWithLayout(layout)
    setShowLayoutPicker(false)
  }

  const handleSectionClick = (sectionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    // Close any widget toolbar and toggle section toolbar
    setActiveWidgetToolbar(null)
    handleSetActiveSectionToolbar(activeSectionToolbar === sectionId ? null : sectionId)
    selectWidget(sectionId)
  }

  const handleWidgetClick = (widgetId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    console.log('🖱️ Widget clicked for properties:', { widgetId })
    
    // Find the widget to check its sectionId - use same logic as Properties Panel
    let widget: Widget | undefined = canvasItems.find(item => item.id === widgetId && !isSection(item)) as Widget
    
    // If not found at canvas level, search within section areas
    if (!widget) {
      for (const canvasItem of canvasItems) {
        if (isSection(canvasItem)) {
          for (const area of canvasItem.areas) {
            const foundWidget = area.widgets.find(w => w.id === widgetId)
            if (foundWidget) {
              widget = foundWidget
              break
            }
          }
          if (widget) break
        }
      }
    }
    
    if (widget) {
      console.log('📋 Widget found for properties:', { 
        id: widget.id, 
        type: widget.type,
        sectionId: widget.sectionId || 'standalone'
      })
    } else {
      console.log('❌ Widget not found for properties:', { widgetId })
    }
    
    // Only close section toolbar if widget is not part of the currently active section
    if (!widget?.sectionId || activeSectionToolbar !== widget.sectionId) {
      handleSetActiveSectionToolbar(null)
    }
    
    setActiveWidgetToolbar(activeWidgetToolbar === widgetId ? null : widgetId)
    selectWidget(widgetId)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={customCollisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div 
        className="min-h-screen bg-gray-50 flex"
        onClick={(e) => {
          // Only close toolbars if clicking directly on this div, not on children
          if (e.target === e.currentTarget) {
            handleSetActiveSectionToolbar(null)
            setActiveWidgetToolbar(null)
          }
        }}
      >
        {/* Left Sidebar */}
        <div className="w-80 bg-white shadow-sm border-r flex flex-col">
          {/* Tabs */}
          <div className="border-b">
            <div className="flex">
              {[
                { id: 'library', label: 'Library', icon: BookOpen },
                { id: 'sections', label: 'Sections', icon: Plus },
                { id: 'diy-zone', label: 'DIY Zone', icon: Lightbulb },
                { id: 'publication-cards', label: 'Publication Cards', icon: Building2 }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setLeftSidebarTab(tab.id as LeftSidebarTab)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    leftSidebarTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {leftSidebarTab === 'library' && <WidgetLibrary />}
            {leftSidebarTab === 'sections' && <SectionsContent showToast={showToast} />}
            {leftSidebarTab === 'diy-zone' && <DIYZoneContent showToast={showToast} />}
            {leftSidebarTab === 'publication-cards' && <PublicationCardsContent />}
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col">
          <div className="border-b bg-white px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Page Builder</h1>
              <button
                onClick={() => setCurrentView('site-manager')}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                <Settings className="w-4 h-4" />
                Site Manager
              </button>
            </div>
          </div>

          <div className="flex-1 p-6" onClick={() => selectWidget(null)}>
            {/* Template Context Bar - Only show in template editing mode */}
            {usePageStore(state => state.editingContext) === 'template' && (
              <div className="mb-3 flex items-center justify-between py-2 px-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-amber-600">✨ Template Mode</span>
                  <span className="text-amber-500">•</span>
                  <span className="text-amber-600">Override indicators visible</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const { setCurrentView, setSiteManagerView, setEditingContext } = usePageStore.getState()
                      setCurrentView('site-manager')
                      setSiteManagerView('templates')
                      setEditingContext('page')
                    }}
                    className="text-xs text-amber-600 hover:text-amber-800 underline"
                  >
                    Back to Templates
                  </button>
                  <span className="text-amber-400">|</span>
                  <button
                    onClick={() => {
                      const { setEditingContext } = usePageStore.getState()
                      setEditingContext('page')
                    }}
                    className="text-xs text-amber-600 hover:text-amber-800 underline"
                  >
                    Switch to Page Mode
                  </button>
                </div>
              </div>
            )}
            
            {/* Regular Page Editing Context - Show minimal info */}
            {usePageStore(state => state.editingContext) === 'page' && (
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Editing: <strong>Wiley Online Library Homepage</strong>
                </div>
                <button
                  onClick={() => {
                    const { setEditingContext } = usePageStore.getState()
                    setEditingContext('template')
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  Switch to Template Mode
                </button>
              </div>
            )}
            
            <CanvasThemeProvider>
              <div className="bg-white border border-gray-200 rounded-lg min-h-96 relative">
              {canvasItems.length === 0 ? (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center text-gray-500">
                    <p className="text-lg mb-2">Start building your page</p>
                    <p className="text-sm">Drag widgets from the library to get started</p>
                  </div>
                </div>
              ) : (
                <SortableContext items={canvasItems} strategy={verticalListSortingStrategy}>
                  <div className="relative">
                    {canvasItems.map((item, index) => (
                      <div key={item.id} className="relative group">
                        {/* Add Section Button Above */}
                        {item.id !== 'header-section' && (
                          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <button
                              onClick={() => handleAddSection(item.id, 'above')}
                              className="px-3 py-1 bg-white border border-gray-300 text-gray-600 text-sm rounded-md hover:bg-gray-50 transition-colors"
                            >
                              Add Section
                            </button>
                          </div>
                        )}
                        
                        <SortableItem 
                          item={item} 
                          isSelected={selectedWidget === item.id}
                          onSectionClick={handleSectionClick}
                          onWidgetClick={handleWidgetClick}
                          activeSectionToolbar={activeSectionToolbar}
                          setActiveSectionToolbar={handleSetActiveSectionToolbar}
                          activeWidgetToolbar={activeWidgetToolbar}
                          setActiveWidgetToolbar={setActiveWidgetToolbar}
                          activeDropZone={activeDropZone}
                          showToast={showToast}
                          instanceId={instanceId}
                        />
                        
                        {/* Add Section Button Below */}
                        {index === canvasItems.length - 1 && (
                          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <button
                              onClick={() => handleAddSection(item.id, 'below')}
                              className="px-3 py-1 bg-white border border-gray-300 text-gray-600 text-sm rounded-md hover:bg-gray-50 transition-colors"
                            >
                              Add Section
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </SortableContext>
              )}
              </div>
            </CanvasThemeProvider>
          </div>
        </div>

      {/* Right Sidebar - Properties Panel */}
      <div className="w-80 bg-white shadow-sm border-l flex flex-col">
        <div className="border-b p-4">
          <h2 className="font-semibold text-gray-900">Properties</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          <PropertiesPanel />
        </div>
      </div>

      {/* Layout Picker Modal */}
      {showLayoutPicker && (
        <LayoutPicker
          onSelectLayout={handleSelectLayout}
          onClose={() => setShowLayoutPicker(false)}
        />
      )}
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg transition-all transform ${
          toast.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center gap-2">
            {toast.type === 'success' ? (
              <Check className="w-4 h-4" />
            ) : (
              <X className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        </div>
      )}
      </div>
    </DndContext>
  )
}

function SortableItem({ 
  item, 
  isSelected, 
  onSectionClick, 
  onWidgetClick,
  activeSectionToolbar,
  setActiveSectionToolbar,
  activeWidgetToolbar,
  setActiveWidgetToolbar,
  activeDropZone,
  showToast,
  instanceId
}: { 
  item: CanvasItem
  isSelected: boolean
  onSectionClick: (id: string, e: React.MouseEvent) => void
  onWidgetClick: (id: string, e: React.MouseEvent) => void
  activeSectionToolbar: string | null
  setActiveSectionToolbar: (value: string | null) => void
  activeWidgetToolbar: string | null
  setActiveWidgetToolbar: (value: string | null) => void
  activeDropZone: string | null
  showToast: (message: string, type: 'success' | 'error') => void
  instanceId: string
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const getSectionName = (item: WidgetSection) => {
    const specialSections: Record<string, string> = {
      'header-section': 'Header',
      'hero-section': 'Hero', 
      'footer-section': 'Footer',
      'features-section': 'Features'
    }
    return specialSections[item.id] || 'Section'
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`group relative border-2 transition-all ${
        isSelected 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-transparent hover:border-gray-200'
      }`}
    >
      
      {isSection(item) ? (
        <div 
          onClick={(e) => onSectionClick(item.id, e)}
          className="cursor-pointer"
        >
          {/* Section Selection Indicator */}
          {isSelected && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
          )}
          {isSelected && (
            <div className="absolute -left-16 top-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium z-10">
              {getSectionName(item)}
            </div>
          )}
          
          <SectionRenderer 
            section={item} 
            onWidgetClick={onWidgetClick}
            dragAttributes={attributes}
            dragListeners={listeners}
            activeSectionToolbar={activeSectionToolbar}
            setActiveSectionToolbar={setActiveSectionToolbar}
            activeWidgetToolbar={activeWidgetToolbar}
            setActiveWidgetToolbar={setActiveWidgetToolbar}
            activeDropZone={activeDropZone}
            showToast={showToast}
            instanceId={instanceId}
          />
        </div>
      ) : (
        <div className="cursor-pointer hover:ring-2 hover:ring-blue-300 rounded transition-all relative">
          {/* Overlay to capture clicks on interactive widgets */}
          <div 
            className="absolute inset-0 z-10 bg-transparent hover:bg-blue-50/10 transition-colors"
            style={{ pointerEvents: 'auto' }}
            onClick={(e) => {
              e.stopPropagation()
              console.log('🎯 Standalone overlay click detected:', { 
                widgetId: item.id, 
                widgetType: item.type 
              })
              // Close any section toolbar and toggle widget toolbar
              setActiveSectionToolbar?.(null)
              setActiveWidgetToolbar(activeWidgetToolbar === item.id ? null : item.id)
              onWidgetClick(item.id, e)
            }}
          />
          {/* Standalone Widget Action Toolbar - appears on click */}
          {activeWidgetToolbar === item.id && (
            <div className="absolute -top-2 -right-2 transition-opacity z-20" style={{ pointerEvents: 'auto' }}>
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg shadow-lg px-2 py-1">
              <StandaloneWidgetDragHandle 
                widget={item}
                sortableAttributes={attributes}
                sortableListeners={listeners}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  // Duplicate standalone widget
                  const { replaceCanvasItems, canvasItems } = usePageStore.getState()
                  const itemIndex = canvasItems.findIndex(canvasItem => canvasItem.id === item.id)
                  if (itemIndex !== -1) {
                    const duplicatedWidget = { ...item, id: crypto.randomUUID() }
                    const newCanvasItems = [...canvasItems]
                    newCanvasItems.splice(itemIndex + 1, 0, duplicatedWidget)
                    replaceCanvasItems(newCanvasItems)
                  }
                }}
                className="p-1 text-gray-500 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors"
                title="Duplicate widget"
              >
                <Copy className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onWidgetClick(item.id, e)
                }}
                className="p-1 text-gray-500 hover:text-purple-600 rounded hover:bg-purple-50 transition-colors"
                title="Properties"
              >
                <Edit className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  const { deleteWidget } = usePageStore.getState()
                  deleteWidget(item.id)
                }}
                className="p-1 text-gray-500 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                title="Delete widget"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
          )}
          
          {/* Make widget content non-interactive in edit mode */}
          <div style={{ pointerEvents: 'none', position: 'relative', zIndex: 1 }}>
            <WidgetRenderer 
              widget={item}
              dragAttributes={attributes}
              dragListeners={listeners}
              onWidgetClick={onWidgetClick}
              activeSectionToolbar={activeSectionToolbar}
              setActiveSectionToolbar={setActiveSectionToolbar}
              activeWidgetToolbar={activeWidgetToolbar}
              setActiveWidgetToolbar={setActiveWidgetToolbar}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// Standalone Widget Drag Handle - uses useDraggable for section drops AND canvas reordering
function StandaloneWidgetDragHandle({ 
  widget, 
  sortableAttributes, 
  sortableListeners 
}: {
  widget: Widget
  sortableAttributes: any
  sortableListeners: any
}) {
  // Use draggable instead of sortable to enable section drops
  const drag = useDraggable({
    id: `standalone-widget-${widget.id}`,
    data: {
      type: 'standalone-widget',
      widget: widget,
      originalSortableId: widget.id // Keep reference for canvas reordering
    }
  })
  
  return (
    <div 
      ref={drag.setNodeRef}
      style={drag.transform ? {
        transform: `translate3d(${drag.transform.x}px, ${drag.transform.y}px, 0)`,
      } : undefined}
      className={`p-1 text-gray-500 hover:text-gray-700 cursor-grab active:cursor-grabbing rounded hover:bg-gray-100 transition-colors ${
        drag.isDragging ? 'opacity-50' : ''
      }`}
      title="Drag to reorder or move to section"
      {...drag.attributes}
      {...drag.listeners}
    >
      <GripVertical className="w-3 h-3" />
    </div>
  )
}

// Draggable Widget Within Section Component (fixes hooks rule violation)
function DraggableWidgetInSection({ 
  widget, 
  sectionId, 
  areaId, 
  activeSectionToolbar, 
  setActiveSectionToolbar, 
  activeWidgetToolbar, 
  setActiveWidgetToolbar, 
  onWidgetClick 
}: {
  widget: Widget
  sectionId: string
  areaId: string
  activeSectionToolbar?: string | null
  setActiveSectionToolbar?: (value: string | null) => void
  activeWidgetToolbar: string | null
  setActiveWidgetToolbar: (value: string | null) => void
  onWidgetClick: (id: string, e: React.MouseEvent) => void
}) {
  // Each widget gets its own draggable hook - no hooks rule violation
  const widgetDrag = useDraggable({
    id: `widget-${widget.id}`,
    data: {
      type: 'section-widget',
      widget: widget,
      fromSectionId: sectionId,
      fromAreaId: areaId
    }
  })
  
  return (
    <div 
      ref={widgetDrag.setNodeRef}
      style={widgetDrag.transform ? {
        transform: `translate3d(${widgetDrag.transform.x}px, ${widgetDrag.transform.y}px, 0)`,
      } : undefined}
      className={`cursor-pointer hover:ring-2 hover:ring-blue-300 rounded transition-all group relative ${
        widgetDrag.isDragging ? 'opacity-50' : ''
      }`}
    >
      {/* Overlay to capture clicks on interactive widgets */}
      <div 
        className="absolute inset-0 z-10 bg-transparent hover:bg-blue-50/10 transition-colors"
        style={{ pointerEvents: 'auto' }}
        onClick={(e) => {
          e.stopPropagation()
          console.log('🎯 Overlay click detected:', { 
            widgetId: widget.id, 
            widgetType: widget.type 
          })
          // Only close section toolbar if it's not for the current widget's section
          if (activeSectionToolbar !== widget.sectionId) {
            setActiveSectionToolbar?.(null)
          }
          setActiveWidgetToolbar(activeWidgetToolbar === widget.id ? null : widget.id)
          onWidgetClick(widget.id, e)
        }}
      />
      {/* Widget Action Toolbar - appears on click (outside non-interactive area) */}
      {activeWidgetToolbar === widget.id && (
        <div className="absolute -top-2 -right-2 transition-opacity z-20" style={{ pointerEvents: 'auto' }}>
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg shadow-lg px-2 py-1">
            <div 
              {...widgetDrag.attributes}
              {...widgetDrag.listeners}
              className="p-1 text-gray-500 hover:text-gray-700 cursor-grab active:cursor-grabbing rounded hover:bg-gray-100 transition-colors"
              title="Drag to move widget between sections"
            >
              <GripVertical className="w-3 h-3" />
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                // Duplicate widget logic
                const { replaceCanvasItems, canvasItems } = usePageStore.getState()
                const duplicatedWidget = { ...widget, id: crypto.randomUUID() }
                
                const updatedCanvasItems = canvasItems.map(canvasItem => {
                  if (isSection(canvasItem)) {
                    return {
                      ...canvasItem,
                      areas: canvasItem.areas.map(area => 
                        area.widgets.some(w => w.id === widget.id)
                          ? { ...area, widgets: [...area.widgets, duplicatedWidget] }
                          : area
                      )
                    }
                  }
                  return canvasItem
                })
                replaceCanvasItems(updatedCanvasItems)
              }}
              className="p-1 text-gray-500 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors"
              title="Duplicate widget"
            >
              <Copy className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onWidgetClick(widget.id, e)
              }}
              className="p-1 text-gray-500 hover:text-purple-600 rounded hover:bg-purple-50 transition-colors"
              title="Properties"
            >
              <Edit className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                const { deleteWidget } = usePageStore.getState()
                deleteWidget(widget.id)
              }}
              className="p-1 text-gray-500 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
              title="Delete widget"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
      
      {/* Override Indicator - Only show in template editing mode */}
      {(widget as any).isOverridden && usePageStore.getState().editingContext === 'template' && (
        <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 z-30">
          <span className="text-[10px] font-medium">✨ Override</span>
        </div>
      )}
      
      {/* Make widget content non-interactive in edit mode */}
      <div style={{ pointerEvents: 'none', position: 'relative', zIndex: 1 }}>
        <WidgetRenderer 
          widget={widget} 
          onWidgetClick={onWidgetClick}
          activeSectionToolbar={activeSectionToolbar}
          setActiveSectionToolbar={setActiveSectionToolbar}
          activeWidgetToolbar={activeWidgetToolbar}
          setActiveWidgetToolbar={setActiveWidgetToolbar}
        />
      </div>
    </div>
  )
}

function SectionRenderer({ 
  section, 
  onWidgetClick,
  dragAttributes,
  dragListeners,
  activeSectionToolbar,
  setActiveSectionToolbar,
  activeWidgetToolbar,
  setActiveWidgetToolbar,
  activeDropZone,
  showToast,
  instanceId
}: { 
  section: WidgetSection
  onWidgetClick: (id: string, e: React.MouseEvent) => void
  dragAttributes?: any
  dragListeners?: any
  activeSectionToolbar: string | null
  setActiveSectionToolbar: (value: string | null) => void
  activeWidgetToolbar: string | null
  setActiveWidgetToolbar: (value: string | null) => void
  activeDropZone: string | null
  showToast: (message: string, type: 'success' | 'error') => void
  instanceId: string
}) {
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [sectionName, setSectionName] = useState('')
  const [sectionDescription, setSectionDescription] = useState('')
  
  const getLayoutClasses = (layout: ContentBlockLayout) => {
    switch (layout) {
      case 'one-column':
        return 'grid-cols-1'
      case 'two-columns':
        return 'grid-cols-2'
      case 'three-columns':
        return 'grid-cols-3'
      case 'one-third-left':
        return 'grid-cols-3 [&>:first-child]:col-span-1 [&>:last-child]:col-span-2'
      case 'one-third-right':
        return 'grid-cols-3 [&>:first-child]:col-span-2 [&>:last-child]:col-span-1'
      case 'vertical':
        return 'grid-cols-1'
      default:
        return 'grid-cols-1'
    }
  }

  const isSpecialSection = ['header-section', 'hero-section', 'footer-section', 'features-section'].includes(section.id)

  const handleSaveSection = () => {
    if (sectionName.trim()) {
      const { addCustomSection } = usePageStore.getState()
      
      // Count widgets in the section for better metadata
      const widgetCount = section.areas.reduce((count, area) => count + area.widgets.length, 0)
      
      const customSection = {
        id: crypto.randomUUID(),
        name: sectionName.trim(),
        description: sectionDescription.trim() || 'Custom saved section',
        widgets: section.areas.flatMap(area => area.widgets), // Store flattened widget list for easier counting
        section: {
          ...section,
          id: crypto.randomUUID() // Generate new ID for the saved section
        }
      }
      addCustomSection(customSection)
      setShowSaveModal(false)
      setSectionName('')
      setSectionDescription('')
      
      // Show success notification
      showToast(`"${sectionName.trim()}" saved successfully with ${widgetCount} widget${widgetCount !== 1 ? 's' : ''}!`, 'success')
    }
  }

  const handleDuplicateSection = () => {
    const { replaceCanvasItems, canvasItems } = usePageStore.getState()
    const sectionIndex = canvasItems.findIndex(item => item.id === section.id)
    
    if (sectionIndex !== -1) {
      const duplicatedSection = JSON.parse(JSON.stringify(section))
      duplicatedSection.id = crypto.randomUUID()
      // Update all widget IDs in the duplicated section
      duplicatedSection.areas = duplicatedSection.areas.map((area: any) => ({
        ...area,
        id: crypto.randomUUID(),
        widgets: area.widgets.map((widget: any) => ({
          ...widget,
          id: crypto.randomUUID(),
          sectionId: duplicatedSection.id
        }))
      }))
      
      const newCanvasItems = [...canvasItems]
      newCanvasItems.splice(sectionIndex + 1, 0, duplicatedSection)
      replaceCanvasItems(newCanvasItems)
      
      // Show success notification
      const widgetCount = section.areas.reduce((count, area) => count + area.widgets.length, 0)
      showToast(`Section duplicated successfully with ${widgetCount} widget${widgetCount !== 1 ? 's' : ''}!`, 'success')
    }
  }

  return (
    <>
      <div 
        className={`group ${isSpecialSection ? 'p-2 hover:bg-gray-50 border-2 border-transparent hover:border-blue-200' : 'border-2 border-purple-200 bg-purple-50 p-2 rounded hover:border-blue-400 hover:bg-purple-100'} transition-all relative cursor-pointer`}
        onClick={(e) => {
          e.stopPropagation()
          const newValue = activeSectionToolbar === section.id ? null : section.id
          // Close any widget toolbar and toggle section toolbar
          setActiveWidgetToolbar(null)
          setActiveSectionToolbar(newValue)
          // Select the section for properties panel (use selectWidget directly)
          const { selectWidget } = usePageStore.getState()
          selectWidget(section.id)
        }}
      >
        {/* Section Action Toolbar - appears on click */}
        {activeSectionToolbar === section.id && (
          <div className="absolute -top-2 -right-2 transition-opacity z-20">
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg shadow-lg px-2 py-1">
              <div 
                {...dragAttributes}
                {...dragListeners}
                className="p-1 text-gray-500 hover:text-gray-700 cursor-grab active:cursor-grabbing rounded hover:bg-gray-100 transition-colors"
                title="Drag to reorder section"
              >
                <GripVertical className="w-3 h-3" />
              </div>
              <button
                onClick={handleDuplicateSection}
                className="p-1 text-gray-500 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors"
                title="Duplicate section"
              >
                <Copy className="w-3 h-3" />
              </button>
              <button
                onClick={() => setShowSaveModal(true)}
                className="p-1 text-gray-500 hover:text-green-600 rounded hover:bg-green-50 transition-colors"
                title="Save as custom section"
              >
                <BookOpen className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  // Could add section properties/settings here in the future
                }}
                className="p-1 text-gray-500 hover:text-purple-600 rounded hover:bg-purple-50 transition-colors"
                title="Section properties"
              >
                <Edit className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  const { replaceCanvasItems, canvasItems } = usePageStore.getState()
                  const newCanvasItems = canvasItems.filter(item => item.id !== section.id)
                  replaceCanvasItems(newCanvasItems)
                }}
                className="p-1 text-gray-500 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                title="Delete section"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
        
        {!isSpecialSection && (
          <div className="flex items-center gap-2 mb-2 px-2">
            <span className="text-xs font-medium text-purple-700">Content Block</span>
            <span className="text-xs text-purple-600">{section.layout}</span>
            <span className="text-xs text-gray-500">(Click section to show toolbar)</span>
          </div>
        )}
      
      <div className={`grid gap-2 ${getLayoutClasses(section.layout)}`}>
        {section.areas.map((area) => {
          // Make area droppable for library widgets
          const { isOver, setNodeRef: setDropRef } = useDroppable({
            id: `drop-${area.id}`,
            data: {
              type: 'section-area',
              sectionId: section.id,
              areaId: area.id
            }
          })
          
          // Debug logging for drop zone
          React.useEffect(() => {
            if (isOver) {
              console.log('🎯 Drop zone active:', area.id, 'in section:', section.id)
            }
          }, [isOver, area.id, section.id])
          
          return (
          <div 
            ref={setDropRef}
            key={area.id} 
            className={`relative ${
              isSpecialSection 
                ? '' 
                : area.widgets.length === 0 
                  ? `min-h-20 border-2 border-dashed rounded p-4 bg-white transition-all ${
                      activeDropZone === `drop-${area.id}` 
                        ? 'border-green-400 bg-green-50 ring-2 ring-green-200' 
                        : isOver 
                        ? 'border-blue-400 bg-blue-50' 
                        : 'border-purple-300 opacity-60'
                    }` 
                  : activeDropZone === `drop-${area.id}` 
                    ? 'bg-green-50 rounded p-2 ring-2 ring-green-200 border-2 border-green-300' 
                    : activeDropZone === `drop-${area.id}` 
                      ? 'bg-green-50 rounded p-2 ring-2 ring-green-200 border-2 border-green-300' 
                      : 'bg-white rounded p-2'
            }`}
          >
            {!isSpecialSection && area.widgets.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <span className={`text-xs transition-colors ${
                  activeDropZone === `drop-${area.id}` 
                    ? 'text-green-700 font-bold' 
                    : isOver 
                    ? 'text-blue-600 font-medium' 
                    : 'text-purple-400'
                }`}>
                  {activeDropZone === `drop-${area.id}` 
                    ? 'ACTIVE DROP ZONE' 
                    : isOver 
                    ? 'Drop widget here' 
                    : 'Drop widgets here'}
                </span>
              </div>
            )}
            
            {/* Active Drop Zone Indicator for Populated Areas */}
            {area.widgets.length > 0 && activeDropZone === `drop-${area.id}` && (
              <div className="absolute top-1 right-1 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold z-10 shadow-lg">
                ACTIVE DROP ZONE
              </div>
            )}
            
            {area.widgets.map((widget) => (
              <DraggableWidgetInSection
                key={widget.id}
                widget={widget}
                sectionId={section.id}
                areaId={area.id}
                activeSectionToolbar={activeSectionToolbar}
                setActiveSectionToolbar={setActiveSectionToolbar}
                activeWidgetToolbar={activeWidgetToolbar}
                setActiveWidgetToolbar={setActiveWidgetToolbar}
                onWidgetClick={onWidgetClick}
              />
            ))}
          </div>
        )})}
      </div>
      </div>
      
      {/* Save Section Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
            <h3 className="text-lg font-semibold mb-4">Save Custom Section</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section Name *
                </label>
                <input
                  type="text"
                  value={sectionName}
                  onChange={(e) => setSectionName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter section name"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={sectionDescription}
                  onChange={(e) => setSectionDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md h-20 resize-none"
                  placeholder="Enter section description"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowSaveModal(false)
                  setSectionName('')
                  setSectionDescription('')
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSection}
                disabled={!sectionName.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Section
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default function App() {
  const { currentView } = usePageStore()
  
  // Expose usePageStore to window for component access (for prototype only)
  useEffect(() => {
    (window as any).usePageStore = usePageStore
  }, [])
  
  // Global click handler to close toolbars
  useEffect(() => {
    const handleGlobalClick = () => {
      // This will be handled by individual components
    }
    
    document.addEventListener('click', handleGlobalClick)
    return () => document.removeEventListener('click', handleGlobalClick)
  }, [])
  
  if (currentView === 'site-manager') {
    return <SiteManager />
  }
  
  return <PageBuilder />
}