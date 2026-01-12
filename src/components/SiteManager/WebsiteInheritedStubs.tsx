/**
 * Website Inherited Stubs
 * Shows stubs from the Design that this website is using,
 * with modification/divergence tracking
 */

import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { 
  Search, Eye, Edit3, RotateCcw, Check, AlertTriangle, 
  FileText, Home, HelpCircle, SearchIcon
} from 'lucide-react'
import { mockWebsites } from '../../v2/data/mockWebsites'
import { NewBadge } from '../shared/NewBadge'
import { getHomepageStubForWebsite, getPageStub } from '../PageBuilder/pageStubs'

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
  const [searchTerm, setSearchTerm] = useState('')
  
  // Get store functions
  const getPageCanvas = usePageStore((state: any) => state.getPageCanvas)
  
  // Get the base design stubs for comparison
  const v2Website = mockWebsites.find(w => w.id === websiteId)
  
  // Define available design stubs
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
  
  // Filter by search
  const filteredStubs = stubsWithStatus.filter(stub => {
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

  // Handle "Use" button click - open UseTemplateModal
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6">
        <h2 className="text-2xl font-bold text-gray-900">{websiteName} - Other Pages</h2>
        <p className="text-gray-600 mt-1">
          Marketing and informational pages with modification tracking
        </p>
        
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
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                      {stub.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{stub.name}</span>
                        <NewBadge itemId={`starter:${stub.id}`} variant="pill" />
                      </div>
                      <div className="text-sm text-gray-500">{stub.description}</div>
                    </div>
                  </div>
                </td>
                
                {/* Status */}
                <td className="py-4 px-4">
                  {stub.isModified ? (
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
                    
                    {/* Sync with Master (only if modified) */}
                    {stub.isModified && (
                      <button
                        onClick={() => handleResetToBase(stub.id, stub.name)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-md transition-colors"
                        title="Sync with Master"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Sync
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredStubs.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            No pages found matching your search
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-1">About Other Pages</h4>
        <p className="text-sm text-blue-700">
          These are marketing and informational page templates from the design. 
          When modified, changes are saved specifically for this website while 
          the design master remains unchanged. Use "Sync" to restore the master version.
        </p>
      </div>
    </div>
  )
}

