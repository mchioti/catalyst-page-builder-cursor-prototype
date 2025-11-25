# Changelog

All notable changes to the Catalyst Page Builder prototype will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- **🛠️ Enhanced Section Editor (Full Structural Control)**:
  - **Widget Library**: Drag-free widget palette with 6 widget types (Heading, Text, Image, Menu, Spacer, Divider)
  - **Add Widgets**: Click any widget in the library to add to the section
  - **Remove Widgets**: Delete button on each widget
  - **Reorder Widgets**: Move Up/Down buttons for changing widget order
  - **Variation Inheritance Support**: 
    - Editor now resolves inherited widgets from parent variations
    - Shows purple "Inherits from X" badge for inherited variations
    - Displays inherited widget count (e.g., "starts with 5 widgets from base")
    - Archive/Issue/Minimal variations now show their inherited widgets
    - Customizing an inherited variation preserves inheritance link while allowing full control
  - **Empty State**: Clear UI when section has no widgets
  - **Layout**: 3-column layout (Widget Library | Editor | Affected Pages)
  - **Benefits**:
    - ✅ Add custom widgets to journal-specific sections
    - ✅ Remove unwanted widgets (e.g., remove metadata from minimal banners)
    - ✅ Reorder widgets for different visual hierarchies
    - ✅ Customize inherited variations (Archive, Issue, Minimal)
    - ✅ Full structural customization without code
  - **Files**:
    - `WidgetLibrary.tsx` - Reusable widget palette component
    - `SectionEditor.tsx` - Enhanced with add/remove/reorder + inheritance resolution

- **🏗️ Journal-Level Section Forking (Structural Customization)**:
  - **Problem Solved**: Journals needed ability to customize section structure (add/remove widgets, change layouts) independent of content
  - **Solution**: Journal-level forking system allows structural changes while keeping data-driven content
  - **Architecture**:
    - `JournalDetail.tsx` - New management page for individual journals with 3 tabs:
      - **Sections Tab**: Shows all sections used by journal with "Modify for This Journal" button
      - **Pages Tab**: Lists all pages belonging to the journal
      - **Metadata Tab**: Displays journal information (ISSN, impact factor, branding, etc.)
    - **Routing**: `/v2/websites/:websiteId/journals/:journalId`
    - **Fork Workflow**:
      1. Click "Modify for This Journal" on any global section (e.g., Journal Banner)
      2. System clones section with ID pattern: `{sectionId}-{journalId}`
      3. Updates all journal pages to reference the forked section
      4. Navigates to section editor for structural customization
    - **Visual Indicators**:
      - Global sections: Blue "Global" badge
      - Journal-specific sections: Purple "Journal-Specific" badge
      - Website-specific sections: Orange "Website-Specific" badge
  - **Benefits**:
    - ✅ Content changes: Edit Journal entity (CMS-managed)
    - ✅ Structural changes: Fork section and modify in Page Builder
    - ✅ Clear separation of concerns: Data vs. Structure
    - ✅ Scales to any number of journals
  - **Example Use Cases**:
    - Add custom "Discontinued" notice widget to Historical Chemistry Quarterly banner
    - Remove metadata widget from Open Access Biology banner
    - Add custom CTAs or badges per journal
    - Rearrange widget order for specific journals
  - **WebsiteStore Updates**:
    - New actions: `addJournal`, `updateJournal`, `deleteJournal`
    - New queries: `getJournalById`, `getPagesForJournal`
  - **WebsiteDetail Updates**:
    - Journal names now clickable (navigate to JournalDetail)
    - Added "Manage" button for each journal

- **🎯 Dynamic Shared Sections (Template Variables)**:
  - **Problem Solved**: Managing 50+ journals with hardcoded content was unmaintainable
  - **Solution**: Template variable system enables data-driven shared sections
  - **Syntax**: `{journal.name}`, `{journal.description}`, `{journal.issn.print}`, `{journal.impactFactor}`, `{journal.isOpenAccess}`
  - **Architecture**:
    - `templateVariables.ts` - Resolver utility for replacing template variables with actual data
    - `compositionResolver.ts` - Updated to pass journal/website context when resolving pages
    - `SectionRenderer.tsx` - Resolves template variables in widget content before rendering
    - `Live.tsx` - Passes journal and website context to composition resolver
  - **Benefits**:
    - ✅ 1 journal banner section for ALL journals (was 3+ forked sections)
    - ✅ Update metadata in ONE place (Journal entity) → updates all pages automatically
    - ✅ No duplication, no manual edits across multiple pages
    - ✅ Scales to 50, 500, or 5000 journals effortlessly
  - **Removed Redundant Sections**:
    - Deleted `oabJournalBanner` (Open Access Biology fork)
    - Deleted `hcqJournalBanner` (Historical Chemistry fork)
    - All journal pages now use base `journal-banner` section with dynamic content
  - **Supported Contexts**:
    - `{journal.*}` - Journal properties (name, description, ISSN, impact factor, etc.)
    - `{journal.branding.primaryColor}` - Journal brand color (e.g., `#059669` for Open Access Biology)
    - `{website.*}` - Website properties (name, domain, branding, etc.)
    - `{page.*}` - Page properties (title, slug, etc.)
  - **Works in Multiple Contexts**:
    - Widget text fields (headings, descriptions, labels, menu items)
    - Section properties (background colors, gradient values)
  - **Example**: Each journal now has its own brand color:
    - Journal of Advanced Science → Blue (`#1e40af`)
    - Open Access Biology → Green (`#059669`)
    - Historical Chemistry Quarterly → Stone/Gray (`#78716c`)
  - **Future-Proof**: Easy to add conditional rendering, date formatting, and custom functions

### Changed
- **Journal Banner Base Template**: Updated to use template variables instead of hardcoded or placeholder content
  - Title: `{journal.name}` (dynamically pulls from Journal entity)
  - Description: `{journal.description}`
  - Metadata: `{journal.issn.print}`, `{journal.issn.online}`, `{journal.impactFactor}`, `{journal.isOpenAccess}`
  - Makes it clearer this is a data-driven template, not a manual fork-and-edit section
- **Platform Header**: Changed background from white to black (#000000) for better logo visibility
- **Live View Navigation**: Made status bar journal-aware, showing only pages within current journal context
- **Platform Header Simplification**: Removed non-functional "Browse Journals" dropdown, keeping only logo and search

### Removed
- **Journal-Specific Forked Banner Sections**: Deleted `oabJournalBanner` and `hcqJournalBanner` (replaced by single data-driven template)

### Added (Previous Features)
- **List-Based Widget Pattern System** (Universal Spanning for Grid/Flex Layouts):
  - **Core Architecture**: New pattern system enables ANY list-based widget to inherit parent Grid/Flex layouts with intelligent spanning
  - **Universal Application**:
    - Publication List → Articles/publications with varying emphasis
    - Keyword List / Tag Cloud → Keywords with frequency-based sizing
    - Issue Archive → Latest issues bigger than older ones
    - Article List, Author List, Media Gallery, Citation List → All benefit from patterns
  - **Six Preset Patterns**:
    - **Uniform** `[1, 1, 1]` - All items equal size
    - **Featured First** `[2, 1, 1]` - First item double-wide, repeats cyclically
    - **Hero First** `[3, 1, 1, 1]` - First item spans 3 columns, then repeats
    - **Alternating** `[1, 2, 1]` - Middle item emphasized
    - **Masonry** `[1, 1, 2]` - Staggered emphasis (Pinterest-style)
    - **Custom** - User-defined pattern (e.g., `2,1,3,1` for complex layouts)
  - **Pattern System Behavior**:
    - Patterns repeat automatically for any number of items
    - Works in both Grid sections (column spans) and Flex sections (flex-grow values)
    - Only activates when widget is placed inside a Grid/Flex parent section
    - Pattern preview in Properties Panel shows visual representation
  - **Publication List Widget** (first implementation):
    - New "Grid/Flex Pattern" panel appears when placed in Grid/Flex section
    - Checkbox: "Inherit parent grid/flex layout"
    - Preset selector dropdown with descriptions
    - Custom pattern input for advanced users (comma-separated spans)
    - Live pattern preview showing visual representation
    - Info box explaining how patterns work
  - **Properties Panel Integration**:
    - `ListPatternControls.tsx` - Reusable component for all list-based widgets
    - Auto-detects parent section layout (Grid or Flex)
    - Only shows when widget is placed in compatible section
    - Badge showing "Grid Layout" or "Flex Layout"
    - Pattern repeats cyclically across all items
    - **Clean UI**: List-based widgets skip the standard Grid/Flex placement controls entirely (those are for single-item widgets like Image, Text, Button). Pattern system is the ONLY control mechanism for lists.
  - **Rendering Architecture** (Revolutionary Approach):
    - **Section-level rendering**: When pattern mode is enabled, `SectionRenderer` detects it and expands the widget into multiple grid/flex items
    - Uses `flatMap` to transform ONE widget → MULTIPLE publications as direct children of parent Grid/Flex
    - Each publication gets its own `<div>` with `gridColumn`/`gridRow` (Grid) or `flexGrow`/`flexBasis` (Flex) properties
    - Pattern properties applied to both `gridSpan` AND `flexProperties` for universal compatibility (works in both Grid and Flex)
    - Widget wrapper completely bypassed for pattern-mode widgets - publications are rendered directly by the section
    - Works correctly in both Grid and Flex layouts with appropriate spanning/growing behavior
  - **Bug Fixes**:
    - **Custom Pattern Input**: 
      - Fixed comma input issue - now uses local state and updates `onBlur` instead of `onChange`, allowing users to type commas freely
      - Added Enter key support to immediately apply pattern without clicking away
      - Improved pattern update logic with dedicated `applyPattern()` helper function
      - Better initialization when switching to custom preset
      - **Fixed React Hooks error**: Moved all hooks before conditional returns to comply with Rules of Hooks (hooks must be called in same order every render)
    - **Publication List Items**: 
      - Changed slider range from 1-8 to **2-8 items** (minimum 2 items - use Publication Details widget for single items)
      - Increased max from 6 to 8 items to match slider range
      - Added 2 more mock articles ("Edge AI: Bringing Intelligence to IoT Devices", "Multimodal AI: Integrating Vision, Language, and Audio")
      - Now 8 mock articles total in `MOCK_SCHOLARLY_ARTICLES` to support full slider range
      - **Removed "Showing X of Y publications" message** - `maxItems` now controls total items to fetch/display, not a subset indicator
    - **Pattern Mode Widget Selection** (Critical UX Fix):
      - Fixed inability to select pattern-mode widgets after clicking elsewhere
      - Added "Pattern Widget Control" panel that appears above publications in edit mode
      - Control panel shows widget type, item count, and provides Edit/Delete buttons
      - Panel is clickable to select widget and access properties
      - Spans full width in Grid layouts (`col-span-full`) and Flex layouts (`flex-basis: 100%`)
      - Only visible in edit mode (hidden in live/preview mode)
      - Visual indicator with purple theme matching pattern system colors
    - **Section Type Display** (UX Improvement):
      - Section properties now show friendly layout-based type names instead of generic "SECTION"
      - Display names: "Grid Section", "Flex Section", "One Column Section", "Two Columns Section", "Three Columns Section", "Sidebar Left Section", "Sidebar Right Section", etc.
      - Makes it immediately clear what type of section is selected
      - Helpful when working with multiple sections of different layouts
    - **Unified Pattern Mode Control Panel** (UX Improvement):
      - Pattern mode widgets now have improved control toolbar
      - **Added Duplicate button** (previously missing)
      - **Current toolbar**: Duplicate → Edit → Delete
      - **Beautiful unified design**: Purple-themed panel with better padding, hover states, and visual hierarchy
      - Controls are always visible (not conditional) for better discoverability
      - Icon sizes increased to 3.5h/w for better touch targets
      - Consistent behavior across Grid and Flex layouts
      - **Note**: Drag handler not available in pattern mode due to React Hooks limitations (can't call hooks conditionally inside map/flatMap)
      - **Workaround for moving pattern widgets**: Duplicate widget in new location, or temporarily disable pattern mode to access standard drag controls
    - **Publication Card Width Constraints in Flex Layouts** (Critical Fix):
      - **Problem**: Publication cards had no width constraints, causing them to stretch excessively in Flex layouts with flex-grow
      - **Intelligent Solution**: Pattern-aware width constraints that respect featured vs uniform cards:
        - **Featured cards** (`grow: true`, span > 1):
          - `flex-basis: 400px` - Start larger
          - `min-width: 280px` - Reasonable minimum
          - **No max-width** - Can expand beyond 600px to be prominent
        - **Uniform cards** (`grow: false`, span = 1):
          - `flex-basis: 300px` - Standard size
          - `min-width: 280px` - Reasonable minimum
          - `max-width: 400px` - Constrained for consistency
        - **All cards**: `flex-shrink: 1` - Responsive on smaller screens
      - **Result**: 
        - Featured/hero cards stand out with larger size (respecting the pattern intent)
        - Uniform cards maintain consistent, professional sizing
        - Beautiful responsive card grid that wraps naturally in Flex layouts
      - **Applies to**: Both standard pattern mode (WidgetRenderer) and section-level pattern mode (SectionRenderer)
      - Works beautifully across all pattern presets: uniform, featured-first, hero-first, alternating, masonry, custom
    - **Equal Height Publication Cards** (UX Polish):
      - **Problem**: Publication cards had variable heights due to different content lengths (titles, abstracts, metadata), creating messy, uneven grids
      - **Should it be fixed?** YES - Equal heights provide:
        - Professional, polished appearance
        - Easier content scanning (eyes follow horizontal rows)
        - Industry standard (Google Scholar, PubMed, IEEE Xplore all use consistent heights)
        - Better visual hierarchy and grid integrity
      - **Solution**: Three-part fix for equal height cards:
        1. **PublicationCard component**: Added `h-full flex flex-col` to card wrapper - stretches to fill available height
        2. **Flex layouts**: Added `alignItems: 'stretch'` to flex containers - cards in same row have equal height
        3. **Grid layouts**: Already have `alignItems: 'stretch'` by default - equal heights per row
      - **Result**: Beautiful, consistent card heights across all layouts (Grid, Flex, Column)
      - Cards maintain equal heights within each row while respecting pattern sizing (featured cards larger than uniform)
      - Especially noticeable improvement when mixing long/short titles or showing/hiding abstracts
    - **Glass Morphism Effect for Dark Mode Publication Cards** (Visual Enhancement):
      - **Restored missing feature**: Glass-like effect for publication cards when section content mode is "Dark"
      - **Perfect for**: Hero sections with image/color backgrounds where white cards would clash
      - **Glass morphism styling** (works on BOTH solid colors AND images):
        - **Gradient overlay**: `linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)`
          - Creates **tint effect** on solid color backgrounds (15% → 5% white gradient)
          - Adds subtle light-to-dark wash for depth
        - `backdrop-blur-md` - Blurs background images behind card (12px blur)
        - `border border-white/30` - Bright white border glow (30% opacity) for definition
        - `shadow-2xl` - Strong elevated shadow for depth
        - `rounded-lg p-6` - Rounded corners and consistent padding
      - **Why gradient overlay?** 
        - `backdrop-blur` only works on textured backgrounds (images, patterns)
        - Solid colors have nothing to blur, so gradient provides visual tint/separation
        - Diagonal gradient (135deg) creates premium, dynamic look
      - **Light mode unchanged**: Clean white cards with subtle shadows
      - **Applies to**: Publication List and Publication Details widgets
      - **Industry standard**: Similar to modern UI libraries (iOS, Fluent Design, Material 3)
      - Creates stunning visual hierarchy on dark backgrounds (solid OR image) while maintaining excellent text readability
  - **Type System**:
    - `ListBasedWidget` interface for pattern inheritance
    - `SpanningPreset` type for pattern selection
    - `ListItemSpanningConfig` for pattern configuration
    - `SPANNING_PATTERNS` constant with preset definitions
    - `PATTERN_DESCRIPTIONS` for UI labels
  - **Rendering Logic**:
    - `applyListPattern()` utility applies patterns to item arrays
    - Converts pattern to `gridSpan` for Grid layouts
    - Converts pattern to `flexProperties` for Flex layouts
    - Publications render with individual grid/flex properties
  - **Future-Ready**:
    - Pattern system designed as core widget capability
    - Any widget displaying a collection can adopt this pattern
    - Later widgets (keywords, issues, galleries) get this for free by extending `ListBasedWidget`
  - **Use Cases Enabled**:
    - Tag clouds with staggered sizes (Masonry pattern)
    - Issue archives with latest issue as hero (Hero First pattern)
    - Article lists with featured first item (Featured First pattern)
    - Flexible emphasis for any list content
  - Status: `supported` for Publication List Widget
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

