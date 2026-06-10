"use client";
// ADMIN PANEL (Next.js)
// app/luckydraw/page.js

import { useEffect, useState } from "react";
import { getDraws, createDraw, getDrawById, conductDraw, cancelDraw } from "@/lib/api";
import AdminLayout from "@/components/AdminLayout";
import Header from "@/components/Header";
import {
  Plus, RefreshCw, Trophy, Ticket, Calendar,
  X, Eye, Play, XCircle, Loader2, Gift, Users,
} from "lucide-react";
import toast from "react-hot-toast";

const EMPTY = {
  title: "", description: "", prize: "",
  startDate: "", endDate: "", drawDate: "",
  minOrderAmount: "", applicableOrderTypes: [],
};

const STATUS_COLORS = {
  UPCOMING:  "bg-blue-500/10 text-blue-400 border-blue-500/20",
  ACTIVE:    "bg-green-500/10 text-green-400 border-green-500/20",
  COMPLETED: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function LuckyDrawPage() {
  const [draws,      setDraws]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form,       setForm]       = useState(EMPTY);
  const [saving,     setSaving]     = useState(false);
  const [filter,     setFilter]     = useState("ALL");

  // Detail modal
  const [detailDraw,    setDetailDraw]    = useState(null);
  const [detailTickets, setDetailTickets] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [conducting,    setConducting]    = useState(false);
  const [winner,        setWinner]        = useState(null);

  const fetchDraws = async () => {
    setLoading(true);
    try {
      const params = filter !== "ALL" ? { status: filter } : {};
      const res    = await getDraws(params);
      setDraws(res.data.draws || []);
    } catch { toast.error("Failed to load draws"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDraws(); }, [filter]);

  const f = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const toggleOrderType = (type) => {
    setForm((p) => ({
      ...p,
      applicableOrderTypes: p.applicableOrderTypes.includes(type)
        ? p.applicableOrderTypes.filter((t) => t !== type)
        : [...p.applicableOrderTypes, type],
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (new Date(form.drawDate) < new Date(form.endDate)) {
      toast.error("Draw date must be on or after end date");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title:       form.title,
        description: form.description,
        prize:       form.prize,
        startDate:   form.startDate,
        endDate:     form.endDate,
        drawDate:    form.drawDate,
        minOrderAmount:       form.minOrderAmount ? Number(form.minOrderAmount) : 0,
        applicableOrderTypes: form.applicableOrderTypes,
      };
      await createDraw(payload);
      toast.success("Lucky draw created! 🎉");
      setShowCreate(false);
      setForm(EMPTY);
      fetchDraws();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create draw");
    } finally { setSaving(false); }
  };

  const openDetail = async (draw) => {
    setDetailDraw(draw);
    setWinner(null);
    setDetailLoading(true);
    try {
      const res = await getDrawById(draw._id);
      setDetailDraw(res.data.draw);
      setDetailTickets(res.data.tickets || []);
    } catch { toast.error("Failed to load draw details"); }
    finally { setDetailLoading(false); }
  };

  const handleConduct = async () => {
    if (!detailDraw) return;
    if (!confirm(`Conduct the draw for "${detailDraw.title}"? This cannot be undone.`)) return;
    setConducting(true);
    try {
      const res = await conductDraw(detailDraw._id);
      setWinner(res.data.winner);
      setDetailDraw(res.data.draw);
      toast.success(`🏆 Winner: ${res.data.winner.name} — Ticket #${res.data.winner.ticketNumber}`);
      fetchDraws();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to conduct draw");
    } finally { setConducting(false); }
  };

  const handleCancel = async (id) => {
    if (!confirm("Cancel this draw?")) return;
    try {
      await cancelDraw(id);
      toast.success("Draw cancelled");
      setDetailDraw(null);
      fetchDraws();
    } catch { toast.error("Failed to cancel"); }
  };

  const fmt = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

  return (
    <AdminLayout>
      <Header
        title="Lucky Draw"
        subtitle={`${draws.length} draws`}
        actions={
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
            <Plus size={15} /> New Draw
          </button>
        }
      />

      {/* Filter tabs */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="flex gap-1.5 bg-gray-900 border border-gray-800 rounded-xl p-1">
          {["ALL", "UPCOMING", "ACTIVE", "COMPLETED", "CANCELLED"].map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === s ? "bg-orange-500 text-white" : "text-gray-400 hover:text-white"
              }`}>
              {s}
            </button>
          ))}
        </div>
        <button onClick={fetchDraws}
          className="p-2 text-gray-400 hover:text-white border border-gray-800 bg-gray-900 rounded-xl hover:border-gray-600 transition-all ml-auto">
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Draws grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-900 border border-gray-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : draws.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-4">
            <Trophy size={28} className="text-orange-400" />
          </div>
          <p className="text-white font-semibold text-lg mb-1">No draws yet</p>
          <p className="text-gray-500 text-sm mb-6">Create your first lucky draw to engage customers</p>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
            <Plus size={15} /> Create Draw
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {draws.map((draw) => (
            <div key={draw._id}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-600 transition-all cursor-pointer"
              onClick={() => openDetail(draw)}>
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-base truncate">{draw.title}</p>
                  <p className="text-gray-500 text-xs mt-0.5 truncate">{draw.description || "No description"}</p>
                </div>
                <span className={`ml-2 flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-lg border ${STATUS_COLORS[draw.status] || ""}`}>
                  {draw.status}
                </span>
              </div>

              {/* Prize */}
              <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-xl px-3 py-2 mb-4">
                <Gift size={14} className="text-orange-400 flex-shrink-0" />
                <p className="text-orange-300 font-semibold text-sm truncate">{draw.prize}</p>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                {[
                  { label: "Starts", value: fmt(draw.startDate) },
                  { label: "Ends",   value: fmt(draw.endDate) },
                  { label: "Draw",   value: fmt(draw.drawDate) },
                ].map((d) => (
                  <div key={d.label} className="bg-gray-800 rounded-lg py-2 px-1">
                    <p className="text-gray-500 text-xs mb-0.5">{d.label}</p>
                    <p className="text-gray-200 text-xs font-semibold">{d.value}</p>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                  <Ticket size={12} />
                  <span>{draw.totalTickets} tickets</span>
                </div>
                {draw.minOrderAmount > 0 && (
                  <span className="text-xs text-gray-500">Min ₹{draw.minOrderAmount}</span>
                )}
                {draw.status === "COMPLETED" && draw.winnerTicketNumber && (
                  <div className="flex items-center gap-1 text-yellow-400 text-xs font-semibold">
                    <Trophy size={12} />
                    <span>#{draw.winnerTicketNumber}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Create Draw Modal ──────────────────────────────────────────────── */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <Trophy size={18} className="text-orange-400" /> New Lucky Draw
              </h3>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="grid grid-cols-2 gap-4 mb-5">
                {/* Title */}
                <div className="col-span-2">
                  <label className="text-xs text-gray-400 mb-1.5 block">Draw Title *</label>
                  <input value={form.title} onChange={(e) => f("title", e.target.value)}
                    placeholder="e.g. Diwali Lucky Draw 2026" required
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500" />
                </div>

                {/* Description */}
                <div className="col-span-2">
                  <label className="text-xs text-gray-400 mb-1.5 block">Description</label>
                  <textarea value={form.description} onChange={(e) => f("description", e.target.value)}
                    placeholder="Tell customers about this draw..." rows={2}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500 resize-none" />
                </div>

                {/* Prize */}
                <div className="col-span-2">
                  <label className="text-xs text-gray-400 mb-1.5 block">Prize *</label>
                  <input value={form.prize} onChange={(e) => f("prize", e.target.value)}
                    placeholder="e.g. Free meal for 2, ₹500 voucher" required
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500" />
                </div>

                {/* Dates */}
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Start Date *</label>
                  <input type="datetime-local" value={form.startDate} onChange={(e) => f("startDate", e.target.value)} required
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">End Date *</label>
                  <input type="datetime-local" value={form.endDate} onChange={(e) => f("endDate", e.target.value)} required
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Draw Date * (when winner picked)</label>
                  <input type="datetime-local" value={form.drawDate} onChange={(e) => f("drawDate", e.target.value)} required
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Min Order Amount (₹)</label>
                  <input type="number" value={form.minOrderAmount} onChange={(e) => f("minOrderAmount", e.target.value)}
                    placeholder="0 = any order"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500" />
                </div>

                {/* Order types */}
                <div className="col-span-2">
                  <label className="text-xs text-gray-400 mb-2 block">Applicable Order Types (empty = all)</label>
                  <div className="flex gap-2 flex-wrap">
                    {["TAKEAWAY", "DINE_IN", "TABLE_BOOKING"].map((type) => (
                      <button key={type} type="button"
                        onClick={() => toggleOrderType(type)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          form.applicableOrderTypes.includes(type)
                            ? "bg-orange-500/20 text-orange-400 border-orange-500/40"
                            : "bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500"
                        }`}>
                        {type.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setShowCreate(false)}
                  className="flex-1 py-2.5 border border-gray-700 text-gray-400 hover:text-white rounded-xl text-sm transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-medium py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                  {saving ? <><Loader2 size={14} className="animate-spin" /> Creating...</> : "Create Draw 🎉"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Draw Detail Modal ──────────────────────────────────────────────── */}
      {detailDraw && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-gray-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white font-bold text-lg">{detailDraw.title}</h3>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${STATUS_COLORS[detailDraw.status] || ""}`}>
                    {detailDraw.status}
                  </span>
                </div>
                <p className="text-gray-500 text-sm">{detailDraw.description || "No description"}</p>
              </div>
              <button onClick={() => setDetailDraw(null)} className="text-gray-400 hover:text-white ml-4 flex-shrink-0">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {/* Prize + stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="md:col-span-1 bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 flex items-center gap-3">
                  <Gift size={24} className="text-orange-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-orange-400/70 mb-0.5">Prize</p>
                    <p className="text-orange-300 font-bold text-sm">{detailDraw.prize}</p>
                  </div>
                </div>
                <div className="bg-gray-800 rounded-xl p-4 flex items-center gap-3">
                  <Ticket size={20} className="text-blue-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Total Tickets</p>
                    <p className="text-white font-bold text-lg">{detailTickets.length}</p>
                  </div>
                </div>
                <div className="bg-gray-800 rounded-xl p-4 flex items-center gap-3">
                  <Users size={20} className="text-green-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Unique Participants</p>
                    <p className="text-white font-bold text-lg">
                      {new Set(detailTickets.map((t) => t.userId?._id)).size}
                    </p>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { label: "Start Date", value: fmt(detailDraw.startDate), icon: Calendar },
                  { label: "End Date",   value: fmt(detailDraw.endDate),   icon: Calendar },
                  { label: "Draw Date",  value: fmt(detailDraw.drawDate),  icon: Trophy   },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="bg-gray-800 rounded-xl p-3 text-center">
                    <Icon size={14} className="text-gray-400 mx-auto mb-1" />
                    <p className="text-gray-500 text-xs mb-0.5">{label}</p>
                    <p className="text-gray-200 text-sm font-semibold">{value}</p>
                  </div>
                ))}
              </div>

              {/* Winner announcement */}
              {(winner || detailDraw.status === "COMPLETED") && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-5 mb-6 text-center">
                  <div className="text-4xl mb-3">🏆</div>
                  <p className="text-yellow-300 font-bold text-lg mb-1">Winner Announced!</p>
                  <p className="text-yellow-400/80 text-sm mb-3">
                    Ticket #{winner?.ticketNumber || detailDraw.winnerTicketNumber}
                  </p>
                  <p className="text-white font-semibold">
                    {winner?.name || "—"} · {winner?.mobile || "—"}
                  </p>
                </div>
              )}

              {/* Actions */}
              {detailDraw.status !== "COMPLETED" && detailDraw.status !== "CANCELLED" && (
                <div className="flex gap-3 mb-6">
                  {(detailDraw.status === "ACTIVE" || detailDraw.status === "UPCOMING") && (
                    <button onClick={handleConduct} disabled={conducting}
                      className="flex items-center gap-2 bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-colors">
                      {conducting
                        ? <><Loader2 size={14} className="animate-spin" /> Drawing...</>
                        : <><Play size={14} /> Conduct Draw</>}
                    </button>
                  )}
                  <button onClick={() => handleCancel(detailDraw._id)}
                    className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-medium px-5 py-2.5 rounded-xl text-sm transition-colors">
                    <XCircle size={14} /> Cancel Draw
                  </button>
                </div>
              )}

              {/* Tickets table */}
              <div>
                <p className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Ticket size={15} className="text-orange-400" />
                  Tickets ({detailTickets.length})
                </p>
                {detailLoading ? (
                  <div className="space-y-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-10 bg-gray-800 rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : detailTickets.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm bg-gray-800 rounded-xl">
                    No tickets yet. Tickets are issued automatically when customers place orders.
                  </div>
                ) : (
                  <div className="bg-gray-800 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto max-h-64">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-700">
                            {["Ticket #", "Customer", "Mobile", "Winner"].map((h) => (
                              <th key={h} className="text-left text-xs text-gray-500 uppercase px-4 py-2.5">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700/50">
                          {detailTickets.map((t) => (
                            <tr key={t._id}
                              className={`${t.isWinner ? "bg-yellow-500/10" : "hover:bg-gray-700/30"} transition-colors`}>
                              <td className="px-4 py-2.5">
                                <span className={`font-mono text-sm font-bold ${t.isWinner ? "text-yellow-400" : "text-orange-400"}`}>
                                  #{t.ticketNumber}
                                  {t.isWinner && " 🏆"}
                                </span>
                              </td>
                              <td className="px-4 py-2.5 text-gray-300 text-sm">{t.userId?.name || "—"}</td>
                              <td className="px-4 py-2.5 text-gray-500 text-sm">{t.userId?.mobile || "—"}</td>
                              <td className="px-4 py-2.5">
                                {t.isWinner
                                  ? <span className="text-xs text-yellow-400 font-semibold">Winner 🏆</span>
                                  : <span className="text-xs text-gray-600">—</span>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}