import type { PublicationCardConfig } from '../../types/widgets'

// Publication Card component - Schema.org CreativeWork compliant
export function PublicationCard({ article, config, align = 'left' }: { article: any, config?: PublicationCardConfig, align?: 'left' | 'center' | 'right' }) {
  // Fallback configuration for publications
  const getConfigForPublication = () => ({
    showContentTypeLabel: true,
    showTitle: true,
    showSubtitle: false,
    showThumbnail: true,
    thumbnailPosition: 'left',
    showPublicationTitle: true,
    showVolumeIssue: false,
    showBookSeriesTitle: false,
    showChapterPages: false,
    showNumberOfIssues: false,
    showPublicationDate: true,
    showDOI: true,
    showISSN: false,
    showISBN: false,
    showAuthors: true,
    authorStyle: 'full',
    showAffiliations: false,
    showAbstract: false,
    abstractLength: 'short',
    showKeywords: false,
    showAccessStatus: true,
    showViewDownloadOptions: true,
    showUsageMetrics: false,
    titleStyle: 'medium'
  })
  
  // Use provided config or generate one based on content type
  const finalConfig = config || getConfigForPublication()
  
  // Helper to get title from various schema.org properties
  const getTitle = (item: any) => {
    return item.headline || item.name || item.title || 'Untitled'
  }
  
  // Helper to get subtitle from various schema.org properties  
  const getSubtitle = (item: any) => {
    return item.alternativeHeadline || item.subtitle || ''
  }
  
  // Helper to get description/abstract from various schema.org properties
  const getDescription = (item: any) => {
    return item.abstract || item.description || ''
  }
  
  // Helper to get identifier (DOI, ISBN, etc.) from schema.org
  const getIdentifier = (item: any, type: string) => {
    if (Array.isArray(item.identifier)) {
      const found = item.identifier.find((id: any) => 
        id.propertyID === type || id.name?.includes(type.toLowerCase())
      )
      if (found) {
        // Extract string value from identifier object
        return found.value || found.identifier || String(found)
      }
      return null
    }
    // Handle single identifier
    if (typeof item.identifier === 'object' && item.identifier !== null) {
      return item.identifier.value || item.identifier.identifier || String(item.identifier)
    }
    return item.identifier || null
  }

  // Helper to format authors from schema.org Person objects
  const formatAuthors = (authors: any) => {
    if (!authors) return ''
    
    if (Array.isArray(authors)) {
      return authors.map((author: any) => {
        if (typeof author === 'string') return author
        if (typeof author === 'object' && author !== null) {
          return author.name || `${author.givenName || ''} ${author.familyName || ''}`.trim() || 'Unknown Author'
        }
        return String(author)
      }).join(', ')
    }
    
    if (typeof authors === 'string') return authors
    if (typeof authors === 'object' && authors !== null) {
      return authors.name || `${authors.givenName || ''} ${authors.familyName || ''}`.trim() || 'Unknown Author'
    }
    return String(authors)
  }

  // Helper to get content type from schema.org @type
  const getContentType = (item: any) => {
    if (item['@type']) {
      return item['@type']
    }
    if (item.type) {
      return item.type
    }
    // Fallback logic based on properties
    if (item.isPartOf?.isPartOf) return 'Article'
    if (item.isPartOf && !item.isPartOf.isPartOf) return 'Chapter'
    if (item.author && item.datePublished) return 'Article'
    if (item.isbn) return 'Book'
    return 'CreativeWork'
  }

  // Helper to format publication info (Journal/Book Title, Volume, Issue, Pages)
  const formatPublicationInfo = (item: any) => {
    const parts: string[] = []
    
    // Publication Title (Journal/Book Name) - ensure we get strings
    if (item.isPartOf?.name && typeof item.isPartOf.name === 'string') {
      parts.push(item.isPartOf.name)
    } else if (item.isPartOf?.isPartOf?.name && typeof item.isPartOf.isPartOf.name === 'string') {
      // For articles, get the journal name from isPartOf.isPartOf
      parts.push(item.isPartOf.isPartOf.name)
    } else if (item.publisher?.name && typeof item.publisher.name === 'string') {
      // Fallback to publisher name if no specific publication title
      parts.push(item.publisher.name)
    }

    // Add volume/issue info for academic content - ensure string conversion
    if (finalConfig.showVolumeIssue && item.isPartOf?.isPartOf?.volumeNumber) {
      parts.push(`Vol. ${String(item.isPartOf.isPartOf.volumeNumber)}`)
    }
    if (finalConfig.showVolumeIssue && item.isPartOf?.issueNumber) {
      parts.push(`Issue ${String(item.isPartOf.issueNumber)}`)
    }
    if (finalConfig.showChapterPages && item.pageStart && item.pageEnd) {
      parts.push(`pp. ${String(item.pageStart)}-${String(item.pageEnd)}`)
    }
    if (finalConfig.showNumberOfIssues && item.numberOfIssues) {
      parts.push(`${String(item.numberOfIssues)} issues published`)
    }
    
    return parts.join(', ')
  }

  // Helper to get access status badge
  const getAccessStatusBadge = (accessMode: string | undefined) => {
    if (!accessMode) return null
    
    const badges = {
      'open': <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium">Open Access</span>,
      'subscription': <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded font-medium">Subscription</span>,
      'free': <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">Free</span>
    }
    
    return badges[accessMode as keyof typeof badges] || null
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: '2-digit' 
    })
  }
  
  // Get alignment classes for text alignment
  const alignmentClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }[align]
  
  const badgeJustifyClass = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end'
  }[align]

  return (
    <div className={`border border-gray-200 rounded-lg p-6 bg-white hover:shadow-md transition-shadow ${alignmentClass}`}>
      {/* Header with type label and access status */}
      <div className={`flex items-center ${badgeJustifyClass} mb-4`}>
        <div className="flex items-center gap-2">
          {finalConfig.showContentTypeLabel && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
              {getContentType(article)}
            </span>
          )}
          {finalConfig.showAccessStatus && (
            getAccessStatusBadge(article.accessMode)
          )}
        </div>
      </div>

      {/* Article/Chapter Title */}
      {finalConfig.showTitle && (
        <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-tight">
          {getTitle(article)}
        </h3>
      )}
      
      {/* Subtitle */}
      {finalConfig.showSubtitle && getSubtitle(article) && (
        <p className="text-blue-600 text-sm font-medium mb-3">
          {getSubtitle(article)}
        </p>
      )}

      {/* Authors */}
      {finalConfig.showAuthors && article.author && (
        <p className="text-gray-700 text-sm mb-2">
          {formatAuthors(article.author)}
        </p>
      )}

      {/* Publication Information (Journal/Book Title) */}
      {finalConfig.showPublicationTitle && (
        <p className="text-gray-600 text-sm mb-3">
          {formatPublicationInfo(article)}
        </p>
      )}

      {/* Publication Date */}
      {finalConfig.showPublicationDate && article.datePublished && (
        <p className="text-gray-500 text-sm mb-4">
          Published: {formatDate(article.datePublished)}
        </p>
      )}

      {/* Abstract */}
      {finalConfig.showAbstract && getDescription(article) && (
        <div className="mb-4">
          <p className="text-gray-700 text-sm leading-relaxed">
            {finalConfig.abstractLength === 'short' 
              ? getDescription(article).substring(0, 150) + (getDescription(article).length > 150 ? '...' : '')
              : finalConfig.abstractLength === 'medium'
              ? getDescription(article).substring(0, 300) + (getDescription(article).length > 300 ? '...' : '')
              : getDescription(article)
            }
          </p>
        </div>
      )}

      {/* Keywords */}
      {finalConfig.showKeywords && article.keywords && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {(Array.isArray(article.keywords) ? article.keywords : [article.keywords]).map((keyword: string, index: number) => (
              <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* DOI/ISBN */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-4">
          {finalConfig.showDOI && (() => {
            const doi = getIdentifier(article, 'DOI')
            return doi ? <span>DOI: {String(doi)}</span> : null
          })()}
          {finalConfig.showISBN && (() => {
            const isbn = getIdentifier(article, 'ISBN')
            return isbn ? <span>ISBN: {String(isbn)}</span> : null
          })()}
          {finalConfig.showISSN && (() => {
            const issn = getIdentifier(article, 'ISSN')
            return issn ? <span>ISSN: {String(issn)}</span> : null
          })()}
        </div>

        {/* View/Download Options */}
        {finalConfig.showViewDownloadOptions && (
          <div className="flex items-center gap-2">
            <button className="text-blue-600 hover:text-blue-800 text-xs font-medium">
              View
            </button>
            <button className="text-blue-600 hover:text-blue-800 text-xs font-medium">
              PDF
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default PublicationCard
