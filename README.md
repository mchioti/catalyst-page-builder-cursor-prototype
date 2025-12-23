# Catalyst Page Builder

> **Next-generation Page Builder for Atypon's Publishing Platform**

A prototype page builder implementing a 3-layer architecture for creating and managing academic publishing websites with multi-design-system support.

---

## 🎯 Overview

Catalyst Page Builder (PB4) is a visual page builder designed for academic publishing platforms. It enables content creators to build journal homepages, article pages, and supporting pages using a drag-and-drop interface with support for multiple design systems.

### Key Features

- **🎨 Multi-Design System Support**: Wiley DS V2, Classic UX3, IBM Carbon, Ant Design
- **📦 Widget Library**: Core widgets (Text, Heading, Image, Button, Menu, Tabs) and Publishing widgets (Publication List, Publication Details)
- **🏗️ Section-Based Architecture**: Reusable sections with layout variations
- **📚 Schema.org Content Engine**: Universal data model for all publishing content
- **🎭 Theme System**: Foundation Design System with semantic tokens and brand modes
- **🛠️ DIY Zone**: Custom HTML/Code blocks for client-specific customization
- **💾 Live Preview**: Real-time preview with live site rendering

---

## 🏗️ Architecture

### 3-Layer Architecture

```
┌─────────────────────────────────────────────────┐
│  ATYPON FOUNDATION (Platform Layer)              │
│  - Core Widgets (Text, Heading, Image, Button)   │
│  - Publishing Widgets (Publication List/Card)    │
│  - DIY Widgets (HTML Block, Code Block)         │
│  - Sections (Layout Containers)                  │
└──────────────────┬──────────────────────────────┘
                   │
    ┌──────────────┴──────────────┬──────────────┐
    │                            │              │
┌───┴────┐              ┌────────┴────┐  ┌─────┴─────┐
│ Design │              │ Schema.org  │  │  Themes  │
│Systems │              │  Archive    │  │          │
├────────┤              ├─────────────┤  ├──────────┤
│Wiley   │              │100+ types   │  │Colors    │
│Carbon  │              │JSON-LD      │  │Typography│
│Ant     │              │CRUD ops     │  │Spacing   │
│Classic │              │             │  │          │
└────────┘              └─────────────┘  └──────────┘
```

### Foundation Design System

The Page Builder uses a **Foundation Design System** - a universal token contract that maps to theme-specific values:

- **Layer 1: Foundation** - Raw values (colors, typography, spacing)
- **Layer 2: Semantic** - Purpose-mapped tokens (primary, secondary, text, background)
- **Layer 3: Component** - Widget-specific tokens (button, card, input)

Themes provide adapters that map their design tokens to Foundation tokens, enabling widget code to be theme-agnostic.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Available Routes

- `/v1` - Main Page Builder interface (default)
- `/v2` - Experimental V2 interface
- `/edit/:websiteId/*` - Page Builder Editor
- `/live/:websiteId/*` - Live Site Preview

---

## 📦 Project Structure

```
src/
├── components/
│   ├── PageBuilder/        # Main canvas and editor
│   ├── Properties/         # Properties panel for widget editing
│   ├── Widgets/           # Widget renderers
│   ├── Sections/          # Section renderers
│   ├── SiteManager/        # Website and theme management
│   ├── DesignConsole/      # Design system console
│   ├── LiveSite/          # Live site preview
│   └── Publications/       # Publication card components
├── foundation/
│   ├── adapters/           # Theme adapters (Wiley, Carbon, Ant, Classic)
│   ├── components/         # Foundation components (Button, Text, Heading)
│   └── tokens/             # Token contracts and resolvers
├── stores/                 # Zustand state management
├── types/                  # TypeScript type definitions
├── data/                   # Mock data (themes, websites, sections)
└── utils/                  # Utility functions
```

---

## 🎨 Design Systems

### Supported Themes

1. **Wiley DS V2** (`wiley-figma-ds-v2`)
   - Multi-brand support (Wiley, WT, Dummies)
   - Figma-extracted design tokens
   - Semantic color system with light/dark variants

2. **Classic UX3** (`classic-ux3-theme`)
   - Clean, minimalist design
   - Serif + sans-serif typography
   - 8-point grid spacing system

3. **IBM Carbon** (`ibm-carbon-ds`)
   - Enterprise design system
   - Medical/minimal aesthetic

4. **Ant Design** (`ant-design`)
   - Friendly, approachable design
   - Component-rich system

---

## 📚 Widget Types

### Core Widgets
- **Text** - Rich text content with typography styles
- **Heading** - Headings (H1-H6) with style variants
- **Image** - Image display with alt text and sizing
- **Button** - Buttons with style/color variants
- **Menu** - Navigation menus (horizontal/vertical)
- **Tabs** - Tabbed content sections
- **Spacer** - Vertical spacing control
- **Divider** - Visual separators

### Publishing Widgets
- **Publication List** - Lists of articles/books with configurable cards
- **Publication Details** - Single publication display
- **Publication Card** - Universal card component (100+ config options)

### DIY Widgets
- **HTML Block** - Custom HTML with iframe sandbox
- **Code Block** - Syntax-highlighted code display

---

## 🛠️ Development

### Scripts

```bash
# Development
npm run dev              # Start dev server

# Building
npm run build            # Build for production
npm run preview          # Preview production build

# Testing
npm run test             # Run all tests
npm run test:smoke       # Run smoke tests
npm run test:automated   # Run automated tests
npm run test:ui          # Run tests with UI
npm run test:report      # Show test report

# Linting
npm run lint             # Run ESLint
```

### Key Technologies

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Zustand** - State management
- **React Router** - Routing
- **Tailwind CSS** - Utility-first CSS (for UI only)
- **@dnd-kit** - Drag and drop
- **Playwright** - E2E testing

---

## 📖 Documentation

- **[HANDOFF_DOCUMENTATION.md](./HANDOFF_DOCUMENTATION.md)** - Complete system overview and architecture
- **[PageBuilder-Widgets-Skill.md](./PageBuilder-Widgets-Skill.md)** - Widget reference for external agents
- **[PageBuilder-Page-Examples-Skill.md](./PageBuilder-Page-Examples-Skill.md)** - Page examples and patterns
- **[PageBuilder-Best-Practices-Skill.md](./PageBuilder-Best-Practices-Skill.md)** - Best practices and guidelines
- **[PageBuilder-Agent-Communication.md](./PageBuilder-Agent-Communication.md)** - Agent communication protocol
- **[CHANGELOG.md](./CHANGELOG.md)** - Version history and changes

---

## 🎯 Current Status

**90% MVP Complete**

✅ **Implemented:**
- All core widget types
- Publishing widgets with Schema.org support
- Multi-design system architecture
- Complete theming system (colors, typography, spacing)
- Section-based page composition
- Live preview and editing
- Design Console for theme/website management

⚠️ **In Progress:**
- Content Engine backend (query builder, CMS integration)
- Template divergence tracking
- Widget promotion system

---

## 🤝 Contributing

This is a prototype project. For questions or contributions, please refer to the handoff documentation.

---

## 📄 License

Private project - Atypon

---

## 🙏 Acknowledgments

Built with:
- React + TypeScript + Vite
- Foundation Design System architecture
- Schema.org content modeling
- Multiple design system integrations (Wiley, Carbon, Ant Design)
