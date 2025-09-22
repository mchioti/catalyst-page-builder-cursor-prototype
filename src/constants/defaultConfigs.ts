// Default configurations for various components

import { PublicationCardConfig } from '../types/widgets'

export const DEFAULT_PUBLICATION_CARD_CONFIG: PublicationCardConfig = {
  // Content Identification
  showContentTypeLabel: true,
  showTitle: true,
  showSubtitle: true,
  showThumbnail: true,
  thumbnailPosition: 'top',
  
  // Publication Context
  showPublicationTitle: true,
  showVolumeIssue: true,
  showBookSeriesTitle: false,
  showChapterPages: true,
  showPublicationDate: true,
  showDOI: true,
  showISSN: false,
  showISBN: false,
  
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
  titleStyle: 'large'
}
