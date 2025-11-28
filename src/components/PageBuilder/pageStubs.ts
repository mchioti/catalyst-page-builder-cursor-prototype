/**
 * Page Stubs - Pre-defined canvas content for each page type
 * Based on Maria's Catalyst-home-maria stub structure
 * 
 * NOTE: Template variables like {journal.name} are replaced at render time
 * by the CanvasRenderer's templateContext processing, not by widget types.
 * 
 * Page Types:
 * - Homepage (stub-based, no inheritance)
 * - Journals Browse (stub-based)
 * - About (stub-based)
 * - Search Results (stub-based)
 * - Journal Home (template-based, inherits)
 * - Issue Archive / LOI (template-based)
 * - Issue TOC (template-based)
 * - Article Page (template-based)
 */

import { nanoid } from 'nanoid'

// Use 'any' for canvas items since the types are complex and we're building stubs
// The runtime validation happens in the renderers
type CanvasItemStub = any

// =============================================================================
// STUB-BASED PAGES (one-off, no inheritance)
// =============================================================================

/**
 * Homepage Stub - Based on Catalyst-home-maria
 */
export function createHomepageStub(): CanvasItemStub[] {
  return [
    // Hero Section
    {
      id: nanoid(),
      name: 'Hero Section',
      type: 'hero',
      layout: 'hero-with-buttons',
      areas: [
        {
          id: nanoid(),
          name: 'Hero Content',
          widgets: [
            {
              id: nanoid(),
              type: 'heading',
              sectionId: '',
              skin: 'minimal',
              text: 'Catalyst Demo Site',
              level: 1,
              align: 'center',
              style: 'hero',
              color: 'primary',
              size: 'auto',
              icon: { enabled: false, position: 'left', emoji: '🚀' },
              gridSpan: { column: 'span 3' }
            },
            {
              id: nanoid(),
              type: 'text',
              sectionId: '',
              skin: 'minimal',
              text: 'Discover groundbreaking research across 3 peer-reviewed journals',
              align: 'center',
              gridSpan: { column: 'span 3' }
            }
          ]
        },
        {
          id: nanoid(),
          name: 'Button Row',
          widgets: [
            {
              id: nanoid(),
              type: 'button',
              sectionId: '',
              skin: 'minimal',
              text: 'Browse Journals',
              href: '/live/catalyst-demo/journals',
              variant: 'primary',
              size: 'large',
              style: 'outline',
              color: 'color2',
              align: 'right'
            },
            {
              id: nanoid(),
              type: 'button',
              sectionId: '',
              skin: 'minimal',
              text: 'Search Articles',
              href: '/live/catalyst-demo/search',
              variant: 'secondary',
              size: 'large',
              color: 'color1'
            }
          ]
        }
      ],
      background: {
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
      },
      styling: {
        paddingTop: 'large',
        paddingBottom: 'large',
        paddingLeft: 'medium',
        paddingRight: 'medium',
        gap: 'medium',
        variant: 'full-width',
        textColor: 'white'
      },
      minHeight: '400px'
    },
    // Featured Journals Section
    {
      id: nanoid(),
      name: 'Featured Journals',
      type: 'content-block',
      layout: 'header-plus-grid',
      areas: [
        {
          id: nanoid(),
          name: 'Header',
          widgets: [
            {
              id: nanoid(),
              type: 'heading',
              sectionId: '',
              skin: 'minimal',
              text: 'Featured Journals',
              level: 2,
              align: 'center',
              style: 'default',
              color: 'default',
              size: 'auto',
              icon: { enabled: false, position: 'left', emoji: '📚' }
            }
          ]
        },
        {
          id: nanoid(),
          name: 'Left Card',
          widgets: [
            {
              id: nanoid(),
              skin: 'minimal',
              type: 'editorial-card',
              layout: 'split',
              content: {
                preheader: { enabled: false, text: '' },
                headline: { enabled: true, text: 'Journal of Advanced Science (JAS)' },
                description: { enabled: true, text: 'Publishing groundbreaking research in all fields of science since 1985...' },
                callToAction: { enabled: true, text: 'Explore Journal', url: '/live/catalyst-demo/journal/jas', type: 'link' }
              },
              image: { src: 'https://picsum.photos/800/600?random=jas', alt: 'JAS Cover' },
              config: { contentAlignment: 'left', imagePosition: 'top', overlayOpacity: 60, useAccentColor: true },
              sectionId: ''
            }
          ]
        },
        {
          id: nanoid(),
          name: 'Center Card',
          widgets: [
            {
              id: nanoid(),
              skin: 'minimal',
              type: 'editorial-card',
              layout: 'split',
              content: {
                preheader: { enabled: true, text: 'Open Access' },
                headline: { enabled: true, text: 'Open Access Biology (OAB)' },
                description: { enabled: true, text: 'Freely accessible research in biological sciences...' },
                callToAction: { enabled: true, text: 'Explore Journal', url: '/live/catalyst-demo/journal/oab', type: 'link' }
              },
              image: { src: 'https://picsum.photos/800/600?random=oab', alt: 'OAB Cover' },
              config: { contentAlignment: 'left', imagePosition: 'top', overlayOpacity: 60, useAccentColor: true },
              sectionId: ''
            }
          ]
        },
        {
          id: nanoid(),
          name: 'Right Card',
          widgets: [
            {
              id: nanoid(),
              skin: 'minimal',
              type: 'editorial-card',
              layout: 'split',
              content: {
                preheader: { enabled: true, text: 'Archive' },
                headline: { enabled: true, text: 'Historical Chemistry Quarterly (HCQ)' },
                description: { enabled: true, text: 'Archive of chemical research from 1920-2020...' },
                callToAction: { enabled: true, text: 'Explore Journal', url: '/live/catalyst-demo/journal/hcq', type: 'link' }
              },
              image: { src: 'https://picsum.photos/800/600?random=hcq', alt: 'HCQ Cover' },
              config: { contentAlignment: 'left', imagePosition: 'top', overlayOpacity: 60, useAccentColor: true },
              sectionId: ''
            }
          ]
        }
      ],
      background: { type: 'color', color: '#f8fafc', opacity: 1 },
      styling: {
        paddingTop: 'large',
        paddingBottom: 'large',
        paddingLeft: 'medium',
        paddingRight: 'medium',
        gap: 'medium',
        variant: 'full-width',
        textColor: 'default'
      }
    },
    // Latest Articles Section
    {
      id: nanoid(),
      name: 'Latest Articles Header',
      type: 'content-block',
      layout: 'one-column',
      areas: [
        {
          id: nanoid(),
          name: 'Content',
          widgets: [
            {
              id: nanoid(),
              skin: 'minimal',
              type: 'heading',
              text: 'Latest Articles',
              level: 2,
              align: 'left',
              style: 'default',
              color: 'default',
              size: 'auto',
              icon: { enabled: false, position: 'left', emoji: '🎯' },
              sectionId: ''
            }
          ]
        }
      ]
    },
    // Publication List Grid
    {
      id: nanoid(),
      name: 'Publications Grid',
      type: 'content-block',
      layout: 'grid',
      areas: [
        {
          id: nanoid(),
          name: 'Grid Items',
          widgets: [
            {
              id: nanoid(),
              skin: 'minimal',
              type: 'publication-list',
              contentSource: 'dynamic-query',
              publications: [], // Will be populated dynamically
              cardConfig: {
                showContentTypeLabel: true,
                showTitle: true,
                showSubtitle: true,
                showThumbnail: true,
                thumbnailPosition: 'top',
                showPublicationTitle: true,
                showVolumeIssue: true,
                showPublicationDate: true,
                showDOI: true,
                showAuthors: true,
                authorStyle: 'full',
                showAffiliations: false,
                showAbstract: true,
                abstractLength: 'medium',
                showAccessStatus: true,
                showViewDownloadOptions: true,
                titleStyle: 'large'
              },
              layout: 'list',
              maxItems: 6,
              spanningConfig: {
                enabled: true,
                preset: 'custom',
                customPattern: [1, 2, 2, 1, 1, 2]
              },
              internalGridColumns: 3,
              sectionId: ''
            }
          ]
        }
      ],
      gridConfig: {
        columns: 3,
        gap: '1rem',
        alignItems: 'stretch',
        justifyItems: 'stretch'
      }
    }
  ]
}

/**
 * Journals Browse Page Stub
 */
export function createJournalsBrowseStub(): CanvasItemStub[] {
  return [
    // Hero Section
    {
      id: nanoid(),
      name: 'Browse Hero',
      type: 'hero',
      layout: 'hero-with-buttons',
      areas: [
        {
          id: nanoid(),
          name: 'Hero Content',
          widgets: [
            {
              id: nanoid(),
              type: 'heading',
              sectionId: '',
              skin: 'minimal',
              text: 'Browse Our Journals',
              level: 1,
              align: 'center',
              style: 'hero',
              color: 'primary',
              size: 'auto',
              icon: { enabled: false, position: 'left', emoji: '📚' }
            },
            {
              id: nanoid(),
              type: 'text',
              sectionId: '',
              skin: 'minimal',
              text: 'Explore our collection of peer-reviewed journals across multiple disciplines',
              align: 'center'
            }
          ]
        }
      ],
      background: {
        type: 'gradient',
        gradient: {
          type: 'linear',
          direction: 'to bottom',
          stops: [
            { color: '#0f766e', position: '0%' },
            { color: '#14b8a6', position: '100%' }
          ]
        },
        opacity: 1
      },
      styling: {
        paddingTop: 'large',
        paddingBottom: 'large',
        paddingLeft: 'medium',
        paddingRight: 'medium',
        gap: 'medium',
        variant: 'full-width',
        textColor: 'white'
      },
      minHeight: '300px'
    },
    // Journals Grid
    {
      id: nanoid(),
      name: 'Journals Grid',
      type: 'content-block',
      layout: 'header-plus-grid',
      areas: [
        {
          id: nanoid(),
          name: 'Header',
          widgets: [
            {
              id: nanoid(),
              type: 'heading',
              sectionId: '',
              skin: 'minimal',
              text: 'All Journals',
              level: 2,
              align: 'left',
              style: 'default'
            }
          ]
        },
        {
          id: nanoid(),
          name: 'JAS Card',
          widgets: [
            {
              id: nanoid(),
              skin: 'minimal',
              type: 'editorial-card',
              layout: 'split',
              content: {
                preheader: { enabled: true, text: 'ISSN: 1234-5678' },
                headline: { enabled: true, text: 'Journal of Advanced Science' },
                description: { enabled: true, text: 'Publishing groundbreaking research across all scientific disciplines since 1985. Impact Factor: 4.5' },
                callToAction: { enabled: true, text: 'View Journal →', url: '/live/catalyst-demo/journal/jas', type: 'link' }
              },
              image: { src: 'https://picsum.photos/800/600?random=jas-browse', alt: 'JAS Cover' },
              config: { contentAlignment: 'left', imagePosition: 'top', overlayOpacity: 60, useAccentColor: true },
              sectionId: ''
            }
          ]
        },
        {
          id: nanoid(),
          name: 'OAB Card',
          widgets: [
            {
              id: nanoid(),
              skin: 'minimal',
              type: 'editorial-card',
              layout: 'split',
              content: {
                preheader: { enabled: true, text: 'Open Access • ISSN: 2345-6789' },
                headline: { enabled: true, text: 'Open Access Biology' },
                description: { enabled: true, text: 'Freely accessible research in biological sciences, genomics, and ecology. All articles are Gold Open Access.' },
                callToAction: { enabled: true, text: 'View Journal →', url: '/live/catalyst-demo/journal/oab', type: 'link' }
              },
              image: { src: 'https://picsum.photos/800/600?random=oab-browse', alt: 'OAB Cover' },
              config: { contentAlignment: 'left', imagePosition: 'top', overlayOpacity: 60, useAccentColor: true },
              sectionId: ''
            }
          ]
        },
        {
          id: nanoid(),
          name: 'HCQ Card',
          widgets: [
            {
              id: nanoid(),
              skin: 'minimal',
              type: 'editorial-card',
              layout: 'split',
              content: {
                preheader: { enabled: true, text: 'Archive • ISSN: 3456-7890' },
                headline: { enabled: true, text: 'Historical Chemistry Quarterly' },
                description: { enabled: true, text: 'Complete archive of chemical research publications from 1920-2020. A valuable historical resource.' },
                callToAction: { enabled: true, text: 'View Archive →', url: '/live/catalyst-demo/journal/hcq', type: 'link' }
              },
              image: { src: 'https://picsum.photos/800/600?random=hcq-browse', alt: 'HCQ Cover' },
              config: { contentAlignment: 'left', imagePosition: 'top', overlayOpacity: 60, useAccentColor: true },
              sectionId: ''
            }
          ]
        }
      ],
      background: { type: 'color', color: '#ffffff', opacity: 1 },
      styling: {
        paddingTop: 'large',
        paddingBottom: 'large',
        paddingLeft: 'medium',
        paddingRight: 'medium',
        gap: 'large',
        variant: 'full-width',
        textColor: 'default'
      }
    }
  ]
}

/**
 * About Page Stub
 */
export function createAboutStub(): CanvasItemStub[] {
  return [
    // Hero Section
    {
      id: nanoid(),
      name: 'About Hero',
      type: 'hero',
      layout: 'hero-with-buttons',
      areas: [
        {
          id: nanoid(),
          name: 'Hero Content',
          widgets: [
            {
              id: nanoid(),
              type: 'heading',
              sectionId: '',
              skin: 'minimal',
              text: 'About Catalyst Publishing',
              level: 1,
              align: 'center',
              style: 'hero',
              color: 'primary',
              size: 'auto'
            },
            {
              id: nanoid(),
              type: 'text',
              sectionId: '',
              skin: 'minimal',
              text: 'Advancing scientific knowledge through open and accessible publishing',
              align: 'center'
            }
          ]
        }
      ],
      background: {
        type: 'gradient',
        gradient: {
          type: 'linear',
          direction: 'to bottom',
          stops: [
            { color: '#7c3aed', position: '0%' },
            { color: '#a78bfa', position: '100%' }
          ]
        },
        opacity: 1
      },
      styling: {
        paddingTop: 'large',
        paddingBottom: 'large',
        paddingLeft: 'medium',
        paddingRight: 'medium',
        gap: 'medium',
        variant: 'full-width',
        textColor: 'white'
      },
      minHeight: '300px'
    },
    // Mission Section
    {
      id: nanoid(),
      name: 'Mission Section',
      type: 'content-block',
      layout: 'two-column',
      areas: [
        {
          id: nanoid(),
          name: 'Left Content',
          widgets: [
            {
              id: nanoid(),
              type: 'heading',
              sectionId: '',
              skin: 'minimal',
              text: 'Our Mission',
              level: 2,
              align: 'left',
              style: 'default'
            },
            {
              id: nanoid(),
              type: 'text',
              sectionId: '',
              skin: 'minimal',
              text: 'Catalyst Publishing is dedicated to advancing scientific knowledge by providing a platform for researchers to share their discoveries with the world. We believe in open access, rigorous peer review, and the democratization of scientific information.',
              align: 'left'
            }
          ]
        },
        {
          id: nanoid(),
          name: 'Right Content',
          widgets: [
            {
              id: nanoid(),
              type: 'heading',
              sectionId: '',
              skin: 'minimal',
              text: 'Our Values',
              level: 2,
              align: 'left',
              style: 'default'
            },
            {
              id: nanoid(),
              type: 'text',
              sectionId: '',
              skin: 'minimal',
              text: '• Scientific Integrity\n• Open Access\n• Peer Review Excellence\n• Global Collaboration\n• Innovation in Publishing',
              align: 'left'
            }
          ]
        }
      ],
      background: { type: 'color', color: '#ffffff', opacity: 1 },
      styling: {
        paddingTop: 'large',
        paddingBottom: 'large',
        paddingLeft: 'medium',
        paddingRight: 'medium',
        gap: 'large',
        variant: 'full-width',
        textColor: 'default'
      }
    },
    // Stats Section
    {
      id: nanoid(),
      name: 'Stats Section',
      type: 'content-block',
      layout: 'header-plus-grid',
      areas: [
        {
          id: nanoid(),
          name: 'Header',
          widgets: [
            {
              id: nanoid(),
              type: 'heading',
              sectionId: '',
              skin: 'minimal',
              text: 'By the Numbers',
              level: 2,
              align: 'center',
              style: 'default'
            }
          ]
        },
        {
          id: nanoid(),
          name: 'Stat 1',
          widgets: [
            {
              id: nanoid(),
              type: 'heading',
              sectionId: '',
              skin: 'minimal',
              text: '3',
              level: 1,
              align: 'center',
              style: 'hero',
              color: 'primary'
            },
            {
              id: nanoid(),
              type: 'text',
              sectionId: '',
              skin: 'minimal',
              text: 'Peer-Reviewed Journals',
              align: 'center'
            }
          ]
        },
        {
          id: nanoid(),
          name: 'Stat 2',
          widgets: [
            {
              id: nanoid(),
              type: 'heading',
              sectionId: '',
              skin: 'minimal',
              text: '500+',
              level: 1,
              align: 'center',
              style: 'hero',
              color: 'primary'
            },
            {
              id: nanoid(),
              type: 'text',
              sectionId: '',
              skin: 'minimal',
              text: 'Published Articles',
              align: 'center'
            }
          ]
        },
        {
          id: nanoid(),
          name: 'Stat 3',
          widgets: [
            {
              id: nanoid(),
              type: 'heading',
              sectionId: '',
              skin: 'minimal',
              text: '50+',
              level: 1,
              align: 'center',
              style: 'hero',
              color: 'primary'
            },
            {
              id: nanoid(),
              type: 'text',
              sectionId: '',
              skin: 'minimal',
              text: 'Countries Reached',
              align: 'center'
            }
          ]
        }
      ],
      background: { type: 'color', color: '#f8fafc', opacity: 1 },
      styling: {
        paddingTop: 'large',
        paddingBottom: 'large',
        paddingLeft: 'medium',
        paddingRight: 'medium',
        gap: 'medium',
        variant: 'full-width',
        textColor: 'default'
      }
    }
  ]
}

/**
 * Search Results Page Stub
 */
export function createSearchStub(): CanvasItemStub[] {
  return [
    // Search Header
    {
      id: nanoid(),
      name: 'Search Header',
      type: 'content-block',
      layout: 'one-column',
      areas: [
        {
          id: nanoid(),
          name: 'Content',
          widgets: [
            {
              id: nanoid(),
              type: 'heading',
              sectionId: '',
              skin: 'minimal',
              text: 'Search Results',
              level: 1,
              align: 'left',
              style: 'default'
            },
            {
              id: nanoid(),
              type: 'text',
              sectionId: '',
              skin: 'minimal',
              text: 'Search across all journals, articles, and authors',
              align: 'left'
            }
          ]
        }
      ],
      background: { type: 'color', color: '#f8fafc', opacity: 1 },
      styling: {
        paddingTop: 'large',
        paddingBottom: 'medium',
        paddingLeft: 'medium',
        paddingRight: 'medium',
        gap: 'small',
        variant: 'full-width',
        textColor: 'default'
      }
    },
    // Results Section
    {
      id: nanoid(),
      name: 'Search Results',
      type: 'content-block',
      layout: 'one-column',
      areas: [
        {
          id: nanoid(),
          name: 'Results',
          widgets: [
            {
              id: nanoid(),
              skin: 'minimal',
              type: 'publication-list',
              contentSource: 'dynamic-query',
              publications: [],
              cardConfig: {
                showContentTypeLabel: true,
                showTitle: true,
                showSubtitle: true,
                showThumbnail: false,
                showPublicationTitle: true,
                showVolumeIssue: true,
                showPublicationDate: true,
                showDOI: true,
                showAuthors: true,
                authorStyle: 'full',
                showAbstract: true,
                abstractLength: 'short',
                showAccessStatus: true,
                showViewDownloadOptions: true,
                titleStyle: 'medium'
              },
              layout: 'list',
              maxItems: 10,
              sectionId: ''
            }
          ]
        }
      ],
      background: { type: 'color', color: '#ffffff', opacity: 1 },
      styling: {
        paddingTop: 'medium',
        paddingBottom: 'large',
        paddingLeft: 'medium',
        paddingRight: 'medium',
        gap: 'medium',
        variant: 'full-width',
        textColor: 'default'
      }
    }
  ]
}

// =============================================================================
// TEMPLATE-BASED PAGES (with inheritance)
// =============================================================================

/**
 * Journal Home Page Template
 * Uses template variables: {journal.name}, {journal.description}, {journal.id}
 */
export function createJournalHomeTemplate(): CanvasItemStub[] {
  return [
    // Journal Hero
    {
      id: nanoid(),
      name: 'Journal Hero',
      type: 'hero',
      layout: 'hero-with-buttons',
      areas: [
        {
          id: nanoid(),
          name: 'Hero Content',
          widgets: [
            {
              id: nanoid(),
              type: 'heading',
              sectionId: '',
              skin: 'minimal',
              text: '{journal.name}',
              level: 1,
              align: 'center',
              style: 'hero',
              color: 'primary',
              size: 'auto',
              templateVariable: 'journal.name'
            },
            {
              id: nanoid(),
              type: 'text',
              sectionId: '',
              skin: 'minimal',
              text: '{journal.description}',
              align: 'center',
              templateVariable: 'journal.description'
            }
          ]
        },
        {
          id: nanoid(),
          name: 'Button Row',
          widgets: [
            {
              id: nanoid(),
              type: 'button',
              sectionId: '',
              skin: 'minimal',
              text: 'Current Issue',
              href: '/live/catalyst-demo/journal/{journal.id}/toc/current',
              variant: 'primary',
              size: 'large',
              templateVariable: 'journal.id'
            },
            {
              id: nanoid(),
              type: 'button',
              sectionId: '',
              skin: 'minimal',
              text: 'All Issues',
              href: '/live/catalyst-demo/journal/{journal.id}/loi',
              variant: 'secondary',
              size: 'large',
              templateVariable: 'journal.id'
            }
          ]
        }
      ],
      background: {
        type: 'gradient',
        gradient: {
          type: 'linear',
          direction: 'to bottom',
          stops: [
            { color: '{journal.brandColor}', position: '0%' },
            { color: '{journal.brandColorLight}', position: '100%' }
          ]
        },
        opacity: 1
      },
      styling: {
        paddingTop: 'large',
        paddingBottom: 'large',
        paddingLeft: 'medium',
        paddingRight: 'medium',
        gap: 'medium',
        variant: 'full-width',
        textColor: 'white'
      },
      minHeight: '350px'
    },
    // Journal Navigation
    {
      id: nanoid(),
      name: 'Journal Navigation',
      type: 'content-block',
      layout: 'one-column',
      areas: [
        {
          id: nanoid(),
          name: 'Nav',
          widgets: [
            {
              id: nanoid(),
              type: 'menu',
              sectionId: '',
              skin: 'minimal',
              menuType: 'context-aware',
              contextSource: 'journal',
              style: 'horizontal',
              align: 'left',
              items: [
                { id: nanoid(), label: 'Home', url: '/live/catalyst-demo/journal/{journal.id}', target: '_self', order: 0 },
                { id: nanoid(), label: 'Current Issue', url: '/live/catalyst-demo/journal/{journal.id}/toc/current', target: '_self', order: 1 },
                { id: nanoid(), label: 'All Issues', url: '/live/catalyst-demo/journal/{journal.id}/loi', target: '_self', order: 2 },
                { id: nanoid(), label: 'About', url: '/live/catalyst-demo/journal/{journal.id}/about', target: '_self', order: 3 }
              ]
            }
          ]
        }
      ],
      background: { type: 'color', color: '#f1f5f9', opacity: 1 },
      styling: {
        paddingTop: 'small',
        paddingBottom: 'small',
        paddingLeft: 'medium',
        paddingRight: 'medium',
        gap: 'small',
        variant: 'full-width',
        textColor: 'default'
      }
    },
    // Latest Articles Section
    {
      id: nanoid(),
      name: 'Latest Articles',
      type: 'content-block',
      layout: 'one-column',
      areas: [
        {
          id: nanoid(),
          name: 'Content',
          widgets: [
            {
              id: nanoid(),
              type: 'heading',
              sectionId: '',
              skin: 'minimal',
              text: 'Latest Articles',
              level: 2,
              align: 'left',
              style: 'default'
            },
            {
              id: nanoid(),
              skin: 'minimal',
              type: 'publication-list',
              contentSource: 'journal-latest',
              journalId: '{journal.id}',
              publications: [],
              cardConfig: {
                showContentTypeLabel: true,
                showTitle: true,
                showPublicationDate: true,
                showDOI: true,
                showAuthors: true,
                authorStyle: 'abbreviated',
                showAbstract: true,
                abstractLength: 'medium',
                showAccessStatus: true,
                titleStyle: 'medium'
              },
              layout: 'list',
              maxItems: 5,
              sectionId: ''
            }
          ]
        }
      ],
      background: { type: 'color', color: '#ffffff', opacity: 1 },
      styling: {
        paddingTop: 'large',
        paddingBottom: 'large',
        paddingLeft: 'medium',
        paddingRight: 'medium',
        gap: 'medium',
        variant: 'full-width',
        textColor: 'default'
      }
    }
  ]
}

/**
 * Issue Archive (LOI) Page Template
 * Lists all issues for a journal
 */
export function createIssueArchiveTemplate(): CanvasItemStub[] {
  return [
    // Archive Header
    {
      id: nanoid(),
      name: 'Archive Header',
      type: 'hero',
      layout: 'hero-with-buttons',
      areas: [
        {
          id: nanoid(),
          name: 'Hero Content',
          widgets: [
            {
              id: nanoid(),
              type: 'heading',
              sectionId: '',
              skin: 'minimal',
              text: '{journal.name}',
              level: 1,
              align: 'center',
              style: 'hero',
              color: 'primary',
              templateVariable: 'journal.name'
            },
            {
              id: nanoid(),
              type: 'text',
              sectionId: '',
              skin: 'minimal',
              text: 'Issue Archive',
              align: 'center'
            }
          ]
        }
      ],
      background: {
        type: 'gradient',
        gradient: {
          type: 'linear',
          direction: 'to bottom',
          stops: [
            { color: '{journal.brandColor}', position: '0%' },
            { color: '{journal.brandColorLight}', position: '100%' }
          ]
        },
        opacity: 1
      },
      styling: {
        paddingTop: 'large',
        paddingBottom: 'large',
        paddingLeft: 'medium',
        paddingRight: 'medium',
        gap: 'medium',
        variant: 'full-width',
        textColor: 'white'
      },
      minHeight: '250px'
    },
    // Journal Navigation
    {
      id: nanoid(),
      name: 'Journal Navigation',
      type: 'content-block',
      layout: 'one-column',
      areas: [
        {
          id: nanoid(),
          name: 'Nav',
          widgets: [
            {
              id: nanoid(),
              type: 'menu',
              sectionId: '',
              skin: 'minimal',
              menuType: 'context-aware',
              contextSource: 'journal',
              style: 'horizontal',
              align: 'left',
              items: [
                { id: nanoid(), label: 'Home', url: '/live/catalyst-demo/journal/{journal.id}', target: '_self', order: 0 },
                { id: nanoid(), label: 'Current Issue', url: '/live/catalyst-demo/journal/{journal.id}/toc/current', target: '_self', order: 1 },
                { id: nanoid(), label: 'All Issues', url: '/live/catalyst-demo/journal/{journal.id}/loi', target: '_self', order: 2 },
                { id: nanoid(), label: 'About', url: '/live/catalyst-demo/journal/{journal.id}/about', target: '_self', order: 3 }
              ]
            }
          ]
        }
      ],
      background: { type: 'color', color: '#f1f5f9', opacity: 1 },
      styling: {
        paddingTop: 'small',
        paddingBottom: 'small',
        paddingLeft: 'medium',
        paddingRight: 'medium',
        gap: 'small',
        variant: 'full-width',
        textColor: 'default'
      }
    },
    // Issues List
    {
      id: nanoid(),
      name: 'Issues List',
      type: 'content-block',
      layout: 'one-column',
      areas: [
        {
          id: nanoid(),
          name: 'Content',
          widgets: [
            {
              id: nanoid(),
              type: 'heading',
              sectionId: '',
              skin: 'minimal',
              text: 'All Issues',
              level: 2,
              align: 'left',
              style: 'default'
            },
            {
              id: nanoid(),
              type: 'text',
              sectionId: '',
              skin: 'minimal',
              text: '(Issue cards will be rendered dynamically based on journal data)',
              align: 'left'
            }
          ]
        }
      ],
      background: { type: 'color', color: '#ffffff', opacity: 1 },
      styling: {
        paddingTop: 'large',
        paddingBottom: 'large',
        paddingLeft: 'medium',
        paddingRight: 'medium',
        gap: 'medium',
        variant: 'full-width',
        textColor: 'default'
      }
    }
  ]
}

/**
 * Issue TOC (Table of Contents) Page Template
 * Shows articles for a specific issue
 */
export function createIssueTocTemplate(): CanvasItemStub[] {
  return [
    // Issue Header
    {
      id: nanoid(),
      name: 'Issue Header',
      type: 'hero',
      layout: 'hero-with-buttons',
      areas: [
        {
          id: nanoid(),
          name: 'Hero Content',
          widgets: [
            {
              id: nanoid(),
              type: 'heading',
              sectionId: '',
              skin: 'minimal',
              text: '{journal.name}',
              level: 2,
              align: 'center',
              style: 'default',
              color: 'primary',
              templateVariable: 'journal.name'
            },
            {
              id: nanoid(),
              type: 'heading',
              sectionId: '',
              skin: 'minimal',
              text: '{issue.name}',
              level: 1,
              align: 'center',
              style: 'hero',
              templateVariable: 'issue.name'
            },
            {
              id: nanoid(),
              type: 'text',
              sectionId: '',
              skin: 'minimal',
              text: '{issue.description}',
              align: 'center',
              templateVariable: 'issue.description'
            }
          ]
        }
      ],
      background: {
        type: 'gradient',
        gradient: {
          type: 'linear',
          direction: 'to bottom',
          stops: [
            { color: '{journal.brandColor}', position: '0%' },
            { color: '{journal.brandColorLight}', position: '100%' }
          ]
        },
        opacity: 1
      },
      styling: {
        paddingTop: 'large',
        paddingBottom: 'large',
        paddingLeft: 'medium',
        paddingRight: 'medium',
        gap: 'small',
        variant: 'full-width',
        textColor: 'white'
      },
      minHeight: '300px'
    },
    // Journal Navigation
    {
      id: nanoid(),
      name: 'Journal Navigation',
      type: 'content-block',
      layout: 'one-column',
      areas: [
        {
          id: nanoid(),
          name: 'Nav',
          widgets: [
            {
              id: nanoid(),
              type: 'menu',
              sectionId: '',
              skin: 'minimal',
              menuType: 'context-aware',
              contextSource: 'journal',
              style: 'horizontal',
              align: 'left',
              items: [
                { id: nanoid(), label: 'Home', url: '/live/catalyst-demo/journal/{journal.id}', target: '_self', order: 0 },
                { id: nanoid(), label: 'Current Issue', url: '/live/catalyst-demo/journal/{journal.id}/toc/current', target: '_self', order: 1 },
                { id: nanoid(), label: 'All Issues', url: '/live/catalyst-demo/journal/{journal.id}/loi', target: '_self', order: 2 },
                { id: nanoid(), label: 'About', url: '/live/catalyst-demo/journal/{journal.id}/about', target: '_self', order: 3 }
              ]
            }
          ]
        }
      ],
      background: { type: 'color', color: '#f1f5f9', opacity: 1 },
      styling: {
        paddingTop: 'small',
        paddingBottom: 'small',
        paddingLeft: 'medium',
        paddingRight: 'medium',
        gap: 'small',
        variant: 'full-width',
        textColor: 'default'
      }
    },
    // Articles in Issue
    {
      id: nanoid(),
      name: 'Issue Articles',
      type: 'content-block',
      layout: 'one-column',
      areas: [
        {
          id: nanoid(),
          name: 'Content',
          widgets: [
            {
              id: nanoid(),
              type: 'heading',
              sectionId: '',
              skin: 'minimal',
              text: 'In This Issue',
              level: 2,
              align: 'left',
              style: 'default'
            },
            {
              id: nanoid(),
              skin: 'minimal',
              type: 'publication-list',
              contentSource: 'issue-articles',
              issueId: '{issue.id}',
              publications: [],
              cardConfig: {
                showContentTypeLabel: true,
                showTitle: true,
                showPublicationDate: true,
                showDOI: true,
                showAuthors: true,
                authorStyle: 'full',
                showAbstract: true,
                abstractLength: 'medium',
                showAccessStatus: true,
                showViewDownloadOptions: true,
                titleStyle: 'large'
              },
              layout: 'list',
              maxItems: 20,
              sectionId: ''
            }
          ]
        }
      ],
      background: { type: 'color', color: '#ffffff', opacity: 1 },
      styling: {
        paddingTop: 'large',
        paddingBottom: 'large',
        paddingLeft: 'medium',
        paddingRight: 'medium',
        gap: 'medium',
        variant: 'full-width',
        textColor: 'default'
      }
    }
  ]
}

/**
 * Article Page Template
 */
export function createArticleTemplate(): CanvasItemStub[] {
  return [
    // Article Header
    {
      id: nanoid(),
      name: 'Article Header',
      type: 'content-block',
      layout: 'one-column',
      areas: [
        {
          id: nanoid(),
          name: 'Header Content',
          widgets: [
            {
              id: nanoid(),
              type: 'text',
              sectionId: '',
              skin: 'minimal',
              text: '{article.contentType}',
              align: 'left',
              templateVariable: 'article.contentType'
            },
            {
              id: nanoid(),
              type: 'heading',
              sectionId: '',
              skin: 'minimal',
              text: '{article.title}',
              level: 1,
              align: 'left',
              style: 'default',
              templateVariable: 'article.title'
            },
            {
              id: nanoid(),
              type: 'text',
              sectionId: '',
              skin: 'minimal',
              text: '{article.authors}',
              align: 'left',
              templateVariable: 'article.authors'
            },
            {
              id: nanoid(),
              type: 'text',
              sectionId: '',
              skin: 'minimal',
              text: '{journal.name} • {issue.name} • {article.doi}',
              align: 'left'
            }
          ]
        }
      ],
      background: { type: 'color', color: '#f8fafc', opacity: 1 },
      styling: {
        paddingTop: 'large',
        paddingBottom: 'medium',
        paddingLeft: 'medium',
        paddingRight: 'medium',
        gap: 'small',
        variant: 'full-width',
        textColor: 'default'
      }
    },
    // Article Content
    {
      id: nanoid(),
      name: 'Article Content',
      type: 'content-block',
      layout: 'two-column',
      areas: [
        {
          id: nanoid(),
          name: 'Main Content',
          widgets: [
            {
              id: nanoid(),
              type: 'heading',
              sectionId: '',
              skin: 'minimal',
              text: 'Abstract',
              level: 2,
              align: 'left',
              style: 'default'
            },
            {
              id: nanoid(),
              type: 'text',
              sectionId: '',
              skin: 'minimal',
              text: '{article.abstract}',
              align: 'left',
              templateVariable: 'article.abstract'
            },
            {
              id: nanoid(),
              type: 'heading',
              sectionId: '',
              skin: 'minimal',
              text: 'Keywords',
              level: 3,
              align: 'left',
              style: 'default'
            },
            {
              id: nanoid(),
              type: 'text',
              sectionId: '',
              skin: 'minimal',
              text: '{article.keywords}',
              align: 'left',
              templateVariable: 'article.keywords'
            }
          ]
        },
        {
          id: nanoid(),
          name: 'Sidebar',
          widgets: [
            {
              id: nanoid(),
              type: 'heading',
              sectionId: '',
              skin: 'minimal',
              text: 'Article Tools',
              level: 3,
              align: 'left',
              style: 'default'
            },
            {
              id: nanoid(),
              type: 'button',
              sectionId: '',
              skin: 'minimal',
              text: 'Download PDF',
              href: '#',
              variant: 'primary',
              size: 'medium'
            },
            {
              id: nanoid(),
              type: 'button',
              sectionId: '',
              skin: 'minimal',
              text: 'Cite Article',
              href: '#',
              variant: 'secondary',
              size: 'medium'
            },
            {
              id: nanoid(),
              type: 'button',
              sectionId: '',
              skin: 'minimal',
              text: 'Share',
              href: '#',
              variant: 'secondary',
              size: 'medium'
            }
          ]
        }
      ],
      background: { type: 'color', color: '#ffffff', opacity: 1 },
      styling: {
        paddingTop: 'medium',
        paddingBottom: 'large',
        paddingLeft: 'medium',
        paddingRight: 'medium',
        gap: 'large',
        variant: 'full-width',
        textColor: 'default'
      }
    }
  ]
}

// =============================================================================
// HELPER: Get stub by page type
// =============================================================================

export type PageType = 
  | 'home' 
  | 'journals' 
  | 'about' 
  | 'search' 
  | 'journal-home' 
  | 'issue-archive' 
  | 'issue-toc' 
  | 'article'

export function getPageStub(pageType: PageType): CanvasItemStub[] {
  switch (pageType) {
    case 'home':
      return createHomepageStub()
    case 'journals':
      return createJournalsBrowseStub()
    case 'about':
      return createAboutStub()
    case 'search':
      return createSearchStub()
    case 'journal-home':
      return createJournalHomeTemplate()
    case 'issue-archive':
      return createIssueArchiveTemplate()
    case 'issue-toc':
      return createIssueTocTemplate()
    case 'article':
      return createArticleTemplate()
    default:
      return createHomepageStub()
  }
}

