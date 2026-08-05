import { Link } from 'react-router-dom';
import { Droplets, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-deep-100 bg-deep-950 text-deep-200">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-tide-500/20 text-tide-400">
                <Droplets size={18} />
              </span>
              <span className="font-display text-base font-bold text-white">VARUNA</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-deep-300">
              AI-powered urban drainage intelligence — helping citizens and municipal teams
              respond to waterlogging faster.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Quick links</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/report" className="hover:text-tide-300">Report waterlogging</Link></li>
              <li><Link to="/complaints" className="hover:text-tide-300">Track a complaint</Link></li>
              <li><Link to="/emergency" className="hover:text-tide-300">Emergency contacts</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Emergency helpline</h4>
            <p className="mt-3 flex items-center gap-2 text-sm text-deep-300">
              <Phone size={15} className="text-monsoon-coral" /> 1913 (KMC Control Room, 24x7)
            </p>
          </div>
        </div>
        <div className="mt-8 border-t border-white/10 pt-6 text-xs text-deep-400">
          © {new Date().getFullYear()} VARUNA Municipal Flood Management System. Built for civic resilience.
        </div>
      </div>
    </footer>
  );
}
