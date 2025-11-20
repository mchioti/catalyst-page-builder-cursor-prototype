export type LibraryItemStatus = 'supported' | 'planned' | 'deprecated' | 'advanced' | 'publisher'

export type LibraryItem = {
  id: string
  label: string
  type: 'text' | 'image' | 'navbar' | 'menu' | 'button' | 'link' | 'divider' | 'spacer' | 'table' | 'page-index' | 'tabs' | 'collapse' | 'slideshow' | 'cta' | 'feedback-form' | 'recommend-to-library' | 'heading' | 'html-block' | 'code-block' | 'publication-list' | 'publication-details' | 'saved-searches' | 'cross-publisher-recs' | 'deployment-indicator' | 'locale-changer' | 'saml-errors' | 'editorial-card'
  description?: string
  skin?: 'modern' | 'classic' | 'minimal' | 'accent'
  status: LibraryItemStatus
  legacy?: { axpCategory?: string; internalName?: string }
}

export type LibrarySubcategory = {
  id: string
  name: string
  items: LibraryItem[]
}

export type LibraryCategory = {
  id: string
  name: string
  items?: LibraryItem[]
  groups?: LibrarySubcategory[]
}

export const LIBRARY_CONFIG: LibraryCategory[] = [
  {
    id: 'core',
    name: 'Core Widgets',
    groups: [
      {
        id: 'core-page-elements',
        name: 'Page Elements',
        items: [
          { id: 'text', label: 'Text', type: 'text', description: 'Paragraph or rich text', skin: 'minimal', status: 'supported' },
          { id: 'heading', label: 'Heading', type: 'heading', description: 'Structured heading styles', skin: 'minimal', status: 'supported' },
          { id: 'image', label: 'Image', type: 'image', description: 'Static image', skin: 'minimal', status: 'supported' },
          { id: 'button', label: 'Button Link', type: 'button', description: 'Links and actions', skin: 'minimal', status: 'supported' },
          { id: 'divider', label: 'Divider', type: 'divider', description: 'Horizontal rule', status: 'supported' },
          { id: 'spacer', label: 'Spacer', type: 'spacer', description: 'Vertical space', status: 'supported' },
        ],
      },
      {
        id: 'core-content-cards',
        name: 'Content Cards',
        items: [
          { id: 'editorial-card', label: 'Editorial Card', type: 'editorial-card', description: 'Marketing/editorial content card with layouts', status: 'supported' },
        ],
      },
      {
        id: 'core-navigation',
        name: 'Navigation',
        items: [
          { id: 'menu', label: 'Menu', type: 'menu', description: 'Context-aware navigation menu', skin: 'minimal', status: 'supported', legacy: { axpCategory: 'Navigation widgets', internalName: 'menu' } },
          { id: 'breadcrumbs', label: 'Breadcrumbs', type: 'link', description: 'Alternative navigation aid', status: 'planned' },
          { id: 'social-links', label: 'Social Links', type: 'link', description: 'Icons linking to social profiles', status: 'planned' },
        ],
      },
      {
        id: 'core-interactive',
        name: 'Interactive',
        items: [
          { id: 'table', label: 'Table', type: 'table', description: 'Responsive data grid', status: 'planned' },
          { id: 'page-index', label: 'Page Index', type: 'page-index', description: 'Table of contents', status: 'planned' },
          { id: 'tabs', label: 'Tabs', type: 'tabs', description: 'Tabbed content', status: 'supported' },
          { id: 'collapse', label: 'Collapse', type: 'collapse', description: 'Expandable content (accordion)', status: 'supported' },
          { id: 'slideshow', label: 'Slideshow', type: 'slideshow', description: 'Carousel / slideshow', status: 'planned' },
          { id: 'cta', label: 'Generic CTA', type: 'cta', description: 'Call to action', status: 'planned' },
          { id: 'feedback-form', label: 'Feedback Form', type: 'feedback-form', description: 'Collect feedback', status: 'planned', legacy: { axpCategory: 'General', internalName: 'literatumFeedbackWidget' } },
          { id: 'recommend-to-library', label: 'Recommend to Library', type: 'recommend-to-library', description: 'Recommend content', status: 'planned' },
        ],
      },
    ],
  },
  {
    id: 'publishing',
    name: 'Publishing Widgets',
    groups: [
      {
        id: 'publishing-lists',
        name: 'Publication Lists',
        items: [
          { id: 'publication-list', label: 'Publication Lists', type: 'publication-list', description: 'Curated/dynamic lists', status: 'supported' },
        ],
      },
      {
        id: 'publishing-details',
        name: 'Publication Details',
        items: [
          { id: 'publication-details', label: 'Publication Details', type: 'publication-details', description: 'Single publication display with flexible data sources', status: 'supported' },
        ],
      },
      {
        id: 'publishing-structure',
        name: 'Content Structure & Discovery',
        items: [
          { id: 'saved-searches', label: 'Saved Searches', type: 'saved-searches', description: 'User saved queries', status: 'planned', legacy: { axpCategory: 'Search', internalName: 'literatumSavedSearchesWidget' } },
          { id: 'cross-publisher-recs', label: 'Cross Publisher Recs', type: 'cross-publisher-recs', description: 'Recommendations', status: 'planned', legacy: { axpCategory: 'Search', internalName: 'crossPublishersRecommendationsWidget' } },
        ],
      },
    ],
  },
  {
    id: 'system',
    name: 'System Widgets',
    items: [
      { id: 'deployment-indicator', label: 'Deployment Indicator', type: 'deployment-indicator', description: 'Environment banner', status: 'planned', legacy: { axpCategory: 'General', internalName: 'deployment-widget' } },
      { id: 'locale-changer', label: 'Locale Changer', type: 'locale-changer', description: 'Switch locales', status: 'planned', legacy: { axpCategory: 'General', internalName: 'literatumLocaleChanger' } },
      { id: 'saml-errors', label: 'SAML Errors', type: 'saml-errors', description: 'Auth errors', status: 'planned', legacy: { axpCategory: 'General', internalName: 'samlErrorsWidget' } },
    ],
  },
  {
    id: 'deprecated',
    name: 'Deprecated',
    items: [
      { id: 'preview-trials', label: 'Preview Trials', type: 'cta', description: 'Legacy trials widget', status: 'deprecated', legacy: { axpCategory: 'General', internalName: 'previewTrialsWidget' } },
    ],
  },
]


