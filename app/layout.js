import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata = {
  title: "Back2Eat Admin",
  description: "Back2Eat Admin Panel",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased" style={{ background: "var(--surface-0)", color: "var(--text-primary)" }}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background:   "#18181f",
              color:        "#f4f4f6",
              border:       "1px solid rgba(255,255,255,0.08)",
              borderRadius: "14px",
              fontSize:     "13.5px",
              fontFamily:   "'DM Sans', sans-serif",
              boxShadow:    "0 8px 32px rgba(0,0,0,0.5)",
              padding:      "12px 16px",
            },
            success: {
              iconTheme: { primary: "#e81c1c", secondary: "#fff" },
            },
          }}
        />
      </body>
    </html>
  );
}