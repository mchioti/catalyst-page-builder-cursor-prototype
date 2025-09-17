import { useMemo, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import React from 'react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, useDroppable, useDraggable } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, ChevronDown, Code, Lightbulb, Building2, Info, BookOpen, Settings, X, Plus, Check, Home, Palette, FileText, Globe, Users, Cog, ArrowLeft, Copy, Trash2, Edit } from 'lucide-react'
import { create } from 'zustand'
import { LIBRARY_CONFIG, type LibraryItem as SpecItem, type LibraryCategory as SpecCategory } from './library'

// Main app routing types
type AppView = 'page-builder' | 'site-manager'
type SiteManagerView = 'overview' | 'themes' | 'templates' | 'websites' | 'users' | 'settings'

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

type PageState = {
  // Routing
  currentView: AppView
  siteManagerView: SiteManagerView
  setCurrentView: (view: AppView) => void
  setSiteManagerView: (view: SiteManagerView) => void
  // Page Builder
  canvasItems: CanvasItem[] // Can contain both individual widgets and sections
  customSections: CustomSection[]
  publicationCardVariants: PublicationCardVariant[]
  selectedWidget: string | null
  insertPosition: { relativeTo: string; position: 'above' | 'below' } | null
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
            sectionId: 'header-section'
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
            sectionId: 'hero-section'
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
          setActiveSectionToolbar(null)
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
        // Special styling for Wiley logo - styled text widget, not image
        return (
          <SkinWrap skin={widget.skin}>
            <div className="flex items-center px-6 py-4">
              <h1 className="text-xl font-bold text-blue-800">
                Wiley
              </h1>
            </div>
          </SkinWrap>
        )
      }
      
      if (isHeroText) {
        // Special styling for hero text - large title with blue background like original
        return (
          <SkinWrap skin={widget.skin}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800"></div>
              <div className="relative px-6 py-12 text-center">
                <h1 className="text-4xl font-bold text-white mb-4">
                  Wiley Online Library
                </h1>
                <p className="text-xl text-blue-100">
                  {widget.text.split('\n').slice(1).join(' ') || 'The world\'s research at your fingertips'}
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
        // Special styling for feature cards - title and description
        const lines = widget.text.split('\n').filter(line => line.trim())
        const title = lines[0] || ''
        const description = lines.slice(1).join(' ') || ''
        
        return (
          <SkinWrap skin={widget.skin}>
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">{title}</h3>
              {description && <p className="text-gray-600 text-sm leading-relaxed">{description}</p>}
            </div>
          </SkinWrap>
        )
      }
      
      return (
        <SkinWrap skin={widget.skin}>
          <div className={`px-6 py-4 ${alignClass}`}>
            <p className="text-gray-700">{widget.text}</p>
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
  setCurrentView: (view) => set({ currentView: view }),
  setSiteManagerView: (view) => set({ siteManagerView: view }),
  
  // Page Builder
  canvasItems: INITIAL_CANVAS_ITEMS,
  customSections: [],
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

// Site Manager Publication Cards configurator
function SiteManagerPublicationCards() {
  const { publicationCardVariants, addPublicationCardVariant, removePublicationCardVariant } = usePageStore()
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)
  const [editingConfig, setEditingConfig] = useState<PublicationCardConfig>(DEFAULT_PUBLICATION_CARD_CONFIG)
  const [variantName, setVariantName] = useState('')
  const [variantDescription, setVariantDescription] = useState('')

  const handleCreateVariant = () => {
    if (!variantName.trim()) return
    
    const newVariant: PublicationCardVariant = {
      id: crypto.randomUUID(),
      name: variantName.trim(),
      description: variantDescription.trim(),
      config: { ...editingConfig },
      createdAt: new Date()
    }
    
    addPublicationCardVariant(newVariant)
    setVariantName('')
    setVariantDescription('')
    setEditingConfig(DEFAULT_PUBLICATION_CARD_CONFIG)
  }

  const handleLoadVariant = (variant: PublicationCardVariant) => {
    setSelectedVariant(variant.id)
    setEditingConfig({ ...variant.config })
    setVariantName(variant.name)
    setVariantDescription(variant.description || '')
  }

  const handleUpdateVariant = () => {
    if (!selectedVariant) return
    
    // Remove old variant and add updated one
    removePublicationCardVariant(selectedVariant)
    
    const updatedVariant: PublicationCardVariant = {
      id: selectedVariant,
      name: variantName.trim(),
      description: variantDescription.trim(),
      config: { ...editingConfig },
      createdAt: new Date()
    }
    
    addPublicationCardVariant(updatedVariant)
  }

  const handleSaveAsNewVariant = () => {
    if (!variantName.trim()) return
    
    const newVariant: PublicationCardVariant = {
      id: crypto.randomUUID(),
      name: variantName.trim(),
      description: variantDescription.trim(),
      config: { ...editingConfig },
      createdAt: new Date()
    }
    
    addPublicationCardVariant(newVariant)
    setSelectedVariant(null)
    setVariantName('')
    setVariantDescription('')
    setEditingConfig(DEFAULT_PUBLICATION_CARD_CONFIG)
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Publication Card Configurator</h2>
        <p className="text-gray-600">Configure how publication metadata is displayed across your site. Create variants for different contexts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Configuration Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Card Configuration</h3>
              {selectedVariant && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">Editing: {variantName}</span>
              )}
            </div>

            {/* Variant Name and Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Variant Name</label>
                <input
                  type="text"
                  value={variantName}
                  onChange={(e) => setVariantName(e.target.value)}
                  placeholder="e.g., Compact List"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <input
                  type="text"
                  value={variantDescription}
                  onChange={(e) => setVariantDescription(e.target.value)}
                  placeholder="Brief description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Configuration Sections */}
            <div className="space-y-6">
              {/* Content Identification */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Content Identification</h4>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingConfig.showContentTypeLabel}
                      onChange={(e) => setEditingConfig({...editingConfig, showContentTypeLabel: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Content Type Label</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingConfig.showTitle}
                      onChange={(e) => setEditingConfig({...editingConfig, showTitle: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Article/Chapter Title</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingConfig.showSubtitle}
                      onChange={(e) => setEditingConfig({...editingConfig, showSubtitle: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Subtitle</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingConfig.showThumbnail}
                      onChange={(e) => setEditingConfig({...editingConfig, showThumbnail: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Thumbnail</span>
                  </label>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Thumbnail Position</label>
                    <select
                      value={editingConfig.thumbnailPosition}
                      onChange={(e) => setEditingConfig({...editingConfig, thumbnailPosition: e.target.value as any})}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    >
                      <option value="top">Top</option>
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                      <option value="bottom">Bottom</option>
                      <option value="underlay">Underlay</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Author Information */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Author Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingConfig.showAuthors}
                      onChange={(e) => setEditingConfig({...editingConfig, showAuthors: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Show Authors</span>
                  </label>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Author Style</label>
                    <select
                      value={editingConfig.authorStyle}
                      onChange={(e) => setEditingConfig({...editingConfig, authorStyle: e.target.value as any})}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    >
                      <option value="full">Full Names</option>
                      <option value="initials">Initials</option>
                    </select>
                  </div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingConfig.showAffiliations}
                      onChange={(e) => setEditingConfig({...editingConfig, showAffiliations: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Affiliations</span>
                  </label>
                </div>
              </div>

              {/* Publication Context */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Publication Context</h4>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingConfig.showPublicationTitle}
                      onChange={(e) => setEditingConfig({...editingConfig, showPublicationTitle: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Journal/Book Title</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingConfig.showVolumeIssue}
                      onChange={(e) => setEditingConfig({...editingConfig, showVolumeIssue: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Volume & Issue</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingConfig.showChapterPages}
                      onChange={(e) => setEditingConfig({...editingConfig, showChapterPages: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Chapter Pages</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingConfig.showPublicationDate}
                      onChange={(e) => setEditingConfig({...editingConfig, showPublicationDate: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Publication Date</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingConfig.showDOI}
                      onChange={(e) => setEditingConfig({...editingConfig, showDOI: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">DOI</span>
                  </label>
                </div>
              </div>

              {/* Content Summary */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Content Summary</h4>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingConfig.showAbstract}
                      onChange={(e) => setEditingConfig({...editingConfig, showAbstract: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Abstract</span>
                  </label>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Abstract Length</label>
                    <select
                      value={editingConfig.abstractLength}
                      onChange={(e) => setEditingConfig({...editingConfig, abstractLength: e.target.value as any})}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    >
                      <option value="short">Short</option>
                      <option value="medium">Medium</option>
                      <option value="long">Long</option>
                    </select>
                  </div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingConfig.showKeywords}
                      onChange={(e) => setEditingConfig({...editingConfig, showKeywords: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Keywords</span>
                  </label>
                </div>
              </div>

              {/* Access & Usage */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Access & Usage</h4>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingConfig.showAccessStatus}
                      onChange={(e) => setEditingConfig({...editingConfig, showAccessStatus: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Access Status</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingConfig.showViewDownloadOptions}
                      onChange={(e) => setEditingConfig({...editingConfig, showViewDownloadOptions: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">View/Download Options</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingConfig.showUsageMetrics}
                      onChange={(e) => setEditingConfig({...editingConfig, showUsageMetrics: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Usage Metrics</span>
                  </label>
                </div>
              </div>

              {/* Display Configuration */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Display Configuration</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Title Style</label>
                    <select
                      value={editingConfig.titleStyle}
                      onChange={(e) => setEditingConfig({...editingConfig, titleStyle: e.target.value as any})}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t border-gray-200">
              {selectedVariant ? (
                <>
                  <button
                    onClick={handleUpdateVariant}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Update Variant
                  </button>
                  <button
                    onClick={handleSaveAsNewVariant}
                    disabled={!variantName.trim()}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Save as New Variant
                  </button>
                  <button
                    onClick={() => {
                      setSelectedVariant(null)
                      setVariantName('')
                      setVariantDescription('')
                      setEditingConfig(DEFAULT_PUBLICATION_CARD_CONFIG)
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel Edit
                  </button>
                </>
              ) : (
                <button
                  onClick={handleCreateVariant}
                  disabled={!variantName.trim()}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Variant
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Live Preview */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Preview</h3>
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <PublicationCard 
                article={MOCK_SCHOLARLY_ARTICLES[0]}
                config={editingConfig}
              />
            </div>
          </div>

          {/* Saved Variants */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Saved Variants</h3>
            <div className="space-y-3">
              {publicationCardVariants.map((variant) => (
                <div key={variant.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{variant.name}</h4>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleLoadVariant(variant)}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => removePublicationCardVariant(variant.id)}
                        className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  {variant.description && (
                    <p className="text-sm text-gray-600">{variant.description}</p>
                  )}
                </div>
              ))}
              {publicationCardVariants.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No variants saved yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
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
              { id: 'themes', label: 'Themes', icon: Palette },
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
                  <p className="text-gray-500 text-xs">Coming soon</p>
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
            <SiteManagerPublicationCards />
          )}
          {siteManagerView === 'templates' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Templates</h2>
              <p className="text-gray-600">Template management - Coming soon</p>
            </div>
          )}
          {siteManagerView === 'websites' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Websites</h2>
              <p className="text-gray-600">Website management - Coming soon</p>
            </div>
          )}
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

// Library component to show widgets and sections with collapsible categories
function WidgetLibrary() {
  const { addWidget } = usePageStore()
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['core', 'publishing']) // Expand core and publishing categories by default
  )
  
  const handleAddWidget = (item: SpecItem) => {
    const newWidget = buildWidget(item)
    addWidget(newWidget)
  }

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
                          <button
                            key={item.id}
                            onClick={() => handleAddWidget(item)}
                            className="block w-full text-left p-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700 rounded transition-colors"
                          >
                            {item.label}
                            {item.status === 'planned' && (
                              <span className="ml-2 text-xs text-orange-600">(Planned)</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )) || (
                    // Handle categories with direct items (no groups)
                    category.items?.map((item: any) => (
                      <button
                        key={item.id}
                        onClick={() => handleAddWidget(item)}
                        className="block w-full text-left p-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700 rounded transition-colors"
                      >
                        {item.label}
                        {item.status === 'planned' && (
                          <span className="ml-2 text-xs text-orange-600">(Planned)</span>
                        )}
                      </button>
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

// Pre-fabricated sections templates based on AXP 2.0 specifications
const PREFAB_SECTIONS = {
  // Global Sections (site-wide persistent elements)
  'global-header': {
    name: 'Header Section',
    description: 'Site-wide header with logo and navigation',
    category: 'Global Sections',
    template: {
      name: 'Header',
      type: 'content-block',
      layout: 'one-third-left' as ContentBlockLayout,
      areas: [
        {
          id: crypto.randomUUID(),
          name: 'Logo Area',
          widgets: [
            {
              id: crypto.randomUUID(),
              type: 'text',
              skin: 'minimal',
              text: 'Your Site Name',
              align: 'left'
            } as TextWidget
          ]
        },
        {
          id: crypto.randomUUID(),
          name: 'Navigation Area',
          widgets: [
            {
              id: crypto.randomUUID(),
              type: 'navbar',
              skin: 'minimal',
              links: [
                { label: 'Home', href: '#' },
                { label: 'Browse', href: '#' },
                { label: 'Search', href: '#' },
                { label: 'Help', href: '#' }
              ]
            } as NavbarWidget
          ]
        }
      ]
    }
  },
  'global-footer': {
    name: 'Footer Section',
    description: 'Site-wide footer with links and copyright',
    category: 'Global Sections',
    template: {
      name: 'Footer',
      type: 'content-block',
      layout: 'one-column' as ContentBlockLayout,
      areas: [
        {
          id: crypto.randomUUID(),
          name: 'Footer Content',
          widgets: [
            {
              id: crypto.randomUUID(),
              type: 'text',
              skin: 'minimal',
              text: '© 2025 Your Organization. All rights reserved.',
              align: 'left'
            } as TextWidget
          ]
        }
      ]
    }
  },
  
  // Content Sections (pre-built layout patterns for main content)
  'content-hero': {
    name: 'Hero Section',
    description: 'Large, visually prominent area with heading, text, and CTA',
    category: 'Content Sections',
    template: {
      name: 'Hero',
      type: 'content-block',
      layout: 'vertical' as ContentBlockLayout,
      areas: [
        {
          id: crypto.randomUUID(),
          name: 'Hero Image',
          widgets: [
            {
              id: crypto.randomUUID(),
              type: 'image',
              skin: 'minimal',
              src: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2426&q=80',
              alt: 'Hero banner image',
              ratio: '16:9'
            } as ImageWidget
          ]
        },
        {
          id: crypto.randomUUID(),
          name: 'Hero Content',
          widgets: [
            {
              id: crypto.randomUUID(),
              type: 'text',
              skin: 'minimal',
              text: 'Welcome to Our Publication Platform\nDiscover research that changes the world',
              align: 'center'
            } as TextWidget
          ]
        }
      ]
    }
  },
  'content-banner': {
    name: 'Banner Section',
    description: 'Full-width strip with background, 1-2 columns for content',
    category: 'Content Sections',
    template: {
      name: 'Banner',
      type: 'content-block',
      layout: 'two-columns' as ContentBlockLayout,
      areas: [
        {
          id: crypto.randomUUID(),
          name: 'Left Column',
          widgets: [
            {
              id: crypto.randomUUID(),
              type: 'text',
              skin: 'minimal',
              text: 'Featured Content\nHighlight your most important announcements',
              align: 'left'
            } as TextWidget
          ]
        },
        {
          id: crypto.randomUUID(),
          name: 'Right Column',
          widgets: [
            {
              id: crypto.randomUUID(),
              type: 'text',
              skin: 'minimal',
              text: 'Call to Action\nEngage your audience with compelling content',
              align: 'right'
            } as TextWidget
          ]
        }
      ]
    }
  },
  'content-features': {
    name: 'Features Section',
    description: 'Three-column showcase for highlighting key features',
    category: 'Content Sections',
    template: {
      name: 'Features',
      type: 'content-block',
      layout: 'three-columns' as ContentBlockLayout,
      areas: [
        {
          id: crypto.randomUUID(),
          name: 'Feature 1',
          widgets: [
            {
              id: crypto.randomUUID(),
              type: 'text',
              skin: 'minimal',
              text: 'Research Excellence\nAccess cutting-edge research publications',
              align: 'center'
            } as TextWidget
          ]
        },
        {
          id: crypto.randomUUID(),
          name: 'Feature 2',
          widgets: [
            {
              id: crypto.randomUUID(),
              type: 'text',
              skin: 'minimal',
              text: 'Global Reach\nConnect with scholars worldwide',
              align: 'center'
            } as TextWidget
          ]
        },
        {
          id: crypto.randomUUID(),
          name: 'Feature 3',
          widgets: [
            {
              id: crypto.randomUUID(),
              type: 'text',
              skin: 'minimal',
              text: 'Open Access\nFree access to knowledge for all',
              align: 'center'
            } as TextWidget
          ]
        }
      ]
    }
  },
  'content-recent-articles': {
    name: 'Recent Articles Section',
    description: 'Display most recently published articles',
    category: 'Content Sections',
    template: {
      name: 'Recent Articles',
      type: 'content-block',
      layout: 'one-column' as ContentBlockLayout,
      areas: [
        {
          id: crypto.randomUUID(),
          name: 'Articles List',
          widgets: [
            {
              id: crypto.randomUUID(),
              type: 'publication-list',
              skin: 'minimal',
              contentSource: 'dynamic-query',
              publications: MOCK_SCHOLARLY_ARTICLES,
              cardConfig: DEFAULT_PUBLICATION_CARD_CONFIG,
              layout: 'list',
              maxItems: 5
            } as PublicationListWidget
          ]
        }
      ]
    }
  }
}

// Sections Content component
function SectionsContent() {
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
                        const sectionCopy = {
                          ...section.section,
                          id: crypto.randomUUID(),
                          areas: section.section.areas.map(area => ({
                            ...area,
                            id: crypto.randomUUID(),
                            widgets: area.widgets.map(widget => ({
                              ...widget,
                              id: crypto.randomUUID(),
                              sectionId: section.section.id
                            }))
                          }))
                        }
                        addSection(sectionCopy)
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
function DIYZoneContent() {
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
                        const sectionCopy = {
                          ...section.section,
                          id: crypto.randomUUID(),
                          areas: section.section.areas.map(area => ({
                            ...area,
                            id: crypto.randomUUID(),
                            widgets: area.widgets.map(widget => ({
                              ...widget,
                              id: crypto.randomUUID(),
                              sectionId: section.section.id
                            }))
                          }))
                        }
                        addSection(sectionCopy)
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
  
  // Find selected widget/section
  const selectedItem = canvasItems.find(item => item.id === selectedWidget)
  if (!selectedItem) {
    return (
      <div className="p-4">
        <div className="text-center py-12">
          <p className="text-gray-500">Selected item not found</p>
        </div>
      </div>
    )
  }
  
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
  const { canvasItems, setCurrentView, selectWidget, selectedWidget, setInsertPosition, createContentBlockWithLayout } = usePageStore()
  const [leftSidebarTab, setLeftSidebarTab] = useState<LeftSidebarTab>('library')
  const [showLayoutPicker, setShowLayoutPicker] = useState(false)
  const [activeSectionToolbar, setActiveSectionToolbar] = useState<string | null>(null)
  const [activeWidgetToolbar, setActiveWidgetToolbar] = useState<string | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const { moveItem } = usePageStore.getState()
      const oldIndex = canvasItems.findIndex((item) => item.id === active.id)
      const newIndex = canvasItems.findIndex((item) => item.id === over.id)
      
      if (oldIndex !== -1 && newIndex !== -1) {
        moveItem(oldIndex, newIndex)
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
    setActiveSectionToolbar(activeSectionToolbar === sectionId ? null : sectionId)
    selectWidget(sectionId)
  }

  const handleWidgetClick = (widgetId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    // Close any section toolbar and toggle widget toolbar
    setActiveSectionToolbar(null)
    setActiveWidgetToolbar(activeWidgetToolbar === widgetId ? null : widgetId)
    selectWidget(widgetId)
  }

  return (
    <div 
      className="min-h-screen bg-gray-50 flex"
      onClick={() => {
        // Close all toolbars when clicking outside elements
        setActiveSectionToolbar(null)
        setActiveWidgetToolbar(null)
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
          {leftSidebarTab === 'sections' && <SectionsContent />}
          {leftSidebarTab === 'diy-zone' && <DIYZoneContent />}
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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
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
                          setActiveSectionToolbar={setActiveSectionToolbar}
                          activeWidgetToolbar={activeWidgetToolbar}
                          setActiveWidgetToolbar={setActiveWidgetToolbar}
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
          </DndContext>
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
    </div>
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
  setActiveWidgetToolbar
}: { 
  item: CanvasItem
  isSelected: boolean
  onSectionClick: (id: string, e: React.MouseEvent) => void
  onWidgetClick: (id: string, e: React.MouseEvent) => void
  activeSectionToolbar: string | null
  setActiveSectionToolbar: (value: string | null) => void
  activeWidgetToolbar: string | null
  setActiveWidgetToolbar: (value: string | null) => void
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
          />
        </div>
      ) : (
        <div 
          onClick={(e) => {
            e.stopPropagation()
            // Close any section toolbar and toggle widget toolbar
            setActiveSectionToolbar(null)
            setActiveWidgetToolbar(activeWidgetToolbar === item.id ? null : item.id)
            onWidgetClick(item.id, e)
          }}
          className="cursor-pointer hover:ring-2 hover:ring-blue-300 rounded transition-all relative"
        >
          {/* Standalone Widget Action Toolbar - appears on click */}
          {activeWidgetToolbar === item.id && (
            <div className="absolute -top-2 -right-2 transition-opacity z-20">
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg shadow-lg px-2 py-1">
              <div 
                {...attributes}
                {...listeners}
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
      )}
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
  setActiveWidgetToolbar
}: { 
  section: WidgetSection
  onWidgetClick: (id: string, e: React.MouseEvent) => void
  dragAttributes?: any
  dragListeners?: any
  activeSectionToolbar: string | null
  setActiveSectionToolbar: (value: string | null) => void
  activeWidgetToolbar: string | null
  setActiveWidgetToolbar: (value: string | null) => void
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
      const customSection = {
        id: crypto.randomUUID(),
        name: sectionName.trim(),
        description: sectionDescription.trim() || 'Custom saved section',
        section: {
          ...section,
          id: crypto.randomUUID() // Generate new ID for the saved section
        }
      }
      addCustomSection(customSection)
      setShowSaveModal(false)
      setSectionName('')
      setSectionDescription('')
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
    }
  }

  return (
    <>
      <div 
        className={`group ${isSpecialSection ? 'p-2 hover:bg-gray-50' : 'border border-purple-200 bg-purple-50 p-2 rounded hover:border-blue-300'} transition-colors relative cursor-pointer`}
        onClick={(e) => {
          e.stopPropagation()
          // Close any widget toolbar and toggle section toolbar
          setActiveWidgetToolbar(null)
          setActiveSectionToolbar(activeSectionToolbar === section.id ? null : section.id)
          // Also select the section for properties panel
          onWidgetClick(section.id, e)
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
            </div>
          </div>
        )}
        
        {!isSpecialSection && (
          <div className="flex items-center gap-2 mb-2 px-2">
            <span className="text-xs font-medium text-purple-700">Content Block</span>
            <span className="text-xs text-purple-600">{section.layout}</span>
          </div>
        )}
      
      <div className={`grid gap-2 ${getLayoutClasses(section.layout)}`}>
        {section.areas.map((area) => (
          <div 
            key={area.id} 
            className={`${
              isSpecialSection 
                ? '' 
                : area.widgets.length === 0 
                  ? 'min-h-16 border-2 border-dashed border-purple-300 rounded p-2 bg-white opacity-60' 
                  : 'bg-white rounded p-2'
            }`}
          >
            {!isSpecialSection && area.widgets.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <span className="text-xs text-purple-400">Drop widgets here</span>
              </div>
            )}
            
            {area.widgets.map((widget) => (
              <div 
                key={widget.id}
                onClick={(e) => {
                  e.stopPropagation()
                  // Close any section toolbar and toggle widget toolbar
                  setActiveSectionToolbar(null)
                  setActiveWidgetToolbar(activeWidgetToolbar === widget.id ? null : widget.id)
                  onWidgetClick(widget.id, e)
                }}
                className="cursor-pointer hover:ring-2 hover:ring-blue-300 rounded transition-all group relative"
              >
                {/* Widget Action Toolbar - appears on click */}
                {activeWidgetToolbar === widget.id && (
                  <div className="absolute -top-2 -right-2 transition-opacity z-20">
                    <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg shadow-lg px-2 py-1">
                      <div 
                        className="p-1 text-gray-500 hover:text-gray-700 cursor-grab rounded hover:bg-gray-100 transition-colors"
                        title="Drag handle (visual only)"
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
                <WidgetRenderer 
                  widget={widget} 
                  onWidgetClick={onWidgetClick}
                  activeSectionToolbar={activeSectionToolbar}
                  setActiveSectionToolbar={setActiveSectionToolbar}
                  activeWidgetToolbar={activeWidgetToolbar}
                  setActiveWidgetToolbar={setActiveWidgetToolbar}
                />
              </div>
            ))}
          </div>
        ))}
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