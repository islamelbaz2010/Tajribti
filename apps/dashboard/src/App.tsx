import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Overview from './pages/Overview';
import CampaignDetail from './pages/CampaignDetail';
import Insights from './pages/Insights';
import SurveyResults from './pages/SurveyResults';
import AiSummary from './pages/AiSummary';
import Participants from './pages/Participants';
import Report from './pages/Report';
import JoinLayout from './pages/consumer/JoinLayout';
import JoinPage from './pages/consumer/JoinPage';
import PhonePage from './pages/consumer/PhonePage';
import OtpPage from './pages/consumer/OtpPage';
import RegisterPage from './pages/consumer/RegisterPage';
import SurveyPage from './pages/consumer/SurveyPage';
import ThankYouPage from './pages/consumer/ThankYouPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Brand dashboard */}
          <Route path="/login" element={<Login />} />
          <Route path="/overview" element={<ProtectedRoute><Overview /></ProtectedRoute>} />
          <Route path="/campaign" element={<ProtectedRoute><CampaignDetail /></ProtectedRoute>} />
          <Route path="/insights" element={<ProtectedRoute><Insights /></ProtectedRoute>} />
          <Route path="/survey" element={<ProtectedRoute><SurveyResults /></ProtectedRoute>} />
          <Route path="/summary" element={<ProtectedRoute><AiSummary /></ProtectedRoute>} />
          <Route path="/participants" element={<ProtectedRoute><Participants /></ProtectedRoute>} />
          <Route path="/report" element={<ProtectedRoute><Report /></ProtectedRoute>} />

          {/* Consumer web journey — no brand auth required */}
          <Route path="/join/:campaignId" element={<JoinLayout />}>
            <Route index element={<JoinPage />} />
            <Route path="phone" element={<PhonePage />} />
            <Route path="otp" element={<OtpPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="survey" element={<SurveyPage />} />
            <Route path="thankyou" element={<ThankYouPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
