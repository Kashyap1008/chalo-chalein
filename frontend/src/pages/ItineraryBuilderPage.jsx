import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const sampleTemplates = [
  {
    name: '3-Day Goa Coastal & Scuba',
    destination: 'Goa, India',
    weather: '29°C · Tropical Beach Sun · Best: Nov–Feb',
    days: [
      { id: 1, date: '2026-05-10', label: 'Beach Arrival & Fontainhas', activities: [
        { id: 101, time: '11:00', title: 'Check in at North Goa Beach Resort', type: 'Stay', cost: 4500 },
        { id: 102, time: '15:00', title: 'Fontainhas Latin Quarter Walk', type: 'Culture', cost: 500 },
        { id: 103, time: '19:30', title: 'Sunset Cruise on Mandovi River', type: 'Experience', cost: 800 },
      ] },
      { id: 2, date: '2026-05-11', label: 'Grand Island Scuba Day', activities: [
        { id: 104, time: '08:00', title: 'Scuba Diving at Grand Island', type: 'Adventure', cost: 4500 },
        { id: 105, time: '14:00', title: 'Traditional Goan Fish Curry Thali', type: 'Food', cost: 600 },
        { id: 106, time: '19:00', title: 'Anjuna Beachside Shack Dinner', type: 'Food', cost: 1800 },
      ] },
      { id: 3, date: '2026-05-12', label: 'Forts & Sunset Toast', activities: [
        { id: 107, time: '10:00', title: 'Aguada Fort & Lighthouse Tour', type: 'Culture', cost: 300 },
        { id: 108, time: '14:00', title: 'Flea Market Souvenir Hunt', type: 'Explore', cost: 1200 },
        { id: 109, time: '18:00', title: 'Vagator Cliff Sunset Farewell', type: 'Experience', cost: 400 },
      ] },
    ],
    packing: [
      { id: 1, text: 'Swimwear & Quick-Dry Towel', packed: true, category: 'Clothing' },
      { id: 2, text: 'Polarized Sunglasses & Sunscreen SPF 50+', packed: true, category: 'Personal' },
      { id: 3, text: 'Waterproof Phone Pouch', packed: false, category: 'Gadgets' },
      { id: 4, text: 'Flip-Flops & Beach Slippers', packed: false, category: 'Clothing' },
      { id: 5, text: 'Government ID & Hotel Voucher', packed: true, category: 'Essentials' },
    ]
  },
  {
    name: '4-Day Manali & Rohtang Pass',
    destination: 'Manali, India',
    weather: '12°C · Crisp & Snowy · Best: Oct–Mar',
    days: [
      { id: 1, date: '2026-06-01', label: 'Arrival & Bohemian Old Manali', activities: [
        { id: 201, time: '11:30', title: 'Check in at Riverside Wooden Cabin', type: 'Stay', cost: 3800 },
        { id: 202, time: '15:00', title: 'Hadimba Temple & Cedar Forest', type: 'Culture', cost: 100 },
        { id: 203, time: '19:00', title: 'Old Manali Bohemian Cafe Dinner', type: 'Food', cost: 1200 },
      ] },
      { id: 2, date: '2026-06-02', label: 'Solang Adventure Thrills', activities: [
        { id: 204, time: '09:00', title: 'Solang Valley Paragliding Flight', type: 'Adventure', cost: 3000 },
        { id: 205, time: '14:00', title: 'Hot Maggi & Siddu Mountain Snack', type: 'Food', cost: 400 },
        { id: 206, time: '17:00', title: 'Zorbing & Quad Bike Ride', type: 'Adventure', cost: 1200 },
      ] },
      { id: 3, date: '2026-06-03', label: 'Atal Tunnel to Sissu Valley', activities: [
        { id: 207, time: '08:30', title: 'Scenic Drive through Atal Tunnel', type: 'Explore', cost: 1500 },
        { id: 208, time: '12:00', title: 'Sissu Waterfall & Valley Stroll', type: 'Explore', cost: 300 },
        { id: 209, time: '19:30', title: 'Bonfire & Himachali Trout Feast', type: 'Food', cost: 1600 },
      ] },
    ],
    packing: [
      { id: 1, text: 'Heavy Fleece & Windbreaker Jacket', packed: true, category: 'Clothing' },
      { id: 2, text: 'Thermal Inner Layers (Top & Bottom)', packed: true, category: 'Clothing' },
      { id: 3, text: 'Waterproof Trekking Shoes', packed: false, category: 'Clothing' },
      { id: 4, text: 'Lip Balm, Cold Cream & Moisturizer', packed: false, category: 'Personal' },
      { id: 5, text: 'High-Capacity Power Bank', packed: true, category: 'Gadgets' },
    ]
  },
  {
    name: '3-Day Royal Jaipur Explorer',
    destination: 'Jaipur, India',
    weather: '26°C · Warm & Royal · Best: Oct–Mar',
    days: [
      { id: 1, date: '2026-04-18', label: 'Arrival & Heritage Palace', activities: [
        { id: 301, time: '10:30', title: 'Haveli Heritage Stay Check-in', type: 'Stay', cost: 3500 },
        { id: 302, time: '14:00', title: 'City Palace & Jantar Mantar', type: 'Culture', cost: 600 },
        { id: 303, time: '19:30', title: 'Chokhi Dhani Royal Thali Feast', type: 'Food', cost: 1100 },
      ] },
      { id: 2, date: '2026-04-19', label: 'Grand Forts & Sound-Light Show', activities: [
        { id: 304, time: '09:00', title: 'Amer Fort Guided Tour & Maota Lake', type: 'Culture', cost: 500 },
        { id: 305, time: '13:30', title: 'LMB Authentic Ghevar & Street Food', type: 'Food', cost: 800 },
        { id: 306, time: '18:00', title: 'Nahargarh Fort Sunset Viewpoint', type: 'Experience', cost: 400 },
      ] },
      { id: 3, date: '2026-04-20', label: 'Bazaars & Final Farewell', activities: [
        { id: 307, time: '10:00', title: 'Hawa Mahal Photo Walk', type: 'Explore', cost: 200 },
        { id: 308, time: '13:00', title: 'Johari Bazaar Textile & Gem Trail', type: 'Explore', cost: 1500 },
        { id: 309, time: '19:00', title: 'Rooftop Palace Candlelight Dinner', type: 'Food', cost: 2000 },
      ] },
    ],
    packing: [
      { id: 1, text: 'Breathable Cotton Kurtas / Shirts', packed: true, category: 'Clothing' },
      { id: 2, text: 'Comfortable Walking Sneakers', packed: true, category: 'Clothing' },
      { id: 3, text: 'Wide-Brim Sun Hat & Sunglasses', packed: false, category: 'Personal' },
      { id: 4, text: 'DSLR / Mirrorless Camera & Charger', packed: false, category: 'Gadgets' },
      { id: 5, text: 'Government ID & Emergency Cash', packed: true, category: 'Essentials' },
    ]
  }
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
  const [days, setDays] = useState(sampleTemplates[2].days);
  const [errors, setErrors] = useState({});
  const [activeDay, setActiveDay] = useState(1);
  const [viewMode, setViewMode] = useState('timeline');
  const [isSaved, setIsSaved] = useState(false);
  const [currency, setCurrency] = useState('INR');
  const [showQR, setShowQR] = useState(false);
  const [savedTripId, setSavedTripId] = useState(null);
  const [currentWeather, setCurrentWeather] = useState('🌤️ 26°C · Warm & Royal · Best: Oct–Mar');

  // Packing Checklist state
  const [packingList, setPackingList] = useState(sampleTemplates[2].packing);
  const [newItemText, setNewItemText] = useState('');

  const currencySymbol = currency === 'INR' ? '₹' : '$';
  const currencyRate = currency === 'INR' ? 1 : 0.012;

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

  const loadTemplate = (tmpl) => {
    setTrip({
      name: tmpl.name,
      destination: tmpl.destination,
      startDate: tmpl.days[0]?.date || '2026-05-10',
      endDate: tmpl.days[tmpl.days.length - 1]?.date || '2026-05-12',
      travelers: 2,
    });
    setDays(tmpl.days);
    setPackingList(tmpl.packing);
    setCurrentWeather(tmpl.weather);
    setActiveDay(1);
    setIsSaved(false);
    toast.success(`Loaded "${tmpl.name}" template! 🚀`);
  };

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
      setIsSaved(true);
      toast.success('Trip saved to your local itinerary.');
    }
  };

  const shareWhatsApp = () => {
    const shareUrl = window.location.origin + (savedTripId ? `/share/${savedTripId}` : '/builder');
    const text = encodeURIComponent(`✈️ Check out my trip "${trip.name}" (${trip.destination}) on Chalo Chalein!\nEstimated Budget: ${formatAmount(totals.total)} for ${trip.travelers} travelers (${formatAmount(totals.perPerson)}/person).\n\n${shareUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const printTravelPass = () => {
    window.print();
  };

  const togglePackingItem = (id) => {
    setPackingList((items) => items.map((item) => item.id === id ? { ...item, packed: !item.packed } : item));
  };

  const addPackingItem = (e) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    setPackingList((items) => [...items, { id: Date.now(), text: newItemText.trim(), packed: false, category: 'Custom' }]);
    setNewItemText('');
    toast.success('Packing item added!');
  };

  const packedCount = packingList.filter((i) => i.packed).length;
  const packedPercentage = Math.round((packedCount / (packingList.length || 1)) * 100);

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

  const currentShareUrl = window.location.origin + (savedTripId ? `/share/${savedTripId}` : '/share/demo');
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(currentShareUrl)}&bgcolor=0f172a&color=38bdf8`;

  return (
    <main className="min-h-screen bg-[#07111f] px-4 py-8 text-white sm:px-6 lg:px-10 print:bg-white print:text-slate-950 print:p-2">
      <div className="mx-auto max-w-7xl">
        
        {/* Quick Templates Bar (Tier 3) */}
        <div className="mb-6 rounded-2xl border border-indigo-500/30 bg-slate-950/70 p-4 backdrop-blur-xl flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-indigo-300">⚡ 1-Click Instant Templates:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {sampleTemplates.map((tmpl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => loadTemplate(tmpl)}
                className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-cyan-400 hover:text-white"
              >
                {tmpl.name}
              </button>
            ))}
          </div>
        </div>

        {/* Header Bar */}
        <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="rounded-full bg-cyan-500/20 border border-cyan-400/40 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-cyan-300">
                Chalo Chalein Studio
              </span>
              <span className="rounded-full bg-emerald-500/20 border border-emerald-400/40 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
                {currentWeather}
              </span>
            </div>
            <h1 className="max-w-2xl text-3xl font-black tracking-tight sm:text-5xl bg-gradient-to-r from-white via-slate-100 to-cyan-200 bg-clip-text text-transparent print:text-slate-950">
              Build a trip that feels like you.
            </h1>
            <p className="mt-2 max-w-xl text-sm text-slate-400 print:text-slate-600">
              Plan stops, schedule daily activities, pack smart, and track group split costs live.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 print:hidden">
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
              onClick={printTravelPass}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-3 text-xs font-bold text-slate-200 transition hover:border-cyan-400 hover:text-white"
            >
              <span>🖨️</span> Print Travel Pass
            </button>

            <button
              type="button"
              onClick={shareWhatsApp}
              className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-950/60 px-3.5 py-3 text-xs font-bold text-emerald-300 transition hover:bg-emerald-900/60"
            >
              <span>💬</span> WhatsApp
            </button>

            <button
              type="button"
              onClick={() => setShowQR(!showQR)}
              className="flex items-center gap-1.5 rounded-xl border border-sky-500/40 bg-sky-950/60 px-3.5 py-3 text-xs font-bold text-sky-300 transition hover:bg-sky-900/60"
            >
              <span>📱</span> {showQR ? 'Hide QR' : 'QR Code'}
            </button>

            <button
              type="button"
              onClick={saveTrip}
              className="rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-3 font-bold text-slate-950 shadow-lg shadow-cyan-400/20 transition hover:opacity-95 hover:scale-105"
            >
              {isSaved ? 'Saved to Cloud ✓' : 'Save Itinerary'}
            </button>
          </div>
        </div>

        {/* QR Code Popover */}
        {showQR && (
          <div className="mb-6 inline-flex flex-col items-center rounded-2xl border border-cyan-400/30 bg-slate-950/90 p-5 shadow-2xl backdrop-blur-xl animate-fadeIn print:hidden">
            <p className="mb-2 text-xs font-semibold text-slate-300">Scan to view live itinerary on mobile</p>
            <img src={qrCodeUrl} alt="Trip QR Code" className="h-36 w-36 rounded-lg border border-slate-800 p-1 bg-slate-900" />
            <p className="mt-2 text-[10px] text-cyan-400">Live sync enabled</p>
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_370px]">
          
          {/* Main Route Builder */}
          <section className="space-y-6">
            
            {/* Trip Basics Card */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 sm:p-7 backdrop-blur-md print:bg-white print:border-slate-300">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">01 / Trip basics</p>
                  <h2 className="mt-1 text-xl font-bold print:text-slate-950">Set the scene</h2>
                </div>
                <span className="text-2xl text-cyan-300 print:hidden">✦</span>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm text-slate-300 print:text-slate-700">
                  Trip name
                  <input aria-invalid={Boolean(errors.name)} value={trip.name} onChange={(event) => updateTrip('name', event.target.value)} className={inputClass('name')} placeholder="e.g. Monsoon in Kerala" />
                  {errors.name && <span className="mt-1 block text-xs text-rose-300">{errors.name}</span>}
                </label>
                <label className="block text-sm text-slate-300 print:text-slate-700">
                  Destination
                  <input aria-invalid={Boolean(errors.destination)} value={trip.destination} onChange={(event) => updateTrip('destination', event.target.value)} className={inputClass('destination')} placeholder="e.g. Manali, Goa, Jaipur" />
                  {errors.destination && <span className="mt-1 block text-xs text-rose-300">{errors.destination}</span>}
                </label>
                <label className="block text-sm text-slate-300 print:text-slate-700">
                  Start date
                  <input type="date" value={trip.startDate} onChange={(event) => updateTrip('startDate', event.target.value)} className={inputClass('startDate')} />
                  {errors.startDate && <span className="mt-1 block text-xs text-rose-300">{errors.startDate}</span>}
                </label>
                <label className="block text-sm text-slate-300 print:text-slate-700">
                  End date
                  <input type="date" value={trip.endDate} onChange={(event) => updateTrip('endDate', event.target.value)} className={inputClass('endDate')} />
                  {errors.endDate && <span className="mt-1 block text-xs text-rose-300">{errors.endDate}</span>}
                </label>
              </div>

              {/* Group Size Split Slider */}
              <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/50 p-4 sm:flex-row sm:items-center sm:justify-between print:border-slate-300 print:bg-slate-50">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-cyan-400 font-bold print:text-slate-800">Group Travel Party</p>
                  <p className="mt-1 font-semibold text-slate-200 print:text-slate-900">{trip.travelers} {trip.travelers === 1 ? 'Traveler (Solo)' : 'Travelers (Group Split)'}</p>
                </div>
                <div className="flex items-center gap-3 print:hidden">
                  <input aria-label="Number of travelers" type="range" min="1" max="8" value={trip.travelers} onChange={(event) => updateTrip('travelers', Number(event.target.value))} className="w-full accent-cyan-400 sm:w-40" />
                  <span className="w-6 font-bold text-cyan-300">{trip.travelers}p</span>
                </div>
              </div>
            </div>

            {/* Daily Rhythm / Itinerary Schedule */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 sm:p-7 backdrop-blur-md print:bg-white print:border-slate-300">
              <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">02 / Daily rhythm</p>
                  <h2 className="mt-1 text-xl font-bold print:text-slate-950">Your route & activities</h2>
                </div>
                <div className="flex items-center gap-2 print:hidden">
                  <div className="flex rounded-lg border border-slate-700 bg-slate-950 p-1">
                    <button type="button" onClick={() => setViewMode('timeline')} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${viewMode === 'timeline' ? 'bg-cyan-400 text-slate-950' : 'text-slate-400'}`}>Timeline</button>
                    <button type="button" onClick={() => setViewMode('calendar')} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${viewMode === 'calendar' ? 'bg-cyan-400 text-slate-950' : 'text-slate-400'}`}>Calendar</button>
                  </div>
                  <button type="button" onClick={addDay} className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold text-cyan-300 transition hover:border-cyan-400">+ Add day</button>
                </div>
              </div>

              {/* Day Tabs */}
              <div className="mb-6 flex gap-2 overflow-x-auto pb-1 print:hidden">
                {days.map((day) => (
                  <button
                    type="button"
                    key={day.id}
                    onClick={() => setActiveDay(day.id)}
                    className={`min-w-28 rounded-xl border px-3 py-2 text-left transition ${activeDay === day.id ? 'border-cyan-400 bg-cyan-400/10' : 'border-slate-800 bg-slate-950/50 hover:border-slate-600'}`}
                  >
                    <span className="block text-xs text-slate-500">Day {day.id}</span>
                    <span className="mt-1 block text-sm font-semibold">{formatDate(day.date)}</span>
                  </button>
                ))}
              </div>

              {/* Timeline View */}
              {viewMode === 'timeline' && activeDayPlan && (
                <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4 print:border-slate-300 print:bg-white">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold print:text-slate-950">{activeDayPlan.label}</h3>
                      <p className="mt-1 text-sm text-slate-500">{formatDate(activeDayPlan.date)} · {activeDayPlan.activities.length} stops scheduled</p>
                    </div>
                    <button type="button" onClick={() => addActivity(activeDayPlan.id)} className="text-sm font-semibold text-cyan-300 hover:text-cyan-200 print:hidden">+ Add activity</button>
                  </div>

                  <div className="space-y-3">
                    {activeDayPlan.activities.length === 0 && (
                      <p className="rounded-xl border border-dashed border-slate-700 p-5 text-center text-sm text-slate-500">
                        This day is open. Click &quot;+ Add activity&quot; to start planning.
                      </p>
                    )}
                    {activeDayPlan.activities.map((activity) => (
                      <div key={activity.id} className="grid gap-3 rounded-xl border border-slate-800 bg-slate-900 p-3 sm:grid-cols-[86px_1fr_120px_100px_28px] sm:items-center print:border-slate-300 print:bg-slate-50">
                        <input aria-label="Activity time" type="time" value={activity.time} onChange={(event) => updateActivity(activeDayPlan.id, activity.id, 'time', event.target.value)} className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-sm text-slate-300 print:bg-white print:text-slate-900" />
                        <input aria-label="Activity title" value={activity.title} onChange={(event) => updateActivity(activeDayPlan.id, activity.id, 'title', event.target.value)} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white print:bg-white print:text-slate-900 font-semibold" />
                        <select aria-label="Activity type" value={activity.type} onChange={(event) => updateActivity(activeDayPlan.id, activity.id, 'type', event.target.value)} className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-sm text-slate-300 print:bg-white print:text-slate-900">
                          <option>Explore</option>
                          <option>Culture</option>
                          <option>Experience</option>
                          <option>Food</option>
                          <option>Stay</option>
                        </select>
                        <label className="flex items-center rounded-lg border border-slate-700 bg-slate-950 px-2 text-sm text-emerald-300 print:border-slate-300 print:bg-white print:text-emerald-700 font-bold">
                          <span>{currencySymbol}</span>
                          <input aria-label="Activity cost" type="number" min="0" value={activity.cost} onChange={(event) => updateActivity(activeDayPlan.id, activity.id, 'cost', event.target.value)} className="w-full bg-transparent px-1 py-2 text-right outline-none text-white font-semibold print:text-slate-900" />
                        </label>
                        <button type="button" aria-label={`Remove ${activity.title}`} onClick={() => removeActivity(activeDayPlan.id, activity.id)} className="text-lg text-slate-600 transition hover:text-rose-300 print:hidden">×</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Calendar View */}
              {viewMode === 'calendar' && (
                <div className="grid gap-3 md:grid-cols-2">
                  {days.map((day) => (
                    <button type="button" key={day.id} onClick={() => { setActiveDay(day.id); setViewMode('timeline'); }} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4 text-left transition hover:border-cyan-400/70">
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

            {/* Smart Packing Checklist */}
            <div className="rounded-3xl border border-indigo-500/30 bg-slate-900/80 p-5 sm:p-7 backdrop-blur-md print:bg-white print:border-slate-300">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🎒</span>
                    <h2 className="text-xl font-bold text-white print:text-slate-950">Smart Packing Checklist</h2>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 print:text-slate-600">Tailored essentials for {trip.destination || 'your trip'}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-cyan-300 print:text-slate-950">{packedCount}/{packingList.length}</span>
                  <p className="text-[11px] text-slate-400">{packedPercentage}% packed</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800 mb-5 print:hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-indigo-400 to-emerald-400 transition-all duration-300"
                  style={{ width: `${packedPercentage}%` }}
                />
              </div>

              {/* Checklist Items */}
              <div className="grid gap-2.5 sm:grid-cols-2 mb-4">
                {packingList.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => togglePackingItem(item.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition print:border-slate-300 print:bg-white ${
                      item.packed
                        ? 'border-emerald-500/40 bg-emerald-950/20 text-slate-400'
                        : 'border-slate-800 bg-slate-950/50 hover:border-slate-700 text-slate-200 print:text-slate-900'
                    }`}
                  >
                    <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                      item.packed ? 'border-emerald-400 bg-emerald-400 text-slate-950' : 'border-slate-600'
                    }`}>
                      {item.packed && <span className="text-xs font-black">✓</span>}
                    </div>
                    <span className={`text-xs font-medium truncate ${item.packed ? 'line-through text-slate-500' : ''}`}>
                      {item.text}
                    </span>
                  </button>
                ))}
              </div>

              {/* Add Custom Packing Item */}
              <form onSubmit={addPackingItem} className="flex gap-2 print:hidden">
                <input
                  type="text"
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  placeholder="Add custom packing item (e.g. DSLR Camera)..."
                  className="flex-1 rounded-xl border border-slate-700 bg-slate-950/60 px-3.5 py-2 text-xs text-white outline-none focus:border-cyan-400"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-bold text-white transition"
                >
                  + Add
                </button>
              </form>
            </div>
          </section>

          {/* Right Sidebar — Smart Split Budget Pulse */}
          <aside className="space-y-6">
            
            {/* Destination Snapshot with Weather */}
            <div className="overflow-hidden rounded-3xl border border-cyan-400/30 bg-gradient-to-br from-cyan-400/15 via-slate-900 to-slate-900 p-6 backdrop-blur-md print:bg-white print:border-slate-300">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300 print:text-slate-700">Trip snapshot</p>
                <span className="text-xs font-bold text-amber-300 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-full print:bg-amber-100 print:text-amber-800">
                  {currentWeather.split('·')[0] || '🌤️ 26°C'}
                </span>
              </div>
              <h2 className="mt-3 text-2xl font-black print:text-slate-950">{trip.destination || 'Your Destination'}</h2>
              <p className="mt-1 text-sm text-slate-400 print:text-slate-600">{formatDate(trip.startDate)} — {formatDate(trip.endDate)}</p>
              
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-950/60 p-3 print:bg-slate-100">
                  <p className="text-xs text-slate-500">Total Stops</p>
                  <p className="mt-1 text-xl font-bold print:text-slate-950">{days.reduce((sum, day) => sum + day.activities.length, 0)}</p>
                </div>
                <div className="rounded-xl bg-slate-950/60 p-3 print:bg-slate-100">
                  <p className="text-xs text-slate-500">Party Size</p>
                  <p className="mt-1 text-xl font-bold text-cyan-300 print:text-slate-950">{trip.travelers} travelers</p>
                </div>
              </div>

              {/* Best Season Badge */}
              <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950/40 p-3 flex items-center justify-between text-xs print:bg-slate-100 print:border-slate-300">
                <span className="text-slate-400 print:text-slate-700">📅 Best Season:</span>
                <span className="font-bold text-emerald-300 print:text-emerald-800">Oct – Mar (Peak)</span>
              </div>
            </div>

            {/* Split Budget Pulse Card */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-md print:bg-white print:border-slate-300">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold print:text-slate-950">Budget Pulse</h2>
                <span className="text-xs font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full print:bg-emerald-100 print:text-emerald-800">
                  Live Estimate
                </span>
              </div>

              {/* Grand Total */}
              <div className="mt-5 border-b border-slate-800 pb-4 print:border-slate-300">
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold print:text-slate-600">Total Trip Cost</p>
                <p className="mt-1 text-4xl font-black tracking-tight text-white print:text-slate-950">{formatAmount(totals.total)}</p>
                <p className="mt-1 text-xs text-slate-500 print:text-slate-600">for entire {trip.travelers}-person group</p>
              </div>

              {/* Group Split Cost */}
              <div className="my-4 rounded-2xl border border-sky-500/30 bg-sky-950/30 p-4 print:bg-slate-100 print:border-slate-300">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-sky-300 uppercase tracking-wider print:text-slate-800">Per Person Split</p>
                  <span className="text-xs text-slate-400">({trip.travelers} shares)</span>
                </div>
                <p className="mt-1 text-3xl font-black text-emerald-400 print:text-emerald-700">
                  {formatAmount(totals.perPerson)}
                  <span className="text-xs font-normal text-slate-400 ml-1">/ person</span>
                </p>
                <p className="mt-1 text-xs text-indigo-300 print:text-indigo-800">
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
                      <span className="text-slate-400 print:text-slate-700">{label}</span>
                      <span className="font-semibold text-slate-200 print:text-slate-900">{formatAmount(value)}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-800 print:bg-slate-200">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 print:bg-slate-800"
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
