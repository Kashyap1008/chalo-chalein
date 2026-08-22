import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axios";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import TripCard from "../components/TripCard";
import GlassCard from "../components/GlassCard";

export default function TripListPage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // newest | oldest | budget_high | title

  useEffect(() => {
    let isMounted = true;

    async function fetchTrips() {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get("/trips/");
        const tripList = Array.isArray(res.data) ? res.data : (res.data?.results || []);
        if (isMounted) setTrips(tripList);
      } catch (err) {
        if (isMounted) setError("Couldn't load your trips. Try refreshing.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchTrips();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/trips/${id}/`);
      setTrips((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError("Couldn't delete that trip. Try again.");
    }
  };

  const filteredTrips = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return trips
      .filter((t) => {
        if (!q) return true;
        return (
          t.title?.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.stops?.some((s) => s.city_name?.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        if (sortBy === "newest") return new Date(b.created_at || b.start_date || 0) - new Date(a.created_at || a.start_date || 0);
        if (sortBy === "oldest") return new Date(a.created_at || a.start_date || 0) - new Date(b.created_at || b.start_date || 0);
        if (sortBy === "budget_high") return parseFloat(b.budget_limit || 0) - parseFloat(a.budget_limit || 0);
        if (sortBy === "title") return (a.title || "").localeCompare(b.title || "");
        return 0;
      });
  }, [trips, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-paper pb-20">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 pt-28 pb-16">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl text-ink font-bold">My Trips</h1>
            <p className="text-xs sm:text-sm text-ink/60 mt-1">
              Manage your custom multi-city itineraries and budget trackers.
            </p>
          </div>
          <Link to="/trips/new">
            <Button variant="solid" className="!px-5 !py-2.5 !text-xs font-bold">
              + Plan New Trip
            </Button>
          </Link>
        </div>

        {/* Filter & Search Bar */}
        {trips.length > 0 && (
          <GlassCard className="p-4 mb-8 flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 w-full">
              <input
                type="text"
                placeholder="Search trips by title or destination..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/80 border border-line rounded-xl px-3 py-2 text-xs text-ink outline-none focus:ring-2 focus:ring-clay"
              />
            </div>
            <div className="w-full sm:w-auto flex items-center gap-2 shrink-0">
              <span className="text-xs text-ink/50 font-bold uppercase tracking-wider">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white/80 border border-line rounded-xl px-3 py-2 text-xs text-ink outline-none focus:ring-2 focus:ring-clay cursor-pointer"
              >
                <option value="newest">🕒 Recently Created</option>
                <option value="oldest">⏳ Oldest First</option>
                <option value="budget_high">💰 Highest Budget</option>
                <option value="title">🔤 Title (A-Z)</option>
              </select>
            </div>
          </GlassCard>
        )}

        {error && (
          <div className="mb-6 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 rounded-[22px] bg-paper-deep animate-pulse" />
            ))}
          </div>
        )}

        {!loading && !error && trips.length === 0 && (
          <GlassCard className="p-12 text-center flex flex-col items-center justify-center gap-4">
            <span className="text-4xl">✈️</span>
            <h3 className="font-display text-xl font-bold text-ink">No trips planned yet</h3>
            <p className="text-xs text-ink/60 max-w-sm">
              Start by building your first multi-city adventure with automatic budget tracking.
            </p>
            <Link to="/trips/new">
              <Button variant="solid" className="!text-xs !py-2.5">
                + Start Planning Your First Trip
              </Button>
            </Link>
          </GlassCard>
        )}

        {!loading && !error && trips.length > 0 && filteredTrips.length === 0 && (
          <div className="text-center py-12 text-ink/60">
            <p className="font-bold">No trips match "{searchQuery}".</p>
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs text-clay font-bold mt-2 hover:underline cursor-pointer"
            >
              Clear Search
            </button>
          </div>
        )}

        {!loading && !error && filteredTrips.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
