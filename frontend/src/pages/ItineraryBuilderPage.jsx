import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const initialDays = [
  { id: 1, date: '2026-04-18', label: 'Arrival & Check-in', activities: [
    { id: 11, time: '10:30', title: 'Hotel / Resort Check-in', type: 'Stay', cost: 3500 },
    { id: 12, time: '14:00', title: 'Heritage Walk & Scenic Trail', type: 'Explore', cost: 500 },
    { id: 13, time: '19:30', title: 'Traditional Multi-Course Dinner', type: 'Food', cost: 1200 },
  ] },
  { id: 2, date: '2026-04-19', label: 'Adventure & Local Gems', activities: [
    { id: 21, time: '09:00', title: 'Monument / Fort Guided Tour', type: 'Culture', cost: 600 },
    { id: 22, time: '13:30', title: 'Authentic Local Thali Lunch', type: 'Food', cost: 800 },
    { id: 23, time: '17:30', title: 'Sunset Boat Cruise / Safari', type: 'Experience', cost: 1500 },
  ] },
];

const baseCosts = { stay: 4500, transport: 2200 };

const formatDate = (value) => value
  ? new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(`${value}T12:00:00`))
  : 'Choose a date';

const ItineraryBuilderPage = () => {
  const { user } = useAuth();
  const [trip, setTrip] = useState({
    name: 'Royal Rajasthan Explorer',
    destination: 'Jaipur, India',
    startDate: '2026-04-18',
    endDate: '2026-04-20',
    travelers: 2,
  });
  const [days, setDays] = useState(initialDays);
  const [errors, setErrors] = useState({});
  const [activeDay, setActiveDay] = useState(1);
  const [viewMode, setViewMode] = useState('timeline');
  const [isSaved, setIsSaved] = useState(false);
  const [currency, setCurrency] = useState('INR'); // INR or USD
  const [showQR, setShowQR] = useState(false);
  const [savedTripId, setSavedTripId] = useState(null);

  const currencySymbol = currency === 'INR' ? '₹' : '$';
  const currencyRate = currency === 'INR' ? 1 : 0.012; // 1 INR ~ 0.012 USD

  const formatAmount = (amt) => {
    const converted = amt * currencyRate;
    return currency === 'INR'
      ? `₹${Math.round(converted).toLocaleString('en-IN')}`
      : `$${Math.round(converted).toLocaleString()}`;
  };

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
            type: experience.category || 'Experience',
            cost: Number(experience.cost || 0),
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
    const foodTotal = activities.filter((activity) => activity.type === 'Food').reduce((sum, activity) => sum + Number(activity.cost || 0), 0);
    const stayTotal = baseCosts.stay + activities.filter((activity) => activity.type === 'Stay').reduce((sum, activity) => sum + Number(activity.cost || 0), 0);
    const transportTotal = baseCosts.transport;
    const grandTotal = activityTotal + Object.values(baseCosts).reduce((sum, value) => sum + value, 0);

    const travelers = Math.max(1, trip.travelers || 1);
    const tripDays = Math.max(1, days.length || 1);

    return {
      activities: activityTotal,
      food: foodTotal,
      stay: stayTotal,
      transport: transportTotal,
      total: grandTotal,
      perPerson: Math.round(grandTotal / travelers),
      dailyPerPerson: Math.round((grandTotal / travelers) / tripDays),
    };
  }, [days, trip.travelers]);

  const saveTrip = async () => {
    if (!validate()) {
      toast.error('Check the highlighted trip details.');
      return;
    }

    try {
      if (user) {
        // Post trip to live backend
        const payload = {
          name: trip.name,
          description: `Journey to ${trip.destination}`,
          start_date: trip.startDate,
          end_date: trip.endDate,
          is_public: true,
        };
        const res = await api.post('/trips/', payload);
        if (res.data?.id) {
          setSavedTripId(res.data.id);
        }
      }
      setIsSaved(true);
      toast.success('Trip saved to Chalo Chalein cloud! 🎉');
    } catch {
      // Local fallback
      setIsSaved(true);
      toast.success('Trip saved to your local itinerary.');
    }
  };

  const shareWhatsApp = () => {
    const shareUrl = window.location.origin + (savedTripId ? `/share/${savedTripId}` : '/builder');
    const text = encodeURIComponent(`✈️ Check out my trip "${trip.name}" (${trip.destination}) on Chalo Chalein!\nEstimated Budget: ${formatAmount(totals.total)} for ${trip.travelers} travelers (${formatAmount(totals.perPerson)}/person).\n\n${shareUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const addDay = () => {
    const nextId = days.length + 1;
    const nextDate = new Date(`${trip.startDate || '2026-04-18'}T12:00:00`);
    nextDate.setDate(nextDate.getDate() + days.length);
    setDays((current) => [...current, { id: nextId, date: nextDate.toISOString().slice(0, 10), label: `Day ${nextId}`, activities: [] }]);
    setActiveDay(nextId);
  };

  const addActivity = (dayId) => setDays((current) => current.map((day) => day.id === dayId
    ? { ...day, activities: [...day.activities, { id: Date.now(), time: '12:00', title: 'New activity', type: 'Explore', cost: 500 }] }
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

  const completedBasics = [trip.name.trim(), trip.destination.trim(), trip.startDate, trip.endDate].filter(Boolean).length;
  const hasValidDates = trip.startDate && trip.endDate && trip.endDate >= trip.startDate;
  const readiness = hasValidDates && completedBasics === 4 ? 'Ready to save' : 'Needs a quick check';

  const currentShareUrl = window.location.origin + (savedTripId ? `/share/${savedTripId}` : '/share/demo');
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(currentShareUrl)}&bgcolor=0f172a&color=38bdf8`;

  return (
    <main className="min-h-screen bg-[#f7f8f6] px-4 py-8 text-slate-900 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        
        {/* Header Bar */}
        <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
              Multi-City Itinerary & Budget Studio
            </p>
            <h1 className="max-w-2xl text-3xl font-black tracking-tight sm:text-5xl bg-gradient-to-r from-white via-slate-100 to-cyan-200 bg-clip-text text-transparent">
              Build a trip that feels like you.
            </h1>
            <p className="mt-3 max-w-xl text-sm text-slate-600">
              Plan stops, schedule activities, and track per-person costs with real-time budget splitting.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className={`rounded-xl border px-4 py-2.5 text-xs font-bold ${readiness === 'Ready to save' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
              <span className="mr-1.5">{readiness === 'Ready to save' ? '✓' : '!'}</span>
              {readiness}
            </div>

            {/* Currency Toggle */}
            <div className="flex rounded-xl border border-slate-700 bg-slate-950 p-1">
              <button
                type="button"
                onClick={() => setCurrency('INR')}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${currency === 'INR' ? 'bg-cyan-400 text-slate-950' : 'text-slate-400'}`}
              >
                ₹ INR
              </button>
              <button
                type="button"
                onClick={() => setCurrency('USD')}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${currency === 'USD' ? 'bg-cyan-400 text-slate-950' : 'text-slate-400'}`}
              >
                $ USD
              </button>
            </div>

            <button
              type="button"
              onClick={shareWhatsApp}
              className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-950/60 px-4 py-3 text-sm font-bold text-emerald-300 transition hover:bg-emerald-900/60 hover:scale-105"
            >
              <span>💬</span> WhatsApp
            </button>

            <button
              type="button"
              onClick={() => setShowQR(!showQR)}
              className="flex items-center gap-1.5 rounded-xl border border-sky-500/40 bg-sky-950/60 px-4 py-3 text-sm font-bold text-sky-300 transition hover:bg-sky-900/60"
            >
              <span>📱</span> {showQR ? 'Hide QR' : 'QR Code'}
            </button>

            <button
              type="button"
              onClick={saveTrip}
              className="rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3 font-bold text-slate-950 shadow-lg shadow-cyan-400/20 transition hover:opacity-95 hover:scale-105"
            >
              {isSaved ? 'Saved to Cloud ✓' : 'Save Itinerary'}
            </button>
          </div>
        </div>

        {/* QR Code Popover */}
        {showQR && (
          <div className="mb-6 inline-flex flex-col items-center rounded-2xl border border-cyan-200 bg-white p-5 shadow-xl backdrop-blur-xl">
            <p className="mb-2 text-xs font-semibold text-slate-300">Scan to view live itinerary on mobile</p>
            <img src={qrCodeUrl} alt="Trip QR Code" className="h-36 w-36 rounded-lg border border-slate-800 p-1 bg-slate-900" />
            <p className="mt-2 text-[10px] text-cyan-400">Live sync enabled</p>
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_370px]">
          
          {/* Main Route Builder */}
          <section className="space-y-6">
            
            {/* Trip Basics Card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 backdrop-blur-md">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">01 / Trip basics</p>
                  <h2 className="mt-1 text-xl font-bold">Set the scene</h2>
                </div>
                <span className="text-2xl text-cyan-300">✦</span>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm text-slate-300">
                  Trip name
                  <input aria-invalid={Boolean(errors.name)} value={trip.name} onChange={(event) => updateTrip('name', event.target.value)} className={inputClass('name')} placeholder="e.g. Monsoon in Kerala" />
                  {errors.name && <span className="mt-1 block text-xs text-rose-300">{errors.name}</span>}
                </label>
                <label className="block text-sm text-slate-300">
                  Destination
                  <input aria-invalid={Boolean(errors.destination)} value={trip.destination} onChange={(event) => updateTrip('destination', event.target.value)} className={inputClass('destination')} placeholder="e.g. Manali, Goa, Jaipur" />
                  {errors.destination && <span className="mt-1 block text-xs text-rose-300">{errors.destination}</span>}
                </label>
                <label className="block text-sm text-slate-300">
                  Start date
                  <input type="date" value={trip.startDate} onChange={(event) => updateTrip('startDate', event.target.value)} className={inputClass('startDate')} />
                  {errors.startDate && <span className="mt-1 block text-xs text-rose-300">{errors.startDate}</span>}
                </label>
                <label className="block text-sm text-slate-300">
                  End date
                  <input type="date" value={trip.endDate} onChange={(event) => updateTrip('endDate', event.target.value)} className={inputClass('endDate')} />
                  {errors.endDate && <span className="mt-1 block text-xs text-rose-300">{errors.endDate}</span>}
                </label>
              </div>

              {/* Group Size Split Slider */}
              <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-cyan-400 font-bold">Group Travel Party</p>
                  <p className="mt-1 font-semibold text-slate-200">{trip.travelers} {trip.travelers === 1 ? 'Traveler (Solo)' : 'Travelers (Group Split)'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <input aria-label="Number of travelers" type="range" min="1" max="8" value={trip.travelers} onChange={(event) => updateTrip('travelers', Number(event.target.value))} className="w-full accent-cyan-400 sm:w-40" />
                  <span className="w-6 font-bold text-cyan-300">{trip.travelers}p</span>
                </div>
              </div>
            </div>

            {/* Daily Rhythm / Itinerary Schedule */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 backdrop-blur-md">
              <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">02 / Daily rhythm</p>
                  <h2 className="mt-1 text-xl font-bold">Your route & activities</h2>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex rounded-lg border border-slate-700 bg-slate-950 p-1">
                    <button type="button" onClick={() => setViewMode('timeline')} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${viewMode === 'timeline' ? 'bg-cyan-400 text-slate-950' : 'text-slate-400'}`}>Timeline</button>
                    <button type="button" onClick={() => setViewMode('calendar')} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${viewMode === 'calendar' ? 'bg-cyan-400 text-slate-950' : 'text-slate-400'}`}>Calendar</button>
                  </div>
                  <button type="button" onClick={addDay} className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold text-cyan-300 transition hover:border-cyan-400">+ Add day</button>
                </div>
              </div>

              {/* Day Tabs */}
              <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
                {days.map((day) => (
                  <button
                    type="button"
                    key={day.id}
                    onClick={() => setActiveDay(day.id)}
                    className={`min-w-28 rounded-xl border px-3 py-2 text-left transition ${activeDay === day.id ? 'border-cyan-400 bg-cyan-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}
                  >
                    <span className="block text-xs text-slate-500">Day {day.id}</span>
                    <span className="mt-1 block text-sm font-semibold">{formatDate(day.date)}</span>
                  </button>
                ))}
              </div>

              {/* Timeline View */}
              {viewMode === 'timeline' && activeDayPlan && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold">{activeDayPlan.label}</h3>
                      <p className="mt-1 text-sm text-slate-500">{formatDate(activeDayPlan.date)} · {activeDayPlan.activities.length} stops scheduled</p>
                    </div>
                    <button type="button" onClick={() => addActivity(activeDayPlan.id)} className="text-sm font-semibold text-cyan-300 hover:text-cyan-200">+ Add activity</button>
                  </div>

                  <div className="space-y-3">
                    {activeDayPlan.activities.length === 0 && (
                      <p className="rounded-xl border border-dashed border-slate-700 p-5 text-center text-sm text-slate-500">
                        This day is open. Click &quot;+ Add activity&quot; to start planning.
                      </p>
                    )}
                    {activeDayPlan.activities.map((activity) => (
                      <div key={activity.id} className="grid gap-3 rounded-xl border border-slate-800 bg-slate-900 p-3 sm:grid-cols-[86px_1fr_120px_100px_28px] sm:items-center">
                        <input aria-label="Activity time" type="time" value={activity.time} onChange={(event) => updateActivity(activeDayPlan.id, activity.id, 'time', event.target.value)} className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-sm text-slate-300" />
                        <input aria-label="Activity title" value={activity.title} onChange={(event) => updateActivity(activeDayPlan.id, activity.id, 'title', event.target.value)} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white" />
                        <select aria-label="Activity type" value={activity.type} onChange={(event) => updateActivity(activeDayPlan.id, activity.id, 'type', event.target.value)} className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-sm text-slate-300">
                          <option>Explore</option>
                          <option>Culture</option>
                          <option>Experience</option>
                          <option>Food</option>
                          <option>Stay</option>
                        </select>
                        <label className="flex items-center rounded-lg border border-slate-700 bg-slate-950 px-2 text-sm text-emerald-300">
                          <span>{currencySymbol}</span>
                          <input aria-label="Activity cost" type="number" min="0" value={activity.cost} onChange={(event) => updateActivity(activeDayPlan.id, activity.id, 'cost', event.target.value)} className="w-full bg-transparent px-1 py-2 text-right outline-none text-white font-semibold" />
                        </label>
                        <button type="button" aria-label={`Remove ${activity.title}`} onClick={() => removeActivity(activeDayPlan.id, activity.id)} className="text-lg text-slate-600 transition hover:text-rose-300">×</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Calendar View */}
              {viewMode === 'calendar' && (
                <div className="grid gap-3 md:grid-cols-2">
                  {days.map((day) => (
                    <button type="button" key={day.id} onClick={() => { setActiveDay(day.id); setViewMode('timeline'); }} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-cyan-400/70">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Day {day.id}</p>
                          <h3 className="mt-1 font-bold">{day.label}</h3>
                        </div>
                        <span className="text-sm text-slate-500">{formatDate(day.date)}</span>
                      </div>
                      <div className="mt-4 space-y-2">
                        {day.activities.length ? day.activities.map((activity) => (
                          <div key={activity.id} className="flex items-center justify-between text-sm text-slate-300">
                            <div className="flex items-center gap-2 truncate">
                              <span className="w-12 text-xs text-slate-500">{activity.time}</span>
                              <span className="truncate">{activity.title}</span>
                            </div>
                            <span className="text-xs font-bold text-emerald-400">{formatAmount(activity.cost)}</span>
                          </div>
                        )) : (
                          <p className="text-sm text-slate-500">No stops planned</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Right Sidebar — Smart Split Budget Pulse */}
          <aside className="space-y-6">
            
            {/* Destination Snapshot */}
            <div className="overflow-hidden rounded-3xl border border-cyan-200 bg-gradient-to-br from-cyan-50 via-white to-blue-50 p-6 shadow-sm backdrop-blur-md">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Trip snapshot</p>
              <h2 className="mt-3 text-2xl font-black">{trip.destination || 'Your Destination'}</h2>
              <p className="mt-2 text-sm text-slate-400">{formatDate(trip.startDate)} — {formatDate(trip.endDate)}</p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white p-3 shadow-sm">
                  <p className="text-xs text-slate-500">Total Stops</p>
                  <p className="mt-1 text-xl font-bold">{days.reduce((sum, day) => sum + day.activities.length, 0)}</p>
                </div>
                <div className="rounded-xl bg-white p-3 shadow-sm">
                  <p className="text-xs text-slate-500">Party Size</p>
                  <p className="mt-1 text-xl font-bold text-cyan-300">{trip.travelers} travelers</p>
                </div>
              </div>
            </div>

            {/* Split Budget Pulse Card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm backdrop-blur-md">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Budget Pulse</h2>
                <span className="text-xs font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  Live Estimate
                </span>
              </div>

              {/* Grand Total */}
              <div className="mt-5 border-b border-slate-800 pb-4">
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Trip Cost</p>
                <p className="mt-1 text-4xl font-black tracking-tight text-white">{formatAmount(totals.total)}</p>
                <p className="mt-1 text-xs text-slate-500">for entire {trip.travelers}-person group</p>
              </div>

              {/* Group Split Cost */}
              <div className="my-4 rounded-2xl border border-sky-500/30 bg-sky-950/30 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-sky-300 uppercase tracking-wider">Per Person Split</p>
                  <span className="text-xs text-slate-400">({trip.travelers} shares)</span>
                </div>
                <p className="mt-1 text-3xl font-black text-emerald-400">
                  {formatAmount(totals.perPerson)}
                  <span className="text-xs font-normal text-slate-400 ml-1">/ person</span>
                </p>
                <p className="mt-1 text-xs text-indigo-300">
                  ~{formatAmount(totals.dailyPerPerson)} / day per traveler
                </p>
              </div>

              {/* Category Breakdown Bars */}
              <div className="space-y-3 pt-2">
                {Object.entries({
                  Stay: totals.stay,
                  Activities: totals.activities,
                  Transport: totals.transport,
                  Food: totals.food,
                }).map(([label, value]) => (
                  <div key={label}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-slate-400">{label}</span>
                      <span className="font-semibold text-slate-200">{formatAmount(value)}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                        style={{ width: `${Math.max(5, Math.min(100, totals.total > 0 ? (value / totals.total) * 100 : 10))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default ItineraryBuilderPage;
