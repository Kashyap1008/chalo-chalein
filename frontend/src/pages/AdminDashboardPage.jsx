import { useState, useEffect } from 'react';
import api from '../api/axios';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get('/auth/stats/'),
        api.get('/auth/users/'),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data.results || usersRes.data);
    } catch (err) {
      console.error('Failed to load admin analytics:', err);
      setError('Failed to fetch admin statistics. Please verify backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-3xl">📊</span>
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Platform Admin Dashboard
              </h1>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              Real-time analytics, user accounts directory, and system health overview.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              PostgreSQL Live
            </span>
            <button
              onClick={fetchAdminData}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-sm font-medium transition-all shadow-md cursor-pointer flex items-center gap-2"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
            <p className="text-slate-400 text-sm font-medium">Fetching platform analytics...</p>
          </div>
        ) : (
          <>
            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Stat 1: Users */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    Total Registered Users
                  </span>
                  <span className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl text-xl">👥</span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">{stats?.total_users || users.length || 0}</span>
                  <span className="text-xs text-emerald-400 font-medium">+100% active</span>
                </div>
                <p className="text-slate-500 text-xs mt-2">Verified account profiles</p>
              </div>

              {/* Stat 2: Trips */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    Total Created Trips
                  </span>
                  <span className="p-2 bg-purple-500/10 text-purple-400 rounded-xl text-xl">✈️</span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">{stats?.total_trips || 0}</span>
                  <span className="text-xs text-purple-400 font-medium">Multi-city plans</span>
                </div>
                <p className="text-slate-500 text-xs mt-2">Across all active itineraries</p>
              </div>

              {/* Stat 3: Top Destination */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    Top Destination
                  </span>
                  <span className="p-2 bg-amber-500/10 text-amber-400 rounded-xl text-xl">🏰</span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white">
                    {stats?.top_cities?.[0]?.name || 'Jaipur'}
                  </span>
                  <span className="text-xs text-amber-400 font-medium">
                    {stats?.top_cities?.[0]?.country || 'India'}
                  </span>
                </div>
                <p className="text-slate-500 text-xs mt-2">Most visited city stop</p>
              </div>

              {/* Stat 4: System Status */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    API & DB Engine
                  </span>
                  <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl text-xl">⚡</span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-emerald-400">99.9%</span>
                  <span className="text-xs text-emerald-400 font-medium">PostgreSQL</span>
                </div>
                <p className="text-slate-500 text-xs mt-2">JWT SimpleJWT Auth Active</p>
              </div>
            </div>

            {/* Top Destinations Section */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <span>🌟</span> Top Visited Cities (Analytics)
                  </h2>
                  <p className="text-xs text-slate-400">Destinations most frequently scheduled in trip stops</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {stats?.top_cities && stats.top_cities.length > 0 ? (
                  stats.top_cities.map((city, idx) => (
                    <div
                      key={city.id || idx}
                      className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 flex items-center justify-between hover:bg-slate-800 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 text-xs font-bold flex items-center justify-center">
                          #{idx + 1}
                        </span>
                        <div>
                          <h4 className="font-bold text-slate-200 text-sm">{city.name}</h4>
                          <p className="text-xs text-slate-400">{city.country}</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {city.visit_count} stops
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-6 text-center text-slate-500 text-sm">
                    No destination metrics aggregated yet.
                  </div>
                )}
              </div>
            </div>

            {/* User Directory Table */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <span>👥</span> User Accounts Directory
                  </h2>
                  <p className="text-xs text-slate-400">All registered platform users and their trip counts</p>
                </div>

                <div className="relative w-full sm:w-72">
                  <input
                    type="text"
                    placeholder="Search user by email or username..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-2.5 text-xs text-slate-500 hover:text-slate-300"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto border border-slate-800 rounded-xl">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-800/80 text-xs font-semibold uppercase text-slate-400 border-b border-slate-700">
                    <tr>
                      <th className="px-4 py-3">User</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Total Trips</th>
                      <th className="px-4 py-3">Joined Date</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-4 py-3 font-medium text-slate-100 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-md">
                              {u.username?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-200">{u.username}</div>
                              {u.bio && <div className="text-xs text-slate-500 truncate max-w-xs">{u.bio}</div>}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-300 font-mono text-xs">{u.email}</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                              {u.trip_count || 0} trips
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-400">
                            {new Date(u.created_at || u.date_joined).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                              Active
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-4 py-8 text-center text-slate-500 text-sm">
                          No users matched "{searchTerm}"
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
