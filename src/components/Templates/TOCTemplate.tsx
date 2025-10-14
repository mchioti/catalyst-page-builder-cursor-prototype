import React from 'react'
import type { WidgetSection, LayoutArea, Widget } from '../../types'

// TOC Template Configuration
export const createTOCTemplate = (journalCode: string): WidgetSection[] => {
  return [
    // Header Section (Global - inherited from theme)
    {
      id: 'toc-header-section',
      name: 'Header',
      type: 'header',
      layout: 'single-column',
      areas: [
        {
          id: 'toc-header-area',
          name: 'Header Content',
          maxWidgets: 5,
          widgets: [
            {
              id: 'toc-site-header',
              type: 'navbar',
              skin: 'default',
              links: [
                { label: 'Home', href: '/' },
                { label: 'Browse Journals', href: '/journals' },
                { label: 'About', href: '/about' },
                { label: 'Search', href: '/search' }
              ]
            }
          ]
        }
      ]
    },

    // Journal Banner Section
    {
      id: 'toc-journal-banner-section',
      name: 'Journal Banner',
      type: 'hero',
      layout: 'single-column',
      areas: [
        {
          id: 'toc-journal-banner-area',
          name: 'Journal Banner Content',
          maxWidgets: 3,
          widgets: [
            {
              id: 'toc-journal-banner-widget',
              type: 'heading',
              skin: 'hero',
              text: getJournalBannerText(journalCode),
              level: 1
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
              skin: 'journal',
              links: getJournalMenuLinks(journalCode)
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
              skin: 'breadcrumb',
              text: getBreadcrumbText(journalCode)
            }
          ]
        }
      ]
    },

    // Main Content Section (2-column)
    {
      id: 'toc-main-content-section',
      name: 'Main Content',
      type: 'content',
      layout: 'two-column',
      areas: [
        // Left Column - Issue TOC
        {
          id: 'toc-content-left',
          name: 'Issue Table of Contents',
          maxWidgets: 1,
          widgets: [
            {
              id: 'toc-widget',
              type: 'publication-list',
              skin: 'toc',
              contentSource: 'context', // Reads from URL context
              layout: 'detailed',
              showMetadata: true,
              groupBy: 'section',
              sortBy: 'order'
            } as Widget
          ]
        },
        // Right Column - Cover Image
        {
          id: 'toc-content-right',
          name: 'Current Issue Cover',
          maxWidgets: 2,
          widgets: [
            {
              id: 'toc-cover-widget',
              type: 'image',
              skin: 'cover',
              src: getCoverImageUrl(journalCode),
              alt: `Current Issue Cover - ${getJournalName(journalCode)}`,
              ratio: '3:4'
            },
            {
              id: 'toc-issue-info-widget',
              type: 'text',
              skin: 'metadata',
              text: getIssueInfoText(journalCode)
            }
          ]
        }
      ]
    },

    // Footer Section (Global - inherited from theme)
    {
      id: 'toc-footer-section',
      name: 'Footer',
      type: 'footer',
      layout: 'single-column',
      areas: [
        {
          id: 'toc-footer-area',
          name: 'Footer Content',
          maxWidgets: 3,
          widgets: [
            {
              id: 'toc-site-footer',
              type: 'text',
              skin: 'footer',
              text: 'Footer content goes here'
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

function getJournalBannerText(journalCode: string): string {
  const journalInfo = {
    'advma': 'Advanced Materials - Volume 35 • Issue 48',
    'embo': 'The EMBO Journal - Volume 42 • Issue 24'
  }
  return journalInfo[journalCode as keyof typeof journalInfo] || 'Journal Issue'
}

function getJournalMenuLinks(journalCode: string): Array<{ label: string; href: string }> {
  return [
    { label: 'Journal Home', href: `/journal/${journalCode}` },
    { label: 'Current Issue', href: `/toc/${journalCode}/current` },
    { label: 'Archive', href: `/journal/${journalCode}/archive` },
    { label: 'Subscribe/Renew', href: `/journal/${journalCode}/subscribe` },
    { label: 'About', href: `/journal/${journalCode}/about` },
    { label: 'For Authors', href: `/journal/${journalCode}/authors` }
  ]
}

function getBreadcrumbText(journalCode: string): string {
  const journalName = getJournalName(journalCode)
  return `Home → ${journalName} → Current Issue`
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

// AI-generated mock articles for template preview
export const generateMockTOCContent = (journalCode: string) => {
  const mockArticles = {
    'advma': [
      {
        id: 'advma-art-1',
        title: 'Perovskite Solar Cells: Advanced Tandem Architectures for Enhanced Efficiency',
        authors: ['Sarah Chen', 'Michael Rodriguez', 'Elena Petrov', 'James Wilson'],
        section: 'Research Articles',
        pages: '2401234',
        doi: 'https://doi.org/10.1002/adma.202401234',
        abstract: 'Novel tandem perovskite architectures demonstrate unprecedented efficiency improvements...'
      },
      {
        id: 'advma-art-2', 
        title: 'Machine Learning-Guided Discovery of 2D Materials for Energy Storage',
        authors: ['Dr. Alex Kumar', 'Prof. Lisa Zhang', 'Dr. Robert Thompson'],
        section: 'Research Articles',
        pages: '2401235',
        doi: 'https://doi.org/10.1002/adma.202401235',
        abstract: 'AI-driven materials discovery accelerates identification of promising 2D materials...'
      },
      {
        id: 'advma-art-3',
        title: 'Flexible Electronics: From Lab to Market - Current Challenges and Future Prospects',
        authors: ['Prof. David Park', 'Dr. Michelle Foster'],
        section: 'Progress Reports',
        pages: '2401236', 
        doi: 'https://doi.org/10.1002/adma.202401236',
        abstract: 'Comprehensive review of flexible electronics commercialization challenges...'
      }
    ],
    'embo': [
      {
        id: 'embo-art-1',
        title: 'CRISPR-Cas9 Mediated Gene Editing in Human Embryonic Stem Cells',
        authors: ['Maria Andersson', 'Hiroshi Tanaka', 'Jennifer Liu'],
        section: 'Research Papers',
        pages: 'e114567',
        doi: 'https://doi.org/10.15252/embj.2024114567',
        abstract: 'Precise gene editing protocols for human embryonic stem cell applications...'
      },
      {
        id: 'embo-art-2',
        title: 'Mitochondrial Dynamics in Neurodegeneration: New Therapeutic Targets',
        authors: ['Prof. Anna Schmidt', 'Dr. Kenji Nakamura', 'Dr. Sophie Dubois'],
        section: 'Research Papers', 
        pages: 'e114568',
        doi: 'https://doi.org/10.15252/embj.2024114568',
        abstract: 'Investigation of mitochondrial dysfunction in neurodegenerative diseases...'
      },
      {
        id: 'embo-art-3',
        title: 'The Evolution of Single-Cell RNA Sequencing: From Method to Medicine',
        authors: ['Prof. Oliver Johnson', 'Dr. Yuki Sato', 'Dr. Isabella Martinez'],
        section: 'Review Articles',
        pages: 'e114569',
        doi: 'https://doi.org/10.15252/embj.2024114569',
        abstract: 'Comprehensive review of single-cell RNA sequencing technological advances...'
      }
    ]
  }
  
  return mockArticles[journalCode as keyof typeof mockArticles] || mockArticles.advma
}

export default { createTOCTemplate, generateMockTOCContent }
