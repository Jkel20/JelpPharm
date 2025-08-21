import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Package, 
  ShoppingCart, 
  FileText, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  DollarSign,
  Activity
} from 'lucide-react';
import { dashboardAPI } from '../services/api';
import { mockDashboardData } from '../services/mockData';

// TypeScript interfaces for dashboard data
interface Alert {
  type: string;
  title: string;
  message: string;
  severity: 'danger' | 'warning' | 'info';
  drugs?: Array<{
    name: string;
    quantity: number;
    reorderLevel?: number;
    expiryDate?: Date;
  }>;
}

interface Activity {
  id: string;
  action: string;
  item: string;
  time: string;
  type: 'success' | 'warning' | 'info';
}

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon, color }) => (
  <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-200 hover:border-gray-300 transform hover:-translate-y-1">
    <div className="flex items-center">
      <div className={`p-4 rounded-xl ${color} shadow-lg`}>
        {icon}
      </div>
      <div className="ml-4 flex-1">
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
        {change && (
          <p className="text-sm text-green-600 flex items-center font-medium">
            <TrendingUp className="w-4 h-4 mr-1" />
            {change}
          </p>
        )}
      </div>
    </div>
  </div>
);

interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
}

const QuickAction: React.FC<QuickActionProps> = ({ title, description, icon, href }) => {
  const navigate = useNavigate();
  
  return (
    <div 
      className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 cursor-pointer border border-gray-200 hover:border-blue-300 transform hover:-translate-y-1 group"
      onClick={() => navigate(href)}
    >
      <div className="flex items-center">
        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <div className="ml-4 flex-1">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const { user, logout, dashboardInfo, hasPrivilege } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine dashboard type based on current route
  const getDashboardType = () => {
    const path = location.pathname;
    if (path.includes('/admin')) return 'admin';
    if (path.includes('/pharmacist')) return 'pharmacist';
    if (path.includes('/store-manager')) return 'store-manager';
    if (path.includes('/cashier')) return 'cashier';
    return 'general';
  };
  
  const dashboardType = getDashboardType();
  
  const [stats, setStats] = useState([
    {
      title: 'Total Drugs',
      value: '0',
      change: 'Loading...',
      icon: <Package className="w-6 h-6 text-white" />,
      color: 'bg-blue-500'
    },
    {
      title: 'Today\'s Sales',
      value: '₵0',
      change: 'Loading...',
      icon: <ShoppingCart className="w-6 h-6 text-white" />,
      color: 'bg-green-500'
    },
    {
      title: 'Active Prescriptions',
      value: '0',
      change: 'Loading...',
      icon: <FileText className="w-6 h-6 text-white" />,
      color: 'bg-purple-500'
    },
    {
      title: 'Registered Users',
      value: '0',
      change: 'Loading...',
      icon: <Users className="w-6 h-6 text-white" />,
      color: 'bg-orange-500'
    }
  ]);
  
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const quickActions = [
    {
      title: 'Inventory Management',
      description: 'Monitor stock levels and manage alerts',
      icon: <Package className="w-6 h-6" />,
      href: '/inventory'
    },
    {
      title: 'Sales Management',
      description: 'Process sales and generate receipts',
      icon: <ShoppingCart className="w-6 h-6" />,
      href: '/sales'
    },
    {
      title: 'Prescriptions',
      description: 'Manage patient prescriptions',
      icon: <FileText className="w-6 h-6" />,
      href: '/prescriptions'
    },
    {
      title: 'Reports & Analytics',
      description: 'View performance metrics and insights',
      icon: <Activity className="w-6 h-6" />,
      href: '/reports'
    }
  ];

  // Fetch dashboard data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch stats, alerts, and activities in parallel
        const [statsData, alertsData, activitiesData] = await Promise.all([
          dashboardAPI.getStats(),
          dashboardAPI.getAlerts(),
          dashboardAPI.getRecentActivities()
        ]);
        
        // Update stats
        setStats([
          {
            title: 'Total Drugs',
            value: statsData.totalDrugs.value,
            change: statsData.totalDrugs.change,
            icon: <Package className="w-6 h-6 text-white" />,
            color: 'bg-blue-500'
          },
          {
            title: 'Today\'s Sales',
            value: statsData.todaySales.value,
            change: statsData.todaySales.change,
            icon: <ShoppingCart className="w-6 h-6 text-white" />,
            color: 'bg-green-500'
          },
          {
            title: 'Active Prescriptions',
            value: statsData.activePrescriptions.value,
            change: statsData.activePrescriptions.change,
            icon: <FileText className="w-6 h-6 text-white" />,
            color: 'bg-purple-500'
          },
          {
            title: 'Registered Users',
            value: statsData.registeredUsers.value,
            change: statsData.registeredUsers.change,
            icon: <Users className="w-6 h-6 text-white" />,
            color: 'bg-orange-500'
          }
        ]);
        
        setAlerts(alertsData.alerts);
        setRecentActivities(activitiesData.activities);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Use mock data when API fails
        setStats([
          {
            title: 'Total Drugs',
            value: mockDashboardData.stats.totalDrugs.value.toString(),
            change: mockDashboardData.stats.totalDrugs.change,
            icon: <Package className="w-6 h-6 text-white" />,
            color: 'bg-blue-500'
          },
          {
            title: 'Today\'s Sales',
            value: mockDashboardData.stats.todaySales.value,
            change: mockDashboardData.stats.todaySales.change,
            icon: <ShoppingCart className="w-6 h-6 text-white" />,
            color: 'bg-green-500'
          },
          {
            title: 'Active Prescriptions',
            value: mockDashboardData.stats.activePrescriptions.value.toString(),
            change: mockDashboardData.stats.activePrescriptions.change,
            icon: <FileText className="w-6 h-6 text-white" />,
            color: 'bg-purple-500'
          },
          {
            title: 'Registered Users',
            value: mockDashboardData.stats.registeredUsers.value.toString(),
            change: mockDashboardData.stats.registeredUsers.change,
            icon: <Users className="w-6 h-6 text-white" />,
            color: 'bg-orange-500'
          }
        ]);
        
        setAlerts(mockDashboardData.alerts);
        setRecentActivities(mockDashboardData.activities);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // Get role-specific dashboard content with detailed descriptions, privileges, and restrictions
  const getRoleSpecificContent = () => {
    switch (dashboardType) {
      case 'admin':
        return {
          title: '🎯 Administrator Dashboard',
          subtitle: 'Full system access with all privileges',
          description: 'You have complete control over the pharmacy management system. Manage users, roles, privileges, system settings, and access all features.',
          roleBadge: 'SYSTEM_ADMIN',
          roleColor: 'bg-red-500',
          privileges: [
            'Full system access',
            'User management (create, edit, delete)',
            'Role and privilege administration',
            'System settings and configuration',
            'Database management',
            'All reports and analytics',
            'Complete audit logs'
          ],
          restrictions: 'None - Full access to all features',
          accessLevel: 'SYSTEM_ADMIN'
        };
      case 'pharmacist':
        return {
          title: '💊 Pharmacist Dashboard',
          subtitle: 'Pharmaceutical operations and patient care',
          description: 'Professional pharmacist with comprehensive medication and inventory management privileges. Manage prescriptions, dispense medications, manage inventory, create sales, and generate reports.',
          roleBadge: 'PHARMACEUTICAL_PROFESSIONAL',
          roleColor: 'bg-blue-500',
          privileges: [
            'Prescription management',
            'Inventory access and management',
            'Sales operations',
            'Patient safety monitoring',
            'Drug interaction checking',
            'Clinical decision support',
            'Basic reporting access'
          ],
          restrictions: 'Limited to pharmaceutical operations - No system administration access',
          accessLevel: 'PHARMACEUTICAL_PROFESSIONAL'
        };
      case 'store-manager':
        return {
          title: '🏪 Store Manager Dashboard',
          subtitle: 'Business operations and staff oversight',
          description: 'Store-level manager with oversight of operations, staff, and business performance. Manage inventory, sales, prescriptions, users within your store, and generate comprehensive reports.',
          roleBadge: 'BUSINESS_MANAGER',
          roleColor: 'bg-green-500',
          privileges: [
            'Business performance monitoring',
            'Staff management and oversight',
            'Inventory control and management',
            'Sales analytics and trends',
            'Financial reporting access',
            'Store operations oversight',
            'Performance analytics'
          ],
          restrictions: 'Limited to business operations - No system administration or user management access',
          accessLevel: 'BUSINESS_MANAGER'
        };
      case 'cashier':
        return {
          title: '💰 Cashier Dashboard',
          subtitle: 'Sales transactions and customer service',
          description: 'Front-line staff member responsible for sales transactions and customer service. Process sales, view inventory, handle prescriptions, and generate basic reports.',
          roleBadge: 'FRONT_LINE_STAFF',
          roleColor: 'bg-purple-500',
          privileges: [
            'Sales transaction processing',
            'Inventory checking for customers',
            'Prescription verification',
            'Daily sales summary',
            'Customer service tools',
            'Basic reporting access'
          ],
          restrictions: 'Limited to sales transactions - No management or administrative access',
          accessLevel: 'FRONT_LINE_STAFF'
        };
      default:
        return {
          title: '📊 General Dashboard',
          subtitle: 'Overview and key metrics',
          description: 'Welcome to your personalized dashboard. View key metrics and access features based on your role and privileges.',
          roleBadge: 'USER',
          roleColor: 'bg-gray-500',
          privileges: [
            'View assigned features',
            'Access role-specific content',
            'Basic system navigation'
          ],
          restrictions: 'Access limited to assigned privileges and role-based features',
          accessLevel: 'USER'
        };
    }
  };

  const roleContent = getRoleSpecificContent();

  // Get privilege-based dashboard stats
  const getPrivilegeBasedStats = () => {
    const privilegeStats = [];

    if (user && hasPrivilege('VIEW_INVENTORY')) {
      privilegeStats.push({
        title: 'Total Drugs',
        value: stats[0]?.value || '0',
        change: stats[0]?.change || 'Loading...',
        icon: <Package className="w-6 h-6 text-white" />,
        color: 'bg-blue-500'
      });
    }

    if (user && hasPrivilege('VIEW_SALES')) {
      privilegeStats.push({
        title: 'Today\'s Sales',
        value: stats[1]?.value || '₵0',
        change: stats[1]?.change || 'Loading...',
        icon: <ShoppingCart className="w-6 h-6 text-white" />,
        color: 'bg-green-500'
      });
    }

    if (user && hasPrivilege('VIEW_PRESCRIPTIONS')) {
      privilegeStats.push({
        title: 'Active Prescriptions',
        value: stats[2]?.value || '0',
        change: stats[2]?.change || 'Loading...',
        icon: <FileText className="w-6 h-6 text-white" />,
        color: 'bg-purple-500'
      });
    }

    if (user && hasPrivilege('VIEW_USERS')) {
      privilegeStats.push({
        title: 'Registered Users',
        value: stats[3]?.value || '0',
        change: stats[3]?.change || 'Loading...',
        icon: <Users className="w-6 h-6 text-white" />,
        color: 'bg-orange-500'
      });
    }

    return privilegeStats;
  };

  // Get privilege-based quick actions
  const getPrivilegeBasedQuickActions = () => {
    const privilegeActions = [];

    if (user && hasPrivilege('VIEW_INVENTORY')) {
      privilegeActions.push({
        title: 'Inventory Management',
        description: 'Monitor stock levels and manage alerts',
        icon: <Package className="w-6 h-6" />,
        href: '/inventory'
      });
    }

    if (user && hasPrivilege('VIEW_SALES')) {
      privilegeActions.push({
        title: 'Sales Management',
        description: 'Process sales and generate receipts',
        icon: <ShoppingCart className="w-6 h-6" />,
        href: '/sales'
      });
    }

    if (user && hasPrivilege('VIEW_PRESCRIPTIONS')) {
      privilegeActions.push({
        title: 'Prescriptions',
        description: 'Manage patient prescriptions',
        icon: <FileText className="w-6 h-6" />,
        href: '/prescriptions'
      });
    }

    if (user && hasPrivilege('VIEW_REPORTS')) {
      privilegeActions.push({
        title: 'Reports & Analytics',
        description: 'View performance metrics and insights',
        icon: <Activity className="w-6 h-6" />,
        href: '/reports'
      });
    }

    return privilegeActions;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{roleContent.title}</h1>
              <p className="text-lg text-gray-600 mt-1">{roleContent.subtitle}</p>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${roleContent.roleColor}`}>
                {roleContent.roleBadge}
              </span>
            </div>
          </div>
          
          <p className="text-gray-600 mt-3 max-w-3xl">{roleContent.description}</p>
          
          {/* Privileges and Restrictions */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-green-800 mb-2">Your Privileges</h3>
              <ul className="text-xs text-green-700 space-y-1">
                {roleContent.privileges.map((privilege, index) => (
                  <li key={index} className="flex items-center">
                    <svg className="w-3 h-3 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {privilege}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-orange-800 mb-2">Access Restrictions</h3>
              <p className="text-xs text-orange-700">{roleContent.restrictions}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {getPrivilegeBasedStats().map((stat, index) => (
            <div key={index} className={`${stat.color} rounded-xl p-6 text-white shadow-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <p className="text-xs opacity-75 mt-1">{stat.change}</p>
                </div>
                <div className="opacity-80">
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {getPrivilegeBasedQuickActions().map((action, index) => (
            <QuickAction
              key={index}
              title={action.title}
              description={action.description}
              icon={action.icon}
              href={action.href}
            />
          ))}
        </div>

        {/* Recent Activity and Alerts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
            {loading ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="animate-pulse space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                      <div className="flex-1">
                        <div className="h-3 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                        <div className="h-2 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : recentActivities.length > 0 ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        activity.type === 'success' ? 'bg-green-500' :
                        activity.type === 'warning' ? 'bg-yellow-500' :
                        'bg-blue-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">
                          {activity.action}
                        </p>
                        <p className="text-sm text-gray-500">
                          {activity.item} • {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  <Activity className="w-12 h-12 mx-auto" />
                </div>
                <p className="text-gray-500 text-sm">No recent activities</p>
              </div>
            )}
          </div>

          {/* Alerts Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Alerts & Notifications</h2>
            {loading ? (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ) : alerts.length > 0 ? (
              <div className="space-y-4">
                {alerts.map((alert, index) => (
                  <div 
                    key={index}
                    className={`border rounded-xl p-6 shadow-lg ${
                      alert.severity === 'danger' 
                        ? 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200' 
                        : alert.severity === 'warning'
                        ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200'
                        : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className={`p-2 rounded-lg mr-4 ${
                        alert.severity === 'danger' 
                          ? 'bg-red-100' 
                          : alert.severity === 'warning'
                          ? 'bg-yellow-100'
                          : 'bg-blue-100'
                      }`}>
                        <AlertTriangle className={`w-6 h-6 ${
                          alert.severity === 'danger' 
                            ? 'text-red-600' 
                            : alert.severity === 'warning'
                            ? 'text-yellow-600'
                            : 'text-blue-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className={`text-lg font-semibold mb-2 ${
                          alert.severity === 'danger' 
                            ? 'text-red-800' 
                            : alert.severity === 'warning'
                            ? 'text-yellow-800'
                            : 'text-blue-800'
                        }`}>
                          {alert.title}
                        </h3>
                        <p className={`text-sm leading-relaxed mb-3 ${
                          alert.severity === 'danger' 
                            ? 'text-red-700' 
                            : alert.severity === 'warning'
                            ? 'text-yellow-700'
                            : 'text-blue-700'
                        }`}>
                          {alert.message}
                        </p>
                        {alert.drugs && alert.drugs.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs font-medium text-gray-600 mb-2">Affected Medications:</p>
                            <div className="flex flex-wrap gap-2">
                              {alert.drugs.map((drug, drugIndex) => (
                                <span 
                                  key={drugIndex}
                                  className="px-2 py-1 bg-white/50 rounded text-xs font-medium text-gray-700"
                                >
                                  {drug.name} (Qty: {drug.quantity})
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        <button 
                          onClick={() => navigate('/inventory')}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                            alert.severity === 'danger' 
                              ? 'bg-red-600 hover:bg-red-700 text-white' 
                              : alert.severity === 'warning'
                              ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          View Inventory
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg mr-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-800">All Good!</h3>
                    <p className="text-sm text-green-700">No alerts at the moment. Your inventory is well-managed.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
