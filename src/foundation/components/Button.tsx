/**
 * Atypon Design Foundation - Button Component
 * 
 * Behavior-first button with locked accessibility and interaction patterns.
 * Visual appearance is controlled by Foundation tokens defined in the theme.
 * 
 * LOCKED BEHAVIORS:
 * - Keyboard navigation (Enter/Space)
 * - Focus management (ring, outline)
 * - Disabled state handling
 * - Loading state (prevents double-clicks)
 * - ARIA attributes
 * 
 * THEME-CONTROLLED:
 * - Colors (background, text, border)
 * - Typography (font, size, weight, transform)
 * - Spacing (padding, height)
 * - Shape (border-radius)
 * - Motion (transitions, animations)
 */

import React, { ButtonHTMLAttributes, AnchorHTMLAttributes, forwardRef } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export type ButtonVariant = 'solid' | 'outline' | 'ghost' | 'link'
export type ButtonColor = 'primary' | 'secondary' | 'tertiary'
export type ButtonSize = 'small' | 'medium' | 'large'

export interface BaseButtonProps {
  /**
   * Visual variant (affects styling structure)
   * - solid: Filled background
   * - outline: Border with transparent background
   * - ghost: Minimal, hover shows background
   * - link: Text-only, underline on hover
   */
  variant?: ButtonVariant
  
  /**
   * Color scheme (maps to action tokens)
   * - primary: Main CTA (action-primary)
   * - secondary: Secondary actions (action-secondary)
   * - tertiary: Tertiary actions (action-tertiary)
   */
  color?: ButtonColor
  
  /**
   * Size (affects padding, height, font-size)
   */
  size?: ButtonSize
  
  /**
   * Full width button
   */
  fullWidth?: boolean
  
  /**
   * Loading state (shows spinner, disables interaction)
   */
  loading?: boolean
  
  /**
   * Icon to display before the text
   */
  iconLeft?: React.ReactNode
  
  /**
   * Icon to display after the text
   */
  iconRight?: React.ReactNode
  
  /**
   * Children (button text/content)
   */
  children?: React.ReactNode
}

/**
 * Props for <button> element
 */
export interface ButtonAsButtonProps extends BaseButtonProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseButtonProps> {
  as?: 'button'
  href?: never
}

/**
 * Props for <a> element (link button)
 */
export interface ButtonAsLinkProps extends BaseButtonProps, Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseButtonProps> {
  as: 'link'
  href: string
}

export type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Foundation Button Component
 * 
 * @example
 * ```tsx
 * // Solid primary button
 * <Button variant="solid" color="primary" size="medium">
 *   Click Me
 * </Button>
 * 
 * // Outline secondary button with icon
 * <Button variant="outline" color="secondary" iconLeft={<Icon />}>
 *   Save Draft
 * </Button>
 * 
 * // Link button (renders as <a>)
 * <Button as="link" href="/docs" variant="link">
 *   Learn More
 * </Button>
 * 
 * // Loading state
 * <Button loading onClick={handleSubmit}>
 *   Submit
 * </Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  (props, ref) => {
    const {
      variant = 'solid',
      color = 'primary',
      size = 'medium',
      fullWidth = false,
      loading = false,
      iconLeft,
      iconRight,
      children,
      className = '',
      disabled,
      ...rest
    } = props

    // ========================================================================
    // CLASS GENERATION
    // ========================================================================

    const baseClasses = [
      'foundation-button',
      `foundation-button--${variant}`,
      `foundation-button--${color}`,
      `foundation-button--${size}`,
      fullWidth && 'foundation-button--full-width',
      loading && 'foundation-button--loading',
      disabled && 'foundation-button--disabled',
      className
    ].filter(Boolean).join(' ')

    // ========================================================================
    // RENDER CONTENT
    // ========================================================================

    const buttonContent = (
      <>
        {loading && (
          <span className="foundation-button__spinner" aria-hidden="true">
            <svg
              className="foundation-button__spinner-svg"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="8"
                cy="8"
                r="7"
                stroke="currentColor"
                strokeOpacity="0.25"
                strokeWidth="2"
              />
              <path
                d="M15 8a7 7 0 01-7 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </span>
        )}
        
        {iconLeft && !loading && (
          <span className="foundation-button__icon foundation-button__icon--left">
            {iconLeft}
          </span>
        )}
        
        {children && (
          <span className="foundation-button__text">
            {children}
          </span>
        )}
        
        {iconRight && !loading && (
          <span className="foundation-button__icon foundation-button__icon--right">
            {iconRight}
          </span>
        )}
      </>
    )

    // ========================================================================
    // RENDER ELEMENT
    // ========================================================================

    // Render as <a> if href is provided or as="link"
    if ('href' in props && props.href) {
      const { as, ...linkProps } = rest as any
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          className={baseClasses}
          aria-disabled={disabled || loading}
          {...linkProps}
          href={disabled || loading ? undefined : props.href}
          onClick={(e) => {
            if (disabled || loading) {
              e.preventDefault()
              return
            }
            linkProps.onClick?.(e)
          }}
        >
          {buttonContent}
        </a>
      )
    }

    // Render as <button>
    const { as, ...buttonProps } = rest as any
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        className={baseClasses}
        disabled={disabled || loading}
        aria-busy={loading}
        {...buttonProps}
      >
        {buttonContent}
      </button>
    )
  }
)

Button.displayName = 'FoundationButton'

