import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CropAnalysis from './pages/CropAnalysis';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/crop-analysis" element={<CropAnalysis />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
