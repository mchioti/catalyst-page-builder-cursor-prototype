/**
 * LiveSite - Mock live site viewer with react-router routing
 * 
 * URL Structure:
 * /live/                           → Homepage
 * /live/about                      → About page
 * /live/search                     → Search results
 * /live/journals                   → Journals browse
 * /live/journal/:journalId         → Journal home
 * /live/journal/:journalId/loi     → Issue archive (list of issues)
 * /live/journal/:journalId/toc/:vol/:issue → Issue TOC
 * /live/journal/:journalId/article/:doi    → Article page
 */

import React, { useEffect } from 'react'
import { Routes, Route, useParams, useNavigate, Link, useLocation } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import { EditingScopeButton } from './EditingScopeButton'
import { CanvasRenderer } from './CanvasRenderer'
import { useWebsiteStore } from '../../v2/stores/websiteStore'
import { usePageStore } from '../../stores'
import { mockWebsites } from '../../v2/data/mockWebsites'
import { 
  getHomepageStubForWebsite,
  createJournalsBrowseStub,
  createAboutStub,
  createSearchStub,
  createJournalHomeTemplate,
  createIssueArchiveTemplate,
  createIssueTocTemplate,
  createArticleTemplate
} from '../PageBuilder/pageStubs'
import { 
  getIssuesByJournal, 
  getIssue, 
  getCurrentIssue, 
  getArticlesForIssue,
  getArticleByDOI,
  formatVolumeIssue,
  formatIssueDate
} from '../../v2/data/mockIssues'
import { getCitationByDOI } from '../../utils/citationData'
import type { Journal, Issue, Article } from '../../v2/types/core'

// ============================================================================
// LIVE SITE LAYOUT (wraps all pages)
// ============================================================================

function LiveSiteLayout({ children, websiteId }: { children: React.ReactNode; websiteId: string }) {
  const navigate = useNavigate()
  const location = useLocation()
  const websites = useWebsiteStore(state => state.websites)
  const website = websites.find(w => w.id === websiteId)
  
  const basePath = `/live/${websiteId}`
  
  return (
    <div className="min-h-screen bg-white">
      {/* Site Navigation Bar */}
      <header className="bg-gray-900 text-white px-6 py-3 sticky top-0 z-50">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-6">
            <Link to={basePath} className="text-xl font-bold hover:text-blue-300 transition-colors">
              {website?.name || websiteId}
            </Link>
            <nav className="flex space-x-4 text-sm">
              <Link
                to={basePath}
                className={`hover:text-blue-300 ${location.pathname === basePath ? 'text-blue-300' : ''}`}
              >
                Home
              </Link>
              <Link
                to={`${basePath}/journals`}
                className={`hover:text-blue-300 ${location.pathname.includes('/journals') ? 'text-blue-300' : ''}`}
              >
                Journals
              </Link>
              <Link
                to={`${basePath}/about`}
                className={`hover:text-blue-300 ${location.pathname.includes('/about') ? 'text-blue-300' : ''}`}
              >
                About
              </Link>
              <Link
                to={`${basePath}/search`}
                className={`hover:text-blue-300 ${location.pathname.includes('/search') ? 'text-blue-300' : ''}`}
              >
                Search
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <button
              onClick={() => navigate('/v1')}
              className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Design Console
            </button>
          </div>
        </div>
      </header>
      
      {/* Page Content */}
      <main>
        {children}
      </main>
      
      {/* Floating Edit Button with Scope Options */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 items-end">
        <EditingScopeButton 
          websiteId={websiteId}
          route={location.pathname.replace(`/live/${websiteId}`, '')}
          journalName={website?.journals?.find(j => location.pathname.includes(`/journal/${j.id}`))?.name}
        />
        <div className="text-xs text-gray-500 text-center bg-white/90 px-2 py-1 rounded shadow">
          {website?.name}: {location.pathname.replace(`/live/${websiteId}`, '') || 'Homepage'}
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-6 mt-12">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-6">
          <div>
            <h4 className="font-bold mb-3">About</h4>
            <div className="space-y-2 text-sm text-gray-300">
              <Link to="/live/about" className="block hover:text-white">About Us</Link>
              <a href="#" className="block hover:text-white">Terms and Conditions</a>
              <a href="#" className="block hover:text-white">Privacy Policy</a>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-3">Journals</h4>
            <div className="space-y-2 text-sm text-gray-300">
              <Link to="/live/journals" className="block hover:text-white">Browse All Journals</Link>
              {website?.journals?.slice(0, 3).map(journal => (
                <Link key={journal.id} to={`/live/journal/${journal.id}`} className="block hover:text-white">
                  {journal.name}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-3">For Authors</h4>
            <div className="space-y-2 text-sm text-gray-300">
              <a href="#" className="block hover:text-white">Submit Article</a>
              <a href="#" className="block hover:text-white">Author Guidelines</a>
              <a href="#" className="block hover:text-white">Publication Ethics</a>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-3">Connect</h4>
            <div className="space-y-2 text-sm text-gray-300">
              <a href="#" className="block hover:text-white">📧 Contact Us</a>
              <a href="#" className="block hover:text-white">🐦 Twitter</a>
              <a href="#" className="block hover:text-white">💼 LinkedIn</a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-gray-700 text-center text-sm text-gray-400">
          © 2024 {website?.name} • Powered by Catalyst Publishing Platform
        </div>
      </footer>
    </div>
  )
}

// ============================================================================
// HOMEPAGE
// ============================================================================

function HomePage() {
  const websiteId = useWebsiteId()
  
  // Check for stored canvas data from the Page Builder
  const pageCanvas = usePageStore(state => state.getPageCanvas(websiteId, 'home'))
  const setPageCanvas = usePageStore(state => state.setPageCanvas)
  
  // Auto-initialize canvas data if not present
  useEffect(() => {
    if (!pageCanvas || pageCanvas.length === 0) {
      setPageCanvas(websiteId, 'home', getHomepageStubForWebsite(websiteId))
    }
  }, [websiteId, pageCanvas, setPageCanvas])
  
  // Render canvas content
  if (pageCanvas && pageCanvas.length > 0) {
    return <CanvasRenderer items={pageCanvas} websiteId={websiteId} />
  }
  
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-gray-500">Loading homepage...</div>
    </div>
  )
}

// ============================================================================
// JOURNALS BROWSE
// ============================================================================

function JournalsBrowsePage() {
  const websiteId = useWebsiteId()
  const websites = useWebsiteStore(state => state.websites)
  const website = websites.find(w => w.id === websiteId)
  const journals = website?.journals || []
  
  // Check for stored canvas data
  const pageCanvas = usePageStore(state => state.getPageCanvas(websiteId, 'journals'))
  const setPageCanvas = usePageStore(state => state.setPageCanvas)
  
  // Auto-initialize canvas data if not present
  useEffect(() => {
    if (!pageCanvas || pageCanvas.length === 0) {
      setPageCanvas(websiteId, 'journals', createJournalsBrowseStub())
    }
  }, [websiteId, pageCanvas, setPageCanvas])
  
  // Render canvas content if available
  if (pageCanvas && pageCanvas.length > 0) {
    return <CanvasRenderer items={pageCanvas} websiteId={websiteId} />
  }
  
  // Fallback while initializing
  return (
    <div className="py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">All Journals</h1>
        <p className="text-lg text-gray-600 mb-8">
          Explore our collection of {journals.length} peer-reviewed journals
        </p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {journals.map(journal => (
            <JournalCard key={journal.id} journal={journal} showFullDescription />
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// JOURNAL HOME
// ============================================================================

function JournalHomePage() {
  const websiteId = useWebsiteId()
  const { journalId } = useParams<{ journalId: string }>()
  const websites = useWebsiteStore(state => state.websites)
  const website = websites.find(w => w.id === websiteId)
  const journal = website?.journals?.find(j => j.id === journalId)
  
  // Page ID includes journalId for uniqueness
  const pageId = `journal-${journalId}`
  
  // Check for stored canvas data
  const pageCanvas = usePageStore(state => state.getPageCanvas(websiteId, pageId))
  const setPageCanvas = usePageStore(state => state.setPageCanvas)
  
  // Auto-initialize canvas data if not present
  useEffect(() => {
    if (!pageCanvas || pageCanvas.length === 0) {
      setPageCanvas(websiteId, pageId, createJournalHomeTemplate())
    }
  }, [websiteId, pageId, pageCanvas, setPageCanvas])
  
  if (!journal) {
    return <NotFoundPage message={`Journal "${journalId}" not found`} />
  }
  
  // Render canvas content if available
  if (pageCanvas && pageCanvas.length > 0) {
    // Create template context with journal data
    const templateContext = {
      journal: {
        id: journal.id,
        name: journal.name,
        description: journal.description || '',
        brandColor: journal.branding?.primaryColor || '#1e40af',
        brandColorLight: journal.branding?.secondaryColor || '#3b82f6'
      }
    }
    return <CanvasRenderer items={pageCanvas} websiteId={websiteId} templateContext={templateContext} />
  }
  
  // Fallback while initializing
  const currentIssue = getCurrentIssue(journalId!)
  const issues = getIssuesByJournal(journalId!)
  const latestArticles = currentIssue ? getArticlesForIssue(currentIssue.id).slice(0, 5) : []
  
  return (
    <div>
      <JournalBanner journal={journal} variant="full" />
      <JournalNav journalId={journalId!} />
      <div className="py-12 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About {journal.name}</h2>
              <p className="text-gray-600 mb-4">{journal.description}</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Latest Articles</h2>
              {latestArticles.length > 0 ? (
                <div className="space-y-6">
                  {latestArticles.map(article => (
                    <ArticleCard key={article.doi} article={article} journalId={journalId!} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No articles available.</p>
              )}
            </section>
          </div>
          <div className="lg:col-span-1">
            {currentIssue && (
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="font-bold text-gray-900 mb-4">Current Issue</h3>
                <Link to={`/live/${websiteId}/journal/${journalId}/toc/${currentIssue.volume}/${currentIssue.issue}`}>
                  <p className="text-center font-medium text-gray-900">{formatVolumeIssue(currentIssue)}</p>
                </Link>
              </div>
            )}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-4">Journal Metrics</h3>
              <div className="space-y-3 text-sm">
                {journal.impactFactor && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Impact Factor</span>
                    <span className="font-semibold">{journal.impactFactor}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Issues</span>
                  <span className="font-semibold">{issues.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// ISSUE ARCHIVE (List of Issues)
// ============================================================================

function IssueArchivePage() {
  const websiteId = useWebsiteId()
  const { journalId } = useParams<{ journalId: string }>()
  const websites = useWebsiteStore(state => state.websites)
  const website = websites.find(w => w.id === websiteId)
  const journal = website?.journals?.find(j => j.id === journalId)
  
  // Page ID includes journalId for uniqueness
  const pageId = `journal-${journalId}-loi`
  
  // Check for stored canvas data
  const pageCanvas = usePageStore(state => state.getPageCanvas(websiteId, pageId))
  const setPageCanvas = usePageStore(state => state.setPageCanvas)
  
  // Auto-initialize canvas data if not present
  useEffect(() => {
    if (!pageCanvas || pageCanvas.length === 0) {
      setPageCanvas(websiteId, pageId, createIssueArchiveTemplate())
    }
  }, [websiteId, pageId, pageCanvas, setPageCanvas])
  
  if (!journal) {
    return <NotFoundPage message={`Journal "${journalId}" not found`} />
  }
  
  const issues = getIssuesByJournal(journalId!)
  
  // Render canvas content if available
  if (pageCanvas && pageCanvas.length > 0) {
    const templateContext = {
      journal: {
        id: journal.id,
        name: journal.name,
        description: journal.description || '',
        brandColor: journal.branding?.primaryColor || '#1e40af',
        brandColorLight: journal.branding?.secondaryColor || '#3b82f6'
      }
    }
    return <CanvasRenderer items={pageCanvas} websiteId={websiteId} templateContext={templateContext} />
  }
  
  // Fallback: Group issues by volume
  const issuesByVolume = issues.reduce((acc, issue) => {
    const vol = issue.volume
    if (!acc[vol]) acc[vol] = []
    acc[vol].push(issue)
    return acc
  }, {} as Record<number, Issue[]>)
  
  const sortedVolumes = Object.keys(issuesByVolume).map(Number).sort((a, b) => b - a)
  
  return (
    <div>
      <JournalBanner journal={journal} variant="archive" />
      <JournalNav journalId={journalId!} activeTab="archive" />
      <div className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">All Issues</h1>
          {sortedVolumes.map(volume => (
            <div key={volume} className="mb-10">
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b">
                Volume {volume} ({issuesByVolume[volume][0].year})
              </h2>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {issuesByVolume[volume].sort((a, b) => b.issue - a.issue).map(issue => (
                  <IssueCard key={issue.id} issue={issue} journalId={journalId!} />
                ))}
              </div>
            </div>
          ))}
          {issues.length === 0 && <p className="text-gray-500 text-center py-12">No issues available.</p>}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// ISSUE TOC (Table of Contents)
// ============================================================================

function IssueTocPage() {
  const websiteId = useWebsiteId()
  const { journalId, vol, issue: issueNum } = useParams<{ journalId: string; vol: string; issue: string }>()
  const websites = useWebsiteStore(state => state.websites)
  const website = websites.find(w => w.id === websiteId)
  const journal = website?.journals?.find(j => j.id === journalId)
  
  // Handle 'current' as special case
  let issue: Issue | undefined
  if (!vol || vol === 'current') {
    issue = getCurrentIssue(journalId!)
  } else {
    issue = getIssue(journalId!, parseInt(vol!), parseInt(issueNum!))
  }
  
  // Page ID includes journalId and issue info
  const pageId = vol === 'current' || !vol 
    ? `journal-${journalId}-toc-current`
    : `journal-${journalId}-toc-${vol}-${issueNum}`
  
  // Check for stored canvas data
  const pageCanvas = usePageStore(state => state.getPageCanvas(websiteId, pageId))
  const setPageCanvas = usePageStore(state => state.setPageCanvas)
  
  // Auto-initialize canvas data if not present
  useEffect(() => {
    if (!pageCanvas || pageCanvas.length === 0) {
      setPageCanvas(websiteId, pageId, createIssueTocTemplate())
    }
  }, [websiteId, pageId, pageCanvas, setPageCanvas])
  
  if (!journal) {
    return <NotFoundPage message={`Journal "${journalId}" not found`} />
  }
  
  if (!issue) {
    return <NotFoundPage message={`Issue not found`} />
  }
  
  const articles = getArticlesForIssue(issue.id)
  const allIssues = getIssuesByJournal(journalId!)
  const currentIndex = allIssues.findIndex(i => i.id === issue!.id)
  const prevIssue = currentIndex > 0 ? allIssues[currentIndex - 1] : null
  const nextIssue = currentIndex < allIssues.length - 1 ? allIssues[currentIndex + 1] : null
  
  // Render canvas content if available
  if (pageCanvas && pageCanvas.length > 0) {
    const templateContext = {
      journal: {
        id: journal.id,
        name: journal.name,
        description: journal.description || '',
        brandColor: journal.branding?.primaryColor || '#1e40af',
        brandColorLight: journal.branding?.secondaryColor || '#3b82f6'
      },
      issue: {
        id: issue.id,
        name: formatVolumeIssue(issue),
        description: issue.title || `Published ${formatIssueDate(issue)}`
      }
    }
    return <CanvasRenderer items={pageCanvas} websiteId={websiteId} templateContext={templateContext} />
  }
  
  // Fallback
  return (
    <div>
      <JournalBanner journal={journal} variant="issue" issue={issue} />
      <JournalNav journalId={journalId!} activeTab="toc" />
      <div className="bg-gray-100 py-3 px-6 border-b">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="text-sm">
            <span className="font-medium">{formatVolumeIssue(issue)}</span>
            <span className="text-gray-500 ml-2">• {formatIssueDate(issue)}</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            {prevIssue && (
              <Link to={`/live/${websiteId}/journal/${journalId}/toc/${prevIssue.volume}/${prevIssue.issue}`} className="text-blue-600 hover:text-blue-700">
                ← Previous
              </Link>
            )}
            {nextIssue && (
              <Link to={`/live/${websiteId}/journal/${journalId}/toc/${nextIssue.volume}/${nextIssue.issue}`} className="text-blue-600 hover:text-blue-700">
                Next →
              </Link>
            )}
          </div>
        </div>
      </div>
      <div className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Articles ({articles.length})</h2>
          {articles.length > 0 ? (
            <div className="space-y-6">
              {articles.map(article => (
                <ArticleCard key={article.doi} article={article} journalId={journalId!} showAbstract />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-12">No articles in this issue.</p>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// ARTICLE PAGE
// ============================================================================

function ArticlePage() {
  const websiteId = useWebsiteId()
  const { journalId, doi } = useParams<{ journalId: string; doi: string }>()
  const websites = useWebsiteStore(state => state.websites)
  const website = websites.find(w => w.id === websiteId)
  const journal = website?.journals?.find(j => j.id === journalId)
  
  // Decode DOI from URL
  const decodedDoi = decodeURIComponent(doi || '')
  const article = getArticleByDOI(decodedDoi)
  const citation = getCitationByDOI(decodedDoi)
  
  // Page ID - use a sanitized version of DOI
  const pageId = `article-${decodedDoi.replace(/[/.]/g, '-')}`
  
  // Check for stored canvas data
  const pageCanvas = usePageStore(state => state.getPageCanvas(websiteId, pageId))
  const setPageCanvas = usePageStore(state => state.setPageCanvas)
  
  // Auto-initialize canvas data if not present
  useEffect(() => {
    if (!pageCanvas || pageCanvas.length === 0) {
      setPageCanvas(websiteId, pageId, createArticleTemplate())
    }
  }, [websiteId, pageId, pageCanvas, setPageCanvas])
  
  if (!journal) {
    return <NotFoundPage message={`Journal "${journalId}" not found`} />
  }
  
  if (!article) {
    return <NotFoundPage message={`Article with DOI "${decodedDoi}" not found`} />
  }
  
  // Render canvas content if available
  if (pageCanvas && pageCanvas.length > 0) {
    const templateContext = {
      journal: {
        id: journal.id,
        name: journal.name,
        brandColor: journal.branding?.primaryColor || '#1e40af'
      },
      article: {
        title: article.title,
        authors: article.authors.join(', '),
        doi: article.doi,
        abstract: article.abstract || citation?.abstract || 'Abstract not available.',
        keywords: citation?.keywords?.join(', ') || '',
        contentType: article.isOpenAccess ? 'Open Access' : 'Research Article'
      }
    }
    return <CanvasRenderer items={pageCanvas} websiteId={websiteId} templateContext={templateContext} />
  }
  
  // Fallback
  return (
    <div>
      <JournalBanner journal={journal} variant="minimal" />
      <JournalNav journalId={journalId!} />
      <div className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <article>
            <header className="mb-8">
              {article.isOpenAccess && (
                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full mb-4">
                  🔓 Open Access
                </span>
              )}
              <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">{article.title}</h1>
              <div className="text-gray-600 mb-4">{article.authors.join(', ')}</div>
              <div className="text-sm text-gray-500">
                <strong>DOI:</strong>{' '}
                <a href={`https://doi.org/${article.doi}`} className="text-blue-600 hover:underline">{article.doi}</a>
              </div>
            </header>
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Abstract</h2>
              <p className="text-gray-700 leading-relaxed">{article.abstract || citation?.abstract || 'Abstract not available.'}</p>
            </section>
          </article>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// ABOUT PAGE
// ============================================================================

function AboutPage() {
  const websiteId = useWebsiteId()
  const websites = useWebsiteStore(state => state.websites)
  const website = websites.find(w => w.id === websiteId)
  
  // Check for stored canvas data
  const pageCanvas = usePageStore(state => state.getPageCanvas(websiteId, 'about'))
  const setPageCanvas = usePageStore(state => state.setPageCanvas)
  
  // Auto-initialize canvas data if not present
  useEffect(() => {
    if (!pageCanvas || pageCanvas.length === 0) {
      setPageCanvas(websiteId, 'about', createAboutStub())
    }
  }, [websiteId, pageCanvas, setPageCanvas])
  
  // Render canvas content if available
  if (pageCanvas && pageCanvas.length > 0) {
    return <CanvasRenderer items={pageCanvas} websiteId={websiteId} />
  }
  
  // Fallback while initializing
  return (
    <div className="py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">About {website?.name}</h1>
        <p className="text-gray-500">Loading...</p>
      </div>
    </div>
  )
}

// ============================================================================
// SEARCH PAGE
// ============================================================================

function SearchPage() {
  const websiteId = useWebsiteId()
  
  // Check for stored canvas data
  const pageCanvas = usePageStore(state => state.getPageCanvas(websiteId, 'search'))
  const setPageCanvas = usePageStore(state => state.setPageCanvas)
  
  // Auto-initialize canvas data if not present
  useEffect(() => {
    if (!pageCanvas || pageCanvas.length === 0) {
      setPageCanvas(websiteId, 'search', createSearchStub())
    }
  }, [websiteId, pageCanvas, setPageCanvas])
  
  // Render canvas content if available
  if (pageCanvas && pageCanvas.length > 0) {
    return <CanvasRenderer items={pageCanvas} websiteId={websiteId} />
  }
  
  // Fallback while initializing
  return (
    <div className="py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Search</h1>
        <p className="text-gray-500">Loading...</p>
      </div>
    </div>
  )
}

// ============================================================================
// SHARED COMPONENTS
// ============================================================================

function JournalCard({ journal, showFullDescription }: { journal: Journal; showFullDescription?: boolean }) {
  const websiteId = useWebsiteId()
  const currentIssue = getCurrentIssue(journal.id)
  
  return (
    <Link 
      to={`/live/${websiteId}/journal/${journal.id}`}
      className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
    >
      {currentIssue?.coverImageUrl && (
        <img 
          src={currentIssue.coverImageUrl} 
          alt={`${journal.name} cover`}
          className="w-full h-40 object-cover"
        />
      )}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          {journal.isOpenAccess && (
            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
              Open Access
            </span>
          )}
          {journal.isDiscontinued && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
              Archived
            </span>
          )}
        </div>
        <h3 className="font-bold text-gray-900 mb-1">{journal.name}</h3>
        {journal.acronym && (
          <span className="text-sm text-gray-500">({journal.acronym})</span>
        )}
        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
          {showFullDescription ? journal.description : journal.description?.substring(0, 100) + '...'}
        </p>
        {journal.impactFactor && (
          <div className="mt-3 text-sm text-gray-500">
            Impact Factor: <span className="font-semibold text-gray-900">{journal.impactFactor}</span>
          </div>
        )}
      </div>
    </Link>
  )
}

function JournalBanner({ journal, variant, issue }: { journal: Journal; variant: 'full' | 'archive' | 'issue' | 'minimal'; issue?: Issue }) {
  const bgColor = journal.branding?.primaryColor || '#1e40af'
  
  return (
    <section 
      className="text-white py-12 px-6"
      style={{ backgroundColor: bgColor }}
    >
      <div className="max-w-4xl mx-auto">
        <h1 className={`font-bold mb-2 ${variant === 'minimal' ? 'text-xl' : 'text-4xl'}`}>
          {journal.name}
        </h1>
        
        {variant === 'full' && (
          <>
            <p className="text-white/80 mb-4">{journal.description}</p>
            <div className="text-sm text-white/70">
              {journal.issn?.print && <span>ISSN (Print): {journal.issn.print}</span>}
              {journal.issn?.online && <span className="ml-4">ISSN (Online): {journal.issn.online}</span>}
              {journal.impactFactor && <span className="ml-4">Impact Factor: {journal.impactFactor}</span>}
            </div>
          </>
        )}
        
        {variant === 'archive' && (
          <p className="text-white/80">Browse all issues of {journal.name}</p>
        )}
        
        {variant === 'issue' && issue && (
          <>
            <p className="text-white/80 text-lg mb-2">
              {formatVolumeIssue(issue)} • {formatIssueDate(issue)}
            </p>
            {issue.title && (
              <p className="text-white/70 text-sm">{issue.title}</p>
            )}
          </>
        )}
      </div>
    </section>
  )
}

function JournalNav({ journalId, activeTab }: { journalId: string; activeTab?: 'home' | 'archive' | 'toc' }) {
  const websiteId = useWebsiteId()
  const basePath = `/live/${websiteId}/journal/${journalId}`
  
  return (
    <nav className="bg-gray-800 text-white px-6">
      <div className="max-w-4xl mx-auto flex items-center gap-6 text-sm">
        <Link 
          to={basePath}
          className={`py-3 border-b-2 transition-colors ${activeTab === 'home' || !activeTab ? 'border-blue-400 text-blue-300' : 'border-transparent hover:text-blue-300'}`}
        >
          Journal Home
        </Link>
        <Link 
          to={`${basePath}/toc/current`}
          className={`py-3 border-b-2 transition-colors ${activeTab === 'toc' ? 'border-blue-400 text-blue-300' : 'border-transparent hover:text-blue-300'}`}
        >
          Current Issue
        </Link>
        <Link 
          to={`${basePath}/loi`}
          className={`py-3 border-b-2 transition-colors ${activeTab === 'archive' ? 'border-blue-400 text-blue-300' : 'border-transparent hover:text-blue-300'}`}
        >
          All Issues
        </Link>
        <a href="#" className="py-3 border-b-2 border-transparent hover:text-blue-300 transition-colors">Submit</a>
        <a href="#" className="py-3 border-b-2 border-transparent hover:text-blue-300 transition-colors">About</a>
      </div>
    </nav>
  )
}

function IssueCard({ issue, journalId }: { issue: Issue; journalId: string }) {
  const websiteId = useWebsiteId()
  return (
    <Link 
      to={`/live/${websiteId}/journal/${journalId}/toc/${issue.volume}/${issue.issue}`}
      className="block bg-white rounded-lg border hover:border-blue-300 hover:shadow-md transition-all p-4"
    >
      <div className="flex items-start gap-3">
        {issue.coverImageUrl && (
          <img 
            src={issue.coverImageUrl} 
            alt={`Issue ${issue.issue} cover`}
            className="w-16 h-20 object-cover rounded"
          />
        )}
        <div>
          <div className="font-medium text-gray-900">Issue {issue.issue}</div>
          <div className="text-sm text-gray-500">{formatIssueDate(issue)}</div>
          {issue.isCurrentIssue && (
            <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Current</span>
          )}
          {issue.isSpecialIssue && (
            <span className="inline-block mt-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">Special</span>
          )}
        </div>
      </div>
      {issue.title && (
        <p className="mt-2 text-sm text-gray-600 line-clamp-2">{issue.title}</p>
      )}
    </Link>
  )
}

function ArticleCard({ article, journalId, showAbstract }: { article: Article; journalId: string; showAbstract?: boolean }) {
  const websiteId = useWebsiteId()
  // URL-encode the DOI for use in the URL
  const encodedDoi = encodeURIComponent(article.doi)
  
  return (
    <div className="border-b pb-6">
      <div className="flex items-start gap-3">
        {article.isOpenAccess && (
          <span className="shrink-0 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
            Open Access
          </span>
        )}
        <div className="flex-1">
          <Link 
            to={`/live/${websiteId}/journal/${journalId}/article/${encodedDoi}`}
            className="text-lg font-semibold text-blue-600 hover:text-blue-800 hover:underline leading-tight"
          >
            {article.title}
          </Link>
          <p className="text-sm text-gray-600 mt-1">
            {article.authors.slice(0, 3).join(', ')}
            {article.authors.length > 3 && ` et al.`}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {article.pageRange && <span>pp. {article.pageRange} • </span>}
            <a href={`https://doi.org/${article.doi}`} className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
              {article.doi}
            </a>
          </p>
          {showAbstract && article.abstract && (
            <p className="text-sm text-gray-600 mt-3 line-clamp-3">{article.abstract}</p>
          )}
        </div>
      </div>
    </div>
  )
}

function NotFoundPage({ message }: { message: string }) {
  return (
    <div className="py-20 px-6 text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
      <p className="text-gray-600 mb-8">{message}</p>
      <Link to="/live" className="text-blue-600 hover:underline">
        Return to Homepage
      </Link>
    </div>
  )
}

// ============================================================================
// MAIN ROUTES
// ============================================================================

// Context to pass websiteId to child components
const WebsiteContext = React.createContext<string>('catalyst-demo')

// Hook to get the current websiteId
export function useWebsiteId() {
  return React.useContext(WebsiteContext)
}

// Inner routes that receive websiteId from context
function LiveSiteRoutes({ websiteId }: { websiteId: string }) {
  return (
    <WebsiteContext.Provider value={websiteId}>
      <Routes>
        <Route path="/" element={<LiveSiteLayout websiteId={websiteId}><HomePage /></LiveSiteLayout>} />
        <Route path="/home" element={<LiveSiteLayout websiteId={websiteId}><HomePage /></LiveSiteLayout>} />
        <Route path="/about" element={<LiveSiteLayout websiteId={websiteId}><AboutPage /></LiveSiteLayout>} />
        <Route path="/search" element={<LiveSiteLayout websiteId={websiteId}><SearchPage /></LiveSiteLayout>} />
        <Route path="/journals" element={<LiveSiteLayout websiteId={websiteId}><JournalsBrowsePage /></LiveSiteLayout>} />
        <Route path="/journal/:journalId" element={<LiveSiteLayout websiteId={websiteId}><JournalHomePage /></LiveSiteLayout>} />
        <Route path="/journal/:journalId/loi" element={<LiveSiteLayout websiteId={websiteId}><IssueArchivePage /></LiveSiteLayout>} />
        <Route path="/journal/:journalId/toc/:vol/:issue" element={<LiveSiteLayout websiteId={websiteId}><IssueTocPage /></LiveSiteLayout>} />
        <Route path="/journal/:journalId/toc/current" element={<LiveSiteLayout websiteId={websiteId}><IssueTocPage /></LiveSiteLayout>} />
        <Route path="/journal/:journalId/article/:doi" element={<LiveSiteLayout websiteId={websiteId}><ArticlePage /></LiveSiteLayout>} />
        <Route path="*" element={<LiveSiteLayout websiteId={websiteId}><NotFoundPage message="Page not found" /></LiveSiteLayout>} />
      </Routes>
    </WebsiteContext.Provider>
  )
}

export function LiveSite() {
  const { websiteId } = useParams<{ websiteId: string }>()
  const websites = useWebsiteStore(state => state.websites)
  const addWebsite = useWebsiteStore(state => state.addWebsite)
  const navigate = useNavigate()
  
  // Initialize the V2 store with mock data if empty
  useEffect(() => {
    if (websites.length === 0) {
      mockWebsites.forEach(website => addWebsite(website))
    }
  }, [websites.length, addWebsite])
  
  // Validate websiteId
  const resolvedWebsiteId = websiteId || 'catalyst-demo'
  const websiteExists = websites.length === 0 || websites.some(w => w.id === resolvedWebsiteId)
  
  if (!websiteExists && websites.length > 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Website Not Found</h1>
          <p className="text-gray-600 mb-4">
            The website "{resolvedWebsiteId}" does not exist.
          </p>
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Available websites:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {websites.map(w => (
                <button
                  key={w.id}
                  onClick={() => navigate(`/live/${w.id}`)}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
                >
                  {w.name}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => navigate('/v1')}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Go to Design Console
          </button>
        </div>
      </div>
    )
  }
  
  return <LiveSiteRoutes websiteId={resolvedWebsiteId} />
}

export default LiveSite

