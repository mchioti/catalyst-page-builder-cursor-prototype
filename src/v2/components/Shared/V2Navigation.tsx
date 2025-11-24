/**
 * V2 Navigation Component
 * Shows current mode and allows switching between Design/Editor/Preview/Live
 */

import { Link, useLocation } from 'react-router-dom'
import { Settings, Edit, Globe, Globe2 } from 'lucide-react'

export function V2Navigation() {
  const location = useLocation()
  
  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path || 
             (path === '/v2/websites' && (location.pathname === '/v2' || location.pathname === '/v2/'))
    }
    if (path === '/v2/websites') {
      return location.pathname === '/v2' || 
             location.pathname === '/v2/' || 
             location.pathname.startsWith('/v2/websites')
    }
    return location.pathname.startsWith(path)
  }
  
  const navItems = [
    { path: '/v2/websites', label: 'Websites', icon: Globe2 },
    { path: '/v2/design', label: 'Design', icon: Settings },
    { path: '/v2/editor', label: 'Editor', icon: Edit },
    { path: '/v2/live', label: 'Live', icon: Globe }
  ]
  
  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              V2
            </div>
            <span className="font-semibold text-gray-900">Catalyst Page Builder</span>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
              Experimental
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
        
        <Link
          to="/v1"
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-2"
        >
          <span>Switch to V1</span>
          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">Legacy</span>
        </Link>
      </div>
    </nav>
  )
}

