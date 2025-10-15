import React, { useState } from 'react'
import { X, Check } from 'lucide-react'
import { getAvailableOptionsForContentType, getConfigForContentType } from '../../utils/publicationCardConfigs'
import type { PublicationCardConfig } from '../../types'

// Store hook type (minimal for this component)
type UsePageStore = {
  publicationCardVariants: any[]
  addPublicationCardVariant: (variant: any) => void
  removePublicationCardVariant: (id: string) => void
}

interface PublicationCardsProps {
  usePageStore: () => UsePageStore
}

type ContentType = 'article' | 'chapter' | 'book' | 'journal'

export function PublicationCards({ usePageStore }: PublicationCardsProps) {
  const { publicationCardVariants, addPublicationCardVariant, removePublicationCardVariant } = usePageStore()
  const [selectedTab, setSelectedTab] = useState<ContentType>('journal') // Start with journal for TOC
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [variantName, setVariantName] = useState('')

  // Get the appropriate configuration for the selected content type
  const baseConfig = getConfigForContentType(selectedTab)
  const availableOptions = getAvailableOptionsForContentType(selectedTab)
  
  const [editingConfig, setEditingConfig] = useState<PublicationCardConfig>(baseConfig)

  // Update config when tab changes
  React.useEffect(() => {
    setEditingConfig(getConfigForContentType(selectedTab))
  }, [selectedTab])

  const updateConfig = (updates: Partial<PublicationCardConfig>) => {
    setEditingConfig(prev => ({ ...prev, ...updates }))
  }

  const handleSaveVariant = () => {
    if (!variantName.trim()) return
    
    const newVariant = {
      id: crypto.randomUUID(),
      name: variantName.trim(),
      description: `${selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)} card variant`,
      config: { ...editingConfig },
      createdAt: new Date()
    }
    
    addPublicationCardVariant(newVariant)
    setVariantName('')
    setShowSaveDialog(false)
  }

  // Sample publication data for previews
  const sampleData = {
    article: {
      type: 'Research Article',
      title: 'Perovskite Solar Cells: Advanced Tandem Architectures for Enhanced Efficiency',
      subtitle: 'A comprehensive study on next-generation photovoltaic materials',
      authors: 'Sarah Chen, Michael Rodriguez, Elena Petrov',
      journal: 'Advanced Materials', 
      volume: 'Vol. 67, Issue 12',
      pages: 'pp. 245-267',
      date: 'Published: 02 Dec 2024',
      abstract: 'This paper investigates advanced tandem perovskite solar cell architectures...',
      accessType: 'FULL ACCESS',
      doi: 'https://doi.org/10.1002/adma.202401234',
      thumbnail: 'AM'
    },
    chapter: {
      type: 'Book Chapter',
      title: 'Machine Learning Applications in Materials Science',
      subtitle: 'From Theory to Practice',
      authors: 'Dr. Alex Kumar, Prof. Lisa Zhang',
      book: 'Computational Materials Discovery',
      series: 'Advanced Materials Science Series',
      pages: 'pp. 123-156',
      date: 'Published: 15 Mar 2024',
      abstract: 'This chapter explores the revolutionary applications of machine learning...',
      accessType: 'FULL ACCESS',
      doi: 'https://doi.org/10.1007/978-3-030-12345-6_8',
      isbn: '978-3-030-12345-6',
      thumbnail: 'ML'
    },
    book: {
      type: 'Book',
      title: 'Frontiers in Quantum Computing',
      subtitle: 'Algorithms, Hardware, and Applications',
      authors: 'Jennifer Liu, Dr. Kenji Nakamura, Prof. Sophie Dubois',
      series: 'Quantum Information Science Series',
      date: 'Published: 01 Nov 2024',
      abstract: 'This comprehensive book covers the latest advances in quantum computing...',
      accessType: 'PREVIEW ACCESS',
      doi: 'https://doi.org/10.1007/978-3-031-98765-4',
      isbn: '978-3-031-98765-4',
      thumbnail: 'QC'
    },
    journal: {
      type: 'Journal',
      title: 'Advanced Materials',
      subtitle: 'The leading international journal in materials science',
      description: 'Covering all aspects of materials science, from synthesis and characterization to applications in electronics, energy, and healthcare.',
      issn: '0935-9648 (print), 1521-4095 (online)', 
      editor: 'Wiley-VCH and Materials Research Society',
      date: 'Founded: 1989',
      impactFactor: '32.086',
      thumbnail: 'AM'
    }
  }

  const renderPreviewCard = () => {
    const data = sampleData[selectedTab]
    
    return (
      <div className="bg-white border rounded-lg p-4 space-y-3">
        {/* Content Type Label */}
        {editingConfig.showContentTypeLabel && (
          <div className={`text-xs font-medium px-2 py-1 rounded inline-block ${
            selectedTab === 'article' ? 'bg-blue-100 text-blue-800' :
            selectedTab === 'chapter' ? 'bg-green-100 text-green-800' :
            selectedTab === 'book' ? 'bg-purple-100 text-purple-800' :
            'bg-orange-100 text-orange-800'
          }`}>
            {data.type}
          </div>
        )}

        <div className="flex items-start gap-3">
          {/* Thumbnail */}
          {editingConfig.showThumbnail && editingConfig.thumbnailPosition === 'left' && (
            <div className={`flex-shrink-0 w-16 h-16 ${
              selectedTab === 'article' ? 'bg-blue-100' :
              selectedTab === 'chapter' ? 'bg-green-100' :
              selectedTab === 'book' ? 'bg-purple-100' :
              'bg-orange-100'
            } rounded flex items-center justify-center text-lg font-bold ${
              selectedTab === 'article' ? 'text-blue-800' :
              selectedTab === 'chapter' ? 'text-green-800' :
              selectedTab === 'book' ? 'text-purple-800' :
              'text-orange-800'
            }`}>
              {data.thumbnail}
            </div>
          )}

          <div className="flex-1 space-y-2">
            {/* Title - Always shown */}
            <h3 className="font-semibold text-gray-900 leading-tight">
              {data.title}
            </h3>
            
            {/* Subtitle */}
            {editingConfig.showSubtitle && data.subtitle && (
              <p className="text-blue-600 text-sm font-medium">
                {data.subtitle}
              </p>
            )}
            
            {/* Authors */}
            {editingConfig.showAuthors && data.authors && (
              <p className="text-gray-700 text-sm">
                {data.authors}
              </p>
            )}
            
            {/* Publication Context */}
            {editingConfig.showPublicationTitle && (
              <p className="text-gray-600 text-sm">
                {selectedTab === 'article' ? data.journal :
                 selectedTab === 'chapter' ? data.book :
                 selectedTab === 'book' ? data.series :
                 'N/A'
                }
              </p>
            )}
            
            {/* Volume & Issue */}
            {editingConfig.showVolumeIssue && data.volume && (
              <p className="text-gray-600 text-sm">{data.volume}</p>
            )}
            
            {/* Chapter/Pages */}
            {editingConfig.showChapterPages && data.pages && (
              <p className="text-gray-600 text-sm">{data.pages}</p>
            )}
            
            {/* Publication Date */}
            {editingConfig.showPublicationDate && data.date && (
              <p className="text-gray-500 text-sm">{data.date}</p>
            )}
            
            {/* Abstract */}
            {editingConfig.showAbstract && (data.abstract || data.description) && (
              <p className="text-gray-700 text-sm leading-relaxed">
                {(data.abstract || data.description)?.substring(0, 150)}...
              </p>
            )}
            
            {/* Metadata */}
            <div className="flex items-center gap-4 text-xs text-gray-500">
              {editingConfig.showDOI && data.doi && (
                <span>DOI: {data.doi.replace('https://doi.org/', '')}</span>
              )}
              
              {editingConfig.showISSN && data.issn && (
                <span>ISSN: {data.issn}</span>
              )}
              
              {editingConfig.showISBN && data.isbn && (
                <span>ISBN: {data.isbn}</span>
              )}
            </div>
            
            {/* Access & Actions */}
            {editingConfig.showAccessStatus && data.accessType && (
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-1 rounded ${
                  data.accessType === 'FULL ACCESS' ? 'bg-green-100 text-green-800' :
                  data.accessType === 'PREVIEW ACCESS' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {data.accessType}
                </span>
                
                {editingConfig.showViewDownloadOptions && (
                  <div className="flex gap-2">
                    <button className="text-blue-600 hover:text-blue-800 text-xs">View</button>
                    <button className="text-blue-600 hover:text-blue-800 text-xs">PDF</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Configuration sections based on content type
  const ConfigSection = ({ title, options }: { title: string; options: Array<{ key: keyof PublicationCardConfig; label: string; disabled?: boolean }> }) => (
    <div>
      <h4 className="text-sm font-semibold text-gray-700 mb-3 bg-gray-50 px-3 py-1 rounded">
        {title}
      </h4>
      <div className="space-y-2">
        {options.map(({ key, label, disabled }) => (
          <label key={key} className={`flex items-center ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <input
              type="checkbox"
              checked={editingConfig[key] as boolean}
              onChange={(e) => !disabled && updateConfig({ [key]: e.target.checked })}
              disabled={disabled}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
            />
            <span className="ml-2 text-sm text-gray-700">{label}</span>
          </label>
        ))}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Publication Card Styles</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Configuration Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Display Elements */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Display Elements</h3>
              <button
                onClick={() => setShowSaveDialog(true)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Save Current Style as Variant...
              </button>
            </div>

            {/* Content Type Tabs */}
            <div className="flex space-x-1 mb-6 border-b">
              {(['article', 'chapter', 'book', 'journal'] as ContentType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`px-4 py-2 text-sm font-medium rounded-t-md border-b-2 transition-colors ${
                    selectedTab === tab
                      ? 'text-blue-600 border-blue-600 bg-blue-50'
                      : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Configuration Sections */}
            <div className="space-y-6">
              {/* Content Identification */}
              <ConfigSection 
                title="Content Identification"
                options={[
                  { key: 'showContentTypeLabel', label: 'Content Type Label' },
                  { key: 'showSubtitle', label: 'Subtitle' },
                  { key: 'showThumbnail', label: 'Thumbnail Image' }
                ]}
              />
              
              {/* Thumbnail Position */}
              {editingConfig.showThumbnail && (
                <div className="ml-6 -mt-4">
                  <label className="block text-xs text-gray-600 mb-2">Image Position:</label>
                  <div className="flex gap-4">
                    {['top', 'left', 'right', 'bottom', 'underlay'].map((pos) => (
                      <label key={pos} className="flex items-center">
                        <input
                          type="radio"
                          name="thumbnailPosition"
                          value={pos}
                          checked={editingConfig.thumbnailPosition === pos}
                          onChange={(e) => updateConfig({ thumbnailPosition: e.target.value as any })}
                          className="mr-1 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-xs text-gray-600 capitalize">{pos}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Publication Context */}
              <ConfigSection 
                title="Publication Context"
                options={[
                  { key: 'showPublicationTitle', label: 'Publication Title', disabled: !availableOptions.publicationTitle },
                  { key: 'showVolumeIssue', label: 'Volume & Issue', disabled: !availableOptions.volumeIssue },
                  { key: 'showBookSeriesTitle', label: 'Book Series Title', disabled: !availableOptions.bookSeriesTitle },
                  { key: 'showChapterPages', label: 'Chapter/Page Numbers', disabled: !availableOptions.chapterPages },
                  { key: 'showPublicationDate', label: 'Publication Date' },
                  { key: 'showDOI', label: 'DOI' },
                  { key: 'showISSN', label: 'ISSN/eISSN', disabled: !availableOptions.issn },
                  { key: 'showISBN', label: 'ISBN/eISBN', disabled: !availableOptions.isbn }
                ]}
              />

              {/* Author Information */}
              <ConfigSection 
                title="Author Information"
                options={[
                  { key: 'showAuthors', label: 'Authors/Editors', disabled: !availableOptions.authors },
                  { key: 'showAffiliations', label: 'Affiliations', disabled: !availableOptions.affiliations }
                ]}
              />

              {/* Content Summary */}
              <ConfigSection 
                title="Content Summary"
                options={[
                  { key: 'showAbstract', label: 'Abstract/Summary' },
                  { key: 'showKeywords', label: 'Keywords', disabled: !availableOptions.keywords }
                ]}
              />

              {/* Access & Usage */}
              <ConfigSection 
                title="Access & Usage"
                options={[
                  { key: 'showAccessStatus', label: 'Access Status' },
                  { key: 'showViewDownloadOptions', label: 'View/Download Options' },
                  { key: 'showUsageMetrics', label: 'Usage Metrics' }
                ]}
              />
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
            {renderPreviewCard()}
          </div>

          {/* Saved Variants */}
          {publicationCardVariants.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Saved Variants</h3>
              <div className="space-y-2">
                {publicationCardVariants.map((variant) => (
                  <div key={variant.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <div className="font-medium text-sm">{variant.name}</div>
                      <div className="text-xs text-gray-500">{variant.description}</div>
                    </div>
                    <button
                      onClick={() => removePublicationCardVariant(variant.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Save Style Variant</h3>
            <input
              type="text"
              value={variantName}
              onChange={(e) => setVariantName(e.target.value)}
              placeholder="Enter variant name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveVariant}
                disabled={!variantName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
