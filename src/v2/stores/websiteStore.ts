/**
 * V2 Website Store
 * Manages websites and their pages
 */

import { create } from 'zustand'
import type { Website, Page, SectionCompositionItem, Journal } from '../types/core'

interface WebsiteState {
  // Data
  websites: Website[]
  currentWebsiteId: string | null
  
  // Actions - Websites
  addWebsite: (website: Website) => void
  updateWebsite: (id: string, updates: Partial<Website>) => void
  deleteWebsite: (id: string) => void
  setCurrentWebsite: (id: string | null) => void
  
  // Actions - Pages
  addPage: (websiteId: string, page: Page) => void
  updatePage: (websiteId: string, pageId: string, updates: Partial<Page>) => void
  updatePageComposition: (websiteId: string, pageId: string, composition: SectionCompositionItem[]) => void
  deletePage: (websiteId: string, pageId: string) => void
  publishPage: (websiteId: string, pageId: string) => void
  
  // Actions - Journals
  addJournal: (websiteId: string, journal: Journal) => void
  updateJournal: (websiteId: string, journalId: string, updates: Partial<Journal>) => void
  deleteJournal: (websiteId: string, journalId: string) => void
  
  // Queries
  getWebsiteById: (id: string) => Website | undefined
  getCurrentWebsite: () => Website | undefined
  getPageById: (websiteId: string, pageId: string) => Page | undefined
  getPagesForWebsite: (websiteId: string) => Page[]
  getJournalById: (websiteId: string, journalId: string) => Journal | undefined
  getPagesForJournal: (websiteId: string, journalId: string) => Page[]
}

export const useWebsiteStore = create<WebsiteState>((set, get) => ({
  websites: [],
  currentWebsiteId: null,
  
  addWebsite: (website) => set((state) => ({
    websites: [...state.websites, website]
  })),
  
  updateWebsite: (id, updates) => set((state) => ({
    websites: state.websites.map(website =>
      website.id === id ? { ...website, ...updates, updatedAt: new Date() } : website
    )
  })),
  
  deleteWebsite: (id) => set((state) => ({
    websites: state.websites.filter(website => website.id !== id),
    currentWebsiteId: state.currentWebsiteId === id ? null : state.currentWebsiteId
  })),
  
  setCurrentWebsite: (id) => set({ currentWebsiteId: id }),
  
  addPage: (websiteId, page) => set((state) => ({
    websites: state.websites.map(website =>
      website.id === websiteId
        ? { ...website, pages: [...website.pages, page], updatedAt: new Date() }
        : website
    )
  })),
  
  updatePage: (websiteId, pageId, updates) => set((state) => ({
    websites: state.websites.map(website =>
      website.id === websiteId
        ? {
            ...website,
            pages: website.pages.map(page =>
              page.id === pageId ? { ...page, ...updates, updatedAt: new Date() } : page
            ),
            updatedAt: new Date()
          }
        : website
    )
  })),
  
  updatePageComposition: (websiteId, pageId, composition) => set((state) => ({
    websites: state.websites.map(website =>
      website.id === websiteId
        ? {
            ...website,
            pages: website.pages.map(page =>
              page.id === pageId ? { ...page, composition, updatedAt: new Date() } : page
            ),
            updatedAt: new Date()
          }
        : website
    )
  })),
  
  deletePage: (websiteId, pageId) => set((state) => ({
    websites: state.websites.map(website =>
      website.id === websiteId
        ? {
            ...website,
            pages: website.pages.filter(page => page.id !== pageId),
            updatedAt: new Date()
          }
        : website
    )
  })),
  
  publishPage: (websiteId, pageId) => set((state) => ({
    websites: state.websites.map(website =>
      website.id === websiteId
        ? {
            ...website,
            pages: website.pages.map(page =>
              page.id === pageId
                ? { ...page, status: 'published' as const, publishedAt: new Date(), updatedAt: new Date() }
                : page
            ),
            updatedAt: new Date()
          }
        : website
    )
  })),
  
  getWebsiteById: (id) => {
    return get().websites.find(website => website.id === id)
  },
  
  getCurrentWebsite: () => {
    const { currentWebsiteId, websites } = get()
    if (!currentWebsiteId) return undefined
    return websites.find(website => website.id === currentWebsiteId)
  },
  
  getPageById: (websiteId, pageId) => {
    const website = get().getWebsiteById(websiteId)
    return website?.pages.find(page => page.id === pageId)
  },
  
  getPagesForWebsite: (websiteId) => {
    const website = get().getWebsiteById(websiteId)
    return website?.pages || []
  },
  
  // Journal actions
  addJournal: (websiteId, journal) => set((state) => ({
    websites: state.websites.map(website =>
      website.id === websiteId && website.journals
        ? { ...website, journals: [...website.journals, journal], updatedAt: new Date() }
        : website
    )
  })),
  
  updateJournal: (websiteId, journalId, updates) => set((state) => ({
    websites: state.websites.map(website =>
      website.id === websiteId && website.journals
        ? {
            ...website,
            journals: website.journals.map(journal =>
              journal.id === journalId ? { ...journal, ...updates, updatedAt: new Date() } : journal
            ),
            updatedAt: new Date()
          }
        : website
    )
  })),
  
  deleteJournal: (websiteId, journalId) => set((state) => ({
    websites: state.websites.map(website =>
      website.id === websiteId && website.journals
        ? {
            ...website,
            journals: website.journals.filter(journal => journal.id !== journalId),
            updatedAt: new Date()
          }
        : website
    )
  })),
  
  getJournalById: (websiteId, journalId) => {
    const website = get().getWebsiteById(websiteId)
    return website?.journals?.find(journal => journal.id === journalId)
  },
  
  getPagesForJournal: (websiteId, journalId) => {
    const website = get().getWebsiteById(websiteId)
    return website?.pages.filter(page => page.journalId === journalId) || []
  }
}))

