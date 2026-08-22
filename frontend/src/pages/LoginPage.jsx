import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import Input from "../components/Input";
import GlassCard from "../components/GlassCard";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Mode: "user" | "admin"
  const [loginMode, setLoginMode] = useState("user");
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleModeSwitch = (mode) => {
    setLoginMode(mode);
    setError("");
    setForm({ email: "", password: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email.trim() || !form.password) {
      setError("Enter your credentials to continue.");
      return;
    }

    setSubmitting(true);
    try {
      await login(form.email.trim(), form.password);

      // Route according to login mode
      if (loginMode === "admin") {
        navigate("/analytics");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      const data = err.response?.data;
      let msg = "Couldn't log in. Check your credentials.";
      if (data) {
        if (typeof data === "string") msg = data;
        else if (data.detail) msg = data.detail;
        else if (data.non_field_errors)
          msg = Array.isArray(data.non_field_errors)
            ? data.non_field_errors[0]
            : data.non_field_errors;
      }
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-4 py-12">
      {/* Top Brand Link */}
      <Link to="/" className="mb-6 flex items-center gap-2 font-display text-xl font-bold text-ink">
        <span className="w-8 h-8 rounded-full bg-clay text-white flex items-center justify-center text-xs shadow-xs font-sans">
          ✈
        </span>
        <span>Chalo Chalein</span>
      </Link>

      <GlassCard className="w-full max-w-md p-8 sm:p-9 shadow-2xl relative overflow-hidden">
        {/* Two Login Options Switcher */}
        <div className="flex p-1 rounded-xl bg-paper-deep border border-line mb-7">
          <button
            type="button"
            onClick={() => handleModeSwitch("user")}
            className={`flex-1 py-2 text-xs uppercase tracking-wider font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              loginMode === "user"
                ? "bg-white text-clay shadow-sm"
                : "text-ink/60 hover:text-ink"
            }`}
          >
            <span>🎒</span> Traveler Login
          </button>
          <button
            type="button"
            onClick={() => handleModeSwitch("admin")}
            className={`flex-1 py-2 text-xs uppercase tracking-wider font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              loginMode === "admin"
                ? "bg-clay text-white shadow-sm"
                : "text-ink/60 hover:text-ink"
            }`}
          >
            <span>🛡️</span> Admin Portal
          </button>
        </div>

        {/* Dynamic Header based on Option */}
        {loginMode === "user" ? (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-wider font-bold text-clay">
                Traveler Account
              </span>
            </div>
            <h1 className="font-display text-3xl text-ink font-bold">Welcome back</h1>
            <p className="text-xs text-ink/60 mt-1">
              Log in to manage your custom trips, budgets, and saved itineraries.
            </p>
          </div>
        ) : (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-clay text-white text-[10px]">
                🔒 Administrative Portal
              </span>
            </div>
            <h1 className="font-display text-3xl text-ink font-bold">Admin Authentication</h1>
            <p className="text-xs text-ink/60 mt-1">
              Enter administrative credentials to access platform analytics and system logs.
            </p>
          </div>
        )}

        {error && (
          <div className="mb-5 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <Input
            label={loginMode === "admin" ? "Admin Username or Email" : "Email or Username"}
            type="text"
            name="email"
            placeholder={loginMode === "admin" ? "Enter admin identifier" : "Enter your email or username"}
            value={form.email}
            onChange={handleChange}
            autoComplete={loginMode === "admin" ? "off" : "username"}
            required
          />
          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
            required
          />

          <Button
            type="submit"
            variant="solid"
            loading={submitting}
            className={`mt-2 !py-2.5 ${loginMode === "admin" ? "!bg-clay hover:!bg-clay/90" : ""}`}
          >
            {loginMode === "admin" ? "Authenticate Admin →" : "Sign In to Dashboard →"}
          </Button>
        </form>

        {loginMode === "user" && (
          <p className="text-xs text-ink/60 text-center mt-6 pt-4 border-t border-line/50">
            New traveler?{" "}
            <Link to="/signup" className="text-clay font-bold hover:underline">
              Create an account
            </Link>
          </p>
        )}
      </GlassCard>
    </div>
  );
}
