const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  acknowledged: 'bg-blue-50 text-blue-700 border-blue-200',
  assigned: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'in-progress': 'bg-tide-50 text-tide-700 border-tide-200',
  resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-rose-50 text-rose-700 border-rose-200',
};

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || 'bg-deep-50 text-deep-700 border-deep-200';
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${style}`}>
      {status.replace('-', ' ')}
    </span>
  );
}
