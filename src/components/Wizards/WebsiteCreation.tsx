import { useState } from 'react'
import { X, Palette } from 'lucide-react'

// TODO: Add proper type imports when extracting store
interface Website {
  id: string
  name: string
  domain: string
  themeId: string
  status: string
  createdAt: Date
  updatedAt: Date
  modifications: any[]
  customSections: any[]
  branding: any
  purpose: any
  deviationScore: number
  lastThemeSync: Date
}

interface Theme {
  id: string
  name: string
  description: string
  version: string
  publishingType: string
  templates: any[]
  colors: {
    primary: string
    secondary: string
  }
  typography: {
    headingFont: string
  }
  customizationRules: {
    colors: {
      canModifyPrimary: boolean
    }
  }
}

interface WebsiteCreationWizardProps {
  onClose: () => void
  usePageStore: any // TODO: Type this properly when extracting store
  themePreviewImages: Record<string, string>
}

export function WebsiteCreationWizard({ onClose, usePageStore, themePreviewImages }: WebsiteCreationWizardProps) {
  const { addWebsite, themes: availableThemes } = usePageStore()
  const [step, setStep] = useState(1)
  const [websiteData, setWebsiteData] = useState({
    name: '',
    themeId: '',
    purpose: {
      contentTypes: [] as string[],
      hasSubjectOrganization: false,
      publishingTypes: [] as string[]
    },
    branding: {
      primaryColor: '',
      secondaryColor: '',
      logoUrl: '',
      fontFamily: ''
    },
    customizations: [] as Array<{path: string, value: string, reason: string}>
  })
  
  const totalSteps = 3
  const selectedTheme = availableThemes.find((t: Theme) => t.id === websiteData.themeId)
  
  const handleCreate = () => {
    const themeBranding = selectedTheme ? {
      primaryColor: selectedTheme.colors.primary,
      secondaryColor: selectedTheme.colors.secondary,
      logoUrl: '',
      fontFamily: selectedTheme.typography.headingFont
    } : websiteData.branding

    const newWebsite: Website = {
      id: crypto.randomUUID(),
      name: websiteData.name,
      domain: `${websiteData.name.toLowerCase().replace(/\s+/g, '-')}.wiley.com`, // Auto-generate from name
      themeId: websiteData.themeId,
      status: 'staging',
      createdAt: new Date(),
      updatedAt: new Date(),
      modifications: websiteData.customizations.map(c => ({
        path: c.path,
        originalValue: getDefaultValueForPath(c.path),
        modifiedValue: c.value,
        modifiedAt: 'website' as const,
        modifiedBy: 'Current User',
        timestamp: new Date(),
        reason: c.reason
      })),
      customSections: [],
      branding: {
        ...themeBranding,
        ...Object.fromEntries(
          Object.entries(websiteData.branding).filter(([_, value]) => value !== '')
        )
      },
      // Store the purpose configuration for future use
      purpose: websiteData.purpose,
      deviationScore: calculateInitialDeviation(websiteData.customizations, selectedTheme),
      lastThemeSync: new Date()
    }
    
    addWebsite(newWebsite)
    onClose()
  }
  
  const getDefaultValueForPath = (path: string) => {
    // Simple mapping of paths to default values
    const defaults: Record<string, any> = {
      'branding.logo': '/default-logo.svg',
      'branding.primaryColor': '#1e40af',
      'typography.headingFont': 'Inter, sans-serif',
      'sections.hero.title': 'Welcome to Our Site'
    }
    return defaults[path] || 'default-value'
  }
  
  const calculateInitialDeviation = (customizations: any[], theme: Theme | undefined) => {
    if (!theme) return 0
    let score = 0
    // For themes, we calculate deviation based on how many customizations diverge from theme standards
    score = customizations.length * 10 // Simple scoring for now
    return Math.min(score, 100)
  }
  
  const nextStep = () => setStep(Math.min(step + 1, totalSteps))
  const prevStep = () => setStep(Math.max(step - 1, 1))
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Create New Website</h3>
              <p className="text-gray-600 mt-1">Step {step} of {totalSteps}</p>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="mb-8">
            <div className="flex items-center">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div key={i} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    i + 1 <= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {i + 1}
                  </div>
                  {i < totalSteps - 1 && (
                    <div className={`h-1 w-16 mx-2 ${
                      i + 1 < step ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex mt-2">
              <div className="text-xs text-gray-600 w-8 text-center">Theme</div>
              <div className="text-xs text-gray-600 w-24 text-center">Purpose</div>
              <div className="text-xs text-gray-600 w-24 text-center">Details</div>
            </div>
          </div>
          
          <div className="min-h-[400px]">
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Choose Publishing Theme</h4>
                  <p className="text-gray-600 mb-6">Select a complete theme package for your publishing platform</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-96 overflow-y-auto">
                    {availableThemes.map((theme: Theme) => (
                      <div 
                        key={theme.id}
                        onClick={() => setWebsiteData({...websiteData, themeId: theme.id})}
                        className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                          websiteData.themeId === theme.id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="h-32 rounded mb-4 overflow-hidden border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 relative">
                          <img 
                            src={themePreviewImages[theme.id as keyof typeof themePreviewImages]} 
                            alt={`${theme.name} theme preview (designed by Gemini)`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback to showing theme info if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                          <div className="absolute inset-0 hidden items-center justify-center flex-col text-gray-500">
                            <Palette className="w-8 h-8 mb-2" />
                            <span className="text-xs font-medium">{theme.name} Theme</span>
                          </div>
                        </div>
                        <h5 className="font-medium text-gray-900 text-lg">{theme.name}</h5>
                        <p className="text-sm text-gray-600 mt-1 mb-3">{theme.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`px-2 py-1 text-xs rounded-full bg-green-100 text-green-800`}>
                              {theme.publishingType}
                            </div>
                            <span className="text-xs text-gray-500">v{theme.version}</span>
                          </div>
                          <span className="text-xs text-gray-500">{theme.templates.length} templates</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {selectedTheme && (
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Palette className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                          <h6 className="font-medium text-blue-900">{selectedTheme.name}</h6>
                          <p className="text-sm text-blue-700 mt-1">{selectedTheme.description}</p>
                          <div className="mt-3">
                            <div className="text-xs font-medium text-blue-800 mb-2">Included Templates:</div>
                            <div className="flex flex-wrap gap-1">
                              {selectedTheme.templates.map((template: any) => (
                                <span key={template.id} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                                  {template.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Define the Website's Purpose</h4>
                  <p className="text-gray-600 mb-6">
                    Help us configure your website by telling us about the content you'll be publishing and how you want to organize it.
                  </p>
                  
                  <div className="mb-8">
                    <label className="block text-base font-medium text-gray-900 mb-4">
                      What type of content will you be publishing?
                    </label>
                    <p className="text-sm text-gray-600 mb-4">Select all that apply. This will enable the appropriate templates and features.</p>
                    
                    <div className="space-y-3">
                      {[
                        { id: 'journals', label: 'Journals', description: 'Academic journals, research articles, and peer-reviewed content' },
                        { id: 'books', label: 'Books', description: 'eBooks, textbooks, monographs, and book series' },
                        { id: 'conferences', label: 'Conference Proceedings', description: 'Conference papers, abstracts, and presentation materials' }
                      ].map((contentType) => (
                        <label key={contentType.id} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={websiteData.purpose.contentTypes.includes(contentType.id)}
                            onChange={(e) => {
                              const newContentTypes = e.target.checked
                                ? [...websiteData.purpose.contentTypes, contentType.id]
                                : websiteData.purpose.contentTypes.filter(type => type !== contentType.id)
                              setWebsiteData({
                                ...websiteData, 
                                purpose: {...websiteData.purpose, contentTypes: newContentTypes}
                              })
                            }}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{contentType.label}</div>
                            <div className="text-sm text-gray-600">{contentType.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-8">
                    <label className="block text-base font-medium text-gray-900 mb-4">
                      Will your site organize content by subject area?
                    </label>
                    <p className="text-sm text-gray-600 mb-4">
                      This enables taxonomy features like subject browsing, categorization, and filtering.
                    </p>
                    
                    <div className="space-y-3">
                      <label className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name="subjectOrganization"
                          checked={websiteData.purpose.hasSubjectOrganization === true}
                          onChange={() => setWebsiteData({
                            ...websiteData, 
                            purpose: {...websiteData.purpose, hasSubjectOrganization: true}
                          })}
                          className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500 mt-0.5"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">Yes (Enable Taxonomy Features)</div>
                          <div className="text-sm text-gray-600">Enable subject browsing, categories, and content filtering by topic</div>
                        </div>
                      </label>
                      
                      <label className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name="subjectOrganization"
                          checked={websiteData.purpose.hasSubjectOrganization === false}
                          onChange={() => setWebsiteData({
                            ...websiteData, 
                            purpose: {...websiteData.purpose, hasSubjectOrganization: false}
                          })}
                          className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500 mt-0.5"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">No</div>
                          <div className="text-sm text-gray-600">Keep content organization simple without subject-based categorization</div>
                        </div>
                      </label>
                    </div>
                  </div>
                  
                  {selectedTheme && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <Palette className="w-5 h-5 text-blue-600" />
                        <h5 className="font-medium text-blue-900">Selected Theme: {selectedTheme.name}</h5>
                      </div>
                      <p className="text-sm text-blue-700 mb-3">{selectedTheme.description}</p>
                      
                      {websiteData.purpose.contentTypes.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-blue-200">
                          <div className="text-sm text-blue-800 font-medium mb-2">
                            Recommended features for your content types:
                          </div>
                          <div className="text-sm text-blue-700 space-y-1">
                            {websiteData.purpose.contentTypes.includes('journals') && (
                              <div>• Article templates, peer-review workflows, citation management</div>
                            )}
                            {websiteData.purpose.contentTypes.includes('books') && (
                              <div>• Chapter navigation, table of contents, book series organization</div>
                            )}
                            {websiteData.purpose.contentTypes.includes('conferences') && (
                              <div>• Proceedings organization, presentation materials, abstract browsing</div>
                            )}
                            {websiteData.purpose.hasSubjectOrganization && (
                              <div>• Subject taxonomy, advanced filtering, topic-based navigation</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Website Details & Launch</h4>
                  <p className="text-gray-600 mb-6">
                    Complete your website setup with naming and optional branding customizations.
                  </p>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Website Name *</label>
                    <input
                      type="text"
                      value={websiteData.name}
                      onChange={(e) => setWebsiteData({...websiteData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="e.g., Journal of Advanced Materials"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Domain: {websiteData.name ? `${websiteData.name.toLowerCase().replace(/\s+/g, '-')}.wiley.com` : 'your-site-name.wiley.com'}
                    </p>
                  </div>
                  
                  {selectedTheme && (
                    <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <h5 className="font-medium text-gray-900 mb-3">Theme Defaults ({selectedTheme.name})</h5>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">Primary Color:</span>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-4 h-4 rounded border" style={{backgroundColor: selectedTheme.colors.primary}}></div>
                            <span className="text-gray-700">{selectedTheme.colors.primary}</span>
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Typography:</span>
                          <span className="text-gray-700 ml-2">{selectedTheme.typography.headingFont}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="mb-6">
                    <h5 className="font-medium text-gray-900 mb-3">Custom Branding (Optional)</h5>
                    <p className="text-sm text-gray-600 mb-4">
                      Customize your brand colors and logo. Leave blank to use theme defaults.
                    </p>
                  
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Custom Logo URL</label>
                        <input
                          type="url"
                          value={websiteData.branding.logoUrl}
                          onChange={(e) => setWebsiteData({
                            ...websiteData,
                            branding: {...websiteData.branding, logoUrl: e.target.value}
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="https://example.com/logo.svg"
                        />
                      </div>
                      
                      {selectedTheme?.customizationRules.colors.canModifyPrimary && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Custom Primary Color</label>
                          <input
                            type="color"
                            value={websiteData.branding.primaryColor || selectedTheme.colors.primary}
                            onChange={(e) => setWebsiteData({
                              ...websiteData,
                              branding: {...websiteData.branding, primaryColor: e.target.value}
                            })}
                            className="w-full h-10 border border-gray-300 rounded-md"
                          />
                        </div>
                      )}
                    </div>
                    
                    {selectedTheme && !selectedTheme.customizationRules.colors.canModifyPrimary && (
                      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-amber-700 text-sm">
                          <strong>Note:</strong> The "{selectedTheme.name}" theme has locked colors to maintain design integrity. 
                          You can set a logo, but color customization will be limited after website creation.
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h5 className="font-medium text-blue-900 mb-4">Website Summary</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-blue-800">Name:</span> 
                        <span className="text-blue-700 ml-2">{websiteData.name || 'Untitled Website'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-blue-800">Theme:</span> 
                        <span className="text-blue-700 ml-2">{selectedTheme?.name || 'None selected'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-blue-800">Content Types:</span> 
                        <span className="text-blue-700 ml-2">
                          {websiteData.purpose.contentTypes.length > 0 
                            ? websiteData.purpose.contentTypes.map(type => type.charAt(0).toUpperCase() + type.slice(1)).join(', ')
                            : 'None selected'
                          }
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-blue-800">Subject Organization:</span> 
                        <span className="text-blue-700 ml-2">
                          {websiteData.purpose.hasSubjectOrganization ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-blue-800">Templates:</span> 
                        <span className="text-blue-700 ml-2">{selectedTheme?.templates.length || 0} included</span>
                      </div>
                      <div>
                        <span className="font-medium text-blue-800">Status:</span> 
                        <span className="text-blue-700 ml-2">Ready to launch</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <div className="flex gap-2">
              {step > 1 && (
                <button
                  onClick={prevStep}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Previous
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              {step < totalSteps ? (
                <button
                  onClick={nextStep}
                  disabled={(step === 1 && !websiteData.themeId) || (step === 2 && websiteData.purpose.contentTypes.length === 0)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleCreate}
                  disabled={!websiteData.name || !websiteData.themeId}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Website
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
