/**
 * Foundation Text Component
 * 
 * Behavior-first text/paragraph component with responsive typography.
 * All visual styling is token-driven through CSS variables.
 * 
 * Key Features:
 * - Multiple text sizes (xl, lg, md, sm, xs)
 * - Responsive typography (different sizes for desktop/mobile)
 * - Theme-aware styling through Foundation tokens
 * - Support for different HTML tags (p, span, div)
 * - Full accessibility support
 * 
 * Example:
 * ```tsx
 * // Standard paragraph
 * <Text>This is body text</Text>
 * 
 * // Large emphasis text
 * <Text size="lg">Important information</Text>
 * 
 * // Inline text
 * <Text as="span" size="sm">Small inline text</Text>
 * 
 * // Caption text
 * <Text size="xs" color="muted">Figure 1. Example caption</Text>
 * ```
 */

import React from 'react'

export type TextSize = 'xl' | 'lg' | 'md' | 'sm' | 'xs'
export type TextColor = 'default' | 'primary' | 'secondary' | 'muted' | 'inverse'
export type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold'
export type TextAlign = 'left' | 'center' | 'right' | 'justify'

export interface TextProps {
  /** Visual size (defaults to 'md') */
  size?: TextSize
  
  /** Text color variant */
  color?: TextColor
  
  /** Font weight */
  weight?: TextWeight
  
  /** Text alignment */
  align?: TextAlign
  
  /** HTML tag to render (defaults to 'p') */
  as?: 'p' | 'span' | 'div' | 'label' | 'li'
  
  /** Additional CSS classes */
  className?: string
  
  /** Inline styles (use sparingly, prefer tokens) */
  style?: React.CSSProperties
  
  /** Text content */
  children: React.ReactNode
  
  /** HTML id attribute */
  id?: string
  
  /** ARIA label for accessibility */
  'aria-label'?: string
  
  /** ARIA described by */
  'aria-describedby'?: string
  
  /** Role attribute (for semantic HTML) */
  role?: string
}

/**
 * Foundation Text Component
 */
export const Text: React.FC<TextProps> = ({
  size = 'md',
  color = 'default',
  weight,
  align = 'left',
  as = 'p',
  className = '',
  style,
  children,
  id,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  role,
}) => {
  // Determine HTML tag
  const Tag = as
  
  // Build CSS classes
  const classes = [
    'foundation-text',
    `foundation-text--size-${size}`,
    `foundation-text--color-${color}`,
    `foundation-text--align-${align}`,
    weight && `foundation-text--weight-${weight}`,
    className,
  ]
    .filter(Boolean)
    .join(' ')
  
  return (
    <Tag
      className={classes}
      style={style}
      id={id}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      role={role}
    >
      {children}
    </Tag>
  )
}

// Display name for debugging
Text.displayName = 'Foundation.Text'

export default Text
