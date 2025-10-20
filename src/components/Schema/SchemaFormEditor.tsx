import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import type { SchemaOrgType, SchemaObject } from '../../types/schema'
import { SCHEMA_DEFINITIONS } from '../../types/schema'

interface SchemaFormEditorProps {
  schemaType: SchemaOrgType
  initialData?: Partial<SchemaObject>
  onSave: (data: Omit<SchemaObject, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
}

export function SchemaFormEditor({ schemaType, initialData, onSave, onCancel }: SchemaFormEditorProps) {
  const definition = SCHEMA_DEFINITIONS[schemaType]
  const [formData, setFormData] = useState<Record<string, any>>(initialData?.data || {})
  const [objectName, setObjectName] = useState(initialData?.name || '')
  const [tags, setTags] = useState<string[]>(initialData?.tags || [])
  const [tagInput, setTagInput] = useState('')
  
  // Generate JSON-LD from form data
  const generateJsonLD = () => {
    const jsonLD = {
      "@context": "https://schema.org",
      "@type": schemaType,
      ...formData
    }
    return JSON.stringify(jsonLD, null, 2)
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    const missingRequired = definition.requiredProperties.filter(
      prop => !formData[prop] || formData[prop].toString().trim() === ''
    )
    
    if (missingRequired.length > 0) {
      alert(`Please fill in required fields: ${missingRequired.join(', ')}`)
      return
    }
    
    onSave({
      type: schemaType,
      name: objectName || formData.name || `${definition.label} ${Date.now()}`,
      data: formData,
      jsonLD: generateJsonLD(),
      tags
    })
  }
  
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }
  
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }
  
  const renderFormField = (property: any) => {
    const value = formData[property.name] || ''
    
    const updateField = (newValue: any) => {
      setFormData(prev => ({
        ...prev,
        [property.name]: newValue
      }))
    }
    
    switch (property.type) {
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => updateField(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder={property.placeholder}
          />
        )
      
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => updateField(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Select {property.label} --</option>
            {property.options?.map((option: string) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        )
      
      case 'boolean':
        return (
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => updateField(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Yes</span>
          </label>
        )
      
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => updateField(e.target.value ? parseFloat(e.target.value) : '')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={property.placeholder}
            min={property.min}
            max={property.max}
          />
        )
      
      default: // text, url, email, tel, date, datetime-local
        return (
          <input
            type={property.type}
            value={value}
            onChange={(e) => updateField(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={property.placeholder}
            pattern={property.pattern}
          />
        )
    }
  }

  if (!definition) {
    return (
      <div className="p-4">
        <div className="text-center py-12">
          <p className="text-red-500">Schema definition not found for type: {schemaType}</p>
          <button onClick={onCancel} className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
            Cancel
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{definition.label}</h3>
          <p className="text-sm text-gray-500">{definition.description}</p>
        </div>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Object Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Object Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={objectName}
            onChange={(e) => setObjectName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Give this object a descriptive name"
            required
          />
          <p className="text-xs text-gray-500 mt-1">Internal name for managing this object</p>
        </div>
        
        {/* Schema Properties */}
        {definition.properties.map((property) => (
          <div key={property.name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {property.label}
              {property.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {renderFormField(property)}
            {property.description && (
              <p className="text-xs text-gray-500 mt-1">{property.description}</p>
            )}
          </div>
        ))}
        
        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add a tag..."
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200"
            >
              Add
            </button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
        
        {/* JSON-LD Preview */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">JSON-LD Preview</label>
          <pre className="w-full p-3 bg-gray-50 border border-gray-300 rounded-md text-xs overflow-auto max-h-40">
            {generateJsonLD()}
          </pre>
        </div>
        
        {/* Actions */}
        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
          >
            {initialData ? 'Update' : 'Save'} Object
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md font-medium hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}