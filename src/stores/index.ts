/**
 * Stores - Zustand state management
 * 
 * Architecture:
 * ┌─────────────────────────────────────────────────────────┐
 * │                     Domain Stores                        │
 * ├──────────────┬──────────────┬──────────────┬────────────┤
 * │ routingStore │ canvasStore  │ contentStore │ notification│
 * │   (views)    │  (editing)   │   (data)     │  (alerts)   │
 * └──────────────┴──────────────┴──────────────┴────────────┘
 *                           │
 *                     pageStore
 *                 (legacy aggregated)
 * 
 * New code should prefer domain stores.
 * Existing code can continue using pageStore (backward compatible).
 */

// Domain stores (preferred for new code)
export { useRoutingStore, type RoutingState } from './routingStore'
export { useNotificationStore, type NotificationState } from './notificationStore'
export { useCanvasStore, type CanvasState } from './canvasStore'
export { useContentStore, type ContentState } from './contentStore'

// Aggregated store (backward compatibility for existing code)
export { usePageStore } from './pageStore'
export type { PageState } from './pageStore'
