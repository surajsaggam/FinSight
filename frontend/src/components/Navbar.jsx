import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Upload, MessageCircle, Home, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const location = useLocation();
  const isLanding = location.pathname === '/';
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/upload', icon: Upload, label: 'Upload' },
    { path: '/dashboard', icon: BarChart3, label: 'Dashboard' },
    { path: '/chat', icon: MessageCircle, label: 'Chat' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`${isLanding ? 'absolute' : 'fixed'} top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${scrolled ? 'backdrop-blur-xl bg-[#04050A]/80 border-b border-white/[0.06]' : 'bg-transparent'}`}>
      <div className="max-w-[90rem] mx-auto px-6 lg:px-16 h-16 flex items-center justify-center relative">
        {/* Logo — absolute left */}
        <Link to="/" className="absolute left-6 lg:left-16 flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-[#10B981]/15 border border-[#10B981]/25 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            <TrendingUp className="w-4 h-4 text-[#10B981]" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white font-space">FinSight</span>
        </Link>

        {/* Center Nav Links — always centered */}
        {!isLanding && (
          <div className="hidden md:flex items-center bg-white/[0.03] border border-white/[0.06] rounded-full p-1">
            {navLinks.map(({ path, icon: Icon, label }) => {
              const active = isActive(path);
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-2 px-5 py-2 rounded-full text-[13px] font-semibold tracking-tight transition-all duration-300
                    ${active
                      ? 'text-[#10B981] bg-[#10B981]/10'
                      : 'text-[#9CA3AF] hover:text-white'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>
        )}

        {/* Right side — absolute right */}
        {isLanding ? (
          <Link
            to="/upload"
            className="absolute right-6 lg:right-16 px-5 py-2 rounded-full text-sm font-medium text-white border border-white/[0.18] bg-white/[0.05] hover:bg-white/[0.10] hover:scale-[1.02] transition-all duration-300"
          >
            Get Started
          </Link>
        ) : (
          <div className="absolute right-6 lg:right-16 md:hidden flex items-center gap-1">
            {navLinks.map(({ path, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`p-2 rounded-full transition-colors ${isActive(path) ? 'text-[#10B981]' : 'text-[#6B7280]'}`}
              >
                <Icon className="w-4.5 h-4.5" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}