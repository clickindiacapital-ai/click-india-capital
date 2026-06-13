import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import EligibilityCheck from './pages/EligibilityCheck';
import EmiCalculator from './pages/EmiCalculator';
import LoanProducts from './pages/LoanProducts';
import About from './pages/About';
import Insights from './pages/Insights';
import InsightDetail from './pages/InsightDetail';
import Contact from './pages/Contact';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="eligibility" element={<EligibilityCheck />} />
        <Route path="calculator" element={<EmiCalculator />} />
        <Route path="products" element={<LoanProducts />} />
        <Route path="about" element={<About />} />
        <Route path="insights" element={<Insights />} />
        <Route path="insights/:id" element={<InsightDetail />} />
        <Route path="contact" element={<Contact />} />
        <Route path="assistant" element={<Home />} />
      </Route>
    </Routes>
  );
}
