import React, { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'

// Track which items have been "seen" to hide badges after viewing
const SEEN_ITEMS_KEY = 'pb-seen-new-items'

// Items marked as "new" with their introduction date
// When we add something new, we add it here with the date
export const NEW_ITEMS: Record<string, string> = {
  // Designs/Themes (match theme IDs from mockThemes.ts)
  'design:wiley-figma-ds-v2': '2025-12-15',
  'design:ibm-carbon-ds': '2025-12-10',
  'design:ant-design': '2025-12-08',
  
  // Stubs from WebsiteInheritedStubs (match stub.id values: homepage, about, search, journals)
  'starter:search': '2025-12-18',  // Search Results page
  
  // Features (for notification bell)
  'feature:breadcrumbs-widget': '2025-12-18',
  'feature:global-header-footer-controls': '2025-12-18',
  
  // Widget library items (match item.type from library.ts)
  'widget:breadcrumbs': '2025-12-18',
  'widget:editorial-card': '2025-12-15',
}

// How long to show "NEW" badge (in days)
const NEW_BADGE_DURATION_DAYS = 14

function getSeenItems(): string[] {
  try {
    const stored = localStorage.getItem(SEEN_ITEMS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function markAsSeen(itemId: string): void {
  try {
    const seen = getSeenItems()
    if (!seen.includes(itemId)) {
      seen.push(itemId)
      localStorage.setItem(SEEN_ITEMS_KEY, JSON.stringify(seen))
    }
  } catch {
    // Ignore localStorage errors
  }
}

export function isItemNew(itemId: string): boolean {
  const introDate = NEW_ITEMS[itemId]
  if (!introDate) return false
  
  // Check if still within the "new" window
  const intro = new Date(introDate)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - intro.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays > NEW_BADGE_DURATION_DAYS) return false
  
  // Check if user has already seen this
  const seen = getSeenItems()
  return !seen.includes(itemId)
}

export function useNewBadge(itemId: string) {
  const [isNew, setIsNew] = useState(() => isItemNew(itemId))
  
  const markSeen = () => {
    markAsSeen(itemId)
    setIsNew(false)
  }
  
  return { isNew, markSeen }
}

interface NewBadgeProps {
  itemId: string
  variant?: 'default' | 'compact' | 'pill'
  className?: string
  onSeen?: () => void
}

export function NewBadge({ 
  itemId, 
  variant = 'default',
  className = '',
  onSeen
}: NewBadgeProps) {
  const { isNew, markSeen } = useNewBadge(itemId)
  
  // Mark as seen when component unmounts (user navigated away)
  useEffect(() => {
    return () => {
      if (isNew && onSeen) {
        onSeen()
      }
    }
  }, [isNew, onSeen])
  
  if (!isNew) return null
  
  if (variant === 'compact') {
    return (
      <span 
        className={`inline-flex items-center justify-center w-2 h-2 bg-emerald-500 rounded-full ${className}`}
        title="New"
      />
    )
  }
  
  if (variant === 'pill') {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-700 rounded-full ${className}`}>
        NEW
      </span>
    )
  }
  
  // Default variant with sparkle icon
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-md shadow-sm ${className}`}>
      <Sparkles className="w-3 h-3" />
      NEW
    </span>
  )
}

// Helper to check if any items in a category are new
export function hasNewItemsInCategory(categoryPrefix: string): boolean {
  return Object.keys(NEW_ITEMS).some(key => 
    key.startsWith(categoryPrefix) && isItemNew(key)
  )
}

export default NewBadge

