/**
 * Mock Issues & Articles Data
 * Issues contain article references (DOIs)
 * Articles reference the real citations from citationData.ts
 */

import type { Issue, Article } from '../types/core'
import { getDOIsByDomain, getCitationByDOI } from '../../utils/citationData'

// ============================================================================
// MOCK ISSUES
// ============================================================================

// Get DOIs by domain for distribution across journals
const aiDois = getDOIsByDomain('ai-software')
const chemDois = getDOIsByDomain('chemistry')

// Journal of Advanced Science (JAS) - 4 issues
export const jasIssues: Issue[] = [
  {
    id: 'jas-vol24-issue4',
    journalId: 'jas',
    volume: 24,
    issue: 4,
    year: 2024,
    month: 12,
    coverImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop',
    articleDois: aiDois.slice(0, 4),  // First 4 AI articles
    isCurrentIssue: true,
    isSpecialIssue: false,
    publishedAt: new Date('2024-12-01'),
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date('2024-12-01')
  },
  {
    id: 'jas-vol24-issue3',
    journalId: 'jas',
    volume: 24,
    issue: 3,
    year: 2024,
    month: 9,
    articleDois: aiDois.slice(4, 8),  // Next 4 AI articles
    isCurrentIssue: false,
    isSpecialIssue: false,
    publishedAt: new Date('2024-09-01'),
    createdAt: new Date('2024-09-01'),
    updatedAt: new Date('2024-09-01')
  },
  {
    id: 'jas-vol24-issue2',
    journalId: 'jas',
    volume: 24,
    issue: 2,
    year: 2024,
    month: 6,
    title: 'Special Issue: AI in Scientific Discovery',
    articleDois: aiDois.slice(8, 11),  // 3 AI articles
    isCurrentIssue: false,
    isSpecialIssue: true,
    publishedAt: new Date('2024-06-01'),
    createdAt: new Date('2024-06-01'),
    updatedAt: new Date('2024-06-01')
  },
  {
    id: 'jas-vol24-issue1',
    journalId: 'jas',
    volume: 24,
    issue: 1,
    year: 2024,
    month: 3,
    articleDois: aiDois.slice(11, 14),  // Last 3 AI articles
    isCurrentIssue: false,
    isSpecialIssue: false,
    publishedAt: new Date('2024-03-01'),
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-01')
  }
]

// Open Access Biology (OAB) - 3 issues
export const oabIssues: Issue[] = [
  {
    id: 'oab-vol12-issue3',
    journalId: 'oab',
    volume: 12,
    issue: 3,
    year: 2024,
    month: 12,
    coverImageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=400&fit=crop',
    articleDois: chemDois.slice(0, 5),  // First 5 chemistry articles
    isCurrentIssue: true,
    isSpecialIssue: false,
    publishedAt: new Date('2024-12-01'),
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date('2024-12-01')
  },
  {
    id: 'oab-vol12-issue2',
    journalId: 'oab',
    volume: 12,
    issue: 2,
    year: 2024,
    month: 8,
    articleDois: chemDois.slice(5, 9),  // Next 4 chemistry articles
    isCurrentIssue: false,
    isSpecialIssue: false,
    publishedAt: new Date('2024-08-01'),
    createdAt: new Date('2024-08-01'),
    updatedAt: new Date('2024-08-01')
  },
  {
    id: 'oab-vol12-issue1',
    journalId: 'oab',
    volume: 12,
    issue: 1,
    year: 2024,
    month: 4,
    title: 'Sustainable Chemistry Special',
    articleDois: chemDois.slice(9, 13),  // 4 chemistry articles
    isCurrentIssue: false,
    isSpecialIssue: true,
    publishedAt: new Date('2024-04-01'),
    createdAt: new Date('2024-04-01'),
    updatedAt: new Date('2024-04-01')
  }
]

// Historical Chemistry Quarterly (HCQ) - 2 issues (archived)
export const hcqIssues: Issue[] = [
  {
    id: 'hcq-vol100-issue2',
    journalId: 'hcq',
    volume: 100,
    issue: 2,
    year: 2020,
    month: 12,
    title: 'Final Issue - A Century of Chemistry',
    coverImageUrl: 'https://images.unsplash.com/photo-1518152006812-edab29b069ac?w=300&h=400&fit=crop',
    articleDois: chemDois.slice(13, 17),  // 4 chemistry articles
    isCurrentIssue: false,  // Archived journal
    isSpecialIssue: true,
    publishedAt: new Date('2020-12-31'),
    createdAt: new Date('2020-12-31'),
    updatedAt: new Date('2020-12-31')
  },
  {
    id: 'hcq-vol100-issue1',
    journalId: 'hcq',
    volume: 100,
    issue: 1,
    year: 2020,
    month: 6,
    articleDois: chemDois.slice(17, 20),  // Last 3 chemistry articles
    isCurrentIssue: false,
    isSpecialIssue: false,
    publishedAt: new Date('2020-06-01'),
    createdAt: new Date('2020-06-01'),
    updatedAt: new Date('2020-06-01')
  }
]

// Combined export
export const mockIssues: Issue[] = [
  ...jasIssues,
  ...oabIssues,
  ...hcqIssues
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all issues for a journal
 */
export function getIssuesByJournal(journalId: string): Issue[] {
  return mockIssues.filter(issue => issue.journalId === journalId)
}

/**
 * Get a specific issue
 */
export function getIssue(journalId: string, volume: number, issue: number): Issue | undefined {
  return mockIssues.find(
    i => i.journalId === journalId && i.volume === volume && i.issue === issue
  )
}

/**
 * Get the current issue for a journal
 */
export function getCurrentIssue(journalId: string): Issue | undefined {
  return mockIssues.find(i => i.journalId === journalId && i.isCurrentIssue)
}

/**
 * Get articles for an issue (resolved from DOIs)
 */
export function getArticlesForIssue(issueId: string): Article[] {
  const issue = mockIssues.find(i => i.id === issueId)
  if (!issue) return []
  
  return issue.articleDois.map(doi => {
    const citation = getCitationByDOI(doi)
    if (!citation) {
      return {
        doi,
        journalId: issue.journalId,
        issueId: issue.id,
        title: `Article ${doi}`,
        authors: ['Unknown Author'],
        publishedAt: issue.publishedAt,
        isOpenAccess: false
      }
    }
    
    return {
      doi: citation.doi,
      journalId: issue.journalId,
      issueId: issue.id,
      title: citation.title,
      authors: citation.authors,
      abstract: citation.abstract,
      publishedAt: issue.publishedAt,
      pageRange: citation.pages,
      isOpenAccess: issue.journalId === 'oab',  // OAB is open access
      citations: Math.floor(Math.random() * 100),
      downloads: Math.floor(Math.random() * 1000)
    }
  })
}

/**
 * Get a single article by DOI
 */
export function getArticleByDOI(doi: string): Article | undefined {
  const citation = getCitationByDOI(doi)
  if (!citation) return undefined
  
  // Find which issue this article belongs to
  const issue = mockIssues.find(i => i.articleDois.includes(doi))
  
  return {
    doi: citation.doi,
    journalId: issue?.journalId || 'unknown',
    issueId: issue?.id,
    title: citation.title,
    authors: citation.authors,
    abstract: citation.abstract,
    publishedAt: issue?.publishedAt || new Date(),
    pageRange: citation.pages,
    isOpenAccess: issue?.journalId === 'oab',
    citations: Math.floor(Math.random() * 100),
    downloads: Math.floor(Math.random() * 1000)
  }
}

/**
 * Format volume/issue for display
 */
export function formatVolumeIssue(issue: Issue): string {
  return `Volume ${issue.volume}, Issue ${issue.issue}`
}

/**
 * Format issue date for display
 */
export function formatIssueDate(issue: Issue): string {
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December']
  return issue.month 
    ? `${monthNames[issue.month - 1]} ${issue.year}`
    : `${issue.year}`
}

