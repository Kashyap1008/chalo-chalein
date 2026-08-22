const itinerary = {
  title: 'Paris Weekend Escape',
  author: 'Alicia',
  city: 'Paris, France',
  dates: 'Apr 18 - Apr 21, 2026',
  summary: 'A relaxed city escape with landmark visits, food stops, and a scenic sunset cruise.',
  days: [
    {
      day: 1,
      title: 'Arrival and city charm',
      activities: [
        { time: '09:00', name: 'Check in at Le Marais boutique stay' },
        { time: '12:00', name: 'Seine river stroll and photos' },
        { time: '19:30', name: 'French bistro dinner with wine pairing' },
      ],
    },
    {
      day: 2,
      title: 'Culture and rooftops',
      activities: [
        { time: '08:30', name: 'Louvre Museum visit' },
        { time: '13:00', name: 'Lunch in Saint-Germain' },
        { time: '18:30', name: 'Eiffel Tower sunset view' },
      ],
    },
    {
      day: 3,
      title: 'Montmartre and evening cruise',
      activities: [
        { time: '09:00', name: 'Montmartre walking tour' },
        { time: '15:00', name: 'Boutique browsing around Rue de Lappe' },
        { time: '20:00', name: 'Sunset river cruise' },
      ],
    },
  ],
};

const PublicSharedItineraryPage = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 text-white">
      <div className="mb-8 rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-600/20 via-slate-900 to-purple-600/20 p-8 shadow-2xl">
        <p className="text-sm uppercase tracking-[0.25em] text-indigo-300">Shared itinerary</p>
        <h1 className="mt-3 text-4xl font-bold">{itinerary.title}</h1>
        <p className="mt-3 max-w-2xl text-slate-300">{itinerary.summary}</p>

        <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-300">
          <span className="rounded-full border border-slate-700 bg-slate-950/60 px-3 py-1.5">By {itinerary.author}</span>
          <span className="rounded-full border border-slate-700 bg-slate-950/60 px-3 py-1.5">{itinerary.city}</span>
          <span className="rounded-full border border-slate-700 bg-slate-950/60 px-3 py-1.5">{itinerary.dates}</span>
        </div>
      </div>

      <div className="space-y-6">
        {itinerary.days.map((day) => (
          <section key={day.day} className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Day {day.day}</p>
                <h2 className="mt-1 text-2xl font-semibold">{day.title}</h2>
              </div>
            </div>

            <div className="space-y-3">
              {day.activities.map((activity) => (
                <div key={`${day.day}-${activity.time}-${activity.name}`} className="flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950/50 p-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{activity.time}</p>
                    <p className="mt-1 font-medium text-slate-200">{activity.name}</p>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300">Planned</span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default PublicSharedItineraryPage;
