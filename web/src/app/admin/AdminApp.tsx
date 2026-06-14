import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router';
import { supabase } from '../../lib/supabase';
import { Session } from '@supabase/supabase-js';
import { AdminLayout } from './components/AdminLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import QuoteRequestsPage from './pages/QuoteRequestsPage';
import ProjectsPage from './pages/ProjectsPage';
import TestimonialsPage from './pages/TestimonialsPage';
import ContactInfoPage from './pages/ContactInfoPage';
import HomepageSettingsPage from './pages/HomepageSettingsPage';
import ServiceAreasPage from './pages/ServiceAreasPage';
import ProfileSettingsPage from './pages/ProfileSettingsPage';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-8 h-8 border-4 border-[#0B2E6B]/30 border-t-[#0B2E6B] rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

export default function AdminApp() {
  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />
      <Route
        element={
          <RequireAuth>
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="quotes" element={<QuoteRequestsPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="testimonials" element={<TestimonialsPage />} />
        <Route path="contact" element={<ContactInfoPage />} />
        <Route path="homepage" element={<HomepageSettingsPage />} />
        <Route path="service-areas" element={<ServiceAreasPage />} />
        <Route path="profile" element={<ProfileSettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
