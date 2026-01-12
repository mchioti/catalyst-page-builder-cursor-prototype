import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import AppV1 from './AppV1.tsx'
import AppV2 from './AppV2.tsx'
import { LiveSite } from './components/LiveSite'
import { LegacyMockLiveSite } from './components/LegacyMockLiveSite'
import { PageBuilderEditor } from './components/PageBuilderEditor'
import { ArchetypeEditor } from './components/ArchetypeEditor'
import { ArchetypePreview } from './components/ArchetypePreview'
import { addMilestoneNotifications } from './utils/milestoneNotifications'

// Add milestone notifications on app start (for demo/review purposes)
// Comment out this line for production
setTimeout(() => addMilestoneNotifications(), 1000)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/v1" element={<AppV1 />} />
        <Route path="/v1/mock" element={<LegacyMockLiveSite />} />
        <Route path="/v2/*" element={<AppV2 />} />
        <Route path="/preview/archetype/:archetypeId" element={<ArchetypePreview />} />
        <Route path="/edit/archetype/:archetypeId" element={<ArchetypeEditor />} />
        <Route path="/edit/:websiteId/*" element={<PageBuilderEditor />} />
        <Route path="/live/:websiteId/*" element={<LiveSite />} />
        <Route path="/live" element={<Navigate to="/live/catalyst-demo" replace />} />
        <Route path="/" element={<Navigate to="/v1" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
