"use client";
import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import Header from "@/components/Header";
import Badge from "@/components/Badge";
import Pagination from "@/components/Pagination";
import { RefreshCw, Search, Calendar } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";

export default function OrdersPage() {
  const [orders,     setOrders]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [status,     setStatus]     = useState("");
  const [search,     setSearch]     = useState("");
  const [date,       setDate]       = useState("");
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total,      setTotal]      = useState(0);
  const LIMIT = 20;

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (status) params.status = status;
      if (date)   params.date   = date;
      const res = await api.get("/admin/orders", { params });
      setOrders(res.data.orders || []);
      setTotal(res.data.pagination?.total || 0);
      setTotalPages(Math.ceil((res.data.pagination?.total || 0) / LIMIT));
    } catch {
      // fallback: orders endpoint may not exist on admin yet
      // try getting from restaurant-level if needed
      toast.error("Failed to load orders");
    } finally { setLoading(false); }
  };

  useEffect(() => { setPage(1); }, [status, date]);
  useEffect(() => { fetchOrders(); }, [status, date, page]);

  const filtered = orders.filter((o) =>
    !search ||
    o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
    o.customerId?.name?.toLowerCase().includes(search.toLowerCase()) ||
    o.customerId?.mobile?.includes(search)
  );

  const STATUSES = ["", "CREATED", "ACCEPTED", "PREPARING", "READY", "COMPLETED", "CANCELLED"];

  return (
    <AdminLayout>
      <Header
        title="Orders"
        subtitle={`${total.toLocaleString()} total orders`}
      />

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 flex-wrap">
          {STATUSES.map((s) => (
            <button key={s || "ALL"} onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                status === s ? "bg-orange-500 text-white" : "text-gray-400 hover:text-white"
              }`}>
              {s || "ALL"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order # or customer..."
            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-8 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500" />
        </div>
        <div className="relative">
          <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded-xl pl-8 pr-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500" />
        </div>
        {date && (
          <button onClick={() => setDate("")} className="text-gray-400 hover:text-white text-xs border border-gray-700 px-3 py-2 rounded-xl transition-all">
            Clear date
          </button>
        )}
        <button onClick={fetchOrders}
          className="p-2 text-gray-400 hover:text-white border border-gray-800 bg-gray-900 rounded-xl hover:border-gray-600 transition-all ml-auto">
          <RefreshCw size={15} />
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                {["Order #","Customer","Restaurant","Type","Amount","Payment","Status","Date"].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {loading ? (
                [...Array(10)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(8)].map((_, j) => (
                      <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-800 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-gray-500 py-16 text-sm">No orders found</td>
                </tr>
              ) : filtered.map((o) => (
                <tr key={o._id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-orange-400 text-xs font-semibold">{o.orderNumber}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-gray-300 text-sm">{o.customerId?.name || "—"}</p>
                    <p className="text-gray-500 text-xs">{o.customerId?.mobile}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-gray-300 text-sm">{o.restaurantId?.name || "—"}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge label={o.orderType} />
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-white font-semibold text-sm">₹{o.totalAmount?.toLocaleString("en-IN")}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge label={o.paymentStatus} />
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge label={o.status} />
                  </td>
                  <td className="px-5 py-3.5 text-gray-400 text-xs">
                    {new Date(o.createdAt).toLocaleDateString("en-IN")}
                    <br />
                    {new Date(o.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
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