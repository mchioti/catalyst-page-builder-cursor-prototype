/**
 * Mock Websites & Pages - Testing data for V2
 */

import { nanoid } from 'nanoid'
import type { Website, Page } from '../types/core'
import { createStandardHeaderPrefab, createStandardFooterPrefab } from '../../components/PageBuilder/prefabSections'

// Create default site layout with standard header/footer
const createDefaultSiteLayout = () => ({
  headerEnabled: true,
  footerEnabled: true,
  header: [createStandardHeaderPrefab()],
  footer: [createStandardFooterPrefab()]
})

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

// ============================================================================
// FEBS JOURNALS (4 journals)
// ============================================================================

const theFebsJournal = {
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
  isDiscontinued: false,
  branding: {
    primaryColor: '#00B5FF',  // FEBS cyan blue
    secondaryColor: '#0077CC'
  },
  status: 'active' as const,
  createdAt: new Date('1967-01-01'),
  updatedAt: new Date('2024-12-01')
}

const febsLetters = {
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
  isDiscontinued: false,
  branding: {
    primaryColor: '#7B1FA2',  // FEBS purple
    secondaryColor: '#9C27B0'
  },
  status: 'active' as const,
  createdAt: new Date('1968-01-01'),
  updatedAt: new Date('2024-12-01')
}

const molecularOncology = {
  id: 'mol-oncology',
  name: 'Molecular Oncology',
  acronym: 'MO',
  description: 'Research on molecular and cellular mechanisms of cancer',
  issn: {
    online: '1878-0261'
  },
  impactFactor: 6.6,
  isOpenAccess: true,
  isDiscontinued: false,
  branding: {
    primaryColor: '#00B5FF',  // FEBS cyan blue
    secondaryColor: '#E91E63'
  },
  status: 'active' as const,
  createdAt: new Date('2007-01-01'),
  updatedAt: new Date('2024-12-01')
}

const febsOpenBio = {
  id: 'febs-open-bio',
  name: 'FEBS Open Bio',
  acronym: 'FOB',
  description: 'Open access journal for life science research',
  issn: {
    online: '2211-5463'
  },
  impactFactor: 2.8,
  isOpenAccess: true,
  isDiscontinued: false,
  branding: {
    primaryColor: '#1B5E20',  // FEBS green
    secondaryColor: '#4CAF50'
  },
  status: 'active' as const,
  createdAt: new Date('2011-01-01'),
  updatedAt: new Date('2024-12-01')
}

// FEBS Journal Pages
const febsJournalHome: Page = {
  id: 'febsj-home',
  name: 'Journal Home',
  slug: 'febs-journal/home',
  websiteId: 'febs-press',
  journalId: 'febs-journal',
  status: 'published',
  composition: [
    { id: nanoid(), sharedSectionId: 'header-main', variationKey: 'minimal', inheritFromTheme: true, divergenceCount: 0 },
    { id: nanoid(), sharedSectionId: 'journal-banner', variationKey: 'full', inheritFromTheme: true, divergenceCount: 0 },
    { id: nanoid(), sharedSectionId: 'content-blocks', variationKey: 'latest-articles', inheritFromTheme: true, divergenceCount: 0 },
    { id: nanoid(), sharedSectionId: 'footer-main', variationKey: 'compact', inheritFromTheme: true, divergenceCount: 0 }
  ],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-12-01'),
  publishedAt: new Date('2024-12-01')
}

const febsJournalArchive: Page = {
  id: 'febsj-archive',
  name: 'Issue Archive',
  slug: 'febs-journal/archive',
  websiteId: 'febs-press',
  journalId: 'febs-journal',
  status: 'published',
  composition: [
    { id: nanoid(), sharedSectionId: 'header-main', variationKey: 'minimal', inheritFromTheme: true, divergenceCount: 0 },
    { id: nanoid(), sharedSectionId: 'journal-banner', variationKey: 'archive', inheritFromTheme: true, divergenceCount: 0 },
    { id: nanoid(), sharedSectionId: 'content-blocks', variationKey: 'issues-list', inheritFromTheme: true, divergenceCount: 0 },
    { id: nanoid(), sharedSectionId: 'footer-main', variationKey: 'compact', inheritFromTheme: true, divergenceCount: 0 }
  ],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-12-01'),
  publishedAt: new Date('2024-12-01')
}

// FEBS Letters Pages
const febsLettersHome: Page = {
  id: 'febsl-home',
  name: 'Journal Home',
  slug: 'febs-letters/home',
  websiteId: 'febs-press',
  journalId: 'febs-letters',
  status: 'published',
  composition: [
    { id: nanoid(), sharedSectionId: 'header-main', variationKey: 'minimal', inheritFromTheme: true, divergenceCount: 0 },
    { id: nanoid(), sharedSectionId: 'journal-banner', variationKey: 'full', inheritFromTheme: true, divergenceCount: 0 },
    { id: nanoid(), sharedSectionId: 'content-blocks', variationKey: 'latest-articles', inheritFromTheme: true, divergenceCount: 0 },
    { id: nanoid(), sharedSectionId: 'footer-main', variationKey: 'compact', inheritFromTheme: true, divergenceCount: 0 }
  ],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-12-01'),
  publishedAt: new Date('2024-12-01')
}

const febsLettersArchive: Page = {
  id: 'febsl-archive',
  name: 'Issue Archive',
  slug: 'febs-letters/archive',
  websiteId: 'febs-press',
  journalId: 'febs-letters',
  status: 'published',
  composition: [
    { id: nanoid(), sharedSectionId: 'header-main', variationKey: 'minimal', inheritFromTheme: true, divergenceCount: 0 },
    { id: nanoid(), sharedSectionId: 'journal-banner', variationKey: 'archive', inheritFromTheme: true, divergenceCount: 0 },
    { id: nanoid(), sharedSectionId: 'content-blocks', variationKey: 'issues-list', inheritFromTheme: true, divergenceCount: 0 },
    { id: nanoid(), sharedSectionId: 'footer-main', variationKey: 'compact', inheritFromTheme: true, divergenceCount: 0 }
  ],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-12-01'),
  publishedAt: new Date('2024-12-01')
}

// Molecular Oncology Pages
const molOncologyHome: Page = {
  id: 'mo-home',
  name: 'Journal Home',
  slug: 'mol-oncology/home',
  websiteId: 'febs-press',
  journalId: 'mol-oncology',
  status: 'published',
  composition: [
    { id: nanoid(), sharedSectionId: 'header-main', variationKey: 'minimal', inheritFromTheme: true, divergenceCount: 0 },
    { id: nanoid(), sharedSectionId: 'journal-banner', variationKey: 'full', inheritFromTheme: true, divergenceCount: 0 },
    { id: nanoid(), sharedSectionId: 'content-blocks', variationKey: 'latest-articles', inheritFromTheme: true, divergenceCount: 0 },
    { id: nanoid(), sharedSectionId: 'footer-main', variationKey: 'compact', inheritFromTheme: true, divergenceCount: 0 }
  ],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-12-01'),
  publishedAt: new Date('2024-12-01')
}

const molOncologyArchive: Page = {
  id: 'mo-archive',
  name: 'Issue Archive',
  slug: 'mol-oncology/archive',
  websiteId: 'febs-press',
  journalId: 'mol-oncology',
  status: 'published',
  composition: [
    { id: nanoid(), sharedSectionId: 'header-main', variationKey: 'minimal', inheritFromTheme: true, divergenceCount: 0 },
    { id: nanoid(), sharedSectionId: 'journal-banner', variationKey: 'archive', inheritFromTheme: true, divergenceCount: 0 },
    { id: nanoid(), sharedSectionId: 'content-blocks', variationKey: 'issues-list', inheritFromTheme: true, divergenceCount: 0 },
    { id: nanoid(), sharedSectionId: 'footer-main', variationKey: 'compact', inheritFromTheme: true, divergenceCount: 0 }
  ],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-12-01'),
  publishedAt: new Date('2024-12-01')
}

// FEBS Open Bio Pages
const febsOpenBioHome: Page = {
  id: 'fob-home',
  name: 'Journal Home',
  slug: 'febs-open-bio/home',
  websiteId: 'febs-press',
  journalId: 'febs-open-bio',
  status: 'published',
  composition: [
    { id: nanoid(), sharedSectionId: 'header-main', variationKey: 'minimal', inheritFromTheme: true, divergenceCount: 0 },
    { id: nanoid(), sharedSectionId: 'journal-banner', variationKey: 'full', inheritFromTheme: true, divergenceCount: 0 },
    { id: nanoid(), sharedSectionId: 'content-blocks', variationKey: 'latest-articles', inheritFromTheme: true, divergenceCount: 0 },
    { id: nanoid(), sharedSectionId: 'footer-main', variationKey: 'compact', inheritFromTheme: true, divergenceCount: 0 }
  ],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-12-01'),
  publishedAt: new Date('2024-12-01')
}

const febsOpenBioArchive: Page = {
  id: 'fob-archive',
  name: 'Issue Archive',
  slug: 'febs-open-bio/archive',
  websiteId: 'febs-press',
  journalId: 'febs-open-bio',
  status: 'published',
  composition: [
    { id: nanoid(), sharedSectionId: 'header-main', variationKey: 'minimal', inheritFromTheme: true, divergenceCount: 0 },
    { id: nanoid(), sharedSectionId: 'journal-banner', variationKey: 'archive', inheritFromTheme: true, divergenceCount: 0 },
    { id: nanoid(), sharedSectionId: 'content-blocks', variationKey: 'issues-list', inheritFromTheme: true, divergenceCount: 0 },
    { id: nanoid(), sharedSectionId: 'footer-main', variationKey: 'compact', inheritFromTheme: true, divergenceCount: 0 }
  ],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-12-01'),
  publishedAt: new Date('2024-12-01')
}

export const febsPressSite: Website = {
  id: 'febs-press',
  name: 'FEBS Press',
  domain: 'febspress.org',
  themeId: 'foundation-theme-v1',
  status: 'active',
  
  sharedSections: [],
  
  // All FEBS pages including website pages and journal pages
  pages: [
    febsHomepage, 
    febsSubmit,
    febsJournalHome, febsJournalArchive,
    febsLettersHome, febsLettersArchive,
    molOncologyHome, molOncologyArchive,
    febsOpenBioHome, febsOpenBioArchive
  ],
  
  // FEBS journals
  journals: [theFebsJournal, febsLetters, molecularOncology, febsOpenBio],
  
  branding: {
    primaryColor: '#00B5FF',  // FEBS cyan blue
    secondaryColor: '#0077CC',
    logoUrl: 'https://febs.onlinelibrary.wiley.com/pb-assets/febs-custom-logo.png',
    fontFamily: 'Roboto'
  },
  
  // Default site layout with standard header and footer
  siteLayout: createDefaultSiteLayout(),
  
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-12-05')
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
  websiteId: 'catalyst-demo',
  journalId: 'jas',
  status: 'published',
  
  composition: [
    {
      id: nanoid(),
      sharedSectionId: 'header-main',
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
  websiteId: 'catalyst-demo',
  journalId: 'jas',
  status: 'published',
  
  composition: [
    {
      id: nanoid(),
      sharedSectionId: 'header-main',
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
  websiteId: 'catalyst-demo',
  journalId: 'jas',
  status: 'published',
  
  composition: [
    {
      id: nanoid(),
      sharedSectionId: 'header-main',
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
  websiteId: 'catalyst-demo',
  journalId: 'jas',
  status: 'published',
  
  composition: [
    {
      id: nanoid(),
      sharedSectionId: 'header-main',
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
  websiteId: 'catalyst-demo',
  journalId: 'oab',
  status: 'published',
  
  composition: [
    {
      id: nanoid(),
      sharedSectionId: 'header-main',
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
  websiteId: 'catalyst-demo',
  journalId: 'oab',
  status: 'published',
  
  composition: [
    {
      id: nanoid(),
      sharedSectionId: 'header-main',
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

const journalBiologyIssue: Page = {
  id: 'oab-issue',
  name: 'Current Issue',
  slug: 'oab/issue/current',
  websiteId: 'catalyst-demo',
  journalId: 'oab',
  status: 'published',
  
  composition: [
    {
      id: nanoid(),
      sharedSectionId: 'header-main',
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
  
  createdAt: new Date('2024-02-01'),
  updatedAt: new Date('2024-11-25'),
  publishedAt: new Date('2024-11-25')
}

const journalBiologyArticle: Page = {
  id: 'oab-article',
  name: 'Article View',
  slug: 'oab/article/67890',
  websiteId: 'catalyst-demo',
  journalId: 'oab',
  status: 'published',
  
  composition: [
    {
      id: nanoid(),
      sharedSectionId: 'header-main',
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
  
  createdAt: new Date('2024-02-01'),
  updatedAt: new Date('2024-11-25'),
  publishedAt: new Date('2024-11-25')
}

// Historical Chemistry Pages
const journalChemistryHome: Page = {
  id: 'hc-home',
  name: 'Journal Home',
  slug: 'hcq/home',
  websiteId: 'catalyst-demo',
  journalId: 'hcq',
  status: 'published',
  
  composition: [
    {
      id: nanoid(),
      sharedSectionId: 'header-main',
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
  websiteId: 'catalyst-demo',
  journalId: 'hcq',
  status: 'published',
  
  composition: [
    {
      id: nanoid(),
      sharedSectionId: 'header-main',
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

const journalChemistryIssue: Page = {
  id: 'hc-issue',
  name: 'Current Issue',
  slug: 'hcq/issue/current',
  websiteId: 'catalyst-demo',
  journalId: 'hcq',
  status: 'published',
  
  composition: [
    {
      id: nanoid(),
      sharedSectionId: 'header-main',
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
  
  createdAt: new Date('2024-03-01'),
  updatedAt: new Date('2024-11-25'),
  publishedAt: new Date('2024-11-25')
}

const journalChemistryArticle: Page = {
  id: 'hc-article',
  name: 'Article View',
  slug: 'hcq/article/54321',
  websiteId: 'catalyst-demo',
  journalId: 'hcq',
  status: 'published',
  
  composition: [
    {
      id: nanoid(),
      sharedSectionId: 'header-main',
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
  
  createdAt: new Date('2024-03-01'),
  updatedAt: new Date('2024-11-25'),
  publishedAt: new Date('2024-11-25')
}

// ============================================================================
// CATALYST DEMO SITE (with journals)
// ============================================================================

export const catalystDemoSite: Website = {
  id: 'catalyst-demo',
  name: 'Catalyst Demo Site',
  domain: 'catalyst-demo.local',
  themeId: 'foundation-theme-v1',
  status: 'active',
  
  sharedSections: [],  // No custom sections, using all from theme
  
  // Journals within this website
  journals: [
    journalOfScience,
    openAccessBiology,
    historicalChemistry
  ],
  
  // All pages (main pages + journal pages)
  pages: [
    catalystHomepage, 
    catalystAbout,
    // Journal pages
    journalScienceHome, journalScienceArchive, journalScienceIssue, journalScienceArticle,
    journalBiologyHome, journalBiologyArchive, journalBiologyIssue, journalBiologyArticle,
    journalChemistryHome, journalChemistryArchive, journalChemistryIssue, journalChemistryArticle
  ],
  
  branding: {
    primaryColor: '#667eea',
    secondaryColor: '#764ba2',
    logoUrl: 'https://febs.onlinelibrary.wiley.com/pb-assets/tmp-images/footer-logo-wiley-1510029248417.png',
    fontFamily: 'Inter'
  },
  
  // Default site layout with standard header and footer
  siteLayout: createDefaultSiteLayout(),
  
  createdAt: new Date('2024-11-01'),
  updatedAt: new Date('2024-11-24')
}

// ============================================================================
// EXPORTS
// ============================================================================

export const mockWebsites: Website[] = [
  catalystDemoSite,
  febsPressSite
]

// Export FEBS journals for direct access
export const febsJournals = [theFebsJournal, febsLetters, molecularOncology, febsOpenBio]

// Export all journals across all websites for lookup
export const allJournals = [
  // Catalyst Demo journals
  journalOfScience,
  openAccessBiology,
  historicalChemistry,
  // FEBS Press journals
  theFebsJournal,
  febsLetters,
  molecularOncology,
  febsOpenBio
]

// Helper to get journal by ID across all websites
export function getJournalById(journalId: string) {
  return allJournals.find(j => j.id === journalId)
}

// Helper to get website by journal ID
export function getWebsiteByJournalId(journalId: string): Website | undefined {
  return mockWebsites.find(site => 
    site.journals?.some(j => j.id === journalId)
  )
}

