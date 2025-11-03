import { useState } from 'react'
import { Search, Plus, Filter, X, RefreshCw } from 'lucide-react'
import { TemplateRow } from './TemplateRow'

// Template categories - 2 main types: page templates and section templates
type TemplateCategory = 'website' | 'publication' | 'supporting' | 'global' | 'section'

// Content types that templates support
type ContentType = 'journals' | 'books' | 'proceedings' | 'blogs' | 'news' | 'general'

type Template = {
  id: string
  name: string
  description: string
  category: TemplateCategory
  contentType?: ContentType // What type of content this template is for (optional for now)
  inheritsFrom: string
  modifications: number
  createdAt: Date
  updatedAt: Date
  createdBy: string
  usageCount: number
  tags: string[]
  thumbnail?: string
  status: 'active' | 'draft' | 'archived'
  version?: string // e.g., "v2.1.3"
  updateAvailable?: boolean // New version available from platform
}

// Website Page Templates from mockup
const WEBSITE_TEMPLATES: Template[] = [
  {
    id: 'theme-global-sections',
    name: 'Theme (Global sections)',
    description: 'Base theme with global sections like headers and footers',
    category: 'website',
    inheritsFrom: 'Modern Theme',
    modifications: 0,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-03-15'),
    createdBy: 'System',
    usageCount: 2,
    tags: ['theme', 'global', 'sections'],
    status: 'active'
  },
  {
    id: 'website-homepage',
    name: 'Website Homepage',
    description: 'Homepage template for the publisher site',
    category: 'website',
    inheritsFrom: 'Theme (Global sections)',
    modifications: 1,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-03-10'),
    createdBy: 'Admin User',
    usageCount: 2,
    tags: ['home', 'homepage', 'landing'],
    status: 'active'
  },
  {
    id: 'search-results',
    name: 'Search results',
    description: 'Template for displaying search results',
    category: 'website',
    inheritsFrom: 'Theme (Global sections)',
    modifications: 0,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-02-28'),
    createdBy: 'Dev Team',
    usageCount: 2,
    tags: ['search', 'results', 'listing'],
    status: 'active'
  },
  {
    id: 'advanced-search',
    name: 'Advanced Search',
    description: 'Advanced search page with filters and options',
    category: 'website',
    inheritsFrom: 'Theme (Global sections)',
    modifications: 0,
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-03-01'),
    createdBy: 'Dev Team',
    usageCount: 1,
    tags: ['search', 'advanced', 'filters'],
    status: 'active'
  },
  {
    id: 'browse',
    name: 'Browse',
    description: 'General browse page for content navigation',
    category: 'website',
    inheritsFrom: 'Theme (Global sections)',
    modifications: 1,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-03-05'),
    createdBy: 'UX Team',
    usageCount: 2,
    tags: ['browse', 'navigation', 'content'],
    status: 'active'
  },
  {
    id: 'subject-browse-taxonomy',
    name: 'Subject Browse (Taxonomy)',
    description: 'Browse content by subject taxonomy',
    category: 'website',
    inheritsFrom: 'browse',
    modifications: 0,
    createdAt: new Date('2024-02-05'),
    updatedAt: new Date('2024-03-08'),
    createdBy: 'Content Team',
    usageCount: 0,
    tags: ['browse', 'taxonomy', 'subjects'],
    status: 'active'
  },
  {
    id: 'content-browse-az',
    name: 'Content Browse (A-Z title)',
    description: 'Browse content alphabetically by title',
    category: 'website',
    inheritsFrom: 'browse',
    modifications: 2,
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-03-12'),
    createdBy: 'Content Team',
    usageCount: 2,
    tags: ['browse', 'alphabetical', 'titles'],
    status: 'active'
  },
  {
    id: 'profile-institutional-admin',
    name: 'Profile and Institutional Admin pages',
    description: 'User profile and institutional administration pages',
    category: 'website',
    inheritsFrom: 'Theme (Global sections)',
    modifications: 0,
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-03-18'),
    createdBy: 'Auth Team',
    usageCount: 0,
    tags: ['profile', 'admin', 'institutional'],
    status: 'active'
  },
  {
    id: 'error-pages',
    name: 'Error pages',
    description: '404, 500, and other error page templates',
    category: 'website',
    inheritsFrom: 'Theme (Global sections)',
    modifications: 0,
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-03-20'),
    createdBy: 'Dev Team',
    usageCount: 0,
    tags: ['error', '404', '500'],
    status: 'active'
  },
  {
    id: 'ecommerce',
    name: 'eCommerce',
    description: 'Base eCommerce template for online sales',
    category: 'website',
    inheritsFrom: 'Theme (Global sections)',
    modifications: 0,
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-22'),
    createdBy: 'eCommerce Team',
    usageCount: 0,
    tags: ['ecommerce', 'sales', 'commerce'],
    status: 'active'
  },
  {
    id: 'cart',
    name: 'Cart',
    description: 'Shopping cart page template',
    category: 'website',
    inheritsFrom: 'eCommerce',
    modifications: 0,
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
    modifications: 0,
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
    modifications: 0,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-03-10'),
    createdBy: 'Admin User',
    usageCount: 1,
    tags: ['header', 'navigation', 'global', 'responsive'],
    status: 'active'
  },
  {
    id: 'global-footer-standard',
    name: 'Standard Footer',
    description: 'Footer template with links, copyright, and contact information',
    category: 'global',
    inheritsFrom: 'Theme (Global sections)',
    modifications: 0,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-02-28'),
    createdBy: 'Admin User',
    usageCount: 1,
    tags: ['footer', 'links', 'global', 'contact'],
    status: 'active'
  },
  {
    id: 'global-navigation-mega',
    name: 'Mega Navigation Menu',
    description: 'Comprehensive navigation with dropdown categories and search',
    category: 'global',
    inheritsFrom: 'Theme (Global sections)',
    modifications: 0,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-03-15'),
    createdBy: 'Design Team',
    usageCount: 0,
    tags: ['navigation', 'dropdown', 'search', 'comprehensive'],
    status: 'active'
  },
  {
    id: 'global-breadcrumb',
    name: 'Breadcrumb Navigation',
    description: 'Site navigation breadcrumb component for all pages',
    category: 'global',
    inheritsFrom: 'Theme (Global sections)',
    modifications: 0,
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-03-01'),
    createdBy: 'UX Team',
    usageCount: 1,
    tags: ['breadcrumb', 'navigation', 'site-structure'],
    status: 'active'
  },
  {
    id: 'global-search-bar',
    name: 'Global Search Bar',
    description: 'Advanced search component with filters and autocomplete',
    category: 'global',
    inheritsFrom: 'Theme (Global sections)',
    modifications: 0,
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-03-20'),
    createdBy: 'Dev Team',
    usageCount: 0,
    tags: ['search', 'filters', 'autocomplete', 'global'],
    status: 'active'
  },
  {
    id: 'global-user-account',
    name: 'User Account Menu',
    description: 'User login/account management dropdown menu',
    category: 'global',
    inheritsFrom: 'Theme (Global sections)',
    modifications: 0,
    createdAt: new Date('2024-01-30'),
    updatedAt: new Date('2024-03-05'),
    createdBy: 'Auth Team',
    usageCount: 1,
    tags: ['user', 'account', 'authentication', 'dropdown'],
    status: 'active'
  },
  {
    id: 'global-notification-banner',
    name: 'Notification Banner',
    description: 'Site-wide notification banner for announcements',
    category: 'global',
    inheritsFrom: 'Theme (Global sections)',
    modifications: 0,
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-03-12'),
    createdBy: 'Content Team',
    usageCount: 0,
    tags: ['notifications', 'announcements', 'banner'],
    status: 'draft'
  },
  {
    id: 'global-cookie-consent',
    name: 'Cookie Consent Bar',
    description: 'GDPR-compliant cookie consent notification bar',
    category: 'global',
    inheritsFrom: 'Theme (Global sections)',
    modifications: 0,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-02-20'),
    createdBy: 'Legal Team',
    usageCount: 1,
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
    inheritsFrom: 'theme-global-sections',
    modifications: 0,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-03-15'),
    createdBy: 'Publishing Team',
    usageCount: 2,
    tags: ['publication', 'root', 'template'],
    status: 'active'
  },
  // Intermediate category templates
  {
    id: 'journal-pages',
    name: 'Journal Pages',
    description: 'Parent template for all journal-related pages',
    category: 'publication',
    contentType: 'journals',
    inheritsFrom: 'publication-pages',
    modifications: 0,
    createdAt: new Date('2024-01-21'),
    updatedAt: new Date('2024-03-16'),
    createdBy: 'Editorial Team',
    usageCount: 4,
    tags: ['journal', 'category', 'parent'],
    status: 'active'
  },
  {
    id: 'book-pages',
    name: 'Book Pages',
    description: 'Parent template for all book-related pages',
    category: 'publication',
    contentType: 'books',
    inheritsFrom: 'publication-pages',
    modifications: 0,
    createdAt: new Date('2024-01-21'),
    updatedAt: new Date('2024-03-16'),
    createdBy: 'Book Team',
    usageCount: 4,
    tags: ['book', 'category', 'parent'],
    status: 'active'
  },
  {
    id: 'conference-pages',
    name: 'Conference Pages',
    description: 'Parent template for all conference/proceedings-related pages',
    category: 'publication',
    contentType: 'proceedings',
    inheritsFrom: 'publication-pages',
    modifications: 0,
    createdAt: new Date('2024-01-21'),
    updatedAt: new Date('2024-03-16'),
    createdBy: 'Conference Team',
    usageCount: 5,
    tags: ['conference', 'proceedings', 'category', 'parent'],
    status: 'active'
  },
  {
    id: 'blog-pages',
    name: 'Blog Pages',
    description: 'Parent template for all blog-related pages',
    category: 'publication',
    contentType: 'blogs',
    inheritsFrom: 'publication-pages',
    modifications: 0,
    createdAt: new Date('2024-01-21'),
    updatedAt: new Date('2024-03-16'),
    createdBy: 'Content Team',
    usageCount: 5,
    tags: ['blog', 'category', 'parent'],
    status: 'active'
  },
  {
    id: 'news-pages',
    name: 'News Pages',
    description: 'Parent template for all news-related pages',
    category: 'publication',
    contentType: 'news',
    inheritsFrom: 'publication-pages',
    modifications: 0,
    createdAt: new Date('2024-01-21'),
    updatedAt: new Date('2024-03-16'),
    createdBy: 'News Team',
    usageCount: 6,
    tags: ['news', 'category', 'parent'],
    status: 'active'
  },
  // Journal Templates
  {
    id: 'journal-home',
    name: 'Journal Home',
    description: 'Homepage for individual journals',
    category: 'publication',
    contentType: 'journals',
    inheritsFrom: 'journal-pages',
    modifications: 2,
    createdAt: new Date('2024-01-22'),
    updatedAt: new Date('2024-03-18'),
    createdBy: 'Editorial Team',
    usageCount: 2,
    tags: ['journal', 'homepage', 'editorial'],
    status: 'active',
    version: 'v1.8.2'
  },
  {
    id: 'table-of-contents',
    name: 'Table Of Contents',
    description: 'Table of contents for journal issues',
    category: 'publication',
    contentType: 'journals',
    inheritsFrom: 'journal-pages',
    modifications: 0,
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-03-20'),
    createdBy: 'Editorial Team',
    usageCount: 0,
    tags: ['toc', 'issue', 'contents'],
    status: 'active',
    version: 'v2.3.1',
    updateAvailable: true // New version v2.4.0 available
  },
  {
    id: 'list-of-issues',
    name: 'List of Issues',
    description: 'Archive listing of journal issues',
    category: 'publication',
    contentType: 'journals',
    inheritsFrom: 'journal-pages',
    modifications: 0,
    createdAt: new Date('2024-01-28'),
    updatedAt: new Date('2024-03-22'),
    createdBy: 'Editorial Team',
    usageCount: 1,
    tags: ['issues', 'archive', 'listing'],
    status: 'active'
  },
  {
    id: 'article',
    name: 'Article',
    description: 'Individual article page template',
    category: 'publication',
    contentType: 'journals',
    inheritsFrom: 'journal-pages',
    modifications: 10,
    createdAt: new Date('2024-01-30'),
    updatedAt: new Date('2024-03-25'),
    createdBy: 'Publishing Team',
    usageCount: 1,
    tags: ['article', 'content', 'academic'],
    status: 'active',
    version: 'v3.1.0'
  },
  // Book Templates
  {
    id: 'book-series',
    name: 'Book Series',
    description: 'Book series landing page',
    category: 'publication',
    contentType: 'books',
    inheritsFrom: 'book-pages',
    modifications: 0,
    createdAt: new Date('2024-02-02'),
    updatedAt: new Date('2024-03-28'),
    createdBy: 'Book Team',
    usageCount: 0,
    tags: ['book', 'series', 'collection'],
    status: 'active'
  },
  {
    id: 'book-set',
    name: 'Book Set',
    description: 'Book set collection page',
    category: 'publication',
    contentType: 'books',
    inheritsFrom: 'book-pages',
    modifications: 0,
    createdAt: new Date('2024-02-05'),
    updatedAt: new Date('2024-03-30'),
    createdBy: 'Book Team',
    usageCount: 0,
    tags: ['book', 'set', 'collection'],
    status: 'active'
  },
  {
    id: 'book',
    name: 'Book',
    description: 'Individual book page template',
    category: 'publication',
    contentType: 'books',
    inheritsFrom: 'book-pages',
    modifications: 0,
    createdAt: new Date('2024-02-08'),
    updatedAt: new Date('2024-04-02'),
    createdBy: 'Book Team',
    usageCount: 0,
    tags: ['book', 'individual', 'publication'],
    status: 'active'
  },
  {
    id: 'chapter',
    name: 'Chapter',
    description: 'Individual book chapter page',
    category: 'publication',
    contentType: 'books',
    inheritsFrom: 'book-pages',
    modifications: 0,
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-04-05'),
    createdBy: 'Book Team',
    usageCount: 0,
    tags: ['chapter', 'book', 'content'],
    status: 'active'
  },
  // Conference Proceedings Templates
  {
    id: 'conference-home',
    name: 'Conference Home',
    description: 'Landing page for conference series with upcoming/past events, keynote speakers, and submission info',
    category: 'publication',
    contentType: 'proceedings',
    inheritsFrom: 'conference-pages',
    modifications: 0,
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-04-10'),
    createdBy: 'Conference Team',
    usageCount: 0,
    tags: ['conference', 'events', 'proceedings', 'landing'],
    status: 'active'
  },
  {
    id: 'conference-proceedings',
    name: 'Conference Proceedings Volume',
    description: 'Table of contents for a specific conference event, listing papers by track/session',
    category: 'publication',
    contentType: 'proceedings',
    inheritsFrom: 'conference-pages',
    modifications: 0,
    createdAt: new Date('2024-02-18'),
    updatedAt: new Date('2024-04-12'),
    createdBy: 'Conference Team',
    usageCount: 0,
    tags: ['conference', 'proceedings', 'toc', 'papers'],
    status: 'active'
  },
  {
    id: 'conference-paper',
    name: 'Conference Paper',
    description: 'Individual conference paper/presentation page with abstract, authors, and media',
    category: 'publication',
    contentType: 'proceedings',
    inheritsFrom: 'conference-pages',
    modifications: 0,
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-04-15'),
    createdBy: 'Conference Team',
    usageCount: 0,
    tags: ['conference', 'paper', 'presentation', 'academic'],
    status: 'active'
  },
  {
    id: 'conference-program',
    name: 'Conference Program/Schedule',
    description: 'Interactive conference schedule with session times, tracks, and speaker information',
    category: 'publication',
    contentType: 'proceedings',
    inheritsFrom: 'conference-pages',
    modifications: 0,
    createdAt: new Date('2024-02-22'),
    updatedAt: new Date('2024-04-18'),
    createdBy: 'Conference Team',
    usageCount: 0,
    tags: ['conference', 'schedule', 'program', 'sessions'],
    status: 'active'
  },
  {
    id: 'conference-browse',
    name: 'Conference Browse',
    description: 'Browse conferences by year, topic, track, or location with timeline view',
    category: 'publication',
    contentType: 'proceedings',
    inheritsFrom: 'conference-pages',
    modifications: 0,
    createdAt: new Date('2024-02-25'),
    updatedAt: new Date('2024-04-20'),
    createdBy: 'Conference Team',
    usageCount: 0,
    tags: ['conference', 'browse', 'archive', 'discovery'],
    status: 'active'
  },
  // Blog Templates
  {
    id: 'blog-home',
    name: 'Blog Home',
    description: 'Blog landing page with featured posts, recent articles, and category navigation',
    category: 'publication',
    contentType: 'blogs',
    inheritsFrom: 'blog-pages',
    modifications: 0,
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-04-22'),
    createdBy: 'Content Team',
    usageCount: 0,
    tags: ['blog', 'landing', 'editorial', 'magazine'],
    status: 'active'
  },
  {
    id: 'blog-post',
    name: 'Blog Post',
    description: 'Individual blog article page with rich media, author bio, and related content',
    category: 'publication',
    contentType: 'blogs',
    inheritsFrom: 'blog-pages',
    modifications: 0,
    createdAt: new Date('2024-03-05'),
    updatedAt: new Date('2024-04-25'),
    createdBy: 'Content Team',
    usageCount: 0,
    tags: ['blog', 'post', 'article', 'content'],
    status: 'active'
  },
  {
    id: 'blog-archive',
    name: 'Blog Archive',
    description: 'Browse blog posts by date, category, or tag with grid/list views',
    category: 'publication',
    contentType: 'blogs',
    inheritsFrom: 'blog-pages',
    modifications: 0,
    createdAt: new Date('2024-03-08'),
    updatedAt: new Date('2024-04-28'),
    createdBy: 'Content Team',
    usageCount: 0,
    tags: ['blog', 'archive', 'browse', 'categories'],
    status: 'active'
  },
  {
    id: 'blog-author-profile',
    name: 'Blog Author Profile',
    description: 'Author biography page with photo, credentials, and all posts by author',
    category: 'publication',
    contentType: 'blogs',
    inheritsFrom: 'blog-pages',
    modifications: 0,
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date('2024-04-30'),
    createdBy: 'Content Team',
    usageCount: 0,
    tags: ['blog', 'author', 'profile', 'biography'],
    status: 'active'
  },
  {
    id: 'blog-category',
    name: 'Blog Category Landing',
    description: 'Category-specific landing page with featured and curated content',
    category: 'publication',
    contentType: 'blogs',
    inheritsFrom: 'blog-pages',
    modifications: 0,
    createdAt: new Date('2024-03-12'),
    updatedAt: new Date('2024-05-02'),
    createdBy: 'Content Team',
    usageCount: 0,
    tags: ['blog', 'category', 'curated', 'collection'],
    status: 'active'
  },
  // News Templates
  {
    id: 'news-home',
    name: 'News Home',
    description: 'News portal with breaking stories, headlines by topic, and multimedia content',
    category: 'publication',
    contentType: 'news',
    inheritsFrom: 'news-pages',
    modifications: 0,
    createdAt: new Date('2024-03-15'),
    updatedAt: new Date('2024-05-05'),
    createdBy: 'News Team',
    usageCount: 0,
    tags: ['news', 'breaking', 'headlines', 'current'],
    status: 'active'
  },
  {
    id: 'news-article',
    name: 'News Article',
    description: 'Individual news story with byline, publication time, and related coverage',
    category: 'publication',
    contentType: 'news',
    inheritsFrom: 'news-pages',
    modifications: 0,
    createdAt: new Date('2024-03-18'),
    updatedAt: new Date('2024-05-08'),
    createdBy: 'News Team',
    usageCount: 0,
    tags: ['news', 'article', 'story', 'coverage'],
    status: 'active'
  },
  {
    id: 'news-archive',
    name: 'News Archive',
    description: 'Browse news by date, topic, or region with timeline view',
    category: 'publication',
    contentType: 'news',
    inheritsFrom: 'news-pages',
    modifications: 0,
    createdAt: new Date('2024-03-20'),
    updatedAt: new Date('2024-05-10'),
    createdBy: 'News Team',
    usageCount: 0,
    tags: ['news', 'archive', 'timeline', 'history'],
    status: 'active'
  },
  {
    id: 'press-release',
    name: 'Press Release Archive',
    description: 'Corporate press releases organized by date and topic with media contact info',
    category: 'publication',
    contentType: 'news',
    inheritsFrom: 'news-pages',
    modifications: 0,
    createdAt: new Date('2024-03-22'),
    updatedAt: new Date('2024-05-12'),
    createdBy: 'News Team',
    usageCount: 0,
    tags: ['press', 'release', 'corporate', 'announcements'],
    status: 'active'
  },
  {
    id: 'media-resources',
    name: 'Media Resources',
    description: 'Media kit with logos, brand guidelines, fact sheets, and downloadable assets',
    category: 'publication',
    contentType: 'news',
    inheritsFrom: 'news-pages',
    modifications: 0,
    createdAt: new Date('2024-03-25'),
    updatedAt: new Date('2024-05-15'),
    createdBy: 'News Team',
    usageCount: 0,
    tags: ['media', 'resources', 'press-kit', 'assets'],
    status: 'active'
  },
  {
    id: 'news-topic',
    name: 'News by Topic',
    description: 'Topic-specific news landing page (e.g., Science Policy, Research Funding)',
    category: 'publication',
    contentType: 'news',
    inheritsFrom: 'news-pages',
    modifications: 0,
    createdAt: new Date('2024-03-28'),
    updatedAt: new Date('2024-05-18'),
    createdBy: 'News Team',
    usageCount: 0,
    tags: ['news', 'topic', 'category', 'curated'],
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
    modifications: 0,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-03-05'),
    createdBy: 'Content Team',
    usageCount: 1,
    tags: ['supporting', 'root', 'template'],
    status: 'active'
  },
  {
    id: 'about',
    name: 'About',
    description: 'About page for organization information',
    category: 'supporting',
    inheritsFrom: 'Supporting Pages',
    modifications: 1,
    createdAt: new Date('2024-01-22'),
    updatedAt: new Date('2024-03-08'),
    createdBy: 'Content Team',
    usageCount: 0,
    tags: ['about', 'company', 'organization'],
    status: 'active'
  },
  {
    id: 'contact-us',
    name: 'Contact Us',
    description: 'Contact page with forms and contact information',
    category: 'supporting',
    inheritsFrom: 'Supporting Pages',
    modifications: 1,
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-03-10'),
    createdBy: 'Content Team',
    usageCount: 0,
    tags: ['contact', 'form', 'support'],
    status: 'active'
  },
  {
    id: 'privacy-policy',
    name: 'Privacy Policy',
    description: 'Privacy policy and data protection information',
    category: 'supporting',
    inheritsFrom: 'Supporting Pages',
    modifications: 0,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-03-12'),
    createdBy: 'Legal Team',
    usageCount: 1,
    tags: ['privacy', 'legal', 'gdpr'],
    status: 'active'
  },
  {
    id: 'terms-conditions',
    name: 'Terms and Conditions',
    description: 'Terms of service and usage conditions',
    category: 'supporting',
    inheritsFrom: 'Supporting Pages',
    modifications: 0,
    createdAt: new Date('2024-02-03'),
    updatedAt: new Date('2024-03-14'),
    createdBy: 'Legal Team',
    usageCount: 1,
    tags: ['terms', 'legal', 'conditions'],
    status: 'active'
  },
  {
    id: 'accessibility-statement',
    name: 'Accessibility Conformance Statement',
    description: 'Accessibility compliance and conformance information',
    category: 'supporting',
    inheritsFrom: 'Supporting Pages',
    modifications: 0,
    createdAt: new Date('2024-02-05'),
    updatedAt: new Date('2024-03-16'),
    createdBy: 'Legal Team',
    usageCount: 0,
    tags: ['accessibility', 'compliance', 'legal'],
    status: 'active'
  },
  {
    id: 'cookie-policy',
    name: 'Cookie Policy',
    description: 'Cookie usage and management policy',
    category: 'supporting',
    inheritsFrom: 'Supporting Pages',
    modifications: 0,
    createdAt: new Date('2024-02-08'),
    updatedAt: new Date('2024-03-18'),
    createdBy: 'Legal Team',
    usageCount: 0,
    tags: ['cookies', 'privacy', 'legal'],
    status: 'active'
  },
  {
    id: 'supporting-journal-pages',
    name: 'Supporting Journal Pages',
    description: 'Root template for journal-specific supporting pages',
    category: 'supporting',
    inheritsFrom: 'Publication Pages',
    modifications: 0,
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-03-20'),
    createdBy: 'Editorial Team',
    usageCount: 1,
    tags: ['journal', 'supporting', 'editorial'],
    status: 'active'
  },
  {
    id: 'editorial-board',
    name: 'Editorial Board',
    description: 'Editorial board member listings and information',
    category: 'supporting',
    inheritsFrom: 'Supporting Journal Pages',
    modifications: 2,
    createdAt: new Date('2024-02-12'),
    updatedAt: new Date('2024-03-22'),
    createdBy: 'Editorial Team',
    usageCount: 0,
    tags: ['editorial', 'board', 'staff'],
    status: 'active'
  },
  {
    id: 'author-guidelines',
    name: 'Author Guidelines',
    description: 'Guidelines and instructions for authors',
    category: 'supporting',
    inheritsFrom: 'Supporting Journal Pages',
    modifications: 0,
    createdAt: new Date('2024-02-14'),
    updatedAt: new Date('2024-03-24'),
    createdBy: 'Editorial Team',
    usageCount: 1,
    tags: ['author', 'guidelines', 'instructions'],
    status: 'active'
  },
  {
    id: 'reviewer-guidelines',
    name: 'Reviewer Guidelines',
    description: 'Guidelines and instructions for peer reviewers',
    category: 'supporting',
    inheritsFrom: 'Supporting Journal Pages',
    modifications: 0,
    createdAt: new Date('2024-02-16'),
    updatedAt: new Date('2024-03-26'),
    createdBy: 'Editorial Team',
    usageCount: 0,
    tags: ['reviewer', 'guidelines', 'peer-review'],
    status: 'active'
  },
  {
    id: 'aims-scope',
    name: 'Aims & Scope',
    description: 'Journal aims, scope, and focus areas',
    category: 'supporting',
    inheritsFrom: 'Supporting Journal Pages',
    modifications: 6,
    createdAt: new Date('2024-02-18'),
    updatedAt: new Date('2024-03-28'),
    createdBy: 'Editorial Team',
    usageCount: 1,
    tags: ['aims', 'scope', 'journal-info'],
    status: 'active'
  },
  {
    id: 'subscribe-purchase',
    name: 'Subscribe / Purchase',
    description: 'Subscription and purchase information page',
    category: 'supporting',
    inheritsFrom: 'Supporting Journal Pages',
    modifications: 2,
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-03-30'),
    createdBy: 'Sales Team',
    usageCount: 0,
    tags: ['subscription', 'purchase', 'sales'],
    status: 'active'
  },
  {
    id: 'news-announcements',
    name: 'News / Announcements',
    description: 'Journal news and announcements page',
    category: 'supporting',
    inheritsFrom: 'Supporting Journal Pages',
    modifications: 0,
    createdAt: new Date('2024-02-22'),
    updatedAt: new Date('2024-04-01'),
    createdBy: 'Editorial Team',
    usageCount: 0,
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
    modifications: 0,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-03-15'),
    createdBy: 'Design Team',
    usageCount: 0,
    tags: ['hero', 'banner', 'cta', 'landing'],
    status: 'active'
  },
  {
    id: 'section-article-list',
    name: 'Article List',
    description: 'Grid or list view of articles with thumbnails and excerpts',
    category: 'section',
    inheritsFrom: 'Base Section',
    modifications: 0,
    createdAt: new Date('2024-02-05'),
    updatedAt: new Date('2024-03-20'),
    createdBy: 'Content Team',
    usageCount: 0,
    tags: ['articles', 'list', 'grid', 'content'],
    status: 'active'
  },
  {
    id: 'section-featured-content',
    name: 'Featured Content',
    description: 'Highlighted content section for promoting key articles or journals',
    category: 'section',
    inheritsFrom: 'Base Section',
    modifications: 0,
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-03-18'),
    createdBy: 'Editorial Team',
    usageCount: 0,
    tags: ['featured', 'highlight', 'promotion', 'editorial'],
    status: 'active'
  },
  {
    id: 'section-author-bio',
    name: 'Author Bio',
    description: 'Author biography section with photo, credentials, and publications',
    category: 'section',
    inheritsFrom: 'Base Section',
    modifications: 0,
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-03-22'),
    createdBy: 'Content Team',
    usageCount: 0,
    tags: ['author', 'biography', 'credentials', 'academic'],
    status: 'active'
  }
]

// Export all templates for use in other components (e.g., WebsiteTemplates)
export const ALL_TEMPLATES = [...WEBSITE_TEMPLATES, ...PUBLICATION_TEMPLATES, ...SUPPORTING_PAGES_TEMPLATES, ...SECTION_TEMPLATES, ...CONTENT_SECTION_TEMPLATES]

interface SiteManagerTemplatesProps {
  themeId?: string // Theme ID to display in header badge
  usePageStore?: any // Zustand store hook for divergence tracking
}

export function SiteManagerTemplates({ themeId, usePageStore }: SiteManagerTemplatesProps) {
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory>('website')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'draft' | 'archived'>('all')
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())
  const [selectedTemplates, setSelectedTemplates] = useState<Set<string>>(new Set()) // For bulk updates

  // Map theme IDs to display names
  const getThemeName = (themeId?: string): string => {
    switch (themeId) {
      case 'modernist-theme':
        return 'Modern Theme'
      case 'classicist-theme':
        return 'Classic Theme'
      case 'curator-theme':
        return 'Curator Theme'
      default:
        return 'Modern Theme' // fallback
    }
  }

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
    
    if (template.id === 'website-homepage') {
      // Set editing context to 'template' and navigate to Page Builder
      const { setCurrentView, setEditingContext } = (window as any).usePageStore?.getState() || {}
      if (setCurrentView && setEditingContext) {
        setEditingContext('template')
        setCurrentView('page-builder')
        // Small delay to ensure state is updated before showing alert
        setTimeout(() => {
          alert(`🎯 Switched to Template Editing Mode!\n\n📋 Template: ${template.name}\n🏢 Website: Wiley Online Library\n🎨 Theme: ${getThemeName(themeId)}\n📊 Current Modifications: ${template.modifications}\n\n✨ Notice the template context bar and modification indicators!\n💡 This is template management mode - modification indicators help you see customizations.`)
        }, 100)
      } else {
        alert(`🎯 Opening Page Builder for "${template.name}"!\n\n📋 Template: ${template.name}\n🏢 Website: Wiley Online Library\n🎨 Theme: ${getThemeName(themeId)}\n📊 Current Modifications: ${template.modifications}\n\n💡 Click Page Builder tab to see the template context in action!\n✨ Look for modification indicators on customized elements.`)
      }
    } else {
      // For other templates, show generic message
      alert(`Opening Page Builder for "${template.name}"...\n\nThis would launch the drag-and-drop editor where you can modify the template layout, content, and styling.`)
    }
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

  const handleManageModifications = (template: Template) => {
    console.log('Managing modifications for template:', template.id)
    // In real app: navigate to modification management
    alert(`Managing Template Modifications for "${template.name}"\n\n${template.modifications} page(s) currently modify this template.\n\nThis would show:\n• Which specific pages/journals have modifications\n• What changes were made in each modification\n• Ability to approve/reject modification requests`)
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

  // Helper function to determine indentation level based on inheritance (ID-based)
  const getIndentationLevel = (template: Template): number => {
    // Root template (no parent)
    if (!template.inheritsFrom) {
      return 0
    }
    
    // Find parent by ID
    const parentTemplate = allTemplates.find(t => t.id === template.inheritsFrom)
    
    if (!parentTemplate) {
      // Legacy fallback for label-based inheritance (if any remain)
      const parentByName = allTemplates.find(t => t.name === template.inheritsFrom)
      if (parentByName) {
        return getIndentationLevel(parentByName) + 1
      }
      return 0 // Safety fallback
    }
    
    // Recursive: parent's level + 1
    return getIndentationLevel(parentTemplate) + 1
  }

  // Check if template is a group header (intermediate category template)
  const isGroupHeader = (template: Template): boolean => {
    const groupIds = ['journal-pages', 'book-pages', 'conference-pages', 'blog-pages', 'news-pages']
    return groupIds.includes(template.id)
  }

  // Get children of a template
  const getChildren = (parentId: string): Template[] => {
    return allTemplates.filter(t => t.inheritsFrom === parentId)
  }

  // Toggle group expansion
  const toggleGroup = (templateId: string) => {
    setCollapsedGroups(prev => {
      const newSet = new Set(prev)
      if (newSet.has(templateId)) {
        newSet.delete(templateId)
      } else {
        newSet.add(templateId)
      }
      return newSet
    })
  }

  // Toggle template selection for bulk update
  const toggleTemplateSelection = (templateId: string) => {
    setSelectedTemplates(prev => {
      const newSet = new Set(prev)
      if (newSet.has(templateId)) {
        newSet.delete(templateId)
      } else {
        newSet.add(templateId)
      }
      return newSet
    })
  }

  // Select/deselect all templates
  const toggleSelectAll = () => {
    if (selectedTemplates.size === filteredTemplates.length) {
      // Deselect all
      setSelectedTemplates(new Set())
    } else {
      // Select all (excluding group headers)
      const allIds = new Set(
        filteredTemplates
          .filter(t => !isGroupHeader(t))
          .map(t => t.id)
      )
      setSelectedTemplates(allIds)
    }
  }

  // Handle bulk update from platform
  const handleBulkUpdate = () => {
    const selectedCount = selectedTemplates.size
    if (selectedCount === 0) {
      alert('Please select at least one template to update.')
      return
    }

    const selectedNames = Array.from(selectedTemplates)
      .map(id => allTemplates.find(t => t.id === id)?.name)
      .filter(Boolean)
      .join(', ')

    console.log('Bulk updating templates:', selectedNames)
    
    // TODO: Check if any selected templates have website customizations
    // If yes, trigger conflict resolution dialog
    alert(`Update Selected Templates from Platform\n\n${selectedCount} template(s) selected:\n${selectedNames}\n\nThis would:\n1. Check for website customizations\n2. Show conflict dialog if needed\n3. Pull latest changes from platform release\n4. Apply updates to theme templates`)
    
    // Clear selection after update
    setSelectedTemplates(new Set())
  }

  // Check if template should be visible (based on parent collapse state)
  const isTemplateVisible = (template: Template): boolean => {
    if (!template.inheritsFrom) return true
    
    // Check if parent is collapsed
    const parent = allTemplates.find(t => t.id === template.inheritsFrom)
    if (parent && isGroupHeader(parent) && collapsedGroups.has(parent.id)) {
      return false
    }
    
    // Recursively check all ancestors
    if (parent) {
      return isTemplateVisible(parent)
    }
    
    return true
  }

  // Render templates in tree order (parent followed immediately by children)
  const renderTemplatesInOrder = (templates: Template[]): Template[] => {
    const result: Template[] = []
    const processed = new Set<string>()
    
    const processTemplate = (template: Template) => {
      if (processed.has(template.id)) return
      processed.add(template.id)
      
      result.push(template)
      
      // If this is a group header and not collapsed, add its children immediately after
      if (isGroupHeader(template) && !collapsedGroups.has(template.id)) {
        const children = templates.filter(t => t.inheritsFrom === template.id)
        children.forEach(child => processTemplate(child))
      }
    }
    
    // Only process top-level templates and group headers
    // Children of group headers will be processed recursively when their parent is processed
    templates.forEach(template => {
      // Skip if already processed
      if (processed.has(template.id)) return
      
      const parent = allTemplates.find(t => t.id === template.inheritsFrom)
      
      // Only process if:
      // 1. No parent (root template)
      // 2. Parent is not a group header (regular hierarchical template)
      // 3. This template IS a group header itself
      const isChildOfGroupHeader = parent && isGroupHeader(parent)
      
      if (!isChildOfGroupHeader) {
        processTemplate(template)
      }
      // Skip children of group headers - they'll be processed when parent expands
    })
    
    return result
  }

  return (
    <>
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  {categories.find(c => c.key === selectedCategory)?.label || 'Templates'}
                </h2>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {getThemeName(themeId)}
                </span>
              </div>
              <p className="text-gray-600 mt-1">
                {categories.find(c => c.key === selectedCategory)?.description || 'Manage and organize templates across your publishing platform'}
              </p>
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
                  
                  {/* Update Selected Button - Only show if templates are selected */}
                  {selectedTemplates.size > 0 && (
                    <button 
                      onClick={handleBulkUpdate}
                      className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors flex items-center gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Update Selected ({selectedTemplates.size})
                    </button>
                  )}
                  
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
                      <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                        <input
                          type="checkbox"
                          checked={selectedTemplates.size > 0 && selectedTemplates.size === filteredTemplates.filter(t => !isGroupHeader(t)).length}
                          onChange={toggleSelectAll}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          title="Select all"
                        />
                      </th>
                      <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {selectedCategory === 'global' || selectedCategory === 'section' 
                          ? 'Section Template Name' 
                          : 'Page Template Name'}
                      </th>
                      <th className="text-right py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {renderTemplatesInOrder(filteredTemplates).map((template) => (
                      <TemplateRow 
                        key={template.id} 
                        template={template}
                        showDivergence={false} // Theme view: no divergence tracking
                        usePageStore={usePageStore}
                        getIndentationLevel={getIndentationLevel}
                        isGroupHeader={isGroupHeader(template)}
                        isCollapsed={collapsedGroups.has(template.id)}
                        childrenCount={getChildren(template.id).length}
                        onToggleGroup={() => toggleGroup(template.id)}
                        isSelected={selectedTemplates.has(template.id)}
                        onToggleSelect={toggleTemplateSelection}
                        handleEditTemplate={handleEditTemplate}
                        handlePreviewTemplate={handlePreviewTemplate}
                        handleDuplicateTemplate={handleDuplicateTemplate}
                        handleDeleteTemplate={handleDeleteTemplate}
                      />
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
                  <div className="text-gray-500">Used By</div>
                  <div className="font-medium">{selectedTemplate.usageCount} {selectedTemplate.category === 'website' || selectedTemplate.category === 'publication' ? 'websites' : 'instances'}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-gray-500">Modifications</div>
                  <div className="font-medium">{selectedTemplate.modifications}</div>
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
                      {selectedTemplate.modifications > 0 && (
                        <div className="bg-orange-50 p-3 rounded text-center">
                          <div className="text-orange-700 font-medium">Customization Active</div>
                          <div className="text-xs text-orange-600">{selectedTemplate.modifications} modification(s) by Wiley Online Library{selectedTemplate.usageCount > 1 ? ', Journal of Advanced Science' : ''}</div>
                        </div>
                      )}
                      <div className="bg-blue-50 p-3 rounded text-center">
                        <div className="text-blue-700 font-medium">Template Usage</div>
                        <div className="text-xs text-blue-600">Used by {selectedTemplate.usageCount} of 3 total websites using {getThemeName(themeId)}</div>
                      </div>
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
                          • Used by {selectedTemplate.usageCount} {selectedTemplate.name.includes('Journal') ? 'journal websites' : 'websites'} (Wiley Online Library, Journal of Advanced Science)
                          <br />
                          • {selectedTemplate.modifications} of those websites have custom modifications
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
                  {selectedTemplate.modifications > 0 && (
                    <button 
                      onClick={() => handleManageModifications(selectedTemplate)}
                      className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                    >
                      Manage Modifications ({selectedTemplate.modifications})
                    </button>
                  )}
                </div>

                {/* Audit Information - Available on demand */}
                <details className="mt-4">
                  <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
                    🔍 Audit Information
                  </summary>
                  <div className="mt-2 p-3 bg-gray-50 rounded text-xs text-gray-500">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="font-medium">Template Created</div>
                        <div>{selectedTemplate.createdAt.toLocaleDateString()}</div>
                      </div>
                      <div>
                        <div className="font-medium">Created By</div>
                        <div>{selectedTemplate.createdBy}</div>
                      </div>
                      <div>
                        <div className="font-medium">Last Updated</div>
                        <div>{selectedTemplate.updatedAt.toLocaleDateString()}</div>
                      </div>
                      <div>
                        <div className="font-medium">Template Version</div>
                        <div>1.0.0</div>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-200 text-gray-400">
                      💡 This information is primarily for debugging and tracking when template changes originated from the design system.
                    </div>
                  </div>
                </details>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
