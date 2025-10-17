import React from 'react'
import { Info } from 'lucide-react'
import { 
  type Widget, 
  type WidgetSection, 
  type CanvasItem, 
  type SchemaObject, 
  type SchemaOrgType,
  type HTMLWidget,
  type ImageWidget,
  type HeadingWidget,
  type PublicationListWidget,
  type PublicationDetailsWidget,
  isSection
} from '../../types'
import { generateAIContent, generateAISingleContent } from '../../utils/aiContentGeneration'

// Import the DEFAULT_PUBLICATION_CARD_CONFIG constant
const DEFAULT_PUBLICATION_CARD_CONFIG = {
  showCover: true,
  showAuthors: true,
  showAbstract: true,
  showDate: true,
  showJournal: true,
  showDOI: true,
  showTags: false,
  coverRatio: '3:4',
  textLength: 'medium'
}

interface PropertiesPanelProps {
  creatingSchemaType: SchemaOrgType | null
  selectedSchemaObject: SchemaObject | null
  onSaveSchema: (data: Omit<SchemaObject, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancelSchema: () => void
  usePageStore: any  // TODO: Type this properly when extracting store
  SchemaFormEditor?: React.ComponentType<{
    schemaType: SchemaOrgType
    initialData?: Partial<SchemaObject>
    onSave: (data: Omit<SchemaObject, 'id' | 'createdAt' | 'updatedAt'>) => void
    onCancel: () => void
  }>
}

export function PropertiesPanel({ 
  creatingSchemaType, 
  selectedSchemaObject, 
  onSaveSchema, 
  onCancelSchema, 
  usePageStore,
  SchemaFormEditor
}: PropertiesPanelProps) {
  const { canvasItems, selectedWidget, replaceCanvasItems, publicationCardVariants, schemaObjects } = usePageStore()
  
  // Show schema form if creating or editing schema
  if ((creatingSchemaType || selectedSchemaObject) && SchemaFormEditor) {
    const schemaType = creatingSchemaType || selectedSchemaObject?.type
    if (schemaType) {
      return (
        <SchemaFormEditor
          schemaType={schemaType}
          initialData={selectedSchemaObject || undefined}
          onSave={onSaveSchema}
          onCancel={onCancelSchema}
        />
      )
    }
  }
  
  if (!selectedWidget) {
    return (
      <div className="p-4">
        <div className="text-center py-12">
          <p className="text-gray-500">Select a widget or section to edit its properties</p>
        </div>
      </div>
    )
  }

  // Find selected widget/section - check both canvas items and widgets within sections
  let selectedItem: CanvasItem | Widget | undefined = canvasItems.find(
    (item: CanvasItem) => item.id === selectedWidget
  );

  // If not found at canvas level, search within section areas
  if (!selectedItem) {
    for (const canvasItem of canvasItems) {
      if (isSection(canvasItem)) {
        for (const area of canvasItem.areas) {
          const foundWidget = area.widgets.find(w => w.id === selectedWidget)
          if (foundWidget) {
            selectedItem = foundWidget
            break
          }
        }
        if (selectedItem) break
      }
    }
  }
  
  if (!selectedItem) {
    console.log('🔍 Properties Panel - Selected item not found:', { 
      selectedWidget, 
      canvasItemIds: canvasItems.map((item: CanvasItem) => item.id),
      sectionWidgetIds: canvasItems.flatMap((item: CanvasItem) => 
        isSection(item) ? item.areas.flatMap(area => area.widgets.map(w => w.id)) : []
      )
    })
    return (
      <div className="p-4">
        <div className="text-center py-12">
          <p className="text-gray-500">Selected item not found</p>
        </div>
      </div>
    )
  }
  
  console.log('🎯 Properties Panel - Found selected item:', { 
    id: selectedItem.id, 
    type: selectedItem.type,
    isSection: isSection(selectedItem)
  })

  const updateWidget = (updates: Partial<Widget>) => {
    const updatedCanvasItems = canvasItems.map((item: CanvasItem) => {
      if (isSection(item)) {
        return {
          ...item,
          areas: item.areas.map(area => ({
            ...area,
            widgets: area.widgets.map(w => 
              w.id === selectedWidget ? { ...w, ...updates } : w
            )
          }))
        }
      } else {
        return item.id === selectedWidget ? { ...item, ...updates } : item
      }
    })
    replaceCanvasItems(updatedCanvasItems)
  }

  const updateSection = (updates: Partial<WidgetSection>) => {
    const updatedCanvasItems = canvasItems.map((item: CanvasItem) => {
      if (isSection(item) && item.id === selectedWidget) {
        return { ...item, ...updates }
      }
      return item
    })
    replaceCanvasItems(updatedCanvasItems)
  }
  
  if (isSection(selectedItem)) {
    const section = selectedItem as WidgetSection
    const backgroundType = section.background?.type || 'none'
    
    return (
      <div className="p-4 space-y-4">
        <h3 className="font-semibold text-gray-900">Section Properties</h3>
        
        {/* Section Type Indicator */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Section Type</span>
            <span className="text-xs px-2 py-1 rounded-full font-medium bg-green-100 text-green-700">
              {section.name}
            </span>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Layout</label>
            <input
              type="text"
              value={section.layout}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
            />
          </div>
          
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900 border-b pb-2">Background</h4>
            
          <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Background Type</label>
              <select
                value={backgroundType}
                onChange={(e) => {
                  const newType = e.target.value as 'color' | 'image' | 'gradient' | 'none'
                  updateSection({
                    background: newType === 'none' ? undefined : {
                      type: newType,
                      ...(newType === 'color' && { color: '#ffffff' }),
                      ...(newType === 'image' && { 
                        image: { 
                          url: '', 
                          position: 'center', 
                          repeat: 'no-repeat', 
                          size: 'cover' 
                        } 
                      }),
                      ...(newType === 'gradient' && { 
                        gradient: { 
                          type: 'linear', 
                          direction: 'to right',
                          stops: [
                            { color: '#ffffff', position: '0%' },
                            { color: '#f3f4f6', position: '100%' }
                          ]
                        } 
                      })
                    }
                  })
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="none">None</option>
                <option value="color">Solid Color</option>
                <option value="image">Background Image</option>
                <option value="gradient">Gradient</option>
              </select>
            </div>
            
            {backgroundType === 'color' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={section.background?.color || '#ffffff'}
                    onChange={(e) => updateSection({
                      background: {
                        ...section.background,
                        type: 'color',
                        color: e.target.value
                      }
                    })}
                    className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                  />
            <input
              type="text"
                    value={section.background?.color || '#ffffff'}
                    onChange={(e) => updateSection({
                      background: {
                        ...section.background,
                        type: 'color',
                        color: e.target.value
                      }
                    })}
                    placeholder="#ffffff"
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm font-mono"
                  />
                </div>
              </div>
            )}
            
            {backgroundType === 'image' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                  <input
                    type="url"
                    value={section.background?.image?.url || ''}
                    onChange={(e) => updateSection({
                      background: {
                        ...section.background,
                        type: 'image',
                        image: {
                          ...section.background?.image,
                          url: e.target.value,
                          position: section.background?.image?.position || 'center',
                          repeat: section.background?.image?.repeat || 'no-repeat',
                          size: section.background?.image?.size || 'cover'
                        }
                      }
                    })}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                    <select
                      value={section.background?.image?.position || 'center'}
                      onChange={(e) => updateSection({
                        background: {
                          ...section.background,
                          type: 'image',
                          image: {
                            ...section.background?.image,
                            url: section.background?.image?.url || '',
                            position: e.target.value as any,
                            repeat: section.background?.image?.repeat || 'no-repeat',
                            size: section.background?.image?.size || 'cover'
                          }
                        }
                      })}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                    >
                      <option value="center">Center</option>
                      <option value="top">Top</option>
                      <option value="bottom">Bottom</option>
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                      <option value="cover">Cover</option>
                      <option value="contain">Contain</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                    <select
                      value={section.background?.image?.size || 'cover'}
                      onChange={(e) => updateSection({
                        background: {
                          ...section.background,
                          type: 'image',
                          image: {
                            ...section.background?.image,
                            url: section.background?.image?.url || '',
                            position: section.background?.image?.position || 'center',
                            repeat: section.background?.image?.repeat || 'no-repeat',
                            size: e.target.value
                          }
                        }
                      })}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                    >
                      <option value="cover">Cover</option>
                      <option value="contain">Contain</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Repeat</label>
                  <select
                    value={section.background?.image?.repeat || 'no-repeat'}
                    onChange={(e) => updateSection({
                      background: {
                        ...section.background,
                        type: 'image',
                        image: {
                          ...section.background?.image,
                          url: section.background?.image?.url || '',
                          position: section.background?.image?.position || 'center',
                          repeat: e.target.value as any,
                          size: section.background?.image?.size || 'cover'
                        }
                      }
                    })}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                  >
                    <option value="no-repeat">No Repeat</option>
                    <option value="repeat">Repeat</option>
                    <option value="repeat-x">Repeat X</option>
                    <option value="repeat-y">Repeat Y</option>
                  </select>
                </div>
              </div>
            )}
            
            {backgroundType !== 'none' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Background Opacity: {Math.round((section.background?.opacity || 1) * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={section.background?.opacity || 1}
                  onChange={(e) => updateSection({
                    background: {
                      ...section.background,
                      type: backgroundType as any,
                      opacity: parseFloat(e.target.value)
                    }
                  })}
                  className="w-full"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
  
  // Widget properties
  const widget = selectedItem as Widget
  
  return (
    <div className="p-4 space-y-4">
      <h3 className="font-semibold text-gray-900">Widget Properties</h3>
      
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Widget Type</span>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            (widget as any).type === 'publication-details' ? 'bg-blue-100 text-blue-700' :
            (widget as any).type === 'publication-list' ? 'bg-green-100 text-green-700' :
            (widget as any).type === 'button' ? 'bg-orange-100 text-orange-700' :
            (widget as any).type === 'text' ? 'bg-purple-100 text-purple-700' :
            (widget as any).type === 'image' ? 'bg-pink-100 text-pink-700' :
            (widget as any).type === 'navbar' ? 'bg-indigo-100 text-indigo-700' :
            (widget as any).type === 'heading' ? 'bg-yellow-100 text-yellow-700' :
            (widget as any).type === 'html' ? 'bg-red-100 text-red-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {(widget as any).type === 'publication-details' ? 'Publication Details' :
             (widget as any).type === 'publication-list' ? 'Publication List' :
             (widget as any).type === 'button' ? 'Button' :
             (widget as any).type === 'text' ? 'Text' :
             (widget as any).type === 'image' ? 'Image' :
             (widget as any).type === 'navbar' ? 'Navigation' :
             (widget as any).type === 'heading' ? 'Heading' :
             (widget as any).type === 'html' ? 'HTML Block' :
             (widget as any).type.charAt(0).toUpperCase() + (widget as any).type.slice(1)
            } Widget
          </span>
        </div>
      </div>
      
      {widget.type === 'text' && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Text</label>
            <textarea
              value={widget.text}
              onChange={(e) => updateWidget({ text: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alignment</label>
            <select
              value={widget.align || 'left'}
              onChange={(e) => updateWidget({ align: e.target.value as 'left' | 'center' | 'right' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
        </div>
      )}
      
      {widget.type === 'heading' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Heading Text</label>
            <input
              type="text"
              value={(widget as HeadingWidget).text}
              onChange={(e) => updateWidget({ text: e.target.value })}
              placeholder="Enter your heading text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Semantic Level</label>
              <select
                value={(widget as HeadingWidget).level}
                onChange={(e) => updateWidget({ level: parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5 | 6 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value={1}>H1 (Main Title)</option>
                <option value={2}>H2 (Section)</option>
                <option value={3}>H3 (Subsection)</option>
                <option value={4}>H4 (Subheading)</option>
                <option value={5}>H5 (Minor Head)</option>
                <option value={6}>H6 (Small Head)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Alignment</label>
              <select
                value={(widget as HeadingWidget).align || 'left'}
                onChange={(e) => updateWidget({ align: e.target.value as 'left' | 'center' | 'right' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Style Variant</label>
            <select
              value={(widget as HeadingWidget).style || 'default'}
              onChange={(e) => updateWidget({ style: e.target.value as HeadingWidget['style'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="default">Default</option>
              <option value="bordered-left">Bordered Left</option>
              <option value="underlined">Underlined</option>
              <option value="highlighted">Highlighted Background</option>
              <option value="decorated">Decorated</option>
              <option value="gradient">Gradient Text</option>
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Color Theme</label>
              <select
                value={(widget as HeadingWidget).color || 'default'}
                onChange={(e) => updateWidget({ color: e.target.value as HeadingWidget['color'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="default">Default</option>
                <option value="primary">Primary Blue</option>
                <option value="secondary">Secondary Green</option>
                <option value="accent">Accent Orange</option>
                <option value="muted">Muted Gray</option>
              </select>
            </div>
            
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Size Override</label>
            <select
              value={(widget as HeadingWidget).size || 'auto'}
              onChange={(e) => updateWidget({ size: e.target.value as HeadingWidget['size'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="auto">
                Auto ({
                  (widget as HeadingWidget).level === 1 ? 'Extra Large' :
                  (widget as HeadingWidget).level === 2 ? 'Large' :
                  (widget as HeadingWidget).level === 3 ? 'Medium' :
                  'Small'
                })
              </option>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
              <option value="xl">Extra Large</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Auto uses semantic defaults: H1=XL, H2=Large, H3=Medium, H4-H6=Small
            </p>
          </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Font Styling</label>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={(widget as HeadingWidget).fontStyle?.bold ?? false}
                  onChange={(e) => updateWidget({ 
                    fontStyle: { 
                      ...((widget as HeadingWidget).fontStyle || {}), 
                      bold: e.target.checked 
                    }
                  })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm font-bold">Bold</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={(widget as HeadingWidget).fontStyle?.italic ?? false}
                  onChange={(e) => updateWidget({ 
                    fontStyle: { 
                      ...((widget as HeadingWidget).fontStyle || {}), 
                      italic: e.target.checked 
                    }
                  })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm italic">Italic</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={(widget as HeadingWidget).fontStyle?.underline ?? false}
                  onChange={(e) => updateWidget({ 
                    fontStyle: { 
                      ...((widget as HeadingWidget).fontStyle || {}), 
                      underline: e.target.checked 
                    }
                  })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm underline">Underline</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={(widget as HeadingWidget).fontStyle?.strikethrough ?? false}
                  onChange={(e) => updateWidget({ 
                    fontStyle: { 
                      ...((widget as HeadingWidget).fontStyle || {}), 
                      strikethrough: e.target.checked 
                    }
                  })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm line-through">Strikethrough</span>
              </label>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">Icon</label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={(widget as HeadingWidget).icon?.enabled ?? false}
                  onChange={(e) => updateWidget({ 
                    icon: { 
                      ...((widget as HeadingWidget).icon || {}), 
                      enabled: e.target.checked 
                    }
                  })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Enable Icon</span>
              </label>
            </div>
            
            {(widget as HeadingWidget).icon?.enabled && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Icon Emoji</label>
                  <input
                    type="text"
                    value={(widget as HeadingWidget).icon?.emoji || '🎯'}
                    onChange={(e) => updateWidget({ 
                      icon: { 
                        ...((widget as HeadingWidget).icon || {}), 
                        emoji: e.target.value 
                      }
                    })}
                    placeholder="🎯"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-center"
                    maxLength={2}
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter any emoji</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                  <select
                    value={(widget as HeadingWidget).icon?.position || 'left'}
                    onChange={(e) => updateWidget({ 
                      icon: { 
                        ...((widget as HeadingWidget).icon || {}), 
                        position: e.target.value as 'left' | 'right' 
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                  </select>
                </div>
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Spacing</label>
            <select
              value={(widget as HeadingWidget).spacing || 'normal'}
              onChange={(e) => updateWidget({ spacing: e.target.value as HeadingWidget['spacing'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="tight">Tight</option>
              <option value="normal">Normal</option>
              <option value="loose">Loose</option>
            </select>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Heading Best Practices</p>
              <ul className="text-xs space-y-1">
                <li>• Use semantic levels (H1→H2→H3) for proper structure</li>
                <li>• Auto sizing creates visual hierarchy: H1=XL, H2=Large, etc.</li>
                <li>• Keep headings concise and descriptive</li>
                <li>• Override size only when needed for design consistency</li>
                <li>• Consider accessibility when choosing colors</li>
              </ul>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {widget.type === 'image' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Image Source URL</label>
            <input
              type="url"
              value={(widget as ImageWidget).src}
              onChange={(e) => updateWidget({ src: e.target.value })}
              placeholder="https://example.com/image.jpg"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Alt Text</label>
            <input
              type="text"
              value={(widget as ImageWidget).alt}
              onChange={(e) => updateWidget({ alt: e.target.value })}
              placeholder="Descriptive text for accessibility"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Caption (Optional)</label>
            <input
              type="text"
              value={(widget as ImageWidget).caption || ''}
              onChange={(e) => updateWidget({ caption: e.target.value })}
              placeholder="Image caption or description"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Link URL (Optional)</label>
            <input
              type="url"
              value={(widget as ImageWidget).link || ''}
              onChange={(e) => updateWidget({ link: e.target.value })}
              placeholder="https://example.com (make image clickable)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Aspect Ratio</label>
              <select
                value={(widget as ImageWidget).ratio || 'auto'}
                onChange={(e) => updateWidget({ ratio: e.target.value as ImageWidget['ratio'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="auto">Auto</option>
                <option value="1:1">Square (1:1)</option>
                <option value="4:3">Landscape (4:3)</option>
                <option value="3:4">Portrait (3:4)</option>
                <option value="16:9">Widescreen (16:9)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Alignment</label>
              <select
                value={(widget as ImageWidget).alignment || 'center'}
                onChange={(e) => updateWidget({ alignment: e.target.value as ImageWidget['alignment'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Width</label>
              <select
                value={(widget as ImageWidget).width || 'full'}
                onChange={(e) => updateWidget({ width: e.target.value as ImageWidget['width'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="auto">Auto</option>
                <option value="small">Small (25%)</option>
                <option value="medium">Medium (50%)</option>
                <option value="large">Large (75%)</option>
                <option value="full">Full Width</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Object Fit</label>
              <select
                value={(widget as ImageWidget).objectFit || 'cover'}
                onChange={(e) => updateWidget({ objectFit: e.target.value as ImageWidget['objectFit'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="cover">Cover</option>
                <option value="contain">Contain</option>
                <option value="fill">Fill</option>
                <option value="scale-down">Scale Down</option>
                <option value="none">None</option>
              </select>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Image Best Practices</p>
                <ul className="text-xs space-y-1">
                  <li>• Use descriptive alt text for accessibility</li>
                  <li>• Optimize images for web (WebP, JPEG, PNG)</li>
                  <li>• Consider loading performance for large images</li>
                  <li>• Use appropriate aspect ratios for your design</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {widget.type === 'html' && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">HTML Content</label>
            <textarea
              value={(widget as HTMLWidget).htmlContent}
              onChange={(e) => updateWidget({ htmlContent: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm resize-none"
              rows={6}
              placeholder="Enter your HTML code here..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload HTML File</label>
            <input
              type="file"
              accept=".html,.htm"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  const reader = new FileReader()
                  reader.onload = (e) => {
                    const content = e.target?.result as string
                    updateWidget({ htmlContent: content })
                  }
                  reader.readAsText(file)
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          {(widget as HTMLWidget).htmlContent && (
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center gap-2 mb-3">
                <h4 className="font-medium text-gray-700">Widget Promotion</h4>
                <div className="relative group">
                  <Info className="w-4 h-4 text-gray-400 cursor-help" />
                  <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 max-w-64 leading-relaxed">
                    Share your creation with the community or suggest it for the platform library
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <button className="w-full px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors">
                  Suggest for Library
                </button>
                <button className="w-full px-3 py-2 bg-orange-600 text-white text-sm font-medium rounded-md hover:bg-orange-700 transition-colors">
                  Promote to Wiley
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {widget.type === 'publication-list' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Content Source</label>
            <select
              value={(widget as PublicationListWidget).contentSource}
              onChange={(e) => {
                const newContentSource = e.target.value as 'dynamic-query' | 'doi-list' | 'ai-generated' | 'schema-objects'
                updateWidget({ 
                  contentSource: newContentSource,
                  // Reset source-specific config when changing content source
                  ...(newContentSource !== 'schema-objects' ? { schemaSource: undefined } : {
                    schemaSource: {
                      selectionType: 'by-type',
                      selectedType: '',
                      selectedIds: []
                    }
                  }),
                  ...(newContentSource !== 'ai-generated' ? { aiSource: undefined } : {
                    aiSource: {
                      prompt: '',
                      lastGenerated: undefined,
                      generatedContent: undefined
                    }
                  })
                })
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="dynamic-query">Dynamic Query</option>
              <option value="doi-list">DOI List</option>
              <option value="ai-generated">AI Generated</option>
              <option value="schema-objects">Schema Objects</option>
            </select>
          </div>
          
          {(widget as PublicationListWidget).contentSource === 'schema-objects' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Selection Method</label>
                <select
                  value={(widget as PublicationListWidget).schemaSource?.selectionType || 'by-type'}
                  onChange={(e) => {
                    const selectionType = e.target.value as 'by-id' | 'by-type'
                    updateWidget({ 
                      schemaSource: {
                        selectionType,
                        selectedIds: [],
                        selectedType: ''
                      }
                    })
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="by-type">By Type (All objects of a type)</option>
                  <option value="by-id">By ID (Specific objects)</option>
                </select>
              </div>

              {(widget as PublicationListWidget).schemaSource?.selectionType === 'by-type' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Schema Type</label>
                  <select
                    value={(widget as PublicationListWidget).schemaSource?.selectedType || ''}
                    onChange={(e) => {
                      const currentSchemaSource = (widget as PublicationListWidget).schemaSource
                      updateWidget({ 
                        schemaSource: {
                          selectionType: currentSchemaSource?.selectionType || 'by-type',
                          selectedType: e.target.value,
                          selectedIds: currentSchemaSource?.selectedIds || []
                        }
                      })
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">-- Select type --</option>
                    <option value="Article">Articles</option>
                    <option value="BlogPosting">Blog Posts</option>
                    <option value="NewsArticle">News Articles</option>
                    <option value="Event">Events</option>
                    <option value="Organization">Organizations</option>
                    <option value="Person">People</option>
                    <option value="Book">Books</option>
                    <option value="Movie">Movies</option>
                    <option value="Review">Reviews</option>
                    <option value="Course">Courses</option>
                    <option value="Recipe">Recipes</option>
                    <option value="HowTo">How-To Guides</option>
                  </select>
                  
                  {(widget as PublicationListWidget).schemaSource?.selectedType && (
                    <p className="text-xs text-gray-500 mt-1">
                      Will show all {schemaObjects.filter((obj: any) => 
                        obj.type === (widget as PublicationListWidget).schemaSource?.selectedType
                      ).length} objects of type "{(widget as PublicationListWidget).schemaSource?.selectedType}"
                    </p>
                  )}
                </div>
              )}

              {(widget as PublicationListWidget).schemaSource?.selectionType === 'by-id' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Objects</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-2">
                    {schemaObjects.length === 0 ? (
                      <p className="text-sm text-gray-500 p-2">No schema objects created yet</p>
                    ) : (
                      schemaObjects.map((obj: any) => (
                        <label key={obj.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                          <input
                            type="checkbox"
                            checked={(widget as PublicationListWidget).schemaSource?.selectedIds?.includes(obj.id) || false}
                            onChange={(e) => {
                              const currentIds = (widget as PublicationListWidget).schemaSource?.selectedIds || []
                              const newIds = e.target.checked
                                ? [...currentIds, obj.id]
                                : currentIds.filter(id => id !== obj.id)
                              const currentSchemaSource = (widget as PublicationListWidget).schemaSource
                              updateWidget({ 
                                schemaSource: {
                                  selectionType: currentSchemaSource?.selectionType || 'by-id',
                                  selectedType: currentSchemaSource?.selectedType || '',
                                  selectedIds: newIds
                                }
                              })
                            }}
                            className="rounded border-gray-300"
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium">{obj.name}</div>
                            <div className="text-xs text-gray-500">{obj.type}</div>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {(widget as PublicationListWidget).schemaSource?.selectedIds?.length || 0} objects selected
                  </p>
                </div>
              )}
            </>
          )}
          
          {(widget as PublicationListWidget).contentSource === 'ai-generated' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">AI Prompt</label>
              <textarea
                value={(widget as PublicationListWidget).aiSource?.prompt || ''}
                onChange={(e) => updateWidget({ 
                  aiSource: { 
                    ...(widget as PublicationListWidget).aiSource,
                    prompt: e.target.value
                  }
                })}
                placeholder="e.g., generate 6 articles on Organic chemistry with variable length titles written by 1, 2 up to 6 authors"
                className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
                rows={3}
              />
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => {
                    const prompt = (widget as PublicationListWidget).aiSource?.prompt
                    if (prompt) {
                      try {
                        const generatedContent = generateAIContent(prompt)
                        updateWidget({
                          aiSource: {
                            prompt,
                            lastGenerated: new Date(),
                            generatedContent
                          }
                        })
                      } catch (error) {
                        console.error('Error generating content:', error)
                      }
                    }
                  }}
                  disabled={!(widget as PublicationListWidget).aiSource?.prompt?.trim()}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  🤖 Generate
                </button>
                {(widget as PublicationListWidget).aiSource?.lastGenerated && (
                  <span className="text-xs text-gray-500 self-center">
                    Last generated: {(widget as PublicationListWidget).aiSource?.lastGenerated?.toLocaleTimeString()}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Tip: Use "generate X articles", "variable length titles", and "written by 1, 2 up to X authors" for progressive authorship
              </p>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Layout</label>
            <select
              value={(widget as PublicationListWidget).layout}
              onChange={(e) => updateWidget({ 
                layout: e.target.value as 'list' | 'grid' | 'featured' 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="list">List</option>
              <option value="grid">Grid</option>
              <option value="featured">Featured</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Items: {(widget as PublicationListWidget).maxItems || 6}
            </label>
            <input
              type="range"
              min="1"
              max="20"
              value={(widget as PublicationListWidget).maxItems || 6}
              onChange={(e) => updateWidget({ maxItems: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Publication Card Variant</label>
            <select
              value={(widget as PublicationListWidget).cardVariantId || 'default'}
              onChange={(e) => {
                const variantId = e.target.value === 'default' ? undefined : e.target.value
                const selectedVariant = publicationCardVariants.find((v: any) => v.id === variantId)
                const cardConfig = selectedVariant ? selectedVariant.config : DEFAULT_PUBLICATION_CARD_CONFIG
                updateWidget({ 
                  cardVariantId: variantId,
                  cardConfig: cardConfig
                })
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
            >
              <option value="default">Default</option>
              {publicationCardVariants.map((variant: any) => (
                <option key={variant.id} value={variant.id}>{variant.name}</option>
              ))}
            </select>
            <button 
              onClick={() => {
                const { setCurrentView, setSiteManagerView, currentWebsiteId } = usePageStore.getState()
                setCurrentView('design-console')
                // Navigate to the specific website's publication cards based on current editing context
                setSiteManagerView(`${currentWebsiteId}-publication-cards` as any)
              }}
              className="w-full px-3 py-2 border border-blue-300 text-blue-700 rounded-md text-sm hover:bg-blue-50 transition-colors"
            >
              → Configure Publication Cards
            </button>
          </div>
        </div>
      )}
      
      {widget.type === 'publication-details' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Content Source</label>
            <select
              value={(widget as PublicationDetailsWidget).contentSource}
              onChange={(e) => {
                const newContentSource = e.target.value as 'doi' | 'ai-generated' | 'schema-objects' | 'context'
                updateWidget({ 
                  contentSource: newContentSource,
                  // Reset source-specific config when changing content source
                  ...(newContentSource !== 'schema-objects' ? { schemaSource: undefined } : {
                    schemaSource: { selectedId: '' }
                  }),
                  ...(newContentSource !== 'doi' ? { doiSource: undefined } : {
                    doiSource: { doi: '' }
                  }),
                  ...(newContentSource !== 'ai-generated' ? { aiSource: undefined } : {
                    aiSource: {
                      prompt: '',
                      lastGenerated: undefined,
                      generatedContent: undefined
                    }
                  })
                })
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="context">Page Context</option>
              <option value="doi">DOI</option>
              <option value="ai-generated">AI Generated</option>
              <option value="schema-objects">Schema Objects</option>
            </select>
          </div>
          
          {(widget as PublicationDetailsWidget).contentSource === 'doi' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">DOI</label>
              <input
                type="text"
                value={(widget as PublicationDetailsWidget).doiSource?.doi || ''}
                onChange={(e) => updateWidget({ 
                  doiSource: { doi: e.target.value }
                })}
                placeholder="10.1145/3695868"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <p className="text-xs text-gray-500 mt-1">Enter the DOI to fetch publication details</p>
            </div>
          )}
          
          {/* Schema Objects Selection (conditional) */}
          {(widget as PublicationDetailsWidget).contentSource === 'schema-objects' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Publication</label>
              <select
                value={(widget as PublicationDetailsWidget).schemaSource?.selectedId || ''}
                onChange={(e) => updateWidget({ 
                  schemaSource: { selectedId: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">-- Select publication --</option>
                {schemaObjects.map((obj: any) => (
                  <option key={obj.id} value={obj.id}>
                    {obj.name} ({obj.type})
                  </option>
                ))}
              </select>
              
              {(widget as PublicationDetailsWidget).schemaSource?.selectedId && (
                <p className="text-xs text-gray-500 mt-1">
                  Selected: {schemaObjects.find((obj: any) => 
                    obj.id === (widget as PublicationDetailsWidget).schemaSource?.selectedId
                  )?.name}
                </p>
              )}
              
              {schemaObjects.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">No schema objects available. Create some in the Schema Content tab.</p>
              )}
            </div>
          )}
          
          {/* AI Generation Prompt (conditional) */}
          {(widget as PublicationDetailsWidget).contentSource === 'ai-generated' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">AI Prompt</label>
              <textarea
                value={(widget as PublicationDetailsWidget).aiSource?.prompt || ''}
                onChange={(e) => updateWidget({ 
                  aiSource: { 
                    ...(widget as PublicationDetailsWidget).aiSource,
                    prompt: e.target.value
                  }
                })}
                placeholder="e.g., generate an article on quantum computing with a long title by 3 Stanford researchers"
                className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
                rows={3}
              />
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => {
                    const prompt = (widget as PublicationDetailsWidget).aiSource?.prompt
                    if (prompt) {
                      try {
                        const generatedContent = generateAISingleContent(prompt)
                        updateWidget({
                          aiSource: {
                            prompt,
                            lastGenerated: new Date(),
                            generatedContent
                          }
                        })
                      } catch (error) {
                        console.error('Error generating content:', error)
                      }
                    }
                  }}
                  disabled={!(widget as PublicationDetailsWidget).aiSource?.prompt?.trim()}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  🤖 Generate
                </button>
                {(widget as PublicationDetailsWidget).aiSource?.lastGenerated && (
                  <span className="text-xs text-gray-500 self-center">
                    Last generated: {(widget as PublicationDetailsWidget).aiSource?.lastGenerated?.toLocaleTimeString()}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Tip: Specify subject, title length ("long title"), and exact author count ("by 3 researchers") for better results
              </p>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Layout</label>
            <select
              value={(widget as PublicationDetailsWidget).layout}
              onChange={(e) => updateWidget({ 
                layout: e.target.value as 'default' | 'compact' | 'hero' | 'sidebar'
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="default">Default</option>
              <option value="compact">Compact</option>
              <option value="hero">Hero</option>
              <option value="sidebar">Sidebar</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Publication Card Variant</label>
            <select
              value={(widget as PublicationDetailsWidget).cardVariantId || 'default'}
              onChange={(e) => {
                const variantId = e.target.value === 'default' ? undefined : e.target.value
                const selectedVariant = publicationCardVariants.find((v: any) => v.id === variantId)
                const cardConfig = selectedVariant ? selectedVariant.config : DEFAULT_PUBLICATION_CARD_CONFIG
                updateWidget({ 
                  cardVariantId: variantId,
                  cardConfig: cardConfig
                })
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
            >
              <option value="default">Default</option>
              {publicationCardVariants.map((variant: any) => (
                <option key={variant.id} value={variant.id}>{variant.name}</option>
              ))}
            </select>
            <button 
              onClick={() => {
                const { setCurrentView, setSiteManagerView, currentWebsiteId } = usePageStore.getState()
                setCurrentView('design-console')
                setSiteManagerView(`${currentWebsiteId}-publication-cards` as any)
              }}
              className="w-full px-3 py-2 border border-blue-300 text-blue-700 rounded-md text-sm hover:bg-blue-50 transition-colors"
            >
              → Configure Publication Cards
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
