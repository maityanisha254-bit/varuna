import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Droplets, Bell, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/', label: 'Home' },
  { to: '/report', label: 'Report Issue' },
  { to: '/complaints', label: 'My Complaints' },
  { to: '/emergency', label: 'Emergency' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition hover:text-tide-600 ${isActive ? 'text-tide-700' : 'text-deep-600'}`;

  return (
    <header className="sticky top-0 z-40 border-b border-deep-100 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-deep-900 text-tide-400">
            <Droplets size={20} />
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-deep-900">
            VARUNA
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass} end={l.to === '/'}>
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <NavLink
                to="/notifications"
                className="rounded-lg p-2 text-deep-600 transition hover:bg-deep-50 hover:text-tide-600"
                aria-label="Notifications"
              >
                <Bell size={19} />
              </NavLink>
              <NavLink
                to="/profile"
                className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-deep-700 transition hover:bg-deep-50"
              >
                <User size={16} />
                {user.name?.split(' ')[0]}
              </NavLink>
              <button onClick={handleLogout} className="btn-secondary !px-3 !py-1.5">
                <LogOut size={15} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary !px-4 !py-1.5">
                Log in
              </Link>
              <Link to="/register" className="btn-primary !px-4 !py-1.5">
                Report an issue
              </Link>
            </>
          )}
        </div>

        <button
          className="rounded-lg p-2 text-deep-700 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-deep-100 bg-white px-4 pb-4 md:hidden">
          <div className="flex flex-col gap-1 pt-2">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-deep-700 hover:bg-deep-50"
                end={l.to === '/'}
              >
                {l.label}
              </NavLink>
            ))}
            {user ? (
              <>
                <NavLink to="/notifications" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-deep-700 hover:bg-deep-50">
                  Notifications
                </NavLink>
                <NavLink to="/profile" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-deep-700 hover:bg-deep-50">
                  Profile
                </NavLink>
                <button
                  onClick={() => {
                    setOpen(false);
                    handleLogout();
                  }}
                  className="mt-1 rounded-lg bg-deep-50 px-3 py-2.5 text-left text-sm font-semibold text-deep-800"
                >
                  Log out
                </button>
              </>
            ) : (
              <div className="mt-2 flex gap-2">
                <Link to="/login" onClick={() => setOpen(false)} className="btn-secondary flex-1">
                  Log in
                </Link>
                <Link to="/register" onClick={() => setOpen(false)} className="btn-primary flex-1">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
