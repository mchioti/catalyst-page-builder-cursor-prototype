# Tabs Widget Implementation Specification

## 📋 Overview

Implement a Tabs widget for the Catalyst Page Builder that allows users to create tabbed content where each tab panel acts as a drop zone for other widgets.

---

## 🎯 Requirements

### Widget Behavior
- **Horizontal tab navigation** at the top
- **Each tab has its own content panel** (drop zone)
- **Only one tab is active/visible** at a time
- **Widgets can be dragged** into any tab's drop zone
- **Tabs are reorderable** via the properties panel

---

## 📸 Reference Screenshots

User provided screenshots showing:
1. **Properties panel** with expandable tab configuration (like Menu widget)
2. **Rendered tabs** with horizontal navigation and underline for active tab
3. **Empty drop zone** with placeholder message
4. **Drop zone with widgets** showing 2-column grid layout
5. **Tab switching** behavior

---

## 🏗️ Architecture Overview

This page builder follows a clean separation:

### **Sections**
- Container with layout and drop zones (areas)
- Example: `three-columns` section has 3 areas where widgets go

### **Widgets**
- Atomic content blocks (Text, Button, Image, etc.)
- Placed inside section drop zones
- The Tabs widget is unique: it's a **widget that contains drop zones**

### **Key Files**
- `/src/types/widgets.ts` - Type definitions
- `/src/library.ts` - Widget library catalog
- `/src/components/Properties/PropertiesPanel.tsx` - Properties UI
- `/src/components/Widgets/WidgetRenderer.tsx` - Widget rendering
- `/src/components/Canvas/LayoutRenderer.tsx` - Drag-drop handling

---

## 📝 Implementation Steps

### **Step 1: Define Types** (`/src/types/widgets.ts`)

Add these type definitions:

```typescript
export type TabItem = {
  id: string
  label: string
  url?: string        // Optional: for navigation
  class?: string      // Optional: custom CSS class
  icon?: string       // Optional: emoji or icon
  simpleTabId?: string // Optional: unique identifier
  widgets: Widget[]   // Array of widgets in this tab panel (DROP ZONE)
}

export type TabsWidget = WidgetBase & {
  type: 'tabs'
  tabs: TabItem[]
  activeTabIndex: number
  tabStyle: 'underline' | 'pills' | 'buttons'
  align?: 'left' | 'center' | 'right'
}
```

Then add `TabsWidget` to the main `Widget` union type:

```typescript
export type Widget = TextWidget | ImageWidget | ... | TabsWidget
```

---

### **Step 2: Update Library Status** (`/src/library.ts`)

Change the tabs widget from `'planned'` to `'supported'`:

```typescript
{
  id: 'tabs',
  label: 'Tabs',
  type: 'tabs',
  description: 'Tabbed content',
  status: 'supported' // Change from 'planned'
}
```

---

### **Step 3: Create Widget Renderer** (`/src/components/Widgets/WidgetRenderer.tsx`)

Add a new case for the tabs widget:

```typescript
case 'tabs':
  return <TabsWidgetRenderer widget={widget as TabsWidget} />
```

Then create the `TabsWidgetRenderer` component (can be in same file or separate):

```typescript
function TabsWidgetRenderer({ widget }: { widget: TabsWidget }) {
  const [activeIndex, setActiveIndex] = useState(widget.activeTabIndex || 0)
  const { updateWidget } = usePageStore() // Assuming store access
  
  return (
    <div className="tabs-widget">
      {/* Tab Navigation */}
      <div className={`tabs-nav ${widget.tabStyle === 'underline' ? 'tabs-nav-underline' : ''}`}>
        {widget.tabs.map((tab, index) => (
          <button
            key={tab.id}
            onClick={() => setActiveIndex(index)}
            className={`tab-button ${activeIndex === index ? 'active' : ''}`}
          >
            {tab.icon && <span>{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Active Tab Panel - This is the DROP ZONE */}
      <div className="tab-panel">
        <DroppableTabPanel
          tabId={widget.tabs[activeIndex].id}
          widgets={widget.tabs[activeIndex].widgets}
          onDrop={(newWidgets) => {
            // Update the specific tab's widgets
            const updatedTabs = [...widget.tabs]
            updatedTabs[activeIndex].widgets = newWidgets
            updateWidget(widget.id, { tabs: updatedTabs })
          }}
        />
      </div>
    </div>
  )
}
```

---

### **Step 4: Create Droppable Tab Panel**

This component makes each tab panel a drop zone:

```typescript
function DroppableTabPanel({ tabId, widgets, onDrop }: {
  tabId: string
  widgets: Widget[]
  onDrop: (widgets: Widget[]) => void
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `tab-panel-${tabId}`,
    data: {
      type: 'tab-panel',
      accepts: ['widget']
    }
  })
  
  return (
    <div
      ref={setNodeRef}
      className={`droppable-tab-panel ${isOver ? 'drag-over' : ''}`}
    >
      {widgets.length === 0 ? (
        <div className="empty-state">
          Drop widgets here
        </div>
      ) : (
        <div className="tab-widgets">
          {widgets.map(widget => (
            <WidgetRenderer key={widget.id} widget={widget} />
          ))}
        </div>
      )}
    </div>
  )
}
```

**Note**: The exact drag-drop implementation depends on your existing DnD system (looks like you're using @dnd-kit). Follow the same pattern as section drop zones.

---

### **Step 5: Properties Panel** (`/src/components/Properties/PropertiesPanel.tsx`)

Add a new case for tabs widget properties:

```typescript
case 'tabs':
  return <TabsProperties widget={widget as TabsWidget} />
```

Create the `TabsProperties` component (similar to Menu widget):

```typescript
function TabsProperties({ widget }: { widget: TabsWidget }) {
  const { updateWidget } = usePageStore()
  const [expandedTabs, setExpandedTabs] = useState<Set<string>>(new Set())
  
  const addTab = () => {
    const newTab: TabItem = {
      id: nanoid(),
      label: 'New Tab',
      widgets: []
    }
    updateWidget(widget.id, {
      tabs: [...widget.tabs, newTab]
    })
  }
  
  const updateTab = (tabId: string, updates: Partial<TabItem>) => {
    const updatedTabs = widget.tabs.map(tab =>
      tab.id === tabId ? { ...tab, ...updates } : tab
    )
    updateWidget(widget.id, { tabs: updatedTabs })
  }
  
  const deleteTab = (tabId: string) => {
    updateWidget(widget.id, {
      tabs: widget.tabs.filter(tab => tab.id !== tabId)
    })
  }
  
  return (
    <div className="tabs-properties">
      <h4>Tabs Configuration</h4>
      
      {/* Tab Style Selector */}
      <div className="property-group">
        <label>Tab Style</label>
        <select
          value={widget.tabStyle}
          onChange={(e) => updateWidget(widget.id, { tabStyle: e.target.value })}
        >
          <option value="underline">Underline</option>
          <option value="pills">Pills</option>
          <option value="buttons">Buttons</option>
        </select>
      </div>
      
      {/* Tab Items List (Expandable like Menu) */}
      <div className="property-group">
        <label>Tabs</label>
        {widget.tabs.map((tab, index) => (
          <div key={tab.id} className="tab-item">
            <button
              onClick={() => {
                const newExpanded = new Set(expandedTabs)
                if (newExpanded.has(tab.id)) {
                  newExpanded.delete(tab.id)
                } else {
                  newExpanded.add(tab.id)
                }
                setExpandedTabs(newExpanded)
              }}
              className="tab-header"
            >
              <ChevronRight className={expandedTabs.has(tab.id) ? 'rotated' : ''} />
              {tab.label || `Tab ${index + 1}`}
            </button>
            
            {expandedTabs.has(tab.id) && (
              <div className="tab-details">
                <input
                  type="text"
                  placeholder="Tab Label"
                  value={tab.label}
                  onChange={(e) => updateTab(tab.id, { label: e.target.value })}
                />
                
                <input
                  type="text"
                  placeholder="URL (optional)"
                  value={tab.url || ''}
                  onChange={(e) => updateTab(tab.id, { url: e.target.value })}
                />
                
                <input
                  type="text"
                  placeholder="Class (optional)"
                  value={tab.class || ''}
                  onChange={(e) => updateTab(tab.id, { class: e.target.value })}
                />
                
                <input
                  type="text"
                  placeholder="Icon (optional)"
                  value={tab.icon || ''}
                  onChange={(e) => updateTab(tab.id, { icon: e.target.value })}
                />
                
                <input
                  type="text"
                  placeholder="Simple Tab ID (optional)"
                  value={tab.simpleTabId || ''}
                  onChange={(e) => updateTab(tab.id, { simpleTabId: e.target.value })}
                />
                
                <button onClick={() => deleteTab(tab.id)} className="delete-btn">
                  Delete Tab
                </button>
              </div>
            )}
          </div>
        ))}
        
        <button onClick={addTab} className="add-tab-btn">
          + Add Tab
        </button>
      </div>
    </div>
  )
}
```

---

### **Step 6: Drag-Drop Integration** (`/src/components/Canvas/LayoutRenderer.tsx`)

Update `handleDragEnd` to support dropping widgets into tab panels:

```typescript
const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event
  
  // ... existing code ...
  
  // Handle drop into tab panel
  if (over?.data?.current?.type === 'tab-panel') {
    const tabPanelId = over.id as string
    const tabId = tabPanelId.replace('tab-panel-', '')
    
    // Find the tabs widget that owns this panel
    // Add the widget to that tab's widgets array
    // ... implementation ...
  }
}
```

---

### **Step 7: CSS Styles** (`/src/styles/branding-system.css` or new file)

Add tab styling:

```css
/* Tab Navigation */
.tabs-nav {
  display: flex;
  gap: 0.5rem;
  border-bottom: 2px solid #e5e7eb;
  margin-bottom: 1rem;
}

.tab-button {
  padding: 0.75rem 1.5rem;
  border: none;
  background: transparent;
  cursor: pointer;
  font-weight: 500;
  color: #6b7280;
  transition: all 0.2s;
  position: relative;
}

.tab-button.active {
  color: #1f2937;
}

/* Underline Style */
.tabs-nav-underline .tab-button.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #ef4444; /* Red underline */
}

/* Tab Panel */
.tab-panel {
  min-height: 200px;
  padding: 1rem;
}

.droppable-tab-panel {
  min-height: 150px;
  border: 2px dashed transparent;
  border-radius: 4px;
  transition: all 0.2s;
}

.droppable-tab-panel.drag-over {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 150px;
  color: #9ca3af;
  font-style: italic;
}

/* Wiley Theme Pill Style */
.wiley-pill-nav .tab-button {
  border-radius: 9999px;
  padding: 0.625rem 1.5rem;
}

.wiley-pill-nav .tab-button.active {
  background-color: #ffffff;
  color: #1f2937;
}
```

---

## 🎨 Default Configuration

When a user drags the Tabs widget from the library:

```typescript
const defaultTabsWidget: TabsWidget = {
  id: nanoid(),
  type: 'tabs',
  skin: 'minimal',
  tabs: [
    {
      id: nanoid(),
      label: 'Tab 1',
      widgets: []
    },
    {
      id: nanoid(),
      label: 'Tab 2',
      widgets: []
    }
  ],
  activeTabIndex: 0,
  tabStyle: 'underline',
  align: 'left'
}
```

---

## ✅ Testing Checklist

- [ ] Can drag Tabs widget from library to canvas
- [ ] Properties panel shows all tab configuration options
- [ ] Can add new tabs via properties panel
- [ ] Can edit tab labels, URLs, icons, etc.
- [ ] Can delete tabs
- [ ] Can drag widgets into tab panels
- [ ] Only active tab panel is visible
- [ ] Clicking tab buttons switches active tab
- [ ] Widgets inside tabs render correctly
- [ ] Can reorder widgets within a tab
- [ ] Can delete widgets from tabs
- [ ] Tabs persist when saving/loading
- [ ] Empty tab panels show placeholder
- [ ] Different tab styles (underline, pills, buttons) work

---

## 🔗 Key References

### Files to Modify:
1. `/src/types/widgets.ts` - Add TabsWidget and TabItem types
2. `/src/library.ts` - Change status to 'supported'
3. `/src/components/Widgets/WidgetRenderer.tsx` - Add TabsWidgetRenderer
4. `/src/components/Properties/PropertiesPanel.tsx` - Add TabsProperties
5. `/src/components/Canvas/LayoutRenderer.tsx` - Update drag-drop logic
6. `/src/styles/` - Add tab styling

### Similar Patterns to Follow:
- **Menu widget** (`/src/types/widgets.ts` - see `MenuWidget` type)
  - Has expandable items in properties panel
  - Each item has multiple fields
- **Section areas** (`/src/components/Sections/SectionRenderer.tsx`)
  - Shows how drop zones work
  - How to render widgets in a container
- **Library drag** (`/src/components/Canvas/DraggableLibraryWidget.tsx`)
  - How widgets are dragged from library

---

## 💡 Implementation Tips

### 1. Start Simple
Begin with just rendering tabs and switching between them. Add drop zone functionality once basic rendering works.

### 2. Follow Existing Patterns
Look at how Menu widget handles expandable items in properties panel. Copy that pattern.

### 3. Drop Zone Logic
The tab panel should work exactly like section areas. Look at `DroppableArea` component for reference.

### 4. State Management
Use the same `usePageStore` patterns as other widgets. The store should have:
```typescript
updateWidget(widgetId, updates) // Update widget properties
```

### 5. Drag-Drop Integration
The app uses @dnd-kit library. Check how section areas use `useDroppable` hook and replicate for tab panels.

---

## 🚨 Edge Cases to Handle

1. **Minimum tabs**: Don't allow deleting the last tab (keep at least 1)
2. **Active tab deletion**: If active tab is deleted, switch to first tab
3. **Empty tabs**: Show placeholder text when tab has no widgets
4. **Unique IDs**: Ensure all tab IDs are unique (use `nanoid()`)
5. **Tab reordering**: Consider adding up/down buttons in properties panel
6. **Nested tabs**: Should tabs widgets be allowed inside tab panels? (Suggest: no, for MVP)

---

## 📊 Priority Levels

### Must Have (MVP):
- ✅ Basic tab navigation
- ✅ Drop zones for widgets
- ✅ Properties panel (add/edit/delete tabs)
- ✅ Underline style
- ✅ Tab switching

### Nice to Have (Later):
- Pills style (Wiley theme)
- Buttons style
- Tab reordering via drag
- URL navigation on tab click
- Icons in tabs
- Nested tab widgets (tabs inside tabs)

---

## 🎯 Success Criteria

The implementation is complete when:
1. Users can add Tabs widget from library
2. Users can configure tabs via properties panel (like Menu widget)
3. Users can drag widgets into any tab's drop zone
4. Tabs switch correctly when clicked
5. Widgets render correctly inside tab panels
6. All state persists correctly
7. No console errors or warnings

---

## 📝 Questions/Clarifications Needed

If you need clarification on:
- **Drag-drop system**: Check `/src/components/Canvas/LayoutRenderer.tsx` - line ~200-400
- **Store usage**: Check any widget in `/src/components/Widgets/WidgetRenderer.tsx`
- **Properties panel pattern**: Check Menu widget properties
- **Drop zones**: Check `/src/components/Sections/SectionRenderer.tsx`

---

## 🔗 Related Documentation

- **Widget Architecture**: See existing widgets in `/src/types/widgets.ts`
- **Drag & Drop**: @dnd-kit library - https://docs.dndkit.com/
- **Store Pattern**: Zustand - all state management uses this
- **Wiley Theme**: `/WILEY_THEME.md` for styling tabs with Wiley look

---

**Estimated Effort**: 4-6 hours for experienced React developer

**Complexity**: Medium (requires understanding of drag-drop and nested components)

**Priority**: High (user explicitly requested)

---

Good luck! 🚀




