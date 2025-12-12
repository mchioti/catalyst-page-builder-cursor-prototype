# Page Builder Best Practices

> **Skill Type:** Domain Knowledge  
> **Version:** 1.1.0  
> **Last Updated:** December 2024  
> **Theme:** Wiley DS V2 (`wiley-figma-ds-v2`)  
> **Companion Docs:** 
> - `PageBuilder-Widgets-Skill.md` (Widget Reference)
> - `PageBuilder-Page-Examples-Skill.md` (Complete Page Examples)

---

## Purpose of This Document

This document provides guidance for generating Page Builder JSON. It covers:
- What the Page Builder is designed for
- What it can and cannot do
- Best practices for creating effective mockups
- When and how to use placeholders

**This is knowledge, not a persona.** Apply these principles within whatever context you're operating.

---

## Theme Declaration

**Always specify the theme at the top of your page JSON:**

```json
{
  "theme": "wiley-figma-ds-v2",
  "sections": [
    // ... your sections here
  ]
}
```

This tells the Page Builder which design system values to use for colors, typography, and spacing.

---

## What the Page Builder Is

The Page Builder is a **visual mockup and content layout tool**. It allows rapid creation of web page structures using:
- Pre-defined widget types (text, headings, buttons, menus, cards, etc.)
- Section layouts (one-column, two-columns, grid, flexible)
- Foundation Design System tokens (colors, typography, spacing)

### Key Insight: Mockups First, Production Later

The Page Builder is optimized for **exploration and iteration**, not final production. Pages created here are:
- Starting points for discussion
- Visual representations of ideas
- Structured content that can be refined

Perfection is not the goal. Communication is.

---

## What the Page Builder CAN Do Well

### ✅ Content Structure
- Organize content into logical sections
- Create visual hierarchy with headings and typography
- Establish page flow (hero → content → CTA → footer)

### ✅ Layout Composition
- Grid layouts for cards, features, stats
- Flexible layouts for navigation bars, footers
- Multi-column layouts for content + sidebar

### ✅ Visual Elements
- Editorial cards with images, headlines, descriptions
- Buttons and calls-to-action
- Navigation menus (horizontal, vertical)
- Images with various display options
- Spacers and dividers for rhythm

### ✅ Design System Integration
- Typography tokens (`body-lg`, `heading-h2`, etc.)
- Background colors and gradients
- Content modes (light/dark) for text color control

---

## What the Page Builder CANNOT Do

These features require backend integration or are outside the Page Builder's scope:

### ❌ Functional Forms
- Search inputs that query a database
- Newsletter signup that submits to a service
- Contact forms that send emails
- Login/authentication flows

### ❌ Dynamic Content
- Real-time data fetching
- User-specific content
- Content that changes based on state

### ❌ Interactive Components
- Video players with playback controls
- Carousels/sliders with navigation
- Modal dialogs
- Accordions with JavaScript behavior

### ❌ Third-Party Integrations
- Social media feeds
- Maps
- Chat widgets
- Analytics dashboards

---

## Working With Limitations: The Placeholder Pattern

When the Page Builder can't implement something, create a **visual placeholder** instead of trying to hack around the limitation.

### The Right Approach

```json
{
  "id": "search-placeholder",
  "type": "text",
  "skin": "minimal",
  "text": "[Search Bar - Visual placeholder, requires search integration]",
  "align": "center",
  "inlineStyles": "background: #f5f5f5; padding: 16px 24px; border-radius: 8px; color: #737373;"
}
```

**Why this works:**
- Visually indicates where search should go
- Explicitly states it's a placeholder
- Doesn't pretend to be functional
- Easy for humans to identify and replace

### The Wrong Approach

```json
{
  "type": "text",
  "text": "<input type='text' placeholder='Search...'><button>Search</button>"
}
```

**Why this fails:**
- The `<input>` renders but doesn't capture input
- The `<button>` renders but doesn't do anything
- Misleads humans into thinking it works
- Creates technical debt

---

## Placeholder Guidelines

### When to Use Placeholders

| Scenario | Placeholder Text Example |
|----------|-------------------------|
| Search functionality | `[Search - requires integration]` |
| Form submission | `[Newsletter signup - requires form handler]` |
| Video content | `[Video player - embed code needed]` |
| Dynamic data | `[Live feed - API integration required]` |
| User-specific content | `[Personalized content - requires auth]` |

### How to Style Placeholders

Make placeholders visually distinct but representative of the final element:

```json
{
  "type": "text",
  "text": "[Newsletter Signup Form]",
  "align": "center",
  "inlineStyles": "background: rgba(0,0,0,0.05); border: 2px dashed #ccc; padding: 24px; border-radius: 8px; color: #666;"
}
```

The dashed border and muted colors signal "this is a placeholder" while the size/position shows where the real element should go.

---

## Section Composition Guidelines

### Header Sections

Headers typically contain: logo, navigation, search, and action buttons.

**Recommended approach:**
```json
{
  "layout": "flexible",
  "flexConfig": {
    "direction": "row",
    "justifyContent": "space-between",
    "gap": "2rem"
  },
  "areas": [{
    "widgets": [
      { "type": "text", "text": "LOGO" },
      { "type": "menu", "style": "horizontal", "items": [...] },
      { "type": "text", "text": "[Search placeholder]" },
      { "type": "button", "text": "Sign In" }
    ]
  }]
}
```

**Note:** Global headers/footers may be managed separately from page content. Check with the human if headers should be included in page JSON or handled at the site level.

### Hero Sections

Heroes establish the page's primary message.

**Components:**
- Badge/eyebrow text (optional)
- Main heading (h1)
- Supporting description
- Call-to-action buttons
- Background (gradient, image, or color)

**Use `type: "hero"` for hero sections** - this applies special styling.

### Content Sections

For repeating content patterns (cards, features, stats), use:
- `layout: "grid"` with appropriate `gridConfig`
- Consistent widget types across items
- Design system tokens for spacing

### Footer Sections

Footers typically contain multiple areas:
- Brand/about information
- Navigation link groups
- Legal links
- Social media links

**Use multiple sections if needed** - one for main footer content, one for legal/copyright bar.

---

## Typography Best Practices

### Use Tokens, Not Inline Styles

**Do this:**
```json
{
  "type": "text",
  "typographyStyle": "body-lg"
}
```

**Avoid this:**
```json
{
  "type": "text",
  "inlineStyles": "font-size: 18px; line-height: 1.6;"
}
```

### When Inline Styles ARE Acceptable

Use `inlineStyles` for:
- Spacing adjustments (`margin-bottom: 32px`)
- Opacity (`opacity: 0.7`)
- Max-width constraints (`max-width: 640px; margin: 0 auto`)
- Text transforms (`text-transform: uppercase; letter-spacing: 0.1em`)

**Don't use `inlineStyles` for:**
- Font sizes (use `typographyStyle`)
- Colors that should come from the theme
- Layout (use section `layout` and `flexConfig`/`gridConfig`)

---

## Content Mode: Light vs Dark

Sections have a `contentMode` property that controls text color:

| `contentMode` | Text Color | Use When |
|---------------|------------|----------|
| `"light"` | Dark text | Light backgrounds |
| `"dark"` | Light text | Dark backgrounds |

**Always set `contentMode` appropriately for the background.**

Example:
```json
{
  "background": { "type": "color", "color": "#003b44" },
  "contentMode": "dark"
}
```

---

## Menu Widget Patterns

### Horizontal Navigation
```json
{
  "type": "menu",
  "skin": "minimal",
  "style": "horizontal",
  "menuType": "custom",
  "items": [
    { "id": "nav-1", "label": "Home", "url": "/", "target": "_self", "displayCondition": "always", "order": 0 },
    { "id": "nav-2", "label": "About", "url": "/about", "target": "_self", "displayCondition": "always", "order": 1 }
  ]
}
```

### Vertical Footer Links
```json
{
  "type": "menu",
  "style": "vertical",
  "menuType": "custom",
  "items": [...]
}
```

### Menu Items Structure
Every menu item needs:
- `id`: Unique identifier
- `label`: Display text
- `url`: Link destination
- `order`: Sort order (0, 1, 2...)
- `target`: `"_self"` or `"_blank"`
- `displayCondition`: Usually `"always"`

---

## Editorial Card Patterns

For feature cards, article previews, and promotional content:

```json
{
  "type": "editorial-card",
  "skin": "modern",
  "layout": "color-block",
  "content": {
    "preheader": { "enabled": true, "text": "Category" },
    "headline": { "enabled": true, "text": "Card Title" },
    "description": { "enabled": true, "text": "Card description..." },
    "callToAction": { 
      "enabled": true, 
      "text": "Learn more →", 
      "url": "/link",
      "type": "link"
    }
  },
  "image": {
    "src": "https://example.com/image.jpg",
    "alt": "Description"
  }
}
```

---

## Publication Widgets vs Editorial Cards

The Page Builder is designed for **academic publishing websites**. Understanding when to use publication widgets vs general content widgets is important.

### When to Use Publication Widgets

| Scenario | Widget | Why |
|----------|--------|-----|
| Journal homepage with latest articles | `PublicationListWidget` | Fetches real article metadata |
| Curated collection of articles | `PublicationListWidget` | Supports DOI lists |
| Article detail page | `PublicationDetailsWidget` | Shows full article metadata |
| Featured research section | `PublicationListWidget` | Can limit count, show thumbnails |

**Two Options for Mock Data:**

| Option | Content Source | When to Use |
|--------|---------------|-------------|
| **PB generates random content** | `dynamic-query` | Quick placeholders - any articles will do |
| **Claude crafts specific mock content** | `schema-objects` | Claude wants specific titles, authors, abstracts |

**Using `dynamic-query` (PB generates):**
```json
{ "contentSource": "dynamic-query", "maxItems": 5, "cardConfig": {...} }
```

**Using `schema-objects` (Claude provides):**
```json
{ 
  "contentSource": "schema-objects", 
  "publications": [
    { "@type": "ScholarlyArticle", "name": "My Specific Title", ... }
  ]
}
```

**Technical details:** See `PageBuilder-Widgets-Skill.md` for schema.org structure and `cardConfig` properties.

### When to Use Editorial Cards Instead

| Scenario | Widget | Why |
|----------|--------|-----|
| Promotional content | `EditorialCardWidget` | Not tied to DOI/schema |
| Category/subject browse cards | `EditorialCardWidget` | Custom content, not articles |
| Call-to-action blocks | `EditorialCardWidget` or `TextWidget` + `ButtonWidget` | Marketing content |
| News/announcements | `EditorialCardWidget` | Non-scholarly content |

### Key Difference

- **Publication widgets** = structured scholarly data (DOIs, authors, abstracts)
- **Editorial cards** = freeform promotional content (any text, any image, any link)

If the content has a DOI → Publication widget  
If the content is marketing/editorial → Editorial card

---

## Common Anti-Patterns to Avoid

### ❌ Inline HTML for Interactive Elements
Don't put `<input>`, `<button>`, `<form>`, or `<select>` in text widgets. They render but don't function.

### ❌ Recreating Widgets with HTML
Don't use text widgets with complex HTML to recreate buttons, cards, or menus. Use the actual widget types.

### ❌ Hardcoded Colors in Inline Styles
Don't use `color: #003b44` in inline styles if a theme token should control it. The design system exists for consistency.

### ❌ Deeply Nested HTML
Text widgets should contain text content, not entire component trees. If you need complex structure, use multiple widgets in a section.

### ❌ Missing Content Modes
Always pair dark backgrounds with `contentMode: "dark"`. Forgetting this makes text invisible.

---

## Communicating Limitations

When generating a page that requires features the Page Builder doesn't support, be explicit:

**In the JSON itself:**
- Use placeholder text that describes what should be there
- Style placeholders to be visually representative but clearly marked

**In your response:**
- Note which elements are placeholders
- Explain what integration would be needed
- Suggest alternatives if applicable

Example response:
> "I've created the page structure. Note that the hero search bar and newsletter signup are visual placeholders - they'll need form handling integration. The rest of the page is fully functional within the Page Builder."

---

## Summary Checklist

Before finalizing Page Builder JSON:

- [ ] All sections have appropriate `contentMode` for their background
- [ ] Typography uses `typographyStyle` tokens where possible
- [ ] Interactive elements that can't work are marked as placeholders
- [ ] Menu widgets have complete item structures (id, label, url, order)
- [ ] Grid/flex layouts have appropriate configs
- [ ] No functional HTML (`<input>`, `<form>`, `<button>`) in text widgets
- [ ] Placeholders are explicitly labeled as such

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.1.0 | Dec 2024 | Added theme declaration section, standardized on Wiley DS V2, fixed menu item examples |
| 1.0.0 | Dec 2024 | Initial release |

