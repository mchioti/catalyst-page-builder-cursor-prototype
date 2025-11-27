# PropertiesPanel Refactoring Notes

## Current State
- **Size**: 3,693 lines (largest file in codebase)
- **Structure**: One massive component handling ALL widget types

## Recommended Split (by Library Categories)

```
components/Properties/
├── PropertiesPanel.tsx         ← Orchestrator (~300 lines)
├── hooks/
│   └── useWidgetUpdate.ts      ← Common update logic
├── editors/
│   ├── index.ts                ← Registry exports
│   ├── CorePageElementsEditor.tsx    ← text, heading, image, button, divider, spacer
│   ├── ContentCardsEditor.tsx        ← editorial-card
│   ├── NavigationEditor.tsx          ← menu
│   ├── InteractiveEditor.tsx         ← tabs, collapse
│   ├── PublishingEditor.tsx          ← publication-list, publication-details
│   ├── DIYEditor.tsx                 ← html, code
│   └── SectionEditor.tsx             ← section/content-block
└── shared/
    ├── PropertyField.tsx       ← Reusable input field
    ├── PropertyGroup.tsx       ← Collapsible group
    └── ColorPicker.tsx         ← Already exists in BrandingSystem
```

## Line Breakdown (approx.)

| Section | Lines | Widget Types |
|---------|-------|--------------|
| Setup/Helpers | 1-350 | - |
| Section Properties | 350-970 | content-block |
| Menu Properties | 1005-1250 | menu |
| Widget Type Detection | 1250-1400 | - |
| Image Properties | 1400-1650 | image |
| Heading Properties | 1650-1850 | heading |
| Button Properties | 1850-2000 | button |
| HTML Properties | 2000-2200 | html |
| Code Properties | 2200-2500 | code |
| Publication List | 2500-2900 | publication-list |
| Publication Details | 2900-3200 | publication-details |
| Tabs Properties | 3200-3450 | tabs |
| Collapse Properties | 3450-3693 | collapse |

## Registry Pattern

```typescript
// editors/index.ts
export const PROPERTY_EDITORS: Record<string, React.ComponentType<EditorProps>> = {
  // Core Page Elements
  'text': TextEditor,
  'heading': HeadingEditor,
  'image': ImageEditor,
  'button': ButtonEditor,
  'divider': DividerEditor,
  'spacer': SpacerEditor,
  
  // Content Cards
  'editorial-card': EditorialCardEditor,
  
  // Navigation
  'menu': MenuEditor,
  
  // Interactive
  'tabs': TabsEditor,
  'collapse': CollapseEditor,
  
  // Publishing
  'publication-list': PublicationListEditor,
  'publication-details': PublicationDetailsEditor,
  
  // DIY
  'html': HTMLEditor,
  'code': CodeEditor,
  
  // Sections
  'content-block': SectionEditor,
}
```

## Priority Order for Refactoring

1. **HIGH**: Extract `useWidgetUpdate` hook (common to all editors)
2. **HIGH**: Extract Section editor (350-970 lines)
3. **MEDIUM**: Extract Publishing editors (publication-list, publication-details)
4. **MEDIUM**: Extract DIY editors (html, code)
5. **LOW**: Extract remaining Core elements

## Estimated Time
- Full refactor: 3-4 hours
- Quick wins only: 1 hour (useWidgetUpdate + Section editor)

