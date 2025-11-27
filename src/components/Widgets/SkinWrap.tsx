/**
 * SkinWrap - Visual skin wrapper for widgets
 * 
 * Applies consistent visual styles based on the widget's skin property.
 * Consolidated from AppV1.tsx and WidgetRenderer.tsx.
 */

import { useMemo } from 'react'
import type { ReactNode } from 'react'
import type { Skin } from '../../types/widgets'

interface SkinWrapProps {
  skin: Skin | string
  children: ReactNode
}

/**
 * Full skin classes for live rendering context
 * Includes specialized skins for different contexts (hero, journal, footer, etc.)
 */
const SKIN_CLASSES: Record<string, string> = {
  // Basic skins
  minimal: 'bg-transparent',
  modern: 'rounded-xl border border-gray-200 bg-white shadow-sm',
  classic: 'rounded-md border border-gray-300 bg-white shadow',
  accent: 'rounded-lg border border-blue-200 bg-blue-50 shadow-sm',
  
  // Contextual skins (for live rendering)
  hero: 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-12 px-6',
  journal: 'py-12 px-6', // Transparent background, inherits from section
  dark: 'bg-black text-white py-2 px-6',
  muted: 'text-gray-600 text-sm',
  center: 'text-center',
  footer: 'bg-gray-900 text-white py-8 px-6',
  compact: 'space-y-4',
  raw: '', // No styling for raw HTML
  transparent: '' // Explicit transparent option
}

export function SkinWrap({ skin, children }: SkinWrapProps) {
  const className = useMemo(() => {
    return SKIN_CLASSES[skin] || SKIN_CLASSES.minimal
  }, [skin])
  
  return <div className={className}>{children}</div>
}

// Export skin classes for use in other components if needed
export { SKIN_CLASSES }
