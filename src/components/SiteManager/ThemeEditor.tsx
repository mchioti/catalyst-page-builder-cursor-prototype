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
  updateTheme: (id: string, theme: Partial<Theme>) => void
}

// Props
interface ThemeEditorProps {
  usePageStore: () => UsePageStore
  themeId?: string // Optional theme ID to start with
}

export function ThemeEditor({ usePageStore, themeId }: ThemeEditorProps) {
  const { themes, updateTheme } = usePageStore()
  const selectedTheme = themeId || 'modernist-theme'
  
  const currentTheme = themes.find(t => t.id === selectedTheme)
  
  const updateThemeColors = (colors: Partial<Theme['colors']>) => {
    if (!currentTheme) return
    updateTheme(selectedTheme, {
      colors: { ...currentTheme.colors, ...colors }
    })
  }
  
  const updateThemeTypography = (typography: Partial<Theme['typography']>) => {
    if (!currentTheme) return
    updateTheme(selectedTheme, {
      typography: { ...currentTheme.typography, ...typography }
    })
  }
  
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
  
  if (!currentTheme) {
    return <div>Theme not found</div>
  }

  return (
    <div className="space-y-8">
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
            {currentTheme.customizationRules.colors.canModifyPrimary ? (
              <ColorInput
                label="Primary Color"
                value={currentTheme.colors.primary}
                onChange={(value) => updateThemeColors({ primary: value })}
                backgroundColor={currentTheme.colors.background}
                description="Used for buttons, links, and key interactive elements"
              />
            ) : (
              <div className="opacity-60">
                <ColorInput
                  label="Primary Color (Locked)"
                  value={currentTheme.colors.primary}
                  onChange={() => {}} // No-op for locked colors
                  backgroundColor={currentTheme.colors.background}
                  description="This color is locked to maintain theme identity"
                />
              </div>
            )}
            
            {currentTheme.customizationRules.colors.canModifySecondary ? (
              <ColorInput
                label="Secondary Color"
                value={currentTheme.colors.secondary}
                onChange={(value) => updateThemeColors({ secondary: value })}
                backgroundColor={currentTheme.colors.background}
                description="Supporting color for borders, dividers, and secondary elements"
              />
            ) : (
              <div className="opacity-60">
                <ColorInput
                  label="Secondary Color (Locked)"
                  value={currentTheme.colors.secondary}
                  onChange={() => {}}
                  backgroundColor={currentTheme.colors.background}
                  description="This color is locked to maintain theme consistency"
                />
              </div>
            )}
            
            {currentTheme.customizationRules.colors.canModifyAccent ? (
              <ColorInput
                label="Accent Color"
                value={currentTheme.colors.accent}
                onChange={(value) => updateThemeColors({ accent: value })}
                backgroundColor={currentTheme.colors.background}
                description="Highlight color for notifications, badges, and emphasis"
              />
            ) : (
              <div className="opacity-60">
                <ColorInput
                  label="Accent Color (Locked)"
                  value={currentTheme.colors.accent}
                  onChange={() => {}}
                  backgroundColor={currentTheme.colors.background}
                  description="This color is locked to maintain theme consistency"
                />
              </div>
            )}
            
            {currentTheme.customizationRules.colors.canModifyText ? (
              <ColorInput
                label="Text Color"
                value={currentTheme.colors.text}
                onChange={(value) => updateThemeColors({ text: value })}
                backgroundColor={currentTheme.colors.background}
                description="Main text color - should have high contrast with background"
              />
            ) : (
              <div className="opacity-60">
                <ColorInput
                  label="Text Color (Locked)"
                  value={currentTheme.colors.text}
                  onChange={() => {}}
                  backgroundColor={currentTheme.colors.background}
                  description="This color is locked for accessibility and readability"
                />
              </div>
            )}
            
            {currentTheme.customizationRules.colors.canModifyBackground ? (
              <ColorInput
                label="Background Color"
                value={currentTheme.colors.background}
                onChange={(value) => updateThemeColors({ background: value })}
                description="Main background color for pages and content areas"
              />
            ) : (
              <div className="opacity-60">
                <ColorInput
                  label="Background Color (Locked)"
                  value={currentTheme.colors.background}
                  onChange={() => {}}
                  description="This color is locked to maintain readability"
                />
              </div>
            )}
            
            {currentTheme.customizationRules.colors.canModifyMuted ? (
              <ColorInput
                label="Muted Color"
                value={currentTheme.colors.muted}
                onChange={(value) => updateThemeColors({ muted: value })}
                backgroundColor={currentTheme.colors.background}
                description="Subtle text color for captions, metadata, and secondary information"
              />
            ) : (
              <div className="opacity-60">
                <ColorInput
                  label="Muted Color (Locked)"
                  value={currentTheme.colors.muted}
                  onChange={() => {}}
                  backgroundColor={currentTheme.colors.background}
                  description="This color is locked to maintain consistency"
                />
              </div>
            )}
          </div>
        </div>

        {/* Typography Section */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Typography</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Heading Font {!currentTheme.customizationRules.typography.canModifyHeadingFont && "(Locked)"}
              </label>
              <select
                value={currentTheme.typography.headingFont}
                onChange={currentTheme.customizationRules.typography.canModifyHeadingFont 
                  ? (e) => updateThemeTypography({ headingFont: e.target.value })
                  : undefined
                }
                disabled={!currentTheme.customizationRules.typography.canModifyHeadingFont}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  !currentTheme.customizationRules.typography.canModifyHeadingFont 
                    ? 'opacity-60 cursor-not-allowed bg-gray-50' 
                    : ''
                }`}
              >
                {fontOptions.map(font => (
                  <option key={font} value={font} style={{ fontFamily: font }}>
                    {font.split(',')[0]}
                  </option>
                ))}
              </select>
              {!currentTheme.customizationRules.typography.canModifyHeadingFont && (
                <p className="text-xs text-gray-500 mt-1">This font is locked to maintain theme identity</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Body Font {!currentTheme.customizationRules.typography.canModifyBodyFont && "(Locked)"}
              </label>
              <select
                value={currentTheme.typography.bodyFont}
                onChange={currentTheme.customizationRules.typography.canModifyBodyFont
                  ? (e) => updateThemeTypography({ bodyFont: e.target.value })
                  : undefined
                }
                disabled={!currentTheme.customizationRules.typography.canModifyBodyFont}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  !currentTheme.customizationRules.typography.canModifyBodyFont 
                    ? 'opacity-60 cursor-not-allowed bg-gray-50' 
                    : ''
                }`}
              >
                {fontOptions.map(font => (
                  <option key={font} value={font} style={{ fontFamily: font }}>
                    {font.split(',')[0]}
                  </option>
                ))}
              </select>
              {!currentTheme.customizationRules.typography.canModifyBodyFont && (
                <p className="text-xs text-gray-500 mt-1">This font is locked to maintain readability</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base Font Size {!currentTheme.customizationRules.typography.canModifyBaseSize && "(Locked)"}
              </label>
              <select
                value={currentTheme.typography.baseSize}
                onChange={currentTheme.customizationRules.typography.canModifyBaseSize
                  ? (e) => updateThemeTypography({ baseSize: e.target.value })
                  : undefined
                }
                disabled={!currentTheme.customizationRules.typography.canModifyBaseSize}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  !currentTheme.customizationRules.typography.canModifyBaseSize 
                    ? 'opacity-60 cursor-not-allowed bg-gray-50' 
                    : ''
                }`}
              >
                {fontSizeOptions.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
              {!currentTheme.customizationRules.typography.canModifyBaseSize && (
                <p className="text-xs text-gray-500 mt-1">Font size is locked for consistency</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Scale Ratio {!currentTheme.customizationRules.typography.canModifyScale && "(Locked)"}
              </label>
              <input
                type="range"
                min="1.0"
                max="1.5"
                step="0.1"
                value={currentTheme.typography.scale}
                onChange={currentTheme.customizationRules.typography.canModifyScale
                  ? (e) => updateThemeTypography({ scale: parseFloat(e.target.value) })
                  : undefined
                }
                disabled={!currentTheme.customizationRules.typography.canModifyScale}
                className={`w-full ${
                  !currentTheme.customizationRules.typography.canModifyScale 
                    ? 'opacity-60 cursor-not-allowed' 
                    : ''
                }`}
              />
              <div className="text-xs text-gray-500 mt-1">
                Current: {currentTheme.typography.scale.toFixed(1)}
                {!currentTheme.customizationRules.typography.canModifyScale && " (Locked for hierarchy consistency)"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
        <div 
          className="p-6 border border-gray-200 rounded"
          style={{
            '--theme-color-primary': currentTheme.colors.primary,
            '--theme-color-secondary': currentTheme.colors.secondary,
            '--theme-color-accent': currentTheme.colors.accent,
            '--theme-color-text': currentTheme.colors.text,
            '--theme-color-background': currentTheme.colors.background,
            '--theme-color-muted': currentTheme.colors.muted,
            '--theme-heading-font': currentTheme.typography.headingFont,
            '--theme-body-font': currentTheme.typography.bodyFont,
            '--theme-base-size': currentTheme.typography.baseSize,
            backgroundColor: currentTheme.colors.background,
            color: currentTheme.colors.text,
            fontFamily: currentTheme.typography.bodyFont,
            fontSize: currentTheme.typography.baseSize
          } as React.CSSProperties}
        >
          <h1 style={{ 
            fontFamily: currentTheme.typography.headingFont, 
            fontSize: `calc(${currentTheme.typography.baseSize} * ${Math.pow(currentTheme.typography.scale, 3)})`,
            marginBottom: '1rem',
            color: currentTheme.colors.text
          }}>
            Sample Heading 1
          </h1>
          <h2 style={{ 
            fontFamily: currentTheme.typography.headingFont, 
            fontSize: `calc(${currentTheme.typography.baseSize} * ${Math.pow(currentTheme.typography.scale, 2)})`,
            marginBottom: '0.75rem',
            color: currentTheme.colors.text
          }}>
            Sample Heading 2
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            This is a sample paragraph to show how the body text will look with your selected typography and colors.
          </p>
          <button 
            style={{ 
              backgroundColor: currentTheme.colors.primary, 
              color: 'white', 
              padding: '8px 16px', 
              borderRadius: '6px', 
              border: 'none',
              fontFamily: currentTheme.typography.bodyFont,
              marginRight: '0.5rem'
            }}
          >
            Primary Button
          </button>
          <button 
            style={{ 
              backgroundColor: currentTheme.colors.accent, 
              color: 'white', 
              padding: '8px 16px', 
              borderRadius: '6px', 
              border: 'none',
              fontFamily: currentTheme.typography.bodyFont
            }}
          >
            Accent Button
          </button>
          <p style={{ marginTop: '1rem', color: currentTheme.colors.muted, fontSize: '0.875em' }}>
            This is muted text using the selected muted color.
          </p>
        </div>
      </div>
    </div>
  )
}
