import { Link } from 'react-router-dom';
import { MapPin, Clock, ImageOff } from 'lucide-react';
import { format } from 'date-fns';
import StatusBadge from './StatusBadge';
import SeverityBadge from './SeverityBadge';

export default function ComplaintCard({ complaint }) {
  return (
    <Link
      to={`/complaints/${complaint._id}`}
      className="card flex gap-4 transition hover:border-tide-300 hover:shadow-md"
    >
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-deep-50">
        {complaint.photoUrl ? (
          <img src={complaint.photoUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-deep-300">
            <ImageOff size={22} />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs font-semibold text-deep-500">{complaint.complaintCode}</span>
          <StatusBadge status={complaint.status} />
          <SeverityBadge severity={complaint.severity} />
        </div>
        <h3 className="mt-1.5 truncate font-display text-sm font-semibold text-deep-900">
          {complaint.category}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-deep-500">{complaint.description}</p>
        <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-deep-400">
          <span className="flex items-center gap-1">
            <MapPin size={13} /> {complaint.location?.address || complaint.location?.ward || 'Location on file'}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={13} /> {format(new Date(complaint.createdAt), 'dd MMM yyyy, h:mm a')}
          </span>
        </div>
      </div>
    </Link>
  );
}
