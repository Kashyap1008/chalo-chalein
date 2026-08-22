import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

const initialDays = [
  { id: 1, date: '2026-04-18', label: 'Arrival day', activities: [
    { id: 11, time: '10:30', title: 'Check in at Le Marais', type: 'Stay', cost: 140 },
    { id: 12, time: '13:00', title: 'Seine river stroll', type: 'Explore', cost: 18 },
    { id: 13, time: '19:30', title: 'French bistro dinner', type: 'Food', cost: 42 },
  ] },
  { id: 2, date: '2026-04-19', label: 'Art & landmarks', activities: [
    { id: 21, time: '09:00', title: 'Louvre museum pass', type: 'Culture', cost: 22 },
    { id: 22, time: '13:30', title: 'Lunch in Saint-Germain', type: 'Food', cost: 26 },
    { id: 23, time: '18:30', title: 'Eiffel Tower at sunset', type: 'Experience', cost: 35 },
  ] },
];

const baseCosts = { flights: 540, stay: 280, transport: 90 };

const formatDate = (value) => value
  ? new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(`${value}T12:00:00`))
  : 'Choose a date';

const ItineraryBuilderPage = () => {
  const [trip, setTrip] = useState({ name: 'Paris Weekend Escape', destination: 'Paris, France', startDate: '2026-04-18', endDate: '2026-04-20', travelers: 2 });
  const [days, setDays] = useState(initialDays);
  const [errors, setErrors] = useState({});
  const [activeDay, setActiveDay] = useState(1);
  const [viewMode, setViewMode] = useState('timeline');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const savedExperiences = JSON.parse(localStorage.getItem('chalo:selected-experiences') || '[]');
    if (!savedExperiences.length) return;

    setDays((current) => current.map((day, index) => index === 0
      ? {
        ...day,
        activities: [
          ...day.activities,
          ...savedExperiences.map((experience, offset) => ({
            id: `${experience.id}-${offset}`,
            time: '15:00',
            title: experience.name,
            type: experience.category,
            cost: experience.cost,
          })),
        ],
      }
      : day));
    localStorage.removeItem('chalo:selected-experiences');
  }, []);

  const updateTrip = (field, value) => {
    setTrip((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
    setIsSaved(false);
  };

  const validate = () => {
    const nextErrors = {};
    if (!trip.name.trim()) nextErrors.name = 'Give your trip a name.';
    if (!trip.destination.trim()) nextErrors.destination = 'Add a destination.';
    if (!trip.startDate) nextErrors.startDate = 'Select a start date.';
    if (!trip.endDate) nextErrors.endDate = 'Select an end date.';
    if (trip.startDate && trip.endDate && trip.endDate < trip.startDate) nextErrors.endDate = 'End date must be after the start date.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const totals = useMemo(() => {
    const activities = days.flatMap((day) => day.activities);
    const activityTotal = activities.reduce((sum, activity) => sum + Number(activity.cost || 0), 0);
    return { activities: activityTotal, food: activities.filter((activity) => activity.type === 'Food').reduce((sum, activity) => sum + Number(activity.cost || 0), 0), total: activityTotal + Object.values(baseCosts).reduce((sum, value) => sum + value, 0) };
  }, [days]);

  const saveTrip = () => {
    if (!validate()) { toast.error('Check the highlighted trip details.'); return; }
    setIsSaved(true);
    toast.success('Trip saved to your Chalo-Chalein plan.');
  };

  const addDay = () => {
    const nextId = days.length + 1;
    const nextDate = new Date(`${trip.startDate || '2026-04-18'}T12:00:00`);
    nextDate.setDate(nextDate.getDate() + days.length);
    setDays((current) => [...current, { id: nextId, date: nextDate.toISOString().slice(0, 10), label: 'New day', activities: [] }]);
    setActiveDay(nextId);
  };

  const addActivity = (dayId) => setDays((current) => current.map((day) => day.id === dayId
    ? { ...day, activities: [...day.activities, { id: Date.now(), time: '12:00', title: 'New activity', type: 'Explore', cost: 0 }] }
    : day));

  const updateActivity = (dayId, activityId, field, value) => {
    setDays((current) => current.map((day) => day.id === dayId
      ? { ...day, activities: day.activities.map((activity) => activity.id === activityId ? { ...activity, [field]: field === 'cost' ? Number(value) : value } : activity) }
      : day));
    setIsSaved(false);
  };

  const removeActivity = (dayId, activityId) => setDays((current) => current.map((day) => day.id === dayId
    ? { ...day, activities: day.activities.filter((activity) => activity.id !== activityId) }
    : day));

  const inputClass = (field) => `mt-2 w-full rounded-xl border bg-slate-950/70 px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400 ${errors[field] ? 'border-rose-400' : 'border-slate-700'}`;
  const activeDayPlan = days.find((day) => day.id === activeDay) || days[0];

  return (
    <main className="min-h-screen bg-[#07111f] px-4 py-8 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div><p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">Plan your next story</p><h1 className="max-w-2xl text-4xl font-black tracking-tight sm:text-5xl">Build a trip that feels like you.</h1><p className="mt-3 max-w-xl text-slate-400">Shape the route, collect little moments, and keep every rupee or dollar visible before you go.</p></div>
          <button type="button" onClick={saveTrip} className="rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950 shadow-lg shadow-cyan-400/20 transition hover:bg-cyan-300">{isSaved ? 'Saved ✓' : 'Save itinerary'}</button>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_350px]">
          <section className="space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 sm:p-7">
              <div className="mb-5 flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">01 / Trip basics</p><h2 className="mt-1 text-xl font-bold">Set the scene</h2></div><span className="text-2xl text-cyan-300">✦</span></div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm text-slate-300">Trip name<input aria-invalid={Boolean(errors.name)} value={trip.name} onChange={(event) => updateTrip('name', event.target.value)} className={inputClass('name')} placeholder="e.g. Monsoon in Kerala" />{errors.name && <span className="mt-1 block text-xs text-rose-300">{errors.name}</span>}</label>
                <label className="block text-sm text-slate-300">Destination<input aria-invalid={Boolean(errors.destination)} value={trip.destination} onChange={(event) => updateTrip('destination', event.target.value)} className={inputClass('destination')} placeholder="City or country" />{errors.destination && <span className="mt-1 block text-xs text-rose-300">{errors.destination}</span>}</label>
                <label className="block text-sm text-slate-300">Start date<input type="date" value={trip.startDate} onChange={(event) => updateTrip('startDate', event.target.value)} className={inputClass('startDate')} />{errors.startDate && <span className="mt-1 block text-xs text-rose-300">{errors.startDate}</span>}</label>
                <label className="block text-sm text-slate-300">End date<input type="date" value={trip.endDate} onChange={(event) => updateTrip('endDate', event.target.value)} className={inputClass('endDate')} />{errors.endDate && <span className="mt-1 block text-xs text-rose-300">{errors.endDate}</span>}</label>
              </div>
              <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/50 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Travel party</p><p className="mt-1 font-semibold">{trip.travelers} {trip.travelers === 1 ? 'traveler' : 'travelers'}</p></div><input aria-label="Number of travelers" type="range" min="1" max="8" value={trip.travelers} onChange={(event) => updateTrip('travelers', Number(event.target.value))} className="w-full accent-cyan-400 sm:w-48" /></div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 sm:p-7">
              <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">02 / Daily rhythm</p><h2 className="mt-1 text-xl font-bold">Your route, at a glance</h2></div><div className="flex items-center gap-2"><div className="flex rounded-lg border border-slate-700 bg-slate-950 p-1"><button type="button" onClick={() => setViewMode('timeline')} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${viewMode === 'timeline' ? 'bg-cyan-400 text-slate-950' : 'text-slate-400'}`}>Timeline</button><button type="button" onClick={() => setViewMode('calendar')} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${viewMode === 'calendar' ? 'bg-cyan-400 text-slate-950' : 'text-slate-400'}`}>Calendar</button></div><button type="button" onClick={addDay} className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold text-cyan-300 transition hover:border-cyan-400">+ Add day</button></div></div>
              <div className="mb-6 flex gap-2 overflow-x-auto pb-1">{days.map((day) => <button type="button" key={day.id} onClick={() => setActiveDay(day.id)} className={`min-w-28 rounded-xl border px-3 py-2 text-left transition ${activeDay === day.id ? 'border-cyan-400 bg-cyan-400/10' : 'border-slate-800 bg-slate-950/50 hover:border-slate-600'}`}><span className="block text-xs text-slate-500">Day {day.id}</span><span className="mt-1 block text-sm font-semibold">{formatDate(day.date)}</span></button>)}</div>
              {viewMode === 'timeline' && activeDayPlan && <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4"><div className="mb-4 flex items-center justify-between"><div><h3 className="font-bold">{activeDayPlan.label}</h3><p className="mt-1 text-sm text-slate-500">{formatDate(activeDayPlan.date)} · {activeDayPlan.activities.length} stops</p></div><button type="button" onClick={() => addActivity(activeDayPlan.id)} className="text-sm font-semibold text-cyan-300 hover:text-cyan-200">+ Add stop</button></div><div className="space-y-3">{activeDayPlan.activities.length === 0 && <p className="rounded-xl border border-dashed border-slate-700 p-5 text-center text-sm text-slate-500">This day is open. Add a stop to start exploring.</p>}{activeDayPlan.activities.map((activity) => <div key={activity.id} className="grid gap-3 rounded-xl border border-slate-800 bg-slate-900 p-3 sm:grid-cols-[86px_1fr_120px_72px_28px] sm:items-center"><input aria-label="Activity time" type="time" value={activity.time} onChange={(event) => updateActivity(activeDayPlan.id, activity.id, 'time', event.target.value)} className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-sm text-slate-300" /><input aria-label="Activity title" value={activity.title} onChange={(event) => updateActivity(activeDayPlan.id, activity.id, 'title', event.target.value)} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white" /><select aria-label="Activity type" value={activity.type} onChange={(event) => updateActivity(activeDayPlan.id, activity.id, 'type', event.target.value)} className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-sm text-slate-300"><option>Explore</option><option>Culture</option><option>Experience</option><option>Food</option><option>Stay</option></select><label className="flex items-center rounded-lg border border-slate-700 bg-slate-950 px-2 text-sm text-emerald-300">$<input aria-label="Activity cost" type="number" min="0" value={activity.cost} onChange={(event) => updateActivity(activeDayPlan.id, activity.id, 'cost', event.target.value)} className="w-full bg-transparent px-1 py-2 text-right outline-none" /></label><button type="button" aria-label={`Remove ${activity.title}`} onClick={() => removeActivity(activeDayPlan.id, activity.id)} className="text-lg text-slate-600 transition hover:text-rose-300">×</button></div>)}</div></div>}
              {viewMode === 'calendar' && <div className="grid gap-3 md:grid-cols-2">{days.map((day) => <button type="button" key={day.id} onClick={() => { setActiveDay(day.id); setViewMode('timeline'); }} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4 text-left transition hover:border-cyan-400/70"><div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Day {day.id}</p><h3 className="mt-1 font-bold">{day.label}</h3></div><span className="text-sm text-slate-500">{formatDate(day.date)}</span></div><div className="mt-4 space-y-2">{day.activities.length ? day.activities.map((activity) => <div key={activity.id} className="flex items-center gap-2 text-sm text-slate-300"><span className="w-12 text-xs text-slate-500">{activity.time}</span><span className="truncate">{activity.title}</span></div>) : <p className="text-sm text-slate-500">No stops planned</p>}</div></button>)}</div>}
            </div>
          </section>

          <aside className="space-y-6"><div className="overflow-hidden rounded-3xl border border-cyan-400/30 bg-gradient-to-br from-cyan-400/15 via-slate-900 to-slate-900 p-6"><p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Trip snapshot</p><h2 className="mt-3 text-2xl font-black">{trip.destination || 'Your destination'}</h2><p className="mt-2 text-sm text-slate-400">{formatDate(trip.startDate)} — {formatDate(trip.endDate)}</p><div className="mt-6 grid grid-cols-2 gap-3"><div className="rounded-xl bg-slate-950/60 p-3"><p className="text-xs text-slate-500">Stops</p><p className="mt-1 text-xl font-bold">{days.reduce((sum, day) => sum + day.activities.length, 0)}</p></div><div className="rounded-xl bg-slate-950/60 p-3"><p className="text-xs text-slate-500">Travelers</p><p className="mt-1 text-xl font-bold">{trip.travelers}</p></div></div></div><div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6"><div className="flex items-center justify-between"><h2 className="text-xl font-bold">Budget pulse</h2><span className="text-xs text-emerald-300">Live estimate</span></div><p className="mt-5 text-4xl font-black tracking-tight">${totals.total.toLocaleString()}</p><p className="mt-1 text-sm text-slate-500">for the whole trip</p><div className="mt-6 space-y-3">{Object.entries({ Flights: baseCosts.flights, Stay: baseCosts.stay, Transport: baseCosts.transport, Activities: totals.activities }).map(([label, value]) => <div key={label}><div className="mb-1 flex justify-between text-sm"><span className="text-slate-400">{label}</span><span className="text-slate-200">${value}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400" style={{ width: `${Math.max(4, Math.min(100, (value / totals.total) * 100))}%` }} /></div></div>)}</div><div className="mt-5 border-t border-slate-800 pt-4 text-sm text-slate-400"><div className="flex justify-between"><span>Food in activities</span><span className="text-slate-200">${totals.food}</span></div></div></div></aside>
        </div>
      </div>
    </main>
  );
};

export default ItineraryBuilderPage;
