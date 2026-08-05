import { useState } from 'react';
import { User, Lock, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { updateProfile, changePassword } from '../api/endpoints';

export default function Profile() {
  const { user, updateStoredUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    ward: user?.address?.ward || '',
  });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfileChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handlePwChange = (e) => setPwForm({ ...pwForm, [e.target.name]: e.target.value });

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await updateProfile({
        name: form.name,
        phone: form.phone,
        address: { ward: form.ward },
      });
      updateStoredUser(res.data.data);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setSavingPassword(true);
    try {
      await changePassword(pwForm);
      toast.success('Password changed successfully');
      setPwForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-deep-900 text-xl font-bold text-tide-300">
          {user?.name?.[0]?.toUpperCase()}
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold text-deep-900">{user?.name}</h1>
          <p className="text-sm text-deep-500">{user?.email}</p>
        </div>
      </div>

      <form onSubmit={handleProfileSubmit} className="card mt-8 space-y-4">
        <h2 className="flex items-center gap-2 font-display text-sm font-semibold text-deep-900">
          <User size={16} /> Profile details
        </h2>
        <div>
          <label className="label-field" htmlFor="name">Full name</label>
          <input id="name" name="name" className="input-field" value={form.name} onChange={handleProfileChange} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-field" htmlFor="phone">Phone</label>
            <input id="phone" name="phone" className="input-field" value={form.phone} onChange={handleProfileChange} />
          </div>
          <div>
            <label className="label-field" htmlFor="ward">Ward / Locality</label>
            <input id="ward" name="ward" className="input-field" value={form.ward} onChange={handleProfileChange} />
          </div>
        </div>
        <button type="submit" disabled={savingProfile} className="btn-primary">
          <Save size={15} /> {savingProfile ? 'Saving…' : 'Save changes'}
        </button>
      </form>

      <form onSubmit={handlePasswordSubmit} className="card mt-6 space-y-4">
        <h2 className="flex items-center gap-2 font-display text-sm font-semibold text-deep-900">
          <Lock size={16} /> Change password
        </h2>
        <div>
          <label className="label-field" htmlFor="currentPassword">Current password</label>
          <input
            id="currentPassword"
            name="currentPassword"
            type="password"
            required
            className="input-field"
            value={pwForm.currentPassword}
            onChange={handlePwChange}
          />
        </div>
        <div>
          <label className="label-field" htmlFor="newPassword">New password</label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            required
            minLength={6}
            className="input-field"
            value={pwForm.newPassword}
            onChange={handlePwChange}
          />
        </div>
        <button type="submit" disabled={savingPassword} className="btn-secondary">
          {savingPassword ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </div>
  );
}
