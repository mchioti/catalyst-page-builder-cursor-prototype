import React from 'react'
import { Info } from 'lucide-react'
import type { ListItemSpanningConfig, SpanningPreset, SPANNING_PATTERNS, PATTERN_DESCRIPTIONS } from '../../types/widgets'
import type { WidgetSection } from '../../types'

// Import constants
import { SPANNING_PATTERNS as PATTERNS, PATTERN_DESCRIPTIONS as DESCRIPTIONS } from '../../types/widgets'

interface ListPatternControlsProps {
  spanningConfig?: ListItemSpanningConfig
  updateWidget: (updates: { spanningConfig: ListItemSpanningConfig }) => void
  parentSection?: WidgetSection
}

export const ListPatternControls: React.FC<ListPatternControlsProps> = ({
  spanningConfig,
  updateWidget,
  parentSection
}) => {
  const isInGrid = parentSection?.layout === 'grid'
  const isInFlex = parentSection?.layout === 'flexible'
  const canInherit = isInGrid || isInFlex
  
  // Local state for custom pattern input to allow typing commas
  const [customPatternInput, setCustomPatternInput] = React.useState('')
  
  const config: ListItemSpanningConfig = spanningConfig || {
    enabled: false,
    preset: 'uniform'
  }
  
  const pattern = config.preset === 'custom'
    ? (config.customPattern || [1])
    : PATTERNS[config.preset]
  
  // Initialize custom pattern input from config
  // IMPORTANT: This hook must be called BEFORE any early returns
  React.useEffect(() => {
    if (canInherit && config.preset === 'custom') {
      setCustomPatternInput(config.customPattern?.join(',') || '1')
    }
  }, [canInherit, config.preset, config.customPattern])
  
  // Helper function to parse and apply pattern
  const applyPattern = (inputValue: string) => {
    const pattern = inputValue
      .split(',')
      .map(n => parseInt(n.trim()))
      .filter(n => !isNaN(n) && n > 0)
    
    if (pattern.length > 0) {
      updateWidget({
        spanningConfig: {
          ...config,
          customPattern: pattern
        }
      })
      // Update input to show cleaned pattern
      setCustomPatternInput(pattern.join(','))
    } else {
      // Invalid input, reset to default
      updateWidget({
        spanningConfig: {
          ...config,
          customPattern: [1]
        }
      })
      setCustomPatternInput('1')
    }
  }
  
  // Early return AFTER all hooks have been called
  if (!canInherit) {
    return null // Only show when in Grid/Flex section
  }
  
  return (
    <div className="border border-blue-200 rounded-lg p-3 bg-blue-50/30 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-blue-900">
          {isInGrid ? 'Grid' : 'Flex'} Pattern
        </h4>
        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
          {isInGrid ? 'Grid Layout' : 'Flex Layout'}
        </span>
      </div>
      
      {/* Enable Inheritance */}
      <label className="flex items-center">
        <input
          type="checkbox"
          checked={config.enabled}
          onChange={(e) => updateWidget({
            spanningConfig: {
              ...config,
              enabled: e.target.checked
            }
          })}
          className="rounded border-gray-300 text-blue-600 mr-2"
        />
        <span className="text-sm text-gray-700">
          Inherit parent {isInGrid ? 'grid' : 'flex'} layout
        </span>
      </label>
      
      <p className="text-xs text-gray-500">
        Items will flow into parent {isInGrid ? 'grid' : 'flex'} container using pattern-based spanning
      </p>
      
      {config.enabled && (
        <>
          {/* Preset Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Spanning Pattern
            </label>
            <select
              value={config.preset}
              onChange={(e) => updateWidget({
                spanningConfig: {
                  ...config,
                  preset: e.target.value as SpanningPreset
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="uniform">Uniform (all equal)</option>
              <option value="featured-first">Featured First (2,1,1)</option>
              <option value="hero-first">Hero First (3,1,1,1)</option>
              <option value="alternating">Alternating (1,2,1)</option>
              <option value="masonry">Masonry (1,1,2)</option>
              <option value="custom">Custom Pattern</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {DESCRIPTIONS[config.preset]}
            </p>
          </div>
          
          {/* Custom Pattern Input */}
          {config.preset === 'custom' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Pattern
              </label>
              <input
                type="text"
                value={customPatternInput}
                onChange={(e) => {
                  // Just update local state while typing
                  setCustomPatternInput(e.target.value)
                }}
                onBlur={(e) => {
                  // Parse and validate on blur
                  applyPattern(e.target.value)
                }}
                onKeyDown={(e) => {
                  // Also apply on Enter key
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    applyPattern(customPatternInput)
                    e.currentTarget.blur() // Remove focus
                  }
                }}
                placeholder="2,1,1 or 3,1,1,1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
              />
              <p className="text-xs text-gray-500 mt-1">
                Comma-separated column spans (e.g., 2,1,1)
              </p>
            </div>
          )}
          
          {/* Pattern Preview */}
          <div className="border-t pt-3">
            <label className="block text-xs font-medium text-gray-500 mb-2">
              Preview Pattern
            </label>
            <div className="flex gap-1 items-end h-16 overflow-x-auto">
              {pattern.slice(0, 8).map((span, index) => (
                <div
                  key={index}
                  className="bg-blue-200 border border-blue-400 rounded flex items-center justify-center text-xs font-bold text-blue-800 flex-shrink-0"
                  style={{
                    flex: `0 0 ${span * 30}px`,
                    minWidth: `${span * 30}px`,
                    height: `${40 + (span * 8)}px`
                  }}
                >
                  {span}
                </div>
              ))}
              {pattern.length > 8 && (
                <div className="text-xs text-gray-500 self-center flex-shrink-0">
                  ...
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Pattern repeats: [{pattern.join(', ')}]
            </p>
          </div>
          
          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mt-3">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-800">
                <p className="font-medium mb-1">How Patterns Work</p>
                <ul className="space-y-0.5">
                  <li>• Pattern applies to each item in the list</li>
                  <li>• Repeats automatically for any number of items</li>
                  <li>• {isInGrid ? 'Column spans' : 'Flex grow values'} from parent {isInGrid ? 'grid' : 'flex'}</li>
                  <li>• Creates visual hierarchy and emphasis</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

