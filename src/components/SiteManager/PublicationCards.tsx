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
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newVariant, setNewVariant] = useState<Partial<PublicationCardVariant>>({
    name: '',
    description: '',
    config: {
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
    }
  })

  const handleCreateVariant = () => {
    if (!newVariant.name || !newVariant.config) return
    
    const variant: PublicationCardVariant = {
      id: crypto.randomUUID(),
      name: newVariant.name,
      description: newVariant.description,
      config: newVariant.config,
      createdAt: new Date()
    }
    
    addPublicationCardVariant(variant)
    setShowCreateForm(false)
    setNewVariant({
      name: '',
      description: '',
      config: {
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
      }
    })
  }

  const updateConfig = (updates: Partial<PublicationCardConfig>) => {
    setNewVariant(prev => ({
      ...prev,
      config: { ...prev.config!, ...updates }
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Publication Cards</h2>
          <p className="text-gray-600 mt-1">Configure how publication metadata is displayed across your site</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Create New Variant
        </button>
      </div>

      {/* Existing Variants */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {publicationCardVariants.map((variant) => (
          <div
            key={variant.id}
            className={`p-4 border rounded-lg cursor-pointer transition-all ${
              selectedVariant === variant.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedVariant(selectedVariant === variant.id ? null : variant.id)}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-gray-900">{variant.name}</h3>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removePublicationCardVariant(variant.id)
                }}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {variant.description && (
              <p className="text-sm text-gray-600 mb-3">{variant.description}</p>
            )}
            
            {/* Preview of config */}
            <div className="text-xs text-gray-500 space-y-1">
              <div>Layout: {variant.config.layout}</div>
              <div>Thumbnail: {variant.config.thumbnailPosition}</div>
              <div>Fields: {Object.entries(variant.config).filter(([key, value]) => 
                key.startsWith('show') && value === true
              ).length} enabled</div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Create Publication Card Variant</h3>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Settings */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Variant Name
                  </label>
                  <input
                    type="text"
                    value={newVariant.name || ''}
                    onChange={(e) => setNewVariant(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Compact View"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newVariant.description || ''}
                    onChange={(e) => setNewVariant(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Optional description..."
                  />
                </div>

                {/* Layout Settings */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Layout</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Layout Style</label>
                    <select
                      value={newVariant.config?.layout || 'comfortable'}
                      onChange={(e) => updateConfig({ layout: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="compact">Compact</option>
                      <option value="comfortable">Comfortable</option>
                      <option value="spacious">Spacious</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail Position</label>
                    <select
                      value={newVariant.config?.thumbnailPosition || 'left'}
                      onChange={(e) => updateConfig({ thumbnailPosition: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="none">No thumbnail</option>
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                      <option value="top">Top</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail Size</label>
                    <select
                      value={newVariant.config?.thumbnailSize || 'medium'}
                      onChange={(e) => updateConfig({ thumbnailSize: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Field Configuration */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Fields to Display</h4>
                
                <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto">
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
                    <label key={key} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={newVariant.config?.[key as keyof PublicationCardConfig] || false}
                        onChange={(e) => updateConfig({ [key]: e.target.checked })}
                        className="rounded border-gray-300 focus:ring-blue-500"
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>

                {/* Style Options */}
                <div className="space-y-3 pt-4 border-t">
                  <h4 className="font-medium text-gray-900">Style Options</h4>
                  
                  <label className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={newVariant.config?.showBorder || false}
                      onChange={(e) => updateConfig({ showBorder: e.target.checked })}
                      className="rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span>Show Border</span>
                  </label>

                  <label className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={newVariant.config?.showShadow || false}
                      onChange={(e) => updateConfig({ showShadow: e.target.checked })}
                      className="rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span>Show Shadow</span>
                  </label>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Corner Radius</label>
                    <select
                      value={newVariant.config?.cornerRadius || 'medium'}
                      onChange={(e) => updateConfig({ cornerRadius: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="none">None</option>
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateVariant}
                disabled={!newVariant.name}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Create Variant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
