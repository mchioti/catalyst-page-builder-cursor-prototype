import React from 'react'
import type { WidgetSection, LayoutArea, Widget } from '../../types'

// TOC Template Configuration
export const createTOCTemplate = (journalCode: string): WidgetSection[] => {
  return [
    // Header Section (Global - Black header with search)
    {
      id: 'toc-header-section',
      name: 'Header',
      type: 'header',
      layout: 'single-column',
      areas: [
        {
          id: 'toc-header-area',
          name: 'Header Content',
          maxWidgets: 1,
          widgets: [
            {
              id: 'toc-site-header',
              type: 'html',
              skin: 'raw',
              htmlContent: `
                <div class="bg-black text-white py-2 px-6">
                  <div class="max-w-6xl mx-auto flex items-center justify-between text-sm">
                    <div class="text-gray-300">brought to you by Atypon</div>
                    <div class="flex items-center space-x-4">
                      <select class="bg-gray-800 text-white text-xs px-2 py-1 rounded">
                        <option>ANYWHERE</option>
                      </select>
                      <input type="text" placeholder="Enter search phrase/DOI" class="bg-gray-800 text-white text-xs px-2 py-1 rounded w-48" />
                      <button class="bg-red-600 text-white px-2 py-1 text-xs rounded">🔍</button>
                      <button class="text-white text-xs">Advanced Search</button>
                      <button class="text-white text-xs">🛒</button>
                      <button class="text-white text-xs">Maria Chioti</button>
                    </div>
                  </div>
                </div>
              `
            }
          ]
        }
      ]
    },

    // Journal Banner Section
    {
      id: 'toc-journal-banner-section',
      name: 'Journal Banner',
      type: 'hero',
      layout: 'single-column',
      areas: [
        {
          id: 'toc-journal-banner-area',
          name: 'Journal Banner Content',
          maxWidgets: 1,
          widgets: [
            {
              id: 'toc-journal-banner-widget',
              type: 'html',
              skin: 'raw',
              htmlContent: getJournalHeroBanner(journalCode)
            }
          ]
        }
      ]
    },

    // Journal Menu Section
    {
      id: 'toc-journal-menu-section', 
      name: 'Journal Menu',
      type: 'navigation',
      layout: 'single-column',
      areas: [
        {
          id: 'toc-journal-menu-area',
          name: 'Journal Navigation',
          maxWidgets: 1,
          widgets: [
            {
              id: 'toc-journal-menu-widget',
              type: 'html',
              skin: 'raw',
              htmlContent: getWileyNavigation(journalCode)
            }
          ]
        }
      ]
    },

    // Breadcrumbs Section
    {
      id: 'toc-breadcrumbs-section',
      name: 'Breadcrumbs',
      type: 'navigation',
      layout: 'single-column',
      areas: [
        {
          id: 'toc-breadcrumbs-area',
          name: 'Breadcrumb Navigation',
          maxWidgets: 1,
          widgets: [
            {
              id: 'toc-breadcrumbs-widget',
              type: 'html',
              skin: 'raw',
              htmlContent: getBreadcrumbHTML(journalCode)
            }
          ]
        }
      ]
    },

    // Main Content Section (Matches live site layout exactly)
    {
      id: 'toc-main-content-section',
      name: 'Main Content',
      type: 'content',
      layout: 'single-column',
      areas: [
        {
          id: 'toc-main-area',
          name: 'Complete TOC Layout',
          maxWidgets: 1,
          widgets: [
            {
              id: 'toc-complete-layout',
              type: 'html',
              skin: 'raw',
              htmlContent: getCompleteTOCLayout(journalCode)
            }
          ]
        }
      ]
    },

    // Footer Section (Matches live site footer)
    {
      id: 'toc-footer-section',
      name: 'Footer',
      type: 'footer',
      layout: 'single-column',
      areas: [
        {
          id: 'toc-footer-area',
          name: 'Footer Content',
          maxWidgets: 1,
          widgets: [
            {
              id: 'toc-site-footer',
              type: 'html',
              skin: 'raw',
              htmlContent: getLiveSiteFooter()
            }
          ]
        }
      ]
    }
  ]
}

// Helper functions for dynamic content based on journal context
function getJournalName(journalCode: string): string {
  const journalNames = {
    'advma': 'Advanced Materials',
    'embo': 'The EMBO Journal'
  }
  return journalNames[journalCode as keyof typeof journalNames] || 'Journal'
}

// HTML generation functions that match the live site exactly

function getJournalHeroBanner(journalCode: string): string {
  const journalInfo = {
    'advma': {
      name: 'Advanced Materials',
      issn: '1521-4095',
      totalIssues: '35',
      oldestVolume: 'Volume 1 Issue 1 (January 1989)',
      latestVolume: 'Volume 35 Issue 48 (December 2024)',
      editor: 'Association for Computing Machinery and Morgan & Claypool'
    },
    'embo': {
      name: 'The EMBO Journal', 
      issn: '1460-2075',
      totalIssues: '42',
      oldestVolume: 'Volume 1 Issue 1 (January 1982)',
      latestVolume: 'Volume 42 Issue 24 (December 2024)',
      editor: 'European Molecular Biology Organization'
    }
  }
  
  const journal = journalInfo[journalCode as keyof typeof journalInfo] || journalInfo.advma
  
  return `
    <div class="bg-cover bg-center text-white py-12 px-6 relative" style="background-image: url('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=400&fit=crop'); background-size: cover;">
      <div class="absolute inset-0 bg-black bg-opacity-70"></div>
      <div class="max-w-6xl mx-auto relative z-10">
        <h1 class="text-4xl font-bold mb-2">${journal.name}</h1>
        <p class="text-lg mb-2">ISSN (online): ${journal.issn}</p>
        <p class="text-sm mb-2">Total number of issues: ${journal.totalIssues} • Oldest volume ${journal.oldestVolume} • Latest volume ${journal.latestVolume}</p>
        <p class="text-sm mb-6">Editor: ${journal.editor}</p>
        <div class="flex space-x-4">
          <button class="bg-red-600 text-white px-4 py-2 rounded font-medium">SUBSCRIBE/RENEW</button>
          <button class="bg-red-600 text-white px-4 py-2 rounded font-medium">RECOMMEND TO A LIBRARIAN</button>
          <button class="bg-red-600 text-white px-4 py-2 rounded font-medium">SUBMIT AN ARTICLE</button>
        </div>
      </div>
    </div>
  `
}

function getWileyNavigation(journalCode: string): string {
  return `
    <div class="bg-blue-700 text-white py-3 px-6">
      <div class="max-w-6xl mx-auto flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <div class="text-lg font-bold">WILEY</div>
          <div class="text-sm">ONLINE LIBRARY</div>
        </div>
        <nav class="flex space-x-6 text-sm">
          <a href="#" class="hover:text-blue-200">Journal Home</a>
          <a href="#" class="hover:text-blue-200">Current Issue</a>
          <a href="#" class="hover:text-blue-200">Archive</a>
          <a href="#" class="hover:text-blue-200">Subscribe/Renew</a>
          <a href="#" class="hover:text-blue-200">About</a>
          <a href="#" class="hover:text-blue-200">For Authors</a>
        </nav>
      </div>
    </div>
  `
}

function getBreadcrumbHTML(journalCode: string): string {
  const journalName = getJournalName(journalCode)
  return `
    <div class="bg-white py-2 px-6 border-b">
      <div class="max-w-6xl mx-auto text-sm text-gray-600">
        <a href="#" class="hover:text-blue-600">Home</a>
        <span class="mx-2">→</span>
        <span>${journalName}</span>
      </div>
    </div>
  `
}

function getCompleteTOCLayout(journalCode: string): string {
  const journalInfo = {
    'advma': {
      name: 'Advanced Materials',
      description: 'The leading international journal covering all aspects of materials science, from synthesis and characterization to applications in electronics, energy, and healthcare.',
      image: 'https://images.unsplash.com/photo-1518152006812-edab29b069ac?w=300&h=400&fit=crop',
      issue: '48'
    },
    'embo': {
      name: 'The EMBO Journal', 
      description: 'A peer-reviewed scientific journal publishing research in molecular biology. It is published by John Wiley & Sons on behalf of the European Molecular Biology Organization.',
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=400&fit=crop',
      issue: '24'
    }
  }
  
  const journal = journalInfo[journalCode as keyof typeof journalInfo] || journalInfo.advma
  
  const articles = journalCode === 'advma' ? [
    {
      title: 'Perovskite Solar Cells: Advanced Tandem Architectures for Enhanced Efficiency',
      authors: 'Sarah Chen, Michael Rodriguez, Elena Petrov, James Wilson'
    },
    {
      title: 'Machine Learning-Guided Discovery of 2D Materials for Energy Storage',
      authors: 'Dr. Alex Kumar, Prof. Lisa Zhang, Dr. Robert Thompson'
    }
  ] : [
    {
      title: 'CRISPR-Cas9 Mediated Gene Editing in Human Embryonic Stem Cells',
      authors: 'Maria Andersson, Hiroshi Tanaka, Jennifer Liu'
    },
    {
      title: 'Mitochondrial Dynamics in Neurodegeneration: New Therapeutic Targets',
      authors: 'Prof. Anna Schmidt, Dr. Kenji Nakamura, Dr. Sophie Dubois'
    }
  ]

  return `
    <div class="py-8 px-6 bg-white">
      <div class="max-w-6xl mx-auto">
        <div class="grid lg:grid-cols-3 gap-8">
          <!-- Left Content -->
          <div class="lg:col-span-2">
            <!-- Latest Articles -->
            <div class="mb-8">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-bold text-gray-900">LATEST</h2>
                <h2 class="text-xl font-bold text-gray-900">MOST CITED</h2>
              </div>
              
              <div class="space-y-6">
                ${articles.map(article => `
                  <article class="border-b pb-6">
                    <h3 class="text-lg font-semibold text-blue-600 mb-2 hover:underline cursor-pointer">
                      ${article.title}
                    </h3>
                    <p class="text-sm text-gray-600 mb-2">${article.authors}</p>
                    <p class="text-xs text-gray-500 mb-2">Just Accepted</p>
                  </article>
                `).join('')}
              </div>
            </div>

            <!-- About Section -->
            <div class="mb-8 p-6 bg-gray-50 rounded-lg">
              <h2 class="text-xl font-bold text-gray-900 mb-4">
                Interested in learning more about ${journal.name}?
              </h2>
              <p class="text-gray-600 mb-4">${journal.description}</p>
              <button class="bg-red-600 text-white px-6 py-2 rounded font-medium">Subscribe/Renew</button>
            </div>

            <!-- Most Read -->
            <div class="mb-8">
              <h2 class="text-xl font-bold text-gray-900 mb-4">MOST READ</h2>
              <p class="text-gray-500 text-sm">There are no results at this time</p>
            </div>
          </div>

          <!-- Right Sidebar -->
          <div class="lg:col-span-1">
            <!-- Current Issue -->
            <div class="bg-white border rounded p-4 mb-6">
              <h3 class="font-bold text-gray-900 mb-4">CURRENT ISSUE</h3>
              <div class="mb-4">
                <img 
                  src="${journal.image}"
                  alt="${journal.name} Cover"
                  class="w-full h-64 object-cover rounded mb-3"
                />
                <p class="text-center text-sm text-gray-600 font-medium">
                  Volume ${journalCode === 'advma' ? '35' : '42'} • Issue ${journal.issue} • Dec 2024
                </p>
              </div>
            </div>

            <!-- Journal Metrics -->
            <div class="bg-gray-50 p-4 rounded mb-6">
              <h3 class="font-bold text-gray-900 mb-3">Journal Metrics</h3>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span>Impact Factor:</span>
                  <span class="font-medium">${journalCode === 'advma' ? '32.086' : '12.779'}</span>
                </div>
                <div class="flex justify-between">
                  <span>CiteScore:</span>
                  <span class="font-medium">${journalCode === 'advma' ? '58.5' : '24.3'}</span>
                </div>
                <div class="flex justify-between">
                  <span>Downloads (2023):</span>
                  <span class="font-medium">${journalCode === 'advma' ? '2.8M' : '892K'}</span>
                </div>
              </div>
            </div>

            <!-- Quick Links -->
            <div class="bg-white border rounded p-4">
              <h3 class="font-bold text-gray-900 mb-3">Quick Links</h3>
              <div class="space-y-2 text-sm">
                <a href="#" class="block text-blue-600 hover:underline">Author Guidelines</a>
                <a href="#" class="block text-blue-600 hover:underline">Submission Site</a>
                <a href="#" class="block text-blue-600 hover:underline">Editorial Board</a>
                <a href="#" class="block text-blue-600 hover:underline">Special Issues</a>
                <a href="#" class="block text-blue-600 hover:underline">Contact Us</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
}

function getLiveSiteFooter(): string {
  return `
    <div class="bg-gray-900 text-white py-8 px-6">
      <div class="max-w-6xl mx-auto grid md:grid-cols-4 gap-6">
        <div>
          <h4 class="font-bold mb-3">About</h4>
          <div class="space-y-2 text-sm">
            <a href="#" class="block hover:text-gray-300">University Publications</a>
            <a href="#" class="block hover:text-gray-300">Terms and Conditions</a>
            <a href="#" class="block hover:text-gray-300">Privacy</a>
          </div>
        </div>
        <div>
          <h4 class="font-bold mb-3">Collections</h4>
          <div class="space-y-2 text-sm">
            <a href="#" class="block hover:text-gray-300">Browse Journals</a>
            <a href="#" class="block hover:text-gray-300">Authors</a>
            <a href="#" class="block hover:text-gray-300">Librarians</a>
          </div>
        </div>
        <div>
          <h4 class="font-bold mb-3">Information</h4>
          <div class="space-y-2 text-sm">
            <a href="#" class="block hover:text-gray-300">Help / FAQs</a>
            <a href="#" class="block hover:text-gray-300">Contact us</a>
          </div>
        </div>
        <div>
          <h4 class="font-bold mb-3">Follow us on Social</h4>
          <div class="space-y-2 text-sm">
            <a href="#" class="block hover:text-gray-300">📘 Facebook</a>
            <a href="#" class="block hover:text-gray-300">🐦 X (formerly twitter)</a>
            <a href="#" class="block hover:text-gray-300">💼 LinkedIn</a>
          </div>
        </div>
      </div>
      <div class="max-w-6xl mx-auto mt-8 pt-6 border-t border-gray-700 text-center text-sm text-gray-400">
        © 2025 Atypon UX Design Studio • Privacy Policy • Terms of Use • Wiley <span class="text-blue-400">Online Library</span>
      </div>
    </div>
  `
}

// AI-generated mock articles for template preview (schema.org format)
export const generateMockTOCContent = (journalCode: string) => {
  const mockArticles = {
    'advma': [
      {
        "@context": "https://schema.org",
        "@type": "ScholarlyArticle",
        "headline": "Perovskite Solar Cells: Advanced Tandem Architectures for Enhanced Efficiency",
        "author": [
          { "@type": "Person", "name": "Sarah Chen", "affiliation": { "@type": "Organization", "name": "MIT Materials Science" } },
          { "@type": "Person", "name": "Michael Rodriguez", "affiliation": { "@type": "Organization", "name": "Stanford University" } },
          { "@type": "Person", "name": "Elena Petrov", "affiliation": { "@type": "Organization", "name": "Harvard University" } },
          { "@type": "Person", "name": "James Wilson", "affiliation": { "@type": "Organization", "name": "UC Berkeley" } }
        ],
        "datePublished": "2024-12-15",
        "isPartOf": {
          "@type": "PublicationIssue",
          "issueNumber": "48",
          "isPartOf": {
            "@type": "PublicationVolume",
            "volumeNumber": "35",
            "isPartOf": { "@type": "Periodical", "name": "Advanced Materials" }
          }
        },
        "pageStart": "2401234",
        "abstract": "Novel tandem perovskite architectures demonstrate unprecedented efficiency improvements in solar cell technology, opening new pathways for renewable energy applications.",
        "identifier": { "@type": "PropertyValue", "name": "DOI", "value": "https://doi.org/10.1002/adma.202401234" },
        "accessMode": "FULL_ACCESS",
        "contentType": "Research Articles"
      },
      {
        "@context": "https://schema.org",
        "@type": "ScholarlyArticle",
        "headline": "Machine Learning-Guided Discovery of 2D Materials for Energy Storage",
        "author": [
          { "@type": "Person", "name": "Alex Kumar", "affiliation": { "@type": "Organization", "name": "MIT Computer Science" } },
          { "@type": "Person", "name": "Lisa Zhang", "affiliation": { "@type": "Organization", "name": "Stanford AI Lab" } },
          { "@type": "Person", "name": "Robert Thompson", "affiliation": { "@type": "Organization", "name": "UC San Diego" } }
        ],
        "datePublished": "2024-12-15",
        "isPartOf": {
          "@type": "PublicationIssue",
          "issueNumber": "48",
          "isPartOf": {
            "@type": "PublicationVolume",
            "volumeNumber": "35",
            "isPartOf": { "@type": "Periodical", "name": "Advanced Materials" }
          }
        },
        "pageStart": "2401235",
        "abstract": "AI-driven materials discovery accelerates identification of promising 2D materials for next-generation energy storage applications.",
        "identifier": { "@type": "PropertyValue", "name": "DOI", "value": "https://doi.org/10.1002/adma.202401235" },
        "accessMode": "FULL_ACCESS",
        "contentType": "Research Articles"
      },
      {
        "@context": "https://schema.org",
        "@type": "ScholarlyArticle",
        "headline": "Flexible Electronics: From Lab to Market - Current Challenges and Future Prospects",
        "author": [
          { "@type": "Person", "name": "David Park", "affiliation": { "@type": "Organization", "name": "Seoul National University" } },
          { "@type": "Person", "name": "Michelle Foster", "affiliation": { "@type": "Organization", "name": "Cambridge University" } }
        ],
        "datePublished": "2024-12-15",
        "isPartOf": {
          "@type": "PublicationIssue",
          "issueNumber": "48",
          "isPartOf": {
            "@type": "PublicationVolume",
            "volumeNumber": "35",
            "isPartOf": { "@type": "Periodical", "name": "Advanced Materials" }
          }
        },
        "pageStart": "2401236",
        "abstract": "Comprehensive review of flexible electronics commercialization challenges and emerging solutions for scalable manufacturing.",
        "identifier": { "@type": "PropertyValue", "name": "DOI", "value": "https://doi.org/10.1002/adma.202401236" },
        "accessMode": "FULL_ACCESS",
        "contentType": "Progress Reports"
      }
    ],
    'embo': [
      {
        "@context": "https://schema.org",
        "@type": "ScholarlyArticle",
        "headline": "CRISPR-Cas9 Mediated Gene Editing in Human Embryonic Stem Cells",
        "author": [
          { "@type": "Person", "name": "Maria Andersson", "affiliation": { "@type": "Organization", "name": "Karolinska Institute" } },
          { "@type": "Person", "name": "Hiroshi Tanaka", "affiliation": { "@type": "Organization", "name": "University of Tokyo" } },
          { "@type": "Person", "name": "Jennifer Liu", "affiliation": { "@type": "Organization", "name": "Harvard Medical School" } }
        ],
        "datePublished": "2024-12-15",
        "isPartOf": {
          "@type": "PublicationIssue",
          "issueNumber": "24",
          "isPartOf": {
            "@type": "PublicationVolume",
            "volumeNumber": "42",
            "isPartOf": { "@type": "Periodical", "name": "The EMBO Journal" }
          }
        },
        "pageStart": "e114567",
        "abstract": "Precise gene editing protocols for human embryonic stem cell applications demonstrate enhanced efficiency and reduced off-target effects.",
        "identifier": { "@type": "PropertyValue", "name": "DOI", "value": "https://doi.org/10.15252/embj.2024114567" },
        "accessMode": "FULL_ACCESS",
        "contentType": "Research Papers"
      },
      {
        "@context": "https://schema.org",
        "@type": "ScholarlyArticle",
        "headline": "Mitochondrial Dynamics in Neurodegeneration: New Therapeutic Targets",
        "author": [
          { "@type": "Person", "name": "Anna Schmidt", "affiliation": { "@type": "Organization", "name": "Max Planck Institute" } },
          { "@type": "Person", "name": "Kenji Nakamura", "affiliation": { "@type": "Organization", "name": "RIKEN Institute" } },
          { "@type": "Person", "name": "Sophie Dubois", "affiliation": { "@type": "Organization", "name": "Institut Pasteur" } }
        ],
        "datePublished": "2024-12-15",
        "isPartOf": {
          "@type": "PublicationIssue",
          "issueNumber": "24",
          "isPartOf": {
            "@type": "PublicationVolume",
            "volumeNumber": "42",
            "isPartOf": { "@type": "Periodical", "name": "The EMBO Journal" }
          }
        },
        "pageStart": "e114568",
        "abstract": "Investigation of mitochondrial dysfunction in neurodegenerative diseases reveals novel therapeutic intervention points.",
        "identifier": { "@type": "PropertyValue", "name": "DOI", "value": "https://doi.org/10.15252/embj.2024114568" },
        "accessMode": "FULL_ACCESS",
        "contentType": "Research Papers"
      },
      {
        "@context": "https://schema.org",
        "@type": "ScholarlyArticle",
        "headline": "The Evolution of Single-Cell RNA Sequencing: From Method to Medicine",
        "author": [
          { "@type": "Person", "name": "Oliver Johnson", "affiliation": { "@type": "Organization", "name": "Oxford University" } },
          { "@type": "Person", "name": "Yuki Sato", "affiliation": { "@type": "Organization", "name": "University of Kyoto" } },
          { "@type": "Person", "name": "Isabella Martinez", "affiliation": { "@type": "Organization", "name": "Barcelona Institute of Science" } }
        ],
        "datePublished": "2024-12-15",
        "isPartOf": {
          "@type": "PublicationIssue",
          "issueNumber": "24",
          "isPartOf": {
            "@type": "PublicationVolume",
            "volumeNumber": "42",
            "isPartOf": { "@type": "Periodical", "name": "The EMBO Journal" }
          }
        },
        "pageStart": "e114569",
        "abstract": "Comprehensive review of single-cell RNA sequencing technological advances and their clinical applications in precision medicine.",
        "identifier": { "@type": "PropertyValue", "name": "DOI", "value": "https://doi.org/10.15252/embj.2024114569" },
        "accessMode": "FULL_ACCESS",
        "contentType": "Review Articles"
      }
    ]
  }
  
  return mockArticles[journalCode as keyof typeof mockArticles] || mockArticles.advma
}

export default { createTOCTemplate, generateMockTOCContent }
