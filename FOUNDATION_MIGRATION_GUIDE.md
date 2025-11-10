# Atypon Design Foundation - Migration Guide

This guide explains how to adopt the Atypon Design Foundation for new components and migrate existing components.

---

## **What is the Foundation?**

The Atypon Design Foundation is a **headless design system** that provides:
- ✅ **Component Behavior** (keyboard nav, focus, states) - Locked & standardized
- ✅ **Accessibility** (ARIA, contrast, keyboard support) - Locked & WCAG-compliant
- ✅ **Token Contracts** (required design tokens) - Enforced interface
- ❌ **Visual Appearance** (colors, shapes, typography) - Theme-defined

**Key Principle:** Foundation defines **HOW** components work, Themes define **HOW THEY LOOK**.

---

## **Architecture Overview**

```
┌─────────────────────────────────────────────────┐
│  ATYPON DESIGN FOUNDATION (Layer 0)             │
│  - Button, Card, Menu, Tabs, etc.               │
│  - Behavior contracts (locked)                   │
│  - Token contracts (required)                    │
│  - Publishing widgets (Journal Banner, TOC, etc.)│
└──────────────────┬──────────────────────────────┘
                   │ extends
       ┌───────────┴───────────┬──────────┬─────────┐
       │                       │          │         │
┌──────┴────────┐  ┌──────────┴───┐  ┌───┴────┐  ┌─┴────────┐
│ Wiley DS V2   │  │ Classic UX3  │  │ Carbon │  │   Ant    │
│  (Academic)   │  │  (Classic)   │  │(Medical│  │(Friendly)│
│               │  │              │  │ /Minimal)  │          │
└───────┬───────┘  └──────┬───────┘  └───┬────┘  └─┬────────┘
        │                 │              │          │
        │ Applied as Theme                           │
        ↓                 ↓              ↓          ↓
  ┌─────────┐       ┌─────────┐   ┌─────────┐  ┌──────────┐
  │ Wiley   │       │  Wiley  │   │Hospital │  │  Legal   │
  │  .com   │       │ Online  │   │  Site   │  │  Portal  │
  └─────────┘       │ Library │   └─────────┘  └──────────┘
                    └─────────┘
```

---

## **Migration Paths**

### **Path A: New Components (Recommended)**
Use Foundation components from day one.

### **Path B: Existing Components**
Migrate gradually, starting with high-impact components (Button, Card).

### **Path C: Legacy Components**
Keep old system until Foundation coverage is complete, then migrate.

**Current Status:** Button is complete with adapters for Wiley DS V2 and Classic UX3.

---

## **How to Use Foundation Components**

### **Step 1: Import the Component**

```tsx
import { Button } from '@/foundation'
```

### **Step 2: Use it in Your Code**

```tsx
<Button 
  variant="solid"      // solid | outline | ghost | link
  color="primary"      // primary | secondary | tertiary
  size="medium"        // small | medium | large
  onClick={handleClick}
>
  Click Me
</Button>
```

### **Step 3: The Theme Provides the Styling**

The button automatically inherits:
- Colors from `action-primary`, `action-secondary`, etc.
- Typography from `button-font-family`, `button-font-size-*`, etc.
- Spacing from `button-padding-*`, `button-height-*`, etc.
- Shape from `button-radius-*`
- Motion from `motion-duration-*`, `motion-easing-*`

**No manual styling needed!**

---

## **How to Add Foundation Support to a Theme**

### **Step 1: Create a Theme Adapter**

Create a file in `src/foundation/adapters/your-theme-name.ts`:

```typescript
import { FoundationTokens } from '../tokens/contracts'

export function mapYourThemeToFoundation(theme: any): FoundationTokens {
  return {
    // Action Colors (Buttons, Links)
    'action-primary': theme.colors.primary,
    'action-primary-hover': theme.colors.primaryHover,
    'action-primary-active': theme.colors.primaryActive,
    'action-primary-disabled': theme.colors.disabled,
    'action-primary-text': '#FFFFFF',
    
    // ... (map all required tokens)
    
    // Button Component
    'button-radius-medium': theme.spacing?.buttonRadius || '4px',
    'button-padding-medium': '10px 20px',
    'button-font-family': theme.typography?.bodyFont,
    'button-font-size-medium': '14px',
    'button-font-weight': '500',
    
    // ... (continue for all tokens)
  }
}
```

**See `src/foundation/adapters/classic-ux3.ts` for a complete example.**

### **Step 2: Export the Adapter**

In `src/foundation/index.ts`, add:

```typescript
export { mapYourThemeToFoundation } from './adapters/your-theme-name'
```

### **Step 3: Register in CanvasThemeProvider**

In `src/components/Canvas/CanvasThemeProvider.tsx`, add your theme to the Foundation injection logic:

```typescript
if (currentTheme.id === 'your-theme-id') {
  foundationTokens = mapYourThemeToFoundation(currentTheme)
}
```

### **Step 4: Test**

1. Spin off a website using your theme
2. Add Foundation buttons to a page
3. Verify colors, typography, spacing match your theme

**Done!** Your theme now supports Foundation components.

---

## **Token Contract Reference**

### **Required Tokens (Minimum)**

All themes MUST define these tokens:

| Category | Token | Example Value | Purpose |
|----------|-------|---------------|---------|
| **Action Colors** | `action-primary` | `#267273` | Primary button background |
| | `action-primary-hover` | `#1a4c4d` | Primary button hover |
| | `action-primary-text` | `#FFFFFF` | Primary button text |
| | `action-secondary` | `#0066CC` | Secondary button background |
| | `action-tertiary` | `#666666` | Tertiary button background |
| **Typography** | `font-family-primary` | `'Inter, sans-serif'` | Body font |
| | `button-font-family` | `'Inter, sans-serif'` | Button font |
| | `button-font-size-medium` | `14px` | Medium button text size |
| | `button-font-weight` | `500` | Button text weight |
| **Spacing** | `spacing-2` | `8px` | Base spacing unit |
| | `button-padding-medium` | `10px 20px` | Medium button padding |
| | `button-height-medium` | `40px` | Medium button height |
| **Component** | `button-radius-medium` | `4px` | Medium button border radius |
| | `button-border-width` | `1px` | Button border width |
| **Motion** | `motion-duration-normal` | `150ms` | Standard transition duration |
| | `motion-easing-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | Standard easing |

**Full contract:** See `src/foundation/tokens/contracts.ts` (87 tokens total).

---

## **Component Coverage**

| Component | Status | Adapters | Notes |
|-----------|--------|----------|-------|
| **Button** | ✅ Complete | Wiley DS V2, Classic UX3 | All variants (solid, outline, ghost, link) |
| **Card** | ❌ Planned | - | Container component |
| **Menu** | ❌ Planned | - | Navigation component |
| **Tabs** | ❌ Planned | - | Content organization |
| **Publication Card** | ❌ Planned | - | Publishing-specific widget |
| **Journal Banner** | ❌ Planned | - | Publishing-specific widget |

---

## **FAQs**

### **Q: Can I use Foundation components with legacy themes?**
**A:** No. You must create an adapter for your theme first (see "How to Add Foundation Support").

### **Q: What if my theme doesn't have a token?**
**A:** Provide a sensible default in your adapter. Example:
```typescript
'button-shadow-hover': theme.components?.button?.shadow || '0 2px 4px rgba(0,0,0,0.1)'
```

### **Q: Can I customize Foundation component behavior?**
**A:** No. Behavior is locked for consistency and accessibility. You can only customize appearance via tokens.

### **Q: What if I need a custom button that doesn't fit the Foundation contract?**
**A:** Use the DIY tab (HTML widget, Code Block) for one-off customizations. If the need is common, propose adding it to Foundation.

### **Q: Can I override Foundation styles with inline styles?**
**A:** Not recommended. Foundation uses CSS specificity carefully. If you need different styling, create a new token value in your theme.

### **Q: How do I test my theme adapter?**
**A:** Use the Foundation Test Page (`/foundation-test`). It shows all button variants and states.

---

## **Testing Checklist**

When adding Foundation support to a theme, test:

- [ ] **Visual Match:** Do Foundation buttons match your theme's design?
- [ ] **Hover States:** Do hover effects work as expected?
- [ ] **Focus States:** Do focus rings appear for keyboard navigation?
- [ ] **Active States:** Does the pressed state look correct?
- [ ] **Disabled States:** Are disabled buttons visually distinct and non-interactive?
- [ ] **Loading State:** Does the spinner appear correctly?
- [ ] **Typography:** Does the button text use the correct font, size, weight, and transform?
- [ ] **Spacing:** Are padding and height correct for all sizes (small, medium, large)?
- [ ] **Shape:** Is the border-radius correct?
- [ ] **Brand Switching:** (For multi-brand themes) Do colors change correctly?

---

## **Next Steps**

1. **Use Foundation Buttons:** Replace old button implementations with Foundation buttons in new pages.
2. **Add More Components:** Card, Menu, Tabs (planned).
3. **Create Adapters for Other Themes:** Ant Design, IBM Carbon.
4. **Extend to Publishing Widgets:** Journal Banner, Publication Card, TOC.

---

## **Resources**

- **Foundation README:** `src/foundation/README.md`
- **Token Contracts:** `src/foundation/tokens/contracts.ts`
- **Example Adapters:** `src/foundation/adapters/wiley-ds-v2.ts`, `classic-ux3.ts`
- **Test Page:** `src/components/Foundation/FoundationTestPage.tsx`
- **Button Component:** `src/foundation/components/Button.tsx`
- **Button Styles:** `src/foundation/styles/button.css`

---

**Questions?** Ask the team or open a discussion in the repository.

