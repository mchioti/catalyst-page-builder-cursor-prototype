/**
 * Website Inherited Stubs
 * Shows stubs from the Design that this website is using,
 * with modification/divergence tracking
 */

import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Search, Eye, Edit3, RotateCcw, Check, AlertTriangle, 
  FileText, Home, HelpCircle, SearchIcon, Plus, Trash2, User,
  BookOpen, Layers, FileEdit, Info, Layout
} from 'lucide-react'
import { mockWebsites } from '../../v2/data/mockWebsites'
import { NewBadge } from '../shared/NewBadge'
import { 
  getHomepageStubForWebsite, 
  getPageStub,
  createJournalHomeTemplate,
  createIssueArchiveTemplate,
  createIssueTocTemplate,
  createArticleTemplate
} from '../PageBuilder/pageStubs'
import { UseTemplateModal, type TemplateInfo } from '../PageBuilder/UseTemplateModal'
import type { WebsitePage, CustomStarterPage } from '../../types/widgets'

// Data-driven page templates that can be copied
type DataDrivenTemplate = {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  urlPattern: string // Expected URL pattern for context (e.g., "/journal/{journalId}/...")
  contextType: 'journal' | 'issue' | 'article' | 'none'
}

// Stub types that come from the Design
type DesignStub = {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  slug: string
  isAvailable: boolean // Is this stub available for this website's purpose
}

interface WebsiteInheritedStubsProps {
  websiteId: string
  websiteName: string
  usePageStore: any
}

export function WebsiteInheritedStubs({
  websiteId,
  websiteName,
  usePageStore
}: WebsiteInheritedStubsProps) {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState<'design' | 'my-pages' | 'all'>('all')
  const [showNewPageDialog, setShowNewPageDialog] = useState(false)
  
  // New page form state
  const [newPageSlug, setNewPageSlug] = useState('')
  const [newPageName, setNewPageName] = useState('')
  const [startFrom, setStartFrom] = useState<'blank' | 'template' | 'copy'>('blank')
  const [copyFromPageId, setCopyFromPageId] = useState<string>('')
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  
  // UseTemplateModal state
  const [showUseTemplateModal, setShowUseTemplateModal] = useState(false)
  const [pendingTemplateInfo, setPendingTemplateInfo] = useState<TemplateInfo | null>(null)
  const [pendingInheritanceChoice, setPendingInheritanceChoice] = useState<'copy' | 'sync' | null>(null)
  
  // Get store functions
  const getPageCanvas = usePageStore((state: any) => state.getPageCanvas)
  const setPageCanvas = usePageStore((state: any) => state.setPageCanvas)
  const addWebsitePage = usePageStore((state: any) => state.addWebsitePage)
  const removeWebsitePage = usePageStore((state: any) => state.removeWebsitePage)
  const websitePages: WebsitePage[] = usePageStore((state: any) => state.websitePages) || []
  const addNotification = usePageStore((state: any) => state.addNotification)
  
  // Get current website's design ID for template filtering
  const v2Website = mockWebsites.find(w => w.id === websiteId)
  const currentDesignId = (v2Website as any)?.themeId || (v2Website as any)?.designId || ''
  
  // Get user-saved templates (CustomStarterPages with source='user')
  // Templates are shared across all websites of the SAME DESIGN
  const customStarterPages: CustomStarterPage[] = usePageStore((state: any) => state.customStarterPages) || []
  const removeCustomStarterPage = usePageStore((state: any) => state.removeCustomStarterPage)
  
  const userSavedTemplates = useMemo(() => {
    return customStarterPages.filter(page => {
      if (page.source !== 'user') return false
      // Match by design - templates shared across websites of same design
      const templateWebsite = mockWebsites.find(w => w.id === page.websiteId)
      const templateDesignId = (templateWebsite as any)?.themeId || (templateWebsite as any)?.designId || ''
      return templateDesignId === currentDesignId || !templateDesignId
    })
  }, [customStarterPages, currentDesignId])
  
  // Get user-created pages for this website
  const userCreatedPages = useMemo(() => {
    return websitePages.filter(page => page.websiteId === websiteId && page.source === 'user')
  }, [websitePages, websiteId])
  
  // Data-driven page templates available for copying
  const dataDrivenTemplates: DataDrivenTemplate[] = useMemo(() => [
    {
      id: 'journal-home',
      name: 'Journal Home',
      description: 'Journal landing page with banner and articles',
      icon: <BookOpen className="w-4 h-4" />,
      urlPattern: '/journal/{journalId}',
      contextType: 'journal'
    },
    {
      id: 'issue-archive',
      name: 'Issue Archive',
      description: 'List of all issues for a journal',
      icon: <Layers className="w-4 h-4" />,
      urlPattern: '/journal/{journalId}/issues',
      contextType: 'journal'
    },
    {
      id: 'issue-toc',
      name: 'Issue Table of Contents',
      description: 'Articles listing for a specific issue',
      icon: <FileText className="w-4 h-4" />,
      urlPattern: '/journal/{journalId}/issue/{issueId}',
      contextType: 'issue'
    },
    {
      id: 'article-page',
      name: 'Article Page',
      description: 'Full article view with metadata',
      icon: <FileEdit className="w-4 h-4" />,
      urlPattern: '/journal/{journalId}/article/{articleId}',
      contextType: 'article'
    }
  ], [])
  
  // Detect URL context from the slug input
  const urlContext = useMemo(() => {
    const slug = newPageSlug.trim().toLowerCase()
    
    // Check for journal context: journal/xxx/...
    const journalMatch = slug.match(/^journal\/([^/]+)/)
    if (journalMatch) {
      const journalId = journalMatch[1]
      // Check for deeper context
      if (slug.includes('/issue/')) {
        return { type: 'issue' as const, journalId, hasContext: true }
      }
      if (slug.includes('/article/')) {
        return { type: 'article' as const, journalId, hasContext: true }
      }
      return { type: 'journal' as const, journalId, hasContext: true }
    }
    
    return { type: 'none' as const, journalId: null, hasContext: false }
  }, [newPageSlug])
  
  // Get selected template info for context message
  const selectedTemplateInfo = useMemo(() => {
    if (!copyFromPageId.startsWith('template:')) return null
    const templateId = copyFromPageId.replace('template:', '')
    return dataDrivenTemplates.find(t => t.id === templateId)
  }, [copyFromPageId, dataDrivenTemplates])
  
  // Define available design stubs (v2Website already defined above for template filtering)
  const designStubs: DesignStub[] = useMemo(() => [
    {
      id: 'homepage',
      name: 'Homepage',
      description: 'Main landing page for the website',
      icon: <Home className="w-4 h-4" />,
      slug: 'home',
      isAvailable: true
    },
    {
      id: 'about',
      name: 'About Page',
      description: 'Information about the publisher/organization',
      icon: <HelpCircle className="w-4 h-4" />,
      slug: 'about',
      isAvailable: true
    },
    {
      id: 'search',
      name: 'Search Results',
      description: 'Search results display page',
      icon: <SearchIcon className="w-4 h-4" />,
      slug: 'search',
      isAvailable: true
    },
    {
      id: 'journals',
      name: 'Journals Browse',
      description: 'Browse all journals on the platform',
      icon: <FileText className="w-4 h-4" />,
      slug: 'journals',
      isAvailable: Boolean(v2Website?.journals && v2Website.journals.length > 0)
    }
  ], [v2Website])
  
  // Deep comparison helper to check if canvas differs from base stub
  const canvasDiffersFromBase = (savedCanvas: any[], baseStub: any[]): boolean => {
    if (!savedCanvas || savedCanvas.length === 0) return false
    if (savedCanvas.length !== baseStub.length) return true
    
    // Compare structure by checking type and name in order
    // We do a simplified comparison - if structure matches, consider it the same
    // (Full deep comparison would be expensive and may have false positives due to ID regeneration)
    // Order matters - sections in different order = modification
    for (let i = 0; i < savedCanvas.length; i++) {
      const saved = savedCanvas[i]
      const base = baseStub[i]
      
      if (!saved || !base) return true
      if (saved.type !== base.type) return true
      if (saved.name !== base.name) return true
    }
    
    return false
  }

  // Calculate modification status for each stub
  // "Modified" means the TEMPLATE STRUCTURE itself is different, not just the dynamic content
  // Stubs that use template variables to show different content are NOT modified
  const stubsWithStatus = useMemo(() => {
    // Websites with custom homepage stubs defined (actual structural changes)
    const websitesWithCustomHomepage = ['febs-press']
    
    // Get website info for base stub generation
    const website = mockWebsites.find(w => w.id === websiteId)
    const designId = (website as any)?.themeId || (website as any)?.designId || website?.name
    
    return designStubs.filter(stub => stub.isAvailable).map(stub => {
      // Get saved canvas for this page (from editor changes)
      const savedCanvas = getPageCanvas(websiteId, stub.slug)
      
      // Get the base stub for this page type
      let baseStub: any[] = []
      try {
        switch (stub.id) {
          case 'homepage':
            baseStub = getHomepageStubForWebsite(websiteId, designId)
            break
          case 'about':
            baseStub = getPageStub('about', websiteId, designId)
            break
          case 'search':
            baseStub = getPageStub('search', websiteId, designId)
            break
          case 'journals':
            baseStub = getPageStub('journals', websiteId, designId, website?.journals || [])
            break
        }
      } catch (error) {
        console.warn(`Could not get base stub for ${stub.id}:`, error)
      }
      
      // Determine if website has a custom stub defined (structural modification)
      let hasCustomStub = false
      
      switch (stub.id) {
        case 'homepage':
          // FEBS has a custom homepage with different structure/layout
          hasCustomStub = websitesWithCustomHomepage.includes(websiteId)
          break
        case 'about':
          // All websites use the same About page template
          hasCustomStub = false
          break
        case 'search':
          // All websites use the same Search page template
          hasCustomStub = false
          break
        case 'journals':
          // Journals Browse is a TEMPLATE that dynamically shows each website's journals
          // The template structure is the same - content varies via template variables
          // This is NOT a modification, it's dynamic content
          hasCustomStub = false
          break
      }
      
      // Determine if editor has modifications saved (user made changes)
      // Only consider it modified if the saved canvas actually differs from the base stub
      const hasEditorChanges = savedCanvas && savedCanvas.length > 0 && 
        canvasDiffersFromBase(savedCanvas, baseStub)
      
      // Website is modified if either:
      // 1. It has a custom predefined stub (different template structure)
      // 2. OR user has made changes via the editor that differ from base
      const isModified = hasCustomStub || hasEditorChanges
      
      return {
        ...stub,
        hasCustomStub,
        hasEditorChanges,
        isModified,
        modificationCount: isModified ? 1 : 0,
        savedCanvas
      }
    })
  }, [designStubs, getPageCanvas, websiteId])
  
  // Convert user-created pages to the same format as design stubs for display
  const userPagesNormalized = useMemo(() => {
    return userCreatedPages.map(page => ({
      id: page.id,
      name: page.name,
      description: page.description || 'User-created page',
      icon: <User className="w-4 h-4" />,
      slug: page.slug,
      isAvailable: true,
      hasCustomStub: false,
      hasEditorChanges: false,
      isModified: false,
      modificationCount: 0,
      savedCanvas: page.canvasItems,
      isUserCreated: true, // Flag to identify user pages
      templateId: page.templateId,
      templateName: page.templateName,
      syncedWithMaster: page.syncedWithMaster, // Flag for inheritance
      createdAt: page.createdAt
    }))
  }, [userCreatedPages])
  
  // Filter stubs based on active filter
  const displayedStubs = useMemo(() => {
    if (activeFilter === 'design') {
      return stubsWithStatus.map(s => ({ ...s, isUserCreated: false }))
    } else if (activeFilter === 'my-pages') {
      return userPagesNormalized
    }
    // 'all' - show both design pages and user pages
    return [
      ...stubsWithStatus.map(s => ({ ...s, isUserCreated: false })),
      ...userPagesNormalized
    ]
  }, [stubsWithStatus, activeFilter, userPagesNormalized])
  
  // Filter by search (applied on top of activeFilter)
  const filteredStubs = displayedStubs.filter(stub => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return stub.name.toLowerCase().includes(searchLower) ||
           stub.description.toLowerCase().includes(searchLower)
  })
  
  // Get website info for theme-based stub
  const website = mockWebsites.find(w => w.id === websiteId)
  
  // Get theme's default stub (ignoring website-specific overrides)
  // This is used for reset - we want the theme's base stub, not the website's custom stub
  // We pass the actual websiteId so URLs are generated correctly, but bypass hardcoded stubs via designId
  const getThemeDefaultStub = (stubId: string, designId?: string): any[] => {
    switch (stubId) {
      case 'homepage':
        // Get stub based on theme only, not websiteId
        // This bypasses website-specific hardcoded stubs (like FEBS) by checking designId first
        // We use the actual websiteId so URLs are generated correctly
        // Pass the website's journals so Featured Journals section shows correct journals
        if (designId) {
          const normalizedDesignId = designId.toLowerCase()
          if (normalizedDesignId.includes('wiley')) {
            // For Wiley theme, use actual websiteId but force Wiley stub via designId
            return getHomepageStubForWebsite(websiteId, designId, website?.journals || [])
          }
          if (normalizedDesignId.includes('febs')) {
            // For FEBS theme, we want the theme's default, not the website's custom stub
            // Since FEBS website has a hardcoded stub, we bypass it by using designId
            // FEBS uses foundation-theme-v1, which defaults to Classic theme's default website homepage
            // Use actual websiteId so URLs are correct
            return getHomepageStubForWebsite(websiteId, 'classic-ux3-theme', website?.journals || [])
          }
          if (normalizedDesignId.includes('carbon')) {
            // For Carbon theme, use actual websiteId but force Carbon stub via designId
            return getHomepageStubForWebsite(websiteId, designId, website?.journals || [])
          }
          // Check for Classic theme explicitly
          if (normalizedDesignId.includes('classic') || normalizedDesignId === 'classic-ux3-theme') {
            // Use actual websiteId so URLs are correct
            return getHomepageStubForWebsite(websiteId, 'classic-ux3-theme', website?.journals || [])
          }
        }
        // Default to Classic theme's default website homepage for unknown themes (like foundation-theme-v1)
        // This is the base stub that Classic-themed websites should use
        // Use actual websiteId so URLs are correct
        return getHomepageStubForWebsite(websiteId, 'classic-ux3-theme', website?.journals || [])
      case 'about':
        return getPageStub('about', '', designId)
      case 'search':
        return getPageStub('search', '', designId)
      case 'journals':
        return getPageStub('journals', '', designId, website?.journals || [])
      default:
        return []
    }
  }

  // Handle reset to base (sync with master)
  const handleResetToBase = (stubId: string, stubName: string) => {
    if (!window.confirm(
      `Sync "${stubName}" with Master?\n\n` +
      `This will remove all modifications and restore the original design template.\n` +
      `This action cannot be undone.`
    )) {
      return
    }
    
    const setPageCanvas = usePageStore.getState().setPageCanvas
    const addNotification = usePageStore.getState().addNotification
    
    // Get website info for theme-based stub
    const website = mockWebsites.find(w => w.id === websiteId)
    const designId = (website as any)?.themeId || (website as any)?.designId || website?.name
    
    // Get the theme's default stub (ignoring website-specific overrides)
    const themeDefaultStub = getThemeDefaultStub(stubId, designId)
    const stubSlug = filteredStubs.find(s => s.id === stubId)?.slug || ''
    
    // Save the theme's default stub to canvas
    // This overrides any hardcoded website-specific stubs
    setPageCanvas(websiteId, stubSlug, themeDefaultStub)
    
    addNotification?.({
      type: 'success',
      title: 'Synced with Master',
      message: `"${stubName}" has been synced with the master design`
    })
  }

  // Handle delete user page
  const handleDeleteUserPage = (pageId: string, pageName: string) => {
    // Find the page to get its slug
    const pageToDelete = userCreatedPages.find(p => p.id === pageId)
    
    if (!window.confirm(
      `Delete "${pageName}"?\n\n` +
      `This will permanently remove this page.\n` +
      `This action cannot be undone.`
    )) {
      return
    }
    
    // Remove from websitePages store
    removeWebsitePage(pageId)
    
    // Also clear the canvas data
    if (pageToDelete) {
      setPageCanvas(websiteId, pageToDelete.slug, [])
    }
    
    addNotification?.({
      type: 'success',
      title: 'Page Deleted',
      message: `"${pageName}" has been deleted`
    })
  }

  // Handle create new page
  const handleCreatePage = () => {
    if (!newPageSlug.trim() || !newPageName.trim()) {
      addNotification?.({
        type: 'error',
        title: 'Missing Information',
        message: 'Please enter both a URL slug and page name'
      })
      return
    }
    
    // Check if slug already exists
    const slugExists = [...stubsWithStatus, ...userCreatedPages].some(
      p => p.slug === newPageSlug.trim()
    )
    
    if (slugExists) {
      addNotification?.({
        type: 'error',
        title: 'URL Already Exists',
        message: `A page with URL "/${newPageSlug.trim()}" already exists`
      })
      return
    }
    
    // Validate copy selection
    if (startFrom === 'copy' && !copyFromPageId) {
      addNotification?.({
        type: 'error',
        title: 'No Page Selected',
        message: 'Please select a page to copy from'
      })
      return
    }
    
    // Validate template selection
    if (startFrom === 'template' && !selectedTemplateId) {
      addNotification?.({
        type: 'error',
        title: 'No Template Selected',
        message: 'Please select a template'
      })
      return
    }
    
    // Handle "From Template" - show UseTemplateModal for Copy/Sync choice
    if (startFrom === 'template' && selectedTemplateId) {
      const template = userSavedTemplates.find(t => t.id === selectedTemplateId)
      if (template) {
        // Set up the modal info
        setPendingTemplateInfo({
          id: template.id,
          name: template.name,
          description: template.description,
          canvasItems: template.canvasItems
        })
        // Show the modal - actual page creation will happen in the modal callbacks
        setShowUseTemplateModal(true)
        return
      }
    }
    
    let initialCanvasItems: any[] = []
    let templateName: string | undefined
    let description = 'Custom page created by user'
    
    if (startFrom === 'copy' && copyFromPageId) {
      // Copy from existing page
      const [source, id] = copyFromPageId.split(':')
      
      if (source === 'design') {
        // Copy from a design page
        const designPage = stubsWithStatus.find(s => s.id === id)
        if (designPage) {
          // Try to get saved canvas first, then use theme default
          const savedCanvas = designPage.savedCanvas
          if (savedCanvas && savedCanvas.length > 0) {
            initialCanvasItems = JSON.parse(JSON.stringify(savedCanvas)) // Deep clone
          } else {
            // Get theme default stub
            const website = mockWebsites.find(w => w.id === websiteId)
            const designId = (website as any)?.themeId || (website as any)?.designId || website?.name
            const themeDefault = getThemeDefaultStub(id, designId)
            initialCanvasItems = JSON.parse(JSON.stringify(themeDefault)) // Deep clone
          }
          templateName = designPage.name
          description = `Copied from ${designPage.name}`
        }
      } else if (source === 'user') {
        // Copy from a user-created page
        const userPage = userCreatedPages.find(p => p.id === id)
        if (userPage) {
          initialCanvasItems = JSON.parse(JSON.stringify(userPage.canvasItems)) // Deep clone
          templateName = userPage.name
          description = `Copied from ${userPage.name}`
        }
      } else if (source === 'template') {
        // Copy from a data-driven template
        const templateInfo = dataDrivenTemplates.find(t => t.id === id)
        if (templateInfo) {
          // Get the template canvas based on template type
          // Use a mock websiteId for template generation
          switch (id) {
            case 'journal-home':
              initialCanvasItems = JSON.parse(JSON.stringify(
                createJournalHomeTemplate(websiteId)
              ))
              break
            case 'issue-archive':
              initialCanvasItems = JSON.parse(JSON.stringify(
                createIssueArchiveTemplate(websiteId, urlContext.journalId || 'sample-journal')
              ))
              break
            case 'issue-toc':
              initialCanvasItems = JSON.parse(JSON.stringify(
                createIssueTocTemplate(websiteId, urlContext.journalId || 'sample-journal', 'sample-issue')
              ))
              break
            case 'article-page':
              initialCanvasItems = JSON.parse(JSON.stringify(
                createArticleTemplate(websiteId, urlContext.journalId || 'sample-journal', 'sample-article')
              ))
              break
          }
          
          templateName = templateInfo.name
          description = urlContext.hasContext 
            ? `Based on ${templateInfo.name} (with journal context)`
            : `Based on ${templateInfo.name} (uses mock data)`
        }
      }
      
      // Generate new IDs for all sections and widgets to avoid conflicts
      initialCanvasItems = initialCanvasItems.map(section => ({
        ...section,
        id: `section-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        areas: section.areas?.map((area: any) => ({
          ...area,
          id: `area-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          widgets: area.widgets?.map((widget: any) => ({
            ...widget,
            id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
          }))
        }))
      }))
    } else {
      // Create a blank section for the new page
      const blankSection = {
        id: `section-${Date.now()}`,
        type: 'section' as const,
        name: 'New Section',
        layout: 'single' as const,
        areas: [{
          id: `area-${Date.now()}`,
          widgets: []
        }],
        background: { type: 'color' as const, color: '#ffffff' },
        padding: '40px'
      }
      initialCanvasItems = [blankSection]
    }
    
    // Create the new page
    const newPage: WebsitePage = {
      id: `page-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      websiteId,
      slug: newPageSlug.trim(),
      name: newPageName.trim(),
      description,
      source: 'user',
      templateName,
      canvasItems: initialCanvasItems,
      isPublished: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    // Add to websitePages store
    addWebsitePage(newPage)
    
    // IMPORTANT: Also save to pageCanvasData so the editor can load it
    setPageCanvas(websiteId, newPageSlug.trim(), initialCanvasItems)
    
    addNotification?.({
      type: 'success',
      title: 'Page Created',
      message: `"${newPageName.trim()}" has been created`
    })
    
    // Reset form and close dialog
    setNewPageSlug('')
    setNewPageName('')
    setStartFrom('blank')
    setCopyFromPageId('')
    setSelectedTemplateId('')
    setShowNewPageDialog(false)
    
    // Navigate to edit the new page
    navigate(`/edit/${websiteId}/${newPageSlug.trim()}`)
  }
  
  // Handle template choice - Copy (independent)
  const handleUseCopy = (template: TemplateInfo) => {
    // Create page with template content as a one-time copy (no inheritance)
    const canvasItems = JSON.parse(JSON.stringify(template.canvasItems))
    
    // Generate new IDs for all sections and widgets
    const newCanvasItems = canvasItems.map((section: any) => ({
      ...section,
      id: `section-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      areas: section.areas?.map((area: any) => ({
        ...area,
        id: `area-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        widgets: area.widgets?.map((widget: any) => ({
          ...widget,
          id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
        }))
      }))
    }))
    
    // Create the page
    const newPage: WebsitePage = {
      id: `page-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      websiteId,
      slug: newPageSlug.trim(),
      name: newPageName.trim(),
      description: `Copy of "${template.name}" (independent)`,
      source: 'user',
      templateId: undefined, // No inheritance - independent copy
      templateName: template.name,
      canvasItems: newCanvasItems,
      isPublished: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    addWebsitePage(newPage)
    setPageCanvas(websiteId, newPageSlug.trim(), newCanvasItems)
    
    addNotification?.({
      type: 'success',
      title: 'Page Created',
      message: `"${newPageName.trim()}" created as independent copy of "${template.name}"`
    })
    
    // Reset and close
    setNewPageSlug('')
    setNewPageName('')
    setStartFrom('blank')
    setSelectedTemplateId('')
    setShowNewPageDialog(false)
    setShowUseTemplateModal(false)
    setPendingTemplateInfo(null)
    
    // Navigate to edit
    navigate(`/edit/${websiteId}/${newPageSlug.trim()}`)
  }
  
  // Handle template choice - Sync with Master (inheritance)
  const handleUseSync = (template: TemplateInfo) => {
    // Create page that syncs with the template (has inheritance)
    const canvasItems = JSON.parse(JSON.stringify(template.canvasItems))
    
    // Keep original IDs to maintain sync with master
    // Zone slugs will be used for inheritance tracking
    
    // Create the page with template reference
    const newPage: WebsitePage = {
      id: `page-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      websiteId,
      slug: newPageSlug.trim(),
      name: newPageName.trim(),
      description: `Synced with "${template.name}"`,
      source: 'user',
      templateId: template.id, // Link to master for inheritance
      templateName: template.name,
      syncedWithMaster: true, // Enable inheritance from template
      canvasItems: canvasItems, // Keep original structure for sync
      isPublished: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    addWebsitePage(newPage)
    setPageCanvas(websiteId, newPageSlug.trim(), canvasItems)
    
    addNotification?.({
      type: 'success',
      title: 'Page Created',
      message: `"${newPageName.trim()}" synced with "${template.name}" - changes to master will be reflected`
    })
    
    // Reset and close
    setNewPageSlug('')
    setNewPageName('')
    setStartFrom('blank')
    setSelectedTemplateId('')
    setShowNewPageDialog(false)
    setShowUseTemplateModal(false)
    setPendingTemplateInfo(null)
    
    // Navigate to edit
    navigate(`/edit/${websiteId}/${newPageSlug.trim()}`)
  }

  // Handle "Use" button click - open UseTemplateModal
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{websiteName} - Other Pages</h2>
            <p className="text-gray-600 mt-1">
              Marketing and informational pages with modification tracking
            </p>
          </div>
          
          {/* + New Page Button */}
          <button
            onClick={() => setShowNewPageDialog(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            New Page
          </button>
        </div>
        
        {/* Filter: Design / My Pages / All */}
        <div className="mt-4 flex items-center gap-6">
          <span className="text-sm font-medium text-gray-700">Show:</span>
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              name="page-filter" 
              value="design" 
              checked={activeFilter === 'design'}
              onChange={() => setActiveFilter('design')}
              className="w-4 h-4 text-blue-600" 
            />
            <span className="text-sm text-gray-700">Design</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              name="page-filter" 
              value="my-pages" 
              checked={activeFilter === 'my-pages'}
              onChange={() => setActiveFilter('my-pages')}
              className="w-4 h-4 text-blue-600" 
            />
            <span className="text-sm text-gray-700">My Pages</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              name="page-filter" 
              value="all" 
              checked={activeFilter === 'all'}
              onChange={() => setActiveFilter('all')}
              className="w-4 h-4 text-blue-600" 
            />
            <span className="text-sm text-gray-700">All</span>
          </label>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search pages..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-green-600" />
          <span className="text-gray-600">🔗 Synced with Master</span>
        </div>
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span className="text-gray-600">✏️ Modified</span>
        </div>
      </div>

      {/* Stubs Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Page</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredStubs.map(stub => (
              <tr key={stub.id} className="hover:bg-gray-50">
                {/* Stub Info */}
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${stub.isUserCreated ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                      {stub.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{stub.name}</span>
                        {stub.isUserCreated ? (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                            My Page
                          </span>
                        ) : (
                          <NewBadge itemId={`starter:${stub.id}`} variant="pill" />
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {stub.description}
                        {stub.templateName && (
                          <span className="text-xs text-gray-400 ml-2">
                            (from {stub.templateName})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                
                {/* Status */}
                <td className="py-4 px-4">
                  {stub.isUserCreated ? (
                    stub.syncedWithMaster ? (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-indigo-600" />
                          <span className="text-indigo-700 font-medium">🔗 Synced</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          with "{stub.templateName}"
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-purple-500" />
                        <span className="text-purple-700">Custom Page</span>
                        {stub.templateName && (
                          <span className="text-xs text-gray-400">(copy)</span>
                        )}
                      </div>
                    )
                  ) : stub.isModified ? (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        <span className="text-amber-700 font-medium">
                          ✏️ Modified
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {stub.hasCustomStub && 'Custom template'}
                        {stub.hasCustomStub && stub.hasEditorChanges && ' + '}
                        {stub.hasEditorChanges && 'Editor changes'}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-green-700">🔗 Synced</span>
                    </div>
                  )}
                </td>
                
                {/* Actions */}
                <td className="py-4 px-4">
                  <div className="flex items-center justify-end gap-2">
                    {/* Preview */}
                    <Link
                      to={`/live/${websiteId}/${stub.slug}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Preview
                    </Link>
                    
                    {/* Edit */}
                    <Link
                      to={`/edit/${websiteId}/${stub.slug}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </Link>
                    
                    {/* Sync with Master (only if modified and NOT user-created) */}
                    {stub.isModified && !stub.isUserCreated && (
                      <button
                        onClick={() => handleResetToBase(stub.id, stub.name)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-md transition-colors"
                        title="Sync with Master"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Sync
                      </button>
                    )}
                    
                    {/* Delete (only for user-created pages) */}
                    {stub.isUserCreated && (
                      <button
                        onClick={() => handleDeleteUserPage(stub.id, stub.name)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete page"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredStubs.length === 0 && (
          <div className="py-12 text-center">
            {activeFilter === 'my-pages' ? (
              <div className="space-y-3">
                <div className="text-gray-500">You haven't created any pages yet</div>
                <button
                  onClick={() => setShowNewPageDialog(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Create Your First Page
                </button>
              </div>
            ) : (
              <div className="text-gray-500">No pages found matching your search</div>
            )}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <h4 className="font-medium text-blue-900 mb-1">About Other Pages</h4>
        <p className="text-sm text-blue-700">
          <strong>Design</strong> pages come from the theme and are URL-bound system pages. 
          <strong>My Pages</strong> are custom pages you create for campaigns, events, or other needs.
          When modified, changes are saved specifically for this website while 
          the design master remains unchanged.
        </p>
      </div>
      
      {/* New Page Dialog */}
      {showNewPageDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Create New Page</h3>
              <p className="text-sm text-gray-600 mt-1">
                Add a new page to {websiteName}
              </p>
            </div>
            
            <div className="p-6 space-y-4">
              {/* URL Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Page URL
                </label>
                <div className="flex items-center">
                  <span className="text-gray-500 text-sm mr-1">/{websiteId}/</span>
                  <input
                    type="text"
                    placeholder="my-new-page or journal/jas/my-page"
                    value={newPageSlug}
                    onChange={(e) => setNewPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-/]/g, '-').replace(/\/+/g, '/').replace(/^\//, ''))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Use paths like <code className="bg-gray-100 px-1 rounded">journal/jas/promo</code> to inherit journal context
                </p>
              </div>
              
              {/* Page Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Page Name
                </label>
                <input
                  type="text"
                  placeholder="My New Page"
                  value={newPageName}
                  onChange={(e) => setNewPageName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {/* Start From Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start from
                </label>
                <div className="space-y-2">
                  <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${startFrom === 'blank' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                    <input 
                      type="radio" 
                      name="start-from" 
                      value="blank" 
                      checked={startFrom === 'blank'}
                      onChange={() => setStartFrom('blank')}
                      className="w-4 h-4 text-blue-600" 
                    />
                    <div>
                      <span className="font-medium text-gray-900">Blank Page</span>
                      <p className="text-xs text-gray-500">Start with an empty canvas</p>
                    </div>
                  </label>
                  <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${userSavedTemplates.length === 0 ? 'opacity-50' : ''} ${startFrom === 'template' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                    <input 
                      type="radio" 
                      name="start-from" 
                      value="template" 
                      checked={startFrom === 'template'}
                      onChange={() => setStartFrom('template')}
                      disabled={userSavedTemplates.length === 0}
                      className="w-4 h-4 text-blue-600" 
                    />
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">From Template</span>
                      <p className="text-xs text-gray-500">
                        {userSavedTemplates.length === 0 
                          ? 'No saved templates yet. Save a page as template first.'
                          : `Choose from ${userSavedTemplates.length} saved template${userSavedTemplates.length !== 1 ? 's' : ''}`
                        }
                      </p>
                    </div>
                  </label>
                  
                  {/* Template selector when "From Template" is selected */}
                  {startFrom === 'template' && userSavedTemplates.length > 0 && (
                    <div className="ml-7 mt-2">
                      <select
                        value={selectedTemplateId}
                        onChange={(e) => setSelectedTemplateId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      >
                        <option value="">Select a template...</option>
                        {userSavedTemplates.map(template => (
                          <option key={template.id} value={template.id}>
                            {template.name}
                          </option>
                        ))}
                      </select>
                      {selectedTemplateId && (
                        <p className="mt-2 text-xs text-indigo-600 flex items-center gap-1">
                          <Info className="w-3 h-3" />
                          You'll choose Copy or Sync with Master when creating
                        </p>
                      )}
                    </div>
                  )}
                  <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${startFrom === 'copy' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                    <input 
                      type="radio" 
                      name="start-from" 
                      value="copy" 
                      checked={startFrom === 'copy'}
                      onChange={() => setStartFrom('copy')}
                      className="w-4 h-4 text-blue-600" 
                    />
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">Copy Existing Page</span>
                      <p className="text-xs text-gray-500">Duplicate an existing page on this site</p>
                    </div>
                  </label>
                  
                  {/* Page selector when "Copy" is selected */}
                  {startFrom === 'copy' && (
                    <div className="ml-7 mt-2">
                      <select
                        value={copyFromPageId}
                        onChange={(e) => setCopyFromPageId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      >
                        <option value="">Select a page to copy...</option>
                        <optgroup label="Design Pages">
                          {stubsWithStatus.map(stub => (
                            <option key={`design-${stub.id}`} value={`design:${stub.id}`}>
                              {stub.name}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="Data-driven Pages (Templates)">
                          {dataDrivenTemplates.map(template => (
                            <option key={`template-${template.id}`} value={`template:${template.id}`}>
                              {template.name}
                            </option>
                          ))}
                        </optgroup>
                        {userCreatedPages.length > 0 && (
                          <optgroup label="My Pages">
                            {userCreatedPages.map(page => (
                              <option key={`user-${page.id}`} value={`user:${page.id}`}>
                                {page.name}
                              </option>
                            ))}
                          </optgroup>
                        )}
                      </select>
                      
                      {/* Context info message for data-driven templates */}
                      {selectedTemplateInfo && (
                        <div className={`mt-2 p-2 rounded-lg text-xs flex items-start gap-2 ${
                          urlContext.hasContext && (
                            urlContext.type === selectedTemplateInfo.contextType ||
                            (selectedTemplateInfo.contextType === 'journal' && urlContext.hasContext)
                          )
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                          <div>
                            {urlContext.hasContext && (
                              urlContext.type === selectedTemplateInfo.contextType ||
                              (selectedTemplateInfo.contextType === 'journal' && urlContext.hasContext)
                            ) ? (
                              <>
                                <strong>Context detected:</strong> Your URL contains journal context.
                                Template variables like colors and branding will use real data from the journal.
                              </>
                            ) : (
                              <>
                                <strong>No context in URL:</strong> Template will use AI-generated mock content.
                                <br />
                                <span className="text-amber-600">
                                  Tip: Use a URL like <code className="bg-amber-100 px-1 rounded">journal/jas/my-page</code> to inherit journal branding.
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  "From Template" option coming soon
                </p>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowNewPageDialog(false)
                  setNewPageSlug('')
                  setNewPageName('')
                  setStartFrom('blank')
                  setCopyFromPageId('')
                  setSelectedTemplateId('')
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePage}
                disabled={
                  !newPageSlug.trim() || 
                  !newPageName.trim() || 
                  (startFrom === 'copy' && !copyFromPageId) ||
                  (startFrom === 'template' && !selectedTemplateId)
                }
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {startFrom === 'copy' ? 'Copy & Create Page' : 
                 startFrom === 'template' ? 'Choose Template Options' : 
                 'Create Page'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* UseTemplateModal - for choosing Copy vs Sync with Master */}
      <UseTemplateModal
        isOpen={showUseTemplateModal}
        onClose={() => {
          setShowUseTemplateModal(false)
          setPendingTemplateInfo(null)
        }}
        template={pendingTemplateInfo}
        onUseCopy={handleUseCopy}
        onUseSync={handleUseSync}
        currentPageName={newPageName}
      />
    </div>
  )
}

