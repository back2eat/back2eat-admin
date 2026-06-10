"use client";
import { useEffect, useState } from "react";
import { getCoupons, createCoupon, toggleCoupon, deleteCoupon } from "@/lib/api";
import AdminLayout from "@/components/AdminLayout";
import Header from "@/components/Header";
import { Plus, X, Trash2, ToggleLeft, ToggleRight, Tag } from "lucide-react";
import toast from "react-hot-toast";

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
};

const EMPTY = () => ({
  code:"", discountType:"PERCENT", discountValue:"",
  maxDiscount:"", minOrderValue:"", usageLimit:"",
  perUserLimit:"1", validFrom:todayStr(), validUntil:"", scope:"PLATFORM",
});

const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}) : "—";
const isExpired  = (c) => c.endDate   && new Date(c.endDate)   < new Date();
const isUpcoming = (c) => c.startDate && new Date(c.startDate) > new Date();

export default function CouponsPage() {
  const [coupons,  setCoupons]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState(EMPTY());
  const [saving,   setSaving]   = useState(false);
  const [delTarget,setDelTarget]= useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try   { const r = await getCoupons(); setCoupons(r.data.coupons||[]); }
    catch { toast.error("Failed to load coupons"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const f = (k,v) => setForm(p=>({...p,[k]:v}));

  const preview = (() => {
    if (!form.code || !form.discountValue) return null;
    const disc = form.discountType==="PERCENT"
      ? `${form.discountValue}% off${form.maxDiscount?` (max ₹${form.maxDiscount})`:""}`
      : `₹${form.discountValue} off`;
    const min = form.minOrderValue&&form.minOrderValue>0 ? ` on orders above ₹${form.minOrderValue}` : "";
    return { code: form.code.toUpperCase(), disc, min };
  })();

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.validUntil) { toast.error("Expiry date is required"); return; }
    setSaving(true);
    try {
      const p = {
        code:          form.code.toUpperCase().trim(),
        discountType:  form.discountType,
        discountValue: Number(form.discountValue),
        startDate:     form.validFrom||todayStr(),
        endDate:       form.validUntil,
        validFrom:     form.validFrom||todayStr(),
        validUntil:    form.validUntil,
        fundedBy:      form.scope, scope: form.scope,
        perUserLimit:  Number(form.perUserLimit)||1,
      };
      if (form.maxDiscount)   p.maxDiscount    = Number(form.maxDiscount);
      if (form.minOrderValue) p.minOrderAmount = Number(form.minOrderValue);
      if (form.usageLimit)    p.usageLimit     = Number(form.usageLimit);
      await createCoupon(p);
      toast.success("Coupon created");
      setShowForm(false); setForm(EMPTY()); fetch();
    } catch(err) { toast.error(err.response?.data?.message||"Failed to create"); }
    finally { setSaving(false); }
  };

  const handleToggle = async (id) => {
    try {
      await toggleCoupon(id);
      setCoupons(prev => prev.map(c => c._id===id ? {...c,isActive:!c.isActive} : c));
    } catch { toast.error("Failed"); }
  };

  const handleDelete = async () => {
    if (!delTarget) return;
    setDeleting(true);
    try {
      await deleteCoupon(delTarget._id);
      setCoupons(prev => prev.filter(c => c._id!==delTarget._id));
      toast.success(`${delTarget.code} deleted`);
      setDelTarget(null);
    } catch { toast.error("Failed to delete"); }
    finally { setDeleting(false); }
  };

  const active  = coupons.filter(c => c.isActive && !isExpired(c)).length;
  const expired = coupons.filter(isExpired).length;
  const uses    = coupons.reduce((s,c)=>s+(c.usageCount||0),0);

  return (
    <AdminLayout>
      <Header
        title="Coupons"
        subtitle={`${coupons.length} coupon${coupons.length!==1?"s":""}`}
        actions={
          <button onClick={()=>{setForm(EMPTY());setShowForm(true);}}
            className="flex items-center gap-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
            <Plus size={14}/> New coupon
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          {label:"Total",    val:coupons.length},
          {label:"Active",   val:active,   color:"text-green-400"},
          {label:"Expired",  val:expired,  color:"text-red-400"},
          {label:"Total uses",val:uses},
        ].map(({label,val,color})=>(
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3.5">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className={`text-2xl font-semibold ${color||"text-white"}`}>{val}</p>
          </div>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_,i)=>(
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 animate-pulse space-y-3">
              <div className="h-4 bg-gray-800 rounded w-1/3"/>
              <div className="h-7 bg-gray-800 rounded w-1/2"/>
              <div className="h-3 bg-gray-800 rounded"/>
              <div className="h-3 bg-gray-800 rounded w-2/3"/>
            </div>
          ))}
        </div>
      ) : coupons.length===0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl py-20 flex flex-col items-center gap-3 text-center">
          <div className="bg-gray-800 p-4 rounded-2xl"><Tag size={26} className="text-gray-500"/></div>
          <p className="text-white font-medium">No coupons yet</p>
          <p className="text-gray-500 text-sm">Create your first coupon to offer discounts</p>
          <button onClick={()=>{setForm(EMPTY());setShowForm(true);}}
            className="mt-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 px-5 py-2 rounded-xl text-sm font-medium transition-colors">
            Create coupon
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {coupons.map(c=>{
            const exp = isExpired(c);
            const up  = isUpcoming(c);
            const pct = c.usageLimit ? Math.min(Math.round(((c.usageCount||0)/c.usageLimit)*100),100) : 0;
            const barColor = pct>=90?"bg-red-500":pct>=60?"bg-yellow-500":"bg-orange-500";
            return (
              <div key={c._id}
                className={`bg-gray-900 border rounded-2xl p-5 flex flex-col gap-4 transition-all
                  ${!c.isActive||exp?"border-gray-800 opacity-60":"border-gray-700 hover:border-gray-600"}`}>

                {/* Top */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-mono text-orange-400 font-bold text-base tracking-widest">{c.code}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full
                        ${exp?"bg-gray-700/60 text-gray-400"
                          :up?"bg-blue-500/15 text-blue-400"
                          :c.isActive?"bg-green-500/15 text-green-400"
                          :"bg-gray-700/60 text-gray-400"}`}>
                        {exp?"Expired":up?"Upcoming":c.isActive?"Active":"Inactive"}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full
                        ${(c.fundedBy||c.scope||"PLATFORM")==="PLATFORM"
                          ?"bg-blue-500/10 text-blue-400"
                          :"bg-purple-500/10 text-purple-400"}`}>
                        {c.fundedBy||c.scope||"PLATFORM"}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-white leading-none">
                      {(c.discountType==="FLAT"||c.discountType==="FIXED") ? `₹${c.discountValue}` : `${c.discountValue}%`}
                    </p>
                    {c.maxDiscount && <p className="text-xs text-gray-500 mt-0.5">max ₹{c.maxDiscount}</p>}
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
                  {[
                    ["Min order",  c.minOrderAmount?`₹${c.minOrderAmount}`:"No minimum"],
                    ["Per user",   `${c.perUserLimit}× use${c.perUserLimit!==1?"s":""}`],
                    ["Valid from", fmtDate(c.startDate||c.validFrom)],
                    ["Expires",    fmtDate(c.endDate||c.validUntil)],
                  ].map(([label,val])=>(
                    <div key={label}>
                      <p className="text-gray-600 mb-0.5">{label}</p>
                      <p className={`font-semibold ${label==="Expires"&&exp?"text-red-400":"text-gray-300"}`}>{val}</p>
                    </div>
                  ))}
                </div>

                {/* Usage bar */}
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                    <span>Usage</span>
                    <span>{c.usageCount||0} / {c.usageLimit||"∞"}</span>
                  </div>
                  <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                    {c.usageLimit && <div className={`h-full rounded-full transition-all ${barColor}`} style={{width:`${pct}%`}}/>}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-800">
                  <button onClick={()=>handleToggle(c._id)}
                    className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors
                      ${c.isActive
                        ?"border-gray-700 text-gray-400 hover:border-gray-600 hover:text-white"
                        :"border-green-500/30 text-green-400 hover:bg-green-500/10"}`}>
                    {c.isActive ? <ToggleRight size={15}/> : <ToggleLeft size={15}/>}
                    {c.isActive?"Deactivate":"Activate"}
                  </button>
                  <div className="flex-1"/>
                  <button onClick={()=>setDelTarget(c)}
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-transparent text-gray-600 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-colors">
                    <Trash2 size={13}/> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-start justify-center z-50 p-6 overflow-y-auto">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-xl shadow-2xl my-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <div>
                <h3 className="text-white font-semibold text-sm">New coupon</h3>
                <p className="text-gray-500 text-xs mt-0.5">Fill in the details below</p>
              </div>
              <button onClick={()=>setShowForm(false)} className="text-gray-500 hover:text-white p-1 transition-colors">
                <X size={16}/>
              </button>
            </div>
            <form onSubmit={handleCreate} className="px-6 py-5 space-y-4">
              {/* Code */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Coupon code <span className="text-orange-400">*</span>
                </label>
                <input value={form.code} onChange={e=>f("code",e.target.value.toUpperCase())} required
                  placeholder="e.g. WELCOME50"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-orange-400 font-mono font-bold text-sm tracking-widest placeholder-gray-600 focus:outline-none focus:border-orange-500"/>
              </div>
              {/* Discount row */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Discount <span className="text-orange-400">*</span>
                </label>
                <div className="flex gap-2">
                  <select value={form.discountType} onChange={e=>f("discountType",e.target.value)}
                    className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500 shrink-0">
                    <option value="PERCENT">Percentage (%)</option>
                    <option value="FLAT">Flat (₹)</option>
                  </select>
                  <input type="number" value={form.discountValue} onChange={e=>f("discountValue",e.target.value)}
                    placeholder={form.discountType==="PERCENT"?"50":"100"} required min="1"
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500"/>
                  {form.discountType==="PERCENT" && (
                    <input type="number" value={form.maxDiscount} onChange={e=>f("maxDiscount",e.target.value)}
                      placeholder="Max ₹"
                      className="w-24 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500"/>
                  )}
                </div>
              </div>
              {/* Grid: min order + funded by */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Min order (₹)</label>
                  <input type="number" value={form.minOrderValue} onChange={e=>f("minOrderValue",e.target.value)}
                    placeholder="0 = no minimum"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500"/>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Funded by</label>
                  <select value={form.scope} onChange={e=>f("scope",e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500">
                    <option value="PLATFORM">Platform (Back2Eat)</option>
                    <option value="RESTAURANT">Restaurant</option>
                  </select>
                </div>
              </div>
              {/* Grid: usage limits */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Total uses</label>
                  <input type="number" value={form.usageLimit} onChange={e=>f("usageLimit",e.target.value)}
                    placeholder="Unlimited"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500"/>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Per user</label>
                  <input type="number" value={form.perUserLimit} onChange={e=>f("perUserLimit",e.target.value)}
                    placeholder="1" min="1"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500"/>
                </div>
              </div>
              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Valid from</label>
                  <input type="date" value={form.validFrom} onChange={e=>f("validFrom",e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500"/>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    Expires on <span className="text-orange-400">*</span>
                  </label>
                  <input type="date" value={form.validUntil} onChange={e=>f("validUntil",e.target.value)} required
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500"/>
                </div>
              </div>
              {/* Preview */}
              {preview && (
                <div className="bg-gray-800/60 border border-gray-700 rounded-xl px-4 py-2.5">
                  <span className="font-mono text-orange-400 font-bold text-sm">{preview.code}</span>
                  <span className="text-gray-300 text-sm"> — {preview.disc}{preview.min}</span>
                </div>
              )}
              {/* Buttons */}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={()=>setShowForm(false)}
                  className="flex-1 py-2.5 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 rounded-xl text-sm transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-[2] bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
                  {saving?"Creating...":"Create coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {delTarget && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="bg-red-500/10 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
              <Trash2 size={18} className="text-red-400"/>
            </div>
            <h3 className="text-white font-semibold text-sm mb-1">Delete coupon?</h3>
            <p className="text-gray-400 text-sm mb-5 leading-relaxed">
              <span className="font-mono text-orange-400">{delTarget.code}</span> will be permanently removed.
              Customers who already used it won&apos;t be affected.
            </p>
            <div className="flex gap-3">
              <button onClick={()=>setDelTarget(null)}
                className="flex-1 py-2.5 border border-gray-700 text-gray-400 hover:text-white rounded-xl text-sm transition-colors">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-[2] bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-semibold py-2.5 rounded-xl text-sm disabled:opacity-50 transition-colors">
                {deleting?"Deleting...":"Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}