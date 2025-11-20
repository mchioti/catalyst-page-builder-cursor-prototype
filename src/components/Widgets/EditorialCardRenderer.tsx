import React from 'react'
import type { EditorialCardWidget } from '../../types/widgets'

interface EditorialCardRendererProps {
  widget: EditorialCardWidget
  isEditMode?: boolean
}

export const EditorialCardRenderer: React.FC<EditorialCardRendererProps> = ({ widget, isEditMode = false }) => {
  const { layout, content, image, config } = widget
  
  // Determine text color based on layout
  const isDarkOverlay = layout === 'image-overlay'
  const isDarkColorBlock = layout === 'color-block' && config.useAccentColor
  const textColorClass = (isDarkOverlay || isDarkColorBlock) ? 'text-white' : 'text-gray-900'
  const metaColorClass = (isDarkOverlay || isDarkColorBlock) ? 'text-white/90' : 'text-gray-600'
  
  // Alignment classes
  const alignmentMap = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end'
  }
  const alignmentClasses = alignmentMap[config.contentAlignment] || alignmentMap.left
  
  // Image position for split/color-block
  const imagePosition = config.imagePosition || 'top'
  
  // Render content slots
  const renderContent = () => (
    <div className={`flex flex-col gap-4 ${alignmentClasses}`}>
      {content.preheader.enabled && content.preheader.text && (
        <div className={`text-xs font-semibold uppercase tracking-wider ${metaColorClass}`}>
          {content.preheader.text}
        </div>
      )}
      
      {content.headline.enabled && content.headline.text && (
        <h2 className={`text-3xl font-bold leading-tight ${textColorClass}`}>
          {content.headline.text}
        </h2>
      )}
      
      {content.description.enabled && content.description.text && (
        <p className={`text-base leading-relaxed ${metaColorClass}`}>
          {content.description.text}
        </p>
      )}
      
      {content.callToAction.enabled && content.callToAction.text && (
        <div className="mt-2">
          {content.callToAction.type === 'button' ? (
            <button className={`btn btn-solid-color1 ${isDarkOverlay || isDarkColorBlock ? 'on-dark-bg' : 'on-light-bg'}`}>
              {content.callToAction.text}
            </button>
          ) : (
            <a 
              href={content.callToAction.url || '#'} 
              className={`inline-flex items-center gap-2 font-medium hover:underline ${textColorClass}`}
            >
              {content.callToAction.text}
              <span>→</span>
            </a>
          )}
        </div>
      )}
    </div>
  )
  
  // Render image
  const renderImage = () => {
    if (!image.src) return null
    
    return (
      <img 
        src={image.src} 
        alt={image.alt || ''}
        className="w-full h-full object-cover"
        style={{ 
          minHeight: layout === 'image-overlay' ? '400px' : '200px',
          maxHeight: layout === 'image-overlay' ? '600px' : '400px'
        }}
      />
    )
  }
  
  // Layout: Image Overlay
  if (layout === 'image-overlay') {
    const overlayOpacity = config.overlayOpacity !== undefined ? config.overlayOpacity : 60
    
    return (
      <div className="editorial-card editorial-card-overlay relative overflow-hidden rounded-lg">
        {/* Background Image */}
        <div className="absolute inset-0">
          {renderImage()}
        </div>
        
        {/* Dark Overlay */}
        <div 
          className="absolute inset-0 bg-black" 
          style={{ opacity: overlayOpacity / 100 }}
        />
        
        {/* Content on top */}
        <div className="relative z-10 p-8 md:p-12 flex items-center min-h-[400px]">
          <div className="max-w-2xl">
            {renderContent()}
          </div>
        </div>
      </div>
    )
  }
  
  // Layout: Split
  if (layout === 'split') {
    const isVertical = imagePosition === 'top' || imagePosition === 'bottom'
    
    return (
      <div className={`editorial-card editorial-card-split overflow-hidden rounded-lg border border-gray-200 bg-white ${
        isVertical ? 'flex flex-col' : 'flex flex-row'
      }`}>
        {/* Image */}
        {(imagePosition === 'top' || imagePosition === 'left') && (
          <div className={isVertical ? 'w-full' : 'w-1/2'}>
            {renderImage()}
          </div>
        )}
        
        {/* Content */}
        <div className={`p-8 ${isVertical ? 'w-full' : 'w-1/2'} flex items-center`}>
          <div className="w-full">
            {renderContent()}
          </div>
        </div>
        
        {/* Image */}
        {(imagePosition === 'bottom' || imagePosition === 'right') && (
          <div className={isVertical ? 'w-full' : 'w-1/2'}>
            {renderImage()}
          </div>
        )}
      </div>
    )
  }
  
  // Layout: Color Block
  if (layout === 'color-block') {
    const isHorizontal = imagePosition === 'left' || imagePosition === 'right'
    const bgClass = config.useAccentColor ? 'editorial-card-accent-bg' : 'bg-gray-100'
    
    return (
      <div className={`editorial-card editorial-card-color-block overflow-hidden rounded-lg ${
        isHorizontal ? 'flex flex-row' : 'flex flex-col'
      }`}>
        {/* Image */}
        {(imagePosition === 'top' || imagePosition === 'left') && (
          <div className={isHorizontal ? 'w-1/2' : 'w-full'}>
            {renderImage()}
          </div>
        )}
        
        {/* Content with colored background */}
        <div className={`${bgClass} p-8 ${isHorizontal ? 'w-1/2' : 'w-full'} flex items-center`}>
          <div className="w-full">
            {renderContent()}
          </div>
        </div>
        
        {/* Image */}
        {(imagePosition === 'bottom' || imagePosition === 'right') && (
          <div className={isHorizontal ? 'w-1/2' : 'w-full'}>
            {renderImage()}
          </div>
        )}
      </div>
    )
  }
  
  return null
}

