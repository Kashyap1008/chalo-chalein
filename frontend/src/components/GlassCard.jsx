import React from "react";

export default function GlassCard({ children, className = "" }) {
  return (
    <div
      className={`rounded-[22px] backdrop-blur-lg bg-white/25 border border-white/50 shadow-lg ${className}`}
    >
      {children}
    </div>
  );
}
