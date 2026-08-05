import { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import MapView from '../components/MapView';
import { getMapLocations } from '../api/endpoints';

const STATUS_FILTERS = ['all', 'pending', 'acknowledged', 'assigned', 'in-progress', 'resolved', 'rejected'];

export default function MapPage() {
  const [locations, setLocations] = useState([]);
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (status !== 'all') params.status = status;
    getMapLocations(params)
      .then((res) => setLocations(res.data.data))
      .finally(() => setLoading(false));
  }, [status]);

  return (
    <DashboardLayout title="Map view">
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-sm font-semibold text-deep-900">Reported locations</h2>
            <p className="text-xs text-deep-400">{locations.length} complaints plotted · colored by severity</p>
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field w-auto text-xs">
            {STATUS_FILTERS.map((s) => <option key={s} value={s}>{s === 'all' ? 'All statuses' : s.replace('-', ' ')}</option>)}
          </select>
        </div>

        <div className="mt-4 flex gap-4 text-xs text-deep-500">
          <LegendDot color="#71b4bd" label="Low" />
          <LegendDot color="#ffb648" label="Medium" />
          <LegendDot color="#ff7a59" label="High" />
          <LegendDot color="#e11d48" label="Critical" />
        </div>

        <div className="mt-4">
          {loading ? (
            <div className="flex h-[480px] items-center justify-center rounded-2xl bg-deep-50">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-tide-500 border-t-transparent" />
            </div>
          ) : (
            <MapView locations={locations} height="560px" />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function LegendDot({ color, label }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}
