import React from "react";

export default function Input({ label, error, className = "", ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-ink mb-1">
          {label}
        </label>
      )}
      <input
        className={`w-full rounded-lg border border-line bg-white/60 px-4 py-2.5 text-ink focus:outline-none focus:ring-2 focus:ring-clay ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
