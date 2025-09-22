// Pre-fabricated sections templates based on AXP 2.0 specifications

export const PREFAB_SECTIONS = {
  // Global Sections (site-wide persistent elements)
  'global-header': {
    id: 'global-header',
    name: 'Global Header',
    category: 'global',
    layout: 'single-column',
    areas: [{
      id: 'header-content',
      maxWidgets: 3,
      widgets: []
    }]
  },
  
  // Content Sections (page-specific layout patterns)
  'header-section': {
    id: 'header-section', 
    name: 'Header',
    category: 'content',
    layout: 'single-column',
    areas: [{
      id: 'header-area',
      maxWidgets: 5,
      widgets: [{
        id: 'nav-widget-1',
        type: 'navbar',
        content: 'Main Navigation'
      }]
    }]
  },

  'hero-section': {
    id: 'hero-section',
    name: 'Hero',
    category: 'content', 
    layout: 'single-column',
    areas: [{
      id: 'hero-area',
      maxWidgets: 3,
      widgets: [
        {
          id: 'hero-heading-1',
          type: 'heading',
          content: 'Welcome to Our Platform',
          level: 1
        },
        {
          id: 'hero-image-1',
          type: 'image',
          src: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=600&fit=crop',
          alt: 'Modern office space',
          ratio: '16:9',
          objectFit: 'cover'
        }
      ]
    }]
  },

  'features-section': {
    id: 'features-section',
    name: 'Features',
    category: 'content',
    layout: 'three-column',
    areas: [
      {
        id: 'feature-1',
        maxWidgets: 2,
        widgets: [
          {
            id: 'feature-text-1',
            type: 'text',
            content: '<h3>Advanced Analytics</h3><p>Comprehensive insights into your publishing metrics and reader engagement patterns.</p>'
          }
        ]
      },
      {
        id: 'feature-2', 
        maxWidgets: 2,
        widgets: [
          {
            id: 'feature-text-2',
            type: 'text',
            content: '<h3>Global Distribution</h3><p>Reach readers worldwide through our extensive network of publishing partners and platforms.</p>'
          }
        ]
      },
      {
        id: 'feature-3',
        maxWidgets: 2, 
        widgets: [
          {
            id: 'feature-text-3',
            type: 'text',
            content: '<h3>Expert Support</h3><p>24/7 technical support from our team of publishing and technology specialists.</p>'
          }
        ]
      }
    ]
  },

  'footer-section': {
    id: 'footer-section',
    name: 'Footer', 
    category: 'content',
    layout: 'four-column',
    areas: [
      {
        id: 'footer-col-1',
        maxWidgets: 3,
        widgets: [
          {
            id: 'footer-text-1',
            type: 'text',
            content: '<h4>Company</h4><p>Leading the future of academic and professional publishing worldwide.</p>'
          }
        ]
      },
      {
        id: 'footer-col-2',
        maxWidgets: 5,
        widgets: [
          {
            id: 'footer-text-2', 
            type: 'text',
            content: '<h4>Quick Links</h4><ul><li><a href="/about">About Us</a></li><li><a href="/contact">Contact</a></li><li><a href="/careers">Careers</a></li></ul>'
          }
        ]
      },
      {
        id: 'footer-col-3',
        maxWidgets: 5,
        widgets: [
          {
            id: 'footer-text-3',
            type: 'text', 
            content: '<h4>Resources</h4><ul><li><a href="/help">Help Center</a></li><li><a href="/api">API Docs</a></li><li><a href="/blog">Blog</a></li></ul>'
          }
        ]
      },
      {
        id: 'footer-col-4',
        maxWidgets: 3,
        widgets: [
          {
            id: 'footer-text-4',
            type: 'text',
            content: '<h4>Follow Us</h4><p>Stay connected through our social media channels and newsletter.</p>'
          }
        ]
      }
    ]
  }
} as const
