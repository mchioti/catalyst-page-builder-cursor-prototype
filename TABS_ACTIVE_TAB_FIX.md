# Tabs Widget - Active Tab Persistence Fix

## The Problem

When dropping a widget into a tab panel:
1. User clicks **Tab 2** (index 1)
2. User drags and drops a widget into Tab 2
3. Widget gets added to Tab 2's widgets array ✅
4. BUT the UI switches back to showing **Tab 1** ❌

## Root Cause

### Timing Issue
When you click a tab, `handleTabChange` updates both:
- Local state: `setActiveIndex(1)` 
- Global store: `replaceCanvasItems` with `activeTabIndex: 1`

However, when you immediately drop a widget:
- The drop handler reads from the store
- The store might still have the old `activeTabIndex: 0` (timing race)
- Drop adds widget to correct tab (based on `tabId`)
- Drop updates store with `...tabsWidget` (includes old `activeTabIndex: 0`)
- UI switches back to Tab 1!

### Console Evidence
```
🔄 Switching to tab: 1 Current activeIndex: 0
🔄 Widget updated, activeTabIndex: 0
✅ Library widget dropped into tab panel! {tabId: 'k3uJJDM-9e4ifF7if9J90'...}
```

The widget was dropped into the correct tab ID, but the `activeTabIndex` remained 0.

## The Solution

**When dropping a widget into a tab, also update `activeTabIndex` to match the target tab!**

### Changes Made

#### 1. `src/components/PageBuilder/index.tsx` - handleDragEnd

```typescript
// BEFORE
return {
  ...tabsWidget,
  tabs: tabsWidget.tabs.map((tab: any) => 
    tab.id === tabId 
      ? { ...tab, widgets: [...tab.widgets, newWidget] }
      : tab
  )
}

// AFTER
const targetTabIndex = tabsWidget.tabs.findIndex((t: any) => t.id === tabId)
console.log('🎯 Setting activeTabIndex to:', targetTabIndex, 'for dropped widget')
return {
  ...tabsWidget,
  activeTabIndex: targetTabIndex >= 0 ? targetTabIndex : tabsWidget.activeTabIndex,
  tabs: tabsWidget.tabs.map((tab: any) => 
    tab.id === tabId 
      ? { ...tab, widgets: [...tab.widgets, newWidget] }
      : tab
  )
}
```

**Logic:**
1. Find the index of the tab we're dropping into
2. Set `activeTabIndex` to that index
3. Add the widget to that tab's widgets array
4. After the drop, the UI stays on the correct tab!

#### 2. `src/components/Widgets/WidgetRenderer.tsx` - Improved useEffect

```typescript
// BEFORE
React.useEffect(() => {
  console.log('🔄 Widget updated, activeTabIndex:', widget.activeTabIndex)
  if (widget.activeTabIndex !== undefined && widget.activeTabIndex !== activeIndex) {
    setActiveIndex(widget.activeTabIndex)
  }
}, [widget.activeTabIndex])

// AFTER  
React.useEffect(() => {
  console.log('🔄 Widget updated, activeTabIndex:', widget.activeTabIndex, 'current local activeIndex:', activeIndex)
  if (widget.activeTabIndex !== undefined && widget.activeTabIndex !== activeIndex) {
    console.log('📝 Syncing activeIndex from', activeIndex, 'to', widget.activeTabIndex)
    setActiveIndex(widget.activeTabIndex)
  }
}, [widget.activeTabIndex, activeIndex])
```

**Improvements:**
- Added `activeIndex` to dependency array (ESLint best practice)
- Added more detailed logging to track state synchronization
- Now properly syncs when either value changes

## How It Works Now

### Scenario: Drop widget into Tab 2

1. **Click Tab 2**
   - Local state: `activeIndex = 1`
   - Store: `activeTabIndex = 1` (via `handleTabChange`)

2. **Drag widget from library**
   - Collision detection finds: `tab-panel-k3uJJDM...` (Tab 2's panel)

3. **Drop widget**
   - `handleDragEnd` finds: `tabId = 'k3uJJDM...'`
   - Finds tab index: `targetTabIndex = 1`
   - Updates store:
     ```javascript
     {
       ...tabsWidget,
       activeTabIndex: 1,  // ✅ Explicitly set!
       tabs: [
         { id: 'abc', widgets: [] },          // Tab 1
         { id: 'k3uJJDM...', widgets: [newWidget] } // Tab 2 ✅
       ]
     }
     ```

4. **Component re-renders**
   - `useEffect` sees `widget.activeTabIndex = 1`
   - Syncs `activeIndex` to 1
   - UI shows Tab 2 with the new widget ✅

## Expected Console Output

```
🔄 Switching to tab: 1 Current activeIndex: 0
🎯 DRAGGING OVER TAB PANEL! {tabId: 'k3uJJDM...', widgetId: 'f1OuIHTX...'}
🎯 Tab panel collision detected!
✅ Library widget dropped into tab panel! {tabId: 'k3uJJDM...', widgetId: 'f1OuIHTX...'}
🔧 Created widget: heading jlZlc14a... for tab: k3uJJDM...
🎯 Setting activeTabIndex to: 1 for dropped widget  <-- NEW LOG
📝 Syncing activeIndex from 0 to 1                   <-- NEW LOG
✅ Widget added to tab panel!
```

## Testing Checklist

- [ ] Click Tab 1, drop widget → Widget appears in Tab 1, UI stays on Tab 1
- [ ] Click Tab 2, drop widget → Widget appears in Tab 2, UI stays on Tab 2
- [ ] Click Tab 1, drop widget → Click Tab 2, drop widget → Each tab has correct widgets
- [ ] Switch between tabs → See correct widgets in each tab
- [ ] Refresh page → Active tab and widgets persist correctly

## Benefits

1. **No more tab switching bug** - UI stays on the tab you dropped into
2. **Better UX** - You see the widget you just added immediately
3. **Explicit state management** - `activeTabIndex` is always set intentionally
4. **Predictable behavior** - Drop location determines active tab

## Files Changed

- `src/components/PageBuilder/index.tsx` (lines 534-581)
- `src/components/Widgets/WidgetRenderer.tsx` (lines 1302-1308)

