/**
 * Property Editors Registry
 * 
 * Maps widget types to their property editor components.
 * Editors are organized by library categories.
 */

import type React from 'react'
import type { Widget } from '../../../types'

// Export individual editors
export { DIYEditor, HTMLBlockEditor, CodeBlockEditor } from './DIYEditor'
export { ButtonEditor } from './ButtonEditor'
export { DividerEditor, SpacerEditor } from './CoreElementsEditor'

// Export type for editor props
export interface PropertyEditorProps {
  widget: Widget
  updateWidget: (updates: Partial<Widget>) => void
}

// Import editors
import { HTMLBlockEditor, CodeBlockEditor } from './DIYEditor'
import { ButtonEditor } from './ButtonEditor'
import { DividerEditor, SpacerEditor } from './CoreElementsEditor'

// Registry maps widget types to their property editor components
export const PROPERTY_EDITORS: Record<string, React.ComponentType<PropertyEditorProps>> = {
  // Core Page Elements ✅
  // 'text': TextEditor,        // TODO: Complex, has rich text features
  // 'heading': HeadingEditor,  // TODO: Complex, has level/alignment
  // 'image': ImageEditor,      // TODO: Complex, has upload/cropping
  'button': ButtonEditor,
  'divider': DividerEditor,
  'spacer': SpacerEditor,
  
  // Content Cards
  // 'editorial-card': EditorialCardEditor,  // TODO: Complex
  
  // Navigation
  // 'menu': MenuEditor,  // TODO: Most complex - has inline item editor
  
  // Interactive
  // 'tabs': TabsEditor,        // TODO: Complex - nested widgets
  // 'collapse': CollapseEditor,  // TODO: Complex - nested panels
  
  // Publishing
  // 'publication-list': PublicationListEditor,    // TODO: Complex - card config
  // 'publication-details': PublicationDetailsEditor,  // TODO: Complex - card config
  
  // DIY ✅
  'html': HTMLBlockEditor,
  'code': CodeBlockEditor,
}

