import { Palette } from 'lucide-react'
import { NewBadge } from './NewBadge'

interface Theme {
  id: string
  name: string
  description: string
  version: string
  publishingType?: string
  templates: any[]
  colors: {
    primary: string
    secondary: string
    accent?: string
    // Wiley DS V2 multi-brand support
    brandModes?: {
      wiley?: { primary: string; accent: string; background: string }
      wt?: { primary: string; accent: string; background: string }
      dummies?: { primary: string; accent: string; background: string }
    }
  }
}

interface DesignSystemCardProps {
  theme: Theme
  isSelected?: boolean
  onClick?: () => void
}

/**
 * Shared component for displaying design system cards
 * Used in: Designs list page, Add Website wizard (Step 3)
 */
export function DesignSystemCard({ 
  theme, 
  isSelected = false, 
  onClick
}: DesignSystemCardProps) {
  // Check if this is Wiley DS V2 with multi-brand support
  const isWileyMultiBrand = theme.id === 'wiley-figma-ds-v2'
  
  // Wiley brand colors (from mockThemes)
  const wileyBrands = isWileyMultiBrand ? [
    { name: 'Wiley', colors: ['#00d875', '#008f8a', '#f2f2eb'] },
    { name: 'WT', colors: ['#3c711a', '#448874', '#ffffff'] },
    { name: 'Dummies', colors: ['#74520f', '#a68202', '#ffffff'] }
  ] : null

  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-lg border-2 transition-all cursor-pointer group ${
        isSelected 
          ? 'border-blue-500 bg-blue-50 shadow-md' 
          : 'border-gray-200 hover:border-blue-400 hover:shadow-sm'
      }`}
    >
      <div className="p-5">
        {/* Header: Icon + Name + Version */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-base font-semibold transition-colors ${
                  isSelected ? 'text-blue-700' : 'text-gray-900 group-hover:text-blue-600'
                }`}>
                  {theme.name}
                </h3>
                <NewBadge itemId={`design:${theme.id}`} variant="pill" />
              </div>
              <p className="text-xs text-gray-500">v{theme.version}</p>
            </div>
          </div>
          {isSelected && (
            <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
        
        {/* Description - 2 lines max */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {theme.description}
        </p>
        
        {/* Footer: Color swatches */}
        <div className="pt-3 border-t border-gray-100">
          {wileyBrands ? (
            // Wiley DS V2: Show 3 brand color triplets
            <div className="flex items-center gap-3">
              {wileyBrands.map((brand, brandIdx) => (
                <div key={brand.name} className="flex items-center gap-1" title={brand.name}>
                  {brand.colors.map((color, colorIdx) => (
                    <div 
                      key={colorIdx}
                      className="w-4 h-4 rounded-full border border-gray-200 shadow-sm" 
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  {brandIdx < wileyBrands.length - 1 && (
                    <div className="w-px h-4 bg-gray-200 ml-2" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            // Other themes: Show single color triplet
            <div className="flex items-center gap-1.5">
              <div 
                className="w-5 h-5 rounded-full border-2 border-white shadow-sm" 
                style={{ backgroundColor: theme.colors.primary }}
                title="Primary color"
              />
              <div 
                className="w-5 h-5 rounded-full border-2 border-white shadow-sm" 
                style={{ backgroundColor: theme.colors.secondary }}
                title="Secondary color"
              />
              <div 
                className="w-5 h-5 rounded-full border-2 border-white shadow-sm" 
                style={{ backgroundColor: theme.colors.accent || theme.colors.primary }}
                title="Accent color"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
