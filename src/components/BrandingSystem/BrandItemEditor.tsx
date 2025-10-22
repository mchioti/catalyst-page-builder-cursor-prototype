import React, { useState } from 'react';
import { ColorPicker } from './ColorPicker';
import type { BrandItemEditorProps, BrandColors } from '../../types/branding';

export const BrandItemEditor: React.FC<BrandItemEditorProps> = ({
  item,
  onSave,
  onCancel,
  onDelete
}) => {
  const [formData, setFormData] = useState({
    name: item.name,
    description: item.description || '',
    colors: { ...item.colors },
    ...(item.hasOwnProperty('slug') && { slug: (item as any).slug }),
    ...(item.hasOwnProperty('icon') && { icon: (item as any).icon || '' }),
    ...(item.hasOwnProperty('publisher') && { publisher: (item as any).publisher || '' })
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    // Validate hex colors
    const hexColorPattern = /^#[0-9A-Fa-f]{6}$/;
    Object.entries(formData.colors).forEach(([key, value]) => {
      if (!hexColorPattern.test(value)) {
        newErrors[`colors.${key}`] = 'Must be a valid hex color (e.g., #FF0000)';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave({
        ...item,
        ...formData
      });
    }
  };

  const handleColorChange = (colorKey: keyof BrandColors, value: string) => {
    setFormData(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorKey]: value
      }
    }));
  };

  const getItemTypeLabel = () => {
    if (item.hasOwnProperty('slug') && (item as any).slug) {
      const slugs = ['biology', 'mathematics', 'chemistry', 'engineering'];
      if (slugs.includes((item as any).slug)) return 'Subject';
    }
    if (item.hasOwnProperty('publisher')) return 'Book Series';
    return 'Journal';
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Edit {getItemTypeLabel()}: {item.name}
        </h3>
        <div className="flex items-center gap-2">
          {onDelete && (
            <button
              onClick={() => onDelete(item.id)}
              className="px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50 transition-colors"
            >
              Delete
            </button>
          )}
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Save
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 border-b border-gray-200 pb-2">
            Basic Information
          </h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter name..."
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Optional description..."
            />
          </div>

          {/* Conditional fields based on item type */}
          {formData.hasOwnProperty('icon') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Icon (Emoji)
              </label>
              <input
                type="text"
                value={(formData as any).icon}
                onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="🧬"
                maxLength={2}
              />
            </div>
          )}

          {formData.hasOwnProperty('publisher') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Publisher
              </label>
              <input
                type="text"
                value={(formData as any).publisher}
                onChange={(e) => setFormData(prev => ({ ...prev, publisher: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Publisher name..."
              />
            </div>
          )}
        </div>

        {/* Color Configuration */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 border-b border-gray-200 pb-2">
            Brand Colors
          </h4>

          <ColorPicker
            label="Primary Color"
            value={formData.colors.primary}
            onChange={(value) => handleColorChange('primary', value)}
          />
          {errors['colors.primary'] && (
            <p className="text-xs text-red-600">{errors['colors.primary']}</p>
          )}

          <ColorPicker
            label="Secondary Color"
            value={formData.colors.secondary}
            onChange={(value) => handleColorChange('secondary', value)}
          />

          <ColorPicker
            label="Accent Color"
            value={formData.colors.accent}
            onChange={(value) => handleColorChange('accent', value)}
          />

          <ColorPicker
            label="Text Color"
            value={formData.colors.text}
            onChange={(value) => handleColorChange('text', value)}
          />

          <ColorPicker
            label="Background Color"
            value={formData.colors.background}
            onChange={(value) => handleColorChange('background', value)}
          />
        </div>
      </div>

      {/* Color Preview */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="font-medium text-gray-900 mb-3">Preview</h4>
        <div 
          className="p-4 rounded-lg border"
          style={{ 
            backgroundColor: formData.colors.background,
            borderColor: formData.colors.secondary 
          }}
        >
          <h5 
            className="font-semibold mb-2"
            style={{ color: formData.colors.text }}
          >
            {formData.name} Branding Preview
          </h5>
          <div className="flex gap-2 mb-3">
            <button
              className="px-3 py-1.5 text-sm rounded font-medium transition-colors"
              style={{ 
                backgroundColor: formData.colors.primary,
                color: 'white'
              }}
            >
              Primary Button
            </button>
            <button
              className="px-3 py-1.5 text-sm rounded font-medium border transition-colors"
              style={{ 
                color: formData.colors.primary,
                borderColor: formData.colors.primary,
                backgroundColor: 'transparent'
              }}
            >
              Secondary Button
            </button>
          </div>
          <p style={{ color: formData.colors.text }}>
            This is how text will appear with your branding colors.{' '}
            <span 
              className="underline cursor-pointer"
              style={{ color: formData.colors.accent }}
            >
              Links will use the accent color.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};
