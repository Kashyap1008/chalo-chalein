import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import Input from "../components/Input";
import GlassCard from "../components/GlassCard";

export default function RegisterPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = "Name is required.";
    if (!form.email.trim()) {
      errors.email = "Email is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      errors.email = "Enter a valid email address.";
    }
    if (!form.password) {
      errors.password = "Password is required.";
    } else if (form.password.length < 8) {
      errors.password = "Password must be at least 8 characters.";
    }
    if (form.confirmPassword !== form.password) {
      errors.confirmPassword = "Passwords don't match.";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    if (!validate()) return;

    setSubmitting(true);
    try {
      await signup({
        name: form.name,
        email: form.email,
        password: form.password,
      });
      navigate("/dashboard");
    } catch (err) {
      setSubmitError(
        err.response?.data?.detail || "Couldn't create your account. Try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-6 py-12">
      <GlassCard className="w-full max-w-sm p-8">
        <h1 className="font-display text-2xl text-ink mb-1">Create an account</h1>
        <p className="text-sm text-ink/60 mb-6">Start planning in a minute.</p>

        {submitError && (
          <div className="mb-5 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <Input
            label="Name"
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            error={fieldErrors.name}
            autoComplete="name"
          />
          <Input
            label="Email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            error={fieldErrors.email}
            autoComplete="email"
          />
          <Input
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            error={fieldErrors.password}
            autoComplete="new-password"
          />
          <Input
            label="Confirm password"
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            error={fieldErrors.confirmPassword}
            autoComplete="new-password"
          />
          <Button type="submit" variant="solid" loading={submitting} className="mt-2">
            Sign up
          </Button>
        </form>

        <p className="text-sm text-ink/60 text-center mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-clay hover:underline">
            Log in
          </Link>
        </p>
      </GlassCard>
    </div>
  );
}
