"use client";
import { useEffect, useState } from "react";
import { getCoupons, createCoupon, toggleCoupon } from "@/lib/api";
import AdminLayout from "@/components/AdminLayout";
import Header from "@/components/Header";
import { Plus, ToggleLeft, ToggleRight, RefreshCw, X } from "lucide-react";
import toast from "react-hot-toast";

const EMPTY = {
  code: "", discountType: "FLAT", discountValue: "",
  maxDiscount: "", minOrderValue: "", usageLimit: "",
  perUserLimit: "1", validFrom: "", validUntil: "", scope: "PLATFORM",
};

export default function CouponsPage() {
  const [coupons,  setCoupons]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState(EMPTY);
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
    setSaving(true);
    try {
      const payload = {
        code:          form.code.toUpperCase().trim(),
        discountType:  form.discountType,
        discountValue: Number(form.discountValue),
        scope:         form.scope,
        perUserLimit:  Number(form.perUserLimit) || 1,
      };
      if (form.maxDiscount)   payload.maxDiscount   = Number(form.maxDiscount);
      if (form.minOrderValue) payload.minOrderValue = Number(form.minOrderValue);
      if (form.usageLimit)    payload.usageLimit    = Number(form.usageLimit);
      if (form.validFrom)     payload.validFrom     = form.validFrom;
      if (form.validUntil)    payload.validUntil    = form.validUntil;
      await createCoupon(payload);
      toast.success("Coupon created ✓");
      setShowForm(false);
      setForm(EMPTY);
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
          <button onClick={() => setShowForm(true)}
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
                    <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-800 rounded animate-pulse" /></td>
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
                      {c.discountType === "FLAT" ? `₹${c.discountValue}` : `${c.discountValue}%`}
                    </p>
                    {c.maxDiscount && <p className="text-gray-500 text-xs">max ₹{c.maxDiscount}</p>}
                  </td>
                  <td className="px-5 py-3.5 text-gray-300 text-sm">
                    {c.minOrderValue ? `₹${c.minOrderValue}` : "—"}
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-gray-300 text-sm">{c.usedCount} / {c.usageLimit || "∞"}</p>
                    <p className="text-gray-500 text-xs">{c.perUserLimit}x per user</p>
                  </td>
                  <td className="px-5 py-3.5 text-gray-400 text-xs">
                    {c.validFrom ? new Date(c.validFrom).toLocaleDateString("en-IN") : "Any"} →{" "}
                    {c.validUntil ? new Date(c.validUntil).toLocaleDateString("en-IN") : "No expiry"}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-medium px-2 py-1 rounded-lg border ${
                      c.scope === "PLATFORM"
                        ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                        : "bg-purple-500/10 text-purple-400 border-purple-500/20"
                    }`}>{c.scope}</span>
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
                    <button onClick={() => handleToggle(c._id)} className="transition-colors">
                      {c.isActive
                        ? <ToggleRight size={24} className="text-green-400 hover:text-green-300" />
                        : <ToggleLeft  size={24} className="text-gray-500 hover:text-gray-300" />
                      }
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
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="grid grid-cols-2 gap-4 mb-5">
                {[
                  { label: "Coupon Code *", key: "code",          type: "text",   placeholder: "WELCOME50",  required: true,  span: false },
                  { label: "Scope",         key: "scope",         type: "select", options: ["PLATFORM","RESTAURANT"], span: false },
                  { label: "Discount Type", key: "discountType",  type: "select", options: ["FLAT","PERCENT"],        span: false },
                  { label: "Discount Value *", key: "discountValue", type: "number", placeholder: "50", required: true, span: false },
                  { label: "Max Discount (₹)", key: "maxDiscount",   type: "number", placeholder: "Optional cap for %", span: false },
                  { label: "Min Order (₹)",    key: "minOrderValue", type: "number", placeholder: "0",    span: false },
                  { label: "Total Usage Limit", key: "usageLimit",   type: "number", placeholder: "Blank = unlimited", span: false },
                  { label: "Per User Limit",   key: "perUserLimit",  type: "number", placeholder: "1",   span: false },
                  { label: "Valid From",   key: "validFrom",  type: "date", span: false },
                  { label: "Valid Until",  key: "validUntil", type: "date", span: false },
                ].map(({ label, key, type, placeholder, required, options }) => (
                  <div key={key}>
                    <label className="text-xs text-gray-400 mb-1.5 block">{label}</label>
                    {type === "select" ? (
                      <select value={form[key]} onChange={(e) => f(key, e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500">
                        {options.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input type={type} value={form[key]} onChange={(e) => f(key, e.target.value)}
                        placeholder={placeholder} required={required}
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500" />
                    )}
                  </div>
                ))}
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