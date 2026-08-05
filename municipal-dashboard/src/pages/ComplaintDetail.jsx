import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, ImageOff, UserCog, CheckCircle2, Circle, Phone } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/DashboardLayout';
import StatusBadge from '../components/StatusBadge';
import SeverityBadge from '../components/SeverityBadge';
import {
  getComplaintById, updateComplaintStatus, assignComplaint, getWorkers,
} from '../api/endpoints';

const STATUS_ORDER = ['pending', 'acknowledged', 'assigned', 'in-progress', 'resolved'];
const NEXT_STATUS_OPTIONS = ['pending', 'acknowledged', 'assigned', 'in-progress', 'resolved', 'rejected'];

export default function ComplaintDetail() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [workers, setWorkers] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [note, setNote] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchComplaint = useCallback(() => {
    return getComplaintById(id).then((res) => {
      setComplaint(res.data.data);
      setSelectedStatus(res.data.data.status);
      setSelectedWorker(res.data.data.assignedWorker?._id || '');
    });
  }, [id]);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchComplaint(), getWorkers({ limit: 100, status: 'available' })])
      .then(([, workersRes]) => setWorkers(workersRes.data.data))
      .finally(() => setLoading(false));
  }, [fetchComplaint]);

  const handleAssign = async () => {
    if (!selectedWorker) return toast.error('Select a worker to assign');
    setAssigning(true);
    try {
      await assignComplaint(id, selectedWorker);
      await fetchComplaint();
      toast.success('Worker assigned successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign worker');
    } finally {
      setAssigning(false);
    }
  };

  const handleStatusUpdate = async () => {
    setUpdatingStatus(true);
    try {
      await updateComplaintStatus(id, { status: selectedStatus, note });
      await fetchComplaint();
      setNote('');
      toast.success('Status updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading || !complaint) {
    return (
      <DashboardLayout title="Complaint details">
        <div className="flex h-96 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-tide-500 border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  const currentStepIndex = complaint.status === 'rejected' ? -1 : STATUS_ORDER.indexOf(complaint.status);

  return (
    <DashboardLayout title="Complaint details">
      <Link to="/complaints" className="inline-flex items-center gap-1.5 text-sm font-medium text-deep-500 hover:text-tide-600">
        <ArrowLeft size={15} /> Back to complaints
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-semibold text-deep-500">{complaint.complaintCode}</span>
            <StatusBadge status={complaint.status} />
          </div>
          <h1 className="mt-1 font-display text-2xl font-bold text-deep-900">{complaint.category}</h1>
        </div>
        <SeverityBadge severity={complaint.severity} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="card overflow-hidden !p-0">
            {complaint.photoUrl ? (
              <img src={complaint.photoUrl} alt="Reported issue" className="h-72 w-full object-cover" />
            ) : (
              <div className="flex h-48 items-center justify-center bg-deep-50 text-deep-300">
                <ImageOff size={28} />
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="font-display text-sm font-semibold text-deep-900">Description</h2>
            <p className="mt-2 text-sm text-deep-600">{complaint.description}</p>
            <div className="mt-4 flex flex-wrap gap-4 text-xs text-deep-400">
              <span className="flex items-center gap-1.5"><MapPin size={13} /> {complaint.location?.address || complaint.location?.ward || 'Location on file'}</span>
              <span className="flex items-center gap-1.5"><Calendar size={13} /> Filed {format(new Date(complaint.createdAt), 'dd MMM yyyy, h:mm a')}</span>
            </div>
            <div className="mt-3 text-xs text-deep-400">
              Coordinates: {complaint.location.coordinates[1].toFixed(5)}, {complaint.location.coordinates[0].toFixed(5)}
            </div>
          </div>

          <div className="card">
            <h2 className="font-display text-sm font-semibold text-deep-900">Citizen</h2>
            <div className="mt-3 flex items-center gap-3 text-sm">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-deep-900 text-xs font-bold text-tide-300">
                {complaint.citizen?.name?.[0]?.toUpperCase()}
              </span>
              <div>
                <p className="font-medium text-deep-800">{complaint.citizen?.name}</p>
                <p className="text-deep-500">{complaint.citizen?.email} · {complaint.citizen?.phone}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="font-display text-sm font-semibold text-deep-900">Progress timeline</h2>
            <ol className="mt-4 space-y-5">
              {complaint.timeline?.slice().reverse().map((event, idx) => (
                <li key={idx} className="relative flex gap-3 pl-1">
                  <div className="mt-0.5 flex flex-col items-center">
                    {idx === 0 ? <CheckCircle2 size={16} className="text-tide-600" /> : <Circle size={12} className="text-deep-300" />}
                    {idx !== complaint.timeline.length - 1 && <span className="mt-1 h-full w-px flex-1 bg-deep-100" />}
                  </div>
                  <div className="pb-1">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={event.status} />
                      <span className="text-xs text-deep-400">{format(new Date(event.timestamp), 'dd MMM, h:mm a')}</span>
                      {event.updatedBy?.name && <span className="text-xs text-deep-400">by {event.updatedBy.name}</span>}
                    </div>
                    {event.note && <p className="mt-1 text-sm text-deep-600">{event.note}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h2 className="font-display text-sm font-semibold text-deep-900">Status</h2>
            <ul className="mt-4 space-y-3">
              {STATUS_ORDER.map((s, idx) => (
                <li key={s} className="flex items-center gap-3">
                  {idx <= currentStepIndex ? <CheckCircle2 size={17} className="text-tide-600" /> : <Circle size={17} className="text-deep-200" />}
                  <span className={`text-sm capitalize ${idx <= currentStepIndex ? 'font-medium text-deep-800' : 'text-deep-400'}`}>
                    {s.replace('-', ' ')}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card">
            <h2 className="flex items-center gap-2 font-display text-sm font-semibold text-deep-900">
              <UserCog size={15} /> Assign field worker
            </h2>
            {complaint.assignedWorker && (
              <div className="mt-3 rounded-lg bg-deep-50 p-3 text-sm">
                <p className="font-medium text-deep-800">{complaint.assignedWorker.name}</p>
                <p className="text-deep-500">{complaint.assignedWorker.designation}</p>
                <p className="mt-1 flex items-center gap-1 text-deep-500"><Phone size={12} /> {complaint.assignedWorker.phone}</p>
              </div>
            )}
            <div className="mt-3 space-y-2">
              <select value={selectedWorker} onChange={(e) => setSelectedWorker(e.target.value)} className="input-field">
                <option value="">Select a worker…</option>
                {workers.map((w) => (
                  <option key={w._id} value={w._id}>{w.name} — {w.designation} ({w.ward})</option>
                ))}
              </select>
              <button onClick={handleAssign} disabled={assigning} className="btn-primary w-full">
                {assigning ? 'Assigning…' : complaint.assignedWorker ? 'Reassign worker' : 'Assign worker'}
              </button>
            </div>
          </div>

          <div className="card">
            <h2 className="font-display text-sm font-semibold text-deep-900">Update status</h2>
            <div className="mt-3 space-y-2">
              <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="input-field">
                {NEXT_STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s} className="capitalize">{s.replace('-', ' ')}</option>
                ))}
              </select>
              <textarea
                rows={3}
                placeholder="Add a note (visible to citizen)…"
                className="input-field resize-none"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <button onClick={handleStatusUpdate} disabled={updatingStatus} className="btn-secondary w-full">
                {updatingStatus ? 'Updating…' : 'Update status'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
