import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, MapPinned, ListChecks, Users, HardHat, Droplets, X,
} from 'lucide-react';

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/complaints', label: 'Complaints', icon: ListChecks },
  { to: '/map', label: 'Map view', icon: MapPinned },
  { to: '/citizens', label: 'Citizens', icon: Users },
  { to: '/workers', label: 'Field workers', icon: HardHat },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-deep-950 transition-transform lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-tide-500/20 text-tide-400">
              <Droplets size={19} />
            </span>
            <div>
              <div className="font-display text-base font-bold text-white">VARUNA</div>
              <div className="text-[10px] uppercase tracking-wide text-deep-400">Municipal Console</div>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-deep-400 hover:bg-white/5 lg:hidden">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-tide-500/15 text-tide-300'
                    : 'text-deep-300 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <l.icon size={18} />
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/5 px-5 py-4 text-xs text-deep-400">
          Kolkata Municipal Corporation
          <br />Flood &amp; Drainage Wing
        </div>
      </aside>
    </>
  );
}
