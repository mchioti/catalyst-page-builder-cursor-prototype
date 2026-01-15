import React, { useState, useRef, useEffect } from 'react'
import { Bell, X, Sparkles, AlertTriangle, Info, CheckCircle, ExternalLink, ChevronRight } from 'lucide-react'

// Session milestone notifications - 2026-01-13 (Part 3)
const MOCK_NOTIFICATIONS = [
  {
    id: 'milestone-7',
    type: 'success' as const,
    category: 'release',
    title: '📝 Header/Footer Draft UX',
    description: 'Unified draft-first publish flow for header/footer, history restore, replace flow, and hide-on-page preview handling.',
    createdAt: '2026-01-15T18:30:00Z',
    read: false,
  },
  {
    id: 'milestone-0',
    type: 'success' as const,
    category: 'release',
    title: '🎯 Copy from Data-driven Pages',
    description: 'Create custom pages by copying Journal Home, Issue TOC, Article templates. URL context detection auto-applies journal branding.',
    createdAt: '2026-01-13T20:00:00Z',
    read: true,
  },
  {
    id: 'milestone-0b',
    type: 'success' as const,
    category: 'bugfix',
    title: '✅ Journal-Scoped Custom Pages',
    description: 'Fixed routing, editor loading, and context for pages like /journal/jas/promo. Correct colors, metadata, and "Edit This Page" button.',
    createdAt: '2026-01-13T19:30:00Z',
    read: true,
  },
  {
    id: 'milestone-1',
    type: 'success' as const,
    category: 'release',
    title: '✨ User-Created Pages System',
    description: 'New system for creating custom pages: "+ New Page" button, Design/My Pages/All filter, GenericPage renderer, full persistence across refreshes.',
    createdAt: '2026-01-13T18:00:00Z',
    read: true,
  },
  {
    id: 'milestone-2',
    type: 'feature' as const,
    category: 'release',
    title: '🔗 Page Creation Flow',
    description: 'Create blank pages with initial section, navigate to editor, Save & Publish persists to memory + localStorage, delete cleans both stores.',
    createdAt: '2026-01-13T17:45:00Z',
    read: true,
  },
  {
    id: 'milestone-3',
    type: 'feature' as const,
    category: 'release',
    title: '💾 Storage Persistence Fix',
    description: 'Pages now survive browser refresh! Editor and LiveSite hydrate from localStorage when memory is empty.',
    createdAt: '2026-01-13T17:30:00Z',
    read: true,
  },
  {
    id: 'milestone-4',
    type: 'feature' as const,
    category: 'release',
    title: '🏛️ 3-Layer Inheritance Model',
    description: 'Design Archetype → Website Override → Journal Instance. Website-scoped archetype editing ensures changes don\'t affect other websites.',
    createdAt: '2026-01-13T16:00:00Z',
    read: true,
  },
  {
    id: 'milestone-5',
    type: 'feature' as const,
    category: 'release',
    title: '📝 Terminology & UI Updates',
    description: '"Push to All Journals", "Keep for This Journal Only", "Data-driven Pages", "Other Pages". Removed Use button from URL-bound system pages.',
    createdAt: '2026-01-13T15:00:00Z',
    read: true,
  },
  {
    id: 'milestone-6',
    type: 'success' as const,
    category: 'bugfix',
    title: '✅ Sync with Master Fixes',
    description: 'Reset zones now compare against Website Master (not Design). Modal shows correct options: Confirm Sync / Keep Modified.',
    createdAt: '2026-01-13T14:00:00Z',
    read: true,
  },
  {
    id: '0a',
    type: 'feature' as const,
    category: 'release',
    title: 'Master/Copy Terminology Update',
    description: 'New clearer terminology: "Push to All Journals" replaces "Push to Archetype", "Synced/Modified" badges replace "Inherited/Overridden".',
    createdAt: '2026-01-12T14:00:00Z',
    read: true,
    action: { label: 'Try it', path: '/edit/catalyst-demo/journal/jas' }
  },
  {
    id: '0b',
    type: 'success' as const,
    category: 'bugfix',
    title: 'Page Navigation Fixed',
    description: 'Fixed issue where editing a journal after navigating from another page showed wrong content. Stale content is now properly cleared.',
    createdAt: '2026-01-03T13:30:00Z',
    read: true,
  },
  {
    id: '0c',
    type: 'feature' as const,
    category: 'release',
    title: 'Save & Publish Review Modal',
    description: 'When publishing journal changes, you can now choose to keep for this journal only or push to all journals.',
    createdAt: '2026-01-03T13:00:00Z',
    read: true,
  },
  {
    id: '1',
    type: 'feature' as const,
    category: 'release',
    title: 'Breadcrumbs widget now available',
    description: 'New navigation widget with multiple separator styles',
    createdAt: '2024-12-18T10:00:00Z',
    read: true,
    action: { label: 'Try it', path: '/widgets' }
  },
  {
    id: '2',
    type: 'feature' as const,
    category: 'release',
    title: 'Global header/footer controls',
    description: 'Hide headers globally from the 3-dot menu',
    createdAt: '2024-12-18T09:30:00Z',
    read: true,
  },
  {
    id: '3',
    type: 'warning' as const,
    category: 'accessibility',
    title: '2 accessibility issues detected',
    description: 'Images missing alt text on Homepage',
    createdAt: '2024-12-18T08:00:00Z',
    read: true,
    action: { label: 'View issues', path: '/issues' }
  },
  {
    id: '4',
    type: 'info' as const,
    category: 'system',
    title: 'New starter page available',
    description: 'Chemical Engineering Subject Page - perfect for academic journals',
    createdAt: '2024-12-17T14:00:00Z',
    read: true,
  },
  {
    id: '5',
    type: 'info' as const,
    category: 'tip',
    title: 'Pro tip: Dynamic content',
    description: 'Use "dynamic-query" for auto-generated publication lists',
    createdAt: '2024-12-16T10:00:00Z',
    read: true,
  },
]

type NotificationType = 'error' | 'warning' | 'info' | 'feature' | 'success'

type Notification = {
  id: string
  type: NotificationType
  category: string
  title: string
  description?: string
  createdAt: string
  read: boolean
  action?: {
    label: string
    path?: string
  }
}

const getIcon = (type: NotificationType) => {
  switch (type) {
    case 'error':
      return <AlertTriangle className="w-4 h-4 text-red-500" />
    case 'warning':
      return <AlertTriangle className="w-4 h-4 text-amber-500" />
    case 'feature':
      return <Sparkles className="w-4 h-4 text-purple-500" />
    case 'success':
      return <CheckCircle className="w-4 h-4 text-green-500" />
    case 'info':
    default:
      return <Info className="w-4 h-4 text-blue-500" />
  }
}

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter(n => !n.read).length

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const dismissNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  // Group notifications
  const unreadNotifications = notifications.filter(n => !n.read)
  const readNotifications = notifications.filter(n => n.read)

  return (
    <div ref={dropdownRef} className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          relative p-2 rounded-lg transition-all duration-200
          ${isOpen 
            ? 'bg-gray-100 text-gray-900' 
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }
        `}
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-medium text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              <>
                {/* Unread Section */}
                {unreadNotifications.length > 0 && (
                  <div>
                    <div className="px-4 py-2 bg-blue-50/50 border-b border-blue-100">
                      <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                        New ({unreadNotifications.length})
                      </span>
                    </div>
                    {unreadNotifications.map(notification => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onRead={() => markAsRead(notification.id)}
                        onDismiss={(e) => dismissNotification(notification.id, e)}
                      />
                    ))}
                  </div>
                )}

                {/* Read Section */}
                {readNotifications.length > 0 && (
                  <div>
                    {unreadNotifications.length > 0 && (
                      <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Earlier
                        </span>
                      </div>
                    )}
                    {readNotifications.map(notification => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onRead={() => {}}
                        onDismiss={(e) => dismissNotification(notification.id, e)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/50">
            <button className="w-full text-center text-xs text-gray-500 hover:text-gray-700 py-1">
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Individual Notification Item
const NotificationItem: React.FC<{
  notification: Notification
  onRead: () => void
  onDismiss: (e: React.MouseEvent) => void
}> = ({ notification, onRead, onDismiss }) => {
  return (
    <div
      onClick={onRead}
      className={`
        group relative px-4 py-3 border-b border-gray-50 cursor-pointer
        transition-colors duration-150
        ${notification.read 
          ? 'bg-white hover:bg-gray-50' 
          : 'bg-blue-50/30 hover:bg-blue-50/50'
        }
      `}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {getIcon(notification.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={`text-sm ${notification.read ? 'text-gray-700' : 'text-gray-900 font-medium'}`}>
              {notification.title}
            </p>
            {/* Dismiss button */}
            <button
              onClick={onDismiss}
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200 transition-opacity"
            >
              <X className="w-3 h-3 text-gray-400" />
            </button>
          </div>
          
          {notification.description && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
              {notification.description}
            </p>
          )}

          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-xs text-gray-400">
              {formatTimeAgo(notification.createdAt)}
            </span>
            
            {notification.action && (
              <button className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium">
                {notification.action.label}
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Unread indicator */}
        {!notification.read && (
          <div className="flex-shrink-0">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
          </div>
        )}
      </div>
    </div>
  )
}

export default NotificationBell

