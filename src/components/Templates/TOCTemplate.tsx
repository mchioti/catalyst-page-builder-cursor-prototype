import React from 'react'
import type { WidgetSection, LayoutArea, Widget } from '../../types'

// TOC Template Configuration
export const createTOCTemplate = (journalCode: string): WidgetSection[] => {
  return [
    // Header Section (Global - Black header with search)
    {
      id: 'toc-header-section',
      name: 'Header',
      type: 'header',
      layout: 'single-column',
      areas: [
        {
          id: 'toc-header-area',
          name: 'Header Content',
          maxWidgets: 1,
          widgets: [
            {
              id: 'toc-site-header',
              type: 'navbar',
              skin: 'dark',
              links: [
                { label: 'ANYWHERE', href: '#' },
                { label: 'Advanced Search', href: '#' },
                { label: 'Maria Chioti', href: '#' }
              ]
            }
          ]
        }
      ]
    },

    // Journal Banner Section (Publication Details + 3 CTA Buttons)
    {
      id: 'toc-journal-banner-section',
      name: 'Journal Banner',
      type: 'hero',
      layout: 'vertical',
      areas: [
        // Top area - Journal metadata
        {
          id: 'toc-journal-metadata-area',
          name: 'Journal Metadata',
          maxWidgets: 1,
          widgets: [
            {
              id: 'toc-issue-details-widget',
              type: 'publication-details',
              skin: 'journal',
              contentSource: 'ai-generated', // Use AI mock data for template preview
              layout: 'hero',
              // AI generation for template preview
              aiSource: {
                prompt: `Generate issue metadata for ${journalCode === 'advma' ? 'Advanced Materials' : 'EMBO Journal'} current issue`,
                generatedContent: getIssueMetadataForContext(journalCode),
                lastGenerated: new Date()
              }
            }
          ]
        },
        // Bottom area - CTA buttons (grouped in 1 row)
        {
          id: 'toc-journal-cta-area',
          name: 'Journal CTA Buttons',
          maxWidgets: 3,
          widgets: [
            {
              id: 'toc-subscribe-button',
              type: 'button',
              skin: 'primary',
              text: 'SUBSCRIBE/RENEW',
              variant: 'solid',
              size: 'medium',
              url: `/journal/${journalCode}/subscribe`
            },
            {
              id: 'toc-librarian-button',
              type: 'button',
              skin: 'primary',
              text: 'RECOMMEND TO A LIBRARIAN',
              variant: 'solid',
              size: 'medium',
              url: `/journal/${journalCode}/recommend`
            },
            {
              id: 'toc-submit-button',
              type: 'button',
              skin: 'primary',
              text: 'SUBMIT AN ARTICLE',
              variant: 'solid',
              size: 'medium',
              url: `/journal/${journalCode}/submit`
            }
          ]
        }
      ]
    },

    // Journal Menu Section
    {
      id: 'toc-journal-menu-section', 
      name: 'Journal Menu',
      type: 'navigation',
      layout: 'single-column',
      areas: [
        {
          id: 'toc-journal-menu-area',
          name: 'Journal Navigation',
          maxWidgets: 1,
          widgets: [
            {
              id: 'toc-journal-menu-widget',
              type: 'navbar',
              skin: 'primary',
              links: [
                { label: 'Journal Home', href: `/journal/${journalCode}` },
                { label: 'Current Issue', href: `/toc/${journalCode}/current` },
                { label: 'Archive', href: `/journal/${journalCode}/archive` },
                { label: 'Subscribe/Renew', href: `/journal/${journalCode}/subscribe` },
                { label: 'About', href: `/journal/${journalCode}/about` },
                { label: 'For Authors', href: `/journal/${journalCode}/authors` }
              ]
            }
          ]
        }
      ]
    },

    // Breadcrumbs Section
    {
      id: 'toc-breadcrumbs-section',
      name: 'Breadcrumbs',
      type: 'navigation',
      layout: 'single-column',
      areas: [
        {
          id: 'toc-breadcrumbs-area',
          name: 'Breadcrumb Navigation',
          maxWidgets: 1,
          widgets: [
            {
              id: 'toc-breadcrumbs-widget',
              type: 'text',
              skin: 'muted',
              text: `Home → ${getJournalName(journalCode)} → Current Issue`
            }
          ]
        }
      ]
    },

    // Main Content Section (2/3 + 1/3 columns like live site)
    {
      id: 'toc-main-content-section',
      name: 'Main Content',
      type: 'content',
      layout: 'one-third-right',
      areas: [
        // Left Column (2/3 width) - Issue TOC
        {
          id: 'toc-content-left',
          name: 'Issue Table of Contents',
          maxWidgets: 1,
          widgets: [
            {
              id: 'toc-widget',
              type: 'publication-list',
              skin: 'compact',
              contentSource: 'ai-generated',
              publications: generateMockTOCContent(journalCode),
              cardConfig: {
                // Content Identification
                showContentTypeLabel: true,
                showTitle: true, // Always shown
                showSubtitle: false,
                showThumbnail: true,
                thumbnailPosition: 'left',
                
                // Publication Context 
                showPublicationTitle: true, // Journal name for articles
                showVolumeIssue: false, // Already shown in banner
                showBookSeriesTitle: false, // Not applicable for articles
                showChapterPages: false, // Not applicable for articles
                showPublicationDate: true,
                showDOI: true,
                showISSN: false, // Already shown in banner
                showISBN: false, // Not applicable for articles
                
                // Author Information
                showAuthors: true,
                authorStyle: 'full',
                showAffiliations: false,
                
                // Content Summary
                showAbstract: false, // Keep compact for TOC
                abstractLength: 'short',
                showKeywords: false,
                
                // Access & Usage
                showAccessStatus: true,
                showViewDownloadOptions: true,
                showUsageMetrics: false,
                
                // Display Configuration
                titleStyle: 'medium'
              },
              layout: 'list',
              maxItems: 6,
              // AI generation for template preview
              aiSource: {
                prompt: `Generate ${journalCode === 'advma' ? 'materials science' : 'molecular biology'} articles for current issue TOC`,
                generatedContent: generateMockTOCContent(journalCode),
                lastGenerated: new Date()
              }
            }
          ]
        },
        // Right Column (1/3 width) - Cover Image  
        {
          id: 'toc-content-right',
          name: 'Current Issue Cover',
          maxWidgets: 3,
          widgets: [
            {
              id: 'toc-cover-widget',
              type: 'image',
              skin: 'default',
              src: getCoverImageUrl(journalCode),
              alt: `Current Issue Cover - ${getJournalName(journalCode)}`,
              ratio: '3:4'
            },
            {
              id: 'toc-issue-info-widget',
              type: 'text',
              skin: 'center',
              text: getIssueInfoText(journalCode)
            },
            {
              id: 'toc-metrics-widget',
              type: 'text',
              skin: 'muted',
              text: getJournalMetrics(journalCode)
            }
          ]
        }
      ]
    },

    // Footer Section (Simple footer)
    {
      id: 'toc-footer-section',
      name: 'Footer',
      type: 'footer',
      layout: 'single-column',
      areas: [
        {
          id: 'toc-footer-area',
          name: 'Footer Content',
          maxWidgets: 1,
          widgets: [
            {
              id: 'toc-site-footer',
              type: 'text',
              skin: 'footer',
              text: '© 2025 Atypon UX Design Studio • Privacy Policy • Terms of Use • Wiley Online Library'
            }
          ]
        }
      ]
    }
  ]
}

// Helper functions for dynamic content based on journal context
function getJournalName(journalCode: string): string {
  const journalNames = {
    'advma': 'Advanced Materials',
    'embo': 'The EMBO Journal'
  }
  return journalNames[journalCode as keyof typeof journalNames] || 'Journal'
}

function getCoverImageUrl(journalCode: string): string {
  const coverImages = {
    'advma': 'https://images.unsplash.com/photo-1518152006812-edab29b069ac?w=300&h=400&fit=crop',
    'embo': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=400&fit=crop'
  }
  return coverImages[journalCode as keyof typeof coverImages] || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=400&fit=crop'
}

function getIssueInfoText(journalCode: string): string {
  const issueInfo = {
    'advma': 'Volume 35 • Issue 48 • December 2024',
    'embo': 'Volume 42 • Issue 24 • December 2024'
  }
  return issueInfo[journalCode as keyof typeof issueInfo] || 'Current Issue'
}

function getJournalMetrics(journalCode: string): string {
  const metrics = {
    'advma': 'Impact Factor: 32.086 | CiteScore: 58.5 | Downloads: 2.8M',
    'embo': 'Impact Factor: 12.779 | CiteScore: 24.3 | Downloads: 892K'
  }
  return metrics[journalCode as keyof typeof metrics] || 'Journal Metrics'
}

// Generate issue metadata in schema.org format for Publication Details widget
function getIssueMetadataForContext(journalCode: string): any {
  const issueData = {
    'advma': {
      '@context': 'https://schema.org',
      '@type': 'PublicationIssue',
      'issueNumber': '12',
      'volumeNumber': '67',
      'datePublished': '2024-12-01',
      'name': 'Volume 67 • Issue 12',
      'description': 'This issue features groundbreaking research in perovskite solar cells, quantum materials, and sustainable energy technologies.',
      'isPartOf': {
        '@type': 'PublicationVolume',
        'volumeNumber': '67',
        'isPartOf': {
          '@type': 'Periodical',
          'name': 'Advanced Materials',
          'issn': ['0935-9648', '1521-4095'],
          'editor': {
            '@type': 'Organization',
            'name': 'Wiley-VCH and Materials Research Society'
          }
        }
      },
      'identifier': [
        {
          '@type': 'PropertyValue',
          'name': 'ISSN (print)',
          'value': '0935-9648'
        },
        {
          '@type': 'PropertyValue', 
          'name': 'ISSN (online)',
          'value': '1521-4095'
        }
      ]
    },
    'embo': {
      '@context': 'https://schema.org',
      '@type': 'PublicationIssue',
      'issueNumber': '24',
      'volumeNumber': '42',
      'datePublished': '2024-12-01',
      'name': 'Volume 42 • Issue 24',
      'description': 'This issue explores cutting-edge molecular biology research including CRISPR applications, protein structures, and cellular mechanisms.',
      'isPartOf': {
        '@type': 'PublicationVolume',
        'volumeNumber': '42',
        'isPartOf': {
          '@type': 'Periodical',
          'name': 'The EMBO Journal',
          'issn': ['0261-4189', '1460-2075'],
          'editor': {
            '@type': 'Organization',
            'name': 'European Molecular Biology Organization'
          }
        }
      },
      'identifier': [
        {
          '@type': 'PropertyValue',
          'name': 'ISSN (print)',
          'value': '0261-4189'
        },
        {
          '@type': 'PropertyValue',
          'name': 'ISSN (online)', 
          'value': '1460-2075'
        }
      ]
    }
  }
  
  return issueData[journalCode as keyof typeof issueData] || issueData.advma
}

// AI-generated mock articles for template preview (schema.org format)
export const generateMockTOCContent = (journalCode: string) => {
  const mockArticles = {
    'advma': [
      {
        "@context": "https://schema.org",
        "@type": "ScholarlyArticle",
        "headline": "Perovskite Solar Cells: Advanced Tandem Architectures for Enhanced Efficiency",
        "author": [
          { "@type": "Person", "name": "Sarah Chen", "affiliation": { "@type": "Organization", "name": "MIT Materials Science" } },
          { "@type": "Person", "name": "Michael Rodriguez", "affiliation": { "@type": "Organization", "name": "Stanford University" } },
          { "@type": "Person", "name": "Elena Petrov", "affiliation": { "@type": "Organization", "name": "Harvard University" } },
          { "@type": "Person", "name": "James Wilson", "affiliation": { "@type": "Organization", "name": "UC Berkeley" } }
        ],
        "datePublished": "2024-12-15",
        "isPartOf": {
          "@type": "PublicationIssue",
          "issueNumber": "48",
          "isPartOf": {
            "@type": "PublicationVolume",
            "volumeNumber": "35",
            "isPartOf": { "@type": "Periodical", "name": "Advanced Materials" }
          }
        },
        "pageStart": "2401234",
        "abstract": "Novel tandem perovskite architectures demonstrate unprecedented efficiency improvements in solar cell technology, opening new pathways for renewable energy applications.",
        "identifier": { "@type": "PropertyValue", "name": "DOI", "value": "https://doi.org/10.1002/adma.202401234" },
        "accessMode": "FULL_ACCESS",
        "contentType": "Research Articles"
      },
      {
        "@context": "https://schema.org",
        "@type": "ScholarlyArticle",
        "headline": "Machine Learning-Guided Discovery of 2D Materials for Energy Storage",
        "author": [
          { "@type": "Person", "name": "Alex Kumar", "affiliation": { "@type": "Organization", "name": "MIT Computer Science" } },
          { "@type": "Person", "name": "Lisa Zhang", "affiliation": { "@type": "Organization", "name": "Stanford AI Lab" } },
          { "@type": "Person", "name": "Robert Thompson", "affiliation": { "@type": "Organization", "name": "UC San Diego" } }
        ],
        "datePublished": "2024-12-15",
        "isPartOf": {
          "@type": "PublicationIssue",
          "issueNumber": "48",
          "isPartOf": {
            "@type": "PublicationVolume",
            "volumeNumber": "35",
            "isPartOf": { "@type": "Periodical", "name": "Advanced Materials" }
          }
        },
        "pageStart": "2401235",
        "abstract": "AI-driven materials discovery accelerates identification of promising 2D materials for next-generation energy storage applications.",
        "identifier": { "@type": "PropertyValue", "name": "DOI", "value": "https://doi.org/10.1002/adma.202401235" },
        "accessMode": "FULL_ACCESS",
        "contentType": "Research Articles"
      },
      {
        "@context": "https://schema.org",
        "@type": "ScholarlyArticle",
        "headline": "Flexible Electronics: From Lab to Market - Current Challenges and Future Prospects",
        "author": [
          { "@type": "Person", "name": "David Park", "affiliation": { "@type": "Organization", "name": "Seoul National University" } },
          { "@type": "Person", "name": "Michelle Foster", "affiliation": { "@type": "Organization", "name": "Cambridge University" } }
        ],
        "datePublished": "2024-12-15",
        "isPartOf": {
          "@type": "PublicationIssue",
          "issueNumber": "48",
          "isPartOf": {
            "@type": "PublicationVolume",
            "volumeNumber": "35",
            "isPartOf": { "@type": "Periodical", "name": "Advanced Materials" }
          }
        },
        "pageStart": "2401236",
        "abstract": "Comprehensive review of flexible electronics commercialization challenges and emerging solutions for scalable manufacturing.",
        "identifier": { "@type": "PropertyValue", "name": "DOI", "value": "https://doi.org/10.1002/adma.202401236" },
        "accessMode": "FULL_ACCESS",
        "contentType": "Progress Reports"
      }
    ],
    'embo': [
      {
        "@context": "https://schema.org",
        "@type": "ScholarlyArticle",
        "headline": "CRISPR-Cas9 Mediated Gene Editing in Human Embryonic Stem Cells",
        "author": [
          { "@type": "Person", "name": "Maria Andersson", "affiliation": { "@type": "Organization", "name": "Karolinska Institute" } },
          { "@type": "Person", "name": "Hiroshi Tanaka", "affiliation": { "@type": "Organization", "name": "University of Tokyo" } },
          { "@type": "Person", "name": "Jennifer Liu", "affiliation": { "@type": "Organization", "name": "Harvard Medical School" } }
        ],
        "datePublished": "2024-12-15",
        "isPartOf": {
          "@type": "PublicationIssue",
          "issueNumber": "24",
          "isPartOf": {
            "@type": "PublicationVolume",
            "volumeNumber": "42",
            "isPartOf": { "@type": "Periodical", "name": "The EMBO Journal" }
          }
        },
        "pageStart": "e114567",
        "abstract": "Precise gene editing protocols for human embryonic stem cell applications demonstrate enhanced efficiency and reduced off-target effects.",
        "identifier": { "@type": "PropertyValue", "name": "DOI", "value": "https://doi.org/10.15252/embj.2024114567" },
        "accessMode": "FULL_ACCESS",
        "contentType": "Research Papers"
      },
      {
        "@context": "https://schema.org",
        "@type": "ScholarlyArticle",
        "headline": "Mitochondrial Dynamics in Neurodegeneration: New Therapeutic Targets",
        "author": [
          { "@type": "Person", "name": "Anna Schmidt", "affiliation": { "@type": "Organization", "name": "Max Planck Institute" } },
          { "@type": "Person", "name": "Kenji Nakamura", "affiliation": { "@type": "Organization", "name": "RIKEN Institute" } },
          { "@type": "Person", "name": "Sophie Dubois", "affiliation": { "@type": "Organization", "name": "Institut Pasteur" } }
        ],
        "datePublished": "2024-12-15",
        "isPartOf": {
          "@type": "PublicationIssue",
          "issueNumber": "24",
          "isPartOf": {
            "@type": "PublicationVolume",
            "volumeNumber": "42",
            "isPartOf": { "@type": "Periodical", "name": "The EMBO Journal" }
          }
        },
        "pageStart": "e114568",
        "abstract": "Investigation of mitochondrial dysfunction in neurodegenerative diseases reveals novel therapeutic intervention points.",
        "identifier": { "@type": "PropertyValue", "name": "DOI", "value": "https://doi.org/10.15252/embj.2024114568" },
        "accessMode": "FULL_ACCESS",
        "contentType": "Research Papers"
      },
      {
        "@context": "https://schema.org",
        "@type": "ScholarlyArticle",
        "headline": "The Evolution of Single-Cell RNA Sequencing: From Method to Medicine",
        "author": [
          { "@type": "Person", "name": "Oliver Johnson", "affiliation": { "@type": "Organization", "name": "Oxford University" } },
          { "@type": "Person", "name": "Yuki Sato", "affiliation": { "@type": "Organization", "name": "University of Kyoto" } },
          { "@type": "Person", "name": "Isabella Martinez", "affiliation": { "@type": "Organization", "name": "Barcelona Institute of Science" } }
        ],
        "datePublished": "2024-12-15",
        "isPartOf": {
          "@type": "PublicationIssue",
          "issueNumber": "24",
          "isPartOf": {
            "@type": "PublicationVolume",
            "volumeNumber": "42",
            "isPartOf": { "@type": "Periodical", "name": "The EMBO Journal" }
          }
        },
        "pageStart": "e114569",
        "abstract": "Comprehensive review of single-cell RNA sequencing technological advances and their clinical applications in precision medicine.",
        "identifier": { "@type": "PropertyValue", "name": "DOI", "value": "https://doi.org/10.15252/embj.2024114569" },
        "accessMode": "FULL_ACCESS",
        "contentType": "Review Articles"
      }
    ]
  }
  
  return mockArticles[journalCode as keyof typeof mockArticles] || mockArticles.advma
}

export default { createTOCTemplate, generateMockTOCContent }
