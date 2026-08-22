import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const catalog = [
  { id: 1, name: 'Eiffel Tower', city: 'Paris', country: 'France', category: 'Landmark', cost: 22, duration: '2h', rating: 4.9, icon: '🗼', note: 'See the city sparkle from above.' },
  { id: 2, name: 'Louvre Museum', city: 'Paris', country: 'France', category: 'Culture', cost: 18, duration: '3h', rating: 4.8, icon: '🎨', note: 'A slow morning with the greats.' },
  { id: 3, name: 'Seine River Cruise', city: 'Paris', country: 'France', category: 'Experience', cost: 35, duration: '1.5h', rating: 4.7, icon: '🚤', note: 'The gentlest route through Paris.' },
  { id: 4, name: 'Colosseum', city: 'Rome', country: 'Italy', category: 'Historic', cost: 20, duration: '2h', rating: 4.9, icon: '🏛️', note: 'Walk through a living chapter of history.' },
  { id: 5, name: 'Trastevere Food Walk', city: 'Rome', country: 'Italy', category: 'Food', cost: 42, duration: '2.5h', rating: 4.8, icon: '🍝', note: 'Pasta, stories, and one more bite.' },
  { id: 6, name: 'Trevi Fountain', city: 'Rome', country: 'Italy', category: 'Landmark', cost: 0, duration: '1h', rating: 4.6, icon: '⛲', note: 'Make a wish, then keep wandering.' },
  { id: 7, name: 'Bamboo Grove', city: 'Kyoto', country: 'Japan', category: 'Nature', cost: 10, duration: '1.5h', rating: 4.9, icon: '🎋', note: 'A quiet reset among the bamboo.' },
  { id: 8, name: 'Sakura Market Night', city: 'Kyoto', country: 'Japan', category: 'Food', cost: 28, duration: '2h', rating: 4.7, icon: '🏮', note: 'Follow the lanterns and your appetite.' },
];

const DiscoverySearchPage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('All cities');
  const [category, setCategory] = useState('All types');
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState([]);
  const cities = ['All cities', ...new Set(catalog.map((item) => item.city))];
  const categories = ['All types', ...new Set(catalog.map((item) => item.category))];
  const results = useMemo(() => catalog.filter((item) => {
    const text = `${item.name} ${item.city} ${item.country} ${item.category}`.toLowerCase();
    return text.includes(query.trim().toLowerCase()) && (city === 'All cities' || item.city === city) && (category === 'All types' || item.category === category) && (filter === 'All' || (filter === 'Popular' && item.rating >= 4.8) || (filter === 'Free' && item.cost === 0));
  }), [query, city, category, filter]);
  const selectedActivities = catalog.filter((item) => selected.includes(item.id));
  const totalCost = selectedActivities.reduce((total, item) => total + item.cost, 0);
  const filtersApplied = Boolean(query.trim()) || city !== 'All cities' || category !== 'All types' || filter !== 'All';
  const toggleActivity = (activity) => setSelected((current) => {
    if (current.includes(activity.id)) return current.filter((id) => id !== activity.id);
    if (current.length >= 8) { toast.error('You can select up to 8 experiences.'); return current; }
    return [...current, activity.id];
  });
  const resetFilters = () => { setQuery(''); setCity('All cities'); setCategory('All types'); setFilter('All'); };
  const clearSelection = () => setSelected([]);
  const continueToItinerary = () => {
    if (!selected.length) { toast.error('Select an experience before building your itinerary.'); return; }
    localStorage.setItem('chalo:selected-experiences', JSON.stringify(selectedActivities));
    navigate('/itinerary-builder');
  };

  return (
  <main className="min-h-screen bg-[#07111f] text-white">
    {/* Ambient background */}
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute -left-32 top-20 h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="absolute right-0 top-[28rem] h-[420px] w-[420px] rounded-full bg-violet-500/10 blur-3xl" />
    </div>

    <div className="relative mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12 lg:py-14">

      {/* Brand */}
      <nav className="mb-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-2xl shadow-lg shadow-cyan-500/20">
            ✈️
          </div>

          <div>
            <h2 className="text-2xl font-black tracking-tight">
              Chalo-Chalein
            </h2>

            <p className="mt-1 text-xs tracking-wide text-slate-500">
              Plan. Explore. Travel.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/itinerary-builder')}
          className="rounded-2xl border border-slate-700 bg-slate-900/80 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:border-cyan-400 hover:text-white"
        >
          My Itinerary
        </button>
      </nav>

      {/* Hero */}
      <section className="mb-20 grid gap-12 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
        <div>
          <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">
            Explore your next destination
          </span>

          <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            Build a trip
            <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
              {' '}you’ll actually remember.
            </span>
          </h1>

          <p className="mt-7 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">
            Discover local experiences, iconic landmarks, food spots and hidden
            gems. Save what you love and turn it into a personalised itinerary.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <span className="rounded-full border border-slate-800 bg-slate-900/70 px-4 py-2.5 text-sm text-slate-400">
              🌍 Multi-city planning
            </span>

            <span className="rounded-full border border-slate-800 bg-slate-900/70 px-4 py-2.5 text-sm text-slate-400">
              💰 Budget-aware
            </span>

            <span className="rounded-full border border-slate-800 bg-slate-900/70 px-4 py-2.5 text-sm text-slate-400">
              📅 Itinerary builder
            </span>
          </div>
        </div>

        {/* Trip summary */}
        <aside className="rounded-[2rem] border border-cyan-400/20 bg-gradient-to-br from-cyan-400/10 via-slate-900/80 to-blue-500/5 p-7 shadow-2xl shadow-black/20 lg:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
            Your trip so far
          </p>

          <div className="mt-7 grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
              <p className="text-xs text-slate-500">
                Activities
              </p>

              <p className="mt-3 text-3xl font-black">
                {selected.length}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
              <p className="text-xs text-slate-500">
                Estimated cost
              </p>

              <p className="mt-3 text-3xl font-black text-emerald-300">
                ${totalCost}
              </p>
            </div>
          </div>

          <p className="mt-6 text-sm leading-6 text-slate-500">
            Add activities now and continue building your itinerary when you're ready.
          </p>
        </aside>
      </section>

      {/* Search and filters */}
      <section className="mb-14 rounded-[2rem] border border-slate-800 bg-slate-900/75 p-6 shadow-xl shadow-black/10 backdrop-blur sm:p-8">
        <div className="mb-7">
          <h2 className="text-2xl font-black">
            Discover experiences
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
            Search by destination, activity type or experience category.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_220px]">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search Paris, Kyoto, food, museum..."
            maxLength={60}
            className="rounded-2xl border border-slate-700 bg-slate-950 px-5 py-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/10"
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
          <div className="flex flex-wrap gap-3">
            {['All', 'Popular', 'Free'].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={`rounded-full border px-5 py-2.5 text-xs font-bold transition ${
                  filter === value
                    ? 'border-cyan-400 bg-cyan-400/10 text-cyan-200'
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
              className="text-sm font-semibold text-slate-400 transition hover:text-white"
            >
              Reset filters
            </button>
          )}
        </div>
      </section>

      {/* Selected activities */}
      {selectedActivities.length > 0 && (
        <section className="mb-14 rounded-[2rem] border border-blue-400/20 bg-blue-400/5 p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
                Added to trip
              </p>

              <p className="mt-2 text-base text-slate-400">
                {selectedActivities.length} activities selected
              </p>
            </div>

            <button
              type="button"
              onClick={clearSelection}
              className="text-sm font-semibold text-slate-400 hover:text-red-300"
            >
              Clear all
            </button>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {selectedActivities.map((activity) => (
              <button
                key={activity.id}
                type="button"
                onClick={() => toggleActivity(activity)}
                className="rounded-full border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-300 transition hover:border-red-400 hover:text-red-300"
              >
                {activity.icon} {activity.name} ×
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Results heading */}
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-black">
            Recommended for your trip
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Showing {results.length} experiences
          </p>
        </div>

        <button
          type="button"
          disabled={!selected.length}
          onClick={continueToItinerary}
          className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
        >
          Build itinerary with {selected.length} →
        </button>
      </div>

      {/* Cards */}
      {results.length > 0 ? (
        <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
          {results.map((item) => {
            const isSelected = selected.includes(item.id);

            return (
              <article
                key={item.id}
                className={`group overflow-hidden rounded-[2rem] border bg-slate-900/80 transition duration-300 hover:-translate-y-1 ${
                  isSelected
                    ? 'border-cyan-400 shadow-xl shadow-cyan-500/10'
                    : 'border-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="relative flex h-52 items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                  <span className="text-8xl transition duration-300 group-hover:scale-110">
                    {item.icon}
                  </span>

                  <span className="absolute left-5 top-5 rounded-full bg-slate-950/75 px-3 py-1.5 text-xs text-slate-300">
                    📍 {item.city}, {item.country}
                  </span>

                  <span className="absolute right-5 top-5 rounded-full bg-slate-950/75 px-3 py-1.5 text-xs font-bold text-amber-300">
                    ★ {item.rating}
                  </span>
                </div>

                <div className="p-7">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                    {item.category}
                  </p>

                  <h3 className="mt-3 text-2xl font-black">
                    {item.name}
                  </h3>

                  <p className="mt-4 min-h-[72px] text-sm leading-6 text-slate-400">
                    {item.note}
                  </p>

                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                      <p className="text-xs text-slate-600">
                        Duration
                      </p>

                      <p className="mt-2 font-bold">
                        {item.duration}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                      <p className="text-xs text-slate-600">
                        Cost
                      </p>

                      <p className="mt-2 font-bold text-emerald-300">
                        {item.cost ? `$${item.cost}` : 'Free'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleActivity(item)}
                    className={`mt-6 w-full rounded-2xl px-4 py-3.5 text-sm font-bold transition ${
                      isSelected
                        ? 'bg-cyan-400/15 text-cyan-200 ring-1 ring-cyan-400'
                        : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                    }`}
                  >
                    {isSelected
                      ? '✓ Added to trip'
                      : '+ Add to trip'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-[2rem] border border-dashed border-slate-700 py-20 text-center">
          <div className="text-6xl">
            🧭
          </div>

          <h3 className="mt-6 text-2xl font-black">
            No experiences found
          </h3>

          <p className="mt-3 text-sm text-slate-500">
            Try changing the destination or activity filters.
          </p>

          <button
            type="button"
            onClick={resetFilters}
            className="mt-6 rounded-2xl bg-slate-800 px-5 py-3 text-sm font-bold hover:bg-slate-700"
          >
            Reset search
          </button>
        </div>
      )}
    </div>
  </main>
);

};

export default DiscoverySearchPage;