import { Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import SEO from './components/SEO';
import ComingSoon from './pages/ComingSoon';

/*
// Original routes (uncomment to restore site)
import Layout from './components/Layout';
import Home from './pages/Home';
import EligibilityCheck from './pages/EligibilityCheck';
import EmiCalculator from './pages/EmiCalculator';
import LoanProducts from './pages/LoanProducts';
import About from './pages/About';
import Insights from './pages/Insights';
import InsightDetail from './pages/InsightDetail';
import Contact from './pages/Contact';
import Legal from './pages/Legal';
import Advisory from './pages/Advisory';
import ClientPortal from './pages/ClientPortal';
*/

export default function App() {
  return (
    <HelmetProvider>
      <SEO />
      <Routes>
        {/* Render Coming Soon for all pages */}
        <Route path="*" element={<ComingSoon />} />
      </Routes>
    </HelmetProvider>
  );
}

