import React, { useState } from "react";
import api from "../api/axios";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { useNavigate, Link } from "react-router-dom";
// --- IMPORT THƯ VIỆN GOOGLE ---
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

export const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const GOOGLE_CLIENT_ID = "816102345249-7064bdqv7o07f8k78627iu9029t5n1e6.apps.googleusercontent.com";

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", form);
      localStorage.setItem("jwtToken", data.token);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  // --- HÀM XỬ LÝ KHI GOOGLE TRẢ TOKEN VỀ ---
  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");
    setLoading(true);

    try {
      console.log("FULL RESPONSE:", credentialResponse);
      // credentialResponse.credential chính là idToken từ Google
      const idToken = credentialResponse.credential;

      console.log("ID TOKEN:", idToken);

      // Gửi idToken này lên endpoint gọi đến hàm AuthService.loginWithGoogle của bạn
      const { data } = await api.post("/auth/google", { idToken });

      // Lưu token hệ thống của bạn sinh ra (hạn 30d trong code backend của bạn)
      localStorage.setItem("jwtToken", data.token);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Google authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google Login Failed. Please try again.");
  };

  return (
    // Bọc toàn bộ trang Login bằng Provider này
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <section className="auth-page glass-card">
        <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>Sign In to TravelApp</h2>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
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
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />
          <div style={{ marginTop: "1.5rem" }}>
            <Button type="submit" disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </div>
        </form>

        {/* --- ĐƯỜNG PHÂN CÁCH --- */}
        <div style={{ display: "flex", alignItems: "center", margin: "1.5rem 0", color: "#888" }}>
          <div style={{ flex: 1, height: "1px", backgroundColor: "#ddd" }}></div>
          <span style={{ padding: "0 10px", fontSize: "0.85rem" }}>OR</span>
          <div style={{ flex: 1, height: "1px", backgroundColor: "#ddd" }}></div>
        </div>

        {/* --- NÚT ĐĂNG NHẬP GOOGLE CHÍNH THỨC --- */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="filled_blue"
            text="continue_with"
            shape="rectangular"
            width="100%"
          />
        </div>

        <p style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.95rem" }}>
          Don’t have an account?{" "}
          <Link to="/register" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: "600" }}>
            Register here
          </Link>
        </p>
      </section>
    </GoogleOAuthProvider>
  );
};