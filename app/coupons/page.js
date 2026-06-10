"use client";
import { useEffect, useState } from "react";
import { getCoupons, createCoupon, toggleCoupon, deleteCoupon } from "@/lib/api";
import AdminLayout from "@/components/AdminLayout";
import Header from "@/components/Header";
import toast from "react-hot-toast";

const today = () => new Date().toISOString().slice(0, 10);

const BLANK = {
  code: "", discountType: "PERCENT", discountValue: "",
  maxDiscount: "", minOrderValue: "", usageLimit: "",
  perUserLimit: "1", validFrom: today(), validUntil: "",
  scope: "PLATFORM",
};

const fmt = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";
const isExpired = (c) => c.endDate && new Date(c.endDate) < new Date();

export default function CouponsPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [delItem, setDelItem] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await getCoupons();
      setList(r.data.coupons || []);
    } catch (e) {
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const openCreate = () => {
    setForm({ ...BLANK, validFrom: today() });
    setShowCreate(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.code.trim()) { toast.error("Code required"); return; }
    if (!form.discountValue) { toast.error("Discount value required"); return; }
    if (!form.validUntil) { toast.error("Expiry date required"); return; }
    setSaving(true);
    try {
      await createCoupon({
        code: form.code.toUpperCase().trim(),
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        startDate: form.validFrom || today(),
        endDate: form.validUntil,
        validFrom: form.validFrom || today(),
        validUntil: form.validUntil,
        fundedBy: form.scope,
        scope: form.scope,
        perUserLimit: Number(form.perUserLimit) || 1,
        ...(form.maxDiscount && { maxDiscount: Number(form.maxDiscount) }),
        ...(form.minOrderValue && { minOrderAmount: Number(form.minOrderValue) }),
        ...(form.usageLimit && { usageLimit: Number(form.usageLimit) }),
      });
      toast.success("Coupon created");
      setShowCreate(false);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await toggleCoupon(id);
      setList(prev => prev.map(c => c._id === id ? { ...c, isActive: !c.isActive } : c));
      toast.success("Updated");
    } catch {
      toast.error("Failed");
    }
  };

  const handleDelete = async () => {
    if (!delItem) return;
    setDeleting(true);
    try {
      await deleteCoupon(delItem._id);
      setList(prev => prev.filter(c => c._id !== delItem._id));
      toast.success(`${delItem.code} deleted`);
      setDelItem(null);
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminLayout>
      <Header
        title="Coupons"
        subtitle={`${list.length} total`}
        actions={
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            + New Coupon
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total", value: list.length },
          { label: "Active", value: list.filter(c => c.isActive && !isExpired(c)).length, color: "text-green-400" },
          { label: "Expired", value: list.filter(isExpired).length, color: "text-red-400" },
          { label: "Total Uses", value: list.reduce((s, c) => s + (c.usageCount || 0), 0) },
        ].map(({ label, value, color = "text-white" }) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              {["Code", "Discount", "Min Order", "Validity", "Uses", "Funded By", "Status", "Actions"].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <tr key={i}>
                  {[...Array(8)].map((_, j) => (
                    <td key={j} className="px-5 py-4">
                      <div className="h-4 bg-gray-800 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : list.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center text-gray-500 py-16 text-sm">
                  No coupons yet.{" "}
                  <button onClick={openCreate} className="text-orange-400 hover:underline">Create one</button>
                </td>
              </tr>
            ) : list.map(c => {
              const exp = isExpired(c);
              return (
                <tr key={c._id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-orange-400 font-bold text-sm tracking-wider">{c.code}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-white font-semibold text-sm">
                      {c.discountType === "FLAT" || c.discountType === "FIXED" ? `₹${c.discountValue}` : `${c.discountValue}%`}
                    </p>
                    {c.maxDiscount && <p className="text-gray-500 text-xs">max ₹{c.maxDiscount}</p>}
                  </td>
                  <td className="px-5 py-3.5 text-gray-300 text-sm">
                    {c.minOrderAmount ? `₹${c.minOrderAmount}` : "—"}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-400">
                    <p>{fmt(c.startDate || c.validFrom)}</p>
                    <p className={exp ? "text-red-400" : ""}>{fmt(c.endDate || c.validUntil)}</p>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-300">
                    {c.usageCount || 0} / {c.usageLimit || "∞"}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-md ${
                      (c.fundedBy || c.scope) === "PLATFORM"
                        ? "bg-blue-500/10 text-blue-400"
                        : "bg-purple-500/10 text-purple-400"
                    }`}>
                      {c.fundedBy || c.scope || "PLATFORM"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-md ${
                      exp ? "bg-red-500/10 text-red-400"
                        : c.isActive ? "bg-green-500/10 text-green-400"
                        : "bg-gray-700 text-gray-400"
                    }`}>
                      {exp ? "Expired" : c.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggle(c._id)}
                        className="text-xs px-3 py-1.5 rounded-md border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
                      >
                        {c.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => setDelItem(c)}
                        className="text-xs px-3 py-1.5 rounded-md border border-transparent text-red-500 hover:border-red-500/40 hover:bg-red-500/10 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowCreate(false); }}
        >
          <div style={{ background: "#111827", border: "1px solid #374151", borderRadius: "16px", width: "100%", maxWidth: "520px", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid #1f2937" }}>
              <div>
                <p style={{ color: "white", fontWeight: 600, fontSize: "15px" }}>Create Coupon</p>
                <p style={{ color: "#6b7280", fontSize: "12px", marginTop: "2px" }}>Fields marked * are required</p>
              </div>
              <button onClick={() => setShowCreate(false)} style={{ color: "#6b7280", background: "none", border: "none", cursor: "pointer", fontSize: "20px", lineHeight: 1 }}>×</button>
            </div>

            <form onSubmit={handleCreate} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>

              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#9ca3af", marginBottom: "6px", fontWeight: 500 }}>Coupon Code *</label>
                <input
                  value={form.code}
                  onChange={e => setF("code", e.target.value.toUpperCase())}
                  placeholder="e.g. WELCOME50"
                  style={{ width: "100%", background: "#1f2937", border: "1px solid #374151", borderRadius: "10px", padding: "10px 12px", color: "#f97316", fontFamily: "monospace", fontWeight: 700, fontSize: "14px", letterSpacing: "0.05em", outline: "none", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "#9ca3af", marginBottom: "6px", fontWeight: 500 }}>Type *</label>
                  <select value={form.discountType} onChange={e => setF("discountType", e.target.value)}
                    style={{ width: "100%", background: "#1f2937", border: "1px solid #374151", borderRadius: "10px", padding: "10px 12px", color: "white", fontSize: "14px", outline: "none", boxSizing: "border-box" }}>
                    <option value="PERCENT">Percentage (%)</option>
                    <option value="FLAT">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "#9ca3af", marginBottom: "6px", fontWeight: 500 }}>Value *</label>
                  <input type="number" min="1" value={form.discountValue} onChange={e => setF("discountValue", e.target.value)}
                    placeholder={form.discountType === "PERCENT" ? "50" : "100"}
                    style={{ width: "100%", background: "#1f2937", border: "1px solid #374151", borderRadius: "10px", padding: "10px 12px", color: "white", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
                </div>
              </div>

              {form.discountType === "PERCENT" && (
                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "#9ca3af", marginBottom: "6px", fontWeight: 500 }}>Max Discount ₹ (cap)</label>
                  <input type="number" min="0" value={form.maxDiscount} onChange={e => setF("maxDiscount", e.target.value)}
                    placeholder="e.g. 150"
                    style={{ width: "100%", background: "#1f2937", border: "1px solid #374151", borderRadius: "10px", padding: "10px 12px", color: "white", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "#9ca3af", marginBottom: "6px", fontWeight: 500 }}>Min Order (₹)</label>
                  <input type="number" min="0" value={form.minOrderValue} onChange={e => setF("minOrderValue", e.target.value)}
                    placeholder="0 = no minimum"
                    style={{ width: "100%", background: "#1f2937", border: "1px solid #374151", borderRadius: "10px", padding: "10px 12px", color: "white", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "#9ca3af", marginBottom: "6px", fontWeight: 500 }}>Funded By</label>
                  <select value={form.scope} onChange={e => setF("scope", e.target.value)}
                    style={{ width: "100%", background: "#1f2937", border: "1px solid #374151", borderRadius: "10px", padding: "10px 12px", color: "white", fontSize: "14px", outline: "none", boxSizing: "border-box" }}>
                    <option value="PLATFORM">Platform (Back2Eat)</option>
                    <option value="RESTAURANT">Restaurant</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "#9ca3af", marginBottom: "6px", fontWeight: 500 }}>Total Uses</label>
                  <input type="number" min="1" value={form.usageLimit} onChange={e => setF("usageLimit", e.target.value)}
                    placeholder="Unlimited"
                    style={{ width: "100%", background: "#1f2937", border: "1px solid #374151", borderRadius: "10px", padding: "10px 12px", color: "white", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "#9ca3af", marginBottom: "6px", fontWeight: 500 }}>Per User</label>
                  <input type="number" min="1" value={form.perUserLimit} onChange={e => setF("perUserLimit", e.target.value)}
                    placeholder="1"
                    style={{ width: "100%", background: "#1f2937", border: "1px solid #374151", borderRadius: "10px", padding: "10px 12px", color: "white", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "#9ca3af", marginBottom: "6px", fontWeight: 500 }}>Valid From</label>
                  <input type="date" value={form.validFrom} onChange={e => setF("validFrom", e.target.value)}
                    style={{ width: "100%", background: "#1f2937", border: "1px solid #374151", borderRadius: "10px", padding: "10px 12px", color: "white", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "#9ca3af", marginBottom: "6px", fontWeight: 500 }}>Expires On *</label>
                  <input type="date" required value={form.validUntil} onChange={e => setF("validUntil", e.target.value)}
                    style={{ width: "100%", background: "#1f2937", border: "1px solid #374151", borderRadius: "10px", padding: "10px 12px", color: "white", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
                </div>
              </div>

              {form.code && form.discountValue && (
                <div style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: "10px", padding: "10px 14px", fontSize: "13px" }}>
                  <span style={{ fontFamily: "monospace", color: "#f97316", fontWeight: 700 }}>{form.code.toUpperCase()}</span>
                  <span style={{ color: "#d1d5db" }}>
                    {" — "}
                    {form.discountType === "PERCENT"
                      ? `${form.discountValue}% off${form.maxDiscount ? ` (max ₹${form.maxDiscount})` : ""}`
                      : `₹${form.discountValue} off`}
                    {form.minOrderValue && Number(form.minOrderValue) > 0 ? ` on orders above ₹${form.minOrderValue}` : ""}
                  </span>
                </div>
              )}

              <div style={{ display: "flex", gap: "12px", paddingTop: "4px" }}>
                <button type="button" onClick={() => setShowCreate(false)}
                  style={{ flex: 1, padding: "10px", border: "1px solid #374151", background: "transparent", color: "#9ca3af", borderRadius: "10px", fontSize: "14px", cursor: "pointer" }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  style={{ flex: 2, padding: "10px", background: saving ? "#6b7280" : "#f97316", border: "none", color: "white", borderRadius: "10px", fontSize: "14px", fontWeight: 600, cursor: saving ? "not-allowed" : "pointer" }}>
                  {saving ? "Creating..." : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {delItem && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}
          onClick={(e) => { if (e.target === e.currentTarget) setDelItem(null); }}
        >
          <div style={{ background: "#111827", border: "1px solid #374151", borderRadius: "16px", width: "100%", maxWidth: "380px", padding: "24px" }}>
            <div style={{ width: "44px", height: "44px", background: "rgba(239,68,68,0.1)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px", fontSize: "20px" }}>🗑️</div>
            <p style={{ color: "white", fontWeight: 600, fontSize: "15px", marginBottom: "8px" }}>Delete Coupon?</p>
            <p style={{ color: "#9ca3af", fontSize: "14px", lineHeight: 1.6, marginBottom: "20px" }}>
              <span style={{ fontFamily: "monospace", color: "#f97316", fontWeight: 700 }}>{delItem.code}</span> will be permanently removed. Customers who already used it won't be affected.
            </p>
            <div style={{ display: "flex", gap: "12px" }}>
              <button type="button" onClick={() => setDelItem(null)}
                style={{ flex: 1, padding: "10px", border: "1px solid #374151", background: "transparent", color: "#9ca3af", borderRadius: "10px", fontSize: "14px", cursor: "pointer" }}>
                Cancel
              </button>
              <button type="button" onClick={handleDelete} disabled={deleting}
                style={{ flex: 2, padding: "10px", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", borderRadius: "10px", fontSize: "14px", fontWeight: 600, cursor: deleting ? "not-allowed" : "pointer" }}>
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}