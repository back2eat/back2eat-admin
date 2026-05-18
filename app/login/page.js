"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { requestOtp, verifyOtp } from "@/lib/api";
import { setAdminSession } from "@/lib/auth";
import { Phone, KeyRound, ArrowLeft, Loader2, ShieldCheck, Store, ShoppingBag, Users } from "lucide-react";

const STATS = [
  { icon: Store,       label: "Restaurants", value: "50+"  },
  { icon: ShoppingBag, label: "Orders/day",  value: "200+" },
  { icon: Users,       label: "Cities",      value: "5+"   },
];

export default function LoginPage() {
  const router  = useRouter();
  const [step,    setStep]    = useState("mobile");
  const [mobile,  setMobile]  = useState("");
  const [otp,     setOtp]     = useState("");
  const [loading, setLoading] = useState(false);
  const [mobileFocused, setMobileFocused] = useState(false);
  const [otpFocused,    setOtpFocused]    = useState(false);

const handleRequestOtp = async (e) => {
  e.preventDefault();
  console.log('[OTP REQUEST] Sending OTP to:', mobile, 'appType: CUSTOMER');
  if (!/^[6-9]\d{9}$/.test(mobile))
    return toast.error("Enter valid 10-digit mobile number");
  setLoading(true);
  try {
    const res = await requestOtp(mobile);
    console.log('[OTP REQUEST SUCCESS]', res.data);
    toast.success("OTP sent successfully");
    setStep("otp");
  } catch (err) {
    console.error('[OTP REQUEST ERROR]', err.response?.status, err.response?.data);
    toast.error(err.response?.data?.message || "Failed to send OTP");
  } finally { setLoading(false); }
};

const handleVerifyOtp = async (e) => {
  e.preventDefault();
  console.log('[VERIFY OTP] mobile:', mobile, 'otp:', otp);
  setLoading(true);
  try {
    const res = await verifyOtp(mobile, otp);
    console.log('[VERIFY OTP RESPONSE]', res.status, res.data);
    const { accessToken, refreshToken, user } = res.data;
    console.log('[USER ROLE]', user?.role);
    if (user.role !== "ADMIN") {
      console.warn('[ACCESS DENIED] role is:', user.role);
      return toast.error("Access denied. Admin only.");
    }
    console.log('[SETTING SESSION] tokens + user');
    setAdminSession(accessToken, refreshToken, user);
    console.log('[SESSION SET] navigating to dashboard');
    toast.success(`Welcome, ${user.name || "Admin"}!`);
    window.location.href = "/dashboard";
  } catch (err) {
    console.error('[VERIFY OTP ERROR]', err.response?.status, err.response?.data);
    toast.error(err.response?.data?.message || "Invalid OTP");
  } finally { setLoading(false); }
};
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      background: "var(--surface-0)",
      fontFamily: "'DM Sans', sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>

      {/* ── Background ambient glows ── */}
      <div style={{
        position: "fixed", top: "-200px", left: "-100px",
        width: "600px", height: "600px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(232,28,28,0.07) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "fixed", bottom: "-150px", right: "-150px",
        width: "500px", height: "500px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(232,28,28,0.05) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />

      {/* ══════════════════════════════
          LEFT PANEL
      ══════════════════════════════ */}
      <div style={{
        display: "none",
        width: "48%",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "48px",
        background: "var(--surface-1)",
        borderRight: "1px solid var(--border-subtle)",
        position: "relative",
        overflow: "hidden",
      }} className="lg-panel">

        {/* Red diagonal accent */}
        <div style={{
          position: "absolute", top: 0, right: 0,
          width: "3px", height: "100%",
          background: "linear-gradient(180deg, transparent, var(--brand-red) 40%, var(--brand-red) 60%, transparent)",
          opacity: 0.5,
        }} />

        {/* Top: Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "44px", height: "44px", borderRadius: "13px",
            background: "linear-gradient(135deg, var(--brand-red), var(--brand-red-deep))",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 20px var(--brand-red-glow)",
            fontFamily: "'Syne', sans-serif", fontWeight: 900,
            fontSize: "20px", color: "#fff", letterSpacing: "-1px",
          }}>B</div>
          <div>
            <p style={{
              fontFamily: "'Syne', sans-serif", fontWeight: 800,
              fontSize: "16px", color: "#f4f4f6", margin: 0,
            }}>
              Back<span style={{ color: "var(--brand-red)" }}>2</span>Eat
            </p>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: 0, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Admin Console
            </p>
          </div>
        </div>

        {/* Middle: Hero text */}
        <div>
          {/* Tag */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "7px",
            padding: "4px 12px 4px 8px",
            background: "var(--brand-red-soft)",
            border: "1px solid rgba(232,28,28,0.18)",
            borderRadius: "20px", marginBottom: "24px",
          }}>
            <ShieldCheck size={13} style={{ color: "var(--brand-red)" }} />
            <span style={{ fontSize: "11px", color: "var(--brand-red)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Secure Admin Access
            </span>
          </div>

          <h1 style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: "44px",
            lineHeight: 1.08,
            letterSpacing: "-1.5px",
            color: "var(--text-primary)",
            margin: "0 0 20px 0",
          }}>
            Manage your<br />
            platform<br />
            <span style={{
              background: "linear-gradient(90deg, var(--brand-red), #ff6b6b)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>with confidence.</span>
          </h1>

          <p style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: "340px", margin: 0 }}>
            Approve restaurants, process payouts, manage users and monitor orders — all from one place.
          </p>
        </div>

        {/* Bottom: Stats */}
        <div style={{ display: "flex", gap: "12px" }}>
          {STATS.map(({ icon: Icon, label, value }) => (
            <div key={label} style={{
              flex: 1,
              padding: "16px",
              background: "var(--surface-2)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "14px",
            }}>
              <Icon size={16} style={{ color: "var(--brand-red)", marginBottom: "8px" }} />
              <p style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800, fontSize: "22px",
                color: "var(--text-primary)", margin: "0 0 2px 0",
              }}>{value}</p>
              <p style={{ fontSize: "11.5px", color: "var(--text-muted)", margin: 0 }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════
          RIGHT PANEL
      ══════════════════════════════ */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        position: "relative",
        zIndex: 1,
      }}>
        <div style={{ width: "100%", maxWidth: "420px" }}>

          {/* Mobile-only logo */}
          <div style={{
            display: "flex", alignItems: "center", gap: "11px",
            marginBottom: "40px",
          }} className="mobile-logo">
            <div style={{
              width: "40px", height: "40px", borderRadius: "12px",
              background: "linear-gradient(135deg, var(--brand-red), var(--brand-red-deep))",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 16px var(--brand-red-glow)",
              fontFamily: "'Syne', sans-serif", fontWeight: 900, fontSize: "18px", color: "#fff",
            }}>B</div>
            <div>
              <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "15px", color: "#f4f4f6", margin: 0 }}>
                Back<span style={{ color: "var(--brand-red)" }}>2</span>Eat
              </p>
              <p style={{ fontSize: "10px", color: "var(--text-muted)", margin: 0, letterSpacing: "0.08em", textTransform: "uppercase" }}>Admin Console</p>
            </div>
          </div>

          {/* Card */}
          <div style={{
            background: "var(--surface-1)",
            border: "1px solid var(--border-soft)",
            borderRadius: "22px",
            padding: "36px 32px",
            boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
            position: "relative",
            overflow: "hidden",
          }}>
            {/* Card top glow */}
            <div style={{
              position: "absolute", top: "-60px", left: "50%",
              transform: "translateX(-50%)",
              width: "240px", height: "120px", borderRadius: "50%",
              background: "radial-gradient(ellipse, rgba(232,28,28,0.12) 0%, transparent 70%)",
              pointerEvents: "none",
            }} />

            {/* Step indicator */}
            <div style={{ display: "flex", gap: "6px", marginBottom: "28px" }}>
              {["mobile", "otp"].map((s, i) => (
                <div key={s} style={{
                  height: "3px",
                  borderRadius: "10px",
                  flex: 1,
                  background: step === s || (s === "mobile")
                    ? (i === 0 ? "var(--brand-red)" : step === "otp" ? "var(--brand-red)" : "var(--surface-4)")
                    : "var(--surface-4)",
                  transition: "background 0.3s ease",
                }} />
              ))}
            </div>

            {/* Heading */}
            <h2 style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800, fontSize: "24px",
              color: "var(--text-primary)",
              letterSpacing: "-0.4px",
              margin: "0 0 6px 0",
            }}>
              {step === "mobile" ? "Welcome back" : "Verify OTP"}
            </h2>
            <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", margin: "0 0 28px 0", lineHeight: 1.5 }}>
              {step === "mobile"
                ? "Sign in to access your admin console"
                : <>OTP sent to <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>+91 {mobile}</span></>}
            </p>

            {/* ── STEP: MOBILE ── */}
            {step === "mobile" && (
              <form onSubmit={handleRequestOtp}>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
                  Mobile Number
                </label>

                <div style={{
                  display: "flex",
                  border: `1.5px solid ${mobileFocused ? "var(--brand-red)" : "var(--border-soft)"}`,
                  borderRadius: "13px",
                  overflow: "hidden",
                  background: "var(--surface-2)",
                  boxShadow: mobileFocused ? "0 0 0 3px var(--brand-red-soft)" : "none",
                  transition: "all 0.2s ease",
                  marginBottom: "20px",
                }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    padding: "0 14px",
                    borderRight: "1px solid var(--border-subtle)",
                    background: "var(--surface-3)",
                    flexShrink: 0,
                  }}>
                    <Phone size={14} style={{ color: "var(--text-muted)" }} />
                    <span style={{ fontSize: "13.5px", color: "var(--text-secondary)", fontWeight: 500 }}>+91</span>
                  </div>
                  <input
                    type="tel" maxLength={10} value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                    onFocus={() => setMobileFocused(true)}
                    onBlur={() => setMobileFocused(false)}
                    placeholder="9876543210"
                    required autoFocus
                    style={{
                      flex: 1, background: "transparent", border: "none", outline: "none",
                      padding: "14px 16px",
                      fontSize: "15px", color: "var(--text-primary)",
                      fontFamily: "'DM Sans', sans-serif",
                      letterSpacing: "0.03em",
                    }}
                  />
                </div>

                <button type="submit" disabled={loading} style={{
                  width: "100%",
                  padding: "14px",
                  background: loading ? "var(--surface-3)" : "linear-gradient(135deg, var(--brand-red) 0%, var(--brand-red-deep) 100%)",
                  border: "none",
                  borderRadius: "13px",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: 700,
                  fontFamily: "'DM Sans', sans-serif",
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  transition: "all 0.2s ease",
                  boxShadow: loading ? "none" : "0 4px 20px var(--brand-red-glow)",
                  letterSpacing: "0.02em",
                }}>
                  {loading && <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />}
                  {loading ? "Sending OTP…" : "Send OTP →"}
                </button>
              </form>
            )}

            {/* ── STEP: OTP ── */}
            {step === "otp" && (
              <form onSubmit={handleVerifyOtp}>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
                  6-Digit OTP
                </label>

                <div style={{
                  position: "relative",
                  border: `1.5px solid ${otpFocused ? "var(--brand-red)" : "var(--border-soft)"}`,
                  borderRadius: "13px",
                  overflow: "hidden",
                  background: "var(--surface-2)",
                  boxShadow: otpFocused ? "0 0 0 3px var(--brand-red-soft)" : "none",
                  transition: "all 0.2s ease",
                  marginBottom: "20px",
                }}>
                  <KeyRound size={15} style={{
                    position: "absolute", left: "16px", top: "50%",
                    transform: "translateY(-50%)", color: "var(--text-muted)",
                    pointerEvents: "none",
                  }} />
                  <input
                    type="text" maxLength={6} value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    onFocus={() => setOtpFocused(true)}
                    onBlur={() => setOtpFocused(false)}
                    placeholder="• • • • • •"
                    required autoFocus
                    style={{
                      width: "100%", background: "transparent", border: "none", outline: "none",
                      padding: "14px 16px 14px 44px",
                      fontSize: "22px", color: "var(--text-primary)",
                      fontFamily: "'DM Sans', sans-serif",
                      textAlign: "center", letterSpacing: "0.35em",
                    }}
                  />
                </div>

                <button type="submit" disabled={loading} style={{
                  width: "100%",
                  padding: "14px",
                  background: loading ? "var(--surface-3)" : "linear-gradient(135deg, var(--brand-red) 0%, var(--brand-red-deep) 100%)",
                  border: "none", borderRadius: "13px",
                  color: "#fff", fontSize: "14px", fontWeight: 700,
                  fontFamily: "'DM Sans', sans-serif",
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  transition: "all 0.2s ease",
                  boxShadow: loading ? "none" : "0 4px 20px var(--brand-red-glow)",
                  letterSpacing: "0.02em",
                  marginBottom: "10px",
                }}>
                  {loading && <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />}
                  {loading ? "Verifying…" : "Verify & Sign In →"}
                </button>

                <button type="button" onClick={() => { setStep("mobile"); setOtp(""); }} style={{
                  width: "100%", background: "transparent", border: "none",
                  padding: "10px", borderRadius: "10px",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
                  fontSize: "13px", color: "var(--text-muted)",
                  cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                  transition: "color 0.18s",
                }}
                  onMouseEnter={e => e.currentTarget.style.color = "var(--text-primary)"}
                  onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
                >
                  <ArrowLeft size={14} /> Change mobile number
                </button>
              </form>
            )}
          </div>

          {/* Footer note */}
          <p style={{ textAlign: "center", fontSize: "12px", color: "var(--text-muted)", marginTop: "20px" }}>
            Restricted to authorised admins only.
          </p>
        </div>
      </div>

      {/* Responsive CSS via style tag */}
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