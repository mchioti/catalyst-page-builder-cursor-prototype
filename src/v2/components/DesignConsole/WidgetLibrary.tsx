/**
 * Widget Library - Palette of widgets that can be added to sections
 */

import { Type, Image, List, Minus, ChevronRight, Menu, Layout } from 'lucide-react'
import type { Widget } from '../../../types/widgets'
import { nanoid } from 'nanoid'

interface WidgetLibraryProps {
  onAddWidget: (widget: Widget) => void
}

const widgetTemplates = [
  {
    type: 'heading',
    icon: Type,
    label: 'Heading',
    description: 'Title or heading text',
    template: {
      id: nanoid(),
      type: 'heading',
      skin: 'minimal',
      text: 'New Heading',
      level: 2,
      align: 'left',
      style: 'default'
    }
  },
  {
    type: 'text',
    icon: ChevronRight,
    label: 'Text',
    description: 'Paragraph or body text',
    template: {
      id: nanoid(),
      type: 'text',
      skin: 'minimal',
      text: 'Add your text content here',
      align: 'left'
    }
  },
  {
    type: 'image',
    icon: Image,
    label: 'Image',
    description: 'Image with caption',
    template: {
      id: nanoid(),
      type: 'image',
      skin: 'minimal',
      src: 'https://placehold.co/600x400',
      alt: 'Image description',
      ratio: 'auto',
      alignment: 'center',
      width: 'full',
      objectFit: 'cover'
    }
  },
  {
    type: 'menu',
    icon: Menu,
    label: 'Menu',
    description: 'Navigation menu',
    template: {
      id: nanoid(),
      type: 'menu',
      skin: 'minimal',
      menuType: 'global',
      style: 'horizontal',
      align: 'left',
      items: [
        { id: nanoid(), label: 'Home', url: '#', target: '_self', displayCondition: 'always', order: 0 },
        { id: nanoid(), label: 'About', url: '#', target: '_self', displayCondition: 'always', order: 1 },
        { id: nanoid(), label: 'Contact', url: '#', target: '_self', displayCondition: 'always', order: 2 }
      ]
    }
  },
  {
    type: 'spacer',
    icon: Minus,
    label: 'Spacer',
    description: 'Vertical spacing',
    template: {
      id: nanoid(),
      type: 'spacer',
      skin: 'minimal',
      height: '2rem'
    }
  },
  {
    type: 'divider',
    icon: Layout,
    label: 'Divider',
    description: 'Horizontal line',
    template: {
      id: nanoid(),
      type: 'divider',
      skin: 'minimal',
      style: 'solid',
      thickness: '1px',
      color: '#e5e7eb',
      marginTop: '1rem',
      marginBottom: '1rem'
    }
  }
]

export function WidgetLibrary({ onAddWidget }: WidgetLibraryProps) {
  const handleAddWidget = (template: any) => {
    // Create a fresh copy with new ID
    const newWidget = {
      ...template,
      id: nanoid()
    }
    onAddWidget(newWidget)
  }
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Widget Library</h3>
        <p className="text-xs text-gray-500 mt-1">Click to add to section</p>
      </div>
      
      <div className="p-3 space-y-2">
        {widgetTemplates.map((widget) => {
          const Icon = widget.icon
          return (
            <button
              key={widget.type}
              onClick={() => handleAddWidget(widget.template)}
              className="w-full flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors text-left group"
            >
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                <Icon className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 text-sm">{widget.label}</div>
                <div className="text-xs text-gray-500 line-clamp-1">{widget.description}</div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

