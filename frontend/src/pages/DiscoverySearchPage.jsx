import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';

const fallbackCatalog = [
  { id: 101, name: 'Solang Valley Paragliding', city: 'Manali', country: 'India', category: 'Adventure', cost: 3000, duration: '3h', rating: 4.9, icon: '🪂', note: 'Soar over snow-clad Himalayan peaks and valleys.', weather: '12°C · Crisp & Snowy', bestSeason: 'Oct – Mar', packing: 'Heavy woolens, thermal inners, trekking boots' },
  { id: 102, name: 'Scuba Diving at Grand Island', city: 'Goa', country: 'India', category: 'Adventure', cost: 4500, duration: '6h', rating: 4.8, icon: '🤿', note: 'Underwater coral reef exploration and marine life encounter.', weather: '29°C · Tropical Beach Sun', bestSeason: 'Nov – Feb', packing: 'Swimwear, sunscreen SPF 50+, sunglasses' },
  { id: 103, name: 'Amer Fort & Royal Light Show', city: 'Jaipur', country: 'India', category: 'Culture', cost: 500, duration: '3.5h', rating: 4.9, icon: '🏰', note: 'Grand fortress on Maota Lake with evening sound & light show.', weather: '26°C · Warm & Royal', bestSeason: 'Oct – Mar', packing: 'Cotton kurtas, walking shoes, sun hat' },
  { id: 104, name: 'Sunrise Ganges Boat Ride', city: 'Varanasi', country: 'India', category: 'Sightseeing', cost: 600, duration: '2h', rating: 4.9, icon: '🪔', note: 'Peaceful dawn boat ride watching morning prayers along the holy ghats.', weather: '22°C · Misty Holy Waters', bestSeason: 'Nov – Mar', packing: 'Modest temple attire, slip-on shoes, scarf' },
  { id: 105, name: 'Lake Pichola Sunset Cruise', city: 'Udaipur', country: 'India', category: 'Sightseeing', cost: 900, duration: '2h', rating: 4.8, icon: '⛵', note: 'Romantic boat ride visiting Jagmandir with palace views.', weather: '25°C · Lakeside Breeze', bestSeason: 'Sep – Mar', packing: 'Smart casuals, light jacket, camera' },
  { id: 106, name: 'Pangong Tso Lakeside Camping', city: 'Leh-Ladakh', country: 'India', category: 'Adventure', cost: 3500, duration: '12h', rating: 5.0, icon: '🌌', note: 'Stargazing under the Milky Way by the world-famous high-altitude blue lake.', weather: '8°C · Alpine Crisp Sky', bestSeason: 'May – Sep', packing: 'High-altitude fleece, UV sunglasses, Diamox' },
  { id: 107, name: 'Kolukkumalai Sunrise Jeep Safari', city: 'Munnar', country: 'India', category: 'Adventure', cost: 2200, duration: '4.5h', rating: 4.9, icon: '🍃', note: 'Cloud-bed sunrise at world’s highest organic tea plantation.', weather: '18°C · Cool Misty Hills', bestSeason: 'Sep – May', packing: 'Light sweater, umbrella, hiking shoes' },
  { id: 108, name: 'Ganga White Water Rafting', city: 'Rishikesh', country: 'India', category: 'Adventure', cost: 1200, duration: '3.5h', rating: 4.8, icon: '🚣', note: 'Tackle Grade III rapids along Himalayan mountain gorges.', weather: '23°C · Riverside Zen', bestSeason: 'Sep – Jun', packing: 'Quick-dry clothes, river sandals, waterproof bag' },
  { id: 109, name: 'Sunrise Taj Mahal Guided Tour', city: 'Agra', country: 'India', category: 'Culture', cost: 1100, duration: '3h', rating: 4.9, icon: '🕌', note: 'Marvel at the marble monument of eternal love in morning golden light.', weather: '24°C · Mughal Heritage Sun', bestSeason: 'Oct – Mar', packing: 'Breathable cottons, sun hat, sunglasses' },
  { id: 110, name: 'Golden Temple & Langar Experience', city: 'Amritsar', country: 'India', category: 'Culture', cost: 0, duration: '3h', rating: 5.0, icon: '🛕', note: 'Soulful community meal and meditation by the sacred Amrit Sarovar.', weather: '21°C · Golden Sunset', bestSeason: 'Oct – Mar', packing: 'Headscarf / bandana, slip-ons, shawl' },
];

const categoryIcons = {
  adventure: '🪂',
  culture: '🏰',
  sightseeing: '🗺️',
  food: '🍲',
  shopping: '🛍️',
  stay: '🏨',
  transport: '🚗',
  other: '✨',
};

const DiscoverySearchPage = () => {
  const navigate = useNavigate();
  const [catalog, setCatalog] = useState(fallbackCatalog);
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('All cities');
  const [category, setCategory] = useState('All types');
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCatalog = async () => {
      setLoading(true);
      try {
        const res = await api.get('/catalog/cities/');
        if (res.data?.results && res.data.results.length > 0) {
          const items = [];
          res.data.results.forEach((cityObj) => {
            if (cityObj.activities && cityObj.activities.length > 0) {
              cityObj.activities.forEach((act) => {
                items.push({
                  id: act.id,
                  name: act.name,
                  city: cityObj.name,
                  country: cityObj.country,
                  category: act.activity_type ? act.activity_type.charAt(0).toUpperCase() + act.activity_type.slice(1) : 'Experience',
                  cost: Number(act.cost || 0),
                  duration: `${act.duration_hours || 2}h`,
                  rating: 4.9,
                  icon: categoryIcons[act.activity_type?.toLowerCase()] || '✨',
                  note: act.description || `Discover the best of ${act.name} in ${cityObj.name}.`,
                  weather: `${cityObj.weather_temp || '24°C'} · ${cityObj.weather_condition || 'Pleasant'}`,
                  bestSeason: cityObj.best_season || 'Oct – Mar',
                  packing: cityObj.packing_tips || 'Walking shoes, camera, light jacket',
                });
              });
            }
          });
          if (items.length > 0) {
            setCatalog(items);
          }
        }
      } catch (err) {
        console.warn('Using local fallback catalog data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  const cities = ['All cities', ...new Set(catalog.map((item) => item.city))];
  const categories = ['All types', ...new Set(catalog.map((item) => item.category))];

  const results = useMemo(() => catalog.filter((item) => {
    const text = `${item.name} ${item.city} ${item.country} ${item.category}`.toLowerCase();
    return text.includes(query.trim().toLowerCase())
      && (city === 'All cities' || item.city === city)
      && (category === 'All types' || item.category === category)
      && (filter === 'All' || (filter === 'Popular' && item.rating >= 4.8) || (filter === 'Free' && item.cost === 0));
  }), [catalog, query, city, category, filter]);

  const selectedActivities = catalog.filter((item) => selected.includes(item.id));
  const totalCost = selectedActivities.reduce((total, item) => total + item.cost, 0);
  const filtersApplied = Boolean(query.trim()) || city !== 'All cities' || category !== 'All types' || filter !== 'All';

  const toggleActivity = (activity) => setSelected((current) => {
    if (current.includes(activity.id)) return current.filter((id) => id !== activity.id);
    if (current.length >= 8) {
      toast.error('You can select up to 8 experiences.');
      return current;
    }
    toast.success(`Added ${activity.name} to itinerary selection!`);
    return [...current, activity.id];
  });

  const resetFilters = () => {
    setQuery('');
    setCity('All cities');
    setCategory('All types');
    setFilter('All');
  };

  const clearSelection = () => setSelected([]);

  const continueToItinerary = () => {
    if (!selected.length) {
      toast.error('Select an experience before building your itinerary.');
      return;
    }
    localStorage.setItem('chalo:selected-experiences', JSON.stringify(selectedActivities));
    navigate('/builder');
  };

  return (
    <main className="min-h-screen bg-[#07111f] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-20 h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute right-0 top-[28rem] h-[420px] w-[420px] rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
        
        {/* Brand Bar */}
        <nav className="mb-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-2xl shadow-lg shadow-cyan-500/20">
              ✈️
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">Chalo-Chalein</h2>
              <p className="mt-0.5 text-xs tracking-wide text-cyan-400 font-medium">Smart Travel Catalog & Discovery</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/builder')}
            className="rounded-2xl border border-cyan-500/30 bg-slate-900/80 px-5 py-2.5 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-950/60 hover:text-white"
          >
            My Itinerary Studio →
          </button>
        </nav>

        {/* Hero Section */}
        <section className="mb-16 grid gap-12 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
          <div>
            <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">
              Explore 10 Iconic Indian Destinations
            </span>

            <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[1.1] tracking-tight sm:text-6xl">
              Build a journey
              <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                {' '}you’ll never forget.
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
              Explore authentic adventures, palace walks, holy river aartis, and mountain safaris with live climate intelligence and transparent pricing.
            </p>

            <div className="mt-7 flex flex-wrap gap-2.5">
              <span className="rounded-full border border-slate-800 bg-slate-900/70 px-3.5 py-2 text-xs font-medium text-slate-300">
                🌤️ Live Weather Badges
              </span>
              <span className="rounded-full border border-slate-800 bg-slate-900/70 px-3.5 py-2 text-xs font-medium text-slate-300">
                🎒 Smart Packing Tips
              </span>
              <span className="rounded-full border border-slate-800 bg-slate-900/70 px-3.5 py-2 text-xs font-medium text-slate-300">
                👥 Group Budget Split
              </span>
            </div>
          </div>

          {/* Trip Selection Snapshot */}
          <aside className="rounded-[2.5rem] border border-cyan-400/25 bg-gradient-to-br from-cyan-400/15 via-slate-900/90 to-blue-500/10 p-7 shadow-2xl backdrop-blur-xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
              Your Itinerary Cart
            </p>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
                <p className="text-xs text-slate-400">Activities Added</p>
                <p className="mt-2 text-3xl font-black text-white">{selected.length}</p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
                <p className="text-xs text-slate-400">Estimated Total</p>
                <p className="mt-2 text-3xl font-black text-emerald-400">
                  ₹{totalCost.toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={!selected.length}
              onClick={continueToItinerary}
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-400/20 transition hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
            >
              Continue to Itinerary Builder ({selected.length}) →
            </button>
          </aside>
        </section>

        {/* Search & Filters */}
        <section className="mb-12 rounded-[2rem] border border-slate-800 bg-slate-900/75 p-6 shadow-xl backdrop-blur sm:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-white">Find Curated Experiences</h2>
              <p className="mt-1 text-xs text-slate-400">Filter by destination, activity style, or best visiting season.</p>
            </div>
            {loading && <span className="text-xs text-cyan-400 animate-pulse">Loading live catalog...</span>}
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_220px]">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search Manali, Goa, rafting, safari..."
              maxLength={60}
              className="rounded-2xl border border-slate-700 bg-slate-950 px-5 py-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400"
            />

            <select
              value={city}
              onChange={(event) => setCity(event.target.value)}
              className="rounded-2xl border border-slate-700 bg-slate-950 px-5 py-4 text-sm text-slate-300 outline-none focus:border-cyan-400"
            >
              {cities.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>

            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="rounded-2xl border border-slate-700 bg-slate-950 px-5 py-4 text-sm text-slate-300 outline-none focus:border-cyan-400"
            >
              {categories.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2.5">
              {['All', 'Popular', 'Free'].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  className={`rounded-full border px-4 py-2 text-xs font-bold transition ${
                    filter === value
                      ? 'border-cyan-400 bg-cyan-400/15 text-cyan-300'
                      : 'border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>

            {filtersApplied && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-semibold text-slate-400 transition hover:text-white"
              >
                Reset filters ×
              </button>
            )}
          </div>
        </section>

        {/* Selected Activities Bar */}
        {selectedActivities.length > 0 && (
          <section className="mb-12 rounded-[2rem] border border-cyan-400/20 bg-cyan-950/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                Selected for Itinerary ({selectedActivities.length})
              </p>
              <button
                type="button"
                onClick={clearSelection}
                className="text-xs font-semibold text-slate-400 hover:text-rose-300"
              >
                Clear all
              </button>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {selectedActivities.map((activity) => (
                <button
                  key={activity.id}
                  type="button"
                  onClick={() => toggleActivity(activity)}
                  className="rounded-full border border-cyan-500/40 bg-slate-950 px-3.5 py-1.5 text-xs text-slate-200 transition hover:border-rose-400 hover:text-rose-300"
                >
                  {activity.icon} {activity.name} (₹{activity.cost}) ×
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {results.map((item) => {
            const isSelected = selected.includes(item.id);

            return (
              <article
                key={item.id}
                className={`group overflow-hidden rounded-3xl border bg-slate-900/80 transition duration-300 hover:-translate-y-1 backdrop-blur-md ${
                  isSelected
                    ? 'border-cyan-400 shadow-xl shadow-cyan-500/10 ring-1 ring-cyan-400'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="relative flex h-48 items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950">
                  <span className="text-7xl transition duration-300 group-hover:scale-110">
                    {item.icon}
                  </span>

                  <span className="absolute left-4 top-4 rounded-full bg-slate-950/80 px-3 py-1 text-xs font-semibold text-slate-200 border border-slate-800">
                    📍 {item.city}, {item.country}
                  </span>

                  <span className="absolute right-4 top-4 rounded-full bg-slate-950/80 px-2.5 py-1 text-xs font-bold text-amber-300 border border-slate-800">
                    ★ {item.rating}
                  </span>

                  {item.weather && (
                    <span className="absolute bottom-3 left-4 rounded-full bg-slate-950/85 px-3 py-1 text-[11px] font-medium text-cyan-300 border border-slate-800">
                      🌤️ {item.weather}
                    </span>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                      {item.category}
                    </span>
                    {item.bestSeason && (
                      <span className="text-[11px] text-slate-400">
                        🗓️ {item.bestSeason}
                      </span>
                    )}
                  </div>

                  <h3 className="mt-2.5 text-xl font-bold text-white group-hover:text-cyan-200 transition">
                    {item.name}
                  </h3>

                  <p className="mt-2 min-h-[48px] text-xs leading-relaxed text-slate-400">
                    {item.note}
                  </p>

                  {item.packing && (
                    <div className="mt-3 rounded-xl bg-slate-950/50 p-2.5 text-[11px] text-slate-400 border border-slate-800/80">
                      <span className="text-indigo-300 font-semibold">🎒 Pack: </span>
                      <span className="truncate">{item.packing}</span>
                    </div>
                  )}

                  <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-800/80 pt-4">
                    <div>
                      <p className="text-[11px] text-slate-500">Duration</p>
                      <p className="font-bold text-sm text-slate-200">{item.duration}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-slate-500">Cost</p>
                      <p className="font-bold text-sm text-emerald-400">
                        {item.cost ? `₹${item.cost.toLocaleString('en-IN')}` : 'Free'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleActivity(item)}
                    className={`mt-5 w-full rounded-xl py-2.5 text-xs font-bold transition ${
                      isSelected
                        ? 'bg-cyan-400 text-slate-950 shadow-md shadow-cyan-400/20'
                        : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                    }`}
                  >
                    {isSelected ? '✓ Added to Itinerary' : '+ Add to Itinerary'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
};

export default DiscoverySearchPage;