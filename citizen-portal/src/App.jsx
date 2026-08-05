import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ReportWaterlogging from './pages/ReportWaterlogging';
import ComplaintHistory from './pages/ComplaintHistory';
import TrackComplaint from './pages/TrackComplaint';
import Notifications from './pages/Notifications';
import EmergencyContacts from './pages/EmergencyContacts';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-center" toastOptions={{ duration: 3500 }} />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/emergency" element={<EmergencyContacts />} />

          <Route path="/report" element={<ProtectedRoute><ReportWaterlogging /></ProtectedRoute>} />
          <Route path="/complaints" element={<ProtectedRoute><ComplaintHistory /></ProtectedRoute>} />
          <Route path="/complaints/:id" element={<ProtectedRoute><TrackComplaint /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </AuthProvider>
  );
}
