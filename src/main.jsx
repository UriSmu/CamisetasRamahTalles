import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import TallesForm from './TallesForm.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TallesForm />
  </StrictMode>,
)
