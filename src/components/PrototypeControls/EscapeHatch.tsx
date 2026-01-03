import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  ChevronRight, 
  Home, 
  Edit3,
  Layers,
  Monitor,
  MonitorSmartphone,
  Globe,
  Eye,
  Info,
  Search
} from 'lucide-react'
import { usePrototypeStore, type Persona, type ConsoleMode } from '../../stores/prototypeStore'
import { usePageStore } from '../../stores'

interface EscapeHatchProps {
  context: 'live-site' | 'design-console' | 'editor'
  websiteId?: string
  websiteName?: string
  journals?: Array<{ id: string; name: string }>
  pageId?: string
}

export function EscapeHatch({ 
  context,
  websiteId,
  websiteName,
  journals = [],
  pageId
}: EscapeHatchProps) {
  const [showJournals, setShowJournals] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  
  // Drawer state is in the store so parent layouts can respond to it
  const { persona, setPersona, consoleMode, setConsoleMode, drawerOpen, setDrawerOpen } = usePrototypeStore()
  
  // Get setCurrentView from page store to sync view state with routing
  const setCurrentView = usePageStore(state => state.setCurrentView)
  
  // Navigation helper that closes drawer, sets view state, and navigates
  const navigateTo = (path: string) => {
    setDrawerOpen(false)
    
    // Set the currentView state based on target path to ensure AppV1 renders correctly
    if (path === '/v1') {
      setCurrentView('design-console')
    } else if (path.startsWith('/live/')) {
      setCurrentView('mock-live-site')
    } else if (path.startsWith('/edit/')) {
      setCurrentView('page-builder')
    }
    
    navigate(path)
  }
  
  const basePath = websiteId ? `/live/${websiteId}` : ''
  
  const personaLabels: Record<Persona, { label: string; icon: string; color: string; description: string }> = {
    'end-user': { label: 'End User', icon: '👤', color: 'bg-gray-100 text-gray-800', description: 'Views live site only' },
    'designer': { label: 'Designer', icon: '🎨', color: 'bg-blue-100 text-blue-800', description: 'Can edit pages & preview' },
    'admin': { label: 'Admin', icon: '👑', color: 'bg-purple-100 text-purple-800', description: 'Full access + Design Console' }
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setDrawerOpen(!drawerOpen)}
        className={`fixed top-1/2 -translate-y-1/2 z-[9999] bg-white hover:bg-gray-50 p-1.5 rounded-l-lg shadow-lg transition-all duration-300 border border-r-0 border-gray-200 ${
          drawerOpen ? 'right-72' : 'right-0'
        }`}
        title="Escape Hatch - Prototype Controls"
      >
        <img src="/catalyst-PB.png" alt="Catalyst PB" className="w-8 h-8 object-contain" />
      </button>
      
      {/* Drawer Panel - pushes content */}
      <div className={`fixed right-0 top-0 h-full w-72 bg-white shadow-2xl z-[9998] transform transition-transform duration-300 ease-in-out ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full flex flex-col">
          <div className="bg-amber-500 text-white px-4 py-3 flex items-center gap-2">
            <span className="font-semibold">Escape Hatch</span>
            <span className="text-xs opacity-75 ml-auto">Prototype</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="text-xs text-amber-600 font-medium uppercase">Currently In</div>
              <div className="text-sm font-semibold text-amber-800 mt-1">
                {context === 'live-site' && `🌐 Live Site: ${websiteName || websiteId}`}
                {context === 'design-console' && '🎛️ Design Console'}
                {context === 'editor' && `✏️ Editor: ${pageId || 'Page'}`}
              </div>
            </div>
            
            {context === 'design-console' && (
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase mb-3">Console Mode</div>
                <div className="flex gap-2">
                  <button onClick={() => setConsoleMode('multi')} className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${consoleMode === 'multi' ? 'bg-amber-100 text-amber-800 ring-2 ring-amber-500' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}>
                    <Monitor className="w-4 h-4" />Multi
                  </button>
                  <button onClick={() => setConsoleMode('single')} className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${consoleMode === 'single' ? 'bg-amber-100 text-amber-800 ring-2 ring-amber-500' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}>
                    <MonitorSmartphone className="w-4 h-4" />Single
                  </button>
                </div>
              </div>
            )}
            
            {context === 'live-site' && websiteId && (
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase mb-3">Page Shortcuts</div>
                <div className="space-y-1">
                  <Link to={basePath} className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${location.pathname === basePath || location.pathname === `${basePath}/` ? 'bg-amber-100 text-amber-800' : 'hover:bg-gray-100 text-gray-700'}`}>
                    <Home className="w-4 h-4" /><span className="text-sm">Homepage</span>
                  </Link>
                  <Link to={`${basePath}/journals`} className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${location.pathname === `${basePath}/journals` ? 'bg-amber-100 text-amber-800' : 'hover:bg-gray-100 text-gray-700'}`}>
                    <Globe className="w-4 h-4" /><span className="text-sm">Journals Browse</span>
                  </Link>
                  <Link to={`${basePath}/about`} className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${location.pathname === `${basePath}/about` ? 'bg-amber-100 text-amber-800' : 'hover:bg-gray-100 text-gray-700'}`}>
                    <Info className="w-4 h-4" /><span className="text-sm">About</span>
                  </Link>
                  <Link to={`${basePath}/search`} className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${location.pathname === `${basePath}/search` ? 'bg-amber-100 text-amber-800' : 'hover:bg-gray-100 text-gray-700'}`}>
                    <Search className="w-4 h-4" /><span className="text-sm">Search</span>
                  </Link>
                  
                  {/* Journal List */}
                  <button onClick={() => setShowJournals(!showJournals)} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700">
                    <Globe className="w-4 h-4" /><span className="text-sm">Jump to Journal</span>
                    <ChevronRight className={`w-4 h-4 ml-auto transition-transform ${showJournals ? 'rotate-90' : ''}`} />
                  </button>
                  {showJournals && journals.length > 0 && (
                    <div className="ml-4 space-y-1 border-l-2 border-gray-200 pl-2">
                      {journals.map(j => (
                        <Link key={j.id} to={`${basePath}/journal/${j.id}`} className="block px-2 py-1 text-sm text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded">{j.name}</Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase mb-3">Quick Actions</div>
              <div className="space-y-2">
                {/* View Live Site - disabled when already on live site or no websiteId */}
                {(() => {
                  const isDisabled = context === 'live-site' || !websiteId
                  const disabledReason = context === 'live-site' ? 'Already viewing' : 'No website selected'
                  return (
                    <button 
                      onClick={() => !isDisabled && navigateTo(`/live/${websiteId}`)}
                      disabled={isDisabled}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                        isDisabled 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-green-50 text-green-700 hover:bg-green-100'
                      }`}
                      title={isDisabled ? disabledReason : 'View Live Site'}
                    >
                      <Eye className="w-4 h-4" />
                      <span className="text-sm font-medium">View Live Site</span>
                      {isDisabled && <span className="ml-auto text-xs">({disabledReason})</span>}
                    </button>
                  )
                })()}
                
                {/* Edit This Page - disabled when not on live site or no websiteId */}
                {(() => {
                  const isDisabled = context !== 'live-site' || !websiteId
                  const disabledReason = context === 'editor' ? 'Already editing' : context === 'design-console' ? 'Go to Live Site first' : 'No website selected'
                  // Use pageId if provided, otherwise extract from current URL path
                  const currentPage = pageId || location.pathname.replace(`/live/${websiteId}`, '').replace(/^\//, '') || 'home'
                  return (
                    <button 
                      onClick={() => !isDisabled && navigateTo(`/edit/${websiteId}/${currentPage}?scope=individual`)}
                      disabled={isDisabled}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                        isDisabled 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                      }`}
                      title={isDisabled ? disabledReason : 'Edit This Page'}
                    >
                      <Edit3 className="w-4 h-4" />
                      <span className="text-sm font-medium">Edit This Page</span>
                      {isDisabled && <span className="ml-auto text-xs">({disabledReason})</span>}
                    </button>
                  )
                })()}
                
                {/* Design Console - disabled when already in design console */}
                {(() => {
                  const isDisabled = context === 'design-console'
                  return (
                    <button 
                      onClick={() => !isDisabled && navigateTo('/v1')}
                      disabled={isDisabled}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                        isDisabled 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                      }`}
                      title={isDisabled ? 'Already in Design Console' : 'Design Console'}
                    >
                      <Layers className="w-4 h-4" />
                      <span className="text-sm font-medium">Design Console</span>
                      {isDisabled && <span className="ml-auto text-xs">(Already here)</span>}
                    </button>
                  )
                })()}
              </div>
            </div>
            
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase mb-3">Simulating Persona</div>
              <div className="space-y-2">
                {(Object.keys(personaLabels) as Persona[]).map((p) => (
                  <button key={p} onClick={() => { setPersona(p); setDrawerOpen(false); }} className={`w-full flex items-start gap-3 px-3 py-2 rounded-lg transition-colors text-left ${persona === p ? 'ring-2 ring-amber-500 bg-amber-50' : 'bg-gray-50 hover:bg-gray-100'}`}>
                    <span className="text-lg mt-0.5">{personaLabels[p].icon}</span>
                    <div className="flex-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${personaLabels[p].color}`}>{personaLabels[p].label}</span>
                      <p className="text-xs text-gray-500 mt-1">{personaLabels[p].description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 p-3 bg-gray-50">
            <div className="text-xs text-gray-500 text-center">🐔🥚 The chicken that creates the egg</div>
          </div>
        </div>
      </div>
      
      {/* No backdrop - drawer pushes content instead of overlaying */}
    </>
  )
}

export { type Persona, type ConsoleMode } from '../../stores/prototypeStore'
