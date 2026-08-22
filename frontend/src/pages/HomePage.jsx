import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import GlassCard from "../components/GlassCard";
import TextLoop from "../components/TextLoop";

const FEATURES = [
  {
    n: "01",
    title: "Day-by-day itineraries",
    body: "Add stops, assign dates, and reorder cities freely. The plan builds itself as you go.",
  },
  {
    n: "02",
    title: "Live budget tracking",
    body: "Every activity and stay rolls up into one running total, broken down by category.",
  },
  {
    n: "03",
    title: "Share the plan",
    body: "A public link anyone can view — read-only, or copy it as their own starting point.",
  },
];

const STEPS = [
  { n: "01", title: "Start a trip", body: "Name it, set your dates, add a short description. That's your foundation." },
  { n: "02", title: "Add your stops", body: "Search cities, drop them into the trip, and set how long you'll stay in each." },
  { n: "03", title: "Fill in activities", body: "Browse by interest or cost, attach to a day, and watch the budget update live." },
  { n: "04", title: "Share it", body: "Get a public link for the finished plan — send it, post it, or let others copy it." },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-paper text-ink overflow-x-hidden">
      <Navbar />

      <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-12">
        <span className="uppercase tracking-[0.3em] text-xs text-clay font-semibold mb-5">
          Multi-city trip planning
        </span>
        <h1 className="font-display text-5xl sm:text-6xl md:text-7xl leading-[0.95]">
          Chalo <em className="text-clay not-italic italic">Chalein.</em>
        </h1>
        <p className="mt-5 text-ink/60 max-w-md text-base">
          Build the itinerary, track the budget, share the plan — all before
          the first flight leaves the ground.
        </p>
        <Link to="/signup" className="mt-8 mb-6">
          <Button variant="glass">Start planning →</Button>
        </Link>

        {/* Dynamic Animated Destination Ribbon */}
        <div className="w-full max-w-5xl my-4">
          <TextLoop
            text="Goa ✦ Manali ✦ Jaipur ✦ Udaipur ✦ Varanasi ✦ Leh-Ladakh ✦ Paris ✦ Rome ✦ Kyoto ✦ Bangkok ✦ Dubai ✦ Kathmandu ✦ Rishikesh ✦ Amritsar ✦ Agra"
            shape="wave"
            speed={85}
            direction="forward"
            separator="✦"
            curviness={85}
            fontSize={42}
            fontWeight={800}
            letterSpacing={2}
            uppercase
            color="#ffffff"
            ribbon
            ribbonColor="#c45838"
            ribbonWidth={80}
            pauseOnHover
          />
        </div>
      </section>

      <section className="bg-paper-deep py-28 px-6">
        <div className="text-center mb-14">
          <span className="uppercase tracking-[0.3em] text-xs text-clay font-semibold">
            Why it works
          </span>
          <h2 className="font-display text-3xl sm:text-4xl mt-3">
            Everything a trip needs, nothing it doesn't
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {FEATURES.map((f) => (
            <GlassCard key={f.n} className="p-8">
              <span className="font-display text-clay text-sm block mb-3">
                {f.n}
              </span>
              <h3 className="font-display text-xl mb-2">{f.title}</h3>
              <p className="text-sm text-ink/60 leading-relaxed">{f.body}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      <section className="py-28 px-6">
        <div className="text-center mb-14">
          <span className="uppercase tracking-[0.3em] text-xs text-clay font-semibold">
            How it works
          </span>
          <h2 className="font-display text-3xl sm:text-4xl mt-3">
            From idea to itinerary
          </h2>
        </div>

        <div className="max-w-xl mx-auto border-l border-line">
          {STEPS.map((s, i) => (
            <div
              key={s.n}
              className={`relative pl-9 ${i !== STEPS.length - 1 ? "pb-12" : ""}`}
            >
              <span className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-clay" />
              <span className="font-display text-clay text-xs block mb-1">
                {s.n}
              </span>
              <h3 className="font-display text-xl mb-1">{s.title}</h3>
              <p className="text-sm text-ink/60 max-w-sm leading-relaxed">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-ink text-paper text-center py-24 px-6">
        <h2 className="font-display text-4xl mb-3">Ready when you are.</h2>
        <p className="text-paper/50 max-w-sm mx-auto mb-8">
          No credit card, no setup — just start planning your next trip.
        </p>
        <Link to="/signup">
          <Button variant="glass">Plan a trip →</Button>
        </Link>
        <div className="max-w-4xl mx-auto mt-16 pt-6 border-t border-white/10 flex justify-between text-xs text-paper/40">
          <span>Chalo Chalein</span>
          <span>Built for a hackathon, made for real trips</span>
        </div>
      </footer>
    </div>
  );
}
