import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GlobalStateProvider } from './context/GlobalStateContext';

import Dashboard from './pages/Dashboard';
import Pipeline from './pages/Pipeline';
import Tasks from './pages/Tasks';
import Customers from './pages/Customers';
import Payments from './pages/Payments';
import Settings from './pages/Settings';
import Login from './pages/Login';

// Protected Route: chỉ cho vào nếu đã đăng nhập
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F5EE]">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin w-8 h-8 text-[#C89A3D]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-[#8B8375]">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Public Route: chỉ cho vào nếu CHƯA đăng nhập
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return children;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <GlobalStateProvider>
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <App />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="pipeline" element={<Pipeline />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="customers" element={<Customers />} />
              <Route path="payments" element={<Payments />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </GlobalStateProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
