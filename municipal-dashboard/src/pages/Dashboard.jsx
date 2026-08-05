import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ListChecks, CheckCircle2, Clock, AlertTriangle, ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { format } from 'date-fns';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import SeverityBadge from '../components/SeverityBadge';
import { getAnalyticsSummary, getComplaints } from '../api/endpoints';

const STATUS_COLORS = {
  pending: '#f59e0b',
  acknowledged: '#3b82f6',
  assigned: '#6366f1',
  'in-progress': '#0f97a3',
  resolved: '#10b981',
  rejected: '#e11d48',
};

const SEVERITY_COLORS = {
  low: '#71b4bd',
  medium: '#f59e0b',
  high: '#ff7a59',
  critical: '#e11d48',
};

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAnalyticsSummary(), getComplaints({ limit: 6, sort: '-createdAt' })])
      .then(([sumRes, compRes]) => {
        setSummary(sumRes.data.data);
        setRecent(compRes.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !summary) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex h-96 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-tide-500 border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  const pendingCount = summary.statusCounts.find((s) => s.status === 'pending')?.count || 0;
  const criticalCount = summary.severityCounts.find((s) => s.severity === 'critical')?.count || 0;

  const trendData = summary.trend7Days.map((d) => ({
    date: format(new Date(d.date), 'dd MMM'),
    complaints: d.count,
  }));

  const categoryData = summary.categoryCounts.map((c) => ({ name: c.category, count: c.count }));

  return (
    <DashboardLayout title="Dashboard">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total complaints" value={summary.total} icon={ListChecks} accent="tide" sub="All time" />
        <StatCard label="Resolved" value={summary.resolved} icon={CheckCircle2} accent="emerald" sub={`${summary.resolutionRate}% resolution rate`} />
        <StatCard label="Pending review" value={pendingCount} icon={Clock} accent="amber" sub="Awaiting acknowledgement" />
        <StatCard label="Critical severity" value={criticalCount} icon={AlertTriangle} accent="coral" sub="Needs urgent action" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold text-deep-900">Complaints — last 7 days</h2>
            <span className="text-xs text-deep-400">Avg resolution: {summary.avgResolutionHours}h</span>
          </div>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5eff0" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#71b4bd' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#71b4bd' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #d3e9ec', fontSize: 13 }} />
                <Line type="monotone" dataKey="complaints" stroke="#0f97a3" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h2 className="font-display text-sm font-semibold text-deep-900">Status breakdown</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={summary.statusCounts}
                  dataKey="count"
                  nameKey="status"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {summary.statusCounts.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #d3e9ec', fontSize: 13 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <h2 className="font-display text-sm font-semibold text-deep-900">Complaints by category</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5eff0" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: '#71b4bd' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#215763' }} width={150} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #d3e9ec', fontSize: 13 }} />
                <Bar dataKey="count" fill="#0f97a3" radius={[0, 6, 6, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h2 className="font-display text-sm font-semibold text-deep-900">Severity distribution</h2>
          <ul className="mt-4 space-y-3">
            {summary.severityCounts.map((s) => {
              const pct = summary.total ? Math.round((s.count / summary.total) * 100) : 0;
              return (
                <li key={s.severity}>
                  <div className="flex items-center justify-between text-sm">
                    <SeverityBadge severity={s.severity} />
                    <span className="text-deep-500">{s.count} ({pct}%)</span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-deep-100">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: SEVERITY_COLORS[s.severity] || '#0f97a3' }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="card mt-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-sm font-semibold text-deep-900">Recent complaints</h2>
          <Link to="/complaints" className="flex items-center gap-1 text-xs font-semibold text-tide-600 hover:underline">
            View all <ArrowRight size={13} />
          </Link>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-deep-100">
                <th className="table-header">Code</th>
                <th className="table-header">Category</th>
                <th className="table-header">Severity</th>
                <th className="table-header">Status</th>
                <th className="table-header">Filed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-deep-50">
              {recent.map((c) => (
                <tr key={c._id} className="transition hover:bg-deep-50/60">
                  <td className="table-cell">
                    <Link to={`/complaints/${c._id}`} className="font-mono text-xs font-semibold text-tide-600 hover:underline">
                      {c.complaintCode}
                    </Link>
                  </td>
                  <td className="table-cell">{c.category}</td>
                  <td className="table-cell"><SeverityBadge severity={c.severity} /></td>
                  <td className="table-cell"><StatusBadge status={c.status} /></td>
                  <td className="table-cell text-deep-400">{format(new Date(c.createdAt), 'dd MMM, h:mm a')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
