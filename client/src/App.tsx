import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { PrivilegeProtectedRoute } from './components/auth/PrivilegeProtectedRoute';
import { Navigation } from './components/layout/Navigation';
import { Login } from './pages/auth/Login';
import { Signup } from './pages/auth/Signup';
import { Dashboard } from './pages/Dashboard';
import { Unauthorized } from './pages/Unauthorized';
import ErrorBoundary from './components/ErrorBoundary';
import NetworkStatus from './components/NetworkStatus';
import './styles/globals.css';

function App() {
  return (
    <ErrorBoundary>
      <NetworkStatus />
      <AuthProvider>
        <Router>
          <div className="App min-h-screen bg-gray-50">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
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
                    <main className="flex-1 lg:ml-64 p-8">
                      <div className="max-w-7xl mx-auto">
                        <h1 className="text-3xl font-bold text-gray-900 mb-6">Inventory Management</h1>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                          <p className="text-gray-600">Inventory management features coming soon...</p>
                        </div>
                      </div>
                    </main>
                  </div>
                </PrivilegeProtectedRoute>
              } />
              
              <Route path="/sales" element={
                <PrivilegeProtectedRoute requiredPrivilege="VIEW_SALES">
                  <div className="flex">
                    <Navigation />
                    <main className="flex-1 lg:ml-64 p-8">
                      <div className="max-w-7xl mx-auto">
                        <h1 className="text-3xl font-bold text-gray-900 mb-6">Sales Management</h1>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                          <p className="text-gray-600">Sales management features coming soon...</p>
                        </div>
                      </div>
                    </main>
                  </div>
                </PrivilegeProtectedRoute>
              } />
              
              <Route path="/prescriptions" element={
                <PrivilegeProtectedRoute requiredPrivilege="VIEW_PRESCRIPTIONS">
                  <div className="flex">
                    <Navigation />
                    <main className="flex-1 lg:ml-64 p-8">
                      <div className="max-w-7xl mx-auto">
                        <h1 className="text-3xl font-bold text-gray-900 mb-6">Prescription Management</h1>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                          <p className="text-gray-600">Prescription management features coming soon...</p>
                        </div>
                      </div>
                    </main>
                  </div>
                </PrivilegeProtectedRoute>
              } />
              
              <Route path="/reports" element={
                <PrivilegeProtectedRoute requiredPrivilege="VIEW_REPORTS">
                  <div className="flex">
                    <Navigation />
                    <main className="flex-1 lg:ml-64 p-8">
                      <div className="max-w-7xl mx-auto">
                        <h1 className="text-3xl font-bold text-gray-900 mb-6">Reports & Analytics</h1>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                          <p className="text-gray-600">Reports and analytics features coming soon...</p>
                        </div>
                      </div>
                    </main>
                  </div>
                </PrivilegeProtectedRoute>
              } />
              
              <Route path="/users" element={
                <PrivilegeProtectedRoute requiredPrivilege="VIEW_USERS">
                  <div className="flex">
                    <Navigation />
                    <main className="flex-1 lg:ml-64 p-8">
                      <div className="max-w-7xl mx-auto">
                        <h1 className="text-3xl font-bold text-gray-900 mb-6">User Management</h1>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                          <p className="text-gray-600">User management features coming soon...</p>
                        </div>
                      </div>
                    </main>
                  </div>
                </PrivilegeProtectedRoute>
              } />
              
              <Route path="/stores" element={
                <PrivilegeProtectedRoute requiredPrivilege="SYSTEM_SETTINGS">
                  <div className="flex">
                    <Navigation />
                    <main className="flex-1 lg:ml-64 p-8">
                      <div className="max-w-7xl mx-auto">
                        <h1 className="text-3xl font-bold text-gray-900 mb-6">Store Management</h1>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                          <p className="text-gray-600">Store management features coming soon...</p>
                        </div>
                      </div>
                    </main>
                  </div>
                </PrivilegeProtectedRoute>
              } />
              
              {/* Settings Route */}
              <Route path="/settings" element={
                <ProtectedRoute>
                  <div className="flex">
                    <Navigation />
                    <main className="flex-1 lg:ml-64 p-8">
                      <div className="max-w-7xl mx-auto">
                        <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                          <p className="text-gray-600">Settings features coming soon...</p>
                        </div>
                      </div>
                    </main>
                  </div>
                </ProtectedRoute>
              } />
              
              {/* Catch-all route */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
