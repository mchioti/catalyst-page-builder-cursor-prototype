/**
 * Atypon Design Foundation - Classic UX3 Adapter
 * 
 * Maps the Classic UX3 theme structure to Foundation token contracts.
 * This demonstrates that Foundation works with different Design Systems.
 */

import type { FoundationTokens } from '../tokens/contracts'

/**
 * Map Classic UX3 theme to Foundation tokens
 * 
 * @param theme - Classic UX3 theme object
 * @returns Resolved Foundation tokens
 */
export function mapClassicUX3ToFoundation(theme: any): FoundationTokens {
  
  // Helper to get foundation color by path
  const getFoundationColor = (path: string): string => {
    const parts = path.split('.')
    let value = theme.foundation?.colors
    for (const part of parts) {
      value = value?.[part]
      if (value === undefined) break
    }
    return value || '#000000'
  }
  
  // ========================================================================
  // ACTION COLORS (Button colors)
  // ========================================================================
  
  // Primary: Use theme.colors.primary (from ThemeEditor overrides) or fallback to default teal
  const actionPrimary = theme.colors?.primary || getFoundationColor('teal.600')
  const actionPrimaryHover = theme.colors?.primaryDark || getFoundationColor('teal.700')
  const actionPrimaryActive = theme.colors?.primaryDark || getFoundationColor('teal.800')
  const actionPrimaryDisabled = getFoundationColor('gray.300')
  const actionPrimaryText = '#FFFFFF'
  
  // Secondary: Use theme.colors.secondary or fallback to default blue
  const actionSecondary = theme.colors?.secondary || getFoundationColor('blue.600')
  const actionSecondaryHover = getFoundationColor('blue.700')
  const actionSecondaryActive = getFoundationColor('blue.800')
  const actionSecondaryDisabled = getFoundationColor('gray.300')
  const actionSecondaryText = '#FFFFFF'
  
  // Tertiary: Use theme.colors.accent or fallback to default gray
  const actionTertiary = theme.colors?.accent || getFoundationColor('gray.600')
  const actionTertiaryHover = theme.colors?.accentDark || getFoundationColor('gray.700')
  const actionTertiaryActive = theme.colors?.accentDark || getFoundationColor('gray.800')
  const actionTertiaryDisabled = getFoundationColor('gray.300')
  const actionTertiaryText = '#FFFFFF'
  
  // ========================================================================
  // SURFACE COLORS
  // ========================================================================
  
  const surfaceBackground = '#FFFFFF'
  const surfaceForeground = getFoundationColor('gray.50')
  const surfaceBorder = getFoundationColor('gray.300')
  const surfaceBorderHover = getFoundationColor('gray.400')
  
  // ========================================================================
  // CONTENT COLORS (Text)
  // ========================================================================
  
  const contentPrimary = getFoundationColor('gray.900')
  const contentSecondary = getFoundationColor('gray.700')
  const contentTertiary = getFoundationColor('gray.500')
  const contentInverse = '#FFFFFF'
  const contentDisabled = getFoundationColor('gray.400')
  
  // ========================================================================
  // FEEDBACK COLORS
  // ========================================================================
  
  const feedbackSuccess = '#22c55e' // Green
  const feedbackError = '#ef4444' // Red
  const feedbackWarning = '#f59e0b' // Amber
  const feedbackInfo = getFoundationColor('blue.600')
  
  // ========================================================================
  // TYPOGRAPHY
  // ========================================================================
  
  const fontPrimary = theme.typography?.bodyFont || 'Lato, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  const fontSecondary = '"Courier New", Courier, monospace'
  const fontHeading = theme.typography?.headingFont || 'Volkhov, Georgia, serif'
  
  // ========================================================================
  // SPACING (8-point grid)
  // ========================================================================
  
  const spacing0 = '0'
  const spacing1 = '4px'
  const spacing2 = '8px'
  const spacing3 = '12px'
  const spacing4 = '16px'
  const spacing5 = '20px'
  const spacing6 = '24px'
  const spacing8 = '32px'
  const spacing10 = '40px'
  const spacing12 = '48px'
  const spacing16 = '64px'
  const spacing20 = '80px'
  const spacing24 = '96px'
  
  // ========================================================================
  // BUTTON COMPONENT TOKENS
  // ========================================================================
  
  // Border Radius (2px for Classic UX3)
  const buttonRadiusSmall = '2px'
  const buttonRadiusMedium = '2px'
  const buttonRadiusLarge = '2px'
  
  // Padding
  const buttonPaddingSmall = '8px 16px'
  const buttonPaddingMedium = '10px 20px'
  const buttonPaddingLarge = '12px 24px'
  
  // Height
  const buttonHeightSmall = '32px'
  const buttonHeightMedium = '40px'
  const buttonHeightLarge = '48px'
  
  // Typography
  const buttonFontFamily = fontPrimary
  const buttonFontSizeSmall = '12px'
  const buttonFontSizeMedium = '14px'
  const buttonFontSizeLarge = '16px'
  const buttonFontWeight = '500'
  const buttonLetterSpacing = '0'
  const buttonTextTransform = 'none'
  
  // Shadows (subtle for Classic UX3)
  const buttonShadowRest = '0 1px 2px rgba(0, 0, 0, 0.05)'
  const buttonShadowHover = '0 2px 4px rgba(0, 0, 0, 0.1)'
  const buttonShadowActive = '0 1px 2px rgba(0, 0, 0, 0.05)'
  const buttonShadowFocus = `0 0 0 3px ${actionPrimary}20` // 20% opacity ring
  
  const buttonBorderWidth = '1px'
  
  // ========================================================================
  // MOTION
  // ========================================================================
  
  const motionDurationInstant = '0ms'
  const motionDurationFast = '100ms'
  const motionDurationNormal = '150ms'
  const motionDurationSlow = '300ms'
  
  const motionEasingStandard = 'cubic-bezier(0.4, 0, 0.2, 1)'
  const motionEasingDecelerate = 'cubic-bezier(0, 0, 0.2, 1)'
  const motionEasingAccelerate = 'cubic-bezier(0.4, 0, 1, 1)'
  
  // ========================================================================
  // RETURN COMPLETE TOKEN SET
  // ========================================================================
  
  return {
    // Action Colors
    'action-primary': actionPrimary,
    'action-primary-hover': actionPrimaryHover,
    'action-primary-active': actionPrimaryActive,
    'action-primary-disabled': actionPrimaryDisabled,
    'action-primary-text': actionPrimaryText,
    
    'action-secondary': actionSecondary,
    'action-secondary-hover': actionSecondaryHover,
    'action-secondary-active': actionSecondaryActive,
    'action-secondary-disabled': actionSecondaryDisabled,
    'action-secondary-text': actionSecondaryText,
    
    'action-tertiary': actionTertiary,
    'action-tertiary-hover': actionTertiaryHover,
    'action-tertiary-active': actionTertiaryActive,
    'action-tertiary-disabled': actionTertiaryDisabled,
    'action-tertiary-text': actionTertiaryText,
    
    // Surface Colors
    'surface-background': surfaceBackground,
    'surface-foreground': surfaceForeground,
    'surface-border': surfaceBorder,
    'surface-border-hover': surfaceBorderHover,
    
    // Content Colors
    'content-primary': contentPrimary,
    'content-secondary': contentSecondary,
    'content-tertiary': contentTertiary,
    'content-inverse': contentInverse,
    'content-disabled': contentDisabled,
    
    // Feedback Colors
    'feedback-success': feedbackSuccess,
    'feedback-error': feedbackError,
    'feedback-warning': feedbackWarning,
    'feedback-info': feedbackInfo,
    
    // Typography
    'font-family-primary': fontPrimary,
    'font-family-secondary': fontSecondary,
    'font-family-heading': fontHeading,
    
    'font-size-xs': '12px',
    'font-size-sm': '14px',
    'font-size-md': '16px',
    'font-size-lg': '18px',
    'font-size-xl': '20px',
    
    'font-weight-regular': '400',
    'font-weight-medium': '500',
    'font-weight-semibold': '600',
    'font-weight-bold': '700',
    
    'line-height-tight': '1.25',
    'line-height-normal': '1.5',
    'line-height-relaxed': '1.75',
    
    // Heading Typography (H1-H6) - Classic UX3 Traditional Scale with Volkhov Serif
    'heading-h1-font-size-desktop': '42px',
    'heading-h1-font-size-mobile': '32px',
    'heading-h1-font-weight': '700',
    'heading-h1-line-height': '1.2',
    'heading-h1-letter-spacing': '-0.02em',
    
    'heading-h2-font-size-desktop': '36px',
    'heading-h2-font-size-mobile': '28px',
    'heading-h2-font-weight': '700',
    'heading-h2-line-height': '1.25',
    'heading-h2-letter-spacing': '-0.01em',
    
    'heading-h3-font-size-desktop': '28px',
    'heading-h3-font-size-mobile': '24px',
    'heading-h3-font-weight': '600',
    'heading-h3-line-height': '1.3',
    'heading-h3-letter-spacing': '0',
    
    'heading-h4-font-size-desktop': '22px',
    'heading-h4-font-size-mobile': '20px',
    'heading-h4-font-weight': '600',
    'heading-h4-line-height': '1.4',
    'heading-h4-letter-spacing': '0',
    
    'heading-h5-font-size-desktop': '18px',
    'heading-h5-font-size-mobile': '17px',
    'heading-h5-font-weight': '600',
    'heading-h5-line-height': '1.5',
    'heading-h5-letter-spacing': '0',
    
    'heading-h6-font-size-desktop': '16px',
    'heading-h6-font-size-mobile': '15px',
    'heading-h6-font-weight': '600',
    'heading-h6-line-height': '1.5',
    'heading-h6-letter-spacing': '0.01em',
    
    // Body Text Typography (XL-XS) - Classic UX3 with Lato Sans-Serif
    'text-xl-font-size-desktop': '22px',
    'text-xl-font-size-mobile': '20px',
    'text-xl-line-height': '1.6',
    'text-xl-letter-spacing': '0',
    
    'text-lg-font-size-desktop': '18px',
    'text-lg-font-size-mobile': '17px',
    'text-lg-line-height': '1.6',
    'text-lg-letter-spacing': '0',
    
    'text-md-font-size-desktop': '16px',
    'text-md-font-size-mobile': '15px',
    'text-md-line-height': '1.65',
    'text-md-letter-spacing': '0',
    
    'text-sm-font-size-desktop': '14px',
    'text-sm-font-size-mobile': '14px',
    'text-sm-line-height': '1.5',
    'text-sm-letter-spacing': '0',
    
    'text-xs-font-size-desktop': '12px',
    'text-xs-font-size-mobile': '12px',
    'text-xs-line-height': '1.4',
    'text-xs-letter-spacing': '0.02em',
    
    // Spacing
    'spacing-0': spacing0,
    'spacing-1': spacing1,
    'spacing-2': spacing2,
    'spacing-3': spacing3,
    'spacing-4': spacing4,
    'spacing-5': spacing5,
    'spacing-6': spacing6,
    'spacing-8': spacing8,
    'spacing-10': spacing10,
    'spacing-12': spacing12,
    'spacing-16': spacing16,
    'spacing-20': spacing20,
    'spacing-24': spacing24,
    
    // Button
    'button-radius-small': buttonRadiusSmall,
    'button-radius-medium': buttonRadiusMedium,
    'button-radius-large': buttonRadiusLarge,
    
    'button-padding-small': buttonPaddingSmall,
    'button-padding-medium': buttonPaddingMedium,
    'button-padding-large': buttonPaddingLarge,
    
    'button-height-small': buttonHeightSmall,
    'button-height-medium': buttonHeightMedium,
    'button-height-large': buttonHeightLarge,
    
    'button-font-family': buttonFontFamily,
    'button-font-size-small': buttonFontSizeSmall,
    'button-font-size-medium': buttonFontSizeMedium,
    'button-font-size-large': buttonFontSizeLarge,
    'button-font-weight': buttonFontWeight,
    'button-letter-spacing': buttonLetterSpacing,
    'button-text-transform': buttonTextTransform,
    
    'button-shadow-rest': buttonShadowRest,
    'button-shadow-hover': buttonShadowHover,
    'button-shadow-active': buttonShadowActive,
    'button-shadow-focus': buttonShadowFocus,
    
    'button-border-width': buttonBorderWidth,
    
    // Motion
    'motion-duration-instant': motionDurationInstant,
    'motion-duration-fast': motionDurationFast,
    'motion-duration-normal': motionDurationNormal,
    'motion-duration-slow': motionDurationSlow,
    
    'motion-easing-standard': motionEasingStandard,
    'motion-easing-decelerate': motionEasingDecelerate,
    'motion-easing-accelerate': motionEasingAccelerate,
  }
}

