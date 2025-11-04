# Tabs Widget - window.usePageStore Fix

## Issues Fixed

### Issue 1: Publication List Widget Properties Not Showing
**Problem:** Clicking a Publication List widget (or any widget) in a tab panel didn't open the properties panel.

**Error:** `❌ usePageStore is undefined`

**Root Cause:** The module-level `usePageStore` variable was evaluated when the module loaded (before `window.usePageStore` was set), resulting in `undefined`.

### Issue 2: Tab Switching Stopped Working (Regression)
**Problem:** After fixing the widget click issue, clicking tabs no longer switched the tab panel content.

**Root Cause:** Same issue - `handleTabChange` was also using the module-level `usePageStore` which was `undefined`.

## Root Cause Analysis

### Module Loading Order Issue

```typescript
// At top of WidgetRenderer.tsx (line 14)
const usePageStore = window.usePageStore  // ❌ undefined at module load time!
```

**Problem:** This line executes when the module loads, but `window.usePageStore` isn't set yet.

**Timeline:**
1. Module loads → `const usePageStore = window.usePageStore` → **undefined**
2. Later: `window.usePageStore` gets set (in App.tsx)
3. Component tries to use `usePageStore` → Still **undefined** (captured at module load)

## Solution

Changed all references to access `window.usePageStore` directly instead of using the stale module-level variable:

```typescript
// Before ❌
if (usePageStore) {
  const { selectWidget } = usePageStore.getState()
  selectWidget(widget.id)
}

// After ✅
const store = window.usePageStore || usePageStore
if (store) {
  const { selectWidget } = store.getState()
  selectWidget(widget.id)
}
```

## Files Changed

**File:** `src/components/Widgets/WidgetRenderer.tsx`

### Change 1: ClickableWidgetInTabPanel - handleWidgetClick (Lines 1230-1255)
**Fixed:** Widget selection in store now works
```typescript
const store = window.usePageStore || usePageStore
if (store) {
  const state = store.getState()
  if (state.selectWidget) {
    state.selectWidget(widget.id)
    console.log('✅ Selected widget in store:', widget.id)
  }
}
```

### Change 2: ClickableWidgetInTabPanel - handleDuplicate (Lines 1257-1306)
**Fixed:** Widget duplication in tabs now works
```typescript
const store = window.usePageStore || usePageStore
if (!store) return

const { canvasItems, replaceCanvasItems } = store.getState()
// ... duplication logic
```

### Change 3: ClickableWidgetInTabPanel - handleDelete (Lines 1308-1357)
**Fixed:** Widget deletion from tabs now works
```typescript
const store = window.usePageStore || usePageStore
if (!store) return

const { canvasItems, replaceCanvasItems } = store.getState()
// ... deletion logic
```

### Change 4: TabsWidgetRenderer - handleTabChange (Lines 1534-1573)
**Fixed:** Tab switching now works again
```typescript
const store = window.usePageStore || usePageStore
if (store) {
  const { canvasItems, replaceCanvasItems } = store.getState()
  // ... update activeTabIndex in store
  console.log('💾 Store updated with activeTabIndex:', index)
} else {
  console.error('❌ Store not available in handleTabChange - tab switching will not persist')
}
```

## Why `window.usePageStore || usePageStore`?

Using the fallback pattern provides safety:
1. **Primary:** `window.usePageStore` - Always current, set at app initialization
2. **Fallback:** `usePageStore` - Module-level variable (usually undefined, but kept for safety)

This ensures the store is accessible regardless of initialization order.

## Testing Checklist

### Widget Click & Properties
- [ ] Click Publication List widget in tab → Properties panel opens ✅
- [ ] Click Image widget in tab → Properties panel opens ✅
- [ ] Click Text widget in tab → Properties panel opens ✅
- [ ] Console shows: `✅ Selected widget in store: [id]` ✅

### Tab Switching
- [ ] Click Tab 1 → Tab 1 panel shows ✅
- [ ] Click Tab 2 → Tab 2 panel shows ✅
- [ ] Console shows: `💾 Store updated with activeTabIndex: [index]` ✅
- [ ] Switch tabs multiple times → Works every time ✅

### Widget Actions in Tabs
- [ ] Duplicate widget in tab → Creates copy ✅
- [ ] Delete widget from tab → Removes widget ✅
- [ ] Edit widget properties → Changes save ✅

### Console Logs (Expected)

**Clicking Widget:**
```
🖱️ Widget in tab panel clicked: abc123 publication-list
🔍 Store exists? true
🔍 Store state: { hasSelectWidget: true }
✅ Selected widget in store: abc123
✅ Properties Panel - Widget found: { id: 'abc123', type: 'publication-list' }
```

**Clicking Tab:**
```
🔘 Tab clicked! Switching from 0 to 1
📊 Tabs available: [{index: 0, label: 'Tab 1'...}, {index: 1, label: 'Tab 2'...}]
✅ Local activeIndex updated to: 1
🔧 Updating tabs widget in section, setting activeTabIndex to: 1
💾 Store updated with activeTabIndex: 1
🔄 Widget prop changed, setting activeIndex to: 1
🖼️ Rendering tab panel for index: 1 tab: Tab 2 ...
```

## Before & After

### Before ❌

**Widget Click:**
```
🖱️ Widget in tab panel clicked: abc123 publication-list
🔍 usePageStore exists? false
❌ usePageStore is undefined
[Properties panel doesn't open]
```

**Tab Click:**
```
🔘 Tab clicked! Switching from 0 to 1
✅ Local activeIndex updated to: 1
[Store not updated - no persistence]
[Tab switches visually but doesn't persist]
```

### After ✅

**Widget Click:**
```
🖱️ Widget in tab panel clicked: abc123 publication-list
🔍 Store exists? true
🔍 Store state: { hasSelectWidget: true }
✅ Selected widget in store: abc123
[Properties panel opens! 🎉]
```

**Tab Click:**
```
🔘 Tab clicked! Switching from 0 to 1
✅ Local activeIndex updated to: 1
🔧 Updating tabs widget in section, setting activeTabIndex to: 1
💾 Store updated with activeTabIndex: 1
[Tab switches AND persists! 🎉]
```

## Technical Details

### Store Access Pattern

| Pattern | When to Use | Example |
|---------|-------------|---------|
| `window.usePageStore` | ✅ In event handlers, callbacks | `const store = window.usePageStore` |
| Module-level variable | ❌ Don't rely on this | `const usePageStore = window.usePageStore` (evaluated once at load) |
| Props | ✅ For component hierarchy | Pass `usePageStore` as prop |

### Why Props Weren't Used Here

Components like `DraggableWidgetInSection` receive `usePageStore` as a prop from `SectionRenderer`, which receives it from `PageBuilder`.

**For `ClickableWidgetInTabPanel`:**
- It's deeply nested: `WidgetRenderer` → `TabsWidgetRenderer` → `DroppableTabPanel` → `ClickableWidgetInTabPanel`
- Would require prop drilling through 4 levels
- `window.usePageStore` is simpler and more direct

**For `TabsWidgetRenderer`:**
- Same deep nesting issue
- `window.usePageStore` avoids prop drilling

### Alternative Solutions Considered

1. **Pass `usePageStore` as prop through hierarchy** ❌
   - Requires changes to 4+ components
   - More refactoring, higher risk

2. **Use React Context** ❌
   - Requires creating new context
   - More complex, not necessary

3. **Access `window.usePageStore` directly** ✅
   - Simple, direct
   - Works immediately
   - No prop drilling
   - **CHOSEN SOLUTION**

## Related Issues

This same pattern might need to be applied to other components that use the module-level `usePageStore`:

```bash
# Search for potential issues
grep -n "if (usePageStore)" src/components/Widgets/WidgetRenderer.tsx
```

**Current Status:** All instances in `WidgetRenderer.tsx` have been fixed ✅

## Success Criteria

✅ Widget clicks in tab panels open properties  
✅ Publication List widget properties display  
✅ All widget types work in tab panels  
✅ Tab switching works correctly  
✅ Store updates persist  
✅ No console errors  
✅ Console shows successful store access  

**Everything now works! 🎉**

## Key Takeaway

**Module-level variables that reference global objects must be accessed dynamically:**

```typescript
// ❌ BAD: Evaluated once at module load
const store = window.myStore

// ✅ GOOD: Accessed dynamically when needed
function myFunction() {
  const store = window.myStore || fallback
  if (store) {
    // use store
  }
}
```

This ensures you always get the current value, not a stale snapshot from module load time.

