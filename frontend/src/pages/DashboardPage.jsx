import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import TripCard from "../components/TripCard";

export default function DashboardPage() {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchTrips() {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get("/trips/");
        const tripList = Array.isArray(res.data) ? res.data : (res.data?.results || []);
        if (isMounted) setTrips(tripList.slice(0, 3));
      } catch (err) {
        if (isMounted) setError("Couldn't load your trips. Try refreshing.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchTrips();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/trips/${id}/`);
      setTrips((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError("Couldn't delete that trip. Try again.");
    }
  };

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 pt-28 pb-16">
        <h1 className="font-display text-3xl text-ink mb-1">
          Welcome back{user?.name ? `, ${user.name}` : ""}
        </h1>
        <p className="text-ink/60 mb-8">Here's where your trips stand.</p>

        {error && (
          <div className="mb-6 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-[22px] bg-paper-deep animate-pulse" />
            ))}
          </div>
        )}

        {!loading && !error && trips.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center py-20 gap-4 mb-4">
            <p className="text-ink/60">You haven't planned any trips yet.</p>
            <Link to="/trips/new">
              <Button variant="glass">+ Plan New Trip</Button>
            </Link>
          </div>
        )}

        {!loading && !error && trips.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {trips.map((trip) => (
                <TripCard key={trip.id} trip={trip} onDelete={handleDelete} />
              ))}
            </div>
            <Link to="/trips/new">
              <Button variant="solid">+ Plan New Trip</Button>
            </Link>
          </>
        )}
      </main>
    </div>
  );
}
