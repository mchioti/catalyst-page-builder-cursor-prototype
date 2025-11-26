# REVISED V1 + V2 Refactoring Plan
**After Understanding V1's Full Design Console**
**Prepared:** Nov 26, 2025

---

## 🚨 CRITICAL REALIZATIONS

### **What V1 ACTUALLY Has (That I Missed)**

**V1 Design Console is a complete system:**

```
DESIGNS (Theme-Level)
├── Design Settings → ThemeEditor (colors, typography, spacing)
├── Publication Cards → Theme-level card variants
├── Template Library → Publication page templates (Journal Home, Article, Search)
├── Stub Library → Website/Supporting pages (Homepage, About, Contact, Privacy)
└── Section Library → Reusable sections (Header/Footer, Hero/Features)
    ↳ Saved to: customSections[] (localStorage)

WEBSITES (Website-Level)
├── Website Settings → Domain, content types, organization
├── Branding Configuration → Logo, colors, fonts (overrides theme)
├── Templates → Enabled templates from theme
├── Publication Cards → Customized from theme cards
└── Stubs → User-created pages
    ↳ Saved to: customStarterPages[] (localStorage)
```

**Data Flow:**
```
1. User creates section in canvas
2. Clicks "Save as Section" 
3. → addCustomSection(section)
4. → customSections array updated
5. → localStorage persisted
6. → Shows in Design Console → Section Library
7. → Can load into canvas later
```

### **What V2 Has (Cleaner But Incomplete)**

```
SharedSections (Global Library)
├── Structured with variations
├── Template variables {journal.name}
├── Inheritance tracking
└── Usage maps (which pages use it)

Websites & Journals
├── Hierarchical (journals within websites)
└── Page compositions (references to SharedSections)

Missing:
❌ No canvas editor
❌ No properties panel
❌ No save-to-library workflow
❌ No Templates vs Stubs distinction
```

---

## 🎯 **CORRECT MERGE STRATEGY**

### **Core Principle:**
**V2's SharedSections REPLACES V1's customSections**

Both serve the same purpose (reusable sections library), but V2's is better:
- ✅ Structured variations (Full Header, Minimal Header)
- ✅ Template variables (dynamic content)
- ✅ Inheritance tracking (knows what pages use it)
- ✅ Global vs Website-specific

---

## 🔄 **CRITICAL: V1 Templates vs V2 Compositions - BOTH STAY!**

### **Why V1's Publication Page Templates MUST Stay:**

**V1 Templates handle HIERARCHICAL INHERITANCE:**
```
Global Template (Base) - "Journal Home Template"
  ↓ inherits structure, can customize
Journal-Level ("JAS Journal Home") - Custom branding/widgets
  ↓ inherits from journal, can customize  
Page-Level ("JAS Vol 5 Issue 3") - Specific content
```

**Stored in:**
- `globalTemplateCanvas[]` - Base template (all journals)
- `journalTemplateCanvas[journalCode]` - Journal-specific (e.g., 'JAS')
- `routeCanvasItems[route]` - Page-specific (e.g., '/jas/issue/5-3')

**Features:**
- **Divergence tracking** - Know exactly what changed at each level
- **Promotion system** - "Promote to Journal", "Promote to Base", "Reset to Base"
- **Update propagation** - Change base → affects all journals (unless overridden)
- **Complex publishing workflows** - Proven for publication pages

**Use Cases:**
- Journal Home (different per journal, inherits structure)
- Article Page (varies per article, inherits journal branding)
- Table of Contents (varies per issue, inherits journal structure)
- Search Results (customized per site)

---

### **V2's Page Compositions - NEW, COMPLEMENTARY:**

**V2 Compositions handle FLAT SECTION ASSEMBLY:**
```
Page {
  composition: [
    { sharedSectionId: 'header-main', variationKey: 'full' },
    { sharedSectionId: 'hero-banner', variationKey: 'homepage' },
    { sharedSectionId: 'footer', variationKey: 'default' }
  ]
}
```

**Features:**
- **Section reuse** - Mix and match SharedSections
- **Template variables** - Dynamic content (`{journal.name}`)
- **No hierarchy** - Flat composition model
- **Flexibility** - Easy to swap sections

**Use Cases:**
- Marketing pages (Homepage, About, Contact)
- Landing pages (mix and match sections)
- Simple pages (no inheritance needed)

---

### **Coexistence Strategy - Use BOTH:**

| Page Type | System | Why |
|-----------|--------|-----|
| **Journal Home** | V1 Templates | Hierarchical (Global → Journal → Page) |
| **Article Page** | V1 Templates | Complex inheritance, branding |
| **TOC / Issue** | V1 Templates | Data-driven, inherits structure |
| **Homepage** | V2 Compositions | Simple composition, no hierarchy |
| **About Page** | V2 Compositions | One-off page, section-based |
| **Landing Pages** | V2 Compositions | Flexible, mix-match sections |

**Shared by BOTH:**
- ✅ **SharedSections** (headers, footers) - Reusable components
- ✅ **Template Variables** (`{journal.name}`) - Dynamic content
- ✅ **V1 Canvas & Properties** - Visual editing

**Result:** Best of both worlds! Use the right tool for each job.

---

## 📊 **THE COMPLETE MERGED DATA MODEL**

```typescript
// UNIFIED ZUSTAND STORE (AppV1.tsx)
export const usePageStore = create<PageState>((set, get) => ({
  
  // ========================================================================
  // DESIGN SYSTEM (Theme-Level) - KEEP FROM V1
  // ========================================================================
  themes: Theme[]  // V1's themes with foundation/semantic colors
  
  // KEEP: V1's Hierarchical Publication Page Templates
  // These handle complex inheritance: Global → Journal → Page
  // Example: publication-pages → journal-pages → journal-home
  templates: Template[]  // Publication page templates (Journal Home, Article, TOC)
  globalTemplateCanvas: []  // Base template level
  journalTemplateCanvas: {}  // Journal-specific customizations
  routeCanvasItems: {}  // Page-specific customizations
  
  // Templates track hierarchical modifications and allow promotion:
  // - Individual page can "reset to journal" or "promote to journal"
  // - Journal template can "reset to base" or "promote to base"
  templateModifications: TemplateModification[]  // Divergence tracking
  
  // Theme-level publication cards
  publicationCardVariants: PublicationCardVariant[]  // KEEP - V1's card system
  
  
  // ========================================================================
  // SHARED SECTIONS - REPLACE V1's customSections WITH V2's SharedSections
  // ========================================================================
  
  // OLD (V1): customSections: CustomSection[]  ← DELETE THIS
  // NEW (V2): sharedSections: SharedSection[]  ← ADD THIS
  
  sharedSections: SharedSection[]  // V2's section library with variations
  
  // Actions for SharedSections
  addSharedSection: (section) => {...}
  updateSharedSection: (id, updates) => {...}
  deleteSharedSection: (id) => {...}
  addVariation: (sectionId, variation) => {...}
  updateVariation: (sectionId, variationKey, updates) => {...}
  
  
  // ========================================================================
  // WEBSITES & PAGES - MERGE V1 + V2
  // ========================================================================
  
  websites: Website[]  // Merge V1's + V2's Website type
  
  // Website type combines:
  // - V1: branding, themeId, modifications, deviationScore
  // - V2: pages[], journals[]
  
  // Each Website has:
  Website {
    // V1 fields
    id, name, domain, themeId, brandMode
    branding: { primaryColor, logoUrl, fontFamily }
    modifications: Modification[]  // Track theme overrides
    deviationScore: number  // How far from theme
    
    // V2 fields (NEW)
    pages: Page[]  // Page compositions
    journals: Journal[]  // Journals within this website
  }
  
  // Each Page references SharedSections (V2 model)
  Page {
    id, name, slug, websiteId, journalId?
    composition: SectionCompositionItem[] {
      sharedSectionId: 'header-main'
      variationKey: 'full'
      inheritFromTheme: true
      overrides?: {...}
    }
  }
  
  
  // ========================================================================
  // CANVAS EDITOR - KEEP V1's SYSTEM
  // ========================================================================
  
  canvasItems: CanvasItem[]  // V1's canvas (for live editing)
  selectedWidget: string | null
  
  // When editing a SharedSection:
  // 1. Load section.variations[key].widgets → canvasItems
  // 2. Edit in V1's canvas (drag/drop, properties panel)
  // 3. Save: updateSharedSection(id, { variations: { [key]: { widgets: canvasItems } } })
  
  
  // ========================================================================
  // TEMPLATE SYSTEM - KEEP V1's HIERARCHICAL TEMPLATES
  // ========================================================================
  
  // Templates = Publication page templates (inherit data down hierarchy)
  // Example: Journal Home template → can be customized per journal
  
  routeCanvasItems: {}  // Route-specific customizations (KEEP for now)
  globalTemplateCanvas: []  // Global template base (KEEP)
  journalTemplateCanvas: {}  // Journal-specific (KEEP)
  
  templateModifications: TemplateModification[]  // Track divergence
  exemptedRoutes: Set<string>  // Pages exempt from updates
  
  
  // ========================================================================
  // STUBS (Full-Page Templates) - KEEP V1's SYSTEM
  // ========================================================================
  
  customStarterPages: StarterPage[]  // User-created full pages (KEEP)
  // Stubs = Marketing/creative pages (Homepage, About, Contact)
  // Copy-paste workflow, no inheritance
  
  
  // ========================================================================
  // PERSISTENCE - NEW STRATEGY
  // ========================================================================
  
  // OLD: customSections → localStorage
  // NEW: sharedSections → Could use localStorage OR database API
  
  // For prototype: Keep localStorage
  saveSharedSectionsToStorage: () => {...}
  loadSharedSectionsFromStorage: () => {...}
}))
```

---

## 🔄 **REFACTORING PHASES (REVISED)**

### **Phase 1: Add SharedSections to V1 Store** (1 hour)

**Files:**
- `src/AppV1.tsx` - Add V2's SharedSection state + actions
- `src/v2/stores/sharedSectionsStore.ts` - Copy logic into AppV1

**Changes:**
```typescript
// In AppV1.tsx, ADD:
import type { SharedSection, SectionVariation } from './v2/types/core'

export const usePageStore = create<PageState>((set, get) => ({
  // ... existing V1 state ...
  
  // NEW: SharedSections (replaces customSections)
  sharedSections: [] as SharedSection[],
  
  addSharedSection: (section: SharedSection) => set((state) => ({
    sharedSections: [...state.sharedSections, section]
  })),
  
  updateSharedSection: (id: string, updates: Partial<SharedSection>) => set((state) => ({
    sharedSections: state.sharedSections.map(s =>
      s.id === id ? { ...s, ...updates, updatedAt: new Date() } : s
    )
  })),
  
  // ... add all V2's SharedSection actions ...
  
  // MIGRATE: Convert old customSections to SharedSections on load
  migrateCustomSections: () => {
    const state = get()
    const migrated = state.customSections.map(oldSection => ({
      id: oldSection.id,
      name: oldSection.name,
      category: 'content' as const,
      variations: {
        base: {
          id: 'base',
          name: 'Base',
          widgets: oldSection.canvasItems || [],
          layout: 'one-column' as const,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      },
      isGlobal: false,
      websiteId: oldSection.websiteId,
      allowOverrides: true,
      lockLevel: 'unlocked' as const,
      usedBy: [],
      createdAt: oldSection.createdAt || new Date(),
      updatedAt: oldSection.updatedAt || new Date()
    }))
    
    set({ sharedSections: migrated })
  }
}))
```

---

### **Phase 2: Update V1's Section Library UI** (1 hour)

**Goal:** Make V1's Design Console → Section Library show SharedSections with variations

**File:** `src/components/SiteManager/SiteManagerTemplates.tsx`

**Current State:**
- Shows `customSections` (flat list from localStorage)
- No variations support
- Simple "Load" button

**New State:**
- Shows `sharedSections` (with variations)
- Category badges (Header, Footer, Hero, Content)
- Usage tracking ("Used by X pages")
- Variation selector
- Edit/Preview buttons per variation

**UI Changes:**
```typescript
// Replace line that gets customSections:
// OLD: const { customSections } = usePageStore()
// NEW: const { sharedSections } = usePageStore()

// Filter sections by category for the current view
const filteredSections = sharedSections.filter(section => {
  if (selectedCategory === 'global') {
    return section.category === 'header' || section.category === 'footer'
  }
  if (selectedCategory === 'section') {
    return section.category === 'hero' || section.category === 'content'
  }
  return false
})

// Enhanced section card UI:
<div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition">
  {/* Header */}
  <div className="flex items-start justify-between mb-4">
    <div>
      <h3 className="text-lg font-semibold text-gray-900">{section.name}</h3>
      <div className="flex items-center gap-2 mt-2">
        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
          {section.category}
        </span>
        {section.usedBy.length > 0 && (
          <span className="text-xs text-gray-500">
            Used by {section.usedBy.length} pages
          </span>
        )}
      </div>
    </div>
  </div>
  
  {/* Variations */}
  <div className="space-y-2">
    <div className="text-sm font-medium text-gray-700 mb-2">
      Variations ({Object.keys(section.variations).length})
    </div>
    {Object.entries(section.variations).map(([key, variation]) => (
      <div key={key} className="flex items-center justify-between bg-gray-50 rounded p-3">
        <div>
          <div className="font-medium text-gray-900">{variation.name}</div>
          <div className="text-xs text-gray-500">
            {variation.widgets.length} widgets • {variation.layout}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleEditVariation(section.id, key)}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Edit
          </button>
          <button 
            onClick={() => handlePreviewVariation(section.id, key)}
            className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Preview
          </button>
        </div>
      </div>
    ))}
  </div>
  
  {/* Actions */}
  <div className="flex items-center gap-2 mt-4 pt-4 border-t">
    <button 
      onClick={() => handleAddVariation(section.id)}
      className="text-sm text-blue-600 hover:underline"
    >
      + Add Variation
    </button>
    <button 
      onClick={() => handleDeleteSection(section.id)}
      className="ml-auto text-sm text-red-600 hover:underline"
    >
      Delete Section
    </button>
  </div>
</div>
```

**New Handler Functions:**
```typescript
const handleEditVariation = (sectionId: string, variationKey: string) => {
  // Option 1: Load into V1 canvas
  const section = sharedSections.find(s => s.id === sectionId)
  const variation = section?.variations[variationKey]
  if (variation) {
    // Convert variation widgets to canvas section
    const sectionItem = createSectionFromVariation(section, variation)
    replaceCanvasItems([sectionItem])
    setCurrentView('page-builder')
  }
  
  // Option 2 (later): Navigate to V2's rebuilt section editor
  // navigate(`/v2/design/section/${sectionId}/${variationKey}`)
}

const handleAddVariation = (sectionId: string) => {
  const newVariationName = prompt('Variation name:')
  if (!newVariationName) return
  
  const section = sharedSections.find(s => s.id === sectionId)
  const baseVariation = Object.values(section.variations)[0]
  
  addVariation(sectionId, {
    id: nanoid(),
    name: newVariationName,
    widgets: [...baseVariation.widgets], // Clone base
    layout: baseVariation.layout,
    createdAt: new Date(),
    updatedAt: new Date()
  })
}
```

---

### **Phase 3: Add "Save as Section" to Canvas** (1 hour)

**Goal:** When user creates something in canvas, save it as SharedSection

**File:** `src/components/PageBuilder/index.tsx`

**Add Button:**
```typescript
// In PageBuilder toolbar:
<button onClick={handleSaveAsSharedSection}>
  💾 Save as Shared Section
</button>

// Handler:
const handleSaveAsSharedSection = () => {
  const { canvasItems, addSharedSection } = usePageStore.getState()
  
  const sectionName = prompt('Section name:')
  if (!sectionName) return
  
  const category = prompt('Category (header/footer/hero/content):') as SectionCategory
  
  const newSection: SharedSection = {
    id: nanoid(),
    name: sectionName,
    category: category || 'content',
    variations: {
      base: {
        id: 'base',
        name: 'Base',
        widgets: canvasItems.flatMap(item => 
          isSection(item) ? item.areas.flatMap(a => a.widgets) : [item]
        ),
        layout: 'one-column',  // Or detect from first section
        createdAt: new Date(),
        updatedAt: new Date()
      }
    },
    isGlobal: true,
    allowOverrides: true,
    lockLevel: 'unlocked',
    usedBy: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }
  
  addSharedSection(newSection)
  
  // Success notification
  addNotification({
    type: 'success',
    title: 'Section Saved',
    message: `"${sectionName}" saved to Section Library`
  })
}
```

---

### **Phase 4: Template Variables in V1 Renderer** (1-2 hours)

**Goal:** Enable `{journal.name}` in V1's widget renderers

**Files:**
- `src/components/Widgets/WidgetRenderer.tsx`
- `src/components/Sections/SectionRenderer.tsx`

**Copy from V2:**
- `src/v2/utils/templateVariables.ts` → Import into V1

**Changes:**
```typescript
// In TextWidgetRenderer, HeadingWidgetRenderer, etc:
import { resolveTemplateVariables, type TemplateContext } from '../../v2/utils/templateVariables'

const TextWidgetRenderer = ({ widget, templateContext }) => {
  const resolvedText = templateContext 
    ? resolveTemplateVariables(widget.text, templateContext)
    : widget.text
  
  return <div>{resolvedText}</div>
}

// Pass templateContext down from top:
// MockLiveSite → LayoutRenderer → SectionRenderer → WidgetRenderer
```

---

### **Phase 5: Merge V1 + V2 Websites** (1 hour)

**Goal:** Combine V1's Website type with V2's

**File:** `src/types/templates.ts` (V1's types)

**Changes:**
```typescript
// MERGE V1's Website + V2's Website
export type Website = {
  // V1 fields (KEEP ALL)
  id: string
  name: string
  domain: string
  themeId: string
  brandMode: 'wiley' | 'wt' | 'dummies'
  status: 'active' | 'staging' | 'archived'
  modifications: Modification[]  // Track overrides
  branding: {
    primaryColor?: string
    secondaryColor?: string
    logoUrl?: string
    fontFamily?: string
  }
  purpose?: {
    contentTypes: string[]
    hasSubjectOrganization: boolean
    publishingTypes: string[]
  }
  deviationScore: number
  lastThemeSync: Date
  
  // V2 fields (ADD)
  pages: Page[]  // Page compositions (from V2)
  journals: Journal[]  // Journals within website (from V2)
  
  // Dates
  createdAt: Date
  updatedAt: Date
}
```

**Update Mock Data:**
```typescript
// src/data/mockWebsites.ts - ADD pages from V2
export const mockWebsites: Website[] = [
  {
    id: 'catalyst-demo-site',
    // ... existing V1 fields ...
    
    // NEW: Add pages from V2
    pages: catalystDemoSite.pages,  // Import from V2
    journals: [journalOfScience, openAccessBiology, historicalChemistry]  // From V2
  },
  
  {
    id: 'febs-press',
    // ... existing V1 fields ...
    
    // NEW: Add pages
    pages: [],  // Empty for now
    journals: []
  }
]
```

---

### **Phase 6: Connect V2 Section Editor to V1 Canvas** (2 hours)

**Goal:** When editing a SharedSection in V2, use V1's canvas

**File:** `src/v2/components/DesignConsole/SectionEditor.tsx`

**REPLACE entire component:**
```typescript
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSharedSectionsStore } from '../../stores/sharedSectionsStore'
import { usePageStore } from '../../../AppV1'  // V1's store
import { LayoutRenderer } from '../../../components/Canvas/LayoutRenderer'
import { PropertiesPanel } from '../../../components/Properties/PropertiesPanel'
import { WidgetLibrary } from '../../../components/Library/WidgetLibrary'
import { DndContext } from '@dnd-kit/core'

export function SectionEditor() {
  const { sectionId, variationKey } = useParams()
  const navigate = useNavigate()
  
  // Get SharedSection from V2 store
  const section = useSharedSectionsStore(s => s.getSectionById(sectionId!))
  const updateVariation = useSharedSectionsStore(s => s.updateVariation)
  const variation = section?.variations[variationKey!]
  
  // Use V1's canvas system for editing
  const { canvasItems, replaceCanvasItems, selectedWidget } = usePageStore()
  
  // Load variation widgets into V1's canvas
  useEffect(() => {
    if (variation) {
      // Convert flat widgets → canvasItems (single section)
      const sectionItem = {
        id: `section-${sectionId}-${variationKey}`,
        name: variation.name,
        type: 'content-block',
        layout: variation.layout,
        areas: [{
          id: nanoid(),
          name: 'Content',
          widgets: variation.widgets
        }],
        flexConfig: variation.flexConfig,
        gridConfig: variation.gridConfig,
        background: variation.background,
        contentMode: variation.contentMode
      }
      
      replaceCanvasItems([sectionItem])
    }
  }, [sectionId, variationKey])
  
  // Save changes back to SharedSection
  const handleSave = () => {
    const sectionItem = canvasItems[0]
    if (isSection(sectionItem)) {
      const updatedWidgets = sectionItem.areas.flatMap(a => a.widgets)
      
      updateVariation(sectionId!, variationKey!, {
        widgets: updatedWidgets,
        layout: sectionItem.layout,
        flexConfig: sectionItem.flexConfig,
        gridConfig: sectionItem.gridConfig,
        background: sectionItem.background,
        contentMode: sectionItem.contentMode
      })
      
      // Navigate back
      navigate('/v2/design')
    }
  }
  
  return (
    <div className="h-screen flex">
      {/* Left: Widget Library */}
      <div className="w-64 bg-gray-100 border-r">
        <WidgetLibrary />
      </div>
      
      {/* Center: V1's Visual Canvas */}
      <div className="flex-1 overflow-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between z-10">
          <h2 className="font-semibold">
            Editing: {section?.name} → {variation?.name}
          </h2>
          <div className="flex gap-2">
            <button onClick={() => navigate('/v2/design')} className="btn-secondary">
              Cancel
            </button>
            <button onClick={handleSave} className="btn-primary">
              💾 Save Section
            </button>
          </div>
        </div>
        
        {/* V1's Canvas Renderer */}
        <DndContext>
          <LayoutRenderer 
            canvasItems={canvasItems}
            isLiveMode={false}  // Editor mode
            usePageStore={usePageStore}
            // ... all V1 canvas props
          />
        </DndContext>
      </div>
      
      {/* Right: V1's Properties Panel */}
      <div className="w-80 bg-slate-100 border-l">
        <PropertiesPanel 
          usePageStore={usePageStore}
          // ... all V1 props
        />
      </div>
    </div>
  )
}
```

**Result:** V2's Section Editor now has V1's full canvas! 🎉

---

### **Phase 7: Update V1's Design Console → Section Library** (1 hour)

**Goal:** Show SharedSections (not customSections) in V1's Design Console

**File:** `src/components/SiteManager/SiteManagerTemplates.tsx`

**When `libraryType === 'sections'`:**

```typescript
// REPLACE: const { customSections } = usePageStore()
// WITH: const { sharedSections } = usePageStore()

// Show SharedSections with variations
const sectionsByCategory = {
  global: sharedSections.filter(s => s.category === 'header' || s.category === 'footer'),
  content: sharedSections.filter(s => s.category === 'hero' || s.category === 'content')
}

// For each section, show card with variations
<div className="section-card">
  <h3>{section.name}</h3>
  <p className="text-sm text-gray-600">
    {Object.keys(section.variations).length} variations
  </p>
  
  {/* Show variations */}
  <div className="variations-list">
    {Object.entries(section.variations).map(([key, variation]) => (
      <button 
        onClick={() => {
          // Option 1: Load into V1 canvas for editing
          loadSectionIntoCanvas(section.id, key)
          
          // OR Option 2: Navigate to V2's section editor
          navigate(`/v2/design/section/${section.id}/${key}`)
        }}
        className="variation-button"
      >
        {variation.name} ({variation.widgets.length} widgets)
      </button>
    ))}
  </div>
  
  {/* Add Variation button */}
  <button onClick={() => handleAddVariation(section.id)}>
    + Add Variation
  </button>
</div>
```

---

### **Phase 8: Clean Up Mock Live Site Templates** (30 mins)

**Goal:** Remove redundant template hierarchy, use SharedSections instead

**Files:**
- `src/components/MockLiveSite/index.tsx`
- `src/data/mockStarterPages.ts`

**Changes:**
- Remove old routeCanvasItems that duplicate SharedSections
- Use V2's composition resolver for pages
- Keep only unique templates (like TOC) that aren't covered by SharedSections

---

### **Phase 9: Update V1's Websites with V2's Pages** (1 hour)

**File:** `src/data/mockWebsites.ts` (V1's version)

**Changes:**
```typescript
// Import V2's pages
import { 
  catalystHomepage,
  catalystAbout,
  journalScienceHome,
  // ... all V2 pages
} from '../v2/data/mockWebsites'

export const mockWebsites: Website[] = [
  {
    id: 'catalyst-demo-site',
    // ... existing V1 fields ...
    
    // ADD: Pages from V2
    pages: [
      catalystHomepage,
      catalystAbout,
      journalScienceHome,
      journalScienceArchive,
      journalScienceIssue,
      journalScienceArticle,
      // ... etc
    ],
    
    // ADD: Journals from V2
    journals: [
      {
        id: 'jas',
        name: 'Journal of Advanced Science',
        // ... journal metadata from V2
      },
      // ... more journals
    ]
  }
]
```

---

### **Phase 10: Update V1's MockLiveSite to Use Page Compositions** (1-2 hours)

**Goal:** Render pages from composition (not hardcoded canvasItems)

**File:** `src/components/MockLiveSite/index.tsx`

**Current Logic:**
```typescript
// OLD: Hardcoded routes
if (route === '/') return <LayoutRenderer canvasItems={homepageCanvas} />
if (route === '/about') return <LayoutRenderer canvasItems={aboutCanvas} />
```

**New Logic:**
```typescript
// NEW: Find page by route, resolve composition
const currentWebsite = websites.find(w => w.id === currentWebsiteId)
const currentPage = currentWebsite?.pages.find(p => p.slug === route)

if (currentPage) {
  // Use V2's composition resolver
  const resolvedSections = resolvePageComposition(
    currentPage.composition,
    sharedSections,
    templateContext  // Journal/page data for variables
  )
  
  return <LayoutRenderer canvasItems={resolvedSections} isLiveMode={true} />
}
```

**Import:**
```typescript
import { resolvePageComposition } from '../v2/utils/compositionResolver'
```

---

## 🎨 **UI/UX: WHAT STAYS vs WHAT CHANGES**

### **V1 Design Console (KEEP - It's Complete!)**

**Navigation Structure:**
```
Left Sidebar:
├── [+ Add Website]
├── Websites (overview)
│   ├── 📍 Catalyst Demo
│   │   ├── Settings
│   │   ├── Branding Configuration  
│   │   ├── Templates (Journal Home, Article, etc.)
│   │   ├── Publication Cards
│   │   └── Stubs (custom saved pages)
│   └── 📍 FEBS Press
│       └── (same structure)
│
└── Designs (themes)
    ├── 🎨 Modernist Theme
    │   ├── Design Settings (colors, typography)
    │   ├── Publication Cards (theme-level)
    │   ├── Templates (page templates)
    │   ├── Stubs (website pages)
    │   └── Sections (reusable components)  ← THIS IS KEY!
    └── 🎨 Other Themes
```

**✅ KEEP THIS ENTIRE UI** - It's well-designed and functional!

---

### **V2 Design Console (DELETE - It's Incomplete)**

**V2's Structure (INCOMPLETE):**
```
Top Level:
├── Websites → Card-based view (nice but redundant with V1)
└── Design → Only shows SharedSections list (missing themes, templates)
```

**❌ DELETE:**
- `src/v2/components/DesignConsole/DesignConsole.tsx` - Only 15 lines, shows SharedSections
- `src/v2/components/Websites/Websites.tsx` - Card-based view (redundant with V1)
- `src/v2/components/Websites/WebsiteDetail.tsx` - MAYBE keep for inspiration

**Why delete?** V1's is complete; V2's is a prototype

---

### **What Changes in V1 Design Console**

**Only ONE change needed in V1's UI:**

**Designs → [Theme] → Sections tab**

**Before (Current V1):**
```typescript
// Shows: customSections (from localStorage)
// Structure: Flat list of saved sections

[Section Card]
  Name: "Homepage Hero"
  Widgets: 5
  [Load into Canvas]
  [Delete]
```

**After (Enhanced):**
```typescript
// Shows: sharedSections (with variations)
// Structure: Sections with variation dropdown

[Section Card]
  Name: "Main Header"
  Category: Header
  Used by: 12 pages across 2 websites
  
  Variations:
    ├── Full (8 widgets) → [Edit] [Preview]
    └── Minimal (3 widgets) → [Edit] [Preview]
  
  [+ Add Variation]
  [Delete Section]
```

**File to update:** `src/components/SiteManager/SiteManagerTemplates.tsx`
- Currently shows `customSections`
- Will show `sharedSections` instead
- Add UI for variations (dropdown/tabs)
- Add "Used by" count

---

## 🗂️ **WHAT STAYS vs WHAT CHANGES**

### **KEEP FROM V1 (Don't Touch):**
✅ PageBuilder canvas (1,970 lines) - Works perfectly
✅ PropertiesPanel (3,693 lines) - All widget editing
✅ WidgetRenderer (2,244 lines) - All widget types
✅ DnD system - Drag & drop works
✅ LayoutRenderer - Visual canvas rendering
✅ SectionRenderer - Section rendering with areas
✅ Theme system - Foundation/semantic colors, multi-brand
✅ Templates (Publication page templates) - Journal Home, Article, etc.
✅ Stubs (customStarterPages) - Full-page templates
✅ Publication Cards - Card variants system
✅ **Design Console UI** - Entire left sidebar navigation + all views (Settings, Branding, Templates, etc.)

### **REPLACE IN V1:**
❌ `customSections` → `sharedSections` (V2's model)
❌ Manual section loading → Composition-based rendering

### **ADD TO V1:**
✨ SharedSection type + actions (from V2)
✨ Template variables resolution (from V2)
✨ Page compositions (from V2)
✨ Journal entities (from V2)
✨ Inheritance tracking (from V2)

### **UPDATE IN V1:**
🔄 Design Console → Section Library (show SharedSections)
🔄 MockLiveSite (use composition resolver)
🔄 Website type (add pages, journals fields)

### **DELETE FROM V2:**
🗑️ `src/v2/components/DesignConsole/DesignConsole.tsx` - Incomplete, only shows sections list
🗑️ `src/v2/components/DesignConsole/SharedSectionsList.tsx` - Replaced by V1's section library
🗑️ `src/v2/components/DesignConsole/SectionEditor.tsx` - Will be rebuilt to use V1 canvas
🗑️ `src/v2/components/Websites/Websites.tsx` - Redundant with V1's website manager
🗑️ Possibly: `src/v2/components/Websites/WebsiteDetail.tsx` - Depends on if we need it

### **DELETE FROM V1:**
🗑️ `customSections` state and localStorage code - Replaced by SharedSections
🗑️ Old section loading logic - Replaced by composition resolver

---

## 🎯 **REVISED TIMELINE**

| Phase | Task | Time | Risk |
|-------|------|------|------|
| 1 | Add SharedSections to V1 store | 1h | Low |
| 2 | Update Section Library UI | 1h | Low |
| 3 | Add "Save as Section" button | 1h | Low |
| 4 | Template variables in renderers | 1-2h | Medium |
| 5 | Merge V1+V2 Website types | 1h | Low |
| 6 | Connect V2 editor to V1 canvas | 2h | Medium |
| 7 | Update MockLiveSite rendering | 1-2h | Medium |
| 8 | Clean up redundant code | 1h | Low |
| **Total** | **Complete Integration** | **9-12h** | **Medium** |

**Expected:** 2 work sessions + breaks

---

## 💾 **PERSISTENCE STRATEGY**

### **SharedSections Storage**

**Option A: LocalStorage (Match V1 pattern)**
```typescript
// Save to localStorage (just like customSections did)
const saveSharedSectionsToStorage = () => {
  localStorage.setItem('catalyst-shared-sections', JSON.stringify(sharedSections))
}

// Load on init
const loadSharedSectionsFromStorage = () => {
  const stored = localStorage.getItem('catalyst-shared-sections')
  return stored ? JSON.parse(stored) : []
}
```

**Option B: Merge with Mock Data**
```typescript
// Combine V2's mock sections + user-created sections
sharedSections: [
  ...mockSharedSections,  // From V2's mockSharedSections.ts
  ...loadFromLocalStorage()  // User-created sections
]
```

**Recommendation:** Option B - Matches V1's pattern for customStarterPages

---

## 🔄 **DATA MIGRATION PLAN**

### **Existing V1 Users**

If someone has `customSections` in localStorage:

```typescript
// On app load, run once:
const migrateV1Sections = () => {
  const oldSections = loadFromLocalStorage('catalyst-custom-sections', [])
  
  if (oldSections.length > 0) {
    const migrated = oldSections.map(old => ({
      id: old.id,
      name: old.name,
      category: guessCategory(old),  // Helper function
      variations: {
        base: {
          id: 'base',
          name: 'Base',
          widgets: extractWidgets(old.canvasItems),  // Helper
          layout: detectLayout(old),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      },
      isGlobal: false,
      allowOverrides: true,
      lockLevel: 'unlocked',
      usedBy: [],
      createdAt: old.createdAt || new Date(),
      updatedAt: new Date()
    }))
    
    // Save as SharedSections
    localStorage.setItem('catalyst-shared-sections', JSON.stringify(migrated))
    
    // Clear old storage
    localStorage.removeItem('catalyst-custom-sections')
    
    console.log(`✅ Migrated ${migrated.length} sections to new format`)
  }
}
```

---

## 🧪 **TESTING STRATEGY**

### **After Each Phase, Test:**

**1. V1 Canvas Still Works**
- Open V1 Page Builder
- Drag widget from library
- Edit properties
- Save page

**2. SharedSections Work**
- Create section in canvas
- Click "Save as Shared Section"
- See it in Design Console → Section Library
- Load it back into canvas

**3. Template Variables Resolve**
- Edit Journal Banner section
- Use `{journal.name}` in text widget
- View live site
- Verify "Journal of Advanced Science" appears

**4. V2 Section Editor Works**
- Navigate to `/v2/design/section/header-main/full`
- See V1's visual canvas (not gray box)
- Edit widgets
- Save → Updates SharedSection

**5. MockLiveSite Renders Correctly**
- View `/v1` mock live site
- Pages render from compositions
- Template variables resolve
- No console errors

---

## 🎨 **VISUAL COMPARISON**

### **Before Refactor:**
```
V1: ✅ Canvas ✅ Properties ❌ SharedSections ❌ Template Variables
V2: ❌ Canvas ❌ Properties ✅ SharedSections ✅ Template Variables
```

### **After Refactor:**
```
UNIFIED: ✅ Canvas ✅ Properties ✅ SharedSections ✅ Template Variables
         ✅ Templates ✅ Stubs ✅ Publication Cards ✅ Themes
```

**Single app with all features!** 🎉

---

## 📁 **FILE ORGANIZATION (After Refactor)**

```
src/
├── AppV1.tsx → RENAME TO → App.tsx
│   └── Unified Zustand store with V1 + V2 state
│
├── types/
│   ├── index.ts (V1 types)
│   ├── widgets.ts (V1 widgets)
│   ├── templates.ts (V1 templates/websites)
│   └── core.ts (NEW: V2's SharedSection, Page, Journal types)
│
├── components/
│   ├── PageBuilder/ (V1 canvas - KEEP)
│   ├── Properties/ (V1 properties - KEEP)
│   ├── Canvas/ (V1 renderers - KEEP, enhance with template variables)
│   ├── Widgets/ (V1 widget renderers - KEEP, enhance)
│   ├── DesignConsole/ (V1 Design Console - ENHANCE to show SharedSections)
│   └── SiteManager/ (V1 site manager - ENHANCE)
│
├── v2/ (Gradually merge into main src/)
│   ├── components/
│   │   ├── DesignConsole/
│   │   │   └── SectionEditor.tsx (REPLACE with V1 canvas wrapper)
│   │   └── Live/ (KEEP for V2-style live preview)
│   ├── utils/
│   │   ├── compositionResolver.ts (KEEP - critical for page rendering)
│   │   ├── templateVariables.ts (KEEP - critical for dynamic content)
│   │   └── variationResolver.ts (KEEP - handles variation inheritance)
│   └── data/
│       ├── mockSharedSections.ts (MERGE with V1's data/)
│       └── mockWebsites.ts (MERGE with V1's data/)
│
└── utils/
    ├── compositionResolver.ts (MOVE from v2/)
    └── templateVariables.ts (MOVE from v2/)
```

---

## 🚀 **EXECUTION ORDER (Tomorrow)**

### **Session 1: Foundation (3 hours)**
1. ✅ Create backup branch
2. 📝 Phase 1: Add SharedSections to V1 store (1h)
3. 🧪 Test: Does app still run?
4. 📝 Phase 2: Update Section Library UI (1h)
5. 🧪 Test: Can see sections?
6. ☕ **BREAK**

### **Session 2: Integration (3 hours)**
1. 📝 Phase 3: Add "Save as Section" (1h)
2. 🧪 Test: Can save sections?
3. 📝 Phase 4: Template variables (1-2h)
4. 🧪 Test: Do variables resolve?
5. ☕ **BREAK**

### **Session 3: Polish (3 hours)**
1. 📝 Phase 5: Merge Website types (1h)
2. 📝 Phase 6: Connect V2 editor (2h)
3. 🧪 Test: Full workflow?
4. 📝 Commit & celebrate! 🎉

---

## 🛡️ **SAFETY NET**

### **Before Starting:**
```bash
# 1. Create backup
git checkout -b backup-nov26-before-refactor
git push origin backup-nov26-before-refactor

# 2. Create feature branch
git checkout -b feature/unified-editor
```

### **If I Go Bananas Mid-Refactor:**

**Tell Next AI Agent:**
> "We're merging V1's editor with V2's SharedSections. V1 has working canvas+properties but uses customSections (localStorage). V2 has SharedSections with variations+inheritance but no editor. Plan: Replace V1's customSections with V2's SharedSections, keep V1's canvas. Check REFACTORING_PLAN_REVISED.md for details. Current phase: [SEE GIT LOG]."

**Recovery:**
```bash
# Check progress
git log --oneline -5

# If broken, rollback
git reset --hard backup-nov26-before-refactor
```

---

## ✅ **SUCCESS CRITERIA**

**We're done when:**
- [ ] V1's Design Console → Section Library shows SharedSections
- [ ] Can create section in V1 canvas, save as SharedSection
- [ ] V2's Section Editor uses V1's visual canvas
- [ ] Template variables (`{journal.name}`) work in V1's renderers
- [ ] MockLiveSite renders pages from compositions
- [ ] All existing V1 functionality intact
- [ ] No linter errors
- [ ] localStorage migration works

**Demo Flow:**
1. Open V1 Design Console → Section Library
2. See "Main Header" with "Full" and "Minimal" variations
3. Click "Edit Full" → Opens V1's visual canvas
4. Drag/drop widgets, edit properties
5. Save → Updates SharedSection
6. See change reflected in all pages using it ✨

---

**Ready for tomorrow's refactor! 🚀**

