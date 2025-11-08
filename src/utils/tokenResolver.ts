/**
 * Token Resolution System for 3-Layer Architecture
 * 
 * Resolves token references like:
 * - "foundation.primaryData.600.wiley" → "#00d875"
 * - Simple hex values like "#00d875" → "#00d875" (passthrough)
 * 
 * Enables dynamic brand switching at runtime.
 */

export type BrandMode = 'wiley' | 'wt' | 'dummies'

export interface TokenReference {
  path: string  // e.g., "foundation.primaryData.600"
  brand: BrandMode
}

/**
 * Parse a token reference string or return the value as-is if it's a hex color
 * 
 * @example
 * parseTokenReference("#00d875") → { isDirectValue: true, value: "#00d875" }
 * parseTokenReference("foundation.primaryData.600") → { isDirectValue: false, path: "foundation.primaryData.600", useBrandMode: true }
 * parseTokenReference("foundation.primaryData.600.wiley") → { isDirectValue: false, path: "foundation.primaryData.600", brand: "wiley" }
 */
export function parseTokenReference(value: string): 
  | { isDirectValue: true; value: string }
  | { isDirectValue: false; path: string; useBrandMode: true }
  | { isDirectValue: false; path: string; brand: BrandMode } 
{
  // If it's a hex color, return as-is
  if (value.startsWith('#')) {
    return { isDirectValue: true, value }
  }
  
  // If it's a token reference
  const parts = value.split('.')
  
  // New format (no brand suffix): "foundation.primaryData.600"
  if (parts.length >= 3 && parts[0] === 'foundation') {
    const lastPart = parts[parts.length - 1]
    
    // Check if last part is a brand name
    if (['wiley', 'wt', 'dummies'].includes(lastPart)) {
      // Old format with brand: "foundation.primaryData.600.wiley"
      const brand = lastPart as BrandMode
      const path = parts.slice(0, -1).join('.')
      return { isDirectValue: false, path, brand }
    } else {
      // New format without brand: "foundation.primaryData.600"
      return { isDirectValue: false, path: value, useBrandMode: true }
    }
  }
  
  // Fallback: treat as direct value
  return { isDirectValue: true, value }
}

/**
 * Resolve a token reference to its actual hex value
 * 
 * @example
 * resolveToken("#00d875", theme, "wiley") → "#00d875"
 * resolveToken("foundation.primaryData.600", theme, "dummies") → "#74520f"
 * resolveToken("foundation.primaryData.600.wiley", theme, "dummies") → "#00d875" (ignores brandMode param)
 */
export function resolveToken(
  valueOrRef: string,
  theme: any,
  brandMode: BrandMode = 'wiley'
): string {
  const parsed = parseTokenReference(valueOrRef)
  
  if (parsed.isDirectValue) {
    return parsed.value
  }
  
  // Determine which brand to use
  const targetBrand = 'useBrandMode' in parsed ? brandMode : parsed.brand
  
  // Navigate through the theme object to resolve the token
  const pathParts = parsed.path.split('.')
  let current = theme.colors
  
  for (const part of pathParts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part]
    } else {
      console.warn(`❌ Token path not found at "${part}" in path: ${parsed.path}`)
      console.warn('  Available keys:', current ? Object.keys(current) : 'null')
      return '#000000' // Fallback to black if token not found
    }
  }
  
  // If we have a multi-brand object, use the target brand
  if (current && typeof current === 'object' && targetBrand in current) {
    return current[targetBrand]
  }
  
  // If it's already a string value, return it
  if (typeof current === 'string') {
    return current
  }
  
  console.warn(`❌ Could not resolve token: ${valueOrRef}, final value:`, current)
  return '#000000'
}

/**
 * Resolve an entire semantic color object, replacing all token references with actual values
 * 
 * @example
 * Input:
 * {
 *   light: "foundation.primaryData.600.wiley",
 *   dark: "foundation.primaryHeritage.600.wiley"
 * }
 * 
 * Output (for brand = "wiley"):
 * {
 *   light: "#00d875",
 *   dark: "#008f8a"
 * }
 */
export function resolveSemanticColor(
  semanticColor: any,
  theme: any,
  brandMode: BrandMode
): any {
  if (typeof semanticColor === 'string') {
    return resolveToken(semanticColor, theme, brandMode)
  }
  
  if (typeof semanticColor === 'object' && semanticColor !== null) {
    const resolved: any = {}
    for (const key in semanticColor) {
      resolved[key] = resolveSemanticColor(semanticColor[key], theme, brandMode)
    }
    return resolved
  }
  
  return semanticColor
}

/**
 * Resolve all semantic colors in a theme for a given brand mode
 * 
 * This is the main entry point for theme resolution
 */
export function resolveThemeColors(theme: any, brandMode: BrandMode = 'wiley'): any {
  if (!theme.colors.semanticColors) {
    return theme
  }
  
  const resolvedSemanticColors: any = {}
  
  for (const key in theme.colors.semanticColors) {
    resolvedSemanticColors[key] = resolveSemanticColor(
      theme.colors.semanticColors[key],
      theme,
      brandMode
    )
  }
  
  return {
    ...theme,
    colors: {
      ...theme.colors,
      semanticColors: resolvedSemanticColors
    }
  }
}

