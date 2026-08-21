import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const { user } = useAuth();

  const stats = [
    { label: 'Projects', value: '0', icon: '📁', color: 'from-indigo-500 to-blue-500' },
    { label: 'Commits', value: '0', icon: '🔨', color: 'from-purple-500 to-pink-500' },
    { label: 'Hours Left', value: '24', icon: '⏰', color: 'from-amber-500 to-orange-500' },
    { label: 'Team', value: '1', icon: '👥', color: 'from-emerald-500 to-teal-500' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back,{' '}
          <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            {user?.username}
          </span>
          ! 👋
        </h1>
        <p className="text-slate-400">Here&apos;s your hackathon dashboard. Start building something amazing!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-[#1e293b]/60 backdrop-blur-xl rounded-2xl border border-[#334155] p-6 hover:border-[#475569] transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl">{stat.icon}</span>
              <div className={`w-10 h-1 rounded-full bg-gradient-to-r ${stat.color} opacity-60 group-hover:opacity-100 transition-opacity`}></div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
            <p className="text-sm text-slate-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Getting Started Card */}
        <div className="bg-[#1e293b]/60 backdrop-blur-xl rounded-2xl border border-[#334155] p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>🚀</span> Quick Start
          </h2>
          <div className="space-y-3">
            {[
              { step: '1', text: 'Backend is ready — start adding your models', done: true },
              { step: '2', text: 'Frontend is wired up with JWT auth', done: true },
              { step: '3', text: 'Create your first API endpoint', done: false },
              { step: '4', text: 'Build your killer feature', done: false },
            ].map((item) => (
              <div
                key={item.step}
                className={`flex items-center gap-3 p-3 rounded-xl ${
                  item.done ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-[#0f172a]/50 border border-[#334155]'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    item.done
                      ? 'bg-emerald-500 text-white'
                      : 'bg-[#334155] text-slate-400'
                  }`}
                >
                  {item.done ? '✓' : item.step}
                </div>
                <span className={`text-sm ${item.done ? 'text-emerald-300' : 'text-slate-300'}`}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* API Endpoints Reference */}
        <div className="bg-[#1e293b]/60 backdrop-blur-xl rounded-2xl border border-[#334155] p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>📡</span> API Endpoints
          </h2>
          <div className="space-y-2 font-mono text-sm">
            {[
              { method: 'POST', path: '/api/auth/register/', desc: 'Register' },
              { method: 'POST', path: '/api/auth/login/', desc: 'Login (JWT)' },
              { method: 'POST', path: '/api/auth/token/refresh/', desc: 'Refresh Token' },
              { method: 'GET', path: '/api/auth/profile/', desc: 'Get Profile' },
              { method: 'PUT', path: '/api/auth/profile/', desc: 'Update Profile' },
              { method: 'POST', path: '/api/auth/logout/', desc: 'Logout' },
            ].map((endpoint) => (
              <div
                key={endpoint.path + endpoint.method}
                className="flex items-center gap-3 p-2.5 rounded-lg bg-[#0f172a]/50 border border-[#334155]"
              >
                <span
                  className={`px-2 py-0.5 rounded text-xs font-bold ${
                    endpoint.method === 'GET'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : endpoint.method === 'POST'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}
                >
                  {endpoint.method}
                </span>
                <span className="text-slate-300 flex-1 truncate">{endpoint.path}</span>
                <span className="text-slate-500 text-xs">{endpoint.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
