"use client";
import { useEffect, useState } from "react";
import { getStats, triggerSettlement } from "@/lib/api";
import AdminLayout from "@/components/AdminLayout";
import Header from "@/components/Header";
import StatsCard from "@/components/StatsCard";
import {
  Store, Users, ShoppingBag, IndianRupee,
  Clock, CreditCard, RefreshCw, Loader2,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import toast from "react-hot-toast";

const CustomTooltip = ({ active, payload, label, prefix = "" }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-3 shadow-xl">
      <p className="text-gray-400 text-xs mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="text-white font-semibold text-sm">
          {prefix}{typeof p.value === "number" ? p.value.toLocaleString("en-IN") : p.value}
        </p>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const [stats,    setStats]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [settling, setSettling] = useState(false);

  const weeklyData = [
    { day: "Mon", orders: 12, revenue: 4800  },
    { day: "Tue", orders: 19, revenue: 7600  },
    { day: "Wed", orders: 15, revenue: 6000  },
    { day: "Thu", orders: 22, revenue: 8800  },
    { day: "Fri", orders: 30, revenue: 12000 },
    { day: "Sat", orders: 45, revenue: 18000 },
    { day: "Sun", orders: 38, revenue: 15200 },
  ];

  useEffect(() => {
    getStats()
      .then((r) => setStats(r.data.stats))
      .catch(() => toast.error("Failed to load stats"))
      .finally(() => setLoading(false));
  }, []);

  const handleSettle = async () => {
    setSettling(true);
    try {
      const r = await triggerSettlement();
      toast.success(r.data.message || "Settlement triggered");
    } catch (err) {
      toast.error(err.response?.data?.message || "Settlement failed");
    } finally { setSettling(false); }
  };

  const cards = stats ? [
    { title: "Approved Restaurants", value: stats.totalRestaurants,    icon: Store,        color: "orange" },
    { title: "Pending Approvals",    value: stats.pendingApprovals,    icon: Clock,        color: "red",   subtitle: "Waiting for review" },
    { title: "Total Customers",      value: stats.totalCustomers,      icon: Users,        color: "blue"   },
    { title: "Today's Orders",       value: stats.todayOrders,         icon: ShoppingBag,  color: "green"  },
    { title: "Total Revenue",        value: `₹${(stats.totalRevenue || 0).toLocaleString("en-IN")}`, icon: IndianRupee, color: "purple" },
    { title: "Active Subscriptions", value: stats.activeSubscriptions, icon: CreditCard,   color: "green"  },
  ] : [];

  return (
    <AdminLayout>
      <Header
        title="Dashboard"
        subtitle={`Welcome back! ${new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}`}
        actions={
          <button onClick={handleSettle} disabled={settling}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 hover:text-white rounded-xl text-sm font-medium transition-all">
            {settling ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            {settling ? "Settling..." : "Run T+5 Settlement"}
          </button>
        }
      />

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 mb-7">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-900 border border-gray-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 mb-7">
          {cards.map((c) => <StatsCard key={c.title} {...c} />)}
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <p className="text-white font-semibold mb-5">Weekly Orders</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="og" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f97316" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="day" stroke="#4b5563" tick={{ fontSize: 12, fill: "#9ca3af" }} />
              <YAxis stroke="#4b5563" tick={{ fontSize: 12, fill: "#9ca3af" }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="orders" stroke="#f97316" fill="url(#og)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <p className="text-white font-semibold mb-5">Weekly Revenue (₹)</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="day" stroke="#4b5563" tick={{ fontSize: 12, fill: "#9ca3af" }} />
              <YAxis stroke="#4b5563" tick={{ fontSize: 12, fill: "#9ca3af" }} />
              <Tooltip content={<CustomTooltip prefix="₹" />} />
              <Bar dataKey="revenue" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AdminLayout>
  );
}