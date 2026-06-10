"use client";
import { useEffect, useState } from "react";
import { getCoupons, createCoupon, toggleCoupon } from "@/lib/api";
import AdminLayout from "@/components/AdminLayout";
import Header from "@/components/Header";
import { Plus, ToggleLeft, ToggleRight, X } from "lucide-react";
import toast from "react-hot-toast";

// Today in YYYY-MM-DD local format for date input default
const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const EMPTY = () => ({
  code: "", discountType: "PERCENT", discountValue: "",
  maxDiscount: "", minOrderValue: "", usageLimit: "",
  perUserLimit: "1",
  validFrom:  todayStr(),   // ← default to today
  validUntil: "",
  scope: "PLATFORM",
});

export default function CouponsPage() {
  const [coupons,  setCoupons]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState(EMPTY());
  const [saving,   setSaving]   = useState(false);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await getCoupons();
      setCoupons(res.data.coupons || []);
    } catch { toast.error("Failed to load coupons"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const f = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.validUntil) { toast.error("Valid Until date is required"); return; }
    setSaving(true);
    try {
      const payload = {
        code:          form.code.toUpperCase().trim(),
        discountType:  form.discountType,
        discountValue: Number(form.discountValue),
        // ── Send both naming conventions so backend accepts either ──────────
        startDate:     form.validFrom  || todayStr(),
        endDate:       form.validUntil,
        validFrom:     form.validFrom  || todayStr(),
        validUntil:    form.validUntil,
        fundedBy:      form.scope,
        scope:         form.scope,
        perUserLimit:  Number(form.perUserLimit) || 1,
      };
      if (form.maxDiscount)   payload.maxDiscount    = Number(form.maxDiscount);
      if (form.minOrderValue) payload.minOrderAmount = Number(form.minOrderValue);
      if (form.usageLimit)    payload.usageLimit     = Number(form.usageLimit);

      await createCoupon(payload);
      toast.success("Coupon created ✓");
      setShowForm(false);
      setForm(EMPTY());
      fetchCoupons();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    finally { setSaving(false); }
  };

  const handleToggle = async (id) => {
    try {
      await toggleCoupon(id);
      fetchCoupons();
    } catch { toast.error("Failed"); }
  };

  return (
    <AdminLayout>
      <Header
        title="Coupons"
        subtitle={`${coupons.length} coupons`}
        actions={
          <button onClick={() => { setForm(EMPTY()); setShowForm(true); }}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
            <Plus size={15} /> New Coupon
          </button>
        }
      />

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                {["Code","Discount","Min Order","Usage","Validity","Scope","Status","Toggle"].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>{[...Array(8)].map((_, j) => (
                    <td key={j} className="px-5 py-4">
                      <div className="h-4 bg-gray-800 rounded animate-pulse" />
                    </td>
                  ))}</tr>
                ))
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-gray-500 py-16 text-sm">
                    No coupons yet. Create your first one!
                  </td>
                </tr>
              ) : coupons.map((c) => (
                <tr key={c._id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-orange-400 font-bold text-sm">{c.code}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-white font-semibold text-sm">
                      {c.discountType === "FLAT" || c.discountType === "FIXED"
                        ? `₹${c.discountValue}` : `${c.discountValue}%`}
                    </p>
                    {c.maxDiscount && (
                      <p className="text-gray-500 text-xs">max ₹{c.maxDiscount}</p>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-gray-300 text-sm">
                    {c.minOrderAmount ? `₹${c.minOrderAmount}` : "—"}
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-gray-300 text-sm">
                      {c.usageCount ?? c.usedCount ?? 0} / {c.usageLimit || "∞"}
                    </p>
                    <p className="text-gray-500 text-xs">{c.perUserLimit}x per user</p>
                  </td>
                  <td className="px-5 py-3.5 text-gray-400 text-xs">
                    {(c.startDate || c.validFrom)
                      ? new Date(c.startDate || c.validFrom).toLocaleDateString("en-IN")
                      : "Any"}{" "}→{" "}
                    {(c.endDate || c.validUntil)
                      ? new Date(c.endDate || c.validUntil).toLocaleDateString("en-IN")
                      : "No expiry"}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-medium px-2 py-1 rounded-lg border ${
                      (c.fundedBy || c.scope) === "PLATFORM"
                        ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                        : "bg-purple-500/10 text-purple-400 border-purple-500/20"
                    }`}>{c.fundedBy || c.scope || "PLATFORM"}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-lg border ${
                      c.isActive
                        ? "bg-green-500/10 text-green-400 border-green-500/20"
                        : "bg-red-500/10 text-red-400 border-red-500/20"
                    }`}>
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <button onClick={() => handleToggle(c._id)}
                      className="transition-colors">
                      {c.isActive
                        ? <ToggleRight size={24} className="text-green-400 hover:text-green-300" />
                        : <ToggleLeft  size={24} className="text-gray-500 hover:text-gray-300" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Coupon Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-bold text-lg">Create Coupon</h3>
              <button onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="grid grid-cols-2 gap-4 mb-5">

                {/* Code */}
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Coupon Code *</label>
                  <input value={form.code} onChange={(e) => f("code", e.target.value)}
                    placeholder="WELCOME50" required
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500 uppercase" />
                </div>

                {/* Scope */}
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Funded By</label>
                  <select value={form.scope} onChange={(e) => f("scope", e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500">
                    <option value="PLATFORM">Platform (Back2Eat pays)</option>
                    <option value="RESTAURANT">Restaurant (restaurant pays)</option>
                  </select>
                </div>

                {/* Discount Type */}
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Discount Type</label>
                  <select value={form.discountType} onChange={(e) => f("discountType", e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500">
                    <option value="PERCENT">Percentage (%)</option>
                    <option value="FLAT">Flat (₹)</option>
                  </select>
                </div>

                {/* Discount Value */}
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">
                    Discount Value * {form.discountType === "PERCENT" ? "(%)" : "(₹)"}
                  </label>
                  <input type="number" value={form.discountValue}
                    onChange={(e) => f("discountValue", e.target.value)}
                    placeholder={form.discountType === "PERCENT" ? "50" : "100"} required
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500" />
                </div>

                {/* Max Discount */}
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Max Discount ₹ (for % type)</label>
                  <input type="number" value={form.maxDiscount}
                    onChange={(e) => f("maxDiscount", e.target.value)}
                    placeholder="150 (optional cap)"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500" />
                </div>

                {/* Min Order */}
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Min Order ₹</label>
                  <input type="number" value={form.minOrderValue}
                    onChange={(e) => f("minOrderValue", e.target.value)}
                    placeholder="0"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500" />
                </div>

                {/* Usage Limit */}
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Total Usage Limit</label>
                  <input type="number" value={form.usageLimit}
                    onChange={(e) => f("usageLimit", e.target.value)}
                    placeholder="Blank = unlimited"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500" />
                </div>

                {/* Per User Limit */}
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Per User Limit</label>
                  <input type="number" value={form.perUserLimit}
                    onChange={(e) => f("perUserLimit", e.target.value)}
                    placeholder="1"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500" />
                </div>

                {/* Valid From — defaults to today */}
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Valid From</label>
                  <input type="date" value={form.validFrom}
                    onChange={(e) => f("validFrom", e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500" />
                </div>

                {/* Valid Until */}
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Valid Until *</label>
                  <input type="date" value={form.validUntil}
                    onChange={(e) => f("validUntil", e.target.value)}
                    required
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500" />
                </div>

              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 border border-gray-700 text-gray-400 hover:text-white rounded-xl text-sm transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-medium py-2.5 rounded-xl text-sm transition-colors">
                  {saving ? "Creating..." : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}