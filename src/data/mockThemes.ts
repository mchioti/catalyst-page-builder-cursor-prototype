import type { Theme, TemplateCategory, TemplateStatus } from '../types'
import { PREFAB_SECTIONS } from '../constants/prefabSections'

export const mockThemes: Theme[] = [
    {
      id: 'classic-ux3-theme',
      name: 'Classic',
      description: 'Classic academic publishing theme from AXP 2.0, now upgraded with a proper design system. Features Volkhov and Lato typography, teal brand colors, and traditional scholarly aesthetics. Perfect for established publishers and academic institutions.',
      version: '3.0.0',
      publishingType: 'journals' as const,
      author: 'Atypon Design Team',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2025-01-09'),
      
      // Complete template package for academic publishing
      templates: [
        {
          id: 'journal-home',
          name: 'Journal Home',
          description: 'Homepage template for individual journals with issue listings and journal information',
          category: 'publication' as TemplateCategory,
          status: 'active' as TemplateStatus,
          version: '1.8.0',
          author: 'Wiley Publishing Team',
          createdAt: new Date('2024-02-10'),
          updatedAt: new Date('2024-09-01'),
          tags: ['journal', 'homepage', 'issues', 'metadata'],
          sections: [],
          layout: {
            header: true,
            footer: true,
            sidebar: 'right',
            maxWidth: '1200px',
            spacing: 'comfortable'
          },
          allowedModifications: ['branding.logo', 'colors.primary'],
          lockedElements: ['structure.main', 'navigation.primary'],
          defaultModificationScope: 'Publication (this or all journals)',
          broadenModificationOptions: ['Website (this or all websites that inherit the same theme)'],
          narrowModificationOptions: ['Publication (this or all journals)', 'Topic (all topics or specific)']
        },
        {
          id: 'article-page',
          name: 'Article Page',
          description: 'Individual article display template with full content, metadata, and related articles',
          category: 'publication' as TemplateCategory,
          status: 'active' as TemplateStatus,
          version: '1.9.0',
          author: 'Wiley Publishing Team',
          createdAt: new Date('2024-03-15'),
          updatedAt: new Date('2024-09-18'),
          tags: ['article', 'content', 'metadata', 'related'],
          sections: [],
          layout: {
            header: true,
            footer: true,
            sidebar: 'right',
            maxWidth: '1000px',
            spacing: 'comfortable'
          },
          allowedModifications: ['typography.bodyFont'],
          lockedElements: ['compliance.*', 'structure.*'],
          defaultModificationScope: 'Publication (this or all journals)',
          broadenModificationOptions: ['Website (this or all websites that inherit the same theme)'],
          narrowModificationOptions: ['Publication (this or all journals)', 'Group type (Current, Ahead of Print, Just Accepted)', 'Topic (all topics or specific)']
        },
        {
          id: 'search-results',
          name: 'Search Results',
          description: 'Template for displaying search results with filters and pagination',
          category: 'website' as TemplateCategory,
          status: 'active' as TemplateStatus,
          version: '1.3.0',
          author: 'Wiley Design Team',
          createdAt: new Date('2024-02-15'),
          updatedAt: new Date('2024-08-20'),
          tags: ['search', 'results', 'filters', 'pagination'],
          sections: [],
          layout: {
            header: true,
            footer: true,
            sidebar: 'left',
            maxWidth: '1400px',
            spacing: 'comfortable'
          },
          allowedModifications: [],
          lockedElements: [],
          defaultModificationScope: 'Website (this)',
          broadenModificationOptions: ['Website (this or all websites that inherit the same theme)'],
          narrowModificationOptions: []
        }
      ],
      
      // Layer 1: Foundation Colors (Core Palette from Figma)
      foundation: {
        colors: {
          teal: {
            50: '#f0fafa', 100: '#d9f2f2', 200: '#b3e5e6', 300: '#8cd8d9',
            400: '#66cbcd', 500: '#40bec0', 600: '#339899', 700: '#267273',
            800: '#1a4c4d', 900: '#0f3d3e'
          },
          purple: {
            50: '#f5f3ff', 100: '#ede9fe', 200: '#ddd6fe', 300: '#c4b5fd',
            400: '#a78bfa', 500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9',
            800: '#5b21b6', 900: '#4c1d95'
          },
          red: {
            50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 300: '#fca5a5',
            400: '#f87171', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c',
            800: '#991b1b', 900: '#7f1d1d'
          },
          green: {
            50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac',
            400: '#4ade80', 500: '#22c55e', 600: '#16a34a', 700: '#15803d',
            800: '#166534', 900: '#14532d'
          },
          yellow: {
            50: '#fefce8', 100: '#fef9c3', 200: '#fef08a', 300: '#fde047',
            400: '#facc15', 500: '#eab308', 600: '#ca8a04', 700: '#a16207',
            800: '#854d0e', 900: '#713f12'
          },
          blue: {
            50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd',
            400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8',
            800: '#1e40af', 900: '#1e3a8a'
          },
          gray: {
            50: '#f9fafb', 100: '#f3f4f6', 200: '#e5e7eb', 300: '#d1d5db',
            400: '#9ca3af', 500: '#6b7280', 600: '#4b5563', 700: '#374151',
            800: '#1f2937', 900: '#111827', 950: '#030712'
          }
        },
        typography: {
          families: {
            primary: 'Volkhov, serif',
            secondary: 'Lato, sans-serif'
          },
          weights: { light: 300, regular: 400, bold: 700 },
          sizes: {
            h1: { desktop: '48px', mobile: '36px', lineHeight: '1.2' },
            h2: { desktop: '40px', mobile: '32px', lineHeight: '1.25' },
            h3: { desktop: '32px', mobile: '28px', lineHeight: '1.3' },
            h4: { desktop: '28px', mobile: '24px', lineHeight: '1.35' },
            h5: { desktop: '24px', mobile: '20px', lineHeight: '1.4' },
            h6: { desktop: '20px', mobile: '18px', lineHeight: '1.4' },
            bodyXl: { size: '20px', lineHeight: '32px' },
            bodyLg: { size: '18px', lineHeight: '28px' },
            bodyMd: { size: '16px', lineHeight: '24px' },
            bodySm: { size: '14px', lineHeight: '20px' },
            bodyXs: { size: '12px', lineHeight: '16px' }
          }
        },
        spacing: {
          base: { 0: '0', 1: '8px', 2: '16px', 3: '24px', 4: '32px', 5: '40px', 6: '48px', 7: '56px', 8: '64px', 9: '72px', 10: '80px' },
          semantic: { none: '0', xs: '8px', sm: '16px', md: '24px', lg: '32px', xl: '48px', '2xl': '64px', '3xl': '80px' }
        }
      },
      
      // Layer 2: Semantic Colors (Theme-level mapping)
      semanticColors: {
        interactive: {
          primary: { default: '#339899', hover: '#267273', active: '#1a4c4d' },
          secondary: { default: '#2563eb', hover: '#1d4ed8', active: '#1e40af' },
          accent: { default: '#8b5cf6', hover: '#7c3aed', active: '#6d28d9' }
        },
        surface: {
          background: '#ffffff',
          card: '#ffffff',
          border: '#e5e7eb',
          divider: '#f3f4f6'
        },
        content: {
          primary: '#111827',
          secondary: '#4b5563',
          muted: '#6b7280',
          inverse: '#ffffff',
          link: '#339899',
          linkHover: '#267273'
        },
        feedback: {
          success: '#16a34a',
          warning: '#ca8a04',
          error: '#dc2626',
          info: '#2563eb'
        }
      },
      
      // Legacy flat colors (for backward compatibility)
      colors: {
        primary: '#339899',    // Teal 600 (new brand color from Figma)
        secondary: '#2563eb',  // Blue 600 (legacy)
        accent: '#8b5cf6',     // Purple 500
        background: '#ffffff',
        text: '#111827',       // Gray 900
        muted: '#6b7280'       // Gray 500
      },
      typography: {
        headingFont: 'Volkhov, serif',    // Classic serif for headings
        bodyFont: 'Lato, sans-serif',     // Clean sans-serif for body
        baseSize: '16px',
        scale: 1.25,                       // Major third scale
        
        // Typography styles for semantic CSS classes
        styles: {
          'heading-h1': {
            family: 'primary',
            desktop: { size: '48px', lineHeight: '1.2', letterSpacing: '0', weight: 700 },
            mobile: { size: '36px', lineHeight: '1.2', letterSpacing: '0', weight: 700 }
          },
          'heading-h2': {
            family: 'primary',
            desktop: { size: '40px', lineHeight: '1.25', letterSpacing: '0', weight: 700 },
            mobile: { size: '32px', lineHeight: '1.25', letterSpacing: '0', weight: 700 }
          },
          'heading-h3': {
            family: 'primary',
            desktop: { size: '32px', lineHeight: '1.3', letterSpacing: '0', weight: 700 },
            mobile: { size: '28px', lineHeight: '1.3', letterSpacing: '0', weight: 700 }
          },
          'heading-h4': {
            family: 'primary',
            desktop: { size: '28px', lineHeight: '1.35', letterSpacing: '0', weight: 700 },
            mobile: { size: '24px', lineHeight: '1.35', letterSpacing: '0', weight: 700 }
          },
          'heading-h5': {
            family: 'primary',
            desktop: { size: '24px', lineHeight: '1.4', letterSpacing: '0', weight: 700 },
            mobile: { size: '20px', lineHeight: '1.4', letterSpacing: '0', weight: 700 }
          },
          'heading-h6': {
            family: 'primary',
            desktop: { size: '20px', lineHeight: '1.4', letterSpacing: '0', weight: 700 },
            mobile: { size: '18px', lineHeight: '1.4', letterSpacing: '0', weight: 700 }
          },
          'body-lg': {
            family: 'secondary',
            desktop: { size: '20px', lineHeight: '32px', letterSpacing: '0', weight: 400 },
            mobile: { size: '18px', lineHeight: '28px', letterSpacing: '0', weight: 400 }
          },
          'body-md': {
            family: 'secondary',
            desktop: { size: '16px', lineHeight: '24px', letterSpacing: '0', weight: 400 },
            mobile: { size: '16px', lineHeight: '24px', letterSpacing: '0', weight: 400 }
          },
          'body-sm': {
            family: 'secondary',
            desktop: { size: '14px', lineHeight: '20px', letterSpacing: '0', weight: 400 },
            mobile: { size: '14px', lineHeight: '20px', letterSpacing: '0', weight: 400 }
          }
        },
        
        semantic: {
          primary: 'Volkhov, serif',
          secondary: 'Lato, sans-serif'
        }
      },
      spacing: {
        base: '8px',
        scale: 1
      },
      components: {
        button: {
          borderRadius: '2px',  // Figma spec: 2px for Classic UX3
          fontWeight: '500',
          transition: 'all 0.2s'
        },
        card: {
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        },
        form: {
          borderRadius: '4px',
          border: '1px solid #d1d5db',
          focusColor: '#0066cc'
        }
      },
      
      // Classic UX3: Maximum flexibility for digital-first design (config-level modifications only)
      modificationRules: {
        colors: {
          canModifyPrimary: true,
          canModifySecondary: true,
          canModifyAccent: true,
          canModifyBackground: true,
          canModifyText: false, // Text color locked to maintain readability
          canModifyMuted: true
        },
        typography: {
          canModifyHeadingFont: true,
          canModifyBodyFont: true,
          canModifyBaseSize: true,
          canModifyScale: true
        },
        spacing: {
          canModifyBase: true,
          canModifyScale: true
        },
        components: {
          canModifyButtonRadius: true, // Classic UX3 allows border radius changes
          canModifyButtonWeight: true,
          canModifyCardRadius: true,
          canModifyCardShadow: true,
          canModifyFormRadius: true
        }
      },
      
      globalSections: {
        header: PREFAB_SECTIONS['header-section'] as any,
        footer: PREFAB_SECTIONS['footer-section'] as any
      },
      publicationCardVariants: []
    },
    
    {
      id: 'wiley-figma-ds-v2',
      name: 'Wiley',
      description: 'Complete Figma design system with 3-layer token architecture (Foundation → Semantic → Overrides). Comprehensive MCP extraction: 88 core colors, 159 semantic colors, multi-brand support (Wiley/WT/Dummies), 5-color button system, and polished prefab sections.',
      version: '2.1.0',
      publishingType: 'journals' as const,
      author: 'Wiley Design Team (Systematic Extraction)',
      createdAt: new Date('2025-11-05'),
      updatedAt: new Date('2025-11-05'),
      
      templates: [
        {
          id: 'wiley-ds-v2-home',
          name: 'DS V2 Homepage',
          description: 'Foundation template with essential components',
          category: 'website' as TemplateCategory,
          status: 'active' as TemplateStatus,
          version: '2.0.0',
          author: 'Wiley Design Team',
          createdAt: new Date('2025-11-05'),
          updatedAt: new Date('2025-11-05'),
          tags: ['homepage', 'figma', 'ds-v2', 'multi-brand', 'journals'],
          sections: [],
          layout: {
            header: true,
            footer: true,
            sidebar: 'none',
            maxWidth: '1400px',
            spacing: 'comfortable'
          },
          allowedModifications: ['branding.logo', 'branding.colors'],
          lockedElements: [],
          defaultModificationScope: 'Website (this)',
          broadenModificationOptions: ['Website (this or all websites that inherit the same theme)'],
          narrowModificationOptions: []
        }
      ],
      
      colors: {
        /* ========================================================================
           🎨 3-LAYER TOKEN ARCHITECTURE
           ========================================================================
           
           This theme demonstrates the proper Design System → Theme architecture:
           
           LAYER 1: FOUNDATION TOKENS (defined below as `foundation`)
           - Raw color ramps (neutral 0-900, primaryData 100-600, etc.)
           - Multi-brand support (wiley/wt/dummies modes)
           - 88 core color variables extracted from Figma
           - Single source of truth for all color values
           
           LAYER 2: SEMANTIC TOKENS (defined as `semanticColors`)
           - Maps foundation tokens to semantic roles
           - Context-aware (light/dark variants for different backgrounds)
           - Examples: "interactive-primary", "text-primary", "surface-background"
           - Components consume these, NOT Layer 1 directly
           
           LAYER 3: LOCAL OVERRIDES (Page Builder capability)
           - Individual element overrides (e.g., one button = #FF00FF)
           - Bypasses semantic system for ultimate flexibility
           - Applied via Properties Panel inline styles
           
           Benefits:
           ✅ Change foundation → semantic updates automatically
           ✅ Switch brands (wiley→wt→dummies) at runtime
           ✅ Clear token lineage and maintainability
           ✅ Engineering team sees proper architecture
           
           ======================================================================== */
        
        // Legacy flat colors (backward compatibility - will be deprecated)
        primary: '#00d875',       // Wiley green (light variant - default)
        secondary: '#f2f2eb',     // Light cream
        accent: '#008f8a',        // Teal accent
        background: '#ffffff',
        text: '#5d5e5c',
        muted: '#5d5e5c',
        
        // 🎨 LAYER 2: SEMANTIC COLOR SYSTEM
        // Maps foundation tokens to semantic roles with context awareness
        // "light" variants = bright colors for DARK backgrounds
        // "dark" variants = muted colors for LIGHT backgrounds
        semanticColors: {
          // PRIMARY: Main interactive color (buttons, links, CTAs)
          // Maps to: foundation.primaryData (bright green) + primaryHeritage (teal)
          primary: {
            light: 'foundation.primaryData.600',
            dark: 'foundation.primaryHeritage.600',
            hover: {
              light: 'foundation.primaryData.400',
              dark: 'foundation.primaryHeritage.400'  // Lighter heritage for hover on light backgrounds
            }
          },
          // SECONDARY: Alternate action color (Figma Brand 2)
          // Maps to: foundation.paper (cream bg) + primaryHeritage (dark teal text)
          secondary: {
            bg: {
              light: 'foundation.paper.100',
              dark: 'foundation.paper.100'
            },
            text: {
              light: 'foundation.primaryHeritage.900',
              dark: 'foundation.primaryHeritage.900'
            },
            hover: {
              bg: {
                light: 'foundation.neutral.0',
                dark: 'foundation.neutral.0'
              },
              text: {
                light: 'foundation.primaryHeritage.900',
                dark: 'foundation.primaryHeritage.900'
              }
            }
          },
          // TERTIARY: Strong accent color (Figma Brand 3)
          // Maps to: foundation.primaryHeritage[900] (dark teal solid)
          tertiary: {
            bg: {
              light: 'foundation.primaryHeritage.900',
              dark: 'foundation.primaryHeritage.900'
            },
            text: {
              light: 'foundation.neutral.0',
              dark: 'foundation.neutral.0'
            },
            hover: {
              bg: {
                light: '#005662',  // Derived: lightened version of heritage.900
                dark: '#005662'
              },
              text: {
                light: 'foundation.neutral.0',
                dark: 'foundation.neutral.0'
              }
            }
          },
          // NEUTRAL DARK: Subdued button style (color4)
          // Maps to: foundation.neutral (beige/black) - context-aware
          neutralDark: {
            bg: {
              light: '#d4d2cf',    // Derived: approximate neutral.300
              dark: 'foundation.neutral.900.wiley'
            },
            text: {
              light: 'foundation.neutral.900.wiley',
              dark: 'foundation.neutral.0.wiley'
            },
            hover: {
              bg: {
                light: '#c4c2bf',  // Derived: darkened
                dark: 'foundation.neutral.700.wiley'
              },
              text: {
                light: 'foundation.neutral.900.wiley',
                dark: 'foundation.neutral.0.wiley'
              }
            }
          },
          // NEUTRAL LIGHT: Lightest button style (color5)
          // Maps to: foundation.neutral (white/grey) - context-aware
          neutralLight: {
            bg: {
              light: 'foundation.neutral.0.wiley',
              dark: 'foundation.neutral.700.wiley'
            },
            text: {
              light: 'foundation.neutral.900.wiley',
              dark: 'foundation.neutral.0.wiley'
            },
            hover: {
              bg: {
                light: 'foundation.neutral.100.wiley',
                dark: '#6d6e6c'  // Derived: lightened
              },
              text: {
                light: 'foundation.neutral.900.wiley',
                dark: 'foundation.neutral.0.wiley'
              }
            }
          }
        },
        
        // Multi-Brand Journal Theme Presets (Layer 2 → Layer 1 mapping)
        // Each brand maps to its corresponding foundation.*.{brand} values
        journalThemes: {
          wiley: {
            name: 'Wiley (Green)',
            primary: '#00d875',        // → foundation.primaryData[600].wiley
            primaryLight: '#bff5dd',   // → foundation.primaryData[100].wiley
            primaryHover: '#60e7a9',   // → foundation.primaryData[400].wiley
            accent: '#008f8a',         // → foundation.primaryHeritage[600].wiley
            accentDark: '#003b44',     // → foundation.primaryHeritage[900].wiley
            background: '#f2f2eb',     // → foundation.paper[100].wiley
            text: '#5d5e5c'            // → foundation.neutral[700].wiley
          },
          wt: {
            name: 'WT (Olive)',
            primary: '#3c711a',        // → foundation.primaryData[600].wt
            primaryLight: '#f3fce9',   // → foundation.primaryData[100].wt (approximate)
            primaryHover: '#68b929',   // → foundation.primaryData[400].wt
            accent: '#448874',         // → foundation.primaryHeritage[600].wt
            accentDark: '#10231e',     // → foundation.primaryHeritage[900].wt
            background: '#ffffff',     // → foundation.paper[100].wt
            text: '#313131'            // → foundation.neutral[700].wt
          },
          dummies: {
            name: 'Dummies (Gold)',
            primary: '#74520f',        // → foundation.primaryData[600].dummies
            primaryLight: '#f7ffc1',   // → foundation.primaryData[100].dummies
            primaryHover: '#a68202',   // → foundation.primaryHeritage[600].dummies
            accent: '#75dbff',         // → foundation.secondaryData[100].dummies (approximate)
            accentDark: '#065074',     // → Derived dark variant
            background: '#ffffff',     // → foundation.paper[100].dummies
            text: '#313131'            // → foundation.neutral[700].dummies
          }
        },
        
        // 🎨 LAYER 1: FOUNDATION TOKENS (Complete extraction from Figma via MCP)
        // Full color ramps with 3-brand support (Wiley/WT/Dummies modes)
        foundation: {
          // Neutral scale (pure functional colors) - 88 core color variables
          neutral: {
            0: { wiley: '#FFFFFF', wt: '#FFFFFF', dummies: '#FFFFFF' },
            50: { wiley: '#FFFFFF', wt: '#FFFFFF', dummies: '#FFFFFF' },
            100: { wiley: '#FFFFEE', wt: '#FFFFFF', dummies: '#FFFFFF' },
            200: { wiley: '#EEEEEE', wt: '#EEEEEE', dummies: '#EEEEEE' },
            300: { wiley: '#DDDDCC', wt: '#DDDDDD', dummies: '#DDDDDD' },
            400: { wiley: '#CCCCCC', wt: '#AAAAAA', dummies: '#AAAAAA' },
            500: { wiley: '#AAAAAA', wt: '#888888', dummies: '#888888' },
            600: { wiley: '#888888', wt: '#555555', dummies: '#555555' },
            700: { wiley: '#5D5E5C', wt: '#313131', dummies: '#313131' },
            800: { wiley: '#303030', wt: '#212121', dummies: '#212121' },
            900: { wiley: '#000000', wt: '#141414', dummies: '#141414' }
          },
          // Primary Data scale (bright greens/teals - main brand colors)
          primaryData: {
            100: { wiley: '#BFF5DD', wt: '#F3FCEC', dummies: '#F7FFCE' },
            200: { wiley: '#9FEBCD', wt: '#CAF4F0', dummies: '#F7FFCE' },
            300: { wiley: '#80E1BE', wt: '#AFECDD', dummies: '#FFAC98' },
            400: { wiley: '#60E7A9', wt: '#68B929', dummies: '#A67108' },
            500: { wiley: '#40D288', wt: '#FFFFFF', dummies: '#FFFFFF' },
            600: { wiley: '#00D875', wt: '#3C711A', dummies: '#74520F' }
          },
          // Primary Heritage scale (teal/heritage - accent colors)
          primaryHeritage: {
            400: { wiley: '#00BF8B', wt: '#87A69F', dummies: '#DEAF6F' },
            600: { wiley: '#008F8A', wt: '#448874', dummies: '#A68202' },
            900: { wiley: '#003B44', wt: '#10231E', dummies: '#231A07' }
          },
          // Secondary Data scale (complementary colors)
          secondaryData: {
            100: { wiley: '#C1F4FF', wt: '#FFFFED', dummies: '#FEF0C8' },
            600: { wiley: '#00A4CC', wt: '#D3C207', dummies: '#F59E0B' }
          },
          // Paper scale (backgrounds)
          paper: {
            100: { wiley: '#F2F2EB', wt: '#FFFFFF', dummies: '#FFFFFF' }
          }
        }
      },
      
      typography: {
        /* ========================================================================
           📝 3-LAYER TYPOGRAPHY ARCHITECTURE (From Figma DS)
           ========================================================================
           
           LAYER 1: FOUNDATION FONTS
           - Inter: Primary sans-serif (body, headings, UI, buttons)
           - IBM Plex Mono: Secondary monospace (code, technical emphasis)
           
           LAYER 2: SEMANTIC MAPPING (Universal across all brands)
           - font-primary → Inter (Wiley, WT, Dummies all use Inter)
           - font-secondary → IBM Plex Mono (universal for code/emphasis)
           
           LAYER 3: TEXT STYLES (Responsive desktop + mobile)
           - Headings: h1-h6 (h5-h6 = h4 base with allowSmaller)
           - Body: xs, sm, md, lg, xl
           - Components: button (sm, lg), menu
        ======================================================================== */
        
        // Foundation fonts from Design System
        foundation: {
          sans: 'Inter, system-ui, -apple-system, sans-serif',
          mono: 'IBM Plex Mono, Courier New, monospace'
        },
        
        // Semantic mapping (same for all brands)
        semantic: {
          primary: 'Inter, system-ui, -apple-system, sans-serif',   // Body, headings, UI
          secondary: 'IBM Plex Mono, Courier New, monospace'       // Code, emphasis
        },
        
        // Legacy properties (for backward compatibility)
        headingFont: 'Inter, system-ui, -apple-system, sans-serif',
        bodyFont: 'Inter, system-ui, -apple-system, sans-serif',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        baseSize: '16px',
        scale: 1.333,
        
        // Font weights
        weights: {
          light: 300,
          regular: 400,
          medium: 500,
          semibold: 600,
          bold: 700
        },
        
        // Complete text styles from Figma (responsive: desktop + mobile)
        styles: {
          // HEADINGS (h1-h4 from Figma, h5-h6 inherit h4)
          'heading-h1': {
            family: 'primary',
            desktop: { size: '80px', lineHeight: '96px', letterSpacing: '-1.6px', weight: 700 },
            mobile: { size: '48px', lineHeight: '56px', letterSpacing: '-0.96px', weight: 700 }
          },
          'heading-h2': {
            family: 'primary',
            desktop: { size: '48px', lineHeight: '64px', letterSpacing: '-0.96px', weight: 700 },
            mobile: { size: '32px', lineHeight: '40px', letterSpacing: '-0.64px', weight: 700 }
          },
          'heading-h3': {
            family: 'primary',
            desktop: { size: '32px', lineHeight: '40px', letterSpacing: '-0.64px', weight: 600 },
            mobile: { size: '24px', lineHeight: '32px', letterSpacing: '-0.48px', weight: 600 }
          },
          'heading-h4': {
            family: 'primary',
            desktop: { size: '24px', lineHeight: '32px', letterSpacing: '-0.48px', weight: 600 },
            mobile: { size: '20px', lineHeight: '28px', letterSpacing: '-0.4px', weight: 600 }
          },
          'heading-h5': {
            family: 'primary',
            baseOn: 'heading-h4',
            allowSmaller: true, // Can be manually set smaller than h4
            desktop: { size: '20px', lineHeight: '28px', letterSpacing: '-0.4px', weight: 600 },
            mobile: { size: '18px', lineHeight: '24px', letterSpacing: '-0.36px', weight: 600 }
          },
          'heading-h6': {
            family: 'primary',
            baseOn: 'heading-h4',
            allowSmaller: true, // Can be manually set smaller than h4
            desktop: { size: '18px', lineHeight: '24px', letterSpacing: '-0.36px', weight: 600 },
            mobile: { size: '16px', lineHeight: '24px', letterSpacing: '-0.32px', weight: 600 }
          },
          
          // BODY TEXT (xs-xl)
          'body-xl': {
            family: 'primary',
            desktop: { size: '24px', lineHeight: '32px', letterSpacing: '-0.48px', weight: 400 },
            mobile: { size: '20px', lineHeight: '28px', letterSpacing: '-0.4px', weight: 400 }
          },
          'body-lg': {
            family: 'primary',
            desktop: { size: '18px', lineHeight: '28px', letterSpacing: '-0.36px', weight: 400 },
            mobile: { size: '18px', lineHeight: '28px', letterSpacing: '-0.36px', weight: 400 }
          },
          'body-md': {
            family: 'primary',
            desktop: { size: '16px', lineHeight: '24px', letterSpacing: '-0.32px', weight: 400 },
            mobile: { size: '16px', lineHeight: '24px', letterSpacing: '-0.32px', weight: 400 }
          },
          'body-sm': {
            family: 'primary',
            desktop: { size: '14px', lineHeight: '24px', letterSpacing: '-0.28px', weight: 400 },
            mobile: { size: '14px', lineHeight: '20px', letterSpacing: '-0.28px', weight: 400 }
          },
          'body-xs': {
            family: 'primary',
            desktop: { size: '12px', lineHeight: '20px', letterSpacing: '-0.24px', weight: 400 },
            mobile: { size: '12px', lineHeight: '20px', letterSpacing: '-0.24px', weight: 400 }
          },
          
          // CODE/MONO (Uses IBM Plex Mono - secondary font)
          'code-mono': {
            family: 'secondary',
            desktop: { size: '14px', lineHeight: '24px', letterSpacing: '0px', weight: 400 },
            mobile: { size: '14px', lineHeight: '24px', letterSpacing: '0px', weight: 400 }
          },
          
          // BUTTONS
          'button-lg': {
            family: 'primary',
            desktop: { size: '16px', lineHeight: '24px', letterSpacing: '1.6px', weight: 500, transform: 'uppercase' },
            mobile: { size: '16px', lineHeight: '24px', letterSpacing: '1.6px', weight: 500, transform: 'uppercase' }
          },
          'button-sm': {
            family: 'primary',
            desktop: { size: '14px', lineHeight: '16px', letterSpacing: '1.4px', weight: 500, transform: 'uppercase' },
            mobile: { size: '14px', lineHeight: '16px', letterSpacing: '1.4px', weight: 500, transform: 'uppercase' }
          },
          
          // MENU (LOW PRIORITY - basic spec for now)
          'menu-item': {
            family: 'primary',
            desktop: { size: '16px', lineHeight: '24px', letterSpacing: '0px', weight: 400 },
            mobile: { size: '16px', lineHeight: '24px', letterSpacing: '0px', weight: 400 }
          }
        },
        
        // Legacy desktop/mobile structure (for backward compatibility)
        desktop: {
          body: {
            xs: { size: '12px', lineHeight: '20px', letterSpacing: '-0.24px' },
            sm: { size: '14px', lineHeight: '24px', letterSpacing: '-0.28px' },
            md: { size: '16px', lineHeight: '24px', letterSpacing: '-0.32px' },
            lg: { size: '18px', lineHeight: '28px', letterSpacing: '-0.36px' },
            xl: { size: '24px', lineHeight: '32px', letterSpacing: '-0.48px' }
          },
          heading: {
            sm: { size: '24px', lineHeight: '32px', letterSpacing: '-0.48px' },
            md: { size: '32px', lineHeight: '40px', letterSpacing: '-0.64px' },
            lg: { size: '48px', lineHeight: '64px', letterSpacing: '-0.96px' },
            xl: { size: '80px', lineHeight: '96px', letterSpacing: '-1.6px' }
          }
        },
        mobile: {
          body: {
            xs: { size: '12px', lineHeight: '20px', letterSpacing: '-0.24px' },
            sm: { size: '14px', lineHeight: '20px', letterSpacing: '-0.28px' },
            md: { size: '16px', lineHeight: '24px', letterSpacing: '-0.32px' },
            lg: { size: '18px', lineHeight: '28px', letterSpacing: '-0.36px' },
            xl: { size: '20px', lineHeight: '28px', letterSpacing: '-0.4px' }
          },
          heading: {
            sm: { size: '20px', lineHeight: '28px', letterSpacing: '-0.4px' },
            md: { size: '24px', lineHeight: '32px', letterSpacing: '-0.48px' },
            lg: { size: '32px', lineHeight: '40px', letterSpacing: '-0.64px' },
            xl: { size: '48px', lineHeight: '56px', letterSpacing: '-0.96px' }
          }
        },
        
        // Component-specific typography
        components: {
          button: {
            sm: { size: '14px', lineHeight: '16px', letterSpacing: '1.4px', weight: 500 },
            lg: { size: '16px', lineHeight: '24px', letterSpacing: '1.6px', weight: 500 }
          }
        }
      },
      
      spacing: {
        /* ========================================================================
           📏 SPACING & LAYOUT TOKENS (From Figma DS)
           ========================================================================
           
           LAYER 1: BASE TOKENS (Foundation)
           - Base-4 spacing scale: 0px, 4px, 8px, 12px, 16px, ..., 84px
           - Single source of truth for all spacing values
           
           LAYER 2: SEMANTIC TOKENS
           - Semantic spacing: none, xs, sm, md, lg, xl, 2xl, 3xl
           - Corner radius: none, xs, sm, md, lg
           
           Applied to: Section padding, widget gaps, button/card border-radius
        ======================================================================== */
        
        // BASE TOKENS (Foundation Layer) - Base-4 scale
        base: {
          0: '0px',      // base-0
          1: '4px',      // base-1
          2: '8px',      // base-2
          3: '12px',     // base-3
          4: '16px',     // base-4
          5: '20px',     // base-5
          6: '24px',     // base-6
          7: '28px',     // base-7
          8: '32px',     // base-8
          9: '36px',     // base-9
          10: '40px',    // base-10
          11: '44px',    // base-11
          12: '48px',    // base-12
          13: '52px',    // base-13
          14: '56px',    // base-14
          15: '60px',    // base-15
          16: '64px',    // base-16
          17: '68px',    // base-17
          18: '72px',    // base-18
          19: '76px',    // base-19
          20: '80px',    // base-20
          21: '84px'     // base-21
        },
        
        // SEMANTIC TOKENS (Layer 2) - Spacing
        semantic: {
          none: '0px',       // base-0
          xs: '4px',         // base-1
          sm: '8px',         // base-2
          md: '16px',        // base-4
          lg: '24px',        // base-6
          xl: '32px',        // base-8
          '2xl': '40px',     // base-10
          '3xl': '64px'      // base-16
        },
        
        // CORNER RADIUS TOKENS
        radius: {
          none: '0px',       // base-0
          xs: '4px',         // base-1
          sm: '8px',         // base-2
          md: '16px',        // base-4
          lg: '28px'         // base-7
        },
        
        // GRID SYSTEM TOKENS (From Figma DS)
        grid: {
          // Container max-widths for different breakpoints
          container: {
            sm: '640px',      // Mobile/Small tablet
            md: '768px',      // Tablet
            lg: '1024px',     // Desktop small
            xl: '1280px',     // Desktop large
            '2xl': '1536px',  // Wide desktop
            full: '100%'      // Full width
          },
          
          // Column counts for responsive layouts
          columns: {
            mobile: 4,        // 4-column grid on mobile
            tablet: 8,        // 8-column grid on tablet
            desktop: 12       // 12-column grid on desktop
          },
          
          // Gutter sizes (space between columns)
          gutter: {
            mobile: '16px',   // base-4
            tablet: '24px',   // base-6
            desktop: '32px'   // base-8
          },
          
          // Breakpoints for media queries
          breakpoints: {
            sm: '640px',      // Mobile → Tablet
            md: '768px',      // Tablet → Desktop Small
            lg: '1024px',     // Desktop Small → Desktop Large
            xl: '1280px',     // Desktop Large → Wide
            '2xl': '1536px'   // Wide and above
          }
        }
      },
      
      // TYPOGRAPHY SYSTEM - Brand-specific fonts and letter spacing
      typography: {
        // Default (fallback)
        headingFont: 'Inter, sans-serif',
        bodyFont: '"Open Sans", sans-serif',
        baseSize: '16px',
        scale: 1.25,
        
        // BRAND-SPECIFIC TYPOGRAPHY (from Figma DS)
        // Each brand has distinct personality through font choices
        wiley: {
          headingFont: 'Inter, sans-serif',               // Modern sans-serif
          bodyFont: '"Open Sans", sans-serif',            // Clean, readable
          buttonFont: '"IBM Plex Mono", monospace',       // Technical feel
          letterSpacing: {
            heading: '-0.02em',     // Tight, modern (negative spacing)
            body: '-2',             // Condensed body text
            button: '1'             // Wide button text (10% in Figma)
          },
          weights: {
            light: '300',
            regular: '400',
            semibold: '600',
            bold: '700'
          }
        },
        wt: {
          headingFont: '"Noto Serif", serif',             // Classic serif (WT's signature)
          bodyFont: '"Open Sans", sans-serif',            // Same body as Wiley
          buttonFont: '"IBM Plex Mono", monospace',       // Same button as Wiley
          letterSpacing: {
            heading: '0',           // Normal spacing for serif
            body: '0',              // Normal body spacing
            button: '0'             // Normal button spacing
          },
          weights: {
            // WT uses CONDENSED weights (distinct personality)
            light: 'ExtraCondensed Light',
            regular: 'ExtraCondensed',
            medium: 'ExtraCondensed Medium',
            bold: 'ExtraCondensed Bold'
          }
        },
        dummies: {
          headingFont: '"Open Sans", sans-serif',         // Friendly sans (all Open Sans)
          bodyFont: '"Open Sans", sans-serif',            // Same font for consistency
          buttonFont: '"IBM Plex Mono", monospace',       // Same button as Wiley
          letterSpacing: {
            heading: '0',           // Normal spacing
            body: '0',              // Normal body spacing
            button: '0'             // Normal button spacing
          },
          weights: {
            light: '300',
            regular: '400',
            semibold: '600',
            bold: '700'
          }
        },
        
        // Typography styles for semantic CSS classes
        // These use 'primary' font family which resolves to brand-specific heading font
        styles: {
          h1: {
            fontSize: '48px',
            fontSizeMobile: '36px',
            fontWeight: 700,
            lineHeight: 1.2,
            letterSpacing: '0'  // Will be overridden by brand letterSpacing
          },
          h2: {
            fontSize: '36px',
            fontSizeMobile: '28px',
            fontWeight: 700,
            lineHeight: 1.3,
            letterSpacing: '0'
          },
          h3: {
            fontSize: '28px',
            fontSizeMobile: '24px',
            fontWeight: 600,
            lineHeight: 1.4,
            letterSpacing: '0'
          },
          h4: {
            fontSize: '24px',
            fontSizeMobile: '20px',
            fontWeight: 600,
            lineHeight: 1.4,
            letterSpacing: '0'
          },
          h5: {
            fontSize: '20px',
            fontSizeMobile: '18px',
            fontWeight: 600,
            lineHeight: 1.5,
            letterSpacing: '0'
          },
          h6: {
            fontSize: '16px',
            fontSizeMobile: '16px',
            fontWeight: 600,
            lineHeight: 1.5,
            letterSpacing: '0'
          },
          bodyXL: {
            fontSize: '24px',
            fontSizeMobile: '20px',
            lineHeight: 1.5,
            letterSpacing: '0'
          },
          bodyLG: {
            fontSize: '20px',
            fontSizeMobile: '18px',
            lineHeight: 1.5,
            letterSpacing: '0'
          },
          body: {
            fontSize: '16px',
            fontSizeMobile: '16px',
            lineHeight: 1.5,
            letterSpacing: '0'
          },
          bodySM: {
            fontSize: '14px',
            fontSizeMobile: '14px',
            lineHeight: 1.5,
            letterSpacing: '0'
          },
          bodyXS: {
            fontSize: '12px',
            fontSizeMobile: '12px',
            lineHeight: 1.4,
            letterSpacing: '0'
          }
        }
      },
      
      components: {
        button: {
          borderRadius: 'radius.sm',  // 8px - Uses semantic token
          fontWeight: '500',
          textTransform: 'none',
          fontSize: '16px',
          letterSpacing: '1.6px',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          padding: {
            small: 'semantic.sm',      // 8px
            medium: 'semantic.md',     // 16px
            large: 'semantic.lg'       // 24px
          }
        },
        card: {
          // Content Card specs from Figma
          borderRadius: 'radius.sm',   // 8px - Uses semantic token
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(0, 0, 0, 0.1)',
          padding: 'semantic.lg',      // 24px - Uses semantic token
          layout: 'vertical-left',
          spacing: 'small',
          variants: {
            contentCard: {
              width: '375px',
              minHeight: '800px',
              layout: 'vertical',
              innerPadding: true,
              spacing: '16px'
            },
            productCard: {
              // To be extracted
            },
            journalCard: {
              // To be extracted
            }
          }
        },
        form: {
          borderRadius: '6px',
          border: '1px solid #ADACA8',
          focusColor: '#00d875'
        }
      },
      
      modificationRules: {
        colors: {
          canModifyPrimary: true,
          canModifySecondary: true,
          canModifyAccent: true,
          canModifyBackground: true,
          canModifyText: false,
          canModifyMuted: true,
          canSelectJournalPreset: true  // NEW: Can select from Wiley/WT/Dummies
        },
        typography: {
          canModifyHeadingFont: false,
          canModifyBodyFont: false,
          canModifyBaseSize: true,
          canModifyScale: true
        },
        spacing: {
          canModifyBase: true,
          canModifyScale: true
        },
        components: {
          canModifyButtonRadius: true,
          canModifyButtonWeight: true,
          canModifyCardRadius: true,
          canModifyCardShadow: true,
          canModifyFormRadius: true
        }
      },
      
      globalSections: {
        header: PREFAB_SECTIONS['header-section'] as any,
        footer: PREFAB_SECTIONS['footer-section'] as any
      },
      publicationCardVariants: []
    },
    
    {
      id: 'ibm-carbon-ds',
      name: 'IBM (carbon)',
      description: 'IBM Carbon Design System v11 - Enterprise design with structured layers and comprehensive button system',
      version: '11.0.0',
      publishingType: 'journals' as const,
      author: 'IBM Design Team (Carbon DS)',
      createdAt: new Date('2025-11-06'),
      updatedAt: new Date('2025-11-06'),
      
      templates: [
        {
          id: 'carbon-ds-home',
          name: 'Carbon DS Homepage',
          description: 'Enterprise design with IBM Carbon styling',
          category: 'website' as TemplateCategory,
          status: 'active' as TemplateStatus,
          version: '11.0.0',
          author: 'IBM Design Team',
          createdAt: new Date('2025-11-06'),
          updatedAt: new Date('2025-11-06'),
          tags: ['homepage', 'carbon', 'enterprise', 'ibm'],
          sections: [],
          layout: {
            header: true,
            footer: true,
            sidebar: 'none',
            maxWidth: '1400px',
            spacing: 'comfortable'
          },
          allowedModifications: ['branding.logo', 'branding.colors'],
          lockedElements: [],
          defaultModificationScope: 'Website (this)',
          broadenModificationOptions: ['Website (this or all websites that inherit the same theme)'],
          narrowModificationOptions: []
        }
      ],
      
      colors: {
        // Base colors (IBM Blue + Grey)
        primary: '#0f62fe',       // IBM Blue
        secondary: '#393939',     // Carbon Grey
        accent: '#0f62fe',        // IBM Blue (same as primary)
        background: '#ffffff',    // White theme
        text: '#161616',          // Carbon Black
        muted: '#525252',         // Carbon Grey 70
        
        // IBM Carbon Semantic Colors (5 button styles)
        // Official Carbon Design System button hierarchy
        semanticColors: {
          // color1 = PRIMARY (IBM Blue solid button)
          primary: {
            light: '#0f62fe',     // IBM Blue 60
            dark: '#0f62fe',      // Same in both contexts
            hover: {
              light: '#0353e9',   // IBM Blue 60 hover
              dark: '#0353e9'
            }
          },
          // color2 = SECONDARY (Dark grey solid button)
          secondary: {
            bg: {
              light: '#393939',   // Carbon Grey 80
              dark: '#393939'
            },
            text: {
              light: '#ffffff',   // White text
              dark: '#ffffff'
            },
            hover: {
              bg: {
                light: '#474747',  // Carbon Grey 70 hover
                dark: '#474747'
              },
              text: {
                light: '#ffffff',
                dark: '#ffffff'
              }
            }
          },
          // color3 = TERTIARY (Transparent, no border, just IBM Blue text)
          tertiary: {
            bg: {
              light: 'transparent',   // No background
              dark: 'transparent'
            },
            text: {
              light: '#0f62fe',   // IBM Blue text
              dark: '#0f62fe'
            },
            hover: {
              bg: {
                light: '#e8e8e8',  // Carbon Grey 10 hover
                dark: '#e8e8e8'
              },
              text: {
                light: '#0043ce',  // IBM Blue 70 (darker on hover)
                dark: '#0043ce'
              }
            }
          },
          // color4 = DANGER (Red solid button)
          neutralDark: {
            bg: {
              light: '#da1e28',   // Carbon Red 60 (Danger Primary)
              dark: '#da1e28'
            },
            text: {
              light: '#ffffff',
              dark: '#ffffff'
            },
            hover: {
              bg: {
                light: '#ba1b23',  // Carbon Red 70 hover
                dark: '#ba1b23'
              },
              text: {
                light: '#ffffff',
                dark: '#ffffff'
              }
            }
          },
          // color5 = GHOST (Transparent with IBM Blue border + text)
          neutralLight: {
            bg: {
              light: 'transparent',
              dark: 'transparent'
            },
            text: {
              light: '#0f62fe',   // IBM Blue text
              dark: '#0f62fe'
            },
            hover: {
              bg: {
                light: '#e8e8e8',  // Carbon Grey 10 hover
                dark: '#e8e8e8'
              },
              text: {
                light: '#0043ce',  // IBM Blue 70 (darker on hover)
                dark: '#0043ce'
              }
            }
          }
        },
        
        // Carbon Layer System
        layers: {
          background: '#ffffff',
          layer01: '#f4f4f4',   // Carbon Grey 10
          layer02: '#ffffff',   // Back to white
          layer03: '#f4f4f4'    // Grey again
        },
        
        // Text Hierarchy (Carbon's explicit system)
        textColors: {
          primary: '#161616',
          secondary: '#525252',
          placeholder: '#a8a8a8',
          helper: '#6f6f6f',
          error: '#da1e28',
          onColor: '#ffffff'
        },
        
        // Support Colors (For feedback)
        support: {
          error: '#da1e28',     // Carbon Red 60
          success: '#24a148',   // Carbon Green 50
          warning: '#f1c21b',   // Carbon Yellow 30
          info: '#0043ce'       // Carbon Blue 70
        },
        
        // Borders
        borders: {
          subtle: '#e0e0e0',    // Carbon Grey 20
          strong: '#8d8d8d',    // Carbon Grey 50
          interactive: '#0f62fe' // IBM Blue
        }
      },
      
      typography: {
        headingFont: 'IBM Plex Sans, system-ui, -apple-system, sans-serif',
        bodyFont: 'IBM Plex Sans, system-ui, -apple-system, sans-serif',
        baseSize: '16px',
        scale: 1.125,  // Carbon uses tighter scale
        
        fontFamily: 'IBM Plex Sans, system-ui, -apple-system, sans-serif',
        
        weights: {
          light: 300,
          regular: 400,
          medium: 500,
          semibold: 600,
          bold: 700
        },
        
        // Carbon Typography Scale
        desktop: {
          display: {
            xl: { size: '76px', lineHeight: '82px', letterSpacing: '-0.64px', weight: 300 },
            lg: { size: '60px', lineHeight: '66px', letterSpacing: '-0.64px', weight: 300 },
            md: { size: '48px', lineHeight: '52px', letterSpacing: '0px', weight: 300 }
          },
          heading: {
            xl: { size: '42px', lineHeight: '48px', letterSpacing: '0px', weight: 400 },
            lg: { size: '36px', lineHeight: '42px', letterSpacing: '0px', weight: 400 },
            md: { size: '28px', lineHeight: '34px', letterSpacing: '0px', weight: 400 },
            sm: { size: '20px', lineHeight: '26px', letterSpacing: '0px', weight: 600 }
          },
          body: {
            lg: { size: '16px', lineHeight: '24px', letterSpacing: '0px', weight: 400 },
            md: { size: '14px', lineHeight: '20px', letterSpacing: '0.16px', weight: 400 },
            sm: { size: '12px', lineHeight: '16px', letterSpacing: '0.32px', weight: 400 }
          }
        },
        
        mobile: {
          display: {
            lg: { size: '48px', lineHeight: '52px', letterSpacing: '0px', weight: 300 },
            md: { size: '36px', lineHeight: '40px', letterSpacing: '0px', weight: 300 }
          },
          heading: {
            lg: { size: '28px', lineHeight: '32px', letterSpacing: '0px', weight: 400 },
            md: { size: '20px', lineHeight: '24px', letterSpacing: '0px', weight: 600 }
          },
          body: {
            lg: { size: '16px', lineHeight: '22px', letterSpacing: '0px', weight: 400 },
            md: { size: '14px', lineHeight: '18px', letterSpacing: '0.16px', weight: 400 }
          }
        },
        
        // Mapped styles for CSS generation (compatible with generateTypographyCSS)
        styles: {
          // Headings (H1-H6)
          'heading-h1': {
            family: 'primary',
            desktop: { size: '42px', lineHeight: '48px', letterSpacing: '0px', weight: 400 },
            mobile: { size: '28px', lineHeight: '32px', letterSpacing: '0px', weight: 400 }
          },
          'heading-h2': {
            family: 'primary',
            desktop: { size: '36px', lineHeight: '42px', letterSpacing: '0px', weight: 400 },
            mobile: { size: '28px', lineHeight: '32px', letterSpacing: '0px', weight: 400 }
          },
          'heading-h3': {
            family: 'primary',
            desktop: { size: '28px', lineHeight: '34px', letterSpacing: '0px', weight: 400 },
            mobile: { size: '20px', lineHeight: '24px', letterSpacing: '0px', weight: 600 }
          },
          'heading-h4': {
            family: 'primary',
            desktop: { size: '20px', lineHeight: '26px', letterSpacing: '0px', weight: 600 },
            mobile: { size: '20px', lineHeight: '24px', letterSpacing: '0px', weight: 600 }
          },
          'heading-h5': {
            family: 'primary',
            desktop: { size: '20px', lineHeight: '26px', letterSpacing: '0px', weight: 600 },
            mobile: { size: '20px', lineHeight: '24px', letterSpacing: '0px', weight: 600 }
          },
          'heading-h6': {
            family: 'primary',
            desktop: { size: '20px', lineHeight: '26px', letterSpacing: '0px', weight: 600 },
            mobile: { size: '20px', lineHeight: '24px', letterSpacing: '0px', weight: 600 }
          },
          // Body text
          'body-lg': {
            family: 'primary',
            desktop: { size: '16px', lineHeight: '24px', letterSpacing: '0px', weight: 400 },
            mobile: { size: '16px', lineHeight: '22px', letterSpacing: '0px', weight: 400 }
          },
          'body-md': {
            family: 'primary',
            desktop: { size: '14px', lineHeight: '20px', letterSpacing: '0.16px', weight: 400 },
            mobile: { size: '14px', lineHeight: '18px', letterSpacing: '0.16px', weight: 400 }
          },
          'body-sm': {
            family: 'primary',
            desktop: { size: '12px', lineHeight: '16px', letterSpacing: '0.32px', weight: 400 },
            mobile: { size: '12px', lineHeight: '16px', letterSpacing: '0.32px', weight: 400 }
          }
        },
        
        // Semantic font mapping for CSS generation
        semantic: {
          primary: 'IBM Plex Sans, system-ui, -apple-system, sans-serif',
          secondary: 'IBM Plex Mono, monospace'
        }
      },
      
      spacing: {
        base: '1rem',  // 16px
        scale: 1.5,
        
        // Carbon Spacing Scale (based on 8px grid)
        sizes: {
          xs: '2px',
          sm: '4px',
          md: '8px',
          lg: '16px',
          xl: '24px',
          '2xl': '32px',
          '3xl': '48px',
          '4xl': '64px',
          '5xl': '80px',
          '6xl': '96px'
        }
      },
      
      components: {
        button: {
          borderRadius: '0px',  // Carbon uses sharp corners!
          fontWeight: '400',
          textTransform: 'none',
          fontSize: '14px',
          letterSpacing: '0.16px',
          transition: 'all 70ms cubic-bezier(0, 0, 0.38, 0.9)',  // Carbon motion
          // Button sizing from Carbon
          sizes: {
            small: { height: '32px', padding: '0 16px', fontSize: '12px' },
            medium: { height: '48px', padding: '0 16px', fontSize: '14px' },
            large: { height: '64px', padding: '0 16px', fontSize: '16px' }
          }
        },
        card: {
          borderRadius: '0px',   // Sharp corners (Carbon style)
          boxShadow: 'none',
          border: '1px solid #e0e0e0',
          padding: '16px'
        },
        form: {
          borderRadius: '0px',   // Sharp corners
          border: '1px solid #8d8d8d',
          focusColor: '#0f62fe'
        }
      },
      
      modificationRules: {
        colors: {
          canModifyPrimary: true,
          canModifySecondary: true,
          canModifyAccent: false,  // Accent tied to primary
          canModifyBackground: true,
          canModifyText: false,
          canModifyMuted: true
        },
        typography: {
          canModifyHeadingFont: false,  // IBM Plex Sans locked
          canModifyBodyFont: false,
          canModifyBaseSize: true,
          canModifyScale: true
        },
        spacing: {
          canModifyBase: true,
          canModifyScale: true
        },
        components: {
          canModifyButtonRadius: false,  // Sharp corners are Carbon's signature!
          canModifyButtonWeight: false,
          canModifyCardRadius: false,
          canModifyCardShadow: false,
          canModifyFormRadius: false
        }
      },
      
      globalSections: {
        header: PREFAB_SECTIONS['header-section'] as any,
        footer: PREFAB_SECTIONS['footer-section'] as any
      },
      publicationCardVariants: []
    },
    {
      id: 'ant-design',
      name: 'Ant Design',
      description: 'Ant Design System - Enterprise-class UI design language with a refined experience',
      version: '5.0.0',
      
      colors: {
        primary: '#1890ff',      // Daybreak Blue (Primary button)
        secondary: '#ff4d4f',    // Dust Red (Danger button)
        accent: '#d9d9d9',       // Neutral Grey (Default button border)
        background: '#ffffff',
        text: '#000000d9',       // 85% black (rgba(0,0,0,0.85))
        muted: '#00000073',      // 45% black (rgba(0,0,0,0.45))
        
        palette: {
          blue: {
            1: '#e6f7ff',
            2: '#bae7ff',
            3: '#91d5ff',
            4: '#69c0ff',
            5: '#40a9ff',
            6: '#1890ff',  // Primary
            7: '#096dd9',
            8: '#0050b3',
            9: '#003a8c',
            10: '#002766'
          },
          green: {
            1: '#f6ffed',
            2: '#d9f7be',
            3: '#b7eb8f',
            4: '#95de64',
            5: '#73d13d',
            6: '#52c41a',  // Success
            7: '#389e0d',
            8: '#237804',
            9: '#135200',
            10: '#092b00'
          },
          red: {
            1: '#fff1f0',
            2: '#ffccc7',
            3: '#ffa39e',
            4: '#ff7875',
            5: '#ff4d4f',
            6: '#f5222d',  // Error
            7: '#cf1322',
            8: '#a8071a',
            9: '#820014',
            10: '#5c0011'
          },
          gold: {
            1: '#fffbe6',
            2: '#fff1b8',
            3: '#ffe58f',
            4: '#ffd666',
            5: '#ffc53d',
            6: '#faad14',  // Warning
            7: '#d48806',
            8: '#ad6800',
            9: '#874d00',
            10: '#613400'
          },
          gray: {
            1: '#ffffff',
            2: '#fafafa',
            3: '#f5f5f5',
            4: '#f0f0f0',
            5: '#d9d9d9',
            6: '#bfbfbf',
            7: '#8c8c8c',
            8: '#595959',
            9: '#434343',
            10: '#262626',
            11: '#1f1f1f',
            12: '#141414',
            13: '#000000'
          }
        },
        
        semantic: {
          success: '#52c41a',
          warning: '#faad14',
          error: '#f5222d',
          info: '#1890ff',
          // Background colors
          successBg: '#f6ffed',
          warningBg: '#fffbe6',
          errorBg: '#fff1f0',
          infoBg: '#e6f7ff'
        }
      },
      
      typography: {
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
        headingFont: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif",
        bodyFont: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif",
        baseSize: '14px',
        scale: 1.2,
        
        weights: {
          light: 300,
          regular: 400,
          medium: 500,
          semibold: 600,
          bold: 700
        },
        
        sizes: {
          xs: '12px',
          sm: '14px',
          base: '14px',
          lg: '16px',
          xl: '20px',
          '2xl': '24px',
          '3xl': '30px',
          '4xl': '38px',
          '5xl': '46px',
          '6xl': '56px'
        },
        
        // Typography styles for semantic CSS classes
        styles: {
          'heading-h1': {
            family: 'primary',
            desktop: { size: '38px', lineHeight: '1.23', letterSpacing: '0', weight: 600 },
            mobile: { size: '30px', lineHeight: '1.35', letterSpacing: '0', weight: 600 }
          },
          'heading-h2': {
            family: 'primary',
            desktop: { size: '30px', lineHeight: '1.35', letterSpacing: '0', weight: 600 },
            mobile: { size: '24px', lineHeight: '1.4', letterSpacing: '0', weight: 600 }
          },
          'heading-h3': {
            family: 'primary',
            desktop: { size: '24px', lineHeight: '1.4', letterSpacing: '0', weight: 600 },
            mobile: { size: '20px', lineHeight: '1.5', letterSpacing: '0', weight: 600 }
          },
          'heading-h4': {
            family: 'primary',
            desktop: { size: '20px', lineHeight: '1.5', letterSpacing: '0', weight: 600 },
            mobile: { size: '18px', lineHeight: '1.5', letterSpacing: '0', weight: 600 }
          },
          'heading-h5': {
            family: 'primary',
            desktop: { size: '16px', lineHeight: '1.5', letterSpacing: '0', weight: 600 },
            mobile: { size: '16px', lineHeight: '1.5', letterSpacing: '0', weight: 600 }
          },
          'heading-h6': {
            family: 'primary',
            desktop: { size: '14px', lineHeight: '1.5', letterSpacing: '0', weight: 600 },
            mobile: { size: '14px', lineHeight: '1.5', letterSpacing: '0', weight: 600 }
          },
          'body-lg': {
            family: 'primary',
            desktop: { size: '16px', lineHeight: '1.5715', letterSpacing: '0', weight: 400 },
            mobile: { size: '16px', lineHeight: '1.5715', letterSpacing: '0', weight: 400 }
          },
          'body-md': {
            family: 'primary',
            desktop: { size: '14px', lineHeight: '1.5715', letterSpacing: '0', weight: 400 },
            mobile: { size: '14px', lineHeight: '1.5715', letterSpacing: '0', weight: 400 }
          },
          'body-sm': {
            family: 'primary',
            desktop: { size: '12px', lineHeight: '1.66', letterSpacing: '0', weight: 400 },
            mobile: { size: '12px', lineHeight: '1.66', letterSpacing: '0', weight: 400 }
          }
        },
        
        semantic: {
          primary: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif"
        }
      },
      
      spacing: {
        base: 8,
        scale: [0, 4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96],
        unit: 'px',
        
        section: {
          xs: '16px',
          sm: '24px',
          md: '32px',
          lg: '48px',
          xl: '64px',
          '2xl': '96px'
        }
      },
      
      components: {
        button: {
          borderRadius: '2px',
          fontWeight: '400',
          textTransform: 'none',
          fontSize: '14px',
          transition: 'all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1)',
          sizes: {
            small: { height: '24px', padding: '0 7px', fontSize: '14px' },
            medium: { height: '32px', padding: '4px 15px', fontSize: '14px' },
            large: { height: '40px', padding: '6.4px 15px', fontSize: '16px' }
          }
        },
        card: {
          borderRadius: '2px',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
          border: '1px solid #f0f0f0',
          padding: '24px'
        },
        form: {
          borderRadius: '2px',
          border: '1px solid #d9d9d9',
          focusColor: '#40a9ff'
        }
      },
      
      modificationRules: {
        colors: {
          canModifyPrimary: true,
          canModifySecondary: true,
          canModifyAccent: true,
          canModifyBackground: true,
          canModifyText: false,
          canModifyMuted: true
        },
        typography: {
          canModifyHeadingFont: false,
          canModifyBodyFont: false,
          canModifyBaseSize: true,
          canModifyScale: true
        },
        spacing: {
          canModifyBase: true,
          canModifyScale: true
        },
        components: {
          canModifyButtonRadius: true,
          canModifyButtonWeight: false,
          canModifyCardRadius: true,
          canModifyCardShadow: true,
          canModifyFormRadius: true
        }
      },
      
      globalSections: {
        header: PREFAB_SECTIONS['header-section'] as any,
        footer: PREFAB_SECTIONS['footer-section'] as any
      },
      publicationCardVariants: [],
      templates: []
    }
]
