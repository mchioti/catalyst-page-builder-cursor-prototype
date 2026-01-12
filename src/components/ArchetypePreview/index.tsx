/**
 * ArchetypePreview - Preview archetype in browser (like LiveSite)
 * 
 * Route: /preview/archetype/:archetypeId?designId=xxx
 * 
 * Reuses LiveSite structure but shows archetype content with banners
 */

import { useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { CanvasRenderer } from '../LiveSite/CanvasRenderer'
import { usePageStore } from '../../stores'
import { 
  getArchetypeById,
  resolveCanvasFromArchetype
} from '../../stores/archetypeStore'
import { 
  initializeJournalHomeArchetype
} from '../../utils/archetypeFactory'
import type { Archetype } from '../../types/archetypes'
import { createStandardHeaderPrefab, createStandardFooterPrefab } from '../PageBuilder/prefabSections'
import { EscapeHatch } from '../PrototypeControls/EscapeHatch'
import { usePrototypeStore } from '../../stores/prototypeStore'

export function ArchetypePreview() {
  const { archetypeId } = useParams<{ archetypeId: string }>()
  const [searchParams] = useSearchParams()
  const designId = searchParams.get('designId') || 'classic-ux3-theme'
  const navigate = useNavigate()
  
  const { setCurrentView } = usePageStore()
  const { drawerOpen } = usePrototypeStore()
  
  const [archetype, setArchetype] = useState<Archetype | null>(null)
  const [canvasItems, setCanvasItems] = useState<any[]>([])
  const [showMockData, setShowMockData] = useState(true) // Mock data toggle for preview
  
  // Set view state
  useEffect(() => {
    setCurrentView('mock-live-site')
  }, [setCurrentView])
  
  // Load archetype
  useEffect(() => {
    if (!archetypeId) return
    
    // Initialize if missing (for journal-home)
    if (archetypeId === 'modern-journal-home') {
      const initialized = initializeJournalHomeArchetype(designId)
      setArchetype(initialized)
      return
    }
    
    // Load existing archetype
    const loaded = getArchetypeById(archetypeId, designId)
    if (loaded) {
      setArchetype(loaded)
    }
  }, [archetypeId, designId])
  
  // Create template context for variable replacement (minimal - just for template variables)
  // IMPORTANT: Do NOT include journal in templateContext - this would cause widgets to try to fetch
  // journal-specific data instead of generating AI mock content. We want AI content in archetype preview.
  const templateContext = useMemo(() => {
    // Empty context - widgets will generate AI mock data when journalContext is undefined
    // Template variables (if any) can be replaced here, but no journal data
    return {}
  }, [])
  
  // Get pageCanvas accessor from store
  const getPageCanvas = usePageStore(state => state.getPageCanvas)
  
  // Load canvas - first check for draft (unsaved changes), then fall back to archetype
  useEffect(() => {
    if (!archetype || !archetypeId) return
    
    // Check for draft canvas first (unsaved changes from editor)
    const draftCanvas = getPageCanvas('archetype', archetypeId)
    if (draftCanvas && draftCanvas.length > 0) {
      setCanvasItems(draftCanvas)
      return
    }
    
    // Fall back to resolved archetype canvas
    const resolved = resolveCanvasFromArchetype(archetype)
    setCanvasItems(resolved)
  }, [archetype, archetypeId, getPageCanvas])
  
  // Create default header/footer for preview (must be before early return)
  const headerSections = useMemo(() => [createStandardHeaderPrefab()], [])
  const footerSections = useMemo(() => [createStandardFooterPrefab()], [])
  
  if (!archetype) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-600">Loading archetype...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div 
      className="min-h-screen bg-white flex flex-col transition-all duration-300 ease-in-out"
      style={{ marginRight: drawerOpen ? '288px' : '0' }}
    >
      {/* Archetype Preview Banner - Yellow sticky header */}
      <div className="bg-yellow-100 border-b border-yellow-300 px-4 py-3 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-yellow-800 font-semibold text-sm">
              🏛️ Archetype Preview: {archetype.name}
            </span>
            <span className="text-xs text-yellow-700">
              This is the master template. All pages using this archetype inherit from it.
            </span>
          </div>
          <div className="flex items-center gap-3">
            {/* Mock Data Toggle */}
            <label className="flex items-center gap-2 text-sm text-yellow-800">
              <input
                type="checkbox"
                checked={showMockData}
                onChange={(e) => setShowMockData(e.target.checked)}
                className="w-4 h-4 text-yellow-600 border-yellow-300 rounded focus:ring-yellow-500"
              />
              Show Mock Data
            </label>
          </div>
        </div>
      </div>
      
      {/* Render header */}
      <div className="border-b border-gray-200">
        <CanvasRenderer 
          items={headerSections} 
          websiteId="archetype"
          themeId={archetype.designId}
        />
      </div>
      
      {/* Render archetype content */}
      <main className="flex-1">
        <CanvasRenderer 
          items={canvasItems} 
          websiteId="archetype"
          themeId={archetype.designId}
          templateContext={templateContext}
          showMockData={showMockData}
          pageConfig={archetype.pageConfig}
        />
      </main>
      
      {/* Render footer */}
      <div className="border-t border-gray-200 mt-12">
        <CanvasRenderer 
          items={footerSections} 
          websiteId="archetype"
          themeId={archetype.designId}
        />
      </div>
      
      {/* Floating Edit Button - Matches page editing pattern */}
      <div 
        className="fixed bottom-6 z-50 flex flex-col gap-2 items-end transition-all duration-300 ease-in-out"
        style={{ right: drawerOpen ? 'calc(288px + 5rem)' : '5rem' }}
      >
        <button
          onClick={() => navigate(`/edit/archetype/${archetypeId}?designId=${designId}`)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-lg"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit Archetype
        </button>
        <div className="text-xs text-gray-500 text-center bg-white/90 px-2 py-1 rounded shadow">
          🏛️ Master Template
        </div>
      </div>
      
      {/* Escape Hatch - Always available for prototype user (meta layer) */}
      <EscapeHatch
        context="live-site"
        websiteId="archetype"
        websiteName={archetype.name}
        pageId={archetypeId}
      />
    </div>
  )
}

