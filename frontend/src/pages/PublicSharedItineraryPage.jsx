import { useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const days = [
  { day: '01', date: 'Sat, Apr 18', title: 'Arrival & first light', stops: [['10:30', 'Check in at Le Marais'], ['13:00', 'Seine river stroll'], ['19:30', 'French bistro dinner']] },
  { day: '02', date: 'Sun, Apr 19', title: 'Art & landmarks', stops: [['09:00', 'Louvre Museum'], ['13:30', 'Lunch in Saint-Germain'], ['18:30', 'Eiffel Tower at sunset']] },
  { day: '03', date: 'Mon, Apr 20', title: 'Slow streets & a final toast', stops: [['09:00', 'Montmartre walking tour'], ['15:00', 'Browse local boutiques'], ['20:00', 'Sunset river cruise']] },
];

const PublicSharedItineraryPage = () => {
  const { shareId } = useParams();
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/share/${shareId || 'paris-weekend'}`;
  const copyLink = async () => {
    try { await navigator.clipboard.writeText(shareUrl); } catch { /* Clipboard may be unavailable in a preview. */ }
    setCopied(true); toast.success('Share link copied.'); setTimeout(() => setCopied(false), 1800);
  };

  return <main className="min-h-screen bg-[#07111f] px-4 py-8 text-white sm:px-6 lg:px-10"><div className="mx-auto max-w-5xl"><div className="relative overflow-hidden rounded-[2rem] border border-sky-400/25 bg-gradient-to-br from-sky-400/20 via-slate-900 to-fuchsia-500/10 p-7 sm:p-10"><div className="absolute -right-14 -top-14 text-[11rem] leading-none text-white/5">✦</div><div className="relative"><div className="flex flex-wrap items-center justify-between gap-4"><p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">A Chalo-Chalein story · {shareId || 'shared'}</p><button type="button" onClick={copyLink} className="rounded-xl border border-slate-600 bg-slate-950/40 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-sky-300">{copied ? 'Copied ✓' : 'Copy share link'}</button></div><h1 className="mt-8 max-w-3xl text-4xl font-black tracking-tight sm:text-6xl">Paris Weekend Escape</h1><p className="mt-4 max-w-2xl text-lg leading-7 text-slate-300">A relaxed city break by Alicia, built for good walks, better food, and the kind of sunsets you remember.</p><div className="mt-7 flex flex-wrap gap-3 text-sm text-slate-300"><span className="rounded-full bg-slate-950/50 px-3 py-1.5">Paris, France</span><span className="rounded-full bg-slate-950/50 px-3 py-1.5">Apr 18 — Apr 20, 2026</span><span className="rounded-full bg-slate-950/50 px-3 py-1.5">2 travelers</span></div></div></div>
  <div className="my-8 grid gap-4 sm:grid-cols-3"><div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4"><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Trip length</p><p className="mt-2 text-2xl font-bold">3 days</p></div><div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4"><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Planned stops</p><p className="mt-2 text-2xl font-bold">9 moments</p></div><div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4"><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Estimated spend</p><p className="mt-2 text-2xl font-bold text-emerald-300">$1,350</p></div></div>
  <div className="space-y-5">{days.map((day) => <section key={day.day} className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 sm:p-7"><div className="flex flex-col gap-2 border-b border-slate-800 pb-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.25em] text-sky-300">Day {day.day}</p><h2 className="mt-2 text-2xl font-bold">{day.title}</h2></div><span className="text-sm text-slate-500">{day.date}</span></div><div className="mt-5 space-y-3">{day.stops.map(([time, title]) => <div key={`${day.day}-${time}`} className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-950/50 p-4"><span className="w-14 text-sm font-bold text-sky-300">{time}</span><span className="h-2 w-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" /><span className="font-medium text-slate-200">{title}</span></div>)}</div></section>)}</div><p className="py-8 text-center text-sm text-slate-500">Shared with Chalo-Chalein · Make your own journey.</p></div></main>;
};

export default PublicSharedItineraryPage;
