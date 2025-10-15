import type { PublicationCardConfig } from '../types'

// Helper to determine content type from schema.org object
export function getContentType(publication: any): string {
  const type = publication['@type'] || publication.type
  
  if (type === 'ScholarlyArticle' || type === 'Article') return 'article'
  if (type === 'Chapter') return 'chapter' 
  if (type === 'Book') return 'book'
  if (type === 'BookSeries') return 'book-series'
  if (type === 'PublicationIssue') return 'issue'
  if (type === 'Periodical') return 'journal'
  
  return 'article' // Default fallback
}

// Base configuration with all options available
const baseConfig: PublicationCardConfig = {
  // Content Identification
  showContentTypeLabel: true,
  showTitle: true, // Always true - not configurable
  showSubtitle: true,
  showThumbnail: true,
  thumbnailPosition: 'left',
  
  // Publication Context
  showPublicationTitle: true,
  showVolumeIssue: true,
  showBookSeriesTitle: true,
  showChapterPages: true,
  showNumberOfIssues: true,
  showPublicationDate: true,
  showDOI: true,
  showISSN: true,
  showISBN: true,
  
  // Author Information  
  showAuthors: true,
  authorStyle: 'full',
  showAffiliations: true,
  
  // Content Summary
  showAbstract: true,
  abstractLength: 'medium',
  showKeywords: true,
  
  // Access & Usage
  showAccessStatus: true,
  showViewDownloadOptions: true,
  showUsageMetrics: true,
  
  // Display Configuration
  titleStyle: 'medium'
}

// Article-specific configuration (for journal articles)
export function getArticleConfig(): PublicationCardConfig {
  return {
    ...baseConfig,
    
    // Publication Context - Article specifics
    showPublicationTitle: true, // Journal name
    showVolumeIssue: true,
    showBookSeriesTitle: false, // N/A for articles
    showChapterPages: false, // N/A for articles
    showNumberOfIssues: false, // N/A for articles
    showISSN: true,
    showISBN: false, // N/A for articles
    
    // Content Summary
    showAbstract: true,
    showKeywords: true,
    
    // Author Information
    showAuthors: true,
    showAffiliations: true
  }
}

// Chapter-specific configuration (for book chapters)
export function getChapterConfig(): PublicationCardConfig {
  return {
    ...baseConfig,
    
    // Publication Context - Chapter specifics  
    showPublicationTitle: true, // Book title
    showVolumeIssue: false, // N/A for chapters
    showBookSeriesTitle: true, // If part of a series
    showChapterPages: true, // Page numbers within book
    showNumberOfIssues: false, // N/A for chapters
    showISSN: false, // N/A for chapters
    showISBN: true, // Book ISBN
    
    // Content Summary
    showAbstract: true,
    showKeywords: false, // Less common for chapters
    
    // Author Information
    showAuthors: true,
    showAffiliations: false // Less common to show for chapters
  }
}

// Journal-specific configuration (for entire journals)
export function getJournalConfig(): PublicationCardConfig {
  return {
    ...baseConfig,
    
    // Publication Context - Journal specifics
    showPublicationTitle: false, // Journal IS the publication
    showVolumeIssue: false, // N/A for journal metadata
    showBookSeriesTitle: false, // N/A for journals
    showChapterPages: false, // N/A for journals
    showNumberOfIssues: true, // Show total number of issues published
    showISSN: true,
    showISBN: false, // N/A for journals
    
    // Content Summary
    showAbstract: true, // Journal description
    showKeywords: false, // N/A for journals
    
    // Author Information  
    showAuthors: false, // Journals have editors, not authors
    showAffiliations: false // N/A for journals
  }
}

// Book-specific configuration (for entire books)
export function getBookConfig(): PublicationCardConfig {
  return {
    ...baseConfig,
    
    // Publication Context - Book specifics
    showPublicationTitle: false, // Book IS the publication
    showVolumeIssue: false, // N/A for books
    showBookSeriesTitle: true, // If part of a series
    showChapterPages: false, // N/A for entire books
    showNumberOfIssues: false, // N/A for books
    showISSN: false, // N/A for books
    showISBN: true,
    
    // Content Summary
    showAbstract: true,
    showKeywords: true,
    
    // Author Information
    showAuthors: true,
    showAffiliations: false // Less common for book covers
  }
}

// Issue-specific configuration (for journal issues)
export function getIssueConfig(): PublicationCardConfig {
  return {
    ...baseConfig,
    
    // Publication Context - Issue specifics
    showPublicationTitle: true, // Journal name
    showVolumeIssue: false, // Issue IS the volume/issue
    showBookSeriesTitle: false, // N/A for issues
    showChapterPages: false, // N/A for issues
    showNumberOfIssues: false, // N/A for issues
    showISSN: true, // Journal ISSN
    showISBN: false, // N/A for issues
    
    // Content Summary
    showAbstract: true, // Issue description
    showKeywords: false, // N/A for issues
    
    // Author Information
    showAuthors: false, // Issues have editors, not authors
    showAffiliations: false // N/A for issues
  }
}

// Book Series-specific configuration
export function getBookSeriesConfig(): PublicationCardConfig {
  return {
    ...baseConfig,
    
    // Publication Context - Book Series specifics
    showPublicationTitle: false, // Series IS the publication
    showVolumeIssue: false, // N/A for series
    showBookSeriesTitle: false, // Series IS the title
    showChapterPages: false, // N/A for series
    showNumberOfIssues: false, // N/A for series
    showISSN: true, // Series can have ISSN
    showISBN: false, // Individual books have ISBN, not series
    
    // Content Summary
    showAbstract: true, // Series description
    showKeywords: true,
    
    // Author Information
    showAuthors: false, // Series have editors, not authors
    showAffiliations: false // N/A for series
  }
}

// Main function to get appropriate config based on content type
export function getConfigForContentType(contentType: string): PublicationCardConfig {
  switch (contentType.toLowerCase()) {
    case 'article':
    case 'scholarly-article':
      return getArticleConfig()
    
    case 'chapter':
      return getChapterConfig()
      
    case 'book':
      return getBookConfig()
      
    case 'issue':
    case 'publication-issue':
      return getIssueConfig()
      
    case 'book-series':
      return getBookSeriesConfig()
      
    case 'journal':
    case 'periodical':
      return getJournalConfig()
      
    default:
      return getArticleConfig() // Default to article config
  }
}

// Function to get config for a specific publication object
export function getConfigForPublication(publication: any): PublicationCardConfig {
  const contentType = getContentType(publication)
  return getConfigForContentType(contentType)
}

// Helper to get available configuration options for a content type
// Returns object with enabled/disabled status for each config option
export function getAvailableOptionsForContentType(contentType: string) {
  const config = getConfigForContentType(contentType)
  
  return {
    // Content Identification - always available
    contentTypeLabel: true,
    subtitle: true,
    thumbnailImage: true,
    
    // Publication Context - varies by type
    publicationTitle: contentType === 'article' || contentType === 'chapter' || contentType === 'issue',
    volumeIssue: contentType === 'article',
    bookSeriesTitle: contentType === 'chapter' || contentType === 'book',
    chapterPages: contentType === 'chapter',
    numberOfIssues: contentType === 'journal', // Only available for journals
    publicationDate: true, // Available for all
    doi: true, // Available for all
    issn: contentType === 'article' || contentType === 'issue' || contentType === 'journal' || contentType === 'book-series',
    isbn: contentType === 'chapter' || contentType === 'book',
    
    // Author Information - varies by type
    authors: contentType === 'article' || contentType === 'chapter' || contentType === 'book',
    affiliations: contentType === 'article' || contentType === 'chapter',
    
    // Content Summary - mostly available
    abstract: true, // Available for all
    keywords: contentType !== 'journal' && contentType !== 'chapter' && contentType !== 'issue',
    
    // Access & Usage - always available
    accessStatus: true,
    viewDownloadOptions: true,
    usageMetrics: true
  }
}
