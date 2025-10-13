import React, { useState } from 'react'
import { AlertTriangle, CheckCircle, Info } from 'lucide-react'

// Color accessibility utility functions
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)
  
  if (!rgb1 || !rgb2) return 1
  
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b)
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b)
  
  const brightest = Math.max(lum1, lum2)
  const darkest = Math.min(lum1, lum2)
  
  return (brightest + 0.05) / (darkest + 0.05)
}

function getAccessibilityStatus(ratio: number): {
  level: 'excellent' | 'good' | 'poor' | 'fail'
  wcagAA: boolean
  wcagAAA: boolean
  icon: React.ReactNode
  message: string
  color: string
} {
  if (ratio >= 7) {
    return {
      level: 'excellent',
      wcagAA: true,
      wcagAAA: true,
      icon: <CheckCircle className="w-4 h-4 text-green-600" />,
      message: `${ratio.toFixed(1)}:1 - WCAG AAA ✓`,
      color: 'text-green-600'
    }
  } else if (ratio >= 4.5) {
    return {
      level: 'good',
      wcagAA: true,
      wcagAAA: false,
      icon: <CheckCircle className="w-4 h-4 text-green-600" />,
      message: `${ratio.toFixed(1)}:1 - WCAG AA ✓`,
      color: 'text-green-600'
    }
  } else if (ratio >= 3) {
    return {
      level: 'poor',
      wcagAA: false,
      wcagAAA: false,
      icon: <AlertTriangle className="w-4 h-4 text-orange-500" />,
      message: `${ratio.toFixed(1)}:1 - Below WCAG AA`,
      color: 'text-orange-500'
    }
  } else {
    return {
      level: 'fail',
      wcagAA: false,
      wcagAAA: false,
      icon: <AlertTriangle className="w-4 h-4 text-red-500" />,
      message: `${ratio.toFixed(1)}:1 - Poor contrast`,
      color: 'text-red-500'
    }
  }
}

// Color input component with accessibility warnings
function ColorInput({ 
  label, 
  value, 
  onChange, 
  backgroundColor, 
  description 
}: { 
  label: string
  value: string
  onChange: (value: string) => void
  backgroundColor?: string
  description?: string
}) {
  const contrastRatio = backgroundColor ? getContrastRatio(value, backgroundColor) : null
  const accessibilityStatus = contrastRatio ? getAccessibilityStatus(contrastRatio) : null
  
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-8 border border-gray-300 rounded cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-24 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {accessibilityStatus && (
          <div className="flex items-center gap-1 ml-2">
            {accessibilityStatus.icon}
            <span className={`text-xs font-medium ${accessibilityStatus.color}`}>
              {accessibilityStatus.message}
            </span>
          </div>
        )}
      </div>
      {description && (
        <p className="text-xs text-gray-500 mt-1">{description}</p>
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
  
  const effectiveTheme = getEffectiveThemeValues()
  
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
            <div title="Color contrast warnings help ensure WCAG accessibility compliance">
              <Info className="w-4 h-4 text-gray-400" />
            </div>
          </div>
          <div className="space-y-3">
            {currentTheme.customizationRules.colors.canModifyPrimary && (
              <ColorInput
                label="Primary Color"
                value={effectiveTheme.colors.primary}
                onChange={(value) => updateThemeColors({ primary: value })}
                backgroundColor={effectiveTheme.colors.background}
                description="Used for buttons, links, and key interactive elements"
              />
            )}
            
            {currentTheme.customizationRules.colors.canModifySecondary && (
              <ColorInput
                label="Secondary Color"
                value={effectiveTheme.colors.secondary}
                onChange={(value) => updateThemeColors({ secondary: value })}
                backgroundColor={effectiveTheme.colors.background}
                description="Supporting color for borders, dividers, and secondary elements"
              />
            )}
            
            {currentTheme.customizationRules.colors.canModifyAccent && (
              <ColorInput
                label="Accent Color"
                value={effectiveTheme.colors.accent}
                onChange={(value) => updateThemeColors({ accent: value })}
                backgroundColor={effectiveTheme.colors.background}
                description="Highlight color for notifications, badges, and emphasis"
              />
            )}
            
            {currentTheme.customizationRules.colors.canModifyText && (
              <ColorInput
                label="Text Color"
                value={effectiveTheme.colors.text}
                onChange={(value) => updateThemeColors({ text: value })}
                backgroundColor={effectiveTheme.colors.background}
                description="Main text color - should have high contrast with background"
              />
            )}
            
            {currentTheme.customizationRules.colors.canModifyBackground && (
              <ColorInput
                label="Background Color"
                value={effectiveTheme.colors.background}
                onChange={(value) => updateThemeColors({ background: value })}
                description="Main background color for pages and content areas"
              />
            )}
            
            {currentTheme.customizationRules.colors.canModifyMuted && (
              <ColorInput
                label="Muted Color"
                value={effectiveTheme.colors.muted}
                onChange={(value) => updateThemeColors({ muted: value })}
                backgroundColor={effectiveTheme.colors.background}
                description="Subtle text color for captions, metadata, and secondary information"
              />
            )}
          </div>
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
