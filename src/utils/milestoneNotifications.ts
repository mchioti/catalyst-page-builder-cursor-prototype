/**
 * Milestone Notifications - Session 2026-01-13
 * 
 * This file contains the milestone summary that can be displayed
 * in the notifications panel to track development progress.
 */

import { useNotificationStore } from '../stores/notificationStore'

export interface MilestoneItem {
  category: string
  items: string[]
}

export const SESSION_MILESTONES: MilestoneItem[] = [
  {
    category: '🏛️ 3-Layer Inheritance Model',
    items: [
      'Design Archetype → Website Override → Journal Instance',
      'WebsiteArchetypeOverride type and storage functions',
      'resolveCanvasFromArchetype handles all 3 layers',
      'Website-scoped archetype editing (doesn\'t affect Design)',
      '"Edit Website Master" vs "Edit Design Master" distinction'
    ]
  },
  {
    category: '📝 Terminology Updates',
    items: [
      '"Push to Archetype" → "Push to All Journals"',
      '"Keep Local" → "Keep for This Journal Only"',
      '"Save as Stub" → "Save as Copy"',
      '"Inherited" badge → "Synced" badge',
      '"Overridden" badge → "Modified" badge',
      'Master name shown in UI (e.g., "Modern Journal Home")'
    ]
  },
  {
    category: '🗂️ Design Console Updates',
    items: [
      '"Page Library" → "Data-driven Pages"',
      '"Stub Library" → "Other Pages"',
      'Publication Cards moved above Data-driven Pages',
      'Preview button added to Website Data-driven Pages',
      'Removed Use button from URL-bound system pages'
    ]
  },
  {
    category: '🔄 Website Master Flow',
    items: [
      'Editing archetype from website context creates website override',
      '"Push to All Journals" saves to website override (not design)',
      'Preview shows correct context (Website vs Design Master)',
      'Banner and button text reflect website/design scope'
    ]
  },
  {
    category: '✅ Sync with Master Fix',
    items: [
      '"Reset to Archetype" now compares against Website Master',
      'Reset zones show "Confirm Sync" / "Keep Modified" options',
      'Baseline uses resolved archetype (Design + Website override)',
      'No more "Push to All Journals" option for reset actions'
    ]
  },
  {
    category: '📋 Previous Session (2026-01-12)',
    items: [
      'PageStatus component with change badges',
      'Publish modal with per-zone choices',
      'Replace Zone feature with widget migration',
      'Archetype editor unified with page editor',
      'Design tokens and archetype override rules'
    ]
  }
]

/**
 * Add milestone notifications to the notification panel
 * Called on app initialization
 */
export function addMilestoneNotifications() {
  const { addNotification } = useNotificationStore.getState()
  
  // Add a summary notification
  addNotification({
    type: 'success',
    title: '✨ Milestone: Website Master & 3-Layer Inheritance',
    message: `Session completed with ${SESSION_MILESTONES.reduce((sum, m) => sum + m.items.length, 0)} improvements across ${SESSION_MILESTONES.length} categories. Check notifications for details.`,
    autoClose: false // Keep this one visible
  })
  
  // Add category summaries with slight delays for visual effect
  SESSION_MILESTONES.forEach((milestone, index) => {
    setTimeout(() => {
      addNotification({
        type: 'info',
        title: milestone.category,
        message: milestone.items.join(' • '),
        autoClose: false
      })
    }, (index + 1) * 100)
  })
}

/**
 * Get milestone summary as formatted text
 */
export function getMilestoneSummaryText(): string {
  let text = '# Session Milestone Summary (2026-01-13)\n\n'
  
  SESSION_MILESTONES.forEach(milestone => {
    text += `## ${milestone.category}\n`
    milestone.items.forEach(item => {
      text += `- ${item}\n`
    })
    text += '\n'
  })
  
  text += '## Pending Tasks\n'
  text += '- [FUTURE] Implement Design / My Pages / All filtering\n'
  text += '- [FUTURE] Add role-based access control\n'
  text += '- [DISCUSS] Merge changes UI when local + archetype affect same zone/widget\n'
  text += '- Allow any page to sync with any Master\n'
  text += '- Add "Link to Master" action with preview/diff\n'
  
  return text
}
