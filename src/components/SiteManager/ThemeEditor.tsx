import React, { useState, useMemo } from 'react'
import { resolveThemeColors, type BrandMode } from '../../utils/tokenResolver'

// Color input component
function ColorInput({ 
  label, 
  value, 
  onChange, 
  description
}: { 
  label: string
  value: string
  onChange: (value: string) => void
  description?: string
}) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      )}
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-28 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      {description && (
        <p className="text-sm text-gray-600 mt-1.5">{description}</p>
      )}
    </div>
  )
}

// Types
type Theme = {
  id: string
  name: string
  description: string
  version: string
  publishingType: 'journals' | 'books' | 'journals-books' | 'blog' | 'corporate' | 'mixed' | 'academic' | 'visual'
  author: string
  createdAt: Date
  updatedAt: Date
  
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
    muted: string
    semanticColors?: {
      primary?: {
        light: string
        dark: string
        hover?: {
          light: string
          dark: string
        }
      }
      secondary?: {
        bg?: {
          light: string
          dark: string
        }
        text?: {
          light: string
          dark: string
        }
        hover?: {
          bg?: {
            light: string
            dark: string
          }
          text?: {
            light: string
            dark: string
          }
        }
      }
      tertiary?: {
        bg?: {
          light: string
          dark: string
        }
        text?: {
          light: string
          dark: string
        }
        hover?: {
          bg?: {
            light: string
            dark: string
          }
          text?: {
            light: string
            dark: string
          }
        }
      }
    }
  }
  
  typography: {
    headingFont: string
    bodyFont: string
    baseSize: string
    scale: number
  }
  
  spacing: {
    base: string
    scale: number
  }
  
  components: {
    button: Record<string, any>
    card: Record<string, any>
    form: Record<string, any>
  }
  
  // Theme-specific customization rules (what can/cannot be modified)
  customizationRules: {
    colors: {
      canModifyPrimary: boolean
      canModifySecondary: boolean
      canModifyAccent: boolean
      canModifyBackground: boolean
      canModifyText: boolean
      canModifyMuted: boolean
    }
    typography: {
      canModifyHeadingFont: boolean
      canModifyBodyFont: boolean
      canModifyBaseSize: boolean
      canModifyScale: boolean
    }
    spacing: {
      canModifyBase: boolean
      canModifyScale: boolean
    }
    components: {
      canModifyButtonRadius: boolean
      canModifyButtonWeight: boolean
      canModifyCardRadius: boolean
      canModifyCardShadow: boolean
      canModifyFormRadius: boolean
    }
  }
  
  globalSections: {
    header: any
    footer: any
  }
  
  publicationCardVariants: any[]
  templates: any[]
}

// Store hook type
type UsePageStore = {
  themes: Theme[]
  websites: Website[]
  updateTheme: (id: string, theme: Partial<Theme>) => void
  updateWebsite: (id: string, updates: Partial<Website>) => void
}

// Additional type for website
type Website = {
  id: string
  name: string
  themeId: string
  brandMode?: 'wiley' | 'wt' | 'dummies' // For multi-brand themes (DS V2)
  themeOverrides?: {
    colors?: Partial<Theme['colors']>
    typography?: Partial<Theme['typography']>
    spacing?: Partial<Theme['spacing']>  
    components?: Partial<Theme['components']>
  }
}

// Props
interface ThemeEditorProps {
  usePageStore: () => UsePageStore
  themeId?: string // Optional theme ID to start with
  websiteId?: string // If provided, editing for specific website
}

export function ThemeEditor({ usePageStore, themeId, websiteId }: ThemeEditorProps) {
  const { themes, updateTheme, websites, updateWebsite } = usePageStore()
  const selectedTheme = themeId || 'modernist-theme'
  
  const currentTheme = themes.find(t => t.id === selectedTheme)
  const currentWebsite = websiteId ? websites.find(w => w.id === websiteId) : null
  
  // State for pending changes and scope selection (only for theme-level editing)
  const [pendingChanges, setPendingChanges] = useState<{
    colors?: Partial<Theme['colors']>
    typography?: Partial<Theme['typography']>
    spacing?: Partial<Theme['spacing']>
    components?: Partial<Theme['components']>
  }>({})
  const [changeScope, setChangeScope] = useState<'website' | 'theme'>('theme')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  
  // Determine if this is website-level (automatic) or theme-level (needs scope selection)
  const isWebsiteLevel = Boolean(websiteId)
  const isThemeLevel = !websiteId
  
  const updateThemeColors = (colors: Partial<Theme['colors']>) => {
    if (!currentTheme) return
    
    if (isWebsiteLevel && websiteId && currentWebsite) {
      // Website-level: Apply changes immediately to website overrides
      updateWebsite(websiteId, {
        themeOverrides: {
          ...currentWebsite.themeOverrides,
          colors: { ...currentWebsite.themeOverrides?.colors, ...colors }
        }
      })
    } else if (isThemeLevel) {
      // Theme-level: Store as pending changes for batch save
      setPendingChanges(prev => ({
        ...prev,
        colors: { ...prev.colors, ...colors }
      }))
      setHasUnsavedChanges(true)
    }
  }
  
  const updateThemeTypography = (typography: Partial<Theme['typography']>) => {
    if (!currentTheme) return
    
    if (isWebsiteLevel && websiteId && currentWebsite) {
      // Website-level: Apply changes immediately to website overrides
      updateWebsite(websiteId, {
        themeOverrides: {
          ...currentWebsite.themeOverrides,
          typography: { ...currentWebsite.themeOverrides?.typography, ...typography }
        }
      })
    } else if (isThemeLevel) {
      // Theme-level: Store as pending changes for batch save
      setPendingChanges(prev => ({
        ...prev,
        typography: { ...prev.typography, ...typography }
      }))
      setHasUnsavedChanges(true)
    }
  }
  
  const saveChanges = () => {
    if (!currentTheme) return
    
    if (changeScope === 'theme') {
      // Apply changes to the global theme (affects all websites)
      updateTheme(selectedTheme, {
        ...(pendingChanges.colors && { colors: { ...currentTheme.colors, ...pendingChanges.colors } }),
        ...(pendingChanges.typography && { typography: { ...currentTheme.typography, ...pendingChanges.typography } }),
        ...(pendingChanges.spacing && { spacing: { ...currentTheme.spacing, ...pendingChanges.spacing } }),
        ...(pendingChanges.components && { components: { ...currentTheme.components, ...pendingChanges.components } })
      })
    } else if (websiteId && currentWebsite) {
      // Apply changes only to this website
      updateWebsite(websiteId, {
        themeOverrides: {
          ...currentWebsite.themeOverrides,
          ...pendingChanges
        }
      })
    }
    
    setPendingChanges({})
    setHasUnsavedChanges(false)
  }
  
  const cancelChanges = () => {
    setPendingChanges({})
    setHasUnsavedChanges(false)
  }
  
  // Get effective theme values (base theme + website overrides + pending changes)
  const getEffectiveThemeValues = () => {
    if (!currentTheme) return null
    
    const baseTheme = currentTheme
    const websiteOverrides = currentWebsite?.themeOverrides || {}
    
    return {
      colors: { ...baseTheme.colors, ...websiteOverrides.colors, ...pendingChanges.colors },
      typography: { ...baseTheme.typography, ...websiteOverrides.typography, ...pendingChanges.typography },
      spacing: { ...baseTheme.spacing, ...websiteOverrides.spacing, ...pendingChanges.spacing },
      components: { ...baseTheme.components, ...websiteOverrides.components, ...pendingChanges.components }
    }
  }
  
  const rawEffectiveTheme = getEffectiveThemeValues()
  
  // Resolve token references based on website's brand mode
  const brandMode: BrandMode = currentWebsite?.brandMode || 'wiley'
  const effectiveTheme = useMemo(() => {
    if (!rawEffectiveTheme || !currentTheme) return null
    
    // Create a temporary theme object for resolution
    const tempTheme = {
      ...currentTheme,
      colors: rawEffectiveTheme.colors
    }
    
    // Resolve token references based on brand mode
    const resolved = resolveThemeColors(tempTheme, brandMode)
    
    return {
      ...rawEffectiveTheme,
      colors: resolved.colors
    }
  }, [rawEffectiveTheme, currentTheme, brandMode, currentWebsite?.name, websiteId])
  
  const fontOptions = [
    'Inter, sans-serif',
    'Crimson Text, serif',
    'Playfair Display, serif',
    'Source Sans Pro, sans-serif',
    'Georgia, serif',
    'Times New Roman, serif',
    'Arial, sans-serif',
    'Helvetica, sans-serif',
    'Roboto, sans-serif',
    'Open Sans, sans-serif',
    'Lato, sans-serif',
    'Poppins, sans-serif',
    'Montserrat, sans-serif'
  ]
  
  const fontSizeOptions = ['14px', '16px', '18px', '20px', '22px']
  
  if (!currentTheme || !effectiveTheme) {
    return <div>Theme not found</div>
  }
  
  const websiteCount = websites.filter(w => w.themeId === selectedTheme).length

  return (
    <div className="space-y-8">
      {/* Scope Selector and Save Controls - Only for theme-level editing */}
      {isThemeLevel && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-blue-900 mb-2">Theme Modification Scope</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="scope"
                    value="theme"
                    checked={changeScope === 'theme'}
                    onChange={(e) => setChangeScope(e.target.value as 'website' | 'theme')}
                    className="text-blue-600"
                  />
                  <span>Modify the global theme</span>
                  <span className="text-xs text-red-600">({websiteCount} websites will be affected)</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="scope"
                    value="website"
                    checked={changeScope === 'website'}
                    onChange={(e) => setChangeScope(e.target.value as 'website' | 'theme')}
                    className="text-blue-600"
                  />
                  <span>Create website-specific version</span>
                  <span className="text-xs text-gray-500">(requires selecting a specific website)</span>
                </label>
              </div>
            </div>
            
            {hasUnsavedChanges && (
              <div className="flex gap-2">
                <button
                  onClick={cancelChanges}
                  className="px-3 py-1 text-sm border border-gray-300 rounded bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={saveChanges}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
                >
                  Apply Changes
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Colors Section */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Colors</h3>
          </div>
          
          {/* Check if theme supports semantic colors (DS V2) */}
          {effectiveTheme.colors.semanticColors ? (
            <div className="space-y-6">
              {/* Publisher Main Branding */}
              <div>
                <h4 className="text-base font-semibold text-gray-800 mb-2">Publisher Main branding</h4>
                <p className="text-sm text-gray-600 mb-4">Affects menu, backgrounds, buttons</p>
                
                {/* Brand Mode Selector - only at website level and for DS V2 */}
                {isWebsiteLevel && effectiveTheme.colors.foundation && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      🎨 Brand Mode
                    </label>
                    <p className="text-xs text-gray-600 mb-3">
                      Switch between Wiley, WT, and Dummies design systems. All colors will update automatically.
                    </p>
                    <div className="flex gap-2">
                      {(['wiley', 'wt', 'dummies'] as const).map((mode) => {
                        const currentBrandMode = currentWebsite?.brandMode || 'wiley'
                        const isActive = currentBrandMode === mode
                        const labels = {
                          wiley: 'Wiley (Green)',
                          wt: 'WT (Olive)',
                          dummies: 'Dummies (Gold)'
                        }
                        return (
                          <button
                            key={mode}
                            onClick={() => {
                              if (websiteId) {
                                updateWebsite(websiteId, { brandMode: mode })
                              }
                            }}
                            className={`
                              flex-1 px-4 py-3 text-sm font-medium rounded-md transition-all
                              ${isActive 
                                ? 'bg-blue-600 text-white shadow-md' 
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                              }
                            `}
                          >
                            {labels[mode]}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
                
                {/* Legacy flat colors - hidden for DS V2 (uses semantic system instead) */}
                {!effectiveTheme.colors.foundation && (
                  <div className="space-y-4">
                    <ColorInput
                      label="Primary color"
                      value={effectiveTheme.colors.primary}
                      onChange={(value) => updateThemeColors({ primary: value })}
                    />
                    <ColorInput
                      label="Secondary color"
                      value={effectiveTheme.colors.secondary}
                      onChange={(value) => updateThemeColors({ secondary: value })}
                    />
                  </div>
                )}
                
                {/* DS V2: Show explanation for hidden legacy colors */}
                {effectiveTheme.colors.foundation && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-xs text-blue-700">
                      ℹ️ This theme uses a <strong>multi-brand foundation system</strong>. All colors are managed through the button variants below and automatically adapt when you switch brands.
                    </p>
                  </div>
                )}
              </div>
              
              {/* Button Variants */}
              <div className="pt-6 border-t border-gray-200">
                <h4 className="text-base font-semibold text-gray-800 mb-2">Button</h4>
                <p className="text-sm text-gray-600 mb-5">Affects Style of the Button Link widget</p>
                
                {/* Primary Button */}
                <div className="mb-5">
                  <h5 className="text-sm font-medium text-gray-700 mb-3">Primary Button</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <ColorInput
                        label=""
                        value={effectiveTheme.colors.semanticColors?.primary?.light || '#00d875'}
                        onChange={(value) => {
                          const currentSemantic = effectiveTheme.colors.semanticColors || {}
                          const currentPrimary = currentSemantic.primary || { light: '#00d875', dark: '#008f8a' }
                          updateThemeColors({ 
                            semanticColors: {
                              ...currentSemantic,
                              primary: {
                                ...currentPrimary,
                                light: value
                              }
                            }
                          } as any)
                        }}
                        description="Used on dark backgrounds"
                      />
                    </div>
                    <div>
                      <ColorInput
                        label=""
                        value={effectiveTheme.colors.semanticColors?.primary?.dark || '#008f8a'}
                        onChange={(value) => {
                          const currentSemantic = effectiveTheme.colors.semanticColors || {}
                          const currentPrimary = currentSemantic.primary || { light: '#00d875', dark: '#008f8a' }
                          updateThemeColors({ 
                            semanticColors: {
                              ...currentSemantic,
                              primary: {
                                ...currentPrimary,
                                dark: value
                              }
                            }
                          } as any)
                        }}
                        description="Used on light backgrounds"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Secondary Button */}
                <div className="mb-5">
                  <h5 className="text-sm font-medium text-gray-700 mb-3">Secondary Button</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <ColorInput
                        label=""
                        value={effectiveTheme.colors.semanticColors?.secondary?.bg?.light || '#f2f2eb'}
                        onChange={(value) => {
                          const currentSemantic = effectiveTheme.colors.semanticColors || {}
                          const currentSecondary = currentSemantic.secondary || {}
                          const currentBg = currentSecondary.bg || { light: '#f2f2eb', dark: '#f2f2eb' }
                          updateThemeColors({ 
                            semanticColors: {
                              ...currentSemantic,
                              secondary: {
                                ...currentSecondary,
                                bg: {
                                  ...currentBg,
                                  light: value
                                }
                              }
                            }
                          } as any)
                        }}
                        description="Used in dark backgrounds"
                      />
                    </div>
                    <div>
                      <ColorInput
                        label=""
                        value={effectiveTheme.colors.semanticColors?.secondary?.text?.dark || '#003b44'}
                        onChange={(value) => {
                          const currentSemantic = effectiveTheme.colors.semanticColors || {}
                          const currentSecondary = currentSemantic.secondary || {}
                          const currentText = currentSecondary.text || { light: '#003b44', dark: '#003b44' }
                          updateThemeColors({ 
                            semanticColors: {
                              ...currentSemantic,
                              secondary: {
                                ...currentSecondary,
                                text: {
                                  ...currentText,
                                  dark: value
                                }
                              }
                            }
                          } as any)
                        }}
                        description="Used on Light Backgrounds"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Tertiary Button */}
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-3">Tertiary Button</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <ColorInput
                        label=""
                        value={effectiveTheme.colors.semanticColors?.tertiary?.bg?.light || '#003b44'}
                        onChange={(value) => {
                          const currentSemantic = effectiveTheme.colors.semanticColors || {}
                          const currentTertiary = currentSemantic.tertiary || {}
                          const currentBg = currentTertiary.bg || { light: '#003b44', dark: '#003b44' }
                          updateThemeColors({ 
                            semanticColors: {
                              ...currentSemantic,
                              tertiary: {
                                ...currentTertiary,
                                bg: {
                                  ...currentBg,
                                  light: value
                                }
                              }
                            }
                          } as any)
                        }}
                        description="Used in dark backgrounds"
                      />
                    </div>
                    <div>
                      <ColorInput
                        label=""
                        value={effectiveTheme.colors.semanticColors?.tertiary?.text?.dark || '#ffffff'}
                        onChange={(value) => {
                          const currentSemantic = effectiveTheme.colors.semanticColors || {}
                          const currentTertiary = currentSemantic.tertiary || {}
                          const currentText = currentTertiary.text || { light: '#ffffff', dark: '#ffffff' }
                          updateThemeColors({ 
                            semanticColors: {
                              ...currentSemantic,
                              tertiary: {
                                ...currentTertiary,
                                text: {
                                  ...currentText,
                                  dark: value
                                }
                              }
                            }
                          } as any)
                        }}
                        description="Used on Light Backgrounds"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Legacy themes: Show standard color inputs with button mapping
            <div className="space-y-6">
              {/* Publisher Main Branding */}
              <div>
                <h4 className="text-base font-semibold text-gray-800 mb-2">Publisher Main branding</h4>
                <p className="text-sm text-gray-600 mb-4">Affects menu, backgrounds, buttons</p>
                <div className="space-y-4">
                  {currentTheme.customizationRules.colors.canModifyPrimary && (
                    <ColorInput
                      label="Primary color"
                      value={effectiveTheme.colors.primary}
                      onChange={(value) => updateThemeColors({ primary: value })}
                    />
                  )}
                  
                  {currentTheme.customizationRules.colors.canModifySecondary && (
                    <ColorInput
                      label="Secondary color"
                      value={effectiveTheme.colors.secondary}
                      onChange={(value) => updateThemeColors({ secondary: value })}
                    />
                  )}
                  
                  {currentTheme.customizationRules.colors.canModifyAccent && (
                    <ColorInput
                      label="Accent color"
                      value={effectiveTheme.colors.accent}
                      onChange={(value) => updateThemeColors({ accent: value })}
                    />
                  )}
                </div>
              </div>
              
              {/* Button Section - Read-only at theme level, editable at website level */}
              <div className="pt-6 border-t border-gray-200">
                <h4 className="text-base font-semibold text-gray-800 mb-2">Button</h4>
                <p className="text-sm text-gray-600 mb-5">
                  {isThemeLevel 
                    ? 'Affects Style of the Button Link widget (customize at website level)'
                    : 'Affects Style of the Button Link widget'
                  }
                </p>
                
                {isThemeLevel ? (
                  // Theme-level: Read-only mapping display
                  <div className="space-y-4">
                    {/* Primary Button */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div>
                        <div className="text-sm font-medium text-gray-700">Primary Button</div>
                        <div className="text-xs text-gray-500 mt-0.5">Uses Primary color</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded border border-gray-300" style={{ backgroundColor: effectiveTheme.colors.primary }}></div>
                        <span className="text-sm font-mono text-gray-600">{effectiveTheme.colors.primary}</span>
                      </div>
                    </div>
                    
                    {/* Secondary Button */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div>
                        <div className="text-sm font-medium text-gray-700">Secondary Button</div>
                        <div className="text-xs text-gray-500 mt-0.5">Uses Secondary color</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded border border-gray-300" style={{ backgroundColor: effectiveTheme.colors.secondary }}></div>
                        <span className="text-sm font-mono text-gray-600">{effectiveTheme.colors.secondary}</span>
                      </div>
                    </div>
                    
                    {/* Outline Button */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div>
                        <div className="text-sm font-medium text-gray-700">Outline Button</div>
                        <div className="text-xs text-gray-500 mt-0.5">Uses Primary color (border & text)</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded border-2" style={{ borderColor: effectiveTheme.colors.primary, backgroundColor: 'transparent' }}></div>
                        <span className="text-sm font-mono text-gray-600">{effectiveTheme.colors.primary}</span>
                      </div>
                    </div>
                    
                    {/* Link Button */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div>
                        <div className="text-sm font-medium text-gray-700">Link Button</div>
                        <div className="text-xs text-gray-500 mt-0.5">Uses Primary color (text only)</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center" style={{ color: effectiveTheme.colors.primary }}>
                          <span className="text-lg font-bold">A</span>
                        </div>
                        <span className="text-sm font-mono text-gray-600">{effectiveTheme.colors.primary}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Website-level: Editable color pickers (same as publisher branding section)
                  <div className="space-y-4">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-xs text-blue-700">
                        💡 Customize button colors for this website by editing the Publisher Main branding colors above.
                      </p>
                    </div>
                    
                    {/* Show current mappings */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-600">Primary Button</span>
                        <span className="text-xs font-mono text-gray-500">→ Primary color</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-600">Secondary Button</span>
                        <span className="text-xs font-mono text-gray-500">→ Secondary color</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-600">Outline Button</span>
                        <span className="text-xs font-mono text-gray-500">→ Primary color</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-600">Link Button</span>
                        <span className="text-xs font-mono text-gray-500">→ Primary color</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Additional Colors */}
              {(currentTheme.customizationRules.colors.canModifyText || 
                currentTheme.customizationRules.colors.canModifyBackground || 
                currentTheme.customizationRules.colors.canModifyMuted) && (
                <div className="pt-6 border-t border-gray-200">
                  <h4 className="text-base font-semibold text-gray-800 mb-2">Additional Colors</h4>
                  <div className="space-y-4">
                    {currentTheme.customizationRules.colors.canModifyBackground && (
                      <ColorInput
                        label="Background Color"
                        value={effectiveTheme.colors.background}
                        onChange={(value) => updateThemeColors({ background: value })}
                        description="Main background color for pages and content areas"
                      />
                    )}
                    
                    {currentTheme.customizationRules.colors.canModifyText && (
                      <ColorInput
                        label="Text Color"
                        value={effectiveTheme.colors.text}
                        onChange={(value) => updateThemeColors({ text: value })}
                        description="Main text color - should have high contrast with background"
                      />
                    )}
                    
                    {currentTheme.customizationRules.colors.canModifyMuted && (
                      <ColorInput
                        label="Muted Color"
                        value={effectiveTheme.colors.muted}
                        onChange={(value) => updateThemeColors({ muted: value })}
                        description="Subtle text color for captions, metadata, and secondary information"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Typography Section */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Typography</h3>
          <div className="space-y-4">
            {currentTheme.customizationRules.typography.canModifyHeadingFont && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Heading Font</label>
                <select
                  value={effectiveTheme.typography.headingFont}
                  onChange={(e) => updateThemeTypography({ headingFont: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {fontOptions.map(font => (
                    <option key={font} value={font} style={{ fontFamily: font }}>
                      {font.split(',')[0]}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {currentTheme.customizationRules.typography.canModifyBodyFont && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Body Font</label>
                <select
                  value={effectiveTheme.typography.bodyFont}
                  onChange={(e) => updateThemeTypography({ bodyFont: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {fontOptions.map(font => (
                    <option key={font} value={font} style={{ fontFamily: font }}>
                      {font.split(',')[0]}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {currentTheme.customizationRules.typography.canModifyBaseSize && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Base Font Size</label>
                <select
                  value={effectiveTheme.typography.baseSize}
                  onChange={(e) => updateThemeTypography({ baseSize: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {fontSizeOptions.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
            )}
            
            {currentTheme.customizationRules.typography.canModifyScale && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Scale Ratio</label>
                <input
                  type="range"
                  min="1.0"
                  max="1.5"
                  step="0.1"
                  value={effectiveTheme.typography.scale}
                  onChange={(e) => updateThemeTypography({ scale: parseFloat(e.target.value) })}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Current: {effectiveTheme.typography.scale.toFixed(1)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
        <div 
          className="p-6 border border-gray-200 rounded"
          style={{
            '--theme-color-primary': effectiveTheme.colors.primary,
            '--theme-color-secondary': effectiveTheme.colors.secondary,
            '--theme-color-accent': effectiveTheme.colors.accent,
            '--theme-color-text': effectiveTheme.colors.text,
            '--theme-color-background': effectiveTheme.colors.background,
            '--theme-color-muted': effectiveTheme.colors.muted,
            '--theme-heading-font': effectiveTheme.typography.headingFont,
            '--theme-body-font': effectiveTheme.typography.bodyFont,
            '--theme-base-size': effectiveTheme.typography.baseSize,
            backgroundColor: effectiveTheme.colors.background,
            color: effectiveTheme.colors.text,
            fontFamily: effectiveTheme.typography.bodyFont,
            fontSize: effectiveTheme.typography.baseSize
          } as React.CSSProperties}
        >
          <h1 style={{ 
            fontFamily: effectiveTheme.typography.headingFont, 
            fontSize: `calc(${effectiveTheme.typography.baseSize} * ${Math.pow(effectiveTheme.typography.scale, 3)})`,
            marginBottom: '1rem',
            color: effectiveTheme.colors.text
          }}>
            Sample Heading 1
          </h1>
          <h2 style={{ 
            fontFamily: effectiveTheme.typography.headingFont, 
            fontSize: `calc(${effectiveTheme.typography.baseSize} * ${Math.pow(effectiveTheme.typography.scale, 2)})`,
            marginBottom: '0.75rem',
            color: effectiveTheme.colors.text
          }}>
            Sample Heading 2
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            This is a sample paragraph to show how the body text will look with your selected typography and colors.
          </p>
          <button 
            style={{ 
              backgroundColor: effectiveTheme.colors.primary, 
              color: 'white', 
              padding: '8px 16px', 
              borderRadius: '6px', 
              border: 'none',
              fontFamily: effectiveTheme.typography.bodyFont,
              marginRight: '0.5rem'
            }}
          >
            Primary Button
          </button>
          <button 
            style={{ 
              backgroundColor: effectiveTheme.colors.accent, 
              color: 'white', 
              padding: '8px 16px', 
              borderRadius: '6px', 
              border: 'none',
              fontFamily: effectiveTheme.typography.bodyFont
            }}
          >
            Accent Button
          </button>
          <p style={{ marginTop: '1rem', color: effectiveTheme.colors.muted, fontSize: '0.875em' }}>
            This is muted text using the selected muted color.
          </p>
        </div>
      </div>
    </div>
  )
}
