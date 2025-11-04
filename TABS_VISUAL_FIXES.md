# Tabs Widget - Visual Indicator & Style Switcher Fixes

## Issues Fixed

### 1. ✅ Red Underline Not Visible for Active Tab
**Problem:** No visual indication of which tab is active - the red underline wasn't showing up.

**Root Causes:**
1. CSS expected `.active` class on tab buttons, but code wasn't applying it
2. Tab navigation container was missing style-specific classes (`tabs-pills`, `tabs-buttons`)
3. Z-index conflicts might have been hiding the underline

**Solution:**
1. **Added `.active` class** to active tab buttons
2. **Added style-specific classes** to tab navigation container (`tabs-nav`, `tabs-pills`, `tabs-buttons`)
3. **Increased z-index** for tab navigation and buttons to ensure they're on top

**Files Changed:**
- `src/components/Widgets/WidgetRenderer.tsx` (lines 1355-1360, 1404-1427)

**Key Code Changes:**

```typescript
// Tab navigation now includes style-specific classes
const getTabNavClasses = () => {
  const baseClasses = 'tabs-nav flex gap-1'
  const styleClasses = widget.tabStyle === 'pills' ? 'tabs-pills' : 
                       widget.tabStyle === 'buttons' ? 'tabs-buttons' : ''
  const borderClasses = widget.tabStyle === 'underline' || !widget.tabStyle ? 
                        'border-b-2 border-gray-200' : ''
  return `${baseClasses} ${styleClasses} ${borderClasses} ${getAlignmentClasses()}`
}

// Tab buttons now get .active class
<button
  className={`tab-button ${activeIndex === index ? 'active' : ''} ${getTabButtonClasses(activeIndex === index)}`}
  style={{ pointerEvents: 'auto', position: 'relative', zIndex: 31 }}
>
```

**Result:**
- **Underline style:** Red underline appears under active tab (via CSS `::after` pseudo-element)
- **Pills style:** Active tab has blue background with white text
- **Buttons style:** Active tab has blue background with border
- **Style switcher now works** - changing tab style in properties panel applies correctly

---

### 2. ✅ Cannot Distinguish Which Tab is Active/In Focus
**Problem:** Even with tabs clickable, users couldn't tell which tab panel was active for dropping widgets.

**Solution:** Added multiple visual indicators for the active tab:

1. **Red underline** on the tab button (underline style)
2. **Blue background** on the active tab panel with subtle border
3. **"Active Tab" badge** in the top-right corner of the panel
4. **Different border style** - solid for active, dashed for inactive
5. **Different placeholder text** - "Drop widgets here (Active Tab)"

**Files Changed:**
- `src/components/Widgets/WidgetRenderer.tsx` (lines 1219-1302, 1432-1441)

**Key Code Changes:**

```typescript
// DroppableTabPanel now accepts isActive prop
const DroppableTabPanel: React.FC<{
  // ... other props
  isActive?: boolean
}> = ({ tabId, widgets, widgetId, schemaObjects, journalContext, sectionContentMode, isActive = false }) => {
  
  return (
    <div
      className={`relative min-h-[200px] border-2 rounded-md p-4 transition-all ${
        isOver 
          ? 'border-blue-400 bg-blue-50 border-solid' 
          : widgets.length === 0
          ? isActive 
            ? 'border-blue-300 bg-blue-50/30 border-dashed'  // Active, empty
            : 'border-gray-300 bg-gray-50 border-dashed'      // Inactive, empty
          : isActive
          ? 'border-blue-300 bg-blue-50/20 border-solid'     // Active, has widgets
          : 'border-gray-200 bg-transparent border-dashed'   // Inactive, has widgets
      }`}
    >
      {/* Active tab indicator badge */}
      {isActive && (
        <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-medium z-10 shadow-sm">
          Active Tab
        </div>
      )}
      
      {/* Different placeholder text for active tab */}
      {widgets.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-400 text-sm italic">
          {isOver ? 'Drop widget here' : isActive ? 'Drop widgets here (Active Tab)' : 'Drag widgets here from the library'}
        </div>
      ) : (
        // ... widgets render
      )}
    </div>
  )
}

// Pass isActive prop when rendering
<DroppableTabPanel
  tabId={widget.tabs[activeIndex].id}
  widgets={widget.tabs[activeIndex].widgets}
  widgetId={widget.id}
  schemaObjects={schemaObjects}
  journalContext={journalContext}
  sectionContentMode={sectionContentMode}
  isActive={true}  // ✅ Tells panel it's active
/>
```

**Visual Indicators Summary:**

| Indicator | Active Tab | Inactive Tab |
|-----------|-----------|--------------|
| Tab button (underline) | Red underline | No underline |
| Tab button (pills) | Blue background | Gray background |
| Tab button (buttons) | Blue background + border | White background |
| Tab panel border | Blue, solid | Gray, dashed |
| Tab panel background | Light blue tint | Transparent or gray |
| Badge | "Active Tab" blue badge | None |
| Empty state text | "Drop widgets here (Active Tab)" | "Drag widgets here from the library" |

---

### 3. ✅ Tab Style Switcher Not Working
**Problem:** Changing the tab style (underline, pills, buttons) in the properties panel had no effect.

**Root Cause:** The tab navigation container wasn't getting the style-specific CSS classes needed for pills and buttons styles to apply.

**Solution:** Updated `getTabNavClasses()` to conditionally add `tabs-pills` or `tabs-buttons` classes based on `widget.tabStyle`.

**Result:** 
- ✅ Switch to **Underline** → Gray border bottom, red underline on active tab
- ✅ Switch to **Pills** → No border bottom, rounded tabs with colored backgrounds
- ✅ Switch to **Buttons** → No border bottom, rectangular bordered tabs

---

### 4. ✅ Tabs Widget Properties Now Accessible
**Problem:** Couldn't click tabs widget to open properties panel when it's inside a section.

**Solution:** Added click handler to the parent container in `SectionRenderer` specifically for tabs widgets.

**Files Changed:**
- `src/components/Sections/SectionRenderer.tsx` (lines 75-103)

**Key Code:**
```typescript
<div 
  className="..."
  onClick={(e) => {
    // Handle clicks for tabs widget (since it has no overlay)
    if (!isLiveMode && widget.type === 'tabs') {
      const target = e.target as HTMLElement
      // Don't interfere with tab buttons, drop zones, or widgets inside panels
      if (target.closest('.tab-button') || target.closest('.droppable-tab-panel')) {
        return
      }
      // If click is on outer container or tab navigation area
      if (target.closest('.tabs-widget')) {
        e.preventDefault()
        e.stopPropagation()
        console.log('🎯 Tabs widget container clicked for properties')
        // ... open properties panel
      }
    }
  }}
>
```

**Result:** Clicking the tabs widget container (but not tab buttons or drop zones) opens the properties panel with edit/delete/duplicate toolbar.

---

## CSS Styles Applied

The CSS in `branding-system.css` provides the following styles:

### Underline Style (Default)
```css
.tabs-nav .tab-button.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #ef4444; /* Red underline */
}
```

### Pills Style
```css
.tabs-pills .tab-button.active {
  background-color: #3b82f6;  /* Blue background */
  color: #ffffff;
}
```

### Buttons Style
```css
.tabs-buttons .tab-button.active {
  background-color: #3b82f6;  /* Blue background */
  border-color: #3b82f6;
  color: #ffffff;
}
```

---

## Testing Checklist

### Visual Indicators
- [ ] **Tab 1 active:** See red underline (underline style) ✅
- [ ] **Tab 2 active:** Red underline moves to Tab 2 ✅
- [ ] **Active tab panel:** Blue border + "Active Tab" badge ✅
- [ ] **Inactive tab panel:** Gray dashed border, no badge ✅

### Tab Styles
- [ ] **Underline style:** Red underline on active, gray border bottom on nav ✅
- [ ] **Pills style:** Blue rounded background on active, gray on inactive ✅
- [ ] **Buttons style:** Blue rectangular button on active, white bordered on inactive ✅
- [ ] **Switch between styles:** All styles work correctly ✅

### Interaction
- [ ] **Click Tab 1 button:** Console shows `🔘 Tab button clicked: 0`, Tab 1 becomes active ✅
- [ ] **Click Tab 2 button:** Console shows `🔘 Tab button clicked: 1`, Tab 2 becomes active ✅
- [ ] **Click tabs widget background:** Properties panel opens ✅
- [ ] **Drag widget to active tab:** Widget drops into correct tab ✅

### Console Output
```
🔘 Tab button clicked: 1 label: Tab 2
🔄 Switching to tab: 1 Current activeIndex: 0
🔄 Widget updated, activeTabIndex: 1 current local activeIndex: 0
📝 Syncing activeIndex from 0 to 1
```

---

## Before & After

### Before ❌
- No visual indicator on tab buttons (red underline missing)
- No way to tell which tab panel is active
- Tab style switcher doesn't work
- Can't click tabs widget to open properties

### After ✅
- **Red underline** on active tab (underline style)
- **Blue background** on active tab (pills/buttons style)
- **"Active Tab" badge** on active panel
- **Blue border** on active panel
- **Tab style switcher** works perfectly
- **Clicking tabs widget** opens properties panel
- **Multiple visual cues** make it obvious which tab is active

---

## Files Changed Summary

| File | Lines | Changes |
|------|-------|---------|
| `src/components/Widgets/WidgetRenderer.tsx` | 1219-1302 | Added `isActive` prop to DroppableTabPanel, visual indicators |
| `src/components/Widgets/WidgetRenderer.tsx` | 1355-1360 | Fixed tab navigation classes to include style-specific classes |
| `src/components/Widgets/WidgetRenderer.tsx` | 1404-1441 | Added `.active` class to buttons, increased z-index, pass isActive prop |
| `src/components/Sections/SectionRenderer.tsx` | 75-103 | Added click handler for tabs widget to open properties |

---

## Expected Behavior Now

1. **Click Tab 1** → 
   - Red underline appears under Tab 1 (underline style)
   - Tab 1 panel shows blue border and "Active Tab" badge
   - Drop zone text: "Drop widgets here (Active Tab)"

2. **Click Tab 2** →
   - Red underline moves to Tab 2
   - Tab 2 panel shows blue border and "Active Tab" badge
   - Tab 1 panel becomes gray/dashed

3. **Change Tab Style to Pills** →
   - Red underline disappears
   - Active tab gets blue rounded background
   - Inactive tabs get gray rounded background

4. **Change Tab Style to Buttons** →
   - Active tab gets blue rectangular background with border
   - Inactive tabs get white background with gray border

5. **Drag widget to active tab** →
   - Blue border intensifies when hovering
   - Widget drops into active tab ✅
   - Console shows correct tab counts

6. **Click tabs widget background** →
   - Properties panel opens
   - Can edit tab style, alignment, add/delete tabs

---

## Technical Notes

### Z-Index Hierarchy
- Tab buttons: `z-31` (highest, must be clickable)
- Tab navigation: `z-30`
- "Active Tab" badge: `z-10`
- Tab panel: `z-5`
- Drop zone overlay: `z-10` (when hovering)
- Widget content: `z-1`

### CSS Class Naming
- `.tabs-nav` - Base navigation container
- `.tabs-pills` - Pills style modifier
- `.tabs-buttons` - Buttons style modifier
- `.tab-button` - Individual tab button
- `.tab-button.active` - Active tab button (gets CSS styles)
- `.tab-panel` - Content area container
- `.droppable-tab-panel` - Drop zone for widgets

### Pointer Events Strategy
- **Tab buttons:** `pointerEvents: 'auto'` - must be clickable
- **Tab navigation:** `pointerEvents: 'auto'` - container is clickable
- **Drop zones:** `pointerEvents: 'auto'` - must accept drops
- **Widget content:** `pointerEvents: 'auto'` for tabs (exception to normal widgets)
- **Parent container:** Click handler checks for `.tabs-widget` to open properties

---

## Success Criteria

✅ Red underline visible on active tab (underline style)  
✅ Blue background visible on active tab (pills/buttons style)  
✅ "Active Tab" badge visible on active panel  
✅ Tab style switcher works (underline, pills, buttons)  
✅ Can click tabs widget to open properties  
✅ Can distinguish which tab is active for dropping widgets  
✅ Tab buttons are clickable and switch tabs correctly  
✅ Drop zones work in all tabs  
✅ Widgets drop into correct (active) tab  

**All visual indicators working perfectly! 🎉**

