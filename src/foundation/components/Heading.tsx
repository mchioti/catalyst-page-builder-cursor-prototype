/**
 * Foundation Heading Component
 * 
 * Behavior-first heading component that separates semantic HTML level from visual appearance.
 * All visual styling is token-driven through CSS variables.
 * 
 * Key Features:
 * - Semantic HTML (h1-h6) via `level` prop
 * - Visual size (xl, lg, md, sm, xs, xxs) decoupled from semantic level
 * - Responsive typography (different sizes for desktop/mobile)
 * - Theme-aware styling through Foundation tokens
 * - Full accessibility support
 * 
 * Example:
 * ```tsx
 * // Semantic H1, looks like H1
 * <Heading level={1}>Page Title</Heading>
 * 
 * // Semantic H2, looks like H1 (larger)
 * <Heading level={2} size="xl">Large Section</Heading>
 * 
 * // Semantic H3, custom color
 * <Heading level={3} color="primary">Branded Section</Heading>
 * ```
 */

import React from 'react'

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6
export type HeadingSize = 'xl' | 'lg' | 'md' | 'sm' | 'xs' | 'xxs'
export type HeadingColor = 'default' | 'primary' | 'secondary' | 'muted' | 'inverse'
export type HeadingWeight = 'regular' | 'medium' | 'semibold' | 'bold'
export type HeadingAlign = 'left' | 'center' | 'right'

export interface HeadingProps {
  /** Semantic heading level (determines HTML tag) */
  level: HeadingLevel
  
  /** Visual size (defaults to matching level: h1=xl, h2=lg, h3=md, h4=sm, h5=xs, h6=xxs) */
  size?: HeadingSize
  
  /** Text color variant */
  color?: HeadingColor
  
  /** Font weight (overrides theme default for this level) */
  weight?: HeadingWeight
  
  /** Text alignment */
  align?: HeadingAlign
  
  /** Override HTML tag (for rare cases where semantic and visual don't align) */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div' | 'span' | 'p'
  
  /** Additional CSS classes */
  className?: string
  
  /** Inline styles (use sparingly, prefer tokens) */
  style?: React.CSSProperties
  
  /** Heading content */
  children: React.ReactNode
  
  /** HTML id attribute */
  id?: string
  
  /** ARIA label for accessibility */
  'aria-label'?: string
  
  /** ARIA described by */
  'aria-describedby'?: string
}

/**
 * Maps heading level to default visual size
 */
const DEFAULT_SIZE_MAP: Record<HeadingLevel, HeadingSize> = {
  1: 'xl',
  2: 'lg',
  3: 'md',
  4: 'sm',
  5: 'xs',
  6: 'xxs',
}

/**
 * Foundation Heading Component
 */
export const Heading: React.FC<HeadingProps> = ({
  level,
  size,
  color = 'default',
  weight,
  align = 'left',
  as,
  className = '',
  style,
  children,
  id,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
}) => {
  // Determine actual HTML tag
  const Tag = as || (`h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6')
  
  // Determine visual size (defaults to matching semantic level)
  const visualSize = size || DEFAULT_SIZE_MAP[level]
  
  // Build CSS classes
  const classes = [
    'foundation-heading',
    `foundation-heading--level-${level}`,
    `foundation-heading--size-${visualSize}`,
    `foundation-heading--color-${color}`,
    `foundation-heading--align-${align}`,
    weight && `foundation-heading--weight-${weight}`,
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
    >
      {children}
    </Tag>
  )
}

// Display name for debugging
Heading.displayName = 'Foundation.Heading'

export default Heading
