import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GlassCard from './GlassCard';
import Button from './Button';

const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(
        new Date(`${value}T12:00:00`)
      )
    : 'No date set';

const formatBudget = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

const TripCard = ({ trip, onDelete }) => {
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setDeleting(true);
    try {
      await onDelete?.(trip.id);
    } finally {
      setDeleting(false);
      setConfirming(false);
    }
  };

  return (
    <GlassCard
      onClick={() => navigate(`/trips/${trip.id}`)}
      className="cursor-pointer hover:border-cyan-500/30 transition-all group overflow-hidden !p-0"
    >
      {/* Cover */}
      <div className="h-32 w-full relative bg-gradient-to-br from-cyan-900/40 to-[#0f172a] overflow-hidden">
        {trip.cover_photo ? (
          <img
            src={trip.cover_photo}
            alt={trip.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🧳</div>
        )}
        {trip.is_public && (
          <span className="absolute top-3 right-3 text-xs font-semibold px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Public
          </span>
        )}
      </div>

      <div className="p-5">
        <h3 className="text-lg font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
          {trip.name}
        </h3>
        <p className="text-sm text-slate-400 mt-1">
          {formatDate(trip.start_date)} — {formatDate(trip.end_date)}
        </p>

        <div className="flex items-center justify-between mt-4 text-sm">
          <span className="text-slate-400">
            {trip.stop_count} {trip.stop_count === 1 ? 'stop' : 'stops'}
          </span>
          <span className="text-cyan-300 font-semibold">{formatBudget(trip.total_budget)}</span>
        </div>

        {onDelete && (
          <div className="mt-4 pt-4 border-t border-[#1e293b] flex justify-end">
            {confirming ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Delete this trip?</span>
                <Button
                  variant="ghost"
                  className="!px-2 !py-1 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirming(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  className="!px-2 !py-1 text-xs"
                  loading={deleting}
                  onClick={handleDelete}
                >
                  Confirm
                </Button>
              </div>
            ) : (
              <Button variant="ghost" className="!px-2 !py-1 text-xs" onClick={handleDelete}>
                Delete
              </Button>
            )}
          </div>
        )}
      </div>
    </GlassCard>
  );
};

export default TripCard;
