import React, { useState } from "react";
import api from "../api/axios";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { useNavigate, Link } from "react-router-dom";

export const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    try {
      await api.post("/auth/register", form);
      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page glass-card">
      <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>Create an Account</h2>
      {error && <div className="error-msg">{error}</div>}
      {success && <div className="success-msg">{success}</div>}
      <form onSubmit={handleSubmit}>
        <Input
          label="Full Name"
          name="full_name"
          type="text"
          value={form.full_name}
          onChange={handleChange}
          placeholder="John Doe"
          required
        />
        <Input
          label="Email Address"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="you@example.com"
          required
        />
        <Input
          label="Phone Number"
          name="phone"
          type="tel"
          value={form.phone}
          onChange={handleChange}
          placeholder="0912345678"
        />
        <Input
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Min 8 characters"
          required
        />
        <div style={{ marginTop: "1.5rem" }}>
          <Button type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </Button>
        </div>
      </form>
      <p style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.95rem" }}>
        Already have an account?{" "}
        <Link to="/login" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: "600" }}>
          Sign in here
        </Link>
      </p>
    </section>
  );
};
