# Page Builder - Agent Communication Protocol

> **Document Type:** Architecture & Integration Guide  
> **Version:** 1.0.0  
> **Last Updated:** December 2024  
> **Purpose:** Define information exchange patterns between external agents (e.g., Claude) and the Page Builder system

---

## Overview

This document describes how external AI agents (like Claude) communicate with the Page Builder to create pages. It covers two scenarios:

1. **Agent with Design System Knowledge** - Agent already understands Wiley DS V2 and Foundation tokens
2. **Agent without Design System Knowledge** - Agent needs to discover capabilities first

---

## Scenario 1: Agent Already Knows Design System

**When:** Agent has been provided with design system documentation (Skill docs) in context.

### Sequence Diagram

[View Diagram: Agent Communication - With Design System Knowledge](https://www.figma.com/online-whiteboard/create-diagram/30c9faf5-eff4-45de-92b7-e5b4117a1473?utm_source=chatgpt&utm_content=edit_in_figjam&oai_id=&request_id=d525c7a8-797e-462d-a1f2-5c30096c73db)

### Information Exchange

| Step | From | To | Information | Format |
|------|------|-----|-------------|--------|
| 1 | User | Agent | Page creation request | Natural language |
| 2 | Agent | Page Builder | Page JSON with theme + widgets | JSON payload |
| 3 | Page Builder | Theme Adapter | Theme ID + brand mode | Function call |
| 4 | Theme Adapter | Page Builder | Resolved Foundation tokens | Token map |
| 5 | Page Builder | Renderer | Canvas items + theme | Internal state |
| 6 | Renderer | User | Rendered HTML | HTML output |

### What Agent Sends

```json
{
  "theme": "wiley-figma-ds-v2",
  "sections": [
    {
      "id": "hero-section",
      "type": "hero",
      "background": {
        "type": "gradient",
        "gradient": {
          "type": "linear",
          "stops": [
            { "color": "semantic.primary", "position": "0%" },
            { "color": "semantic.accent", "position": "100%" }
          ]
        }
      },
      "areas": [
        {
          "widgets": [
            {
              "type": "heading",
              "text": "Journal Title",
              "level": 1,
              "typographyStyle": "h1",
              "color": "semantic.text.primary"
            }
          ]
        }
      ]
    }
  ]
}
```

### Key Points

- **Minimal Exchange**: Agent uses semantic tokens (`semantic.primary`, `semantic.text.primary`) that it already understands
- **No Discovery Needed**: Agent doesn't query for capabilities
- **Token Resolution**: Page Builder resolves tokens to actual values via Theme Adapter
- **Efficient**: Single request-response cycle

---

## Scenario 2: Agent Without Design System Knowledge

**When:** Agent encounters Page Builder for the first time or needs to refresh understanding.

### Sequence Diagram

[View Diagram: Agent Communication - Without Design System Knowledge](https://www.figma.com/online-whiteboard/create-diagram/3d459c34-5015-4915-8a75-1bfe54833280?utm_source=chatgpt&utm_content=edit_in_figjam&oai_id=&request_id=2488402d-cd69-4266-a2ee-4b2c6430e1d7)

### Information Exchange

| Step | From | To | Information | Format |
|------|------|-----|-------------|--------|
| 1 | User | Agent | Page creation request | Natural language |
| 2 | Agent | Page Builder | Capability discovery query | API request |
| 3 | Page Builder | Agent | Available themes, tokens, widgets | JSON response |
| 4 | Agent | Skill Docs | Documentation fetch request | File access |
| 5 | Skill Docs | Agent | Complete widget reference + examples | Markdown docs |
| 6 | Agent | Page Builder | Page JSON with theme + widgets | JSON payload |
| 7 | Page Builder | Theme Adapter | Theme ID + brand mode | Function call |
| 8 | Theme Adapter | Page Builder | Resolved Foundation tokens | Token map |
| 9 | Page Builder | Renderer | Canvas items + theme | Internal state |
| 10 | Renderer | User | Rendered HTML | HTML output |

### Capability Discovery Response

```json
{
  "themes": [
    {
      "id": "wiley-figma-ds-v2",
      "name": "Wiley Design System V2",
      "version": "2.0",
      "description": "Wiley's official design system with multi-brand support",
      "brandModes": ["wiley", "wt", "dummies"],
      "supportedTokens": {
        "colors": ["semantic.primary", "semantic.accent", "semantic.text.*"],
        "typography": ["h1-h6", "body-xl", "body-lg", "body", "body-sm", "body-xs"],
        "spacing": ["semantic.xs", "semantic.sm", "semantic.md", "semantic.lg", "semantic.xl", "semantic.2xl", "semantic.3xl"]
      }
    },
    {
      "id": "classic-ux3-theme",
      "name": "Classic UX3",
      "version": "3.0"
    },
    {
      "id": "ibm-carbon-ds",
      "name": "IBM Carbon Design System",
      "version": "11.0"
    },
    {
      "id": "ant-design",
      "name": "Ant Design",
      "version": "5.0"
    }
  ],
  "foundationTokens": {
    "colors": {
      "semantic": {
        "primary": {
          "light": "#00d875",
          "dark": "#008f8a",
          "description": "Primary brand color (green for Wiley)"
        },
        "accent": {
          "light": "#008f8a",
          "dark": "#00d875",
          "description": "Accent color (teal for Wiley)"
        },
        "text": {
          "primary": "#1a1a1a",
          "secondary": "#666666",
          "description": "Text colors for light backgrounds"
        }
      }
    },
    "typography": {
      "h1": {
        "desktop": { "size": "48px", "lineHeight": "1.2", "weight": "700" },
        "mobile": { "size": "36px", "lineHeight": "1.2", "weight": "700" }
      },
      "body-xl": {
        "desktop": { "size": "20px", "lineHeight": "1.6", "weight": "400" },
        "mobile": { "size": "18px", "lineHeight": "1.6", "weight": "400" }
      }
    },
    "spacing": {
      "semantic": {
        "xs": "4px",
        "sm": "8px",
        "md": "16px",
        "lg": "24px",
        "xl": "32px",
        "2xl": "48px",
        "3xl": "64px"
      }
    }
  },
  "widgets": [
    {
      "type": "heading",
      "properties": ["text", "level", "align", "typographyStyle", "color", "skin"],
      "documentation": "PageBuilder-Widgets-Skill.md#heading-widget"
    },
    {
      "type": "text",
      "properties": ["text", "align", "typographyStyle", "color", "skin"],
      "documentation": "PageBuilder-Widgets-Skill.md#text-widget"
    }
  ],
  "skillDocs": [
    {
      "name": "PageBuilder-Widgets-Skill.md",
      "description": "Complete widget reference with all properties and examples",
      "url": "/docs/PageBuilder-Widgets-Skill.md"
    },
    {
      "name": "PageBuilder-Page-Examples-Skill.md",
      "description": "Complete page examples for common academic publishing page types",
      "url": "/docs/PageBuilder-Page-Examples-Skill.md"
    },
    {
      "name": "PageBuilder-Best-Practices-Skill.md",
      "description": "Guidelines and patterns for creating effective pages",
      "url": "/docs/PageBuilder-Best-Practices-Skill.md"
    }
  ]
}
```

### Key Points

- **Discovery Phase**: Agent queries for available capabilities before creating pages
- **Documentation Fetch**: Agent retrieves Skill docs to understand widget structure
- **Token Understanding**: Agent learns Foundation token structure and semantic mappings
- **Multi-Step Flow**: Requires capability query → documentation → page creation

---

## Foundation Token Architecture

Both scenarios rely on the **Foundation Design System** - a universal token contract.

### 3-Layer Token System

```
Layer 1: Foundation (Raw Values)
├── colors (scales: gray, purple, teal, blue, green, red, yellow)
├── typography (families, weights, sizes with desktop/mobile breakpoints)
└── spacing (base scale 0-10, semantic xs-3xl)

Layer 2: Semantic (Purpose-Mapped)
├── interactive (primary, secondary, accent with hover/active states)
├── text (primary, secondary, muted, inverse)
└── background (paper, surface, overlay)

Layer 3: Component (Widget-Specific)
├── button (borderRadius, padding, variants)
├── card (borderRadius, padding, shadow)
└── input (borderRadius, padding, focus states)
```

### Token Resolution Flow

1. **Agent writes**: `"color": "semantic.primary"`
2. **Theme Adapter maps**: `semantic.primary` → `foundation.green.600` (Wiley brand)
3. **Renderer resolves**: `foundation.green.600` → `#00d875` (actual hex value)
4. **CSS applied**: `color: #00d875;`

---

## API Endpoints (Proposed)

### GET /api/capabilities

Returns available themes, tokens, widgets, and documentation links.

**Response:** See "Capability Discovery Response" above.

### GET /api/themes/{themeId}/tokens

Returns full token structure for a specific theme.

**Example Request:**
```
GET /api/themes/wiley-figma-ds-v2/tokens?brandMode=wiley
```

**Example Response:**
```json
{
  "theme": "wiley-figma-ds-v2",
  "brandMode": "wiley",
  "tokens": {
    "foundation": { ... },
    "semantic": { ... },
    "components": { ... }
  }
}
```

### POST /api/pages/create

Creates a new page with the provided JSON structure.

**Request Body:**
```json
{
  "websiteId": "abc123",
  "pageId": "home",
  "theme": "wiley-figma-ds-v2",
  "brandMode": "wiley",
  "sections": [ ... ]
}
```

---

## Recommendations

### For Agents with Design System Knowledge

- **Pre-load Skill docs** in agent context before page creation requests
- **Use semantic tokens** (`semantic.primary`) instead of hardcoded values
- **Reference examples** from `PageBuilder-Page-Examples-Skill.md` for common patterns

### For Agents without Design System Knowledge

- **Always query capabilities first** before attempting page creation
- **Fetch Skill docs** to understand widget structure and properties
- **Use theme declaration** at the top level of page JSON
- **Leverage Foundation tokens** for consistency across themes

### For Page Builder System

- **Provide capability discovery endpoint** for agent onboarding
- **Maintain Skill docs** as source of truth for widget properties
- **Document token resolution** so agents understand the mapping flow
- **Version Skill docs** to track changes and ensure compatibility

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Dec 2024 | Initial documentation with two communication scenarios |

---

## Related Documentation

- `PageBuilder-Widgets-Skill.md` - Complete widget reference
- `PageBuilder-Page-Examples-Skill.md` - Page examples and patterns
- `PageBuilder-Best-Practices-Skill.md` - Guidelines and anti-patterns
- `HANDOFF_DOCUMENTATION.md` - Internal architecture documentation

