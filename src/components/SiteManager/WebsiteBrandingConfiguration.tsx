import React from 'react';
import { Palette, Image, Brush, Settings } from 'lucide-react';
import { ThemeEditor } from './ThemeEditor';
import { WebsiteThemeManager } from '../BrandingSystem';

interface WebsiteBrandingConfigurationProps {
  websiteId: string;
  usePageStore: any;
}

export const WebsiteBrandingConfiguration: React.FC<WebsiteBrandingConfigurationProps> = ({
  websiteId,
  usePageStore
}) => {
  const { websites, updateWebsite, themes } = usePageStore();
  const website = websites.find((w: any) => w.id === websiteId);
  const currentTheme = website ? themes.find((t: any) => t.id === website.themeId) : null;

  if (!website) {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Website Not Found</h3>
        <p className="text-gray-600">Could not find website with ID: {websiteId}</p>
      </div>
    );
  }

  const handleBrandingUpdate = (field: string, value: string) => {
    const updatedWebsite = {
      ...website,
      branding: {
        ...website.branding,
        [field]: value
      },
      updatedAt: new Date()
    };
    updateWebsite(website.id, updatedWebsite);
  };


  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Branding Configuration</h2>
        <p className="text-gray-600">
          Manage all visual branding aspects for <strong>{website.name}</strong> including logo, theme, and content-specific branding.
        </p>
      </div>

      {/* Logo & Basic Branding */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Image className="w-5 h-5 text-blue-600" />
          Website Logo
          <span className="text-xs font-normal bg-yellow-100 text-yellow-800 px-2 py-1 rounded">TBD</span>
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Configure your website's logo and basic visual identity elements. <em>Note: Fallback branding behavior is under discussion.</em>
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Logo URL</label>
            <input
              type="url"
              value={website.branding?.logoUrl || ''}
              onChange={(e) => handleBrandingUpdate('logoUrl', e.target.value)}
              placeholder="https://example.com/logo.svg"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              SVG or PNG format recommended for best quality
            </p>
          </div>
          
          {/* Logo Preview */}
          {website.branding?.logoUrl && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Logo Preview</label>
              <div className="border border-gray-200 rounded-md p-4 bg-gray-50 flex items-center justify-center h-20">
                <img 
                  src={website.branding.logoUrl} 
                  alt="Website Logo" 
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).parentElement!.innerHTML = '<span class="text-gray-400 text-sm">Failed to load image</span>';
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Website Theme Configuration */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Brush className="w-5 h-5 text-purple-600" />
          Website Theme Configuration
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Configure the visual theme for your website including colors, typography, and layout preferences. Theme selection requires technical implementation.
        </p>

        {/* Current Theme Display */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-3">Current Theme</label>
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            {currentTheme ? (
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{currentTheme.name}</h4>
                <p className="text-sm text-gray-600">{currentTheme.description}</p>
              </div>
            ) : (
              <p className="text-gray-500 italic">No theme selected</p>
            )}
          </div>
        </div>

        {/* Theme Configuration */}
        {currentTheme && (
          <div>
            <h4 className="text-base font-medium text-gray-900 mb-4">Theme Configuration</h4>
            <ThemeEditor 
              usePageStore={usePageStore} 
              themeId={website.themeId} 
              websiteId={website.id} 
            />
          </div>
        )}
      </div>

      {/* Advanced Content-Specific Branding */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Palette className="w-5 h-5 text-green-600" />
          Advanced Content-Specific Branding
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Configure specialized branding for different content types including subject categories, journals, and book series. This allows content to automatically apply appropriate branding based on its context.
        </p>

        <div className="bg-gray-50 rounded-lg p-1">
          <WebsiteThemeManager websiteId={website.id} websiteName={website.name} />
        </div>
      </div>

      {/* Configuration Summary */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Branding Configuration Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-blue-800">Logo:</span>
            <span className="text-blue-700 ml-2">
              {website.branding?.logoUrl ? 'Configured' : 'Not set'}
            </span>
          </div>
          <div>
            <span className="font-medium text-blue-800">Theme:</span>
            <span className="text-blue-700 ml-2">
              {currentTheme?.name || 'Not selected'}
            </span>
          </div>
          <div>
            <span className="font-medium text-blue-800">Website:</span>
            <span className="text-blue-700 ml-2">{website.name}</span>
          </div>
          <div>
            <span className="font-medium text-blue-800">Domain:</span>
            <span className="text-blue-700 ml-2">{website.domain}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
