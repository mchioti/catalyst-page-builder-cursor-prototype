import React from 'react'
import type { EditingContext, MockLiveSiteRoute } from '../../types'

// Mock Live Site Page Components
function MockHomepage({ onEdit }: { onEdit: (context?: EditingContext) => void }) {
  return (
    <div className="min-h-screen">
      {/* University Publications Header */}
      <div className="bg-black text-white py-2 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm">
          <div className="text-gray-300">brought to you by Atypon</div>
          <div className="flex items-center space-x-4">
            <select className="bg-gray-800 text-white text-xs px-2 py-1 rounded">
              <option>ANYWHERE</option>
            </select>
            <input type="text" placeholder="Enter search phrase/DOI" className="bg-gray-800 text-white text-xs px-2 py-1 rounded w-48" />
            <button className="bg-red-600 text-white px-2 py-1 text-xs rounded">🔍</button>
            <button className="text-white text-xs">Advanced Search</button>
            <button className="text-white text-xs">🛒</button>
            <button className="text-white text-xs">Maria Chioti</button>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="bg-white border-b px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="text-2xl font-bold text-blue-600">Wiley <span className="text-blue-400">Online Library</span></div>
          <nav className="flex space-x-8 text-sm font-medium">
            <a href="#" className="text-gray-700 hover:text-blue-600">Journals</a>
            <a href="#" className="text-gray-700 hover:text-blue-600">Books</a>
            <a href="#" className="text-gray-700 hover:text-blue-600">Proceedings</a>
            <a href="#" className="text-gray-700 hover:text-blue-600">Blogs</a>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">Wiley Online Library</h1>
          <p className="text-xl text-blue-100 mb-8">
            Discover breakthrough research in computing, technology, and digital innovation. 
            Access thousands of peer-reviewed articles from leading journals and conferences.
          </p>
          <div className="flex justify-center space-x-4">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50">
              Explore Journals
            </button>
            <button className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600">
              Browse Collections
            </button>
          </div>
        </div>
      </div>

      {/* Featured Content */}
      <div className="py-16 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Featured Research</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Latest in AI & Machine Learning</h3>
              <p className="text-gray-600 mb-4">Cutting-edge research in artificial intelligence, neural networks, and computational learning theory.</p>
              <a href="#" className="text-blue-600 hover:text-blue-800 font-medium">Explore Articles →</a>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Computer Systems & Architecture</h3>
              <p className="text-gray-600 mb-4">Breakthrough discoveries in distributed systems, cloud computing, and hardware optimization.</p>
              <a href="#" className="text-blue-600 hover:text-blue-800 font-medium">Read More →</a>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Software Engineering Advances</h3>
              <p className="text-gray-600 mb-4">Revolutionary approaches to software development, testing, and quality assurance methodologies.</p>
              <a href="#" className="text-blue-600 hover:text-blue-800 font-medium">View Research →</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MockJournalTOC({ journalCode, onEdit }: { journalCode: string; onEdit: (context?: EditingContext) => void }) {
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

  return (
    <div className="min-h-screen">
      {/* University Publications Header */}
      <div className="bg-black text-white py-2 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm">
          <div className="text-gray-300">brought to you by Atypon</div>
          <div className="flex items-center space-x-4">
            <select className="bg-gray-800 text-white text-xs px-2 py-1 rounded">
              <option>ANYWHERE</option>
            </select>
            <input type="text" placeholder="Enter search phrase/DOI" className="bg-gray-800 text-white text-xs px-2 py-1 rounded w-48" />
            <button className="bg-red-600 text-white px-2 py-1 text-xs rounded">🔍</button>
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
            <button className="bg-red-600 text-white px-4 py-2 rounded font-medium">SUBSCRIBE/RENEW</button>
            <button className="bg-red-600 text-white px-4 py-2 rounded font-medium">RECOMMEND TO A LIBRARIAN</button>
            <button className="bg-red-600 text-white px-4 py-2 rounded font-medium">SUBMIT AN ARTICLE</button>
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

function MockArticlePage({ onEdit }: { onEdit: (context?: EditingContext) => void }) {
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

function MockJournalHomepage({ journalCode, onEdit }: { journalCode: string; onEdit: (context?: EditingContext) => void }) {
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
    <div className="min-h-screen">
      {/* University Publications Header */}
      <div className="bg-black text-white py-2 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm">
          <div className="text-gray-300">brought to you by Atypon</div>
          <div className="flex items-center space-x-4">
            <select className="bg-gray-800 text-white text-xs px-2 py-1 rounded">
              <option>ANYWHERE</option>
            </select>
            <input type="text" placeholder="Enter search phrase/DOI" className="bg-gray-800 text-white text-xs px-2 py-1 rounded w-48" />
            <button className="bg-red-600 text-white px-2 py-1 text-xs rounded">🔍</button>
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
            <button className="bg-red-600 text-white px-4 py-2 rounded font-medium">SUBSCRIBE/RENEW</button>
            <button className="bg-red-600 text-white px-4 py-2 rounded font-medium">RECOMMEND TO A LIBRARIAN</button>
            <button className="bg-red-600 text-white px-4 py-2 rounded font-medium">SUBMIT AN ARTICLE</button>
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
                <button className="bg-red-600 text-white px-6 py-2 rounded font-medium">Subscribe/Renew</button>
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

function MockAboutPage({ onEdit }: { onEdit: (context?: EditingContext) => void }) {
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

function MockSearchPage({ onEdit }: { onEdit: (context?: EditingContext) => void }) {
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
}

export function MockLiveSite({
  mockLiveSiteRoute,
  setMockLiveSiteRoute,
  setCurrentView,
  setEditingContext
}: MockLiveSiteProps) {
  const handleEditPage = (context: EditingContext = 'page') => {
    setEditingContext(context)
    setCurrentView('page-builder')
  }

  const getEditButtonText = () => {
    switch (mockLiveSiteRoute) {
      case '/':
        return 'Edit Homepage'
      case '/toc/advma/current':
      case '/toc/embo/current':
        return 'Edit TOC Template'
      case '/article/advma/67/12/p45':
        return 'Edit Article Template'
      case '/journal/advma':
        return 'Edit Journal Template'
      case '/about':
        return 'Edit About Page'
      case '/search':
        return 'Edit Search Template'
      default:
        return 'Edit This Page'
    }
  }

  const renderPage = () => {
    switch (mockLiveSiteRoute) {
      case '/':
        return <MockHomepage onEdit={handleEditPage} />
      case '/toc/advma/current':
        return <MockJournalTOC journalCode="advma" onEdit={handleEditPage} />
      case '/toc/embo/current':
        return <MockJournalTOC journalCode="embo" onEdit={handleEditPage} />
      case '/article/advma/67/12/p45':
        return <MockArticlePage onEdit={handleEditPage} />
      case '/journal/advma':
        return <MockJournalHomepage journalCode="advma" onEdit={handleEditPage} />
      case '/journal/embo':
        return <MockJournalHomepage journalCode="embo" onEdit={handleEditPage} />
      case '/about':
        return <MockAboutPage onEdit={handleEditPage} />
      case '/search':
        return <MockSearchPage onEdit={handleEditPage} />
      default:
        return <MockHomepage onEdit={handleEditPage} />
    }
  }

  return (
    <div className="min-h-screen bg-white">
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
            <span className="text-gray-300">{mockLiveSiteRoute}</span>
            <button
              onClick={() => setCurrentView('design-console')}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
            >
              Back to Console
            </button>
          </div>
        </div>
      </div>

      {/* Page Content */}
      {renderPage()}

      {/* Floating Admin Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3">
        <button
          onClick={() => handleEditPage('page')}
          className="px-4 py-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 text-sm font-medium whitespace-nowrap"
          title={getEditButtonText()}
        >
          {getEditButtonText()}
        </button>
        {(mockLiveSiteRoute.includes('/toc/') || mockLiveSiteRoute.includes('/journal/') || mockLiveSiteRoute.includes('/article/')) && (
          <button
            onClick={() => handleEditPage('template')}
            className="px-4 py-2 bg-orange-600 text-white rounded-full shadow-lg hover:bg-orange-700 text-sm font-medium whitespace-nowrap"
            title="Switch to Template Mode"
          >
            Template Mode
          </button>
        )}
      </div>
    </div>
  )
}

export default MockLiveSite
