import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface DashboardRouterProps {
  children?: React.ReactNode;
}

const DashboardRouter: React.FC<DashboardRouterProps> = ({ children }) => {
  const { user, dashboardInfo, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect if user is authenticated and has dashboard info
    if (isAuthenticated && user && dashboardInfo) {
      console.log('DashboardRouter: Routing to dashboard:', dashboardInfo.route);
      
      // Route to the appropriate dashboard based on user role
      switch (dashboardInfo.type) {
        case 'admin':
          navigate('/dashboard/admin');
          break;
        case 'pharmacist':
          navigate('/dashboard/pharmacist');
          break;
        case 'store-manager':
          navigate('/dashboard/store-manager');
          break;
        case 'cashier':
          navigate('/dashboard/cashier');
          break;
        case 'inventory-specialist':
          navigate('/dashboard/inventory-specialist');
          break;
        case 'data-analyst':
          navigate('/dashboard/data-analyst');
          break;
        case 'sales-representative':
          navigate('/dashboard/store-manager'); // Similar to store manager
          break;
        default:
          navigate('/dashboard'); // General dashboard
          break;
      }
    }
  }, [isAuthenticated, user, dashboardInfo, navigate]);

  // This component doesn't render anything, it just handles routing
  return null;
};

export default DashboardRouter;
