# Tabs Widget Implementation - Agent Handoff Summary

## 🎯 **Quick Brief for Another Agent**

Implement a **Tabs widget** for the Catalyst Page Builder. Users can create tabbed content where each tab panel is a **drop zone** for other widgets.

---

## 📖 **Full Specification**

See: **`TABS_WIDGET_SPECIFICATION.md`** (complete 200+ line detailed spec)

---

## ⚡ **TL;DR Version**

### **What to Build:**
A widget that:
- Shows horizontal tabs at the top
- Each tab has a content panel (drop zone for widgets)
- Only one tab visible at a time
- Properties panel to add/edit/delete tabs (like Menu widget)

### **Key Technical Points:**

1. **Type Definition** (`/src/types/widgets.ts`):
```typescript
type TabsWidget = WidgetBase & {
  type: 'tabs'
  tabs: TabItem[]  // Each has: label, url, icon, widgets[]
  activeTabIndex: number
  tabStyle: 'underline' | 'pills' | 'buttons'
}
```

2. **Library Status** (`/src/library.ts`):
```typescript
{ id: 'tabs', status: 'supported' } // Change from 'planned'
```

3. **Renderer** (`/src/components/Widgets/WidgetRenderer.tsx`):
```typescript
case 'tabs': return <TabsWidgetRenderer widget={widget} />
```

4. **Properties Panel** (`/src/components/Properties/PropertiesPanel.tsx`):
```typescript
case 'tabs': return <TabsProperties widget={widget} />
// Expandable list like Menu widget
```

5. **Drop Zones**:
Each tab panel = droppable area (use @dnd-kit like section areas)

---

## 🎨 **Visual Reference**

User provided screenshots showing:
- Properties panel with tab fields: Label, URL, Class, Icon, Simple Tab ID
- Horizontal tabs with red underline for active tab
- Drop zone with "Drop widgets here" placeholder
- 2-column grid layout for content

---

## 🔗 **Similar Patterns in Codebase**

| Need | Look At | File |
|------|---------|------|
| Expandable properties list | Menu widget | `/src/types/widgets.ts` (MenuWidget) |
| Drop zones | Section areas | `/src/components/Sections/SectionRenderer.tsx` |
| Rendering widgets | Any widget | `/src/components/Widgets/WidgetRenderer.tsx` |
| Drag-drop | Library widgets | `/src/components/Canvas/DraggableLibraryWidget.tsx` |

---

## 📋 **Implementation Checklist**

- [ ] Add types to `/src/types/widgets.ts`
- [ ] Update library status in `/src/library.ts`
- [ ] Create `TabsWidgetRenderer` component
- [ ] Create `TabsProperties` component
- [ ] Add drag-drop logic for tab panels
- [ ] Add CSS styles for tabs
- [ ] Test: drag widget from library → canvas
- [ ] Test: add/edit/delete tabs via properties
- [ ] Test: drag widgets into tab panels
- [ ] Test: tab switching works

---

## 💡 **Key Implementation Notes**

### **1. Each Tab Panel is a Drop Zone**
```typescript
<DroppableTabPanel
  tabId={tab.id}
  widgets={tab.widgets}
  onDrop={(newWidgets) => updateTabWidgets(tab.id, newWidgets)}
/>
```

### **2. Properties Panel Mirrors Menu Widget**
```typescript
{tabs.map(tab => (
  <ExpandableItem
    label={tab.label}
    onToggle={() => toggleExpanded(tab.id)}
  >
    <input value={tab.label} onChange={...} />
    <input value={tab.url} onChange={...} />
    <input value={tab.icon} onChange={...} />
    <button onClick={() => deleteTab(tab.id)}>Delete</button>
  </ExpandableItem>
))}
```

### **3. Default Configuration**
```typescript
{
  type: 'tabs',
  tabs: [
    { id: nanoid(), label: 'Tab 1', widgets: [] },
    { id: nanoid(), label: 'Tab 2', widgets: [] }
  ],
  activeTabIndex: 0,
  tabStyle: 'underline'
}
```

---

## 🚨 **Important Constraints**

1. **Minimum 1 tab** - Don't allow deleting the last tab
2. **Unique IDs** - Use `nanoid()` for all tab IDs
3. **No nested tabs** - Don't allow tabs inside tabs (MVP)
4. **Follow existing patterns** - Match Menu widget properties UX
5. **Use @dnd-kit** - Same drag-drop library as rest of app

---

## 📊 **Estimated Effort**

- **Time**: 4-6 hours for experienced React developer
- **Complexity**: Medium (nested drop zones + properties panel)
- **Files to Touch**: ~6 files
- **Lines of Code**: ~300-400 lines

---

## 🎯 **Success Criteria**

✅ Can add Tabs widget from library  
✅ Can configure tabs via properties panel  
✅ Can drag widgets into tab panels  
✅ Tabs switch correctly  
✅ All state persists  
✅ No console errors  

---

## 🔍 **Where to Start**

1. **Read full spec**: `TABS_WIDGET_SPECIFICATION.md`
2. **Study Menu widget**: `/src/types/widgets.ts` - see `MenuWidget`
3. **Study section drop zones**: `/src/components/Sections/SectionRenderer.tsx`
4. **Start coding**: Begin with types, then renderer, then properties

---

## 📞 **Questions?**

If stuck:
- Check full spec: `TABS_WIDGET_SPECIFICATION.md`
- Look at similar widgets in codebase
- Follow existing drag-drop patterns
- Match Menu widget properties UX

---

**Priority**: High  
**Requested By**: User  
**Related**: Wiley Theme (for pill styling)  

Good luck! 🚀




