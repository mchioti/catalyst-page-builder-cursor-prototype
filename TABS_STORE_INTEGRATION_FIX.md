# Tabs Widget - Store Integration Fix

## Issue Fixed

**Error:** `TypeError: setSelectedWidget is not a function`

**Problem:** When clicking a widget in a tab panel, the code tried to call `setSelectedWidget()` which doesn't exist in the store. The correct function is `selectWidget()`.

**Additional Issue:** Even with the correct function, widgets inside tab panels couldn't be configured because:
1. PropertiesPanel couldn't find them (only searched in sections)
2. PropertiesPanel couldn't update them (only updated widgets in sections)

## Solution

Fixed three parts of the code:

### 1. Fixed Function Name in ClickableWidgetInTabPanel
**File:** `src/components/Widgets/WidgetRenderer.tsx` (Line 1238-1240)

**Before (❌ Error):**
```typescript
const { setSelectedWidget } = usePageStore.getState()
setSelectedWidget(widget.id)
```

**After (✅ Works):**
```typescript
const { selectWidget } = usePageStore.getState()
selectWidget(widget.id)
console.log('✅ Selected widget in store:', widget.id)
```

**Why:** The store function is called `selectWidget`, not `setSelectedWidget`. Looking at `src/App.tsx` line 2288:
```typescript
selectWidget: (id) => {
  set({ selectedWidget: id })
},
```

---

### 2. Updated PropertiesPanel to Find Widgets in Tab Panels
**File:** `src/components/Properties/PropertiesPanel.tsx` (Lines 120-166)

**Added Search Logic:**
```typescript
// If not found at canvas level, search within section areas
if (!selectedItem) {
  for (const canvasItem of canvasItems) {
    if (isSection(canvasItem)) {
      for (const area of canvasItem.areas) {
        const foundWidget = area.widgets.find(w => w.id === selectedWidget)
        if (foundWidget) {
          selectedItem = foundWidget
          break
        }
        // ✅ NEW: Also search within tabs widgets in this area
        for (const areaWidget of area.widgets) {
          if (areaWidget.type === 'tabs') {
            const tabsWidget = areaWidget as any // TabsWidget
            for (const tab of tabsWidget.tabs) {
              const foundInTab = tab.widgets.find((w: any) => w.id === selectedWidget)
              if (foundInTab) {
                selectedItem = foundInTab
                break
              }
            }
            if (selectedItem) break
          }
        }
        if (selectedItem) break
      }
      if (selectedItem) break
    }
  }
}

// ✅ NEW: If still not found, search in standalone tabs widgets
if (!selectedItem) {
  for (const canvasItem of canvasItems) {
    if (canvasItem.type === 'tabs') {
      const tabsWidget = canvasItem as any // TabsWidget
      for (const tab of tabsWidget.tabs) {
        const foundInTab = tab.widgets.find((w: any) => w.id === selectedWidget)
        if (foundInTab) {
          selectedItem = foundInTab
          break
        }
      }
      if (selectedItem) break
    }
  }
}
```

**What This Does:**
- Searches through tabs widgets in section areas
- Searches through standalone tabs widgets
- Finds widgets nested inside tab panels
- Allows PropertiesPanel to display their properties

---

### 3. Updated PropertiesPanel to Update Widgets in Tab Panels
**File:** `src/components/Properties/PropertiesPanel.tsx` (Lines 185-232)

**Before:** Only updated widgets in sections directly

**After:** Also updates widgets inside tabs widgets

```typescript
const updateWidget = (updates: Partial<Widget>) => {
  const updatedCanvasItems = canvasItems.map((item: CanvasItem) => {
    if (isSection(item)) {
      return {
        ...item,
        areas: item.areas.map(area => ({
          ...area,
          widgets: area.widgets.map(w => {
            // Direct match
            if (w.id === selectedWidget) {
              return { ...w, ...updates }
            }
            // ✅ NEW: Search in tabs widgets
            if (w.type === 'tabs') {
              const tabsWidget = w as any // TabsWidget
              return {
                ...tabsWidget,
                tabs: tabsWidget.tabs.map((tab: any) => ({
                  ...tab,
                  widgets: tab.widgets.map((tw: any) =>
                    tw.id === selectedWidget ? { ...tw, ...updates } : tw
                  )
                }))
              }
            }
            return w
          })
        }))
      }
    } else {
      // ✅ NEW: Check if it's a standalone tabs widget
      if (item.type === 'tabs') {
        const tabsWidget = item as any // TabsWidget
        return {
          ...tabsWidget,
          tabs: tabsWidget.tabs.map((tab: any) => ({
            ...tab,
            widgets: tab.widgets.map((tw: any) =>
              tw.id === selectedWidget ? { ...tw, ...updates } : tw
            )
          }))
        }
      }
      return item.id === selectedWidget ? { ...item, ...updates } : item
    }
  })
  replaceCanvasItems(updatedCanvasItems)
}
```

**What This Does:**
- When updating a widget, also checks if it's inside a tabs widget
- Updates widgets in tab panels correctly
- Preserves all other widgets and tabs structure
- Allows property changes to actually save

---

## How It Works Now

### Complete Flow:

1. **User clicks widget in tab panel** →
   ```
   🖱️ Widget in tab panel clicked: abc123 image
   ```

2. **ClickableWidgetInTabPanel calls selectWidget** →
   ```typescript
   const { selectWidget } = usePageStore.getState()
   selectWidget(widget.id)
   ```
   ```
   ✅ Selected widget in store: abc123
   ```

3. **Store updates selectedWidget state** →
   ```typescript
   set({ selectedWidget: 'abc123' })
   ```

4. **PropertiesPanel searches for widget** →
   - Checks canvas items directly ❌
   - Checks section areas ❌
   - Checks tabs widgets in sections ✅ **Found it!**
   ```typescript
   selectedItem = foundInTab // Widget inside tab panel
   ```

5. **PropertiesPanel displays widget properties** →
   - Shows Image URL input
   - Shows all widget-specific properties

6. **User changes a property** (e.g., adds image URL) →
   ```typescript
   updateWidget({ url: 'https://example.com/image.jpg' })
   ```

7. **updateWidget updates the widget inside the tab** →
   - Searches through canvas items
   - Finds tabs widget
   - Updates widget inside specific tab
   - Preserves all other data

8. **Widget updates on canvas** →
   - Image displays with new URL ✅
   - Changes persist ✅

---

## Store Structure Path

```typescript
canvasItems: [
  {
    id: 'section-1',
    type: 'section',
    areas: [
      {
        widgets: [
          {
            id: 'tabs-widget-1',
            type: 'tabs',
            tabs: [
              {
                id: 'tab-1',
                widgets: [
                  {
                    id: 'img-abc123',    ← Widget we're configuring
                    type: 'image',
                    url: 'https://...'   ← Property we're updating
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
]
```

**Search Path:** 
`canvasItems` → `section` → `area` → `tabs widget` → `tab` → `widget` ✅

**Update Path:** 
Same as search path, but rebuilds structure with updated widget ✅

---

## Testing Checklist

### Function Name Fix
- [ ] **Click widget in tab panel:** No error ✅
- [ ] **Console shows:** `✅ Selected widget in store: [id]` ✅

### PropertiesPanel Find Widget
- [ ] **Click Image widget in tab:** Properties panel opens ✅
- [ ] **Shows correct properties:** Image URL input, alt text, etc. ✅
- [ ] **Click Text widget in tab:** Shows text editor ✅

### PropertiesPanel Update Widget
- [ ] **Add image URL:** Image displays ✅
- [ ] **Edit text content:** Text updates ✅
- [ ] **Change button text:** Button updates ✅
- [ ] **Switch tabs and back:** Changes persist ✅

### Console Logs
```
🖱️ Widget in tab panel clicked: abc123 image
✅ Selected widget in store: abc123
```

---

## Files Changed Summary

| File | Lines | Changes |
|------|-------|---------|
| `src/components/Widgets/WidgetRenderer.tsx` | 1238-1240 | Changed `setSelectedWidget` to `selectWidget` |
| `src/components/Properties/PropertiesPanel.tsx` | 120-166 | Added search logic for widgets in tab panels |
| `src/components/Properties/PropertiesPanel.tsx` | 185-232 | Added update logic for widgets in tab panels |

---

## Before & After

### Before ❌
1. Click widget in tab panel → **Error:** `setSelectedWidget is not a function`
2. Properties panel → Doesn't open
3. Configuration → Impossible

### After ✅
1. Click widget in tab panel → No error, console shows `✅ Selected widget in store`
2. Properties panel → Opens with correct properties
3. Configuration → Fully functional (add images, edit text, etc.)
4. Changes → Save and persist correctly

---

## Why This Was Needed

The tabs widget creates a nested structure:
```
Tabs Widget
└── Tab 1
    └── Image Widget     ← Nested 2 levels deep!
```

**Standard widgets in sections:**
```
Section
└── Area
    └── Image Widget     ← Only 1 level deep
```

The PropertiesPanel was only designed for the simpler case. Now it handles the nested tabs structure correctly.

---

## Key Technical Details

### Store Function Names
- ❌ `setSelectedWidget` - Does NOT exist
- ✅ `selectWidget` - Correct function name
- Located in: `src/App.tsx` line 2288

### Search Pattern
```typescript
// Level 1: Canvas items
canvasItems.find(item => item.id === selectedWidget)

// Level 2: Section areas
section.areas → area.widgets.find(w => w.id === selectedWidget)

// Level 3: Tabs widgets ← NEW!
tabsWidget.tabs → tab.widgets.find(w => w.id === selectedWidget)
```

### Update Pattern
```typescript
// Map through structure, update when ID matches
// Preserve all other data with spread operators
return {
  ...tabsWidget,
  tabs: tabsWidget.tabs.map(tab => ({
    ...tab,
    widgets: tab.widgets.map(w =>
      w.id === selectedWidget ? { ...w, ...updates } : w
    )
  }))
}
```

---

## Success Criteria

✅ No error when clicking widgets in tab panels  
✅ `selectWidget` function called correctly  
✅ PropertiesPanel finds widgets in tab panels  
✅ PropertiesPanel displays correct properties  
✅ Property changes save correctly  
✅ Widgets update on canvas  
✅ Changes persist when switching tabs  
✅ Console shows successful selection log  

**Widgets in tab panels are now fully configurable! 🎉**

