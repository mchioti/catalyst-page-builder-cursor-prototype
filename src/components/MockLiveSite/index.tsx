import { useState, useEffect } from 'react'
import type { EditingContext, MockLiveSiteRoute, CanvasItem } from '../../types'
import { LayoutRenderer } from '../Canvas/LayoutRenderer'
import { TemplateEditingScopeButton } from './TemplateEditingScopeButton'
import type { EditingScope, IssueType } from './TemplateEditingScopeButton'
import { ConflictResolutionDialog } from './ConflictResolutionDialog'
import { createTOCTemplate } from '../Templates/TOCTemplate'
import { useBrandingStore } from '../../stores/brandingStore'
import { CanvasThemeProvider } from '../Canvas/CanvasThemeProvider'
import { createDebugLogger } from '../../utils/logger'
import '../../styles/journal-themes.css'

// Control logging for this file
const DEBUG = false
const debugLog = createDebugLogger(DEBUG)

// Utility function to extract journal code from route/context
const getJournalCode = (route: string): string => {
  const match = route.match(/\/(toc|journal)\/([^\/]+)/);
  return match ? match[2] : 'default';
}

// Dynamic Homepage that uses canvas content
function MockHomepage({ 
  canvasItems, 
  schemaObjects,
  websiteId 
}: { 
  canvasItems: CanvasItem[]
  schemaObjects: any[]
  websiteId: string
}) {
  debugLog('log', '🏠 MockHomepage RENDER:', {
    canvasItemsCount: canvasItems?.length || 0,
    schemaObjectsCount: schemaObjects?.length || 0,
    websiteId,
    canvasItems: canvasItems
  })

  return (
    <div className="min-h-screen">
      {/* Render canvas content with sidebar support */}
      <LayoutRenderer
        canvasItems={canvasItems}
        schemaObjects={schemaObjects}
        isLiveMode={true}
        websiteId={websiteId}
        // No journalContext for homepage - should use default button styling
        onWidgetClick={() => {}} // No widget clicking on live site
        usePageStore={{ getState: () => ({ canvasItems, schemaObjects }) }} // Minimal store for live site
      />
    </div>
  )
}

function MockJournalTOC({ 
  journalCode, 
  setMockLiveSiteRoute,
  canvasItems,
  schemaObjects,
  editingContext,
  currentRoute,
  websiteId
}: { 
  journalCode: string; 
  setMockLiveSiteRoute?: (route: MockLiveSiteRoute) => void;
  canvasItems?: CanvasItem[];
  schemaObjects?: any[];
  editingContext?: EditingContext;
  currentRoute?: MockLiveSiteRoute;
  websiteId: string;
}) {
  const journalInfo = {
    advma: {
      name: 'Advanced Materials',
      issn: '0935-9648',
      onlineIssn: '1521-4095',
      editor: 'Wiley-VCH and Materials Research Society'
    },
    embo: {
      name: 'The EMBO Journal', 
      issn: '0261-4189',
      onlineIssn: '1460-2075',
      editor: 'European Molecular Biology Organization'
    }
  }

  const journal = journalInfo[journalCode as keyof typeof journalInfo] || journalInfo.advma

  // Render canvas content for TOC if:
  // 1. Canvas has content (route-specific edits OR global template changes)
  // 2. User is in editing mode (individual page OR template editing)
  // 3. Currently on a TOC route
  const hasCanvasContent = canvasItems && canvasItems.length > 0
  const isCurrentlyOnTOCRoute = currentRoute && currentRoute.includes('/toc/')
  const isInEditingMode = editingContext === 'page' || editingContext === 'template'
  
  const shouldRenderCanvasContent = hasCanvasContent && 
                                    isInEditingMode && 
                                    isCurrentlyOnTOCRoute
  
  debugLog('log', '🔍 TOC Canvas Decision:', {
    route: currentRoute,
    hasCanvas: hasCanvasContent,
    editingContext: editingContext,
    isInEditingMode: isInEditingMode,
    shouldRender: shouldRenderCanvasContent,
    canvasCount: canvasItems?.length || 0
  })
  
  if (shouldRenderCanvasContent) {
    debugLog('log', '🎨 Rendering canvas content for TOC (user has been editing):', canvasItems.length, 'items')
    return (
      <div className={`min-h-screen journal-${journalCode}`}>
        {/* Render canvas content with sidebar support */}
        <LayoutRenderer
          canvasItems={canvasItems}
          schemaObjects={schemaObjects || []}
          isLiveMode={true}
          journalContext={journalCode}
          websiteId={websiteId}
          onWidgetClick={() => {}} // No widget clicking on live site
          usePageStore={{ getState: () => ({ canvasItems, schemaObjects }) }} // Minimal store for live site
        />
      </div>
    )
  }
  
  // Otherwise render static default content
  return (
    <div className={`min-h-screen journal-${journalCode}`}>
      {/* University Publications Header */}
      <div className="bg-black text-white py-2 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm">
          <div className="text-gray-300">brought to you by Atypon</div>
          <div className="flex items-center space-x-4">
            <select className="bg-gray-800 text-white text-xs px-2 py-1 rounded">
              <option>ANYWHERE</option>
            </select>
            <input type="text" placeholder="Enter search phrase/DOI" className="bg-gray-800 text-white text-xs px-2 py-1 rounded w-48" />
            <button className="journal-themed-button px-2 py-1 text-xs rounded">🔍</button>
            <button className="text-white text-xs">Advanced Search</button>
            <button className="text-white text-xs">🛒</button>
            <button className="text-white text-xs">Maria Chioti</button>
          </div>
        </div>
      </div>

      {/* Journal Hero Banner */}
      <div 
        className="bg-cover bg-center text-white py-12 px-6 relative"
        style={{ 
          backgroundImage: 'url(https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=400&fit=crop)',
          backgroundSize: 'cover'
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <h1 className="text-4xl font-bold mb-2">Volume 67 • Issue 12</h1>
          <p className="text-lg mb-4">
            ISSN (print): {journal.issn} • ISSN (online): {journal.onlineIssn}
          </p>
          <p className="text-base">Editor: {journal.editor}</p>
          <div className="flex space-x-4 mt-6">
            <button className="journal-themed-button px-6 py-3 rounded-md font-medium text-sm uppercase tracking-wide">SUBSCRIBE/RENEW</button>
            <button className="journal-themed-button px-6 py-3 rounded-md font-medium text-sm uppercase tracking-wide">RECOMMEND TO A LIBRARIAN</button>
            <button className="journal-themed-button px-6 py-3 rounded-md font-medium text-sm uppercase tracking-wide">SUBMIT AN ARTICLE</button>
          </div>
        </div>
      </div>

      {/* Wiley Online Library Navigation */}
      <div className="bg-blue-700 text-white py-3 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="text-lg font-bold">WILEY</div>
            <div className="text-sm">ONLINE LIBRARY</div>
          </div>
          <nav className="flex space-x-6 text-sm">
            <a href="#" className="hover:text-blue-200">Journal Home</a>
            <a href="#" className="hover:text-blue-200">Current Issue</a>
            <a href="#" className="hover:text-blue-200">Archive</a>
            <a href="#" className="hover:text-blue-200">Subscribe/Renew</a>
            <a href="#" className="hover:text-blue-200">About</a>
            <a href="#" className="hover:text-blue-200">For Authors</a>
          </nav>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-white py-2 px-6 border-b">
        <div className="max-w-6xl mx-auto text-sm text-gray-600">
          <a href="#" className="hover:text-blue-600">Home</a>
          <span className="mx-2">→</span>
          <a href="#" className="hover:text-blue-600">{journal.name}</a>
          <span className="mx-2">→</span>
          <span>Vol. 67, No. 12</span>
        </div>
      </div>

      {/* Navigation Banner for Current Issue */}
      <div className="bg-blue-50 border-b border-blue-100 py-2 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-blue-700">
              <span>🔍</span>
              <span>Want to see editing options for past issues?</span>
            </div>
            {setMockLiveSiteRoute && (
              <button
                onClick={() => setMockLiveSiteRoute(`/toc/${journalCode}/vol-35-issue-47` as MockLiveSiteRoute)}
                className="text-blue-600 hover:text-blue-800 underline font-medium"
              >
                View Past Issue Example →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-8 px-6 bg-white">
        <div className="max-w-6xl mx-auto flex gap-8">
          {/* Left Sidebar - Sections */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-semibold text-gray-900 mb-4">SECTIONS</h3>
              <div className="space-y-2 text-sm">
                {journalCode === 'advma' ? (
                  <>
                    <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                      Research Articles
                    </div>
                    <div className="text-gray-700">Progress Reports</div>
                    <div className="text-gray-700">Feature Articles</div>
                    <div className="text-gray-700">Communications</div>
                    <div className="text-gray-700">Reviews</div>
                    <div className="text-gray-700">Advanced Materials Interfaces</div>
                    <div className="text-gray-700">Energy & Environmental Materials</div>
                    <div className="text-gray-700">Biomedical Applications</div>
                    <div className="text-gray-700">Electronic & Photonic Materials</div>
                    <div className="text-blue-600 font-medium">Emerging Technologies</div>
                    <div className="text-gray-700">Nanomaterials</div>
                    <div className="text-gray-700">2D Materials</div>
                    <div className="text-gray-700">Quantum Materials</div>
                    <div className="text-gray-700">Soft Materials</div>
                    <div className="text-gray-700">Sustainability</div>
                  </>
                ) : (
                  <>
                    <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                      Research Papers
                    </div>
                    <div className="text-gray-700">Review Articles</div>
                    <div className="text-gray-700">Scientific Reports</div>
                    <div className="text-gray-700">Tools & Resources</div>
                    <div className="text-gray-700">Molecular Systems Biology</div>
                    <div className="text-gray-700">Cell Biology</div>
                    <div className="text-gray-700">Developmental Biology</div>
                    <div className="text-gray-700">Genome Biology</div>
                    <div className="text-blue-600 font-medium">Neuroscience</div>
                    <div className="text-gray-700">Structural Biology</div>
                    <div className="text-gray-700">Biochemistry</div>
                    <div className="text-gray-700">Immunology</div>
                    <div className="text-gray-700">Cancer Research</div>
                    <div className="text-gray-700">Stem Cells</div>
                    <div className="text-gray-700">Metabolism</div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Center Content - Articles */}
          <div className="flex-1">
            <div className="space-y-8">
              {/* Research Articles Section */}
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-red-500 pb-2">
                  {journalCode === 'advma' ? 'RESEARCH ARTICLES' : 'RESEARCH PAPERS'}
                </h2>
                <article className="border-b pb-6">
                  <div className="flex items-start mb-2">
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded mr-3">Full Access</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {journalCode === 'advma' 
                          ? 'Perovskite Solar Cells: Advanced Tandem Architectures for Enhanced Efficiency'
                          : 'CRISPR-Cas9 Mediated Gene Editing in Human Embryonic Stem Cells'
                        }
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {journalCode === 'advma' 
                          ? 'Sarah Chen, Michael Rodriguez, Elena Petrov, James Wilson'
                          : 'Maria Andersson, Hiroshi Tanaka, Jennifer Liu'
                        }
                      </p>
                      <p className="text-xs text-gray-500">pp. 2401234 • Published Online: 02 December 2024</p>
                      <a href="#" className="text-blue-600 text-xs hover:underline">
                        {journalCode === 'advma' ? 'https://doi.org/10.1002/adma.202401234' : 'https://doi.org/10.15252/embj.2024114567'}
                      </a>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-3">
                    <button className="text-xs bg-gray-100 px-2 py-1 rounded">📄 Abstract</button>
                    <button className="text-xs bg-gray-100 px-2 py-1 rounded">📄 Full text</button>
                    <button className="text-xs bg-gray-100 px-2 py-1 rounded">📄 PDF</button>
                    <button className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Open URL</button>
                    <button className="text-xs bg-gray-100 px-2 py-1 rounded">🔗 XML</button>
                  </div>
                </article>
              </section>

              {/* Second Article */}
              <section>
                <article className="border-b pb-6">
                  <div className="flex items-start mb-2">
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded mr-3">Full Access</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {journalCode === 'advma' 
                          ? 'Machine Learning-Guided Discovery of 2D Materials for Energy Storage'
                          : 'Mitochondrial Dynamics in Neurodegeneration: New Therapeutic Targets'
                        }
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {journalCode === 'advma' 
                          ? 'Dr. Alex Kumar, Prof. Lisa Zhang, Dr. Robert Thompson'
                          : 'Prof. Anna Schmidt, Dr. Kenji Nakamura, Dr. Sophie Dubois'
                        }
                      </p>
                      <p className="text-xs text-gray-500">pp. 2401235 • Published Online: 02 December 2024</p>
                      <a href="#" className="text-blue-600 text-xs hover:underline">
                        {journalCode === 'advma' ? 'https://doi.org/10.1002/adma.202401235' : 'https://doi.org/10.15252/embj.2024114568'}
                      </a>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-3">
                    <button className="text-xs bg-gray-100 px-2 py-1 rounded">📄 Full text</button>
                    <button className="text-xs bg-gray-100 px-2 py-1 rounded">📄 PDF</button>
                    <button className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Open URL</button>
                    <button className="text-xs bg-gray-100 px-2 py-1 rounded">🔗 XML</button>
                  </div>
                </article>
              </section>

              {/* Reviews Section */}
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-red-500 pb-2">
                  {journalCode === 'advma' ? 'PROGRESS REPORTS' : 'REVIEW ARTICLES'}
                </h2>
                <article className="border-b pb-6">
                  <div className="flex items-start mb-2">
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded mr-3">Full Access</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {journalCode === 'advma' 
                          ? 'Flexible Electronics: From Lab to Market - Current Challenges and Future Prospects'
                          : 'The Evolution of Single-Cell RNA Sequencing: From Method to Medicine'
                        }
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {journalCode === 'advma' 
                          ? 'Prof. David Park, Dr. Michelle Foster'
                          : 'Prof. Oliver Johnson, Dr. Yuki Sato, Dr. Isabella Martinez'
                        }
                      </p>
                      <p className="text-xs text-gray-500">pp. 2401236 • Published Online: 02 December 2024</p>
                      <a href="#" className="text-blue-600 text-xs hover:underline">
                        {journalCode === 'advma' ? 'https://doi.org/10.1002/adma.202401236' : 'https://doi.org/10.15252/embj.2024114569'}
                      </a>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-3">
                    <button className="text-xs bg-gray-100 px-2 py-1 rounded">📄 Full text</button>
                    <button className="text-xs bg-gray-100 px-2 py-1 rounded">📄 PDF</button>
                    <button className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Open URL</button>
                    <button className="text-xs bg-gray-100 px-2 py-1 rounded">🔗 XML</button>
                  </div>
                </article>
              </section>
            </div>
          </div>

          {/* Right Sidebar - Current Issue */}
          <div className="w-72 flex-shrink-0">
            <div className="bg-white border rounded p-4">
              <h3 className="font-bold text-gray-900 mb-4">CURRENT ISSUE</h3>
              <div className="mb-4">
                <img 
                  src={journalCode === 'advma' 
                    ? "https://images.unsplash.com/photo-1518152006812-edab29b069ac?w=300&h=400&fit=crop" 
                    : "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=400&fit=crop"
                  }
                  alt={`${journal.name} Cover`}
                  className="w-full h-64 object-cover rounded"
                />
                <p className="text-center text-sm text-gray-600 mt-2">Volume 35 • Issue 48 • Dec 2024</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MockArticlePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto py-12 px-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Sample Article Page</h1>
        <div className="prose max-w-none">
          <p className="text-lg text-gray-600 mb-6">This would be an individual article page with full content, abstract, citations, etc.</p>
          <div className="bg-gray-50 p-6 rounded-lg">
            <p className="text-sm text-gray-500">Article content goes here...</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function MockJournalHomepage({ journalCode, setMockLiveSiteRoute }: { 
  journalCode: string; 
  setMockLiveSiteRoute: (route: MockLiveSiteRoute) => void;
}) {
  const journalInfo = {
    advma: {
      name: 'Advanced Materials',
      issn: '0935-9648',
      onlineIssn: '1521-4095',
      description: 'The leading international journal covering all aspects of materials science, from synthesis and characterization to applications in electronics, energy, and healthcare.',
      editor: 'Association for Computing Machinery and Morgan & Claypool',
      totalIssues: '35',
      oldestVolume: 'Volume 1 Issue 1 (January 1989)',
      latestVolume: 'Volume 35 Issue 48 (December 2024)',
      image: 'https://images.unsplash.com/photo-1518152006812-edab29b069ac?w=300&h=400&fit=crop'
    },
    embo: {
      name: 'The EMBO Journal', 
      issn: '0261-4189',
      onlineIssn: '1460-2075',
      description: 'A peer-reviewed scientific journal publishing research in molecular biology. It is published by John Wiley & Sons on behalf of the European Molecular Biology Organization.',
      editor: 'European Molecular Biology Organization',
      totalIssues: '42',
      oldestVolume: 'Volume 1 Issue 1 (January 1982)',
      latestVolume: 'Volume 42 Issue 24 (December 2024)',
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=400&fit=crop'
    }
  }

  const journal = journalInfo[journalCode as keyof typeof journalInfo] || journalInfo.advma

  return (
    <div className={`min-h-screen journal-${journalCode}`}>
      {/* University Publications Header */}
      <div className="bg-black text-white py-2 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm">
          <div className="text-gray-300">brought to you by Atypon</div>
          <div className="flex items-center space-x-4">
            <select className="bg-gray-800 text-white text-xs px-2 py-1 rounded">
              <option>ANYWHERE</option>
            </select>
            <input type="text" placeholder="Enter search phrase/DOI" className="bg-gray-800 text-white text-xs px-2 py-1 rounded w-48" />
            <button className="journal-themed-button px-2 py-1 text-xs rounded">🔍</button>
            <button className="text-white text-xs">Advanced Search</button>
            <button className="text-white text-xs">🛒</button>
            <button className="text-white text-xs">Maria Chioti</button>
          </div>
        </div>
      </div>

      {/* Journal Hero Banner */}
      <div 
        className="bg-cover bg-center text-white py-12 px-6 relative"
        style={{ 
          backgroundImage: 'url(https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=400&fit=crop)',
          backgroundSize: 'cover'
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-70"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <h1 className="text-4xl font-bold mb-2">{journal.name}</h1>
          <p className="text-lg mb-2">
            ISSN (online): {journal.onlineIssn}
          </p>
          <p className="text-sm mb-2">
            Total number of issues: {journal.totalIssues} • Oldest volume {journal.oldestVolume} • Latest volume {journal.latestVolume}
          </p>
          <p className="text-sm mb-6">Editor: {journal.editor}</p>
          <div className="flex space-x-4">
            <button className="journal-themed-button px-6 py-3 rounded-md font-medium text-sm uppercase tracking-wide">SUBSCRIBE/RENEW</button>
            <button className="journal-themed-button px-6 py-3 rounded-md font-medium text-sm uppercase tracking-wide">RECOMMEND TO A LIBRARIAN</button>
            <button className="journal-themed-button px-6 py-3 rounded-md font-medium text-sm uppercase tracking-wide">SUBMIT AN ARTICLE</button>
          </div>
        </div>
      </div>

      {/* Wiley Online Library Navigation */}
      <div className="bg-blue-700 text-white py-3 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="text-lg font-bold">WILEY</div>
            <div className="text-sm">ONLINE LIBRARY</div>
          </div>
          <nav className="flex space-x-6 text-sm">
            <a href="#" className="hover:text-blue-200">Journal Home</a>
            <button 
              onClick={() => setMockLiveSiteRoute(`/toc/${journalCode}/current` as MockLiveSiteRoute)}
              className="hover:text-blue-200 cursor-pointer"
            >
              Current Issue
            </button>
            <a href="#" className="hover:text-blue-200">Archive</a>
            <a href="#" className="hover:text-blue-200">Subscribe/Renew</a>
            <a href="#" className="hover:text-blue-200">About</a>
            <a href="#" className="hover:text-blue-200">For Authors</a>
          </nav>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-white py-2 px-6 border-b">
        <div className="max-w-6xl mx-auto text-sm text-gray-600">
          <a href="#" className="hover:text-blue-600">Home</a>
          <span className="mx-2">→</span>
          <span>{journal.name}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-8 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Content */}
            <div className="lg:col-span-2">
              {/* Latest Articles */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">LATEST</h2>
                  <h2 className="text-xl font-bold text-gray-900">MOST CITED</h2>
                </div>
                
                <div className="space-y-6">
                  <article className="border-b pb-6">
                    <h3 className="text-lg font-semibold text-blue-600 mb-2 hover:underline cursor-pointer">
                      {journalCode === 'advma' 
                        ? 'Perovskite Solar Cells: Advanced Tandem Architectures for Enhanced Efficiency'
                        : 'CRISPR-Cas9 Mediated Gene Editing in Human Embryonic Stem Cells'
                      }
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {journalCode === 'advma' 
                        ? 'Sarah Chen, Michael Rodriguez, Elena Petrov, James Wilson'
                        : 'Maria Andersson, Hiroshi Tanaka, Jennifer Liu'
                      }
                    </p>
                    <p className="text-xs text-gray-500 mb-2">Just Accepted</p>
                  </article>

                  <article className="border-b pb-6">
                    <h3 className="text-lg font-semibold text-blue-600 mb-2 hover:underline cursor-pointer">
                      {journalCode === 'advma' 
                        ? 'Machine Learning-Guided Discovery of 2D Materials for Energy Storage'
                        : 'Mitochondrial Dynamics in Neurodegeneration: New Therapeutic Targets'
                      }
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {journalCode === 'advma' 
                        ? 'Dr. Alex Kumar, Prof. Lisa Zhang, Dr. Robert Thompson'
                        : 'Prof. Anna Schmidt, Dr. Kenji Nakamura, Dr. Sophie Dubois'
                      }
                    </p>
                    <p className="text-xs text-gray-500 mb-2">Just Accepted</p>
                  </article>
                </div>
              </div>

              {/* About Section */}
              <div className="mb-8 p-6 bg-gray-50 rounded-lg">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Interested in learning more about {journal.name}?
                </h2>
                <p className="text-gray-600 mb-4">{journal.description}</p>
                <button className="journal-themed-button px-6 py-3 rounded-md font-medium">Subscribe/Renew</button>
              </div>

              {/* Most Read */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">MOST READ</h2>
                <p className="text-gray-500 text-sm">There are no results at this time</p>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-1">
              {/* Current Issue */}
              <div className="bg-white border rounded p-4 mb-6">
                <h3 className="font-bold text-gray-900 mb-4">CURRENT ISSUE</h3>
                <div className="mb-4">
                  <img 
                    src={journal.image}
                    alt={`${journal.name} Cover`}
                    className="w-full h-64 object-cover rounded mb-3"
                  />
                  <p className="text-center text-sm text-gray-600 font-medium">
                    Volume {journal.totalIssues} • Issue {journalCode === 'advma' ? '48' : '24'} • Dec 2024
                  </p>
                </div>
              </div>

              {/* Journal Metrics */}
              <div className="bg-gray-50 p-4 rounded mb-6">
                <h3 className="font-bold text-gray-900 mb-3">Journal Metrics</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Impact Factor:</span>
                    <span className="font-medium">{journalCode === 'advma' ? '32.086' : '12.779'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CiteScore:</span>
                    <span className="font-medium">{journalCode === 'advma' ? '58.5' : '24.3'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Downloads (2023):</span>
                    <span className="font-medium">{journalCode === 'advma' ? '2.8M' : '892K'}</span>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-white border rounded p-4">
                <h3 className="font-bold text-gray-900 mb-3">Quick Links</h3>
                <div className="space-y-2 text-sm">
                  <a href="#" className="block text-blue-600 hover:underline">Author Guidelines</a>
                  <a href="#" className="block text-blue-600 hover:underline">Submission Site</a>
                  <a href="#" className="block text-blue-600 hover:underline">Editorial Board</a>
                  <a href="#" className="block text-blue-600 hover:underline">Special Issues</a>
                  <a href="#" className="block text-blue-600 hover:underline">Contact Us</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-8 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-6">
          <div>
            <h4 className="font-bold mb-3">About</h4>
            <div className="space-y-2 text-sm">
              <a href="#" className="block hover:text-gray-300">University Publications</a>
              <a href="#" className="block hover:text-gray-300">Terms and Conditions</a>
              <a href="#" className="block hover:text-gray-300">Privacy</a>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-3">Collections</h4>
            <div className="space-y-2 text-sm">
              <a href="#" className="block hover:text-gray-300">Browse Journals</a>
              <a href="#" className="block hover:text-gray-300">Authors</a>
              <a href="#" className="block hover:text-gray-300">Librarians</a>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-3">Information</h4>
            <div className="space-y-2 text-sm">
              <a href="#" className="block hover:text-gray-300">Help / FAQs</a>
              <a href="#" className="block hover:text-gray-300">Contact us</a>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-3">Follow us on Social</h4>
            <div className="space-y-2 text-sm">
              <a href="#" className="block hover:text-gray-300">📘 Facebook</a>
              <a href="#" className="block hover:text-gray-300">🐦 X (formerly twitter)</a>
              <a href="#" className="block hover:text-gray-300">💼 LinkedIn</a>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-gray-700 text-center text-sm text-gray-400">
          © 2025 Atypon UX Design Studio • Privacy Policy • Terms of Use • Wiley <span className="text-blue-400">Online Library</span>
        </div>
      </div>
    </div>
  )
}

function MockAboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto py-12 px-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">About University Publications</h1>
        <div className="prose max-w-none">
          <p className="text-lg text-gray-600 mb-6">
            University Publications is a leading platform for academic research and scholarly communication
            in computing, technology, and related fields.
          </p>
        </div>
      </div>
    </div>
  )
}

function MockSearchPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto py-12 px-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Search Results</h1>
        <div className="space-y-6">
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold text-blue-600 mb-2">Perovskite Solar Cells: Advanced Tandem Architectures for Enhanced Efficiency</h3>
            <p className="text-gray-600 text-sm">Published in Advanced Materials - Volume 35, Issue 48</p>
          </div>
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold text-blue-600 mb-2">CRISPR-Cas9 Mediated Gene Editing in Human Embryonic Stem Cells</h3>
            <p className="text-gray-600 text-sm">Published in The EMBO Journal - Volume 42, Issue 24</p>
          </div>
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold text-blue-600 mb-2">Machine Learning-Guided Discovery of 2D Materials for Energy Storage</h3>
            <p className="text-gray-600 text-sm">Published in Advanced Materials - Volume 35, Issue 47</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main Mock Live Site Component
interface MockLiveSiteProps {
  mockLiveSiteRoute: MockLiveSiteRoute
  setMockLiveSiteRoute: (route: MockLiveSiteRoute) => void
  setCurrentView: (view: 'page-builder' | 'design-console' | 'mock-live-site') => void
  setEditingContext: (context: EditingContext) => void
  usePageStore: any // Store hook passed from parent
}

export function MockLiveSite({
  mockLiveSiteRoute,
  setMockLiveSiteRoute,
  setCurrentView,
  setEditingContext,
  usePageStore
}: MockLiveSiteProps) {
  
  debugLog('log', '🚀 MockLiveSite RENDER START:', { mockLiveSiteRoute })
  
  // Get canvas data from store (MUST BE FIRST - needed by other hooks)
  const canvasItems = usePageStore((state: any) => state.canvasItems) as CanvasItem[]
  const globalTemplateCanvas = usePageStore((state: any) => state.globalTemplateCanvas) as CanvasItem[]
  const getJournalTemplateCanvas = usePageStore((state: any) => state.getJournalTemplateCanvas)
  const getCanvasItemsForRoute = usePageStore((state: any) => state.getCanvasItemsForRoute)
  const editingContext = usePageStore((state: any) => state.editingContext)
  const templateEditingContext = usePageStore((state: any) => state.templateEditingContext)
  const schemaObjects = usePageStore((state: any) => state.schemaObjects) || []
  const currentWebsiteId = usePageStore((state: any) => state.currentWebsiteId) || 'catalyst-demo-site'
  const journalCode = getJournalCode(mockLiveSiteRoute)
  
  debugLog('log', '📊 MockLiveSite State:', {
    route: mockLiveSiteRoute,
    canvasItemsCount: canvasItems?.length || 0,
    websiteId: currentWebsiteId,
    editingContext,
    schemaObjectsCount: schemaObjects?.length || 0
  })
  
  // Initialize branding store for breakpoints
  const { initializeWebsiteBranding, getWebsiteBranding } = useBrandingStore()
  
  useEffect(() => {
    // Ensure current website branding is initialized
    if (currentWebsiteId && !getWebsiteBranding(currentWebsiteId)) {
      initializeWebsiteBranding(currentWebsiteId)
      debugLog('log', '🎨 Initialized website branding with breakpoints for:', currentWebsiteId)
    }
  }, [currentWebsiteId, initializeWebsiteBranding, getWebsiteBranding])
  
  // State for conflict resolution dialog
  const [conflictDialog, setConflictDialog] = useState<{
    isOpen: boolean
    affectedJournals: Array<{ journalCode: string; journalName: string; route: string }>
    scope: 'global' | 'issue-type'
    pendingTemplate: CanvasItem[]
  }>({
    isOpen: false,
    affectedJournals: [],
    scope: 'global',
    pendingTemplate: []
  })
  
  // Get route-specific canvas items for TOC routes
  const routeSpecificCanvasItems = mockLiveSiteRoute.includes('/toc/') 
    ? getCanvasItemsForRoute(mockLiveSiteRoute)
    : []
    
  // Get journal-specific template canvas
  const journalTemplateCanvasItems = getJournalTemplateCanvas(journalCode)
  
  // Smart canvas hierarchy for TOC routes:
  // 1. Global template changes (if in template mode with global/issue-type scope)
  // 2. Individual route-specific edits (if exists)
  // 3. Static content (empty array)
  let effectiveCanvasItems: CanvasItem[]
  let canvasSource: string
  
  if (mockLiveSiteRoute.includes('/toc/')) {
    // TOC routes: Check hierarchy with selective global support and journal templates
    const isActiveGlobalTemplate = editingContext === 'template' && 
                                  templateEditingContext?.scope === 'global'
    const isActiveJournalTemplate = editingContext === 'template' && 
                                   templateEditingContext?.scope === 'journal' &&
                                   templateEditingContext?.journalCode === journalCode
    const isActiveIssueTypeTemplate = editingContext === 'template' && 
                                     templateEditingContext?.scope === 'issue-type'
    const isSkippedRoute = templateEditingContext?.skipRoutes?.includes(mockLiveSiteRoute)
    const isSkippedJournal = templateEditingContext?.skipJournals?.includes(journalCode)
    const shouldSkipGlobalTemplate = isSkippedRoute || isSkippedJournal
    
    // Debug skip logic
    if (templateEditingContext?.scope === 'global') {
      debugLog('log', '🚫 Skip check for', mockLiveSiteRoute, '(journal:', journalCode, '):', {
        skipRoutes: templateEditingContext?.skipRoutes,
        skipJournals: templateEditingContext?.skipJournals,
        isSkippedRoute,
        isSkippedJournal,
        shouldSkipGlobalTemplate
      })
    }
    
    // 🎯 4-LEVEL TEMPLATE HIERARCHY (most specific to most general):
    // 1. Individual Issue (routeSpecificCanvasItems)
    // 2. Journal Template (journalTemplateCanvasItems)
    // 3. Base Template / Global (globalTemplateCanvas)
    // 4. Static Content (default)
    
    if (routeSpecificCanvasItems.length > 0) {
      // LEVEL 1: Individual issue-specific edits (highest priority)
      effectiveCanvasItems = routeSpecificCanvasItems
      canvasSource = `Individual issue edits (${routeSpecificCanvasItems.length} items)`
    } else if (journalTemplateCanvasItems.length > 0) {
      // LEVEL 2: Journal-specific template (affects all issues in this journal)
      effectiveCanvasItems = journalTemplateCanvasItems
      canvasSource = `Journal template for ${journalCode} (${journalTemplateCanvasItems.length} items)`
    } else if (isActiveGlobalTemplate && canvasItems.length > 0) {
      // LEVEL 3: Currently editing base template
      if (shouldSkipGlobalTemplate) {
        // This journal is exempted - fallback to static
        effectiveCanvasItems = []
        canvasSource = `Exempted journal - static content`
      } else {
        effectiveCanvasItems = canvasItems
        canvasSource = `Active base template (${canvasItems.length} items)`
      }
    } else if (globalTemplateCanvas.length > 0 && !shouldSkipGlobalTemplate) {
      // LEVEL 3: Saved base template (affects all journals)
      effectiveCanvasItems = globalTemplateCanvas
      canvasSource = `Base template (${globalTemplateCanvas.length} items)`
    } else if (isActiveJournalTemplate && canvasItems.length > 0) {
      // LEVEL 2: Currently editing journal template
      effectiveCanvasItems = canvasItems
      canvasSource = `Active journal template (${canvasItems.length} items)`
    } else if (isActiveIssueTypeTemplate && canvasItems.length > 0) {
      // Currently editing issue-type template (not yet fully implemented)
      effectiveCanvasItems = canvasItems
      canvasSource = `Active issue-type template (${canvasItems.length} items)`
    } else {
      // LEVEL 4: Static content (default from theme)
      effectiveCanvasItems = []
      canvasSource = `Static content (0 items)`
    }
  } else {
    // Non-TOC routes: use global canvas
    effectiveCanvasItems = canvasItems
    canvasSource = `Global canvas (${canvasItems.length} items)`
  }
  
  debugLog('log', `📊 Canvas Selection for ${mockLiveSiteRoute}:`, {
    editingContext,
    templateScope: templateEditingContext?.scope,
    journalCode,
    isSkippedRoute: templateEditingContext?.skipRoutes?.includes(mockLiveSiteRoute),
    routeSpecificEdits: routeSpecificCanvasItems.length,
    globalCanvas: canvasItems.length,
    globalTemplateCanvas: globalTemplateCanvas.length,
    journalTemplateCanvas: journalTemplateCanvasItems.length,
    effectiveCanvas: effectiveCanvasItems.length,
    decision: canvasSource
  })
  
  // Handle conflict resolution dialog actions
  const handleConflictResolution = (action: 'override' | 'skip' | 'cancel') => {
    const { addNotification, setTemplateEditingContext, replaceCanvasItems, setGlobalTemplateCanvas } = usePageStore.getState()
    const { affectedJournals, pendingTemplate } = conflictDialog
    
    if (action === 'cancel') {
      // Close dialog and don't proceed with template editing
      setConflictDialog(prev => ({ ...prev, isOpen: false }))
      return
    }

    if (action === 'override') {
      // User chose to override - clear both individual and journal template modifications
      const { clearCanvasItemsForRoute, setJournalTemplateCanvas } = usePageStore.getState()
      
      affectedJournals.forEach(journal => {
        // Clear individual issue modifications
        clearCanvasItemsForRoute(journal.route)
        // Clear journal template modifications
        setJournalTemplateCanvas(journal.journalCode, [])
      })
      
      addNotification({
        type: 'warning',
        title: 'Modifications Cleared',
        message: `Cleared journal templates and individual edits for ${affectedJournals.map(j => j.journalName).join(', ')} to apply global template everywhere.`
      })
      
      // Set normal global context (applies everywhere)
      const globalContext = {
        scope: 'global' as const,
        templateId: 'toc-global',
        affectedIssues: ['all-journals', 'all-issues']
      }
      
      debugLog('log', '🔧 Setting override global template context:', globalContext)
      if (setTemplateEditingContext) {
        setTemplateEditingContext(globalContext)
      }
      
    } else if (action === 'skip') {
      // User chose selective application - proceed but skip conflicted routes
      addNotification({
        type: 'info',
        title: 'Selective Template Application',
        message: `Global changes will apply to other journals. ${affectedJournals.map(j => j.journalName).join(', ')} will keep their existing templates and modifications.`
      })
      
      // Set selective global context
      const globalContext = {
        scope: 'global' as const,
        templateId: 'toc-global',
        affectedIssues: ['all-journals', 'all-issues'],
        skipRoutes: affectedJournals.map(j => j.route), // Track which routes to skip
        skipJournals: affectedJournals.map(j => j.journalCode) // Track which journals to skip
      }
      
      debugLog('log', '🔧 Setting selective global template context (SKIP mode):', globalContext)
      debugLog('log', '🚫 Journals to skip:', globalContext.skipJournals)
      debugLog('log', '🚫 Routes to skip:', globalContext.skipRoutes)
      if (setTemplateEditingContext) {
        setTemplateEditingContext(globalContext)
      }
    }

    // Load template content for editing and proceed
    replaceCanvasItems(pendingTemplate)
    setGlobalTemplateCanvas(pendingTemplate)
    setEditingContext('template')
    setCurrentView('page-builder')
    
    // Close dialog
    setConflictDialog(prev => ({ ...prev, isOpen: false }))
    
    addNotification({
      type: 'success',
      title: 'Template Editing Started',
      message: 'Global template loaded. Changes will propagate according to your selection.'
    })
  }

  const handleScopeEdit = (scope: EditingScope, issueType?: IssueType, journalCode?: string) => {
    // Map scope to existing editing context
    const contextMap: Record<EditingScope, EditingContext> = {
      'global': 'template',
      'issue-type': 'template', 
      'journal': 'template',
      'individual': 'page'
    }
    
    // Extract volume info from current route for display
    const issueTypeMatch = mockLiveSiteRoute.match(/\/toc\/[^\/]+\/([^\/]+)/)
    const issueTypeRaw = issueTypeMatch?.[1] || 'current'
    const volumeIssueMatch = issueTypeRaw.match(/vol-(\d+)-issue-(\d+)/)
    const volumeInfo = volumeIssueMatch 
      ? `vol ${volumeIssueMatch[1]}, issue ${volumeIssueMatch[2]}`
      : null
    
    debugLog('log', `🎯 Edit Scope Selected:`, {
      scope,
      issueType,
      journalCode,
      route: mockLiveSiteRoute,
      context: contextMap[scope]
    })
    
    const { replaceCanvasItems, addNotification, setTemplateEditingContext, getCanvasItemsForRoute } = usePageStore.getState()
    const journalName = journalCode === 'advma' ? 'Advanced Materials' : 'EMBO Journal'
    
    // Handle different editing scopes
    if (scope === 'individual' && mockLiveSiteRoute === '/') {
      // Homepage Individual Editing: Navigate back to page builder
      debugLog('log', `🏠 Loading homepage for editing`)
      
      setEditingContext('page')
      setCurrentView('page-builder')
      
      addNotification({
        type: 'success',
        title: 'Homepage Editor Loaded!',
        message: `Edit your homepage content and layout. Changes will be visible immediately.`
      })
      
    } else if (scope === 'individual' && journalCode) {
      // Individual Issue Editing: Load from route-specific storage or template
      const existingRouteCanvas = getCanvasItemsForRoute(mockLiveSiteRoute)
      let sectionsToLoad: CanvasItem[]
      
      if (existingRouteCanvas.length > 0) {
        // Load existing edits for this route
        sectionsToLoad = existingRouteCanvas
        debugLog('log', `📝 Loading existing edits for route:`, mockLiveSiteRoute, sectionsToLoad.length, 'sections')
      } else {
        // Load fresh template for this route
        sectionsToLoad = createTOCTemplate(journalCode)
        debugLog('log', `📝 Loading fresh template for route:`, mockLiveSiteRoute, sectionsToLoad.length, 'sections')
        
        // Don't save to route-specific storage immediately - let auto-save handle actual changes
      }
      
      // Load content into main canvas for editing
      replaceCanvasItems(sectionsToLoad)
      
      // Show user what happened
      const issueLabel = issueType === 'current' 
        ? 'Current Issue' 
        : volumeInfo || 'this Issue'
      
      setEditingContext('page')
      setCurrentView('page-builder')
      
      const hasExistingEdits = existingRouteCanvas.length > 0
      addNotification({
        type: 'success',
        title: hasExistingEdits ? 'Edits Restored!' : 'Template Inherited!',
        message: hasExistingEdits 
          ? `${issueLabel} loaded with your previous edits.`
          : `${issueLabel} loaded with ${journalName} template. Customize as needed.`
      })
      
    } else if (scope === 'journal' && journalCode) {
      // Journal Template Editing - Load existing journal template or create from base
      const { getJournalTemplateCanvas } = usePageStore.getState()
      const baseTemplate = createTOCTemplate(journalCode)
      const existingJournalTemplate = getJournalTemplateCanvas(journalCode)
      
      let templateToEdit: CanvasItem[]
      let notificationMessage: string
      
      if (existingJournalTemplate.length > 0) {
        // Load existing saved journal template
        templateToEdit = existingJournalTemplate
        debugLog('log', `🎨 Loading existing journal template:`, journalCode, templateToEdit.length, 'sections')
        
        notificationMessage = `Editing ${journalName} template. Changes apply to all ${journalName} issues.`
      } else {
        // No journal template yet, check if there are individual edits to inherit
        const currentRouteEdits = getCanvasItemsForRoute(mockLiveSiteRoute)
        
        if (currentRouteEdits.length > 0) {
          // Start with existing individual edits as the base for template editing
          templateToEdit = currentRouteEdits
          debugLog('log', `🎨 Creating journal template from individual modifications:`, journalCode, templateToEdit.length, 'sections from', mockLiveSiteRoute)
          
          notificationMessage = `Creating ${journalName} template from your current issue. Changes will apply to all ${journalName} issues.`
        } else {
          // No edits, start with fresh base template
          templateToEdit = baseTemplate
          debugLog('log', `🎨 Creating fresh journal template:`, journalCode, templateToEdit.length, 'sections')
          
          notificationMessage = `Creating ${journalName} template. Changes will apply to all ${journalName} issues.`
        }
      }
      
      // Load template content for editing
      replaceCanvasItems(templateToEdit)
      
      // Set template editing context for propagation
      if (setTemplateEditingContext) {
        setTemplateEditingContext({
          scope: 'journal',
          journalCode,
          templateId: `toc-${journalCode}`,
          affectedIssues: ['current', 'archive'] // All issues for this journal
        })
      }
      
      setEditingContext('template')
      setCurrentView('page-builder')
      
      addNotification({
        type: 'info',
        title: 'Template Editing Mode',
        message: notificationMessage
      })
      
    } else if (scope === 'issue-type' && issueType) {
      // Issue Type Template Editing (e.g., all current issues)
      const templateSections = createTOCTemplate(journalCode || 'advma')
      
      debugLog('log', `🌐 Loading issue type template for editing:`, issueType, templateSections.length, 'sections')
      
      replaceCanvasItems(templateSections)
      
      if (setTemplateEditingContext) {
        setTemplateEditingContext({
          scope: 'issue-type',
          issueType,
          templateId: `toc-${issueType}`,
          affectedIssues: ['all-journals'] // All journals, specific issue type
        })
      }
      
      setEditingContext('template')
      setCurrentView('page-builder')
      
      const issueTypeLabel = issueType === 'current' ? 'Current Issues' : 'Issues'
      addNotification({
        type: 'info', 
        title: 'Issue Type Template',
        message: `Editing template for all ${issueTypeLabel} across journals. Changes propagate globally.`
      })
      
    } else if (scope === 'global') {
      // Global Template Editing with Conflict Detection
      const templateSections = createTOCTemplate('advma') // Use base template
      
      // Check for existing modifications that would be overridden
      const storeState = usePageStore.getState()
      
      // Check 1: Individual issue modifications (routeCanvasItems)
      const routesWithActualModifications = Object.keys(storeState.routeCanvasItems || {})
        .filter(route => {
          if (!route.includes('/toc/')) return false
          
          // Compare route-specific canvas with base template to detect actual changes
          const routeCanvas = storeState.routeCanvasItems[route]
          const journalCodeFromRoute = route.match(/\/toc\/([^\/]+)/)?.[1]
          const baseTemplate = createTOCTemplate(journalCodeFromRoute || 'advma')
          
          // Check if there are meaningful differences (not just ID differences)
          const hasActualChanges = routeCanvas.length !== baseTemplate.length ||
            routeCanvas.some((item: CanvasItem, index: number) => {
              const baseItem = baseTemplate[index]
              if (!baseItem) return true
              
              // Compare meaningful properties (ignore IDs)
              const itemName = 'name' in item ? item.name : undefined
              const baseItemName = 'name' in baseItem ? baseItem.name : undefined
              return itemName !== baseItemName ||
                     item.type !== baseItem.type ||
                     ('layout' in item ? item.layout : undefined) !== ('layout' in baseItem ? baseItem.layout : undefined) ||
                     JSON.stringify('background' in item ? item.background : undefined) !== JSON.stringify('background' in baseItem ? baseItem.background : undefined) ||
                     JSON.stringify('styling' in item ? item.styling : undefined) !== JSON.stringify('styling' in baseItem ? baseItem.styling : undefined) ||
                     (('areas' in item ? item.areas : undefined) && ('areas' in baseItem ? baseItem.areas : undefined) && 
                      (item as any).areas.length !== (baseItem as any).areas.length)
            })
          
          debugLog('log', `🔍 Checking individual route ${route}:`, {
            routeCanvasLength: routeCanvas.length,
            baseTemplateLength: baseTemplate.length,
            hasActualChanges
          })
          
          return hasActualChanges
        })

      // Check 2: Journal template modifications (journalTemplateCanvas)
      const journalsWithTemplateModifications: string[] = []
      const journalCodes = ['advma', 'embo'] // Known journal codes
      
      journalCodes.forEach(code => {
        const journalTemplate = storeState.getJournalTemplateCanvas(code)
        if (journalTemplate && journalTemplate.length > 0) {
          const baseTemplate = createTOCTemplate(code)
          
          // Check if journal template differs from base template
          const hasJournalChanges = journalTemplate.length !== baseTemplate.length ||
            journalTemplate.some((item: CanvasItem, index: number) => {
              const baseItem = baseTemplate[index]
              if (!baseItem) return true
              
              // Compare meaningful properties (ignore IDs)
              const itemName = 'name' in item ? item.name : undefined
              const baseItemName = 'name' in baseItem ? baseItem.name : undefined
              return itemName !== baseItemName ||
                     item.type !== baseItem.type ||
                     ('layout' in item ? item.layout : undefined) !== ('layout' in baseItem ? baseItem.layout : undefined) ||
                     JSON.stringify('background' in item ? item.background : undefined) !== JSON.stringify('background' in baseItem ? baseItem.background : undefined) ||
                     JSON.stringify('styling' in item ? item.styling : undefined) !== JSON.stringify('styling' in baseItem ? baseItem.styling : undefined) ||
                     (('areas' in item ? item.areas : undefined) && ('areas' in baseItem ? baseItem.areas : undefined) && 
                      (item as any).areas.length !== (baseItem as any).areas.length)
            })
          
          debugLog('log', `🔍 Checking journal template ${code}:`, {
            journalTemplateLength: journalTemplate.length,
            baseTemplateLength: baseTemplate.length,
            hasJournalChanges
          })
          
          if (hasJournalChanges) {
            journalsWithTemplateModifications.push(code)
          }
        }
      })
      
      // Combine both types of modifications  
      const allAffectedJournals = [
        ...routesWithActualModifications.map(route => route.match(/\/toc\/([^\/]+)/)?.[1]).filter((code): code is string => Boolean(code)),
        ...journalsWithTemplateModifications
      ]
      
      // Remove duplicates
      const uniqueAffectedJournals = [...new Set(allAffectedJournals)]
      
      debugLog('log', '🔍 Global template conflict check:', {
        allRoutes: Object.keys(storeState.routeCanvasItems || {}),
        routesWithActualModifications,
        journalsWithTemplateModifications,
        uniqueAffectedJournals,
        scope
      })
      
      if (uniqueAffectedJournals.length > 0) {
        // Show conflict resolution dialog
        const affectedJournals = uniqueAffectedJournals.map((journalCode: string) => {
          return {
            journalCode: journalCode,
            journalName: journalCode === 'advma' ? 'Advanced Materials' : 'EMBO Journal',
            route: `/toc/${journalCode}` // Generic route for journal
          }
        })
        
        setConflictDialog({
          isOpen: true,
          affectedJournals,
          scope: 'global',
          pendingTemplate: templateSections
        })
        
        // Exit early - dialog will handle the resolution
        return
      } else {
        // No conflicts - set normal global context
        const globalContext = {
          scope: 'global' as const,
          templateId: 'toc-global',
          affectedIssues: ['all-journals', 'all-issues']
        }
        
        debugLog('log', '🔧 Setting normal global template context:', globalContext)
        if (setTemplateEditingContext) {
          setTemplateEditingContext(globalContext)
        }
      }
      
      debugLog('log', `🌍 Loading global template for editing:`, templateSections.length, 'sections')
      
      replaceCanvasItems(templateSections)
      
      debugLog('log', '🔧 Setting editing context to template')
      setEditingContext('template')
      
      debugLog('log', '🔧 Setting view to page-builder')
      setCurrentView('page-builder')
      
      // Verify state after setting
      setTimeout(() => {
        const currentState = usePageStore.getState()
        debugLog('log', '🔍 State after global template setup:', {
          editingContext: currentState.editingContext,
          templateEditingContext: currentState.templateEditingContext,
          currentView: currentState.currentView
        })
      }, 100)
      
      addNotification({
        type: 'warning',
        title: 'Global Template Editing',
        message: 'Changes will affect ALL issues across ALL journals. Individual modifications have been handled per your choice.'
      })
    }
  }


  const renderPage = () => {
    debugLog('log', '🎬 renderPage called:', {
      route: mockLiveSiteRoute,
      effectiveCanvasItemsCount: effectiveCanvasItems?.length || 0
    })
    
    switch (mockLiveSiteRoute) {
      case '/':
        debugLog('log', '🏠 Rendering MockHomepage with', effectiveCanvasItems?.length || 0, 'items')
        return <MockHomepage canvasItems={effectiveCanvasItems} schemaObjects={schemaObjects} websiteId={currentWebsiteId} />
      case '/toc/advma/current':
        return <MockJournalTOC journalCode="advma" setMockLiveSiteRoute={setMockLiveSiteRoute} canvasItems={effectiveCanvasItems} schemaObjects={schemaObjects} editingContext={usePageStore.getState().editingContext} currentRoute={mockLiveSiteRoute} websiteId={currentWebsiteId} />
      case '/toc/embo/current':
        return <MockJournalTOC journalCode="embo" setMockLiveSiteRoute={setMockLiveSiteRoute} canvasItems={effectiveCanvasItems} schemaObjects={schemaObjects} editingContext={usePageStore.getState().editingContext} currentRoute={mockLiveSiteRoute} websiteId={currentWebsiteId} />
      case '/toc/advma/vol-35-issue-47':
        return <MockJournalTOC journalCode="advma" setMockLiveSiteRoute={setMockLiveSiteRoute} canvasItems={effectiveCanvasItems} schemaObjects={schemaObjects} editingContext={usePageStore.getState().editingContext} currentRoute={mockLiveSiteRoute} websiteId={currentWebsiteId} />
      case '/toc/embo/vol-35-issue-47':
        return <MockJournalTOC journalCode="embo" setMockLiveSiteRoute={setMockLiveSiteRoute} canvasItems={effectiveCanvasItems} schemaObjects={schemaObjects} editingContext={usePageStore.getState().editingContext} currentRoute={mockLiveSiteRoute} websiteId={currentWebsiteId} />
      case '/article/advma/67/12/p45':
        return <MockArticlePage />
      case '/journal/advma':
        return <MockJournalHomepage journalCode="advma" setMockLiveSiteRoute={setMockLiveSiteRoute} />
      case '/journal/embo':
        return <MockJournalHomepage journalCode="embo" setMockLiveSiteRoute={setMockLiveSiteRoute} />
      case '/about':
        return <MockAboutPage />
      case '/search':
        return <MockSearchPage />
      default:
        return <MockHomepage canvasItems={canvasItems} schemaObjects={schemaObjects} websiteId={currentWebsiteId} />
    }
  }

  return (
    <CanvasThemeProvider usePageStore={usePageStore}>
      <>
        <div className={`min-h-screen bg-white${journalCode !== 'default' ? ` journal-${journalCode}` : ''}`}>
        {/* Mock Live Site Navigation */}
        <div className="bg-gray-900 text-white px-6 py-3">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div className="flex items-center space-x-6">
              <div className="text-lg font-bold">Mock Live Site</div>
              <nav className="flex space-x-4 text-sm">
                <button
                  onClick={() => setMockLiveSiteRoute('/')}
                  className={`hover:text-blue-300 ${mockLiveSiteRoute === '/' ? 'text-blue-300' : ''}`}
                >
                  Home
                </button>
                <button
                  onClick={() => setMockLiveSiteRoute('/journal/advma')}
                  className={`hover:text-blue-300 ${mockLiveSiteRoute === '/journal/advma' ? 'text-blue-300' : ''}`}
                >
                  Advanced Materials
                </button>
                <button
                  onClick={() => setMockLiveSiteRoute('/journal/embo')}
                  className={`hover:text-blue-300 ${mockLiveSiteRoute === '/journal/embo' ? 'text-blue-300' : ''}`}
                >
                  EMBO Journal
                </button>
                <button
                  onClick={() => setMockLiveSiteRoute('/about')}
                  className={`hover:text-blue-300 ${mockLiveSiteRoute === '/about' ? 'text-blue-300' : ''}`}
                >
                  About
                </button>
              </nav>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <select
                value={mockLiveSiteRoute}
                onChange={(e) => setMockLiveSiteRoute(e.target.value as MockLiveSiteRoute)}
                className="px-3 py-1 bg-gray-800 text-white rounded border border-gray-700 hover:border-gray-600 cursor-pointer"
              >
                <optgroup label="Website Pages">
                  <option value="/">Homepage</option>
                  <option value="/about">About</option>
                  <option value="/search">Search Results</option>
                </optgroup>
                <optgroup label="Journal Pages">
                  <option value="/journal/advma">Advanced Materials - Home</option>
                  <option value="/journal/embo">EMBO Journal - Home</option>
                </optgroup>
                <optgroup label="Table of Contents">
                  <option value="/toc/advma/current">ADVMA - Current Issue</option>
                  <option value="/toc/embo/current">EMBO - Current Issue</option>
                  <option value="/toc/advma/vol-35-issue-47">ADVMA - Vol 35 Issue 47</option>
                  <option value="/toc/embo/vol-35-issue-47">EMBO - Vol 35 Issue 47</option>
                </optgroup>
                <optgroup label="Articles">
                  <option value="/article/advma/67/12/p45">Sample Article</option>
                </optgroup>
              </select>
              <button
                onClick={() => setCurrentView('design-console')}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Back to Console
              </button>
            </div>
          </div>
        </div>

        {/* Page Content */}
        {renderPage()}
      </div>

      {/* Smart Editing Scope Button - OUTSIDE main container */}
      <div 
        className="fixed bottom-6 right-6"
        style={{ zIndex: 999998, position: 'fixed' }}
      >
        <TemplateEditingScopeButton 
          mockLiveSiteRoute={mockLiveSiteRoute}
          onEdit={handleScopeEdit}
        />
      </div>

        {/* Conflict Resolution Dialog */}
        <ConflictResolutionDialog
          isOpen={conflictDialog.isOpen}
          affectedJournals={conflictDialog.affectedJournals}
          scope={conflictDialog.scope}
          onResolve={handleConflictResolution}
        />
      </>
    </CanvasThemeProvider>
  )
}

export default MockLiveSite
