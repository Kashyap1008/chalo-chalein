import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import Input from "../components/Input";
import GlassCard from "../components/GlassCard";

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
];

export default function ProfilePage() {
  const { user, updateUser, deleteAccount } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    photo_url: user?.photo_url || "",
    language: user?.language || "en",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setSaveSuccess(false);
  };

  const validate = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = "Name is required.";
    if (!form.email.trim()) {
      errors.email = "Email is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      errors.email = "Enter a valid email address.";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveError("");
    setSaveSuccess(false);

    if (!validate()) return;

    setSaving(true);
    try {
      await updateUser(form);
      setSaveSuccess(true);
    } catch (err) {
      setSaveError(
        err.response?.data?.detail || "Couldn't save your changes. Try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleteError("");
    setDeleting(true);
    try {
      await deleteAccount();
      navigate("/");
    } catch (err) {
      setDeleteError(
        err.response?.data?.detail || "Couldn't delete your account. Try again."
      );
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      <main className="max-w-xl mx-auto px-6 pt-28 pb-16">
        <h1 className="font-display text-3xl text-ink mb-1">Profile & settings</h1>
        <p className="text-ink/60 mb-8">
          Update how your account looks and works.
        </p>

        <GlassCard className="p-8 mb-8">
          {saveError && (
            <div className="mb-5 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              {saveError}
            </div>
          )}
          {saveSuccess && (
            <div className="mb-5 text-sm text-clay bg-white/40 border border-line rounded-lg px-4 py-3">
              Saved.
            </div>
          )}

          <form onSubmit={handleSave} noValidate className="flex flex-col gap-4">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-16 h-16 rounded-full bg-paper-deep border border-line overflow-hidden shrink-0 flex items-center justify-center">
                {form.photo_url ? (
                  <img
                    src={form.photo_url}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <span className="font-display text-xl text-ink/40">
                    {(form.name || "?").charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <Input
                  label="Photo URL"
                  type="url"
                  name="photo_url"
                  value={form.photo_url}
                  onChange={handleChange}
                  placeholder="https://…"
                />
              </div>
            </div>

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

            <div>
              <label className="block text-sm font-medium text-ink mb-1">
                Language
              </label>
              <select
                name="language"
                value={form.language}
                onChange={handleChange}
                className="w-full rounded-lg border border-line bg-white/60 px-4 py-2.5 text-ink focus:outline-none focus:ring-2 focus:ring-clay"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>

            <Button type="submit" variant="solid" loading={saving} className="mt-2 self-start">
              Save changes
            </Button>
          </form>
        </GlassCard>

        <GlassCard className="p-8">
          <h2 className="font-display text-lg text-ink mb-1">Delete account</h2>
          <p className="text-sm text-ink/60 mb-4">
            This permanently removes your account and every trip you've created.
            This can't be undone.
          </p>

          {deleteError && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              {deleteError}
            </div>
          )}

          {!confirmingDelete ? (
            <Button variant="ghost" onClick={() => setConfirmingDelete(true)}>
              Delete my account
            </Button>
          ) : (
            <div className="flex items-center gap-4">
              <span className="text-sm text-ink/70">Are you sure?</span>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="text-sm text-red-600 font-medium hover:underline disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Yes, delete it"}
              </button>
              <button
                onClick={() => setConfirmingDelete(false)}
                disabled={deleting}
                className="text-sm text-ink/50 hover:underline"
              >
                Cancel
              </button>
            </div>
          )}
        </GlassCard>
      </main>
    </div>
  );
}
