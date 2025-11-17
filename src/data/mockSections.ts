/**
 * Mock Sections
 * Pre-defined reusable sections for demo purposes
 */

import { nanoid } from 'nanoid'
import type { CustomSection } from '../types/widgets'

// Simple CTA Section
const ctaSection: CustomSection = {
  id: 'demo-cta-section',
  name: 'Call to Action',
  description: 'Simple CTA section with heading and button',
  source: 'mock',
  websiteId: 'catalyst-demo-site',
  websiteName: 'Catalyst Demo Site',
  createdAt: new Date('2024-01-01'),
  widgets: [], // Legacy field
  canvasItems: [
    {
      id: nanoid(),
      type: 'content-block',
      name: 'CTA Section',
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
              text: 'Ready to get started?',
              align: 'center',
              sectionId: ''
            },
            {
              id: nanoid(),
              type: 'text',
              text: 'Join thousands of researchers publishing with us',
              align: 'center',
              sectionId: ''
            },
            {
              id: nanoid(),
              type: 'button',
              text: 'Submit Your Paper',
              variant: 'primary',
              align: 'center',
              sectionId: ''
            }
          ]
        }
      ],
      backgroundColor: '#f8f9fa',
      padding: 'large'
    }
  ]
}

// Footer Section
const footerSection: CustomSection = {
  id: 'demo-footer-section',
  name: 'Simple Footer',
  description: 'Basic footer with copyright and links',
  source: 'mock',
  websiteId: 'catalyst-demo-site',
  websiteName: 'Catalyst Demo Site',
  createdAt: new Date('2024-01-01'),
  widgets: [],
  canvasItems: [
    {
      id: nanoid(),
      type: 'content-block',
      name: 'Footer',
      layout: 'three-columns',
      areas: [
        {
          id: nanoid(),
          position: 'left',
          widgets: [
            {
              id: nanoid(),
              type: 'text',
              text: '© 2024 Publisher Name',
              align: 'left',
              sectionId: ''
            }
          ]
        },
        {
          id: nanoid(),
          position: 'center',
          widgets: [
            {
              id: nanoid(),
              type: 'text',
              text: 'About | Contact | Terms',
              align: 'center',
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
              type: 'text',
              text: 'Social Media Links',
              align: 'right',
              sectionId: ''
            }
          ]
        }
      ],
      backgroundColor: '#2d3748',
      padding: 'medium',
      contextAware: true
    }
  ]
}

export const mockSections: CustomSection[] = [
  ctaSection,
  footerSection
]

