import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';

const SEVERITY_COLORS = {
  low: '#71b4bd',
  medium: '#ffb648',
  high: '#ff7a59',
  critical: '#e11d48',
};

const KOLKATA_CENTER = [22.5726, 88.3639];

export default function MapView({ locations = [], height = '480px' }) {
  return (
    <div style={{ height }} className="overflow-hidden rounded-2xl border border-deep-100">
      <MapContainer center={KOLKATA_CENTER} zoom={12} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locations.map((loc) => {
          const [lng, lat] = loc.location.coordinates;
          return (
            <CircleMarker
              key={loc._id}
              center={[lat, lng]}
              radius={9}
              pathOptions={{
                color: SEVERITY_COLORS[loc.severity] || '#0f97a3',
                fillColor: SEVERITY_COLORS[loc.severity] || '#0f97a3',
                fillOpacity: 0.7,
                weight: 2,
              }}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-mono text-xs font-semibold text-deep-500">{loc.complaintCode}</p>
                  <p className="mt-1 font-semibold">{loc.category}</p>
                  <p className="capitalize text-deep-500">
                    {loc.severity} severity · {loc.status.replace('-', ' ')}
                  </p>
                  <Link to={`/complaints/${loc._id}`} className="mt-1 inline-block text-xs font-semibold text-tide-600 hover:underline">
                    View details →
                  </Link>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
