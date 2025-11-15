import type { Website } from '../types'

export const mockWebsites: Website[] = [
  {
    id: 'catalyst-demo-site',
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
    purpose: {
      contentTypes: ['journals', 'books'],
      hasSubjectOrganization: true,
      publishingTypes: ['academic', 'research']
    },
    deviationScore: 32,
    lastThemeSync: new Date('2024-08-01')
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
      primaryColor: '#00AB9F',  // FEBS teal from screenshots
      secondaryColor: '#f8f9fa',
      logoUrl: '/febs-logo.svg',
      fontFamily: 'Inter'
    },
    purpose: {
      contentTypes: ['journals'],
      hasSubjectOrganization: true,
      publishingTypes: ['scientific', 'open-access']
    },
    deviationScore: 0,  // No deviations yet
    lastThemeSync: new Date('2024-11-15')
  }
]

