/**
 * Page Stubs - Pre-defined canvas content for each page type
 * Based on Maria's Catalyst-home-maria stub structure
 * 
 * NOTE: Template variables like {journal.name} are replaced at render time
 * by the CanvasRenderer's templateContext processing, not by widget types.
 * 
 * Page Types:
 * - Homepage (stub-based, no inheritance) - WEBSITE SPECIFIC
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
// WEBSITE-SPECIFIC HOMEPAGE STUBS
// =============================================================================

/**
 * Get homepage stub based on website ID
 */
export function getHomepageStubForWebsite(websiteId: string): CanvasItemStub[] {
  switch (websiteId) {
    case 'febs-press':
      return createFebsHomepageStub()
    case 'catalyst-demo':
    default:
      return createCatalystHomepageStub()
  }
}

/**
 * FEBS Press Homepage Stub (2025 version)
 */
export function createFebsHomepageStub(): CanvasItemStub[] {
  return [
    // Journal Covers Section (4 journals)
    {
      id: nanoid(),
      type: 'content-block',
      name: 'Journal Covers',
      layout: 'one-column',
      areas: [
        {
          id: nanoid(),
          position: 'center',
          widgets: [
            {
              id: nanoid(),
              type: 'html',
              content: `
<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; padding: 40px 0;">
  <div style="text-align: center;">
    <img src="https://placehold.co/300x400/00B5FF/white?text=FEBS+Journal" alt="The FEBS Journal" style="width: 100%; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
  </div>
  <div style="text-align: center;">
    <img src="https://placehold.co/300x400/7B1FA2/white?text=FEBS+Letters" alt="FEBS Letters" style="width: 100%; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
  </div>
  <div style="text-align: center;">
    <img src="https://placehold.co/300x400/00B5FF/white?text=Molecular+Oncology" alt="Molecular Oncology" style="width: 100%; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
  </div>
  <div style="text-align: center;">
    <img src="https://placehold.co/300x400/1B5E20/white?text=FEBS+Open+Bio" alt="FEBS Open Bio" style="width: 100%; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
  </div>
</div>
              `,
              sectionId: ''
            }
          ]
        }
      ],
      backgroundColor: '#ffffff',
      padding: 'medium',
      contextAware: true
    },
    // Highlights from FEBS Press Section
    {
      id: nanoid(),
      type: 'content-block',
      name: 'Highlights from FEBS Press',
      layout: 'one-column',
      areas: [
        {
          id: nanoid(),
          position: 'center',
          widgets: [
            {
              id: nanoid(),
              type: 'heading',
              level: 2,
              text: 'Highlights from FEBS Press',
              align: 'left',
              style: 'default',
              sectionId: ''
            },
            {
              id: nanoid(),
              type: 'html',
              content: `
<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 24px;">
  <div style="background: white; padding: 24px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">The FEBS Journal</h3>
    <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">Editor's Choice</p>
    <a href="#" style="color: #00B5FF; text-decoration: none; font-size: 14px;">Blood group O expression in normal tissues and tumors</a>
    <ul style="margin: 12px 0 0 0; padding-left: 20px; font-size: 14px; color: #444;">
      <li>Ea Kristine Clausse Tuhn</li>
      <li>Richard D. Cummings</li>
      <li>and colleagues</li>
    </ul>
    <p style="margin: 12px 0 0 0; font-size: 12px; color: #999;">First published: 30/06/2025</p>
  </div>
  
  <div style="background: white; padding: 24px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">FEBS Letters</h3>
    <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">Featured Article</p>
    <a href="#" style="color: #7B1FA2; text-decoration: none; font-size: 14px;">Protein folding mechanisms in cellular stress</a>
    <ul style="margin: 12px 0 0 0; padding-left: 20px; font-size: 14px; color: #444;">
      <li>Maria Schmidt</li>
      <li>Hans Weber</li>
    </ul>
    <p style="margin: 12px 0 0 0; font-size: 12px; color: #999;">First published: 25/06/2025</p>
  </div>
  
  <div style="background: white; padding: 24px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">Molecular Oncology</h3>
    <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">Research Highlight</p>
    <a href="#" style="color: #00B5FF; text-decoration: none; font-size: 14px;">Novel biomarkers in early cancer detection</a>
    <ul style="margin: 12px 0 0 0; padding-left: 20px; font-size: 14px; color: #444;">
      <li>Dr. Sarah Chen</li>
      <li>Prof. James Wilson</li>
    </ul>
    <p style="margin: 12px 0 0 0; font-size: 12px; color: #999;">First published: 20/06/2025</p>
  </div>
</div>
              `,
              sectionId: ''
            }
          ]
        }
      ],
      backgroundColor: '#E3F2FD',
      padding: 'large',
      contextAware: true
    },
    // FEBS Press News Section
    {
      id: nanoid(),
      type: 'content-block',
      name: 'FEBS Press News',
      layout: 'two-columns',
      areas: [
        {
          id: nanoid(),
          position: 'left',
          widgets: [
            {
              id: nanoid(),
              type: 'html',
              content: `
<div style="background: #000; color: white; padding: 40px; text-align: center; border-radius: 8px;">
  <div style="font-size: 48px; margin-bottom: 16px;">⚛️</div>
  <h3 style="margin: 0 0 16px 0; font-size: 18px; line-height: 1.4;">The Milan Declaration on the Crucial Role of Science in meeting Global Challenges</h3>
  <div style="display: flex; gap: 12px; justify-content: center; margin-bottom: 20px;">
    <span style="width: 24px; height: 24px; background: white; border-radius: 50%;"></span>
    <span style="width: 24px; height: 24px; background: white; border-radius: 50%;"></span>
    <span style="width: 24px; height: 24px; background: white; border-radius: 50%;"></span>
    <span style="width: 24px; height: 24px; background: white; border-radius: 50%;"></span>
    <span style="width: 24px; height: 24px; background: white; border-radius: 50%;"></span>
  </div>
  <a href="#" style="display: inline-block; background: #00B5FF; color: white; padding: 12px 32px; text-decoration: none; border-radius: 4px; font-weight: 600;">Sign the Declaration →</a>
</div>
              `,
              sectionId: ''
            }
          ]
        },
        {
          id: nanoid(),
          position: 'right',
          widgets: [
            {
              id: nanoid(),
              type: 'heading',
              level: 3,
              text: 'FEBS Press supports the Milan Declaration on the Crucial Role of Science in meeting Global Challenges',
              align: 'left',
              sectionId: ''
            },
            {
              id: nanoid(),
              type: 'text',
              text: '31/01/2025',
              align: 'left',
              sectionId: ''
            },
            {
              id: nanoid(),
              type: 'text',
              text: 'The various global challenges encountered by all countries necessitate prioritizing a seamless and genuine global scientific collaboration that is devoid of bias and prejudice. There is an increasing urgency to strengthen Science ethically and financially and to reaffirm our dedication to enduring values such as peace, freedom, security, human dignity, sustainable development, environmental protection, scientific and technological progress, as well as the fight against social exclusion and discrimination.',
              align: 'left',
              sectionId: ''
            }
          ]
        }
      ],
      backgroundColor: '#FFF3E0',
      padding: 'large',
      contextAware: true
    },
    // Featured Content Section
    {
      id: nanoid(),
      type: 'content-block',
      name: 'Featured Content',
      layout: 'one-column',
      areas: [
        {
          id: nanoid(),
          position: 'center',
          widgets: [
            {
              id: nanoid(),
              type: 'heading',
              level: 2,
              text: 'Featured Content',
              align: 'center',
              sectionId: ''
            },
            {
              id: nanoid(),
              type: 'html',
              content: `
<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 32px;">
  <div style="background: white; padding: 24px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h4 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">Biochemistry & Molecular Biology</h4>
    <p style="margin: 0 0 16px 0; font-size: 14px; color: #666; line-height: 1.6;">Latest research in protein structure, enzyme mechanisms, and metabolic pathways.</p>
    <a href="#" style="color: #00B5FF; text-decoration: none; font-size: 14px; font-weight: 500;">Explore Articles →</a>
  </div>
  
  <div style="background: white; padding: 24px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h4 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">Cell Biology & Signaling</h4>
    <p style="margin: 0 0 16px 0; font-size: 14px; color: #666; line-height: 1.6;">Discoveries in cellular communication, signal transduction, and cell cycle regulation.</p>
    <a href="#" style="color: #00B5FF; text-decoration: none; font-size: 14px; font-weight: 500;">Read More →</a>
  </div>
  
  <div style="background: white; padding: 24px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h4 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">Cancer Research</h4>
    <p style="margin: 0 0 16px 0; font-size: 14px; color: #666; line-height: 1.6;">Breakthroughs in oncology, tumor biology, and therapeutic approaches.</p>
    <a href="#" style="color: #00B5FF; text-decoration: none; font-size: 14px; font-weight: 500;">View Research →</a>
  </div>
</div>
              `,
              sectionId: ''
            }
          ]
        }
      ],
      backgroundColor: '#F5F5F5',
      padding: 'large',
      contextAware: true
    }
  ]
}

// =============================================================================
// STUB-BASED PAGES (one-off, no inheritance)
// =============================================================================

/**
 * Catalyst Demo Homepage Stub - Based on Catalyst-home-maria
 */
export function createCatalystHomepageStub(): CanvasItemStub[] {
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
    // Publication List Grid (with full publication data)
    {
      id: 'hsv8z4ZenytDfWv2ZR0Vs',
      name: 'Section',
      type: 'content-block',
      layout: 'grid',
      areas: [
        {
          id: 'XHScL5fnqraHk8Ll1qSIf',
          name: 'Grid Items',
          widgets: [
            {
              id: 'XZA_KYt0OGKXSugerhu4n',
              skin: 'minimal',
              type: 'publication-list',
              contentSource: 'dynamic-query',
              publications: [
                {
                  '@context': 'https://schema.org',
                  '@type': 'ScholarlyArticle',
                  'headline': 'Is It Possible to Truly Understand Performance in LLMs?',
                  'alternativeHeadline': 'A Deep Dive into Evaluation Metrics',
                  'author': [
                    {
                      '@type': 'Person',
                      'name': 'Samuel Greengard',
                      'affiliation': {
                        '@type': 'Organization',
                        'name': 'MIT Computer Science'
                      }
                    },
                    {
                      '@type': 'Person',
                      'name': 'Elena Rodriguez',
                      'affiliation': {
                        '@type': 'Organization',
                        'name': 'Stanford AI Lab'
                      }
                    }
                  ],
                  'datePublished': '2024-12-02',
                  'isPartOf': {
                    '@type': 'PublicationIssue',
                    'issueNumber': '3',
                    'isPartOf': {
                      '@type': 'PublicationVolume',
                      'volumeNumber': '5',
                      'isPartOf': {
                        '@type': 'Periodical',
                        'name': 'Journal of Modern Computing'
                      }
                    }
                  },
                  'pageStart': '14',
                  'pageEnd': '16',
                  'abstract': 'This paper investigates the complexities of evaluating large language models, proposing a new framework for comprehensive performance assessment...',
                  'identifier': {
                    '@type': 'PropertyValue',
                    'name': 'DOI',
                    'value': 'https://doi.org/10.1145/3695868'
                  },
                  'accessMode': 'FULL_ACCESS',
                  'contentType': 'Research Article'
                },
                {
                  '@context': 'https://schema.org',
                  '@type': 'ScholarlyArticle',
                  'headline': 'Sustainable Computing: Green Algorithms for the Future',
                  'alternativeHeadline': 'Environmental Impact of Modern Software Development',
                  'author': [
                    {
                      '@type': 'Person',
                      'name': 'Maria Chen',
                      'affiliation': {
                        '@type': 'Organization',
                        'name': 'Carnegie Mellon University'
                      }
                    }
                  ],
                  'datePublished': '2024-11-28',
                  'isPartOf': {
                    '@type': 'PublicationIssue',
                    'issueNumber': '2',
                    'isPartOf': {
                      '@type': 'PublicationVolume',
                      'volumeNumber': '12',
                      'isPartOf': {
                        '@type': 'Periodical',
                        'name': 'Environmental Computing Quarterly'
                      }
                    }
                  },
                  'pageStart': '45',
                  'pageEnd': '67',
                  'abstract': 'As computational demands grow exponentially, the environmental impact of software systems becomes increasingly critical. This research presents novel approaches to green algorithm design...',
                  'identifier': {
                    '@type': 'PropertyValue',
                    'name': 'DOI',
                    'value': 'https://doi.org/10.1145/3695869'
                  },
                  'accessMode': 'OPEN_ACCESS',
                  'contentType': 'Research Article'
                },
                {
                  '@context': 'https://schema.org',
                  '@type': 'ScholarlyArticle',
                  'headline': 'Quantum Machine Learning: Bridging Two Worlds',
                  'alternativeHeadline': 'Classical and Quantum Approaches to Pattern Recognition',
                  'author': [
                    {
                      '@type': 'Person',
                      'name': 'Dr. Raj Patel',
                      'affiliation': {
                        '@type': 'Organization',
                        'name': 'Oxford Quantum Computing Centre'
                      }
                    },
                    {
                      '@type': 'Person',
                      'name': 'Sarah Kim',
                      'affiliation': {
                        '@type': 'Organization',
                        'name': 'IBM Quantum Network'
                      }
                    }
                  ],
                  'datePublished': '2024-11-15',
                  'isPartOf': {
                    '@type': 'PublicationIssue',
                    'issueNumber': '4',
                    'isPartOf': {
                      '@type': 'PublicationVolume',
                      'volumeNumber': '8',
                      'isPartOf': {
                        '@type': 'Periodical',
                        'name': 'Quantum Computing Review'
                      }
                    }
                  },
                  'pageStart': '112',
                  'pageEnd': '134',
                  'abstract': 'Quantum machine learning represents a convergence of quantum computing and artificial intelligence. This comprehensive review examines current methodologies and future prospects...',
                  'identifier': {
                    '@type': 'PropertyValue',
                    'name': 'DOI',
                    'value': 'https://doi.org/10.1145/3695870'
                  },
                  'accessMode': 'SUBSCRIPTION_REQUIRED',
                  'contentType': 'Review Article'
                },
                {
                  '@context': 'https://schema.org',
                  '@type': 'ScholarlyArticle',
                  'headline': 'Federated Learning at Scale: Privacy-Preserving Machine Learning',
                  'alternativeHeadline': 'Distributed Training Without Centralized Data',
                  'author': [
                    {
                      '@type': 'Person',
                      'name': 'Priya Sharma',
                      'affiliation': {
                        '@type': 'Organization',
                        'name': 'Google Research'
                      }
                    },
                    {
                      '@type': 'Person',
                      'name': 'Michael Zhang',
                      'affiliation': {
                        '@type': 'Organization',
                        'name': 'UC Berkeley'
                      }
                    }
                  ],
                  'datePublished': '2024-10-22',
                  'isPartOf': {
                    '@type': 'PublicationIssue',
                    'issueNumber': '1',
                    'isPartOf': {
                      '@type': 'PublicationVolume',
                      'volumeNumber': '15',
                      'isPartOf': {
                        '@type': 'Periodical',
                        'name': 'Privacy & Security Journal'
                      }
                    }
                  },
                  'pageStart': '78',
                  'pageEnd': '95',
                  'abstract': 'Federated learning enables machine learning on decentralized data while maintaining privacy. This paper presents new algorithms for efficient federated training across millions of devices...',
                  'identifier': {
                    '@type': 'PropertyValue',
                    'name': 'DOI',
                    'value': 'https://doi.org/10.1145/3695871'
                  },
                  'accessMode': 'OPEN_ACCESS',
                  'contentType': 'Research Article'
                },
                {
                  '@context': 'https://schema.org',
                  '@type': 'ScholarlyArticle',
                  'headline': 'Neural Architecture Search: Automating AI Design',
                  'alternativeHeadline': 'From Manual Design to Automated Discovery',
                  'author': [
                    {
                      '@type': 'Person',
                      'name': 'Thomas Anderson',
                      'affiliation': {
                        '@type': 'Organization',
                        'name': 'DeepMind'
                      }
                    }
                  ],
                  'datePublished': '2024-09-18',
                  'isPartOf': {
                    '@type': 'PublicationIssue',
                    'issueNumber': '6',
                    'isPartOf': {
                      '@type': 'PublicationVolume',
                      'volumeNumber': '11',
                      'isPartOf': {
                        '@type': 'Periodical',
                        'name': 'AI Innovation Review'
                      }
                    }
                  },
                  'pageStart': '201',
                  'pageEnd': '228',
                  'abstract': 'Neural architecture search (NAS) automates the design of neural networks. We present a comprehensive survey of NAS methods and introduce a novel evolutionary approach...',
                  'identifier': {
                    '@type': 'PropertyValue',
                    'name': 'DOI',
                    'value': 'https://doi.org/10.1145/3695872'
                  },
                  'accessMode': 'FULL_ACCESS',
                  'contentType': 'Survey Article'
                },
                {
                  '@context': 'https://schema.org',
                  '@type': 'ScholarlyArticle',
                  'headline': 'Explainable AI: Making Black Boxes Transparent',
                  'alternativeHeadline': 'Interpretability Techniques for Deep Learning',
                  'author': [
                    {
                      '@type': 'Person',
                      'name': 'Lisa Martinez',
                      'affiliation': {
                        '@type': 'Organization',
                        'name': 'MIT CSAIL'
                      }
                    },
                    {
                      '@type': 'Person',
                      'name': 'David Lee',
                      'affiliation': {
                        '@type': 'Organization',
                        'name': 'Stanford HAI'
                      }
                    }
                  ],
                  'datePublished': '2024-08-30',
                  'isPartOf': {
                    '@type': 'PublicationIssue',
                    'issueNumber': '3',
                    'isPartOf': {
                      '@type': 'PublicationVolume',
                      'volumeNumber': '9',
                      'isPartOf': {
                        '@type': 'Periodical',
                        'name': 'Journal of AI Ethics'
                      }
                    }
                  },
                  'pageStart': '156',
                  'pageEnd': '182',
                  'abstract': 'As AI systems become more prevalent in critical decisions, explainability becomes essential. This paper reviews state-of-the-art interpretability methods and proposes new visualization techniques...',
                  'identifier': {
                    '@type': 'PropertyValue',
                    'name': 'DOI',
                    'value': 'https://doi.org/10.1145/3695873'
                  },
                  'accessMode': 'OPEN_ACCESS',
                  'contentType': 'Research Article'
                },
                {
                  '@context': 'https://schema.org',
                  '@type': 'ScholarlyArticle',
                  'headline': 'Edge AI: Bringing Intelligence to IoT Devices',
                  'alternativeHeadline': 'Low-Power Machine Learning for Edge Computing',
                  'author': [
                    {
                      '@type': 'Person',
                      'name': 'James Wilson',
                      'affiliation': {
                        '@type': 'Organization',
                        'name': 'ARM Research'
                      }
                    },
                    {
                      '@type': 'Person',
                      'name': 'Yuki Tanaka',
                      'affiliation': {
                        '@type': 'Organization',
                        'name': 'Sony AI Lab'
                      }
                    }
                  ],
                  'datePublished': '2024-07-15',
                  'isPartOf': {
                    '@type': 'PublicationIssue',
                    'issueNumber': '2',
                    'isPartOf': {
                      '@type': 'PublicationVolume',
                      'volumeNumber': '7',
                      'isPartOf': {
                        '@type': 'Periodical',
                        'name': 'Embedded Systems Quarterly'
                      }
                    }
                  },
                  'pageStart': '89',
                  'pageEnd': '114',
                  'abstract': 'Edge AI enables real-time inference on resource-constrained devices. This paper presents novel compression techniques and efficient architectures for deploying neural networks on IoT devices...',
                  'identifier': {
                    '@type': 'PropertyValue',
                    'name': 'DOI',
                    'value': 'https://doi.org/10.1145/3695874'
                  },
                  'accessMode': 'FULL_ACCESS',
                  'contentType': 'Research Article'
                },
                {
                  '@context': 'https://schema.org',
                  '@type': 'ScholarlyArticle',
                  'headline': 'Multimodal AI: Integrating Vision, Language, and Audio',
                  'alternativeHeadline': 'Towards Human-Like Perception in AI Systems',
                  'author': [
                    {
                      '@type': 'Person',
                      'name': 'Dr. Sophia Chen',
                      'affiliation': {
                        '@type': 'Organization',
                        'name': 'Meta AI Research'
                      }
                    },
                    {
                      '@type': 'Person',
                      'name': 'Alex Thompson',
                      'affiliation': {
                        '@type': 'Organization',
                        'name': 'OpenAI'
                      }
                    },
                    {
                      '@type': 'Person',
                      'name': 'Nina Patel',
                      'affiliation': {
                        '@type': 'Organization',
                        'name': 'Google Brain'
                      }
                    }
                  ],
                  'datePublished': '2024-06-08',
                  'isPartOf': {
                    '@type': 'PublicationIssue',
                    'issueNumber': '5',
                    'isPartOf': {
                      '@type': 'PublicationVolume',
                      'volumeNumber': '13',
                      'isPartOf': {
                        '@type': 'Periodical',
                        'name': 'Cognitive Computing Journal'
                      }
                    }
                  },
                  'pageStart': '234',
                  'pageEnd': '267',
                  'abstract': 'Multimodal AI systems that can process and integrate multiple sensory inputs represent a significant step towards human-like intelligence. We present a unified architecture for joint vision-language-audio understanding...',
                  'identifier': {
                    '@type': 'PropertyValue',
                    'name': 'DOI',
                    'value': 'https://doi.org/10.1145/3695875'
                  },
                  'accessMode': 'SUBSCRIPTION_REQUIRED',
                  'contentType': 'Research Article'
                }
              ],
              cardConfig: {
                showContentTypeLabel: true,
                showTitle: true,
                showSubtitle: true,
                showThumbnail: true,
                thumbnailPosition: 'top',
                showPublicationTitle: true,
                showVolumeIssue: true,
                showNumberOfIssues: true,
                showBookSeriesTitle: false,
                showChapterPages: true,
                showPublicationDate: true,
                showDOI: true,
                showISSN: false,
                showISBN: false,
                showAuthors: true,
                authorStyle: 'full',
                showAffiliations: true,
                showAbstract: true,
                abstractLength: 'medium',
                showKeywords: true,
                showAccessStatus: true,
                showViewDownloadOptions: true,
                showUsageMetrics: true,
                titleStyle: 'large'
              },
              cardVariantId: 'compact-variant',
              layout: 'list',
              maxItems: 6,
              aiSource: {
                prompt: ''
              },
              spanningConfig: {
                enabled: true,
                preset: 'custom',
                customPattern: [1, 2, 2, 1, 1, 2]
              },
              internalGridColumns: 3,
              sectionId: 'hsv8z4ZenytDfWv2ZR0Vs'
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

/**
 * Get page stub by page type and website ID
 * Homepage is website-specific, other pages use generic stubs
 */
export function getPageStub(pageType: PageType, websiteId: string = 'catalyst-demo'): CanvasItemStub[] {
  switch (pageType) {
    case 'home':
      return getHomepageStubForWebsite(websiteId)
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
      return getHomepageStubForWebsite(websiteId)
  }
}

// Legacy alias for backward compatibility
export function createHomepageStub(): CanvasItemStub[] {
  return createCatalystHomepageStub()
}

