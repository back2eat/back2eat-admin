import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const start = Math.max(1, page - 2);
  const end   = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex items-center justify-center gap-1 mt-5">
      <button
        onClick={() => onPageChange(page - 1)} disabled={page <= 1}
        className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
        <ChevronLeft size={16} />
      </button>

      {start > 1 && (
        <>
          <button onClick={() => onPageChange(1)}
            className="w-8 h-8 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-all">1</button>
          {start > 2 && <span className="text-gray-600 px-1">...</span>}
        </>
      )}

      {pages.map((p) => (
        <button key={p} onClick={() => onPageChange(p)}
          className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
            p === page ? "bg-orange-500 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"
          }`}>
          {p}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="text-gray-600 px-1">...</span>}
          <button onClick={() => onPageChange(totalPages)}
            className="w-8 h-8 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-all">{totalPages}</button>
        </>
      )}

      <button
        onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}
        className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
        <ChevronRight size={16} />
      </button>

      <span className="text-gray-500 text-xs ml-2">Page {page} of {totalPages}</span>
    </div>
  );
}