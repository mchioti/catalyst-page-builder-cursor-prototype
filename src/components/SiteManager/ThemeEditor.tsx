import React, { useMemo, useEffect } from 'react'
import { resolveThemeColors, type BrandMode } from '../../utils/tokenResolver'
import { Button } from '../../foundation'
import { createDebugLogger } from '../../utils/logger'

// Control logging for this file
const DEBUG = false
const debugLog = createDebugLogger(DEBUG)

// Color input component
function ColorInput({ 
  label, 
  value, 
  onChange, 
  description,
  disabled = false
}: { 
  label: string
  value: string
  onChange: (value: string) => void
  description?: string
  disabled?: boolean
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
          disabled={disabled}
          className={`w-12 h-10 border border-gray-300 rounded ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`w-28 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-70' : 'focus:ring-2 focus:ring-blue-500'}`}
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
  
  // Theme-specific modification rules (config-level changes only, NOT code customization)
  modificationRules: {
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
  previewBrandMode: 'wiley' | 'wt' | 'dummies'
  setPreviewBrandMode: (mode: 'wiley' | 'wt' | 'dummies') => void
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
  // ✅ Use explicit selectors to subscribe to state changes
  const store = usePageStore()
  const themes = (usePageStore as any)((state: any) => state.themes)
  const websites = (usePageStore as any)((state: any) => state.websites)
  const updateTheme = store.updateTheme
  const updateWebsite = store.updateWebsite
  const setPreviewThemeId = (store as any).setPreviewThemeId
  
  const selectedTheme = themeId || 'classic-ux3-theme'
  
  // Update preview theme ID when themeId changes (for Design Console preview)
  useEffect(() => {
    if (setPreviewThemeId && selectedTheme) {
      setPreviewThemeId(selectedTheme)
      debugLog('log', '🎨 ThemeEditor: Set preview theme ID to', selectedTheme)
    }
  }, [selectedTheme, setPreviewThemeId])
  
  const currentTheme = (themes as any[]).find((t: any) => t.id === selectedTheme)
  const currentWebsite = websiteId ? (websites as any[]).find((w: any) => w.id === websiteId) : null
  
  // Use store's previewBrandMode for theme preview (shared with CanvasThemeProvider)
  const { previewBrandMode, setPreviewBrandMode } = usePageStore()
  
  // Determine if this is website-level (automatic) or theme-level (needs scope selection)
  const isWebsiteLevel = Boolean(websiteId)
  const isThemeLevel = !websiteId
  
  // Sync previewBrandMode with website's brand when viewing Website Settings
  useEffect(() => {
    if (isWebsiteLevel && currentWebsite?.brandMode && currentWebsite.brandMode !== previewBrandMode) {
      debugLog('log', '🔄 Syncing previewBrandMode to website brand:', currentWebsite.brandMode)
      setPreviewBrandMode(currentWebsite.brandMode)
    }
  }, [isWebsiteLevel, currentWebsite?.brandMode, previewBrandMode, setPreviewBrandMode])
  
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
      // Theme-level: Apply changes immediately to the global theme
      updateTheme(selectedTheme, {
        colors: { ...currentTheme.colors, ...colors }
      })
    }
  }
  
  // Get effective theme values (base theme + website overrides)
  const getEffectiveThemeValues = () => {
    if (!currentTheme) return null
    
    const baseTheme = currentTheme
    const websiteOverrides = currentWebsite?.themeOverrides || {}
    
    return {
      colors: { ...baseTheme.colors, ...websiteOverrides.colors },
      typography: { ...baseTheme.typography, ...websiteOverrides.typography },
      spacing: { ...baseTheme.spacing, ...websiteOverrides.spacing },
      components: { ...baseTheme.components, ...websiteOverrides.components }
    }
  }
  
  const rawEffectiveTheme = getEffectiveThemeValues()
  
  // Resolve token references based on website's brand mode (or preview mode at theme level)
  const brandMode: BrandMode = isWebsiteLevel 
    ? (currentWebsite?.brandMode || 'wiley')
    : previewBrandMode
  
  debugLog('log', '🎨 ThemeEditor Render:', {
    websiteId,
    websiteName: currentWebsite?.name,
    themeId: currentTheme?.id,
    isWebsiteLevel,
    isThemeLevel,
    brandMode,
    previewBrandMode,
    currentWebsiteBrandMode: currentWebsite?.brandMode,
    hasSemanticColors: !!rawEffectiveTheme?.colors?.semanticColors
  })
  
  const effectiveTheme = useMemo(() => {
    if (!rawEffectiveTheme || !currentTheme) return null
    
    // Create a temporary theme object for resolution
    const tempTheme = {
      ...currentTheme,
      colors: rawEffectiveTheme.colors
    }
    
    // Resolve token references based on brand mode
    const resolved = resolveThemeColors(tempTheme, brandMode)
    
    debugLog('log', '✅ Colors Resolved for brand:', brandMode, {
      primary: resolved.colors.semanticColors?.primary,
      primaryLight: resolved.colors.semanticColors?.primary?.light,
      primaryDark: resolved.colors.semanticColors?.primary?.dark
    })
    
    return {
      ...rawEffectiveTheme,
      colors: resolved.colors
    }
  }, [rawEffectiveTheme, currentTheme, brandMode, previewBrandMode, currentWebsite?.brandMode, websiteId])
  
  if (!currentTheme || !effectiveTheme) {
    return <div>Theme not found</div>
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT COLUMN: Colors Section */}
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
                
                {/* At WEBSITE level: Show locked brand info */}
                {isWebsiteLevel && effectiveTheme.colors.foundation && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-300 rounded-lg">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      🔒 Brand (Locked)
                    </label>
                    <p className="text-xs text-gray-600 mb-3">
                      This website uses the <strong>{brandMode === 'wiley' ? 'Wiley (Green)' : brandMode === 'wt' ? 'WT (Olive)' : 'Dummies (Gold)'}</strong> brand. 
                      Brand is set during website creation and cannot be changed.
                    </p>
                    <div className="inline-flex px-4 py-2 bg-white border-2 border-blue-500 rounded-md">
                      <span className="text-sm font-medium text-gray-800">
                        {brandMode === 'wiley' ? 'Wiley (Green)' : brandMode === 'wt' ? 'WT (Olive)' : 'Dummies (Gold)'}
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Brand Mode Selector - ONLY at theme level for preview */}
                {isThemeLevel && effectiveTheme.colors.foundation && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      🎨 Brand Mode (Preview)
                    </label>
                    <p className="text-xs text-gray-600 mb-3">
                      Preview how the theme looks across different brand systems. Actual brand is set per-website during creation.
                    </p>
                    <div className="flex gap-2">
                      {(['wiley', 'wt', 'dummies'] as const).map((mode) => {
                        const isActive = brandMode === mode
                        const labels = {
                          wiley: 'Wiley (Green)',
                          wt: 'WT (Olive)',
                          dummies: 'Dummies (Gold)'
                        }
                        return (
                          <button
                            key={mode}
                            onClick={() => {
                              debugLog('log', '👁️ Previewing brand:', mode)
                              setPreviewBrandMode(mode)
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
                
                {/* TODO: Future Enhancement - only show at WEBSITE level (brand is locked) */}
                {isWebsiteLevel && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-xs text-yellow-800">
                      <strong>🚧 TODO:</strong> Replace hex inputs with Foundation Token Picker dropdown. 
                      Users should select from DS foundation colors (e.g., "Primary Data 600", "Primary Heritage 400") 
                      to maintain design system integrity and get automatic shade/neutral pairings.
                    </p>
                  </div>
                )}
                
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
                        disabled={true}
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
                        disabled={true}
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
                        disabled={true}
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
                        disabled={true}
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
                        disabled={true}
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
                        disabled={true}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Preview - Show buttons on both light and dark backgrounds */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h5 className="text-sm font-medium text-gray-700 mb-3">Preview</h5>
                  <div className="space-y-4">
                    {/* Light Background Preview */}
                    <div>
                      <div className="text-xs font-medium text-gray-600 mb-2">On Light Background</div>
                      <div 
                        className="foundation-context-light theme-preview p-6 border border-gray-200 rounded-lg bg-gray-50"
                        style={{
                          color: effectiveTheme.colors.text,
                          fontFamily: effectiveTheme.typography.bodyFont,
                          fontSize: effectiveTheme.typography.baseSize
                        } as React.CSSProperties}
                      >
                        <h2 style={{ 
                          fontFamily: effectiveTheme.typography.headingFont, 
                          fontSize: '20px',
                          marginBottom: '0.5rem',
                          fontWeight: 600
                        }}>
                          Sample Heading
                        </h2>
                        <p style={{ marginBottom: '1rem', lineHeight: 1.6, fontSize: '14px' }}>
                          This is a sample paragraph to show how content looks with your selected colors.
                        </p>
                        <div className="flex flex-wrap gap-3">
                          <Button 
                            variant="solid" 
                            color="primary" 
                            size="medium"
                          >
                            Primary Button
                          </Button>
                          <Button 
                            variant="solid" 
                            color="secondary" 
                            size="medium"
                          >
                            Secondary Button
                          </Button>
                          <Button 
                            variant="outline" 
                            color="primary" 
                            size="medium"
                          >
                            Outline Button
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Dark Background Preview */}
                    <div>
                      <div className="text-xs font-medium text-gray-600 mb-2">On Dark Background</div>
                      <div 
                        className="foundation-context-dark theme-preview p-6 border border-gray-700 rounded-lg"
                        style={{
                          backgroundColor: effectiveTheme.colors.text || '#1a1a1a',
                          color: effectiveTheme.colors.background || '#ffffff',
                          fontFamily: effectiveTheme.typography.bodyFont,
                          fontSize: effectiveTheme.typography.baseSize
                        } as React.CSSProperties}
                      >
                        <h2 style={{ 
                          fontFamily: effectiveTheme.typography.headingFont, 
                          fontSize: '20px',
                          marginBottom: '0.5rem',
                          fontWeight: 600,
                          color: effectiveTheme.colors.background || '#ffffff'
                        }}>
                          Sample Heading
                        </h2>
                        <p style={{ marginBottom: '1rem', lineHeight: 1.6, fontSize: '14px' }}>
                          This is a sample paragraph to show how content looks on dark backgrounds.
                        </p>
                        <div className="flex flex-wrap gap-3">
                          <Button 
                            variant="solid" 
                            color="primary" 
                            size="medium"
                          >
                            Primary Button
                          </Button>
                          <Button 
                            variant="solid" 
                            color="secondary" 
                            size="medium"
                          >
                            Secondary Button
                          </Button>
                          <Button 
                            variant="outline" 
                            color="primary" 
                            size="medium"
                          >
                            Outline Button
                          </Button>
                        </div>
                      </div>
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
                  {currentTheme.modificationRules.colors.canModifyPrimary && (
                    <ColorInput
                      label="Primary color"
                      value={effectiveTheme.colors.primary}
                      onChange={(value) => updateThemeColors({ primary: value })}
                    />
                  )}
                  
                  {currentTheme.modificationRules.colors.canModifySecondary && (
                    <ColorInput
                      label="Secondary color"
                      value={effectiveTheme.colors.secondary}
                      onChange={(value) => updateThemeColors({ secondary: value })}
                    />
                  )}
                  
                  {currentTheme.modificationRules.colors.canModifyAccent && (
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
                
                {/* Preview - Show buttons on both light and dark backgrounds */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h5 className="text-sm font-medium text-gray-700 mb-3">Preview</h5>
                  <div className="space-y-4">
                    {/* Light Background Preview */}
                    <div>
                      <div className="text-xs font-medium text-gray-600 mb-2">On Light Background</div>
                      <div 
                        className="foundation-context-light theme-preview p-6 border border-gray-200 rounded-lg bg-gray-50"
                        style={{
                          color: effectiveTheme.colors.text,
                          fontFamily: effectiveTheme.typography.bodyFont,
                          fontSize: effectiveTheme.typography.baseSize
                        } as React.CSSProperties}
                      >
                        <h2 style={{ 
                          fontFamily: effectiveTheme.typography.headingFont, 
                          fontSize: '20px',
                          marginBottom: '0.5rem',
                          fontWeight: 600
                        }}>
                          Sample Heading
                        </h2>
                        <p style={{ marginBottom: '1rem', lineHeight: 1.6, fontSize: '14px' }}>
                          This is a sample paragraph to show how content looks with your selected colors.
                        </p>
                        <div className="flex flex-wrap gap-3">
                          <Button 
                            variant="solid" 
                            color="primary" 
                            size="medium"
                          >
                            Primary Button
                          </Button>
                          <Button 
                            variant="solid" 
                            color="secondary" 
                            size="medium"
                          >
                            Secondary Button
                          </Button>
                          <Button 
                            variant="outline" 
                            color="primary" 
                            size="medium"
                          >
                            Outline Button
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Dark Background Preview */}
                    <div>
                      <div className="text-xs font-medium text-gray-600 mb-2">On Dark Background</div>
                      <div 
                        className="foundation-context-dark theme-preview p-6 border border-gray-700 rounded-lg"
                        style={{
                          backgroundColor: effectiveTheme.colors.text || '#1a1a1a',
                          color: effectiveTheme.colors.background || '#ffffff',
                          fontFamily: effectiveTheme.typography.bodyFont,
                          fontSize: effectiveTheme.typography.baseSize
                        } as React.CSSProperties}
                      >
                        <h2 style={{ 
                          fontFamily: effectiveTheme.typography.headingFont, 
                          fontSize: '20px',
                          marginBottom: '0.5rem',
                          fontWeight: 600,
                          color: effectiveTheme.colors.background || '#ffffff'
                        }}>
                          Sample Heading
                        </h2>
                        <p style={{ marginBottom: '1rem', lineHeight: 1.6, fontSize: '14px' }}>
                          This is a sample paragraph to show how content looks on dark backgrounds.
                        </p>
                        <div className="flex flex-wrap gap-3">
                          <Button 
                            variant="solid" 
                            color="primary" 
                            size="medium"
                          >
                            Primary Button
                          </Button>
                          <Button 
                            variant="solid" 
                            color="secondary" 
                            size="medium"
                          >
                            Secondary Button
                          </Button>
                          <Button 
                            variant="outline" 
                            color="primary" 
                            size="medium"
                          >
                            Outline Button
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Additional Colors */}
              {(currentTheme.modificationRules.colors.canModifyText || 
                currentTheme.modificationRules.colors.canModifyBackground || 
                currentTheme.modificationRules.colors.canModifyMuted) && (
                <div className="pt-6 border-t border-gray-200">
                  <h4 className="text-base font-semibold text-gray-800 mb-2">Additional Colors</h4>
                  <div className="space-y-4">
                    {currentTheme.modificationRules.colors.canModifyBackground && (
                      <ColorInput
                        label="Background Color"
                        value={effectiveTheme.colors.background}
                        onChange={(value) => updateThemeColors({ background: value })}
                        description="Main background color for pages and content areas"
                      />
                    )}
                    
                    {currentTheme.modificationRules.colors.canModifyText && (
                      <ColorInput
                        label="Text Color"
                        value={effectiveTheme.colors.text}
                        onChange={(value) => updateThemeColors({ text: value })}
                        description="Main text color - should have high contrast with background"
                      />
                    )}
                    
                    {currentTheme.modificationRules.colors.canModifyMuted && (
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
        
        {/* RIGHT COLUMN: Typography Preview Section (All themes with typography.styles) */}
        {currentTheme.typography?.styles && (
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Typography</h3>
            </div>
            
            <div 
              className="theme-preview p-6 border border-gray-200 rounded-lg bg-white space-y-6"
              style={{
                '--theme-heading-font': effectiveTheme.typography.headingFont,
                '--theme-body-font': effectiveTheme.typography.bodyFont,
                color: effectiveTheme.colors.text,
                fontFamily: effectiveTheme.typography.bodyFont
              } as React.CSSProperties}
            >
              {/* Headings */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">Headings</h4>
                <div className="space-y-2">
                  {['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].map((level, idx) => {
                    // Try both key formats: 'h1' (Wiley DS V2) and 'heading-h1' (Classic UX3)
                    const style = currentTheme.typography.styles?.[level] || 
                                 currentTheme.typography.styles?.[`heading-${level}`]
                    if (!style) return null
                    
                    // Get brand-specific font family
                    const brandTypography = currentTheme.typography?.[previewBrandMode]
                    const fontFamily = brandTypography?.headingFont || 
                                      currentTheme.typography?.semantic?.primary || 
                                      currentTheme.typography?.headingFont || 
                                      'Inter, sans-serif'
                    
                    // Get brand-specific letter spacing (or fall back to style's letterSpacing)
                    const brandLetterSpacing = brandTypography?.letterSpacing?.heading || 
                                               style.letterSpacing || 
                                               style.desktop?.letterSpacing || '0'
                    
                    // Handle both data structures: fontSize (Wiley DS V2) vs desktop.size (Classic UX3)
                    const fontSize = style.fontSize || style.desktop?.size || '16px'
                    const lineHeight = style.lineHeight || style.desktop?.lineHeight || '1.5'
                    const fontWeight = style.fontWeight || style.desktop?.weight || 400
                    
                    const labels = ['Hero Heading', 'Display Heading', 'Section Heading', 'Subsection Heading', 'Minor Heading', 'Small Heading']
                    return (
                      <div key={level} style={{
                        margin: 0,
                        fontFamily,
                        fontSize,
                        lineHeight,
                        fontWeight,
                        letterSpacing: brandLetterSpacing
                      }}>
                        H{idx + 1} - {labels[idx]}
                      </div>
                    )
                  })}
                </div>
              </div>
              
              {/* Body Text */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">Body Text</h4>
                <div className="space-y-2">
                  {[
                    { keys: ['bodyXL', 'body-xl'], label: 'Body XL - Large emphasis text' },
                    { keys: ['bodyLG', 'body-lg'], label: 'Body Large - Above standard' },
                    { keys: ['body', 'body-md'], label: 'Body Medium - Standard paragraph' },
                    { keys: ['bodySM', 'body-sm'], label: 'Body Small - Captions' },
                    { keys: ['bodyXS', 'body-xs'], label: 'Body XSmall - Fine detail' }
                  ].map(({ keys, label }) => {
                    // Try both key formats
                    const style = keys.map(k => currentTheme.typography.styles?.[k]).find(s => s)
                    if (!style) return null
                    
                    // Get brand-specific font family
                    const brandTypography = currentTheme.typography?.[previewBrandMode]
                    const fontFamily = brandTypography?.bodyFont || 
                                      currentTheme.typography?.semantic?.secondary || 
                                      currentTheme.typography?.bodyFont || 
                                      '"Open Sans", sans-serif'
                    
                    // Get brand-specific letter spacing
                    const brandLetterSpacing = brandTypography?.letterSpacing?.body || 
                                               style.letterSpacing || 
                                               style.desktop?.letterSpacing || '0'
                    
                    // Handle both data structures
                    const fontSize = style.fontSize || style.desktop?.size || '16px'
                    const lineHeight = style.lineHeight || style.desktop?.lineHeight || '1.5'
                    const fontWeight = style.fontWeight || style.desktop?.weight || 400
                    
                    return (
                      <div key={keys[0]} style={{
                        fontFamily,
                        fontSize,
                        lineHeight,
                        fontWeight,
                        letterSpacing: brandLetterSpacing
                      }}>
                        {label}
                      </div>
                    )
                  })}
                </div>
              </div>
              
              {/* Button Typography */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">Buttons</h4>
                <div className="flex gap-3">
                  {/* Use Foundation Buttons - text-transform handled by theme tokens */}
                  <Button 
                    variant="solid" 
                    color="primary" 
                    size="large"
                  >
                    Large
                  </Button>
                  <Button 
                    variant="solid" 
                    color="primary" 
                    size="medium"
                  >
                    Medium
                  </Button>
                  <Button 
                    variant="solid" 
                    color="primary" 
                    size="small"
                  >
                    Small
                  </Button>
                </div>
              </div>
              
              {/* Font Family Info */}
              <div className="pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-600 space-y-1">
                  <div><strong>Primary:</strong> {
                    currentTheme.typography?.[previewBrandMode]?.headingFont || 
                    currentTheme.typography?.semantic?.primary || 
                    currentTheme.typography?.headingFont || 
                    'Inter'
                  }</div>
                  <div><strong>Secondary:</strong> {
                    currentTheme.typography?.[previewBrandMode]?.bodyFont || 
                    currentTheme.typography?.semantic?.secondary || 
                    currentTheme.typography?.bodyFont || 
                    'IBM Plex Mono'
                  }</div>
                  <div className="text-gray-500 mt-2">✓ Responsive (desktop/mobile breakpoints)</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ThemeEditor
