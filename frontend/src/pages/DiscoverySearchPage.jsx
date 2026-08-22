import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const MAX_SELECTIONS = 8;

const catalog = [
  {
    id: 1,
    name: 'Eiffel Tower',
    city: 'Paris',
    country: 'France',
    category: 'Landmark',
    cost: 22,
    duration: '2h',
    rating: 4.9,
    color: 'from-cyan-400/30 via-blue-500/20 to-indigo-500/10',
    note: 'See the city sparkle from above.',
    emoji: '🗼',
  },
  {
    id: 2,
    name: 'Louvre Museum',
    city: 'Paris',
    country: 'France',
    category: 'Culture',
    cost: 18,
    duration: '3h',
    rating: 4.8,
    color: 'from-amber-400/30 via-orange-500/20 to-yellow-500/10',
    note: 'A slow morning with the greats.',
    emoji: '🎨',
  },
  {
    id: 3,
    name: 'Seine River Cruise',
    city: 'Paris',
    country: 'France',
    category: 'Experience',
    cost: 35,
    duration: '1.5h',
    rating: 4.7,
    color: 'from-indigo-400/30 via-cyan-500/20 to-blue-500/10',
    note: 'The gentlest route through Paris.',
    emoji: '🚤',
  },
  {
    id: 4,
    name: 'Colosseum',
    city: 'Rome',
    country: 'Italy',
    category: 'Historic',
    cost: 20,
    duration: '2h',
    rating: 4.9,
    color: 'from-rose-400/30 via-orange-500/20 to-red-500/10',
    note: 'Walk through a living chapter of history.',
    emoji: '🏛️',
  },
  {
    id: 5,
    name: 'Trastevere Food Walk',
    city: 'Rome',
    country: 'Italy',
    category: 'Food',
    cost: 42,
    duration: '2.5h',
    rating: 4.8,
    color: 'from-emerald-400/30 via-lime-500/20 to-green-500/10',
    note: 'Pasta, stories, and one more bite.',
    emoji: '🍝',
  },
  {
    id: 6,
    name: 'Trevi Fountain',
    city: 'Rome',
    country: 'Italy',
    category: 'Landmark',
    cost: 0,
    duration: '1h',
    rating: 4.6,
    color: 'from-sky-400/30 via-blue-500/20 to-cyan-500/10',
    note: 'Make a wish, then keep wandering.',
    emoji: '⛲',
  },
  {
    id: 7,
    name: 'Bamboo Grove',
    city: 'Kyoto',
    country: 'Japan',
    category: 'Nature',
    cost: 10,
    duration: '1.5h',
    rating: 4.9,
    color: 'from-green-400/30 via-emerald-500/20 to-teal-500/10',
    note: 'A quiet reset among the bamboo.',
    emoji: '🎋',
  },
  {
    id: 8,
    name: 'Sakura Market Night',
    city: 'Kyoto',
    country: 'Japan',
    category: 'Food',
    cost: 28,
    duration: '2h',
    rating: 4.7,
    color: 'from-pink-400/30 via-rose-500/20 to-fuchsia-500/10',
    note: 'Follow the lanterns and your appetite.',
    emoji: '🏮',
  },
];

const DiscoverySearchPage = () => {
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [city, setCity] = useState('All cities');
  const [category, setCategory] = useState('All types');
  const [quickFilter, setQuickFilter] = useState('All');
  const [selected, setSelected] = useState([]);

  const cities = useMemo(
    () => ['All cities', ...new Set(catalog.map((item) => item.city))],
    []
  );

  const categories = useMemo(
    () => ['All types', ...new Set(catalog.map((item) => item.category))],
    []
  );

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return catalog.filter((item) => {
      const searchableText =
        `${item.name} ${item.city} ${item.country} ${item.category}`.toLowerCase();

      const matchesQuery =
        !normalizedQuery || searchableText.includes(normalizedQuery);

      const matchesCity =
        city === 'All cities' || item.city === city;

      const matchesCategory =
        category === 'All types' || item.category === category;

      let matchesQuickFilter = true;

      if (quickFilter === 'Popular') {
        matchesQuickFilter = item.rating >= 4.8;
      }

      if (quickFilter === 'Free to explore') {
        matchesQuickFilter = item.cost === 0;
      }

      return (
        matchesQuery &&
        matchesCity &&
        matchesCategory &&
        matchesQuickFilter
      );
    });
  }, [query, city, category, quickFilter]);

  const selectedExperiences = useMemo(
    () => catalog.filter((item) => selected.includes(item.id)),
    [selected]
  );

  const selectedTotal = useMemo(
    () =>
      selectedExperiences.reduce(
        (total, experience) => total + experience.cost,
        0
      ),
    [selectedExperiences]
  );

  const toggleSelected = (item) => {
    const alreadySelected = selected.includes(item.id);

    if (alreadySelected) {
      setSelected((current) =>
        current.filter((id) => id !== item.id)
      );

      toast.success(`${item.name} removed from your trip.`);
      return;
    }

    if (selected.length >= MAX_SELECTIONS) {
      toast.error(
        `You can select up to ${MAX_SELECTIONS} experiences at a time.`
      );
      return;
    }

    setSelected((current) => [...current, item.id]);
    toast.success(`${item.name} added to your trip.`);
  };

  const clearSelections = () => {
    if (!selected.length) {
      toast.error('There are no selected experiences to clear.');
      return;
    }

    setSelected([]);
    toast.success('Selected experiences cleared.');
  };

  const resetFilters = () => {
    setQuery('');
    setCity('All cities');
    setCategory('All types');
    setQuickFilter('All');
  };

  const addToTrip = () => {
    if (!selectedExperiences.length) {
      toast.error('Choose at least one experience before continuing.');
      return;
    }

    try {
      localStorage.setItem(
        'chalo:selected-experiences',
        JSON.stringify(selectedExperiences)
      );

      toast.success(
        `${selectedExperiences.length} ${
          selectedExperiences.length === 1
            ? 'experience'
            : 'experiences'
        } added to your trip.`
      );

      navigate('/itinerary-builder');
    } catch (error) {
      console.error('Failed to save selected experiences:', error);

      toast.error(
        'We could not save your selections. Please try again.'
      );
    }
  };

  const hasActiveFilters =
    query.trim() ||
    city !== 'All cities' ||
    category !== 'All types' ||
    quickFilter !== 'All';

  return (
    <main className="min-h-screen bg-[#07111f] text-white">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="absolute right-0 top-80 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
        {/* Header */}
        <header className="mb-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-full bg-fuchsia-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-fuchsia-300 ring-1 ring-fuchsia-400/20">
                Chalo Chalein
              </span>

              <span className="text-sm text-slate-500">
                Explore • Select • Plan
              </span>
            </div>

            <h1 className="max-w-3xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              Discover places worth
              <span className="bg-gradient-to-r from-fuchsia-400 to-cyan-300 bg-clip-text text-transparent">
                {' '}
                travelling for.
              </span>
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
              Search experiences, discover local favourites and add the
              moments you want directly to your itinerary.
            </p>
          </div>

          <div className="flex min-w-[220px] items-center justify-between rounded-2xl border border-fuchsia-400/20 bg-fuchsia-400/10 px-5 py-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-fuchsia-300">
                Trip selection
              </p>

              <p className="mt-1 text-xl font-black text-white">
                {selected.length} selected
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs text-slate-400">Activity cost</p>
              <p className="mt-1 text-lg font-black text-emerald-300">
                ${selectedTotal}
              </p>
            </div>
          </div>
        </header>

        {/* Search */}
        <section className="mb-7 rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl shadow-black/10 backdrop-blur sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold">Find your next experience</h2>
            <p className="mt-1 text-sm text-slate-500">
              Search by destination, activity or type.
            </p>
          </div>

          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_190px_190px]">
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                🔎
              </span>

              <input
                aria-label="Search destinations and activities"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search Paris, Kyoto, food..."
                maxLength={60}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-11 pr-4 text-white outline-none transition placeholder:text-slate-600 focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-400/10"
              />
            </div>

            <select
              aria-label="Filter by city"
              value={city}
              onChange={(event) => setCity(event.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none transition focus:border-fuchsia-400"
            >
              {cities.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>

            <select
              aria-label="Filter by activity type"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none transition focus:border-fuchsia-400"
            >
              {categories.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {['All', 'Popular', 'Free to explore'].map((filter) => {
                const active = quickFilter === filter;

                return (
                  <button
                    type="button"
                    key={filter}
                    onClick={() => setQuickFilter(filter)}
                    className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                      active
                        ? 'border-fuchsia-400 bg-fuchsia-400/10 text-fuchsia-200'
                        : 'border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                    }`}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-semibold text-slate-400 transition hover:text-white"
              >
                Reset filters
              </button>
            )}
          </div>
        </section>

        {/* Selected summary */}
        {selectedExperiences.length > 0 && (
          <section className="mb-7 rounded-3xl border border-cyan-400/20 bg-cyan-400/5 p-5">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                  Your mini itinerary
                </p>

                <p className="mt-2 text-sm text-slate-400">
                  {selectedExperiences.length} of {MAX_SELECTIONS} activities
                  selected.
                </p>
              </div>

              <button
                type="button"
                onClick={clearSelections}
                className="text-sm font-semibold text-slate-400 transition hover:text-rose-300"
              >
                Clear all
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {selectedExperiences.map((experience) => (
                <button
                  type="button"
                  key={experience.id}
                  onClick={() => toggleSelected(experience)}
                  className="group flex items-center gap-2 rounded-full border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-300 transition hover:border-rose-400/50 hover:text-rose-200"
                  title={`Remove ${experience.name}`}
                >
                  <span>{experience.emoji}</span>

                  <span>{experience.name}</span>

                  <span className="text-slate-600 group-hover:text-rose-300">
                    ×
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Results toolbar */}
        <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm text-slate-500">
              Showing{' '}
              <span className="font-bold text-slate-200">
                {results.length}
              </span>{' '}
              {results.length === 1 ? 'experience' : 'experiences'}
            </p>
          </div>

          <button
            type="button"
            onClick={addToTrip}
            disabled={!selected.length}
            className="rounded-xl bg-gradient-to-r from-fuchsia-500 to-violet-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-fuchsia-500/20 transition hover:-translate-y-0.5 hover:shadow-fuchsia-500/30 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
          >
            Continue with {selected.length || 0}{' '}
            {selected.length === 1 ? 'experience' : 'experiences'} →
          </button>
        </div>

        {/* Experience cards */}
        {results.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {results.map((item) => {
              const isSelected = selected.includes(item.id);

              return (
                <article
                  key={item.id}
                  className={`group overflow-hidden rounded-3xl border bg-slate-900/80 transition duration-300 hover:-translate-y-1 ${
                    isSelected
                      ? 'border-fuchsia-400 shadow-xl shadow-fuchsia-500/10'
                      : 'border-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div
                    className={`relative h-40 bg-gradient-to-br ${item.color} p-5`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent" />

                    <div className="relative flex items-start justify-between">
                      <span className="rounded-full border border-white/10 bg-slate-950/50 px-3 py-1.5 text-xs font-medium text-slate-200 backdrop-blur">
                        📍 {item.city}, {item.country}
                      </span>

                      <span className="rounded-full bg-slate-950/60 px-3 py-1.5 text-xs font-bold text-amber-200 backdrop-blur">
                        ★ {item.rating}
                      </span>
                    </div>

                    <div className="absolute bottom-4 left-5 text-5xl transition duration-300 group-hover:scale-110">
                      {item.emoji}
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-fuchsia-300">
                          {item.category}
                        </p>

                        <h2 className="mt-2 text-xl font-black text-white">
                          {item.name}
                        </h2>
                      </div>

                      {isSelected && (
                        <span className="rounded-full bg-fuchsia-400/15 px-2.5 py-1 text-xs font-bold text-fuchsia-200">
                          Selected
                        </span>
                      )}
                    </div>

                    <p className="mt-3 min-h-10 text-sm leading-6 text-slate-400">
                      {item.note}
                    </p>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-slate-950/70 p-3">
                        <p className="text-xs text-slate-600">Duration</p>
                        <p className="mt-1 text-sm font-bold text-slate-200">
                          {item.duration}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-950/70 p-3">
                        <p className="text-xs text-slate-600">
                          Estimated cost
                        </p>

                        <p className="mt-1 text-sm font-bold text-emerald-300">
                          {item.cost ? `$${item.cost}` : 'Free'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleSelected(item)}
                      aria-pressed={isSelected}
                      className={`mt-5 w-full rounded-xl px-4 py-3 text-sm font-bold transition ${
                        isSelected
                          ? 'bg-fuchsia-400/15 text-fuchsia-200 ring-1 ring-fuchsia-400 hover:bg-rose-400/10 hover:text-rose-200 hover:ring-rose-400'
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
          <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/30 px-6 py-16 text-center">
            <div className="text-5xl">🧭</div>

            <h2 className="mt-5 text-xl font-black">
              Nothing matched your search
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Try changing the destination, activity category or quick filter.
              Apparently even travel search needs diplomacy.
            </p>

            <button
              type="button"
              onClick={resetFilters}
              className="mt-5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-bold text-slate-200 transition hover:bg-slate-700"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>
    </main>
  );
};

export default DiscoverySearchPage;