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
// JOURNAL-SPECIFIC BANNERS (Forks for each journal)
// ============================================================================

// Export all mock sections
export const mockSharedSections: SharedSection[] = [
  mockHeaderSection,
  mockFooterSection,
  mockHeroSection,
  mockContentSection,
  mockJournalBannerSection
]

