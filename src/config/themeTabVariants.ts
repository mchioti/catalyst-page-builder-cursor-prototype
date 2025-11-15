/**
 * Theme Tab Variants Configuration
 * 
 * Defines which tab style variants are available for each theme.
 * This makes the Properties Panel theme-aware, showing only supported variants.
 */

export type TabVariant = 'underline' | 'pills' | 'buttons'

export interface ThemeTabConfig {
  themeId: string
  themeName: string
  supportedVariants: TabVariant[]
  defaultVariant: TabVariant
}

export const THEME_TAB_VARIANTS: Record<string, ThemeTabConfig> = {
  'wiley-figma-ds-v2': {
    themeId: 'wiley-figma-ds-v2',
    themeName: 'Wiley',
    supportedVariants: ['underline', 'pills'],
    defaultVariant: 'underline'
  },
  'classic-ux3-theme': {
    themeId: 'classic-ux3-theme',
    themeName: 'Classic',
    supportedVariants: ['underline', 'pills', 'buttons'],
    defaultVariant: 'underline'
  },
  'ibm-carbon-ds': {
    themeId: 'ibm-carbon-ds',
    themeName: 'IBM (carbon)',
    supportedVariants: ['underline'],
    defaultVariant: 'underline'
  },
  'ant-design': {
    themeId: 'ant-design',
    themeName: 'Ant Design',
    supportedVariants: ['underline'],
    defaultVariant: 'underline'
  }
}

/**
 * Get supported tab variants for a theme
 */
export const getSupportedTabVariants = (themeId: string): TabVariant[] => {
  return THEME_TAB_VARIANTS[themeId]?.supportedVariants || ['underline', 'pills', 'buttons']
}

/**
 * Get default tab variant for a theme
 */
export const getDefaultTabVariant = (themeId: string): TabVariant => {
  return THEME_TAB_VARIANTS[themeId]?.defaultVariant || 'underline'
}

/**
 * Check if a theme supports a specific tab variant
 */
export const isTabVariantSupported = (themeId: string, variant: TabVariant): boolean => {
  const config = THEME_TAB_VARIANTS[themeId]
  if (!config) return true // If theme not configured, allow all
  return config.supportedVariants.includes(variant)
}

/**
 * Get display label for tab variant
 */
export const getTabVariantLabel = (variant: TabVariant): string => {
  const labels: Record<TabVariant, string> = {
    'underline': 'Underline',
    'pills': 'Pills',
    'buttons': 'Buttons'
  }
  return labels[variant] || variant
}

