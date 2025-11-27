/**
 * Notification Store - Manages notifications and page issues
 * 
 * Separated from the main store for better modularity.
 */

import { create } from 'zustand'
import type { Notification, PageIssue, NotificationType } from '../types/app'

// =============================================================================
// Types
// =============================================================================

export interface NotificationState {
  // State
  notifications: Notification[]
  pageIssues: PageIssue[]
  
  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  addPageIssue: (issue: Omit<PageIssue, 'id'>) => void
  removePageIssue: (id: string) => void
  clearPageIssues: () => void
}

// =============================================================================
// Store
// =============================================================================

export const useNotificationStore = create<NotificationState>((set) => ({
  // State
  notifications: [],
  pageIssues: [],
  
  // Actions
  addNotification: (notification) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: new Date()
    }
    
    set((state) => ({ 
      notifications: [...state.notifications, newNotification] 
    }))
    
    // Auto-close notification if not disabled
    if (notification.autoClose !== false) {
      const delay = notification.closeAfter || (notification.type === 'error' ? 5000 : 3000)
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id)
        }))
      }, delay)
    }
  },
  
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),
  
  clearNotifications: () => set({ notifications: [] }),
  
  addPageIssue: (issue) => {
    const id = `issue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newIssue: PageIssue = { ...issue, id }
    
    set((state) => ({ 
      // Replace existing issue for same element/type, or add new
      pageIssues: [
        ...state.pageIssues.filter(i => i.element !== issue.element || i.type !== issue.type), 
        newIssue
      ] 
    }))
  },
  
  removePageIssue: (id) => set((state) => ({
    pageIssues: state.pageIssues.filter(i => i.id !== id)
  })),
  
  clearPageIssues: () => set({ pageIssues: [] })
}))

