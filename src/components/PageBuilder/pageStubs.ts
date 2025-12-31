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
import { getCitationByDOI, citationToSchemaOrg } from '../../utils/citationData'

// Use 'any' for canvas items since the types are complex and we're building stubs
// The runtime validation happens in the renderers
type CanvasItemStub = any

// =============================================================================
// WEBSITE-SPECIFIC HOMEPAGE STUBS
// =============================================================================

/**
 * Get homepage stub based on website ID and design/theme
 * @param websiteId - The website ID
 * @param designId - Optional design/theme ID to determine which stub to use
 */
export function getHomepageStubForWebsite(websiteId: string, designId?: string, journals?: JournalStubData[]): CanvasItemStub[] {
  // Check by design/theme ID first (this allows bypassing hardcoded website stubs)
  // This is important for reset functionality - we want theme defaults, not website-specific stubs
  if (designId) {
    const normalizedDesignId = designId.toLowerCase()
    if (normalizedDesignId.includes('wiley')) {
      return createWileyHomepageStub()  // Original Wiley homepage
    }
    if (normalizedDesignId.includes('febs')) {
      // FEBS theme check - but if designId is explicitly 'classic-ux3-theme', use Classic stub instead
      // This allows reset to bypass FEBS hardcoded stub
      if (designId === 'classic-ux3-theme') {
        return createCatalystHomepageStub(websiteId, journals) // Classic theme's default website homepage
      }
      return createFebsHomepageStub()
    }
    if (normalizedDesignId.includes('carbon')) {
      return createCarbonHomepageStub()
    }
    // Check for Classic theme explicitly
    if (normalizedDesignId.includes('classic') || normalizedDesignId === 'classic-ux3-theme') {
      return createCatalystHomepageStub(websiteId, journals) // Classic theme's default website homepage
    }
  }
  
  // Check known websites (only if designId didn't match)
  switch (websiteId) {
    case 'febs-press':
      return createFebsHomepageStub()
    case 'catalyst-demo':
      return createCatalystHomepageStub(websiteId, journals) // Classic theme's default website homepage
    case '__classic-default__':
      // Explicit request for Classic theme's default website homepage (legacy support)
      return createCatalystHomepageStub(websiteId, journals)
  }
  
  // Default to Classic theme's default website homepage
  // This is what Classic-themed websites (and unknown themes) should use
  return createCatalystHomepageStub(websiteId, journals)
}

/**
 * IBM Carbon Design Homepage Stub
 * Features IBM Blue hero, button showcase, and enterprise styling
 */
export function createCarbonHomepageStub(): CanvasItemStub[] {
  return [
    // Hero Section - IBM Blue background with grid layout
    {
      id: nanoid(),
      name: 'Section',
      type: 'content-block',
      layout: 'grid',
      areas: [
        {
          id: nanoid(),
          name: 'Grid Items',
          widgets: [
            {
              id: nanoid(),
              type: 'heading',
              sectionId: '',
              skin: 'minimal',
              text: 'Design theme based on IBM\'s Carbon Design System',
              level: 1,
              align: 'center',
              style: 'hero',
              color: 'default',
              size: 'auto',
              icon: { enabled: false, position: 'left', emoji: '' },
              gridSpan: { column: 'span 2' }
            },
            {
              id: nanoid(),
              type: 'text',
              sectionId: '',
              skin: 'minimal',
              text: 'Carbon is IBM\'s open source design system for products and digital experiences. With the IBM Design Language as its foundation, the system consists of working code, design tools and resources, human interface guidelines, and a vibrant community of contributors.',
              align: 'center',
              gridSpan: { column: 'span 2' }
            }
          ]
        }
      ],
      gridConfig: {
        columns: 2,
        gap: '1rem',
        alignItems: 'stretch',
        justifyItems: 'stretch'
      },
      background: {
        type: 'color',
        color: '#0f62fe'
      },
      minHeight: '400px',
      padding: '10rem'
    },
    // Button System Header Section
    {
      id: nanoid(),
      name: 'Section',
      type: 'content-block',
      layout: 'grid',
      areas: [
        {
          id: nanoid(),
          name: 'Grid Items',
          widgets: [
            {
              id: nanoid(),
              type: 'heading',
              sectionId: '',
              skin: 'minimal',
              text: 'IBM Carbon Button System',
              level: 2,
              align: 'center',
              style: 'default',
              color: 'default',
              size: 'auto',
              icon: { enabled: false, position: 'left', emoji: '' },
              gridSpan: { column: 'span 3' }
            },
            {
              id: nanoid(),
              type: 'text',
              sectionId: '',
              skin: 'minimal',
              text: 'Five semantic button styles for enterprise applications',
              align: 'center',
              inlineStyles: '',
              gridSpan: { column: 'span 3' }
            }
          ]
        }
      ],
      gridConfig: {
        columns: 3,
        gap: '1rem',
        alignItems: 'stretch',
        justifyItems: 'stretch'
      },
      background: {
        type: 'color',
        color: '#f4f4f4'
      }
    },
    // Button Showcase Section - All 5 Carbon button styles
    {
      id: nanoid(),
      name: 'Section',
      type: 'content-block',
      layout: 'flexible',
      areas: [
        {
          id: nanoid(),
          name: 'Flex Items',
          widgets: [
            {
              id: nanoid(),
              type: 'button',
              sectionId: '',
              skin: 'minimal',
              text: 'PRIMARY',
              style: 'solid',
              color: 'color1',
              size: 'large',
              href: '#',
              target: '_self',
              align: 'right',
              icon: { enabled: false, position: 'left', emoji: '' }
            },
            {
              id: nanoid(),
              type: 'button',
              sectionId: '',
              skin: 'minimal',
              text: 'SECONDARY',
              style: 'solid',
              color: 'color2',
              size: 'large',
              href: '#',
              target: '_self',
              align: 'center',
              icon: { enabled: false, position: 'left', emoji: '' }
            },
            {
              id: nanoid(),
              type: 'button',
              sectionId: '',
              skin: 'minimal',
              text: 'TERTIARY',
              style: 'solid',
              color: 'color3',
              size: 'large',
              href: '#',
              target: '_self',
              align: 'left',
              icon: { enabled: false, position: 'left', emoji: '' }
            },
            {
              id: nanoid(),
              type: 'button',
              sectionId: '',
              skin: 'minimal',
              text: 'DANGER',
              style: 'solid',
              color: 'color4',
              size: 'large',
              href: '#',
              target: '_self',
              align: 'center',
              icon: { enabled: false, position: 'left', emoji: '' }
            },
            {
              id: nanoid(),
              type: 'button',
              sectionId: '',
              skin: 'minimal',
              text: 'GHOST',
              style: 'solid',
              color: 'color5',
              size: 'large',
              href: '#',
              target: '_self',
              align: 'right',
              icon: { enabled: false, position: 'left', emoji: '' }
            }
          ]
        }
      ],
      flexConfig: {
        direction: 'row',
        wrap: true,
        justifyContent: 'center',
        gap: '1rem'
      },
      background: {
        type: 'color',
        color: '#f4f4f4'
      }
    },
    // About IBM Carbon Section
    {
      id: nanoid(),
      name: 'About IBM Carbon',
      type: 'content-block',
      layout: 'one-column',
      areas: [
        {
          id: nanoid(),
          name: 'Content',
          widgets: [
            {
              id: nanoid(),
              type: 'text',
              sectionId: '',
              skin: 'minimal',
              text: 'ENTERPRISE DESIGN',
              align: 'center',
              inlineStyles: 'font-size: 12px; font-weight: 600; letter-spacing: 2px; color: #525252; margin-bottom: 16px;'
            },
            {
              id: nanoid(),
              type: 'heading',
              sectionId: '',
              skin: 'minimal',
              text: 'Built for Scale',
              level: 2,
              align: 'center',
              style: 'default',
              color: 'default',
              size: 'auto',
              icon: { enabled: false, position: 'left', emoji: '' }
            },
            {
              id: nanoid(),
              type: 'text',
              sectionId: '',
              skin: 'minimal',
              text: 'IBM Carbon Design System powers enterprise applications with structured, accessible, and scalable components. Sharp corners, consistent spacing, and semantic color systems ensure clarity at any scale.',
              align: 'center',
              inlineStyles: 'font-size: 18px; line-height: 1.7; color: #161616; max-width: 900px; margin: 0 auto 32px auto;'
            },
            {
              id: nanoid(),
              type: 'button',
              sectionId: '',
              skin: 'minimal',
              text: 'LEARN MORE',
              style: 'solid',
              color: 'color1',
              size: 'large',
              href: '#',
              target: '_self',
              align: 'center',
              icon: { enabled: false, position: 'left', emoji: '' }
            }
          ]
        }
      ],
      styling: {
        paddingTop: '80px',
        paddingBottom: '80px',
        paddingLeft: '80px',
        paddingRight: '80px',
        gap: 'large',
        variant: 'full-width',
        textColor: 'default',
        maxWidth: '2xl'
      },
      background: {
        type: 'color',
        color: '#ffffff',
        opacity: 1
      },
      contentMode: 'light'
    }
  ]
}

/**
 * Wiley Online Library Global Landing Page
 * Comprehensive page with hero, subjects, featured articles, stats, open access, quick links, and footer
 */
export function createWileyOnlineLibraryStub(): CanvasItemStub[] {
  return [
    // Hero Section
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
      areas: [
        {
          id: nanoid(),
          name: 'Hero Content',
          widgets: [
            {
              id: nanoid(),
              type: 'text',
              text: '🟢 Trusted by 15,000+ Institutions',
              align: 'center',
              typographyStyle: 'body-sm',
              skin: 'minimal',
              layout: {
                variant: 'bordered',
                padding: 'small',
                background: 'transparent',
                rounded: 'large'
              }
            },
            { id: nanoid(), type: 'spacer', height: '1.5rem', skin: 'minimal' },
            {
              id: nanoid(),
              type: 'heading',
              text: 'Discover Research That Matters',
              level: 1,
              align: 'center',
              style: 'hero',
              color: 'default',
              typographyStyle: 'heading-h1',
              skin: 'minimal'
            },
            { id: nanoid(), type: 'spacer', height: '1.5rem', skin: 'minimal' },
            {
              id: nanoid(),
              type: 'text',
              text: 'Access millions of peer-reviewed articles, books, and protocols from the world\'s leading researchers across every discipline.',
              align: 'center',
              typographyStyle: 'body-xl',
              skin: 'minimal'
            },
            { id: nanoid(), type: 'spacer', height: '2rem', skin: 'minimal' },
            {
              id: nanoid(),
              type: 'button',
              text: 'EXPLORE JOURNALS',
              href: '/journals',
              style: 'solid',
              color: 'color1',
              size: 'large',
              align: 'center',
              skin: 'minimal'
            },
            {
              id: nanoid(),
              type: 'button',
              text: 'FOR INSTITUTIONS',
              href: '/institutions',
              style: 'outline',
              color: 'color5',
              size: 'large',
              align: 'center',
              skin: 'minimal'
            },
            { id: nanoid(), type: 'spacer', height: '3rem', skin: 'minimal' },
            // Stats row using text widgets
            {
              id: nanoid(),
              type: 'text',
              text: '<div style="display: flex; justify-content: center; gap: 4rem; flex-wrap: wrap;"><div style="text-align: center;"><strong style="font-size: 2.5rem; display: block;">6M+</strong><span style="opacity: 0.7;">Articles</span></div><div style="text-align: center;"><strong style="font-size: 2.5rem; display: block;">1,600+</strong><span style="opacity: 0.7;">Journals</span></div><div style="text-align: center;"><strong style="font-size: 2.5rem; display: block;">22K+</strong><span style="opacity: 0.7;">Books</span></div></div>',
              align: 'center',
              skin: 'minimal'
            }
          ]
        }
      ]
    },
    // Browse by Subject Section
    {
      id: nanoid(),
      name: 'Browse by Subject',
      type: 'content-block',
      layout: 'one-column',
      background: { type: 'color', color: '#ffffff' },
      contentMode: 'light',
      styling: {
        paddingTop: '80px',
        paddingBottom: '80px',
        maxWidth: '7xl',
        centerContent: true
      },
      areas: [
        {
          id: nanoid(),
          name: 'Section Header',
          widgets: [
            {
              id: nanoid(),
              type: 'text',
              text: 'Browse by Subject',
              align: 'center',
              typographyStyle: 'body-sm',
              inlineStyles: 'text-transform: uppercase; letter-spacing: 0.1em; color: #00bfb1; font-weight: 600;',
              skin: 'minimal'
            },
            {
              id: nanoid(),
              type: 'heading',
              text: 'Explore Every Discipline',
              level: 2,
              align: 'center',
              style: 'default',
              typographyStyle: 'heading-h2',
              skin: 'minimal'
            },
            {
              id: nanoid(),
              type: 'text',
              text: 'Discover content across all major research areas, from life sciences and medicine to humanities.',
              align: 'center',
              typographyStyle: 'body-lg',
              skin: 'minimal'
            },
            { id: nanoid(), type: 'spacer', height: '3rem', skin: 'minimal' }
          ]
        },
        {
          id: nanoid(),
          name: 'Subject Cards Grid',
          widgets: [
            // 8 Subject Cards as text/button combinations (simplified from editorial cards)
            {
              id: nanoid(),
              type: 'text',
              text: '<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.25rem;"><div style="background: linear-gradient(135deg, #00bfb1 0%, #009e94 100%); border-radius: 12px; padding: 2rem; text-align: center; color: white;"><div style="font-size: 48px; margin-bottom: 1rem;">🧬</div><h3 style="font-size: 1.25rem; margin-bottom: 0.5rem;">Life Sciences</h3><p style="opacity: 0.8;">450+ Journals</p><a href="/subjects/life-sciences" style="color: white; text-decoration: underline;">Explore →</a></div><div style="background: linear-gradient(135deg, #00bfb1 0%, #009e94 100%); border-radius: 12px; padding: 2rem; text-align: center; color: white;"><div style="font-size: 48px; margin-bottom: 1rem;">⚗️</div><h3 style="font-size: 1.25rem; margin-bottom: 0.5rem;">Physical Sciences</h3><p style="opacity: 0.8;">380+ Journals</p><a href="/subjects/physical-sciences" style="color: white; text-decoration: underline;">Explore →</a></div><div style="background: linear-gradient(135deg, #00bfb1 0%, #009e94 100%); border-radius: 12px; padding: 2rem; text-align: center; color: white;"><div style="font-size: 48px; margin-bottom: 1rem;">🩺</div><h3 style="font-size: 1.25rem; margin-bottom: 0.5rem;">Health Sciences</h3><p style="opacity: 0.8;">320+ Journals</p><a href="/subjects/health-sciences" style="color: white; text-decoration: underline;">Explore →</a></div><div style="background: linear-gradient(135deg, #00bfb1 0%, #009e94 100%); border-radius: 12px; padding: 2rem; text-align: center; color: white;"><div style="font-size: 48px; margin-bottom: 1rem;">👥</div><h3 style="font-size: 1.25rem; margin-bottom: 0.5rem;">Social Sciences</h3><p style="opacity: 0.8;">280+ Journals</p><a href="/subjects/social-sciences" style="color: white; text-decoration: underline;">Explore →</a></div><div style="background: linear-gradient(135deg, #00bfb1 0%, #009e94 100%); border-radius: 12px; padding: 2rem; text-align: center; color: white;"><div style="font-size: 48px; margin-bottom: 1rem;">💻</div><h3 style="font-size: 1.25rem; margin-bottom: 0.5rem;">Computer Science</h3><p style="opacity: 0.8;">150+ Journals</p><a href="/subjects/computer-science" style="color: white; text-decoration: underline;">Explore →</a></div><div style="background: linear-gradient(135deg, #00bfb1 0%, #009e94 100%); border-radius: 12px; padding: 2rem; text-align: center; color: white;"><div style="font-size: 48px; margin-bottom: 1rem;">⚙️</div><h3 style="font-size: 1.25rem; margin-bottom: 0.5rem;">Engineering</h3><p style="opacity: 0.8;">200+ Journals</p><a href="/subjects/engineering" style="color: white; text-decoration: underline;">Explore →</a></div><div style="background: linear-gradient(135deg, #00bfb1 0%, #009e94 100%); border-radius: 12px; padding: 2rem; text-align: center; color: white;"><div style="font-size: 48px; margin-bottom: 1rem;">📚</div><h3 style="font-size: 1.25rem; margin-bottom: 0.5rem;">Humanities</h3><p style="opacity: 0.8;">180+ Journals</p><a href="/subjects/humanities" style="color: white; text-decoration: underline;">Explore →</a></div><div style="background: linear-gradient(135deg, #00bfb1 0%, #009e94 100%); border-radius: 12px; padding: 2rem; text-align: center; color: white;"><div style="font-size: 48px; margin-bottom: 1rem;">💼</div><h3 style="font-size: 1.25rem; margin-bottom: 0.5rem;">Business</h3><p style="opacity: 0.8;">160+ Journals</p><a href="/subjects/business" style="color: white; text-decoration: underline;">Explore →</a></div></div>',
              align: 'center',
              skin: 'minimal'
            }
          ]
        }
      ]
    },
    // Featured Articles Section
    {
      id: nanoid(),
      name: 'Featured Articles',
      type: 'content-block',
      layout: 'one-column',
      background: { type: 'color', color: '#f2f2eb' },
      contentMode: 'light',
      styling: {
        paddingTop: '80px',
        paddingBottom: '80px',
        maxWidth: '7xl',
        centerContent: true
      },
      areas: [
        {
          id: nanoid(),
          name: 'Section Header',
          widgets: [
            {
              id: nanoid(),
              type: 'text',
              text: '<div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 2rem;"><div><span style="text-transform: uppercase; letter-spacing: 0.1em; color: #00bfb1; font-size: 14px; font-weight: 600; display: block;">Latest Research</span><span style="font-size: 32px; font-weight: 700;">Featured Articles</span></div></div>',
              align: 'left',
              skin: 'minimal'
            },
            {
              id: nanoid(),
              type: 'tabs',
              activeTabIndex: 0,
              tabStyle: 'underline',
              align: 'left',
              skin: 'minimal',
              tabs: [
                { id: nanoid(), label: 'Most Read', widgets: [] },
                { id: nanoid(), label: 'Most Cited', widgets: [] },
                { id: nanoid(), label: 'Recent', widgets: [] },
                { id: nanoid(), label: 'Open Access', widgets: [] }
              ]
            },
            { id: nanoid(), type: 'spacer', height: '2rem', skin: 'minimal' },
            // Article cards grid
            {
              id: nanoid(),
              type: 'text',
              text: '<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem;"><div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);"><img src="https://wiley.sharepoint.com/teams/Brand/Org%20Image%20Library/Brand%20Images/Hero/wiley_website_life%20sciences_abstract.jpeg" alt="" style="width: 100%; height: 180px; object-fit: cover;"><div style="padding: 1.5rem;"><span style="background: #00bfb1; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">OPEN ACCESS</span><h3 style="font-size: 1.125rem; margin: 1rem 0 0.5rem;">CRISPR-Cas9 Advances in Gene Therapy</h3><p style="color: #666; font-size: 14px; line-height: 1.5;">Recent developments in CRISPR technology have opened new avenues for treating genetic disorders.</p><div style="margin-top: 1rem; font-size: 13px; color: #888;">Dec 2024 · 12.4K views</div></div></div><div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);"><img src="https://wiley.sharepoint.com/teams/Brand/Org%20Image%20Library/Brand%20Images/Hero/wiley_website_physical-sciences_abstract.jpg" alt="" style="width: 100%; height: 180px; object-fit: cover;"><div style="padding: 1.5rem;"><span style="background: #f2f2eb; color: #666; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">RESEARCH ARTICLE</span><h3 style="font-size: 1.125rem; margin: 1rem 0 0.5rem;">Global Carbon Cycling Under Climate Change</h3><p style="color: #666; font-size: 14px; line-height: 1.5;">An analysis of terrestrial and oceanic carbon sinks and their response to anthropogenic warming.</p><div style="margin-top: 1rem; font-size: 13px; color: #888;">Nov 2024 · 8.7K views</div></div></div><div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);"><img src="https://wiley.sharepoint.com/teams/Brand/Org%20Image%20Library/Brand%20Images/Hero/wiley_website_research_abstract.jpg" alt="" style="width: 100%; height: 180px; object-fit: cover;"><div style="padding: 1.5rem;"><span style="background: #f2f2eb; color: #666; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">RESEARCH ARTICLE</span><h3 style="font-size: 1.125rem; margin: 1rem 0 0.5rem;">Transformer Architectures for Scientific Discovery</h3><p style="color: #666; font-size: 14px; line-height: 1.5;">How large language models are accelerating scientific research across multiple disciplines.</p><div style="margin-top: 1rem; font-size: 13px; color: #888;">Dec 2024 · 15.2K views</div></div></div></div>',
              align: 'center',
              skin: 'minimal'
            }
          ]
        }
      ]
    },
    // Impact Statistics Section
    {
      id: nanoid(),
      name: 'Impact Statistics',
      type: 'content-block',
      layout: 'one-column',
      background: {
        type: 'gradient',
        gradient: {
          type: 'linear',
          direction: '135deg',
          stops: [
            { color: '#003b44', position: '0%' },
            { color: '#00505c', position: '100%' }
          ]
        }
      },
      contentMode: 'dark',
      styling: {
        paddingTop: '80px',
        paddingBottom: '80px',
        maxWidth: '7xl',
        centerContent: true,
        textColor: 'white'
      },
      areas: [
        {
          id: nanoid(),
          name: 'Stats Content',
          widgets: [
            {
              id: nanoid(),
              type: 'text',
              text: 'Our Impact',
              align: 'center',
              typographyStyle: 'body-sm',
              inlineStyles: 'text-transform: uppercase; letter-spacing: 0.1em; color: #00bfb1; font-weight: 600;',
              skin: 'minimal'
            },
            {
              id: nanoid(),
              type: 'heading',
              text: 'Advancing Research Worldwide',
              level: 2,
              align: 'center',
              style: 'default',
              color: 'default',
              typographyStyle: 'heading-h2',
              skin: 'minimal'
            },
            {
              id: nanoid(),
              type: 'text',
              text: 'Trusted by leading institutions and researchers across the globe for over 200 years.',
              align: 'center',
              typographyStyle: 'body-lg',
              skin: 'minimal'
            },
            { id: nanoid(), type: 'spacer', height: '3rem', skin: 'minimal' },
            // Stats grid
            {
              id: nanoid(),
              type: 'text',
              text: '<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem;"><div style="text-align: center; padding: 2rem;"><div style="font-size: 48px; margin-bottom: 1rem;">📥</div><div style="font-size: 3rem; font-weight: 700;">200M+</div><div style="opacity: 0.8;">Annual Downloads<br><small>Full-text articles accessed yearly</small></div></div><div style="text-align: center; padding: 2rem;"><div style="font-size: 48px; margin-bottom: 1rem;">🌍</div><div style="font-size: 3rem; font-weight: 700;">15K+</div><div style="opacity: 0.8;">Institutions<br><small>Universities with access</small></div></div><div style="text-align: center; padding: 2rem;"><div style="font-size: 48px; margin-bottom: 1rem;">✍️</div><div style="font-size: 3rem; font-weight: 700;">500K+</div><div style="opacity: 0.8;">Authors<br><small>Publishing researchers</small></div></div><div style="text-align: center; padding: 2rem;"><div style="font-size: 48px; margin-bottom: 1rem;">🏆</div><div style="font-size: 3rem; font-weight: 700;">85%</div><div style="opacity: 0.8;">Top Ranked<br><small>Journals in top categories</small></div></div></div>',
              align: 'center',
              skin: 'minimal'
            }
          ]
        }
      ]
    },
    // Open Access Section
    {
      id: nanoid(),
      name: 'Open Access',
      type: 'content-block',
      layout: 'two-columns',
      background: { type: 'color', color: '#ffffff' },
      contentMode: 'light',
      styling: {
        paddingTop: '80px',
        paddingBottom: '80px',
        maxWidth: '7xl',
        centerContent: true,
        gap: '64px'
      },
      areas: [
        {
          id: nanoid(),
          name: 'Media Column',
          widgets: [
            {
              id: nanoid(),
              type: 'image',
              src: 'https://wiley.sharepoint.com/teams/Brand/Org%20Image%20Library/Brand%20Images/Abstract/Abstract%20Green%20Wave%20Patterns%20-%20Abstract.jpeg',
              alt: 'Open Access',
              ratio: '4:3',
              width: 'full',
              objectFit: 'cover',
              skin: 'minimal',
              layout: { rounded: 'large', shadow: 'large' }
            }
          ]
        },
        {
          id: nanoid(),
          name: 'Content Column',
          widgets: [
            {
              id: nanoid(),
              type: 'text',
              text: 'Open Access',
              align: 'left',
              typographyStyle: 'body-sm',
              inlineStyles: 'text-transform: uppercase; letter-spacing: 0.1em; color: #00bfb1; font-weight: 600;',
              skin: 'minimal'
            },
            {
              id: nanoid(),
              type: 'heading',
              text: 'Make Your Research Freely Available',
              level: 2,
              align: 'left',
              style: 'default',
              typographyStyle: 'heading-h2',
              skin: 'minimal'
            },
            {
              id: nanoid(),
              type: 'text',
              text: 'Open Access publishing ensures your work reaches the widest possible audience, increasing citations and accelerating scientific discovery.',
              align: 'left',
              typographyStyle: 'body-lg',
              skin: 'minimal'
            },
            { id: nanoid(), type: 'spacer', height: '1.5rem', skin: 'minimal' },
            {
              id: nanoid(),
              type: 'text',
              text: '✓ Immediate, unrestricted access to your research<br>✓ CC-BY licensing for maximum reuse<br>✓ Compliant with funder mandates<br>✓ 1,000+ institutional agreements',
              align: 'left',
              typographyStyle: 'body-md',
              skin: 'minimal'
            },
            { id: nanoid(), type: 'spacer', height: '2rem', skin: 'minimal' },
            {
              id: nanoid(),
              type: 'button',
              text: 'LEARN MORE',
              href: '/open-access',
              style: 'solid',
              color: 'color1',
              size: 'medium',
              skin: 'minimal'
            },
            {
              id: nanoid(),
              type: 'button',
              text: 'CHECK ELIGIBILITY',
              href: '/open-access/eligibility',
              style: 'outline',
              color: 'color2',
              size: 'medium',
              skin: 'minimal'
            }
          ]
        }
      ]
    },
    // Quick Links Section
    {
      id: nanoid(),
      name: 'Quick Links',
      type: 'content-block',
      layout: 'one-column',
      background: { type: 'color', color: '#e3ebe8' },
      contentMode: 'light',
      styling: {
        paddingTop: '80px',
        paddingBottom: '80px',
        maxWidth: '7xl',
        centerContent: true
      },
      areas: [
        {
          id: nanoid(),
          name: 'Quick Links Content',
          widgets: [
            {
              id: nanoid(),
              type: 'text',
              text: 'Resources',
              align: 'center',
              typographyStyle: 'body-sm',
              inlineStyles: 'text-transform: uppercase; letter-spacing: 0.1em; color: #00bfb1; font-weight: 600;',
              skin: 'minimal'
            },
            {
              id: nanoid(),
              type: 'heading',
              text: 'Quick Links for Researchers',
              level: 2,
              align: 'center',
              style: 'default',
              typographyStyle: 'heading-h2',
              skin: 'minimal'
            },
            { id: nanoid(), type: 'spacer', height: '2.5rem', skin: 'minimal' },
            // Quick links grid
            {
              id: nanoid(),
              type: 'text',
              text: '<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.25rem;"><a href="/authors/submit" style="background: white; border-radius: 12px; padding: 1.5rem; display: flex; align-items: center; gap: 1rem; text-decoration: none; color: inherit; box-shadow: 0 2px 8px rgba(0,0,0,0.05);"><span style="font-size: 32px;">✍️</span><div><strong style="display: block;">Submit a Manuscript</strong><span style="color: #00bfb1;">Submit →</span></div></a><a href="/authors/guidelines" style="background: white; border-radius: 12px; padding: 1.5rem; display: flex; align-items: center; gap: 1rem; text-decoration: none; color: inherit; box-shadow: 0 2px 8px rgba(0,0,0,0.05);"><span style="font-size: 32px;">📖</span><div><strong style="display: block;">Author Guidelines</strong><span style="color: #00bfb1;">View →</span></div></a><a href="/institutions/access" style="background: white; border-radius: 12px; padding: 1.5rem; display: flex; align-items: center; gap: 1rem; text-decoration: none; color: inherit; box-shadow: 0 2px 8px rgba(0,0,0,0.05);"><span style="font-size: 32px;">🏛️</span><div><strong style="display: block;">Institutional Access</strong><span style="color: #00bfb1;">Check →</span></div></a><a href="/support" style="background: white; border-radius: 12px; padding: 1.5rem; display: flex; align-items: center; gap: 1rem; text-decoration: none; color: inherit; box-shadow: 0 2px 8px rgba(0,0,0,0.05);"><span style="font-size: 32px;">💬</span><div><strong style="display: block;">Help & Support</strong><span style="color: #00bfb1;">Get Help →</span></div></a></div>',
              align: 'center',
              skin: 'minimal'
            }
          ]
        }
      ]
    },
    // Newsletter Section
    {
      id: nanoid(),
      name: 'Newsletter Signup',
      type: 'content-block',
      layout: 'one-column',
      background: {
        type: 'gradient',
        gradient: {
          type: 'linear',
          direction: '135deg',
          stops: [
            { color: '#003b44', position: '0%' },
            { color: '#006573', position: '100%' }
          ]
        }
      },
      contentMode: 'dark',
      styling: {
        paddingTop: '64px',
        paddingBottom: '64px',
        maxWidth: '4xl',
        centerContent: true,
        textColor: 'white'
      },
      areas: [
        {
          id: nanoid(),
          name: 'Newsletter Content',
          widgets: [
            {
              id: nanoid(),
              type: 'text',
              text: '<div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 2rem;"><div><strong style="font-size: 24px; display: block; margin-bottom: 8px;">Stay Ahead with Latest Research</strong><span style="opacity: 0.8;">Get weekly updates on trending articles and announcements.</span></div></div>',
              align: 'left',
              skin: 'minimal'
            },
            {
              id: nanoid(),
              type: 'button',
              text: 'SUBSCRIBE',
              href: '/newsletter/subscribe',
              style: 'solid',
              color: 'color1',
              size: 'large',
              skin: 'minimal'
            }
          ]
        }
      ]
    },
    // Footer Section
    {
      id: nanoid(),
      name: 'Footer',
      type: 'content-block',
      layout: 'one-column',
      background: { type: 'color', color: '#003b44' },
      contentMode: 'dark',
      styling: {
        paddingTop: '64px',
        paddingBottom: '32px',
        maxWidth: '7xl',
        centerContent: true,
        textColor: 'white'
      },
      areas: [
        {
          id: nanoid(),
          name: 'Footer Content',
          widgets: [
            // Footer grid
            {
              id: nanoid(),
              type: 'text',
              text: '<div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 2rem; margin-bottom: 2rem;"><div><strong style="font-size: 24px; display: block; margin-bottom: 16px;">WILEY</strong><span style="opacity: 0.6; font-size: 14px; line-height: 1.6;">Wiley Online Library is one of the world\'s most extensive multidisciplinary collections of online resources.</span></div><div><strong style="display: block; margin-bottom: 16px;">Resources</strong><div style="display: flex; flex-direction: column; gap: 8px; opacity: 0.7;"><a href="/authors" style="color: white; text-decoration: none;">Author Resources</a><a href="/reviewers" style="color: white; text-decoration: none;">Reviewer Resources</a><a href="/librarians" style="color: white; text-decoration: none;">Librarian Resources</a><a href="/open-access" style="color: white; text-decoration: none;">Open Access</a></div></div><div><strong style="display: block; margin-bottom: 16px;">About</strong><div style="display: flex; flex-direction: column; gap: 8px; opacity: 0.7;"><a href="/about" style="color: white; text-decoration: none;">About Wiley</a><a href="/press" style="color: white; text-decoration: none;">Press Releases</a><a href="/careers" style="color: white; text-decoration: none;">Careers</a><a href="/contact" style="color: white; text-decoration: none;">Contact Us</a></div></div><div><strong style="display: block; margin-bottom: 16px;">Help</strong><div style="display: flex; flex-direction: column; gap: 8px; opacity: 0.7;"><a href="/support" style="color: white; text-decoration: none;">Support Center</a><a href="/getting-started" style="color: white; text-decoration: none;">Getting Started</a><a href="/technical-support" style="color: white; text-decoration: none;">Technical Support</a><a href="/faqs" style="color: white; text-decoration: none;">FAQs</a></div></div><div><strong style="display: block; margin-bottom: 16px;">Connect</strong><span style="opacity: 0.6;">Follow us on social media</span></div></div>',
              align: 'left',
              skin: 'minimal'
            },
            {
              id: nanoid(),
              type: 'divider',
              style: 'solid',
              thickness: '1px',
              color: 'rgba(255,255,255,0.1)',
              marginTop: '2rem',
              marginBottom: '1.5rem',
              skin: 'minimal'
            },
            // Footer bottom
            {
              id: nanoid(),
              type: 'text',
              text: '<div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;"><span style="opacity: 0.6; font-size: 14px;">© 2000-2024 John Wiley & Sons, Inc.</span><div style="display: flex; gap: 1.5rem; font-size: 14px; opacity: 0.7;"><a href="/privacy" style="color: white; text-decoration: none;">Privacy</a><a href="/terms" style="color: white; text-decoration: none;">Terms</a><a href="/cookies" style="color: white; text-decoration: none;">Cookies</a><a href="/accessibility" style="color: white; text-decoration: none;">Accessibility</a></div></div>',
              align: 'left',
              skin: 'minimal'
            }
          ]
        }
      ]
    }
  ]
}

/**
 * Wiley Design Homepage Stub (based on wiley-home-2-stub)
 * @deprecated Use createWileyOnlineLibraryStub for the full WOL landing page
 */
export function createWileyHomepageStub(): CanvasItemStub[] {
  return [
    // Hero Section - Two columns with image
    {
      id: nanoid(),
      name: 'Hero Section',
      type: 'content-block',
      layout: 'two-columns',
      areas: [
        {
          id: nanoid(),
          name: 'Left Column',
          widgets: [
            {
              id: nanoid(),
              skin: 'minimal',
              type: 'spacer',
              height: '6rem',
              sectionId: ''
            },
            {
              id: nanoid(),
              type: 'heading',
              sectionId: '',
              skin: 'minimal',
              text: 'Where ideas ignite and impact endures',
              level: 1,
              align: 'left',
              style: 'hero',
              color: 'default',
              size: 'auto',
              icon: { enabled: false, position: 'left', emoji: '' }
            },
            {
              id: nanoid(),
              type: 'text',
              sectionId: '',
              skin: 'minimal',
              text: 'Wiley brings together research, learning, and technology to spark breakthroughs and power progress across industries and society.',
              align: 'left'
            }
          ]
        },
        {
          id: nanoid(),
          name: 'Right Column',
          widgets: [
            {
              id: nanoid(),
              skin: 'minimal',
              type: 'image',
              src: 'https://cf-images.us-east-1.prod.boltdns.net/v1/static/1922092229001/104bb4ae-0d11-4f70-b1ee-4ec6f6669214/9dcf96de-5752-4dee-9225-3e229fffd5d1/640x360/match/image.jpg',
              alt: 'Image description',
              ratio: '16:9',
              caption: '',
              link: '',
              alignment: 'center',
              width: 'full',
              objectFit: 'cover',
              sectionId: ''
            }
          ]
        }
      ],
      padding: '64px',
      minHeight: '500px',
      styling: {
        gap: 'large',
        variant: 'full-width',
        textColor: 'white'
      },
      background: {
        type: 'image',
        image: {
          url: 'https://www.wiley.com/content/dam/wiley-com/en/images/Photography/brand-and-hero/homepage/homepage-only-energy-burst-visual.jpg',
          position: 'center',
          repeat: 'no-repeat',
          size: 'cover'
        },
        opacity: 1
      },
      contentMode: 'dark'
    },
    // About Wiley Section
    {
      id: nanoid(),
      name: 'About Wiley + Partners',
      type: 'content-block',
      layout: 'one-column',
      areas: [
        {
          id: nanoid(),
          name: 'Content',
          widgets: [
            {
              id: nanoid(),
              type: 'text',
              sectionId: '',
              skin: 'minimal',
              text: 'ABOUT WILEY',
              align: 'center',
              inlineStyles: 'font-size: 12px; font-weight: 600; letter-spacing: 2px; opacity: 0.6; margin-bottom: 16px;'
            },
            {
              id: nanoid(),
              type: 'heading',
              sectionId: '',
              skin: 'minimal',
              text: 'Transforming knowledge into impact',
              level: 2,
              align: 'center',
              style: 'default',
              color: 'default',
              size: 'auto',
              icon: { enabled: false, position: 'left', emoji: '' }
            },
            {
              id: nanoid(),
              type: 'text',
              sectionId: '',
              skin: 'minimal',
              text: 'We transform knowledge into actionable intelligence – accelerating scientific breakthroughs, supporting learning, and driving innovation that redefines fields and improves lives. Through access to trusted research, data, and AI-powered platforms, we\'re your partner in a world driven by curiosity and continuous discovery.',
              align: 'center',
              inlineStyles: 'font-size: 18px; line-height: 1.7; max-width: 900px; margin: 0 auto 32px auto;'
            },
            {
              id: nanoid(),
              type: 'button',
              sectionId: '',
              skin: 'minimal',
              text: 'LEARN MORE →',
              style: 'solid',
              color: 'color3',
              size: 'large',
              href: '#',
              target: '_self',
              align: 'center',
              icon: { enabled: false, position: 'left', emoji: '' }
            },
            {
              id: nanoid(),
              type: 'text',
              sectionId: '',
              skin: 'minimal',
              text: '<div style="margin-top: 64px; padding-top: 48px; border-top: 1px solid #D6D6D6;"><div style="display: flex; justify-content: center; align-items: center; gap: 48px; flex-wrap: wrap; opacity: 0.6;"><img src="/theme-assets/wiley-figma-ds-v2/logo-ebay.svg" alt="eBay" style="height: 32px; filter: grayscale(100%);"><img src="/theme-assets/wiley-figma-ds-v2/logo-cnn.svg" alt="CNN" style="height: 32px; filter: grayscale(100%);"><img src="/theme-assets/wiley-figma-ds-v2/logo-google.svg" alt="Google" style="height: 32px; filter: grayscale(100%);"><img src="/theme-assets/wiley-figma-ds-v2/logo-cisco.svg" alt="Cisco" style="height: 32px; filter: grayscale(100%);"><img src="/theme-assets/wiley-figma-ds-v2/logo-airbnb.svg" alt="Airbnb" style="height: 32px; filter: grayscale(100%);"><img src="/theme-assets/wiley-figma-ds-v2/logo-uber.svg" alt="UBER" style="height: 32px; filter: grayscale(100%);"></div></div>',
              align: 'center'
            }
          ]
        }
      ],
      styling: {
        paddingTop: '80px',
        paddingBottom: '80px',
        paddingLeft: '80px',
        paddingRight: '80px',
        gap: 'large',
        variant: 'full-width',
        textColor: 'default',
        maxWidth: '2xl'
      },
      background: {
        type: 'color',
        color: '#F8F8F5',
        opacity: 1
      },
      contentMode: 'light'
    },
    // Our Focus Card Grid
    {
      id: nanoid(),
      name: 'Card Grid',
      type: 'content-block',
      layout: 'header-plus-grid',
      areas: [
        {
          id: nanoid(),
          name: 'Header',
          widgets: [
            {
              id: nanoid(),
              skin: 'minimal',
              type: 'heading',
              text: 'Our Focus',
              level: 2,
              align: 'center',
              style: 'hero',
              color: 'default',
              size: 'auto',
              icon: { enabled: false, position: 'left', emoji: '🎯' },
              sectionId: ''
            }
          ]
        },
        {
          id: nanoid(),
          name: 'Left Card',
          widgets: [
            {
              id: nanoid(),
              type: 'heading',
              sectionId: '',
              skin: 'minimal',
              text: 'AI in Research',
              level: 3,
              align: 'left',
              style: 'hero',
              color: 'default',
              size: 'auto',
              icon: { enabled: false, position: 'left', emoji: '' }
            },
            {
              id: nanoid(),
              type: 'text',
              sectionId: '',
              skin: 'minimal',
              text: 'Explore how artificial intelligence is transforming research methodologies and accelerating discovery.',
              align: 'left'
            },
            {
              id: nanoid(),
              type: 'button',
              sectionId: '',
              skin: 'minimal',
              text: 'Learn More',
              href: '#',
              style: 'solid',
              color: 'color1',
              size: 'medium',
              align: 'left',
              icon: { enabled: false, position: 'right', emoji: '' }
            }
          ]
        },
        {
          id: nanoid(),
          name: 'Center Card',
          widgets: [
            {
              id: nanoid(),
              type: 'heading',
              sectionId: '',
              skin: 'minimal',
              text: 'Open Access',
              level: 3,
              align: 'left',
              style: 'hero',
              color: 'default',
              size: 'auto',
              icon: { enabled: false, position: 'left', emoji: '' }
            },
            {
              id: nanoid(),
              type: 'text',
              sectionId: '',
              skin: 'minimal',
              text: 'Making research freely available to accelerate knowledge sharing and global collaboration.',
              align: 'left'
            },
            {
              id: nanoid(),
              type: 'button',
              sectionId: '',
              skin: 'minimal',
              text: 'Explore OA',
              href: '#',
              style: 'solid',
              color: 'color1',
              size: 'medium',
              align: 'left',
              icon: { enabled: false, position: 'right', emoji: '' }
            }
          ]
        },
        {
          id: nanoid(),
          name: 'Right Card',
          widgets: [
            {
              id: nanoid(),
              type: 'heading',
              sectionId: '',
              skin: 'minimal',
              text: 'Future of Learning',
              level: 3,
              align: 'left',
              style: 'hero',
              color: 'default',
              size: 'auto',
              icon: { enabled: false, position: 'left', emoji: '' }
            },
            {
              id: nanoid(),
              type: 'text',
              sectionId: '',
              skin: 'minimal',
              text: 'Discover innovative approaches to education that prepare learners for tomorrow\'s challenges.',
              align: 'left'
            },
            {
              id: nanoid(),
              type: 'button',
              sectionId: '',
              skin: 'minimal',
              text: 'Read More',
              href: '#',
              style: 'solid',
              color: 'color1',
              size: 'medium',
              align: 'left',
              icon: { enabled: false, position: 'right', emoji: '' }
            }
          ]
        }
      ],
      padding: '64px',
      styling: {
        gap: 'large',
        variant: 'full-width',
        textColor: 'white'
      },
      background: {
        type: 'color',
        color: '#003b44',
        opacity: 1
      },
      contentMode: 'dark'
    },
    // Shop Today Section
    {
      id: nanoid(),
      name: 'Shop Today',
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
              text: 'Shop today',
              level: 2,
              align: 'left',
              style: 'default',
              color: 'default',
              size: 'auto',
              icon: { enabled: false, position: 'left', emoji: '' }
            },
            {
              id: nanoid(),
              type: 'text',
              sectionId: '',
              skin: 'minimal',
              text: 'A one-stop shop for textbooks, learning tools, and everyday books that power your success.',
              align: 'left',
              inlineStyles: 'margin-bottom: 32px; color: #5A5A5A;'
            }
          ]
        },
        {
          id: nanoid(),
          name: 'Left Card',
          widgets: [
            {
              id: nanoid(),
              type: 'heading',
              sectionId: '',
              skin: 'minimal',
              text: 'Books',
              level: 3,
              align: 'left',
              style: 'default',
              color: 'default',
              size: 'auto',
              icon: { enabled: false, position: 'left', emoji: '' }
            },
            {
              id: nanoid(),
              type: 'text',
              sectionId: '',
              skin: 'minimal',
              text: 'Learn, lead, grow, and succeed as a professional with our career and professional development titles, written by the most trusted and reputable authors in their fields.',
              align: 'left',
              inlineStyles: 'margin-top: 16px; margin-bottom: 24px; line-height: 1.6; color: #5A5A5A;'
            },
            {
              id: nanoid(),
              type: 'button',
              sectionId: '',
              skin: 'minimal',
              text: 'SHOP NOW →',
              href: '#',
              style: 'outline',
              color: 'color1',
              size: 'medium',
              align: 'left',
              icon: { enabled: false, position: 'right', emoji: '' }
            }
          ]
        },
        {
          id: nanoid(),
          name: 'Center Card',
          widgets: [
            {
              id: nanoid(),
              type: 'heading',
              sectionId: '',
              skin: 'minimal',
              text: 'Textbooks',
              level: 3,
              align: 'left',
              style: 'default',
              color: 'default',
              size: 'auto',
              icon: { enabled: false, position: 'left', emoji: '' }
            },
            {
              id: nanoid(),
              type: 'text',
              sectionId: '',
              skin: 'minimal',
              text: 'Open possibilities for your career with certifications in finance and business, accounting, and data science and analytics.',
              align: 'left',
              inlineStyles: 'margin-top: 16px; margin-bottom: 24px; line-height: 1.6; color: #5A5A5A;'
            },
            {
              id: nanoid(),
              type: 'button',
              sectionId: '',
              skin: 'minimal',
              text: 'SHOP NOW →',
              href: '#',
              style: 'outline',
              color: 'color1',
              size: 'medium',
              align: 'left',
              icon: { enabled: false, position: 'right', emoji: '' }
            }
          ]
        },
        {
          id: nanoid(),
          name: 'Right Card',
          widgets: [
            {
              id: nanoid(),
              type: 'heading',
              sectionId: '',
              skin: 'minimal',
              text: 'Courseware',
              level: 3,
              align: 'left',
              style: 'default',
              color: 'default',
              size: 'auto',
              icon: { enabled: false, position: 'left', emoji: '' }
            },
            {
              id: nanoid(),
              type: 'text',
              sectionId: '',
              skin: 'minimal',
              text: 'Take self-paced courses to advance your career and your salary.',
              align: 'left',
              inlineStyles: 'margin-top: 16px; margin-bottom: 24px; line-height: 1.6; color: #5A5A5A;'
            },
            {
              id: nanoid(),
              type: 'button',
              sectionId: '',
              skin: 'minimal',
              text: 'SHOP NOW →',
              href: '#',
              style: 'outline',
              color: 'color1',
              size: 'medium',
              align: 'left',
              icon: { enabled: false, position: 'right', emoji: '' }
            }
          ]
        }
      ],
      background: {
        type: 'color',
        color: '#F8F8F5',
        opacity: 1
      },
      styling: {
        paddingTop: '80px',
        paddingBottom: '80px',
        paddingLeft: '80px',
        paddingRight: '80px',
        gap: 'large',
        variant: 'full-width',
        textColor: 'default'
      },
      contentMode: 'light'
    }
  ]
}

/**
 * FEBS Press Homepage Stub (2025 version)
 * Uses Image widgets for journal covers - cleaner and more editable
 */
export function createFebsHomepageStub(): CanvasItemStub[] {
  return [
    // Journal Covers Grid - using Image widgets
    {
      id: "CIHTc5SHtnVW49IJgu3iK",
      name: "Section",
      type: "content-block",
      layout: "grid",
      areas: [
        {
          id: "fWtxqhou_GfoqQyyRvg2L",
          name: "Grid Items",
          widgets: [
            {
              id: "XsjMsJZvDNrmIiFm1nTOe",
              skin: "minimal",
              type: "image",
              src: "https://febs.onlinelibrary.wiley.com/cover/17424658",
              alt: "The FEBS Journal Cover",
              ratio: "auto",
              caption: "",
              link: "https://febs.onlinelibrary.wiley.com/journal/17424658",
              alignment: "center",
              width: "large",
              objectFit: "cover",
              sectionId: "CIHTc5SHtnVW49IJgu3iK"
            },
            {
              id: "lrBTbWxgqqeZzzbhQog5i",
              skin: "minimal",
              type: "image",
              src: "https://febs.onlinelibrary.wiley.com/cover/18733468",
              alt: "FEBS Letters Cover",
              ratio: "auto",
              caption: "",
              link: "https://febs.onlinelibrary.wiley.com/journal/18733468",
              alignment: "center",
              width: "large",
              objectFit: "cover",
              sectionId: "CIHTc5SHtnVW49IJgu3iK"
            },
            {
              id: "p3YfBqHQlvoTpktEHcHPt",
              skin: "minimal",
              type: "image",
              src: "https://febs.onlinelibrary.wiley.com/cover/18780261",
              alt: "Molecular Oncology Cover",
              ratio: "auto",
              caption: "",
              link: "https://febs.onlinelibrary.wiley.com/journal/18780261",
              alignment: "center",
              width: "large",
              objectFit: "cover",
              sectionId: "CIHTc5SHtnVW49IJgu3iK"
            },
            {
              id: "w7jbTQEw3qoiEqzo4Cfot",
              skin: "minimal",
              type: "image",
              src: "https://febs.onlinelibrary.wiley.com/cover/22115463",
              alt: "FEBS Open Bio Cover",
              ratio: "auto",
              caption: "",
              link: "https://febs.onlinelibrary.wiley.com/journal/22115463",
              alignment: "center",
              width: "large",
              objectFit: "cover",
              sectionId: "CIHTc5SHtnVW49IJgu3iK"
            }
          ]
        }
      ],
      gridConfig: {
        columns: 4,
        gap: "1rem",
        alignItems: "stretch",
        justifyItems: "stretch"
      },
      background: {
        type: "color",
        color: "#ffffff"
      }
    },
    // Highlights from FEBS Press Header
    {
      id: "qh1MnsaFY6tK81QC2bT7y",
      type: "content-block",
      name: "Highlights from FEBS Press",
      layout: "one-column",
      areas: [
        {
          id: "CzZO1YNbvhrM6ZNdjUpue",
          position: "center",
          widgets: [
            {
              id: "3oC_jmbi6knacm4DjaCL6",
              type: "heading",
              level: 2,
              text: "HIGHLIGHTS FROM FEBS PRESS",
              align: "left",
              style: "highlighted",
              sectionId: "qh1MnsaFY6tK81QC2bT7y",
              gridSpan: { column: "span 3" }
            }
          ]
        }
      ],
      backgroundColor: "#E3F2FD",
      padding: "large",
      contextAware: true
    },
    // Highlights Grid Section with HTML widget
    {
      id: "fwSmtaOEuPLKD7qWn5BF_",
      name: "Section",
      type: "content-block",
      layout: "grid",
      areas: [
        {
          id: "oHf81WQnumeozwzJ_jNN8",
          name: "Grid Items",
          widgets: [
            {
              id: "_U5y2Wf1eA8aB6TnAvTxE",
              type: "html",
              content: "",
              sectionId: "fwSmtaOEuPLKD7qWn5BF_",
              htmlContent: `<style>
.FEBS-highlights-press__item {
  border: 1px solid rgba(0, 0, 0, .125);
  box-shadow: 0 0 4px 0 rgba(0, 0, 0, .25);
  border-radius: 10px;
  padding: 10px;
  background-color: #fff;
  color: #707070;
  min-height: 300px;
}
a.febspresshighlights { color:#029ada; }
a.febspresshighlights:hover { color: #e5412c; }
</style>
<div class="FEBS-highlights-press__item FEBS-highlights-press__item--blue">
  <h3>The FEBS Journal</h3>
  <h4>Editor's Choice</h4>
  <p><a href="/doi/10.1111/febs.70172" class="febspresshighlights">Blood group O expression in normal tissues and tumors</a></p>
  <ul>
    <li>Ea Kristine Clarisse Tulin</li>
    <li>Richard D. Cummings</li>
    <li>and colleagues</li>
  </ul>
  <p>First published: 30/06/2025</p>
</div>`
            }
          ]
        }
      ],
      gridConfig: {
        columns: 4,
        gap: "1rem",
        alignItems: "stretch",
        justifyItems: "stretch"
      },
      background: {
        type: "color",
        color: "#C6E8FD"
      }
    },
    // FEBS Press News Header
    {
      id: "Onu3ES_zwAmobGg3RCA0f",
      name: "Section",
      type: "content-block",
      layout: "one-column",
      areas: [
        {
          id: "QFXG7FQK7Wm2zhskey6LA",
          name: "Content",
          widgets: [
            {
              id: "lrLCSxsXT3-mVQSP0rwJP",
              type: "heading",
              level: 2,
              text: "FEBS PRESS NEWS",
              align: "left",
              style: "highlighted",
              sectionId: "Onu3ES_zwAmobGg3RCA0f",
              gridSpan: { column: "span 3" }
            }
          ]
        }
      ]
    },
    // Editorial Cards Section
    {
      id: "tuJxphcTQQWPNYWqPP5_z",
      name: "Section",
      type: "content-block",
      layout: "flexible",
      areas: [
        {
          id: "0DaPVY49rrXQfPdQ2ICfb",
          name: "Flex Items",
          widgets: [
            {
              id: "Ea1hHzW23VF3hllmE6O-F",
              skin: "minimal",
              type: "editorial-card",
              layout: "split",
              content: {
                preheader: { enabled: true, text: "31/01/2025" },
                headline: { enabled: true, text: "FEBS Press supports the Milan Declaration on the Crucial Role of Science in meeting Global Challenges" },
                description: { enabled: true, text: "The various global challenges encountered by all countries necessitate prioritizing a seamless and genuine global scientific collaboration that is devoid of bias and prejudice. There is an increasing urgency to strengthen Science ethically and financially and to reaffirm our dedication to enduring values such as peace, freedom, security, human dignity, sustainable development, environmental protection, scientific and technological progress, as well as the fight against social exclusion and discrimination. Read the basic principles of the Milan Declaration on the Crucial Role of Science in meeting Global Challenges and sign the petition to support the cause." },
                callToAction: { enabled: false, text: "Learn more", url: "#", type: "button" }
              },
              image: { src: "https://febs.onlinelibrary.wiley.com/pb-assets/MILAN%20DECLARATION_CALL%20TO%20ACTION%20BANNER%201800%20x%201800-1738744740.png", alt: "Editorial card image" },
              config: { contentAlignment: "left", imagePosition: "left", overlayOpacity: 60, useAccentColor: true },
              sectionId: "tuJxphcTQQWPNYWqPP5_z"
            },
            {
              id: "xIT_JYcaUgYlYEQzXPvwB",
              skin: "minimal",
              type: "editorial-card",
              layout: "split",
              content: {
                preheader: { enabled: true, text: "12/17/2024" },
                headline: { enabled: true, text: "The FEBS Journal Announces Richard Perham Prize Winners 2024" },
                description: { enabled: true, text: "The 2024 Richard Perham Prize is awarded to co-first authors Matteo Brindisi and Luca Frattaruolo, and co-corresponding authors Federica Sotgia, Michael P Lisanti and Anna Rita Cappello for their outstanding article 'New Insights into cholesterol-mediated ERRα activation in breast cancer progression and pro-tumoral microenvironment orchestration' published in 2023. The monetary award will be shared equally between first authors Matteo Brindisi and Luca Frattaruolo." },
                callToAction: { enabled: false, text: "Learn more", url: "#", type: "button" }
              },
              image: { src: "https://www.febs.org/wp-content/uploads/2024/03/FEBS-News-journals-awards-1-1024x577.jpg", alt: "Editorial card image" },
              config: { contentAlignment: "left", imagePosition: "left", overlayOpacity: 60, useAccentColor: true },
              sectionId: "tuJxphcTQQWPNYWqPP5_z"
            },
            {
              id: "U85KFzQ-YhM4ObBITUssU",
              skin: "minimal",
              type: "editorial-card",
              layout: "split",
              content: {
                preheader: { enabled: true, text: "16/10/2024" },
                headline: { enabled: true, text: "Announcing the Nobel Prize Collection: Seminal papers from across FEBS Press" },
                description: { enabled: true, text: "FEBS Press is proud to present the Nobel Prize Collection, a broad reading list of seminal papers published across our four journals in research areas that have earned the Nobel Prize in recent years. From basic cell biology to the discovery of molecular systems, from microbiology to new technologies increasing the speed and precision of research and therapy, the Nobel Prizes celebrate breakthroughs that can be harnessed for the benefit of society. We wish to acknowledge the Nobel laureates by offering this virtual issue, which we feel will be of high interest to the scientific community, featuring some articles authored by the laureates themselves." },
                callToAction: { enabled: false, text: "Learn more", url: "#", type: "button" }
              },
              image: { src: "https://febs.onlinelibrary.wiley.com/pb-assets/hub-assets/febs/vi-images/Nobel-febs-1729158752150.jpg", alt: "Editorial card image" },
              config: { contentAlignment: "left", imagePosition: "left", overlayOpacity: 60, useAccentColor: true },
              sectionId: "tuJxphcTQQWPNYWqPP5_z"
            },
            {
              id: "PmHfa69_3lQWMTCF6a9rm",
              skin: "minimal",
              type: "editorial-card",
              layout: "split",
              content: {
                preheader: { enabled: true, text: "27/09/2024" },
                headline: { enabled: true, text: "FEBS Press partners with Dryad to support open data sharing" },
                description: { enabled: true, text: "As a firm advocate for open science, FEBS Press is happy to announce a new partnership with Dryad, a community-based, not-for-profit open data publishing platform that enables curation, open sharing, and reuse of research data. \"We are certain that the integration of Dryad in our publishing workflow will ensure the trustworthiness and reproducibility of large datasets connected to the articles published in our journals\", says Daniela Ruffell, FEBS Press Publisher. Read the full press release on the FEBS Network." },
                callToAction: { enabled: false, text: "Learn more", url: "#", type: "button" }
              },
              image: { src: "https://images.zapnito.com/cdn-cgi/image/metadata=copyright,fit=scale-down,format=auto,quality=95,width=750/https://images.zapnito.com/users/356864/posters/a9987ae6-351c-4610-bc99-cebafafc9da1_large.png", alt: "Editorial card image" },
              config: { contentAlignment: "left", imagePosition: "left", overlayOpacity: 60, useAccentColor: true },
              sectionId: "tuJxphcTQQWPNYWqPP5_z"
            },
            {
              id: "P81PBF0HJR-z1ZTyj7ZN_",
              skin: "minimal",
              type: "editorial-card",
              layout: "split",
              content: {
                preheader: { enabled: true, text: "04/12/2023" },
                headline: { enabled: true, text: "FEBS Press journals join Review Commons" },
                description: { enabled: true, text: "We are pleased to announce that all four FEBS Press journals have now joined Review Commons, a preprint peer review platform which offers authors a peer review service ahead of submitting the paper to a journal. We are pleased to be part of this initiative to preserve the value of peer reviews and offer authors a streamlined route to publication of their work. Read the full EMBO press release, including the list of all affiliated journals and more information on Review Commons, on the EMBO website." },
                callToAction: { enabled: false, text: "Learn more", url: "#", type: "button" }
              },
              image: { src: "https://febs.onlinelibrary.wiley.com/pb-assets/hub-assets/febs/febs-letters/UTC-against-paper-mills-logo-rgb-1710844900807.jpg", alt: "Editorial card image" },
              config: { contentAlignment: "left", imagePosition: "left", overlayOpacity: 60, useAccentColor: true },
              sectionId: "tuJxphcTQQWPNYWqPP5_z"
            },
            {
              id: "jqYplKLjBrBArTfLNGvb0",
              skin: "minimal",
              type: "editorial-card",
              layout: "split",
              content: {
                preheader: { enabled: true, text: "19/01/2024" },
                headline: { enabled: true, text: "International stakeholders join in action to stop paper mills" },
                description: { enabled: true, text: "We are proud to announce that FEBS Press has joined United2Act, an initiative supported by the Committee on Publication Ethics (COPE) and STM, an international association of scholarly publishers. United2Act represents international stakeholders working collaboratively to address the cumulative challenge of paper mills in scholarly publishing." },
                callToAction: { enabled: false, text: "Learn more", url: "#", type: "button" }
              },
              image: { src: "https://febs.onlinelibrary.wiley.com/pb-assets/hub-assets/febs/febs-letters/logo-Review_Commons-colour-RGB-1710844900790.png", alt: "Editorial card image" },
              config: { contentAlignment: "left", imagePosition: "left", overlayOpacity: 60, useAccentColor: true },
              sectionId: "tuJxphcTQQWPNYWqPP5_z"
            }
          ]
        }
      ],
      flexConfig: {
        direction: "column",
        wrap: true,
        justifyContent: "flex-start",
        gap: "1rem"
      },
      background: {
        type: "color",
        color: "#ffffff"
      }
    },
    // FEBS Network Content Section
    {
      id: "cihae9fDZe89H6THBknxp",
      name: "Section",
      type: "content-block",
      layout: "one-column",
      areas: [
        {
          id: "6fu7bETO61DjmzCkO9T8q",
          name: "Content",
          widgets: [
            {
              id: "Wje4eARC_ZQ4FaULqrH03",
              skin: "minimal",
              type: "divider",
              style: "solid",
              thickness: "1px",
              color: "#e5e7eb",
              marginTop: "1rem",
              marginBottom: "1rem",
              sectionId: "cihae9fDZe89H6THBknxp"
            },
            {
              id: "47DjFH0Ks05gM_JzgLKMG",
              type: "heading",
              level: 2,
              text: "CONTENT FROM THE FEBS NETWORK",
              align: "left",
              style: "highlighted",
              sectionId: "cihae9fDZe89H6THBknxp",
              gridSpan: { column: "span 3" }
            },
            {
              id: "YxX0nEK2E1IT3l7Hg-uNb",
              skin: "minimal",
              type: "text",
              text: "The FEBS Network is an online international forum from FEBS for scientists working in the molecular and cellular life sciences which is free to join. Here is a sample of content available.",
              align: "left",
              sectionId: "cihae9fDZe89H6THBknxp"
            },
            {
              id: "-NS6MaJbguKrMb1XSSUBj",
              skin: "minimal",
              type: "divider",
              style: "solid",
              thickness: "1px",
              color: "#e5e7eb",
              marginTop: "1rem",
              marginBottom: "1rem",
              sectionId: "cihae9fDZe89H6THBknxp"
            },
            {
              id: "Oh-oX48PPFJ2nYIkf-jpI",
              skin: "minimal",
              type: "text",
              text: "Early Career Scientist Channel",
              align: "left",
              sectionId: "cihae9fDZe89H6THBknxp",
              inlineStyles: "font-weight: 800"
            },
            {
              id: "8NmF8u150WXcbNZyVASws",
              skin: "minimal",
              type: "divider",
              style: "solid",
              thickness: "1px",
              color: "#e5e7eb",
              marginTop: "1rem",
              marginBottom: "1rem",
              sectionId: "cihae9fDZe89H6THBknxp"
            },
            {
              id: "qgM5FPhj_JBnIp-6L0zwk",
              skin: "minimal",
              type: "text",
              text: "Viewpoints Channel",
              align: "left",
              sectionId: "cihae9fDZe89H6THBknxp",
              inlineStyles: "font-weight: 800"
            },
            {
              id: "8Jc_OVa5OWYiicAAjCtt5",
              skin: "minimal",
              type: "divider",
              style: "solid",
              thickness: "1px",
              color: "#e5e7eb",
              marginTop: "1rem",
              marginBottom: "1rem",
              sectionId: "cihae9fDZe89H6THBknxp"
            },
            {
              id: "hJFi4XT8uzSWahjD1LplF",
              skin: "minimal",
              type: "text",
              text: "Research Channel",
              align: "left",
              sectionId: "cihae9fDZe89H6THBknxp",
              inlineStyles: "font-weight: 800"
            }
          ]
        }
      ]
    }
  ]
}

// =============================================================================
// STUB-BASED PAGES (one-off, no inheritance)
// =============================================================================

/**
 * Classic Theme Default Website Homepage Stub
 * This is the default homepage stub for the Classic theme (classic-ux3-theme)
 * Used as the base template for Classic-themed websites
 * @param websiteId - The website ID for generating correct URLs
 * @param journals - Optional array of journals to display in Featured Journals section
 */
export function createCatalystHomepageStub(websiteId: string = 'catalyst-demo', journals: JournalStubData[] = []): CanvasItemStub[] {
  // Default to Catalyst journals if none provided
  const defaultJournals: JournalStubData[] = [
    { id: 'jas', name: 'Journal of Advanced Science', description: 'Publishing groundbreaking research across all scientific disciplines since 1985. Impact Factor: 4.5', issn: { print: '1234-5678' } },
    { id: 'oab', name: 'Open Access Biology', description: 'Freely accessible research in biological sciences, genomics, and ecology. All articles are Gold Open Access.', issn: { online: '2345-6789' }, isOpenAccess: true },
    { id: 'hcq', name: 'Historical Chemistry Quarterly', description: 'Complete archive of chemical research publications from 1920-2020. A valuable historical resource.', issn: { print: '3456-7890' }, isDiscontinued: true }
  ]
  
  const journalsToUse = journals.length > 0 ? journals : defaultJournals
  // Take up to 3 journals for Featured Journals section
  const featuredJournals = journalsToUse.slice(0, 3)
  const featuredJournalsSectionId = nanoid()
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
              href: `/live/${websiteId}/journals`,
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
              href: `/live/${websiteId}/search`,
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
      id: featuredJournalsSectionId,
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
        // Dynamically generate journal cards (up to 3)
        ...featuredJournals.map((journal, index) => {
          const areaNames = ['Left Card', 'Center Card', 'Right Card']
          return {
            id: nanoid(),
            name: areaNames[index] || `Journal Card ${index + 1}`,
            widgets: [
              {
                id: nanoid(),
                skin: 'minimal',
                type: 'editorial-card',
                layout: 'split',
                content: {
                  preheader: { 
                    enabled: Boolean(journal.isOpenAccess || journal.isDiscontinued), 
                    text: journal.isOpenAccess ? 'Open Access' : (journal.isDiscontinued ? 'Archive' : '') 
                  },
                  headline: { enabled: true, text: journal.name },
                  description: { 
                    enabled: true, 
                    text: journal.description || `Research journal.${journal.impactFactor ? ` Impact Factor: ${journal.impactFactor}` : ''}`
                  },
                  callToAction: { 
                    enabled: true, 
                    text: journal.isDiscontinued ? 'View Archive →' : 'Explore Journal', 
                    url: `/live/${websiteId}/journal/${journal.id}`, 
                    type: 'link' 
                  }
                },
                image: { 
                  src: `https://picsum.photos/800/600?random=${journal.id}-home`, 
                  alt: `${journal.name} Cover` 
                },
                config: { contentAlignment: 'left', imagePosition: 'top', overlayOpacity: 60, useAccentColor: true },
                sectionId: ''
              }
            ]
          }
        })
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
                showThumbnail: false,
                thumbnailPosition: 'left',
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
                showAffiliations: false,
                showAbstract: false,
                abstractLength: 'medium',
                showKeywords: false,
                showAccessStatus: true,
                showViewDownloadOptions: true,
                showUsageMetrics: false,
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
// Type for journal data passed to the stub
export interface JournalStubData {
  id: string
  name: string
  acronym?: string
  description?: string
  issn?: { print?: string; online?: string }
  isOpenAccess?: boolean
  isDiscontinued?: boolean
  impactFactor?: number
  branding?: { primaryColor?: string }
}

// Generate a journal card for the browse page
function createJournalCard(journal: JournalStubData, websiteId: string, sectionId: string) {
  const issnText = journal.issn?.online || journal.issn?.print || ''
  const prefix = journal.isOpenAccess ? 'Open Access' : (journal.isDiscontinued ? 'Archive' : '')
  const preheaderText = prefix ? `${prefix} • ISSN: ${issnText}` : `ISSN: ${issnText}`
  const ctaText = journal.isDiscontinued ? 'View Archive →' : 'View Journal →'
  
  return {
    id: nanoid(),
    name: `${journal.name} Card`,
    widgets: [
      {
        id: nanoid(),
        skin: 'minimal',
        type: 'editorial-card',
        layout: 'split',
        content: {
          preheader: { enabled: true, text: preheaderText },
          headline: { enabled: true, text: journal.name },
          description: { 
            enabled: true, 
            text: journal.description || `Research journal.${journal.impactFactor ? ` Impact Factor: ${journal.impactFactor}` : ''}`
          },
          callToAction: { enabled: true, text: ctaText, url: `/live/${websiteId}/journal/${journal.id}`, type: 'link' }
        },
        image: { 
          src: `https://picsum.photos/800/600?random=${journal.id}-browse`, 
          alt: `${journal.name} Cover` 
        },
        config: { contentAlignment: 'left', imagePosition: 'top', overlayOpacity: 60, useAccentColor: true },
        sectionId
      }
    ]
  }
}

export function createJournalsBrowseStub(websiteId: string = 'catalyst-demo', journals: JournalStubData[] = []): CanvasItemStub[] {
  // Default to Catalyst journals if none provided
  const defaultJournals: JournalStubData[] = [
    { id: 'jas', name: 'Journal of Advanced Science', description: 'Publishing groundbreaking research across all scientific disciplines since 1985. Impact Factor: 4.5', issn: { print: '1234-5678' } },
    { id: 'oab', name: 'Open Access Biology', description: 'Freely accessible research in biological sciences, genomics, and ecology. All articles are Gold Open Access.', issn: { online: '2345-6789' }, isOpenAccess: true },
    { id: 'hcq', name: 'Historical Chemistry Quarterly', description: 'Complete archive of chemical research publications from 1920-2020. A valuable historical resource.', issn: { print: '3456-7890' }, isDiscontinued: true }
  ]
  
  const journalsToUse = journals.length > 0 ? journals : defaultJournals
  const gridSectionId = nanoid()
  
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
    // Journals Grid - dynamically generated
    {
      id: gridSectionId,
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
              sectionId: gridSectionId,
              skin: 'minimal',
              text: 'All Journals',
              level: 2,
              align: 'left',
              style: 'default'
            }
          ]
        },
        // Generate cards for each journal
        ...journalsToUse.map(journal => createJournalCard(journal, websiteId, gridSectionId))
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
 * Uses context-aware colors and publication-details with journal context
 * Structure: Journal Banner → Navigation → Content (2/3 Articles + 1/3 Sidebar)
 */
export function createJournalHomeTemplate(
  websiteId: string = 'catalyst-demo',
  context?: JournalContext
): CanvasItemStub[] {
  const journalId = context?.journal?.id || 'journal-id'
  const articles = context?.articles || []
  
  return [
    // Journal Banner with Publication Details (context source)
    {
      id: nanoid(),
      name: 'Journal Banner',
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
              type: 'publication-details',
              contentSource: 'context',
              publication: {},
              cardConfig: {
                showContentTypeLabel: false,
                showTitle: true,
                showSubtitle: false,
                showThumbnail: false,
                thumbnailPosition: 'left',
                showPublicationTitle: false,
                showVolumeIssue: false,
                showBookSeriesTitle: false,
                showChapterPages: false,
                showNumberOfIssues: true,
                showPublicationDate: true,
                showDOI: false,
                showISSN: true,
                showISBN: false,
                showAuthors: false,
                authorStyle: 'full',
                showAffiliations: false,
                showAbstract: true,
                abstractLength: 'medium',
                showKeywords: false,
                showAccessStatus: true,
                showViewDownloadOptions: false,
                showUsageMetrics: false,
                titleStyle: 'medium'
              },
              layout: 'default',
              sectionId: ''
            }
          ]
        }
      ],
      gridConfig: {
        columns: 1,
        gap: '1rem',
        alignItems: 'stretch',
        justifyItems: 'stretch'
      },
      background: {
        type: 'color',
        color: '{journal.branding.primaryColor}'
      },
      contentMode: 'dark'
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
                { id: nanoid(), label: 'Journal Home', url: `/live/${websiteId}/journal/{journal.id}`, target: '_self', order: 0 },
                { id: nanoid(), label: 'Current Issue', url: `/live/${websiteId}/journal/{journal.id}/toc/current`, target: '_self', order: 1 },
                { id: nanoid(), label: 'All Issues', url: `/live/${websiteId}/journal/{journal.id}/loi`, target: '_self', order: 2 },
                { id: nanoid(), label: 'Submit', url: `/live/${websiteId}/journal/{journal.id}/submit`, target: '_self', order: 3 },
                { id: nanoid(), label: 'About', url: `/live/${websiteId}/journal/{journal.id}/about`, target: '_self', order: 4 }
              ]
            }
          ]
        }
      ],
      background: { type: 'color', color: '#1E2939', opacity: 1 },
      styling: {
        paddingTop: 'small',
        paddingBottom: 'small',
        paddingLeft: 'medium',
        paddingRight: 'medium',
        gap: 'small',
        variant: 'full-width',
        textColor: 'default'
      },
      contentMode: 'dark'
    },
    // Main Content: Articles (2/3) + Sidebar (1/3)
    {
      id: nanoid(),
      name: 'Main Content',
      type: 'content-block',
      layout: 'one-third-right',
      areas: [
        {
          id: nanoid(),
          name: 'Left (2/3)',
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
            },
            {
              id: nanoid(),
              skin: 'minimal',
              type: 'publication-list',
              contentSource: 'dynamic-query',
              // journalId is kept for reference but journal context comes from page context at runtime
              journalId: journalId,
              // Convert articles to schema.org format as per PageBuilder-Widgets-Skill.md Rule 4
              // Publications must be in schema.org format (ScholarlyArticle with @type, headline, author array, etc.)
              publications: articles.map(article => {
                // Get citation data to convert to schema.org format
                const citation = getCitationByDOI(article.doi)
                if (citation) {
                  // Use citationToSchemaOrg for proper schema.org conversion
                  const schemaOrg = citationToSchemaOrg(citation)
                  // Enhance with additional metadata from article
                  return {
                    ...schemaOrg,
                    datePublished: article.publishedAt ? new Date(article.publishedAt).toISOString().split('T')[0] : schemaOrg.datePublished,
                    isAccessibleForFree: article.isOpenAccess || false,
                    // Add page range if available
                    ...(article.pageRange && (() => {
                      const pages = article.pageRange.split('-')
                      return pages.length === 2 
                        ? { pageStart: pages[0].trim(), pageEnd: pages[1].trim() }
                        : {}
                    })()),
                    // Additional metadata (not part of schema.org but useful)
                    citations: article.citations,
                    downloads: article.downloads
                  }
                }
                // Fallback: create schema.org object from article data
                return {
                  '@context': 'https://schema.org',
                  '@type': 'ScholarlyArticle',
                  headline: article.title,
                  name: article.title,
                  author: Array.isArray(article.authors) 
                    ? article.authors.map((name: string) => ({ '@type': 'Person', name }))
                    : article.authors ? [{ '@type': 'Person', name: article.authors }] : [],
                  abstract: article.abstract,
                  datePublished: article.publishedAt ? new Date(article.publishedAt).toISOString().split('T')[0] : undefined,
                  identifier: article.doi ? {
                    '@type': 'PropertyValue',
                    propertyID: 'DOI',
                    value: article.doi
                  } : undefined,
                  ...(article.pageRange && (() => {
                    const pages = article.pageRange.split('-')
                    return pages.length === 2 
                      ? { pageStart: pages[0].trim(), pageEnd: pages[1].trim() }
                      : {}
                  })()),
                  isAccessibleForFree: article.isOpenAccess || false,
                  citations: article.citations,
                  downloads: article.downloads
                }
              }),
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
        },
        {
          id: nanoid(),
          name: 'Right (1/3)',
          widgets: [
            {
              id: nanoid(),
              skin: 'minimal',
              type: 'text',
              text: '[Cover Image Placeholder]',
              align: 'left',
              sectionId: ''
            },
            {
              id: nanoid(),
              skin: 'minimal',
              type: 'text',
              text: '[Journal Metrics Placeholder]',
              align: 'left',
              sectionId: ''
            }
          ]
        }
      ]
    }
  ]
}

/**
 * Issue Archive (LOI) Page Template
 * Lists all issues for a journal
 */
export function createIssueArchiveTemplate(
  websiteId: string = 'catalyst-demo',
  context?: JournalContext
): CanvasItemStub[] {
  const journalName = context?.journal?.name || 'Journal Name'
  const journalId = context?.journal?.id || 'journal-id'
  const brandColor = context?.journal?.brandColor || '#6366f1'
  const brandColorLight = context?.journal?.brandColorLight || '#818cf8'
  
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
              text: journalName,
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
            { color: brandColor, position: '0%' },
            { color: brandColorLight, position: '100%' }
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
                { id: nanoid(), label: 'Home', url: `/live/${websiteId}/journal/${journalId}`, target: '_self', order: 0 },
                { id: nanoid(), label: 'Current Issue', url: `/live/${websiteId}/journal/${journalId}/toc/current`, target: '_self', order: 1 },
                { id: nanoid(), label: 'All Issues', url: `/live/${websiteId}/journal/${journalId}/loi`, target: '_self', order: 2 },
                { id: nanoid(), label: 'About', url: `/live/${websiteId}/journal/${journalId}/about`, target: '_self', order: 3 }
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
export function createIssueTocTemplate(
  websiteId: string = 'catalyst-demo',
  context?: JournalContext
): CanvasItemStub[] {
  const journalName = context?.journal?.name || 'Journal Name'
  const journalId = context?.journal?.id || 'journal-id'
  const brandColor = context?.journal?.brandColor || '#6366f1'
  const brandColorLight = context?.journal?.brandColorLight || '#818cf8'
  const issueName = context?.issue 
    ? `Volume ${context.issue.volume}, Issue ${context.issue.issue}` 
    : 'Volume X, Issue X'
  const articles = context?.articles || []
  
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
              text: journalName,
              level: 2,
              align: 'center',
              style: 'default',
              color: 'primary'
            },
            {
              id: nanoid(),
              type: 'heading',
              sectionId: '',
              skin: 'minimal',
              text: issueName,
              level: 1,
              align: 'center',
              style: 'hero'
            },
            {
              id: nanoid(),
              type: 'text',
              sectionId: '',
              skin: 'minimal',
              text: context?.issue ? `Published ${context.issue.year}` : 'Issue description',
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
            { color: brandColor, position: '0%' },
            { color: brandColorLight, position: '100%' }
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
                { id: nanoid(), label: 'Home', url: `/live/${websiteId}/journal/${journalId}`, target: '_self', order: 0 },
                { id: nanoid(), label: 'Current Issue', url: `/live/${websiteId}/journal/${journalId}/toc/current`, target: '_self', order: 1 },
                { id: nanoid(), label: 'All Issues', url: `/live/${websiteId}/journal/${journalId}/loi`, target: '_self', order: 2 },
                { id: nanoid(), label: 'About', url: `/live/${websiteId}/journal/${journalId}/about`, target: '_self', order: 3 }
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
              issueId: context?.issue?.id || 'issue-id',
              // Convert articles to schema.org format as per PageBuilder-Widgets-Skill.md Rule 4
              // Publications must be in schema.org format (ScholarlyArticle with @type, headline, author array, etc.)
              publications: articles.map(article => {
                // Get citation data to convert to schema.org format
                const citation = getCitationByDOI(article.doi)
                if (citation) {
                  // Use citationToSchemaOrg for proper schema.org conversion
                  const schemaOrg = citationToSchemaOrg(citation)
                  // Enhance with additional metadata from article
                  return {
                    ...schemaOrg,
                    datePublished: article.publishedAt ? new Date(article.publishedAt).toISOString().split('T')[0] : schemaOrg.datePublished,
                    isAccessibleForFree: article.isOpenAccess || false,
                    // Add page range if available
                    ...(article.pageRange && (() => {
                      const pages = article.pageRange.split('-')
                      return pages.length === 2 
                        ? { pageStart: pages[0].trim(), pageEnd: pages[1].trim() }
                        : {}
                    })()),
                    // Additional metadata (not part of schema.org but useful)
                    citations: article.citations,
                    downloads: article.downloads
                  }
                }
                // Fallback: create schema.org object from article data
                return {
                  '@context': 'https://schema.org',
                  '@type': 'ScholarlyArticle',
                  headline: article.title,
                  name: article.title,
                  author: Array.isArray(article.authors) 
                    ? article.authors.map((name: string) => ({ '@type': 'Person', name }))
                    : article.authors ? [{ '@type': 'Person', name: article.authors }] : [],
                  abstract: article.abstract,
                  datePublished: article.publishedAt ? new Date(article.publishedAt).toISOString().split('T')[0] : undefined,
                  identifier: article.doi ? {
                    '@type': 'PropertyValue',
                    propertyID: 'DOI',
                    value: article.doi
                  } : undefined,
                  ...(article.pageRange && (() => {
                    const pages = article.pageRange.split('-')
                    return pages.length === 2 
                      ? { pageStart: pages[0].trim(), pageEnd: pages[1].trim() }
                      : {}
                  })()),
                  isAccessibleForFree: article.isOpenAccess || false,
                  citations: article.citations,
                  downloads: article.downloads
                }
              }),
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
export function createArticleTemplate(
  _websiteId: string = 'catalyst-demo',
  context?: JournalContext
): CanvasItemStub[] {
  const journalName = context?.journal?.name || 'Journal Name'
  const article = context?.articles?.[0]
  const articleTitle = article?.title || 'Article Title'
  const articleAuthors = article?.authors?.join(', ') || 'Author names'
  const articleDoi = article?.doi || '10.xxxx/xxxxx'
  const isOpenAccess = article?.isOpenAccess || false
  
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
              text: isOpenAccess ? '🔓 Open Access Article' : 'Research Article',
              align: 'left'
            },
            {
              id: nanoid(),
              type: 'heading',
              sectionId: '',
              skin: 'minimal',
              text: articleTitle,
              level: 1,
              align: 'left',
              style: 'default'
            },
            {
              id: nanoid(),
              type: 'text',
              sectionId: '',
              skin: 'minimal',
              text: articleAuthors,
              align: 'left'
            },
            {
              id: nanoid(),
              type: 'text',
              sectionId: '',
              skin: 'minimal',
              text: `${journalName} • DOI: ${articleDoi}`,
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
 * Journal context for template pre-population
 */
export interface JournalContext {
  journal?: {
    id: string
    name: string
    description?: string
    brandColor?: string
    brandColorLight?: string
  }
  issue?: {
    id: string
    volume: number
    issue: number
    year: number
  }
  articles?: Array<{
    doi: string
    title: string
    authors: string[]
    abstract?: string
    publishedAt?: Date | string
    pageRange?: string
    isOpenAccess?: boolean
    citations?: number
    downloads?: number
  }>
}

/**
 * Get page stub by page type and website ID
 * Homepage is website-specific, other pages use generic stubs
 * Pass journals array for the journals browse page
 * Pass journalContext for journal-specific pages (journal-home, issue-archive, etc.)
 * Pass customStarterPages for journal pages that need base layer lookup
 */
export function getPageStub(
  pageType: PageType, 
  websiteId: string = 'catalyst-demo', 
  designId?: string,
  journals?: JournalStubData[],
  journalContext?: JournalContext
): CanvasItemStub[] {
  switch (pageType) {
    case 'home':
      return getHomepageStubForWebsite(websiteId, designId, journals)
    case 'journals':
      return createJournalsBrowseStub(websiteId, journals || [])
    case 'about':
      return createAboutStub()
    case 'search':
      return createSearchStub()
    case 'journal-home':
      return createJournalHomeTemplate(websiteId, journalContext)
    case 'issue-archive':
      return createIssueArchiveTemplate(websiteId, journalContext)
    case 'issue-toc':
      return createIssueTocTemplate(websiteId, journalContext)
    case 'article':
      return createArticleTemplate(websiteId, journalContext)
    default:
      return getHomepageStubForWebsite(websiteId, designId, journals)
  }
}

// Legacy alias for backward compatibility
export function createHomepageStub(): CanvasItemStub[] {
  return createCatalystHomepageStub('catalyst-demo', [])
}

// =============================================================================
// SECTION STUBS (for Section Library)
// =============================================================================

/**
 * Standard Header Section
 * Used across Catalyst and FEBS sites - most frequently modified section
 */
export function createStandardHeaderStub(): CanvasItemStub[] {
  return [
    {
      id: nanoid(),
      name: 'Standard Header',
      type: 'hero', // Use hero type to get white text on dark background
      layout: 'two-column',
      areas: [
        {
          id: nanoid(),
          name: 'Logo',
          widgets: [
            {
              id: nanoid(),
              type: 'heading',
              sectionId: '',
              skin: 'minimal',
              text: '🏛️ Publisher Name',
              level: 3,
              align: 'left',
              style: 'default'
            }
          ]
        },
        {
          id: nanoid(),
          name: 'Navigation',
          widgets: [
            {
              id: nanoid(),
              type: 'menu',
              sectionId: '',
              skin: 'minimal',
              menuType: 'global',
              style: 'horizontal',
              align: 'right',
              items: [
                { id: nanoid(), label: 'Home', url: '/', target: '_self' as const, order: 0 },
                { id: nanoid(), label: 'Journals', url: '/journals', target: '_self' as const, order: 1 },
                { id: nanoid(), label: 'About', url: '/about', target: '_self' as const, order: 2 },
                { id: nanoid(), label: 'Search', url: '/search', target: '_self' as const, order: 3 },
                { id: nanoid(), label: 'Sign In', url: '/login', target: '_self' as const, order: 4 }
              ]
            }
          ]
        }
      ],
      background: { type: 'color', color: '#1f2937', opacity: 1 },
      styling: {
        paddingTop: 'small',
        paddingBottom: 'small',
        paddingLeft: 'medium',
        paddingRight: 'medium',
        gap: 'medium',
        variant: 'full-width',
        textColor: 'white'
      }
    }
  ]
}

/**
 * Standard Footer Section
 * Used across Catalyst and FEBS sites - frequently modified for branding
 */
export function createStandardFooterStub(): CanvasItemStub[] {
  return [
    {
      id: nanoid(),
      name: 'Standard Footer',
      type: 'hero', // Use hero type to get white text on dark background
      layout: 'flexible',
      areas: [
        {
          id: nanoid(),
          name: 'Footer Links',
          widgets: [
            {
              id: nanoid(),
              type: 'heading',
              sectionId: '',
              skin: 'minimal',
              text: 'About',
              level: 4,
              align: 'left',
              style: 'default'
            },
            {
              id: nanoid(),
              type: 'menu',
              sectionId: '',
              skin: 'minimal',
              menuType: 'custom',
              style: 'vertical',
              items: [
                { id: nanoid(), label: 'About Us', url: '/about', target: '_self' as const, order: 0 },
                { id: nanoid(), label: 'Terms and Conditions', url: '/terms', target: '_self' as const, order: 1 },
                { id: nanoid(), label: 'Privacy Policy', url: '/privacy', target: '_self' as const, order: 2 }
              ]
            }
          ]
        },
        {
          id: nanoid(),
          name: 'Journals Links',
          widgets: [
            {
              id: nanoid(),
              type: 'heading',
              sectionId: '',
              skin: 'minimal',
              text: 'Journals',
              level: 4,
              align: 'left',
              style: 'default'
            },
            {
              id: nanoid(),
              type: 'menu',
              sectionId: '',
              skin: 'minimal',
              menuType: 'custom',
              style: 'vertical',
              items: [
                { id: nanoid(), label: 'Browse All Journals', url: '/journals', target: '_self' as const, order: 0 },
                { id: nanoid(), label: 'Submit Article', url: '/submit', target: '_self' as const, order: 1 },
                { id: nanoid(), label: 'Author Guidelines', url: '/guidelines', target: '_self' as const, order: 2 }
              ]
            }
          ]
        },
        {
          id: nanoid(),
          name: 'Connect Links',
          widgets: [
            {
              id: nanoid(),
              type: 'heading',
              sectionId: '',
              skin: 'minimal',
              text: 'Connect',
              level: 4,
              align: 'left',
              style: 'default'
            },
            {
              id: nanoid(),
              type: 'menu',
              sectionId: '',
              skin: 'minimal',
              menuType: 'custom',
              style: 'vertical',
              items: [
                { id: nanoid(), label: '📧 Contact Us', url: '/contact', target: '_self' as const, order: 0 },
                { id: nanoid(), label: '🐦 Twitter', url: 'https://twitter.com', target: '_blank' as const, order: 1 },
                { id: nanoid(), label: '💼 LinkedIn', url: 'https://linkedin.com', target: '_blank' as const, order: 2 }
              ]
            }
          ]
        }
      ],
      background: { type: 'color', color: '#1f2937', opacity: 1 },
      styling: {
        paddingTop: 'large',
        paddingBottom: 'medium',
        paddingLeft: 'medium',
        paddingRight: 'medium',
        gap: 'large',
        variant: 'full-width',
        textColor: 'white'
      }
    },
    // Copyright bar
    {
      id: nanoid(),
      name: 'Copyright Bar',
      type: 'hero', // Use hero type for white text on dark background
      layout: 'one-column',
      areas: [
        {
          id: nanoid(),
          name: 'Copyright',
          widgets: [
            {
              id: nanoid(),
              type: 'text',
              sectionId: '',
              skin: 'minimal',
              text: '© 2024 Publisher Name • Powered by Catalyst Publishing Platform',
              align: 'center'
            }
          ]
        }
      ],
      background: { type: 'color', color: '#111827', opacity: 1 },
      styling: {
        paddingTop: 'medium',
        paddingBottom: 'medium',
        paddingLeft: 'medium',
        paddingRight: 'medium',
        gap: 'none',
        variant: 'full-width',
        textColor: 'white'
      }
    }
  ]
}

/**
 * Notification Banner Section
 */
export function createNotificationBannerStub(): CanvasItemStub[] {
  return [
    {
      id: nanoid(),
      name: 'Notification Banner',
      type: 'content-block',
      layout: 'one-column',
      areas: [
        {
          id: nanoid(),
          name: 'Banner Content',
          widgets: [
            {
              id: nanoid(),
              type: 'text',
              sectionId: '',
              skin: 'minimal',
              text: '📢 Important announcement: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Click here for details →',
              align: 'center'
            }
          ]
        }
      ],
      background: { type: 'color', color: '#fef3c7', opacity: 1 },
      styling: {
        paddingTop: 'small',
        paddingBottom: 'small',
        paddingLeft: 'medium',
        paddingRight: 'medium',
        gap: 'none',
        variant: 'full-width',
        textColor: 'default'
      },
      // Overlay configuration - sticky at top
      overlay: {
        enabled: true,
        position: 'top',
        behavior: 'sticky',
        dismissible: true,
        showOnLoad: true,
        animation: 'slide'
      }
    }
  ]
}

/**
 * Cookie Consent Bar Section
 */
export function createCookieConsentStub(): CanvasItemStub[] {
  return [
    {
      id: nanoid(),
      name: 'Cookie Consent Bar',
      type: 'hero', // Use hero type for white text on dark background
      layout: 'one-column',
      areas: [
        {
          id: nanoid(),
          name: 'Consent Content',
          widgets: [
            {
              id: nanoid(),
              type: 'text',
              sectionId: '',
              skin: 'minimal',
              text: '🍪 We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies. Learn more →',
              align: 'center'
            }
          ]
        }
      ],
      background: { type: 'color', color: '#1f2937', opacity: 1 },
      styling: {
        paddingTop: 'small',
        paddingBottom: 'small',
        paddingLeft: 'medium',
        paddingRight: 'medium',
        gap: 'none',
        variant: 'full-width',
        textColor: 'white'
      },
      // Overlay configuration - fixed at bottom
      overlay: {
        enabled: true,
        position: 'bottom',
        behavior: 'fixed',
        dismissible: true,
        showOnLoad: true,
        animation: 'slide'
      }
    }
  ]
}

