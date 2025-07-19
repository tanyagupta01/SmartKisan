import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CropAnalysis from './pages/CropAnalysis';
import VoiceChat from './pages/VoiceChat';
import Calendar from './pages/Calender';
import MarketData from './pages/MarketData';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/crop-analysis" element={<CropAnalysis />} />
        <Route path="/voice-chat" element={<VoiceChat />} />
        <Route path="/calender" element={<Calendar />} />
        <Route path="/market-data" element={<MarketData />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
