import React, { useState } from 'react'

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
  const [selectedTheme, setSelectedTheme] = useState<string>(themeId || 'modernist-theme')
  
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Colors</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={currentTheme.colors.primary}
                  onChange={(e) => updateThemeColors({ primary: e.target.value })}
                  className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={currentTheme.colors.primary}
                  onChange={(e) => updateThemeColors({ primary: e.target.value })}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={currentTheme.colors.secondary}
                  onChange={(e) => updateThemeColors({ secondary: e.target.value })}
                  className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={currentTheme.colors.secondary}
                  onChange={(e) => updateThemeColors({ secondary: e.target.value })}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Accent Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={currentTheme.colors.accent}
                  onChange={(e) => updateThemeColors({ accent: e.target.value })}
                  className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={currentTheme.colors.accent}
                  onChange={(e) => updateThemeColors({ accent: e.target.value })}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={currentTheme.colors.text}
                  onChange={(e) => updateThemeColors({ text: e.target.value })}
                  className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={currentTheme.colors.text}
                  onChange={(e) => updateThemeColors({ text: e.target.value })}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={currentTheme.colors.background}
                  onChange={(e) => updateThemeColors({ background: e.target.value })}
                  className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={currentTheme.colors.background}
                  onChange={(e) => updateThemeColors({ background: e.target.value })}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Muted Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={currentTheme.colors.muted}
                  onChange={(e) => updateThemeColors({ muted: e.target.value })}
                  className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={currentTheme.colors.muted}
                  onChange={(e) => updateThemeColors({ muted: e.target.value })}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Typography Section */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Typography</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Heading Font</label>
              <select
                value={currentTheme.typography.headingFont}
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
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Body Font</label>
              <select
                value={currentTheme.typography.bodyFont}
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
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Base Font Size</label>
              <select
                value={currentTheme.typography.baseSize}
                onChange={(e) => updateThemeTypography({ baseSize: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {fontSizeOptions.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Scale Ratio</label>
              <input
                type="range"
                min="1.0"
                max="1.5"
                step="0.1"
                value={currentTheme.typography.scale}
                onChange={(e) => updateThemeTypography({ scale: parseFloat(e.target.value) })}
                className="w-full"
              />
              <div className="text-xs text-gray-500 mt-1">
                Current: {currentTheme.typography.scale.toFixed(1)}
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
