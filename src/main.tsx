import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import AppV1 from './AppV1.tsx'
import AppV2 from './AppV2.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/v1" element={<AppV1 />} />
        <Route path="/v2/*" element={<AppV2 />} />
        <Route path="/" element={<Navigate to="/v1" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
