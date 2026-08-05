import { Link } from 'react-router-dom';
import { Waves } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <Waves size={40} className="text-tide-300" />
      <h1 className="mt-4 font-display text-3xl font-bold text-deep-900">Page not found</h1>
      <p className="mt-2 text-deep-500">The page you're looking for has drained away.</p>
      <Link to="/" className="btn-primary mt-6">Back to home</Link>
    </div>
  );
}
