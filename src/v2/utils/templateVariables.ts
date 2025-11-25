/**
 * Template Variable Resolver
 * 
 * Resolves dynamic template variables in widget content (e.g., {journal.name}, {website.domain})
 * Enables data-driven shared sections that adapt based on context.
 */

import type { Journal, Website } from '../types/core'

/**
 * Context object containing all available template data
 */
export type TemplateContext = {
  journal?: Journal
  website?: Website
  page?: {
    id: string
    title: string
    slug: string
  }
}

/**
 * Get nested property value from object using dot notation
 * Example: getNestedValue(journal, 'issn.print') → '1234-5678'
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    return current?.[key]
  }, obj)
}

/**
 * Format a value for display
 */
function formatValue(value: any): string {
  if (value === undefined || value === null) {
    return ''
  }
  
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }
  
  if (typeof value === 'number') {
    return value.toString()
  }
  
  if (typeof value === 'object') {
    // Handle special cases like Date
    if (value instanceof Date) {
      return value.toLocaleDateString()
    }
    // For other objects, return empty (avoid [object Object])
    return ''
  }
  
  return String(value)
}

/**
 * Resolve template variables in a string
 * 
 * Supported syntax:
 * - {journal.name} → Journal name
 * - {journal.description} → Journal description
 * - {journal.issn.print} → Print ISSN
 * - {journal.issn.online} → Online ISSN
 * - {journal.impactFactor} → Impact factor
 * - {journal.isOpenAccess} → Open access status (Yes/No)
 * - {journal.branding.primaryColor} → Primary brand color (e.g., #059669)
 * - {journal.branding.secondaryColor} → Secondary brand color
 * - {website.name} → Website name
 * - {website.domain} → Website domain
 * - {page.title} → Page title
 * 
 * Can be used in:
 * - Widget text fields (heading text, description, labels, etc.)
 * - Section properties (background colors, gradient values, etc.)
 * - Menu item labels
 * 
 * @param text - Text containing template variables
 * @param context - Context object with journal, website, page data
 * @returns Resolved text with variables replaced
 */
export function resolveTemplateVariables(
  text: string | undefined,
  context: TemplateContext
): string {
  if (!text) return ''
  
  // Match {variable.path} patterns
  const variablePattern = /\{([a-zA-Z0-9_.]+)\}/g
  
  return text.replace(variablePattern, (match, variablePath) => {
    // Split into object name and property path
    // Example: "journal.issn.print" → ["journal", "issn.print"]
    const [objectName, ...propertyParts] = variablePath.split('.')
    const propertyPath = propertyParts.join('.')
    
    // Get the object from context
    const contextObject = context[objectName as keyof TemplateContext]
    
    if (!contextObject) {
      console.warn(`Template variable context "${objectName}" not found:`, variablePath)
      return match // Return original if context not found
    }
    
    // Get nested property value
    const value = propertyPath 
      ? getNestedValue(contextObject, propertyPath)
      : contextObject
    
    // Format and return
    const formatted = formatValue(value)
    
    if (formatted === '') {
      console.warn(`Template variable "${variablePath}" resolved to empty value`)
    }
    
    return formatted
  })
}

/**
 * Check if a string contains template variables
 */
export function hasTemplateVariables(text: string | undefined): boolean {
  if (!text) return false
  return /\{[a-zA-Z0-9_.]+\}/.test(text)
}

/**
 * Extract all template variables from a string
 * Example: "Hello {journal.name}, IF: {journal.impactFactor}" → ["journal.name", "journal.impactFactor"]
 */
export function extractTemplateVariables(text: string | undefined): string[] {
  if (!text) return []
  
  const variablePattern = /\{([a-zA-Z0-9_.]+)\}/g
  const matches = text.matchAll(variablePattern)
  
  return Array.from(matches, match => match[1])
}

/**
 * Validate that all required context is available for template variables
 */
export function validateTemplateContext(
  text: string | undefined,
  context: TemplateContext
): { valid: boolean; missing: string[] } {
  if (!text) return { valid: true, missing: [] }
  
  const variables = extractTemplateVariables(text)
  const missing: string[] = []
  
  for (const variable of variables) {
    const [objectName] = variable.split('.')
    if (!context[objectName as keyof TemplateContext]) {
      missing.push(objectName)
    }
  }
  
  return {
    valid: missing.length === 0,
    missing: Array.from(new Set(missing)) // Deduplicate
  }
}

