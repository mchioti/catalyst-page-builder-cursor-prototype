import React, { useState } from 'react'
import { X, Check } from 'lucide-react'

// Types matching the original App.tsx types
type PublicationCardConfig = {
  showContentTypeLabel: boolean
  showTitle: boolean
  showSubtitle: boolean
  showThumbnail: boolean
  thumbnailPosition: 'left' | 'right' | 'top' | 'bottom' | 'underlay'
  showAuthors: boolean
  authorStyle: 'full' | 'initials'
  showPublicationDate: boolean
  showAbstract: boolean
  showJournal: boolean
  showVolume: boolean
  showIssue: boolean
  showPages: boolean
  showDOI: boolean
  showAccessType: boolean
  showMetrics: boolean
  showActions: boolean
  actionStyle: 'buttons' | 'links'
  showKeywords: boolean
  showFunding: boolean
  showLicense: boolean
  showCopyright: boolean
  showCitation: boolean
  layout: 'default' | 'compact' | 'hero'
  skin: 'default' | 'modern' | 'classic' | 'minimal' | 'accent'
}

type PublicationCardVariant = {
  id: string
  name: string
  description?: string
  config: PublicationCardConfig
  createdAt: Date
}

// Store hook type
type UsePageStore = {
  publicationCardVariants: PublicationCardVariant[]
  addPublicationCardVariant: (variant: PublicationCardVariant) => void
  removePublicationCardVariant: (id: string) => void
}

interface PublicationCardsProps {
  usePageStore: () => UsePageStore
}

export function PublicationCards({ usePageStore }: PublicationCardsProps) {
  const { publicationCardVariants, addPublicationCardVariant, removePublicationCardVariant } = usePageStore()
  const [selectedTab, setSelectedTab] = useState<'article' | 'book' | 'issue' | 'journal'>('issue')
  const [editingConfig, setEditingConfig] = useState<PublicationCardConfig>({
    showContentTypeLabel: true,
    showTitle: true,
    showSubtitle: true,
    showThumbnail: true,
    thumbnailPosition: 'left',
    showAuthors: true,
    authorStyle: 'full',
    showPublicationDate: true,
    showAbstract: false,
    showJournal: true,
    showVolume: false,
    showIssue: false,
    showPages: false,
    showDOI: true,
    showAccessType: true,
    showMetrics: false,
    showActions: true,
    actionStyle: 'buttons',
    showKeywords: false,
    showFunding: false,
    showLicense: false,
    showCopyright: false,
    showCitation: false,
    layout: 'default',
    skin: 'default'
  })
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [variantName, setVariantName] = useState('')

  const updateConfig = (updates: Partial<PublicationCardConfig>) => {
    setEditingConfig(prev => ({ ...prev, ...updates }))
  }

  const handleSaveVariant = () => {
    if (!variantName.trim()) return
    
    const newVariant: PublicationCardVariant = {
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
    issue: {
      type: 'Current Issue',
      title: 'Digital Government: Research and Practice',
      date: '30 Sep 2024',
      doi: 'http://doi.org/10.1145/DGV',
      thumbnail: 'Issue'
    },
    journal: {
      type: 'Journal',
      title: 'Journal of Snow',
      subtitle: 'The study of winter precipitation',
      thumbnail: 'Journal'
    },
    book: {
      type: 'Book',
      title: 'Frontiers in Impactful OR/OM Research',
      authors: 'Cheryl Druehl, Wedad Elmaghraby, et al.',
      date: 'Published: 01 Nov 2020',
      abstract: 'This book pushes the boundaries of operations research and management, highlighting impactful new methodologies...',
      accessType: 'NO ACCESS',
      thumbnail: 'OO'
    },
    article: {
      type: 'Research Article',
      title: 'Is It Possible to Truly Understand Performance in LLMs?',
      subtitle: 'A Deep Dive into Evaluation Metrics',
      authors: 'Samuel Greengard, et al.',
      journal: 'Journal of Modern Computing',
      volume: 'Vol. 5, Issue 3',
      pages: 'pp. 14-16',
      date: 'Published: 02 Dec 2024',
      abstract: 'This paper investigates the complexities of evaluating large language models, proposing a new framework...',
      accessType: 'FULL ACCESS',
      links: ['Abstract', 'Full Text', 'PDF'],
      doi: 'https://doi.org/10.1145/3695868',
      thumbnail: 'tic'
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
            selectedTab === 'book' ? 'bg-red-100 text-red-800' :
            selectedTab === 'issue' ? 'bg-yellow-100 text-yellow-800' :
            'bg-purple-100 text-purple-800'
          }`}>
            {data.type}
          </div>
        )}

        <div className="flex items-start gap-3">
          {/* Thumbnail */}
          {editingConfig.showThumbnail && editingConfig.thumbnailPosition === 'left' && (
            <div className={`flex-shrink-0 w-16 h-16 ${
              selectedTab === 'article' ? 'bg-purple-100' :
              selectedTab === 'book' ? 'bg-green-100' :
              selectedTab === 'issue' ? 'bg-yellow-100' :
              'bg-blue-100'
            } rounded flex items-center justify-center text-lg font-bold ${
              selectedTab === 'article' ? 'text-purple-800' :
              selectedTab === 'book' ? 'text-green-800' :
              selectedTab === 'issue' ? 'text-yellow-800' :
              'text-blue-800'
            }`}>
              {data.thumbnail}
            </div>
          )}

          <div className="flex-1 space-y-2">
            {/* Title */}
            {editingConfig.showTitle && (
              <h3 className="font-bold text-lg text-gray-900">{data.title}</h3>
            )}

            {/* Subtitle */}
            {editingConfig.showSubtitle && 'subtitle' in data && data.subtitle && (
              <p className="text-sm text-gray-600">{data.subtitle}</p>
            )}

            {/* Authors */}
            {editingConfig.showAuthors && 'authors' in data && data.authors && (
              <p className="text-sm text-gray-600">{data.authors}</p>
            )}

            {/* Publication Context */}
            <div className="text-sm text-gray-500 space-y-1">
              {editingConfig.showJournal && 'journal' in data && data.journal && (
                <div>{data.journal}</div>
              )}
              {editingConfig.showVolume && 'volume' in data && data.volume && (
                <div>{data.volume}</div>
              )}
              {editingConfig.showPublicationDate && 'date' in data && data.date && (
                <div>{data.date}</div>
              )}
            </div>

            {/* Abstract */}
            {editingConfig.showAbstract && 'abstract' in data && data.abstract && (
              <p className="text-sm text-gray-600 line-clamp-2">{data.abstract}</p>
            )}

            {/* Access Type */}
            {editingConfig.showAccessType && 'accessType' in data && data.accessType && (
              <div className={`text-xs font-medium px-2 py-1 rounded inline-block ${
                data.accessType === 'FULL ACCESS' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {data.accessType}
              </div>
            )}

            {/* Actions */}
            {editingConfig.showActions && 'links' in data && data.links && (
              <div className="flex gap-2">
                {data.links.map((link, idx) => (
                  <button
                    key={idx}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    {link}
                  </button>
                ))}
              </div>
            )}

            {/* DOI */}
            {editingConfig.showDOI && 'doi' in data && data.doi && (
              <div className="text-xs text-gray-400">{data.doi}</div>
            )}
          </div>
        </div>
      </div>
    )
  }

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
              {['article', 'book', 'issue', 'journal'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab as any)}
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
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 bg-gray-50 px-3 py-1 rounded">
                  Content Identification
                </h4>
                <div className="space-y-2">
                  {[
                    { key: 'showContentTypeLabel', label: 'Content Type Label' },
                    { key: 'showSubtitle', label: 'Subtitle' },
                    { key: 'showThumbnail', label: 'Thumbnail Image' }
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editingConfig[key as keyof PublicationCardConfig] as boolean}
                        onChange={(e) => updateConfig({ [key]: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{label}</span>
                    </label>
                  ))}
                  
                  {editingConfig.showThumbnail && (
                    <div className="ml-6 mt-2">
                      <label className="block text-xs text-gray-600 mb-1">Image Position:</label>
                      {['Top', 'Left', 'Right', 'Bottom', 'Underlay'].map((pos) => (
                        <label key={pos} className="flex items-center mr-4 inline-flex">
                          <input
                            type="radio"
                            name="thumbnailPosition"
                            value={pos.toLowerCase()}
                            checked={editingConfig.thumbnailPosition === pos.toLowerCase()}
                            onChange={(e) => updateConfig({ thumbnailPosition: e.target.value as any })}
                            className="mr-1 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-xs text-gray-600">{pos}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Publication Context */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 bg-gray-50 px-3 py-1 rounded">
                  Publication Context
                </h4>
                <div className="space-y-2">
                  {[
                    { key: 'showTitle', label: 'Publication Title' },
                    { key: 'showVolume', label: 'Volume & Issue' },
                    { key: 'showPages', label: 'Chapter/Page Numbers' },
                    { key: 'showPublicationDate', label: 'Publication Date' },
                    { key: 'showDOI', label: 'DOI' },
                    { key: 'showJournal', label: 'ISSN/eISSN' }
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editingConfig[key as keyof PublicationCardConfig] as boolean}
                        onChange={(e) => updateConfig({ [key]: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Author Information */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 bg-gray-50 px-3 py-1 rounded">
                  Author Information
                </h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingConfig.showAuthors}
                      onChange={(e) => updateConfig({ showAuthors: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Authors/Editors</span>
                  </label>
                </div>
              </div>

              {/* Content Summary */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 bg-gray-50 px-3 py-1 rounded">
                  Content Summary
                </h4>
                <div className="space-y-2">
                  {[
                    { key: 'showAbstract', label: 'Abstract/Summary' },
                    { key: 'showKeywords', label: 'Keywords' }
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editingConfig[key as keyof PublicationCardConfig] as boolean}
                        onChange={(e) => updateConfig({ [key]: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Access & Usage */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 bg-gray-50 px-3 py-1 rounded">
                  Access & Usage
                </h4>
                <div className="space-y-2">
                  {[
                    { key: 'showAccessType', label: 'Access Status' },
                    { key: 'showActions', label: 'View/Download Options' },
                    { key: 'showMetrics', label: 'Usage Metrics' }
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editingConfig[key as keyof PublicationCardConfig] as boolean}
                        onChange={(e) => updateConfig({ [key]: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preview and Variants Panel */}
        <div className="space-y-6">
          {/* Preview */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
            {renderPreviewCard()}
          </div>

          {/* Saved Variants */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Saved Variants</h3>
            {publicationCardVariants.length === 0 ? (
              <p className="text-sm text-gray-500">
                No variants saved yet. Configure the display elements and click "Save Current Style" to create one.
              </p>
            ) : (
              <div className="space-y-2">
                {publicationCardVariants.map((variant) => (
                  <div key={variant.id} className="flex justify-between items-center p-2 border rounded hover:bg-gray-50">
                    <div>
                      <div className="font-medium text-sm">{variant.name}</div>
                      {variant.description && (
                        <div className="text-xs text-gray-500">{variant.description}</div>
                      )}
                    </div>
                    <button
                      onClick={() => removePublicationCardVariant(variant.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Save Style Variant</h3>
            <input
              type="text"
              value={variantName}
              onChange={(e) => setVariantName(e.target.value)}
              placeholder="Enter variant name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowSaveDialog(false)
                  setVariantName('')
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveVariant}
                disabled={!variantName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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