/**
 * Journal-Specific Mock Publication Data
 * 
 * This file contains mock publication data for each Catalyst journal.
 * Used in Page Instance mode to simulate journal-specific content
 * instead of AI-generated content.
 */

import type { Article } from '../v2/types/core'
import { getArticlesForIssue, getCurrentIssue } from '../v2/data/mockIssues'
import { getJournalById } from '../v2/data/mockWebsites'
import { createDebugLogger } from '../utils/logger'

// Control logging for this file
const DEBUG = false
const debugLog = createDebugLogger(DEBUG)

/**
 * Get journal-specific publications for a journal
 * Returns schema.org ScholarlyArticle objects formatted for widgets
 */
export function getJournalPublications(journalId: string, maxItems: number = 5): any[] {
  debugLog('log', '🔍 [getJournalPublications] Called:', { journalId, maxItems })
  
  try {
    const currentIssue = getCurrentIssue(journalId)
    debugLog('log', '🔍 [getJournalPublications] Current issue:', currentIssue ? { id: currentIssue.id, journalId: currentIssue.journalId } : 'NOT FOUND')
    
    if (!currentIssue) {
      debugLog('warn', '⚠️ [getJournalPublications] No current issue found for journal:', journalId)
      return []
    }

    const articles = getArticlesForIssue(currentIssue.id)
    debugLog('log', '🔍 [getJournalPublications] Articles from issue:', { count: articles.length, issueId: currentIssue.id })
    
    if (!articles || articles.length === 0) {
      debugLog('warn', '⚠️ [getJournalPublications] No articles found for issue:', currentIssue.id)
      return []
    }

    // Convert Article objects to schema.org ScholarlyArticle format
    // Prefix DOIs with journal code (e.g., 10.1038/jas-x9b7y8oei)
    const result = articles.slice(0, maxItems).map((article: Article) => {
      // Extract the suffix from the original DOI (everything after the prefix like "10.1038/")
      const doiSuffix = article.doi.includes('/') ? article.doi.split('/').slice(1).join('/') : article.doi
      // Create journal-prefixed DOI: 10.1038/{journalId}-{suffix}
      const journalPrefixedDOI = `10.1038/${journalId}-${doiSuffix}`
      
      debugLog('log', '🔍 [getJournalPublications] Mapping article:', {
        originalDOI: article.doi,
        journalId,
        journalPrefixedDOI,
        title: article.title
      })
      
      return {
        '@type': 'ScholarlyArticle',
        '@id': `https://doi.org/${journalPrefixedDOI}`,
        identifier: {
          '@type': 'PropertyValue',
          propertyID: 'DOI',
          value: journalPrefixedDOI
        },
        headline: article.title,
      author: article.authors.map((author: string) => ({
        '@type': 'Person',
        name: author
      })),
      abstract: article.abstract,
      datePublished: article.publishedAt,
      // pageRange is a string like "123-145", parse it if needed
      pageStart: article.pageRange ? (article.pageRange.split('-')[0] || undefined) : undefined,
      pageEnd: article.pageRange ? (article.pageRange.split('-')[1] || undefined) : undefined,
        isAccessibleForFree: article.isOpenAccess || false,
        citationCount: article.citations || 0,
        downloadCount: article.downloads || 0
      }
    })
    
    debugLog('log', '✅ [getJournalPublications] Returning:', {
      journalId,
      count: result.length,
      firstDOI: result[0]?.identifier?.value,
      firstTitle: result[0]?.headline
    })
    
    return result
  } catch (error) {
    debugLog('error', `❌ [getJournalPublications] Error fetching publications for journal ${journalId}:`, error)
    return []
  }
}

/**
 * Get journal metadata for PublicationDetailsWidget with 'context' source
 * Returns schema.org Periodical object
 */
export function getJournalMetadata(journalId: string): any {
  const journal = getJournalById(journalId)
  
  if (!journal) {
    debugLog('warn', `Journal not found: ${journalId}`)
    return null
  }

  return {
    '@type': 'Periodical',
    '@id': `https://example.com/journal/${journalId}`,
    name: journal.name,
    alternateName: journal.acronym,
    description: journal.description,
    issn: ('online' in journal.issn ? journal.issn.online : undefined) || ('print' in journal.issn ? journal.issn.print : undefined),
    impactFactor: 'impactFactor' in journal ? journal.impactFactor : undefined,
    isAccessibleForFree: journal.isOpenAccess || false
  }
}

