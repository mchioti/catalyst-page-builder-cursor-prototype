/**
 * SkinWrap - Visual skin wrapper for widgets
 * 
 * Applies consistent visual styles based on the widget's skin property.
 * Extracted from AppV1.tsx for reuse across components.
 */

import { useMemo } from 'react'
import type { ReactNode } from 'react'
import type { Skin } from '../../types/widgets'

interface SkinWrapProps {
  skin: Skin
  children: ReactNode
}

export function SkinWrap({ skin, children }: SkinWrapProps) {
  const className = useMemo(() => {
    switch (skin) {
      case 'modern':
        return 'rounded-xl border border-gray-200 bg-white shadow-sm'
      case 'classic':
        return 'rounded-md border border-gray-300 bg-white shadow'
      case 'minimal':
        return 'bg-transparent'
      case 'accent':
        return 'rounded-lg border border-blue-200 bg-blue-50 shadow-sm'
      default:
        return 'bg-transparent'
    }
  }, [skin])
  
  return <div className={className}>{children}</div>
}

