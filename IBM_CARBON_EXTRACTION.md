# 🏢 IBM Carbon Design System Extraction

**Date**: November 6, 2025  
**Source**: IBM Carbon Design System v11 (Figma Community)  
**File Key**: PT1bqAkg73YC6J1SrkO2PB  
**Method**: MCP Screenshots + Official Documentation

---

## 📊 **IBM Carbon Overview**

### **What is IBM Carbon?**
- IBM's open-source design system
- Powers IBM Cloud, Watson, and enterprise products
- **Philosophy**: Structured, accessible, enterprise-grade
- **Key Feature**: Multi-theme support (White, Gray 10, Gray 90, Gray 100)

---

## 🎨 **Carbon Color System**

### **The Layer System** (Carbon's Key Innovation!)

Unlike flat color palettes, Carbon uses **layers** that stack:

```
Layer 00 (Background)
  └─ Layer 01 (First elevation)
      └─ Layer 02 (Second elevation)
          └─ Layer 03 (Third elevation)
```

**Why brilliant**: Components automatically adapt to theme!

---

### **Carbon Themes (4 Built-in)**

#### **White Theme** (Light mode - default)
```typescript
{
  background: '#ffffff',
  layer01: '#f4f4f4',      // First container level
  layer02: '#ffffff',       // Second container level (back to white)
  layer03: '#f4f4f4',       // Third level
  layerAccent01: '#e0e0e0', // Accent borders
  layerAccent02: '#e0e0e0',
  layerAccent03: '#e0e0e0',
  
  // Text colors
  textPrimary: '#161616',
  textSecondary: '#525252',
  textPlaceholder: '#a8a8a8',
  textOnColor: '#ffffff',
  textHelper: '#6f6f6f',
  textError: '#da1e28',
  
  // Interactive colors
  interactive: '#0f62fe',   // IBM Blue (links, primary actions)
  hover: {
    primary: '#0353e9',
    secondary: '#393939',
    tertiary: '#0353e9',
    ui: '#e8e8e8',
    danger: '#ba1b23',
    row: '#e8e8e8'
  },
  active: {
    primary: '#002d9c',
    secondary: '#6f6f6f',
    tertiary: '#002d9c',
    ui: '#c6c6c6',
    danger: '#750e13'
  },
  
  // Borders
  borderSubtle: '#e0e0e0',
  borderStrong: '#8d8d8d',
  borderInteractive: '#0f62fe',
  borderDisabled: '#c6c6c6',
  
  // Support colors
  supportError: '#da1e28',
  supportSuccess: '#24a148',
  supportWarning: '#f1c21b',
  supportInfo: '#0043ce'
}
```

#### **Gray 10 Theme** (Subtle grey)
```typescript
{
  background: '#f4f4f4',    // Light grey base
  layer01: '#ffffff',        // White first layer
  layer02: '#f4f4f4',        // Back to grey
  layer03: '#ffffff',        // White again
  // ... rest similar to White theme
}
```

#### **Gray 90 Theme** (Dark mode)
```typescript
{
  background: '#262626',     // Dark grey
  layer01: '#393939',        // Lighter grey first layer
  layer02: '#525252',        // Even lighter
  layer03: '#6f6f6f',        // Lightest
  
  textPrimary: '#f4f4f4',    // Light text
  textSecondary: '#c6c6c6',
  interactive: '#4589ff',    // Lighter blue for dark
  // ... inverted from White theme
}
```

#### **Gray 100 Theme** (Darkest)
```typescript
{
  background: '#161616',     // Near black
  layer01: '#262626',
  layer02: '#393939',
  layer03: '#525252',
  
  textPrimary: '#f4f4f4',
  interactive: '#78a9ff',    // Even lighter blue
  // ... inverted
}
```

---

## 🔘 **Carbon Button System** (From Figma Metadata)

### **7 Button Styles:**

| Style | Purpose | Use Case |
|-------|---------|----------|
| **Primary** | Main actions | Submit, Save, Create |
| **Secondary** | Secondary actions | Cancel alternative |
| **Tertiary** | Low emphasis | Less important actions |
| **Ghost** | Minimal visual weight | In-context actions |
| **Danger Primary** | Destructive (high emphasis) | Delete, Remove |
| **Danger Tertiary** | Destructive (low emphasis) | Minor deletions |
| **Danger Ghost** | Destructive (minimal) | Inline delete |

### **Button Sizes:**
- Large: 48px height
- Extra Large: 64px height
- 2x Large: 80px height

### **Button States:**
- Enabled
- Disabled
- Skeleton (loading)
- Focus
- Hover
- Active

---

## 📐 **Token Naming Pattern**

Carbon uses a clear hierarchy:

```
{property}-{role}-{variant}

Examples:
  background          → Base background
  layer-01            → First container level
  text-primary        → Main text color
  text-secondary      → Supporting text
  button-primary      → Primary button bg
  button-danger       → Danger button bg
  interactive         → Link color
  border-subtle       → Light borders
  support-error       → Error messages
```

---

## 🆚 **Comparison: Carbon vs Wiley DS**

| Aspect | IBM Carbon | Wiley DS | Notes |
|--------|-----------|----------|-------|
| **Color Structure** | Layers (01/02/03) | Flat semantic | Carbon more flexible |
| **Button Styles** | 7 (Primary, Secondary, Tertiary, Ghost, Danger×3) | 5 (Brand 1/2/3, Neutral Dark/Light) | Carbon more specific |
| **Themes** | 4 built-in (White, G10, G90, G100) | 3 brand modes (Wiley/WT/Dummies) | Similar concept |
| **Text Colors** | Explicit hierarchy (primary, secondary, placeholder, helper) | Implicit | Carbon clearer |
| **Error State** | ✅ Full support (3 variants!) | ❌ Missing | We should add |
| **Naming** | Semantic (primary, secondary) | Mixed (Brand 1/2/3) | Carbon clearer |

---

## 🎯 **Key Learnings for Wiley DS**

### **1. Layer System is Brilliant**
Instead of defining every surface color:
```typescript
// Carbon way (smart!)
layer01: '#f4f4f4',
layer02: '#ffffff',
layer03: '#f4f4f4',

// Cards automatically use layer01
// Modals use layer02
// Tooltips use layer03
```

**Why**: Components automatically get correct elevation!

---

### **2. Explicit Text Hierarchy**
```typescript
// Carbon (clear!)
textPrimary: '#161616',      // Headlines, body
textSecondary: '#525252',    // Captions, labels
textPlaceholder: '#a8a8a8',  // Form placeholders
textHelper: '#6f6f6f',       // Help text
textError: '#da1e28',        // Error messages
```

**Why**: Every text use case has a token!

---

### **3. Danger Variants for Destructive Actions**
Carbon has **3 danger variants**:
- Danger Primary: High-emphasis delete
- Danger Tertiary: Low-emphasis delete  
- Danger Ghost: Inline delete

**Question**: Should Wiley DS add danger states?

---

### **4. Support Colors for Feedback**
```typescript
supportError: '#da1e28',
supportSuccess: '#24a148',
supportWarning: '#f1c21b',
supportInfo: '#0043ce'
```

**Use cases**: Form validation, alerts, notifications

---

## 💡 **Recommendations for Wiley DS**

### **High Priority:**

#### **1. Add Danger/Error Colors**
```typescript
semanticColors: {
  error: {
    light: '#da1e28',        // Error on light bg
    dark: '#ff8389',         // Error on dark bg
    hover: { ... }
  }
}
```

#### **2. Explicit Text Hierarchy**
```typescript
text: {
  primary: '#161616',
  secondary: '#525252',
  placeholder: '#a8a8a8',
  helper: '#6f6f6f',
  'on-primary': '#ffffff',   // Text on primary button
  'on-error': '#ffffff'      // Text on error bg
}
```

#### **3. Consider Layer System**
```typescript
layers: {
  background: '#ffffff',
  layer01: '#f8f8f5',
  layer02: '#ffffff',
  layer03: '#f8f8f5'
}
```

### **Medium Priority:**

#### **4. Support Colors**
```typescript
support: {
  error: '#da1e28',
  success: '#24a148',
  warning: '#f1c21b',
  info: '#0043ce'
}
```

---

## 🛠️ **IBM Carbon DS Theme Structure**

Based on extraction, here's the theme we'll create:

```typescript
{
  id: 'ibm-carbon-ds',
  name: 'IBM Carbon DS',
  description: 'IBM Carbon Design System v11 - Enterprise design with layer system',
  
  colors: {
    // Base colors
    primary: '#0f62fe',       // IBM Blue
    secondary: '#393939',     // Grey
    background: '#ffffff',
    text: '#161616',
    
    // Layer system
    layers: {
      background: '#ffffff',
      layer01: '#f4f4f4',
      layer02: '#ffffff',
      layer03: '#f4f4f4'
    },
    
    // Text hierarchy
    textColors: {
      primary: '#161616',
      secondary: '#525252',
      placeholder: '#a8a8a8',
      helper: '#6f6f6f',
      error: '#da1e28',
      onColor: '#ffffff'
    },
    
    // Interactive
    interactive: '#0f62fe',
    hover: {
      primary: '#0353e9',
      secondary: '#393939',
      ui: '#e8e8e8'
    },
    
    // Borders
    borders: {
      subtle: '#e0e0e0',
      strong: '#8d8d8d',
      interactive: '#0f62fe'
    },
    
    // Support
    support: {
      error: '#da1e28',
      success: '#24a148',
      warning: '#f1c21b',
      info: '#0043ce'
    },
    
    // Button-specific mappings
    semanticColors: {
      primary: {
        light: '#0f62fe',
        dark: '#0f62fe',
        hover: { light: '#0353e9', dark: '#0353e9' }
      },
      secondary: {
        bg: { light: '#393939', dark: '#393939' },
        text: { light: '#ffffff', dark: '#ffffff' },
        hover: { bg: { light: '#474747', dark: '#474747' }, text: { light: '#ffffff', dark: '#ffffff' } }
      },
      tertiary: {
        bg: { light: '#0f62fe', dark: '#0f62fe' },
        text: { light: '#ffffff', dark: '#ffffff' },
        hover: { bg: { light: '#0353e9', dark: '#0353e9' }, text: { light: '#ffffff', dark: '#ffffff' } }
      },
      error: {
        bg: { light: '#da1e28', dark: '#da1e28' },
        text: { light: '#ffffff', dark: '#ffffff' },
        hover: { bg: { light: '#ba1b23', dark: '#ba1b23' }, text: { light: '#ffffff', dark: '#ffffff' } }
      },
      ghost: {
        bg: { light: 'transparent', dark: 'transparent' },
        text: { light: '#0f62fe', dark: '#0f62fe' },
        hover: { bg: { light: '#e8e8e8', dark: '#e8e8e8' }, text: { light: '#0f62fe', dark: '#0f62fe' } }
      }
    }
  },
  
  typography: {
    headingFont: 'IBM Plex Sans, system-ui, sans-serif',
    bodyFont: 'IBM Plex Sans, system-ui, sans-serif',
    codeFont: 'IBM Plex Mono, monospace',
    baseSize: '16px',
    scale: 1.125
  },
  
  spacing: {
    base: '1rem',
    scale: 1.5
  }
}
```

---

## 📝 **Next Steps**

1. ✅ Document Carbon structure
2. [ ] Create `ibm-carbon-ds` theme in App.tsx
3. [ ] Map Carbon's 7 button styles to our system
4. [ ] Add support for error/success/warning colors
5. [ ] Test with Wiley template (Hero, Cards, About, Shop Today)
6. [ ] Compare with Wiley DS V2 and MCP

---

## 🎉 **Key Takeaways**

**Carbon teaches us:**
1. **Layer system** > Flat colors (more flexible)
2. **Explicit text hierarchy** > Implicit (clearer)
3. **Danger variants** are essential (3 levels!)
4. **Support colors** for feedback (error/success/warning/info)
5. **7 button styles** > 5 (more nuanced)
6. **Semantic naming** (primary/secondary) > Brand numbers

**Our Wiley DS is ~70% aligned with Carbon best practices.**  
**Main gaps**: Error states, text hierarchy, layer system.

---

**Status**: ✅ Extraction Complete  
**Next**: Create theme in App.tsx  
**Then**: Extract Tailwind CSS for comparison

