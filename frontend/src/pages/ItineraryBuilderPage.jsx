import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "../api/axios";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import GlassCard from "../components/GlassCard";
import Input from "../components/Input";

const ACTIVITY_TYPE_OPTIONS = [
  { value: "sightseeing", label: "Sightseeing" },
  { value: "food", label: "Food & Dining" },
  { value: "adventure", label: "Adventure" },
  { value: "culture", label: "Culture & Heritage" },
  { value: "stay", label: "Stay & Accommodation" },
  { value: "transport", label: "Transport" },
  { value: "shopping", label: "Shopping" },
  { value: "other", label: "Other" },
];

export default function ItineraryBuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [budget, setBudget] = useState(null);
  const [cities, setCities] = useState([]);
  const [catalogActivities, setCatalogActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [travelers, setTravelers] = useState(1);
  const [activeTab, setActiveTab] = useState("timeline"); // timeline | budget | settings

  // Modal States
  const [showAddStopModal, setShowAddStopModal] = useState(false);
  const [newStopForm, setNewStopForm] = useState({
    city: "",
    start_date: "",
    end_date: "",
    stay_cost: 0,
    notes: "",
  });

  const [selectedStopForActivity, setSelectedStopForActivity] = useState(null);
  const [showAddActivityModal, setShowAddActivityModal] = useState(false);
  const [newActivityForm, setNewActivityForm] = useState({
    title: "",
    activity_type: "sightseeing",
    cost: 0,
    scheduled_date: "",
    scheduled_time: "10:00",
    notes: "",
    activity: null,
  });

  const [editingTripForm, setEditingTripForm] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    cover_photo: "",
    is_public: false,
  });

  // Active stop object and country resolution for the Add Activity modal
  const activeStopObj = useMemo(() => {
    if (!trip || !selectedStopForActivity) return null;
    return trip.stops?.find((s) => s.id === selectedStopForActivity);
  }, [trip, selectedStopForActivity]);

  const activeStopCity = useMemo(() => {
    if (!activeStopObj) return null;
    return (
      cities.find((c) => c.id === activeStopObj.city) ||
      cities.find(
        (c) =>
          c.name?.toLowerCase() ===
          (activeStopObj.city_name || activeStopObj.custom_city_name)?.toLowerCase()
      )
    );
  }, [activeStopObj, cities]);

  // Filter catalog activities for this stop: City activities, Country activities, Global activities
  const { stopCityActivities, stopCountryActivities, stopOtherActivities } = useMemo(() => {
    if (!activeStopCity) {
      return {
        stopCityActivities: [],
        stopCountryActivities: [],
        stopOtherActivities: catalogActivities,
      };
    }

    const cityActs = [];
    const countryActs = [];
    const otherActs = [];

    catalogActivities.forEach((act) => {
      const actCity = cities.find((c) => c.id === act.city);
      const isSameCity =
        act.city === activeStopCity.id ||
        (activeStopCity.name && act.city_name?.toLowerCase() === activeStopCity.name.toLowerCase());

      const isSameCountry =
        (actCity?.country || act.country || "").toLowerCase() ===
        (activeStopCity.country || "").toLowerCase();

      if (isSameCity) {
        cityActs.push(act);
      } else if (isSameCountry) {
        countryActs.push(act);
      } else {
        otherActs.push(act);
      }
    });

    return {
      stopCityActivities: cityActs,
      stopCountryActivities: countryActs,
      stopOtherActivities: otherActs,
    };
  }, [catalogActivities, activeStopCity, cities]);

  // Fetch full trip data and budget
  const loadTripData = async () => {
    try {
      setError("");
      const [tripRes, budgetRes] = await Promise.all([
        axios.get(`/trips/${id}/`),
        axios.get(`/trips/${id}/budget/?travelers=${travelers}`),
      ]);
      setTrip(tripRes.data);
      setBudget(budgetRes.data);
      setEditingTripForm({
        name: tripRes.data.name || "",
        description: tripRes.data.description || "",
        start_date: tripRes.data.start_date || "",
        end_date: tripRes.data.end_date || "",
        cover_photo: tripRes.data.cover_photo || "",
        is_public: tripRes.data.is_public || false,
      });
    } catch (err) {
      setError("Failed to load trip details. It may not exist or you lack permission.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTripData();
  }, [id, travelers]);

  // Fetch cities and activities for catalog pickers
  useEffect(() => {
    async function loadCatalog() {
      try {
        const [cRes, aRes] = await Promise.all([
          axios.get("/catalog/cities/"),
          axios.get("/catalog/activities/"),
        ]);
        const cityList = Array.isArray(cRes.data) ? cRes.data : (cRes.data?.results || []);
        const actList = Array.isArray(aRes.data) ? aRes.data : (aRes.data?.results || []);
        setCities(cityList);
        setCatalogActivities(actList);
        if (cityList.length > 0) {
          setNewStopForm((prev) => ({ ...prev, city: cityList[0].id }));
        }
      } catch (err) {
        console.error("Catalog load error", err);
      }
    }
    loadCatalog();
  }, []);

  // Handle Add Stop
  const handleAddStop = async (e) => {
    e.preventDefault();
    if (!newStopForm.city) {
      toast.error("Please select a city.");
      return;
    }
    try {
      await axios.post(`/trips/${id}/stops/`, {
        city: parseInt(newStopForm.city, 10),
        start_date: newStopForm.start_date || null,
        end_date: newStopForm.end_date || null,
        stay_cost: parseFloat(newStopForm.stay_cost) || 0,
        notes: newStopForm.notes || "",
        order: (trip?.stops?.length || 0) + 1,
      });
      toast.success("Stop added successfully!");
      setShowAddStopModal(false);
      setNewStopForm({
        city: cities[0]?.id || "",
        start_date: "",
        end_date: "",
        stay_cost: 0,
        notes: "",
      });
      loadTripData();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not add stop.");
    }
  };

  // Handle Delete Stop
  const handleDeleteStop = async (stopId) => {
    if (!window.confirm("Are you sure you want to remove this stop and all its activities?")) return;
    try {
      await axios.delete(`/trips/stops/${stopId}/`);
      toast.success("Stop removed.");
      loadTripData();
    } catch (err) {
      toast.error("Failed to delete stop.");
    }
  };

  // Handle Add Activity to Stop
  const handleAddActivity = async (e) => {
    e.preventDefault();
    if (!newActivityForm.title.trim()) {
      toast.error("Please enter an activity title.");
      return;
    }
    try {
      await axios.post(`/trips/stops/${selectedStopForActivity}/activities/`, {
        title: newActivityForm.title,
        activity_type: newActivityForm.activity_type,
        cost: parseFloat(newActivityForm.cost) || 0,
        scheduled_date: newActivityForm.scheduled_date || null,
        scheduled_time: newActivityForm.scheduled_time || null,
        notes: newActivityForm.notes || "",
        activity: newActivityForm.activity || null,
      });
      toast.success("Activity added!");
      setShowAddActivityModal(false);
      setNewActivityForm({
        title: "",
        activity_type: "sightseeing",
        cost: 0,
        scheduled_date: "",
        scheduled_time: "10:00",
        notes: "",
        activity: null,
      });
      loadTripData();
    } catch (err) {
      toast.error("Failed to add activity.");
    }
  };

  // Handle Delete Activity
  const handleDeleteActivity = async (actId) => {
    try {
      await axios.delete(`/trips/activities/${actId}/`);
      toast.success("Activity removed.");
      loadTripData();
    } catch (err) {
      toast.error("Failed to delete activity.");
    }
  };

  // Handle Update Trip Basics
  const handleSaveTripBasics = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(`/trips/${id}/`, editingTripForm);
      toast.success("Trip details updated!");
      loadTripData();
    } catch (err) {
      toast.error("Could not update trip.");
    }
  };

  // Handle Clone Trip
  const handleCloneTrip = async () => {
    try {
      const res = await axios.post(`/trips/${id}/clone/`);
      toast.success("Trip duplicated successfully!");
      navigate(`/trips/${res.data.id}`);
    } catch (err) {
      toast.error("Could not clone trip.");
    }
  };

  // Copy share link
  const copyShareLink = () => {
    const shareUrl = `${window.location.origin}/share/${trip.share_code}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Public share link copied to clipboard!");
  };

  const formatDate = (val) => {
    if (!val) return "Flexible";
    return new Date(val).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="text-ink/60 animate-pulse text-lg">Loading itinerary builder...</div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <div className="max-w-md mx-auto pt-36 px-6 text-center">
          <h2 className="font-display text-2xl text-ink mb-2">Trip Not Found</h2>
          <p className="text-ink/60 mb-6">{error || "We couldn't locate this trip."}</p>
          <Link to="/trips">
            <Button variant="solid">Back to My Trips</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper text-ink pb-20">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-24">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-line">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs uppercase tracking-widest text-clay font-semibold">
                Itinerary Builder
              </span>
              <span className="text-xs text-ink/40">•</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${trip.is_public ? "bg-emerald-100 text-emerald-800" : "bg-ink/5 text-ink/60"}`}>
                {trip.is_public ? "Public" : "Private"}
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl text-ink">{trip.name}</h1>
            <p className="text-sm text-ink/60 mt-1">
              {formatDate(trip.start_date)} — {formatDate(trip.end_date)}
              {trip.description && ` • ${trip.description}`}
            </p>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="glass" onClick={copyShareLink} className="!text-xs">
              🔗 Share Link
            </Button>
            <Button variant="glass" onClick={handleCloneTrip} className="!text-xs">
              📋 Clone Trip
            </Button>
            <Button variant="solid" onClick={() => setShowAddStopModal(true)} className="!text-xs">
              + Add City Stop
            </Button>
          </div>
        </div>

        {/* Tab Navigation & Live Stats Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 my-6">
          <div className="flex gap-2 p-1 rounded-xl bg-paper-deep border border-line w-fit">
            <button
              onClick={() => setActiveTab("timeline")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${activeTab === "timeline" ? "bg-white text-ink shadow-sm" : "text-ink/60 hover:text-ink"}`}
            >
              Stops & Activities ({trip.stops?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("budget")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${activeTab === "budget" ? "bg-white text-ink shadow-sm" : "text-ink/60 hover:text-ink"}`}
            >
              Budget Breakdown (₹{budget?.grand_total || 0})
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${activeTab === "settings" ? "bg-white text-ink shadow-sm" : "text-ink/60 hover:text-ink"}`}
            >
              Settings
            </button>
          </div>

          <div className="flex items-center gap-4 text-xs text-ink/70">
            <div className="flex items-center gap-2">
              <span>Travelers:</span>
              <select
                value={travelers}
                onChange={(e) => setTravelers(parseInt(e.target.value, 10))}
                className="bg-white/80 border border-line rounded-md px-2 py-1 text-xs outline-none"
              >
                {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? "person" : "people"}
                  </option>
                ))}
              </select>
            </div>
            <div className="font-semibold text-clay">
              Total: ₹{budget?.grand_total || 0} (₹{budget?.per_person_total || 0}/person)
            </div>
          </div>
        </div>

        {/* TAB 1: STOPS & ACTIVITIES TIMELINE */}
        {activeTab === "timeline" && (
          <div className="space-y-6">
            {(!trip.stops || trip.stops.length === 0) && (
              <GlassCard className="p-12 text-center">
                <p className="text-ink/60 mb-4">You haven't added any city stops to this trip yet.</p>
                <Button variant="solid" onClick={() => setShowAddStopModal(true)}>
                  Add Your First Destination
                </Button>
              </GlassCard>
            )}

            {trip.stops?.map((stop, index) => (
              <div
                key={stop.id}
                className="rounded-2xl border border-line bg-white/70 backdrop-blur-md shadow-sm overflow-hidden"
              >
                {/* Stop Header */}
                <div className="p-5 bg-paper-deep/60 border-b border-line flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-clay text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="font-display text-xl text-ink">
                        {stop.city_detail?.name}, {stop.city_detail?.country}
                      </h3>
                      <p className="text-xs text-ink/60">
                        {formatDate(stop.start_date)} — {formatDate(stop.end_date)} • Stay Est: ₹{stop.stay_cost}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Button
                      variant="glass"
                      onClick={() => {
                        setSelectedStopForActivity(stop.id);
                        setShowAddActivityModal(true);
                      }}
                      className="!text-xs !py-1.5"
                    >
                      + Add Activity
                    </Button>
                    <button
                      onClick={() => handleDeleteStop(stop.id)}
                      className="text-xs text-red-600 hover:text-red-800 p-2"
                      title="Remove Stop"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Stop Content & Weather Tips */}
                {stop.city_detail && (
                  <div className="px-5 py-3 bg-white/40 border-b border-line/50 text-xs text-ink/70 flex flex-wrap gap-4">
                    <span>🌡️ {stop.city_detail.weather_temp} ({stop.city_detail.weather_condition})</span>
                    <span>🗓️ Best Season: {stop.city_detail.best_season}</span>
                    <span>🎒 Tips: {stop.city_detail.packing_tips}</span>
                  </div>
                )}

                {/* Activities List */}
                <div className="p-5 space-y-3">
                  {(!stop.trip_activities || stop.trip_activities.length === 0) ? (
                    <p className="text-xs text-ink/40 italic py-2">
                      No activities planned for this stop yet. Click "+ Add Activity" or explore the catalog.
                    </p>
                  ) : (
                    stop.trip_activities.map((act) => (
                      <div
                        key={act.id}
                        className="flex items-center justify-between gap-4 p-3 rounded-xl border border-line bg-paper/40 hover:bg-paper/80 transition"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono text-clay px-2 py-1 rounded bg-clay/10">
                            {act.scheduled_time ? act.scheduled_time.slice(0, 5) : "All Day"}
                          </span>
                          <div>
                            <p className="font-semibold text-sm text-ink">{act.title}</p>
                            <p className="text-xs text-ink/50 capitalize">
                              {act.activity_type} {act.notes && `• ${act.notes}`}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-sm font-bold text-emerald-700">
                            {parseFloat(act.cost) > 0 ? `₹${act.cost}` : "Free"}
                          </span>
                          <button
                            onClick={() => handleDeleteActivity(act.id)}
                            className="text-ink/40 hover:text-red-600 text-sm font-bold"
                            title="Delete activity"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: BUDGET BREAKDOWN */}
        {activeTab === "budget" && budget && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <GlassCard className="p-5">
                <span className="text-xs uppercase text-ink/50 tracking-wider">Grand Total</span>
                <p className="font-display text-3xl text-clay mt-1">₹{budget.grand_total}</p>
              </GlassCard>
              <GlassCard className="p-5">
                <span className="text-xs uppercase text-ink/50 tracking-wider">Per Person</span>
                <p className="font-display text-3xl text-ink mt-1">₹{budget.per_person_total}</p>
                <p className="text-xs text-ink/50 mt-1">Split across {travelers} traveler(s)</p>
              </GlassCard>
              <GlassCard className="p-5">
                <span className="text-xs uppercase text-ink/50 tracking-wider">Daily Average</span>
                <p className="font-display text-3xl text-ink mt-1">₹{budget.daily_average}</p>
                <p className="text-xs text-ink/50 mt-1">Over {budget.trip_days} trip days</p>
              </GlassCard>
              <GlassCard className="p-5">
                <span className="text-xs uppercase text-ink/50 tracking-wider">Daily Per Person</span>
                <p className="font-display text-3xl text-ink mt-1">₹{budget.daily_per_person}</p>
              </GlassCard>
            </div>

            {/* Category Breakdown */}
            <GlassCard className="p-6">
              <h3 className="font-display text-xl text-ink mb-4">Spend by Category</h3>
              <div className="space-y-3">
                {Object.entries(budget.by_category || {}).map(([cat, amount]) => {
                  const percent = budget.grand_total > 0 ? ((amount / budget.grand_total) * 100).toFixed(1) : 0;
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="capitalize">{cat}</span>
                        <span>₹{amount} ({percent}%)</span>
                      </div>
                      <div className="w-full bg-paper-deep h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-clay h-full rounded-full transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>

            {/* City Stop Breakdown */}
            <GlassCard className="p-6">
              <h3 className="font-display text-xl text-ink mb-4">Spend by City Stop</h3>
              <div className="divide-y divide-line">
                {budget.by_stop?.map((st) => (
                  <div key={st.stop_id} className="py-3 flex justify-between items-center text-sm">
                    <div>
                      <p className="font-semibold">{st.city}</p>
                      <p className="text-xs text-ink/50">Stay: ₹{st.stay_cost} • Activities: ₹{st.activities_cost}</p>
                    </div>
                    <span className="font-bold text-clay text-base">₹{st.total}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        )}

        {/* TAB 3: SETTINGS */}
        {activeTab === "settings" && (
          <GlassCard className="p-8 max-w-xl mx-auto">
            <h3 className="font-display text-2xl text-ink mb-6">Trip Settings</h3>
            <form onSubmit={handleSaveTripBasics} className="flex flex-col gap-4">
              <Input
                label="Trip Name"
                value={editingTripForm.name}
                onChange={(e) => setEditingTripForm({ ...editingTripForm, name: e.target.value })}
                required
              />
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    label="Start Date"
                    type="date"
                    value={editingTripForm.start_date}
                    onChange={(e) => setEditingTripForm({ ...editingTripForm, start_date: e.target.value })}
                  />
                </div>
                <div className="flex-1">
                  <Input
                    label="End Date"
                    type="date"
                    value={editingTripForm.end_date}
                    onChange={(e) => setEditingTripForm({ ...editingTripForm, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-1">Description</label>
                <textarea
                  value={editingTripForm.description}
                  onChange={(e) => setEditingTripForm({ ...editingTripForm, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-line bg-white/60 px-4 py-2 text-ink text-sm outline-none focus:ring-2 focus:ring-clay"
                />
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-paper-deep/60">
                <input
                  type="checkbox"
                  id="is_public"
                  checked={editingTripForm.is_public}
                  onChange={(e) => setEditingTripForm({ ...editingTripForm, is_public: e.target.checked })}
                  className="w-4 h-4 accent-clay"
                />
                <label htmlFor="is_public" className="text-sm font-medium cursor-pointer">
                  Make trip publicly viewable via share link
                </label>
              </div>

              <Button type="submit" variant="solid" className="mt-2">
                Save Settings
              </Button>
            </form>
          </GlassCard>
        )}
      </main>

      {/* MODAL: Add City Stop */}
      {showAddStopModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <GlassCard className="w-full max-w-md p-6 bg-white/95 shadow-2xl">
            <h3 className="font-display text-2xl text-ink mb-4">Add Destination Stop</h3>
            <form onSubmit={handleAddStop} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Select City</label>
                <select
                  value={newStopForm.city}
                  onChange={(e) => setNewStopForm({ ...newStopForm, city: e.target.value })}
                  className="w-full rounded-lg border border-line bg-white px-3 py-2 text-ink text-sm outline-none"
                  required
                >
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}, {c.country}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <Input
                    label="Arrival Date"
                    type="date"
                    value={newStopForm.start_date}
                    onChange={(e) => setNewStopForm({ ...newStopForm, start_date: e.target.value })}
                  />
                </div>
                <div className="flex-1">
                  <Input
                    label="Departure Date"
                    type="date"
                    value={newStopForm.end_date}
                    onChange={(e) => setNewStopForm({ ...newStopForm, end_date: e.target.value })}
                  />
                </div>
              </div>

              <Input
                label="Estimated Stay / Hotel Cost (₹)"
                type="number"
                min="0"
                step="0.01"
                value={newStopForm.stay_cost}
                onChange={(e) => setNewStopForm({ ...newStopForm, stay_cost: e.target.value })}
              />

              <Input
                label="Stop Notes (e.g. Hotel reservation #)"
                value={newStopForm.notes}
                onChange={(e) => setNewStopForm({ ...newStopForm, notes: e.target.value })}
              />

              <div className="flex justify-end gap-3 mt-4">
                <Button type="button" variant="glass" onClick={() => setShowAddStopModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="solid">
                  Add Stop
                </Button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* MODAL: Add Activity */}
      {showAddActivityModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <GlassCard className="w-full max-w-md p-6 bg-white/95 shadow-2xl">
            <h3 className="font-display text-2xl text-ink mb-4">Add Activity to Stop</h3>
            <form onSubmit={handleAddActivity} className="flex flex-col gap-4">
              {/* Optional Quick Pick from Catalog Filtered by Stop City & Country */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs uppercase tracking-wider font-bold text-ink/70">
                    Pick from Catalog (Optional)
                  </label>
                  {activeStopCity && (
                    <span className="text-[11px] font-bold text-clay bg-clay/10 px-2.5 py-0.5 rounded-full">
                      📍 {activeStopCity.name}, {activeStopCity.country}
                    </span>
                  )}
                </div>
                <select
                  onChange={(e) => {
                    const act = catalogActivities.find((a) => a.id === parseInt(e.target.value, 10));
                    if (act) {
                      setNewActivityForm({
                        ...newActivityForm,
                        title: act.name,
                        activity_type: act.activity_type || "sightseeing",
                        cost: act.cost,
                        activity: act.id,
                      });
                    }
                  }}
                  className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-ink text-xs font-semibold outline-none focus:ring-2 focus:ring-clay cursor-pointer"
                >
                  <option value="">-- Choose from Catalog or type custom below --</option>

                  {stopCityActivities.length > 0 && (
                    <optgroup label={`🌟 Curated in ${activeStopCity?.name || "this City"}`}>
                      {stopCityActivities.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} ({a.city_name}) — ₹{parseFloat(a.cost || 0).toLocaleString("en-IN")}
                        </option>
                      ))}
                    </optgroup>
                  )}

                  {stopCountryActivities.length > 0 && (
                    <optgroup label={`🇮🇳 Other Experiences in ${activeStopCity?.country || "this Country"}`}>
                      {stopCountryActivities.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} ({a.city_name}) — ₹{parseFloat(a.cost || 0).toLocaleString("en-IN")}
                        </option>
                      ))}
                    </optgroup>
                  )}

                  {stopOtherActivities.length > 0 && (
                    <optgroup label="🌍 Global Experiences">
                      {stopOtherActivities.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} ({a.city_name}) — ₹{parseFloat(a.cost || 0).toLocaleString("en-IN")}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              <Input
                label="Activity Title"
                value={newActivityForm.title}
                onChange={(e) => setNewActivityForm({ ...newActivityForm, title: e.target.value })}
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Type</label>
                  <select
                    value={newActivityForm.activity_type}
                    onChange={(e) => setNewActivityForm({ ...newActivityForm, activity_type: e.target.value })}
                    className="w-full rounded-lg border border-line bg-white px-3 py-2 text-ink text-sm outline-none"
                  >
                    {ACTIVITY_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Cost (₹)"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newActivityForm.cost}
                  onChange={(e) => setNewActivityForm({ ...newActivityForm, cost: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Date (Optional)"
                  type="date"
                  value={newActivityForm.scheduled_date}
                  onChange={(e) => setNewActivityForm({ ...newActivityForm, scheduled_date: e.target.value })}
                />
                <Input
                  label="Time"
                  type="time"
                  value={newActivityForm.scheduled_time}
                  onChange={(e) => setNewActivityForm({ ...newActivityForm, scheduled_time: e.target.value })}
                />
              </div>

              <Input
                label="Notes"
                value={newActivityForm.notes}
                onChange={(e) => setNewActivityForm({ ...newActivityForm, notes: e.target.value })}
              />

              <div className="flex justify-end gap-3 mt-4">
                <Button type="button" variant="glass" onClick={() => setShowAddActivityModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="solid">
                  Save Activity
                </Button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
