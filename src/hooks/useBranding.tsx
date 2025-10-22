import { useEffect, useRef } from 'react';
import { useBrandingStore } from '../stores/brandingStore';
import { BrandingEngine } from '../utils/brandingEngine';
import type { ContentBranding } from '../types/branding';

/**
 * React hook for applying branding to components and DOM elements
 */
export const useBranding = (websiteId: string, content: ContentBranding) => {
  const getWebsiteBranding = useBrandingStore((state) => state.getWebsiteBranding);
  const resolveBranding = useBrandingStore((state) => state.resolveBranding);
  const generateCSSVariables = useBrandingStore((state) => state.generateCSSVariables);
  
  const engineRef = useRef<BrandingEngine>();
  const websiteBranding = getWebsiteBranding(websiteId);
  
  // Initialize branding engine
  if (!engineRef.current && websiteBranding) {
    engineRef.current = new BrandingEngine(websiteBranding);
  }
  
  // Update engine when branding system changes
  useEffect(() => {
    if (engineRef.current && websiteBranding) {
      engineRef.current.updateBrandingSystem(websiteBranding);
    }
  }, [websiteBranding]);
  
  const resolved = websiteBranding ? resolveBranding(websiteId, content) : null;
  const cssVariables = resolved ? generateCSSVariables(resolved) : {};
  
  return {
    resolved,
    cssVariables,
    cssClasses: resolved?.cssClasses || [],
    engine: engineRef.current,
    
    // Utility functions
    applyToElement: (element: HTMLElement) => {
      if (engineRef.current) {
        engineRef.current.applyBrandingToElement(element, content);
      }
    },
    
    removeFromElement: (element: HTMLElement) => {
      if (engineRef.current) {
        engineRef.current.removeBrandingFromElement(element);
      }
    },
    
    // CSS-in-JS style object
    getInlineStyles: () => cssVariables,
    
    // Get preview HTML
    getPreview: () => {
      if (engineRef.current) {
        return engineRef.current.getBrandingPreview(content);
      }
      return null;
    }
  };
};

/**
 * React component wrapper that automatically applies branding
 */
interface BrandedWrapperProps {
  websiteId: string;
  content: ContentBranding;
  children: React.ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export const BrandedWrapper: React.FC<BrandedWrapperProps> = ({
  websiteId,
  content,
  children,
  className = '',
  as: Component = 'div'
}) => {
  const { cssClasses, cssVariables } = useBranding(websiteId, content);
  
  const combinedClassName = [
    ...cssClasses,
    className
  ].filter(Boolean).join(' ');
  
  return (
    <Component 
      className={combinedClassName}
      style={cssVariables}
    >
      {children}
    </Component>
  );
};
