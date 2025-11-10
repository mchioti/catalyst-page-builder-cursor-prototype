/**
 * Atypon Design Foundation - IBM Carbon Adapter
 * 
 * Maps IBM Carbon Design System to Foundation token contracts.
 */

import type { FoundationTokens } from '../tokens/contracts'

export function mapCarbonToFoundation(theme: any): FoundationTokens {
  
  // IBM Carbon colors
  const ibmBlue = theme.colors.primary || '#0f62fe'
  const carbonGray = theme.colors.secondary || '#525252'
  const ibmBlueDark = '#0353e9'
  const ibmBlueLight = '#4589ff'
  
  // Text colors
  const textPrimary = theme.colors.textColors?.primary || '#161616'
  const textSecondary = theme.colors.textColors?.secondary || '#525252'
  const textDisabled = theme.colors.textColors?.disabled || '#c6c6c6'
  
  // Layer colors
  const layer00 = theme.colors.layers?.['00'] || '#ffffff'
  const layer01 = theme.colors.layers?.['01'] || '#f4f4f4'
  const borderSubtle = theme.colors.borders?.subtle || '#e0e0e0'
  
  return {
    // Action Colors - IBM Blue for primary
    'action-primary': ibmBlue,
    'action-primary-hover': ibmBlueDark,
    'action-primary-active': '#002d9c',
    'action-primary-disabled': textDisabled,
    'action-primary-text': '#ffffff',
    
    'action-secondary': carbonGray,
    'action-secondary-hover': '#393939',
    'action-secondary-active': '#262626',
    'action-secondary-disabled': textDisabled,
    'action-secondary-text': '#ffffff',
    
    'action-tertiary': layer00,
    'action-tertiary-hover': layer01,
    'action-tertiary-active': '#e0e0e0',
    'action-tertiary-disabled': textDisabled,
    'action-tertiary-text': textPrimary,
    
    // Surface Colors
    'surface-background': layer00,
    'surface-foreground': layer01,
    'surface-border': borderSubtle,
    'surface-border-hover': '#a8a8a8',
    
    // Content Colors
    'content-primary': textPrimary,
    'content-secondary': textSecondary,
    'content-tertiary': '#8d8d8d',
    'content-inverse': '#ffffff',
    'content-disabled': textDisabled,
    
    // Feedback Colors
    'feedback-success': '#24a148',
    'feedback-error': '#da1e28',
    'feedback-warning': '#f1c21b',
    'feedback-info': ibmBlue,
    
    // Typography
    'font-family-primary': theme.typography?.bodyFont || '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, sans-serif',
    'font-family-secondary': '"IBM Plex Mono", "Courier New", monospace',
    'font-family-heading': theme.typography?.headingFont || '"IBM Plex Sans", sans-serif',
    
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
    
    // Button (Carbon uses sharp corners, no shadows)
    'button-radius-small': '0',
    'button-radius-medium': '0',
    'button-radius-large': '0',
    
    'button-padding-small': '7px 15px',
    'button-padding-medium': '11px 16px',
    'button-padding-large': '14px 32px',
    
    'button-height-small': '32px',
    'button-height-medium': '40px',
    'button-height-large': '48px',
    
    'button-font-family': '"IBM Plex Sans", sans-serif',
    'button-font-size-small': '12px',
    'button-font-size-medium': '14px',
    'button-font-size-large': '16px',
    'button-font-weight': '400',
    'button-letter-spacing': '0.16px',
    'button-text-transform': 'none',
    
    'button-shadow-rest': 'none',
    'button-shadow-hover': 'none',
    'button-shadow-active': 'none',
    'button-shadow-focus': 'inset 0 0 0 1px #ffffff, inset 0 0 0 2px #0f62fe',
    
    'button-border-width': '1px',
    
    // Motion
    'motion-duration-instant': '0ms',
    'motion-duration-fast': '70ms',
    'motion-duration-normal': '110ms',
    'motion-duration-slow': '240ms',
    
    'motion-easing-standard': 'cubic-bezier(0.2, 0, 0.38, 0.9)',
    'motion-easing-decelerate': 'cubic-bezier(0, 0, 0.38, 0.9)',
    'motion-easing-accelerate': 'cubic-bezier(0.2, 0, 1, 0.9)',
  }
}

