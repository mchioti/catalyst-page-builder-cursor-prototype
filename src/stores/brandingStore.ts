import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type { 
  BrandingSystem, 
  WebsiteBrandingSystem,
  WebsiteBranding, 
  SubjectBranding, 
  JournalBranding, 
  BookSeriesBranding,
  BrandColors,
  ContentBranding,
  ResolvedBranding,
  ThemeManagerState,
  WebsiteBreakpoints
} from '../types/branding';

// Default color palettes
const DEFAULT_SUBJECT_COLORS: Record<string, BrandColors> = {
  biology: {
    primary: '#F59E0B',      // Amber-500
    secondary: '#FEF3C7',    // Amber-100
    accent: '#92400E',       // Amber-800
    text: '#92400E',         // Dark amber text
    background: '#FFFBEB'    // Amber-50
  },
  mathematics: {
    primary: '#3B82F6',      // Blue-500
    secondary: '#DBEAFE',    // Blue-100
    accent: '#1E40AF',       // Blue-800
    text: '#1E3A8A',         // Dark blue text
    background: '#EFF6FF'    // Blue-50
  },
  chemistry: {
    primary: '#10B981',      // Emerald-500
    secondary: '#D1FAE5',    // Emerald-100
    accent: '#065F46',       // Emerald-800
    text: '#064E3B',         // Dark emerald text
    background: '#ECFDF5'    // Emerald-50
  },
  engineering: {
    primary: '#F97316',      // Orange-500
    secondary: '#FED7AA',    // Orange-200
    accent: '#C2410C',       // Orange-700
    text: '#9A3412',         // Dark orange text
    background: '#FFF7ED'    // Orange-50
  }
};

const DEFAULT_WEBSITE_BRANDING: WebsiteBranding = {
  id: 'website',
  name: 'Default Website',
  isDefault: true,
  colors: {
    primary: '#6366F1',      // Indigo-500
    secondary: '#E0E7FF',    // Indigo-100
    accent: '#4338CA',       // Indigo-700
    text: '#312E81',         // Dark indigo text
    background: '#F0F4FF'    // Indigo-50
  }
};

// Wiley Publishing Theme - extracted from Wiley.com screenshots
const WILEY_WEBSITE_BRANDING: WebsiteBranding = {
  id: 'website',
  name: 'Wiley Publishing',
  isDefault: true,
  colors: {
    primary: '#00d98a',      // Bright green - CTA buttons
    secondary: '#e8f5f5',    // Very light teal - subtle backgrounds
    accent: '#1a5757',       // Dark teal - headers, footer
    text: '#1f2937',         // Dark gray for light backgrounds
    background: '#f9fafb'    // Light gray page background
  }
};

const DEFAULT_BREAKPOINTS: WebsiteBreakpoints = {
  desktop: '1280px',
  tablet: '768px',
  mobile: '480px'
};

const DEFAULT_SUBJECTS: SubjectBranding[] = [
  {
    id: nanoid(),
    name: 'Biology',
    slug: 'biology',
    colors: DEFAULT_SUBJECT_COLORS.biology,
    priority: 100,
    description: 'Life sciences and biological research',
    icon: '🧬'
  },
  {
    id: nanoid(),
    name: 'Mathematics',
    slug: 'mathematics',
    colors: DEFAULT_SUBJECT_COLORS.mathematics,
    priority: 100,
    description: 'Mathematical sciences and research',
    icon: '📐'
  },
  {
    id: nanoid(),
    name: 'Chemistry',
    slug: 'chemistry',
    colors: DEFAULT_SUBJECT_COLORS.chemistry,
    priority: 100,
    description: 'Chemical sciences and research',
    icon: '⚗️'
  },
  {
    id: nanoid(),
    name: 'Engineering',
    slug: 'engineering',
    colors: DEFAULT_SUBJECT_COLORS.engineering,
    priority: 100,
    description: 'Engineering and applied sciences',
    icon: '⚙️'
  }
];

interface BrandingStore {
  // State
  branding: BrandingSystem;
  themeManager: ThemeManagerState & { activeWebsiteId: string | null };
  
  // Website Management
  initializeWebsiteBranding: (websiteId: string) => void;
  getWebsiteBranding: (websiteId: string) => WebsiteBrandingSystem | null;
  
  // Website-scoped Actions
  updateWebsiteBranding: (websiteId: string, colors: Partial<BrandColors>) => void;
  updateWebsiteBreakpoints: (websiteId: string, breakpoints: Partial<WebsiteBreakpoints>) => void;
  addSubject: (websiteId: string, subject: Omit<SubjectBranding, 'id'>) => void;
  updateSubject: (websiteId: string, id: string, updates: Partial<SubjectBranding>) => void;
  deleteSubject: (websiteId: string, id: string) => void;
  addJournal: (websiteId: string, journal: Omit<JournalBranding, 'id'>) => void;
  updateJournal: (websiteId: string, id: string, updates: Partial<JournalBranding>) => void;
  deleteJournal: (websiteId: string, id: string) => void;
  addBookSeries: (websiteId: string, series: Omit<BookSeriesBranding, 'id'>) => void;
  updateBookSeries: (websiteId: string, id: string, updates: Partial<BookSeriesBranding>) => void;
  deleteBookSeries: (websiteId: string, id: string) => void;
  
  // Theme Manager Actions
  setActiveTab: (tab: ThemeManagerState['activeTab']) => void;
  setEditingItem: (id: string | null) => void;
  setPreviewContext: (context: ContentBranding | null) => void;
  setActiveWebsite: (websiteId: string | null) => void;
  
  // Branding Resolution (website-scoped)
  resolveBranding: (websiteId: string, content: ContentBranding) => ResolvedBranding;
  generateCSSClasses: (websiteId: string, content: ContentBranding) => string[];
  generateCSSVariables: (branding: ResolvedBranding) => Record<string, string>;
}

const DEFAULT_JOURNALS: JournalBranding[] = [
  {
    id: nanoid(),
    name: 'Advanced Materials',
    slug: 'advma',
    priority: 1,
    colors: {
      primary: '#dc2626',     // Red-600 (matches CSS --journal-primary)
      secondary: '#fecaca',   // Red-200
      accent: '#991b1b',      // Red-800 (matches CSS --journal-primary-dark)
      text: '#ffffff',        // White text (matches CSS --journal-text)
      background: '#fef2f2'   // Red-50
    },
    description: 'Materials science and engineering journal'
  },
  {
    id: nanoid(),
    name: 'EMBO Journal',
    slug: 'embo',
    priority: 1,
    colors: {
      primary: '#ea580c',     // Orange-600 (matches CSS --journal-primary)
      secondary: '#7c3aed',   // Purple-600 (matches CSS --journal-secondary)
      accent: '#c2410c',      // Orange-700 (matches CSS --journal-primary-dark)
      text: '#ffffff',        // White text (matches CSS --journal-text)
      background: '#fff7ed'   // Orange-50
    },
    description: 'European Molecular Biology Organization journal'
  }
];

const createDefaultWebsiteBranding = (websiteId: string): WebsiteBrandingSystem => ({
  websiteId,
  website: {
    ...DEFAULT_WEBSITE_BRANDING,
    name: `Website ${websiteId}`
  },
  subjects: DEFAULT_SUBJECTS,
  journals: DEFAULT_JOURNALS,
  bookSeries: [],
  rules: {
    subjectsOverrideJournals: true,
    journalsOverrideBookSeries: true,
    allowMultipleSubjects: false,
    fallbackToWebsite: true
  },
  breakpoints: DEFAULT_BREAKPOINTS
});

// Wiley-specific website branding creator
const createWileyWebsiteBranding = (websiteId: string): WebsiteBrandingSystem => ({
  websiteId,
  website: {
    ...WILEY_WEBSITE_BRANDING,
    name: 'Wiley Publishing'
  },
  subjects: DEFAULT_SUBJECTS,
  journals: DEFAULT_JOURNALS,
  bookSeries: [],
  rules: {
    subjectsOverrideJournals: true,
    journalsOverrideBookSeries: true,
    allowMultipleSubjects: false,
    fallbackToWebsite: true
  },
  breakpoints: DEFAULT_BREAKPOINTS
});

// Export theme creators for external use
export { createDefaultWebsiteBranding, createWileyWebsiteBranding };

export const useBrandingStore = create<BrandingStore>((set, get) => ({
  // Initial State
  branding: {
    websites: {}
  },
  
  themeManager: {
    activeTab: 'subjects',
    editingItem: null,
    previewContext: null,
    activeWebsiteId: null
  },

  // Website Management
  initializeWebsiteBranding: (websiteId) =>
    set((state) => ({
      branding: {
        ...state.branding,
        websites: {
          ...state.branding.websites,
          [websiteId]: createDefaultWebsiteBranding(websiteId)
        }
      }
    })),

  getWebsiteBranding: (websiteId) => {
    const state = get();
    return state.branding.websites[websiteId] || null;
  },

  // Website Branding Actions
  updateWebsiteBranding: (websiteId, colors) =>
    set((state) => {
      const websiteBranding = state.branding.websites[websiteId];
      if (!websiteBranding) return state;
      
      return {
        branding: {
          ...state.branding,
          websites: {
            ...state.branding.websites,
            [websiteId]: {
              ...websiteBranding,
              website: {
                ...websiteBranding.website,
                colors: { ...websiteBranding.website.colors, ...colors }
              }
            }
          }
        }
      };
    }),

  updateWebsiteBreakpoints: (websiteId, breakpoints) =>
    set((state) => {
      const websiteBranding = state.branding.websites[websiteId];
      if (!websiteBranding) return state;
      
      return {
        branding: {
          ...state.branding,
          websites: {
            ...state.branding.websites,
            [websiteId]: {
              ...websiteBranding,
              breakpoints: { ...websiteBranding.breakpoints, ...breakpoints }
            }
          }
        }
      };
    }),

  // Subject Actions
  addSubject: (websiteId, subject) =>
    set((state) => {
      const websiteBranding = state.branding.websites[websiteId];
      if (!websiteBranding) return state;
      
      return {
        branding: {
          ...state.branding,
          websites: {
            ...state.branding.websites,
            [websiteId]: {
              ...websiteBranding,
              subjects: [...websiteBranding.subjects, { ...subject, id: nanoid() }]
            }
          }
        }
      };
    }),

  updateSubject: (websiteId, id, updates) =>
    set((state) => {
      const websiteBranding = state.branding.websites[websiteId];
      if (!websiteBranding) return state;
      
      return {
        branding: {
          ...state.branding,
          websites: {
            ...state.branding.websites,
            [websiteId]: {
              ...websiteBranding,
              subjects: websiteBranding.subjects.map((subject) =>
                subject.id === id ? { ...subject, ...updates } : subject
              )
            }
          }
        }
      };
    }),

  deleteSubject: (websiteId, id) =>
    set((state) => {
      const websiteBranding = state.branding.websites[websiteId];
      if (!websiteBranding) return state;
      
      return {
        branding: {
          ...state.branding,
          websites: {
            ...state.branding.websites,
            [websiteId]: {
              ...websiteBranding,
              subjects: websiteBranding.subjects.filter((subject) => subject.id !== id)
            }
          }
        }
      };
    }),

  // Journal Actions
  addJournal: (websiteId, journal) =>
    set((state) => {
      const websiteBranding = state.branding.websites[websiteId];
      if (!websiteBranding) return state;
      
      return {
        branding: {
          ...state.branding,
          websites: {
            ...state.branding.websites,
            [websiteId]: {
              ...websiteBranding,
              journals: [...websiteBranding.journals, { ...journal, id: nanoid() }]
            }
          }
        }
      };
    }),

  updateJournal: (websiteId, id, updates) =>
    set((state) => {
      const websiteBranding = state.branding.websites[websiteId];
      if (!websiteBranding) return state;
      
      return {
        branding: {
          ...state.branding,
          websites: {
            ...state.branding.websites,
            [websiteId]: {
              ...websiteBranding,
              journals: websiteBranding.journals.map((journal) =>
                journal.id === id ? { ...journal, ...updates } : journal
              )
            }
          }
        }
      };
    }),

  deleteJournal: (websiteId, id) =>
    set((state) => {
      const websiteBranding = state.branding.websites[websiteId];
      if (!websiteBranding) return state;
      
      return {
        branding: {
          ...state.branding,
          websites: {
            ...state.branding.websites,
            [websiteId]: {
              ...websiteBranding,
              journals: websiteBranding.journals.filter((journal) => journal.id !== id)
            }
          }
        }
      };
    }),

  // Book Series Actions
  addBookSeries: (websiteId, series) =>
    set((state) => {
      const websiteBranding = state.branding.websites[websiteId];
      if (!websiteBranding) return state;
      
      return {
        branding: {
          ...state.branding,
          websites: {
            ...state.branding.websites,
            [websiteId]: {
              ...websiteBranding,
              bookSeries: [...websiteBranding.bookSeries, { ...series, id: nanoid() }]
            }
          }
        }
      };
    }),

  updateBookSeries: (websiteId, id, updates) =>
    set((state) => {
      const websiteBranding = state.branding.websites[websiteId];
      if (!websiteBranding) return state;
      
      return {
        branding: {
          ...state.branding,
          websites: {
            ...state.branding.websites,
            [websiteId]: {
              ...websiteBranding,
              bookSeries: websiteBranding.bookSeries.map((series) =>
                series.id === id ? { ...series, ...updates } : series
              )
            }
          }
        }
      };
    }),

  deleteBookSeries: (websiteId, id) =>
    set((state) => {
      const websiteBranding = state.branding.websites[websiteId];
      if (!websiteBranding) return state;
      
      return {
        branding: {
          ...state.branding,
          websites: {
            ...state.branding.websites,
            [websiteId]: {
              ...websiteBranding,
              bookSeries: websiteBranding.bookSeries.filter((series) => series.id !== id)
            }
          }
        }
      };
    }),

  // Theme Manager Actions
  setActiveTab: (tab) =>
    set((state) => ({
      themeManager: { ...state.themeManager, activeTab: tab }
    })),

  setEditingItem: (id) =>
    set((state) => ({
      themeManager: { ...state.themeManager, editingItem: id }
    })),

  setPreviewContext: (context) =>
    set((state) => ({
      themeManager: { ...state.themeManager, previewContext: context }
    })),

  setActiveWebsite: (websiteId) =>
    set((state) => ({
      themeManager: { ...state.themeManager, activeWebsiteId: websiteId }
    })),

  // Branding Resolution Logic
  resolveBranding: (websiteId, content) => {
    const { branding } = get();
    const websiteBranding = branding.websites[websiteId];
    
    if (!websiteBranding) {
      // Fallback for unknown website
      return {
        colors: DEFAULT_WEBSITE_BRANDING.colors,
        cssClasses: ['website-brand'],
        source: {
          type: 'website',
          name: 'Default',
          priority: 0
        }
      };
    }
    
    // Subject branding (highest priority)
    if (content.subjects?.length && websiteBranding.rules.subjectsOverrideJournals) {
      const subjectSlug = content.subjects[0];
      const subject = websiteBranding.subjects.find(s => s.slug === subjectSlug);
      if (subject) {
        return {
          colors: subject.colors,
          cssClasses: [`subject-${subject.slug}`, `brand-priority-${subject.priority}`],
          source: {
            type: 'subject',
            name: subject.name,
            priority: subject.priority
          }
        };
      }
    }

    // Journal branding (medium priority)
    if (content.journal && websiteBranding.rules.journalsOverrideBookSeries) {
      const journal = websiteBranding.journals.find(j => j.slug === content.journal);
      if (journal) {
        return {
          colors: journal.colors,
          cssClasses: [`journal-${journal.slug}`, `brand-priority-${journal.priority}`],
          source: {
            type: 'journal',
            name: journal.name,
            priority: journal.priority
          }
        };
      }
    }

    // Book Series branding (lower priority)
    if (content.bookSeries) {
      const series = websiteBranding.bookSeries.find(s => s.slug === content.bookSeries);
      if (series) {
        return {
          colors: series.colors,
          cssClasses: [`series-${series.slug}`, `brand-priority-${series.priority}`],
          source: {
            type: 'bookSeries',
            name: series.name,
            priority: series.priority
          }
        };
      }
    }

    // Fallback to website branding
    return {
      colors: websiteBranding.website.colors,
      cssClasses: ['website-brand'],
      source: {
        type: 'website',
        name: websiteBranding.website.name,
        priority: 0
      }
    };
  },

  generateCSSClasses: (websiteId, content) => {
    const resolved = get().resolveBranding(websiteId, content);
    return resolved.cssClasses;
  },

  generateCSSVariables: (branding) => ({
    '--brand-primary': branding.colors.primary,
    '--brand-secondary': branding.colors.secondary,
    '--brand-accent': branding.colors.accent,
    '--brand-text': branding.colors.text,
    '--brand-background': branding.colors.background
  })
}));
