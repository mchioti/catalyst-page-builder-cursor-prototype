/**
 * Theme CSS Generator
 * 
 * Generates pure CSS from theme configuration.
 * NO TAILWIND in output - only semantic classes driven by theme variables.
 * 
 * Architecture:
 * - Page Builder UI uses Tailwind ✅
 * - Rendered websites use this generated CSS ✅
 */

export const generateThemeCSS = (theme: any): string => {
  return `
/* ====================================
   THEME: ${theme.name}
   Generated CSS (NO TAILWIND)
   ==================================== */

/* RESET & BASE STYLES */
* {
  box-sizing: border-box;
}

/* ====================================
   BUTTONS
   ==================================== */

.btn {
  display: inline-block;
  font-family: var(--theme-body-font);
  font-weight: 500;
  text-align: center;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  border: none;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
  line-height: 1.5;
  
  /* Theme-specific styling */
  border-radius: var(--theme-button-radius);
  
  /* Visual depth */
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.btn:active {
  transform: translateY(0);
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.5);
}

.btn:focus:not(:focus-visible) {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

/* Button Sizes */
.btn-small {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

.btn-medium {
  padding: 0.5rem 1rem;
  font-size: 1rem;
}

.btn-large {
  padding: 0.75rem 1.5rem;
  font-size: 1.125rem;
}

/* Button Styles - SOLID */
/* 🎨 Context-aware: Use primary.dark for LIGHT backgrounds, primary.light for DARK backgrounds */
.btn-solid-color1.on-light-bg {
  background: var(--semantic-primary-dark, var(--theme-color-primary));
  color: white;
}

.btn-solid-color1.on-light-bg:hover {
  background: var(--semantic-primary-dark-hover, var(--theme-color-primary));
}

.btn-solid-color1.on-light-bg:active {
  background: var(--semantic-primary-dark, var(--theme-color-primary));
  filter: brightness(0.9);
}

.btn-solid-color1.on-dark-bg {
  background: var(--semantic-primary-light, var(--theme-color-primary));
  color: black;
}

.btn-solid-color1.on-dark-bg:hover {
  background: var(--semantic-primary-light-hover, var(--theme-color-primary));
}

.btn-solid-color1.on-dark-bg:active {
  background: var(--semantic-primary-light, var(--theme-color-primary));
  filter: brightness(0.9);
}

.btn-solid-color2 {
  background: var(--semantic-secondary-bg-light, var(--theme-color-secondary));
  color: var(--semantic-secondary-text-light, white);
}

.btn-solid-color2:hover {
  background: var(--semantic-secondary-bg-light-hover, var(--theme-color-secondary));
  opacity: 0.9;
}

.btn-solid-color3 {
  background: var(--semantic-tertiary-bg-light, var(--theme-color-accent));
  color: var(--semantic-tertiary-text-light, white);
}

.btn-solid-color3:hover {
  background: var(--semantic-tertiary-bg-light-hover, var(--theme-color-accent));
  opacity: 0.9;
}

.btn-solid-color4 {
  background: var(--semantic-neutraldark-bg-light, var(--theme-color-text, #313131));
  color: var(--semantic-neutraldark-text-light, white);
}

.btn-solid-color4:hover {
  background: var(--semantic-neutraldark-bg-light-hover, var(--theme-color-text, #313131));
  opacity: 0.9;
}

.btn-solid-color5 {
  background: var(--semantic-neutrallight-bg-light, var(--theme-color-background, white));
  color: var(--semantic-neutrallight-text-light, var(--theme-color-text, #313131));
}

.btn-solid-color5:hover {
  background: var(--semantic-neutrallight-bg-light-hover, var(--theme-color-background, white));
  opacity: 0.9;
}

/* Button Styles - OUTLINE */
/* 🎨 Context-aware: Adapt border/text color based on background */
.btn-outline-color1 {
  box-shadow: none !important; /* Outline buttons have no shadow by default */
}

.btn-outline-color1.on-light-bg {
  background: transparent;
  color: var(--semantic-primary-dark, var(--theme-color-primary));
  border: 2px solid var(--semantic-primary-dark, var(--theme-color-primary));
}

.btn-outline-color1.on-light-bg:hover {
  background: var(--semantic-primary-dark, var(--theme-color-primary));
  color: white;
  border-color: var(--semantic-primary-dark, var(--theme-color-primary));
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
}

.btn-outline-color1.on-light-bg:active {
  background: var(--semantic-primary-dark-hover, var(--theme-color-primary));
  color: white;
}

.btn-outline-color1.on-dark-bg {
  background: transparent;
  color: var(--semantic-primary-light, var(--theme-color-primary));
  border: 2px solid var(--semantic-primary-light, var(--theme-color-primary));
}

.btn-outline-color1.on-dark-bg:hover {
  background: var(--semantic-primary-light, var(--theme-color-primary));
  color: black;
  border-color: var(--semantic-primary-light, var(--theme-color-primary));
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
}

.btn-outline-color1.on-dark-bg:active {
  background: var(--semantic-primary-light-hover, var(--theme-color-primary));
  color: black;
}

.btn-outline-color2 {
  background: transparent;
  color: var(--theme-color-secondary);
  border: 2px solid var(--theme-color-secondary);
}

.btn-outline-color2:hover {
  background: var(--theme-color-secondary);
  color: white;
}

.btn-outline-color3 {
  background: transparent;
  color: var(--semantic-tertiary-text-light, var(--theme-color-accent));
  border: 2px solid var(--semantic-tertiary-bg-light, var(--theme-color-accent));
}

.btn-outline-color3:hover {
  background: var(--semantic-tertiary-bg-light, var(--theme-color-accent));
  color: var(--semantic-tertiary-text-light, white);
}

.btn-outline-color4 {
  background: transparent;
  color: var(--semantic-neutraldark-bg-light, var(--theme-color-text, #313131));
  border: 2px solid var(--semantic-neutraldark-bg-light, var(--theme-color-text, #313131));
}

.btn-outline-color4:hover {
  background: var(--semantic-neutraldark-bg-light, var(--theme-color-text, #313131));
  color: var(--semantic-neutraldark-text-light, white);
}

.btn-outline-color5 {
  background: transparent;
  color: var(--semantic-neutrallight-text-light, var(--theme-color-text, #313131));
  border: 2px solid var(--semantic-neutrallight-text-light, var(--theme-color-text, #313131));
}

.btn-outline-color5:hover {
  background: var(--semantic-neutrallight-bg-light, var(--theme-color-background, white));
  color: var(--semantic-neutrallight-text-light, var(--theme-color-text, #313131));
}

/* Button Styles - LINK */
/* 🎨 Context-aware: Adapt text color based on background */
.btn-link-color1 {
  box-shadow: none !important; /* Link buttons have no shadow */
  padding: 0 !important;
}

.btn-link-color1.on-light-bg {
  background: transparent;
  color: var(--semantic-primary-dark, var(--theme-color-primary));
  border: none;
  text-decoration: underline;
  text-decoration-color: transparent;
  text-underline-offset: 3px;
}

.btn-link-color1.on-light-bg:hover {
  color: var(--semantic-primary-dark-hover, var(--theme-color-primary));
  text-decoration-color: var(--semantic-primary-dark-hover, var(--theme-color-primary));
  transform: none;
}

.btn-link-color1.on-light-bg:active {
  color: var(--semantic-primary-dark, var(--theme-color-primary));
}

.btn-link-color1.on-dark-bg {
  background: transparent;
  color: var(--semantic-primary-light, var(--theme-color-primary));
  border: none;
  text-decoration: underline;
  text-decoration-color: transparent;
  text-underline-offset: 3px;
}

.btn-link-color1.on-dark-bg:hover {
  color: var(--semantic-primary-light-hover, var(--theme-color-primary));
  text-decoration-color: var(--semantic-primary-light-hover, var(--theme-color-primary));
  transform: none;
}

.btn-link-color1.on-dark-bg:active {
  color: var(--semantic-primary-light, var(--theme-color-primary));
}

.btn-link-color2 {
  background: transparent;
  color: var(--theme-color-secondary);
  padding: 0;
  border: none;
}

.btn-link-color2:hover {
  text-decoration: underline;
  opacity: 0.75;
}

.btn-link-color3 {
  background: transparent;
  color: var(--semantic-tertiary-bg-light, var(--theme-color-accent));
  padding: 0;
  border: none;
}

.btn-link-color3:hover {
  text-decoration: underline;
  opacity: 0.75;
}

.btn-link-color4 {
  background: transparent;
  color: var(--semantic-neutraldark-bg-light, var(--theme-color-text, #313131));
  padding: 0;
  border: none;
}

.btn-link-color4:hover {
  text-decoration: underline;
  opacity: 0.75;
}

.btn-link-color5 {
  background: transparent;
  color: var(--semantic-neutrallight-text-light, var(--theme-color-text, #313131));
  padding: 0;
  border: none;
}

.btn-link-color5:hover {
  text-decoration: underline;
  opacity: 0.75;
}

/* Button Alignment Wrappers */
.btn-wrapper-left {
  text-align: left;
}

.btn-wrapper-center {
  text-align: center;
}

.btn-wrapper-right {
  text-align: right;
}

/* ====================================
   CARDS (Publication Cards & Section Cards)
   ==================================== */

.publication-card,
.card {
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  border-radius: var(--theme-card-radius, 0.5rem);
  transition: all 200ms ease;
  background: inherit;
}

.publication-card:hover,
.card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-color: #d1d5db;
}

/* ====================================
   TABS
   ==================================== */

.tabs-nav {
  display: flex;
  gap: 0.25rem;
  border-bottom: 2px solid #e5e7eb;
}

.tabs-nav.tabs-center {
  justify-content: center;
}

.tabs-nav.tabs-right {
  justify-content: flex-end;
}

.tabs-nav.tabs-left {
  justify-content: flex-start;
}

.tab-button {
  padding: 0.5rem 1rem;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 200ms ease;
  position: relative;
  background: transparent;
  border: none;
  color: #6b7280;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
}

.tab-button:hover {
  color: #374151;
}

.tab-button.active {
  color: var(--theme-color-primary);
  border-bottom-color: var(--theme-color-primary);
  font-weight: 600;
}

/* Pills variant */
.tabs-pills {
  border-bottom: none;
}

.tabs-pills .tab-button {
  border-radius: 9999px;
  background: #f3f4f6;
  margin-bottom: 0;
}

.tabs-pills .tab-button:hover {
  background: #e5e7eb;
}

.tabs-pills .tab-button.active {
  background: var(--theme-color-primary);
  color: white;
  border-bottom-color: transparent;
}

/* Buttons variant */
.tabs-buttons {
  border-bottom: none;
}

.tabs-buttons .tab-button {
  border-radius: 0.375rem;
  border: 1px solid #d1d5db;
  background: white;
  margin-bottom: 0;
}

.tabs-buttons .tab-button:hover {
  border-color: #9ca3af;
}

.tabs-buttons .tab-button.active {
  background: var(--theme-color-primary);
  color: white;
  border-color: var(--theme-color-primary);
}

/* ====================================
   CARDS
   ==================================== */

.card {
  border: 1px solid #e5e7eb;
  background: white;
  padding: 2rem;
  
  /* Theme-specific styling */
  border-radius: var(--theme-card-radius);
}

.card-dark {
  border-color: #4b5563;
}

/* ====================================
   TYPOGRAPHY
   ==================================== */

.heading {
  font-family: var(--theme-heading-font);
  font-weight: 600;
  line-height: 1.2;
  margin: 0;
  color: var(--theme-color-text);
}

.heading-1 { font-size: 2.5rem; }
.heading-2 { font-size: 2rem; }
.heading-3 { font-size: 1.75rem; }
.heading-4 { font-size: 1.5rem; }
.heading-5 { font-size: 1.25rem; }
.heading-6 { font-size: 1rem; }

.heading-xs { font-size: 1.25rem; }
.heading-sm { font-size: 1.5rem; }
.heading-md { font-size: 1.875rem; }
.heading-lg { font-size: 2.25rem; }
.heading-xl { font-size: 3rem; }

.heading-left { text-align: left; }
.heading-center { text-align: center; }
.heading-right { text-align: right; }

.text {
  font-family: var(--theme-body-font);
  line-height: 1.7;
  margin: 0;
  color: var(--theme-color-text);
}

.text-left { text-align: left; }
.text-center { text-align: center; }
.text-right { text-align: right; }

/* ====================================
   IMAGES
   ==================================== */

.image {
  max-width: 100%;
  height: auto;
  display: block;
}

.image-rounded {
  border-radius: var(--theme-card-radius);
}

.image-circle {
  border-radius: 50%;
}

/* ====================================
   UTILITY CLASSES
   ==================================== */

.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.gap-2 { gap: 0.5rem; }
.gap-4 { gap: 1rem; }
.gap-6 { gap: 1.5rem; }

.mb-2 { margin-bottom: 0.5rem; }
.mb-4 { margin-bottom: 1rem; }
.mb-6 { margin-bottom: 1.5rem; }

/* ====================================
   THEME-SPECIFIC OVERRIDES
   ==================================== */

${generateThemeSpecificCSS(theme)}
`
}

/**
 * Generate theme-specific CSS overrides
 * This is where we handle special cases like:
 * - Modern theme: White background, blue text buttons
 * - Wiley DS V2: Monospace, uppercase buttons
 * - IBM Carbon: Sharp corners, specific sizing
 */
const generateThemeSpecificCSS = (theme: any): string => {
  const themeId = theme.id
  
  // Modern/Modernist Theme: WHITE background with BLUE text (not blue background!)
  if (themeId === 'modernist-theme' || themeId === 'modern-theme') {
    return `
/* Modern Theme Overrides - White/Blue Button Style */
.btn-solid-color1 {
  background: white !important;
  color: var(--theme-color-primary) !important;
  border: 1px solid rgba(59, 130, 246, 0.3);
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.btn-solid-color1:hover {
  background: rgba(59, 130, 246, 0.05) !important;
  color: var(--theme-color-primary) !important;
}

.btn-solid-color2 {
  background: transparent !important;
  color: white !important;
  border: 1px solid white;
}

.btn-solid-color2:hover {
  background: white !important;
  color: var(--theme-color-primary) !important;
}

.btn-outline-color1 {
  background: transparent !important;
  color: var(--theme-color-primary) !important;
  border: 2px solid var(--theme-color-primary);
}

.btn-outline-color1:hover {
  background: var(--theme-color-primary) !important;
  color: white !important;
}

.btn-link-color1 {
  color: var(--theme-color-primary) !important;
}

.btn-link-color1:hover {
  color: rgba(59, 130, 246, 0.8) !important;
}
`
  }
  
  // Wiley DS V2: Monospace, uppercase buttons (comprehensive foundation merged)
  if (themeId === 'wiley-figma-ds-v2') {
    return `
/* Wiley DS V2 Theme Overrides */
.btn {
  font-family: 'Courier New', Courier, monospace;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.btn-small { font-size: 0.75rem; }
.btn-medium { font-size: 0.875rem; }
.btn-large { font-size: 1rem; }
`
  }
  
  // IBM Carbon: Specific sizing from Carbon DS + Ghost/Tertiary button styles
  if (themeId === 'ibm-carbon-ds') {
    return `
/* IBM Carbon DS Theme Overrides */
.btn {
  font-family: 'IBM Plex Sans', system-ui, -apple-system, sans-serif;
  font-weight: 400;
  letter-spacing: 0.16px;
  transition: all 70ms cubic-bezier(0, 0, 0.38, 0.9);
}

.btn-small { 
  padding: 0 1rem;
  height: 32px;
  font-size: 0.75rem;
  line-height: 32px;
}

.btn-medium { 
  padding: 0 1rem;
  height: 48px;
  font-size: 0.875rem;
  line-height: 48px;
}

.btn-large { 
  padding: 0 1rem;
  height: 64px;
  font-size: 1rem;
  line-height: 64px;
}

/* Carbon Tertiary Button (color3) - Transparent, NO border */
.btn-solid-color3 {
  background: transparent !important;
  color: var(--semantic-tertiary-text-light) !important;
  border: none !important;
}

.btn-solid-color3:hover {
  background: var(--semantic-tertiary-bg-light-hover) !important;
  color: var(--semantic-tertiary-text-light-hover) !important;
}

/* Carbon Ghost Button (color5) - Transparent WITH border */
.btn-solid-color5,
.btn-outline-color5 {
  background: transparent !important;
  color: var(--semantic-neutrallight-text-light) !important;
  border: 1px solid var(--semantic-neutrallight-text-light) !important;
}

.btn-solid-color5:hover,
.btn-outline-color5:hover {
  background: var(--semantic-neutrallight-bg-light-hover) !important;
  color: var(--semantic-neutrallight-text-light-hover) !important;
}

/* Carbon Tabs - Underline style with IBM Blue indicator */
.tabs-nav {
  border-bottom: 1px solid #e0e0e0 !important; /* Carbon Grey 20 */
}

.tab-button {
  font-family: 'IBM Plex Sans', system-ui, -apple-system, sans-serif !important;
  font-weight: 400;
  letter-spacing: 0.16px;
  padding: 0 1rem !important;
  height: 48px !important;
  color: #161616 !important; /* Carbon Black */
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: all 70ms cubic-bezier(0, 0, 0.38, 0.9);
}

.tab-button:hover {
  background: #e8e8e8 !important; /* Carbon Grey 10 */
  color: #161616 !important;
}

.tab-button.active {
  color: #161616 !important; /* Carbon Black */
  font-weight: 600;
  border-bottom-color: #0f62fe !important; /* IBM Blue */
}

/* Carbon Menu - Horizontal navigation */
.menu-horizontal {
  font-family: 'IBM Plex Sans', system-ui, -apple-system, sans-serif !important;
}

.menu-horizontal a,
.menu-horizontal button {
  color: #161616 !important; /* Carbon Black */
  font-weight: 400;
  letter-spacing: 0.16px;
  padding: 0.75rem 1rem;
  transition: all 70ms cubic-bezier(0, 0, 0.38, 0.9);
  border-bottom: 2px solid transparent;
}

.menu-horizontal a:hover,
.menu-horizontal button:hover {
  background: #e8e8e8 !important; /* Carbon Grey 10 */
}

.menu-horizontal a.active,
.menu-horizontal button.active {
  font-weight: 600;
  border-bottom-color: #0f62fe !important; /* IBM Blue */
}

/* Carbon Cards - Sharp corners, subtle border, no shadow */
.publication-card,
.card {
  border: 1px solid #e0e0e0 !important; /* Carbon Grey 20 */
  border-radius: 0 !important;
  box-shadow: none !important;
  padding: 1rem !important;
}

.publication-card:hover,
.card:hover {
  border-color: #8d8d8d !important; /* Carbon Grey 50 */
  box-shadow: none !important;
}

/* ====================================
   CARBON TYPOGRAPHY STYLES
   ==================================== */

/* Body Text Styles */
.text-body-01 {
  font-family: 'IBM Plex Sans', system-ui, -apple-system, sans-serif;
  font-size: 0.875rem;     /* 14px */
  font-weight: 400;
  line-height: 1.42857;    /* 20px */
  letter-spacing: 0.16px;
}

.text-body-02 {
  font-family: 'IBM Plex Sans', system-ui, -apple-system, sans-serif;
  font-size: 1rem;         /* 16px */
  font-weight: 400;
  line-height: 1.5;        /* 24px */
  letter-spacing: 0;
}

.text-body-compact-01 {
  font-family: 'IBM Plex Sans', system-ui, -apple-system, sans-serif;
  font-size: 0.875rem;     /* 14px */
  font-weight: 400;
  line-height: 1.28572;    /* 18px */
  letter-spacing: 0.16px;
}

.text-body-compact-02 {
  font-family: 'IBM Plex Sans', system-ui, -apple-system, sans-serif;
  font-size: 1rem;         /* 16px */
  font-weight: 400;
  line-height: 1.375;      /* 22px */
  letter-spacing: 0;
}

.text-label-01 {
  font-family: 'IBM Plex Sans', system-ui, -apple-system, sans-serif;
  font-size: 0.75rem;      /* 12px */
  font-weight: 400;
  line-height: 1.33333;    /* 16px */
  letter-spacing: 0.32px;
}

.text-label-02 {
  font-family: 'IBM Plex Sans', system-ui, -apple-system, sans-serif;
  font-size: 0.875rem;     /* 14px */
  font-weight: 400;
  line-height: 1.28572;    /* 18px */
  letter-spacing: 0.16px;
}

.text-helper-text-01 {
  font-family: 'IBM Plex Sans', system-ui, -apple-system, sans-serif;
  font-size: 0.75rem;      /* 12px */
  font-weight: 400;
  line-height: 1.33333;    /* 16px */
  letter-spacing: 0.32px;
  font-style: italic;
}

.text-helper-text-02 {
  font-family: 'IBM Plex Sans', system-ui, -apple-system, sans-serif;
  font-size: 0.875rem;     /* 14px */
  font-weight: 400;
  line-height: 1.28572;    /* 18px */
  letter-spacing: 0.16px;
  font-style: italic;
}

/* Heading Styles */
.heading-heading-01 {
  font-family: 'IBM Plex Sans', system-ui, -apple-system, sans-serif;
  font-size: 0.875rem;     /* 14px */
  font-weight: 600;
  line-height: 1.28572;    /* 18px */
  letter-spacing: 0.16px;
}

.heading-heading-02 {
  font-family: 'IBM Plex Sans', system-ui, -apple-system, sans-serif;
  font-size: 1rem;         /* 16px */
  font-weight: 600;
  line-height: 1.375;      /* 22px */
  letter-spacing: 0;
}

.heading-heading-03 {
  font-family: 'IBM Plex Sans', system-ui, -apple-system, sans-serif;
  font-size: 1.25rem;      /* 20px */
  font-weight: 400;
  line-height: 1.4;        /* 28px */
  letter-spacing: 0;
}

.heading-heading-04 {
  font-family: 'IBM Plex Sans', system-ui, -apple-system, sans-serif;
  font-size: 1.75rem;      /* 28px */
  font-weight: 400;
  line-height: 1.28572;    /* 36px */
  letter-spacing: 0;
}

.heading-heading-05 {
  font-family: 'IBM Plex Sans', system-ui, -apple-system, sans-serif;
  font-size: 2rem;         /* 32px */
  font-weight: 400;
  line-height: 1.25;       /* 40px */
  letter-spacing: 0;
}

.heading-heading-06 {
  font-family: 'IBM Plex Sans', system-ui, -apple-system, sans-serif;
  font-size: 2.625rem;     /* 42px */
  font-weight: 300;
  line-height: 1.199;      /* 50px */
  letter-spacing: 0;
}

.heading-heading-07 {
  font-family: 'IBM Plex Sans', system-ui, -apple-system, sans-serif;
  font-size: 3.375rem;     /* 54px */
  font-weight: 300;
  line-height: 1.19;       /* 64px */
  letter-spacing: 0;
}
`
  }
  
  // Ant Design Theme
  if (themeId === 'ant-design') {
    return `
/* ====================================
   ANT DESIGN SYSTEM
   ==================================== */

/* Ant Design Buttons */
.btn-small {
  height: 24px;
  padding: 0 15px;
  font-size: 14px;
  border-radius: 12px;
}

.btn-medium {
  height: 32px;
  padding: 4px 15px;
  font-size: 14px;
  border-radius: 16px;
}

.btn-large {
  height: 40px;
  padding: 6.4px 15px;
  font-size: 16px;
  border-radius: 20px;
}

/* Ant Design button base styles */
.btn,
.btn-solid-color1,
.btn-solid-color2,
.btn-solid-color3,
.btn-outline-color1,
.btn-outline-color2,
.btn-outline-color3,
.btn-link-color1,
.btn-link-color2,
.btn-link-color3 {
  transition: all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif;
  font-weight: 400;
  line-height: 1.5715;
}

/* PRIMARY BUTTON - Type="primary" (Blue solid) */
.btn-solid-color1 {
  background: #1890ff;
  border: 1px solid #1890ff;
  color: #ffffff;
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.045), 0 1px 2px rgba(0, 0, 0, 0.1);
  text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.12);
}

.btn-solid-color1:hover {
  background: #40a9ff;
  border-color: #40a9ff;
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.045), 0 2px 4px rgba(0, 0, 0, 0.12);
}

/* DANGER BUTTON - Type="primary" danger (Red solid) */
.btn-solid-color2 {
  background: #ff4d4f;
  border: 1px solid #ff4d4f;
  color: #ffffff;
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.045), 0 1px 2px rgba(0, 0, 0, 0.1);
  text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.12);
}

.btn-solid-color2:hover {
  background: #ff7875;
  border-color: #ff7875;
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.045), 0 2px 4px rgba(0, 0, 0, 0.12);
}

/* DEFAULT BUTTON SOLID (Grey) - rarely used, but included for completeness */
.btn-solid-color3 {
  background: #ffffff;
  border: 1px solid #d9d9d9;
  color: rgba(0, 0, 0, 0.85);
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.016);
  text-shadow: none;
}

.btn-solid-color3:hover {
  background: #ffffff;
  border-color: #40a9ff;
  color: #40a9ff;
}

/* DEFAULT BUTTON - Type="default" (Grey outline, white background) */
.btn-outline-color1 {
  background: #ffffff;
  border: 1px solid #d9d9d9;
  color: rgba(0, 0, 0, 0.85);
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.016), 0 1px 2px rgba(0, 0, 0, 0.05);
  text-shadow: none;
}

.btn-outline-color1:hover {
  background: #ffffff;
  border-color: #40a9ff;
  color: #40a9ff;
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.016), 0 2px 4px rgba(0, 0, 0, 0.08);
}

/* DANGER OUTLINE - Type="default" danger (Red outline) */
.btn-outline-color2 {
  background: #ffffff;
  border: 1px solid #d9d9d9;
  color: #ff4d4f;
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.016), 0 1px 2px rgba(0, 0, 0, 0.05);
  text-shadow: none;
}

.btn-outline-color2:hover {
  background: #ffffff;
  border-color: #ff7875;
  color: #ff7875;
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.016), 0 2px 4px rgba(0, 0, 0, 0.08);
}

/* DASHED BUTTON - Type="dashed" (Dashed grey border) */
.btn-outline-color3 {
  background: #ffffff;
  border: 1px dashed #d9d9d9;
  color: rgba(0, 0, 0, 0.85);
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.016), 0 1px 2px rgba(0, 0, 0, 0.05);
  text-shadow: none;
}

.btn-outline-color3:hover {
  background: #ffffff;
  border-color: #40a9ff;
  border-style: dashed;
  color: #40a9ff;
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.016), 0 2px 4px rgba(0, 0, 0, 0.08);
}

/* TEXT/LINK BUTTON - Type="text" or Type="link" (No background, no border) */
.btn-link-color1 {
  background: transparent;
  border: none;
  color: #1890ff;
  box-shadow: none;
  text-shadow: none;
}

.btn-link-color1:hover {
  background: rgba(0, 0, 0, 0.018);
  color: #40a9ff;
}

/* TEXT DANGER - Type="text" danger */
.btn-link-color2 {
  background: transparent;
  border: none;
  color: #ff4d4f;
  box-shadow: none;
  text-shadow: none;
}

.btn-link-color2:hover {
  background: rgba(0, 0, 0, 0.018);
  color: #ff7875;
}

/* TEXT MUTED - Type="text" (Grey text) */
.btn-link-color3 {
  background: transparent;
  border: none;
  color: rgba(0, 0, 0, 0.45);
  box-shadow: none;
  text-shadow: none;
}

.btn-link-color3:hover {
  background: rgba(0, 0, 0, 0.018);
  color: rgba(0, 0, 0, 0.85);
}

/* Ant Design Cards */
.publication-card,
.card {
  border-radius: 2px;
  border: 1px solid #f0f0f0;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02);
  padding: 24px;
  transition: box-shadow 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
}

.publication-card:hover,
.card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
}

/* Ant Design Tabs */
.tabs-nav {
  border-bottom: 1px solid #f0f0f0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif;
}

.tab-button {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.85);
  padding: 12px 0;
  margin: 0 32px 0 0;
  border-bottom: 2px solid transparent;
  transition: color 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
}

.tab-button:hover {
  color: #40a9ff;
}

.tab-button.active {
  color: #1890ff;
  border-bottom-color: #1890ff;
}

/* Ant Design Menu */
.menu-horizontal {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif;
}

.menu-horizontal a,
.menu-horizontal button {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.85);
  padding: 0 20px;
  height: 40px;
  line-height: 40px;
  border-bottom: 2px solid transparent;
  transition: color 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
}

.menu-horizontal a:hover,
.menu-horizontal button:hover {
  color: #40a9ff;
}

.menu-horizontal a.active,
.menu-horizontal button.active {
  color: #1890ff;
  border-bottom-color: #1890ff;
}
`
  }
  
  // Default: No overrides
  return '/* No theme-specific overrides */'
}

