const PRESETS = {
  PENDING:          "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  APPROVED:         "bg-green-500/10  text-green-400  border-green-500/20",
  SUSPENDED:        "bg-red-500/10    text-red-400    border-red-500/20",
  ACTIVE:           "bg-green-500/10  text-green-400  border-green-500/20",
  EXPIRED:          "bg-gray-500/10   text-gray-400   border-gray-500/20",
  PROCESSING:       "bg-blue-500/10   text-blue-400   border-blue-500/20",
  PROCESSED:        "bg-green-500/10  text-green-400  border-green-500/20",
  FAILED:           "bg-red-500/10    text-red-400    border-red-500/20",
  CREATED:          "bg-gray-500/10   text-gray-300   border-gray-500/20",
  ACCEPTED:         "bg-blue-500/10   text-blue-400   border-blue-500/20",
  PREPARING:        "bg-orange-500/10 text-orange-400 border-orange-500/20",
  READY:            "bg-purple-500/10 text-purple-400 border-purple-500/20",
  COMPLETED:        "bg-green-500/10  text-green-400  border-green-500/20",
  CANCELLED:        "bg-red-500/10    text-red-400    border-red-500/20",
  CUSTOMER:         "bg-blue-500/10   text-blue-400   border-blue-500/20",
  RESTAURANT_OWNER: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  ADMIN:            "bg-purple-500/10 text-purple-400 border-purple-500/20",
  PAID:             "bg-green-500/10  text-green-400  border-green-500/20",
  UNPAID:           "bg-red-500/10    text-red-400    border-red-500/20",
  BASIC:            "bg-gray-500/10   text-gray-300   border-gray-500/20",
  STANDARD:         "bg-blue-500/10   text-blue-400   border-blue-500/20",
  PREMIUM:          "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

export default function Badge({ label }) {
  const cls = PRESETS[label] || "bg-gray-500/10 text-gray-400 border-gray-500/20";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium border ${cls}`}>
      {label}
    </span>
  );
}