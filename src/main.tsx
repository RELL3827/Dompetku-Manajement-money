import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { PwaUpdateProvider } from './context/PwaUpdateContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PwaUpdateProvider>
      <App />
    </PwaUpdateProvider>
  </StrictMode>,
)
