import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, LogOut, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import GlobalSearchModal from './GlobalSearchModal';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Global key combination shortcut (Ctrl+K or Cmd+K) to open Search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          
          {/* Brand Logo & Global Search Pill */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link to={isAuthenticated ? '/dashboard' : '/login'} className="flex items-center gap-2.5 group shrink-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform duration-200">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <span className="text-lg font-bold bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 bg-clip-text text-transparent">
                  Athenaeum
                </span>
                <span className="hidden sm:inline-block text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full ml-2">
                  Library OS
                </span>
              </div>
            </Link>

            {/* Global Search Quick Pill (Desktop & Tablet) */}
            {isAuthenticated && (
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-700 bg-slate-100/80 hover:bg-slate-200/60 border border-slate-200/80 rounded-xl transition-all cursor-pointer w-48 lg:w-64"
                title="Global Search across Title, Author, ISBN, Category (Ctrl+K)"
              >
                <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate flex-1 text-left font-medium">Quick search...</span>
                <kbd className="text-[10px] font-mono px-1.5 py-0.5 bg-white border border-slate-200 rounded shadow-2xs text-slate-500">
                  Ctrl K
                </kbd>
              </button>
            )}
          </div>

          {/* Right Navigation */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthenticated && user ? (
              <>
                {/* Mobile Search Button */}
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(true)}
                  className="md:hidden p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  title="Search Catalog (Ctrl+K)"
                >
                  <Search className="w-4 h-4" />
                </button>

                <Link
                  to="/dashboard"
                  className="hidden xl:inline-flex items-center px-2.5 py-1.5 text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/books"
                  className="inline-flex items-center px-2.5 py-1.5 text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Books
                </Link>
                <Link
                  to="/categories"
                  className="inline-flex items-center px-2.5 py-1.5 text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Categories
                </Link>
                <Link
                  to="/members"
                  className="inline-flex items-center px-2.5 py-1.5 text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Members
                </Link>
                <Link
                  to="/circulation"
                  className="inline-flex items-center px-2.5 py-1.5 text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Circulation
                </Link>
                <Link
                  to="/fines"
                  className="inline-flex items-center px-2.5 py-1.5 text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Fines
                </Link>
                <Link
                  to="/profile"
                  className="hidden 2xl:inline-flex items-center px-2.5 py-1.5 text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Profile
                </Link>

                <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>

                {/* User Pill */}
                <div className="flex items-center gap-2 sm:gap-3 pl-1 sm:pl-2">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                    title="View Profile"
                  >
                    <img
                      src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                      alt={user.name}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-2 ring-indigo-500/20"
                    />
                    <div className="text-left hidden lg:block leading-tight">
                      <p className="text-xs font-semibold text-slate-800 truncate max-w-[120px]">{user.name}</p>
                      <div className="flex items-center gap-1">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {user.role}
                        </span>
                      </div>
                    </div>
                  </Link>

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-150 cursor-pointer border border-transparent hover:border-red-100"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-100/80 rounded-xl transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all hover:shadow-indigo-200 shadow-indigo-100"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </header>
  );
}
