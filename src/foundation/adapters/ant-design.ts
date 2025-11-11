/**
 * Atypon Design Foundation - Ant Design Adapter
 * 
 * Maps Ant Design System to Foundation token contracts.
 */

import type { FoundationTokens } from '../tokens/contracts'

export function mapAntDesignToFoundation(theme: any): FoundationTokens {
  
  // Ant Design Daybreak Blue
  const daybreaBlue = theme.colors.primary || '#1890ff'
  const polarGreen = theme.colors.success || '#52c41a'
  const dustRed = theme.colors.error || '#ff4d4f'
  const neutralGrey = theme.colors.border || '#d9d9d9'
  
  // Text colors
  const textPrimary = theme.colors.text || '#000000d9' // 85% opacity black
  const textSecondary = '#00000073' // 45% opacity
  const textDisabled = '#00000040' // 25% opacity
  
  return {
    // Action Colors
    'action-primary': daybreaBlue,
    'action-primary-hover': '#40a9ff',
    'action-primary-active': '#096dd9',
    'action-primary-disabled': '#f5f5f5',
    'action-primary-text': '#ffffff',
    
    'action-secondary': dustRed, // Danger button
    'action-secondary-hover': '#ff7875',
    'action-secondary-active': '#d9363e',
    'action-secondary-disabled': '#f5f5f5',
    'action-secondary-text': '#ffffff',
    
    'action-tertiary': '#ffffff', // Default button
    'action-tertiary-hover': '#ffffff',
    'action-tertiary-active': '#ffffff',
    'action-tertiary-disabled': '#f5f5f5',
    'action-tertiary-text': textPrimary,
    
    // Surface Colors
    'surface-background': '#ffffff',
    'surface-foreground': '#fafafa',
    'surface-border': neutralGrey,
    'surface-border-hover': daybreaBlue,
    
    // Content Colors
    'content-primary': textPrimary,
    'content-secondary': textSecondary,
    'content-tertiary': textDisabled,
    'content-inverse': '#ffffff',
    'content-disabled': textDisabled,
    
    // Feedback Colors
    'feedback-success': polarGreen,
    'feedback-error': dustRed,
    'feedback-warning': '#faad14', // Calendula Gold
    'feedback-info': daybreaBlue,
    
    // Typography
    'font-family-primary': theme.typography?.bodyFont || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    'font-family-secondary': '"Courier New", Courier, monospace',
    'font-family-heading': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    
    'font-size-xs': '12px',
    'font-size-sm': '14px',
    'font-size-md': '14px', // Ant uses 14px as base
    'font-size-lg': '16px',
    'font-size-xl': '20px',
    
    'font-weight-regular': '400',
    'font-weight-medium': '500',
    'font-weight-semibold': '600',
    'font-weight-bold': '700',
    
    'line-height-tight': '1.35',
    'line-height-normal': '1.5715',
    'line-height-relaxed': '1.75',
    
    // Heading Typography (H1-H6) - Ant Design Compact Sizing with Tighter Line Heights
    'heading-h1-font-size-desktop': '38px',
    'heading-h1-font-size-mobile': '32px',
    'heading-h1-font-weight': '600',
    'heading-h1-line-height': '1.23',
    'heading-h1-letter-spacing': '0',
    
    'heading-h2-font-size-desktop': '30px',
    'heading-h2-font-size-mobile': '26px',
    'heading-h2-font-weight': '600',
    'heading-h2-line-height': '1.35',
    'heading-h2-letter-spacing': '0',
    
    'heading-h3-font-size-desktop': '24px',
    'heading-h3-font-size-mobile': '22px',
    'heading-h3-font-weight': '600',
    'heading-h3-line-height': '1.35',
    'heading-h3-letter-spacing': '0',
    
    'heading-h4-font-size-desktop': '20px',
    'heading-h4-font-size-mobile': '18px',
    'heading-h4-font-weight': '600',
    'heading-h4-line-height': '1.4',
    'heading-h4-letter-spacing': '0',
    
    'heading-h5-font-size-desktop': '16px',
    'heading-h5-font-size-mobile': '16px',
    'heading-h5-font-weight': '600',
    'heading-h5-line-height': '1.5',
    'heading-h5-letter-spacing': '0',
    
    'heading-h6-font-size-desktop': '14px',
    'heading-h6-font-size-mobile': '14px',
    'heading-h6-font-weight': '600',
    'heading-h6-line-height': '1.5',
    'heading-h6-letter-spacing': '0',
    
    // Body Text Typography (XL-XS) - Ant Design with 14px Base
    'text-xl-font-size-desktop': '20px',
    'text-xl-font-size-mobile': '18px',
    'text-xl-line-height': '1.5715',
    'text-xl-letter-spacing': '0',
    
    'text-lg-font-size-desktop': '16px',
    'text-lg-font-size-mobile': '16px',
    'text-lg-line-height': '1.5715',
    'text-lg-letter-spacing': '0',
    
    'text-md-font-size-desktop': '14px',
    'text-md-font-size-mobile': '14px',
    'text-md-line-height': '1.5715',
    'text-md-letter-spacing': '0',
    
    'text-sm-font-size-desktop': '12px',
    'text-sm-font-size-mobile': '12px',
    'text-sm-line-height': '1.5715',
    'text-sm-letter-spacing': '0',
    
    'text-xs-font-size-desktop': '12px',
    'text-xs-font-size-mobile': '12px',
    'text-xs-line-height': '1.5',
    'text-xs-letter-spacing': '0',
    
    // Spacing (8px grid)
    'spacing-0': '0',
    'spacing-1': '4px',
    'spacing-2': '8px',
    'spacing-3': '12px',
    'spacing-4': '16px',
    'spacing-5': '20px',
    'spacing-6': '24px',
    'spacing-8': '32px',
    'spacing-10': '40px',
    'spacing-12': '48px',
    'spacing-16': '64px',
    'spacing-20': '80px',
    'spacing-24': '96px',
    
    // Button (Ant uses pill shape - 9999px radius)
    'button-radius-small': '9999px',
    'button-radius-medium': '9999px',
    'button-radius-large': '9999px',
    
    'button-padding-small': '0 7px',
    'button-padding-medium': '4px 15px',
    'button-padding-large': '6.4px 15px',
    
    'button-height-small': '24px',
    'button-height-medium': '32px',
    'button-height-large': '40px',
    
    'button-font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    'button-font-size-small': '14px',
    'button-font-size-medium': '14px',
    'button-font-size-large': '16px',
    'button-font-weight': '400',
    'button-letter-spacing': '0',
    'button-text-transform': 'none',
    
    // Ant Design shadows
    'button-shadow-rest': '0 2px 0 rgba(0, 0, 0, 0.016)',
    'button-shadow-hover': '0 4px 8px rgba(0, 0, 0, 0.15)',
    'button-shadow-active': '0 2px 0 rgba(0, 0, 0, 0.016)',
    'button-shadow-focus': '0 0 0 2px rgba(24, 144, 255, 0.2)',
    
    'button-border-width': '1px',
    
    // Motion
    'motion-duration-instant': '0ms',
    'motion-duration-fast': '100ms',
    'motion-duration-normal': '200ms',
    'motion-duration-slow': '300ms',
    
    'motion-easing-standard': 'cubic-bezier(0.645, 0.045, 0.355, 1)',
    'motion-easing-decelerate': 'cubic-bezier(0.23, 1, 0.32, 1)',
    'motion-easing-accelerate': 'cubic-bezier(0.755, 0.05, 0.855, 0.06)',
  }
}

