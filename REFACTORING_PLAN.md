# V1 + V2 Refactoring Plan
**Master Agent Intelligence Report**
**Prepared:** Nov 26, 2025
**For:** Tomorrow's refactoring session

---

## 🎯 GOAL
Merge V1's proven editor (canvas + properties panel) with V2's clean architecture (SharedSections + template variables + inheritance).

**Result:** Single powerful page builder with best of both worlds.

---

## 📊 V1 ARCHITECTURE (What Works)

### **Core Strengths** ✅
1. **Full Visual Canvas** - Real WYSIWYG editing with blue gradients, live text, interactive widgets
2. **Comprehensive Properties Panel** - 3,693 lines of rich editing for every widget property
3. **Drag & Drop System** - @dnd-kit with collision detection, working flawlessly
4. **Widget Renderers** - 2,244 lines of battle-tested rendering logic
5. **Theme System** - Multi-brand support (Wiley/WT/Dummies), semantic CSS, foundation tokens
6. **Zustand Store** - 2,144 lines of state management in `AppV1.tsx`

### **Data Model (V1)**
```typescript
// V1 uses WidgetSection (areas-based sections)
WidgetSection {
  id: string
  name: string
  type: 'content-block'
  layout: 'one-column' | 'two-columns' | 'flexible' | 'grid'
  areas: SectionArea[]  // Each area contains widgets[]
  flexConfig?: {...}
  gridConfig?: {...}
  background?: {...}
  contentMode?: 'light' | 'dark'
}

// Canvas items are flat array
canvasItems: CanvasItem[] = [...sections, ...standalone widgets]
```

### **Key V1 Files**
1. **`src/AppV1.tsx`** (2,264 lines)
   - Zustand store definition
   - State management for canvas, templates, websites
   - Notification system, schema objects
   
2. **`src/components/PageBuilder/index.tsx`** (1,970 lines)
   - Main canvas editor with DnD context
   - Drag & drop handlers
   - Widget library integration
   
3. **`src/components/Properties/PropertiesPanel.tsx`** (3,693 lines)
   - Rich editing for all widget types
   - Inline styles, typography controls
   - Menu editors, publication card configs
   
4. **`src/components/Canvas/LayoutRenderer.tsx`** (147 lines)
   - Renders canvasItems → Sections/Widgets
   - Editor mode vs Live mode
   
5. **`src/components/Widgets/WidgetRenderer.tsx`** (2,244 lines)
   - Individual widget renderers (Button, Text, Image, Menu, Tabs, Collapse, etc.)
   - Schema-aware rendering
   
6. **`src/components/Sections/SectionRenderer.tsx`**
   - Renders sections with areas + widgets
   - Drag & drop zones within sections

### **V1 Widget Types**
- Button, Text, Image, Heading
- Menu, Navbar
- HTML, Code
- Tabs, Collapse/Accordion
- Publication List, Publication Details
- Editorial Card
- Divider, Spacer

---

## 🏗️ V2 ARCHITECTURE (What's Better)

### **Core Innovations** ✨
1. **SharedSection Model** - Reusable sections with variations (Full Header, Minimal Header)
2. **Template Variables** - `{journal.name}`, `{journal.branding.primaryColor}` for dynamic content
3. **Inheritance System** - Changes propagate from base → variations → pages
4. **Website/Journal Hierarchy** - Proper structure for publishing platforms
5. **Override Tracking** - Know which pages diverged from base template

### **Data Model (V2)**
```typescript
// V2 uses SharedSection (variation-based)
SharedSection {
  id: 'header-main'
  name: 'Main Header'
  category: 'header'
  variations: {
    full: SectionVariation {
      widgets: Widget[]  // Flat array, no areas
      layout: 'flexible'
      flexConfig: {...}
      background: { type: 'color', color: '#000' }
      contentMode: 'dark'
    },
    minimal: SectionVariation {...}
  }
  isGlobal: true
  allowOverrides: true
}

// Pages are compositions of section references
Page {
  composition: SectionCompositionItem[] {
    id: nanoid()
    sharedSectionId: 'header-main'
    variationKey: 'full'
    inheritFromTheme: true
    overrides?: {...}
  }
}
```

### **Key V2 Files**
1. **`src/v2/stores/sharedSectionsStore.ts`** (120 lines)
   - Manages SharedSection library
   - CRUD for sections + variations
   
2. **`src/v2/stores/websiteStore.ts`**
   - Websites + Pages
   - Journals within websites
   
3. **`src/v2/types/core.ts`** (289 lines)
   - Clean type definitions for SharedSection, Page, Journal
   
4. **`src/v2/utils/compositionResolver.ts`**
   - Resolves Page → SharedSections → ResolvedSection[]
   - Handles inheritance + overrides
   
5. **`src/v2/utils/templateVariables.ts`**
   - Replaces `{journal.name}` with actual data
   - Dynamic content rendering

### **V2's Problem** ❌
- **No visual canvas** - Just gray metadata boxes
- **No properties panel** - Can't edit widget properties
- **No drag & drop** - Only add/remove/reorder buttons
- **Incomplete** - Not demo-ready

---

## 🔄 REFACTORING STRATEGY

### **Phase 1: Data Model Unification** (2-3 hours)

**Goal:** Make V1 and V2 data structures compatible.

#### 1.1 Update V1's WidgetSection → Support SharedSection Structure
**File:** `src/types/widgets.ts`

**Changes:**
```typescript
// ADD: Make WidgetSection compatible with V2's SectionVariation
export type WidgetSection = {
  // ... existing V1 fields ...
  
  // NEW V2 fields (for compatibility)
  sharedSectionId?: string  // Link to SharedSection
  variationKey?: string  // Which variation is this
  inheritsFrom?: string  // Parent variation
  widgetOverrides?: WidgetOverride[]  // Property overrides
}

// KEEP: Backward compatibility with V1's area-based structure
// areas: SectionArea[] is OPTIONAL now
// If areas exist → V1 mode (multi-column with drop zones)
// If !areas && widgets[] → V2 mode (flat widgets in flex/grid)
```

**Why:** This allows V1's canvas to render BOTH:
- Old V1 sections (with areas)
- New SharedSections from V2 (flat widgets)

#### 1.2 Merge Zustand Stores
**Files:**
- `src/AppV1.tsx` (existing store)
- `src/v2/stores/sharedSectionsStore.ts` (add to V1 store)
- `src/v2/stores/websiteStore.ts` (add to V1 store)

**Changes:**
```typescript
// In AppV1.tsx, ADD to existing store:
export const usePageStore = create<PageState>((set, get) => ({
  // ... existing V1 state ...
  
  // NEW: V2 SharedSections state
  sharedSections: SharedSection[],  // Import from V2
  addSharedSection: (section) => {...},
  updateSharedSection: (id, updates) => {...},
  
  // NEW: Page composition state
  pages: Page[],  // Import from V2
  addPage: (page) => {...},
  updatePageComposition: (pageId, composition) => {...},
  
  // NEW: Journals state
  journals: Journal[],  // Import from V2
  addJournal: (journal) => {...},
  
  // KEEP: All existing V1 actions
  canvasItems, addWidget, deleteWidget, etc.
}))
```

**Why:** Single source of truth, no data duplication.

---

### **Phase 2: Canvas Integration** (2-3 hours)

**Goal:** Make V1's canvas render V2's SharedSections.

#### 2.1 Update LayoutRenderer
**File:** `src/components/Canvas/LayoutRenderer.tsx`

**Changes:**
```typescript
// ADD: Support for rendering SharedSection instances
export const LayoutRenderer = ({ canvasItems, ... }) => {
  return canvasItems.map(item => {
    // NEW: Check if item is a SharedSection instance
    if (item.sharedSectionId) {
      // Resolve SharedSection → ResolvedSection
      const sharedSection = usePageStore.getState()
        .sharedSections.find(s => s.id === item.sharedSectionId)
      const variation = sharedSection?.variations[item.variationKey]
      
      // Convert variation → V1 section format
      const resolvedSection = {
        ...item,
        widgets: variation.widgets,  // Flat array
        layout: variation.layout,
        flexConfig: variation.flexConfig,
        gridConfig: variation.gridConfig,
        background: variation.background,
        contentMode: variation.contentMode
      }
      
      return <SectionRenderer section={resolvedSection} {...props} />
    }
    
    // KEEP: Original V1 section rendering
    if (isSection(item)) {
      return <SectionRenderer section={item} {...props} />
    }
    
    return <WidgetRenderer widget={item} {...props} />
  })
}
```

#### 2.2 Update SectionRenderer
**File:** `src/components/Sections/SectionRenderer.tsx`

**Changes:**
```typescript
// ADD: Handle flat widgets (V2 style) vs areas (V1 style)
export const SectionRenderer = ({ section }) => {
  // NEW: Check if section has flat widgets (V2)
  if (!section.areas && section.widgets) {
    return (
      <section style={getBackgroundStyle()}>
        <div className={getLayoutClasses()}>  // flex or grid
          {section.widgets.map(widget => (
            <WidgetRenderer 
              widget={widget} 
              templateContext={section.templateContext}  // NEW
            />
          ))}
        </div>
      </section>
    )
  }
  
  // KEEP: Original V1 area-based rendering
  return (
    <section>
      {section.areas.map(area => (
        <div className={getAreaClasses()}>
          {area.widgets.map(widget => <WidgetRenderer widget={widget} />)}
        </div>
      ))}
    </section>
  )
}
```

#### 2.3 Add Template Variable Resolution
**File:** `src/components/Widgets/WidgetRenderer.tsx`

**Changes:**
```typescript
// ADD: Import V2's template variable resolver
import { resolveTemplateVariables } from '../v2/utils/templateVariables'

// In each widget renderer, resolve variables
const TextWidgetRenderer = ({ widget, templateContext }) => {
  // NEW: Resolve template variables in text
  const resolvedText = templateContext 
    ? resolveTemplateVariables(widget.text, templateContext)
    : widget.text
  
  return <div>{resolvedText}</div>
}
```

**Why:** Enables `{journal.name}` → "Journal of Science" rendering.

---

### **Phase 3: Section Editor Integration** (1-2 hours)

**Goal:** Replace V2's incomplete editor with V1's canvas.

#### 3.1 Update V2's SectionEditor
**File:** `src/v2/components/DesignConsole/SectionEditor.tsx`

**Changes:**
```typescript
// REPLACE: Gray metadata box
// WITH: V1's PageBuilder component

import { PageBuilder } from '../../../components/PageBuilder'
import { LayoutRenderer } from '../../../components/Canvas/LayoutRenderer'

export function SectionEditor({ sectionId, variationKey }) {
  const section = useSharedSectionsStore(s => s.getSectionById(sectionId))
  const variation = section?.variations[variationKey]
  
  // Convert variation → canvasItems for V1 canvas
  const canvasItems = [{
    id: nanoid(),
    ...variation,
    widgets: variation.widgets  // Flat array
  }]
  
  return (
    <div className="section-editor">
      {/* V1's WYSIWYG Canvas */}
      <div className="canvas-area">
        <LayoutRenderer 
          canvasItems={canvasItems}
          isLiveMode={false}  // Editor mode
          usePageStore={usePageStore}
        />
      </div>
      
      {/* V1's Properties Panel */}
      <PropertiesPanel 
        usePageStore={usePageStore}
        // ... props
      />
    </div>
  )
}
```

**Why:** Now V2's Section Editor has full editing capabilities!

---

### **Phase 4: Clean Up & Polish** (1 hour)

#### 4.1 Remove Redundant Files
**Delete:**
- `src/v2/components/Dashboard/Dashboard.tsx` (already removed)
- Any other V2-specific editor stubs

#### 4.2 Update Navigation
**Files:**
- `src/v2/components/DesignConsole/DesignConsole.tsx`

**Changes:**
- Ensure "Edit Section" buttons open the unified editor
- Remove references to old V2 editor

#### 4.3 Type Cleanup
**Files:**
- `src/v2/types/core.ts`

**Changes:**
- Re-export V1's Widget types
- Ensure SharedSection uses V1's Widget type

---

## 🛡️ SAFETY MEASURES

### **Git Strategy**
```bash
# 1. Create backup branch
git checkout -b backup-before-refactor-nov26

# 2. Create feature branch for refactor
git checkout -b feature/merge-v1-v2-editors

# 3. Commit frequently (every phase)
git commit -m "Phase 1: Data model unification"
git commit -m "Phase 2: Canvas integration"
# etc.

# 4. Push to remote frequently
git push origin feature/merge-v1-v2-editors
```

### **Testing Checklist**
After each phase, verify:
- [ ] V1 pages still render correctly
- [ ] V2 SharedSections render in canvas
- [ ] Properties panel can edit widgets
- [ ] Drag & drop works
- [ ] Template variables resolve correctly
- [ ] No linter errors
- [ ] No console errors

### **Rollback Plan**
If something breaks badly:
```bash
# Revert to backup
git checkout backup-before-refactor-nov26

# Or reset feature branch
git reset --hard origin/main
```

---

## 📝 CONTEXT PRESERVATION (If I Go Bananas)

### **What to Tell the Next AI Agent**

**Resume Point:**
"We're merging V1 (proven editor) with V2 (clean architecture). V1 has canvas+properties but old data model. V2 has SharedSections+template variables but no editor. Goal: V1's editor + V2's data model."

**Key Files Modified:**
1. `src/types/widgets.ts` - Made WidgetSection compatible with SharedSection
2. `src/AppV1.tsx` - Added V2's stores (sharedSections, pages, journals)
3. `src/components/Canvas/LayoutRenderer.tsx` - Renders both V1 sections + V2 SharedSections
4. `src/components/Sections/SectionRenderer.tsx` - Handles flat widgets (V2) + areas (V1)
5. `src/components/Widgets/WidgetRenderer.tsx` - Added template variable resolution
6. `src/v2/components/DesignConsole/SectionEditor.tsx` - Uses V1's canvas now

**What's NOT Changed:**
- V1's Properties Panel (keep as-is, it's perfect)
- V1's DnD system (keep as-is, it works)
- V1's widget renderers (just add template variable support)

**Status Check Commands:**
```bash
# See what's been modified
git status

# See current branch
git branch

# See recent commits
git log --oneline -10

# Test the app
npm run dev
# Then open http://localhost:5173/v2
```

---

## 🎨 ARCHITECTURAL DECISIONS

### **Hybrid Data Model**
**Decision:** Support BOTH V1's area-based sections AND V2's flat-widget sections.

**Rationale:**
- V1 sections (with areas) allow multi-column drop zones → Keep for complex layouts
- V2 sections (flat widgets) are simpler for shared sections → Use for most cases
- Backward compatibility → No need to migrate existing V1 content

**Implementation:**
```typescript
// In SectionRenderer:
if (section.areas) {
  // V1 mode: Multi-column with drop zones
  renderAreas()
} else if (section.widgets) {
  // V2 mode: Flat widgets in flex/grid
  renderFlat()
}
```

### **Template Variables**
**Decision:** Add optional `templateContext` prop throughout widget renderers.

**Rationale:**
- Non-breaking → If no context, widgets work as before
- Powerful → Enables `{journal.name}` for dynamic content
- Clean → Utility function handles all resolution

**Implementation:**
```typescript
// Pass context down the render tree
<LayoutRenderer templateContext={journal} />
  → <SectionRenderer templateContext={journal} />
    → <WidgetRenderer templateContext={journal} />
      → resolveTemplateVariables(text, context)
```

---

## 📊 ESTIMATED TIMELINE

| Phase | Task | Time | Complexity |
|-------|------|------|------------|
| 1 | Data Model Unification | 2-3h | Medium |
| 2 | Canvas Integration | 2-3h | Medium |
| 3 | Section Editor Integration | 1-2h | Low |
| 4 | Clean Up & Polish | 1h | Low |
| **Total** | **Full Refactor** | **6-9h** | **Medium** |

**Breaks:** Every 2 hours (stretch, coffee, review progress)

**Context Window Risk:** Likely need 1-2 context windows (this is ~200-300 tool calls)

---

## 🚀 TOMORROW'S WORKFLOW

### **Morning Session (3-4 hours)**
1. ☕ Coffee + review this document
2. ✅ Verify git branch strategy
3. 🏗️ Phase 1: Data model unification
4. 🧪 Test after Phase 1
5. ☕ Break

### **Afternoon Session (3-4 hours)**
1. 🎨 Phase 2: Canvas integration
2. 🧪 Test after Phase 2
3. ☕ Break
4. ✨ Phase 3: Section editor integration
5. 🧪 Test after Phase 3

### **Wrap-Up Session (1 hour)**
1. 🧹 Phase 4: Clean up
2. 🧪 Final testing
3. 📝 Commit & push
4. 🎉 Demo!

---

## 💡 TIPS FOR SUCCESS

1. **Test frequently** - After each file change, check if app still runs
2. **Commit often** - Small commits = easy rollback
3. **Read console** - Catch TypeScript errors early
4. **Use grep** - Find all usages of a type before changing it
5. **Trust V1's code** - It works, don't rewrite it
6. **Keep V2's concepts** - SharedSections are good, keep the model

---

## 🎯 SUCCESS CRITERIA

**We're done when:**
- [X] V2's Section Editor shows V1's visual canvas
- [X] Can drag & drop widgets in Section Editor
- [X] Properties panel edits SharedSection widgets
- [X] Template variables (`{journal.name}`) render correctly
- [X] All V1 functionality still works
- [X] All V2 architectural improvements preserved
- [X] No linter errors
- [X] Demo-ready for your meeting!

---

**Good luck tomorrow! You've got this. 💪**
**Remember: V1's editor + V2's architecture = 🔥**

