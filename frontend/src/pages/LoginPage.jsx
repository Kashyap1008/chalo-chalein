import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import Input from "../components/Input";
import GlassCard from "../components/GlassCard";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email.trim() || !form.password) {
      setError("Enter your email or username and password.");
      return;
    }

    setSubmitting(true);
    try {
      await login(form.email.trim(), form.password);
      navigate("/dashboard");
    } catch (err) {
      const data = err.response?.data;
      let msg = "Couldn't log in. Check your credentials.";
      if (data) {
        if (typeof data === "string") msg = data;
        else if (data.detail) msg = data.detail;
        else if (data.non_field_errors) msg = Array.isArray(data.non_field_errors) ? data.non_field_errors[0] : data.non_field_errors;
      }
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-6">
      <GlassCard className="w-full max-w-sm p-8">
        <h1 className="font-display text-2xl text-ink mb-1">Welcome back</h1>
        <p className="text-sm text-ink/60 mb-6">Log in to plan your next trip.</p>

        {error && (
          <div className="mb-5 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
          />
          <Input
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
          />
          <Button type="submit" variant="solid" loading={submitting} className="mt-2">
            Log in
          </Button>
        </form>

        <p className="text-sm text-ink/60 text-center mt-6">
          New here?{" "}
          <Link to="/signup" className="text-clay hover:underline">
            Create an account
          </Link>
        </p>
      </GlassCard>
    </div>
  );
}
