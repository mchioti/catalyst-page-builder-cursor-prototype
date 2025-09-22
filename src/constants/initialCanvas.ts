// Initial canvas setup with Wiley Online Library sections

import { CanvasItem } from '../types/widgets'

export const INITIAL_CANVAS_ITEMS: CanvasItem[] = [
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
            // @ts-expect-error - isModified is extension property for template tracking
            isModified: true,
            modificationReason: 'Custom Wiley branding'
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
            // @ts-expect-error - isModified is extension property for template tracking
            isModified: true,
            modificationReason: 'Custom Wiley messaging and tagline'
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
