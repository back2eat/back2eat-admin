"use client";
import { useEffect, useState } from "react";
import { getUsers } from "@/lib/api";
import AdminLayout from "@/components/AdminLayout";
import Header from "@/components/Header";
import Badge from "@/components/Badge";
import Pagination from "@/components/Pagination";
import { RefreshCw, Search } from "lucide-react";
import toast from "react-hot-toast";

export default function UsersPage() {
  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [role,       setRole]       = useState("");
  const [search,     setSearch]     = useState("");
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total,      setTotal]      = useState(0);
  const LIMIT = 20;

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (role) params.role = role;
      const res = await getUsers(params);
      setUsers(res.data.users || []);
      setTotal(res.data.pagination?.total || 0);
      setTotalPages(Math.ceil((res.data.pagination?.total || 0) / LIMIT));
    } catch { toast.error("Failed to load users"); }
    finally { setLoading(false); }
  };

  useEffect(() => { setPage(1); }, [role]);
  useEffect(() => { fetchUsers(); }, [role, page]);

  const filtered = users.filter((u) =>
    !search ||
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.mobile?.includes(search) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <Header title="Users" subtitle={`${total.toLocaleString()} total users`} />

      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1">
          {[["", "All"], ["CUSTOMER", "Customers"], ["RESTAURANT_OWNER", "Partners"], ["ADMIN", "Admins"]].map(([val, label]) => (
            <button key={val} onClick={() => setRole(val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                role === val ? "bg-orange-500 text-white" : "text-gray-400 hover:text-white"
              }`}>
              {label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-48 max-w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, mobile, email..."
            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-8 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500" />
        </div>
        <button onClick={fetchUsers}
          className="p-2 text-gray-400 hover:text-white border border-gray-800 bg-gray-900 rounded-xl hover:border-gray-600 transition-all ml-auto">
          <RefreshCw size={15} />
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              {["User","Mobile","Email","Role","Status","Joined"].map((h) => (
                <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {loading ? (
              [...Array(10)].map((_, i) => (
                <tr key={i}>{[...Array(6)].map((_, j) => (
                  <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-800 rounded animate-pulse" /></td>
                ))}</tr>
              ))
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center text-gray-500 py-16 text-sm">No users found</td></tr>
            ) : filtered.map((u) => (
              <tr key={u._id} className="hover:bg-gray-800/30 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold text-gray-300">
                      {(u.name || u.mobile)?.[0]?.toUpperCase()}
                    </div>
                    <p className="text-white text-sm font-medium">{u.name || "—"}</p>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-gray-300 text-sm font-mono">{u.mobile}</td>
                <td className="px-5 py-3.5 text-gray-400 text-sm">{u.email || "—"}</td>
                <td className="px-5 py-3.5"><Badge label={u.role} /></td>
                <td className="px-5 py-3.5">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium border ${
                    u.isActive
                      ? "bg-green-500/10 text-green-400 border-green-500/20"
                      : "bg-red-500/10 text-red-400 border-red-500/20"
                  }`}>
                    {u.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-gray-500 text-sm">
                  {new Date(u.createdAt).toLocaleDateString("en-IN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-5 py-4 border-t border-gray-800">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>
    </AdminLayout>
  );
}