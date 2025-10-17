import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import RedirectHandler from './components/RedirectHandler';
import WiFiPortalView from './components/WiFiPortalView';
import WiFiPortalDashboard from './components/WiFiPortalDashboard';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div style={{
          /* App-specific styles can be added here if needed */
        }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wifi-portals"
              element={
                <ProtectedRoute>
                  <WiFiPortalDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/wifi/:slug" element={<WiFiPortalView />} />
            <Route path="/r/:shortId" element={<RedirectHandler />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
