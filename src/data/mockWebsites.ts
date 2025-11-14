import type { Website } from '../types'

export const mockWebsites: Website[] = [
  {
    id: 'wiley-main',
    name: 'Wiley Online Library',
    domain: 'https://onlinelibrary.wiley.com/',
    themeId: 'classic-ux3-theme',
    brandMode: 'wiley' as const,  // Brand mode for multi-brand themes
    status: 'active' as const,
    createdAt: new Date('2024-06-01'),
    updatedAt: new Date('2024-09-15'),
    modifications: [
      {
        path: 'branding.logo.src',
        originalValue: '/default-logo.svg',
        modifiedValue: '/wiley-logo.svg',
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
      }
    ],
    customSections: [],
    branding: {
      primaryColor: '#0066cc',
      secondaryColor: '#f8f9fa',
      logoUrl: '/wiley-logo.svg',
      fontFamily: 'Inter'
    },
    purpose: {
      contentTypes: ['journals', 'books'],
      hasSubjectOrganization: true,
      publishingTypes: ['academic', 'research']
    },
    deviationScore: 15,
    lastThemeSync: new Date('2024-08-01')
  },
  {
    id: 'journal-of-science',
    name: 'Journal of Advanced Science',
    domain: 'advancedscience.wiley.com',
    themeId: 'classic-ux3-theme',
    brandMode: 'wiley' as const,
    status: 'active' as const,
    createdAt: new Date('2024-08-15'),
    updatedAt: new Date('2024-09-25'),
    modifications: [
      {
        path: 'colors.accent',
        originalValue: '#10b981',
        modifiedValue: '#dc2626',
        modifiedAt: 'website',
        modifiedBy: 'editorial-team',
        timestamp: new Date('2024-08-20'),
        reason: 'Match journal brand colors'
      },
      {
        path: 'layout.hero.showFeaturedArticle',
        originalValue: 'false',
        modifiedValue: 'true',
        modifiedAt: 'website',
        modifiedBy: 'editorial-team',
        timestamp: new Date('2024-08-25'),
        reason: 'Highlight latest research'
      }
    ],
    customSections: [],
    branding: {
      primaryColor: '#dc2626',
      secondaryColor: '#f3f4f6',
      logoUrl: '/jas-logo.svg',
      fontFamily: 'Source Serif Pro'
    },
    purpose: {
      contentTypes: ['journals', 'conferences'],
      hasSubjectOrganization: true,
      publishingTypes: ['scientific', 'peer-reviewed']
    },
    deviationScore: 22,
    lastThemeSync: new Date('2024-09-10')
  }
]

