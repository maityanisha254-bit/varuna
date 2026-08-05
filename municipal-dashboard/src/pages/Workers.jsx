import { useEffect, useState, useCallback } from 'react';
import { Search, Plus, HardHat, Trash2, Star, X } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/DashboardLayout';
import Pagination from '../components/Pagination';
import { getWorkers, createWorker, updateWorker, deleteWorker } from '../api/endpoints';

const DESIGNATIONS = ['Drainage Technician', 'Sanitation Worker', 'Field Supervisor', 'Pump Operator', 'Engineer'];
const STATUS_STYLES = {
  available: 'bg-emerald-50 text-emerald-700',
  'on-duty': 'bg-tide-50 text-tide-700',
  'off-duty': 'bg-deep-50 text-deep-500',
};

const emptyForm = { name: '', phone: '', email: '', designation: 'Drainage Technician', ward: '', zone: 'North' };

export default function Workers() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchWorkers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      const res = await getWorkers(params);
      setWorkers(res.data.data);
      setPagination(res.data.pagination);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchWorkers(); }, [fetchWorkers]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createWorker(form);
      toast.success('Worker added');
      setModalOpen(false);
      setForm(emptyForm);
      fetchWorkers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add worker');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const res = await updateWorker(id, { status });
      setWorkers((prev) => prev.map((w) => (w._id === id ? res.data.data : w)));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteWorker(id);
      toast.success('Worker removed');
      fetchWorkers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove worker');
    }
  };

  return (
    <DashboardLayout title="Field workers">
      <div className="card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-deep-400" />
            <input
              className="input-field pl-9"
              placeholder="Search by name, phone, or designation…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <button onClick={() => setModalOpen(true)} className="btn-primary">
            <Plus size={16} /> Add worker
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="border-b border-deep-100">
                <th className="table-header">Name</th>
                <th className="table-header">Designation</th>
                <th className="table-header">Ward / Zone</th>
                <th className="table-header">Active</th>
                <th className="table-header">Resolved</th>
                <th className="table-header">Rating</th>
                <th className="table-header">Status</th>
                <th className="table-header" />
              </tr>
            </thead>
            <tbody className="divide-y divide-deep-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={8} className="px-4 py-3"><div className="h-6 w-full animate-pulse rounded bg-deep-50" /></td></tr>
                ))
              ) : workers.length === 0 ? (
                <tr><td colSpan={8} className="py-12 text-center text-sm text-deep-400">
                  <HardHat size={22} className="mx-auto mb-2 text-deep-300" /> No workers found
                </td></tr>
              ) : (
                workers.map((w) => (
                  <tr key={w._id} className="transition hover:bg-deep-50/60">
                    <td className="table-cell font-medium text-deep-800">{w.name}<br /><span className="text-xs font-normal text-deep-400">{w.phone}</span></td>
                    <td className="table-cell">{w.designation}</td>
                    <td className="table-cell">{w.ward}<br /><span className="text-xs text-deep-400">{w.zone} zone</span></td>
                    <td className="table-cell">{w.activeComplaints}</td>
                    <td className="table-cell">{w.resolvedCount}</td>
                    <td className="table-cell"><span className="flex items-center gap-1"><Star size={13} className="fill-amber-400 text-amber-400" /> {w.rating}</span></td>
                    <td className="table-cell">
                      <select
                        value={w.status}
                        onChange={(e) => handleStatusChange(w._id, e.target.value)}
                        className={`rounded-full border-0 px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[w.status]}`}
                      >
                        <option value="available">Available</option>
                        <option value="on-duty">On duty</option>
                        <option value="off-duty">Off duty</option>
                      </select>
                    </td>
                    <td className="table-cell">
                      <button onClick={() => handleDelete(w._id)} className="rounded-lg p-1.5 text-deep-400 hover:bg-rose-50 hover:text-rose-600" aria-label="Remove worker">
                        <Trash2 size={15} />
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

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-deep-900">Add field worker</h2>
              <button onClick={() => setModalOpen(false)} className="rounded-lg p-1.5 text-deep-400 hover:bg-deep-50">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="mt-4 space-y-3">
              <div>
                <label className="label-field">Full name</label>
                <input name="name" required className="input-field" value={form.name} onChange={handleChange} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-field">Phone</label>
                  <input name="phone" required pattern="[0-9]{10}" className="input-field" value={form.phone} onChange={handleChange} />
                </div>
                <div>
                  <label className="label-field">Email (optional)</label>
                  <input name="email" type="email" className="input-field" value={form.email} onChange={handleChange} />
                </div>
              </div>
              <div>
                <label className="label-field">Designation</label>
                <select name="designation" className="input-field" value={form.designation} onChange={handleChange}>
                  {DESIGNATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-field">Ward</label>
                  <input name="ward" required className="input-field" placeholder="Ward 82" value={form.ward} onChange={handleChange} />
                </div>
                <div>
                  <label className="label-field">Zone</label>
                  <select name="zone" className="input-field" value={form.zone} onChange={handleChange}>
                    {['North', 'South', 'East', 'West', 'Central'].map((z) => <option key={z} value={z}>{z}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" disabled={saving} className="btn-primary w-full">
                {saving ? 'Adding…' : 'Add worker'}
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
