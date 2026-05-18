import Sidebar from "./Sidebar";

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen" style={{ background: "var(--surface-0)" }}>
      <Sidebar />
      <main
        className="flex-1 min-h-screen overflow-x-hidden"
        style={{
          marginLeft: "256px",
          padding: "32px 36px",
          background: "var(--surface-0)",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Subtle top-right radial glow */}
        <div
          style={{
            position: "fixed",
            top: "-120px",
            right: "-120px",
            width: "480px",
            height: "480px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(232,28,28,0.055) 0%, transparent 70%)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        <div style={{ position: "relative", zIndex: 1 }}>
          {children}
        </div>
      </main>
    </div>
  );
}