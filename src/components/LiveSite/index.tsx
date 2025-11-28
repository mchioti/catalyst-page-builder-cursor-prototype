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
import { createCatalystHomepage } from '../PageBuilder/catalystHomepage'
import { createHomepageTemplate } from '../PageBuilder/homepageTemplate'
import { mockWebsites } from '../../v2/data/mockWebsites'
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
  const websites = useWebsiteStore(state => state.websites)
  const website = websites.find(w => w.id === websiteId)
  
  // Check for stored canvas data from the Page Builder
  const pageCanvas = usePageStore(state => state.getPageCanvas(websiteId, 'home'))
  const setPageCanvas = usePageStore(state => state.setPageCanvas)
  
  // Auto-initialize canvas data if not present (so Live Site always shows canvas content)
  useEffect(() => {
    if (!pageCanvas || pageCanvas.length === 0) {
      // Initialize with V1 homepage template
      if (websiteId === 'catalyst-demo') {
        setPageCanvas(websiteId, 'home', createCatalystHomepage())
      } else {
        setPageCanvas(websiteId, 'home', createHomepageTemplate())
      }
    }
  }, [websiteId, pageCanvas, setPageCanvas])
  
  // If we have stored canvas data, render it
  if (pageCanvas && pageCanvas.length > 0) {
    return <CanvasRenderer items={pageCanvas} websiteId={websiteId} />
  }
  
  // Loading state while initializing
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-gray-500">Loading homepage...</div>
    </div>
  )
}

// Keep the old V2 JSX homepage as a reference (not used, but preserved)
function HomePage_V2_Reference() {
  const websiteId = useWebsiteId()
  const websites = useWebsiteStore(state => state.websites)
  const website = websites.find(w => w.id === websiteId)
  const journals = website?.journals || []
  
  return (
    <div>
      {/* Hero Section */}
      <section 
        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20 px-6"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">{website?.name}</h1>
          <p className="text-xl text-indigo-100 mb-8">
            Discover groundbreaking research across {journals.length} peer-reviewed journals
          </p>
          <div className="flex justify-center gap-4">
            <Link 
              to={`/live/${websiteId}/journals`}
              className="px-6 py-3 bg-white text-indigo-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Browse Journals
            </Link>
            <Link 
              to={`/live/${websiteId}/search`}
              className="px-6 py-3 border-2 border-white text-white rounded-lg font-medium hover:bg-white/10 transition-colors"
            >
              Search Articles
            </Link>
          </div>
        </div>
      </section>
      
      {/* Featured Journals */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Featured Journals</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {journals.map(journal => (
              <JournalCard key={journal.id} journal={journal} />
            ))}
          </div>
        </div>
      </section>
      
      {/* Latest Articles */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Latest Articles</h2>
          <LatestArticlesList />
        </div>
      </section>
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
  
  if (!journal) {
    return <NotFoundPage message={`Journal "${journalId}" not found`} />
  }
  
  const currentIssue = getCurrentIssue(journalId!)
  const issues = getIssuesByJournal(journalId!)
  const latestArticles = currentIssue ? getArticlesForIssue(currentIssue.id).slice(0, 5) : []
  
  return (
    <div>
      {/* Journal Banner */}
      <JournalBanner journal={journal} variant="full" />
      
      {/* Journal Navigation */}
      <JournalNav journalId={journalId!} />
      
      {/* Main Content */}
      <div className="py-12 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {/* About Journal */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About {journal.name}</h2>
              <p className="text-gray-600 mb-4">{journal.description}</p>
              {journal.isOpenAccess && (
                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                  🔓 Open Access
                </span>
              )}
              {journal.isDiscontinued && (
                <span className="inline-block ml-2 px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-full">
                  📚 Archived (Discontinued {journal.discontinuedDate?.getFullYear()})
                </span>
              )}
            </section>
            
            {/* Latest Articles */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Latest Articles</h2>
                {currentIssue && (
                  <Link 
                    to={`/live/journal/${journalId}/toc/${currentIssue.volume}/${currentIssue.issue}`}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View Current Issue →
                  </Link>
                )}
              </div>
              
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
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Current Issue */}
            {currentIssue && (
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="font-bold text-gray-900 mb-4">Current Issue</h3>
                <Link to={`/live/journal/${journalId}/toc/${currentIssue.volume}/${currentIssue.issue}`}>
                  {currentIssue.coverImageUrl && (
                    <img 
                      src={currentIssue.coverImageUrl} 
                      alt={`${formatVolumeIssue(currentIssue)} cover`}
                      className="w-full h-48 object-cover rounded-lg mb-3"
                    />
                  )}
                  <p className="text-center font-medium text-gray-900">
                    {formatVolumeIssue(currentIssue)}
                  </p>
                  <p className="text-center text-sm text-gray-500">
                    {formatIssueDate(currentIssue)}
                  </p>
                </Link>
              </div>
            )}
            
            {/* Journal Metrics */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
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
                {journal.issn?.print && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">ISSN (Print)</span>
                    <span className="font-mono text-xs">{journal.issn.print}</span>
                  </div>
                )}
                {journal.issn?.online && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">ISSN (Online)</span>
                    <span className="font-mono text-xs">{journal.issn.online}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Quick Links */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-4">Quick Links</h3>
              <div className="space-y-2 text-sm">
                <Link to={`/live/journal/${journalId}/loi`} className="block text-blue-600 hover:underline">
                  All Issues
                </Link>
                <a href="#" className="block text-blue-600 hover:underline">Submit Article</a>
                <a href="#" className="block text-blue-600 hover:underline">Author Guidelines</a>
                <a href="#" className="block text-blue-600 hover:underline">Editorial Board</a>
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
  
  if (!journal) {
    return <NotFoundPage message={`Journal "${journalId}" not found`} />
  }
  
  const issues = getIssuesByJournal(journalId!)
  
  // Group issues by volume
  const issuesByVolume = issues.reduce((acc, issue) => {
    const vol = issue.volume
    if (!acc[vol]) acc[vol] = []
    acc[vol].push(issue)
    return acc
  }, {} as Record<number, Issue[]>)
  
  // Sort volumes descending (newest first)
  const sortedVolumes = Object.keys(issuesByVolume)
    .map(Number)
    .sort((a, b) => b - a)
  
  return (
    <div>
      {/* Journal Banner */}
      <JournalBanner journal={journal} variant="archive" />
      
      {/* Journal Navigation */}
      <JournalNav journalId={journalId!} activeTab="archive" />
      
      {/* Issues List */}
      <div className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">All Issues</h1>
          
          {sortedVolumes.map(volume => (
            <div key={volume} className="mb-10">
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b">
                Volume {volume} ({issuesByVolume[volume][0].year})
              </h2>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {issuesByVolume[volume]
                  .sort((a, b) => b.issue - a.issue)
                  .map(issue => (
                    <IssueCard key={issue.id} issue={issue} journalId={journalId!} />
                  ))}
              </div>
            </div>
          ))}
          
          {issues.length === 0 && (
            <p className="text-gray-500 text-center py-12">No issues available.</p>
          )}
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
  
  if (!journal) {
    return <NotFoundPage message={`Journal "${journalId}" not found`} />
  }
  
  // Handle 'current' as special case (vol is undefined when using /toc/current route)
  let issue: Issue | undefined
  if (!vol || vol === 'current') {
    issue = getCurrentIssue(journalId!)
  } else {
    issue = getIssue(journalId!, parseInt(vol!), parseInt(issueNum!))
  }
  
  if (!issue) {
    return <NotFoundPage message={`Issue not found`} />
  }
  
  const articles = getArticlesForIssue(issue.id)
  const allIssues = getIssuesByJournal(journalId!)
  
  // Find previous and next issues
  const currentIndex = allIssues.findIndex(i => i.id === issue!.id)
  const prevIssue = currentIndex > 0 ? allIssues[currentIndex - 1] : null
  const nextIssue = currentIndex < allIssues.length - 1 ? allIssues[currentIndex + 1] : null
  
  return (
    <div>
      {/* Journal Banner */}
      <JournalBanner journal={journal} variant="issue" issue={issue} />
      
      {/* Journal Navigation */}
      <JournalNav journalId={journalId!} activeTab="toc" />
      
      {/* Issue Navigation */}
      <div className="bg-gray-100 py-3 px-6 border-b">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="text-sm">
            <span className="font-medium">{formatVolumeIssue(issue)}</span>
            <span className="text-gray-500 ml-2">• {formatIssueDate(issue)}</span>
            {issue.isCurrentIssue && (
              <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">Current</span>
            )}
            {issue.isSpecialIssue && (
              <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full">Special Issue</span>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm">
            {prevIssue && (
              <Link 
                to={`/live/journal/${journalId}/toc/${prevIssue.volume}/${prevIssue.issue}`}
                className="text-blue-600 hover:text-blue-700"
              >
                ← Previous Issue
              </Link>
            )}
            {nextIssue && (
              <Link 
                to={`/live/journal/${journalId}/toc/${nextIssue.volume}/${nextIssue.issue}`}
                className="text-blue-600 hover:text-blue-700"
              >
                Next Issue →
              </Link>
            )}
          </div>
        </div>
      </div>
      
      {/* Articles List */}
      <div className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          {issue.title && (
            <div className="mb-8 p-4 bg-purple-50 rounded-lg">
              <span className="text-sm text-purple-600 font-medium">Special Issue</span>
              <h2 className="text-xl font-bold text-gray-900">{issue.title}</h2>
            </div>
          )}
          
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Articles ({articles.length})
          </h2>
          
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
  
  if (!journal) {
    return <NotFoundPage message={`Journal "${journalId}" not found`} />
  }
  
  // Decode DOI from URL (it might be encoded)
  const decodedDoi = decodeURIComponent(doi || '')
  const article = getArticleByDOI(decodedDoi)
  const citation = getCitationByDOI(decodedDoi)
  
  if (!article) {
    return <NotFoundPage message={`Article with DOI "${decodedDoi}" not found`} />
  }
  
  return (
    <div>
      {/* Journal Banner */}
      <JournalBanner journal={journal} variant="minimal" />
      
      {/* Journal Navigation */}
      <JournalNav journalId={journalId!} />
      
      {/* Article Content */}
      <div className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Article Header */}
          <article>
            <header className="mb-8">
              {article.isOpenAccess && (
                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full mb-4">
                  🔓 Open Access
                </span>
              )}
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                {article.title}
              </h1>
              
              <div className="text-gray-600 mb-4">
                {article.authors.join(', ')}
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <span>
                  <strong>DOI:</strong>{' '}
                  <a href={`https://doi.org/${article.doi}`} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                    {article.doi}
                  </a>
                </span>
                {article.pageRange && (
                  <span><strong>Pages:</strong> {article.pageRange}</span>
                )}
                <span><strong>Published:</strong> {article.publishedAt.toLocaleDateString()}</span>
              </div>
              
              {/* Metrics */}
              <div className="flex gap-6 mt-4 text-sm">
                <span className="text-gray-600">📊 {article.citations} citations</span>
                <span className="text-gray-600">📥 {article.downloads} downloads</span>
              </div>
            </header>
            
            {/* Action Buttons */}
            <div className="flex gap-3 mb-8 pb-8 border-b">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                📄 Download PDF
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                📎 Cite
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                🔗 Share
              </button>
            </div>
            
            {/* Abstract */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Abstract</h2>
              <p className="text-gray-700 leading-relaxed">
                {article.abstract || citation?.abstract || 'Abstract not available.'}
              </p>
            </section>
            
            {/* Keywords */}
            {citation?.keywords && citation.keywords.length > 0 && (
              <section className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {citation.keywords.map((keyword, idx) => (
                    <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                      {keyword}
                    </span>
                  ))}
                </div>
              </section>
            )}
            
            {/* Full Text Note */}
            <section className="bg-blue-50 rounded-lg p-6">
              <h3 className="font-bold text-blue-900 mb-2">Full Text</h3>
              <p className="text-blue-700 text-sm">
                This is a demo page. In a real system, the full article text would be displayed here.
              </p>
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
  
  return (
    <div className="py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">About {website?.name}</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-lg text-gray-600 mb-6">
            {website?.name} is a leading platform for academic research and scholarly communication
            across multiple scientific disciplines.
          </p>
          
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Our Mission</h2>
          <p className="text-gray-600 mb-4">
            To advance scientific knowledge through rigorous peer review and open access publishing,
            making research accessible to readers worldwide.
          </p>
          
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Our Journals</h2>
          <p className="text-gray-600 mb-4">
            We publish {website?.journals?.length || 0} peer-reviewed journals covering:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Advanced Science & Technology</li>
            <li>Biology & Life Sciences</li>
            <li>Chemistry & Materials</li>
          </ul>
          
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Contact</h2>
          <p className="text-gray-600">
            For inquiries, please contact us at{' '}
            <a href="mailto:info@catalyst.demo" className="text-blue-600 hover:underline">
              info@catalyst.demo
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// SEARCH PAGE
// ============================================================================

function SearchPage() {
  // Get some sample articles for search results
  const jasArticles = getArticlesForIssue('jas-vol24-issue4')
  const oabArticles = getArticlesForIssue('oab-vol12-issue3')
  const allArticles = [...jasArticles, ...oabArticles].slice(0, 10)
  
  return (
    <div className="py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Search</h1>
        <p className="text-gray-600 mb-8">Find articles across all our journals</p>
        
        {/* Search Input */}
        <div className="mb-8">
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Search for articles, authors, keywords..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Search
            </button>
          </div>
        </div>
        
        {/* Sample Results */}
        <div className="border-t pt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Recent Articles ({allArticles.length} results)
          </h2>
          
          <div className="space-y-6">
            {allArticles.map(article => (
              <ArticleCard key={article.doi} article={article} journalId={article.journalId} showAbstract />
            ))}
          </div>
        </div>
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

function LatestArticlesList() {
  const jasArticles = getArticlesForIssue('jas-vol24-issue4')
  const oabArticles = getArticlesForIssue('oab-vol12-issue3')
  const allArticles = [...jasArticles.slice(0, 3), ...oabArticles.slice(0, 2)]
  
  return (
    <div className="space-y-6">
      {allArticles.map(article => (
        <ArticleCard key={article.doi} article={article} journalId={article.journalId} />
      ))}
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

