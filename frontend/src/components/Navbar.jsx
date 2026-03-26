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
    <nav className="fixed top-0 left-0 right-0 z-50 w-full border-b border-gray-100/80 dark:border-white/[0.04] bg-white/70 dark:bg-[#0a0a0a]/70 backdrop-blur-xl">
      <div className="max-w-[90rem] mx-auto px-6 h-16 flex items-center justify-between relative">

        {/* LEFT: Logo */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C68346] to-[#8B5E3C] flex items-center justify-center shadow-lg shadow-[#C68346]/25 group-hover:shadow-xl group-hover:shadow-[#C68346]/35 group-hover:scale-105 transition-all duration-300">
              <Receipt className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-lg font-extrabold tracking-tight text-gray-900 dark:text-white">Fin</span>
              <span className="text-lg font-extrabold tracking-tight text-[#C68346]">Sight</span>
            </div>
          </Link>
        </div>

        {/* CENTER: Nav Links (Desktop) */}
        <div className="hidden lg:flex items-center absolute left-1/2 -translate-x-1/2 bg-gray-50/80 dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/[0.05] rounded-2xl p-1 backdrop-blur-sm">
          {navLinks.map(({ path, icon: Icon, label }) => {
            const active = isActive(path);
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold tracking-tight transition-all duration-300 relative
                  ${active
                    ? 'text-[#C68346] bg-white dark:bg-[#1a1a1a] shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
                  }`}
              >
                <Icon className={`w-4 h-4 transition-transform duration-300 ${active ? 'scale-110' : ''}`} />
                <span>{label}</span>
                {active && (
                  <div className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#C68346]" />
                )}
              </Link>
            );
          })}
        </div>

        {/* RIGHT: Theme toggle + Mobile Nav */}
        <div className="flex items-center gap-2">
          {/* Mobile nav */}
          <div className="lg:hidden flex items-center gap-0.5 bg-gray-50/80 dark:bg-white/[0.03] rounded-2xl p-1 border border-gray-200/60 dark:border-white/5">
            {navLinks.map(({ path, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`p-2.5 rounded-xl transition-all duration-300 ${isActive(path) ? 'text-[#C68346] bg-white dark:bg-[#1a1a1a] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Icon className="w-4.5 h-4.5" />
              </Link>
            ))}
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:text-[#C68346] hover:bg-[#C68346]/5 transition-all duration-300 border border-transparent hover:border-[#C68346]/15 group"
            aria-label="Toggle theme"
          >
            {darkMode ? (
              <Sun className="w-[18px] h-[18px] group-hover:rotate-90 transition-transform duration-500" />
            ) : (
              <Moon className="w-[18px] h-[18px] group-hover:-rotate-12 transition-transform duration-500" />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}