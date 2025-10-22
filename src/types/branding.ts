// Multi-layered Branding System Types

export interface BrandColors {
  primary: string;      // Main brand color
  secondary: string;    // Lighter shade/complementary
  accent: string;       // Contrast/highlight color  
  text: string;         // Text color on branded backgrounds
  background: string;   // Background tint (very light)
}

export interface WebsiteBranding {
  id: 'website';
  name: string;
  colors: BrandColors;
  isDefault: true;
}

export interface SubjectBranding {
  id: string;
  name: string;
  slug: 'biology' | 'mathematics' | 'chemistry' | 'engineering';
  colors: BrandColors;
  priority: number;
  description?: string;
  icon?: string; // emoji or icon identifier
}

export interface JournalBranding {
  id: string;
  name: string;
  slug: string;
  colors: BrandColors;
  priority: number;
  description?: string;
  logo?: string;
}

export interface BookSeriesBranding {
  id: string;
  name: string;
  slug: string;
  colors: BrandColors;
  priority: number;
  publisher?: string;
  description?: string;
}

export interface BrandingRules {
  subjectsOverrideJournals: boolean;
  journalsOverrideBookSeries: boolean;
  allowMultipleSubjects: boolean;
  fallbackToWebsite: boolean;
}

export interface WebsiteBrandingSystem {
  websiteId: string;
  website: WebsiteBranding;
  subjects: SubjectBranding[];
  journals: JournalBranding[];
  bookSeries: BookSeriesBranding[];
  rules: BrandingRules;
}

// Global branding system - contains all website branding systems
export interface BrandingSystem {
  websites: Record<string, WebsiteBrandingSystem>;
}

// Content categorization for branding application
export interface ContentBranding {
  subjects?: string[];  // Subject slugs
  journal?: string;     // Journal slug
  bookSeries?: string;  // Book series slug
}

// Resolved branding result
export interface ResolvedBranding {
  colors: BrandColors;
  cssClasses: string[];
  source: {
    type: 'website' | 'subject' | 'journal' | 'bookSeries';
    name: string;
    priority: number;
  };
}

// Theme management UI state
export interface ThemeManagerState {
  activeTab: 'website' | 'subjects' | 'journals' | 'bookSeries';
  editingItem: string | null;
  previewContext: ContentBranding | null;
}

// Color picker component props
export interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  className?: string;
}

// Brand item editor props
export interface BrandItemEditorProps {
  item: SubjectBranding | JournalBranding | BookSeriesBranding;
  onSave: (item: any) => void;
  onCancel: () => void;
  onDelete?: (id: string) => void;
}
