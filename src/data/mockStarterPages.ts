/**
 * Mock Starter Pages
 * Pre-defined starter pages for demo purposes
 */

import { nanoid } from 'nanoid'
import type { CustomStarterPage } from '../types/widgets'

// Catalyst Demo Homepage Starter (generic template before modifications)
const catalystGenericHomepage: CustomStarterPage = {
  id: 'catalyst-generic-homepage',
  name: 'Classic Homepage Template',
  description: 'Generic homepage template provided by Classic theme',
  source: 'mock',
  websiteId: 'catalyst-demo-site',
  websiteName: 'Catalyst Demo Site',
  createdAt: new Date('2024-01-01'),
  canvasItems: [
    {
      id: nanoid(),
      type: 'content-block',
      name: 'Hero Section',
      layout: 'one-column',
      areas: [
        {
          id: nanoid(),
          position: 'center',
          widgets: [
            {
              id: nanoid(),
              type: 'heading',
              level: 1,
              text: 'Welcome to Your Website',
              align: 'center',
              sectionId: ''
            },
            {
              id: nanoid(),
              type: 'text',
              text: 'Add your hero message here. This is a Hero section that comes as part of the Classic-themed Homepage template.',
              align: 'center',
              sectionId: ''
            },
            {
              id: nanoid(),
              type: 'button',
              text: 'Get Started',
              variant: 'primary',
              align: 'center',
              sectionId: ''
            }
          ]
        }
      ],
      backgroundColor: '#1e40af',
      padding: 'large',
      contextAware: true
    }
  ]
}

export const mockStarterPages: CustomStarterPage[] = [
  catalystGenericHomepage
]

