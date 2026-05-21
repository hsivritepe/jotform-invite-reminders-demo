import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Import the design-system global stylesheet exactly once, here at the app entry.
// This loads the Circular font, primitive + semantic tokens, reset, and component styles.
import '@jf/design-system/styles'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
