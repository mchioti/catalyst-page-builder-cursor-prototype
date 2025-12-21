/**
 * EditingScopeButton - Editing scope selector for Live Site pages
 * 
 * Provides different editing scopes based on the current page context:
 * - Individual: Edit this specific page only
 * - Journal: Edit all pages in this journal
 * - Issue-type: Edit all issues of this type (current, archive, etc.)
 * - Global: Edit the template affecting all pages
 */

import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Globe, BookOpen, FileText, Edit3 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export type EditingScope = 'global' | 'issue-type' | 'journal' | 'individual'

export type IssueType = 'current' | 'ahead-of-print' | 'just-accepted' | 'archive'

interface EditingScopeOption {
  id: EditingScope
  label: string
  description: string
  affects: string
  icon: React.ReactNode
  isPrimary?: boolean
}

interface EditingScopeButtonProps {
  websiteId: string
  route: string // Current route path (e.g., "/journal/jas/toc/24/1")
  journalName?: string // Optional: resolved journal name
}

export function EditingScopeButton({ 
  websiteId,
  route,
  journalName 
}: EditingScopeButtonProps) {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [buttonPosition, setButtonPosition] = useState<{ top: number; left: number; width: number } | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLDivElement>(null)

  // Extract context from URL
  const getContextFromRoute = () => {
    // Match journal pages: /journal/:journalId or /journal/:journalId/...
    const journalMatch = route.match(/\/journal\/([^\/]+)/)
    const journalId = journalMatch?.[1] || null
    
    // Match TOC pages: /journal/:journalId/toc/:vol/:issue or /journal/:journalId/toc/current
    const tocMatch = route.match(/\/toc\/(\d+|current)(?:\/(\d+))?/)
    const vol = tocMatch?.[1]
    const issue = tocMatch?.[2]
    const isCurrent = vol === 'current'
    
    // Match article pages: /journal/:journalId/article/:doi
    const articleMatch = route.match(/\/article\/(.+)$/)
    const doi = articleMatch?.[1]
    
    // Match issue archive: /journal/:journalId/loi
    const isArchive = route.includes('/loi')
    
    // Determine page type
    const isHomepage = route === '' || route === '/'
    const isJournalHome = journalId && !tocMatch && !articleMatch && !isArchive
    const isIssueToc = !!tocMatch
    const isArticle = !!doi
    const isJournalsPage = route === '/journals'
    const isAboutPage = route === '/about'
    const isSearchPage = route === '/search'
    
    // Determine issue type for TOC pages
    let issueType: IssueType = 'current'
    if (isIssueToc && !isCurrent && vol && issue) {
      // If it's an old volume/issue, it's archive
      issueType = 'archive'
    }
    
    return { 
      journalId, 
      vol, 
      issue, 
      doi, 
      isCurrent,
      isHomepage, 
      isJournalHome, 
      isIssueToc, 
      isArticle, 
      isArchive,
      isJournalsPage,
      isAboutPage,
      isSearchPage,
      issueType 
    }
  }

  const ctx = getContextFromRoute()
  const displayJournalName = journalName || ctx.journalId?.toUpperCase() || 'This Journal'

  // Stub-based pages: Homepage, About, Search, Journals Browse
  // These don't use Page Templates (no inheritance), just show simple Edit button
  const isStubPage = ctx.isHomepage || ctx.isAboutPage || ctx.isSearchPage || ctx.isJournalsPage

  // Generate editing options based on context
  const getEditingOptions = (): EditingScopeOption[] => {
    const options: EditingScopeOption[] = []

    // Stub-based pages: Single edit option only (no template hierarchy)
    if (isStubPage) {
      const pageLabel = ctx.isHomepage ? 'Homepage' 
        : ctx.isAboutPage ? 'About Page'
        : ctx.isSearchPage ? 'Search Page'
        : 'Journals Page'
      
      options.push({
        id: 'individual',
        label: `Edit ${pageLabel}`,
        description: `Edit this ${pageLabel.toLowerCase()} content and layout`,
        affects: `This ${pageLabel.toLowerCase()} only`,
        icon: <Edit3 className="w-4 h-4" />,
        isPrimary: true
      })
      // No additional options - stubs don't have template inheritance
      return options
    }
      
    // Journal Home - uses Page Template with inheritance
    if (ctx.isJournalHome) {
      options.push({
        id: 'journal',
        label: `Edit ${displayJournalName} Home`,
        description: `Edit this specific journal's homepage`,
        affects: `${displayJournalName} homepage only`,
        icon: <BookOpen className="w-4 h-4" />,
        isPrimary: true
      })
      options.push({
        id: 'global',
        label: 'Edit Journal Home Template',
        description: 'Changes to journal home template affect all journals',
        affects: 'All journal homepages using this template',
        icon: <Globe className="w-4 h-4" />
      })
      
    } else if (ctx.isIssueToc) {
      // Primary: Edit journal template
      options.push({
        id: 'journal',
        label: `Edit All ${displayJournalName} Issues`,
        description: `Changes to ${displayJournalName} template affect all its issues`,
        affects: `All ${displayJournalName} issues`,
        icon: <BookOpen className="w-4 h-4" />,
        isPrimary: true
      })
      
      // Individual issue
      const issueLabel = ctx.isCurrent 
        ? 'Current' 
        : ctx.vol && ctx.issue 
          ? `Vol ${ctx.vol}, Issue ${ctx.issue}`
          : 'this issue'
      options.push({
        id: 'individual',
        label: `Edit this Issue (${issueLabel})`,
        description: `Changes apply only to this specific issue`,
        affects: `${displayJournalName} ${issueLabel} only`,
        icon: <FileText className="w-4 h-4" />
      })
      
      // Global
      options.push({
        id: 'global',
        label: `Edit All Issues`,
        description: 'Changes affect all issues in all journals',
        affects: 'All journals, all issues',
        icon: <Globe className="w-4 h-4" />
      })
      
      // Issue type (only for current issues)
      if (ctx.isCurrent || ctx.issueType === 'current') {
        options.push({
          id: 'issue-type',
          label: `Edit All Current Issues`,
          description: `All current issues across all journals get these changes`,
          affects: `All Current Issues (all journals)`,
          icon: <Edit3 className="w-4 h-4" />
        })
      }
      
    } else if (ctx.isArticle) {
      options.push({
        id: 'individual',
        label: 'Edit Article Page',
        description: 'Edit this specific article page layout',
        affects: 'This article only',
        icon: <Edit3 className="w-4 h-4" />,
        isPrimary: true
      })
      options.push({
        id: 'journal',
        label: `Edit ${displayJournalName} Article Template`,
        description: `Changes affect all articles in ${displayJournalName}`,
        affects: `All ${displayJournalName} articles`,
        icon: <BookOpen className="w-4 h-4" />
      })
      options.push({
        id: 'global',
        label: 'Edit Article Template',
        description: 'Changes affect all article pages across all journals',
        affects: 'All articles, all journals',
        icon: <Globe className="w-4 h-4" />
      })
      
    } else if (ctx.isArchive) {
      options.push({
        id: 'journal',
        label: `Edit ${displayJournalName} Archive`,
        description: `Edit the issue archive for ${displayJournalName}`,
        affects: `${displayJournalName} archive page`,
        icon: <BookOpen className="w-4 h-4" />,
        isPrimary: true
      })
      options.push({
        id: 'global',
        label: 'Edit Archive Template',
        description: 'Changes affect all journal archive pages',
        affects: 'All journal archives',
        icon: <Globe className="w-4 h-4" />
      })
      
    } else {
      // Fallback: unknown page type - simple edit only
      options.push({
        id: 'individual',
        label: 'Edit This Page',
        description: 'Edit this specific page content and layout',
        affects: 'This page only',
        icon: <Edit3 className="w-4 h-4" />,
        isPrimary: true
      })
    }

    return options
  }

  const editingOptions = getEditingOptions()
  const primaryOption = editingOptions.find(opt => opt.isPrimary) || editingOptions[0]
  const dropdownOptions = editingOptions.filter(opt => !opt.isPrimary)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setButtonPosition(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  // Update button position when opened
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setButtonPosition({
        top: rect.top,
        left: rect.left,
        width: rect.width
      })
    }
  }, [isOpen])

  const handleEditClick = (_scope: EditingScope) => {
    // Navigate to the edit URL - context is inferred from the route structure
    // Note: When template editing is implemented, we may add scope params back
    void _scope // Reserved for future template editing feature
    
    const editRoute = route || '/home'
    navigate(`/edit/${websiteId}${editRoute}`)
    setIsOpen(false)
  }

  return (
    <>
      <div 
        className="relative" 
        ref={buttonRef}
        style={{ zIndex: 999998, position: 'relative' }}
      >
        {/* Primary Button */}
        <div 
          className="flex" 
          style={{ zIndex: 999998, position: 'relative' }}
        >
          <button
            onClick={() => handleEditClick(primaryOption.id)}
            className={`px-4 py-2 bg-blue-600 text-white shadow-lg hover:bg-blue-700 text-sm font-medium whitespace-nowrap flex items-center gap-2 ${
              dropdownOptions.length > 0 ? 'rounded-l-full' : 'rounded-full'
            }`}
            style={{ zIndex: 999998, position: 'relative' }}
            title={primaryOption.description}
          >
            {primaryOption.icon}
            {primaryOption.label}
          </button>
          
          {/* Dropdown Arrow (only if there are dropdown options) */}
          {dropdownOptions.length > 0 && (
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="px-2 py-2 bg-blue-600 text-white rounded-r-full shadow-lg hover:bg-blue-700 border-l border-blue-500"
              style={{ zIndex: 999998, position: 'relative' }}
              title="More editing options"
            >
              <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Dropdown Menu rendered as portal */}
      {isOpen && dropdownOptions.length > 0 && buttonPosition && createPortal(
        <div 
          ref={dropdownRef}
          className="fixed w-80 bg-white border border-gray-200 rounded-lg shadow-xl"
          style={{ 
            zIndex: 999999,
            top: buttonPosition.top - 8,
            left: buttonPosition.left + buttonPosition.width - 320,
            transform: 'translateY(-100%)',
          }}
        >
          <div className="p-2 border-b border-gray-100">
            <h4 className="text-sm font-semibold text-gray-700">More Editing Options</h4>
          </div>
          
          {dropdownOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleEditClick(option.id)}
              className="w-full text-left p-3 hover:bg-gray-50 flex items-start gap-3 border-b border-gray-50 last:border-b-0"
            >
              <div className="text-blue-600 mt-1">
                {option.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900">
                  {option.label}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {option.description}
                </div>
                <div className="text-xs text-blue-600 mt-1 font-medium">
                  Affects: {option.affects}
                </div>
              </div>
            </button>
          ))}
          
          <div className="p-2 bg-gray-50 rounded-b-lg">
            <p className="text-xs text-gray-500">
              💡 Choose the scope that matches your intent. Changes propagate down the hierarchy.
            </p>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

export default EditingScopeButton

