import { useState, useEffect } from 'react'
import { nanoid } from 'nanoid'
import { Palette } from 'lucide-react'
import { getStarterTemplateForTheme } from '../../utils/themeStarters'
import { useBrandingStore } from '../../stores/brandingStore'
import { ALL_TEMPLATES } from '../SiteManager/SiteManagerTemplates'
import { WebsiteTemplates } from '../SiteManager/WebsiteTemplates'
import { createStandardHeaderPrefab, createStandardFooterPrefab } from '../PageBuilder/prefabSections'

// TODO: Add proper type imports when extracting store
interface Website {
  id: string
  name: string
  domain: string
  themeId: string
  brandMode?: 'wiley' | 'wt' | 'dummies'
  status: string
  createdAt: Date
  updatedAt: Date
  modifications: any[]
  customSections: any[]
  branding: any
  purpose: any
  selectedTemplates?: string[]
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
  modificationRules?: {
    colors: {
      canModifyPrimary: boolean
    }
  }
}

interface WebsiteCreationWizardProps {
  onComplete: (website: Website) => void
  onCancel: () => void
  usePageStore: any // TODO: Type this properly when extracting store
  themePreviewImages: Record<string, string>
}

interface PageStore {
  addWebsite: (website: any) => void
  themes: any[]
  setCurrentWebsiteId: (id: string) => void
  replaceCanvasItems: (items: any[]) => void
  setCurrentView: (view: string) => void
}

export function WebsiteCreationWizard({ onComplete, onCancel, usePageStore, themePreviewImages }: WebsiteCreationWizardProps) {
  const { addWebsite, themes: availableThemes, setCurrentWebsiteId, replaceCanvasItems, setCurrentView } = usePageStore() as PageStore
  const { initializeWebsiteBranding, updateWebsiteBranding } = useBrandingStore()
  const [step, setStep] = useState(1)
  const [websiteData, setWebsiteData] = useState({
    name: '',
    themeId: availableThemes.length > 0 ? availableThemes[0].id : '', // Auto-select first theme
    brandMode: 'wiley' as 'wiley' | 'wt' | 'dummies', // Default brand mode
    purpose: {
      contentTypes: [] as string[],
      hasSubjectOrganization: undefined as boolean | undefined,
      publishingTypes: [] as string[]
    },
    selectedTemplates: [] as string[], // Track which templates user wants
    branding: {
      primaryColor: '',
      secondaryColor: '',
      logoUrl: '',
      fontFamily: ''
    },
    modifications: [] as Array<{path: string, value: string, reason: string}>
  })
  const [selectedTemplates, setSelectedTemplates] = useState<Set<string>>(new Set())
  
  const totalSteps = 4
  const selectedTheme = availableThemes.find((t: Theme) => t.id === websiteData.themeId)
  
  // Get relevant templates based on purpose (for initializing selection)
  const getRelevantTemplates = () => {
    return ALL_TEMPLATES.filter((template: any) => {
      // Filter out Subject Browse template if subject organization is not enabled
      if (template.id === 'subject-browse-taxonomy' && !websiteData.purpose.hasSubjectOrganization) {
        return false
      }
      
      // Always include 'general' templates
      if (!template.contentType || template.contentType === 'general') {
        return true
      }
      
      // Include templates matching selected content types
      return websiteData.purpose.contentTypes.includes(template.contentType)
    })
  }
  
  // Initialize selected templates when entering step 2 (all selected by default)
  useEffect(() => {
    if (step === 2) {
      const relevantTemplates = getRelevantTemplates()
      const templateIds = relevantTemplates.map((t: any) => t.id)
      setSelectedTemplates(new Set(templateIds))
    }
  }, [step, websiteData.purpose.contentTypes, websiteData.purpose.hasSubjectOrganization])
  
  // Toggle template selection
  const toggleTemplateSelection = (templateId: string) => {
    setSelectedTemplates(prev => {
      const newSet = new Set(prev)
      if (newSet.has(templateId)) {
        newSet.delete(templateId)
      } else {
        newSet.add(templateId)
      }
      return newSet
    })
  }
  
  const handleCreate = () => {
    const themeBranding = selectedTheme ? {
      primaryColor: selectedTheme.colors.primary,
      secondaryColor: selectedTheme.colors.secondary,
      logoUrl: '',
      fontFamily: selectedTheme.typography.headingFont
    } : websiteData.branding

    const newWebsite: Website = {
      id: nanoid(),
      name: websiteData.name,
      domain: `${websiteData.name.toLowerCase().replace(/\s+/g, '-')}.wiley.com`, // Auto-generate from name
      themeId: websiteData.themeId,
      brandMode: websiteData.brandMode, // Use selected brand mode
      status: 'staging',
      createdAt: new Date(),
      updatedAt: new Date(),
      modifications: websiteData.modifications.map(c => ({
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
      // Store selected templates
      selectedTemplates: Array.from(selectedTemplates),
      deviationScore: calculateInitialDeviation(websiteData.modifications, selectedTheme),
      lastThemeSync: new Date(),
      // Default site layout with standard header and footer
      siteLayout: {
        headerEnabled: true,
        footerEnabled: true,
        header: [createStandardHeaderPrefab()],
        footer: [createStandardFooterPrefab()]
      }
    }
    
    // Add website to store
    addWebsite(newWebsite)
    
    // Initialize branding store with theme colors
    initializeWebsiteBranding(newWebsite.id)
    if (selectedTheme) {
      updateWebsiteBranding(newWebsite.id, {
        primary: selectedTheme.colors.primary,
        secondary: selectedTheme.colors.secondary,
        accent: selectedTheme.colors.accent,
        background: selectedTheme.colors.background,
        text: selectedTheme.colors.text
      })
    }
    
    // Get starter template for the selected theme
    const starterTemplate = getStarterTemplateForTheme(websiteData.themeId)
    
    // Set as active website and populate with starter template
    setCurrentWebsiteId(newWebsite.id)
    replaceCanvasItems(starterTemplate)
    
    // Navigate to page builder
    setCurrentView('page-builder')
    
    onComplete(newWebsite)
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
  
  const calculateInitialDeviation = (modifications: any[], theme: Theme | undefined) => {
    if (!theme) return 0
    let score = 0
    // For themes, we calculate deviation based on how many modifications diverge from theme standards
    score = modifications.length * 10 // Simple scoring for now
    return Math.min(score, 100)
  }
  
  const nextStep = () => setStep(Math.min(step + 1, totalSteps))
  const prevStep = () => setStep(Math.max(step - 1, 1))
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-gray-600">Step {step} of {totalSteps}</p>
            </div>
          </div>
          
          <div className="mb-8">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div key={i} className="flex flex-col items-center flex-1">
                  <div className="flex items-center w-full">
                    {i > 0 && (
                      <div className={`h-1 flex-1 ${
                        i < step ? 'bg-blue-600' : 'bg-gray-200'
                      }`} />
                    )}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium mx-2 ${
                      i + 1 <= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {i + 1}
                    </div>
                    {i < totalSteps - 1 && (
                      <div className={`h-1 flex-1 ${
                        i + 1 < step ? 'bg-blue-600' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                  <div className={`text-xs mt-2 font-medium ${
                    i + 1 === step ? 'text-blue-600' : 'text-gray-600'
                  }`}>
                    {i === 0 && 'Purpose'}
                    {i === 1 && 'Pages'}
                    {i === 2 && 'Design'}
                    {i === 3 && 'Branding'}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className={step === 2 ? '' : 'min-h-[400px]'}>
            {/* STEP 1: PURPOSE */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">What are you publishing?</h4>
                  <p className="text-gray-600 mb-6">Select all content types your website will publish</p>
                  
                  <div className="space-y-3">
                    {[
                      { id: 'journals', label: 'Academic Journals', description: 'Peer-reviewed research articles, journals, and academic publications' },
                      { id: 'conferences', label: 'Conference Proceedings', description: 'Conference papers, abstracts, and presentation materials' },
                      { id: 'books', label: 'Book Series', description: 'eBooks, textbooks, monographs, and book series' },
                      { id: 'non-peer-reviewed', label: 'Non-Peer Reviewed Content', description: 'News, blogs, opinion pieces, and other editorial content' }
                    ].map((contentType) => (
                      <label key={contentType.id} className={`flex items-start gap-4 p-5 border-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-all ${
                        websiteData.purpose.contentTypes.includes(contentType.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200'
                      }`}>
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
                          <div className="font-semibold text-gray-900 text-lg">{contentType.label}</div>
                          <div className="text-sm text-gray-600 mt-1">{contentType.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                  
                  {websiteData.purpose.contentTypes.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <label className="block text-base font-medium text-gray-900 mb-4">
                        Will your site organize content by subject area?
                      </label>
                      <p className="text-sm text-gray-600 mb-4">
                        This enables taxonomy features like subject browsing, categorization, and filtering.
                      </p>
                      
                      <div className="space-y-3">
                        <label className={`flex items-start gap-4 p-4 border-2 rounded-lg hover:bg-gray-50 cursor-pointer ${
                          websiteData.purpose.hasSubjectOrganization === true
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200'
                        }`}>
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
                        
                        <label className={`flex items-start gap-4 p-4 border-2 rounded-lg hover:bg-gray-50 cursor-pointer ${
                          websiteData.purpose.hasSubjectOrganization === false
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200'
                        }`}>
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
                  )}
                </div>
              </div>
            )}
            
            {/* STEP 2: PAGE TEMPLATES */}
            {step === 2 && selectedTheme && (
              <div>
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Review & Select Page Templates</h4>
                  <p className="text-gray-600">
                    Showing templates for: {' '}
                    {websiteData.purpose.contentTypes.map((type, idx) => {
                      const labels: Record<string, string> = {
                        'journals': 'Academic Journals',
                        'conferences': 'Conference Proceedings',
                        'books': 'Book Series',
                        'non-peer-reviewed': 'Non-Peer Reviewed Content'
                      }
                      return (
                        <span key={type}>
                          {idx > 0 && (idx === websiteData.purpose.contentTypes.length - 1 ? ' and ' : ', ')}
                          <strong>{labels[type]}</strong>
                        </span>
                      )
                    })}
                    {' • '}All templates will be available in your website
                  </p>
                </div>
                
                <WebsiteTemplates
                  websiteId="wizard-preview"
                  websiteName="New Website"
                  enabledContentTypes={websiteData.purpose.contentTypes as any}
                  hasSubjectOrganization={websiteData.purpose.hasSubjectOrganization || false}
                  allTemplates={ALL_TEMPLATES}
                  usePageStore={usePageStore}
                  consoleMode="single"
                  selectionMode={true}
                  selectedTemplates={selectedTemplates}
                  onToggleTemplateSelection={toggleTemplateSelection}
                />
              </div>
            )}
            
            {/* STEP 3: DESIGN/THEME */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">How should your pages look?</h4>
                  <p className="text-gray-600 mb-6">Choose a design system for your website</p>
                  
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
            
            {/* STEP 4: BRANDING */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Customize your brand colors</h4>
                  <p className="text-gray-600 mb-6">
                    Name your website and customize brand colors
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
                    <>
                      {/* Brand Mode Selector - only for DS V2 theme */}
                      {selectedTheme.id === 'wiley-figma-ds-v2' && (
                        <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
                          <label className="block text-sm font-semibold text-gray-800 mb-2">
                            🎨 Brand Mode
                          </label>
                          <p className="text-xs text-gray-600 mb-3">
                            Choose which design system to use. This affects all colors and can be changed later in website settings.
                          </p>
                          <div className="flex gap-2">
                            {[
                              { value: 'wiley' as const, label: 'Wiley (Green)', color: '#00d875' },
                              { value: 'wt' as const, label: 'WT (Olive)', color: '#3c711a' },
                              { value: 'dummies' as const, label: 'Dummies (Gold)', color: '#74520f' }
                            ].map((brand) => {
                              const isActive = websiteData.brandMode === brand.value
                              return (
                                <button
                                  key={brand.value}
                                  type="button"
                                  onClick={() => setWebsiteData({...websiteData, brandMode: brand.value})}
                                  className={`
                                    flex-1 px-4 py-3 text-sm font-medium rounded-md transition-all
                                    ${isActive 
                                      ? 'bg-blue-600 text-white shadow-md' 
                                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                    }
                                  `}
                                >
                                  <div className="flex items-center justify-center gap-2">
                                    <div 
                                      className="w-3 h-3 rounded-full border-2 border-white" 
                                      style={{backgroundColor: brand.color}}
                                    />
                                    {brand.label}
                                  </div>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )}
                      
                      <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <h5 className="font-medium text-gray-900 mb-3">Theme Defaults ({selectedTheme.name})</h5>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-600">Primary Color:</span>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="w-4 h-4 rounded border" style={{backgroundColor: (() => {
                                // Show brand-specific color for DS V2
                                if (selectedTheme.id === 'wiley-figma-ds-v2' && (selectedTheme as any).colors?.foundation?.primaryData?.[600]) {
                                  const brandColors = (selectedTheme as any).colors.foundation.primaryData[600]
                                  return brandColors[websiteData.brandMode] || selectedTheme.colors.primary
                                }
                                return selectedTheme.colors.primary
                              })()}}></div>
                              <span className="text-gray-700">{(() => {
                                // Show brand-specific color for DS V2
                                if (selectedTheme.id === 'wiley-figma-ds-v2' && (selectedTheme as any).colors?.foundation?.primaryData?.[600]) {
                                  const brandColors = (selectedTheme as any).colors.foundation.primaryData[600]
                                  return brandColors[websiteData.brandMode] || selectedTheme.colors.primary
                                }
                                return selectedTheme.colors.primary
                              })()}</span>
                            </div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Typography:</span>
                            <span className="text-gray-700 ml-2">{(() => {
                              // Show brand-specific typography for Wiley DS V2
                              if (selectedTheme.id === 'wiley-figma-ds-v2' && (selectedTheme as any).typography?.[websiteData.brandMode]) {
                                const brandTypography = (selectedTheme as any).typography[websiteData.brandMode]
                                return `${brandTypography.headingFont}, ${brandTypography.bodyFont}`
                              }
                              // Fallback to default for other themes
                              return selectedTheme.typography.headingFont
                            })()}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {/* Hide Custom Branding for DS V2 - uses multi-brand foundation system instead */}
                  {selectedTheme && selectedTheme.id !== 'wiley-figma-ds-v2' && (
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
                        
                        {selectedTheme?.modificationRules?.colors?.canModifyPrimary && (
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
                      
                      {selectedTheme && !selectedTheme.modificationRules?.colors?.canModifyPrimary && (
                        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <p className="text-amber-700 text-sm">
                            <strong>Note:</strong> The "{selectedTheme.name}" theme has locked colors to maintain design integrity. 
                            You can set a logo, but color modification will be limited after website creation.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  
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
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              {step < totalSteps ? (
                <button
                  onClick={nextStep}
                  disabled={
                    (step === 1 && (
                      websiteData.purpose.contentTypes.length === 0 || 
                      websiteData.purpose.hasSubjectOrganization === undefined
                    )) ||
                    (step === 3 && !websiteData.themeId)
                  }
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
  )
}
