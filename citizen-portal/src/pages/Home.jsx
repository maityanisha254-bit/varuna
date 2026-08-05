import { Link } from 'react-router-dom';
import { Droplets, MapPinned, ShieldCheck, BellRing, ArrowRight, CloudRain } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const steps = [
  {
    icon: CloudRain,
    title: 'Spot the problem',
    text: 'See waterlogging, a blocked drain, or an overflowing manhole in your neighborhood.',
  },
  {
    icon: MapPinned,
    title: 'Report in under a minute',
    text: 'Snap a photo, your GPS location is captured automatically, add a category and severity.',
  },
  {
    icon: BellRing,
    title: 'Track every update',
    text: 'Get notified the moment your complaint is acknowledged, assigned, and resolved.',
  },
];

const stats = [
  { value: '92%', label: 'Complaints acknowledged within 24 hrs' },
  { value: '4.2 hrs', label: 'Average dispatch time to field teams' },
  { value: '144', label: 'Wards actively monitored' },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-deep-950">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              'radial-gradient(600px circle at 15% 20%, rgba(15,151,163,0.35), transparent 60%), radial-gradient(500px circle at 85% 80%, rgba(255,122,89,0.15), transparent 60%)',
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-tide-500/30 bg-tide-500/10 px-3 py-1 text-xs font-semibold text-tide-300">
                <Droplets size={13} /> Kolkata Municipal Corporation · Citizen Portal
              </span>
              <h1 className="mt-5 font-display text-4xl font-bold leading-[1.1] text-white sm:text-5xl">
                See waterlogging before it becomes a flood.
              </h1>
              <p className="mt-5 max-w-lg text-base text-deep-200 sm:text-lg">
                VARUNA connects citizens directly to municipal drainage teams. Report an issue
                with a photo and your location, and follow it through to resolution — no phone
                queues, no guesswork.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to={user ? '/report' : '/register'} className="btn-primary !px-6 !py-3 !text-base">
                  Report an issue <ArrowRight size={18} />
                </Link>
                <Link to="/complaints" className="btn-secondary !bg-white/5 !border-white/15 !text-white !px-6 !py-3 !text-base hover:!bg-white/10">
                  Track a complaint
                </Link>
              </div>
              <div className="mt-10 grid grid-cols-3 gap-6 border-t border-white/10 pt-6">
                {stats.map((s) => (
                  <div key={s.label}>
                    <div className="font-display text-2xl font-bold text-white">{s.value}</div>
                    <div className="mt-1 text-xs text-deep-300">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-md">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur">
                <div className="flex items-center justify-between text-xs text-deep-300">
                  <span>Live complaint feed</span>
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> Updating
                  </span>
                </div>
                <div className="mt-4 space-y-3">
                  {[
                    { code: 'VRN-482913', ward: 'Ward 82, Jodhpur Park', status: 'Assigned', color: 'bg-indigo-400' },
                    { code: 'VRN-482887', ward: 'Ward 66, Kasba', status: 'In progress', color: 'bg-tide-400' },
                    { code: 'VRN-482855', ward: 'Ward 91, Behala', status: 'Resolved', color: 'bg-emerald-400' },
                  ].map((c) => (
                    <div key={c.code} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                      <div>
                        <div className="font-mono text-xs text-deep-300">{c.code}</div>
                        <div className="text-sm text-white">{c.ward}</div>
                      </div>
                      <span className={`h-2 w-2 rounded-full ${c.color}`} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 hidden rounded-2xl border border-white/10 bg-deep-900 px-4 py-3 shadow-xl sm:block">
                <div className="flex items-center gap-2 text-tide-300">
                  <ShieldCheck size={16} />
                  <span className="text-xs font-semibold">Verified municipal response</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold text-deep-900">How reporting works</h2>
          <p className="mt-3 text-deep-500">
            Three steps stand between spotting a problem and getting it fixed.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {steps.map((step, idx) => (
            <div key={step.title} className="card">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-tide-50 text-tide-600">
                <step.icon size={20} />
              </div>
              <div className="mt-4 text-xs font-semibold text-tide-600">STEP {idx + 1}</div>
              <h3 className="mt-1 font-display text-lg font-semibold text-deep-900">{step.title}</h3>
              <p className="mt-2 text-sm text-deep-500">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-tide-600">
        <div className="mx-auto max-w-7xl px-4 py-14 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
            Noticed a drain overflowing right now?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-tide-50">
            It takes less than a minute to file a report — your GPS location is captured
            automatically so field teams know exactly where to go.
          </p>
          <Link
            to={user ? '/report' : '/register'}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-tide-700 shadow-soft transition hover:bg-tide-50"
          >
            File a report now <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </div>
  );
}
