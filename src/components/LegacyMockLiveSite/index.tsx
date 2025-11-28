/**
 * LegacyMockLiveSite - Wrapper for the old V1 Mock Live Site
 * 
 * Preserves access to the original ADVMA/EMBO journals for comparison
 * with the new Live Site system.
 * 
 * Route: /v1/mock
 */

import { useNavigate } from 'react-router-dom'
import { MockLiveSite } from '../MockLiveSite'
import { usePageStore } from '../../stores'
import { DynamicBrandingCSS } from '../BrandingSystem/DynamicBrandingCSS'
import { CanvasThemeProvider } from '../Canvas/CanvasThemeProvider'
import { NotificationContainer } from '../Notifications'

export function LegacyMockLiveSite() {
  const navigate = useNavigate()
  const { 
    mockLiveSiteRoute, 
    setMockLiveSiteRoute, 
    setCurrentView, 
    setEditingContext, 
    currentWebsiteId 
  } = usePageStore()
  
  // When navigating back to console, go to /v1
  const handleSetCurrentView = (view: 'page-builder' | 'design-console' | 'mock-live-site') => {
    if (view === 'design-console') {
      navigate('/v1')
    } else if (view === 'page-builder') {
      // Go to V1 page builder
      setCurrentView('page-builder')
      navigate('/v1')
    } else {
      setCurrentView(view)
    }
  }
  
  return (
    <>
      <DynamicBrandingCSS websiteId={currentWebsiteId} usePageStore={usePageStore} />
      <CanvasThemeProvider usePageStore={usePageStore}>
        {/* Legacy Banner */}
        <div className="bg-amber-100 border-b border-amber-300 px-4 py-2 text-center">
          <span className="text-amber-800 text-sm">
            📦 <strong>Legacy Preview</strong> - This is the old Mock Live Site (ADVMA/EMBO) for reference.{' '}
            <button 
              onClick={() => navigate('/live/catalyst-demo')}
              className="text-blue-600 hover:underline font-medium"
            >
              Try the new Live Site →
            </button>
          </span>
        </div>
        
        <MockLiveSite 
          mockLiveSiteRoute={mockLiveSiteRoute}
          setMockLiveSiteRoute={setMockLiveSiteRoute}
          setCurrentView={handleSetCurrentView}
          setEditingContext={setEditingContext}
          usePageStore={usePageStore}
        />
      </CanvasThemeProvider>
      <NotificationContainer />
    </>
  )
}

export default LegacyMockLiveSite

