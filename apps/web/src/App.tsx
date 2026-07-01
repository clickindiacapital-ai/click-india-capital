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

// Version 2 routes
import LayoutV2 from './components/LayoutV2';
import HomeV2 from './pages/HomeV2';
import AboutV2 from './pages/AboutV2';
import LoanProductsV2 from './pages/LoanProductsV2';

// Version 3 routes (Blended)
import LayoutV3 from './components/LayoutV3';
import HomeV3 from './pages/HomeV3';

export default function App() {
  const isDev = import.meta.env.DEV;

  if (!isDev) {
    return (
      <HelmetProvider>
        <SEO />
        <Routes>
          <Route path="*" element={<ComingSoon />} />
        </Routes>
      </HelmetProvider>
    );
  }

  return (
    <HelmetProvider>
      <SEO />
      <Routes>
        {/* Version 1 Routes */}
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
        </Route>

        {/* Version 2 Routes */}
        <Route path="/v2" element={<LayoutV2 />}>
          <Route index element={<HomeV2 />} />
          <Route path="about" element={<AboutV2 />} />
          <Route path="products" element={<LoanProductsV2 />} />
          <Route path="eligibility" element={<EligibilityCheck />} />
          <Route path="calculator" element={<EmiCalculator />} />
          <Route path="insights" element={<Insights />} />
          <Route path="insights/:id" element={<InsightDetail />} />
          <Route path="contact" element={<Contact />} />
          <Route path="advisory" element={<Advisory />} />
          
          {/* Legal Routes */}
          <Route path="privacy" element={<Legal type="privacy" />} />
          <Route path="terms" element={<Legal type="terms" />} />
          <Route path="disclaimer" element={<Legal type="disclaimer" />} />
          <Route path="consent" element={<Legal type="consent" />} />
          <Route path="grievance" element={<Legal type="grievance" />} />
          <Route path="data-deletion" element={<Legal type="data-deletion" />} />
        </Route>

        {/* Version 3 Routes (Blended) */}
        <Route path="/v3" element={<LayoutV3 />}>
          <Route index element={<HomeV3 />} />
          <Route path="about" element={<AboutV2 />} />
          <Route path="products" element={<LoanProductsV2 />} />
          <Route path="eligibility" element={<EligibilityCheck />} />
          <Route path="calculator" element={<EmiCalculator />} />
          <Route path="insights" element={<Insights />} />
          <Route path="insights/:id" element={<InsightDetail />} />
          <Route path="contact" element={<Contact />} />
          <Route path="advisory" element={<Advisory />} />
          
          {/* Legal Routes */}
          <Route path="privacy" element={<Legal type="privacy" />} />
          <Route path="terms" element={<Legal type="terms" />} />
          <Route path="disclaimer" element={<Legal type="disclaimer" />} />
          <Route path="consent" element={<Legal type="consent" />} />
          <Route path="grievance" element={<Legal type="grievance" />} />
          <Route path="data-deletion" element={<Legal type="data-deletion" />} />
        </Route>

        {/* Catch-all/fallback to main homepage */}
        <Route path="*" element={<Layout />}>
          <Route path="*" element={<Home />} />
        </Route>
      </Routes>
    </HelmetProvider>
  );
}

