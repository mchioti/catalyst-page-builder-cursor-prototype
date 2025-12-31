import type { PublicationCardConfig } from '../../types/widgets'

// Publication Card component - Schema.org CreativeWork compliant
// Handles multiple types: Periodical (Journal), PublicationIssue, ScholarlyArticle, Book, Chapter
export function PublicationCard({ article, config, align = 'left', contentMode }: { article: any, config?: PublicationCardConfig, align?: 'left' | 'center' | 'right', contentMode?: 'light' | 'dark' }) {
  
  // Get text color classes based on content mode
  const getTextColorClasses = () => {
    if (contentMode === 'dark') {
      return {
        primary: 'text-white',
        secondary: 'text-gray-300',
        muted: 'text-gray-400'
      };
    } else if (contentMode === 'light') {
      return {
        primary: 'text-gray-900',
        secondary: 'text-gray-700',
        muted: 'text-gray-600'
      };
    }
    // Default: use existing colors
    return {
      primary: 'text-gray-900',
      secondary: 'text-gray-700',
      muted: 'text-gray-600'
    };
  };
  
  const textColors = getTextColorClasses();
  
  // Detect schema.org type
  const schemaType = article?.['@type'] || article?.type || 'ScholarlyArticle'
  const isPeriodical = schemaType === 'Periodical' || schemaType === 'Journal'
  const isPublicationIssue = schemaType === 'PublicationIssue'
  const isPublicationVolume = schemaType === 'PublicationVolume'
  const isBook = schemaType === 'Book'
  
  // Fallback configuration - varies by type
  const getConfigForPublication = () => {
    // Default config for journals
    if (isPeriodical) {
      return {
        showContentTypeLabel: true,
        showTitle: true,
        showSubtitle: true,
        showThumbnail: true,
        thumbnailPosition: 'left',
        showPublicationTitle: false, // Journal IS the publication
        showVolumeIssue: false,
        showBookSeriesTitle: false,
        showChapterPages: false,
        showNumberOfIssues: true, // Relevant for journals
        showPublicationDate: false,
        showDOI: false,
        showISSN: true, // Relevant for journals
        showISBN: false,
        showAuthors: false, // Journals don't have authors
        authorStyle: 'full',
        showAffiliations: false,
        showAbstract: true, // Show journal description
        abstractLength: 'medium',
        showKeywords: false,
        showAccessStatus: true,
        showViewDownloadOptions: false,
        showUsageMetrics: true, // Impact factor etc.
        titleStyle: 'large'
      }
    }
    
    // Default config for issues
    if (isPublicationIssue) {
      return {
        showContentTypeLabel: true,
        showTitle: true,
        showSubtitle: false,
        showThumbnail: true,
        thumbnailPosition: 'left',
        showPublicationTitle: true, // Show journal name
        showVolumeIssue: true,
        showBookSeriesTitle: false,
        showChapterPages: false,
        showNumberOfIssues: false,
        showPublicationDate: true,
        showDOI: false,
        showISSN: false,
        showISBN: false,
        showAuthors: false, // Issues don't have authors
        authorStyle: 'full',
        showAffiliations: false,
        showAbstract: false,
        abstractLength: 'short',
        showKeywords: false,
        showAccessStatus: false,
        showViewDownloadOptions: true,
        showUsageMetrics: false,
        titleStyle: 'medium'
      }
    }
    
    // Default config for articles/other
    return {
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
    }
  }
  
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
    // Check identifier array (schema.org format)
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
    // Handle single identifier object (schema.org format)
    if (typeof item.identifier === 'object' && item.identifier !== null) {
      // Check if this identifier matches the requested type
      if (item.identifier.propertyID === type || item.identifier.name?.includes(type.toLowerCase())) {
        return item.identifier.value || item.identifier.identifier || String(item.identifier)
      }
      // If no propertyID/name match, but it's a single identifier, return it (for simple string identifiers)
      if (!item.identifier.propertyID && !item.identifier.name) {
        return item.identifier.value || item.identifier.identifier || String(item.identifier)
      }
      return null
    }
    // Handle string identifier (simple case)
    if (typeof item.identifier === 'string') {
      return item.identifier
    }
    return null
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
    const type = item['@type'] || item.type
    if (type) {
      // Map schema.org types to display labels
      const typeLabels: Record<string, string> = {
        'Periodical': 'Journal',
        'Journal': 'Journal',
        'PublicationIssue': 'Issue',
        'PublicationVolume': 'Volume',
        'ScholarlyArticle': 'Research Article',
        'Article': 'Article',
        'Book': 'Book',
        'Chapter': 'Chapter',
        'Review': 'Review',
        'Report': 'Report'
      }
      return typeLabels[type] || type
    }
    // Fallback logic based on properties
    if (item.issn) return 'Journal'
    if (item.issueNumber) return 'Issue'
    if (item.isPartOf?.isPartOf) return 'Article'
    if (item.isPartOf && !item.isPartOf.isPartOf) return 'Chapter'
    if (item.author && item.datePublished) return 'Article'
    if (item.isbn) return 'Book'
    return 'CreativeWork'
  }
  
  // Helper to get ISSN from journal (handles various formats)
  const getISSN = (item: any) => {
    // Direct issn property
    if (item.issn) {
      if (typeof item.issn === 'string') return item.issn
      if (item.issn.print) return `Print: ${item.issn.print}`
      if (item.issn.online) return `Online: ${item.issn.online}`
      return String(item.issn)
    }
    // Check identifier array
    return getIdentifier(item, 'ISSN')
  }
  
  // Helper to get journal metrics (impact factor, etc.)
  const getJournalMetrics = (item: any) => {
    const metrics: { label: string; value: string }[] = []
    
    if (item.impactFactor) {
      metrics.push({ label: 'Impact Factor', value: String(item.impactFactor) })
    }
    if (item.citescore) {
      metrics.push({ label: 'CiteScore', value: String(item.citescore) })
    }
    if (item.hIndex) {
      metrics.push({ label: 'h-Index', value: String(item.hIndex) })
    }
    if (item.numberOfArticles) {
      metrics.push({ label: 'Articles', value: String(item.numberOfArticles) })
    }
    if (item.numberOfIssues) {
      metrics.push({ label: 'Issues', value: String(item.numberOfIssues) })
    }
    
    return metrics
  }
  
  // Helper to get issue/volume info for PublicationIssue type
  const getIssueInfo = (item: any) => {
    const parts: string[] = []
    
    // Volume info (usually in isPartOf for issues)
    if (item.isPartOf?.volumeNumber) {
      parts.push(`Volume ${item.isPartOf.volumeNumber}`)
    } else if (item.volumeNumber) {
      parts.push(`Volume ${item.volumeNumber}`)
    }
    
    // Issue number
    if (item.issueNumber) {
      parts.push(`Issue ${item.issueNumber}`)
    }
    
    return parts.join(', ')
  }
  
  // Helper to get parent journal name for issues
  const getJournalName = (item: any) => {
    // For issues, the journal is in isPartOf chain
    if (item.isPartOf?.isPartOf?.name) {
      return item.isPartOf.isPartOf.name // Issue → Volume → Journal
    }
    if (item.isPartOf?.name) {
      return item.isPartOf.name // Issue → Journal (no volume)
    }
    return null
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

  // Helper to get thumbnail URL from schema.org properties
  // Uses wide image for top/bottom/underlay, portrait for left/right
  const getThumbnailUrl = (item: any, position: string) => {
    const isWidePosition = position === 'top' || position === 'bottom' || position === 'underlay'
    if (isWidePosition && item.thumbnailUrlWide) {
      return item.thumbnailUrlWide
    }
    return item.thumbnailUrl || item.image || item.thumbnail || null
  }

  // Helper to get access status badge
  const getAccessStatusBadge = (item: any) => {
    // Check for isAccessibleForFree (schema.org standard)
    if (item.isAccessibleForFree === true) {
      return <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium">Open Access</span>
    }
    if (item.isAccessibleForFree === false) {
      return <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded font-medium">Subscription</span>
    }
    
    // Fallback to legacy accessMode
    const accessMode = item.accessMode
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
  
  // Get background classes based on content mode
  const getBackgroundClasses = () => {
    if (contentMode === 'dark') {
      // Glass morphism effect for dark mode:
      // - backdrop-blur-md: Blurs background (works on images)
      // - border-white/30: Bright border glow for definition
      // - shadow-2xl: Strong shadow for depth
      return 'backdrop-blur-md border border-white/30 shadow-2xl';
    } else if (contentMode === 'light') {
      return 'bg-white border border-gray-200 shadow-sm'; // White background
    }
    // Default: white background
    return 'bg-white border border-gray-200 shadow-sm';
  };
  
  // Get background style (gradient overlay for dark mode)
  const getBackgroundStyle = () => {
    if (contentMode === 'dark') {
      // Gradient overlay: lighter at top, darker at bottom
      // Creates tint effect on solid colors + works on images
      return {
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)'
      };
    }
    return {};
  };
  
  const backgroundClasses = getBackgroundClasses();
  const backgroundStyle = getBackgroundStyle();

  // Get thumbnail position and URL (position affects image dimensions)
  const thumbnailPosition = finalConfig.thumbnailPosition || 'left'
  const thumbnailUrl = getThumbnailUrl(article, thumbnailPosition)
  const showThumbnail = finalConfig.showThumbnail && thumbnailUrl
  
  // Thumbnail component
  const ThumbnailImage = () => (
    <div className={`flex-shrink-0 ${
      thumbnailPosition === 'top' || thumbnailPosition === 'bottom' ? 'w-full h-40' :
      thumbnailPosition === 'underlay' ? 'absolute inset-0' : 'w-24 h-32'
    }`}>
      <img 
        src={thumbnailUrl} 
        alt={getTitle(article)}
        className={`object-cover rounded ${
          thumbnailPosition === 'underlay' ? 'w-full h-full opacity-20' : 'w-full h-full'
        }`}
        onError={(e) => {
          // Hide broken images
          (e.target as HTMLImageElement).style.display = 'none'
        }}
      />
    </div>
  )

  // Determine if horizontal layout (thumbnail left/right)
  const isHorizontalLayout = showThumbnail && (thumbnailPosition === 'left' || thumbnailPosition === 'right')

  return (
    <div 
      className={`publication-card h-full rounded-lg p-6 ${alignmentClass} ${backgroundClasses} ${
        thumbnailPosition === 'underlay' ? 'relative overflow-hidden' : ''
      }`}
      style={backgroundStyle}
    >
      {/* Underlay thumbnail */}
      {showThumbnail && thumbnailPosition === 'underlay' && <ThumbnailImage />}
      
      {/* Top thumbnail */}
      {showThumbnail && thumbnailPosition === 'top' && (
        <div className="mb-4 -mx-6 -mt-6">
          <ThumbnailImage />
        </div>
      )}
      
      {/* Main content wrapper - horizontal when thumbnail is left/right */}
      <div className={`flex ${isHorizontalLayout ? 'flex-row gap-4' : 'flex-col'} ${
        thumbnailPosition === 'underlay' ? 'relative z-10' : ''
      }`}>
        {/* Left thumbnail */}
        {showThumbnail && thumbnailPosition === 'left' && <ThumbnailImage />}
        
        {/* Content */}
        <div className="flex-1 flex flex-col">
          {/* Header with type label and access status */}
          <div className={`flex items-center ${badgeJustifyClass} mb-4`}>
            <div className="flex items-center gap-2">
              {finalConfig.showContentTypeLabel && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
                  {getContentType(article)}
                </span>
              )}
              {finalConfig.showAccessStatus && (
                getAccessStatusBadge(article)
              )}
            </div>
          </div>

          {/* Article/Chapter Title */}
      {finalConfig.showTitle && (
        <h3 className={`text-lg font-semibold ${textColors.primary} mb-2 leading-tight`}>
          {getTitle(article)}
        </h3>
      )}
      
      {/* Subtitle */}
      {finalConfig.showSubtitle && getSubtitle(article) && (
        <p className="text-blue-600 text-sm font-medium mb-3">
          {getSubtitle(article)}
        </p>
      )}

      {/* ========== JOURNAL (Periodical) SPECIFIC CONTENT ========== */}
      {isPeriodical && (
        <>
          {/* ISSN */}
          {finalConfig.showISSN && (
            <div className={`${textColors.muted} text-sm mb-2`}>
              {article.issn?.print && <span>ISSN (Print): {article.issn.print}</span>}
              {article.issn?.print && article.issn?.online && <span className="mx-2">•</span>}
              {article.issn?.online && <span>ISSN (Online): {article.issn.online}</span>}
              {!article.issn?.print && !article.issn?.online && getISSN(article) && (
                <span>ISSN: {getISSN(article)}</span>
              )}
            </div>
          )}
          
          {/* Journal Metrics (Impact Factor, etc.) */}
          {finalConfig.showUsageMetrics && (
            <div className="flex flex-wrap gap-3 mb-3">
              {getJournalMetrics(article).map((metric, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  <span className={`${textColors.muted} text-xs`}>{metric.label}:</span>
                  <span className={`${textColors.secondary} text-sm font-semibold`}>{metric.value}</span>
                </div>
              ))}
            </div>
          )}
          
          {/* Publisher */}
          {article.publisher?.name && (
            <p className={`${textColors.muted} text-sm mb-2`}>
              Publisher: {article.publisher.name}
            </p>
          )}
        </>
      )}
      
      {/* ========== ISSUE (PublicationIssue) SPECIFIC CONTENT ========== */}
      {isPublicationIssue && (
        <>
          {/* Volume/Issue Info */}
          {finalConfig.showVolumeIssue && getIssueInfo(article) && (
            <p className={`${textColors.secondary} text-sm font-medium mb-2`}>
              {getIssueInfo(article)}
            </p>
          )}
          
          {/* Parent Journal Name */}
          {finalConfig.showPublicationTitle && getJournalName(article) && (
            <p className={`${textColors.muted} text-sm mb-2`}>
              {getJournalName(article)}
            </p>
          )}
          
          {/* Issue Date */}
          {finalConfig.showPublicationDate && article.datePublished && (
            <p className={`${textColors.muted} text-sm mb-3`}>
              {formatDate(article.datePublished)}
            </p>
          )}
          
          {/* Number of Articles in Issue */}
          {article.numberOfArticles && (
            <p className={`${textColors.muted} text-sm mb-2`}>
              {article.numberOfArticles} articles
            </p>
          )}
        </>
      )}

      {/* ========== ARTICLE/DEFAULT CONTENT ========== */}
      {!isPeriodical && !isPublicationIssue && (
        <>
          {/* Authors */}
          {finalConfig.showAuthors && article.author && (
            <p className={`${textColors.secondary} text-sm mb-2`}>
              {formatAuthors(article.author)}
            </p>
          )}

          {/* Publication Information (Journal/Book Title) */}
          {finalConfig.showPublicationTitle && (
            <p className={`${textColors.muted} text-sm mb-3`}>
              {formatPublicationInfo(article)}
            </p>
          )}

          {/* Publication Date */}
          {finalConfig.showPublicationDate && article.datePublished && (
            <p className={`${textColors.muted} text-sm mb-4`}>
              Published: {formatDate(article.datePublished)}
            </p>
          )}
        </>
      )}

      {/* Abstract */}
      {finalConfig.showAbstract && getDescription(article) && (
        <div className="mb-4">
          <p className={`${textColors.secondary} text-sm leading-relaxed`}>
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
              <span key={index} className={`text-xs bg-gray-100 ${textColors.muted} px-2 py-1 rounded`}>
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* DOI/ISBN */}
      <div className={`flex items-center justify-between text-xs ${textColors.muted}`}>
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
        
        {/* Right thumbnail */}
        {showThumbnail && thumbnailPosition === 'right' && <ThumbnailImage />}
      </div>
      
      {/* Bottom thumbnail */}
      {showThumbnail && thumbnailPosition === 'bottom' && (
        <div className="mt-4 -mx-6 -mb-6">
          <ThumbnailImage />
        </div>
      )}
    </div>
  )
}

export default PublicationCard
