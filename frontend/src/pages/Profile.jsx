import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { decodeToken } from "../components/ProtectedRoute";
import { Input } from "../components/Input";
import { Button } from "../components/Button";

export const Profile = () => {
  const token = localStorage.getItem("jwtToken");
  const user = decodeToken(token);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    full_name: "",
    phone: "",
    avatar_url: "",
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  // Password Form State
  const [passwordForm, setPasswordForm] = useState({
    old_password: "",
    new_password: "",
    confirm_new_password: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const fetchProfile = async () => {
    try {
      const { data } = await api.get("/profile");
      setProfileForm({
        full_name: data.full_name || "",
        phone: data.phone || "",
        avatar_url: data.avatar_url || "",
      });
    } catch (err) {
      console.error(err);
      setProfileError("Failed to fetch user profile details.");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError("");
    setProfileSuccess("");
    try {
      await api.put("/profile", {
        full_name: profileForm.full_name,
        phone: profileForm.phone,
        avatar_url: profileForm.avatar_url,
      });
      setProfileSuccess("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      setProfileError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError("");
    setPasswordSuccess("");

    if (passwordForm.new_password !== passwordForm.confirm_new_password) {
      setPasswordError("New passwords do not match.");
      setPasswordLoading(false);
      return;
    }

    if (passwordForm.new_password.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      setPasswordLoading(false);
      return;
    }

    try {
      await api.put("/profile/password", {
        old_password: passwordForm.old_password,
        new_password: passwordForm.new_password,
      });
      setPasswordSuccess("Password updated successfully!");
      setPasswordForm({
        old_password: "",
        new_password: "",
        confirm_new_password: "",
      });
    } catch (err) {
      console.error(err);
      setPasswordError(err.response?.data?.message || "Failed to update password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <h2>My Profile Settings</h2>

      <div className="grid-cols-2">
        {/* Profile Info Form */}
        <section className="glass-card">
          <h3>Personal Details</h3>
          <p style={{ color: "var(--text)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
            Update your public name, phone, and display image link.
          </p>

          {profileError && <div className="error-msg">{profileError}</div>}
          {profileSuccess && <div className="success-msg">{profileSuccess}</div>}

          <form onSubmit={handleProfileSubmit}>
            <Input
              label="Full Name"
              name="full_name"
              value={profileForm.full_name}
              onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
              required
            />
            <Input
              label="Phone Number"
              name="phone"
              type="tel"
              value={profileForm.phone}
              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
            />
            <Input
              label="Avatar Image URL"
              name="avatar_url"
              value={profileForm.avatar_url}
              onChange={(e) => setProfileForm({ ...profileForm, avatar_url: e.target.value })}
              placeholder="https://example.com/photo.jpg"
            />
            <div style={{ marginTop: "2rem" }}>
              <Button type="submit" disabled={profileLoading}>
                {profileLoading ? "Updating..." : "Save Details"}
              </Button>
            </div>
          </form>
        </section>

        {/* Change Password Form */}
        <section className="glass-card">
          <h3>Modify Security Password</h3>
          <p style={{ color: "var(--text)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
            Change your password to ensure your account security.
          </p>

          {passwordError && <div className="error-msg">{passwordError}</div>}
          {passwordSuccess && <div className="success-msg">{passwordSuccess}</div>}

          <form onSubmit={handlePasswordSubmit}>
            <Input
              label="Current Password"
              name="old_password"
              type="password"
              value={passwordForm.old_password}
              onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
              required
            />
            <Input
              label="New Password"
              name="new_password"
              type="password"
              value={passwordForm.new_password}
              onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
              placeholder="Min 8 characters"
              required
            />
            <Input
              label="Confirm New Password"
              name="confirm_new_password"
              type="password"
              value={passwordForm.confirm_new_password}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirm_new_password: e.target.value })}
              required
            />
            <div style={{ marginTop: "2rem" }}>
              <Button type="submit" disabled={passwordLoading}>
                {passwordLoading ? "Updating Password..." : "Update Password"}
              </Button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};
