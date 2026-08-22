import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import GlassCard from "../components/GlassCard";

export default function PublicSharedItineraryPage() {
  const { shareCode } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [trip, setTrip] = useState(null);
  const [budget, setBudget] = useState(null);
  const [travelers, setTravelers] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cloning, setCloning] = useState(false);

  useEffect(() => {
    async function loadPublicTrip() {
      try {
        setLoading(true);
        setError("");
        const res = await axios.get(`/trips/shared/${shareCode}/`);
        setTrip(res.data);

        // Fetch budget calculation
        if (res.data?.id) {
          try {
            const bRes = await axios.get(`/trips/${res.data.id}/budget/?travelers=${travelers}`);
            setBudget(bRes.data);
          } catch (bErr) {
            console.error("Budget fetch error", bErr);
          }
        }
      } catch (err) {
        setError("This shared trip could not be found or is not public.");
      } finally {
        setLoading(false);
      }
    }
    loadPublicTrip();
  }, [shareCode, travelers]);

  const copyShareLink = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Share link copied to clipboard!");
  };

  const handleClone = async () => {
    if (!isAuthenticated) {
      toast("Log in to clone this itinerary into your account.", { icon: "🔒" });
      navigate("/login");
      return;
    }
    setCloning(true);
    try {
      const res = await axios.post(`/trips/${trip.id}/clone/`);
      toast.success("Itinerary cloned to your trips!");
      navigate(`/trips/${res.data.id}`);
    } catch (err) {
      toast.error("Could not clone trip.");
    } finally {
      setCloning(false);
    }
  };

  const formatDate = (val) => {
    if (!val) return "";
    return new Date(val).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="text-ink/60 animate-pulse text-lg">Loading shared itinerary...</div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <div className="max-w-md mx-auto pt-36 px-6 text-center">
          <h2 className="font-display text-2xl text-ink mb-2">Trip Unavailable</h2>
          <p className="text-ink/60 mb-6">{error || "The itinerary link is invalid."}</p>
          <Link to="/">
            <Button variant="solid">Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper text-ink pb-20">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-24">
        {/* Banner Card */}
        <div className="rounded-3xl border border-line bg-gradient-to-br from-paper-deep via-white/80 to-paper p-8 shadow-sm mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <span className="text-xs uppercase tracking-widest text-clay font-bold">
              Shared Itinerary • by {trip.owner_name || "Traveler"}
            </span>
            <div className="flex gap-2">
              <Button variant="glass" onClick={copyShareLink} className="!text-xs">
                🔗 Copy Link
              </Button>
              <Button variant="solid" onClick={handleClone} loading={cloning} className="!text-xs">
                📋 Clone to My Trips
              </Button>
            </div>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl text-ink">{trip.name}</h1>
          <p className="text-ink/70 mt-2 text-base max-w-2xl">{trip.description || "A custom travel plan built with Chalo Chalein."}</p>

          <div className="flex flex-wrap gap-4 mt-6 text-xs text-ink/70">
            <span className="px-3 py-1.5 rounded-full bg-white/80 border border-line font-medium">
              🗓️ {formatDate(trip.start_date)} — {formatDate(trip.end_date)}
            </span>
            <span className="px-3 py-1.5 rounded-full bg-white/80 border border-line font-medium">
              📍 {trip.stops?.length || 0} Destination Stop(s)
            </span>
            <span className="px-3 py-1.5 rounded-full bg-white/80 border border-line font-medium">
              💰 Total Est: ₹{budget?.grand_total || 0}
            </span>
          </div>
        </div>

        {/* Budget Pulse Summary */}
        {budget && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <GlassCard className="p-5">
              <span className="text-xs uppercase tracking-wider text-ink/50">Total Budget</span>
              <p className="font-display text-3xl text-clay mt-1">₹{budget.grand_total}</p>
            </GlassCard>
            <GlassCard className="p-5">
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase tracking-wider text-ink/50">Per Person</span>
                <select
                  value={travelers}
                  onChange={(e) => setTravelers(parseInt(e.target.value, 10))}
                  className="bg-white border border-line rounded px-1.5 py-0.5 text-xs"
                >
                  {[1, 2, 3, 4, 5, 6, 8].map((n) => (
                    <option key={n} value={n}>
                      {n} person
                    </option>
                  ))}
                </select>
              </div>
              <p className="font-display text-3xl text-ink mt-1">₹{budget.per_person_total}</p>
            </GlassCard>
            <GlassCard className="p-5">
              <span className="text-xs uppercase tracking-wider text-ink/50">Duration</span>
              <p className="font-display text-3xl text-ink mt-1">{budget.trip_days} Days</p>
            </GlassCard>
          </div>
        )}

        {/* Stops & Schedule */}
        <div className="space-y-6">
          <h2 className="font-display text-2xl text-ink">Itinerary Schedule</h2>

          {trip.stops?.map((stop, idx) => (
            <div
              key={stop.id}
              className="rounded-2xl border border-line bg-white/70 backdrop-blur-md overflow-hidden shadow-sm"
            >
              <div className="p-5 bg-paper-deep/50 border-b border-line flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-clay text-white text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-bold text-ink">
                      {stop.city_detail?.name}, {stop.city_detail?.country}
                    </h3>
                    <p className="text-xs text-ink/60">
                      {formatDate(stop.start_date)} — {formatDate(stop.end_date)}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-clay">
                  Stay: ₹{stop.stay_cost}
                </span>
              </div>

              {stop.city_detail && (
                <div className="px-5 py-2.5 bg-white/40 border-b border-line/40 text-xs text-ink/60 flex flex-wrap gap-4">
                  <span>🌡️ {stop.city_detail.weather_temp}</span>
                  <span>🗓️ Best: {stop.city_detail.best_season}</span>
                  <span>🎒 {stop.city_detail.packing_tips}</span>
                </div>
              )}

              <div className="p-5 space-y-3">
                {(!stop.trip_activities || stop.trip_activities.length === 0) ? (
                  <p className="text-xs text-ink/40 italic">No specific activities scheduled for this stop.</p>
                ) : (
                  stop.trip_activities.map((act) => (
                    <div
                      key={act.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-line bg-paper/40 text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-clay px-2 py-0.5 rounded bg-clay/10">
                          {act.scheduled_time ? act.scheduled_time.slice(0, 5) : "Day"}
                        </span>
                        <div>
                          <p className="font-semibold text-ink">{act.title}</p>
                          <p className="text-xs text-ink/50 capitalize">{act.activity_type}</p>
                        </div>
                      </div>
                      <span className="font-bold text-emerald-700">
                        {parseFloat(act.cost) > 0 ? `₹${act.cost}` : "Free"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="mt-12 text-center text-xs text-ink/40">
          Planned with <Link to="/" className="text-clay hover:underline font-semibold">Chalo Chalein</Link> • Build your own trip in minutes.
        </div>
      </main>
    </div>
  );
}
