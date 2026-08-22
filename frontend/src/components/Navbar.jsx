import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "./Button";

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    `text-xs uppercase tracking-wide transition-colors ${
      isActive ? "text-clay font-bold" : "text-ink hover:text-clay"
    }`;

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[92vw] max-w-3xl">
      <div className="flex items-center justify-between gap-4 px-6 py-3 rounded-full backdrop-blur-lg bg-white/20 border border-white/50 shadow-lg">
        <NavLink to="/" className="font-display text-base text-ink shrink-0 font-extrabold flex items-center gap-1.5">
          <span>🚀</span> Chalo Chalein
        </NavLink>

        <div className="hidden sm:flex items-center gap-5">
          <NavLink to="/discover" className={linkClass}>
            Discover
          </NavLink>
          <NavLink to="/analytics" className={linkClass}>
            Analytics
          </NavLink>
          {isAuthenticated ? (
            <>
              <NavLink to="/dashboard" className={linkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/trips" className={linkClass}>
                Trips
              </NavLink>
              <NavLink to="/discovery" className={linkClass}>
                Discover
              </NavLink>
              <NavLink to="/admin-dashboard" className={linkClass}>
                Admin Stats
              </NavLink>
              <NavLink to="/profile" className={linkClass}>
                Profile
              </NavLink>
            </>
          ) : (
            <NavLink to="/" className={linkClass}>
              Home
            </NavLink>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-4 shrink-0">
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="text-xs uppercase tracking-wide text-ink/60 hover:text-clay cursor-pointer"
            >
              Log out
            </button>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>
                Log in
              </NavLink>
              <NavLink to="/signup">
                <Button variant="solid" className="!px-4 !py-1.5 !text-xs">
                  Sign up
                </Button>
              </NavLink>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="sm:hidden text-ink cursor-pointer"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          ☰
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden mt-2 rounded-2xl backdrop-blur-lg bg-white/30 border border-white/50 shadow-lg p-4 flex flex-col gap-3">
          <NavLink to="/discover" className={linkClass} onClick={() => setMenuOpen(false)}>
            Discover
          </NavLink>
          <NavLink to="/analytics" className={linkClass} onClick={() => setMenuOpen(false)}>
            Analytics
          </NavLink>
          {isAuthenticated ? (
            <>
              <NavLink to="/dashboard" className={linkClass} onClick={() => setMenuOpen(false)}>
                Dashboard
              </NavLink>
              <NavLink to="/trips" className={linkClass} onClick={() => setMenuOpen(false)}>
                Trips
              </NavLink>
              <NavLink to="/discovery" className={linkClass} onClick={() => setMenuOpen(false)}>
                Discover
              </NavLink>
              <NavLink to="/admin-dashboard" className={linkClass} onClick={() => setMenuOpen(false)}>
                Admin Stats
              </NavLink>
              <NavLink to="/profile" className={linkClass} onClick={() => setMenuOpen(false)}>
                Profile
              </NavLink>
              <button
                onClick={handleLogout}
                className="text-xs uppercase tracking-wide text-ink/60 text-left cursor-pointer"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/" className={linkClass} onClick={() => setMenuOpen(false)}>
                Home
              </NavLink>
              <NavLink to="/login" className={linkClass} onClick={() => setMenuOpen(false)}>
                Log in
              </NavLink>
              <NavLink to="/signup" className={linkClass} onClick={() => setMenuOpen(false)}>
                Sign up
              </NavLink>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
