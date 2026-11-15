import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { PwaUpdateProvider } from './context/PwaUpdateContext.tsx'
import { sendDailyPingIfDue } from './telemetry/optInStats.ts'
import { initTouchFeedback } from './utils/touchFeedback.ts'

// Initialize ultra-lightweight GPU touch ripple feedback & haptics
initTouchFeedback();

// Fire silent daily ping in background ONLY if user previously enabled opt-in
sendDailyPingIfDue();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PwaUpdateProvider>
      <App />
    </PwaUpdateProvider>
  </StrictMode>,
)
