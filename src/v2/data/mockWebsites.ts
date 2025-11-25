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
// WILEY PUBLISHING PLATFORM (Multi-Journal Website)
// ============================================================================

// Define journals
const journalOfScience = {
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
  isDiscontinued: false,
  branding: {
    primaryColor: '#1e40af',
    secondaryColor: '#3b82f6'
  },
  status: 'active' as const,
  createdAt: new Date('1985-01-01'),
  updatedAt: new Date('2024-11-25')
}

const openAccessBiology = {
  id: 'oab',
  name: 'Open Access Biology',
  acronym: 'OAB',
  description: 'Freely accessible research in biological sciences',
  issn: {
    online: '2234-5678'
  },
  impactFactor: 8.3,
  isOpenAccess: true,
  isDiscontinued: false,
  branding: {
    primaryColor: '#059669',
    secondaryColor: '#10b981'
  },
  status: 'active' as const,
  createdAt: new Date('2010-01-01'),
  updatedAt: new Date('2024-11-25')
}

const historicalChemistry = {
  id: 'hcq',
  name: 'Historical Chemistry Quarterly',
  acronym: 'HCQ',
  description: 'Archive of chemical research from 1920-2020',
  issn: {
    print: '0001-2345'
  },
  isOpenAccess: false,
  isDiscontinued: true,
  discontinuedDate: new Date('2020-12-31'),
  branding: {
    primaryColor: '#78716c',
    secondaryColor: '#a8a29e'
  },
  status: 'discontinued' as const,
  createdAt: new Date('1920-01-01'),
  updatedAt: new Date('2024-11-25')
}

// Journal of Advanced Science Pages
const journalScienceHome: Page = {
  id: 'jas-home',
  name: 'Journal Home',
  slug: 'jas/home',
  websiteId: 'wiley-platform',
  journalId: 'jas',
  status: 'published',
  
  composition: [
    {
      id: nanoid(),
      sharedSectionId: 'platform-header',
      variationKey: 'minimal',
      inheritFromTheme: false,
      divergenceCount: 0
    },
    {
      id: nanoid(),
      sharedSectionId: 'journal-banner',
      variationKey: 'full',
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
      sharedSectionId: 'footer-main',
      variationKey: 'compact',
      inheritFromTheme: true,
      divergenceCount: 0
    }
  ],
  
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-11-25'),
  publishedAt: new Date('2024-11-25')
}

const journalScienceArchive: Page = {
  id: 'jas-archive',
  name: 'Issue Archive',
  slug: 'jas/archive',
  websiteId: 'wiley-platform',
  journalId: 'jas',
  status: 'published',
  
  composition: [
    {
      id: nanoid(),
      sharedSectionId: 'platform-header',
      variationKey: 'minimal',
      inheritFromTheme: false,
      divergenceCount: 0
    },
    {
      id: nanoid(),
      sharedSectionId: 'journal-banner',
      variationKey: 'archive',
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
  
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-11-25'),
  publishedAt: new Date('2024-11-25')
}

const journalScienceIssue: Page = {
  id: 'jas-issue',
  name: 'Current Issue',
  slug: 'jas/issue/current',
  websiteId: 'wiley-platform',
  journalId: 'jas',
  status: 'published',
  
  composition: [
    {
      id: nanoid(),
      sharedSectionId: 'platform-header',
      variationKey: 'minimal',
      inheritFromTheme: false,
      divergenceCount: 0
    },
    {
      id: nanoid(),
      sharedSectionId: 'journal-banner',
      variationKey: 'issue',
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
      variationKey: 'compact',
      inheritFromTheme: true,
      divergenceCount: 0
    }
  ],
  
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-11-25'),
  publishedAt: new Date('2024-11-25')
}

const journalScienceArticle: Page = {
  id: 'jas-article',
  name: 'Article View',
  slug: 'jas/article/12345',
  websiteId: 'wiley-platform',
  journalId: 'jas',
  status: 'published',
  
  composition: [
    {
      id: nanoid(),
      sharedSectionId: 'platform-header',
      variationKey: 'minimal',
      inheritFromTheme: false,
      divergenceCount: 0
    },
    {
      id: nanoid(),
      sharedSectionId: 'journal-banner',
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
  
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-11-25'),
  publishedAt: new Date('2024-11-25')
}

// Open Access Biology Pages
const journalBiologyHome: Page = {
  id: 'oab-home',
  name: 'Journal Home',
  slug: 'oab/home',
  websiteId: 'wiley-platform',
  journalId: 'oab',
  status: 'published',
  
  composition: [
    {
      id: nanoid(),
      sharedSectionId: 'platform-header',
      variationKey: 'minimal',
      inheritFromTheme: false,
      divergenceCount: 0
    },
    {
      id: nanoid(),
      sharedSectionId: 'journal-banner',
      variationKey: 'full',
      inheritFromTheme: false,
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
      sharedSectionId: 'footer-main',
      variationKey: 'compact',
      inheritFromTheme: true,
      divergenceCount: 0
    }
  ],
  
  createdAt: new Date('2024-02-01'),
  updatedAt: new Date('2024-11-25'),
  publishedAt: new Date('2024-11-25')
}

const journalBiologyArchive: Page = {
  id: 'oab-archive',
  name: 'Issue Archive',
  slug: 'oab/archive',
  websiteId: 'wiley-platform',
  journalId: 'oab',
  status: 'published',
  
  composition: [
    {
      id: nanoid(),
      sharedSectionId: 'platform-header',
      variationKey: 'minimal',
      inheritFromTheme: false,
      divergenceCount: 0
    },
    {
      id: nanoid(),
      sharedSectionId: 'journal-banner',
      variationKey: 'archive',
      inheritFromTheme: false,
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
  updatedAt: new Date('2024-11-25'),
  publishedAt: new Date('2024-11-25')
}

// Historical Chemistry Pages
const journalChemistryHome: Page = {
  id: 'hc-home',
  name: 'Journal Home',
  slug: 'hcq/home',
  websiteId: 'wiley-platform',
  journalId: 'hcq',
  status: 'published',
  
  composition: [
    {
      id: nanoid(),
      sharedSectionId: 'platform-header',
      variationKey: 'minimal',
      inheritFromTheme: false,
      divergenceCount: 0
    },
    {
      id: nanoid(),
      sharedSectionId: 'journal-banner',
      variationKey: 'full',
      inheritFromTheme: false,
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
  
  createdAt: new Date('2024-03-01'),
  updatedAt: new Date('2024-11-25'),
  publishedAt: new Date('2024-11-25')
}

const journalChemistryArchive: Page = {
  id: 'hc-archive',
  name: 'Issue Archive',
  slug: 'hcq/archive',
  websiteId: 'wiley-platform',
  journalId: 'hcq',
  status: 'published',
  
  composition: [
    {
      id: nanoid(),
      sharedSectionId: 'platform-header',
      variationKey: 'minimal',
      inheritFromTheme: false,
      divergenceCount: 0
    },
    {
      id: nanoid(),
      sharedSectionId: 'journal-banner',
      variationKey: 'archive',
      inheritFromTheme: false,
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
  
  createdAt: new Date('2024-03-01'),
  updatedAt: new Date('2024-11-25'),
  publishedAt: new Date('2024-11-25')
}

// Create Wiley Publishing Platform Website
export const wileyPublishingPlatform: Website = {
  id: 'wiley-platform',
  name: 'Wiley Online Library',
  domain: 'onlinelibrary.wiley.com',
  themeId: 'foundation-theme-v1',
  status: 'active',
  
  sharedSections: [], // Journal-specific banners are in the global store with websiteId
  
  // Journals within this website
  journals: [
    journalOfScience,
    openAccessBiology,
    historicalChemistry
  ],
  
  // All pages (journal pages + platform pages)
  pages: [
    journalScienceHome, journalScienceArchive, journalScienceIssue, journalScienceArticle,
    journalBiologyHome, journalBiologyArchive,
    journalChemistryHome, journalChemistryArchive
  ],
  
  branding: {
    primaryColor: '#0073e6',
    secondaryColor: '#005bb5',
    logoUrl: 'https://febs.onlinelibrary.wiley.com/pb-assets/tmp-images/footer-logo-wiley-1510029248417.png',
    fontFamily: 'Inter'
  },
  
  createdAt: new Date('2000-01-01'),
  updatedAt: new Date('2024-11-25')
}

// ============================================================================
// EXPORTS
// ============================================================================

export const mockWebsites: Website[] = [
  catalystDemoSite,
  febsPressSite,
  wileyPublishingPlatform
]

