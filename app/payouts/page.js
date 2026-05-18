"use client";
import { useEffect, useState } from "react";
import { getPayouts, processPayout } from "@/lib/api";
import AdminLayout from "@/components/AdminLayout";
import Header from "@/components/Header";
import Badge from "@/components/Badge";
import Pagination from "@/components/Pagination";
import { RefreshCw, CheckCircle, XCircle, Loader2, IndianRupee } from "lucide-react";
import toast from "react-hot-toast";

export default function PayoutsPage() {
  const [payouts,    setPayouts]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [filter,     setFilter]     = useState("PENDING");
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total,      setTotal]      = useState(0);
  const [modal,      setModal]      = useState(null);
  const [txRef,      setTxRef]      = useState("");
  const [note,       setNote]       = useState("");
  const [actionId,   setActionId]   = useState(null);
  const [totalAmt,   setTotalAmt]   = useState(0);
  const LIMIT = 20;

  const fetchPayouts = async () => {
    setLoading(true);
    try {
      const res = await getPayouts({ status: filter, page, limit: LIMIT });
      const list = res.data.payouts || [];
      setPayouts(list);
      setTotal(res.data.pagination?.total || 0);
      setTotalPages(Math.ceil((res.data.pagination?.total || 0) / LIMIT));
      setTotalAmt(list.reduce((s, p) => s + p.amount, 0));
    } catch { toast.error("Failed to load payouts"); }
    finally { setLoading(false); }
  };

  useEffect(() => { setPage(1); }, [filter]);
  useEffect(() => { fetchPayouts(); }, [filter, page]);

  const handleProcess = async (status) => {
    if (!modal) return;
    if (status === "PROCESSED" && !txRef.trim()) {
      return toast.error("Transaction reference required");
    }
    setActionId(modal._id);
    try {
      await processPayout(modal._id, { status, transactionRef: txRef.trim(), adminNote: note.trim() });
      toast.success(`Payout marked as ${status}`);
      setModal(null); setTxRef(""); setNote("");
      fetchPayouts();
    } catch { toast.error("Failed"); }
    finally { setActionId(null); }
  };

  return (
    <AdminLayout>
      <Header
        title="Payouts"
        subtitle="Process partner withdrawal requests"
        actions={
          filter === "PENDING" && total > 0 ? (
            <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-xl px-3 py-1.5 text-xs font-medium">
              <IndianRupee size={13} />
              ₹{totalAmt.toLocaleString("en-IN")} pending on this page
            </div>
          ) : null
        }
      />

      {/* Filter tabs */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1">
          {["PENDING","PROCESSING","PROCESSED","FAILED"].map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === s ? "bg-orange-500 text-white" : "text-gray-400 hover:text-white"
              }`}>
              {s}
            </button>
          ))}
        </div>
        <button onClick={fetchPayouts}
          className="p-2 text-gray-400 hover:text-white border border-gray-800 bg-gray-900 rounded-xl hover:border-gray-600 transition-all ml-auto">
          <RefreshCw size={15} />
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                {["Restaurant","Amount","Method","Payment Details","Status","Requested","Action"].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i}>{[...Array(7)].map((_, j) => (
                    <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-800 rounded animate-pulse" /></td>
                  ))}</tr>
                ))
              ) : payouts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-gray-500 py-16 text-sm">
                    No {filter.toLowerCase()} payouts
                  </td>
                </tr>
              ) : payouts.map((p) => (
                <tr key={p._id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="text-white font-medium text-sm">{p.restaurantId?.name || "—"}</p>
                    <p className="text-gray-500 text-xs">{p.restaurantId?.contactPhone}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-white font-bold">₹{p.amount.toLocaleString("en-IN")}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge label={p.method} />
                  </td>
                  <td className="px-5 py-3.5">
                    {p.method === "UPI" ? (
                      <p className="text-gray-300 text-sm font-mono">{p.upiId || "—"}</p>
                    ) : (
                      <div>
                        <p className="text-gray-300 text-xs font-mono">{p.accountNumber || "—"}</p>
                        <p className="text-gray-500 text-xs">{p.ifscCode || ""} · {p.accountName || ""}</p>
                      </div>
                    )}
                    {p.transactionRef && (
                      <p className="text-green-400 text-xs mt-1">UTR: {p.transactionRef}</p>
                    )}
                  </td>
                  <td className="px-5 py-3.5"><Badge label={p.status} /></td>
                  <td className="px-5 py-3.5 text-gray-500 text-xs">
                    {new Date(p.createdAt).toLocaleDateString("en-IN")}<br />
                    {new Date(p.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="px-5 py-3.5">
                    {(p.status === "PENDING" || p.status === "PROCESSING") && (
                      <button onClick={() => { setModal(p); setTxRef(""); setNote(""); }}
                        className="px-3 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 rounded-lg text-xs font-medium border border-orange-500/20 transition-all">
                        Process
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-4 border-t border-gray-800">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>

      {/* Process Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-white font-bold text-lg mb-1">Process Payout</h3>
            <div className="bg-gray-800 rounded-xl p-4 mb-5 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Restaurant</span>
                <span className="text-white text-sm font-medium">{modal.restaurantId?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Amount</span>
                <span className="text-white font-bold">₹{modal.amount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Method</span>
                <span className="text-white text-sm">{modal.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">{modal.method === "UPI" ? "UPI ID" : "Account"}</span>
                <span className="text-white text-sm font-mono">
                  {modal.method === "UPI" ? modal.upiId : `${modal.accountNumber} · ${modal.ifscCode}`}
                </span>
              </div>
            </div>
            <div className="space-y-3 mb-5">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Transaction Reference (UTR / UPI ref) *</label>
                <input type="text" placeholder="e.g. 418234567890"
                  value={txRef} onChange={(e) => setTxRef(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Admin Note (optional)</label>
                <input type="text" placeholder="Any notes..."
                  value={note} onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500" />
              </div>
            </div>
            <div className="flex gap-2.5">
              <button onClick={() => handleProcess("PROCESSED")}
                disabled={!txRef.trim() || actionId}
                className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-medium py-2.5 rounded-xl transition-colors text-sm">
                {actionId ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                Mark Processed
              </button>
              <button onClick={() => handleProcess("FAILED")}
                disabled={!!actionId}
                className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-medium py-2.5 rounded-xl transition-colors text-sm">
                {actionId ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                Mark Failed
              </button>
            </div>
            <button onClick={() => setModal(null)}
              className="w-full mt-3 text-gray-500 hover:text-gray-300 text-sm transition-colors py-1">
              Cancel
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}