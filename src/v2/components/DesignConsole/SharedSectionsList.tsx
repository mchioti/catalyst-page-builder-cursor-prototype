/**
 * Shared Sections List
 * Browse and manage shared sections in the Design Console
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSharedSectionsStore } from '../../stores/sharedSectionsStore'
import { useWebsiteStore } from '../../stores/websiteStore'
import { Layers, Edit, Globe, ArrowRight, Link2 } from 'lucide-react'
import { getVariationStats, isBaseVariation } from '../../utils/variationResolver'

export function SharedSectionsList() {
  const sections = useSharedSectionsStore(state => state.sections)
  const websites = useWebsiteStore(state => state.websites)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  
  // Calculate usage for each section
  const getSectionUsage = (sectionId: string) => {
    const websitesUsing = new Set<string>()
    
    websites.forEach(website => {
      website.pages.forEach(page => {
        const compositionItem = page.composition.find(item => item.sharedSectionId === sectionId)
        if (compositionItem) {
          websitesUsing.add(website.id)
        }
      })
    })
    
    return { websiteCount: websitesUsing.size }
  }
  
  const categories = ['all', 'header', 'footer', 'hero', 'content', 'cta', 'navigation', 'announcement']
  const categoryLabels: Record<string, string> = {
    all: 'All Sections',
    header: 'Headers',
    footer: 'Footers',
    hero: 'Hero Sections',
    content: 'Content Blocks',
    cta: 'Call to Actions',
    navigation: 'Navigation',
    announcement: 'Announcements'
  }
  
  const filteredSections = selectedCategory === 'all'
    ? sections
    : sections.filter(s => s.category === selectedCategory)
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Shared Sections</h2>
          <p className="text-gray-600 mt-1">
            Manage reusable sections across your websites
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
          + Create Section
        </button>
      </div>
      
      {/* Category Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              selectedCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {categoryLabels[category]}
            {category === 'all' && (
              <span className="ml-2 text-sm opacity-70">({sections.length})</span>
            )}
          </button>
        ))}
      </div>
      
      {/* Sections Grid */}
      {filteredSections.length === 0 ? (
        <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <Layers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No sections in this category
          </h3>
          <p className="text-gray-600 mb-4">
            Create your first {categoryLabels[selectedCategory].toLowerCase()} section
          </p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Create Section
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredSections.map(section => {
            const usage = getSectionUsage(section.id)
            const variationCount = Object.keys(section.variations).length
            
            return (
              <div
                key={section.id}
                className="bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
              >
                {/* Section Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {section.name}
                        </h3>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                          {section.category}
                        </span>
                        {section.isGlobal && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                            Global
                          </span>
                        )}
                      </div>
                      {section.description && (
                        <p className="text-sm text-gray-600">{section.description}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Layers className="w-4 h-4" />
                      <span>{variationCount} variation{variationCount !== 1 ? 's' : ''}</span>
                    </div>
                    {usage.websiteCount > 0 && (
                      <div className="flex items-center gap-1 text-gray-600">
                        <Globe className="w-4 h-4" />
                        <span>{usage.websiteCount} website{usage.websiteCount !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Variations List */}
                <div className="p-4 space-y-2">
                  {Object.entries(section.variations).map(([key, variation]) => {
                    // Calculate usage for THIS specific variation
                    let variationPageCount = 0
                    let variationWithOverrides = 0
                    websites.forEach(website => {
                      website.pages.forEach(page => {
                        const item = page.composition.find(
                          ci => ci.sharedSectionId === section.id && ci.variationKey === key
                        )
                        if (item) {
                          variationPageCount++
                          if (item.divergenceCount > 0 || item.overrides?.widgets?.length) {
                            variationWithOverrides++
                          }
                        }
                      })
                    })
                    
                    // Get parent variation for inheritance stats
                    const parentVariation = variation.inheritsFrom 
                      ? section.variations[variation.inheritsFrom] 
                      : undefined
                    const stats = getVariationStats(variation, parentVariation)
                    const isBase = isBaseVariation(variation)
                    
                    return (
                      <div
                        key={key}
                        className={`flex items-center justify-between p-3 rounded transition-colors ${
                          isBase 
                            ? 'bg-blue-50 border border-blue-200 hover:bg-blue-100' 
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {/* Inheritance indicator */}
                            {variation.inheritsFrom && (
                              <Link2 className="w-3 h-3 text-blue-600" />
                            )}
                            
                            <div className="font-medium text-sm text-gray-900">{variation.name}</div>
                            
                            {/* Base badge */}
                            {isBase && (
                              <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                                Base
                              </span>
                            )}
                            
                            {/* Usage badge */}
                            {variationPageCount > 0 && (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                                {variationPageCount} page{variationPageCount !== 1 ? 's' : ''}
                              </span>
                            )}
                            
                            {/* Modifications badge */}
                            {variationWithOverrides > 0 && (
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
                                {variationWithOverrides} modified
                              </span>
                            )}
                          </div>
                          
                          {/* Inheritance info */}
                          {variation.inheritsFrom && (
                            <div className="flex items-center gap-1 text-xs text-blue-600 mt-1">
                              <ArrowRight className="w-3 h-3" />
                              <span>inherits from {section.variations[variation.inheritsFrom]?.name || variation.inheritsFrom}</span>
                            </div>
                          )}
                          
                          {/* Widget stats */}
                          <div className="text-xs text-gray-500 mt-1">
                            {variation.layout} • {stats.total} widget{stats.total !== 1 ? 's' : ''}
                            {variation.inheritsFrom && (
                              <span className="ml-2">
                                ({stats.inherited} inherited
                                {stats.overridden > 0 && `, ${stats.overridden} overridden`}
                                {stats.hidden > 0 && `, ${stats.hidden} hidden`}
                                {stats.added > 0 && `, ${stats.added} added`})
                              </span>
                            )}
                          </div>
                        </div>
                        <Link
                          to={`/v2/design/section/${section.id}/${key}`}
                          className="px-3 py-1.5 bg-white border border-gray-200 text-sm font-medium text-gray-700 rounded hover:bg-gray-50 transition-colors flex items-center gap-1"
                        >
                          <Edit className="w-3 h-3" />
                          Edit
                        </Link>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

