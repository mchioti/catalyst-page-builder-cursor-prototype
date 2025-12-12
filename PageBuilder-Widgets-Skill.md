---
name: Catalyst Page Builder Widgets
description: Guide for building pages using the Catalyst Page Builder widget library, including widget types, properties, and Foundation Design System token integration.
version: 2.1.0
theme: Wiley DS V2 (wiley-figma-ds-v2)
---

# Catalyst Page Builder - Widget Reference Skill

This Skill provides comprehensive documentation for the Catalyst Page Builder prototype's widget library. Use this when helping users design pages, configure widgets, or understand how design system tokens apply to page elements.

## Overview

The Catalyst Page Builder uses a **section-based architecture** where pages are compositions of sections, and sections contain widgets. Widgets are the atomic building blocks that users can drag into section areas.

**Key Concepts:**
- **Sections**: Layout containers with configurable layouts (grid, flex, columns)
- **Areas**: Simple widget containers inside sections (NO layout properties)
- **Widgets**: Content elements placed within section areas
- **Design Tokens**: Theme-level values (colors, typography, spacing) applied to widgets

---

## ⚠️ CRITICAL RULES - READ FIRST

### Rule 1: Areas DO NOT Have Layouts

**WRONG** - Areas cannot have layout/gridConfig/flexConfig:
```javascript
// ❌ INCORRECT - This will NOT work
{
  type: 'content-block',
  layout: 'one-column',
  areas: [{
    id: 'my-area',
    layout: 'grid',           // ❌ Areas don't support this!
    gridConfig: { ... },      // ❌ Areas don't support this!
    widgets: [...]
  }]
}
```

**RIGHT** - Use multiple sections instead:
```javascript
// ✅ CORRECT - Split into separate sections
// Section 1: Header
{
  type: 'content-block',
  layout: 'one-column',
  areas: [{ widgets: [headerWidgets...] }]
}
// Section 2: Grid content
{
  type: 'content-block',
  layout: 'grid',
  gridConfig: { columns: 4, gap: '1rem' },
  areas: [{ widgets: [gridWidgets...] }]
}
```

### Rule 2: Widget Property Defaults

When a property is not specified, these defaults apply:

| Widget | Property | Default Behavior |
|--------|----------|------------------|
| `heading` | `size` | `'auto'` → Uses semantic level (H1→typo-heading-h1, H2→typo-heading-h2, etc.) |
| `heading` | `style` | `'default'` |
| `text` | `typographyStyle` | `'body-md'` |
| `button` | `style` | `'solid'` |
| `button` | `size` | `'medium'` |

### Rule 3: Required Properties

Every widget MUST have:
- `id`: string (use `nanoid()` for generation)
- `type`: string (widget type identifier)
- `skin`: `'minimal'` (always use this value)

### Rule 4: Schema.org for Publications

Publication widgets use **Schema.org content definitions** stored separately, NOT embedded data. See Publication Widgets section below.

---

## Section Layouts

Sections are the containers that hold widgets. They define the layout structure and can be configured with backgrounds, spacing, and other styling options.

### Available Layout Types

| Layout | Description | Use Case |
|--------|-------------|----------|
| `one-column` | Single column, full width | Simple content, hero sections |
| `two-columns` | Two equal columns (50/50) | Side-by-side content |
| `three-columns` | Three equal columns (33/33/33) | Card grids, features |
| `one-third-left` | Sidebar left (33/67) | Sidebar + main content |
| `one-third-right` | Sidebar right (67/33) | Main content + sidebar |
| `grid` | CSS Grid layout | Complex, responsive grids |
| `flexible` | CSS Flexbox layout | Dynamic, flexible layouts |

---

### Grid Layout Section

**Layout Type:** `grid`
**Description:** CSS Grid-based layout with full control over columns, gaps, and item placement

#### Grid Configuration (`gridConfig`)

| Property | Type | Options | Description |
|----------|------|---------|-------------|
| `columns` | number \| string | `1`-`12`, `auto-fit`, `auto-fill` | Number of columns or auto-responsive |
| `minColumnWidth` | string | `200px`, `250px`, `300px`, etc. | Min width for auto-fit/fill columns |
| `gap` | string | `1rem`, `20px`, `1.5rem` | Gap between all items |
| `rowGap` | string | — | Separate row gap (overrides `gap` for rows) |
| `columnGap` | string | — | Separate column gap (overrides `gap` for columns) |
| `autoFlow` | string | `row`, `column`, `dense`, `row dense`, `column dense` | How items auto-place in grid |
| `alignItems` | string | `start`, `center`, `end`, `stretch` | Vertical alignment of items |
| `justifyItems` | string | `start`, `center`, `end`, `stretch` | Horizontal alignment of items |

#### Widget Grid Placement (`gridSpan`)

Widgets inside grid sections can control their placement:

| Property | Type | Examples | Description |
|----------|------|----------|-------------|
| `gridSpan.column` | string | `span 2`, `1 / 3`, `1 / -1` | Column span or position |
| `gridSpan.row` | string | `span 2`, `2 / 4` | Row span or position |

**Common Column Span Patterns:**
- `span 1` - Single column (default)
- `span 2` - Two columns wide
- `span 3` - Three columns wide
- `1 / -1` - Full width (spans all columns)
- `1 / 3` - From column 1 to column 3

#### Grid Examples

**3-Column Responsive Grid:**
```javascript
{
  layout: 'grid',
  gridConfig: {
    columns: 3,
    gap: '1.5rem',
    alignItems: 'stretch',
    justifyItems: 'stretch'
  }
}
```

**Auto-Fit Responsive Grid:**
```javascript
{
  layout: 'grid',
  gridConfig: {
    columns: 'auto-fit',
    minColumnWidth: '280px',
    gap: '1rem'
  }
}
// Creates as many 280px+ columns as fit, automatically responsive
```

**Featured First Pattern (with Publication List):**
```javascript
// First item spans 2 columns, rest are single column
{
  layout: 'grid',
  gridConfig: { columns: 3, gap: '1rem' },
  areas: [{
    widgets: [{
      type: 'publication-list',
      spanningConfig: {
        enabled: true,
        preset: 'featured-first'  // Pattern: [2, 1, 1] repeating
      }
    }]
  }]
}
```

#### List-Based Widget Spanning Patterns

When list-based widgets (like Publication List) are inside Grid sections, they can use spanning patterns to create varied layouts:

| Preset | Pattern | Description |
|--------|---------|-------------|
| `uniform` | `[1, 1, 1]` | All items equal size |
| `featured-first` | `[2, 1, 1]` | First item double-wide, then repeats |
| `hero-first` | `[3, 1, 1, 1]` | First item spans 3 columns, then repeats |
| `alternating` | `[1, 2, 1]` | Middle item emphasized |
| `masonry` | `[1, 1, 2]` | Staggered emphasis (Pinterest-style) |
| `custom` | User-defined | Define your own pattern array |

**Custom Pattern Example:**
```javascript
{
  type: 'publication-list',
  spanningConfig: {
    enabled: true,
    preset: 'custom',
    customPattern: [2, 1, 1, 2]  // Pattern repeats: 2-wide, 1, 1, 2-wide, ...
  }
}
```

---

### Flexible (Flexbox) Layout Section

**Layout Type:** `flexible`
**Description:** CSS Flexbox-based layout for dynamic, responsive content arrangement

#### Flex Configuration (`flexConfig`)

| Property | Type | Options | Description |
|----------|------|---------|-------------|
| `direction` | string | `row`, `column` | Main axis direction |
| `wrap` | boolean | `true`, `false` | Allow items to wrap to new lines |
| `justifyContent` | string | `flex-start`, `center`, `flex-end` | Main axis alignment |
| `gap` | string | `1rem`, `20px` | Gap between items |

#### Widget Flex Properties (`flexProperties`)

Widgets inside flex sections can control their flex behavior:

| Property | Type | Options | Description |
|----------|------|---------|-------------|
| `flexProperties.grow` | boolean | `true`, `false` | Whether widget grows to fill space |

**Flex Grow Behavior:**
- `grow: false` (default) - Widget takes only its content width
- `grow: true` - Widget expands to fill available space (`flex-grow: 1`)

#### Flex Examples

**Horizontal Row with Centered Items:**
```javascript
{
  layout: 'flexible',
  flexConfig: {
    direction: 'row',
    wrap: true,
    justifyContent: 'center',
    gap: '1rem'
  }
}
```

**Vertical Stack:**
```javascript
{
  layout: 'flexible',
  flexConfig: {
    direction: 'column',
    wrap: false,
    justifyContent: 'flex-start',
    gap: '1.5rem'
  }
}
```

**Two Items - One Fixed, One Grows:**
```javascript
{
  layout: 'flexible',
  flexConfig: { direction: 'row', wrap: false, justifyContent: 'flex-start', gap: '2rem' },
  areas: [{
    widgets: [
      { type: 'image', src: '...', flexProperties: { grow: false } },  // Fixed width
      { type: 'text', text: '...', flexProperties: { grow: true } }    // Fills remaining space
    ]
  }]
}
```

---

### Section Styling Properties

All sections (including Grid and Flex) support these styling options:

#### Background Configuration (`background`)

| Property | Type | Options | Description |
|----------|------|---------|-------------|
| `background.type` | string | `color`, `image`, `gradient`, `none` | Background type |
| `background.color` | string | Hex color | Solid color background |
| `background.opacity` | number | `0`-`1` | Background opacity |

**Image Background:**
| Property | Type | Options |
|----------|------|---------|
| `background.image.url` | string | Image URL |
| `background.image.position` | string | `center`, `top`, `bottom`, `left`, `right`, `cover`, `contain` |
| `background.image.repeat` | string | `no-repeat`, `repeat`, `repeat-x`, `repeat-y` |
| `background.image.size` | string | `cover`, `contain`, `auto`, or custom |

**Gradient Background:**
| Property | Type | Options |
|----------|------|---------|
| `background.gradient.type` | string | `linear`, `radial` |
| `background.gradient.direction` | string | `to right`, `to bottom`, `45deg`, etc. |
| `background.gradient.stops` | array | `[{ color: '#hex', position: '0%' }, ...]` |

#### Styling Configuration (`styling`)

| Property | Type | Options | Description |
|----------|------|---------|-------------|
| `styling.paddingTop` | string | `none`, `small`, `medium`, `large`, or px value | Top padding |
| `styling.paddingBottom` | string | Same as above | Bottom padding |
| `styling.paddingLeft` | string | Same as above | Left padding |
| `styling.paddingRight` | string | Same as above | Right padding |
| `styling.gap` | string | Same as above | Internal gap |
| `styling.minHeight` | string | `500px`, `600px`, `60vh` | Minimum height |
| `styling.variant` | string | `default`, `full-width`, `contained`, `wide` | Width variant |
| `styling.textColor` | string | `default`, `white`, `dark`, `muted` | Text color preset |
| `styling.maxWidth` | string | `none`, `sm`, `md`, `lg`, `xl`, `2xl`, `4xl`, `6xl`, `7xl` | Max width constraint |
| `styling.centerContent` | boolean | — | Center content horizontally |
| `styling.shadow` | string | `none`, `small`, `medium`, `large` | Box shadow |

**Border Configuration (`styling.border`):**
| Property | Type | Options |
|----------|------|---------|
| `styling.border.enabled` | boolean | Enable/disable border |
| `styling.border.color` | string | `default`, `primary`, `accent`, `success`, `warning`, `error` |
| `styling.border.width` | string | `thin`, `medium`, `thick` |
| `styling.border.style` | string | `solid`, `dashed`, `dotted` |
| `styling.border.position` | string | `top`, `bottom`, `left`, `right`, `all` |

#### Content Mode

| Property | Type | Options | Description |
|----------|------|---------|-------------|
| `contentMode` | string | `light`, `dark` | Text color adaptation |

- **`light`**: Dark text (for light backgrounds)
- **`dark`**: White text (for dark backgrounds)

#### Overlay Configuration (`overlay`)

For notification banners, cookie consent, modals:

| Property | Type | Options | Description |
|----------|------|---------|-------------|
| `overlay.enabled` | boolean | — | Enable overlay behavior |
| `overlay.position` | string | `top`, `bottom`, `center` | Overlay position |
| `overlay.behavior` | string | `sticky`, `fixed`, `modal` | Positioning behavior |
| `overlay.dismissible` | boolean | — | Show close button |
| `overlay.showOnLoad` | boolean | — | Show immediately |
| `overlay.backdrop` | boolean | — | Dark backdrop (for modals) |
| `overlay.animation` | string | `none`, `slide`, `fade` | Entry animation |

---

### Complete Section Example

**Hero Section with Gradient Background:**
```javascript
{
  id: 'hero-section',
  name: 'Hero Banner',
  type: 'hero',
  layout: 'one-column',
  
  background: {
    type: 'gradient',
    gradient: {
      type: 'linear',
      direction: 'to bottom right',
      stops: [
        { color: '#667eea', position: '0%' },
        { color: '#764ba2', position: '100%' }
      ]
    }
  },
  
  contentMode: 'dark',  // White text
  
  styling: {
    paddingTop: '96px',
    paddingBottom: '96px',
    minHeight: '600px',
    textColor: 'white',
    centerContent: true
  },
  
  areas: [{
    id: 'main',
    name: 'Content',
    widgets: [
      { type: 'heading', text: 'Welcome', level: 1, style: 'hero', align: 'center' },
      { type: 'text', text: 'Description...', align: 'center', typographyStyle: 'body-lg' },
      { type: 'button', text: 'Get Started', style: 'solid', color: 'color1', size: 'large' }
    ]
  }]
}
```

**3-Column Feature Grid:**
```javascript
{
  id: 'features-grid',
  name: 'Features',
  type: 'content-block',
  layout: 'grid',
  
  gridConfig: {
    columns: 3,
    gap: '2rem',
    alignItems: 'start'
  },
  
  styling: {
    paddingTop: 'large',
    paddingBottom: 'large',
    maxWidth: '6xl',
    centerContent: true
  },
  
  areas: [{
    widgets: [
      // Each card takes 1 column by default
      { type: 'editorial-card', layout: 'color-block', ... },
      { type: 'editorial-card', layout: 'color-block', ... },
      { type: 'editorial-card', layout: 'color-block', ... }
    ]
  }]
}
```

---

## Widget Categories

### 1. Core Widgets → Page Elements

#### Text Widget
**Type:** `text`
**Description:** Rich text content with typography controls

| Property | Type | Options | Description |
|----------|------|---------|-------------|
| `text` | string | — | The text content (supports HTML) |
| `align` | string | `left`, `center`, `right` | Text alignment |
| `inlineStyles` | string | CSS string | Custom inline CSS styles |
| `typographyStyle` | string | `body-xl`, `body-lg`, `body-md`, `body-sm`, `body-xs`, `code-mono` | Typography token from design system |

**Design Token Integration:**
- `typographyStyle` maps to theme typography tokens (e.g., `body-md` → 16px, line-height 24px)
- Font family inherited from theme's `bodyFont` (Inter in Wiley DS V2)
- Text color from `semanticColors.content.primary` or `.secondary`

---

#### Heading Widget
**Type:** `heading`
**Description:** Semantic heading with style variants

| Property | Type | Options | Description |
|----------|------|---------|-------------|
| `text` | string | — | Heading text content |
| `level` | number | `1`, `2`, `3`, `4`, `5`, `6` | HTML heading level (h1-h6) |
| `align` | string | `left`, `center`, `right` | Text alignment |
| `style` | string | `default`, `bordered-left`, `underlined`, `highlighted`, `decorated`, `gradient`, `hero` | Visual style variant |
| `color` | string | `default`, `primary`, `secondary`, `accent`, `muted` | Color scheme from tokens |
| `size` | string | `small`, `medium`, `large`, `xl`, `auto` | Size override |
| `typographyStyle` | string | `auto`, `heading-h1` through `heading-h6`, `body-xl`, `body-lg` | Typography token |
| `icon.enabled` | boolean | — | Show icon |
| `icon.position` | string | `left`, `right` | Icon placement |
| `icon.emoji` | string | — | Emoji character |

**Heading Style Variants:**
| Style | Visual Effect |
|-------|--------------|
| `default` | Plain heading, no decoration |
| `bordered-left` | Vertical accent bar on left |
| `underlined` | Horizontal line below |
| `highlighted` | **Primary color background**, adaptive text (white/black), inline-block width |
| `decorated` | Decorative flourish elements |
| `gradient` | Gradient text fill |
| `hero` | Extra large, bold treatment |

**Design Token Integration:**
- `typographyStyle: 'auto'` uses heading level (h1 → `heading-h1` token)
- Font family from theme's `headingFont` (Inter in Wiley DS V2)
- Responsive sizes: desktop and mobile breakpoints
- `highlighted` style uses theme's primary color with automatic contrast text

---

#### Image Widget
**Type:** `image`
**Description:** Static image with aspect ratio and positioning controls

| Property | Type | Options | Description |
|----------|------|---------|-------------|
| `src` | string | URL | Image source URL |
| `alt` | string | — | Alt text for accessibility |
| `ratio` | string | `1:1`, `4:3`, `3:4`, `16:9`, `auto` | Aspect ratio constraint |
| `caption` | string | — | Optional image caption |
| `link` | string | URL | Make image clickable |
| `alignment` | string | `left`, `center`, `right` | Image alignment |
| `width` | string | `auto`, `full`, `small`, `medium`, `large` | Width preset |
| `objectFit` | string | `cover`, `contain`, `fill`, `scale-down`, `none` | CSS object-fit behavior |

**Image Sources - Three Options:**

1. **Local images from public folder (preferred for brand assets):**
```javascript
// Place images in: public/images/wiley/
// Reference as: /images/wiley/filename.jpeg
'/images/wiley/wiley_website_life sciences_abstract.jpeg'
'/images/wiley/Wiley_Icon_Green_Genetics_1000px.png'
'/images/wiley/Abstract Green Wave Patterns - Abstract.jpeg'
```

2. **Placeholder images - picsum.photos (for prototyping):**
```javascript
// Random but consistent images (seed = deterministic)
'https://picsum.photos/seed/lifesciences/400/300'   // 400x300 image
'https://picsum.photos/seed/chemistry/800/600'      // 800x600 image
'https://picsum.photos/seed/research/200/200'       // Square image

// Pattern: https://picsum.photos/seed/{semantic-name}/{width}/{height}
```

3. **External URLs (for web-hosted images):**
```javascript
'https://example.com/path/to/image.jpg'
```

**⚠️ IMPORTANT:** `file://` URLs do NOT work due to browser security. Use the public folder approach instead.

**Example:**
```javascript
{
  id: nanoid(),
  type: 'image',
  skin: 'minimal',
  src: 'https://picsum.photos/seed/openaccess/800/600',
  alt: 'Open Access Research',
  ratio: '4:3',
  width: 'full',
  objectFit: 'cover'
}
```

**Design Token Integration:**
- Border radius from `components.card.borderRadius` token
- Caption uses `body-sm` typography style
- Links use `semanticColors.content.link` color

---

#### Button Widget
**Type:** `button`
**Description:** Clickable button with style variants

| Property | Type | Options | Description |
|----------|------|---------|-------------|
| `text` | string | — | Button label |
| `href` | string | URL | Link destination |
| `style` | string | `solid`, `outline`, `link` | Visual treatment |
| `color` | string | `color1`, `color2`, `color3`, `color4`, `color5` | Color scheme (5 Figma options) |
| `size` | string | `small`, `medium`, `large` | Button size |
| `target` | string | `_blank`, `_self` | Link target |
| `align` | string | `left`, `center`, `right` | Button alignment |
| `icon.enabled` | boolean | — | Show icon |
| `icon.position` | string | `left`, `right` | Icon placement |
| `icon.emoji` | string | — | Emoji character |

**Button Color Options (Wiley DS V2 - Green Brand):**
| Value | Maps To | On Light Background | On Dark Background |
|-------|---------|---------------------|-------------------|
| `color1` | Primary | #008F8A (Teal) | #00D875 (Green) |
| `color2` | Secondary | #003B44 (Dark Teal) | #F2F2EB (Cream) |
| `color3` | Tertiary | #FFFFFF (White) | #003B44 (Dark Teal) |

**Note:** Button colors automatically adapt based on background (light vs dark). The theme handles this via `contentMode`.

**Design Token Integration:**
- Border radius from `components.button.borderRadius` (4px in Wiley DS V2)
- Font weight from `components.button.fontWeight`
- Hover/active states from `semanticColors.interactive` tokens

---

#### Divider Widget
**Type:** `divider`
**Description:** Horizontal rule for visual separation

| Property | Type | Options | Description |
|----------|------|---------|-------------|
| `style` | string | `solid`, `dashed`, `dotted` | Line style |
| `thickness` | string | `1px`, `2px`, `3px`, etc. | Line thickness |
| `color` | string | Hex color | Line color |
| `marginTop` | string | `1rem`, `16px`, etc. | Top margin |
| `marginBottom` | string | `1rem`, `16px`, etc. | Bottom margin |

**Design Token Integration:**
- Default color from `semanticColors.surface.divider`
- Margins can use spacing tokens (`semantic.sm`, `semantic.md`)

---

#### Spacer Widget
**Type:** `spacer`
**Description:** Vertical spacing for layout control

| Property | Type | Options | Description |
|----------|------|---------|-------------|
| `height` | string | `1rem`, `2rem`, `50px`, `10vh`, etc. | Spacer height |

**Design Token Integration:**
- Height can reference spacing tokens: `semantic.xs` (8px), `semantic.sm` (16px), `semantic.md` (24px), `semantic.lg` (32px), `semantic.xl` (48px)

---

### 2. Core Widgets → Content Cards

#### Editorial Card Widget
**Type:** `editorial-card`
**Description:** Marketing/editorial content card with multiple layouts

| Property | Type | Options | Description |
|----------|------|---------|-------------|
| `layout` | string | `image-overlay`, `split`, `color-block` | Card layout structure |
| `content.preheader.enabled` | boolean | — | Show preheader |
| `content.preheader.text` | string | — | Preheader text |
| `content.headline.enabled` | boolean | — | Show headline |
| `content.headline.text` | string | — | Headline text |
| `content.description.enabled` | boolean | — | Show description |
| `content.description.text` | string | — | Description text |
| `content.callToAction.enabled` | boolean | — | Show CTA |
| `content.callToAction.text` | string | — | CTA button text |
| `content.callToAction.url` | string | URL | CTA link |
| `content.callToAction.type` | string | `button`, `link` | CTA style |
| `image.src` | string | URL | Card image |
| `image.alt` | string | — | Image alt text |
| `config.contentAlignment` | string | `left`, `center`, `right` | Content alignment |
| `config.imagePosition` | string | `top`, `bottom`, `left`, `right` | Image position (split/color-block) |
| `config.overlayOpacity` | number | 0-100 | Overlay darkness (image-overlay) |
| `config.useAccentColor` | boolean | — | Use theme accent for background |

**Design Token Integration:**
- `useAccentColor: true` uses `semanticColors.interactive.accent`
- Typography follows heading and body styles
- Button styling from button component tokens

---

### 3. Core Widgets → Navigation

#### Menu Widget
**Type:** `menu`
**Description:** Context-aware navigation menu

| Property | Type | Options | Description |
|----------|------|---------|-------------|
| `menuType` | string | `global`, `context-aware`, `custom` | Menu behavior type |
| `contextSource` | string | `journal`, `book`, `conference` | Context for dynamic items |
| `style` | string | `horizontal`, `vertical`, `dropdown`, `footer-links` | Visual layout |
| `align` | string | `left`, `center`, `right` | Menu alignment |
| `items` | MenuItem[] | — | Array of menu items |

**MenuItem Properties (ALL REQUIRED unless noted):**
| Property | Type | Options | Description |
|----------|------|---------|-------------|
| `id` | string | — | Unique identifier (use `nanoid()`) |
| `label` | string | — | Display text (supports `{{journal.name}}` template variables) |
| `url` | string | — | Link destination URL |
| `target` | string | `'_self'`, `'_blank'` | Link target (use `as const` for TypeScript) |
| `displayCondition` | string | `'always'`, `'if-issue-exists'`, `'if-has-archive'`, `'if-journal-context'` | When to show (use `as const`) |
| `order` | number | — | Sort order (0, 1, 2, ...) |

**Example - Footer Menu:**
```javascript
{
  id: nanoid(),
  type: 'menu',
  skin: 'minimal',
  menuType: 'custom',
  style: 'vertical',
  align: 'left',
  items: [
    { id: nanoid(), label: 'Resources', url: '#', target: '_self' as const, displayCondition: 'always' as const, order: 0 },
    { id: nanoid(), label: 'Author Guidelines', url: '/authors', target: '_self' as const, displayCondition: 'always' as const, order: 1 },
    { id: nanoid(), label: 'Reviewer Resources', url: '/reviewers', target: '_self' as const, displayCondition: 'always' as const, order: 2 },
    { id: nanoid(), label: 'Open Access', url: '/open-access', target: '_self' as const, displayCondition: 'always' as const, order: 3 }
  ]
}
```

**Example - Horizontal Legal Links:**
```javascript
{
  id: nanoid(),
  type: 'menu',
  skin: 'minimal',
  menuType: 'custom',
  style: 'horizontal',
  align: 'right',
  items: [
    { id: nanoid(), label: 'Privacy', url: '/privacy', target: '_self' as const, displayCondition: 'always' as const, order: 0 },
    { id: nanoid(), label: 'Terms', url: '/terms', target: '_self' as const, displayCondition: 'always' as const, order: 1 },
    { id: nanoid(), label: 'Accessibility', url: '/accessibility', target: '_self' as const, displayCondition: 'always' as const, order: 2 }
  ]
}
```

**Design Token Integration:**
- Link colors from `semanticColors.content.link` and `.linkHover`
- Font from `typography.bodyFont`
- Horizontal spacing from `spacing.semantic` tokens

---

### 4. Core Widgets → Interactive

#### Tabs Widget
**Type:** `tabs`
**Description:** Tabbed content container where each tab is a DROP ZONE for nested widgets

| Property | Type | Options | Description |
|----------|------|---------|-------------|
| `tabs` | TabItem[] | — | Array of tab configurations |
| `activeTabIndex` | number | — | Currently active tab (0-indexed) |
| `tabStyle` | string | `underline`, `pills`, `buttons` | Tab visual style |
| `align` | string | `left`, `center`, `right` | Tab alignment |

**TabItem Properties:**
| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | ✅ | Unique identifier |
| `label` | string | ✅ | Tab label displayed to user |
| `url` | string | ❌ | Optional navigation URL (for tab-as-link mode) |
| `icon` | string | ❌ | Optional emoji icon |
| `widgets` | Widget[] | ✅ | **Widgets nested inside this tab panel (DROP ZONE)** |

**⚠️ IMPORTANT:** Each tab's `widgets` array IS the tab content. If you want content in a tab, you MUST populate this array with actual widgets.

**Example - Tabs with Content:**
```javascript
{
  id: nanoid(),
  type: 'tabs',
  skin: 'minimal',
  activeTabIndex: 0,
  tabStyle: 'underline',
  align: 'left',
  tabs: [
    {
      id: nanoid(),
      label: 'Most Read',
      widgets: [
        // ✅ Actual widgets inside this tab
        { id: nanoid(), type: 'publication-list', contentSource: 'schema-objects', skin: 'minimal', ... }
      ]
    },
    {
      id: nanoid(),
      label: 'Most Cited',
      widgets: [
        // ✅ Different content in second tab
        { id: nanoid(), type: 'publication-list', contentSource: 'schema-objects', skin: 'minimal', ... }
      ]
    }
  ]
}
```

**Example - Empty Tabs (for user to fill):**
```javascript
{
  id: nanoid(),
  type: 'tabs',
  skin: 'minimal',
  activeTabIndex: 0,
  tabStyle: 'underline',
  tabs: [
    { id: nanoid(), label: 'Tab 1', widgets: [] },  // User will drag widgets here
    { id: nanoid(), label: 'Tab 2', widgets: [] }
  ]
}
```

**Design Token Integration:**
- Active tab uses `semanticColors.interactive.primary`
- Border/underline from `surface.border` token
- Typography from body styles

---

#### Collapse/Accordion Widget
**Type:** `collapse`
**Description:** Expandable content panels

| Property | Type | Options | Description |
|----------|------|---------|-------------|
| `panels` | CollapsePanel[] | — | Array of collapsible panels |
| `allowMultiple` | boolean | — | Allow multiple panels open |
| `iconPosition` | string | `left`, `right` | Expand icon position |
| `style` | string | `default`, `bordered`, `minimal` | Visual style |

**CollapsePanel Properties:**
| Property | Type | Description |
|----------|------|-------------|
| `id` | string | Unique identifier |
| `title` | string | Panel header text |
| `isOpen` | boolean | Current open/closed state |
| `icon` | string | Optional emoji icon |
| `widgets` | Widget[] | Widgets inside this panel (DROP ZONE) |

**Design Token Integration:**
- Border from `surface.border` token
- Header uses heading typography
- Content uses body typography

---

### 5. Publishing Widgets

**⚠️ IMPORTANT: Schema.org Content Architecture**

Publication widgets are designed to work with **Schema.org content definitions** - structured data stored separately from the widget configuration. This enables:
- Reusable content across multiple widgets
- Dynamic content loading from APIs
- AI-generated content
- DOI-based fetching

**Content Source Options:**

| `contentSource` | How It Works | Configuration Property |
|-----------------|--------------|------------------------|
| `'doi'` | Fetches metadata from DOI | `doiSource: { doi: '10.1002/...' }` |
| `'doi-list'` | Fetches multiple DOIs | `doiListSource: { dois: ['10.1002/...', ...] }` |
| `'schema-objects'` | References stored Schema.org objects | `schemaSource: { selectedIds: ['id1', 'id2'] }` |
| `'ai-generated'` | AI generates publication data | `aiSource: { prompt: '...', domain: 'chemistry' }` |
| `'context'` | Gets from page/journal context | — (automatic) |

---

#### Publication List Widget
**Type:** `publication-list`
**Description:** Display list of publications with configurable cards

| Property | Type | Options | Description |
|----------|------|---------|-------------|
| `contentSource` | string | `dynamic-query`, `doi-list`, `ai-generated`, `schema-objects` | Data source (see table above) |
| `publications` | array | — | Fallback publication data (used if contentSource fails) |
| `cardConfig` | PublicationCardConfig | — | Card display configuration |
| `cardVariantId` | string | — | Reference to saved card variant |
| `layout` | string | `list`, `grid`, `featured` | Display layout |
| `maxItems` | number | — | Maximum items to show |
| `align` | string | `left`, `center`, `right` | List alignment |

**Content Source Configuration:**
| Property | Type | Description |
|----------|------|-------------|
| `schemaSource.selectionType` | string | `'by-id'` or `'by-type'` |
| `schemaSource.selectedIds` | string[] | Array of Schema.org object IDs to display |
| `schemaSource.selectedType` | string | Schema.org type to filter by (e.g., `'ScholarlyArticle'`) |
| `doiListSource.dois` | string[] | Array of DOI strings |

**Example - Schema Objects Source (RECOMMENDED):**
```javascript
{
  id: nanoid(),
  type: 'publication-list',
  skin: 'minimal',
  contentSource: 'schema-objects',
  schemaSource: {
    selectionType: 'by-id',
    selectedIds: ['article-1', 'article-2', 'article-3']  // References to stored objects
  },
  layout: 'grid',
  cardConfig: {
    showTitle: true,
    showThumbnail: true,
    thumbnailPosition: 'top',
    showAbstract: true,
    abstractLength: 'short'
  }
}
```

**Example - DOI List Source:**
```javascript
{
  id: nanoid(),
  type: 'publication-list',
  skin: 'minimal',
  contentSource: 'doi-list',
  doiListSource: {
    dois: ['10.1002/example.001', '10.1002/example.002', '10.1002/example.003']
  },
  layout: 'list',
  cardConfig: { ... }
}
```

**PublicationCardConfig Properties:**
| Property | Type | Description |
|----------|------|-------------|
| `showContentTypeLabel` | boolean | Show article/book type label |
| `showTitle` | boolean | Show publication title |
| `showThumbnail` | boolean | Show thumbnail image |
| `thumbnailPosition` | string | `top`, `left`, `right`, `bottom`, `underlay` |
| `showAuthors` | boolean | Show author names |
| `authorStyle` | string | `initials` or `full` |
| `showAbstract` | boolean | Show abstract text |
| `abstractLength` | string | `short`, `medium`, `long` |
| `showPublicationDate` | boolean | Show publication date |
| `showDOI` | boolean | Show DOI link |
| `showAccessStatus` | boolean | Show open access badge |
| `showUsageMetrics` | boolean | Show citation/view counts |
| `titleStyle` | string | `small`, `medium`, `large` |

**Grid Layout Pattern System (when inside Grid section):**
| Property | Type | Options | Description |
|----------|------|---------|-------------|
| `spanningConfig.enabled` | boolean | — | Inherit parent grid layout |
| `spanningConfig.preset` | string | `uniform`, `featured-first`, `hero-first`, `alternating`, `masonry`, `custom` | Spanning pattern |
| `spanningConfig.customPattern` | number[] | e.g., `[2, 1, 1]` | Custom column spans |

---

#### Publication Details Widget
**Type:** `publication-details`
**Description:** Single publication display with full metadata

| Property | Type | Options | Description |
|----------|------|---------|-------------|
| `contentSource` | string | `doi`, `ai-generated`, `schema-objects`, `context` | Data source |
| `publication` | object | — | Fallback publication data |
| `cardConfig` | PublicationCardConfig | — | Display configuration |
| `layout` | string | `default`, `compact`, `hero`, `sidebar` | Display layout |

**Content Source Configuration:**
| Property | Type | Description |
|----------|------|-------------|
| `doiSource.doi` | string | Single DOI to fetch |
| `schemaSource.selectedId` | string | Single Schema.org object ID |
| `aiSource.prompt` | string | Natural language prompt for AI |
| `aiSource.domain` | string | Domain filter: `'ai-software'`, `'chemistry'`, etc. |

**Example - DOI Source (RECOMMENDED for single articles):**
```javascript
{
  id: nanoid(),
  type: 'publication-details',
  skin: 'minimal',
  contentSource: 'doi',
  doiSource: {
    doi: '10.1002/example.001'
  },
  layout: 'default',
  cardConfig: {
    showTitle: true,
    showThumbnail: true,
    thumbnailPosition: 'left',
    showAuthors: true,
    showAbstract: true,
    abstractLength: 'medium',
    showPublicationDate: true,
    showAccessStatus: true
  }
}
```

**Example - Schema Object Reference:**
```javascript
{
  id: nanoid(),
  type: 'publication-details',
  skin: 'minimal',
  contentSource: 'schema-objects',
  schemaSource: {
    selectedId: 'featured-article-1'  // ID of stored Schema.org object
  },
  layout: 'hero',
  cardConfig: { ... }
}
```

---

### Schema.org Object Structure

When using `contentSource: 'schema-objects'`, the referenced objects should follow the schema.org `ScholarlyArticle` structure:

```json
{
  "@type": "ScholarlyArticle",
  "name": "Machine Learning Approaches for Climate Prediction",
  "headline": "Machine Learning Approaches for Climate Prediction",
  "author": [
    { "@type": "Person", "name": "Jane Smith", "affiliation": "MIT" },
    { "@type": "Person", "name": "John Doe", "affiliation": "Stanford" }
  ],
  "datePublished": "2024-03-15",
  "publisher": {
    "@type": "Organization",
    "name": "Journal of Climate Science"
  },
  "identifier": {
    "@type": "PropertyValue",
    "propertyID": "DOI",
    "value": "10.1002/jcs.2024.001"
  },
  "abstract": "This study presents novel machine learning techniques for improving long-term climate predictions...",
  "keywords": ["climate", "machine learning", "prediction"],
  "isAccessibleForFree": false,
  "image": "https://example.com/article-thumbnail.jpg"
}
```

**Key Properties:**
| Property | Required | Description |
|----------|----------|-------------|
| `@type` | Yes | Must be `"ScholarlyArticle"` |
| `name` / `headline` | Yes | Article title |
| `author` | Yes | Array of Person objects |
| `datePublished` | Yes | ISO date string |
| `identifier.value` | Yes | DOI string |
| `abstract` | Recommended | Article abstract |
| `publisher.name` | Recommended | Journal name |
| `isAccessibleForFree` | Optional | Open access flag |
| `image` | Optional | Thumbnail URL |

---

### Supported Schema.org Types

Publication widgets work with multiple schema.org content types, not just articles:

**CreativeWork Types (Publications):**
| Type | Use Case | Example |
|------|----------|---------|
| `ScholarlyArticle` | Research articles | Journal article with DOI |
| `Book` | Monographs, textbooks | Academic book |
| `Chapter` | Book chapters | Chapter within edited volume |
| `Periodical` | Journals | Journal browse/listing |
| `PublicationIssue` | Journal issues | Issue table of contents |
| `PublicationVolume` | Journal volumes | Volume archive |

**Other Supported Types:**
| Type | Use Case | Example |
|------|----------|---------|
| `Person` | Authors, editors, reviewers | "Meet the Editors" section |
| `Organization` | Institutions, publishers, societies | "Partner Institutions" |
| `Event` | Conferences, webinars, deadlines | "Upcoming Events" section |

**Content Source Behavior:**
| `contentSource` | What It Does |
|-----------------|--------------|
| `dynamic-query` | Fetches live data from backend in schema.org format |
| `schema-objects` | References handcrafted schema.org objects for custom content |
| `doi-list` | Fetches specific articles by DOI |
| `context` | Inherits from page/journal context |

The card configurator supports common properties across all these types, allowing consistent display regardless of content type.

---

**Available Mock Data:**

The Page Builder includes real DOI data from these journals for testing:

- **Computer Science:** Software: Practice and Experience, Concurrency and Computation
- **Chemistry:** Angewandte Chemie, Advanced Materials, Chemistry - A European Journal

When building mockups for academic pages, these subject areas have sample data available.

---

## Design System Token Architecture

### Theme Declaration

Every page JSON should specify its theme at the top level. **Use Wiley DS V2 as the default:**

```json
{
  "theme": "wiley-figma-ds-v2",
  "sections": [...]
}
```

The theme determines how Foundation tokens resolve to actual values (colors, fonts, sizes).

---

### Foundation Design System (3-Layer Token Architecture)

The Page Builder uses **Foundation DS** - a universal token contract. You write to Foundation tokens, and the theme adapter resolves them.

```
Layer 1: Foundation (Raw Values)
├── colors (scales: gray, purple, teal, blue, green, red, yellow)
├── typography (families, weights, sizes with desktop/mobile breakpoints)
└── spacing (base scale 0-10, semantic xs-3xl)

Layer 2: Semantic (Purpose-Mapped)
├── interactive (primary, secondary, accent with hover/active states)
├── surface (background, card, border, divider)
├── content (primary, secondary, muted, inverse, link)
└── feedback (success, warning, error, info)

Layer 3: Component (UI Elements)
├── button (borderRadius, fontWeight, transition)
├── card (borderRadius, boxShadow, border)
└── form (borderRadius, border, focusColor)
```

---

### Primary Theme: Wiley DS V2 (Green Brand)

**Theme ID:** `wiley-figma-ds-v2`

| Token Category | Wiley Green Value |
|----------------|-------------------|
| **Primary Color** | #00D875 (Green) / #008F8A (Teal) |
| **Secondary Color** | #003B44 (Dark Teal) |
| **Tertiary Color** | #F2F2EB (Cream) |
| **Primary Font** | Inter, sans-serif |
| **Secondary Font** | "Open Sans", sans-serif |
| **Responsive** | Desktop/mobile breakpoints ✓ |

**Brand Note:** The Wiley (Green) brand is locked at website creation. All colors are managed through button variants and automatically adapt based on light/dark backgrounds.

**Why Wiley DS V2?** This is the production design system. Pages created with this theme are production-ready.

### Typography Tokens (Wiley DS V2)

**How It Works:** You set `typographyStyle: "body-lg"` on a widget → Page Builder generates CSS class `.typo-body-lg` → Theme provides the actual values.

**Heading Styles:**
| Token | Desktop | Mobile | Weight |
|-------|---------|--------|--------|
| `heading-h1` | 56px | 40px | 700 |
| `heading-h2` | 48px | 32px | 700 |
| `heading-h3` | 40px | 28px | 600 |
| `heading-h4` | 32px | 24px | 600 |
| `heading-h5` | 24px | 20px | 600 |
| `heading-h6` | 20px | 18px | 600 |

**Body Styles:**
| Token | Size | Line Height | Weight |
|-------|------|-------------|--------|
| `body-xl` | 24px | 1.5 | 400 |
| `body-lg` | 20px | 1.5 | 400 |
| `body-md` | 16px | 1.5 | 400 (default) |
| `body-sm` | 14px | 1.4 | 400 |
| `body-xs` | 12px | 1.4 | 400 |

**Note:** These are Wiley DS V2 values. The Foundation token names are universal; actual values come from the theme.

### Spacing Tokens

**Base Scale:** 8px increments
- `base.1`: 8px
- `base.2`: 16px
- `base.3`: 24px
- `base.4`: 32px
- `base.5`: 40px
- `base.6`: 48px

**Semantic Scale:**
- `semantic.xs`: 8px
- `semantic.sm`: 16px
- `semantic.md`: 24px
- `semantic.lg`: 32px
- `semantic.xl`: 48px
- `semantic.2xl`: 64px
- `semantic.3xl`: 80px

---

## Widget Base Properties

All widgets inherit these base properties:

| Property | Type | Options | Description |
|----------|------|---------|-------------|
| `id` | string | — | Unique widget ID (auto-generated) |
| `type` | string | — | Widget type identifier |
| `skin` | string | `'minimal'` | Always use `'minimal'` (legacy property, kept for compatibility) |
| `sectionId` | string | — | Parent section reference |
| `layout.variant` | string | `default`, `card`, `bordered`, `elevated` | Layout variant |
| `layout.padding` | string | `none`, `small`, `medium`, `large` | Internal padding |
| `layout.background` | string | `transparent`, `white`, `gray-50`, `gray-100` | Background color |
| `layout.shadow` | string | `none`, `small`, `medium`, `large` | Box shadow |
| `layout.rounded` | string | `none`, `small`, `medium`, `large` | Border radius |
| `gridSpan.column` | string | `span 2`, `1 / 3`, `1 / -1` | Grid column span |
| `gridSpan.row` | string | `span 2`, `2 / 4` | Grid row span |
| `flexProperties.grow` | boolean | — | Flex grow behavior |

---

## Usage Examples

### Creating a Hero Section
```javascript
// Section with hero layout
{
  type: 'content-block',
  layout: 'one-column',
  background: { type: 'gradient', gradient: { type: 'linear', direction: 'to bottom right', stops: [...] } },
  contentMode: 'dark',  // White text for dark backgrounds
  areas: [{
    widgets: [
      { type: 'heading', text: 'Welcome', level: 1, style: 'hero', typographyStyle: 'heading-h1' },
      { type: 'text', text: 'Description...', typographyStyle: 'body-lg' },
      { type: 'button', text: 'Get Started', style: 'solid', color: 'color1', size: 'large' }
    ]
  }]
}
```

### Publication Grid with Featured First
```javascript
{
  type: 'publication-list',
  contentSource: 'schema-objects',
  layout: 'grid',
  spanningConfig: {
    enabled: true,
    preset: 'featured-first'  // First item spans 2 columns, then repeats [2,1,1]
  },
  cardConfig: {
    showTitle: true,
    showThumbnail: true,
    thumbnailPosition: 'top',
    showAuthors: true,
    authorStyle: 'initials',
    showAbstract: true,
    abstractLength: 'short'
  }
}
```

---

---

## Key Patterns Checklist

When generating Page Builder JSON, ensure:

1. ✅ Each section has its own `layout` and `gridConfig`/`flexConfig`
2. ✅ Areas only contain `id`, `name`, and `widgets`
3. ✅ All widgets have `id`, `type`, and `skin`
4. ✅ Heading widgets rely on default `size: 'auto'` (semantic sizing)
5. ✅ Menu items have all required properties including `order`
6. ✅ Editorial card `content` objects have `enabled` and `text` even when disabled
7. ✅ Use `/images/wiley/...` for brand assets or `picsum.photos` for placeholders (NOT `file://`)
8. ✅ Match `contentMode` to background (dark background → `"dark"`, light → `"light"`)
9. ✅ Use `typographyStyle` tokens instead of inline font styles

**For complete page examples, see `PageBuilder-Page-Examples-Skill.md`** which includes:
- Journal Home Page (with `PublicationListWidget`)
- Issue Table of Contents (with `PublicationDetailsWidget`)
- Article Browse/Grid
- Editorial/About Page
- Generic Landing Page

---

## When to Use This Skill

Apply this Skill when:
- User asks about available widgets in Page Builder
- User needs to configure widget properties
- User wants to understand design token integration
- User is building page layouts with specific content
- User asks about publication card configuration
- User needs typography or spacing guidance
- User is generating page JSON for the Page Builder

## Resources

- Full widget type definitions: `src/types/widgets.ts`
- Widget library configuration: `src/library.ts`
- Wiley DS V2 theme: `src/data/mockThemes.ts` (look for `wiley-figma-ds-v2`)
- Wiley DS adapter: `src/foundation/adapters/wiley-ds-v2.ts`
- Section prefabs: `src/components/PageBuilder/prefabSections.ts`
- Starter page examples: `src/data/mockStarterPages.ts`

---

## Quick Reference: Theme Declaration

```json
{
  "theme": "wiley-figma-ds-v2",
  "sections": [
    // Your page sections here
  ]
}
```

This is **required** at the top of every page JSON.

