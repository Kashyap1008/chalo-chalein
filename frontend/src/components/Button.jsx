import React from "react";

export default function Button({
  variant = "solid",
  loading = false,
  disabled = false,
  children,
  className = "",
  type = "button",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium tracking-wide transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed";

  const variants = {
    solid: "bg-ink text-paper hover:opacity-90",
    glass:
      "backdrop-blur-lg bg-white/20 border border-white/50 shadow-lg text-ink hover:bg-white/30",
    ghost: "text-ink hover:text-clay bg-transparent",
  };

  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}
