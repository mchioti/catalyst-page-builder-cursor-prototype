# Page Builder - Complete Page Examples

> **Skill Type:** Reference Examples  
> **Version:** 1.1.0  
> **Last Updated:** December 2024  
> **Theme:** Wiley DS V2 (`wiley-figma-ds-v2`)  
> **Companion Docs:** 
> - `PageBuilder-Widgets-Skill.md` (Widget Reference)
> - `PageBuilder-Best-Practices-Skill.md` (Guidance)

---

## Purpose

This document provides **complete, working page examples** for common academic publishing page types. Use these as templates when generating Page Builder JSON.

---

## Theme Declaration

**All pages should start with a theme declaration:**

```json
{
  "theme": "wiley-figma-ds-v2",
  "sections": [
    // ... page sections go here
  ]
}
```

The examples below show the `sections` array content. Wrap them in the theme declaration structure above.

---

## Example 1: Journal Home Page

A journal homepage displays the journal identity, navigation, and latest articles.

**Key Widgets Used:**
- `HeadingWidget` - Journal title
- `TextWidget` - Journal description
- `MenuWidget` - Journal navigation
- `PublicationListWidget` - Latest articles
- `ButtonWidget` - CTAs to current issue, all issues

```json
[
  {
    "id": "journal-hero-section",
    "name": "Journal Hero",
    "type": "hero",
    "layout": "hero-with-buttons",
    "background": {
      "type": "gradient",
      "gradient": {
        "type": "linear",
        "direction": "to bottom",
        "stops": [
          { "color": "#6366f1", "position": "0%" },
          { "color": "#818cf8", "position": "100%" }
        ]
      }
    },
    "contentMode": "dark",
    "styling": {
      "paddingTop": "large",
      "paddingBottom": "large",
      "paddingLeft": "medium",
      "paddingRight": "medium"
    },
    "areas": [
      {
        "id": "hero-content",
        "name": "Hero Content",
        "widgets": [
          {
            "id": "journal-title",
            "type": "heading",
            "skin": "minimal",
            "text": "Advanced Materials",
            "level": 1,
            "align": "center",
            "style": "hero"
          },
          {
            "id": "journal-description",
            "type": "text",
            "skin": "minimal",
            "text": "A leading journal for materials science, publishing cutting-edge research across all areas of materials.",
            "align": "center",
            "typographyStyle": "body-lg"
          }
        ]
      },
      {
        "id": "hero-buttons",
        "name": "Button Row",
        "widgets": [
          {
            "id": "current-issue-btn",
            "type": "button",
            "skin": "minimal",
            "text": "Current Issue",
            "href": "/journal/advma/toc/current",
            "style": "solid",
            "color": "color1",
            "size": "large"
          },
          {
            "id": "all-issues-btn",
            "type": "button",
            "skin": "minimal",
            "text": "All Issues",
            "href": "/journal/advma/loi",
            "style": "outline",
            "color": "color1",
            "size": "large"
          }
        ]
      }
    ]
  },
  {
    "id": "journal-nav-section",
    "name": "Journal Navigation",
    "type": "content-block",
    "layout": "one-column",
    "background": { "type": "color", "color": "#f1f5f9" },
    "contentMode": "light",
    "styling": {
      "paddingTop": "small",
      "paddingBottom": "small",
      "paddingLeft": "medium",
      "paddingRight": "medium"
    },
    "areas": [
      {
        "id": "nav-area",
        "name": "Navigation",
        "widgets": [
          {
            "id": "journal-menu",
            "type": "menu",
            "skin": "minimal",
            "menuType": "custom",
            "style": "horizontal",
            "align": "left",
            "items": [
              { "id": "nav-home", "label": "Home", "url": "/journal/advma", "target": "_self", "displayCondition": "always", "order": 0 },
              { "id": "nav-current", "label": "Current Issue", "url": "/journal/advma/toc/current", "target": "_self", "displayCondition": "always", "order": 1 },
              { "id": "nav-archive", "label": "All Issues", "url": "/journal/advma/loi", "target": "_self", "displayCondition": "always", "order": 2 },
              { "id": "nav-about", "label": "About", "url": "/journal/advma/about", "target": "_self", "displayCondition": "always", "order": 3 },
              { "id": "nav-submit", "label": "Submit", "url": "/journal/advma/submit", "target": "_self", "displayCondition": "always", "order": 4 }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "latest-articles-section",
    "name": "Latest Articles",
    "type": "content-block",
    "layout": "one-column",
    "background": { "type": "color", "color": "#ffffff" },
    "contentMode": "light",
    "styling": {
      "paddingTop": "large",
      "paddingBottom": "large",
      "paddingLeft": "medium",
      "paddingRight": "medium"
    },
    "areas": [
      {
        "id": "articles-area",
        "name": "Content",
        "widgets": [
          {
            "id": "articles-heading",
            "type": "heading",
            "skin": "minimal",
            "text": "Latest Articles",
            "level": 2,
            "align": "left"
          },
          {
            "id": "articles-list",
            "type": "publication-list",
            "skin": "minimal",
            "contentSource": "dynamic-query",
            "layout": "list",
            "maxItems": 5,
            "cardConfig": {
              "showContentTypeLabel": true,
              "showTitle": true,
              "showAuthors": true,
              "authorStyle": "abbreviated",
              "showAbstract": true,
              "abstractLength": "medium",
              "showPublicationDate": true,
              "showAccessStatus": true,
              "showDOI": true
            }
          }
        ]
      }
    ]
  },
  {
    "id": "cta-section",
    "name": "Submit Your Research",
    "type": "content-block",
    "layout": "one-column",
    "background": { "type": "color", "color": "#f8fafc" },
    "contentMode": "light",
    "styling": {
      "paddingTop": "large",
      "paddingBottom": "large",
      "centerContent": true
    },
    "areas": [
      {
        "id": "cta-area",
        "name": "CTA",
        "widgets": [
          {
            "id": "cta-heading",
            "type": "heading",
            "skin": "minimal",
            "text": "Submit Your Research",
            "level": 2,
            "align": "center"
          },
          {
            "id": "cta-text",
            "type": "text",
            "skin": "minimal",
            "text": "Advanced Materials welcomes submissions from researchers worldwide. Our rigorous peer review ensures the highest quality publications.",
            "align": "center",
            "typographyStyle": "body-md"
          },
          {
            "id": "cta-button",
            "type": "button",
            "skin": "minimal",
            "text": "Author Guidelines",
            "href": "/journal/advma/submit",
            "style": "solid",
            "color": "color1",
            "size": "large"
          }
        ]
      }
    ]
  }
]
```

---

## Example 2: Issue Table of Contents (TOC)

An issue TOC page displays issue metadata and lists all articles in the issue.

**Key Widgets Used:**
- `PublicationDetailsWidget` - Issue/volume metadata (hero display)
- `PublicationListWidget` - Articles in the issue
- `MenuWidget` - Journal navigation
- `ButtonWidget` - Download issue, alerts

```json
[
  {
    "id": "toc-banner-section",
    "name": "Issue Banner",
    "type": "hero",
    "layout": "one-column",
    "background": {
      "type": "gradient",
      "gradient": {
        "type": "linear",
        "direction": "to right",
        "stops": [
          { "color": "#111827", "position": "0%" },
          { "color": "#1f2937", "position": "50%" },
          { "color": "#111827", "position": "100%" }
        ]
      }
    },
    "contentMode": "dark",
    "styling": {
      "paddingTop": "large",
      "paddingBottom": "large",
      "paddingLeft": "medium",
      "paddingRight": "medium"
    },
    "areas": [
      {
        "id": "banner-content",
        "name": "Issue Metadata",
        "widgets": [
          {
            "id": "issue-details",
            "type": "publication-details",
            "skin": "minimal",
            "contentSource": "context",
            "layout": "hero",
            "publication": {
              "@type": "PublicationIssue",
              "issueNumber": "12",
              "volumeNumber": "67",
              "datePublished": "2024-12-01",
              "name": "Volume 67 • Issue 12",
              "isPartOf": {
                "@type": "Periodical",
                "name": "Advanced Materials",
                "issn": "0935-9648"
              }
            },
            "cardConfig": {
              "showTitle": true,
              "showPublicationTitle": true,
              "showVolumeIssue": true,
              "showPublicationDate": true,
              "showDOI": false,
              "showAuthors": false,
              "showAbstract": false,
              "titleStyle": "large"
            }
          }
        ]
      },
      {
        "id": "banner-actions",
        "name": "Actions",
        "widgets": [
          {
            "id": "download-issue-btn",
            "type": "button",
            "skin": "minimal",
            "text": "Download Issue PDF",
            "href": "#download",
            "style": "solid",
            "color": "color1",
            "size": "medium"
          },
          {
            "id": "alert-btn",
            "type": "button",
            "skin": "minimal",
            "text": "Get New Issue Alerts",
            "href": "#alerts",
            "style": "outline",
            "color": "color1",
            "size": "medium"
          }
        ]
      }
    ]
  },
  {
    "id": "toc-nav-section",
    "name": "Issue Navigation",
    "type": "content-block",
    "layout": "one-column",
    "background": { "type": "color", "color": "#f1f5f9" },
    "contentMode": "light",
    "styling": {
      "paddingTop": "small",
      "paddingBottom": "small"
    },
    "areas": [
      {
        "id": "nav-area",
        "name": "Navigation",
        "widgets": [
          {
            "id": "toc-menu",
            "type": "menu",
            "skin": "minimal",
            "menuType": "custom",
            "style": "horizontal",
            "items": [
              { "id": "nav-journal", "label": "← Back to Journal", "url": "/journal/advma", "target": "_self", "displayCondition": "always", "order": 0 },
              { "id": "nav-prev", "label": "Previous Issue", "url": "/journal/advma/toc/2024/11", "target": "_self", "displayCondition": "always", "order": 1 },
              { "id": "nav-next", "label": "Next Issue", "url": "/journal/advma/toc/2025/1", "target": "_self", "displayCondition": "always", "order": 2 }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "toc-articles-section",
    "name": "Articles in This Issue",
    "type": "content-block",
    "layout": "one-column",
    "background": { "type": "color", "color": "#ffffff" },
    "contentMode": "light",
    "styling": {
      "paddingTop": "large",
      "paddingBottom": "large",
      "paddingLeft": "medium",
      "paddingRight": "medium"
    },
    "areas": [
      {
        "id": "articles-area",
        "name": "Articles",
        "widgets": [
          {
            "id": "articles-heading",
            "type": "heading",
            "skin": "minimal",
            "text": "In This Issue",
            "level": 2,
            "align": "left"
          },
          {
            "id": "issue-articles",
            "type": "publication-list",
            "skin": "minimal",
            "contentSource": "context",
            "layout": "list",
            "cardConfig": {
              "showContentTypeLabel": true,
              "showTitle": true,
              "showAuthors": true,
              "authorStyle": "full",
              "showAbstract": true,
              "abstractLength": "short",
              "showPublicationDate": false,
              "showAccessStatus": true,
              "showDOI": true,
              "showThumbnail": true,
              "thumbnailPosition": "left"
            }
          }
        ]
      }
    ]
  }
]
```

---

## Example 3: Article Browse Page (Grid Layout)

A page displaying articles in a grid layout, often used for search results or collection pages.

**Key Widgets Used:**
- `HeadingWidget` - Page title
- `TextWidget` - Description
- `PublicationListWidget` - Articles in grid layout

```json
[
  {
    "id": "browse-header-section",
    "name": "Page Header",
    "type": "content-block",
    "layout": "one-column",
    "background": { "type": "color", "color": "#ffffff" },
    "contentMode": "light",
    "styling": {
      "paddingTop": "large",
      "paddingBottom": "medium",
      "centerContent": true
    },
    "areas": [
      {
        "id": "header-area",
        "name": "Header",
        "widgets": [
          {
            "id": "page-title",
            "type": "heading",
            "skin": "minimal",
            "text": "Climate Science Collection",
            "level": 1,
            "align": "center"
          },
          {
            "id": "page-description",
            "type": "text",
            "skin": "minimal",
            "text": "Explore our curated collection of climate science research, featuring the latest findings on climate change, sustainability, and environmental science.",
            "align": "center",
            "typographyStyle": "body-lg",
            "inlineStyles": "max-width: 720px; margin: 0 auto;"
          }
        ]
      }
    ]
  },
  {
    "id": "browse-grid-section",
    "name": "Articles Grid",
    "type": "content-block",
    "layout": "one-column",
    "background": { "type": "color", "color": "#f8fafc" },
    "contentMode": "light",
    "styling": {
      "paddingTop": "medium",
      "paddingBottom": "large",
      "paddingLeft": "medium",
      "paddingRight": "medium"
    },
    "areas": [
      {
        "id": "grid-area",
        "name": "Articles",
        "widgets": [
          {
            "id": "articles-grid",
            "type": "publication-list",
            "skin": "minimal",
            "contentSource": "doi-list",
            "doiListSource": {
              "dois": [
                "10.1002/climate.2024.001",
                "10.1002/climate.2024.002",
                "10.1002/climate.2024.003",
                "10.1002/climate.2024.004",
                "10.1002/climate.2024.005",
                "10.1002/climate.2024.006"
              ]
            },
            "layout": "grid",
            "cardConfig": {
              "showContentTypeLabel": true,
              "showTitle": true,
              "showAuthors": true,
              "authorStyle": "abbreviated",
              "showAbstract": true,
              "abstractLength": "short",
              "showThumbnail": true,
              "thumbnailPosition": "top",
              "showAccessStatus": true
            }
          }
        ]
      }
    ]
  }
]
```

---

## Example 4: Editorial/About Page

An editorial page with rich text content, suitable for "About the Journal", "Editorial Board", or similar pages.

**Key Widgets Used:**
- `HeadingWidget` - Section titles
- `TextWidget` - Body content
- `ImageWidget` - Photos
- `PublicationListWidget` with Person type - Editorial board members

```json
[
  {
    "id": "about-hero-section",
    "name": "About Hero",
    "type": "hero",
    "layout": "one-column",
    "background": {
      "type": "gradient",
      "gradient": {
        "type": "linear",
        "direction": "135deg",
        "stops": [
          { "color": "#1e3a5f", "position": "0%" },
          { "color": "#2d5a87", "position": "100%" }
        ]
      }
    },
    "contentMode": "dark",
    "styling": {
      "paddingTop": "large",
      "paddingBottom": "large",
      "centerContent": true
    },
    "areas": [
      {
        "id": "hero-area",
        "name": "Hero Content",
        "widgets": [
          {
            "id": "about-title",
            "type": "heading",
            "skin": "minimal",
            "text": "About Advanced Materials",
            "level": 1,
            "align": "center",
            "style": "hero"
          },
          {
            "id": "about-subtitle",
            "type": "text",
            "skin": "minimal",
            "text": "Publishing groundbreaking materials science research since 1989",
            "align": "center",
            "typographyStyle": "body-lg"
          }
        ]
      }
    ]
  },
  {
    "id": "about-content-section",
    "name": "About Content",
    "type": "content-block",
    "layout": "one-column",
    "background": { "type": "color", "color": "#ffffff" },
    "contentMode": "light",
    "styling": {
      "paddingTop": "large",
      "paddingBottom": "large",
      "paddingLeft": "medium",
      "paddingRight": "medium",
      "maxWidth": "7xl",
      "centerContent": true
    },
    "areas": [
      {
        "id": "content-area",
        "name": "Content",
        "widgets": [
          {
            "id": "mission-heading",
            "type": "heading",
            "skin": "minimal",
            "text": "Our Mission",
            "level": 2,
            "align": "left"
          },
          {
            "id": "mission-text",
            "type": "text",
            "skin": "minimal",
            "text": "Advanced Materials publishes peer-reviewed, high-impact research across all areas of materials science. Our mission is to advance the field by disseminating transformative discoveries that shape the future of technology, energy, and healthcare.\n\nWith an Impact Factor of 29.4, Advanced Materials is recognized as one of the most influential journals in materials science, attracting submissions from leading researchers worldwide.",
            "align": "left",
            "typographyStyle": "body-md"
          },
          {
            "id": "spacer-1",
            "type": "spacer",
            "skin": "minimal",
            "height": "2rem"
          },
          {
            "id": "scope-heading",
            "type": "heading",
            "skin": "minimal",
            "text": "Scope & Coverage",
            "level": 2,
            "align": "left"
          },
          {
            "id": "scope-text",
            "type": "text",
            "skin": "minimal",
            "text": "We cover the full spectrum of materials science including:\n\n• Nanomaterials and nanotechnology\n• Polymers and soft materials\n• Energy materials and devices\n• Biomaterials and biomedical applications\n• Electronic and photonic materials\n• Structural materials and composites",
            "align": "left",
            "typographyStyle": "body-md"
          }
        ]
      }
    ]
  },
  {
    "id": "editors-section",
    "name": "Editorial Board",
    "type": "content-block",
    "layout": "one-column",
    "background": { "type": "color", "color": "#f8fafc" },
    "contentMode": "light",
    "styling": {
      "paddingTop": "large",
      "paddingBottom": "large",
      "paddingLeft": "medium",
      "paddingRight": "medium"
    },
    "areas": [
      {
        "id": "editors-area",
        "name": "Editors",
        "widgets": [
          {
            "id": "editors-heading",
            "type": "heading",
            "skin": "minimal",
            "text": "Meet the Editors",
            "level": 2,
            "align": "center"
          },
          {
            "id": "editors-intro",
            "type": "text",
            "skin": "minimal",
            "text": "Our editorial board comprises leading experts from institutions worldwide.",
            "align": "center",
            "typographyStyle": "body-md",
            "inlineStyles": "margin-bottom: 32px;"
          },
          {
            "id": "editors-list",
            "type": "publication-list",
            "skin": "minimal",
            "contentSource": "schema-objects",
            "schemaSource": {
              "selectionType": "by-type",
              "selectedType": "Person"
            },
            "layout": "grid",
            "cardConfig": {
              "showTitle": true,
              "showThumbnail": true,
              "thumbnailPosition": "top"
            }
          }
        ]
      }
    ]
  }
]
```

---

## Example 5: Generic Landing Page

A general-purpose landing page with hero, features grid, and footer. Useful for non-academic pages or marketing content.

**Key Widgets Used:**
- `HeadingWidget` - Page titles
- `TextWidget` - Body content
- `EditorialCardWidget` - Feature cards
- `MenuWidget` - Footer navigation
- `SpacerWidget` - Visual rhythm

```json
[
  {
    "id": "hero-section",
    "name": "Hero Banner",
    "type": "hero",
    "layout": "one-column",
    "background": {
      "type": "gradient",
      "gradient": {
        "type": "linear",
        "direction": "135deg",
        "stops": [
          { "color": "#003b44", "position": "0%" },
          { "color": "#007a8b", "position": "100%" }
        ]
      }
    },
    "contentMode": "dark",
    "styling": { "paddingTop": "96px", "paddingBottom": "96px", "centerContent": true },
    "areas": [{
      "id": "hero-content",
      "name": "Content",
      "widgets": [
        { "id": "hero-heading", "type": "heading", "text": "Welcome to Our Platform", "level": 1, "style": "hero", "align": "center", "skin": "minimal" },
        { "id": "hero-spacer-1", "type": "spacer", "height": "1.5rem", "skin": "minimal" },
        { "id": "hero-description", "type": "text", "text": "Discover powerful tools and resources to accelerate your research and drive innovation.", "align": "center", "typographyStyle": "body-lg", "skin": "minimal" },
        { "id": "hero-spacer-2", "type": "spacer", "height": "2rem", "skin": "minimal" },
        { "id": "hero-cta", "type": "button", "text": "Get Started", "href": "/start", "style": "solid", "color": "color1", "size": "large", "skin": "minimal" }
      ]
    }]
  },
  {
    "id": "features-header-section",
    "name": "Features Header",
    "type": "content-block",
    "layout": "one-column",
    "background": { "type": "color", "color": "#ffffff" },
    "contentMode": "light",
    "styling": { "paddingTop": "64px", "paddingBottom": "24px", "maxWidth": "7xl", "centerContent": true },
    "areas": [{
      "id": "features-header",
      "name": "Header",
      "widgets": [
        { "id": "features-eyebrow", "type": "text", "text": "Our Features", "align": "center", "typographyStyle": "body-sm", "inlineStyles": "text-transform: uppercase; letter-spacing: 0.1em; color: #00bfb1;", "skin": "minimal" },
        { "id": "features-title", "type": "heading", "text": "What We Offer", "level": 2, "align": "center", "style": "default", "skin": "minimal" }
      ]
    }]
  },
  {
    "id": "features-grid-section",
    "name": "Features Grid",
    "type": "content-block",
    "layout": "grid",
    "gridConfig": { "columns": 3, "gap": "1.5rem", "alignItems": "stretch" },
    "background": { "type": "color", "color": "#ffffff" },
    "contentMode": "light",
    "styling": { "paddingTop": "0", "paddingBottom": "64px", "maxWidth": "7xl", "centerContent": true },
    "areas": [{
      "id": "features-cards",
      "name": "Cards",
      "widgets": [
        {
          "id": "feature-card-1",
          "type": "editorial-card",
          "layout": "color-block",
          "skin": "modern",
          "content": {
            "preheader": { "enabled": false, "text": "" },
            "headline": { "enabled": true, "text": "Advanced Search" },
            "description": { "enabled": true, "text": "Find exactly what you need with powerful search and filtering capabilities." },
            "callToAction": { "enabled": true, "text": "Learn More", "url": "/features/search", "type": "link" }
          },
          "image": { "src": "https://picsum.photos/seed/search/400/300", "alt": "Search feature" },
          "config": { "contentAlignment": "center", "imagePosition": "top", "useAccentColor": true }
        },
        {
          "id": "feature-card-2",
          "type": "editorial-card",
          "layout": "color-block",
          "skin": "modern",
          "content": {
            "preheader": { "enabled": false, "text": "" },
            "headline": { "enabled": true, "text": "Collaboration Tools" },
            "description": { "enabled": true, "text": "Work together seamlessly with integrated collaboration features." },
            "callToAction": { "enabled": true, "text": "Learn More", "url": "/features/collaboration", "type": "link" }
          },
          "image": { "src": "https://picsum.photos/seed/collab/400/300", "alt": "Collaboration feature" },
          "config": { "contentAlignment": "center", "imagePosition": "top", "useAccentColor": true }
        },
        {
          "id": "feature-card-3",
          "type": "editorial-card",
          "layout": "color-block",
          "skin": "modern",
          "content": {
            "preheader": { "enabled": false, "text": "" },
            "headline": { "enabled": true, "text": "Analytics Dashboard" },
            "description": { "enabled": true, "text": "Track performance and gain insights with comprehensive analytics." },
            "callToAction": { "enabled": true, "text": "Learn More", "url": "/features/analytics", "type": "link" }
          },
          "image": { "src": "https://picsum.photos/seed/analytics/400/300", "alt": "Analytics feature" },
          "config": { "contentAlignment": "center", "imagePosition": "top", "useAccentColor": true }
        }
      ]
    }]
  },
  {
    "id": "footer-section",
    "name": "Footer",
    "type": "content-block",
    "layout": "grid",
    "gridConfig": { "columns": 4, "gap": "2rem", "alignItems": "start" },
    "background": { "type": "color", "color": "#1a1a1a" },
    "contentMode": "dark",
    "styling": { "paddingTop": "64px", "paddingBottom": "32px", "maxWidth": "7xl", "centerContent": true },
    "areas": [{
      "id": "footer-content",
      "name": "Footer Links",
      "widgets": [
        { "id": "footer-company-heading", "type": "text", "text": "<strong>Company</strong>", "align": "left", "skin": "minimal" },
        {
          "id": "footer-company-menu",
          "type": "menu",
          "menuType": "custom",
          "style": "vertical",
          "skin": "minimal",
          "items": [
            { "id": "menu-about", "label": "About", "url": "/about", "target": "_self", "displayCondition": "always", "order": 0 },
            { "id": "menu-careers", "label": "Careers", "url": "/careers", "target": "_self", "displayCondition": "always", "order": 1 },
            { "id": "menu-contact", "label": "Contact", "url": "/contact", "target": "_self", "displayCondition": "always", "order": 2 }
          ]
        },
        { "id": "footer-resources-heading", "type": "text", "text": "<strong>Resources</strong>", "align": "left", "skin": "minimal" },
        {
          "id": "footer-resources-menu",
          "type": "menu",
          "menuType": "custom",
          "style": "vertical",
          "skin": "minimal",
          "items": [
            { "id": "menu-docs", "label": "Documentation", "url": "/docs", "target": "_self", "displayCondition": "always", "order": 0 },
            { "id": "menu-support", "label": "Support", "url": "/support", "target": "_self", "displayCondition": "always", "order": 1 },
            { "id": "menu-blog", "label": "Blog", "url": "/blog", "target": "_self", "displayCondition": "always", "order": 2 }
          ]
        }
      ]
    }]
  }
]
```

---

## Key Patterns Summary

### Publication List Configurations

| Page Type | `contentSource` | `layout` | Key `cardConfig` |
|-----------|-----------------|----------|------------------|
| Journal Home | `dynamic-query` | `list` | authors, abstract, date |
| Issue TOC | `context` | `list` | thumbnail, authors, DOI |
| Collection/Browse | `doi-list` | `grid` | thumbnail top, short abstract |
| Search Results | `dynamic-query` | `list` | highlight matches |

### Publication Details Configurations

| Page Type | `contentSource` | `layout` | Key `cardConfig` |
|-----------|-----------------|----------|------------------|
| Issue Banner | `context` | `hero` | title, volume/issue, date |
| Article Page | `context` or `doi` | `default` | full metadata |
| Featured Article | `doi` | `hero` | thumbnail, abstract |

### Content Mode Reminder

| Background | `contentMode` |
|------------|---------------|
| White/Light | `"light"` |
| Dark/Black | `"dark"` |
| Brand gradient (dark) | `"dark"` |
| Light gray | `"light"` |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.1.0 | Dec 2024 | Added theme declaration, standardized on Wiley DS V2 |
| 1.0.0 | Dec 2024 | Initial release with 5 page examples (Journal Home, TOC, Browse, About, Landing) |

