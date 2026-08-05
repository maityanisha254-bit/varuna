import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Droplets, Eye, EyeOff, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', ward: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        address: { ward: form.ward, city: 'Kolkata' },
      });
      toast.success('Account created! Welcome to VARUNA.');
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-monsoon-sand px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-deep-900 text-tide-400">
            <Droplets size={24} />
          </span>
          <h1 className="mt-4 font-display text-2xl font-bold text-deep-900">Create your account</h1>
          <p className="mt-1 text-sm text-deep-500">Report waterlogging issues in your ward in seconds.</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          )}
          <div>
            <label className="label-field" htmlFor="name">Full name</label>
            <input id="name" name="name" required className="input-field" placeholder="Anisha Roy" value={form.name} onChange={handleChange} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-field" htmlFor="email">Email</label>
              <input id="email" name="email" type="email" required className="input-field" placeholder="you@example.com" value={form.email} onChange={handleChange} />
            </div>
            <div>
              <label className="label-field" htmlFor="phone">Phone</label>
              <input id="phone" name="phone" required pattern="[0-9]{10}" title="10 digit phone number" className="input-field" placeholder="9800000000" value={form.phone} onChange={handleChange} />
            </div>
          </div>
          <div>
            <label className="label-field" htmlFor="ward">Ward / Locality</label>
            <input id="ward" name="ward" className="input-field" placeholder="Ward 82, Jodhpur Park" value={form.ward} onChange={handleChange} />
          </div>
          <div>
            <label className="label-field" htmlFor="password">Password</label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                className="input-field pr-10"
                placeholder="At least 6 characters"
                value={form.password}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-deep-400 hover:text-deep-600"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full !py-2.5">
            {loading ? 'Creating account…' : (<><UserPlus size={16} /> Create account</>)}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-deep-500">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-tide-600 hover:text-tide-700">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
