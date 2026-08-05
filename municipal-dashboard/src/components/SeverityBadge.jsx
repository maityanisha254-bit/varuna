const SEVERITY_STYLES = {
  low: 'bg-deep-50 text-deep-600',
  medium: 'bg-amber-100 text-amber-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-rose-100 text-rose-700',
};

export default function SeverityBadge({ severity }) {
  const style = SEVERITY_STYLES[severity] || 'bg-deep-50 text-deep-600';
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold capitalize ${style}`}>
      {severity}
    </span>
  );
}
