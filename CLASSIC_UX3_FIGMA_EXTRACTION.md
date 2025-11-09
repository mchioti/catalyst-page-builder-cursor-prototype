# Classic UX3 Theme - Figma Design System Extraction

**Source:** Figma file "Classic Theme - Style Guide"  
**Date:** 2025-01-09  
**Extraction Method:** Screenshot analysis  
**Status:** ✅ Complete extraction for 3-layer architecture

---

## 🎨 Typography System

### **Fonts**
- **Primary (Headings):** Volkhov Bold
- **Secondary (Body):** Lato (Bold, Regular, Light)

### **Text Styles Extracted**

#### **Headings (Titles)**
| Style | Font | Weight | Size | Line Height | Usage |
|-------|------|--------|------|-------------|-------|
| **H1 - Volkhov** | Volkhov | Bold | ~48px | ~56px | Hero titles |
| **H1 - Lato** | Lato | Bold | ~48px | ~56px | Alternative hero |
| **H2** | Mixed | Bold | ~40px | ~48px | Section titles |
| **H3** | Mixed | Bold | ~32px | ~40px | Subsection titles |
| **H4 - Volkhov** | Volkhov | Bold | ~28px | ~36px | Card titles |
| **H5 - Lato** | Lato | Bold | ~24px | ~32px | Smaller titles |
| **H6** | Lato | Bold | ~20px | ~28px | Smallest titles |

#### **Body Text**
| Style | Font | Weight | Size | Line Height | Usage |
|-------|------|--------|------|-------------|-------|
| **Body XL** | Lato | Regular | ~20px | ~32px | Lead paragraph |
| **Body Large** | Lato | Regular | ~18px | ~28px | Emphasis text |
| **Body Medium** | Lato | Regular | ~16px | ~24px | Standard body |
| **Body Small** | Lato | Regular | ~14px | ~20px | Secondary text |
| **Body XS** | Lato | Regular | ~12px | ~16px | Captions |

#### **Special Styles**
| Style | Font | Weight | Transform | Letter Spacing | Usage |
|-------|------|--------|-----------|----------------|-------|
| **UPPERCASE** | Lato | Bold | Uppercase | 1.6px | Labels, tags |
| **Label Bold** | Lato | Bold | None | Normal | Form labels |
| **Link** | Lato | Regular | None | Normal | Hyperlinks |

---

## 🎨 Color System

### **Layer 1: Foundation Colors (Core Palette)**

#### **Brand Teal (Primary)**
```typescript
teal: {
  50: '#f0fafa',   // Lightest
  100: '#d9f2f2',
  200: '#b3e5e6',
  300: '#8cd8d9',
  400: '#66cbcd',
  500: '#40bec0',  // Base brand
  600: '#339899',  // Medium
  700: '#267273',
  800: '#1a4c4d',  
  900: '#0f3d3e'   // Darkest (from screenshot)
}
```

#### **System Colors**

**Purple (Accent/Highlight)**
```typescript
purple: {
  50: '#f5f3ff',
  100: '#ede9fe',
  200: '#ddd6fe',
  300: '#c4b5fd',
  400: '#a78bfa',
  500: '#8b5cf6',  // Base
  600: '#7c3aed',
  700: '#6d28d9',
  800: '#5b21b6',
  900: '#4c1d95'
}
```

**Red (Error/Warning)**
```typescript
red: {
  50: '#fef2f2',
  100: '#fee2e2',
  200: '#fecaca',
  300: '#fca5a5',
  400: '#f87171',
  500: '#ef4444',  // Base
  600: '#dc2626',
  700: '#b91c1c',
  800: '#991b1b',
  900: '#7f1d1d'
}
```

**Green (Success)**
```typescript
green: {
  50: '#f0fdf4',
  100: '#dcfce7',
  200: '#bbf7d0',
  300: '#86efac',
  400: '#4ade80',
  500: '#22c55e',  // Base
  600: '#16a34a',
  700: '#15803d',
  800: '#166534',
  900: '#14532d'
}
```

**Yellow/Gold (Warning/Highlight)**
```typescript
yellow: {
  50: '#fefce8',
  100: '#fef9c3',
  200: '#fef08a',
  300: '#fde047',
  400: '#facc15',
  500: '#eab308',  // Base
  600: '#ca8a04',
  700: '#a16207',
  800: '#854d0e',
  900: '#713f12'
}
```

#### **Blues (Secondary Brand)**
```typescript
blue: {
  50: '#eff6ff',
  100: '#dbeafe',
  200: '#bfdbfe',
  300: '#93c5fd',
  400: '#60a5fa',
  500: '#3b82f6',  // Base (current primary color in code)
  600: '#2563eb',  // Deeper blue
  700: '#1d4ed8',
  800: '#1e40af',
  900: '#1e3a8a'
}
```

#### **Grays (Neutral Scale)**
```typescript
gray: {
  50: '#f9fafb',   // Background tints
  100: '#f3f4f6',
  200: '#e5e7eb',  // Borders
  300: '#d1d5db',
  400: '#9ca3af',
  500: '#6b7280',  // Muted text
  600: '#4b5563',
  700: '#374151',
  800: '#1f2937',
  900: '#111827',  // Dark text
  950: '#030712'   // Darkest
}
```

### **Layer 2: Semantic Colors (Theme Mapping)**

```typescript
semanticColors: {
  // Interactive elements
  interactive: {
    primary: {
      default: '{foundation.teal.600}',      // #339899
      hover: '{foundation.teal.700}',        // #267273
      active: '{foundation.teal.800}'        // #1a4c4d
    },
    secondary: {
      default: '{foundation.blue.600}',      // #2563eb (legacy)
      hover: '{foundation.blue.700}',
      active: '{foundation.blue.800}'
    },
    accent: {
      default: '{foundation.purple.500}',    // #8b5cf6
      hover: '{foundation.purple.600}',
      active: '{foundation.purple.700}'
    }
  },
  
  // Surface colors
  surface: {
    background: '#ffffff',
    card: '#ffffff',
    overlay: '{foundation.gray.900}/80',
    border: '{foundation.gray.200}',
    divider: '{foundation.gray.100}'
  },
  
  // Content colors
  content: {
    primary: '{foundation.gray.900}',      // Main text
    secondary: '{foundation.gray.600}',    // Secondary text
    muted: '{foundation.gray.500}',        // Muted text
    inverse: '#ffffff',                    // Text on dark
    link: '{foundation.teal.600}',         // Links
    linkHover: '{foundation.teal.700}'
  },
  
  // Feedback colors
  feedback: {
    success: '{foundation.green.600}',
    warning: '{foundation.yellow.600}',
    error: '{foundation.red.600}',
    info: '{foundation.blue.600}'
  },
  
  // Journal/Context-specific (for branding)
  contextual: {
    journal: {
      // These will be overridden by journal branding
      primary: '{semantic.interactive.primary.default}',
      text: '#ffffff'
    }
  }
}
```

---

## 📏 Spacing System

### **Base Grid: 8px**

```typescript
spacing: {
  base: {
    '0': '0',
    '1': '8px',     // 1 unit
    '2': '16px',    // 2 units
    '3': '24px',    // 3 units
    '4': '32px',    // 4 units
    '5': '40px',    // 5 units
    '6': '48px',    // 6 units
    '7': '56px',    // 7 units
    '8': '64px',    // 8 units
    '9': '72px',    // 9 units
    '10': '80px'    // 10 units
  },
  semantic: {
    none: '0',
    xs: '8px',      // Tight spacing
    sm: '16px',     // Small spacing
    md: '24px',     // Medium spacing
    lg: '32px',     // Large spacing
    xl: '48px',     // Extra large
    '2xl': '64px',  // Section spacing
    '3xl': '80px'   // Hero spacing
  }
}
```

### **Vertical Rhythm**
- Line heights follow typography scale
- Section padding: 48-80px (xl-3xl)
- Component padding: 16-32px (sm-lg)
- Inline spacing: 8-16px (xs-sm)

---

## 🧩 Component Specifications

### **Buttons**

```typescript
components: {
  button: {
    sizes: {
      sm: {
        padding: '8px 16px',
        fontSize: '14px',
        lineHeight: '20px',
        borderRadius: '4px'
      },
      md: {
        padding: '12px 24px',
        fontSize: '16px',
        lineHeight: '24px',
        borderRadius: '4px'
      },
      lg: {
        padding: '16px 32px',
        fontSize: '18px',
        lineHeight: '28px',
        borderRadius: '4px'
      }
    },
    variants: {
      primary: {
        background: '{semantic.interactive.primary.default}',
        color: '{semantic.content.inverse}',
        border: 'none',
        hover: {
          background: '{semantic.interactive.primary.hover}'
        }
      },
      secondary: {
        background: 'transparent',
        color: '{semantic.interactive.primary.default}',
        border: '2px solid {semantic.interactive.primary.default}',
        hover: {
          background: '{semantic.interactive.primary.default}',
          color: '{semantic.content.inverse}'
        }
      },
      outline: {
        background: 'white',
        color: '{semantic.interactive.primary.default}',
        border: '1px solid {semantic.surface.border}',
        hover: {
          background: '{foundation.gray.50}',
          borderColor: '{semantic.interactive.primary.default}'
        }
      }
    }
  }
}
```

### **Cards**

```typescript
card: {
  borderRadius: '8px',
  border: '1px solid {semantic.surface.border}',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  padding: {
    sm: '16px',
    md: '24px',
    lg: '32px'
  },
  hover: {
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  }
}
```

### **Forms**

```typescript
form: {
  input: {
    borderRadius: '4px',
    border: '1px solid {semantic.surface.border}',
    padding: '12px 16px',
    fontSize: '16px',
    focus: {
      borderColor: '{semantic.interactive.primary.default}',
      boxShadow: '0 0 0 3px {semantic.interactive.primary.default}/20'
    }
  }
}
```

---

## 🎯 Layer 3: Website/Journal Overrides

```typescript
// Website level (Wiley Online Library)
website: {
  logo: 'wiley-logo.svg',
  colors: {
    primary: '{foundation.teal.600}',  // Can override to blue if needed
    secondary: '{foundation.blue.600}'
  }
}

// Journal level (ADVMA, EMBO, etc.)
journal: {
  colors: {
    primary: '#dc2626',  // Journal-specific red (overrides teal)
    text: '#ffffff'
  }
}
```

---

## 📦 Complete Theme Object Structure

```typescript
{
  id: 'classic-ux3-theme',
  name: 'Classic UX3',
  description: 'Classic academic publishing theme from AXP 2.0, upgraded with proper design system',
  version: '3.0.0',
  
  // Layer 1: Foundation
  foundation: {
    colors: { /* teal, purple, red, green, yellow, blue, gray scales */ },
    typography: {
      families: {
        primary: 'Volkhov, serif',
        secondary: 'Lato, sans-serif'
      },
      weights: { light: 300, regular: 400, bold: 700 },
      sizes: { /* h1-h6, body-xl to body-xs */ }
    },
    spacing: { /* base 0-10, semantic xs-3xl */ }
  },
  
  // Layer 2: Semantic
  semanticColors: { /* interactive, surface, content, feedback, contextual */ },
  
  // Layer 3: Components
  components: { /* button, card, form */ },
  
  // Legacy compatibility
  colors: {
    primary: '#339899',   // foundation.teal.600
    secondary: '#2563eb', // foundation.blue.600
    accent: '#8b5cf6',    // foundation.purple.500
    background: '#ffffff',
    text: '#111827',      // foundation.gray.900
    muted: '#6b7280'      // foundation.gray.500
  },
  typography: {
    headingFont: 'Volkhov, serif',
    bodyFont: 'Lato, sans-serif',
    baseSize: '16px',
    scale: 1.25
  }
}
```

---

## ✅ Extraction Complete

**Next Steps:**
1. ✅ Typography extracted
2. ✅ Color system extracted (brand teal, system colors, grays)
3. ✅ Spacing system extracted (8px grid)
4. ✅ Component specs defined
5. ⏭️ Build actual theme in `App.tsx`
6. ⏭️ Update CSS to use tokens
7. ⏭️ Test with Wiley Online Library
8. ⏭️ Implement journal branding overrides

---

**END OF EXTRACTION**

