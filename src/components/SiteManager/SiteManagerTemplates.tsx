import React, { useState } from 'react'
import { Search, Plus, Copy, Edit, Trash2, Eye, Download, Upload, Filter } from 'lucide-react'

// Template categories based on the 5-level hierarchy
type TemplateCategory = 'theme' | 'global' | 'publication' | 'journal' | 'section' | 'website'

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
    id: 'theme-global-widgets',
    name: 'Theme (Global widgets)',
    description: 'Base theme with global widget configurations',
    category: 'website',
    inheritsFrom: 'Classic',
    overrides: 0,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-03-15'),
    createdBy: 'System',
    usageCount: 100,
    tags: ['theme', 'global', 'widgets'],
    status: 'active'
  },
  {
    id: 'global-home',
    name: 'Global Home',
    description: 'Homepage template for the publisher site',
    category: 'website',
    inheritsFrom: 'Theme',
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
    inheritsFrom: 'Theme',
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
    inheritsFrom: 'Theme',
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
    inheritsFrom: 'Theme',
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
    inheritsFrom: 'Theme',
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
    inheritsFrom: 'Theme',
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
    inheritsFrom: 'Theme',
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

// Mock template data for Global Templates category  
const GLOBAL_TEMPLATES: Template[] = [
  {
    id: 'global-header-standard',
    name: 'Standard Header',
    description: 'Default header template with logo, navigation, and search functionality',
    category: 'global',
    inheritsFrom: 'Theme',
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
    inheritsFrom: 'Theme',
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
    inheritsFrom: 'Theme',
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
    inheritsFrom: 'Theme',
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
    inheritsFrom: 'Theme',
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
    inheritsFrom: 'Theme',
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
    inheritsFrom: 'Theme',
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
    inheritsFrom: 'Theme',
    overrides: 0,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-02-20'),
    createdBy: 'Legal Team',
    usageCount: 78,
    tags: ['cookies', 'consent', 'gdpr', 'legal'],
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
    { key: 'theme', label: 'Themes', description: 'Site-wide themes and branding' },
    { key: 'website', label: 'Website Page Templates', description: 'General templates about the Publisher\'s site' },
    { key: 'global', label: 'Global Templates', description: 'Headers, footers, navigation' },
    { key: 'publication', label: 'Publication Templates', description: 'Journal and article layouts' },
    { key: 'journal', label: 'Journal Pages', description: 'Journal-specific pages' },
    { key: 'section', label: 'Section Templates', description: 'Individual components' }
  ] as const

  // Combine all templates
  const allTemplates = [...WEBSITE_TEMPLATES, ...GLOBAL_TEMPLATES]
  
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
    console.log('Duplicate template:', template.id)
    // Implementation would go here
  }

  const handleEditTemplate = (template: Template) => {
    console.log('Edit template:', template.id)
    // Implementation would go here
  }

  const handleDeleteTemplate = (template: Template) => {
    console.log('Delete template:', template.id)
    // Implementation would go here
  }

  const handlePreviewTemplate = (template: Template) => {
    setSelectedTemplate(template)
    setShowPreview(true)
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-900">
          {categories.find(c => c.key === selectedCategory)?.label || 'Templates'}
        </h2>
        <p className="text-gray-600 mt-1">
          {categories.find(c => c.key === selectedCategory)?.description || 'Manage and organize templates across your publishing platform'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
            <nav className="space-y-1">
              {categories.map((category) => (
                <button
                  key={category.key}
                  onClick={() => setSelectedCategory(category.key)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    selectedCategory === category.key
                      ? 'bg-blue-100 text-blue-900 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div>{category.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{category.description}</div>
                </button>
              ))}
            </nav>
          </div>
        </div>

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
                  
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2">
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
                        Overrides
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
                            <div>
                              <div className="text-sm font-semibold text-gray-900">
                                {template.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {template.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-500">
                          <span className="italic">{template.inheritsFrom}</span>
                        </td>
                        <td className="py-4 px-6 text-sm font-medium text-gray-900">
                          {template.overrides}
                        </td>
                        <td className="py-4 px-6 text-sm">
                          <div className="flex flex-col gap-1">
                            <button className="text-blue-600 hover:text-blue-800 text-left">
                              Edit Page Template
                            </button>
                            {template.overrides > 0 && (
                              <button className="text-blue-600 hover:text-blue-800 text-left">
                                Manage Template Overrides (Pages)
                              </button>
                            )}
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
        </div>
        {showPreview && selectedTemplate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Template Preview: {selectedTemplate.name}</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="bg-gray-100 rounded-lg p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <Eye className="h-16 w-16 mx-auto" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">Template Preview</h4>
                <p className="text-gray-600 mb-4">{selectedTemplate.description}</p>
                <p className="text-sm text-gray-500">
                  Preview functionality will be implemented with live template rendering
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
