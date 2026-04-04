import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import UploadPage from './pages/UploadPage';
import ProcessingPage from './pages/ProcessingPage';
import ResultPage from './pages/ResultPage';
import CategorizationPage from './pages/CategorizationPage';
import DashboardPage from './pages/DashboardPage';
import ChatPage from './pages/ChatPage';

function AppContent() {
  const location = useLocation();

  return (
    <div className="relative min-h-screen bg-[#04050A] text-white selection:bg-[#10B981]/30 overflow-hidden font-sans">
      <Navbar />
      <div className={`relative z-10 flex flex-col min-h-screen ${location.pathname === '/' ? '' : 'pt-16 pb-12'}`}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/processing" element={<ProcessingPage />} />
          <Route path="/result" element={<ResultPage />} />
          <Route path="/categorize" element={<CategorizationPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/chat" element={<ChatPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
