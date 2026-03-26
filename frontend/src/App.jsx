import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
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
  const showNavbar = location.pathname !== '/';

  return (
    <div className="relative min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] text-gray-900 dark:text-[#f8f9fa] selection:bg-[#C68346]/30 overflow-hidden font-sans transition-colors duration-300">
      
      {/* Navbar Container */}
      <Navbar />
      
      {/* Content wrapper with precise top padding to clear fixed navbar seamlessly */}
      <div className="relative z-10 flex flex-col min-h-screen pt-16 pb-12">
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
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}
