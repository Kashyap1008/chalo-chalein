import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import Input from "../components/Input";
import GlassCard from "../components/GlassCard";

export default function ProfilePage() {
  const { user, updateUser, deleteAccount } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: user?.name || user?.first_name || user?.username || "",
    email: user?.email || "",
    bio: user?.bio || "",
    avatar: user?.avatar || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUser({
        name: form.name,
        bio: form.bio,
      });
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.old_password || !passwordForm.new_password) {
      toast.error("Please fill in current and new password.");
      return;
    }
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error("New passwords do not match.");
      return;
    }
    setChangingPassword(true);
    try {
      await axios.post("/auth/change-password/", {
        old_password: passwordForm.old_password,
        new_password: passwordForm.new_password,
      });
      toast.success("Password changed successfully!");
      setPasswordForm({ old_password: "", new_password: "", confirm_password: "" });
    } catch (err) {
      toast.error(err.response?.data?.old_password?.[0] || err.response?.data?.new_password?.[0] || "Failed to update password.");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
      toast.success("Account deleted.");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not delete account.");
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper text-ink pb-20">
      <Navbar />

      <main className="max-w-2xl mx-auto px-6 pt-24">
        <h1 className="font-display text-3xl sm:text-4xl text-ink mb-1">Profile & Settings</h1>
        <p className="text-ink/60 mb-8">
          Manage your account profile and credentials.
        </p>

        {/* Profile Details Card */}
        <GlassCard className="p-8 mb-8">
          <h2 className="font-display text-xl text-ink mb-4">Personal Info</h2>
          <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-16 h-16 rounded-full bg-clay text-white font-display text-2xl font-bold flex items-center justify-center shrink-0">
                {(form.name || "U").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <Input
                  label="Email (Read-only)"
                  type="email"
                  value={form.email}
                  disabled
                  className="bg-paper-deep/60"
                />
              </div>
            </div>

            <Input
              label="Display Name"
              type="text"
              name="name"
              value={form.name}
              onChange={handleProfileChange}
              required
            />

            <div>
              <label className="block text-sm font-medium text-ink mb-1">Bio</label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleProfileChange}
                rows={3}
                placeholder="Tell other travelers a little about yourself..."
                className="w-full rounded-lg border border-line bg-white/60 px-4 py-2 text-ink text-sm outline-none focus:ring-2 focus:ring-clay resize-none"
              />
            </div>

            <Button type="submit" variant="solid" loading={saving} className="self-start mt-2">
              Save Profile
            </Button>
          </form>
        </GlassCard>

        {/* Change Password Card */}
        <GlassCard className="p-8 mb-8">
          <h2 className="font-display text-xl text-ink mb-4">Change Password</h2>
          <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
            <Input
              label="Current Password"
              type="password"
              name="old_password"
              value={passwordForm.old_password}
              onChange={handlePasswordChange}
              required
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="New Password"
                type="password"
                name="new_password"
                value={passwordForm.new_password}
                onChange={handlePasswordChange}
                required
              />
              <Input
                label="Confirm New Password"
                type="password"
                name="confirm_password"
                value={passwordForm.confirm_password}
                onChange={handlePasswordChange}
                required
              />
            </div>
            <Button type="submit" variant="solid" loading={changingPassword} className="self-start mt-2">
              Update Password
            </Button>
          </form>
        </GlassCard>

        {/* Danger Zone */}
        <GlassCard className="p-8 border-red-200">
          <h2 className="font-display text-xl text-red-700 mb-1">Delete Account</h2>
          <p className="text-sm text-ink/60 mb-4">
            Permanently remove your account and all associated trips and custom itineraries.
          </p>

          {!confirmingDelete ? (
            <Button variant="ghost" onClick={() => setConfirmingDelete(true)} className="text-red-600 hover:text-red-700">
              Delete My Account
            </Button>
          ) : (
            <div className="flex items-center gap-4">
              <span className="text-sm text-ink/70">Are you completely sure?</span>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="text-sm text-red-600 font-bold hover:underline"
              >
                {deleting ? "Deleting…" : "Yes, Delete It"}
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
