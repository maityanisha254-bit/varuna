import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, MapPin, Loader2, CheckCircle2, X, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { createComplaint } from '../api/endpoints';

const CATEGORIES = [
  'Waterlogging',
  'Drain Blockage',
  'Sewage Overflow',
  'Pothole with Water Accumulation',
  'Broken Drain Cover',
  'Illegal Dumping in Drain',
  'Other',
];

const SEVERITIES = [
  { value: 'low', label: 'Low', desc: 'Minor puddling, no obstruction', color: 'border-deep-200 hover:border-deep-300' },
  { value: 'medium', label: 'Medium', desc: 'Ankle-deep water, slows traffic', color: 'border-amber-200 hover:border-amber-300' },
  { value: 'high', label: 'High', desc: 'Knee-deep, blocking the road', color: 'border-orange-200 hover:border-orange-300' },
  { value: 'critical', label: 'Critical', desc: 'Entering homes, safety risk', color: 'border-rose-200 hover:border-rose-300' },
];

export default function ReportWaterlogging() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({ category: '', severity: '', description: '', address: '', ward: '' });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [location, setLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const captureLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setLocating(false);
        toast.success('Location captured');
      },
      (err) => {
        setLocating(false);
        setLocationError(
          err.code === err.PERMISSION_DENIED
            ? 'Location permission denied. Please enable it and try again.'
            : 'Could not fetch your location. Please try again.'
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category) return toast.error('Please select a category');
    if (!form.severity) return toast.error('Please select a severity level');
    if (!form.description.trim()) return toast.error('Please add a description');
    if (!location) return toast.error('Please capture your location');

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('category', form.category);
      fd.append('severity', form.severity);
      fd.append('description', form.description);
      fd.append('address', form.address);
      fd.append('ward', form.ward);
      fd.append('latitude', location.latitude);
      fd.append('longitude', location.longitude);
      if (photo) fd.append('photo', photo);

      const res = await createComplaint(fd);
      setSubmitted(res.data.data);
      toast.success('Complaint submitted successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 size={32} />
        </div>
        <h1 className="mt-5 font-display text-2xl font-bold text-deep-900">Report submitted</h1>
        <p className="mt-2 text-deep-500">
          Your complaint has been logged as{' '}
          <span className="font-mono font-semibold text-deep-800">{submitted.complaintCode}</span>. You'll be
          notified as it progresses.
        </p>
        <div className="mt-8 flex gap-3">
          <button onClick={() => navigate(`/complaints/${submitted._id}`)} className="btn-primary">
            View status
          </button>
          <button
            onClick={() => {
              setSubmitted(null);
              setForm({ category: '', severity: '', description: '', address: '', ward: '' });
              removePhoto();
              setLocation(null);
            }}
            className="btn-secondary"
          >
            File another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-bold text-deep-900 sm:text-3xl">Report waterlogging</h1>
      <p className="mt-2 text-deep-500">
        Add a photo and confirm your location so field teams can find it quickly.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {/* Photo upload */}
        <div className="card">
          <label className="label-field">Photo evidence</label>
          {photoPreview ? (
            <div className="relative mt-1 overflow-hidden rounded-xl">
              <img src={photoPreview} alt="Preview" className="h-56 w-full object-cover" />
              <button
                type="button"
                onClick={removePhoto}
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-1 flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-deep-200 py-10 text-deep-400 transition hover:border-tide-400 hover:text-tide-600"
            >
              <Camera size={26} />
              <span className="text-sm font-medium">Tap to take or upload a photo</span>
              <span className="text-xs">JPG, PNG or WEBP — up to 5MB</span>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp"
            capture="environment"
            onChange={handlePhotoChange}
            className="hidden"
          />
        </div>

        {/* Location */}
        <div className="card">
          <label className="label-field">Location</label>
          {location ? (
            <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              <span className="flex items-center gap-2">
                <MapPin size={16} /> Location captured ({location.latitude.toFixed(5)}, {location.longitude.toFixed(5)})
              </span>
              <button type="button" onClick={captureLocation} className="font-semibold underline">
                Update
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={captureLocation}
              disabled={locating}
              className="btn-secondary w-full !py-3"
            >
              {locating ? (
                <><Loader2 size={16} className="animate-spin" /> Fetching your location…</>
              ) : (
                <><MapPin size={16} /> Use my current location</>
              )}
            </button>
          )}
          {locationError && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-rose-600">
              <AlertTriangle size={13} /> {locationError}
            </p>
          )}
          <div className="mt-3 grid grid-cols-2 gap-3">
            <input
              name="address"
              placeholder="Landmark / street (optional)"
              className="input-field"
              value={form.address}
              onChange={handleChange}
            />
            <input
              name="ward"
              placeholder="Ward number (optional)"
              className="input-field"
              value={form.ward}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Category */}
        <div className="card">
          <label className="label-field">Category</label>
          <select name="category" required value={form.category} onChange={handleChange} className="input-field">
            <option value="">Select a category</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Severity */}
        <div className="card">
          <label className="label-field">Severity</label>
          <div className="grid grid-cols-2 gap-3">
            {SEVERITIES.map((s) => (
              <button
                type="button"
                key={s.value}
                onClick={() => setForm({ ...form, severity: s.value })}
                className={`rounded-xl border-2 p-3 text-left transition ${s.color} ${
                  form.severity === s.value ? 'ring-2 ring-tide-500 border-tide-400' : ''
                }`}
              >
                <div className="text-sm font-semibold text-deep-900">{s.label}</div>
                <div className="mt-0.5 text-xs text-deep-500">{s.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="card">
          <label className="label-field" htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            required
            rows={4}
            maxLength={1000}
            placeholder="Describe what you're seeing — how deep is the water, is traffic affected, since when has it been like this?"
            className="input-field resize-none"
            value={form.description}
            onChange={handleChange}
          />
          <div className="mt-1 text-right text-xs text-deep-400">{form.description.length}/1000</div>
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full !py-3 !text-base">
          {submitting ? (<><Loader2 size={18} className="animate-spin" /> Submitting…</>) : 'Submit report'}
        </button>
      </form>
    </div>
  );
}
