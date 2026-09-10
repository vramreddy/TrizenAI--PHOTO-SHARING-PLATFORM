import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Admin Pages
import DashboardPage from './pages/admin/DashboardPage';
import EventsPage from './pages/admin/EventsPage';
import CreateEventPage from './pages/admin/CreateEventPage';
import EventDetailPage from './pages/admin/EventDetailPage';

// Team Pages
import TeamDashboardPage from './pages/team/TeamDashboardPage';
import EventUploadPage from './pages/team/EventUploadPage';

// Gallery Pages (Public)
import GalleryAccessPage from './pages/gallery/GalleryAccessPage';
import GalleryViewPage from './pages/gallery/GalleryViewPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1E293B',
              color: '#E2E8F0',
              borderRadius: '12px',
              border: '1px solid rgba(148,163,184,0.1)',
              fontSize: '0.875rem',
            },
            success: {
              iconTheme: { primary: '#10B981', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#F43F5E', secondary: '#fff' },
            },
          }}
        />

        <Routes>
          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Admin Routes */}
          <Route
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/create" element={<CreateEventPage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />
          </Route>

          {/* Team Member Routes */}
          <Route
            element={
              <ProtectedRoute allowedRoles={['team_member']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/team" element={<TeamDashboardPage />} />
            <Route path="/team/events/:eventId/upload" element={<EventUploadPage />} />
          </Route>

          {/* Public Gallery Routes */}
          <Route path="/gallery/:slug" element={<GalleryAccessPage />} />
          <Route path="/gallery/:slug/view" element={<GalleryViewPage />} />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
