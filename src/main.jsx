import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './index.css';
import TallesForm from './TallesForm.jsx';
import StatsPage from './StatsPage.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<TallesForm />} />
        <Route path="/stats" element={<StatsPage />} />
      </Routes>
    </Router>
  </StrictMode>,
);