import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  return (
    <div className="flex items-center justify-center gap-1.5 pt-2">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-deep-500 hover:bg-deep-50 disabled:opacity-30"
      >
        <ChevronLeft size={16} />
      </button>
      {pages.map((p, idx) => (
        <span key={p} className="flex items-center">
          {idx > 0 && p - pages[idx - 1] > 1 && <span className="px-1 text-deep-300">…</span>}
          <button
            onClick={() => onChange(p)}
            className={`h-8 w-8 rounded-lg text-sm font-medium transition ${
              page === p ? 'bg-tide-600 text-white' : 'text-deep-600 hover:bg-deep-50'
            }`}
          >
            {p}
          </button>
        </span>
      ))}
      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-deep-500 hover:bg-deep-50 disabled:opacity-30"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
