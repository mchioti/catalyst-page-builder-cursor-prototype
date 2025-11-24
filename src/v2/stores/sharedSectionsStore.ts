/**
 * V2 Shared Sections Store
 * Manages the library of shared sections (headers, footers, heroes, etc.)
 */

import { create } from 'zustand'
import type { SharedSection, SectionVariation } from '../types/core'

interface SharedSectionsState {
  // Data
  sections: SharedSection[]
  
  // Actions
  addSection: (section: SharedSection) => void
  updateSection: (id: string, updates: Partial<SharedSection>) => void
  deleteSection: (id: string) => void
  
  addVariation: (sectionId: string, variation: SectionVariation) => void
  updateVariation: (sectionId: string, variationKey: string, updates: Partial<SectionVariation>) => void
  deleteVariation: (sectionId: string, variationKey: string) => void
  
  // Queries
  getSectionById: (id: string) => SharedSection | undefined
  getSectionsByCategory: (category: string) => SharedSection[]
  getSectionsForWebsite: (websiteId: string) => SharedSection[]
  getSectionsForTheme: (themeId: string) => SharedSection[]
}

export const useSharedSectionsStore = create<SharedSectionsState>((set, get) => ({
  sections: [],
  
  addSection: (section) => set((state) => ({
    sections: [...state.sections, section]
  })),
  
  updateSection: (id, updates) => set((state) => ({
    sections: state.sections.map(section =>
      section.id === id ? { ...section, ...updates, updatedAt: new Date() } : section
    )
  })),
  
  deleteSection: (id) => set((state) => ({
    sections: state.sections.filter(section => section.id !== id)
  })),
  
  addVariation: (sectionId, variation) => set((state) => ({
    sections: state.sections.map(section =>
      section.id === sectionId
        ? {
            ...section,
            variations: {
              ...section.variations,
              [variation.id]: variation
            },
            updatedAt: new Date()
          }
        : section
    )
  })),
  
  updateVariation: (sectionId, variationKey, updates) => set((state) => {
    console.log(`📝 Updating variation: ${sectionId}/${variationKey}`, updates)
    return {
      sections: state.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              variations: {
                ...section.variations,
                [variationKey]: {
                  ...section.variations[variationKey],
                  ...updates,
                  updatedAt: new Date()
                }
              },
              updatedAt: new Date()
            }
          : section
      )
    }
  }),
  
  deleteVariation: (sectionId, variationKey) => set((state) => ({
    sections: state.sections.map(section => {
      if (section.id === sectionId) {
        const { [variationKey]: _, ...remainingVariations } = section.variations
        return {
          ...section,
          variations: remainingVariations,
          updatedAt: new Date()
        }
      }
      return section
    })
  })),
  
  getSectionById: (id) => {
    return get().sections.find(section => section.id === id)
  },
  
  getSectionsByCategory: (category) => {
    return get().sections.filter(section => section.category === category)
  },
  
  getSectionsForWebsite: (websiteId) => {
    return get().sections.filter(section => section.websiteId === websiteId)
  },
  
  getSectionsForTheme: (themeId) => {
    return get().sections.filter(section => section.themeId === themeId)
  }
}))

