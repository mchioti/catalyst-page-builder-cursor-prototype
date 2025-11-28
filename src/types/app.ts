// Application and UI state types

import type { CanvasItem, Widget, WidgetSection, CustomSection, CustomStarterPage, PublicationCardVariant, ContentBlockLayout } from './widgets'
import type { BaseTemplate, Website, Theme, Modification } from './templates'
import type { SchemaObject, SchemaOrgType } from './schema'

export type AppView = 'page-builder' | 'design-console' | 'mock-live-site'

export type DesignConsoleView = 
  | 'overview' 
  // Theme-level views (foundational design system)
  | 'modernist-theme-theme-settings' 
  | 'modernist-theme-publication-cards'
  | 'modernist-theme-templates' 
  | 'modernist-theme-template-library'
  | 'modernist-theme-starter-library'
  | 'modernist-theme-section-library'
  | 'classicist-theme-theme-settings' 
  | 'classicist-theme-publication-cards'
  | 'classicist-theme-templates'
  | 'classicist-theme-template-library'
  | 'classicist-theme-starter-library'
  | 'classicist-theme-section-library'
  | 'classic-ux3-theme-template-library'
  | 'classic-ux3-theme-starter-library'
  | 'classic-ux3-theme-section-library'
  | 'wiley-figma-ds-v2-template-library'
  | 'wiley-figma-ds-v2-starter-library'
  | 'wiley-figma-ds-v2-section-library'
  | 'ibm-carbon-ds-template-library'
  | 'ibm-carbon-ds-starter-library'
  | 'ibm-carbon-ds-section-library'
  | 'ant-design-template-library'
  | 'ant-design-starter-library'
  | 'ant-design-section-library'
  // Website-level views (per-website customization)
  | 'catalyst-demo-settings'
  | 'catalyst-demo-branding'
  | 'catalyst-demo-templates'
  | 'catalyst-demo-publication-cards'
  | 'catalyst-demo-custom-templates'
  | 'febs-press-settings'
  | 'febs-press-branding'
  | 'febs-press-templates'
  | 'febs-press-publication-cards'
  | 'febs-press-custom-templates'
  // System views
  | 'websites' 
  | 'create-website'
  | 'designs'
  | 'settings'

export type EditingContext = 'template' | 'page' | 'website'

export type TemplateEditingContext = {
  scope: 'global' | 'issue-type' | 'journal' | 'individual'
  templateId: string
  journalCode?: string
  issueType?: IssueType
  affectedIssues: string[]
  skipRoutes?: string[] // Routes to skip in selective global mode
}

export type IssueType = 'current' | 'ahead-of-print' | 'just-accepted' | 'archive'

// Mock Live Site routing
export type MockLiveSiteRoute = 
  | '/' 
  | '/toc/advma/current' 
  | '/toc/embo/current'
  | '/toc/advma/vol-35-issue-47'  
  | '/toc/embo/vol-35-issue-47'
  | '/article/advma/67/12/p45'
  | '/journal/advma'
  | '/journal/embo'
  | '/about'
  | '/search'

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

// Template Divergence Management
export type TemplateModification = {
  route: string           // e.g., 'toc/dgov/current'
  journalCode: string     // e.g., 'dgov' (ADVMA)
  journalName: string     // e.g., 'Digital Government: Research and Practice'
  templateId: string      // e.g., 'toc-template'
  modificationCount: number
  lastModified: Date
  isExempt: boolean       // True = don't inherit base template updates
}

export type Persona = 'publisher' | 'pb-admin' | 'developer'
export type ConsoleMode = 'multi' | 'single'

export type PageState = {
  // Routing
  currentView: AppView
  siteManagerView: DesignConsoleView
  editingContext: EditingContext
  templateEditingContext: TemplateEditingContext | null
  currentWebsiteId: string
  mockLiveSiteRoute: MockLiveSiteRoute
  previewBrandMode: 'wiley' | 'wt' | 'dummies' // For theme preview in Design Console
  previewThemeId: string // For theme preview in Design Console
  setCurrentView: (view: AppView) => void
  setSiteManagerView: (view: DesignConsoleView) => void
  setEditingContext: (context: EditingContext) => void
  setTemplateEditingContext: (context: TemplateEditingContext | null) => void
  setCurrentWebsiteId: (websiteId: string) => void
  setMockLiveSiteRoute: (route: MockLiveSiteRoute) => void
  setPreviewBrandMode: (mode: 'wiley' | 'wt' | 'dummies') => void
  setPreviewThemeId: (themeId: string) => void
  
  // Prototype Controls (Persona & Console Mode)
  currentPersona: Persona
  consoleMode: ConsoleMode
  setCurrentPersona: (persona: Persona) => void
  setConsoleMode: (mode: ConsoleMode) => void
  
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
  routeCanvasItems: Record<string, CanvasItem[]> // Route-specific canvas storage
  globalTemplateCanvas: CanvasItem[] // Global template changes that apply to all TOC routes
  journalTemplateCanvas: Record<string, CanvasItem[]> // Journal-specific template storage (journalCode -> template)
  pageCanvasData: Record<string, CanvasItem[]> // Per-website, per-page canvas storage (key: "websiteId:pageId")
  customSections: CustomSection[]
  customStarterPages: CustomStarterPage[]
  publicationCardVariants: PublicationCardVariant[]
  selectedWidget: string | null
  insertPosition: { relativeTo: string; position: 'above' | 'below' } | null
  
  // Template System
  templates: BaseTemplate[]
  websites: Website[]
  themes: Theme[]
  
  // Template Divergence Tracking
  templateModifications: TemplateModification[]
  exemptedRoutes: Set<string>
  
  // Page Builder Actions
  addWidget: (widget: Widget) => void
  addSection: (section: WidgetSection) => void
  moveItem: (fromIndex: number, toIndex: number) => void
  replaceCanvasItems: (items: CanvasItem[]) => void
  isEditingLoadedWebsite: boolean
  setIsEditingLoadedWebsite: (value: boolean) => void
  selectWidget: (id: string | null) => void
  deleteWidget: (widgetId: string) => void
  
  // Route-specific canvas management
  getCanvasItemsForRoute: (route: string) => CanvasItem[]
  setCanvasItemsForRoute: (route: string, items: CanvasItem[]) => void
  clearCanvasItemsForRoute: (route: string) => void
  
  // Per-website, per-page canvas management (for Live Site integration)
  getPageCanvas: (websiteId: string, pageId: string) => CanvasItem[] | null
  setPageCanvas: (websiteId: string, pageId: string, items: CanvasItem[]) => void
  clearPageCanvas: (websiteId: string, pageId: string) => void
  
  // Global template management
  setGlobalTemplateCanvas: (items: CanvasItem[]) => void
  clearGlobalTemplateCanvas: () => void
  
  // Journal template management
  setJournalTemplateCanvas: (journalCode: string, items: CanvasItem[]) => void
  getJournalTemplateCanvas: (journalCode: string) => CanvasItem[]
  clearJournalTemplateCanvas: (journalCode: string) => void
  addCustomSection: (section: CustomSection) => void
  removeCustomSection: (id: string) => void
  addCustomStarterPage: (starterPage: CustomStarterPage) => void
  removeCustomStarterPage: (id: string) => void
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
  
  // Template Divergence Management
  trackModification: (route: string, journalCode: string, journalName: string, templateId: string) => void
  getModificationsForTemplate: (templateId: string) => TemplateModification[]
  getModificationForRoute: (route: string) => TemplateModification | null
  exemptFromUpdates: (route: string) => void
  removeExemption: (route: string) => void
  resetToBase: (route: string) => void
  promoteToBase: (route: string, templateId: string) => void
  promoteToJournalTemplate: (route: string, journalCode: string, templateId: string) => void
  promoteToPublisherTheme: (templateId: string, journalCode?: string) => void
  updateModificationCount: (route: string, count: number) => void
}
