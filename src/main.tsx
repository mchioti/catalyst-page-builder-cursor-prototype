import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import AppV1 from './AppV1.tsx'
import AppV2 from './AppV2.tsx'
import { LiveSite } from './components/LiveSite'
import { LegacyMockLiveSite } from './components/LegacyMockLiveSite'
import { PageBuilderEditor } from './components/PageBuilderEditor'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/v1" element={<AppV1 />} />
        <Route path="/v1/mock" element={<LegacyMockLiveSite />} />
        <Route path="/v2/*" element={<AppV2 />} />
        <Route path="/edit/:websiteId/*" element={<PageBuilderEditor />} />
        <Route path="/live/:websiteId/*" element={<LiveSite />} />
        <Route path="/live" element={<Navigate to="/live/catalyst-demo" replace />} />
        <Route path="/" element={<Navigate to="/v1" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
