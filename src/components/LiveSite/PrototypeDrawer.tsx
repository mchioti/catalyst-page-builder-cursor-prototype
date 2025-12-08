import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { 
  ChevronLeft, 
  ChevronRight, 
  Home, 
  BookOpen, 
  Info, 
  Search, 
  Edit3,
  Layers,
  DoorOpen
} from 'lucide-react'
import { usePrototypeStore, type Persona } from '../../stores/prototypeStore'

interface PrototypeDrawerProps {
  websiteId: string
  websiteName?: string
  journals?: Array<{ id: string; name: string }>
}

export function PrototypeDrawer({ 
  websiteId, 
  websiteName,
  journals = []
}: PrototypeDrawerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showJournals, setShowJournals] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  
  // Get persona state from store
  const { persona, setPersona } = usePrototypeStore()
  
  const basePath = `/live/${websiteId}`
  const currentPath = location.pathname
  
  const personaLabels: Record<Persona, { label: string; icon: string; color: string; description: string }> = {
    'end-user': { 
      label: 'End User', 
      icon: '👤', 
      color: 'bg-gray-100 text-gray-800',
      description: 'Views live site only'
    },
    'designer': { 
      label: 'Designer', 
      icon: '🎨', 
      color: 'bg-blue-100 text-blue-800',
      description: 'Can edit pages & preview'
    },
    'admin': { 
      label: 'Admin', 
      icon: '👑', 
      color: 'bg-purple-100 text-purple-800',
      description: 'Full access + Design Console'
    }
  }
  
  const isActivePath = (path: string) => {
    if (path === basePath) return currentPath === basePath || currentPath === `${basePath}/` || currentPath === `${basePath}/home`
    return currentPath.startsWith(path)
  }

  return (
    <>
      {/* Toggle Button - Always visible (Escape Hatch) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed top-1/2 -translate-y-1/2 z-[9999] transition-all duration-300 ${
          isOpen ? 'right-80' : 'right-0'
        }`}
        title={isOpen ? 'Close escape hatch' : 'Open escape hatch'}
      >
        <div className="bg-amber-600 hover:bg-amber-700 text-white p-2 rounded-l-lg shadow-lg flex items-center gap-1">
          {isOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!isOpen && <DoorOpen className="w-4 h-4 mr-1" />}
        </div>
      </button>

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-[9998] transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="bg-amber-600 text-white p-4">
            <div className="flex items-center gap-2 mb-2">
              <DoorOpen className="w-5 h-5" />
              <h2 className="font-bold">Escape Hatch</h2>
            </div>
            <p className="text-xs text-amber-200">
              Prototype controls • Always available
            </p>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            
            {/* Current Website */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Current Website</div>
              <div className="font-medium text-gray-900">{websiteName || websiteId}</div>
            </div>

            {/* Quick Navigation */}
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase mb-3">Page Shortcuts</div>
              <nav className="space-y-1">
                <Link
                  to={basePath}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActivePath(basePath) && !currentPath.includes('/journal') && !currentPath.includes('/about') && !currentPath.includes('/search') && !currentPath.includes('/journals')
                      ? 'bg-amber-100 text-amber-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Home className="w-4 h-4" />
                  <span>Homepage</span>
                </Link>
                
                <div>
                  <button
                    onClick={() => setShowJournals(!showJournals)}
                    className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg transition-colors ${
                      currentPath.includes('/journal')
                        ? 'bg-amber-100 text-amber-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-4 h-4" />
                      <span>Journals</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform ${showJournals ? 'rotate-90' : ''}`} />
                  </button>
                  
                  {showJournals && (
                    <div className="ml-4 mt-1 space-y-1 border-l-2 border-amber-200 pl-3">
                      <Link
                        to={`${basePath}/journals`}
                        className={`block px-3 py-1.5 text-sm rounded transition-colors ${
                          currentPath === `${basePath}/journals`
                            ? 'bg-amber-50 text-amber-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        📚 Browse All
                      </Link>
                      {journals.slice(0, 5).map((journal) => (
                        <Link
                          key={journal.id}
                          to={`${basePath}/journal/${journal.id}`}
                          className={`block px-3 py-1.5 text-sm rounded transition-colors ${
                            currentPath.includes(`/journal/${journal.id}`)
                              ? 'bg-amber-50 text-amber-700 font-medium'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {journal.name}
                        </Link>
                      ))}
                      {journals.length > 5 && (
                        <div className="px-3 py-1 text-xs text-gray-400">
                          +{journals.length - 5} more...
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <Link
                  to={`${basePath}/about`}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActivePath(`${basePath}/about`)
                      ? 'bg-amber-100 text-amber-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Info className="w-4 h-4" />
                  <span>About</span>
                </Link>
                
                <Link
                  to={`${basePath}/search`}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActivePath(`${basePath}/search`)
                      ? 'bg-amber-100 text-amber-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Search className="w-4 h-4" />
                  <span>Search</span>
                </Link>
              </nav>
            </div>

            {/* Escape Hatch Actions */}
            <div>
              <div className="text-xs font-semibold text-amber-600 uppercase mb-3">🚪 Escape Hatches</div>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    const pageName = currentPath.replace(`/live/${websiteId}`, '').replace(/^\//, '') || 'home'
                    navigate(`/edit/${websiteId}/${pageName}`)
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit This Page</span>
                </button>
                
                <button
                  onClick={() => navigate('/v1')}
                  className="w-full flex items-center gap-3 px-3 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition-colors"
                >
                  <Layers className="w-4 h-4" />
                  <span>Design Console</span>
                </button>
              </div>
            </div>

            {/* Persona Switcher */}
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase mb-3">Simulating Persona</div>
              <div className="space-y-2">
                {(Object.keys(personaLabels) as Persona[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPersona(p)}
                    className={`w-full flex items-start gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                      persona === p
                        ? 'ring-2 ring-amber-500 bg-amber-50'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-lg mt-0.5">{personaLabels[p].icon}</span>
                    <div className="flex-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${personaLabels[p].color}`}>
                        {personaLabels[p].label}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">{personaLabels[p].description}</p>
                    </div>
                  </button>
                ))}
              </div>
              
              {/* What this persona can see */}
              <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
                <strong>Simulated UI shows:</strong>
                <ul className="mt-1 space-y-0.5">
                  {persona === 'end-user' && (
                    <>
                      <li>• Live site content only</li>
                      <li>• No edit buttons</li>
                      <li>• No admin links</li>
                    </>
                  )}
                  {persona === 'designer' && (
                    <>
                      <li>• Live site content</li>
                      <li>• Edit Page button</li>
                      <li>• No Design Console</li>
                    </>
                  )}
                  {persona === 'admin' && (
                    <>
                      <li>• Live site content</li>
                      <li>• Edit Page button</li>
                      <li>• Design Console access</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-amber-200 p-4 bg-amber-50">
            <div className="text-xs text-amber-700 text-center">
              🚪 Escape Hatch • Meta layer for prototype users
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop when open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-[9997]"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}

