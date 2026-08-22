import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function TripCard({ trip, onDelete }) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const formatDate = (d) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await onDelete(trip.id);
    } finally {
      setDeleting(false);
      setConfirmingDelete(false);
    }
  };

  return (
    <div className="rounded-[22px] border border-line bg-white/40 p-5 flex flex-col gap-3">
      <div>
        <h3 className="font-display text-lg text-ink">{trip.name}</h3>
        <p className="text-sm text-ink/60">
          {formatDate(trip.start_date)} – {formatDate(trip.end_date)}
        </p>
        <p className="text-xs text-ink/50 mt-1">
          {trip.stop_count ?? 0} {trip.stop_count === 1 ? "stop" : "stops"}
        </p>
      </div>

      {!confirmingDelete ? (
        <div className="flex gap-3 mt-2 text-sm">
          <Link to={`/trips/${trip.id}`} className="text-clay hover:underline">
            View
          </Link>
          <Link
            to={`/trips/${trip.id}/edit`}
            className="text-ink/70 hover:underline"
          >
            Edit
          </Link>
          <button
            onClick={() => setConfirmingDelete(true)}
            className="text-ink/50 hover:text-red-600 ml-auto"
          >
            Delete
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3 mt-2 text-sm">
          <span className="text-ink/70">Delete this trip?</span>
          <button
            onClick={handleDeleteConfirm}
            disabled={deleting}
            className="text-red-600 font-medium hover:underline disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Yes"}
          </button>
          <button
            onClick={() => setConfirmingDelete(false)}
            disabled={deleting}
            className="text-ink/50 hover:underline"
          >
            No
          </button>
        </div>
      )}
    </div>
  );
}
