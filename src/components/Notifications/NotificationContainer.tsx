/**
 * Notification Components
 * 
 * Toast notifications and issues sidebar extracted from AppV1.tsx
 */

import { useState } from 'react'
import { X, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { usePageStore } from '../../stores'
import type { Notification, NotificationType, PageIssue } from '../../types/app'

// =============================================================================
// NotificationToast
// =============================================================================

interface NotificationToastProps {
  notification: Notification
  onClose: (id: string) => void
}

function NotificationToast({ notification, onClose }: NotificationToastProps) {
  const getNotificationStyles = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          icon: <CheckCircle className="w-5 h-5 text-green-600" />,
          text: 'text-green-800',
          title: 'text-green-900'
        }
      case 'warning':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-200', 
          icon: <AlertTriangle className="w-5 h-5 text-orange-600" />,
          text: 'text-orange-800',
          title: 'text-orange-900'
        }
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
          text: 'text-red-800', 
          title: 'text-red-900'
        }
      default: // info
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: <Info className="w-5 h-5 text-blue-600" />,
          text: 'text-blue-800',
          title: 'text-blue-900'
        }
    }
  }
  
  const styles = getNotificationStyles(notification.type)
  
  return (
    <div className={`p-4 rounded-lg border ${styles.bg} ${styles.border} shadow-sm`}>
      <div className="flex items-start gap-3">
        {styles.icon}
        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-medium ${styles.title}`}>{notification.title}</h4>
          <p className={`text-sm mt-1 ${styles.text}`}>{notification.message}</p>
        </div>
        <button
          onClick={() => onClose(notification.id)}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// =============================================================================
// NotificationContainer
// =============================================================================

export function NotificationContainer() {
  const { notifications, removeNotification } = usePageStore()
  
  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onClose={removeNotification}
        />
      ))}
    </div>
  )
}

// =============================================================================
// IssuesSidebar
// =============================================================================

export function IssuesSidebar() {
  const { pageIssues, removePageIssue, selectWidget } = usePageStore()
  const [isOpen, setIsOpen] = useState(false)
  
  if (pageIssues.length === 0) return null
  
  const issuesByType = pageIssues.reduce((acc, issue) => {
    if (!acc[issue.type]) acc[issue.type] = []
    acc[issue.type].push(issue)
    return acc
  }, {} as Record<string, PageIssue[]>)
  
  const errorCount = pageIssues.filter(i => i.severity === 'error').length
  const warningCount = pageIssues.filter(i => i.severity === 'warning').length

  return (
    <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-40">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-3 rounded-l-lg shadow-lg ${
          errorCount > 0 ? 'bg-red-500 text-white' : 
          warningCount > 0 ? 'bg-orange-500 text-white' : 'bg-gray-500 text-white'
        }`}
      >
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm font-medium">
            {errorCount > 0 && `${errorCount} errors`}
            {errorCount > 0 && warningCount > 0 && ', '}
            {warningCount > 0 && `${warningCount} warnings`}
          </span>
        </div>
      </button>
      
      {isOpen && (
        <div className="absolute right-12 top-0 w-80 bg-white rounded-lg shadow-xl border max-h-96 overflow-y-auto">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="font-medium text-gray-900">Page Issues</h3>
          </div>
          <div className="p-4 space-y-3">
            {Object.entries(issuesByType).map(([type, issues]) => (
              <div key={type}>
                <h4 className="text-sm font-medium text-gray-700 capitalize mb-2">{type}</h4>
                {issues.map((issue) => (
                  <div
                    key={issue.id}
                    className={`p-3 rounded border cursor-pointer hover:bg-gray-50 ${
                      issue.severity === 'error' ? 'border-red-200 bg-red-50' :
                      issue.severity === 'warning' ? 'border-orange-200 bg-orange-50' :
                      'border-blue-200 bg-blue-50'
                    }`}
                    onClick={() => {
                      if (issue.element) {
                        selectWidget(issue.element)
                      }
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{issue.title}</p>
                        <p className="text-xs text-gray-600 mt-1">{issue.description}</p>
                        {issue.suggestions && issue.suggestions.length > 0 && (
                          <ul className="text-xs text-gray-500 mt-2 list-disc list-inside">
                            {issue.suggestions.map((suggestion, idx) => (
                              <li key={idx}>{suggestion}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          removePageIssue(issue.id)
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

