import type { Theme } from '../../types'
import { usePageStore } from '../../App'

export function ThemePublicationCards({ themeId }: { themeId: string }) {
  // Mock cover images for realistic display
  const mockCovers = {
    // Journal Issue Covers
    issues: {
      digitalGovernment: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='260' viewBox='0 0 200 260'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' style='stop-color:%23667eea'/%3E%3Cstop offset='100%25' style='stop-color:%23764ba2'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='200' height='260' fill='url(%23bg)'/%3E%3Ctext x='100' y='40' text-anchor='middle' fill='white' font-family='Arial,sans-serif' font-size='16' font-weight='bold'%3EDigital Government%3C/text%3E%3Ctext x='100' y='60' text-anchor='middle' fill='white' font-family='Arial,sans-serif' font-size='12'%3EResearch and Practice%3C/text%3E%3Ctext x='100' y='90' text-anchor='middle' fill='white' font-family='Arial,sans-serif' font-size='14' font-weight='bold'%3EVol. 5 No. 3%3C/text%3E%3Ctext x='100' y='110' text-anchor='middle' fill='white' font-family='Arial,sans-serif' font-size='12'%3ESep 2024%3C/text%3E%3Ccircle cx='100' cy='150' r='30' fill='white' opacity='0.2'/%3E%3Cpath d='M85 140 L100 155 L115 140 M100 155 L100 170' stroke='white' stroke-width='3' fill='none'/%3E%3Ctext x='100' y='200' text-anchor='middle' fill='white' font-family='Arial,sans-serif' font-size='10'%3EISSN: 2639-0175%3C/text%3E%3C/svg%3E",
      computingEducation: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='260' viewBox='0 0 200 260'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' style='stop-color:%23ffeaa7'/%3E%3Cstop offset='100%25' style='stop-color:%23fab1a0'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='200' height='260' fill='url(%23bg)'/%3E%3Ctext x='100' y='40' text-anchor='middle' fill='%23333' font-family='Arial,sans-serif' font-size='16' font-weight='bold'%3EComputing Education%3C/text%3E%3Ctext x='100' y='60' text-anchor='middle' fill='%23333' font-family='Arial,sans-serif' font-size='12'%3ETheory and Practice%3C/text%3E%3Ctext x='100' y='90' text-anchor='middle' fill='%23333' font-family='Arial,sans-serif' font-size='14' font-weight='bold'%3EVol. 15 No. 2%3C/text%3E%3Ctext x='100' y='110' text-anchor='middle' fill='%23333' font-family='Arial,sans-serif' font-size='12'%3EMar 2024%3C/text%3E%3Crect x='70' y='130' width='60' height='40' rx='5' fill='%23333' opacity='0.1'/%3E%3Ctext x='100' y='155' text-anchor='middle' fill='%23333' font-family='monospace' font-size='16'%3E&lt;/&gt;%3C/text%3E%3Ctext x='100' y='200' text-anchor='middle' fill='%23333' font-family='Arial,sans-serif' font-size='10'%3EISSN: 1946-6226%3C/text%3E%3C/svg%3E",
      scientificReports: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='260' viewBox='0 0 200 260'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' style='stop-color:%2300b894'/%3E%3Cstop offset='100%25' style='stop-color:%2300a085'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='200' height='260' fill='url(%23bg)'/%3E%3Ctext x='100' y='40' text-anchor='middle' fill='white' font-family='Arial,sans-serif' font-size='18' font-weight='bold'%3EScientific Reports%3C/text%3E%3Ctext x='100' y='80' text-anchor='middle' fill='white' font-family='Arial,sans-serif' font-size='14' font-weight='bold'%3EVol. 14%3C/text%3E%3Ctext x='100' y='100' text-anchor='middle' fill='white' font-family='Arial,sans-serif' font-size='12'%3EIssue 1234%3C/text%3E%3Ctext x='100' y='120' text-anchor='middle' fill='white' font-family='Arial,sans-serif' font-size='12'%3E15 Nov 2024%3C/text%3E%3Ccircle cx='100' cy='160' r='25' fill='white' opacity='0.2'/%3E%3Cpath d='M90 160 Q100 150 110 160 Q100 170 90 160' fill='white'/%3E%3Ctext x='100' y='210' text-anchor='middle' fill='white' font-family='Arial,sans-serif' font-size='10'%3ENature Portfolio%3C/text%3E%3Ctext x='100' y='225' text-anchor='middle' fill='white' font-family='Arial,sans-serif' font-size='10'%3EISSN: 2045-2322%3C/text%3E%3C/svg%3E"
    },
    // Book Covers  
    books: {
      operationsResearch: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='260' viewBox='0 0 200 260'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0' y1='0' x2='0' y2='1'%3E%3Cstop offset='0%25' style='stop-color:%23141e30'/%3E%3Cstop offset='100%25' style='stop-color:%23243b55'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='200' height='260' fill='url(%23bg)'/%3E%3Ctext x='100' y='50' text-anchor='middle' fill='%23ffd700' font-family='Georgia,serif' font-size='18' font-weight='bold'%3EPushing the%3C/text%3E%3Ctext x='100' y='70' text-anchor='middle' fill='%23ffd700' font-family='Georgia,serif' font-size='18' font-weight='bold'%3EBoundaries%3C/text%3E%3Ctext x='100' y='100' text-anchor='middle' fill='white' font-family='Georgia,serif' font-size='14'%3EFrontiers in Impactful%3C/text%3E%3Ctext x='100' y='120' text-anchor='middle' fill='white' font-family='Georgia,serif' font-size='14'%3EOR/OM Research%3C/text%3E%3Crect x='30' y='140' width='140' height='2' fill='%23ffd700'/%3E%3Ctext x='100' y='170' text-anchor='middle' fill='white' font-family='Georgia,serif' font-size='12'%3EDruehl • Elmaghraby%3C/text%3E%3Ctext x='100' y='185' text-anchor='middle' fill='white' font-family='Georgia,serif' font-size='12'%3EShier • Greenberg%3C/text%3E%3Ctext x='100' y='220' text-anchor='middle' fill='%23ccc' font-family='Arial,sans-serif' font-size='11'%3EINFORMS%3C/text%3E%3Ctext x='100' y='240' text-anchor='middle' fill='%23ccc' font-family='Arial,sans-serif' font-size='9'%3EISBN: 978-0-9906153-4-7%3C/text%3E%3C/svg%3E",
      dataScience: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='260' viewBox='0 0 200 260'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' style='stop-color:%23667eea'/%3E%3Cstop offset='100%25' style='stop-color:%23764ba2'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='200' height='260' fill='url(%23bg)'/%3E%3Ctext x='100' y='40' text-anchor='middle' fill='white' font-family='Arial,sans-serif' font-size='20' font-weight='bold'%3EData Science%3C/text%3E%3Ctext x='100' y='65' text-anchor='middle' fill='white' font-family='Arial,sans-serif' font-size='16'%3Efor Social Good%3C/text%3E%3Ccircle cx='60' cy='120' r='20' fill='white' opacity='0.3'/%3E%3Ccircle cx='140' cy='140' r='15' fill='white' opacity='0.4'/%3E%3Ccircle cx='100' cy='160' r='25' fill='white' opacity='0.2'/%3E%3Cline x1='60' y1='120' x2='100' y2='160' stroke='white' stroke-width='2' opacity='0.5'/%3E%3Cline x1='140' y1='140' x2='100' y2='160' stroke='white' stroke-width='2' opacity='0.5'/%3E%3Ctext x='100' y='200' text-anchor='middle' fill='white' font-family='Arial,sans-serif' font-size='12'%3ESmith, Johnson, Davis%3C/text%3E%3Ctext x='100' y='220' text-anchor='middle' fill='%23ddd' font-family='Arial,sans-serif' font-size='11'%3EMIT Press%3C/text%3E%3Ctext x='100' y='240' text-anchor='middle' fill='%23ddd' font-family='Arial,sans-serif' font-size='9'%3EISBN: 978-0-262-04567-8%3C/text%3E%3C/svg%3E",
      aiEthics: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='260' viewBox='0 0 200 260'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' style='stop-color:%23ff7675'/%3E%3Cstop offset='100%25' style='stop-color:%23fd79a8'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='200' height='260' fill='url(%23bg)'/%3E%3Ctext x='100' y='40' text-anchor='middle' fill='white' font-family='Arial,sans-serif' font-size='18' font-weight='bold'%3EArtificial Intelligence%3C/text%3E%3Ctext x='100' y='65' text-anchor='middle' fill='white' font-family='Arial,sans-serif' font-size='16'%3E%26 Ethics%3C/text%3E%3Ctext x='100' y='85' text-anchor='middle' fill='white' font-family='Arial,sans-serif' font-size='14'%3EA Modern Approach%3C/text%3E%3Crect x='70' y='110' width='60' height='60' rx='30' fill='white' opacity='0.2'/%3E%3Ccircle cx='85' cy='135' r='3' fill='white'/%3E%3Ccircle cx='115' cy='135' r='3' fill='white'/%3E%3Cpath d='M80 155 Q100 165 120 155' stroke='white' stroke-width='2' fill='none'/%3E%3Ctext x='100' y='200' text-anchor='middle' fill='white' font-family='Arial,sans-serif' font-size='12'%3ERussell %26 Norvig%3C/text%3E%3Ctext x='100' y='220' text-anchor='middle' fill='%23ddd' font-family='Arial,sans-serif' font-size='11'%3EPearson%3C/text%3E%3Ctext x='100' y='240' text-anchor='middle' fill='%23ddd' font-family='Arial,sans-serif' font-size='9'%3EISBN: 978-0-13-461099-3%3C/text%3E%3C/svg%3E"
    },
    // Article thumbnails (for compact cards)
    articles: {
      vpnSecurity: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='80' viewBox='0 0 120 80'%3E%3Crect width='120' height='80' fill='%23f8f9fa'/%3E%3Crect x='20' y='20' width='80' height='40' rx='5' fill='%23e9ecef' stroke='%23adb5bd'/%3E%3Ccircle cx='35' cy='35' r='4' fill='%23dc3545'/%3E%3Ccircle cx='60' cy='45' r='6' fill='%23007bff'/%3E%3Ccircle cx='85' cy='35' r='4' fill='%23ffc107'/%3E%3Cline x1='35' y1='35' x2='60' y2='45' stroke='%236c757d' stroke-width='1'/%3E%3Cline x1='60' y1='45' x2='85' y2='35' stroke='%236c757d' stroke-width='1'/%3E%3C/svg%3E",
      languageModels: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='80' viewBox='0 0 120 80'%3E%3Crect width='120' height='80' fill='%23f8f9fa'/%3E%3Crect x='10' y='15' width='100' height='50' rx='3' fill='%23fff'/%3E%3Ctext x='60' y='35' text-anchor='middle' font-family='monospace' font-size='12' fill='%23495057'%3ELLM%3C/text%3E%3Ctext x='60' y='50' text-anchor='middle' font-family='monospace' font-size='8' fill='%236c757d'%3ELanguage Model%3C/text%3E%3Crect x='20' y='20' width='15' height='6' fill='%2328a745'/%3E%3Crect x='40' y='20' width='10' height='6' fill='%23007bff'/%3E%3Crect x='55' y='20' width='20' height='6' fill='%23ffc107'/%3E%3Crect x='80' y='20' width='15' height='6' fill='%23dc3545'/%3E%3C/svg%3E",
      performanceAnalysis: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='80' viewBox='0 0 120 80'%3E%3Crect width='120' height='80' fill='%23f8f9fa'/%3E%3Cpolyline points='20,60 30,50 40,55 50,40 60,35 70,45 80,30 90,25 100,20' stroke='%23007bff' stroke-width='2' fill='none'/%3E%3Ccircle cx='30' cy='50' r='2' fill='%23007bff'/%3E%3Ccircle cx='50' cy='40' r='2' fill='%23007bff'/%3E%3Ccircle cx='70' cy='45' r='2' fill='%23007bff'/%3E%3Ccircle cx='90' cy='25' r='2' fill='%23007bff'/%3E%3Cline x1='15' y1='70' x2='105' y2='70' stroke='%23adb5bd'/%3E%3Cline x1='15' y1='70' x2='15' y2='10' stroke='%23adb5bd'/%3E%3C/svg%3E"
    }
  }

  // Predefined publication cards for each theme - designed for real-world contexts
  const themePublicationCards = {
    'modernist-theme': {
      name: 'Modern Theme',
      description: 'Clean, minimalist publication cards optimized for search results, grids, table of contents, and page headers',
      usageContexts: ['Search Results Grid', 'Issue Table of Contents', 'Recent Publications', 'Journal Page Headers'],
      cards: [
        {
          id: 'modern-article-compact',
          name: 'Article Card (Compact)',
          type: 'Article',
          description: 'For search results and publication grids',
          context: 'Search Results, Grids',
          features: ['Access status badges', 'Publication status', 'Clean typography', 'DOI links'],
          style: {
            layout: 'compact',
            backgroundColor: '#ffffff',
            borderColor: '#e5e7eb',
            titleColor: '#1f2937',
            titleFont: 'Inter, sans-serif',
            titleWeight: '600',
            titleSize: '16px',
            metaColor: '#6b7280',
            metaFont: 'Inter, sans-serif',
            metaSize: '14px',
            accentColor: '#3b82f6',
            statusColors: {
              fullAccess: '#10b981',
              freeAccess: '#f59e0b',
              subscription: '#6b7280'
            },
            spacing: '16px',
            borderRadius: '8px'
          }
        },
        {
          id: 'modern-article-detailed',
          name: 'Article Card (Detailed)',
          type: 'Article',
          description: 'For individual article pages and detailed views',
          context: 'Article Pages, Detailed Views',
          features: ['Action buttons', 'Abstract preview', 'Full metadata', 'Download options'],
          style: {
            layout: 'detailed',
            backgroundColor: '#ffffff',
            borderColor: '#e5e7eb',
            titleColor: '#1f2937',
            titleFont: 'Inter, sans-serif',
            titleWeight: '700',
            titleSize: '20px',
            metaColor: '#6b7280',
            metaFont: 'Inter, sans-serif',
            metaSize: '14px',
            accentColor: '#3b82f6',
            buttonStyle: 'modern',
            spacing: '20px',
            borderRadius: '12px'
          }
        },
        {
          id: 'modern-issue-banner',
          name: 'Issue Card (Banner)',
          type: 'Issue',
          description: 'For journal issue pages and featured content',
          context: 'Issue Pages, Journal Headers',
          features: ['Cover image', 'Volume/Issue info', 'ISSN display', 'Featured styling'],
          style: {
            layout: 'banner',
            backgroundColor: '#ffffff',
            borderColor: '#e5e7eb',
            titleColor: '#1f2937',
            titleFont: 'Inter, sans-serif',
            titleWeight: '700',
            titleSize: '24px',
            metaColor: '#6b7280',
            accentColor: '#3b82f6',
            imageStyle: 'prominent',
            spacing: '24px',
            borderRadius: '12px'
          }
        },
        {
          id: 'modern-book-featured',
          name: 'Book Card (Featured)',
          type: 'Book',
          description: 'For book pages and featured book displays',
          context: 'Book Pages, Featured Content',
          features: ['Cover image', 'Author photos', 'ISBN display', 'Chapter access'],
          style: {
            layout: 'featured',
            backgroundColor: '#ffffff',
            borderColor: '#e5e7eb',
            titleColor: '#1f2937',
            titleFont: 'Inter, sans-serif',
            titleWeight: '700',
            titleSize: '22px',
            metaColor: '#6b7280',
            accentColor: '#3b82f6',
            imageStyle: 'cover-prominent',
            authorDisplay: 'photos',
            spacing: '20px',
            borderRadius: '12px'
          }
        }
      ]
    },
  }

  const themeData = themePublicationCards[themeId as keyof typeof themePublicationCards]
  
  if (!themeData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No publication cards defined for this theme.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Usage Context Overview */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-blue-800 font-medium mb-2">🎯 Real-World Usage Contexts</h3>
        <p className="text-blue-700 text-sm mb-3">{themeData.description}</p>
        <div className="flex flex-wrap gap-2">
          {themeData.usageContexts.map((context, index) => (
            <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
              {context}
            </span>
              ))}
            </div>
          </div>
          
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cards List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Publication Card Variants</h3>
          
          <div className="space-y-4">
            {themeData.cards.map((card) => (
              <div
                key={card.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">{card.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{card.description}</p>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                        {card.type}
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                        {card.style.layout}
                      </span>
            </div>
                    <div className="text-xs text-gray-500 mb-2">
                      <strong>Usage:</strong> {card.context}
          </div>
                  </div>
                </div>
                
                {/* Features */}
                <div className="mb-3">
                  <div className="text-xs font-medium text-gray-700 mb-1">Key Features:</div>
                  <div className="flex flex-wrap gap-1">
                    {card.features.map((feature, index) => (
                      <span key={index} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-green-100 text-green-800">
                        {feature}
                      </span>
                    ))}
                          </div>
                      </div>

                {/* Style Properties */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Typography:</span>
                    <div style={{ fontFamily: card.style.titleFont, color: card.style.titleColor }} className="font-medium">
                      {card.style.titleFont.split(',')[0]}
                  </div>
            </div>
                  <div>
                    <span className="text-gray-500">Accent:</span>
                    <div className="flex items-center gap-1">
                      <div 
                        className="w-3 h-3 rounded-full border border-gray-300"
                        style={{ backgroundColor: card.style.accentColor }}
                      ></div>
                      <span style={{ color: card.style.accentColor }}>{card.style.accentColor}</span>
          </div>
        </div>
        </div>
              </div>
            ))}
        </div>
      </div>

        {/* Preview Area */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Live Card Previews</h3>
          <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
            <div className="space-y-6">
              {themeData.cards.map((card) => (
                <div key={card.id} className="space-y-2">
                  <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                    {card.name}
                  </div>
                  <div
                    className="shadow-sm border transition-all hover:shadow-md"
                    style={{
                      backgroundColor: card.style.backgroundColor,
                      borderColor: card.style.borderColor,
                      borderRadius: card.style.borderRadius,
                      padding: card.style.spacing
                    }}
                  >
                    {/* Article Content */}
                    {card.type === 'Article' && (
                      <>
                        <div className="flex gap-3">
                          {/* Article thumbnail for compact layouts */}
                          {card.style.layout === 'compact' && (
                            <div className="flex-shrink-0">
                              <img 
                                src={card.id.includes('modern') ? mockCovers.articles.vpnSecurity : 
                                     card.id.includes('classic') ? mockCovers.articles.performanceAnalysis :
                                     mockCovers.articles.languageModels} 
                                alt="Article thumbnail" 
                                className="w-16 h-10 object-cover rounded border"
                              />
                            </div>
                          )}
                          
                          <div className="flex-1">
                            {/* Access Status */}
                            <div className="flex items-center gap-2 mb-2">
                              <span 
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white"
                                style={{ backgroundColor: card.style.statusColors?.fullAccess || card.style.accentColor }}
                              >
                                🔓 FULL ACCESS
                              </span>
          </div>
                            
                            <h4 
                              className="mb-2"
                              style={{ 
                                color: card.style.titleColor,
                                fontSize: card.style.titleSize,
                                fontFamily: card.style.titleFont,
                                fontWeight: card.style.titleWeight
                              }}
                            >
                              OpenVPN is Open to VPN Fingerprinting
                            </h4>
                            
                            <div 
                              className="text-sm mb-2"
                              style={{ 
                                color: card.style.metaColor,
                                fontFamily: card.style.metaFont,
                                fontSize: card.style.metaSize
                              }}
                            >
                              Diwen Xue, Reethika Ramesh, Arham Jain, Michaelis Kallitsis
                            </div>
                            
                            <div 
                              className="text-sm mb-2"
                              style={{ color: card.style.metaColor }}
                            >
                              Ahead of Print
            </div>
        </div>
                        </div>
                        
                        {/* Action buttons for detailed layouts */}
                        {card.style.layout === 'detailed' && (
                          <div className="flex items-center gap-2 mt-3">
              <button
                              className="px-3 py-1 text-xs rounded border"
                              style={{ 
                                borderColor: card.style.accentColor,
                                color: card.style.accentColor
                              }}
                            >
                              Abstract
              </button>
              <button
                              className="px-3 py-1 text-xs rounded text-white"
                              style={{ backgroundColor: card.style.accentColor }}
              >
                              Full Text
              </button>
              <button
                              className="px-3 py-1 text-xs rounded border border-gray-300 text-gray-600"
                            >
                              PDF
              </button>
          </div>
                        )}
                      </>
                    )}

                    {/* Book Content */}
                    {card.type === 'Book' && (
                      <>
                        <div className="flex gap-4">
                          {/* Book Cover */}
                          <div className="flex-shrink-0">
                            <img 
                              src={card.id.includes('modern') ? mockCovers.books.dataScience :
                                   card.id.includes('classic') ? mockCovers.books.operationsResearch :
                                   mockCovers.books.aiEthics} 
                              alt="Book cover" 
                              className={`object-cover rounded border ${
                                card.style.layout === 'featured' ? 'w-20 h-26' : 'w-12 h-16'
                              }`}
            />
          </div>
                          
                          <div className="flex-1">
                            <h4 
                              className="mb-2"
                              style={{ 
                                color: card.style.titleColor,
                                fontSize: card.style.titleSize,
                                fontFamily: card.style.titleFont,
                                fontWeight: card.style.titleWeight
                              }}
                            >
                              {card.id.includes('modern') ? 'Data Science for Social Good' :
                               card.id.includes('classic') ? 'Pushing the Boundaries: Frontiers in Impactful OR/OM Research' :
                               'Artificial Intelligence & Ethics: A Modern Approach'}
                            </h4>
                            
                            <div 
                              className="text-sm mb-2"
                              style={{ 
                                color: card.style.metaColor,
                                fontFamily: card.style.metaFont,
                                fontSize: card.style.metaSize
                              }}
                            >
                              {card.id.includes('modern') ? 'Smith, Johnson, Davis' :
                               card.id.includes('classic') ? 'Druehl, Elmaghraby, Shier, Greenberg' :
                               'Russell & Norvig'}
    </div>
                            
                            <div 
                              className="text-sm mb-2"
                              style={{ color: card.style.metaColor }}
                            >
                              {card.id.includes('modern') ? '2024 • ISBN: 978-0-262-04567-8' :
                               card.id.includes('classic') ? '1 Nov 2020 • ISBN: 978-0-9906153-4-7' :
                               '2024 • ISBN: 978-0-13-461099-3'}
            </div>
                            
                            {/* Publisher */}
                            <div 
                              className="text-sm font-medium"
                              style={{ color: card.style.accentColor }}
                            >
                              {card.id.includes('modern') ? 'MIT Press' :
                               card.id.includes('classic') ? 'INFORMS' :
                               'Pearson'}
          </div>
        </div>
      </div>
                      </>
                    )}

                    {/* Issue Content */}
                    {card.type === 'Issue' && (
                      <>
                        <div className="flex gap-4">
                          {/* Issue Cover */}
                          <div className="flex-shrink-0">
                            <img 
                              src={card.id.includes('modern') ? mockCovers.issues.digitalGovernment :
                                   card.id.includes('classic') ? mockCovers.issues.scientificReports :
                                   mockCovers.issues.computingEducation} 
                              alt="Issue cover" 
                              className={`object-cover rounded border ${
                                card.style.layout === 'banner' ? 'w-24 h-32' : 'w-16 h-20'
                              }`}
        />
      </div>
              
                          <div className="flex-1">
                            <h4 
                              className="mb-2"
                              style={{ 
                                color: card.style.titleColor,
                                fontSize: card.style.titleSize,
                                fontFamily: card.style.titleFont,
                                fontWeight: card.style.titleWeight
                              }}
                            >
                              {card.id.includes('modern') ? 'Digital Government: Research and Practice' :
                               card.id.includes('classic') ? 'Scientific Reports' :
                               'Computing Education: Theory and Practice'}
                            </h4>
                            <div 
                              className="text-sm mb-2"
                              style={{ color: card.style.metaColor }}
                            >
                              {card.id.includes('modern') ? 'Volume 5, Number 3 • 30 Sep 2024' :
                               card.id.includes('classic') ? 'Vol. 14, Issue 1234 • 15 Nov 2024' :
                               'Volume 15, Number 2 • Mar 2024'}
              </div>
                            <div 
                              className="text-sm mb-2"
                              style={{ color: card.style.metaColor }}
                            >
                              {card.id.includes('modern') ? 'ISSN (online): 2639-0175' :
                               card.id.includes('classic') ? 'ISSN: 2045-2322' :
                               'ISSN: 1946-6226'}
          </div>
                            <a 
                              href="#" 
                              className="text-sm inline-block"
                              style={{ color: card.style.accentColor }}
                            >
                              {card.id.includes('modern') ? 'http://doi.org/10.1145/DGOV' :
                               card.id.includes('classic') ? 'http://doi.org/10.1038/s41598-024-xyz' :
                               'http://doi.org/10.1145/CompEd.2024'}
                            </a>
            </div>
          </div>
                      </>
                    )}
          </div>
              </div>
            ))}
          </div>
      </div>
      </div>
              </div>
              
      <div className="mt-8 p-4 bg-amber-50 rounded-lg border border-amber-200">
        <div className="flex items-start gap-3">
          <div className="text-amber-600 mt-0.5">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
              <div>
            <h4 className="text-amber-800 font-medium mb-1">Design System Foundation</h4>
            <p className="text-amber-700 text-sm">
              These publication cards are optimized for <strong>{themeData.name}</strong> and designed for real-world publishing contexts: search results, issue listings, journal headers, and featured content displays. 
              Websites using this theme inherit these cards as their foundation and can customize them for specific needs.
            </p>
              </div>
            </div>
            </div>
          </div>
  )
}
