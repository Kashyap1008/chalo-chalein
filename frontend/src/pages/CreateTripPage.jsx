import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../api/axios";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import Input from "../components/Input";

export default function CreateTripPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    start_date: "",
    end_date: "",
    description: "",
    cover_photo_url: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = "Trip name is required.";
    if (!form.start_date) errors.start_date = "Start date is required.";
    if (!form.end_date) errors.end_date = "End date is required.";
    if (
      form.start_date &&
      form.end_date &&
      new Date(form.end_date) < new Date(form.start_date)
    ) {
      errors.end_date = "End date can't be before the start date.";
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
      const res = await axios.post("/trips/", form);
      navigate(`/trips/${res.data.id}`);
    } catch (err) {
      setSubmitError(
        err.response?.data?.detail || "Couldn't create the trip. Try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      <main className="max-w-xl mx-auto px-6 pt-28 pb-16">
        <h1 className="font-display text-3xl text-ink mb-8">Plan a new trip</h1>

        {submitError && (
          <div className="mb-6 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <Input
            label="Trip name"
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            error={fieldErrors.name}
          />

          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                label="Start date"
                type="date"
                name="start_date"
                value={form.start_date}
                onChange={handleChange}
                error={fieldErrors.start_date}
              />
            </div>
            <div className="flex-1">
              <Input
                label="End date"
                type="date"
                name="end_date"
                value={form.end_date}
                onChange={handleChange}
                error={fieldErrors.end_date}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-lg border border-line bg-white/60 px-4 py-2.5 text-ink focus:outline-none focus:ring-2 focus:ring-clay resize-none"
            />
          </div>

          <Input
            label="Cover photo URL (optional)"
            type="url"
            name="cover_photo_url"
            value={form.cover_photo_url}
            onChange={handleChange}
            placeholder="https://…"
          />

          <div className="flex items-center gap-4 mt-2">
            <Button type="submit" variant="solid" loading={submitting}>
              Create trip
            </Button>
            <Link to="/trips" className="text-sm text-ink/60 hover:underline">
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
