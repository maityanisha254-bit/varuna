import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Inbox, Plus } from 'lucide-react';
import { getMyComplaints } from '../api/endpoints';
import ComplaintCard from '../components/ComplaintCard';

const STATUS_FILTERS = ['all', 'pending', 'acknowledged', 'assigned', 'in-progress', 'resolved', 'rejected'];

export default function ComplaintHistory() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1 });

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 8, sort: '-createdAt' };
      if (search) params.search = search;
      if (status !== 'all') params.status = status;
      const res = await getMyComplaints(params);
      setComplaints(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-deep-900 sm:text-3xl">My complaints</h1>
          <p className="mt-1 text-deep-500">Track the status of every issue you've reported.</p>
        </div>
        <Link to="/report" className="btn-primary">
          <Plus size={16} /> New report
        </Link>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-deep-400" />
          <input
            className="input-field pl-9"
            placeholder="Search by complaint code, description, or location…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="relative">
          <Filter size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-deep-400" />
          <select
            className="input-field appearance-none pl-9 pr-8"
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          >
            {STATUS_FILTERS.map((s) => (
              <option key={s} value={s}>{s === 'all' ? 'All statuses' : s.replace('-', ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card h-28 animate-pulse bg-deep-50" />
          ))
        ) : complaints.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-deep-200 py-16 text-center">
            <Inbox size={32} className="text-deep-300" />
            <p className="mt-3 font-medium text-deep-600">No complaints found</p>
            <p className="mt-1 text-sm text-deep-400">Try adjusting your filters, or file a new report.</p>
          </div>
        ) : (
          complaints.map((c) => <ComplaintCard key={c._id} complaint={c} />)
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          {Array.from({ length: pagination.totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`h-9 w-9 rounded-lg text-sm font-medium transition ${
                page === i + 1 ? 'bg-tide-600 text-white' : 'bg-white text-deep-600 hover:bg-deep-50'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
