import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const demoDays = [
  { day: '01', date: 'Day 1', title: 'Arrival & Scenic Exploration', stops: [['10:30', 'Hotel Check-in & Welcome Chai'], ['14:00', 'Sightseeing & Nature Walk'], ['19:30', 'Traditional Dinner Experience']] },
  { day: '02', date: 'Day 2', title: 'Adventure & Cultural Landmarks', stops: [['09:00', 'Heritage Fort / Monument Tour'], ['13:30', 'Local Food & Street Delicacies'], ['18:00', 'Sunset Viewpoint & Photography']] },
  { day: '03', date: 'Day 3', title: 'Bazaars & Grand Finale', stops: [['09:30', 'Local Handicrafts & Souvenir Trail'], ['14:00', 'River / Lake Cruise Relaxation'], ['20:00', 'Farewell Rooftop Dinner']] },
];

const PublicSharedItineraryPage = () => {
  const { shareId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [tripData, setTripData] = useState(null);
  const [budgetData, setBudgetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [travelers, setTravelers] = useState(2);
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  const [cloning, setCloning] = useState(false);

  const shareUrl = window.location.href;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(shareUrl)}&bgcolor=0f172a&color=38bdf8`;

  useEffect(() => {
    const fetchTrip = async () => {
      setLoading(true);
      try {
        if (shareId) {
          const res = await api.get(`/trips/shared/${shareId}/`);
          setTripData(res.data);
          if (res.data?.id) {
            const budgetRes = await api.get(`/trips/${res.data.id}/budget/?travelers=${travelers}`);
            setBudgetData(budgetRes.data);
          }
        }
      } catch (err) {
        console.warn('Could not load live shared trip, rendering interactive demo preview:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [shareId]);

  // Recalculate budget when travelers change
  useEffect(() => {
    if (tripData?.id) {
      api.get(`/trips/${tripData.id}/budget/?travelers=${travelers}`)
        .then(res => setBudgetData(res.data))
        .catch(() => {});
    }
  }, [travelers, tripData]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Share link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.success('Link ready: ' + shareUrl);
    }
  };

  const shareOnWhatsApp = () => {
    const tripTitle = tripData?.name || 'Incredible Travel Itinerary';
    const text = encodeURIComponent(`✈️ Check out our trip itinerary for "${tripTitle}" on Chalo Chalein!\n\n${shareUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const printTravelPass = () => {
    window.print();
  };

  const handleCloneTrip = async () => {
    if (!user) {
      toast.error('Please login to save this itinerary to your account');
      navigate('/login');
      return;
    }
    if (!tripData?.id) {
      toast.success('Trip template cloned to your dashboard!');
      navigate('/dashboard');
      return;
    }

    try {
      setCloning(true);
      const res = await api.post(`/trips/${tripData.id}/clone/`);
      toast.success('Trip cloned to your account! 🎉');
      navigate(`/builder?trip=${res.data.id}`);
    } catch {
      toast.error('Could not clone trip. Please try again.');
    } finally {
      setCloning(false);
    }
  };

  const totalSpend = budgetData?.grand_total || 24500;
  const perPersonSpend = budgetData?.per_person_total || Math.round(totalSpend / travelers);
  const tripTitle = tripData?.name || 'Golden Triangle & Royal Heritage Tour';
  const tripDesc = tripData?.description || 'A hand-crafted multi-city journey filled with majestic monuments, culinary gems, and breathtaking sunsets.';
  const stopsCount = tripData?.stops?.length || 3;

  return (
    <main className="min-h-screen bg-[#07111f] px-4 py-8 text-white sm:px-6 lg:px-10 print:bg-white print:text-slate-950 print:p-2">
      <div className="mx-auto max-w-5xl">
        
        {/* Hero Card */}
        <div className="relative overflow-hidden rounded-[2.5rem] border border-sky-400/25 bg-gradient-to-br from-sky-500/20 via-slate-900 to-indigo-500/10 p-7 sm:p-10 shadow-2xl backdrop-blur-xl print:bg-white print:border-slate-300">
          <div className="absolute -right-10 -top-10 text-[10rem] font-black leading-none text-white/5 select-none print:hidden">✦</div>
          
          <div className="relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping print:hidden" />
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-sky-300 print:text-slate-600">
                  Shared Travel Pass · {shareId || 'CHALO-DEMO'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 print:hidden">
                <button
                  type="button"
                  onClick={printTravelPass}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-950/60 px-3.5 py-2 text-xs font-bold text-slate-200 transition hover:border-sky-400 hover:text-white"
                >
                  <span>🖨️</span> Print Travel Pass
                </button>
                <button
                  type="button"
                  onClick={shareOnWhatsApp}
                  className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-950/50 px-3.5 py-2 text-xs font-bold text-emerald-300 transition hover:bg-emerald-900/60 hover:scale-105"
                >
                  <span>💬</span> WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => setShowQR(!showQR)}
                  className="flex items-center gap-1.5 rounded-xl border border-sky-500/40 bg-sky-950/50 px-3.5 py-2 text-xs font-bold text-sky-300 transition hover:bg-sky-900/60 hover:scale-105"
                >
                  <span>📱</span> {showQR ? 'Hide QR' : 'Scan QR'}
                </button>
                <button
                  type="button"
                  onClick={copyLink}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-950/60 px-3.5 py-2 text-xs font-bold text-slate-200 transition hover:border-sky-400 hover:text-white"
                >
                  {copied ? 'Copied ✓' : '📋 Copy Link'}
                </button>
                <button
                  type="button"
                  onClick={handleCloneTrip}
                  disabled={cloning}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-sky-500/25 transition hover:opacity-90 hover:scale-105 disabled:opacity-50"
                >
                  {cloning ? 'Saving...' : '✨ Clone to My Trips'}
                </button>
              </div>
            </div>

            {/* QR Modal / Dropdown */}
            {showQR && (
              <div className="mt-6 inline-flex flex-col items-center rounded-2xl border border-sky-400/40 bg-slate-950/90 p-5 shadow-2xl backdrop-blur-2xl animate-fadeIn print:hidden">
                <p className="mb-3 text-xs font-semibold text-slate-300">Scan with your phone to view on mobile</p>
                <img
                  src={qrCodeUrl}
                  alt="Trip QR Code"
                  className="h-44 w-44 rounded-xl border border-slate-800 p-1.5 bg-slate-900 shadow-inner"
                />
                <p className="mt-2 text-[11px] text-sky-400">chalo-chalein live sync</p>
              </div>
            )}

            <h1 className="mt-7 max-w-3xl text-3xl font-extrabold tracking-tight sm:text-5xl bg-gradient-to-r from-white via-slate-100 to-sky-200 bg-clip-text text-transparent print:text-slate-950">
              {tripTitle}
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg print:text-slate-600">
              {tripDesc}
            </p>

            <div className="mt-6 flex flex-wrap gap-2.5 text-xs font-medium text-slate-300 print:text-slate-700">
              <span className="rounded-full border border-slate-700/60 bg-slate-950/60 px-3 py-1.5 print:bg-slate-100 print:border-slate-300">📍 {stopsCount} Planned Cities</span>
              <span className="rounded-full border border-slate-700/60 bg-slate-950/60 px-3 py-1.5 print:bg-slate-100 print:border-slate-300">🗓️ Multi-Day Journey</span>
              <span className="rounded-full border border-slate-700/60 bg-slate-950/60 px-3 py-1.5 print:bg-slate-100 print:border-slate-300">👥 {travelers} Travelers</span>
            </div>
          </div>
        </div>

        {/* Quick Stats & Split Budget Calculator */}
        <div className="my-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-lg print:bg-white print:border-slate-300">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 print:text-slate-600">Total Itinerary Spend</p>
            <p className="mt-2 text-3xl font-black text-white print:text-slate-950">₹{totalSpend.toLocaleString('en-IN')}</p>
            <p className="mt-1 text-xs text-slate-400 print:text-slate-500">Includes stay + curated activities</p>
          </div>

          {/* Group Split Toggle */}
          <div className="rounded-3xl border border-sky-500/30 bg-gradient-to-br from-sky-950/30 to-slate-900/60 p-5 backdrop-blur-lg print:bg-slate-50 print:border-slate-300">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-400 print:text-slate-800">Split By Group</p>
              <div className="flex gap-1 bg-slate-950/60 p-1 rounded-lg border border-slate-800 print:hidden">
                {[1, 2, 4, 6].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setTravelers(num)}
                    className={`rounded px-2 py-0.5 text-xs font-bold transition ${
                      travelers === num
                        ? 'bg-sky-500 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {num}p
                  </button>
                ))}
              </div>
            </div>
            <p className="mt-2 text-3xl font-black text-emerald-400 print:text-emerald-700">
              ₹{perPersonSpend.toLocaleString('en-IN')}
              <span className="text-xs font-normal text-slate-400 ml-1.5">/ person</span>
            </p>
            <p className="mt-1 text-xs text-slate-400 print:text-slate-500">For a {travelers}-traveler group</p>
          </div>

          <div className="rounded-3xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-lg print:bg-white print:border-slate-300">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 print:text-slate-600">Daily Average</p>
            <p className="mt-2 text-3xl font-black text-indigo-300 print:text-indigo-800">
              ₹{Math.round(totalSpend / (budgetData?.trip_days || 3)).toLocaleString('en-IN')}
              <span className="text-xs font-normal text-slate-400 ml-1.5">/ day</span>
            </p>
            <p className="mt-1 text-xs text-slate-400 print:text-slate-500">Estimated per-day budget</p>
          </div>
        </div>

        {/* Live Stops / Day-by-Day Schedule */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2 print:text-slate-950">
            <span>🗺️</span> Day-by-Day Itinerary Schedule
          </h2>

          {tripData?.stops && tripData.stops.length > 0 ? (
            tripData.stops.map((stop, sIndex) => (
              <section key={stop.id || sIndex} className="rounded-3xl border border-slate-800/80 bg-slate-900/70 p-6 sm:p-8 backdrop-blur-xl shadow-lg print:bg-white print:border-slate-300">
                <div className="flex flex-col gap-2 border-b border-slate-800 pb-5 sm:flex-row sm:items-end sm:justify-between print:border-slate-200">
                  <div>
                    <span className="rounded-full bg-sky-500/10 border border-sky-400/30 px-3 py-1 text-xs font-bold uppercase tracking-wider text-sky-300 print:text-sky-800 print:border-sky-200">
                      Stop {stop.order || sIndex + 1}
                    </span>
                    <h3 className="mt-2 text-2xl font-bold text-white print:text-slate-950">
                      {stop.city_details?.name || stop.city?.name || 'Destination'}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-emerald-400 print:text-emerald-700">
                      Stay: ₹{Number(stop.stay_cost || 0).toLocaleString('en-IN')}
                    </span>
                    {stop.start_date && (
                      <p className="text-xs text-slate-400 mt-0.5 print:text-slate-600">{stop.start_date} → {stop.end_date || 'End'}</p>
                    )}
                  </div>
                </div>

                {/* Scheduled Activities */}
                <div className="mt-5 space-y-3">
                  {stop.trip_activities && stop.trip_activities.length > 0 ? (
                    stop.trip_activities.map((act, aIndex) => (
                      <div key={act.id || aIndex} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-800/80 bg-slate-950/50 p-4 print:bg-slate-50 print:border-slate-200">
                        <div className="flex items-center gap-3.5">
                          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />
                          <div>
                            <p className="font-semibold text-slate-100 print:text-slate-900">{act.title || act.activity_details?.name || 'Activity'}</p>
                            <p className="text-xs text-slate-400 capitalize print:text-slate-600">{act.activity_type || 'Experience'}</p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-sky-300 print:text-sky-800">
                          ₹{Number(act.cost || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-800 p-4 text-center text-xs text-slate-400">
                      Scenic relaxation & free exploration time in this city.
                    </div>
                  )}
                </div>
              </section>
            ))
          ) : (
            demoDays.map((day) => (
              <section key={day.day} className="rounded-3xl border border-slate-800/80 bg-slate-900/70 p-6 sm:p-8 backdrop-blur-xl shadow-lg print:bg-white print:border-slate-300">
                <div className="flex flex-col gap-2 border-b border-slate-800 pb-5 sm:flex-row sm:items-end sm:justify-between print:border-slate-200">
                  <div>
                    <span className="rounded-full bg-sky-500/10 border border-sky-400/30 px-3 py-1 text-xs font-bold uppercase tracking-wider text-sky-300 print:text-sky-800">
                      Day {day.day}
                    </span>
                    <h3 className="mt-2 text-2xl font-bold text-white print:text-slate-950">{day.title}</h3>
                  </div>
                  <span className="text-xs font-medium text-slate-400 print:text-slate-600">{day.date}</span>
                </div>
                <div className="mt-5 space-y-3">
                  {day.stops.map(([time, title]) => (
                    <div key={`${day.day}-${time}`} className="flex items-center gap-4 rounded-2xl border border-slate-800/80 bg-slate-950/50 p-4 print:bg-slate-50 print:border-slate-200">
                      <span className="w-14 text-sm font-bold text-sky-300 print:text-sky-800">{time}</span>
                      <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />
                      <span className="font-medium text-slate-200 print:text-slate-900">{title}</span>
                    </div>
                  ))}
                </div>
              </section>
            ))
          )}
        </div>

        {/* Footer CTA */}
        <div className="mt-12 rounded-3xl border border-slate-800 bg-slate-900/40 p-8 text-center backdrop-blur-md print:hidden">
          <h3 className="text-xl font-bold text-white">Inspired by this journey?</h3>
          <p className="mt-2 text-sm text-slate-400">Create, customize, and budget your own multi-city trip in minutes with Chalo Chalein.</p>
          <button
            type="button"
            onClick={() => navigate('/builder')}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-xl shadow-sky-500/25 transition hover:scale-105"
          >
            <span>✨</span> Build Your Own Itinerary
          </button>
        </div>

        <p className="py-8 text-center text-xs text-slate-400 print:text-slate-500">
          Shared via <span className="text-sky-400 font-semibold">Chalo Chalein</span> · Collaborative Smart Travel Planner
        </p>
      </div>
    </main>
  );
};

export default PublicSharedItineraryPage;
