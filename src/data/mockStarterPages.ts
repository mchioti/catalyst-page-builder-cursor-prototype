/**
 * Mock Starter Pages
 * Pre-defined starter pages for demo purposes (FEBS homepage variants, etc.)
 */

import { nanoid } from 'nanoid'
import type { CustomStarterPage } from '../types/widgets'

// FEBS 2017 Homepage - Classic layout with sidebar
const febs2017Homepage: CustomStarterPage = {
  id: 'febs-2017-homepage',
  name: 'FEBS Homepage (2017)',
  description: 'Classic FEBS homepage design from 2017 with sidebar navigation',
  source: 'mock',
  websiteId: 'febs-press',
  websiteName: 'FEBS Press',
  createdAt: new Date('2017-01-01'),
  canvasItems: [
    // Global Header
    {
      id: nanoid(),
      type: 'content-block',
      name: 'Global Header',
      layout: 'two-columns',
      areas: [
        {
          id: nanoid(),
          position: 'left',
          widgets: [
            {
              id: nanoid(),
              type: 'heading',
              level: 2,
              text: 'FEBS Press',
              align: 'left',
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
              text: 'Federation of European Biochemical Societies',
              align: 'right',
              sectionId: ''
            }
          ]
        }
      ],
      backgroundColor: '#00AB9F',
      padding: 'medium',
      contextAware: true
    },
    // Hero Section
    {
      id: nanoid(),
      type: 'content-block',
      name: 'Hero Banner',
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
              text: 'FEBS Open Bio',
              align: 'center',
              sectionId: ''
            },
            {
              id: nanoid(),
              type: 'text',
              text: 'An open access journal for molecular and cellular life sciences',
              align: 'center',
              sectionId: ''
            }
          ]
        }
      ],
      backgroundColor: '#f5f5f5',
      padding: 'large'
    }
  ]
}

// FEBS 2020 Homepage - Modern card-based layout
const febs2020Homepage: CustomStarterPage = {
  id: 'febs-2020-homepage',
  name: 'FEBS Homepage (2020)',
  description: 'Modernized FEBS homepage with card-based layout',
  source: 'mock',
  websiteId: 'febs-press',
  websiteName: 'FEBS Press',
  createdAt: new Date('2020-01-01'),
  canvasItems: [
    {
      id: nanoid(),
      type: 'content-block',
      name: 'Modern Header',
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
              text: 'FEBS Press',
              align: 'center',
              sectionId: ''
            },
            {
              id: nanoid(),
              type: 'text',
              text: 'Publishing excellence in molecular life sciences',
              align: 'center',
              sectionId: ''
            }
          ]
        }
      ],
      backgroundColor: '#00AB9F',
      padding: 'large',
      contextAware: true
    }
  ]
}

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
  febs2017Homepage,
  febs2020Homepage,
  catalystGenericHomepage
]

