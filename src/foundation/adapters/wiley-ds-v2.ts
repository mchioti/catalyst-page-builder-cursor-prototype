/**
 * Atypon Design Foundation - Wiley DS V2 Adapter
 * 
 * Maps the existing Wiley DS V2 theme structure to Foundation token contracts.
 * This allows Wiley DS V2 to work with the new Foundation button system.
 */

import type { FoundationTokens } from '../tokens/contracts'

/**
 * Map Wiley DS V2 theme to Foundation tokens
 * 
 * @param theme - Wiley DS V2 theme object
 * @param brandMode - Active brand mode (wiley, wt, dummies)
 * @returns Resolved Foundation tokens
 */
export function mapWileyDSV2ToFoundation(
  theme: any,
  brandMode: string = 'wiley'
): FoundationTokens {
  
  // Helper to resolve semantic colors based on context (light bg by default for now)
  const getSemanticColor = (colorKey: 'primary' | 'secondary' | 'tertiary' | 'neutralDark' | 'neutralLight', state: 'bg' | 'text' | 'hover', context: 'light' | 'dark' = 'light') => {
    // After resolveThemeColors(), semantic colors are at theme.colors.semanticColors
    const colorDef = theme.colors?.semanticColors?.[colorKey]
    if (!colorDef) {
      console.warn(`[Wiley DS V2 Adapter] Missing semantic color: ${colorKey}`)
      return '#000000'
    }
    
    if (state === 'bg') {
      return context === 'light' ? colorDef.dark : colorDef.light
    } else if (state === 'text') {
      return colorDef[state]?.[context] || '#ffffff'
    } else if (state === 'hover') {
      return colorDef.hover?.[context] || colorDef.dark
    }
    
    return '#000000'
  }
  
  // ========================================================================
  // ACTION COLORS (Button colors)
  // ========================================================================
  
  const actionPrimary = getSemanticColor('primary', 'bg', 'light')
  const actionPrimaryHover = getSemanticColor('primary', 'hover', 'light')
  const actionPrimaryText = getSemanticColor('primary', 'text', 'light')
  
  const actionSecondary = getSemanticColor('secondary', 'bg', 'light')
  const actionSecondaryHover = getSemanticColor('secondary', 'hover', 'light')
  const actionSecondaryText = getSemanticColor('secondary', 'text', 'light')
  
  const actionTertiary = getSemanticColor('tertiary', 'bg', 'light')
  const actionTertiaryHover = getSemanticColor('tertiary', 'hover', 'light')
  const actionTertiaryText = getSemanticColor('tertiary', 'text', 'light')
  
  // ========================================================================
  // SURFACE COLORS
  // ========================================================================
  
  const surfaceBackground = theme.colors?.background || '#FFFFFF'
  const surfaceForeground = theme.coreColors?.foundation?.neutral?.[100] || '#F5F5F5'
  const surfaceBorder = theme.coreColors?.foundation?.neutral?.[300] || '#D4D4D4'
  
  // ========================================================================
  // CONTENT COLORS (Text)
  // ========================================================================
  
  const contentPrimary = theme.colors?.text || theme.coreColors?.foundation?.neutral?.[900] || '#1A1A1A'
  const contentSecondary = theme.coreColors?.foundation?.neutral?.[700] || '#525252'
  const contentTertiary = theme.colors?.muted || theme.coreColors?.foundation?.neutral?.[500] || '#737373'
  const contentInverse = '#FFFFFF'
  const contentDisabled = theme.coreColors?.foundation?.neutral?.[400] || '#A3A3A3'
  
  // ========================================================================
  // FEEDBACK COLORS
  // ========================================================================
  
  const feedbackSuccess = theme.coreColors?.foundation?.primarySuccess?.[600] || '#16A34A'
  const feedbackError = theme.coreColors?.foundation?.primaryError?.[600] || '#DC2626'
  const feedbackWarning = theme.coreColors?.foundation?.primaryWarning?.[600] || '#F59E0B'
  const feedbackInfo = theme.coreColors?.foundation?.primaryData?.[600] || '#3B82F6'
  
  // ========================================================================
  // TYPOGRAPHY - Brand-specific fonts and letter spacing
  // ========================================================================
  
  // Get brand-specific typography settings
  const brandTypography = theme.typography?.[brandMode] || theme.typography?.wiley || {}
  
  // Font families per brand (Wiley=Inter, WT=Noto Serif, Dummies=Open Sans)
  const fontHeading = brandTypography.headingFont || theme.typography?.headingFont || 'Inter, sans-serif'
  const fontPrimary = brandTypography.bodyFont || theme.typography?.bodyFont || '"Open Sans", sans-serif'
  const fontSecondary = brandTypography.buttonFont || '"IBM Plex Mono", monospace'
  
  // Letter spacing per brand (Wiley has tight spacing, WT/Dummies normal)
  const brandLetterSpacing = brandTypography.letterSpacing || { heading: '0', body: '0', button: '0' }
  
  // Font sizes from typography styles
  const typographyStyles = theme.typography?.styles || {}
  const bodyMd = typographyStyles?.body || {}
  const fontSizeBase = bodyMd.fontSize || '16px'
  
  // ========================================================================
  // SPACING (from theme.spacing.base)
  // ========================================================================
  
  const baseSpacing = theme.spacing?.base || {}
  const spacing0 = baseSpacing['base-0'] || '0'
  const spacing1 = baseSpacing['base-1'] || '4px'
  const spacing2 = baseSpacing['base-2'] || '8px'
  const spacing3 = baseSpacing['base-3'] || '12px'
  const spacing4 = baseSpacing['base-4'] || '16px'
  const spacing5 = baseSpacing['base-5'] || '20px'
  const spacing6 = baseSpacing['base-6'] || '24px'
  const spacing8 = baseSpacing['base-8'] || '32px'
  const spacing10 = baseSpacing['base-10'] || '40px'
  const spacing12 = baseSpacing['base-12'] || '48px'
  const spacing16 = baseSpacing['base-16'] || '64px'
  const spacing20 = baseSpacing['base-20'] || '80px'
  const spacing24 = baseSpacing['base-24'] || '96px'
  
  // ========================================================================
  // BUTTON COMPONENT TOKENS
  // ========================================================================
  
  const buttonRadius = theme.spacing?.radius || {}
  const buttonRadiusSm = buttonRadius.sm || '4px'
  
  const buttonStyles = theme.typography?.styles?.button || {}
  const buttonLg = buttonStyles.lg || {}
  const buttonSm = buttonStyles.sm || {}
  
  // Button typography
  const buttonFontFamily = buttonLg.desktop?.fontFamily === 'secondary' ? fontSecondary : fontPrimary
  const buttonFontWeight = buttonLg.desktop?.fontWeight || '500'
  // Button letter spacing and transform from brand typography
  const buttonLetterSpacing = brandLetterSpacing.button || '0'
  const buttonTextTransform = brandMode === 'wiley' ? 'uppercase' : 'none'  // Only Wiley uses uppercase
  
  // Button sizes
  const buttonFontSizeLarge = buttonLg.desktop?.fontSize || '16px'
  const buttonFontSizeMedium = '14px'
  const buttonFontSizeSmall = buttonSm.desktop?.fontSize || '12px'
  
  // Button padding and height
  const buttonPaddingLarge = '12px 24px'
  const buttonPaddingMedium = '10px 20px'
  const buttonPaddingSmall = '8px 16px'
  
  const buttonHeightLarge = '48px'
  const buttonHeightMedium = '40px'
  const buttonHeightSmall = '32px'
  
  // Button shadows
  const buttonShadowRest = '0 1px 2px rgba(0, 0, 0, 0.05)'
  const buttonShadowHover = '0 4px 8px rgba(0, 0, 0, 0.1)'
  const buttonShadowActive = '0 1px 2px rgba(0, 0, 0, 0.05)'
  const buttonShadowFocus = `0 0 0 3px ${actionPrimary}33` // 20% opacity
  
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
    'action-primary-active': actionPrimaryHover, // Same as hover for now
    'action-primary-disabled': contentDisabled,
    'action-primary-text': actionPrimaryText,
    
    'action-secondary': actionSecondary,
    'action-secondary-hover': actionSecondaryHover,
    'action-secondary-active': actionSecondaryHover,
    'action-secondary-disabled': contentDisabled,
    'action-secondary-text': actionSecondaryText,
    
    'action-tertiary': actionTertiary,
    'action-tertiary-hover': actionTertiaryHover,
    'action-tertiary-active': actionTertiaryHover,
    'action-tertiary-disabled': contentDisabled,
    'action-tertiary-text': actionTertiaryText,
    
    // Surface Colors
    'surface-background': surfaceBackground,
    'surface-foreground': surfaceForeground,
    'surface-border': surfaceBorder,
    'surface-border-hover': contentSecondary,
    
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
    'font-size-md': fontSizeBase,
    'font-size-lg': '18px',
    'font-size-xl': '20px',
    
    'font-weight-regular': '400',
    'font-weight-medium': '500',
    'font-weight-semibold': '600',
    'font-weight-bold': '700',
    
    'line-height-tight': '1.25',
    'line-height-normal': '1.5',
    'line-height-relaxed': '1.75',
    
    // Heading Typography (H1-H6) - From theme.typography.styles (kebab-case keys) + brand letter spacing
    'heading-h1-font-size-desktop': theme.typography?.styles?.['heading-h1']?.desktop?.size || theme.typography?.styles?.h1?.fontSize || '48px',
    'heading-h1-font-size-mobile': theme.typography?.styles?.['heading-h1']?.mobile?.size || theme.typography?.styles?.h1?.fontSizeMobile || '36px',
    'heading-h1-font-weight': String(theme.typography?.styles?.['heading-h1']?.desktop?.weight || theme.typography?.styles?.h1?.fontWeight || '700'),
    'heading-h1-line-height': String(theme.typography?.styles?.['heading-h1']?.desktop?.lineHeight || theme.typography?.styles?.h1?.lineHeight || '1.2'),
    'heading-h1-letter-spacing': theme.typography?.styles?.['heading-h1']?.desktop?.letterSpacing || brandLetterSpacing.heading || '0',
    
    'heading-h2-font-size-desktop': theme.typography?.styles?.['heading-h2']?.desktop?.size || theme.typography?.styles?.h2?.fontSize || '36px',
    'heading-h2-font-size-mobile': theme.typography?.styles?.['heading-h2']?.mobile?.size || theme.typography?.styles?.h2?.fontSizeMobile || '28px',
    'heading-h2-font-weight': String(theme.typography?.styles?.['heading-h2']?.desktop?.weight || theme.typography?.styles?.h2?.fontWeight || '700'),
    'heading-h2-line-height': String(theme.typography?.styles?.['heading-h2']?.desktop?.lineHeight || theme.typography?.styles?.h2?.lineHeight || '1.3'),
    'heading-h2-letter-spacing': theme.typography?.styles?.['heading-h2']?.desktop?.letterSpacing || brandLetterSpacing.heading || '0',
    
    'heading-h3-font-size-desktop': theme.typography?.styles?.['heading-h3']?.desktop?.size || theme.typography?.styles?.h3?.fontSize || '28px',
    'heading-h3-font-size-mobile': theme.typography?.styles?.['heading-h3']?.mobile?.size || theme.typography?.styles?.h3?.fontSizeMobile || '24px',
    'heading-h3-font-weight': String(theme.typography?.styles?.['heading-h3']?.desktop?.weight || theme.typography?.styles?.h3?.fontWeight || '600'),
    'heading-h3-line-height': String(theme.typography?.styles?.['heading-h3']?.desktop?.lineHeight || theme.typography?.styles?.h3?.lineHeight || '1.4'),
    'heading-h3-letter-spacing': theme.typography?.styles?.['heading-h3']?.desktop?.letterSpacing || brandLetterSpacing.heading || '0',
    
    'heading-h4-font-size-desktop': theme.typography?.styles?.['heading-h4']?.desktop?.size || theme.typography?.styles?.h4?.fontSize || '24px',
    'heading-h4-font-size-mobile': theme.typography?.styles?.['heading-h4']?.mobile?.size || theme.typography?.styles?.h4?.fontSizeMobile || '20px',
    'heading-h4-font-weight': String(theme.typography?.styles?.['heading-h4']?.desktop?.weight || theme.typography?.styles?.h4?.fontWeight || '600'),
    'heading-h4-line-height': String(theme.typography?.styles?.['heading-h4']?.desktop?.lineHeight || theme.typography?.styles?.h4?.lineHeight || '1.4'),
    'heading-h4-letter-spacing': theme.typography?.styles?.['heading-h4']?.desktop?.letterSpacing || brandLetterSpacing.heading || '0',
    
    'heading-h5-font-size-desktop': theme.typography?.styles?.['heading-h5']?.desktop?.size || theme.typography?.styles?.h5?.fontSize || '20px',
    'heading-h5-font-size-mobile': theme.typography?.styles?.['heading-h5']?.mobile?.size || theme.typography?.styles?.h5?.fontSizeMobile || '18px',
    'heading-h5-font-weight': String(theme.typography?.styles?.['heading-h5']?.desktop?.weight || theme.typography?.styles?.h5?.fontWeight || '600'),
    'heading-h5-line-height': String(theme.typography?.styles?.['heading-h5']?.desktop?.lineHeight || theme.typography?.styles?.h5?.lineHeight || '1.5'),
    'heading-h5-letter-spacing': theme.typography?.styles?.['heading-h5']?.desktop?.letterSpacing || brandLetterSpacing.heading || '0',
    
    'heading-h6-font-size-desktop': theme.typography?.styles?.['heading-h6']?.desktop?.size || theme.typography?.styles?.h6?.fontSize || '16px',
    'heading-h6-font-size-mobile': theme.typography?.styles?.['heading-h6']?.mobile?.size || theme.typography?.styles?.h6?.fontSizeMobile || '16px',
    'heading-h6-font-weight': String(theme.typography?.styles?.['heading-h6']?.desktop?.weight || theme.typography?.styles?.h6?.fontWeight || '600'),
    'heading-h6-line-height': String(theme.typography?.styles?.['heading-h6']?.desktop?.lineHeight || theme.typography?.styles?.h6?.lineHeight || '1.5'),
    'heading-h6-letter-spacing': theme.typography?.styles?.['heading-h6']?.desktop?.letterSpacing || brandLetterSpacing.heading || '0',
    
    // Body Text Typography (XL-XS) - From theme.typography.styles (kebab-case keys) + brand letter spacing
    'text-xl-font-size-desktop': theme.typography?.styles?.['body-xl']?.desktop?.size || theme.typography?.styles?.bodyXL?.fontSize || '24px',
    'text-xl-font-size-mobile': theme.typography?.styles?.['body-xl']?.mobile?.size || theme.typography?.styles?.bodyXL?.fontSizeMobile || '20px',
    'text-xl-line-height': String(theme.typography?.styles?.['body-xl']?.desktop?.lineHeight || theme.typography?.styles?.bodyXL?.lineHeight || '1.5'),
    'text-xl-letter-spacing': theme.typography?.styles?.['body-xl']?.desktop?.letterSpacing || brandLetterSpacing.body || '0',
    
    'text-lg-font-size-desktop': theme.typography?.styles?.['body-lg']?.desktop?.size || theme.typography?.styles?.bodyLG?.fontSize || '20px',
    'text-lg-font-size-mobile': theme.typography?.styles?.['body-lg']?.mobile?.size || theme.typography?.styles?.bodyLG?.fontSizeMobile || '18px',
    'text-lg-line-height': String(theme.typography?.styles?.['body-lg']?.desktop?.lineHeight || theme.typography?.styles?.bodyLG?.lineHeight || '1.5'),
    'text-lg-letter-spacing': theme.typography?.styles?.['body-lg']?.desktop?.letterSpacing || brandLetterSpacing.body || '0',
    
    'text-md-font-size-desktop': theme.typography?.styles?.['body-md']?.desktop?.size || theme.typography?.styles?.body?.fontSize || fontSizeBase,
    'text-md-font-size-mobile': theme.typography?.styles?.['body-md']?.mobile?.size || theme.typography?.styles?.body?.fontSizeMobile || fontSizeBase,
    'text-md-line-height': String(theme.typography?.styles?.['body-md']?.desktop?.lineHeight || theme.typography?.styles?.body?.lineHeight || '1.5'),
    'text-md-letter-spacing': theme.typography?.styles?.['body-md']?.desktop?.letterSpacing || brandLetterSpacing.body || '0',
    
    'text-sm-font-size-desktop': theme.typography?.styles?.['body-sm']?.desktop?.size || theme.typography?.styles?.bodySM?.fontSize || '14px',
    'text-sm-font-size-mobile': theme.typography?.styles?.['body-sm']?.mobile?.size || theme.typography?.styles?.bodySM?.fontSizeMobile || '14px',
    'text-sm-line-height': String(theme.typography?.styles?.['body-sm']?.desktop?.lineHeight || theme.typography?.styles?.bodySM?.lineHeight || '1.5'),
    'text-sm-letter-spacing': theme.typography?.styles?.['body-sm']?.desktop?.letterSpacing || brandLetterSpacing.body || '0',
    
    'text-xs-font-size-desktop': theme.typography?.styles?.['body-xs']?.desktop?.size || theme.typography?.styles?.bodyXS?.fontSize || '12px',
    'text-xs-font-size-mobile': theme.typography?.styles?.['body-xs']?.mobile?.size || theme.typography?.styles?.bodyXS?.fontSizeMobile || '12px',
    'text-xs-line-height': String(theme.typography?.styles?.['body-xs']?.desktop?.lineHeight || theme.typography?.styles?.bodyXS?.lineHeight || '1.4'),
    'text-xs-letter-spacing': theme.typography?.styles?.['body-xs']?.desktop?.letterSpacing || brandLetterSpacing.body || '0',
    
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
    'button-radius-small': buttonRadiusSm,
    'button-radius-medium': buttonRadiusSm,
    'button-radius-large': buttonRadiusSm,
    
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

