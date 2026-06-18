import { Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import SEO from './components/SEO';
import ComingSoon from './pages/ComingSoon';

// Original routes
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

export default function App() {
  const isDev = import.meta.env.DEV;

  return (
    <HelmetProvider>
      <SEO />
      <Routes>
        {isDev ? (
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="eligibility" element={<EligibilityCheck />} />
            <Route path="calculator" element={<EmiCalculator />} />
            <Route path="products" element={<LoanProducts />} />
            <Route path="about" element={<About />} />
            <Route path="insights" element={<Insights />} />
            <Route path="insights/:id" element={<InsightDetail />} />
            <Route path="contact" element={<Contact />} />
            <Route path="advisory" element={<Advisory />} />
            <Route path="assistant" element={<Home />} />
            
            {/* Legal Routes */}
            <Route path="privacy" element={<Legal type="privacy" />} />
            <Route path="terms" element={<Legal type="terms" />} />
            <Route path="disclaimer" element={<Legal type="disclaimer" />} />
            <Route path="consent" element={<Legal type="consent" />} />
            <Route path="grievance" element={<Legal type="grievance" />} />
            <Route path="data-deletion" element={<Legal type="data-deletion" />} />
            
            <Route path="*" element={<Home />} />
          </Route>
        ) : (
          <Route path="*" element={<ComingSoon />} />
        )}
      </Routes>
    </HelmetProvider>
  );
}

