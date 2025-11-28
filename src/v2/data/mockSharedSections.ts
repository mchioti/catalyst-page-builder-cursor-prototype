/**
 * Mock Shared Sections - Testing data for V2
 * These sections will be used to compose pages
 */

import { nanoid } from 'nanoid'
import type { SharedSection } from '../types/core'

// ============================================================================
// HEADERS
// ============================================================================

export const mockHeaderSection: SharedSection = {
  id: 'header-main',
  name: 'Main Header',
  category: 'header',
  description: 'Primary site header with logo and navigation',
  isGlobal: true,
  allowOverrides: true,
  lockLevel: 'unlocked',
  usedBy: [],
  themeId: 'foundation-theme-v1',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-11-24'),
  
  variations: {
    full: {
      id: 'header-full',
      name: 'Full Header',
      description: 'Header with logo, menu, and search',
      layout: 'flexible',
      
      widgets: [
        {
          id: 'header-logo-widget',
          type: 'image',
          skin: 'minimal',
          src: 'https://febs.onlinelibrary.wiley.com/pb-assets/tmp-images/footer-logo-wiley-1510029248417.png',
          alt: 'Site Logo',
          ratio: 'auto',
          alignment: 'left',
          width: 'auto',
          objectFit: 'contain'
        },
        {
          id: 'header-menu-widget',
          type: 'menu',
          skin: 'minimal',
          menuType: 'global',
          style: 'horizontal',
          align: 'right',
          items: [
            { id: nanoid(), label: 'Home', url: '/', target: '_self', displayCondition: 'always', order: 0 },
            { id: nanoid(), label: 'About', url: '/about', target: '_self', displayCondition: 'always', order: 1 },
            { id: nanoid(), label: 'Articles', url: '/articles', target: '_self', displayCondition: 'always', order: 2 },
            { id: nanoid(), label: 'Contact', url: '/contact', target: '_self', displayCondition: 'always', order: 3 }
          ],
          flexProperties: { grow: true }
        },
        {
          id: 'header-spacer-widget',
          type: 'spacer',
          skin: 'minimal',
          height: '1rem'
        }
      ],
      
      flexConfig: {
        direction: 'row',
        wrap: true,
        justifyContent: 'flex-start',
        gap: '2rem'
      },
      
      background: {
        type: 'color',
        color: '#000000'
      },
      contentMode: 'dark',
      
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-11-24')
    },
    
    minimal: {
      id: 'header-minimal',
      name: 'Minimal Header',
      description: 'Inherits from Full Header, hides spacer',
      layout: 'flexible',
      
      // NEW: Inherits from Full Header
      inheritsFrom: 'full',
      
      // Hide the spacer widget
      hiddenWidgetIds: ['header-spacer-widget'],
      
      // No new widgets added
      widgets: [],
      
      // Override: Tighter spacing
      flexConfig: {
        direction: 'row',
        wrap: false,
        justifyContent: 'space-between',
        gap: '1rem'
      },
      
      // Inherited from parent
      background: {
        type: 'color',
        color: '#000000'
      },
      contentMode: 'dark',
      
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-11-24')
    }
  }
}

// ============================================================================
// FOOTERS
// ============================================================================

export const mockFooterSection: SharedSection = {
  id: 'footer-main',
  name: 'Main Footer',
  category: 'footer',
  description: 'Site footer with info and links',
  isGlobal: true,
  allowOverrides: true,
  lockLevel: 'unlocked',
  usedBy: [],
  themeId: 'foundation-theme-v1',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-11-24'),
  
  variations: {
    full: {
      id: 'footer-full',
      name: 'Full Footer',
      description: 'Complete footer with multiple columns',
      layout: 'three-columns',
      
      widgets: [
        {
          id: nanoid(),
          type: 'heading',
          skin: 'minimal',
          text: 'About Us',
          level: 3,
          align: 'left',
          style: 'default'
        },
        {
          id: nanoid(),
          type: 'text',
          skin: 'minimal',
          text: 'Leading academic publisher serving the research community.',
          align: 'left'
        },
        {
          id: nanoid(),
          type: 'heading',
          skin: 'minimal',
          text: 'Quick Links',
          level: 3,
          align: 'left',
          style: 'default'
        },
        {
          id: nanoid(),
          type: 'menu',
          skin: 'minimal',
          menuType: 'global',
          style: 'vertical',
          items: [
            { id: nanoid(), label: 'Submit Article', url: '/submit', target: '_self', displayCondition: 'always', order: 0 },
            { id: nanoid(), label: 'Subscribe', url: '/subscribe', target: '_self', displayCondition: 'always', order: 1 },
            { id: nanoid(), label: 'Contact', url: '/contact', target: '_self', displayCondition: 'always', order: 2 }
          ]
        }
      ],
      
      background: {
        type: 'color',
        color: '#1a1a1a'
      },
      contentMode: 'dark',
      
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-11-24')
    },
    
    compact: {
      id: 'footer-compact',
      name: 'Compact Footer',
      description: 'Minimal footer with copyright',
      layout: 'one-column',
      
      widgets: [
        {
          id: nanoid(),
          type: 'text',
          skin: 'minimal',
          text: '© 2024 Academic Publishing. All rights reserved.',
          align: 'center'
        }
      ],
      
      background: {
        type: 'color',
        color: '#1a1a1a'
      },
      contentMode: 'dark',
      
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-11-24')
    }
  }
}

// ============================================================================
// HERO SECTIONS
// ============================================================================

export const mockHeroSection: SharedSection = {
  id: 'hero-main',
  name: 'Hero Section',
  category: 'hero',
  description: 'Hero banner for homepage',
  isGlobal: false,
  allowOverrides: true,
  lockLevel: 'unlocked',
  usedBy: [],
  themeId: 'foundation-theme-v1',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-11-24'),
  
  variations: {
    centered: {
      id: 'hero-centered',
      name: 'Centered Hero',
      description: 'Hero with centered text and CTA',
      layout: 'one-column',
      
      widgets: [
        {
          id: nanoid(),
          type: 'heading',
          skin: 'minimal',
          text: 'Welcome to Academic Publishing',
          level: 1,
          align: 'center',
          style: 'hero'
        },
        {
          id: nanoid(),
          type: 'text',
          skin: 'minimal',
          text: 'Discover cutting-edge research and scholarly articles from leading experts worldwide.',
          align: 'center'
        },
        {
          id: nanoid(),
          type: 'spacer',
          skin: 'minimal',
          height: '2rem'
        }
      ],
      
      background: {
        type: 'gradient',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      },
      contentMode: 'dark',
      
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-11-24')
    },
    
    split: {
      id: 'hero-split',
      name: 'Split Hero',
      description: 'Hero with text and image side by side',
      layout: 'two-columns',
      
      widgets: [
        {
          id: nanoid(),
          type: 'heading',
          skin: 'minimal',
          text: 'Advancing Scientific Knowledge',
          level: 1,
          align: 'left',
          style: 'hero'
        },
        {
          id: nanoid(),
          type: 'text',
          skin: 'minimal',
          text: 'Join thousands of researchers sharing groundbreaking discoveries.',
          align: 'left'
        },
        {
          id: nanoid(),
          type: 'image',
          skin: 'minimal',
          src: 'https://picsum.photos/seed/hero/800/600',
          alt: 'Research imagery',
          ratio: '16:9',
          alignment: 'center',
          width: 'full',
          objectFit: 'cover'
        }
      ],
      
      background: {
        type: 'color',
        color: '#f8f9fa'
      },
      contentMode: 'light',
      
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-11-24')
    },
    
    minimal: {
      id: 'hero-minimal',
      name: 'Minimal Hero',
      description: 'Simple hero with just title',
      layout: 'one-column',
      
      widgets: [
        {
          id: nanoid(),
          type: 'heading',
          skin: 'minimal',
          text: 'Latest Research Articles',
          level: 1,
          align: 'left',
          style: 'hero'
        }
      ],
      
      background: {
        type: 'color',
        color: '#ffffff'
      },
      contentMode: 'light',
      
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-11-24')
    }
  }
}

// ============================================================================
// CONTENT SECTIONS
// ============================================================================

export const mockContentSection: SharedSection = {
  id: 'content-blocks',
  name: 'Content Blocks',
  category: 'content',
  description: 'Flexible content sections',
  isGlobal: false,
  allowOverrides: true,
  lockLevel: 'unlocked',
  usedBy: [],
  themeId: 'foundation-theme-v1',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-11-24'),
  
  variations: {
    'text-only': {
      id: 'content-text',
      name: 'Text Content',
      description: 'Simple text content block',
      layout: 'one-column',
      
      widgets: [
        {
          id: nanoid(),
          type: 'heading',
          skin: 'minimal',
          text: 'About This Publication',
          level: 2,
          align: 'left',
          style: 'default'
        },
        {
          id: nanoid(),
          type: 'text',
          skin: 'minimal',
          text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
          align: 'left'
        }
      ],
      
      background: {
        type: 'color',
        color: '#ffffff'
      },
      contentMode: 'light',
      
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-11-24')
    },
    
    'two-column': {
      id: 'content-two-col',
      name: 'Two Column Content',
      description: 'Content split into two columns',
      layout: 'two-columns',
      
      widgets: [
        {
          id: nanoid(),
          type: 'heading',
          skin: 'minimal',
          text: 'Our Mission',
          level: 2,
          align: 'left',
          style: 'default'
        },
        {
          id: nanoid(),
          type: 'text',
          skin: 'minimal',
          text: 'To advance scientific knowledge through rigorous peer review and open access publishing.',
          align: 'left'
        },
        {
          id: nanoid(),
          type: 'heading',
          skin: 'minimal',
          text: 'Our Impact',
          level: 2,
          align: 'left',
          style: 'default'
        },
        {
          id: nanoid(),
          type: 'text',
          skin: 'minimal',
          text: 'Over 10,000 articles published, reaching researchers in 150 countries worldwide.',
          align: 'left'
        }
      ],
      
      background: {
        type: 'color',
        color: '#f8f9fa'
      },
      contentMode: 'light',
      
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-11-24')
    },
    
    'image-text': {
      id: 'content-img-text',
      name: 'Image with Text',
      description: 'Image alongside text content',
      layout: 'two-columns',
      
      widgets: [
        {
          id: nanoid(),
          type: 'image',
          skin: 'minimal',
          src: 'https://picsum.photos/seed/content/600/400',
          alt: 'Content image',
          ratio: '4:3',
          alignment: 'center',
          width: 'full',
          objectFit: 'cover'
        },
        {
          id: nanoid(),
          type: 'heading',
          skin: 'minimal',
          text: 'Featured Research',
          level: 2,
          align: 'left',
          style: 'default'
        },
        {
          id: nanoid(),
          type: 'text',
          skin: 'minimal',
          text: 'Explore our latest featured articles covering breakthrough discoveries in molecular biology, climate science, and artificial intelligence.',
          align: 'left'
        }
      ],
      
      background: {
        type: 'color',
        color: '#ffffff'
      },
      contentMode: 'light',
      
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-11-24')
    },
    
    grid: {
      id: 'content-grid',
      name: 'Grid Layout',
      description: 'Content in grid format',
      layout: 'three-columns',
      
      widgets: [
        {
          id: nanoid(),
          type: 'heading',
          skin: 'minimal',
          text: 'Open Access',
          level: 3,
          align: 'center',
          style: 'default'
        },
        {
          id: nanoid(),
          type: 'text',
          skin: 'minimal',
          text: 'Free access to research',
          align: 'center'
        },
        {
          id: nanoid(),
          type: 'heading',
          skin: 'minimal',
          text: 'Peer Reviewed',
          level: 3,
          align: 'center',
          style: 'default'
        },
        {
          id: nanoid(),
          type: 'text',
          skin: 'minimal',
          text: 'Rigorous quality standards',
          align: 'center'
        },
        {
          id: nanoid(),
          type: 'heading',
          skin: 'minimal',
          text: 'Global Reach',
          level: 3,
          align: 'center',
          style: 'default'
        },
        {
          id: nanoid(),
          type: 'text',
          skin: 'minimal',
          text: 'Researchers worldwide',
          align: 'center'
        }
      ],
      
      background: {
        type: 'color',
        color: '#f8f9fa'
      },
      contentMode: 'light',
      
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-11-24')
    },
    
    // NEW: Journal browse page variations
    'featured-journals': {
      id: 'content-featured-journals',
      name: 'Featured Journals',
      description: 'Highlighted journals for homepage',
      layout: 'one-column',
      
      widgets: [
        {
          id: nanoid(),
          type: 'heading',
          skin: 'minimal',
          text: 'Featured Journals',
          level: 2,
          align: 'center',
          style: 'default'
        },
        {
          id: nanoid(),
          type: 'text',
          skin: 'minimal',
          text: 'Explore our leading publications in science, medicine, and technology.',
          align: 'center'
        }
      ],
      
      background: {
        type: 'color',
        color: '#ffffff'
      },
      contentMode: 'light',
      
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-11-28')
    },
    
    'journals-grid': {
      id: 'content-journals-grid',
      name: 'Journals Grid',
      description: 'Grid of all journals with cards',
      layout: 'grid',
      gridConfig: {
        columns: 3,
        gap: '2rem'
      },
      
      widgets: [
        {
          id: nanoid(),
          type: 'text',
          skin: 'minimal',
          text: '📚 {website.journals.length} journals available. Click any journal to explore.',
          align: 'center'
        }
      ],
      
      background: {
        type: 'color',
        color: '#f8fafc'
      },
      contentMode: 'light',
      
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-11-28')
    },
    
    'issues-list': {
      id: 'content-issues-list',
      name: 'Issues List',
      description: 'Archive of journal issues by volume',
      layout: 'one-column',
      
      widgets: [
        {
          id: nanoid(),
          type: 'heading',
          skin: 'minimal',
          text: 'All Issues',
          level: 2,
          align: 'left',
          style: 'default'
        },
        {
          id: nanoid(),
          type: 'text',
          skin: 'minimal',
          text: 'Browse all volumes and issues of {journal.name}.',
          align: 'left'
        }
      ],
      
      background: {
        type: 'color',
        color: '#ffffff'
      },
      contentMode: 'light',
      
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-11-28')
    },
    
    'articles-list': {
      id: 'content-articles-list',
      name: 'Articles List',
      description: 'List of articles with publication cards',
      layout: 'one-column',
      
      widgets: [
        {
          id: nanoid(),
          type: 'heading',
          skin: 'minimal',
          text: 'Articles in this Issue',
          level: 2,
          align: 'left',
          style: 'default'
        },
        {
          id: 'articles-publication-list',
          type: 'publication-list',
          skin: 'minimal',
          contentSource: 'doi-list',
          publications: [],
          cardConfig: {
            showContentTypeLabel: true,
            showTitle: true,
            showSubtitle: false,
            showThumbnail: false,
            thumbnailPosition: 'left',
            showPublicationTitle: false,
            showVolumeIssue: false,
            showBookSeriesTitle: false,
            showChapterPages: false,
            showNumberOfIssues: false,
            showPublicationDate: true,
            showDOI: true,
            showISSN: false,
            showISBN: false,
            showAuthors: true,
            authorStyle: 'full',
            showAffiliations: false,
            showAbstract: true,
            abstractLength: 'short',
            showKeywords: false,
            showAccessStatus: true,
            showViewDownloadOptions: true,
            showUsageMetrics: false,
            titleStyle: 'medium'
          },
          layout: 'list',
          maxItems: 10,
          align: 'left'
        }
      ],
      
      background: {
        type: 'color',
        color: '#ffffff'
      },
      contentMode: 'light',
      
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-11-28')
    },
    
    'latest-articles': {
      id: 'content-latest-articles',
      name: 'Latest Articles',
      description: 'Most recent publications',
      layout: 'one-column',
      
      widgets: [
        {
          id: nanoid(),
          type: 'heading',
          skin: 'minimal',
          text: 'Latest Articles',
          level: 2,
          align: 'left',
          style: 'default'
        },
        {
          id: 'latest-publication-list',
          type: 'publication-list',
          skin: 'minimal',
          contentSource: 'doi-list',
          publications: [],
          cardConfig: {
            showContentTypeLabel: false,
            showTitle: true,
            showSubtitle: false,
            showThumbnail: false,
            thumbnailPosition: 'left',
            showPublicationTitle: false,
            showVolumeIssue: false,
            showBookSeriesTitle: false,
            showChapterPages: false,
            showNumberOfIssues: false,
            showPublicationDate: true,
            showDOI: false,
            showISSN: false,
            showISBN: false,
            showAuthors: true,
            authorStyle: 'initials',
            showAffiliations: false,
            showAbstract: false,
            abstractLength: 'short',
            showKeywords: false,
            showAccessStatus: false,
            showViewDownloadOptions: false,
            showUsageMetrics: false,
            titleStyle: 'medium'
          },
          layout: 'list',
          maxItems: 5,
          align: 'left'
        }
      ],
      
      background: {
        type: 'color',
        color: '#ffffff'
      },
      contentMode: 'light',
      
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-11-28')
    },
    
    'search-results': {
      id: 'content-search-results',
      name: 'Search Results',
      description: 'Search results with filters',
      layout: 'two-columns',
      
      widgets: [
        {
          id: nanoid(),
          type: 'heading',
          skin: 'minimal',
          text: 'Filter Results',
          level: 3,
          align: 'left',
          style: 'default'
        },
        {
          id: nanoid(),
          type: 'text',
          skin: 'minimal',
          text: '🔽 Publication Type\n🔽 Year\n🔽 Access Type\n🔽 Journal',
          align: 'left'
        },
        {
          id: 'search-publication-list',
          type: 'publication-list',
          skin: 'minimal',
          contentSource: 'dynamic-query',
          publications: [],
          cardConfig: {
            showContentTypeLabel: true,
            showTitle: true,
            showSubtitle: false,
            showThumbnail: false,
            thumbnailPosition: 'left',
            showPublicationTitle: true,
            showVolumeIssue: true,
            showBookSeriesTitle: false,
            showChapterPages: false,
            showNumberOfIssues: false,
            showPublicationDate: true,
            showDOI: true,
            showISSN: false,
            showISBN: false,
            showAuthors: true,
            authorStyle: 'full',
            showAffiliations: false,
            showAbstract: true,
            abstractLength: 'medium',
            showKeywords: true,
            showAccessStatus: true,
            showViewDownloadOptions: true,
            showUsageMetrics: false,
            titleStyle: 'large'
          },
          layout: 'list',
          maxItems: 20,
          align: 'left'
        }
      ],
      
      background: {
        type: 'color',
        color: '#ffffff'
      },
      contentMode: 'light',
      
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-11-28')
    },
    
    'journal-sidebar': {
      id: 'content-journal-sidebar',
      name: 'Journal Sidebar',
      description: 'Sidebar with current issue and metrics',
      layout: 'one-column',
      
      widgets: [
        {
          id: nanoid(),
          type: 'heading',
          skin: 'minimal',
          text: 'Current Issue',
          level: 3,
          align: 'left',
          style: 'default'
        },
        {
          id: nanoid(),
          type: 'image',
          skin: 'minimal',
          src: '{issue.coverImageUrl}',
          alt: 'Current issue cover',
          ratio: '3:4',
          alignment: 'center',
          width: 'full',
          objectFit: 'cover'
        },
        {
          id: nanoid(),
          type: 'text',
          skin: 'minimal',
          text: 'Volume {issue.volume}, Issue {issue.issue}\n{issue.month} {issue.year}',
          align: 'center'
        },
        {
          id: nanoid(),
          type: 'divider',
          skin: 'minimal',
          style: 'solid',
          thickness: '1px',
          color: '#e5e7eb',
          marginTop: '1rem',
          marginBottom: '1rem'
        },
        {
          id: nanoid(),
          type: 'heading',
          skin: 'minimal',
          text: 'Journal Metrics',
          level: 4,
          align: 'left',
          style: 'default'
        },
        {
          id: nanoid(),
          type: 'text',
          skin: 'minimal',
          text: '📊 Impact Factor: {journal.impactFactor}\n📈 CiteScore: --\n📥 Downloads: --',
          align: 'left'
        }
      ],
      
      background: {
        type: 'color',
        color: '#f8fafc'
      },
      contentMode: 'light',
      
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-11-28')
    }
  }
}

// ============================================================================
// JOURNAL BANNER (Publication-specific header)
// ============================================================================

export const mockJournalBannerSection: SharedSection = {
  id: 'journal-banner',
  name: 'Journal Banner',
  category: 'hero',
  description: 'Base template for journal banners (fork and customize per journal)',
  isGlobal: true,
  allowOverrides: true,
  lockLevel: 'unlocked',
  usedBy: [],
  themeId: 'foundation-theme-v1',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-11-25'),
  
  variations: {
    full: {
      id: 'journal-banner-full',
      name: 'Full (Journal Home)',
      description: 'Complete banner with title, description, metadata, and navigation (template)',
      layout: 'flexible',
      
      widgets: [
        {
          id: 'journal-banner-title',
          type: 'heading',
          skin: 'minimal',
          text: '{journal.name}',
          level: 1,
          align: 'left',
          style: 'hero',
          color: 'default',
          size: 'auto'
        },
        {
          id: 'journal-banner-description',
          type: 'text',
          skin: 'minimal',
          text: '{journal.description}',
          align: 'left'
        },
        {
          id: 'journal-banner-metadata',
          type: 'text',
          skin: 'minimal',
          text: '<strong>ISSN:</strong> {journal.issn.print} (Print) | {journal.issn.online} (Online)<br><strong>Impact Factor:</strong> {journal.impactFactor} | <strong>Open Access:</strong> {journal.isOpenAccess}',
          align: 'left'
        },
        {
          id: 'journal-banner-menu',
          type: 'menu',
          skin: 'minimal',
          menuType: 'global',
          style: 'horizontal',
          align: 'left',
          items: [
            { id: nanoid(), label: 'Home', url: '/journal/home', target: '_self', displayCondition: 'always', order: 0 },
            { id: nanoid(), label: 'Archive', url: '/journal/archive', target: '_self', displayCondition: 'always', order: 1 },
            { id: nanoid(), label: 'Submit', url: '/journal/submit', target: '_self', displayCondition: 'always', order: 2 },
            { id: nanoid(), label: 'About', url: '/journal/about', target: '_self', displayCondition: 'always', order: 3 }
          ]
        },
        {
          id: 'journal-banner-spacer',
          type: 'spacer',
          skin: 'minimal',
          height: '2rem'
        }
      ],
      
      flexConfig: {
        direction: 'column',
        wrap: false,
        justifyContent: 'flex-start',
        gap: '1rem'
      },
      
      background: {
        type: 'color',
        color: '{journal.branding.primaryColor}'
      },
      contentMode: 'dark',
      
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-11-25')
    },
    
    archive: {
      id: 'journal-banner-archive',
      name: 'Archive View',
      description: 'Simplified banner for archive pages',
      layout: 'flexible',
      
      inheritsFrom: 'full',
      hiddenWidgetIds: ['journal-banner-description', 'journal-banner-metadata', 'journal-banner-spacer'],
      
      widgets: [],
      
      flexConfig: {
        direction: 'column',
        wrap: false,
        justifyContent: 'flex-start',
        gap: '0.5rem'
      },
      
      background: {
        type: 'color',
        color: '{journal.branding.primaryColor}'
      },
      contentMode: 'dark',
      
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-11-25')
    },
    
    issue: {
      id: 'journal-banner-issue',
      name: 'Issue View',
      description: 'Banner showing issue-specific metadata',
      layout: 'flexible',
      
      inheritsFrom: 'full',
      hiddenWidgetIds: ['journal-banner-spacer'],
      
      // Override description and metadata for issue-specific content
      widgetOverrides: [
        {
          widgetId: 'journal-banner-description',
          properties: {
            text: 'Volume 45, Issue 12 - December 2024. Special Issue on Quantum Computing and AI.'
          }
        },
        {
          widgetId: 'journal-banner-metadata',
          properties: {
            text: '<strong>Published:</strong> December 1, 2024 | <strong>Articles:</strong> 24 | <strong>Pages:</strong> 450-720'
          }
        }
      ],
      
      widgets: [],
      
      background: {
        type: 'color',
        color: '{journal.branding.primaryColor}'
      },
      contentMode: 'dark',
      
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-11-25')
    },
    
    minimal: {
      id: 'journal-banner-minimal',
      name: 'Minimal (Article)',
      description: 'Compact banner for article pages',
      layout: 'flexible',
      
      inheritsFrom: 'full',
      hiddenWidgetIds: ['journal-banner-description', 'journal-banner-metadata', 'journal-banner-spacer'],
      
      // Override title to be smaller
      widgetOverrides: [
        {
          widgetId: 'journal-banner-title',
          properties: {
            level: 3,
            style: 'default'
          }
        }
      ],
      
      widgets: [],
      
      flexConfig: {
        direction: 'row',
        wrap: false,
        justifyContent: 'space-between',
        gap: '1rem'
      },
      
      background: {
        type: 'color',
        color: '{journal.branding.primaryColor}'
      },
      contentMode: 'dark',
      
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-11-25')
    }
  }
}

// ============================================================================
// JOURNAL NAVIGATION (Context-Aware)
// ============================================================================

export const mockJournalNavSection: SharedSection = {
  id: 'journal-nav',
  name: 'Journal Navigation',
  category: 'navigation',
  description: 'Context-aware navigation for journal pages',
  isGlobal: true,
  allowOverrides: true,
  lockLevel: 'unlocked',
  usedBy: [],
  themeId: 'foundation-theme-v1',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-11-28'),
  
  variations: {
    default: {
      id: 'journal-nav-default',
      name: 'Default Journal Nav',
      description: 'Horizontal journal navigation with contextual links',
      layout: 'flexible',
      
      widgets: [
        {
          id: 'journal-nav-menu',
          type: 'menu',
          skin: 'minimal',
          menuType: 'context-aware',
          contextSource: 'journal',
          style: 'horizontal',
          align: 'left',
          items: [
            { id: nanoid(), label: 'Journal Home', url: '/journal/{journal.id}', target: '_self', displayCondition: 'always', order: 0 },
            { id: nanoid(), label: 'Current Issue', url: '/journal/{journal.id}/toc/current', target: '_self', displayCondition: 'if-issue-exists', order: 1 },
            { id: nanoid(), label: 'All Issues', url: '/journal/{journal.id}/loi', target: '_self', displayCondition: 'if-has-archive', order: 2 },
            { id: nanoid(), label: 'Submit', url: '/journal/{journal.id}/submit', target: '_self', displayCondition: 'always', order: 3 },
            { id: nanoid(), label: 'About', url: '/journal/{journal.id}/about', target: '_self', displayCondition: 'always', order: 4 }
          ]
        }
      ],
      
      flexConfig: {
        direction: 'row',
        wrap: false,
        justifyContent: 'flex-start',
        gap: '0'
      },
      
      background: {
        type: 'color',
        color: '#1e3a5f'  // Dark blue
      },
      contentMode: 'dark',
      
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-11-28')
    }
  }
}

// ============================================================================
// SEARCH HEADER
// ============================================================================

export const mockSearchHeaderSection: SharedSection = {
  id: 'search-header',
  name: 'Search Header',
  category: 'hero',
  description: 'Search page header with search input and filters',
  isGlobal: true,
  allowOverrides: true,
  lockLevel: 'unlocked',
  usedBy: [],
  themeId: 'foundation-theme-v1',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-11-28'),
  
  variations: {
    default: {
      id: 'search-header-default',
      name: 'Default Search Header',
      description: 'Search input with result count',
      layout: 'one-column',
      
      widgets: [
        {
          id: 'search-title',
          type: 'heading',
          skin: 'minimal',
          text: 'Search Results',
          level: 1,
          align: 'left'
        },
        {
          id: 'search-query-display',
          type: 'text',
          skin: 'minimal',
          text: 'Showing results for "{search.query}"',
          align: 'left'
        },
        {
          id: 'search-results-count',
          type: 'text',
          skin: 'minimal',
          text: '{search.totalResults} results found',
          align: 'left'
        }
      ],
      
      background: {
        type: 'color',
        color: '#f8fafc'
      },
      
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-11-28')
    }
  }
}

// ============================================================================
// ISSUE NAVIGATION (Prev/Next)
// ============================================================================

export const mockIssueNavigationSection: SharedSection = {
  id: 'issue-navigation',
  name: 'Issue Navigation',
  category: 'navigation',
  description: 'Navigation between issues with section filters',
  isGlobal: true,
  allowOverrides: true,
  lockLevel: 'unlocked',
  usedBy: [],
  themeId: 'foundation-theme-v1',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-11-28'),
  
  variations: {
    default: {
      id: 'issue-nav-default',
      name: 'Default Issue Navigation',
      description: 'Prev/Next issue links and section jump',
      layout: 'flexible',
      
      widgets: [
        {
          id: 'issue-nav-info',
          type: 'text',
          skin: 'minimal',
          text: '<strong>Volume {issue.volume}, Issue {issue.issue}</strong> • {issue.month} {issue.year}',
          align: 'left'
        },
        {
          id: 'issue-nav-spacer',
          type: 'spacer',
          skin: 'minimal',
          height: '1rem',
          flexProperties: { grow: true }
        },
        {
          id: 'issue-nav-prev-next',
          type: 'menu',
          skin: 'minimal',
          menuType: 'custom',
          style: 'horizontal',
          align: 'right',
          items: [
            { id: nanoid(), label: '← Previous Issue', url: '/journal/{journal.id}/toc/{issue.prevVol}/{issue.prevIssue}', target: '_self', displayCondition: 'always', order: 0 },
            { id: nanoid(), label: 'Next Issue →', url: '/journal/{journal.id}/toc/{issue.nextVol}/{issue.nextIssue}', target: '_self', displayCondition: 'always', order: 1 }
          ]
        }
      ],
      
      flexConfig: {
        direction: 'row',
        wrap: false,
        justifyContent: 'space-between',
        gap: '1rem'
      },
      
      background: {
        type: 'color',
        color: '#f1f5f9'
      },
      
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-11-28')
    }
  }
}

// ============================================================================
// ARTICLE SECTIONS
// ============================================================================

export const mockArticleHeaderSection: SharedSection = {
  id: 'article-header',
  name: 'Article Header',
  category: 'hero',
  description: 'Article title, authors, and metadata',
  isGlobal: true,
  allowOverrides: true,
  lockLevel: 'unlocked',
  usedBy: [],
  themeId: 'foundation-theme-v1',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-11-28'),
  
  variations: {
    default: {
      id: 'article-header-default',
      name: 'Default Article Header',
      description: 'Full article header with all metadata',
      layout: 'one-column',
      
      widgets: [
        {
          id: 'article-title',
          type: 'heading',
          skin: 'minimal',
          text: '{article.title}',
          level: 1,
          align: 'left',
          style: 'default'
        },
        {
          id: 'article-authors',
          type: 'text',
          skin: 'minimal',
          text: '{article.authors}',
          align: 'left'
        },
        {
          id: 'article-meta',
          type: 'text',
          skin: 'minimal',
          text: '<strong>DOI:</strong> {article.doi} | <strong>Published:</strong> {article.publishedAt} | <strong>Pages:</strong> {article.pageRange}',
          align: 'left'
        },
        {
          id: 'article-metrics',
          type: 'text',
          skin: 'minimal',
          text: '📊 {article.citations} citations • 📥 {article.downloads} downloads',
          align: 'left'
        }
      ],
      
      background: {
        type: 'color',
        color: '#ffffff'
      },
      
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-11-28')
    }
  }
}

export const mockArticleContentSection: SharedSection = {
  id: 'article-content',
  name: 'Article Content',
  category: 'content',
  description: 'Article abstract and full text',
  isGlobal: true,
  allowOverrides: true,
  lockLevel: 'unlocked',
  usedBy: [],
  themeId: 'foundation-theme-v1',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-11-28'),
  
  variations: {
    default: {
      id: 'article-content-default',
      name: 'Default Article Content',
      description: 'Abstract and publication details',
      layout: 'one-column',
      
      widgets: [
        {
          id: 'article-abstract-heading',
          type: 'heading',
          skin: 'minimal',
          text: 'Abstract',
          level: 2,
          align: 'left'
        },
        {
          id: 'article-abstract',
          type: 'text',
          skin: 'minimal',
          text: '{article.abstract}',
          align: 'left'
        },
        {
          id: 'article-divider',
          type: 'divider',
          skin: 'minimal',
          style: 'solid',
          thickness: '1px',
          color: '#e5e7eb',
          marginTop: '2rem',
          marginBottom: '2rem'
        },
        {
          id: 'article-access-note',
          type: 'text',
          skin: 'minimal',
          text: '{article.isOpenAccess:This article is Open Access and freely available.|Access options available below.}',
          align: 'left'
        }
      ],
      
      background: {
        type: 'color',
        color: '#ffffff'
      },
      
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-11-28')
    }
  }
}

export const mockArticleSidebarSection: SharedSection = {
  id: 'article-sidebar',
  name: 'Article Sidebar',
  category: 'content',
  description: 'Article download options and related articles',
  isGlobal: true,
  allowOverrides: true,
  lockLevel: 'unlocked',
  usedBy: [],
  themeId: 'foundation-theme-v1',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-11-28'),
  
  variations: {
    default: {
      id: 'article-sidebar-default',
      name: 'Default Article Sidebar',
      description: 'Download buttons and related content',
      layout: 'one-column',
      
      widgets: [
        {
          id: 'sidebar-download-heading',
          type: 'heading',
          skin: 'minimal',
          text: 'Access Options',
          level: 3,
          align: 'left'
        },
        {
          id: 'sidebar-pdf-button',
          type: 'button',
          skin: 'primary',
          text: '📄 Download PDF',
          href: '{article.pdfUrl}',
          style: 'solid',
          color: 'color1',
          size: 'medium',
          align: 'left'
        },
        {
          id: 'sidebar-cite-button',
          type: 'button',
          skin: 'minimal',
          text: '📎 Cite This Article',
          href: '#cite',
          style: 'outline',
          color: 'color2',
          size: 'small',
          align: 'left'
        },
        {
          id: 'sidebar-divider',
          type: 'divider',
          skin: 'minimal',
          style: 'solid',
          thickness: '1px',
          color: '#e5e7eb',
          marginTop: '1rem',
          marginBottom: '1rem'
        },
        {
          id: 'sidebar-share-heading',
          type: 'heading',
          skin: 'minimal',
          text: 'Share',
          level: 4,
          align: 'left'
        },
        {
          id: 'sidebar-share-menu',
          type: 'menu',
          skin: 'minimal',
          menuType: 'custom',
          style: 'vertical',
          align: 'left',
          items: [
            { id: nanoid(), label: '🐦 Twitter', url: 'https://twitter.com/share?url={article.doi}', target: '_blank', displayCondition: 'always', order: 0 },
            { id: nanoid(), label: '💼 LinkedIn', url: 'https://linkedin.com/share?url={article.doi}', target: '_blank', displayCondition: 'always', order: 1 },
            { id: nanoid(), label: '📧 Email', url: 'mailto:?subject={article.title}&body={article.doi}', target: '_self', displayCondition: 'always', order: 2 }
          ]
        }
      ],
      
      background: {
        type: 'color',
        color: '#f8fafc'
      },
      
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-11-28')
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const mockSharedSections: SharedSection[] = [
  mockHeaderSection,
  mockFooterSection,
  mockHeroSection,
  mockContentSection,
  mockJournalBannerSection,
  mockJournalNavSection,
  mockSearchHeaderSection,
  mockIssueNavigationSection,
  mockArticleHeaderSection,
  mockArticleContentSection,
  mockArticleSidebarSection
]

