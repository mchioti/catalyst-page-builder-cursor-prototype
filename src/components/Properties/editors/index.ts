/**
 * Property Editors Registry
 * 
 * Maps widget types to their property editor components.
 * Editors are organized by library categories.
 */

// NOTE: Individual editors will be added as they're extracted from PropertiesPanel.tsx
// See REFACTORING_NOTES.md for the full plan.

// Export type for editor props
export interface PropertyEditorProps {
  widget: any
  updateWidget: (updates: any) => void
  // Additional props as needed
}

// Registry will be populated as editors are extracted
export const PROPERTY_EDITORS: Record<string, React.ComponentType<PropertyEditorProps>> = {
  // Core Page Elements
  // 'text': TextEditor,
  // 'heading': HeadingEditor,
  // 'image': ImageEditor,
  // 'button': ButtonEditor,
  // 'divider': DividerEditor,
  // 'spacer': SpacerEditor,
  
  // Content Cards
  // 'editorial-card': EditorialCardEditor,
  
  // Navigation
  // 'menu': MenuEditor,
  
  // Interactive
  // 'tabs': TabsEditor,
  // 'collapse': CollapseEditor,
  
  // Publishing
  // 'publication-list': PublicationListEditor,
  // 'publication-details': PublicationDetailsEditor,
  
  // DIY
  // 'html': HTMLEditor,
  // 'code': CodeEditor,
}

import type React from 'react'

