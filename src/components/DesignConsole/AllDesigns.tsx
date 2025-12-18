import type { DesignConsoleView } from '../../types'
import { usePageStore } from '../../AppV1'
import { DesignSystemCard } from '../shared/DesignSystemCard'

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
          <DesignSystemCard
            key={theme.id}
            theme={theme}
            onClick={() => setSiteManagerView(`${theme.id}-theme-settings` as DesignConsoleView)}
          />
        ))}
      </div>
    </div>
  )
}

export default AllDesigns
