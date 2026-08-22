import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import GlassCard from "../components/GlassCard";

const CATEGORY_NAMES = {
  sightseeing: "Sightseeing",
  food: "Food & Dining",
  adventure: "Adventure",
  culture: "Culture & Heritage",
  stay: "Stay & Accommodation",
  transport: "Transport",
  shopping: "Shopping",
  other: "Other",
};

// Regional neighboring map for intelligent related places
const RELATED_REGIONS = {
  "India": ["Nepal", "Thailand", "United Arab Emirates"],
  "Nepal": ["India", "Thailand", "Bhutan"],
  "Thailand": ["India", "Nepal", "Japan"],
  "France": ["Italy", "United Arab Emirates"],
  "Italy": ["France", "United Arab Emirates"],
  "Japan": ["Thailand", "Nepal"],
  "United Arab Emirates": ["India", "France"],
};

export default function DiscoverySearchPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [cities, setCities] = useState([]);
  const [activities, setActivities] = useState([]);
  const [userTrips, setUserTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [selectedCityId, setSelectedCityId] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Add to Trip Modal State
  const [activityToAddToTrip, setActivityToAddToTrip] = useState(null);
  const [selectedTripId, setSelectedTripId] = useState("");
  const [selectedStopId, setSelectedStopId] = useState("");
  const [selectedTripDetails, setSelectedTripDetails] = useState(null);
  const [addingToTrip, setAddingToTrip] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [cRes, aRes] = await Promise.all([
          axios.get("/catalog/cities/"),
          axios.get("/catalog/activities/"),
        ]);
        const cityList = Array.isArray(cRes.data) ? cRes.data : (cRes.data?.results || []);
        const actList = Array.isArray(aRes.data) ? aRes.data : (aRes.data?.results || []);
        setCities(cityList);
        setActivities(actList);

        if (isAuthenticated) {
          try {
            const tripsRes = await axios.get("/trips/");
            const tList = Array.isArray(tripsRes.data) ? tripsRes.data : (tripsRes.data?.results || []);
            setUserTrips(tList);
            if (tList.length > 0) {
              setSelectedTripId(tList[0].id);
            }
          } catch (e) {
            console.error("Trips load error", e);
          }
        }
      } catch (err) {
        toast.error("Failed to load catalog.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [isAuthenticated]);

  // Load detailed stops when a trip is selected in modal
  useEffect(() => {
    if (!selectedTripId) return;
    async function loadTripDetail() {
      try {
        const res = await axios.get(`/trips/${selectedTripId}/`);
        setSelectedTripDetails(res.data);
        if (res.data.stops?.length > 0) {
          setSelectedStopId(res.data.stops[0].id);
        } else {
          setSelectedStopId("");
        }
      } catch (e) {
        console.error("Trip detail error", e);
      }
    }
    loadTripDetail();
  }, [selectedTripId]);

  // Unique countries list
  const availableCountries = useMemo(() => {
    const set = new Set(cities.map((c) => c.country).filter(Boolean));
    return Array.from(set).sort();
  }, [cities]);

  // Cities filtered by selected country
  const countryCities = useMemo(() => {
    if (selectedCountry === "all") return cities;
    return cities.filter((c) => c.country?.toLowerCase() === selectedCountry.toLowerCase());
  }, [cities, selectedCountry]);

  // Nearby related countries
  const relatedCountries = useMemo(() => {
    if (selectedCountry === "all") return [];
    return RELATED_REGIONS[selectedCountry] || [];
  }, [selectedCountry]);

  // Filter activities
  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        act.name?.toLowerCase().includes(q) ||
        act.description?.toLowerCase().includes(q) ||
        act.city_name?.toLowerCase().includes(q);

      // Check country match
      const actCity = cities.find((c) => c.id === act.city);
      const matchCountry =
        selectedCountry === "all" ||
        actCity?.country?.toLowerCase() === selectedCountry.toLowerCase() ||
        q === actCity?.country?.toLowerCase();

      const matchCity =
        selectedCityId === "all" || act.city === parseInt(selectedCityId, 10);

      const matchCategory =
        selectedCategory === "all" || act.activity_type === selectedCategory;

      return matchSearch && matchCountry && matchCity && matchCategory;
    });
  }, [activities, cities, searchQuery, selectedCountry, selectedCityId, selectedCategory]);

  const handleOpenAddModal = (act) => {
    if (!isAuthenticated) {
      toast("Please log in to add activities directly to your trips.", { icon: "🔒" });
      navigate("/login");
      return;
    }
    setActivityToAddToTrip(act);
  };

  const handleConfirmAddToTrip = async (e) => {
    e.preventDefault();
    if (!selectedStopId) {
      toast.error("Please select a trip stop first (or add a stop in your itinerary builder).");
      return;
    }
    setAddingToTrip(true);
    try {
      await axios.post(`/trips/stops/${selectedStopId}/activities/`, {
        title: activityToAddToTrip.name,
        activity_type: activityToAddToTrip.activity_type || "sightseeing",
        cost: parseFloat(activityToAddToTrip.cost) || 0,
        activity: activityToAddToTrip.id,
      });
      toast.success(`"${activityToAddToTrip.name}" added to trip!`);
      setActivityToAddToTrip(null);
    } catch (err) {
      toast.error("Failed to add activity to trip.");
    } finally {
      setAddingToTrip(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper text-ink pb-20">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-24">
        {/* Header */}
        <div className="mb-8">
          <span className="text-xs uppercase tracking-[0.3em] text-clay font-bold">
            Destinations & Experiences
          </span>
          <h1 className="font-display text-4xl sm:text-5xl text-ink mt-1">
            Discover What’s Next.
          </h1>
          <p className="text-ink/60 max-w-xl text-sm sm:text-base mt-2">
            Search by country or city to find iconic landmarks, hidden gems, and nearby regional destinations.
          </p>
        </div>

        {/* Search & Country Filter Controls */}
        <GlassCard className="p-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-ink/50 font-bold mb-1">
                Search Keyword
              </label>
              <input
                type="text"
                placeholder="Search country, city, food..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/80 border border-line rounded-lg px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-clay"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-ink/50 font-bold mb-1">
                Country
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => {
                  setSelectedCountry(e.target.value);
                  setSelectedCityId("all");
                }}
                className="w-full bg-white/80 border border-line rounded-lg px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-clay"
              >
                <option value="all">🌍 All Countries</option>
                {availableCountries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-ink/50 font-bold mb-1">
                City Stop
              </label>
              <select
                value={selectedCityId}
                onChange={(e) => setSelectedCityId(e.target.value)}
                className="w-full bg-white/80 border border-line rounded-lg px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-clay"
              >
                <option value="all">All Cities in Selection</option>
                {countryCities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.country})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-ink/50 font-bold mb-1">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-white/80 border border-line rounded-lg px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-clay"
              >
                <option value="all">All Categories</option>
                {Object.entries(CATEGORY_NAMES).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </GlassCard>

        {/* Selected Country Spotlight & Related Nearby Countries */}
        {selectedCountry !== "all" && (
          <div className="mb-10 p-6 rounded-2xl bg-paper-deep/60 border border-line">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-clay font-bold">
                  Exploring Country
                </span>
                <h2 className="font-display text-2xl sm:text-3xl text-ink font-bold">
                  Places in {selectedCountry}
                </h2>
              </div>
              <button
                onClick={() => {
                  setSelectedCountry("all");
                  setSelectedCityId("all");
                }}
                className="text-xs font-semibold text-clay hover:underline"
              >
                Show All Countries ✕
              </button>
            </div>

            {/* Related Nearby Countries Pill Badges */}
            {relatedCountries.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap mb-5 text-xs">
                <span className="text-ink/60 font-medium">Nearby & Related Countries:</span>
                {relatedCountries.map((rc) => (
                  <button
                    key={rc}
                    onClick={() => {
                      setSelectedCountry(rc);
                      setSelectedCityId("all");
                    }}
                    className="px-3 py-1 rounded-full bg-white border border-line text-ink font-semibold hover:border-clay transition"
                  >
                    📍 {rc}
                  </button>
                ))}
              </div>
            )}

            {/* Cities in selected country */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {countryCities.map((city) => (
                <div
                  key={city.id}
                  onClick={() => setSelectedCityId(city.id.toString())}
                  className={`p-4 rounded-xl border transition cursor-pointer ${
                    selectedCityId === city.id.toString()
                      ? "bg-white border-clay shadow-md ring-2 ring-clay/20"
                      : "bg-white/80 border-line hover:border-clay/50"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-display text-lg font-bold text-ink">{city.name}</h3>
                      <p className="text-xs text-ink/50">{city.country}</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 bg-clay/10 text-clay font-bold rounded-full">
                      ★ {city.popularity}
                    </span>
                  </div>
                  <p className="text-xs text-ink/70 mt-2 line-clamp-2">{city.description}</p>
                  <div className="mt-3 pt-2 border-t border-line/60 text-xs text-ink/60 flex justify-between">
                    <span>🌡️ {city.weather_temp}</span>
                    <span>🗓️ {city.best_season}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Global Cities Grid (if All Countries is selected) */}
        {selectedCountry === "all" && !searchQuery && cities.length > 0 && (
          <div className="mb-12">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-display text-2xl text-ink font-bold">Featured Destinations Worldwide</h2>
              <span className="text-xs text-ink/50">Curated multi-country catalog</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {cities.slice(0, 6).map((city) => (
                <div
                  key={city.id}
                  onClick={() => {
                    setSelectedCountry(city.country);
                    setSelectedCityId(city.id.toString());
                  }}
                  className="rounded-2xl border border-line bg-white/70 overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer group"
                >
                  {city.image_url && (
                    <div className="h-40 overflow-hidden bg-paper-deep">
                      <img
                        src={city.image_url}
                        alt={city.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-display text-lg text-ink font-bold">{city.name}</h3>
                        <p className="text-xs text-clay font-semibold">📍 {city.country}</p>
                      </div>
                      <span className="text-xs px-2 py-1 bg-clay/10 text-clay font-bold rounded-full">
                        ★ {city.popularity || 90}
                      </span>
                    </div>
                    <p className="text-xs text-ink/70 mt-2 line-clamp-2">{city.description}</p>
                    <div className="mt-3 pt-2 border-t border-line text-xs text-ink/60 flex justify-between">
                      <span>🌡️ {city.weather_temp}</span>
                      <span>🗓️ {city.best_season}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activities Grid */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-display text-2xl text-ink font-bold">
              Curated Experiences ({filteredActivities.length})
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-12 text-ink/50 animate-pulse">Loading catalog...</div>
          ) : filteredActivities.length === 0 ? (
            <GlassCard className="p-12 text-center">
              <p className="text-ink/60">No activities match your filters.</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCountry("all");
                  setSelectedCityId("all");
                  setSelectedCategory("all");
                }}
                className="mt-3 text-sm text-clay font-semibold hover:underline"
              >
                Clear all filters
              </button>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredActivities.map((act) => (
                <div
                  key={act.id}
                  className="rounded-2xl border border-line bg-white/70 backdrop-blur-md p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition"
                >
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-clay/10 text-clay uppercase tracking-wider">
                        {CATEGORY_NAMES[act.activity_type] || act.activity_type}
                      </span>
                      <span className="text-xs font-medium text-ink/50">{act.city_name}</span>
                    </div>
                    <h3 className="font-display text-xl text-ink font-bold">{act.name}</h3>
                    <p className="text-xs text-ink/70 mt-2 line-clamp-3">
                      {act.description || "An iconic must-visit stop for travelers exploring this region."}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-line flex items-center justify-between">
                    <div>
                      <span className="text-xs text-ink/40 block">Estimated Cost</span>
                      <span className="text-base font-bold text-emerald-800">
                        {parseFloat(act.cost) > 0 ? `₹${act.cost}` : "Free"}
                      </span>
                    </div>
                    <Button
                      variant="solid"
                      onClick={() => handleOpenAddModal(act)}
                      className="!text-xs !py-1.5"
                    >
                      + Add to Trip
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* MODAL: Add Activity to User Trip */}
      {activityToAddToTrip && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <GlassCard className="w-full max-w-md p-6 bg-white/95 shadow-2xl">
            <h3 className="font-display text-2xl text-ink mb-2">Add to Itinerary</h3>
            <p className="text-sm text-ink/60 mb-4">
              Adding <strong>{activityToAddToTrip.name}</strong> (₹{activityToAddToTrip.cost})
            </p>

            {userTrips.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-ink/70 mb-4">You don't have any planned trips yet.</p>
                <Link to="/trips/new">
                  <Button variant="solid">Create a Trip First</Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleConfirmAddToTrip} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs uppercase font-semibold text-ink/60 mb-1">
                    Select Trip
                  </label>
                  <select
                    value={selectedTripId}
                    onChange={(e) => setSelectedTripId(e.target.value)}
                    className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none"
                  >
                    {userTrips.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase font-semibold text-ink/60 mb-1">
                    Select City Stop in Trip
                  </label>
                  {!selectedTripDetails?.stops || selectedTripDetails.stops.length === 0 ? (
                    <div className="p-3 bg-paper-deep/60 rounded-lg text-xs text-ink/70">
                      This trip doesn't have any stops yet. Open the trip editor to add your first stop.
                    </div>
                  ) : (
                    <select
                      value={selectedStopId}
                      onChange={(e) => setSelectedStopId(e.target.value)}
                      className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none"
                    >
                      {selectedTripDetails.stops.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.city_detail?.name || `Stop ${s.id}`}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="flex justify-end gap-3 mt-4">
                  <Button
                    type="button"
                    variant="glass"
                    onClick={() => setActivityToAddToTrip(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="solid"
                    loading={addingToTrip}
                    disabled={!selectedStopId}
                  >
                    Confirm Add
                  </Button>
                </div>
              </form>
            )}
          </GlassCard>
        </div>
      )}
    </div>
  );
}
