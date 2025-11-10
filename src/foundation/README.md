# Atypon Design Foundation

A headless design system that provides component behavior, accessibility, and token contracts for publishing platforms.

## What is the Foundation?

The Atypon Design Foundation provides:
- ✅ **Component Behavior** (keyboard nav, focus, states) - Locked
- ✅ **Accessibility** (ARIA, contrast, keyboard) - Locked  
- ✅ **Token Contracts** (what themes must define) - Required
- ❌ **Visual Appearance** (colors, shapes, typography) - Theme-defined

## Architecture

```
Atypon Design Foundation (behavior + contracts)
  ↓ extends
Design Systems (Wiley DS, Carbon DS, Ant Design)
  ↓ applied as
Themes (token values)
  ↓ renders
Websites
```

## Components

### Phase 1 (Current)
- **Button** - Interactive actions with full token support

### Planned
- Card - Content containers
- Publication Card - Schema.org publishing widget
- Menu - Navigation
- Tabs - Content organization
- Journal Banner - Publishing-specific header

## Token System

### Token Categories
1. **Color** - Action, surface, content, feedback
2. **Typography** - Font families, sizes, weights, line heights
3. **Spacing** - Padding, margin, gaps (8px base scale)
4. **Component** - Button radius, card shadows, etc.
5. **Motion** - Animation durations and easings

### Example Token Contract
```typescript
{
  // Colors
  'action-primary': '#267273',
  'action-primary-hover': '#1a4c4d',
  
  // Component Shape
  'button-radius': '4px',
  'button-padding-medium': '10px 20px',
  'button-shadow': '0 1px 3px rgba(0,0,0,0.1)',
  
  // Typography
  'font-body': 'Lato, sans-serif',
  'font-button-size': '14px',
  'font-button-weight': '500'
}
```

## Usage

### For Theme Creators
1. Import Foundation components
2. Provide token values matching the contract
3. Foundation handles behavior, you control appearance

### For Developers
```tsx
import { Button } from '@/foundation/components/Button'

// Foundation Button with theme tokens applied
<Button variant="primary" size="medium">
  Click Me
</Button>
```

## Migration Status

- [x] Foundation structure created
- [ ] Button component implemented
- [ ] Token resolver created
- [ ] Wiley DS V2 migrated
- [ ] Classic UX3 migrated
- [ ] Ant Design migrated
- [ ] IBM Carbon migrated

