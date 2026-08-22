import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const catalog = [
  { id: 1, name: 'Eiffel Tower', city: 'Paris', category: 'Landmark', cost: 22, duration: '2h', rating: 4.9, color: 'from-cyan-400/30 to-blue-500/10', note: 'See the city sparkle from above.' },
  { id: 2, name: 'Louvre Museum', city: 'Paris', category: 'Culture', cost: 18, duration: '3h', rating: 4.8, color: 'from-amber-400/30 to-orange-500/10', note: 'A slow morning with the greats.' },
  { id: 3, name: 'Seine River Cruise', city: 'Paris', category: 'Experience', cost: 35, duration: '1.5h', rating: 4.7, color: 'from-indigo-400/30 to-cyan-500/10', note: 'The gentlest route through Paris.' },
  { id: 4, name: 'Colosseum', city: 'Rome', category: 'Historic', cost: 20, duration: '2h', rating: 4.9, color: 'from-rose-400/30 to-orange-500/10', note: 'Walk through a living chapter of history.' },
  { id: 5, name: 'Trastevere Food Walk', city: 'Rome', category: 'Food', cost: 42, duration: '2.5h', rating: 4.8, color: 'from-emerald-400/30 to-lime-500/10', note: 'Pasta, stories, and one more bite.' },
  { id: 6, name: 'Trevi Fountain', city: 'Rome', category: 'Landmark', cost: 0, duration: '1h', rating: 4.6, color: 'from-sky-400/30 to-blue-500/10', note: 'Make a wish, then keep wandering.' },
  { id: 7, name: 'Bamboo Grove', city: 'Kyoto', category: 'Nature', cost: 10, duration: '1.5h', rating: 4.9, color: 'from-green-400/30 to-emerald-500/10', note: 'A quiet reset among the bamboo.' },
  { id: 8, name: 'Sakura Market Night', city: 'Kyoto', category: 'Food', cost: 28, duration: '2h', rating: 4.7, color: 'from-pink-400/30 to-rose-500/10', note: 'Follow the lanterns and your appetite.' },
];

const DiscoverySearchPage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('All cities');
  const [category, setCategory] = useState('All types');
  const [selected, setSelected] = useState([]);
  const cities = ['All cities', ...new Set(catalog.map((item) => item.city))];
  const categories = ['All types', ...new Set(catalog.map((item) => item.category))];
  const results = useMemo(() => catalog.filter((item) => {
    const text = `${item.name} ${item.city} ${item.category}`.toLowerCase();
    return text.includes(query.toLowerCase()) && (city === 'All cities' || item.city === city) && (category === 'All types' || item.category === category);
  }), [query, city, category]);
  const selectedTotal = selected.reduce((total, id) => total + catalog.find((item) => item.id === id).cost, 0);
  const toggleSelected = (item) => setSelected((current) => current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current, item.id]);
  const addToTrip = () => {
    if (!selected.length) { toast.error('Choose at least one experience first.'); return; }
    const selectedExperiences = catalog.filter((item) => selected.includes(item.id));
    localStorage.setItem('chalo:selected-experiences', JSON.stringify(selectedExperiences));
    toast.success(`${selected.length} experience${selected.length === 1 ? '' : 's'} ready for your trip.`);
    navigate('/itinerary-builder');
  };

  return <main className="min-h-screen bg-[#07111f] px-4 py-8 text-white sm:px-6 lg:px-10"><div className="mx-auto max-w-7xl">
    <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-fuchsia-300">Find your feeling</p><h1 className="text-4xl font-black tracking-tight sm:text-5xl">Discover the good stuff.</h1><p className="mt-3 max-w-xl text-slate-400">Browse local gems, landmark moments, and meals worth planning a day around.</p></div><div className="rounded-2xl border border-fuchsia-400/20 bg-fuchsia-400/10 px-4 py-3 text-sm text-fuchsia-200">{selected.length} saved · ${selectedTotal}</div></div>
    <section className="mb-7 rounded-3xl border border-slate-800 bg-slate-900/80 p-5 sm:p-6"><div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_190px_190px]"><input aria-label="Search destinations and activities" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search Paris, food, museum..." className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-fuchsia-400" /><select aria-label="Filter by city" value={city} onChange={(event) => setCity(event.target.value)} className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-slate-200 outline-none focus:border-fuchsia-400">{cities.map((value) => <option key={value}>{value}</option>)}</select><select aria-label="Filter by activity type" value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-slate-200 outline-none focus:border-fuchsia-400">{categories.map((value) => <option key={value}>{value}</option>)}</select></div><div className="mt-4 flex gap-2">{['All', 'Popular', 'Free to explore'].map((filter, index) => <button type="button" key={filter} className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${index === 0 ? 'border-fuchsia-400 bg-fuchsia-400/10 text-fuchsia-200' : 'border-slate-700 text-slate-400'}`}>{filter}</button>)}</div></section>
    <div className="mb-4 flex items-center justify-between"><p className="text-sm text-slate-500">Showing <span className="font-semibold text-slate-300">{results.length}</span> experiences</p><button type="button" onClick={addToTrip} className="rounded-xl bg-fuchsia-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-fuchsia-500/20 transition hover:bg-fuchsia-400">Add selected to trip</button></div>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{results.map((item) => { const isSelected = selected.includes(item.id); return <article key={item.id} className={`overflow-hidden rounded-3xl border bg-slate-900/80 transition hover:-translate-y-1 ${isSelected ? 'border-fuchsia-400 shadow-lg shadow-fuchsia-500/10' : 'border-slate-800 hover:border-slate-600'}`}><div className={`h-28 bg-gradient-to-br ${item.color} p-4`}><div className="flex justify-between"><span className="rounded-full border border-white/15 bg-slate-950/30 px-2.5 py-1 text-xs text-slate-200">{item.city}</span><span className="rounded-full bg-slate-950/50 px-2.5 py-1 text-xs text-amber-200">★ {item.rating}</span></div></div><div className="p-5"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-fuchsia-300">{item.category}</p><h2 className="mt-2 text-2xl font-bold">{item.name}</h2><p className="mt-2 min-h-10 text-sm leading-5 text-slate-400">{item.note}</p><div className="mt-5 flex items-center justify-between border-t border-slate-800 pt-4 text-sm"><span className="text-slate-500">{item.duration}</span><span className="font-bold text-emerald-300">{item.cost ? `$${item.cost}` : 'Free'}</span></div><button type="button" onClick={() => toggleSelected(item)} className={`mt-4 w-full rounded-xl px-4 py-2.5 text-sm font-bold transition ${isSelected ? 'bg-fuchsia-400/15 text-fuchsia-200 ring-1 ring-fuchsia-400' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'}`}>{isSelected ? '✓ Added to trip' : '+ Add to trip'}</button></div></article>; })}</div>
    {results.length === 0 && <div className="rounded-3xl border border-dashed border-slate-700 p-12 text-center text-slate-400">No experiences match that search. Try another city or category.</div>}
  </div></main>;
};

export default DiscoverySearchPage;
