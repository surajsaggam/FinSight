import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, BarChart3, Upload, MessageCircle, Home, Receipt } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const { darkMode, toggleTheme } = useTheme();

  const navLinks = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/upload', icon: Upload, label: 'Upload' },
    { path: '/dashboard', icon: BarChart3, label: 'Dashboard' },
    { path: '/chat', icon: MessageCircle, label: 'Chat' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 w-full border-b border-gray-200 dark:border-white/[0.06] bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl animate-fade-in">
      <div className="max-w-[90rem] mx-auto px-6 h-16 flex items-center justify-between relative">

        {/* LEFT: Logo */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#C68346] to-[#df9d61] flex items-center justify-center shadow-lg shadow-[#C68346]/20 group-hover:scale-105 transition-transform duration-300">
              <Receipt className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">FinSight</span>
          </Link>
        </div>

        {/* CENTER: Nav Links */}
        <div className="hidden lg:flex items-center absolute left-1/2 -translate-x-1/2 bg-gray-100/50 dark:bg-white/[0.03] border border-gray-200/50 dark:border-white/[0.05] rounded-full p-1">
          {navLinks.map(({ path, icon: Icon, label }) => {
            const active = isActive(path);
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-[13px] font-semibold tracking-tight transition-all duration-300
                  ${active
                    ? 'text-[#C68346] bg-white dark:bg-[#1a1a1a] shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>

        {/* RIGHT: Theme + Mobile Nav */}
        <div className="flex items-center gap-3">
          <div className="lg:hidden flex items-center gap-1 mr-2">
            {navLinks.map(({ path, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`p-2 rounded-full transition-colors ${isActive(path) ? 'text-[#C68346]' : 'text-gray-400'}`}
              >
                <Icon className="w-5 h-5" />
              </Link>
            ))}
          </div>

          <button
            onClick={toggleTheme}
            className="w-10 h-10 flex items-center justify-center rounded-full text-gray-400 hover:text-[#C68346] hover:bg-[#C68346]/5 transition-all duration-300 border border-transparent hover:border-[#C68346]/20"
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </nav>
  );
}