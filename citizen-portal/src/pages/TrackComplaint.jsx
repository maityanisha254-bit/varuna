import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, ImageOff, CheckCircle2, Circle } from 'lucide-react';
import { format } from 'date-fns';
import { getComplaintById } from '../api/endpoints';
import StatusBadge from '../components/StatusBadge';
import SeverityBadge from '../components/SeverityBadge';

const STATUS_ORDER = ['pending', 'acknowledged', 'assigned', 'in-progress', 'resolved'];

export default function TrackComplaint() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getComplaintById(id)
      .then((res) => setComplaint(res.data.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load complaint'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-tide-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-deep-600">{error || 'Complaint not found'}</p>
        <Link to="/complaints" className="btn-secondary mt-4 inline-flex">
          <ArrowLeft size={15} /> Back to my complaints
        </Link>
      </div>
    );
  }

  const currentStepIndex =
    complaint.status === 'rejected' ? -1 : STATUS_ORDER.indexOf(complaint.status);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Link to="/complaints" className="inline-flex items-center gap-1.5 text-sm font-medium text-deep-500 hover:text-tide-600">
        <ArrowLeft size={15} /> Back to my complaints
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
        <div className="lg:col-span-2 space-y-6">
          {/* Photo */}
          <div className="card overflow-hidden !p-0">
            {complaint.photoUrl ? (
              <img src={complaint.photoUrl} alt="Reported issue" className="h-64 w-full object-cover sm:h-80" />
            ) : (
              <div className="flex h-48 items-center justify-center bg-deep-50 text-deep-300">
                <ImageOff size={28} />
              </div>
            )}
          </div>

          {/* Description */}
          <div className="card">
            <h2 className="font-display text-sm font-semibold text-deep-900">Description</h2>
            <p className="mt-2 text-sm text-deep-600">{complaint.description}</p>
            <div className="mt-4 flex flex-wrap gap-4 text-xs text-deep-400">
              <span className="flex items-center gap-1.5">
                <MapPin size={13} /> {complaint.location?.address || complaint.location?.ward || 'Location on file'}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={13} /> Filed {format(new Date(complaint.createdAt), 'dd MMM yyyy, h:mm a')}
              </span>
            </div>
          </div>

          {/* Timeline */}
          <div className="card">
            <h2 className="font-display text-sm font-semibold text-deep-900">Progress timeline</h2>
            <ol className="mt-4 space-y-5">
              {complaint.timeline?.slice().reverse().map((event, idx) => (
                <li key={idx} className="relative flex gap-3 pl-1">
                  <div className="mt-0.5 flex flex-col items-center">
                    {idx === 0 ? (
                      <CheckCircle2 size={16} className="text-tide-600" />
                    ) : (
                      <Circle size={12} className="text-deep-300" />
                    )}
                    {idx !== complaint.timeline.length - 1 && (
                      <span className="mt-1 h-full w-px flex-1 bg-deep-100" />
                    )}
                  </div>
                  <div className="pb-1">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={event.status} />
                      <span className="text-xs text-deep-400">
                        {format(new Date(event.timestamp), 'dd MMM, h:mm a')}
                      </span>
                    </div>
                    {event.note && <p className="mt-1 text-sm text-deep-600">{event.note}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="space-y-6">
          {/* Status stepper */}
          <div className="card">
            <h2 className="font-display text-sm font-semibold text-deep-900">Status</h2>
            <ul className="mt-4 space-y-3">
              {STATUS_ORDER.map((s, idx) => (
                <li key={s} className="flex items-center gap-3">
                  {idx <= currentStepIndex ? (
                    <CheckCircle2 size={17} className="text-tide-600" />
                  ) : (
                    <Circle size={17} className="text-deep-200" />
                  )}
                  <span
                    className={`text-sm capitalize ${
                      idx <= currentStepIndex ? 'font-medium text-deep-800' : 'text-deep-400'
                    }`}
                  >
                    {s.replace('-', ' ')}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Assigned worker */}
          {complaint.assignedWorker && (
            <div className="card">
              <h2 className="font-display text-sm font-semibold text-deep-900">Field team</h2>
              <div className="mt-3 text-sm">
                <p className="font-medium text-deep-800">{complaint.assignedWorker.name}</p>
                <p className="text-deep-500">{complaint.assignedWorker.designation}</p>
                <p className="mt-1 text-deep-500">{complaint.assignedWorker.phone}</p>
              </div>
            </div>
          )}

          {complaint.status === 'resolved' && complaint.resolutionNote && (
            <div className="card border-emerald-200 bg-emerald-50">
              <h2 className="font-display text-sm font-semibold text-emerald-900">Resolution note</h2>
              <p className="mt-2 text-sm text-emerald-800">{complaint.resolutionNote}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
