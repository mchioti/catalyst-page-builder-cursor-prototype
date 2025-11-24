/**
 * Section Library Sidebar
 * Browse available shared sections and their variations
 */

import { useSharedSectionsStore } from '../../stores/sharedSectionsStore'
import { useEditorStore } from '../../stores/editorStore'
import { Layers, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { nanoid } from 'nanoid'
import type { SectionCompositionItem } from '../../types/core'

export function SectionLibrary() {
  const sections = useSharedSectionsStore(state => state.sections)
  const addSection = useEditorStore(state => state.addSection)
  const [expandedSections, setExpandedSections] = useState<string[]>(['header-main'])
  
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }
  
  const handleAddVariation = (sharedSectionId: string, variationKey: string) => {
    const compositionItem: SectionCompositionItem = {
      id: nanoid(),
      sharedSectionId,
      variationKey,
      inheritFromTheme: true,
      divergenceCount: 0
    }
    addSection(compositionItem)
  }
  
  // Group sections by category
  const sectionsByCategory = sections.reduce((acc, section) => {
    if (!acc[section.category]) {
      acc[section.category] = []
    }
    acc[section.category].push(section)
    return acc
  }, {} as Record<string, typeof sections>)
  
  const categoryIcons = {
    header: '📋',
    footer: '📄',
    hero: '🎯',
    content: '📝',
    cta: '🔔',
    navigation: '🧭',
    announcement: '📢'
  }
  
  const categoryLabels = {
    header: 'Headers',
    footer: 'Footers',
    hero: 'Hero Sections',
    content: 'Content Blocks',
    cta: 'Call to Actions',
    navigation: 'Navigation',
    announcement: 'Announcements'
  }
  
  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <Layers className="w-5 h-5 text-blue-600" />
          <h2 className="font-semibold text-gray-900">Section Library</h2>
        </div>
        <p className="text-xs text-gray-500">
          Click to add sections to your page
        </p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Object.entries(sectionsByCategory).map(([category, categorySections]) => (
          <div key={category}>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-2">
              <span>{categoryIcons[category as keyof typeof categoryIcons]}</span>
              <span>{categoryLabels[category as keyof typeof categoryLabels]}</span>
              <span className="ml-auto bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                {categorySections.length}
              </span>
            </h3>
            
            <div className="space-y-2">
              {categorySections.map(section => {
                const isExpanded = expandedSections.includes(section.id)
                const variationCount = Object.keys(section.variations).length
                
                return (
                  <div key={section.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Section Header */}
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center gap-2 text-left"
                    >
                      <ChevronRight 
                        className={`w-4 h-4 text-gray-400 transition-transform ${
                          isExpanded ? 'rotate-90' : ''
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-900 truncate">
                          {section.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {variationCount} variation{variationCount !== 1 ? 's' : ''}
                        </div>
                      </div>
                      {section.isGlobal && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                          Global
                        </span>
                      )}
                    </button>
                    
                    {/* Variations List */}
                    {isExpanded && (
                      <div className="bg-white divide-y divide-gray-100">
                        {Object.entries(section.variations).map(([key, variation]) => (
                          <button
                            key={key}
                            onClick={() => handleAddVariation(section.id, key)}
                            className="w-full px-3 py-2 hover:bg-blue-50 transition-colors text-left group"
                          >
                            <div className="flex items-center gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-700 group-hover:text-blue-700 truncate">
                                  {variation.name}
                                </div>
                                {variation.description && (
                                  <div className="text-xs text-gray-500 truncate">
                                    {variation.description}
                                  </div>
                                )}
                              </div>
                              <div className="text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                + Add
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500">
          💡 <strong>Tip:</strong> Sections are reusable. Changes to shared sections 
          propagate to all pages using them.
        </div>
      </div>
    </div>
  )
}

