// Template and theme system types

import type { WidgetSection, PublicationCardVariant } from './widgets'

export type TemplateCategory = 'website' | 'publication' | 'supporting' | 'theme'

export type TemplateStatus = 'active' | 'draft' | 'archived' | 'deprecated'

export type Modification = {
  path: string // e.g., "header.logo.src", "footer.styles.backgroundColor"
  originalValue: any
  modifiedValue: any
  modifiedAt: 'website' | 'page'
  modifiedBy: string // user ID or system
  timestamp: Date
  reason?: string
}

export type BaseTemplate = {
  id: string
  name: string
  description: string
  category: TemplateCategory
  status: TemplateStatus
  version: string
  author: string
  createdAt: Date
  updatedAt: Date
  tags: string[]
  thumbnail?: string
  
  // Template structure
  sections: WidgetSection[]
  layout: {
    header: boolean
    footer: boolean
    sidebar: 'none' | 'left' | 'right' | 'both'
    maxWidth?: string
    spacing?: string
  }
  
  // Modification settings (from spec)
  allowedModifications: string[] // paths that can be customized
  lockedElements: string[] // paths that cannot be modified
  // Modification scope options from the spec
  defaultModificationScope: string // Default scope when making changes
  broadenModificationOptions: string[] // Available broader scope options
  narrowModificationOptions: string[] // Available narrower scope options
}

export type Website = {
  id: string
  name: string
  domain: string
  themeId: string // References Theme.id (websites inherit from themes, not individual templates)
  brandMode?: 'wiley' | 'wt' | 'dummies' // For multi-brand themes (DS V2)
  status: 'active' | 'staging' | 'maintenance'
  createdAt: Date
  updatedAt: Date
  
  // Customizations from base theme
  modifications: Modification[]
  customSections: WidgetSection[]
  
  // Website-specific settings (override theme defaults)
  branding: {
    primaryColor?: string
    secondaryColor?: string
    logoUrl?: string
    fontFamily?: string
  }
  
  // Theme customizations specific to this website (overrides global theme)
  themeOverrides?: {
    colors?: Partial<Theme['colors']>
    typography?: Partial<Theme['typography']>
    spacing?: Partial<Theme['spacing']>
    components?: Partial<Theme['components']>
  }
  
  // Website purpose configuration
  purpose?: {
    contentTypes: string[]
    hasSubjectOrganization: boolean
    publishingTypes?: string[]
  }
  
  // Analytics
  deviationScore: number // 0-100, how much it differs from theme
  lastThemeSync?: Date
}

export type Theme = {
  id: string
  name: string
  description: string
  version: string
  publishingType: 'journals' | 'books' | 'journals-books' | 'blog' | 'corporate' | 'mixed' | 'academic' | 'visual'
  author: string
  createdAt: Date
  updatedAt: Date
  
  // Complete template package for this publishing type
  templates: BaseTemplate[] // All templates included in this theme
  
  // Optional starter template for new websites
  // When specified, new websites will auto-populate with these sections
  // instead of starting with a blank canvas
  starterTemplate?: {
    name: string
    description: string
    sections: any[] // Will be populated by getStarterTemplateForTheme()
  }
  
  // Global styling that applies across all templates
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
    muted: string
  }
  
  typography: {
    headingFont: string
    bodyFont: string
    baseSize: string
    scale: number
  }
  
  spacing: {
    base: string
    scale: number
  }
  
  components: {
    button: Record<string, any>
    card: Record<string, any>
    form: Record<string, any>
  }
  
  // Theme-specific modification rules (config-level changes only, NOT code customization)
  modificationRules: {
    colors: {
      canModifyPrimary: boolean
      canModifySecondary: boolean
      canModifyAccent: boolean
      canModifyBackground: boolean
      canModifyText: boolean
      canModifyMuted: boolean
    }
    typography: {
      canModifyHeadingFont: boolean
      canModifyBodyFont: boolean
      canModifyBaseSize: boolean
      canModifyScale: boolean
    }
    spacing: {
      canModifyBase: boolean
      canModifyScale: boolean
    }
    components: {
      canModifyButtonRadius: boolean
      canModifyButtonWeight: boolean
      canModifyCardRadius: boolean
      canModifyCardShadow: boolean
      canModifyFormRadius: boolean
    }
  }
  
  // Global sections
  globalSections: {
    header: WidgetSection
    footer: WidgetSection
  }
  
  // Publication card variants for this theme
  publicationCardVariants: PublicationCardVariant[]
}
