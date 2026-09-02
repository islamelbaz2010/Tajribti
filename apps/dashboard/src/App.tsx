import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import Login from './pages/Login';
import EmployeeSignup from './pages/EmployeeSignup';
import Overview from './pages/Overview';
import Campaigns from './pages/Campaigns';
import CreateCampaign from './pages/CreateCampaign';
import CampaignDetail from './pages/CampaignDetail';
import Insights from './pages/Insights';
import SurveyResults from './pages/SurveyResults';
import AiSummary from './pages/AiSummary';
import Participants from './pages/Participants';
import Gallery from './pages/Gallery';
import Report from './pages/Report';
import CompanyProfile from './pages/CompanyProfile';
import Employees from './pages/Employees';
import PublicHome from './pages/public/Home';
import PublicSampleReport from './pages/public/SampleReport';
import JoinLayout from './pages/consumer/JoinLayout';
import JoinPage from './pages/consumer/JoinPage';
import PhonePage from './pages/consumer/PhonePage';
import OtpPage from './pages/consumer/OtpPage';
import RegisterPage from './pages/consumer/RegisterPage';
import SurveyPage from './pages/consumer/SurveyPage';
import ThankYouPage from './pages/consumer/ThankYouPage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminCompanies from './pages/admin/AdminCompanies';
import AdminCompanyDetail from './pages/admin/AdminCompanyDetail';
import AdminCampaigns from './pages/admin/AdminCampaigns';
import AdminCampaignDetail from './pages/admin/AdminCampaignDetail';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

// Founder ruling W-2 (2026-09-02): a SEPARATE protected-route wrapper for
// the Admin Control Center — its own auth context, its own redirect
// target (/admin/login, never /login) — so Admin and Company/Employee
// sessions never bleed into each other's route guards.
function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAdminAuth();
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return <AdminLayout>{children}</AdminLayout>;
}

export default function App() {
  return (
    <AuthProvider>
      <AdminAuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public marketing site — no auth (Commercial V1 Completion Sprint, 2026-09-01) */}
          <Route path="/" element={<PublicHome />} />
          <Route path="/sample-report" element={<PublicSampleReport />} />

          {/* Brand dashboard */}
          <Route path="/login" element={<Login />} />
          <Route path="/employee/signup" element={<EmployeeSignup />} />
          <Route path="/overview" element={<ProtectedRoute><Overview /></ProtectedRoute>} />
          <Route path="/campaigns" element={<ProtectedRoute><Campaigns /></ProtectedRoute>} />
          <Route path="/campaigns/new" element={<ProtectedRoute><CreateCampaign /></ProtectedRoute>} />
          <Route path="/campaign" element={<ProtectedRoute><CampaignDetail /></ProtectedRoute>} />
          <Route path="/insights" element={<ProtectedRoute><Insights /></ProtectedRoute>} />
          <Route path="/survey" element={<ProtectedRoute><SurveyResults /></ProtectedRoute>} />
          <Route path="/summary" element={<ProtectedRoute><AiSummary /></ProtectedRoute>} />
          <Route path="/participants" element={<ProtectedRoute><Participants /></ProtectedRoute>} />
          <Route path="/gallery" element={<ProtectedRoute><Gallery /></ProtectedRoute>} />
          <Route path="/report" element={<ProtectedRoute><Report /></ProtectedRoute>} />
          <Route path="/company" element={<ProtectedRoute><CompanyProfile /></ProtectedRoute>} />
          <Route path="/employees" element={<ProtectedRoute><Employees /></ProtectedRoute>} />

          {/* TAJRIBTI Admin Control Center (Founder ruling W-2, 2026-09-02) —
              a deliberately separate route tree/auth context from the
              Company Console above. */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<Navigate to="/admin/companies" replace />} />
          <Route path="/admin/companies" element={<AdminProtectedRoute><AdminCompanies /></AdminProtectedRoute>} />
          <Route path="/admin/companies/:id" element={<AdminProtectedRoute><AdminCompanyDetail /></AdminProtectedRoute>} />
          <Route path="/admin/campaigns" element={<AdminProtectedRoute><AdminCampaigns /></AdminProtectedRoute>} />
          <Route path="/admin/campaigns/:id" element={<AdminProtectedRoute><AdminCampaignDetail /></AdminProtectedRoute>} />

          {/* Consumer web journey — no brand auth required */}
          <Route path="/join/:campaignId" element={<JoinLayout />}>
            <Route index element={<JoinPage />} />
            <Route path="phone" element={<PhonePage />} />
            <Route path="otp" element={<OtpPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="survey" element={<SurveyPage />} />
            <Route path="thankyou" element={<ThankYouPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </AdminAuthProvider>
    </AuthProvider>
  );
}
