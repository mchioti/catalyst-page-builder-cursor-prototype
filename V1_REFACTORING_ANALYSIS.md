# V1 Code Review & Refactoring Analysis

## Executive Summary

V1 has grown organically and has several architectural issues that make it hard to extend. The main problems are:
1. **Mega-file syndrome**: `AppV1.tsx` is 2,263 lines with store + components mixed
2. **God store**: `usePageStore` has 50+ state fields and actions in one store
3. **Tight coupling**: Components directly import `usePageStore` via `window` global
4. **No separation of concerns**: UI, business logic, and data all mixed together

---

## Problem Areas

### 1. AppV1.tsx is a Mega-File (2,263 lines)

**Current state:**
```
AppV1.tsx contains:
├── NotificationToast component (~50 lines)
├── NotificationContainer component (~15 lines)
├── IssuesSidebar component (~70 lines)
├── SkinWrap helper (~20 lines)
├── InteractiveWidgetRenderer (~1,100 lines!) 
├── buildWidget function (~200 lines)
├── usePageStore definition (~800 lines)
└── App component (~100 lines)
```

**Problem:** When you need to change notifications, you edit the same file as the store, widgets, and app shell.

**Fix:**
```
src/
├── stores/
│   ├── pageStore.ts         # Just the Zustand store
│   ├── notificationStore.ts # Notifications only
│   └── index.ts
├── components/
│   ├── Notifications/
│   │   ├── NotificationToast.tsx
│   │   └── NotificationContainer.tsx
│   └── InteractiveWidgetRenderer.tsx
└── AppV1.tsx                 # Just routing + providers
```

---

### 2. God Store (usePageStore has 50+ fields)

**Current state:**
```typescript
usePageStore = {
  // Routing (7 fields)
  currentView, siteManagerView, editingContext, templateEditingContext,
  currentWebsiteId, mockLiveSiteRoute, previewBrandMode, previewThemeId,
  
  // Personas (2 fields)
  currentPersona, consoleMode,
  
  // Notifications (2 fields + 4 actions)
  notifications, pageIssues, addNotification, removeNotification, etc.
  
  // Schema.org (5 fields + 6 actions)
  schemaObjects, selectedSchemaObject, addSchemaObject, etc.
  
  // Canvas (10+ fields + 15+ actions)
  canvasItems, routeCanvasItems, globalTemplateCanvas, journalTemplateCanvas,
  customSections, customStarterPages, selectedWidget, insertPosition, etc.
  
  // Templates (3 fields + 5 actions)
  templates, templateModifications, exemptedRoutes, etc.
  
  // Data (4 fields)
  websites, themes, publicationCardVariants, etc.
}
```

**Problem:** Everything depends on everything. Changing canvas logic could break notifications.

**Fix:** Split into domain-specific stores:
```typescript
// stores/routingStore.ts
useRoutingStore = {
  currentView, siteManagerView, editingContext,
  setCurrentView, setSiteManagerView, etc.
}

// stores/notificationStore.ts  
useNotificationStore = {
  notifications, pageIssues,
  addNotification, removeNotification, etc.
}

// stores/canvasStore.ts
useCanvasStore = {
  canvasItems, selectedWidget, insertPosition,
  addWidget, moveItem, replaceCanvasItems, etc.
}

// stores/contentStore.ts
useContentStore = {
  schemaObjects, websites, themes,
  addSchemaObject, updateSchemaObject, etc.
}
```

---

### 3. Global Window Access Pattern

**Current state:**
```typescript
// In AppV1.tsx
(window as any).usePageStore = usePageStore

// In WidgetRenderer.tsx
const usePageStore = window.usePageStore
```

**Problem:** 
- Can't test components in isolation
- No TypeScript safety on window access
- Hidden dependencies

**Fix:** Pass store via React Context or props:
```typescript
// Context approach
const StoreContext = createContext<typeof usePageStore>(null!)

// In component
const store = useContext(StoreContext)
// or use the hook directly if store is in separate file
const { canvasItems } = useCanvasStore()
```

---

### 4. InteractiveWidgetRenderer is 1,100+ lines

**Current state:**
```typescript
function InteractiveWidgetRenderer({ widget }) {
  switch (widget.type) {
    case 'navbar': // 30 lines
    case 'heading': // 100 lines  
    case 'text': // 200 lines
    case 'image': // 50 lines
    case 'button': // 80 lines
    case 'menu': // 150 lines
    case 'tabs': // 100 lines
    case 'collapse': // 100 lines
    case 'divider': // 20 lines
    case 'spacer': // 20 lines
    case 'publication-list': // 100 lines
    case 'publication-details': // 100 lines
    default: // fallback to WidgetRenderer
  }
}
```

**Problem:** One giant switch statement with inline JSX for each type.

**Fix:** Widget registry pattern:
```typescript
// widgets/registry.ts
const widgetRenderers = {
  heading: HeadingWidgetEditor,
  text: TextWidgetEditor,
  image: ImageWidgetEditor,
  // etc.
}

// InteractiveWidgetRenderer.tsx
function InteractiveWidgetRenderer({ widget }) {
  const Renderer = widgetRenderers[widget.type] || FallbackRenderer
  return <Renderer widget={widget} />
}
```

---

### 5. Mock Data Mixed with Code

**Current state:**
```
src/data/
├── mockSections.ts      # 3KB
├── mockStarterPages.ts  # 12KB  
├── mockThemes.ts        # 65KB (!!)
└── mockWebsites.ts      # 5KB
```

`mockThemes.ts` is 65KB of inline data!

**Problem:** Hard to see the structure vs the data.

**Fix:** 
- Move to JSON files or separate folder
- Or use factory functions for mock data

---

## Refactoring Priority Order

### Phase 1: Extract Store (High Impact, Medium Effort)
1. Move `usePageStore` to `src/stores/pageStore.ts`
2. Split into domain stores (routing, canvas, content, notifications)
3. Remove window global pattern
4. **Benefit:** Clean separation, testable, TypeScript works properly

### Phase 2: Extract AppV1 Components (Medium Impact, Low Effort)
1. Move `NotificationToast/Container` to `src/components/Notifications/`
2. Move `IssuesSidebar` to `src/components/Issues/`
3. Move `InteractiveWidgetRenderer` to `src/components/Canvas/`
4. **Benefit:** AppV1.tsx becomes just a shell

### Phase 3: Widget Registry (Medium Impact, Medium Effort)
1. Create `src/widgets/` folder with per-widget editor components
2. Create registry pattern
3. Remove giant switch statement
4. **Benefit:** Easy to add new widgets, each widget is isolated

### Phase 4: Shared Sections Ready (enables future features)
After phases 1-3, adding SharedSections becomes straightforward:
1. Add `sharedSectionsStore.ts` 
2. Add SharedSections UI to Design Console
3. PageBuilder can now use sections from the new store
4. **Benefit:** V2's architecture without rewriting V1

---

## Immediate Quick Wins (Do First)

### 1. Extract Store (~30 min)
```bash
# Create stores folder
mkdir -p src/stores

# Move store to its own file
# Update imports
```

### 2. Remove Window Global (~15 min)
- Import store directly where needed
- Remove `window.usePageStore` assignment

### 3. Split InteractiveWidgetRenderer (~1 hour)
- Create per-widget files
- Use registry pattern

---

## What NOT to Change

1. **PageBuilder drag & drop** - Works well, complex, don't touch
2. **PropertiesPanel** - Large but functional
3. **WidgetRenderer** - Already well-structured
4. **Mock data structure** - Matches the domain model

---

## Estimated Timeline

| Phase | Effort | Impact | Order |
|-------|--------|--------|-------|
| Extract store to file | 30 min | High | 1 |
| Split store into domains | 2 hours | High | 2 |
| Extract AppV1 components | 1 hour | Medium | 3 |
| Widget registry | 2 hours | Medium | 4 |
| SharedSections integration | 3 hours | High | 5 |

**Total: ~8-9 hours for full refactor**

---

## Next Steps

1. Create feature branch: `git checkout -b refactor/extract-stores`
2. Start with Phase 1: Extract store to its own file
3. Run tests after each change
4. Commit frequently

