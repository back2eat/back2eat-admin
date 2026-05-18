"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getRestaurantById, getRestaurantPayments, approveRestaurant, suspendRestaurant, declineRestaurant, startSubscription } from "@/lib/api";
import AdminLayout from "@/components/AdminLayout";
import Header from "@/components/Header";
import Badge from "@/components/Badge";
import {
  ArrowLeft, MapPin, Phone, Mail, Star,
  Building2, CreditCard, Clock, Loader2, CheckCircle, XCircle,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

const PLANS = ["BASIC", "STANDARD", "PREMIUM"];

export default function RestaurantDetailPage() {
  const { id }      = useParams();
  const [data,      setData]      = useState(null);
  const [payments,  setPayments]  = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [subPlan,   setSubPlan]   = useState("BASIC");
  const [starting,  setStarting]  = useState(false);
  const [tab,       setTab]       = useState("info");      // info | payments
  const [actionId,  setActionId]  = useState(null);
  const [confirm,   setConfirm]   = useState(null);        // "decline" | "suspend"

  useEffect(() => {
    Promise.all([getRestaurantById(id), getRestaurantPayments(id)])
      .then(([r, p]) => {
        setData(r.data);
        setPayments(p.data);
        setSubPlan(r.data.restaurant?.plan || "BASIC");
      })
      .catch(() => toast.error("Failed to load restaurant"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleApprove = async () => {
    setActionId("approve");
    try { await approveRestaurant(id); toast.success("Approved ✓"); setData((d) => ({ ...d, restaurant: { ...d.restaurant, status: "APPROVED" } })); }
    catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    finally { setActionId(null); }
  };

  const handleSuspend = async () => {
    setConfirm(null); setActionId("suspend");
    try { await suspendRestaurant(id); toast.success("Suspended"); setData((d) => ({ ...d, restaurant: { ...d.restaurant, status: "SUSPENDED" } })); }
    catch { toast.error("Failed"); }
    finally { setActionId(null); }
  };

  const handleDecline = async () => {
    setConfirm(null); setActionId("decline");
    try { await declineRestaurant(id); toast.success("Declined & deleted"); window.location.href = "/restaurants"; }
    catch (err) { toast.error(err.response?.data?.message || "Failed"); setActionId(null); }
  };

  const handleStartSubscription = async () => {
    setStarting(true);
    try {
      await startSubscription({ restaurantId: id, plan: subPlan });
      toast.success(`${subPlan} subscription started`);
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    finally { setStarting(false); }
  };

  if (loading) return (
    <AdminLayout>
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-orange-500" />
      </div>
    </AdminLayout>
  );

  if (!data) return (
    <AdminLayout>
      <div className="text-center text-gray-500 py-20">Restaurant not found</div>
    </AdminLayout>
  );

  const { restaurant, branches } = data;
  const sub      = payments?.subscription;
  const invoices = payments?.invoices || [];

  return (
    <AdminLayout>
      {/* Confirm modal */}
      {confirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <div className="text-3xl text-center mb-3">{confirm === "decline" ? "🗑️" : "🔒"}</div>
            <h3 className="text-white font-bold text-center text-lg mb-2">
              {confirm === "decline" ? "Decline & Delete?" : "Suspend Restaurant?"}
            </h3>
            <p className="text-gray-400 text-sm text-center mb-6">
              {confirm === "decline"
                ? "Permanently deletes the restaurant, owner account, and ALL data. Cannot be undone."
                : "Restaurant will be hidden from customers immediately."}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-300 text-sm font-semibold hover:bg-gray-800 transition-colors">
                Cancel
              </button>
              <button onClick={confirm === "decline" ? handleDecline : handleSuspend}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-colors">
                {confirm === "decline" ? "Yes, Delete" : "Yes, Suspend"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <Link href="/restaurants" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
          <ArrowLeft size={15} /> Back to restaurants
        </Link>
      </div>

      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <Header title={restaurant.name} subtitle={`${restaurant.city} · ${restaurant.plan} Plan`} />
        {/* Quick action buttons */}
        <div className="flex gap-2 flex-wrap">
          {restaurant.status === "PENDING" && (<>
            <button disabled={!!actionId} onClick={handleApprove}
              className="flex items-center gap-1.5 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-xl text-sm font-semibold border border-green-500/20 transition-all disabled:opacity-50">
              <CheckCircle size={14} /> {actionId === "approve" ? "Approving…" : "Approve"}
            </button>
            <button disabled={!!actionId} onClick={() => setConfirm("decline")}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-sm font-semibold border border-red-500/20 transition-all disabled:opacity-50">
              <XCircle size={14} /> Decline
            </button>
          </>)}
          {restaurant.status === "APPROVED" && (
            <button disabled={!!actionId} onClick={() => setConfirm("suspend")}
              className="flex items-center gap-1.5 px-4 py-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 rounded-xl text-sm font-semibold border border-orange-500/20 transition-all disabled:opacity-50">
              <XCircle size={14} /> {actionId === "suspend" ? "Suspending…" : "Suspend"}
            </button>
          )}
          {restaurant.status === "SUSPENDED" && (
            <button disabled={!!actionId} onClick={handleApprove}
              className="flex items-center gap-1.5 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-xl text-sm font-semibold border border-green-500/20 transition-all disabled:opacity-50">
              <CheckCircle size={14} /> {actionId === "approve" ? "Reinstating…" : "Reinstate"}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 w-fit mb-6">
        {[["info", "Restaurant Info"], ["payments", "Payments & Subscription"]].map(([val, label]) => (
          <button key={val} onClick={() => setTab(val)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              tab === val ? "bg-orange-500 text-white" : "text-gray-400 hover:text-white"
            }`}>
            {label}
          </button>
        ))}
      </div>

      {tab === "info" && (
      <div className="grid grid-cols-3 gap-6">
        {/* Left col */}
        <div className="col-span-2 space-y-5">

          {/* Basic Info */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider text-gray-400">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Status",       value: <Badge label={restaurant.status} /> },
                { label: "Plan",         value: <Badge label={restaurant.plan} /> },
                { label: "Rating",       value: restaurant.rating ? `${restaurant.rating} ⭐ (${restaurant.ratingCount} reviews)` : "No reviews" },
                { label: "Cuisines",     value: restaurant.cuisine?.join(", ") || "—" },
                { label: "Prep Time",    value: restaurant.avgPrepTimeMins ? `${restaurant.avgPrepTimeMins} min` : "—" },
                { label: "Min Order",    value: restaurant.minOrderAmount ? `₹${restaurant.minOrderAmount}` : "—" },
                { label: "Dine-in",      value: restaurant.dineInEnabled ? "✅ Yes" : "❌ No" },
                { label: "Takeaway",     value: restaurant.takeawayEnabled ? "✅ Yes" : "❌ No" },
                { label: "Table Booking",value: restaurant.tableBookingEnabled ? "✅ Yes" : "❌ No" },
                { label: "Profile",      value: restaurant.profileComplete ? "✅ Complete" : "⚠️ Incomplete" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-gray-500 mb-1">{label}</p>
                  <p className="text-sm text-gray-200">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact & Address */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-sm uppercase tracking-wider text-gray-400 font-semibold mb-4">Contact & Address</h3>
            <div className="space-y-3">
              {[
                { icon: MapPin, label: `${restaurant.address || "—"}, ${restaurant.city}, ${restaurant.state} ${restaurant.pincode}` },
                { icon: Phone,  label: restaurant.contactPhone || "—" },
                { icon: Mail,   label: restaurant.contactEmail || "—" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-start gap-3">
                  <Icon size={15} className="text-gray-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-300">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-sm uppercase tracking-wider text-gray-400 font-semibold mb-4">India Compliance</h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "GST Number",   value: restaurant.gstNumber   || "Not provided" },
                { label: "FSSAI Number", value: restaurant.fssaiNumber || "Not provided" },
                { label: "PAN Number",   value: restaurant.panNumber   || "Not provided" },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-800 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">{label}</p>
                  <p className="text-sm text-gray-200 font-mono">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bank Details */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-sm uppercase tracking-wider text-gray-400 font-semibold mb-4">Bank Details (Payouts)</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Account Number", value: restaurant.bankAccountNumber || "—" },
                { label: "IFSC Code",      value: restaurant.bankIfscCode      || "—" },
                { label: "Account Name",   value: restaurant.bankAccountName   || "—" },
                { label: "UPI ID",         value: restaurant.upiId             || "—" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-gray-500 mb-1">{label}</p>
                  <p className="text-sm text-gray-200 font-mono">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Branches */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-sm uppercase tracking-wider text-gray-400 font-semibold mb-4">
              Branches ({branches?.length || 0})
            </h3>
            {branches?.length === 0 ? (
              <p className="text-gray-500 text-sm">No branches yet</p>
            ) : (
              <div className="space-y-3">
                {branches?.map((b) => (
                  <div key={b._id} className="bg-gray-800 rounded-xl p-4 flex items-start justify-between">
                    <div>
                      <p className="text-white font-medium text-sm">{b.name}</p>
                      <p className="text-gray-400 text-xs mt-0.5">{b.address}, {b.city}</p>
                      {b.phone && <p className="text-gray-500 text-xs mt-0.5">{b.phone}</p>}
                    </div>
                    <Badge label={b.isActive ? "ACTIVE" : "INACTIVE"} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right col */}
        <div className="space-y-5">
          {/* Photos */}
          {(restaurant.logoUrl || restaurant.coverUrl) && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h3 className="text-sm uppercase tracking-wider text-gray-400 font-semibold mb-3">Photos</h3>
              <div className="space-y-3">
                {restaurant.logoUrl && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1.5">Logo</p>
                    <img src={restaurant.logoUrl} alt="Logo" className="w-16 h-16 rounded-xl object-cover border border-gray-700" />
                  </div>
                )}
                {restaurant.coverUrl && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1.5">Cover</p>
                    <img src={restaurant.coverUrl} alt="Cover" className="w-full h-28 rounded-xl object-cover border border-gray-700" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Start Subscription */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h3 className="text-sm uppercase tracking-wider text-gray-400 font-semibold mb-4">Start Subscription</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Select Plan</label>
                <select value={subPlan} onChange={(e) => setSubPlan(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-orange-500">
                  {PLANS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="bg-gray-800 rounded-xl p-3 text-xs text-gray-400 space-y-1">
                {subPlan === "BASIC"    && <><p>💰 ₹2,000/month</p><p>📊 5% commission</p><p>🏢 1 branch</p></>}
                {subPlan === "STANDARD" && <><p>💰 ₹3,499/month</p><p>📊 4% commission</p><p>🏢 1 branch</p><p>⭐ Priority listing</p></>}
                {subPlan === "PREMIUM"  && <><p>💰 ₹5,999/month</p><p>📊 3% commission</p><p>🏢 Up to 10 branches</p><p>⭐ Priority listing</p><p>🎯 Advanced visibility</p></>}
              </div>
              <button onClick={handleStartSubscription} disabled={starting}
                className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-medium py-2.5 rounded-xl text-sm transition-colors">
                {starting ? <Loader2 size={14} className="animate-spin" /> : <CreditCard size={14} />}
                {starting ? "Starting..." : "Start Subscription"}
              </button>
            </div>
          </div>

          {/* Opening Hours */}
          {restaurant.openingHours?.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h3 className="text-sm uppercase tracking-wider text-gray-400 font-semibold mb-3 flex items-center gap-2">
                <Clock size={14} /> Opening Hours
              </h3>
              <div className="space-y-2">
                {restaurant.openingHours.map((h) => (
                  <div key={h.day} className="flex items-center justify-between text-sm">
                    <span className="text-gray-400 w-10">{h.day}</span>
                    {h.isClosed
                      ? <span className="text-red-400 text-xs">Closed</span>
                      : <span className="text-gray-300">{h.open} – {h.close}</span>
                    }
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Registered */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h3 className="text-sm uppercase tracking-wider text-gray-400 font-semibold mb-3">Timeline</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Registered</span>
                <span className="text-gray-300">{new Date(restaurant.createdAt).toLocaleDateString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Last Updated</span>
                <span className="text-gray-300">{new Date(restaurant.updatedAt).toLocaleDateString("en-IN")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      )} {/* end tab === info */}

      {tab === "payments" && (
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-5">
            {/* Subscription status */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-sm uppercase tracking-wider text-gray-400 font-semibold mb-4 flex items-center gap-2">
                <CreditCard size={14} /> Current Subscription
              </h3>
              {sub ? (
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Plan",       value: <Badge label={sub.plan} /> },
                    { label: "Status",     value: <Badge label={sub.status} /> },
                    { label: "Started",    value: new Date(sub.startAt).toLocaleDateString("en-IN") },
                    { label: "Expires",    value: new Date(sub.endAt).toLocaleDateString("en-IN") },
                    { label: "Payment ID", value: sub.paymentId || "—" },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-xs text-gray-500 mb-1">{label}</p>
                      <p className="text-sm text-gray-200">{value}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No active subscription</p>
              )}
            </div>

            {/* Invoice history */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-sm uppercase tracking-wider text-gray-400 font-semibold mb-4">Invoice History</h3>
              {invoices.length === 0 ? (
                <p className="text-gray-500 text-sm">No invoices yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-800">
                        {["Plan","Amount","Status","Issued","Paid"].map((h) => (
                          <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider pb-3 pr-4">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50">
                      {invoices.map((inv) => (
                        <tr key={inv._id} className="hover:bg-gray-800/30 transition-colors">
                          <td className="py-3 pr-4 text-sm text-gray-300">{inv.plan}</td>
                          <td className="py-3 pr-4 text-sm text-gray-300 font-mono">₹{inv.amount}</td>
                          <td className="py-3 pr-4"><Badge label={inv.status} /></td>
                          <td className="py-3 pr-4 text-sm text-gray-400">{new Date(inv.issuedAt).toLocaleDateString("en-IN")}</td>
                          <td className="py-3 text-sm text-gray-400">{inv.paidAt ? new Date(inv.paidAt).toLocaleDateString("en-IN") : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Right col — start subscription widget (reused) */}
          <div className="space-y-5">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h3 className="text-sm uppercase tracking-wider text-gray-400 font-semibold mb-4">Start / Change Subscription</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Select Plan</label>
                  <select value={subPlan} onChange={(e) => setSubPlan(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-orange-500">
                    {PLANS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="bg-gray-800 rounded-xl p-3 text-xs text-gray-400 space-y-1">
                  {subPlan === "BASIC"    && <><p>💰 ₹2,000/month</p><p>🏢 1 branch</p></>}
                  {subPlan === "STANDARD" && <><p>💰 ₹3,499/month</p><p>🏢 1 branch</p><p>⭐ Priority listing</p></>}
                  {subPlan === "PREMIUM"  && <><p>💰 ₹5,999/month</p><p>🏢 Up to 10 branches</p><p>⭐ Priority listing</p></>}
                </div>
                <button onClick={handleStartSubscription} disabled={starting}
                  className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-medium py-2.5 rounded-xl text-sm transition-colors">
                  {starting ? <Loader2 size={14} className="animate-spin" /> : <CreditCard size={14} />}
                  {starting ? "Starting..." : "Start Subscription"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )} {/* end tab === payments */}
    </AdminLayout>
  );
}