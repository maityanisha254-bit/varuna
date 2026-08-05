import { useEffect, useState, useCallback } from 'react';
import { Search, Users, ShieldOff, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/DashboardLayout';
import Pagination from '../components/Pagination';
import { getCitizens, toggleCitizenStatus } from '../api/endpoints';

export default function Citizens() {
  const [citizens, setCitizens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });

  const fetchCitizens = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      const res = await getCitizens(params);
      setCitizens(res.data.data);
      setPagination(res.data.pagination);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchCitizens(); }, [fetchCitizens]);

  const handleToggle = async (id) => {
    try {
      const res = await toggleCitizenStatus(id);
      setCitizens((prev) => prev.map((c) => (c._id === id ? res.data.data : c)));
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update account');
    }
  };

  return (
    <DashboardLayout title="Citizens">
      <div className="card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-deep-400" />
            <input
              className="input-field pl-9"
              placeholder="Search by name, email, or phone…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <p className="flex items-center gap-1.5 text-xs text-deep-400">
            <Users size={14} /> {pagination.total} registered citizens
          </p>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-deep-100">
                <th className="table-header">Name</th>
                <th className="table-header">Contact</th>
                <th className="table-header">Ward</th>
                <th className="table-header">Joined</th>
                <th className="table-header">Status</th>
                <th className="table-header">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-deep-50">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="h-6 w-full animate-pulse rounded bg-deep-50" /></td></tr>
                ))
              ) : citizens.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-sm text-deep-400">No citizens found</td></tr>
              ) : (
                citizens.map((c) => (
                  <tr key={c._id} className="transition hover:bg-deep-50/60">
                    <td className="table-cell font-medium text-deep-800">{c.name}</td>
                    <td className="table-cell">{c.email}<br /><span className="text-xs text-deep-400">{c.phone}</span></td>
                    <td className="table-cell">{c.address?.ward || '—'}</td>
                    <td className="table-cell whitespace-nowrap text-deep-400">{format(new Date(c.createdAt), 'dd MMM yyyy')}</td>
                    <td className="table-cell">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${c.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                        {c.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="table-cell">
                      <button
                        onClick={() => handleToggle(c._id)}
                        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                          c.isActive ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        {c.isActive ? <><ShieldOff size={13} /> Deactivate</> : <><ShieldCheck size={13} /> Activate</>}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4">
          <Pagination page={page} totalPages={pagination.totalPages} onChange={setPage} />
        </div>
      </div>
    </DashboardLayout>
  );
}
