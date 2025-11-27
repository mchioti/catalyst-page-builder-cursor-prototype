/**
 * WidgetLayoutWrapper - Applies layout styling to widgets
 * 
 * Handles layout variants (card, bordered, elevated) and spacing properties.
 * Extracted from WidgetRenderer.tsx for better modularity.
 */

import type { ReactNode } from 'react'
import type { Widget } from '../../types/widgets'

interface WidgetLayoutWrapperProps {
  widget: Widget
  children: ReactNode
}

export function WidgetLayoutWrapper({ widget, children }: WidgetLayoutWrapperProps) {
  if (!widget.layout || widget.layout.variant === 'default') {
    return <>{children}</>
  }

  const getLayoutClasses = () => {
    const layout = widget.layout!
    const classes: string[] = []

    // Variant classes
    switch (layout.variant) {
      case 'card':
        classes.push('bg-white rounded-lg shadow-md border border-gray-200')
        break
      case 'bordered':
        classes.push('border-2 border-gray-300 rounded-md')
        break
      case 'elevated':
        classes.push('bg-white shadow-lg rounded-xl border border-gray-100')
        break
    }

    // Padding classes
    switch (layout.padding) {
      case 'none':
        classes.push('p-0')
        break
      case 'small':
        classes.push('p-3')
        break
      case 'medium':
        classes.push('p-4')
        break
      case 'large':
        classes.push('p-6')
        break
      default:
        if (layout.variant === 'card' || layout.variant === 'elevated') {
          classes.push('p-4') // Default padding for cards
        }
    }

    // Margin classes
    switch (layout.margin) {
      case 'none':
        classes.push('m-0')
        break
      case 'small':
        classes.push('m-2')
        break
      case 'medium':
        classes.push('m-4')
        break
      case 'large':
        classes.push('m-6')
        break
    }

    // Background classes (override card defaults if specified)
    if (layout.background && layout.background !== 'transparent') {
      classes.push(`bg-${layout.background}`)
    }

    // Shadow classes (override card defaults if specified)
    if (layout.shadow && layout.shadow !== 'none') {
      const shadowMap: Record<string, string> = {
        small: 'shadow-sm',
        medium: 'shadow-md', 
        large: 'shadow-lg'
      }
      classes.push(shadowMap[layout.shadow])
    }

    // Rounded classes (override card defaults if specified)
    if (layout.rounded && layout.rounded !== 'none') {
      const roundedMap: Record<string, string> = {
        small: 'rounded',
        medium: 'rounded-md',
        large: 'rounded-lg'
      }
      classes.push(roundedMap[layout.rounded])
    }

    // Border classes
    if (layout.border && layout.border !== 'none') {
      const borderMap: Record<string, string> = {
        light: 'border border-gray-200',
        medium: 'border-2 border-gray-300',
        heavy: 'border-4 border-gray-400'
      }
      classes.push(borderMap[layout.border])
    }

    return classes.join(' ')
  }

  return (
    <div className={getLayoutClasses()}>
      {children}
    </div>
  )
}

