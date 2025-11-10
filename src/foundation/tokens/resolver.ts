/**
 * Atypon Design Foundation - Token Resolver
 * 
 * Resolves token references like {foundation.color.primary} to actual values
 * and generates CSS variables for runtime use.
 */

import type { FoundationTokens, TokenReference, TokenValue } from './contracts'

/**
 * Check if a value is a token reference (e.g., "{foundation.teal.600}")
 */
export function isTokenReference(value: string): value is TokenReference {
  return typeof value === 'string' && value.startsWith('{') && value.endsWith('}')
}

/**
 * Extract the token path from a reference
 * Example: "{foundation.teal.600}" -> "foundation.teal.600"
 */
export function parseTokenReference(ref: TokenReference): string {
  return ref.slice(1, -1) // Remove { and }
}

/**
 * Resolve a single token value, handling references recursively
 * 
 * @param value - The token value (direct or reference)
 * @param tokens - Complete token object (including foundation/semantic layers)
 * @param visited - Set of visited paths to detect circular references
 * @returns Resolved value or original if can't resolve
 */
export function resolveTokenValue(
  value: TokenValue,
  tokens: any,
  visited: Set<string> = new Set()
): string {
  // If it's not a reference, return as-is
  if (!isTokenReference(value)) {
    return value
  }

  const path = parseTokenReference(value)
  
  // Detect circular references
  if (visited.has(path)) {
    console.warn(`[Foundation] Circular token reference detected: ${path}`)
    return value // Return unresolved to prevent infinite loop
  }
  
  visited.add(path)
  
  // Navigate the token object using the path
  const resolvedValue = path.split('.').reduce((obj, key) => {
    return obj?.[key]
  }, tokens)
  
  if (resolvedValue === undefined) {
    console.warn(`[Foundation] Token not found: ${path}`)
    return value // Return unresolved
  }
  
  // If the resolved value is itself a reference, resolve recursively
  if (isTokenReference(resolvedValue)) {
    return resolveTokenValue(resolvedValue, tokens, visited)
  }
  
  return resolvedValue
}

/**
 * Resolve all tokens in a token object
 * 
 * @param tokens - Token object with potential references
 * @param context - Full token context for resolving references
 * @returns Fully resolved token object
 */
export function resolveAllTokens(
  tokens: Partial<FoundationTokens>,
  context: any
): FoundationTokens {
  const resolved: any = {}
  
  for (const [key, value] of Object.entries(tokens)) {
    if (typeof value === 'string') {
      resolved[key] = resolveTokenValue(value, context)
    } else {
      resolved[key] = value
    }
  }
  
  return resolved as FoundationTokens
}

/**
 * Generate CSS custom properties from resolved tokens
 * 
 * @param tokens - Resolved foundation tokens
 * @param prefix - CSS variable prefix (default: '--foundation')
 * @returns CSS string with custom properties
 */
export function generateCSSVariables(
  tokens: FoundationTokens,
  prefix: string = '--foundation'
): string {
  const cssVariables: string[] = []
  
  for (const [key, value] of Object.entries(tokens)) {
    const cssVarName = `${prefix}-${key.replace(/\./g, '-')}`
    cssVariables.push(`${cssVarName}: ${value};`)
  }
  
  return cssVariables.join('\n  ')
}

/**
 * Generate a CSS class that applies foundation tokens as CSS variables
 * 
 * @param tokens - Resolved foundation tokens
 * @param className - CSS class name (default: '.foundation-theme')
 * @returns Complete CSS string
 */
export function generateFoundationCSS(
  tokens: FoundationTokens,
  className: string = '.foundation-theme'
): string {
  const cssVars = generateCSSVariables(tokens)
  
  return `
/* Atypon Design Foundation - CSS Variables */
${className} {
  ${cssVars}
}
`
}

/**
 * Create a CSS variable reference for use in CSS
 * 
 * @param tokenKey - Token key (e.g., 'action-primary')
 * @param fallback - Optional fallback value
 * @returns CSS var() string
 */
export function cssVar(tokenKey: string, fallback?: string): string {
  const varName = `--foundation-${tokenKey.replace(/\./g, '-')}`
  return fallback ? `var(${varName}, ${fallback})` : `var(${varName})`
}

/**
 * Type guard to check if an object satisfies the FoundationTokens contract
 */
export function isValidTokenSet(tokens: any): tokens is FoundationTokens {
  // Check for required token categories
  const requiredTokens = [
    'action-primary',
    'action-secondary',
    'content-primary',
    'font-family-primary',
    'spacing-2',
    'button-radius-medium',
    'motion-duration-normal'
  ]
  
  return requiredTokens.every(token => tokens.hasOwnProperty(token))
}

/**
 * Get a human-readable validation report for token implementation
 */
export function validateTokens(tokens: any): {
  valid: boolean
  missing: string[]
  warnings: string[]
} {
  const requiredTokens: (keyof FoundationTokens)[] = [
    // Action colors
    'action-primary',
    'action-primary-hover',
    'action-primary-active',
    'action-primary-disabled',
    'action-primary-text',
    'action-secondary',
    'action-secondary-hover',
    'action-secondary-text',
    
    // Surface colors
    'surface-background',
    'surface-foreground',
    'surface-border',
    
    // Content colors
    'content-primary',
    'content-secondary',
    
    // Typography
    'font-family-primary',
    'font-size-md',
    'font-weight-regular',
    'line-height-normal',
    
    // Spacing
    'spacing-0',
    'spacing-2',
    'spacing-4',
    
    // Button
    'button-radius-medium',
    'button-padding-medium',
    'button-font-size-medium',
    
    // Motion
    'motion-duration-normal',
    'motion-easing-standard'
  ]
  
  const missing = requiredTokens.filter(token => !tokens.hasOwnProperty(token))
  const warnings: string[] = []
  
  // Check for common issues
  if (tokens['button-text-transform'] && !['none', 'uppercase', 'lowercase', 'capitalize'].includes(tokens['button-text-transform'])) {
    warnings.push(`Invalid button-text-transform value: ${tokens['button-text-transform']}`)
  }
  
  return {
    valid: missing.length === 0,
    missing,
    warnings
  }
}

