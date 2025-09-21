import React, { useState } from 'react'
import { ChevronRight, AlertTriangle, Layers, Target, Zap, Info } from 'lucide-react'
import type { PageState } from '../../App'

// Template hierarchy levels (from the document)
type TemplateLevel = 'theme' | 'global' | 'publication' | 'journal' | 'section'

// Override types (from the document)  
type OverrideType = 'default' | 'broaden' | 'narrow'

// Extended template type for override management
type TemplateWithOverrides = {
  id: string
  name: string
  level: TemplateLevel
  description?: string
  inheritsFrom?: string
  appliedTo: string[] // What this template affects
  overrides?: {
    type: OverrideType
    scope: string[]
    changes: any
  }
}

type UsePageStore = () => any

interface TemplateOverrideManagerProps {
  usePageStore: () => UsePageStore
}

export function TemplateOverrideManager({ usePageStore }: TemplateOverrideManagerProps) {
  // Mock template data for prototyping the override system
  const mockTemplates: TemplateWithOverrides[] = [
    {
      id: 'theme-academic-1',
      name: 'Academic Publishing Theme',
      level: 'theme',
      description: 'Professional theme for academic journals and publications',
      appliedTo: ['All websites using Academic theme'],
    },
    {
      id: 'global-header-1', 
      name: 'Standard Header',
      level: 'global',
      description: 'Global header template with logo and navigation',
      appliedTo: ['All pages', '15 websites', '200+ pages'],
    },
    {
      id: 'pub-journal-home-1',
      name: 'Journal Home Layout',
      level: 'publication', 
      description: 'Homepage layout for academic journals',
      appliedTo: ['Journal homepages', '12 active journals'],
    },
    {
      id: 'journal-nature-1',
      name: 'Nature Journal Specific',
      level: 'journal',
      description: 'Custom overrides for Nature journal brand', 
      appliedTo: ['Nature journal only', 'Homepage', 'Article pages'],
    },
    {
      id: 'section-article-card-1',
      name: 'Article Card Component',
      level: 'section',
      description: 'Individual article card layout and styling',
      appliedTo: ['Article listings', '50+ pages', 'Homepage cards'],
    }
  ]
  
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateWithOverrides | null>(null)
  const [selectedOverrideType, setSelectedOverrideType] = useState<OverrideType>('default')
  const [showImpactAnalysis, setShowImpactAnalysis] = useState(false)
  const [selectedScope, setSelectedScope] = useState<string[]>([])

  // Template hierarchy levels in order
  const hierarchyLevels: { level: TemplateLevel; label: string; icon: any; description: string }[] = [
    { 
      level: 'theme', 
      label: 'Theme', 
      icon: Layers, 
      description: 'Foundation styles and brand identity' 
    },
    { 
      level: 'global', 
      label: 'Global Templates', 
      icon: Target, 
      description: 'Site-wide components and layouts' 
    },
    { 
      level: 'publication', 
      label: 'Publication Templates', 
      icon: Zap, 
      description: 'Publication-specific layouts and styles' 
    },
    { 
      level: 'journal', 
      label: 'Journal Home/Article Page', 
      icon: Info, 
      description: 'Journal-specific page templates' 
    },
    { 
      level: 'section', 
      label: 'Section Templates', 
      icon: ChevronRight, 
      description: 'Individual page sections and components' 
    }
  ]

  // Override type configurations
  const overrideTypes: { type: OverrideType; label: string; color: string; description: string; impact: string }[] = [
    {
      type: 'default',
      label: 'Default Override',
      color: 'blue',
      description: 'Standard template inheritance - child inherits from parent',
      impact: 'Changes will apply to this template and all its children'
    },
    {
      type: 'broaden',
      label: 'Broaden Override', 
      color: 'green',
      description: 'Expand template scope - apply to more contexts',
      impact: 'Changes will apply to additional scopes beyond normal inheritance'
    },
    {
      type: 'narrow',
      label: 'Narrow Override',
      color: 'orange', 
      description: 'Restrict template scope - apply to fewer contexts',
      impact: 'Changes will apply to a limited subset of normal inheritance'
    }
  ]

  // Get templates by hierarchy level
  const getTemplatesByLevel = (level: TemplateLevel) => {
    return mockTemplates.filter(t => t.level === level)
  }

  // Calculate impact analysis
  const calculateImpact = (template: TemplateWithOverrides, overrideType: OverrideType, scope: string[]) => {
    const affectedItems = template.appliedTo || []
    
    switch (overrideType) {
      case 'broaden':
        return [...affectedItems, ...scope]
      case 'narrow':
        return affectedItems.filter(item => scope.includes(item))
      default:
        return affectedItems
    }
  }

  // Render hierarchy breadcrumb
  const renderHierarchyPath = (template: TemplateWithOverrides) => {
    const levelIndex = hierarchyLevels.findIndex(h => h.level === template.level)
    const pathLevels = hierarchyLevels.slice(0, levelIndex + 1)
    
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
        {pathLevels.map((level, idx) => (
          <div key={level.level} className="flex items-center">
            {idx > 0 && <ChevronRight className="w-4 h-4 mx-1" />}
            <level.icon className="w-4 h-4 mr-1" />
            <span className={idx === levelIndex ? 'font-medium text-gray-900' : ''}>{level.label}</span>
          </div>
        ))}
      </div>
    )
  }

  // Render impact analysis
  const renderImpactAnalysis = () => {
    if (!selectedTemplate) return null
    
    const impact = calculateImpact(selectedTemplate, selectedOverrideType, selectedScope)
    
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 mr-3" />
          <div>
            <h4 className="font-medium text-amber-900">Impact Analysis</h4>
            <p className="text-sm text-amber-800 mt-1">
              This {selectedOverrideType} override will affect <strong>{impact.length} items</strong>:
            </p>
            <ul className="text-sm text-amber-800 mt-2 space-y-1">
              {impact.slice(0, 5).map((item, idx) => (
                <li key={idx} className="flex items-center">
                  <div className="w-1 h-1 bg-amber-600 rounded-full mr-2" />
                  {item}
                </li>
              ))}
              {impact.length > 5 && (
                <li className="text-amber-700 font-medium">
                  ... and {impact.length - 5} more
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-900">Template Override Manager</h2>
        <p className="text-gray-600 mt-1">
          Manage template inheritance and overrides across the 5-level hierarchy
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Template Hierarchy Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Template Hierarchy</h3>
            
            <div className="space-y-3">
              {hierarchyLevels.map((hierarchyLevel) => {
                const levelTemplates = getTemplatesByLevel(hierarchyLevel.level)
                
                return (
                  <div key={hierarchyLevel.level} className="space-y-2">
                    {/* Level Header */}
                    <div className="flex items-center text-sm font-medium text-gray-700">
                      <hierarchyLevel.icon className="w-4 h-4 mr-2" />
                      {hierarchyLevel.label}
                    </div>
                    
                    {/* Templates at this level */}
                    <div className="ml-6 space-y-1">
                      {levelTemplates.length === 0 ? (
                        <div className="text-xs text-gray-500 italic">No templates</div>
                      ) : (
                        levelTemplates.map((template) => (
                          <button
                            key={template.id}
                            onClick={() => setSelectedTemplate(template)}
                            className={`w-full text-left px-2 py-1 text-xs rounded transition-colors ${
                              selectedTemplate?.id === template.id
                                ? 'bg-blue-100 text-blue-900'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            {template.name}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Main Override Configuration */}
        <div className="lg:col-span-3">
          {selectedTemplate ? (
            <div className="space-y-6">
              {/* Selected Template Info */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                {renderHierarchyPath(selectedTemplate)}
                
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{selectedTemplate.name}</h3>
                {selectedTemplate.description && (
                  <p className="text-gray-600 mb-4">{selectedTemplate.description}</p>
                )}
                
                {/* Current Application */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Currently Applied To:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplate.appliedTo?.length ? (
                      selectedTemplate.appliedTo.map((item, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {item}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 text-sm italic">Not applied anywhere</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Override Type Selection */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Override Configuration</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {overrideTypes.map((override) => (
                    <button
                      key={override.type}
                      onClick={() => setSelectedOverrideType(override.type)}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        selectedOverrideType === override.type
                          ? `border-${override.color}-500 bg-${override.color}-50`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`font-medium ${
                        selectedOverrideType === override.type ? `text-${override.color}-900` : 'text-gray-900'
                      }`}>
                        {override.label}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">{override.description}</div>
                    </button>
                  ))}
                </div>

                {/* Override Impact Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-blue-900">
                    {overrideTypes.find(o => o.type === selectedOverrideType)?.label} Impact
                  </h4>
                  <p className="text-sm text-blue-800 mt-1">
                    {overrideTypes.find(o => o.type === selectedOverrideType)?.impact}
                  </p>
                </div>

                {/* Scope Selection (for broaden/narrow) */}
                {selectedOverrideType !== 'default' && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Scope Selection</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Available Scopes
                        </label>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {['All Journals', 'Journal A', 'Journal B', 'Article Pages', 'Home Pages', 'Section Headers'].map((scope) => (
                            <label key={scope} className="flex items-center text-sm">
                              <input
                                type="checkbox"
                                checked={selectedScope.includes(scope)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedScope([...selectedScope, scope])
                                  } else {
                                    setSelectedScope(selectedScope.filter(s => s !== scope))
                                  }
                                }}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                              />
                              {scope}
                            </label>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Selected Scopes
                        </label>
                        <div className="bg-gray-50 rounded p-3 min-h-32">
                          {selectedScope.length ? (
                            <div className="space-y-1">
                              {selectedScope.map((scope, idx) => (
                                <span key={idx} className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full mr-1 mb-1">
                                  {scope}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-sm italic">No scopes selected</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Impact Analysis Toggle */}
                <div className="flex justify-between items-center mt-6">
                  <button
                    onClick={() => setShowImpactAnalysis(!showImpactAnalysis)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    {showImpactAnalysis ? 'Hide' : 'Show'} Impact Analysis
                  </button>
                  
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    Apply Override
                  </button>
                </div>

                {/* Impact Analysis */}
                {showImpactAnalysis && renderImpactAnalysis()}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <Layers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Template</h3>
              <p className="text-gray-600">
                Choose a template from the hierarchy on the left to configure overrides
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
