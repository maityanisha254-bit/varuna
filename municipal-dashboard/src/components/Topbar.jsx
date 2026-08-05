import { Menu, LogOut, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Topbar({ onMenuClick, title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-deep-100 bg-white/90 px-4 py-3.5 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="rounded-lg p-1.5 text-deep-600 hover:bg-deep-50 lg:hidden">
          <Menu size={20} />
        </button>
        <h1 className="font-display text-lg font-semibold text-deep-900">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        <span className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 sm:flex">
          <ShieldCheck size={13} /> Admin session
        </span>
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-deep-900 text-xs font-bold text-tide-300">
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </span>
          <span className="hidden text-sm font-medium text-deep-700 sm:inline">{user?.name}</span>
        </div>
        <button onClick={handleLogout} className="rounded-lg p-2 text-deep-500 hover:bg-deep-50 hover:text-rose-600" aria-label="Log out">
          <LogOut size={17} />
        </button>
      </div>
    </header>
  );
}
