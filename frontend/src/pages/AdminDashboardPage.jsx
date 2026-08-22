import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "../api/axios";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import GlassCard from "../components/GlassCard";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [cities, setCities] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [cityCountryFilter, setCityCountryFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("overview"); // overview | users | destinations

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, citiesRes, actsRes] = await Promise.allSettled([
        axios.get("/auth/stats/"),
        axios.get("/auth/users/"),
        axios.get("/catalog/cities/"),
        axios.get("/catalog/activities/"),
      ]);

      if (statsRes.status === "fulfilled") {
        setStats(statsRes.value.data);
      }
      if (usersRes.status === "fulfilled") {
        const uList = Array.isArray(usersRes.value.data)
          ? usersRes.value.data
          : usersRes.value.data?.results || [];
        setUsers(uList);
      }
      if (citiesRes.status === "fulfilled") {
        const cList = Array.isArray(citiesRes.value.data)
          ? citiesRes.value.data
          : citiesRes.value.data?.results || [];
        setCities(cList);
      }
      if (actsRes.status === "fulfilled") {
        const aList = Array.isArray(actsRes.value.data)
          ? actsRes.value.data
          : actsRes.value.data?.results || [];
        setActivities(aList);
      }
    } catch (err) {
      console.error("Admin data fetch error", err);
      toast.error("Could not load administrative stats.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const adminCountries = useMemo(() => {
    const set = new Set(cities.map((c) => c.country).filter(Boolean));
    return Array.from(set).sort();
  }, [cities]);

  const filteredCities = useMemo(() => {
    return cities.filter((c) => {
      const q = citySearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        c.name?.toLowerCase().includes(q) ||
        c.country?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q);

      const matchCountry =
        cityCountryFilter === "all" ||
        c.country?.toLowerCase() === cityCountryFilter.toLowerCase();

      return matchSearch && matchCountry;
    });
  }, [cities, citySearch, cityCountryFilter]);

  const filteredUsers = useMemo(() => {
    const nonAdminUsers = users.filter(
      (u) =>
        !u.is_staff &&
        !u.is_superuser &&
        !u.email?.startsWith("admin") &&
        !u.username?.startsWith("admin")
    );
    if (!userSearch.trim()) return nonAdminUsers;
    const q = userSearch.toLowerCase();
    return nonAdminUsers.filter(
      (u) =>
        u.email?.toLowerCase().includes(q) ||
        u.username?.toLowerCase().includes(q) ||
        u.name?.toLowerCase().includes(q)
    );
  }, [users, userSearch]);

  const totalCatalogEst = useMemo(() => {
    return activities.reduce((acc, act) => acc + parseFloat(act.cost || 0), 0);
  }, [activities]);

  const formatDate = (val) => {
    if (!val) return "Just now";
    return new Date(val).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-paper text-ink pb-24">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-24">
        {/* Admin Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-line">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs uppercase tracking-[0.3em] text-clay font-bold">
                Platform Intelligence
              </span>
              <span className="text-xs text-ink/40">•</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                ● Live System Online
              </span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl text-ink">
              Activity & Analytics.
            </h1>
            <p className="text-sm text-ink/60 mt-1">
              Real-time platform metrics, user engagement, and travel trends.
            </p>
          </div>

          {/* Quick Tabs & Refresh */}
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5 p-1 rounded-xl bg-paper-deep border border-line">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
                  activeTab === "overview" ? "bg-white text-ink shadow-sm" : "text-ink/60 hover:text-ink"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("users")}
                className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
                  activeTab === "users" ? "bg-white text-ink shadow-sm" : "text-ink/60 hover:text-ink"
                }`}
              >
                Travelers ({users.length})
              </button>
              <button
                onClick={() => setActiveTab("destinations")}
                className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
                  activeTab === "destinations" ? "bg-white text-ink shadow-sm" : "text-ink/60 hover:text-ink"
                }`}
              >
                Destinations ({cities.length})
              </button>
            </div>

            <button
              onClick={loadAdminData}
              title="Refresh real-time analytics"
              className="p-2.5 rounded-xl bg-white border border-line hover:border-clay hover:text-clay text-ink/70 transition shadow-xs cursor-pointer text-xs flex items-center gap-1 font-semibold"
            >
              <span>🔄</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-ink/50 animate-pulse text-lg">
            Compiling platform analytics...
          </div>
        ) : (
          <>
            {/* KPI Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 my-8">
              <GlassCard className="p-6">
                <span className="text-xs uppercase tracking-wider text-ink/50 font-semibold block mb-2">
                  Total Travelers
                </span>
                <div className="flex items-baseline justify-between">
                  <h3 className="font-display text-4xl text-clay font-bold">
                    {stats?.total_users ?? users.length}
                  </h3>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>
                <p className="text-xs text-ink/50 mt-2">Registered platform accounts</p>
              </GlassCard>

              <GlassCard className="p-6">
                <span className="text-xs uppercase tracking-wider text-ink/50 font-semibold block mb-2">
                  Planned Itineraries
                </span>
                <div className="flex items-baseline justify-between">
                  <h3 className="font-display text-4xl text-ink font-bold">
                    {stats?.total_trips ?? 0}
                  </h3>
                  <span className="text-xs font-semibold text-clay bg-clay/10 px-2 py-0.5 rounded-full">
                    Real-time
                  </span>
                </div>
                <p className="text-xs text-ink/50 mt-2">Multi-city customized trips</p>
              </GlassCard>

              <GlassCard className="p-6">
                <span className="text-xs uppercase tracking-wider text-ink/50 font-semibold block mb-2">
                  Destinations Catalog
                </span>
                <div className="flex items-baseline justify-between">
                  <h3 className="font-display text-4xl text-ink font-bold">
                    {cities.length}
                  </h3>
                  <span className="text-xs font-semibold text-ink/70 bg-paper-deep px-2 py-0.5 rounded-full">
                    {activities.length} Activities
                  </span>
                </div>
                <p className="text-xs text-ink/50 mt-2">Curated global and Indian cities</p>
              </GlassCard>

              <GlassCard className="p-6">
                <span className="text-xs uppercase tracking-wider text-ink/50 font-semibold block mb-2">
                  Avg Activity Value
                </span>
                <div className="flex items-baseline justify-between">
                  <h3 className="font-display text-4xl text-emerald-800 font-bold">
                    ₹{activities.length ? Math.round(totalCatalogEst / activities.length) : 0}
                  </h3>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    INR
                  </span>
                </div>
                <p className="text-xs text-ink/50 mt-2">Mean cost per scheduled activity</p>
              </GlassCard>
            </div>

            {/* TAB 1: OVERVIEW */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Top Destinations */}
                <div className="lg:col-span-2 space-y-6">
                  <GlassCard className="p-7">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-clay">
                          Travel Trends
                        </span>
                        <h2 className="font-display text-2xl text-ink font-bold mt-1">
                          Most Popular Destinations
                        </h2>
                      </div>
                      <button
                        onClick={() => setActiveTab("destinations")}
                        className="text-xs font-semibold text-clay hover:underline cursor-pointer"
                      >
                        View All ({cities.length}) →
                      </button>
                    </div>

                    <div className="space-y-4">
                      {cities.slice(0, 5).map((c, i) => {
                        const score = c.popularity || (100 - i * 8);
                        return (
                          <div key={c.id} className="space-y-1.5">
                            <div className="flex justify-between items-center text-sm">
                              <span className="font-semibold text-ink">
                                {i + 1}. {c.name}, {c.country}
                              </span>
                              <div className="flex items-center gap-3 text-xs text-ink/60">
                                <span>🌡️ {c.weather_temp}</span>
                                <span className="font-bold text-clay">{score}% popularity</span>
                              </div>
                            </div>
                            <div className="w-full bg-paper-deep h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-clay to-amber-600 h-full rounded-full transition-all duration-500"
                                style={{ width: `${score}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </GlassCard>
                </div>

                {/* Recent Registrations Feed */}
                <div>
                  <GlassCard className="p-7">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="font-display text-2xl text-ink font-bold">Recent Travelers</h2>
                      <span className="text-xs bg-paper-deep px-2 py-1 rounded text-ink/60 font-semibold">
                        Latest
                      </span>
                    </div>

                    <div className="space-y-4">
                      {filteredUsers.length === 0 ? (
                        <div className="py-8 text-center text-xs text-ink/50 bg-paper-deep/50 rounded-xl border border-line/60">
                          <p className="font-semibold text-ink/70">No travelers registered yet.</p>
                          <p className="mt-1 text-[11px]">New traveler signups will appear here in real-time.</p>
                        </div>
                      ) : (
                        filteredUsers.slice(0, 6).map((u) => (
                          <div
                            key={u.id}
                            className="flex items-center gap-3 p-3 rounded-xl bg-white/60 border border-line"
                          >
                            <div className="w-10 h-10 rounded-full bg-clay text-white font-display text-sm font-bold flex items-center justify-center shrink-0">
                              {(u.name || u.username || "U").charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-bold text-ink truncate">
                                {u.name || u.username}
                              </p>
                              <p className="text-xs text-ink/50 truncate">{u.email}</p>
                            </div>
                            <span className="text-xs px-2 py-1 rounded-md bg-paper-deep text-ink/70 font-semibold shrink-0">
                              {u.trip_count ?? 0} {u.trip_count === 1 ? "trip" : "trips"}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </GlassCard>
                </div>
              </div>
            )}

            {/* TAB 2: USER DIRECTORY */}
            {activeTab === "users" && (
              <GlassCard className="p-7">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                  <div>
                    <h2 className="font-display text-2xl text-ink font-bold">Traveler Directory</h2>
                    <p className="text-xs text-ink/50">List of registered user accounts and trip stats.</p>
                  </div>
                  <input
                    type="text"
                    placeholder="Search by name, email, username..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full sm:w-72 bg-white border border-line rounded-lg px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-clay"
                  />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-line text-xs uppercase text-ink/50 font-semibold tracking-wider">
                        <th className="py-3 px-2">Traveler</th>
                        <th className="py-3 px-2">Email</th>
                        <th className="py-3 px-2">Trips Planned</th>
                        <th className="py-3 px-2">Joined</th>
                        <th className="py-3 px-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-xs text-ink/50 font-medium">
                            No registered travelers found. New user registrations will automatically list here.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => (
                          <tr key={u.id} className="hover:bg-white/40 transition">
                            <td className="py-3 px-2 font-bold text-ink">
                              <div className="flex items-center gap-2">
                                <span className="w-7 h-7 rounded-full bg-clay text-white text-xs font-bold flex items-center justify-center">
                                  {(u.name || u.username || "U").charAt(0).toUpperCase()}
                                </span>
                                <span>{u.name || u.username}</span>
                              </div>
                            </td>
                            <td className="py-3 px-2 text-ink/70">{u.email}</td>
                            <td className="py-3 px-2">
                              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-clay/10 text-clay">
                                {u.trip_count ?? 0} {u.trip_count === 1 ? "trip" : "trips"}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-xs text-ink/50">{formatDate(u.created_at || u.date_joined)}</td>
                            <td className="py-3 px-2">
                              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                                Active
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            )}

            {/* TAB 3: DESTINATIONS */}
            {activeTab === "destinations" && (
              <GlassCard className="p-7">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                  <div>
                    <h2 className="font-display text-2xl text-ink font-bold">Catalog Destinations</h2>
                    <p className="text-xs text-ink/50">
                      Showing {filteredCities.length} of {cities.length} global cities & destinations.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <select
                      value={cityCountryFilter}
                      onChange={(e) => setCityCountryFilter(e.target.value)}
                      className="bg-white border border-line rounded-lg px-3 py-2 text-xs text-ink outline-none focus:ring-2 focus:ring-clay cursor-pointer"
                    >
                      <option value="all">🌍 All Countries ({adminCountries.length})</option>
                      {adminCountries.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Search city, country..."
                      value={citySearch}
                      onChange={(e) => setCitySearch(e.target.value)}
                      className="w-full sm:w-56 bg-white border border-line rounded-lg px-3 py-2 text-xs text-ink outline-none focus:ring-2 focus:ring-clay"
                    />
                  </div>
                </div>

                {filteredCities.length === 0 ? (
                  <div className="p-12 text-center text-ink/60">
                    <p className="font-bold">No destinations match your filter.</p>
                    <button
                      onClick={() => {
                        setCitySearch("");
                        setCityCountryFilter("all");
                      }}
                      className="text-xs text-clay font-bold mt-2 hover:underline cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredCities.map((city) => (
                      <div
                        key={city.id}
                        className="rounded-xl border border-line bg-white/70 p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition"
                      >
                        <div>
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-display text-lg font-bold text-ink">{city.name}</h3>
                              <p className="text-xs text-ink/50 font-semibold">{city.country}</p>
                            </div>
                            <span className="text-xs px-2 py-0.5 bg-clay/10 text-clay font-bold rounded-full">
                              ★ {city.popularity}
                            </span>
                          </div>
                          <p className="text-xs text-ink/70 mt-2 line-clamp-2">{city.description}</p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-line text-xs text-ink/60 flex justify-between">
                          <span>🌡️ {city.weather_temp}</span>
                          <span>🗓️ {city.best_season}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </GlassCard>
            )}
          </>
        )}
      </main>
    </div>
  );
}
