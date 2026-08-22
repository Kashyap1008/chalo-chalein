import React, { useState } from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const isAdmin =
    user?.is_staff ||
    user?.is_superuser ||
    user?.email?.startsWith("admin") ||
    user?.username?.startsWith("admin");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinkClass = ({ isActive }) =>
    `px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
      isActive
        ? "bg-clay text-white shadow-xs"
        : "text-ink/70 hover:text-ink hover:bg-black/5"
    }`;

  return (
    <header className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[94vw] max-w-4xl">
      <nav className="flex items-center justify-between gap-3 px-5 py-2.5 rounded-full backdrop-blur-xl bg-white/70 border border-white/80 shadow-lg shadow-black/5">
        {/* Brand Logo */}
        <Link
          to={isAdmin ? "/analytics" : "/"}
          className="flex items-center gap-2 font-display text-base font-bold text-ink shrink-0 hover:opacity-90 transition"
        >
          <span className="w-7 h-7 rounded-full bg-clay text-white flex items-center justify-center text-xs shadow-xs font-sans">
            ✈
          </span>
          <span className="tracking-tight">
            Chalo Chalein {isAdmin && <span className="text-[10px] uppercase font-sans font-bold text-clay ml-1">Admin</span>}
          </span>
        </Link>

        {/* Center Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1.5">
          {isAuthenticated ? (
            isAdmin ? (
              /* Admin Only sees Analytics */
              <NavLink to="/analytics" className={navLinkClass}>
                Analytics
              </NavLink>
            ) : (
              /* Regular Travelers see Dashboard, Trips, Discover */
              <>
                <NavLink to="/dashboard" className={navLinkClass}>
                  Dashboard
                </NavLink>
                <NavLink to="/trips" className={navLinkClass}>
                  Trips
                </NavLink>
                <NavLink to="/discover" className={navLinkClass}>
                  Discover
                </NavLink>
              </>
            )
          ) : (
            /* Logged Out Visitors see Home & Discover */
            <>
              <NavLink to="/" className={navLinkClass}>
                Home
              </NavLink>
              <NavLink to="/discover" className={navLinkClass}>
                Discover
              </NavLink>
            </>
          )}
        </div>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `flex items-center gap-2 text-xs font-semibold px-2.5 py-1 rounded-full border transition ${
                    isActive
                      ? "border-clay bg-clay/10 text-clay"
                      : "border-line/80 bg-white/80 text-ink/80 hover:border-clay"
                  }`
                }
              >
                <span className="w-5 h-5 rounded-full bg-clay text-white text-[10px] font-bold flex items-center justify-center">
                  {(user?.name || user?.username || "A").charAt(0).toUpperCase()}
                </span>
                <span className="max-w-[100px] truncate">
                  {user?.name || user?.username || (isAdmin ? "Admin" : "Profile")}
                </span>
              </NavLink>

              <button
                onClick={handleLogout}
                className="text-xs uppercase tracking-wider font-semibold text-ink/50 hover:text-red-600 transition px-2 py-1 cursor-pointer"
                title="Log out of account"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <NavLink
                to="/login"
                className="text-xs uppercase tracking-wider font-semibold text-ink/70 hover:text-clay px-3 py-1.5"
              >
                Log in
              </NavLink>
              <NavLink to="/signup">
                <Button variant="solid" className="!px-4 !py-1.5 !text-xs !rounded-full">
                  Sign up
                </Button>
              </NavLink>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className="md:hidden text-ink p-1.5 rounded-lg hover:bg-black/5 transition"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle Navigation Menu"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </nav>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="md:hidden mt-2 p-4 rounded-3xl backdrop-blur-xl bg-white/90 border border-white/80 shadow-2xl flex flex-col gap-2">
          {isAuthenticated ? (
            isAdmin ? (
              <>
                <NavLink to="/analytics" className={navLinkClass} onClick={() => setMenuOpen(false)}>
                  Analytics
                </NavLink>
                <NavLink to="/profile" className={navLinkClass} onClick={() => setMenuOpen(false)}>
                  Profile ({user?.name || user?.username || "Admin"})
                </NavLink>
                <div className="pt-2 border-t border-line/50">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left text-xs uppercase tracking-wider font-semibold text-red-600 px-3 py-2 hover:bg-red-50 rounded-xl transition cursor-pointer"
                  >
                    Log out
                  </button>
                </div>
              </>
            ) : (
              <>
                <NavLink to="/dashboard" className={navLinkClass} onClick={() => setMenuOpen(false)}>
                  Dashboard
                </NavLink>
                <NavLink to="/trips" className={navLinkClass} onClick={() => setMenuOpen(false)}>
                  Trips
                </NavLink>
                <NavLink to="/discover" className={navLinkClass} onClick={() => setMenuOpen(false)}>
                  Discover
                </NavLink>
                <NavLink to="/profile" className={navLinkClass} onClick={() => setMenuOpen(false)}>
                  Profile ({user?.name || user?.username})
                </NavLink>
                <div className="pt-2 border-t border-line/50">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left text-xs uppercase tracking-wider font-semibold text-red-600 px-3 py-2 hover:bg-red-50 rounded-xl transition cursor-pointer"
                  >
                    Log out
                  </button>
                </div>
              </>
            )
          ) : (
            <>
              <NavLink to="/" className={navLinkClass} onClick={() => setMenuOpen(false)}>
                Home
              </NavLink>
              <NavLink to="/discover" className={navLinkClass} onClick={() => setMenuOpen(false)}>
                Discover
              </NavLink>
              <div className="pt-2 border-t border-line/50 flex flex-col gap-2">
                <NavLink to="/login" className={navLinkClass} onClick={() => setMenuOpen(false)}>
                  Log in
                </NavLink>
                <NavLink to="/signup" onClick={() => setMenuOpen(false)}>
                  <Button variant="solid" className="w-full !py-2 !text-xs !rounded-xl">
                    Sign up
                  </Button>
                </NavLink>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
}
