import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Globe, BookOpen, FileText, Edit3 } from 'lucide-react'
import { createDebugLogger } from '../../utils/logger'

// Control logging for this file
const DEBUG = false
const debugLog = createDebugLogger(DEBUG)

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

interface TemplateEditingScopeButtonProps {
  mockLiveSiteRoute: string
  onEdit: (scope: EditingScope, issueType?: IssueType, journalCode?: string) => void
}

export function TemplateEditingScopeButton({ 
  mockLiveSiteRoute, 
  onEdit 
}: TemplateEditingScopeButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [buttonPosition, setButtonPosition] = useState<{ top: number; left: number; width: number } | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLDivElement>(null)

  // Extract context from URL
  const getContextFromRoute = () => {
    const journalMatch = mockLiveSiteRoute.match(/\/(toc|journal)\/([^\/]+)/)
    const journalCode = journalMatch?.[2] || null
    
    const issueTypeMatch = mockLiveSiteRoute.match(/\/toc\/[^\/]+\/([^\/]+)/)
    const issueTypeRaw = issueTypeMatch?.[1] || 'current'
    
    // Extract volume/issue info for past issues
    const volumeIssueMatch = issueTypeRaw.match(/vol-(\d+)-issue-(\d+)/)
    const issueType = volumeIssueMatch ? 'archive' : issueTypeRaw as IssueType
    const volumeInfo = volumeIssueMatch 
      ? `vol ${volumeIssueMatch[1]}, issue ${volumeIssueMatch[2]}`
      : null
    
    const isTemplate = mockLiveSiteRoute.includes('/template/')
    const isHomepage = mockLiveSiteRoute === '/'
    
    return { journalCode, issueType, isTemplate, isHomepage, volumeInfo }
  }

  const { journalCode, issueType, isTemplate, isHomepage, volumeInfo } = getContextFromRoute()

  // Generate editing options based on context
  const getEditingOptions = (): EditingScopeOption[] => {
    const journalName = journalCode === 'advma' 
      ? 'Advanced Materials' 
      : journalCode === 'embo' 
        ? 'EMBO Journal' 
        : 'This Journal'

    const issueTypeLabel = issueType === 'current' 
      ? 'Current Issues'
      : issueType === 'ahead-of-print'
        ? 'Ahead of Print Issues'
        : issueType === 'just-accepted'
          ? 'Just Accepted Issues'
          : 'Archive Issues'

    const options: EditingScopeOption[] = []

    if (isHomepage) {
      // Homepage: Most common = Edit this homepage, Secondary = Edit homepage template
      options.push({
        id: 'individual',
        label: 'Edit Homepage',
        description: 'Edit this specific homepage content and layout',
        affects: 'This website homepage only',
        icon: <Edit3 className="w-4 h-4" />,
        isPrimary: true
      })
      
      // Secondary option: Edit homepage template (affects other sites if publisher has multiple)
      options.push({
        id: 'global',
        label: 'Edit Homepage Template',
        description: 'Changes to homepage template affect all publisher websites',
        affects: 'All publisher websites using this template',
        icon: <Globe className="w-4 h-4" />
      })
      
    } else if (journalCode && mockLiveSiteRoute.includes('/journal/')) {
      // Journal Home: Most common = Edit this journal home, Secondary = Edit journal template
      options.push({
        id: 'journal',
        label: `Edit ${journalName} Home`,
        description: `Edit this specific journal's homepage`,
        affects: `${journalName} homepage only`,
        icon: <BookOpen className="w-4 h-4" />,
        isPrimary: true
      })
      
      // Secondary option: Edit journal home template (affects all journals)
      options.push({
        id: 'global',
        label: 'Edit Journal Home Template',
        description: 'Changes to journal home template affect all journals',
        affects: 'All journal homepages using this template',
        icon: <Globe className="w-4 h-4" />
      })
      
    } else if (journalCode && mockLiveSiteRoute.includes('/toc/')) {
      // TOC Issues: Primary = Journal template, Dropdown = Issue-specific options
      options.push({
        id: 'journal',
        label: `Edit All ${journalName} Issues`,
        description: `Changes to ${journalName} template affect all its issues`,
        affects: `All ${journalName} issues`,
        icon: <BookOpen className="w-4 h-4" />,
        isPrimary: true
      })

      // Issue-specific options in dropdown
      if (issueType === 'current') {
        // Current Issue: Show current-specific label
        options.push({
          id: 'individual',
          label: `Edit this Issue (Current)`,
          description: `Changes apply only to this current issue`,
          affects: `${journalName} Current Issue only`,
          icon: <FileText className="w-4 h-4" />
        })
        
        // Always show global cross-journal option
        options.push({
          id: 'global',
          label: `Edit All Issues`,
          description: 'Changes affect all issues in all journals',
          affects: 'All journals, all issues',
          icon: <Globe className="w-4 h-4" />
        })
        
        // Show current issue type option last (less common)
        options.push({
          id: 'issue-type',
          label: `Edit All Current Issues`,
          description: `All current issues across all journals get these changes`,
          affects: `All Current Issues (all journals)`,
          icon: <Edit3 className="w-4 h-4" />
        })
      } else {
        // Past Issue: Show volume/issue specific label
        const displayVolumeInfo = volumeInfo || 'vol x, issue y'
        options.push({
          id: 'individual',
          label: `Edit this Issue (${displayVolumeInfo})`,
          description: `Changes apply only to this specific issue`,
          affects: `${journalName} ${displayVolumeInfo} only`,
          icon: <FileText className="w-4 h-4" />
        })
        
        // Always show global cross-journal option for past issues too
        options.push({
          id: 'global',
          label: `Edit All Issues`,
          description: 'Changes affect all issues in all journals',
          affects: 'All journals, all issues',
          icon: <Globe className="w-4 h-4" />
        })
        
        // No issue type option for past issues (as per user requirement)
      }
    } else {
      // Fallback: generic page editing
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
  debugLog('log', '🎯 Generated editing options for', mockLiveSiteRoute, ':', editingOptions.map(opt => ({ id: opt.id, label: opt.label })))
  
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
      debugLog('log', '📍 Button position calculated:', { top: rect.top, left: rect.left, width: rect.width })
    }
  }, [isOpen])

  const handleEditClick = (scope: EditingScope) => {
    debugLog('log', '🎯 TemplateEditingScopeButton - Edit clicked:', {
      scope,
      issueType, 
      journalCode,
      route: mockLiveSiteRoute
    })
    onEdit(scope, issueType, journalCode || undefined)
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
            className="px-4 py-2 bg-blue-600 text-white rounded-l-full shadow-lg hover:bg-blue-700 text-sm font-medium whitespace-nowrap flex items-center gap-2"
            style={{ zIndex: 999998, position: 'relative' }}
            title={primaryOption.description}
          >
            {primaryOption.icon}
            {primaryOption.label}
          </button>
          
          {/* Dropdown Arrow (only if there are dropdown options) */}
          {dropdownOptions.length > 0 && (
            <button
              onClick={() => {
                debugLog('log', '🔽 Dropdown toggle clicked, current state:', isOpen)
                setIsOpen(!isOpen)
              }}
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
            top: buttonPosition.top - 8, // 8px above button (mb-2)
            left: buttonPosition.left + buttonPosition.width - 320, // 320px = w-80, right-align
            transform: 'translateY(-100%)', // Position above button
          }}
          onMouseEnter={() => debugLog('log', '🖱️ Portal dropdown hover - should be visible now')}
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
