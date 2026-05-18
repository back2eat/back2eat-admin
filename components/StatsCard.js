export default function StatsCard({ title, value, subtitle, icon: Icon, color = "orange" }) {
  const styles = {
    orange: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20" },
    green:  { bg: "bg-green-500/10",  text: "text-green-400",  border: "border-green-500/20"  },
    blue:   { bg: "bg-blue-500/10",   text: "text-blue-400",   border: "border-blue-500/20"   },
    purple: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20" },
    red:    { bg: "bg-red-500/10",    text: "text-red-400",    border: "border-red-500/20"    },
    yellow: { bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/20" },
  };
  const s = styles[color] || styles.orange;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-all">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.bg} border ${s.border} mb-4`}>
        <Icon size={19} className={s.text} />
      </div>
      <p className="text-2xl font-bold text-white mb-1">{value ?? "—"}</p>
      <p className="text-sm font-medium text-gray-300">{title}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
  );
}