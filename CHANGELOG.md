# Changelog

All notable changes to the Catalyst Page Builder prototype will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added

- **Editorial Card Widget** (SharePoint-inspired):
  - New widget type for marketing/editorial content with professional layouts
  - **Three layout presets**:
    - **Image Overlay**: Full-bleed image with text overlay and adjustable opacity (0-100%)
    - **Split**: Image and content in separate areas (top/bottom/left/right positioning)
    - **Color Block**: Image paired with colored content area (uses theme accent color or gray)
  - **Four toggleable content slots**:
    - Preheader (small label/category name)
    - Headline (main title, H2 styling)
    - Description (body text, multi-line)
    - Call to Action (button or link with URL)
  - **Design-system integration**: All styling pulled from active theme tokens
    - Typography: Uses theme heading/body fonts
    - Colors: Uses theme accent/primary/text colors
    - Spacing: Uses theme spacing scale
    - Button styles: Uses theme button configuration
    - Card borders/shadows: Uses theme card settings
  - **Properties Panel**:
    - Layout selector (Image Overlay, Split, Color Block)
    - Image uploader with 🎲 Random Picsum button
    - Content toggles for each slot (show/hide preheader, headline, description, CTA)
    - Content alignment (left/center/right)
    - Image position control (for Split & Color Block layouts)
    - Overlay opacity slider (for Image Overlay)
    - "Use Accent Color" toggle (for Color Block background)
  - **Theme-aware rendering**: Different themes produce different looks automatically
    - Modernist: Clean typography, minimal shadows
    - IBM Carbon: Bold type, high contrast
    - Wiley: Rounded corners, friendly spacing
  - Appears in Widget Library under new "Content Cards" subcategory
  - Status: `supported`
- **FEBS Press Homepage 2025 Starter**: Complete homepage template for FEBS Press
  - 4-journal cover showcase (HTML widget with grid layout)
  - "Highlights from FEBS Press" section with 3 article cards (HTML widgets)
  - "FEBS Press News" section featuring Milan Declaration (two-column layout)
  - "Featured Content" section with 3 topic cards
  - Uses FEBS branding colors (#00B5FF, #E3E3E3, #C25338)
  - Available in Stub Library for FEBS Press website
  - **Auto-loads by default**: Navigating to FEBS Press from Design Console now automatically loads this starter instead of generic template
  - No need to manually load from Stubs - content appears immediately in editor
- **Real Citation Data Integration (34 Publications from 2 Research Domains)**:
  - Created `citationData.ts` utility with 34 real publications from elibrary exports
  - **14 AI/Software Engineering publications** including:
    - "Vibe Coding in Practice: Building a Driving Simulator Without Expert Programming Skills" (Cursor mention!)
    - "The Future of AI-Driven Software Engineering"
    - "Semantic Commit: Helping Users Update Intent Specifications for AI Memory"
    - Plus 11 more on LLMs, copilots, software testing, and collaborative development
  - **20 Chemistry & Materials publications** including:
    - "Calcium-Based Sustainable Chemical Technologies for Total Carbon Recycling"
    - "Organic Chemistry of Calcium – An Element with Unlimited Possibilities"
    - "Oxygen-Mediated Surface Photoreactions: Exploring New Pathways"
    - Plus 17 more on organic chemistry, calcium compounds, and materials science
  - All publications include: DOI, title, authors, year, journal/proceedings, abstract, keywords, pages
  - `getCitationByDOI()` returns full publication metadata in schema.org format
  - `citationToSchemaOrg()` converts citations to JSON-LD for Publication Card rendering
- **DOI Dropdown Selectors** (replaces text input):
  - **Publication Details Widget**: Grouped dropdown by research domain
    - "🤖 AI & Software Engineering" optgroup with 14 DOIs
    - "🧪 Chemistry & Materials" optgroup with 20 DOIs
    - Shows DOI + truncated title (50 chars) for each option
    - Live preview of selected publication title below dropdown
    - Full publication metadata fetched from citation database
    - Fallback to mock lookup if DOI not in database (ready for CrossRef API)
  - **Publication List Widget - DOI List**: Multi-select DOI picker with domain filtering
    - Optional domain filter dropdown: "All Domains (34)", "AI/Software (14)", "Chemistry (20)"
    - Checkbox list showing DOI + full title + first 2 authors + year for each publication
    - Selected items highlighted with blue background
    - Counter showing "X of Y DOIs selected"
    - "Clear All" button to deselect all
    - Fetches full publication metadata from citation database for each selected DOI
    - Publications rendered using Publication Card system with all configured display elements
- **Domain Filtering for AI Generation** (both widgets):
  - Optional "Domain Filter" dropdown in AI generation section
    - Options: "All Domains", "🤖 AI & Software Engineering", "🧪 Chemistry & Materials"
    - Filters example DOIs shown in "Example DOIs from [Domain]" panel
  - Shows 5 example DOIs with full citation info (DOI + title)
  - Dynamic count: "Showing 5 of 14 available DOIs" (updates by domain)
  - Helps users understand the citation database scope when generating AI content
  - `domain` field added to `aiSource` type definitions (optional)
- **Theme-Aware Color Customization**: Intelligent color controls that adapt based on theme restrictions
  - IBM Carbon theme colors are now locked (brand compliance) - color inputs automatically hidden in ThemeEditor
  - Ant Design theme is now fully flexible - colors can be customized like Classic theme
  - Theme `modificationRules.colors` property controls whether color inputs are shown
  - Shows "🔒 Colors are locked" message for rigid themes (IBM Carbon)
  - Accent color input added to ThemeEditor for flexible themes
- **Font Family Customization**: Live font family editing for Classic theme
  - New "Font Families" section in ThemeEditor's Typography panel
  - Separate inputs for "Heading Font" and "Body Font"
  - Real-time preview updates as you type
  - Respects `modificationRules.typography.canModifyHeadingFont` and `canModifyBodyFont` flags
  - Only shown for themes that allow font customization (Classic UX3)
  - Includes helpful tip about web-safe fonts and Google Fonts
- **Prototype Controls Panel**: Floating panel at bottom of screen for switching personas and console modes
  - 3 personas: Publisher, PB Admin, Developer
  - Console modes: Multi-Website Publisher, Single Website
  - Available across all views (Design Console, Page Builder, Mock Live Site)
  - Replaces old console mode toggle in Design Console header
  - Subtle indigo color scheme (not bright purple)
  - Collapsed by default to minimize distraction
- **PB Admin Persona**: New admin role for managing design system assets
  - Indigo "PB Admin Mode" badge in theme libraries
  - "Create New Template/Stub/Section" button (indigo) visible only to PB Admin
  - Foundation for future admin capabilities (edit, duplicate, move between themes)
- **Stub Loading to Editor**: Load button in website Stubs view
  - Loads stub directly into Page Builder editor
  - Confirmation dialog before replacing current content
  - Success notification after loading
- **Publication Details Widget Major Overhaul**:
  - **Fixed naming consistency**: "Publication Detail" → "Publication Details" (plural)
  - **Now uses Publication Card system for ALL rendering** (Articles, Books, Issues, Journals, Chapters)
  - Leverages existing Publication Card Styles configurator with tabs for each type
  - Schema.org-based rendering automatically handles different `@type` values
  - **AI Generation support** with prompt-based content creation and 1-hour cache
  - **DOI-based display** with mock publication lookup (ready for CrossRef API integration)
  - **Date serialization fix** for AI-generated content timestamps
  - Multiple content sources: DOI, AI Generated, Schema Objects, Page Context
  - All Publication Card display elements now available (metadata, authors, abstract, keywords, etc.)
  - Consistent styling with Publication List widget

### Changed
- **Improved Semantic Icons**: Updated all major navigation icons for better visual clarity and intuitive understanding
  - **Templates** → `LayoutTemplate` 📐: Document with wireframe/blueprint overlay (was generic `FileText`)
    - Applied to: Website Templates, Template Library, all template-related navigation
    - Communicates: Structured, reusable layout patterns
  - **Stubs** → `FilePlus2` ➕📄: File with plus indicator (was `Globe` or `FileText`)
    - Applied to: Website Stubs, Stub Library, Design Library tabs, all stub-related navigation
    - Communicates: Draft/starting points to build from
  - **Publication Cards** → `Newspaper` 📰: Structured content representation (was `FileText` or `Palette`)
    - Applied to: Website Publication Cards, Design Publication Cards, all card-related navigation
    - Communicates: Published content with miniature layout (articles, journals, publications)
  - **Sections** → `Layers` 📚: Stackable component blocks (was `Layout` or `FileText`)
    - Applied to: Section Library, Design Library section tabs, all section-related navigation
    - Communicates: Reusable UI blocks that can be stacked and combined
  - Follows UI design best practices for semantic iconography
- **Collapse Widget "Default" Style - Classic Theme Only**: Now uses dynamic primary theme color with adaptive text contrast
  - **Classic theme**: Background uses `--foundation-action-primary` CSS variable with adaptive white/black text
  - **Other themes**: Maintain original gray background (`bg-gray-100`)
  - Text color automatically adapts based on luminance (WCAG calculation)
  - Dropdown label simplified to "Default" (behavior varies by theme)
  - Automatically updates when primary color changes in ThemeEditor (Classic only)
- **Heading "Highlighted" Style**: Now uses dynamic primary theme color with adaptive text contrast
  - Solid background uses `--foundation-action-primary` CSS variable (was hardcoded yellow gradient)
  - Text color automatically adapts: white text on dark backgrounds, black text on light backgrounds
  - Uses WCAG luminance calculation (same as section contentMode logic)
  - Background width fits text content (inline-block) instead of full width
  - Automatically updates when primary color changes in ThemeEditor
  - Consistent with theme branding across all components
- **FEBS Press Website Defaults**: Pre-configured with custom branding to demonstrate theme customization
  - Primary color: #00B5FF (bright blue)
  - Secondary color: #E3E3E3 (light gray)
  - Accent color: #C25338 (rust/terracotta)
  - Font family: "Open Sans", icomoon, sans-serif
  - Applied via `themeOverrides` to simulate user customization
- **Ant Design Foundation Adapter**: Now flexible and reads theme colors from ThemeEditor
  - `action-primary` uses `theme.colors.primary` with fallback to Daybreak Blue (#1890ff)
  - `action-secondary` uses `theme.colors.secondary` with fallback to Dust Red (#ff4d4f)
  - `action-tertiary` uses `theme.colors.accent` with fallback to white (#ffffff)
  - Maintains same behavior as Classic theme for consistency
- **Button Color Labels**: Removed hardcoded color names from Ant Design dropdown
  - Changed from "Primary (Blue)", "Danger (Red)", "Default (Grey)"
  - Now shows semantic labels: "Primary", "Secondary", "Accent"
  - Colors are now dynamic based on ThemeEditor settings
- **IBM Carbon Theme**: All color modifications disabled
  - `modificationRules.colors` set to `canModify: false` for all color properties
  - Maintains IBM brand compliance and design system integrity
  - Typography and spacing remain customizable
- **Terminology Update**: Renamed "Starter Pages" to "Stubs" throughout the UI
  - Page Builder: "Save as Starter Page" → "Save as Stub"
  - DIY Zone: "Saved Starter Pages" → "Saved Stubs"
  - Design Console: "Starter Page Library" → "Stub Library"
  - Design Library: "Saved Starter Pages" tab → "Saved Stubs"
  - Website-level: "Design Library" → "Stubs" menu item
  - All empty states, prompts, and tooltips updated
  - Icon changed from Plus to FileText for stub sections
- **Console Mode Management**: Moved from Design Console header to Prototype Controls panel
- **State Management**: Added `currentPersona` and `consoleMode` to global Zustand store
- **Stub Actions**: "View/Preview" button → "Load" button with download icon
  - More actionable and clear about what the button does

### Fixed
- **Website Color Branding**: Colors changed via ThemeEditor now immediately reflect across all views
  - `CanvasThemeProvider` now merges `website.themeOverrides` into theme before passing to Foundation adapters
  - Foundation Button components (and all Foundation components) now use updated colors from ThemeEditor
  - Fixed issue where `--foundation-action-primary` and other Foundation tokens were using base theme colors instead of website-specific overrides
  - Added dependency tracking for `themeOverrides` to trigger CSS re-injection on color changes
  - `DynamicBrandingCSS` also injects website-level colors as `--website-primary`, `--website-secondary`, `--website-accent` CSS variables
  - Fixed Classic theme adapter to read `theme.colors.primary`, `theme.colors.secondary`, and `theme.colors.accent` from ThemeEditor instead of hardcoded colors
  - Fixed old-style button CSS to use dynamic Foundation tokens:
    - `.btn-solid-color1` now uses `--foundation-action-primary` (was hardcoded teal)
    - `.btn-solid-color2` now uses `--foundation-action-secondary` (was hardcoded gray)
    - `.btn-solid-color3` now uses `--foundation-action-tertiary` for accent color (was hardcoded gray)
    - Outline and link button variants also updated to use dynamic accent color
  - Mock Live Site buttons now update immediately when colors change
  - Removed hardcoded color names from button properties panel (e.g., "Primary (Blue)" → "Primary") since colors are now dynamic

### Removed
- **Heading Widget Color Theme Property**: Removed color selection dropdown from heading properties
  - Simplifies UI and enforces design consistency
  - Headings now use theme's default text color (consistent with semantic HTML)
  - Visual emphasis should come from heading styles (Hero, Decorated, Gradient) rather than arbitrary color changes
  - Semantic hierarchy (H1→H6) provides natural visual distinction through size/weight
  - Rationale: Modern design systems favor contextual styling over per-element color overrides
- **FEBS Mock Starter Pages**: Deleted FEBS Homepage (2017) and FEBS Homepage (2020) demo stubs
  - Only Catalyst Classic Homepage Template remains as demo content

### Added
- **Divider Widget**: Horizontal line separator with customizable style, thickness, color, and margins
  - Styles: Solid, Dashed, Dotted
  - Properties panel for full customization
- **Spacer Widget**: Invisible spacing element with configurable height
  - Preset heights (1rem, 2rem, 3rem, 4rem, 5rem)
  - Custom height input with unit support
- **Collapse/Accordion Widget**: Expandable panels for content organization
  - Multiple panels with nested widget drop zones
  - Accordion mode (single panel) or multi-panel mode
  - Customizable icon position (left/right) and styles (default/bordered/minimal)
  - Panel management (add/remove/rename)
  - Drag-and-drop support for adding widgets to panels
- **Widget Drop Visual Feedback**: Green "Insert before here" indicator shows exact drop position
  - Subtle green ring highlights target widget during hover
  - Dynamic label shows widget type being inserted before
  - Works for all widget types and section areas

### Fixed
- **CRITICAL: Drag-and-Drop Architecture**: Implemented proper dnd-kit pattern with `DragOverlay`
  - Fixed infinite horizontal scrolling during widget drag
  - Fixed widgets getting lost during drag operations
  - Fixed inconsistent drop zone highlighting
  - Fixed collapse widget DnD issues
  - Removed manual transform/z-index/pointerEvents hacks that were fighting dnd-kit's design
  - Original widget now hidden with `visibility: hidden` during drag (proper pattern)
  - DragOverlay renders dragging widget in portal (no viewport expansion)
- **Widget Insertion Precision**: Fixed widgets always dropping at bottom instead of at hover position
  - Added `widget-target` collision detection for both library widgets AND existing widgets
  - Widgets now insert exactly where the green "Insert before here" indicator shows
  - Fixed same-area reordering (index adjustment when source is before target)
  - Fixed cross-area moves (proper removal from source, insertion at target)
  - Works correctly for stubs, custom pages, and prefab sections
- **Date Serialization**: Fixed `getTime is not a function` error when loading stubs
  - Added `dateReviver` to correctly parse Date objects from localStorage
  - Added defensive checks in widget renderers for Date/string compatibility
- **Collapse Widget UX**: Added dedicated "Edit" button to access widget properties without interfering with panel expand/collapse
- **Collapse Panel Toggling**: Panel headers now work correctly in edit mode with proper event propagation
- **Spacer Widget Visibility**: Made spacer visible in edit mode with dashed border and label

### Changed
- **Widget Status**: Divider, Spacer, and Collapse widgets moved from 'planned' to 'supported' in library
- **Drag Visual Feedback**: Dragging now shows clean preview in DragOverlay instead of transformed original widget

### Technical Improvements
- Aligned drag-and-drop implementation with dnd-kit best practices
- Removed workaround code that was causing viewport/collision issues
- Improved code maintainability by following framework conventions

---

## [v0.3.0] - 2024-11-17

### Added
- **Stubs Persistence**: User-created stubs now persist across server restarts using localStorage
- **Mock Demo Data**: Pre-defined FEBS homepage variants (2017, 2020) and Catalyst templates for demos
- **Design Library**: New consolidated view for saved stubs and sections per website
  - Tabbed interface for Stubs and Sections
  - Search functionality for both types
  - Preview and Delete actions
  - Website-scoped filtering
- **Source Tracking**: Added `source` field ('mock' | 'user') to distinguish demo data from user-created content
- **"Save as Stub" Button**: Added to Page Builder header (next to "Switch to Template Mode")
  - Prompts for name and description
  - Deep clones canvas with regenerated IDs
  - Automatically tagged with 'user' source

### Changed
- **Templates View Refinement**: Now shows ONLY Publication Page Templates
  - Removed Website and Supporting page templates (now "Stubs")
  - Removed Global and Section templates (now in "Sections")
  - Removed sidebar navigation (no longer needed with single category)
  - Applies to both Website Templates view and Add Website dialog
- **Custom Templates → Design Library**: Renamed menu item for clarity
- **Section Saving**: Now includes `websiteId` and `source` fields for proper scoping
- **DIY Zone**: Removed "+ Save Current Canvas" button (individual section save buttons preferred)

### Fixed
- **Templates Regression**: Fixed sections and stubs incorrectly appearing in templates view
- **Type Safety**: Added optional chaining for drag-and-drop operations (`over.data.current?.sectionId`)
- **Linter Errors**: Fixed all TypeScript linter errors across 6 files
  - PropertiesPanel: Typography style type mismatches
  - WidgetRenderer: Undefined index errors for `widget.size`
  - App.tsx: Removed unused imports and parameters
  - SectionRenderer: Removed unused variables
  - PageBuilder: Optional chaining for safety

### Improved
- **Code Quality**: Replaced fragile ID-based filtering with explicit source-based filtering
- **Data Architecture**: Clear separation between demo data (mock) and user data (localStorage)
- **Maintainability**: Self-documenting code with explicit `source` field instead of implicit ID comparisons

---

## [v0.2.0] - 2024-11-16

### Added
- **Theme-Aware Tab Widget**: Different tab variants per theme
  - Wiley: Underline (Anchor Link Nav) and Pills (Tab Bar)
  - Classic: Underline, Pills, and Buttons
  - IBM Carbon: Underline
  - Ant Design: Underline
- **Context-Aware Tab Styling**: Tabs adapt to light/dark backgrounds
- **Properties Panel Enhancement**: Theme-aware tab style dropdown (only shows supported variants)
- **Debug Logging Utility**: Centralized `debugLog` function with per-file debug flags

### Changed
- **Tab Variant Architecture**: Moved from hardcoded global styles to theme-specific configurations
- **Tab Styling**: Refactored to use Foundation theme variables instead of hardcoded colors
- **Font Sizing**: Wiley tabs now use large button size (16px) for consistency

### Fixed
- **Journal Theming**: Mock live site journal pages now correctly inherit theme typography and button styles
- **Classic Theme Homepage**: Fixed serif font regression in preview
- **Wiley Tab Underline**: Removed hardcoded red color, now uses theme primary color
- **Tab Hover States**: Corrected Wiley pills hover behavior to be context-aware

---

## [v0.1.0] - 2024-11-15

### Added
- **Foundation Design System Integration**: Context-aware buttons and typography
- **Multi-Brand Theme Support**: Wiley DS V2, Classic UX3, IBM Carbon, Ant Design
- **Design Console**: Centralized website and theme management
- **Template System**: Base templates with divergence tracking
- **Mock Live Site**: Preview websites with journal pages
- **Page Builder**: Drag-and-drop editor with sections and widgets
- **Branding System**: Dynamic CSS injection for themes and journals
- **Website Management**: Create, configure, and manage multiple websites

### Initial Features
- Theme preview and configuration
- Publication card variants
- Template divergence tracking
- Website creation wizard
- Multi-website publisher console

---

## Versioning Strategy

- **v0.x.x**: Prototype/POC phase (current)
- **v1.0.0**: First production-ready release
- **vX.Y.Z**: 
  - X = Major (breaking changes)
  - Y = Minor (new features, backward compatible)
  - Z = Patch (bug fixes, backward compatible)

