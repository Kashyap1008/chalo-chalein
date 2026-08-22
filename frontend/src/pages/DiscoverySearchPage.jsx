import { useMemo, useState } from 'react';

const catalog = [
  { id: 1, name: 'Eiffel Tower', city: 'Paris', category: 'Landmark', cost: 22, duration: 2, rating: 4.9 },
  { id: 2, name: 'Louvre Museum', city: 'Paris', category: 'Culture', cost: 18, duration: 3, rating: 4.8 },
  { id: 3, name: 'Seine River Cruise', city: 'Paris', category: 'Experience', cost: 35, duration: 1.5, rating: 4.7 },
  { id: 4, name: 'Colosseum', city: 'Rome', category: 'Historic', cost: 20, duration: 2, rating: 4.9 },
  { id: 5, name: 'Trastevere Food Walk', city: 'Rome', category: 'Food', cost: 42, duration: 2.5, rating: 4.8 },
  { id: 6, name: 'Trevi Fountain', city: 'Rome', category: 'Landmark', cost: 0, duration: 1, rating: 4.6 },
  { id: 7, name: 'Kyoto Bamboo Grove', city: 'Kyoto', category: 'Nature', cost: 10, duration: 1.5, rating: 4.9 },
  { id: 8, name: 'Sakura Market Night', city: 'Kyoto', category: 'Food', cost: 28, duration: 2, rating: 4.7 },
  { id: 9, name: 'Fushimi Inari', city: 'Kyoto', category: 'Hike', cost: 0, duration: 3, rating: 4.9 },
];

const DiscoverySearchPage = () => {
  const [query, setQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const cities = ['All', ...new Set(catalog.map((item) => item.city))];
  const categories = ['All', ...new Set(catalog.map((item) => item.category))];

  const filtered = useMemo(() => {
    return catalog.filter((item) => {
      const matchesQuery =
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.city.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase());

      const matchesCity = cityFilter === 'All' || item.city === cityFilter;
      const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;

      return matchesQuery && matchesCity && matchesCategory;
    });
  }, [query, cityFilter, categoryFilter]);

  const averageCost = filtered.length
    ? Math.round(filtered.reduce((sum, item) => sum + item.cost, 0) / filtered.length)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-white">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.2em] text-purple-300">Discover</p>
        <h1 className="mt-2 text-4xl font-bold">City & activity search</h1>
      </div>

      <div className="mb-6 grid gap-4 rounded-2xl border border-slate-700 bg-slate-900/70 p-5 lg:grid-cols-[1.3fr_0.7fr_0.7fr]">
        <label className="block">
          <span className="mb-2 block text-sm text-slate-300">Search destinations or activities</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try Paris, museum, food..."
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-purple-400"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-slate-300">City</span>
          <select
            value={cityFilter}
            onChange={(event) => setCityFilter(event.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-purple-400"
          >
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-slate-300">Category</span>
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-purple-400"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <div className="rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Results</p>
          <p className="mt-1 text-xl font-semibold">{filtered.length}</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Avg cost</p>
          <p className="mt-1 text-xl font-semibold">${averageCost}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {filtered.map((item) => (
          <article key={item.id} className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5 shadow-lg transition hover:border-purple-500/60 hover:-translate-y-0.5">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-purple-300">{item.category}</p>
                <h2 className="mt-2 text-2xl font-semibold">{item.name}</h2>
              </div>
              <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-1 text-sm font-medium text-amber-300">
                ★ {item.rating}
              </span>
            </div>

            <div className="mb-4 flex items-center justify-between text-sm text-slate-300">
              <span>{item.city}</span>
              <span>{item.duration}h</span>
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-950/60 p-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Estimated cost</span>
                <span className="text-lg font-semibold text-emerald-300">${item.cost}</span>
              </div>
            </div>

            <button
              type="button"
              className="mt-4 w-full rounded-xl bg-purple-600 px-4 py-2.5 font-semibold text-white transition hover:bg-purple-500"
            >
              Add to itinerary
            </button>
          </article>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 p-10 text-center text-slate-400">
          No matches found. Try a different city or keyword.
        </div>
      )}
    </div>
  );
};

export default DiscoverySearchPage;
