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

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [selectedCityId, setSelectedCityId] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("recommended"); // recommended | price_asc | price_desc | name_asc
  const [maxBudget, setMaxBudget] = useState(100000);

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
    return activities
      .filter((act) => {
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
      })
      .sort((a, b) => {
        const costA = parseFloat(a.cost || 0);
        const costB = parseFloat(b.cost || 0);
        if (sortBy === "price_asc") return costA - costB;
        if (sortBy === "price_desc") return costB - costA;
        if (sortBy === "name_asc") return (a.name || "").localeCompare(b.name || "");
        return 0; // recommended
      });
  }, [
    activities,
    cities,
    searchQuery,
    selectedCountry,
    selectedCityId,
    selectedCategory,
    sortBy,
  ]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCountry("all");
    setSelectedCityId("all");
    setSelectedCategory("all");
    setSortBy("recommended");
    setMaxBudget(100000);
  };

  const hasActiveFilters =
    searchQuery ||
    selectedCountry !== "all" ||
    selectedCityId !== "all" ||
    selectedCategory !== "all" ||
    sortBy !== "recommended" ||
    maxBudget < 100000;

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
            Filter by country, city, category, or budget to find iconic landmarks and experiences.
          </p>
        </div>

        {/* Filter Controls Panel */}
        <GlassCard className="p-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Input */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-ink/50 font-bold mb-1">
                Search Keyword
              </label>
              <input
                type="text"
                placeholder="Search country, city, activity..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/80 border border-line rounded-lg px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-clay"
              />
            </div>

            {/* Country Dropdown */}
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
                className="w-full bg-white/80 border border-line rounded-lg px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-clay cursor-pointer"
              >
                <option value="all">🌍 All Countries</option>
                {availableCountries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* City Stop Dropdown */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-ink/50 font-bold mb-1">
                City Stop
              </label>
              <select
                value={selectedCityId}
                onChange={(e) => setSelectedCityId(e.target.value)}
                className="w-full bg-white/80 border border-line rounded-lg px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-clay cursor-pointer"
              >
                <option value="all">All Cities in Selection ({countryCities.length})</option>
                {countryCities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.country})
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-ink/50 font-bold mb-1">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-white/80 border border-line rounded-lg px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-clay cursor-pointer"
              >
                <option value="recommended">✨ Recommended</option>
                <option value="price_asc">💰 Price: Low to High (₹)</option>
                <option value="price_desc">💎 Price: High to Low (₹)</option>
                <option value="name_asc">🔤 Alphabetical (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="mt-5 pt-4 border-t border-line/50">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs uppercase tracking-wider text-ink/50 font-bold">
                Filter by Category
              </span>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-clay font-bold hover:underline cursor-pointer"
                >
                  ✕ Clear All Filters
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                  selectedCategory === "all"
                    ? "bg-clay text-white shadow-xs"
                    : "bg-white/80 text-ink/70 hover:bg-white"
                }`}
              >
                All Categories ({activities.length})
              </button>
              {Object.entries(CATEGORY_NAMES).map(([slug, name]) => {
                const count = activities.filter((a) => a.activity_type === slug).length;
                return (
                  <button
                    key={slug}
                    onClick={() => setSelectedCategory(slug)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                      selectedCategory === slug
                        ? "bg-clay text-white shadow-xs"
                        : "bg-white/80 text-ink/70 hover:bg-white"
                    }`}
                  >
                    {name} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Country Suggestions / Spotlights */}
          {selectedCountry !== "all" && relatedCountries.length > 0 && (
            <div className="mt-4 pt-3 border-t border-line/40 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-ink/50 font-bold uppercase tracking-wider">
                Explore Neighboring Regions:
              </span>
              {relatedCountries.map((rc) => (
                <button
                  key={rc}
                  onClick={() => {
                    setSelectedCountry(rc);
                    setSelectedCityId("all");
                  }}
                  className="px-2.5 py-0.5 rounded-full bg-paper-deep text-ink font-semibold hover:bg-clay hover:text-white transition cursor-pointer"
                >
                  ✈ {rc}
                </button>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Results Counter Header */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs uppercase tracking-wider font-bold text-ink/60">
            Showing <strong>{filteredActivities.length}</strong> of {activities.length} experiences
            {selectedCountry !== "all" && ` in ${selectedCountry}`}
            {selectedCategory !== "all" && ` • ${CATEGORY_NAMES[selectedCategory]}`}
          </p>
        </div>

        {/* Activities Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 rounded-2xl bg-paper-deep animate-pulse" />
            ))}
          </div>
        ) : filteredActivities.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <span className="text-4xl">🔍</span>
            <h3 className="font-display text-xl text-ink font-bold mt-3">
              No matching activities found
            </h3>
            <p className="text-xs text-ink/60 mt-1 max-w-sm mx-auto">
              Try adjusting your search keyword, category, or country filters to see more results.
            </p>
            <Button
              variant="solid"
              onClick={handleResetFilters}
              className="mt-4 !text-xs !py-2"
            >
              Reset All Filters
            </Button>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredActivities.map((act) => {
              const actCity = cities.find((c) => c.id === act.city);
              return (
                <GlassCard
                  key={act.id}
                  className="p-5 flex flex-col justify-between hover:shadow-xl transition-all duration-200"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-clay/10 text-clay">
                        {CATEGORY_NAMES[act.activity_type] || act.activity_type}
                      </span>
                      <span className="font-display text-sm font-bold text-ink text-clay">
                        ₹{parseFloat(act.cost || 0).toLocaleString("en-IN")}
                      </span>
                    </div>

                    <h3 className="font-display text-lg font-bold text-ink leading-snug">
                      {act.name}
                    </h3>

                    <p className="text-xs text-ink/50 mt-1 font-semibold flex items-center gap-1">
                      <span>📍</span> {act.city_name || actCity?.name || "Destination"}, {actCity?.country || "Global"}
                    </p>

                    <p className="text-xs text-ink/70 mt-3 line-clamp-3 leading-relaxed">
                      {act.description || "An iconic travel experience curated for this destination."}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-line/60 flex items-center justify-between">
                    <span className="text-[11px] text-ink/50 font-medium">
                      ⏱ {act.estimated_duration ? `${act.estimated_duration} mins` : "Flexible duration"}
                    </span>
                    <Button
                      variant="glass"
                      onClick={() => handleOpenAddModal(act)}
                      className="!text-xs !py-1 !px-3 font-semibold hover:!bg-clay hover:!text-white"
                    >
                      + Add to Trip
                    </Button>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}

        {/* Add to Trip Modal */}
        {activityToAddToTrip && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <GlassCard className="w-full max-w-md p-6 bg-paper shadow-2xl">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-clay">
                    Add Experience to Trip
                  </span>
                  <h3 className="font-display text-xl text-ink font-bold">
                    {activityToAddToTrip.name}
                  </h3>
                  <p className="text-xs text-ink/60">
                    ₹{parseFloat(activityToAddToTrip.cost || 0).toLocaleString("en-IN")} • {activityToAddToTrip.city_name}
                  </p>
                </div>
                <button
                  onClick={() => setActivityToAddToTrip(null)}
                  className="text-ink/40 hover:text-ink text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {userTrips.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-xs text-ink/60 mb-4">
                    You don't have any trips created yet.
                  </p>
                  <Link to="/trips/new">
                    <Button variant="solid" className="!text-xs">
                      Create a Trip First →
                    </Button>
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleConfirmAddToTrip} className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-ink/50 font-bold mb-1">
                      Choose Itinerary
                    </label>
                    <select
                      value={selectedTripId}
                      onChange={(e) => setSelectedTripId(e.target.value)}
                      className="w-full bg-white border border-line rounded-lg px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-clay"
                    >
                      {userTrips.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-ink/50 font-bold mb-1">
                      Choose City Stop
                    </label>
                    {selectedTripDetails?.stops?.length > 0 ? (
                      <select
                        value={selectedStopId}
                        onChange={(e) => setSelectedStopId(e.target.value)}
                        className="w-full bg-white border border-line rounded-lg px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-clay"
                      >
                        {selectedTripDetails.stops.map((s, idx) => (
                          <option key={s.id} value={s.id}>
                            Stop {idx + 1}: {s.city_name || s.custom_city_name || "Destination"}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                        This trip doesn't have any stops yet. Please add a city stop in your itinerary builder.
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      type="button"
                      variant="glass"
                      onClick={() => setActivityToAddToTrip(null)}
                      className="flex-1 !text-xs !py-2"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="solid"
                      disabled={!selectedStopId || addingToTrip}
                      loading={addingToTrip}
                      className="flex-1 !text-xs !py-2"
                    >
                      Confirm & Add
                    </Button>
                  </div>
                </form>
              )}
            </GlassCard>
          </div>
        )}
      </main>
    </div>
  );
}
