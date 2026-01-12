/**
 * Milestone Notifications - Session 2026-01-12
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
    category: '🎨 Page Status & Override Management',
    items: [
      'PageStatus component in Properties Panel',
      'Save & Publish badge showing pending changes count',
      'Dirty zones compare against committed state (archetype + overrides)',
      'Per-zone discard option (cherry-pick changes)',
      'Reset to Archetype with preview mode'
    ]
  },
  {
    category: '📝 Publish Review Modal',
    items: [
      'Detailed change descriptions (widget added/removed/modified)',
      'Section and widget order change detection',
      'Smart grouping: "Resetting to Archetype" vs "New Changes"',
      'Per-zone choices: Keep Local / Push to Archetype / Discard',
      'Removed bulk actions for individual zone control'
    ]
  },
  {
    category: '🏗️ Archetype Editor',
    items: [
      'Unified UI with page editor (same buttons/flow)',
      'Disabled auto-save (changes stay as drafts)',
      'Change tracking with badge indicator',
      'Preview persistence (drafts survive preview navigation)',
      'Fixed journal context pollution (mockLiveSiteRoute reset)'
    ]
  },
  {
    category: '🔄 Replace Zone Feature',
    items: [
      'Replace Zone button on sections with zoneSlug',
      'Confirmation modal showing widgets to be moved',
      'Style preservation options (background, padding, content mode)',
      'All widgets automatically moved to new layout',
      'Layout picker with contextual title'
    ]
  },
  {
    category: '🎯 UX Improvements',
    items: [
      'Inherit/Local badges moved to Properties Panel',
      'Section/Widget ID and type shown in properties',
      'Menu/Breadcrumbs unified expansion mechanism',
      'Background opacity applies to background only (not widgets)',
      'Section padding supports CSS shorthand (2 or 4 values)'
    ]
  },
  {
    category: '📚 Project Rules Created',
    items: [
      'design-tokens.mdc - Using Figma design tokens',
      'archetype-override-system.mdc - Zone override architecture'
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
    title: '✨ Milestone: Replace Zone & Override System',
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
  let text = '# Session Milestone Summary (2026-01-12)\n\n'
  
  SESSION_MILESTONES.forEach(milestone => {
    text += `## ${milestone.category}\n`
    milestone.items.forEach(item => {
      text += `- ${item}\n`
    })
    text += '\n'
  })
  
  text += '## Pending Tasks\n'
  text += '- Add tests for dirty zones and publish flow\n'
  text += '- Add test case for properties panel expansion\n'
  text += '- Create history/audit panel for site changes\n'
  text += '- [DISCUSS] Merge changes UI when local + archetype affect same zone/widget\n'
  
  return text
}
