"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Store, ShoppingBag,
  Users, Wallet, Tag, LogOut,
} from "lucide-react";
import { clearAdminSession } from "@/lib/auth";
import toast from "react-hot-toast";

const NAV = [
  { href: "/dashboard",   label: "Dashboard",   icon: LayoutDashboard },
  { href: "/restaurants", label: "Restaurants", icon: Store            },
  { href: "/orders",      label: "Orders",      icon: ShoppingBag      },
  { href: "/users",       label: "Users",       icon: Users            },
  { href: "/payouts",     label: "Payouts",     icon: Wallet           },
  { href: "/coupons",     label: "Coupons",     icon: Tag              },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();

  const handleLogout = () => {
    clearAdminSession();
    toast.success("Logged out successfully");
    router.push("/login");
  };

  return (
    <aside
      style={{
        width: "256px",
        background: "var(--surface-1)",
        borderRight: "1px solid var(--border-subtle)",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 40,
        overflow: "hidden",
      }}
    >
      {/* Inner left accent bar */}
      <div
        style={{
          position: "absolute",
          left: 0, top: 0, bottom: 0,
          width: "2px",
          background: "linear-gradient(180deg, transparent 0%, var(--brand-red) 35%, var(--brand-red) 65%, transparent 100%)",
          opacity: 0.7,
        }}
      />

      {/* Logo area */}
      <div
        style={{
          padding: "24px 20px 20px",
          borderBottom: "1px solid var(--border-subtle)",
          flexShrink: 0,
        }}
      >
        {/* Logo mark + wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Icon mark */}
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, var(--brand-red) 0%, var(--brand-red-deep) 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 4px 16px var(--brand-red-glow)",
              fontSize: "18px",
              fontWeight: 900,
              color: "#fff",
              fontFamily: "'Syne', sans-serif",
              letterSpacing: "-1px",
            }}
          >
            B
          </div>

          <div>
            <p
              style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                fontSize: "15px",
                color: "#f4f4f6",
                letterSpacing: "-0.3px",
                lineHeight: 1.1,
                margin: 0,
              }}
            >
              Back<span style={{ color: "var(--brand-red)" }}>2</span>Eat
            </p>
            <p
              style={{
                fontSize: "10.5px",
                color: "var(--text-muted)",
                marginTop: "2px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontWeight: 500,
                margin: "3px 0 0 0",
              }}
            >
              Admin Console
            </p>
          </div>
        </div>
      </div>

      {/* Section label */}
      <div style={{ padding: "20px 20px 8px" }}>
        <span
          style={{
            fontSize: "10px",
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
          }}
        >
          Navigation
        </span>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: "0 12px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "2px" }}>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "11px",
                padding: "10px 12px",
                borderRadius: "10px",
                fontSize: "13.5px",
                fontWeight: active ? 600 : 400,
                color: active ? "#fff" : "var(--text-secondary)",
                background: active
                  ? "linear-gradient(90deg, var(--brand-red) 0%, var(--brand-red-deep) 100%)"
                  : "transparent",
                boxShadow: active ? "0 4px 18px var(--brand-red-glow)" : "none",
                transition: "all 0.18s ease",
                textDecoration: "none",
                position: "relative",
                animation: active ? "glow-pulse 3s ease-in-out infinite" : "none",
              }}
              onMouseEnter={e => {
                if (!active) {
                  e.currentTarget.style.background = "var(--surface-3)";
                  e.currentTarget.style.color = "#f4f4f6";
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }
              }}
            >
              <Icon
                size={16}
                style={{
                  color: active ? "#fff" : "var(--text-muted)",
                  flexShrink: 0,
                  transition: "color 0.18s",
                }}
              />
              {label}
              {active && (
                <span
                  style={{
                    marginLeft: "auto",
                    width: "5px",
                    height: "5px",
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.7)",
                    flexShrink: 0,
                  }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: version + logout */}
      <div
        style={{
          padding: "12px",
          borderTop: "1px solid var(--border-subtle)",
          flexShrink: 0,
        }}
      >
        {/* Version badge */}
        <div
          style={{
            padding: "8px 12px",
            borderRadius: "10px",
            background: "var(--surface-2)",
            border: "1px solid var(--border-subtle)",
            marginBottom: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: "11.5px", color: "var(--text-muted)", fontWeight: 500 }}>Version</span>
          <span
            style={{
              fontSize: "10.5px",
              fontWeight: 700,
              color: "var(--brand-red)",
              background: "var(--brand-red-soft)",
              padding: "2px 8px",
              borderRadius: "20px",
              letterSpacing: "0.03em",
            }}
          >
            v1.0.0
          </span>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "11px",
            padding: "10px 12px",
            borderRadius: "10px",
            fontSize: "13.5px",
            fontWeight: 500,
            color: "var(--text-secondary)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            width: "100%",
            transition: "all 0.18s ease",
            fontFamily: "'DM Sans', sans-serif",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "rgba(232,28,28,0.10)";
            e.currentTarget.style.color = "#e81c1c";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--text-secondary)";
          }}
        >
          <LogOut size={16} style={{ flexShrink: 0 }} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}