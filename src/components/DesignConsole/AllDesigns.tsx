import { Palette } from 'lucide-react'
import type { DesignConsoleView } from '../../types'
import { usePageStore } from '../../App'

function AllDesigns() {
  const { themes, setSiteManagerView } = usePageStore()
  
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Designs</h2>
        <p className="text-gray-600 mt-1">Browse and manage design systems for your publishing websites</p>
      </div>
      
      {/* Designs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {themes.map((theme) => (
          <div 
            key={theme.id}
            className="bg-white rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-all cursor-pointer group"
            onClick={() => setSiteManagerView(`${theme.id}-theme-settings` as DesignConsoleView)}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Palette className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {theme.name}
                    </h3>
                    <p className="text-sm text-gray-500">v{theme.version}</p>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {theme.description}
              </p>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full border-2 border-gray-200" style={{ backgroundColor: theme.colors.primary }}></div>
                  <div className="w-6 h-6 rounded-full border-2 border-gray-200" style={{ backgroundColor: theme.colors.secondary }}></div>
                  <div className="w-6 h-6 rounded-full border-2 border-gray-200" style={{ backgroundColor: theme.colors.accent }}></div>
                </div>
                <span className="text-xs text-gray-500">{theme.templates.length} page layouts</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AllDesigns
