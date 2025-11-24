# Catalyst V2 Architecture

## Philosophy: Section-Centric Model

V2 represents a fundamental rethinking of the page builder architecture. Instead of rigid page templates, **everything is a Shared Section**.

### Core Principle
> Pages are not templates with locked structures. Pages are **compositions of shared sections** with optional overrides.

## Architecture Overview

```
Theme
  └─ Shared Sections Library
      ├─ Headers (variations: base, minimal, compact)
      ├─ Footers (variations: full, compact, legal-only)
      ├─ Heroes (variations: centered, split, video, minimal)
      ├─ Content Blocks (variations: text, grid, flex, columns)
      └─ CTAs (variations: banner, modal, inline, sticky)

Website (inherits from Theme)
  ├─ Override/extend shared sections
  └─ Pages (compositions)
      └─ Page = [Header.minimal, Hero.centered, Content.grid, Footer.compact]
```

## Data Model

### 1. Shared Sections (Core Primitive)

```typescript
type SharedSection = {
  id: string
  name: string
  category: 'header' | 'footer' | 'hero' | 'content' | 'cta' | 'navigation' | 'announcement'
  
  // Multiple variations of the same section
  variations: {
    base: SectionVariation      // Default version
    minimal: SectionVariation   // Simplified version
    compact: SectionVariation   // Space-efficient version
    // ... custom variations
  }
  
  // Inheritance
  isGlobal: boolean           // Theme-level or website-specific?
  allowOverrides: boolean     // Can websites customize?
  lockLevel: 'unlocked' | 'locked' | 'admin-only'
  
  // Usage tracking
  usedBy: {
    websiteId: string
    pageIds: string[]
    hasOverrides: boolean
  }[]
}
```

### 2. Pages as Compositions

```typescript
type Page = {
  id: string
  name: string
  websiteId: string
  
  // Page is just an ordered list of section references
  composition: SectionCompositionItem[]
  
  status: 'draft' | 'published'
}

type SectionCompositionItem = {
  id: string                    // Unique instance ID
  sharedSectionId: string       // Reference to SharedSection
  variationKey: string          // Which variation ('base', 'minimal', etc.)
  
  // Optional page-specific customizations
  overrides?: {
    widgets?: Partial<Widget>[]
    background?: any
    layout?: any
  }
  
  // Inheritance tracking
  inheritFromTheme: boolean
  lastSyncedAt?: Date
  divergenceCount: number       // How many fields differ from theme version
}
```

### 3. Inheritance & Change Propagation

**Scenario 1: Update Theme Header**
```
1. Designer updates "Header.base" in Theme
2. System identifies all websites using this header
3. Websites with inheritFromTheme=true get automatic update
4. Websites with overrides get notification: "New version available"
5. Admin can:
   - Accept update (merge changes)
   - Reject update (keep overrides)
   - View diff
```

**Scenario 2: Website Overrides Section**
```
1. Website customizes Header.base (changes logo, adds menu item)
2. System creates override record
3. inheritFromTheme = false, divergenceCount++
4. Future theme updates don't auto-apply
5. Website sees: "3 theme updates available" with option to sync
```

## State Management

### Zustand Stores (Separated by Concern)

```typescript
// Shared Sections Library
useSharedSectionsStore
  - sections: SharedSection[]
  - addSection, updateSection, deleteSection
  - addVariation, updateVariation
  - getSectionsByCategory

// Websites & Pages
useWebsiteStore
  - websites: Website[]
  - addWebsite, updateWebsite
  - addPage, updatePage, publishPage

// Editor State (transient)
useEditorStore
  - composition: SectionCompositionItem[]  // Current page being edited
  - selectedSectionId: string
  - hasUnsavedChanges: boolean
  - addSection, reorderSections
```

## Component Architecture

```
src/v2/
  stores/
    sharedSectionsStore.ts    ✅ Manages section library
    websiteStore.ts           ✅ Manages websites & pages
    editorStore.ts            ✅ Editor state
  
  types/
    core.ts                   ✅ Clean type definitions
  
  components/
    Dashboard/                ✅ Landing page
    DesignConsole/            🚧 Manage websites/sections
    Editor/                   🚧 Section-based page builder
    Preview/                  🚧 Preview before publish
    Live/                     🚧 Mock live site
    Shared/
      V2Navigation.tsx        ✅ Top navigation
```

## Routing Structure

```
/v1                           → Legacy working demo (unchanged)

/v2                           → Dashboard
/v2/design                    → Design Console
/v2/design/shared-sections    → Section library
/v2/editor?site=X&page=Y      → Edit page
/v2/preview?site=X&page=Y     → Preview draft
/v2/live?site=X               → View live site
```

## Key Advantages Over V1

### ✅ Flexibility
- No rigid template structure
- Mix and match sections freely
- Add/remove/reorder sections on any page

### ✅ Reusability
- One header → used across 50 journals
- Update once → propagates everywhere (with control)

### ✅ Cleaner Inheritance
- Tracked at section level, not page level
- Clear divergence indicators
- Easy to sync or override

### ✅ Maintainability
- Separated stores (not one 5000-line monolith)
- Clear type definitions
- Each section is independent

### ✅ Discovery-Friendly
- Easy to experiment with different models
- Can add "template presets" later (just curated section lists)
- Flexible enough to pivot if needed

## Migration from V1

**V1 and V2 run side-by-side:**
- `/v1` → Keep for demos and production use
- `/v2` → Experimental, test new features
- No risk to existing work

**Eventually, if V2 proves superior:**
1. Port widgets/sections from V1 (already compatible)
2. Migrate data model
3. Deprecate V1

## Next Steps

1. ✅ Set up routing and navigation
2. 🚧 Implement Design Console (manage sections)
3. 🚧 Build Section-based Editor
4. 🚧 Implement inheritance tracking
5. 🚧 Test multi-journal workflow
6. 📊 Evaluate: Is section-centric better than template-centric?

## Decision Points to Test

- [ ] Can we build complex pages with just section composition?
- [ ] Is inheritance cleaner at section level vs page level?
- [ ] Do we still need "templates" or are they just presets?
- [ ] How do overrides feel in practice?
- [ ] Can we track changes effectively across multiple journals?

---

**Status:** 🚧 Foundation Complete, Building Features

**Goal:** Discover the right architecture through experimentation, not theory.

