// Application and UI state types

import type { CanvasItem, Widget, WidgetSection, CustomSection, PublicationCardVariant, ContentBlockLayout } from './widgets'
import type { BaseTemplate, Website, Theme, Modification } from './templates'
import type { SchemaObject, SchemaOrgType } from './schema'

export type AppView = 'page-builder' | 'design-console'

export type DesignConsoleView = 
  | 'overview' 
  // Theme-level views (foundational design system)
  | 'modernist-theme-theme-settings' 
  | 'modernist-theme-publication-cards'
  | 'modernist-theme-templates' 
  | 'classicist-theme-theme-settings' 
  | 'classicist-theme-publication-cards'
  | 'classicist-theme-templates'
  | 'curator-theme-theme-settings' 
  | 'curator-theme-publication-cards'
  | 'curator-theme-templates'
  // Website-level views (per-website customization)
  | 'wiley-main-settings'
  | 'wiley-main-publication-cards'
  | 'wiley-main-custom-templates'
  | 'research-hub-settings'
  | 'research-hub-publication-cards'
  | 'research-hub-custom-templates'
  | 'journal-of-science-settings'
  | 'journal-of-science-publication-cards'
  | 'journal-of-science-custom-templates'
  // System views
  | 'websites' 
  | 'settings'

export type EditingContext = 'template' | 'page' | 'website'

export type NotificationType = 'info' | 'warning' | 'error' | 'success'

export type Notification = {
  id: string
  type: NotificationType
  title: string
  message: string
  timestamp: Date
  autoClose?: boolean
  closeAfter?: number // milliseconds
}

export type PageIssue = {
  id: string
  type: 'accessibility' | 'content' | 'link' | 'image' | 'seo'
  severity: 'error' | 'warning' | 'info'
  title: string
  description: string
  element?: string // widget/section ID
  line?: number
  suggestions?: string[]
}

export type PageState = {
  // Routing
  currentView: AppView
  siteManagerView: DesignConsoleView
  editingContext: EditingContext
  currentWebsiteId: string
  setCurrentView: (view: AppView) => void
  setSiteManagerView: (view: DesignConsoleView) => void
  setEditingContext: (context: EditingContext) => void
  setCurrentWebsiteId: (websiteId: string) => void
  
  // Notifications & Issues
  notifications: Notification[]
  pageIssues: PageIssue[]
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  addPageIssue: (issue: Omit<PageIssue, 'id'>) => void
  removePageIssue: (id: string) => void
  clearPageIssues: () => void
  
  // Schema.org Content Management
  schemaObjects: SchemaObject[]
  selectedSchemaObject: SchemaObject | null
  addSchemaObject: (object: Omit<SchemaObject, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateSchemaObject: (id: string, updates: Partial<SchemaObject>) => void
  removeSchemaObject: (id: string) => void
  selectSchemaObject: (id: string | null) => void
  getSchemaObjectsByType: (type: SchemaOrgType) => SchemaObject[]
  searchSchemaObjects: (query: string) => SchemaObject[]
  
  // Page Builder
  canvasItems: CanvasItem[] // Can contain both individual widgets and sections
  customSections: CustomSection[]
  publicationCardVariants: PublicationCardVariant[]
  selectedWidget: string | null
  insertPosition: { relativeTo: string; position: 'above' | 'below' } | null
  
  // Template System
  templates: BaseTemplate[]
  websites: Website[]
  themes: Theme[]
  
  // Page Builder Actions
  addWidget: (widget: Widget) => void
  addSection: (section: WidgetSection) => void
  moveItem: (fromIndex: number, toIndex: number) => void
  replaceCanvasItems: (items: CanvasItem[]) => void
  selectWidget: (id: string | null) => void
  deleteWidget: (widgetId: string) => void
  addCustomSection: (section: CustomSection) => void
  removeCustomSection: (id: string) => void
  addPublicationCardVariant: (variant: PublicationCardVariant) => void
  removePublicationCardVariant: (id: string) => void
  setInsertPosition: (position: { relativeTo: string; position: 'above' | 'below' } | null) => void
  createContentBlockWithLayout: (layout: ContentBlockLayout) => void
  
  // Template Management
  addTemplate: (template: BaseTemplate) => void
  updateTemplate: (id: string, template: Partial<BaseTemplate>) => void
  removeTemplate: (id: string) => void
  duplicateTemplate: (id: string) => void
  
  // Website Management  
  addWebsite: (website: Website) => void
  updateWebsite: (id: string, website: Partial<Website>) => void
  removeWebsite: (id: string) => void
  
  // Modification Management
  addModification: (websiteId: string, modification: Modification) => void
  removeModification: (websiteId: string, modificationPath: string) => void
  calculateDeviationScore: (websiteId: string) => number
  
  // Theme Management
  addTheme: (theme: Theme) => void
  updateTheme: (id: string, theme: Partial<Theme>) => void
  removeTheme: (id: string) => void
}
