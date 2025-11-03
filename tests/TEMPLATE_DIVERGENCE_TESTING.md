# Template Divergence Management - Test-Driven Development

## 🎯 **Overview**

This document describes the TDD approach for implementing **Template Divergence Management** - the foundational system for tracking, visualizing, and managing template customizations across PB4/Catalyst.

## 📋 **What We're Building**

A comprehensive system that allows admins to:

1. **Track** which journals/pages have customized base templates
2. **Visualize** exactly what changed (visual diff)
3. **Reset** customizations back to base template
4. **Promote** customizations to become new base template
5. **Exempt** journals from inheriting base template updates

## 🏗️ **Architecture: Option B**

**Theme Templates Section** = Base templates WITH divergence tracking
- Shows which journals customized each template
- Provides actions: View Diff, Reset, Promote, Exempt

**Website Custom Templates Section** = ONLY brand new templates (created from scratch)
- Not based on theme templates
- Completely custom pages

## 🧪 **Test Files (4 Scenarios)**

### **1. Smoke Tests** (`template-divergence.smoke.test.js`)
**Purpose:** Basic UI elements exist and are accessible

**Tests:**
- Template Library navigation
- Template cards display
- Divergence stats visible
- Customization list expands
- Action buttons appear
- Diff modal opens

**Status:** ✅ Written, ❌ Failing (RED)

---

### **2. Tracking Tests** (`template-divergence.tracking.test.js`)
**Purpose:** System automatically tracks customizations

**Tests:**
- Show "Using base template" for unmodified journals
- Track when journal customizes template
- Show customization in Template Library
- List journal names in customization list
- Count modifications correctly
- Track independently per journal
- Persist across page reloads

**Status:** ✅ Written, ❌ Failing (RED)

---

### **3. Reset Tests** (`template-divergence.reset.test.js`)
**Purpose:** Reset customizations back to base template

**Tests:**
- Show reset button for customized journals
- Confirmation dialog on reset
- Remove from customization list after reset
- Restore base template styling
- Update "using base" count
- Change Page Builder status indicator
- Reset multiple journals independently
- Show success notification

**Status:** ✅ Written, ❌ Failing (RED)

---

### **4. Lifecycle Tests** (`template-divergence.lifecycle.test.js`)
**Purpose:** Complete workflow from customization to promotion

**Master Test Scenario:**
```
1. ADVMA customizes TOC (red banner)
2. EMBO customizes TOC (orange banner)
3. Physics uses default
4. Admin views divergence dashboard
5. Admin views ADVMA's diff
6. Admin exempts EMBO from updates
7. Admin promotes ADVMA to base
8. Physics inherits red banner
9. EMBO stays orange (exempted)
10. Admin resets EMBO to new base
11. All journals now on same base
```

**Additional Tests:**
- Handle promotion conflicts
- Remove exemption
- Track modification history

**Status:** ✅ Written, ❌ Failing (RED)

---

## 📐 **Data Structure**

### **Store Extensions**

```typescript
// New type
type TemplateCustomization = {
  route: string;           // 'toc/dgov/current'
  journalCode: string;     // 'dgov' (ADVMA)
  templateId: string;      // 'toc-template'
  modificationCount: number;
  lastModified: Date;
  isExempt: boolean;       // Don't inherit updates
}

// New store properties
templateCustomizations: TemplateCustomization[];
exemptedRoutes: Set<string>;

// New store methods
trackCustomization(route, journalCode, templateId)
getCustomizationsForTemplate(templateId): TemplateCustomization[]
exemptFromUpdates(route)
resetToBase(route)
promoteToBase(route, templateId)
```

---

## 🎨 **UI Components to Build**

### **1. Divergence Dashboard**
Location: `Design Console > Themes > Theme Templates`

```tsx
<TemplateCard template="toc-template">
  <DivergenceSummary>
    <Stat label="Using Base" value={43} color="green" />
    <Stat label="Customized" value={2} color="amber" />
    <Stat label="Exempted" value={1} color="gray" />
  </DivergenceSummary>
  
  <CustomizationList>
    <CustomizationItem journal="ADVMA">
      12 modifications
      <Actions>
        <IconButton icon={Eye} action="view-diff" />
        <IconButton icon={RotateCcw} action="reset" />
        <IconButton icon={ArrowUp} action="promote" />
        <IconButton icon={Lock} action="exempt" />
      </Actions>
    </CustomizationItem>
  </CustomizationList>
</TemplateCard>
```

### **2. Visual Diff Modal**
```tsx
<TemplateDiffModal>
  <Column label="Base Template">
    <MiniCanvas items={globalTemplateCanvas} />
  </Column>
  
  <ChangesList>
    <Change type="modified">
      Section "Journal Banner"
      • Background: #000 → #DC2626
      • Added 3 buttons
    </Change>
  </ChangesList>
  
  <Column label="ADVMA Customized">
    <MiniCanvas items={routeCanvasItems} />
  </Column>
  
  <Actions>
    <Button action="reset">Reset to Base</Button>
    <Button action="promote">Promote to Base</Button>
    <Button action="exempt">Exempt from Updates</Button>
  </Actions>
</TemplateDiffModal>
```

### **3. Status Indicator in Page Builder**
```tsx
<PageBuilderHeader>
  <TemplateStatus>
    {isCustomized 
      ? `Customized from base (${modificationCount} changes)`
      : 'Using base template'
    }
  </TemplateStatus>
</PageBuilderHeader>
```

---

## 🔄 **Implementation Flow (TDD)**

### **Phase 1: RED (Tests Fail) ✅ DONE**
- ✅ All 4 test files written
- ❌ All tests currently fail (expected)

### **Phase 2: GREEN (Make Tests Pass)**

**Week 1-2: Data Layer**
- [ ] Extend usePageStore with templateCustomizations
- [ ] Add tracking on edit/save
- [ ] Implement change detection algorithm
- [ ] **Goal:** Tracking tests pass ✅

**Week 3-4: Dashboard UI**
- [ ] Build divergence section in SiteManagerTemplates
- [ ] Show customization stats
- [ ] Expandable customization list
- [ ] Action buttons (View Diff, Reset, Promote, Exempt)
- [ ] **Goal:** Smoke tests pass ✅

**Week 5-6: Visual Diff**
- [ ] Create TemplateDiffModal component
- [ ] Side-by-side comparison
- [ ] Change detection display
- [ ] Mini canvas previews
- [ ] **Goal:** Diff viewing works ✅

**Week 7-8: Actions**
- [ ] Implement resetToBase()
- [ ] Implement promoteToBase()
- [ ] Implement exemptFromUpdates()
- [ ] Confirmation dialogs
- [ ] Success notifications
- [ ] **Goal:** Reset tests pass ✅
- [ ] **Goal:** Lifecycle tests pass ✅

### **Phase 3: REFACTOR (Polish)**
- [ ] Clean up code
- [ ] Add error handling
- [ ] Performance optimization
- [ ] Edge case tests
- [ ] **Goal:** All tests stay GREEN ✅

---

## 🚀 **Running Tests**

```bash
# Run all template divergence tests
npm run test:automated -- template-divergence

# Run individual test suites
npm run test:automated -- template-divergence.smoke
npm run test:automated -- template-divergence.tracking
npm run test:automated -- template-divergence.reset
npm run test:automated -- template-divergence.lifecycle

# Run smoke tests only
npm run test:smoke
```

---

## 📊 **Success Criteria**

### **MVP Complete When:**
1. ✅ All 4 test suites pass (GREEN)
2. ✅ Admins can see which journals customized templates
3. ✅ Admins can view visual diffs
4. ✅ Admins can reset customizations
5. ✅ Admins can promote customizations to base
6. ✅ Admins can exempt journals from updates
7. ✅ System tracks modifications automatically
8. ✅ Changes persist across page reloads

### **Quality Checks:**
- Zero linter errors
- All smoke tests pass
- All automated tests pass
- Manual testing checklist complete

---

## 🎓 **User Stories**

### **Story 1: Track Customizations**
> As a Design System Admin, I want to see which journals have customized the TOC template, so I know which journals have diverged from the base design.

**Acceptance:**
- Navigate to Theme Templates
- See "2 customized" badge on TOC template
- Click to expand and see ADVMA and EMBO listed

---

### **Story 2: View Differences**
> As a Design System Admin, I want to see exactly what ADVMA changed in their TOC, so I can decide whether to promote their changes or reset them.

**Acceptance:**
- Click "View Diff" on ADVMA
- See side-by-side comparison
- See list of changes (banner color, buttons added)

---

### **Story 3: Promote to Base**
> As a Design System Admin, I want to promote ADVMA's red banner to the base template, so all journals can benefit from this improvement.

**Acceptance:**
- Click "Promote to Base" on ADVMA
- Confirm action in dialog
- Physics journal now has red banner
- ADVMA no longer in "customized" list (matches base)

---

### **Story 4: Exempt from Updates**
> As a Design System Admin, I want to exempt EMBO from template updates, so they can keep their unique branding even when the base template changes.

**Acceptance:**
- Click "Exempt" on EMBO
- EMBO shows "Exempted" badge
- When base template updates, EMBO is not affected

---

### **Story 5: Reset to Base**
> As a Design System Admin, I want to reset a journal's customizations, so they inherit the latest base template design.

**Acceptance:**
- Click "Reset" on EMBO
- Confirm action
- EMBO's orange banner becomes red (inherits base)
- EMBO removed from "customized" list

---

## 📝 **Notes**

### **Why TDD for This Feature?**
1. **Foundational** - Everything builds on this (scope system, inheritance)
2. **Complex** - Many moving parts (tracking, diffing, promoting, exempting)
3. **Critical** - Can't afford bugs (affects entire platform)
4. **Well-defined** - User flows are clear and testable

### **What's Different from PB2?**
- **Simpler UI** - No 5-dimensional scope matrix
- **Visual diffing** - See exactly what changed
- **Promote to base** - Make customizations the new default
- **Exempt from updates** - Freeze customizations when needed
- **Template Library** - Bird's eye view of platform

---

## ✅ **Next Steps**

**Immediate:**
1. Run tests to confirm they fail (RED phase)
2. Start implementing data layer
3. Watch tests turn GREEN one by one

**Commands:**
```bash
# Run tests (should fail initially)
npm run test:automated -- template-divergence

# Start implementation
# ... code the features ...

# Re-run tests (watch them pass!)
npm run test:automated -- template-divergence
```

---

**Status:** 🔴 RED (Tests written, failing as expected)  
**Next:** 🟢 GREEN (Implement features to make tests pass)  
**Then:** ♻️ REFACTOR (Polish and optimize)

Let's build this! 🚀

