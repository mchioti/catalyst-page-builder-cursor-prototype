/**
 * Mock Websites & Pages - Testing data for V2
 */

import { nanoid } from 'nanoid'
import type { Website, Page, SectionCompositionItem } from '../types/core'

// ============================================================================
// CATALYST DEMO SITE
// ============================================================================

const catalystHomepage: Page = {
  id: 'catalyst-home',
  name: 'Homepage',
  slug: 'home',
  websiteId: 'catalyst-demo',
  status: 'published',
  
  composition: [
    {
      id: nanoid(),
      sharedSectionId: 'header-main',
      variationKey: 'full',
      inheritFromTheme: true,
      divergenceCount: 0
    },
    {
      id: nanoid(),
      sharedSectionId: 'hero-main',
      variationKey: 'centered',
      inheritFromTheme: true,
      divergenceCount: 0
    },
    {
      id: nanoid(),
      sharedSectionId: 'content-blocks',
      variationKey: 'grid',
      inheritFromTheme: true,
      divergenceCount: 0
    },
    {
      id: nanoid(),
      sharedSectionId: 'content-blocks',
      variationKey: 'two-column',
      inheritFromTheme: true,
      divergenceCount: 0
    },
    {
      id: nanoid(),
      sharedSectionId: 'footer-main',
      variationKey: 'full',
      inheritFromTheme: true,
      divergenceCount: 0
    }
  ],
  
  createdAt: new Date('2024-11-01'),
  updatedAt: new Date('2024-11-24'),
  publishedAt: new Date('2024-11-24')
}

const catalystAbout: Page = {
  id: 'catalyst-about',
  name: 'About',
  slug: 'about',
  websiteId: 'catalyst-demo',
  status: 'published',
  
  composition: [
    {
      id: nanoid(),
      sharedSectionId: 'header-main',
      variationKey: 'minimal',  // Different header variation
      inheritFromTheme: true,
      divergenceCount: 0
    },
    {
      id: nanoid(),
      sharedSectionId: 'hero-main',
      variationKey: 'minimal',
      inheritFromTheme: true,
      divergenceCount: 0
    },
    {
      id: nanoid(),
      sharedSectionId: 'content-blocks',
      variationKey: 'image-text',
      inheritFromTheme: true,
      divergenceCount: 0
    },
    {
      id: nanoid(),
      sharedSectionId: 'content-blocks',
      variationKey: 'text-only',
      inheritFromTheme: true,
      divergenceCount: 0
    },
    {
      id: nanoid(),
      sharedSectionId: 'footer-main',
      variationKey: 'compact',  // Different footer variation
      inheritFromTheme: true,
      divergenceCount: 0
    }
  ],
  
  createdAt: new Date('2024-11-01'),
  updatedAt: new Date('2024-11-24'),
  publishedAt: new Date('2024-11-24')
}

const catalystArticles: Page = {
  id: 'catalyst-articles',
  name: 'Articles',
  slug: 'articles',
  websiteId: 'catalyst-demo',
  status: 'draft',  // Not published yet
  
  composition: [
    {
      id: nanoid(),
      sharedSectionId: 'header-main',
      variationKey: 'full',
      inheritFromTheme: true,
      divergenceCount: 0
    },
    {
      id: nanoid(),
      sharedSectionId: 'hero-main',
      variationKey: 'minimal',
      inheritFromTheme: true,
      divergenceCount: 0
    },
    {
      id: nanoid(),
      sharedSectionId: 'content-blocks',
      variationKey: 'text-only',
      inheritFromTheme: true,
      divergenceCount: 0
    },
    {
      id: nanoid(),
      sharedSectionId: 'footer-main',
      variationKey: 'full',
      inheritFromTheme: true,
      divergenceCount: 0
    }
  ],
  
  createdAt: new Date('2024-11-20'),
  updatedAt: new Date('2024-11-24')
}

export const catalystDemoSite: Website = {
  id: 'catalyst-demo',
  name: 'Catalyst Demo Site',
  domain: 'catalyst-demo.local',
  themeId: 'foundation-theme-v1',
  status: 'active',
  
  sharedSections: [],  // No custom sections, using all from theme
  
  pages: [catalystHomepage, catalystAbout, catalystArticles],
  
  branding: {
    primaryColor: '#667eea',
    secondaryColor: '#764ba2',
    logoUrl: 'https://febs.onlinelibrary.wiley.com/pb-assets/tmp-images/footer-logo-wiley-1510029248417.png',
    fontFamily: 'Inter'
  },
  
  createdAt: new Date('2024-11-01'),
  updatedAt: new Date('2024-11-24')
}

// ============================================================================
// FEBS PRESS
// ============================================================================

const febsHomepage: Page = {
  id: 'febs-home',
  name: 'Homepage',
  slug: 'home',
  websiteId: 'febs-press',
  status: 'published',
  
  composition: [
    {
      id: nanoid(),
      sharedSectionId: 'header-main',
      variationKey: 'full',
      inheritFromTheme: false,  // Has modifications
      divergenceCount: 0,  // Will be calculated dynamically
      overrides: undefined  // No hardcoded overrides
    },
    {
      id: nanoid(),
      sharedSectionId: 'hero-main',
      variationKey: 'split',
      inheritFromTheme: true,
      divergenceCount: 0
    },
    {
      id: nanoid(),
      sharedSectionId: 'content-blocks',
      variationKey: 'two-column',
      inheritFromTheme: true,
      divergenceCount: 0
    },
    {
      id: nanoid(),
      sharedSectionId: 'footer-main',
      variationKey: 'full',
      inheritFromTheme: true,
      divergenceCount: 0
    }
  ],
  
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-11-24'),
  publishedAt: new Date('2024-11-20')
}

const febsSubmit: Page = {
  id: 'febs-submit',
  name: 'Submit Article',
  slug: 'submit',
  websiteId: 'febs-press',
  status: 'published',
  
  composition: [
    {
      id: nanoid(),
      sharedSectionId: 'header-main',
      variationKey: 'full',
      inheritFromTheme: true,
      divergenceCount: 0
    },
    {
      id: nanoid(),
      sharedSectionId: 'hero-main',
      variationKey: 'minimal',
      inheritFromTheme: true,
      divergenceCount: 0
    },
    {
      id: nanoid(),
      sharedSectionId: 'content-blocks',
      variationKey: 'text-only',
      inheritFromTheme: true,
      divergenceCount: 0
    },
    {
      id: nanoid(),
      sharedSectionId: 'footer-main',
      variationKey: 'compact',
      inheritFromTheme: true,
      divergenceCount: 0
    }
  ],
  
  createdAt: new Date('2024-02-01'),
  updatedAt: new Date('2024-11-24'),
  publishedAt: new Date('2024-11-20')
}

export const febsPressSite: Website = {
  id: 'febs-press',
  name: 'FEBS Press',
  domain: 'febspress.org',
  themeId: 'foundation-theme-v1',
  status: 'active',
  
  sharedSections: [],  // Could add website-specific sections here
  
  pages: [febsHomepage, febsSubmit],
  
  branding: {
    primaryColor: '#cc0000',
    secondaryColor: '#8b0000',
    logoUrl: 'https://febs.onlinelibrary.wiley.com/pb-assets/febs-custom-logo.png',
    fontFamily: 'Roboto'
  },
  
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-11-24')
}

// ============================================================================
// EXPORTS
// ============================================================================

export const mockWebsites: Website[] = [
  catalystDemoSite,
  febsPressSite
]

