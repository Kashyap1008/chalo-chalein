import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center px-4 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500/8 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="text-center max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-sm text-indigo-300 mb-6">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            Hackathon Ready
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
            Build{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Something
            </span>
            <br />
            Amazing
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-400 mb-8 max-w-xl mx-auto leading-relaxed">
            Your hackathon starter pack is ready. Django REST + React + JWT auth —
            skip the boilerplate and focus on what matters.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={isAuthenticated ? '/dashboard' : '/register'}
              className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 text-base"
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 bg-[#1e293b] hover:bg-[#334155] text-slate-300 font-semibold rounded-xl border border-[#334155] transition-all text-base"
            >
              View on GitHub
            </a>
          </div>

          {/* Tech Stack Pills */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            {['Django REST', 'React', 'Vite', 'Tailwind CSS', 'JWT Auth', 'PostgreSQL'].map(
              (tech) => (
                <span
                  key={tech}
                  className="px-3 py-1.5 bg-[#1e293b]/60 border border-[#334155] rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:border-[#475569] transition-all"
                >
                  {tech}
                </span>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
