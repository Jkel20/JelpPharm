import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { PrivilegeProtectedRoute } from './components/auth/PrivilegeProtectedRoute';
import { Navigation } from './components/layout/Navigation';
import { Login } from './pages/auth/Login';
import { Signup } from './pages/auth/Signup';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';
import { Dashboard } from './pages/Dashboard';
import { Unauthorized } from './pages/Unauthorized';
import { Inventory } from './pages/Inventory';
import { Sales } from './pages/Sales';
import { Prescriptions } from './pages/Prescriptions';
import { Reports } from './pages/Reports';
import { Users } from './pages/Users';
import { Stores } from './pages/Stores';
import { Settings } from './pages/Settings';
import ErrorBoundary from './components/ErrorBoundary';
import NetworkStatus from './components/NetworkStatus';
import './styles/globals.css';

function App() {
  return (
    <ErrorBoundary>
      <NetworkStatus />
      <AuthProvider>
        <div className="App min-h-screen bg-gray-50">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Protected Routes with Navigation */}
            <Route path="/" element={
              <ProtectedRoute>
                <Navigate to="/dashboard" replace />
              </ProtectedRoute>
            } />
            
            {/* Dashboard Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <div className="flex">
                  <Navigation />
                  <main className="flex-1 lg:ml-64">
                    <Dashboard />
                  </main>
                </div>
              </ProtectedRoute>
            } />
            
            {/* Role-based Dashboard Routes */}
            <Route path="/admin" element={
              <ProtectedRoute>
                <div className="flex">
                  <Navigation />
                  <main className="flex-1 lg:ml-64">
                    <Dashboard />
                  </main>
                </div>
              </ProtectedRoute>
            } />
            
            <Route path="/pharmacist" element={
              <ProtectedRoute>
                <div className="flex">
                  <Navigation />
                  <main className="flex-1 lg:ml-64">
                    <Dashboard />
                  </main>
                </div>
              </ProtectedRoute>
            } />
            
            <Route path="/store-manager" element={
              <ProtectedRoute>
                <div className="flex">
                  <Navigation />
                  <main className="flex-1 lg:ml-64">
                    <Dashboard />
                  </main>
                </div>
              </ProtectedRoute>
            } />
            
            <Route path="/cashier" element={
              <ProtectedRoute>
                <div className="flex">
                  <Navigation />
                  <main className="flex-1 lg:ml-64">
                    <Dashboard />
                  </main>
                </div>
              </ProtectedRoute>
            } />
            
            {/* Feature Routes with Privilege Protection */}
            <Route path="/inventory" element={
                <PrivilegeProtectedRoute requiredPrivilege="VIEW_INVENTORY">
                  <div className="flex">
                    <Navigation />
                    <main className="flex-1 lg:ml-64">
                      <Inventory />
                    </main>
                  </div>
                </PrivilegeProtectedRoute>
              } />
              
              <Route path="/sales" element={
                <PrivilegeProtectedRoute requiredPrivilege="VIEW_SALES">
                  <div className="flex">
                    <Navigation />
                    <main className="flex-1 lg:ml-64">
                      <Sales />
                    </main>
                  </div>
                </PrivilegeProtectedRoute>
              } />
              
              <Route path="/prescriptions" element={
                <PrivilegeProtectedRoute requiredPrivilege="VIEW_PRESCRIPTIONS">
                  <div className="flex">
                    <Navigation />
                    <main className="flex-1 lg:ml-64">
                      <Prescriptions />
                    </main>
                  </div>
                </PrivilegeProtectedRoute>
              } />
              
              <Route path="/reports" element={
                <PrivilegeProtectedRoute requiredPrivilege="VIEW_REPORTS">
                  <div className="flex">
                    <Navigation />
                    <main className="flex-1 lg:ml-64">
                      <Reports />
                    </main>
                  </div>
                </PrivilegeProtectedRoute>
              } />
              
              <Route path="/users" element={
                <PrivilegeProtectedRoute requiredPrivilege="VIEW_USERS">
                  <div className="flex">
                    <Navigation />
                    <main className="flex-1 lg:ml-64">
                      <Users />
                    </main>
                  </div>
                </PrivilegeProtectedRoute>
              } />
              
              <Route path="/stores" element={
                <PrivilegeProtectedRoute requiredPrivilege="VIEW_USERS">
                  <div className="flex">
                    <Navigation />
                    <main className="flex-1 lg:ml-64">
                      <Stores />
                    </main>
                  </div>
                </PrivilegeProtectedRoute>
              } />
              
              {/* Settings Route */}
              <Route path="/settings" element={
                <ProtectedRoute>
                  <div className="flex">
                    <Navigation />
                    <main className="flex-1 lg:ml-64">
                      <Settings />
                    </main>
                  </div>
                </ProtectedRoute>
              } />
              
              {/* Catch-all route */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
