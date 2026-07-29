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
          <Route path="/login" element={<Login />} />
          <Route path="/overview" element={<ProtectedRoute><Overview /></ProtectedRoute>} />
          <Route path="/campaign" element={<ProtectedRoute><CampaignDetail /></ProtectedRoute>} />
          <Route path="/insights" element={<ProtectedRoute><Insights /></ProtectedRoute>} />
          <Route path="/survey" element={<ProtectedRoute><SurveyResults /></ProtectedRoute>} />
          <Route path="/summary" element={<ProtectedRoute><AiSummary /></ProtectedRoute>} />
          <Route path="/participants" element={<ProtectedRoute><Participants /></ProtectedRoute>} />
          <Route path="/report" element={<ProtectedRoute><Report /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
