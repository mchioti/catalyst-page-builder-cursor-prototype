import type { ContentBranding, ResolvedBranding, WebsiteBrandingSystem } from '../types/branding';

/**
 * Content-aware branding engine that resolves the appropriate branding
 * based on content context and priority rules
 */
export class BrandingEngine {
  private brandingSystem: WebsiteBrandingSystem;

  constructor(brandingSystem: WebsiteBrandingSystem) {
    this.brandingSystem = brandingSystem;
  }

  /**
   * Resolve branding for content based on priority rules
   */
  resolveBranding(content: ContentBranding): ResolvedBranding {
    // Subject branding (highest priority)
    if (content.subjects?.length && this.brandingSystem.rules.subjectsOverrideJournals) {
      const subjectSlug = content.subjects[0];
      const subject = this.brandingSystem.subjects.find(s => s.slug === subjectSlug);
      if (subject) {
        return {
          colors: subject.colors,
          cssClasses: this.generateCSSClasses({
            type: 'subject',
            slug: subject.slug,
            priority: subject.priority
          }),
          source: {
            type: 'subject',
            name: subject.name,
            priority: subject.priority
          }
        };
      }
    }

    // Journal branding (medium priority)
    if (content.journal && this.brandingSystem.rules.journalsOverrideBookSeries) {
      const journal = this.brandingSystem.journals.find(j => j.slug === content.journal);
      if (journal) {
        return {
          colors: journal.colors,
          cssClasses: this.generateCSSClasses({
            type: 'journal',
            slug: journal.slug,
            priority: journal.priority
          }),
          source: {
            type: 'journal',
            name: journal.name,
            priority: journal.priority
          }
        };
      }
    }

    // Book Series branding (lower priority)
    if (content.bookSeries) {
      const series = this.brandingSystem.bookSeries.find(s => s.slug === content.bookSeries);
      if (series) {
        return {
          colors: series.colors,
          cssClasses: this.generateCSSClasses({
            type: 'bookSeries',
            slug: series.slug,
            priority: series.priority
          }),
          source: {
            type: 'bookSeries',
            name: series.name,
            priority: series.priority
          }
        };
      }
    }

    // Fallback to website branding
    if (this.brandingSystem.rules.fallbackToWebsite) {
      return {
        colors: this.brandingSystem.website.colors,
        cssClasses: ['website-brand'],
        source: {
          type: 'website',
          name: this.brandingSystem.website.name,
          priority: 0
        }
      };
    }

    // Should never reach here, but provide a safe fallback
    return {
      colors: this.brandingSystem.website.colors,
      cssClasses: ['website-brand'],
      source: {
        type: 'website',
        name: 'Default',
        priority: 0
      }
    };
  }

  /**
   * Generate CSS classes for a given branding context
   */
  private generateCSSClasses(context: {
    type: 'subject' | 'journal' | 'bookSeries' | 'website';
    slug?: string;
    priority?: number;
  }): string[] {
    const classes: string[] = [];

    if (context.type === 'website') {
      classes.push('website-brand');
    } else if (context.slug) {
      classes.push(`${context.type === 'subject' ? 'subject' : 
                     context.type === 'journal' ? 'journal' : 'series'}-${context.slug}`);
    }

    if (context.priority !== undefined) {
      classes.push(`brand-priority-${context.priority}`);
    }

    classes.push('brand-transition'); // Add transition class for smooth changes

    return classes;
  }

  /**
   * Generate CSS custom properties for a resolved branding
   */
  generateCSSVariables(branding: ResolvedBranding): Record<string, string> {
    return {
      '--brand-primary': branding.colors.primary,
      '--brand-secondary': branding.colors.secondary,
      '--brand-accent': branding.colors.accent,
      '--brand-text': branding.colors.text,
      '--brand-background': branding.colors.background
    };
  }

  /**
   * Apply branding to a DOM element
   */
  applyBrandingToElement(element: HTMLElement, content: ContentBranding): void {
    const branding = this.resolveBranding(content);
    
    // Apply CSS classes
    branding.cssClasses.forEach(className => {
      element.classList.add(className);
    });

    // Apply CSS custom properties
    const cssVars = this.generateCSSVariables(branding);
    Object.entries(cssVars).forEach(([property, value]) => {
      element.style.setProperty(property, value);
    });
  }

  /**
   * Remove branding from a DOM element
   */
  removeBrandingFromElement(element: HTMLElement): void {
    // Remove brand-related classes
    const brandClasses = Array.from(element.classList).filter(className =>
      className.startsWith('subject-') ||
      className.startsWith('journal-') ||
      className.startsWith('series-') ||
      className.startsWith('brand-') ||
      className === 'website-brand'
    );

    brandClasses.forEach(className => {
      element.classList.remove(className);
    });

    // Remove CSS custom properties
    [
      '--brand-primary',
      '--brand-secondary',
      '--brand-accent',
      '--brand-text',
      '--brand-background'
    ].forEach(property => {
      element.style.removeProperty(property);
    });
  }

  /**
   * Get branding preview for content
   */
  getBrandingPreview(content: ContentBranding): {
    branding: ResolvedBranding;
    previewHTML: string;
  } {
    const branding = this.resolveBranding(content);
    
    const previewHTML = `
      <div class="${branding.cssClasses.join(' ')}" style="${
        Object.entries(this.generateCSSVariables(branding))
          .map(([prop, value]) => `${prop}: ${value}`)
          .join('; ')
      }">
        <div class="p-4 rounded-lg" style="background-color: var(--brand-background);">
          <h3 class="font-bold mb-2" style="color: var(--brand-text);">
            ${branding.source.name} Preview
          </h3>
          <div class="flex gap-2 mb-3">
            <button class="branded-button px-3 py-1.5 text-sm rounded">
              Primary Button
            </button>
            <button class="branded-button-outline px-3 py-1.5 text-sm rounded">
              Outline Button
            </button>
          </div>
          <p style="color: var(--brand-text);">
            This is sample text content. 
            <a href="#" class="branded-link">This is a branded link</a>
            that shows the accent color in use.
          </p>
          <div class="branded-badge inline-block px-2 py-1 text-xs rounded mt-2">
            Branded Badge
          </div>
        </div>
      </div>
    `;

    return { branding, previewHTML };
  }

  /**
   * Update the branding system
   */
  updateBrandingSystem(brandingSystem: WebsiteBrandingSystem): void {
    this.brandingSystem = brandingSystem;
  }
}

/**
 * React hook for using the branding engine
 */
export const useBrandingEngine = (brandingSystem: WebsiteBrandingSystem) => {
  return new BrandingEngine(brandingSystem);
};

/**
 * Utility functions for common branding operations
 */
export const BrandingUtils = {
  /**
   * Extract content branding from a mock route
   */
  getContentBrandingFromRoute(route: string): ContentBranding {
    const content: ContentBranding = {};

    // Parse subjects from route
    if (route.includes('/biology/')) content.subjects = ['biology'];
    if (route.includes('/mathematics/')) content.subjects = ['mathematics'];
    if (route.includes('/chemistry/')) content.subjects = ['chemistry'];
    if (route.includes('/engineering/')) content.subjects = ['engineering'];

    // Parse journal from route
    if (route.includes('/journal/nature/')) content.journal = 'nature';
    if (route.includes('/journal/science/')) content.journal = 'science';

    // Parse book series from route
    if (route.includes('/series/springer/')) content.bookSeries = 'springer';

    return content;
  },

  /**
   * Generate branding metadata for SEO/sharing
   */
  generateBrandingMetadata(branding: ResolvedBranding) {
    return {
      themeColor: branding.colors.primary,
      accentColor: branding.colors.accent,
      brandName: branding.source.name,
      brandType: branding.source.type
    };
  }
};
