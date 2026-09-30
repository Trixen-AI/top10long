import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import { DocsPage } from './DocsPage'
import { LongIndexProvider } from '@/hooks/LongIndexProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LongIndexProvider>
      <DocsPage />
    </LongIndexProvider>
  </StrictMode>,
)
