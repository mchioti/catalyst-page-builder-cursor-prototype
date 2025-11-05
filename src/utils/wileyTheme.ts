/**
 * Wiley Theme Utilities
 * 
 * Helper functions and configurations for applying Wiley branding
 * across the page builder system.
 */

import type { BrandColors } from '../types/branding';

/**
 * Wiley Brand Colors - extracted from Wiley.com screenshots
 */
export const WILEY_COLORS: BrandColors = {
  primary: '#00d98a',      // Bright green - CTA buttons
  secondary: '#e8f5f5',    // Very light teal - subtle backgrounds
  accent: '#1a5757',       // Dark teal - headers, footer
  text: '#1f2937',         // Dark gray for light backgrounds
  background: '#f9fafb'    // Light gray page background
};

/**
 * Additional Wiley-specific colors for dark mode and special elements
 */
export const WILEY_EXTENDED_COLORS = {
  darkBg: '#000000',           // Black sections
  darkText: '#ffffff',         // White text on dark
  cardBorder: '#e5e7eb',       // Light borders for cards
  pillBg: '#2d3748',           // Dark background for pill navigation
  pillActive: '#ffffff',       // White for active pill
  hoverGreen: '#00c07d',       // Darker green for hover states
  lightGray: '#f8fafc'         // Very light gray backgrounds
};

/**
 * Wiley Button Style Configurations
 */
export const WILEY_BUTTON_STYLES = {
  primary: {
    className: 'wiley-btn-primary',
    backgroundColor: WILEY_COLORS.primary,
    color: WILEY_COLORS.accent,
    hoverColor: WILEY_EXTENDED_COLORS.hoverGreen
  },
  outlineLight: {
    className: 'wiley-btn-outline-light',
    backgroundColor: 'transparent',
    color: WILEY_EXTENDED_COLORS.darkText,
    borderColor: WILEY_EXTENDED_COLORS.darkText
  },
  outlineDark: {
    className: 'wiley-btn-outline-dark',
    backgroundColor: 'transparent',
    color: WILEY_COLORS.text,
    borderColor: WILEY_COLORS.text
  }
};

/**
 * Wiley Section Style Configurations
 */
export const WILEY_SECTION_STYLES = {
  dark: {
    className: 'wiley-section-dark',
    backgroundColor: WILEY_EXTENDED_COLORS.darkBg,
    textColor: WILEY_EXTENDED_COLORS.darkText
  },
  light: {
    className: 'wiley-section-light',
    backgroundColor: '#ffffff',
    textColor: WILEY_COLORS.text
  },
  footer: {
    className: 'wiley-footer',
    backgroundColor: WILEY_COLORS.accent,
    textColor: WILEY_EXTENDED_COLORS.darkText
  }
};

/**
 * Typography Scale - Wiley uses clean, modern sans-serif with specific weights
 */
export const WILEY_TYPOGRAPHY = {
  hero: {
    fontSize: '2.5rem',
    fontWeight: '300',
    lineHeight: '1.2',
    color: WILEY_EXTENDED_COLORS.darkText
  },
  heading1: {
    fontSize: '2rem',
    fontWeight: '400',
    lineHeight: '1.3'
  },
  heading2: {
    fontSize: '1.5rem',
    fontWeight: '600',
    lineHeight: '1.4'
  },
  sectionLabel: {
    fontSize: '0.875rem',
    fontWeight: '600',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    color: WILEY_COLORS.accent
  },
  body: {
    fontSize: '1rem',
    fontWeight: '400',
    lineHeight: '1.6'
  }
};

/**
 * Wiley Spacing Scale
 */
export const WILEY_SPACING = {
  section: {
    paddingTop: '4rem',
    paddingBottom: '4rem',
    paddingHorizontal: '2rem'
  },
  card: {
    padding: '1.5rem',
    gap: '1rem'
  },
  grid: {
    gap: '1.5rem'
  }
};

/**
 * Helper function to generate Wiley-themed section configuration
 */
export function createWileySection(variant: 'dark' | 'light' | 'footer') {
  const style = WILEY_SECTION_STYLES[variant];
  
  return {
    background: {
      type: 'color' as const,
      color: style.backgroundColor,
      opacity: 1
    },
    styling: {
      paddingTop: 'large' as const,
      paddingBottom: 'large' as const,
      paddingLeft: 'medium' as const,
      paddingRight: 'medium' as const,
      gap: 'medium' as const,
      variant: 'full-width' as const,
      textColor: variant === 'dark' || variant === 'footer' ? 'white' as const : 'default' as const
    },
    contentMode: variant === 'dark' || variant === 'footer' ? 'dark' as const : 'light' as const
  };
}

/**
 * Helper function to generate Wiley button configuration
 */
export function createWileyButton(
  variant: 'primary' | 'outline-light' | 'outline-dark',
  text: string,
  href: string = '#'
) {
  const styles = variant === 'primary' 
    ? WILEY_BUTTON_STYLES.primary
    : variant === 'outline-light'
    ? WILEY_BUTTON_STYLES.outlineLight
    : WILEY_BUTTON_STYLES.outlineDark;
  
  return {
    type: 'button' as const,
    text: text.toUpperCase(),
    href,
    variant: 'primary' as const, // Will be styled via className
    size: 'medium' as const,
    customClass: styles.className,
    icon: {
      enabled: true,
      position: 'right' as const,
      emoji: '→'
    }
  };
}

/**
 * Apply Wiley theme classes to an element
 */
export function applyWileyTheme(element: HTMLElement, variant?: 'dark' | 'light') {
  element.classList.add('wiley-brand');
  
  if (variant) {
    element.classList.add(`wiley-section-${variant}`);
  }
}

/**
 * Wiley Layout Presets
 */
export const WILEY_LAYOUTS = {
  threeColumnGrid: {
    className: 'wiley-three-col-grid',
    columns: 3,
    gap: '1.5rem'
  },
  contentWithImage: {
    className: 'wiley-content-with-image',
    columns: 2,
    gap: '3rem'
  }
};

/**
 * Generate Wiley CSS variables for inline styling
 */
export function getWileyCSSVariables() {
  return {
    '--brand-primary': WILEY_COLORS.primary,
    '--brand-secondary': WILEY_COLORS.secondary,
    '--brand-accent': WILEY_COLORS.accent,
    '--brand-text': WILEY_COLORS.text,
    '--brand-background': WILEY_COLORS.background,
    '--wiley-dark-bg': WILEY_EXTENDED_COLORS.darkBg,
    '--wiley-dark-text': WILEY_EXTENDED_COLORS.darkText,
    '--wiley-card-border': WILEY_EXTENDED_COLORS.cardBorder,
    '--wiley-pill-bg': WILEY_EXTENDED_COLORS.pillBg,
    '--wiley-pill-active': WILEY_EXTENDED_COLORS.pillActive
  };
}

/**
 * Wiley-specific widget skin configurations
 */
export const WILEY_WIDGET_SKINS = {
  heading: {
    hero: 'wiley-hero-text',
    sectionHeader: 'wiley-section-header'
  },
  card: 'wiley-card',
  pillNav: 'wiley-pill-nav'
};




