# 📚 Material Design 3 Study Guide
## Comparison with Wiley Design System

**Date**: November 6, 2025  
**Purpose**: Learn from Google's MD3 to refine our Wiley DS implementation  
**Status**: Study in Progress

---

## 🎨 **Material Design 3 Overview**

### **What is Material Design 3?**
- Google's design system (2021-present)
- Powers Android, Google Workspace, Chrome OS
- Open source, battle-tested
- **Key innovation**: Dynamic color theming from user's wallpaper

### **Why Study It?**
✅ Made by design system experts (Google's Material team)  
✅ Solves exact problems we're facing (semantic naming, token hierarchy)  
✅ Well-documented with clear rationale  
✅ Shows industry best practices  

---

## 🏗️ **MD3 Architecture: The 3-Layer Token System**

### **Layer 1: Reference Tokens (Raw Values)**
```
Reference tokens are the foundation - raw, non-semantic values.
Think: CSS custom properties or design tool variables.

Examples:
  ref/palette/primary0:   #000000
  ref/palette/primary10:  #21005D
  ref/palette/primary20:  #381E72
  ref/palette/primary30:  #4F378B
  ref/palette/primary40:  #6750A4
  ref/palette/primary50:  #7F67BE
  ...
  ref/palette/primary100: #FFFFFF
```

**Key Insight**: These are **NOT used directly in components!**  
**Similar to**: Our `coreColors` in Wiley DS

---

### **Layer 2: System Tokens (Semantic Names)**
```
System tokens assign meaning to reference tokens.
They adapt based on theme (light/dark mode).

Examples (Light Theme):
  sys/color/primary:           ref/palette/primary40  (#6750A4)
  sys/color/on-primary:        ref/palette/primary100 (#FFFFFF)
  sys/color/primary-container: ref/palette/primary90  (#EADDFF)
  sys/color/on-primary-container: ref/palette/primary10 (#21005D)

Examples (Dark Theme):
  sys/color/primary:           ref/palette/primary80  (#D0BCFF)
  sys/color/on-primary:        ref/palette/primary20  (#381E72)
  sys/color/primary-container: ref/palette/primary30  (#4F378B)
  sys/color/on-primary-container: ref/palette/primary90 (#EADDFF)
```

**Key Insight**: Same semantic name, different values per theme!  
**Similar to**: Our `semanticColors` (primary.light / primary.dark)

---

### **Layer 3: Component Tokens**
```
Component tokens define how components use system tokens.

Button/Primary:
  container-color: sys/color/primary
  label-text-color: sys/color/on-primary
  state-layer-color/hover: sys/color/on-primary (8% opacity)
  state-layer-color/pressed: sys/color/on-primary (12% opacity)

Button/Secondary:
  container-color: sys/color/secondary-container
  label-text-color: sys/color/on-secondary-container
  ...
```

**Key Insight**: Components ONLY reference system tokens, never reference tokens!  
**Similar to**: Our button rendering logic in `WidgetRenderer.tsx`

---

## 🎨 **MD3 Color System**

### **Color Roles (The Answer to "Brand 1/2/3"!)**

| MD3 Role | Purpose | Wiley DS Equivalent | Notes |
|----------|---------|-------------------|-------|
| **Primary** | Main brand color, primary actions | Brand 1 | High-emphasis actions (CTAs) |
| **Secondary** | Less prominent actions | Brand 2 | Medium-emphasis actions |
| **Tertiary** | Contrasting accent | Brand 3 | Low-emphasis, supporting actions |
| **Error** | Errors, destructive actions | ❌ Missing | Should we add? |
| **Neutral** | Text, dividers, backgrounds | Neutral (0-900) | ✅ We have this |
| **Neutral Variant** | Secondary text, disabled | ❌ Missing | Slightly tinted neutrals |

### **"On-" Colors (Critical Pattern!)**

MD3 uses "On-X" to mean "text/icon color on X background":

```
primary:           The background color
on-primary:        Text color on primary background

primary-container: Lighter primary background
on-primary-container: Text on primary-container

surface:           Default background
on-surface:        Default text color
on-surface-variant: Secondary text color
```

**🔥 This solves our "light/dark" confusion!**

Instead of:
```typescript
primary: { light: '#00d875', dark: '#008f8a' }  // Confusing!
```

MD3 would do:
```typescript
// Light theme
primary: '#6750A4'           // Purple (the button bg)
on-primary: '#FFFFFF'        // White (text on button)

// Dark theme  
primary: '#D0BCFF'           // Light purple (button bg in dark mode)
on-primary: '#381E72'        // Dark purple (text on button in dark)
```

---

## 🎯 **MD3 Button System**

### **Button Types & Color Usage**

| Button Type | Container Color | Text Color | Use Case |
|------------|----------------|------------|----------|
| **Filled** | `primary` | `on-primary` | High emphasis |
| **Filled Tonal** | `secondary-container` | `on-secondary-container` | Medium emphasis |
| **Outlined** | `transparent` | `primary` (border + text) | Medium emphasis |
| **Text** | `transparent` | `primary` (text only) | Low emphasis |
| **Elevated** | `surface-container-low` + shadow | `primary` | Medium emphasis, needs separation |

**Key Insight**: MD3 has **5 button types**, just like our 5 colors!

**Comparison:**
```
MD3                    Wiley DS           Notes
----                   --------           -----
Filled                 Brand 1 Solid      ✓ Primary action
Filled Tonal           Brand 2 Solid      ✓ Secondary action
Outlined               Brand 1 Outline    ✓ Medium emphasis
Text                   Link style         ✓ Low emphasis
(Elevated)             Brand 3?           ? When to use?
```

---

## 📐 **MD3 Token Naming Convention**

### **Pattern: `{property}/{role}/{variant}/{state}`**

Examples:
```
sys/color/primary                     → Base color
sys/color/on-primary                  → Text on primary
sys/color/primary-container           → Lighter variant
sys/color/on-primary-container        → Text on container

sys/elevation/level0                  → No shadow
sys/elevation/level1                  → 1dp shadow
sys/elevation/level2                  → 3dp shadow

sys/shape/corner-extra-small          → 4dp radius
sys/shape/corner-small                → 8dp radius
sys/shape/corner-medium               → 12dp radius
```

**Convention Rules:**
1. **Prefix**: `ref` (reference) or `sys` (system)
2. **Property**: color, elevation, shape, motion, typography
3. **Role**: semantic purpose (primary, error, surface)
4. **Variant**: container, variant, fixed
5. **State**: hover, pressed, dragged, disabled

---

## 📊 **Comparison: MD3 vs Wiley DS**

### **1. Color System**

| Aspect | Material Design 3 | Wiley DS (Current) | Assessment |
|--------|------------------|-------------------|------------|
| **Primary Role** | Primary (1 color) | Brand 1 | ✅ Same concept |
| **Secondary Role** | Secondary (1 color) | Brand 2 | ✅ Same concept |
| **Tertiary Role** | Tertiary (1 color) | Brand 3 | ✅ Same concept |
| **Additional Colors** | Error, Neutral, Neutral Variant | Neutral only | ❌ Missing Error |
| **Text Colors** | on-primary, on-secondary, on-surface | Implicit in light/dark | ⚠️ Could be clearer |
| **Containers** | primary-container, secondary-container | ❌ Missing | ⚠️ No lighter variants |
| **Light/Dark** | Separate theme files | `.light` / `.dark` properties | ⚠️ Different approach |

---

### **2. Token Hierarchy**

| Aspect | Material Design 3 | Wiley DS (Current) | Assessment |
|--------|------------------|-------------------|------------|
| **Layer 1** | Reference Tokens | `coreColors` | ✅ Same concept |
| **Layer 2** | System Tokens | `semanticColors` | ✅ Same concept |
| **Layer 3** | Component Tokens | Component styling | ⚠️ Not explicitly separated |
| **Naming** | `sys/color/primary` | `primary` | ⚠️ Flatter structure |

---

### **3. Button System**

| Aspect | Material Design 3 | Wiley DS (Current) | Assessment |
|--------|------------------|-------------------|------------|
| **Types** | Filled, Tonal, Outlined, Text, Elevated | Solid, Outline, Link | ⚠️ Missing Tonal, Elevated |
| **Colors** | Primary, Secondary, Tertiary, Error, Surface | Brand 1/2/3, Neutral Dark/Light | ✅ Similar (5 each) |
| **States** | Default, Hover, Focus, Pressed, Disabled | Hover only | ❌ Missing states |
| **Context** | Automatic per theme | Manual light/dark props | ⚠️ Similar approach |

---

### **4. Typography**

| Aspect | Material Design 3 | Wiley DS (Current) | Assessment |
|--------|------------------|-------------------|------------|
| **Roles** | Display, Headline, Title, Body, Label | Display, Heading, Body, Label | ✅ Very similar |
| **Scales** | Large, Medium, Small | xl, lg, md, sm | ✅ Same concept |
| **Responsive** | Built-in | Desktop/Mobile | ✅ Same approach |

---

## 🔍 **Key Learnings from MD3**

### **1. Semantic Naming is King**
❌ Bad: `color1`, `color2`, `color3`  
✅ Good: `primary`, `secondary`, `tertiary`

**Why**: Developers/designers know intent without documentation.

---

### **2. "On-" Pattern for Text Colors**
❌ Bad: `primary.light` (on what background?)  
✅ Good: `on-primary` (text color on primary background)

**Why**: Explicitly states relationship between colors.

---

### **3. Container Variants for Flexibility**
MD3 provides:
- `primary` (full strength)
- `primary-container` (lighter, for backgrounds)
- `on-primary-container` (text on container)

**Use case**: Cards, chips, badges need lighter brand colors.

---

### **4. State Layers for Interactions**
MD3 defines:
- Hover: `on-primary` at 8% opacity overlay
- Pressed: `on-primary` at 12% opacity overlay
- Focus: 2dp outline in `primary`
- Disabled: 38% opacity

**Why**: Consistent interaction feedback across all components.

---

### **5. Error State is Essential**
MD3 has dedicated error colors:
- `error` (for error buttons, alerts)
- `on-error` (text on error background)
- `error-container` (light error backgrounds)

**Question**: Should Wiley DS add error colors?

---

## 🛠️ **Recommendations for Wiley DS**

### **Immediate (High Priority)**

#### **1. Rename Color Roles**
```typescript
// CURRENT (Confusing)
color1 → Brand 1
color2 → Brand 2  
color3 → Brand 3

// RECOMMENDED (Clear)
color1 → primary
color2 → secondary
color3 → tertiary
```

**Why**: Matches MD3 and industry standard. Design team will understand instantly.

---

#### **2. Adopt "On-" Pattern**
```typescript
// CURRENT
semanticColors: {
  primary: {
    light: '#00d875',  // What is "light"?
    dark: '#008f8a'    // What is "dark"?
  }
}

// RECOMMENDED (MD3 Style)
semanticColors: {
  light: {  // Light theme
    primary: '#008f8a',           // Button background (teal)
    'on-primary': '#ffffff',      // Text on button (white)
    'primary-container': '#bff5dd', // Lighter bg
    'on-primary-container': '#003b44' // Text on container
  },
  dark: {  // Dark theme
    primary: '#00d875',           // Button background (bright green)
    'on-primary': '#ffffff',      // Text on button (white)
    'primary-container': '#003b44', // Darker bg
    'on-primary-container': '#bff5dd' // Text on container
  }
}
```

**Why**: Explicit, clear relationships, matches industry standard.

---

#### **3. Add Container Variants**
```typescript
// Needed for cards, badges, chips
primary-container: '#bff5dd'  // Light green background
on-primary-container: '#003b44' // Dark teal text
```

---

### **Medium Priority**

#### **4. Add Error Color**
```typescript
error: '#dc2626'           // Red for errors
'on-error': '#ffffff'      // White text on error
'error-container': '#fee2e2' // Light red background
```

---

#### **5. Explicit State Definitions**
```typescript
button: {
  states: {
    hover: { opacity: 0.08 },
    pressed: { opacity: 0.12 },
    focus: { outline: '2px', outlineOffset: '2px' },
    disabled: { opacity: 0.38 }
  }
}
```

---

### **Low Priority (Future)**

#### **6. Surface Colors**
```typescript
surface: '#ffffff'          // Default background
'on-surface': '#1c1b1f'    // Default text
'surface-variant': '#e7e0ec' // Alternative surfaces
```

#### **7. Neutral Variant**
```typescript
'neutral-variant': {
  0: '#ffffff',
  10: '#1c1b1f',
  // Slightly tinted neutrals for subtle emphasis
}
```

---

## 📝 **Questions for Design Team (Using MD3 as Reference)**

### **1. Color Naming**
> "Material Design 3 uses Primary/Secondary/Tertiary instead of Brand 1/2/3.  
> Should we adopt this naming for clarity?"

**Options:**
- A) Keep Brand 1/2/3 (Figma's naming)
- B) Change to Primary/Secondary/Tertiary (Industry standard)
- C) Support both (map Brand → Primary)

---

### **2. Container Variants**
> "MD3 provides lighter variants for backgrounds (primary-container).  
> Do we need these for cards/badges?"

**Use cases:**
- Feature cards with light brand color background
- Chips/badges with subtle brand tint
- Section backgrounds with brand accent

---

### **3. Error States**
> "MD3 has dedicated error colors for form validation and alerts.  
> Should we add error/warning/success colors?"

---

### **4. "On-" Naming Pattern**
> "MD3 explicitly names text colors (on-primary, on-surface).  
> Should we adopt this pattern for clarity?"

**Current**: Implicit (light/dark properties)  
**MD3**: Explicit (on-primary, on-surface)

---

## 🎯 **Next Steps**

### **Phase 1: Study Material Design 3** ✅
- [x] Understand MD3 architecture
- [x] Document color system
- [x] Document token hierarchy
- [ ] Extract MD3 tokens from Figma (if you provide file)

### **Phase 2: Compare with Wiley DS** ✅
- [x] Create comparison table
- [x] Identify gaps
- [x] Document learnings
- [x] Prepare recommendations

### **Phase 3: Study Other Design Systems** (Next)
- [ ] IBM Carbon (enterprise focus)
- [ ] Atlassian (multi-product)
- [ ] Shopify Polaris (e-commerce)
- [ ] Create meta-comparison

### **Phase 4: Refine Wiley DS** (After design team input)
- [ ] Update naming conventions
- [ ] Add missing token types
- [ ] Implement container variants
- [ ] Add error states
- [ ] Update documentation

---

## 📚 **Resources**

### **Material Design 3**
- Official Site: https://m3.material.io/
- Theme Builder: https://m3.material.io/theme-builder
- Color System: https://m3.material.io/styles/color/overview
- Components: https://m3.material.io/components

### **Implementation Examples**
- Android: https://developer.android.com/develop/ui/compose/designsystems/material3
- Web: https://github.com/material-components/material-web
- Flutter: https://docs.flutter.dev/ui/design/material

### **Figma Resources**
- Search: "Material Design 3 Kit"
- Search: "Material Theme Builder"
- Search: "Material You"

---

## 💡 **Key Takeaways**

1. **MD3 uses Primary/Secondary/Tertiary** (not Brand 1/2/3)
2. **"On-" pattern makes color relationships explicit**
3. **3-layer token system** (Reference → System → Component)
4. **Container variants provide flexibility**
5. **Error states are essential**
6. **State layers define all interactions**
7. **Light/Dark themes use same token names, different values**

**Our Wiley DS is ~80% aligned with MD3 best practices!**  
**Main gaps**: Naming conventions, container variants, error states.

---

## 🚀 **Status**

**Study Complete**: ✅ Phase 1 & 2  
**Next**: Get actual MD3 Figma file for token extraction  
**Then**: Study IBM Carbon, Atlassian, Shopify  
**Finally**: Design team meeting with specific questions

---

**Questions?** Let's discuss any section! 🎨

