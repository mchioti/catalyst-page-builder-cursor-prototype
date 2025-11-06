import React from 'react'

interface CanvasThemeProviderProps {
  children: React.ReactNode
  usePageStore: any // TODO: Type this properly when extracting store
}

export function CanvasThemeProvider({ children, usePageStore }: CanvasThemeProviderProps) {
  const { themes, websites, currentWebsiteId } = usePageStore()
  
  // Find the current website and its theme
  const currentWebsite = websites.find((w: any) => w.id === currentWebsiteId)
  const currentTheme = currentWebsite 
    ? themes.find((t: any) => t.id === currentWebsite.themeId)
    : themes.find((t: any) => t.id === 'modernist-theme') // Fallback to modernist
  
  if (!currentTheme) {
    return <>{children}</>
  }

  // Build extended CSS variables from Figma token structure
  const buildExtendedVars = () => {
    const vars: any = {
      // Core theme variables
      '--theme-color-primary': currentTheme.colors.primary,
      '--theme-color-secondary': currentTheme.colors.secondary,
      '--theme-color-accent': currentTheme.colors.accent,
      '--theme-color-text': currentTheme.colors.text,
      '--theme-color-background': currentTheme.colors.background,
      '--theme-color-muted': currentTheme.colors.muted,
      '--theme-heading-font': currentTheme.typography.headingFont,
      '--theme-body-font': currentTheme.typography.bodyFont,
      '--theme-base-size': currentTheme.typography.baseSize,
      '--theme-scale': currentTheme.typography.scale,
      // Backward compatibility with journal variables
      '--journal-primary': currentTheme.colors.primary,
      '--journal-primary-dark': currentTheme.colors.accent,
      '--journal-primary-light': currentTheme.colors.secondary,
      '--journal-secondary': currentTheme.colors.secondary,
      '--journal-accent': currentTheme.colors.accent,
      '--journal-text': currentTheme.colors.text,
      '--journal-hover': currentTheme.colors.accent
    }

    // Add extended Figma tokens if they exist
    if (currentTheme.colors.brand) {
      // Primary Data (green)
      if (currentTheme.colors.brand.primaryData) {
        Object.entries(currentTheme.colors.brand.primaryData).forEach(([key, value]) => {
          vars[`--wiley-primary-data-${key}`] = value
        })
      }
      // Primary Heritage (teal)
      if (currentTheme.colors.brand.primaryHeritage) {
        Object.entries(currentTheme.colors.brand.primaryHeritage).forEach(([key, value]) => {
          vars[`--wiley-primary-heritage-${key}`] = value
        })
      }
      // Primary Paper (neutrals)
      if (currentTheme.colors.brand.primaryPaper) {
        Object.entries(currentTheme.colors.brand.primaryPaper).forEach(([key, value]) => {
          vars[`--wiley-primary-paper-${key}`] = value
        })
      }
    }

    // Add neutral scale
    if (currentTheme.colors.neutral) {
      Object.entries(currentTheme.colors.neutral).forEach(([key, value]) => {
        vars[`--wiley-neutral-${key}`] = value
      })
    }

    // Add palette colors (cyan, lilac, lime, sage - for journals/subjects)
    if (currentTheme.colors.palette) {
      Object.entries(currentTheme.colors.palette).forEach(([colorName, shades]: [string, any]) => {
        Object.entries(shades).forEach(([key, value]) => {
          vars[`--wiley-${colorName}-${key}`] = value
        })
      })
    }

    // Add semantic accent colors (success, info, warning, error)
    if (currentTheme.colors.semantic) {
      Object.entries(currentTheme.colors.semantic).forEach(([key, value]) => {
        vars[`--wiley-semantic-${key}`] = value
      })
    }

    // 🎨 Add Semantic Color System (Light/Dark pairs for accessibility)
    if (currentTheme.colors.semanticColors) {
      // Primary colors
      if (currentTheme.colors.semanticColors.primary) {
        vars['--semantic-primary-light'] = currentTheme.colors.semanticColors.primary.light
        vars['--semantic-primary-dark'] = currentTheme.colors.semanticColors.primary.dark
        if (currentTheme.colors.semanticColors.primary.hover) {
          vars['--semantic-primary-light-hover'] = currentTheme.colors.semanticColors.primary.hover.light
          vars['--semantic-primary-dark-hover'] = currentTheme.colors.semanticColors.primary.hover.dark
        }
      }
      // Secondary colors (Figma Brand 2 - solid button with light bg + dark text)
      if (currentTheme.colors.semanticColors.secondary) {
        if (currentTheme.colors.semanticColors.secondary.bg) {
          vars['--semantic-secondary-bg-light'] = currentTheme.colors.semanticColors.secondary.bg.light
          vars['--semantic-secondary-bg-dark'] = currentTheme.colors.semanticColors.secondary.bg.dark
        }
        if (currentTheme.colors.semanticColors.secondary.text) {
          vars['--semantic-secondary-text-light'] = currentTheme.colors.semanticColors.secondary.text.light
          vars['--semantic-secondary-text-dark'] = currentTheme.colors.semanticColors.secondary.text.dark
        }
        if (currentTheme.colors.semanticColors.secondary.hover) {
          if (currentTheme.colors.semanticColors.secondary.hover.bg) {
            vars['--semantic-secondary-bg-light-hover'] = currentTheme.colors.semanticColors.secondary.hover.bg.light
            vars['--semantic-secondary-bg-dark-hover'] = currentTheme.colors.semanticColors.secondary.hover.bg.dark
          }
          if (currentTheme.colors.semanticColors.secondary.hover.text) {
            vars['--semantic-secondary-text-light-hover'] = currentTheme.colors.semanticColors.secondary.hover.text.light
            vars['--semantic-secondary-text-dark-hover'] = currentTheme.colors.semanticColors.secondary.hover.text.dark
          }
        }
      }
      // Tertiary colors (Figma Brand 3 - solid button with light bg + dark text)
      if (currentTheme.colors.semanticColors.tertiary) {
        if (currentTheme.colors.semanticColors.tertiary.bg) {
          vars['--semantic-tertiary-bg-light'] = currentTheme.colors.semanticColors.tertiary.bg.light
          vars['--semantic-tertiary-bg-dark'] = currentTheme.colors.semanticColors.tertiary.bg.dark
        }
        if (currentTheme.colors.semanticColors.tertiary.text) {
          vars['--semantic-tertiary-text-light'] = currentTheme.colors.semanticColors.tertiary.text.light
          vars['--semantic-tertiary-text-dark'] = currentTheme.colors.semanticColors.tertiary.text.dark
        }
        if (currentTheme.colors.semanticColors.tertiary.hover) {
          if (currentTheme.colors.semanticColors.tertiary.hover.bg) {
            vars['--semantic-tertiary-bg-light-hover'] = currentTheme.colors.semanticColors.tertiary.hover.bg.light
            vars['--semantic-tertiary-bg-dark-hover'] = currentTheme.colors.semanticColors.tertiary.hover.bg.dark
          }
          if (currentTheme.colors.semanticColors.tertiary.hover.text) {
            vars['--semantic-tertiary-text-light-hover'] = currentTheme.colors.semanticColors.tertiary.hover.text.light
            vars['--semantic-tertiary-text-dark-hover'] = currentTheme.colors.semanticColors.tertiary.hover.text.dark
          }
        }
      }
      
      // Neutral Dark (color4) - NEW for MCP theme
      if (currentTheme.colors.semanticColors.neutralDark) {
        if (currentTheme.colors.semanticColors.neutralDark.bg) {
          vars['--semantic-neutraldark-bg-light'] = currentTheme.colors.semanticColors.neutralDark.bg.light
          vars['--semantic-neutraldark-bg-dark'] = currentTheme.colors.semanticColors.neutralDark.bg.dark
        }
        if (currentTheme.colors.semanticColors.neutralDark.text) {
          vars['--semantic-neutraldark-text-light'] = currentTheme.colors.semanticColors.neutralDark.text.light
          vars['--semantic-neutraldark-text-dark'] = currentTheme.colors.semanticColors.neutralDark.text.dark
        }
        if (currentTheme.colors.semanticColors.neutralDark.hover) {
          if (currentTheme.colors.semanticColors.neutralDark.hover.bg) {
            vars['--semantic-neutraldark-bg-light-hover'] = currentTheme.colors.semanticColors.neutralDark.hover.bg.light
            vars['--semantic-neutraldark-bg-dark-hover'] = currentTheme.colors.semanticColors.neutralDark.hover.bg.dark
          }
          if (currentTheme.colors.semanticColors.neutralDark.hover.text) {
            vars['--semantic-neutraldark-text-light-hover'] = currentTheme.colors.semanticColors.neutralDark.hover.text.light
            vars['--semantic-neutraldark-text-dark-hover'] = currentTheme.colors.semanticColors.neutralDark.hover.text.dark
          }
        }
      }
      
      // Neutral Light (color5) - NEW for MCP theme
      if (currentTheme.colors.semanticColors.neutralLight) {
        if (currentTheme.colors.semanticColors.neutralLight.bg) {
          vars['--semantic-neutrallight-bg-light'] = currentTheme.colors.semanticColors.neutralLight.bg.light
          vars['--semantic-neutrallight-bg-dark'] = currentTheme.colors.semanticColors.neutralLight.bg.dark
        }
        if (currentTheme.colors.semanticColors.neutralLight.text) {
          vars['--semantic-neutrallight-text-light'] = currentTheme.colors.semanticColors.neutralLight.text.light
          vars['--semantic-neutrallight-text-dark'] = currentTheme.colors.semanticColors.neutralLight.text.dark
        }
        if (currentTheme.colors.semanticColors.neutralLight.hover) {
          if (currentTheme.colors.semanticColors.neutralLight.hover.bg) {
            vars['--semantic-neutrallight-bg-light-hover'] = currentTheme.colors.semanticColors.neutralLight.hover.bg.light
            vars['--semantic-neutrallight-bg-dark-hover'] = currentTheme.colors.semanticColors.neutralLight.hover.bg.dark
          }
          if (currentTheme.colors.semanticColors.neutralLight.hover.text) {
            vars['--semantic-neutrallight-text-light-hover'] = currentTheme.colors.semanticColors.neutralLight.hover.text.light
            vars['--semantic-neutrallight-text-dark-hover'] = currentTheme.colors.semanticColors.neutralLight.hover.text.dark
          }
        }
      }
    }

    return vars
  }

  return (
    <div 
      className="theme-canvas"
      style={buildExtendedVars() as React.CSSProperties}
    >
      {children}
    </div>
  )
}
