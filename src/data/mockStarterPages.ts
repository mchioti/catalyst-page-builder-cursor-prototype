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

// Legacy Mock Site Homepage - The original blue hero homepage for /v1/mock reference
const legacyMockHomepage: CustomStarterPage = {
  id: 'legacy-mock-homepage',
  name: 'Legacy Mock Homepage',
  description: 'Original homepage with blue hero for legacy mock site reference',
  source: 'mock',
  websiteId: 'catalyst-demo',
  websiteName: 'Catalyst Demo Site',
  createdAt: new Date('2024-01-01'),
  canvasItems: [
    {
      id: "Fi7MxPp8l99GeERG3i2jn",
      name: "Section",
      type: "content-block",
      layout: "flexible",
      areas: [
        {
          id: "8cq2UlSG0ZnSHAmDB04_u",
          name: "Flex Items",
          widgets: [
            {
              id: "RZbfNNxqnYPGnt7xKM4Pv",
              skin: "minimal",
              type: "image",
              src: "https://febs.onlinelibrary.wiley.com/pb-assets/tmp-images/footer-logo-wiley-1510029248417.png",
              alt: "Image description",
              ratio: "auto",
              caption: "",
              link: "",
              alignment: "center",
              width: "full",
              objectFit: "cover",
              sectionId: "Fi7MxPp8l99GeERG3i2jn"
            },
            {
              id: "b24FkFVm_7rqyR2PojjYA",
              skin: "minimal",
              type: "spacer",
              height: "2rem",
              sectionId: "Fi7MxPp8l99GeERG3i2jn",
              flexProperties: {
                grow: true
              }
            },
            {
              id: "AjnlphTHl0aeubF7CfseM",
              skin: "minimal",
              type: "button",
              text: "Search",
              variant: "primary",
              size: "medium",
              href: "#",
              sectionId: "Fi7MxPp8l99GeERG3i2jn",
              style: "link"
            },
            {
              id: "V2ZtiucPb1giqvHI6nqB1",
              skin: "minimal",
              type: "button",
              text: "Advanced Search",
              variant: "primary",
              size: "medium",
              href: "#",
              sectionId: "Fi7MxPp8l99GeERG3i2jn",
              style: "link"
            }
          ]
        }
      ],
      flexConfig: {
        direction: "row",
        wrap: true,
        justifyContent: "flex-start",
        gap: "1rem"
      },
      background: {
        type: "color",
        color: "#000000"
      },
      contentMode: "light"
    },
    {
      id: "kiemJ6oV3wXszZ8J-absq",
      name: "Section",
      type: "content-block",
      layout: "flexible",
      areas: [
        {
          id: "1v93yPzrKb6vHN3HBuCmq",
          name: "Flex Items",
          widgets: [
            {
              id: "btiuDbT6i6DZzC06nMJAo",
              skin: "minimal",
              type: "text",
              text: "brought to you by Atypon",
              align: "left",
              sectionId: "kiemJ6oV3wXszZ8J-absq"
            },
            {
              id: "qbzrHKEhRqYXHLq9y2hrv",
              skin: "minimal",
              type: "menu",
              menuType: "global",
              style: "horizontal",
              items: [
                {
                  id: "CQVyEJ3RC_QL3U64UaG9L",
                  label: "Journals",
                  url: "#",
                  target: "_self",
                  displayCondition: "always",
                  order: 0
                },
                {
                  id: "cVDdVG3OgQCZ5DCpBZUcH",
                  label: "Books",
                  url: "#",
                  target: "_self",
                  displayCondition: "always",
                  order: 1
                },
                {
                  id: "fsJ4evoEUzFJZ1L_EW03A",
                  label: "Processings",
                  url: "#",
                  target: "_self",
                  displayCondition: "always",
                  order: 2
                },
                {
                  id: "gvXdhKHzQH65NAcWg-CGb",
                  label: "Blogs",
                  url: "#",
                  target: "_self",
                  displayCondition: "always",
                  order: 3,
                  isContextGenerated: false
                }
              ],
              sectionId: "kiemJ6oV3wXszZ8J-absq",
              flexProperties: {
                grow: true
              },
              align: "right"
            }
          ]
        }
      ],
      flexConfig: {
        direction: "row",
        wrap: true,
        justifyContent: "flex-start",
        gap: "1rem"
      },
      background: {
        type: "color",
        color: "#ffffff"
      }
    },
    {
      id: "g8SEFXd4amHMYPiY_VZhl",
      name: "Hero Section",
      type: "hero",
      layout: "hero-with-buttons",
      areas: [
        {
          id: "sTCuYIwAViego7x7SG18Z",
          name: "Hero Content",
          widgets: [
            {
              id: "TkgFoj1-rfS1Ny3xVN3CS",
              type: "heading",
              sectionId: "g8SEFXd4amHMYPiY_VZhl",
              skin: "minimal",
              text: "Catalyst demo site",
              level: 1,
              align: "center",
              style: "hero",
              color: "primary",
              size: "auto",
              icon: {
                enabled: false,
                position: "left",
                emoji: "🚀"
              }
            },
            {
              id: "OAUnpiK-ZYb5zSc8CNg30",
              type: "text",
              sectionId: "g8SEFXd4amHMYPiY_VZhl",
              skin: "minimal",
              text: "Catalyst is the name of the PB4 POVie. this prototype. This is a Hero prefab section that comes as part of the default imaginary Classic-themed Homepage template design.",
              align: "center"
            }
          ]
        },
        {
          id: "3TY8nmvzDL8v5fdR97ZG3",
          name: "Button Row",
          widgets: [
            {
              id: "NnnXI_a4kbrZdeDAFlicp",
              type: "button",
              sectionId: "g8SEFXd4amHMYPiY_VZhl",
              skin: "minimal",
              text: "Get Started",
              href: "#",
              variant: "primary",
              size: "large"
            },
            {
              id: "DtBy-BQR4wX4t2VaTYv5q",
              type: "button",
              sectionId: "g8SEFXd4amHMYPiY_VZhl",
              skin: "minimal",
              text: "Learn More",
              href: "#",
              variant: "secondary",
              size: "large"
            }
          ]
        }
      ],
      background: {
        type: "gradient",
        gradient: {
          type: "linear",
          direction: "to bottom",
          stops: [
            {
              color: "#1e40af",
              position: "0%"
            },
            {
              color: "#3b82f6",
              position: "100%"
            }
          ]
        },
        opacity: 1
      },
      styling: {
        paddingTop: "large",
        paddingBottom: "large",
        paddingLeft: "medium",
        paddingRight: "medium",
        gap: "medium",
        variant: "full-width",
        textColor: "white"
      }
    },
    {
      id: "iYNYwK2h7mNDSwqE3O1Rb",
      name: "Featured Research Section",
      type: "content-block",
      layout: "header-plus-grid",
      areas: [
        {
          id: "3wW8HnnGAVDm53nUv1jfa",
          name: "Header",
          widgets: [
            {
              id: "1cMneRTh9j627w6hQDTGF",
              type: "heading",
              sectionId: "iYNYwK2h7mNDSwqE3O1Rb",
              skin: "minimal",
              text: "Featured Content",
              level: 2,
              align: "center",
              style: "default",
              color: "default",
              size: "large",
              icon: {
                enabled: false,
                position: "left",
                emoji: "📚"
              }
            }
          ]
        },
        {
          id: "oJvvUBwefhdCUiafUVtWx",
          name: "Left Card",
          widgets: [
            {
              id: "0cXOoK3bRI_Mi1_SQ8fcu",
              type: "text",
              sectionId: "iYNYwK2h7mNDSwqE3O1Rb",
              skin: "minimal",
              text: "Latest in AI & Machine Learning\n\nCutting-edge research in artificial intelligence, neural networks, and computational learning theory.\n\nExplore Articles →",
              align: "left",
              layout: {
                variant: "card",
                padding: "large",
                shadow: "medium",
                rounded: "medium"
              }
            }
          ]
        },
        {
          id: "SnOZ69iP8wz3rEzpsDmMM",
          name: "Center Card",
          widgets: [
            {
              id: "OTuqsdxVkZBkZmjN3YnAY",
              type: "text",
              sectionId: "iYNYwK2h7mNDSwqE3O1Rb",
              skin: "minimal",
              text: "Computer Systems & Architecture\n\nBreakthrough discoveries in distributed systems, cloud computing, and hardware optimization.\n\nRead More →",
              align: "left",
              layout: {
                variant: "card",
                padding: "large",
                shadow: "medium",
                rounded: "medium"
              }
            }
          ]
        },
        {
          id: "6_qEURW8Zr5lGAnP0W0WW",
          name: "Right Card",
          widgets: [
            {
              id: "6FT8uwXMfloRQkmjUWfVL",
              type: "text",
              sectionId: "iYNYwK2h7mNDSwqE3O1Rb",
              skin: "minimal",
              text: "Software Engineering Advances\n\nRevolutionary approaches to software development, testing, and quality assurance methodologies.\n\nView Research →",
              align: "left",
              layout: {
                variant: "card",
                padding: "large",
                shadow: "medium",
                rounded: "medium"
              }
            }
          ]
        }
      ],
      background: {
        type: "color",
        color: "#f8fafc",
        opacity: 1
      },
      styling: {
        paddingTop: "large",
        paddingBottom: "large",
        paddingLeft: "medium",
        paddingRight: "medium",
        gap: "medium",
        variant: "full-width",
        textColor: "default"
      }
    }
  ]
}

// Wiley Online Library Global Landing Page - Full 8-Section Version
// Transformed from Claude's JSON to work with our architecture (areas don't have layouts)
// Note: Using 'as any[]' to bypass strict typing for mock data - runtime handles partial configs
const wileyOnlineLibraryLanding: CustomStarterPage = {
  id: 'wiley-online-library-landing',
  name: 'Wiley Online Library Landing',
  description: 'Full WOL landing page: Hero, Subjects (8 cards), Featured Articles, Stats, Open Access, Quick Links, Newsletter, Footer',
  source: 'mock',
  websiteId: 'wiley-ds',
  websiteName: 'Wiley Design System',
  createdAt: new Date('2024-12-09'),
  canvasItems: [
    // ==================== SECTION 1: HERO ====================
    {
      id: nanoid(),
      name: 'Hero Banner',
      type: 'hero',
      layout: 'one-column',
      background: {
        type: 'gradient',
        gradient: {
          type: 'linear',
          direction: '135deg',
          stops: [
            { color: '#003b44', position: '0%' },
            { color: '#006573', position: '50%' },
            { color: '#007a8b', position: '100%' }
          ]
        }
      },
      contentMode: 'dark',
      styling: {
        paddingTop: '120px',
        paddingBottom: '120px',
        minHeight: '90vh',
        textColor: 'white',
        centerContent: true,
        maxWidth: '6xl'
      },
      areas: [{
        id: nanoid(),
        name: 'Hero Content',
        widgets: [
          { id: nanoid(), type: 'text', text: '🟢 Trusted by 15,000+ Institutions', align: 'center', typographyStyle: 'body-sm', skin: 'minimal' },
          { id: nanoid(), type: 'spacer', height: '1.5rem', skin: 'minimal' },
          { id: nanoid(), type: 'heading', text: 'Discover Research That Matters', level: 1, align: 'center', style: 'hero', size: 'auto', skin: 'minimal' },
          { id: nanoid(), type: 'spacer', height: '1.5rem', skin: 'minimal' },
          { id: nanoid(), type: 'text', text: 'Access millions of peer-reviewed articles, books, and protocols from the world\'s leading researchers across every discipline.', align: 'center', typographyStyle: 'body-xl', skin: 'minimal' },
          { id: nanoid(), type: 'spacer', height: '2rem', skin: 'minimal' },
          { id: nanoid(), type: 'button', text: 'EXPLORE JOURNALS', href: '/journals', style: 'solid', color: 'color1', size: 'large', align: 'center', skin: 'minimal' },
          { id: nanoid(), type: 'button', text: 'FOR INSTITUTIONS', href: '/institutions', style: 'outline', color: 'color5', size: 'large', align: 'center', skin: 'minimal' },
          { id: nanoid(), type: 'spacer', height: '3rem', skin: 'minimal' },
          { id: nanoid(), type: 'text', text: '<div style="display: flex; justify-content: center; gap: 4rem; flex-wrap: wrap;"><div style="text-align: center;"><strong style="font-size: 2.5rem; display: block;">6M+</strong><span style="opacity: 0.7;">Articles</span></div><div style="text-align: center;"><strong style="font-size: 2.5rem; display: block;">1,600+</strong><span style="opacity: 0.7;">Journals</span></div><div style="text-align: center;"><strong style="font-size: 2.5rem; display: block;">22K+</strong><span style="opacity: 0.7;">Books</span></div></div>', align: 'center', skin: 'minimal' }
        ]
      }]
    },

    // ==================== SECTION 2: BROWSE BY SUBJECT - HEADER ====================
    {
      id: nanoid(),
      name: 'Browse by Subject - Header',
      type: 'content-block',
      layout: 'one-column',
      background: { type: 'color', color: '#ffffff' },
      contentMode: 'light',
      styling: { paddingTop: '80px', paddingBottom: '24px', maxWidth: '7xl', centerContent: true },
      areas: [{
        id: nanoid(),
        name: 'Header',
        widgets: [
          { id: nanoid(), type: 'text', text: 'Browse by Subject', align: 'center', typographyStyle: 'body-sm', inlineStyles: 'text-transform: uppercase; letter-spacing: 0.1em; color: #00bfb1; font-weight: 600;', skin: 'minimal' },
          { id: nanoid(), type: 'heading', text: 'Explore Every Discipline', level: 2, align: 'center', style: 'default', size: 'auto', skin: 'minimal' },
          { id: nanoid(), type: 'text', text: 'Discover content across all major research areas, from life sciences and medicine to humanities.', align: 'center', typographyStyle: 'body-lg', skin: 'minimal' }
        ]
      }]
    },

    // ==================== SECTION 2B: BROWSE BY SUBJECT - GRID (8 cards) ====================
    {
      id: nanoid(),
      name: 'Browse by Subject - Cards',
      type: 'content-block',
      layout: 'grid',
      gridConfig: { columns: 4, gap: '1.25rem', alignItems: 'stretch' },
      background: { type: 'color', color: '#ffffff' },
      contentMode: 'light',
      styling: { paddingTop: '0', paddingBottom: '80px', maxWidth: '7xl', centerContent: true },
      areas: [{
        id: nanoid(),
        name: 'Subject Cards',
        widgets: [
          { id: nanoid(), type: 'editorial-card', layout: 'color-block', content: { preheader: { enabled: false }, headline: { enabled: true, text: 'Life Sciences' }, description: { enabled: true, text: '450+ Journals' }, callToAction: { enabled: true, text: 'Explore', url: '/subjects/life-sciences', type: 'link' } }, image: { src: 'https://picsum.photos/seed/lifesci/200/200', alt: 'Life Sciences' }, config: { contentAlignment: 'center', imagePosition: 'top', useAccentColor: true }, skin: 'modern' },
          { id: nanoid(), type: 'editorial-card', layout: 'color-block', content: { preheader: { enabled: false }, headline: { enabled: true, text: 'Physical Sciences' }, description: { enabled: true, text: '380+ Journals' }, callToAction: { enabled: true, text: 'Explore', url: '/subjects/physical-sciences', type: 'link' } }, image: { src: 'https://picsum.photos/seed/physics/200/200', alt: 'Physical Sciences' }, config: { contentAlignment: 'center', imagePosition: 'top', useAccentColor: true }, skin: 'modern' },
          { id: nanoid(), type: 'editorial-card', layout: 'color-block', content: { preheader: { enabled: false }, headline: { enabled: true, text: 'Health Sciences' }, description: { enabled: true, text: '320+ Journals' }, callToAction: { enabled: true, text: 'Explore', url: '/subjects/health-sciences', type: 'link' } }, image: { src: 'https://picsum.photos/seed/health/200/200', alt: 'Health Sciences' }, config: { contentAlignment: 'center', imagePosition: 'top', useAccentColor: true }, skin: 'modern' },
          { id: nanoid(), type: 'editorial-card', layout: 'color-block', content: { preheader: { enabled: false }, headline: { enabled: true, text: 'Social Sciences' }, description: { enabled: true, text: '280+ Journals' }, callToAction: { enabled: true, text: 'Explore', url: '/subjects/social-sciences', type: 'link' } }, image: { src: 'https://picsum.photos/seed/social/200/200', alt: 'Social Sciences' }, config: { contentAlignment: 'center', imagePosition: 'top', useAccentColor: true }, skin: 'modern' },
          { id: nanoid(), type: 'editorial-card', layout: 'color-block', content: { preheader: { enabled: false }, headline: { enabled: true, text: 'Computer Science' }, description: { enabled: true, text: '150+ Journals' }, callToAction: { enabled: true, text: 'Explore', url: '/subjects/computer-science', type: 'link' } }, image: { src: 'https://picsum.photos/seed/compsci/200/200', alt: 'Computer Science' }, config: { contentAlignment: 'center', imagePosition: 'top', useAccentColor: true }, skin: 'modern' },
          { id: nanoid(), type: 'editorial-card', layout: 'color-block', content: { preheader: { enabled: false }, headline: { enabled: true, text: 'Engineering' }, description: { enabled: true, text: '200+ Journals' }, callToAction: { enabled: true, text: 'Explore', url: '/subjects/engineering', type: 'link' } }, image: { src: 'https://picsum.photos/seed/engineering/200/200', alt: 'Engineering' }, config: { contentAlignment: 'center', imagePosition: 'top', useAccentColor: true }, skin: 'modern' },
          { id: nanoid(), type: 'editorial-card', layout: 'color-block', content: { preheader: { enabled: false }, headline: { enabled: true, text: 'Humanities' }, description: { enabled: true, text: '180+ Journals' }, callToAction: { enabled: true, text: 'Explore', url: '/subjects/humanities', type: 'link' } }, image: { src: 'https://picsum.photos/seed/humanities/200/200', alt: 'Humanities' }, config: { contentAlignment: 'center', imagePosition: 'top', useAccentColor: true }, skin: 'modern' },
          { id: nanoid(), type: 'editorial-card', layout: 'color-block', content: { preheader: { enabled: false }, headline: { enabled: true, text: 'Business' }, description: { enabled: true, text: '160+ Journals' }, callToAction: { enabled: true, text: 'Explore', url: '/subjects/business', type: 'link' } }, image: { src: 'https://picsum.photos/seed/business/200/200', alt: 'Business' }, config: { contentAlignment: 'center', imagePosition: 'top', useAccentColor: true }, skin: 'modern' }
        ]
      }]
    },

    // ==================== SECTION 3: FEATURED ARTICLES - HEADER ====================
    {
      id: nanoid(),
      name: 'Featured Articles - Header',
      type: 'content-block',
      layout: 'two-columns',
      background: { type: 'color', color: '#f2f2eb' },
      contentMode: 'light',
      styling: { paddingTop: '80px', paddingBottom: '24px', maxWidth: '7xl', centerContent: true },
      areas: [
        {
          id: nanoid(),
          name: 'Title',
          widgets: [
            { id: nanoid(), type: 'text', text: 'Latest Research', align: 'left', typographyStyle: 'body-sm', inlineStyles: 'text-transform: uppercase; letter-spacing: 0.1em; color: #00bfb1; font-weight: 600;', skin: 'minimal' },
            { id: nanoid(), type: 'heading', text: 'Featured Articles', level: 2, align: 'left', style: 'default', size: 'auto', skin: 'minimal' }
          ]
        },
        {
          id: nanoid(),
          name: 'CTA',
          widgets: [
            { id: nanoid(), type: 'button', text: 'VIEW ALL', href: '/articles', style: 'outline', color: 'color2', size: 'medium', align: 'right', skin: 'minimal' }
          ]
        }
      ]
    },

    // ==================== SECTION 3B: FEATURED ARTICLES - TABS ====================
    {
      id: nanoid(),
      name: 'Featured Articles - Tabs',
      type: 'content-block',
      layout: 'one-column',
      background: { type: 'color', color: '#f2f2eb' },
      contentMode: 'light',
      styling: { paddingTop: '0', paddingBottom: '24px', maxWidth: '7xl', centerContent: true },
      areas: [{
        id: nanoid(),
        name: 'Tabs',
        widgets: [
          { id: nanoid(), type: 'tabs', activeTabIndex: 0, tabStyle: 'underline', align: 'left', skin: 'minimal', tabs: [
            { id: nanoid(), label: 'Most Read', widgets: [] },
            { id: nanoid(), label: 'Most Cited', widgets: [] },
            { id: nanoid(), label: 'Recent', widgets: [] },
            { id: nanoid(), label: 'Open Access', widgets: [] }
          ]}
        ]
      }]
    },

    // ==================== SECTION 3C: FEATURED ARTICLES - GRID ====================
    {
      id: nanoid(),
      name: 'Featured Articles - Cards',
      type: 'content-block',
      layout: 'grid',
      gridConfig: { columns: 3, gap: '1.5rem', alignItems: 'stretch' },
      background: { type: 'color', color: '#f2f2eb' },
      contentMode: 'light',
      styling: { paddingTop: '0', paddingBottom: '80px', maxWidth: '7xl', centerContent: true },
      areas: [{
        id: nanoid(),
        name: 'Article Cards',
        widgets: [
          { id: nanoid(), type: 'publication-details', contentSource: 'schema-objects', layout: 'default', skin: 'modern', publication: { title: 'CRISPR-Cas9 Advances in Gene Therapy', abstract: 'Recent developments in CRISPR technology have opened new avenues for treating genetic disorders.', authors: [{ name: 'Cell Biology Research Team' }], publicationDate: '2024-12', doi: '10.1002/example.001', accessStatus: 'open-access', contentType: 'research-article', thumbnail: 'https://picsum.photos/seed/crispr/400/300', metrics: { views: 12400 } }, cardConfig: { showContentTypeLabel: true, showTitle: true, showThumbnail: true, thumbnailPosition: 'top', showAuthors: false, showAbstract: true, abstractLength: 'short', showPublicationDate: true, showAccessStatus: true, showUsageMetrics: true, titleStyle: 'medium' } },
          { id: nanoid(), type: 'publication-details', contentSource: 'schema-objects', layout: 'default', skin: 'modern', publication: { title: 'Global Carbon Cycling Under Climate Change', abstract: 'An analysis of terrestrial and oceanic carbon sinks and their response to anthropogenic warming.', authors: [{ name: 'Climate Science Group' }], publicationDate: '2024-11', doi: '10.1002/example.002', contentType: 'research-article', thumbnail: 'https://picsum.photos/seed/climate/400/300', metrics: { views: 8700 } }, cardConfig: { showContentTypeLabel: true, showTitle: true, showThumbnail: true, thumbnailPosition: 'top', showAuthors: false, showAbstract: true, abstractLength: 'short', showPublicationDate: true, showAccessStatus: false, showUsageMetrics: true, titleStyle: 'medium' } },
          { id: nanoid(), type: 'publication-details', contentSource: 'schema-objects', layout: 'default', skin: 'modern', publication: { title: 'Transformer Architectures for Scientific Discovery', abstract: 'How large language models are accelerating scientific research across multiple disciplines.', authors: [{ name: 'AI Research Team' }], publicationDate: '2024-12', doi: '10.1002/example.003', contentType: 'research-article', thumbnail: 'https://picsum.photos/seed/ai/400/300', metrics: { views: 15200 } }, cardConfig: { showContentTypeLabel: true, showTitle: true, showThumbnail: true, thumbnailPosition: 'top', showAuthors: false, showAbstract: true, abstractLength: 'short', showPublicationDate: true, showAccessStatus: false, showUsageMetrics: true, titleStyle: 'medium' } }
        ]
      }]
    },

    // ==================== SECTION 4: IMPACT STATISTICS - HEADER ====================
    {
      id: nanoid(),
      name: 'Impact Statistics - Header',
      type: 'content-block',
      layout: 'one-column',
      background: { type: 'gradient', gradient: { type: 'linear', direction: '135deg', stops: [{ color: '#003b44', position: '0%' }, { color: '#00505c', position: '100%' }] } },
      contentMode: 'dark',
      styling: { paddingTop: '80px', paddingBottom: '24px', maxWidth: '7xl', centerContent: true, textColor: 'white' },
      areas: [{
        id: nanoid(),
        name: 'Header',
        widgets: [
          { id: nanoid(), type: 'text', text: 'Our Impact', align: 'center', typographyStyle: 'body-sm', inlineStyles: 'text-transform: uppercase; letter-spacing: 0.1em; color: #00bfb1; font-weight: 600;', skin: 'minimal' },
          { id: nanoid(), type: 'heading', text: 'Advancing Research Worldwide', level: 2, align: 'center', style: 'default', size: 'auto', skin: 'minimal' },
          { id: nanoid(), type: 'text', text: 'Trusted by leading institutions and researchers across the globe for over 200 years.', align: 'center', typographyStyle: 'body-lg', skin: 'minimal' }
        ]
      }]
    },

    // ==================== SECTION 4B: IMPACT STATISTICS - GRID ====================
    {
      id: nanoid(),
      name: 'Impact Statistics - Cards',
      type: 'content-block',
      layout: 'grid',
      gridConfig: { columns: 4, gap: '1.5rem', alignItems: 'stretch' },
      background: { type: 'gradient', gradient: { type: 'linear', direction: '135deg', stops: [{ color: '#003b44', position: '0%' }, { color: '#00505c', position: '100%' }] } },
      contentMode: 'dark',
      styling: { paddingTop: '24px', paddingBottom: '80px', maxWidth: '7xl', centerContent: true, textColor: 'white' },
      areas: [{
        id: nanoid(),
        name: 'Stats Cards',
        widgets: [
          { id: nanoid(), type: 'editorial-card', layout: 'color-block', content: { preheader: { enabled: false }, headline: { enabled: true, text: '200M+' }, description: { enabled: true, text: 'Annual Downloads' }, callToAction: { enabled: false } }, image: { src: 'https://picsum.photos/seed/downloads/100/100', alt: 'Downloads' }, config: { contentAlignment: 'center', imagePosition: 'top' }, skin: 'dark' },
          { id: nanoid(), type: 'editorial-card', layout: 'color-block', content: { preheader: { enabled: false }, headline: { enabled: true, text: '15K+' }, description: { enabled: true, text: 'Institutions' }, callToAction: { enabled: false } }, image: { src: 'https://picsum.photos/seed/institutions/100/100', alt: 'Institutions' }, config: { contentAlignment: 'center', imagePosition: 'top' }, skin: 'dark' },
          { id: nanoid(), type: 'editorial-card', layout: 'color-block', content: { preheader: { enabled: false }, headline: { enabled: true, text: '500K+' }, description: { enabled: true, text: 'Authors' }, callToAction: { enabled: false } }, image: { src: 'https://picsum.photos/seed/authors/100/100', alt: 'Authors' }, config: { contentAlignment: 'center', imagePosition: 'top' }, skin: 'dark' },
          { id: nanoid(), type: 'editorial-card', layout: 'color-block', content: { preheader: { enabled: false }, headline: { enabled: true, text: '85%' }, description: { enabled: true, text: 'Top Ranked' }, callToAction: { enabled: false } }, image: { src: 'https://picsum.photos/seed/ranked/100/100', alt: 'Ranked' }, config: { contentAlignment: 'center', imagePosition: 'top' }, skin: 'dark' }
        ]
      }]
    },

    // ==================== SECTION 5: OPEN ACCESS ====================
    {
      id: nanoid(),
      name: 'Open Access',
      type: 'content-block',
      layout: 'two-columns',
      background: { type: 'color', color: '#ffffff' },
      contentMode: 'light',
      styling: { paddingTop: '80px', paddingBottom: '80px', maxWidth: '7xl', centerContent: true, gap: '64px' },
      areas: [
        {
          id: nanoid(),
          name: 'Media',
          widgets: [
            { id: nanoid(), type: 'image', src: 'https://picsum.photos/seed/openaccess/800/600', alt: 'Open Access Research', ratio: '4:3', width: 'full', objectFit: 'cover', skin: 'minimal' }
          ]
        },
        {
          id: nanoid(),
          name: 'Content',
          widgets: [
            { id: nanoid(), type: 'text', text: 'Open Access', align: 'left', typographyStyle: 'body-sm', inlineStyles: 'text-transform: uppercase; letter-spacing: 0.1em; color: #00bfb1; font-weight: 600;', skin: 'minimal' },
            { id: nanoid(), type: 'heading', text: 'Make Your Research Freely Available', level: 2, align: 'left', style: 'default', size: 'auto', skin: 'minimal' },
            { id: nanoid(), type: 'text', text: 'Open Access publishing ensures your work reaches the widest possible audience, increasing citations and accelerating scientific discovery.', align: 'left', typographyStyle: 'body-lg', skin: 'minimal' },
            { id: nanoid(), type: 'spacer', height: '1.5rem', skin: 'minimal' },
            { id: nanoid(), type: 'text', text: '✓ Immediate, unrestricted access to your research<br>✓ CC-BY licensing for maximum reuse<br>✓ Compliant with funder mandates<br>✓ 1,000+ institutional agreements', align: 'left', typographyStyle: 'body-md', skin: 'minimal' },
            { id: nanoid(), type: 'spacer', height: '2rem', skin: 'minimal' },
            { id: nanoid(), type: 'button', text: 'LEARN MORE', href: '/open-access', style: 'solid', color: 'color1', size: 'medium', skin: 'minimal' },
            { id: nanoid(), type: 'button', text: 'CHECK ELIGIBILITY', href: '/open-access/eligibility', style: 'outline', color: 'color2', size: 'medium', skin: 'minimal' }
          ]
        }
      ]
    },

    // ==================== SECTION 6: QUICK LINKS - HEADER ====================
    {
      id: nanoid(),
      name: 'Quick Links - Header',
      type: 'content-block',
      layout: 'one-column',
      background: { type: 'color', color: '#e3ebe8' },
      contentMode: 'light',
      styling: { paddingTop: '80px', paddingBottom: '24px', maxWidth: '7xl', centerContent: true },
      areas: [{
        id: nanoid(),
        name: 'Header',
        widgets: [
          { id: nanoid(), type: 'text', text: 'Resources', align: 'center', typographyStyle: 'body-sm', inlineStyles: 'text-transform: uppercase; letter-spacing: 0.1em; color: #00bfb1; font-weight: 600;', skin: 'minimal' },
          { id: nanoid(), type: 'heading', text: 'Quick Links for Researchers', level: 2, align: 'center', style: 'default', size: 'auto', skin: 'minimal' }
        ]
      }]
    },

    // ==================== SECTION 6B: QUICK LINKS - GRID ====================
    {
      id: nanoid(),
      name: 'Quick Links - Cards',
      type: 'content-block',
      layout: 'grid',
      gridConfig: { columns: 4, gap: '1.25rem', alignItems: 'stretch' },
      background: { type: 'color', color: '#e3ebe8' },
      contentMode: 'light',
      styling: { paddingTop: '0', paddingBottom: '80px', maxWidth: '7xl', centerContent: true },
      areas: [{
        id: nanoid(),
        name: 'Link Cards',
        widgets: [
          { id: nanoid(), type: 'editorial-card', layout: 'split', content: { preheader: { enabled: false }, headline: { enabled: true, text: 'Submit a Manuscript' }, description: { enabled: false }, callToAction: { enabled: true, text: 'Submit', url: '/authors/submit', type: 'link' } }, image: { src: 'https://picsum.photos/seed/submit/100/100', alt: 'Submit' }, config: { contentAlignment: 'left', imagePosition: 'left' }, skin: 'minimal' },
          { id: nanoid(), type: 'editorial-card', layout: 'split', content: { preheader: { enabled: false }, headline: { enabled: true, text: 'Author Guidelines' }, description: { enabled: false }, callToAction: { enabled: true, text: 'View', url: '/authors/guidelines', type: 'link' } }, image: { src: 'https://picsum.photos/seed/guidelines/100/100', alt: 'Guidelines' }, config: { contentAlignment: 'left', imagePosition: 'left' }, skin: 'minimal' },
          { id: nanoid(), type: 'editorial-card', layout: 'split', content: { preheader: { enabled: false }, headline: { enabled: true, text: 'Institutional Access' }, description: { enabled: false }, callToAction: { enabled: true, text: 'Check', url: '/institutions/access', type: 'link' } }, image: { src: 'https://picsum.photos/seed/institution/100/100', alt: 'Institution' }, config: { contentAlignment: 'left', imagePosition: 'left' }, skin: 'minimal' },
          { id: nanoid(), type: 'editorial-card', layout: 'split', content: { preheader: { enabled: false }, headline: { enabled: true, text: 'Help & Support' }, description: { enabled: false }, callToAction: { enabled: true, text: 'Get Help', url: '/support', type: 'link' } }, image: { src: 'https://picsum.photos/seed/help/100/100', alt: 'Help' }, config: { contentAlignment: 'left', imagePosition: 'left' }, skin: 'minimal' }
        ]
      }]
    },

    // ==================== SECTION 7: NEWSLETTER ====================
    {
      id: nanoid(),
      name: 'Newsletter Signup',
      type: 'content-block',
      layout: 'flexible',
      flexConfig: { direction: 'row', wrap: true, justifyContent: 'space-between', gap: '2rem' },
      background: { type: 'gradient', gradient: { type: 'linear', direction: '135deg', stops: [{ color: '#003b44', position: '0%' }, { color: '#006573', position: '100%' }] } },
      contentMode: 'dark',
      styling: { paddingTop: '64px', paddingBottom: '64px', maxWidth: '4xl', centerContent: true, textColor: 'white' },
      areas: [{
        id: nanoid(),
        name: 'Newsletter Content',
        widgets: [
          { id: nanoid(), type: 'text', text: '<strong style="font-size: 24px; display: block; margin-bottom: 8px;">Stay Ahead with Latest Research</strong><span style="opacity: 0.8;">Get weekly updates on trending articles and announcements.</span>', align: 'left', skin: 'minimal' },
          { id: nanoid(), type: 'button', text: 'SUBSCRIBE', href: '/newsletter/subscribe', style: 'solid', color: 'color1', size: 'large', skin: 'minimal' }
        ]
      }]
    },

    // ==================== SECTION 8: FOOTER - LINKS GRID ====================
    {
      id: nanoid(),
      name: 'Footer - Links',
      type: 'content-block',
      layout: 'grid',
      gridConfig: { columns: 5, gap: '2rem', alignItems: 'start' },
      background: { type: 'color', color: '#003b44' },
      contentMode: 'dark',
      styling: { paddingTop: '64px', paddingBottom: '24px', maxWidth: '7xl', centerContent: true, textColor: 'white' },
      areas: [{
        id: nanoid(),
        name: 'Footer Links',
        widgets: [
          { id: nanoid(), type: 'text', text: '<strong style="font-size: 24px; display: block; margin-bottom: 16px;">WILEY</strong><span style="opacity: 0.6; font-size: 14px; line-height: 1.6;">Wiley Online Library is one of the world\'s most extensive multidisciplinary collections of online resources.</span>', align: 'left', skin: 'minimal' },
          { id: nanoid(), type: 'menu', menuType: 'custom', style: 'vertical', align: 'left', skin: 'minimal', items: [{ id: nanoid(), label: 'Resources', url: '#', displayCondition: 'always' as const, target: '_self' as const }, { id: nanoid(), label: 'Author Resources', url: '/authors', displayCondition: 'always' as const, target: '_self' as const }, { id: nanoid(), label: 'Reviewer Resources', url: '/reviewers', displayCondition: 'always' as const, target: '_self' as const }, { id: nanoid(), label: 'Librarian Resources', url: '/librarians', displayCondition: 'always' as const, target: '_self' as const }, { id: nanoid(), label: 'Open Access', url: '/open-access', displayCondition: 'always' as const, target: '_self' as const }] },
          { id: nanoid(), type: 'menu', menuType: 'custom', style: 'vertical', align: 'left', skin: 'minimal', items: [{ id: nanoid(), label: 'About', url: '#', displayCondition: 'always' as const, target: '_self' as const }, { id: nanoid(), label: 'About Wiley', url: '/about', displayCondition: 'always' as const, target: '_self' as const }, { id: nanoid(), label: 'Press Releases', url: '/press', displayCondition: 'always' as const, target: '_self' as const }, { id: nanoid(), label: 'Careers', url: '/careers', displayCondition: 'always' as const, target: '_self' as const }, { id: nanoid(), label: 'Contact Us', url: '/contact', displayCondition: 'always' as const, target: '_self' as const }] },
          { id: nanoid(), type: 'menu', menuType: 'custom', style: 'vertical', align: 'left', skin: 'minimal', items: [{ id: nanoid(), label: 'Help', url: '#', displayCondition: 'always' as const, target: '_self' as const }, { id: nanoid(), label: 'Support Center', url: '/support', displayCondition: 'always' as const, target: '_self' as const }, { id: nanoid(), label: 'Getting Started', url: '/getting-started', displayCondition: 'always' as const, target: '_self' as const }, { id: nanoid(), label: 'Technical Support', url: '/technical-support', displayCondition: 'always' as const, target: '_self' as const }, { id: nanoid(), label: 'FAQs', url: '/faqs', displayCondition: 'always' as const, target: '_self' as const }] },
          { id: nanoid(), type: 'text', text: '<strong style="display: block; margin-bottom: 16px;">Connect</strong><span style="opacity: 0.6;">Follow us on social media</span>', align: 'left', skin: 'minimal' }
        ]
      }]
    },

    // ==================== SECTION 8B: FOOTER - BOTTOM ====================
    {
      id: nanoid(),
      name: 'Footer - Bottom',
      type: 'content-block',
      layout: 'two-columns',
      background: { type: 'color', color: '#003b44' },
      contentMode: 'dark',
      styling: { paddingTop: '0', paddingBottom: '32px', maxWidth: '7xl', centerContent: true, textColor: 'white' },
      areas: [
        {
          id: nanoid(),
          name: 'Copyright',
          widgets: [
            { id: nanoid(), type: 'divider', style: 'solid', thickness: '1px', color: 'rgba(255,255,255,0.1)', marginTop: '0', marginBottom: '1.5rem', skin: 'minimal' },
            { id: nanoid(), type: 'text', text: '© 2000-2024 John Wiley & Sons, Inc.', align: 'left', typographyStyle: 'body-sm', inlineStyles: 'opacity: 0.6;', skin: 'minimal' }
          ]
        },
        {
          id: nanoid(),
          name: 'Legal Links',
          widgets: [
            { id: nanoid(), type: 'spacer', height: '2.5rem', skin: 'minimal' },
            { id: nanoid(), type: 'menu', menuType: 'custom', style: 'horizontal', align: 'right', skin: 'minimal', items: [{ id: nanoid(), label: 'Privacy', url: '/privacy', displayCondition: 'always' as const, target: '_self' as const }, { id: nanoid(), label: 'Terms', url: '/terms', displayCondition: 'always' as const, target: '_self' as const }, { id: nanoid(), label: 'Cookies', url: '/cookies', displayCondition: 'always' as const, target: '_self' as const }, { id: nanoid(), label: 'Accessibility', url: '/accessibility', displayCondition: 'always' as const, target: '_self' as const }] }
          ]
        }
      ]
    }
  ] as any[]
}

// Claude's WOL Landing Page V2 - Created by Claude following the Skills doc instructions
const wolLandingClaudeV2: CustomStarterPage = {
  id: 'wol-landing-claude-v2',
  name: 'WOL Landing (Claude V2)',
  description: 'Claude-generated WOL landing page following Page Builder Skills doc. Uses editorial-cards, menus, gradients.',
  source: 'mock',
  websiteId: 'wiley-ds',
  websiteName: 'Wiley Design System',
  createdAt: new Date('2024-12-10'),
  canvasItems: [
    {
      "id": "hero-section",
      "name": "Hero Banner",
      "type": "hero",
      "layout": "one-column",
      "background": {
        "type": "gradient",
        "gradient": {
          "type": "linear",
          "direction": "135deg",
          "stops": [
            { "color": "#003b44", "position": "0%" },
            { "color": "#007a8b", "position": "100%" }
          ]
        }
      },
      "contentMode": "dark",
      "styling": {
        "paddingTop": "96px",
        "paddingBottom": "96px",
        "centerContent": true
      },
      "areas": [
        {
          "id": "hero-content",
          "name": "Content",
          "widgets": [
            { "id": "hero-badge", "type": "text", "skin": "minimal", "text": "Over 8 million articles available", "align": "center", "typographyStyle": "body-sm", "inlineStyles": "display: inline-block; background: rgba(255,255,255,0.1); padding: 8px 16px; border-radius: 9999px; border: 1px solid rgba(255,255,255,0.2);" },
            { "id": "hero-spacer-1", "type": "spacer", "skin": "minimal", "height": "1.5rem" },
            { "id": "hero-heading", "type": "heading", "skin": "minimal", "text": "Discover the World's Research", "level": 1, "style": "hero", "align": "center" },
            { "id": "hero-spacer-2", "type": "spacer", "skin": "minimal", "height": "1.5rem" },
            { "id": "hero-description", "type": "text", "skin": "minimal", "text": "Access peer-reviewed journals, books, and reference works across science, technology, medicine, and social sciences from Wiley's trusted publishing portfolio.", "align": "center", "typographyStyle": "body-lg" },
            { "id": "hero-spacer-3", "type": "spacer", "skin": "minimal", "height": "2rem" },
            { "id": "hero-cta-primary", "type": "button", "skin": "minimal", "text": "Browse Journals", "href": "/journals", "style": "solid", "color": "color1", "size": "large", "align": "center" },
            { "id": "hero-spacer-4", "type": "spacer", "skin": "minimal", "height": "1rem" },
            { "id": "hero-cta-secondary", "type": "button", "skin": "minimal", "text": "Institutional Access", "href": "/institutional", "style": "outline", "color": "color2", "size": "large", "align": "center" }
          ]
        }
      ]
    },
    {
      "id": "stats-section",
      "name": "Stats",
      "type": "content-block",
      "layout": "grid",
      "gridConfig": { "columns": 4, "gap": "2rem", "alignItems": "center" },
      "background": { "type": "color", "color": "#f8f8f8" },
      "contentMode": "light",
      "styling": { "paddingTop": "48px", "paddingBottom": "48px", "maxWidth": "7xl", "centerContent": true },
      "areas": [
        {
          "id": "stats-content",
          "name": "Stats Grid",
          "widgets": [
            { "id": "stat-1", "type": "text", "skin": "minimal", "text": "<strong style=\"font-size: 32px; color: #003b44;\">1,600+</strong><br><span style=\"color: #525252;\">Peer-reviewed journals</span>", "align": "center" },
            { "id": "stat-2", "type": "text", "skin": "minimal", "text": "<strong style=\"font-size: 32px; color: #003b44;\">8M+</strong><br><span style=\"color: #525252;\">Research articles</span>", "align": "center" },
            { "id": "stat-3", "type": "text", "skin": "minimal", "text": "<strong style=\"font-size: 32px; color: #003b44;\">22,000+</strong><br><span style=\"color: #525252;\">Online books</span>", "align": "center" },
            { "id": "stat-4", "type": "text", "skin": "minimal", "text": "<strong style=\"font-size: 32px; color: #003b44;\">250+</strong><br><span style=\"color: #525252;\">Reference works</span>", "align": "center" }
          ]
        }
      ]
    },
    {
      "id": "featured-header-section",
      "name": "Featured Content Header",
      "type": "content-block",
      "layout": "one-column",
      "background": { "type": "color", "color": "#ffffff" },
      "contentMode": "light",
      "styling": { "paddingTop": "64px", "paddingBottom": "24px", "maxWidth": "7xl", "centerContent": true },
      "areas": [
        {
          "id": "featured-header-content",
          "name": "Header",
          "widgets": [
            { "id": "featured-heading", "type": "heading", "skin": "minimal", "text": "Featured Content", "level": 2, "align": "center", "style": "default" },
            { "id": "featured-spacer", "type": "spacer", "skin": "minimal", "height": "1rem" },
            { "id": "featured-subheading", "type": "text", "skin": "minimal", "text": "Explore the latest research across disciplines from leading journals and reference works.", "align": "center", "typographyStyle": "body-md", "inlineStyles": "color: #525252; max-width: 640px; margin: 0 auto;" }
          ]
        }
      ]
    },
    {
      "id": "featured-grid-section",
      "name": "Featured Content Grid",
      "type": "content-block",
      "layout": "grid",
      "gridConfig": { "columns": 3, "gap": "1.5rem", "alignItems": "stretch" },
      "background": { "type": "color", "color": "#ffffff" },
      "contentMode": "light",
      "styling": { "paddingTop": "0", "paddingBottom": "64px", "maxWidth": "7xl", "centerContent": true },
      "areas": [
        {
          "id": "featured-cards",
          "name": "Cards",
          "widgets": [
            { "id": "card-ai-healthcare", "type": "editorial-card", "skin": "modern", "layout": "color-block", "content": { "preheader": { "enabled": true, "text": "New Research" }, "headline": { "enabled": true, "text": "AI in Healthcare" }, "description": { "enabled": true, "text": "Discover how artificial intelligence is transforming diagnostics, treatment planning, and patient outcomes." }, "callToAction": { "enabled": true, "text": "Explore collection", "url": "/collections/ai-healthcare", "type": "link" } }, "image": { "src": "https://picsum.photos/seed/ai-healthcare/400/300", "alt": "AI in Healthcare" }, "config": { "contentAlignment": "left", "imagePosition": "top", "useAccentColor": false } },
            { "id": "card-climate", "type": "editorial-card", "skin": "modern", "layout": "color-block", "content": { "preheader": { "enabled": true, "text": "Sustainability" }, "headline": { "enabled": true, "text": "Climate Solutions" }, "description": { "enabled": true, "text": "Research advancing our understanding of climate change mitigation and sustainable development." }, "callToAction": { "enabled": true, "text": "Explore collection", "url": "/collections/climate-solutions", "type": "link" } }, "image": { "src": "https://picsum.photos/seed/climate/400/300", "alt": "Climate Solutions" }, "config": { "contentAlignment": "left", "imagePosition": "top", "useAccentColor": false } },
            { "id": "card-gene-therapy", "type": "editorial-card", "skin": "modern", "layout": "color-block", "content": { "preheader": { "enabled": true, "text": "Life Sciences" }, "headline": { "enabled": true, "text": "Gene Therapy Advances" }, "description": { "enabled": true, "text": "Breakthrough research in genetic medicine and its applications for treating inherited diseases." }, "callToAction": { "enabled": true, "text": "Explore collection", "url": "/collections/gene-therapy", "type": "link" } }, "image": { "src": "https://picsum.photos/seed/gene-therapy/400/300", "alt": "Gene Therapy Advances" }, "config": { "contentAlignment": "left", "imagePosition": "top", "useAccentColor": false } }
          ]
        }
      ]
    },
    {
      "id": "subjects-header-section",
      "name": "Subjects Header",
      "type": "content-block",
      "layout": "one-column",
      "background": { "type": "color", "color": "#003b44" },
      "contentMode": "dark",
      "styling": { "paddingTop": "64px", "paddingBottom": "24px", "maxWidth": "7xl", "centerContent": true },
      "areas": [
        {
          "id": "subjects-header-content",
          "name": "Header",
          "widgets": [
            { "id": "subjects-heading", "type": "heading", "skin": "minimal", "text": "Browse by Subject", "level": 2, "align": "center", "style": "default" },
            { "id": "subjects-spacer", "type": "spacer", "skin": "minimal", "height": "1rem" },
            { "id": "subjects-subheading", "type": "text", "skin": "minimal", "text": "Find research in your field from our comprehensive collection of scholarly content.", "align": "center", "typographyStyle": "body-md", "inlineStyles": "opacity: 0.7; max-width: 640px; margin: 0 auto;" }
          ]
        }
      ]
    },
    {
      "id": "subjects-grid-section",
      "name": "Subjects Grid",
      "type": "content-block",
      "layout": "grid",
      "gridConfig": { "columns": 4, "gap": "1.5rem", "alignItems": "stretch" },
      "background": { "type": "color", "color": "#003b44" },
      "contentMode": "dark",
      "styling": { "paddingTop": "0", "paddingBottom": "64px", "maxWidth": "7xl", "centerContent": true },
      "areas": [
        {
          "id": "subjects-cards",
          "name": "Subject Cards",
          "widgets": [
            { "id": "subject-medicine", "type": "text", "skin": "minimal", "text": "<div style=\"background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 20px; text-align: center;\"><div style=\"width: 48px; height: 48px; background: linear-gradient(135deg, #00d875, #33e090); border-radius: 8px; margin: 0 auto 12px; display: flex; align-items: center; justify-content: center;\">❤️</div><strong>Medicine</strong><br><span style=\"font-size: 14px; opacity: 0.6;\">450+ journals</span></div>", "align": "center" },
            { "id": "subject-chemistry", "type": "text", "skin": "minimal", "text": "<div style=\"background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 20px; text-align: center;\"><div style=\"width: 48px; height: 48px; background: linear-gradient(135deg, #00d875, #33e090); border-radius: 8px; margin: 0 auto 12px; display: flex; align-items: center; justify-content: center;\">🧪</div><strong>Chemistry</strong><br><span style=\"font-size: 14px; opacity: 0.6;\">180+ journals</span></div>", "align": "center" },
            { "id": "subject-engineering", "type": "text", "skin": "minimal", "text": "<div style=\"background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 20px; text-align: center;\"><div style=\"width: 48px; height: 48px; background: linear-gradient(135deg, #00d875, #33e090); border-radius: 8px; margin: 0 auto 12px; display: flex; align-items: center; justify-content: center;\">⚙️</div><strong>Engineering</strong><br><span style=\"font-size: 14px; opacity: 0.6;\">220+ journals</span></div>", "align": "center" },
            { "id": "subject-earth", "type": "text", "skin": "minimal", "text": "<div style=\"background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 20px; text-align: center;\"><div style=\"width: 48px; height: 48px; background: linear-gradient(135deg, #00d875, #33e090); border-radius: 8px; margin: 0 auto 12px; display: flex; align-items: center; justify-content: center;\">🌍</div><strong>Earth Sciences</strong><br><span style=\"font-size: 14px; opacity: 0.6;\">95+ journals</span></div>", "align": "center" },
            { "id": "subject-social", "type": "text", "skin": "minimal", "text": "<div style=\"background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 20px; text-align: center;\"><div style=\"width: 48px; height: 48px; background: linear-gradient(135deg, #00d875, #33e090); border-radius: 8px; margin: 0 auto 12px; display: flex; align-items: center; justify-content: center;\">📚</div><strong>Social Sciences</strong><br><span style=\"font-size: 14px; opacity: 0.6;\">310+ journals</span></div>", "align": "center" },
            { "id": "subject-mathematics", "type": "text", "skin": "minimal", "text": "<div style=\"background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 20px; text-align: center;\"><div style=\"width: 48px; height: 48px; background: linear-gradient(135deg, #00d875, #33e090); border-radius: 8px; margin: 0 auto 12px; display: flex; align-items: center; justify-content: center;\">🔢</div><strong>Mathematics</strong><br><span style=\"font-size: 14px; opacity: 0.6;\">85+ journals</span></div>", "align": "center" },
            { "id": "subject-physics", "type": "text", "skin": "minimal", "text": "<div style=\"background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 20px; text-align: center;\"><div style=\"width: 48px; height: 48px; background: linear-gradient(135deg, #00d875, #33e090); border-radius: 8px; margin: 0 auto 12px; display: flex; align-items: center; justify-content: center;\">💡</div><strong>Physics</strong><br><span style=\"font-size: 14px; opacity: 0.6;\">65+ journals</span></div>", "align": "center" },
            { "id": "subject-business", "type": "text", "skin": "minimal", "text": "<div style=\"background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 20px; text-align: center;\"><div style=\"width: 48px; height: 48px; background: linear-gradient(135deg, #00d875, #33e090); border-radius: 8px; margin: 0 auto 12px; display: flex; align-items: center; justify-content: center;\">💰</div><strong>Business</strong><br><span style=\"font-size: 14px; opacity: 0.6;\">195+ journals</span></div>", "align": "center" }
          ]
        }
      ]
    },
    {
      "id": "cta-section",
      "name": "Call to Action",
      "type": "content-block",
      "layout": "one-column",
      "background": { "type": "gradient", "gradient": { "type": "linear", "direction": "135deg", "stops": [{ "color": "#00d875", "position": "0%" }, { "color": "#33e090", "position": "100%" }] } },
      "contentMode": "light",
      "styling": { "paddingTop": "64px", "paddingBottom": "64px", "centerContent": true },
      "areas": [
        {
          "id": "cta-content",
          "name": "CTA Content",
          "widgets": [
            { "id": "cta-heading", "type": "heading", "skin": "minimal", "text": "Ready to accelerate your research?", "level": 2, "align": "center", "style": "default", "color": "default" },
            { "id": "cta-spacer-1", "type": "spacer", "skin": "minimal", "height": "1rem" },
            { "id": "cta-description", "type": "text", "skin": "minimal", "text": "Get instant access to millions of research articles, journals, and books with institutional or personal subscriptions.", "align": "center", "typographyStyle": "body-md", "inlineStyles": "max-width: 640px; margin: 0 auto; color: #004d58;" },
            { "id": "cta-spacer-2", "type": "spacer", "skin": "minimal", "height": "1.5rem" },
            { "id": "cta-button", "type": "button", "skin": "minimal", "text": "Request Access", "href": "/request-access", "style": "solid", "color": "color3", "size": "large", "align": "center" }
          ]
        }
      ]
    },
    {
      "id": "footer-section",
      "name": "Footer",
      "type": "content-block",
      "layout": "grid",
      "gridConfig": { "columns": 4, "gap": "2rem", "alignItems": "start" },
      "background": { "type": "color", "color": "#003b44" },
      "contentMode": "dark",
      "styling": { "paddingTop": "64px", "paddingBottom": "32px", "maxWidth": "7xl", "centerContent": true },
      "areas": [
        {
          "id": "footer-links",
          "name": "Footer Links",
          "widgets": [
            { "id": "footer-col-1-heading", "type": "text", "skin": "minimal", "text": "<strong>Resources</strong>", "align": "left" },
            { "id": "footer-col-1-menu", "type": "menu", "skin": "minimal", "menuType": "custom", "style": "vertical", "align": "left", "items": [{ "id": "menu-journals", "label": "Journals", "url": "/journals", "target": "_self", "displayCondition": "always", "order": 0 }, { "id": "menu-books", "label": "Books", "url": "/books", "target": "_self", "displayCondition": "always", "order": 1 }, { "id": "menu-databases", "label": "Databases", "url": "/databases", "target": "_self", "displayCondition": "always", "order": 2 }, { "id": "menu-subjects", "label": "Subjects", "url": "/subjects", "target": "_self", "displayCondition": "always", "order": 3 }] },
            { "id": "footer-col-2-heading", "type": "text", "skin": "minimal", "text": "<strong>Solutions</strong>", "align": "left" },
            { "id": "footer-col-2-menu", "type": "menu", "skin": "minimal", "menuType": "custom", "style": "vertical", "align": "left", "items": [{ "id": "menu-librarians", "label": "Librarians", "url": "/librarians", "target": "_self", "displayCondition": "always", "order": 0 }, { "id": "menu-corporations", "label": "Corporations", "url": "/corporations", "target": "_self", "displayCondition": "always", "order": 1 }, { "id": "menu-societies", "label": "Societies", "url": "/societies", "target": "_self", "displayCondition": "always", "order": 2 }, { "id": "menu-researchers", "label": "Researchers", "url": "/researchers", "target": "_self", "displayCondition": "always", "order": 3 }] },
            { "id": "footer-col-3-heading", "type": "text", "skin": "minimal", "text": "<strong>About</strong>", "align": "left" },
            { "id": "footer-col-3-menu", "type": "menu", "skin": "minimal", "menuType": "custom", "style": "vertical", "align": "left", "items": [{ "id": "menu-about", "label": "About Wiley", "url": "/about", "target": "_self", "displayCondition": "always", "order": 0 }, { "id": "menu-careers", "label": "Careers", "url": "/careers", "target": "_self", "displayCondition": "always", "order": 1 }, { "id": "menu-newsroom", "label": "Newsroom", "url": "/newsroom", "target": "_self", "displayCondition": "always", "order": 2 }, { "id": "menu-contact", "label": "Contact", "url": "/contact", "target": "_self", "displayCondition": "always", "order": 3 }] },
            { "id": "footer-col-4-heading", "type": "text", "skin": "minimal", "text": "<strong>Help</strong>", "align": "left" },
            { "id": "footer-col-4-menu", "type": "menu", "skin": "minimal", "menuType": "custom", "style": "vertical", "align": "left", "items": [{ "id": "menu-support", "label": "Support", "url": "/support", "target": "_self", "displayCondition": "always", "order": 0 }, { "id": "menu-faq", "label": "FAQ", "url": "/faq", "target": "_self", "displayCondition": "always", "order": 1 }, { "id": "menu-training", "label": "Training", "url": "/training", "target": "_self", "displayCondition": "always", "order": 2 }, { "id": "menu-feedback", "label": "Feedback", "url": "/feedback", "target": "_self", "displayCondition": "always", "order": 3 }] }
          ]
        }
      ]
    },
    {
      "id": "footer-bottom-section",
      "name": "Footer Bottom",
      "type": "content-block",
      "layout": "one-column",
      "background": { "type": "color", "color": "#003b44" },
      "contentMode": "dark",
      "styling": { "paddingTop": "24px", "paddingBottom": "24px", "maxWidth": "7xl", "centerContent": true, "border": { "enabled": true, "color": "default", "width": "thin", "style": "solid", "position": "top" } },
      "areas": [
        {
          "id": "footer-bottom-content",
          "name": "Legal",
          "widgets": [
            { "id": "footer-legal-menu", "type": "menu", "skin": "minimal", "menuType": "custom", "style": "horizontal", "align": "center", "items": [{ "id": "legal-copyright", "label": "© 2000-2025 John Wiley & Sons, Inc.", "url": "#", "target": "_self", "displayCondition": "always", "order": 0 }, { "id": "legal-privacy", "label": "Privacy Policy", "url": "/privacy", "target": "_self", "displayCondition": "always", "order": 1 }, { "id": "legal-terms", "label": "Terms of Use", "url": "/terms", "target": "_self", "displayCondition": "always", "order": 2 }, { "id": "legal-cookies", "label": "Cookie Settings", "url": "/cookies", "target": "_self", "displayCondition": "always", "order": 3 }, { "id": "legal-accessibility", "label": "Accessibility", "url": "/accessibility", "target": "_self", "displayCondition": "always", "order": 4 }, { "id": "legal-sitemap", "label": "Sitemap", "url": "/sitemap", "target": "_self", "displayCondition": "always", "order": 5 }] }
          ]
        }
      ]
    }
  ] as any[]
}

export const mockStarterPages: CustomStarterPage[] = [
  catalystGenericHomepage,
  febsHomepage2025,
  legacyMockHomepage,
  wileyOnlineLibraryLanding,
  wolLandingClaudeV2
]

