import { useEffect } from 'react'
import { generateThemeCSS } from '../../styles/themeCSS'
import { resolveThemeColors, type BrandMode } from '../../utils/tokenResolver'
import { createDebugLogger } from '../../utils/logger'
import { 
  mapWileyDSV2ToFoundation, 
  mapClassicUX3ToFoundation,
  mapCarbonToFoundation,
  mapAntDesignToFoundation
} from '../../foundation'

// 🐛 DEBUG FLAG - Set to true to enable detailed theme provider logs
const DEBUG_THEME_PROVIDER = false
const debugLog = createDebugLogger(DEBUG_THEME_PROVIDER)

// Helper function to resolve spacing token references (e.g., 'radius.sm' → '8px')
function resolveSpacingToken(tokenRef: string | undefined, theme: any): string | undefined {
  if (!tokenRef || !theme.spacing) return tokenRef
  
  // If it's already a direct value (e.g., '8px'), return as-is
  if (tokenRef.match(/^\d+px$/)) return tokenRef
  
  // Parse token reference (e.g., 'radius.sm' → ['radius', 'sm'])
  const parts = tokenRef.split('.')
  if (parts.length !== 2) return tokenRef
  
  const [category, size] = parts
  
  // Resolve from theme.spacing
  if (category === 'radius' && theme.spacing.radius) {
    return theme.spacing.radius[size]
  }
  if (category === 'semantic' && theme.spacing.semantic) {
    return theme.spacing.semantic[size]
  }
  if (category === 'base' && theme.spacing.base) {
    return theme.spacing.base[size]
  }
  
  return tokenRef
}

interface CanvasThemeProviderProps {
  children: React.ReactNode
  usePageStore: any // TODO: Type this properly when extracting store
  scopeCSS?: boolean // If true, CSS will be scoped to .theme-preview only (for Design Console). Also uses previewBrandMode and previewThemeId from store.
}

export function CanvasThemeProvider({ children, usePageStore, scopeCSS = false }: CanvasThemeProviderProps) {
  // Use selector to explicitly track brand mode changes
  const currentWebsiteId = usePageStore((state: any) => state.currentWebsiteId)
  const currentView = usePageStore((state: any) => state.currentView)
  const themes = usePageStore((state: any) => state.themes)
  const currentWebsite = usePageStore((state: any) => 
    state.websites?.find((w: any) => w.id === state.currentWebsiteId)
  )
  const storeBrandMode: BrandMode = usePageStore((state: any) => {
    const website = state.websites?.find((w: any) => w.id === state.currentWebsiteId)
    return website?.brandMode || 'wiley'
  })
  
  // Preview mode is ONLY for Design Console, not for Page Builder editor
  const isDesignConsolePreview = currentView === 'design-console'
  const previewBrandMode: BrandMode = usePageStore((state: any) => state.previewBrandMode)
  const previewThemeId: string = usePageStore((state: any) => state.previewThemeId)
  
  // Use preview IDs ONLY in Design Console, otherwise use current website's IDs
  const brandMode: BrandMode = isDesignConsolePreview ? previewBrandMode : storeBrandMode
  const themeIdToUse = isDesignConsolePreview 
    ? previewThemeId 
    : (currentWebsite?.themeId || 'classic-ux3-theme')
  
  debugLog('log', '🎨 CanvasThemeProvider RENDER:', {
    currentView,
    websiteId: currentWebsiteId,
    websiteName: currentWebsite?.name,
    scopeCSS,
    isDesignConsolePreview,
    themeIdToUse,
    brandMode,
    hasOverrides: !!currentWebsite?.themeOverrides,
    overrideColors: currentWebsite?.themeOverrides?.colors,
    source: isDesignConsolePreview ? 'previewBrandMode (Design Console)' : 'storeBrandMode (Page Builder/Live)',
    timestamp: new Date().toISOString()
  })
  
  // Find the theme
  const rawTheme = themes.find((t: any) => t.id === themeIdToUse) || themes.find((t: any) => t.id === 'classic-ux3-theme')
  
  // Resolve token references based on brand mode
  let currentTheme = rawTheme ? resolveThemeColors(rawTheme, brandMode) : rawTheme
  
  // 🎨 CRITICAL: Merge website-level theme overrides (from ThemeEditor)
  // This ensures color changes made via Design Console > Website > Branding are reflected
  if (currentTheme && currentWebsite?.themeOverrides) {
    debugLog('log', '🔀 Merging website themeOverrides into theme:', {
      websiteId: currentWebsiteId,
      overrides: currentWebsite.themeOverrides,
      beforeMerge: currentTheme.colors.primary,
      afterMerge: currentWebsite.themeOverrides.colors?.primary || currentTheme.colors.primary
    })
    
    currentTheme = {
      ...currentTheme,
      colors: { ...currentTheme.colors, ...currentWebsite.themeOverrides.colors },
      typography: { ...currentTheme.typography, ...currentWebsite.themeOverrides.typography },
      spacing: { ...currentTheme.spacing, ...currentWebsite.themeOverrides.spacing },
      components: { ...currentTheme.components, ...currentWebsite.themeOverrides.components }
    }
  }
  
  debugLog('log', '🔍 CanvasThemeProvider Debug:', {
    currentWebsiteId,
    currentWebsite: currentWebsite?.name,
    themeId: currentWebsite?.themeId,
    brandMode,
    currentTheme: currentTheme?.name,
    themesCount: themes.length,
    semanticColorsResolved: !!currentTheme?.colors?.semanticColors,
    hasOverrides: !!currentWebsite?.themeOverrides,
    effectiveColors: currentTheme?.colors
  })
  
  if (!currentTheme) {
    debugLog('error', '❌ No theme found! Provider rendering without CSS injection.')
    return <>{children}</>
  }

  // Build extended CSS variables from Figma token structure
  const buildExtendedVars = () => {
    // Get brand-specific typography if available (Wiley DS V2 multi-brand support)
    const brandTypography = currentTheme.typography?.[brandMode] || {}
    const headingFont = brandTypography.headingFont || currentTheme.typography.headingFont
    const bodyFont = brandTypography.bodyFont || currentTheme.typography.bodyFont
    
    const vars: any = {
      // Core theme variables
      '--theme-color-primary': currentTheme.colors.primary,
      '--theme-color-secondary': currentTheme.colors.secondary,
      '--theme-color-accent': currentTheme.colors.accent,
      '--theme-color-text': currentTheme.colors.text,
      '--theme-color-background': currentTheme.colors.background,
      '--theme-color-muted': currentTheme.colors.muted,
      '--theme-heading-font': headingFont,  // Brand-specific (Wiley=Inter, WT=Noto Serif, Dummies=Open Sans)
      '--theme-body-font': bodyFont,        // Brand-specific
      '--theme-base-size': currentTheme.typography.baseSize,
      '--theme-scale': currentTheme.typography.scale,
      // Component styling (resolve spacing token references)
      '--theme-button-radius': resolveSpacingToken(currentTheme.components?.button?.borderRadius, currentTheme) || '0.375rem',
      '--theme-card-radius': resolveSpacingToken(currentTheme.components?.card?.borderRadius, currentTheme) || '0.5rem',
      '--theme-id': currentTheme.id,
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

    // 🎨 Add Foundation Color System (for themes with foundation.colors like Classic UX3)
    if (currentTheme.foundation?.colors) {
      Object.entries(currentTheme.foundation.colors).forEach(([colorName, shades]: [string, any]) => {
        if (typeof shades === 'object') {
          Object.entries(shades).forEach(([shade, value]) => {
            vars[`--foundation-${colorName}-${shade}`] = value
          })
        }
      })
    }

    // 🎨 Add IBM Carbon Structured Colors (borders, textColors, layers, support)
    if (currentTheme.colors.borders) {
      Object.entries(currentTheme.colors.borders).forEach(([key, value]) => {
        vars[`--carbon-border-${key}`] = value
      })
    }
    if (currentTheme.colors.textColors) {
      Object.entries(currentTheme.colors.textColors).forEach(([key, value]) => {
        vars[`--carbon-text-${key}`] = value
      })
    }
    if (currentTheme.colors.layers) {
      Object.entries(currentTheme.colors.layers).forEach(([key, value]) => {
        vars[`--carbon-layer-${key}`] = value
      })
    }
    if (currentTheme.colors.support) {
      Object.entries(currentTheme.colors.support).forEach(([key, value]) => {
        vars[`--carbon-support-${key}`] = value
      })
    }

    // 🚀 ATYPON DESIGN FOUNDATION - Token Injection
    // Map theme-specific structures to universal Foundation tokens
    try {
      debugLog('log', '🎨 About to inject Foundation tokens with theme colors:', {
        themeId: currentTheme.id,
        primary: currentTheme.colors.primary,
        secondary: currentTheme.colors.secondary,
        accent: currentTheme.colors.accent,
        currentView,
        hasSemanticColors: !!currentTheme.colors.semanticColors
      })
      
      let foundationTokens = null
      
      // Map each theme to Foundation tokens
      if (currentTheme.id === 'wiley-figma-ds-v2') {
        foundationTokens = mapWileyDSV2ToFoundation(currentTheme, brandMode)
      } else if (currentTheme.id === 'classic-ux3-theme') {
        foundationTokens = mapClassicUX3ToFoundation(currentTheme)
      } else if (currentTheme.id === 'ibm-carbon-ds') {
        foundationTokens = mapCarbonToFoundation(currentTheme)
      } else if (currentTheme.id === 'ant-design') {
        foundationTokens = mapAntDesignToFoundation(currentTheme)
      }
      
      // Inject Foundation CSS variables if adapter exists for this theme
      if (foundationTokens) {
        Object.entries(foundationTokens).forEach(([key, value]) => {
          const cssVarName = `--foundation-${key.replace(/\./g, '-')}`
          vars[cssVarName] = value
        })
        
        debugLog('log', '🚀 Foundation tokens injected for', currentTheme.name, ':', Object.keys(foundationTokens).length, 'tokens')
      } else {
        debugLog('warn', '⚠️ No Foundation adapter for theme:', currentTheme.name, '(id:', currentTheme.id, ')')
      }
    } catch (error) {
      debugLog('error', '❌ Foundation token mapping failed for', currentTheme.name, ':', error)
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

  // Inject generated theme CSS into document head
  useEffect(() => {
    debugLog('log', '🚀 useEffect RUNNING! Dependencies:', { themeId: currentTheme?.id, brandMode, scopeCSS, websiteId: currentWebsiteId })
    
    const styleId = `theme-styles-${currentTheme.id}-${scopeCSS ? 'scoped' : 'global'}`
    
    debugLog('log', '🧹 Removing ALL old theme styles')
    // Remove ALL old theme styles (not just this theme)
    const allThemeStyles = document.querySelectorAll('[id^="theme-styles-"]')
    allThemeStyles.forEach(el => {
      debugLog('log', '  Removing:', el.id)
      el.remove()
    })
    debugLog('log', '✅ All old styles removed')
    
    debugLog('log', '🎨 Generating CSS for theme:', currentTheme.name)
    // Generate and inject new theme CSS
    const styleEl = document.createElement('style')
    styleEl.id = styleId
    
    try {
      styleEl.textContent = generateThemeCSS(currentTheme, scopeCSS)
      debugLog('log', '✅ CSS Generated, length:', styleEl.textContent.length, 'characters', scopeCSS ? '(SCOPED to .theme-preview)' : '(GLOBAL)')
      
      // Debug: Show first 500 chars of generated CSS
      if (scopeCSS) {
        debugLog('log', '📝 First 500 chars of SCOPED CSS:', styleEl.textContent.substring(0, 500))
        // Check if .btn class exists
        if (styleEl.textContent.includes('.theme-preview .btn')) {
          debugLog('log', '✅ Scoped .btn classes found!')
        } else {
          debugLog('error', '❌ NO scoped .btn classes found in generated CSS!')
        }
      }
    } catch (error) {
      debugLog('error', '❌ CSS Generation failed:', error)
      return
    }
    
    document.head.appendChild(styleEl)
    debugLog('log', '✅ Style element appended to head with id:', styleId)
    
    debugLog('log', '🎨 Theme CSS Injected:', {
      themeId: currentTheme.id,
      themeName: currentTheme.name,
      buttonRadius: currentTheme.components?.button?.borderRadius,
      cardRadius: currentTheme.components?.card?.borderRadius
    })
    
    // Cleanup on unmount or theme change
    return () => {
      const el = document.getElementById(styleId)
      if (el) {
        el.remove()
        debugLog('log', '🧹 Cleanup: Removed theme styles:', styleId)
      }
    }
  }, [
    currentTheme.id, 
    brandMode, 
    scopeCSS, 
    currentWebsiteId, 
    previewThemeId, 
    currentView,
    // Track actual color values to detect changes
    currentTheme.colors.primary,
    currentTheme.colors.secondary,
    currentTheme.colors.accent
  ]) // Re-run when theme, brand mode, scoping, website, colors, or view change

  return (
    <div 
      className="theme-canvas"
      style={buildExtendedVars() as React.CSSProperties}
    >
      {children}
    </div>
  )
}
