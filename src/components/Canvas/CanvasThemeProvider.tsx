import React from 'react'

interface CanvasThemeProviderProps {
  children: React.ReactNode
  usePageStore: any // TODO: Type this properly when extracting store
}

export function CanvasThemeProvider({ children, usePageStore }: CanvasThemeProviderProps) {
  const { themes } = usePageStore()
  const currentTheme = themes.find((t: any) => t.id === 'modernist-theme') // Default theme for now
  
  if (!currentTheme) {
    return <>{children}</>
  }

  return (
    <div 
      className="theme-canvas"
      style={{
        '--theme-color-primary': currentTheme.colors.primary,
        '--theme-color-secondary': currentTheme.colors.secondary,
        '--theme-color-accent': currentTheme.colors.accent,
        '--theme-color-text': currentTheme.colors.text,
        '--theme-color-background': currentTheme.colors.background,
        '--theme-color-muted': currentTheme.colors.muted,
        '--theme-heading-font': currentTheme.typography.headingFont,
        '--theme-body-font': currentTheme.typography.bodyFont,
        '--theme-base-size': currentTheme.typography.baseSize,
        '--theme-scale': currentTheme.typography.scale
      } as React.CSSProperties}
    >
      {children}
    </div>
  )
}
