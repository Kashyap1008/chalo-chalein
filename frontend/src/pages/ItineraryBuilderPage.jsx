import { useMemo, useState } from 'react';

const starterPlan = [
  {
    day: 1,
    title: 'Arrival in Paris',
    date: 'Apr 18',
    activities: [
      { time: '09:00', name: 'Check-in at Le Marais', cost: 140, type: 'Stay' },
      { time: '12:00', name: 'Seine river stroll', cost: 18, type: 'Explore' },
      { time: '19:00', name: 'French bistro dinner', cost: 42, type: 'Food' },
    ],
  },
  {
    day: 2,
    title: 'Art & landmarks',
    date: 'Apr 19',
    activities: [
      { time: '08:30', name: 'Louvre museum pass', cost: 22, type: 'Culture' },
      { time: '13:00', name: 'Lunch in Saint-Germain', cost: 26, type: 'Food' },
      { time: '18:30', name: 'Eiffel Tower sunset', cost: 35, type: 'Experience' },
    ],
  },
  {
    day: 3,
    title: 'Day trip & shopping',
    date: 'Apr 20',
    activities: [
      { time: '09:00', name: 'Montmartre walking tour', cost: 16, type: 'Explore' },
      { time: '15:00', name: 'Boutique shopping', cost: 80, type: 'Shopping' },
      { time: '20:00', name: 'River cruise', cost: 48, type: 'Experience' },
    ],
  },
];

const budgetBreakdown = {
  stay: 420,
  transport: 180,
  food: 210,
  activities: 310,
  flights: 540,
};

const ItineraryBuilderPage = () => {
  const [tripName, setTripName] = useState('Paris Weekend Escape');
  const [city, setCity] = useState('Paris, France');
  const [startDate, setStartDate] = useState('2026-04-18');
  const [endDate, setEndDate] = useState('2026-04-21');
  const [travelers, setTravelers] = useState(2);
  const [plan, setPlan] = useState(starterPlan);

  const totalBudget = useMemo(
    () => Object.values(budgetBreakdown).reduce((sum, value) => sum + value, 0),
    []
  );

  const addDay = () => {
    setPlan((current) => [
      ...current,
      {
        day: current.length + 1,
        title: `Day ${current.length + 1}`,
        date: `Apr ${20 + current.length}`,
        activities: [
          { time: '09:00', name: 'Local discovery walk', cost: 12, type: 'Explore' },
          { time: '13:00', name: 'Coffee + lunch', cost: 22, type: 'Food' },
        ],
      },
    ]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-white">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-indigo-300">Trip planner</p>
          <h1 className="mt-2 text-4xl font-bold">Itinerary Builder</h1>
        </div>
        <button
          type="button"
          onClick={addDay}
          className="rounded-xl bg-indigo-600 px-4 py-2.5 font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-500"
        >
          + Add day
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6 shadow-2xl">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Trip name</span>
                <input
                  value={tripName}
                  onChange={(event) => setTripName(event.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none ring-0 transition focus:border-indigo-400"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Destination</span>
                <input
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-indigo-400"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Start date</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-indigo-400"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">End date</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-indigo-400"
                />
              </label>
            </div>

            <div className="mt-5 flex items-center justify-between rounded-xl border border-slate-700 bg-slate-950/60 p-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Travelers</p>
                <p className="mt-1 text-lg font-semibold">{travelers} people</p>
              </div>
              <input
                type="range"
                min="1"
                max="6"
                value={travelers}
                onChange={(event) => setTravelers(Number(event.target.value))}
                className="w-32 accent-indigo-500"
              />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Daily plan</h2>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                {plan.length} days
              </span>
            </div>

            <div className="space-y-5">
              {plan.map((dayPlan) => (
                <div key={dayPlan.day} className="rounded-2xl border border-slate-700 bg-slate-950/60 p-4">
                  <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Day {dayPlan.day}</p>
                      <h3 className="text-xl font-semibold text-white">{dayPlan.title}</h3>
                    </div>
                    <span className="text-sm text-slate-400">{dayPlan.date}</span>
                  </div>

                  <div className="space-y-3">
                    {dayPlan.activities.map((item) => (
                      <div key={`${dayPlan.day}-${item.time}-${item.name}`} className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2.5">
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{item.time}</p>
                          <p className="mt-1 font-medium text-slate-200">{item.name}</p>
                        </div>
                        <div className="text-right">
                          <span className="rounded-full bg-indigo-500/10 px-2 py-1 text-xs text-indigo-300">{item.type}</span>
                          <p className="mt-1 text-sm font-semibold text-emerald-300">${item.cost}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-slate-700 bg-gradient-to-br from-indigo-600/20 to-slate-900 p-6">
            <p className="text-sm uppercase tracking-[0.2em] text-indigo-300">Overview</p>
            <h2 className="mt-2 text-2xl font-bold">{tripName}</h2>
            <p className="mt-3 text-slate-300">{city}</p>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-slate-200">
              <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-3">
                <p className="text-slate-400">Starts</p>
                <p className="mt-1 font-semibold">{startDate}</p>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-3">
                <p className="text-slate-400">Ends</p>
                <p className="mt-1 font-semibold">{endDate}</p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6">
            <h3 className="text-xl font-semibold">Budget snapshot</h3>
            <div className="mt-4 space-y-3">
              {Object.entries(budgetBreakdown).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between text-sm text-slate-300">
                    <span className="capitalize">{key}</span>
                    <span>${value}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-400"
                      style={{ width: `${Math.min((value / totalBudget) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
              <p className="text-sm text-slate-300">Estimated total</p>
              <p className="mt-1 text-3xl font-bold text-emerald-300">${totalBudget}</p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default ItineraryBuilderPage;
