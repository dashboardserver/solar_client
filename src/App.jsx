import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import LoginBox from './components/LoginBox';
import AdminPage from './pages/AdminPage';
import Seafdec from './pages/dashboards/Seafdec';
import B1 from './pages/dashboards/B1';
import C1 from './pages/dashboards/C1';
import D1 from './pages/dashboards/D1';
import ProtectedRoute from './components/ProtectedRoute';

function AppWrapper() {
  const [selectedPage, setSelectedPage] = useState(null);
  const location = useLocation();

  const hideSidebar =
    location.pathname.startsWith('/dashboard/') || location.pathname === '/admin';

  return (
    <div className="flex h-screen">
      {!hideSidebar && <Sidebar onSelect={setSelectedPage} />}
      <div className="flex-1 flex items-center justify-center">
        <Routes>
          <Route path="/" element={<LoginBox selectedPage={selectedPage} />} />
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}><AdminPage /></ProtectedRoute>
          } />
          {/* ✅ Protected dashboard routes */}
          <Route path="/dashboard/seafdec" element={
            <ProtectedRoute><Seafdec /></ProtectedRoute>
          } />
          <Route path="/dashboard/B1" element={
            <ProtectedRoute><B1 /></ProtectedRoute>
          } />
          <Route path="/dashboard/C1" element={
            <ProtectedRoute><C1 /></ProtectedRoute>
          } />
          <Route path="/dashboard/D1" element={
            <ProtectedRoute><D1 /></ProtectedRoute>
          } />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}
