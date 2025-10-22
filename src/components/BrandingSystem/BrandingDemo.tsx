import React, { useState } from 'react';
import { BrandedWrapper, useBranding } from '../../hooks/useBranding';
import type { ContentBranding } from '../../types/branding';

interface BrandingDemoProps {
  websiteId: string;
  websiteName: string;
}

export const BrandingDemo: React.FC<BrandingDemoProps> = ({ websiteId, websiteName }) => {
  const [selectedContent, setSelectedContent] = useState<ContentBranding>({
    subjects: ['biology']
  });

  const contentOptions: { label: string; content: ContentBranding }[] = [
    { label: 'Biology Article', content: { subjects: ['biology'] } },
    { label: 'Mathematics Article', content: { subjects: ['mathematics'] } },
    { label: 'Chemistry Article', content: { subjects: ['chemistry'] } },
    { label: 'Engineering Article', content: { subjects: ['engineering'] } },
    { label: 'Nature Journal Article', content: { journal: 'nature' } },
    { label: 'Science Journal Article', content: { journal: 'science' } },
    { label: 'Biology + Nature', content: { subjects: ['biology'], journal: 'nature' } },
    { label: 'Default Website', content: {} }
  ];

  const { resolved, cssClasses, cssVariables } = useBranding(websiteId, selectedContent);

  if (!resolved) {
    return (
      <div className="p-6 bg-white rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {websiteName} Branding Demo
        </h3>
        <p className="text-gray-600">
          Branding system not initialized for this website. Please refresh the page.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {websiteName} Branding Demo
      </h3>
      
      {/* Content Type Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Content Type:
        </label>
        <select
          value={JSON.stringify(selectedContent)}
          onChange={(e) => setSelectedContent(JSON.parse(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {contentOptions.map((option, index) => (
            <option key={index} value={JSON.stringify(option.content)}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Branding Info */}
      <div className="mb-6 p-4 bg-gray-50 rounded-md">
        <h4 className="font-medium text-gray-900 mb-2">Applied Branding:</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Source:</span> {resolved.source.name} ({resolved.source.type})
          </div>
          <div>
            <span className="font-medium">Priority:</span> {resolved.source.priority}
          </div>
          <div className="col-span-2">
            <span className="font-medium">CSS Classes:</span> {cssClasses.join(', ')}
          </div>
        </div>
      </div>

      {/* Demo Content */}
      <BrandedWrapper websiteId={websiteId} content={selectedContent} className="p-6 rounded-lg border-2">
        <div>
          <h4 className="text-xl font-bold mb-3" style={{ color: 'var(--brand-text)' }}>
            Sample {resolved.source.name} Content
          </h4>
          
          <p className="mb-4" style={{ color: 'var(--brand-text)' }}>
            This content is automatically styled using the{' '}
            <strong>{resolved.source.name}</strong> branding theme. The colors and styling
            adapt based on the content context.
          </p>
          
          <div className="flex gap-3 mb-4">
            <button 
              className="branded-button px-4 py-2 rounded-md font-medium"
            >
              Primary Action
            </button>
            <button 
              className="branded-button-outline px-4 py-2 rounded-md font-medium"
            >
              Secondary Action
            </button>
          </div>
          
          <p className="text-sm mb-3" style={{ color: 'var(--brand-text)' }}>
            Links are also themed automatically:{' '}
            <a href="#" className="branded-link">
              This is a branded link
            </a>{' '}
            that uses the accent color.
          </p>
          
          <div className="branded-badge inline-block px-3 py-1 text-xs rounded-full font-medium">
            {resolved.source.type.toUpperCase()} BADGE
          </div>
        </div>
      </BrandedWrapper>

      {/* Color Palette Display */}
      <div className="mt-6">
        <h4 className="font-medium text-gray-900 mb-3">Color Palette:</h4>
        <div className="grid grid-cols-5 gap-3">
          {Object.entries(resolved.colors).map(([name, color]) => (
            <div key={name} className="text-center">
              <div
                className="w-12 h-12 rounded-md border border-gray-300 mx-auto mb-2"
                style={{ backgroundColor: color }}
              />
              <p className="text-xs font-medium text-gray-700 capitalize">{name}</p>
              <p className="text-xs text-gray-500 font-mono">{color}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
