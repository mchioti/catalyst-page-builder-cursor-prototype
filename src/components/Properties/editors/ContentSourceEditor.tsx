/**
 * ContentSourceEditor - Decoupled content engine components
 * 
 * Provides reusable content source selection and configuration:
 * - DOI source (single or multiple selection)
 * - Schema Objects source
 * - AI Generated source
 * - Dynamic Query source (future)
 * 
 * These components can be reused by any widget that needs content
 * from various sources (publications, articles, cards, etc.)
 */

import React from 'react'
import type { Widget, PublicationListWidget, PublicationDetailsWidget } from '../../../types'

// Types for content sources
export type ContentSourceType = 'dynamic-query' | 'doi-list' | 'doi' | 'ai-generated' | 'schema-objects' | 'context'
export type CitationDomain = 'ai-software' | 'chemistry'

// DOI utilities - these would normally come from a service
// For now we import the functions from where they're defined
declare function getDOIsByDomain(domain: CitationDomain): string[]
declare function getAllDOIs(): string[]
declare function getCitationByDOI(doi: string): { title: string; authors: string[]; year: number } | undefined

interface ContentSourceSelectorProps {
  value: ContentSourceType
  onChange: (source: ContentSourceType) => void
  options: ContentSourceType[]
  labels?: Record<ContentSourceType, string>
}

const DEFAULT_LABELS: Record<ContentSourceType, string> = {
  'dynamic-query': 'Dynamic Query',
  'doi-list': 'DOI List',
  'doi': 'DOI',
  'ai-generated': 'AI Generated',
  'schema-objects': 'Schema Objects',
  'context': 'Page Context'
}

/**
 * ContentSourceSelector - Dropdown to select content source type
 */
export function ContentSourceSelector({ value, onChange, options, labels = DEFAULT_LABELS }: ContentSourceSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Content Source</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as ContentSourceType)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md"
      >
        {options.map(option => (
          <option key={option} value={option}>{labels[option]}</option>
        ))}
      </select>
    </div>
  )
}

/**
 * DomainFilter - Reusable domain filter for DOI/AI sources
 */
interface DomainFilterProps {
  value: CitationDomain | ''
  onChange: (domain: CitationDomain | '') => void
  getDOICount: (domain?: CitationDomain) => number
}

export function DomainFilter({ value, onChange, getDOICount }: DomainFilterProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Domain Filter (Optional)</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as CitationDomain | '')}
        className="w-full px-3 py-2 border border-gray-300 rounded-md"
      >
        <option value="">All Domains ({getDOICount()} DOIs)</option>
        <option value="ai-software">🤖 AI & Software Engineering ({getDOICount('ai-software')} DOIs)</option>
        <option value="chemistry">🧪 Chemistry & Materials ({getDOICount('chemistry')} DOIs)</option>
      </select>
      <p className="text-xs text-gray-500 mt-1">Filter available DOIs by research domain</p>
    </div>
  )
}

/**
 * DOIMultiSelect - Multi-select checkboxes for DOI list
 */
interface DOIMultiSelectProps {
  selectedDois: string[]
  onChange: (dois: string[]) => void
  domainFilter?: CitationDomain
  getDOIsByDomain: (domain?: CitationDomain) => string[]
  getCitationByDOI: (doi: string) => { title: string; authors: string[]; year: number } | undefined
}

export function DOIMultiSelect({ 
  selectedDois, 
  onChange, 
  domainFilter,
  getDOIsByDomain,
  getCitationByDOI
}: DOIMultiSelectProps) {
  const availableDois = domainFilter ? getDOIsByDomain(domainFilter) : getDOIsByDomain()
  
  const handleToggle = (doi: string, checked: boolean) => {
    const newDois = checked
      ? [...selectedDois, doi]
      : selectedDois.filter(d => d !== doi)
    onChange(newDois)
  }
  
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Select DOIs</label>
      <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-md p-2 bg-gray-50">
        {availableDois.map(doi => {
          const citation = getCitationByDOI(doi)
          const isSelected = selectedDois.includes(doi)
          return (
            <label 
              key={doi} 
              className={`flex items-start space-x-2 p-2 rounded cursor-pointer transition-colors ${
                isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-100 border border-transparent'
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => handleToggle(doi, e.target.checked)}
                className="mt-1 rounded border-gray-300"
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-mono text-blue-600 mb-0.5">{doi}</div>
                <div className="text-sm font-medium text-gray-900 leading-tight">{citation?.title}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {citation?.authors.slice(0, 2).join(', ')}
                  {citation && citation.authors.length > 2 && ` et al.`} ({citation?.year})
                </div>
              </div>
            </label>
          )
        })}
      </div>
      <div className="flex justify-between items-center mt-2">
        <p className="text-xs text-gray-500">
          <strong>{selectedDois.length}</strong> of {availableDois.length} DOIs selected
        </p>
        {selectedDois.length > 0 && (
          <button
            onClick={() => onChange([])}
            className="text-xs text-red-600 hover:text-red-700 font-medium"
          >
            Clear All
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * DOISingleSelect - Single select dropdown for DOI
 */
interface DOISingleSelectProps {
  value: string
  onChange: (doi: string) => void
  getDOIsByDomain: (domain: CitationDomain) => string[]
  getCitationByDOI: (doi: string) => { title: string; authors: string[]; year: number } | undefined
}

export function DOISingleSelect({ value, onChange, getDOIsByDomain, getCitationByDOI }: DOISingleSelectProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Select DOI</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md"
      >
        <option value="">-- Select a DOI --</option>
        <optgroup label="🤖 AI & Software Engineering">
          {getDOIsByDomain('ai-software').map(doi => {
            const citation = getCitationByDOI(doi)
            return (
              <option key={doi} value={doi}>
                {doi} - {citation?.title.substring(0, 50)}...
              </option>
            )
          })}
        </optgroup>
        <optgroup label="🧪 Chemistry & Materials">
          {getDOIsByDomain('chemistry').map(doi => {
            const citation = getCitationByDOI(doi)
            return (
              <option key={doi} value={doi}>
                {doi} - {citation?.title.substring(0, 50)}...
              </option>
            )
          })}
        </optgroup>
      </select>
      <p className="text-xs text-gray-500 mt-1">
        {value 
          ? `Selected: ${getCitationByDOI(value)?.title || 'Unknown'}`
          : 'Choose from available publications'}
      </p>
    </div>
  )
}

/**
 * SchemaObjectsSelector - Select schema objects by type or ID
 */
interface SchemaObjectsSelectorProps {
  selectionType: 'by-type' | 'by-id'
  selectedType: string
  selectedIds: string[]
  schemaObjects: { id: string; name: string; type: string }[]
  onSelectionTypeChange: (type: 'by-type' | 'by-id') => void
  onTypeChange: (type: string) => void
  onIdsChange: (ids: string[]) => void
}

export function SchemaObjectsSelector({
  selectionType,
  selectedType,
  selectedIds,
  schemaObjects,
  onSelectionTypeChange,
  onTypeChange,
  onIdsChange
}: SchemaObjectsSelectorProps) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Selection Method</label>
        <select
          value={selectionType}
          onChange={(e) => onSelectionTypeChange(e.target.value as 'by-type' | 'by-id')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="by-type">By Type (All objects of a type)</option>
          <option value="by-id">By ID (Specific objects)</option>
        </select>
      </div>

      {selectionType === 'by-type' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Schema Type</label>
          <select
            value={selectedType}
            onChange={(e) => onTypeChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">-- Select type --</option>
            <option value="Article">Articles</option>
            <option value="BlogPosting">Blog Posts</option>
            <option value="NewsArticle">News Articles</option>
            <option value="Event">Events</option>
            <option value="Organization">Organizations</option>
            <option value="Person">People</option>
            <option value="Book">Books</option>
          </select>
          
          {selectedType && (
            <p className="text-xs text-gray-500 mt-1">
              Will show all {schemaObjects.filter(obj => obj.type === selectedType).length} objects of type "{selectedType}"
            </p>
          )}
        </div>
      )}

      {selectionType === 'by-id' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Objects</label>
          <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-2">
            {schemaObjects.length === 0 ? (
              <p className="text-sm text-gray-500 p-2">No schema objects created yet</p>
            ) : (
              schemaObjects.map(obj => (
                <label key={obj.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(obj.id)}
                    onChange={(e) => {
                      const newIds = e.target.checked
                        ? [...selectedIds, obj.id]
                        : selectedIds.filter(id => id !== obj.id)
                      onIdsChange(newIds)
                    }}
                    className="rounded border-gray-300"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{obj.name}</div>
                    <div className="text-xs text-gray-500">{obj.type}</div>
                  </div>
                </label>
              ))
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {selectedIds.length} objects selected
          </p>
        </div>
      )}
    </>
  )
}

/**
 * AIGenerationPrompt - AI content generation with domain filter
 */
interface AIGenerationPromptProps {
  prompt: string
  domain?: CitationDomain | ''
  lastGenerated?: Date
  onPromptChange: (prompt: string) => void
  onDomainChange: (domain: CitationDomain | '') => void
  onGenerate: () => void
  getDOIsByDomain: (domain?: CitationDomain) => string[]
  getCitationByDOI: (doi: string) => { title: string; authors: string[]; year: number } | undefined
  placeholder?: string
}

export function AIGenerationPrompt({
  prompt,
  domain,
  lastGenerated,
  onPromptChange,
  onDomainChange,
  onGenerate,
  getDOIsByDomain,
  getCitationByDOI,
  placeholder = "e.g., generate 6 articles on Organic chemistry..."
}: AIGenerationPromptProps) {
  const availableDois = domain ? getDOIsByDomain(domain as CitationDomain) : getDOIsByDomain()
  
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Domain Filter (Optional)</label>
        <select
          value={domain || ''}
          onChange={(e) => onDomainChange(e.target.value as CitationDomain | '')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="">All Domains</option>
          <option value="ai-software">🤖 AI & Software Engineering</option>
          <option value="chemistry">🧪 Chemistry & Materials</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Example DOIs from {domain === 'ai-software' ? 'AI/Software' : domain === 'chemistry' ? 'Chemistry' : 'All Domains'}
        </label>
        <div className="bg-gray-50 border border-gray-200 rounded-md p-2 max-h-24 overflow-y-auto">
          {availableDois.slice(0, 5).map(doi => {
            const citation = getCitationByDOI(doi)
            return (
              <div key={doi} className="text-xs text-gray-600 mb-1">
                <strong>{doi}</strong> - {citation?.title.substring(0, 60)}...
              </div>
            )
          })}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Showing 5 of {availableDois.length} available DOIs
        </p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">AI Prompt</label>
        <textarea
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
          rows={3}
        />
        <div className="mt-2 flex gap-2">
          <button
            onClick={onGenerate}
            disabled={!prompt.trim()}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            🤖 Generate
          </button>
          {lastGenerated && (
            <span className="text-xs text-gray-500 self-center">
              Last generated: {lastGenerated.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>
    </>
  )
}

export default {
  ContentSourceSelector,
  DomainFilter,
  DOIMultiSelect,
  DOISingleSelect,
  SchemaObjectsSelector,
  AIGenerationPrompt
}

