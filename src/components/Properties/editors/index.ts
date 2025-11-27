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
export { TextEditor } from './TextEditor'
export { HeadingEditor } from './HeadingEditor'
export { ImageEditor } from './ImageEditor'
export { CollapseEditor } from './InteractiveEditor'
export { EditorialCardEditor } from './EditorialCardEditor'

// Export type for editor props
export interface PropertyEditorProps {
  widget: Widget
  updateWidget: (updates: Partial<Widget>) => void
}

// Import editors
import { HTMLBlockEditor, CodeBlockEditor } from './DIYEditor'
import { ButtonEditor } from './ButtonEditor'
import { DividerEditor, SpacerEditor } from './CoreElementsEditor'
import { TextEditor } from './TextEditor'
import { HeadingEditor } from './HeadingEditor'
import { ImageEditor } from './ImageEditor'
import { CollapseEditor } from './InteractiveEditor'
import { EditorialCardEditor } from './EditorialCardEditor'

// Registry maps widget types to their property editor components
export const PROPERTY_EDITORS: Record<string, React.ComponentType<PropertyEditorProps>> = {
  // Core Page Elements ✅
  'text': TextEditor,
  'heading': HeadingEditor,
  'image': ImageEditor,
  'button': ButtonEditor,
  'divider': DividerEditor,
  'spacer': SpacerEditor,
  
  // Content Cards ✅
  'editorial-card': EditorialCardEditor,
  
  // Navigation
  // 'menu': MenuEditor,  // TODO: Most complex - has inline item editor
  
  // Interactive (partial) ✅
  // 'tabs': TabsEditor,        // TODO: Complex - nested widgets
  'collapse': CollapseEditor,
  
  // Publishing
  // 'publication-list': PublicationListEditor,    // TODO: Complex - card config
  // 'publication-details': PublicationDetailsEditor,  // TODO: Complex - card config
  
  // DIY ✅
  'html': HTMLBlockEditor,
  'code': CodeBlockEditor,
}

