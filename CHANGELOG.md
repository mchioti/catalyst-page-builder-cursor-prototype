# Changelog

All notable changes to the Catalyst Page Builder prototype will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- **Prototype Controls Panel**: Floating panel at bottom of screen for switching personas and console modes
  - 3 personas: Publisher, PB Admin, Developer
  - Console modes: Multi-Website Publisher, Single Website
  - Available across all views (Design Console, Page Builder, Mock Live Site)
  - Replaces old console mode toggle in Design Console header
- **PB Admin Persona**: New admin role for managing design system assets
  - Purple "PB Admin Mode" badge in theme libraries
  - "Create New Template/Stub/Section" button (purple) visible only to PB Admin
  - Foundation for future admin capabilities (edit, duplicate, move between themes)

### Changed
- **Terminology Update**: Renamed "Starter Pages" to "Stubs" throughout the UI
  - Page Builder: "Save as Starter Page" → "Save as Stub"
  - DIY Zone: "Saved Starter Pages" → "Saved Stubs"
  - Design Console: "Starter Page Library" → "Stub Library"
  - Design Library: "Saved Starter Pages" tab → "Saved Stubs"
  - All empty states, prompts, and tooltips updated
  - Icon changed from Plus to FileText for stub sections
- **Console Mode Management**: Moved from Design Console header to Prototype Controls panel
- **State Management**: Added `currentPersona` and `consoleMode` to global Zustand store

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

