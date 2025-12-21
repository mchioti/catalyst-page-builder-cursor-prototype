import type { Website } from '../types/templates'
import { createStandardHeaderPrefab, createStandardFooterPrefab } from '../components/PageBuilder/prefabSections'

// Create default site layout with standard header/footer
const createDefaultSiteLayout = () => ({
  headerEnabled: true,
  footerEnabled: true,
  header: [createStandardHeaderPrefab()],
  footer: [createStandardFooterPrefab()]
})

export const mockWebsites: Website[] = [
  {
    id: 'catalyst-demo',
    name: 'Catalyst Demo Site',
    domain: 'https://demo.catalyst-pb.com/',
    themeId: 'classic-ux3-theme',
    brandMode: 'wiley' as const,  // Brand mode for multi-brand themes
    status: 'active' as const,
    createdAt: new Date('2024-06-01'),
    updatedAt: new Date('2024-11-15'),
    modifications: [
      {
        path: 'branding.logo.src',
        originalValue: '/default-logo.svg',
        modifiedValue: '/catalyst-logo.svg',
        modifiedAt: 'website',
        modifiedBy: 'admin',
        timestamp: new Date('2024-06-01'),
        reason: 'Brand consistency'
      },
      {
        path: 'colors.primary',
        originalValue: '#1e40af',
        modifiedValue: '#0066cc',
        modifiedAt: 'website',
        modifiedBy: 'admin',
        timestamp: new Date('2024-06-15'),
        reason: 'Match brand guidelines'
      },
      {
        path: 'homepage.navigation.title',
        originalValue: 'Your Website Name',
        modifiedValue: 'Catalyst demo site',
        modifiedAt: 'website',
        modifiedBy: 'admin',
        timestamp: new Date('2024-11-01'),
        reason: 'Prototype-specific branding'
      },
      {
        path: 'homepage.hero.heading',
        originalValue: 'Welcome to Your Website',
        modifiedValue: 'Hero Section - Heading',
        modifiedAt: 'website',
        modifiedBy: 'admin',
        timestamp: new Date('2024-11-01'),
        reason: 'Demonstrate template structure for prototype'
      },
      {
        path: 'homepage.hero.description',
        originalValue: 'Add your hero message here. This is a Hero section that comes as part of the Classic-themed Homepage template. Edit this text to introduce your website to visitors.',
        modifiedValue: 'Catalyst is the name of the PB4 POV ie. this prototype. This is a Hero prefab section that comes as part of the default imaginary Classic-themed Homepage template design.',
        modifiedAt: 'website',
        modifiedBy: 'admin',
        timestamp: new Date('2024-11-01'),
        reason: 'Explain prototype purpose and demonstrate template modification'
      },
      {
        path: 'homepage.hero.primaryButton',
        originalValue: 'Get Started',
        modifiedValue: 'Primary Solid Button',
        modifiedAt: 'website',
        modifiedBy: 'admin',
        timestamp: new Date('2024-11-01'),
        reason: 'Show button variant naming for prototype documentation'
      },
      {
        path: 'homepage.hero.secondaryButton',
        originalValue: 'Learn More',
        modifiedValue: 'Secondary Solid Button',
        modifiedAt: 'website',
        modifiedBy: 'admin',
        timestamp: new Date('2024-11-01'),
        reason: 'Show button variant naming for prototype documentation'
      },
      {
        path: 'homepage.features.heading',
        originalValue: 'Featured Content',
        modifiedValue: 'Featured Section',
        modifiedAt: 'website',
        modifiedBy: 'admin',
        timestamp: new Date('2024-11-01'),
        reason: 'Clarify section naming for prototype'
      }
    ],
    customSections: [],
    branding: {
      primaryColor: '#0066cc',
      secondaryColor: '#f8f9fa',
      logoUrl: '/catalyst-logo.svg',
      fontFamily: 'Inter'
    },
    // Journals for this website
    journals: [
      {
        id: 'jas',
        name: 'Journal of Advanced Science',
        acronym: 'JAS',
        description: 'Publishing groundbreaking research in all fields of science since 1985',
        issn: {
          print: '1234-5678',
          online: '8765-4321'
        },
        impactFactor: 12.5,
        isOpenAccess: false,
        branding: {
          primaryColor: '#1e40af',
          secondaryColor: '#3b82f6'
        }
      },
      {
        id: 'oab',
        name: 'Open Access Biology',
        acronym: 'OAB',
        description: 'Freely accessible research in biological sciences',
        issn: {
          online: '2234-5678'
        },
        impactFactor: 8.3,
        isOpenAccess: true,
        branding: {
          primaryColor: '#059669',
          secondaryColor: '#10b981'
        }
      },
      {
        id: 'hcq',
        name: 'Historical Chemistry Quarterly',
        acronym: 'HCQ',
        description: 'Archive of chemical research from 1920-2020',
        issn: {
          print: '0001-2345'
        },
        isOpenAccess: false,
        isDiscontinued: true,
        branding: {
          primaryColor: '#78716c',
          secondaryColor: '#a8a29e'
        }
      }
    ],
    purpose: {
      contentTypes: ['journals', 'books'],
      hasSubjectOrganization: true,
      publishingTypes: ['academic', 'research']
    },
    deviationScore: 32,
    lastThemeSync: new Date('2024-08-01'),
    siteLayout: createDefaultSiteLayout()
  },
  {
    id: 'febs-press',
    name: 'FEBS Press',
    domain: 'https://febs.onlinelibrary.wiley.com/',
    themeId: 'classic-ux3-theme',
    brandMode: 'wiley' as const,
    status: 'staging' as const,
    createdAt: new Date('2024-11-15'),
    updatedAt: new Date('2024-11-15'),
    modifications: [],  // No modifications yet
    customSections: [],
    branding: {
      primaryColor: '#00B5FF',  // FEBS blue
      secondaryColor: '#E3E3E3',  // Light gray
      accentColor: '#C25338',  // Rust/terracotta
      logoUrl: '/febs-logo.svg',
      fontFamily: '"Open Sans", icomoon, sans-serif'
    },
    // FEBS Journals
    journals: [
      {
        id: 'febs-journal',
        name: 'The FEBS Journal',
        acronym: 'FEBSJ',
        description: 'Publishing high-quality research in molecular life sciences since 1967',
        issn: {
          print: '1742-464X',
          online: '1742-4658'
        },
        impactFactor: 5.5,
        isOpenAccess: false,
        branding: {
          primaryColor: '#00B5FF',
          secondaryColor: '#0077CC'
        }
      },
      {
        id: 'febs-letters',
        name: 'FEBS Letters',
        acronym: 'FEBSL',
        description: 'Rapid publication of short reports in molecular biosciences',
        issn: {
          print: '0014-5793',
          online: '1873-3468'
        },
        impactFactor: 3.9,
        isOpenAccess: false,
        branding: {
          primaryColor: '#7B1FA2',
          secondaryColor: '#9C27B0'
        }
      },
      {
        id: 'mol-oncology',
        name: 'Molecular Oncology',
        acronym: 'MO',
        description: 'Research on molecular and cellular mechanisms of cancer',
        issn: {
          online: '1878-0261'
        },
        impactFactor: 6.6,
        isOpenAccess: true,
        branding: {
          primaryColor: '#00B5FF',
          secondaryColor: '#E91E63'
        }
      }
    ],
    // Theme overrides applied via ThemeEditor (simulates user customization)
    themeOverrides: {
      colors: {
        primary: '#00B5FF',
        secondary: '#E3E3E3',
        accent: '#C25338'
      },
      typography: {
        headingFont: '"Open Sans", icomoon, sans-serif',
        bodyFont: '"Open Sans", icomoon, sans-serif'
      }
    },
    purpose: {
      contentTypes: ['journals'],
      hasSubjectOrganization: true,
      publishingTypes: ['scientific', 'open-access']
    },
    deviationScore: 0,  // No deviations yet
    lastThemeSync: new Date('2024-11-15'),
    siteLayout: createDefaultSiteLayout()
  }
]

