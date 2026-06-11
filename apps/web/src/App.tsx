import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import EligibilityCheck from './pages/EligibilityCheck';
import EmiCalculator from './pages/EmiCalculator';
import LoanProducts from './pages/LoanProducts';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="eligibility" element={<EligibilityCheck />} />
        <Route path="calculator" element={<EmiCalculator />} />
        <Route path="products" element={<LoanProducts />} />
      </Route>
    </Routes>
  );
}
