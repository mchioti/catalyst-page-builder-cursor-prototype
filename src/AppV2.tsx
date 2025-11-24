/**
 * AppV2 - Clean rebuild with section-centric architecture
 */

import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { V2Navigation } from './v2/components/Shared/V2Navigation'
import { Websites } from './v2/components/Websites/Websites'
import { WebsiteDetail } from './v2/components/Websites/WebsiteDetail'
import { DesignConsole } from './v2/components/DesignConsole/DesignConsole'
import { SectionEditor } from './v2/components/DesignConsole/SectionEditor'
import { Editor } from './v2/components/Editor/Editor'
import { Preview } from './v2/components/Preview/Preview'
import { Live } from './v2/components/Live/Live'
import { initializeMockData, isMockDataLoaded } from './v2/data/initializeMockData'

function AppV2() {
  // Initialize mock data once on mount
  useEffect(() => {
    if (!isMockDataLoaded()) {
      initializeMockData()
    }
  }, [])
  
  return (
    <div className="min-h-screen bg-gray-50">
      <V2Navigation />
      
      <Routes>
        <Route path="/" element={<Websites />} />
        <Route path="/websites" element={<Websites />} />
        <Route path="/websites/:websiteId" element={<WebsiteDetail />} />
        <Route path="/design" element={<DesignConsole />} />
        <Route path="/design/section/:sectionId/:variationKey" element={<SectionEditor />} />
        <Route path="/editor" element={<Editor />} />
        <Route path="/preview" element={<Preview />} />
        <Route path="/live" element={<Live />} />
        <Route path="*" element={<Navigate to="/v2" replace />} />
      </Routes>
    </div>
  )
}

export default AppV2

