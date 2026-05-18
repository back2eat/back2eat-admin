"use client";
import { useEffect, useState } from "react";
import { getRestaurants, approveRestaurant, suspendRestaurant, updatePlan } from "@/lib/api";
import AdminLayout from "@/components/AdminLayout";
import Header from "@/components/Header";
import Badge from "@/components/Badge";
import Pagination from "@/components/Pagination";
import { CheckCircle, XCircle, RefreshCw, Eye, Search } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [filter,      setFilter]      = useState("PENDING");
  const [search,      setSearch]      = useState("");
  const [page,        setPage]        = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [actionId,    setActionId]    = useState(null);
  const [confirmId,   setConfirmId]   = useState(null);
  const LIMIT = 15;

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const params = { status: filter, page, limit: LIMIT };
      const res    = await getRestaurants(params);
      setRestaurants(res.data.restaurants || []);
      const total  = res.data.pagination?.total || 0;
      setTotalPages(Math.ceil(total / LIMIT));
    } catch { toast.error("Failed to load"); }
    finally { setLoading(false); }
  };

  useEffect(() => { setPage(1); }, [filter]);
  useEffect(() => { fetchRestaurants(); }, [filter, page]);

  const handleApprove = async (id) => {
    setActionId(id);
    try {
      await approveRestaurant(id);
      toast.success("Restaurant approved ✓");
      fetchRestaurants();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    finally { setActionId(null); }
  };

  const handleSuspend = async (id) => {
    if (!confirm("Suspend this restaurant?")) return;
    setActionId(id);
    try {
      await suspendRestaurant(id);
      toast.success("Restaurant suspended");
      fetchRestaurants();
    } catch { toast.error("Failed"); }
    finally { setActionId(null); }
  };

  // Decline = suspend the pending restaurant (no hard-delete endpoint in API)
  const handleDecline = async (id) => {
    setConfirmId(null);
    setActionId(id);
    try {
      await suspendRestaurant(id);
      toast.success("Restaurant declined");
      fetchRestaurants();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    finally { setActionId(null); }
  };

  const handlePlan = async (id, plan) => {
    try {
      await updatePlan(id, plan);
      toast.success(`Plan → ${plan}`);
      fetchRestaurants();
    } catch { toast.error("Failed to update plan"); }
  };

  const filtered = restaurants.filter((r) =>
    !search ||
    r.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.city?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <Header title="Restaurants" subtitle="Approve, suspend and manage restaurant plans" />

      {/* Decline confirm modal */}
      {confirmId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <div className="text-3xl text-center mb-3">🚫</div>
            <h3 className="text-white font-bold text-center text-lg mb-2">Decline Restaurant?</h3>
            <p className="text-gray-400 text-sm text-center mb-6">
              This will suspend the restaurant application. The partner will not be able to access the platform.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-300 text-sm font-semibold hover:bg-gray-800 transition-colors">
                Cancel
              </button>
              <button onClick={() => handleDecline(confirmId)}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-colors">
                Yes, Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="flex gap-1.5 bg-gray-900 border border-gray-800 rounded-xl p-1">
          {["PENDING", "APPROVED", "SUSPENDED"].map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === s ? "bg-orange-500 text-white" : "text-gray-400 hover:text-white"
              }`}>
              {s}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-48 max-w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or city..."
            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-8 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500" />
        </div>
        <button onClick={fetchRestaurants}
          className="p-2 text-gray-400 hover:text-white border border-gray-800 bg-gray-900 rounded-xl hover:border-gray-600 transition-all ml-auto">
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900/80">
                {["Restaurant","Owner","City","Plan","Profile","Status","Actions"].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-800 rounded-lg animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-gray-500 py-16 text-sm">
                    No {filter.toLowerCase()} restaurants found
                  </td>
                </tr>
              ) : filtered.map((r) => (
                <tr key={r._id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="text-white font-medium text-sm">{r.name}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{r._id.slice(-8)}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-gray-300 text-sm">{r.ownerId?.name || "—"}</p>
                    <p className="text-gray-500 text-xs">{r.ownerId?.mobile}</p>
                  </td>
                  <td className="px-5 py-3.5 text-gray-300 text-sm">{r.city || "—"}</td>
                  <td className="px-5 py-3.5">
                    <select value={r.plan} onChange={(e) => handlePlan(r._id, e.target.value)}
                      className="bg-gray-800 border border-gray-700 text-gray-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-orange-500 cursor-pointer">
                      {["BASIC","STANDARD","PREMIUM"].map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge label={r.profileComplete ? "COMPLETED" : "PENDING"} />
                  </td>
                  <td className="px-5 py-3.5"><Badge label={r.status} /></td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <Link href={`/restaurants/${r._id}`}
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all">
                        <Eye size={14} />
                      </Link>
                      {r.status === "PENDING" && (
                        <>
                          <button onClick={() => handleApprove(r._id)} disabled={actionId === r._id}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg text-xs font-medium border border-green-500/20 transition-all disabled:opacity-50">
                            <CheckCircle size={12} /> Approve
                          </button>
                          <button onClick={() => setConfirmId(r._id)} disabled={actionId === r._id}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-medium border border-red-500/20 transition-all disabled:opacity-50">
                            <XCircle size={12} /> Decline
                          </button>
                        </>
                      )}
                      {r.status === "APPROVED" && (
                        <button onClick={() => handleSuspend(r._id)} disabled={actionId === r._id}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-medium border border-red-500/20 transition-all disabled:opacity-50">
                          <XCircle size={12} /> Suspend
                        </button>
                      )}
                      {r.status === "SUSPENDED" && (
                        <button onClick={() => handleApprove(r._id)} disabled={actionId === r._id}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg text-xs font-medium border border-green-500/20 transition-all disabled:opacity-50">
                          <CheckCircle size={12} /> Reactivate
                        </button>
                      )}
                    </div>
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
    </AdminLayout>
  );
}