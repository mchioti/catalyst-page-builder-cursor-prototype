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
  websiteId: 'catalyst-demo',
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

// FEBS Press Homepage Starter (2025 version)
const febsHomepage2025: CustomStarterPage = {
  id: 'febs-homepage-2025',
  name: 'FEBS Homepage 2025',
  description: 'FEBS Press homepage with journal showcase and highlights',
  source: 'mock',
  websiteId: 'febs-press',
  websiteName: 'FEBS Press',
  createdAt: new Date('2025-01-01'),
  canvasItems: [
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
    <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">The FEBS Journal</h3>
    <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">Editor's Choice</p>
    <a href="#" style="color: #00B5FF; text-decoration: none; font-size: 14px;">Blood group O expression in normal tissues and tumors</a>
    <ul style="margin: 12px 0 0 0; padding-left: 20px; font-size: 14px; color: #444;">
      <li>Ea Klein</li>
      <li>Richard</li>
      <li>and colleagues</li>
    </ul>
    <p style="margin: 12px 0 0 0; font-size: 12px; color: #999;">First published: 30/06/2025</p>
  </div>
  
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
      layout: 'two-column',
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
              text: 'The various global challenges encountered by all countries necessitate prioritizing a seamless and genuine global scientific collaboration that is devoid of bias and prejudice. There is an increasing urgency to strengthen Science ethically and financially and to reaffirm our dedication to enduring values such as peace, freedom, security, human dignity, sustainable development, environmental protection, scientific and technological progress, as well as the fight against social exclusion and discrimination. Read the basic principles of the Milan Declaration on the Crucial Role of Science in meeting Global Challenges and sign the petition to support the cause.',
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
    <h4 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">Latest in AI & Machine Learning</h4>
    <p style="margin: 0 0 16px 0; font-size: 14px; color: #666; line-height: 1.6;">Cutting-edge research in artificial intelligence, neural networks, and computational learning theory.</p>
    <a href="#" style="color: #00B5FF; text-decoration: none; font-size: 14px; font-weight: 500;">Explore Articles →</a>
  </div>
  
  <div style="background: white; padding: 24px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h4 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">Computer Systems & Architecture</h4>
    <p style="margin: 0 0 16px 0; font-size: 14px; color: #666; line-height: 1.6;">Breakthrough discoveries in distributed systems, cloud computing, and hardware optimization.</p>
    <a href="#" style="color: #00B5FF; text-decoration: none; font-size: 14px; font-weight: 500;">Read More →</a>
  </div>
  
  <div style="background: white; padding: 24px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h4 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">Software Engineering Advances</h4>
    <p style="margin: 0 0 16px 0; font-size: 14px; color: #666; line-height: 1.6;">Revolutionary approaches to software development, testing, and quality assurance methodologies.</p>
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

export const mockStarterPages: CustomStarterPage[] = [
  catalystGenericHomepage,
  febsHomepage2025
]

