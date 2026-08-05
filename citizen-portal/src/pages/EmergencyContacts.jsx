import { Phone, ShieldAlert, Flame, Hospital, Waves, MessageSquareWarning } from 'lucide-react';

const CONTACTS = [
  { icon: Waves, label: 'KMC Flood & Drainage Control Room', number: '1913', hours: '24x7', color: 'bg-tide-50 text-tide-600' },
  { icon: ShieldAlert, label: 'Kolkata Police Control Room', number: '100', hours: '24x7', color: 'bg-indigo-50 text-indigo-600' },
  { icon: Flame, label: 'Fire & Emergency Services', number: '101', hours: '24x7', color: 'bg-rose-50 text-rose-600' },
  { icon: Hospital, label: 'Ambulance Services', number: '102', hours: '24x7', color: 'bg-emerald-50 text-emerald-600' },
  { icon: MessageSquareWarning, label: 'Disaster Management Helpline', number: '1070', hours: '24x7', color: 'bg-amber-50 text-amber-700' },
];

export default function EmergencyContacts() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-bold text-deep-900 sm:text-3xl">Emergency contacts</h1>
      <p className="mt-2 text-deep-500">
        If you are in immediate danger due to flooding or waterlogging, call the relevant helpline
        directly rather than filing a report.
      </p>

      <div className="mt-8 space-y-3">
        {CONTACTS.map((c) => (
          <a
            key={c.number}
            href={`tel:${c.number}`}
            className="card flex items-center justify-between transition hover:border-tide-300"
          >
            <div className="flex items-center gap-4">
              <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${c.color}`}>
                <c.icon size={20} />
              </span>
              <div>
                <p className="font-semibold text-deep-900">{c.label}</p>
                <p className="text-xs text-deep-400">{c.hours}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-tide-600">
              <Phone size={16} />
              <span className="font-display text-lg font-bold">{c.number}</span>
            </div>
          </a>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
        <p className="font-semibold">Safety tip</p>
        <p className="mt-1">
          Avoid walking or driving through waterlogged roads deeper than knee-level — open manholes
          and strong currents are not always visible.
        </p>
      </div>
    </div>
  );
}
