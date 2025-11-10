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

