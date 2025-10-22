import React, { useState } from 'react';
import type { ColorPickerProps } from '../../types/branding';

export const ColorPicker: React.FC<ColorPickerProps> = ({ 
  label, 
  value, 
  onChange, 
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Common color palette for quick selection
  const commonColors = [
    '#F59E0B', '#3B82F6', '#10B981', '#F97316', // Subject defaults
    '#DC2626', '#7C3AED', '#059669', '#6366F1', // Journal colors
    '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', // Additional options
    '#F59E0B', '#EC4899', '#6B7280', '#1F2937'  // More options
  ];

  const handleColorSelect = (color: string) => {
    onChange(color);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      
      <div className="flex items-center gap-3">
        {/* Color Preview */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 rounded-md border-2 border-gray-300 shadow-sm transition-all hover:scale-105 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          style={{ backgroundColor: value }}
          title={`Current color: ${value}`}
        />
        
        {/* Hex Input */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="#000000"
          pattern="^#[0-9A-Fa-f]{6}$"
        />
        
        {/* Native Color Picker */}
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
          title="Open color picker"
        />
      </div>
      
      {/* Color Palette Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 p-3 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[200px]">
          <p className="text-xs text-gray-500 mb-2">Quick Colors:</p>
          <div className="grid grid-cols-4 gap-2">
            {commonColors.map((color, index) => (
              <button
                key={index}
                onClick={() => handleColorSelect(color)}
                className={`w-8 h-8 rounded border-2 transition-all hover:scale-110 ${
                  value === color ? 'border-gray-800 ring-2 ring-blue-500' : 'border-gray-300'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
          
          <div className="mt-3 pt-2 border-t border-gray-200">
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
