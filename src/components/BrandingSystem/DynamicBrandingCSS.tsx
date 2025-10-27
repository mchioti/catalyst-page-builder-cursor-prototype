import React, { useEffect } from 'react';
import { useBrandingStore } from '../../stores/brandingStore';

/**
 * Dynamic Branding CSS Component
 * Injects CSS custom properties from the branding store into the document
 * This ensures branding system changes are reflected in the UI immediately
 */
export const DynamicBrandingCSS: React.FC<{ websiteId: string }> = ({ websiteId }) => {
  const { getWebsiteBranding, initializeWebsiteBranding, branding } = useBrandingStore();

  // Subscribe to branding store changes to trigger re-renders
  const websiteBranding = branding.websites[websiteId];

  useEffect(() => {
    console.log('🎨 DynamicBrandingCSS effect triggered:', { websiteId, websiteBranding: !!websiteBranding });
    
    // Initialize website branding if it doesn't exist
    if (!websiteBranding) {
      console.log('🏗️ Initializing branding for website:', websiteId);
      initializeWebsiteBranding(websiteId);
      return;
    }

    console.log('🎨 Updating dynamic branding CSS for website:', websiteId);
    console.log('📋 Current journals:', websiteBranding.journals.map(j => ({ slug: j.slug, primary: j.colors.primary })));
    if (!websiteBranding) return;

    // Remove existing dynamic branding styles
    const existingStyle = document.getElementById('dynamic-branding-css');
    if (existingStyle) {
      existingStyle.remove();
    }

    // Generate CSS for all journals
    const cssRules: string[] = [];

    websiteBranding.journals.forEach(journal => {
      cssRules.push(`
        .journal-${journal.slug} {
          --journal-primary: ${journal.colors.primary};
          --journal-primary-dark: ${journal.colors.accent};
          --journal-primary-light: ${journal.colors.secondary};
          --journal-secondary: ${journal.colors.secondary};
          --journal-secondary-dark: ${journal.colors.accent};
          --journal-accent: ${journal.colors.secondary};
          --journal-text: ${journal.colors.text};
          --journal-text-dark: ${journal.colors.background === '#ffffff' ? '#1f2937' : journal.colors.text};
          --journal-hover: ${journal.colors.accent};
        }
      `);
    });

    // Generate CSS for subjects (if they override journals)
    websiteBranding.subjects.forEach(subject => {
      cssRules.push(`
        .subject-${subject.slug} {
          --journal-primary: ${subject.colors.primary};
          --journal-primary-dark: ${subject.colors.accent};
          --journal-primary-light: ${subject.colors.secondary};
          --journal-secondary: ${subject.colors.secondary};
          --journal-secondary-dark: ${subject.colors.accent};
          --journal-accent: ${subject.colors.secondary};
          --journal-text: ${subject.colors.text};
          --journal-text-dark: ${subject.colors.background === '#ffffff' ? '#1f2937' : subject.colors.text};
          --journal-hover: ${subject.colors.accent};
        }
      `);
    });

    // Create and inject the style element
    const styleElement = document.createElement('style');
    styleElement.id = 'dynamic-branding-css';
    styleElement.textContent = cssRules.join('\n');
    document.head.appendChild(styleElement);

    console.log('🎨 Dynamic branding CSS injected for website:', websiteId);
    console.log('📝 Generated CSS:', cssRules.join('\n'));
  }, [websiteId, websiteBranding, initializeWebsiteBranding]);

  return null; // This component doesn't render anything
};

export default DynamicBrandingCSS;
