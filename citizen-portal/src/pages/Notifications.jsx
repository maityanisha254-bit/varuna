import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { BellOff, Check, CheckCheck, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from '../api/endpoints';

const TYPE_COLORS = {
  'status-update': 'bg-tide-50 text-tide-600',
  assignment: 'bg-indigo-50 text-indigo-600',
  alert: 'bg-rose-50 text-rose-600',
  system: 'bg-deep-50 text-deep-600',
  general: 'bg-amber-50 text-amber-700',
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getNotifications({ limit: 30 });
      setNotifications(res.data.data);
      setUnreadCount(res.data.unreadCount);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkRead = async (id) => {
    await markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    toast.success('All notifications marked as read');
  };

  const handleDelete = async (id) => {
    await deleteNotification(id);
    setNotifications((prev) => prev.filter((n) => n._id !== id));
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-deep-900 sm:text-3xl">Notifications</h1>
          <p className="mt-1 text-deep-500">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : "You're all caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="btn-secondary">
            <CheckCheck size={15} /> Mark all read
          </button>
        )}
      </div>

      <div className="mt-6 space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className="card h-20 animate-pulse bg-deep-50" />)
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-deep-200 py-16 text-center">
            <BellOff size={30} className="text-deep-300" />
            <p className="mt-3 font-medium text-deep-600">No notifications yet</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              className={`card flex items-start justify-between gap-3 ${!n.isRead ? 'border-tide-200 bg-tide-50/40' : ''}`}
            >
              <div className="flex gap-3">
                <span className={`mt-0.5 h-2 w-2 flex-shrink-0 rounded-full ${n.isRead ? 'bg-transparent' : 'bg-tide-500'}`} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${TYPE_COLORS[n.type] || TYPE_COLORS.general}`}>
                      {n.type.replace('-', ' ')}
                    </span>
                    <span className="text-xs text-deep-400">{format(new Date(n.createdAt), 'dd MMM, h:mm a')}</span>
                  </div>
                  <h3 className="mt-1 text-sm font-semibold text-deep-900">{n.title}</h3>
                  <p className="mt-0.5 text-sm text-deep-500">{n.message}</p>
                  {n.relatedComplaint && (
                    <Link to={`/complaints/${n.relatedComplaint}`} className="mt-1 inline-block text-xs font-semibold text-tide-600 hover:underline">
                      View complaint →
                    </Link>
                  )}
                </div>
              </div>
              <div className="flex flex-shrink-0 gap-1">
                {!n.isRead && (
                  <button onClick={() => handleMarkRead(n._id)} className="rounded-lg p-1.5 text-deep-400 hover:bg-deep-50 hover:text-tide-600" aria-label="Mark as read">
                    <Check size={15} />
                  </button>
                )}
                <button onClick={() => handleDelete(n._id)} className="rounded-lg p-1.5 text-deep-400 hover:bg-rose-50 hover:text-rose-600" aria-label="Delete">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
