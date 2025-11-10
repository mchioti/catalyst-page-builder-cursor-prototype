/**
 * Atypon Design Foundation - Token Contracts
 * 
 * These interfaces define the tokens that every Design System MUST provide.
 * Themes implement these contracts with their specific values.
 */

// ============================================================================
// COLOR TOKENS
// ============================================================================

/**
 * Action Colors - Interactive elements (buttons, links)
 */
export interface ActionColorTokens {
  // Primary Action
  'action-primary': string              // Default state
  'action-primary-hover': string        // Hover state
  'action-primary-active': string       // Active/pressed state
  'action-primary-disabled': string     // Disabled state
  'action-primary-text': string         // Text color on primary background
  
  // Secondary Action
  'action-secondary': string
  'action-secondary-hover': string
  'action-secondary-active': string
  'action-secondary-disabled': string
  'action-secondary-text': string
  
  // Tertiary Action
  'action-tertiary': string
  'action-tertiary-hover': string
  'action-tertiary-active': string
  'action-tertiary-disabled': string
  'action-tertiary-text': string
}

/**
 * Surface Colors - Backgrounds, borders
 */
export interface SurfaceColorTokens {
  'surface-background': string          // Page background
  'surface-foreground': string          // Card/panel background
  'surface-border': string              // Border color
  'surface-border-hover': string        // Border color on hover
}

/**
 * Content Colors - Text, icons
 */
export interface ContentColorTokens {
  'content-primary': string             // Primary text
  'content-secondary': string           // Secondary text
  'content-tertiary': string            // Muted/hint text
  'content-inverse': string             // Text on dark backgrounds
  'content-disabled': string            // Disabled text
}

/**
 * Feedback Colors - Status indicators
 */
export interface FeedbackColorTokens {
  'feedback-success': string
  'feedback-error': string
  'feedback-warning': string
  'feedback-info': string
}

// ============================================================================
// TYPOGRAPHY TOKENS
// ============================================================================

export interface TypographyTokens {
  // Font Families
  'font-family-primary': string         // Body/UI text (e.g., 'Inter, sans-serif')
  'font-family-secondary': string       // Accent font (e.g., 'IBM Plex Mono')
  'font-family-heading': string         // Headings (e.g., 'Volkhov, serif')
  
  // Font Sizes
  'font-size-xs': string                // 12px
  'font-size-sm': string                // 14px
  'font-size-md': string                // 16px (base)
  'font-size-lg': string                // 18px
  'font-size-xl': string                // 20px
  
  // Font Weights
  'font-weight-regular': string         // 400
  'font-weight-medium': string          // 500
  'font-weight-semibold': string        // 600
  'font-weight-bold': string            // 700
  
  // Line Heights
  'line-height-tight': string           // 1.25
  'line-height-normal': string          // 1.5
  'line-height-relaxed': string         // 1.75
}

// ============================================================================
// SPACING TOKENS
// ============================================================================

export interface SpacingTokens {
  // Base Scale (multiples of 4px or 8px)
  'spacing-0': string                   // 0
  'spacing-1': string                   // 4px
  'spacing-2': string                   // 8px
  'spacing-3': string                   // 12px
  'spacing-4': string                   // 16px
  'spacing-5': string                   // 20px
  'spacing-6': string                   // 24px
  'spacing-8': string                   // 32px
  'spacing-10': string                  // 40px
  'spacing-12': string                  // 48px
  'spacing-16': string                  // 64px
  'spacing-20': string                  // 80px
  'spacing-24': string                  // 96px
}

// ============================================================================
// COMPONENT TOKENS - BUTTON
// ============================================================================

export interface ButtonTokens {
  // Border Radius
  'button-radius-small': string         // e.g., '2px'
  'button-radius-medium': string        // e.g., '4px'
  'button-radius-large': string         // e.g., '4px'
  
  // Padding (horizontal, vertical)
  'button-padding-small': string        // e.g., '8px 12px'
  'button-padding-medium': string       // e.g., '10px 20px'
  'button-padding-large': string        // e.g., '12px 24px'
  
  // Height
  'button-height-small': string         // e.g., '32px'
  'button-height-medium': string        // e.g., '40px'
  'button-height-large': string         // e.g., '48px'
  
  // Typography
  'button-font-family': string          // Font for button text
  'button-font-size-small': string      // e.g., '12px'
  'button-font-size-medium': string     // e.g., '14px'
  'button-font-size-large': string      // e.g., '16px'
  'button-font-weight': string          // e.g., '500'
  'button-letter-spacing': string       // e.g., '0' or '1.6px'
  'button-text-transform': string       // e.g., 'none' or 'uppercase'
  
  // Shadows
  'button-shadow-rest': string          // Shadow at rest
  'button-shadow-hover': string         // Shadow on hover
  'button-shadow-active': string        // Shadow when pressed
  'button-shadow-focus': string         // Shadow/ring when focused
  
  // Borders (for outline variant)
  'button-border-width': string         // e.g., '1px' or '2px'
}

// ============================================================================
// MOTION TOKENS
// ============================================================================

export interface MotionTokens {
  // Durations
  'motion-duration-instant': string     // 0ms
  'motion-duration-fast': string        // 100ms
  'motion-duration-normal': string      // 150ms
  'motion-duration-slow': string        // 300ms
  
  // Easings
  'motion-easing-standard': string      // cubic-bezier(0.4, 0, 0.2, 1)
  'motion-easing-decelerate': string    // cubic-bezier(0, 0, 0.2, 1)
  'motion-easing-accelerate': string    // cubic-bezier(0.4, 0, 1, 1)
}

// ============================================================================
// COMPLETE TOKEN CONTRACT
// ============================================================================

/**
 * Complete token contract that all Design Systems must implement
 */
export interface FoundationTokens extends
  ActionColorTokens,
  SurfaceColorTokens,
  ContentColorTokens,
  FeedbackColorTokens,
  TypographyTokens,
  SpacingTokens,
  ButtonTokens,
  MotionTokens {}

/**
 * Type-safe token reference (for resolving {foundation.color.primary} syntax)
 */
export type TokenReference = `{${string}}`

/**
 * Token value can be a direct value or a reference to another token
 */
export type TokenValue = string | TokenReference

/**
 * Partial tokens for theme overrides (website-level customization)
 */
export type PartialFoundationTokens = Partial<FoundationTokens>

