import React, { useState } from 'react'
import { X, Check } from 'lucide-react'

// Types
type PublicationCardConfig = {
  showTitle: boolean
  showAuthors: boolean
  showAffiliations: boolean
  showPublicationDate: boolean
  showAccessType: boolean
  showJournal: boolean
  showVolume: boolean
  showIssue: boolean
  showPages: boolean
  showDoi: boolean
  showAbstract: boolean
  showKeywords: boolean
  showCitations: boolean
  showUsageMetrics: boolean
  showPdfLink: boolean
  showFullTextLink: boolean
  thumbnailPosition: 'none' | 'left' | 'right' | 'top'
  thumbnailSize: 'small' | 'medium' | 'large'
  layout: 'compact' | 'comfortable' | 'spacious'
  showBorder: boolean
  showShadow: boolean
  cornerRadius: 'none' | 'small' | 'medium' | 'large'
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

// Props
interface PublicationCardsProps {
  usePageStore: () => UsePageStore
}

export function PublicationCards({ usePageStore }: PublicationCardsProps) {
  const { publicationCardVariants, addPublicationCardVariant, removePublicationCardVariant } = usePageStore()
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)
  const [editingConfig, setEditingConfig] = useState<PublicationCardConfig>({
    showTitle: true,
    showAuthors: true,
    showAffiliations: false,
    showPublicationDate: true,
    showAccessType: true,
    showJournal: true,
    showVolume: false,
    showIssue: false,
    showPages: false,
    showDoi: false,
    showAbstract: false,
    showKeywords: false,
    showCitations: false,
    showUsageMetrics: false,
    showPdfLink: true,
    showFullTextLink: true,
    thumbnailPosition: 'left',
    thumbnailSize: 'medium',
    layout: 'comfortable',
    showBorder: true,
    showShadow: false,
    cornerRadius: 'medium'
  })
  const [variantName, setVariantName] = useState('')
  const [variantDescription, setVariantDescription] = useState('')

  const handleCreateVariant = () => {
    if (!variantName.trim()) return
    
    const newVariant: PublicationCardVariant = {
      id: crypto.randomUUID(),
      name: variantName.trim(),
      description: variantDescription.trim(),
      config: { ...editingConfig },
      createdAt: new Date()
    }
    
    addPublicationCardVariant(newVariant)
    setVariantName('')
    setVariantDescription('')
    setEditingConfig({
      showTitle: true,
      showAuthors: true,
      showAffiliations: false,
      showPublicationDate: true,
      showAccessType: true,
      showJournal: true,
      showVolume: false,
      showIssue: false,
      showPages: false,
      showDoi: false,
      showAbstract: false,
      showKeywords: false,
      showCitations: false,
      showUsageMetrics: false,
      showPdfLink: true,
      showFullTextLink: true,
      thumbnailPosition: 'left',
      thumbnailSize: 'medium',
      layout: 'comfortable',
      showBorder: true,
      showShadow: false,
      cornerRadius: 'medium'
    })
  }

  const handleLoadVariant = (variant: PublicationCardVariant) => {
    setSelectedVariant(variant.id)
    setEditingConfig({ ...variant.config })
    setVariantName(variant.name)
    setVariantDescription(variant.description || '')
  }

  const handleUpdateVariant = () => {
    if (!selectedVariant) return
    
    removePublicationCardVariant(selectedVariant)
    
    const updatedVariant: PublicationCardVariant = {
      id: selectedVariant,
      name: variantName.trim(),
      description: variantDescription.trim(),
      config: { ...editingConfig },
      createdAt: new Date()
    }
    
    addPublicationCardVariant(updatedVariant)
  }

  const handleSaveAsNewVariant = () => {
    if (!variantName.trim()) return
    
    const newVariant: PublicationCardVariant = {
      id: crypto.randomUUID(),
      name: variantName.trim(),
      description: variantDescription.trim(),
      config: { ...editingConfig },
      createdAt: new Date()
    }
    
    addPublicationCardVariant(newVariant)
    setSelectedVariant(null)
    setVariantName('')
    setVariantDescription('')
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Publication Card Configurator</h2>
        <p className="text-gray-600">Configure how publication metadata is displayed across your site. Create variants for different contexts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Configuration Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Card Configuration</h3>
              {selectedVariant && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">Editing: {variantName}</span>
              )}
            </div>

            {/* Variant Name and Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Variant Name</label>
                <input
                  type="text"
                  value={variantName}
                  onChange={(e) => setVariantName(e.target.value)}
                  placeholder="e.g., Compact List"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <input
                  type="text"
                  value={variantDescription}
                  onChange={(e) => setVariantDescription(e.target.value)}
                  placeholder="Brief description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Configuration Sections */}
            <div className="space-y-6">
              {/* Field Selection */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Fields to Display</h4>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { key: 'showTitle', label: 'Title' },
                    { key: 'showAuthors', label: 'Authors' },
                    { key: 'showAffiliations', label: 'Affiliations' },
                    { key: 'showPublicationDate', label: 'Publication Date' },
                    { key: 'showAccessType', label: 'Access Type' },
                    { key: 'showJournal', label: 'Journal' },
                    { key: 'showVolume', label: 'Volume' },
                    { key: 'showIssue', label: 'Issue' },
                    { key: 'showPages', label: 'Pages' },
                    { key: 'showDoi', label: 'DOI' },
                    { key: 'showAbstract', label: 'Abstract' },
                    { key: 'showKeywords', label: 'Keywords' },
                    { key: 'showCitations', label: 'Citations' },
                    { key: 'showUsageMetrics', label: 'Usage Metrics' },
                    { key: 'showPdfLink', label: 'PDF Link' },
                    { key: 'showFullTextLink', label: 'Full Text Link' }
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editingConfig[key as keyof PublicationCardConfig] as boolean || false}
                        onChange={(e) => setEditingConfig({...editingConfig, [key]: e.target.checked})}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Layout Configuration */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Layout Configuration</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Layout Style</label>
                    <select
                      value={editingConfig.layout}
                      onChange={(e) => setEditingConfig({...editingConfig, layout: e.target.value as any})}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    >
                      <option value="compact">Compact</option>
                      <option value="comfortable">Comfortable</option>
                      <option value="spacious">Spacious</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Thumbnail Position</label>
                    <select
                      value={editingConfig.thumbnailPosition}
                      onChange={(e) => setEditingConfig({...editingConfig, thumbnailPosition: e.target.value as any})}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    >
                      <option value="none">None</option>
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                      <option value="top">Top</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Thumbnail Size</label>
                    <select
                      value={editingConfig.thumbnailSize}
                      onChange={(e) => setEditingConfig({...editingConfig, thumbnailSize: e.target.value as any})}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Actions */}
            <div className="flex gap-3 pt-6 border-t">
              {selectedVariant ? (
                <>
                  <button
                    onClick={handleUpdateVariant}
                    disabled={!variantName.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Update Variant
                  </button>
                  <button
                    onClick={handleSaveAsNewVariant}
                    disabled={!variantName.trim()}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Save as New
                  </button>
                  <button
                    onClick={() => {
                      setSelectedVariant(null)
                      setVariantName('')
                      setVariantDescription('')
                    }}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Clear
                  </button>
                </>
              ) : (
                <button
                  onClick={handleCreateVariant}
                  disabled={!variantName.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Create Variant
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          {/* Saved Variants */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Saved Variants</h3>
            <div className="space-y-2">
              {publicationCardVariants.map((variant) => (
                <div
                  key={variant.id}
                  className={`p-3 border rounded cursor-pointer transition-colors ${
                    selectedVariant === variant.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleLoadVariant(variant)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">{variant.name}</h4>
                      {variant.description && (
                        <p className="text-xs text-gray-600">{variant.description}</p>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removePublicationCardVariant(variant.id)
                        if (selectedVariant === variant.id) {
                          setSelectedVariant(null)
                          setVariantName('')
                          setVariantDescription('')
                        }
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {publicationCardVariants.length === 0 && (
                <p className="text-sm text-gray-500 italic">No saved variants yet</p>
              )}
            </div>
          </div>

          {/* Live Preview */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Preview</h3>
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="text-sm text-gray-600 mb-2">Preview will update as you change settings above</div>
              <div className="bg-white p-4 rounded border">
                <div className="text-lg font-semibold">Sample Publication Title</div>
                <div className="text-sm text-gray-600 mt-1">Authors: Dr. Jane Smith, Prof. John Doe</div>
                <div className="text-sm text-gray-500 mt-1">Journal of Advanced Research • 2024</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
