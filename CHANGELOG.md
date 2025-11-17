# Changelog

All notable changes to the Catalyst Page Builder prototype will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

---

## [v0.3.0] - 2024-11-17

### Added
- **Starter Pages Persistence**: User-created starter pages now persist across server restarts using localStorage
- **Mock Demo Data**: Pre-defined FEBS homepage variants (2017, 2020) and Catalyst templates for demos
- **Design Library**: New consolidated view for saved starter pages and sections per website
  - Tabbed interface for Starter Pages and Sections
  - Search functionality for both types
  - Preview and Delete actions
  - Website-scoped filtering
- **Source Tracking**: Added `source` field ('mock' | 'user') to distinguish demo data from user-created content
- **"Save as Starter Page" Button**: Added to Page Builder header (next to "Switch to Template Mode")
  - Prompts for name and description
  - Deep clones canvas with regenerated IDs
  - Automatically tagged with 'user' source

### Changed
- **Templates View Refinement**: Now shows ONLY Publication Page Templates
  - Removed Website and Supporting page templates (now "Starter Pages")
  - Removed Global and Section templates (now in "Sections")
  - Removed sidebar navigation (no longer needed with single category)
  - Applies to both Website Templates view and Add Website dialog
- **Custom Templates → Design Library**: Renamed menu item for clarity
- **Section Saving**: Now includes `websiteId` and `source` fields for proper scoping
- **DIY Zone**: Removed "+ Save Current Canvas" button (individual section save buttons preferred)

### Fixed
- **Templates Regression**: Fixed sections and starter pages incorrectly appearing in templates view
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

