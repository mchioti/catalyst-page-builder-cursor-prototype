/**
 * Initialize V2 Stores with Mock Data
 * Call this once when the app loads to populate stores
 */

import { useSharedSectionsStore } from '../stores/sharedSectionsStore'
import { useWebsiteStore } from '../stores/websiteStore'
import { mockSharedSections } from './mockSharedSections'
import { mockWebsites } from './mockWebsites'

export function initializeMockData() {
  // Load shared sections into store
  const sharedSectionsStore = useSharedSectionsStore.getState()
  mockSharedSections.forEach(section => {
    sharedSectionsStore.addSection(section)
  })
  
  // Load websites (with their pages) into store
  const websiteStore = useWebsiteStore.getState()
  mockWebsites.forEach(website => {
    websiteStore.addWebsite(website)
  })
  
  // Set Catalyst as the default current website
  websiteStore.setCurrentWebsite('catalyst-demo')
  
  console.log('✅ V2 Mock Data Initialized')
  console.log(`  - ${mockSharedSections.length} shared sections loaded`)
  console.log(`  - ${mockWebsites.length} websites loaded`)
  console.log(`  - ${mockWebsites.reduce((acc, w) => acc + w.pages.length, 0)} pages loaded`)
}

// Helper to check if data is already loaded (avoid double-loading)
export function isMockDataLoaded() {
  const sectionsCount = useSharedSectionsStore.getState().sections.length
  const websitesCount = useWebsiteStore.getState().websites.length
  return sectionsCount > 0 && websitesCount > 0
}

