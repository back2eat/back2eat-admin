"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { Mail, Lock, Loader2, ShieldCheck, Store, ShoppingBag, Users, Eye, EyeOff } from "lucide-react";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL;

const STATS = [
  { icon: Store,       label: "Restaurants", value: "50+"  },
  { icon: ShoppingBag, label: "Orders/day",  value: "200+" },
  { icon: Users,       label: "Cities",      value: "5+"   },
];

export default function LoginPage() {
  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [showPass,    setShowPass]    = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused,  setPassFocused]  = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Email and password required");
    setLoading(true);
    try {
      const res = await axios.post(`${API}/auth/admin/login`, { email, password });
      const { accessToken, refreshToken, user } = res.data;
      if (!["ADMIN", "SUPER_ADMIN"].includes(user?.role)) {
        return toast.error("Access denied. Admin only.");
      }
      // Store session
      localStorage.setItem("adminToken",        accessToken);
      localStorage.setItem("adminRefreshToken", refreshToken);
      localStorage.setItem("adminUser",         JSON.stringify(user));
      toast.success(`Welcome, ${user.name || "Admin"}!`);
      window.location.href = "/dashboard";
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex",
      background: "var(--surface-0)",
      fontFamily: "'DM Sans', sans-serif",
      position: "relative", overflow: "hidden",
    }}>
      {/* Ambient glows */}
      <div style={{ position: "fixed", top: "-200px", left: "-100px", width: "600px", height: "600px", borderRadius: "50%", background: "radial-gradient(circle, rgba(232,28,28,0.07) 0%, transparent 65%)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: "-150px", right: "-150px", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(232,28,28,0.05) 0%, transparent 65%)", pointerEvents: "none" }} />

      {/* Left panel */}
      <div style={{ display: "none", width: "48%", flexDirection: "column", justifyContent: "space-between", padding: "48px", background: "var(--surface-1)", borderRight: "1px solid var(--border-subtle)", position: "relative", overflow: "hidden" }} className="lg-panel">
        <div style={{ position: "absolute", top: 0, right: 0, width: "3px", height: "100%", background: "linear-gradient(180deg, transparent, var(--brand-red) 40%, var(--brand-red) 60%, transparent)", opacity: 0.5 }} />
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "13px", background: "linear-gradient(135deg, var(--brand-red), var(--brand-red-deep))", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px var(--brand-red-glow)", fontFamily: "'Syne', sans-serif", fontWeight: 900, fontSize: "20px", color: "#fff", letterSpacing: "-1px" }}>B</div>
          <div>
            <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "16px", color: "#f4f4f6", margin: 0 }}>Back<span style={{ color: "var(--brand-red)" }}>2</span>Eat</p>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: 0, letterSpacing: "0.08em", textTransform: "uppercase" }}>Admin Console</p>
          </div>
        </div>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "7px", padding: "4px 12px 4px 8px", background: "var(--brand-red-soft)", border: "1px solid rgba(232,28,28,0.18)", borderRadius: "20px", marginBottom: "24px" }}>
            <ShieldCheck size={13} style={{ color: "var(--brand-red)" }} />
            <span style={{ fontSize: "11px", color: "var(--brand-red)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Secure Admin Access</span>
          </div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "44px", lineHeight: 1.08, letterSpacing: "-1.5px", color: "var(--text-primary)", margin: "0 0 20px 0" }}>
            Manage your<br />platform<br />
            <span style={{ background: "linear-gradient(90deg, var(--brand-red), #ff6b6b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>with confidence.</span>
          </h1>
          <p style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: "340px", margin: 0 }}>Approve restaurants, process payouts, manage users and monitor orders.</p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          {STATS.map(({ icon: Icon, label, value }) => (
            <div key={label} style={{ flex: 1, padding: "16px", background: "var(--surface-2)", border: "1px solid var(--border-subtle)", borderRadius: "14px" }}>
              <Icon size={16} style={{ color: "var(--brand-red)", marginBottom: "8px" }} />
              <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "22px", color: "var(--text-primary)", margin: "0 0 2px 0" }}>{value}</p>
              <p style={{ fontSize: "11.5px", color: "var(--text-muted)", margin: 0 }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px", position: "relative", zIndex: 1 }}>
        <div style={{ width: "100%", maxWidth: "420px" }}>

          {/* Mobile logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "11px", marginBottom: "40px" }} className="mobile-logo">
            <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "linear-gradient(135deg, var(--brand-red), var(--brand-red-deep))", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px var(--brand-red-glow)", fontFamily: "'Syne', sans-serif", fontWeight: 900, fontSize: "18px", color: "#fff" }}>B</div>
            <div>
              <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "15px", color: "#f4f4f6", margin: 0 }}>Back<span style={{ color: "var(--brand-red)" }}>2</span>Eat</p>
              <p style={{ fontSize: "10px", color: "var(--text-muted)", margin: 0, letterSpacing: "0.08em", textTransform: "uppercase" }}>Admin Console</p>
            </div>
          </div>

          {/* Card */}
          <div style={{ background: "var(--surface-1)", border: "1px solid var(--border-soft)", borderRadius: "22px", padding: "36px 32px", boxShadow: "0 24px 64px rgba(0,0,0,0.4)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "-60px", left: "50%", transform: "translateX(-50%)", width: "240px", height: "120px", borderRadius: "50%", background: "radial-gradient(ellipse, rgba(232,28,28,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />

            <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "24px", color: "var(--text-primary)", letterSpacing: "-0.4px", margin: "0 0 6px 0" }}>Welcome back</h2>
            <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", margin: "0 0 28px 0", lineHeight: 1.5 }}>Sign in to your admin console</p>

            <form onSubmit={handleLogin}>
              {/* Email */}
              <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>Email Address</label>
              <div style={{ display: "flex", border: `1.5px solid ${emailFocused ? "var(--brand-red)" : "var(--border-soft)"}`, borderRadius: "13px", overflow: "hidden", background: "var(--surface-2)", boxShadow: emailFocused ? "0 0 0 3px var(--brand-red-soft)" : "none", transition: "all 0.2s ease", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", padding: "0 14px", borderRight: "1px solid var(--border-subtle)", background: "var(--surface-3)", flexShrink: 0 }}>
                  <Mail size={14} style={{ color: "var(--text-muted)" }} />
                </div>
                <input
                  type="email" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  placeholder="admin@back2eat.com"
                  required autoFocus
                  style={{ flex: 1, background: "transparent", border: "none", outline: "none", padding: "14px 16px", fontSize: "15px", color: "var(--text-primary)", fontFamily: "'DM Sans', sans-serif" }}
                />
              </div>

              {/* Password */}
              <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>Password</label>
              <div style={{ display: "flex", border: `1.5px solid ${passFocused ? "var(--brand-red)" : "var(--border-soft)"}`, borderRadius: "13px", overflow: "hidden", background: "var(--surface-2)", boxShadow: passFocused ? "0 0 0 3px var(--brand-red-soft)" : "none", transition: "all 0.2s ease", marginBottom: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", padding: "0 14px", borderRight: "1px solid var(--border-subtle)", background: "var(--surface-3)", flexShrink: 0 }}>
                  <Lock size={14} style={{ color: "var(--text-muted)" }} />
                </div>
                <input
                  type={showPass ? "text" : "password"} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPassFocused(true)}
                  onBlur={() => setPassFocused(false)}
                  placeholder="••••••••"
                  required
                  style={{ flex: 1, background: "transparent", border: "none", outline: "none", padding: "14px 16px", fontSize: "15px", color: "var(--text-primary)", fontFamily: "'DM Sans', sans-serif" }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ background: "transparent", border: "none", padding: "0 14px", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center" }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              <button type="submit" disabled={loading} style={{ width: "100%", padding: "14px", background: loading ? "var(--surface-3)" : "linear-gradient(135deg, var(--brand-red) 0%, var(--brand-red-deep) 100%)", border: "none", borderRadius: "13px", color: "#fff", fontSize: "14px", fontWeight: 700, fontFamily: "'DM Sans', sans-serif", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "all 0.2s ease", boxShadow: loading ? "none" : "0 4px 20px var(--brand-red-glow)", letterSpacing: "0.02em" }}>
                {loading && <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />}
                {loading ? "Signing in…" : "Sign In →"}
              </button>
            </form>
          </div>

          <p style={{ textAlign: "center", fontSize: "12px", color: "var(--text-muted)", marginTop: "20px" }}>Restricted to authorised admins only.</p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (min-width: 1024px) {
          .lg-panel { display: flex !important; }
          .mobile-logo { display: none !important; }
        }
      `}</style>
    </div>
  );
}