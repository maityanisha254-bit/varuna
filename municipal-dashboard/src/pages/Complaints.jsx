import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Inbox, ImageOff } from 'lucide-react';
import { format } from 'date-fns';
import DashboardLayout from '../components/DashboardLayout';
import StatusBadge from '../components/StatusBadge';
import SeverityBadge from '../components/SeverityBadge';
import Pagination from '../components/Pagination';
import { getComplaints } from '../api/endpoints';

const STATUS_FILTERS = ['all', 'pending', 'acknowledged', 'assigned', 'in-progress', 'resolved', 'rejected'];
const CATEGORY_FILTERS = [
  'all', 'Waterlogging', 'Drain Blockage', 'Sewage Overflow',
  'Pothole with Water Accumulation', 'Broken Drain Cover', 'Illegal Dumping in Drain', 'Other',
];
const SEVERITY_FILTERS = ['all', 'low', 'medium', 'high', 'critical'];

export default function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('all');
  const [severity, setSeverity] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10, sort: '-createdAt' };
      if (search) params.search = search;
      if (status !== 'all') params.status = status;
      if (category !== 'all') params.category = category;
      if (severity !== 'all') params.severity = severity;
      const res = await getComplaints(params);
      setComplaints(res.data.data);
      setPagination(res.data.pagination);
    } finally {
      setLoading(false);
    }
  }, [page, search, status, category, severity]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  return (
    <DashboardLayout title="Complaints">
      <div className="card">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-deep-400" />
            <input
              className="input-field pl-9"
              placeholder="Search by code, description, or location…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className="grid grid-cols-3 gap-2 lg:flex">
            <FilterSelect icon={Filter} value={status} onChange={(v) => { setStatus(v); setPage(1); }} options={STATUS_FILTERS} label="status" />
            <FilterSelect value={category} onChange={(v) => { setCategory(v); setPage(1); }} options={CATEGORY_FILTERS} label="category" />
            <FilterSelect value={severity} onChange={(v) => { setSeverity(v); setPage(1); }} options={SEVERITY_FILTERS} label="severity" />
          </div>
        </div>

        <p className="mt-3 text-xs text-deep-400">{pagination.total} complaint{pagination.total !== 1 ? 's' : ''} found</p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[820px]">
            <thead>
              <tr className="border-b border-deep-100">
                <th className="table-header">Photo</th>
                <th className="table-header">Code</th>
                <th className="table-header">Citizen</th>
                <th className="table-header">Category</th>
                <th className="table-header">Severity</th>
                <th className="table-header">Status</th>
                <th className="table-header">Assigned</th>
                <th className="table-header">Filed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-deep-50">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}><td colSpan={8} className="px-4 py-3"><div className="h-6 w-full animate-pulse rounded bg-deep-50" /></td></tr>
                ))
              ) : complaints.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <Inbox size={26} className="mx-auto text-deep-300" />
                    <p className="mt-2 text-sm text-deep-500">No complaints match your filters</p>
                  </td>
                </tr>
              ) : (
                complaints.map((c) => (
                  <tr key={c._id} className="transition hover:bg-deep-50/60">
                    <td className="table-cell">
                      <div className="h-10 w-10 overflow-hidden rounded-lg bg-deep-50">
                        {c.photoUrl ? (
                          <img src={c.photoUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-deep-300"><ImageOff size={14} /></div>
                        )}
                      </div>
                    </td>
                    <td className="table-cell">
                      <Link to={`/complaints/${c._id}`} className="font-mono text-xs font-semibold text-tide-600 hover:underline">
                        {c.complaintCode}
                      </Link>
                    </td>
                    <td className="table-cell">{c.citizen?.name || '—'}</td>
                    <td className="table-cell whitespace-nowrap">{c.category}</td>
                    <td className="table-cell"><SeverityBadge severity={c.severity} /></td>
                    <td className="table-cell"><StatusBadge status={c.status} /></td>
                    <td className="table-cell">{c.assignedWorker?.name || <span className="text-deep-300">Unassigned</span>}</td>
                    <td className="table-cell whitespace-nowrap text-deep-400">{format(new Date(c.createdAt), 'dd MMM, h:mm a')}</td>
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

function FilterSelect({ icon: Icon, value, onChange, options, label }) {
  return (
    <div className="relative">
      {Icon && <Icon size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-deep-400" />}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`input-field appearance-none pr-7 text-xs ${Icon ? 'pl-7' : ''}`}
        aria-label={label}
      >
        {options.map((o) => (
          <option key={o} value={o}>{o === 'all' ? `All ${label}` : o}</option>
        ))}
      </select>
    </div>
  );
}
