export default function StatCard({ label, value, sub, icon: Icon, accent = 'tide' }) {
  const accents = {
    tide: 'bg-tide-50 text-tide-600',
    coral: 'bg-orange-50 text-orange-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-700',
  };
  return (
    <div className="card flex items-start justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-deep-400">{label}</p>
        <p className="mt-2 font-display text-2xl font-bold text-deep-900">{value}</p>
        {sub && <p className="mt-1 text-xs text-deep-400">{sub}</p>}
      </div>
      {Icon && (
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${accents[accent] || accents.tide}`}>
          <Icon size={18} />
        </span>
      )}
    </div>
  );
}
