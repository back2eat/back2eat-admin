"use client";
import { getAdminUser } from "@/lib/auth";
import { Bell, Search } from "lucide-react";
import { useState, useEffect } from "react";

export default function Header({ title, subtitle, actions }) {
  const [user, setUser] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    setUser(getAdminUser());
  }, []);

  const initial = (user?.name || "A")[0].toUpperCase();

  return (
    <div
      className="animate-fade-up"
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: "32px",
        gap: "16px",
      }}
    >
      {/* Left: Title block */}
      <div style={{ flex: 1 }}>
        {/* Breadcrumb-style label */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "3px 10px 3px 6px",
            background: "var(--brand-red-soft)",
            border: "1px solid rgba(232,28,28,0.15)",
            borderRadius: "20px",
            marginBottom: "10px",
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "var(--brand-red)",
              display: "inline-block",
              boxShadow: "0 0 6px var(--brand-red)",
            }}
          />
          <span
            style={{
              fontSize: "10.5px",
              color: "var(--brand-red)",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Back2Eat Console
          </span>
        </div>

        <h1
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: "26px",
            color: "var(--text-primary)",
            letterSpacing: "-0.5px",
            lineHeight: 1.1,
            margin: 0,
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              fontSize: "13.5px",
              color: "var(--text-secondary)",
              marginTop: "5px",
              fontWeight: 400,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* Right: Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0, paddingTop: "2px" }}>
        {/* Search bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 14px",
            background: searchFocused ? "var(--surface-3)" : "var(--surface-2)",
            border: `1px solid ${searchFocused ? "rgba(232,28,28,0.3)" : "var(--border-soft)"}`,
            borderRadius: "12px",
            transition: "all 0.2s ease",
            boxShadow: searchFocused ? "0 0 0 3px var(--brand-red-soft)" : "none",
          }}
        >
          <Search size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
          <input
            placeholder="Quick search…"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              fontSize: "13px",
              color: "var(--text-primary)",
              fontFamily: "'DM Sans', sans-serif",
              width: "140px",
            }}
          />
        </div>

        {/* Custom actions slot */}
        {actions}

        {/* Notification bell */}
        <button
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "11px",
            background: "var(--surface-2)",
            border: "1px solid var(--border-soft)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--text-secondary)",
            position: "relative",
            transition: "all 0.18s ease",
            flexShrink: 0,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "var(--surface-3)";
            e.currentTarget.style.borderColor = "var(--border-soft)";
            e.currentTarget.style.color = "var(--text-primary)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "var(--surface-2)";
            e.currentTarget.style.borderColor = "var(--border-soft)";
            e.currentTarget.style.color = "var(--text-secondary)";
          }}
        >
          <Bell size={15} />
          {/* Notification dot */}
          <span
            style={{
              position: "absolute",
              top: "7px",
              right: "7px",
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: "var(--brand-red)",
              border: "1.5px solid var(--surface-1)",
              boxShadow: "0 0 6px var(--brand-red)",
            }}
          />
        </button>

        {/* User pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "6px 14px 6px 6px",
            background: "var(--surface-2)",
            border: "1px solid var(--border-soft)",
            borderRadius: "50px",
            cursor: "pointer",
            transition: "all 0.18s ease",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(232,28,28,0.25)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-soft)"; }}
        >
          {/* Avatar */}
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--brand-red) 0%, var(--brand-red-deep) 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 2px 8px var(--brand-red-glow)",
              fontFamily: "'Syne', sans-serif",
              fontWeight: 700,
              fontSize: "12px",
              color: "#fff",
            }}
          >
            {initial}
          </div>

          <div className="hidden sm:block">
            <p
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--text-primary)",
                lineHeight: 1.2,
                margin: 0,
              }}
            >
              {user?.name || "Admin"}
            </p>
            <p
              style={{
                fontSize: "10.5px",
                color: "var(--text-muted)",
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              Administrator
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}