import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Login } from './pages/auth/Login';
import { Signup } from './pages/auth/Signup';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';
import { Dashboard } from './pages/Dashboard';
import { Inventory } from './pages/Inventory';
import { Sales } from './pages/Sales';
import { Prescriptions } from './pages/Prescriptions';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import Unauthorized from './pages/Unauthorized';
import MainLayout from './components/layout/MainLayout';
import PrivilegeProtectedRoute from './components/auth/PrivilegeProtectedRoute';

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  console.log('ProtectedRoute: isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        
        {/* General Dashboard */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        
        {/* Role-Based Dashboards with Privilege Protection */}
        <Route 
          path="/dashboard/admin" 
          element={
            <ProtectedRoute>
              <PrivilegeProtectedRoute requiredPrivilege="SYSTEM_SETTINGS">
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </PrivilegeProtectedRoute>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/dashboard/pharmacist" 
          element={
            <ProtectedRoute>
              <PrivilegeProtectedRoute requiredPrivilege="MANAGE_PRESCRIPTIONS">
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </PrivilegeProtectedRoute>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/dashboard/store-manager" 
          element={
            <ProtectedRoute>
              <PrivilegeProtectedRoute requiredPrivilege="MANAGE_INVENTORY">
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </PrivilegeProtectedRoute>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/dashboard/cashier" 
          element={
            <ProtectedRoute>
              <PrivilegeProtectedRoute requiredPrivilege="CREATE_SALES">
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </PrivilegeProtectedRoute>
            </ProtectedRoute>
          } 
        />
        
        {/* Feature Routes with Privilege Protection */}
        <Route 
          path="/inventory" 
          element={
            <ProtectedRoute>
              <PrivilegeProtectedRoute requiredPrivilege="VIEW_INVENTORY">
                <MainLayout>
                  <Inventory />
                </MainLayout>
              </PrivilegeProtectedRoute>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/sales" 
          element={
            <ProtectedRoute>
              <PrivilegeProtectedRoute requiredPrivilege="VIEW_SALES">
                <MainLayout>
                  <Sales />
                </MainLayout>
              </PrivilegeProtectedRoute>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/prescriptions" 
          element={
            <ProtectedRoute>
              <PrivilegeProtectedRoute requiredPrivilege="VIEW_PRESCRIPTIONS">
                <MainLayout>
                  <Prescriptions />
                </MainLayout>
              </PrivilegeProtectedRoute>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/reports" 
          element={
            <ProtectedRoute>
              <PrivilegeProtectedRoute requiredPrivilege="VIEW_REPORTS">
                <MainLayout>
                  <Reports />
                </MainLayout>
              </PrivilegeProtectedRoute>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <PrivilegeProtectedRoute requiredPrivilege="SYSTEM_SETTINGS">
                <MainLayout>
                  <Settings />
                </MainLayout>
              </PrivilegeProtectedRoute>
            </ProtectedRoute>
          } 
        />
        
        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
};

export default App;
