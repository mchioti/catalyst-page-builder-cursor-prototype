import React, { useState } from 'react'
import { Settings, ChevronDown, ChevronUp } from 'lucide-react'

export type Persona = 'publisher' | 'pb-admin' | 'developer'
export type ConsoleMode = 'multi' | 'single'

interface PrototypeControlsProps {
  currentPersona: Persona
  onPersonaChange: (persona: Persona) => void
  consoleMode: ConsoleMode
  onConsoleModeChange: (mode: ConsoleMode) => void
}

export function PrototypeControls({
  currentPersona,
  onPersonaChange,
  consoleMode,
  onConsoleModeChange
}: PrototypeControlsProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const personaLabels: Record<Persona, { label: string; icon: string; description: string }> = {
    publisher: {
      label: 'Publisher',
      icon: '📝',
      description: 'Create and manage websites using pre-made stubs & templates'
    },
    'pb-admin': {
      label: 'PB Admin',
      icon: '⚙️',
      description: 'Create & maintain base stubs, templates, and sections for themes'
    },
    developer: {
      label: 'Developer',
      icon: '👨‍💻',
      description: 'View code, JSON, and API integration details'
    }
  }

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 z-[9999] bg-white border-2 border-purple-500 rounded-t-lg shadow-2xl">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2 bg-purple-50 cursor-pointer hover:bg-purple-100 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-purple-700" />
          <span className="text-sm font-semibold text-purple-900">🎭 Prototype Controls</span>
          <span className="text-xs text-purple-600 bg-purple-200 px-2 py-0.5 rounded-full">
            {personaLabels[currentPersona].icon} {personaLabels[currentPersona].label}
          </span>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-purple-700" />
        ) : (
          <ChevronUp className="w-4 h-4 text-purple-700" />
        )}
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 space-y-4 min-w-[400px]">
          {/* Console Mode */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Console Mode
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => onConsoleModeChange('multi')}
                className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
                  consoleMode === 'multi'
                    ? 'bg-blue-600 text-white font-medium'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🏢 Multi-Website Publisher
              </button>
              <button
                onClick={() => onConsoleModeChange('single')}
                className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
                  consoleMode === 'single'
                    ? 'bg-blue-600 text-white font-medium'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📄 Single Website
              </button>
            </div>
          </div>

          {/* Viewing As (Persona) */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Viewing As (Persona)
            </label>
            <div className="space-y-2">
              {(Object.keys(personaLabels) as Persona[]).map((persona) => (
                <button
                  key={persona}
                  onClick={() => onPersonaChange(persona)}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                    currentPersona === persona
                      ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg">{personaLabels[persona].icon}</span>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{personaLabels[persona].label}</div>
                      <div className={`text-xs mt-0.5 ${
                        currentPersona === persona ? 'text-purple-100' : 'text-gray-500'
                      }`}>
                        {personaLabels[persona].description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Current State Indicator */}
          <div className="pt-2 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              This panel helps prototype different user personas and workflows
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

