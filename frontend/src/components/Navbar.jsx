import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-[#1e293b]/80 backdrop-blur-xl border-b border-[#334155] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent hover:from-indigo-300 hover:to-purple-300 transition-all"
          >
            <span className="text-2xl">🚀</span>
            HackStarter
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-[#334155] transition-all text-sm font-medium"
                >
                  Dashboard
                </Link>
                <div className="flex items-center gap-3 ml-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                    {user?.username?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <span className="text-sm text-slate-300 hidden sm:block">
                    {user?.username}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="ml-2 text-sm text-slate-400 hover:text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-slate-300 hover:text-white px-4 py-2 rounded-lg hover:bg-[#334155] transition-all text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-all text-sm font-medium shadow-lg shadow-indigo-500/20"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
