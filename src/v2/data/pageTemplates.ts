/**
 * Page Templates - Reusable page compositions
 * 
 * These define the structure of different page types.
 * Content is populated via template variables at render time.
 */

import { nanoid } from 'nanoid'
import type { SectionCompositionItem } from '../types/core'

// ============================================================================
// PAGE TEMPLATE TYPES
// ============================================================================

export type PageTemplateType = 
  | 'homepage'
  | 'about'
  | 'search-results'
  | 'journals-browse'
  | 'journal-home'
  | 'issue-archive'
  | 'issue-toc'
  | 'article'

export interface PageTemplate {
  id: PageTemplateType
  name: string
  description: string
  composition: SectionCompositionItem[]
}

// ============================================================================
// TEMPLATE COMPOSITIONS
// ============================================================================

/**
 * Homepage Template
 * Used for: Website homepage
 */
export const homepageTemplate: PageTemplate = {
  id: 'homepage',
  name: 'Homepage',
  description: 'Main website landing page',
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
      variationKey: 'featured-journals',  // Shows journals grid
      inheritFromTheme: true,
      divergenceCount: 0
    },
    {
      id: nanoid(),
      sharedSectionId: 'content-blocks',
      variationKey: 'latest-articles',
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
  ]
}

/**
 * About Page Template
 */
export const aboutTemplate: PageTemplate = {
  id: 'about',
  name: 'About',
  description: 'About page with company/platform information',
  composition: [
    {
      id: nanoid(),
      sharedSectionId: 'header-main',
      variationKey: 'minimal',
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
  ]
}

/**
 * Search Results Template
 */
export const searchResultsTemplate: PageTemplate = {
  id: 'search-results',
  name: 'Search Results',
  description: 'Search results page with filters and publication list',
  composition: [
    {
      id: nanoid(),
      sharedSectionId: 'header-main',
      variationKey: 'minimal',
      inheritFromTheme: true,
      divergenceCount: 0
    },
    {
      id: nanoid(),
      sharedSectionId: 'search-header',
      variationKey: 'default',
      inheritFromTheme: true,
      divergenceCount: 0
    },
    {
      id: nanoid(),
      sharedSectionId: 'content-blocks',
      variationKey: 'search-results',  // Publication list with filters
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
  ]
}

/**
 * Journals Browse Template
 * URL: /journals
 */
export const journalsBrowseTemplate: PageTemplate = {
  id: 'journals-browse',
  name: 'Journals Browse',
  description: 'List of all journals on the platform',
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
      variationKey: 'browse-journals',
      inheritFromTheme: true,
      divergenceCount: 0
    },
    {
      id: nanoid(),
      sharedSectionId: 'content-blocks',
      variationKey: 'journals-grid',  // Grid of journal cards
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
  ]
}

/**
 * Journal Home Template
 * URL: /journal/:journalId
 * 
 * Uses template variables:
 * - {journal.name}, {journal.description}, {journal.issn.print}, etc.
 * - {journal.branding.primaryColor}
 */
export const journalHomeTemplate: PageTemplate = {
  id: 'journal-home',
  name: 'Journal Home',
  description: 'Journal landing page with latest articles and info',
  composition: [
    {
      id: nanoid(),
      sharedSectionId: 'header-main',
      variationKey: 'minimal',
      inheritFromTheme: true,
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
      sharedSectionId: 'journal-nav',
      variationKey: 'default',
      inheritFromTheme: true,
      divergenceCount: 0
    },
    {
      id: nanoid(),
      sharedSectionId: 'content-blocks',
      variationKey: 'latest-articles',
      inheritFromTheme: true,
      divergenceCount: 0
    },
    {
      id: nanoid(),
      sharedSectionId: 'content-blocks',
      variationKey: 'journal-sidebar',  // Current issue cover, metrics
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
  ]
}

/**
 * Issue Archive Template (List of Issues)
 * URL: /journal/:journalId/loi
 */
export const issueArchiveTemplate: PageTemplate = {
  id: 'issue-archive',
  name: 'Issue Archive',
  description: 'List of all issues for a journal',
  composition: [
    {
      id: nanoid(),
      sharedSectionId: 'header-main',
      variationKey: 'minimal',
      inheritFromTheme: true,
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
      sharedSectionId: 'journal-nav',
      variationKey: 'default',
      inheritFromTheme: true,
      divergenceCount: 0
    },
    {
      id: nanoid(),
      sharedSectionId: 'content-blocks',
      variationKey: 'issues-list',  // Grid/list of issues by volume
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
  ]
}

/**
 * Issue TOC Template (Table of Contents)
 * URL: /journal/:journalId/toc/:vol/:issue
 * 
 * Uses template variables:
 * - {journal.*}
 * - {issue.volume}, {issue.issue}, {issue.year}, {issue.title}
 */
export const issueTocTemplate: PageTemplate = {
  id: 'issue-toc',
  name: 'Issue TOC',
  description: 'Table of contents for a specific issue',
  composition: [
    {
      id: nanoid(),
      sharedSectionId: 'header-main',
      variationKey: 'minimal',
      inheritFromTheme: true,
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
      sharedSectionId: 'journal-nav',
      variationKey: 'default',
      inheritFromTheme: true,
      divergenceCount: 0
    },
    {
      id: nanoid(),
      sharedSectionId: 'issue-navigation',
      variationKey: 'default',  // Prev/Next issue, sections filter
      inheritFromTheme: true,
      divergenceCount: 0
    },
    {
      id: nanoid(),
      sharedSectionId: 'content-blocks',
      variationKey: 'articles-list',  // Publication list for this issue
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
  ]
}

/**
 * Article Page Template
 * URL: /journal/:journalId/article/:doi
 * 
 * Uses template variables:
 * - {journal.*}
 * - {article.title}, {article.authors}, {article.abstract}, etc.
 */
export const articleTemplate: PageTemplate = {
  id: 'article',
  name: 'Article',
  description: 'Single article view with full details',
  composition: [
    {
      id: nanoid(),
      sharedSectionId: 'header-main',
      variationKey: 'minimal',
      inheritFromTheme: true,
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
      sharedSectionId: 'article-header',
      variationKey: 'default',  // Title, authors, metrics
      inheritFromTheme: true,
      divergenceCount: 0
    },
    {
      id: nanoid(),
      sharedSectionId: 'article-content',
      variationKey: 'default',  // Abstract, full text sections
      inheritFromTheme: true,
      divergenceCount: 0
    },
    {
      id: nanoid(),
      sharedSectionId: 'article-sidebar',
      variationKey: 'default',  // Download options, related articles
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
  ]
}

// ============================================================================
// EXPORTS
// ============================================================================

export const pageTemplates: PageTemplate[] = [
  homepageTemplate,
  aboutTemplate,
  searchResultsTemplate,
  journalsBrowseTemplate,
  journalHomeTemplate,
  issueArchiveTemplate,
  issueTocTemplate,
  articleTemplate
]

/**
 * Get a page template by type
 */
export function getPageTemplate(type: PageTemplateType): PageTemplate | undefined {
  return pageTemplates.find(t => t.id === type)
}

/**
 * Clone a template's composition with fresh IDs
 */
export function cloneTemplateComposition(template: PageTemplate): SectionCompositionItem[] {
  return template.composition.map(item => ({
    ...item,
    id: nanoid()
  }))
}

