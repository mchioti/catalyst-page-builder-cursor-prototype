import React, { useEffect } from 'react';
import { useBrandingStore } from '../../stores/brandingStore';
import { createDebugLogger } from '../../utils/logger';
import type { PageStore } from '../../types';

// 🐛 DEBUG FLAG - Set to true to enable detailed branding CSS logs
const DEBUG_BRANDING_CSS = false;
const debugLog = createDebugLogger(DEBUG_BRANDING_CSS);

/**
 * Dynamic Branding CSS Component
 * Injects CSS custom properties from the branding store into the document
 * This ensures branding system changes are reflected in the UI immediately
 * 
 * Now also inherits typography and button styling from the website's theme
 */
export const DynamicBrandingCSS: React.FC<{ 
  websiteId: string
  usePageStore: PageStore 
}> = ({ websiteId, usePageStore }) => {
  const { getWebsiteBranding, initializeWebsiteBranding, branding } = useBrandingStore();

  // Subscribe to branding store changes to trigger re-renders
  const websiteBranding = branding.websites[websiteId];

  useEffect(() => {
    debugLog('log', '🎨 DynamicBrandingCSS effect triggered:', { websiteId, websiteBranding: !!websiteBranding });
    
    // Initialize website branding if it doesn't exist
    if (!websiteBranding) {
      debugLog('log', '🏗️ Initializing branding for website:', websiteId);
      initializeWebsiteBranding(websiteId);
      return;
    }

    debugLog('log', '🎨 Updating dynamic branding CSS for website:', websiteId);
    debugLog('log', '📋 Current journals:', websiteBranding.journals.map(j => ({ slug: j.slug, primary: j.colors.primary })));
    if (!websiteBranding) return;

    // Remove existing dynamic branding styles
    const existingStyle = document.getElementById('dynamic-branding-css');
    if (existingStyle) {
      existingStyle.remove();
    }

    // Generate CSS for all journals
    // Journals inherit typography and button styling from theme, but keep their own colors
    const cssRules: string[] = [];

    websiteBranding.journals.forEach(journal => {
      cssRules.push(`
        .journal-${journal.slug} {
          /* Journal-specific colors (can be overridden, fallback to theme) */
          --journal-primary: ${journal.colors.primary};
          --journal-primary-dark: ${journal.colors.accent};
          --journal-primary-light: ${journal.colors.secondary};
          --journal-secondary: ${journal.colors.secondary};
          --journal-secondary-dark: ${journal.colors.accent};
          --journal-accent: ${journal.colors.secondary};
          --journal-text: ${journal.colors.text};
          --journal-text-dark: ${journal.colors.background === '#ffffff' ? '#1f2937' : journal.colors.text};
          --journal-hover: ${journal.colors.accent};
          
          /* Typography inherited from theme */
          --journal-font-family-heading: var(--theme-heading-font);
          --journal-font-family-body: var(--theme-body-font);
          --journal-letter-spacing-heading: var(--foundation-letter-spacing-heading, 0);
          --journal-letter-spacing-body: var(--foundation-letter-spacing-body, 0);
          --journal-font-weight-heading: var(--foundation-font-weight-bold, 700);
          --journal-font-weight-body: var(--foundation-font-weight-regular, 400);
          
          /* Button styling inherited from theme (sizing, spacing, radius) */
          --journal-button-font-family: var(--foundation-button-font-family);
          --journal-button-font-weight: var(--foundation-button-font-weight);
          --journal-button-font-size-small: var(--foundation-button-font-size-small);
          --journal-button-font-size-medium: var(--foundation-button-font-size-medium);
          --journal-button-font-size-large: var(--foundation-button-font-size-large);
          --journal-button-letter-spacing: var(--foundation-button-letter-spacing);
          --journal-button-text-transform: var(--foundation-button-text-transform);
          --journal-button-padding-small: var(--foundation-button-padding-small);
          --journal-button-padding-medium: var(--foundation-button-padding-medium);
          --journal-button-padding-large: var(--foundation-button-padding-large);
          --journal-button-radius-small: var(--foundation-button-radius-small, 0.25rem);
          --journal-button-radius-medium: var(--foundation-button-radius-medium, 0.375rem);
          --journal-button-radius-large: var(--foundation-button-radius-large, 0.5rem);
          --journal-button-height-small: var(--foundation-button-height-small);
          --journal-button-height-medium: var(--foundation-button-height-medium);
          --journal-button-height-large: var(--foundation-button-height-large);
        }
      `);
    });

    // Generate CSS for subjects (if they override journals)
    websiteBranding.subjects.forEach(subject => {
      cssRules.push(`
        .subject-${subject.slug} {
          /* Subject-specific colors */
          --journal-primary: ${subject.colors.primary};
          --journal-primary-dark: ${subject.colors.accent};
          --journal-primary-light: ${subject.colors.secondary};
          --journal-secondary: ${subject.colors.secondary};
          --journal-secondary-dark: ${subject.colors.accent};
          --journal-accent: ${subject.colors.secondary};
          --journal-text: ${subject.colors.text};
          --journal-text-dark: ${subject.colors.background === '#ffffff' ? '#1f2937' : subject.colors.text};
          --journal-hover: ${subject.colors.accent};
          
          /* Typography inherited from theme */
          --journal-font-family-heading: var(--theme-heading-font);
          --journal-font-family-body: var(--theme-body-font);
          --journal-letter-spacing-heading: var(--foundation-letter-spacing-heading, 0);
          --journal-letter-spacing-body: var(--foundation-letter-spacing-body, 0);
          --journal-font-weight-heading: var(--foundation-font-weight-bold, 700);
          --journal-font-weight-body: var(--foundation-font-weight-regular, 400);
          
          /* Button styling inherited from theme */
          --journal-button-font-family: var(--foundation-button-font-family);
          --journal-button-font-weight: var(--foundation-button-font-weight);
          --journal-button-font-size-small: var(--foundation-button-font-size-small);
          --journal-button-font-size-medium: var(--foundation-button-font-size-medium);
          --journal-button-font-size-large: var(--foundation-button-font-size-large);
          --journal-button-letter-spacing: var(--foundation-button-letter-spacing);
          --journal-button-text-transform: var(--foundation-button-text-transform);
          --journal-button-padding-small: var(--foundation-button-padding-small);
          --journal-button-padding-medium: var(--foundation-button-padding-medium);
          --journal-button-padding-large: var(--foundation-button-padding-large);
          --journal-button-radius-small: var(--foundation-button-radius-small, 0.25rem);
          --journal-button-radius-medium: var(--foundation-button-radius-medium, 0.375rem);
          --journal-button-radius-large: var(--foundation-button-radius-large, 0.5rem);
          --journal-button-height-small: var(--foundation-button-height-small);
          --journal-button-height-medium: var(--foundation-button-height-medium);
          --journal-button-height-large: var(--foundation-button-height-large);
        }
      `);
    });

    // Create and inject the style element
    const styleElement = document.createElement('style');
    styleElement.id = 'dynamic-branding-css';
    styleElement.textContent = cssRules.join('\n');
    document.head.appendChild(styleElement);

    debugLog('log', '🎨 Dynamic branding CSS injected for website:', websiteId);
    debugLog('log', '📝 Generated CSS:', cssRules.join('\n'));
  }, [websiteId, websiteBranding, initializeWebsiteBranding]);

  return null; // This component doesn't render anything
};

export default DynamicBrandingCSS;
