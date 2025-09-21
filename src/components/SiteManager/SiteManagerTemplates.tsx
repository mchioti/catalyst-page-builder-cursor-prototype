import { useState } from 'react'
import { Search, Plus, Filter, X } from 'lucide-react'

// Template categories - 2 main types: page templates and section templates
type TemplateCategory = 'website' | 'publication' | 'supporting' | 'global' | 'section'

type Template = {
  id: string
  name: string
  description: string
  category: TemplateCategory
  inheritsFrom: string
  overrides: number
  createdAt: Date
  updatedAt: Date
  createdBy: string
  usageCount: number
  tags: string[]
  thumbnail?: string
  status: 'active' | 'draft' | 'archived'
}

// Website Page Templates from mockup
const WEBSITE_TEMPLATES: Template[] = [
  {
    id: 'theme-global-sections',
    name: 'Theme (Global sections)',
    description: 'Base theme with global sections like headers and footers',
    category: 'website',
    inheritsFrom: 'Academic Publishing Theme',
    overrides: 0,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-03-15'),
    createdBy: 'System',
    usageCount: 100,
    tags: ['theme', 'global', 'sections'],
    status: 'active'
  },
  {
    id: 'website-homepage',
    name: 'Website Homepage',
    description: 'Homepage template for the publisher site',
    category: 'website',
    inheritsFrom: 'Theme (Global sections)',
    overrides: 1,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-03-10'),
    createdBy: 'Admin User',
    usageCount: 75,
    tags: ['home', 'homepage', 'landing'],
    status: 'active'
  },
  {
    id: 'search-results',
    name: 'Search results',
    description: 'Template for displaying search results',
    category: 'website',
    inheritsFrom: 'Theme (Global sections)',
    overrides: 0,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-02-28'),
    createdBy: 'Dev Team',
    usageCount: 45,
    tags: ['search', 'results', 'listing'],
    status: 'active'
  },
  {
    id: 'advanced-search',
    name: 'Advanced Search',
    description: 'Advanced search page with filters and options',
    category: 'website',
    inheritsFrom: 'Theme (Global sections)',
    overrides: 0,
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-03-01'),
    createdBy: 'Dev Team',
    usageCount: 32,
    tags: ['search', 'advanced', 'filters'],
    status: 'active'
  },
  {
    id: 'browse',
    name: 'Browse',
    description: 'General browse page for content navigation',
    category: 'website',
    inheritsFrom: 'Theme (Global sections)',
    overrides: 0,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-03-05'),
    createdBy: 'UX Team',
    usageCount: 58,
    tags: ['browse', 'navigation', 'content'],
    status: 'active'
  },
  {
    id: 'subject-browse-taxonomy',
    name: 'Subject Browse (Taxonomy)',
    description: 'Browse content by subject taxonomy',
    category: 'website',
    inheritsFrom: 'Option: Theme, Search, Browse',
    overrides: 0,
    createdAt: new Date('2024-02-05'),
    updatedAt: new Date('2024-03-08'),
    createdBy: 'Content Team',
    usageCount: 28,
    tags: ['browse', 'taxonomy', 'subjects'],
    status: 'active'
  },
  {
    id: 'content-browse-az',
    name: 'Content Browse (A-Z title)',
    description: 'Browse content alphabetically by title',
    category: 'website',
    inheritsFrom: 'Option: Theme, Search, Browse',
    overrides: 1,
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-03-12'),
    createdBy: 'Content Team',
    usageCount: 35,
    tags: ['browse', 'alphabetical', 'titles'],
    status: 'active'
  },
  {
    id: 'profile-institutional-admin',
    name: 'Profile and Institutional Admin pages',
    description: 'User profile and institutional administration pages',
    category: 'website',
    inheritsFrom: 'Theme (Global sections)',
    overrides: 0,
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-03-18'),
    createdBy: 'Auth Team',
    usageCount: 22,
    tags: ['profile', 'admin', 'institutional'],
    status: 'active'
  },
  {
    id: 'error-pages',
    name: 'Error pages',
    description: '404, 500, and other error page templates',
    category: 'website',
    inheritsFrom: 'Theme (Global sections)',
    overrides: 0,
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-03-20'),
    createdBy: 'Dev Team',
    usageCount: 15,
    tags: ['error', '404', '500'],
    status: 'active'
  },
  {
    id: 'ecommerce',
    name: 'eCommerce',
    description: 'Base eCommerce template for online sales',
    category: 'website',
    inheritsFrom: 'Theme (Global sections)',
    overrides: 0,
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-22'),
    createdBy: 'eCommerce Team',
    usageCount: 12,
    tags: ['ecommerce', 'sales', 'commerce'],
    status: 'active'
  },
  {
    id: 'cart',
    name: 'Cart',
    description: 'Shopping cart page template',
    category: 'website',
    inheritsFrom: 'eCommerce',
    overrides: 0,
    createdAt: new Date('2024-03-05'),
    updatedAt: new Date('2024-03-25'),
    createdBy: 'eCommerce Team',
    usageCount: 8,
    tags: ['cart', 'shopping', 'ecommerce'],
    status: 'active'
  },
  {
    id: 'checkout',
    name: 'Checkout',
    description: 'Checkout and payment page template',
    category: 'website',
    inheritsFrom: 'eCommerce',
    overrides: 0,
    createdAt: new Date('2024-03-08'),
    updatedAt: new Date('2024-03-28'),
    createdBy: 'eCommerce Team',
    usageCount: 6,
    tags: ['checkout', 'payment', 'ecommerce'],
    status: 'active'
  }
]

// Section Templates - Reusable components
const SECTION_TEMPLATES: Template[] = [
  {
    id: 'global-header-standard',
    name: 'Standard Header',
    description: 'Default header template with logo, navigation, and search functionality',
    category: 'global',
    inheritsFrom: 'Theme (Global sections)',
    overrides: 0,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-03-10'),
    createdBy: 'Admin User',
    usageCount: 45,
    tags: ['header', 'navigation', 'global', 'responsive'],
    status: 'active'
  },
  {
    id: 'global-footer-standard',
    name: 'Standard Footer',
    description: 'Footer template with links, copyright, and contact information',
    category: 'global',
    inheritsFrom: 'Theme (Global sections)',
    overrides: 0,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-02-28'),
    createdBy: 'Admin User',
    usageCount: 42,
    tags: ['footer', 'links', 'global', 'contact'],
    status: 'active'
  },
  {
    id: 'global-navigation-mega',
    name: 'Mega Navigation Menu',
    description: 'Comprehensive navigation with dropdown categories and search',
    category: 'global',
    inheritsFrom: 'Theme (Global sections)',
    overrides: 0,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-03-15'),
    createdBy: 'Design Team',
    usageCount: 23,
    tags: ['navigation', 'dropdown', 'search', 'comprehensive'],
    status: 'active'
  },
  {
    id: 'global-breadcrumb',
    name: 'Breadcrumb Navigation',
    description: 'Site navigation breadcrumb component for all pages',
    category: 'global',
    inheritsFrom: 'Theme (Global sections)',
    overrides: 0,
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-03-01'),
    createdBy: 'UX Team',
    usageCount: 67,
    tags: ['breadcrumb', 'navigation', 'site-structure'],
    status: 'active'
  },
  {
    id: 'global-search-bar',
    name: 'Global Search Bar',
    description: 'Advanced search component with filters and autocomplete',
    category: 'global',
    inheritsFrom: 'Theme (Global sections)',
    overrides: 0,
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-03-20'),
    createdBy: 'Dev Team',
    usageCount: 38,
    tags: ['search', 'filters', 'autocomplete', 'global'],
    status: 'active'
  },
  {
    id: 'global-user-account',
    name: 'User Account Menu',
    description: 'User login/account management dropdown menu',
    category: 'global',
    inheritsFrom: 'Theme (Global sections)',
    overrides: 0,
    createdAt: new Date('2024-01-30'),
    updatedAt: new Date('2024-03-05'),
    createdBy: 'Auth Team',
    usageCount: 55,
    tags: ['user', 'account', 'authentication', 'dropdown'],
    status: 'active'
  },
  {
    id: 'global-notification-banner',
    name: 'Notification Banner',
    description: 'Site-wide notification banner for announcements',
    category: 'global',
    inheritsFrom: 'Theme (Global sections)',
    overrides: 0,
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-03-12'),
    createdBy: 'Content Team',
    usageCount: 12,
    tags: ['notifications', 'announcements', 'banner'],
    status: 'draft'
  },
  {
    id: 'global-cookie-consent',
    name: 'Cookie Consent Bar',
    description: 'GDPR-compliant cookie consent notification bar',
    category: 'global',
    inheritsFrom: 'Theme (Global sections)',
    overrides: 0,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-02-20'),
    createdBy: 'Legal Team',
    usageCount: 78,
    tags: ['cookies', 'consent', 'gdpr', 'legal'],
    status: 'active'
  }
]

// Publication Page Templates - Journal and article page layouts
const PUBLICATION_TEMPLATES: Template[] = [
  {
    id: 'publication-pages',
    name: 'Publication Pages',
    description: 'Root template for all publication-related pages',
    category: 'publication',
    inheritsFrom: 'Theme (Global sections)',
    overrides: 0,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-03-15'),
    createdBy: 'Publishing Team',
    usageCount: 85,
    tags: ['publication', 'root', 'template'],
    status: 'active'
  },
  {
    id: 'journal-home',
    name: 'Journal Home',
    description: 'Homepage for individual journals',
    category: 'publication',
    inheritsFrom: 'Publication Pages',
    overrides: 2,
    createdAt: new Date('2024-01-22'),
    updatedAt: new Date('2024-03-18'),
    createdBy: 'Editorial Team',
    usageCount: 45,
    tags: ['journal', 'homepage', 'editorial'],
    status: 'active'
  },
  {
    id: 'table-of-contents',
    name: 'Table Of Contents',
    description: 'Table of contents for journal issues',
    category: 'publication',
    inheritsFrom: 'Publication Pages',
    overrides: 0,
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-03-20'),
    createdBy: 'Editorial Team',
    usageCount: 38,
    tags: ['toc', 'issue', 'contents'],
    status: 'active'
  },
  {
    id: 'list-of-issues',
    name: 'List of Issues',
    description: 'Archive listing of journal issues',
    category: 'publication',
    inheritsFrom: 'Publication Pages',
    overrides: 0,
    createdAt: new Date('2024-01-28'),
    updatedAt: new Date('2024-03-22'),
    createdBy: 'Editorial Team',
    usageCount: 35,
    tags: ['issues', 'archive', 'listing'],
    status: 'active'
  },
  {
    id: 'article',
    name: 'Article',
    description: 'Individual article page template',
    category: 'publication',
    inheritsFrom: 'Publication Pages',
    overrides: 10,
    createdAt: new Date('2024-01-30'),
    updatedAt: new Date('2024-03-25'),
    createdBy: 'Publishing Team',
    usageCount: 120,
    tags: ['article', 'content', 'academic'],
    status: 'active'
  },
  {
    id: 'book-series',
    name: 'Book Series',
    description: 'Book series landing page',
    category: 'publication',
    inheritsFrom: 'Publication Pages',
    overrides: 0,
    createdAt: new Date('2024-02-02'),
    updatedAt: new Date('2024-03-28'),
    createdBy: 'Book Team',
    usageCount: 15,
    tags: ['book', 'series', 'collection'],
    status: 'active'
  },
  {
    id: 'book-set',
    name: 'Book Set',
    description: 'Book set collection page',
    category: 'publication',
    inheritsFrom: 'Publication Pages',
    overrides: 0,
    createdAt: new Date('2024-02-05'),
    updatedAt: new Date('2024-03-30'),
    createdBy: 'Book Team',
    usageCount: 12,
    tags: ['book', 'set', 'collection'],
    status: 'active'
  },
  {
    id: 'book',
    name: 'Book',
    description: 'Individual book page template',
    category: 'publication',
    inheritsFrom: 'Publication Pages',
    overrides: 0,
    createdAt: new Date('2024-02-08'),
    updatedAt: new Date('2024-04-02'),
    createdBy: 'Book Team',
    usageCount: 25,
    tags: ['book', 'individual', 'publication'],
    status: 'active'
  },
  {
    id: 'chapter',
    name: 'Chapter',
    description: 'Individual book chapter page',
    category: 'publication',
    inheritsFrom: 'Publication Pages',
    overrides: 0,
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-04-05'),
    createdBy: 'Book Team',
    usageCount: 18,
    tags: ['chapter', 'book', 'content'],
    status: 'active'
  }
]

// Supporting Pages Templates - Auxiliary and supporting pages
const SUPPORTING_PAGES_TEMPLATES: Template[] = [
  {
    id: 'supporting-pages',
    name: 'Supporting Pages',
    description: 'Root template for general supporting pages',
    category: 'supporting',
    inheritsFrom: 'Theme (Global sections)',
    overrides: 0,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-03-05'),
    createdBy: 'Content Team',
    usageCount: 60,
    tags: ['supporting', 'root', 'template'],
    status: 'active'
  },
  {
    id: 'about',
    name: 'About',
    description: 'About page for organization information',
    category: 'supporting',
    inheritsFrom: 'Supporting Pages',
    overrides: 1,
    createdAt: new Date('2024-01-22'),
    updatedAt: new Date('2024-03-08'),
    createdBy: 'Content Team',
    usageCount: 25,
    tags: ['about', 'company', 'organization'],
    status: 'active'
  },
  {
    id: 'contact-us',
    name: 'Contact Us',
    description: 'Contact page with forms and contact information',
    category: 'supporting',
    inheritsFrom: 'Supporting Pages',
    overrides: 1,
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-03-10'),
    createdBy: 'Content Team',
    usageCount: 30,
    tags: ['contact', 'form', 'support'],
    status: 'active'
  },
  {
    id: 'privacy-policy',
    name: 'Privacy Policy',
    description: 'Privacy policy and data protection information',
    category: 'supporting',
    inheritsFrom: 'Supporting Pages',
    overrides: 0,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-03-12'),
    createdBy: 'Legal Team',
    usageCount: 40,
    tags: ['privacy', 'legal', 'gdpr'],
    status: 'active'
  },
  {
    id: 'terms-conditions',
    name: 'Terms and Conditions',
    description: 'Terms of service and usage conditions',
    category: 'supporting',
    inheritsFrom: 'Supporting Pages',
    overrides: 0,
    createdAt: new Date('2024-02-03'),
    updatedAt: new Date('2024-03-14'),
    createdBy: 'Legal Team',
    usageCount: 35,
    tags: ['terms', 'legal', 'conditions'],
    status: 'active'
  },
  {
    id: 'accessibility-statement',
    name: 'Accessibility Conformance Statement',
    description: 'Accessibility compliance and conformance information',
    category: 'supporting',
    inheritsFrom: 'Supporting Pages',
    overrides: 0,
    createdAt: new Date('2024-02-05'),
    updatedAt: new Date('2024-03-16'),
    createdBy: 'Legal Team',
    usageCount: 20,
    tags: ['accessibility', 'compliance', 'legal'],
    status: 'active'
  },
  {
    id: 'cookie-policy',
    name: 'Cookie Policy',
    description: 'Cookie usage and management policy',
    category: 'supporting',
    inheritsFrom: 'Supporting Pages',
    overrides: 0,
    createdAt: new Date('2024-02-08'),
    updatedAt: new Date('2024-03-18'),
    createdBy: 'Legal Team',
    usageCount: 32,
    tags: ['cookies', 'privacy', 'legal'],
    status: 'active'
  },
  {
    id: 'supporting-journal-pages',
    name: 'Supporting Journal Pages',
    description: 'Root template for journal-specific supporting pages',
    category: 'supporting',
    inheritsFrom: 'Publication Pages',
    overrides: 0,
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-03-20'),
    createdBy: 'Editorial Team',
    usageCount: 45,
    tags: ['journal', 'supporting', 'editorial'],
    status: 'active'
  },
  {
    id: 'editorial-board',
    name: 'Editorial Board',
    description: 'Editorial board member listings and information',
    category: 'supporting',
    inheritsFrom: 'Supporting Journal Pages',
    overrides: 2,
    createdAt: new Date('2024-02-12'),
    updatedAt: new Date('2024-03-22'),
    createdBy: 'Editorial Team',
    usageCount: 28,
    tags: ['editorial', 'board', 'staff'],
    status: 'active'
  },
  {
    id: 'author-guidelines',
    name: 'Author Guidelines',
    description: 'Guidelines and instructions for authors',
    category: 'supporting',
    inheritsFrom: 'Supporting Journal Pages',
    overrides: 0,
    createdAt: new Date('2024-02-14'),
    updatedAt: new Date('2024-03-24'),
    createdBy: 'Editorial Team',
    usageCount: 35,
    tags: ['author', 'guidelines', 'instructions'],
    status: 'active'
  },
  {
    id: 'reviewer-guidelines',
    name: 'Reviewer Guidelines',
    description: 'Guidelines and instructions for peer reviewers',
    category: 'supporting',
    inheritsFrom: 'Supporting Journal Pages',
    overrides: 0,
    createdAt: new Date('2024-02-16'),
    updatedAt: new Date('2024-03-26'),
    createdBy: 'Editorial Team',
    usageCount: 22,
    tags: ['reviewer', 'guidelines', 'peer-review'],
    status: 'active'
  },
  {
    id: 'aims-scope',
    name: 'Aims & Scope',
    description: 'Journal aims, scope, and focus areas',
    category: 'supporting',
    inheritsFrom: 'Supporting Journal Pages',
    overrides: 6,
    createdAt: new Date('2024-02-18'),
    updatedAt: new Date('2024-03-28'),
    createdBy: 'Editorial Team',
    usageCount: 40,
    tags: ['aims', 'scope', 'journal-info'],
    status: 'active'
  },
  {
    id: 'subscribe-purchase',
    name: 'Subscribe / Purchase',
    description: 'Subscription and purchase information page',
    category: 'supporting',
    inheritsFrom: 'Supporting Journal Pages',
    overrides: 2,
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-03-30'),
    createdBy: 'Sales Team',
    usageCount: 18,
    tags: ['subscription', 'purchase', 'sales'],
    status: 'active'
  },
  {
    id: 'news-announcements',
    name: 'News / Announcements',
    description: 'Journal news and announcements page',
    category: 'supporting',
    inheritsFrom: 'Supporting Journal Pages',
    overrides: 0,
    createdAt: new Date('2024-02-22'),
    updatedAt: new Date('2024-04-01'),
    createdBy: 'Editorial Team',
    usageCount: 25,
    tags: ['news', 'announcements', 'updates'],
    status: 'active'
  }
]

// Content Section Templates - Individual content components  
const CONTENT_SECTION_TEMPLATES: Template[] = [
  {
    id: 'section-hero-banner',
    name: 'Hero Banner',
    description: 'Large hero section with title, subtitle, and call-to-action',
    category: 'section',
    inheritsFrom: 'Base Section',
    overrides: 0,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-03-15'),
    createdBy: 'Design Team',
    usageCount: 32,
    tags: ['hero', 'banner', 'cta', 'landing'],
    status: 'active'
  },
  {
    id: 'section-article-list',
    name: 'Article List',
    description: 'Grid or list view of articles with thumbnails and excerpts',
    category: 'section',
    inheritsFrom: 'Base Section',
    overrides: 0,
    createdAt: new Date('2024-02-05'),
    updatedAt: new Date('2024-03-20'),
    createdBy: 'Content Team',
    usageCount: 28,
    tags: ['articles', 'list', 'grid', 'content'],
    status: 'active'
  },
  {
    id: 'section-featured-content',
    name: 'Featured Content',
    description: 'Highlighted content section for promoting key articles or journals',
    category: 'section',
    inheritsFrom: 'Base Section',
    overrides: 0,
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-03-18'),
    createdBy: 'Editorial Team',
    usageCount: 19,
    tags: ['featured', 'highlight', 'promotion', 'editorial'],
    status: 'active'
  },
  {
    id: 'section-author-bio',
    name: 'Author Bio',
    description: 'Author biography section with photo, credentials, and publications',
    category: 'section',
    inheritsFrom: 'Base Section',
    overrides: 0,
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-03-22'),
    createdBy: 'Content Team',
    usageCount: 15,
    tags: ['author', 'biography', 'credentials', 'academic'],
    status: 'active'
  }
]

interface SiteManagerTemplatesProps {
  // Could accept store props if needed later
}

export function SiteManagerTemplates({}: SiteManagerTemplatesProps) {
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory>('website')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'draft' | 'archived'>('all')
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const categories = [
    { key: 'website', label: 'Website Page Templates', description: 'Complete pages for the Publisher\'s site', type: 'page' },
    { key: 'publication', label: 'Publication Page Templates', description: 'Complete journal and article page layouts', type: 'page' },
    { key: 'supporting', label: 'Supporting Pages Templates', description: 'Supporting and auxiliary page layouts', type: 'page' },
    { key: 'global', label: 'Global Section Templates', description: 'Reusable components like headers, footers, navigation', type: 'section' },
    { key: 'section', label: 'Content Section Templates', description: 'Individual content components and sections', type: 'section' }
  ] as const

  // Combine all templates
  const allTemplates = [...WEBSITE_TEMPLATES, ...PUBLICATION_TEMPLATES, ...SUPPORTING_PAGES_TEMPLATES, ...SECTION_TEMPLATES, ...CONTENT_SECTION_TEMPLATES]
  
  // Filter templates based on selected category, search, and status
  const filteredTemplates = allTemplates.filter(template => {
    const matchesCategory = template.category === selectedCategory
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = filterStatus === 'all' || template.status === filterStatus
    
    return matchesCategory && matchesSearch && matchesStatus
  })

  const handleDuplicateTemplate = (template: Template) => {
    const duplicatedTemplate: Template = {
      ...template,
      id: `${template.id}-copy-${Date.now()}`,
      name: `${template.name} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: 0,
      status: 'draft'
    }
    console.log('Template duplicated:', duplicatedTemplate)
    // In real app: addTemplate(duplicatedTemplate)
    alert(`Template "${template.name}" duplicated successfully!`)
  }

  const handleEditTemplate = (template: Template) => {
    console.log('Opening editor for template:', template.id)
    // In real app: navigate to page builder
    alert(`Opening Page Builder for "${template.name}"...\n\nThis would launch the drag-and-drop editor where you can modify the template layout, content, and styling.`)
  }

  const handleDeleteTemplate = (template: Template) => {
    if (template.usageCount > 0) {
      alert(`Cannot delete "${template.name}"\n\nThis template is used by ${template.usageCount} pages. Remove all usages first.`)
      return
    }
    
    if (confirm(`Delete template "${template.name}"?\n\nThis action cannot be undone.`)) {
      console.log('Template deleted:', template.id)
      alert('Template deleted successfully!')
    }
  }

  const handleManageOverrides = (template: Template) => {
    console.log('Managing overrides for template:', template.id)
    // In real app: navigate to override management
    alert(`Managing Template Overrides for "${template.name}"\n\n${template.overrides} page(s) currently override this template.\n\nThis would show:\n• Which specific pages/journals have overrides\n• What changes were made in each override\n• Ability to approve/reject override requests`)
  }

  const handlePreviewTemplate = (template: Template) => {
    setSelectedTemplate(template)
    setShowPreview(true)
  }

  const handleCreateTemplate = () => {
    console.log('Creating new template for category:', selectedCategory)
    // In real app: navigate to template creation wizard
    alert(`Create New ${categories.find(c => c.key === selectedCategory)?.label.replace(' Templates', '')} Template\n\nThis would launch the Template Creation Wizard:\n\n1. Choose starting point (blank, existing template, or external)\n2. Configure template metadata\n3. Design in Page Builder\n4. Set inheritance and permissions\n5. Publish template`)
  }

  // Helper function to determine indentation level based on inheritance
  const getIndentationLevel = (template: Template): number => {
    // Root themes (no indentation)
    if (template.inheritsFrom === 'Academic Publishing Theme' || template.inheritsFrom === 'Corporate Publishing Theme') {
      return 0
    }
    
    // First level templates inheriting directly from Theme (Global sections)
    if (template.inheritsFrom === 'Theme (Global sections)') {
      return 1
    }
    
    // Second level templates (inherit from Publication Pages, Supporting Pages, etc.)
    if (template.inheritsFrom === 'Publication Pages' || template.inheritsFrom === 'Supporting Pages') {
      return 2
    }
    
    // Third level templates (inherit from Supporting Journal Pages, etc.)
    if (template.inheritsFrom === 'Supporting Journal Pages') {
      return 3
    }
    
    // Base section templates (no indentation)
    if (template.inheritsFrom === 'Base Section') {
      return 0
    }
    
    // Templates with multiple inheritance options
    if (template.inheritsFrom.includes('Option:') || template.inheritsFrom.includes(',')) {
      return 2
    }
    
    // Dynamic lookup for other inheritance patterns
    const parentTemplate = allTemplates.find(t => t.name === template.inheritsFrom)
    if (parentTemplate) {
      return getIndentationLevel(parentTemplate) + 1
    }
    
    return 1 // Default fallback
  }

  return (
    <>
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {categories.find(c => c.key === selectedCategory)?.label || 'Templates'}
              </h2>
              <p className="text-gray-600 mt-1">
                {categories.find(c => c.key === selectedCategory)?.description || 'Manage and organize templates across your publishing platform'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Total Templates</div>
              <div className="text-2xl font-bold text-gray-900">{filteredTemplates.length}</div>
            </div>
          </div>

          {/* Category-specific insights */}
          <div className="grid grid-cols-4 gap-4 mt-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-blue-700 text-sm font-medium">
                {selectedCategory === 'website' && 'Infrastructure'} 
                {selectedCategory === 'publication' && 'Content Generation'}
                {selectedCategory === 'supporting' && 'Creative Freedom'}
                {(selectedCategory === 'global' || selectedCategory === 'section') && 'Reusable Components'}
              </div>
              <div className="text-xs text-blue-600 mt-1">
                {selectedCategory === 'website' && 'Consistent site foundation with selective customization'}
                {selectedCategory === 'publication' && 'Enterprise-scale dynamic page generation'}
                {selectedCategory === 'supporting' && 'Compete with generic page builders'}
                {(selectedCategory === 'global' || selectedCategory === 'section') && 'Shared across multiple pages'}
              </div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-green-700 text-sm font-medium">
                {filteredTemplates.filter(t => t.status === 'active').length} Active
              </div>
              <div className="text-xs text-green-600 mt-1">Ready for use</div>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <div className="text-orange-700 text-sm font-medium">
                {filteredTemplates.reduce((sum, t) => sum + t.overrides, 0)} Overrides
              </div>
              <div className="text-xs text-orange-600 mt-1">Custom variations</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="text-purple-700 text-sm font-medium">
                {filteredTemplates.reduce((sum, t) => sum + t.usageCount, 0)} Websites
              </div>
              <div className="text-xs text-purple-600 mt-1">Using these templates</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search templates..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                  
                  <button 
                    onClick={handleCreateTemplate}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    New Template
                  </button>
                </div>
              </div>
            </div>

            {filteredTemplates.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <Filter className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
                <p className="text-gray-600">
                  {searchTerm ? 'Try adjusting your search terms.' : 'No templates in this category yet.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Template Name
                      </th>
                      <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Inherits From
                      </th>
                      <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTemplates.map((template) => (
                      <tr key={template.id} className="hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <div style={{ marginLeft: `${getIndentationLevel(template) * 20}px` }}>
                              <div className="flex items-center">
                                {getIndentationLevel(template) > 0 && (
                                  <div className="flex items-center mr-3">
                                    <div className="w-4 h-px bg-gray-300"></div>
                                    <div className="w-2 h-px bg-gray-300 transform rotate-90 -ml-1"></div>
                                  </div>
                                )}
                                <div className="flex items-center">
                                  {/* Category color indicator */}
                                  <div className={`w-2 h-2 rounded-full mr-2 ${
                                    template.category === 'website' ? 'bg-blue-500' :
                                    template.category === 'publication' ? 'bg-purple-500' :
                                    template.category === 'supporting' ? 'bg-green-500' :
                                    'bg-indigo-500'
                                  }`}></div>
                                  <div>
                                    <div className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                      {template.name}
                                      {template.overrides > 0 && (
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                          {template.overrides}
                                        </span>
                                      )}
                                      {template.status !== 'active' && (
                                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                                          template.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                          {template.status}
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-0.5">
                                      {template.usageCount} {template.category === 'website' || template.category === 'publication' ? 'website' : 'usage'}{template.usageCount !== 1 ? 's' : ''} • 
                                      Created {template.createdAt.toLocaleDateString()}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-500">
                          <span className="italic">{template.inheritsFrom}</span>
                        </td>
                        <td className="py-4 px-6 text-sm">
                          <div className="flex flex-col gap-1">
                            <button 
                              onClick={() => handleEditTemplate(template)}
                              className="text-blue-600 hover:text-blue-800 text-left transition-colors"
                            >
                              Edit Page Template
                            </button>
                            {template.overrides > 0 && (
                              <button 
                                onClick={() => handleManageOverrides(template)}
                                className="text-orange-600 hover:text-orange-800 text-left transition-colors"
                              >
                                Manage Template Overrides ({template.overrides})
                              </button>
                            )}
                            <div className="flex gap-2 mt-1">
                              <button 
                                onClick={() => handlePreviewTemplate(template)}
                                className="text-green-600 hover:text-green-800 text-xs transition-colors"
                              >
                                Preview
                              </button>
                              <button 
                                onClick={() => handleDuplicateTemplate(template)}
                                className="text-purple-600 hover:text-purple-800 text-xs transition-colors"
                              >
                                Duplicate
                              </button>
                              {template.usageCount === 0 && (
                                <button 
                                  onClick={() => handleDeleteTemplate(template)}
                                  className="text-red-600 hover:text-red-800 text-xs transition-colors"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Template Types</h3>
            <nav className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Page Templates</h4>
                <div className="text-xs text-gray-500 mb-3">Complete page layouts</div>
                <div className="space-y-1">
                  {categories.filter(cat => cat.type === 'page').map((category) => (
                    <button
                      key={category.key}
                      onClick={() => setSelectedCategory(category.key)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        selectedCategory === category.key
                          ? 'bg-blue-100 text-blue-900 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div>{category.label.replace(' Page Templates', '')}</div>
                      <div className="text-xs text-gray-500 mt-1">{category.description}</div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Section Templates</h4>
                <div className="text-xs text-gray-500 mb-3">Reusable components & sections</div>
                <div className="space-y-1">
                  {categories.filter(cat => cat.type === 'section').map((category) => (
                    <button
                      key={category.key}
                      onClick={() => setSelectedCategory(category.key)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        selectedCategory === category.key
                          ? 'bg-green-100 text-green-900 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div>{category.label.replace(' Section Templates', '')}</div>
                      <div className="text-xs text-gray-500 mt-1">{category.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </nav>

            {/* Color Legend */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Template Types</h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-gray-600">Website Infrastructure</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  <span className="text-gray-600">Content Generation</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-gray-600">Creative Sandbox</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  <span className="text-gray-600">Reusable Components</span>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>

      {showPreview && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Template Preview: {selectedTemplate.name}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedTemplate.category === 'website' && 'Website Infrastructure Template'}
                  {selectedTemplate.category === 'publication' && 'Dynamic Content Generation Template'} 
                  {selectedTemplate.category === 'supporting' && 'Custom Page Template (Creative Sandbox)'}
                  {(selectedTemplate.category === 'global' || selectedTemplate.category === 'section') && 'Reusable Component Template'}
                </p>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Template Metadata */}
              <div className="grid grid-cols-4 gap-4 mb-6 text-sm">
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-gray-500">Inherits From</div>
                  <div className="font-medium">{selectedTemplate.inheritsFrom}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-gray-500">Usage Count</div>
                  <div className="font-medium">{selectedTemplate.usageCount} {selectedTemplate.category === 'website' || selectedTemplate.category === 'publication' ? 'websites' : 'instances'}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-gray-500">Overrides</div>
                  <div className="font-medium">{selectedTemplate.overrides}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-gray-500">Status</div>
                  <div className={`font-medium ${selectedTemplate.status === 'active' ? 'text-green-600' : selectedTemplate.status === 'draft' ? 'text-yellow-600' : 'text-gray-600'}`}>
                    {selectedTemplate.status.charAt(0).toUpperCase() + selectedTemplate.status.slice(1)}
                  </div>
                </div>
              </div>

              {/* Template Preview Content */}
              <div className="bg-gray-100 rounded-lg p-6">
                <div className="bg-white rounded border-2 border-dashed border-gray-300 p-8">
                  {selectedTemplate.category === 'website' && (
                    <div className="space-y-4">
                      <div className="text-center">
                        <h4 className="text-lg font-medium text-gray-900 mb-2">Website Page Layout</h4>
                        <p className="text-gray-600">Consistent infrastructure with selective customization</p>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="bg-blue-50 p-4 rounded">
                          <div className="text-blue-600 font-medium">Header</div>
                          <div className="text-xs text-gray-500">From Theme (Global sections)</div>
                        </div>
                        <div className="bg-green-50 p-4 rounded">
                          <div className="text-green-600 font-medium">Main Content</div>
                          <div className="text-xs text-gray-500">Customizable per page type</div>
                        </div>
                        <div className="bg-blue-50 p-4 rounded">
                          <div className="text-blue-600 font-medium">Footer</div>
                          <div className="text-xs text-gray-500">From Theme (Global sections)</div>
                        </div>
                      </div>
                      {selectedTemplate.overrides > 0 && (
                        <div className="bg-orange-50 p-3 rounded text-center">
                          <div className="text-orange-700 font-medium">Customization Active</div>
                          <div className="text-xs text-orange-600">{selectedTemplate.overrides} override(s) for brand differentiation</div>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedTemplate.category === 'publication' && (
                    <div className="space-y-4">
                      <div className="text-center">
                        <h4 className="text-lg font-medium text-gray-900 mb-2">Dynamic Content Template</h4>
                        <p className="text-gray-600">Generates pages from content at enterprise scale</p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded">
                        <div className="text-purple-700 font-medium mb-2">Content-Driven Generation</div>
                        <div className="text-sm text-purple-600">
                          • Used by {selectedTemplate.usageCount} {selectedTemplate.name.includes('Journal') ? 'journal websites' : 'different websites'}
                          <br />
                          • {selectedTemplate.overrides} of those websites have custom overrides
                          <br />
                          • Maintains consistency while allowing targeted customization
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="bg-gray-50 p-3 rounded">
                          <div className="font-medium">Template Structure</div>
                          <div className="text-gray-600">Header, Content Area, Metadata, Footer</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                          <div className="font-medium">Dynamic Elements</div>
                          <div className="text-gray-600">Title, Author, Content, Related Items</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedTemplate.category === 'supporting' && (
                    <div className="space-y-4">
                      <div className="text-center">
                        <h4 className="text-lg font-medium text-gray-900 mb-2">Custom Page Template</h4>
                        <p className="text-gray-600">Creative sandbox - compete with generic builders</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded">
                        <div className="text-green-700 font-medium mb-2">Maximum Creative Freedom</div>
                        <div className="text-sm text-green-600">
                          • Start from template, blank page, or external link
                          <br />
                          • Build custom sections and reusable components  
                          <br />
                          • Extract creations into new templates
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="bg-white p-2 rounded text-center border">Text Editing</div>
                        <div className="bg-white p-2 rounded text-center border">Rich Media</div>
                        <div className="bg-white p-2 rounded text-center border">Custom Layout</div>
                      </div>
                    </div>
                  )}

                  {(selectedTemplate.category === 'global' || selectedTemplate.category === 'section') && (
                    <div className="space-y-4">
                      <div className="text-center">
                        <h4 className="text-lg font-medium text-gray-900 mb-2">Reusable Component</h4>
                        <p className="text-gray-600">Shared across multiple pages and templates</p>
                      </div>
                      <div className="bg-indigo-50 p-4 rounded">
                        <div className="text-indigo-700 font-medium mb-2">Component Template</div>
                        <div className="text-sm text-indigo-600">
                          Used by {selectedTemplate.usageCount} pages across the platform
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded text-center">
                        <div className="text-gray-700">Drag & Drop Component</div>
                        <div className="text-xs text-gray-500 mt-1">Can be added to any page or template</div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-center mt-6 gap-3">
                  <button 
                    onClick={() => handleEditTemplate(selectedTemplate)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Edit in Page Builder
                  </button>
                  <button 
                    onClick={() => handleDuplicateTemplate(selectedTemplate)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Duplicate Template
                  </button>
                  {selectedTemplate.overrides > 0 && (
                    <button 
                      onClick={() => handleManageOverrides(selectedTemplate)}
                      className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                    >
                      Manage Overrides ({selectedTemplate.overrides})
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
